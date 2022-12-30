
//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, InsufficientFunds, BadRequest, RateLimitExceeded, InvalidNonce, NotSupported } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bybit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bybit',
            'name': 'Bybit',
            'countries': [ 'VG' ], // British Virgin Islands
            'version': 'v3',
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
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
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
                'fetchTransactions': undefined,
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
                '1y': 'Y',
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
                        'user/v3/private/frozen-sub-member': 10, // 5/s
                        'user/v3/private/query-sub-members': 5, // 10/s
                        'user/v3/private/query-api': 5, // 10/s
                        'asset/v3/private/transfer/transfer-coin/list/query': 0.84, // 60/s
                        'asset/v3/private/transfer/account-coin/balance/query': 0.84, // 60/s
                        'asset/v3/private/transfer/asset-info/query': 0.84, // 60/s
                        'asset/v3/public/deposit/allowed-deposit-list/query': 0.17, // 300/s
                        'asset/v3/private/deposit/record/query': 0.17, // 300/s
                        'asset/v3/private/withdraw/record/query': 0.17, // 300/s
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
                    '10027': PermissionDenied, // Trading Banned
                    '12201': BadRequest, // {"retCode":12201,"retMsg":"Invalid orderCategory parameter.","result":{},"retExtInfo":null,"time":1666699391220}
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
                    '130006': InvalidOrder, // {"ret_code":130006,"ret_msg":"The number of contracts exceeds maximum limit allowed: too large","ext_code":"","ext_info":"","result":null,"time_now":"1658397095.099030","rate_limit_status":99,"rate_limit_reset_ms":1658397095097,"rate_limit":100}
                    '130021': InsufficientFunds, // {"ret_code":130021,"ret_msg":"orderfix price failed for CannotAffordOrderCost.","ext_code":"","ext_info":"","result":null,"time_now":"1644588250.204878","rate_limit_status":98,"rate_limit_reset_ms":1644588250200,"rate_limit":100} |  {"ret_code":130021,"ret_msg":"oc_diff[1707966351], new_oc[1707966351] with ob[....]+AB[....]","ext_code":"","ext_info":"","result":null,"time_now":"1658395300.872766","rate_limit_status":99,"rate_limit_reset_ms":1658395300855,"rate_limit":100} caused issues/9149#issuecomment-1146559498
                    '130074': InvalidOrder, // {"ret_code":130074,"ret_msg":"expect Rising, but trigger_price[190000000] \u003c= current[211280000]??LastPrice","ext_code":"","ext_info":"","result":null,"time_now":"1655386638.067076","rate_limit_status":97,"rate_limit_reset_ms":1655386638065,"rate_limit":100}
                    '131001': InsufficientFunds, // {"retCode":131001,"retMsg":"the available balance is not sufficient to cover the handling fee","result":{},"retExtInfo":{},"time":1666892821245}
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
                    '3100116': BadRequest, // {"retCode":3100116,"retMsg":"Order quantity below the lower limit 0.01.","result":null,"retExtMap":{"key0":"0.01"}}
                    '3100198': BadRequest, // {"retCode":3100198,"retMsg":"orderLinkId can not be empty.","result":null,"retExtMap":{}}
                    '3200300': InsufficientFunds, // {"retCode":3200300,"retMsg":"Insufficient margin balance.","result":null,"retExtMap":{}}
                },
                'broad': {
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

    async isUnifiedMarginEnabled (params = {}) {
        //  The API key of user id must own one of permissions will be allowed to call following API endpoints.
        // SUB UID: "Account Transfer"
        // MASTER UID: "Account Transfer", "Subaccount Transfer", "Withdrawal"
        const enableUnifiedMargin = this.safeValue (this.options, 'enableUnifiedMargin');
        if (enableUnifiedMargin === undefined) {
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
            //             "unified":1
            //         },
            //         "retExtInfo":null,
            //         "time":1669735171649
            //     }
            //
            const result = this.safeValue (response, 'result', {});
            this.options['enableUnifiedMargin'] = this.safeInteger (result, 'unified') === 1;
        }
        return this.options['enableUnifiedMargin'];
    }

    async upgradeUnifiedAccount (params = {}) {
        const createUnifiedMarginAccount = this.safeValue (this.options, 'createUnifiedMarginAccount');
        if (!createUnifiedMarginAccount) {
            throw new NotSupported (this.id + ' upgradeUnifiedAccount() warning this method can only be called once, it is not reverseable and you will be stuck with a unified margin account, you also need at least 5000 USDT in your bybit account to do this. If you want to disable this warning set exchange.options["createUnifiedMarginAccount"]=true.');
        }
        return await this.privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount (params);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bybit#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
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
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        if (!this.checkRequiredCredentials (false)) {
            return undefined;
        }
        const response = await this.privateGetAssetV3PrivateCoinInfoQuery (params);
        //
        //    {
        //        "retCode": "0",
        //        "retMsg": "OK",
        //        "result": {
        //            "rows": [
        //                {
        //                    "name": "MATIC",
        //                    "coin": "MATIC",
        //                    "remainAmount": "1652850",
        //                    "chains": [
        //                        {
        //                            "chainType": "MATIC",
        //                            "confirmation": "128",
        //                            "withdrawFee": "0.1",
        //                            "depositMin": "0",
        //                            "withdrawMin": "0.1",
        //                            "chain": "MATIC",
        //                            "chainDeposit": "1",
        //                            "chainWithdraw": "1",
        //                            "minAccuracy": "8"
        //                        },
        //                        {
        //                            "chainType": "ERC20",
        //                            "confirmation": "12",
        //                            "withdrawFee": "10",
        //                            "depositMin": "0",
        //                            "withdrawMin": "20",
        //                            "chain": "ETH",
        //                            "chainDeposit": "1",
        //                            "chainWithdraw": "1",
        //                            "minAccuracy": "8"
        //                        },
        //                        {
        //                            "chainType": "BSC (BEP20)",
        //                            "confirmation": "15",
        //                            "withdrawFee": "1",
        //                            "depositMin": "0",
        //                            "withdrawMin": "1",
        //                            "chain": "BSC",
        //                            "chainDeposit": "1",
        //                            "chainWithdraw": "1",
        //                            "minAccuracy": "8"
        //                        }
        //                    ]
        //                },
        //            ]
        //        },
        //        "retExtInfo": null,
        //        "time": "1666728888775"
        //    }
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
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const networkCode = this.networkIdToCode (networkId);
                const precision = this.parseNumber (this.parsePrecision (this.safeString (chain, 'minAccuracy')));
                minPrecision = (minPrecision === undefined) ? precision : Math.min (minPrecision, precision);
                const depositAllowed = this.safeInteger (chain, 'chainDeposit') === 1;
                const withdrawAllowed = this.safeInteger (chain, 'chainWithdraw') === 1;
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'active': undefined,
                    'deposit': depositAllowed,
                    'withdraw': withdrawAllowed,
                    'fee': this.safeNumber (chain, 'withdrawFee'),
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'withdrawMin'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'depositMin'),
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
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': minPrecision,
                'limits': {
                    'amount': {
                        'min': undefined,
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
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        let promises = [
            this.fetchSpotMarkets (params),
            this.fetchDerivativesMarkets ({ 'category': 'linear' }),
            this.fetchDerivativesMarkets ({ 'category': 'inverse' }),
        ];
        promises = await Promise.all (promises);
        const spotMarkets = promises[0];
        const linearMarkets = promises[1];
        const inverseMarkets = promises[2];
        let markets = spotMarkets;
        markets = this.arrayConcat (markets, linearMarkets);
        return this.arrayConcat (markets, inverseMarkets);
    }

    async fetchSpotMarkets (params) {
        const response = await this.publicGetSpotV3PublicSymbols (params);
        //
        //    {
        //        "retCode": "0",
        //        "retMsg": "OK",
        //        "result": {
        //            "list": [
        //                {
        //                    "name": "BTCUSDT",
        //                    "alias": "BTCUSDT",
        //                    "baseCoin": "BTC",
        //                    "quoteCoin": "USDT",
        //                    "basePrecision": "0.000001",
        //                    "quotePrecision": "0.00000001",
        //                    "minTradeQty": "0.00004",
        //                    "minTradeAmt": "1",
        //                    "maxTradeQty": "46.13",
        //                    "maxTradeAmt": "938901",
        //                    "minPricePrecision": "0.01",
        //                    "category": "1",
        //                    "showStatus": "1",
        //                    "innovation": "0"
        //                },
        //            ]
        //        },
        //        "retExtMap": {},
        //        "retExtInfo": null,
        //        "time": "1666729450457"
        //    }
        //
        const responseResult = this.safeValue (response, 'result', {});
        const markets = this.safeValue (responseResult, 'list', []);
        const result = [];
        const takerFee = this.parseNumber ('0.001');
        const makerFee = this.parseNumber ('0.001');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'baseCoin');
            const quoteId = this.safeString (market, 'quoteCoin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = this.safeInteger (market, 'showStatus') === 1;
            const quotePrecision = this.safeNumber (market, 'quotePrecision');
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
                    'amount': this.safeNumber (market, 'basePrecision'),
                    'price': this.safeNumber (market, 'minPricePrecision', quotePrecision),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minTradeQty'),
                        'max': this.safeNumber (market, 'maxTradeQty'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minTradeAmt'),
                        'max': this.safeNumber (market, 'maxTradeAmt'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchDerivativesMarkets (params) {
        params['limit'] = 1000; // minimize number of requests
        const response = await this.publicGetDerivativesV3PublicInstrumentsInfo (params);
        const data = this.safeValue (response, 'result', {});
        let markets = this.safeValue (data, 'list', []);
        let paginationCursor = this.safeString (data, 'nextPageCursor');
        if (paginationCursor !== undefined) {
            while (paginationCursor !== undefined) {
                params['cursor'] = paginationCursor;
                const response = await this.publicGetDerivativesV3PublicInstrumentsInfo (params);
                const data = this.safeValue (response, 'result', {});
                const rawMarkets = this.safeValue (data, 'list', []);
                const rawMarketsLength = rawMarkets.length;
                if (rawMarketsLength === 0) {
                    break;
                }
                markets = this.arrayConcat (rawMarkets, markets);
                paginationCursor = this.safeString (data, 'nextPageCursor');
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
        //                     "launchTime": "1584230400000",
        //                     "deliveryTime": "0",
        //                     "deliveryFeeRate": "",
        //                     "priceScale": "2",
        //                     "leverageFilter": {
        //                         "minLeverage": "1",
        //                         "maxLeverage": "100",
        //                         "leverageStep": "0.01"
        //                     },
        //                     "priceFilter": {
        //                         "minPrice": "0.50",
        //                         "maxPrice": "999999.00",
        //                         "tickSize": "0.50"
        //                     },
        //                     "lotSizeFilter": {
        //                         "maxTradingQty": "420.000",
        //                         "minTradingQty": "0.001",
        //                         "qtyStep": "0.001"
        //                     }
        //                 }
        //             ],
        //             "nextPageCursor": ""
        //         },
        //         "retExtInfo": {},
        //         "time": 1667533491916
        //     }
        //
        // option response
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "nextPageCursor": "",
        //             "list": [
        //                 {
        //                     "category": "option",
        //                     "symbol": "BTC-30SEP22-35000-P",
        //                     "status": "ONLINE",
        //                     "baseCoin": "BTC",
        //                     "quoteCoin": "USD",
        //                     "settleCoin": "USDC",
        //                     "optionsType": "Put",
        //                     "launchTime": "1649923200000",
        //                     "deliveryTime": "1664524800000",
        //                     "deliveryFeeRate": "0.00015",
        //                     "priceFilter": {
        //                         "minPrice": "5",
        //                         "maxPrice": "10000000",
        //                         "tickSize": "5"
        //                     },
        //                     "lotSizeFilter": {
        //                         "maxOrderQty": "200",
        //                         "minOrderQty": "0.01",
        //                         "qtyStep": "0.01"
        //                     }
        //                 }
        //             ]
        //         },
        //         "time": 1657777124431
        //     }
        //
        // inverse response
        //
        //     {
        //         "symbol": "ETHUSDZ22",
        //         "contractType": "InverseFutures",
        //         "status": "Trading",
        //         "baseCoin": "ETH",
        //         "quoteCoin": "USD",
        //         "launchTime": "1654848000000",
        //         "deliveryTime": "1672387200000",
        //         "deliveryFeeRate": "",
        //         "priceScale": "2",
        //         "leverageFilter": {
        //             "minLeverage": "1",
        //             "maxLeverage": "50",
        //             "leverageStep": "0.01"
        //         },
        //         "priceFilter": {
        //             "minPrice": "0.05",
        //             "maxPrice": "99999.90",
        //             "tickSize": "0.05"
        //         },
        //         "lotSizeFilter": {
        //             "maxTradingQty": "1000000",
        //             "minTradingQty": "1",
        //             "qtyStep": "1"
        //         }
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
            let active = undefined;
            if (status !== undefined) {
                active = (status === 'Trading');
            }
            const swap = linearPerpetual || inversePerpetual;
            const future = inverseFutures;
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
                'taker': this.safeNumber (market, 'taker_fee'),
                'maker': this.safeNumber (market, 'maker_fee'),
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
        if ('s' in ticker) {
            return this.parseSpotTicker (ticker, market);
        } else {
            return this.parseContractTicker (ticker, market);
        }
    }

    parseSpotTicker (ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "t": "1666771860025",
        //         "s": "AAVEUSDT",
        //         "lp": "83.8",
        //         "h": "86.4",
        //         "l": "81",
        //         "o": "82.9",
        //         "bp": "83.5",
        //         "ap": "83.7",
        //         "v": "7433.527",
        //         "qv": "619835.8676"
        //     }
        // spot - bookticker
        //     {
        //         "s": "BTCUSDT",
        //         "bp": "19693.04",
        //         "bq": "0.913957",
        //         "ap": "19694.27",
        //         "aq": "0.705447",
        //         "t": 1661742216108
        //     }
        //
        const marketId = this.safeString (ticker, 's');
        const symbol = this.safeSymbol (marketId, market, undefined, 'spot');
        const timestamp = this.safeInteger (ticker, 't');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'bp'),
            'bidVolume': this.safeString (ticker, 'bq'),
            'ask': this.safeString (ticker, 'ap'),
            'askVolume': this.safeString (ticker, 'aq'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': this.safeString2 (ticker, 'lp', 'c'),
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'qv'),
            'info': ticker,
        }, market);
    }

    parseContractTicker (ticker, market = undefined) {
        //
        // linear usdt/ inverse swap and future
        //     {
        //         "symbol": "BTCUSDT",
        //         "bid_price": "39458",
        //         "ask_price": "39458.5",
        //         "last_price": "39458.00",
        //         "last_tick_direction": "ZeroMinusTick",
        //         "prev_price_24h": "39059.50",
        //         "price_24h_pcnt": "0.010202",
        //         "high_price_24h": "40058.50",
        //         "low_price_24h": "38575.50",
        //         "prev_price_1h": "39534.00",
        //         "price_1h_pcnt": "-0.001922",
        //         "mark_price": "39472.49",
        //         "index_price": "39469.81",
        //         "open_interest": "28343.61",
        //         "open_value": "0.00",
        //         "total_turnover": "85303326477.54",
        //         "turnover_24h": "4221589085.06",
        //         "total_volume": "30628792.45",
        //         "volume_24h": "107569.75",
        //         "funding_rate": "0.0001",
        //         "predicted_funding_rate": "0.0001",
        //         "next_funding_time": "2022-05-05T16:00:00Z",
        //         "countdown_hour": "7",
        //         "delivery_fee_rate": "",
        //         "predicted_delivery_price": "",
        //         "delivery_time": ""
        //     }
        //
        // usdc option/ swap
        //     {
        //          "symbol": "BTC-30SEP22-400000-C",
        //          "bid": "0",
        //          "bidIv": "0",
        //          "bidSize": "0",
        //          "ask": "15",
        //          "askIv": "1.1234",
        //          "askSize": "0.01",
        //          "lastPrice": "5",
        //          "openInterest": "0.03",
        //          "indexPrice": "39458.6",
        //          "markPrice": "0.51901394",
        //          "markPriceIv": "0.9047",
        //          "change24h": "0",
        //          "high24h": "0",
        //          "low24h": "0",
        //          "volume24h": "0",
        //          "turnover24h": "0",
        //          "totalVolume": "1",
        //          "totalTurnover": "4",
        //          "predictedDeliveryPrice": "0",
        //          "underlyingPrice": "40129.73",
        //          "delta": "0.00010589",
        //          "gamma": "0.00000002",
        //          "vega": "0.10670892",
        //          "theta": "-0.03262827"
        //      }
        //
        // Unified Margin
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
        const timestamp = this.safeInteger (ticker, 'time');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'contract');
        const last = this.safeString2 (ticker, 'last_price', 'lastPrice');
        const open = this.safeStringN (ticker, [ 'prev_price_24h', 'openPrice', 'prevPrice24h' ]);
        let percentage = this.safeStringN (ticker, [ 'price_24h_pcnt', 'change24h', 'price24hPcnt' ]);
        percentage = Precise.stringMul (percentage, '100');
        const quoteVolume = this.safeStringN (ticker, [ 'turnover_24h', 'turnover24h', 'quoteVolume' ]);
        const baseVolume = this.safeStringN (ticker, [ 'volume_24h', 'volume24h', 'volume' ]);
        const bid = this.safeStringN (ticker, [ 'bid_price', 'bid', 'bestBidPrice', 'bidPrice' ]);
        const ask = this.safeStringN (ticker, [ 'ask_price', 'ask', 'bestAskPrice', 'askPrice' ]);
        const high = this.safeStringN (ticker, [ 'high_price_24h', 'high24h', 'highPrice', 'highPrice24h' ]);
        const low = this.safeStringN (ticker, [ 'low_price_24h', 'low24h', 'lowPrice', 'lowPrice24h' ]);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': this.safeString (ticker, 'bidSize'),
            'ask': ask,
            'askVolume': this.safeString (ticker, 'askSize'),
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

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bybit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'publicGetSpotV3PublicQuoteTicker24hr';
        } else {
            method = 'publicGetDerivativesV3PublicTickers';
            if (market['option']) {
                request['category'] = 'option';
            } else if (market['linear']) {
                request['category'] = 'linear';
            } else if (market['inverse']) {
                request['category'] = 'inverse';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "t": "1666771860025",
        //             "s": "AAVEUSDT",
        //             "lp": "83.8",
        //             "h": "86.4",
        //             "l": "81",
        //             "o": "82.9",
        //             "bp": "83.5",
        //             "ap": "83.7",
        //             "v": "7433.527",
        //             "qv": "619835.8676"
        //         },
        //         "retExtInfo": {},
        //         "time": "1666771898218"
        //     }
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             {
        //                 symbol: 'BTCUSD',
        //                 bid_price: '7680',
        //                 ask_price: '7680.5',
        //                 last_price: '7680.00',
        //                 last_tick_direction: 'MinusTick',
        //                 prev_price_24h: '7870.50',
        //                 price_24h_pcnt: '-0.024204',
        //                 high_price_24h: '8035.00',
        //                 low_price_24h: '7671.00',
        //                 prev_price_1h: '7780.00',
        //                 price_1h_pcnt: '-0.012853',
        //                 mark_price: '7683.27',
        //                 index_price: '7682.74',
        //                 open_interest: 188829147,
        //                 open_value: '23670.06',
        //                 total_turnover: '25744224.90',
        //                 turnover_24h: '102997.83',
        //                 total_volume: 225448878806,
        //                 volume_24h: 809919408,
        //                 funding_rate: '0.0001',
        //                 predicted_funding_rate: '0.0001',
        //                 next_funding_time: '2020-03-12T00:00:00Z',
        //                 countdown_hour: 7
        //             }
        //         ],
        //         time_now: '1583948195.818255'
        //     }
        //  usdc ticker
        //     {
        //         "retCode": 0,
        //           "retMsg": "SUCCESS",
        //           "result": {
        //                  "symbol": "BTC-28JAN22-250000-C",
        //                    "bid": "0",
        //                    "bidIv": "0",
        //                    "bidSize": "0",
        //                    "ask": "0",
        //                    "askIv": "0",
        //                    "askSize": "0",
        //                    "lastPrice": "0",
        //                    "openInterest": "0",
        //                    "indexPrice": "56171.79000000",
        //                    "markPrice": "12.72021285",
        //                    "markPriceIv": "1.1701",
        //                    "change24h": "0",
        //                    "high24h": "0",
        //                    "low24h": "0",
        //                    "volume24h": "0",
        //                    "turnover24h": "0",
        //                    "totalVolume": "0",
        //                    "totalTurnover": "0",
        //                    "predictedDeliveryPrice": "0",
        //                    "underlyingPrice": "57039.61000000",
        //                    "delta": "0.00184380",
        //                    "gamma": "0.00000022",
        //                    "vega": "1.35132531",
        //                    "theta": "-1.33819821"
        //          }
        //     }
        //
        // unified margin
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
        //
        const result = this.safeValue (response, 'result', []);
        let rawTicker = undefined;
        if (Array.isArray (result)) {
            rawTicker = this.safeValue (result, 0);
        } else {
            const tickers = this.safeValue (result, 'list');
            if (tickers !== undefined) {
                rawTicker = this.safeValue (tickers, 0);
            } else {
                rawTicker = result;
            }
        }
        return this.parseTicker (rawTicker, market);
    }

    async fetchSpotTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetSpotV3PublicQuoteTicker24hr (params);
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":null,
        //         "result":[
        //             {
        //                 "time":1667198103209,
        //                 "symbol":"XDCUSDT",
        //                 "bestBidPrice":"0.03092",
        //                 "bestAskPrice":"0.03093",
        //                 "volume":"393311",
        //                 "quoteVolume":"12189.678747",
        //                 "lastPrice":"0.03092",
        //                 "highPrice":"0.03111",
        //                 "lowPrice":"0.0309",
        //                 "openPrice":"0.0309"
        //             }
        //         ],
        //         "ext_code": null,
        //         "ext_info": null
        //     }
        //
        const list = this.safeValue (response, 'result', []);
        const tickerList = this.safeValue (list, 'list');
        const tickers = {};
        for (let i = 0; i < tickerList.length; i++) {
            const ticker = this.parseTicker (tickerList[i]);
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchDerivativesTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request = {};
        const [ subType, query ] = this.handleSubTypeAndParams ('fetchTickers', undefined, params);
        if (subType === 'option') {
            // bybit requires a symbol when query tockers for options markets
            throw new NotSupported (this.id + ' fetchTickers() is not supported for option markets');
        } else {
            request['category'] = subType;
        }
        const response = await this.publicGetDerivativesV3PublicTickers (this.extend (request, query));
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
        if (!Array.isArray (tickerList)) {
            tickerList = this.safeValue (tickerList, 'list');
        }
        const tickers = {};
        for (let i = 0; i < tickerList.length; i++) {
            const ticker = this.parseTicker (tickerList[i]);
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://bybit-exchange.github.io/docs/futuresV2/linear/#t-latestsymbolinfo
         * @see https://bybit-exchange.github.io/docs/spot/v3/#t-spot_latestsymbolinfo
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchTickers', undefined, params);
        if (type === 'spot') {
            return await this.fetchSpotTickers (symbols, query);
        } else {
            return await this.fetchDerivativesTickers (symbols, query);
        }
    }

    parseOHLCV (ohlcv, market = undefined) {
        if ('t' in ohlcv) {
            return this.parseSpotOHLCV (ohlcv, market);
        } else {
            return this.parseContractOHLCV (ohlcv, market);
        }
    }

    parseSpotOHLCV (ohlcv, market = undefined) {
        //
        // spot
        //     {
        //         "t": "1666759020000",
        //         "s": "AAVEUSDT",
        //         "sn": "AAVEUSDT",
        //         "c": "83",
        //         "h": "83.4",
        //         "l": "82.9",
        //         "o": "83.4",
        //         "v": "149.368"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    parseContractOHLCV (ohlcv, market = undefined) {
        //
        // Unified Margin
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
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchSpotOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.seconds ();
        let sinceTimestamp = undefined;
        if (limit === undefined) {
            limit = 200; // default is 200 when requested with `since`
        }
        if (since === undefined) {
            sinceTimestamp = now - limit * duration;
        } else {
            sinceTimestamp = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 200, default 200
        }
        request['interval'] = timeframe;
        request['from'] = sinceTimestamp;
        const response = await this.publicGetSpotV3PublicQuoteKline (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //         "list": [
        //             {
        //             "t": 1659430380000,
        //             "s": "BTCUSDT",
        //             "sn": "BTCUSDT",
        //             "c": "21170.14",
        //             "h": "21170.14",
        //             "l": "21127.86",
        //             "o": "21127.86",
        //             "v": "0.907276"
        //             }
        //         ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1659430400353
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const ohlcvs = this.safeValue (result, 'list', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchDerivativesOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['option']) {
            throw new NotSupported (this.id + ' fetchOHLCV() is not supported for option markets');
        }
        const request = {
            'symbol': market['id'],
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.milliseconds ();
        if (limit === undefined) {
            limit = 200; // default is 200 when requested with `since`
        } else {
            request['limit'] = limit;
        }
        if (since === undefined) {
            since = now - (limit * duration * 1000);
        }
        // end is required parameter
        let end = this.safeInteger (params, 'end');
        if (end === undefined) {
            end = this.sum (since, limit * duration * 1000);
        }
        if (market['linear']) {
            request['category'] = 'linear';
        } else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        request['start'] = since;
        request['end'] = end;
        request['interval'] = this.timeframes[timeframe];
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        const methods = {
            'mark': 'publicGetDerivativesV3PublicMarkPriceKline',
            'index': 'publicGetDerivativesV3PublicIndexPriceKline',
        };
        const method = this.safeValue (methods, price, 'publicGetDerivativesV3PublicKline');
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg":"success",
        //         "result":{
        //             "category":"linear",
        //             "symbol":"BTCUSDT",
        //             "interval":"1",
        //             "list":[
        //                 [
        //                     "1621162800",
        //                     "49592.43",
        //                     "49644.91",
        //                     "49342.37",
        //                     "49349.42",
        //                     "1451.59",
        //                     "2.4343353100000003"
        //                 ]
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const ohlcvs = this.safeValue (result, 'list', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.fetchSpotOHLCV (symbol, timeframe, since, limit, params);
        } else {
            return await this.fetchDerivativesOHLCV (symbol, timeframe, since, limit, params);
        }
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name bybit#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const isUsdcSettled = market['settle'] === 'USDC';
        let method = undefined;
        if (isUsdcSettled) {
            method = 'privatePostPerpetualUsdcOpenapiPrivateV1PredictedFunding';
        } else {
            method = market['linear'] ? 'privateGetPrivateLinearFundingPredictedFunding' : 'privateGetV2PrivateFundingPredictedFunding';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // linear
        //     {
        //       "ret_code": 0,
        //       "ret_msg": "OK",
        //       "ext_code": "",
        //       "ext_info": "",
        //       "result": {
        //         "predicted_funding_rate": 0.0001,
        //         "predicted_funding_fee": 0.00231849
        //       },
        //       "time_now": "1658446366.304113",
        //       "rate_limit_status": 119,
        //       "rate_limit_reset_ms": 1658446366300,
        //       "rate_limit": 120
        //     }
        //
        // inverse
        //     {
        //       "ret_code": 0,
        //       "ret_msg": "OK",
        //       "ext_code": "",
        //       "ext_info": "",
        //       "result": {
        //         "predicted_funding_rate": -0.00001769,
        //         "predicted_funding_fee": 0
        //       },
        //       "time_now": "1658445512.778048",
        //       "rate_limit_status": 119,
        //       "rate_limit_reset_ms": 1658445512773,
        //       "rate_limit": 120
        //     }
        //
        // usdc
        //     {
        //       "result": {
        //         "predictedFundingRate": "0.0002213",
        //         "predictedFundingFee": "0"
        //       },
        //       "retCode": 0,
        //       "retMsg": "success"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const fundingRate = this.safeNumber2 (result, 'predicted_funding_rate', 'predictedFundingRate');
        const timestamp = this.safeTimestamp (response, 'time_now');
        return {
            'info': response,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': fundingRate,
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

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest funding rate
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol');
        }
        await this.loadMarkets ();
        const request = {};
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
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDerivativesV3PublicFundingHistoryFundingRate (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "fundingRate": "0.0001",
        //                     "fundingRateTimestamp": "1657728000000"
        //                 },
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "fundingRate": "0.0001",
        //                     "fundingRateTimestamp": "1657699200000"
        //                 }
        //             ]
        //         },
        //         "time": 1657782323371
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

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'index',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'mark',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchPremiumIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'premiumIndex',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
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
            'id': this.safeString (trade, 'id'),
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
        // public spot
        //
        //     {
        //         "price": "1162.51",
        //         "time": "1669192055405",
        //         "qty": "0.86013",
        //         "isBuyerMaker": "0"
        //     }
        //
        // private spot
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "id": "1295416074059212032",
        //         "orderId": "1295416073941829632",
        //         "tradeId": "2280000000026848229",
        //         "orderPrice": "1138.2",
        //         "orderQty": "0.05",
        //         "execFee": "0",
        //         "feeTokenId": "ETH",
        //         "creatTime": "1669161629850",
        //         "isBuyer": "0",
        //         "isMaker": "1",
        //         "matchOrderId": "1295416073505583360",
        //         "makerRebate": "0",
        //         "executionTime": "1669161629861"
        //     }
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
        //         "id": "1274785101965716992",
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
        market = this.safeMarket (marketId, market, undefined, 'contract');
        const symbol = market['symbol'];
        const amountString = this.safeStringN (trade, [ 'orderQty', 'size', 'execQty' ]);
        const priceString = this.safeStringN (trade, [ 'orderPrice', 'price', 'execPrice' ]);
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

    async fetchSpotTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // Default value is 60, max 60
        }
        const response = await this.publicGetSpotV3PublicQuoteTrades (this.extend (request, params));
        //
        // spot
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "price": "84",
        //                     "time": "1666768241806",
        //                     "qty": "0.122",
        //                     "isBuyerMaker": "1"
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": "1666770562956"
        //     }
        //
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             {
        //                 "price": "50005.12",
        //                 "time": 1620822657672,
        //                 "qty": "0.0001",
        //                 "isBuyerMaker": true
        //             },
        //         ],
        //         time_now: '1583954313.393362'
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDerivativesTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // Limit for data size per page, max size is 1000. Default as showing 500 pieces of data per page
        }
        if (market['option']) {
            request['category'] = 'option';
        } else if (market['linear']) {
            request['category'] = 'linear';
        } else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        const response = await this.publicGetDerivativesV3PublicRecentTrade (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "execId": "da66abbc-f358-5864-8d34-84ef7274d853",
        //                     "symbol": "BTCUSDT",
        //                     "price": "20802.50",
        //                     "size": "0.200",
        //                     "side": "Sell",
        //                     "time": "1657870316630"
        //                 }
        //             ]
        //         },
        //         "time": 1657870326247
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['type'] === 'spot') {
            return await this.fetchSpotTrades (symbol, since, limit, params);
        } else {
            return await this.fetchDerivativesTrades (symbol, since, limit, params);
        }
    }

    async fetchSpotOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetSpotV3PublicQuoteDepth (this.extend (request, params));
        //
        // spot
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "time": "1620886105740",
        //             "bids": [
        //                 [ "84", "7.323" ],
        //                 [ "83.9", "101.711" ],
        //             ],
        //             "asks": [
        //                 [ "84.1", "5.898" ],
        //                 [ "84.2", "350.31" ],
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": "1666771624950"
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const timestamp = this.safeInteger (result, 'time');
        return this.parseOrderBook (result, symbol, timestamp);
    }

    async fetchDerivativesOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (market['option']) {
            request['category'] = 'option';
        } else if (market['linear']) {
            request['category'] = 'linear';
        } else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        const response = await this.publicGetDerivativesV3PublicOrderBookL2 (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "s": "BTCUSDT",
        //             "b": [
        //                 [
        //                     "28806",
        //                     "0.06"
        //                 ],
        //                 [
        //                     "28807",
        //                     "5.005"
        //                 ]
        //             ],
        //             "a": [
        //                 [
        //                     "29004",
        //                     "0.001"
        //                 ],
        //                 [
        //                     "29012",
        //                     "0.017"
        //                 ]
        //             ],
        //             "ts": 1653638043149,
        //             "u": 4912426
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const timestamp = this.safeInteger (result, 'ts');
        return this.parseOrderBook (result, symbol, timestamp, 'b', 'a');
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.fetchSpotOrderBook (symbol, limit, params);
        } else {
            return await this.fetchDerivativesOrderBook (symbol, limit, params);
        }
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
        const result = {
            'info': response,
        };
        const responseResult = this.safeValue (response, 'result', {});
        const currencyList = this.safeValueN (responseResult, [ 'loanAccountList', 'list', 'coin', 'balances' ]);
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
                const account = this.account ();
                const loan = this.safeString (entry, 'loan');
                const interest = this.safeString (entry, 'interest');
                if ((loan !== undefined) && (interest !== undefined)) {
                    account['debt'] = Precise.stringAdd (loan, interest);
                }
                account['total'] = this.safeString2 (entry, 'total', 'walletBalance');
                account['free'] = this.safeStringN (entry, [ 'free', 'availableBalanceWithoutConvert', 'availableBalance' ]);
                account['used'] = this.safeString (entry, 'locked');
                const currencyId = this.safeStringN (entry, [ 'tokenId', 'coin', 'currencyCoin' ]);
                const code = this.safeCurrencyCode (currencyId);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchSpotBalance (params = {}) {
        await this.loadMarkets ();
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBalance', params);
        let method = 'privateGetSpotV3PrivateAccount';
        if (marginMode !== undefined) {
            method = 'privateGetSpotV3PrivateCrossMarginAccount';
        }
        const response = await this[method] (params);
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
        return this.parseBalance (response);
    }

    async fetchUnifiedMarginBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUnifiedV3PrivateAccountWalletBalance (params);
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
        return this.parseBalance (response);
    }

    async fetchDerivativesBalance (params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetContractV3PrivateAccountWalletBalance (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "coin": "BTC",
        //                     "equity": "0.00000002",
        //                     "walletBalance": "0.00000002",
        //                     "positionMargin": "0",
        //                     "availableBalance": "0.00000002",
        //                     "orderMargin": "0",
        //                     "occClosingFee": "0",
        //                     "occFundingFee": "0",
        //                     "unrealisedPnl": "0",
        //                     "cumRealisedPnl": "-0.00010941",
        //                     "givenCash": "0",
        //                     "serviceCash": "0"
        //                 },
        //                 {
        //                     "coin": "USDT",
        //                     "equity": "3662.81038535",
        //                     "walletBalance": "3662.81038535",
        //                     "positionMargin": "0",
        //                     "availableBalance": "3662.81038535",
        //                     "orderMargin": "0",
        //                     "occClosingFee": "0",
        //                     "occFundingFee": "0",
        //                     "unrealisedPnl": "0",
        //                     "cumRealisedPnl": "-36.01761465",
        //                     "givenCash": "0",
        //                     "serviceCash": "0"
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1669845599631
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchUSDCBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostOptionUsdcOpenapiPrivateV1QueryWalletBalance (params);
        //
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
        return this.parseBalance (response);
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
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        if (type === 'spot') {
            return await this.fetchSpotBalance (params);
        }
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        if (enableUnifiedMargin) {
            return await this.fetchUnifiedMarginBalance (params);
        } else {
            // linear/inverse future/swap
            return await this.fetchDerivativesBalance (params);
        }
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
            // v3 contract / unified margin
            'Created': 'open',
            'New': 'open',
            'Rejected': 'rejected', // order is triggered but failed upon being placed
            'PartiallyFilled': 'open',
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
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'contract');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (order, 'createdTime');
        const id = this.safeString (order, 'orderId');
        const type = this.safeStringLower (order, 'orderType');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'qty');
        const cost = this.safeString (order, 'cumExecValue');
        const filled = this.safeString (order, 'cumExecQty');
        const remaining = this.safeString (order, 'leavesQty');
        const lastTradeTimestamp = this.safeInteger (order, 'updateTime');
        const rawStatus = this.safeString (order, 'orderStatus');
        const status = this.parseOrderStatus (rawStatus);
        const side = this.safeStringLower (order, 'side');
        let fee = undefined;
        const isContract = this.safeValue (market, 'contract');
        if (isContract) {
            const feeCostString = this.safeString (order, 'cumExecFee');
            if (feeCostString !== undefined) {
                fee = {
                    'cost': feeCostString,
                    'currency': market['settle'],
                };
            }
        }
        let clientOrderId = this.safeString (order, 'orderLinkId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const rawTimeInForce = this.safeString (order, 'timeInForce');
        const timeInForce = this.parseTimeInForce (rawTimeInForce);
        const stopPrice = this.omitZero (this.safeString (order, 'triggerPrice'));
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
            'side': side,
            'price': price,
            'triggerPrice': stopPrice,
            'stopPrice': stopPrice,
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
        let amount = this.safeString (order, 'orderQty');
        if (amount === undefined || amount === '0') {
            if (market['spot'] && type === 'market' && side === 'buy') {
                amount = filled;
            }
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
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
            if (market === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument for ' + type + ' markets');
            }
            const request = {
                'orderId': id,
            };
            const result = await this.fetchOrders (symbol, undefined, undefined, this.extend (request, params));
            const length = result.length;
            if (length > 1) {
                throw new InvalidOrder (this.id + ' returned more than one order');
            }
            return this.safeValue (result, 0);
        }
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bybit#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        const isUSDCSettled = market['settle'] === 'USDC';
        if (market['spot']) {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        } else if (enableUnifiedMargin && !market['inverse']) {
            return await this.createUnifiedMarginOrder (symbol, type, side, amount, price, params);
        } else if (isUSDCSettled) {
            return await this.createUsdcOrder (symbol, type, side, amount, price, params);
        } else {
            return await this.createContractV3Order (symbol, type, side, amount, price, params);
        }
    }

    async createSpotOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
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
                }
            }
        }
        const upperCaseType = type.toUpperCase ();
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderType': upperCaseType, // limit, market or limit_maker
            'timeInForce': 'GTC', // FOK, IOC
            'orderQty': this.amountToPrecision (symbol, amount),
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
        };
        if ((upperCaseType === 'LIMIT') || (upperCaseType === 'LIMIT_MAKER')) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder requires a price argument for a ' + type + ' order');
            }
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const isPostOnly = this.isPostOnly (upperCaseType === 'MARKET', type === 'LIMIT_MAKER', params);
        if (isPostOnly) {
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
            params['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
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

    async createUnifiedMarginOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['linear'] && !market['option']) {
            throw new NotSupported (this.id + ' createOrder does not allow inverse market orders for ' + symbol + ' markets');
        }
        if (price === undefined && type === 'limit') {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for limit orders');
        }
        const lowerCaseType = type.toLowerCase ();
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
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice', triggerPrice);
        const isStopLossOrder = stopLossPrice !== undefined;
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        if (isStopLossOrder || isTakeProfitOrder) {
            request['triggerBy'] = 'LastPrice';
            const triggerAt = isStopLossOrder ? stopLossPrice : takeProfitPrice;
            const preciseTriggerPrice = this.priceToPrecision (symbol, triggerAt);
            request['triggerPrice'] = preciseTriggerPrice;
            const isBuy = side === 'buy';
            // logical xor
            const ascending = stopLossPrice ? !isBuy : isBuy;
            const delta = this.numberToString (market['precision']['price']);
            request['basePrice'] = ascending ? Precise.stringAdd (preciseTriggerPrice, delta) : Precise.stringSub (preciseTriggerPrice, delta);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        } else if (market['option']) {
            // mandatory field for options
            request['orderLinkId'] = this.uuid16 ();
        }
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId' ]);
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

    async createContractV3Order (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if ((price === undefined) && (type === 'limit')) {
            throw new ArgumentsRequired (this.id + ' createContractV3Order requires a price argument for limit orders');
        }
        const lowerCaseType = type.toLowerCase ();
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
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice', triggerPrice);
        const isStopLossOrder = stopLossPrice !== undefined;
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        if (isStopLossOrder || isTakeProfitOrder) {
            const triggerAt = isStopLossOrder ? stopLossPrice : takeProfitPrice;
            const preciseTriggerPrice = this.priceToPrecision (symbol, triggerAt);
            const isBuy = side === 'buy';
            // logical xor
            const ascending = stopLossPrice ? !isBuy : isBuy;
            request['triggerDirection'] = ascending ? 2 : 1;
            request['triggerBy'] = 'LastPrice';
            request['triggerPrice'] = this.priceToPrecision (symbol, preciseTriggerPrice);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        } else if (market['option']) {
            // mandatory field for options
            request['orderLinkId'] = this.uuid16 ();
        }
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId' ]);
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

    async createUsdcOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type === 'market') {
            throw new NotSupported (this.id + 'createOrder does not allow market orders for ' + symbol + ' markets');
        }
        if (price === undefined && type === 'limit') {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for limit orders');
        }
        const lowerCaseType = type.toLowerCase ();
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
        if (isLimit !== undefined) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const exchangeSpecificParam = this.safeString (params, 'time_in_force');
        const timeInForce = this.safeStringLower (params, 'timeInForce');
        const postOnly = this.isPostOnly (isMarket, exchangeSpecificParam === 'PostOnly', params);
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
            const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
            const stopLossPrice = this.safeValue (params, 'stopLossPrice', triggerPrice);
            const isStopLossOrder = stopLossPrice !== undefined;
            const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
            const isTakeProfitOrder = takeProfitPrice !== undefined;
            const isStopOrder = isStopLossOrder || isTakeProfitOrder;
            if (isStopOrder) {
                request['orderFilter'] = 'StopOrder';
                request['trigger_by'] = 'LastPrice';
                const stopPx = isStopLossOrder ? stopLossPrice : takeProfitPrice;
                const preciseStopPrice = this.priceToPrecision (symbol, stopPx);
                request['triggerPrice'] = preciseStopPrice;
                const delta = this.numberToString (market['precision']['price']);
                request['basePrice'] = isStopLossOrder ? Precise.stringSub (preciseStopPrice, delta) : Precise.stringAdd (preciseStopPrice, delta);
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
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId' ]);
        const method = market['option'] ? 'privatePostOptionUsdcOpenapiPrivateV1PlaceOrder' : 'privatePostPerpetualUsdcOpenapiPrivateV1PlaceOrder';
        const response = await this[method] (this.extend (request, params));
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

    async editUnifiedMarginOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['linear'] && !market['option']) {
            throw new NotSupported (this.id + ' editOrder does not allow inverse market orders for ' + symbol + ' markets');
        }
        if (price === undefined && type === 'limit') {
            throw new ArgumentsRequired (this.id + ' editOrder requires a price argument for limit orders');
        }
        const lowerCaseType = type.toLowerCase ();
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
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const isStopLossOrder = stopLossPrice !== undefined;
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        if (isStopLossOrder) {
            request['stopLoss'] = this.priceToPrecision (symbol, stopLossPrice);
        }
        if (isTakeProfitOrder) {
            request['takeProfit'] = this.priceToPrecision (symbol, takeProfitPrice);
        }
        if (triggerPrice !== undefined) {
            request['triggerBy'] = 'LastPrice';
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        }
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId' ]);
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

    async editContractV3Order (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
            'qty': this.amountToPrecision (symbol, amount),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const isStopLossOrder = stopLossPrice !== undefined;
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        if (isStopLossOrder) {
            request['stopLoss'] = this.priceToPrecision (symbol, stopLossPrice);
        }
        if (isTakeProfitOrder) {
            request['takeProfit'] = this.priceToPrecision (symbol, takeProfitPrice);
        }
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        }
        params = this.omit (params, [ 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
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

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        if (market['spot']) {
            throw new NotSupported (this.id + ' editOrder() does not support spot markets');
        } else if (enableUnifiedMargin && !market['inverse']) {
            return await this.editUnifiedMarginOrder (id, symbol, type, side, amount, price, params);
        }
        return await this.editContractV3Order (id, symbol, type, side, amount, price, params);
    }

    async cancelSpotOrder (id, symbol = undefined, params = {}) {
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

    async cancelUnifiedMarginOrder (id, symbol = undefined, params = {}) {
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

    async cancelUSDCOrder (id, symbol = undefined, params = {}) {
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

    async cancelDerivativesOrder (id, symbol = undefined, params = {}) {
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

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bybit#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        const isUsdcSettled = market['settle'] === 'USDC';
        if (market['spot']) {
            return await this.cancelSpotOrder (id, symbol, params);
        } else if (enableUnifiedMargin && !market['inverse']) {
            return await this.cancelUnifiedMarginOrder (id, symbol, params);
        } else if (isUsdcSettled) {
            return await this.cancelUSDCOrder (id, symbol, params);
        }
        return await this.cancelDerivativesOrder (id, symbol, params);
    }

    async cancelAllSpotOrders (symbol = undefined, params = {}) {
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

    async cancelAllUnifiedMarginOrders (symbol = undefined, params = {}) {
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
        [ subType, params ] = this.handleSubTypeAndParams ('cancelAllOrders', market, params);
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

    async cancelAllUSDCOrders (symbol = undefined, params = {}) {
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

    async cancelAllDerivativesOrders (symbol = undefined, params = {}) {
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

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bybit#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
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
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        if (type === 'spot') {
            return await this.cancelAllSpotOrders (symbol, query);
        } else if (enableUnifiedMargin && !isInverse) {
            return await this.cancelAllUnifiedMarginOrders (symbol, query);
        } else if (isUsdcSettled) {
            return await this.cancelAllUSDCOrders (symbol, query);
        } else {
            return await this.cancelAllDerivativesOrders (symbol, query);
        }
    }

    async fetchUnifiedMarginOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'category': string, Type of derivatives product: linear or option.
            // 'baseCoin': string, Base coin. When category=option. If not passed, BTC by default; when category=linear, if BTC passed, BTCPERP & BTCUSDT returned.
            // 'orderId': string, Order ID
            // 'orderLinkId': string, Unique user-set order ID
            // 'orderStatus': string, Query list of orders in designated states. If this parameter is not passed, the orders in all states shall be enquired by default. This parameter supports multi-state inquiry. States should be separated with English commas.
            // 'orderFilter': string, Conditional order or active order
            // 'direction': string, prev: prev, next: next.
            // 'limit': number, Data quantity per page: Max data value per page is 50, and default value at 20.
            // 'cursor': string, API pass-through. accountType + category + cursor +. If inconsistent, the following should be returned: The account type does not match the service inquiry.
        };
        let market = undefined;
        if (symbol === undefined) {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchUnifiedMarginOrders', market, params);
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

    async fetchDerivativesOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let settle = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'order_id': 'string'
            // 'order_link_id': 'string', // unique client order id, max 36 characters
            // 'symbol': market['id'], // default BTCUSD
            // 'order': 'desc', // asc
            // 'page': 1,
            // 'limit': 20, // max 50
            // 'order_status': 'Created,New'
            // conditional orders ---------------------------------------------
            // 'stop_order_id': 'string',
            // 'stop_order_status': 'Untriggered',
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
            request['symbol'] = market['id'];
        }
        [ settle, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'settle', settle);
        if (settle !== undefined) {
            request['settleCoin'] = settle;
        }
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            request['orderFilter'] = 'StopOrder';
        }
        const response = await this.privateGetContractV3PrivateOrderList (this.extend (request, params));
        //
        // contract v3
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "symbol": "XRPUSDT",
        //                     "side": "Buy",
        //                     "orderType": "Market",
        //                     "price": "0.3431",
        //                     "qty": "65",
        //                     "reduceOnly": true,
        //                     "timeInForce": "ImmediateOrCancel",
        //                     "orderStatus": "Filled",
        //                     "leavesQty": "0",
        //                     "leavesValue": "0",
        //                     "cumExecQty": "65",
        //                     "cumExecValue": "21.3265",
        //                     "cumExecFee": "0.0127959",
        //                     "lastPriceOnCreated": "0.0000",
        //                     "rejectReason": "EC_NoError",
        //                     "orderLinkId": "",
        //                     "createdTime": "1657526321499",
        //                     "updatedTime": "1657526321504",
        //                     "orderId": "ac0a8134-acb3-4ee1-a2d4-41891c9c46d7",
        //                     "stopOrderType": "UNKNOWN",
        //                     "takeProfit": "0.0000",
        //                     "stopLoss": "0.0000",
        //                     "tpTriggerBy": "UNKNOWN",
        //                     "slTriggerBy": "UNKNOWN",
        //                     "triggerPrice": "0.0000",
        //                     "closeOnTrigger": true,
        //                     "triggerDirection": 0,
        //                     "positionIdx": 2
        //             ],
        //             "nextPageCursor": "K0crQkZRL0MyQVpiN0tVSDFTS0RlMk9DemNCWHZaRHp3aFZ4Y1Yza2MyWT0="
        //         },
        //         "retExtInfo": {},
        //         "time": 1658899014975
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue2 (result, 'data', 'list', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
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
        [ subType, params ] = this.handleSubTypeAndParams ('fetchOpenOrders', market, params);
        const isInverse = subType === 'inverse';
        const isUsdcSettled = settle === 'USDC';
        const isLinearSettle = isUsdcSettled || (settle === 'USDT');
        if (isInverse && isLinearSettle) {
            throw new ArgumentsRequired (this.id + ' fetchOrders with inverse subType requires settle to not be USDT or USDC');
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        if (type === 'spot') {
            throw new NotSupported (this.id + ' fetchOrders() does not support ' + market['type'] + ' markets, use exchange.fetchOpenOrders () and exchange.fetchClosedOrders () instead');
        } else if (enableUnifiedMargin && !isInverse) {
            return await this.fetchUnifiedMarginOrders (symbol, since, limit, query);
        } else {
            return await this.fetchDerivativesOrders (symbol, since, limit, query);
        }
    }

    async fetchSpotClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        if (type === 'spot') {
            return await this.fetchSpotClosedOrders (symbol, since, limit, params);
        }
        const request = {};
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        if (enableUnifiedMargin) {
            request['orderStatus'] = 'Canceled';
        } else {
            request['orderStatus'] = [ 'Filled', 'Canceled' ];
        }
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchSpotOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = symbol;
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

    async fetchUnifiedMarginOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol === undefined) {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchUnifiedMarginOrders', market, params);
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

    async fetchDerivativesOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            request['orderFilter'] = 'StopOrder';
        }
        const response = await this.privateGetContractV3PrivateOrderUnfilledOrders (this.extend (request, params));
        //
        // contract v3
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "symbol": "XRPUSDT",
        //                     "orderId": "db8b74b3-72d3-4264-bf3f-52d39b41956e",
        //                     "side": "Sell",
        //                     "orderType": "Limit",
        //                     "stopOrderType": "Stop",
        //                     "price": "0.4000",
        //                     "qty": "15",
        //                     "timeInForce": "GoodTillCancel",
        //                     "orderStatus": "UnTriggered",
        //                     "triggerPrice": "0.1000",
        //                     "orderLinkId": "x002",
        //                     "createdTime": "1658901865082",
        //                     "updatedTime": "1658902610748",
        //                     "takeProfit": "0.2000",
        //                     "stopLoss": "1.6000",
        //                     "tpTriggerBy": "UNKNOWN",
        //                     "slTriggerBy": "UNKNOWN",
        //                     "triggerBy": "MarkPrice",
        //                     "reduceOnly": false,
        //                     "leavesQty": "15",
        //                     "leavesValue": "6",
        //                     "cumExecQty": "0",
        //                     "cumExecValue": "0",
        //                     "cumExecFee": "0",
        //                     "triggerDirection": 2
        //                 }
        //             ],
        //             "nextPageCursor": ""
        //         },
        //         "retExtInfo": {},
        //         "time": 1658902847238
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchUSDCOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
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
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        if (type === 'spot') {
            return await this.fetchSpotOpenOrders (symbol, since, limit, query);
        } else if (enableUnifiedMargin && !isInverse) {
            return await this.fetchUnifiedMarginOpenOrders (symbol, since, limit, query);
        } else if (isUsdcSettled) {
            return await this.fetchUSDCOpenOrders (symbol, since, limit, query);
        } else {
            return await this.fetchDerivativesOpenOrders (symbol, since, limit, query);
        }
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        const request = {
            'orderId': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchMySpotTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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

    async fetchMyUnifiedMarginTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
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
        [ subType, params ] = this.handleSubTypeAndParams ('fetchMyTrades', market, params);
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
        //                     "orderLinkId": "188889689-yuanzhen-558998998898",
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

    async fetchMyContractTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyContractTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'order_id': 'f185806b-b801-40ff-adec-52289370ed62', // if not provided will return user's trading records
            // 'start_time': parseInt (since / 1000),
            // 'page': 1,
            // 'limit' 20, // max 50
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 50
        }
        const response = await this.privateGetContractV3PrivateExecutionList (this.extend (request, params));
        //
        // contract v3
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "symbol": "BITUSDT",
        //                     "execFee": "0.001356",
        //                     "execId": "499e1a2a-c664-55db-bbf0-78ad31b7b033",
        //                     "execPrice": "0.452",
        //                     "execQty": "5.0",
        //                     "execType": "Trade",
        //                     "execValue": "2.26",
        //                     "feeRate": "0.0006",
        //                     "lastLiquidityInd": "RemovedLiquidity",
        //                     "leavesQty": "0.0",
        //                     "orderId": "1d40db82-b1f6-4340-9190-650eeddd440b",
        //                     "orderLinkId": "",
        //                     "orderPrice": "0.430",
        //                     "orderQty": "5.0",
        //                     "orderType": "Market",
        //                     "stopOrderType": "UNKNOWN",
        //                     "side": "Sell",
        //                     "execTime": "1657269236943",
        //                     "closedSize": "5.0"
        //                 },
        //                 {
        //                     "symbol": "BITUSDT",
        //                     "execFee": "0.004068",
        //                     "execId": "ed090e6a-afc0-5cb5-b51d-039592a44ec5",
        //                     "execPrice": "0.452",
        //                     "execQty": "15.0",
        //                     "execType": "Trade",
        //                     "execValue": "6.78",
        //                     "feeRate": "0.0006",
        //                     "lastLiquidityInd": "RemovedLiquidity",
        //                     "leavesQty": "0.0",
        //                     "orderId": "d34d40a1-2475-4552-9e54-347a27282ec0",
        //                     "orderLinkId": "",
        //                     "orderPrice": "0.429",
        //                     "orderQty": "15.0",
        //                     "orderType": "Market",
        //                     "stopOrderType": "UNKNOWN",
        //                     "side": "Sell",
        //                     "execTime": "1657268340170",
        //                     "closedSize": "15.0"
        //                 }
        //             ],
        //             "nextPageCursor": ""
        //         },
        //         "retExtInfo": null,
        //         "time": 1658911518442
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyUsdcTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
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
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        if (type === 'spot') {
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

    async fetchDepositAddressesByNetwork (code, params = {}) {
        /**
         * @method
         * @name bybit#fetchDepositAddressesByNetwork
         * @description fetch a dictionary of addresses for a currency, indexed by network
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure} indexed by the network
         */
        await this.loadMarkets ();
        let currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetAssetV3PrivateDepositAddressQuery (this.extend (request, params));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "success",
        //         "result": {
        //             "coin": "USDT",
        //             "chains": [
        //                 {
        //                     "chainType": "ERC20",
        //                     "addressDeposit": "0xf56297c6717c1d1c42c30324468ed50a9b7402ee",
        //                     "tagDeposit": "",
        //                     "chain": "ETH"
        //                 },
        //                 {
        //                     "chainType": "TRC20",
        //                     "addressDeposit": "TC6TAC5WSVCCiaD3nWZXyW62ZKKPwm55a",
        //                     "tagDeposit": "",
        //                     "chain": "TRX"
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": "1666882145079"
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const chains = this.safeValue (result, 'chains', []);
        const coin = this.safeString (result, 'coin');
        currency = this.currency (coin);
        const parsed = this.parseDepositAddresses (chains, [ code ], false, {
            'currency': currency['id'],
        });
        return this.indexBy (parsed, 'network');
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bybit#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
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
        const response = await this.privateGetAssetV3PrivateDepositAddressQuery (this.extend (request, query));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "success",
        //         "result": {
        //             "coin": "USDT",
        //             "chains": [
        //                 {
        //                     "chainType": "TRC20",
        //                     "addressDeposit": "TC6NCAC5WSVCCiaD3kWZXyW91ZKKhLm53b",
        //                     "tagDeposit": "",
        //                     "chain": "TRX"
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": "1666895654316"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const chains = this.safeValue (result, 'chains', []);
        const chainsIndexedById = this.indexBy (chains, 'chain');
        const selectedNetworkId = this.selectNetworkIdFromRawNetworks (code, networkCode, chainsIndexedById);
        const addressObject = this.safeValue (chainsIndexedById, selectedNetworkId, {});
        return this.parseDepositAddress (addressObject, currency);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'coin': currency['id'],
            // 'currency': currency['id'], // alias
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (till),
            'wallet_fund_type': 'Deposit', // Deposit, Withdraw, RealisedPNL, Commission, Refund, Prize, ExchangeOrderWithdraw, ExchangeOrderDeposit
            // 'page': 1,
            // 'limit': 20, // max 50
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
        // Currently only works for deposits prior to 2021-07-15
        // will be updated soon
        const response = await this.privateGetAssetV3PrivateDepositRecordQuery (this.extend (request, params));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "success",
        //         "result": {
        //             "rows": [
        //                 {
        //                     "coin": "USDT",
        //                     "chain": "TRX",
        //                     "amount": "44",
        //                     "txID": "0b038ea12fa1575e2d66693db3c346b700d4b28347afc39f80321cf089acc960",
        //                     "status": "3",
        //                     "toAddress": "TC6NCAC5WSVCCiaD3kWZXyW91ZKKhLm53b",
        //                     "tag": "",
        //                     "depositFee": "",
        //                     "successAt": "1665142507000",
        //                     "confirmations": "100",
        //                     "txIndex": "0",
        //                     "blockHash": "0000000002ac3b1064aee94bca1bd0b58c4c09c65813b084b87a2063d961129e"
        //                 },
        //             ],
        //             "nextPageCursor": "eyJtaW5JRCI6MTE5OTUyNjgsIm1heElEIjoxMjI2OTA2OH0="
        //         },
        //         "retExtInfo": {},
        //         "time": "1666883499086"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'rows', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'coin': currency['id'],
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (till),
            // 'status': 'Pending', // ToBeConfirmed, UnderReview, Pending, Success, CancelByUser, Reject, Expire
            // 'page': 1,
            // 'limit': 20, // max 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = this.yyyymmdd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAssetV3PrivateWithdrawRecordQuery (this.extend (request, params));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "success",
        //         "result": {
        //             "rows": [
        //                 {
        //                     "coin": "USDT",
        //                     "chain": "TRX",
        //                     "amount": "12.34",
        //                     "txID": "de5ea0a2f2e59dc9a714837dd3ddc6d5e151b56ec5d786d351c4f52336f80d3c",
        //                     "status": "success",
        //                     "toAddress": "TQdmFKUoe1Lk2iwZuwRJEHJreTUBoN3BAw",
        //                     "tag": "",
        //                     "withdrawFee": "0.5",
        //                     "createTime": "1665144183000",
        //                     "updateTime": "1665144256000",
        //                     "withdrawId": "8839035"
        //                 },
        //             ],
        //             "nextPageCursor": "eyJtaW5JRCI6ODczMzUyMiwibWF4SUQiOjg4MzkwMzV9"
        //         },
        //         "retExtInfo": {},
        //         "time": "1666887679223"
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

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
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
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_date'] = this.yyyymmdd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV2PrivateWalletFundRecords (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
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
        const currencyId = this.safeString (item, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeString (item, 'amount');
        const after = this.safeString (item, 'wallet_balance');
        const direction = Precise.stringLt (amount, '0') ? 'out' : 'in';
        let before = undefined;
        if (after !== undefined && amount !== undefined) {
            const difference = (direction === 'out') ? amount : Precise.stringNeg (amount);
            before = Precise.stringAdd (after, difference);
        }
        const timestamp = this.parse8601 (this.safeString (item, 'exec_time'));
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
            'fee': undefined,
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
        };
        return this.safeString (types, type, type);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bybit#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
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
        const response = await this.privatePostAssetV3PrivateWithdrawCreate (this.extend (request, query));
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

    async fetchPosition (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPosition() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        const isUsdcSettled = market['settle'] === 'USDC';
        if (enableUnifiedMargin) {
            method = 'privateGetUnifiedV3PrivatePositionList';
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
            method = 'privateGetContractV3PrivatePositionList';
        }
        const response = await this[method] (this.extend (request, params));
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
        const position = this.parsePosition (first);
        return this.extend (position, {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    async fetchUnifiedMarginPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let type = undefined;
        if (Array.isArray (symbols)) {
            if (symbols.length > 1) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() does not accept an array with more than one symbol');
            }
        } else if (symbols !== undefined) {
            symbols = [ symbols ];
        }
        symbols = this.marketSymbols (symbols);
        // market undefined
        [ type, params ] = this.handleMarketTypeAndParams ('fetchPositions', undefined, params);
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchPositions', undefined, params);
        request['category'] = subType;
        if (type === 'option') {
            request['category'] = 'option';
        }
        const response = await this.privateGetUnifiedV3PrivatePositionList (this.extend (request, params));
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

    async fetchUSDCPositions (symbols = undefined, params = {}) {
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

    async fetchDerivativesPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (Array.isArray (symbols)) {
            if (symbols.length > 1) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() does not accept an array with more than one symbol');
            }
            request['symbol'] = this.marketId (symbols[0]);
        } else if (symbols !== undefined) {
            request['symbol'] = this.marketId (symbols);
        } else {
            request['dataFilter'] = 'valid';
        }
        let settle = undefined;
        [ settle, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'settle', settle);
        if (settle !== undefined) {
            request['settleCoin'] = settle;
        }
        const response = await this.privateGetContractV3PrivatePositionList (this.extend (request, params));
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
        const positions = this.safeValue (result, 'list', []);
        return this.parsePositions (positions, symbols, params);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        if (Array.isArray (symbols)) {
            if (symbols.length > 1) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() does not accept an array with more than one symbol');
            }
        } else if (symbols !== undefined) {
            symbols = [ symbols ];
        }
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        let settle = this.safeString (params, 'settleCoin');
        if (settle === undefined) {
            [ settle, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'settle', settle);
        }
        const isUsdcSettled = settle === 'USDC';
        const [ subType, query ] = this.handleSubTypeAndParams ('fetchPositions', undefined, params);
        const isInverse = subType === 'inverse';
        const isLinearSettle = isUsdcSettled || (settle === 'USDT');
        if (isInverse && isLinearSettle) {
            throw new ArgumentsRequired (this.id + ' fetchPositions with inverse subType requires settle to not be USDT or USDC');
        }
        if (enableUnifiedMargin && !isInverse) {
            return await this.fetchUnifiedMarginPositions (symbols, query);
        } else if (isUsdcSettled) {
            return await this.fetchUSDCPositions (symbols, query);
        } else {
            return await this.fetchDerivativesPositions (symbols, query);
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
        const contract = this.safeString (position, 'symbol');
        market = this.safeMarket (contract, market, undefined, 'contract');
        const size = Precise.stringAbs (this.safeString (position, 'size'));
        let side = this.safeString (position, 'side');
        side = (side === 'Buy') ? 'long' : 'short';
        const notional = this.safeString (position, 'positionValue');
        const unrealisedPnl = this.omitZero (this.safeString (position, 'unrealisedPnl'));
        let initialMarginString = this.safeString (position, 'positionIM');
        let maintenanceMarginString = this.safeString (position, 'positionMM');
        let timestamp = this.parse8601 (this.safeString (position, 'updated_at'));
        if (timestamp === undefined) {
            timestamp = this.safeInteger (position, 'updatedAt');
        }
        // default to cross of USDC margined positions
        const autoAddMargin = this.safeInteger (position, 'autoAddMargin', 1);
        const marginMode = autoAddMargin ? 'cross' : 'isolated';
        let collateralString = this.safeString (position, 'positionBalance');
        const entryPrice = this.omitZero (this.safeString (position, 'entryPrice'));
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
                    initialMarginString = Precise.stringDiv (Precise.stringMul (size, entryPrice), leverage);
                } else {
                    // Contracts * (1 / Entry price - 1 / Bust price) = Collateral
                    // Contracts * (1 / Entry price - 1 / Liq price) = Collateral - Maintenance Margin
                    // Maintenance Margin = Contracts * (1 / Liq price - 1 / Bust price)
                    // Maintenance Margin = Contracts * (Bust price - Liq price) / (Liq price x Bust price)
                    const difference = Precise.stringAbs (Precise.stringSub (bustPrice, liquidationPrice));
                    const multiply = Precise.stringMul (bustPrice, liquidationPrice);
                    maintenanceMarginString = Precise.stringDiv (Precise.stringMul (size, difference), multiply);
                    // Initial Margin = Leverage x Contracts / EntryPrice
                    initialMarginString = Precise.stringDiv (size, Precise.stringMul (entryPrice, leverage));
                }
            }
        }
        const maintenanceMarginPercentage = Precise.stringDiv (maintenanceMarginString, notional);
        const percentage = Precise.stringMul (Precise.stringDiv (unrealisedPnl, initialMarginString), '100');
        const marginRatio = Precise.stringDiv (maintenanceMarginString, collateralString, 4);
        return {
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
            'collateral': this.parseNumber (collateralString),
            'marginMode': marginMode,
            'side': side,
            'percentage': this.parseNumber (percentage),
        };
    }

    async setMarginMode (marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
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
            sellLeverage = this.safeNumber2 (params, 'sell_leverage', 'sellLeverage');
            buyLeverage = this.safeNumber2 (params, 'buy_leverage', 'buyLeverage');
            if (sellLeverage === undefined || buyLeverage === undefined) {
                throw new ArgumentsRequired (this.id + ' setMarginMode() requires a leverage parameter or sell_leverage and buy_leverage parameters');
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
            'buyLeverage': leverage,
            'sellLeverage': leverage,
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

    async setLeverage (leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bybit#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        const isUsdcSettled = market['settle'] === 'USDC';
        const enableUnifiedMargin = await this.isUnifiedMarginEnabled ();
        // engage in leverage setting
        // we reuse the code here instead of having two methods
        leverage = this.numberToString (leverage);
        let method = undefined;
        let request = undefined;
        if (enableUnifiedMargin || !isUsdcSettled) {
            request = {
                'symbol': market['id'],
                'buyLeverage': leverage,
                'sellLeverage': leverage,
            };
            if (enableUnifiedMargin && !market['inverse']) {
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
            method = 'privatePostOptionUsdcOpenapiPrivateV1PositionSetLeverage';
        }
        return await this[method] (this.extend (request, params));
    }

    async setPositionMode (hedged, symbol = undefined, params = {}) {
        await this.loadMarkets ();
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
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        //
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
        return await this.privatePostContractV3PrivatePositionSwitchMode (this.extend (request, params));
    }

    async fetchDerivativesOpenInterestHistory (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const subType = market['linear'] ? 'linear' : 'inverse';
        const category = this.safeString (params, 'category', subType);
        const request = {
            'symbol': market['id'],
            'interval': timeframe,
            'category': category,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDerivativesV3PublicOpenInterest (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "symbol": "BTCUSDT",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "openInterest": "64757.62400000",
        //                     "timestamp": "1665784800000"
        //                 },
        //                 ...
        //             ]
        //         },
        //         "retExtInfo": null,
        //         "time": 1665784849646
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const id = this.safeString (result, 'symbol');
        market = this.safeMarket (id, market, undefined, 'contract');
        const data = this.safeValue (result, 'list', []);
        return this.parseOpenInterests (data, market, since, limit);
    }

    async fetchOpenInterest (symbol, params = {}) {
        /**
         * @method
         * @name bybit#fetchOpenInterest
         * @description Retrieves the open interest of a derivative trading pair
         * @see https://bybit-exchange.github.io/docs/derivativesV3/contract/#t-dv_marketopeninterest
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @param {string|undefined} params.interval 5m, 15m, 30m, 1h, 4h, 1d
         * @param {string|undefined} params.category "linear" or "inverse"
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/en/latest/manual.html#interest-history-structure}
         */
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const timeframe = this.safeString (params, 'interval', '1h');
        if (timeframe === '1m') {
            throw new BadRequest (this.id + ' fetchOpenInterest() cannot use the 1m timeframe');
        }
        const subType = market['linear'] ? 'linear' : 'inverse';
        const category = this.safeString (params, 'category', subType);
        const request = {
            'symbol': market['id'],
            'interval': timeframe,
            'category': category,
        };
        const response = await this.publicGetDerivativesV3PublicOpenInterest (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "symbol": "BTCUSDT",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "openInterest": "64757.62400000",
        //                     "timestamp": "1665784800000"
        //                 },
        //                 ...
        //             ]
        //         },
        //         "retExtInfo": null,
        //         "time": 1665784849646
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const id = this.safeString (result, 'symbol');
        market = this.safeMarket (id, market, undefined, 'contract');
        const data = this.safeValue (result, 'list', []);
        return this.parseOpenInterest (data[0], market);
    }

    async fetchOpenInterestHistory (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOpenInterestHistory
         * @description Gets the total amount of unsettled contracts. In other words, the total number of contracts held in open positions
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

    async fetchBorrowRate (code, params = {}) {
        /**
         * @method
         * @name bybit#fetchBorrowRate
         * @description fetch the rate of interest to borrow a currency for margin trading
         * @see https://bybit-exchange.github.io/docs/spot/v3/#t-queryinterestquota
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure}
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

    async fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @param {string|undefined} code unified currency code
         * @param {string|undefined} symbol unified market symbol when fetch interest in isolated markets
         * @param {number|undefined} since the earliest time in ms to fetch borrrow interest for
         * @param {number|undefined} limit the maximum number of structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [borrow interest structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-interest-structure}
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

    parseBorrowInterest (info, market) {
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

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
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
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
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
        if (method === 'privatePostAssetV3PrivateTransferInterTransfer') {
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

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @see https://bybit-exchange.github.io/docs/account_asset/v3/#t-querytransferlist
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.safeCurrencyCode (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAssetV3PrivateTransferInterTransferListQuery (this.extend (request, params));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "success",
        //         "result": {
        //             "list": [
        //                 {
        //                     "transferId": "e9c421c4-b010-4b16-abd6-106179f27732",
        //                     "coin": "USDT",
        //                     "amount": "8",
        //                     "fromAccountType": "FUND",
        //                     "toAccountType": "SPOT",
        //                     "timestamp": "1666879426000",
        //                     "status": "SUCCESS"
        //                 },
        //             ],
        //             "nextPageCursor": "eyJtaW5JRCI6MTY3NTM4NDcsIm1heElEIjo0OTI0ODc5NX1="
        //         },
        //         "retExtInfo": {},
        //         "time": "1666880800063"
        //     }
        //
        const data = this.safeValue (response, 'result', {});
        const transfers = this.safeValue (data, 'list', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    async borrowMargin (code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bybit#borrowMargin
         * @description create a loan to borrow margin
         * @see https://bybit-exchange.github.io/docs/spot/v3/#t-borrowmarginloan
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {string|undefined} symbol not used by bybit.borrowMargin ()
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/en/latest/manual.html#margin-loan-structure}
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

    async repayMargin (code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bybit#repayMargin
         * @description repay borrowed margin and interest
         * @see https://bybit-exchange.github.io/docs/spot/v3/#t-repaymarginloan
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string|undefined} symbol not used by bybit.repayMargin ()
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/en/latest/manual.html#margin-loan-structure}
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
        const timestamp = this.safeTimestamp (transfer, 'timestamp');
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
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'hex');
                headers = {
                    'Content-Type': 'application/json',
                    'X-BAPI-API-KEY': this.apiKey,
                    'X-BAPI-TIMESTAMP': timestamp,
                    'X-BAPI-SIGN': signature,
                };
            } else if (isV3UnifiedMargin) {
                headers = {
                    'Content-Type': 'application/json',
                    'X-BAPI-API-KEY': this.apiKey,
                    'X-BAPI-SIGN-TYPE': '2',
                    'X-BAPI-TIMESTAMP': timestamp,
                    'X-BAPI-RECV-WINDOW': this.options['recvWindow'].toString (),
                };
                const query = params;
                const queryEncoded = this.rawencode (query);
                const auth_base = timestamp.toString () + this.apiKey + this.options['recvWindow'].toString ();
                let authFull = undefined;
                if (method === 'POST') {
                    body = this.json (query);
                    authFull = auth_base + body;
                } else {
                    authFull = auth_base + queryEncoded;
                    if (path === 'unified/v3/private/order/list') {
                        url += '?' + this.rawencode (query);
                    } else {
                        url += '?' + this.urlencode (query);
                    }
                }
                headers['X-BAPI-SIGN'] = this.hmac (this.encode (authFull), this.encode (this.secret));
            } else {
                const query = this.extend (params, {
                    'api_key': this.apiKey,
                    'recv_window': this.options['recvWindow'],
                    'timestamp': timestamp,
                });
                const sortedQuery = this.keysort (query);
                const auth = this.rawencode (sortedQuery);
                const signature = this.hmac (this.encode (auth), this.encode (this.secret));
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
                    if (path === 'contract/v3/private/order/list') {
                        url += '?' + this.rawencode (sortedQuery);
                    } else {
                        url += '?' + this.urlencode (sortedQuery);
                    }
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
            return; // fallback to default error handler
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
    }

    async fetchDerivativesMarketLeverageTiers (symbol, params = {}) {
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
        const response = await this.publicGetDerivativesV3PublicRiskLimitList (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "id": 1,
        //                     "symbol": "BTCUSDT",
        //                     "limit": "2000000",
        //                     "maintainMargin": "0.005",
        //                     "initialMargin": "0.01",
        //                     "section": [
        //                         "1",
        //                         "3",
        //                         "5",
        //                         "10",
        //                         "25",
        //                         "50",
        //                         "80"
        //                     ],
        //                     "isLowestRisk": 1,
        //                     "maxLeverage": "100.00"
        //                 }
        //             ]
        //         },
        //         "time": 1657797260220
        //     }
        //
        const result = this.safeValue (response, 'result');
        const tiers = this.safeValue (result, 'list');
        return this.parseMarketLeverageTiers (tiers, market);
    }

    async fetchMarketLeverageTiers (symbol, params = {}) {
        /**
         * @method
         * @name bybit#fetchMarketLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/en/latest/manual.html#leverage-tiers-structure}
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

    parseMarketLeverageTiers (info, market) {
        //
        //    Linear
        //    [
        //        {
        //            id: '11',
        //            symbol: 'ETHUSDT',
        //            limit: '800000',
        //            maintain_margin: '0.01',
        //            starting_margin: '0.02',
        //            section: [
        //                '1',  '2',  '3',
        //                '5',  '10', '15',
        //                '25'
        //            ],
        //            is_lowest_risk: '1',
        //            created_at: '2022-02-04 23:30:33.555252',
        //            updated_at: '2022-02-04 23:30:33.555254',
        //            max_leverage: '50'
        //        },
        //        ...
        //    ]
        //
        //    Inverse
        //    [
        //        {
        //            id: '180',
        //            is_lowest_risk: '0',
        //            section: [
        //                '1', '2', '3',
        //                '4', '5', '7',
        //                '8', '9'
        //            ],
        //            symbol: 'ETHUSDH22',
        //            limit: '30000',
        //            max_leverage: '9',
        //            starting_margin: '11',
        //            maintain_margin: '5.5',
        //            coin: 'ETH',
        //            created_at: '2021-04-22T15:00:00Z',
        //            updated_at: '2021-04-22T15:00:00Z'
        //        }
        //        ...
        //    ]
        //
        // usdc swap
        //
        //    {
        //        "riskId":"10001",
        //        "symbol":"BTCPERP",
        //        "limit":"1000000",
        //        "startingMargin":"0.0100",
        //        "maintainMargin":"0.0050",
        //        "isLowestRisk":true,
        //        "section":[
        //           "1",
        //           "2",
        //           "3",
        //           "5",
        //           "10",
        //           "25",
        //           "50",
        //           "100"
        //        ],
        //        "maxLeverage":"100.00"
        //    }
        //
        // Unified Margin
        //
        //     [
        //         {
        //             "id": 1,
        //             "symbol": "BTCUSDT",
        //             "limit": "2000000",
        //             "maintainMargin": "0.005",
        //             "initialMargin": "0.01",
        //             "section": [
        //                 "1",
        //                 "3",
        //                 "5",
        //                 "10",
        //                 "25",
        //                 "50",
        //                 "80"
        //             ],
        //             "isLowestRisk": 1,
        //             "maxLeverage": "100.00"
        //         }
        //     ]
        //
        let minNotional = 0;
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            const maxNotional = this.safeNumber (item, 'limit');
            tiers.push ({
                'tier': this.sum (i, 1),
                'currency': market['base'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeNumber2 (item, 'maintain_margin', 'maintainMargin'),
                'maxLeverage': this.safeNumber2 (item, 'max_leverage', 'maxLeverage'),
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

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name bybit#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        if (this.version !== 'v3') {
            throw new NotSupported (this.id + ' fetchTradingFee() is only support for v3');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new NotSupported (this.id + ' fetchTradingFee() is not supported for spot market');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetContractV3PrivateAccountFeeRate (this.extend (request, params));
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
        //         "time": 1658739027301
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
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        if (this.version !== 'v3') {
            throw new NotSupported (this.id + ' fetchTradingFees() is only support for v3');
        }
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleOptionAndParams (params, 'fetchTradingFees', 'type', 'future');
        if (type === 'spot') {
            throw new NotSupported (this.id + ' fetchTradingFees() is not supported for spot market');
        }
        const response = await this.privateGetContractV3PrivateAccountFeeRate (params);
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
        //         "time": 1658739027301
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
};
