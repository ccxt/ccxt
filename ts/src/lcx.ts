//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/lcx.js';
import { AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, MarketClosed, OrderImmediatelyFillable, OrderNotFound, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Dict, Endpoint, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, int, NullableDict } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class lcx
 * @augments Exchange
 */
export default class lcx extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'lcx',
            'name': 'LCX',
            'countries': [ 'LI' ],
            'version': 'v1.1.0',
            // market api is limited to 25 requests per second per IP
            'rateLimit': 40,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '45m': '45',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://terminal-files.lcx.com/static/img/ccxt/LCX.jpg',
                'api': {
                    'public': 'https://exchange-api.lcx.com/api',
                    'private': 'https://exchange-api.lcx.com/api',
                    'kline': 'https://api-kline.lcx.com',
                },
                'www': 'https://www.lcx.com',
                'doc': [
                    'https://docs.lcx.com',
                ],
                'fees': 'https://www.lcx.com/fees/',
                'referral': 'https://accounts.lcx.com/register',
            },
            'api': {
                // trading and account api is limited to 5 requests per second and 90 requests per minute per IP
                // order placement, modification and cancellation are additionally limited to 1 request per second per IP
                'public': {
                    'get': {
                        'book': { 'cost': 1 } as Endpoint<Dict>,
                        'trades': { 'cost': 1 } as Endpoint<Dict>,
                        'pairs': { 'cost': 1 } as Endpoint<Dict>,
                        'pair': { 'cost': 1 } as Endpoint<Dict>,
                        'tickers': { 'cost': 1 } as Endpoint<Dict>,
                        'ticker': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'kline': {
                    'get': {
                        'v1/market/kline': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        'open': { 'cost': 16.67 } as Endpoint<Dict>,
                        'order': { 'cost': 25 } as Endpoint<Dict>,
                        'orderHistory': { 'cost': 16.67 } as Endpoint<Dict>,
                        'uHistory': { 'cost': 16.67 } as Endpoint<Dict>,
                        'balances': { 'cost': 16.67 } as Endpoint<Dict>,
                        'balance': { 'cost': 16.67 } as Endpoint<Dict>,
                    },
                    'post': {
                        'create': { 'cost': 25 } as Endpoint<Dict>,
                    },
                    'put': {
                        'modify': { 'cost': 25 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'cancel': { 'cost': 25 } as Endpoint<Dict>,
                        'cancel-all': { 'cost': 25 } as Endpoint<Dict>,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.003'),
                    'taker': this.parseNumber ('0.003'),
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'apiVersion': '1.1.0',
                // the order history endpoints reject date ranges longer than 90 days
                'maxDateRange': 7776000000,
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
                            'IOC': false,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': 90,
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
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 90,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
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
            'exceptions': {
                'exact': {
                    'Bad request': BadRequest,
                    'Invalid input data.': BadRequest,
                    'Incorrect API keys.': AuthenticationError,
                    'Signature not matched': AuthenticationError,
                    'Write access required': PermissionDenied,
                    'Requesting data from unauthorised IP.': PermissionDenied,
                    'kyc not completed': PermissionDenied,
                    'Your account is in restricted mode, allowing only withdrawals. Please contact support for assistance.': AccountSuspended,
                    'Something went wrong, please contact support': AccountSuspended,
                    'Insufficient funds for the request.': InsufficientFunds,
                    'Order not found.': OrderNotFound,
                    'Symbol not supported or disabled.': BadSymbol,
                    'Order type does not support.': InvalidOrder,
                    'Amount should be greater than min order.': InvalidOrder,
                    'Amount should be less than total market amount.': InvalidOrder,
                    'Amount should be between min and max amount.': InvalidOrder,
                    'Amount should be greater than the Minimum Value': InvalidOrder,
                    'Amount should be less than the Maximum Value': InvalidOrder,
                    'LCX cannot be used as fee in this pair.': BadRequest,
                    'Coin is currently inactive.': BadRequest,
                    'Date range cannot exceeds 90 days': BadRequest,
                    'Post-only order rejected': OrderImmediatelyFillable,
                    'Orders cannot execute in post only mode.': InvalidOrder,
                    'Orders cannot be created in halt mode.': MarketClosed,
                    'API limit reached, please try after some time': RateLimitExceeded,
                },
                'broad': {
                    'Price should be more than': InvalidOrder,
                    'Price should be less than': InvalidOrder,
                    'Price should be greater than': InvalidOrder,
                    'Please try after': RateLimitExceeded,
                    'is required': BadRequest,
                    'Invalid offset': BadRequest,
                    'offset should be greater than 0': BadRequest,
                    'invalid fromDate': BadRequest,
                    'invalid toDate': BadRequest,
                    'invalid orderType': BadRequest,
                },
            },
        });
    }

    /**
     * @method
     * @name lcx#fetchMarkets
     * @description retrieves data on all markets for lcx
     * @see https://docs.lcx.com/#tag/Market-API/operation/Pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const response = await this.publicGetPairs (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "Id": "e701f25c-0f2f-489c-923e-ac430af6beec",
        //                 "Symbol": "BTC/EUR",
        //                 "Base": "BTC",
        //                 "Quote": "EUR",
        //                 "Precision": { "Amount": 8, "Price": 4, "Total": 2 },
        //                 "Orderprecision": { "Amount": 5, "Price": 2, "Total": 2 },
        //                 "MinOrder": { "Base": 0.0001, "Quote": 1 },
        //                 "MaxOrder": { "Base": 10, "Quote": 100000 },
        //                 "Status": true,
        //                 "CreatedAt": "2021-05-13T17:59:30.516529Z",
        //                 "UpdatedAt": "2025-07-11T10:22:10.481774Z",
        //                 "ListingPrice": 0,
        //                 "ListingTime": "2021-05-13T17:59:30.516529Z",
        //                 "Mode": "trade",
        //                 "BaseFullName": "Bitcoin",
        //                 "QuoteFullName": "EUR",
        //                 "DiscountedFeePercentage": 0,
        //                 "AllowedRegions": [ "EU" ]
        //             }
        //         ],
        //         "message": "Successfull API Response",
        //         "status": "success"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        // skip duplicate pair entries
        const entries: Dict[] = [];
        const seen: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const entry = this.safeDict (data, i, {});
            const id = this.safeString (entry, 'Symbol', '');
            if (!(id in seen)) {
                seen[id] = true;
                entries.push (entry);
            }
        }
        return this.parseMarkets (entries);
    }

    override parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'Symbol');
        const baseId = this.safeString (market, 'Base');
        const quoteId = this.safeString (market, 'Quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const orderPrecision = this.safeDict (market, 'Orderprecision', {});
        const minOrder = this.safeDict (market, 'MinOrder', {});
        const maxOrder = this.safeDict (market, 'MaxOrder', {});
        const status = this.safeBool (market, 'Status', false);
        const mode = this.safeString (market, 'Mode');
        return this.safeMarketStructure ({
            'id': id,
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
            'active': status && (mode !== 'halt'),
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.parseNumber ('0.003'),
            'maker': this.parseNumber ('0.003'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (orderPrecision, 'Amount'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (orderPrecision, 'Price'))),
                'cost': this.parseNumber (this.parsePrecision (this.safeString (orderPrecision, 'Total'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (minOrder, 'Base'),
                    'max': this.safeNumber (maxOrder, 'Base'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (minOrder, 'Quote'),
                    'max': this.safeNumber (maxOrder, 'Quote'),
                },
            },
            'created': this.parse8601 (this.safeString (market, 'CreatedAt')),
            'info': market,
        });
    }

    /**
     * @method
     * @name lcx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.lcx.com/#tag/Market-API/operation/Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "bestAsk": 7.8925,
        //             "bestBid": 7.6924,
        //             "change": -4.3,
        //             "chart": [ { "Time": 1700024400, "Close": 7.7925 } ],
        //             "equivalent": 0.35996277,
        //             "high": 8.68,
        //             "last24Price": 8.1423,
        //             "lastPrice": 7.7925,
        //             "lastUpdated": 1700025221,
        //             "low": 7.7616,
        //             "symbol": "ADA/LCX",
        //             "usdVolume": 1828.49928314,
        //             "volume": 5079.69
        //         },
        //         "message": "Tickers fetched successfully",
        //         "status": "success"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    /**
     * @method
     * @name lcx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.lcx.com/#tag/Market-API/operation/Tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const response = await this.publicGetTickers (params);
        //
        //     {
        //         "data": {
        //             "ADA/LCX": {
        //                 "bestAsk": 7.8925,
        //                 "bestBid": 7.6924,
        //                 "change": -4.3,
        //                 ...
        //                 "symbol": "ADA/LCX",
        //                 "volume": 5079.69
        //             },
        //         },
        //         "message": "Tickers fetched successfully",
        //         "status": "success"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const tickers = this.toArray (data);
        return this.parseTickers (tickers, marketSymbols);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "bestAsk": 7.8925,
        //         "bestBid": 7.6924,
        //         "change": -4.3,
        //         "equivalent": 0.35996277,
        //         "high": 8.68,
        //         "last24Price": 8.1423,
        //         "lastPrice": 7.7925,
        //         "lastUpdated": 1700025221,
        //         "low": 7.7616,
        //         "symbol": "ADA/LCX",
        //         "usdVolume": 1828.49928314,
        //         "volume": 5079.69
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const resolvedMarket = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (ticker, 'lastUpdated');
        const last = this.safeString (ticker, 'lastPrice');
        return this.safeTicker ({
            'symbol': resolvedMarket['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'last24Price'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'change'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name lcx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.lcx.com/#tag/Market-API/operation/Order%20book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        const response = await this.publicGetBook (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "buy": [ [ 15000, 0.01 ], [ 14000, 0.01 ] ],
        //             "sell": [ [ 500000, 0.01 ], [ 1500000, 0.01 ] ]
        //         },
        //         "message": "Successfully API response",
        //         "status": "success"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const orderbook = this.parseOrderBook (data, market['symbol'], undefined, 'buy', 'sell');
        if (limit !== undefined) {
            orderbook['bids'] = this.arraySlice (orderbook['bids'], 0, limit);
            orderbook['asks'] = this.arraySlice (orderbook['asks'], 0, limit);
        }
        return orderbook;
    }

    /**
     * @method
     * @name lcx#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.lcx.com/#tag/Market-API/operation/Trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.offset] page index, the first page is 1, the page size is fixed to 100
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
            'offset': 1,
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             [ 90902.34, 0.01353, "SELL", 1750401854 ],
        //             [ 90954.19, 0.01325, "SELL", 1750401845 ]
        //         ],
        //         "message": "Successfully Api response",
        //         "status": "success"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name lcx#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Trades
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {int} [params.offset] page index, the first page is 1, the page size is fixed to 100
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {
            'offset': 1,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const [ dateRangeRequest, query ] = this.handleDateRange (request, since, params);
        const response = await this.privateGetUHistory (this.extend (dateRangeRequest, query));
        //
        //     {
        //         "data": [
        //             {
        //                 "Amount": 100,
        //                 "CreatedAt": 1697171480,
        //                 "Fee": 0.1,
        //                 "FeeCoin": "LCX",
        //                 "Id": "2d9d0338-ae79-4f3d-962d-2d658750328c",
        //                 "OrderId": "f4703cc0-f496-42a9-b743-c4c5b761797a",
        //                 "OrderType": "LIMIT",
        //                 "Pair": "LCX/EUR",
        //                 "Price": 0.0386,
        //                 "Side": "BUY",
        //                 "Status": "CLOSED",
        //                 "UserId": "3321eb49-6228-4574-912f-af5aecd3e2f7",
        //                 "isTaker": true
        //             }
        //         ],
        //         "message": "Trades fetched successfully",
        //         "status": "success",
        //         "totalCount": 1
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    override parseTrade (trade: any, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //     [ 90902.34, 0.01353, "SELL", 1750401854 ]
        //
        // fetchMyTrades
        //
        //     {
        //         "Amount": 100,
        //         "CreatedAt": 1697171480,
        //         "Fee": 0.1,
        //         "FeeCoin": "LCX",
        //         "Id": "2d9d0338-ae79-4f3d-962d-2d658750328c",
        //         "OrderId": "f4703cc0-f496-42a9-b743-c4c5b761797a",
        //         "OrderType": "LIMIT",
        //         "Pair": "LCX/EUR",
        //         "Price": 0.0386,
        //         "Side": "BUY",
        //         "Status": "CLOSED",
        //         "UserId": "3321eb49-6228-4574-912f-af5aecd3e2f7",
        //         "isTaker": true
        //     }
        //
        if (Array.isArray (trade)) {
            const publicMarket = this.safeMarket (undefined, market);
            const publicTimestamp = this.safeTimestamp (trade, 3);
            // the venue reports the maker side, the unified side is the taker side
            const makerSide = this.safeString (trade, 2);
            let takerSide: Str = undefined;
            if (makerSide === 'BUY') {
                takerSide = 'sell';
            } else if (makerSide === 'SELL') {
                takerSide = 'buy';
            }
            return this.safeTrade ({
                'info': trade,
                'id': undefined,
                'order': undefined,
                'timestamp': publicTimestamp,
                'datetime': this.iso8601 (publicTimestamp),
                'symbol': publicMarket['symbol'],
                'type': undefined,
                'side': takerSide,
                'takerOrMaker': undefined,
                'price': this.safeString (trade, 0),
                'amount': this.safeString (trade, 1),
                'cost': undefined,
                'fee': undefined,
            }, publicMarket);
        }
        const marketId = this.safeString (trade, 'Pair');
        const resolvedMarket = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (trade, 'CreatedAt');
        let fee = undefined;
        const feeCost = this.safeString (trade, 'Fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (trade, 'FeeCoin')),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'Id'),
            'order': this.safeString (trade, 'OrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': resolvedMarket['symbol'],
            'type': this.safeStringLower (trade, 'OrderType'),
            'side': this.safeStringLower (trade, 'Side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'Price'),
            'amount': this.safeString (trade, 'Amount'),
            'cost': undefined,
            'fee': fee,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name lcx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.lcx.com/#tag/Market-API/operation/Kline%20(Candles)
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default and maximum is 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const maxLimit = 1000;
        let requestLimit: number = maxLimit;
        if ((limit !== undefined) && (limit < maxLimit)) {
            requestLimit = limit;
        }
        const duration = this.parseTimeframe (timeframe) * 1000;
        const until = this.safeInteger (params, 'until');
        const query = this.omit (params, 'until');
        let start: number = 0;
        let end: number = 0;
        if (since === undefined) {
            end = (until === undefined) ? this.milliseconds () : until;
            start = end - requestLimit * duration;
        } else {
            start = since;
            end = (until === undefined) ? this.sum (since, requestLimit * duration - 1) : until;
        }
        const request: Dict = {
            'pair': market['id'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
            'from': this.parseToInt (start / 1000),
            'to': this.parseToInt (end / 1000),
        };
        const response = await this.klineGetV1MarketKline (this.extend (request, query));
        //
        //     {
        //         "count": 3,
        //         "data": [
        //             {
        //                 "pair": "BTC/EUR",
        //                 "timestamp": 1782734400,
        //                 "open": 61649,
        //                 "high": 61650,
        //                 "low": 61649,
        //                 "close": 61650,
        //                 "volume": 0.04862,
        //                 "timeframe": "60"
        //             }
        //         ],
        //         "message": "Successfully Api response",
        //         "status": "success"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, requestLimit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
        };
        const data = this.safeList (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = this.safeDict (data, i, {});
            const balance = this.safeDict (entry, 'balance', {});
            const code = this.safeCurrencyCode (this.safeString (entry, 'coin'));
            const account = this.account ();
            account['free'] = this.safeString (balance, 'freeBalance');
            account['used'] = this.safeString (balance, 'occupiedBalance');
            account['total'] = this.safeString (balance, 'totalBalance');
            if (code !== undefined) {
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name lcx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.lcx.com/#tag/Account-API/operation/Balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "balance": {
        //                     "freeBalance": 180611.65914222,
        //                     "occupiedBalance": 0,
        //                     "totalBalance": 180611.65914222
        //                 },
        //                 "coin": "USDC",
        //                 "equivalentUSDBalance": {
        //                     "freeBalance": 327827,
        //                     "occupiedBalance": 0,
        //                     "totalBalance": 327827
        //                 },
        //                 "fullName": "USD Coin"
        //             }
        //         ],
        //         "message": "Wallets fetched successfully",
        //         "status": "success",
        //         "totalBalance": { "inBTC": 60252968.05093348, "inUSD": 2213935058063.5 }
        //     }
        //
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name lcx#createOrder
     * @description create a trade order
     * @see https://docs.lcx.com/#tag/Trading-API/operation/New%20order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency you want to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order, must be a UUID
     * @param {bool} [params.postOnly] true to place a post only limit order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isMarket = (type === 'market');
        const request: Dict = {
            'Pair': market['id'],
            'Amount': this.parseNumber (this.amountToPrecision (symbol, amount)),
            'OrderType': type.toUpperCase (),
            'Side': side.toUpperCase (),
        };
        if (!isMarket) {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['Price'] = this.parseNumber (this.priceToPrecision (symbol, price));
        }
        const [ postOnly, postOnlyParams ] = this.handlePostOnly (isMarket, false, params);
        if (postOnly) {
            request['PostOnly'] = true;
        }
        const clientOrderId = this.safeString2 (postOnlyParams, 'clientOrderId', 'ClientOrderId');
        if (clientOrderId !== undefined) {
            request['ClientOrderId'] = clientOrderId;
        }
        const query = this.omit (postOnlyParams, [ 'clientOrderId', 'ClientOrderId' ]);
        const response = await this.privatePostCreate (this.extend (request, query));
        //
        //     {
        //         "data": {
        //             "Id": "3dae4495-a219-40dc-99d8-99c49c1d3810",
        //             "Pair": "AVAX/USDC",
        //             "Price": 1,
        //             "Amount": 10,
        //             "Side": "SELL",
        //             "OrderType": "LIMIT",
        //             "Status": "OPEN",
        //             "Filled": 0,
        //             "Average": 1,
        //             "Total": 0,
        //             "CreatedAt": 1699955183,
        //             "UpdatedAt": 1699955183,
        //             "Fee": 0,
        //             "IsFeeInLCX": true,
        //             "FeeLevel": 0,
        //             "FilledPer": 0,
        //             "ClientOrderId": "00000000-0000-0000-0000-000000000000"
        //             ...
        //         },
        //         "message": "Order created successfully",
        //         "status": "success"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name lcx#editOrder
     * @description edit an open limit order, partially filled orders cannot be edited
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Update%20order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {string} type 'limit', market orders cannot be edited
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the new amount of the order, in units of the base currency
     * @param {float} price the new price of the order, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params: Dict = {}): Promise<Order> {
        if ((amount === undefined) || (price === undefined)) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires both an amount and a price argument');
        }
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' editOrder() supports limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'OrderId': id,
            'Amount': this.parseNumber (this.amountToPrecision (symbol, amount)),
            'Price': this.parseNumber (this.priceToPrecision (symbol, price)),
        };
        const response = await this.privatePutModify (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "Id": "1c78b774-4a96-495c-be74-0dcaf5101461",
        //             "Pair": "LCX/EUR",
        //             "Price": 89.9,
        //             "Amount": 10,
        //             "Side": "BUY",
        //             "OrderType": "LIMIT",
        //             "Status": "OPEN",
        //             ...
        //         },
        //         "message": "Order updated successfully",
        //         "status": "success"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name lcx#cancelOrder
     * @description cancels an open order
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Cancel%20order
     * @param {string} id order id
     * @param {string} [symbol] not used by lcx cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateDeleteCancel (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "Id": "bb6fc517-9d0b-4c8c-a913-4f6aa8e2d25c",
        //             "Pair": "LCX/EUR",
        //             "Status": "CANCEL",
        //             ...
        //         },
        //         "message": "Order removed successfully",
        //         "status": "success"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name lcx#cancelOrders
     * @description cancel multiple orders, at most 25 orders per request
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Cancel%20All%20orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] not used by lcx cancelOrders ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrders (ids: string[], symbol: Str = undefined, params: Dict = {}): Promise<Order[]> {
        if (ids.length > 25) {
            throw new BadRequest (this.id + ' cancelOrders() accepts at most 25 order ids per request');
        }
        await this.loadMarkets ();
        const request: Dict = {
            'orderIds': ids,
        };
        const response = await this.privateDeleteCancelAll (this.extend (request, params));
        //
        //     {
        //         "message": "2 orders cancelled successfully",
        //         "status": "success"
        //     }
        //
        const orders = [];
        for (let i = 0; i < ids.length; i++) {
            orders.push (this.safeOrder ({
                'info': response,
                'id': ids[i],
            }));
        }
        return orders;
    }

    /**
     * @method
     * @name lcx#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Order
     * @param {string} id the order id
     * @param {string} [symbol] not used by lcx fetchOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'OrderId': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "Id": "5121fe93-ee23-4805-9edb-194d428f71a3",
        //             "Pair": "LINK/EUR",
        //             "Price": 6.11,
        //             "Amount": 100,
        //             "Side": "BUY",
        //             "OrderType": "LIMIT",
        //             "Status": "PARTIAL",
        //             "Filled": 50,
        //             ...
        //         },
        //         "message": "Order fetched successfully",
        //         "status": "success"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name lcx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Open%20orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {int} [params.offset] page index, the first page is 1, the page size is fixed to 100
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {
            'offset': 1,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const [ dateRangeRequest, query ] = this.handleDateRange (request, since, params);
        const response = await this.privateGetOpen (this.extend (dateRangeRequest, query));
        //
        //     {
        //         "data": [
        //             {
        //                 "Id": "bb6fc517-9d0b-4c8c-a913-4f6aa8e2d25c",
        //                 "Pair": "LCX/EUR",
        //                 "Price": 88.5,
        //                 "Amount": 10,
        //                 "Side": "BUY",
        //                 "OrderType": "LIMIT",
        //                 "Status": "OPEN",
        //                 ...
        //             }
        //         ],
        //         "message": "Orders fetched successfully",
        //         "status": "success",
        //         "totalCount": 7
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name lcx#fetchCanceledAndClosedOrders
     * @description fetches information on multiple closed and canceled orders made by the user
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {int} [params.offset] page index, the first page is 1, the page size is fixed to 100
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {
            'offset': 1,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const [ dateRangeRequest, query ] = this.handleDateRange (request, since, params);
        const response = await this.privateGetOrderHistory (this.extend (dateRangeRequest, query));
        //
        //     {
        //         "data": [
        //             {
        //                 "Id": "9c7e7a80-d353-4832-9735-4fe34ad7252f",
        //                 "Pair": "LCX/EUR",
        //                 "Price": 5.108,
        //                 "Amount": 112,
        //                 "Side": "SELL",
        //                 "OrderType": "LIMIT",
        //                 "Status": "CLOSED",
        //                 "Filled": 112,
        //                 ...
        //             }
        //         ],
        //         "message": "Orders fetched successfully",
        //         "status": "success",
        //         "totalCount": 2307049
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name lcx#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const request: Dict = {
            'orderStatus': 'CLOSED',
        };
        return await this.fetchCanceledAndClosedOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name lcx#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.lcx.com/#tag/Trading-API/operation/Orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const request: Dict = {
            'orderStatus': 'CANCEL',
        };
        return await this.fetchCanceledAndClosedOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @ignore
     * @method
     * @name lcx#handleDateRange
     * @description sets fromDate and toDate in seconds, the venue only applies the filter when both ends are set
     * @param {object} request the request to extend
     * @param {int} [since] the earliest time in ms
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms
     * @returns {object[]} the request and the remaining params
     */
    handleDateRange (request: Dict, since: Int = undefined, params: Dict = {}): any[] {
        const until = this.safeInteger (params, 'until');
        const query = this.omit (params, 'until');
        if ((since === undefined) && (until === undefined)) {
            return [ request, query ];
        }
        const maxDateRange = this.safeInteger (this.options, 'maxDateRange', 7776000000);
        let start: number = 0;
        let end: number = 0;
        if (since === undefined) {
            end = (until === undefined) ? this.milliseconds () : until;
            start = end - maxDateRange;
        } else {
            start = since;
            end = (until === undefined) ? Math.min (this.milliseconds (), this.sum (since, maxDateRange)) : until;
        }
        const result = this.extend (request, {
            'fromDate': this.parseToInt (start / 1000),
            'toDate': this.parseToInt (end / 1000),
        });
        return [ result, query ];
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'OPEN': 'open',
            'PARTIAL': 'open',
            'CLOSED': 'closed',
            'CANCEL': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "Tx": null,
        //         "Id": "5121fe93-ee23-4805-9edb-194d428f71a3",
        //         "Pair": "LINK/EUR",
        //         "BasePair": "",
        //         "QuotePair": "",
        //         "Price": 6.11,
        //         "Amount": 100,
        //         "Side": "BUY",
        //         "OrderType": "LIMIT",
        //         "Status": "PARTIAL",
        //         "Filled": 50,
        //         "Average": 0,
        //         "Total": 0,
        //         "CreatedAt": 0,
        //         "UpdatedAt": 1690372738,
        //         "UserId": "7d83f7c6-8b51-4388-bd4d-e2e5241fd253",
        //         "Fee": 0,
        //         "IsFeeInLCX": true,
        //         "FeeLevel": 0,
        //         "FilledPer": 50,
        //         "User": { ... },
        //         "Referral_UserId": "00000000-0000-0000-0000-000000000000",
        //         "ClientOrderId": "00000000-0000-0000-0000-000000000000"
        //     }
        //
        const marketId = this.safeString (order, 'Pair');
        const resolvedMarket = this.safeMarket (marketId, market);
        const symbol = resolvedMarket['symbol'];
        let timestamp = this.safeTimestamp (order, 'CreatedAt');
        const lastUpdateTimestamp = this.safeTimestamp (order, 'UpdatedAt');
        if ((timestamp === undefined) || (timestamp === 0)) {
            timestamp = lastUpdateTimestamp;
        }
        const type = this.safeStringLower (order, 'OrderType');
        const side = this.safeStringLower (order, 'Side');
        const filled = this.safeString (order, 'Filled');
        // the average is only meaningful once the order has fills
        let average: Str = undefined;
        if (Precise.stringGt (filled, '0')) {
            average = this.omitZero (this.safeString (order, 'Average'));
        }
        let price: Str = undefined;
        if (type !== 'market') {
            price = this.safeString (order, 'Price');
        }
        let clientOrderId = this.safeString (order, 'ClientOrderId');
        if (clientOrderId === '00000000-0000-0000-0000-000000000000') {
            clientOrderId = undefined;
        }
        let fee = undefined;
        const feeCost = this.safeString (order, 'Fee');
        if (feeCost !== undefined) {
            let feeCurrency: Str = undefined;
            if (this.safeBool (order, 'IsFeeInLCX', false)) {
                feeCurrency = 'LCX';
            } else if (side === 'buy') {
                feeCurrency = resolvedMarket['base'];
            } else if (side === 'sell') {
                feeCurrency = resolvedMarket['quote'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'Id'),
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': this.safeBool (order, 'PostOnly'),
            'reduceOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'Amount'),
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'Status')),
            'fee': fee,
            'trades': undefined,
        }, resolvedMarket);
    }

    override sign (path: string, api = 'public', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const apiVersion = this.safeString (this.options, 'apiVersion', '1.1.0');
        const requestHeaders: Dict = {
            'API-VERSION': apiVersion,
        };
        let requestBody: Str = body;
        const isBodyRequest = (method === 'POST') || (method === 'PUT');
        const hasQuery = Object.keys (query).length > 0;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            // the signature covers the request body only, requests without a body are signed with an empty object
            let payload = '{}';
            if (isBodyRequest) {
                requestBody = this.json (query);
                payload = requestBody;
                requestHeaders['Content-Type'] = 'application/json';
            } else if (hasQuery) {
                url += '?' + this.urlencodeWithArrayRepeat (query);
            }
            const auth = method + '/api/' + path + payload;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'base64');
            requestHeaders['x-access-key'] = this.apiKey;
            requestHeaders['x-access-sign'] = signature;
            requestHeaders['x-access-timestamp'] = this.milliseconds ().toString ();
        } else if (hasQuery) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': requestBody, 'headers': requestHeaders };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     { "message": "Symbol not supported or disabled.", "status": "ERROR" }
        //     { "message": "Incorrect API keys.", "success": "ERROR" }
        //     { "error": "Write access required" }
        //
        const status = this.safeStringUpper2 (response, 'status', 'success');
        const error = this.safeString (response, 'error');
        if ((status !== 'ERROR') && (error === undefined)) {
            return undefined;
        }
        const message = this.safeString (response, 'message', error);
        const feedback = this.id + ' ' + body;
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        throw new ExchangeError (feedback);
    }
}
