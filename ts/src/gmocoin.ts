
//  ---------------------------------------------------------------------------

import Exchange from './abstract/gmocoin.js';
import { ExchangeError, AuthenticationError, ArgumentsRequired, OrderNotFound, InsufficientFunds, InvalidOrder } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Ticker, Tickers, Trade, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class gmocoin
 * @augments Exchange
 */
export default class gmocoin extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'gmocoin',
            'name': 'GMO Coin',
            'countries': [ 'JP' ],
            'version': 'v1',
            'rateLimit': 50,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createOrderWithTakeProfitAndStopLossWs': false,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
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
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchVolatilityHistory': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '10m': '10min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '4h': '4hour',
                '8h': '8hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
                '1M': '1month',
            },
            'urls': {
                'logo': 'https://coin.z.com/corp/en/images/logo.svg',
                'api': {
                    'public': 'https://api.coin.z.com/public',
                    'private': 'https://api.coin.z.com/private',
                },
                'www': 'https://coin.z.com/',
                'doc': 'https://api.coin.z.com/docs/en/',
                'fees': 'https://coin.z.com/en/info/fees/',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/status': 1,
                        'v1/ticker': 1,
                        'v1/orderbooks': 1,
                        'v1/trades': 1,
                        'v1/klines': 1,
                        'v1/symbols': 1,
                    },
                },
                'private': {
                    'get': {
                        'v1/account/margin': 1,
                        'v1/account/assets': 1,
                        'v1/account/tradingVolume': 1,
                        'v1/orders': 1,
                        'v1/activeOrders': 1,
                        'v1/executions': 1,
                        'v1/latestExecutions': 1,
                    },
                    'post': {
                        'v1/order': 1,
                        'v1/changeOrder': 1,
                        'v1/cancelOrder': 1,
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
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
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': true,
                    },
                    'fetchOrder': undefined,
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
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
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'ERR-0001': ExchangeError,           // Internal Server Error
                    'ERR-1001': AuthenticationError,      // Invalid API key
                    'ERR-1002': AuthenticationError,      // Invalid API sign
                    'ERR-1003': AuthenticationError,      // Invalid API timestamp
                    'ERR-5001': InvalidOrder,             // Invalid order
                    'ERR-5002': InvalidOrder,             // Invalid order parameter
                    'ERR-5003': OrderNotFound,            // Order not found
                    'ERR-5011': InsufficientFunds,        // Insufficient funds
                    'ERR-5012': InvalidOrder,             // Exceeds max order size
                },
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name gmocoin#fetchMarkets
     * @description retrieves data on all markets for gmocoin
     * @see https://api.coin.z.com/docs/en/#symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV1Symbols (params);
        //
        //     {
        //         "status": 0,
        //         "data": [
        //             {
        //                 "symbol": "BTC",
        //                 "minOrderSize": "0.0001",
        //                 "maxOrderSize": "5",
        //                 "sizeStep": "0.0001",
        //                 "tickSize": "1",
        //                 "takerFee": "0.0005",
        //                 "makerFee": "0.0005"
        //             }
        //         ],
        //         "responsetime": "2019-03-19T02:15:06.001Z"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (entry): Market {
        //
        // GMO Coin symbols are like "BTC", "ETH", "BTC_JPY", etc.
        // Single currency symbols (like "BTC") are traded against JPY
        // Pair symbols (like "BTC_JPY") explicitly specify the pair
        //
        const symbolId = this.safeString (entry, 'symbol');
        let baseId = undefined;
        let quoteId = undefined;
        if (symbolId.indexOf ('_') >= 0) {
            const parts = symbolId.split ('_');
            baseId = this.safeString (parts, 0);
            quoteId = this.safeString (parts, 1);
        } else {
            baseId = symbolId;
            quoteId = 'JPY';
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return {
            'id': symbolId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber (entry, 'takerFee'),
            'maker': this.safeNumber (entry, 'makerFee'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (entry, 'sizeStep'),
                'price': this.safeNumber (entry, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (entry, 'minOrderSize'),
                    'max': this.safeNumber (entry, 'maxOrderSize'),
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
            'info': entry,
        };
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "ask": "750760",
        //         "bid": "750600",
        //         "high": "762302",
        //         "last": "756662",
        //         "low": "704874",
        //         "symbol": "BTC",
        //         "timestamp": "2018-03-30T12:34:56.789Z",
        //         "volume": "194785.8484"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const last = this.safeString (ticker, 'last');
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name gmocoin#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.coin.z.com/docs/en/#ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1Ticker (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const first = this.safeDict (data, 0, {});
        return this.parseTicker (first, market);
    }

    /**
     * @method
     * @name gmocoin#fetchTickers
     * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
     * @see https://api.coin.z.com/docs/en/#ticker
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Str[] = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const response = await this.publicGetV1Ticker (params);
        const data = this.safeList (response, 'data', []);
        const tickers = this.parseTickers (data, symbols);
        return tickers;
    }

    /**
     * @method
     * @name gmocoin#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.coin.z.com/docs/en/#orderbooks
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1Orderbooks (this.extend (request, params));
        //
        //     {
        //         "status": 0,
        //         "data": {
        //             "asks": [
        //                 { "price": "455659", "size": "0.1" },
        //                 { "price": "455658", "size": "0.2" }
        //             ],
        //             "bids": [
        //                 { "price": "455665", "size": "0.1" },
        //                 { "price": "455655", "size": "0.3" }
        //             ],
        //             "symbol": "BTC"
        //         },
        //         "responsetime": "2019-03-19T02:15:06.001Z"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrderBook (data, market['symbol'], undefined, 'bids', 'asks', 'price', 'size');
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //     {
        //         "price": "750760",
        //         "side": "BUY",
        //         "size": "0.1",
        //         "timestamp": "2018-03-30T12:34:56.789Z"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "executionId": 72123911,
        //         "orderId": 123456789,
        //         "symbol": "BTC",
        //         "side": "BUY",
        //         "settleType": "OPEN",
        //         "size": "0.7361",
        //         "price": "877404",
        //         "lossGain": "0",
        //         "fee": "323",
        //         "timestamp": "2019-03-19T02:15:06.081Z"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const id = this.safeString (trade, 'executionId');
        const orderId = this.safeString (trade, 'orderId');
        const side = this.safeStringLower (trade, 'side');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            fee = {
                'currency': market['quote'],
                'cost': feeCostString,
            };
        }
        return this.safeTrade ({
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name gmocoin#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.coin.z.com/docs/en/#trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
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
            request['count'] = limit;
        }
        const response = await this.publicGetV1Trades (this.extend (request, params));
        //
        //     {
        //         "status": 0,
        //         "data": {
        //             "list": [
        //                 {
        //                     "price": "750760",
        //                     "side": "BUY",
        //                     "size": "0.1",
        //                     "timestamp": "2018-03-30T12:34:56.789Z"
        //                 }
        //             ]
        //         },
        //         "responsetime": "2019-03-19T02:15:06.001Z"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const trades = this.safeList (data, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "openTime": "1591488000000",
        //         "open": "975214",
        //         "high": "975600",
        //         "low": "974000",
        //         "close": "975580",
        //         "volume": "20.3456"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'openTime'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name gmocoin#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.coin.z.com/docs/en/#klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['date'] = this.yyyymmdd (since, '');
        } else {
            request['date'] = this.yyyymmdd (this.milliseconds (), '');
        }
        const response = await this.publicGetV1Klines (this.extend (request, params));
        //
        //     {
        //         "status": 0,
        //         "data": [
        //             {
        //                 "openTime": "1591488000000",
        //                 "open": "975214",
        //                 "high": "975600",
        //                 "low": "974000",
        //                 "close": "975580",
        //                 "volume": "20.3456"
        //             }
        //         ],
        //         "responsetime": "2019-03-19T02:15:06.001Z"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeList (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'amount');
            account['free'] = this.safeString (balance, 'available');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name gmocoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.coin.z.com/docs/en/#assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetV1AccountAssets (params);
        //
        //     {
        //         "status": 0,
        //         "data": [
        //             {
        //                 "symbol": "JPY",
        //                 "amount": "993982",
        //                 "available": "993982",
        //                 "conversionRate": "1"
        //             },
        //             {
        //                 "symbol": "BTC",
        //                 "amount": "0.22",
        //                 "available": "0.22",
        //                 "conversionRate": "855000"
        //             }
        //         ],
        //         "responsetime": "2019-03-19T02:15:06.001Z"
        //     }
        //
        return this.parseBalance (response);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'WAITING': 'open',
            'ORDERED': 'open',
            'MODIFYING': 'open',
            'CANCELLING': 'open',
            'CANCELED': 'canceled',
            'EXECUTED': 'closed',
            'EXPIRED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "orderId": 123456789,
        //         "symbol": "BTC",
        //         "side": "BUY",
        //         "executionType": "LIMIT",
        //         "timeInForce": "FAS",
        //         "price": "877404",
        //         "size": "0.7361",
        //         "executedSize": "0.0000",
        //         "lossGain": "0",
        //         "fee": "0",
        //         "settleType": "OPEN",
        //         "timestamp": "2019-03-19T02:15:06.081Z",
        //         "status": "WAITING"
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'executedSize');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const rawType = this.safeString (order, 'executionType');
        const type = (rawType === 'MARKET') ? 'market' : 'limit';
        const side = this.safeStringLower (order, 'side');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        }, market);
    }

    /**
     * @method
     * @name gmocoin#createOrder
     * @description create a trade order
     * @see https://api.coin.z.com/docs/en/#order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'executionType': uppercaseType,
            'size': this.amountToPrecision (symbol, amount),
        };
        if (uppercaseType === 'LIMIT') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const timeInForce = this.safeString (params, 'timeInForce');
        if (timeInForce !== undefined) {
            request['timeInForce'] = timeInForce;
            params = this.omit (params, 'timeInForce');
        }
        const response = await this.privatePostV1Order (this.extend (request, params));
        //
        //     {
        //         "status": 0,
        //         "data": "637000",
        //         "responsetime": "2019-03-19T02:15:06.001Z"
        //     }
        //
        // Note: GMO Coin returns only the orderId as data
        const orderId = this.safeString (response, 'data');
        return this.safeOrder ({
            'id': orderId,
            'info': response,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'amount': amount,
            'price': price,
        }, market);
    }

    /**
     * @method
     * @name gmocoin#cancelOrder
     * @description cancels an open order
     * @see https://api.coin.z.com/docs/en/#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privatePostV1CancelOrder (this.extend (request, params));
        return this.safeOrder ({
            'id': id,
            'info': response,
        });
    }

    /**
     * @method
     * @name gmocoin#editOrder
     * @description edit an order
     * @see https://api.coin.z.com/docs/en/#change-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {string} type not used by gmocoin
     * @param {string} side not used by gmocoin
     * @param {float} [amount] new order amount
     * @param {float} [price] new order price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostV1ChangeOrder (this.extend (request, params));
        return this.safeOrder ({
            'id': id,
            'info': response,
        });
    }

    /**
     * @method
     * @name gmocoin#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.coin.z.com/docs/en/#active-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetV1ActiveOrders (this.extend (request, params));
        //
        //     {
        //         "status": 0,
        //         "data": {
        //             "list": [ ... ]
        //         },
        //         "responsetime": "2019-03-19T02:15:06.001Z"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name gmocoin#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.coin.z.com/docs/en/#orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
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
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetV1Orders (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name gmocoin#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.coin.z.com/docs/en/#executions
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetV1Executions (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const trades = this.safeList (data, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            const endpointPath = '/' + path;
            let auth = timestamp + method + endpointPath;
            if (method === 'POST') {
                body = this.json (query);
                auth += body;
            } else {
                if (Object.keys (query).length) {
                    const queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
            }
            const sign = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            headers = {
                'Content-Type': 'application/json',
                'API-KEY': this.apiKey,
                'API-TIMESTAMP': timestamp,
                'API-SIGN': sign,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const status = this.safeInteger (response, 'status');
        if (status === 0) {
            return undefined;
        }
        const data = this.safeValue (response, 'messages', []);
        const first = this.safeDict (data, 0, {});
        const errorCode = this.safeString (first, 'message_code');
        const errorMessage = this.safeString (first, 'message_string', '');
        const feedback = this.id + ' ' + errorMessage + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        throw new ExchangeError (feedback);
    }
}
