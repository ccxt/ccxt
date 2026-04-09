
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitbaby.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InvalidOrder, InsufficientFunds, NotSupported, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Dict, FundingRate, Int, int, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Ticker, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitbaby
 * @augments Exchange
 */
export default class bitbaby extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bitbaby',
            'name': 'BitBaby',
            'countries': [ 'AE' ], // United Arab Emirates
            'rateLimit': 20,
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true, // spot non-margin only
                'cancelOrdersWithClientOrderId': false,
                'cancelOrderWithClientOrderId': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createMarketOrderWithCost': true, // contract only if position is opening
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': true, // contract only if position is opening
                'createOrder': true,
                'createOrders': true, // spot non-margin only
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': true, // contract only
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'deposit': false,
                'editOrder': false,
                'editOrders': false,
                'editOrderWithClientOrderId': false,
                'fetchAccounts': false,
                'fetchADLRank': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': true, // contract only
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
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL2OrderBook': true,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverage': false,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrdersByStatus': false,
                'fetchOrderTrades': false,
                'fetchOrderWithClientOrderId': false,
                'fetchPosition': false,
                'fetchPositionADLRank': false,
                'fetchPositionHistory': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsADLRank': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true, // spot only
                'fetchTradingFee': false,
                'fetchTradingFees': false,
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
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'privateAPI': true,
                'publicAPI': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://openapi.bitbaby.com',
                    'private': 'https://openapi.bitbaby.com',
                    'kline': 'https://kline.bitbaby.com',
                },
                'www': 'https://www.bitbaby.com',
                'doc': [
                    'https://bitbaby-1.gitbook.io/bitbaby-api',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'spot/open/sapi/v1/ping': 1,
                        'spot/open/sapi/v1/time': 1,
                        'spot/open/sapi/v1/symbols': 1,
                        'spot/open/sapi/v1/depth': 1,
                        'spot/open/sapi/v1/ticker': 1,
                        'spot/open/sapi/v1/trades': 1,
                        'spot/open/sapi/v1/kline': 1, // returns an empty response
                        'futures/open/fapi/v1/ping': 1,
                        'futures/open/fapi/v1/time': 1,
                        'futures/open/fapi/v1/contracts': 1,
                        'futures/open/fapi/v1/depth': 1,
                        'futures/open/fapi/v1/ticker': 1,
                        'futures/open/fapi/v1/index': 1,
                        'futures/open/fapi/v1/kline': 1, // returns an empty response
                    },
                },
                'private': {
                    'get': {
                        'spot/open/sapi/v1/order': 5,
                        'spot/open/sapi/v1/openOrders': 5,
                        'spot/open/sapi/v1/myTrades': 5,
                        'spot/open/sapi/v1/account': 5,
                        'spot/open/sapi/v1/margin/order': 1, // not supported by the exchange yet
                        'spot/open/sapi/v1/margin/openOrders': 1, // not supported by the exchange yet
                        'spot/open/sapi/v1/margin/myTrades': 1, // not supported by the exchange yet
                        'futures/open/fapi/v1/order': 5,
                        'futures/open/fapi/v1/openOrders': 5,
                        'futures/open/fapi/v1/myTrades': 1,
                        'futures/open/fapi/v1/account': 5,
                    },
                    'post': {
                        'spot/open/sapi/v1/order': 1,
                        'spot/open/sapi/v1/order/test': 1,
                        'spot/open/sapi/v1/batchOrders': 2,
                        'spot/open/sapi/v1/cancel': 1,
                        'spot/open/sapi/v1/batchCancel': 2,
                        'spot/open/sapi/v1/margin/order': 1, // not supported by the exchange yet
                        'spot/open/sapi/v1/margin/cancel': 1, // not supported by the exchange yet
                        'futures/open/fapi/v1/order': 1,
                        'futures/open/fapi/v1/conditionOrder': 1,
                        'futures/open/fapi/v1/cancel': 1,
                        'futures/open/fapi/v1/orderHistorical': 1,
                        'futures/open/fapi/v1/profitHistorical': 1,
                    },
                },
                'kline': {
                    'get': {
                        'v1/spot/market/kline': 1,
                        'v1/future/market/kline': 1,
                    },
                },
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '4h': '4hour',
                '1d': '1day',
                '1w': '1week',
                '1M': '1month',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '-1000': ExchangeError, // UNKNOWN An unknown error occurred while processing the request.
                    '-1001': ExchangeError, // DISCONNECTED Internal error, unable to process your request, please try again.
                    '-1002': AuthenticationError, // UNAUTHORIZED You are not authorized to execute this request.
                    '-1003': RateLimitExceeded, // TOO_MANY_REQUESTS The requests were too frequent and exceeded the limit.
                    '-1004': PermissionDenied, // NO_THIS_COMPANY You are not authorized to perform this request. (User not exiting Company)
                    '-1006': ExchangeError, // UNEXPECTED_RESP A message that does not conform to the preset format was received; the order status is unknown.
                    '-1007': ExchangeError, // TIMEOUT Timeout occurred while waiting for a response from the backend server. Sending status unknown; execution status unknown.
                    '-1014': BadRequest, // UNKNOWN_ORDER_COMPOSITION Unsupported order combinations
                    '-1015': RateLimitExceeded, // TOO_MANY_ORDERS Too many new orders. Please reduce your request frequency.
                    '-1016': ExchangeError, // SERVICE_SHUTTING_DOWN Server offline
                    '-1017': ExchangeError, // ILLEGAL_CONTENT_TYPE
                    '-1020': NotSupported, // UNSUPPORTED_OPERATION This operation is not supported.
                    '-1021': BadRequest, // INVALID_TIMESTAMP The latency is too high; the server determines that the time taken has exceeded the recevWindow based on the timestamp in the received request. Please improve network conditions or increase the recevWindow.
                    '-1022': AuthenticationError, // INVALID_SIGNATURE The signature for this request is invalid.
                    '-1023': AuthenticationError, // UNTIMESTAMP 'You are not authorized to execute this request.
                    '-1024': AuthenticationError, // UNSIGNATURE 'You are not authorized to execute this request
                    '110047': BadRequest, // PRICE_OR_AMOUNT_LESS_THAN_MINIMUM
                    '110049': InsufficientFunds, // {"code":"110049","msg":"账户余额不足","data":null}
                    '10081': BadRequest, // // {"code":"10081","msg":"Take profit order volume must be greater than minimum value 30 contracts"}
                    '-1101': BadRequest, // TOO_MANY_PARAMETERS Too many parameters were sent.
                    '-1102': BadRequest, // MANDATORY_PARAM_EMPTY_OR_MALFORMED No mandatory parameter was sent; the parameter is empty or incorrectly formatted.
                    '-1103': BadRequest, // UNKNOWN_PARAM Unknown parameters were sent. Each request requires at least one parameter {Timestamp}.
                    '-1104': BadRequest, // UNREAD_PARAMETERS Not all sent parameters are read.
                    '-1105': BadRequest, // PARAM_EMPTY The parameter is empty.
                    '-1106': BadRequest, // PARAM_NOT_REQUIRED Parameters have been sent when not needed.
                    '-1111': BadRequest, // BAD_PRECISION The accuracy exceeds the maximum value defined for this asset.
                    '-1112': OrderNotFillable, // NO_DEPTH There are no pending orders for the trading pair.
                    '-1116': InvalidOrder, // INVALID_ORDER_TYPE Invalid order type.
                    '-1117': InvalidOrder, // INVALID_SIDE Invalid buy/sell direction.
                    '-1118': InvalidOrder, // EMPTY_NEW_CL_ORD_ID The new customer order ID is empty.
                    '-1121': BadSymbol, // BAD_SYMBOL Invalid symbol
                    '-1136': InvalidOrder, // ORDER_QUANTITY_TOO_SMALL The order quantity is less than the minimum value.
                    '-1138': InvalidOrder, // ORDER_PRICE_WAVE_EXCEED Order price exceeds the allowed range
                    '-1139': InvalidOrder, // ORDER_NOT_SUPPORT_MARKET This trading pair does not support market orders.
                    '-1145': InvalidOrder, // ORDER_NOT_SUPPORT_CANCELLATION This order type does not support cancellation.
                    '-1147': InvalidOrder, // PRICE_VOLUME_PRESION_ERROR Order price or quantity exceeds the maximum limit
                    '-1196': OrderNotFound,
                    '-1203': InvalidOrder,
                    '-2013': OrderNotFound, // NO_SUCH_ORDER Order does not exist.
                    '-2015': AuthenticationError, // REJECTED_CH_KEY Invalid API key, IP address, or operation permission.
                    '-2016': ExchangeError, // EXCHANGE_LOCK The transaction was frozen
                    '-2017': InsufficientFunds, // BALANCE_NOT_ENOUGH
                    '-2100': BadRequest,
                },
                'broad': {
                    '-10': ExchangeError, // 10xx - General Server and Network Errors
                    '-11': BadRequest, // 11xx - Issues in the request content
                    'fail': ExchangeError, // {"code":"1","msg":"fail","data":null,"message":null,"succ":false}
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.2'),
                    'maker': this.parseNumber ('0.2'),
                },
                'spot': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.2'),
                    'maker': this.parseNumber ('0.2'),
                },
                'contract': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0006'),
                    'maker': this.parseNumber ('0.0002'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.06') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.058') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.056') ],
                            [ this.parseNumber ('8000000'), this.parseNumber ('0.054') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.052') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('40000000'), this.parseNumber ('0.048') ],
                            [ this.parseNumber ('80000000'), this.parseNumber ('0.044') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.042') ],
                            [ this.parseNumber ('150000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('200000000'), this.parseNumber ('0.035') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.019') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0185') ],
                            [ this.parseNumber ('8000000'), this.parseNumber ('0.018') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0175') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.017') ],
                            [ this.parseNumber ('40000000'), this.parseNumber ('0.0165') ],
                            [ this.parseNumber ('80000000'), this.parseNumber ('0.0155') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.0145') ],
                            [ this.parseNumber ('150000000'), this.parseNumber ('0.0125') ],
                            [ this.parseNumber ('200000000'), this.parseNumber ('0.01') ],
                        ],
                    },
                },
            },
            'commonCurrencies': {
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'createMarketBuyOrderRequiresPrice': true,
                'createMarketOrderRequiresPrice': true, // conract only if position is opening
                'accountsByType': {
                },
                'networks': {
                },
                'partner': 'ccxt',
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'test': true,
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': 7, // per  implementation comments
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'forDerivs': {
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
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchCanceledAndClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
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
     * @name bitbaby#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#ce-shi-lian-jie // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#ce-shi-lian-jie // contract
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchStatus', undefined, params);
        let response = undefined;
        if (type !== 'spot') {
            response = await this.publicGetFuturesOpenFapiV1Ping (params);
        } else {
            response = await this.publicGetSpotOpenSapiV1Ping (params);
        }
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
     * @name bitbaby#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#fu-wu-qi-shi-jian // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#huo-qu-fu-wu-qi-shi-jian // contract
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        let response = undefined;
        if (type !== 'spot') {
            response = await this.publicGetFuturesOpenFapiV1Time (params);
        } else {
            response = await this.publicGetSpotOpenSapiV1Time (params);
        }
        //
        //     {
        //         "timezone": "格林尼治标准时间",
        //         "serverTime": 1775118113716
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name bitbaby#fetchMarkets
     * @description retrieves data on all markets for exchagne
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#bi-dui-lie-biao // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#he-yue-lie-biao // contract
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const promises = [
            this.publicGetSpotOpenSapiV1Symbols (params),
            this.publicGetFuturesOpenFapiV1Contracts (params),
        ];
        const [ spotResponse, contractResponse ] = await Promise.all (promises);
        const spotArray = this.safeList (spotResponse, 'symbols', []);
        let contractArray = [];
        if (Array.isArray (contractResponse)) {
            contractArray = contractResponse;
        }
        const result = this.arrayConcat (spotArray, contractArray);
        return this.parseMarkets (result);
    }

    parseMarket (market: Dict): Market {
        //
        // spot
        //     {
        //         "quantityPrecision": 5,
        //         "limitVolumeMin": 0.0000100000000000,
        //         "symbol": "btcusdt",
        //         "pricePrecision": 2,
        //         "marketBuyMin": 5.0000000000000000,
        //         "marketSellMin": 0.0000100000000000,
        //         "baseAsset": "BTC",
        //         "limitPriceMin": 0.0000100000000000,
        //         "quoteAsset": "USDT"
        //     }
        //
        // contract
        //     {
        //         "symbol": "E-ETH-USDT",
        //         "pricePrecision": 2,
        //         "side": 1,
        //         "maxMarketVolume": 20000,
        //         "multiplier": 0.0100000000000000,
        //         "minOrderVolume": 1,
        //         "maxMarketMoney": 10000000.0000000000000000,
        //         "type": "E",
        //         "maxLimitVolume": 20000,
        //         "maxValidOrder": 50,
        //         "multiplierCoin": "ETH",
        //         "minOrderMoney": 1.0000000000000000,
        //         "maxLimitMoney": 10000000.0000000000000000,
        //         "contractId": 2,
        //         "status": 1
        //     }
        //
        const id = this.safeString (market, 'symbol');
        let baseId = this.safeString (market, 'baseAsset');
        let quoteId = this.safeString (market, 'quoteAsset');
        let settleId = undefined;
        let isLinear = undefined;
        let isInverse = undefined;
        let isSpot = true;
        let isActive = true; // check for spot
        let fees = this.safeDict (this.fees, 'spot', {});
        if (baseId === undefined || quoteId === undefined) { // swap markets
            fees = this.safeDict (this.fees, 'contract', {});
            isSpot = false;
            const status = this.safeInteger (market, 'status');
            isActive = (status === 1);
            const symbolParts = id.split ('-');
            baseId = this.safeString (symbolParts, 1);
            quoteId = this.safeString (symbolParts, 2);
            const side = this.safeInteger (market, 'side');
            if (side === 0) {
                isInverse = true;
                isLinear = false;
                settleId = baseId;
            } else {
                isInverse = false;
                isLinear = true;
                settleId = quoteId;
            }
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        let maxAmount = undefined;
        let maxCost = undefined;
        if (!isSpot) {
            symbol += ':' + settle;
            const maxMarketVolume = this.safeString (market, 'maxMarketVolume');
            const maxLimitVolume = this.safeString (market, 'maxLimitVolume');
            maxAmount = this.parseNumber (Precise.stringMax (maxMarketVolume, maxLimitVolume));
            const maxMarketMoney = this.safeString (market, 'maxMarketMoney');
            const maxLimitMoney = this.safeString (market, 'maxLimitMoney');
            maxCost = this.parseNumber (Precise.stringMax (maxMarketMoney, maxLimitMoney));
        }
        const pricePrecision = this.parsePrecision (this.safeString (market, 'pricePrecision'));
        const amountPrecision = this.parsePrecision (this.safeString (market, 'quantityPrecision', '0'));
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
            'active': isActive,
            'contract': !isSpot,
            'linear': isLinear,
            'inverse': isInverse,
            'taker': this.safeNumber (fees, 'taker'),
            'maker': this.safeNumber (fees, 'maker'),
            'feeSide': this.safeString (fees, 'feeSide'),
            'contractSize': this.safeNumber (market, 'multiplier'),
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
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber2 (market, 'limitVolumeMin', 'minOrderVolume'),
                    'max': maxAmount,
                },
                'price': {
                    'min': this.safeNumber (market, 'limitPriceMin'),
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber2 (market, 'marketBuyMin', 'minOrderMoney'),
                    'max': maxCost,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name bitbaby#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#ding-dan-bo // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#ding-dan-bo // contract
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 30, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['contract']) {
            request['contractName'] = market['id'];
            //
            //     {
            //         "asks": [
            //             [
            //                 "2034.59",
            //                 "46",
            //                 "46",
            //                 "93591.14"
            //             ]
            //         ],
            //         "bids": [
            //             [
            //                 "2034.55",
            //                 "294",
            //                 "294",
            //                 "598157.70" // cumulative cost
            //             ]
            //         ],
            //         "time": null
            //     }
            response = await this.publicGetFuturesOpenFapiV1Depth (this.extend (request, params));
        } else {
            request['symbol'] = market['id'];
            //
            //     {
            //         "asks": [
            //             [
            //                 "2036.17",
            //                 "9.058",
            //                 "9.058"
            //             ]
            //         ],
            //         "bids": [
            //             [
            //                 "2036.16",
            //                 "5.698",
            //                 "5.698" // cumulative amount
            //             ]
            //         ],
            //         "time": 1775124840450
            //     }
            //
            response = await this.publicGetSpotOpenSapiV1Depth (this.extend (request, params));
        }
        // do not use standard parseOrderBook helper to avoid additional values in the arrays
        const rawBids = this.safeList (response, 'bids', []);
        const rawAsks = this.safeList (response, 'asks', []);
        const bids = [];
        const asks = [];
        for (let i = 0; i < rawBids.length; i++) {
            const bid = this.safeList (rawBids, i, []);
            const parsedBid = [];
            const price = this.safeNumber (bid, 0);
            const amount = this.safeNumber (bid, 1);
            parsedBid.push (price);
            parsedBid.push (amount);
            bids.push (parsedBid);
        }
        for (let i = 0; i < rawAsks.length; i++) {
            const ask = this.safeList (rawAsks, i, []);
            const parsedAsk = [];
            const price = this.safeNumber (ask, 0);
            const amount = this.safeNumber (ask, 1);
            parsedAsk.push (price);
            parsedAsk.push (amount);
            asks.push (parsedAsk);
        }
        const timestamp = this.safeInteger (response, 'time');
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as OrderBook;
    }

    /**
     * @method
     * @name bitbaby#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#hang-qing-ticker // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#hang-qing-ticker // contract
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        let response = undefined;
        if (market['contract']) {
            request['contractName'] = market['id'];
            //
            //     {
            //         "high": "69146",
            //         "vol": "72503850",
            //         "last": "66299.5",
            //         "low": "66121.8",
            //         "buy": "66300.0",
            //         "sell": "66300.1",
            //         "rose": "-3.3354620104",
            //         "time": 1775130047000
            //     }
            //
            response = await this.publicGetFuturesOpenFapiV1Ticker (this.extend (request, params));
        } else {
            request['symbol'] = market['id'];
            //
            //     {
            //         "amount": "31908898.5497543",
            //         "high": "69159.98",
            //         "vol": "472.36167",
            //         "last": 66345.1300000000000000,
            //         "low": "66168",
            //         "buy": "66350.15",
            //         "sell": "66350.16",
            //         "rose": "-3.311281538",
            //         "time": 1775130100000
            //     }
            //
            response = await this.publicGetSpotOpenSapiV1Ticker (this.extend (request, params));
        }
        return this.parseTicker (response, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // spot
        //     {
        //         "amount": "31908898.5497543",
        //         "high": "69159.98",
        //         "vol": "472.36167",
        //         "last": 66345.1300000000000000,
        //         "low": "66168",
        //         "buy": "66350.15",
        //         "sell": "66350.16",
        //         "rose": "-3.311281538",
        //         "time": 1775130100000
        //     }
        //
        // swap
        //     {
        //         "high": "69146",
        //         "vol": "72503850",
        //         "last": "66299.5",
        //         "low": "66121.8",
        //         "buy": "66300.0",
        //         "sell": "66300.1",
        //         "rose": "-3.3354620104",
        //         "time": 1775130047000
        //     }
        //
        const marketId = this.safeString (ticker, 'contractName');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'time');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'rose'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': this.safeString (ticker, 'amount'),
            'markPrice': this.safeString (ticker, 'markPrice'),
            'indexPrice': this.safeString (ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bitbaby#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#huo-qu-zhi-shu-biao-ji-jia-ge
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'contractName': market['id'],
        };
        if (market['spot']) {
            throw new NotSupported (this.id + ' fetchFundingRate() is not supported for spot markets');
        }
        const response = await this.publicGetFuturesOpenFapiV1Index (this.extend (request, params));
        return this.parseFundingRate (response, market);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "currentFundRate": 0.00003,
        //         "indexPrice": 66178.765,
        //         "tagPrice": 66142.4,
        //         "nextFundRate": -0.0000703671478945
        //     }
        //
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': this.safeNumber (contract, 'tagPrice'), // todo check if this is correct
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'currentFundRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': this.safeNumber (contract, 'nextFundRate'),
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
     * @name bitbaby#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#k-xian-la-zhu-tu-shu-ju // wrong description in docs
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#k-xian-la-zhu-tu-shu-ju // wrong description in docs, currntly not working for contract markets
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100, max 300)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'scaleType': interval,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['contract']) {
            const lowercaseId = market['lowercaseId'];
            const parts = lowercaseId.split ('-');
            const type = this.safeString (parts, 0);
            const baseId = this.safeString (parts, 1);
            const quoteId = this.safeString (parts, 2);
            const marketId = type + '_' + baseId + quoteId;
            request['symbol'] = marketId;
            let priceType = undefined;
            [ priceType, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'price');
            if (priceType !== undefined) {
                request['type'] = priceType;
            }
            //
            //     {
            //         "code": "0",
            //         "msg": "Success",
            //         "data": {
            //             "channel": "mark_e_btcusdt_1min",
            //             "data": [
            //                 {
            //                     "id": 1775290380,
            //                     "open": 66981.7,
            //                     "close": 66970.2,
            //                     "high": 66981.7,
            //                     "low": 66970.2,
            //                     "volume": 0
            //                 }
            //             ]
            //         }
            //     }
            //
            response = await this.klineGetV1FutureMarketKline (this.extend (request, params));
        } else {
            request['symbol'] = market['id'];
            //
            //    {
            //         "code": "0",
            //         "msg": "Success",
            //         "data": {
            //             "channel": "market_dogeusdt_1min",
            //             "data": [
            //                 {
            //                     "id": 1775217900,
            //                     "open": 0.09143,
            //                     "close": 0.09143,
            //                     "high": 0.09144,
            //                     "low": 0.09143,
            //                     "volume": 1190.3
            //                 }
            //             ],
            //             "event_rep": "rep",
            //             "status": "ok",
            //             "ts": 1775217924809
            //         }
            //     }
            //
            response = await this.klineGetV1SpotMarketKline (this.extend (request, params));
        }
        const data = this.safeDict (response, 'data', {});
        const innerData = this.safeList (data, 'data', []);
        return this.parseOHLCVs (innerData, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        // spot
        //
        //     {
        //         "id": 1775217900,
        //         "open": 0.09143,
        //         "close": 0.09143,
        //         "high": 0.09144,
        //         "low": 0.09143,
        //         "volume": 1190.3
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'id'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber2 (ohlcv, 'volume', 'vol'),
        ];
    }

    /**
     * @method
     * @name bitbaby#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#zui-jin-cheng-jiao // spot
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['contract']) {
            throw new NotSupported (this.id + ' fetchTrades() is not supported for contract markets');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetSpotOpenSapiV1Trades (this.extend (request, params));
        //
        //     [
        //         {
        //             "side": "sell",
        //             "price": 66316.5900000000000000,
        //             "qty": 0.0000700000000000,
        //             "time": 1775140259281
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     {
        //         "side": "sell",
        //         "price": 66316.5900000000000000,
        //         "qty": 0.0000700000000000,
        //         "time": 1775140259281
        //     }
        //
        // fetchMyTrades spot
        //     {
        //         "symbol": "DOGEUSDT",
        //         "side": "BUY",
        //         "fee": "0.4652193",
        //         "isMaker": false,
        //         "isBuyer": true,
        //         "bidId": 3206077345740844498,
        //         "bidUserId": 1047121,
        //         "feeCoin": "DOGE",
        //         "price": "0.09028",
        //         "qty": "232.60965",
        //         "askId": 3176911270805052610,
        //         "id": "6137967",
        //         "time": 1775161045250,
        //         "isSelf": false,
        //         "askUserId": 1000048
        //     }
        //
        // fetchMyTrades contract
        //     {
        //         "symbol": "DOGE-USDT",
        //         "amount": 9.93753000000000000000000000000000,
        //         "side": "BUY",
        //         "fee": "0.005962518",
        //         "isMaker": false,
        //         "isBuyer": true,
        //         "bidId": 3221406049627539350,
        //         "bidUserId": 20290,
        //         "price": 0.0911700000000000,
        //         "qty": 109,
        //         "askId": 3221403661625561316,
        //         "contractName": "E-DOGE-USDT",
        //         "time": 1775221360000,
        //         "tradeId": 42501154,
        //         "askUserId": 10016
        //     }
        //
        // fetchOrder
        //     {
        //         "tradeId": 42501154,
        //         "price": 0.0911700000000000,
        //         "qty": 109,
        //         "commission": 0.0059625180000000,
        //         "commissionCoin": "USDT"
        //     }
        const marketId = this.safeString2 (trade, 'contractName', 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'time');
        let side = this.safeStringLower (trade, 'side');
        if (side === undefined) {
            const isBuyer = this.safeBool (trade, 'isBuyer');
            if (isBuyer !== undefined) {
                side = isBuyer ? 'buy' : 'sell';
            }
        }
        let orderIdKey = 'bidId';
        if (side === 'sell') {
            orderIdKey = 'askId';
        }
        let takerOrMaker = undefined;
        const isMaker = this.safeBool (trade, 'isMaker');
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString2 (trade, 'commission', 'fee');
        if (feeCost !== undefined) {
            let feeCurrencyId = this.safeString2 (trade, 'commissionCoin', 'feeCoin');
            if ((feeCurrencyId === undefined) && market['contract']) {
                feeCurrencyId = market['settleId'];
            }
            const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'id', 'tradeId'),
            'order': this.safeString (trade, orderIdKey),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'qty'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name bitbaby#createOrder
     * @description Create an order on the exchange
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#chuang-jian-xin-ding-dan // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#chuang-jian-ce-shi-ding-dan // spot test
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#chuang-jian-ding-dan // contract
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#chuang-jian-tiao-jian-dan // contract trigger
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
        const test = this.safeBool (params, 'test', false);
        if (market['contract']) {
            if (test) {
                throw new NotSupported (this.id + ' createOrder() does not support test orders for contract markets');
            }
            return await this.createContractOrder (symbol, type, side, amount, price, params);
        } else {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        }
    }

    /**
     * @method
     * @name bitbaby#createSpotOrder
     * @description helper method for creating spot orders
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#chuang-jian-xin-ding-dan // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#chuang-jian-ce-shi-ding-dan // spot test
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @param {int} [params.recvWindow] request valid time window value
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createSpotOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = this.createSpotOrderRequest (symbol, type, side, amount, price, params);
        const test = this.safeBool (request, 'test', false);
        let response = undefined;
        if (test) {
            //
            // {} - empty response if no error
            //
            request = this.omit (request, 'test');
            response = await this.privatePostSpotOpenSapiV1OrderTest (request);
        } else {
            //
            //     {
            //         "symbol": "dogeusdt",
            //         "newClientOrderId": null,
            //         "side": "BUY",
            //         "executedQty": 0,
            //         "orderId": [
            //             "3176901856236716480"
            //         ],
            //         "price": 0,
            //         "origQty": 20,
            //         "clientOrderId": null,
            //         "transactTime": 1775144786145,
            //         "type": "MARKET",
            //         "status": "NEW"
            //     }
            //
            response = await this.privatePostSpotOpenSapiV1Order (request);
        }
        return this.parseOrder (response, market);
    }

    createSpotOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            // 'volume': this.amountToPrecision (symbol, amount),
        };
        const isMarketOrder = (type === 'market');
        if (isMarketOrder) {
            if (side === 'buy') {
                let createMarketBuyOrderRequiresPrice = true;
                [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeString (params, 'cost');
                params = this.omit (params, 'cost');
                if (createMarketBuyOrderRequiresPrice) {
                    if ((price === undefined) && (cost === undefined)) {
                        throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                    } else {
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        const quoteAmount = Precise.stringMul (amountString, priceString);
                        const costRequest = (cost !== undefined) ? cost : quoteAmount;
                        request['volume'] = this.costToPrecision (symbol, costRequest);
                    }
                } else {
                    request['volume'] = this.costToPrecision (symbol, amount);
                }
            } else {
                request['volume'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            request['volume'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const partner = this.safeString (this.options, 'partner', 'ccxt');
        let clientOrderId = partner + '_' + this.uuid22 ();
        [ clientOrderId, params ] = this.handleParamString (params, 'clientOrderId', clientOrderId);
        request['newClientOrderId'] = clientOrderId;
        let recwWindow = undefined;
        [ recwWindow, params ] = this.handleOptionAndParams (params, 'createOrder', 'recvWindow'); // checking both options and params for recvWindow value
        if (recwWindow !== undefined) {
            request['recvWindow'] = recwWindow;
        }
        return this.extend (request, params);
    }

    /**
     * @method
     * @name bitbaby#createContractOrder
     * @description helper method for creating contract orders
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#chuang-jian-ding-dan // contract
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#chuang-jian-tiao-jian-dan // contract trigger
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] trigger price for conditional orders
     * @param {float} [params.stopLossPrice] stop loss price for the order
     * @param {float} [params.takeProfitPrice] take profit price for the order
     * @param {string} [params.clientOrderId] client order id
     * @param {bool} [params.reduceOnly] whether the order is reduce only, default is false
     * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross'
     * @param {string} [params.timeInForce] *non-trigger orders only* 'IOC', 'FOK', or 'PO'
     * @param {bool} [params.postOnly] *non-trigger orders only* whether the order is post only
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createContractOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createContractOrderRequest (symbol, type, side, amount, price, params);
        const triggerPrice = this.safeString (request, 'triggerPrice');
        let response = undefined;
        if (triggerPrice === undefined) {
            // regular order
            response = await this.privatePostFuturesOpenFapiV1Order (request);
            return this.parseOrder (response, market);
        } else {
            // conditional order
            //     {
            //         "code": "0",
            //         "msg": "Success",
            //         "data":
            //         {
            //             "newClientOrderId": [],
            //             "triggerIds": [
            //                 "1475"
            //             ],
            //             "ids": [],
            //             "cancelIds": []
            //         },
            //         "msgData": null,
            //         "succ": true
            //     }
            //
            response = await this.privatePostFuturesOpenFapiV1ConditionOrder (request);
            const data = this.safeDict (response, 'data', {});
            const triggerIds = this.safeList (data, 'triggerIds', []);
            const id = this.safeString (triggerIds, 0);
            const parsed = this.parseOrder ({ 'id': id }, market);
            parsed['info'] = response;
            return parsed;
        }
    }

    createContractOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const request: Dict = {
            'contractName': market['id'],
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
        };
        let openOrClose = 'OPEN';
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        if (reduceOnly) {
            params = this.omit (params, 'reduceOnly');
            openOrClose = 'CLOSE';
        }
        const isMarketOrder = (type === 'market');
        const [ triggerPrice, stopLossPrice, takeProfitPrice, query ] = this.handleTriggerPricesAndParams (symbol, params);
        params = query;
        const isStopLossOrTakeProfit = (stopLossPrice !== undefined) || (takeProfitPrice !== undefined);
        if (isStopLossOrTakeProfit && openOrClose === 'OPEN') {
            // in case if user not provided reduceOnly param but provided stop loss or take profit price
            openOrClose = 'CLOSE';
        }
        request['open'] = openOrClose;
        if (isMarketOrder) {
            if (openOrClose === 'OPEN') {
                let createMarketOrderRequiresPrice = true;
                [ createMarketOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketOrderRequiresPrice', true);
                const cost = this.safeString (params, 'cost');
                params = this.omit (params, 'cost');
                if (createMarketOrderRequiresPrice) {
                    if ((price === undefined) && (cost === undefined)) {
                        throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market orders to calculate the total cost to spend (amount * price), alternatively set the createMarketOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                    } else {
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        const quoteAmount = Precise.stringMul (amountString, priceString);
                        const costRequest = (cost !== undefined) ? cost : quoteAmount;
                        request['volume'] = this.costToPrecision (symbol, costRequest);
                    }
                } else {
                    request['volume'] = this.costToPrecision (symbol, amount);
                }
            } else {
                request['volume'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            request['volume'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let marginMode = 'cross';
        [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params, marginMode);
        if (marginMode !== undefined) {
            request['positionType'] = this.encodeMarginMode (marginMode);
        }
        let timeInForce = this.safeStringUpper (params, 'timeInForce');
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (type === 'market', timeInForce === 'POST_ONLY', params);
        if (postOnly) {
            timeInForce = 'POST_ONLY';
        }
        if (timeInForce !== undefined) {
            if (timeInForce === 'IOC' || timeInForce === 'FOK' || timeInForce === 'POST_ONLY') {
                request['timeInForce'] = timeInForce;
            } else if (timeInForce !== 'GTC') {
                throw new NotSupported (this.id + ' createContractOrder() does not support timeInForce ' + timeInForce);
            }
        }
        if (triggerPrice !== undefined) {
            if ((stopLossPrice !== undefined) || (takeProfitPrice !== undefined)) {
                throw new NotSupported (this.id + ' createContractOrder() supports only one parameter among triggerPrice, stopLossPrice and takeProfitPrice');
            }
            request['triggerPrice'] = triggerPrice;
            const triggerType = (side === 'buy') ? 3 : 4;
            request['triggerType'] = triggerType;
        }
        if (stopLossPrice !== undefined) {
            if ((triggerPrice !== undefined) || (takeProfitPrice !== undefined)) {
                throw new NotSupported (this.id + ' createContractOrder() supports only one parameter among triggerPrice, stopLossPrice and takeProfitPrice');
            }
            request['triggerPrice'] = stopLossPrice;
            request['triggerType'] = 1;
        } else if (takeProfitPrice !== undefined) {
            request['triggerPrice'] = takeProfitPrice;
            request['triggerType'] = 2;
        }
        const partner = this.safeString (this.options, 'partner', 'ccxt');
        let clientOrderId = partner + '_' + this.uuid22 ();
        [ clientOrderId, params ] = this.handleParamString (params, 'clientOrderId', clientOrderId);
        request['clientOrderId'] = clientOrderId;
        return this.extend (request, params);
    }

    encodeMarginMode (marginMode) {
        const modes = {
            'cross': '1',
            'isolated': '2',
        };
        return this.safeString (modes, marginMode, marginMode);
    }

    async createMarketBuyOrderWithCost (symbol: string, cost: number, params = {}): Promise<Order> {
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        if (reduceOnly) {
            throw new NotSupported (this.id + ' createMarketBuyOrderWithCost() does not support reduceOnly orders');
        }
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if ((stopLossPrice !== undefined) || (takeProfitPrice !== undefined)) {
            throw new NotSupported (this.id + ' createMarketBuyOrderWithCost() does not support stopLossPrice or takeProfitPrice parameters');
        }
        return await this.createOrder (symbol, 'market', 'buy', cost, 1, this.extend ({ 'cost': cost }, params));
    }

    async createMarketSellOrderWithCost (symbol: string, cost: number, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new NotSupported (this.id + ' createMarketSellOrderWithCost() is supported for contract markets only');
        }
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        if (reduceOnly) {
            throw new NotSupported (this.id + ' createMarketSellOrderWithCost() does not support reduceOnly orders');
        }
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if ((stopLossPrice !== undefined) || (takeProfitPrice !== undefined)) {
            throw new NotSupported (this.id + ' createMarketSellOrderWithCost() does not support stopLossPrice or takeProfitPrice parameters');
        }
        return await this.createOrder (symbol, 'market', 'sell', cost, 1, this.extend ({ 'cost': cost }, params));
    }

    async createMarketOrderWithCost (symbol: string, side: OrderSide, cost: number, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new NotSupported (this.id + ' createMarketOrderWithCost() is supported for contract markets only');
        }
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        if (reduceOnly) {
            throw new NotSupported (this.id + ' createMarketOrderWithCost() does not support reduceOnly orders');
        }
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if ((stopLossPrice !== undefined) || (takeProfitPrice !== undefined)) {
            throw new NotSupported (this.id + ' createMarketOrderWithCost() does not support stopLossPrice or takeProfitPrice parameters');
        }
        return await this.createOrder (symbol, 'market', side, cost, 1, this.extend ({ 'cost': cost }, params));
    }

    /**
     * @method
     * @name bitbaby#createOrders
     * @description create a list of trade spot orders
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#pi-liang-xia-dan // spot
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        const ordersRequests = [];
        const length = orders.length;
        if (length > 10) {
            throw new BadRequest (this.id + ' createOrders() can only create up to 10 orders at a time');
        }
        const firstOrder = this.safeDict (orders, 0);
        const firstSymbol = this.safeString (firstOrder, 'symbol');
        const firstMarket = this.market (firstSymbol);
        const symbol = firstMarket['symbol'];
        for (let i = 0; i < orders.length; i++) {
            const order = this.safeDict (orders, i);
            const orderSymbol = this.safeString (order, 'symbol');
            const market = this.market (orderSymbol);
            if (!market['spot']) {
                throw new NotSupported (this.id + ' createOrders() supports spot orders only');
            }
            if (market['symbol'] !== symbol) {
                throw new BadRequest (this.id + ' createOrders() supports orders with the same symbol only');
            }
            const type = this.safeStringUpper (order, 'type');
            const side = this.safeStringUpper (order, 'side');
            const amount = this.safeString (order, 'amount');
            const price = this.safeString (order, 'price');
            const orderRequest: Dict = {
                'side': side,
                'batchType': type,
                'volume': this.parseNumber (this.amountToPrecision (symbol, amount)),
            };
            if (price !== undefined) {
                orderRequest['price'] = this.parseNumber (this.priceToPrecision (symbol, price));
            }
            ordersRequests.push (orderRequest);
        }
        const request: Dict = {
            'symbol': firstMarket['id'],
            'orders': ordersRequests,
        };
        const response = await this.privatePostSpotOpenSapiV1BatchOrders (this.extend (request, params));
        //
        //     {
        //         "ids": [
        //             "3176908865623394614",
        //             "3176908865623394615"
        //         ],
        //         "newClientOrderIds": [
        //             "",
        //             ""
        //         ]
        //     }
        //
        const ids = this.safeList (response, 'ids', []);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = this.safeString (ids, i);
            const parsed = this.safeOrder ({
                'id': id,
                'symbol': firstMarket['symbol'],
                'info': response,
            });
            result.push (parsed);
        }
        return result as Order[];
    }

    /**
     * @method
     * @name bitbaby#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#ding-dan-cha-xun // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#ding-dan-xiang-qing // contract
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, required if id is not provided
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        const market = this.market (symbol);
        const marketId = market['id'];
        const isContract = market['contract'];
        const request: Dict = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, [ 'clientOrderId' ]);
        if (clientOrderId === undefined) {
            if (id === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires an id argument or a clientOrderId in params');
            } else {
                request['orderId'] = id;
            }
        } else if (isContract) {
            request['clientOrderId'] = clientOrderId;
        } else {
            request['newClientOrderId'] = clientOrderId;
        }
        let response = undefined;
        if (isContract) {
            request['contractName'] = marketId;
            //
            //     {
            //         "side": "BUY",
            //         "executedQty": 109,
            //         "orderId": 3221406049627539350,
            //         "origQty": 10.0000000000000000,
            //         "avgPrice": 0.09117000,
            //         "type": "MARKET",
            //         "price": 0E-16,
            //         "transactTime": 1775221360000,
            //         "action": "OPEN",
            //         "contractName": "E-DOGE-USDT",
            //         "timeInForce": "",
            //         "fills": [
            //             {
            //                 "tradeId": 42501154,
            //                 "price": 0.0911700000000000,
            //                 "qty": 109,
            //                 "commission": 0.0059625180000000,
            //                 "commissionCoin": "USDT"
            //             }
            //         ],
            //         "status": "FILLED"
            //     }
            //
            response = await this.privateGetFuturesOpenFapiV1Order (this.extend (request, params));
        } else {
            request['symbol'] = marketId;
            //
            //     {
            //         "symbol": "dogeusdt",
            //         "side": "BUY",
            //         "executedQty": 0E-16,
            //         "orderId": "3176908865623394614",
            //         "price": 0.0100000000000000,
            //         "origQty": 20.0000000000000000,
            //         "avgPrice": 0E-16,
            //         "transactTime": 1775156645000,
            //         "type": "LIMIT",
            //         "status": "New Order"
            //     }
            //
            response = await this.privateGetSpotOpenSapiV1Order (this.extend (request, params));
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bitbaby#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#dang-qian-ding-dan // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#dang-qian-ding-dan // contract
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        const marketId = market['id'];
        const isContract = market['contract'];
        const request: Dict = {};
        let response = undefined;
        if (isContract) {
            request['contractName'] = marketId;
            //
            //     [
            //         {
            //             "side": "SELL",
            //             "clientId": "1_0.7_1775037590976_sell_s0p",
            //             "executedQty": 2189,
            //             "orderId": 3215386721681467793,
            //             "origQty": 46869.0000000000000000,
            //             "avgPrice": 0.09235000,
            //             "mergeSplitMode": 1,
            //             "type": "LIMIT",
            //             "positionId": 107154,
            //             "price": 0.0923500000000000,
            //             "transactTime": 1775037591000,
            //             "action": "OPEN",
            //             "contractName": "E-DOGE-USDT",
            //             "timeInForce": "POST_ONLY",
            //             "status": "PART_FILLED"
            //         }
            //     ]
            //
            //
            response = await this.privateGetFuturesOpenFapiV1OpenOrders (this.extend (request, params));
            if (!Array.isArray (response)) {
                response = []; // if no open orders, the exchange returns an object with empty data instead of an empty array
            }
        } else {
            request['symbol'] = marketId;
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            //
            //     [
            //         {
            //             "symbol": "DOGEUSDT",
            //             "newClientOrderId": null,
            //             "side": "BUY",
            //             "executedQty": "0",
            //             "orderId": "3176908865623394614",
            //             "price": "0.01",
            //             "origQty": "20",
            //             "avgPrice": "0",
            //             "time": 1775156645000,
            //             "type": "LIMIT",
            //             "status": "New Order"
            //         }
            //     ]
            //
            response = await this.privateGetSpotOpenSapiV1OpenOrders (this.extend (request, params));
        }
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name bitbaby#fetchCanceledAndClosedOrders
     * @description fetches information on multiple closed and canceled orders made by the user on contract markets
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#li-shi-wei-tuo
     * @param {string} symbol unified market symbol of the closed orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of closed orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['contractName'] = market['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchCanceledAndClosedOrders', market, params);
        if (marketType === 'spot') {
            throw new NotSupported (this.id + ' fetchCanceledAndClosedOrders() is supported for contract markets only');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostFuturesOpenFapiV1OrderHistorical (this.extend (request, params));
        //
        //     [
        //         {
        //             "ctimeMs": 1775226235000,
        //             "positionType": 1,
        //             "orderId": 3221406427584532474,
        //             "avgPrice": 0E-8,
        //             "realizedAmount": 0E-16,
        //             "fee": 0E-16,
        //             "mergeSplitMode": 1,
        //             "source": 3,
        //             "type": 1,
        //             "closeTakerFeeRate": 0.00060000,
        //             "openMakerFeeRate": 0.00020000,
        //             "dealVolume": 0,
        //             "price": 0.0100000000000000,
        //             "ctime": "2026-04-03T14:23:55",
        //             "contractName": "E-DOGE-USDT",
        //             "openTakerFeeRate": 0.00060000,
        //             "side": "BUY",
        //             "clientId": "0",
        //             "openOrClose": "OPEN",
        //             "leverageLevel": 20,
        //             "volume": 30.0000000000000000,
        //             "positionId": 0,
        //             "closeMakerFeeRate": 0.00020000,
        //             "contractId": 30,
        //             "dealMoney": 0E-16,
        //             "status": 4
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name bitbaby#cancelOrder
     * @description cancels an open order
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#che-xiao-ding-dan // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#qu-xiao-ding-dan // contract
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns Response from the exchange
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        const market = this.market (symbol);
        const marketId = market['id'];
        const request: Dict = {
            'orderId': id,
        };
        let response = undefined;
        if (market['contract']) {
            request['contractName'] = marketId;
            response = await this.privatePostFuturesOpenFapiV1Cancel (this.extend (request, params));
        } else {
            request['symbol'] = marketId;
            response = await this.privatePostSpotOpenSapiV1Cancel (this.extend (request, params));
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bitbaby#cancelOrders
     * @description cancel multiple orders for contract markets
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#pi-liang-che-xiao-ding-dan // spot
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' cancelOrders() supports spot markets only');
        }
        const request: Dict = {
            'symbol': market['id'],
            'orderIds': ids,
        };
        const response = await this.privatePostSpotOpenSapiV1BatchCancel (this.extend (request, params));
        const allOrders = [];
        const successIds = this.safeList (response, 'success', []);
        for (let i = 0; i < successIds.length; i++) {
            const id = successIds[i];
            allOrders.push (this.safeOrder ({ 'id': id, 'status': 'canceled' }, market));
        }
        const failIds = this.safeList (response, 'failed', []);
        for (let i = 0; i < failIds.length; i++) {
            const id = failIds[i];
            allOrders.push (this.safeOrder ({ 'id': id, 'status': 'failed' }, market));
        }
        return allOrders as Order[];
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder spot
        //     {
        //         "symbol": "dogeusdt",
        //         "newClientOrderId": null,
        //         "side": "BUY",
        //         "executedQty": 0,
        //         "orderId": [
        //             "3176901856236716480"
        //         ],
        //         "price": 0,
        //         "origQty": 20,
        //         "clientOrderId": null,
        //         "transactTime": 1775144786145,
        //         "type": "MARKET",
        //         "status": "NEW"
        //     }
        //
        // fetchOrder spot (limit)
        //     {
        //         "symbol": "dogeusdt",
        //         "side": "BUY",
        //         "executedQty": 0E-16,
        //         "orderId": "3176908865623394614",
        //         "price": 0.0100000000000000,
        //         "origQty": 20.0000000000000000,
        //         "avgPrice": 0E-16,
        //         "transactTime": 1775156645000,
        //         "type": "LIMIT",
        //         "status": "New Order"
        //     }
        //
        // fetchOrder spot (market)
        //     {
        //         "symbol": "dogeusdt",
        //         "side": "BUY",
        //         "executedQty": 222.0988300000000000,
        //         "orderId": "3176908865623394615",
        //         "price": 0E-16,
        //         "origQty": 20.0000000000000000,
        //         "avgPrice": 0.0900500000000000,
        //         "transactTime": 1775156645000,
        //         "type": "MARKET",
        //         "status": "Partially Filled/Cancelled"
        //     }
        //
        // fetchOrder contract
        //     {
        //         "side": "BUY",
        //         "executedQty": 109,
        //         "orderId": 3221406049627539350,
        //         "origQty": 10.0000000000000000,
        //         "avgPrice": 0.09117000,
        //         "type": "MARKET",
        //         "price": 0E-16,
        //         "transactTime": 1775221360000,
        //         "action": "OPEN",
        //         "contractName": "E-DOGE-USDT",
        //         "timeInForce": "",
        //         "fills": [
        //             {
        //                 "tradeId": 42501154,
        //                 "price": 0.0911700000000000,
        //                 "qty": 109,
        //                 "commission": 0.0059625180000000,
        //                 "commissionCoin": "USDT"
        //             }
        //         ],
        //         "status": "FILLED"
        //     }
        //
        // fetchOpenOrders spot
        //     {
        //         "symbol": "DOGEUSDT",
        //         "newClientOrderId": null,
        //         "side": "BUY",
        //         "executedQty": "0",
        //         "orderId": "3176908865623394614",
        //         "price": "0.01",
        //         "origQty": "20",
        //         "avgPrice": "0",
        //         "time": 1775156645000,
        //         "type": "LIMIT",
        //         "status": "New Order"
        //     }
        //
        // fetchOpenOrders contract
        //     {
        //         "side": "SELL",
        //         "clientId": "1_0.7_1775037590976_sell_s0p",
        //         "executedQty": 2189,
        //         "orderId": 3215386721681467793,
        //         "origQty": 46869.0000000000000000,
        //         "avgPrice": 0.09235000,
        //         "mergeSplitMode": 1,
        //         "type": "LIMIT",
        //         "positionId": 107154,
        //         "price": 0.0923500000000000,
        //         "transactTime": 1775037591000,
        //         "action": "OPEN",
        //         "contractName": "E-DOGE-USDT",
        //         "timeInForce": "POST_ONLY",
        //         "status": "PART_FILLED"
        //     }
        //
        // fetchCanceledAndClosedOrders contract
        //     {
        //         "ctimeMs": 1775226235000,
        //         "positionType": 1,
        //         "orderId": 3221406427584532474,
        //         "avgPrice": 0E-8,
        //         "realizedAmount": 0E-16,
        //         "fee": 0E-16,
        //         "mergeSplitMode": 1,
        //         "source": 3,
        //         "type": 1,
        //         "closeTakerFeeRate": 0.00060000,
        //         "openMakerFeeRate": 0.00020000,
        //         "dealVolume": 0,
        //         "price": 0.0100000000000000,
        //         "ctime": "2026-04-03T14:23:55",
        //         "contractName": "E-DOGE-USDT",
        //         "openTakerFeeRate": 0.00060000,
        //         "side": "BUY",
        //         "clientId": "0",
        //         "openOrClose": "OPEN",
        //         "leverageLevel": 20,
        //         "volume": 30.0000000000000000,
        //         "positionId": 0,
        //         "closeMakerFeeRate": 0.00020000,
        //         "contractId": 30,
        //         "dealMoney": 0E-16,
        //         "status": 4
        //     }
        //
        const marketId = this.safeString2 (order, 'contractName', 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerN (order, [ 'transactTime', 'time', 'ctimeMs' ]);
        let id = this.safeString2 (order, 'orderId', 'id');
        const orderIds = this.safeList (order, 'orderId');
        if ((id === undefined) && (orderIds !== undefined)) {
            id = this.safeString (orderIds, 0);
        }
        const rawStatus = this.safeStringUpper (order, 'status');
        const side = this.safeStringLower (order, 'side');
        const rawType = this.safeStringLower (order, 'type');
        const type = this.parseOrderType (rawType);
        let amount = this.safeString2 (order, 'origQty', 'volume');
        const openOrClose = this.safeStringUpper2 (order, 'openOrClose', 'action');
        const isBuy = (side === 'buy');
        const isOpen = (openOrClose === 'OPEN');
        const isMarket = (type === 'market');
        const isSpot = market['spot'];
        const spotMarketBuy = isSpot && isBuy && isMarket;
        const isContractMarketOpen = !isSpot && isMarket && isOpen;
        if (spotMarketBuy || isContractMarketOpen) {
            // for spot market buy and swap market open orders this value is in quote currency
            amount = undefined;
        }
        let postOnly = undefined;
        let timeInForce = this.safeStringUpper (order, 'timeInForce');
        if (timeInForce !== undefined) {
            if (timeInForce === 'POST_ONLY') {
                timeInForce = 'PO';
                postOnly = true;
            } else {
                postOnly = false;
            }
        }
        let fee = undefined;
        const feeAmount = this.safeString (order, 'fee'); // only in contract orders
        if (feeAmount !== undefined) {
            fee = {
                'cost': feeAmount,
                'currency': market['settle'],
            };
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': this.safeStringN (order, [ 'clientOrderId', 'newClientOrderId', 'clientId' ]),
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': undefined,
            'side': side,
            'amount': amount,
            'price': this.omitZero (this.safeString (order, 'price')),
            'triggerPrice': undefined,
            'cost': this.safeString (order, 'dealMoney'),
            'filled': this.safeString2 (order, 'executedQty', 'dealVolume'),
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
            'status': this.parseOrderStatus (rawStatus),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'average': this.omitZero (this.safeString (order, 'avgPrice')),
            'trades': this.safeList (order, 'fills'),
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'NEW ORDER': 'open',
            'INIT': 'open',
            'PARTIALLY_FILLED': 'open',
            'PART_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'CANCELLED': 'canceled',
            'PENDING_CANCEL': 'pending',
            'PARTIALLY FILLED/CANCELLED': 'closed',
            'REJECTED': 'rejected',
            '2': 'closed',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types = {
            'limit': 'limit',
            'market': 'market',
            '1': 'limit',
            '2': 'market',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name bitbaby#fetchMyTrades
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#jiao-yi-ji-lu // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#jiao-yi-ji-lu // contract
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        const market = this.market (symbol);
        const marketId = market['id'];
        const isContract = market['contract'];
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (isContract) {
            request['contractName'] = marketId;
            //
            //     [
            //         {
            //             "symbol": "DOGE-USDT",
            //             "amount": 9.93753000000000000000000000000000,
            //             "side": "BUY",
            //             "fee": "0.005962518",
            //             "isMaker": false,
            //             "isBuyer": true,
            //             "bidId": 3221406049627539350,
            //             "bidUserId": 20290,
            //             "price": 0.0911700000000000,
            //             "qty": 109,
            //             "askId": 3221403661625561316,
            //             "contractName": "E-DOGE-USDT",
            //             "time": 1775221360000,
            //             "tradeId": 42501154,
            //             "askUserId": 10016
            //         }
            //     ]
            //
            response = await this.privateGetFuturesOpenFapiV1MyTrades (this.extend (request, params));
        } else {
            request['symbol'] = marketId;
            //
            //     [
            //         {
            //             "symbol": "DOGEUSDT",
            //             "side": "BUY",
            //             "fee": "0.4652193",
            //             "isMaker": false,
            //             "isBuyer": true,
            //             "bidId": 3206077345740844498,
            //             "bidUserId": 1047121,
            //             "feeCoin": "DOGE",
            //             "price": "0.09028",
            //             "qty": "232.60965",
            //             "askId": 3176911270805052610,
            //             "id": "6137967",
            //             "time": 1775161045250,
            //             "isSelf": false,
            //             "askUserId": 1000048
            //         }
            //     ]
            //
            response = await this.privateGetSpotOpenSapiV1MyTrades (this.extend (request, params));
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name bitbaby#fetchBalance
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/xian-huo-jiao-yi#zhang-hu-xin-xi // spot
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#zhang-hu // contract
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
            //         "balances": [
            //             {
            //                 "asset": "BSCUSDT",
            //                 "free": "0.0000000000",
            //                 "locked": "0.0000000000"
            //             }
            //         ]
            //     }
            response = await this.privateGetSpotOpenSapiV1Account (params);
        } else {
            //
            //     {
            //         "account": [
            //             {
            //                 "marginCoin": "USDT",
            //                 "accountNormal": 29.9627736560000000,
            //                 "accountLock": 0E-16,
            //                 "partPositionNormal": 0E-16,
            //                 "totalPositionNormal": 0,
            //                 "achievedAmount": 0,
            //                 "unrealizedAmount": 0,
            //                 "totalMarginRate": 0,
            //                 "totalEquity": 29.9627736560000000,
            //                 "partEquity": 0E-16,
            //                 "totalCost": 0,
            //                 "sumMarginRate": 0,
            //                 "positionVos": [],
            //                 "totalHisRealizeAmount": null,
            //                 "accountAmount": null,
            //                 "totalShareAmount": null,
            //                 "walletBalance": null,
            //                 "recoverableAmount": null,
            //                 "availableAmount": null
            //             },
            //             {
            //                 "marginCoin": "USDC",
            //                 "accountNormal": 0E-16,
            //                 "accountLock": 0E-16,
            //                 "partPositionNormal": 0E-16,
            //                 "totalPositionNormal": 0,
            //                 "achievedAmount": 0,
            //                 "unrealizedAmount": 0,
            //                 "totalMarginRate": 0,
            //                 "totalEquity": 0E-16,
            //                 "partEquity": 0E-16,
            //                 "totalCost": 0,
            //                 "sumMarginRate": 0,
            //                 "positionVos": [],
            //                 "totalHisRealizeAmount": null,
            //                 "accountAmount": null,
            //                 "totalShareAmount": null,
            //                 "walletBalance": null,
            //                 "recoverableAmount": null,
            //                 "availableAmount": null
            //             }
            //         ]
            //     }
            //
            response = await this.privateGetFuturesOpenFapiV1Account (params);
            const account = this.safeList (response, 'account');
            if (account === undefined) {
                response = JSON.parse (response);
            }
        }
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        const balances = this.safeList2 (response, 'balances', 'account', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = this.safeDict (balances, i);
            const id = this.safeString2 (entry, 'asset', 'marginCoin');
            const code = this.safeCurrencyCode (id);
            const account = this.account ();
            account['free'] = this.safeString2 (entry, 'accountNormal', 'free');
            account['used'] = this.safeString2 (entry, 'accountLock', 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name bitbaby#fetchPositions
     * @description fetch all open positions
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#zhang-hu
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.privateGetFuturesOpenFapiV1Account (params);
        let account = this.safeList (response, 'account');
        if (account === undefined) {
            const parsedResponse = JSON.parse (response);
            account = this.safeList (parsedResponse, 'account', []);
        }
        const positions = [];
        for (let i = 0; i < account.length; i++) {
            const entry = this.safeDict (account, i);
            const positionVos = this.safeList (entry, 'positionVos', []);
            const first = this.safeDict (positionVos, 0, {});
            const innerPositions = this.safeList (first, 'positions', []);
            for (let j = 0; j < innerPositions.length; j++) {
                const innerPosition = this.safeDict (innerPositions, j);
                positions.push (innerPosition);
            }
        }
        return this.parsePositions (positions, symbols);
    }

    /**
     * @method
     * @name bitbaby#fetchPositionHistory
     * @description fetches historical positions
     * @see https://bitbaby-1.gitbook.io/bitbaby-api/he-yue-jiao-yi#ying-kui-ji-lu
     * @param {string} symbol unified contract symbol
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum amount of records to fetch, default is 10
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionHistory (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'contractName': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostFuturesOpenFapiV1ProfitHistorical (this.extend (request, params));
        //
        //     [
        //         {
        //             "side": "SELL",
        //             "positionType": 1,
        //             "tradeFee": -0.0238342980000000,
        //             "realizedAmount": 0E-16,
        //             "leverageLevel": 20,
        //             "openPrice": 0.0911000000000000,
        //             "mtime": 1775224490000,
        //             "shareAmount": 0E-16,
        //             "openEndPrice": 0.0910950000000000,
        //             "closeProfit": -0.0053200000000000,
        //             "volume": 218.0000000000000000,
        //             "contractId": 30,
        //             "historyRealizedAmount": -0.0291542980000000,
        //             "ctime": 1775223325000,
        //             "contractName": "E-DOGE-USDT",
        //             "id": 111713,
        //             "capitalFee": 0E-16
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const position = this.safeDict (response, i);
            const parsedPosition = this.parsePosition (position, market);
            result.push (parsedPosition);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // fetchPositions
        //     {
        //         "id": 111728,
        //         "uid": 20290,
        //         "contractId": 30,
        //         "positionType": 1,
        //         "side": "SELL",
        //         "volume": 54,
        //         "openPrice": 0.09175,
        //         "positionValue": 4.9545,
        //         "avgPrice": 0.09175,
        //         "closePrice": 0,
        //         "leverageLevel": 20,
        //         "openAmount": 0.247725,
        //         "holdAmount": 0.247698,
        //         "closeVolume": 0,
        //         "pendingCloseVolume": 0,
        //         "realizedAmount": 0,
        //         "historyRealizedAmount": -0.0029727,
        //         "tradeFee": -0.0029727,
        //         "capitalFee": 0,
        //         "closeProfit": 0,
        //         "shareAmount": 0,
        //         "freezeLock": 0,
        //         "secret": "28caf3bbae9215030e055c9422830c39",
        //         "status": 1,
        //         "ctime": "2026-04-03T16:40:31",
        //         "mtime": "2026-04-03T16:40:31",
        //         "brokerId": 1000,
        //         "mergeSplitMode": 1,
        //         "lockTime": "2026-04-03T16:40:31",
        //         "mergeVolume": 0,
        //         "liquidationVolume": 0,
        //         "computerTakeOver": false,
        //         "marginAmount": null,
        //         "sumUnRealizedAmount": null,
        //         "sumKeepAmount": null,
        //         "sumPositionBalance": null,
        //         "config": {
        //             id: 30,
        //             "contractName": "E-DOGE-USDT",
        //             "contractOtherName": "DOGEUSDT",
        //             "symbol": "DOGE-USDT",
        //             "contractType": "E",
        //             "deliveryKind": "0",
        //             "contractSide": 1,
        //             "multiplier": 1,
        //             "multiplierCoin": "DOGE",
        //             "marginCoin": "USDT",
        //             "marginRateType": 0,
        //             "marginRate": 1,
        //             "quoteValue": 1,
        //             "quoteValueCoin": "USDT",
        //             "ladderConfigId": 27,
        //             "leverConfigId": 25,
        //             "capitalStartTime": 0,
        //             "capitalFrequency": 8,
        //             "capitalRate": 0.0001,
        //             "capitalDepthMoney": 8000,
        //             "capitalIntervalMin": -0.015,
        //             "capitalIntervalMax": 0.015,
        //             "capitalPremiumMin": -0.0005,
        //             "capitalPremiumMax": 0.0005,
        //             "openMakerFee": 0.0002,
        //             "openTakerFee": 0.0006,
        //             "closeMakerFee": 0.0002,
        //             "closeTakerFee": 0.0006,
        //             "minMakerFee": 0.0002,
        //             "minTakerFee": 0.0006,
        //             "settlementFrequency": 1,
        //             "lossSubsidy": 0.2,
        //             "riskAlarm": 0.3,
        //             "status": 1,
        //             "brokerId": 1,
        //             "merchantId": 0,
        //             "ctime": "2021-01-28T20:21:19",
        //             "mtime": "2026-03-29T07:47:02",
        //             "deliveryStatus": 0,
        //             "minOrderVolume": null,
        //             "maxMarketVolume": null,
        //             "maxLimitVolume": null,
        //             "multiplierShow": null,
        //             "exclusiveStatus": null,
        //             "liquidationServer": null,
        //             "contractTypeName": null,
        //             "contractSideDesc": null,
        //             "configLever": null,
        //             "configLadder": [Object],
        //             "statusDesc": null,
        //             "serverStatus": null,
        //             "sort": 14,
        //             "quote": null,
        //             "simpleSymbol": "e_dogeusdt",
        //             "base": null,
        //             "server": null,
        //             "positive": true
        //         },
        //         "keepRate": 0.0065,
        //         "maxFeeRate": 0.0006,
        //         "unRealizedAmount": 0.00054,
        //         "positionBalance": 4.95396,
        //         "orderUnitType": null,
        //         "openRealizedAmount": 0.00054,
        //         "coinPrecious": 4,
        //         "returnRate": 0.0021798365122615,
        //         "settleProfit": 0,
        //         "indexPrice": 0.09174,
        //         "reducePrice": -0.0917371443111948,
        //         "marginRate": 1.1976637178038319
        //     }
        //
        // fetchPositionHistory
        //     {
        //         "side": "SELL",
        //         "positionType": 1,
        //         "tradeFee": -0.0238342980000000,
        //         "realizedAmount": 0E-16,
        //         "leverageLevel": 20,
        //         "openPrice": 0.0911000000000000,
        //         "mtime": 1775224490000,
        //         "shareAmount": 0E-16,
        //         "openEndPrice": 0.0910950000000000,
        //         "closeProfit": -0.0053200000000000,
        //         "volume": 218.0000000000000000,
        //         "contractId": 30,
        //         "historyRealizedAmount": -0.0291542980000000,
        //         "ctime": 1775223325000,
        //         "contractName": "E-DOGE-USDT",
        //         "id": 111713,
        //         "capitalFee": 0E-16
        //     }
        //
        const config = this.safeDict (position, 'config', {});
        const marketId = this.safeString (config, 'contractName');
        market = this.safeMarket (marketId, market);
        let timestamp = this.safeInteger (position, 'ctime');
        let datetime = this.safeString (position, 'ctime');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (datetime);
        } else {
            datetime = this.iso8601 (timestamp);
        }
        let lastUpdateTimestamp = this.safeInteger (position, 'mtime');
        if (lastUpdateTimestamp === undefined) {
            const mtime = this.safeString (position, 'mtime');
            lastUpdateTimestamp = this.parse8601 (mtime);
        }
        const positionType = this.safeString (position, 'positionType');
        const side = this.safeStringUpper (position, 'side');
        return this.safePosition ({
            'info': position,
            'id': this.safeStringN (position, [ 'id', 'positionId', 'closeId' ]),
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': datetime,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'initialMargin': this.safeNumber (position, 'marginAmount'), // todo check
            'initialMarginPercentage': this.safeNumber (position, 'marginRate'), // todo check
            'maintenanceMargin': undefined, // todo check
            'maintenanceMarginPercentage': this.safeNumber (position, 'keepRate'), // todo check
            'entryPrice': this.safeNumber (position, 'openPrice'),
            'notional': this.safeNumber (position, 'positionValue'),
            'leverage': this.safeNumber (position, 'leverageLevel'),
            'unrealizedPnl': this.safeNumber (position, 'unRealizedAmount'),
            'contracts': this.safeNumber (position, 'volume'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'realizedPnl': this.safeNumber (position, 'closeProfit'),
            'marginRatio': this.safeNumber (position, 'marginRate'),
            'liquidationPrice': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'collateral': this.safeString (position, 'positionBalance'), // todo check
            'marginMode': this.parsePositionMarginMode (positionType),
            'side': this.parsePositionSide (side),
            'percentage': this.safeNumber (position, 'returnRate'), // todo check
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    parsePositionMarginMode (mode) {
        const modes = {
            '1': 'cross',
            '2': 'isolated',
        };
        return this.safeString (modes, mode, mode);
    }

    parsePositionSide (side) {
        const sides = {
            'BUY': 'long',
            'SELL': 'short',
        };
        return this.safeString (sides, side, side);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                endpoint += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            let signaturePath = endpoint.replace ('spot/open', '');
            signaturePath = signaturePath.replace ('futures/open', '');
            let payload = timestamp + method + signaturePath;
            if (method === 'POST') {
                body = this.json (query);
                payload += body;
            }
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
            headers = {
                'X-CH-APIKEY': this.apiKey,
                'X-CH-SIGN': signature,
                'X-CH-TS': timestamp,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        }
        const url = this.urls['api'][api] + '/' + endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        //
        // bad
        // {"code":"10081","msg":"Take profit order volume must be greater than minimum value 30 contracts","data":{"custom_error_tips":["30"]},"msgData":null,"succ":false}
        // good
        // {"code":"0","msg":"成功","data":null}
        //
        const errorCode = this.safeString (response, 'code');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const message = this.safeString2 (response, 'msg', 'data', '');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
