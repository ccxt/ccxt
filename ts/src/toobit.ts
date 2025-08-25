//  ---------------------------------------------------------------------------

import Exchange from './abstract/toobit.js';
import { AuthenticationError, ExchangeNotAvailable, OnMaintenance, AccountSuspended, PermissionDenied, RateLimitExceeded, InvalidNonce, InvalidAddress, ArgumentsRequired, ExchangeError, InvalidOrder, InsufficientFunds, BadRequest, OrderNotFound, BadSymbol, NotSupported, NetworkError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE, TRUNCATE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, Balances, OrderType, OHLCV, Order, Str, Trade, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market, TransferEntry, Num, TradingFeeInterface, Currencies, IsolatedBorrowRates, IsolatedBorrowRate, Dict, OrderRequest, int, DepositAddress, BorrowInterest, MarketInterface, FundingRateHistory, FundingHistory, LedgerEntry, Position, FundingRate, FundingRates } from './base/types.js';

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
                'createOrder': true,
                'createOrders': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'cancelOrders': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLastPrices': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': '',
                'api': {
                    'common': 'https://api.toobit.com',
                    'private': 'https://api.toobit.com',
                },
                'www': 'https://www.toobit.com/',
                'doc': [
                    'https://toobit-docs.github.io/apidocs/spot/v1/en/',
                    'https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/',
                ],
                'referral': undefined,
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
                        'api/quote/v1/index/klines': 1,
                        'api/quote/v1/markPrice/klines': 1,
                        'quote/v1/markPrice': 1,
                        'quote/v1/ticker/24hr': 1,
                        'quote/v1/contract/ticker/24hr': 1, // todo: 1-40 depenidng noSymbol
                        'quote/v1/ticker/price': 1,
                        'quote/v1/ticker/bookTicker': 1,
                        'api/v1/futures/fundingRate': 1,
                        'api/v1/futures/historyFundingRate': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/v1/account': 1,
                        'api/v1/spot/order': 1,
                    },
                    'post': {
                        'api/v1/spot/orderTest': 1,
                        'api/v1/spot/order': 1,
                        'api/v1/spot/batchOrders': 1,
                    },
                    'delete': {
                        'api/v1/spot/order': 1,
                        'api/v1/spot/openOrders': 1,
                        'api/v1/spot/cancelOrderByIds ': 1,
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
                },
                'broad': {
                },
            },
            'commonCurrencies': {},
            'options': {
                'defaultType': 'spot',
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
                    'createOrders': {
                        'max': 20,
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
     * @name toobit#fetchMarkets
     * @description retrieves data on all markets for toobit
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#exchange-information
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<MarketInterface[]> {
        const response = await this.commonGetApiV1ExchangeInfo (params);
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
            const inverse = this.safeBool (market, 'isInverse');
            if (isContract) {
                symbol += ':' + settle;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': undefined,
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
        return result;
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
        //
        const timestamp = this.safeInteger (trade, 't');
        const priceString = this.safeString (trade, 'p');
        const amountString = this.safeString (trade, 'q');
        let side = undefined;
        const isBuyerMaker = this.safeBool (trade, 'ibm');
        if (isBuyerMaker) {
            side = 'sell';
        } else {
            side = 'buy';
        }
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': side,
            'amount': amountString,
            'price': priceString,
            'cost': undefined,
            'takerOrMaker': undefined,
            'fee': undefined,
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
            request['endTime'] = this.iso8601 (until);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let endpoint = undefined;
        [ endpoint, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'price');
        if (endpoint === 'index') {
            response = await this.commonGetApiQuoteV1IndexKlines (this.extend (request, params));
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
            response = await this.commonGetApiQuoteV1MarkPriceKlines (this.extend (request, params));
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
        if (symbols !== undefined) {
            const symbol = this.safeString (symbols, 0);
            market = this.market (symbol);
        }
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.commonGetQuoteV1Ticker24hr (params);
        } else {
            response = await this.commonGetQuoteV1ContractTicker24hr (params);
        }
        //
        //    [
        //        {
        //            "t": "1755601440162",
        //            "s": "GRDRUSDT",
        //            "c": "0.38",
        //            "h": "0.38",
        //            "l": "0.38",
        //            "o": "0.38",
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
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of lastprices structures
     */
    async fetchLastPrices (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.commonGetQuoteV1TickerPrice (params);
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
            request['product_ids'] = this.marketIds (symbols);
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
        const response = await this.commonGetApiV1FuturesFundingRate (params);
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
     * @param {object} [params] extra parameters specific to the exchange API endpointinvalid
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetApiV1Account ();
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
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeList (response, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'asset'));
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            account['total'] = this.safeString (balance, 'total');
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
        [ request, params ] = this.createOrderRequest (symbol, type, side, amount, price, params);
        const order = await this.privatePostApiV1SpotOrder (this.extend (request, params));
        //
        //     {
        //         "accountId": "1783404067076253952",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "clientOrderId": "1756115478113679",
        //         "orderId": "2024837825254460160",
        //         "transactTime": "1756115478604",
        //         "price": "0",
        //         "origQty": "0.001",
        //         "executedQty": "0",
        //         "status": "PENDING_NEW",
        //         "timeInForce": "GTC",
        //         "type": "MARKET",
        //         "side": "SELL"
        //     }
        //
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name toobit#createOrders
     * @description create a list of trade orders
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#place-multiple-orders-trade
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString (rawOrder, 'symbol');
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeNumber (rawOrder, 'amount');
            const price = this.safeNumber (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest[0]);
        }
        const request = ordersRequests;
        const response = await this.privatePostApiV1SpotBatchOrders (request);
        
        return this.parseOrders (results);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const id = market['id'];
        const request: Dict = {
            'symbol': id,
            'side': side.toUpperCase (),
            'quantity': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        let isPostOnly = undefined;
        [ isPostOnly, params ] = this.handlePostOnly (type === 'market', false, params);
        if (isPostOnly) {
            request['type'] = 'LIMIT_MAKER';
        } else {
            request['type'] = type.toUpperCase ();
        }
        return [ request, params ];
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder, cancelOrder (spot)
        //
        //     {
        //         "accountId": "1783404067076253952",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "clientOrderId": "1756115478113679",
        //         "orderId": "2024837825254460160",
        //         "transactTime": "1756115478604",
        //         "price": "0",
        //         "origQty": "0.001",
        //         "executedQty": "0",
        //         "status": "PENDING_NEW",
        //         "timeInForce": "GTC",
        //         "type": "MARKET",
        //         "side": "SELL"
        //     }
        //
        // fetchOrder (spot)
        //
        //    {
        //        "accountId": "1783404067076253952",
        //        "exchangeId": "301",
        //        "symbol": "ETHUSDT",
        //        "symbolName": "ETHUSDT",
        //        "clientOrderId": "17561402075722006",
        //        "orderId": "2025045271033977089",
        //        "price": "3000",
        //        "origQty": "0.002",
        //        "executedQty": "0",
        //        "cummulativeQuoteQty": "0",
        //        "cumulativeQuoteQty": "0",
        //        "avgPrice": "0",
        //        "status": "NEW",
        //        "timeInForce": "GTC",
        //        "type": "LIMIT",
        //        "side": "BUY",
        //        "stopPrice": "0.0",
        //        "icebergQty": "0.0",
        //        "time": "1756140208069",
        //        "updateTime": "1756140208078",
        //        "isWorking": true
        //    }
        //
        const timestamp = this.safeInteger2 (order, 'transactTime', 'time');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const rawType = this.safeString (order, 'type');
        const rawSide = this.safeString (order, 'side');
        let fee = undefined;
        // const feeCurrency = this.safeString2 (order, 'tokenFeeCurrency', 'feeCcy');
        // let feeCost: Str = undefined;
        // let feeCurrencyCode: Str = undefined;
        // const rate = this.safeString (order, 'fee');
        // if (feeCurrency === undefined) {
        //     feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
        // } else {
        //     // poloniex accepts a 30% discount to pay fees in TRX
        //     feeCurrencyCode = this.safeCurrencyCode (feeCurrency);
        //     feeCost = this.safeString2 (order, 'tokenFee', 'feeAmt');
        // }
        // if (feeCost !== undefined) {
        //     fee = {
        //         'rate': rate,
        //         'cost': feeCost,
        //         'currency': feeCurrencyCode,
        //     };
        // }
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
            'side': rawSide.toLowerCase (),
            'price': this.omitZero (this.safeString (order, 'price')),
            'triggerPrice': triggerPrice,
            'cost': undefined,
            'average': this.safeString (order, 'avgPrice'),
            'amount': this.safeString (order, 'origQty'),
            'filled': this.safeString (order, 'executedQty'),
            'remaining': undefined,
            'trades': undefined,
            'fee': fee,
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
     * @name arkm#cancelOrder
     * @description cancels an open order
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#cancel-order-trade
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        const request = {};
        if (id !== undefined) {
            request['orderId'] = id;
        }
        const response = await this.privateDeleteApiV1SpotOrder (this.extend (request, params));
        //
        //  {"accountId":"1783404067076253952","symbol":"ETHUSDT","clientOrderId":"17561355785732021","orderId":"2025006439999870720","transactTime":"1756135579048","price":"3000","origQty":"0.002","executedQty":"0","status":"NEW","timeInForce":"GTC","type":"LIMIT","side":"BUY"}
        //
        const status = this.parseOrderStatus (this.safeString (response, 'status'));
        if (status !== 'open') {
            throw new OrderNotFound (this.id + ' order ' + id + ' can not be canceled, ' + this.json (response));
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name toobit#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#cancel-all-open-orders-trade
     * @param {string} symbol unified symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateDeleteApiV1SpotOpenOrders (params);
        //
        // {"success":true}  // always same response
        //
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
        const response = await this.privateDeleteApiV1SpotCancelOrderByIds (this.extend (request, params));
        //
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrders (response, market);
    }

    /**
     * @method
     * @name toobit#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#query-order-user_data
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateGetApiV1SpotOrder (this.extend (request, params));
        //
        //    {
        //        "accountId": "1783404067076253952",
        //        "exchangeId": "301",
        //        "symbol": "ETHUSDT",
        //        "symbolName": "ETHUSDT",
        //        "clientOrderId": "17561402075722006",
        //        "orderId": "2025045271033977089",
        //        "price": "3000",
        //        "origQty": "0.002",
        //        "executedQty": "0",
        //        "cummulativeQuoteQty": "0",
        //        "cumulativeQuoteQty": "0",
        //        "avgPrice": "0",
        //        "status": "NEW",
        //        "timeInForce": "GTC",
        //        "type": "LIMIT",
        //        "side": "BUY",
        //        "stopPrice": "0.0",
        //        "icebergQty": "0.0",
        //        "time": "1756140208069",
        //        "updateTime": "1756140208078",
        //        "isWorking": true
        //    }
        //
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (response, market);
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
        if (errorCode && errorCode !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
