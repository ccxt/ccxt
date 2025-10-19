
//  ---------------------------------------------------------------------------

import Exchange from './abstract/uzx.js';
import { ArgumentsRequired, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, MarketClosed, NotSupported, OperationFailed, OperationRejected, OrderNotFound, RateLimitExceeded, RequestTimeout } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type { Int, OrderSide, OrderType, OHLCV, Order, Str, Transaction, Ticker, Tickers, Market, Strings, Currency, Num, Currencies, Dict, int, LedgerEntry, MarketType, OrderRequest, MarginModification, MarginMode, Position, TransferEntry } from './base/types.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';

//  ---------------------------------------------------------------------------

/**
 * @class uzx
 * @augments Exchange
 */
export default class uzx extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'uzx',
            'name': 'uzx',
            'countries': [ 'UZ' ],
            'rateLimit': 0, // TODO
            'certified': false,
            'pro': false,
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
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createConvertTrade': undefined,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrder': true,
                'fetchClosedOrders': 'emulated',
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': 'emulated',
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLedgerEntry': 'emulated',
                'fetchLeverage': true,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': true,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransfer': 'emulated',
                'fetchTransfers': true,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': 'emulated',
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
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
                'fetchLongShortRatioHistory': false,
                'fetchOpenInterests': false,
                'fetchLongShortRatio': false,
                'fetchFundingIntervals': false,
                'fetchFundingInterval': false,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '60min',
                '1d': '1day',
                '1w': '1week',
                '1M': '1mon',
            },
            'urls': {
                'logo': 'https://uzx.com/v2/api/docs/en/images/logo-957a5876.png',
                'test': {
                },
                'api': {
                    'public': 'https://api-v2.uzx.com',
                    'private': 'https://api-v2.uzx.com',
                },
                'www': 'https://uzx.com/',
                'referral': {
                    'url': 'https://oauth.uzx.com/register?inviteCode=SAHH7W',
                    'discount': 10.0,
                },
                'doc': [
                    'https://uzx.com/v2/api/docs/en/index.html#0efc2e6bbcl0',
                ],
                'fees': 'https://uzx.com/vip',
            },
            'api': {
                // TODO: weights
                'public': {
                    'get': {
                        '/notification/spot/{symbol}/candles': 1,
                        '/notification/spot/{symbol}/orderbook': 1,
                        '/notification/spot/tickers': 1,
                        '/notification/spot/{symbol}/ticker': 1,
                        '/notification/spot/{symbol}/trade': 1,
                        '/notification/spot/{symbol}/trades': 1,
                        '/notification/spot/{symbol}/history-trades': 1,
                        '/notification/swap/{symbol}/candles': 1,
                        '/notification/swap/{symbol}/orderbook': 1,
                        '/notification/swap/{symbol}/ticker': 1,
                        '/notification/swap/tickers': 1,
                        '/notification/swap/{symbol}/trade': 1,
                        '/notification/swap/{symbol}/trades': 1,
                        '/notification/swap/{symbol}/history-trades': 1,
                        '/notification/swap/{symbol}/index': 1,
                        '/notification/swap/{symbol}/tag': 1,
                        '/v2/time': 1,
                        '/v2/coins': 1,
                        '/v2/products': 1,
                    },
                },
                'private': {
                    'get': {
                        '/v2/trade/orders': 1,
                        '/v2/trade/history/orders': 1,
                        '/v2/trade/positions': 1,
                        '/v2/trade/history/positions': 1,
                        '/v2/trade/order/details': 1,
                        '/v2/trade/history/order/details': 1,
                        '/v2/asset/balances': 1,
                        '/v2/asset/bills': 1,
                        '/v2/account/balances': 1,
                        '/v2/account/bills': 1,
                    },
                    'post': {
                        '/v2/trade/spot/order': 1,
                        '/v2/trade/spot/batch-orders': 1,
                        '/v2/trade/swap/order': 1,
                        '/v2/trade/swap/batch-orders': 1,
                    },
                    'put': {
                        '/v2/trade/swap/close-position': 1,
                        '/v2/trade/swap/position/set-leverage': 1,
                        '/v2/trade/swap/position/margin-balance': 1,
                        '/v2/trade/swap/config/set-leverage': 1,
                        '/v2/trade/swap/config/set-mgn': 1,
                        '/v2/trade/swap/config/set-pos-mod': 1,
                        '/v2/trade/cancel-order': 1,
                        '/v2/trade/cancel-batch-order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    // TODO: https://uzx.com/vip
                    'taker': [
                        [],
                    ],
                    'maker': [
                        [],
                    ],
                },
            },
            'commonCurrencies': {
                // TODO
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'sandboxMode': false,
                'defaultTimeInForce': 'GTC',
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'quoteOrderQty': true,
                'networks': {
                    // TODO
                    'ERC20': 'ETH',
                    'TRC20': 'TRX',
                },
                'networksById': {
                    // TODO
                },
                'impliedNetworks': {
                    // TODO: default networks
                },
                'legalMoney': {
                    // TODO
                },
            },
            'exceptions': {
                'exact': {
                    // Order related
                    '1080001': InvalidOrder,            // Invalid parameter
                    '1080002': InvalidOrder,            // Trading pair cannot be empty
                    '1080003': InvalidOrder,            // Invalid cancel order type
                    '1080004': InvalidOrder,            // Invalid order type
                    '1080005': InvalidOrder,            // Invalid quantity
                    '1080006': InvalidOrder,            // Invalid take-profit or stop-loss quantity
                    '1080007': InvalidOrder,            // Invalid position direction
                    '1080008': InvalidOrder,            // Trade direction does not match position direction
                    '1080009': InvalidOrder,            // Invalid position mode
                    '1080010': InvalidOrder,            // Invalid leverage
                    '1080011': InvalidOrder,            // Invalid take-profit or stop-loss parameters
                    '1080012': InvalidOrder,            // Invalid margin quantity
                    '1080013': InvalidOrder,            // Invalid price
                    '1080014': InvalidOrder,            // Invalid take-profit or stop-loss type
                    '1080017': InvalidOrder,            // Invalid order ID
                    '1080020': InvalidOrder,            // Exceeded maximum bulk order quantity
                    '1080021': InvalidOrder,            // Inconsistent products in bulk orders
                    '1080023': InvalidOrder,            // Cannot modify margin mode while holding positions
                    '1080024': InvalidOrder,            // Cannot modify margin mode while orders exist
                    '2080001': BadSymbol,              // Trading pair not found
                    '2080003': MarketClosed,            // Trading pair not enabled
                    '2080004': ExchangeError,            // Internal server error
                    '2080005': ExchangeError,            // Internal server error
                    '2080006': ExchangeError,            // Internal server error
                    '2080007': ExchangeError,            // Internal server error
                    '3080001': ExchangeError,            // Internal server error
                    '3080002': ExchangeError,            // Internal server error
                    // Asset related
                    // TODO: double check the error codes
                    '1010002': ArgumentsRequired,        // Parameter validation failed
                    '1010003': ArgumentsRequired,        // Parameter validation failed
                    '1010004': InsufficientFunds,        // Insufficient available assets
                    '1010005': OperationRejected,        // Existing positions or orders with different leverage
                    '1010006': RateLimitExceeded,        // Order frequency too high
                    '1010007': OperationRejected,        // Existing positions or orders with different margin modes
                    '1010008': InsufficientFunds,        // Insufficient margin
                    '1010009': OperationRejected,        // Exceeded maximum order quantity
                    '1010010': BadRequest,                // Exceeded maximum position size
                    '1010011': InsufficientFunds,        // Insufficient position to close
                    '1010012': BadRequest,                // Price validation failed
                    '1010013': OperationRejected,        // Order rejected due to price being worse than liquidation price
                    '1010014': BadRequest,                // Margin freeze failed
                    '1010015': BadRequest,                // Order cancellation not allowed for this type
                    '1010016': OrderNotFound,            // Position not found
                    '1010017': InvalidOrder,            // Take-profit or stop-loss quantity exceeds position size
                    '1010018': RequestTimeout,            // One-click close position timeout
                    '1010019': OperationRejected,        // Only one full-position take-profit or stop-loss allowed per position
                    '1010020': OperationRejected,        // Existing orders or take-profit/stop-loss orders with different leverage
                    '1010021': OperationFailed,            // Take-profit or stop-loss price validation failed
                    '1010022': BadRequest,                // Margin unfreeze failed
                    '1010023': OperationRejected,        // Existing positions or orders with different margin modes
                    '1010024': BadRequest,                // Limit order price cannot be higher than the highest bid
                    '1010025': BadRequest,                // Limit order price cannot be lower than the lowest ask
                    '1010026': OperationFailed,            // Margin mode validation failed
                    '1010027': BadRequest,                // Leverage validation failed
                    '1010028': OperationRejected,        // Order placement failed
                    '1010029': ArgumentsRequired,        // Parameter validation failed
                    '1010030': OperationFailed,            // Order placement failed
                    '1010031': BadRequest,                // Price comparison failed; please set a reasonable take-profit trigger price
                    '1010032': BadRequest,                // Price comparison failed; please set a reasonable stop-loss trigger price
                    '1010033': ArgumentsRequired,        // Parameter validation failed
                    '1010034': BadRequest,                // Limit take-profit order price must be higher than the last traded price
                    '1010035': BadRequest,                // Limit take-profit order price must be lower than the last traded price
                    '1010036': ArgumentsRequired,        // Please set the order price for limit orders
                    '1010037': BadRequest,                // Please set a take-profit or stop-loss trigger
                    '1010038': ArgumentsRequired,        // Parameter validation failed
                    '1010039': ArgumentsRequired,        // Parameter validation failed
                    '1010040': BadRequest,                // Trailing stop-loss/take-profit callback range is 0.1-100
                    '1010041': BadRequest,                // Trailing stop-loss/take-profit price distance must be a positive integer
                    '1010042': BadRequest,                // Trailing stop-loss/take-profit activation price must be a positive number
                    '1010043': ArgumentsRequired,        // Parameter validation failed
                    '1010044': ArgumentsRequired,        // Parameter validation failed
                    '1010045': ExchangeError,            // Internal server error
                    '1010046': ArgumentsRequired,        // Parameter validation failed
                    '1010047': OperationFailed,            // Increase or decrease margin failed
                    '1010048': OrderNotFound,            // Order not found
                    '1010049': ExchangeError,            // Internal server error
                    '1010050': BadRequest,                // Operation on position not allowed in the current state
                    '1010051': OperationRejected,        // Account is in liquidation state and cannot perform operations
                    '1011001': OperationRejected,        // Trading pair is offline
                    '1011002': MarketClosed,            // Trading pair is not open for trading
                    '1011003': BadRequest,                // Failed to take trading pair offline
                    '1011004': BadRequest,                // Successfully took trading pair offline
                    '1011005': MarketClosed,            // Trading pair is suspended from trading
                    '1011006': BadRequest,                // Only limit sell orders are allowed before the market opens
                    '1011007': ArgumentsRequired,        // Parameter validation failed
                    '1011008': BadRequest,                // Minimum trade amount not met
                    '1011009': BadRequest,                // Maximum trade amount exceeded
                    '1011010': BadRequest,                // Minimum trade quantity not met
                    '1011011': BadRequest,                // Maximum trade quantity exceeded
                    '1011200': ExchangeError,            // Internal server error
                    '1011201': ExchangeError,            // Internal server error
                    '3010001': ExchangeError,            // Internal server error
                    '3010005': ExchangeError,            // Internal server error
                },
            },
        });
    }

    /**
     * @method
     * @name uzx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://uzx.com/v2/api/docs/en/index.html#c5272bee5ifa
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}) {
        const response = await this.publicGetV2Time (params);
        //
        //    {
        //        "code": 200,
        //        "msg": "success",
        //        "data": {
        //          "server_time": 1746498430903
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data');
        return this.safeInteger (data, 'server_time');
    }

    /**
     * @method
     * @name uzx#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://uzx.com/v2/api/docs/en/index.html#11817f3fu8l2
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetV2Coins (params);
        //
        //    {
        //        "code": 200,
        //        "msg": "success",
        //        "data": [
        //          {
        //            "coin_name": "BTC",
        //            "icon": "https://uzx-icon.oss-cn-hongkong.aliyuncs.com/coin/BTC.png",
        //            "decimal": 8,
        //            "can_deposit": true,
        //            "can_withdrawal": true
        //          }
        //        ]
        //    }
        //
        const data = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'coin_name');
            const code = this.safeCurrencyCode (id);
            const deposit = this.safeBool (currency, 'can_deposit');
            const withdraw = this.safeBool (currency, 'can_withdrawal');
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'id': id,
                'code': code,
                'name': undefined,
                'type': 'crypto',
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
                'precision': this.parsePrecision (this.safeString (currency, 'decimal')),
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
                'networks': {},
            });
        }
        return result;
    }

    /**
     * @method
     * @name uzx#fetchMarkets
     * @description retrieves data on all markets for uzx
     * @see https://uzx.com/v2/api/docs/en/index.html#47596ed3a8th
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV2Products (params);
        //
        //    {
        //        "code": 200,
        //        "msg": "success",
        //        "data": [
        //          {
        //            "ins_type": "SWAP",
        //            "product_name": "BTCUSDT",
        //            "base_coin_name": "BTC",
        //            "quote_coin_name": "USDT",
        //            "price_precision": 1,
        //            "num_precision": 0,
        //            "max_once_vol": "0",
        //            "max_once_amount": "0",
        //            "min_once_vol": "0",
        //            "min_once_amount": "0",
        //            "swap_value": "0.0001",
        //            "price_unit": "0.1",
        //            "max_leverage": 125,
        //            "max_once_limit_num": 100000001,
        //            "max_once_market_num": 100000000,
        //            "max_hold_num": 100000000,
        //            "maintenance_margin_rate": "0.001",
        //            "market_max_deeps": 5,
        //            "max_book_num": 500
        //          }
        //        ]
        //      }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        //
        //    {
        //        "ins_type": "SWAP",
        //        "product_name": "BTCUSDT",
        //        "base_coin_name": "BTC",
        //        "quote_coin_name": "USDT",
        //        "price_precision": 1,
        //        "num_precision": 0,
        //        "max_once_vol": "0",
        //        "max_once_amount": "0",
        //        "min_once_vol": "0",
        //        "min_once_amount": "0",
        //        "swap_value": "0.0001",
        //        "price_unit": "0.1",
        //        "max_leverage": 125,
        //        "max_once_limit_num": 100000001,
        //        "max_once_market_num": 100000000,
        //        "max_hold_num": 100000000,
        //        "maintenance_margin_rate": "0.001",
        //        "market_max_deeps": 5,
        //        "max_book_num": 500
        //    }
        //
        const marketId = this.safeString (market, 'product_name');
        let baseId = this.safeString (market, 'base_coin_name');
        let quoteId = this.safeString (market, 'quote_coin_name');
        let inverse = undefined;
        let type = this.safeString (market, 'ins_type');
        const swap = (type === 'SWAP') || (type === 'BASE');
        let settleId = undefined;
        let settle = undefined;
        if (swap) {
            if (type === 'BASE') {
                baseId = quoteId;
                quoteId = 'USD';
                inverse = true;
                settleId = baseId;
            } else {
                settleId = quoteId;
                inverse = false;
            }
            settle = this.safeCurrencyCode (settleId);
        }
        const base = this.safeCurrencyCode (baseId)
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = undefined;
        if (swap) {
            symbol = base + '/' + quote + ':' + settle;
        } else {
            symbol = base + '/' + quote;
        }
        if (type === 'BASE') {
            type = 'swap';
        }
        return {
            'info': market,
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type.toLowerCase () as MarketType,
            'spot': !swap,
            'margin': false,
            'swap': swap,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': swap,
            'linear': swap ? !inverse : undefined,
            'inverse': swap ? inverse : undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'num_precision'),
                'price': this.safeNumber (market, 'price_precision'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeNumber (market, 'max_leverage'),
                },
                'amount': {
                    'min': this.safeNumber (market, 'min_once_amount'),
                    'max': this.safeNumber (market, 'max_once_amount'),
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
        };
    }

    /**
     * @method
     * @name uzx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://uzx.com/v2/api/docs/en/index.html#29f944d5wv7k trading account
     * @see https://uzx.com/v2/api/docs/en/index.html#61b7c97feh4o funding account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const type = this.safeString (params, 'type');
        params = this.omit (params, 'type');
        let response = undefined;
        if (type === 'trading') {
            response = await this.privateGetV2AccountBalances (params);
            //
            //    {
            //        "code": 200,
            //        "msg": "success",
            //        "data": [
            //          {
            //            "coin": "USDT",
            //            "balance": "1009879.50566968",
            //            "available_balance": "1009875.180439",
            //            "isolated_frozen_balance": "4.32523068",
            //            "cross_frozen_balance": "0",
            //            "frozen_balance": "4.32523068",
            //            "order_frozen_balance": "0"
            //          },
            //          ...
            //        ]
            //      }
            //
        } else {
            response = await this.privateGetV2AssetBalances (params);
            //
            //    {
            //        "msg": "success",
            //        "data": [
            //          {
            //            "coin": "USDT",
            //            "balance": "98990000",
            //            "frozen_balance": "10",
            //            "available_balance": "98989990"
            //          },
            //          ...
            //        ],
            //        "code": 200
            //    }
            //
        }
        const data = this.safeList (response, 'data');
        return this.parseBalance (data);
    }

    parseBalance (response) {
        //
        //    {
        //        "coin": "USDT",
        //        "balance": "1009879.50566968",
        //        "available_balance": "1009875.180439",
        //        "isolated_frozen_balance": "4.32523068",
        //        "cross_frozen_balance": "0",
        //        "frozen_balance": "4.32523068",
        //        "order_frozen_balance": "0"
        //    },
        //
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const currencyId = this.safeString (item, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const account: Dict = {
                'free': this.safeString (item, 'available_balance'),
                'used': this.safeString (item, 'frozen_balance'),
                'total': this.safeString (item, 'balance'),
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name uzx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://uzx.com/v2/api/docs/en/index.html#c07cef3aib0r
     * @see https://uzx.com/v2/api/docs/en/index.html#463d9e67irt1
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            // symbol    path    string    Yes    Trading Pair Name
            // interval    query    string    No    depth step0-step3
        };
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetNotificationSpotSymbolOrderbook (this.extend (request, params));
        } else {
            response = await this.publicGetNotificationSwapSymbolOrderbook (this.extend (request, params));
        }
        //
        //    {
        //        "code": 200,
        //        "interval": "step1",
        //        "msg": "success",
        //        "status": "ok",
        //        "ts": 1746782857053,
        //        "type": "swap.orderBook",
        //        "data": {
        //          "bids": [
        //            [
        //              "102623",
        //              "59494"
        //            ]
        //          ],
        //          "asks": [
        //            [
        //              "102624",
        //              "2143"
        //            ]
        //          ],
        //          "ts": 1746782856804,
        //          "type": "swap.BTCUSDT.orderBook",
        //          "product_name": "BTCUSDT",
        //          "interval": "1"
        //        }
        //    }
        //
        const timestamp = this.safeInteger (response, 'ts');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 0, 1, 'product_name');
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // spot
        //    {
        //        "ch": "spot.BTC-USDT.detail",
        //        "code": 200,
        //        "data": {
        //          "market": {
        //            "open": "89000",
        //            "close": "89001",
        //            "low": "89000",
        //            "high": "89500",
        //            "turn_over": "178089.9785",
        //            "count": 0,
        //            "vol": "2.000983",
        //            "change": "0",
        //            "change_percent": "0"
        //          },
        //          "symbol": "BTC-USDT"
        //        },
        //        "msg": "success",
        //        "ts": 1744000114682
        //    }
        //
        // swap
        //    {
        //        "ch": "swap.BTCUSDT.detail",
        //        "code": 200,
        //        "data": {
        //          "market": {
        //            "open": "10000",
        //            "close": "102382.3557",
        //            "low": "0.3538",
        //            "high": "102938.655",
        //            "turn_over": "411364424037.47854688",
        //            "count": 0,
        //            "vol": "4009858.7732",
        //            "change": "92382.3557",
        //            "change_percent": "9.23823557"
        //          },
        //          "index": {
        //            "open": "103276.62",
        //            "close": "102412.29",
        //            "low": "102358.29",
        //            "high": "103276.62"
        //          },
        //          "tag": {
        //            "open": "103276.62",
        //            "close": "102412.2",
        //            "low": "102358.2",
        //            "high": "103276.62"
        //          },
        //          "funding_rate": "0.00000001",
        //          "funding_next_time": 1746777600,
        //          "pre_funding_rate": "0.00000001",
        //          "symbol": "BTCUSDT",
        //          "risk_fund": "0"
        //        },
        //        "msg": "success",
        //        "ts": 1746763088919
        //      }
        //
        const timestamp = this.safeInteger (ticker, 'ts');
        const data = this.safeDict (ticker, 'data');
        const marketData = this.safeDict (data, 'market');
        const symbol = this.safeString (market, 'symbol');
        market = this.safeMarket (symbol, market);
        const last = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (marketData, 'high'),
            'low': this.safeString (marketData, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (marketData, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (marketData, 'change'),
            'percentage': this.safeString (marketData, 'change_percent'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
        }, market);
    }

    /**
     * @method
     * @name uzx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://uzx.com/v2/api/docs/en/index.html#3cd370f07zhz spot
     * @see https://uzx.com/v2/api/docs/en/index.html#12c02d7b15op swap
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetNotificationSpotSymbolTicker (this.extend (request, params));
            //
            //    {
            //        "ch": "spot.BTC-USDT.detail",
            //        "code": 200,
            //        "data": {
            //          "market": {
            //            "open": "89000",
            //            "close": "89001",
            //            "low": "89000",
            //            "high": "89500",
            //            "turn_over": "178089.9785",
            //            "count": 0,
            //            "vol": "2.000983",
            //            "change": "0",
            //            "change_percent": "0"
            //          },
            //          "symbol": "BTC-USDT"
            //        },
            //        "msg": "success",
            //        "ts": 1744000114682
            //    }
            //
        } else {
            response = await this.publicGetNotificationSwapSymbolTicker (this.extend (request, params));
            //
            //    {
            //        "ch": "swap.BTCUSDT.detail",
            //        "code": 200,
            //        "data": {
            //          "market": {
            //            "open": "10000",
            //            "close": "102382.3557",
            //            "low": "0.3538",
            //            "high": "102938.655",
            //            "turn_over": "411364424037.47854688",
            //            "count": 0,
            //            "vol": "4009858.7732",
            //            "change": "92382.3557",
            //            "change_percent": "9.23823557"
            //          },
            //          "index": {
            //            "open": "103276.62",
            //            "close": "102412.29",
            //            "low": "102358.29",
            //            "high": "103276.62"
            //          },
            //          "tag": {
            //            "open": "103276.62",
            //            "close": "102412.2",
            //            "low": "102358.2",
            //            "high": "103276.62"
            //          },
            //          "funding_rate": "0.00000001",
            //          "funding_next_time": 1746777600,
            //          "pre_funding_rate": "0.00000001",
            //          "symbol": "BTCUSDT",
            //          "risk_fund": "0"
            //        },
            //        "msg": "success",
            //        "ts": 1746763088919
            //      }
            //
        }
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name uzx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://uzx.com/v2/api/docs/en/index.html#ea05241e9fp5 spot
     * @see https://uzx.com/v2/api/docs/en/index.html#2ff69aa59q8j swap
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        let response = undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', undefined, params);
        if (marketType === 'spot') {
            response = await this.publicGetNotificationSpotTickers (params);
            //
            //    {
            //        "ch": "spot.tickers",
            //        "code": 200,
            //        "data": [
            //          {
            //            "market": {
            //              "open": "100000",
            //              "close": "100000",
            //              "low": "100000",
            //              "high": "100000",
            //              "turn_over": "0",
            //              "count": 0,
            //              "vol": "0",
            //              "change": "0",
            //              "change_percent": "0"
            //            },
            //            "symbol": "BTC-USDT"
            //          }
            //        ],
            //        "msg": "success",
            //        "ts": 1746727154821
            //      }
            //
        } else {
            response = await this.publicGetNotificationSwapTickers (params);
            //
            //    {
            //        "ch": "swap.tickers",
            //        "code": 200,
            //        "data": [
            //            {
            //                "market": {
            //                    "open": "10000",
            //                    "close": "102564.2999",
            //                    "low": "0.3538",
            //                    "high": "102938.655",
            //                    "turn_over": "554079954983.83727936",
            //                    "count": 0,
            //                    "vol": "5426486.2397",
            //                    "change": "92564.2999",
            //                    "change_percent": "9.25642999"
            //                },
            //                "index": {
            //                    "open": "103276.62",
            //                    "close": "102824.77",
            //                    "low": "102358.29",
            //                    "high": "103276.62"
            //                },
            //                "tag": {
            //                    "open": "103276.62",
            //                    "close": "102824.7",
            //                    "low": "102358.2",
            //                    "high": "103276.62"
            //                },
            //                "funding_rate": "0.00000001",
            //                "funding_next_time": 1746777600,
            //                "pre_funding_rate": "0.00000001",
            //                "symbol": "BTCUSDT",
            //                "risk_fund": "0"
            //            }
            //        ],
            //        "msg": "success",
            //        "ts": 1746766867341
            //    }
            //
        }
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //    {
        //        "open": "98955",
        //        "close": "98955",
        //        "high": "98955",
        //        "low": "98955",
        //        "turn_over": "0",
        //        "vol": "0",
        //        "count": 0
        //    },
        //
        const timestamp = this.safeInteger (ohlcv, 'timestamp');
        const interval = this.safeString (ohlcv, 'interval');
        const ms = this.parseTimeframe (interval);
        const count = this.safeInteger (ohlcv, 'count');
        return [
            timestamp - (ms * count),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'vol'),
        ];
    }

    /**
     * @method
     * @name uzx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://uzx.com/v2/api/docs/en/index.html#534fecb45vdx spot candles
     * @see https://uzx.com/v2/api/docs/en/index.html#d68573972by3 swap candles
     * @see https://uzx.com/v2/api/docs/en/index.html#0cdb8dbbvep6 mark price candles
     * @see https://uzx.com/v2/api/docs/en/index.html#5d99e7c6lgmw index price candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {int} [params.price] 'mark' or 'index' for mark price and index price candles
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const price = this.safeString (params, 'price');
        params = this.omit (params, [ 'price' ]);
        let request: Dict = {
            'symbol': market['id'],
            'interval': timeframe,
            // symbol    path    string    Yes    Trading Pair Name
            // size    query    integer    Yes    Number of Records: Maximum 2000
            // start    query    integer    Yes    Start Timestamp (seconds)
            // end    query    integer    Yes    End Timestamp (seconds)
            // interval    query    string    Yes    Time Interval: See enumeration
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('end', request, params);
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetNotificationSpotSymbolCandles (this.extend (request, params));
        } else {
            if (price === 'mark') {
                response = await this.publicGetNotificationSwapSymbolTag (this.extend (request, params));
            } else if (price === 'index') {
                response = await this.publicGetNotificationSwapSymbolIndex (this.extend (request, params));
            } else {
                response = await this.publicGetNotificationSwapSymbolCandles (this.extend (request, params));
            }
        }
        // spot
        //    {
        //        "code": 200,
        //        "data": [
        //          {
        //            "open": "98955",
        //            "close": "98955",
        //            "high": "98955",
        //            "low": "98955",
        //            "turn_over": "0",
        //            "vol": "0",
        //            "count": 0
        //          },
        //        ],
        //        "interval": "1min",
        //        "msg": "success",
        //        "symbol": "BTC-USDT",
        //        "ts": 1746754786392,
        //        "type": "spot.candles"
        //      }
        //
        const data = this.safeList (response, 'data', []);
        const results = [];
        for (let i = 0; i < data.length; i++) {
            const ohlcv = data[i];
            const timestamp = this.safeInteger (ohlcv, 'ts');
            ohlcv['timestamp'] = timestamp;
            ohlcv['interval'] = timeframe;
            const parsed = this.parseOHLCV (ohlcv, market);
            results.push (parsed);
        }
        const sorted = this.sortBy (results, 0);
        return this.filterBySinceLimit (sorted, since, limit, 0, false);
    }

    parseTrade (trade: Dict, market: Market = undefined) {
        //
        // fetchTrades
        //    {
        //        "ts": 1752557507585,
        //        "direction": "buy",
        //        "price": "108640.42",
        //        "vol": "0.0002",
        //        "id": 184664390001
        //    }
        //
        // fetchOrder
        //         {
        //           "bill_id": "43786-2517920520600050556-2517720520600573709",
        //           "product_name": "",
        //           "order_id": "2517920520600050556",
        //           "position_id": "205206000000000017",
        //           "mgn_mode": 1,
        //           "role": "taker",
        //           "order_mode": 1,
        //           "pos_side": "ST",
        //           "pos_opt": 1,
        //           "filled_amount": "1",
        //           "price": "107775",
        //           "fee": "0.0064665",
        //           "margin": "2.1619665",
        //           "leverage": 5,
        //           "income": "0",
        //           "taker_fee": "0.0006",
        //           "maker_fee": "0.0004",
        //           "order_buy_or_sell": 2,
        //           "created_at": 1751101108324,
        //           "ins_type": "SWAP",
        //           "order_type": 2
        //         },
        //
        const timestamp = this.safeInteger2 (trade, 'ts', 'created_at');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'order': this.safeString (trade, 'order_id'),
            'type': undefined,
            'side': this.safeString (trade, 'direction'),
            'takerOrMaker': this.safeString (trade, 'role'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'vol'),
            'cost': undefined,
            'fee': {
                'currency': undefined,
                'cost': this.safeString (trade, 'fee'),
                'rate': undefined,
            },
        }, market);
    }

    /**
     * @method
     * @name uzx#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://uzx.com/v2/api/docs/en/index.html#459d9bf4acua spot
     * @see https://uzx.com/v2/api/docs/en/index.html#8096f75fo2w1 spot batch trades
     * @see https://uzx.com/v2/api/docs/en/index.html#551dd740eqd7 spot history trades
     * @see https://uzx.com/v2/api/docs/en/index.html#78857a28ak8w swap
     * @see https://uzx.com/v2/api/docs/en/index.html#e51910935trk swap batch trades
     * @see https://uzx.com/v2/api/docs/en/index.html#c9531161inu8 swap history trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = this.safeString (params, 'method');
        params = this.omit (params, [ 'method' ]);
        const request: Dict = {
            'symbol': market['id'],
            // symbol    path    string    Yes    Trading pair name
            // size    query    integer    No    Number of records (max 100). Default is 100 when omitted.   for history trades and batch trades
            // after    query    integer    No    Millisecond timestamp. Use the last record’s timestamp from the previous response to paginate backwards.   for history-trades
        };
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        let response = undefined;
        if (market['spot']) {
            if ((limit === 1) || (method === 'publicGetNotificationSpotSymbolTrade')) {
                response = await this.publicGetNotificationSpotSymbolTrade (this.extend (request, params));
                //
                //    {
                //        "code": 200,
                //        "data": {
                //          "data": [
                //            {
                //              "direction": "sell",
                //              "price": "102680.546869",
                //              "ts": 1746759096603,
                //              "vol": "0.04"
                //            }
                //          ],
                //          "ts": 1746759097067
                //        },
                //        "msg": "success",
                //        "ts": 1746759097067,
                //        "type": "swap.detail"
                //    }
                //
            } else if ((since !== undefined) || (method === 'publicGetNotificationSpotSymbolHistoryTrades')) {
                response = await this.publicGetNotificationSpotSymbolHistoryTrades (this.extend (request, params));
                //
                //    {
                //        "code": 200,
                //        "data": [
                //          {
                //            "ts": 1752557507585,
                //            "direction": "buy",
                //            "price": "108640.42",
                //            "vol": "0.0002",
                //            "id": 184664390001
                //          }
                //        ],
                //        "msg": "success",
                //        "ts": 1752725468921
                //    }
                //
            } else {
                response = await this.publicGetNotificationSpotSymbolTrades (this.extend (request, params));
                //
                //    {
                //        "code": 200,
                //        "data": [
                //          {
                //            "data": [
                //              {
                //                "direction": "buy",
                //                "price": "102599.946583",
                //                "ts": 1746759371209,
                //                "vol": "0.02"
                //              }
                //            ],
                //            "product_name": "BTC-USDT",
                //            "ts": 1746759371209,
                //            "type": "spot.BTC-USDT.fills"
                //          },
                //          {
                //            "data": [
                //              {
                //                "direction": "sell",
                //                "price": "102599.946583",
                //                "ts": 1746759371725,
                //                "vol": "0.02"
                //              }
                //            ],
                //            "product_name": "BTC-USDT",
                //            "ts": 1746759371725,
                //            "type": "spot.BTC-USDT.fills"
                //          }
                //        ],
                //        "msg": "success",
                //        "ts": 1746759374498
                //    }
                //
            }
        } else {
            if ((limit === 1) || (method === 'publicGetNotificationSpotSymbolTrade')) {
                response = await this.publicGetNotificationSwapSymbolTrade (this.extend (request, params));
                response = this.safeDict (response, 'data', []);
                //
                //    {
                //        "code": 200,
                //        "data": {
                //          "data": [
                //            {
                //              "direction": "buy",
                //              "price": "102736.9001",
                //              "ts": 1746766999793,
                //              "vol": "79300"
                //            }
                //          ],
                //          "ts": 1746766999982
                //        },
                //        "msg": "success",
                //        "ts": 1746766999982,
                //        "type": "swap.detail"
                //    }
                //
            } else if ((since !== undefined) || (method === 'publicGetNotificationSpotSymbolHistoryTrades')) {
                response = await this.publicGetNotificationSwapSymbolHistoryTrades (this.extend (request, params));
                //
                //    {
                //        "code": 200,
                //        "data": [
                //          {
                //            "ts": 1752557507585,
                //            "direction": "buy",
                //            "price": "108640.42",
                //            "vol": "0.0002",
                //            "id": 184664390001
                //          }
                //        ],
                //        "msg": "success",
                //        "ts": 1752725468921
                //    }
                //
            } else {
                response = await this.publicGetNotificationSwapSymbolTrades (this.extend (request, params));
                response = this.safeDict (response, 'data', []);
                //
                //    {
                //        "code": 200,
                //        "data": {
                //          "data": [
                //            {
                //              "direction": "sell",
                //              "price": "102771.2",
                //              "ts": 1746767096612,
                //              "vol": "1"
                //            }
                //          ],
                //          "ts": 1746767097114
                //        },
                //        "msg": "success",
                //        "ts": 1746767097114,
                //        "type": "swap.detail"
                //    }
                //
            }
        }
        //
        //    {
        //        "code": 200,
        //        "data": [
        //          {
        //            "ts": 1752557507585,
        //            "direction": "buy",
        //            "price": "108640.42",
        //            "vol": "0.0002",
        //            "id": 184664390001
        //          }
        //        ],
        //        "msg": "success",
        //        "ts": 1752725468921
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseMarginModeProperty (mode: string) {
        const modes: Dict = {
            '1': 'isolated',
            '2': 'cross',
        };
        return this.safeString (modes, mode, mode);
    }

    parseOrderMode (mode: string) {
        const modes: Dict = {
            '1': 'normal',
            '2': 'liquidation',
            '4': 'adl',
            '7': 'oneClickClose',
        };
        return this.safeString (modes, mode, mode);
    }

    parseOrderDirection (direction: string) {
        const directions: Dict = {
            '1': 'buy',
            '2': 'sell',
        };
        return this.safeString (directions, direction, direction);
    }

    parsePositionSide (side: string) {
        const sides: Dict = {
            'LG': 'long',
            'ST': 'short',
        };
        return this.safeString (sides, side, side);
    }

    parseTimeInForce (type: string) {
        const types: Dict = {
            '1': 'market',
            '2': 'GTC',
            '3': 'IOC',
            '4': 'FOK',
            '5': 'limitMaker',
            '9': 'oneClickClose',
        };
        return this.safeString (types, type, type);
    }

    parsePositionOperation (operation: string) {
        const operations: Dict = {
            '1': 'open',
            '2': 'close',
            '3': 'liquidation',
            '5': 'adl',
        };
        return this.safeString (operations, operation, operation);
    }

    parseOrderStatus (status: string) {
        const statuses: Dict = {
            '0': 'pending',
            '1': 'open',
            '2': 'open',
            '3': 'canceled',
            '4': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parsePositionMode (mode: string) {
        const modes: Dict = {
            '1': 'hedged',
            '2': 'oneWay',
        };
        return this.safeString (modes, mode, mode);
    }

    parseRole (role: string) {
        const roles: Dict = {
            '1': 'taker',
            '2': 'maker',
        };
        return this.safeString (roles, role, role);
    }

    parsePositionStatus (status: string) {
        const statuses: Dict = {
            '1': 'active',
            '2': 'closed',
            '3': 'liquidated',
        };
        return this.safeString (statuses, status, status);
    }

    parseStopOrderType (type: string) {
        const types: Dict = {
            '1': 'partial position',
            '2': 'full position',
        };
        return this.safeString (types, type, type);
    }

    parseTakeProfiPriceType (type: string) {
        const types: Dict = {
            '1': 'market',
            '2': 'limit',
        };
        return this.safeString (types, type, type);
    }

    parseTriggerPriceType (type: string) {
        const types: Dict = {
            '1': 'index',
            '2': 'mark',
            '3': 'lastTraded',
        };
        return this.safeString (types, type, type);
    }

    parseTrailingTakeProfitCallbackType (type: string) {
        const types: Dict = {
            '1': 'percentage',
            '2': 'distance',
        };
        return this.safeString (types, type, type);
    }

    parseTriggerType (type: string) {
        const types: Dict = {
            '1': 'takeProfit',
            '2': 'stopLoss',
        };
        return this.safeString (types, type, type);
    }

    parseTriggerOrderStatus (status: string) {
        const statuses: Dict = {
            '3': 'canceled',
            '100': 'pending',
            '101': 'open',
            '102': 'open',
            '103': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseCurrencyStatus (status: string) {
        const statuses: Dict = {
            '0': 'disabled',
            '1': 'enabled',
        };
        return this.safeString (statuses, status, status);
    }

    parseSpotProductStatus (status: string) {
        const statuses: Dict = {
            '1': 'preOpen',
            '2': 'active',
            '3': 'suspended',
        };
        return this.safeString (statuses, status, status);
    }

    parsePerpetualContractStatus (status: string) {
        const statuses: Dict = {
            '1': 'active',
            '2': 'suspended',
        };
        return this.safeString (statuses, status, status);
    }

    parseFundingAccountBillMainTypes (mainType: string) {
        const mainTypes: Dict = {
            '1': 'deposit',
            '2': 'withdrawal',
            '3': 'transfer in',
            '4': 'transfer out',
            '5': 'internal transfer',
            '6': 'airdrop',
        };
        return this.safeString (mainTypes, mainType, mainType);
    }

    parseTradingAccountBillSubTypes (subType: string) {
        const subTypes: Dict = {
            '1': 'freeze',
            '2': 'unfreeze',
            '3': 'buy',
            '4': 'sell',
            '5': 'fee',
            '6': 'openLong',
            '7': 'openShort',
            '8': 'closeLong',
            '9': 'closeShort',
            '10': 'reduceLong',
            '11': 'reduceShort',
            '12': 'manualMarginIncrease',
            '13': 'manualMarginDecrease',
            '14': 'autoMarginIncrease',
            '15': 'fundingFeeExpense',
            '16': 'fundingFeeIncome',
            '17': 'transferIn',
            '18': 'transferOut',
        };
        return this.safeString (subTypes, subType, subType);
    }

    parseTradingAccountBillMainTypes (mainType: string) {
        const mainTypes: Dict = {
            '1': 'trade',
            '2': 'liquidation',
            '3': 'marginTransfer',
            '4': 'fundingFee',
            '5': 'adl',
            '6': 'transfer',
            '7': 'rebateExpense',
            '8': 'rebateRefund',
            '9': 'trialFunds',
            '10': 'riskFund',
            '11': 'fundingPayment',
        };
        return this.safeString (mainTypes, mainType, mainType);
    }

    parseTradingAccountTransferDirection (direction: string) {
        const directions: Dict = {
            '1': 'income',
            '2': 'expense',
        };
        return this.safeString (directions, direction, direction);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        // fetchOpenOrders
        //    {
        //    "product_name": "BTC-USDT",
        //    "order_id": "2517910362100040465",
        //    "mgn_mode": 0,
        //    "pos_side": "",
        //    "order_mode": 0,
        //    "pos_mode": 0,
        //    "order_type": 2,
        //    "pos_opt": 0,
        //    "leverage": 0,
        //    "order_buy_or_sell": 1,
        //    "number": 0,
        //    "amount": "",
        //    "deal_number": 0,
        //    "lock_base_amount": "0.001",
        //    "lock_quote_amount": "109.52972",
        //    "filled_quote_amount": "0",
        //    "price": "109529.72",
        //    "status": 0,
        //    "avg_price": "0",
        //    "deal_fee": "0",
        //    "income": "0",
        //    "created_at": 1751100684192,
        //    "finish_at": 1751100684208,
        //    "ins_type": "SPOT",
        //    "algo_info": null,
        //    "coin": "USDT",
        //    "un_filled_amount": 0
        //    }
        // fetchOrder
        // {
        //       "product_name": "BTCUSDT",
        //       "order_id": "2517920520600050556",
        //       "mgn_mode": 1,
        //       "pos_side": "ST",
        //       "order_mode": 1,
        //       "pos_mode": 1,
        //       "order_type": 2,
        //       "pos_opt": 1,
        //       "leverage": 5,
        //       "order_buy_or_sell": 2,
        //       "number": 2,
        //       "amount": "0",
        //       "deal_number": 2,
        //       "lock_base_amount": "0",
        //       "lock_quote_amount": "0",
        //       "filled_quote_amount": "0",
        //       "price": "107775",
        //       "status": 4,
        //       "avg_price": "107775",
        //       "deal_fee": "0.012933",
        //       "income": "0",
        //       "created_at": 1751101108310,
        //       "finish_at": 1751101108340,
        //       "ins_type": "SWAP",
        //       "algo_info": "[]",
        //       "coin": "USDT",
        //       "bills": [
        //         {
        //           "bill_id": "43786-2517920520600050556-2517720520600573709",
        //           "product_name": "",
        //           "order_id": "2517920520600050556",
        //           "position_id": "205206000000000017",
        //           "mgn_mode": 1,
        //           "role": "taker",
        //           "order_mode": 1,
        //           "pos_side": "ST",
        //           "pos_opt": 1,
        //           "filled_amount": "1",
        //           "price": "107775",
        //           "fee": "0.0064665",
        //           "margin": "2.1619665",
        //           "leverage": 5,
        //           "income": "0",
        //           "taker_fee": "0.0006",
        //           "maker_fee": "0.0004",
        //           "order_buy_or_sell": 2,
        //           "created_at": 1751101108324,
        //           "ins_type": "SWAP",
        //           "order_type": 2
        //         },
        //       ]
        //     }
        const timestamp = this.safeInteger (order, 'created_at');
        const finishAt = this.safeInteger (order, 'finish_at');
        const marketId = this.safeString (order, 'product_name');
        market = this.safeMarket (marketId, market);
        const type = this.safeString (order, 'order_type');
        const orderBuyOrSell = this.safeString (order, 'order_buy_or_sell');
        const status = this.safeString (order, 'status');
        const currencyId = this.safeString (order, 'coin');
        const bills = this.safeList (order, 'bills', []);
        const trades = [];
        for (let i = 0; i < bills.length; i++) {
            const bill = bills[i];
            const trade = this.parseTrade (bill, market);
            trades.push (trade);
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': finishAt,
            'symbol': market['symbol'],
            'type': type === '1' ? 'market' : 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': orderBuyOrSell === '1' ? 'buy' : 'sell',
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'amount': this.safeString (order, 'amount'),
            'cost': undefined,
            'average': this.safeString (order, 'avg_price'),
            'filled': this.safeString (order, 'filled_quote_amount'),
            'remaining': this.safeString (order, 'un_filled_amount'),
            'status': this.parseOrderStatus (status),
            'fee': {
                'currency': this.safeCurrencyCode (currencyId),
                'cost': this.safeString (order, 'deal_fee'),
                'rate': undefined,
            },
            'trades': undefined,
        }, market);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        if (reduceOnly) {
            return {
                'product_name': market['id'],
                'pos_side': (side === 'buy') ? 'ST' : 'LG',
            };
        }
        const request: Dict = {
            'product_name': market['id'],
            'order_type': type,
            'amount': this.amountToPrecision (symbol, amount),
            // body    body    object    No
            // » product_name    body    string    Yes    Product name
            // » order_type    body    integer    Yes    Order type    See enumeration
            // » number    body    integer    Yes    Contract quantity
            // » price    body    string    Yes    Price
            // » amount    body    string    No    Market order amount
            // » trade_ccy    body    integer    No    Unit for market order    1 for contract quantity, 2 for quoted currency
            // » pos_side    body    string    Yes    Position direction    LG for long, ST for short
            // » order_buy_or_sell    body    integer    Yes    Buy or sell direction    1 for buy, 2 for sell
            // » attach_algo    body    array[object]    No    Take-profit and stop-loss information
            // »» tp_trigger_price    body    string    Yes    Take-profit trigger price
            // »» tp_ord_price    body    string    Yes    Take-profit order price    -1 for market order, >0 for normal limit price
            // »» tp_ord_kind    body    integer    Yes    Take-profit order type    1 for trigger order/conditional order, 2 for limit order
            // »» tp_compare    body    integer    Yes    Take-profit trigger price comparison    1: Index price, 2: Mark price, 3: Last traded price
            // »» sl_trigger_price    body    string    Yes    Stop-loss trigger price
            // »» sl_ord_price    body    string    Yes    Stop-loss order price    -1 for market order, >0 for normal limit price
            // »» sl_compare    body    integer    Yes    Stop-loss trigger price comparison    1: Index price, 2: Mark price, 3: Last traded price
        };
        if (market['swap']) {
            request['pos_side'] = (type === 'buy') ? 'LG' : 'ST';
        } else {
            request['order_buy_or_sell'] = (type === 'buy') ? 1 : 2;
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        // TODO: trigger orders
        params = this.omit (params, [ 'triggerPrice' ]);
        return request;
    }

    /**
     * @method
     * @name uzx#closePosition
     * @description closes open positions for a market
     * @see https://uzx.com/v2/api/docs/en/index.html#69c0da91oe0c
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side 'buy' or 'sell', the side of the closing order, opposite side as position side
     * @param {object} [params] extra parameters specific to the bingx api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            // body    body    object    No
            'product_name': market['id'],
            'pos_side': (side === 'buy') ? 'ST' : 'LG',
        };
        const response = await this.privatePutV2TradeSwapClosePosition (this.extend (request, params));
        // {
        //     "code": 200,
        //     "msg": "string",
        //     "data": {}
        // }
        return this.parseOrder (response, market);
    }

    async modifyMarginHelper (symbol: string, amount, type, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        amount = this.amountToPrecision (symbol, amount);
        const side = this.safeString (params, 'side');
        params = this.omit (params, [ 'side' ]);
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' modifyMarginHelper() requires a side parameter');
        }
        const request: Dict = {
            'symbol': market['id'],
            'amount': amount,
            'type': type,
            'pos_side': (side === 'buy') ? 'LG' : 'ST',
        };
        const response = await this.privatePutV2TradeSwapPositionMarginBalance (this.extend (request, params));
        //
        // {
        //     "code": 200,
        //     "msg": "string",
        //     "data": {}
        // }
        //
        if (type === 'reduce') {
            amount = Precise.stringAbs (amount);
        }
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
        });
    }

    parseMarginModification (data: Dict, market: Market = undefined): MarginModification {
        //
        // addMargin/reduceMargin
        //
        //     {
        //          TODO
        //     }
        //
        const errorCode = this.safeString (data, 'code');
        const status = (errorCode === '0') ? 'ok' : 'failed';
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': undefined,
            'marginMode': 'isolated',
            'amount': undefined,
            'total': undefined,
            'code': market['quote'],
            'status': status,
            'timestamp': undefined,
            'datetime': undefined,
        };
    }

    /**
     * @method
     * @name uzx#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbols !== undefined && symbols.length > 0) {
            market = this.market (symbols[0]);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchPositions', market, params);
        const request: Dict = {
            // ins_type    query    string    No    Product type    SWAP - USDT-margined, BASE - Coin-margined
            // product_name    query    string    No    Product name
        };
        if (marketType !== undefined) {
            request['ins_type'] = marketType.toUpperCase ();
        }
        const response = await this.privateGetV2TradePositions (params);
        // {
        //     "code": 200,
        //     "msg": "success",
        //     "data": [
        //       {
        //         "product_name": "BTCUSDT",
        //         "position_id": "205206000000000017",
        //         "ins_type": "SWAP",
        //         "mgn_mode": 1,
        //         "pos_mode": 1,
        //         "leverage": 5,
        //         "side": "ST",
        //         "hold_position_amount": 2,
        //         "margin": "4.32523068",
        //         "total_fee": "0.012933",
        //         "status": 1,
        //         "force_close_price": "129194.4422923322683706070287539936102236422",
        //         "position_avg_price": "107775",
        //         "deal_avg_price": "0",
        //         "income": "0",
        //         "begin_order_id": "2517920520600050556",
        //         "created_at": 1751101108324,
        //         "updated_at": 1751414400876,
        //         "close_num": 0,
        //         "open_num": 2,
        //         "bankrupt_price": "129323.55926444133519888",
        //         "force_trigger_price": "0",
        //         "adl_num": 0,
        //         "adl_deal_price": "0",
        //         "adl_income": "0",
        //         "funding_fee": "0.00129768"
        //       }
        //     ]
        // }
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    /**
     * @method
     * @name uzx#fetchPosition
     * @description fetch data on an open position
     * @see https://uzx.com/v2/api/docs/en/index.html#3eff6ed8szwk
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchPosition', market, params);
        const request: Dict = {
            'ins_type': marketType.toUpperCase (),
            'product_name': market['id'],
        };
        const response = await this.privateGetV2TradePositions (this.extend (request, params));
        //
        // {
        //     "code": 200,
        //     "msg": "success",
        //     "data": [
        //       {
        //         "product_name": "BTCUSDT",
        //         "position_id": "205206000000000017",
        //         "ins_type": "SWAP",
        //         "mgn_mode": 1,
        //         "pos_mode": 1,
        //         "leverage": 5,
        //         "side": "ST",
        //         "hold_position_amount": 2,
        //         "margin": "4.32523068",
        //         "total_fee": "0.012933",
        //         "status": 1,
        //         "force_close_price": "129194.4422923322683706070287539936102236422",
        //         "position_avg_price": "107775",
        //         "deal_avg_price": "0",
        //         "income": "0",
        //         "begin_order_id": "2517920520600050556",
        //         "created_at": 1751101108324,
        //         "updated_at": 1751414400876,
        //         "close_num": 0,
        //         "open_num": 2,
        //         "bankrupt_price": "129323.55926444133519888",
        //         "force_trigger_price": "0",
        //         "adl_num": 0,
        //         "adl_deal_price": "0",
        //         "adl_income": "0",
        //         "funding_fee": "0.00129768"
        //       }
        //     ]
        // }
        //
        return this.parsePosition (response[0], market);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //    {
        //        "product_name": "BTCUSDT",
        //        "position_id": "205206000000000017",
        //        "ins_type": "SWAP",
        //        "mgn_mode": 1,
        //        "pos_mode": 1,
        //        "leverage": 5,
        //        "side": "ST",
        //        "hold_position_amount": 2,
        //        "margin": "4.32523068",
        //        "total_fee": "0.012933",
        //        "status": 1,
        //        "force_close_price": "129194.4422923322683706070287539936102236422",
        //        "position_avg_price": "107775",
        //        "deal_avg_price": "0",
        //        "income": "0",
        //        "begin_order_id": "2517920520600050556",
        //        "created_at": 1751101108324,
        //        "updated_at": 1751414400876,
        //        "close_num": 0,
        //        "open_num": 2,
        //        "bankrupt_price": "129323.55926444133519888",
        //        "force_trigger_price": "0",
        //        "adl_num": 0,
        //        "adl_deal_price": "0",
        //        "adl_income": "0",
        //        "funding_fee": "0.00129768"
        //    }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower (position, 'side');
        const quantity = this.safeString (position, 'size');
        const timestamp = this.safeInteger (position, 'updatedTime');
        let leverage = 20;
        const customInitialMarginRate = this.safeStringN (position, [ 'customInitialMarginRate', 'customImr' ], '0');
        if (this.precisionFromString (customInitialMarginRate) !== 0) {
            leverage = this.parseToInt (Precise.stringDiv ('1', customInitialMarginRate, 4));
        }
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': symbol,
            'entryPrice': this.safeString (position, 'entryPrice'),
            'markPrice': undefined,
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': undefined,
            'side': side,
            'contracts': this.parseNumber (quantity),
            'contractSize': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': leverage,
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }

    /**
     * @method
     * @name uzx#reduceMargin
     * @description remove margin from a position
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    /**
     * @method
     * @name uzx#addMargin
     * @description add margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name uzx#createOrder
         * @description create a trade order
         * @see https://uzx.com/v2/api/docs/en/index.html#54090afbbt3b
         * @see https://uzx.com/v2/api/docs/en/index.html#8eb906a2h6iz
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type must be 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['swap']) {
            if (reduceOnly) {
                response = this.privatePutV2TradeSwapClosePosition (this.extend (request, params));
                //    {
                //        "code": 200,
                //        "msg": "string",
                //        "data": {}
                //    }
            } else {
                response = await this.privatePostV2TradeSwapOrder (this.extend (request, params));
            }
        } else {
            response = await this.privatePostV2TradeSpotOrder (this.extend (request, params));
        }
        // {
        //     "code": 200,
        //     "msg": "success",
        //     "data": {
        //       "order_id": "2517820683201827363"
        //     }
        // }
        const data = this.safeDict (response, 'data');
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name uzx#createOrders
     * @description create a list of trade orders
     * @see https://uzx.com/v2/api/docs/en/index.html#c0d5ca875he9 spot
     * @see https://uzx.com/v2/api/docs/en/index.html#ce1760877z8e swap
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        const orderRequests = [];
        const symbols = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString (rawOrder, 'symbol');
            const type = this.safeString (rawOrder, 'type');
            symbols.push (symbol);
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeNumber (rawOrder, 'amount');
            const price = this.safeNumber (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const reduceOnly = this.safeBool (orderParams, 'reduceOnly', false);
            if (reduceOnly) {
                throw new NotSupported (this.id + ' createOrders() does not support reduceOnly batch orders');
            }
            const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, orderParams);
            orderRequests.push (orderRequest);
        }
        const market = this.market (symbols[0]);
        let response = undefined;
        if (market['swap']) {
            response = await this.privatePostV2TradeSwapBatchOrders (orderRequests);
            // {
            //     "code": 200,
            //     "msg": "success",
            //     "data": [
            //       {
            //         "order_id": "2517720561802636780"
            //       },
            //     ]
            //   }
        } else {
            response = await this.privatePostV2TradeSpotBatchOrders (orderRequests);
            // {
            //     "code": 200,
            //     "msg": "success",
            //     "data": [
            //       {
            //         "code": 200,
            //         "order_id": "2509820413501205367"
            //       }
            //     ]
            //   }
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data);
    }

    /**
     * @method
     * @name uzx#setLeverage
     * @description set the level of leverage for a market
     * @see https://uzx.com/v2/api/docs/en/index.html#ff225f2840xz
     * @param {float} leverage the rate of leverage
     * @param {string} [symbol] unified market symbol (is mandatory for swap markets)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.side] 'long' or 'short'
     * @param {boolean} [params.hedged]
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkRequiredArgument ('setLeverage', symbol, 'symbol');
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        const market: Market = this.market (symbol);
        const side = this.safeString (params, 'side');
        const method = this.safeString (params, 'method');
        const hedged = this.safeBool (params, 'hedged', false);
        let marginMode: Str = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('setLeverage', params, 'cross');
        params = this.omit (params, [ 'method', 'hedged', 'side' ]);
        if (method === 'privatePutV2TradeSwapPositionLeverage') {
            if (side === undefined) {
                throw new ArgumentsRequired (this.id + ' setLeverage() requires a side parameter for method privatePutV2TradeSwapPositionLeverage');
            }
            const request: Dict = {
                'product_name': market['id'],
                'leverage': leverage,
                'pos_side': (side === 'long') ? 'LG' : 'ST',
                'mgn_mode': marginMode,
            };
            return await this.privatePutV2TradeSwapPositionSetLeverage (this.extend (request, params));
            //
            //    {
            //        "code": 200,
            //        "msg": "string",
            //        "data": {}
            //    }
            //
        } else {
            const request: Dict = {
                // body    body    object    No
                'product_name': market['id'],
                'pos_mode': hedged ? 1 : 2,
                'mgn_mode': marginMode === 'isolated' ? 1 : 2,
                // » product_name    body    string    Yes    Product name
                // » long_leverage    body    integer    Yes    Long position leverage    Required if pos_mode is 1
                // » short_leverage    body    integer    Yes    Short position leverage    Required if pos_mode is 1
                // » one_way_leverage    body    integer    Yes    One-way position leverage    Required if pos_mode is 2
                // » pos_mode    body    integer    Yes    Position mode    1 for two-way, 2 for one-way
                // » mgn_mode    body    integer    Yes    Margin mode    1 for isolated, 2 for cross
            };
            if (hedged) {
                request['short_leverage'] = leverage;
                request['long_leverage'] = leverage;
            } else {
                request['one_way_leverage'] = leverage;
            }
            return await this.privatePutV2TradeSwapConfigSetLeverage (this.extend (request, params));
        }
    }

    /**
     * @method
     * @name uzx#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://uzx.com/v2/api/docs/en/index.html#b46eb3ea87cf
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
            'product_name': market['id'],
            'mgn_mode': marginMode === 'isolated' ? 1 : 2,
        };
        const response = this.privatePutV2TradeSwapConfigSetMgn (this.extend (request, params));
        // {
        //     "code": 200,
        //     "msg": "string",
        //     "data": {}
        // }
        return this.parseMarginMode (response, market);
    }

    parseMarginMode (rawMarginMode: Dict, market = undefined): MarginMode {
        // {
        //     "code": 200,
        //     "msg": "string",
        //     "data": {}
        // }
        return {
            'info': rawMarginMode,
            'symbol': market['symbol'],
            'marginMode': undefined,
        } as MarginMode;
    }

    /**
     * @method
     * @name uzx#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://uzx.com/v2/api/docs/en/index.html#23311276kbja
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by bitget setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'pos_mode': hedged ? 1 : 2,
        };
        const response = await this.privatePutV2TradeSwapConfigSetPosMod (this.extend (request, params));
        // {
        //     "code": 200,
        //     "msg": "string",
        //     "data": {}
        // }
        return response;
    }

    /**
     * @method
     * @name uzx#fetchOrder
     * @description fetch an order
     * @see https://uzx.com/v2/api/docs/en/index.html#5cb2f719s0ff
     * @see https://uzx.com/v2/api/docs/en/index.html#e46ef59f2kvr
     * @param {string} id Order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] exchange specific parameters
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const isOpenOrder = this.safeBool (params, 'open', false);
        params = this.omit (params, 'open');
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const request: Dict = {
            'ins_type': marketType.toUpperCase (),
            'order_id': id,
        };
        let response = undefined;
        if (!isOpenOrder) {
            response = await this.privateGetV2TradeHistoryOrderDetails (this.extend (request, params));
        } else {
            response = await this.privateGetV2TradeOrderDetails (this.extend (request, params));
        }
        //
        // {
        //     "code": 200,
        //     "msg": "success",
        //     "data": {
        //       "product_name": "BTCUSDT",
        //       "order_id": "2517920520600050556",
        //       "mgn_mode": 1,
        //       "pos_side": "ST",
        //       "order_mode": 1,
        //       "pos_mode": 1,
        //       "order_type": 2,
        //       "pos_opt": 1,
        //       "leverage": 5,
        //       "order_buy_or_sell": 2,
        //       "number": 2,
        //       "amount": "0",
        //       "deal_number": 2,
        //       "lock_base_amount": "0",
        //       "lock_quote_amount": "0",
        //       "filled_quote_amount": "0",
        //       "price": "107775",
        //       "status": 4,
        //       "avg_price": "107775",
        //       "deal_fee": "0.012933",
        //       "income": "0",
        //       "created_at": 1751101108310,
        //       "finish_at": 1751101108340,
        //       "ins_type": "SWAP",
        //       "algo_info": "[]",
        //       "coin": "USDT",
        //       "bills": [
        //         {
        //           "bill_id": "43786-2517920520600050556-2517720520600573709",
        //           "product_name": "",
        //           "order_id": "2517920520600050556",
        //           "position_id": "205206000000000017",
        //           "mgn_mode": 1,
        //           "role": "taker",
        //           "order_mode": 1,
        //           "pos_side": "ST",
        //           "pos_opt": 1,
        //           "filled_amount": "1",
        //           "price": "107775",
        //           "fee": "0.0064665",
        //           "margin": "2.1619665",
        //           "leverage": 5,
        //           "income": "0",
        //           "taker_fee": "0.0006",
        //           "maker_fee": "0.0004",
        //           "order_buy_or_sell": 2,
        //           "created_at": 1751101108324,
        //           "ins_type": "SWAP",
        //           "order_type": 2
        //         },
        //       ]
        //     }
        // }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name uzx#fetchOpenOrder
     * @description fetch an open order
     * @see https://uzx.com/v2/api/docs/en/index.html#5cb2f719s0ff
     * @param {string} id Order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] exchange specific parameters
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder (id: string, symbol: Str = undefined, params = {}) {
        const request: Dict = {
            'open': true,
        };
        return this.fetchOrder (id, symbol, this.extend (params, request));
    }

    /**
     * @method
     * @name uzx#fetchClosedOrder
     * @description fetch a closed order
     * @see https://uzx.com/v2/api/docs/en/index.html#5cb2f719s0ff
     * @param {string} id Order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] exchange specific parameters
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrder (id: string, symbol: Str = undefined, params = {}) {
        const request: Dict = {
            'open': false,
        };
        return this.fetchOrder (id, symbol, this.extend (params, request));
    }

    /**
     * @method
     * @name uzx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://uzx.com/v2/api/docs/en/index.html#55b61fcedy6e
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const request: Dict = {
            'ins_type': marketType.toUpperCase (),
        };
        if (symbol !== undefined) {
            request['product_name'] = market['id'];
        }
        const response = await this.privateGetV2TradeOrders (this.extend (request, params));
        //
        // {
        //     "code": 200,
        //     "msg": "success",
        //     "data": [
        //       {
        //         "product_name": "BTC-USDT",
        //         "order_id": "2517910362100040465",
        //         "mgn_mode": 0,
        //         "pos_side": "",
        //         "order_mode": 0,
        //         "pos_mode": 0,
        //         "order_type": 2,
        //         "pos_opt": 0,
        //         "leverage": 0,
        //         "order_buy_or_sell": 1,
        //         "number": 0,
        //         "amount": "",
        //         "deal_number": 0,
        //         "lock_base_amount": "0.001",
        //         "lock_quote_amount": "109.52972",
        //         "filled_quote_amount": "0",
        //         "price": "109529.72",
        //         "status": 0,
        //         "avg_price": "0",
        //         "deal_fee": "0",
        //         "income": "0",
        //         "created_at": 1751100684192,
        //         "finish_at": 1751100684208,
        //         "ins_type": "SPOT",
        //         "algo_info": null,
        //         "coin": "USDT",
        //         "un_filled_amount": 0
        //       }
        //     ]
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name uzx#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://uzx.com/v2/api/docs/en/index.html#917019abfjua
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, max 20
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.marketType] 'spot' or 'swap'
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        let request: Dict = {
            // ins_type    query    string    No    Product type    SPOT - Spot, SWAP - USDT-margined, BASE - Coin-margined
            // product_name    query    string    No    Product name
            // begin    query    integer    No    Start timestamp    Millisecond
            // end    query    integer    No    End timestamp    Millisecond
            // limit    query    integer    No    Number of records    Default 20, max 20
        };
        if (symbol !== undefined) {
            request['product_name'] = market['id'];
        }
        if (since !== undefined) {
            request['begin'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (marketType !== undefined) {
            request['ins_type'] = marketType.toUpperCase ();
        }
        [ request, params ] = this.handleUntilOption ('end', request, params);
        const response = await this.privateGetV2TradeHistoryOrders (this.extend (request, params));
        //
        // {
        //     "code": 200,
        //     "msg": "success",
        //     "data": [
        //       {
        //         "product_name": "BTCUSDT",
        //         "order_id": "2518220520600100009",
        //         "mgn_mode": 1,
        //         "pos_side": "ST",
        //         "order_mode": 1,
        //         "pos_mode": 1,
        //         "order_type": 14,
        //         "pos_opt": 0,
        //         "leverage": 5,
        //         "order_buy_or_sell": 2,
        //         "number": 2,
        //         "amount": "0.00015734",
        //         "deal_number": 0,
        //         "lock_base_amount": "0",
        //         "lock_quote_amount": "0",
        //         "filled_quote_amount": "0",
        //         "price": "107775",
        //         "status": 4,
        //         "avg_price": "0",
        //         "deal_fee": "0",
        //         "income": "0",
        //         "created_at": 1751414400845,
        //         "finish_at": 1751414400876,
        //         "ins_type": "SWAP",
        //         "algo_info": "[]",
        //         "coin": "USDT"
        //       }
        //     ]
        //   }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name uzx#cancelOrder
     * @description cancels an open order
     * @see https://uzx.com/v2/api/docs/en/index.html#87125442dwdb
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stop] true for stop loss or take profit order
     * @param {boolean} [params.scheduled] true for scheduled order
     * @param {boolean} [params.trailing] true for trailing stop loss or take profit order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const stop = this.safeBool (params, 'stop');
        const scheduled = this.safeBool (params, 'scheduled');
        const trailing = this.safeBool (params, 'trailing');
        let cancelOrdType = 1;
        if (stop) {
            cancelOrdType = 2;
        } else if (scheduled) {
            cancelOrdType = 3;
        } else if (trailing) {
            cancelOrdType = 4;
        }
        const request: Dict = {
            'inst_type': (marketType === 'spot') ? 1 : 2,
            'cancel_ord_type': cancelOrdType,
            'order_id': id,
        };
        const response = await this.privatePutV2TradeCancelOrder (this.extend (request, params));
        //
        // {
        //     "code": 200,
        //     "msg": "string",
        //     "data": {}
        // }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name uzx#cancelAllOrders
     * @description cancel all open orders
     * @see https://uzx.com/v2/api/docs/en/index.html#e3294bbap53z
     * @param ids
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stop] true for stop loss or take profit order
     * @param {boolean} [params.scheduled] true for scheduled order
     * @param {boolean} [params.trailing] true for trailing stop loss or take profit order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrders', market, params);
        const stop = this.safeBool (params, 'stop');
        const scheduled = this.safeBool (params, 'scheduled');
        const trailing = this.safeBool (params, 'trailing');
        let cancelOrdType = 1;
        if (stop) {
            cancelOrdType = 2;
        } else if (scheduled) {
            cancelOrdType = 3;
        } else if (trailing) {
            cancelOrdType = 4;
        }
        const request: Dict = {
            'cancel_ord_type': cancelOrdType,
            'order_ids': ids,
            'inst_type': (marketType === 'spot') ? 1 : 2,
        };
        const response = await this.privatePutV2TradeCancelBatchOrder (this.extend (request, params));
        //
        // {
        //     "code": 200,
        //     "msg": "success",
        //     "data": [
        //       {
        //         "code": 200,
        //         "order_id": "2509820413501205367"
        //       },
        //     ]
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market);
    }

    /**
     * @method
     * @name uzx#fetchWithdrawals
     * @description fetch history of withdrawals
     * @see https://uzx.com/v2/api/docs/en/index.html#e90e0d7cxfl2
     * @see https://uzx.com/v2/api/docs/en/index.html#c7007335sq6q
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal
     * @param {int} [limit] max number of deposit/withdrawals to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        const request: Dict = {
            'bill_type': 2,
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name uzx#fetchDeposits
     * @description fetch history of deposits
     * @see https://uzx.com/v2/api/docs/en/index.html#e90e0d7cxfl2
     * @see https://uzx.com/v2/api/docs/en/index.html#c7007335sq6q
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal
     * @param {int} [limit] max number of deposit/withdrawals to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        const request: Dict = {
            'bill_type': 1,
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name uzx#fetchTransactions
     * @description fetch history of transactions
     * @see https://uzx.com/v2/api/docs/en/index.html#e90e0d7cxfl2
     * @see https://uzx.com/v2/api/docs/en/index.html#c7007335sq6q
     * @param {string} [code] unified currency code for the currency of the transactions
     * @param {int} [since] timestamp in ms of the earliest transaction
     * @param {int} [limit] max number of transactions to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchTransactions (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const currency = (code !== undefined) ? this.currency (code) : undefined;
        let request: Dict = {
            // bill_type    query    integer    No    Bill type
            // begin    query    integer    No    Start timestamp (ms)
            // end    query    integer    No    End timestamp (ms)
            // limit    query    integer    No    Pagination limit (default: 20)
        };
        if (since !== undefined) {
            request['begin'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('end', request, params);
        const response = this.privateGetV2AssetBills (this.extend (request, params));
        //
        //    {
        //        "code": 200,
        //        "msg": "success",
        //        "data": [
        //          {
        //            "coin_name": "USDT",
        //            "bill_type": 4,
        //            "trade_direction": 2,
        //            "amount": "1000000",
        //            "note": "转出至交易账户",
        //            "created_at": 1751423748815,
        //            "log_id": "b2fa280e-2042-462e-9999-ed9e041026e9"
        //          }
        //        ]
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    /**
     * @method
     * @name uzx#fetchTransfers
     * @description fetch history of transfers
     * @see https://uzx.com/v2/api/docs/en/index.html#e90e0d7cxfl2
     * @see https://uzx.com/v2/api/docs/en/index.html#c7007335sq6q
     * @param {string} [code] unified currency code for the currency of the transactions
     * @param {int} [since] timestamp in ms of the earliest transaction
     * @param {int} [limit] max number of transactions to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        const currency = (code !== undefined) ? this.currency (code) : undefined;
        const request: Dict = {
            'type': 'trading',
            'bill_type': 6,
        };
        const response = await this.fetchAccountStatements (code, since, limit, this.extend (request, params));
        // [
        //        {
        //            "ins_type": "SWAP",
        //            "product_name": "BTCUSDT",
        //            "coin_name": "USDT",
        //            "bill_type": 4,
        //            "sub_bill_type": 16,
        //            "mgn_mode": 1,
        //            "role": "",
        //            "trade_direction": 1,
        //            "amount": "0.00023325",
        //            "experience_amount": "0",
        //            "fee_amount": "0",
        //            "price": "0",
        //            "income": "0",
        //            "created_at": 1751443200823850,
        //            "log_id": "c638cd39-9a37-4935-b119-2e394adc71e1"
        //        },
        //  ]
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //    {
        //        "coin_name": "USDT",
        //        "bill_type": 4,
        //        "trade_direction": 2,
        //        "amount": "1000000",
        //        "note": "转出至交易账户",
        //        "created_at": 1751423748815,
        //        "log_id": "b2fa280e-2042-462e-9999-ed9e041026e9"
        //    }
        //
        const timestamp = this.safeTimestamp (transaction, 'created_at');
        const currencyId = this.safeString (transaction, 'coin_name');
        currency = this.safeCurrency (currencyId, currency);
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'log_id'),
            'currency': currency['code'],
            'amount': this.safeNumber (transaction, 'amount'),
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'status': undefined,
            'type': this.parseFundingAccountBillMainTypes (this.safeString (transaction, 'bill_type')),
            'updated': undefined,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'comment': this.safeString (transaction, 'note'),
            'internal': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
                'rate': undefined,
            },
        };
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined) {
        //        {
        //            "ins_type": "SWAP",
        //            "product_name": "BTCUSDT",
        //            "coin_name": "USDT",
        //            "bill_type": 4,
        //            "sub_bill_type": 16,
        //            "mgn_mode": 1,
        //            "role": "",
        //            "trade_direction": 1,
        //            "amount": "0.00023325",
        //            "experience_amount": "0",
        //            "fee_amount": "0",
        //            "price": "0",
        //            "income": "0",
        //            "created_at": 1751443200823850,
        //            "log_id": "c638cd39-9a37-4935-b119-2e394adc71e1"
        //        },
        const timestamp = this.safeInteger (transfer, 'created_at') / 1000;
        currency = this.safeCurrency (this.safeString (transfer, 'coin_name'), currency);
        const subBillType = this.safeString (transfer, 'sub_bill_type');
        return {
            'id': this.safeString (transfer, 'coin_name'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeString (currency, 'code'),
            'amount': this.safeFloat (transfer, 'amount'),
            'fromAccount': (subBillType === '17') ? 'funding' : 'trading',
            'toAccount': (subBillType === '17') ? 'trading' : 'funding',
            'status': undefined,
            'info': transfer,
        };
    }

    async fetchAccountStatements (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<any[]> {
        await this.loadMarkets ();
        let request: Dict = {
            // bill_type    query    integer    No    Main Bill Type    See Enumeration
            // begin    query    integer    No    Start Timestamp    Millisecond
            // end    query    integer    No    End Timestamp    Millisecond
            // limit    query    integer    No    Number of Records    Default: 20, Max: 20
            // Trading account only params
            // ins_type    query    string    No    Instrument Type    SPOT - Spot, SWAP - USDt-denominated, OTHER_BILL - Other
            // coin    query    string    No    Coin Name    None
            // sub_bill_type    query    integer    No    Sub Bill Type    See Enumeration
        };
        const type = this.safeString (params, 'type');
        params = this.omit (params, [ 'type' ]);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchLedger', undefined, params);
        if (marketType !== undefined) {
            request['ins_type'] = marketType;
        }
        if (since !== undefined) {
            request['begin'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('end', request, params);
        let response = undefined;
        if (type === 'trading') {
            response = await this.privateGetV2AccountBills (this.extend (request, params));
            //
            //    {
            //        "code": 200,
            //        "msg": "success",
            //        "data": [
            //        {
            //            "ins_type": "SWAP",
            //            "product_name": "BTCUSDT",
            //            "coin_name": "USDT",
            //            "bill_type": 4,
            //            "sub_bill_type": 16,
            //            "mgn_mode": 1,
            //            "role": "",
            //            "trade_direction": 1,
            //            "amount": "0.00023325",
            //            "experience_amount": "0",
            //            "fee_amount": "0",
            //            "price": "0",
            //            "income": "0",
            //            "created_at": 1751443200823850,
            //            "log_id": "c638cd39-9a37-4935-b119-2e394adc71e1"
            //        },
            //        ]
            //    }
            //
        } else {
            response = await this.privateGetV2AssetBills (this.extend (request, params));
            //
            //    {
            //        "code": 200,
            //        "msg": "success",
            //        "data": [
            //          {
            //            "coin_name": "USDT",
            //            "bill_type": 4,
            //            "trade_direction": 2,
            //            "amount": "1000000",
            //            "note": "转出至交易账户",
            //            "created_at": 1751423748815,
            //            "log_id": "b2fa280e-2042-462e-9999-ed9e041026e9"
            //          }
            //        ]
            //    }
            //
        }
        return this.safeList (response, 'data', []);
    }

    /**
     * @method
     * @name uzx#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://uzx.com/v2/api/docs/en/index.html#c7007335sq6q funding
     * @see https://uzx.com/v2/api/docs/en/index.html#e90e0d7cxfl2 trading
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        const currency = (code !== undefined) ? this.currency (code) : undefined;
        const response = await this.fetchAccountStatements (code, since, limit, params);
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        // funding
        //        {
        //            "coin_name": "USDT",
        //            "bill_type": 4,
        //            "trade_direction": 2,
        //            "amount": "1000000",
        //            "note": "转出至交易账户",
        //            "created_at": 1751423748815,
        //            "log_id": "b2fa280e-2042-462e-9999-ed9e041026e9"
        //          }
        // trading
        //        {
        //            "ins_type": "SWAP",
        //            "product_name": "BTCUSDT",
        //            "coin_name": "USDT",
        //            "bill_type": 4,
        //            "sub_bill_type": 16,
        //            "mgn_mode": 1,
        //            "role": "",
        //            "trade_direction": 1,
        //            "amount": "0.00023325",
        //            "experience_amount": "0",
        //            "fee_amount": "0",
        //            "price": "0",
        //            "income": "0",
        //            "created_at": 1751443200823850,
        //            "log_id": "c638cd39-9a37-4935-b119-2e394adc71e1"
        //        },
        //
        const currencyId = this.safeString (item, 'coin_name');
        currency = this.safeCurrency (currencyId, currency);
        let timestamp = this.safeInteger (item, 'created_at');
        if (timestamp > 1000000000000) {
            timestamp = timestamp / 1000;
        }
        const billType = this.safeString (item, 'bill_type');
        const subBillType = this.safeString (item, 'sub_bill_type');
        const isFunding = (subBillType === undefined);
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'id'),
            'currency': currency['code'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': this.safeString (item, 'trade_direction'),
            'account': (subBillType === undefined) ? 'funding' : 'trading',
            'referenceAccount': undefined,
            'referenceId': undefined,
            'type': isFunding ? this.parseFundingAccountBillMainTypes (billType) : this.parseTradingAccountBillMainTypes (billType),
            'amount': this.safeString (item, 'amount'),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': {
                'currency': this.safeString (currency, 'code'),
                'cost': this.safeString (item, 'fee_amount'),
                'rate': undefined,
            },
        }, currency) as LedgerEntry;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const requestPath = this.implodeParams (path, params);
        let url = this.urls['api'][api] + requestPath;
        const requestPayloadString = this.json (params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.seconds ().toString ();
            const queryString = (method === 'GET') ? this.urlencode (params) : '';
            const fullPath = queryString ? requestPath + '?' + queryString : requestPath;
            let message = timestamp + method + fullPath;
            if (method !== 'GET') {
                body = this.json (params);
                message = message + requestPayloadString;
            }
            const signature = this.hmac (this.encode (message), this.encode (this.secret), sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'UZX-ACCESS-KEY': this.apiKey,
                'UZX-ACCESS-SIGN': signature,
                'UZX-ACCESS-TIMESTAMP': timestamp,
                'UZX-ACCESS-PASSPHRASE': this.password,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // TODO
        return reason;
    }
}
