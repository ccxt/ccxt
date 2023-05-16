
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bingx.js';
import { AuthenticationError, ExchangeNotAvailable, PermissionDenied, ExchangeError, InsufficientFunds, BadRequest, OrderNotFound, NotSupported, DDoSProtection } from './base/errors.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Int } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class bingx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bingx',
            'name': 'BingX',
            'countries': [ 'US' ], // North America, Canada, the EU, Hong Kong and Taiwan
            'rateLimit': 16.666,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'hostname': 'bingx.com',
            'urls': {
                'logo': '',
                'api': {
                    'spot': 'https://open-api.bingx.com/openApi/spot',
                    'swap': 'https://open-api.bingx.com/openApi/swap',
                    'contract': 'https://open-api.bingx.com/openApi/contract',
                },
                'www': '',
                'doc': '',
                'referral': {
                },
                'fees': '',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'spot': {
                    'v1': {
                        'public': {
                            'get': {
                                'common/symbols': 3,
                                'market/trades': 3,
                                'market/depth': 3,
                            },
                        },
                        'private': {
                            'get': {
                            },
                            'post': {
                            },
                        },
                    },
                },
                'swap': {
                    'v2': {
                        'public': {
                            'get': {
                                'server/time': 3,
                                'quote/contracts': 3,
                                'quote/price': 3,
                                'quote/depth': 3,
                                'quote/trades': 3,
                                'quote/premiumIndex': 3,
                                'quote/fundingRate': 3,
                                'quote/klines': 3,
                                'quote/openInterest': 3,
                                'quote/ticker': 3,
                            },
                            'post': {
                            },
                        },
                        'private': {
                            'post': {
                            },
                        },
                    },
                },
                'contract': {
                    'v1': {
                        'private': {
                            'get': {
                                'allPosition': 1,
                                'allOrders': 1,
                                'balance': 1,
                            },
                        },
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
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'fees': {
                'trading': {
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': PermissionDenied,
                    '404': BadRequest,
                    '429': DDoSProtection,
                    '418': PermissionDenied,
                    '500': ExchangeError,
                    '504': ExchangeError,
                    '100001': AuthenticationError,
                    '100202': InsufficientFunds,
                    '100400': BadRequest,
                    '100440': ExchangeError,
                    '100500': ExchangeError,
                    '100503': ExchangeError,
                    '80001': BadRequest,
                    '80012': ExchangeNotAvailable,
                    '80014': BadRequest,
                    '80016': OrderNotFound,
                    '80017': OrderNotFound,
                },
                'broad': {},
            },
            'commonCurrencies': {
            },
            'options': {
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bingx#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the bingx server
         * @see https://bingx-api.github.io/docs/swapV2/base-info.html#get-server-time
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the bingx server
         */
        const response = await this.swapV2PublicGetServerTime (params);
        //
        //  {
        //      "code": 0,
        //      "msg": "",
        //      "data": {
        //          "serverTime": 1675319535362
        //      }
        //  }
        //
        const data = this.safeValue (response, 'data');
        return this.safeInteger (data, 'serverTime');
    }

    async fetchSpotMarkets (params) {
        const response = await this.spotV1PublicGetCommonSymbols (params);
        //
        //    {
        //    "code": 0,
        //        "msg": "",
        //        "debugMsg": "",
        //        "data": {
        //          "symbols": [
        //            {
        //              "symbol": "GEAR-USDT",
        //              "minQty": 735,
        //              "maxQty": 2941177,
        //              "minNotional": 5,
        //              "maxNotional": 20000,
        //              "status": 1,
        //              "tickSize": 0.000001,
        //              "stepSize": 1
        //            },
        //          ]
        //        }
        //    }
        //
        const result = [];
        const data = this.safeValue (response, 'data');
        const markets = this.safeValue (data, 'symbols');
        for (let i = 0; i < markets.length; i++) {
            result.push (this.parseMarket (markets[i]));
        }
        return result;
    }

    async fetchSwapMarkets (params) {
        const response = await this.swapV2PublicGetQuoteContracts (params);
        //
        //    {
        //        "code": 0,
        //        "msg": "",
        //        "data": [
        //          {
        //            "contractId": "100",
        //            "symbol": "BTC-USDT",
        //            "size": "0.0001",
        //            "quantityPrecision": 4,
        //            "pricePrecision": 1,
        //            "feeRate": 0.0005,
        //            "tradeMinLimit": 1,
        //            "maxLongLeverage": 150,
        //            "maxShortLeverage": 150,
        //            "currency": "USDT",
        //            "asset": "BTC",
        //            "status": 1
        //          },
        //        ]
        //    }
        //
        const result = [];
        const markets = this.safeValue (response, 'data');
        for (let i = 0; i < markets.length; i++) {
            result.push (this.parseMarket (markets[i]));
        }
        return result;
    }

    parseMarket (market) {
        const id = this.safeString (market, 'symbol');
        const symbolParts = id.split ('-');
        const baseId = symbolParts[0];
        const quoteId = symbolParts[1];
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const currency = this.safeString (market, 'currency');
        const settle = this.safeCurrencyCode (currency);
        const pricePrecision = this.safeNumber (market, 'pricePrecision');
        const quantityPrecision = this.safeNumber (market, 'quantityPrecision');
        const type = (settle !== undefined) ? 'swap' : 'spot';
        const spot = type === 'spot';
        const swap = type === 'swap';
        let symbol = base + '/' + quote;
        if (settle !== undefined) {
            symbol += ':' + settle;
        }
        const contractSize = this.safeNumber (market, 'tradeMinLimit');
        const entry = {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': currency,
            'type': type,
            'spot': spot,
            'margin': false,
            'swap': swap,
            'future': false,
            'option': false,
            'active': this.safeString (market, 'status') === '1' ? true : false,
            'contract': swap,
            'linear': swap,
            'inverse': false,
            'taker': undefined,
            'maker': undefined,
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': quantityPrecision,
                'price': pricePrecision,
                'base': undefined,
                'quote': undefined,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'minQty'),
                    'max': this.safeNumber (market, 'maxQty'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'minNotional'),
                    'max': this.safeNumber (market, 'maxNotional'),
                },
            },
            'info': market,
        };
        return entry;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bingx#fetchMarkets
         * @description retrieves data on all markets for bingx
         * @see https://bingx-api.github.io/docs/swapV2/market-api.html#_1-contract-information
         * @see https://bingx-api.github.io/docs/spot/market-interface.html#query-symbols
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMarkets', undefined, params);
        if (marketType === 'spot') {
            return await this.fetchSpotMarkets (params);
        } else if (marketType === 'swap') {
            return await this.fetchSwapMarkets (params);
        }
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bingx#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://bingx-api.github.io/docs/swap/market-api.html#_7-get-k-line-data
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @param {string|undefined} params.price "mark" or "index" for mark price and index price candles
         * @param {int|undefined} params.until timestamp in ms of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        request['interval'] = this.safeString (this.timeframes, timeframe, timeframe);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (market['spot']) {
            throw new NotSupported (this.id + ' fetchOHLCV is not supported for spot markets');
        }
        const response = await this.swapV2PublicGetQuoteKlines (this.extend (request, params));
        //
        //    {
        //        "code": 0,
        //        "msg": "",
        //        "data": [
        //          {
        //            "open": "19396.8",
        //            "close": "19394.4",
        //            "high": "19397.5",
        //            "low": "19385.7",
        //            "volume": "110.05",
        //            "time": 1666583700000
        //          },
        //          {
        //            "open": "19394.4",
        //            "close": "19379.0",
        //            "high": "19394.4",
        //            "low": "19368.3",
        //            "volume": "167.44",
        //            "time": 1666584000000
        //          }
        //        ]
        //    }
        //
        let ohlcvs = this.safeValue (response, 'data', []);
        if (typeof ohlcvs === 'object') {
            ohlcvs = [ ohlcvs ];
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //    {
        //        "open": "19394.4",
        //        "close": "19379.0",
        //        "high": "19394.4",
        //        "low": "19368.3",
        //        "volume": "167.44",
        //        "time": 1666584000000
        //    }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bingx#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://bingx-api.github.io/docs/spot/market-interface.html#query-transaction-records
         * @see https://bingx-api.github.io/docs/swapV2/market-api.html#_4-the-latest-trade-of-a-trading-pair
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTrades', market, params);
        if (marketType === 'spot') {
            method = 'spotV1PublicGetMarketTrades';
        } else {
            method = 'swapV2PublicGetQuoteTrades';
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        // spot
        //
        //      {
        //          "code": 0,
        //          "data": [
        //              {
        //                  "id": 43148253,
        //                  "price": 25714.71,
        //                  "qty": 1.674571,
        //                  "time": 1655085975589,
        //                  "buyerMaker": false
        //              }
        //          ]
        //      }
        //
        // swap
        //
        //     {
        //       "code":0,
        //       "msg":"",
        //       "data":[
        //         {
        //           "time": 1672025549368,
        //           "isBuyerMaker": true,
        //           "price": "16885.0",
        //           "qty": "3.3002",
        //           "quoteQty": "55723.87"
        //         },
        //         {
        //           "time": 1672025549368,
        //           "isBuyerMaker": false,
        //           "price": "16884.0",
        //           "qty": "1.9190",
        //           "quoteQty": "32400.40"
        //         }
        //       ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // fetchTrades - spot
        //
        //     {
        //         "id": 43148253,
        //         "price": 25714.71,
        //         "qty": 1.674571,
        //         "time": 1655085975589,
        //         "buyerMaker": false
        //     }
        //
        // fetchTrades - swap
        //
        //     {
        //       "time": 1672025549368,
        //       "isBuyerMaker": true,
        //       "price": "16885.0",
        //       "qty": "3.3002",
        //       "quoteQty": "55723.87"
        //     }
        //
        const id = this.safeString (trade, 'id');
        const time = this.safeInteger (trade, 'time');
        const price = this.safeString (trade, 'price');
        const qty = this.safeString (trade, 'qty');
        const isBuyerMaker = this.safeValue2 (trade, 'buyerMaker', 'isBuyerMaker');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': time,
            'datetime': this.iso8601 (time),
            'symbol': market['symbol'],
            'order': id,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': isBuyerMaker === true ? 'maker' : 'taker',
            'price': price,
            'amount': qty,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bingx#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrderBook', market, params);
        if (marketType === 'spot') {
            method = 'spotV1PublicGetMarketDepth';
        } else {
            method = 'swapV2PublicGetQuoteDepth';
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        // spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //           "bids": [
        //             [
        //               "26324.73",
        //               "0.37655"
        //             ],
        //             [
        //               "26324.71",
        //               "0.31888"
        //             ],
        //         ],
        //         "asks": [
        //             [
        //               "26340.30",
        //               "6.45221"
        //             ],
        //             [
        //               "26340.15",
        //               "6.73261"
        //             ],
        //         ]}
        //     }
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data": {
        //           "T": 1683914263304,
        //           "bids": [
        //             [
        //               "26300.90000000",
        //               "30408.00000000"
        //             ],
        //             [
        //               "26300.80000000",
        //               "50906.00000000"
        //             ],
        //         ],
        //         "asks": [
        //             [
        //               "26301.00000000",
        //               "43616.00000000"
        //             ],
        //             [
        //               "26301.10000000",
        //               "49402.00000000"
        //             ],
        //         ]}
        //     }
        //
        const orderbook = this.safeValue (response, 'data', {});
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'bids', 'asks', 0, 1);
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name bingx#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://bingx-api.github.io/docs/swapV2/market-api.html#_5-current-funding-rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.swapV2PublicGetQuotePremiumIndex (this.extend (request, params));
        //
        // {
        //     "code":0,
        //     "msg":"",
        //     "data":[
        //       {
        //         "symbol": "BTC-USDT",
        //         "markPrice": "16884.5",
        //         "indexPrice": "16886.9",
        //         "lastFundingRate": "0.0001",
        //         "nextFundingTime": 1672041600000
        //       },
        //       {
        //         "symbol": "ETH-USDT",
        //         "markPrice": "1220.94",
        //         "indexPrice": "1220.68",
        //         "lastFundingRate": "-0.0001",
        //         "nextFundingTime": 1672041600000
        //       }
        //     ]
        // }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //       "symbol": "BTC-USDT",
        //       "markPrice": "16884.5",
        //       "indexPrice": "16886.9",
        //       "lastFundingRate": "0.0001",
        //       "nextFundingTime": 1672041600000
        //     }
        //
        const symbolId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (symbolId, market, undefined, 'contract');
        const markPrice = this.safeNumber (contract, 'markPrice');
        const indexPrice = this.safeNumber (contract, 'indexPrice');
        const fundingRate = this.safeNumber (contract, 'lastFundingRate');
        const nextFundingTimestamp = this.safeInteger (contract, 'nextFundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRateHistory (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bingx#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://bingx-api.github.io/docs/swapV2/market-api.html#_6-funding-rate-history
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        this.checkRequiredSymbol ('fetchFundingRateHistory', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.swapV2PublicGetQuoteFundingRate (this.extend (request, params));
        //
        //    {
        //        "code":0,
        //        "msg":"",
        //        "data":[
        //          {
        //            "symbol": "BTC-USDT",
        //            "fundingRate": "0.0001",
        //            "fundingTime": 1585684800000
        //          },
        //          {
        //            "symbol": "BTC-USDT",
        //            "fundingRate": "-0.0017",
        //            "fundingTime": 1585713600000
        //          }
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbolInner = this.safeSymbol (marketId, market);
            const timestamp = this.safeInteger (entry, 'fundingTime');
            rates.push ({
                'info': entry,
                'symbol': symbolInner,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    async fetchOpenInterest (symbol: string, params = {}) {
        /**
         * @method
         * @name bingx#fetchOpenInterest
         * @description Retrieves the open interest of a currency
         * @see https://bingx-api.github.io/docs/swapV2/market-api.html#_8-get-swap-open-positions
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.swapV2PublicGetQuoteOpenInterest (this.extend (request, params));
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data": {
        //           "openInterest": "3289641547.10",
        //           "symbol": "BTC-USDT",
        //           "time": 1672026617364
        //         }
        //     }
        const data = this.safeValue (response, 'data', {});
        return this.parseOpenInterest (data, market);
    }

    parseOpenInterest (interest, market = undefined) {
        //
        //    {
        //        "openInterest": "3289641547.10",
        //        "symbol": "BTC-USDT",
        //        "time": 1672026617364
        //    }
        //
        const timestamp = this.safeInteger (interest, 'time');
        const id = this.safeString (interest, 'symbol');
        const symbol = this.safeSymbol (id, market);
        const openInterest = this.safeNumber (interest, 'openInterest');
        return {
            'symbol': symbol,
            'openInterestAmount': undefined,
            'openInterestValue': openInterest,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        };
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bingx#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://bingx-api.github.io/docs/swapV2/market-api.html#_9-get-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        this.checkRequiredSymbol ('fetchTicker', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.swapV2PublicGetQuoteTicker (this.extend (request, params));
        //
        //    {
        //        "code": 0,
        //        "msg": "",
        //        "data": {
        //          "symbol": "BTC-USDT",
        //          "priceChange": "52.5",
        //          "priceChangePercent": "0.31",
        //          "lastPrice": "16880.5",
        //          "lastQty": "2.2238",
        //          "highPrice": "16897.5",
        //          "lowPrice": "16726.0",
        //          "volume": "245870.1692",
        //          "quoteVolume": "4151395117.73",
        //          "openPrice": "16832.0",
        //          "openTime": 1672026667803,
        //          "closeTime": 1672026648425
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bingx#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://bingx-api.github.io/docs/swapV2/market-api.html#_9-get-ticker
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.swapV2PublicGetQuoteTicker (params);
        //
        //    {
        //        "code": 0,
        //        "msg": "",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT",
        //                "priceChange": "52.5",
        //                "priceChangePercent": "0.31",
        //                "lastPrice": "16880.5",
        //                "lastQty": "2.2238",
        //                "highPrice": "16897.5",
        //                "lowPrice": "16726.0",
        //                "volume": "245870.1692",
        //                "quoteVolume": "4151395117.73",
        //                "openPrice": "16832.0",
        //                "openTime": 1672026667803,
        //                "closeTime": 1672026648425
        //            },
        //        ]
        //    }
        //
        const tickers = this.safeValue (response, 'data');
        const result = { 'info': response };
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            if (symbols === undefined) {
                result[symbol] = ticker;
            } else if (symbols.indexOf (symbol) >= 0) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //    {
        //        "symbol": "BTC-USDT",
        //        "priceChange": "52.5",
        //        "priceChangePercent": "0.31",
        //        "lastPrice": "16880.5",
        //        "lastQty": "2.2238",
        //        "highPrice": "16897.5",
        //        "lowPrice": "16726.0",
        //        "volume": "245870.1692",
        //        "quoteVolume": "4151395117.73",
        //        "openPrice": "16832.0",
        //        "openTime": 1672026667803,
        //        "closeTime": 1672026648425
        //    }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const open = this.safeString (ticker, 'openPrice');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        const close = this.safeString (ticker, 'lastPrice');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        const baseVolume = this.safeString (ticker, 'volume');
        const change = this.safeString (ticker, 'chapriceChangenge');
        const percentage = this.safeString (ticker, 'priceChangePercent');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': undefined,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = section[0];
        const version = section[1];
        const access = section[2];
        let url = this.implodeHostname (this.urls['api'][type]);
        url += '/' + version + '/';
        path = this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (access === 'public') {
            url += path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            let query = this.urlencode (params);
            const signature = this.hmac (this.encode (query), this.encode (this.secret), sha256);
            query += '&' + 'signature=' + signature;
            headers = {
                'X-BX-APIKEY': this.apiKey,
            };
            url += query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        // {
        //     "code": 80014,
        //     "msg": "Invalid parameters, err:Key: 'GetTickerRequest.Symbol' Error:Field validation for 'Symbol' failed on the 'len=0|endswith=-USDT' tag",
        //     "data": {
        //
        //     }
        // }
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (code !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
