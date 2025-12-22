
//  ---------------------------------------------------------------------------

import Exchange from './abstract/xcoin.js';
import { BadRequest, ArgumentsRequired, NotSupported, ExchangeError, RateLimitExceeded, PermissionDenied, AuthenticationError, InvalidNonce, RequestTimeout, AccountSuspended, InsufficientFunds, OrderNotFound, InvalidOrder, OperationFailed, BadSymbol, OperationRejected } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Dict, int, LedgerEntry, DepositAddress, CrossBorrowRates, FundingRates, FundingRate, FundingRateHistory, Currencies, BorrowInterest, Position, Leverage, MarginMode, OrderRequest } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class zonda
 * @augments Exchange
 */
export default class xcoin extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'xcoin',
            'name': 'XCoin',
            'countries': [ 'HK' ], // Hong Kong
            'rateLimit': 20,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createOrders': true,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRates': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchPositions': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'setLeverage': true,
                'setMarginMode': true,
                'withdraw': true,
            },
            'hostname': 'xcoin.com',
            'urls': {
                'referral': '__________________________',
                'logo': '__________________________',
                'www': 'https://xcoin.com/',
                'api': {
                    'public': 'https://api.{hostname}/api',
                    'private': 'https://api.{hostname}/api',
                },
                'doc': [
                    'https://xcoin.com/docs/',
                ],
                'support': 'https://support.xcoin.com/',
                'fees': 'https://xcoin.com/zh-CN/trade/guide/spot-fee-rate',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/market/time': 1,
                        'v2/public/symbols': 1,
                        'v1/market/depth': 1,
                        'v1/market/ticker/mini': 1,
                        'v1/market/trade': 1,
                        'v1/market/ticker/24hr': 1,
                        'v1/market/kline': 1,
                        'v1/market/deliveryExercise/history': 1,
                        'v1/market/fundingRate': 1,
                        'v1/market/fundingRate/history': 1,
                        'v1/public/baseRates': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/trade/openOrders': 1,
                        'v2/trade/order/info': 1,
                        'v2/history/orders': 1,
                        'v2/history/order/operations': 1,
                        'v2/history/trades': 1,
                        'v2/trade/openOrderComplex': 1,
                        'v2/history/orderComplexs': 1,
                        // RFQ (currenty not available)
                        'v1/blockRfq/counterparties': 1,
                        'v1/blockRfq/rfqs': 1,
                        'v1/blockRfq/quotes': 1,
                        'v1/blockRfq/trades': 1,
                        //
                        'v1/account/convert/exchangeInfo': 1,
                        'v1/account/convert/history/orders': 1,
                        'v2/trade/positions': 1,
                        'v1/trade/lever': 1,
                        'v1/account/balance': 1,
                        'v1/account/transferBalance': 1,
                        'v1/account/availableBalance': 1,
                        'v1/history/bill': 1,
                        'v1/account/interest/history': 1,
                        'v1/asset/account/info': 1, // todo: fetchAccount new method
                        'v1/asset/balances': 1,
                        'v1/asset/bill': 1,
                        'v1/asset/currencies': 1,
                        'v1/asset/deposit/address': 1,
                        'v1/asset/deposit/record': 1,
                        'v1/asset/withdrawal/address': 1,
                        'v1/asset/withdrawal/record': 1,
                        'v1/asset/transfer/history': 1,
                        'v1/asset/accountMembers': 1,
                        'v1/asset/crossTransfer/history': 1,
                        'v1/public/flexible/product': 1,
                        'v1/public/flexible/rateHistory': 1,
                        'v1/earn/flexible/records': 1,
                    },
                    'post': {
                        'v2/trade/order': 1,
                        'v2/trade/batchOrder': 1,
                        'v1/trade/cancelOrder': 1,
                        'v1/trade/batchCancelOrder': 1,
                        'v1/trade/cancelAllOrder': 1,
                        'v2/trade/orderComplex': 1,
                        'v1/trade/cancelComplex': 1,
                        'v1/trade/cancelAllOrderComplexs': 1,
                        // RFQ (currenty not available)
                        'v1/blockRfq/rfq': 1,
                        'v1/blockRfq/legPrices': 1,
                        'v1/blockRfq/cancelRfq': 1,
                        'v1/blockRfq/cancelAllRfqs': 1,
                        'v1/blockRfq/executeQuote': 1,
                        'v1/blockRfq/quote': 1,
                        'v1/blockRfq/editQuote': 1,
                        'v1/blockRfq/cancelQuote': 1,
                        'v1/blockRfq/cancelAllQuotes': 1,
                        //
                        'v1/account/convert/getQuote': 1,
                        'v1/account/convert/acceptQuote': 1,
                        //
                        'v1/trade/lever': 1,
                        'v2/trade/stopPosition': 1,
                        'v1/account/marginModeSet': 1,
                        'v1/asset/withdrawal': 1,
                        'v1/asset/transfer': 1,
                        'v1/asset/crossTransfer': 1,
                        'v1/earn/flexible/setFlexibleOnOff': 1,
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
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'options': {
                'accountsByType': {
                    'funding': 'funding',
                    'trading': 'trading',
                },
                'fetchTickers': {
                    'method': 'publicGetV1MarketTicker24hr', // publicGetV1MarketTicker24hr, publicGetV1MarketTickerMini
                },
                'fetchBalance': {
                    'defaultType': 'trading', // trading, funding
                },
                'fetchLedger': {
                    'defaultType': 'trading', // trading, funding
                },
                'networks': {
                    'BTC': 'btc',
                    'ETH': 'eth',
                    'ERC20': 'eth',
                    'TRX': 'trx',
                    'TRC20': 'trx',
                    'BEP20': 'bnb',
                    'SOL': 'sol',
                    'XRP': 'xrp',
                    'DOGE': 'doge',
                    'LTC': 'ltc',
                    'NEAR': 'near',
                    'FIL': 'fil',
                    'ARBONE': 'arb',
                    'BASE': 'base',
                    'DOT': 'dot',
                    'ICP': 'icp',
                    'ADA': 'ada',
                    'AVAXC': 'avax',
                    'ATOM': 'atom',
                    'BCH': 'bch',
                    'APT': 'apt',
                    'SONIC': 'sonic',
                    'TON': 'ton',
                    'OPT': 'op',
                    'SUI': 'sui',
                    'ETC': 'etc',
                    'POL': 'pol',
                    'TIA': 'tia',
                    'XLM': 'xlm',
                },
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'mark': true,
                            'index': true,
                            'last': true,
                        },
                        'triggerDirection': true,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': true,
                                'mark': true,
                                'index': true,
                            },
                            'price': true,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                    },
                    'createOrders': {
                        'max': 20,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': 1,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': undefined,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': true,
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
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    // Public Error Codes - Client Errors
                    '10000': BadRequest, // POST request body cannot be empty
                    '10001': BadRequest, // JSON syntax error
                    '10002': ExchangeError, // Network error, please contact customer support
                    '10003': BadRequest, // API has been deprecated or is unavailable
                    '10004': BadRequest, // Invalid Content-Type, please use "application/JSON"
                    '10005': RateLimitExceeded, // Request rate too high
                    '10006': OperationFailed, // System busy, please try again later
                    '10010': PermissionDenied, // This API requires the APIKey to be bound to an IP
                    '10101': AuthenticationError, // APIKey does not exist
                    '10102': InvalidNonce, // Request timestamp expired
                    '10103': AuthenticationError, // Request header "X-ACCESS-APIKEY" cannot be empty
                    '10104': AuthenticationError, // Request header "X-ACCESS-SIGN" cannot be empty
                    '10105': AuthenticationError, // Request header "X-ACCESS-TIMESTAMP" cannot be empty
                    '10106': BadRequest, // Request header "Content-Type" cannot be empty
                    '10107': PermissionDenied, // Your IP is not in the APIKey's whitelist
                    '10110': BadRequest, // Invalid X-ACCESS-TIMESTAMP
                    '10111': BadRequest, // Invalid Content-Type
                    '10112': AuthenticationError, // Invalid signature
                    '10113': BadRequest, // Invalid request method
                    '10114': PermissionDenied, // APIKey has no permission to call this API
                    '10115': PermissionDenied, // APIKey is disabled
                    '10116': PermissionDenied, // Operator associated with APIKey has no permission for this API
                    '10117': PermissionDenied, // Platform restricts this operation, please contact customer support
                    '10118': RequestTimeout, // API request timed out
                    '10119': AccountSuspended, // Account is disabled
                    '10120': PermissionDenied, // Account permission prohibits this trade
                    '10121': PermissionDenied, // Account does not support deposits
                    '10122': PermissionDenied, // Only master account supports withdrawals
                    '10123': BadRequest, // For member-level APIKey, accountName cannot be empty
                    '10124': PermissionDenied, // Current APIKey has no permission to operate accountName
                    '10125': AccountSuspended, // Member is disabled
                    '11000': BadRequest, // Invalid source
                    '11001': InvalidNonce, // Session expired. Access denied.
                    '11002': PermissionDenied, // No permission. Access denied.
                    '11003': BadRequest, // Request method not supported.
                    '11004': RateLimitExceeded, // Rate limit exceeded. Please try again later.
                    '11005': BadRequest, // Invalid field. Please correct it.
                    '11006': BadRequest, // Required field is missing. Please provide it.
                    '11007': BadRequest, // Invalid parameters
                    '11008': BadRequest, // Duplicate request
                    '11009': OperationRejected, // Field value out of allowed range
                    '11010': AuthenticationError, // Signature verification failed
                    '11011': PermissionDenied, // Invalid IP address
                    '11012': InvalidNonce, // Timestamp expired
                    // Public Error Codes - Server Errors
                    '20001': OperationFailed, // Service temporarily unavailable, please try again later
                    '20002': OperationFailed, // System error, please try again later
                    '20003': OperationFailed, // System execution exception, please contact customer support
                    '20004': BadRequest, // Invalid account ID
                    '20005': BadRequest, // Invalid transfer amount
                    '20006': InsufficientFunds, // Insufficient transferable balance
                    '20007': BadRequest, // Duplicate clientId
                    '20008': InsufficientFunds, // Order failed due to insufficient available balance
                    '20009': BadSymbol, // Invalid trading pair
                    '20010': OrderNotFound, // Order not found
                    '20013': BadRequest, // Leverage must be greater than 0
                    '20014': BadSymbol, // Invalid trading pair or currency for leverage adjustment
                    '20015': OperationRejected, // Cannot adjust leverage while there are open orders
                    '20016': InsufficientFunds, // Insufficient margin
                    '20017': BadSymbol, // Invalid currency
                    '20020': OperationRejected, // Max leverage not configured
                    '20021': OperationRejected, // Default leverage not configured
                    '20022': OperationRejected, // Cannot disable account when balance is not zero
                    '20023': OperationFailed, // One-click close Failed
                    '20025': AccountSuspended, // Account has been disabled
                    '20026': InvalidOrder, // Cannot place reduce-only order when there is no position
                    '20027': InvalidOrder, // Cannot place reduce-only order when order direction is the same as position direction
                    '20028': InvalidOrder, // Cannot place reduce-only order when order size exceeds opposite position size
                    '20029': InvalidOrder, // Cannot place order when a better-priced order already exists in the same direction
                    '20030': BadRequest, // Futures order quantity must be a positive integer
                    '20031': OperationFailed, // Market order system error
                    '20032': OperationFailed, // Trading not allowed in liquidation state
                    '20033': PermissionDenied, // Withdrawals only allowed to addresses in address book
                    '20034': PermissionDenied, // Daily withdrawal limit exceeded
                    '20035': BadRequest, // Network not supported for withdrawal. Please choose another one.
                    '20036': PermissionDenied, // Risky address. Please use a different address and try again.
                    '20037': BadRequest, // Duplicate transfer
                    '20038': OperationRejected, // Account number not found
                    '20039': BadRequest, // Withdrawal amount below minimum
                    '20040': BadRequest, // Unsupported transfer type
                    '20041': OperationRejected, // Account unavailable
                    '20042': BadRequest, // qty and price cannot both be empty
                    '20043': OrderNotFound, // MMP order not found
                    '20044': BadRequest, // mmpGroup unavailable
                    '20045': BadRequest, // mmpGroup does not match symbolFamily
                    '20046': BadRequest, // Duplicate quoteId
                    '20048': InvalidOrder, // Total order quantity exceeds maximum per order
                    '20049': OperationRejected, // Trading pair not active
                    '20050': PermissionDenied, // API transaction restrictions
                    '20051': OperationFailed, // Symbol price anomaly
                    '20052': PermissionDenied, // Withdrawals are barred within 24h after users modify MFA details
                    '20053': OperationRejected, // Open positions or pending orders currently exist
                    '20054': OperationRejected, // Leverage cannot be adjusted under the portfolio margin mode
                    '20055': OperationRejected, // This account is part of an account group and cannot switch margin mode independently
                    '20056': OperationFailed, // Platform risk control alert, please try again later
                    '20057': OperationFailed, // In a high-risk state, orders that would increase the MMR are prohibited
                    '20058': OperationFailed, // In a high-risk state, opening new positions is prohibited
                    // Field Validation Error Codes
                    '40001': BadRequest, // Required parameter cannot be empty
                    '40002': BadRequest, // endTime must be greater than startTime
                    '40003': BadRequest, // endTime must be greater than beginTime
                    '40004': BadRequest, // endTime - startTime must be less than 30 days
                    '40005': BadRequest, // endTime - beginTime must be less than 30 days
                    '40006': BadSymbol, // Symbol is not in tradable status
                    '40007': BadRequest, // This API businessType does not support the given dictionary value
                    '40008': OperationRejected, // limit cannot exceed the maximum value for this API
                    '40009': BadSymbol, // Currency is not listed
                    '40010': OperationRejected, // Currency does not support lending
                    '40011': OperationRejected, // Currency lending is restricted on the current platform
                    '40012': BadRequest, // endId must be greater than or equal to beginId
                    '40013': OrderNotFound, // Order not found, the order does not exist
                    '40014': BadRequest, // Only spot instruments are supported
                    '40015': BadRequest, // Invalid input parameter
                    '40016': OperationRejected, // Currency does not support deposits via chain
                    '40017': OperationRejected, // Currency does not support deposits
                    '40018': BadSymbol, // Currency is a fiat currency and does not support on-chain deposits
                    '40019': OperationRejected, // Currency does not support transfers
                    '40020': BadRequest, // baseCurrency and quoteCurrency cannot be the same
                    // Field Logic Validation Error Codes
                    '50001': InvalidOrder, // For market order type, price must be empty
                    '50002': InvalidOrder, // For current orderType, price cannot be empty
                    '50004': InvalidOrder, // Price cannot be negative
                    '50005': InvalidOrder, // Invalid marketUnit value, quote_currency is only supported for spot instruments
                    '50006': InvalidOrder, // For market orders, timeInForce only supports IOC
                    '50007': InvalidOrder, // Duplicate clientId error
                    '50008': InvalidOrder, // Spot trading does not support reduce-only orders
                    '50009': InvalidOrder, // Take-profit price must be higher than order price
                    '50010': InvalidOrder, // Take-profit price must be lower than order price
                    '50011': InvalidOrder, // Stop-loss price must be lower than order price
                    '50012': InvalidOrder, // Stop-loss price must be higher than order price
                    '50013': InvalidOrder, // For tpOrderType = market, tpLimitPrice must be empty
                    '50014': InvalidOrder, // For slOrderType = market, slLimitPrice must be empty
                    '50015': InvalidOrder, // For tpOrderType = limit, tpLimitPrice cannot be empty
                    '50016': InvalidOrder, // For slOrderType = limit, slLimitPrice cannot be empty
                    '50017': InvalidOrder, // tpLimitPrice cannot be negative
                    '50018': InvalidOrder, // slLimitPrice cannot be negative
                    '50021': OperationRejected, // List limit exceeded
                    '50022': OperationFailed, // Batch orders partially failed
                    '50023': OperationFailed, // Batch orders all failed
                    '50026': OperationRejected, // Order already completed, cancelation failed
                    '50032': InvalidOrder, // qty must be positive
                    '50113': InvalidOrder, // post_only orders can only be set to GTC
                    '50306': OperationRejected, // mmpGroup is frozen, order placement not supported
                    '50307': BadSymbol, // mmpGroup does not match symbol
                    '50308': InvalidOrder, // Duplicate quoteId
                    '50309': InvalidOrder, // ask price must be higher than bid price
                    '50310': InvalidOrder, // For ask or bid information, at least one of price or qty must be provided
                    '50312': InvalidOrder, // Each mmpGroup can have only one quote set per symbol
                    '50313': InvalidOrder, // rejectPostOnly can only be set to true when postOnly = true
                    '50314': InvalidOrder, // postOnly = true is not allowed when price is empty
                    '50315': InvalidOrder, // Invalid quote, at least one of ask or bid information must be provided
                    '50316': OperationRejected, // No more than maximum MMP orders can be submitted at once
                    // Underlying Parameter Validation Error Codes
                    '60100': InsufficientFunds, // Insufficient available balance
                    '60101': OperationFailed, // Your borrowing has exceeded your loan limit
                    '60102': OperationFailed, // Borrowing exceeds the available amount in the current liquidity pool
                    '60107': OperationRejected, // Exceeded maximum number of open orders
                    '60108': InvalidOrder, // Limit order exceeds maximum order amount per order
                    '60109': InvalidOrder, // Limit order exceeds maximum order quantity per order
                    '60110': InvalidOrder, // Market order exceeds maximum order amount per order
                    '60111': InvalidOrder, // Market order exceeds maximum order quantity per order
                    '60112': InvalidOrder, // Below minimum order quantity per order
                    '60113': InvalidOrder, // Below minimum order amount per order
                    '60114': InvalidOrder, // Limit order exceeds maximum price protection
                    '60115': InvalidOrder, // Limit order is below minimum price protection
                    '60116': InvalidOrder, // Price decimal places exceed limit
                    '60117': InvalidOrder, // Quantity decimal places exceed limit
                    '60126': OperationRejected, // No open positions, reduce-only order not allowed
                    '60127': InvalidOrder, // Order direction is the same as position direction, reduce-only order not allowed
                    '60128': InvalidOrder, // Order quantity exceeds opposite position size, reduce-only order not allowed
                    '60129': OperationRejected, // Existing better price-time priority order in the same direction, order not allowed
                    '60130': InvalidOrder, // Contract order quantity must be a positive integer
                    '60131': OperationRejected, // Order exceeds basis rate limit
                    '60132': OperationFailed, // Abnormal instrument, market order price unavailable
                    '60134': OperationRejected, // Trading not allowed in liquidation state
                    '60135': InvalidOrder, // Current leverage exceeds maximum order amount
                    '60136': BadRequest, // Input price is not a multiple of tickSize
                    '60137': OperationRejected, // Trading not allowed in ADL state
                    '60138': OperationRejected, // Currently in [Open Position Restricted] state
                    '60139': OperationRejected, // Opening position may trigger forced liquidation
                    '60140': OperationRejected, // Closing position may result in negative equity
                    '60141': OperationRejected, // Currently in [Close Position Restricted] state
                    '60142': OperationRejected, // Order price would execute immediately, does not meet post_only condition
                    '60143': OperationRejected, // Order price cannot be executed, does not meet IOC or FOK condition
                    '60150': OperationRejected, // Opening positions not allowed within minutes before settlement
                    '60170': OperationRejected, // Order restricted: placing this order may cause the account-level position limit to be exceeded
                    '60171': OperationRejected, // Order restricted: placing this order may cause the organization-level aggregated position limit to be exceeded
                    '60172': OperationRejected, // Order restricted: placing this order may cause the position ratio to exceed the system-wide maximum
                    '60173': PermissionDenied, // Restricts API trading for opening positions
                    '60174': PermissionDenied, // Restricts API trading for closing positions
                    '60175': PermissionDenied, // Restricts API trading
                    '60176': OperationFailed, // Triggered platform risk control, please try again later
                    // WebSocket Error Codes
                    '70100': RequestTimeout, // Heartbeat check timed out, connection disconnected
                    '70101': InvalidNonce, // accessTimestamp has expired
                    '70102': PermissionDenied, // WS trading is only supported with account-level API keys
                },
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name xcoin#fetchMarkets
     * @description retrieves data on all markets
     * @see https://xcoin.com/docs/coinApi/ticker/get-the-basic-information-of-trading-products
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV2PublicSymbols (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "businessType": "linear_perpetual",
        //                "symbol": "BTC-USDT-PERP",
        //                "symbolFamily": "BTC-USDT",
        //                "quoteCurrency": "USDT",
        //                "baseCurrency": "BTC",
        //                "settleCurrency": "USDT",
        //                "ctVal": "0.0001",
        //                "tickSize": "0.1",
        //                "status": "trading",
        //                "deliveryTime": null,
        //                "deliveryFeeRate": null,
        //                "pricePrecision": "1",
        //                "quantityPrecision": "4",
        //                "onlineTime": "1750127400000",
        //                "riskEngineRate": "0.02",
        //                "maxLeverage": "75.000000000000000000",
        //                "contractType": null,
        //                "orderParameters": {
        //                    "minOrderQty": "0.0001",
        //                    "minOrderAmt": null,
        //                    "maxOrderNum": "200",
        //                    "maxTriggerOrderNum": "30",
        //                    "maxTpslOrderNum": "30",
        //                    "maxLmtOrderAmt": null,
        //                    "maxMktOrderAmt": null,
        //                    "maxLmtOrderQty": "50",
        //                    "maxMktOrderQty": "1",
        //                    "basisLimitRatio": "0.1"
        //                },
        //                "priceParameters": {
        //                    "maxLmtPriceUp": "0.05",
        //                    "minLmtPriceDown": "0.05",
        //                    "maxMktPriceUp": "0.05",
        //                    "minMktPriceDown": "0.05"
        //                },
        //                "positionParameters": {
        //                    "positionRatioThreshold": "10000000",
        //                    "positionMaxRatio": "0.1",
        //                    "positionCidMaxRatio": "0.3",
        //                    "defaultLeverRatio": "10"
        //                },
        //                "group": [
        //                    "0.1",
        //                    "1",
        //                    "10",
        //                    "100"
        //                ]
        //            },
        //        ],
        //        "ts": "1676428445631"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = this.parseMarket (data[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (item): Market {
        const id = this.safeString (item, 'symbol');
        const baseId = this.safeString (item, 'baseCurrency');
        const quoteId = this.safeString (item, 'quoteCurrency');
        let settleId = this.safeString (item, 'settleCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let settle = this.safeCurrencyCode (settleId);
        let expiry = this.safeInteger (item, 'deliveryTime');
        let strike = undefined;
        let optionType = undefined;
        const businessType = this.safeString (item, 'businessType');
        let marketType = undefined;
        let symbol = base + '/' + quote;
        let subType = undefined;
        if (businessType === 'spot') {
            marketType = 'spot';
        } else if (businessType === 'linear_perpetual') {
            marketType = 'swap';
            subType = 'linear';
            symbol = symbol + ':' + settle;
        } else if (businessType === 'linear_futures') {
            marketType = 'future';
            subType = 'linear';
            symbol = symbol + ':' + settle + '-' + this.yymmdd (expiry);
        } else if (businessType === 'options') {
            marketType = 'option';
            subType = 'linear';
            const splited = id.split ('-'); // eg: 'BTC-USDT-26JUN26-85000-P'
            const expiryRaw = this.safeString (splited, 2);
            const expiryStr = this.convertMarketIdExpireDate (expiryRaw);
            const expiryDate = this.convertExpireDate (expiryStr);
            expiry = this.parse8601 (expiryDate);
            const strikeString = this.safeString (item, 'strikePrice');
            strike = this.parseNumber (strikeString);
            optionType = this.safeString (item, 'optType');
            symbol = symbol + ':' + settle + '-' + strikeString + '-' + expiryStr + '-' + optionType;
        }
        const parameters = this.safeDict (item, 'orderParameters', {});
        const contractSize = this.parseNumber ('1'); // 'ctVal' does not seem the right one
        const isSpot = (marketType === 'spot');
        const isSwap = (marketType === 'swap');
        const isFuture = (marketType === 'future');
        const isOption = (marketType === 'option');
        const isContract = isSwap || isFuture || isOption;
        if (isSpot) {
            settleId = undefined;
            settle = undefined;
        }
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': isSpot,
            'margin': undefined,
            'swap': isSwap,
            'future': isFuture,
            'option': isOption,
            'active': (this.safeString (item, 'status') === 'trading'),
            'contract': isSwap || isFuture || isOption,
            'linear': (subType === 'linear') ? true : undefined,
            'inverse': (subType === 'linear') ? false : undefined,
            'taker': undefined,
            'maker': undefined,
            'contractSize': isContract ? contractSize : undefined,
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'optionType': optionType,
            'strike': this.parseNumber (strike),
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (item, 'quantityPrecision'))),
                'price': this.safeNumber (item, 'tickSize'), // strange, but pricePrecision is different
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeInteger (item, 'maxLeverage'),
                },
                'amount': {
                    'min': this.safeNumber (parameters, 'minOrderQty'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (parameters, 'minOrderAmt'),
                    'max': undefined,
                },
            },
            'created': this.safeInteger (item, 'onlineTime'),
            'info': item,
        };
    }

    /**
     * @method
     * @name xcoin#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://xcoin.com/docs/coinApi/funding-account/get-currency-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        // private endpoint
        if (!this.checkRequiredCredentials (false)) {
            return {};
        }
        const response = await this.privateGetV1AssetCurrencies (params);
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "accountName": "test123",
        //                "pid": "1981204053820035072",
        //                "uid": "176118985582700",
        //                "cid": "176118985590600",
        //                "currency": "SOL",
        //                "name": "Solana",
        //                "icon": "https://static.xcoin.com/1932683099083247616",
        //                "traderAuth": true,
        //                "depositAuth": true,
        //                "withdrawAuth": true,
        //                "haircut": "",
        //                "currencyPrecision": "8",
        //                "maxLeverage": "",
        //                "chains": [
        //                    {
        //                        "chainType": "sol",
        //                        "minDep": "0.00099",
        //                        "minWd": "0.11",
        //                        "maxWd": "10000",
        //                        "withdrawFee": "0.001",
        //                        "depositAuth": true,
        //                        "withdrawAuth": true
        //                    }
        //                ]
        //            }
        //        ],
        //        "msg": "Success",
        //        "ts": "1761644584108",
        //        "traceId": "7cd27fb2914b9eb97f733a745807bb6b"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const currencyId = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const networks: Dict = {};
            const chains = currency['chains'];
            const chainsLength = chains.length;
            for (let j = 0; j < chainsLength; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chainType');
                const networkCode = this.networkIdToCode (networkId);
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'active': undefined,
                    'deposit': this.safeBool (chain, 'depositAuth'),
                    'withdraw': this.safeBool (chain, 'withdrawAuth'),
                    'fee': this.safeNumber (chain, 'withdrawFee'),
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'minWd'),
                            'max': this.safeNumber (chain, 'maxWd'),
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'minDep'),
                            'max': undefined,
                        },
                    },
                    'info': chain,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'info': chains,
                'code': code,
                'id': currencyId,
                'name': this.safeString (currency, 'name'),
                'active': undefined,
                'deposit': this.safeBool (currency, 'depositAuth'),
                'withdraw': this.safeBool (currency, 'withdrawAuth'),
                'fee': undefined,
                'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'currencyPrecision'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'type': undefined, // atm only crypto
                'networks': networks,
            });
        }
        return result;
    }

    /**
     * @method
     * @name xcoin#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://xcoin.com/docs/coinApi/ticker/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetV1MarketTime (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": {
        //            "time": "1761576724320"
        //        },
        //        "ts": "1761576724320"
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.safeInteger (data, 'time');
    }

    /**
     * @method
     * @name xcoin#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://xcoin.com/docs/coinApi/ticker/get-order-book-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request: Dict = {
            'symbol': id,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketDepth (this.extend (request, params));
        //
        //  {
        //     "code": "0",
        //     "msg":"success",
        //     "data": {
        //       "bids": [
        //         ["65000","0.1"],
        //         ["65001","0.1"],
        //       ],
        //       "asks": [
        //         ["65003","0.1"],
        //         ["65004","0.1"],
        //       ],
        //       "lastUpdateId": "5001"
        //    },
        //    "ts": "1732158178000"
        //  }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (response, 'ts');
        const orderBook = this.parseOrderBook (data, market['symbol'], timestamp);
        orderBook['nonce'] = this.safeInteger (data, 'lastUpdateId');
        return orderBook;
    }

    /**
     * @method
     * @name xcoin#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://xcoin.com/docs/coinApi/ticker/get-24-hour-ticker-data
     * @see https://xcoin.com/docs/coinApi/ticker/get-latest-ticker-information
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.defaultType] spot (default), swap
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeString (symbols, 0);
            market = this.market (symbol);
            const marketIds = this.marketIds (symbols);
            request['symbol'] = marketIds.join (',');
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        request['businessType'] = (marketType === 'spot') ? 'spot' : 'linear_perpetual';
        let response = undefined;
        let method: Str = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'fetchTickers', 'method', 'publicGetV1MarketTicker24hr'); // publicGetV1MarketTicker24hr, publicGetV1MarketTickerMini
        if (method === 'publicGetV1MarketTickerMini') {
            response = await this.publicGetV1MarketTickerMini (this.extend (request, params));
        } else {
            response = await this.publicGetV1MarketTicker24hr (this.extend (request, params));
        }
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "businessType": "spot",
        //                "symbol": "ENA-USDT",
        //                "priceChange": "0.0087",
        //                "priceChangePercent": "0.017661388550548112",
        //                "lastPrice": "0.5013",
        //                "openPrice": "0.4926",
        //                "highPrice": "0.5344",
        //                "lowPrice": "0.4926",
        //                "fillQty": "1694436.24",
        //                "fillAmount": "868188.786879",
        //                "count": "14804",
        //                "baseCurrency": "ENA",
        //                "indexPrice": "0.5014",
        //                "markPrice": "0",
        //                "fundingRate": "0",
        //                "toNextFundRateTime": "0"
        //            },
        //        ],
        //        "ts": "1676428445631"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'openPrice'),
            'close': this.safeString (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'fillAmount'),
            'quoteVolume': this.safeString (ticker, 'fillQty'),
            'mark': this.safeString (ticker, 'markPrice'),
            'index': this.safeString (ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name xcoin#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://xcoin.com/docs/coinApi/ticker/get-recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchTrades', symbol, since, limit, params) as Trade[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketTrade (this.extend (request, params));
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "id": "1121384806",
        //                "symbol": "BTC-USDT-PERP",
        //                "side": "buy",
        //                "price": "115560.1",
        //                "qty": "0.0006",
        //                "time": "1761584074207"
        //            },
        //         ],
        //        "ts": "1761584074208"
        //    }
        //
        const trades = this.safeList (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //       {
        //           "id": "1121384806",
        //           "symbol": "BTC-USDT-PERP",
        //           "side": "buy",
        //           "price": "115560.1",
        //           "qty": "0.0006",
        //           "time": "1761584074207"
        //       },
        //
        // fetchOrderTrades
        //
        //       {
        //         "orderId": "1308916158820376576",
        //         "operationType": "create_order",
        //         "price": "93000",
        //         "qty": "0.1",
        //         "createTime": "1732158178000",
        //         "accountName": "hongliang01",
        //         "pid": "1917239173600325633",
        //         "cid": "174594041187401",
        //         "uid": "174594041178400"
        //       }
        //
        // fetchMyTrades
        //
        //         {
        //             "id": "20221228071929579::ca2aafd0-1270-4b56-b0a9-85423b4a07c8",
        //             "activity_type": "FILL",
        //             "transaction_time": "2022-12-28T12:19:29.579352Z",
        //             "type": "fill",
        //             "price": "67.31",
        //             "qty": "0.07",
        //             "side": "sell",
        //             "symbol": "LTC/USD",
        //             "leaves_qty": "0",
        //             "order_id": "82eebcf7-6e66-4b7e-93f8-be0df0e4f12e",
        //             "cum_qty": "0.07",
        //             "order_status": "filled",
        //             "swap_rate": "1"
        //         },
        //
        // from WS> order > tradeList
        //
        //         {
        //             "fillPrice": "0.589",
        //             "tradeId": "4503599627840140",
        //             "role": "taker",
        //             "fillQty": "10",
        //             "fillTime": "1762788970362",
        //             "feeCurrency": "ADA",
        //             "fee": "-0.0016",
        //             "eventId": "1",
        //             "clientOrderId": "1437586666466402304",
        //             "orderId": "1437586666466402304",
        //             "businessType": "spot",
        //             "symbol": "ADA-USDT",
        //             "side": "buy",
        //             "orderType": "market",
        //             "lever": "0"
        //           }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeIntegerN (trade, [ 'time', 'createTime', 'fillTime' ]);
        let fee = undefined;
        const feeRaw = this.safeString (trade, 'fee');
        if (feeRaw !== undefined) {
            fee = {
                'cost': this.parseNumber (Precise.stringAbs (feeRaw)),
                'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeStringN (trade, [ 'id', 'orderId', 'tradeId' ]),
            'order': this.safeString (trade, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': this.safeString (trade, 'role'),
            'side': this.safeString (trade, 'side'),
            'price': this.safeString2 (trade, 'price', 'fillPrice'),
            'amount': this.safeString2 (trade, 'qty', 'fillQty'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name xcoin#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://xcoin.com/docs/coinApi/ticker/get-kline-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 1000) as OHLCV[];
        }
        const market = this.market (symbol);
        let request: Dict = {
            'period': this.safeString (this.timeframes, timeframe, timeframe),
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // max 200, default 200
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.publicGetV1MarketKline (this.extend (request, params));
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            [
        //                "1h",
        //                "1761588000000",
        //                "1761588972388",
        //                "115647.3",
        //                "115674.9",
        //                "115742",
        //                "115493.4",
        //                "254.0191",
        //                "29372081.25293",
        //                "1228",
        //                "27.6",
        //                "0.000238656674215481"
        //            ],
        //        ],
        //        "ts": "1761588974866"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 5),
            this.safeNumber (ohlcv, 6),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 7),
        ];
    }

    /**
     * @method
     * @name xcoin#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://xcoin.com/docs/coinApi/ticker/get-current-funding-rate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV1MarketFundingRate (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "symbol": "TRUMP-USDT-PERP",
        //                "fundingRate": "-0.000146",
        //                "fundingTime": "1761638400000",
        //                "fundingInterval": "8",
        //                "upperFundingRate": "0.03",
        //                "lowerFundingRate": "-0.03"
        //            },
        //        ],
        //        "ts": "1761627696000"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRates (data, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const fundingRate = this.safeNumber (contract, 'fundingRate');
        const nextFundingRateTimestamp = this.safeInteger (contract, 'fundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'previousFundingRate': undefined,
            'nextFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'nextFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'nextFundingDatetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': nextFundingRateTimestamp,
            'fundingDatetime': this.iso8601 (nextFundingRateTimestamp),
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name xcoin#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://xcoin.com/docs/coinApi/ticker/get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
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
        let request: Dict = {
            'symbol': market['id'],
        };
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketFundingRateHistory (this.extend (request, params));
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "fundingRate": "0.000062171216727901",
        //                "fundingTime": "1761609600000",
        //                "markPrice": "114056.3"
        //            },
        //        ],
        //        "ts": "1761627696000"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRateHistories (data, market, since, limit) as FundingRateHistory[];
    }

    parseFundingRateHistory (contract, market: Market = undefined) {
        const marketId = this.safeString (contract, 'symbol');
        const timestamp = this.safeInteger (contract, 'fundingTime');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market),
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name xcoin#fetchCrossBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://xcoin.com/docs/coinApi/ticker/get-margin-interest-rates
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    async fetchCrossBorrowRates (params = {}): Promise<CrossBorrowRates> {
        await this.loadMarkets ();
        const response = await this.publicGetV1PublicBaseRates (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "currency": "USDT",
        //                "borrowed": "1030.197645707887976309",
        //                "remainingQuota": "279325.425680997126775253",
        //                "rate": "0.04158911"
        //            },
        //        ],
        //        "ts": "1676428445631"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            rates.push (this.parseBorrowRate (data[i]));
        }
        return rates as any;
    }

    parseBorrowRate (info, currency: Currency = undefined) {
        const timestamp = this.safeInteger (info, 'ts');
        return {
            'currency': this.safeCurrencyCode (this.safeString (info, 'currency')),
            'rate': this.safeNumber (info, 'rate'),
            'period': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    /**
     * @method
     * @name xcoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://xcoin.com/docs/coinApi/funding-account/get-funding-account-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] "funding" or "trading" (default)
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let defaultType = undefined;
        [ defaultType, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'type');
        let response = undefined;
        if (defaultType === 'funding') {
            response = await this.privateGetV1AssetBalances (params);
            //
            //    {
            //        "code": "0",
            //        "data": [
            //            {
            //                "accountName": "CCXT_testing",
            //                "pid": "1981204053820035072",
            //                "uid": "176118985582700",
            //                "cid": "176118985590600",
            //                "currency": "USDT",
            //                "accountType": "funding",
            //                "balance": "90",
            //                "freeze": "0",
            //                "equity": "90",
            //                "withdrawAble": "90"
            //            }
            //        ],
            //        "msg": "Success",
            //        "ts": "1762541715636",
            //        "traceId": "3104f5b29a4529ddd1cc628dda65906e"
            //    }
            //
        } else {
            response = await this.privateGetV1AccountBalance (params);
            //
            //    {
            //        "code": "0",
            //        "msg": "success",
            //        "data": {
            //            "accountName": "CCXT_testing",
            //            "totalEquity": "57.532225839060285117",
            //            "totalMarginBalance": "57.039614384166099192",
            //            "totalAvailableBalance": "42.231274540860568109",
            //            "totalEffectiveMargin": "57.030791152166099192",
            //            "totalPositionValue": "55.158783056527655416",
            //            "totalIm": "14.799516611305531083",
            //            "totalMm": "0.438690861130553108",
            //            "totalOpenLoss": "0.008823232",
            //            "mmr": "0.00769218",
            //            "imr": "0.25950046",
            //            "accountLeverage": "0.96717548",
            //            "contractUpl": "-10.22805",
            //            "flexibleEquity": "0.0000",
            //            "flexiblePnl": "0.0000",
            //            "autoSubscribe": false,
            //            "details": [
            //                {
            //                    "currency": "ADA",
            //                    "equity": "1.9768",
            //                    "totalBalance": "1.9768",
            //                    "cashBalance": "1.9768",
            //                    "savingBalance": "0",
            //                    "leftPersonalQuota": null,
            //                    "savingTotalPnl": null,
            //                    "savingLastPnl": null,
            //                    "savingHoldDays": null,
            //                    "savingTotalAPR": "0.000000980000000000",
            //                    "savingLastAPR": null,
            //                    "borrow": "0",
            //                    "frozen": "0",
            //                    "realLiability": "0",
            //                    "potentialLiability": "0",
            //                    "accruedInterest": "0",
            //                    "upl": "0",
            //                    "optionUpl": "0",
            //                    "positionInitialMargin": null,
            //                    "orderInitialMargin": null,
            //                    "liabilityInitialMargin": "0",
            //                    "initialMargin": "0"
            //                },
            //                {
            //                    "currency": "ETH",
            //                    "equity": "-0.000004804420107405",
            //                    "totalBalance": "0",
            //                    "cashBalance": "0",
            //                    "savingBalance": "0",
            //                    "leftPersonalQuota": null,
            //                    "savingTotalPnl": null,
            //                    "savingLastPnl": null,
            //                    "savingHoldDays": null,
            //                    "savingTotalAPR": "0.000003590000000000",
            //                    "savingLastAPR": null,
            //                    "borrow": "0.000004804420107405",
            //                    "frozen": "0",
            //                    "realLiability": "0.000004804420107405",
            //                    "potentialLiability": "0.000004804420107405",
            //                    "accruedInterest": "0",
            //                    "upl": "0",
            //                    "optionUpl": "0",
            //                    "positionInitialMargin": null,
            //                    "orderInitialMargin": null,
            //                    "liabilityInitialMargin": "0.000000960884021481",
            //                    "initialMargin": "0.000000960884021481"
            //                },
            //                {
            //                    "currency": "USDT",
            //                    "equity": "52.999635306646081284",
            //                    "totalBalance": "63.227685306646081284",
            //                    "cashBalance": "63.227685306646081284",
            //                    "savingBalance": "0",
            //                    "leftPersonalQuota": null,
            //                    "savingTotalPnl": null,
            //                    "savingLastPnl": null,
            //                    "savingHoldDays": null,
            //                    "savingTotalAPR": "0.003873400000000000",
            //                    "savingLastAPR": null,
            //                    "borrow": "0",
            //                    "frozen": "0",
            //                    "realLiability": "0",
            //                    "potentialLiability": "0",
            //                    "accruedInterest": "0",
            //                    "upl": "-10.22805",
            //                    "optionUpl": "0",
            //                    "positionInitialMargin": null,
            //                    "orderInitialMargin": null,
            //                    "liabilityInitialMargin": "0",
            //                    "initialMargin": "14.7968"
            //                },
            //            ],
            //            "pid": "1981204053820035072",
            //            "cid": "176118985590600",
            //            "uid": "176118985582700"
            //        },
            //        "ts": "1764569227180"
            //    }
            //
        }
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const timestamp = this.safeInteger (response, 'ts');
        const result: Dict = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let details = [];
        const dataDict = this.safeDict (response, 'data');
        // support WS parsing
        if (dataDict === undefined) {
            const dataList = this.safeList (response, 'data', []);
            const firstDict = this.safeDict (dataList, 0, {});
            details = this.safeList (firstDict, 'details', []);
        } else {
            // handle "funding" response too
            if (dataDict !== undefined) {
                details = this.safeList (response, 'data', []);
            } else {
                details = this.safeList (dataDict, 'details', []);
            }
        }
        for (let i = 0; i < details.length; i++) {
            const balanceRaw = details[i];
            const code = this.safeCurrencyCode (this.safeString (balanceRaw, 'currency'));
            const account = this.account ();
            account['total'] = this.safeString (balanceRaw, 'equity');
            account['used'] = this.safeString2 (balanceRaw, 'frozen', 'freeze');
            account['info'] = balanceRaw;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name xcoin#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://xcoin.com/docs/coinApi/funding-account/get-funding-account-transaction-history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined, max is 2500
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.defaultType] "trading" (default), "funding"
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchLedger', code, since, limit, params, 100) as LedgerEntry[];
        }
        let currency = undefined;
        let request: Dict = {};
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        let defaultType = undefined;
        [ defaultType, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'defaultType');
        let response = undefined;
        if (defaultType === 'funding') {
            response = await this.privateGetV1AssetBill (this.extend (request, params));
            //
            //     {
            //         "code": 0,
            //         "data": [
            //             {
            //                 "accountName": "hongliang01",
            //                 "accountType": "funding",
            //                 "amount": "-112",
            //                 "balance": "499764779.013",
            //                 "billId": "1918143117886697473",
            //                 "cid": "174575858798300",
            //                 "createTime": "1746098331000",
            //                 "currency": "USDT",
            //                 "id": "1918143117886697473",
            //                 "pid": "1916476554095833090",
            //                 "transactionId": "1918143117610061824",
            //                 "uid": "174575858790600",
            //                 "actionType": "21",
            //                 "updateTime": "1746098331000"
            //             },
            //         ],
            //         "msg":"success",
            //         "ts": 1747824336306
            //     }
            //
        } else {
            response = await this.privateGetV1HistoryBill (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": [
            //         {
            //             "accountName": "1915030377665978370",
            //             "id": "6755399451247615",
            //             "businessType": "none",
            //             "symbol": "",
            //             "actionType": "3",
            //             "currency": "BTC",
            //             "qty": "0.000000045812491",
            //             "actionId": "6755399451247615",
            //             "transactionId": "1371472019211829250",
            //             "tradeId": "0",
            //             "lever": "0",
            //             "side": null,
            //             "createTime": "1747026010146",
            //             "pid": "1915030377665978370",
            //             "cid": "174541379399500",
            //             "uid": "174541379390800"
            //         },
            //     ],
            //     "ts": "1747030934883"
            // }
            //
        }
        const data = this.safeList (response, 'data', []);
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        const currencyId = this.safeString (item, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const timestamp = this.safeInteger (item, 'updateTime');
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': undefined,
            'account': undefined,
            'referenceId': this.safeString (item, 'transactionId'),
            'referenceAccount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'amount': this.safeNumber2 (item, 'amount', 'qty'),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency) as LedgerEntry;
    }

    parseLedgerEntryType (typeId: string): string {
        const ledgerTypes: Dict = {
            '1': 'transfer',
            '2': 'transfer',
            '3': 'borrow',
            '4': 'repayment',
            '5': 'trade',
            '6': 'trade',
            '7': 'trade',
            '8': 'trade',
            '9': 'repayment',
            '10': 'repayment',
            '11': 'repayment',
            '12': 'repayment',
            // 13 Forced swap outgoing amount
            // 14 Forced swap incoming amount
            '15': 'fee',
            '16': 'interest',
            '17': 'realized_pnl',
            '18': 'funding',
            '19': 'liquidation',
            '20': 'liquidation',
            '21': 'deposit',
            '22': 'withdrawal',
            '23': 'transfer',
            '24': 'transfer',
            '25': 'transfer',
            '26': 'transfer',
            // 27 Flexible products subscription
            // 28 Flexible products redemption
            '29': 'interest',
            '30': 'fee',
            '31': 'airdrop',
            '32': 'rebate',
            '33': 'other',
            '34': 'bonus',
            '35': 'trial_fund',
            '36': 'compensation',
            '37': 'gas_fee',
            '38': 'failed_recharge_credited',
            '99': 'other',
        };
        return this.safeString (ledgerTypes, typeId, typeId);
    }

    /**
     * @method
     * @name xcoin#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://xcoin.com/docs/coinApi/funding-account/deposit/get-deposit-address
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
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress(): params["network"] is required.');
        }
        const response = await this.privateGetV1AssetDepositAddress (this.extend (request, params));
        //
        // {
        //     "code": 0,
        //     "data": {
        //         "accountName": "hl04",
        //         "addressDeposit": "rsQbUpy1cfGdetwqabbJ8asKXeoY1G3h1N",
        //         "chainType": "XRP",
        //         "cid": "174575859872200",
        //         "currency": "XRP",
        //         "memo": "401145838",
        //         "pid": "1916476600090570754",
        //         "uid": "174575859864400"
        //     },
        //     "msg":"success",
        //     "ts": 1747824336306
        // }
        //
        return this.parseDepositAddress (response, currency);
    }

    parseDepositAddress (depositEntry, currency: Currency = undefined): DepositAddress {
        const currencyId = this.safeString (depositEntry, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        return {
            'info': depositEntry,
            'currency': currency['code'],
            'network': this.networkIdToCode (this.safeString (depositEntry, 'chainType')),
            'address': this.safeString (depositEntry, 'addressDeposit'),
            'tag': this.safeString (depositEntry, 'memo'),
        } as DepositAddress;
    }

    /**
     * @method
     * @name xcoin#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://xcoin.com/docs/coinApi/funding-account/deposit/get-deposit-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchTransactionsHelper ('fetchDeposits', code, since, limit, params);
    }

    /**
     * @method
     * @name xcoin#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://xcoin.com/docs/coinApi/funding-account/withdrawal/get-withdrawal-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchTransactionsHelper ('fetchWithdrawals', code, since, limit, params);
    }

    async fetchTransactionsHelper (methodName, code, since, limit, params) {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, methodName, 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic (methodName, code, since, limit, undefined, params, 100);
        }
        let currency = undefined;
        let request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (methodName === 'fetchDeposits') {
            response = await this.privateGetV1AssetDepositRecord (this.extend (request, params));
        } else {
            response = await this.privateGetV1AssetWithdrawalRecord (this.extend (request, params));
        }
        //
        // {
        //   "code": 0,
        //   "data": [
        //      {
        //         "accountName": "hl04",
        //         "amount": "24381.9837",
        //         "chainType": "eth",
        //         "cid": "174575859872200",
        //         "createTime": "1747818768080",
        //         "currency": "USDT",
        //         "memo": "",
        //         "pid": "1916476600090570754",
        //         "status": "success",
        //         "uid": "174575859864400",
        //         "updateTime": "1747823275000",
        //         "toAddress": "0x432960397....b0e4beb62769d7a",     // only in deposits
        //         "depositFee": "",                                  // only in deposits
        //         "depositId": "1925117560689778690",                // only in deposits
        //         "fromAddress": "0xe76e0b21...796a4d20fa989",       // only in deposits
        //         "hash": "0x5641347d3......974d5c14e370316e1c8c",   // only in deposits
        //         "address": "0xC7EBBBdc93....ED6B29F9247b9686c",    // only in withdrawals
        //         "txId": "0x35c******b360a174d",                    // only in withdrawals
        //         "withdrawFee": "6.888323303707866",                // only in withdrawals
        //         "withdrawalId": "1957691534177910786"              // only in withdrawals
        //      }
        //   ],
        //   "msg":"success",
        //   "ts": 1747824336306
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //      {
        //         "accountName": "hl04",
        //         "amount": "24381.9837",
        //         "chainType": "eth",
        //         "cid": "174575859872200",
        //         "createTime": "1747818768080",
        //         "currency": "USDT",
        //         "memo": "",
        //         "pid": "1916476600090570754",
        //         "status": "success",
        //         "uid": "174575859864400",
        //         "updateTime": "1747823275000",
        //         "toAddress": "0x432960397....b0e4beb62769d7a",     // only in deposits
        //         "depositFee": "",                                  // only in deposits
        //         "depositId": "1925117560689778690",                // only in deposits
        //         "fromAddress": "0xe76e0b21...796a4d20fa989",       // only in deposits
        //         "hash": "0x5641347d3......974d5c14e370316e1c8c",   // only in deposits
        //         "address": "0xC7EBBBdc93....ED6B29F9247b9686c",    // only in withdrawals
        //         "txId": "0x35c******b360a174d",                    // only in withdrawals
        //         "withdrawFee": "6.888323303707866",                // only in withdrawals
        //         "withdrawalId": "1957691534177910786"              // only in withdrawals
        //      }
        //
        let depositOrWithdrawal: Str = undefined;
        if ('depositId' in transaction) {
            depositOrWithdrawal = 'deposit';
        } else if ('withdrawalId' in transaction) {
            depositOrWithdrawal = 'withdrawal';
        }
        const timestamp = this.safeInteger (transaction, 'createTime');
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const transactionFee = this.safeNumber2 (transaction, 'depositFee', 'withdrawFee');
        let fee = undefined;
        if (transactionFee !== undefined) {
            fee = {
                'cost': transactionFee,
                'currency': currency['code'],
            };
        }
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'depositId', 'withdrawalId'),
            'currency': currency['code'],
            'amount': this.safeNumber (transaction, 'amount'),
            'network': this.networkIdToCode (this.safeString (transaction, 'chainType')),
            'address': undefined,
            'addressFrom': this.safeString (transaction, 'fromAddress'),
            'addressTo': this.safeString2 (transaction, 'toAddress', 'address'),
            'tag': this.safeString (transaction, 'memo'),
            'tagFrom': undefined,
            'tagTo': undefined,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'type': depositOrWithdrawal,
            'updated': undefined,
            'txid': this.safeString2 (transaction, 'hash', 'txId'),
            'internal': undefined,
            'comment': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        } as Transaction;
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'success': 'ok',
            'toBeVerified': 'pending',
            'reviewing': 'pending',
            'fail': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name xcoin#withdraw
     * @description make a withdrawal
     * @see https://xcoin.com/docs/coinApi/funding-account/withdrawal/withdrawal-application
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag a memo for the transaction
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (currency['code'], amount),
            'address': address,
            'timestamp': this.milliseconds (),
        };
        if (tag !== undefined) {
            request['memo'] = tag; // memo or tag
        }
        const [ networkCode, query ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            throw new BadRequest (this.id + ' withdraw() requires a network parameter');
        }
        request['blockchain'] = this.networkCodeToId (networkCode);
        const response = await this.privatePostV1AssetWithdrawal (this.extend (request, query));
        //
        // {
        //     "code": "0",
        //     "data": {
        //         "accountName": "1957689788565745664",
        //         "address": "0xC7EBBBdc93293F61eF13053ED6B29F9247b9686c",
        //         "amount": "123.89",
        //         "chainType": "eth",
        //         "cid": "175558458900900",
        //         "currency": "USDT",
        //         "pid": "1957689788565745664",
        //         "timestamp": "1755586041673",
        //         "uid": "175558458892100",
        //         "withdrawFee": "6.888323303707866",
        //         "withdrawalId": "1957695861084831746"
        //     },
        //     "msg": "Success",
        //     "ts": "1755586041673"
        // }
        //
        return this.parseTransaction (response, currency);
    }

    accountTypeValue (accountType: string) {
        const accountsByType = this.safeDict (this.options, 'accountsByType', {});
        if (!(accountType in accountsByType)) {
            const keys = Object.keys (accountsByType);
            throw new ExchangeError (this.id + ' ' + accountType + ' is not a valid, supported values are ' + this.json (keys));
        }
        return this.safeString (accountsByType, accountType, accountType);
    }

    /**
     * @method
     * @name xcoin#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://xcoin.com/docs/coinApi/funding-account/transfer/internal-transfer-application
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount trading, funding
     * @param {string} toAccount trading, funding
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'fromAccountType': this.accountTypeValue (fromAccount),
            'toAccountType': this.accountTypeValue (toAccount),
        };
        const response = await this.privatePostV1AssetTransfer (this.extend (request, params));
        //
        // {
        //     "code": 0,
        //     "data": true,
        //     "msg": "Success",
        //     "ts": "1762532331198",
        //     "traceId":"b3ea441eff61405c64b39ffb54b99245"
        // }
        //
        return this.parseTransfer (response, currency);
    }

    /**
     * @method
     * @name xcoin#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://xcoin.com/docs/coinApi/funding-account/transfer/get-internal-transfer-history
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.fromAccount (mandatory) transfer from (spot, swap (linear or inverse), future, or funding)
     * @param {string} params.toAccount (mandatory) transfer to (spot, swap(linear or inverse), future, or funding)
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {boolean} [params.paginate] whether to paginate the results (default false)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTransfers', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchTransfers', undefined, since, limit, params, 100);
        }
        let currency = undefined;
        let request: Dict = {};
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetV1AssetTransferHistory (this.extend (request, params));
        //
        // {
        //     "code": 0,
        //     "data": [
        //         {
        //             "accountName": "hongliang02",
        //             "amount": "40000.00000000",
        //             "cid": "174575858798300",
        //             "clientTransferId": "1917415666776936448",
        //             "createTime": "1746410559360",
        //             "currency": "USDT",
        //             "fromAccountType": "funding",
        //             "id": "1917415666776936448",
        //             "pid": "1917181674366382082",
        //             "status": "success",
        //             "toAccountType": "trading",
        //             "uid": "174575858790600"
        //         },
        //     ],
        //     "msg": "success",
        //     "ts":"1746410559365"
        // }
        //
        const rows = this.safeList (response, 'data', []);
        return this.parseTransfers (rows, currency, since, limit);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        const timestamp = this.safeInteger (transfer, 'createTime');
        const accountsByType = this.safeDict (this.options, 'accountsByType', {});
        const accountsByTypeInverted = this.invertFlatStringDictionary (accountsByType);
        const fromAccount = this.safeString (transfer, 'fromAccountType');
        const toAccount = this.safeString (transfer, 'toAccountType');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeString (currency, 'code'),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': this.safeString (accountsByTypeInverted, fromAccount, fromAccount),
            'toAccount': this.safeString (accountsByTypeInverted, toAccount, toAccount),
            'status': this.parseTransferStatus (this.safeString (transfer, 'status')),
        };
    }

    parseTransferStatus (status: Str): Str {
        const statuses: Dict = {
            'success': 'ok',
        };
        return this.safeString (statuses, status, 'failed');
    }

    /**
     * @method
     * @name xcoin#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://xcoin.com/docs/coinApi/trading-account-information/asset-information/get-borrowing-interest-history
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest (code: Str = undefined, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<BorrowInterest[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV1AccountInterestHistory (this.extend (request, params));
        //
        // {
        //     {
        //         "code": "0",
        //         "msg":"success",
        //         "data": [
        //             {
        //                 "id": 1232343213,
        //                 "currency": "BTC",
        //                 "interestTime": "1747206121000",
        //                 "interest": "-0.00000129972997738",
        //                 "interestRate": "0.01138529",
        //                 "interestBearingBorrowSize": "0",
        //                 "borrowAmount": "1.000030267288672843",
        //                 "freeBorrowedAmount": "0",
        //                 "accountName": "hongliang01",
        //                 "pid": "1917239173600325633",
        //                 "cid": "174594041187401",
        //                 "uid": "174594041178400"
        //             },
        //     ],
        //         "ts": "1747207316831"
        // }
        //
        const data = this.safeList (response, 'data', []);
        const interest = this.parseBorrowInterests (data, undefined);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info: Dict, market: Market = undefined): BorrowInterest {
        const timestamp = this.safeInteger (info, 'interestTime');
        return {
            'info': info,
            'symbol': undefined,
            'currency': this.safeCurrencyCode (this.safeString (info, 'data')),
            'interest': this.safeNumber (info, 'interest'),
            'interestRate': this.safeNumber (info, 'interestRate'),
            'amountBorrowed': this.safeNumber (info, 'borrowAmount'),
            'marginMode': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        } as BorrowInterest;
    }

    /**
     * @method
     * @name xcoin#fetchPositions
     * @description fetch all open positions
     * @see https://xcoin.com/docs/coinApi/trading-account-information/position-information/get-trading-account-positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.privateGetV2TradePositions (params);
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //         {
        //             "accountName": "hongliang02",
        //             "positionId": "15762598695810131",
        //             "businessType": "linear_perpetual",
        //             "symbol": "BTC-USDT-PERP",
        //             "positionQty": "-2",
        //             "avgPrice": "93921.6",
        //             "takeProfit": "96000",
        //             "stopLoss": "85000",
        //             "upl": "0.662",
        //             "lever": 1,
        //             "liquidationPrice": "1400633.1709273944765165",
        //             "markPrice": "93888.5",
        //             "im": "1877.77",
        //             "indexPrice": "93877.2",
        //             "createTime": 1746532093181,
        //             "updateTime": 1746532093181,
        //             "pid": "1917181674366382082",
        //             "cid": "174575858798300",
        //             "uid": "174575858790600"
        //         }
        //     ],
        //     "ts": "1746533365670"
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // REST position:
        //
        //         {
        //             "positionId": "15762598695810131",
        //             "businessType": "linear_perpetual",
        //             "symbol": "BTC-USDT-PERP",
        //             "positionQty": "-2",
        //             "avgPrice": "93921.6",
        //             "upl": "0.662",
        //             "lever": 1,
        //             "liquidationPrice": "1400633.1709273944765165",
        //             "markPrice": "93888.5",
        //             "im": "1877.77",
        //             "indexPrice": "93877.2",
        //             "createTime": 1746532093181,
        //             "updateTime": 1746532093181,
        //             "pid": "1917181674366382082",
        //             "accountName": "hongliang02",    // only in REST
        //             "takeProfit": "96000",           // only in REST
        //             "stopLoss": "85000",             // only in REST
        //             "cid": "174575858798300",        // only in REST
        //             "uid": "174575858790600",        // only in REST
        //             "pnl": "-0.00466576",            // only in WS
        //             "fee": "-0.00166576",            // only in WS
        //             "fundingFee": "0",               // only in WS
        //             "tradedType": "OPEN",            // only in WS
        //         }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (position, 'createTime');
        const quantity = this.safeString (position, 'positionQty');
        let side: Str = undefined;
        if (quantity !== undefined) {
            side = Precise.stringGe (quantity, '0') ? 'long' : 'short';
        }
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': symbol,
            'entryPrice': this.safeString (position, 'avgPrice'),
            'markPrice': this.safeString (position, 'markPrice'),
            'indexPrice': this.safeString (position, 'indexPrice'),
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': this.safeString (position, 'upl'),
            'realizedPnl': this.safeString (position, 'pnl'),
            'side': side,
            'contracts': Precise.stringAbs (quantity),
            'contractSize': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeString (position, 'im'),
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber (position, 'lever'),
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }

    /**
     * @method
     * @name xcoin#setLeverage
     * @description set the level of leverage for a market
     * @see https://xcoin.com/docs/coinApi/trading-account-information/position-information/set-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'lever': leverage,
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privatePostV1TradeLever (this.extend (request, params));
        //
        // {
        //     "accountName": "hongliang01",
        //     "currency": "BTC",
        //     "lever": 3
        // }
        //
        return response;
    }

    /**
     * @method
     * @name xcoin#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://xcoin.com/docs/coinApi/trading-account-information/position-information/get-current-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetV1TradeLever (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": {
        //         "accountName": "hongliang01",
        //         "symbol": "",
        //         "currency": "BTC",
        //         "lever": 10,
        //         "pid": "1916476472910884866",
        //         "cid": "174575857047300",
        //         "uid": "174575857039400"
        //     },
        //     "ts": "1745927621737"
        // }
        //
        return this.parseLeverage (response, market);
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': undefined,
            'longLeverage': this.safeInteger (leverage, 'lever'),
            'shortLeverage': this.safeInteger (leverage, 'lever'),
        } as Leverage;
    }

    /**
     * @method
     * @name xcoin#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://xcoin.com/docs/coinApi/trading-account-information/position-information/set-margin-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const modes = {
            'cross': 'multi_currency',
        };
        const request = {
            'marginMode': this.safeString (modes, marginMode, marginMode),
            'accountMode': this.safeString (modes, marginMode, marginMode),
        };
        const response = await this.privatePostV1AccountMarginModeSet (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "success",
        //     "data": {
        //         "accountName": "1915650018593001474",
        //         "accountMode": "multi_currency"
        //     },
        //     "ts": "1760422532889"
        // }
        //
        return this.parseMarginMode (response, undefined) as any;
    }

    parseMarginMode (marginMode: Dict, market = undefined): MarginMode {
        const marketId = this.safeString (marginMode, 'symbol');
        const marginType = this.safeString (marginMode, 'accountMode');
        const margin = (marginType === 'multi_currency') ? 'cross' : marginType;
        return {
            'info': marginMode,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': margin,
        } as MarginMode;
    }

    /**
     * @method
     * @name xcoin#createOrder
     * @description create a trade order
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/place-order
     * @see https://xcoin.com/docs/coinApi/trading/complex-order-trading/place-complex-orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
     * @param {bool} [params.reduceOnly] a mark to reduce the position size for margin, swap and future orders
     * @param {bool} [params.postOnly] true to place a post only order
     * @param {float} [params.triggerPrice] triggerPrice at which the attached take profit / stop loss order will be triggered
     * @param {string} [params.triggerDirection] (if triggerPrice used) the direction whenever the trigger happens with relation to price - 'ascending' or 'descending'
     * @param {float} [params.stopLossPrice] stop loss trigger price
     * @param {float} [params.takeProfitPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] used for stop loss limit orders, not used for stop loss market price orders
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] used for take profit limit orders, not used for take profit market price orders
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isTrigger = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice' ]) !== undefined;
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (isTrigger) {
            response = await this.privatePostV2TradeOrderComplex (request);
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": {
            //         "accountName": "hongliang01",
            //         "complexOId": "1369970333708804096",
            //         "complexClOrdId": "66"
            //     },
            //     "ts": "1746667980576"
            // }
            //
        } else {
            response = await this.privatePostV2TradeOrder (request);
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": {
            //         "orderId": "1322590062927904769",
            //         "clientOrderId": "1236510635820617728"
            //     },
            //     "ts": "1732158178000"
            // }
            //
        }
        const order = this.safeDict (response, 'data', {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name xcoin#createOrders
     * @description create a list of trade orders
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/place-batch-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        for (let i = 0; i < orders.length; i++) {
            const safeParams = this.safeDict (orders[i], 'params', {});
            if (this.safeNumber2 (safeParams, 'triggerPrice', 'stopPrice') !== undefined) {
                throw new NotSupported (this.id + ' createOrders() does not support conditional orders');
            }
        }
        const ordersRequests = this.createOrdersRequest (orders);
        const request = {
            'orderReqList': ordersRequests,
        };
        const response = await this.privatePostV2TradeBatchOrder (this.extend (request, params));
        //
        // [{orderId: '1440030276164120576', clientOrderId: '1440030276164120576', code: '0', msg: null, ts: '1763371572399'}]
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data);
    }

    createOrdersRequest (orders: OrderRequest[], params = {}) {
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString (rawOrder, 'symbol');
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'amount');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        return ordersRequests;
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toLowerCase (),
            'qty': this.amountToPrecision (symbol, amount),
            // 'marketUnit': todo
        };
        const triggerPriceTypes = {
            'last': 'last_price',
            'index': 'index_price',
            'mark': 'mark_price',
        };
        // trigger
        const triggerPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice' ]);
        const takeProfitPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLossPrice = this.safeNumber (params, 'stopLossPrice');
        const isConditional = (triggerPrice !== undefined) || (takeProfitPrice !== undefined) || (stopLossPrice !== undefined);
        const conditionalPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'takeProfitPrice', 'stopLossPrice' ]);
        const stopLoss = this.safeDict (params, 'stopLoss');
        const stopLossDefined = (stopLoss !== undefined);
        const takeProfit = this.safeDict (params, 'takeProfit');
        const takeProfitDefined = (takeProfit !== undefined);
        // regular order
        if (!isConditional) {
            const cost = this.safeNumber (params, 'cost');
            if (cost !== undefined) {
                request['marketUnit'] = 'quote_currency';
            }
            const isMarketOrder = type === 'market';
            let postOnly = false;
            [ postOnly, params ] = this.handlePostOnly (isMarketOrder, type === 'post_only', params);
            if (postOnly) {
                request['orderType'] = 'post_only';
            } else {
                request['orderType'] = type;
            }
            const timeInForce = this.safeString (params, 'timeInForce', 'GTC');
            if (timeInForce !== 'GTC' && !postOnly) {
                request['timeInForce'] = timeInForce.toLowerCase ();
            }
            const isReduceOnly = this.safeBool (params, 'reduceOnly');
            if (!market['spot'] && isReduceOnly) {
                request['reduceOnly'] = true;
            }
            if (type === 'limit') {
                request['price'] = this.priceToPrecision (symbol, price);
            }
        } else {
            request['complexType'] = 'trigger';
            const directionMap = {
                'ascending': 'rising',
                'descending': 'falling',
            };
            const triggerOrder = {};
            const triggerPriceType = this.safeString (params, 'triggerPriceType', 'last'); // default to last
            triggerOrder['triggerPriceType'] = this.safeString (triggerPriceTypes, triggerPriceType);
            const triggerDirection = this.safeString (params, 'triggerDirection');
            if (triggerPrice !== undefined) {
                if (triggerDirection === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a "triggerDirection" parameter for trigger orders');
                }
                triggerOrder['triggerDirection'] = this.safeString (directionMap, triggerDirection);
            } else {
                if (stopLossPrice !== undefined) {
                    triggerOrder['triggerDirection'] = (side === 'buy') ? 'falling' : 'rising';
                } else if (takeProfitPrice !== undefined) {
                    triggerOrder['triggerDirection'] = (side === 'buy') ? 'rising' : 'falling';
                }
            }
            triggerOrder['triggerPrice'] = this.priceToPrecision (symbol, conditionalPrice);
            triggerOrder['triggerOrderType'] = 'market';
            if (type === 'limit') {
                triggerOrder['triggerOrderPrice'] = this.priceToPrecision (symbol, price);
                triggerOrder['triggerOrderType'] = 'limit';
            }
            request['triggerOrder'] = triggerOrder;
        }
        // if attached SL/TP
        if (stopLossDefined || takeProfitDefined) {
            const tpslOrder: Dict = {};
            // stop-loss
            if (stopLossDefined) {
                tpslOrder['stopLoss'] = this.safeNumber (stopLoss, 'triggerPrice');
                const triggerPriceTypeSl = this.safeString (stopLoss, 'triggerPriceType');
                if (triggerPriceTypeSl !== undefined) {
                    tpslOrder['stopLossType'] = this.safeString (triggerPriceTypes, triggerPriceTypeSl);
                }
                const limitPriceSl = this.safeNumber (stopLoss, 'price');
                if (limitPriceSl !== undefined) {
                    tpslOrder['slOrderType'] = 'limit';
                    tpslOrder['slLimitPrice'] = this.priceToPrecision (symbol, limitPriceSl);
                }
            }
            // take-profit
            if (takeProfitDefined) {
                tpslOrder['takeProfit'] = this.safeNumber (takeProfit, 'triggerPrice');
                const triggerPriceTypeTp = this.safeString (takeProfit, 'triggerPriceType');
                if (triggerPriceTypeTp !== undefined) {
                    tpslOrder['takeProfitType'] = this.safeString (triggerPriceTypes, triggerPriceTypeTp);
                }
                const limitPriceTp = this.safeNumber (takeProfit, 'price');
                if (limitPriceTp !== undefined) {
                    tpslOrder['tpOrderType'] = 'limit';
                    tpslOrder['tpLimitPrice'] = this.priceToPrecision (symbol, limitPriceTp);
                }
            }
            request['tpslOrder'] = tpslOrder;
        }
        params = this.omit (params, [ 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'triggerDirection', 'triggerPriceType', 'stopLoss', 'takeProfit' ]);
        return this.extend (request, params);
    }

    /**
     * @method
     * @name xcoin#cancelOrder
     * @description cancels an open order
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/cancel-order
     * @see https://xcoin.com/docs/coinApi/trading/complex-order-trading/cancel-complex-orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {};
        const isTrigger = this.safeBool (params, 'isTrigger', false);
        let response = undefined;
        if (isTrigger) {
            request['complexOId'] = id;
            response = await this.privatePostV1TradeCancelComplex (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": {
            //         "accountName": "hongliang01",
            //         "complexOId": "1370410319314329600"
            //     },
            //     "ts": "1746774086526"
            // }
            //
        } else {
            request = {
                'orderId': id,
                'symbol': market['id'],
            };
            response = await this.privatePostV1TradeCancelOrder (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": {
            //         "orderId": "1322590062927904769"
            //     },
            //     "ts": "1732158178000"
            // }
            //
        }
        const data = this.safeDict (response, 'data');
        return this.parseOrder (data, this.marketOrNull (symbol));
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // cancelOrder
        //
        //     regular
        //
        //     {
        //         "orderId": "1322590062927904769"
        //     }
        //
        //     trigger
        //
        //     {
        //         "accountName": "hongliang01",
        //         "complexOId": "1369970333708804096",
        //         "complexClOrdId": "66"
        //     }
        //
        // fetchOpenOrders / fetchClosedOrders
        //
        //      regular
        //
        //         {
        //             "businessType": "linear_perpetual",
        //             "symbol": "ETH-USDT-PERP",
        //             "orderId": "1369615474164670464",
        //             "clientOrderId": "1369615474164670464",
        //             "price": "1800",
        //             "qty": "100",
        //             "orderType": "limit",
        //             "side": "buy",
        //             "totalFillQty": "50",
        //             "avgPrice": "1800",
        //             "status": "partially_filled",
        //             "lever": 1,
        //             "baseFee": "",
        //             "uid": "174594041178400",
        //             "source": "web",
        //             "reduceOnly": false,
        //             "timeInForce": "gtc",
        //             "createTime": 1746583375274,
        //             "updateTime": 1746584491397,
        //             "eventId": "1",
        //             "parentOrderId": "",
        //             "tpslOrder": {                          // not in WS
        //                 // "quoteId": "",
        //                 // "quote": false,
        //                 // "mmpGroup": "",
        //                 // "quoteSetId": ""
        //                 "tpslClOrdId": null,
        //                 "tpslMode": null,
        //                 "takeProfitType": "last_price",
        //                 "stopLossType": "last_price",
        //                 "takeProfit": "1900",
        //                 "stopLoss": "1600",
        //                 "tpOrderType": "market",
        //                 "slOrderType": "market",
        //                 "tpLimitPrice": null,
        //                 "slLimitPrice": null
        //             },
        //             "pid": "1919735713887760385",
        //             "accountName": "hongliang02",           // not in WS
        //             "pnl": "",                              // not in WS
        //             "quoteFee": "-0.45",                    // not in WS
        //             "category": "normal",                   // not in WS
        //             "cid": "174594041187401"                // not in WS
        //             "cancelUid": "0",                       // only in WS
        //             "createType": "order",                  // only in WS
        //             "riskReducing": false,                  // only in WS
        //             "massQuoteOrder": { "quote": false, "priceAdjustment": false } // only in WS
        //         }
        //
        //     trigger
        //
        //         {
        //             "businessType": "linear_perpetual",
        //             "symbol": "BTC-USDT-PERP",
        //             "complexOId": "1369970333708804096",
        //             "complexClOrdId": "66",
        //             "side": "buy",
        //             "complexType": "trigger",
        //             "qty": "1.000000000000000000",
        //             "triggerOrder": {
        //                 "triggerClOrdId": "66",
        //                 "triggerDirection": "rising",
        //                 "triggerPriceType": "last_price",
        //                 "triggerPrice": "100000.00",
        //                 "triggerOrderType": "limit",
        //                 "triggerOrderPrice": "110000.00"
        //             },
        //             "tpslOrder": {
        //                 "tpslClOrdId": "88",
        //                 "tpslMode": "partially_position",
        //                 "takeProfitType": "last_price",
        //                 "stopLossType": "last_price",
        //                 "takeProfit": "120000",
        //                 "stopLoss": "80000",
        //                 "tpOrderType": "limit",
        //                 "slOrderType": "limit",
        //                 "tpLimitPrice": "110000",
        //                 "slLimitPrice": "90000"
        //             },
        //             "status": "live",
        //             "accountName": "hongliang01",
        //             "createTime": "1746667980481",
        //             "updateTime": "1746667980000",
        //             "pid": "1917239173600325633",
        //             "cid": "174594041187401",
        //             "uid": "174594041178400"
        //         }
        //
        // WS order has additionally this fields in watchOrders:
        //
        //        "tradeList": [
        //           {
        //             "fillPrice": "0.589",
        //             "tradeId": "4503599627840140",
        //             "role": "taker",
        //             "fillQty": "10",
        //             "fillTime": "1762788970362",
        //             "feeCurrency": "ADA",
        //             "fee": "-0.0016",
        //             "eventId": "1",
        //             "clientOrderId": "1437586666466402304",
        //             "orderId": "1437586666466402304",
        //             "businessType": "spot",
        //             "symbol": "ADA-USDT",
        //             "orderType": "market",
        //             "side": "buy",
        //             "lever": "0"
        //           }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2 (order, 'ts', 'createTime');
        let orderType: Str = undefined;
        const orderTypeRaw = this.safeString (order, 'orderType');
        if (orderTypeRaw === 'post_only') {
            orderType = 'limit';
        } else {
            orderType = orderTypeRaw;
        }
        let fee = undefined;
        const feeRaw = this.safeString (order, 'quoteFee');
        if (feeRaw !== undefined) {
            fee = {
                'cost': Precise.stringAbs (feeRaw),
                'currency': market['quote'],
            };
        }
        let price = this.safeString (order, 'price');
        const triggerOrder = this.safeDict (order, 'triggerOrder');
        let triggerPrice = undefined;
        if (triggerOrder !== undefined) {
            triggerPrice = this.safeString (triggerOrder, 'triggerPrice');
            price = this.safeString (triggerOrder, 'triggerOrderPrice');
        }
        let trades = undefined;
        const rawTrades = this.safeList (order, 'tradeList');
        if (rawTrades !== undefined) {
            trades = this.parseTrades (rawTrades, market);
        }
        return this.safeOrder ({
            'id': this.safeString2 (order, 'orderId', 'complexOId'),
            'clientOrderId': this.safeString2 (order, 'clientOrderId', 'complexClOrdId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimeStamp': this.safeInteger (order, 'updateTime'),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce (this.safeString (order, 'timeInForce')),
            'postOnly': (orderTypeRaw === 'post_only'),
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': this.safeString (order, 'side'),
            'price': price,
            'triggerPrice': triggerPrice,
            'cost': undefined,
            'average': this.safeString (order, 'avgPrice'),
            'amount': this.safeString (order, 'qty'),
            'filled': this.safeString (order, 'totalFillQty'),
            'remaining': undefined,
            'trades': trades,
            'fee': fee,
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'untriggered': 'open',
            'new': 'open',
            'partially_filled': 'open',
            'partially_canceled': 'canceled',
            'canceled': 'canceled',
            'filled': 'closed',
            'live': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce: Str) {
        const timeInForces: Dict = {
            'gtc': 'GTC',
            'fok': 'FOK',
            'ioc': 'IOC',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    /**
     * @method
     * @name xcoin#cancelOrders
     * @description cancel multiple orders
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/batch-cancel
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        const orders = [];
        for (let i = 0; i < ids.length; i++) {
            const cancelReq = {
                'orderId': ids[i],
                'symbol': market['id'],
            };
            orders.push (cancelReq);
        }
        const request = {
            'orderCreateReq': orders,
        };
        const response = await this.privatePostV1TradeBatchCancelOrder (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //       {
        //         "orderId": "1322577577491374080",
        //         "code": "0",
        //         "msg":"success",
        //         "ts": "1732158287000"
        //       },
        //       {
        //         "orderId": "1328425322454036480",
        //         "code": "0",
        //         "msg":"success",
        //         "ts": "1732158287000"
        //       }
        //     ],
        //     "ts": "1732158287000"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market);
    }

    /**
     * @method
     * @name xcoin#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/cancel-all-orders
     * @see https://xcoin.com/docs/coinApi/trading/complex-order-trading/cancel-all-strategy-orders
     * @param {string} symbol alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        const market = this.marketOrNull (symbol);
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        let response = undefined;
        const isTrigger = this.safeBool (params, 'isTrigger', false);
        if (isTrigger) {
            request['complexType'] = 'trigger';
            response = await this.privatePostV1TradeCancelAllOrderComplexs (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": "",
            //     "ts": "1746776571972"
            // }
            //
        } else {
            response = await this.privatePostV1TradeCancelAllOrder (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": null,
            //     "ts": "1732158178000"
            // }
            //
        }
        return this.parseOrders ([ response ], market);
    }

    /**
     * @method
     * @name xcoin#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-current-open-orders
     * @see https://xcoin.com/docs/coinApi/trading/complex-order-trading/get-current-complex-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = this.marketOrNull (symbol);
        const request: Dict = {};
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        let response = undefined;
        const isTrigger = this.safeBool (params, 'isTrigger', false);
        if (isTrigger) {
            response = await this.privateGetV2TradeOpenOrderComplex (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": [
            //         {
            //             "businessType": "linear_perpetual",
            //             "symbol": "BTC-USDT-PERP",
            //             "complexOId": "1369970333708804096",
            //             "complexClOrdId": "66",
            //             "side": "buy",
            //             "complexType": "trigger",
            //             "qty": "1.000000000000000000",
            //             "triggerOrder": {
            //                 "triggerClOrdId": "66",
            //                 "triggerDirection": "rising",
            //                 "triggerPriceType": "last_price",
            //                 "triggerPrice": "100000.00",
            //                 "triggerOrderType": "limit",
            //                 "triggerOrderPrice": "110000.00"
            //             },
            //             "tpslOrder": {
            //                 "tpslClOrdId": "88",
            //                 "tpslMode": "partially_position",
            //                 "takeProfitType": "last_price",
            //                 "stopLossType": "last_price",
            //                 "takeProfit": "120000",
            //                 "stopLoss": "80000",
            //                 "tpOrderType": "limit",
            //                 "slOrderType": "limit",
            //                 "tpLimitPrice": "110000",
            //                 "slLimitPrice": "90000"
            //             },
            //             "status": "live",
            //             "accountName": "hongliang01",
            //             "createTime": "1746667980481",
            //             "updateTime": "1746667980000",
            //             "pid": "1917239173600325633",
            //             "cid": "174594041187401",
            //             "uid": "174594041178400"
            //         }
            //     ],
            //     "ts": "1746668693663"
            // }
            //
        } else {
            response = await this.privateGetV2TradeOpenOrders (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": [
            //         {
            //             "accountName": "hongliang02",
            //             "businessType": "linear_perpetual",
            //             "symbol": "ETH-USDT-PERP",
            //             "orderId": "1369615474164670464",
            //             "clientOrderId": "1369615474164670464",
            //             "price": "1800",
            //             "qty": "100",
            //             "pnl": "",
            //             "orderType": "limit",
            //             "side": "buy",
            //             "totalFillQty": "50",
            //             "avgPrice": "1800",
            //             "status": "partially_filled",
            //             "lever": 1,
            //             "baseFee": "",
            //             "quoteFee": "-0.45",
            //             "uid": "174594041178400",
            //             "source": "web",
            //             "category": "normal",
            //             "reduceOnly": false,
            //             "timeInForce": "gtc",
            //             "createTime": 1746583375274,
            //             "updateTime": 1746584491397,
            //             "tpslOrder": {
            //                 "quoteId": "",
            //                 "quote": false,
            //                 "mmpGroup": "",
            //                 "quoteSetId": ""
            //             },
            //             "eventId": "1",
            //             "parentOrderId": "",
            //             "tpslOrder": {
            //                 "tpslClOrdId": null,
            //                 "tpslMode": null,
            //                 "takeProfitType": "last_price",
            //                 "stopLossType": "last_price",
            //                 "takeProfit": "1900",
            //                 "stopLoss": "1600",
            //                 "tpOrderType": "market",
            //                 "slOrderType": "market",
            //                 "tpLimitPrice": null,
            //                 "slLimitPrice": null
            //             },
            //             "pid": "1919735713887760385",
            //             "cid": "174594041187401"
            //         }
            //     ],
            //     "ts": "1746586573969"
            // }
            //
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name xcoin#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-historical-orders
     * @see https://xcoin.com/docs/coinApi/trading/complex-order-trading/get-historical-complex-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = this.marketOrNull (symbol);
        let request: Dict = {};
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const isTrigger = this.safeBool (params, 'isTrigger', false);
        let response = undefined;
        if (isTrigger) {
            request['complexType'] = 'trigger';
            response = await this.privateGetV2HistoryOrderComplexs (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": [
            //         {
            //             "businessType": "linear_perpetual",
            //             "symbol": "BTC-USDT-PERP",
            //             "complexOId": "1369970333708804096",
            //             "complexClOrdId": "66",
            //             "side": "buy",
            //             "complexType": "trigger",
            //             "qty": "1.000000000000000000",
            //             "triggerOrder": {
            //                 "triggerClOrdId": "66",
            //                 "triggerDirection": "rising",
            //                 "triggerPriceType": "last_price",
            //                 "triggerPrice": "100000.00",
            //                 "triggerOrderType": "limit",
            //                 "triggerOrderPrice": "110000.00"
            //             },
            //             "tpslOrder": {
            //                 "tpslClOrdId": "88",
            //                 "tpslMode": "partially_position",
            //                 "takeProfitType": "last_price",
            //                 "stopLossType": "last_price",
            //                 "takeProfit": "120000",
            //                 "stopLoss": "80000",
            //                 "tpOrderType": "limit",
            //                 "slOrderType": "limit",
            //                 "tpLimitPrice": "110000",
            //                 "slLimitPrice": "90000"
            //             },
            //             "status": "canceled",
            //             "accountName": "hongliang01",
            //             "createTime": "1746667980481",
            //             "updateTime": "1746695701000",
            //             "pid": "1917239173600325633",
            //             "cid": "174594041187401",
            //             "uid": "174594041178400"
            //         }
            //     ],
            //     "ts": "1746765115317"
            // }
            //
        } else {
            response = await this.privateGetV2HistoryOrders (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": [
            //       {
            //         "id": "1328700748417994752",
            //         "businessType": "spot",
            //         "symbol": "BTC-USDT",
            //         "orderId": "1328700748417994752",
            //         "clientOrderId": "1328700748417994752",
            //         "price": "95836.07",
            //         "qty": "0.02",
            //         "quoteQty": "0.02",
            //         "pnl": "0",
            //         "orderType": "market",
            //         "side": "sell",
            //         "totalFillQty": "0.02",
            //         "avgPrice": "95836.07",
            //         "status": "filled",
            //         "lever": "0",
            //         "baseFee": "0",
            //         "quoteFee": "-0.19167214",
            //         "uid": "173578258816600000",
            //         "source": "api",
            //         "cancelSource": "0",
            //         "cancel uid": "0",
            //         "reduceOnly": false,
            //         "timeInForce": "ioc",
            //         "createTime": "1736828544489",
            //         "updateTime": "1736828544494"
            //       }
            //     ],
            //     "ts": "1732158443301"
            // }
            //
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name xcoin#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-order-information
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        if (this.safeString (params, 'clientOrderId') === undefined) {
            request['orderId'] = id;
        }
        const order = await this.privateGetV2TradeOrderInfo (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //       {
        //         "id": "1328700748417994752",
        //         "businessType": "spot",
        //         "symbol": "BTC-USDT",
        //         "orderId": "1328700748417994752",
        //         "clientOrderId": "1328700748417994752",
        //         "price": "95836.07",
        //         "qty": "0.02",
        //         "quoteQty": "0.02",
        //         "pnl": "0",
        //         "orderType": "market",
        //         "side": "sell",
        //         "totalFillQty": "0.02",
        //         "avgPrice": "95836.07",
        //         "status": "filled",
        //         "lever": "0",
        //         "baseFee": "0",
        //         "quoteFee": "-0.19167214",
        //         "uid": "173578258816600000",
        //         "source": "api",
        //         "cancelSource": "0",
        //         "cancel uid": "0",
        //         "reduceOnly": false,
        //         "timeInForce": "ioc",
        //         "createTime": "1736828544489",
        //         "updateTime": "1736828544494"
        //       }
        //     ],
        //     "ts": "1732158443301"
        // }
        //
        const data = this.safeList (order, 'data', []);
        const firstOrder = this.safeDict (data, 0, {});
        return this.parseOrder (firstOrder);
    }

    /**
     * @method
     * @name xcoin#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-order-operation-history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateGetV2HistoryOrderOperations (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //       {
        //         "orderId": "1308916158820376576",
        //         "operationType": "create_order",
        //         "price": "93000",
        //         "qty": "0.1",
        //         "createTime": "1732158178000",
        //         "accountName": "hongliang01",
        //         "pid": "1917239173600325633",
        //         "cid": "174594041187401",
        //         "uid": "174594041178400"
        //       }
        //     ],
        //     "ts": "1732158443301"
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, undefined, since, limit);
    }

    /**
     * @method
     * @name xcoin#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-account-trade-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params) as Trade[];
        }
        const market = this.marketOrNull (symbol);
        let request: Dict = {};
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV2HistoryTrades (this.extend (request, params));
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "accountName": "CCXT_testing",
        //                "id": "4503599628065617",
        //                "orderId": "1445105348162420736",
        //                "clientOrderId": "1445105348162420736",
        //                "businessType": "spot",
        //                "symbol": "ADA-USDT",
        //                "pnl": "0",
        //                "orderType": "limit",
        //                "side": "sell",
        //                "fillPrice": "0.45",
        //                "tradeId": "4503599628065617",
        //                "role": "maker",
        //                "fillQty": "1",
        //                "fillTime": "1764798660738",
        //                "lever": "0",
        //                "feeCurrency": "ADA",
        //                "fee": "0.00005",
        //                "eventId": "2",
        //                "quoteId": "",
        //                "quoteSetId": "",
        //                "indexPrice": "0",
        //                "markPrice": "0",
        //                "forwardPrice": "0",
        //                "markIv": "0",
        //                "riskReducing": false,
        //                "iv": "0",
        //                "pid": "1981204053820035072",
        //                "cid": "176118985590600",
        //                "uid": "176118985582700"
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
        const query = this.omit (params, this.extractParams (path));
        url += '/' + this.implodeParams (path, params);
        let queryStr = '';
        if (method === 'GET') {
            if (Object.keys (query).length) {
                queryStr = '?' + this.urlencode (query);
                url += queryStr;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let bodyStr = '';
            if (method === 'POST') {
                body = this.json (params);
                bodyStr = body;
            }
            const preHash = timestamp + method.toUpperCase () + '/' + path + queryStr + bodyStr;
            const signature = this.hmac (this.encode (preHash), this.encode (this.secret), sha256, 'hex');
            headers = {
                'Content-Type': 'application/json',
                'X-ACCESS-APIKEY': this.apiKey,
                'X-ACCESS-TIMESTAMP': timestamp,
                'X-ACCESS-SIGN': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        const msg = this.safeStringLower (response, 'msg');
        const code = this.safeString (response, 'code');
        if ((code !== '0') || (msg !== 'success')) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
