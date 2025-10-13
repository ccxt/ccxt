//  ---------------------------------------------------------------------------

import Exchange from './abstract/toobit.js';
import { OperationFailed, ArgumentsRequired, ExchangeError, BadRequest, OrderNotFound, BadSymbol, NotSupported, PermissionDenied, RateLimitExceeded, OperationRejected, InvalidOrder, InsufficientFunds } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, Balances, OrderType, OHLCV, Order, Str, Trade, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, TransferEntry, Num, Dict, int, DepositAddress, Market, MarketInterface, FundingRateHistory, LedgerEntry, Position, FundingRate, FundingRates, TradingFees, Leverage, Currencies } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class toobit
 * @augments Exchange
 */
export default class toobit extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'toobit',
            'name': 'Toobit',
            'countries': [ 'KY' ], // Cayman Islands
            'version': 'v1',
            'rateLimit': 20, // 50 requests per second
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLastPrices': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchStatus': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'setMarginMode': true,
                'transfer': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/3fc13870-5406-431b-8be0-2aab69c4f225',
                'api': {
                    'common': 'https://api.toobit.com',
                    'private': 'https://api.toobit.com',
                },
                'www': 'https://www.toobit.com/',
                'doc': [
                    'https://toobit-docs.github.io/apidocs/spot/v1/en/',
                    'https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/',
                ],
                'referral': {
                    'url': 'https://www.toobit.com/en-US/r?i=IFFPy0',
                    'discount': 0.1,
                },
                'fees': 'https://www.toobit.com/fee',
            },
            'api': {
                'common': {
                    'get': {
                        'api/v1/time': 1,
                        'api/v1/ping': 1,
                        'api/v1/exchangeInfo': 1,
                        'quote/v1/depth': 1, // todo: by limit 1-10
                        'quote/v1/depth/merged': 1,
                        'quote/v1/trades': 1,
                        'quote/v1/klines': 1,
                        'quote/v1/index/klines': 1,
                        'quote/v1/markPrice/klines': 1,
                        'quote/v1/markPrice': 1,
                        'quote/v1/index': 1,
                        'quote/v1/ticker/24hr': 40, // todo: 1-40 depenidng noSymbol
                        'quote/v1/contract/ticker/24hr': 40, // todo: 1-40 depenidng noSymbol
                        'quote/v1/ticker/price': 1,
                        'quote/v1/ticker/bookTicker': 1,
                        'api/v1/futures/fundingRate': 1,
                        'api/v1/futures/historyFundingRate': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/v1/account': 5,
                        'api/v1/account/checkApiKey': 1,
                        'api/v1/spot/order': 1 * 1.67,
                        'api/v1/spot/openOrders': 1 * 1.67,
                        'api/v1/futures/openOrders': 1 * 1.67,
                        'api/v1/spot/tradeOrders': 5 * 1.67,
                        'api/v1/futures/historyOrders': 5 * 1.67,
                        'api/v1/account/trades': 5 * 1.67,
                        'api/v1/account/balanceFlow': 5,
                        'api/v1/account/depositOrders': 5,
                        'api/v1/account/withdrawOrders': 5,
                        'api/v1/account/deposit/address': 1,
                        // contracts
                        'api/v1/subAccount': 5,
                        'api/v1/futures/accountLeverage': 1,
                        'api/v1/futures/order': 1 * 1.67,
                        'api/v1/futures/positions': 5 * 1.67,
                        'api/v1/futures/balance': 5,
                        'api/v1/futures/userTrades': 5 * 1.67,
                        'api/v1/futures/balanceFlow': 5,
                        'api/v1/futures/commissionRate': 5,
                        'api/v1/futures/todayPnl': 5,
                    },
                    'post': {
                        'api/v1/spot/orderTest': 1 * 1.67,
                        'api/v1/spot/order': 1 * 1.67,
                        'api/v1/futures/order': 1 * 1.67,
                        'api/v1/spot/batchOrders': 2 * 1.67,
                        'api/v1/subAccount/transfer': 1,
                        'api/v1/account/withdraw': 1,
                        // contracts
                        'api/v1/futures/marginType': 1,
                        'api/v1/futures/leverage': 1,
                        'api/v1/futures/batchOrders': 2 * 1.67,
                        'api/v1/futures/position/trading-stop': 3 * 1.67,
                        'api/v1/futures/positionMargin': 1,
                        'api/v1/userDataStream': 1,
                        'api/v1/listenKey': 1,
                    },
                    'delete': {
                        'api/v1/spot/order': 1 * 1.67,
                        'api/v1/futures/order': 1 * 1.67,
                        'api/v1/spot/openOrders': 5 * 1.67,
                        'api/v1/futures/batchOrders': 5 * 1.67,
                        'api/v1/spot/cancelOrderByIds': 5 * 1.67,
                        'api/v1/futures/cancelOrderByIds': 5 * 1.67,
                        'api/v1/listenKey': 1,
                    },
                    'put': {
                        'api/v1/listenKey': 1,
                    },
                },
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
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
                    '-1000': OperationFailed, // An unknown error occurred while processing the request.
                    '-1001': OperationFailed, // Internal error; unable to process your request. Please try again.
                    '-1002': PermissionDenied, // You are not authorized to execute this request.
                    '-1003': RateLimitExceeded, // TOO_MANY_REQUESTS
                    '-1004': BadRequest, // {"code":-1004,"msg":"Missing required parameter \u0027xyz\u0027"} | {"code":-1004,"msg":"Bad request"}
                    '-1006': OperationFailed, // An unexpected response was received from the message bus. Execution status unknown
                    '-1007': OperationFailed, // Timeout waiting for response from backend server. Send status unknown; execution status unknown.
                    '-1014': OperationFailed, // Unsupported order combination.
                    '-1015': RateLimitExceeded, // Too many new orders
                    '-1016': OperationRejected, // This service is no longer available.
                    '-1020': OperationRejected, // This operation is not supported.
                    '-1021': OperationRejected, // Timestamp for this request is outside of the recvWindow.
                    '-1022': OperationRejected, // Signature for this request is not valid.
                    '-1100': BadRequest, // Illegal characters found in a parameter.
                    '-1101': BadRequest, // Too many parameters sent for this endpoint.
                    '-1102': BadRequest, // A mandatory parameter was not sent, was empty/null, or malformed
                    '-1103': BadRequest, // An unknown parameter was sent
                    '-1104': BadRequest, // Not all sent parameters were read
                    '-1105': BadRequest, // A parameter was empty
                    '-1106': BadRequest, // A parameter was sent when not required
                    '-1111': BadRequest, // Precision is over the maximum defined for this asset.
                    '-1112': OperationRejected, // No orders on book for symbol.
                    '-1114': BadRequest, // TimeInForce parameter sent when not required.
                    '-1115': BadRequest, // Invalid timeInForce
                    '-1116': BadRequest, // Invalid orderType
                    '-1117': BadRequest, // Invalid side
                    '-1118': InvalidOrder, // New client order ID was empty.
                    '-1119': InvalidOrder, // Original client order ID was empty
                    '-1120': BadRequest, // Invalid interval
                    '-1121': BadRequest, // Invalid symbol
                    '-1125': OperationRejected, // This listenKey does not exist.
                    '-1127': OperationRejected, // Lookup interval is too big
                    '-1128': BadRequest, // Combination of optional parameters invalid
                    '-1130': BadRequest, // Invalid data sent for a parameter
                    '-1132': OperationRejected, // Order price too high
                    '-1133': OperationRejected, // Order price lower than the minimum,please check general broker info
                    '-1134': OperationRejected, // Order price decimal too long,please check general broker info
                    '-1135': OperationRejected, // Order quantity too large
                    '-1136': OperationRejected, // Order quantity lower than the minimum
                    '-1137': OperationRejected, // Order quantity decimal too long
                    '-1138': OperationRejected, // Order price exceeds permissible range
                    '-1139': OperationRejected, // Order has been filled
                    '-1140': OperationRejected, // Transaction amount lower than the minimum
                    '-1141': InvalidOrder, // Duplicate clientOrderId
                    '-1142': InvalidOrder, // Order has been canceled
                    '-1143': InvalidOrder, // Cannot be found on order book
                    '-1144': OperationRejected, // Order has been locked
                    '-1145': OperationRejected, // This order type does not support cancellation
                    '-1146': OperationFailed, // Order creation timeout
                    '-1147': OperationFailed, // Order cancellation timeout
                    '-1193': OperationRejected, // Create order count limit
                    '-1194': OperationRejected, // Create market order forbidden
                    '-1195': OperationRejected, // Create limit order price too small
                    '-1196': OperationRejected, // Create limit order price too big
                    '-1197': OperationRejected, // Create limit order buy price too big
                    '-1198': OperationRejected, // Create limit order sell price too small
                    '-1199': OperationRejected, // Create order buy quantity too small
                    '-1200': OperationRejected, // Create order buy quantity too big
                    '-1201': OperationRejected, // Create limit order sell price too big
                    '-1202': OperationRejected, // Create order sell quantity too small
                    '-1203': OperationRejected, // Create order sell quantity too big
                    '-1206': OperationRejected, // Orders over the maximum transaction amount
                    '-2010': OperationFailed, // NEW_ORDER_REJECTED
                    '-2011': OperationFailed, // CANCEL_REJECTED
                    '-2013': InvalidOrder, // Order does not exist.
                    '-2014': PermissionDenied, // API-key format invalid.
                    '-2015': PermissionDenied, // Invalid API-key, IP, or permissions for action.
                    '-2016': BadRequest, // No trading window could be found for the symbol. Try ticker/24hrs instead.
                    // errors above 3xxx are from swap API
                    '-3050': ExchangeError, // CREATE_API_KEY_EXCEED_LIMIT
                    '-3101': OperationRejected, // open margin account error
                    '-3102': OperationRejected, // get margin safety error
                    '-3103': BadRequest, // risk config is not exit
                    '-3105': OperationRejected, // token can not borrow
                    '-3107': OperationRejected, // token can not withdraw
                    '-3108': OperationRejected, // get token avail withdraw error
                    '-3109': OperationRejected, // margin withdraw failed
                    '-3110': InsufficientFunds, // margin avail withdraw not enough failed
                    '-3116': OperationRejected, // repay fail
                    '-3117': OperationRejected, // get margin all position fail
                    '-3120': OperationRejected, // get repay order fail
                    '-3124': OperationRejected, // Position and order data error
                    '-3125': OperationRejected, // Position size cannot meet target leverage
                    '-3126': OperationRejected, // Adjust leverage fail
                    '-3127': OperationFailed, // Adjust leverage timeout
                    '-3128': OperationRejected, // The margin mode cannot be changed while you have an open order/position
                    '-3129': BadRequest, // cone futures change position type error
                    '-3130': OperationRejected, // order margin insufficient
                    '-3131': NotSupported, // Leverage reduction is not supported in Isolated Margin Mode with open positions.
                },
                'broad': {
                    'Unknown order sent': OrderNotFound,
                    'Duplicate order sent': InvalidOrder,
                    'Market is closed': OperationRejected,
                    'Account has insufficient balance for requested action': InsufficientFunds,
                    'Market orders are not supported for this symbol': OperationRejected,
                    'Iceberg orders are not supported for this symbol': OperationRejected,
                    'Stop loss orders are not supported for this symbol': OperationRejected,
                    'Stop loss limit orders are not supported for this symbol': OperationRejected,
                    'Take profit orders are not supported for this symbol': OperationRejected,
                    'Take profit limit orders are not supported for this symbol': OperationRejected,
                    'QTY is zero or less': BadRequest,
                    'IcebergQty exceeds QTY': OperationRejected,
                    'This action disabled is on this account': PermissionDenied,
                    'Unsupported order combination': BadRequest,
                    'Order would trigger immediately': OperationRejected,
                    'Cancel order is invalid. Check origClOrdId and orderId': OperationRejected,
                    'Order would immediately match and take': OperationRejected,
                },
            },
            'commonCurrencies': {},
            'options': {
                'defaultType': 'spot',
                'accountsByType': {
                    'spot': 'MAIN',
                    'swap': 'FUTURES',
                },
                'networks': {
                    'BTC': 'BTC',
                    'ERC20': 'ETH',
                    'ETH': 'ETH',
                    'BEP20': 'BSC',
                    'TRC20': 'TRX',
                    'SOL': 'SOL',
                    'MATIC': 'MATIC',
                    'ARBONE': 'ARBITRUM',
                    'BASE': 'BASE',
                    'TON': 'TON',
                    'AVAXC': 'AVAXC',
                    'DOGE': 'DOGE',
                    'XRP': 'XRP',
                    'DOT': 'DOT',
                    'ADA': 'ADA',
                    'LTC': 'LTC',
                    'APT': 'APT',
                    'ATOM': 'ATOM',
                    'ALGO': 'ALGO',
                    'NEAR': 'NEAR',
                    'XLM': 'XLM',
                    'SUI': 'SUI',
                    'ETC': 'ETC',
                    'EOS': 'EOS',
                    'WAVES': 'WAVES',
                    'ICP': 'ICP',
                    'ONE': 'ONE',
                    // 'CHZ2': 'CHZ2',
                },
                'networksById': {
                    'ETH': 'ERC20',
                    'ERC20': 'ERC20',
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
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
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'untilDays': 100000,
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
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': undefined,
                },
                'forDerivatives': {
                    'createOrders': undefined,
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
        });
    }

    /**
     * @method
     * @name toobit#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#test-connectivity
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.commonGetApiV1Ping (params);
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
     * @name toobit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.commonGetApiV1Time (params);
        //
        //     {
        //         "serverTime": 1699827319559
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name toobit#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.commonGetApiV1ExchangeInfo (params);
        this.options['exchangeInfo'] = response; // we store it in options for later use in fetchMarkets
        //
        //    {
        //        "timezone": "UTC",
        //        "serverTime": "1755583099926",
        //        "brokerFilters": [],
        //        "symbols": [
        //            {
        //                "filters": [
        //                    {
        //                        "minPrice": "0.01",
        //                        "maxPrice": "10000000.00000000",
        //                        "tickSize": "0.01",
        //                        "filterType": "PRICE_FILTER"
        //                    },
        //                    {
        //                        "minQty": "0.0001",
        //                        "maxQty": "4000",
        //                        "stepSize": "0.0001",
        //                        "filterType": "LOT_SIZE"
        //                    },
        //                    {
        //                        "minNotional": "5",
        //                        "filterType": "MIN_NOTIONAL"
        //                    },
        //                    {
        //                        "minAmount": "5",
        //                        "maxAmount": "6600000",
        //                        "minBuyPrice": "0.01",
        //                        "filterType": "TRADE_AMOUNT"
        //                    },
        //                    {
        //                        "maxSellPrice": "99999999",
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "LIMIT_TRADING"
        //                    },
        //                    {
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "MARKET_TRADING"
        //                    },
        //                    {
        //                        "noAllowMarketStartTime": "0",
        //                        "noAllowMarketEndTime": "0",
        //                        "limitOrderStartTime": "0",
        //                        "limitOrderEndTime": "0",
        //                        "limitMinPrice": "0",
        //                        "limitMaxPrice": "0",
        //                        "filterType": "OPEN_QUOTE"
        //                    }
        //                ],
        //                "exchangeId": "301",
        //                "symbol": "ETHUSDT",
        //                "symbolName": "ETHUSDT",
        //                "status": "TRADING",
        //                "baseAsset": "ETH",
        //                "baseAssetName": "ETH",
        //                "baseAssetPrecision": "0.0001",
        //                "quoteAsset": "USDT",
        //                "quoteAssetName": "USDT",
        //                "quotePrecision": "0.01",
        //                "icebergAllowed": false,
        //                "isAggregate": false,
        //                "allowMargin": true,
        //             }
        //        ],
        //        "options": [],
        //        "contracts": [
        //            {
        //                 "filters": [ ... ],
        //                 "exchangeId": "301",
        //                 "symbol": "BTC-SWAP-USDT",
        //                 "symbolName": "BTC-SWAP-USDTUSDT",
        //                 "status": "TRADING",
        //                 "baseAsset": "BTC-SWAP-USDT",
        //                 "baseAssetPrecision": "0.001",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetPrecision": "0.1",
        //                 "icebergAllowed": false,
        //                 "inverse": false,
        //                 "index": "BTC",
        //                 "indexToken": "BTCUSDT",
        //                 "marginToken": "USDT",
        //                 "marginPrecision": "0.0001",
        //                 "contractMultiplier": "0.001",
        //                 "underlying": "BTC",
        //                 "riskLimits": [
        //                     {
        //                         "riskLimitId": "200020911",
        //                         "quantity": "42000.0",
        //                         "initialMargin": "0.02",
        //                         "maintMargin": "0.01",
        //                         "isWhite": false
        //                     },
        //                     {
        //                         "riskLimitId": "200020912",
        //                         "quantity": "84000.0",
        //                         "initialMargin": "0.04",
        //                         "maintMargin": "0.02",
        //                         "isWhite": false
        //                     },
        //                     ...
        //                 ]
        //            },
        //        ],
        //        "coins": [
        //            {
        //                "orgId": "9001",
        //                "coinId": "TCOM",
        //                "coinName": "TCOM",
        //                "coinFullName": "TCOM",
        //                "allowWithdraw": true,
        //                "allowDeposit": true,
        //                "chainTypes": [
        //                    {
        //                        "chainType": "BSC",
        //                        "withdrawFee": "49.55478",
        //                        "minWithdrawQuantity": "77",
        //                        "maxWithdrawQuantity": "0",
        //                        "minDepositQuantity": "48",
        //                        "allowDeposit": true,
        //                        "allowWithdraw": false
        //                    }
        //                ],
        //                "isVirtual": false
        //            },
        //          ...
        //
        const coins = this.safeList (response, 'coins', []);
        const result = {};
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const parsed = this.parseCurrency (coin);
            const code = parsed['code'];
            result[code] = parsed;
        }
        return result;
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'coinId');
        const code = this.safeCurrencyCode (id);
        const networks: Dict = {};
        const rawNetworks = this.safeList (rawCurrency, 'chainTypes');
        for (let j = 0; j < rawNetworks.length; j++) {
            const rawNetwork = rawNetworks[j];
            const networkId = this.safeString (rawNetwork, 'chainType');
            const networkCode = this.networkIdToCode (networkId);
            networks[networkCode] = {
                'id': networkId,
                'network': networkCode,
                'margin': undefined,
                'deposit': this.safeBool (rawNetwork, 'allowDeposit'),
                'withdraw': this.safeBool (rawNetwork, 'allowWithdraw'),
                'active': undefined,
                'fee': this.safeNumber (rawNetwork, 'withdrawFee'),
                'precision': undefined,
                'limits': {
                    'deposit': {
                        'min': this.safeNumber (rawNetwork, 'minDepositQuantity'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (rawNetwork, 'minWithdrawQuantity'),
                        'max': this.safeNumber (rawNetwork, 'maxWithdrawQuantity'),
                    },
                },
                'info': rawNetwork,
            };
        }
        return this.safeCurrencyStructure ({
            'id': id,
            'code': code,
            'name': this.safeString (rawCurrency, 'coinFullName'),
            'type': undefined,
            'active': undefined,
            'deposit': this.safeBool (rawCurrency, 'allowDeposit'),
            'withdraw': this.safeBool (rawCurrency, 'allowWithdraw'),
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
            },
            'networks': networks,
            'info': rawCurrency,
        });
    }

    /**
     * @method
     * @name toobit#fetchMarkets
     * @description retrieves data on all markets for toobit
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#exchange-information
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<MarketInterface[]> {
        let response = this.safeDict (this.options, 'exchangeInfo');
        if (response !== undefined) {
            this.options['exchangeInfo'] = undefined; // reset it to avoid using old cached data
        } else {
            response = await this.commonGetApiV1ExchangeInfo (params);
        }
        //
        //    {
        //        "timezone": "UTC",
        //        "serverTime": "1755583099926",
        //        "brokerFilters": [],
        //        "symbols": [
        //            {
        //                "filters": [
        //                    {
        //                        "minPrice": "0.01",
        //                        "maxPrice": "10000000.00000000",
        //                        "tickSize": "0.01",
        //                        "filterType": "PRICE_FILTER"
        //                    },
        //                    {
        //                        "minQty": "0.0001",
        //                        "maxQty": "4000",
        //                        "stepSize": "0.0001",
        //                        "filterType": "LOT_SIZE"
        //                    },
        //                    {
        //                        "minNotional": "5",
        //                        "filterType": "MIN_NOTIONAL"
        //                    },
        //                    {
        //                        "minAmount": "5",
        //                        "maxAmount": "6600000",
        //                        "minBuyPrice": "0.01",
        //                        "filterType": "TRADE_AMOUNT"
        //                    },
        //                    {
        //                        "maxSellPrice": "99999999",
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "LIMIT_TRADING"
        //                    },
        //                    {
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "MARKET_TRADING"
        //                    },
        //                    {
        //                        "noAllowMarketStartTime": "0",
        //                        "noAllowMarketEndTime": "0",
        //                        "limitOrderStartTime": "0",
        //                        "limitOrderEndTime": "0",
        //                        "limitMinPrice": "0",
        //                        "limitMaxPrice": "0",
        //                        "filterType": "OPEN_QUOTE"
        //                    }
        //                ],
        //                "exchangeId": "301",
        //                "symbol": "ETHUSDT",
        //                "symbolName": "ETHUSDT",
        //                "status": "TRADING",
        //                "baseAsset": "ETH",
        //                "baseAssetName": "ETH",
        //                "baseAssetPrecision": "0.0001",
        //                "quoteAsset": "USDT",
        //                "quoteAssetName": "USDT",
        //                "quotePrecision": "0.01",
        //                "icebergAllowed": false,
        //                "isAggregate": false,
        //                "allowMargin": true,
        //             }
        //        ],
        //        "options": [],
        //        "contracts": [
        //            {
        //                 "filters": [ ... ],
        //                 "exchangeId": "301",
        //                 "symbol": "BTC-SWAP-USDT",
        //                 "symbolName": "BTC-SWAP-USDTUSDT",
        //                 "status": "TRADING",
        //                 "baseAsset": "BTC-SWAP-USDT",
        //                 "baseAssetPrecision": "0.001",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetPrecision": "0.1",
        //                 "icebergAllowed": false,
        //                 "inverse": false,
        //                 "index": "BTC",
        //                 "indexToken": "BTCUSDT",
        //                 "marginToken": "USDT",
        //                 "marginPrecision": "0.0001",
        //                 "contractMultiplier": "0.001",
        //                 "underlying": "BTC",
        //                 "riskLimits": [
        //                     {
        //                         "riskLimitId": "200020911",
        //                         "quantity": "42000.0",
        //                         "initialMargin": "0.02",
        //                         "maintMargin": "0.01",
        //                         "isWhite": false
        //                     },
        //                     {
        //                         "riskLimitId": "200020912",
        //                         "quantity": "84000.0",
        //                         "initialMargin": "0.04",
        //                         "maintMargin": "0.02",
        //                         "isWhite": false
        //                     },
        //                     ...
        //                 ]
        //            },
        //        ],
        //        "coins": [
        //            {
        //                "orgId": "9001",
        //                "coinId": "TCOM",
        //                "coinName": "TCOM",
        //                "coinFullName": "TCOM",
        //                "allowWithdraw": true,
        //                "allowDeposit": true,
        //                "chainTypes": [
        //                    {
        //                        "chainType": "BSC",
        //                        "withdrawFee": "49.55478",
        //                        "minWithdrawQuantity": "77",
        //                        "maxWithdrawQuantity": "0",
        //                        "minDepositQuantity": "48",
        //                        "allowDeposit": true,
        //                        "allowWithdraw": false
        //                    }
        //                ],
        //                "isVirtual": false
        //            },
        //          ...
        //
        const symbols = this.safeList (response, 'symbols', []);
        const contracts = this.safeList (response, 'contracts', []);
        const all = this.arrayConcat (symbols, contracts);
        const result = [];
        for (let i = 0; i < all.length; i++) {
            const market = all[i];
            const parsed = this.parseMarket (market);
            result.push (parsed);
        }
        return result;
    }

    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const baseParts = baseId.split ('-');
        const baseIdClean = baseParts[0];
        const base = this.safeCurrencyCode (baseIdClean);
        const quote = this.safeCurrencyCode (quoteId);
        const settleId = this.safeString (market, 'marginToken');
        const settle = this.safeCurrencyCode (settleId);
        const status = this.safeString (market, 'status');
        const active = (status === 'TRADING');
        const filters = this.safeList (market, 'filters', []);
        const filtersByType = this.indexBy (filters, 'filterType');
        const priceFilter = this.safeDict (filtersByType, 'PRICE_FILTER', {});
        const lotSizeFilter = this.safeDict (filtersByType, 'LOT_SIZE', {});
        const minNotionalFilter = this.safeDict (filtersByType, 'MIN_NOTIONAL', {});
        let symbol = base + '/' + quote;
        const isContract = ('contractMultiplier' in market);
        const inverse = this.safeBool2 (market, 'isInverse', 'inverse');
        if (isContract) {
            symbol += ':' + settle;
        }
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': isContract ? 'swap' : 'spot',
            'spot': !isContract,
            'margin': false,
            'swap': isContract,
            'future': false,
            'option': false,
            'active': active,
            'contract': isContract,
            'linear': isContract ? !inverse : undefined,
            'inverse': isContract ? inverse : undefined,
            'contractSize': this.safeNumber (market, 'contractMultiplier'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (lotSizeFilter, 'stepSize'),
                'price': this.safeNumber (priceFilter, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (lotSizeFilter, 'minQty'),
                    'max': this.safeNumber (lotSizeFilter, 'maxQty'),
                },
                'price': {
                    'min': this.safeNumber (priceFilter, 'minPrice'),
                    'max': this.safeNumber (priceFilter, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (minNotionalFilter, 'minNotional'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name toobit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#order-book
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#order-book
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
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.commonGetQuoteV1Depth (this.extend (request, params));
        //
        //    {
        //        "t": "1755593995237",
        //        "b": [
        //            [
        //                "115186.47",
        //                "4.184864"
        //            ],
        //            [
        //                "115186.46",
        //                "0.002756"
        //            ],
        //            ...
        //        ],
        //        "a": [
        //            [
        //                "115186.48",
        //                "6.137369"
        //            ],
        //            [
        //                "115186.49",
        //                "0.002914"
        //            ],
        //            ...
        //        ]
        //    }
        //
        const timestamp = this.safeInteger (response, 't');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'b', 'a');
    }

    /**
     * @method
     * @name toobit#fetchTrades
     * @description get a list of the most recent trades for a particular symbol
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#recent-trades-list
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#recent-trades-list
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
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
        const response = await this.commonGetQuoteV1Trades (this.extend (request, params));
        //
        //    [
        //        {
        //            "t": "1755594277287",
        //            "p": "115276.99",
        //            "q": "0.001508",
        //            "ibm": true
        //        },
        //    ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //        {
        //            "t": "1755594277287",
        //            "p": "115276.99",
        //            "q": "0.001508",
        //            "ibm": true
        //        },
        //        // watchTrades have also an additional fields:
        //             "v": "4864732022868004630",   // trade id
        //             "m": true,                    // is the buyer taker
        //
        // fetchMyTrades
        //
        //        {
        //            "id": "2024934575206059008",
        //            "symbol": "ETHUSDT",
        //            "orderId": "2024934575097029888",
        //            "ticketId": "4864450547563401875",
        //            "price": "4641.21",
        //            "qty": "0.001",
        //            "time": "1756127012094",
        //            "isMaker": false,
        //            "commission": "0.00464121",
        //            "commissionAsset": "USDT",
        //            "makerRebate": "0",
        //            "symbolName": "ETHUSDT",                 // only in SPOT
        //            "isBuyer": false,                        // only in SPOT
        //            "feeAmount": "0.00464121",               // only in SPOT
        //            "feeCoinId": "USDT",                     // only in SPOT
        //            "fee": {                                 // only in SPOT
        //                "feeCoinId": "USDT",
        //                "feeCoinName": "USDT",
        //                "fee": "0.00464121"
        //            },
        //            "type": "LIMIT",                         // only in CONTRACT
        //            "side": "BUY_OPEN",                      // only in CONTRACT
        //            "realizedPnl": "0",                      // only in CONTRACT
        //        },
        //
        const timestamp = this.safeInteger2 (trade, 't', 'time');
        const priceString = this.safeString2 (trade, 'p', 'price');
        const amountString = this.safeString2 (trade, 'q', 'qty');
        const isBuyer = this.safeBool (trade, 'isBuyer');
        let side = undefined;
        let isBuyerMaker = this.safeBool (trade, 'ibm');
        if (isBuyerMaker === undefined) {
            const isBuyerTaker = this.safeBool (trade, 'm');
            if (isBuyerTaker !== undefined) {
                isBuyerMaker = !isBuyerTaker;
            }
        }
        if (isBuyerMaker !== undefined) {
            if (isBuyerMaker) {
                side = 'sell';
            } else {
                side = 'buy';
            }
        } else {
            if (isBuyer) {
                side = 'buy';
            } else {
                side = 'sell';
            }
        }
        const feeCurrencyId = this.safeString (trade, 'feeCoinId');
        const feeAmount = this.safeString (trade, 'feeAmount');
        let fee = undefined;
        if (feeAmount !== undefined) {
            fee = {
                'currency': this.safeCurrencyCode (feeCurrencyId),
                'cost': feeAmount,
            };
        }
        const isMaker = this.safeBool (trade, 'isMaker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString2 (trade, 'id', 'v'),
            'order': this.safeString (trade, 'orderId'),
            'type': undefined,
            'side': side,
            'amount': amountString,
            'price': priceString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name toobit#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#kline-candlestick-data
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#kline-candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let endpoint = undefined;
        [ endpoint, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'price');
        if (endpoint === 'index') {
            response = await this.commonGetQuoteV1IndexKlines (this.extend (request, params));
            //
            //     {
            //         "code": 200,
            //         "data": [
            //             {
            //                 "t": 1669155300000,//time
            //                 "s": "ETHUSDT",// symbol
            //                 "sn": "ETHUSDT",//symbol name
            //                 "c": "1127.1",//Close price
            //                 "h": "1130.81",//High price
            //                 "l": "1126.17",//Low price
            //                 "o": "1130.8",//Open price
            //                 "v": "0"//Volume
            //             },
            //             {
            //                 "t": 1669156200000,
            //                 "s": "ETHUSDT",
            //                 "sn": "ETHUSDT",
            //                 "c": "1129.44",
            //                 "h": "1129.54",
            //                 "l": "1127.1",
            //                 "o": "1127.1",
            //                 "v": "0"
            //             }
            //         ]
            //     }
            //
        } else if (endpoint === 'mark') {
            response = await this.commonGetQuoteV1MarkPriceKlines (this.extend (request, params));
            //
            //     {
            //         "code": 200,
            //         "data": [
            //             {
            //                 "symbol": "BTCUSDT",// Symbol
            //                 "time": 1670157900000,// time
            //                 "low": "16991.14096",//Low price
            //                 "open": "16991.78288",//Open price
            //                 "high": "16996.30641",// High prce
            //                 "close": "16996.30641",// Close price
            //                 "volume": "0",// Volume
            //                 "curId": 1670157900000
            //             }
            //         ]
            //     }
            //
        } else {
            response = await this.commonGetQuoteV1Klines (this.extend (request, params));
            //
            //    [
            //        [
            //            1755540660000,
            //            "116399.99",
            //            "116399.99",
            //            "116360.09",
            //            "116360.1",
            //            "2.236869",
            //            0,
            //            "260303.79722607",
            //            22,
            //            "2.221061",
            //            "258464.10338267"
            //        ],
            //        ...
            //
        }
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeIntegerN (ohlcv, [ 0, 'time', 't' ]),
            this.safeNumberN (ohlcv, [ 1, 'open', 'o' ]),
            this.safeNumberN (ohlcv, [ 2, 'high', 'h' ]),
            this.safeNumberN (ohlcv, [ 3, 'low', 'l' ]),
            this.safeNumberN (ohlcv, [ 4, 'close', 'c' ]),
            this.safeNumberN (ohlcv, [ 5, 'volume', 'v' ]),
        ];
    }

    /**
     * @method
     * @name toobit#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#24hr-ticker-price-change-statistics
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#24hr-ticker-price-change-statistics
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let type = undefined;
        let market = undefined;
        const request: Dict = {};
        if (symbols !== undefined) {
            const symbol = this.safeString (symbols, 0);
            market = this.market (symbol);
            const length = symbols.length;
            if (length === 1) {
                request['symbol'] = market['id'];
            }
        }
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.commonGetQuoteV1Ticker24hr (this.extend (request, params));
        } else {
            response = await this.commonGetQuoteV1ContractTicker24hr (this.extend (request, params));
        }
        //
        //    [
        //        {
        //            "t": "1755601440162",
        //            "s": "GRDRUSDT",
        //            "o": "0.38",
        //            "h": "0.38",
        //            "l": "0.38",
        //            "c": "0.38",
        //            "v": "0",
        //            "qv": "0",
        //            "pc": "0",
        //            "pcp": "0"
        //        },
        //        ...
        //
        return this.parseTickers (response, symbols, params);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 't');
        const last = this.safeString (ticker, 'c');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'pc'),
            'percentage': this.safeString (ticker, 'pcp'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'qv'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name toobit#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#symbol-price-ticker
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#symbol-price-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the last prices
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of lastprices structures
     */
    async fetchLastPrices (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const market = this.market (symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.commonGetQuoteV1TickerPrice (this.extend (request, params));
        //
        //    [
        //        {
        //            "s": "BNTUSDT",
        //            "si": "BNTUSDT",
        //            "p": "0.823"
        //        },
        //
        return this.parseLastPrices (response, symbols);
    }

    parseLastPrice (entry, market: Market = undefined) {
        const marketId = this.safeString (entry, 's');
        market = this.safeMarket (marketId, market);
        return {
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'price': this.safeNumberOmitZero (entry, 'price'),
            'side': undefined,
            'info': entry,
        };
    }

    /**
     * @method
     * @name toobit#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#symbol-order-book-ticker
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#symbol-order-book-ticker
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const market = this.market (symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.commonGetQuoteV1TickerBookTicker (this.extend (request, params));
        //
        //    [
        //        {
        //            "s": "GRDRUSDT",
        //            "b": "0",
        //            "bq": "0",
        //            "a": "0",
        //            "aq": "0",
        //            "t": "1755936610506"
        //        }, ...
        //
        return this.parseBidsAsksCustom (response, symbols);
    }

    parseBidsAsksCustom (tickers, symbols: Strings = undefined, params = {}): Tickers {
        const results = [];
        for (let i = 0; i < tickers.length; i++) {
            const parsedTicker = this.parseBidAskCustom (tickers[i]);
            const ticker = this.extend (parsedTicker, params);
            results.push (ticker);
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (results, 'symbol', symbols);
    }

    parseBidAskCustom (ticker) {
        return {
            'timestamp': this.safeString (ticker, 't'),
            'symbol': this.safeString (ticker, 's'),
            'bid': this.safeNumber (ticker, 'b'),
            'bidVolume': this.safeNumber (ticker, 'bq'),
            'ask': this.safeNumber (ticker, 'a'),
            'askVolume': this.safeNumber (ticker, 'aq'),
            'info': ticker,
        };
    }

    /**
     * @method
     * @name toobit#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#funding-rate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const market = this.market (symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.commonGetApiV1FuturesFundingRate (this.extend (request, params));
        //
        //    [
        //        {
        //            "symbol": "BTC-SWAP-USDT",
        //            "rate": "0.0001071148112848",
        //            "nextFundingTime": "1755964800000"
        //        },...
        //
        return this.parseFundingRates (response, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const nextFundingRate = this.safeNumber (contract, 'rate');
        const nextFundingRateTimestamp = this.safeInteger (contract, 'nextFundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'previousFundingRate': undefined,
            'nextFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'nextFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'nextFundingDatetime': undefined,
            'fundingRate': nextFundingRate,
            'fundingTimestamp': nextFundingRateTimestamp,
            'fundingDatetime': this.iso8601 (nextFundingRateTimestamp),
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name toobit#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchFundingRateHistory', symbol, since, limit, '8h', params) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.commonGetApiV1FuturesHistoryFundingRate (this.extend (request, params));
        //
        //    [
        //        {
        //            "id": "869931",
        //            "symbol": "BTC-SWAP-USDT",
        //            "settleTime": "1755936000000",
        //            "settleRate": "0.0001"
        //        }, ...
        //
        return this.parseFundingRateHistories (response, market, since, limit) as FundingRateHistory[];
    }

    parseFundingRateHistory (contract, market: Market = undefined) {
        const timestamp = this.safeInteger (contract, 'settleTime');
        const marketId = this.safeString (contract, 'symbol');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market),
            'fundingRate': this.safeNumber (contract, 'settleRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name toobit#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#account-information-user_data
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#futures-account-balance-user_data
     * @param {object} [params] extra parameters specific to the exchange API endpointinvalid
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let response = undefined;
        let marketType: Str = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        if (this.inArray (marketType, [ 'swap', 'future' ])) {
            response = await this.privateGetApiV1FuturesBalance ();
            //
            //     [
            //         {
            //             "asset": "USDT", // asset
            //             "balance": "999999999999.982", // total
            //             "availableBalance": "1899999999978.4995", // available balance Include unrealized pnl
            //             "positionMargin": "11.9825", //position Margin
            //             "orderMargin": "9.5", //order Margin
            //             "crossUnRealizedPnl": "10.01" //The unrealized profit and loss of cross position
            //         }
            //     ]
            //
        } else {
            response = await this.privateGetApiV1Account ();
            //
            //    {
            //        "userId": "912902020",
            //        "balances": [
            //            {
            //                "asset": "ETH",
            //                "assetId": "ETH",
            //                "assetName": "ETH",
            //                "total": "0.025",
            //                "free": "0.025",
            //                "locked": "0"
            //            }
            //        ]
            //    }
            //
        }
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeList (response, 'balances', response);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'asset'));
            const account = this.account ();
            account['free'] = this.safeString2 (balance, 'free', 'availableBalance');
            account['total'] = this.safeString2 (balance, 'total', 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name toobit#createOrder
     * @description create a trade order
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#new-order-trade
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {};
        let response = undefined;
        if (market['spot']) {
            [ request, params ] = this.createOrderRequest (symbol, type, side, amount, price, params);
            response = await this.privatePostApiV1SpotOrder (this.extend (request, params));
        } else {
            [ request, params ] = this.createContractOrderRequest (symbol, type, side, amount, price, params);
            response = await this.privatePostApiV1FuturesOrder (this.extend (request, params));
        }
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "price": "0",
        //         "origQty": "0.001",
        //         "orderId": "2024837825254460160",
        //         "clientOrderId": "1756115478113679",
        //         "executedQty": "0",
        //         "status": "PENDING_NEW",
        //         "timeInForce": "GTC",
        //         "type": "MARKET",
        //         "side": "SELL"
        //         "accountId": "1783404067076253952",    // only in spot
        //         "symbolName": "ETHUSDT",               // only in spot
        //         "transactTime": "1756115478604",       // only in spot
        //         "time": "1668418485058",               // only in contract
        //         "updateTime": "1668418485058",         // only in contract
        //         "leverage": "2",                       // only in contract
        //         "avgPrice": "0",                       // only in contract
        //         "marginLocked": "9.5",                 // only in contract
        //         "priceType": "INPUT"                   // only in contract
        //     }
        //
        return this.parseOrder (response, market);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const id = market['id'];
        const request: Dict = {
            'symbol': id,
            'side': side.toUpperCase (),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let cost: Str = undefined;
        [ cost, params ] = this.handleParamString (params, 'cost');
        if (type === 'market') {
            if (cost === undefined && side === 'buy') {
                throw new ArgumentsRequired (this.id + ' createOrder() requires params["cost"] for market buy order');
            } else {
                request['quantity'] = this.costToPrecision (symbol, cost);
            }
        } else {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        let isPostOnly = undefined;
        [ isPostOnly, params ] = this.handlePostOnly (type === 'market', false, params);
        if (isPostOnly) {
            request['type'] = 'LIMIT_MAKER';
        } else {
            request['type'] = type.toUpperCase ();
        }
        return [ request, params ];
    }

    createContractOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
        };
        let reduceOnly = undefined;
        [ reduceOnly, params ] = this.handleParamBool (params, 'reduceOnly');
        if (side === 'buy') {
            side = reduceOnly ? 'SELL_CLOSE' : 'BUY_OPEN';
        } else if (side === 'sell') {
            side = reduceOnly ? 'BUY_CLOSE' : 'SELL_OPEN';
        }
        request['side'] = side;
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (this.inArray (type, [ 'limit', 'LIMIT' ])) {
            request['type'] = type.toUpperCase ();
            request['price'] = this.priceToPrecision (symbol, price);
        } else if (type === 'market') {
            request['type'] = 'LIMIT'; // weird, but exchange works this way
            request['priceType'] = 'MARKET';
        }
        let isPostOnly = undefined;
        [ isPostOnly, params ] = this.handlePostOnly (type === 'market', false, params);
        if (isPostOnly) {
            request['timeInForce'] = 'LIMIT_MAKER';
        }
        const values = this.handleTriggerPricesAndParams (symbol, params);
        const triggerPrice = values[0];
        params = values[3];
        if (triggerPrice !== undefined) {
            request['stopPrice'] = triggerPrice;
        }
        const stopLoss = this.safeDict (params, 'stopLoss');
        const takeProfit = this.safeDict (params, 'takeProfit');
        const triggerPriceTypes = {
            'mark': 'MARK_PRICE',
            'last': 'CONTRACT_PRICE',
        };
        if (stopLoss !== undefined) {
            request['stopLoss'] = this.safeValue (stopLoss, 'triggerPrice');
            const limitPrice = this.safeValue (stopLoss, 'price');
            if (limitPrice !== undefined) {
                request['slOrderType'] = 'LIMIT';
                request['slLimitPrice'] = this.priceToPrecision (symbol, limitPrice);
            }
            const triggerPriceType = this.safeString (stopLoss, 'triggerPriceType');
            if (triggerPriceType !== undefined) {
                request['slTriggerBy'] = this.safeString (triggerPriceTypes, triggerPriceType, triggerPriceType);
            }
            params = this.omit (params, 'stopLoss');
        }
        if (takeProfit !== undefined) {
            request['takeProfit'] = this.safeValue (takeProfit, 'triggerPrice');
            const limitPrice = this.safeValue (takeProfit, 'price');
            if (limitPrice !== undefined) {
                request['tpOrderType'] = 'LIMIT';
                request['tpLimitPrice'] = this.priceToPrecision (symbol, limitPrice);
            }
            const triggerPriceType = this.safeString (takeProfit, 'triggerPriceType');
            if (triggerPriceType !== undefined) {
                request['tpTriggerBy'] = this.safeString (triggerPriceTypes, triggerPriceType, triggerPriceType);
            }
            params = this.omit (params, 'takeProfit');
        }
        if (!('newClientOrderId' in params)) {
            request['newClientOrderId'] = this.uuid ();
        }
        return [ request, params ];
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder, cancelOrder
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "price": "0",
        //         "origQty": "0.001",
        //         "orderId": "2024837825254460160",
        //         "clientOrderId": "1756115478113679",
        //         "executedQty": "0",
        //         "status": "PENDING_NEW",
        //         "timeInForce": "GTC",
        //         "type": "MARKET",
        //         "side": "SELL"
        //         "accountId": "1783404067076253952",    // only in spot
        //         "symbolName": "ETHUSDT",               // only in spot
        //         "transactTime": "1756115478604",       // only in spot
        //         "time": "1668418485058",               // only in contract
        //         "updateTime": "1668418485058",         // only in contract
        //         "leverage": "2",                       // only in contract
        //         "avgPrice": "0",                       // only in contract
        //         "marginLocked": "9.5",                 // only in contract
        //         "priceType": "INPUT"                   // only in contract
        //     }
        //
        //
        // fetchOrder, fetchOrders, fetchOpenOrders
        //
        //    {
        //        "time": "1756140208069",
        //        "updateTime": "1756140208078",
        //        "orderId": "2025045271033977089",
        //        "clientOrderId": "17561402075722006",
        //        "symbol": "ETHUSDT",
        //        "price": "3000",
        //        "origQty": "0.002",
        //        "executedQty": "0",
        //        "avgPrice": "0",
        //        "type": "LIMIT",
        //        "side": "BUY",
        //        "timeInForce": "GTC",
        //        "status": "NEW",
        //        "accountId": "1783404067076253952",  // only in SPOT
        //        "exchangeId": "301",                 // only in SPOT
        //        "symbolName": "ETHUSDT",             // only in SPOT
        //        "cummulativeQuoteQty": "0",          // only in SPOT
        //        "cumulativeQuoteQty": "0",           // only in SPOT
        //        "stopPrice": "0.0",                  // only in SPOT
        //        "icebergQty": "0.0",                 // only in SPOT
        //        "isWorking": true                    // only in SPOT
        //        "leverage": "2",                     // only in CONTRACT
        //        "marginLocked": "9.5",               // only in CONTRACT
        //        "priceType": "INPUT"                 // only in CONTRACT
        //        "triggerType": "0",                  // only in CONTRACT fetchClosedOrders
        //        "fallType": "0",                     // only in CONTRACT fetchClosedOrders
        //        "activeStatus": "0"                  // only in CONTRACT fetchClosedOrders
        //    }
        //
        const timestamp = this.safeInteger2 (order, 'transactTime', 'time');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const rawType = this.safeString (order, 'type');
        const rawSideLower = this.safeStringLower (order, 'side');
        let triggerPrice = this.omitZero (this.safeString (order, 'stopPrice'));
        if (triggerPrice === '0.0') {
            triggerPrice = undefined;
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger (order, 'updateTime'),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': market['symbol'],
            'type': this.parseOrderType (rawType),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': (rawType === 'LIMIT_MAKER'),
            'side': rawSideLower,
            'price': this.omitZero (this.safeString (order, 'price')),
            'triggerPrice': triggerPrice,
            'cost': this.omitZero (this.safeString (order, 'cumulativeQuoteQty')),
            'average': this.safeString (order, 'avgPrice'),
            'amount': this.safeString (order, 'origQty'),
            'filled': this.safeString (order, 'executedQty'),
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'marginMode': undefined,
            'reduceOnly': undefined,
            'leverage': undefined,
            'hedged': undefined,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'PENDING_NEW': 'open',
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'PENDING_CANCEL': 'canceled',
            'CANCELED': 'canceled',
            'REJECTED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses: Dict = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name toobit#cancelOrder
     * @description cancels an open order
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#cancel-order-trade
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#cancel-order-trade
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        const request = {};
        if (this.safeString (params, 'clientOrderId') === undefined) {
            request['orderId'] = id;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrder', market, params, 'none');
        if (marketType === 'none') {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument or the "defaultType" parameter to be set to "spot" or "swap"');
        }
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateDeleteApiV1SpotOrder (this.extend (request, params));
        } else {
            response = await this.privateDeleteApiV1FuturesOrder (this.extend (request, params));
        }
        // response same as in `createOrder`
        const status = this.parseOrderStatus (this.safeString (response, 'status'));
        if (status !== 'open') {
            throw new OrderNotFound (this.id + ' order ' + id + ' can not be canceled, ' + this.json (response));
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name toobit#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#cancel-all-open-orders-trade
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#cancel-orders-trade
     * @param {string} symbol unified symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params, 'none');
        if (marketType === 'none') {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument or the "defaultType" parameter to be set to "spot" or "swap"');
        }
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateDeleteApiV1SpotOpenOrders (this.extend (request, params));
            //
            // {"success":true}  // always same response
            //
        } else {
            response = await this.privateDeleteApiV1FuturesBatchOrders (this.extend (request, params));
            //
            // { "code": 200, "message":"success", "timestamp":1541161088303 }
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
     * @name toobit#cancelOrders
     * @description cancel multiple orders
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#cancel-multiple-orders-trade
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#cancel-multiple-orders-trade
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids:string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const idsString = ids.join (',');
        const request: Dict = {
            'ids': idsString,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrders', market, params, 'none');
        if (marketType === 'none') {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument or the "defaultType" parameter to be set to "spot" or "swap"');
        }
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateDeleteApiV1SpotCancelOrderByIds (this.extend (request, params));
            //
            // {"success":true}  // always same response
            //
        } else {
            response = await this.privateDeleteApiV1FuturesCancelOrderByIds (this.extend (request, params));
            //
            // {
            //     "code":200,
            //     "result":[
            //         {
            //             "orderId":"1327047813809448704",
            //             "code":-2013
            //         },
            //         {
            //             "orderId":"1327047814212101888",
            //             "code":-2013
            //         }
            //     ]
            // }
            //
            // or empty array if no orders were canceled
        }
        const result = this.safeList (response, 'result', []);
        return this.parseOrders (result, market);
    }

    /**
     * @method
     * @name toobit#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#query-order-user_data
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#query-order-user_data
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
        const request: Dict = {
            'orderId': id,
        };
        const market = this.market (symbol);
        let response = undefined;
        if (market['spot']) {
            response = await this.privateGetApiV1SpotOrder (this.extend (request, params));
        } else {
            response = await this.privateGetApiV1FuturesOrder (this.extend (request, params));
        }
        //
        //    {
        //        "time": "1756140208069",
        //        "updateTime": "1756140208078",
        //        "orderId": "2025045271033977089",
        //        "clientOrderId": "17561402075722006",
        //        "symbol": "ETHUSDT",
        //        "price": "3000",
        //        "origQty": "0.002",
        //        "executedQty": "0",
        //        "avgPrice": "0",
        //        "type": "LIMIT",
        //        "side": "BUY",
        //        "timeInForce": "GTC",
        //        "status": "NEW",
        //        "accountId": "1783404067076253952",  // only in SPOT
        //        "exchangeId": "301",                 // only in SPOT
        //        "symbolName": "ETHUSDT",             // only in SPOT
        //        "cummulativeQuoteQty": "0",          // only in SPOT
        //        "cumulativeQuoteQty": "0",           // only in SPOT
        //        "stopPrice": "0.0",                  // only in SPOT
        //        "icebergQty": "0.0",                 // only in SPOT
        //        "isWorking": true                    // only in SPOT
        //        "leverage": "2",                     // only in CONTRACT
        //        "marginLocked": "9.5",               // only in CONTRACT
        //        "priceType": "INPUT"                 // only in CONTRACT
        //    }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name toobit#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#current-open-orders-user_data
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#query-current-open-order-user_data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
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
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetApiV1SpotOpenOrders (this.extend (request, params));
            //
            //    [
            //        {
            //            "accountId": "1783404067076253952",
            //            "exchangeId": "301",
            //            "symbol": "ETHUSDT",
            //            "symbolName": "ETHUSDT",
            //            "clientOrderId": "17561415157172008",
            //            "orderId": "2025056244339984384",
            //            "price": "3000",
            //            "origQty": "0.002",
            //            "executedQty": "0",
            //            "cummulativeQuoteQty": "0",
            //            "cumulativeQuoteQty": "0",
            //            "avgPrice": "0",
            //            "status": "NEW",
            //            "timeInForce": "GTC",
            //            "type": "LIMIT",
            //            "side": "BUY",
            //            "stopPrice": "0.0",
            //            "icebergQty": "0.0",
            //            "time": "1756141516189",
            //            "updateTime": "1756141516198",
            //            "isWorking": true
            //        }, ...
            //    ]
            //
        } else {
            response = await this.privateGetApiV1FuturesOpenOrders (this.extend (request, params));
        }
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name toobit#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#all-orders-user_data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetApiV1SpotTradeOrders (request);
            //
            //    [
            //        {
            //            "accountId": "1783404067076253952",
            //            "exchangeId": "301",
            //            "symbol": "ETHUSDT",
            //            "symbolName": "ETHUSDT",
            //            "clientOrderId": "17561415157172008",
            //            "orderId": "2025056244339984384",
            //            "price": "3000",
            //            "origQty": "0.002",
            //            "executedQty": "0",
            //            "cummulativeQuoteQty": "0",
            //            "cumulativeQuoteQty": "0",
            //            "avgPrice": "0",
            //            "status": "NEW",
            //            "timeInForce": "GTC",
            //            "type": "LIMIT",
            //            "side": "BUY",
            //            "stopPrice": "0.0",
            //            "icebergQty": "0.0",
            //            "time": "1756141516189",
            //            "updateTime": "1756141516198",
            //            "isWorking": true
            //        }, ...
            //    ]
            //
        } else {
            throw new NotSupported (this.id + ' fetchOrders() is not supported for ' + marketType + ' markets');
        }
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name toobit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#query-history-orders-user_data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        // returns the most recent closed or canceled orders up to circa two weeks ago
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        let response = undefined;
        if (marketType === 'spot') {
            throw new NotSupported (this.id + ' fetchOrders() is not supported for ' + marketType + ' markets');
        } else {
            response = await this.privateGetApiV1FuturesHistoryOrders (request);
            //
            //    [
            //        {
            //            "time": "1756756879360",
            //            "updateTime": "1756757165956",
            //            "orderId": "2030218284767504128",
            //            "clientOrderId": "1756756876002",
            //            "symbol": "SOL-SWAP-USDT",
            //            "price": "144",
            //            "leverage": "50",
            //            "origQty": "1",
            //            "executedQty": "0",
            //            "executeQty": "0",
            //            "avgPrice": "0",
            //            "marginLocked": "0",
            //            "type": "LIMIT",
            //            "side": "BUY_OPEN",
            //            "timeInForce": "GTC",
            //            "status": "CANCELED",
            //            "priceType": "INPUT",
            //            "triggerType": "0",
            //            "fallType": "0",
            //            "activeStatus": "0"
            //        }
            //    ]
            //
        }
        const ordersList = [];
        for (let i = 0; i < response.length; i++) {
            ordersList.push ({ 'result': response[i] });
        }
        return this.parseOrders (ordersList, market, since, limit);
    }

    /**
     * @method
     * @name toobit#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#account-trade-list-user_data
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#account-trade-list-user_data
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        let request: Dict = {};
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const market = this.market (symbol);
        request['symbol'] = market['id'];
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetApiV1AccountTrades (this.extend (request, params));
            //
            //    [
            //        {
            //            "id": "2024934575206059008",
            //            "symbol": "ETHUSDT",
            //            "symbolName": "ETHUSDT",
            //            "orderId": "2024934575097029888",
            //            "price": "4641.21",
            //            "qty": "0.001",
            //            "commission": "0.00464121",
            //            "commissionAsset": "USDT",
            //            "time": "1756127012094",
            //            "isBuyer": false,
            //            "isMaker": false,
            //            "fee": {
            //                "feeCoinId": "USDT",
            //                "feeCoinName": "USDT",
            //                "fee": "0.00464121"
            //            },
            //            "feeCoinId": "USDT",
            //            "feeAmount": "0.00464121",
            //            "makerRebate": "0",
            //            "ticketId": "4864450547563401875"
            //        }, ...
            //
        } else {
            response = await this.privateGetApiV1FuturesUserTrades (request);
            //
            //    [
            //        {
            //            "time": "1756758426899",
            //            "id": "2030231266499116032",
            //            "orderId": "2030231266373265152",
            //            "symbol": "DOGE-SWAP-USDT",
            //            "price": "0.21191",
            //            "qty": "63",
            //            "commissionAsset": "USDT",
            //            "commission": "0.00801019",
            //            "makerRebate": "0",
            //            "type": "LIMIT",
            //            "side": "BUY_OPEN",
            //            "realizedPnl": "0",
            //            "ticketId": "4900760819871364854",
            //            "isMaker": false
            //        }
            //    ]
            //
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name toobit#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://open.big.one/docs/spot_transfer.html#transfer-of-user
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'spot', 'swap'
     * @param {string} toAccount 'spot', 'swap'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeDict (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const request: Dict = {
            'asset': currency['id'],
            'quantity': this.currencyToPrecision (code, amount),
            'fromAccountType': fromId,
            'toAccountType': toId,
        };
        const response = await this.privatePostApiV1SubAccountTransfer (this.extend (request, params));
        //
        //    {
        //     "code": 200, // 200 = success
        //     "msg": "success" // response message
        //    }
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        //    {
        //     "code": 200, // 200 = success
        //     "msg": "success" // response message
        //    }
        //
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': undefined,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }

    /**
     * @method
     * @name toobit#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#get-account-transaction-history-list-user_data
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#get-future-account-transaction-history-list-user_data
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let currency = undefined;
        let request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', undefined, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetApiV1AccountBalanceFlow (this.extend (request, params));
        } else {
            response = await this.privateGetApiV1FuturesBalanceFlow (this.extend (request, params));
        }
        //
        // both answers are same format
        //
        // [
        //     {
        //         "id": "539870570957903104",
        //         "accountId": "122216245228131",
        //         "coin": "BTC",
        //         "coinId": "BTC",
        //         "coinName": "BTC",
        //         "flowTypeValue": 51,
        //         "flowType": "USER_ACCOUNT_TRANSFER",
        //         "flowName": "Transfer",
        //         "change": "-12.5",
        //         "total": "379.624059937852365",
        //         "created": "1579093587214"
        //     },
        //
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        const currencyId = this.safeString (item, 'coinId');
        currency = this.safeCurrency (currencyId, currency);
        const timestamp = this.safeInteger (item, 'created');
        const after = this.safeNumber (item, 'total');
        const amountRaw = this.safeString (item, 'change');
        const amount = this.parseNumber (Precise.stringAbs (amountRaw));
        let direction = 'in';
        if (amountRaw.startsWith ('-')) {
            direction = 'out';
        }
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': this.parseLedgerType (this.safeString (item, 'flowType')),
            'currency': currency['code'],
            'amount': amount,
            'before': undefined,
            'after': after,
            'status': undefined,
            'fee': undefined,
        }, currency) as LedgerEntry;
    }

    parseLedgerType (type) {
        const types: Dict = {
            'USER_ACCOUNT_TRANSFER': 'transfer',
            'AIRDROP': 'rebate',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name toobit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#user-trade-fee-rate-user_data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        let response = undefined;
        let marketType = undefined;
        let market = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTradingFees', undefined, params);
        if (marketType === 'spot') {
            throw new NotSupported (this.id + ' fetchTradingFees(): does not support ' + marketType + ' markets');
        } else if (this.inArray (marketType, [ 'swap', 'future' ])) {
            let symbol: Str = undefined;
            [ symbol, params ] = this.handleParamString (params, 'symbol');
            if (symbol === undefined) {
                throw new BadRequest (this.id + ' fetchTradingFees requires a params["symbol"]');
            }
            market = this.market (symbol);
            const request = {
                'symbol': market['id'],
            };
            response = await this.privateGetApiV1FuturesCommissionRate (this.extend (request, params));
        }
        //
        // {
        //     "openMakerFee": "0.000006", // The trade fee rate for opening pending orders
        //     "openTakerFee": "0.0001", // The trade fee rate for open position taker
        //     "closeMakerFee": "0.0002", // The trade fee rate for closing pending orders
        //     "closeTakerFee": "0.0004" // The trade fee rate for closing a taker order
        // }
        //
        const result: Dict = {};
        const entry = response;
        const marketId = this.safeString (entry, 'symbol');
        market = this.safeMarket (marketId, market);
        const fee = this.parseTradingFee (entry, market);
        result[market['symbol']] = fee;
        return result;
    }

    parseTradingFee (data, market: Market = undefined) {
        const marketId = this.safeString (data, 'symbol');
        return {
            'info': data,
            'symbol': this.safeSymbol (marketId, market),
            'maker': this.safeNumber (data, 'closeMakerFee'),
            'taker': this.safeNumber (data, 'closeTakerFee'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    /**
     * @method
     * @name toobit#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#deposit-history-user_data
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchDepositsOrWithdrawalsHelper ('deposits', code, since, limit, params);
    }

    /**
     * @method
     * @name toobit#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#withdrawal-records-user_data
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchDepositsOrWithdrawalsHelper ('withdrawals', code, since, limit, params);
    }

    async fetchDepositsOrWithdrawalsHelper (type, code, since, limit, params) {
        await this.loadMarkets ();
        let currency = undefined;
        let request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (type === 'deposits') {
            response = await this.privateGetApiV1AccountDepositOrders (this.extend (request, params));
            //
            // [
            //     {
            //         "time": 1499865549590,
            //         "id": 100234,
            //         "coinName": "EOS",
            //         "statusCode": "DEPOSIT_CAN_WITHDRAW",
            //         "status": "2", // 2=SUCCESS, 11=REJECT, 12=AUDIT
            //         "address": "deposit2bb",
            //         "txId": "98A3EA560C6B3336D348B6C83F0F95ECE4F1F5919E94BD006E5BF3BF264FACFC",
            //         "txIdUrl": "",
            //         "requiredConfirmTimes": "5",
            //         "confirmTimes": "5",
            //         "quantity": "1.01",
            //         "coin": "EOS",
            //         "fromAddress": "clarkkent",
            //         "fromAddressTag": "19029901"
            //         "addressTag": "19012584",
            //     }
            // ]
            //
        } else if (type === 'withdrawals') {
            response = await this.privateGetApiV1AccountWithdrawOrders (this.extend (request, params));
            //
            // [
            //     {
            //         "time":"1536232111669",
            //         "id ":"90161227158286336",
            //         "accountId":"517256161325920",
            //         "coinName":"BHC",
            //         "statusCode":"PROCESSING_STATUS",
            //         "status":3,
            //         "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
            //         "txId ":"",
            //         "txIdUrl ":"",
            //         "requiredConfirmTimes ":0, // Number of confirmation requests
            //         "confirmTimes ":0, // number of confirmations
            //         "quantity":"14", // Withdrawal amount
            //         "coinId ":"BHC",
            //         "addressExt":"address tag",
            //         "arriveQuantity":"14",
            //         "walletHandleTime":"1536232111669",
            //         "feeCoinId ":"BHC",
            //         "feeCoinName ":"BHC",
            //         "fee":"0.1",
            //         "kernelId":"", // Exclusive to BEAM and GRIN
            //         "isInternalTransfer": false // Whether internal transfer
            //     }
            // ]
            //
        }
        return this.parseTransactions (response, currency, since, limit, params);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits & fetchWithdrawals
        //
        //     {
        //         "time": 1499865549590,
        //         "id": 100234,
        //         "coinName": "EOS",
        //         "statusCode": "DEPOSIT_CAN_WITHDRAW",
        //         "status": "2", // 2=SUCCESS, 11=REJECT, 12=AUDIT
        //         "address": "deposit2bb",
        //         "txId": "98A3EA560C6B3336D348B6C83F0F95ECE4F1F5919E94BD006E5BF3BF264FACFC",
        //         "txIdUrl": "",
        //         "requiredConfirmTimes": "5",
        //         "confirmTimes": "5",
        //         "quantity": "1.01",
        //         "coin": "EOS",                     // present in "fetchDeposits"
        //         "coinId ":"BHC",                   // present in "fetchWithdrawals"
        //         "addressTag": "19012584",          // present in "fetchDeposits"
        //         "addressExt":"address tag",        // present in "fetchWithdrawals"
        //         "fromAddress": "clarkkent",        // present in "fetchDeposits"
        //         "fromAddressTag": "19029901"       // present in "fetchDeposits"
        //         "arriveQuantity":"14",             // present in "fetchWithdrawals"
        //         "walletHandleTime":"1536232111669",// present in "fetchWithdrawals"
        //         "feeCoinId ":"BHC",                // present in "fetchWithdrawals"
        //         "feeCoinName ":"BHC",              // present in "fetchWithdrawals"
        //         "fee":"0.1",                       // present in "fetchWithdrawals"
        //         "kernelId":"",                     // present in "fetchWithdrawals"
        //         "isInternalTransfer": false        // present in "fetchWithdrawals"
        //     }
        //
        // withdraw
        //
        //     {
        //         "status": 0,
        //         "success": true,
        //         "needBrokerAudit": false, // Do you need a brokerage review?
        //         "id": "423885103582776064",
        //         "refuseReason":"" // failure rejection reason
        //     }
        //
        const timestamp = this.safeInteger (transaction, 'time');
        const currencyId = this.safeString2 (transaction, 'coin', 'coinId');
        const code = this.safeCurrencyCode (currencyId, currency);
        const feeString = this.safeString (transaction, 'fee');
        const feeCoin = this.safeString (transaction, 'feeCoinName');
        let fee = undefined;
        if (feeString !== undefined) {
            fee = {
                'cost': this.parseNumber (feeString),
                'currency': this.safeCurrencyCode (feeCoin),
            };
        }
        const tagTo = this.safeString2 (transaction, 'addressTag', 'addressExt');
        const tagFrom = this.safeString (transaction, 'fromAddressTag');
        const addressTo = this.safeString (transaction, 'address');
        const addressFrom = this.safeString (transaction, 'fromAddress');
        const isWithdraw = ('arriveQuantity' in transaction);
        const type = isWithdraw ? 'withdrawal' : 'deposit';
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': tagTo,
            'tagFrom': tagFrom,
            'type': type,
            'amount': this.safeNumber (transaction, 'quantity'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': undefined,
            'fee': fee,
            'comment': undefined,
            'internal': undefined,
        } as Transaction;
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            '2': 'pending',
            '12': 'pending',
            '11': 'failed',
            '3': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name toobit#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#deposit-address-user_data
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
        };
        const [ networkCode, paramsOmitted ] = this.handleNetworkCodeAndParams (this.extend (request, params));
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress() : param["network"] is required');
        }
        request['chainType'] = this.networkCodeToId (networkCode);
        const response = await this.privateGetApiV1AccountDepositAddress (this.extend (request, paramsOmitted));
        //
        //     {
        //         "canDeposit":false,//Is it possible to recharge
        //         "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
        //         "addressExt":"address tag",
        //         "minQuantity":"100",//minimum amount
        //         "requiredConfirmTimes ":1,//Arrival confirmation number
        //         "canWithdrawConfirmNum ":12,//Withdrawal confirmation number
        //         "coinType":"ERC20_TOKEN"
        //     }
        //
        return this.parseDepositAddress (response, currency);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined): DepositAddress {
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        return {
            'info': depositAddress,
            'currency': this.safeString (currency, 'code'),
            'network': undefined,
            'address': address,
            'tag': this.safeString (depositAddress, 'addressExt'),
        } as DepositAddress;
    }

    /**
     * @method
     * @name toobit#withdraw
     * @description make a withdrawal
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#withdraw-user_data
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag a memo for the transaction
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        this.checkAddress (address);
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() : param["network"] is required');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
            'address': address,
            'quantity': this.currencyToPrecision (currency['code'], amount),
            'network': networkCode,
        };
        if (tag !== undefined) {
            request['addressExt'] = tag;
        }
        const response = await this.privatePostApiV1AccountWithdraw (this.extend (request, params));
        //
        // {
        //     "status": 0,
        //     "success": true,
        //     "needBrokerAudit": false, // Do you need a brokerage review?
        //     "id": "423885103582776064", // Withdrawal successful order id
        //     "refuseReason":"" // failure rejection reason
        // }
        //
        return this.parseTransaction (response, currency);
    }

    /**
     * @method
     * @name toobit#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#change-margin-type-trade
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
        if (market['type'] !== 'swap') {
            throw new BadSymbol (this.id + ' setMarginMode() supports swap contracts only');
        }
        marginMode = marginMode.toUpperCase ();
        const request: Dict = {
            'symbol': market['id'],
            'marginType': marginMode,
        };
        const response = await this.privatePostApiV1FuturesMarginType (this.extend (request, params));
        //
        // {"code":200,"symbolId":"BTC-SWAP-USDT","marginType":"ISOLATED"}
        //
        return response;
    }

    /**
     * @method
     * @name toobit#setLeverage
     * @description set the level of leverage for a market
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#change-initial-leverage-trade
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
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
            'leverage': leverage,
        };
        const response = await this.privatePostApiV1FuturesLeverage (this.extend (request, params));
        //
        // {"code":200,"symbolId":"BTC-SWAP-USDT","leverage":"19"}
        //
        return response;
    }

    /**
     * @method
     * @name toobit#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#get-the-leverage-multiple-and-position-mode-user_data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateGetApiV1FuturesAccountLeverage (this.extend (request, params));
        //
        // [
        //     {
        //         "symbol":"BTC-SWAP-USDT", //symbol
        //         "leverage":"20",  // leverage
        //         "marginType":"CROSS" // CROSS;ISOLATED
        //     }
        // ]
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseLeverage (data, market);
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        const leverageValue = this.safeInteger (leverage, 'leverage');
        const marginType = this.safeString (leverage, 'marginType');
        const marginMode = (marginType === 'crossed') ? 'cross' : 'isolated';
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': marginMode,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        } as Leverage;
    }

    /**
     * @method
     * @name toobit#fetchPositions
     * @description fetch all open positions
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#query-position-user_data
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length > 1) {
                throw new BadRequest (this.id + ' fetchPositions() only accepts an array with a single symbol or without symbols argument');
            }
            const firstSymbol = this.safeString (symbols, 0);
            if (firstSymbol !== undefined) {
                market = this.market (firstSymbol);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.privateGetApiV1FuturesPositions (this.extend (request, params));
        //
        //    [
        //        {
        //            "symbol": "DOGE-SWAP-USDT",
        //            "side": "LONG",
        //            "avgPrice": "0.21191",
        //            "position": "63",
        //            "available": "63",
        //            "leverage": "25",
        //            "lastPrice": "0.20932",
        //            "positionValue": "13.3503",
        //            "flp": "0.05471",
        //            "margin": "0.5262",
        //            "marginRate": "",
        //            "unrealizedPnL": "-0.1701",
        //            "profitRate": "-0.3185",
        //            "realizedPnL": "-0.008",
        //            "minMargin": "0",
        //            "maxNotionalValue": "10000000",
        //            "markPrice": "0.20921"
        //        }
        //    ]
        //
        return this.parsePositions (response, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const side = this.safeStringLower (position, 'side');
        const quantity = this.safeString (position, 'position');
        const leverage = this.safeInteger (position, 'leverage');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': market['symbol'],
            'entryPrice': this.safeString (position, 'avgPrice'),
            'markPrice': this.safeString (position, 'markPrice'),
            'lastPrice': this.safeString (position, 'lastPrice'),
            'notional': this.safeString (position, 'positionValue'),
            'collateral': undefined,
            'unrealizedPnl': this.safeString (position, 'unrealizedPnL'),
            'side': side,
            'contracts': this.parseNumber (quantity),
            'contractSize': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeString (position, 'margin'),
            'initialMarginPercentage': undefined,
            'leverage': leverage,
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const isPost = method === 'POST';
        const isDelete = method === 'DELETE';
        const extraQuery = {};
        const query = this.omit (params, this.extractParams (path));
        if (api !== 'private') {
            // Public endpoints
            if (!isPost) {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            // Add timestamp to parameters for signed endpoints
            extraQuery['recvWindow'] = this.safeString (this.options, 'recvWindow', '5000');
            extraQuery['timestamp'] = timestamp.toString ();
            const queryExtended = this.extend (query, extraQuery);
            let queryString = '';
            if (isPost || isDelete) {
                // everything else except Batch-Orders
                if (!Array.isArray (params)) {
                    body = this.urlencode (queryExtended);
                } else {
                    queryString = this.urlencode (extraQuery);
                    body = this.json (query);
                }
            } else {
                queryString = this.urlencode (queryExtended);
            }
            let payload = queryString;
            if (body !== undefined) {
                payload = body + payload;
            }
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
            if (queryString !== '') {
                queryString += '&signature=' + signature;
                url += '?' + queryString;
            } else {
                body += '&signature=' + signature;
            }
            headers = {
                'X-BB-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (errorCode && errorCode !== '200' && errorCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
