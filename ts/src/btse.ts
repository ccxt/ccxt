
//  ---------------------------------------------------------------------------

import Exchange from './abstract/btse.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { sha384 } from '@noble/hashes/sha2.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type { Balances, Dict, Endpoint, FundingRate, FundingRateHistory, FundingRates, int, Int, Leverage, LeverageTier, LeverageTiers, List, MarginMode, Market, Num, OHLCV, OpenInterests, Order, OrderBook, OrderSide, OrderType, Position, PositionModeInfo, Str, Strings, Ticker, Tickers, Trade, TradingFees, TradingFeeInterface, Transaction, Currency, LedgerEntry } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class btse
 * @augments Exchange
 */
export default class btse extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'btse',
            'name': 'BTSE',
            'countries': [ 'VG' ], // Virgin Islands (British)
            'rateLimit': 1000 / 75, // 75 requests per second
            'version': 'v3', // spot v3.3 and v3.2, swap v.2.3
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelOrdersWithClientOrderId': false,
                'cancelOrderWithClientOrderId': true,
                'closeAllPositions': false,
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
                'createOrderWithTakeProfitAndStopLoss': true, // contract markets only
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'deposit': false,
                'editOrder': true,
                'editOrders': false,
                'editOrderWithClientOrderId': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL2OrderBook': false,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': true,
                'fetchLedgerEntry': false,
                'fetchLeverage': true,
                'fetchLeverages': false,
                'fetchLeverageTiers': true,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': true,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrdersByStatus': false,
                'fetchOrderTrades': true,
                'fetchOrderWithClientOrderId': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': false,
                'watchMyLiquidationsForSymbols': false,
                'withdraw': false,
                'ws': false,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/879ce771-6db1-4d8f-868a-77c9621635dc', // todo add logo
                'api': {
                    'public': 'https://api.btse.com',
                    'private': 'https://api.btse.com',
                },
                'test': {
                    'public': 'https://testapi.btse.io',
                    'private': 'https://testapi.btse.io',
                },
                'www': 'https://www.btse.com',
                'doc': 'https://support.btse.com/en/support/solutions/articles/43000044751-btse-api',
                'referral': 'https://www.btse.com/referral/o2tjIXx5',
                'fees': 'https://support.btse.com/en/support/solutions/articles/43000064283',
            },
            'api': {
                'public': {
                    'get': {
                        'spot/api/v3.3/market_summary': { 'cost': 5 } as Endpoint<List>, // done
                        'spot/api/v3.3/ohlcv': { 'cost': 5 } as Endpoint<List>, // done
                        'spot/api/v3.3/price': 5, // not used
                        'spot/api/v3.3/orderbook': 5, // not used
                        'spot/api/v3.3/orderbook/L2': 5, // done
                        'spot/api/v3.3/trades': { 'cost': 5 } as Endpoint<List>, // done
                        'spot/api/v3.3/time': 5, // done
                        'futures/api/v2.3/market_summary': { 'cost': 5 } as Endpoint<List>, // done
                        'futures/api/v2.3/ohlcv': { 'cost': 5 } as Endpoint<List>, // done
                        'futures/api/v2.3/price': 5, // not used
                        'futures/api/v2.3/orderbook': 5, // not used
                        'futures/api/v2.3/orderbook/L2': 5, // done
                        'futures/api/v2.3/trades': { 'cost': 5 } as Endpoint<List>, // done
                        'futures/api/v2.3/funding_history': 5, // done
                        'futures/api/v2.3/market/risk_limit': 5, // done
                        'spot/api/v3.2/availableCurrencyNetworks': 15, // not used
                        'spot/api/v3.2/exchangeRate': 15, // not used
                        'public-api/wallet/v1/crypto/networks': 15, // not used
                        'public-api/wallet/v1/assets/exchangeRate': 15, // not used
                        'public-api/market/v1/markets': { 'cost': 3 } as Endpoint<Dict>, // done
                        'public-api/market/v1/exchangeInfo': 3, // not used
                        'public-api/market/v1/orderbook': { 'cost': 3 } as Endpoint<Dict>, // done
                        'public-api/market/v1/trades': { 'cost': 3 } as Endpoint<Dict>, // done
                        'public-api/market/v1/klines': { 'cost': 3 } as Endpoint<Dict>, // done
                        'public-api/market/v1/ticker/24hr': { 'cost': 3 } as Endpoint<Dict>, // done
                        'public-api/market/v1/ticker/price': 3, // not used
                        'public-api/market/v1/ticker/indices': 3, // not used
                        'public-api/market/v1/ticker/l1': 3, // not used
                        'public-api/market/v1/recentFundingHistory': { 'cost': 3 } as Endpoint<Dict>, // done
                        'public-api/market/v1/riskLimits': { 'cost': 3 } as Endpoint<Dict>, // done
                        'public-api/wallet/v1/crypto/list': 15, // not used
                        'public-api/otc/v1/markets': 1, // not used
                    },
                },
                'private': {
                    'get': {
                        'spot/api/v3.3/order': 1, // done
                        'spot/api/v3.3/user/open_orders': 5, // done
                        'spot/api/v3.3/user/trade_history': { 'cost': 5 } as Endpoint<List>, // done
                        'spot/api/v3.3/user/fees': { 'cost': 5 } as Endpoint<List>, // done
                        'spot/api/v3.3/invest/products': 5,
                        'spot/api/v3.3/invest/orders': 5,
                        'spot/api/v3.3/invest/history': 5,
                        'futures/api/v2.3/order': 1, // done
                        'futures/api/v2.3/user/open_orders': 1, // done
                        'futures/api/v2.3/user/trade_history': { 'cost': 5 } as Endpoint<List>, // done
                        'futures/api/v2.3/user/positions': { 'cost': 5 } as Endpoint<List>, // done
                        'futures/api/v2.3/risk_limit': 5, // not used
                        'futures/api/v2.3/leverage': 5, // done
                        'futures/api/v2.3/user/fees': { 'cost': 5 } as Endpoint<List>, // done
                        'futures/api/v2.3/position_mode': { 'cost': 5 } as Endpoint<List>, // done
                        'futures/api/v2.3/user/margin_setting': 5, // not used
                        'futures/api/v2.3/user/wallet': { 'cost': 5 } as Endpoint<List>, // done
                        'futures/api/v2.3/user/wallet_history': 5,
                        'futures/api/v2.3/user/unifiedWallet/margin': 5,
                        'futures/api/v2.3/user/margin': 5,
                        'otc/api/v1/getMarket': 1,
                        'spot/api/v3.2/user/wallet': { 'cost': 15 } as Endpoint<List>, // done
                        'spot/api/v3.2/user/wallet_history': { 'cost': 15 } as Endpoint<List>, // done
                        'spot/api/v3.3/user/wallet/address': 15,
                        'spot/api/v3.2/availableCurrencies': 15,
                        'spot/api/v3.2/subaccount/wallet/history': 15,
                        'spot/api/v4/trade/orders': { 'cost': 5 } as Endpoint<List>, // done, bare array responses
                        'spot/api/v4/trade/order': { 'cost': 5 } as Endpoint<Dict>, // done
                        'spot/api/v4/trade/trade_history': 5, // done, mixed response shapes, enveloped and bare
                        'spot/api/v4/trade/fees': { 'cost': 5 } as Endpoint<List>, // done, bare array responses
                        'futures/api/v3/trade/orders': { 'cost': 5 } as Endpoint<List>, // done, bare array responses
                        'futures/api/v3/trade/risk_limit': 5, // not used
                        'futures/api/v3/trade/position_mode': { 'cost': 5 } as Endpoint<List>, // done, bare array responses
                        'futures/api/v3/trade/leverage': { 'cost': 5 } as Endpoint<List>, // done, bare array responses
                        'futures/api/v3/trade/trade_history': { 'cost': 5 } as Endpoint<List>, // done, bare array responses
                        'futures/api/v3/trade/positions': { 'cost': 5 } as Endpoint<List>, // done, bare array responses
                        'futures/api/v3/trade/margin_setting': 5, // not used
                        'public-api/wallet/v1/assets': 15, // not used
                        'public-api/wallet/v1/user/assets': { 'cost': 15 } as Endpoint<Dict>, // done
                        'public-api/wallet/v1/user/walletHistory': 15, // done, mixed response shapes, enveloped and bare
                        'public-api/wallet/v1/user/crypto/address': 15, // not used
                        'public-api/otc/v1/quotes': 1, // not used
                    },
                    'post': {
                        'spot/api/v3.3/order': 1, // done
                        'spot/api/v3.3/order/peg': 1, // same as above
                        'spot/api/v3.3/order/cancelAllAfter': { 'cost': 1 } as Endpoint<Dict>, // done
                        'spot/api/v3.3/invest/deposit': 5,
                        'spot/api/v3.3/invest/renew': 5,
                        'spot/api/v3.3/invest/redeem': 5,
                        'futures/api/v2.3/order': 1, // done
                        'futures/api/v2.3/order/peg': 1, // done
                        'futures/api/v2.3/order/cancelAllAfter': { 'cost': 1 } as Endpoint<Dict>, // done
                        'futures/api/v2.3/order/close_position': 1, // done
                        'futures/api/v2.3/risk_limit': 5, // not used
                        'futures/api/v2.3/leverage': 5, // done
                        'futures/api/v2.3/settle_in': 5,
                        'futures/api/v2.3/order/bind/tpsl': 1,
                        'futures/api/v2.3/position_mode': { 'cost': 5 } as Endpoint<Dict>, // done
                        'futures/api/v2.3/user/wallet/transfer': 5,
                        'futures/api/v2.3/subaccount/wallet/transfer': 5,
                        'otc/api/v1/quote': 1,
                        'otc/api/v1/accept/{quoteId}': 1,
                        'otc/api/v1/reject/{quoteId}': 1,
                        'otc/api/v1/queryOrder/{quoteId}': 1,
                        'spot/api/v3.3/user/wallet/address': 15,
                        'spot/api/v3.3/user/wallet/withdraw': 15,
                        'spot/api/v3.2/user/wallet/convert': 15,
                        'spot/api/v3.3/user/wallet/transfer': 15,
                        'spot/api/v4/trade/orders': { 'cost': 1 } as Endpoint<List>, // done
                        'spot/api/v4/trade/orders/cancel_all_after': { 'cost': 1 } as Endpoint<Dict>, // done
                        'spot/api/v4/trade/orders/algo': { 'cost': 1 } as Endpoint<List>, // done
                        'futures/api/v3/trade/orders': { 'cost': 1 } as Endpoint<Dict>, // done
                        'futures/api/v3/trade/orders/cancel_all_after': { 'cost': 1 } as Endpoint<Dict>, // done
                        'futures/api/v3/trade/orders/algo': { 'cost': 1 } as Endpoint<Dict>, // done
                        'futures/api/v3/trade/settle_in': 5, // not used
                        'futures/api/v3/trade/risk_limit': 5, // not used
                        'futures/api/v3/trade/positions/tpsl': 1, // not used
                        'futures/api/v3/trade/position_mode': { 'cost': 1 } as Endpoint<Dict>, // done
                        'futures/api/v3/trade/leverage': { 'cost': 1 } as Endpoint<Dict>, // done
                        'public-api/wallet/v1/user/crypto/address': 15, // not used
                        'public-api/wallet/v1/user/crypto/withdraw': 15, // not used
                        'public-api/wallet/v1/user/assets/sendTo': 15, // not used
                        'public-api/wallet/v1/user/assets/convert': 15, // not used
                        'public-api/otc/v1/quotes': 1, // not used
                        'public-api/otc/v1/quotes/accept': 1, // not used
                    },
                    'put': {
                        'spot/api/v3.3/order': 1, // done
                        'futures/api/v2.3/order': 1, // done
                        'spot/api/v4/trade/orders': { 'cost': 1 } as Endpoint<List>, // done
                        'futures/api/v3/trade/orders': { 'cost': 1 } as Endpoint<List>, // done
                    },
                    'delete': {
                        'spot/api/v3.3/order': 1, // done
                        'futures/api/v2.3/order': 1, // done
                        'spot/api/v3.3/user/wallet/address': 15,
                        'spot/api/v4/trade/orders': { 'cost': 1 } as Endpoint<List>, // done
                        'spot/api/v4/trade/orders/all': { 'cost': 1 } as Endpoint<List>, // done
                        'futures/api/v3/trade/orders': { 'cost': 1 } as Endpoint<List>, // done
                        'futures/api/v3/trade/positions': 1, // done, mixed response shapes, dict or one element array
                        'public-api/wallet/v1/user/crypto/address': 15, // not used
                    },
                },
            },
            'features': {
                'contract': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'mark': true,
                            'last': true,
                            'index': false,
                        },
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
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': true,
                        'selfTradePrevention': false,
                        'trailing': true,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'daysBack': undefined,
                        'limit': undefined,
                        'untilDays': 7,
                        'symbolRequired': false,
                    },
                    'fetchOrder': undefined,
                    'fetchOpenOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchCanceledAndClosedOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'spot': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'mark': false,
                            'last': true,
                            'index': true,
                        },
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined, // not supported
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false, // see timeInForce in options
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': true,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'daysBack': undefined,
                        'limit': undefined,
                        'untilDays': 7,
                        'symbolRequired': false,
                    },
                    'fetchOrder': undefined,
                    'fetchOpenOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchCanceledAndClosedOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'contract',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': {
                        'extends': 'contract',
                    },
                    'inverse': undefined,
                },
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '6h': '360',
                '1d': '1440',
                '1w': '10080',
                '1M': '43200',
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0002'),
                },
                'spot': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0002'),
                },
                'contract': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.00055'),
                },
            },
            'exceptions': {
                'exact': {
                    // 200 {"symbol":"ETH-PERP","timestamp":1770892916507,"status":135,"type":93,"message":"{\"msgKey\":\"trade.error.invalid.position_id\",\"params\":[\"ETH-PERP-USDT\"] ,\"default_msg\":\"User is in ISOLATE_HEDGE in market: ETH-PERP-USDT, but positionId is empty in the request.\"}"}
                    // {"code":400,"msg":"BADREQUEST: startTime can not before than 1569888000000 (2019-10-01T00:00)","time":1770828108074,"data":null,"success":false}
                    // {"code":400,"msg":"BADREQUEST: resolution too small for the requested time range. Records returned exceeds 300","success":false,"time":1770452248292,"data":[]}
                    // when position mode is wrong {"status":429,"errorCode":-1,"message":"Order not found","extraData":["117","0"]}
                    // {"status":400,"errorCode":-2,"message":"Invalid request parameters","extraData":null}
                    // {"status":400,"errorCode":-2,"message":"Can't support count more than 500","extraData":null}
                    // code -1 is ambiguous across the api surfaces, the official api status
                    // enum defines it as TIMEOUT while the legacy error envelope uses it as a
                    // generic failure whose message varies, observed live both as Order not
                    // found and as a plain Failed on a malformed request against an existing
                    // order, so it is classified by message in the broad map instead
                    '-2': BadRequest, // INVALID_REQUEST {"status":400,"errorCode":-2,"message":"symbol parameter is mandatory","extraData":null}
                    '-7': AuthenticationError, // {"status":400,"errorCode":-7,"message":"Authenticate failed","extraData":null}
                    '-7006': BadSymbol, // {"status":400,"errorCode":-7006,"message":"Unsupported symbol","extraData":null} observed live for a full contract id sent to the unified futures api
                    '-11': ExchangeNotAvailable, // 400 Bad Request {"code":-11,"msg":"System error","success":false,"time":1770451790797,"data":[]}
                    // the entries below come from the api status enum on the official error
                    // codes reference page, success and neutral codes are deliberately absent
                    '1': ExchangeNotAvailable, // MARKET_UNAVAILABLE
                    '8': InsufficientFunds, // INSUFFICIENT_BALANCE
                    '11': BadRequest, // ERROR_INVALID_CURRENCY
                    '12': BadRequest, // ERROR_UPDATE_RISK_LIMIT
                    '13': BadRequest, // ERROR_INVALID_LEVERAGE
                    '15': InvalidOrder, // ORDER_REJECTED
                    '16': OrderNotFound, // ORDER_NOTFOUND
                    '17': ExchangeError, // REQUEST_FAILED
                    '28': ExchangeError, // TRANSFER_UNSUCCESSFUL
                    '41': BadRequest, // ERROR_INVALID_RISK_LIMIT
                    '64': ExchangeError, // STATUS_LIQUIDATION
                    '101': InvalidOrder, // FUTURES_ORDER_PRICE_OUTSIDE_LIQUIDATION_PRICE
                    '133': InvalidOrder, // {"status":400,"errorCode":133,"message":"Position mode invalid","extraData":["0","150"]}
                    '134': BadRequest, // {"status":400,"errorCode":134,"message":"failure","extraData":"Remaining positions."}
                    '135': BadRequest, // invalid position id, observed live with an embedded json message
                    '300': InvalidOrder, // ERROR_MAX_ORDER_SIZE_EXCEEDED
                    '301': InvalidOrder, // ERROR_INVALID_ORDER_SIZE
                    '302': InvalidOrder, // ERROR_INVALID_ORDER_PRICE
                    '303': RateLimitExceeded, // ERROR_RATE_LIMITS_EXCEEDED
                    '304': InvalidOrder, // ERROR_MAX_OPEN_ORDER_EXCEEDED
                    '305': InvalidOrder, // ERROR_ORDER_PRICE_OUT_OF_PRICE_PROTECTION_RANGE
                    '1003': InvalidOrder, // ORDER_LIQUIDATION
                    '1004': InvalidOrder, // ORDER_ADL
                    '4003': InvalidOrder, // {"code":4003,"msg":"BADREQUEST: The order amount cannot surpass 100.0 BTC. Please adjust your order size and try again.","time":1786509292895,"data":null,"success":false}
                    '4005': InvalidOrder, // {"code":4005,"msg":"BADREQUEST: order price must be at least 0.01 USDT","time":1786622000000,"data":null,"success":false} observed live on the unified spot api
                    '4051': InvalidOrder, // {"status":400,"errorCode":4051,"message":"[RAVE-PERP] The order size cannot surpass 50000.0 contracts. Please adjust your order size and try again.","extraData":null}
                    '10002': AuthenticationError, // {"code":10002,"msg":"UNAUTHORIZED: Authentication Failed","time":1770477230034,"data":null,"success":false}
                    '10010004': BadRequest, // {"code":10010004,"msg":"BADREQUEST: resolution too small for the requested time range. Records returned exceeds 300","success":false} observed live on the unified markets api
                    '11000001': BadRequest, // {"code":11000001,"msg":"Request parameter is error, 'asset' is required in spot wallet history query","time":1786624306820,"data":null,"success":false} observed live on the unified wallet api
                    '51523': InsufficientFunds, // {"code":51523,"msg":"BADREQUEST: Insufficient wallet balance","time":1770814875493,"data":null,"success":false}
                    '33001001': InvalidOrder, // {"code":33001001,"msg":"BADREQUEST: The distance between Trigger Price and Limit Price cannot exceed 5.0 %","time":1770815167145,"data":["5.0 %"],"success":false}
                    '33001003': InvalidOrder, // {"status":400,"errorCode":33001003,"message":"You can not SELL ETH lower than 1825.24 USDT","extraData":["SELL","ETH","lower","1825.24","USDT"]}
                    '33199101': InsufficientFunds, // {"status":400,"errorCode":33199101,"message":"Available balance is insufficient to meet this order.","extraData":["0.013553333"]}
                    '33199120': InvalidOrder, // {"status":400,"errorCode":33199120,"message":"Reduce only open order canceled because no active position exists","extraData":null}
                },
                'broad': {
                    // the specific strings come from the official error codes reference and
                    // must stay above the generic BADREQUEST catch all
                    'Order not found': OrderNotFound, // {"status":429,"errorCode":-1,"message":"Order not found","extraData":["ETHPFC-USD","0","117"]}
                    'Insufficient wallet balance': InsufficientFunds,
                    'Insufficient balance': InsufficientFunds, // official error string for enum code 8
                    'Authentication Failed': AuthenticationError,
                    'Authenticate failed': AuthenticationError,
                    'Signature verification failed': AuthenticationError, // official error string, signed payload mismatch
                    'api parameter is mandatory': AuthenticationError, // official error string, wrong auth header names
                    'Invalid nonce': InvalidNonce, // official error string, clock drift or nonce reuse
                    'Invalid order size': InvalidOrder, // official error string for enum code 301
                    'Invalid order price': InvalidOrder, // official error string for enum code 302
                    'Maximum open orders exceeded': InvalidOrder, // official error string for enum code 304
                    'Rate limit exceeded': RateLimitExceeded, // official error string for enum code 303
                    'auto-deleveraging': InvalidOrder, // official error string for enum code 1004
                    'BADREQUEST': BadRequest,
                },
            },
            'commonCurrencies': {
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and the exchange server clock in milliseconds
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'networks': {
                },
                'timeInForce': {
                    'GTC': 'GTC',
                    'IOC': 'IOC',
                    'FOK': 'FOK',
                    'HALFSEC': 'HALFSEC',
                    'HALFMIN': 'HALFMIN',
                    'FIVEMIN': 'FIVEMIN',
                    'HOUR': 'HOUR',
                    'TWELVEHOUR': 'TWELVEHOUR',
                    'DAY': 'DAY',
                    'WEEK': 'WEEK',
                    'MONTH': 'MONTH',
                },
                'accountsByType': {
                },
                'accountsById': {
                },
            },
        });
    }

    /**
     * @method
     * @name btse#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetSpotApiV33Time (params);
        //
        //     {
        //         "iso": "2026-02-06T11:48:37.976Z",
        //         "epoch": 1770378517
        //     }
        //
        return this.safeTimestamp (response, 'epoch');
    }

    /**
     * @method
     * @name btse#fetchMarkets
     * @description retrieves data on all markets for btse
     * @see https://docs.btse.com/markets/rest/get-markets/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference'] === true) {
            await this.loadTimeDifference ();
        }
        const response = await this.publicGetPublicApiMarketV1Markets (params);
        const data = this.safeDict (response, 'data', {});
        const markets = this.safeList (data, 'symbols', []);
        return this.parseMarkets (markets);
    }

    override parseMarket (market: Dict): Market {
        //
        // spot
        //     {
        //         "symbol": "BTC-USDT",
        //         "type": "Spot",
        //         "category": "CRYPTO",
        //         "tradeCurrency": "BTC",
        //         "baseCurrency": "BTC",
        //         "quoteCurrency": "USDT",
        //         "displayName": "Bitcoin",
        //         "active": true,
        //         "minOrderPrice": "0.1",
        //         "minPriceIncrement": "0.1",
        //         "pricePrecision": 1,
        //         "minOrderSize": "0.00001",
        //         "maxOrderSize": "100",
        //         "minSizeIncrement": "0.00001",
        //         "sizePrecision": 5
        //     }
        //
        // swap
        //     {
        //         "symbol": "BTC-PERP-USDT",
        //         "type": "FuturesPerpetual",
        //         "category": "CRYPTO",
        //         "tradeCurrency": "BTC-PERP",
        //         "baseCurrency": "BTC",
        //         "quoteCurrency": "USDT",
        //         "displayName": "Bitcoin",
        //         "active": true,
        //         "minOrderPrice": "0.1",
        //         "minPriceIncrement": "0.1",
        //         "pricePrecision": 1,
        //         "minOrderSize": "1",
        //         "maxOrderSize": "7500000",
        //         "minSizeIncrement": "1",
        //         "sizePrecision": 0,
        //         "contractSize": "0.00001",
        //         "availableSettlement": [ "USD", "USDT" ]
        //     }
        //
        // future
        //     {
        //         "symbol": "BTC-260925-USDT",
        //         "type": "FuturesTimeBased",
        //         "category": "CRYPTO",
        //         "tradeCurrency": "BTC-260925",
        //         "baseCurrency": "BTC",
        //         "quoteCurrency": "USDT",
        //         "displayName": "Bitcoin",
        //         "active": true,
        //         "minOrderPrice": "0.1",
        //         "minPriceIncrement": "0.1",
        //         "pricePrecision": 1,
        //         "minOrderSize": "1",
        //         "maxOrderSize": "100000",
        //         "minSizeIncrement": "1",
        //         "sizePrecision": 0,
        //         "contractSize": "0.00001",
        //         "availableSettlement": [ "USD", "USDT" ],
        //         "contractStartTime": 1774569600000,
        //         "contractEndTime": 1790323230000,
        //         "matchingStartTime": 1774569615000,
        //         "becomeInactiveTime": 1790323200000
        //     }
        //
        const marketType = this.safeString (market, 'type');
        const isSpot = marketType === 'Spot';
        const isFuture = marketType === 'FuturesTimeBased';
        const isSwap = marketType === 'FuturesPerpetual';
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseCurrency');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        const maxAmountString = this.safeString (market, 'maxOrderSize');
        const minAmountString = this.safeString (market, 'minOrderSize');
        const minPriceString = this.safeString (market, 'minOrderPrice');
        const pricePrecision = this.safeString (market, 'minPriceIncrement');
        const amountPrecision = this.safeString (market, 'minSizeIncrement');
        const active = this.safeBool (market, 'active');
        let type = 'spot';
        let expiry = undefined;
        let contractSize = undefined;
        if (!isSpot) {
            symbol += ':' + quote;
            contractSize = this.safeString (market, 'contractSize');
            if (isFuture) {
                expiry = this.safeInteger (market, 'contractEndTime');
                symbol += '-' + this.yymmdd (expiry);
                type = 'future';
            } else {
                type = 'swap';
            }
        }
        let fees = this.safeValue (this.fees, 'contract');
        if (isSpot) {
            fees = this.safeValue (this.fees, 'spot');
        }
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': isSpot ? undefined : quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': isSpot ? undefined : quoteId,
            'type': type,
            'spot': isSpot,
            'margin': isSpot ? false : undefined,
            'swap': isSwap,
            'future': isFuture,
            'option': false,
            'active': active,
            'contract': isSwap || isFuture,
            'linear': isSpot ? undefined : true,
            'inverse': isSpot ? undefined : false,
            'taker': fees['taker'],
            'maker': fees['maker'],
            'contractSize': this.parseNumber (contractSize),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (amountPrecision),
                'price': this.parseNumber (pricePrecision),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.parseNumber (minAmountString),
                    'max': this.parseNumber (maxAmountString),
                },
                'price': {
                    'min': this.parseNumber (minPriceString),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name btse#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.btse.com/markets/rest/get-klines/
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default and max 300)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const maxLimit = 300;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'symbol': market['id'],
            'resolution': interval,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, maxLimit);
        } else {
            // the endpoint returns only 10 candles when the limit is omitted
            request['limit'] = maxLimit;
        }
        if (since !== undefined) {
            // the endpoint accepts timestamps in seconds
            request['start'] = this.parseToInt (since / 1000);
        }
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'until');
        if (until !== undefined) {
            if (since !== undefined) {
                // check if the requested time range is too large for one request
                // if so, just omit until for correct paginated calls for not to get an error from the exchange
                const duration = this.parseTimeframe (timeframe);
                const maxDelta = duration * maxLimit * 1000; // parseTimeframe returns seconds, the difference below is in milliseconds
                const difference = until - since;
                if (difference < maxDelta) {
                    request['end'] = this.parseToInt (until / 1000);
                }
            } else {
                request['end'] = this.parseToInt (until / 1000);
            }
        }
        const response = await this.publicGetPublicApiMarketV1Klines (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             [
        //                 "1786600800",
        //                 "1895.78",
        //                 "1898.52",
        //                 "1892.05",
        //                 "1898.3",
        //                 "560622.306372"
        //             ]
        //         ],
        //         "code": 1,
        //         "msg": "Success",
        //         "success": true,
        //         "time": 1786604274378
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result = this.parseOHLCVs (data, market, timeframe, since, limit);
        return result;
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        //     [
        //         "1786600800", // timestamp in seconds
        //         "1895.78",
        //         "1898.52",
        //         "1892.05",
        //         "1898.3",
        //         "560622.306372" // volume in quote currency, contract rows may use scientific notation
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name btse#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.btse.com/markets/rest/get-orderbook/
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = Math.min (limit, 50); // the endpoint supports a maximum depth of 50
        }
        const response = await this.publicGetPublicApiMarketV1Orderbook (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "timestamp": 1786605670799,
        //             "bids": [
        //                 [ "1896.11", "0.015" ]
        //             ],
        //             "asks": [
        //                 [ "1896.74", "0.945" ]
        //             ]
        //         },
        //         "code": 1,
        //         "msg": "Success",
        //         "success": true,
        //         "time": 1786605670833
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks');
    }

    /**
     * @method
     * @name btse#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.btse.com/markets/rest/get-funding-rate-history/
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch, used to select the requested period and then applied client-side
     * @param {int} [limit] the maximum amount of entries to fetch, applied client-side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.period] the funding rate history period, one of '7D', '2W' or '1M', selected from since by default
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch, applied client-side
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    override async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['contract'] !== true) {
            throw new BadRequest (this.id + ' fetchFundingRateHistory() supports contract markets only');
        }
        let period = undefined;
        [ period, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'period');
        if (period === undefined) {
            period = '7D';
            if (since !== undefined) {
                const age = this.milliseconds () - since;
                const day = 86400000;
                if (age > 14 * day) {
                    period = '1M';
                } else if (age > 7 * day) {
                    period = '2W';
                }
            }
        }
        const request: Dict = {
            'symbol': market['id'],
            'period': period,
        };
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'until');
        const response = await this.publicGetPublicApiMarketV1RecentFundingHistory (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "timestamp": 1786003200911,
        //                 "rate": "0.0000152"
        //             }
        //         ],
        //         "code": 1,
        //         "msg": "Success",
        //         "success": true,
        //         "time": 1786607775380
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const rates = this.parseFundingRateHistories (data, market, since, limit);
        if (until === undefined) {
            return rates;
        }
        const result = [];
        for (let i = 0; i < rates.length; i++) {
            const rate = rates[i];
            const timestamp = this.safeInteger (rate, 'timestamp');
            if ((timestamp === undefined) || (timestamp <= until)) {
                result.push (rate);
            }
        }
        return result;
    }

    override parseFundingRateHistory (contract: any, market: Market = undefined) {
        //
        //     {
        //         "timestamp": 1786003200911,
        //         "rate": "0.0000152"
        //     }
        //
        const timestamp = this.safeInteger (contract, 'timestamp');
        return {
            'info': contract,
            'symbol': this.safeSymbol (undefined, market),
            'fundingRate': this.safeNumber (contract, 'rate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name btse#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.btse.com/wallet/rest/get-user-assets/
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-wallet-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] wallet type, spot or swap, default is spot
     * @param {string} [params.wallet] futures wallet name, CROSS@ by default, or ISOLATED@ followed by the market id with -USDT appended
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params, type);
        let response = undefined;
        if (type === 'spot') {
            const walletResponse = await this.privateGetPublicApiWalletV1UserAssets (params);
            //
            //     {
            //         "data": [
            //             {
            //                 "asset": "BTC",
            //                 "type": "CRYPTO",
            //                 "totalAmount": "100.0",
            //                 "availableAmount": "100.0",
            //                 "availableActions": [ "CONVERT", "TRANSFER", "WITHDRAW", "DEPOSIT", "SEND_TO" ],
            //                 "cryptoNetwork": { "depositNetworks": [ "BITCOIN" ], "withdrawalNetworks": [ "BITCOIN" ] }
            //             }
            //         ],
            //         "code": 1,
            //         "msg": "Success",
            //         "success": true,
            //         "time": 1624989977940
            //     }
            //
            response = this.safeList (walletResponse, 'data', []);
        } else {
            let wallet = undefined;
            [ wallet, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'wallet', 'CROSS@');
            const request: Dict = {
                'wallet': wallet,
            };
            response = await this.privateGetFuturesApiV23UserWallet (this.extend (request, params));
            //
            //     [
            //         {
            //             "wallet": "CROSS@",
            //             "totalValue": 100,
            //             "marginBalance": 100,
            //             "availableBalance": 100,
            //             "unrealisedProfitLoss": 0,
            //             "assets": [
            //                 {"balance": 0.20183537, "assetPrice": 7158.844999999999, "currency": "BTC"}
            //             ],
            //             "assetsInUse": [
            //                 {"balance": 0.01, "assetPrice": 7158.844999999999, "currency": "BTC"}
            //             ]
            //         }
            //     ]
            //
        }
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
        };
        const totals: Dict = {};
        const frees: Dict = {};
        const useds: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const row = response[i];
            const assets = this.safeList (row, 'assets');
            if (assets !== undefined) {
                // futures wallet row: per-currency totals in assets, locked amounts in assetsInUse
                // several wallet rows can report the same currency, so amounts are aggregated
                const inUse = this.safeList (row, 'assetsInUse', []);
                for (let j = 0; j < inUse.length; j++) {
                    const usedRow = inUse[j];
                    const usedCode = this.safeCurrencyCode (this.safeString (usedRow, 'currency'));
                    if (usedCode === undefined) {
                        continue;
                    }
                    useds[usedCode] = Precise.stringAdd (this.safeString (useds, usedCode, '0'), this.safeString (usedRow, 'balance'));
                }
                for (let j = 0; j < assets.length; j++) {
                    const assetRow = assets[j];
                    const code = this.safeCurrencyCode (this.safeString (assetRow, 'currency'));
                    if (code === undefined) {
                        continue;
                    }
                    totals[code] = Precise.stringAdd (this.safeString (totals, code, '0'), this.safeString (assetRow, 'balance'));
                    useds[code] = this.safeString (useds, code, '0');
                }
            } else {
                // unified wallet row: {"asset": "BTC", "totalAmount": "100.0", "availableAmount": "100.0"}
                // legacy spot wallet row: {"available": 520.52, "currency": "USD", "total": 5566.5566}
                const code = this.safeCurrencyCode (this.safeString2 (row, 'asset', 'currency'));
                if (code === undefined) {
                    continue;
                }
                totals[code] = Precise.stringAdd (this.safeString (totals, code, '0'), this.safeString2 (row, 'totalAmount', 'total'));
                frees[code] = Precise.stringAdd (this.safeString (frees, code, '0'), this.safeString2 (row, 'availableAmount', 'available'));
            }
        }
        const codes = Object.keys (totals);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const account = this.account ();
            account['total'] = this.safeString (totals, code);
            account['free'] = this.safeString (frees, code);
            account['used'] = this.safeString (useds, code);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name btse#fetchLeverageTiers
     * @see https://docs.btse.com/markets/rest/get-market-risk-limits/
     * @description retrieve information on the maximum leverage, for different trade sizes
     * @param {string[]|undefined} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
     */
    override async fetchLeverageTiers (symbols: Strings = undefined, params = {}): Promise<LeverageTiers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const requestedSymbol = this.safeString (symbols, 0);
                const market = this.market (requestedSymbol);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.publicGetPublicApiMarketV1RiskLimits (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "symbol": "BTC-PERP-USDT",
        //                 "riskLimits": [
        //                     { "level": 1, "value": 3000000 },
        //                     { "level": 2, "value": 6000000 }
        //                 ]
        //             }
        //         ],
        //         "code": 1,
        //         "msg": "Success",
        //         "success": true,
        //         "time": 1786609503920
        //     }
        //
        // a single-symbol request returns the entry directly in data
        //
        let data = this.safeList (response, 'data');
        if (data === undefined) {
            const single = this.safeDict (response, 'data', {});
            data = [ single ];
        }
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            if (symbols === undefined || this.inArray (symbol, symbols)) {
                const levels = this.safeList (entry, 'riskLimits', []);
                const tiers = [];
                for (let j = 0; j < levels.length; j++) {
                    const level = levels[j];
                    // the endpoint only reports the notional ladder, the
                    // per-tier leverage and margin rates are not available
                    tiers.push ({
                        'tier': this.safeInteger (level, 'level'),
                        'symbol': symbol,
                        'currency': market['settle'],
                        'minNotional': undefined,
                        'maxNotional': this.safeNumber (level, 'value'),
                        'maintenanceMarginRate': undefined,
                        'maxLeverage': undefined,
                        'info': level,
                    });
                }
                result[symbol] = tiers; // rows arrive ordered by level ascending, avoid sortBy which compares numeric keys lexicographically in some transpiled runtimes
            }
        }
        // the exchange only provides the cap of each risk tier, so the floor
        // is derived from the previous tier: 0 for the first tier, and the
        // previous tier's maxNotional for every subsequent tier
        const symbolKeys = Object.keys (result);
        for (let i = 0; i < symbolKeys.length; i++) {
            const symbolKey = symbolKeys[i];
            const tiersList = result[symbolKey];
            for (let j = 0; j < tiersList.length; j++) {
                if (j === 0) {
                    tiersList[j]['minNotional'] = 0;
                } else {
                    tiersList[j]['minNotional'] = tiersList[j - 1]['maxNotional'];
                }
            }
            // php copies arrays by value, so the mutated list must be written back explicitly
            result[symbolKey] = tiersList;
        }
        return result as LeverageTiers;
    }

    /**
     * @method
     * @name btse#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, for different trade sizes for a single market
     * @see https://docs.btse.com/markets/rest/get-market-risk-limits/
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
     */
    override async fetchMarketLeverageTiers (symbol: string, params = {}): Promise<LeverageTier[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['contract'] !== true) {
            throw new BadRequest (this.id + ' fetchMarketLeverageTiers() supports contract markets only');
        }
        const result = await this.fetchLeverageTiers ([ symbol ], params);
        return result[symbol];
    }

    /**
     * @method
     * @name btse#fetchTickers
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true);
        // the unified endpoint serves all market types in one call, the legacy type param is accepted and ignored
        params = this.omit (params, 'type');
        const response = await this.publicGetPublicApiMarketV1Ticker24hr (params);
        const data = this.safeList (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    /**
     * @method
     * @name btse#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPublicApiMarketV1Ticker24hr (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "symbol": "BTC-PERP-USDT",
        //                 "lastPrice": "63790.1",
        //                 "openPrice": "63808.3",
        //                 "highPrice": "64446.7",
        //                 "lowPrice": "63289.7",
        //                 "amount": "789198764",
        //                 "volume": "502595131.844331",
        //                 "openTime": 1786514400,
        //                 "closeTime": 1786602644,
        //                 "priceChange": "-18.2",
        //                 "priceChangePercent": "0",
        //                 "prevClosePrice": "63842.4",
        //                 "bidPrice": "63790",
        //                 "bidQty": "222000",
        //                 "askPrice": "63790.2",
        //                 "askQty": "255355",
        //                 "openInterest": "29489680",
        //                 "fundingRate": "0.0001",
        //                 "nextFundingTime": 1786608000000,
        //                 "fundingIntervalMinutes": 480
        //             }
        //         ],
        //         "code": 1,
        //         "msg": "Success",
        //         "success": true,
        //         "time": 1786602644221
        //     }
        //
        // a single-symbol query returns data as one object, a multi-symbol or bare query returns an array
        let data = this.safeDict (response, 'data');
        if (data === undefined) {
            const rows = this.safeList (response, 'data', []);
            data = this.safeDict (rows, 0, {});
        }
        return this.parseTicker (data, market);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // spot rows carry the fields up to askQty, contract rows additionally carry
        // openInterest, fundingRate, nextFundingTime and fundingIntervalMinutes
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const last = this.safeString (ticker, 'lastPrice');
        let baseVolume = this.safeString (ticker, 'amount');
        if ((baseVolume !== undefined) && (market !== undefined) && (market['contract'] === true)) {
            // for contract markets the amount field is denominated in contracts, verified live -
            // scaling by contractSize converts it into base currency units
            const contractSizeString = this.numberToString (market['contractSize']);
            if (contractSizeString !== undefined) {
                baseVolume = Precise.stringMul (baseVolume, contractSizeString);
            }
        }
        const timestamp = this.safeTimestamp (ticker, 'closeTime');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
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
            'close': last,
            'last': last,
            'previousClose': this.safeString (ticker, 'prevClosePrice'),
            'change': this.safeString (ticker, 'priceChange'),
            // priceChangePercent is a ratio rounded to three decimals, not a percentage,
            // so it is left out and safeTicker derives percentage from change and open
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': this.safeString (ticker, 'volume'),
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name btse#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=interest-history-structure}
     */
    override async fetchOpenInterest (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot'] === true) {
            throw new BadRequest (this.id + ' fetchOpenInterest() symbol does not support market ' + symbol);
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPublicApiMarketV1Ticker24hr (this.extend (request, params));
        let interest = this.safeDict (response, 'data');
        if (interest === undefined) {
            const rows = this.safeList (response, 'data', []);
            interest = this.safeDict (rows, 0, {});
        }
        return this.parseOpenInterest (interest, market);
    }

    /**
     * @method
     * @name btse#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string[]} [symbols] a list of unified CCXT market symbols
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} a list of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    override async fetchOpenInterests (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetPublicApiMarketV1Ticker24hr (params);
        const data = this.safeList (response, 'data', []);
        const rows = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            // spot rows do not carry an open interest
            if (this.safeString (row, 'openInterest') !== undefined) {
                rows.push (row);
            }
        }
        return this.parseOpenInterests (rows, symbols) as OpenInterests;
    }

    override parseOpenInterest (interest: any, market: Market = undefined) {
        //
        // ticker/24hr contract rows, see parseFundingRate for the full shape
        //
        const marketId = this.safeString (interest, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (interest, 'closeTime');
        return this.safeOpenInterest ({
            'symbol': market['symbol'],
            'openInterestAmount': this.safeNumber (interest, 'openInterest'),
            'openInterestValue': this.safeNumber (interest, 'openInterestUSD'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name btse#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot'] === true) {
            throw new BadRequest (this.id + ' fetchFundingRate() symbol does not support spot markets');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPublicApiMarketV1Ticker24hr (this.extend (request, params));
        let data = this.safeDict (response, 'data');
        if (data === undefined) {
            const rows = this.safeList (response, 'data', []);
            data = this.safeDict (rows, 0, {});
        }
        return this.parseFundingRate (data, market);
    }

    /**
     * @method
     * @name btse#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexe by market symbols
     */
    override async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetPublicApiMarketV1Ticker24hr (params);
        const data = this.safeList (response, 'data', []);
        const rows = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            // spot rows do not carry a funding rate
            if (this.safeString (row, 'fundingRate') !== undefined) {
                rows.push (row);
            }
        }
        return this.parseFundingRates (rows, symbols);
    }

    override parseFundingRate (contract: any, market: Market = undefined): FundingRate {
        //
        // ticker/24hr contract rows
        //     {
        //         "symbol": "ETH-PERP-USDT",
        //         "lastPrice": "1896.17",
        //         "openPrice": "1887.07",
        //         "highPrice": "1924",
        //         "lowPrice": "1872.44",
        //         "amount": "1937140691",
        //         "volume": "366459222.269293",
        //         "openTime": 1786518000,
        //         "closeTime": 1786607054,
        //         "priceChange": "9.1",
        //         "priceChangePercent": "0.005",
        //         "prevClosePrice": "1897.71",
        //         "bidPrice": "1896",
        //         "bidQty": "105",
        //         "askPrice": "1896.01",
        //         "askQty": "11354",
        //         "openInterest": "19344237",
        //         "fundingRate": "0.00006016",
        //         "nextFundingTime": 1786608000000,
        //         "fundingIntervalMinutes": 480
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (contract, 'closeTime');
        // dated futures carry a zero nextFundingTime as funding only applies to
        // perpetuals, observed live, the zero means no next funding and is omitted
        const nextFundingTimestamp = this.safeIntegerOmitZero (contract, 'nextFundingTime');
        const fundingIntervalMinutes = this.safeInteger (contract, 'fundingIntervalMinutes');
        let interval = undefined;
        // a wire value of zero minutes reaches this, and zero hours is not an
        // interval: a caller annualising a rate divides by it. anything under an
        // hour rounds to the same string, and the vocabulary has no minutes
        if ((fundingIntervalMinutes !== undefined) && (fundingIntervalMinutes >= 60)) {
            const hours = this.parseToInt (fundingIntervalMinutes / 60);
            interval = hours.toString () + 'h';
        }
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
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
     * @name btse#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.btse.com/markets/rest/get-trades/
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch, applied client-side to the most recent trades window
     * @param {int} [limit] the maximum amount of trades to fetch (max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry to fetch, applied client-side to the most recent trades window
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 500); // the endpoint supports a maximum of 500 trades
        }
        // the unified trades endpoint has no server-side time filtering, since and until are applied client-side below
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'until');
        const response = await this.publicGetPublicApiMarketV1Trades (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "id": 91151062,
        //                 "timestamp": 1786605669577,
        //                 "price": "1896.3291755587",
        //                 "size": "0.06",
        //                 "quoteSize": "113.7797505335",
        //                 "side": "BUY"
        //             }
        //         ],
        //         "code": 1,
        //         "msg": "Success",
        //         "success": true,
        //         "time": 1786605671650
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const trades = this.parseTrades (data, market, since, limit);
        if (until === undefined) {
            return trades;
        }
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const timestamp = this.safeInteger (trade, 'timestamp');
            if ((timestamp === undefined) || (timestamp <= until)) {
                result.push (trade);
            }
        }
        return result;
    }

    /**
     * @method
     * @name btse#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.btse.com/spot/rest/get-trade-history/
     * @see https://docs.btse.com/futures/rest/get-trade-history/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is undefined
     * @param {string} [params.type] 'spot' or 'swap' or 'future', default is 'spot'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const paginate = this.safeBool (params, 'paginate', false);
        if (paginate === true) {
            params = this.omit (params, 'paginate');
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params);
        }
        let market = undefined;
        let request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument for spot markets');
            }
            //
            //     {
            //         "data": [
            //             {
            //                 "serialId": 375599088,
            //                 "tradeId": "de1a79b8-f408-4e05-b8b7-7ed3c4e86542",
            //                 "orderId": "6c72d906-cb8f-469c-8ab0-b97bc8dff9c2",
            //                 "clOrderId": null,
            //                 "symbol": "BTC-USD",
            //                 "base": "BTC",
            //                 "quote": "USD",
            //                 "orderSide": "BUY",
            //                 "orderType": 77,
            //                 "triggerType": 0,
            //                 "triggerPrice": 0,
            //                 "price": 64235.97008,
            //                 "size": 1.9,
            //                 "filledSize": 0.00002,
            //                 "feeCurrency": "BTC",
            //                 "feeAmount": 1e-8,
            //                 "timestamp": 1784890959551
            //             }
            //         ],
            //         "code": 1,
            //         "msg": "Success",
            //         "success": true,
            //         "time": 1786610160164
            //     }
            //
            response = await this.privateGetSpotApiV4TradeTradeHistory (this.extend (request, params));
        } else {
            // the futures endpoint does not support a count parameter, the limit is applied client-side
            request = this.omit (request, 'count');
            if (market !== undefined) {
                request['symbol'] = this.futuresRequestId (market);
            }
            //
            //     {
            //         "data": [
            //             {
            //                 "tradeId": "1ad38104-6248-4a45-bc56-5fa9bf7f3868",
            //                 "orderId": "8ad94105-8cce-4e01-86b8-2d0fb403db66",
            //                 "clOrderId": "",
            //                 "positionId": "BTC-PERP-USDT",
            //                 "orderSide": "BUY",
            //                 "type": 77,
            //                 "orderDetailType": null,
            //                 "price": 0,
            //                 "size": 1,
            //                 "avgFilledPrice": 60010,
            //                 "filledSize": 1,
            //                 "triggerPrice": 0,
            //                 "contractSize": 0.00001,
            //                 "base": "BTC",
            //                 "quote": "USDT",
            //                 "symbol": "BTC-PERP",
            //                 "wallet": "BTC-PERP Isolated Wallet",
            //                 "feeCurrency": "USDT",
            //                 "feeAmount": 0.00012002,
            //                 "realizedPnl": 0,
            //                 "total": -0.00012002,
            //                 "serialId": 375598162,
            //                 "timestamp": 1784882344446
            //             }
            //         ],
            //         "code": 1,
            //         "msg": "Success",
            //         "success": true,
            //         "time": 1786610160164
            //     }
            //
            response = await this.privateGetFuturesApiV3TradeTradeHistory (this.extend (request, params));
        }
        let rows = this.safeList (response, 'data') as any;
        if (rows === undefined) {
            rows = response;
        }
        return this.parseTrades (rows, market, since, limit);
    }

    /**
     * @method
     * @name btse#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-user-trades-fills
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-trades-fills-2
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, could be used instead of the order id
     * @param {string} [params.type] 'spot' or 'swap' or 'future', default is 'spot'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            if (id === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires an id argument or a clientOrderId parameter');
            } else {
                params = this.extend (params, { 'orderID': id });
            }
        } else {
            params = this.extend (params, { 'clOrderID': clientOrderId });
        }
        return await this.fetchMyTrades (symbol, since, limit, params);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     {
        //         "id": 91151062,
        //         "timestamp": 1786605669577,
        //         "price": "1896.3291755587",
        //         "size": "0.06",
        //         "quoteSize": "113.7797505335",
        //         "side": "BUY"
        //     }
        //
        // fetchMyTrades spot
        //     {
        //         "tradeId": "4b4bd301-6f20-4e39-a682-ce4f9b8400a0",
        //         "orderId": "2fa9678b-9945-47ce-9ffe-256dc7b4dd8c",
        //         "clOrderID": "test spot market buy",
        //         "username": "romancuhari",
        //         "side": "BUY",
        //         "orderType": 77,
        //         "triggerType": 0,
        //         "price": 1952.05859608,
        //         "size": 0.19520586,
        //         "filledPrice": 1952.05859608,
        //         "filledSize": 0.0001,
        //         "triggerPrice": 0,
        //         "base": "ETH",
        //         "quote": "USDT",
        //         "symbol": "ETH-USDT",
        //         "feeCurrency": "ETH",
        //         "feeAmount": 0.0000002,
        //         "wallet": "SPOT@",
        //         "realizedPnl": 0,
        //         "total": 0,
        //         "serialId": 49071052,
        //         "timestamp": 1770814978685,
        //         "avgFilledPrice": 1952.05859608
        //     }
        //
        // fetchMyTrades swap
        //     {
        //         "tradeId": "b708489a-19d1-4be2-a6c2-f499f76aa176",
        //         "orderId": "5c6a26db-8cfb-45c7-b25d-56927bc36795",
        //         "username": "romancuhari",
        //         "side": "BUY",
        //         "orderType": 77,
        //         "triggerType": null,
        //         "price": 0,
        //         "size": 1,
        //         "filledPrice": 1956.59,
        //         "filledSize": 1,
        //         "triggerPrice": 0,
        //         "base": "ETH",
        //         "quote": "USDT",
        //         "symbol": "ETH-PERP",
        //         "feeCurrency": "USDT",
        //         "feeAmount": 0.00010761,
        //         "wallet": "CROSS@",
        //         "realizedPnl": 0,
        //         "total": -0.00010761,
        //         "serialId": 50953296,
        //         "timestamp": 1770821231984,
        //         "orderDetailType": null,
        //         "contractSize": 0.0001,
        //         "clOrderID": "",
        //         "positionId": "ETH-PERP-USDT",
        //         "avgFilledPrice": 1956.59
        //     }
        //
        // the unified futures rows echo the short symbol form but carry the full
        // market id in positionId, which resolves against the markets snapshot
        const marketId = this.safeString2 (trade, 'positionId', 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'feeAmount');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeStringN (trade, [ 'tradeId', 'serialId', 'id' ]),
            'order': this.safeString (trade, 'orderId'),
            'type': this.parseOrderType (this.safeString2 (trade, 'orderType', 'type')),
            'side': this.safeStringLower2 (trade, 'side', 'orderSide'),
            'takerOrMaker': undefined,
            'price': this.safeStringN (trade, [ 'filledPrice', 'avgFilledPrice', 'price' ]),
            'amount': this.safeString2 (trade, 'filledSize', 'size'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name btse#createOrder
     * @description create a trade order
     * @see https://btsecom.github.io/docs/spotV3_3/en/#create-new-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#create-new-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#create-new-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH'
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at (same as takeProfitPrice)
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'INDEX_PRICE' or 'LAST_PRICE', default is 'LAST_PRICE'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {float} [params.deviation] *PEG orders only* How much should the order price deviate from index price. Value is in percentage and can range from -10 to 10
     * @param {float} [params.stealth] *PEG orders only*  How many percent of the order is to be displayed on the orderbook
     * @param {float} [params.stopPrice] *NB - It is NOT stopLossPrice or triggerPrice!!! OCO orders only* Mandatory when creating an OCO order. Indicates the stop price
     * @param {bool} [params.hedged] *contract markets only* true for hedged mode, false for one way mode, default is false
     * @param {string} [params.marginMode] *contract markets only* 'cross' or 'isolated' (default is 'cross') - the exchange does not have cross/isolated margin modes but instead has 'ONE_WAY', 'HEDGE' and 'ISOLATED' position modes, so this param will be converted to the appropriate position mode
     * @param {string} [params.positionMode] *contract markets only* 'ONE_WAY (default) or 'HEDGE or 'ISOLATED' (if not provided, it will be derived from marginMode and hedged params)
     * @param {object} [params.takeProfit] *contract markets only* *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *contract markets only* take profit trigger price
     * @param {string} [params.takeProfit.priceType] *contract markets only* 'markPrice' or 'lastPrice', default is 'markPrice'
     * @param {object} [params.stopLoss] *contract markets only* *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *contract markets only* stop loss trigger price
     * @param {string} [params.stopLoss.priceType] *contract markets only* 'markPrice' or 'lastPrice', default is 'markPrice'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot'] === true) {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        } else {
            return await this.createContractOrder (symbol, type, side, amount, price, params);
        }
    }

    /**
     * @method
     * @name btse#createSpotOrder
     * @description create a trade order on spot market
     * @see https://docs.btse.com/spot/rest/place-order
     * @see https://docs.btse.com/spot/rest/place-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'OCO', 'PEG', 'TWAP' or 'TRAILING'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately, default is false
     * @param {string} [params.timeInForce] 'GTC', 'IOC' or 'FOK'
     * @param {float} [params.cost] *market buy and trailing buy orders only* the quote quantity that can be used as an alternative for the amount
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at, same as takeProfitPrice
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'last', 'mark' or 'index', default is 'last'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {float} [params.deviation] *PEG orders only* how much should the order price deviate from the pegged price, in percent from -10 to 10
     * @param {float} [params.stealth] *PEG orders only* how many percent of the order is to be displayed on the orderbook, from 1 to 100
     * @param {float} [params.stopPrice] *NB - It is NOT stopLossPrice or triggerPrice!!! OCO orders only* the limit price of the stop loss leg
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createSpotOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        type = type.toUpperCase ();
        const upperSide = (side as string).toUpperCase ();
        const request: Dict = {
            'symbol': market['id'],
            'orderSide': upperSide,
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        const isMarketOrder = (type === 'MARKET');
        const isLimitOrder = (type === 'LIMIT');
        let postOnly = false;
        // exchange-specific postOnly is the same as the unified one
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, postOnly, params); // this will remove PO from params.timeInForce if present
        if (postOnly) {
            request['postOnly'] = true;
        }
        const timeInForce = this.handleTimeInForce (params);
        if (timeInForce !== undefined) {
            request['timeInForce'] = timeInForce;
        }
        const triggerPrice = this.safeString (params, 'triggerPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const isTriggerOrder = (triggerPrice !== undefined) || (takeProfitPrice !== undefined);
        const isStopLossOrder = (stopLossPrice !== undefined);
        const isConditionalOrder = (isTriggerOrder || isStopLossOrder) && (isMarketOrder || isLimitOrder);
        const isAlgoOrder = isConditionalOrder || (!isMarketOrder && !isLimitOrder);
        if (isLimitOrder || (type === 'PEG') || (type === 'OCO')) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for ' + type + ' orders');
            }
        }
        // market and trailing buys are denominated in the quote currency while
        // every other combination is denominated in the base currency, the
        // sizing rules are strict on both sides, verified live
        const needsQuoteSize = (isMarketOrder || (type === 'TRAILING')) && (upperSide === 'BUY');
        if (needsQuoteSize) {
            let quoteAmount = undefined;
            let createMarketBuyOrderRequiresPrice = true;
            [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
            const cost = this.safeString (params, 'cost');
            params = this.omit (params, 'cost');
            if (cost !== undefined) {
                quoteAmount = this.costToPrecision (symbol, cost);
            } else if (createMarketBuyOrderRequiresPrice) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend, alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                } else {
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    quoteAmount = this.costToPrecision (symbol, Precise.stringMul (amountString, priceString));
                }
            } else {
                quoteAmount = this.costToPrecision (symbol, this.numberToString (amount));
            }
            request['quoteOrderSize'] = quoteAmount;
        } else {
            request['orderSize'] = this.amountToPrecision (symbol, amount);
        }
        let response = undefined;
        if (!isAlgoOrder) {
            request['orderType'] = type;
            if (isLimitOrder) {
                request['orderPrice'] = this.priceToPrecision (symbol, price);
            }
            //
            //     [
            //         {
            //             "orderId": "4eca2eb4-e6ad-4355-ae12-5ce757b105b3",
            //             "clOrderId": "",
            //             "status": 2,
            //             "market": "BTC-USD",
            //             "type": 76,
            //             "orderSide": "BUY",
            //             "orderPrice": 61024.1,
            //             "postOnly": false,
            //             "timestamp": 1784891308063,
            //             "orderDetailType": null,
            //             "message": null,
            //             "userQuoteCurrency": "USD",
            //             "orderCurrency": "base",
            //             "originalOrderBaseSize": 0.00001,
            //             "originalOrderQuoteSize": null,
            //             "currentOrderBaseSize": 0.00001,
            //             "currentOrderQuoteSize": null,
            //             "remainingOrderBaseSize": 0.00001,
            //             "remainingOrderQuoteSize": null,
            //             "filledBaseSize": 0,
            //             "totalFilledBaseSize": 0,
            //             "avgFilledPrice": 0,
            //             "time_in_force": "GTC"
            //         }
            //     ]
            //
            response = await this.privatePostSpotApiV4TradeOrders (this.extend (request, params));
        } else {
            if (isConditionalOrder) {
                request['orderType'] = 'CONDITIONAL';
                let triggerOrderType = undefined;
                let triggerPriceToSend = undefined;
                if (isStopLossOrder) {
                    triggerOrderType = 'STOP_LOSS';
                    triggerPriceToSend = stopLossPrice;
                } else {
                    triggerOrderType = 'TAKE_PROFIT';
                    triggerPriceToSend = triggerPrice;
                    if (triggerPriceToSend === undefined) {
                        triggerPriceToSend = takeProfitPrice;
                    }
                }
                if (isLimitOrder) {
                    triggerOrderType = triggerOrderType + '_LIMIT';
                    request['orderPrice'] = this.priceToPrecision (symbol, price);
                }
                request['triggerOrderType'] = triggerOrderType;
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPriceToSend);
                const triggerPriceType = this.safeString (params, 'triggerPriceType', 'last');
                request['triggerPriceType'] = this.encodeTriggerPriceType (triggerPriceType);
                params = this.omit (params, [ 'triggerPrice', 'takeProfitPrice', 'stopLossPrice', 'triggerPriceType' ]);
            } else {
                request['orderType'] = type;
                if (type === 'OCO') {
                    // the price argument is the limit price of the take profit leg,
                    // the stopPrice param is the limit price of the stop loss leg
                    // and the triggerPrice param is where the stop loss leg fires
                    request['takeProfitOrderPrice'] = this.priceToPrecision (symbol, price);
                    const stopPrice = this.safeString (params, 'stopPrice');
                    if (stopPrice !== undefined) {
                        request['stopLossOrderPrice'] = this.priceToPrecision (symbol, stopPrice);
                    }
                    if (triggerPrice !== undefined) {
                        request['stopLossTriggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                    }
                    const triggerPriceType = this.safeString (params, 'triggerPriceType', 'last');
                    request['stopLossTriggerPriceType'] = this.encodeTriggerPriceType (triggerPriceType);
                    params = this.omit (params, [ 'stopPrice', 'triggerPrice', 'triggerPriceType' ]);
                } else if (type === 'PEG') {
                    // the required stealth and optional deviation params pass through
                    request['orderPrice'] = this.priceToPrecision (symbol, price);
                } else if (type === 'TRAILING') {
                    const trailingAmount = this.safeString (params, 'trailingAmount');
                    const trailingPercent = this.safeString (params, 'trailingPercent');
                    if (trailingAmount !== undefined) {
                        request['trailValue'] = this.priceToPrecision (symbol, trailingAmount);
                        request['trailValueType'] = 'DISTANCE';
                    } else if (trailingPercent !== undefined) {
                        request['trailValue'] = trailingPercent;
                        request['trailValueType'] = 'PERCENTAGE';
                    }
                    const triggerPriceType = this.safeString (params, 'triggerPriceType', 'last');
                    request['triggerPriceType'] = this.encodeTriggerPriceType (triggerPriceType);
                    params = this.omit (params, [ 'trailingAmount', 'trailingPercent', 'triggerPriceType' ]);
                }
                // TWAP orders require the timePeriod param which passes through
            }
            response = await this.privatePostSpotApiV4TradeOrdersAlgo (this.extend (request, params));
        }
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name btse#createContractOrder
     * @description create a trade order on contract market
     * @see https://docs.btse.com/futures/rest/place-order
     * @see https://docs.btse.com/futures/rest/place-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'OCO', 'PEG', 'TWAP' or 'TRAILING'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately, default is false
     * @param {bool} [params.reduceOnly] if true, the order will only reduce a current position, not increase it, default is false
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO', 'HALFSEC', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH'
     * @param {bool} [params.hedged] true for hedged mode, false for one way mode, default is false
     * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross' - the exchange does not have cross/isolated margin modes but instead has 'ONE_WAY', 'HEDGE' and 'ISOLATED' position modes, so this param will be converted to the appropriate position mode
     * @param {string} [params.positionMode] 'ONE_WAY', 'HEDGE' or 'ISOLATED' - if not provided, it will be derived from the marginMode and hedged params
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at, same as takeProfitPrice
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'last', 'mark' or 'index', default is 'mark'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {string} [params.takeProfit.priceType] 'last', 'mark' or 'index', default is 'mark'
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.stopLoss.priceType] 'last', 'mark' or 'index', default is 'mark'
     * @param {float} [params.deviation] *PEG orders only* the offset applied to the pegged reference price
     * @param {float} [params.stealth] *PEG orders only* the portion of the order size displayed on the book
     * @param {float} [params.stopPrice] *NB - It is NOT the stopLossPrice!!! OCO orders only* the limit price of the stop loss leg
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createContractOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        type = type.toUpperCase ();
        const request: Dict = {
            'symbol': this.futuresRequestId (market),
            'orderSide': (side as string).toUpperCase (),
            'orderSize': this.amountToPrecision (symbol, amount),
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        // handle positionMode
        const positionMode = this.safeString (params, 'positionMode');
        // if positionMode is provided, we will get it from params and send it as is
        if (positionMode === undefined) {
            let hedged = false;
            [ hedged, params ] = this.handleOptionAndParams (params, 'createOrder', 'hedged', hedged);
            let marginMode = 'cross';
            [ marginMode, params ] = this.handleOptionAndParams (params, 'createOrder', 'marginMode', marginMode);
            if (marginMode === 'isolated') {
                if (hedged) {
                    throw new BadRequest (this.id + ' createOrder() cannot use isolated margin with hedged positions');
                }
                request['positionMode'] = 'ISOLATED';
            } else if (hedged) {
                request['positionMode'] = 'HEDGE';
            }
            // if not hedged and not isolated, the default is ONE_WAY
        }
        const isMarketOrder = (type === 'MARKET');
        const isLimitOrder = (type === 'LIMIT');
        let postOnly = false;
        // exchange-specific postOnly is the same as the unified one
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, postOnly, params); // this will remove PO from params.timeInForce if present
        if (postOnly) {
            request['postOnly'] = true;
        }
        const timeInForce = this.handleTimeInForce (params);
        if (timeInForce !== undefined) {
            request['timeInForce'] = timeInForce;
        }
        const triggerPrice = this.safeString (params, 'triggerPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const isTriggerOrder = (triggerPrice !== undefined) || (takeProfitPrice !== undefined);
        const isStopLossOrder = (stopLossPrice !== undefined);
        const isConditionalOrder = (isTriggerOrder || isStopLossOrder) && (isMarketOrder || isLimitOrder);
        const isAlgoOrder = isConditionalOrder || (!isMarketOrder && !isLimitOrder);
        if (isLimitOrder || (type === 'OCO')) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for ' + type + ' orders');
            }
        }
        // here we handling with attached take profit and stop loss orders
        const takeProfit = this.safeDict (params, 'takeProfit');
        const stopLoss = this.safeDict (params, 'stopLoss');
        if ((takeProfit !== undefined) || (stopLoss !== undefined)) {
            const takeProfitTriggerPrice = this.safeString (takeProfit, 'triggerPrice');
            const stopLossTriggerPrice = this.safeString (stopLoss, 'triggerPrice');
            if (takeProfitTriggerPrice !== undefined) {
                request['takeProfitTriggerPrice'] = this.priceToPrecision (symbol, takeProfitTriggerPrice);
                const takeProfitTriggerPriceType = this.safeString (takeProfit, 'priceType');
                if (takeProfitTriggerPriceType !== undefined) {
                    request['takeProfitTriggerType'] = this.encodeTriggerPriceType (takeProfitTriggerPriceType);
                }
            }
            if (stopLossTriggerPrice !== undefined) {
                request['stopLossTriggerPrice'] = this.priceToPrecision (symbol, stopLossTriggerPrice);
                const stopLossTriggerPriceType = this.safeString (stopLoss, 'priceType');
                if (stopLossTriggerPriceType !== undefined) {
                    request['stopLossTriggerType'] = this.encodeTriggerPriceType (stopLossTriggerPriceType);
                }
            }
            params = this.omit (params, [ 'takeProfit', 'stopLoss' ]);
        }
        let response = undefined;
        if (!isAlgoOrder) {
            request['orderType'] = type;
            if (isLimitOrder) {
                request['orderPrice'] = this.priceToPrecision (symbol, price);
            }
            //
            //     {
            //         "status": 2,
            //         "type": 0,
            //         "symbol": "BTC-PERP",
            //         "postOnly": false,
            //         "orderSide": "BUY",
            //         "orderId": "0251ea47-88b5-48c0-aeb3-b38774fd1f90",
            //         "clOrderID": "",
            //         "timestamp": 1784882344361,
            //         "price": 57009.5,
            //         "avgFilledPrice": 0,
            //         "message": null,
            //         "originalOrderSize": 1,
            //         "currentOrderSize": 1,
            //         "filledSize": 0,
            //         "totalFilledSize": 0,
            //         "remainingSize": 1,
            //         "positionMode": "ONE_WAY",
            //         "positionDirection": null,
            //         "positionId": "BTC-PERP-USDT",
            //         "timeInForce": "GTC"
            //     }
            //
            response = await this.privatePostFuturesApiV3TradeOrders (this.extend (request, params));
        } else {
            if (isConditionalOrder) {
                // the futures conditional variant has no trigger direction field,
                // it takes a plain trigger price with an optional limit price
                request['orderType'] = 'CONDITIONAL';
                let triggerPriceToSend = triggerPrice;
                if (triggerPriceToSend === undefined) {
                    triggerPriceToSend = takeProfitPrice;
                }
                if (triggerPriceToSend === undefined) {
                    triggerPriceToSend = stopLossPrice;
                }
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPriceToSend);
                const triggerPriceType = this.safeString (params, 'triggerPriceType', 'mark');
                request['triggerType'] = this.encodeTriggerPriceType (triggerPriceType);
                if (isLimitOrder) {
                    request['orderPrice'] = this.priceToPrecision (symbol, price);
                }
                params = this.omit (params, [ 'triggerPrice', 'takeProfitPrice', 'stopLossPrice', 'triggerPriceType' ]);
            } else {
                request['orderType'] = type;
                if (type === 'OCO') {
                    // the price argument is the limit price of the take profit leg,
                    // the stopPrice param is the limit price of the stop loss leg
                    // and the triggerPrice param is where the stop loss leg fires
                    request['takeProfitOrderPrice'] = this.priceToPrecision (symbol, price);
                    const stopPrice = this.safeString (params, 'stopPrice');
                    if (stopPrice !== undefined) {
                        request['stopLossOrderPrice'] = this.priceToPrecision (symbol, stopPrice);
                    }
                    if (triggerPrice !== undefined) {
                        request['stopLossTriggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                    }
                    const triggerPriceType = this.safeString (params, 'triggerPriceType', 'mark');
                    request['stopLossTriggerType'] = this.encodeTriggerPriceType (triggerPriceType);
                    params = this.omit (params, [ 'stopPrice', 'triggerPrice', 'triggerPriceType' ]);
                } else if (type === 'PEG') {
                    // the required deviation and stealth params pass through, the
                    // optional price argument becomes a worst-price bound
                    if (price !== undefined) {
                        request['orderPrice'] = this.priceToPrecision (symbol, price);
                    }
                } else if (type === 'TRAILING') {
                    const trailingAmount = this.safeString (params, 'trailingAmount');
                    const trailingPercent = this.safeString (params, 'trailingPercent');
                    if (trailingAmount !== undefined) {
                        request['trailValue'] = this.priceToPrecision (symbol, trailingAmount);
                        request['trailValueType'] = 'DISTANCE';
                    } else if (trailingPercent !== undefined) {
                        request['trailValue'] = trailingPercent;
                        request['trailValueType'] = 'PERCENTAGE';
                    }
                    const triggerPriceType = this.safeString (params, 'triggerPriceType', 'mark');
                    request['trailTriggerPriceType'] = this.encodeTriggerPriceType (triggerPriceType);
                    params = this.omit (params, [ 'trailingAmount', 'trailingPercent', 'triggerPriceType' ]);
                }
                // TWAP orders require the timePeriod param which passes through
            }
            response = await this.privatePostFuturesApiV3TradeOrdersAlgo (this.extend (request, params));
        }
        // the normal futures endpoint responds with a single order dict, keep a
        // one element array guard in case a gateway wraps it
        let order = response;
        if (Array.isArray (response)) {
            order = this.safeDict (response, 0, {});
        }
        return this.parseOrder (order, market);
    }

    encodeTriggerPriceType (priceType: Str) {
        const priceTypes = {
            'last': 'LAST_PRICE',
            'mark': 'MARK_PRICE',
            'index': 'INDEX_PRICE',
            'lastPrice': 'LAST_PRICE',
            'markPrice': 'MARK_PRICE',
            'indexPrice': 'INDEX_PRICE',
        };
        return this.safeString (priceTypes, priceType, priceType);
    }

    /**
     * @method
     * @name btse#fetchOpenOrder
     * @description fetches information on an open order made by the user
     * @see https://docs.btse.com/spot/rest/get-order
     * @see https://docs.btse.com/futures/rest/get-orders
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {string} [params.type] 'spot', 'swap' or 'future', default is 'spot'
     * @param {bool} [params.includeCancelled] *contract markets only* if true, cancelled orders are included in the lookup
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        } else if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrder() requires an id argument or a clientOrderId parameter');
        } else {
            request['orderId'] = id;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetSpotApiV4TradeOrder (this.extend (request, params));
        } else {
            // the futures endpoint doubles as the single order lookup when an
            // order id is sent and responds with a bare array
            response = await this.privateGetFuturesApiV3TradeOrders (this.extend (request, params));
        }
        // accept a bare order dict, a data envelope and a one element array
        let order = this.safeValue (response, 'data', response);
        if (Array.isArray (order)) {
            order = this.safeDict (order, 0, {});
        }
        return this.parseOrder (order as any, market);
    }

    /**
     * @method
     * @name btse#editOrder
     * @description edit a trade order
     * @see https://docs.btse.com/spot/rest/amend-order
     * @see https://docs.btse.com/futures/rest/amend-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' (not used by btse)
     * @param {string} side 'buy' or 'sell' (not used by btse)
     * @param {float} [amount] how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order, required if id is not provided
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {bool} [params.totalAmountMode] if true, the amount is treated as the new total order quantity including the already filled portion, default is false
     * @param {bool} [params.slide] *contract markets only* if true and only the price is amended, the price slides to the best available price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        } else if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an id argument or a clientOrderId parameter');
        } else {
            request['orderId'] = id;
        }
        const triggerPrice = this.safeString (params, 'triggerPrice');
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            params = this.omit (params, 'triggerPrice');
        }
        if (amount !== undefined) {
            request['orderSize'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const isSlide = this.safeBool (params, 'slide', false);
        if ((amount === undefined) && (price === undefined) && (triggerPrice === undefined) && (isSlide !== true)) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount argument, a price argument or a triggerPrice parameter');
        }
        let response = undefined;
        if (market['spot'] === true) {
            request['symbol'] = market['id'];
            response = await this.privatePutSpotApiV4TradeOrders (this.extend (request, params));
        } else {
            // the futures amend requires an explicit amendType discriminator
            // which can change the price and size together or a single field
            request['symbol'] = this.futuresRequestId (market);
            if (triggerPrice !== undefined) {
                if ((amount !== undefined) || (price !== undefined)) {
                    throw new BadRequest (this.id + ' editOrder() can not amend the trigger price together with the price or the amount on contract markets');
                }
                request['amendType'] = 'TRIGGER_PRICE';
            } else if ((amount !== undefined) && (price !== undefined)) {
                request['amendType'] = 'ALL';
            } else if (amount !== undefined) {
                request['amendType'] = 'SIZE';
            } else {
                request['amendType'] = 'PRICE';
            }
            response = await this.privatePutFuturesApiV3TradeOrders (this.extend (request, params));
        }
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name btse#cancelOrder
     * @see https://docs.btse.com/spot/rest/cancel-order
     * @see https://docs.btse.com/futures/rest/cancel-order
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order, required if id is not provided
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        } else if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an id argument or a clientOrderId parameter');
        } else {
            request['orderId'] = id;
        }
        let response = undefined;
        if (market['spot'] === true) {
            request['symbol'] = market['id'];
            response = await this.privateDeleteSpotApiV4TradeOrders (this.extend (request, params));
        } else {
            //
            //     [
            //         {
            //             "orderId": "0251ea47-88b5-48c0-aeb3-b38774fd1f90",
            //             "clOrderId": "",
            //             "symbol": "BTC-PERP",
            //             "orderSide": "BUY",
            //             "type": 76,
            //             "orderPrice": 56439.4,
            //             "orderSize": 1,
            //             "filledSize": 0,
            //             "status": 6,
            //             "timestamp": 1784882344500
            //         }
            //     ]
            //
            request['symbol'] = this.futuresRequestId (market);
            response = await this.privateDeleteFuturesApiV3TradeOrders (this.extend (request, params));
        }
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name btse#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://docs.btse.com/spot/rest/cancel-all-orders
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#cancel-order
     * @param {string} [symbol] unified market symbol of the market to cancel orders in, on spot markets omit it to cancel every open order across all pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future', default is 'spot', used when the symbol is omitted
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params, marketType);
        const request: Dict = {};
        let response = undefined;
        if (marketType === 'spot') {
            // the literal ALL value cancels every open order across all pairs
            request['symbol'] = (market !== undefined) ? market['id'] : 'ALL';
            response = await this.privateDeleteSpotApiV4TradeOrdersAll (this.extend (request, params));
        } else {
            if (market === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument for contract markets');
            }
            // the unified futures api has no cancel all endpoint, the legacy
            // endpoint cancels every order for the symbol when no order id is
            // sent, and it identifies contracts by the short symbol form
            request['symbol'] = this.futuresRequestId (market);
            response = await this.privateDeleteFuturesApiV23Order (this.extend (request, params));
        }
        return this.parseOrders (response, market);
    }

    /**
     * @method
     * @name btse#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://docs.btse.com/spot/rest/cancel-all-after
     * @see https://docs.btse.com/futures/rest/cancel-all-after
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future', default is 'spot'
     * @returns {object} the api result
     */
    override async cancelAllOrdersAfter (timeout: Int, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        let response = undefined;
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrdersAfter', undefined, params, marketType);
        if (marketType === 'spot') {
            request['timeout'] = timeout;
            response = await this.privatePostSpotApiV4TradeOrdersCancelAllAfter (this.extend (request, params));
        } else {
            // the futures param is named timeoutMs and is required, zero disarms
            request['timeoutMs'] = timeout;
            response = await this.privatePostFuturesApiV3TradeOrdersCancelAllAfter (this.extend (request, params));
        }
        return response;
    }

    /**
     * @method
     * @name btse#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.btse.com/spot/rest/get-orders
     * @see https://docs.btse.com/futures/rest/get-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for, filtered client-side
     * @param {int} [limit] the maximum number of open orders structures to retrieve, filtered client-side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future', default is 'spot'
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            if (market !== undefined) {
                request['symbol'] = market['id'];
            }
            response = await this.privateGetSpotApiV4TradeOrders (this.extend (request, params));
        } else {
            if (market !== undefined) {
                request['symbol'] = this.futuresRequestId (market);
            }
            response = await this.privateGetFuturesApiV3TradeOrders (this.extend (request, params));
        }
        // the endpoints have no server side time filters, accept a bare array
        // and a data envelope and filter client-side
        const rows = this.safeList (response, 'data', response as any);
        return this.parseOrders (rows, market, since, limit);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder - spot
        //     {
        //         "status": 2,
        //         "symbol": "ETH-USDT",
        //         "orderType": 76,
        //         "price": 1000,
        //         "side": "BUY",
        //         "orderID": "cde4fb37-2e2b-437e-a816-4b55b2e2b7c7",
        //         "timestamp": 1770813053751,
        //         "triggerPrice": 0,
        //         "stopPrice": null,
        //         "trigger": false,
        //         "message": "",
        //         "clOrderID": null,
        //         "stealth": 1,
        //         "deviation": 1,
        //         "postOnly": false,
        //         "orderDetailType": null,
        //         "originalOrderBaseSize": 0.0001,
        //         "originalOrderQuoteSize": null,
        //         "currentOrderBaseSize": 0.0001,
        //         "currentOrderQuoteSize": null,
        //         "remainingOrderBaseSize": 0.0001,
        //         "remainingOrderQuoteSize": null,
        //         "filledBaseSize": 0,
        //         "totalFilledBaseSize": 0,
        //         "orderCurrency": "base",
        //         "avgFilledPrice": 0,
        //         "time_in_force": "GTC"
        //     }
        //
        // createOrder - swap
        //     {
        //         "status": 4,
        //         "symbol": "ETH-PERP",
        //         "orderType": 77,
        //         "price": 1956.59,
        //         "side": "BUY",
        //         "orderID": "5c6a26db-8cfb-45c7-b25d-56927bc36795",
        //         "timestamp": 1770821231984,
        //         "triggerPrice": 0,
        //         "trigger": false,
        //         "deviation": 100,
        //         "stealth": 100,
        //         "message": "",
        //         "avgFilledPrice": 1956.59,
        //         "clOrderID": "",
        //         "originalOrderSize": 1,
        //         "currentOrderSize": 1,
        //         "filledSize": 1,
        //         "totalFilledSize": 1,
        //         "remainingSize": 0,
        //         "postOnly": false,
        //         "orderDetailType": null,
        //         "positionMode": "ONE_WAY",
        //         "positionDirection": null,
        //         "positionId": "ETH-PERP-USDT",
        //         "time_in_force": "GTC"
        //     }
        //
        const marketId = this.safeString2 (order, 'symbol', 'market');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'timestamp');
        // open_orders rows carry no numeric status - the state lives in
        // orderState (STATUS_ACTIVE / STATUS_INACTIVE), and time_in_force
        // is spelled timeInForce there (observed live), so both fall back
        const rawStatus = this.safeString2 (order, 'status', 'orderState');
        const rawType = this.safeString2 (order, 'orderType', 'type');
        let status = this.parseOrderStatus (rawStatus);
        const orderType = this.parseOrderType (rawType);
        if ((orderType === 'market') && (status === 'open')) {
            // market orders never rest on the book, the exchange reports the
            // partially filled code on them when a residual quote dust amount
            // cannot fill, observed live, such orders are finished
            status = 'closed';
        }
        const rawTimeInForce = this.safeString2 (order, 'time_in_force', 'timeInForce');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'orderID', 'orderId'),
            'clientOrderId': this.safeString2 (order, 'clOrderID', 'clOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': orderType,
            'timeInForce': this.parseTimeInForce (rawTimeInForce),
            'postOnly': this.safeBool (order, 'postOnly'),
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': this.safeStringLower2 (order, 'side', 'orderSide'),
            'price': this.safeString2 (order, 'price', 'orderPrice'),
            'triggerPrice': this.omitZero (this.safeString2 (order, 'triggerOriginalPrice', 'triggerPrice')),
            'stopLossPrice': undefined, // todo check
            'takeProfitPrice': undefined, // todo check
            'amount': this.safeStringN (order, [ 'currentOrderBaseSize', 'currentOrderSize', 'orderSize' ]),
            'filled': this.safeStringN (order, [ 'totalFilledBaseSize', 'totalFilledSize', 'filledSize' ]),
            'remaining': this.safeString2 (order, 'remainingOrderBaseSize', 'remainingSize'),
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'average': this.omitZero (this.safeString2 (order, 'avgFilledPrice', 'averageFillPrice')),
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses = {
            '2': 'open', // Order Inserted
            '3': 'closed', // Order Transacted
            '4': 'closed', // Order Fully Transacted
            '5': 'open', // Order Partially Transacted
            '6': 'canceled', // Order Cancelled
            '7': 'refunded', // Order Refunded
            '8': 'rejected', // Insufficient Balance
            '9': 'open', // Trigger Inserted
            '10': 'open', // Trigger Activated
            '15': 'rejected', // Order Rejected
            '16': 'rejected', // Order Not Found
            '17': 'rejected', // Request Failed
            '123': 'open', // AMEND_ORDER = Order amended
            'STATUS_ACTIVE': 'open', // open_orders orderState, observed live
            'STATUS_INACTIVE': 'canceled', // open_orders orderState
            'ORDER_INSERTED': 'open', // single order lookup orderState, observed live
            'ORDER_PARTIALLY_TRANSACTED': 'open', // by analogy with the numeric codes
            'ORDER_FULLY_TRANSACTED': 'closed', // by analogy with the numeric codes
            'ORDER_CANCELLED': 'canceled', // by analogy with the numeric codes
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str) {
        const types = {
            // the unified futures place order response reports a degenerate 0
            // in the type field regardless of the real order type, observed
            // live, the value is deliberately left unmapped and passes through
            '76': 'limit', // Limit order
            '77': 'market', // Market order
            '80': 'limit', // Peg/Algo order
        };
        return this.safeString (types, type, type);
    }

    parseTimeInForce (timeInForce: Str) {
        const values = {
            'GTC': 'GTC',
            'IOC': 'IOC',
            'FOK': 'FOK',
            'HALFSEC': 'GTD',
            'HALFMIN': 'GTD',
            'FIVEMIN': 'GTD',
            'HOUR': 'GTD',
            'TWELVEHOUR': 'GTD',
            'DAY': 'GTD',
            'WEEK': 'GTD',
            'MONTH': 'GTD',
        };
        return this.safeString (values, timeInForce, timeInForce);
    }

    /**
     * @method
     * @name btse#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.btse.com/spot/rest/get-fees
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-account-fee
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future' (default is 'spot')
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    override async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        let response = undefined;
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTradingFees', undefined, params, marketType);
        if (marketType === 'spot') {
            response = await this.privateGetSpotApiV4TradeFees (params);
        } else {
            // the futures fees stay on the legacy endpoint, the unified futures
            // api has no fees route
            response = await this.privateGetFuturesApiV23UserFees (params);
        }
        //
        //     [
        //         {
        //             "symbol": "FUSD-USD",
        //             "makerFee": 0.002,
        //             "takerFee": 0.002
        //         }
        //     ]
        //
        const rows = this.safeList (response, 'data', response as any);
        const responseList = this.arrayConcat ([], rows);
        const result: Dict = {};
        for (let i = 0; i < responseList.length; i++) {
            const feeInfo = responseList[i];
            const marketId = this.safeString (feeInfo, 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const makerFee = this.safeNumber (feeInfo, 'makerFee');
            const takerFee = this.safeNumber (feeInfo, 'takerFee');
            result[symbol] = {
                'info': feeInfo,
                'symbol': symbol,
                'maker': makerFee,
                'taker': takerFee,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async requestWalletHistoryRows (methodName: string, historyTypes: string[], code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        // the helper always receives a non empty history type list, the list is
        // rebuilt through safeList so the transpilers treat it as an array in
        // every runtime
        const typesList = this.safeList ({ 'types': historyTypes }, 'types', []);
        await this.loadMarkets ();
        const walletType = this.safeString (params, 'walletType', 'SPOT');
        const request: Dict = {
            'walletType': walletType,
        };
        // the endpoint applies a server side history type filter sent as a
        // json encoded array in the query string, verified live
        request['historyTypes'] = this.json (typesList);
        params = this.omit (params, 'walletType');
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        } else if (walletType === 'SPOT') {
            // the exchange rejects spot wallet history queries without an asset,
            // verified live, and omitting walletType still defaults to spot
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a code argument for the spot wallet history');
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.privateGetPublicApiWalletV1UserWalletHistory (this.extend (request, params));
        //
        //     {
        //         "code": 1,
        //         "msg": "Success",
        //         "time": 1786624541092,
        //         "data": [
        //             {
        //                 "transactionTime": 1786510157962,
        //                 "type": "DEPOSIT",
        //                 "walletName": "SPOT@",
        //                 "asset": "USDT",
        //                 "netAmount": "100",
        //                 "amount": "100",
        //                 "transactionRef": "2026081200000367",
        //                 "status": "COMPLETED",
        //                 "description": null,
        //                 "fees": "0",
        //                 "cryptoNetwork": "ERC20",
        //                 "toAddress": "0x36bd7cbc486658c9777672fe742971bda65d5e6f",
        //                 "confirmTimes": "(15/15)",
        //                 "txId": "0xb4d88986d013f799d78e6232792c44b45dff1213a015171ddcf4adfcd283b3fd"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const rawRows = this.safeList (response, 'data', response as any);
        // the requested types are also filtered client side over both the legacy
        // and the unified enum vocabularies as the legacy endpoint ignored the
        // filter and returned the whole mixed ledger
        const allowed: Dict = {};
        for (let i = 0; i < typesList.length; i++) {
            const historyType = typesList[i];
            allowed[historyType] = true;
            allowed[this.capitalize (historyType.toLowerCase ())] = true;
        }
        const rows = [];
        for (let i = 0; i < rawRows.length; i++) {
            const entry = rawRows[i];
            const type = this.safeString (entry, 'type', '');
            if (type in allowed) {
                rows.push (entry);
            }
        }
        return [ rows, currency ] as any;
    }

    /**
     * @method
     * @name btse#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.btse.com/wallet/rest/get-user-wallet-history
     * @param {string} [code] unified currency code, required for the default spot wallet
     * @param {int} [since] the earliest time in ms to fetch transactions for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transactions for, excluded
     * @param {string} [params.walletType] wallet to query, SPOT by default, ISOLATED requires params.walletName
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        const [ rows, currency ] = await this.requestWalletHistoryRows ('fetchDepositsWithdrawals', [ 'DEPOSIT', 'WITHDRAW' ], code, since, limit, params);
        return this.parseTransactions (rows, currency, since, limit);
    }

    /**
     * @method
     * @name btse#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.btse.com/wallet/rest/get-user-wallet-history
     * @param {string} [code] unified currency code, required for the default spot wallet
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for, excluded
     * @param {string} [params.walletType] wallet to query, SPOT by default, ISOLATED requires params.walletName
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        const [ rows, currency ] = await this.requestWalletHistoryRows ('fetchDeposits', [ 'DEPOSIT' ], code, since, limit, params);
        return this.parseTransactions (rows, currency, since, limit);
    }

    /**
     * @method
     * @name btse#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.btse.com/wallet/rest/get-user-wallet-history
     * @param {string} [code] unified currency code, required for the default spot wallet
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for, excluded
     * @param {string} [params.walletType] wallet to query, SPOT by default, ISOLATED requires params.walletName
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        const [ rows, currency ] = await this.requestWalletHistoryRows ('fetchWithdrawals', [ 'WITHDRAW' ], code, since, limit, params);
        return this.parseTransactions (rows, currency, since, limit);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "username": "user",
        //         "orderId": "2026081200000367",
        //         "wallet": "SPOT@",
        //         "currency": "USDT",
        //         "type": "Deposit",
        //         "amount": 100,
        //         "fees": 0,
        //         "description": "",
        //         "timestamp": 1786510157962,
        //         "status": "PROCESSING",
        //         "txId": "",
        //         "toAddress": "0x0000000000000000000000000000000000000000",
        //         "currencyNetwork": "",
        //         "sourceCurrency": "USDT",
        //         "sourceAmount": 0,
        //         "targetCurrency": "",
        //         "targetAmount": 0,
        //         "rate": 0
        //     }
        //
        const currencyId = this.safeString2 (transaction, 'currency', 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger2 (transaction, 'timestamp', 'transactionTime');
        const networkId = this.safeString2 (transaction, 'currencyNetwork', 'cryptoNetwork');
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'orderId', 'transactionRef'),
            'txid': this.safeString (transaction, 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId, code),
            'address': this.safeString (transaction, 'toAddress'),
            'addressTo': this.safeString (transaction, 'toAddress'),
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': this.parseTransactionType (this.safeString (transaction, 'type')),
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': undefined,
            'internal': undefined,
            'comment': this.safeString (transaction, 'description'),
            'fee': {
                'currency': code,
                'cost': this.safeNumber2 (transaction, 'fees', 'fee'),
            },
        } as Transaction;
    }

    parseTransactionType (type: Str): Str {
        const types: Dict = {
            'Deposit': 'deposit', // legacy wallet api
            'Withdraw': 'withdrawal', // legacy wallet api
            'DEPOSIT': 'deposit', // unified wallet api
            'WITHDRAW': 'withdrawal', // unified wallet api
        };
        return this.safeString (types, type, type);
    }

    parseTransactionStatus (status: Str): Str {
        // the full enum from the wallet documentation, PROCESSING is also live-verified
        const statuses: Dict = {
            'PROCESSING': 'pending',
            'PENDING': 'pending',
            'COMPLETED': 'ok',
            'CANCELLED': 'canceled',
            'EXPIRED': 'canceled',
            'FAILURE': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name btse#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://docs.btse.com/wallet/rest/get-user-wallet-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch ledger entries for
     * @param {int} [limit] the maximum number of ledger entry structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch ledger entries for, excluded
     * @param {string} [params.walletType] wallet to query, SPOT by default, ISOLATED requires params.walletName
     * @returns {object[]} a list of [ledger structures]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    override async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        const walletType = this.safeString (params, 'walletType', 'SPOT');
        request['walletType'] = walletType;
        params = this.omit (params, 'walletType');
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        } else if (walletType === 'SPOT') {
            // the exchange rejects spot wallet history queries without an asset,
            // verified live, and omitting walletType still defaults to spot
            throw new ArgumentsRequired (this.id + ' fetchLedger() requires a code argument for the spot wallet history');
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.privateGetPublicApiWalletV1UserWalletHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "transactionTime": 1786510157962,
        //             "type": "DEPOSIT",
        //             "walletName": "SPOT@",
        //             "asset": "USDT",
        //             "netAmount": "100",
        //             "amount": "100",
        //             "transactionRef": "2026081200000367",
        //             "status": "PROCESSING",
        //             "description": "",
        //             "fee": "0",
        //             "cryptoNetwork": "",
        //             "toAddress": "0x0000000000000000000000000000000000000000",
        //             "confirmTimes": "",
        //             "txId": ""
        //         }
        //     ]
        //
        const rows = this.safeList (response, 'data', response as any);
        return this.parseLedger (rows, currency, since, limit);
    }

    override parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        const currencyId = this.safeString2 (item, 'currency', 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger2 (item, 'timestamp', 'transactionTime');
        const type = this.safeString (item, 'type');
        return {
            'info': item,
            'id': this.safeString2 (item, 'orderId', 'transactionRef'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': this.parseLedgerEntryDirection (type),
            'account': this.safeString2 (item, 'wallet', 'walletName'),
            'referenceId': this.safeString (item, 'txId'),
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType (type),
            'currency': code,
            'amount': this.safeNumber (item, 'amount'),
            'before': undefined,
            'after': undefined,
            'status': this.parseTransactionStatus (this.safeString (item, 'status')),
            'fee': {
                'currency': code,
                'cost': this.safeNumber2 (item, 'fees', 'fee'),
            },
        } as LedgerEntry;
    }

    parseLedgerEntryType (type: Str): Str {
        const types: Dict = {
            'Deposit': 'transaction',
            'Withdraw': 'transaction',
            'Convert fiat': 'trade',
            'Transfer_Out': 'transfer',
            'Transfer_In': 'transfer',
            'ReferralEarning': 'referral',
            'Sub Account Transfer In': 'transfer',
            'Sub Account Transfer Out': 'transfer',
            'express buy': 'trade',
            'spot trading fee rebate': 'rebate',
            'futures trading fee rebate': 'rebate',
            'general trading fee rebate': 'rebate',
            'DEPOSIT': 'transaction', // unified wallet api enums below
            'WITHDRAW': 'transaction',
            'CONVERT': 'trade',
            'ASSET_CONVERSION': 'trade',
            'SEND': 'transfer',
            'RECEIVE': 'transfer',
            'REFERRAL': 'referral',
            'TRANSFER_IN': 'transfer',
            'TRANSFER_OUT': 'transfer',
            'SUB_ACCOUNT_TRANSFER_IN': 'transfer',
            'SUB_ACCOUNT_TRANSFER_OUT': 'transfer',
            'REALIZED_PNL': 'trade',
            'FUNDING': 'fee',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntryDirection (type: Str): Str {
        const directions: Dict = {
            'Deposit': 'in',
            'Withdraw': 'out',
            'Transfer_Out': 'out',
            'Transfer_In': 'in',
            'ReferralEarning': 'in',
            'Sub Account Transfer In': 'in',
            'Sub Account Transfer Out': 'out',
            'spot trading fee rebate': 'in',
            'futures trading fee rebate': 'in',
            'general trading fee rebate': 'in',
            'trial fund': 'in',
            'token voucher in': 'in',
            'token voucher out': 'out',
            'Strategy Income': 'in',
            'Strategy Pay': 'out',
            'DEPOSIT': 'in', // unified wallet api enums below
            'WITHDRAW': 'out',
            'RECEIVE': 'in',
            'SEND': 'out',
            'REFERRAL': 'in',
            'GET_PAID': 'in',
            'PAID': 'out',
            'TRANSFER_IN': 'in',
            'TRANSFER_OUT': 'out',
            'SUB_ACCOUNT_TRANSFER_IN': 'in',
            'SUB_ACCOUNT_TRANSFER_OUT': 'out',
            'INVEST': 'out',
            'REDEEM': 'in',
        };
        return this.safeString (directions, type);
    }

    /**
     * @method
     * @name btse#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.btse.com/spot/rest/get-fees
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-account-fee
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    override async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot'] === true) {
            response = await this.privateGetSpotApiV4TradeFees (this.extend (request, params));
        } else {
            // the futures fees stay on the legacy endpoint, the unified futures
            // api has no fees route
            response = await this.privateGetFuturesApiV23UserFees (this.extend (request, params));
        }
        const rows = this.safeList (response, 'data', response as any);
        const feeInfo = this.safeDict (rows, 0, {});
        const makerFee = this.safeNumber (feeInfo, 'makerFee');
        const takerFee = this.safeNumber (feeInfo, 'takerFee');
        return {
            'info': feeInfo,
            'symbol': symbol,
            'maker': makerFee,
            'taker': takerFee,
            'percentage': true,
            'tierBased': true,
        };
    }

    /**
     * @method
     * @name btse#fetchPositions
     * @description fetch all open positions
     * @see https://docs.btse.com/futures/rest/get-positions/
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.privateGetFuturesApiV3TradePositions (params);
        //
        // the response is a bare array of position rows
        //
        let rows = this.safeList (response, 'data') as any;
        if (rows === undefined) {
            rows = response;
        }
        return this.parsePositions (rows, symbols);
    }

    /**
     * @method
     * @name btse#fetchPositionsForSymbol
     * @description fetch open positions for a single market
     * @see https://docs.btse.com/futures/rest/get-positions/
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.extend ({
            'symbol': this.futuresRequestId (market),
        }, params);
        return await this.fetchPositions ([ symbol ], params);
    }

    override parsePosition (position: Dict, market: Market = undefined) {
        //
        //     {
        //         "marginType": 91,
        //         "entryPrice": 1968.78,
        //         "markPrice": 1967.47829431,
        //         "symbol": "ETH-PERP",
        //         "side": "BUY",
        //         "orderValue": 3.93495658,
        //         "settleWithAsset": "USDT",
        //         "unrealizedProfitLoss": -0.00260341,
        //         "totalMaintenanceMargin": 0.0218963,
        //         "size": 20,
        //         "liquidationPrice": 0,
        //         "isolatedLeverage": 25,
        //         "adlScoreBucket": 1,
        //         "contractSize": 0.0001,
        //         "liquidationInProgress": false,
        //         "timestamp": 1770880518034,
        //         "takeProfitOrder": {
        //             "orderId": "18b4056a-59de-424a-843e-c2df5c9f7265",
        //             "side": "SELL",
        //             "triggerPrice": 2500,
        //             "triggerUseLastPrice": false
        //         },
        //         "stopLossOrder": {
        //             "orderId": "e7ef1035-0773-446d-9a80-2de0e1de2c13",
        //             "side": "SELL",
        //             "triggerPrice": 1000,
        //             "triggerUseLastPrice": false
        //         },
        //         "positionMode": "ONE_WAY",
        //         "positionDirection": null,
        //         "positionId": "ETH-PERP-USDT",
        //         "walletName": "CROSS@",
        //         "currentLeverage": 0.2,
        //         "minimumRequiredMargin": 0
        //     }
        //
        // rows echo the short symbol form, while positionId carries the full market
        // id, optionally suffixed with the isolated wallet discriminator after a pipe
        let marketId = this.safeString (position, 'positionId');
        if (marketId !== undefined) {
            const parts = marketId.split ('|');
            marketId = this.safeString (parts, 0);
        } else {
            marketId = this.safeString (position, 'symbol');
        }
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (position, 'timestamp');
        const marginType = this.safeString (position, 'marginType');
        const side = this.safeStringLower2 (position, 'positionDirection', 'side');
        const positionMode = this.safeString (position, 'positionMode');
        const hedged = (positionMode === 'HEDGE') || (positionMode === 'ISOLATED');
        const takeProfitOrder = this.safeDict (position, 'takeProfitOrder', {});
        const takeProfitPrice = this.safeString (takeProfitOrder, 'triggerPrice');
        const stopLossOrder = this.safeDict (position, 'stopLossOrder', {});
        const stopLossPrice = this.safeString (stopLossOrder, 'triggerPrice');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': market['symbol'],
            'entryPrice': this.parseNumber (this.safeString (position, 'entryPrice')),
            'markPrice': this.parseNumber (this.safeString (position, 'markPrice')),
            'lastPrice': undefined,
            'takeProfitPrice': this.parseNumber (takeProfitPrice),
            'stopLossPrice': this.parseNumber (stopLossPrice),
            'notional': this.parseNumber (this.safeString2 (position, 'notionalValue', 'orderValue')),
            'collateral': undefined,
            'unrealizedPnl': this.parseNumber (this.safeString (position, 'unrealizedProfitLoss')),
            'realizedPnl': undefined,
            'side': this.parsePositionSide (side),
            'contracts': this.parseNumber (this.safeString (position, 'size')),
            'contractSize': this.parseNumber (this.safeString (position, 'contractSize')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'hedged': hedged,
            'maintenanceMargin': this.parseNumber (this.safeString (position, 'totalMaintenanceMargin')),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': this.parseNumber (this.safeString (position, 'currentLeverage')),
            'liquidationPrice': this.parseNumber (this.safeString (position, 'liquidationPrice')),
            'marginRatio': undefined,
            'marginMode': this.parseMarginModeType (marginType),
            'percentage': undefined,
        });
    }

    parseMarginModeType (marginMode: Str) {
        const marginModes = {
            '91': 'cross',
            '92': 'isolated',
            'CROSS': 'cross',
            'ISOLATED': 'isolated',
        };
        return this.safeString (marginModes, marginMode, marginMode);
    }

    parsePositionSide (side: Str) {
        const sides = {
            'buy': 'long',
            'sell': 'short',
        };
        return this.safeString (sides, side, side);
    }

    /**
     * @method
     * @name btse#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for btse is set identically for all linear markets or all inverse markets
     * @see https://docs.btse.com/futures/rest/get-position-mode
     * @param {string} symbol unified symbol of the market to fetch entry for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    override async fetchPositionMode (symbol: Str = undefined, params = {}): Promise<PositionModeInfo> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPositionMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': this.futuresRequestId (market),
        };
        const response = await this.privateGetFuturesApiV3TradePositionMode (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "ETH-PERP",
        //             "positionMode": "HEDGE"
        //         }
        //     ]
        //
        const data = this.safeDict (response, 0, {});
        const positionMode = this.safeString (data, 'positionMode');
        const hedged = (positionMode === 'HEDGE') || (positionMode === 'ISOLATED');
        return {
            'info': data,
            'hedged': hedged,
        };
    }

    /**
     * @method
     * @name btse#setPositionMode
     * @description NB!!! This method also sets margin mode to cross on btse. Set hedged to true or false for a cross-margin market.
     * @see https://docs.btse.com/futures/rest/change-position-mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol unified symbol of the market to set position mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    override async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}) {
        // NB!!! This method also sets margin mode to cross on btse
        // btse do not have specific endpoint for marginMode
        // both marginMode and positionMode are set and get with the same endpoints
        // it terms of btse positionMode could be HEDGE, ONE_WAY or ISOLATED
        // ISOLATED positionMode is always hedged and multi-position
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setPositionMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positionMode = hedged ? 'HEDGE' : 'ONE_WAY';
        const request: Dict = {
            'symbol': this.futuresRequestId (market),
            'positionMode': positionMode,
        };
        return await this.privatePostFuturesApiV3TradePositionMode (this.extend (request, params));
    }

    /**
     * @method
     * @name btse#fetchMarginMode
     * @description fetches the margin mode of a specific symbol
     * @see https://docs.btse.com/futures/rest/get-leverage
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    override async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': this.futuresRequestId (market),
        };
        const response = await this.privateGetFuturesApiV3TradeLeverage (this.extend (request, params));
        const data = this.safeDict (response, 0, {});
        return this.parseMarginMode (data, market);
    }

    override parseMarginMode (marginMode: Dict, market: Market = undefined): MarginMode {
        //
        //     {
        //         "symbol": "ETH-PERP",
        //         "leverage": 10,
        //         "marginMode": "ISOLATED",
        //         "positionDirection": "SHORT"
        //     }
        //
        const marketId = this.safeString (marginMode, 'symbol');
        market = this.safeMarket (marketId, market);
        const positionMode = this.safeStringLower (marginMode, 'marginMode');
        let marginModeValue = 'cross';
        if (positionMode === 'isolated') {
            marginModeValue = 'isolated';
        }
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': marginModeValue,
        } as MarginMode;
    }

    /**
     * @method
     * @name btse#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://docs.btse.com/futures/rest/change-position-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.hedged] set to true to use dualSidePosition, required for setting marginMode to cross on btse
     * @returns {object} response from the exchange
     */
    override async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        // btse do not have specific endpoint for marginMode
        // both marginMode and positionMode are set and get with the same endpoints
        // it terms of btse positionMode could be HEDGE, ONE_WAY or ISOLATED
        // ISOLATED positionMode is always hedged and multi-position
        // we use params.hedged to define the positionMode when marginMode is cross
        // and warn user if the params are not correct for the marginMode being set
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        marginMode = marginMode.toLowerCase ();
        let positionMode = 'ONE_WAY';
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be either cross or isolated');
        }
        const hedged = this.safeBool (params, 'hedged');
        if (marginMode === 'cross') {
            if (!('hedged' in params)) {
                throw new ArgumentsRequired (this.id + ' setMarginMode() requires a hedged parameter for cross margin mode');
            } else if (hedged === true) {
                positionMode = 'HEDGE';
            }
        } else if (('hedged' in params) && (hedged !== true)) {
            throw new BadRequest (this.id + ' setMarginMode() hedged parameter cannot be false for isolated margin mode');
        } else {
            positionMode = 'ISOLATED';
        }
        params = this.omit (params, 'hedged');
        const request: Dict = {
            'symbol': this.futuresRequestId (market),
            'positionMode': positionMode,
        };
        return await this.privatePostFuturesApiV3TradePositionMode (this.extend (request, params));
    }

    /**
     * @method
     * @name btse#closePosition
     * @description closes an open position for a market
     * @see https://docs.btse.com/futures/rest/close-position/
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] not used by btse
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] the id of the position to close, mandatory
     * @param {string} [params.type] 'limit' or 'market' (default is 'market')
     * @param {float} [params.price] required if params.type is 'limit'
     * @param {bool} [params.postOnly] true if the order should be post only
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positionId = this.safeString (params, 'positionId');
        if (positionId === undefined) {
            throw new ArgumentsRequired (this.id + ' closePosition() requires a positionId parameter');
        }
        const request: Dict = {
            'symbol': this.futuresRequestId (market),
        };
        let type = 'market';
        [ type, params ] = this.handleOptionAndParams (params, 'closePosition', 'type', type);
        type = type.toUpperCase ();
        request['orderType'] = type;
        if (type === 'LIMIT') {
            const price = this.safeString (params, 'price');
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' closePosition() requires a price parameter for limit orders');
            }
            request['orderPrice'] = this.priceToPrecision (symbol, price);
            params = this.omit (params, 'price');
        }
        const response = await this.privateDeleteFuturesApiV3TradePositions (this.extend (request, params));
        let order = this.safeDict (response, 0);
        if (order === undefined) {
            order = response;
        }
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name btse#fetchLeverage
     * @description fetch the leverage for a market
     * @see https://docs.btse.com/futures/rest/get-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    override async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': this.futuresRequestId (market),
        };
        const response = await this.privateGetFuturesApiV3TradeLeverage (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "ETH-PERP",
        //             "leverage": 10,
        //             "marginMode": "ISOLATED",
        //             "positionDirection": "LONG"
        //         },
        //         {
        //             "symbol": "ETH-PERP",
        //             "leverage": 10,
        //             "marginMode": "ISOLATED",
        //             "positionDirection": "SHORT"
        //         }
        //     ]
        //
        let safeResponse: List = [];
        if (Array.isArray (response)) {
            safeResponse = response;
        }
        const result: Dict = {
            'info': response,
            'symbol': symbol,
        };
        let longLeverage = undefined;
        let shortLeverage = undefined;
        let marginMode = undefined;
        for (let i = 0; i < safeResponse.length; i++) {
            const entrty = safeResponse[i];
            const leverageValue = this.safeInteger (entrty, 'leverage');
            const positionDirection = this.safeString (entrty, 'positionDirection');
            marginMode = this.safeStringLower (entrty, 'marginMode');
            if (positionDirection === 'LONG') {
                longLeverage = leverageValue;
            } else if (positionDirection === 'SHORT') {
                shortLeverage = leverageValue;
            } else if (positionDirection === undefined) {
                longLeverage = leverageValue;
                shortLeverage = leverageValue;
            }
        }
        result['marginMode'] = marginMode;
        result['longLeverage'] = longLeverage;
        result['shortLeverage'] = shortLeverage;
        return result as Leverage;
    }

    /**
     * @method
     * @name btse#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.btse.com/futures/rest/change-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionMode] ONE_WAY or HEDGE, defaults to ONE_WAY on the exchange side when omitted
     * @param {string} [params.positionDirection] LONG or SHORT, identifies the side to update in hedge mode
     * @param {string} [params.positionId] existing position id to update, disambiguates the target position in hedge mode
     * @returns {object} response from the exchange
     */
    override async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': this.futuresRequestId (market),
            'leverage': leverage, // a value of 0 requests the maximum cross leverage per the documentation
        };
        // the endpoint defaults to the ISOLATED bucket when marginMode is omitted,
        // verified live - a bare call on a cross account silently changes the
        // isolated leverage only, so the unified marginMode param is translated here
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('setLeverage', params);
        if (marginMode !== undefined) {
            request['marginMode'] = marginMode.toUpperCase ();
        }
        const response = await this.privatePostFuturesApiV3TradeLeverage (this.extend (request, params));
        return response;
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if ((response === undefined) || (response === null)) {
            return undefined; // fallback to default error handler
        }
        //
        // spot
        //
        //     {"code":10002,"msg":"UNAUTHORIZED: Authentication Failed","time":1770477230034,"data":null,"success":false}
        //     {"code":51523,"msg":"BADREQUEST: Insufficient wallet balance","time":1770814875493,"data":null,"success":false}
        //
        // futures
        //
        //     {"status":400,"errorCode":-2,"message":"symbol parameter is mandatory","extraData":null}
        //     {"status":400,"errorCode":-7,"message":"Authenticate failed","extraData":null}
        //
        const success = this.safeBool (response, 'success', true);
        if (success !== true) {
            const spotErrorCode = this.safeString (response, 'code');
            const spotMessage = this.safeString (response, 'msg');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], spotErrorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], spotMessage, feedback);
            throw new ExchangeError (feedback);
        }
        const errorCode = this.safeString (response, 'errorCode');
        if (errorCode !== undefined) {
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        //
        // futures order and leverage endpoints reply with HTTP 200 and encode failures in a numeric status field, per the API Enum section of the docs
        //
        //     {"symbol":"ETH-PERP","timestamp":1770892916507,"status":135,"type":93,"message":"{\"msgKey\":\"trade.error.invalid.position_id\",\"params\":[\"ETH-PERP-USDT\"] ,\"default_msg\":\"User is in ISOLATE_HEDGE in market: ETH-PERP-USDT, but positionId is empty in the request.\"}"}
        //
        // success statuses such as 2 ORDER_INSERTED, 4 ORDER_FULLY_TRANSACTED, 5 ORDER_PARTIALLY_TRANSACTED, 6 ORDER_CANCELLED, 9 TRIGGER_INSERTED, 10 TRIGGER_ACTIVATED and 20 SUCCESS fall through without matching
        //
        // the legacy error envelope documented on the error codes page carries
        // the numeric api status enum in the code field beside the http status
        //
        //     {"status":400,"error":"Bad Request","code":301,"message":"Invalid order size"}
        //
        const legacyErrorText = this.safeString (response, 'error');
        const legacyEnumCode = this.safeString (response, 'code');
        if ((legacyErrorText !== undefined) && (legacyEnumCode !== undefined)) {
            const legacyMessage = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], legacyEnumCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], legacyMessage, feedback);
            throw new ExchangeError (feedback);
        }
        let rows = [];
        if (Array.isArray (response)) {
            rows = response;
        } else {
            rows = [ response ];
        }
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const status = this.safeString (row, 'status');
            if (status !== undefined) {
                let message = this.safeString (row, 'message');
                const embedded = this.parseJson (message);
                if (embedded !== undefined) {
                    message = this.safeString (embedded, 'default_msg', message);
                }
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            }
        }
        return undefined;
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const baseUrl = this.urls['api'][api];
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        // the futures v3 trading api reads DELETE params from a signed json
        // body like its POST and PUT counterparts, while the spot v4 and the
        // legacy apis keep DELETE params in the query string, verified live
        // in both directions
        const isBodyDelete = (method === 'DELETE') && (path.startsWith ('futures/api/v3/') === true);
        let queryString = '';
        if (((method === 'GET') || (method === 'DELETE')) && !isBodyDelete) {
            if (Object.keys (query).length > 0) {
                queryString = this.urlencode (query);
                url += '?' + queryString;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            let bodyString = this.json (query);
            if (((method === 'GET') || (method === 'DELETE')) && !isBodyDelete) {
                bodyString = '';
            } else {
                body = bodyString;
            }
            // the signed urlpath is the path relative to the base url of the product, the
            // spot and futures apis of every generation mount under /spot and /futures and
            // sign the /api/v... remainder, while the public-api wallet, otc and markets
            // endpoints mount on the bare host and sign the full path with the leading slash
            let signPath = undefined;
            if (path.startsWith ('public-api/') === true) {
                signPath = '/' + path;
            } else {
                signPath = this.cleanPath (path);
            }
            const payload = signPath + nonce.toString () + bodyString;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha384);
            headers = {
                'request-api': this.apiKey,
                'request-nonce': nonce.toString (),
                'request-sign': signature,
                'Content-Type': 'application/json',
                'BROKER-ID': 'ccxt',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    futuresRequestId (market: any) {
        // the futures v3 trading api identifies contracts by the short trade-currency
        // form, for example RAVE-PERP instead of the RAVE-PERP-USDT market id, read
        // from the raw market info so that cached markets resolve it as well
        return this.safeString (market['info'], 'tradeCurrency', market['id']);
    }

    cleanPath (path: string) {
        let result = path.replace ('spot', '');
        result = result.replace ('futures', '');
        result = result.replace ('otc', '');
        return result;
    }

    override nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }
}
