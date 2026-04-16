
//  ---------------------------------------------------------------------------

import Exchange from './abstract/weex.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, NotSupported, OrderNotFound, PermissionDenied } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Currency, Dict, FundingRate, FundingRateHistory, FundingRates, LedgerEntry, Int, int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TransferEntry, Position, TradingFeeInterface, MarginMode, MarginModes, Leverage, Leverages, MarginModification } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class weex
 * @augments Exchange
 */
export default class weex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'weex',
            'name': 'Weex',
            'countries': [ 'SG' ], // Singapore
            'rateLimit': 20, // 10 requests per second for public endpoints, 500 requests per 10 seconds for private endpoints
            'version': 'v3',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersWithClientOrderId': true,
                'cancelOrderWithClientOrderId': true,
                'closeAllPositions': true,
                'closePosition': true,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'deposit': false,
                'editOrder': false,
                'editOrders': false,
                'editOrderWithClientOrderId': false,
                'fetchAccounts': false,
                'fetchADLRank': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': true, // contracts only
                'fetchCanceledOrders': true,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': false,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL2OrderBook': false,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': true,
                'fetchLedgerEntry': false,
                'fetchLeverage': true,
                'fetchLeverages': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': true,
                'fetchMarginModes': true,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true, // spot only
                'fetchOrdersByStatus': false,
                'fetchOrderTrades': true,
                'fetchOrderWithClientOrderId': true, // spot only
                'fetchPosition': true,
                'fetchPositionADLRank': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsADLRank': false,
                'fetchPositionsForSymbol': true,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'privateAPI': false,
                'publicAPI': false,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/ccbadb2d-5035-403d-898f-dce831bdc936', // todo
                'api': {
                    'public': 'https://api-spot.weex.com',
                    'private': 'https://api-spot.weex.com',
                    'contract': 'https://api-contract.weex.com',
                    'contractPrivate': 'https://api-contract.weex.com',
                },
                'www': 'https://www.weex.com',
                'doc': [
                    'https://www.weex.com/api-doc',
                ],
                'referral': 'https://www.weex.com/register?vipCode=qfyh',
            },
            'api': {
                'public': {
                    // multiply public endpoints weight by 5
                    'get': {
                        'api/v3/time': 5, // done
                        'api/v3/coins': 25, // done
                        'api/v3/exchangeInfo': 100, // done
                        'api/v3/ping': 5, // done
                        'api/v3/apiTradingSymbols': 25, // not unified
                        'api/v3/market/ticker/price': 20, // not unified
                        'api/v3/market/ticker/24hr': 10, // done
                        'api/v3/market/trades': 125, // done
                        'api/v3/market/klines': 10, // done
                        'api/v3/market/depth': 25, // done
                        'api/v3/market/ticker/bookTicker': 20, // done
                    },
                },
                'private': {
                    'get': {
                        'api/v3/account/': 5, // done
                        'api/v3/account/transferRecords': 3, // done
                        'api/v3/order': 2, // done
                        'api/v3/openOrders': 3, // done
                        'api/v3/allOrders': 10, // done
                        'api/v3/myTrades': 5, // done
                        'api/v3/rebate/affiliate/getAffiliateUIDs': 20, // not unified
                        'api/v3/rebate/affiliate/getChannelUserTradeAndAsset': 20, // not unified
                        'api/v3/rebate/affiliate/getAffiliateCommission': 20, // not unified
                        'api/v3/rebate/affiliate/getInternalWithdrawalStatus': 100, // not unified
                        'api/v3/rebate/affiliate/querySubChannelTransactions': 10, // not unified
                        'api/v3/agency/verifyReferrals': 20, // not unified
                        'api/v3/agency/getAssert': 20, // not unified
                        'api/v3/agency/getDealData': 20, // not unified
                    },
                    'post': {
                        'api/v3/account/bills': 5, // done
                        'api/v3/account/fundingBills': 5, // done
                        'api/v3/order': 5, // done
                        'api/v3/order/batch': 50, // not supported, returns {"code":-1150,"msg":"Request method 'POST' not supported"}
                        'api/v3/rebate/affiliate/internalWithdrawal': 100, // not unified
                    },
                    'delete': {
                        'api/v3/order': 1, // done
                        'api/v3/openOrders': 1, // done
                        'api/v3/order/batch': 10, // done
                    },
                },
                'contract': {
                    // multiply public endpoints weight by 5
                    'get': {
                        'capi/v3/market/time': 5, // done
                        'capi/v3/market/exchangeInfo': 5, // done
                        'capi/v3/market/depth': 5, // done
                        'capi/v3/market/ticker/24hr': 200, // done
                        'capi/v3/market/ticker/bookTicker': 5, // done
                        'capi/v3/market/trades': 25, // done
                        'capi/v3/market/klines': 5, // done
                        'capi/v3/market/indexPriceKlines': 5, // done
                        'capi/v3/market/markPriceKlines': 5, // done
                        'capi/v3/market/historyKlines': 25, // done
                        'capi/v3/market/symbolPrice': 5, // not unified
                        'capi/v3/market/openInterest': 10, // done
                        'capi/v3/market/premiumIndex': 5, // done
                        'capi/v3/market/fundingRate': 25, // done
                        'capi/v3/market/apiTradingSymbols': 25, // not unified
                    },
                },
                'contractPrivate': {
                    'get': {
                        'capi/v3/account/balance': 10, // done
                        'capi/v3/account/commissionRate': 10, // done
                        'capi/v3/account/accountConfig': 10, // not unified
                        'capi/v3/account/symbolConfig': 10, // done
                        'capi/v3/account/position/allPosition': 15, // done
                        'capi/v3/account/position/singlePosition': 3, // done
                        'capi/v3/order': 3, // done
                        'capi/v3/openOrders': 5, // done
                        'capi/v3/order/history': 10, // done
                        'capi/v3/userTrades': 5, // done
                        'capi/v3/openAlgoOrders': 3, // done
                        'capi/v3/allAlgoOrders': 10, // not unified - capi/v3/order/history returns both regular and algo orders
                    },
                    'post': {
                        'capi/v3/account/income': 5, // done
                        'capi/v3/account/marginType': 50, // done
                        'capi/v3/account/leverage': 20, // done
                        'capi/v3/account/positionMargin': 30, // done
                        'capi/v3/account/modifyAutoAppendMargin': 30, // not unified
                        'capi/v3/order': 5, // done
                        'capi/v3/batchOrders': 10, // not supported, returns {"code":-1150,"msg":"Request method 'POST' not supported"}
                        'capi/v3/closePositions': 50, // done
                        'capi/v3/algoOrder': 5, // done
                        'capi/v3/placeTpSlOrder': 5, // not unified
                        'capi/v3/modifyTpSlOrder': 5, // not unified
                    },
                    'delete': {
                        'capi/v3/order': 3, // done
                        'capi/v3/batchOrders': 10, // done
                        'capi/v3/allOpenOrders': 10, // done
                        'capi/v3/algoOrder': 3, // done
                        'capi/v3/algoOpenOrders': 10, // done
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '-1000': ExchangeError, // UNKNOWN_ERROR An unknown error occurred.
                    '-1054': ExchangeError, // SYSTEM_ERROR System error, please retry later.
                    '-1040': AuthenticationError, // ACCESS_KEY_EMPTY ACCESS_KEY header is required.
                    '-1041': AuthenticationError, // ACCESS_SIGN_EMPTY ACCESS_SIGN header is required.
                    '-1042': AuthenticationError, // ACCESS_TIMESTAMP_EMPTY ACCESS_TIMESTAMP header is required.
                    '-1043': AuthenticationError, // INVALID_ACCESS_TIMESTAMP Invalid ACCESS_TIMESTAMP.
                    '-1044': AuthenticationError, // INVALID_ACCESS_KEY Invalid ACCESS_KEY.
                    '-1045': BadRequest, // INVALID_CONTENT_TYPE Invalid Content-Type, please use application/json.
                    '-1046': BadRequest, // ACCESS_TIMESTAMP_EXPIRED Request timestamp expired.
                    '-1047': AuthenticationError, // API_AUTH_ERROR API authentication failed.
                    '-1049': AuthenticationError, // API_KEY_OR_PASSPHRASE_INCORRECT API key or passphrase incorrect.
                    '-1050': PermissionDenied, // USER_STATUS_FORBIDDEN User status is abnormal.
                    '-1051': PermissionDenied, // PERMISSION_DENIED Permission denied.
                    '-1052': PermissionDenied, // INSUFFICIENT_PERMISSIONS Insufficient permissions for this action.
                    '-1053': PermissionDenied, // PERMISSION_VALIDATION_FAILED Permission validation failed.
                    '-1055': PermissionDenied, // USER_AUTH_NOT_SAFE User must bind phone or Google authenticator.
                    '-1056': PermissionDenied, // ILLEGAL_IP Invalid IP address.
                    '-1057': PermissionDenied, // USER_LOCKED User account is locked.
                    '-1058': PermissionDenied, // NO_PERMISSION_TRADE_PAIR No permission for this trading pair.
                    '-1115': InvalidOrder, // INVALID_TIME_IN_FORCE Invalid timeInForce.
                    '-1116': InvalidOrder, // INVALID_ORDER_TYPE Invalid order type.
                    '-1117': InvalidOrder, // INVALID_SIDE Invalid side.
                    '-1121': BadSymbol, // INVALID_SYMBOL Invalid symbol.
                    '-1128': BadRequest, // INVALID_PARAM_COMBINATION Combination of optional parameters invalid.
                    '-1135': BadRequest, // INVALID_JSON Invalid JSON request.
                    '-1140': BadRequest, // PARAM_VALIDATE_ERROR Parameter validation failed. limit must be between  and .
                    '-1141': ArgumentsRequired, // PARAM_EMPTY Parameter cannot be empty.
                    '-1142': BadRequest, // PARAM_ERROR Parameter is invalid.
                    '-1150': BadRequest, // REQUEST_METHOD_NOT_SUPPORTED Request method not supported.
                    '-1160': BadRequest, // DECIMAL_PRECISION_ERROR Decimal precision error.
                    '-1170': BadRequest, // QUERY_TIME_OUT_OF_RANGE startTime must be within the last days. Time range cannot exceed days.
                    '-1171': BadRequest, // START_TIME_AFTER_END_TIME startTime cannot be greater than endTime.
                    '-1180': InvalidOrder, // CLIENT_OID_LENGTH_ERROR client_oid length must not exceed 40 and must not contain special characters.
                    '-1190': PermissionDenied, // FORBIDDEN_ACCESS Access forbidden. Please contact support.
                    '-2007': BadSymbol, // SPOT_SYMBOL_NOT_EXIST Symbol does not exist.
                    '-2200': OrderNotFound, // SPOT_ORDER_NOT_EXIST Order does not exist.
                    '-3006': InvalidOrder, // CONTRACT_DOES_NOT_SUPPORT_CONTRACT_UNITS Contract does not support ordering by contract units.
                    '-3007': InvalidOrder, // CONTRACT_MAX_ORDER_QUANTITY_EXCEEDED Maximum contract order quantity exceeded.
                    '-3200': InvalidOrder, // CONTRACT_ORDER_NOT_EXIST Order does not exist.
                    '-3235': PermissionDenied, // CONTRACT_NO_PERMISSION_TRADE_PAIR No permission for this trading pair.
                    '-3236': PermissionDenied, // CONTRACT_NO_PERMISSION_API No permission to access this API.
                    '-3313': InvalidOrder, // CONTRACT_LEVERAGE_ERROR Leverage exceeds maximum limit.
                    '-3613': ExchangeError, // CONTRACT_FATAL_TOKEN_NOT_SUPPORT Fatal: token ID not supported for symbol.
                    'FAILED_ORDER_NOT_FOUND': OrderNotFound, // {"orderId":121231,"status":"FAILED","errorMsg":"FAILED_ORDER_NOT_FOUND"}
                },
                'broad': {
                    'amount not enough': InsufficientFunds, // {"code":-1054,"msg":"FAILED_PRECONDITION: Move margin available amount not enough. Move out available amount is 6.98296375, move out amount is 200.00000000"}
                    'INVALID_ARGUMENT': BadRequest, // {"result":false,"id":1,"msg":"INVALID_ARGUMENT: invalid symbol : ASDFS_SPBL"}
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.1'),
                    'maker': this.parseNumber ('0.1'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.1') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.09') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.06') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.03') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.1') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.07') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.03') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.01') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
                'spot': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.1'),
                    'maker': this.parseNumber ('0.1'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.1') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.09') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.06') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.03') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.1') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.07') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.03') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.01') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
                'contract': {
                    'feeSide': 'quote',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.08'),
                    'maker': this.parseNumber ('0.02'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.075') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.06') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.055') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.048') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.045') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.042') ],
                            [ this.parseNumber ('500000000'), this.parseNumber ('0.04') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.018') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.018') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.016') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.016') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.014') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.012') ],
                            [ this.parseNumber ('500000000'), this.parseNumber ('0.01') ],
                        ],
                    },
                },
            },
            'commonCurrencies': {
                'XBT': 'XBT',
            },
            'options': {
                'partner': 'b-WEEX111125',
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'accountsByType': {
                    'spot': 'spot',
                    'trading': 'spot',
                    'fund': 'funding',
                    'funding': 'funding',
                    'swap': 'contract',
                    'contract': 'contract',
                    'futures': 'contract',
                },
                'networks': {
                    'BEP20': 'BEP20(BSC)',
                    'BSC': 'BEP20(BSC)',
                    'ERC20': 'ERC20',
                    'ETH': 'ERC20',
                    'POLYGON': 'POLYGON(MATIC)',
                    'MATIC': 'POLYGON(MATIC)',
                    'ARBITRUM': 'ARBITRUM(ARB)',
                    'ARB': 'ARBITRUM(ARB)',
                    'SOLANA': 'SOLANA(SOL)',
                    'SOL': 'SOLANA(SOL)',
                    'OP': 'OPTIMISM(OP)',
                    'OPTIMISM': 'OPTIMISM(OP)',
                    'AVALANCHEC': 'AVALANCHE_C(AVAX_C)',
                    'AVAXC': 'AVALANCHE_C(AVAX_C)',
                },
                'networksById': {
                    'BEP20(BSC)': 'BEP20',
                    'ERC20': 'ERC20',
                    'POLYGON(MATIC)': 'MATIC',
                    'ARBITRUM(ARB)': 'ARB',
                    'SOLANA(SOL)': 'SOL',
                    'OPTIMISM(OP)': 'OP',
                    'AVALANCHE_C(AVAX_C)': 'AVAXC',
                },
                'timeframes': {
                    'spot': {
                        '1m': '1m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '2h': '2h',
                        '4h': '4h',
                        '6h': '6h',
                        '8h': '8h',
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                    'contract': {
                        '1m': '1m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '4h': '4h',
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'test': false,
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'forDerivs': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': true,
                                'mark': true,
                                'index': false,
                            },
                            'price': false,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
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
                        'limit': 100,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchCanceledAndClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000, // 100 for historical
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivs',
                    },
                    'inverse': undefined,
                },
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    /**
     * @method
     * @name weex#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/Ping
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.publicGetApiV3Ping (params);
        // reutns an empty response if the exchange is alive, otherwise will trigger an error
        return {
            'status': 'ok',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name weex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/GetServerTime
     * @see https://www.weex.com/api-doc/contract/Market_API/GetServerTime
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot'
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        let response = undefined;
        if (type !== 'spot') {
            response = await this.contractGetCapiV3MarketTime (params);
        } else {
            response = await this.publicGetApiV3Time (params);
        }
        //
        //     {
        //         "serverTime": 1764505776347
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name weex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/CurrencyInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetApiV3Coins (params);
        //
        //     [
        //         {
        //             "coin": "BTC",
        //             "depositAllEnable": true,
        //             "withdrawAllEnable": true,
        //             "name": "BTC",
        //             "networkList": [
        //                 {
        //                     "network": "BTC",
        //                     "coin": "BTC",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": true,
        //                     "depositEnable": true,
        //                     "withdrawEnable": true,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "BTC",
        //                     "withdrawFee": "0.00016",
        //                     "withdrawMin": "0.002",
        //                     "depositDust": "0.00001",
        //                     "minConfirm": 3,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "https://www.blockchain.com/explorer/mempool/",
        //                     "contractAddress": "btc"
        //                 },
        //                 {
        //                     "network": "BEP20(BSC)",
        //                     "coin": "BTC",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": false,
        //                     "depositEnable": true,
        //                     "withdrawEnable": false,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "BEP20(BSC)",
        //                     "withdrawFee": "0.00001",
        //                     "withdrawMin": "0.00006",
        //                     "depositDust": "0.00003",
        //                     "minConfirm": 61,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "",
        //                     "contractAddress": ""
        //                 }
        //             ]
        //         },
        //         {
        //             "coin": "USDT",
        //             "depositAllEnable": true,
        //             "withdrawAllEnable": true,
        //             "name": "USDT",
        //             "networkList": [
        //                 {
        //                     "network": "TRC20",
        //                     "coin": "USDT",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": true,
        //                     "depositEnable": true,
        //                     "withdrawEnable": true,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "TRC20",
        //                     "withdrawFee": "1.5",
        //                     "withdrawMin": "10",
        //                     "depositDust": "0.1",
        //                     "minConfirm": 20,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "https://tronscan.org/#/token20/",
        //                     "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        //                 },
        //                 {
        //                     "network": "ERC20",
        //                     "coin": "USDT",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": false,
        //                     "depositEnable": true,
        //                     "withdrawEnable": true,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "ERC20",
        //                     "withdrawFee": "1",
        //                     "withdrawMin": "20",
        //                     "depositDust": "0.1",
        //                     "minConfirm": 12,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "https://etherscan.io/token/",
        //                     "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
        //                 },
        //                 {
        //                     "network": "AVALANCHE_C(AVAX_C)",
        //                     "coin": "USDT",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": false,
        //                     "depositEnable": true,
        //                     "withdrawEnable": true,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "AVALANCHE_C(AVAX_C)",
        //                     "withdrawFee": "0.5",
        //                     "withdrawMin": "10",
        //                     "depositDust": "0.1",
        //                     "minConfirm": 35,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "https://avascan.info/blockchain/c/token/",
        //                     "contractAddress": "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"
        //                 }
        //             ]
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = this.safeDict (response, i);
            const currencyId = this.safeString (currency, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const networks: Dict = {};
            const chains = this.safeList (currency, 'networkList', []);
            for (let j = 0; j < chains.length; j++) {
                const chain = this.safeDict (chains, j);
                const networkId = this.safeString (chain, 'network');
                const networkCode = this.networkIdToCode (networkId);
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'active': undefined,
                    'deposit': this.safeBool (chain, 'depositEnable'),
                    'withdraw': this.safeBool (chain, 'withdrawEnable'),
                    'fee': this.safeNumber (chain, 'withdrawFee'),
                    'precision': this.safeNumber (chain, 'withdrawIntegerMultiple'),
                    'isDefault': this.safeBool (chain, 'isDefault', false),
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'withdrawMin'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'depositDust'),
                            'max': undefined,
                        },
                    },
                };
            }
            const networkKeys = Object.keys (networks);
            const networksLength = networkKeys.length;
            const emptyChains = networksLength === 0; // non-functional coins
            const valueForEmpty = emptyChains ? false : undefined;
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'code': code,
                'id': currencyId,
                'type': 'crypto',
                'name': name,
                'active': undefined,
                'deposit': valueForEmpty,
                'withdraw': valueForEmpty,
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
                'networks': networks,
            });
        }
        return result;
    }

    /**
     * @method
     * @name weex#fetchMarkets
     * @description retrieves data on all markets for exchagne
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/GetProductInfo // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetContractInfo // contract
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const promises = [
            this.publicGetApiV3ExchangeInfo (params),
            this.contractGetCapiV3MarketExchangeInfo (params),
        ];
        const [ spotResponse, contractResponse ] = await Promise.all (promises);
        const spotArray = this.safeList (spotResponse, 'symbols', []);
        const contractArray = this.safeList (contractResponse, 'symbols', []);
        const result = this.arrayConcat (spotArray, contractArray);
        return this.parseMarkets (result);
    }

    parseMarket (market: Dict): Market {
        //
        // spot
        //     {
        //         "symbol": "ETHUSDT",
        //         "status": "TRADING",
        //         "baseAsset": "ETH",
        //         "baseAssetPrecision": "8",
        //         "quoteAsset": "USDT",
        //         "quoteAssetPrecision": "8",
        //         "tickSize": "0.01",
        //         "stepSize": "0.00001",
        //         "minTradeAmount": "0.0001",
        //         "maxTradeAmount": "99999",
        //         "takerFeeRate": "0.001",
        //         "makerFeeRate": "0.001",
        //         "buyLimitPriceRatio": "0.1",
        //         "sellLimitPriceRatio": "0.1",
        //         "marketBuyLimitSize": "99999",
        //         "marketSellLimitSize": "99999",
        //         "marketFallbackPriceRatio": "0",
        //         "enableTrade": true,
        //         "enableDisplay": true,
        //         "displayDigitMerge": "0.01,0.1,0.5,1,5",
        //         "displayNew": false,
        //         "displayHot": false
        //     }
        //
        // contract
        //     {
        //         "symbol": "ETHUSDT",
        //         "baseAsset": "ETH",
        //         "quoteAsset": "USDT",
        //         "marginAsset": "USDT",
        //         "pricePrecision": "2",
        //         "quantityPrecision": "3",
        //         "baseAssetPrecision": "2",
        //         "quotePrecision": "8",
        //         "contractVal": "0.001",
        //         "delivery": [
        //             "00:00:00",
        //             "08:00:00",
        //             "16:00:00"
        //         ],
        //         "forwardContractFlag": true,
        //         "minLeverage": "1",
        //         "maxLeverage": "400",
        //         "buyLimitPriceRatio": "0.01",
        //         "sellLimitPriceRatio": "0.01",
        //         "makerFeeRate": "0.0002",
        //         "takerFeeRate": "0.0008",
        //         "minOrderSize": "0.001",
        //         "maxOrderSize": "1000000",
        //         "maxPositionSize": "5000000",
        //         "marketOpenLimitSize": "2300"
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const settleId = this.safeString (market, 'marginAsset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let active = true;
        let symbol = base + '/' + quote;
        let isSpot = true;
        let isLinear = undefined;
        let isInverse = undefined;
        if (settle !== undefined) {
            symbol += ':' + settle;
            isSpot = false;
            if (settle === quote) {
                isLinear = true;
                isInverse = false;
            } else if (settle === base) {
                isLinear = false;
                isInverse = true;
            }
        } else {
            active = this.safeBool (market, 'enableTrade');
        }
        let amountPrecision = this.safeNumber (market, 'stepSize');
        let pricePrecision = this.safeNumber (market, 'tickSize');
        if (amountPrecision === undefined) {
            const amountPrecisionString = this.parsePrecision (this.safeString (market, 'quantityPrecision'));
            const pricePrecisionString = this.parsePrecision (this.safeString (market, 'pricePrecision'));
            amountPrecision = this.parseNumber (amountPrecisionString);
            pricePrecision = this.parseNumber (pricePrecisionString);
        }
        const fees = this.safeDict (this.fees, isSpot ? 'spot' : 'contract', {});
        return this.safeMarketStructure ({
            'id': id,
            'lowercaseId': id.toLowerCase (),
            'numericId': this.safeInteger (market, 'contractId'),
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': isSpot ? 'spot' : 'swap',
            'spot': isSpot,
            'margin': false,
            'swap': !isSpot,
            'future': false,
            'option': false,
            'active': active,
            'contract': !isSpot,
            'linear': isLinear,
            'inverse': isInverse,
            'taker': this.safeNumber (market, 'takerFeeRate'),
            'maker': this.safeNumber (market, 'makerFeeRate'),
            'feeSide': fees['feeSide'],
            'contractSize': this.safeNumber (market, 'contractVal'),
            'expiry': undefined,
            'expiryDatetime': undefined,
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
                    'min': this.safeNumber2 (market, 'minTradeAmount', 'minOrderSize'),
                    'max': this.safeNumber2 (market, 'maxTradeAmount', 'maxOrderSize'),
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
            'created': undefined,
            'percentage': fees['percentage'],
            'tierBased': fees['tierBased'],
            'tiers': fees['tiers'],
            'info': market,
        });
    }

    /**
     * @method
     * @name weex#fetchTickers
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetAllTickerInfo // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetTicker24h // contract
     * @param {string} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot' (used if symbols are not provided)
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true);
        const market = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let symbolsLength = 0;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
        }
        const request: Dict = {};
        if (symbolsLength === 1) {
            request['symbol'] = market['id'];
        }
        let response = undefined;
        if (marketType === 'spot') {
            //
            //     [
            //         {
            //             "symbol": "ETHUSDT",
            //             "priceChange": "-72.98",
            //             "priceChangePercent": "-0.033811",
            //             "lastPrice": "2085.46",
            //             "bidPrice": "2085.44",
            //             "bidQty": "1.53848",
            //             "askPrice": "2085.47",
            //             "askQty": "1.87504",
            //             "openPrice": "2158.44",
            //             "highPrice": "2168.40",
            //             "lowPrice": "2061.12",
            //             "volume": "157359.56105",
            //             "quoteVolume": "331284305.7193626",
            //             "openTime": 1775493000000,
            //             "closeTime": 1775579400000,
            //             "count": 59727
            //         }
            //     ]
            //
            response = await this.publicGetApiV3MarketTicker24hr (this.extend (request, params));
        } else {
            //
            //     [
            //         {
            //             "symbol": "ETHUSDT",
            //             "priceChange": "-75.49",
            //             "priceChangePercent": "-0.034992",
            //             "lastPrice": "2081.80",
            //             "openPrice": "2157.29",
            //             "highPrice": "2167.51",
            //             "lowPrice": "2059.17",
            //             "volume": "623160.426",
            //             "quoteVolume": "1310647345.19346",
            //             "openTime": 1775493000000,
            //             "closeTime": 1775579400000,
            //             "markPrice": "2081.8",
            //             "indexPrice": "2082.75"
            //         }
            //     ]
            //
            response = await this.contractGetCapiV3MarketTicker24hr (this.extend (request, params));
        }
        if (!Array.isArray (response)) {
            response = [ response ];
        }
        return this.parseTickers (response, symbols);
    }

    /**
     * @method
     * @name weex#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetBookTicker // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetBookTicker // contract
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot' (used if symbols are not provided)
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchBidsAsks (symbols: Strings = undefined, params = {}) {
        symbols = this.marketSymbols (symbols, undefined, true, true);
        const market = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.publicGetApiV3MarketTickerBookTicker (params);
        } else {
            response = await this.contractGetCapiV3MarketTickerBookTicker (params);
        }
        if (!Array.isArray (response)) {
            response = [ response ];
        }
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // spot
        //     {
        //         "symbol": "ETHUSDT",
        //         "priceChange": "-72.98",
        //         "priceChangePercent": "-0.033811",
        //         "lastPrice": "2085.46",
        //         "bidPrice": "2085.44",
        //         "bidQty": "1.53848",
        //         "askPrice": "2085.47",
        //         "askQty": "1.87504",
        //         "openPrice": "2158.44",
        //         "highPrice": "2168.40",
        //         "lowPrice": "2061.12",
        //         "volume": "157359.56105",
        //         "quoteVolume": "331284305.7193626",
        //         "openTime": 1775493000000,
        //         "closeTime": 1775579400000,
        //         "count": 59727
        //     }
        //
        // swap
        //     {
        //         "symbol": "ETHUSDT",
        //         "priceChange": "-75.49",
        //         "priceChangePercent": "-0.034992",
        //         "lastPrice": "2081.80",
        //         "openPrice": "2157.29",
        //         "highPrice": "2167.51",
        //         "lowPrice": "2059.17",
        //         "volume": "623160.426",
        //         "quoteVolume": "1310647345.19346",
        //         "openTime": 1775493000000,
        //         "closeTime": 1775579400000,
        //         "markPrice": "2081.8",
        //         "indexPrice": "2082.75"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const markPrice = this.safeString (ticker, 'markPrice');
        let marketType = 'spot';
        if (markPrice !== undefined) {
            marketType = 'swap';
        }
        market = this.safeMarket (marketId, market, undefined, marketType);
        const timestamp = this.safeInteger2 (ticker, 'closeTime', 'time');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': this.safeString (ticker, 'bidPrice'),
            'bidVolume': this.safeString (ticker, 'bidQty'),
            'ask': this.safeString (ticker, 'askPrice'),
            'askVolume': this.safeString (ticker, 'askQty'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'openPrice'),
            'close': this.safeString (ticker, 'lastPrice'),
            'last': this.safeString (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'markPrice': markPrice,
            'indexPrice': this.safeString (ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name weex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetDepthData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetDepthData // contract
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 15, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if ((limit !== undefined) && (limit > 15)) {
            request['limit'] = 200; // default is 15, max is 200
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetApiV3MarketDepth (this.extend (request, params));
        } else {
            response = await this.contractGetCapiV3MarketDepth (this.extend (request, params));
        }
        //
        //     {
        //         "asks": [
        //             [
        //                 "2096.77",
        //                 "45.592"
        //             ]
        //         ],
        //         "bids": [
        //             [
        //                 "2096.76",
        //                 "49.162"
        //             ]
        //         ],
        //         "lastUpdateId": 14138610208
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    /**
     * @method
     * @name weex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100, max 300)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * Check fetchSpotOHLCV() and fetchContractOHLCV() for more details on the extra parameters that can be used in params
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.fetchSpotOHLCV (symbol, timeframe, since, limit, params);
        } else {
            return await this.fetchContractOHLCV (symbol, timeframe, since, limit, params);
        }
    }

    /**
     * @method
     * @ignore
     * @name weex#fetchSpotOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchSpotOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const response = await this.publicGetApiV3MarketKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @method
     * @ignore
     * @name weex#fetchContractOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100, max 100 for historical klines, max 1000 for other contract klines)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] whether to automatically paginate requests until the required number of candles is returned
     * @param {boolean} [params.historical] whether to fetch historical klines (default is false). If false, will fetch last price klines
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchContractOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const maxHistoricalLimit = 100;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            params = this.extend (params, { 'historical': true });
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxHistoricalLimit) as OHLCV[];
        }
        const until = this.safeInteger (params, 'until');
        let historical = false;
        [ historical, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'historical');
        const timeframeOption = this.safeDict (this.options, 'timeframes', {});
        const contractTimeframes = this.safeDict (timeframeOption, 'contract', {});
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (contractTimeframes, timeframe, timeframe),
        };
        const priceType = this.safeStringUpper (params, 'price');
        params = this.omit (params, [ 'historical', 'until', 'price' ]);
        let response = undefined;
        if (historical) {
            if (priceType !== undefined) {
                request['priceType'] = priceType;
            }
            let startTime = since;
            let endTime = until;
            if ((since === undefined) || (until === undefined)) {
                const now = this.milliseconds ();
                const duration = this.parseTimeframe (timeframe) * 1000;
                const numberOfCandles = limit ? limit : maxHistoricalLimit;
                const timeDelta = numberOfCandles * duration;
                if ((since === undefined) && (until === undefined)) {
                    endTime = now;
                    startTime = now - timeDelta;
                } else if (since === undefined) {
                    startTime = until - timeDelta;
                } else {
                    endTime = since + timeDelta;
                }
            }
            request['startTime'] = startTime;
            request['endTime'] = endTime;
            response = await this.contractGetCapiV3MarketHistoryKlines (this.extend (request, params));
        } else {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (priceType === 'MARK') {
                response = await this.contractGetCapiV3MarketMarkPriceKlines (this.extend (request, params));
            } else if (priceType === 'INDEX') {
                response = await this.contractGetCapiV3MarketIndexPriceKlines (this.extend (request, params));
            } else {
                response = await this.contractGetCapiV3MarketKlines (this.extend (request, params));
            }
        }
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name weex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetTradeData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetRecentTrades // contract
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetApiV3MarketTrades (this.extend (request, params));
        } else {
            response = await this.contractGetCapiV3MarketTrades (this.extend (request, params));
        }
        //
        //     [
        //         {
        //             "id": "875fba11-f8a1-42ad-915d-012ccb375e8a",
        //             "price": "2114.77",
        //             "qty": "0.01000",
        //             "quoteQty": "21.1477000",
        //             "time": 1775594995485,
        //             "isBuyerMaker": false,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     {
        //         "id": "875fba11-f8a1-42ad-915d-012ccb375e8a",
        //         "price": "2114.77",
        //         "qty": "0.01000",
        //         "quoteQty": "21.1477000",
        //         "time": 1775594995485,
        //         "isBuyerMaker": false,
        //         "isBestMatch": true
        //     }
        //
        // fetchMyTrades (spot)
        //     {
        //         "symbol": "DOGEUSDT",
        //         "id": 736825748291060702,
        //         "orderId": 736825748215563230,
        //         "price": "0.09349",
        //         "qty": "250.0",
        //         "quoteQty": "23.3725",
        //         "commission": "0.0233725",
        //         "time": 1775672947953,
        //         "isBuyer": false
        //     }
        //
        // fetchMyTrades (contract)
        //     {
        //         "id": 737074389731770728,
        //         "orderId": 737074043320009064,
        //         "symbol": "DOGEUSDT",
        //         "buyer": true,
        //         "commission": "0.00183500",
        //         "commissionAsset": "USDT",
        //         "maker": true,
        //         "price": "0.09175",
        //         "qty": "100",
        //         "quoteQty": "9.17500",
        //         "realizedPnl": "0",
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "time": 1775732228692
        //     }
        //
        const timestamp = this.safeInteger (trade, 'time');
        const isBuyer = this.safeBool (trade, 'isBuyer');
        let side = this.safeStringLower (trade, 'side');
        if (isBuyer !== undefined) {
            side = isBuyer ? 'buy' : 'sell';
        }
        let isSpot = true;
        if (market === undefined) {
            const marketId = this.safeString (trade, 'symbol');
            const realizedPnl = this.safeString (trade, 'realizedPnl');
            const marketType = (realizedPnl !== undefined) ? 'swap' : 'spot';
            market = this.safeMarket (marketId, undefined, undefined, marketType);
            isSpot = marketType === 'spot';
        } else {
            isSpot = market['spot'];
        }
        let fee = undefined;
        const commission = this.safeString (trade, 'commission');
        if (commission !== undefined) {
            const commissionAsset = this.safeString (trade, 'commissionAsset');
            let feeCurrency = this.safeCurrencyCode (commissionAsset);
            if (isSpot) {
                if (side === 'buy') {
                    feeCurrency = market['base'];
                } else {
                    feeCurrency = market['quote'];
                }
            }
            fee = {
                'cost': commission,
                'currency': feeCurrency,
            };
        }
        const isMaker = this.safeBool (trade, 'maker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'qty'),
            'cost': this.safeString (trade, 'quoteQty'),
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name weex#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://www.weex.com/api-doc/contract/Market_API/GetOpenInterest
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterest (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.contractGetCapiV3MarketOpenInterest (this.extend (request, params));
        return this.parseOpenInterest (response, market);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "openInterest": "1772356.352",
        //         "time": 1775595582598
        //     }
        //
        const marketId = this.safeString (interest, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger (interest, 'time');
        return this.safeOpenInterest ({
            'symbol': symbol,
            'openInterestAmount': this.safeString (interest, 'openInterest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name weex#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://www.weex.com/api-doc/contract/Market_API/GetCurrentFundingRate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let symbolsLength = 0;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
        }
        const request: Dict = {};
        if (symbolsLength === 1) {
            const market = this.getMarketFromSymbols (symbols);
            request['symbol'] = market['id'];
        }
        const response = await this.contractGetCapiV3MarketPremiumIndex (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT",
        //             "markPrice": "2133.71",
        //             "indexPrice": "2134.44",
        //             "forecastFundingRate": "0.00005618",
        //             "lastFundingRate": "0.00001031",
        //             "interestRate": "0.001",
        //             "nextFundingTime": 1775606400000,
        //             "time": 1775597594265,
        //             "collectCycle": 480
        //         }
        //     ]
        //
        return this.parseFundingRates (response, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger (contract, 'time');
        const nextFundingTimestamp = this.safeInteger (contract, 'nextFundingTime');
        let interval = undefined;
        const collectCycle = this.safeString (contract, 'collectCycle');
        if (collectCycle !== undefined) {
            interval = Precise.stringDiv (collectCycle, '60');
            interval = interval + 'h';
        }
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': this.safeNumber (contract, 'interestRate'),
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'lastFundingRate'),
            'fundingTimestamp': timestamp,
            'fundingDatetime': this.iso8601 (timestamp),
            'nextFundingRate': this.safeNumber (contract, 'forecastFundingRate'),
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': interval,
        } as FundingRate;
    }

    /**
     * @method
     * @name weex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.weex.com/api-doc/contract/Market_API/GetFundingRateHistory
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate records to fetch (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.contractGetCapiV3MarketFundingRate (this.extend (request, params));
        return this.parseFundingRateHistories (response, market, since, limit) as FundingRateHistory[];
    }

    parseFundingRateHistory (contract, market: Market = undefined) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "fundingRate": "0.00001031",
        //         "fundingTime": 1775577600000,
        //         "markPrice": "2079.26"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger (contract, 'fundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name weex#fetchBalance
     * @see https://www.weex.com/api-doc/spot/AccountAPI/GetAccountBalance // spot
     * @see https://www.weex.com/api-doc/contract/Account_API/GetAccountBalance // contract
     * @description query for balance and get the amount of funds available for trading or funds locked in positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        let response = undefined;
        if (type === 'spot') {
            //
            //     {
            //         "makerCommission": 0,
            //         "takerCommission": 0,
            //         "commissionRates": {
            //             "maker": "0.00000000",
            //             "taker": "0.00000000"
            //         },
            //         "canTrade": true,
            //         "canWithdraw": true,
            //         "canDeposit": true,
            //         "updateTime": 1775601317093,
            //         "accountType": "SPOT",
            //         "balances": [
            //             {
            //                 "asset": "USDT",
            //                 "free": "20.00000000",
            //                 "locked": "0"
            //             }
            //         ],
            //         "permissions": [
            //             "SPOT"
            //         ],
            //         "uid": 8886281669
            //     }
            //
            response = await this.privateGetApiV3Account (params);
        } else {
            //
            //     [
            //         {
            //             "asset": "USDT",
            //             "balance": "20.00000000",
            //             "availableBalance": "20.00000000",
            //             "frozen": "0",
            //             "unrealizePnl": "0"
            //         }
            //     ]
            //
            response = await this.contractPrivateGetCapiV3AccountBalance (params);
        }
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        const balances = this.safeList (response, 'balances', response);
        for (let i = 0; i < balances.length; i++) {
            const entry = this.safeDict (balances, i);
            const id = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (id);
            const account = this.account ();
            account['free'] = this.safeString2 (entry, 'availableBalance', 'free');
            account['used'] = this.safeString2 (entry, 'frozen', 'locked');
            account['total'] = this.safeString (entry, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name weex#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.weex.com/api-doc/spot/AccountAPI/TransferRecords
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const maxLimit = 100;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTransfers', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchTransfers', code, since, limit, params, maxLimit);
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('before', request, params);
        const response = await this.privateGetApiV3AccountTransferRecords (this.extend (request, params));
        //
        //     [
        //         {
        //             "coinName": "USDT",
        //             "status": "Successful",
        //             "toType": "",
        //             "toSymbol": "",
        //             "fromType": "",
        //             "fromSymbol": "",
        //             "amount": "20.00000000",
        //             "tradeTime": "1775605824252"
        //         }
        //     ]
        //
        return this.parseTransfers (response, currency, since, limit);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        const timestamp = this.safeInteger (transfer, 'tradeTime');
        const currencyId = this.safeString (transfer, 'coinName');
        const currencyCode = this.safeCurrencyCode (currencyId, currency);
        const status = this.safeString (transfer, 'status');
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': currencyCode,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': this.safeStringLower (transfer, 'fromType'),
            'toAccount': this.safeStringLower (transfer, 'toType'),
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status: Str): string {
        const statuses: Dict = {
            'Successful': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name weex#createOrder
     * @description Create an order on the exchange
     * @see https://www.weex.com/api-doc/spot/orderApi/PlaceOrder // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder // contract
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder // contract trigger
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlaceTpSlOrder // contract take profit / stop loss
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * Check createSpotOrder() and createContractOrder() for more details on the extra parameters that can be used in params
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['contract']) {
            return await this.createContractOrder (symbol, type, side, amount, price, params);
        } else {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        }
    }

    /**
     * @method
     * @name weex#createSpotOrder
     * @description helper method for creating spot orders
     * @see https://www.weex.com/api-doc/spot/orderApi/PlaceOrder
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @param {string} [params.timeInForce] 'GTC', 'IOC', or 'FOK'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createSpotOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createSpotOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.privatePostApiV3Order (request);
        //
        //     {
        //         "symbol": "DOGEUSDT",
        //         "orderId": 736557215397183592,
        //         "clientOrderId": "c4551206d34641efbeb64abaa066946d",
        //         "transactTime": 1775608924724
        //     }
        //
        return this.parseOrder (response, market);
    }

    createSpotOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Dict {
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            const partner = this.safeString (params, 'partner', 'b-WEEX111125');
            clientOrderId = partner + '-' + this.uuid22 ();
        }
        request['newClientOrderId'] = clientOrderId;
        // timeInForce is passed directly from params
        return this.extend (request, params);
    }

    /**
     * @method
     * @name weex#createContractOrder
     * @description helper method for creating contract orders
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder
     * @see https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
     * @param {float} [params.takeProfit.triggerPrice] The price at which the take profit order will be triggered
     * @param {string} [params.takeProfit.triggerPriceType] The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last')
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
     * @param {float} [params.stopLoss.triggerPrice] The price at which the stop loss order will be triggered
     * @param {string} [params.stopLoss.triggerPriceType] The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last')
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {string} [params.stopLossPriceType] The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last')
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {string} [params.takeProfitPriceType] The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last')
     * @param {bool} [params.reduceOnly] A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
     * @param {string} [params.timeInForce] GTC, IOC, or FOK (default is GTC for limit orders)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createContractOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createContractOrderRequest (symbol, type, side, amount, price, params);
        const triggerPrice = this.safeString (request, 'triggerPrice');
        let response = undefined;
        if (triggerPrice !== undefined) {
            response = await this.contractPrivatePostCapiV3AlgoOrder (request);
        } else {
            response = await this.contractPrivatePostCapiV3Order (request);
        }
        return this.parseOrder (response, market);
    }

    createContractOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type.toUpperCase (),
        };
        const isMarketOrder = (type === 'market');
        if (!isMarketOrder) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const [ triggerPrice, stopLossPrice, takeProfitPrice, query ] = this.handleTriggerPricesAndParams (symbol, params);
        if (triggerPrice !== undefined) {
            throw new NotSupported (this.id + ' createOrder() does not support the triggerPrice parameter');
        }
        const isStopLoss = (stopLossPrice !== undefined);
        const isTakeProfit = (takeProfitPrice !== undefined);
        let reduceOnly = this.safeBool (query, 'reduceOnly');
        if (isStopLoss || isTakeProfit) {
            reduceOnly = true;
        }
        const isReduceOnly = (reduceOnly === true);
        let positionSide = 'LONG';
        if (isReduceOnly) {
            if (side === 'buy') {
                positionSide = 'SHORT';
            }
        } else if (side === 'sell') {
            positionSide = 'SHORT';
        }
        request['positionSide'] = positionSide;
        const takeProfit = this.safeDict (params, 'takeProfit');
        const hasTakeProfit = (takeProfit !== undefined);
        const stopLoss = this.safeDict (params, 'stopLoss');
        const hasStopLoss = (stopLoss !== undefined);
        const timeInForce = this.safeString (params, 'timeInForce');
        let clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            const partner = this.safeString (params, 'partner', 'b-WEEX111125');
            clientOrderId = partner + '-' + this.uuid22 ();
        }
        const callerMethodName = this.safeString (params, 'callerMethodName');
        if (isStopLoss || isTakeProfit) {
            if (callerMethodName === 'createOrders') {
                throw new NotSupported (this.id + ' createOrders() does not support stop loss and take profit orders');
            }
            if (timeInForce !== undefined) {
                throw new BadRequest (this.id + ' createOrder() cannot use timeInForce parameter with stopLoss and takeProfit orders');
            }
            if (hasStopLoss || hasTakeProfit) {
                throw new BadRequest (this.id + ' createOrder() cannot use both stopLossPrice/takeProfitPrice parameters and stopLoss/takeProfit objects in params at the same time');
            }
            if (isStopLoss && isTakeProfit) {
                throw new BadRequest (this.id + ' createOrder() cannot use both stopLossPrice and takeProfitPrice parameters at the same time');
            }
            request['clientAlgoId'] = clientOrderId;
            let orderType = undefined;
            if (isStopLoss) {
                const stopLossPriceType = this.safeString2 (params, 'stopLossPriceType', 'triggerPriceType');
                if (stopLossPriceType !== undefined) {
                    params['SlWorkingType'] = this.encodeTriggerPriceType (stopLossPriceType);
                }
                params['triggerPrice'] = this.priceToPrecision (symbol, stopLossPrice);
                if (isMarketOrder) {
                    orderType = 'STOP_MARKET';
                } else {
                    orderType = 'STOP';
                }
            } else if (isTakeProfit) {
                const takeProfitPriceType = this.safeString2 (params, 'takeProfitPriceType', 'triggerPriceType');
                if (takeProfitPriceType !== undefined) {
                    params['TpWorkingType'] = this.encodeTriggerPriceType (takeProfitPriceType);
                }
                params['triggerPrice'] = this.priceToPrecision (symbol, takeProfitPrice);
                if (isMarketOrder) {
                    orderType = 'TAKE_PROFIT_MARKET';
                } else {
                    orderType = 'TAKE_PROFIT';
                }
            }
            params['type'] = orderType;
        } else {
            if (!isMarketOrder && timeInForce === undefined) {
                request['timeInForce'] = 'GTC';
            }
            request['newClientOrderId'] = clientOrderId;
            if (hasStopLoss) {
                const stopLossTriggerPrice = this.safeNumber (stopLoss, 'triggerPrice');
                request['slTriggerPrice'] = this.priceToPrecision (symbol, stopLossTriggerPrice);
                const stopLossPriceType = this.safeString (stopLoss, 'triggerPriceType');
                if (stopLossPriceType !== undefined) {
                    params['SlWorkingType'] = this.encodeTriggerPriceType (stopLossPriceType);
                }
            }
            if (hasTakeProfit) {
                const takeProfitTriggerPrice = this.safeNumber (takeProfit, 'triggerPrice');
                request['tpTriggerPrice'] = this.priceToPrecision (symbol, takeProfitTriggerPrice);
                const takeProfitPriceType = this.safeString (takeProfit, 'triggerPriceType');
                if (takeProfitPriceType !== undefined) {
                    params['TpWorkingType'] = this.encodeTriggerPriceType (takeProfitPriceType);
                }
            }
        }
        params = this.omit (params, [ 'takeProfit', 'stopLoss', 'stopLossPrice', 'takeProfitPrice', 'triggerPriceType', 'stopLossPriceType', 'takeProfitPriceType', 'clientOrderId', 'callerMethodName' ]);
        return this.extend (request, params);
    }

    encodeTriggerPriceType (triggerPriceType: Str) {
        const types: Dict = {
            'mark': 'MARK_PRICE',
            'last': 'CONTRACT_PRICE',
        };
        return this.safeString (types, triggerPriceType, triggerPriceType);
    }

    /**
     * @method
     * @name weex#cancelOrder
     * @description cancels an open order
     * @see https://www.weex.com/api-doc/spot/orderApi/CancelOrder // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/CancelOrder // contract
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot')
     * @param {boolean} [params.trigger] *contract orders only* whether the order to cancel is a trigger order
     * @param {string} [params.clientOrderId] *non-trigger orders only* a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const trigger = this.safeBool (params, 'trigger', false);
        if (trigger && id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an id argument for trigger orders');
        }
        const request: Dict = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, [ 'clientOrderId', 'trigger' ]);
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an id argument or clientOrderId parameter');
        } else {
            request['orderId'] = id;
        }
        let response = undefined;
        if (type === 'spot') {
            // by orderId
            //     {
            //         "orderId": 736775987680772200,
            //         "status": "CANCELED"
            //     }
            //
            // by clientOrderId
            //     {
            //         "origClientOrderId": "test_cancel_order",
            //         "status": "CANCELED"
            //     }
            //
            response = await this.privateDeleteApiV3Order (this.extend (request, params));
        } else if (trigger) {
            response = await this.contractPrivateDeleteCapiV3AlgoOrder (this.extend (request, params));
        } else {
            response = await this.contractPrivateDeleteCapiV3Order (this.extend (request, params));
        }
        const order = this.parseOrder (response, market);
        order['status'] = 'canceled';
        return order;
    }

    /**
     * @method
     * @name weex#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.weex.com/api-doc/spot/orderApi/Cancel-Symbol-Orders // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/CancelAllOrders // contract
     * @see https://www.weex.com/api-doc/contract/Transaction_API/CancelAllPendingOrders // contract trigger
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {boolean} [params.trigger] *swap only* true for cancelling trigger orders (default is false)
     * @returns Response from the exchange
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        const trigger = this.safeBool (params, 'trigger', false);
        params = this.omit (params, 'trigger');
        let response = undefined;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument for spot markets');
            }
            response = await this.privateDeleteApiV3OpenOrders (this.extend (request, params));
        } else if (trigger) {
            response = await this.contractPrivateDeleteCapiV3AlgoOpenOrders (this.extend (request, params));
        } else {
            response = await this.contractPrivateDeleteCapiV3AllOpenOrders (this.extend (request, params));
        }
        const extendedParams: Dict = {
            'status': 'canceled',
        };
        return this.parseOrders (response, market, undefined, undefined, extendedParams);
    }

    /**
     * @method
     * @name weex#cancelOrders
     * @description cancel multiple orders
     * @see https://www.weex.com/api-doc/spot/orderApi/BulkCancel // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/CancelOrdersBatch // contract
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids (could be an alternative to ids)
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrders', market, params);
        const isSpot = (marketType === 'spot');
        const clientOrderIds = this.safeList (params, 'clientOrderIds');
        params = this.omit (params, 'clientOrderIds');
        if (clientOrderIds !== undefined) {
            if (isSpot) {
                request['origClientOrderIds'] = clientOrderIds;
            } else {
                request['origClientOrderIdList'] = clientOrderIds;
            }
        } else if (ids !== undefined) {
            if (isSpot) {
                request['orderIds'] = ids;
            } else {
                request['orderIdList'] = ids;
            }
        } else {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires an ids argument or clientOrderIds parameter');
        }
        let response = undefined;
        if (isSpot) {
            response = await this.privateDeleteApiV3OrderBatch (this.extend (request, params));
        } else {
            response = await this.contractPrivateDeleteCapiV3BatchOrders (this.extend (request, params));
        }
        const ordersResponse = this.safeList (response, 'orderList', []);
        const extendedParams: Dict = {
            'status': 'canceled',
        };
        return this.parseOrders (ordersResponse, market, undefined, undefined, extendedParams);
    }

    /**
     * @method
     * @name weex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.weex.com/api-doc/spot/orderApi/OrderDetails // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetSingleOrderInfo // contract
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {string} [params.clientOrderId] *spot only* a unique id for the order, used if id is not provided
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const isSpot = (marketType === 'spot');
        const request: Dict = {};
        if ((id === undefined) && !isSpot) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires an id argument for non-spot markets');
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires an id argument or clientOrderId parameter for spot markets');
        } else {
            request['orderId'] = id;
        }
        let response = undefined;
        if (isSpot) {
            //
            //     {
            //         "symbol": "DOGEUSDT",
            //         "orderId": 736800333186991070,
            //         "clientOrderId": "082007092f624a18bb7af2ab42e7c8e8",
            //         "price": "0.08500",
            //         "origQty": "300.0",
            //         "executedQty": "0",
            //         "cummulativeQuoteQty": "0",
            //         "status": "NEW",
            //         "timeInForce": "GTC",
            //         "type": "LIMIT",
            //         "side": "BUY",
            //         "time": 1775666888520,
            //         "updateTime": 1775666888536,
            //         "isWorking": true
            //     }
            //
            response = await this.privateGetApiV3Order (this.extend (request, params));
        } else {
            response = await this.contractPrivateGetCapiV3Order (this.extend (request, params));
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name weex#fetchOpenOrders
     * @see https://www.weex.com/api-doc/spot/orderApi/UnfinishedOrders // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentOrderStatus // contract
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentPendingOrders // contract trigger
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {boolean} [params.trigger] *swap only* whether to fetch trigger orders (default is false)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const isSpot = (marketType === 'spot');
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'paginate', false);
        const maxLimit = 100;
        if (paginate) {
            if (isSpot) {
                throw new NotSupported (this.id + ' fetchOpenOrders() pagination is not supported for spot markets');
            }
            return await this.fetchPaginatedCallDynamic ('fetchOpenOrders', symbol, since, limit, params, maxLimit);
        }
        let request: Dict = {};
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        let response = undefined;
        if (isSpot) {
            //
            //     [
            //         {
            //             "symbol": "DOGEUSDT",
            //             "orderId": 736807745679786974,
            //             "clientOrderId": "e6dc41082bf342f580a19264d82dab31",
            //             "price": "0.12000",
            //             "origQty": "299.0",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "timeInForce": "GTC",
            //             "type": "LIMIT",
            //             "side": "SELL",
            //             "time": 1775668655796,
            //             "updateTime": 1775668655810,
            //             "isWorking": true
            //         }
            //     ]
            //
            response = await this.privateGetApiV3OpenOrders (this.extend (request, params));
        } else {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            [ request, params ] = this.handleUntilOption ('endTime', request, params);
            const trigger = this.safeBool (params, 'trigger', false);
            if (trigger) {
                params = this.omit (params, 'trigger');
                //
                //     [
                //         {
                //             "algoId": 737074389748547944,
                //             "clientAlgoId": "d574f517-cea5-433e-b029-415590d3bb80",
                //             "algoType": "CONDITIONAL",
                //             "orderType": "STOP_MARKET",
                //             "symbol": "DOGEUSDT",
                //             "side": "SELL",
                //             "positionSide": "LONG",
                //             "timeInForce": "IOC",
                //             "quantity": "100",
                //             "algoStatus": "UNTRIGGERED",
                //             "actualOrderId": 737074043320009064,
                //             "actualPrice": "0.00000",
                //             "triggerPrice": "0.02000",
                //             "price": "0.00000",
                //             "tpTriggerPrice": null,
                //             "tpPrice": null,
                //             "slTriggerPrice": null,
                //             "slPrice": null,
                //             "tpOrderType": null,
                //             "workingType": "CONTRACT_PRICE",
                //             "closePosition": false,
                //             "reduceOnly": true,
                //             "createTime": 1775732228695,
                //             "updateTime": 1775732228695,
                //             "triggerTime": 0
                //         }
                //     ]
                //
                response = await this.contractPrivateGetCapiV3OpenAlgoOrders (this.extend (request, params));
            } else {
                //
                //     [
                //         {
                //             "avgPrice": "0.00000",
                //             "clientOrderId": "857e1482-3225-44ce-bc0a-947714c5cabc",
                //             "cumQuote": "0",
                //             "executedQty": "0",
                //             "orderId": 737185556881998184,
                //             "origQty": "1400",
                //             "price": "0.05000",
                //             "reduceOnly": false,
                //             "side": "BUY",
                //             "positionSide": "LONG",
                //             "status": "NEW",
                //             "stopPrice": "0",
                //             "symbol": "DOGEUSDT",
                //             "time": 1775758733006,
                //             "timeInForce": "GTC",
                //             "type": "LIMIT",
                //             "updateTime": 1775758733006,
                //             "workingType": "UNKNOWN_PRICE_TYPE"
                //         }
                //     ]
                //
                response = await this.contractPrivateGetCapiV3OpenOrders (this.extend (request, params));
            }
        }
        const extendedParams: Dict = {
            'status': 'open',
        };
        return this.parseOrders (response, market, since, limit, extendedParams);
    }

    /**
     * @method
     * @name weex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        let orders = undefined;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument for spot markets');
            }
            orders = await this.fetchOrders (symbol, since, undefined, params);
        } else {
            orders = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        }
        return this.filterBy (orders, 'status', 'closed') as Order[];
    }

    /**
     * @method
     * @name weex#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchCanceledOrders', market, params);
        let orders = undefined;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchCanceledOrders() requires a symbol argument for spot markets');
            }
            orders = await this.fetchOrders (symbol, since, undefined, params);
        } else {
            orders = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        }
        return this.filterBy (orders, 'status', 'canceled') as Order[];
    }

    /**
     * @method
     * @name weex#fetchOrders
     * @description fetches information on multiple spot orders made by the user
     * @see https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
     * @param {string} symbol unified market symbol of the market orders were made in (required for spot orders)
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time, ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' fetchOrders() supports spot markets only');
        }
        const maxLimit = 1000;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchOrders', symbol, since, limit, params, maxLimit);
        }
        let request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, maxLimit);
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.privateGetApiV3AllOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "DOGEUSDT",
        //             "orderId": 736806838401500126,
        //             "clientOrderId": "e93fcb1423fc4b4982fd02eb3bc4955c",
        //             "price": "0.09365",
        //             "origQty": "300.0",
        //             "executedQty": "300.0",
        //             "cummulativeQuoteQty": "28.095",
        //             "status": "FILLED",
        //             "timeInForce": "IOC",
        //             "type": "MARKET",
        //             "side": "BUY",
        //             "time": 1775668439484,
        //             "updateTime": 1775668439498,
        //             "isWorking": false
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name weex#fetchCanceledAndClosedOrders
     * @description fetches information on multiple closed and canceled orders made by the user
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract
     * @param {string} [symbol] unified market symbol of the market orders were made in (required for spot orders)
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time, ms
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        if (marketType === 'spot') {
            throw new NotSupported (this.id + ' fetchCanceledAndClosedOrders() does not support spot markets. Use fetchOrders() instead and filter by status "canceled" or "closed"');
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate', false);
        const maxLimit = 1000;
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchOrders', symbol, since, limit, params, maxLimit);
        }
        let request: Dict = {};
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.contractPrivateGetCapiV3OrderHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "avgPrice": "0.00000",
        //             "clientOrderId": "7bd80776-0c3f-4ed9-ab9c-a616d66fac5e",
        //             "cumQuote": "0",
        //             "executedQty": "0",
        //             "orderId": 737074389744353640,
        //             "origQty": "100",
        //             "price": "0.00000",
        //             "reduceOnly": true,
        //             "side": "SELL",
        //             "positionSide": "LONG",
        //             "status": "CANCELED",
        //             "stopPrice": "1.00000",
        //             "symbol": "DOGEUSDT",
        //             "time": 1775732228695,
        //             "timeInForce": "IOC",
        //             "type": "TAKE_PROFIT_MARKET",
        //             "updateTime": 1775732228695,
        //             "workingType": "CONTRACT_PRICE"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder (spot)
        //     {
        //         "symbol": "DOGEUSDT",
        //         "orderId": 736557215397183592,
        //         "clientOrderId": "c4551206d34641efbeb64abaa066946d",
        //         "transactTime": 1775608924724
        //     }
        //
        // fetchOpenOrders / fetchOrders / fetchOrder (spot)
        //     {
        //         "symbol": "DOGEUSDT",
        //         "orderId": 736800333186991070,
        //         "clientOrderId": "082007092f624a18bb7af2ab42e7c8e8",
        //         "price": "0.08500",
        //         "origQty": "300.0",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "time": 1775666888520,
        //         "updateTime": 1775666888536,
        //         "isWorking": true
        //     }
        //
        // fetchOpenOrders (contract)
        //     {
        //         "avgPrice": "0.00000",
        //         "clientOrderId": "857e1482-3225-44ce-bc0a-947714c5cabc",
        //         "cumQuote": "0",
        //         "executedQty": "0",
        //         "orderId": 737185556881998184,
        //         "origQty": "1400",
        //         "price": "0.05000",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "status": "NEW",
        //         "stopPrice": "0",
        //         "symbol": "DOGEUSDT",
        //         "time": 1775758733006,
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "updateTime": 1775758733006,
        //         "workingType": "UNKNOWN_PRICE_TYPE"
        //     }
        //
        // fetchOpenOrders (contract-trigger)
        //     {
        //         "algoId": 737074389748547944,
        //         "clientAlgoId": "d574f517-cea5-433e-b029-415590d3bb80",
        //         "algoType": "CONDITIONAL",
        //         "orderType": "STOP_MARKET",
        //         "symbol": "DOGEUSDT",
        //         "side": "SELL",
        //         "positionSide": "LONG",
        //         "timeInForce": "IOC",
        //         "quantity": "100",
        //         "algoStatus": "UNTRIGGERED",
        //         "actualOrderId": 737074043320009064,
        //         "actualPrice": "0.00000",
        //         "triggerPrice": "0.02000",
        //         "price": "0.00000",
        //         "tpTriggerPrice": null,
        //         "tpPrice": null,
        //         "slTriggerPrice": null,
        //         "slPrice": null,
        //         "tpOrderType": null,
        //         "workingType": "CONTRACT_PRICE",
        //         "closePosition": false,
        //         "reduceOnly": true,
        //         "createTime": 1775732228695,
        //         "updateTime": 1775732228695,
        //         "triggerTime": 0
        //     }
        //
        // fetchCanceledAndClosedOrders (swap only)
        //     {
        //         "avgPrice": "0.00000",
        //         "clientOrderId": "7bd80776-0c3f-4ed9-ab9c-a616d66fac5e",
        //         "cumQuote": "0",
        //         "executedQty": "0",
        //         "orderId": 737074389744353640,
        //         "origQty": "100",
        //         "price": "0.00000",
        //         "reduceOnly": true,
        //         "side": "SELL",
        //         "positionSide": "LONG",
        //         "status": "CANCELED",
        //         "stopPrice": "1.00000",
        //         "symbol": "DOGEUSDT",
        //         "time": 1775732228695,
        //         "timeInForce": "IOC",
        //         "type": "TAKE_PROFIT_MARKET",
        //         "updateTime": 1775732228695,
        //         "workingType": "CONTRACT_PRICE"
        //     }
        //
        const errorCode = this.safeString (order, 'errorCode');
        const errorMessage = this.safeString (order, 'errorMsg');
        if ((errorCode !== undefined) || (errorMessage !== undefined)) {
            this.handleOrderOrPositionError (errorCode, errorMessage, order);
        }
        if (market === undefined) {
            const marketId = this.safeString (order, 'symbol');
            const positionSide = this.safeString (order, 'positionSide');
            const marketType = (positionSide === undefined) ? 'spot' : 'swap';
            market = this.safeMarket (marketId, undefined, undefined, marketType);
        }
        const timestamp = this.safeIntegerN (order, [ 'transactTime', 'time', 'createTime' ]);
        const rawStatus = this.safeStringLower (order, 'status');
        const triggerPrice = this.omitZero (this.safeString2 (order, 'triggerPrice', 'stopPrice'));
        const rawType = this.safeStringUpper2 (order, 'type', 'orderType');
        let takeProfitPrice = undefined;
        let stopLossPrice = undefined;
        if (rawType === 'TAKE_PROFIT_MARKET' || rawType === 'TAKE_PROFIT') {
            takeProfitPrice = triggerPrice;
        } else if (rawType === 'STOP_LOSS' || rawType === 'STOP' || rawType === 'STOP_MARKET') {
            stopLossPrice = triggerPrice;
        }
        return this.safeOrder ({
            'id': this.safeStringN (order, [ 'orderId', 'algoId', 'successOrderId' ]),
            'clientOrderId': this.safeStringN (order, [ 'clientOrderId', 'origClientOrderId', 'clientAlgoId' ]),
            'symbol': this.safeString (market, 'symbol'),
            'type': this.parseOrderType (rawType),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': this.safeStringLower (order, 'side'),
            'amount': this.safeString2 (order, 'origQty', 'quantity'),
            'price': this.safeString (order, 'price'),
            'triggerPrice': triggerPrice,
            'cost': this.safeString2 (order, 'cummulativeQuoteQty', 'cumQuote'),
            'filled': this.safeString (order, 'executedQty'),
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
            'status': this.parseOrderStatus (rawStatus),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger (order, 'updateTime'),
            'average': this.safeString (order, 'avgPrice'),
            'trades': undefined,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'new': 'open',
            'partial_fill': 'closed',
            'full_fill': 'closed',
            'filled': 'closed',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'rejected': 'rejected',
            'untriggered': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str) {
        const types: Dict = {
            'LIMIT': 'limit',
            'MARKET': 'market',
            'STOP_LOSS': 'limit',
            'STOP': 'limit',
            'TAKE_PROFIT': 'limit',
            'TAKE_PROFIT_MARKET': 'market',
            'STOP_MARKET': 'market',
        };
        return this.safeString (types, type, type);
    }

    handleOrderOrPositionError (errorCode: Str, errorMessage: Str, order: Dict) {
        if (errorCode === undefined) {
            errorCode = '';
        }
        if (errorMessage === undefined) {
            errorMessage = '';
        }
        if ((errorCode === '') && (errorMessage === '')) {
            // some endpoints could return an empty string if there is no error
            return;
        }
        const feedback = this.id + ' ' + this.json (order);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], errorCode, feedback);
        throw new InvalidOrder (feedback);
    }

    /**
     * @method
     * @name weex#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name weex#fetchMyTrades
     * @see https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
     * @see https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const isSpot = (marketType === 'spot');
        if (isSpot && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument for spot markets');
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate', false);
        const maxLimit = 100;
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params, maxLimit);
        }
        let request: Dict = {};
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        let response = undefined;
        if (isSpot) {
            //
            //     [
            //         {
            //             "symbol": "DOGEUSDT",
            //             "id": 736825748291060702,
            //             "orderId": 736825748215563230,
            //             "price": "0.09349",
            //             "qty": "250.0",
            //             "quoteQty": "23.3725",
            //             "commission": "0.0233725",
            //             "time": 1775672947953,
            //             "isBuyer": false
            //         }
            //     ]
            //
            response = await this.privateGetApiV3MyTrades (this.extend (request, params));
        } else {
            //
            //     [
            //         {
            //             "id": 737074389731770728,
            //             "orderId": 737074043320009064,
            //             "symbol": "DOGEUSDT",
            //             "buyer": true,
            //             "commission": "0.00183500",
            //             "commissionAsset": "USDT",
            //             "maker": true,
            //             "price": "0.09175",
            //             "qty": "100",
            //             "quoteQty": "9.17500",
            //             "realizedPnl": "0",
            //             "side": "BUY",
            //             "positionSide": "LONG",
            //             "time": 1775732228692
            //         }
            //     ]
            //
            response = await this.contractPrivateGetCapiV3UserTrades (this.extend (request, params));
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name weex#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.weex.com/api-doc/spot/AccountAPI/GetBillRecords // spot
     * @see https://www.weex.com/api-doc/spot/AccountAPI/GetFundBillRecords // funding
     * @see https://www.weex.com/api-doc/contract/Account_API/GetContractBills // contract
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined, max is 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {string} [params.type] 'spot', 'funding' or 'swap' (default is 'spot')
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate', false);
        const maxLimit = 100;
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchLedger', code, since, limit, params, maxLimit);
        }
        let accountType = undefined;
        [ accountType, params ] = this.handleMarketTypeAndParams ('fetchLedger', undefined, params);
        const accountsByType = this.safeDict (this.options, 'accountsByType', {});
        accountType = this.safeString (accountsByType, accountType, accountType);
        let request: Dict = {};
        let items = undefined;
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (accountType === 'contract') {
            if (code !== undefined) {
                request['currency'] = currency['id'];
            }
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            [ request, params ] = this.handleUntilOption ('endTime', request, params);
            const contractResponse = await this.contractPrivatePostCapiV3AccountIncome (this.extend (request, params));
            items = this.safeList (contractResponse, 'items', []);
        } else if (accountType === 'funding') {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['pageSize'] = limit;
            }
            [ request, params ] = this.handleUntilOption ('endTime', request, params);
            const fundingResponse = await this.privatePostApiV3AccountFundingBills (this.extend (request, params));
            items = this.safeList (fundingResponse, 'items', []);
        } else {
            if (since !== undefined) {
                request['after'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            [ request, params ] = this.handleUntilOption ('before', request, params);
            items = await this.privatePostApiV3AccountBills (this.extend (request, params));
        }
        return this.parseLedger (items, currency, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        //
        // spot
        //     {
        //         "billId": "736825748291061726",
        //         "coinId": 82,
        //         "coinName": "DOGE",
        //         "bizType": "trade_out",
        //         "fillSize": "250.0",
        //         "fillValue": "23.372500",
        //         "deltaAmount": "-250.0",
        //         "afterAmount": "49.70000000",
        //         "fees": "0",
        //         "cTime": "1775672947953"
        //     }
        //
        // contract
        //     {
        //         "billId": 736791763716407518,
        //         "asset": "USDT",
        //         "symbol": null,
        //         "income": "-90.00000000",
        //         "incomeType": "withdraw",
        //         "balance": "106.00000000",
        //         "fillFee": "0",
        //         "time": 1775664845399,
        //         "transferReason": "UNKNOWN_TRANSFER_REASON"
        //     }
        //
        // funding
        //     {
        //         "billId": "16502414",
        //         "coinId": 2,
        //         "coinName": "USDT",
        //         "bizType": "transfer_out",
        //         "fillSize": null,
        //         "fillValue": null,
        //         "deltaAmount": "-100.00000000",
        //         "afterAmount": "0.00000000",
        //         "fees": "0.00000000",
        //         "cTime": "1775664588931"
        //     }
        //
        const currencyId = this.safeString2 (item, 'coinName', 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        currency = this.safeCurrency (currencyId, currency);
        const timestamp = this.safeInteger2 (item, 'cTime', 'time');
        const amountRaw = this.safeString2 (item, 'deltaAmount', 'income');
        const after = this.safeString2 (item, 'afterAmount', 'balance');
        const before = Precise.stringSub (after, amountRaw);
        const amount = this.parseNumber (Precise.stringAbs (amountRaw));
        let direction = 'in';
        if (amountRaw.indexOf ('-') >= 0) {
            direction = 'out';
        }
        let rawType = this.safeString2 (item, 'bizType', 'incomeType');
        const transferReason = this.safeString (item, 'transferReason');
        const isContractEntry = (transferReason !== undefined);
        if (isContractEntry) {
            if ((rawType === 'withdraw') || (rawType === 'deposit')) {
                rawType = 'transfer';
            }
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
            'type': this.parseLedgerType (rawType),
            'currency': code,
            'amount': amount,
            'before': this.parseNumber (before),
            'after': this.parseNumber (after),
            'status': undefined,
            'fee': {
                'currency': code,
                'cost': this.safeNumber2 (item, 'fees', 'fillFee'),
            },
        }, currency) as LedgerEntry;
    }

    parseLedgerType (type: Str) {
        const types: Dict = {
            'transfer_in': 'transfer',
            'transfer_out': 'transfer',
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
            'trade_in': 'trade',
            'trade_out': 'trade',
            'position_open_long': 'trade',
            'position_open_short': 'trade',
            'position_close_long': 'trade',
            'position_close_short': 'trade',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name weex#fetchPositions
     * @description fetch all open positions
     * @see https://www.weex.com/api-doc/contract/Account_API/GetAllPositions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.contractPrivateGetCapiV3AccountPositionAllPosition (params);
        return this.parsePositions (response, symbols);
    }

    /**
     * @method
     * @name weex#fetchPosition
     * @description fetch data on an open position
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPosition (symbol: string, params = {}) {
        const positions = await this.fetchPositionsForSymbol (symbol, params);
        return this.safeDict (positions, 0) as Position;
    }

    /**
     * @method
     * @description fetch open positions for a single market
     * @name weex#fetchPositionsForSymbol
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.contractPrivateGetCapiV3AccountPositionSinglePosition (this.extend (request, params));
        return this.parsePositions (response, [ market['symbol'] ]);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //     {
        //         "id": 737191855967437160,
        //         "asset": "USDT",
        //         "symbol": "DOGEUSDT",
        //         "side": "LONG",
        //         "marginType": "CROSSED",
        //         "separatedMode": "COMBINED",
        //         "separatedOpenOrderId": 0,
        //         "leverage": "20.00",
        //         "size": "300",
        //         "openValue": "27.96900",
        //         "openFee": "0.02237520",
        //         "fundingFee": "0",
        //         "marginSize": "100",
        //         "isolatedMargin": "0",
        //         "isAutoAppendIsolatedMargin": false,
        //         "cumOpenSize": "300",
        //         "cumOpenValue": "27.96900",
        //         "cumOpenFee": "0.02237520",
        //         "cumCloseSize": "0",
        //         "cumCloseValue": "0",
        //         "cumCloseFee": "0",
        //         "cumFundingFee": "0",
        //         "cumLiquidateFee": "0",
        //         "createdMatchSequenceId": 5762536243,
        //         "updatedMatchSequenceId": 5762741613,
        //         "createdTime": 1775760234825,
        //         "updatedTime": 1775763170789,
        //         "unrealizePnl": "0.00600",
        //         "liquidatePrice": "0"
        //     }
        //
        // watchPoisions
        //     {
        //         "id": "739004481374519656",
        //         "coin": "USDT",
        //         "symbol": "DOGEUSDT",
        //         "side": "LONG",
        //         "marginMode": "CROSSED",
        //         "separatedMode": "COMBINED",
        //         "separatedOpenOrderId": "0",
        //         "leverage": "11",
        //         "size": "100",
        //         "openValue": "9.31100",
        //         "openFee": "0.00744880",
        //         "fundingFee": "0",
        //         "isolatedMargin": "0",
        //         "autoAppendIsolatedMargin": false,
        //         "cumOpenSize": "100",
        //         "cumOpenValue": "9.31100",
        //         "cumOpenFee": "0.00744880",
        //         "cumCloseSize": "0",
        //         "cumCloseValue": "0",
        //         "cumCloseFee": "0",
        //         "cumFundingFee": "0",
        //         "cumLiquidateFee": "0",
        //         "createdMatchSequenceId": "5792711540",
        //         "updatedMatchSequenceId": "5792711540",
        //         "createdTime": "1776192398399",
        //         "updatedTime": "1776192398399"
        //     }
        //
        const errorMessage = this.safeString (position, 'errorMsg');
        const errorCode = this.safeString (position, 'errorCode');
        if (errorMessage !== undefined) {
            this.handleOrderOrPositionError (errorCode, errorMessage, position);
        }
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'contract');
        const timestamp = this.safeInteger (position, 'createdTime');
        const marginType = this.safeString2 (position, 'marginType', 'marginMode');
        let marginMode = 'cross';
        if (marginType === 'ISOLATED') {
            marginMode = 'isolated';
        }
        const separatedMode = this.safeString (position, 'separatedMode');
        let hedged = undefined;
        if (separatedMode === 'COMBINED') {
            hedged = false;
        } else if (separatedMode === 'SEPARATED') {
            hedged = true;
        }
        return this.safePosition ({
            'symbol': market['symbol'],
            'id': this.safeString2 (position, 'id', 'positionId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'contracts': this.safeNumber (position, 'size'),
            'contractSize': undefined,
            'side': this.safeStringLower (position, 'side'),
            'notional': this.safeNumber (position, 'openValue'),
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': this.safeNumber (position, 'unrealizePnl'),
            'realizedPnl': undefined,
            'collateral': undefined,
            'entryPrice': undefined,
            'markPrice': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidatePrice'),
            'marginMode': marginMode,
            'hedged': hedged,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeNumber (position, 'marginSize'),
            'initialMarginPercentage': undefined,
            'marginRatio': undefined,
            'lastUpdateTimestamp': this.safeInteger (position, 'updatedTime'),
            'lastPrice': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'percentage': undefined,
            'info': undefined,
        });
    }

    /**
     * @method
     * @name weex#closeAllPositions
     * @description closes all open positions for a market type
     * @see https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} A list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async closeAllPositions (params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.contractPrivatePostCapiV3ClosePositions (params);
        //
        //     [
        //         {
        //             "positionId": 737191855967437160,
        //             "successOrderId": 737215340433375592,
        //             "errorMessage": "",
        //             "success": true
        //         }
        //     ]
        //
        return this.parsePositions (response);
    }

    /**
     * @method
     * @name weex#closePosition
     * @description closes open positions for a market
     * @see https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} [side] not used by current exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.contractPrivatePostCapiV3ClosePositions (this.extend (request, params));
        const orders = this.parseOrders (response, market);
        return this.safeDict (orders, 0) as Order;
    }

    /**
     * @method
     * @name weex#fetchTradingFee
     * @see https://www.weex.com/api-doc/contract/Account_API/GetCommissionRate // contract
     * @description fetch the trading fees for a contract market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            // spot markets return 0 for fees
            throw new NotSupported (this.id + ' fetchTradingFee() is not supported for spot markets');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.contractPrivateGetCapiV3AccountCommissionRate (this.extend (request, params));
        //
        //     {
        //         "symbol": "DOGEUSDT",
        //         "makerCommissionRate": "0.0002",
        //         "takerCommissionRate": "0.0008"
        //     }
        //
        return this.parseTradingFee (response, market);
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        //
        // contract
        //     {
        //         "symbol": "DOGEUSDT",
        //         "makerCommissionRate": "0.0002",
        //         "takerCommissionRate": "0.0008"
        //     }
        //
        const marketId = this.safeString (fee, 'symbol');
        return {
            'info': fee,
            'symbol': this.safeSymbol (marketId, market, undefined, 'contract'),
            'maker': this.safeNumber (fee, 'makerCommissionRate'),
            'taker': this.safeNumber (fee, 'takerCommissionRate'),
            'percentage': true,
            'tierBased': true,
        };
    }

    /**
     * @method
     * @name weex#fetchMarginMode
     * @description fetches the margin mode of a specific symbol
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.contractPrivateGetCapiV3AccountSymbolConfig (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "DOGEUSDT",
        //             "marginType": "CROSSED",
        //             "separatedType": "COMBINED",
        //             "crossLeverage": "20.00",
        //             "isolatedLongLeverage": "20.00",
        //             "isolatedShortLeverage": "20.00"
        //         }
        //     ]
        //
        const marginMode = this.safeDict (response, 0, {});
        return this.parseMarginMode (marginMode, market);
    }

    /**
     * @method
     * @name weex#fetchMarginModes
     * @description fetches margin modes the symbols, with symbols=undefined all markets are returned
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    async fetchMarginModes (symbols: Strings = undefined, params = {}): Promise<MarginModes> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.contractPrivateGetCapiV3AccountSymbolConfig (params);
        return this.parseMarginModes (response, symbols, 'symbol', 'swap');
    }

    parseMarginMode (marginMode: Dict, market = undefined): MarginMode {
        const marketId = this.safeString (marginMode, 'symbol');
        const marginType = this.safeString (marginMode, 'marginType');
        return {
            'info': marginMode,
            'symbol': this.safeSymbol (marketId, market, undefined, 'swap'),
            'marginMode': this.parseMarginType (marginType),
        } as MarginMode;
    }

    parseMarginType (marginType: Str) {
        const marginTypes: Dict = {
            'CROSSED': 'cross',
            'ISOLATED': 'isolated',
        };
        return this.safeString (marginTypes, marginType, marginType);
    }

    /**
     * @method
     * @name weex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE
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
        const request: Dict = {
            'symbol': market['id'],
            'marginType': this.encodeMarginMode (marginMode),
        };
        return await this.contractPrivatePostCapiV3AccountMarginType (this.extend (request, params));
    }

    encodeMarginMode (marginMode: Str) {
        const marginTypes: Dict = {
            'cross': 'CROSSED',
            'isolated': 'ISOLATED',
        };
        const result = this.safeString (marginTypes, marginMode);
        if (result === undefined) {
            throw new ArgumentsRequired (this.id + ' marginMode must be either cross or isolated');
        }
        return result;
    }

    /**
     * @method
     * @name weex#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.contractPrivateGetCapiV3AccountSymbolConfig (this.extend (request, params));
        const marginMode = this.safeDict (response, 0, {});
        return this.parseLeverage (marginMode, market);
    }

    /**
     * @method
     * @name weex#fetchLeverages
     * @description fetch the set leverage for all markets
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverages (symbols: Strings = undefined, params = {}): Promise<Leverages> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.contractPrivateGetCapiV3AccountSymbolConfig (params);
        return this.parseLeverages (response, symbols, 'symbol', 'swap');
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        const marginType = this.safeString (leverage, 'marginType');
        const marginMode = this.parseMarginType (marginType);
        const crossLeverage = this.safeNumber (leverage, 'crossLeverage');
        let longLeverage = this.safeNumber (leverage, 'isolatedLongLeverage');
        let shortLeverage = this.safeNumber (leverage, 'isolatedShortLeverage');
        if (marginMode === 'cross') {
            longLeverage = crossLeverage;
            shortLeverage = crossLeverage;
        }
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market, undefined, 'swap'),
            'marginMode': marginMode,
            'longLeverage': longLeverage,
            'shortLeverage': shortLeverage,
        } as Leverage;
    }

    /**
     * @method
     * @name weex#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.weex.com/api-doc/contract/Account_API/UpdateLeverageTRADE
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' (default is 'cross' if specific leverage parameters are not provided)
     * @param {number} [params.crossLeverage] *cross margin mode only* leverage for cross margin mode when marginMode is 'cross'
     * @param {number} [params.isolatedLongLeverage] *isolated margin mode only* leverage for long positions when marginMode is 'isolated'
     * @param {number} [params.isolatedShortLeverage] *isolated margin mode only* leverage for short positions when marginMode is 'isolated'
     * If specific leverage parameters are not provided
     * the leverage value will be applied to both long and short positions if marginMode is 'isolated'
     * or to cross margin mode if marginMode is 'cross'
     * If marginMode is not provided and specific leverage parameters are not provided too
     * the leverage value will be applied to cross leverage
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('setLeverage', params);
        if (marginMode !== undefined) {
            request['marginType'] = this.encodeMarginMode (marginMode);
        }
        const isolatedLongLeverage = this.safeNumber (params, 'isolatedLongLeverage');
        const isolatedShortLeverage = this.safeNumber (params, 'isolatedShortLeverage');
        const crossLeverage = this.safeNumber (params, 'crossLeverage');
        if ((isolatedLongLeverage === undefined) && (isolatedShortLeverage === undefined) && (crossLeverage === undefined)) {
            if (marginMode === 'isolated') {
                request['isolatedLongLeverage'] = leverage;
                request['isolatedShortLeverage'] = leverage;
            } else {
                request['crossLeverage'] = leverage;
            }
        }
        return await this.contractPrivatePostCapiV3AccountLeverage (this.extend (request, params));
    }

    /**
     * @method
     * @name weex#fetchPositionMode
     * @description fetchs the position mode, hedged or one way
     * @see https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.contractPrivateGetCapiV3AccountSymbolConfig (this.extend (request, params));
        const entry = this.safeDict (response, 0, {});
        const separatedType = this.safeString (entry, 'separatedType');
        return {
            'info': response,
            'hedged': (separatedType === 'SEPARATED'),
        };
    }

    /**
     * @method
     * @name weex#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.marginMode 'cross' or 'isolated' (default is 'cross')
     * @returns {object} response from the exchange
     */
    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setPositionMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('setPositionMode', params);
        if (marginMode === undefined) {
            throw new ArgumentsRequired (this.id + ' setPositionMode() also sets marginMode, so a marginMode parameter is required');
        }
        const separatedType = hedged ? 'SEPARATED' : 'COMBINED';
        const request: Dict = {
            'symbol': market['id'],
            'marginType': this.encodeMarginMode (marginMode),
            'separatedType': separatedType,
        };
        return await this.contractPrivatePostCapiV3AccountMarginType (this.extend (request, params));
    }

    async modifyMarginHelper (symbol: string, amount, type, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const isolatedPositionId = this.safeStringN (params, [ 'positionId', 'id', 'isolatedPositionId' ]);
        if (isolatedPositionId === undefined) {
            throw new ArgumentsRequired (this.id + ' modifyMarginHelper() requires a positionId parameter');
        }
        params = this.omit (params, [ 'positionId', 'id' ]);
        const market = this.market (symbol);
        const request: Dict = {
            'isolatedPositionId': isolatedPositionId,
            'amount': this.costToPrecision (symbol, amount),
            'type': type,
        };
        const parsedType = (type === 1) ? 'add' : 'reduce';
        const response = await this.contractPrivatePostCapiV3AccountPositionMargin (this.extend (request, params));
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': parsedType,
        });
    }

    parseMarginModification (data: Dict, market: Market = undefined): MarginModification {
        //
        //     {
        //         "code": "200",
        //         "msg": "success",
        //         "requestTime": 1764505776347
        //     }
        //
        const msg = this.safeString (data, 'msg');
        const status = (msg === 'success') ? 'ok' : 'failed';
        const timestamp = this.safeInteger (data, 'requestTime');
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': undefined,
            'marginMode': 'isolated',
            'amount': undefined,
            'total': undefined,
            'code': market['settle'],
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name weex#reduceMargin
     * @description remove margin from a position
     * @see https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.positionId the id of the position to reduce margin from, required
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.modifyMarginHelper (symbol, amount, 2, params);
    }

    /**
     * @method
     * @name weex#addMargin
     * @description add margin
     * @see https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.positionId the id of the position to add margin to, required
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.modifyMarginHelper (symbol, amount, 1, params);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const isBatch = (path.indexOf ('batch') >= 0);
        if (!isBatch && ((method === 'GET') || (method === 'DELETE'))) {
            if (Object.keys (query).length) {
                endpoint += '?' + this.urlencode (query);
            }
        }
        if ((api === 'private') || (api === 'contractPrivate')) {
            this.checkRequiredCredentials ();
            const timestamp = this.numberToString (this.nonce ());
            let payload = timestamp + method + '/' + endpoint;
            if ((method === 'POST') || isBatch) {
                body = this.json (query);
                payload += body;
            }
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'base64');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-PASSPHRASE': this.password,
                'ACCESS-TIMESTAMP': timestamp,
            };
            if ((method === 'POST') || (method === 'DELETE')) {
                headers['Content-Type'] = 'application/json';
            }
        } else {
            headers = {
                'User-Agent': 'ccxt',
            };
        }
        const url = this.urls['api'][api] + '/' + endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        //
        //     {
        //         "code": -1140,
        //         "msg": "Either orderId or origClientOrderId must be sent."
        //     }
        //
        const message = this.safeString (response, 'msg');
        if (message !== undefined) {
            const errorCode = this.safeString (response, 'code');
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            throw new ExchangeError (this.id + ' ' + body);
        }
        return undefined;
    }
}
