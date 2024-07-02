//  ---------------------------------------------------------------------------

import Exchange from './abstract/bit2me.js';
import { BadRequest, InsufficientFunds, InvalidOrder, OrderNotFound, InvalidNonce, RateLimitExceeded, ExchangeError, OnMaintenance, NotSupported, CancelPending, OperationFailed, BadSymbol, AuthenticationError, PermissionDenied } from './base/errors.js';
import { DECIMAL_PLACES, ROUND } from './base/functions/number.js';
import Precise from './base/Precise.js';
import type { Balances, Dict, Int, Market, MarketInterface, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';

//  ---------------------------------------------------------------------------

/**
 * @class bit2me
 * @augments Exchange
 */
export default class bit2me extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bit2me',
            'name': 'Bit2Me',
            'countries': [ 'ES' ], // Spain
            'rateLimit': 300,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
                'ws': false,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '4h': 240,
                '1d': 1440,
            },
            'urls': {
                'logo': 'https://bit2me.com/assets/img/logos/fullblue/bit2me-blue_bg-white.png',
                'api': {
                    'public': 'https://gateway.bit2me.com',
                    'private': 'https://gateway.bit2me.com',
                },
                'www': 'https://bit2me.com',
                'doc': [
                    'https://api.bit2me.com',
                    'https://github.com/bit2me-devs/trading-spot-samples',
                ],
                'fees': 'https://support.bit2me.com/en/support/solutions/articles/35000172197-what-are-the-fees-for-the-bit2me-pro-service-',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'v1/trading/market-config',
                        'v1/trading/candle',
                        'v2/trading/order-book',
                        'v2/trading/tickers',
                        'v1/trading/trade/last',
                    ],
                },
                'private': {
                    'get': [
                        'v1/trading/order',
                        'v1/trading/order/{uuid}',
                        'v1/trading/order/{uuid}/trades',
                        'v1/trading/trade',
                        'v1/trading/wallet/balance',
                    ],
                    'post': [
                        'v1/trading/order',
                    ],
                    'delete': [
                        'v1/trading/order/{uuid}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0026'),
                    'maker': this.parseNumber ('0.0016'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.006') ],
                            [ this.parseNumber ('2001'), this.parseNumber ('0.003') ],
                            [ this.parseNumber ('50001'), this.parseNumber ('0.0026') ],
                            [ this.parseNumber ('250001'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('500001'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('1000001'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('5000001'), this.parseNumber ('0.0013') ],
                            [ this.parseNumber ('25000001'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('75000001'), this.parseNumber ('0.0011') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.001') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.005') ],
                            [ this.parseNumber ('2001'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('50001'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('250001'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('500001'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('1000001'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('5000001'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('25000001'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('75000001'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.0') ],
                        ],
                    },
                },
            },
            'precisionMode': DECIMAL_PLACES,
            'exceptions': {
                'exact': {
                    'AMOUNT_PRECISION_EXCEEDED': InvalidOrder,
                    'BUY_PRICE_IS_ABOVE_INITIAL_PRICE': InvalidOrder,
                    'BUY_STOP_PRICE_IS_BELOW_INITIAL_PRICE': InvalidOrder,
                    'CREATE_ORDERS_DISABLED_TEMPORALLY': OnMaintenance,
                    'CURRENCY_NOT_SUPPORTED': NotSupported,
                    'DELETE_CLOSED_ORDER': CancelPending,
                    'DELETE_ORDERS_DISABLED_TEMPORALLY': OnMaintenance,
                    'DEPOSITS_DISABLED_TEMPORALLY': OnMaintenance,
                    'ERROR_CREATING_INTERNAL_ORDER': InvalidOrder,
                    'MARKET_CONFIG_NOT_FOUND': BadRequest,
                    'MAX_CREATED_ORDERS_REACHED': InvalidOrder,
                    'MAX_OPEN_ORDERS_REACHED': InvalidOrder,
                    'NOT_ENOUGH_BALANCE': InsufficientFunds,
                    'NOT_ENOUGH_LIQUIDITY': OperationFailed,
                    'ORDER_AMOUNT_GREATER_MARKET_MAX': InvalidOrder,
                    'ORDER_AMOUNT_LOWER_EQUAL_ZERO': InvalidOrder,
                    'ORDER_PRICE_LOWER_EQUAL_ZERO': InvalidOrder,
                    'ORDER_SIZE_LOWER_MARKET_MIN': InvalidOrder,
                    'PRICE_GREATER_MARKET_MAX': InvalidOrder,
                    'ORDER_STOP_PRICE_LOWER_EQUAL_ZERO': InvalidOrder,
                    'PRICE_LOWER_MARKET_MIN': InvalidOrder,
                    'PRICE_PRECISION_EXCEEDED': InvalidOrder,
                    'ONLY_LIMIT_ORDERS_ALLOWED': OnMaintenance,
                    'ORDER_AMOUNT_GREATER_TOTAL_AMOUNT_IN_PURCHASE': InvalidOrder,
                    'ORDER_AMOUNT_GREATER_TOTAL_AMOUNT_IN_SALE': InvalidOrder,
                    'ORDER_AMOUNT_LOWER_MARKET_MIN': InvalidOrder,
                    'SELL_PRICE_IS_BELOW_INITIAL_PRICE': InvalidOrder,
                    'SELL_STOP_PRICE_IS_ABOVE_INITIAL_PRICE': InvalidOrder,
                    'TIME_IN_FORCE_INVALID': BadRequest,
                    'TRADING_WALLET_NOT_BALANCE': InsufficientFunds,
                    'TRADING_WALLET_NOT_FOUND': OperationFailed,
                    'USER_IS_ALREADY_CREATING_ORDER': RateLimitExceeded,
                    'WITHDRAWS_DISABLED_TEMPORALLY': OnMaintenance,
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    market (symbol: string): MarketInterface {
        if (this.markets === undefined) {
            throw new ExchangeError (this.id + ' markets not loaded');
        }
        if (typeof symbol === 'string') {
            if (symbol in this.markets) {
                const market = this.markets[symbol];
                return market;
            }
        }
        throw new BadSymbol (this.id + ' does not have market symbol ' + symbol);
    }

    parseMarket (market): Market {
        //
        //     {
        //         "id": "767a9906-3757-4d9c-8d90-504eb0a35a18",
        //         "symbol": "BTC/EUR",
        //         "minAmount": 0.0001,
        //         "maxAmount": 20,
        //         "minPrice": 1000,
        //         "maxPrice": 1000000,
        //         "minOrderSize": 1,
        //         "tickSize": 0.000001,
        //         "pricePrecision": 4,
        //         "amountPrecision": 6,
        //         "initialPrice": 0,
        //         "marketEnabled": "enabled",
        //         "marketEnabledAt": null
        //     }
        //
        const marketId = this.safeString (market, 'symbol');
        const parts = marketId.split ('/');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const status = this.safeString (market, 'marketEnabled');
        let isActive = status === 'enabled';
        const enabledAtDatetime = this.safeString (market, 'marketEnabledAt');
        let created = undefined;
        if (status === 'enabled_at' && enabledAtDatetime !== undefined) {
            created = this.parse8601 (enabledAtDatetime);
            if (created < this.milliseconds ()) {
                isActive = true;
            }
        }
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'baseId': baseId,
            'quote': quote,
            'quoteId': quoteId,
            'settle': undefined,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'minAmount'),
                    'max': this.safeNumber (market, 'maxAmount'),
                },
                'price': {
                    'min': this.safeNumber (market, 'minPrice'),
                    'max': this.safeNumber (market, 'maxPrice'),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'precision': {
                'price': this.safeInteger (market, 'pricePrecision'),
                'amount': this.safeInteger (market, 'amountPrecision'),
            },
            'active': isActive,
            'created': created,
            'info': market,
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name bit2me#fetchMarkets
         * @description retrieves data on all markets for bit2me
         * @see https://api.bit2me.com/trading-spot-rest#tag/MarketData/paths/~1v1~1trading~1market-config/get
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/market-data/get-markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV1TradingMarketConfig (params);
        //
        //     [
        //         {
        //             "id": "767a9906-3757-4d9c-8d90-504eb0a35a18",
        //             "symbol": "BTC/EUR",
        //             "minAmount": 0.0001,
        //             "maxAmount": 20,
        //             "minPrice": 1000,
        //             "maxPrice": 1000000,
        //             "minOrderSize": 1,
        //             "tickSize": 0.000001,
        //             "pricePrecision": 4,
        //             "amountPrecision": 6,
        //             "initialPrice": 0,
        //             "marketEnabled": "enabled",
        //             "marketEnabledAt": null
        //         }
        //     ]
        //
        return this.parseMarkets (response);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "timestamp": 1715081606087,
        //         "symbol": "BTC/EUR",
        //         "open": 59692.2,
        //         "close": 59459.3,
        //         "bid": 59459.3,
        //         "ask": 59459.4,
        //         "high": 59807.8,
        //         "low": 58259,
        //         "baseVolume": 506.2471485105999,
        //         "percentage": -0.39,
        //         "quoteVolume": 30160053.557880376
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, 'close'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.decimalToPrecision (this.safeString (ticker, 'percentage'), ROUND, 2),
            'average': undefined,
            'baseVolume': this.decimalToPrecision (this.safeString (ticker, 'baseVolume'), ROUND, 4),
            'quoteVolume': this.decimalToPrecision (this.safeString (ticker, 'quoteVolume'), ROUND, 4),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bit2me#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.bit2me.com/trading-spot-rest#tag/MarketData/paths/~1v2~1trading~1tickers/get
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/market-data/get-ticker-information
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV2TradingTickers (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp": 1715081606087,
        //             "symbol": "BTC/EUR",
        //             "open": 59692.2,
        //             "close": 59459.3,
        //             "bid": 59459.3,
        //             "ask": 59459.4,
        //             "high": 59807.8,
        //             "low": 58259,
        //             "baseVolume": 506.2471485105999,
        //             "percentage": -0.39,
        //             "quoteVolume": 30160053.557880376
        //         }
        //     ]
        //
        const ticker = this.safeValue (response, 0, {});
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name bit2me#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api.bit2me.com/trading-spot-rest#tag/MarketData/paths/~1v2~1trading~1tickers/get
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/market-data/get-ticker-information
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        params = this.omit (params, [ 'symbol' ]);
        const response = await this.publicGetV2TradingTickers (params);
        //
        //     [
        //         {
        //             "timestamp": 1715081606087,
        //             "symbol": "BTC/EUR",
        //             "open": 59692.2,
        //             "close": 59459.3,
        //             "bid": 59459.3,
        //             "ask": 59459.4,
        //             "high": 59807.8,
        //             "low": 58259,
        //             "baseVolume": 506.2471485105999,
        //             "percentage": -0.39,
        //             "quoteVolume": 30160053.557880376
        //         }
        //     ]
        //
        const tickers = [];
        for (let i = 0; i < response.length; i++) {
            const rawTicker = this.safeDict (response, i, {});
            const marketId = this.safeString (rawTicker, 'symbol');
            const market = this.safeMarket (marketId);
            const ticker = this.parseTicker (rawTicker, market);
            tickers.push (ticker);
        }
        return this.filterByArrayTickers (tickers, 'symbol', symbols);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bit2me#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://api.bit2me.com/trading-spot-rest#tag/MarketData/paths/~1v2~1trading~1order-book/get
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/market-data/get-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV2TradingOrderBook (this.extend (request, params));
        //
        //    {
        //         "bids": [
        //             [
        //                 63614.1,
        //                 0.05
        //             ],
        //             [
        //                 63614,
        //                 0.01511771
        //             ]
        //         ],
        //         "asks": [
        //             [
        //                 63614.2,
        //                 0.0049614
        //             ],
        //             [
        //                 63624.8,
        //                 0.057
        //             ]
        //          ],
        //          "timestamp": 1715871588147,
        //          "symbol": "BTC/EUR"
        //    }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        const bids = this.safeValue (response, 'bids');
        const asks = this.safeValue (response, 'asks');
        const orderBook = {
            'bids': bids,
            'asks': asks,
        };
        return this.parseOrderBook (orderBook, symbol, timestamp, 'bids', 'asks');
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //         [
        //             1712494800000,
        //             69321.2,
        //             69492,
        //             69294.3,
        //             69346.9,
        //             1.58942378
        //         ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bit2me#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api.bit2me.com/trading-spot-rest#tag/MarketData/paths/~1v1~1trading~1candle/get
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/market-data/get-ohlcv
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const maxLimit = 1000;
        if (since === undefined) {
            since = this.milliseconds () - 86400 * 1000; // last 24 hrs,
        }
        const until = this.safeInteger (params, 'endTime', this.milliseconds ());
        limit = (limit === undefined) ? maxLimit : Math.min (limit, maxLimit);
        const request = {
            'symbol': symbol,
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
            'startTime': since,
            'endTime': until,
            'limit': limit,
        };
        const response = await this.publicGetV1TradingCandle (this.extend (request, params));
        //
        //     [
        //         [
        //             1712494800000,
        //             69321.2,
        //             69492,
        //             69294.3,
        //             69346.9,
        //             1.58942378
        //         ],
        //         [
        //             1712498400000,
        //             69344.3,
        //             69637.2,
        //             69225.8,
        //             69583.7,
        //             8.52748622
        //         ]
        //     ]
        //
        if (Array.isArray (response)) {
            return this.parseOHLCVs (response, market, timeframe, since, limit);
        }
        return [];
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'inactive': 'open', // order pending book entry
            'filled': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (orderType) {
        const types = {
            'market': 'market',
            'limit': 'limit',
            'stop-limit': 'limit',
        };
        return this.safeString (types, orderType, orderType);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // createOrder
        //         {
        //             "id": "12de6246-10dd-48ae-a17f-e9bdea46b8c9",
        //             "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96",
        //             "side": "buy",
        //             "symbol": "B2M/EUR",
        //             "price": "0.25",
        //             "orderAmount": "1000",
        //             "filledAmount": "0",
        //             "status": "open",
        //             "orderType": "limit",
        //             "cost": "0",
        //             "createdAt": "2024-05-23T10:14:04.483Z",
        //             "updatedAt": "2024-05-23T10:14:04.483Z",
        //             "stopPrice": "0",
        //             "clientOrderId": null,
        //             "cancelReason": null,
        //             "timeInForce": "GTC"
        //         }
        //
        let timestamp: Int = undefined;
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const dateTime = this.safeString (order, 'updatedAt');
        if (dateTime !== undefined) {
            timestamp = this.parse8601 (dateTime);
        }
        const side = this.safeString (order, 'side');
        const amount = this.safeString (order, 'orderAmount');
        const price = this.safeString (order, 'price');
        const stopPrice = this.safeString (order, 'stopPrice');
        const symbol = this.safeString (order, 'symbol');
        const type = this.parseOrderType (this.safeString (order, 'orderType'));
        const filled = this.safeString (order, 'filledAmount');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const cost = this.safeString (order, 'cost');
        const postOnly = this.safeBool (order, 'postOnly');
        const timeInForce = this.safeString (order, 'timeInForce');
        return this.safeOrder ({
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
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name bit2me#createOrder
         * @description create a trade order
         * @see https://api.bit2me.com/trading-spot-rest#tag/Trading/paths/~1v1~1trading~1order/post
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/trading/add-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit' or 'stop-limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = type.toLowerCase ();
        const isLimitOrder = orderType.endsWith ('limit'); // supporting limit, stop-limit.
        const orderSide = side.toLowerCase ();
        const request = {
            'symbol': market['id'],
            'side': orderSide,
            'orderType': orderType,
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (isLimitOrder) {
            request['price'] = this.priceToPrecision (symbol, price);
            if (orderType === 'stop-limit') {
                const stopPrice = this.safeString (params, 'stopPrice');
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        params = this.omit (params, [ 'stopPrice' ]);
        const response = await this.privatePostV1TradingOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bit2me#cancelOrder
         * @description cancels an open order
         * @see https://api.bit2me.com/trading-spot-rest#tag/Trading/paths/~1v1~1trading~1order~1%7Bid%7D/delete
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'uuid': id,
        };
        let response = undefined;
        try {
            response = await this.privateDeleteV1TradingOrderUuid (this.extend (request, params));
        } catch (e) {
            if (this.last_json_response && this.last_json_response['statusCode'] === '404') {
                throw new OrderNotFound (this.id + ' cancelOrder() error ' + this.last_http_response);
            }
            throw e;
        }
        return this.parseOrder (response);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bit2me#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://api.bit2me.com/trading-spot-rest#tag/Trading/paths/~1v1~1trading~1order~1%7Bid%7D/get
         * @param {string} symbol not used by bit2me fetchOrder ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'uuid': id,
        };
        let response = undefined;
        try {
            response = await this.privateGetV1TradingOrderUuid (this.extend (request, params));
        } catch (e) {
            if (this.last_json_response && this.last_json_response['statusCode'] === '404') {
                throw new OrderNotFound (this.id + ' fetchOrder() error ' + this.last_http_response);
            }
            throw e;
        }
        return this.parseOrder (response);
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bit2me#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://api.bit2me.com/trading-spot-rest#tag/Trading/paths/~1v1~1trading~1order/get
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/trading/get-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {
        };
        const startTime = this.safeString (params, 'startTime');
        const endTime = this.safeString (params, 'endTime', this.milliseconds ().toString ());
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (startTime !== undefined) {
            request['startTime'] = this.iso8601 (startTime);
            request['endTime'] = this.iso8601 (endTime);
        }
        if (since !== undefined) {
            request['startTime'] = this.iso8601 (since);
            request['endTime'] = this.iso8601 (endTime);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        params = this.omit (params, [ 'startTime' ]);
        const orders = await this.privateGetV1TradingOrder (this.extend (request, params));
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bit2me#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://api.bit2me.com/trading-spot-rest#tag/Trading/paths/~1v1~1trading~1order/get
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'status': 'open',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bit2me#fetchClosedOrders
         * @description fetch all unfilled currently closed orders
         * @see https://api.bit2me.com/trading-spot-rest#tag/Trading/paths/~1v1~1trading~1order/get
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'status': 'filled',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseTrade (trade, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'orderId');
        const orderType = this.parseOrderType (this.safeString (trade, 'orderType'));
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const cost = this.safeString (trade, 'cost');
        const updatedAt = this.safeString (trade, 'updatedAt');
        let timestamp: Int = undefined;
        if (updatedAt === undefined) {
            timestamp = this.parse8601 (updatedAt);
        }
        const symbol = market['symbol'];
        const side: Str = this.safeString (trade, 'side');
        const feeString = this.safeString (trade, 'feeAmount');
        const feeCurrency = this.safeString (trade, 'feeCurrency');
        let fee = undefined;
        if (feeString !== undefined && feeCurrency !== undefined) {
            fee = {
                'cost': feeString,
                'currency': feeCurrency,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'symbol': symbol,
            'side': side,
            'type': orderType,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        }, market);
    }

    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bit2me#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://api.bit2me.com/trading-spot-rest#tag/Trading/paths/~1v1~1trading~1order~1%7Bid%7D~1trades/get
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'uuid': id,
        };
        let response = undefined;
        try {
            response = await this.privateGetV1TradingOrderUuidTrades (this.extend (request, params));
        } catch (e) {
            if (this.last_json_response && this.last_json_response['statusCode'] === '404') {
                throw new OrderNotFound (this.id + ' fetchOrder() error ' + this.last_http_response);
            }
            throw e;
        }
        //
        //     [
        //         {
        //             "id": "4278a86a-53e7-4997-9102-01646ae8954a",
        //             "orderId": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //             "symbol": "BTC/EUR",
        //             "side": "buy",
        //             "orderType": "limit",
        //             "price": 65000.5,
        //             "amount": 0.35,
        //             "priceCurrency": "EUR",
        //             "amountCurrency": "BTC",
        //             "createdAt": "2024-05-02T08:58:47.727Z",
        //             "cost": 22750.175,
        //             "costEuro": 22750.175,
        //             "clientOrderId": null,
        //             "feeAmount": 0.0750087,
        //             "feePercentage": 0.3,
        //             "feePercentageDiscount": 0,
        //             "feeCurrency": "EUR"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bit2me#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://api.bit2me.com/trading-spot-rest#tag/Trading/paths/~1v1~1trading~1trade/get
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/trading/get-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request = {
            'sort': 'createdAt',
            'direction': 'desc',
        };
        if (market['id'] !== undefined) {
            request['symbol'] = market['symbol'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 50
        }
        const response = await this.privateGetV1TradingTrade (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data":
        //             [
        //                 {
        //                     "id": "4278a86a-53e7-4997-9102-01646ae8954a",
        //                     "orderId": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //                     "symbol": "BTC/EUR",
        //                     "side": "buy",
        //                     "orderType": "limit",
        //                     "price": 65000.5,
        //                     "amount": 0.35,
        //                     "priceCurrency": "EUR",
        //                     "amountCurrency": "BTC",
        //                     "createdAt": "2024-05-02T08:58:47.727Z",
        //                     "cost": 22750.175,
        //                     "costEuro": 22750.175,
        //                     "clientOrderId": null,
        //                     "feeAmount": 0.0750087,
        //                     "feePercentage": 0.3,
        //                     "feePercentageDiscount": 0,
        //                     "feeCurrency": "EUR"
        //                 }
        //             ]
        //         }
        //     }
        //
        const trades = this.safeList (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseBalance (response): Balances {
        //
        //     [
        //         {
        //             "id": "ec7c234e-b6c0-4c13-b458-b613f3c608f1",
        //             "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96",
        //             "currency": "BTC",
        //             "balance": 0.35,
        //             "blockedBalance": 0,
        //             "createdAt": "2023-09-13T14:05:42.149Z",
        //             "manualFunds": false
        //         }
        //     ]
        //
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const free = this.safeString (balance, 'balance');
            const used = this.safeString (balance, 'blockedBalance');
            account['free'] = free;
            account['used'] = used;
            account['total'] = Precise.stringAdd (free, used);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name bit2me#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://api.bit2me.com/trading-spot-rest#tag/Funding/paths/~1v1~1trading~1wallet~1balance/get
         * @see https://github.com/bit2me-devs/trading-spot-samples/tree/main/node/rest/funding/get-balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const balances = await this.privateGetV1TradingWalletBalance (params);
        //
        //     [
        //         {
        //             "id": "ec7c234e-b6c0-4c13-b458-b613f3c608f1",
        //             "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96",
        //             "currency": "BTC",
        //             "balance": 0.35,
        //             "blockedBalance": 0,
        //             "createdAt": "2023-09-13T14:05:42.149Z"
        //         }
        //     ]
        //
        return this.parseBalance (balances);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (headers === undefined) {
            headers = {};
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let auth = nonce + ':' + url;
            if (method === 'POST') {
                body = this.json (params);
                auth += ':' + body;
            }
            const hashDigest = this.hash (this.encode (auth), sha256, 'binary');
            const secret = this.encode (this.secret);
            const signature = this.hmac (hashDigest, secret, sha512, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'x-nonce': nonce,
                'api-signature': signature,
            };
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 429) {
            throw new RateLimitExceeded (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        // error response in a form:
        //     {
        //         statusCode: '412',
        //         error: 'Precondition Failed',
        //         message: 'The price can not be lower than 0.001',
        //         data: {
        //             statusCode: '412',
        //             error: 'Precondition Failed',
        //             message: 'The price can not be lower than 0.001',
        //             errorPayload: { code: 'PRICE_LOWER_MARKET_MIN', minPrice: '0.001' },
        //             reqId: 'd0953956-424c-45c1-838b-a43bbecfdc8a'
        //         },
        //         reqId: 'd0953956-424c-45c1-838b-a43bbecfdc8a'
        //     }
        if (code >= 400) {
            if (code === 400) {
                throw new BadRequest (this.id + ' ' + body);
            }
            if (body.indexOf ('Invalid nonce') >= 0) {
                throw new InvalidNonce (this.id + ' ' + body);
            }
            if (body.indexOf ('Invalid signature') >= 0) {
                throw new AuthenticationError (this.id + ' ' + body);
            }
            if (body.indexOf ('Request forbidden by administrative rules') >= 0) {
                throw new PermissionDenied (this.id + ' ' + body);
            }
            if (body.indexOf ('Rate limit exceeded') >= 0) {
                throw new RateLimitExceeded (this.id + ' ' + body);
            }
            const feedback = this.id + ' ' + body;
            const data = this.safeValue (response, 'data');
            if (data !== undefined) {
                const errorPayload = this.safeValue (data, 'errorPayload');
                if (errorPayload !== undefined) {
                    const errorCode = this.safeValue (errorPayload, 'code');
                    this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                }
            }
            const message = this.safeValue (response, 'message');
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined; // fallback to the default error handler
    }
}
