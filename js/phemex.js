'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadSymbol, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, OrderNotFound, BadRequest, PermissionDenied, AccountSuspended, CancelPending, DDoSProtection, DuplicateOrderId, RateLimitExceeded } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ----------------------------------------------------------------------------

module.exports = class phemex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'phemex',
            'name': 'Phemex',
            'countries': [ 'CN' ], // China
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'pro': true,
            'hostname': 'api.phemex.com',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistories': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': true,
                'setMargin': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': undefined,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg',
                'test': {
                    'v1': 'https://testnet-api.phemex.com/v1',
                    'public': 'https://testnet-api.phemex.com/exchange/public',
                    'private': 'https://testnet-api.phemex.com',
                },
                'api': {
                    'v1': 'https://{hostname}/v1',
                    'v2': 'https://{hostname}',
                    'public': 'https://{hostname}/exchange/public',
                    'private': 'https://{hostname}',
                },
                'www': 'https://phemex.com',
                'doc': 'https://github.com/phemex/phemex-api-docs',
                'fees': 'https://phemex.com/fees-conditions',
                'referral': {
                    'url': 'https://phemex.com/register?referralCode=EDNVJ',
                    'discount': 0.1,
                },
            },
            'timeframes': {
                '1m': '60',
                '3m': '180',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '3h': '10800',
                '4h': '14400',
                '6h': '21600',
                '12h': '43200',
                '1d': '86400',
                '1w': '604800',
                '1M': '2592000',
            },
            'api': {
                'public': {
                    'get': [
                        'cfg/v2/products', // spot + contracts
                        'cfg/fundingRates',
                        'products', // contracts only
                        'nomics/trades', // ?market=<symbol>&since=<since>
                        'md/kline', // ?from=1589811875&resolution=1800&symbol=sBTCUSDT&to=1592457935
                        'md/v2/kline/list', // perpetual api ?symbol=<symbol>&to=<to>&from=<from>&resolution=<resolution>
                        'md/v2/kline/last', // perpetual ?symbol=<symbol>&resolution=<resolution>&limit=<limit>
                    ],
                },
                'v1': {
                    'get': [
                        'md/orderbook', // ?symbol=<symbol>&id=<id>
                        'md/trade', // ?symbol=<symbol>&id=<id>
                        'md/ticker/24hr', // ?symbol=<symbol>&id=<id>
                        'md/ticker/24hr/all', // ?id=<id>
                        'md/spot/ticker/24hr', // ?symbol=<symbol>&id=<id>
                        'md/spot/ticker/24hr/all', // ?symbol=<symbol>&id=<id>
                        'exchange/public/products', // contracts only
                    ],
                },
                'v2': {
                    'get': [
                        'md/v2/orderbook', // ?symbol=<symbol>&id=<id>
                        'md/v2/trade', // ?symbol=<symbol>&id=<id>
                        'md/v2/ticker/24hr', // ?symbol=<symbol>&id=<id>
                        'md/v2/ticker/24hr/all', // ?id=<id>
                    ],
                },
                'private': {
                    'get': [
                        // spot
                        'spot/orders/active', // ?symbol=<symbol>&orderID=<orderID>
                        // 'spot/orders/active', // ?symbol=<symbol>&clOrDID=<clOrdID>
                        'spot/orders', // ?symbol=<symbol>
                        'spot/wallets', // ?currency=<currency>
                        'exchange/spot/order', // ?symbol=<symbol>&ordStatus=<ordStatus1,orderStatus2>ordType=<ordType1,orderType2>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'exchange/spot/order/trades', // ?symbol=<symbol>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        // swap
                        'accounts/accountPositions', // ?currency=<currency>
                        'accounts/positions', // ?currency=<currency>
                        'api-data/futures/funding-fees', // ?symbol=<symbol>
                        'orders/activeList', // ?symbol=<symbol>
                        'exchange/order/list', // ?symbol=<symbol>&start=<start>&end=<end>&offset=<offset>&limit=<limit>&ordStatus=<ordStatus>&withCount=<withCount>
                        'exchange/order', // ?symbol=<symbol>&orderID=<orderID1,orderID2>
                        // 'exchange/order', // ?symbol=<symbol>&clOrdID=<clOrdID1,clOrdID2>
                        'exchange/order/trade', // ?symbol=<symbol>&start=<start>&end=<end>&limit=<limit>&offset=<offset>&withCount=<withCount>
                        'phemex-user/users/children', // ?offset=<offset>&limit=<limit>&withCount=<withCount>
                        'phemex-user/wallets/v2/depositAddress', // ?_t=1592722635531&currency=USDT
                        'phemex-user/wallets/tradeAccountDetail', // ?bizCode=&currency=&end=1642443347321&limit=10&offset=0&side=&start=1&type=4&withCount=true
                        'phemex-user/order/closedPositionList', // ?currency=USD&limit=10&offset=0&symbol=&withCount=true
                        'exchange/margins/transfer', // ?start=<start>&end=<end>&offset=<offset>&limit=<limit>&withCount=<withCount>
                        'exchange/wallets/confirm/withdraw', // ?code=<withdrawConfirmCode>
                        'exchange/wallets/withdrawList', // ?currency=<currency>&limit=<limit>&offset=<offset>&withCount=<withCount>
                        'exchange/wallets/depositList', // ?currency=<currency>&offset=<offset>&limit=<limit>
                        'exchange/wallets/v2/depositAddress', // ?currency=<currency>
                        'api-data/spots/funds', // ?currency=<currency>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'assets/convert', // ?startTime=<startTime>&endTime=<endTime>&limit=<limit>&offset=<offset>
                        // transfer
                        'assets/transfer', // ?currency=<currency>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'assets/spots/sub-accounts/transfer', // ?currency=<currency>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'assets/futures/sub-accounts/transfer', // ?currency=<currency>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'assets/quote', // ?fromCurrency=<currency>&toCurrency=<currency>&amountEv=<amount>
                        'assets/convert', // ?fromCurrency=<currency>&toCurrency=<currency>&startTime=<start>&endTime=<end>&limit=<limit>&offset=<offset>
                    ],
                    'post': [
                        // spot
                        'spot/orders',
                        // swap
                        'orders',
                        'positions/assign', // ?symbol=<symbol>&posBalance=<posBalance>&posBalanceEv=<posBalanceEv>
                        'exchange/wallets/transferOut',
                        'exchange/wallets/transferIn',
                        'exchange/margins',
                        'exchange/wallets/createWithdraw', // ?otpCode=<otpCode>
                        'exchange/wallets/cancelWithdraw',
                        'exchange/wallets/createWithdrawAddress', // ?otpCode={optCode}
                        // transfer
                        'assets/transfer',
                        'assets/spots/sub-accounts/transfer', // for sub-account only
                        'assets/futures/sub-accounts/transfer', // for sub-account only
                        'assets/universal-transfer', // for Main account only
                        'assets/convert',
                    ],
                    'put': [
                        // spot
                        'spot/orders', // ?symbol=<symbol>&orderID=<orderID>&origClOrdID=<origClOrdID>&clOrdID=<clOrdID>&priceEp=<priceEp>&baseQtyEV=<baseQtyEV>&quoteQtyEv=<quoteQtyEv>&stopPxEp=<stopPxEp>
                        // swap
                        'orders/replace', // ?symbol=<symbol>&orderID=<orderID>&origClOrdID=<origClOrdID>&clOrdID=<clOrdID>&price=<price>&priceEp=<priceEp>&orderQty=<orderQty>&stopPx=<stopPx>&stopPxEp=<stopPxEp>&takeProfit=<takeProfit>&takeProfitEp=<takeProfitEp>&stopLoss=<stopLoss>&stopLossEp=<stopLossEp>&pegOffsetValueEp=<pegOffsetValueEp>&pegPriceType=<pegPriceType>
                        'positions/leverage', // ?symbol=<symbol>&leverage=<leverage>&leverageEr=<leverageEr>
                        'positions/riskLimit', // ?symbol=<symbol>&riskLimit=<riskLimit>&riskLimitEv=<riskLimitEv>
                    ],
                    'delete': [
                        // spot
                        'spot/orders', // ?symbol=<symbol>&orderID=<orderID>
                        'spot/orders/all', // ?symbol=<symbol>&untriggered=<untriggered>
                        // 'spot/orders', // ?symbol=<symbol>&clOrdID=<clOrdID>
                        // swap
                        'orders/cancel', // ?symbol=<symbol>&orderID=<orderID>
                        'orders', // ?symbol=<symbol>&orderID=<orderID1>,<orderID2>,<orderID3>
                        'orders/all', // ?symbol=<symbol>&untriggered=<untriggered>&text=<text>
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    // not documented
                    '412': BadRequest, // {"code":412,"msg":"Missing parameter - resolution","data":null}
                    '6001': BadRequest, // {"error":{"code":6001,"message":"invalid argument"},"id":null,"result":null}
                    // documented
                    '19999': BadRequest, // REQUEST_IS_DUPLICATED Duplicated request ID
                    '10001': DuplicateOrderId, // OM_DUPLICATE_ORDERID Duplicated order ID
                    '10002': OrderNotFound, // OM_ORDER_NOT_FOUND Cannot find order ID
                    '10003': CancelPending, // OM_ORDER_PENDING_CANCEL Cannot cancel while order is already in pending cancel status
                    '10004': CancelPending, // OM_ORDER_PENDING_REPLACE Cannot cancel while order is already in pending cancel status
                    '10005': CancelPending, // OM_ORDER_PENDING Cannot cancel while order is already in pending cancel status
                    '11001': InsufficientFunds, // TE_NO_ENOUGH_AVAILABLE_BALANCE Insufficient available balance
                    '11002': InvalidOrder, // TE_INVALID_RISK_LIMIT Invalid risk limit value
                    '11003': InsufficientFunds, // TE_NO_ENOUGH_BALANCE_FOR_NEW_RISK_LIMIT Insufficient available balance
                    '11004': InvalidOrder, // TE_INVALID_LEVERAGE invalid input or new leverage is over maximum allowed leverage
                    '11005': InsufficientFunds, // TE_NO_ENOUGH_BALANCE_FOR_NEW_LEVERAGE Insufficient available balance
                    '11006': ExchangeError, // TE_CANNOT_CHANGE_POSITION_MARGIN_WITHOUT_POSITION Position size is zero. Cannot change margin
                    '11007': ExchangeError, // TE_CANNOT_CHANGE_POSITION_MARGIN_FOR_CROSS_MARGIN Cannot change margin under CrossMargin
                    '11008': ExchangeError, // TE_CANNOT_REMOVE_POSITION_MARGIN_MORE_THAN_ADDED exceeds the maximum removable Margin
                    '11009': ExchangeError, // TE_CANNOT_REMOVE_POSITION_MARGIN_DUE_TO_UNREALIZED_PNL exceeds the maximum removable Margin
                    '11010': InsufficientFunds, // TE_CANNOT_ADD_POSITION_MARGIN_DUE_TO_NO_ENOUGH_AVAILABLE_BALANCE Insufficient available balance
                    '11011': InvalidOrder, // TE_REDUCE_ONLY_ABORT Cannot accept reduce only order
                    '11012': InvalidOrder, // TE_REPLACE_TO_INVALID_QTY Order quantity Error
                    '11013': InvalidOrder, // TE_CONDITIONAL_NO_POSITION Position size is zero. Cannot determine conditional order's quantity
                    '11014': InvalidOrder, // TE_CONDITIONAL_CLOSE_POSITION_WRONG_SIDE Close position conditional order has the same side
                    '11015': InvalidOrder, // TE_CONDITIONAL_TRIGGERED_OR_CANCELED
                    '11016': BadRequest, // TE_ADL_NOT_TRADING_REQUESTED_ACCOUNT Request is routed to the wrong trading engine
                    '11017': ExchangeError, // TE_ADL_CANNOT_FIND_POSITION Cannot find requested position on current account
                    '11018': ExchangeError, // TE_NO_NEED_TO_SETTLE_FUNDING The current account does not need to pay a funding fee
                    '11019': ExchangeError, // TE_FUNDING_ALREADY_SETTLED The current account already pays the funding fee
                    '11020': ExchangeError, // TE_CANNOT_TRANSFER_OUT_DUE_TO_BONUS Withdraw to wallet needs to remove all remaining bonus. However if bonus is used by position or order cost, withdraw fails.
                    '11021': ExchangeError, // TE_INVALID_BONOUS_AMOUNT // Grpc command cannot be negative number Invalid bonus amount
                    '11022': AccountSuspended, // TE_REJECT_DUE_TO_BANNED Account is banned
                    '11023': ExchangeError, // TE_REJECT_DUE_TO_IN_PROCESS_OF_LIQ Account is in the process of liquidation
                    '11024': ExchangeError, // TE_REJECT_DUE_TO_IN_PROCESS_OF_ADL Account is in the process of auto-deleverage
                    '11025': BadRequest, // TE_ROUTE_ERROR Request is routed to the wrong trading engine
                    '11026': ExchangeError, // TE_UID_ACCOUNT_MISMATCH
                    '11027': BadSymbol, // TE_SYMBOL_INVALID Invalid number ID or name
                    '11028': BadSymbol, // TE_CURRENCY_INVALID Invalid currency ID or name
                    '11029': ExchangeError, // TE_ACTION_INVALID Unrecognized request type
                    '11030': ExchangeError, // TE_ACTION_BY_INVALID
                    '11031': DDoSProtection, // TE_SO_NUM_EXCEEDS Number of total conditional orders exceeds the max limit
                    '11032': DDoSProtection, // TE_AO_NUM_EXCEEDS Number of total active orders exceeds the max limit
                    '11033': DuplicateOrderId, // TE_ORDER_ID_DUPLICATE Duplicated order ID
                    '11034': InvalidOrder, // TE_SIDE_INVALID Invalid side
                    '11035': InvalidOrder, // TE_ORD_TYPE_INVALID Invalid OrderType
                    '11036': InvalidOrder, // TE_TIME_IN_FORCE_INVALID Invalid TimeInForce
                    '11037': InvalidOrder, // TE_EXEC_INST_INVALID Invalid ExecType
                    '11038': InvalidOrder, // TE_TRIGGER_INVALID Invalid trigger type
                    '11039': InvalidOrder, // TE_STOP_DIRECTION_INVALID Invalid stop direction type
                    '11040': InvalidOrder, // TE_NO_MARK_PRICE Cannot get valid mark price to create conditional order
                    '11041': InvalidOrder, // TE_NO_INDEX_PRICE Cannot get valid index price to create conditional order
                    '11042': InvalidOrder, // TE_NO_LAST_PRICE Cannot get valid last market price to create conditional order
                    '11043': InvalidOrder, // TE_RISING_TRIGGER_DIRECTLY Conditional order would be triggered immediately
                    '11044': InvalidOrder, // TE_FALLING_TRIGGER_DIRECTLY Conditional order would be triggered immediately
                    '11045': InvalidOrder, // TE_TRIGGER_PRICE_TOO_LARGE Conditional order trigger price is too high
                    '11046': InvalidOrder, // TE_TRIGGER_PRICE_TOO_SMALL Conditional order trigger price is too low
                    '11047': InvalidOrder, // TE_BUY_TP_SHOULD_GT_BASE TakeProfile BUY conditional order trigger price needs to be greater than reference price
                    '11048': InvalidOrder, // TE_BUY_SL_SHOULD_LT_BASE StopLoss BUY condition order price needs to be less than the reference price
                    '11049': InvalidOrder, // TE_BUY_SL_SHOULD_GT_LIQ StopLoss BUY condition order price needs to be greater than liquidation price or it will not trigger
                    '11050': InvalidOrder, // TE_SELL_TP_SHOULD_LT_BASE TakeProfile SELL conditional order trigger price needs to be less than reference price
                    '11051': InvalidOrder, // TE_SELL_SL_SHOULD_LT_LIQ StopLoss SELL condition order price needs to be less than liquidation price or it will not trigger
                    '11052': InvalidOrder, // TE_SELL_SL_SHOULD_GT_BASE StopLoss SELL condition order price needs to be greater than the reference price
                    '11053': InvalidOrder, // TE_PRICE_TOO_LARGE
                    '11054': InvalidOrder, // TE_PRICE_WORSE_THAN_BANKRUPT Order price cannot be more aggressive than bankrupt price if this order has instruction to close a position
                    '11055': InvalidOrder, // TE_PRICE_TOO_SMALL Order price is too low
                    '11056': InvalidOrder, // TE_QTY_TOO_LARGE Order quantity is too large
                    '11057': InvalidOrder, // TE_QTY_NOT_MATCH_REDUCE_ONLY Does not allow ReduceOnly order without position
                    '11058': InvalidOrder, // TE_QTY_TOO_SMALL Order quantity is too small
                    '11059': InvalidOrder, // TE_TP_SL_QTY_NOT_MATCH_POS Position size is zero. Cannot accept any TakeProfit or StopLoss order
                    '11060': InvalidOrder, // TE_SIDE_NOT_CLOSE_POS TakeProfit or StopLoss order has wrong side. Cannot close position
                    '11061': CancelPending, // TE_ORD_ALREADY_PENDING_CANCEL Repeated cancel request
                    '11062': InvalidOrder, // TE_ORD_ALREADY_CANCELED Order is already canceled
                    '11063': InvalidOrder, // TE_ORD_STATUS_CANNOT_CANCEL Order is not able to be canceled under current status
                    '11064': InvalidOrder, // TE_ORD_ALREADY_PENDING_REPLACE Replace request is rejected because order is already in pending replace status
                    '11065': InvalidOrder, // TE_ORD_REPLACE_NOT_MODIFIED Replace request does not modify any parameters of the order
                    '11066': InvalidOrder, // TE_ORD_STATUS_CANNOT_REPLACE Order is not able to be replaced under current status
                    '11067': InvalidOrder, // TE_CANNOT_REPLACE_PRICE Market conditional order cannot change price
                    '11068': InvalidOrder, // TE_CANNOT_REPLACE_QTY Condtional order for closing position cannot change order quantity, since the order quantity is determined by position size already
                    '11069': ExchangeError, // TE_ACCOUNT_NOT_IN_RANGE The account ID in the request is not valid or is not in the range of the current process
                    '11070': BadSymbol, // TE_SYMBOL_NOT_IN_RANGE The symbol is invalid
                    '11071': InvalidOrder, // TE_ORD_STATUS_CANNOT_TRIGGER
                    '11072': InvalidOrder, // TE_TKFR_NOT_IN_RANGE The fee value is not valid
                    '11073': InvalidOrder, // TE_MKFR_NOT_IN_RANGE The fee value is not valid
                    '11074': InvalidOrder, // TE_CANNOT_ATTACH_TP_SL Order request cannot contain TP/SL parameters when the account already has positions
                    '11075': InvalidOrder, // TE_TP_TOO_LARGE TakeProfit price is too large
                    '11076': InvalidOrder, // TE_TP_TOO_SMALL TakeProfit price is too small
                    '11077': InvalidOrder, // TE_TP_TRIGGER_INVALID Invalid trigger type
                    '11078': InvalidOrder, // TE_SL_TOO_LARGE StopLoss price is too large
                    '11079': InvalidOrder, // TE_SL_TOO_SMALL StopLoss price is too small
                    '11080': InvalidOrder, // TE_SL_TRIGGER_INVALID Invalid trigger type
                    '11081': InvalidOrder, // TE_RISK_LIMIT_EXCEEDS Total potential position breaches current risk limit
                    '11082': InsufficientFunds, // TE_CANNOT_COVER_ESTIMATE_ORDER_LOSS The remaining balance cannot cover the potential unrealized PnL for this new order
                    '11083': InvalidOrder, // TE_TAKE_PROFIT_ORDER_DUPLICATED TakeProfit order already exists
                    '11084': InvalidOrder, // TE_STOP_LOSS_ORDER_DUPLICATED StopLoss order already exists
                    '11085': DuplicateOrderId, // TE_CL_ORD_ID_DUPLICATE ClOrdId is duplicated
                    '11086': InvalidOrder, // TE_PEG_PRICE_TYPE_INVALID PegPriceType is invalid
                    '11087': InvalidOrder, // TE_BUY_TS_SHOULD_LT_BASE The trailing order's StopPrice should be less than the current last price
                    '11088': InvalidOrder, // TE_BUY_TS_SHOULD_GT_LIQ The traling order's StopPrice should be greater than the current liquidation price
                    '11089': InvalidOrder, // TE_SELL_TS_SHOULD_LT_LIQ The traling order's StopPrice should be greater than the current last price
                    '11090': InvalidOrder, // TE_SELL_TS_SHOULD_GT_BASE The traling order's StopPrice should be less than the current liquidation price
                    '11091': InvalidOrder, // TE_BUY_REVERT_VALUE_SHOULD_LT_ZERO The PegOffset should be less than zero
                    '11092': InvalidOrder, // TE_SELL_REVERT_VALUE_SHOULD_GT_ZERO The PegOffset should be greater than zero
                    '11093': InvalidOrder, // TE_BUY_TTP_SHOULD_ACTIVATE_ABOVE_BASE The activation price should be greater than the current last price
                    '11094': InvalidOrder, // TE_SELL_TTP_SHOULD_ACTIVATE_BELOW_BASE The activation price should be less than the current last price
                    '11095': InvalidOrder, // TE_TRAILING_ORDER_DUPLICATED A trailing order exists already
                    '11096': InvalidOrder, // TE_CLOSE_ORDER_CANNOT_ATTACH_TP_SL An order to close position cannot have trailing instruction
                    '11097': BadRequest, // TE_CANNOT_FIND_WALLET_OF_THIS_CURRENCY This crypto is not supported
                    '11098': BadRequest, // TE_WALLET_INVALID_ACTION Invalid action on wallet
                    '11099': ExchangeError, // TE_WALLET_VID_UNMATCHED Wallet operation request has a wrong wallet vid
                    '11100': InsufficientFunds, // TE_WALLET_INSUFFICIENT_BALANCE Wallet has insufficient balance
                    '11101': InsufficientFunds, // TE_WALLET_INSUFFICIENT_LOCKED_BALANCE Locked balance in wallet is not enough for unlock/withdraw request
                    '11102': BadRequest, // TE_WALLET_INVALID_DEPOSIT_AMOUNT Deposit amount must be greater than zero
                    '11103': BadRequest, // TE_WALLET_INVALID_WITHDRAW_AMOUNT Withdraw amount must be less than zero
                    '11104': BadRequest, // TE_WALLET_REACHED_MAX_AMOUNT Deposit makes wallet exceed max amount allowed
                    '11105': InsufficientFunds, // TE_PLACE_ORDER_INSUFFICIENT_BASE_BALANCE Insufficient funds in base wallet
                    '11106': InsufficientFunds, // TE_PLACE_ORDER_INSUFFICIENT_QUOTE_BALANCE Insufficient funds in quote wallet
                    '11107': ExchangeError, // TE_CANNOT_CONNECT_TO_REQUEST_SEQ TradingEngine failed to connect with CrossEngine
                    '11108': InvalidOrder, // TE_CANNOT_REPLACE_OR_CANCEL_MARKET_ORDER Cannot replace/amend market order
                    '11109': InvalidOrder, // TE_CANNOT_REPLACE_OR_CANCEL_IOC_ORDER Cannot replace/amend ImmediateOrCancel order
                    '11110': InvalidOrder, // TE_CANNOT_REPLACE_OR_CANCEL_FOK_ORDER Cannot replace/amend FillOrKill order
                    '11111': InvalidOrder, // TE_MISSING_ORDER_ID OrderId is missing
                    '11112': InvalidOrder, // TE_QTY_TYPE_INVALID QtyType is invalid
                    '11113': BadRequest, // TE_USER_ID_INVALID UserId is invalid
                    '11114': InvalidOrder, // TE_ORDER_VALUE_TOO_LARGE Order value is too large
                    '11115': InvalidOrder, // TE_ORDER_VALUE_TOO_SMALL Order value is too small
                    '11116': InvalidOrder, // TE_BO_NUM_EXCEEDS Details: the total count of brakcet orders should equal or less than 5
                    '11117': InvalidOrder, // TE_BO_CANNOT_HAVE_BO_WITH_DIFF_SIDE Details: all bracket orders should have the same Side.
                    '11118': InvalidOrder, // TE_BO_TP_PRICE_INVALID Details: bracker order take profit price is invalid
                    '11119': InvalidOrder, // TE_BO_SL_PRICE_INVALID Details: bracker order stop loss price is invalid
                    '11120': InvalidOrder, // TE_BO_SL_TRIGGER_PRICE_INVALID Details: bracker order stop loss trigger price is invalid
                    '11121': InvalidOrder, // TE_BO_CANNOT_REPLACE Details: cannot replace bracket order.
                    '11122': InvalidOrder, // TE_BO_BOTP_STATUS_INVALID Details: bracket take profit order status is invalid
                    '11123': InvalidOrder, // TE_BO_CANNOT_PLACE_BOTP_OR_BOSL_ORDER Details: cannot place bracket take profit order
                    '11124': InvalidOrder, // TE_BO_CANNOT_REPLACE_BOTP_OR_BOSL_ORDER Details: cannot place bracket stop loss order
                    '11125': InvalidOrder, // TE_BO_CANNOT_CANCEL_BOTP_OR_BOSL_ORDER Details: cannot cancel bracket sl/tp order
                    '11126': InvalidOrder, // TE_BO_DONOT_SUPPORT_API Details: doesn't support bracket order via API
                    '11128': InvalidOrder, // TE_BO_INVALID_EXECINST Details: ExecInst value is invalid
                    '11129': InvalidOrder, // TE_BO_MUST_BE_SAME_SIDE_AS_POS Details: bracket order should have the same side as position's side
                    '11130': InvalidOrder, // TE_BO_WRONG_SL_TRIGGER_TYPE Details: bracket stop loss order trigger type is invalid
                    '11131': InvalidOrder, // TE_BO_WRONG_TP_TRIGGER_TYPE Details: bracket take profit order trigger type is invalid
                    '11132': InvalidOrder, // TE_BO_ABORT_BOSL_DUE_BOTP_CREATE_FAILED Details: cancel bracket stop loss order due failed to create take profit order.
                    '11133': InvalidOrder, // TE_BO_ABORT_BOSL_DUE_BOPO_CANCELED Details: cancel bracket stop loss order due main order canceled.
                    '11134': InvalidOrder, // TE_BO_ABORT_BOTP_DUE_BOPO_CANCELED Details: cancel bracket take profit order due main order canceled.
                    // not documented
                    '30000': BadRequest, // {"code":30000,"msg":"Please double check input arguments","data":null}
                    '30018': BadRequest, // {"code":30018,"msg":"phemex.data.size.uplimt","data":null}
                    '34003': PermissionDenied, // {"code":34003,"msg":"Access forbidden","data":null}
                    '35104': InsufficientFunds, // {"code":35104,"msg":"phemex.spot.wallet.balance.notenough","data":null}
                    '39995': RateLimitExceeded, // {"code": "39995","msg": "Too many requests."}
                    '39996': PermissionDenied, // {"code": "39996","msg": "Access denied."}
                },
                'broad': {
                    '401 Insufficient privilege': PermissionDenied, // {"code": "401","msg": "401 Insufficient privilege."}
                    '401 Request IP mismatch': PermissionDenied, // {"code": "401","msg": "401 Request IP mismatch."}
                    'Failed to find api-key': AuthenticationError, // {"msg":"Failed to find api-key 1c5ec63fd-660d-43ea-847a-0d3ba69e106e","code":10500}
                    'Missing required parameter': BadRequest, // {"msg":"Missing required parameter","code":10500}
                    'API Signature verification failed': AuthenticationError, // {"msg":"API Signature verification failed.","code":10500}
                    'Api key not found': AuthenticationError, // {"msg":"Api key not found 698dc9e3-6faa-4910-9476-12857e79e198","code":"10500"}
                },
            },
            'options': {
                'brokerId': 'ccxt2022',
                'x-phemex-request-expiry': 60, // in seconds
                'createOrderByQuoteRequiresPrice': true,
                'networks': {
                    'TRC20': 'TRX',
                    'ERC20': 'ETH',
                },
                'defaultNetworks': {
                    'USDT': 'ETH',
                },
                'defaultSubType': 'linear',
                'accountsByType': {
                    'spot': 'spot',
                    'swap': 'future',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
            },
        });
    }

    parseSafeNumber (value = undefined) {
        if (value === undefined) {
            return value;
        }
        let parts = value.split (',');
        value = parts.join ('');
        parts = value.split (' ');
        return this.safeNumber (parts, 0);
    }

    parseSwapMarket (market) {
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "displaySymbol":"BTC / USD",
        //         "indexSymbol":".BTC",
        //         "markSymbol":".MBTC",
        //         "fundingRateSymbol":".BTCFR",
        //         "fundingRate8hSymbol":".BTCFR8H",
        //         "contractUnderlyingAssets":"USD",
        //         "settleCurrency":"BTC",
        //         "quoteCurrency":"USD",
        //         "contractSize":"1 USD",
        //         "lotSize":1,
        //         "tickSize":0.5,
        //         "priceScale":4,
        //         "ratioScale":8,
        //         "pricePrecision":1,
        //         "minPriceEp":5000,
        //         "maxPriceEp":10000000000,
        //         "maxOrderQty":1000000,
        //         "type":"Perpetual",
        //         "status":"Listed",
        //         "tipOrderQty":1000000,
        //         "steps":"50",
        //         "riskLimits":[
        //             {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //             {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //             {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //         ],
        //         "underlyingSymbol":".BTC",
        //         "baseCurrency":"BTC",
        //         "settlementCurrency":"BTC",
        //         "valueScale":8,
        //         "defaultLeverage":0,
        //         "maxLeverage":100,
        //         "initMarginEr":"1000000",
        //         "maintMarginEr":"500000",
        //         "defaultRiskLimitEv":10000000000,
        //         "deleverage":true,
        //         "makerFeeRateEr":-250000,
        //         "takerFeeRateEr":750000,
        //         "fundingInterval":8,
        //         "marketUrl":"https://phemex.com/trade/BTCUSD",
        //         "description":"BTCUSD is a BTC/USD perpetual contract priced on the .BTC Index. Each contract is worth 1 USD of Bitcoin. Funding is paid and received every 8 hours. At UTC time: 00:00, 08:00, 16:00.",
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString2 (market, 'baseCurrency', 'contractUnderlyingAssets');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const settleId = this.safeString (market, 'settleCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let inverse = false;
        if (settleId !== quoteId) {
            inverse = true;
        }
        const priceScale = this.safeInteger (market, 'priceScale');
        const ratioScale = this.safeInteger (market, 'ratioScale');
        const valueScale = this.safeInteger (market, 'valueScale');
        const minPriceEp = this.safeString (market, 'minPriceEp');
        const maxPriceEp = this.safeString (market, 'maxPriceEp');
        const makerFeeRateEr = this.safeString (market, 'makerFeeRateEr');
        const takerFeeRateEr = this.safeString (market, 'takerFeeRateEr');
        const status = this.safeString (market, 'status');
        const contractSizeString = this.safeString (market, 'contractSize', ' ');
        let contractSize = undefined;
        if (contractSizeString.indexOf (' ')) {
            // "1 USD"
            // "0.005 ETH"
            const parts = contractSizeString.split (' ');
            contractSize = this.parseNumber (parts[0]);
        } else {
            // "1.0"
            contractSize = this.parseNumber (contractSizeString);
        }
        return {
            'id': id,
            'symbol': base + '/' + quote + ':' + settle,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': status === 'Listed',
            'contract': true,
            'linear': !inverse,
            'inverse': inverse,
            'taker': this.parseNumber (this.fromEn (takerFeeRateEr, ratioScale)),
            'maker': this.parseNumber (this.fromEn (makerFeeRateEr, ratioScale)),
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'priceScale': priceScale,
            'valueScale': valueScale,
            'ratioScale': ratioScale,
            'precision': {
                'amount': this.safeNumber (market, 'lotSize'),
                'price': this.safeNumber (market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.safeNumber (market, 'maxLeverage'),
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': this.parseNumber (this.fromEn (minPriceEp, priceScale)),
                    'max': this.parseNumber (this.fromEn (maxPriceEp, priceScale)),
                },
                'cost': {
                    'min': undefined,
                    'max': this.parseNumber (this.safeString (market, 'maxOrderQty')),
                },
            },
            'info': market,
        };
    }

    parseSpotMarket (market) {
        //
        //     {
        //         "symbol":"sBTCUSDT",
        //         "displaySymbol":"BTC / USDT",
        //         "quoteCurrency":"USDT",
        //         "pricePrecision":2,
        //         "type":"Spot",
        //         "baseCurrency":"BTC",
        //         "baseTickSize":"0.000001 BTC",
        //         "baseTickSizeEv":100,
        //         "quoteTickSize":"0.01 USDT",
        //         "quoteTickSizeEv":1000000,
        //         "minOrderValue":"10 USDT",
        //         "minOrderValueEv":1000000000,
        //         "maxBaseOrderSize":"1000 BTC",
        //         "maxBaseOrderSizeEv":100000000000,
        //         "maxOrderValue":"5,000,000 USDT",
        //         "maxOrderValueEv":500000000000000,
        //         "defaultTakerFee":"0.001",
        //         "defaultTakerFeeEr":100000,
        //         "defaultMakerFee":"0.001",
        //         "defaultMakerFeeEr":100000,
        //         "baseQtyPrecision":6,
        //         "quoteQtyPrecision":2,
        //         "status":"Listed",
        //         "tipOrderQty":20
        //     }
        //
        const type = this.safeStringLower (market, 'type');
        const id = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const baseId = this.safeString (market, 'baseCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const status = this.safeString (market, 'status');
        const precisionAmount = this.parseSafeNumber (this.safeString (market, 'baseTickSize'));
        const precisionPrice = this.parseSafeNumber (this.safeString (market, 'quoteTickSize'));
        return {
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': type,
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': status === 'Listed',
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber (market, 'defaultTakerFee'),
            'maker': this.safeNumber (market, 'defaultMakerFee'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'priceScale': 8,
            'valueScale': 8,
            'ratioScale': 8,
            'precision': {
                'amount': precisionAmount,
                'price': precisionPrice,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': precisionAmount,
                    'max': this.parseSafeNumber (this.safeString (market, 'maxBaseOrderSize')),
                },
                'price': {
                    'min': precisionPrice,
                    'max': undefined,
                },
                'cost': {
                    'min': this.parseSafeNumber (this.safeString (market, 'minOrderValue')),
                    'max': this.parseSafeNumber (this.safeString (market, 'maxOrderValue')),
                },
            },
            'info': market,
        };
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name phemex#fetchMarkets
         * @description retrieves data on all markets for phemex
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const v2Products = await this.publicGetCfgV2Products (params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "ratioScale":8,
        //             "currencies":[
        //                 {"currency":"BTC","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"Bitcoin"},
        //                 {"currency":"USD","valueScale":4,"minValueEv":1,"maxValueEv":500000000000000,"name":"USD"},
        //                 {"currency":"USDT","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"TetherUS"},
        //             ],
        //             "products":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "displaySymbol":"BTC / USD",
        //                     "indexSymbol":".BTC",
        //                     "markSymbol":".MBTC",
        //                     "fundingRateSymbol":".BTCFR",
        //                     "fundingRate8hSymbol":".BTCFR8H",
        //                     "contractUnderlyingAssets":"USD",
        //                     "settleCurrency":"BTC",
        //                     "quoteCurrency":"USD",
        //                     "contractSize":1.0,
        //                     "lotSize":1,
        //                     "tickSize":0.5,
        //                     "priceScale":4,
        //                     "ratioScale":8,
        //                     "pricePrecision":1,
        //                     "minPriceEp":5000,
        //                     "maxPriceEp":10000000000,
        //                     "maxOrderQty":1000000,
        //                     "type":"Perpetual"
        //                 },
        //                 {
        //                     "symbol":"sBTCUSDT",
        //                     "displaySymbol":"BTC / USDT",
        //                     "quoteCurrency":"USDT",
        //                     "pricePrecision":2,
        //                     "type":"Spot",
        //                     "baseCurrency":"BTC",
        //                     "baseTickSize":"0.000001 BTC",
        //                     "baseTickSizeEv":100,
        //                     "quoteTickSize":"0.01 USDT",
        //                     "quoteTickSizeEv":1000000,
        //                     "minOrderValue":"10 USDT",
        //                     "minOrderValueEv":1000000000,
        //                     "maxBaseOrderSize":"1000 BTC",
        //                     "maxBaseOrderSizeEv":100000000000,
        //                     "maxOrderValue":"5,000,000 USDT",
        //                     "maxOrderValueEv":500000000000000,
        //                     "defaultTakerFee":"0.001",
        //                     "defaultTakerFeeEr":100000,
        //                     "defaultMakerFee":"0.001",
        //                     "defaultMakerFeeEr":100000,
        //                     "baseQtyPrecision":6,
        //                     "quoteQtyPrecision":2
        //                 },
        //             ],
        //             "riskLimits":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "steps":"50",
        //                     "riskLimits":[
        //                         {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //                         {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //                         {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //                     ]
        //                 },
        //             ],
        //             "leverages":[
        //                 {"initialMargin":"1.0%","initialMarginEr":1000000,"options":[1,2,3,5,10,25,50,100]},
        //                 {"initialMargin":"1.5%","initialMarginEr":1500000,"options":[1,2,3,5,10,25,50,66]},
        //                 {"initialMargin":"2.0%","initialMarginEr":2000000,"options":[1,2,3,5,10,25,33,50]},
        //             ]
        //         }
        //     }
        //
        const v1Products = await this.v1GetExchangePublicProducts (params);
        const v1ProductsData = this.safeValue (v1Products, 'data', []);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":[
        //             {
        //                 "symbol":"BTCUSD",
        //                 "underlyingSymbol":".BTC",
        //                 "quoteCurrency":"USD",
        //                 "baseCurrency":"BTC",
        //                 "settlementCurrency":"BTC",
        //                 "maxOrderQty":1000000,
        //                 "maxPriceEp":100000000000000,
        //                 "lotSize":1,
        //                 "tickSize":"0.5",
        //                 "contractSize":"1 USD",
        //                 "priceScale":4,
        //                 "ratioScale":8,
        //                 "valueScale":8,
        //                 "defaultLeverage":0,
        //                 "maxLeverage":100,
        //                 "initMarginEr":"1000000",
        //                 "maintMarginEr":"500000",
        //                 "defaultRiskLimitEv":10000000000,
        //                 "deleverage":true,
        //                 "makerFeeRateEr":-250000,
        //                 "takerFeeRateEr":750000,
        //                 "fundingInterval":8,
        //                 "marketUrl":"https://phemex.com/trade/BTCUSD",
        //                 "description":"BTCUSD is a BTC/USD perpetual contract priced on the .BTC Index. Each contract is worth 1 USD of Bitcoin. Funding is paid and received every 8 hours. At UTC time: 00:00, 08:00, 16:00.",
        //                 "type":"Perpetual"
        //             },
        //         ]
        //     }
        //
        const v2ProductsData = this.safeValue (v2Products, 'data', {});
        const products = this.safeValue (v2ProductsData, 'products', []);
        const riskLimits = this.safeValue (v2ProductsData, 'riskLimits', []);
        const riskLimitsById = this.indexBy (riskLimits, 'symbol');
        const v1ProductsById = this.indexBy (v1ProductsData, 'symbol');
        const result = [];
        for (let i = 0; i < products.length; i++) {
            let market = products[i];
            const type = this.safeStringLower (market, 'type');
            if ((type === 'perpetual') || (type === 'perpetualv2')) {
                const id = this.safeString (market, 'symbol');
                const riskLimitValues = this.safeValue (riskLimitsById, id, {});
                market = this.extend (market, riskLimitValues);
                const v1ProductsValues = this.safeValue (v1ProductsById, id, {});
                market = this.extend (market, v1ProductsValues);
                market = this.parseSwapMarket (market);
            } else {
                market = this.parseSpotMarket (market);
            }
            result.push (market);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name phemex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCfgV2Products (params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             ...,
        //             "currencies":[
        //                 {"currency":"BTC","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"Bitcoin"},
        //                 {"currency":"USD","valueScale":4,"minValueEv":1,"maxValueEv":500000000000000,"name":"USD"},
        //                 {"currency":"USDT","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"TetherUS"},
        //             ],
        //             ...
        //         }
        //     }
        const data = this.safeValue (response, 'data', {});
        const currencies = this.safeValue (data, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currency');
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (id);
            const valueScaleString = this.safeString (currency, 'valueScale');
            const valueScale = parseInt (valueScaleString);
            const minValueEv = this.safeString (currency, 'minValueEv');
            const maxValueEv = this.safeString (currency, 'maxValueEv');
            let minAmount = undefined;
            let maxAmount = undefined;
            let precision = undefined;
            if (valueScale !== undefined) {
                const precisionString = this.parsePrecision (valueScaleString);
                precision = this.parseNumber (precisionString);
                minAmount = this.parseNumber (Precise.stringMul (minValueEv, precisionString));
                maxAmount = this.parseNumber (Precise.stringMul (maxValueEv, precisionString));
            }
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': maxAmount,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'valueScale': valueScale,
            };
        }
        return result;
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1, market = undefined) {
        if (market === undefined) {
            throw new ArgumentsRequired (this.id + ' parseBidAsk() requires a market argument');
        }
        let amount = this.safeString (bidask, amountKey);
        if (market['spot']) {
            amount = this.fromEv (amount, market);
        }
        return [
            this.parseNumber (this.fromEp (this.safeString (bidask, priceKey), market)),
            this.parseNumber (amount),
        ];
    }

    parseOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market = undefined) {
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        const sides = [ bidsKey, asksKey ];
        for (let i = 0; i < sides.length; i++) {
            const side = sides[i];
            const orders = [];
            const bidasks = this.safeValue (orderbook, side);
            for (let k = 0; k < bidasks.length; k++) {
                orders.push (this.parseBidAsk (bidasks[k], priceKey, amountKey, market));
            }
            result[side] = orders;
        }
        result[bidsKey] = this.sortBy (result[bidsKey], 0, true);
        result[asksKey] = this.sortBy (result[asksKey], 0);
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        const response = await this.v1GetMdOrderbook (this.extend (request, params));
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "book": {
        //                 "asks": [
        //                     [ 23415000000, 105262000 ],
        //                     [ 23416000000, 147914000 ],
        //                     [ 23419000000, 160914000 ],
        //                 ],
        //                 "bids": [
        //                     [ 23360000000, 32995000 ],
        //                     [ 23359000000, 221887000 ],
        //                     [ 23356000000, 284599000 ],
        //                 ],
        //             },
        //             "depth": 30,
        //             "sequence": 1592059928,
        //             "symbol": "sETHUSDT",
        //             "timestamp": 1592387340020000955,
        //             "type": "snapshot"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const book = this.safeValue (result, 'book', {});
        const timestamp = this.safeIntegerProduct (result, 'timestamp', 0.000001);
        const orderbook = this.parseOrderBook (book, symbol, timestamp, 'bids', 'asks', 0, 1, market);
        orderbook['nonce'] = this.safeInteger (result, 'sequence');
        return orderbook;
    }

    toEn (n, scale) {
        const stringN = n.toString ();
        const precise = new Precise (stringN);
        precise.decimals = precise.decimals - scale;
        precise.reduce ();
        const stringValue = precise.toString ();
        return parseInt (parseFloat (stringValue));
    }

    toEv (amount, market = undefined) {
        if ((amount === undefined) || (market === undefined)) {
            return amount;
        }
        return this.toEn (amount, market['valueScale']);
    }

    toEp (price, market = undefined) {
        if ((price === undefined) || (market === undefined)) {
            return price;
        }
        return this.toEn (price, market['priceScale']);
    }

    fromEn (en, scale) {
        if (en === undefined) {
            return undefined;
        }
        const precise = new Precise (en);
        precise.decimals = this.sum (precise.decimals, scale);
        precise.reduce ();
        return precise.toString ();
    }

    fromEp (ep, market = undefined) {
        if ((ep === undefined) || (market === undefined)) {
            return ep;
        }
        return this.fromEn (ep, this.safeInteger (market, 'priceScale'));
    }

    fromEv (ev, market = undefined) {
        if ((ev === undefined) || (market === undefined)) {
            return ev;
        }
        return this.fromEn (ev, this.safeInteger (market, 'valueScale'));
    }

    fromEr (er, market = undefined) {
        if ((er === undefined) || (market === undefined)) {
            return er;
        }
        return this.fromEn (er, this.safeInteger (market, 'ratioScale'));
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1592467200, // timestamp
        //         300, // interval
        //         23376000000, // last
        //         23322000000, // open
        //         23381000000, // high
        //         23315000000, // low
        //         23367000000, // close
        //         208671000, // base volume
        //         48759063370, // quote volume
        //     ]
        //
        let baseVolume = undefined;
        if ((market !== undefined) && market['spot']) {
            baseVolume = this.parseNumber (this.fromEv (this.safeString (ohlcv, 7), market));
        } else {
            baseVolume = this.safeNumber (ohlcv, 7);
        }
        return [
            this.safeTimestamp (ohlcv, 0),
            this.parseNumber (this.fromEp (this.safeString (ohlcv, 3), market)),
            this.parseNumber (this.fromEp (this.safeString (ohlcv, 4), market)),
            this.parseNumber (this.fromEp (this.safeString (ohlcv, 5), market)),
            this.parseNumber (this.fromEp (this.safeString (ohlcv, 6), market)),
            baseVolume,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const request = {
            // 'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
            // 'from': 1588830682, // seconds
            // 'to': this.seconds (),
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.seconds ();
        const maxLimit = 2000; // maximum limit, we shouldn't sent request of more than it
        if (limit === undefined) {
            limit = 100; // set default, as exchange doesn't have any defaults and needs something to be set
        } else {
            limit = Math.min (limit, maxLimit);
        }
        if (since !== undefined) {
            limit = Math.min (limit, maxLimit);
            since = parseInt (since / 1000);
            request['from'] = since;
            // time ranges ending in the future are not accepted
            // https://github.com/ccxt/ccxt/issues/8050
            request['to'] = Math.min (now, this.sum (since, duration * limit));
        } else {
            if (limit < maxLimit) {
                // whenever making a request with `now`, that expects current latest bar to be included, the exchange does not return the last 1m candle and thus excludes one bar. So, we have to add `1` to user's set `limit` amount to get that amount of bars back
                limit = limit + 1;
            }
            request['from'] = now - duration * limit;
            request['to'] = now;
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        request['symbol'] = market['id'];
        const response = await this.publicGetMdKline (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "total":-1,
        //             "rows":[
        //                 [1592467200,300,23376000000,23322000000,23381000000,23315000000,23367000000,208671000,48759063370],
        //                 [1592467500,300,23367000000,23314000000,23390000000,23311000000,23331000000,234820000,54848948710],
        //                 [1592467800,300,23331000000,23385000000,23391000000,23326000000,23387000000,152931000,35747882250],
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeValue (data, 'rows', []);
        return this.parseOHLCVs (rows, market, timeframe, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "askEp": 943836000000,
        //         "bidEp": 943601000000,
        //         "highEp": 955946000000,
        //         "lastEp": 943803000000,
        //         "lowEp": 924973000000,
        //         "openEp": 948693000000,
        //         "symbol": "sBTCUSDT",
        //         "timestamp": 1592471203505728630,
        //         "turnoverEv": 111822826123103,
        //         "volumeEv": 11880532281
        //     }
        //
        // swap
        //
        //     {
        //         "askEp": 2332500,
        //         "bidEp": 2331000,
        //         "fundingRateEr": 10000,
        //         "highEp": 2380000,
        //         "indexEp": 2329057,
        //         "lastEp": 2331500,
        //         "lowEp": 2274000,
        //         "markEp": 2329232,
        //         "openEp": 2337500,
        //         "openInterest": 1298050,
        //         "predFundingRateEr": 19921,
        //         "symbol": "ETHUSD",
        //         "timestamp": 1592474241582701416,
        //         "turnoverEv": 47228362330,
        //         "volume": 4053863
        //     }
        // linear swap v2
        //
        //     {
        //         "closeRp":"16820.5",
        //         "fundingRateRr":"0.0001",
        //         "highRp":"16962.1",
        //         "indexPriceRp":"16830.15651565",
        //         "lowRp":"16785",
        //         "markPriceRp":"16830.97534951",
        //         "openInterestRv":"1323.596",
        //         "openRp":"16851.7",
        //         "predFundingRateRr":"0.0001",
        //         "symbol":"BTCUSDT",
        //         "timestamp":"1672142789065593096",
        //         "turnoverRv":"124835296.0538",
        //         "volumeRq":"7406.95"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct (ticker, 'timestamp', 0.000001);
        const last = this.fromEp (this.safeString2 (ticker, 'lastEp', 'closeRp'), market);
        const quoteVolume = this.fromEv (this.safeString2 (ticker, 'turnoverEv', 'turnoverRv'), market);
        let baseVolume = this.safeString (ticker, 'volume');
        if (baseVolume === undefined) {
            baseVolume = this.fromEv (this.safeString2 (ticker, 'volumeEv', 'volumeRq'), market);
        }
        const open = this.fromEp (this.safeString (ticker, 'openEp'), market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.fromEp (this.safeString2 (ticker, 'highEp', 'highRp'), market),
            'low': this.fromEp (this.safeString2 (ticker, 'lowEp', 'lowRp'), market),
            'bid': this.fromEp (this.safeString (ticker, 'bidEp'), market),
            'bidVolume': undefined,
            'ask': this.fromEp (this.safeString (ticker, 'askEp'), market),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name phemex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        let method = 'v1GetMdSpotTicker24hr';
        if (market['swap']) {
            if (market['inverse'] || market['settle'] === 'USD') {
                method = 'v1GetMdTicker24hr';
            } else {
                method = 'v2GetMdV2Ticker24hr';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "askEp": 943836000000,
        //             "bidEp": 943601000000,
        //             "highEp": 955946000000,
        //             "lastEp": 943803000000,
        //             "lowEp": 924973000000,
        //             "openEp": 948693000000,
        //             "symbol": "sBTCUSDT",
        //             "timestamp": 1592471203505728630,
        //             "turnoverEv": 111822826123103,
        //             "volumeEv": 11880532281
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "askEp": 2332500,
        //             "bidEp": 2331000,
        //             "fundingRateEr": 10000,
        //             "highEp": 2380000,
        //             "indexEp": 2329057,
        //             "lastEp": 2331500,
        //             "lowEp": 2274000,
        //             "markEp": 2329232,
        //             "openEp": 2337500,
        //             "openInterest": 1298050,
        //             "predFundingRateEr": 19921,
        //             "symbol": "ETHUSD",
        //             "timestamp": 1592474241582701416,
        //             "turnoverEv": 47228362330,
        //             "volume": 4053863
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTicker (result, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        const response = await this.v1GetMdTrade (this.extend (request, params));
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "sequence": 1315644947,
        //             "symbol": "BTCUSD",
        //             "trades": [
        //                 [ 1592541746712239749, 13156448570000, "Buy", 93070000, 40173 ],
        //                 [ 1592541740434625085, 13156447110000, "Sell", 93065000, 5000 ],
        //                 [ 1592541732958241616, 13156441390000, "Buy", 93070000, 3460 ],
        //             ],
        //             "type": "snapshot"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     [
        //         1592541746712239749,
        //         13156448570000,
        //         "Buy",
        //         93070000,
        //         40173
        //     ]
        //
        // fetchMyTrades (private)
        //
        // spot
        //
        //     {
        //         "qtyType": "ByQuote",
        //         "transactTimeNs": 1589450974800550100,
        //         "clOrdID": "8ba59d40-df25-d4b0-14cf-0703f44e9690",
        //         "orderID": "b2b7018d-f02f-4c59-b4cf-051b9c2d2e83",
        //         "symbol": "sBTCUSDT",
        //         "side": "Buy",
        //         "priceEP": 970056000000,
        //         "baseQtyEv": 0,
        //         "quoteQtyEv": 1000000000,
        //         "action": "New",
        //         "execStatus": "MakerFill",
        //         "ordStatus": "Filled",
        //         "ordType": "Limit",
        //         "execInst": "None",
        //         "timeInForce": "GoodTillCancel",
        //         "stopDirection": "UNSPECIFIED",
        //         "tradeType": "Trade",
        //         "stopPxEp": 0,
        //         "execId": "c6bd8979-07ba-5946-b07e-f8b65135dbb1",
        //         "execPriceEp": 970056000000,
        //         "execBaseQtyEv": 103000,
        //         "execQuoteQtyEv": 999157680,
        //         "leavesBaseQtyEv": 0,
        //         "leavesQuoteQtyEv": 0,
        //         "execFeeEv": 0,
        //         "feeRateEr": 0
        //     }
        //
        // swap
        //
        //     {
        //         "transactTimeNs": 1578026629824704800,
        //         "symbol": "BTCUSD",
        //         "currency": "BTC",
        //         "action": "Replace",
        //         "side": "Sell",
        //         "tradeType": "Trade",
        //         "execQty": 700,
        //         "execPriceEp": 71500000,
        //         "orderQty": 700,
        //         "priceEp": 71500000,
        //         "execValueEv": 9790209,
        //         "feeRateEr": -25000,
        //         "execFeeEv": -2447,
        //         "ordType": "Limit",
        //         "execID": "b01671a1-5ddc-5def-b80a-5311522fd4bf",
        //         "orderID": "b63bc982-be3a-45e0-8974-43d6375fb626",
        //         "clOrdID": "uuid-1577463487504",
        //         "execStatus": "MakerFill"
        //     }
        //
        let priceString = undefined;
        let amountString = undefined;
        let timestamp = undefined;
        let id = undefined;
        let side = undefined;
        let costString = undefined;
        let type = undefined;
        let fee = undefined;
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let orderId = undefined;
        let takerOrMaker = undefined;
        if (Array.isArray (trade)) {
            const tradeLength = trade.length;
            timestamp = this.safeIntegerProduct (trade, 0, 0.000001);
            if (tradeLength > 4) {
                id = this.safeString (trade, tradeLength - 4);
            }
            side = this.safeStringLower (trade, tradeLength - 3);
            priceString = this.fromEp (this.safeString (trade, tradeLength - 2), market);
            amountString = this.fromEv (this.safeString (trade, tradeLength - 1), market);
        } else {
            timestamp = this.safeIntegerProduct (trade, 'transactTimeNs', 0.000001);
            id = this.safeString2 (trade, 'execId', 'execID');
            orderId = this.safeString (trade, 'orderID');
            side = this.safeStringLower (trade, 'side');
            type = this.parseOrderType (this.safeString (trade, 'ordType'));
            const execStatus = this.safeString (trade, 'execStatus');
            if (execStatus === 'MakerFill') {
                takerOrMaker = 'maker';
            }
            priceString = this.fromEp (this.safeString (trade, 'execPriceEp'), market);
            amountString = this.fromEv (this.safeString (trade, 'execBaseQtyEv'), market);
            amountString = this.safeString (trade, 'execQty', amountString);
            costString = this.fromEv (this.safeString2 (trade, 'execQuoteQtyEv', 'execValueEv'), market);
            const feeCostString = this.fromEv (this.safeString (trade, 'execFeeEv'), market);
            if (feeCostString !== undefined) {
                const feeRateString = this.fromEr (this.safeString (trade, 'feeRateEr'), market);
                let feeCurrencyCode = undefined;
                if (market['spot']) {
                    feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
                } else {
                    const info = this.safeValue (market, 'info');
                    if (info !== undefined) {
                        const settlementCurrencyId = this.safeString (info, 'settlementCurrency');
                        feeCurrencyCode = this.safeCurrencyCode (settlementCurrencyId);
                    }
                }
                fee = {
                    'cost': feeCostString,
                    'rate': feeRateString,
                    'currency': feeCurrencyCode,
                };
            }
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    parseSpotBalance (response) {
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":[
        //             {
        //                 "currency":"USDT",
        //                 "balanceEv":0,
        //                 "lockedTradingBalanceEv":0,
        //                 "lockedWithdrawEv":0,
        //                 "lastUpdateTimeNs":1592065834511322514,
        //                 "walletVid":0
        //             },
        //             {
        //                 "currency":"ETH",
        //                 "balanceEv":0,
        //                 "lockedTradingBalanceEv":0,
        //                 "lockedWithdrawEv":0,
        //                 "lastUpdateTimeNs":1592065834511322514,
        //                 "walletVid":0
        //             }
        //         ]
        //     }
        //
        let timestamp = undefined;
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const currency = this.safeValue (this.currencies, code, {});
            const scale = this.safeInteger (currency, 'valueScale', 8);
            const account = this.account ();
            const balanceEv = this.safeString (balance, 'balanceEv');
            const lockedTradingBalanceEv = this.safeString (balance, 'lockedTradingBalanceEv');
            const lockedWithdrawEv = this.safeString (balance, 'lockedWithdrawEv');
            const total = this.fromEn (balanceEv, scale);
            const lockedTradingBalance = this.fromEn (lockedTradingBalanceEv, scale);
            const lockedWithdraw = this.fromEn (lockedWithdrawEv, scale);
            const used = Precise.stringAdd (lockedTradingBalance, lockedWithdraw);
            const lastUpdateTimeNs = this.safeIntegerProduct (balance, 'lastUpdateTimeNs', 0.000001);
            timestamp = (timestamp === undefined) ? lastUpdateTimeNs : Math.max (timestamp, lastUpdateTimeNs);
            account['total'] = total;
            account['used'] = used;
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    parseSwapBalance (response) {
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":{
        //             "account":{
        //                 "accountId":6192120001,
        //                 "currency":"BTC",
        //                 "accountBalanceEv":1254744,
        //                 "totalUsedBalanceEv":0,
        //                 "bonusBalanceEv":1254744
        //             },
        //             "positions":[
        //                 {
        //                     "accountID":6192120001,
        //                     "symbol":"BTCUSD",
        //                     "currency":"BTC",
        //                     "side":"None",
        //                     "positionStatus":"Normal",
        //                     "crossMargin":false,
        //                     "leverageEr":0,
        //                     "leverage":0E-8,
        //                     "initMarginReqEr":1000000,
        //                     "initMarginReq":0.01000000,
        //                     "maintMarginReqEr":500000,
        //                     "maintMarginReq":0.00500000,
        //                     "riskLimitEv":10000000000,
        //                     "riskLimit":100.00000000,
        //                     "size":0,
        //                     "value":0E-8,
        //                     "valueEv":0,
        //                     "avgEntryPriceEp":0,
        //                     "avgEntryPrice":0E-8,
        //                     "posCostEv":0,
        //                     "posCost":0E-8,
        //                     "assignedPosBalanceEv":0,
        //                     "assignedPosBalance":0E-8,
        //                     "bankruptCommEv":0,
        //                     "bankruptComm":0E-8,
        //                     "bankruptPriceEp":0,
        //                     "bankruptPrice":0E-8,
        //                     "positionMarginEv":0,
        //                     "positionMargin":0E-8,
        //                     "liquidationPriceEp":0,
        //                     "liquidationPrice":0E-8,
        //                     "deleveragePercentileEr":0,
        //                     "deleveragePercentile":0E-8,
        //                     "buyValueToCostEr":1150750,
        //                     "buyValueToCost":0.01150750,
        //                     "sellValueToCostEr":1149250,
        //                     "sellValueToCost":0.01149250,
        //                     "markPriceEp":96359083,
        //                     "markPrice":9635.90830000,
        //                     "markValueEv":0,
        //                     "markValue":null,
        //                     "unRealisedPosLossEv":0,
        //                     "unRealisedPosLoss":null,
        //                     "estimatedOrdLossEv":0,
        //                     "estimatedOrdLoss":0E-8,
        //                     "usedBalanceEv":0,
        //                     "usedBalance":0E-8,
        //                     "takeProfitEp":0,
        //                     "takeProfit":null,
        //                     "stopLossEp":0,
        //                     "stopLoss":null,
        //                     "realisedPnlEv":0,
        //                     "realisedPnl":null,
        //                     "cumRealisedPnlEv":0,
        //                     "cumRealisedPnl":null
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', {});
        const balance = this.safeValue (data, 'account', {});
        const currencyId = this.safeString (balance, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const currency = this.currency (code);
        const account = this.account ();
        const accountBalanceEv = this.safeString (balance, 'accountBalanceEv');
        const totalUsedBalanceEv = this.safeString (balance, 'totalUsedBalanceEv');
        const valueScale = this.safeInteger (currency, 'valueScale', 8);
        account['total'] = this.fromEn (accountBalanceEv, valueScale);
        account['used'] = this.fromEn (totalUsedBalanceEv, valueScale);
        result[code] = account;
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name phemex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'defaultType', 'fetchBalance', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        let method = 'privateGetSpotWallets';
        const request = {};
        if (type === 'swap') {
            const code = this.safeString (params, 'code');
            if (code !== undefined) {
                const currency = this.currency (code);
                request['currency'] = currency['id'];
                params = this.omit (params, 'code');
            } else {
                const currency = this.safeString (params, 'currency');
                if (currency === undefined) {
                    throw new ArgumentsRequired (this.id + ' fetchBalance() requires a code parameter or a currency parameter for ' + type + ' type');
                }
            }
            method = 'privateGetAccountsAccountPositions';
        }
        params = this.omit (params, 'type');
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":[
        //             {
        //                 "currency":"USDT",
        //                 "balanceEv":0,
        //                 "lockedTradingBalanceEv":0,
        //                 "lockedWithdrawEv":0,
        //                 "lastUpdateTimeNs":1592065834511322514,
        //                 "walletVid":0
        //             },
        //             {
        //                 "currency":"ETH",
        //                 "balanceEv":0,
        //                 "lockedTradingBalanceEv":0,
        //                 "lockedWithdrawEv":0,
        //                 "lastUpdateTimeNs":1592065834511322514,
        //                 "walletVid":0
        //             }
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":{
        //             "account":{
        //                 "accountId":6192120001,
        //                 "currency":"BTC",
        //                 "accountBalanceEv":1254744,
        //                 "totalUsedBalanceEv":0,
        //                 "bonusBalanceEv":1254744
        //             },
        //             "positions":[
        //                 {
        //                     "accountID":6192120001,
        //                     "symbol":"BTCUSD",
        //                     "currency":"BTC",
        //                     "side":"None",
        //                     "positionStatus":"Normal",
        //                     "crossMargin":false,
        //                     "leverageEr":0,
        //                     "leverage":0E-8,
        //                     "initMarginReqEr":1000000,
        //                     "initMarginReq":0.01000000,
        //                     "maintMarginReqEr":500000,
        //                     "maintMarginReq":0.00500000,
        //                     "riskLimitEv":10000000000,
        //                     "riskLimit":100.00000000,
        //                     "size":0,
        //                     "value":0E-8,
        //                     "valueEv":0,
        //                     "avgEntryPriceEp":0,
        //                     "avgEntryPrice":0E-8,
        //                     "posCostEv":0,
        //                     "posCost":0E-8,
        //                     "assignedPosBalanceEv":0,
        //                     "assignedPosBalance":0E-8,
        //                     "bankruptCommEv":0,
        //                     "bankruptComm":0E-8,
        //                     "bankruptPriceEp":0,
        //                     "bankruptPrice":0E-8,
        //                     "positionMarginEv":0,
        //                     "positionMargin":0E-8,
        //                     "liquidationPriceEp":0,
        //                     "liquidationPrice":0E-8,
        //                     "deleveragePercentileEr":0,
        //                     "deleveragePercentile":0E-8,
        //                     "buyValueToCostEr":1150750,
        //                     "buyValueToCost":0.01150750,
        //                     "sellValueToCostEr":1149250,
        //                     "sellValueToCost":0.01149250,
        //                     "markPriceEp":96359083,
        //                     "markPrice":9635.90830000,
        //                     "markValueEv":0,
        //                     "markValue":null,
        //                     "unRealisedPosLossEv":0,
        //                     "unRealisedPosLoss":null,
        //                     "estimatedOrdLossEv":0,
        //                     "estimatedOrdLoss":0E-8,
        //                     "usedBalanceEv":0,
        //                     "usedBalance":0E-8,
        //                     "takeProfitEp":0,
        //                     "takeProfit":null,
        //                     "stopLossEp":0,
        //                     "stopLoss":null,
        //                     "realisedPnlEv":0,
        //                     "realisedPnl":null,
        //                     "cumRealisedPnlEv":0,
        //                     "cumRealisedPnl":null
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = (type === 'swap') ? this.parseSwapBalance (response) : this.parseSpotBalance (response);
        return result;
    }

    parseOrderStatus (status) {
        const statuses = {
            'Created': 'open',
            'Untriggered': 'open',
            'Deactivated': 'closed',
            'Triggered': 'open',
            'Rejected': 'rejected',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types = {
            'Limit': 'limit',
            'Market': 'market',
        };
        return this.safeString (types, type, type);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'GoodTillCancel': 'GTC',
            'PostOnly': 'PO',
            'ImmediateOrCancel': 'IOC',
            'FillOrKill': 'FOK',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseSpotOrder (order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "orderID": "d1d09454-cabc-4a23-89a7-59d43363f16d",
        //         "clOrdID": "309bcd5c-9f6e-4a68-b775-4494542eb5cb",
        //         "priceEp": 0,
        //         "action": "New",
        //         "trigger": "UNSPECIFIED",
        //         "pegPriceType": "UNSPECIFIED",
        //         "stopDirection": "UNSPECIFIED",
        //         "bizError": 0,
        //         "symbol": "sBTCUSDT",
        //         "side": "Buy",
        //         "baseQtyEv": 0,
        //         "ordType": "Limit",
        //         "timeInForce": "GoodTillCancel",
        //         "ordStatus": "Created",
        //         "cumFeeEv": 0,
        //         "cumBaseQtyEv": 0,
        //         "cumQuoteQtyEv": 0,
        //         "leavesBaseQtyEv": 0,
        //         "leavesQuoteQtyEv": 0,
        //         "avgPriceEp": 0,
        //         "cumBaseAmountEv": 0,
        //         "cumQuoteAmountEv": 0,
        //         "quoteQtyEv": 0,
        //         "qtyType": "ByBase",
        //         "stopPxEp": 0,
        //         "pegOffsetValueEp": 0
        //     }
        //
        //     {
        //         "orderID":"99232c3e-3d6a-455f-98cc-2061cdfe91bc",
        //         "stopPxEp":0,
        //         "avgPriceEp":0,
        //         "qtyType":"ByBase",
        //         "leavesBaseQtyEv":0,
        //         "leavesQuoteQtyEv":0,
        //         "baseQtyEv":"1000000000",
        //         "feeCurrency":"4",
        //         "stopDirection":"UNSPECIFIED",
        //         "symbol":"sETHUSDT",
        //         "side":"Buy",
        //         "quoteQtyEv":250000000000,
        //         "priceEp":25000000000,
        //         "ordType":"Limit",
        //         "timeInForce":"GoodTillCancel",
        //         "ordStatus":"Rejected",
        //         "execStatus":"NewRejected",
        //         "createTimeNs":1592675305266037130,
        //         "cumFeeEv":0,
        //         "cumBaseValueEv":0,
        //         "cumQuoteValueEv":0
        //     }
        //
        const id = this.safeString (order, 'orderID');
        let clientOrderId = this.safeString (order, 'clOrdID');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.fromEp (this.safeString (order, 'priceEp'), market);
        const amount = this.fromEv (this.safeString (order, 'baseQtyEv'), market);
        const remaining = this.omitZero (this.fromEv (this.safeString (order, 'leavesBaseQtyEv'), market));
        const filled = this.fromEv (this.safeString2 (order, 'cumBaseQtyEv', 'cumBaseValueEv'), market);
        const cost = this.fromEv (this.safeString2 (order, 'cumQuoteValueEv', 'quoteQtyEv'), market);
        const average = this.fromEp (this.safeString (order, 'avgPriceEp'), market);
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const side = this.safeStringLower (order, 'side');
        const type = this.parseOrderType (this.safeString (order, 'ordType'));
        const timestamp = this.safeIntegerProduct2 (order, 'actionTimeNs', 'createTimeNs', 0.000001);
        let fee = undefined;
        const feeCost = this.fromEv (this.safeString (order, 'cumFeeEv'), market);
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        const stopPrice = this.parseNumber (this.omitZero (this.fromEp (this.safeString (order, 'stopPxEp', market))));
        const postOnly = (timeInForce === 'PO');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
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

    parseSwapOrder (order, market = undefined) {
        //
        //     {
        //         "bizError":0,
        //         "orderID":"7a1ad384-44a3-4e54-a102-de4195a29e32",
        //         "clOrdID":"",
        //         "symbol":"ETHUSD",
        //         "side":"Buy",
        //         "actionTimeNs":1592668973945065381,
        //         "transactTimeNs":0,
        //         "orderType":"Market",
        //         "priceEp":2267500,
        //         "price":226.75000000,
        //         "orderQty":1,
        //         "displayQty":0,
        //         "timeInForce":"ImmediateOrCancel",
        //         "reduceOnly":false,
        //         "closedPnlEv":0,
        //         "closedPnl":0E-8,
        //         "closedSize":0,
        //         "cumQty":0,
        //         "cumValueEv":0,
        //         "cumValue":0E-8,
        //         "leavesQty":1,
        //         "leavesValueEv":11337,
        //         "leavesValue":1.13370000,
        //         "stopDirection":"UNSPECIFIED",
        //         "stopPxEp":0,
        //         "stopPx":0E-8,
        //         "trigger":"UNSPECIFIED",
        //         "pegOffsetValueEp":0,
        //         "execStatus":"PendingNew",
        //         "pegPriceType":"UNSPECIFIED",
        //         "ordStatus":"Created",
        //         "execInst": "ReduceOnly"
        //     }
        //
        const id = this.safeString (order, 'orderID');
        let clientOrderId = this.safeString (order, 'clOrdID');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const side = this.safeStringLower (order, 'side');
        const type = this.parseOrderType (this.safeString (order, 'orderType'));
        const price = this.parseNumber (this.fromEp (this.safeString (order, 'priceEp'), market));
        const amount = this.safeNumber (order, 'orderQty');
        const filled = this.safeNumber (order, 'cumQty');
        const remaining = this.safeNumber (order, 'leavesQty');
        const timestamp = this.safeIntegerProduct (order, 'actionTimeNs', 0.000001);
        const cost = this.safeNumber (order, 'cumValue');
        let lastTradeTimestamp = this.safeIntegerProduct (order, 'transactTimeNs', 0.000001);
        if (lastTradeTimestamp === 0) {
            lastTradeTimestamp = undefined;
        }
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        const stopPrice = this.safeNumber (order, 'stopPx');
        const postOnly = (timeInForce === 'PO');
        let reduceOnly = this.safeValue (order, 'reduceOnly');
        const execInst = this.safeString (order, 'execInst');
        if (execInst === 'ReduceOnly') {
            reduceOnly = true;
        }
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'average': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    parseOrder (order, market = undefined) {
        if ('closedPnl' in order) {
            return this.parseSwapOrder (order, market);
        }
        return this.parseSpotOrder (order, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name phemex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        side = this.capitalize (side);
        type = this.capitalize (type);
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        const request = {
            // common
            'symbol': market['id'],
            'side': side, // Sell, Buy
            'ordType': type, // Market, Limit, Stop, StopLimit, MarketIfTouched, LimitIfTouched (additionally for contract-markets: MarketAsLimit, StopAsLimit, MarketIfTouchedAsLimit)
            // 'stopPxEp': this.toEp (stopPx, market), // for conditional orders
            // 'priceEp': this.toEp (price, market), // required for limit orders
            // 'timeInForce': 'GoodTillCancel', // GoodTillCancel, PostOnly, ImmediateOrCancel, FillOrKill
            // ----------------------------------------------------------------
            // spot
            // 'qtyType': 'ByBase', // ByBase, ByQuote
            // 'quoteQtyEv': this.toEp (cost, market),
            // 'baseQtyEv': this.toEv (amount, market),
            // 'trigger': 'ByLastPrice', // required for conditional orders
            // ----------------------------------------------------------------
            // swap
            // 'clOrdID': this.uuid (), // max length 40
            // 'orderQty': this.amountToPrecision (amount, symbol),
            // 'reduceOnly': false,
            // 'closeOnTrigger': false, // implicit reduceOnly and cancel other orders in the same direction
            // 'takeProfitEp': this.toEp (takeProfit, market),
            // 'stopLossEp': this.toEp (stopLossEp, market),
            // 'triggerType': 'ByMarkPrice', // ByMarkPrice, ByLastPrice
            // 'pegOffsetValueEp': integer, // Trailing offset from current price. Negative value when position is long, positive when position is short
            // 'pegPriceType': 'TrailingStopPeg', // TrailingTakeProfitPeg
            // 'text': 'comment',
        };
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        if (clientOrderId === undefined) {
            const brokerId = this.safeString (this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['clOrdID'] = brokerId + this.uuid16 ();
            }
        } else {
            request['clOrdID'] = clientOrderId;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        }
        const stopPrice = this.safeString2 (params, 'stopPx', 'stopPrice');
        if (stopPrice !== undefined) {
            request['stopPxEp'] = this.toEp (stopPrice, market);
        }
        params = this.omit (params, [ 'stopPx', 'stopPrice' ]);
        if (market['spot']) {
            let qtyType = this.safeValue (params, 'qtyType', 'ByBase');
            if ((type === 'Market') || (type === 'Stop') || (type === 'MarketIfTouched')) {
                if (price !== undefined) {
                    qtyType = 'ByQuote';
                }
            }
            request['qtyType'] = qtyType;
            if (qtyType === 'ByQuote') {
                let cost = this.safeNumber (params, 'cost');
                params = this.omit (params, 'cost');
                if (this.options['createOrderByQuoteRequiresPrice']) {
                    if (price !== undefined) {
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        const quoteAmount = Precise.stringMul (amountString, priceString);
                        cost = this.parseNumber (quoteAmount);
                    } else if (cost === undefined) {
                        throw new ArgumentsRequired (this.id + ' createOrder() ' + qtyType + ' requires a price argument or a cost parameter');
                    }
                }
                cost = (cost === undefined) ? amount : cost;
                const costString = cost.toString ();
                request['quoteQtyEv'] = this.toEv (costString, market);
            } else {
                const amountString = amount.toString ();
                request['baseQtyEv'] = this.toEv (amountString, market);
            }
        } else if (market['swap']) {
            if (reduceOnly !== undefined) {
                request['reduceOnly'] = reduceOnly;
            }
            request['orderQty'] = parseInt (amount);
            if (stopPrice !== undefined) {
                const triggerType = this.safeString (params, 'triggerType', 'ByMarkPrice');
                request['triggerType'] = triggerType;
            }
        }
        if ((type === 'Limit') || (type === 'StopLimit') || (type === 'LimitIfTouched')) {
            const priceString = price.toString ();
            request['priceEp'] = this.toEp (priceString, market);
        }
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if (takeProfitPrice !== undefined) {
            request['takeProfitEp'] = this.toEp (takeProfitPrice, market);
            params = this.omit (params, 'takeProfitPrice');
        }
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        if (stopLossPrice !== undefined) {
            request['stopLossEp'] = this.toEp (stopLossPrice, market);
            params = this.omit (params, 'stopLossPrice');
        }
        const method = market['spot'] ? 'privatePostSpotOrders' : 'privatePostOrders';
        params = this.omit (params, 'reduceOnly');
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data": {
        //             "orderID": "d1d09454-cabc-4a23-89a7-59d43363f16d",
        //             "clOrdID": "309bcd5c-9f6e-4a68-b775-4494542eb5cb",
        //             "priceEp": 0,
        //             "action": "New",
        //             "trigger": "UNSPECIFIED",
        //             "pegPriceType": "UNSPECIFIED",
        //             "stopDirection": "UNSPECIFIED",
        //             "bizError": 0,
        //             "symbol": "sBTCUSDT",
        //             "side": "Buy",
        //             "baseQtyEv": 0,
        //             "ordType": "Limit",
        //             "timeInForce": "GoodTillCancel",
        //             "ordStatus": "Created",
        //             "cumFeeEv": 0,
        //             "cumBaseQtyEv": 0,
        //             "cumQuoteQtyEv": 0,
        //             "leavesBaseQtyEv": 0,
        //             "leavesQuoteQtyEv": 0,
        //             "avgPriceEp": 0,
        //             "cumBaseAmountEv": 0,
        //             "cumQuoteAmountEv": 0,
        //             "quoteQtyEv": 0,
        //             "qtyType": "ByBase",
        //             "stopPxEp": 0,
        //             "pegOffsetValueEp": 0
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":{
        //             "bizError":0,
        //             "orderID":"7a1ad384-44a3-4e54-a102-de4195a29e32",
        //             "clOrdID":"",
        //             "symbol":"ETHUSD",
        //             "side":"Buy",
        //             "actionTimeNs":1592668973945065381,
        //             "transactTimeNs":0,
        //             "orderType":"Market",
        //             "priceEp":2267500,
        //             "price":226.75000000,
        //             "orderQty":1,
        //             "displayQty":0,
        //             "timeInForce":"ImmediateOrCancel",
        //             "reduceOnly":false,
        //             "closedPnlEv":0,
        //             "closedPnl":0E-8,
        //             "closedSize":0,
        //             "cumQty":0,
        //             "cumValueEv":0,
        //             "cumValue":0E-8,
        //             "leavesQty":1,
        //             "leavesValueEv":11337,
        //             "leavesValue":1.13370000,
        //             "stopDirection":"UNSPECIFIED",
        //             "stopPxEp":0,
        //             "stopPx":0E-8,
        //             "trigger":"UNSPECIFIED",
        //             "pegOffsetValueEp":0,
        //             "execStatus":"PendingNew",
        //             "pegPriceType":"UNSPECIFIED",
        //             "ordStatus":"Created"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async editOrder (id, symbol, type = undefined, side = undefined, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a symbol argument');
        }
        if (type !== undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() type changing is not implemented. Try to cancel & recreate order for that purpose');
        }
        if (side !== undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() side changing is not implemented. Try to cancel & recreate order for that purpose');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrdID');
        params = this.omit (params, [ 'clientOrderId', 'clOrdID' ]);
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        } else {
            request['orderID'] = id;
        }
        if (price !== undefined) {
            request['priceEp'] = this.toEp (price, market);
        }
        // Note the uppercase 'V' in 'baseQtyEV' request. that is exchange's requirement at this moment. However, to avoid mistakes from user side, let's support lowercased 'baseQtyEv' too
        const finalQty = this.safeString (params, 'baseQtyEv');
        params = this.omit (params, [ 'baseQtyEv' ]);
        if (finalQty !== undefined) {
            request['baseQtyEV'] = finalQty;
        } else if (amount !== undefined) {
            request['baseQtyEV'] = this.toEv (amount, market);
        }
        const stopPrice = this.safeString2 (params, 'stopPx', 'stopPrice');
        if (stopPrice !== undefined) {
            request['stopPxEp'] = this.toEp (stopPrice, market);
        }
        params = this.omit (params, [ 'stopPx', 'stopPrice' ]);
        const method = market['spot'] ? 'privatePutSpotOrders' : 'privatePutOrdersReplace';
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrdID');
        params = this.omit (params, [ 'clientOrderId', 'clOrdID' ]);
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        } else {
            request['orderID'] = id;
        }
        const method = market['spot'] ? 'privateDeleteSpotOrders' : 'privateDeleteOrdersCancel';
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'untriggerred': false, // false to cancel non-conditional orders, true to cancel conditional orders
            // 'text': 'up to 40 characters max',
        };
        const market = this.market (symbol);
        let method = 'privateDeleteSpotOrdersAll';
        if (market['swap']) {
            method = 'privateDeleteOrdersAll';
        }
        request['symbol'] = market['id'];
        return await this[method] (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['spot'] ? 'privateGetSpotOrdersActive' : 'privateGetExchangeOrder';
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrdID');
        params = this.omit (params, [ 'clientOrderId', 'clOrdID' ]);
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        } else {
            request['orderID'] = id;
        }
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        let order = data;
        if (Array.isArray (data)) {
            const numOrders = data.length;
            if (numOrders < 1) {
                if (clientOrderId !== undefined) {
                    throw new OrderNotFound (this.id + ' fetchOrder() ' + symbol + ' order with clientOrderId ' + clientOrderId + ' not found');
                } else {
                    throw new OrderNotFound (this.id + ' fetchOrder() ' + symbol + ' order with id ' + id + ' not found');
                }
            }
            order = this.safeValue (data, 0, {});
        }
        return this.parseOrder (order, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['spot'] ? 'privateGetSpotOrders' : 'privateGetExchangeOrderList';
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeValue (data, 'rows', []);
        return this.parseOrders (rows, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['spot'] ? 'privateGetSpotOrders' : 'privateGetOrdersActiveList';
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        try {
            response = await this[method] (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
        }
        const data = this.safeValue (response, 'data', {});
        if (Array.isArray (data)) {
            return this.parseOrders (data, market, since, limit);
        } else {
            const rows = this.safeValue (data, 'rows', []);
            return this.parseOrders (rows, market, since, limit);
        }
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['spot'] ? 'privateGetExchangeSpotOrder' : 'privateGetExchangeOrderList';
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "total":8,
        //             "rows":[
        //                 {
        //                     "orderID":"99232c3e-3d6a-455f-98cc-2061cdfe91bc",
        //                     "stopPxEp":0,
        //                     "avgPriceEp":0,
        //                     "qtyType":"ByBase",
        //                     "leavesBaseQtyEv":0,
        //                     "leavesQuoteQtyEv":0,
        //                     "baseQtyEv":"1000000000",
        //                     "feeCurrency":"4",
        //                     "stopDirection":"UNSPECIFIED",
        //                     "symbol":"sETHUSDT",
        //                     "side":"Buy",
        //                     "quoteQtyEv":250000000000,
        //                     "priceEp":25000000000,
        //                     "ordType":"Limit",
        //                     "timeInForce":"GoodTillCancel",
        //                     "ordStatus":"Rejected",
        //                     "execStatus":"NewRejected",
        //                     "createTimeNs":1592675305266037130,
        //                     "cumFeeEv":0,
        //                     "cumBaseValueEv":0,
        //                     "cumQuoteValueEv":0
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        if (Array.isArray (data)) {
            return this.parseOrders (data, market, since, limit);
        } else {
            const rows = this.safeValue (data, 'rows', []);
            return this.parseOrders (rows, market, since, limit);
        }
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['spot'] ? 'privateGetExchangeSpotOrderTrades' : 'privateGetExchangeOrderTrade';
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (market['swap'] && (limit !== undefined)) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "total": 1,
        //             "rows": [
        //                 {
        //                     "qtyType": "ByQuote",
        //                     "transactTimeNs": 1589450974800550100,
        //                     "clOrdID": "8ba59d40-df25-d4b0-14cf-0703f44e9690",
        //                     "orderID": "b2b7018d-f02f-4c59-b4cf-051b9c2d2e83",
        //                     "symbol": "sBTCUSDT",
        //                     "side": "Buy",
        //                     "priceEP": 970056000000,
        //                     "baseQtyEv": 0,
        //                     "quoteQtyEv": 1000000000,
        //                     "action": "New",
        //                     "execStatus": "MakerFill",
        //                     "ordStatus": "Filled",
        //                     "ordType": "Limit",
        //                     "execInst": "None",
        //                     "timeInForce": "GoodTillCancel",
        //                     "stopDirection": "UNSPECIFIED",
        //                     "tradeType": "Trade",
        //                     "stopPxEp": 0,
        //                     "execId": "c6bd8979-07ba-5946-b07e-f8b65135dbb1",
        //                     "execPriceEp": 970056000000,
        //                     "execBaseQtyEv": 103000,
        //                     "execQuoteQtyEv": 999157680,
        //                     "leavesBaseQtyEv": 0,
        //                     "leavesQuoteQtyEv": 0,
        //                     "execFeeEv": 0,
        //                     "feeRateEr": 0
        //                 }
        //             ]
        //         }
        //     }
        //
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "total": 79,
        //             "rows": [
        //                 {
        //                     "transactTimeNs": 1606054879331565300,
        //                     "symbol": "BTCUSD",
        //                     "currency": "BTC",
        //                     "action": "New",
        //                     "side": "Buy",
        //                     "tradeType": "Trade",
        //                     "execQty": 5,
        //                     "execPriceEp": 182990000,
        //                     "orderQty": 5,
        //                     "priceEp": 183870000,
        //                     "execValueEv": 27323,
        //                     "feeRateEr": 75000,
        //                     "execFeeEv": 21,
        //                     "ordType": "Market",
        //                     "execID": "5eee56a4-04a9-5677-8eb0-c2fe22ae3645",
        //                     "orderID": "ee0acb82-f712-4543-a11d-d23efca73197",
        //                     "clOrdID": "",
        //                     "execStatus": "TakerFill"
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeValue (data, 'rows', []);
        return this.parseTrades (rows, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name phemex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const defaultNetworks = this.safeValue (this.options, 'defaultNetworks');
        const defaultNetwork = this.safeStringUpper (defaultNetworks, code);
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network', defaultNetwork);
        network = this.safeString (networks, network, network);
        if (network === undefined) {
            request['chainName'] = currency['id'];
        } else {
            request['chainName'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privateGetPhemexUserWalletsV2DepositAddress (this.extend (request, params));
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "address":"0x5bfbf60e0fa7f63598e6cfd8a7fd3ffac4ccc6ad",
        //             "tag":null
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'address');
        const tag = this.safeString (data, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetExchangeWalletsDepositList (params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":[
        //             {
        //                 "id":29200,
        //                 "currency":"USDT",
        //                 "currencyCode":3,
        //                 "txHash":"0x0bdbdc47807769a03b158d5753f54dfc58b92993d2f5e818db21863e01238e5d",
        //                 "address":"0x5bfbf60e0fa7f63598e6cfd8a7fd3ffac4ccc6ad",
        //                 "amountEv":3000000000,
        //                 "confirmations":13,
        //                 "type":"Deposit",
        //                 "status":"Success",
        //                 "createdAt":1592722565000
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetExchangeWalletsWithdrawList (params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":[
        //             {
        //                 "address": "1Lxxxxxxxxxxx"
        //                 "amountEv": 200000
        //                 "currency": "BTC"
        //                 "currencyCode": 1
        //                 "expiredTime": 0
        //                 "feeEv": 50000
        //                 "rejectReason": null
        //                 "status": "Succeed"
        //                 "txHash": "44exxxxxxxxxxxxxxxxxxxxxx"
        //                 "withdrawStatus: ""
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'Success': 'ok',
            'Succeed': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     ...
        //
        // fetchDeposits
        //
        //     {
        //         "id":29200,
        //         "currency":"USDT",
        //         "currencyCode":3,
        //         "txHash":"0x0bdbdc47807769a03b158d5753f54dfc58b92993d2f5e818db21863e01238e5d",
        //         "address":"0x5bfbf60e0fa7f63598e6cfd8a7fd3ffac4ccc6ad",
        //         "amountEv":3000000000,
        //         "confirmations":13,
        //         "type":"Deposit",
        //         "status":"Success",
        //         "createdAt":1592722565000
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "address": "1Lxxxxxxxxxxx"
        //         "amountEv": 200000
        //         "currency": "BTC"
        //         "currencyCode": 1
        //         "expiredTime": 0
        //         "feeEv": 50000
        //         "rejectReason": null
        //         "status": "Succeed"
        //         "txHash": "44exxxxxxxxxxxxxxxxxxxxxx"
        //         "withdrawStatus: ""
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        const tag = undefined;
        const txid = this.safeString (transaction, 'txHash');
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const code = currency['code'];
        const timestamp = this.safeInteger2 (transaction, 'createdAt', 'submitedAt');
        let type = this.safeStringLower (transaction, 'type');
        const feeCost = this.parseNumber (this.fromEn (this.safeString (transaction, 'feeEv'), currency['valueScale']));
        let fee = undefined;
        if (feeCost !== undefined) {
            type = 'withdrawal';
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.parseNumber (this.fromEn (this.safeString (transaction, 'amountEv'), currency['valueScale']));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
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
            'updated': undefined,
            'fee': fee,
        };
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const defaultSubType = this.safeString (this.options, 'defaultSubType', 'linear');
        let code = this.safeString (params, 'code');
        if (code === undefined) {
            code = (defaultSubType === 'linear') ? 'USD' : 'BTC';
        } else {
            params = this.omit (params, 'code');
        }
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetAccountsAccountPositions (this.extend (request, params));
        //
        //     {
        //         "code":0,"msg":"",
        //         "data":{
        //             "account":{
        //                 "accountId":6192120001,
        //                 "currency":"BTC",
        //                 "accountBalanceEv":1254744,
        //                 "totalUsedBalanceEv":0,
        //                 "bonusBalanceEv":1254744
        //             },
        //             "positions":[
        //                 {
        //                     "accountID":6192120001,
        //                     "symbol":"BTCUSD",
        //                     "currency":"BTC",
        //                     "side":"None",
        //                     "positionStatus":"Normal",
        //                     "crossMargin":false,
        //                     "leverageEr":100000000,
        //                     "leverage":1.00000000,
        //                     "initMarginReqEr":100000000,
        //                     "initMarginReq":1.00000000,
        //                     "maintMarginReqEr":500000,
        //                     "maintMarginReq":0.00500000,
        //                     "riskLimitEv":10000000000,
        //                     "riskLimit":100.00000000,
        //                     "size":0,
        //                     "value":0E-8,
        //                     "valueEv":0,
        //                     "avgEntryPriceEp":0,
        //                     "avgEntryPrice":0E-8,
        //                     "posCostEv":0,
        //                     "posCost":0E-8,
        //                     "assignedPosBalanceEv":0,
        //                     "assignedPosBalance":0E-8,
        //                     "bankruptCommEv":0,
        //                     "bankruptComm":0E-8,
        //                     "bankruptPriceEp":0,
        //                     "bankruptPrice":0E-8,
        //                     "positionMarginEv":0,
        //                     "positionMargin":0E-8,
        //                     "liquidationPriceEp":0,
        //                     "liquidationPrice":0E-8,
        //                     "deleveragePercentileEr":0,
        //                     "deleveragePercentile":0E-8,
        //                     "buyValueToCostEr":100225000,
        //                     "buyValueToCost":1.00225000,
        //                     "sellValueToCostEr":100075000,
        //                     "sellValueToCost":1.00075000,
        //                     "markPriceEp":135736070,
        //                     "markPrice":13573.60700000,
        //                     "markValueEv":0,
        //                     "markValue":null,
        //                     "unRealisedPosLossEv":0,
        //                     "unRealisedPosLoss":null,
        //                     "estimatedOrdLossEv":0,
        //                     "estimatedOrdLoss":0E-8,
        //                     "usedBalanceEv":0,
        //                     "usedBalance":0E-8,
        //                     "takeProfitEp":0,
        //                     "takeProfit":null,
        //                     "stopLossEp":0,
        //                     "stopLoss":null,
        //                     "cumClosedPnlEv":0,
        //                     "cumFundingFeeEv":0,
        //                     "cumTransactFeeEv":0,
        //                     "realisedPnlEv":0,
        //                     "realisedPnl":null,
        //                     "cumRealisedPnlEv":0,
        //                     "cumRealisedPnl":null
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const positions = this.safeValue (data, 'positions', []);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            result.push (this.parsePosition (position));
        }
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    parsePosition (position, market = undefined) {
        //
        //   {
        //     userID: '811370',
        //     accountID: '8113700002',
        //     symbol: 'ETHUSD',
        //     currency: 'USD',
        //     side: 'Buy',
        //     positionStatus: 'Normal',
        //     crossMargin: false,
        //     leverageEr: '200000000',
        //     leverage: '2.00000000',
        //     initMarginReqEr: '50000000',
        //     initMarginReq: '0.50000000',
        //     maintMarginReqEr: '1000000',
        //     maintMarginReq: '0.01000000',
        //     riskLimitEv: '5000000000',
        //     riskLimit: '500000.00000000',
        //     size: '1',
        //     value: '22.22370000',
        //     valueEv: '222237',
        //     avgEntryPriceEp: '44447400',
        //     avgEntryPrice: '4444.74000000',
        //     posCostEv: '111202',
        //     posCost: '11.12020000',
        //     assignedPosBalanceEv: '111202',
        //     assignedPosBalance: '11.12020000',
        //     bankruptCommEv: '84',
        //     bankruptComm: '0.00840000',
        //     bankruptPriceEp: '22224000',
        //     bankruptPrice: '2222.40000000',
        //     positionMarginEv: '111118',
        //     positionMargin: '11.11180000',
        //     liquidationPriceEp: '22669000',
        //     liquidationPrice: '2266.90000000',
        //     deleveragePercentileEr: '0',
        //     deleveragePercentile: '0E-8',
        //     buyValueToCostEr: '50112500',
        //     buyValueToCost: '0.50112500',
        //     sellValueToCostEr: '50187500',
        //     sellValueToCost: '0.50187500',
        //     markPriceEp: '31332499',
        //     markPrice: '3133.24990000',
        //     markValueEv: '0',
        //     markValue: null,
        //     unRealisedPosLossEv: '0',
        //     unRealisedPosLoss: null,
        //     estimatedOrdLossEv: '0',
        //     estimatedOrdLoss: '0E-8',
        //     usedBalanceEv: '111202',
        //     usedBalance: '11.12020000',
        //     takeProfitEp: '0',
        //     takeProfit: null,
        //     stopLossEp: '0',
        //     stopLoss: null,
        //     cumClosedPnlEv: '-1546',
        //     cumFundingFeeEv: '1605',
        //     cumTransactFeeEv: '8438',
        //     realisedPnlEv: '0',
        //     realisedPnl: null,
        //     cumRealisedPnlEv: '0',
        //     cumRealisedPnl: null,
        //     transactTimeNs: '1641571200001885324',
        //     takerFeeRateEr: '0',
        //     makerFeeRateEr: '0',
        //     term: '6',
        //     lastTermEndTimeNs: '1607711882505745356',
        //     lastFundingTimeNs: '1641571200000000000',
        //     curTermRealisedPnlEv: '-1567',
        //     execSeq: '12112761561'
        //   }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const collateral = this.safeString (position, 'positionMargin');
        const notionalString = this.safeString (position, 'value');
        const maintenanceMarginPercentageString = this.safeString (position, 'maintMarginReq');
        const maintenanceMarginString = Precise.stringMul (notionalString, maintenanceMarginPercentageString);
        const initialMarginString = this.safeString (position, 'assignedPosBalance');
        const initialMarginPercentageString = Precise.stringDiv (initialMarginString, notionalString);
        const liquidationPrice = this.safeNumber (position, 'liquidationPrice');
        const markPriceString = this.safeString (position, 'markPrice');
        const contracts = this.safeString (position, 'size');
        const contractSize = this.safeValue (market, 'contractSize');
        const contractSizeString = this.numberToString (contractSize);
        const leverage = this.safeNumber (position, 'leverage');
        const entryPriceString = this.safeString (position, 'avgEntryPrice');
        const rawSide = this.safeString (position, 'side');
        let side = undefined;
        if (rawSide !== undefined) {
            side = (rawSide === 'Buy') ? 'long' : 'short';
        }
        let priceDiff = undefined;
        const currency = this.safeString (position, 'currency');
        if (currency === 'USD') {
            if (side === 'long') {
                priceDiff = Precise.stringSub (markPriceString, entryPriceString);
            } else {
                priceDiff = Precise.stringSub (entryPriceString, markPriceString);
            }
        } else {
            // inverse
            if (side === 'long') {
                priceDiff = Precise.stringSub (Precise.stringDiv ('1', entryPriceString), Precise.stringDiv ('1', markPriceString));
            } else {
                priceDiff = Precise.stringSub (Precise.stringDiv ('1', markPriceString), Precise.stringDiv ('1', entryPriceString));
            }
        }
        const unrealizedPnl = Precise.stringMul (Precise.stringMul (priceDiff, contracts), contractSizeString);
        const percentage = Precise.stringMul (Precise.stringDiv (unrealizedPnl, initialMarginString), '100');
        const marginRatio = Precise.stringDiv (maintenanceMarginString, collateral);
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': this.parseNumber (contracts),
            'contractSize': contractSize,
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'leverage': leverage,
            'liquidationPrice': liquidationPrice,
            'collateral': this.parseNumber (collateral),
            'notional': this.parseNumber (notionalString),
            'markPrice': this.parseNumber (markPriceString), // markPrice lags a bit ¯\_(ツ)_/¯
            'entryPrice': this.parseNumber (entryPriceString),
            'timestamp': undefined,
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentageString),
            'maintenanceMargin': this.parseNumber (maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentageString),
            'marginRatio': this.parseNumber (marginRatio),
            'datetime': undefined,
            'marginMode': undefined,
            'side': side,
            'hedged': false,
            'percentage': this.parseNumber (percentage),
        };
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch funding history for
         * @param {int|undefined} limit the maximum number of funding history structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-history-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'limit': 20, // Page size default 20, max 200
            // 'offset': 0, // Page start default 0
        };
        if (limit > 200) {
            throw new BadRequest (this.id + ' fetchFundingHistory() limit argument cannot exceed 200');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetApiDataFuturesFundingFees (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "BTCUSD",
        //                     "currency": "BTC",
        //                     "execQty": 18,
        //                     "side": "Buy",
        //                     "execPriceEp": 360086455,
        //                     "execValueEv": 49987,
        //                     "fundingRateEr": 10000,
        //                     "feeRateEr": 10000,
        //                     "execFeeEv": 5,
        //                     "createTime": 1651881600000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeValue (data, 'rows', []);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const entry = rows[i];
            const timestamp = this.safeInteger (entry, 'createTime');
            result.push ({
                'info': entry,
                'symbol': this.safeString (entry, 'symbol'),
                'code': this.safeCurrencyCode (this.safeString (entry, 'currency')),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': undefined,
                'amount': this.fromEv (this.safeString (entry, 'execFeeEv'), market),
            });
        }
        return result;
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name phemex#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        let response = {};
        if (!market['linear']) {
            response = await this.v1GetMdTicker24hr (this.extend (request, params));
        } else {
            response = await this.v2GetMdV2Ticker24hr (this.extend (request, params));
        }
        //
        //     {
        //         "error": null,
        //         "id": 0,
        //         "result": {
        //             "askEp": 2332500,
        //             "bidEp": 2331000,
        //             "fundingRateEr": 10000,
        //             "highEp": 2380000,
        //             "indexEp": 2329057,
        //             "lastEp": 2331500,
        //             "lowEp": 2274000,
        //             "markEp": 2329232,
        //             "openEp": 2337500,
        //             "openInterest": 1298050,
        //             "predFundingRateEr": 19921,
        //             "symbol": "ETHUSD",
        //             "timestamp": 1592474241582701416,
        //             "turnoverEv": 47228362330,
        //             "volume": 4053863
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseFundingRate (result, market);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //         "askEp": 2332500,
        //         "bidEp": 2331000,
        //         "fundingRateEr": 10000,
        //         "highEp": 2380000,
        //         "indexEp": 2329057,
        //         "lastEp": 2331500,
        //         "lowEp": 2274000,
        //         "markEp": 2329232,
        //         "openEp": 2337500,
        //         "openInterest": 1298050,
        //         "predFundingRateEr": 19921,
        //         "symbol": "ETHUSD",
        //         "timestamp": 1592474241582701416,
        //         "turnoverEv": 47228362330,
        //         "volume": 4053863
        //     }
        //
        // linear swap v2
        //
        //     {
        //         "closeRp":"16820.5",
        //         "fundingRateRr":"0.0001",
        //         "highRp":"16962.1",
        //         "indexPriceRp":"16830.15651565",
        //         "lowRp":"16785",
        //         "markPriceRp":"16830.97534951",
        //         "openInterestRv":"1323.596",
        //         "openRp":"16851.7",
        //         "predFundingRateRr":"0.0001",
        //         "symbol":"BTCUSDT",
        //         "timestamp":"1672142789065593096",
        //         "turnoverRv":"124835296.0538",
        //         "volumeRq":"7406.95"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeIntegerProduct (contract, 'timestamp', 0.000001);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.fromEp (this.safeString2 (contract, 'markEp', 'markPriceRp'), market),
            'indexPrice': this.fromEp (this.safeString2 (contract, 'indexEp', 'indexPriceRp'), market),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.fromEr (this.safeString (contract, 'fundingRateEr'), market),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': this.fromEr (this.safeString2 (contract, 'predFundingRateEr', 'predFundingRateRr'), market),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async setMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name phemex#setMargin
         * @description Either adds or reduces margin in an isolated position in order to set the margin to a specific value
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#assign-position-balance-in-isolated-marign-mode
         * @param {string} symbol unified market symbol of the market to set margin in
         * @param {float} amount the amount to set the margin to
         * @param {object} params parameters specific to the phemex api endpoint
         * @returns {object} A [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#add-margin-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'posBalanceEv': this.toEv (amount, market),
        };
        const response = await this.privatePostPositionsAssign (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data": "OK"
        //     }
        //
        return this.extend (this.parseMarginModification (response, market), {
            'amount': amount,
        });
    }

    parseMarginStatus (status) {
        const statuses = {
            '0': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseMarginModification (data, market = undefined) {
        //
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data": "OK"
        //     }
        //
        market = this.safeMarket (undefined, market);
        const inverse = this.safeValue (market, 'inverse');
        const codeCurrency = inverse ? 'base' : 'quote';
        return {
            'info': data,
            'type': 'set',
            'amount': undefined,
            'total': undefined,
            'code': market[codeCurrency],
            'symbol': this.safeSymbol (undefined, market),
            'status': this.parseMarginStatus (this.safeString (data, 'code')),
        };
    }

    async setMarginMode (marginMode, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase ();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['type'] !== 'swap') {
            throw new BadSymbol (this.id + ' setMarginMode() supports swap contracts only');
        }
        let leverage = this.safeInteger (params, 'leverage');
        if (marginMode === 'cross') {
            leverage = 0;
        }
        if (leverage === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a leverage parameter');
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.privatePutPositionsLeverage (this.extend (request, params));
    }

    async fetchLeverageTiers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/en/latest/manual.html#leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicGetCfgV2Products (params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             "ratioScale":8,
        //             "currencies":[
        //                 {"currency":"BTC","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"Bitcoin"},
        //                 {"currency":"USD","valueScale":4,"minValueEv":1,"maxValueEv":500000000000000,"name":"USD"},
        //                 {"currency":"USDT","valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"name":"TetherUS"},
        //             ],
        //             "products":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "displaySymbol":"BTC / USD",
        //                     "indexSymbol":".BTC",
        //                     "markSymbol":".MBTC",
        //                     "fundingRateSymbol":".BTCFR",
        //                     "fundingRate8hSymbol":".BTCFR8H",
        //                     "contractUnderlyingAssets":"USD",
        //                     "settleCurrency":"BTC",
        //                     "quoteCurrency":"USD",
        //                     "contractSize":1.0,
        //                     "lotSize":1,
        //                     "tickSize":0.5,
        //                     "priceScale":4,
        //                     "ratioScale":8,
        //                     "pricePrecision":1,
        //                     "minPriceEp":5000,
        //                     "maxPriceEp":10000000000,
        //                     "maxOrderQty":1000000,
        //                     "type":"Perpetual"
        //                 },
        //                 {
        //                     "symbol":"sBTCUSDT",
        //                     "displaySymbol":"BTC / USDT",
        //                     "quoteCurrency":"USDT",
        //                     "pricePrecision":2,
        //                     "type":"Spot",
        //                     "baseCurrency":"BTC",
        //                     "baseTickSize":"0.000001 BTC",
        //                     "baseTickSizeEv":100,
        //                     "quoteTickSize":"0.01 USDT",
        //                     "quoteTickSizeEv":1000000,
        //                     "minOrderValue":"10 USDT",
        //                     "minOrderValueEv":1000000000,
        //                     "maxBaseOrderSize":"1000 BTC",
        //                     "maxBaseOrderSizeEv":100000000000,
        //                     "maxOrderValue":"5,000,000 USDT",
        //                     "maxOrderValueEv":500000000000000,
        //                     "defaultTakerFee":"0.001",
        //                     "defaultTakerFeeEr":100000,
        //                     "defaultMakerFee":"0.001",
        //                     "defaultMakerFeeEr":100000,
        //                     "baseQtyPrecision":6,
        //                     "quoteQtyPrecision":2
        //                 },
        //             ],
        //             "riskLimits":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "steps":"50",
        //                     "riskLimits":[
        //                         {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //                         {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //                         {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //                     ]
        //                 },
        //             ],
        //             "leverages":[
        //                 {"initialMargin":"1.0%","initialMarginEr":1000000,"options":[1,2,3,5,10,25,50,100]},
        //                 {"initialMargin":"1.5%","initialMarginEr":1500000,"options":[1,2,3,5,10,25,50,66]},
        //                 {"initialMargin":"2.0%","initialMarginEr":2000000,"options":[1,2,3,5,10,25,33,50]},
        //             ]
        //         }
        //     }
        //
        //
        const data = this.safeValue (response, 'data', {});
        const riskLimits = this.safeValue (data, 'riskLimits');
        return this.parseLeverageTiers (riskLimits, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market = undefined) {
        /**
         * @param {object} info Exchange market response for 1 market
         * @param {object} market CCXT market
         */
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "steps":"50",
        //         "riskLimits":[
        //             {"limit":100,"initialMargin":"1.0%","initialMarginEr":1000000,"maintenanceMargin":"0.5%","maintenanceMarginEr":500000},
        //             {"limit":150,"initialMargin":"1.5%","initialMarginEr":1500000,"maintenanceMargin":"1.0%","maintenanceMarginEr":1000000},
        //             {"limit":200,"initialMargin":"2.0%","initialMarginEr":2000000,"maintenanceMargin":"1.5%","maintenanceMarginEr":1500000},
        //         ]
        //     },
        //
        market = this.safeMarket (undefined, market);
        const riskLimits = (market['info']['riskLimits']);
        const tiers = [];
        let minNotional = 0;
        for (let i = 0; i < riskLimits.length; i++) {
            const tier = riskLimits[i];
            const maxNotional = this.safeInteger (tier, 'limit');
            tiers.push ({
                'tier': this.sum (i, 1),
                'currency': market['settle'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeString (tier, 'maintenanceMargin'),
                'maxLeverage': undefined,
                'info': tier,
            });
            minNotional = maxNotional;
        }
        return tiers;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const requestPath = '/' + this.implodeParams (path, params);
        let url = requestPath;
        let queryString = '';
        if ((method === 'GET') || (method === 'DELETE') || (method === 'PUT') || (url === '/positions/assign')) {
            if (Object.keys (query).length) {
                queryString = this.urlencodeWithArrayRepeat (query);
                url += '?' + queryString;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.seconds ();
            const xPhemexRequestExpiry = this.safeInteger (this.options, 'x-phemex-request-expiry', 60);
            const expiry = this.sum (timestamp, xPhemexRequestExpiry);
            const expiryString = expiry.toString ();
            headers = {
                'x-phemex-access-token': this.apiKey,
                'x-phemex-request-expiry': expiryString,
            };
            let payload = '';
            if (method === 'POST') {
                payload = this.json (params);
                body = payload;
                headers['Content-Type'] = 'application/json';
            }
            const auth = requestPath + queryString + expiryString + payload;
            headers['x-phemex-request-signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        url = this.implodeHostname (this.urls['api'][api]) + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name phemex#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} response from the exchange
         */
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 1) || (leverage > 100)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and 100');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.privatePutPositionsLeverage (this.extend (request, params));
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name phemex#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @param {string|undefined} params.bizType for transferring between main and sub-acounts either 'SPOT' or 'PERPETUAL' default is 'SPOT'
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const scaledAmmount = this.toEv (amount, currency);
        let direction = undefined;
        let transfer = undefined;
        if (fromId === 'spot' && toId === 'future') {
            direction = 2;
        } else if (fromId === 'future' && toId === 'spot') {
            direction = 1;
        }
        if (direction !== undefined) {
            const request = {
                'currency': currency['id'],
                'moveOp': direction,
                'amountEv': scaledAmmount,
            };
            const response = await this.privatePostAssetsTransfer (this.extend (request, params));
            //
            //     {
            //         code: '0',
            //         msg: 'OK',
            //         data: {
            //             linkKey: '8564eba4-c9ec-49d6-9b8c-2ec5001a0fb9',
            //             userId: '4018340',
            //             currency: 'USD',
            //             amountEv: '10',
            //             side: '2',
            //             status: '10'
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            transfer = this.parseTransfer (data, currency);
        } else { // sub account transfer
            const request = {
                'fromUserId': fromId,
                'toUserId': toId,
                'amountEv': scaledAmmount,
                'currency': currency['id'],
                'bizType': this.safeString (params, 'bizType', 'SPOT'),
            };
            const response = await this.privatePostAssetsUniversalTransfer (this.extend (request, params));
            //
            //     {
            //         code: '0',
            //         msg: 'OK',
            //         data: 'API-923db826-aaaa-aaaa-aaaa-4d98c3a7c9fd'
            //     }
            //
            transfer = this.parseTransfer (response);
        }
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            if (transfer['fromAccount'] === undefined) {
                transfer['fromAccount'] = fromAccount;
            }
            if (transfer['toAccount'] === undefined) {
                transfer['toAccount'] = toAccount;
            }
            if (transfer['amount'] === undefined) {
                transfer['amount'] = amount;
            }
            if (transfer['currency'] === undefined) {
                transfer['currency'] = code;
            }
        }
        return transfer;
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name phemex#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a code argument');
        }
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAssetsTransfer (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "rows": [
        //                 {
        //                     "linkKey": "87c071a3-8628-4ac2-aca1-6ce0d1fad66c",
        //                     "userId": 4148428,
        //                     "currency": "BTC",
        //                     "amountEv": 67932,
        //                     "side": 2,
        //                     "status": 10,
        //                     "createTime": 1652832467000,
        //                     "bizType": 10
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transfers = this.safeValue (data, 'rows', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         linkKey: '8564eba4-c9ec-49d6-9b8c-2ec5001a0fb9',
        //         userId: '4018340',
        //         currency: 'USD',
        //         amountEv: '10',
        //         side: '2',
        //         status: '10'
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "linkKey": "87c071a3-8628-4ac2-aca1-6ce0d1fad66c",
        //         "userId": 4148428,
        //         "currency": "BTC",
        //         "amountEv": 67932,
        //         "side": 2,
        //         "status": 10,
        //         "createTime": 1652832467000,
        //         "bizType": 10
        //     }
        //
        const id = this.safeString (transfer, 'linkKey');
        const status = this.safeString (transfer, 'status');
        const amountEv = this.safeString (transfer, 'amountEv');
        const amountTransfered = this.fromEv (amountEv, currency);
        const currencyId = this.safeString (transfer, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const side = this.safeInteger (transfer, 'side');
        let fromId = undefined;
        let toId = undefined;
        if (side === 1) {
            fromId = 'swap';
            toId = 'spot';
        } else if (side === 2) {
            fromId = 'spot';
            toId = 'swap';
        }
        const timestamp = this.safeInteger (transfer, 'createTime');
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amountTransfered,
            'fromAccount': fromId,
            'toAccount': toId,
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            '3': 'rejected', // 'Rejected',
            '6': 'canceled', // 'Got error and wait for recovery',
            '10': 'ok', // 'Success',
            '11': 'failed', // 'Failed',
        };
        return this.safeString (statuses, status, status);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"code":30018,"msg":"phemex.data.size.uplimt","data":null}
        //     {"code":412,"msg":"Missing parameter - resolution","data":null}
        //     {"code":412,"msg":"Missing parameter - to","data":null}
        //     {"error":{"code":6001,"message":"invalid argument"},"id":null,"result":null}
        //
        const error = this.safeValue (response, 'error', response);
        const errorCode = this.safeString (error, 'code');
        const message = this.safeString (error, 'msg');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
