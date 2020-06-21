'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadSymbol, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, OrderNotFound, InvalidAddress, BadRequest, RateLimitExceeded, PermissionDenied, ExchangeNotAvailable, AccountSuspended, OnMaintenance, CancelPending, DDoSProtection, DuplicateOrderId, NotSupported } = require ('./base/errors');
const { TICK_SIZE, ROUND, DECIMAL_PLACES } = require ('./base/functions/number');

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
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchBalance': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/83165440-2f1cf200-a116-11ea-9046-a255d09fb2ed.jpg',
                'test': {
                    'v1': 'https://testnet-api.phemex.com/v1',
                    'public': 'https://testnet-api.phemex.com/exchange/public',
                    'private': 'https://testnet-api.phemex.com',
                },
                'api': {
                    'v1': 'https://api.phemex.com/v1',
                    'public': 'https://api.phemex.com/exchange/public',
                    // 'public': 'https://api.phemex.com',
                    'private': 'https://api.phemex.com',
                },
                'www': 'https://phemex.com',
                'doc': 'https://github.com/phemex/phemex-api-docs',
                'fees': 'https://phemex.com/fees-conditions',
                'referral': 'https://phemex.com/register?referralCode=EDNVJ',
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
                        'products', // contracts only
                        'nomics/trades', // ?market=<symbol>&since=<since>
                        'md/kline', // ?from=1589811875&resolution=1800&symbol=sBTCUSDT&to=1592457935
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
                        'orders/activeList', // ?symbol=<symbol>
                        'exchange/order/list', // ?symbol=<symbol>&start=<start>&end=<end>&offset=<offset>&limit=<limit>&ordStatus=<ordStatus>&withCount=<withCount>
                        'exchange/order', // ?symbol=<symbol>&orderID=<orderID1,orderID2>
                        // 'exchange/order', // ?symbol=<symbol>&clOrdID=<clOrdID1,clOrdID2>
                        'exchange/order/trade', // ?symbol=<symbol>&start=<start>&end=<end>&limit=<limit>&offset=<offset>&withCount=<withCount>
                        'phemex-user/users/children', // ?offset=<offset>&limit=<limit>&withCount=<withCount>
                        'phemex-user/wallets/v2/depositAddress', // ?_t=1592722635531&currency=USDT
                        'exchange/margins/transfer', // ?start=<start>&end=<end>&offset=<offset>&limit=<limit>&withCount=<withCount>
                        'exchange/wallets/confirm/withdraw', // ?code=<withdrawConfirmCode>
                        'exchange/wallets/withdrawList', // ?currency=<currency>&limit=<limit>&offset=<offset>&withCount=<withCount>
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
                    'taker': 0.1 / 100,
                    'maker': 0.1 / 100,
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
                    // not documented
                    '30018': BadRequest, // {"code":30018,"msg":"phemex.data.size.uplimt","data":null}
                    '39996': PermissionDenied, // {"code": "39996","msg": "Access denied."}
                },
                'broad': {
                    'Failed to find api-key': AuthenticationError, // {"msg":"Failed to find api-key 1c5ec63fd-660d-43ea-847a-0d3ba69e106e","code":10500}
                    'Missing required parameter': BadRequest, // {"msg":"Missing required parameter","code":10500}
                    'API Signature verification failed': AuthenticationError, // {"msg":"API Signature verification failed.","code":10500}
                },
            },
            'options': {
                'x-phemex-request-expiry': 60, // in seconds
                'createOrderByQuoteRequiresPrice': true,
            },
        });
    }

    parseSafeFloat (value = undefined) {
        if (value === undefined) {
            return value;
        }
        value = value.replace (',', '');
        const parts = value.split (' ');
        return this.safeFloat (parts, 0);
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
        //         "type":"Perpetual"
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
        const quoteId = this.safeString (market, 'quoteCurrency');
        const baseId = this.safeString (market, 'baseCurrency');
        const type = this.safeStringLower (market, 'type');
        let taker = undefined;
        let maker = undefined;
        let inverse = false;
        const spot = false;
        const swap = true;
        const settleCurrency = this.safeString (market, 'settleCurrency');
        if (settleCurrency !== quoteId) {
            inverse = true;
        }
        const linear = !inverse;
        const precision = {
            'amount': this.safeFloat (market, 'lotSize'),
            'price': this.safeFloat (market, 'tickSize'),
        };
        const priceScale = this.safeInteger (market, 'priceScale');
        const ratioScale = this.safeInteger (market, 'ratioScale');
        // const valueScale = this.safeInteger (market, 'valueScale');
        const minPriceEp = this.safeFloat (market, 'minPriceEp');
        const maxPriceEp = this.safeFloat (market, 'maxPriceEp');
        const makerFeeRateEr = this.safeFloat (market, 'makerFeeRateEr');
        const takerFeeRateEr = this.safeFloat (market, 'takerFeeRateEr');
        maker = this.fromEn (makerFeeRateEr, ratioScale, 0.00000001);
        taker = this.fromEn (takerFeeRateEr, ratioScale, 0.00000001);
        const limits = {
            'amount': {
                'min': precision['amount'],
                'max': undefined,
            },
            'price': {
                'min': this.fromEn (minPriceEp, priceScale, precision['price']),
                'max': this.fromEn (maxPriceEp, priceScale, precision['price']),
            },
            'cost': {
                'min': undefined,
                'max': this.parseSafeFloat (this.safeString (market, 'maxOrderQty')),
            },
        };
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const active = undefined;
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'type': type,
            'spot': spot,
            'swap': swap,
            'linear': linear,
            'inverse': inverse,
            'active': active,
            'taker': taker,
            'maker': maker,
            'priceScale': priceScale,
            'valueScale': 0, // valueScale,
            'ratioScale': ratioScale,
            // 'ep': ep,
            // 'er': er,
            // 'ev': 1,
            'precision': precision,
            'limits': limits,
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
        //         "quoteQtyPrecision":2
        //     }
        //
        const type = this.safeStringLower (market, 'type');
        const id = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const baseId = this.safeString (market, 'baseCurrency');
        const linear = undefined;
        const inverse = undefined;
        const spot = true;
        const swap = false;
        const taker = this.safeFloat (market, 'defaultTakerFee');
        const maker = this.safeFloat (market, 'defaultMakerFee');
        const precision = {
            'amount': this.parseSafeFloat (this.safeString (market, 'baseTickSize')),
            'price': this.parseSafeFloat (this.safeString (market, 'quoteTickSize')),
        };
        const limits = {
            'amount': {
                'min': precision['amount'],
                'max': this.parseSafeFloat (this.safeString (market, 'maxBaseOrderSize')),
            },
            'price': {
                'min': precision['price'],
                'max': undefined,
            },
            'cost': {
                'min': this.parseSafeFloat (this.safeString (market, 'minOrderValue')),
                'max': this.parseSafeFloat (this.safeString (market, 'maxOrderValue')),
            },
        };
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const active = undefined;
        // const baseQtyPrecision = this.safeInteger (market, 'baseQtyPrecision');
        // const quoteTickSizeEv = this.safeInteger (market, 'quoteTickSizeEv');
        // const quoteTickSizeEvLog10 = Math.log10 (quoteTickSizeEv);
        // const priceFactor = parseFloat (this.decimalToPrecision (Math.pow (0.1, quoteTickSizeEvLog10), ROUND, 0.00000001, this.precisionMode));
        // const amountFactor = parseFloat (this.decimalToPrecision (Math.pow (10, -baseQtyPrecision), ROUND, 0.00000001, this.precisionMode));
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'type': type,
            'spot': spot,
            'swap': swap,
            'linear': linear,
            'inverse': inverse,
            'active': active,
            'taker': taker,
            'maker': maker,
            'precision': precision,
            'priceScale': 8,
            'valueScale': 8,
            'ratioScale': 8,
            'ep': 0.00000001,
            'er': 0.00000001,
            'ev': 0.00000001,
            'limits': limits,
        };
    }

    async fetchMarkets (params = {}) {
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
            if (type === 'perpetual') {
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
            const valueScale = this.safeInteger (currency, 'valueScale');
            const minValueEv = this.safeFloat (currency, 'minValueEv');
            const maxValueEv = this.safeFloat (currency, 'maxValueEv');
            let minAmount = undefined;
            let maxAmount = undefined;
            let precision = undefined;
            if (valueScale !== undefined) {
                precision = Math.pow (10, -valueScale);
                precision = parseFloat (this.decimalToPrecision (precision, ROUND, 0.00000001, this.precisionMode));
                if (minValueEv !== undefined) {
                    minAmount = parseFloat (this.decimalToPrecision (minValueEv * precision, ROUND, 0.00000001, this.precisionMode));
                }
                if (maxValueEv !== undefined) {
                    maxAmount = parseFloat (this.decimalToPrecision (maxValueEv * precision, ROUND, 0.00000001, this.precisionMode));
                }
            }
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': maxAmount,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
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
            throw new ArgumentsRequired (this.id + ' parseBidAsk requires a market argument');
        }
        return [
            this.fromEp (this.safeFloat (bidask, priceKey), market),
            this.fromEv (this.safeFloat (bidask, amountKey), market),
        ];
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market = undefined) {
        const result = {
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
        const orderbook = this.parseOrderBook (book, timestamp, 'bids', 'asks', 0, 1, market);
        orderbook['nonce'] = this.safeInteger (result, 'sequence');
        return orderbook;
    }

    toEn (n, scale, precision) {
        return parseInt (this.decimalToPrecision (n * Math.pow (10, scale), ROUND, precision, DECIMAL_PLACES));
    }

    toEv (amount, market = undefined) {
        if ((amount === undefined) || (market === undefined)) {
            return amount;
        }
        return this.toEn (amount, market['valueScale'], 0);
    }

    toEp (price, market = undefined) {
        if ((price === undefined) || (market === undefined)) {
            return price;
        }
        return this.toEn (price, market['priceScale'], 0);
    }

    fromEn (en, scale, precision, precisionMode = undefined) {
        precisionMode = (precisionMode === undefined) ? this.precisionMode : precisionMode;
        return parseFloat (this.decimalToPrecision (en * Math.pow (10, -scale), ROUND, precision, precisionMode));
    }

    fromEp (ep, market = undefined) {
        if ((ep === undefined) || (market === undefined)) {
            return ep;
        }
        return this.fromEn (ep, market['priceScale'], market['precision']['price']);
    }

    fromEv (ev, market = undefined) {
        if ((ev === undefined) || (market === undefined)) {
            return ev;
        }
        return this.fromEn (ev, market['valueScale'], market['precision']['amount']);
    }

    fromEr (er, market = undefined) {
        if ((er === undefined) || (market === undefined)) {
            return er;
        }
        return this.fromEn (er, market['ratioScale'], market['precision']['amount']);
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
        return [
            this.safeTimestamp (ohlcv, 0),
            this.fromEp (this.safeFloat (ohlcv, 3), market),
            this.fromEp (this.safeFloat (ohlcv, 4), market),
            this.fromEp (this.safeFloat (ohlcv, 5), market),
            this.fromEp (this.safeFloat (ohlcv, 6), market),
            this.fromEv (this.safeFloat (ohlcv, 7), market),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            // 'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
            // 'from': 1588830682, // seconds
            // 'to': this.seconds (),
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.seconds ();
        if (since !== undefined) {
            if (limit === undefined) {
                limit = 2000; // max 2000
            }
            since = parseInt (since / 1000);
            request['from'] = since;
            request['to'] = this.sum (since, duration * limit);
        } else if (limit !== undefined) {
            limit = Math.min (limit, 2000);
            request['from'] = now - duration * this.sum (limit, 1);
            request['to'] = now;
        } else {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a since argument, or a limit argument, or both');
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
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeIntegerProduct (ticker, 'timestamp', 0.000001);
        const last = this.fromEp (this.safeFloat (ticker, 'lastEp'), market);
        const quoteVolume = this.fromEp (this.safeFloat (ticker, 'turnoverEv'), market);
        const baseVolume = this.fromEv (this.safeFloat2 (ticker, 'volumeEv', 'volume'), market);
        let vwap = undefined;
        if (market['spot']) {
            if ((quoteVolume !== undefined) && (baseVolume !== undefined) && (baseVolume > 0)) {
                vwap = quoteVolume / baseVolume;
            }
        }
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        const open = this.fromEp (this.safeFloat (ticker, 'openEp'), market);
        if ((open !== undefined) && (last !== undefined)) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, last) / 2;
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.fromEp (this.safeFloat (ticker, 'highEp'), market),
            'low': this.fromEp (this.safeFloat (ticker, 'lowEp'), market),
            'bid': this.fromEp (this.safeFloat (ticker, 'bidEp'), market),
            'bidVolume': undefined,
            'ask': this.fromEp (this.safeFloat (ticker, 'askEp'), market),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        const method = market['spot'] ? 'v1GetMdSpotTicker24hr' : 'v1GetMdTicker24hr';
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
        let price = undefined;
        let amount = undefined;
        let timestamp = undefined;
        let id = undefined;
        let side = undefined;
        let cost = undefined;
        const fee = undefined;
        let symbol = undefined;
        if (Array.isArray (trade)) {
            timestamp = this.safeIntegerProduct (trade, 0, 0.000001);
            id = this.safeString (trade, 1);
            side = this.safeStringLower (trade, 2);
            if (market !== undefined) {
                price = this.fromEp (this.safeFloat (trade, 3), market);
                amount = this.fromEv (this.safeFloat (trade, 4), market);
                if (market['spot']) {
                    if ((price !== undefined) && (amount !== undefined)) {
                        cost = price * amount;
                    }
                }
            }
        } else {
        }
        // const timestamp = this.safeInteger (trade, 'timestamp');
        // const side = this.safeString (trade, 'side');
        // const id = this.safeString2 (trade, 'id', 'fillId');
        // const marketId = this.safeInteger (trade, 'market');
        // let symbol = undefined;
        // if (marketId !== undefined) {
        //     if (marketId in this.markets_by_id) {
        //         market = this.markets_by_id[marketId];
        //     } else {
        //         const [ baseId, quoteId ] = marketId.split ('-');
        //         const base = this.safeCurrencyCode (baseId);
        //         const quote = this.safeCurrencyCode (quoteId);
        //         symbol = base + '/' + quote;
        //     }
        // }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        // const taker = this.safeValue (trade, 'taker');
        // let takerOrMaker = undefined;
        // if (taker !== undefined) {
        //     takerOrMaker = taker ? 'taker' : 'maker';
        // }
        // const feeCost = this.safeFloat (trade, 'fee');
        // let fee = undefined;
        // if (feeCost !== undefined) {
        //     const feeCurrencyId = this.safeString (trade, 'feeCurrency');
        //     const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
        //     fee = {
        //         'cost': feeCost,
        //         'currency': feeCurrencyCode,
        //     };
        // }
        // const orderId = this.safeString (trade, 'orderId');
        return {
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
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
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const currency = this.safeValue (this.currencies, code, {});
            const scale = this.safeInteger (currency, 'valueScale', 8);
            const account = this.account ();
            const balanceEv = this.safeFloat (balance, 'balanceEv');
            const lockedTradingBalanceEv = this.safeFloat (balance, 'lockedTradingBalanceEv');
            const lockedWithdrawEv = this.safeFloat (balance, 'lockedWithdrawEv');
            const total = this.fromEn (balanceEv, scale, scale, DECIMAL_PLACES);
            const lockedTradingBalance = this.fromEn (lockedTradingBalanceEv, scale, scale, DECIMAL_PLACES);
            const lockedWithdraw = this.fromEn (lockedWithdrawEv, scale, scale, DECIMAL_PLACES);
            const used = this.sum (lockedTradingBalance, lockedWithdraw);
            account['total'] = total;
            account['used'] = used;
            result[code] = account;
        }
        return this.parseBalance (result);
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
        const accountBalanceEv = this.safeFloat (balance, 'accountBalanceEv');
        const totalUsedBalanceEv = this.safeFloat (balance, 'totalUsedBalanceEv');
        const valueScale = this.safeInteger (currency, 'valueScale', 8);
        account['total'] = this.fromEn (accountBalanceEv, valueScale, valueScale, DECIMAL_PLACES);
        account['used'] = this.fromEn (totalUsedBalanceEv, valueScale, valueScale, DECIMAL_PLACES);
        result[code] = account;
        return this.parseBalance (result);
    }

    async fetchBalance (params = {}) {
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
                    throw new ArgumentsRequired (this.id + ' fetchBalance requires a code parameter or a currency parameter for ' + type + ' type');
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
        const id = this.safeString (order, 'orderID');
        let clientOrderId = this.safeString (order, 'clOrdID');
        if (clientOrderId.length < 1) {
            clientOrderId = undefined;
        }
        const marketId = this.safeString (order, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        const price = this.fromEp (this.safeFloat (order, 'priceEp'), market);
        const amount = this.fromEv (this.safeFloat (order, 'baseQtyEv'), market);
        const remaining = this.fromEv (this.safeFloat (order, 'leavesBaseQtyEv'), market);
        const filled = this.fromEv (this.safeFloat (order, 'cumBaseQtyEv'), market);
        const cost = this.fromEv (this.safeFloat (order, 'cumQuoteQtyEv'), market);
        const average = this.fromEp (this.safeFloat (order, 'avgPriceEp'), market);
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const side = this.safeStringLower (order, 'side');
        const type = this.parseOrderType (this.safeString (order, 'orderType'));
        const timestamp = this.safeIntegerProduct (order, 'actionTimeNs', 0.000001);
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        const feeCost = this.fromEv (this.safeFloat (order, 'cumFeeEv'), market);
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
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
        //         "ordStatus":"Created"
        //     }
        //
        const id = this.safeString (order, 'orderID');
        let clientOrderId = this.safeString (order, 'clOrdID');
        if (clientOrderId.length < 1) {
            clientOrderId = undefined;
        }
        const marketId = this.safeString (order, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const side = this.safeStringLower (order, 'side');
        const type = this.parseOrderType (this.safeString (order, 'orderType'));
        const price = this.fromEp (this.safeInteger (order, 'priceEp'), market);
        const amount = this.safeFloat (order, 'orderQty');
        const filled = this.safeFloat (order, 'cumQty');
        const remaining = this.safeFloat (order, 'leavesQty');
        const timestamp = this.safeIntegerProduct (order, 'actionTimeNs', 0.000001);
        let lastTradeTimestamp = this.safeIntegerProduct (order, 'transactTimeNs', 0.000001);
        if (lastTradeTimestamp === 0) {
            lastTradeTimestamp = undefined;
        }
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
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
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'defaultType', 'fetchBalance', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        if (orderType === undefined) {
            throw ArgumentsRequired (this.id + ' createOrder requires a type parameter, spot or swap');
        }
        side = this.capitalize (side);
        type = this.capitalize (type);
        const request = {
            // common
            'symbol': market['id'],
            'side': side, // Sell, Buy
            'ordType': type, // Market, Limit, Stop, StopLimit, MarketIfTouched, LimitIfTouched or Pegged for swap orders
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
        if (market['spot']) {
            let qtyType = this.safeValue (params, 'qtyType', 'ByBase');
            if (price !== undefined) {
                qtyType = 'ByQuote';
            }
            request['qtyType'] = qtyType;
            if (qtyType === 'ByQuote') {
                let cost = this.safeFloat (params, 'cost');
                params = this.omit (params, 'cost');
                if (this.options['createOrderByQuoteRequiresPrice']) {
                    if (price !== undefined) {
                        cost = amount * price;
                    } else if (cost === undefined) {
                        throw new ArgumentsRequired (this.id + ' createOrder ' + qtyType + ' requires a price argument or a cost parameter');
                    }
                }
                cost = (cost === undefined) ? amount : cost;
                request['quoteQtyEv'] = this.toEp (cost, market);
            } else {
                request['baseQtyEv'] = this.toEv (amount, market);
            }
        } else if (market['swap']) {
            request['orderQty'] = this.toEv (amount, market);
        }
        if (type === 'Limit') {
            request['priceEp'] = this.toEp (price, market);
        }
        const method = market['spot'] ? 'privatePostSpotOrders' : 'privatePostOrders';
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

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'privateDeleteOrdersCancel';
        try {
            const response = await this[method] ({ 'orderID': id, 'symbol': marketID });
            const order = this.parseResponse (response);
            return this.parseOrder (order, market);
        } catch (e) {
            throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
        }
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
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
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const request = '/' + this.implodeParams (path, params);
        let url = request;
        let queryString = '';
        if ((method === 'GET') || (method === 'DELETE')) {
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
            if ((method === 'POST') || (method === 'PUT')) {
                payload = this.json (params);
                body = payload;
                headers['Content-Type'] = 'application/json';
            }
            const auth = request + queryString + expiryString + payload;
            headers['x-phemex-request-signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
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
