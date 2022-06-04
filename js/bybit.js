'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, InsufficientFunds, BadRequest, RateLimitExceeded, InvalidNonce, NotSupported, InvalidAddress } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bybit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bybit',
            'name': 'Bybit',
            'countries': [ 'VG' ], // British Virgin Islands
            'version': 'v2',
            'userAgent': undefined,
            // 50 requests per second for GET requests, 1000ms / 50 = 20ms between requests
            // 20 requests per second for POST requests, cost = 50 / 20 = 2.5
            'rateLimit': 20,
            'hostname': 'bybit.com', // bybit.com, bytick.com
            'pro': true,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
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
                'fetchBorrowRate': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchIndexOHLCV': true,
                'fetchLedger': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': undefined,
                'fetchWithdrawals': true,
                'setLeverage': true,
                'setMarginMode': true,
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
                'referral': 'https://partner.bybit.com/b/ccxt',
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
                        // data
                        'v2/public/time': 1,
                        'v2/public/announcement': 1,
                        // USDC endpoints
                        // option USDC
                        'option/usdc/openapi/public/v1/order-book': 1,
                        'option/usdc/openapi/public/v1/symbols': 1,
                        'option/usdc/openapi/public/v1/tick': 1,
                        'option/usdc/openapi/public/v1/delivery-price': 1,
                        'option/usdc/openapi/public/v1/query-trade-latest': 1,
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
                        // account
                        'asset/v1/private/transfer/list': 50, // 60 per minute = 1 per second => cost = 50 / 1 = 50
                        'asset/v1/private/sub-member/transfer/list': 50,
                        'asset/v1/private/sub-member/member-ids': 50,
                        'asset/v1/private/deposit/record/query': 50,
                        'asset/v1/private/withdraw/record/query': 25,
                        'asset/v1/private/coin-info/query': 25,
                        'asset/v1/private/asset-info/query': 50,
                        'asset/v1/private/deposit/address': 100,
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
                        // account
                        'asset/v1/private/transfer': 150, // 20 per minute = 0.333 per second => cost = 50 / 0.3333 = 150
                        'asset/v1/private/sub-member/transfer': 150,
                        'asset/v1/private/withdraw': 50,
                        'asset/v1/private/withdraw/cancel': 50,
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
                        'perpetual/usdc/openapi/public/v1/risk-limit/list': 2.5,
                        'perpetual/usdc/openapi/private/v1/position/set-risk-limit': 2.5,
                        // 'perpetual/usdc/openapi/private/v1/predicted-funding': 2.5,
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
                'exact': {
                    '-10009': BadRequest, // {"ret_code":-10009,"ret_msg":"Invalid period!","result":null,"token":null}
                    '-2013': InvalidOrder, // {"ret_code":-2013,"ret_msg":"Order does not exist.","ext_code":null,"ext_info":null,"result":null}
                    '-2015': AuthenticationError, // Invalid API-key, IP, or permissions for action.
                    '-1021': BadRequest, // {"ret_code":-1021,"ret_msg":"Timestamp for this request is outside of the recvWindow.","ext_code":null,"ext_info":null,"result":null}
                    '-1004': BadRequest, // {"ret_code":-1004,"ret_msg":"Missing required parameter \u0027symbol\u0027","ext_code":null,"ext_info":null,"result":null}
                    '7001': BadRequest, // {"retCode":7001,"retMsg":"request params type error"}
                    '10001': BadRequest, // parameter error
                    '10002': InvalidNonce, // request expired, check your timestamp and recv_window
                    '10003': AuthenticationError, // Invalid apikey
                    '10004': AuthenticationError, // invalid sign
                    '10005': PermissionDenied, // permission denied for current apikey
                    '10006': RateLimitExceeded, // too many requests
                    '10007': AuthenticationError, // api_key not found in your request parameters
                    '10010': PermissionDenied, // request ip mismatch
                    '10016': ExchangeError, // {"retCode":10016,"retMsg":"System error. Please try again later."}
                    '10017': BadRequest, // request path not found or request method is invalid
                    '10018': RateLimitExceeded, // exceed ip rate limit
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
                    '130021': InsufficientFunds, // {"ret_code":130021,"ret_msg":"orderfix price failed for CannotAffordOrderCost.","ext_code":"","ext_info":"","result":null,"time_now":"1644588250.204878","rate_limit_status":98,"rate_limit_reset_ms":1644588250200,"rate_limit":100}
                    '3100116': BadRequest, // {"retCode":3100116,"retMsg":"Order quantity below the lower limit 0.01.","result":null,"retExtMap":{"key0":"0.01"}}
                    '3100198': BadRequest, // {"retCode":3100198,"retMsg":"orderLinkId can not be empty.","result":null,"retExtMap":{}}
                    '3200300': InsufficientFunds, // {"retCode":3200300,"retMsg":"Insufficient margin balance.","result":null,"retExtMap":{}}
                },
                'broad': {
                    'unknown orderInfo': OrderNotFound, // {"ret_code":-1,"ret_msg":"unknown orderInfo","ext_code":"","ext_info":"","result":null,"time_now":"1584030414.005545","rate_limit_status":99,"rate_limit_reset_ms":1584030414003,"rate_limit":100}
                    'invalid api_key': AuthenticationError, // {"ret_code":10003,"ret_msg":"invalid api_key","ext_code":"","ext_info":"","result":null,"time_now":"1599547085.415797"}
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'defaultType': 'swap',  // 'swap', 'future', 'option', 'spot'
                'defaultSubType': 'linear',  // 'linear', 'inverse'
                'defaultSettle': 'USDT', // USDC for USDC settled markets
                'code': 'BTC',
                'recvWindow': 5 * 1000, // 5 sec default
                'timeDifference': 0, // the difference between system clock and exchange server clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'brokerId': 'CCXT',
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.00075,
                    'maker': -0.00025,
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

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bybit#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {dict} params extra parameters specific to the bybit api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetV2PublicTime (params);
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: {},
        //         time_now: '1583933682.448826'
        //     }
        //
        return this.safeTimestamp (response, 'time_now');
    }

    safeNetwork (networkId) {
        const networksById = {
            'ETH': 'ERC20',
            'TRX': 'TRC20',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bybit#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {dict} params extra parameters specific to the bybit api endpoint
         * @returns {dict} an associative dictionary of currencies
         */
        if (!this.checkRequiredCredentials (false)) {
            return undefined;
        }
        const response = await this.privateGetAssetV1PrivateCoinInfoQuery (params);
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "result":{
        //             "rows":[
        //                 {
        //                     "name":"BUSD",
        //                     "coin":"BUSD",
        //                     "remain_amount":"7500000",
        //                     "chains":[
        //                         {"chain_type":"BSC (BEP20)","confirmation":"20","withdraw_fee":"0.8","deposit_min":"0","withdraw_min":"1.6","chain":"BSC"},
        //                         {"chain_type":"ERC20","confirmation":"12","withdraw_fee":"30","deposit_min":"0","withdraw_min":"30","chain":"ETH"},
        //                     ],
        //                 },
        //                 {
        //                     "name":"USDT",
        //                     "coin":"USDT",
        //                     "remain_amount":"15000000",
        //                     "chains":[
        //                         {"chain_type":"ERC20","confirmation":"12","withdraw_fee":"10","deposit_min":"0","withdraw_min":"20","chain":"ETH"},
        //                         {"chain_type":"TRC20","confirmation":"100","withdraw_fee":"1","deposit_min":"0","withdraw_min":"10","chain":"TRX"},
        //                         {"chain_type":"Arbitrum One","confirmation":"12","withdraw_fee":"10","deposit_min":"0","withdraw_min":"20","chain":"ARBI"},
        //                         {"chain_type":"SOL","confirmation":"300","withdraw_fee":"1","deposit_min":"0","withdraw_min":"10","chain":"SOL"},
        //                         {"chain_type":"BSC (BEP20)","confirmation":"20","withdraw_fee":"2","deposit_min":"0","withdraw_min":"10","chain":"BSC"},
        //                         {"chain_type":"Zksync","confirmation":"1","withdraw_fee":"3","deposit_min":"0","withdraw_min":"3","chain":"ZKSYNC"},
        //                         {"chain_type":"MATIC","confirmation":"128","withdraw_fee":"0.3","deposit_min":"0","withdraw_min":"0.3","chain":"MATIC"},
        //                         {"chain_type":"OMNI","confirmation":"1","withdraw_fee":"","deposit_min":"0","withdraw_min":"","chain":"OMNI"},
        //                     ],
        //                 },
        //             ],
        //         },
        //         "ext_info":null,
        //         "time_now":1653312027278,
        //         "rate_limit_status":119,
        //         "rate_limit_reset_ms":1653312027278,
        //         "rate_limit":1,
        //     }
        //
        const data = this.safeValue (response, 'result', []);
        const rows = this.safeValue (data, 'rows', []);
        const result = {};
        const precision = this.parseNumber ('0.00000001');
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString (currency, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const chains = this.safeValue (currency, 'chains', []);
            const networks = {};
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const network = this.safeNetwork (networkId);
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'active': undefined,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': this.safeNumber (chain, 'withdraw_fee'),
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'withdraw_min'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'deposit_min'),
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
                'precision': precision,
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
         * @param {dict} params extra parameters specific to the exchange api endpoint
         * @returns {[dict]} an array of objects representing market data
         */
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMarkets', undefined, params);
        if (type === 'spot') {
            // spot and swap ids are equal
            // so they can't be loaded together
            const spotMarkets = await this.fetchSpotMarkets (params);
            return spotMarkets;
        }
        const contractMarkets = await this.fetchSwapAndFutureMarkets (params);
        const usdcMarkets = await this.fetchUSDCMarkets (params);
        let markets = contractMarkets;
        markets = this.arrayConcat (markets, usdcMarkets);
        return markets;
    }

    async fetchSpotMarkets (params) {
        const response = await this.publicGetSpotV1Symbols (params);
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":"",
        //         "ext_code":null,
        //         "ext_info":null,
        //         "result":[
        //             {
        //                 "name":"BTCUSDT",
        //                 "alias":"BTCUSDT",
        //                 "baseCurrency":"BTC",
        //                 "quoteCurrency":"USDT",
        //                 "basePrecision":"0.000001",
        //                 "quotePrecision":"0.00000001",
        //                 "minTradeQuantity":"0.000158",
        //                 "minTradeAmount":"10",
        //                 "maxTradeQuantity":"4",
        //                 "maxTradeAmount":"100000",
        //                 "minPricePrecision":"0.01",
        //                 "category":1,
        //                 "showStatus":true
        //             },
        //         ]
        //     }
        const markets = this.safeValue (response, 'result', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = this.safeValue (market, 'showStatus');
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
                'taker': undefined,
                'maker': undefined,
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
                        'min': this.safeNumber (market, 'minTradeQuantity'),
                        'max': this.safeNumber (market, 'maxTradeQuantity'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minTradeAmount'),
                        'max': this.safeNumber (market, 'maxTradeAmount'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchSwapAndFutureMarkets (params) {
        const response = await this.publicGetV2PublicSymbols (params);
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":[
        //             // inverse swap
        //             {
        //                 "name":"BTCUSD",
        //                 "alias":"BTCUSD",
        //                 "status":"Trading",
        //                 "base_currency":"BTC",
        //                 "quote_currency":"USD",
        //                 "price_scale":2,
        //                 "taker_fee":"0.00075",
        //                 "maker_fee":"-0.00025",
        //                 "leverage_filter":{"min_leverage":1,"max_leverage":100,"leverage_step":"0.01"},
        //                 "price_filter":{"min_price":"0.5","max_price":"999999","tick_size":"0.5"},
        //                 "lot_size_filter":{"max_trading_qty":1000000,"min_trading_qty":1,"qty_step":1}
        //             },
        //             // linear swap
        //             {
        //                 "name":"BTCUSDT",
        //                 "alias":"BTCUSDT",
        //                 "status":"Trading",
        //                 "base_currency":"BTC",
        //                 "quote_currency":"USDT",
        //                 "price_scale":2,
        //                 "taker_fee":"0.00075",
        //                 "maker_fee":"-0.00025",
        //                 "leverage_filter":{"min_leverage":1,"max_leverage":100,"leverage_step":"0.01"},
        //                 "price_filter":{"min_price":"0.5","max_price":"999999","tick_size":"0.5"},
        //                 "lot_size_filter":{"max_trading_qty":100,"min_trading_qty":0.001, "qty_step":0.001}
        //             },
        //  inverse futures
        //            {
        //                "name": "BTCUSDU22",
        //                "alias": "BTCUSD0930",
        //                "status": "Trading",
        //                "base_currency": "BTC",
        //                "quote_currency": "USD",
        //                "price_scale": "2",
        //                "taker_fee": "0.0006",
        //                "maker_fee": "0.0001",
        //                "funding_interval": "480",
        //                "leverage_filter": {
        //                    "min_leverage": "1",
        //                    "max_leverage": "100",
        //                    "leverage_step": "0.01"
        //                },
        //                "price_filter": {
        //                    "min_price": "0.5",
        //                    "max_price": "999999",
        //                    "tick_size": "0.5"
        //                },
        //                "lot_size_filter": {
        //                    "max_trading_qty": "1000000",
        //                    "min_trading_qty": "1",
        //                    "qty_step": "1",
        //                    "post_only_max_trading_qty": "5000000"
        //                }
        //            }
        //         ],
        //         "time_now":"1642369942.072113"
        //     }
        //
        const markets = this.safeValue (response, 'result', []);
        const result = [];
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const linearQuoteCurrencies = this.safeValue (options, 'linear', { 'USDT': true });
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const linear = (quote in linearQuoteCurrencies);
            let symbol = base + '/' + quote;
            const baseQuote = base + quote;
            let type = 'swap';
            if (baseQuote !== id) {
                type = 'future';
            }
            const lotSizeFilter = this.safeValue (market, 'lot_size_filter', {});
            const priceFilter = this.safeValue (market, 'price_filter', {});
            const leverage = this.safeValue (market, 'leverage_filter', {});
            const status = this.safeString (market, 'status');
            let active = undefined;
            if (status !== undefined) {
                active = (status === 'Trading');
            }
            const swap = (type === 'swap');
            const future = (type === 'future');
            let expiry = undefined;
            let expiryDatetime = undefined;
            const settleId = linear ? quoteId : baseId;
            const settle = this.safeCurrencyCode (settleId);
            symbol = symbol + ':' + settle;
            if (future) {
                // we have to do some gymnastics here because bybit
                // only provides the day and month regarding the contract expiration
                const alias = this.safeString (market, 'alias'); // BTCUSD0930
                const aliasDate = alias.slice (-4); // 0930
                const aliasMonth = aliasDate.slice (0, 2); // 09
                const aliasDay = aliasDate.slice (2, 4); // 30
                const dateNow = this.yyyymmdd (this.milliseconds ());
                const dateParts = dateNow.split ('-');
                const year = this.safeValue (dateParts, 0);
                const artificial8601Date = year + '-' + aliasMonth + '-' + aliasDay + 'T00:00:00.000Z';
                expiryDatetime = artificial8601Date;
                expiry = this.parse8601 (expiryDatetime);
                symbol = symbol + '-' + this.yymmdd (expiry);
            }
            const inverse = !linear;
            const contractSize = inverse ? this.safeNumber (lotSizeFilter, 'min_trading_qty') : undefined;
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
                'option': false,
                'active': active,
                'contract': true,
                'linear': linear,
                'inverse': inverse,
                'taker': this.safeNumber (market, 'taker_fee'),
                'maker': this.safeNumber (market, 'maker_fee'),
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': expiryDatetime,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (lotSizeFilter, 'qty_step'),
                    'price': this.safeNumber (priceFilter, 'tick_size'),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (leverage, 'max_leverage', 1),
                    },
                    'amount': {
                        'min': this.safeNumber (lotSizeFilter, 'min_trading_qty'),
                        'max': this.safeNumber (lotSizeFilter, 'max_trading_qty'),
                    },
                    'price': {
                        'min': this.safeNumber (priceFilter, 'min_price'),
                        'max': this.safeNumber (priceFilter, 'max_price'),
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

    async fetchUSDCMarkets (params) {
        const linearOptionsResponse = await this.publicGetOptionUsdcOpenapiPublicV1Symbols (params);
        const usdcLinearPerpetualSwaps = await this.publicGetPerpetualUsdcOpenapiPublicV1Symbols (params);
        //
        // USDC linear options
        //     {
        //         "retCode":0,
        //         "retMsg":"success",
        //         "result":{
        //             "resultTotalSize":424,
        //             "cursor":"0%2C500",
        //             "dataList":[
        //                 {
        //                     "symbol":"BTC-24JUN22-300000-C",
        //                     "status":"ONLINE",
        //                     "baseCoin":"BTC",
        //                     "quoteCoin":"USD",
        //                     "settleCoin":"USDC",
        //                     "takerFee":"0.0003",
        //                     "makerFee":"0.0003",
        //                     "minLeverage":"",
        //                     "maxLeverage":"",
        //                     "leverageStep":"",
        //                     "minOrderPrice":"0.5",
        //                     "maxOrderPrice":"10000000",
        //                     "minOrderSize":"0.01",
        //                     "maxOrderSize":"200",
        //                     "tickSize":"0.5",
        //                     "minOrderSizeIncrement":"0.01",
        //                     "basicDeliveryFeeRate":"0.00015",
        //                     "deliveryTime":"1656057600000"
        //                 },
        //                 {
        //                     "symbol":"BTC-24JUN22-300000-P",
        //                     "status":"ONLINE",
        //                     "baseCoin":"BTC",
        //                     "quoteCoin":"USD",
        //                     "settleCoin":"USDC",
        //                     "takerFee":"0.0003",
        //                     "makerFee":"0.0003",
        //                     "minLeverage":"",
        //                     "maxLeverage":"",
        //                     "leverageStep":"",
        //                     "minOrderPrice":"0.5",
        //                     "maxOrderPrice":"10000000",
        //                     "minOrderSize":"0.01",
        //                     "maxOrderSize":"200",
        //                     "tickSize":"0.5",
        //                     "minOrderSizeIncrement":"0.01",
        //                     "basicDeliveryFeeRate":"0.00015",
        //                     "deliveryTime":"1656057600000"
        //                 },
        //             ]
        //         }
        //     }
        //
        // USDC linear perpetual swaps
        //
        //     {
        //         "retCode":0,
        //         "retMsg":"",
        //         "result":[
        //             {
        //                 "symbol":"BTCPERP",
        //                 "status":"ONLINE",
        //                 "baseCoin":"BTC",
        //                 "quoteCoin":"USD",
        //                 "takerFeeRate":"0.00075",
        //                 "makerFeeRate":"-0.00025",
        //                 "minLeverage":"1",
        //                 "maxLeverage":"100",
        //                 "leverageStep":"0.01",
        //                 "minPrice":"0.50",
        //                 "maxPrice":"999999.00",
        //                 "tickSize":"0.50",
        //                 "maxTradingQty":"5.000",
        //                 "minTradingQty":"0.001",
        //                 "qtyStep":"0.001",
        //                 "deliveryFeeRate":"",
        //                 "deliveryTime":"0"
        //             }
        //         ]
        //     }
        //
        const optionsResponse = this.safeValue (linearOptionsResponse, 'result', []);
        const options = this.safeValue (optionsResponse, 'dataList', []);
        const contractsResponse = this.safeValue (usdcLinearPerpetualSwaps, 'result', []);
        const markets = this.arrayConcat (options, contractsResponse);
        const result = [];
        // all markets fetched here are linear
        const linear = true;
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCoin');
            const quoteId = this.safeString (market, 'quoteCoin');
            let settleId = this.safeString (market, 'settleCoin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let settle = this.safeCurrencyCode (settleId);
            let symbol = base + '/' + quote;
            let type = 'swap';
            if (settleId !== undefined) {
                type = 'option';
            }
            const swap = (type === 'swap');
            const option = (type === 'option');
            const leverage = this.safeValue (market, 'leverage_filter', {});
            const status = this.safeString (market, 'status');
            let active = undefined;
            if (status !== undefined) {
                active = (status === 'ONLINE');
            }
            let expiry = undefined;
            let expiryDatetime = undefined;
            let strike = undefined;
            let optionType = undefined;
            if (settle === undefined) {
                settleId = 'USDC';
                settle = 'USDC';
            }
            symbol = symbol + ':' + settle;
            if (option) {
                expiry = this.safeInteger (market, 'deliveryTime');
                expiryDatetime = this.iso8601 (expiry);
                const splitId = id.split ('-');
                strike = this.safeString (splitId, 2);
                const optionLetter = this.safeString (splitId, 3);
                symbol = symbol + '-' + this.yymmdd (expiry) + ':' + strike + ':' + optionLetter;
                if (optionLetter === 'P') {
                    optionType = 'put';
                } else if (optionLetter === 'C') {
                    optionType = 'call';
                }
            }
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
                'future': false,
                'option': option,
                'active': active,
                'contract': true,
                'linear': linear,
                'inverse': !linear,
                'taker': this.safeNumber (market, 'taker_fee'),
                'maker': this.safeNumber (market, 'maker_fee'),
                'contractSize': undefined,
                'expiry': expiry,
                'expiryDatetime': expiryDatetime,
                'strike': strike,
                'optionType': optionType,
                'precision': {
                    'amount': this.safeNumber2 (market, 'minOrderSizeIncrement', 'qtyStep'),
                    'price': this.safeNumber (market, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (leverage, 'minLeverage', 1),
                        'max': this.safeNumber (leverage, 'maxLeverage', 1),
                    },
                    'amount': {
                        'min': this.safeNumber2 (market, 'minOrderSize', 'minTradingQty'),
                        'max': this.safeNumber2 (market, 'maxOrderSize', 'maxTradingQty'),
                    },
                    'price': {
                        'min': this.safeNumber2 (market, 'minOrderPrice', 'minPrice'),
                        'max': this.safeNumber2 (market, 'maxOrderPrice', 'maxPrice'),
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
        // spot
        //
        //    {
        //        "time": "1651743420061",
        //        "symbol": "BTCUSDT",
        //        "bestBidPrice": "39466.75",
        //        "bestAskPrice": "39466.83",
        //        "volume": "4396.082921",
        //        "quoteVolume": "172664909.03216557",
        //        "lastPrice": "39466.71",
        //        "highPrice": "40032.79",
        //        "lowPrice": "38602.39",
        //        "openPrice": "39031.53"
        //    }
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
        const timestamp = this.safeInteger (ticker, 'time');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString2 (ticker, 'last_price', 'lastPrice');
        const open = this.safeString2 (ticker, 'prev_price_24h', 'openPrice');
        let percentage = this.safeString2 (ticker, 'price_24h_pcnt', 'change24h');
        percentage = Precise.stringMul (percentage, '100');
        let baseVolume = this.safeString2 (ticker, 'turnover_24h', 'turnover24h');
        if (baseVolume === undefined) {
            baseVolume = this.safeString (ticker, 'volume');
        }
        let quoteVolume = this.safeString2 (ticker, 'volume_24h', 'volume24h');
        if (quoteVolume === undefined) {
            quoteVolume = this.safeString (ticker, 'quoteVolume');
        }
        let bid = this.safeString2 (ticker, 'bid_price', 'bid');
        if (bid === undefined) {
            bid = this.safeString (ticker, 'bestBidPrice');
        }
        let ask = this.safeString2 (ticker, 'ask_price', 'ask');
        if (ask === undefined) {
            ask = this.safeString (ticker, 'bestAskPrice');
        }
        let high = this.safeString2 (ticker, 'high_price_24h', 'high24h');
        if (high === undefined) {
            high = this.safeString (ticker, 'highPrice');
        }
        let low = this.safeString2 (ticker, 'low_price_24h', 'low24h');
        if (low === undefined) {
            low = this.safeString (ticker, 'lowPrice');
        }
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
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the bybit api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        const isUsdcSettled = market['settle'] === 'USDC';
        if (market['spot']) {
            method = 'publicGetSpotQuoteV1Ticker24hr';
        } else if (!isUsdcSettled) {
            // inverse perpetual // usdt linear // inverse futures
            method = 'publicGetV2PublicTickers';
        } else if (market['option']) {
            // usdc option
            method = 'publicGetOptionUsdcOpenapiPublicV1Tick';
        } else {
            // usdc swap
            method = 'publicGetPerpetualUsdcOpenapiPublicV1Tick';
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', []);
        let rawTicker = undefined;
        if (Array.isArray (result)) {
            rawTicker = this.safeValue (result, 0);
        } else {
            rawTicker = result;
        }
        const ticker = this.parseTicker (rawTicker, market);
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[str]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {dict} params extra parameters specific to the bybit api endpoint
         * @returns {dict} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        let market = undefined;
        let isUsdcSettled = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue (symbols, 0);
            market = this.market (symbol);
            type = market['type'];
            isUsdcSettled = market['settle'] === 'USDC';
        } else {
            [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
            if (type !== 'spot') {
                let defaultSettle = this.safeString (this.options, 'defaultSettle', 'USDT');
                defaultSettle = this.safeString2 (params, 'settle', 'defaultSettle', isUsdcSettled);
                params = this.omit (params, [ 'settle', 'defaultSettle' ]);
                isUsdcSettled = defaultSettle === 'USDC';
            }
        }
        let method = undefined;
        if (type === 'spot') {
            method = 'publicGetSpotQuoteV1Ticker24hr';
        } else if (!isUsdcSettled) {
            // inverse perpetual // usdt linear // inverse futures
            method = 'publicGetV2PublicTickers';
        } else {
            throw new NotSupported (this.id + ' fetchTickers() is not supported for USDC markets');
        }
        const response = await this[method] (params);
        const result = this.safeValue (response, 'result', []);
        const tickers = {};
        for (let i = 0; i < result.length; i++) {
            const ticker = this.parseTicker (result[i]);
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // inverse perpetual BTC/USD
        //
        //     {
        //         symbol: 'BTCUSD',
        //         interval: '1',
        //         open_time: 1583952540,
        //         open: '7760.5',
        //         high: '7764',
        //         low: '7757',
        //         close: '7763.5',
        //         volume: '1259766',
        //         turnover: '162.32773718999994'
        //     }
        //
        // linear perpetual BTC/USDT
        //
        //     {
        //         "id":143536,
        //         "symbol":"BTCUSDT",
        //         "period":"15",
        //         "start_at":1587883500,
        //         "volume":1.035,
        //         "open":7540.5,
        //         "high":7541,
        //         "low":7540.5,
        //         "close":7541
        //     }
        //
        // usdc perpetual
        //     {
        //         "symbol":"BTCPERP",
        //         "volume":"0.01",
        //         "period":"1",
        //         "openTime":"1636358160",
        //         "open":"66001.50",
        //         "high":"66001.50",
        //         "low":"66001.50",
        //         "close":"66001.50",
        //         "turnover":"1188.02"
        //     }
        //
        // spot
        //     [
        //         1651837620000, // start tame
        //         "35831.5", // open
        //         "35831.5", // high
        //         "35801.93", // low
        //         "35817.11", // close
        //         "1.23453", // volume
        //         0, // end time
        //         "44213.97591627", // quote asset volume
        //         24, // number of trades
        //         "0", // taker base volume
        //         "0" // taker quote volume
        //     ]
        //
        if (Array.isArray (ohlcv)) {
            return [
                this.safeNumber (ohlcv, 0),
                this.safeNumber (ohlcv, 1),
                this.safeNumber (ohlcv, 2),
                this.safeNumber (ohlcv, 3),
                this.safeNumber (ohlcv, 4),
                this.safeNumber (ohlcv, 5),
            ];
        }
        let timestamp = this.safeTimestamp2 (ohlcv, 'open_time', 'openTime');
        if (timestamp === undefined) {
            timestamp = this.safeTimestamp (ohlcv, 'start_at');
        }
        return [
            timestamp,
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber2 (ohlcv, 'volume', 'turnover'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {str} symbol unified symbol of the market to fetch OHLCV data for
         * @param {str} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {dict} params extra parameters specific to the bybit api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        const request = {
            'symbol': market['id'],
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.seconds ();
        let sinceTimestamp = undefined;
        if (since === undefined) {
            if (limit === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a since argument or a limit argument');
            } else {
                sinceTimestamp = now - limit * duration;
            }
        } else {
            sinceTimestamp = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 200, default 200
        }
        let method = undefined;
        let intervalKey = 'interval';
        let sinceKey = 'from';
        const isUsdcSettled = market['settle'] === 'USDC';
        if (market['spot']) {
            method = 'publicGetSpotQuoteV1Kline';
        } else if (market['contract'] && !isUsdcSettled) {
            if (market['linear']) {
                // linear swaps/futures
                const methods = {
                    'mark': 'publicGetPublicLinearMarkPriceKline',
                    'index': 'publicGetPublicLinearIndexPriceKline',
                    'premium': 'publicGetPublicLinearPremiumIndexKline',
                };
                method = this.safeValue (methods, price, 'publicGetPublicLinearKline');
            } else {
                // inverse swaps/ futures
                const methods = {
                    'mark': 'publicGetV2PublicMarkPriceKline',
                    'index': 'publicGetV2PublicIndexPriceKline',
                    'premium': 'publicGetV2PublicPremiumPriceKline',
                };
                method = this.safeValue (methods, price, 'publicGetV2PublicKlineList');
            }
        } else {
            // usdc markets
            if (market['option']) {
                throw new NotSupported (this.id + ' fetchOHLCV() is not supported for USDC options markets');
            }
            intervalKey = 'period';
            sinceKey = 'startTime';
            const methods = {
                'mark': 'publicGetPerpetualUsdcOpenapiPublicV1MarkPriceKline',
                'index': 'publicGetPerpetualUsdcOpenapiPublicV1IndexPriceKline',
                'premium': 'publicGetPerpetualUsdcOpenapiPublicV1PremiumPriceKline',
            };
            method = this.safeValue (methods, price, 'publicGetPerpetualUsdcOpenapiPublicV1KlineList');
        }
        // spot markets use the same interval format as ccxt
        // so we don't need  to convert it
        request[intervalKey] = market['spot'] ? timeframe : this.timeframes[timeframe];
        request[sinceKey] = sinceTimestamp;
        const response = await this[method] (this.extend (request, params));
        //
        // inverse perpetual BTC/USD
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             {
        //                 symbol: 'BTCUSD',
        //                 interval: '1',
        //                 open_time: 1583952540,
        //                 open: '7760.5',
        //                 high: '7764',
        //                 low: '7757',
        //                 close: '7763.5',
        //                 volume: '1259766',
        //                 turnover: '162.32773718999994'
        //             },
        //         ],
        //         time_now: '1583953082.397330'
        //     }
        //
        // linear perpetual BTC/USDT
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":[
        //             {
        //                 "id":143536,
        //                 "symbol":"BTCUSDT",
        //                 "period":"15",
        //                 "start_at":1587883500,
        //                 "volume":1.035,
        //                 "open":7540.5,
        //                 "high":7541,
        //                 "low":7540.5,
        //                 "close":7541
        //             }
        //         ],
        //         "time_now":"1587884120.168077"
        //     }
        // spot
        //     {
        //    "ret_code": "0",
        //    "ret_msg": null,
        //     "result": [
        //         [
        //             1651837620000,
        //             "35831.5",
        //             "35831.5",
        //             "35801.93",
        //             "35817.11",
        //             "1.23453",
        //             0,
        //             "44213.97591627",
        //             24,
        //             "0",
        //             "0"
        //         ]
        //     ],
        //     "ext_code": null,
        //     "ext_info": null
        // }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const isUsdcSettled = market['settle'] === 'USDC';
        let method = undefined;
        let fundingRateFromTickerMethod = undefined;
        if (isUsdcSettled) {
            method = 'publicGetPerpetualUsdcOpenapiPublicV1PrevFundingRate';
            fundingRateFromTickerMethod = 'publicGetPerpetualUsdcOpenapiPublicV1Tick';
        } else {
            method = market['linear'] ? 'publicLinearGetFundingPrevFundingRate' : 'publicGetV2PublicFundingPrevFundingRate';
            fundingRateFromTickerMethod = 'publicGetV2PublicTickers';
        }
        const fetchFundingRateFromTicker = await this[fundingRateFromTickerMethod] (this.extend (request, params));
        const response = await this[method] (this.extend (request, params));
        //
        // fetchFundingRateFromTicker
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
        //
        // fetchFundingRateFromTicker USDC settled
        //     {
        //         "retCode": 0,
        //         "retMsg": "",
        //         "result": {
        //             "symbol": "BTCPERP",
        //             "bid": "30085",
        //             "bidIv": "",
        //             "bidSize": "2.3",
        //             "ask": "30245.5",
        //             "askIv": "",
        //             "askSize": "0.882",
        //             "lastPrice": "30245.00",
        //             "openInterest": "1080.03",
        //             "indexPrice": "30246.88",
        //             "markPrice": "30241.83",
        //             "markPriceIv": "",
        //             "change24h": "0.034211",
        //             "high24h": "30416.50",
        //             "low24h": "28400.00",
        //             "volume24h": "158.04",
        //             "turnover24h": "4656073.32",
        //             "totalVolume": "17728.56",
        //             "totalTurnover": "706887856.04",
        //             "fundingRate": "-0.000531",
        //             "predictedFundingRate": "-0.000156",
        //             "nextFundingTime": "2022-05-20T00:00:00Z",
        //             "countdownHour": "3",
        //             "predictedDeliveryPrice": "",
        //             "underlyingPrice": "",
        //             "delta": "",
        //             "gamma": "",
        //             "vega": "",
        //             "theta": ""
        //         }
        //     }
        //
        // linear
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":{
        //             "symbol":"BTCUSDT",
        //             "funding_rate":0.00006418,
        //             "funding_rate_timestamp":"2022-03-11T16:00:00.000Z"
        //         },
        //         "time_now":"1647040818.724895"
        //     }
        //
        // inverse
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":{
        //             "symbol":"BTCUSD",
        //             "funding_rate":"0.00009536",
        //             "funding_rate_timestamp":1647014400
        //         },
        //         "time_now":"1647040852.515724"
        //     }
        //
        // usdc
        //     {
        //         "retCode":0,
        //         "retMsg":"",
        //         "result":{
        //            "symbol":"BTCPERP",
        //            "fundingRate":"0.00010000",
        //            "fundingRateTimestamp":"1652112000000"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result');
        const fundingRate = this.safeNumber2 (result, 'funding_rate', 'fundingRate');
        let fundingTimestamp = this.parse8601 (this.safeString (result, 'funding_rate_timestamp'));
        if (fundingTimestamp === undefined) {
            fundingTimestamp = this.safeTimestamp2 (result, 'funding_rate_timestamp', fundingTimestamp);
            if (fundingTimestamp === undefined) {
                fundingTimestamp = this.safeInteger (result, 'fundingRateTimestamp');
            }
        }
        const currentTime = this.milliseconds ();
        const fetchTickerResult = isUsdcSettled ? this.safeValue (fetchFundingRateFromTicker, 'result', {}) : this.safeValue (fetchFundingRateFromTicker, 'result', []);
        const markPrice = isUsdcSettled ? this.safeNumber (fetchTickerResult, 'markPrice') : this.safeNumber (fetchTickerResult[0], 'mark_price');
        const indexPrice = isUsdcSettled ? this.safeNumber (fetchTickerResult, 'indexPrice') : this.safeNumber (fetchTickerResult[0], 'index_price');
        const nextFundingRate = isUsdcSettled ? this.safeNumber (fetchTickerResult, 'predictedFundingRate') : this.safeNumber (fetchTickerResult[0], 'predicted_funding_rate');
        const nextFundingDatetime = isUsdcSettled ? this.safeString (fetchTickerResult, 'nextFundingTime') : this.safeString (fetchTickerResult[0], 'next_funding_time');
        return {
            'info': result,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': nextFundingRate,
            'nextFundingTimestamp': this.parse8601 (nextFundingDatetime),
            'nextFundingDatetime': nextFundingDatetime,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (since === undefined && limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchIndexOHLCV() requires a since argument or a limit argument');
        }
        const request = {
            'price': 'index',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (since === undefined && limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMarkOHLCV() requires a since argument or a limit argument');
        }
        const request = {
            'price': 'mark',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchPremiumIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (since === undefined && limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPremiumIndexOHLCV() requires a since argument or a limit argument');
        }
        const request = {
            'price': 'premiumIndex',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    parseTrade (trade, market = undefined) {
        //
        //  public spot
        //
        //    {
        //        "price": "39548.68",
        //        "time": "1651748717850",
        //        "qty": "0.166872",
        //        "isBuyerMaker": true
        //    }
        //
        // public linear/inverse swap/future
        //
        //     {
        //         "id": "112348766532",
        //         "symbol": "BTCUSDT",
        //         "price": "39536",
        //         "qty": "0.011",
        //         "side": "Buy",
        //         "time": "2022-05-05T11:16:02.000Z",
        //         "trade_time_ms": "1651749362196"
        //     }
        //
        // public usdc market
        //
        //     {
        //         "symbol": "BTC-30SEP22-400000-C",
        //         "orderQty": "0.010",
        //         "orderPrice": "5.00",
        //         "time": "1651104300208"
        //     }
        //
        // private futures/swap
        //
        //      {
        //          "order_id": "b020b4bc-6fe2-45b5-adbc-dd07794f9746",
        //          "order_link_id": "",
        //          "side": "Buy",
        //          "symbol": "AAVEUSDT",
        //          "exec_id": "09abe8f0-aea6-514e-942b-7da8cb935120",
        //          "price": "269.3",
        //          "order_price": "269.3",
        //          "order_qty": "0.1",
        //          "order_type": "Market",
        //          "fee_rate": "0.00075",
        //          "exec_price": "256.35",
        //          "exec_type": "Trade",
        //          "exec_qty": "0.1",
        //          "exec_fee": "0.01922625",
        //          "exec_value": "25.635",
        //          "leaves_qty": "0",
        //          "closed_size": "0",
        //          "last_liquidity_ind": "RemovedLiquidity",
        //          "trade_time": "1638276374",
        //          "trade_time_ms": "1638276374312"
        //      }
        //
        // spot
        //    {
        //         "id": "1149467000412631552",
        //         "symbol": "LTCUSDT",
        //         "symbolName": "LTCUSDT",
        //         "orderId": "1149467000244912384",
        //         "ticketId": "2200000000002601358",
        //         "matchOrderId": "1149465793552007078",
        //         "price": "100.19",
        //         "qty": "0.09973",
        //         "commission": "0.0099919487",
        //         "commissionAsset": "USDT",
        //         "time": "1651763144465",
        //         "isBuyer": false,
        //         "isMaker": false,
        //         "fee": {
        //             "feeTokenId": "USDT",
        //             "feeTokenName": "USDT",
        //             "fee": "0.0099919487"
        //         },
        //         "feeTokenId": "USDT",
        //         "feeAmount": "0.0099919487",
        //         "makerRebate": "0"
        //     }
        //
        const id = this.safeString2 (trade, 'id', 'exec_id');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let amountString = this.safeString2 (trade, 'qty', 'exec_qty');
        if (amountString === undefined) {
            amountString = this.safeString (trade, 'orderQty');
        }
        let priceString = this.safeString2 (trade, 'exec_price', 'price');
        if (priceString === undefined) {
            priceString = this.safeString (trade, 'orderPrice');
        }
        const costString = this.safeString (trade, 'exec_value');
        let timestamp = this.parse8601 (this.safeString (trade, 'time'));
        if (timestamp === undefined) {
            timestamp = this.safeInteger2 (trade, 'trade_time_ms', 'time');
        }
        let side = this.safeStringLower (trade, 'side');
        if (side === undefined) {
            const isBuyer = this.safeValue (trade, 'isBuyer');
            if (isBuyer !== undefined) {
                side = isBuyer ? 'buy' : 'sell';
            }
        }
        const isMaker = this.safeValue (trade, 'isMaker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        } else {
            const lastLiquidityInd = this.safeString (trade, 'last_liquidity_ind');
            takerOrMaker = (lastLiquidityInd === 'AddedLiquidity') ? 'maker' : 'taker';
        }
        const feeCostString = this.safeString (trade, 'exec_fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyCode = market['inverse'] ? market['base'] : market['quote'];
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': this.safeString (trade, 'fee_rate'),
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString2 (trade, 'order_id', 'orderId'),
            'type': this.safeStringLower (trade, 'order_type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the bybit api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        const request = {
            'symbol': market['id'],
        };
        const isUsdcSettled = market['settle'] === 'USDC';
        if (market['type'] === 'spot') {
            method = 'publicGetSpotQuoteV1Trades';
        } else if (!isUsdcSettled) {
            // inverse perpetual // usdt linear // inverse futures
            method = market['linear'] ? 'publicGetPublicLinearRecentTradingRecords' : 'publicGetV2PublicTradingRecords';
        } else {
            // usdc option/ swap
            method = 'publicGetOptionUsdcOpenapiPublicV1QueryTradeLatest';
            request['category'] = market['option'] ? 'OPTION' : 'PERPETUAL';
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             {
        //                 id: 43785688,
        //                 symbol: 'BTCUSD',
        //                 price: 7786,
        //                 qty: 67,
        //                 side: 'Sell',
        //                 time: '2020-03-11T19:18:30.123Z'
        //             },
        //         ],
        //         time_now: '1583954313.393362'
        //     }
        //
        // usdc trades
        //     {
        //         "retCode": 0,
        //           "retMsg": "Success.",
        //           "result": {
        //           "resultTotalSize": 2,
        //             "cursor": "",
        //             "dataList": [
        //                  {
        //                    "id": "3caaa0ca",
        //                    "symbol": "BTCPERP",
        //                    "orderPrice": "58445.00",
        //                    "orderQty": "0.010",
        //                    "side": "Buy",
        //                    "time": "1638275679673"
        //                  }
        //              ]
        //         }
        //     }
        //
        let trades = this.safeValue (response, 'result', {});
        if (!Array.isArray (trades)) {
            trades = this.safeValue (trades, 'dataList', []);
        }
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        const market = this.market (symbol);
        if (market['spot']) {
            return super.parseOrderBook (orderbook, symbol, timestamp, bidsKey, asksKey, priceKey, amountKey);
        }
        const bids = [];
        const asks = [];
        for (let i = 0; i < orderbook.length; i++) {
            const bidask = orderbook[i];
            const side = this.safeString (bidask, 'side');
            if (side === 'Buy') {
                bids.push (this.parseBidAsk (bidask, priceKey, amountKey));
            } else if (side === 'Sell') {
                asks.push (this.parseBidAsk (bidask, priceKey, amountKey));
            } else {
                throw new ExchangeError (this.id + ' parseOrderBook() encountered an unrecognized bidask format: ' + this.json (bidask));
            }
        }
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the bybit api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const isUsdcSettled = market['settle'] === 'USDC';
        let method = undefined;
        if (market['spot']) {
            method = 'publicGetSpotQuoteV1Depth';
        } else if (!isUsdcSettled) {
            // inverse perpetual // usdt linear // inverse futures
            method = 'publicGetV2PublicOrderBookL2';
        } else {
            // usdc option/ swap
            method = market['option'] ? 'publicGetOptionUsdcOpenapiPublicV1OrderBook' : 'publicGetPerpetualUsdcOpenapiPublicV1OrderBook';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //     {
        //         "ret_code": 0,
        //         "ret_msg": null,
        //         "result": {
        //             "time": 1620886105740,
        //             "bids": [
        //                 ["50005.12","403.0416"]
        //             ],
        //             "asks": [
        //                 ["50006.34", "0.2297" ]
        //             ]
        //         },
        //         "ext_code": null,
        //         "ext_info": null
        //     }
        //
        // linear/inverse swap/futures
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             { symbol: 'BTCUSD', price: '7767.5', size: 677956, side: 'Buy' },
        //             { symbol: 'BTCUSD', price: '7767', size: 580690, side: 'Buy' },
        //             { symbol: 'BTCUSD', price: '7766.5', size: 475252, side: 'Buy' },
        //         ],
        //         time_now: '1583954829.874823'
        //     }
        //
        // usdc markets
        //
        //     {
        //         "retCode": 0,
        //           "retMsg": "SUCCESS",
        //           "result": [
        //           {
        //             "price": "5000.00000000",
        //             "size": "2.0000",
        //             "side": "Buy" // bids
        //           },
        //           {
        //             "price": "5900.00000000",
        //             "size": "0.9000",
        //             "side": "Sell" // asks
        //           }
        //         ]
        //    }
        //
        const result = this.safeValue (response, 'result', []);
        let timestamp = this.safeTimestamp (response, 'time_now');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (response, 'time');
        }
        const bidsKey = market['spot'] ? 'bids' : 'Buy';
        const asksKey = market['spot'] ? 'asks' : 'Sell';
        const priceKey = market['spot'] ? 0 : 'price';
        const sizeKey = market['spot'] ? 1 : 'size';
        return this.parseOrderBook (result, symbol, timestamp, bidsKey, asksKey, priceKey, sizeKey);
    }

    parseBalance (response) {
        //
        // spot balance
        //    {
        //        "ret_code": "0",
        //        "ret_msg": "",
        //        "ext_code": null,
        //        "ext_info": null,
        //        "result": {
        //            "balances": [
        //                {
        //                    "coin": "LTC",
        //                    "coinId": "LTC",
        //                    "coinName": "LTC",
        //                    "total": "0.00000783",
        //                    "free": "0.00000783",
        //                    "locked": "0"
        //                }
        //            ]
        //        }
        //    }
        //
        // linear/inverse swap/futures
        //    {
        //        "ret_code": "0",
        //        "ret_msg": "OK",
        //        "ext_code": "",
        //        "ext_info": "",
        //        "result": {
        //            "ADA": {
        //                "equity": "0",
        //                "available_balance": "0",
        //                "used_margin": "0",
        //                "order_margin": "0",
        //                "position_margin": "0",
        //                "occ_closing_fee": "0",
        //                "occ_funding_fee": "0",
        //                "wallet_balance": "0",
        //                "realised_pnl": "0",
        //                "unrealised_pnl": "0",
        //                "cum_realised_pnl": "0",
        //                "given_cash": "0",
        //                "service_cash": "0"
        //            },
        //        },
        //        "time_now": "1651772170.050566",
        //        "rate_limit_status": "119",
        //        "rate_limit_reset_ms": "1651772170042",
        //        "rate_limit": "120"
        //    }
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
        const result = {
            'info': response,
        };
        const data = this.safeValue (response, 'result', {});
        const balances = this.safeValue (data, 'balances');
        if (Array.isArray (balances)) {
            // spot balances
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'coin');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'availableBalance');
                account['used'] = this.safeString (balance, 'locked');
                account['total'] = this.safeString (balance, 'total');
                result[code] = account;
            }
        } else {
            if ('walletBalance' in data) {
                // usdc wallet
                const code = 'USDC';
                const account = this.account ();
                account['free'] = this.safeString (data, 'availableBalance');
                account['total'] = this.safeString (data, 'walletBalance');
                result[code] = account;
            } else {
                // linear/inverse swap/futures
                const currencyIds = Object.keys (data);
                for (let i = 0; i < currencyIds.length; i++) {
                    const currencyId = currencyIds[i];
                    const balance = data[currencyId];
                    const code = this.safeCurrencyCode (currencyId);
                    const account = this.account ();
                    account['free'] = this.safeString (balance, 'available_balance');
                    account['total'] = this.safeString (balance, 'wallet_balance');
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
         * @param {dict} params extra parameters specific to the bybit api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const request = {};
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        let method = undefined;
        if (type === 'spot') {
            method = 'privateGetSpotV1Account';
        } else {
            let settle = this.safeString (this.options, 'defaultSettle');
            settle = this.safeString2 (params, 'settle', 'defaultSettle', settle);
            params = this.omit (params, [ 'settle', 'defaultSettle' ]);
            const isUsdcSettled = settle === 'USDC';
            if (!isUsdcSettled) {
                // linear/inverse future/swap
                method = 'privateGetV2PrivateWalletBalance';
                const coin = this.safeString2 (params, 'coin', 'code');
                params = this.omit (params, [ 'coin', 'code' ]);
                if (coin !== undefined) {
                    const currency = this.currency (coin);
                    request['coin'] = currency['id'];
                }
            } else {
                // usdc account
                method = 'privatePostOptionUsdcOpenapiPrivateV1QueryWalletBalance';
            }
        }
        await this.loadMarkets ();
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: {
        //             BTC: {
        //                 equity: 0,
        //                 available_balance: 0,
        //                 used_margin: 0,
        //                 order_margin: 0,
        //                 position_margin: 0,
        //                 occ_closing_fee: 0,
        //                 occ_funding_fee: 0,
        //                 wallet_balance: 0,
        //                 realised_pnl: 0,
        //                 unrealised_pnl: 0,
        //                 cum_realised_pnl: 0,
        //                 given_cash: 0,
        //                 service_cash: 0
        //             }
        //         },
        //         time_now: '1583937810.370020',
        //         rate_limit_status: 119,
        //         rate_limit_reset_ms: 1583937810367,
        //         rate_limit: 120
        //     }
        //
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            // basic orders
            'Created': 'open',
            'Rejected': 'rejected', // order is triggered but failed upon being placed
            'New': 'open',
            'Partiallyfilled': 'open',
            'Filled': 'closed',
            'Cancelled': 'canceled',
            'Pendingcancel': 'canceling', // the engine has received the cancellation but there is no guarantee that it will be successful
            'CREATED': 'open',
            'REJECTED': 'rejected',
            'NEW': 'open',
            'PENDING_NEW': 'open',
            'PARTIALLYFILLED': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDINGCANCEL': 'canceling',
            'PENDING_CANCEL': 'canceling',
            // conditional orders
            'Active': 'open', // order is triggered and placed successfully
            'Untriggered': 'open', // order waits to be triggered
            'Triggered': 'closed', // order is triggered
            // 'Cancelled': 'canceled', // order is cancelled
            // 'Rejected': 'rejected', // order is triggered but fail to be placed
            'Deactivated': 'canceled', // conditional order was cancelled before triggering
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
        //
        // createOrder
        //
        //     {
        //         "user_id": 1,
        //         "order_id": "335fd977-e5a5-4781-b6d0-c772d5bfb95b",
        //         "symbol": "BTCUSD",
        //         "side": "Buy",
        //         "order_type": "Limit",
        //         "price": 8800,
        //         "qty": 1,
        //         "time_in_force": "GoodTillCancel",
        //         "order_status": "Created",
        //         "last_exec_time": 0,
        //         "last_exec_price": 0,
        //         "leaves_qty": 1,
        //         "cum_exec_qty": 0, // in contracts, where 1 contract = 1 quote currency unit (USD for inverse contracts)
        //         "cum_exec_value": 0, // in contract's underlying currency (BTC for inverse contracts)
        //         "cum_exec_fee": 0,
        //         "reject_reason": "",
        //         "order_link_id": "",
        //         "created_at": "2019-11-30T11:03:43.452Z",
        //         "updated_at": "2019-11-30T11:03:43.455Z"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "user_id" : 599946,
        //         "symbol" : "BTCUSD",
        //         "side" : "Buy",
        //         "order_type" : "Limit",
        //         "price" : "7948",
        //         "qty" : 10,
        //         "time_in_force" : "GoodTillCancel",
        //         "order_status" : "Filled",
        //         "ext_fields" : {
        //             "o_req_num" : -1600687220498,
        //             "xreq_type" : "x_create"
        //         },
        //         "last_exec_time" : "1588150113.968422",
        //         "last_exec_price" : "7948",
        //         "leaves_qty" : 0,
        //         "leaves_value" : "0",
        //         "cum_exec_qty" : 10,
        //         "cum_exec_value" : "0.00125817",
        //         "cum_exec_fee" : "-0.00000031",
        //         "reject_reason" : "",
        //         "cancel_type" : "",
        //         "order_link_id" : "",
        //         "created_at" : "2020-04-29T08:45:24.399146Z",
        //         "updated_at" : "2020-04-29T08:48:33.968422Z",
        //         "order_id" : "dd2504b9-0157-406a-99e1-efa522373944"
        //     }
        //
        // fetchOrders linear swaps
        //
        //     {
        //         "order_id":"7917bd70-e7c3-4af5-8147-3285cd99c509",
        //         "user_id":22919890,
        //         "symbol":"GMTUSDT",
        //         "side":"Buy",
        //         "order_type":"Limit",
        //         "price":2.9262,
        //         "qty":50,
        //         "time_in_force":"GoodTillCancel",
        //         "order_status":"Filled",
        //         "last_exec_price":2.9219,
        //         "cum_exec_qty":50,
        //         "cum_exec_value":146.095,
        //         "cum_exec_fee":0.087657,
        //         "reduce_only":false,
        //         "close_on_trigger":false,
        //         "order_link_id":"",
        //         "created_time":"2022-04-18T17:09:54Z",
        //         "updated_time":"2022-04-18T17:09:54Z",
        //         "take_profit":0,
        //         "stop_loss":0,
        //         "tp_trigger_by":"UNKNOWN",
        //         "sl_trigger_by":"UNKNOWN"
        //     }
        //
        // conditional order
        //
        //    {
        //        "user_id":"24478789",
        //        "stop_order_id":"68e996af-fa55-4ca1-830e-4bf68ffbff3e",
        //        "symbol":"LTCUSDT",
        //        "side":"Buy",
        //        "order_type":"Limit",
        //        "price":"86",
        //        "qty":"0.1",
        //        "time_in_force":"GoodTillCancel",
        //        "order_status":"Filled",
        //        "trigger_price":"86",
        //        "order_link_id":"",
        //        "created_time":"2022-05-09T14:36:36Z",
        //        "updated_time":"2022-05-09T14:39:25Z",
        //        "take_profit":"0",
        //        "stop_loss":"0",
        //        "trigger_by":"LastPrice",
        //        "base_price":"86.96",
        //        "tp_trigger_by":"UNKNOWN",
        //        "sl_trigger_by":"UNKNOWN",
        //        "reduce_only":false,
        //        "close_on_trigger":false
        //    }
        // future
        //    {
        //        "user_id":24478789,
        //        "position_idx":0,
        //        "order_status":"Filled",
        //        "symbol":"ETHUSDM22",
        //        "side":"Buy",
        //        "order_type":"Market",
        //        "price":"2523.35",
        //        "qty":"10",
        //        "time_in_force":"ImmediateOrCancel",
        //        "order_link_id":"",
        //        "order_id":"54feb0e2-ece7-484f-b870-47910609b5ac",
        //        "created_at":"2022-05-09T14:46:42.346Z",
        //        "updated_at":"2022-05-09T14:46:42.350Z",
        //        "leaves_qty":"0",
        //        "leaves_value":"0",
        //        "cum_exec_qty":"10",
        //        "cum_exec_value":"0.00416111",
        //        "cum_exec_fee":"0.0000025",
        //        "reject_reason":"EC_NoError",
        //        "take_profit":"0.0000",
        //        "stop_loss":"0.0000",
        //        "tp_trigger_by":"UNKNOWN",
        //        "sl_trigger_by":"UNKNOWN"
        //    }
        //
        // fetchOpenOrder spot
        //     {
        //        "accountId":"24478790",
        //        "exchangeId":"301",
        //        "symbol":"LTCUSDT",
        //        "symbolName":"LTCUSDT",
        //        "orderLinkId":"1652115972506",
        //        "orderId":"1152426740986003968",
        //        "price":"50",
        //        "origQty":"0.2",
        //        "executedQty":"0",
        //        "cummulativeQuoteQty":"0",
        //        "avgPrice":"0",
        //        "status":"NEW",
        //        "timeInForce":"GTC",
        //        "type":"LIMIT",
        //        "side":"BUY",
        //        "stopPrice":"0.0",
        //        "icebergQty":"0.0",
        //        "time":"1652115973053",
        //        "updateTime":"1652115973063",
        //        "isWorking":true
        //     }
        //
        // create order usdc
        //      {
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
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let timestamp = this.parse8601 (this.safeStringN (order, [ 'created_at', 'created_time', 'create_time', 'timestamp' ]));
        if (timestamp === undefined) {
            timestamp = this.safeNumber2 (order, 'time', 'transactTime');
            if (timestamp === undefined) {
                timestamp = this.safeIntegerProduct (order, 'createdAt', 0.001);
            }
        }
        const id = this.safeStringN (order, [ 'order_id', 'stop_order_id', 'orderId' ]);
        const type = this.safeStringLowerN (order, [ 'order_type', 'type', 'orderType' ]);
        const price = this.safeString2 (order, 'price', 'orderPrice');
        const average = this.safeString2 (order, 'average_price', 'avgPrice');
        const amount = this.safeStringN (order, [ 'qty', 'origQty', 'orderQty' ]);
        const cost = this.safeString2 (order, 'cum_exec_value', 'cumExecValue');
        const filled = this.safeStringN (order, [ 'cum_exec_qty', 'executedQty', 'cumExecQty' ]);
        const remaining = this.safeString2 (order, 'leaves_qty', 'leavesQty');
        let lastTradeTimestamp = this.safeTimestamp (order, 'last_exec_time');
        if (lastTradeTimestamp === 0) {
            lastTradeTimestamp = undefined;
        } else if (lastTradeTimestamp === undefined) {
            lastTradeTimestamp = this.parse8601 (this.safeStringN (order, [ 'updated_time', 'updated_at', 'update_time' ]));
            if (lastTradeTimestamp === undefined) {
                lastTradeTimestamp = this.safeNumber (order, 'updateTime');
            }
        }
        const raw_status = this.safeStringN (order, [ 'order_status', 'stop_order_status', 'status', 'orderStatus' ]);
        const status = this.parseOrderStatus (raw_status);
        const side = this.safeStringLower (order, 'side');
        let fee = undefined;
        const isContract = this.safeValue (market, 'contract');
        if (isContract) {
            const feeCostString = this.safeString2 (order, 'cum_exec_fee', 'cumExecFee');
            if (feeCostString !== undefined) {
                const feeCurrency = market['linear'] ? market['quote'] : market['base'];
                fee = {
                    'cost': feeCostString,
                    'currency': feeCurrency,
                };
            }
        }
        let clientOrderId = this.safeString2 (order, 'order_link_id', 'orderLinkId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const timeInForce = this.parseTimeInForce (this.safeString2 (order, 'time_in_force', 'timeInForce'));
        const stopPrice = this.safeStringN (order, [ 'trigger_price', 'stop_px', 'stopPrice', 'triggerPrice' ]);
        const postOnly = (timeInForce === 'PO');
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
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        if (type !== 'spot' && symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument for ' + type + ' markets');
        }
        if (type === 'spot') {
            // only spot markets have a dedicated endpoint for fetching a order
            const request = {
                'orderId': id,
            };
            const response = await this.privateGetSpotV1Order (this.extend (params, request));
            const result = this.safeValue (response, 'result', {});
            return this.parseOrder (result);
        }
        const isUsdcSettled = (market['settle'] === 'USDC');
        const stopOrderId = this.safeString (params, 'stop_order_id');
        const stop = this.safeValue (params, 'stop', false);
        const orderType = this.safeStringLower (params, 'orderType');
        const isConditional = stop || (stopOrderId !== undefined) || (orderType === 'stop' || orderType === 'conditional');
        if (stopOrderId === undefined) {
            let orderKey = undefined;
            if (isConditional) {
                orderKey = 'stop_order_id';
            } else {
                orderKey = isUsdcSettled ? 'orderId' : 'order_id';
            }
            params[orderKey] = id;
        }
        if (isUsdcSettled || market['future'] || market['inverse']) {
            throw NotSupported (this.id + 'fetchOrder() supports spot markets and linear non-USDC perpetual swap markets only');
        } else {
            // only linear swap markets allow using all purpose
            // fetchOrders endpoint filtering by id
            const orders = await this.fetchOrders (symbol, undefined, undefined, params);
            return this.safeValue (orders, 0);
        }
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const isUsdcSettled = (market['settle'] === 'USDC');
        if (market['spot']) {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        } else if (isUsdcSettled) {
            return await this.createUsdcOrder (symbol, type, side, amount, price, params);
        } else {
            return await this.createContractOrder (symbol, type, side, amount, price, params);
        }
    }

    async createSpotOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type === 'market' && side === 'buy') {
            // for market buy it requires the amount of quote currency to spend
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                const cost = this.safeNumber (params, 'cost');
                params = this.omit (params, 'cost');
                if (price === undefined && cost === undefined) {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                } else {
                    amount = (cost !== undefined) ? cost : amount * price;
                }
            }
        }
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'type': type.toUpperCase (), // limit, market or limit_maker
            'timeInForce': 'GTC', // FOK, IOC
            'qty': this.amountToPrecision (symbol, amount),
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
        };
        if (type === 'limit' || type === 'limit_maker') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder requires a price argument for a ' + type + ' order');
            }
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'orderLinkId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'orderLinkId' ]);
        const brokerId = this.safeString (this.options, 'brokerId');
        if (brokerId !== undefined) {
            request['agentSource'] = brokerId;
        }
        const response = await this.privatePostSpotV1Order (this.extend (request, params));
        //    {
        //        "ret_code":0,
        //        "ret_msg":"",
        //        "ext_code":null,
        //        "ext_info":null,
        //        "result":{
        //           "accountId":"24478790",
        //           "symbol":"ETHUSDT",
        //           "symbolName":"ETHUSDT",
        //           "orderLinkId":"1652266305358517",
        //           "orderId":"1153687819821127168",
        //           "transactTime":"1652266305365",
        //           "price":"80",
        //           "origQty":"0.05",
        //           "executedQty":"0",
        //           "status":"NEW",
        //           "timeInForce":"GTC",
        //           "type":"LIMIT",
        //           "side":"BUY"
        //        }
        //    }
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
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderType': this.capitalize (type), // limit or market
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
        if (price !== undefined) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        if (market['swap']) {
            const stopPx = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
            params = this.omit (params, [ 'stopPrice', 'triggerPrice' ]);
            if (stopPx !== undefined) {
                const basePrice = this.safeValue (params, 'basePrice');
                if (basePrice === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires both the triggerPrice and basePrice params for a conditional ' + type + ' order');
                }
                request['orderFilter'] = 'StopOrder';
                request['triggerPrice'] = this.priceToPrecision (symbol, stopPx);
            } else {
                request['orderFilter'] = 'Order';
            }
        }
        const reduceOnly = this.safeValue2 (params, 'reduce_only', 'reduceOnly', false);
        request['reduceOnly'] = reduceOnly;
        params = this.omit (params, [ 'reduce_only', 'reduceOnly' ]);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'orderLinkId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        } else if (market['option']) {
            // mandatory field for options
            request['orderLinkId'] = this.uuid16 ();
        }
        params = this.omit (params, [ 'clientOrderId', 'orderLinkId' ]);
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

    async createContractOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (price === undefined && type === 'limit') {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for limit orders');
        }
        amount = this.amountToPrecision (symbol, amount);
        amount = market['linear'] ? parseFloat (amount) : parseInt (amount);
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'order_type': this.capitalize (type), // limit
            'time_in_force': 'GoodTillCancel', // ImmediateOrCancel, FillOrKill, PostOnly
            'qty': amount,
            // 'take_profit': 123.45, // take profit price, only take effect upon opening the position
            // 'stop_loss': 123.45, // stop loss price, only take effect upon opening the position
            // 'reduce_only': false, // reduce only, required for linear orders
            // when creating a closing order, bybit recommends a True value for
            //  close_on_trigger to avoid failing due to insufficient available margin
            // 'close_on_trigger': false, required for linear orders
            // 'order_link_id': 'string', // unique client order id, max 36 characters
            // 'tp_trigger_by': 'LastPrice', // IndexPrice, MarkPrice
            // 'sl_trigger_by': 'LastPrice', // IndexPrice, MarkPrice
            // conditional orders ---------------------------------------------
            // base_price is used to compare with the value of stop_px, to decide
            // whether your conditional order will be triggered by crossing trigger
            // price from upper side or lower side, mainly used to identify the
            // expected direction of the current conditional order
            // 'base_price': 123.45, // required for conditional orders
            // 'stop_px': 123.45, // trigger price, required for conditional orders
            // 'trigger_by': 'LastPrice', // IndexPrice, MarkPrice
        };
        if (market['future']) {
            const positionIdx = this.safeInteger (params, 'position_idx', 0); // 0 One-Way Mode, 1 Buy-side, 2 Sell-side
            request['position_idx'] = positionIdx;
            params = this.omit (params, 'position_idx');
        }
        if (market['linear']) {
            const reduceOnly = this.safeValue2 (params, 'reduce_only', 'reduceOnly', false);
            const closeOnTrigger = this.safeValue2 (params, 'reduce_only', 'reduceOnly', false);
            request['reduce_only'] = reduceOnly;
            request['close_on_trigger'] = closeOnTrigger;
        }
        if (price !== undefined) {
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        const stopPx = this.safeValue2 (params, 'stop_px', 'stopPrice');
        const basePrice = this.safeValue2 (params, 'base_price', 'basePrice');
        let isConditionalOrder = false;
        if (stopPx !== undefined) {
            isConditionalOrder = true;
            if (basePrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires both the stop_px and base_price params for a conditional ' + type + ' order');
            }
            request['stop_px'] = parseFloat (this.priceToPrecision (symbol, stopPx));
            request['base_price'] = parseFloat (this.priceToPrecision (symbol, basePrice));
            const triggerBy = this.safeString2 (params, 'trigger_by', 'triggerBy', 'LastPrice');
            request['trigger_by'] = triggerBy;
            params = this.omit (params, [ 'stop_px', 'stopPrice', 'base_price', 'triggerBy', 'trigger_by' ]);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'order_link_id');
        if (clientOrderId !== undefined) {
            request['order_link_id'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'order_link_id' ]);
        let method = undefined;
        if (market['future']) {
            method = isConditionalOrder ? 'privatePostFuturesPrivateStopOrderCreate' : 'privatePostFuturesPrivateOrderCreate';
        } else if (market['linear']) {
            method = isConditionalOrder ? 'privatePostPrivateLinearStopOrderCreate' : 'privatePostPrivateLinearOrderCreate';
        } else {
            // inverse swaps
            method = isConditionalOrder ? 'privatePostV2PrivateStopOrderCreate' : 'privatePostV2PrivateOrderCreate';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //    {
        //        "ret_code":0,
        //        "ret_msg":"OK",
        //        "ext_code":"",
        //        "ext_info":"",
        //        "result":{
        //           "order_id":"f016f912-68c2-4da9-a289-1bb9b62b5c3b",
        //           "user_id":24478789,
        //           "symbol":"LTCUSDT",
        //           "side":"Buy",
        //           "order_type":"Market",
        //           "price":79.72,
        //           "qty":1,
        //           "time_in_force":"ImmediateOrCancel",
        //           "order_status":"Created",
        //           "last_exec_price":0,
        //           "cum_exec_qty":0,
        //           "cum_exec_value":0,
        //           "cum_exec_fee":0,
        //           "reduce_only":false,
        //           "close_on_trigger":false,
        //           "order_link_id":"",
        //           "created_time":"2022-05-11T13:56:29Z",
        //           "updated_time":"2022-05-11T13:56:29Z",
        //           "take_profit":0,
        //           "stop_loss":0,
        //           "tp_trigger_by":"UNKNOWN",
        //           "sl_trigger_by":"UNKNOWN",
        //           "position_idx":1
        //        },
        //        "time_now":"1652277389.122038",
        //        "rate_limit_status":98,
        //        "rate_limit_reset_ms":1652277389119,
        //        "rate_limit":100
        //    }
        //
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order, market);
    }

    async editUsdcOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        if (amount !== undefined) {
            request['orderQty'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const method = market['option'] ? 'privatePostOptionUsdcOpenApiPrivateV1ReplaceOrder' : 'privatePostPerpetualUsdcOpenApiPrivateV1ReplaceOrder';
        const response = await this[method] (this.extend (request, params));
        //
        //    {
        //        "retCode": 0,
        //        "retMsg": "OK",
        //        "result": {
        //            "outRequestId": "",
        //            "symbol": "BTC-13MAY22-40000-C",
        //            "orderId": "8c65df91-91fc-461d-9b14-786379ef138c",
        //            "orderLinkId": "AAAAA41133"
        //        },
        //        "retExtMap": {}
        //   }
        //
        return {
            'info': response,
            'id': id,
        };
    }

    async editContractOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'order_id': id, // only for non-conditional orders
            'symbol': market['id'],
            // 'p_r_qty': this.amountToPrecision (symbol, amount), // new order quantity, optional
            // 'p_r_price' this.priceToprecision (symbol, price), // new order price, optional
            // ----------------------------------------------------------------
            // conditional orders
            // 'stop_order_id': id, // only for conditional orders
            // 'p_r_trigger_price': 123.45, // new trigger price also known as stop_px
        };
        const orderType = this.safeString (params, 'orderType');
        const isStop = this.safeValue (params, 'stop', false);
        const isConditionalOrder = isStop || (orderType === 'stop' || orderType === 'conditional');
        params = this.omit (params, [ 'orderType', 'stop' ]);
        const idKey = isConditionalOrder ? 'stop_order_id' : 'order_id';
        request[idKey] = id;
        if (amount !== undefined) {
            request['p_r_qty'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['p_r_price'] = this.priceToPrecision (symbol, price);
        }
        let method = undefined;
        if (market['linear']) {
            method = isConditionalOrder ? 'privatePostPrivateLinearStopOrderReplace' : 'privatePostPrivateLinearOrderReplace';
        } else if (market['future']) {
            method = isConditionalOrder ? 'privatePostFuturesPrivateStopOrderReplace' : 'privatePostFuturesPrivateOrderReplace';
        } else {
            // inverse swaps
            method = isConditionalOrder ? 'privatePostV2PrivateSpotOrderReplace' : 'privatePostV2PrivateOrderReplace';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": { "order_id": "efa44157-c355-4a98-b6d6-1d846a936b93" },
        //         "time_now": "1539778407.210858",
        //         "rate_limit_status": 99, // remaining number of accesses in one minute
        //         "rate_limit_reset_ms": 1580885703683,
        //         "rate_limit": 100
        //     }
        //
        // conditional orders
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": { "stop_order_id": "378a1bbc-a93a-4e75-87f4-502ea754ba36" },
        //         "ext_info": null,
        //         "time_now": "1577475760.604942",
        //         "rate_limit_status": 96,
        //         "rate_limit_reset_ms": 1577475760612,
        //         "rate_limit": "100"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return {
            'info': response,
            'id': this.safeString2 (result, 'order_id', 'stop_order_id'),
            'order_id': this.safeString (result, 'order_id'),
            'stop_order_id': this.safeString (result, 'stop_order_id'),
        };
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isUsdcSettled = (market['settle'] === 'USDC');
        if (market['spot']) {
            throw new NotSupported (this.id + ' editOrder() does not support spot markets');
        } else if (isUsdcSettled) {
            return await this.editUsdcOrder (id, symbol, type, side, amount, price, params);
        } else {
            return await this.editContractOrder (id, symbol, type, side, amount, price, params);
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'order_link_id': 'string', // one of order_id, stop_order_id or order_link_id is required
            // regular orders ---------------------------------------------
            // 'order_id': id, // one of order_id or order_link_id is required for regular orders
            // conditional orders ---------------------------------------------
            // 'stop_order_id': id, // one of stop_order_id or order_link_id is required for conditional orders
            // spot orders
            // 'orderId': id
        };
        const orderType = this.safeStringLower (params, 'orderType');
        const isStop = this.safeValue (params, 'stop', false);
        const isConditional = isStop || (orderType === 'stop') || (orderType === 'conditional');
        params = this.omit (params, [ 'orderType', 'stop' ]);
        const isUsdcSettled = market['settle'] === 'USDC';
        let method = undefined;
        if (market['spot']) {
            method = 'privateDeleteSpotV1Order';
            request['orderId'] = id;
        } else if (isUsdcSettled) {
            request['orderId'] = id;
            if (market['option']) {
                method = 'privatePostOptionUsdcOpenapiPrivateV1CancelOrder';
            } else {
                method = 'privatePostPerpetualUsdcOpenapiPrivateV1CancelOrder';
                request['orderFilter'] = isConditional ? 'StopOrder' : 'Order';
            }
        } else if (market['linear']) {
            // linear futures and linear swaps
            method = isConditional ? 'privatePostPrivateLinearStopOrderCancel' : 'privatePostPrivateLinearOrderCancel';
        } else if (market['swap']) {
            // inverse swaps
            method = isConditional ? 'privatePostV2PrivateStopOrderCancel' : 'privatePostV2PrivateOrderCancel';
        } else {
            // inverse futures
            method = isConditional ? 'privatePostFuturesPrivateStopOrderCancel' : 'privatePostFuturesPrivateOrderCancel';
        }
        if (market['contract'] && !isUsdcSettled) {
            if (!isConditional) {
                request['order_id'] = id;
            } else {
                request['stop_order_id'] = id;
            }
        }
        const response = await this[method] (this.extend (request, params));
        // spot order
        //    {
        //        "ret_code":0,
        //        "ret_msg":"",
        //        "ext_code":null,
        //        "ext_info":null,
        //        "result":{
        //           "accountId":"24478790",
        //           "symbol":"LTCUSDT",
        //           "orderLinkId":"1652192399682",
        //           "orderId":"1153067855569315072",
        //           "transactTime":"1652192399866",
        //           "price":"50",
        //           "origQty":"0.2",
        //           "executedQty":"0",
        //           "status":"NEW",
        //           "timeInForce":"GTC",
        //           "type":"LIMIT",
        //           "side":"BUY"
        //        }
        //    }
        // linear
        //    {
        //        "ret_code":0,
        //        "ret_msg":"OK",
        //        "ext_code":"",
        //        "ext_info":"",
        //        "result":{
        //           "order_id":"f5103487-f7f9-48d3-a26d-b74a3a53d3d3"
        //        },
        //        "time_now":"1652192814.880473",
        //        "rate_limit_status":99,
        //        "rate_limit_reset_ms":1652192814876,
        //        "rate_limit":100
        //     }
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let isUsdcSettled = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            isUsdcSettled = market['settle'] === 'USDC';
        } else {
            let settle = this.safeString (this.options, 'defaultSettle');
            settle = this.safeString2 (params, 'settle', 'defaultSettle', settle);
            params = this.omit (params, [ 'settle', 'defaultSettle' ]);
            isUsdcSettled = (settle === 'USDC');
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        if (!isUsdcSettled && symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument for ' + type + ' markets');
        }
        const request = {};
        if (!isUsdcSettled) {
            request['symbol'] = market['id'];
        }
        const orderType = this.safeStringLower (params, 'orderType');
        const isStop = this.safeValue (params, 'stop', false);
        const isConditional = isStop || (orderType === 'stop') || (orderType === 'conditional');
        params = this.omit (params, [ 'stop', 'orderType' ]);
        let method = undefined;
        if (type === 'spot') {
            method = 'privateDeleteSpotOrderBatchCancel';
        } else if (isUsdcSettled) {
            method = (type === 'option') ? 'privatePostOptionUsdcOpenapiPrivateV1CancelAll' : 'privatePostPerpetualUsdcOpenapiPrivateV1CancelAll';
        } else if (type === 'future') {
            method = isConditional ? 'privatePostFuturesPrivateStopOrderCancelAll' : 'privatePostFuturesPrivateOrderCancelAll';
        } else if (market['linear']) {
            // linear swap
            method = isConditional ? 'privatePostPrivateLinearStopOrderCancelAll' : 'privatePostPrivateLinearOrderCancelAll';
        } else {
            // inverse swap
            method = isConditional ? 'privatePostV2PrivateStopOrderCancelAll' : 'privatePostV2PrivateOrderCancelAll';
        }
        const response = await this[method] (this.extend (request, params));
        // spot
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
        // linear swap
        //   {
        //       "ret_code":0,
        //       "ret_msg":"OK",
        //       "ext_code":"",
        //       "ext_info":"",
        //       "result":[
        //          "49d9ee94-303b-4bcf-959b-9e5d215e4973"
        //       ],
        //       "time_now":"1652182444.015560",
        //       "rate_limit_status":90,
        //       "rate_limit_reset_ms":1652182444010,
        //       "rate_limit":100
        //    }
        //
        // conditional futures
        //    {
        //        "ret_code":0,
        //        "ret_msg":"OK",
        //        "ext_code":"",
        //        "ext_info":"",
        //        "result":[
        //           {
        //              "clOrdID":"a14aea1e-9148-4a34-871a-f935f7cdb654",
        //              "user_id":24478789,
        //              "symbol":"ETHUSDM22",
        //              "side":"Buy",
        //              "order_type":"Limit",
        //              "price":"2001",
        //              "qty":10,
        //              "time_in_force":"GoodTillCancel",
        //              "create_type":"CreateByStopOrder",
        //              "cancel_type":"CancelByUser",
        //              "order_status":"",
        //              "leaves_value":"0",
        //              "created_at":"2022-05-10T11:43:29.705138839Z",
        //              "updated_at":"2022-05-10T11:43:37.988493739Z",
        //              "cross_status":"Deactivated",
        //              "cross_seq":-1,
        //              "stop_order_type":"Stop",
        //              "trigger_by":"LastPrice",
        //              "base_price":"2410.65",
        //              "trail_value":"0",
        //              "expected_direction":"Falling"
        //           }
        //        ],
        //        "time_now":"1652183017.988764",
        //        "rate_limit_status":97,
        //        "rate_limit_reset_ms":1652183017986,
        //        "rate_limit":100
        //    }
        //
        const result = this.safeValue (response, 'result', []);
        if (!Array.isArray (result)) {
            return response;
        }
        return this.parseOrders (result, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot'] || (market['settle'] === 'USDC')) {
            throw new NotSupported (this.id + ' fetchOrders() does not support ' + market['type'] + ' markets or USDC markets, use exchange.fetchOpenOrders () and exchange.fetchClosedOrders () instead');
        }
        let method = undefined;
        const isStop = this.safeValue (params, 'stop', false);
        const orderType = this.safeStringLower (params, 'orderType');
        const stopOrderId = this.safeString (params, 'stop_order_id'); // might want to filter by id
        const isConditionalOrder = isStop || (stopOrderId !== undefined) || (orderType === 'stop' || orderType === 'conditional');
        params = this.omit (params, [ 'orderType', 'stop', 'orderType' ]);
        if (market['linear']) {
            method = isConditionalOrder ? 'privateGetPrivateLinearStopOrderList' : 'privateGetPrivateLinearOrderList';
        } else if (market['future']) {
            method = isConditionalOrder ? 'privateGetFuturesPrivateStopOrderList' : 'privateGetFuturesPrivateOrderList';
        } else {
            // inverse swap
            method = isConditionalOrder ? 'privateGetV2PrivateStopOrderList' : 'privateGetV2PrivateOrderList';
        }
        const request = {
            'symbol': market['id'],
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
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // linear swap
        //
        //     {
        //         "ret_code":"0",
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":{
        //            "current_page":"1",
        //            "data":[
        //               {
        //                  "order_id":"68ab115d-cdbc-4c38-adc0-b2fbc60136ab",
        //                  "user_id":"24478789",
        //                  "symbol":"LTCUSDT",
        //                  "side":"Sell",
        //                  "order_type":"Market",
        //                  "price":"94.72",
        //                  "qty":"0.1",
        //                  "time_in_force":"ImmediateOrCancel",
        //                  "order_status":"Filled",
        //                  "last_exec_price":"99.65",
        //                  "cum_exec_qty":"0.1",
        //                  "cum_exec_value":"9.965",
        //                  "cum_exec_fee":"0.005979",
        //                  "reduce_only":true,
        //                  "close_on_trigger":true,
        //                  "order_link_id":"",
        //                  "created_time":"2022-05-05T15:15:34Z",
        //                  "updated_time":"2022-05-05T15:15:34Z",
        //                  "take_profit":"0",
        //                  "stop_loss":"0",
        //                  "tp_trigger_by":"UNKNOWN",
        //                  "sl_trigger_by":"UNKNOWN"
        //               }
        //            ]
        //         },
        //         "time_now":"1652106664.857572",
        //         "rate_limit_status":"598",
        //         "rate_limit_reset_ms":"1652106664856",
        //         "rate_limit":"600"
        //     }
        //
        //
        // conditional orders
        //
        //     {
        //         "ret_code":"0",
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":{
        //            "current_page":"1",
        //            "last_page":"0",
        //            "data":[
        //               {
        //                  "user_id":"24478789",
        //                  "stop_order_id":"68e996af-fa55-4ca1-830e-4bf68ffbff3e",
        //                  "symbol":"LTCUSDT",
        //                  "side":"Buy",
        //                  "order_type":"Limit",
        //                  "price":"86",
        //                  "qty":"0.1",
        //                  "time_in_force":"GoodTillCancel",
        //                  "order_status":"Untriggered",
        //                  "trigger_price":"86",
        //                  "order_link_id":"",
        //                  "created_time":"2022-05-09T14:36:36Z",
        //                  "updated_time":"2022-05-09T14:36:36Z",
        //                  "take_profit":"0",
        //                  "stop_loss":"0",
        //                  "trigger_by":"LastPrice",
        //                  "base_price":"86.96",
        //                  "tp_trigger_by":"UNKNOWN",
        //                  "sl_trigger_by":"UNKNOWN",
        //                  "reduce_only":false,
        //                  "close_on_trigger":false
        //               }
        //            ]
        //         },
        //         "time_now":"1652107028.148177",
        //         "rate_limit_status":"598",
        //         "rate_limit_reset_ms":"1652107028146",
        //         "rate_limit":"600"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        let isUsdcSettled = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            isUsdcSettled = market['settle'] === 'USDC';
        } else {
            let settle = this.safeString (this.options, 'defaultSettle');
            settle = this.safeString2 (params, 'settle', 'defaultSettle', settle);
            params = this.omit (params, [ 'settle', 'defaultSettle' ]);
            isUsdcSettled = settle === 'USDC';
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        if ((type === 'swap' || type === 'future') && !isUsdcSettled) {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a symbol argument for ' + symbol + ' markets');
            }
            const type = this.safeStringLower (params, 'orderType');
            const isStop = this.safeValue (params, 'stop', false);
            const isConditional = isStop || (type === 'stop') || (type === 'conditional');
            params = this.omit (params, [ 'orderType', 'stop' ]);
            let defaultStatuses = undefined;
            if (!isConditional) {
                defaultStatuses = [
                    'Rejected',
                    'Filled',
                    'Cancelled',
                ];
            } else {
                // conditional orders
                defaultStatuses = [
                    'Active',
                    'Triggered',
                    'Cancelled',
                    'Rejected',
                    'Deactivated',
                ];
            }
            const closeStatus = defaultStatuses.join (',');
            const status = this.safeString2 (params, 'order_status', 'status', closeStatus);
            params = this.omit (params, [ 'order_status', 'status' ]);
            params['order_status'] = status;
            return await this.fetchOrders (symbol, since, limit, params);
        }
        const request = {};
        let method = undefined;
        if (type === 'spot') {
            method = 'privateGetSpotV1HistoryOrders';
        } else {
            // usdc
            method = 'privatePostOptionUsdcOpenapiPrivateV1QueryOrderHistory';
            request['category'] = (type === 'swap') ? 'perpetual' : 'option';
        }
        const orders = await this[method] (this.extend (request, params));
        let result = this.safeValue (orders, 'result', []);
        if (!Array.isArray (result)) {
            result = this.safeValue (result, 'dataList', []);
        }
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        let isUsdcSettled = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            isUsdcSettled = market['settle'] === 'USDC';
        } else {
            let settle = this.safeString (this.options, 'defaultSettle');
            settle = this.safeString2 (params, 'settle', 'defaultSettle', settle);
            params = this.omit (params, [ 'settle', 'defaultSettle' ]);
            isUsdcSettled = settle === 'USDC';
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const request = {};
        let method = undefined;
        if ((type === 'swap' || type === 'future') && !isUsdcSettled) {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument for ' + symbol + ' markets');
            }
            request['symbol'] = market['id'];
            const type = this.safeStringLower (params, 'orderType');
            const isStop = this.safeValue (params, 'stop', false);
            const isConditional = isStop || (type === 'stop') || (type === 'conditional');
            params = this.omit (params, [ 'stop', 'orderType' ]);
            if (market['future']) {
                method = isConditional ? 'privateGetFuturesPrivateStopOrder' : 'privateGetFuturesPrivateOrder';
            } else if (market['linear']) {
                method = isConditional ? 'privateGetPrivateLinearStopOrderSearch' : 'privateGetPrivateLinearOrderSearch';
            } else {
                // inverse swap
                method = isConditional ? 'privateGetV2PrivateStopOrder' : 'privateGetV2PrivateOrder';
            }
        } else if (type === 'spot') {
            method = 'privateGetSpotV1OpenOrders';
        } else {
            // usdc
            method = 'privatePostOptionUsdcOpenapiPrivateV1QueryActiveOrders';
            request['category'] = (type === 'swap') ? 'perpetual' : 'option';
        }
        const orders = await this[method] (this.extend (request, params));
        let result = this.safeValue (orders, 'result', []);
        if (!Array.isArray (result)) {
            const dataList = this.safeValue (result, 'dataList');
            if (dataList === undefined) {
                return this.parseOrder (result, market);
            }
            result = dataList;
        }
        // {
        //     "ret_code":0,
        //     "ret_msg":"",
        //     "ext_code":null,
        //     "ext_info":null,
        //     "result":[
        //        {
        //           "accountId":"24478790",
        //           "exchangeId":"301",
        //           "symbol":"LTCUSDT",
        //           "symbolName":"LTCUSDT",
        //           "orderLinkId":"1652115972506",
        //           "orderId":"1152426740986003968",
        //           "price":"50",
        //           "origQty":"0.2",
        //           "executedQty":"0",
        //           "cummulativeQuoteQty":"0",
        //           "avgPrice":"0",
        //           "status":"NEW",
        //           "timeInForce":"GTC",
        //           "type":"LIMIT",
        //           "side":"BUY",
        //           "stopPrice":"0.0",
        //           "icebergQty":"0.0",
        //           "time":"1652115973053",
        //           "updateTime":"1652115973063",
        //           "isWorking":true
        //        }
        //     ]
        //  }
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'order_id': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            // 'order_id': 'f185806b-b801-40ff-adec-52289370ed62', // if not provided will return user's trading records
            // 'symbol': market['id'],
            // 'start_time': parseInt (since / 1000),
            // 'page': 1,
            // 'limit' 20, // max 50
        };
        let market = undefined;
        const orderId = this.safeString (params, 'order_id');
        if (orderId !== undefined) {
            request['order_id'] = orderId;
            params = this.omit (params, 'order_id');
        }
        market = this.market (symbol);
        const isUsdcSettled = market['settle'] === 'USDC';
        if (isUsdcSettled) {
            throw new NotSupported (this.id + ' fetchMyTrades() is not supported for market ' + symbol);
        }
        request['symbol'] = market['id'];
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 50
        }
        let method = undefined;
        if (market['spot']) {
            method = 'privateGetSpotV1MyTrades';
        } else if (market['future']) {
            method = 'privateGetFuturesPrivateExecutionList';
        } else {
            // linear and inverse swaps
            method = market['linear'] ? 'privateGetPrivateLinearTradeExecutionList' : 'privateGetV2PrivateExecutionList';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "",
        //         "ext_code": null,
        //         "ext_info": null,
        //         "result": [
        //            {
        //                 "id": "931975237315196160",
        //                 "symbol": "BTCUSDT",
        //                 "symbolName": "BTCUSDT",
        //                 "orderId": "931975236946097408",
        //                 "ticketId": "1057753175328833537",
        //                 "matchOrderId": "931975113180558592",
        //                 "price": "20000.00001",
        //                 "qty": "0.01",
        //                 "commission": "0.02000000001",
        //                 "commissionAsset": "USDT",
        //                 "time": "1625836105890",
        //                 "isBuyer": false,
        //                 "isMaker": false,
        //                 "fee": {
        //                     "feeTokenId": "USDT",
        //                     "feeTokenName": "USDT",
        //                     "fee": "0.02000000001"
        //                 },
        //                 "feeTokenId": "USDT",
        //                 "feeAmount": "0.02000000001",
        //                 "makerRebate": "0"
        //            }
        //         ]
        //     }
        //
        // inverse
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "OK",
        //         "ext_code": "",
        //         "ext_info": "",
        //         "result": {
        //             "order_id": "Abandoned!!", // Abandoned!!
        //             "trade_list": [
        //                 {
        //                     "closed_size": 0,
        //                     "cross_seq": 277136382,
        //                     "exec_fee": "0.0000001",
        //                     "exec_id": "256e5ef8-abfe-5772-971b-f944e15e0d68",
        //                     "exec_price": "8178.5",
        //                     "exec_qty": 1,
        //                     "exec_time": "1571676941.70682",
        //                     "exec_type": "Trade", //Exec Type Enum
        //                     "exec_value": "0.00012227",
        //                     "fee_rate": "0.00075",
        //                     "last_liquidity_ind": "RemovedLiquidity", //Liquidity Enum
        //                     "leaves_qty": 0,
        //                     "nth_fill": 2,
        //                     "order_id": "7ad50cb1-9ad0-4f74-804b-d82a516e1029",
        //                     "order_link_id": "",
        //                     "order_price": "8178",
        //                     "order_qty": 1,
        //                     "order_type": "Market", //Order Type Enum
        //                     "side": "Buy", //Side Enum
        //                     "symbol": "BTCUSD", //Symbol Enum
        //                     "user_id": 1
        //                 }
        //             ]
        //         },
        //         "time_now": "1577483699.281488",
        //         "rate_limit_status": 118,
        //         "rate_limit_reset_ms": 1577483699244737,
        //         "rate_limit": 120
        //     }
        //
        // linear
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":{
        //             "current_page":1,
        //             "data":[
        //                 {
        //                     "order_id":"b59418ec-14d4-4ef9-b9f4-721d5d576974",
        //                     "order_link_id":"",
        //                     "side":"Sell",
        //                     "symbol":"BTCUSDT",
        //                     "exec_id":"0327284d-faec-5191-bd89-acc5b4fafda9",
        //                     "price":0.5,
        //                     "order_price":0.5,
        //                     "order_qty":0.01,
        //                     "order_type":"Market",
        //                     "fee_rate":0.00075,
        //                     "exec_price":9709.5,
        //                     "exec_type":"Trade",
        //                     "exec_qty":0.01,
        //                     "exec_fee":0.07282125,
        //                     "exec_value":97.095,
        //                     "leaves_qty":0,
        //                     "closed_size":0.01,
        //                     "last_liquidity_ind":"RemovedLiquidity",
        //                     "trade_time":1591648052,
        //                     "trade_time_ms":1591648052861
        //                 }
        //             ]
        //         },
        //         "time_now":"1591736501.979264",
        //         "rate_limit_status":119,
        //         "rate_limit_reset_ms":1591736501974,
        //         "rate_limit":120
        //     }
        //
        let result = this.safeValue (response, 'result', {});
        if (!Array.isArray (result)) {
            result = this.safeValue2 (result, 'trade_list', 'data', []);
        }
        return this.parseTrades (result, market, since, limit);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         chain_type: 'Arbitrum One',
        //         address_deposit: '0x83a127952d266A6eA306c40Ac62A4a70668FE3BE',
        //         tag_deposit: '',
        //         chain: 'ARBI'
        //     }
        //
        const address = this.safeString (depositAddress, 'address_deposit');
        const tag = this.safeString (depositAddress, 'tag_deposit');
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
        await this.loadMarkets ();
        let currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetAssetV1PrivateDepositAddress (this.extend (request, params));
        //
        //     {
        //         ret_code: '0',
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         result: {
        //             coin: 'ETH',
        //             chains: [
        //                 {
        //                     chain_type: 'Arbitrum One',
        //                     address_deposit: 'bybitisthebest',
        //                     tag_deposit: '',
        //                     chain: 'ARBI'
        //                 }
        //             ]
        //         },
        //         ext_info: null,
        //         time_now: '1653141635426'
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
        const rawNetwork = this.safeStringUpper (params, 'network');
        const networks = this.safeValue (this.options, 'networks', {});
        const network = this.safeString (networks, rawNetwork, rawNetwork);
        params = this.omit (params, 'network');
        const response = await this.fetchDepositAddressesByNetwork (code, params);
        let result = undefined;
        if (network === undefined) {
            result = this.safeValue (response, code);
            if (result === undefined) {
                const alias = this.safeString (networks, code, code);
                result = this.safeValue (response, alias);
                if (result === undefined) {
                    const defaultNetwork = this.safeString (this.options, 'defaultNetwork', 'ERC20');
                    result = this.safeValue (response, defaultNetwork);
                    if (result === undefined) {
                        const values = Object.values (response);
                        result = this.safeValue (values, 0);
                        if (result === undefined) {
                            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find deposit address for ' + code);
                        }
                    }
                }
            }
            return result;
        }
        result = this.safeValue (response, network);
        if (result === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find ' + network + ' deposit address for ' + code);
        }
        return result;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
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
            request['start_date'] = this.yyyymmdd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // Currently only works for deposits prior to 2021-07-15
        // will be updated soon
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
        return this.parseTransactions (data, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
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
            request['start_date'] = this.yyyymmdd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV2PrivateWalletWithdrawList (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": {
        //             "data": [
        //                 {
        //                     "id": 137,
        //                     "user_id": 1,
        //                     "coin": "XRP", // Coin Enum
        //                     "status": "Pending", // Withdraw Status Enum
        //                     "amount": "20.00000000",
        //                     "fee": "0.25000000",
        //                     "address": "rH7H595XYEVTEHU2FySYsWnmfACBnZS9zM",
        //                     "tx_id": "",
        //                     "submited_at": "2019-06-11T02:20:24.000Z",
        //                     "updated_at": "2019-06-11T02:20:24.000Z"
        //                 },
        //             ],
        //             "current_page": 1,
        //             "last_page": 1
        //         },
        //         "ext_info": null,
        //         "time_now": "1577482295.125488",
        //         "rate_limit_status": 119,
        //         "rate_limit_reset_ms": 1577482295132,
        //         "rate_limit": 120
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTransactions (data, currency, since, limit, { 'type': 'withdrawal' });
    }

    parseTransactionStatus (status) {
        const statuses = {
            'ToBeConfirmed': 'pending',
            'UnderReview': 'pending',
            'Pending': 'pending',
            'Success': 'ok',
            'CancelByUser': 'canceled',
            'Reject': 'rejected',
            'Expire': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": 137,
        //         "user_id": 1,
        //         "coin": "XRP", // Coin Enum
        //         "status": "Pending", // Withdraw Status Enum
        //         "amount": "20.00000000",
        //         "fee": "0.25000000",
        //         "address": "rH7H595XYEVTEHU2FySYsWnmfACBnZS9zM",
        //         "tx_id": "",
        //         "submited_at": "2019-06-11T02:20:24.000Z",
        //         "updated_at": "2019-06-11T02:20:24.000Z"
        //     }
        //
        // fetchDeposits ledger entries
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
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString2 (transaction, 'submited_at', 'exec_time'));
        const updated = this.parse8601 (this.safeString (transaction, 'updated_at'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const address = this.safeString (transaction, 'address');
        const feeCost = this.safeNumber (transaction, 'fee');
        const type = this.safeStringLower (transaction, 'type');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
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
        const amount = this.safeNumber (item, 'amount');
        const after = this.safeNumber (item, 'wallet_balance');
        const direction = (amount < 0) ? 'out' : 'in';
        let before = undefined;
        if (after !== undefined && amount !== undefined) {
            const difference = (direction === 'out') ? amount : -amount;
            before = this.sum (after, difference);
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
            'amount': amount,
            'before': before,
            'after': after,
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
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeStringUpper (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['chain'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostAssetV1PrivateWithdraw (this.extend (request, params));
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK"
        //         "ext_code":"",
        //         "result":{
        //             "id":"bybitistheone"
        //         },
        //         "ext_info":null,
        //         "time_now":1653149296617
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTransaction (result, currency);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let type = undefined;
        let isLinear = undefined;
        let isUsdcSettled = undefined;
        if (Array.isArray (symbols)) {
            const length = symbols.length;
            if (length !== 1) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() takes an array with exactly one symbol');
            }
            const symbol = this.safeString (symbols, 0);
            market = this.market (symbol);
            type = market['type'];
            isLinear = market['linear'];
            isUsdcSettled = market['settle'] === 'USDC';
            request['symbol'] = market['id'];
        } else {
            // market undefined
            [ type, params ] = this.handleMarketTypeAndParams ('fetchPositions', undefined, params);
            const options = this.safeValue (this.options, 'fetchPositions', {});
            const defaultSubType = this.safeString (this.options, 'defaultSubType', 'linear');
            let subType = this.safeString (options, 'subType', defaultSubType);
            subType = this.safeString (params, 'subType', subType);
            isLinear = (subType === 'linear');
            let defaultSettle = this.safeString (this.options, 'defaultSettle');
            defaultSettle = this.safeString2 (params, 'settle', 'defaultSettle', defaultSettle);
            isUsdcSettled = (defaultSettle === 'USDC');
        }
        params = this.omit (params, [ 'settle', 'defaultSettle', 'subType' ]);
        let method = undefined;
        if (isUsdcSettled) {
            method = 'privatePostOptionUsdcOpenapiPrivateV1QueryPosition';
            request['category'] = (type === 'option') ? 'OPTION' : 'PERPETUAL';
        } else if (type === 'future') {
            method = 'privateGetFuturesPrivatePositionList';
        } else if (isLinear) {
            method = 'privateGetPrivateLinearPositionList';
        } else {
            // inverse swaps
            method = 'privateGetV2PrivatePositionList';
        }
        let response = await this[method] (this.extend (request, params));
        if ((typeof response === 'string') && this.isJsonEncodedObject (response)) {
            response = JSON.parse (response);
        }
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [] or {} depending on the request
        //     }
        //
        let result = this.safeValue (response, 'result', {});
        // usdc contracts
        if ('dataList' in result) {
            result = this.safeValue (result, 'dataList', []);
        }
        let positions = undefined;
        if (!Array.isArray (result)) {
            positions = [ result ];
        } else {
            positions = result;
        }
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

    parsePosition (position, market = undefined) {
        //
        // linear swap
        //
        //    {
        //        "user_id":"24478789",
        //        "symbol":"LTCUSDT",
        //        "side":"Buy",
        //        "size":"0.1",
        //        "position_value":"7.083",
        //        "entry_price":"70.83",
        //        "liq_price":"0.01",
        //        "bust_price":"0.01",
        //        "leverage":"1",
        //        "auto_add_margin":"0",
        //        "is_isolated":false,
        //        "position_margin":"13.8407674",
        //        "occ_closing_fee":"6e-07",
        //        "realised_pnl":"-0.0042498",
        //        "cum_realised_pnl":"-0.159232",
        //        "free_qty":"-0.1",
        //        "tp_sl_mode":"Full",
        //        "unrealised_pnl":"0.008",
        //        "deleverage_indicator":"2",
        //        "risk_id":"71",
        //        "stop_loss":"0",
        //        "take_profit":"0",
        //        "trailing_stop":"0",
        //        "position_idx":"1",
        //        "mode":"BothSide"
        //    }
        //
        // inverse swap / future
        //    {
        //        "id":0,
        //        "position_idx":0,
        //        "mode":0,
        //        "user_id":24478789,
        //        "risk_id":11,
        //        "symbol":"ETHUSD",
        //        "side":"Buy",
        //        "size":10, // USD amount
        //        "position_value":"0.0047808",
        //        "entry_price":"2091.70013387",
        //        "is_isolated":false,
        //        "auto_add_margin":1,
        //        "leverage":"10",
        //        "effective_leverage":"0.9",
        //        "position_margin":"0.00048124",
        //        "liq_price":"992.75",
        //        "bust_price":"990.4",
        //        "occ_closing_fee":"0.00000606",
        //        "occ_funding_fee":"0",
        //        "take_profit":"0",
        //        "stop_loss":"0",
        //        "trailing_stop":"0",
        //        "position_status":"Normal",
        //        "deleverage_indicator":3,
        //        "oc_calc_data":"{\"blq\":0,\"slq\":0,\"bmp\":0,\"smp\":0,\"fq\":-10,\"bv2c\":0.10126,\"sv2c\":0.10114}",
        //        "order_margin":"0",
        //        "wallet_balance":"0.0053223",
        //        "realised_pnl":"-0.00000287",
        //        "unrealised_pnl":0.00001847,
        //        "cum_realised_pnl":"-0.00001611",
        //        "cross_seq":8301155878,
        //        "position_seq":0,
        //        "created_at":"2022-05-05T15:06:17.949997224Z",
        //        "updated_at":"2022-05-13T13:40:29.793570924Z",
        //        "tp_sl_mode":"Full"
        //    }
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
        const contract = this.safeString (position, 'symbol');
        market = this.safeMarket (contract, market);
        const size = this.safeString (position, 'size');
        let side = this.safeString (position, 'side');
        side = (side === 'Buy') ? 'long' : 'short';
        const notional = this.safeString2 (position, 'position_value', 'positionValue');
        const unrealisedPnl = this.safeString2 (position, 'unrealised_pnl', 'unrealisedPnl');
        const initialMarginString = this.safeString2 (position, 'position_margin', 'orderMargin');
        const percentage = Precise.stringMul (Precise.stringDiv (unrealisedPnl, initialMarginString), '100');
        let timestamp = this.parse8601 (this.safeString (position, 'updated_at'));
        if (timestamp === undefined) {
            timestamp = this.safeInteger (position, 'createdAt');
            if (timestamp === undefined) {
                timestamp = this.milliseconds ();
            }
        }
        const isIsolated = this.safeValue (position, 'is_isolated', false); // if not present it is cross
        const marginMode = isIsolated ? 'isolated' : 'cross';
        return {
            'info': position,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (Precise.stringDiv (initialMarginString, notional)),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeNumber2 (position, 'entry_price', 'entryPrice'),
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size), // in USD for inverse swaps
            'contractSize': this.safeNumber (market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber2 (position, 'liq_price', 'liqPrice'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'collateral': undefined,
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
        const leverage = this.safeNumber (params, 'leverage');
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
        const isIsolated = (marginMode === 'ISOLATED');
        const request = {
            'symbol': market['id'],
            'is_isolated': isIsolated,
            'buy_leverage': leverage,
            'sell_leverage': leverage,
        };
        let method = undefined;
        if (market['future']) {
            method = 'privatePostFuturesPrivatePositionSwitchIsolated';
        } else if (market['inverse']) {
            method = 'privatePostV2PrivatePositionSwitchIsolated';
        } else {
            // linear
            method = 'privatePostPrivateLinearPositionSwitchIsolated';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "OK",
        //         "ext_code": "",
        //         "ext_info": "",
        //         "result": null,
        //         "time_now": "1585881597.006026",
        //         "rate_limit_status": 74,
        //         "rate_limit_reset_ms": 1585881597004,
        //         "rate_limit": 75
        //     }
        //
        return response;
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        const isUsdcSettled = market['settle'] === 'USDC';
        let method = undefined;
        if (isUsdcSettled) {
            method = 'privatePostPerpetualUsdcOpenapiPrivateV1PositionLeverageSave';
        } else if (market['future']) {
            method = 'privatePostFuturesPrivatePositionLeverageSave';
        } else if (market['linear']) {
            method = 'privatePostPrivateLinearPositionSetLeverage';
        } else {
            // inverse swaps
            method = 'privatePostV2PrivatePositionLeverageSave';
        }
        const request = {
            'symbol': market['id'],
        };
        leverage = isUsdcSettled ? leverage.toString () : parseInt (leverage);
        const isLinearSwap = market['swap'] && market['linear'];
        const requiresBuyAndSellLeverage = !isUsdcSettled && (isLinearSwap || market['future']);
        if (requiresBuyAndSellLeverage) {
            const buyLeverage = this.safeNumber (params, 'buy_leverage');
            const sellLeverage = this.safeNumber (params, 'sell_leverage');
            if (buyLeverage !== undefined && sellLeverage !== undefined) {
                if ((buyLeverage < 1) || (buyLeverage > 100) || (sellLeverage < 1) || (sellLeverage > 100)) {
                    throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and 100');
                }
            } else {
                request['buy_leverage'] = leverage;
                request['sell_leverage'] = leverage;
            }
        } else {
            // requires leverage
            request['leverage'] = leverage;
        }
        if ((leverage < 1) || (leverage > 100)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and 100');
        }
        return await this[method] (this.extend (request, params));
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
            const timestamp = this.milliseconds ().toString ();
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
                        const brokerId = this.safeString (this.options, 'brokerId');
                        if (brokerId !== undefined) {
                            headers['Referer'] = brokerId;
                        }
                    }
                } else {
                    url += '?' + this.urlencode (sortedQuery) + '&sign=' + signature;
                }
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
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }

    async fetchMarketLeverageTiers (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        market = this.market (symbol);
        if (market['spot'] || market['option']) {
            throw new BadRequest (this.id + ' fetchMarketLeverageTiers() symbol does not support market ' + symbol);
        }
        request['symbol'] = market['id'];
        const isUsdcSettled = market['settle'] === 'USDC';
        let method = undefined;
        if (isUsdcSettled) {
            method = 'publicGetPerpetualUsdcOpenapiPublicV1RiskLimitList';
        } else if (market['linear']) {
            method = 'publicGetPublicLinearRiskLimit';
        } else {
            method = 'publicGetV2PublicRiskLimitList';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //  publicLinearGetRiskLimit
        //    {
        //        ret_code: '0',
        //        ret_msg: 'OK',
        //        ext_code: '',
        //        ext_info: '',
        //        result: [
        //            {
        //                id: '11',
        //                symbol: 'ETHUSDT',
        //                limit: '800000',
        //                maintain_margin: '0.01',
        //                starting_margin: '0.02',
        //                section: [
        //                    '1',  '2',  '3',
        //                    '5',  '10', '15',
        //                    '25'
        //                ],
        //                is_lowest_risk: '1',
        //                created_at: '2022-02-04 23:30:33.555252',
        //                updated_at: '2022-02-04 23:30:33.555254',
        //                max_leverage: '50'
        //            },
        //            ...
        //        ]
        //    }
        //
        //  v2PublicGetRiskLimitList
        //    {
        //        ret_code: '0',
        //        ret_msg: 'OK',
        //        ext_code: '',
        //        ext_info: '',
        //        result: [
        //            {
        //                id: '180',
        //                is_lowest_risk: '0',
        //                section: [
        //                  '1', '2', '3',
        //                  '4', '5', '7',
        //                  '8', '9'
        //                ],
        //                symbol: 'ETHUSDH22',
        //                limit: '30000',
        //                max_leverage: '9',
        //                starting_margin: '11',
        //                maintain_margin: '5.5',
        //                coin: 'ETH',
        //                created_at: '2021-04-22T15:00:00Z',
        //                updated_at: '2021-04-22T15:00:00Z'
        //            },
        //        ],
        //        time_now: '1644017569.683191'
        //    }
        //
        const result = this.safeValue (response, 'result');
        return this.parseMarketLeverageTiers (result, market);
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
};
