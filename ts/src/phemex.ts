
// ----------------------------------------------------------------------------

import Exchange from './abstract/phemex.js';
import { ExchangeError, BadSymbol, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, OrderNotFound, BadRequest, PermissionDenied, AccountSuspended, CancelPending, DDoSProtection, DuplicateOrderId, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { TransferEntry, Balances, Currency, FundingHistory, FundingRateHistory, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, MarginModification, Currencies, Dict, LeverageTier, LeverageTiers, int, FundingRate, DepositAddress, Conversion } from './base/types.js';

// ----------------------------------------------------------------------------

/**
 * @class phemex
 * @augments Exchange
 */
export default class phemex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'phemex',
            'name': 'Phemex',
            'countries': [ 'CN' ], // China
            'rateLimit': 120.5,
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
                'closePosition': false,
                'createConvertTrade': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchConvertQuote': true,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistories': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg',
                'test': {
                    'v1': 'https://testnet-api.phemex.com/v1',
                    'v2': 'https://testnet-api.phemex.com',
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
                'doc': 'https://phemex-docs.github.io/#overview',
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
                '3M': '7776000',
                '1Y': '31104000',
            },
            'api': {
                'public': {
                    'get': {
                        'cfg/v2/products': 5, // spot + contracts
                        'cfg/fundingRates': 5,
                        'products': 5, // contracts only
                        'nomics/trades': 5, // ?market=<symbol>&since=<since>
                        'md/kline': 5, // ?from=1589811875&resolution=1800&symbol=sBTCUSDT&to=1592457935
                        'md/v2/kline/list': 5, // perpetual api ?symbol=<symbol>&to=<to>&from=<from>&resolution=<resolution>
                        'md/v2/kline': 5, // ?symbol=<symbol>&resolution=<resolution>&limit=<limit>
                        'md/v2/kline/last': 5, // perpetual ?symbol=<symbol>&resolution=<resolution>&limit=<limit>
                        'md/orderbook': 5, // ?symbol=<symbol>
                        'md/trade': 5, // ?symbol=<symbol>
                        'md/spot/ticker/24hr': 5, // ?symbol=<symbol>
                        'exchange/public/cfg/chain-settings': 5, // ?currency=<currency>
                    },
                },
                'v1': {
                    'get': {
                        'md/fullbook': 5, // ?symbol=<symbol>
                        'md/orderbook': 5, // ?symbol=<symbol>
                        'md/trade': 5, // ?symbol=<symbol>&id=<id>
                        'md/ticker/24hr': 5, // ?symbol=<symbol>&id=<id>
                        'md/ticker/24hr/all': 5, // ?id=<id>
                        'md/spot/ticker/24hr': 5, // ?symbol=<symbol>&id=<id>
                        'md/spot/ticker/24hr/all': 5, // ?symbol=<symbol>&id=<id>
                        'exchange/public/products': 5, // contracts only
                        'api-data/public/data/funding-rate-history': 5,
                    },
                },
                'v2': {
                    'get': {
                        'public/products': 5,
                        'public/products-plus': 5,
                        'md/v2/orderbook': 5, // ?symbol=<symbol>&id=<id>
                        'md/v2/trade': 5, // ?symbol=<symbol>&id=<id>
                        'md/v2/ticker/24hr': 5, // ?symbol=<symbol>&id=<id>
                        'md/v2/ticker/24hr/all': 5, // ?id=<id>
                        'api-data/public/data/funding-rate-history': 5,
                    },
                },
                'private': {
                    'get': {
                        // spot
                        'spot/orders/active': 1, // ?symbol=<symbol>&orderID=<orderID>
                        // 'spot/orders/active': 5, // ?symbol=<symbol>&clOrDID=<clOrdID>
                        'spot/orders': 1, // ?symbol=<symbol>
                        'spot/wallets': 5, // ?currency=<currency>
                        'exchange/spot/order': 5, // ?symbol=<symbol>&ordStatus=<ordStatus5,orderStatus2>ordType=<ordType5,orderType2>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'exchange/spot/order/trades': 5, // ?symbol=<symbol>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'exchange/order/v2/orderList': 5, // ?symbol=<symbol>&currency=<currency>&ordStatus=<ordStatus>&ordType=<ordType>&start=<start>&end=<end>&offset=<offset>&limit=<limit>&withCount=<withCount></withCount>
                        'exchange/order/v2/tradingList': 5, // ?symbol=<symbol>&currency=<currency>&execType=<execType>&offset=<offset>&limit=<limit>&withCount=<withCount>
                        // swap
                        'accounts/accountPositions': 1, // ?currency=<currency>
                        'g-accounts/accountPositions': 1, // ?currency=<currency>
                        'accounts/positions': 25, // ?currency=<currency>
                        'api-data/futures/funding-fees': 5, // ?symbol=<symbol>
                        'api-data/g-futures/funding-fees': 5, // ?symbol=<symbol>
                        'api-data/futures/orders': 5, // ?symbol=<symbol>
                        'api-data/g-futures/orders': 5, // ?symbol=<symbol>
                        'api-data/futures/orders/by-order-id': 5, // ?symbol=<symbol>
                        'api-data/g-futures/orders/by-order-id': 5, // ?symbol=<symbol>
                        'api-data/futures/trades': 5, // ?symbol=<symbol>
                        'api-data/g-futures/trades': 5, // ?symbol=<symbol>
                        'api-data/futures/trading-fees': 5, // ?symbol=<symbol>
                        'api-data/g-futures/trading-fees': 5, // ?symbol=<symbol>
                        'api-data/futures/v2/tradeAccountDetail': 5, // ?currency=<currecny>&type=<type>&limit=<limit>&offset=<offset>&start=<start>&end=<end>&withCount=<withCount>
                        'g-orders/activeList': 1, // ?symbol=<symbol>
                        'orders/activeList': 1, // ?symbol=<symbol>
                        'exchange/order/list': 5, // ?symbol=<symbol>&start=<start>&end=<end>&offset=<offset>&limit=<limit>&ordStatus=<ordStatus>&withCount=<withCount>
                        'exchange/order': 5, // ?symbol=<symbol>&orderID=<orderID5,orderID2>
                        // 'exchange/order': 5, // ?symbol=<symbol>&clOrdID=<clOrdID5,clOrdID2>
                        'exchange/order/trade': 5, // ?symbol=<symbol>&start=<start>&end=<end>&limit=<limit>&offset=<offset>&withCount=<withCount>
                        'phemex-user/users/children': 5, // ?offset=<offset>&limit=<limit>&withCount=<withCount>
                        'phemex-user/wallets/v2/depositAddress': 5, // ?_t=1592722635531&currency=USDT
                        'phemex-user/wallets/tradeAccountDetail': 5, // ?bizCode=&currency=&end=1642443347321&limit=10&offset=0&side=&start=1&type=4&withCount=true
                        'phemex-deposit/wallets/api/depositAddress': 5, // ?currency=<currency>&chainName=<chainName>
                        'phemex-deposit/wallets/api/depositHist': 5, // ?currency=<currency>&offset=<offset>&limit=<limit>&withCount=<withCount>
                        'phemex-deposit/wallets/api/chainCfg': 5, // ?currency=<currency>
                        'phemex-withdraw/wallets/api/withdrawHist': 5, // ?currency=<currency>&chainName=<chainNameList>&offset=<offset>&limit=<limit>&withCount=<withCount>
                        'phemex-withdraw/wallets/api/asset/info': 5, // ?currency=<currency>&amount=<amount>
                        'phemex-user/order/closedPositionList': 5, // ?currency=USD&limit=10&offset=0&symbol=&withCount=true
                        'exchange/margins/transfer': 5, // ?start=<start>&end=<end>&offset=<offset>&limit=<limit>&withCount=<withCount>
                        'exchange/wallets/confirm/withdraw': 5, // ?code=<withdrawConfirmCode>
                        'exchange/wallets/withdrawList': 5, // ?currency=<currency>&limit=<limit>&offset=<offset>&withCount=<withCount>
                        'exchange/wallets/depositList': 5, // ?currency=<currency>&offset=<offset>&limit=<limit>
                        'exchange/wallets/v2/depositAddress': 5, // ?currency=<currency>
                        'api-data/spots/funds': 5, // ?currency=<currency>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'api-data/spots/orders': 5, // ?symbol=<symbol>
                        'api-data/spots/orders/by-order-id': 5, // ?symbol=<symbol>&oderId=<orderID>&clOrdID=<clOrdID>
                        'api-data/spots/pnls': 5,
                        'api-data/spots/trades': 5, // ?symbol=<symbol>
                        'api-data/spots/trades/by-order-id': 5, // ?symbol=<symbol>&oderId=<orderID>&clOrdID=<clOrdID>
                        'assets/convert': 5, // ?startTime=<startTime>&endTime=<endTime>&limit=<limit>&offset=<offset>
                        // transfer
                        'assets/transfer': 5, // ?currency=<currency>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'assets/spots/sub-accounts/transfer': 5, // ?currency=<currency>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'assets/futures/sub-accounts/transfer': 5, // ?currency=<currency>&start=<start>&end=<end>&limit=<limit>&offset=<offset>
                        'assets/quote': 5, // ?fromCurrency=<currency>&toCurrency=<currency>&amountEv=<amount>
                        // deposit/withdraw
                    },
                    'post': {
                        // spot
                        'spot/orders': 1,
                        // swap
                        'orders': 1,
                        'g-orders': 1,
                        'positions/assign': 5, // ?symbol=<symbol>&posBalance=<posBalance>&posBalanceEv=<posBalanceEv>
                        'exchange/wallets/transferOut': 5,
                        'exchange/wallets/transferIn': 5,
                        'exchange/margins': 5,
                        'exchange/wallets/createWithdraw': 5, // ?otpCode=<otpCode>
                        'exchange/wallets/cancelWithdraw': 5,
                        'exchange/wallets/createWithdrawAddress': 5, // ?otpCode={optCode}
                        // transfer
                        'assets/transfer': 5,
                        'assets/spots/sub-accounts/transfer': 5, // for sub-account only
                        'assets/futures/sub-accounts/transfer': 5, // for sub-account only
                        'assets/universal-transfer': 5, // for Main account only
                        'assets/convert': 5,
                        // withdraw
                        'phemex-withdraw/wallets/api/createWithdraw': 5, // ?currency=<currency>&address=<address>&amount=<amount>&addressTag=<addressTag>&chainName=<chainName>
                        'phemex-withdraw/wallets/api/cancelWithdraw': 5, // ?id=<id>
                    },
                    'put': {
                        // spot
                        'spot/orders/create': 1, // ?symbol=<symbol>&trigger=<trigger>&clOrdID=<clOrdID>&priceEp=<priceEp>&baseQtyEv=<baseQtyEv>&quoteQtyEv=<quoteQtyEv>&stopPxEp=<stopPxEp>&text=<text>&side=<side>&qtyType=<qtyType>&ordType=<ordType>&timeInForce=<timeInForce>&execInst=<execInst>
                        'spot/orders': 1, // ?symbol=<symbol>&orderID=<orderID>&origClOrdID=<origClOrdID>&clOrdID=<clOrdID>&priceEp=<priceEp>&baseQtyEV=<baseQtyEV>&quoteQtyEv=<quoteQtyEv>&stopPxEp=<stopPxEp>
                        // swap
                        'orders/replace': 1, // ?symbol=<symbol>&orderID=<orderID>&origClOrdID=<origClOrdID>&clOrdID=<clOrdID>&price=<price>&priceEp=<priceEp>&orderQty=<orderQty>&stopPx=<stopPx>&stopPxEp=<stopPxEp>&takeProfit=<takeProfit>&takeProfitEp=<takeProfitEp>&stopLoss=<stopLoss>&stopLossEp=<stopLossEp>&pegOffsetValueEp=<pegOffsetValueEp>&pegPriceType=<pegPriceType>
                        'g-orders/replace': 1, // ?symbol=<symbol>&orderID=<orderID>&origClOrdID=<origClOrdID>&clOrdID=<clOrdID>&price=<price>&priceEp=<priceEp>&orderQty=<orderQty>&stopPx=<stopPx>&stopPxEp=<stopPxEp>&takeProfit=<takeProfit>&takeProfitEp=<takeProfitEp>&stopLoss=<stopLoss>&stopLossEp=<stopLossEp>&pegOffsetValueEp=<pegOffsetValueEp>&pegPriceType=<pegPriceType>
                        'positions/leverage': 5, // ?symbol=<symbol>&leverage=<leverage>&leverageEr=<leverageEr>
                        'g-positions/leverage': 5, // ?symbol=<symbol>&leverage=<leverage>&leverageEr=<leverageEr>
                        'g-positions/switch-pos-mode-sync': 5, // ?symbol=<symbol>&targetPosMode=<targetPosMode>
                        'positions/riskLimit': 5, // ?symbol=<symbol>&riskLimit=<riskLimit>&riskLimitEv=<riskLimitEv>
                    },
                    'delete': {
                        // spot
                        'spot/orders': 2, // ?symbol=<symbol>&orderID=<orderID>
                        'spot/orders/all': 2, // ?symbol=<symbol>&untriggered=<untriggered>
                        // 'spot/orders': 5, // ?symbol=<symbol>&clOrdID=<clOrdID>
                        // swap
                        'orders/cancel': 1, // ?symbol=<symbol>&orderID=<orderID>
                        'orders': 1, // ?symbol=<symbol>&orderID=<orderID1>,<orderID2>,<orderID3>
                        'orders/all': 3, // ?symbol=<symbol>&untriggered=<untriggered>&text=<text>
                        'g-orders/cancel': 1, // ?symbol=<symbol>&orderID=<orderID>
                        'g-orders': 1, // ?symbol=<symbol>&orderID=<orderID1>,<orderID2>,<orderID3>
                        'g-orders/all': 3, // ?symbol=<symbol>&untriggered=<untriggered>&text=<text>
                    },
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
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        // todo
                        'triggerPriceType': {
                            'mark': true,
                            'last': true,
                            'index': true,
                        },
                        'triggerDirection': false,
                        'stopLossPrice': false, // todo
                        'takeProfitPrice': false, // todo
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 200,
                        'daysBack': 100000,
                        'untilDays': 2, // todo implement
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 200,
                        'daysBack': 100000,
                        'daysBackCanceled': 100000,
                        'untilDays': 2,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'forDerivatives': {
                    'extends': 'default',
                    'createOrder': {
                        'triggerDirection': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'mark': true,
                                'last': true,
                                'index': true,
                            },
                            'price': true,
                        },
                        'hedged': true,
                    },
                    'fetchOHLCV': {
                        'limit': 2000,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivatives',
                    },
                    'inverse': {
                        'extends': 'forDerivatives',
                    },
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    // not documented
                    '401': AuthenticationError, // {"code":"401","msg":"401 Failed to load API KEY."}
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
                    '39997': BadSymbol, // {"code":39997,"msg":"Symbol not listed sMOVRUSDT","data":null}
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
                'brokerId': 'CCXT123456', // updated from CCXT to CCXT123456
                'x-phemex-request-expiry': 60, // in seconds
                'createOrderByQuoteRequiresPrice': true,
                'networks': {
                    'TRC20': 'TRX',
                    'ERC20': 'ETH',
                    'BEP20': 'BNB',
                },
                'defaultNetworks': {
                    'USDT': 'ETH',
                },
                'defaultSubType': 'linear',
                'accountsByType': {
                    'spot': 'spot',
                    'swap': 'future',
                },
                'stableCoins': [
                    'BUSD',
                    'FEI',
                    'TUSD',
                    'USD',
                    'USDC',
                    'USDD',
                    'USDP',
                    'USDT',
                ],
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'triggerPriceTypesMap': {
                    'last': 'ByLastPrice',
                    'mark': 'ByMarkPrice',
                    'index': 'ByIndexPrice',
                    'ask': 'ByAskPrice',
                    'bid': 'ByBidPrice',
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

    parseSwapMarket (market: Dict) {
        //
        //     {
        //         "symbol":"BTCUSD", //
        //         "code":"1",
        //         "type":"Perpetual",
        //         "displaySymbol":"BTC / USD",
        //         "indexSymbol":".BTC",
        //         "markSymbol":".MBTC",
        //         "fundingRateSymbol":".BTCFR",
        //         "fundingRate8hSymbol":".BTCFR8H",
        //         "contractUnderlyingAssets":"USD", // or eg. `1000 SHIB`
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
        //         "status":"Listed",
        //         "tipOrderQty":1000000,
        //         "listTime":"1574650800000",
        //         "majorSymbol":true,
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
        let base = this.safeCurrencyCode (baseId);
        base = base.replace (' ', ''); // replace space for junction codes, eg. `1000 SHIB`
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
        let contractSize: Num = undefined;
        if (settle === 'USDT') {
            contractSize = this.parseNumber ('1');
        } else if (contractSizeString.indexOf (' ')) {
            // "1 USD"
            // "0.005 ETH"
            const parts = contractSizeString.split (' ');
            contractSize = this.parseNumber (parts[0]);
        } else {
            // "1.0"
            contractSize = this.parseNumber (contractSizeString);
        }
        return this.safeMarketStructure ({
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
                'amount': this.safeNumber2 (market, 'lotSize', 'qtyStepSize'),
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
            'created': undefined,
            'info': market,
        });
    }

    parseSpotMarket (market: Dict) {
        //
        //     {
        //         "symbol":"sBTCUSDT",
        //         "code":1001,
        //         "type":"Spot",
        //         "displaySymbol":"BTC / USDT",
        //         "quoteCurrency":"USDT",
        //         "priceScale":8,
        //         "ratioScale":8,
        //         "pricePrecision":2,
        //         "baseCurrency":"BTC",
        //         "baseTickSize":"0.000001 BTC",
        //         "baseTickSizeEv":100,
        //         "quoteTickSize":"0.01 USDT",
        //         "quoteTickSizeEv":1000000,
        //         "baseQtyPrecision":6,
        //         "quoteQtyPrecision":2,
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
        //         "description":"BTCUSDT is a BTC/USDT spot trading pair. Minimum order value is 1 USDT",
        //         "status":"Listed",
        //         "tipOrderQty":2,
        //         "listTime":1589338800000,
        //         "buyPriceUpperLimitPct":110,
        //         "sellPriceLowerLimitPct":90,
        //         "leverage":5
        //     },
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
        return this.safeMarketStructure ({
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
            'priceScale': this.safeInteger (market, 'priceScale'),
            'valueScale': this.safeInteger (market, 'valueScale'),
            'ratioScale': this.safeInteger (market, 'ratioScale'),
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
            'created': this.safeInteger (market, 'listTime'),
            'info': market,
        });
    }

    /**
     * @method
     * @name phemex#fetchMarkets
     * @description retrieves data on all markets for phemex
     * @see https://phemex-docs.github.io/#query-product-information-3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const v2Products = await this.v2GetPublicProducts (params);
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "data":{
        //             "currencies":[
        //                 {"currency":"BTC","name":"Bitcoin","code":1,"valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"needAddrTag":0,"status":"Listed","displayCurrency":"BTC","inAssetsDisplay":1,"perpetual":0,"stableCoin":0,"assetsPrecision":8},
        //                 {"currency":"USD","name":"USD","code":2,"valueScale":4,"minValueEv":1,"maxValueEv":5000000000000000000,"needAddrTag":0,"status":"Listed","displayCurrency":"USD","inAssetsDisplay":1,"perpetual":0,"stableCoin":0,"assetsPrecision":2},
        //                 {"currency":"USDT","name":"TetherUS","code":3,"valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"needAddrTag":0,"status":"Listed","displayCurrency":"USDT","inAssetsDisplay":1,"perpetual":2,"stableCoin":1,"assetsPrecision":8},
        //             ],
        //             "products":[
        //                 {
        //                     "symbol":"BTCUSD",
        //                     "code":1,
        //                     "type":"Perpetual"
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
        //                     "description":"BTC/USD perpetual contracts are priced on the .BTC Index. Each contract is worth 1 USD. Funding fees are paid and received every 8 hours at UTC time: 00:00, 08:00 and 16:00.",
        //                     "status":"Listed",
        //                     "tipOrderQty":1000000,
        //                     "listTime":1574650800000,
        //                     "majorSymbol":true,
        //                     "defaultLeverage":"-10",
        //                     "fundingInterval":28800,
        //                     "maxLeverage":100
        //                 },
        //                 {
        //                     "symbol":"sBTCUSDT",
        //                     "code":1001,
        //                     "type":"Spot",
        //                     "displaySymbol":"BTC / USDT",
        //                     "quoteCurrency":"USDT",
        //                     "priceScale":8,
        //                     "ratioScale":8,
        //                     "pricePrecision":2,
        //                     "baseCurrency":"BTC",
        //                     "baseTickSize":"0.000001 BTC",
        //                     "baseTickSizeEv":100,
        //                     "quoteTickSize":"0.01 USDT",
        //                     "quoteTickSizeEv":1000000,
        //                     "baseQtyPrecision":6,
        //                     "quoteQtyPrecision":2,
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
        //                     "description":"BTCUSDT is a BTC/USDT spot trading pair. Minimum order value is 1 USDT",
        //                     "status":"Listed",
        //                     "tipOrderQty":2,
        //                     "listTime":1589338800000,
        //                     "buyPriceUpperLimitPct":110,
        //                     "sellPriceLowerLimitPct":90,
        //                     "leverage":5
        //                 },
        //             ],
        //             "perpProductsV2":[
        //                 {
        //                     "symbol":"BTCUSDT",
        //                     "code":41541,
        //                     "type":"PerpetualV2",
        //                     "displaySymbol":"BTC / USDT",
        //                     "indexSymbol":".BTCUSDT",
        //                     "markSymbol":".MBTCUSDT",
        //                     "fundingRateSymbol":".BTCUSDTFR",
        //                     "fundingRate8hSymbol":".BTCUSDTFR8H",
        //                     "contractUnderlyingAssets":"BTC",
        //                     "settleCurrency":"USDT",
        //                     "quoteCurrency":"USDT",
        //                     "tickSize":"0.1",
        //                     "priceScale":0,
        //                     "ratioScale":0,
        //                     "pricePrecision":1,
        //                     "baseCurrency":"BTC",
        //                     "description":"BTC/USDT perpetual contracts are priced on the .BTCUSDT Index. Each contract is worth 1 BTC. Funding fees are paid and received every 8 hours at UTC time: 00:00, 08:00 and 16:00.",
        //                     "status":"Listed",
        //                     "tipOrderQty":0,
        //                     "listTime":1668225600000,
        //                     "majorSymbol":true,
        //                     "defaultLeverage":"-10",
        //                     "fundingInterval":28800,
        //                     "maxLeverage":100,
        //                     "maxOrderQtyRq":"1000",
        //                     "maxPriceRp":"2000000000",
        //                     "minOrderValueRv":"1",
        //                     "minPriceRp":"1000.0",
        //                     "qtyPrecision":3,
        //                     "qtyStepSize":"0.001",
        //                     "tipOrderQtyRq":"200",
        //                     "maxOpenPosLeverage":100.0
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
        //             ],
        //             "riskLimitsV2":[
        //                 {
        //                     "symbol":"BTCUSDT",
        //                     "steps":"2000K",
        //                     "riskLimits":[
        //                         {"limit":2000000,"initialMarginRr":"0.01","maintenanceMarginRr":"0.005"},,
        //                         {"limit":4000000,"initialMarginRr":"0.015","maintenanceMarginRr":"0.0075"},
        //                         {"limit":6000000,"initialMarginRr":"0.02","maintenanceMarginRr":"0.01"},
        //                     ]
        //                 },
        //             ],
        //             "leveragesV2":[
        //                 {"options":[1.0,2.0,3.0,5.0,10.0,25.0,50.0,100.0],"initialMarginRr":"0.01"},
        //                 {"options":[1.0,2.0,3.0,5.0,10.0,25.0,50.0,66.67],"initialMarginRr":"0.015"},
        //                 {"options":[1.0,2.0,3.0,5.0,10.0,25.0,33.0,50.0],"initialMarginRr":"0.02"},
        //             ],
        //             "ratioScale":8,
        //             "md5Checksum":"5c6604814d3c1bafbe602c3d11a7e8bf",
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
        let products = this.safeValue (v2ProductsData, 'products', []);
        const perpetualProductsV2 = this.safeValue (v2ProductsData, 'perpProductsV2', []);
        products = this.arrayConcat (products, perpetualProductsV2);
        let riskLimits = this.safeValue (v2ProductsData, 'riskLimits', []);
        const riskLimitsV2 = this.safeValue (v2ProductsData, 'riskLimitsV2', []);
        riskLimits = this.arrayConcat (riskLimits, riskLimitsV2);
        const currencies = this.safeValue (v2ProductsData, 'currencies', []);
        const riskLimitsById = this.indexBy (riskLimits, 'symbol');
        const v1ProductsById = this.indexBy (v1ProductsData, 'symbol');
        const currenciesByCode = this.indexBy (currencies, 'currency');
        const result = [];
        for (let i = 0; i < products.length; i++) {
            let market = products[i];
            const type = this.safeStringLower (market, 'type');
            if ((type === 'perpetual') || (type === 'perpetualv2') || (type === 'perpetualpilot')) {
                const id = this.safeString (market, 'symbol');
                const riskLimitValues = this.safeValue (riskLimitsById, id, {});
                market = this.extend (market, riskLimitValues);
                const v1ProductsValues = this.safeValue (v1ProductsById, id, {});
                market = this.extend (market, v1ProductsValues);
                market = this.parseSwapMarket (market);
            } else {
                const baseCurrency = this.safeString (market, 'baseCurrency');
                const currencyValues = this.safeValue (currenciesByCode, baseCurrency, {});
                const valueScale = this.safeString (currencyValues, 'valueScale', '8');
                market = this.extend (market, { 'valueScale': valueScale });
                market = this.parseSpotMarket (market);
            }
            result.push (market);
        }
        return result;
    }

    /**
     * @method
     * @name phemex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.v2GetPublicProducts (params);
        //
        //     {
        //         "code":0,
        //         "msg":"OK",
        //         "data":{
        //             ...,
        //             "currencies":[
        //                 {"currency":"BTC","name":"Bitcoin","code":1,"valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"needAddrTag":0,"status":"Listed","displayCurrency":"BTC","inAssetsDisplay":1,"perpetual":0,"stableCoin":0,"assetsPrecision":8},
        //                 {"currency":"USD","name":"USD","code":2,"valueScale":4,"minValueEv":1,"maxValueEv":5000000000000000000,"needAddrTag":0,"status":"Listed","displayCurrency":"USD","inAssetsDisplay":1,"perpetual":0,"stableCoin":0,"assetsPrecision":2},
        //                 {"currency":"USDT","name":"TetherUS","code":3,"valueScale":8,"minValueEv":1,"maxValueEv":5000000000000000000,"needAddrTag":0,"status":"Listed","displayCurrency":"USDT","inAssetsDisplay":1,"perpetual":2,"stableCoin":1,"assetsPrecision":8},
        //             ],
        //             ...
        //         }
        //     }
        const data = this.safeValue (response, 'data', {});
        const currencies = this.safeValue (data, 'currencies', []);
        const result: Dict = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currency');
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (id);
            const status = this.safeString (currency, 'status');
            const valueScaleString = this.safeString (currency, 'valueScale');
            const valueScale = parseInt (valueScaleString);
            const minValueEv = this.safeString (currency, 'minValueEv');
            const maxValueEv = this.safeString (currency, 'maxValueEv');
            let minAmount: Num = undefined;
            let maxAmount: Num = undefined;
            let precision: Num = undefined;
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
                'active': status === 'Listed',
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
                'networks': {},
            };
        }
        return result;
    }

    customParseBidAsk (bidask, priceKey = 0, amountKey = 1, market: Market = undefined) {
        if (market === undefined) {
            throw new ArgumentsRequired (this.id + ' customParseBidAsk() requires a market argument');
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

    customParseOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market: Market = undefined) {
        const result: Dict = {
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
                orders.push (this.customParseBidAsk (bidasks[k], priceKey, amountKey, market));
            }
            result[side] = orders;
        }
        result[bidsKey] = this.sortBy (result[bidsKey], 0, true);
        result[asksKey] = this.sortBy (result[asksKey], 0);
        return result as any;
    }

    /**
     * @method
     * @name phemex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        let response = undefined;
        if (market['linear'] && market['settle'] === 'USDT') {
            response = await this.v2GetMdV2Orderbook (this.extend (request, params));
        } else {
            if ((limit !== undefined) && (limit <= 30)) {
                response = await this.v1GetMdOrderbook (this.extend (request, params));
            } else {
                response = await this.v1GetMdFullbook (this.extend (request, params));
            }
        }
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
        const book = this.safeValue2 (result, 'book', 'orderbook_p', {});
        const timestamp = this.safeIntegerProduct (result, 'timestamp', 0.000001);
        const orderbook = this.customParseOrderBook (book, symbol, timestamp, 'bids', 'asks', 0, 1, market);
        orderbook['nonce'] = this.safeInteger (result, 'sequence');
        return orderbook as OrderBook;
    }

    toEn (n, scale) {
        const stringN = this.numberToString (n);
        const precise = new Precise (stringN);
        precise.decimals = precise.decimals - scale;
        precise.reduce ();
        const preciseString = precise.toString ();
        return this.parseToNumeric (preciseString);
    }

    toEv (amount, market: Market = undefined) {
        if ((amount === undefined) || (market === undefined)) {
            return amount;
        }
        return this.toEn (amount, market['valueScale']);
    }

    toEp (price, market: Market = undefined) {
        if ((price === undefined) || (market === undefined)) {
            return price;
        }
        return this.toEn (price, market['priceScale']);
    }

    fromEn (en, scale) {
        if (en === undefined || scale === undefined) {
            return undefined;
        }
        const precise = new Precise (en);
        precise.decimals = this.sum (precise.decimals, scale);
        precise.reduce ();
        return precise.toString ();
    }

    fromEp (ep, market: Market = undefined) {
        if ((ep === undefined) || (market === undefined)) {
            return ep;
        }
        return this.fromEn (ep, this.safeInteger (market, 'priceScale'));
    }

    fromEv (ev, market: Market = undefined) {
        if ((ev === undefined) || (market === undefined)) {
            return ev;
        }
        return this.fromEn (ev, this.safeInteger (market, 'valueScale'));
    }

    fromEr (er, market: Market = undefined) {
        if ((er === undefined) || (market === undefined)) {
            return er;
        }
        return this.fromEn (er, this.safeInteger (market, 'ratioScale'));
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
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
        let baseVolume: Num;
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

    /**
     * @method
     * @name phemex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#querykline
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] *only used for USDT settled contracts, otherwise is emulated and not supported by the exchange* timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] *USDT settled/ linear swaps only* end time in ms
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const userLimit = limit;
        const request: Dict = {
            'symbol': market['id'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const until = this.safeInteger2 (params, 'until', 'to');
        params = this.omit (params, [ 'until' ]);
        const usesSpecialFromToEndpoint = ((market['linear'] || market['settle'] === 'USDT')) && ((since !== undefined) || (until !== undefined));
        let maxLimit = 1000;
        if (usesSpecialFromToEndpoint) {
            maxLimit = 2000;
        }
        if (limit === undefined) {
            limit = maxLimit;
        }
        request['limit'] = Math.min (limit, maxLimit);
        let response = undefined;
        if (market['linear'] || market['settle'] === 'USDT') {
            if ((until !== undefined) || (since !== undefined)) {
                const candleDuration = this.parseTimeframe (timeframe);
                if (since !== undefined) {
                    since = Math.round (since / 1000);
                    request['from'] = since;
                } else {
                    // when 'to' is defined since is mandatory
                    since = (until / 100) - (maxLimit * candleDuration);
                }
                if (until !== undefined) {
                    request['to'] = Math.round (until / 1000);
                } else {
                    // when since is defined 'to' is mandatory
                    let to = since + (maxLimit * candleDuration);
                    const now = this.seconds ();
                    if (to > now) {
                        to = now;
                    }
                    request['to'] = to;
                }
                response = await this.publicGetMdV2KlineList (this.extend (request, params));
            } else {
                response = await this.publicGetMdV2KlineLast (this.extend (request, params));
            }
        } else {
            if (since !== undefined) {
                // phemex also provides kline query with from/to, however, this interface is NOT recommended and does not work properly.
                // we do not send since param to the exchange, instead we calculate appropriate limit param
                const duration = this.parseTimeframe (timeframe) * 1000;
                const timeDelta = this.milliseconds () - since;
                limit = this.parseToInt (timeDelta / duration); // setting limit to the number of candles after since
            }
            response = await this.publicGetMdV2Kline (this.extend (request, params));
        }
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
        const rows = this.safeList (data, 'rows', []);
        return this.parseOHLCVs (rows, market, timeframe, since, userLimit);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
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
        const quoteVolume = this.fromEr (this.safeString2 (ticker, 'turnoverEv', 'turnoverRv'), market);
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

    /**
     * @method
     * @name phemex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query24hrsticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        let response = undefined;
        if (market['swap']) {
            if (market['inverse'] || market['settle'] === 'USD') {
                response = await this.v1GetMdTicker24hr (this.extend (request, params));
            } else {
                response = await this.v2GetMdV2Ticker24hr (this.extend (request, params));
            }
        } else {
            response = await this.v1GetMdSpotTicker24hr (this.extend (request, params));
        }
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
        const result = this.safeDict (response, 'result', {});
        return this.parseTicker (result, market);
    }

    /**
     * @method
     * @name phemex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://phemex-docs.github.io/#query-24-hours-ticker-for-all-symbols-2     // spot
     * @see https://phemex-docs.github.io/#query-24-ticker-for-all-symbols             // linear
     * @see https://phemex-docs.github.io/#query-24-hours-ticker-for-all-symbols       // inverse
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbols !== undefined) {
            const first = this.safeValue (symbols, 0);
            market = this.market (first);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchTickers', market, params);
        const query = this.omit (params, 'type');
        let response = undefined;
        if (type === 'spot') {
            response = await this.v1GetMdSpotTicker24hrAll (query);
        } else if (subType === 'inverse' || this.safeString (market, 'settle') === 'USD') {
            response = await this.v1GetMdTicker24hrAll (query);
        } else {
            response = await this.v2GetMdV2Ticker24hrAll (query);
        }
        const result = this.safeList (response, 'result', []);
        return this.parseTickers (result, symbols);
    }

    /**
     * @method
     * @name phemex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#querytrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            // 'id': 123456789, // optional request id
        };
        let response = undefined;
        if (market['linear'] && market['settle'] === 'USDT') {
            response = await this.v2GetMdV2Trade (this.extend (request, params));
        } else {
            response = await this.v1GetMdTrade (this.extend (request, params));
        }
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
        const trades = this.safeValue2 (result, 'trades', 'trades_p', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public) spot & contract
        //
        //     [
        //         1592541746712239749,
        //         13156448570000,
        //         "Buy",
        //         93070000,
        //         40173
        //     ]
        //
        // fetchTrades (public) perp
        //
        //     [
        //         1675690986063435800,
        //         "Sell",
        //         "22857.4",
        //         "0.269"
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
        //         "baseCurrency": "BTC",
        //         "quoteCurrency": "USDT",
        //         "feeCurrency": "BTC"
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
        // perpetual
        //     {
        //         "accountID": 9328670003,
        //         "action": "New",
        //         "actionBy": "ByUser",
        //         "actionTimeNs": 1666858780876924611,
        //         "addedSeq": 77751555,
        //         "apRp": "0",
        //         "bonusChangedAmountRv": "0",
        //         "bpRp": "0",
        //         "clOrdID": "c0327a7d-9064-62a9-28f6-2db9aaaa04e0",
        //         "closedPnlRv": "0",
        //         "closedSize": "0",
        //         "code": 0,
        //         "cumFeeRv": "0",
        //         "cumQty": "0",
        //         "cumValueRv": "0",
        //         "curAccBalanceRv": "1508.489893982237",
        //         "curAssignedPosBalanceRv": "24.62786650928",
        //         "curBonusBalanceRv": "0",
        //         "curLeverageRr": "-10",
        //         "curPosSide": "Buy",
        //         "curPosSize": "0.043",
        //         "curPosTerm": 1,
        //         "curPosValueRv": "894.0689",
        //         "curRiskLimitRv": "1000000",
        //         "currency": "USDT",
        //         "cxlRejReason": 0,
        //         "displayQty": "0.003",
        //         "execFeeRv": "0",
        //         "execID": "00000000-0000-0000-0000-000000000000",
        //         "execPriceRp": "20723.7",
        //         "execQty": "0",
        //         "execSeq": 77751555,
        //         "execStatus": "New",
        //         "execValueRv": "0",
        //         "feeRateRr": "0",
        //         "leavesQty": "0.003",
        //         "leavesValueRv": "63.4503",
        //         "message": "No error",
        //         "ordStatus": "New",
        //         "ordType": "Market",
        //         "orderID": "fa64c6f2-47a4-4929-aab4-b7fa9bbc4323",
        //         "orderQty": "0.003",
        //         "pegOffsetValueRp": "0",
        //         "posSide": "Long",
        //         "priceRp": "21150.1",
        //         "relatedPosTerm": 1,
        //         "relatedReqNum": 11,
        //         "side": "Buy",
        //         "slTrigger": "ByMarkPrice",
        //         "stopLossRp": "0",
        //         "stopPxRp": "0",
        //         "symbol": "BTCUSDT",
        //         "takeProfitRp": "0",
        //         "timeInForce": "ImmediateOrCancel",
        //         "tpTrigger": "ByLastPrice",
        //         "tradeType": "Amend",
        //         "transactTimeNs": 1666858780881545305,
        //         "userID": 932867
        //     }
        //
        // swap - USDT
        //
        //     {
        //         "createdAt": 1666226932259,
        //         "symbol": "ETHUSDT",
        //         "currency": "USDT",
        //         "action": 1,
        //         "tradeType": 1,
        //         "execQtyRq": "0.01",
        //         "execPriceRp": "1271.9",
        //         "side": 1,
        //         "orderQtyRq": "0.78",
        //         "priceRp": "1271.9",
        //         "execValueRv": "12.719",
        //         "feeRateRr": "0.0001",
        //         "execFeeRv": "0.0012719",
        //         "ordType": 2,
        //         "execId": "8718cae",
        //         "execStatus": 6
        //     }
        // spot with fees paid using PT token
        //     "createdAt": "1714990724076",
        //     "symbol": "BTCUSDT",
        //     "currency": "USDT",
        //     "action": "1",
        //     "tradeType": "1",
        //     "execQtyRq": "0.003",
        //     "execPriceRp": "64935",
        //     "side": "2",
        //     "orderQtyRq": "0.003",
        //     "priceRp": "51600",
        //     "execValueRv": "194.805",
        //     "feeRateRr": "0.000495",
        //     "execFeeRv": "0",
        //     "ordType": "3",
        //     "execId": "XXXXXX",
        //     "execStatus": "7",
        //     "posSide": "1",
        //     "ptFeeRv": "0.110012249248",
        //     "ptPriceRp": "0.876524893"
        //
        let priceString: Str;
        let amountString: Str;
        let timestamp: Int;
        let id: Str = undefined;
        let side: Str = undefined;
        let costString: Str = undefined;
        let type: Str = undefined;
        let fee = undefined;
        let feeCostString: Str = undefined;
        let feeRateString: Str = undefined;
        let feeCurrencyCode: Str = undefined;
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let orderId: Str = undefined;
        let takerOrMaker: Str = undefined;
        if (Array.isArray (trade)) {
            const tradeLength = trade.length;
            timestamp = this.safeIntegerProduct (trade, 0, 0.000001);
            if (tradeLength > 4) {
                id = this.safeString (trade, tradeLength - 4);
            }
            side = this.safeStringLower (trade, tradeLength - 3);
            priceString = this.safeString (trade, tradeLength - 2);
            amountString = this.safeString (trade, tradeLength - 1);
            if (typeof trade[tradeLength - 2] === 'number') {
                priceString = this.fromEp (priceString, market);
                amountString = this.fromEv (amountString, market);
            }
        } else {
            timestamp = this.safeIntegerProduct (trade, 'transactTimeNs', 0.000001);
            if (timestamp === undefined) {
                timestamp = this.safeInteger (trade, 'createdAt');
            }
            id = this.safeString2 (trade, 'execId', 'execID');
            orderId = this.safeString (trade, 'orderID');
            if (market['settle'] === 'USDT') {
                const sideId = this.safeStringLower (trade, 'side');
                if ((sideId === 'buy') || (sideId === 'sell')) {
                    side = sideId;
                } else if (sideId !== undefined) {
                    side = (sideId === '1') ? 'buy' : 'sell';
                }
                const ordType = this.safeString (trade, 'ordType');
                if (ordType === '1') {
                    type = 'market';
                } else if (ordType === '2') {
                    type = 'limit';
                }
                priceString = this.safeString (trade, 'execPriceRp');
                amountString = this.safeString (trade, 'execQtyRq');
                costString = this.safeString (trade, 'execValueRv');
                feeCostString = this.omitZero (this.safeString (trade, 'execFeeRv'));
                feeRateString = this.safeString (trade, 'feeRateRr');
                if (feeCostString !== undefined) {
                    const currencyId = this.safeString (trade, 'currency');
                    feeCurrencyCode = this.safeCurrencyCode (currencyId);
                } else {
                    const ptFeeRv = this.omitZero (this.safeString (trade, 'ptFeeRv'));
                    if (ptFeeRv !== undefined) {
                        feeCostString = ptFeeRv;
                        feeCurrencyCode = 'PT';
                    }
                }
            } else {
                side = this.safeStringLower (trade, 'side');
                type = this.parseOrderType (this.safeString (trade, 'ordType'));
                const execStatus = this.safeString (trade, 'execStatus');
                if (execStatus === 'MakerFill') {
                    takerOrMaker = 'maker';
                }
                priceString = this.fromEp (this.safeString (trade, 'execPriceEp'), market);
                amountString = this.fromEv (this.safeString (trade, 'execBaseQtyEv'), market);
                amountString = this.safeString (trade, 'execQty', amountString);
                costString = this.fromEr (this.safeString2 (trade, 'execQuoteQtyEv', 'execValueEv'), market);
                feeCostString = this.fromEr (this.omitZero (this.safeString (trade, 'execFeeEv')), market);
                if (feeCostString !== undefined) {
                    feeRateString = this.fromEr (this.safeString (trade, 'feeRateEr'), market);
                    if (market['spot']) {
                        feeCurrencyCode = this.safeCurrencyCode (this.safeString (trade, 'feeCurrency'));
                    } else {
                        const info = this.safeValue (market, 'info');
                        if (info !== undefined) {
                            const settlementCurrencyId = this.safeString (info, 'settlementCurrency');
                            feeCurrencyCode = this.safeCurrencyCode (settlementCurrencyId);
                        }
                    }
                } else {
                    feeCostString = this.safeString (trade, 'ptFeeRv');
                    if (feeCostString !== undefined) {
                        feeCurrencyCode = 'PT';
                    }
                }
            }
            fee = {
                'cost': feeCostString,
                'rate': feeRateString,
                'currency': feeCurrencyCode,
            };
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
        const result: Dict = { 'info': response };
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
        // usdt
        //   {
        //       "info": {
        //         "code": "0",
        //         "msg": '',
        //         "data": {
        //           "account": {
        //             "userID": "940666",
        //             "accountId": "9406660003",
        //             "currency": "USDT",
        //             "accountBalanceRv": "99.93143972",
        //             "totalUsedBalanceRv": "0.40456",
        //             "bonusBalanceRv": "0"
        //           },
        //   }
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
        //             }
        //         }
        //     }
        //
        const result: Dict = { 'info': response };
        const data = this.safeValue (response, 'data', {});
        const balance = this.safeValue (data, 'account', {});
        const currencyId = this.safeString (balance, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const currency = this.currency (code);
        const valueScale = this.safeInteger (currency, 'valueScale', 8);
        const account = this.account ();
        const accountBalanceEv = this.safeString2 (balance, 'accountBalanceEv', 'accountBalanceRv');
        const totalUsedBalanceEv = this.safeString2 (balance, 'totalUsedBalanceEv', 'totalUsedBalanceRv');
        const needsConversion = (code !== 'USDT');
        account['total'] = needsConversion ? this.fromEn (accountBalanceEv, valueScale) : accountBalanceEv;
        account['used'] = needsConversion ? this.fromEn (totalUsedBalanceEv, valueScale) : totalUsedBalanceEv;
        result[code] = account;
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name phemex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://phemex-docs.github.io/#query-wallets
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-account-positions
     * @see https://phemex-docs.github.io/#query-trading-account-and-positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap
     * @param {string} [params.code] *swap only* currency code of the balance to query (USD, USDT, etc), default is USDT
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const code = this.safeString (params, 'code');
        params = this.omit (params, [ 'code' ]);
        let response = undefined;
        const request: Dict = {};
        if ((type !== 'spot') && (type !== 'swap')) {
            throw new BadRequest (this.id + ' does not support ' + type + ' markets, only spot and swap');
        }
        if (type === 'swap') {
            let settle = undefined;
            [ settle, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'settle', 'USDT');
            if (code !== undefined || settle !== undefined) {
                let coin = undefined;
                if (code !== undefined) {
                    coin = code;
                } else {
                    coin = settle;
                }
                const currency = this.currency (coin);
                request['currency'] = currency['id'];
                if (currency['id'] === 'USDT') {
                    response = await this.privateGetGAccountsAccountPositions (this.extend (request, params));
                } else {
                    response = await this.privateGetAccountsAccountPositions (this.extend (request, params));
                }
            } else {
                const currency = this.safeString (params, 'currency');
                if (currency === undefined) {
                    throw new ArgumentsRequired (this.id + ' fetchBalance() requires a code parameter or a currency or settle parameter for ' + type + ' type');
                }
                response = await this.privateGetSpotWallets (this.extend (request, params));
            }
        } else {
            response = await this.privateGetSpotWallets (this.extend (request, params));
        }
        //
        // usdt
        //   {
        //       "info": {
        //         "code": "0",
        //         "msg": '',
        //         "data": {
        //           "account": {
        //             "userID": "940666",
        //             "accountId": "9406660003",
        //             "currency": "USDT",
        //             "accountBalanceRv": "99.93143972",
        //             "totalUsedBalanceRv": "0.40456",
        //             "bonusBalanceRv": "0"
        //           },
        //   }
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
        if (type === 'swap') {
            return this.parseSwapBalance (response);
        }
        return this.parseSpotBalance (response);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'Created': 'open',
            'Untriggered': 'open',
            'Deactivated': 'closed',
            'Triggered': 'open',
            'Rejected': 'rejected',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
            'Suspended': 'canceled',
            '1': 'open',
            '2': 'canceled',
            '3': 'closed',
            '4': 'canceled',
            '5': 'open',
            '6': 'open',
            '7': 'closed',
            '8': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str) {
        const types: Dict = {
            '1': 'market',
            '2': 'limit',
            '3': 'stop',
            '4': 'stopLimit',
            '5': 'market',
            '6': 'limit',
            '7': 'market',
            '8': 'market',
            '9': 'stopLimit',
            '10': 'market',
            'Limit': 'limit',
            'Market': 'market',
        };
        return this.safeString (types, type, type);
    }

    parseTimeInForce (timeInForce: Str) {
        const timeInForces: Dict = {
            'GoodTillCancel': 'GTC',
            'PostOnly': 'PO',
            'ImmediateOrCancel': 'IOC',
            'FillOrKill': 'FOK',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseSpotOrder (order: Dict, market: Market = undefined) {
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
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.fromEp (this.safeString (order, 'priceEp'), market);
        const amount = this.fromEv (this.safeString (order, 'baseQtyEv'), market);
        const remaining = this.omitZero (this.fromEv (this.safeString (order, 'leavesBaseQtyEv'), market));
        const filled = this.fromEv (this.safeString2 (order, 'cumBaseQtyEv', 'cumBaseValueEv'), market);
        const cost = this.fromEr (this.safeString2 (order, 'cumQuoteValueEv', 'quoteQtyEv'), market);
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
                'currency': this.safeCurrencyCode (this.safeString (order, 'feeCurrency')),
            };
        }
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        const triggerPrice = this.parseNumber (this.omitZero (this.fromEp (this.safeString (order, 'stopPxEp'))));
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
            'triggerPrice': triggerPrice,
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

    parseOrderSide (side) {
        const sides: Dict = {
            '1': 'buy',
            '2': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    parseSwapOrder (order, market: Market = undefined) {
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
        // usdt
        // {
        //        "bizError":"0",
        //        "orderID":"bd720dff-5647-4596-aa4e-656bac87aaad",
        //        "clOrdID":"ccxt2022843dffac9477b497",
        //        "symbol":"LTCUSDT",
        //        "side":"Buy",
        //        "actionTimeNs":"1677667878751724052",
        //        "transactTimeNs":"1677667878754017434",
        //        "orderType":"Limit",
        //        "priceRp":"40",
        //        "orderQtyRq":"0.1",
        //        "displayQtyRq":"0.1",
        //        "timeInForce":"GoodTillCancel",
        //        "reduceOnly":false,
        //        "closedPnlRv":"0",
        //        "closedSizeRq":"0",
        //        "cumQtyRq":"0",
        //        "cumValueRv":"0",
        //        "leavesQtyRq":"0.1",
        //        "leavesValueRv":"4",
        //        "stopDirection":"UNSPECIFIED",
        //        "stopPxRp":"0",
        //        "trigger":"UNSPECIFIED",
        //        "pegOffsetValueRp":"0",
        //        "pegOffsetProportionRr":"0",
        //        "execStatus":"New",
        //        "pegPriceType":"UNSPECIFIED",
        //        "ordStatus":"New",
        //        "execInst":"None",
        //        "takeProfitRp":"0",
        //        "stopLossRp":"0"
        //     }
        //
        // v2 orderList
        //    {
        //        "createdAt":"1677686231301",
        //        "symbol":"LTCUSDT",
        //        "orderQtyRq":"0.2",
        //        "side":"1",
        //        "posSide":"3",
        //        "priceRp":"50",
        //        "execQtyRq":"0",
        //        "leavesQtyRq":"0.2",
        //        "execPriceRp":"0",
        //        "orderValueRv":"10",
        //        "leavesValueRv":"10",
        //        "cumValueRv":"0",
        //        "stopDirection":"0",
        //        "stopPxRp":"0",
        //        "trigger":"0",
        //        "actionBy":"1",
        //        "execFeeRv":"0",
        //        "ordType":"2",
        //        "ordStatus":"5",
        //        "clOrdId":"4b3b188",
        //        "orderId":"4b3b1884-87cf-4897-b596-6693b7ed84d1",
        //        "execStatus":"5",
        //        "bizError":"0",
        //        "totalPnlRv":null,
        //        "avgTransactPriceRp":null,
        //        "orderDetailsVos":null,
        //        "tradeType":"0"
        //    }
        //
        const id = this.safeString2 (order, 'orderID', 'orderId');
        let clientOrderId = this.safeString2 (order, 'clOrdID', 'clOrdId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        market = this.safeMarket (marketId, market);
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const side = this.parseOrderSide (this.safeStringLower (order, 'side'));
        const type = this.parseOrderType (this.safeString (order, 'orderType'));
        let price = this.safeString (order, 'priceRp');
        if (price === undefined) {
            price = this.fromEp (this.safeString (order, 'priceEp'), market);
        }
        const amount = this.safeNumber2 (order, 'orderQty', 'orderQtyRq');
        const filled = this.safeNumber2 (order, 'cumQty', 'cumQtyRq');
        const remaining = this.safeNumber2 (order, 'leavesQty', 'leavesQtyRq');
        let timestamp = this.safeIntegerProduct (order, 'actionTimeNs', 0.000001);
        if (timestamp === undefined) {
            timestamp = this.safeInteger (order, 'createdAt');
        }
        const cost = this.safeNumber2 (order, 'cumValue', 'cumValueRv');
        let lastTradeTimestamp = this.safeIntegerProduct (order, 'transactTimeNs', 0.000001);
        if (lastTradeTimestamp === 0) {
            lastTradeTimestamp = undefined;
        }
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        const triggerPrice = this.omitZero (this.safeString2 (order, 'stopPx', 'stopPxRp'));
        const postOnly = (timeInForce === 'PO');
        let reduceOnly = this.safeValue (order, 'reduceOnly');
        const execInst = this.safeString (order, 'execInst');
        if (execInst === 'ReduceOnly') {
            reduceOnly = true;
        }
        const takeProfit = this.safeString (order, 'takeProfitRp');
        const stopLoss = this.safeString (order, 'stopLossRp');
        const feeValue = this.omitZero (this.safeString (order, 'execFeeRv'));
        const ptFeeRv = this.omitZero (this.safeString (order, 'ptFeeRv'));
        let fee = undefined;
        if (feeValue !== undefined) {
            fee = {
                'cost': feeValue,
                'currency': market['quote'],
            };
        } else if (ptFeeRv !== undefined) {
            fee = {
                'cost': ptFeeRv,
                'currency': 'PT',
            };
        }
        return this.safeOrder ({
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
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfit,
            'stopLossPrice': stopLoss,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'average': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const isSwap = this.safeBool (market, 'swap', false);
        const hasPnl = ('closedPnl' in order) || ('closedPnlRv' in order) || ('totalPnlRv' in order);
        if (isSwap || hasPnl) {
            return this.parseSwapOrder (order, market);
        }
        return this.parseSpotOrder (order, market);
    }

    /**
     * @method
     * @name phemex#createOrder
     * @description create a trade order
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#place-order
     * @see https://phemex-docs.github.io/#place-order-http-put-prefered-3
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.trigger] trigger price for conditional orders
     * @param {object} [params.takeProfit] *swap only* *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *swap only* *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.posSide] *swap only* "Merged" for one way mode, "Long" for buy side of hedged mode, "Short" for sell side of hedged mode
     * @param {bool} [params.hedged] *swap only* true for hedged mode, false for one way mode, default is false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const requestSide = this.capitalize (side);
        type = this.capitalize (type);
        const reduceOnly = this.safeBool (params, 'reduceOnly');
        const request: Dict = {
            // common
            'symbol': market['id'],
            'side': requestSide, // Sell, Buy
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
            // 'posSide': Position direction - "Merged" for oneway mode , "Long" / "Short" for hedge mode
        };
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        const stopLoss = this.safeValue (params, 'stopLoss');
        const stopLossDefined = (stopLoss !== undefined);
        const takeProfit = this.safeValue (params, 'takeProfit');
        const takeProfitDefined = (takeProfit !== undefined);
        if (clientOrderId === undefined) {
            const brokerId = this.safeString (this.options, 'brokerId', 'CCXT123456');
            if (brokerId !== undefined) {
                request['clOrdID'] = brokerId + this.uuid16 ();
            }
        } else {
            request['clOrdID'] = clientOrderId;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        }
        const triggerPrice = this.safeStringN (params, [ 'stopPx', 'stopPrice', 'triggerPrice' ]);
        if (triggerPrice !== undefined) {
            if (market['settle'] === 'USDT') {
                request['stopPxRp'] = this.priceToPrecision (symbol, triggerPrice);
            } else {
                request['stopPxEp'] = this.toEp (triggerPrice, market);
            }
        }
        params = this.omit (params, [ 'stopPx', 'stopPrice', 'stopLoss', 'takeProfit', 'triggerPrice' ]);
        if (market['spot']) {
            let qtyType = this.safeValue (params, 'qtyType', 'ByBase');
            if ((type === 'Market') || (type === 'Stop') || (type === 'MarketIfTouched')) {
                if (price !== undefined) {
                    qtyType = 'ByQuote';
                }
            }
            if (triggerPrice !== undefined) {
                if (type === 'Limit') {
                    request['ordType'] = 'StopLimit';
                } else if (type === 'Market') {
                    request['ordType'] = 'Stop';
                }
                request['trigger'] = 'ByLastPrice';
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
                const costString = this.numberToString (cost);
                request['quoteQtyEv'] = this.toEv (costString, market);
            } else {
                const amountString = this.numberToString (amount);
                request['baseQtyEv'] = this.toEv (amountString, market);
            }
        } else if (market['swap']) {
            const hedged = this.safeBool (params, 'hedged', false);
            params = this.omit (params, 'hedged');
            let posSide = this.safeStringLower (params, 'posSide');
            if (posSide === undefined) {
                if (hedged) {
                    if (reduceOnly) {
                        side = (side === 'buy') ? 'sell' : 'buy';
                    }
                    posSide = (side === 'buy') ? 'Long' : 'Short';
                } else {
                    posSide = 'Merged';
                }
            }
            posSide = this.capitalize (posSide);
            request['posSide'] = posSide;
            if (market['settle'] === 'USDT') {
                request['orderQtyRq'] = amount;
            } else {
                request['orderQty'] = this.parseToInt (amount);
            }
            if (triggerPrice !== undefined) {
                const triggerType = this.safeString (params, 'triggerType', 'ByMarkPrice');
                request['triggerType'] = triggerType;
                // set direction & exchange specific order type
                let triggerDirection = undefined;
                [ triggerDirection, params ] = this.handleParamString (params, 'triggerDirection');
                if (triggerDirection === undefined) {
                    throw new ArgumentsRequired (this.id + " createOrder() also requires a 'triggerDirection' parameter with either 'up' or 'down' value");
                }
                // the flow defined per https://phemex-docs.github.io/#more-order-type-examples
                if (triggerDirection === 'up') {
                    if (side === 'sell') {
                        request['ordType'] = (type === 'Market') ? 'MarketIfTouched' : 'LimitIfTouched';
                    } else if (side === 'buy') {
                        request['ordType'] = (type === 'Market') ? 'Stop' : 'StopLimit';
                    }
                } else if (triggerDirection === 'down') {
                    if (side === 'sell') {
                        request['ordType'] = (type === 'Market') ? 'Stop' : 'StopLimit';
                    } else if (side === 'buy') {
                        request['ordType'] = (type === 'Market') ? 'MarketIfTouched' : 'LimitIfTouched';
                    }
                }
            }
            if (stopLossDefined || takeProfitDefined) {
                if (stopLossDefined) {
                    const stopLossTriggerPrice = this.safeValue2 (stopLoss, 'triggerPrice', 'stopPrice');
                    if (stopLossTriggerPrice === undefined) {
                        throw new InvalidOrder (this.id + ' createOrder() requires a trigger price in params["stopLoss"]["triggerPrice"] for a stop loss order');
                    }
                    if (market['settle'] === 'USDT') {
                        request['stopLossRp'] = this.priceToPrecision (symbol, stopLossTriggerPrice);
                    } else {
                        request['stopLossEp'] = this.toEp (stopLossTriggerPrice, market);
                    }
                    const stopLossTriggerPriceType = this.safeString2 (stopLoss, 'triggerPriceType', 'slTrigger');
                    if (stopLossTriggerPriceType !== undefined) {
                        request['slTrigger'] = this.safeString (this.options['triggerPriceTypesMap'], stopLossTriggerPriceType, stopLossTriggerPriceType);
                    }
                    const slLimitPrice = this.safeString (stopLoss, 'price');
                    if (slLimitPrice !== undefined) {
                        request['slPxRp'] = this.priceToPrecision (symbol, slLimitPrice);
                    }
                }
                if (takeProfitDefined) {
                    const takeProfitTriggerPrice = this.safeValue2 (takeProfit, 'triggerPrice', 'stopPrice');
                    if (takeProfitTriggerPrice === undefined) {
                        throw new InvalidOrder (this.id + ' createOrder() requires a trigger price in params["takeProfit"]["triggerPrice"] for a take profit order');
                    }
                    if (market['settle'] === 'USDT') {
                        request['takeProfitRp'] = this.priceToPrecision (symbol, takeProfitTriggerPrice);
                    } else {
                        request['takeProfitEp'] = this.toEp (takeProfitTriggerPrice, market);
                    }
                    const takeProfitTriggerPriceType = this.safeString2 (takeProfit, 'triggerPriceType', 'tpTrigger');
                    if (takeProfitTriggerPriceType !== undefined) {
                        request['tpTrigger'] = this.safeString (this.options['triggerPriceTypesMap'], takeProfitTriggerPriceType, takeProfitTriggerPriceType);
                    }
                    const tpLimitPrice = this.safeString (takeProfit, 'price');
                    if (tpLimitPrice !== undefined) {
                        request['tpPxRp'] = this.priceToPrecision (symbol, tpLimitPrice);
                    }
                }
            }
        }
        if ((type === 'Limit') || (type === 'StopLimit') || (type === 'LimitIfTouched')) {
            if (market['settle'] === 'USDT') {
                request['priceRp'] = this.priceToPrecision (symbol, price);
            } else {
                const priceString = this.numberToString (price);
                request['priceEp'] = this.toEp (priceString, market);
            }
        }
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if (takeProfitPrice !== undefined) {
            if (market['settle'] === 'USDT') {
                request['takeProfitRp'] = this.priceToPrecision (symbol, takeProfitPrice);
            } else {
                request['takeProfitEp'] = this.toEp (takeProfitPrice, market);
            }
            params = this.omit (params, 'takeProfitPrice');
        }
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        if (stopLossPrice !== undefined) {
            if (market['settle'] === 'USDT') {
                request['stopLossRp'] = this.priceToPrecision (symbol, stopLossPrice);
            } else {
                request['stopLossEp'] = this.toEp (stopLossPrice, market);
            }
            params = this.omit (params, 'stopLossPrice');
        }
        params = this.omit (params, 'reduceOnly');
        let response = undefined;
        if (market['settle'] === 'USDT') {
            response = await this.privatePostGOrders (this.extend (request, params));
        } else if (market['contract']) {
            response = await this.privatePostOrders (this.extend (request, params));
        } else {
            response = await this.privatePostSpotOrders (this.extend (request, params));
        }
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
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name phemex#editOrder
     * @description edit a trade order
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#amend-order-by-orderid
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.posSide] either 'Merged' or 'Long' or 'Short'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrdID');
        params = this.omit (params, [ 'clientOrderId', 'clOrdID' ]);
        const isUSDTSettled = (market['settle'] === 'USDT');
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        } else {
            request['orderID'] = id;
        }
        if (price !== undefined) {
            if (isUSDTSettled) {
                request['priceRp'] = this.priceToPrecision (market['symbol'], price);
            } else {
                request['priceEp'] = this.toEp (price, market);
            }
        }
        // Note the uppercase 'V' in 'baseQtyEV' request. that is exchange's requirement at this moment. However, to avoid mistakes from user side, let's support lowercased 'baseQtyEv' too
        const finalQty = this.safeString (params, 'baseQtyEv');
        params = this.omit (params, [ 'baseQtyEv' ]);
        if (finalQty !== undefined) {
            request['baseQtyEV'] = finalQty;
        } else if (amount !== undefined) {
            if (isUSDTSettled) {
                request['orderQtyRq'] = this.amountToPrecision (market['symbol'], amount);
            } else {
                request['baseQtyEV'] = this.toEv (amount, market);
            }
        }
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopPx', 'stopPrice' ]);
        if (triggerPrice !== undefined) {
            if (isUSDTSettled) {
                request['stopPxRp'] = this.priceToPrecision (symbol, triggerPrice);
            } else {
                request['stopPxEp'] = this.toEp (triggerPrice, market);
            }
        }
        params = this.omit (params, [ 'triggerPrice', 'stopPx', 'stopPrice' ]);
        let response = undefined;
        if (isUSDTSettled) {
            const posSide = this.safeString (params, 'posSide');
            if (posSide === undefined) {
                request['posSide'] = 'Merged';
            }
            response = await this.privatePutGOrdersReplace (this.extend (request, params));
        } else if (market['swap']) {
            response = await this.privatePutOrdersReplace (this.extend (request, params));
        } else {
            response = await this.privatePutSpotOrders (this.extend (request, params));
        }
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name phemex#cancelOrder
     * @description cancels an open order
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#cancel-single-order-by-orderid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.posSide] either 'Merged' or 'Long' or 'Short'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrdID');
        params = this.omit (params, [ 'clientOrderId', 'clOrdID' ]);
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        } else {
            request['orderID'] = id;
        }
        let response = undefined;
        if (market['settle'] === 'USDT') {
            const posSide = this.safeString (params, 'posSide');
            if (posSide === undefined) {
                request['posSide'] = 'Merged';
            }
            response = await this.privateDeleteGOrdersCancel (this.extend (request, params));
        } else if (market['swap']) {
            response = await this.privateDeleteOrdersCancel (this.extend (request, params));
        } else {
            response = await this.privateDeleteSpotOrders (this.extend (request, params));
        }
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name phemex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#cancelall
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const trigger = this.safeValue2 (params, 'stop', 'trigger', false);
        params = this.omit (params, [ 'stop', 'trigger' ]);
        const request: Dict = {
            'symbol': market['id'],
            // 'untriggerred': false, // false to cancel non-conditional orders, true to cancel conditional orders
            // 'text': 'up to 40 characters max',
        };
        if (trigger) {
            request['untriggerred'] = trigger;
        }
        let response = undefined;
        if (market['settle'] === 'USDT') {
            response = await this.privateDeleteGOrdersAll (this.extend (request, params));
            //
            //    {
            //        code: '0',
            //        msg: '',
            //        data: '1'
            //    }
            //
        } else if (market['swap']) {
            response = await this.privateDeleteOrdersAll (this.extend (request, params));
            //
            //    {
            //        code: '0',
            //        msg: '',
            //        data: '1'
            //    }
            //
        } else {
            response = await this.privateDeleteSpotOrdersAll (this.extend (request, params));
            //
            //    {
            //        code: '0',
            //        msg: '',
            //        data: {
            //            total: '1'
            //        }
            //    }
            //
        }
        return [
            this.safeOrder ({
                'info': response,
            }),
        ];
    }

    /**
     * @method
     * @name phemex#fetchOrder
     * @see https://phemex-docs.github.io/#query-orders-by-ids
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrdID');
        params = this.omit (params, [ 'clientOrderId', 'clOrdID' ]);
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        } else {
            request['orderID'] = id;
        }
        let response = undefined;
        if (market['settle'] === 'USDT') {
            response = await this.privateGetApiDataGFuturesOrdersByOrderId (this.extend (request, params));
        } else if (market['spot']) {
            response = await this.privateGetApiDataSpotsOrdersByOrderId (this.extend (request, params));
        } else {
            response = await this.privateGetExchangeOrder (this.extend (request, params));
        }
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
            order = this.safeDict (data, 0, {});
        } else if (market['spot']) {
            const rows = this.safeList (data, 'rows', []);
            order = this.safeDict (rows, 0, {});
        }
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name phemex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['settle'] === 'USDT') {
            request['currency'] = market['settle'];
            response = await this.privateGetExchangeOrderV2OrderList (this.extend (request, params));
        } else if (market['swap']) {
            response = await this.privateGetExchangeOrderList (this.extend (request, params));
        } else {
            response = await this.privateGetApiDataSpotsOrders (this.extend (request, params));
        }
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeList (data, 'rows', data);
        return this.parseOrders (rows, market, since, limit);
    }

    /**
     * @method
     * @name phemex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryopenorder
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotListAllOpenOrder
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        try {
            if (market['settle'] === 'USDT') {
                response = await this.privateGetGOrdersActiveList (this.extend (request, params));
            } else if (market['swap']) {
                response = await this.privateGetOrdersActiveList (this.extend (request, params));
            } else {
                response = await this.privateGetSpotOrders (this.extend (request, params));
            }
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        const data = this.safeValue (response, 'data', {});
        if (Array.isArray (data)) {
            return this.parseOrders (data, market, since, limit);
        } else {
            const rows = this.safeList (data, 'rows', []);
            return this.parseOrders (rows, market, since, limit);
        }
    }

    /**
     * @method
     * @name phemex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorder
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#queryorder
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedgedd-Perpetual-API.md#query-closed-orders-by-symbol
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotDataOrdersByIds
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.settle] the settlement currency to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
        };
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if ((symbol === undefined) || (this.safeString (market, 'settle') === 'USDT')) {
            request['currency'] = this.safeString (params, 'settle', 'USDT');
            response = await this.privateGetExchangeOrderV2OrderList (this.extend (request, params));
        } else if (market['swap']) {
            response = await this.privateGetExchangeOrderList (this.extend (request, params));
        } else {
            response = await this.privateGetExchangeSpotOrder (this.extend (request, params));
        }
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
            const rows = this.safeList (data, 'rows', []);
            return this.parseOrders (rows, market, since, limit);
        }
    }

    /**
     * @method
     * @name phemex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-user-trade
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-user-trade
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotDataTradesHist
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {};
        if (limit !== undefined) {
            limit = Math.min (200, limit);
            request['limit'] = limit;
        }
        const isUSDTSettled = (symbol === undefined) || (this.safeString (market, 'settle') === 'USDT');
        if (isUSDTSettled) {
            request['currency'] = 'USDT';
            request['offset'] = 0;
            if (limit === undefined) {
                request['limit'] = 200;
            }
        } else {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        let response = undefined;
        if (isUSDTSettled) {
            response = await this.privateGetExchangeOrderV2TradingList (this.extend (request, params));
        } else if (market['swap']) {
            response = await this.privateGetExchangeOrderTrade (this.extend (request, params));
        } else {
            response = await this.privateGetExchangeSpotOrderTrades (this.extend (request, params));
        }
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
        // swap - usdt
        //
        // {
        //     "code": 0,
        //     "msg": "OK",
        //     "data": {
        //         "total": 4,
        //         "rows": [
        //             {
        //                 "createdAt": 1666226932259,
        //                 "symbol": "ETHUSDT",
        //                 "currency": "USDT",
        //                 "action": 1,
        //                 "tradeType": 1,
        //                 "execQtyRq": "0.01",
        //                 "execPriceRp": "1271.9",
        //                 "side": 1,
        //                 "orderQtyRq": "0.78",
        //                 "priceRp": "1271.9",
        //                 "execValueRv": "12.719",
        //                 "feeRateRr": "0.0001",
        //                 "execFeeRv": "0.0012719",
        //                 "ordType": 2,
        //                 "execId": "8718cae",
        //                 "execStatus": 6
        //             },
        //         ]
        //     }
        // }
        //
        let data = undefined;
        if (isUSDTSettled) {
            data = this.safeValue (response, 'data', []);
        } else {
            data = this.safeValue (response, 'data', {});
            data = this.safeValue (data, 'rows', []);
        }
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name phemex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        const defaultNetworks = this.safeDict (this.options, 'defaultNetworks');
        const defaultNetwork = this.safeStringUpper (defaultNetworks, code);
        const networks = this.safeDict (this.options, 'networks', {});
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
            'info': response,
            'currency': code,
            'network': undefined,
            'address': address,
            'tag': tag,
        } as DepositAddress;
    }

    /**
     * @method
     * @name phemex#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
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
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    /**
     * @method
     * @name phemex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
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
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'Success': 'ok',
            'Succeed': 'ok',
            'Rejected': 'failed',
            'Security check failed': 'failed',
            'SecurityCheckFailed': 'failed',
            'Expired': 'failed',
            'Address Risk': 'failed',
            'Security Checking': 'pending',
            'SecurityChecking': 'pending',
            'Pending Review': 'pending',
            'Pending Transfer': 'pending',
            'AmlCsApporve': 'pending',
            'New': 'pending',
            'Confirmed': 'pending',
            'Cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // withdraw
        //
        //     {
        //         "id": "10000001",
        //         "freezeId": null,
        //         "address": "44exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        //         "amountRv": "100",
        //         "chainCode": "11",
        //         "chainName": "TRX",
        //         "currency": "USDT",
        //         "currencyCode": 3,
        //         "email": "abc@gmail.com",
        //         "expiredTime": "0",
        //         "feeRv": "1",
        //         "nickName": null,
        //         "phone": null,
        //         "rejectReason": "",
        //         "submitedAt": "1670000000000",
        //         "submittedAt": "1670000000000",
        //         "txHash": null,
        //         "userId": "10000001",
        //         "status": "Success"
        //
        // fetchDeposits
        //
        //     {
        //         "id": "29200",
        //         "currency": "USDT",
        //         "currencyCode": "3",
        //         "chainName": "ETH",
        //         "chainCode": "4",
        //         "txHash": "0x0bdbdc47807769a03b158d5753f54dfc58b92993d2f5e818db21863e01238e5d",
        //         "address": "0x5bfbf60e0fa7f63598e6cfd8a7fd3ffac4ccc6ad",
        //         "amountEv": "3000000000",
        //         "confirmations": "13",
        //         "type": "Deposit",
        //         "status": "Success",
        //         "createdAt": "1592722565000",
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": "10000001",
        //         "userId": "10000001",
        //         "freezeId": "10000002",
        //         "phone": null,
        //         "email": "abc@gmail.com",
        //         "nickName": null,
        //         "currency": "USDT",
        //         "currencyCode": "3",
        //         "status": "Succeed",
        //         "withdrawStatus": "Succeed",
        //         "amountEv": "8800000000",
        //         "feeEv": "1200000000",
        //         "address": "0x5xxxad",
        //         "txHash: "0x0xxxx5d",
        //         "submitedAt": "1702571922000",
        //         "submittedAt": "1702571922000",
        //         "expiredTime": "0",
        //         "rejectReason": null,
        //         "chainName": "ETH",
        //         "chainCode": "4",
        //         "proxyAddress": null
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        const tag = undefined;
        const txid = this.safeString (transaction, 'txHash');
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const code = currency['code'];
        const networkId = this.safeString (transaction, 'chainName');
        const timestamp = this.safeIntegerN (transaction, [ 'createdAt', 'submitedAt', 'submittedAt' ]);
        let type = this.safeStringLower (transaction, 'type');
        let feeCost = this.parseNumber (this.fromEn (this.safeString (transaction, 'feeEv'), currency['valueScale']));
        if (feeCost === undefined) {
            feeCost = this.safeNumber (transaction, 'feeRv');
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            type = 'withdrawal';
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let amount = this.parseNumber (this.fromEn (this.safeString (transaction, 'amountEv'), currency['valueScale']));
        if (amount === undefined) {
            amount = this.safeNumber (transaction, 'amountRv');
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId),
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
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
        } as Transaction;
    }

    /**
     * @method
     * @name phemex#fetchPositions
     * @description fetch all open positions
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-trading-account-and-positions
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-account-positions
     * @see https://phemex-docs.github.io/#query-account-positions-with-unrealized-pnl
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.code] the currency code to fetch positions for, USD, BTC or USDT, USD is the default
     * @param {string} [params.method] *USDT contracts only* 'privateGetGAccountsAccountPositions' or 'privateGetAccountsPositions' default is 'privateGetGAccountsAccountPositions'
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let subType = undefined;
        let code = this.safeString2 (params, 'currency', 'code', 'USD');
        params = this.omit (params, [ 'currency', 'code' ]);
        let settle = undefined;
        let market = undefined;
        const firstSymbol = this.safeString (symbols, 0);
        if (firstSymbol !== undefined) {
            market = this.market (firstSymbol);
            settle = market['settle'];
            code = market['settle'];
        } else {
            [ settle, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'settle', code);
        }
        [ subType, params ] = this.handleSubTypeAndParams ('fetchPositions', market, params);
        const isUSDTSettled = settle === 'USDT';
        if (isUSDTSettled) {
            code = 'USDT';
        } else if (settle === 'BTC') {
            code = 'BTC';
        } else if (code === undefined) {
            code = (subType === 'linear') ? 'USD' : 'BTC';
        }
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        let response = undefined;
        if (isUSDTSettled) {
            let method = undefined;
            [ method, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'method', 'privateGetGAccountsAccountPositions');
            if (method === 'privateGetGAccountsAccountPositions') {
                response = await this.privateGetGAccountsAccountPositions (this.extend (request, params));
            } else {
                response = await this.privateGetAccountsPositions (this.extend (request, params));
            }
        } else {
            response = await this.privateGetAccountsAccountPositions (this.extend (request, params));
        }
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
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //    {
        //        "userID": "811370",
        //        "accountID": "8113700002",
        //        "symbol": "ETHUSD",
        //        "currency": "USD",
        //        "side": "Buy",
        //        "positionStatus": "Normal",
        //        "crossMargin": false,
        //        "leverageEr": "200000000",
        //        "leverage": "2.00000000",
        //        "initMarginReqEr": "50000000",
        //        "initMarginReq": "0.50000000",
        //        "maintMarginReqEr": "1000000",
        //        "maintMarginReq": "0.01000000",
        //        "riskLimitEv": "5000000000",
        //        "riskLimit": "500000.00000000",
        //        "size": "1",
        //        "value": "22.22370000",
        //        "valueEv": "222237",
        //        "avgEntryPriceEp": "44447400",
        //        "avgEntryPrice": "4444.74000000",
        //        "posCostEv": "111202",
        //        "posCost": "11.12020000",
        //        "assignedPosBalanceEv": "111202",
        //        "assignedPosBalance": "11.12020000",
        //        "bankruptCommEv": "84",
        //        "bankruptComm": "0.00840000",
        //        "bankruptPriceEp": "22224000",
        //        "bankruptPrice": "2222.40000000",
        //        "positionMarginEv": "111118",
        //        "positionMargin": "11.11180000",
        //        "liquidationPriceEp": "22669000",
        //        "liquidationPrice": "2266.90000000",
        //        "deleveragePercentileEr": "0",
        //        "deleveragePercentile": "0E-8",
        //        "buyValueToCostEr": "50112500",
        //        "buyValueToCost": "0.50112500",
        //        "sellValueToCostEr": "50187500",
        //        "sellValueToCost": "0.50187500",
        //        "markPriceEp": "31332499",
        //        "markPrice": "3133.24990000",
        //        "markValueEv": "0",
        //        "markValue": null,
        //        "unRealisedPosLossEv": "0",
        //        "unRealisedPosLoss": null,
        //        "estimatedOrdLossEv": "0",
        //        "estimatedOrdLoss": "0E-8",
        //        "usedBalanceEv": "111202",
        //        "usedBalance": "11.12020000",
        //        "takeProfitEp": "0",
        //        "takeProfit": null,
        //        "stopLossEp": "0",
        //        "stopLoss": null,
        //        "cumClosedPnlEv": "-1546",
        //        "cumFundingFeeEv": "1605",
        //        "cumTransactFeeEv": "8438",
        //        "realisedPnlEv": "0",
        //        "realisedPnl": null,
        //        "cumRealisedPnlEv": "0",
        //        "cumRealisedPnl": null,
        //        "transactTimeNs": "1641571200001885324",
        //        "takerFeeRateEr": "0",
        //        "makerFeeRateEr": "0",
        //        "term": "6",
        //        "lastTermEndTimeNs": "1607711882505745356",
        //        "lastFundingTimeNs": "1641571200000000000",
        //        "curTermRealisedPnlEv": "-1567",
        //        "execSeq": "12112761561"
        //    }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const collateral = this.safeString2 (position, 'positionMargin', 'positionMarginRv');
        const notionalString = this.safeString2 (position, 'value', 'valueRv');
        const maintenanceMarginPercentageString = this.safeString2 (position, 'maintMarginReq', 'maintMarginReqRr');
        const maintenanceMarginString = Precise.stringMul (notionalString, maintenanceMarginPercentageString);
        const initialMarginString = this.safeString2 (position, 'assignedPosBalance', 'assignedPosBalanceRv');
        const initialMarginPercentageString = Precise.stringDiv (initialMarginString, notionalString);
        const liquidationPrice = this.safeNumber2 (position, 'liquidationPrice', 'liquidationPriceRp');
        const markPriceString = this.safeString2 (position, 'markPrice', 'markPriceRp');
        const contracts = this.safeString (position, 'size');
        const contractSize = this.safeValue (market, 'contractSize');
        const contractSizeString = this.numberToString (contractSize);
        const leverage = this.parseNumber (Precise.stringAbs ((this.safeString2 (position, 'leverage', 'leverageRr'))));
        const entryPriceString = this.safeString2 (position, 'avgEntryPrice', 'avgEntryPriceRp');
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
        const marginRatio = Precise.stringDiv (maintenanceMarginString, collateral);
        const isCross = this.safeValue (position, 'crossMargin');
        return this.safePosition ({
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
            'lastPrice': undefined,
            'entryPrice': this.parseNumber (entryPriceString),
            'timestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentageString),
            'maintenanceMargin': this.parseNumber (maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentageString),
            'marginRatio': this.parseNumber (marginRatio),
            'datetime': undefined,
            'marginMode': isCross ? 'cross' : 'isolated',
            'side': side,
            'hedged': false,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name phemex#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#futureDataFundingFeesHist
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            // 'limit': 20, // Page size default 20, max 200
            // 'offset': 0, // Page start default 0
        };
        if (limit !== undefined) {
            if (limit > 200) {
                throw new BadRequest (this.id + ' fetchFundingHistory() limit argument cannot exceed 200');
            }
            request['limit'] = limit;
        }
        let response = undefined;
        const isUsdt = market['settle'] === 'USDT';
        if (isUsdt) {
            response = await this.privateGetApiDataGFuturesFundingFees (this.extend (request, params));
        } else {
            response = await this.privateGetApiDataFuturesFundingFees (this.extend (request, params));
        }
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "BTCUSD",
        //                     "currency": "BTC",
        //                     "execQty": 18, // "execQty" regular, but "execQtyRq" in hedge
        //                     "side": "Buy",
        //                     "execPriceEp": 360086455, // "execPriceEp" regular, but "execPriceRp" in hedge
        //                     "execValueEv": 49987, // "execValueEv" regular, but "execValueRv" in hedge
        //                     "fundingRateEr": 10000, // "fundingRateEr" regular, but "fundingRateRr" in hedge
        //                     "feeRateEr": 10000, // "feeRateEr" regular, but "feeRateRr" in hedge
        //                     "execFeeEv": 5, // "execFeeEv" regular, but "execFeeRv" in hedge
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
            const execFee = this.safeString2 (entry, 'execFeeEv', 'execFeeRv');
            const currencyCode = this.safeCurrencyCode (this.safeString (entry, 'currency'));
            result.push ({
                'info': entry,
                'symbol': this.safeString (entry, 'symbol'),
                'code': currencyCode,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': undefined,
                'amount': this.parseFundingFeeToPrecision (execFee, market, currencyCode),
            });
        }
        return result as FundingHistory[];
    }

    parseFundingFeeToPrecision (value, market: Market = undefined, currencyCode: Str = undefined) {
        if (value === undefined || currencyCode === undefined) {
            return value;
        }
        // it was confirmed by phemex support, that USDT contracts use direct amounts in funding fees, while USD & INVERSE needs 'valueScale'
        const isUsdt = market['settle'] === 'USDT';
        if (!isUsdt) {
            const currency = this.safeCurrency (currencyCode);
            const scale = this.safeString (currency['info'], 'valueScale');
            const tickPrecision = this.parsePrecision (scale);
            value = Precise.stringMul (value, tickPrecision);
        }
        return value;
    }

    /**
     * @method
     * @name phemex#fetchFundingRate
     * @description fetch the current funding rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        let response: Dict = {};
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

    parseFundingRate (contract, market: Market = undefined): FundingRate {
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
        const markEp = this.fromEp (this.safeString (contract, 'markEp'), market);
        const indexEp = this.fromEp (this.safeString (contract, 'indexEp'), market);
        const fundingRateEr = this.fromEr (this.safeString (contract, 'fundingRateEr'), market);
        const nextFundingRateEr = this.fromEr (this.safeString (contract, 'predFundingRateEr'), market);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber (contract, 'markPriceRp', markEp),
            'indexPrice': this.safeNumber (contract, 'indexPriceRp', indexEp),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'fundingRateRr', fundingRateEr),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': this.safeNumber (contract, 'predFundingRateRr', nextFundingRateEr),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name phemex#setMargin
     * @description Either adds or reduces margin in an isolated position in order to set the margin to a specific value
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#assign-position-balance-in-isolated-marign-mode
     * @param {string} symbol unified market symbol of the market to set margin in
     * @param {float} amount the amount to set the margin to
     * @param {object} [params] parameters specific to the exchange API endpoint
     * @returns {object} A [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async setMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
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
        const statuses: Dict = {
            '0': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseMarginModification (data: Dict, market: Market = undefined): MarginModification {
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
            'symbol': this.safeSymbol (undefined, market),
            'type': 'set',
            'marginMode': 'isolated',
            'amount': undefined,
            'total': undefined,
            'code': market[codeCurrency],
            'status': this.parseMarginStatus (this.safeString (data, 'code')),
            'timestamp': undefined,
            'datetime': undefined,
        };
    }

    /**
     * @method
     * @name phemex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://phemex-docs.github.io/#set-leverage
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap'] || market['settle'] === 'USDT') {
            throw new BadSymbol (this.id + ' setMarginMode() supports swap (non USDT based) contracts only');
        }
        marginMode = marginMode.toLowerCase ();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        let leverage = this.safeInteger (params, 'leverage');
        if (marginMode === 'cross') {
            leverage = 0;
        }
        if (leverage === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a leverage parameter');
        }
        const request: Dict = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.privatePutPositionsLeverage (this.extend (request, params));
    }

    /**
     * @method
     * @name phemex#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#switch-position-mode-synchronously
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by binance setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}) {
        this.checkRequiredArgument ('setPositionMode', symbol, 'symbol');
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['settle'] !== 'USDT') {
            throw new BadSymbol (this.id + ' setPositionMode() supports USDT settled markets only');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        if (hedged) {
            request['targetPosMode'] = 'Hedged';
        } else {
            request['targetPosMode'] = 'OneWay';
        }
        return await this.privatePutGPositionsSwitchPosModeSync (this.extend (request, params));
    }

    /**
     * @method
     * @name phemex#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    async fetchLeverageTiers (symbols: Strings = undefined, params = {}): Promise<LeverageTiers> {
        await this.loadMarkets ();
        if (symbols !== undefined) {
            const first = this.safeValue (symbols, 0);
            const market = this.market (first);
            if (market['settle'] !== 'USD') {
                throw new BadSymbol (this.id + ' fetchLeverageTiers() supports USD settled markets only');
            }
        }
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
        const riskLimits = this.safeList (data, 'riskLimits');
        return this.parseLeverageTiers (riskLimits, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market: Market = undefined): LeverageTier[] {
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
        const marketId = this.safeString (info, 'symbol');
        market = this.safeMarket (marketId, market);
        const riskLimits = (market['info']['riskLimits']);
        const tiers = [];
        let minNotional = 0;
        for (let i = 0; i < riskLimits.length; i++) {
            const tier = riskLimits[i];
            const maxNotional = this.safeInteger (tier, 'limit');
            tiers.push ({
                'tier': this.sum (i, 1),
                'symbol': this.safeSymbol (marketId, market),
                'currency': market['settle'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeString (tier, 'maintenanceMargin'),
                'maxLeverage': undefined,
                'info': tier,
            });
            minNotional = maxNotional;
        }
        return tiers as LeverageTier[];
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
                const isOrderPlacement = (path === 'g-orders') || (path === 'spot/orders') || (path === 'orders');
                if (isOrderPlacement) {
                    if (this.safeString (params, 'clOrdID') === undefined) {
                        const id = this.safeString (this.options, 'brokerId', 'CCXT123456');
                        params['clOrdID'] = id + this.uuid16 ();
                    }
                }
                payload = this.json (params);
                body = payload;
                headers['Content-Type'] = 'application/json';
            }
            const auth = requestPath + queryString + expiryString + payload;
            headers['x-phemex-request-signature'] = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
        }
        url = this.implodeHostname (this.urls['api'][api]) + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name phemex#setLeverage
     * @description set the level of leverage for a market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#set-leverage
     * @param {float} leverage the rate of leverage, 100 > leverage > -100 excluding numbers between -1 to 1
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.hedged] set to true if hedged position mode is enabled (by default long and short leverage are set to the same value)
     * @param {float} [params.longLeverageRr] *hedged mode only* set the leverage for long positions
     * @param {float} [params.shortLeverageRr] *hedged mode only* set the leverage for short positions
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}) {
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < -100) || (leverage > 100)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between -100 and 100');
        }
        await this.loadMarkets ();
        const isHedged = this.safeBool (params, 'hedged', false);
        const longLeverageRr = this.safeInteger (params, 'longLeverageRr');
        const shortLeverageRr = this.safeInteger (params, 'shortLeverageRr');
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['settle'] === 'USDT') {
            if (!isHedged && longLeverageRr === undefined && shortLeverageRr === undefined) {
                request['leverageRr'] = leverage;
            } else {
                const longVar = (longLeverageRr !== undefined) ? longLeverageRr : leverage;
                const shortVar = (shortLeverageRr !== undefined) ? shortLeverageRr : leverage;
                request['longLeverageRr'] = longVar;
                request['shortLeverageRr'] = shortVar;
            }
            response = await this.privatePutGPositionsLeverage (this.extend (request, params));
        } else {
            request['leverage'] = leverage;
            response = await this.privatePutPositionsLeverage (this.extend (request, params));
        }
        return response;
    }

    /**
     * @method
     * @name phemex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://phemex-docs.github.io/#transfer-between-spot-and-futures
     * @see https://phemex-docs.github.io/#universal-transfer-main-account-only-transfer-between-sub-to-main-main-to-sub-or-sub-to-sub
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.bizType] for transferring between main and sub-acounts either 'SPOT' or 'PERPETUAL' default is 'SPOT'
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
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
            const request: Dict = {
                'currency': currency['id'],
                'moveOp': direction,
                'amountEv': scaledAmmount,
            };
            const response = await this.privatePostAssetsTransfer (this.extend (request, params));
            //
            //     {
            //         "code": "0",
            //         "msg": "OK",
            //         "data": {
            //             "linkKey": "8564eba4-c9ec-49d6-9b8c-2ec5001a0fb9",
            //             "userId": "4018340",
            //             "currency": "USD",
            //             "amountEv": "10",
            //             "side": "2",
            //             "status": "10"
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            transfer = this.parseTransfer (data, currency);
        } else { // sub account transfer
            const request: Dict = {
                'fromUserId': fromId,
                'toUserId': toId,
                'amountEv': scaledAmmount,
                'currency': currency['id'],
                'bizType': this.safeString (params, 'bizType', 'SPOT'),
            };
            const response = await this.privatePostAssetsUniversalTransfer (this.extend (request, params));
            //
            //     {
            //         "code": "0",
            //         "msg": "OK",
            //         "data": "API-923db826-aaaa-aaaa-aaaa-4d98c3a7c9fd"
            //     }
            //
            transfer = this.parseTransfer (response);
        }
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeBool (transferOptions, 'fillResponseFromRequest', true);
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

    /**
     * @method
     * @name phemex#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://phemex-docs.github.io/#query-transfer-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a code argument');
        }
        const currency = this.currency (code);
        const request: Dict = {
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
        const transfers = this.safeList (data, 'rows', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // transfer
        //
        //     {
        //         "linkKey": "8564eba4-c9ec-49d6-9b8c-2ec5001a0fb9",
        //         "userId": "4018340",
        //         "currency": "USD",
        //         "amountEv": "10",
        //         "side": "2",
        //         "status": "10"
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
        const amountTransfered = this.fromEv (amountEv);
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

    parseTransferStatus (status: Str): Str {
        const statuses: Dict = {
            '3': 'rejected', // 'Rejected',
            '6': 'canceled', // 'Got error and wait for recovery',
            '10': 'ok', // 'Success',
            '11': 'failed', // 'Failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name phemex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://phemex-docs.github.io/#query-funding-rate-history-2
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isUsdtSettled = market['settle'] === 'USDT';
        if (!market['swap']) {
            throw new BadRequest (this.id + ' fetchFundingRateHistory() supports swap contracts only');
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchFundingRateHistory', symbol, since, limit, '8h', params, 100) as FundingRateHistory[];
        }
        let customSymbol = undefined;
        if (isUsdtSettled) {
            customSymbol = '.' + market['id'] + 'FR8H'; // phemex requires a custom symbol for funding rate history
        } else {
            customSymbol = '.' + market['baseId'] + 'FR8H';
        }
        let request: Dict = {
            'symbol': customSymbol,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('end', request, params);
        let response = undefined;
        if (isUsdtSettled) {
            response = await this.v2GetApiDataPublicDataFundingRateHistory (this.extend (request, params));
        } else {
            response = await this.v1GetApiDataPublicDataFundingRateHistory (this.extend (request, params));
        }
        //
        //    {
        //        "code":"0",
        //        "msg":"OK",
        //        "data":{
        //           "rows":[
        //              {
        //                 "symbol":".BTCUSDTFR8H",
        //                 "fundingRate":"0.0001",
        //                 "fundingTime":"1682064000000",
        //                 "intervalSeconds":"28800"
        //              }
        //           ]
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const rates = this.safeValue (data, 'rows');
        const result = [];
        for (let i = 0; i < rates.length; i++) {
            const item = rates[i];
            const timestamp = this.safeInteger (item, 'fundingTime');
            result.push ({
                'info': item,
                'symbol': symbol,
                'fundingRate': this.safeNumber (item, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingRateHistory[];
    }

    /**
     * @method
     * @name phemex#withdraw
     * @description make a withdrawal
     * @see https://phemex-docs.github.io/#create-withdraw-request
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the phemex api endpoint
     * @param {string} [params.network] unified network code
     * @returns {object} a [transaction structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        let networkId = undefined;
        if (networkCode !== undefined) {
            networkId = this.networkCodeToId (networkCode);
        }
        const stableCoins = this.safeValue (this.options, 'stableCoins');
        if (networkId === undefined) {
            if (!(this.inArray (code, stableCoins))) {
                networkId = currency['id'];
            } else {
                throw new ArgumentsRequired (this.id + ' withdraw () requires an extra argument params["network"]');
            }
        }
        const request: Dict = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
            'chainName': networkId.toUpperCase (),
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        const response = await this.privatePostPhemexWithdrawWalletsApiCreateWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "id": "10000001",
        //             "freezeId": null,
        //             "address": "44exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        //             "amountRv": "100",
        //             "chainCode": "11",
        //             "chainName": "TRX",
        //             "currency": "USDT",
        //             "currencyCode": 3,
        //             "email": "abc@gmail.com",
        //             "expiredTime": "0",
        //             "feeRv": "1",
        //             "nickName": null,
        //             "phone": null,
        //             "rejectReason": "",
        //             "submitedAt": "1670000000000",
        //             "submittedAt": "1670000000000",
        //             "txHash": null,
        //             "userId": "10000001",
        //             "status": "Success"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTransaction (data, currency);
    }

    /**
     * @method
     * @name phemex#fetchOpenInterest
     * @description retrieves the open interest of a trading pair
     * @see https://phemex-docs.github.io/#query-24-hours-ticker
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterest (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest is only supported for contract markets.');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.v2GetMdV2Ticker24hr (this.extend (request, params));
        //
        //    {
        //        error: null,
        //        id: '0',
        //        result: {
        //          closeRp: '67550.1',
        //          fundingRateRr: '0.0001',
        //          highRp: '68400',
        //          indexPriceRp: '67567.15389794',
        //          lowRp: '66096.4',
        //          markPriceRp: '67550.1',
        //          openInterestRv: '1848.1144186',
        //          openRp: '66330',
        //          predFundingRateRr: '0.0001',
        //          symbol: 'BTCUSDT',
        //          timestamp: '1729114315443343001',
        //          turnoverRv: '228863389.3237532',
        //          volumeRq: '3388.5600312'
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result');
        return this.parseOpenInterest (result, market);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //    {
        //        closeRp: '67550.1',
        //        fundingRateRr: '0.0001',
        //        highRp: '68400',
        //        indexPriceRp: '67567.15389794',
        //        lowRp: '66096.4',
        //        markPriceRp: '67550.1',
        //        openInterestRv: '1848.1144186',
        //        openRp: '66330',
        //        predFundingRateRr: '0.0001',
        //        symbol: 'BTCUSDT',
        //        timestamp: '1729114315443343001',
        //        turnoverRv: '228863389.3237532',
        //        volumeRq: '3388.5600312'
        //    }
        //
        const timestamp = this.safeInteger (interest, 'timestamp') / 1000000;
        const id = this.safeString (interest, 'symbol');
        return this.safeOpenInterest ({
            'info': interest,
            'symbol': this.safeSymbol (id, market),
            'baseVolume': this.safeString (interest, 'volumeRq'),
            'quoteVolume': undefined,  // deprecated
            'openInterestAmount': this.safeString (interest, 'openInterestRv'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        }, market);
    }

    /**
     * @method
     * @name phemex#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://phemex-docs.github.io/#rfq-quote
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} amount how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertQuote (fromCode: string, toCode: string, amount: Num = undefined, params = {}): Promise<Conversion> {
        await this.loadMarkets ();
        const fromCurrency = this.currency (fromCode);
        const toCurrency = this.currency (toCode);
        const valueScale = this.safeInteger (fromCurrency, 'valueScale');
        const request: Dict = {
            'fromCurrency': fromCode,
            'toCurrency': toCode,
            'fromAmountEv': this.toEn (amount, valueScale),
        };
        const response = await this.privateGetAssetsQuote (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "code": "GIF...AAA",
        //             "quoteArgs": {
        //                 "origin": 10,
        //                 "price": "0.00000939",
        //                 "proceeds": "0.00000000",
        //                 "ttlMs": 7000,
        //                 "expireAt": 1739875826009,
        //                 "requestAt": 1739875818009,
        //                 "quoteAt": 1739875816594
        //             }
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseConversion (data, fromCurrency, toCurrency);
    }

    /**
     * @method
     * @name phemex#createConvertTrade
     * @description convert from one currency to another
     * @see https://phemex-docs.github.io/#convert
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async createConvertTrade (id: string, fromCode: string, toCode: string, amount: Num = undefined, params = {}): Promise<Conversion> {
        await this.loadMarkets ();
        const fromCurrency = this.currency (fromCode);
        const toCurrency = this.currency (toCode);
        const valueScale = this.safeInteger (fromCurrency, 'valueScale');
        const request: Dict = {
            'code': id,
            'fromCurrency': fromCode,
            'toCurrency': toCode,
        };
        if (amount !== undefined) {
            request['fromAmountEv'] = this.toEn (amount, valueScale);
        }
        const response = await this.privatePostAssetsConvert (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "moveOp": 0,
        //             "fromCurrency": "USDT",
        //             "toCurrency": "BTC",
        //             "fromAmountEv": 4000000000,
        //             "toAmountEv": 41511,
        //             "linkKey": "45c8ed8e-d3f4-472d-8262-e464e8c46247",
        //             "status": 10
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const fromCurrencyId = this.safeString (data, 'fromCurrency');
        const fromResult = this.safeCurrency (fromCurrencyId, fromCurrency);
        const toCurrencyId = this.safeString (data, 'toCurrency');
        const to = this.safeCurrency (toCurrencyId, toCurrency);
        return this.parseConversion (data, fromResult, to);
    }

    /**
     * @method
     * @name phemex#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://phemex-docs.github.io/#query-convert-history
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve, default 20, max 200
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.until] the end time in ms
     * @param {string} [params.fromCurrency] the currency that you sold and converted from
     * @param {string} [params.toCurrency] the currency that you bought and converted into
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertTradeHistory (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Conversion[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        if (code !== undefined) {
            request['fromCurrency'] = code;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.privateGetAssetsConvert (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "OK",
        //         "data": {
        //             "total": 2,
        //             "rows": [
        //                 {
        //                     "linkKey": "45c8ed8e-d3f4-472d-8262-e464e8c46247",
        //                     "createTime": 1739882294000,
        //                     "fromCurrency": "USDT",
        //                     "toCurrency": "BTC",
        //                     "fromAmountEv": 4000000000,
        //                     "toAmountEv": 41511,
        //                     "status": 10,
        //                     "conversionRate": 1037,
        //                     "errorCode": 0
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const rows = this.safeList (data, 'rows', []);
        return this.parseConversions (rows, code, 'fromCurrency', 'toCurrency', since, limit);
    }

    parseConversion (conversion: Dict, fromCurrency: Currency = undefined, toCurrency: Currency = undefined): Conversion {
        //
        // fetchConvertQuote
        //
        //     {
        //         "code": "GIF...AAA",
        //         "quoteArgs": {
        //             "origin": 10,
        //             "price": "0.00000939",
        //             "proceeds": "0.00000000",
        //             "ttlMs": 7000,
        //             "expireAt": 1739875826009,
        //             "requestAt": 1739875818009,
        //             "quoteAt": 1739875816594
        //         }
        //     }
        //
        // createConvertTrade
        //
        //     {
        //         "moveOp": 0,
        //         "fromCurrency": "USDT",
        //         "toCurrency": "BTC",
        //         "fromAmountEv": 4000000000,
        //         "toAmountEv": 41511,
        //         "linkKey": "45c8ed8e-d3f4-472d-8262-e464e8c46247",
        //         "status": 10
        //     }
        //
        // fetchConvertTradeHistory
        //
        //     {
        //         "linkKey": "45c8ed8e-d3f4-472d-8262-e464e8c46247",
        //         "createTime": 1739882294000,
        //         "fromCurrency": "USDT",
        //         "toCurrency": "BTC",
        //         "fromAmountEv": 4000000000,
        //         "toAmountEv": 41511,
        //         "status": 10,
        //         "conversionRate": 1037,
        //         "errorCode": 0
        //     }
        //
        const quoteArgs = this.safeDict (conversion, 'quoteArgs', {});
        const requestTime = this.safeInteger (quoteArgs, 'requestAt');
        const timestamp = this.safeInteger (conversion, 'createTime', requestTime);
        const fromCoin = this.safeString (conversion, 'fromCurrency', this.safeString (fromCurrency, 'code'));
        const fromCode = this.safeCurrencyCode (fromCoin, fromCurrency);
        const toCoin = this.safeString (conversion, 'toCurrency', this.safeString (toCurrency, 'code'));
        const toCode = this.safeCurrencyCode (toCoin, toCurrency);
        const fromValueScale = this.safeInteger (fromCurrency, 'valueScale');
        const toValueScale = this.safeInteger (toCurrency, 'valueScale');
        let fromAmount = this.fromEn (this.safeString (conversion, 'fromAmountEv'), fromValueScale);
        if (fromAmount === undefined && quoteArgs !== undefined) {
            fromAmount = this.fromEn (this.safeString (quoteArgs, 'origin'), fromValueScale);
        }
        let toAmount = this.fromEn (this.safeString (conversion, 'toAmountEv'), toValueScale);
        if (toAmount === undefined && quoteArgs !== undefined) {
            toAmount = this.fromEn (this.safeString (quoteArgs, 'proceeds'), toValueScale);
        }
        return {
            'info': conversion,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': this.safeString (conversion, 'code'),
            'fromCurrency': fromCode,
            'fromAmount': this.parseNumber (fromAmount),
            'toCurrency': toCode,
            'toAmount': this.parseNumber (toAmount),
            'price': this.safeNumber (quoteArgs, 'price'),
            'fee': undefined,
        } as Conversion;
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
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
        return undefined;
    }
}
