//  ---------------------------------------------------------------------------

import Exchange from './abstract/zebpay.js';
import { TICK_SIZE } from './base/functions/number.js';
import { BadRequest, AuthenticationError, NotSupported, RateLimitExceeded, ExchangeNotAvailable, ExchangeError, ArgumentsRequired } from './base/errors.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Dict, Int, int, Leverage, Leverages, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees } from './base/types.js';
import Precise from './base/Precise.js';

//  ---------------------------------------------------------------------------

/**
 * @class
 * @augments Exchange
 */
export default class zebpay extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'zebpay',
            'name': 'Zebpay',
            'countries': [ 'IN' ],
            'rateLimit': 50,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': undefined,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'closePosition': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchLeverage': true,
                'fetchLeverages': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'reduceMargin': true,
                'setLeverage': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 480,
                '12h': 720,
                '1d': 1440,
                '1w': 10080,
            },
            'urls': {
                'logo': '',
                'api': {
                    'spot': 'https://sapi.zebpay.com',
                    'swap': 'https://futuresbe.zebpay.com',
                },
                'www': 'https://www.zebpay.com',
                'doc': 'https://github.com/zebpay/zebpay-api-references',
                'fees': 'https://zebpay.com/in/features/pricing',
            },
            'api': {
                'public': {
                    'spot': {
                        'get': {
                            'v2/system/time': 10,
                            'v2/system/status': 10,
                            'v2/market/orderbook': 10,
                            'v2/market/trades': 10,
                            'v2/market/ticker': 10,
                            'v2/market/allTickers': 10,
                            'v2/ex/exchangeInfo': 10,
                            'v2/ex/currencies': 10,
                            'v2/market/klines': 10,
                            'v2/ex/tradefees': 10,
                        },
                    },
                    'swap': {
                        'get': {
                            'v1/system/time': 10,
                            'v1/system/status': 10,
                            'v1/exchange/tradefee': 10,
                            'v1/exchange/tradefees': 10,
                            'v1/market/orderBook': 10,
                            'v1/market/ticker24Hr': 10,
                            'v1/market/markets': 10,
                        },
                        'post': {
                            'v1/market/klines': 10,
                        },
                    },
                },
                'private': {
                    'spot': {
                        'post': {
                            'v2/ex/orders': 10,
                        },
                        'get': {
                            'v2/ex/orders': 10,
                            'v2/account/balance': 10,
                            'v2/ex/tradefee': 10,
                            'v2/ex/order': 10,
                            'v2/ex/order/fills': 10,
                        },
                        'delete': {
                            'v2/ex/order': 10,
                            'v2/ex/orders': 10,
                            'v2/ex/orders/cancelAll': 10,
                        },
                    },
                    'swap': {
                        'get': {
                            'v1/wallet/balance': 10,
                            'v1/trade/order': 10,
                            'v1/trade/order/open-orders': 10,
                            'v1/trade/userLeverages': 10,
                            'v1/trade/userLeverage': 10,
                            'v1/trade/positions': 10,
                        },
                        'post': {
                            'v1/trade/order': 10,
                            'v1/trade/order/addTPSL': 10,
                            'v1/trade/addMargin': 10,
                            'v1/trade/reduceMargin': 10,
                            'v1/trade/position/close': 10,
                            'v1/trade/update/userLeverage': 10,
                        },
                        'delete': {
                            'v1/trade/order': 10,
                        },
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {},
            'commonCurrencies': {
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'fetchMarkets': {
                    'types': [ 'spot', 'swap' ],
                },
                'defaultType': 'spot', // 'spot', 'swap'
            },
            'features': {
                'default': {
                    'fetchOHLCV': {
                        'limit': 100,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Bad Request -- Invalid request format
                    '401': AuthenticationError, // Unauthorized -- Invalid API Key
                    '403': NotSupported, // Forbidden -- The request is forbidden
                    '404': NotSupported, // Not Found -- The specified resource could not be found
                    '429': RateLimitExceeded, // Too Many Requests -- Access limit breached
                    '500': ExchangeNotAvailable, // Internal Server Error -- We had a problem with our server. Try again later.
                    '503': ExchangeNotAvailable, // Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
                },
                'broad': {
                },
            },
        });
    }

    /**
     * @method
     * @name zebpay#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchStatus', undefined, params);
        const isSpot = (type === 'spot');
        const request: Dict = {};
        let response = undefined;
        let data = {};
        if (isSpot) {
            response = await this.publicSpotGetV2SystemStatus (this.extend (request, params));
            data = response;
        } else {
            response = await this.publicSwapGetV1SystemStatus (this.extend (request, params));
            data = this.safeDict (response, 'data', {});
        }
        //
        // {
        //     "statusDescription": "OK",
        //     "data":
        //      {
        //        "systemStatus": "ok"
        //       }
        //     "statusCode": 200,
        //     "customMessage": ["OK"]
        // }
        //
        const status = this.safeString2 (data, 'systemStatus', 'status');
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name zebpayfutures#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the poloniexfutures server
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the poloniexfutures server
     */
    async fetchTime (params = {}): Promise<Int> {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        const isSpot = (type === 'spot');
        const request: Dict = {};
        let response = undefined;
        let data = {};
        if (isSpot) {
            response = await this.publicSpotGetV2SystemTime (this.extend (request, params));
            data = response;
        } else {
            response = await this.publicSwapGetV1SystemTime (this.extend (request, params));
            data = this.safeDict (response, 'data', {});
        }
        //
        // {
        //     "statusDescription": "OK",
        //     "data":
        //      {
        //        "timestamp": 1546837113087
        //      }
        //     "statusCode": 200,
        //     "customMessage": ["OK"]
        // }
        //
        const time = this.safeInteger (data, 'timestamp');
        return time;
    }

    /**
     * @method
     * @name zebpay#fetchMarkets
     * @description retrieves data on all markets for zebpay
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-trading-pairs
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const promisesUnresolved = [];
        const fetchMarketsOptions = this.safeDict (this.options, 'fetchMarkets');
        const defaultMarkets = [ 'spot', 'swap' ];
        const types = this.safeList (fetchMarketsOptions, 'types', defaultMarkets);
        const request: Dict = {};
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if (type === 'spot') {
                promisesUnresolved.push (this.fetchSpotMarkets (this.extend (request, params)));
            } else if (type === 'swap') {
                promisesUnresolved.push (this.fetchSwapMarkets (this.extend (request, params)));
            } else {
                throw new ExchangeError (this.id + ' fetchMarkets() this.options fetchMarkets "' + type + '" is not a supported market type');
            }
        }
        const promises = await Promise.all (promisesUnresolved);
        const spotMarkets = this.safeList (promises, 0, []);
        const futureMarkets = this.safeList (promises, 1, []);
        return this.arrayConcat (spotMarkets, futureMarkets);
    }

    /**
     * @method
     * @name zebpay#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-coin-settings
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const request: Dict = {};
        const response = await this.publicSpotGetV2ExCurrencies (this.extend (request, params));
        //
        //     {
        //             "data": [
        //                 {
        //                     "currency": "BTC",
        //                     "name": "BTC",
        //                     "fullName": "150",
        //                     "precision": "0.2",
        //                     "type": "fiat",
        //                     "isDebitEnabled": false,
        //                     "chains": [
        //                         {
        //                             "chainName": "Bitcoin",
        //                             "withdrawalMinSize": "0.000482",
        //                             "depositMinSize": "0.00000001",
        //                             "withdrawalFee": "0.00040000",
        //                             "isWithdrawEnabled": "true",
        //                             "isDepositEnabled": "true",
        //                             "contractAddress": "0x095418A82BC2439703b69fbE1210824F2247D77c",
        //                             "withdrawPrecision": "8",
        //                             "maxWithdraw": "2.43090487000000",
        //                             "maxDeposit": "100.00000000",
        //                             "needTag": "false",
        //                             "chainId": "bitcoin",
        //                             "AddressRegex": "^tb1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}|m[a-zA-Z0-9]{25,34}|n[a-zA-Z0-9]{25,34}|^2[a-zA-Z0-9]{25,34}$"
        //                          }
        //                     ]
        //                 }
        //             ]
        //     }
        //
        const rows = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const precision = this.parseNumber (this.parsePrecision (this.safeString (currency, 'precision')));
            const chains = this.safeList (currency, 'chains', []);
            const networks: Dict = {};
            let minWithdrawFeeString = undefined;
            let minWithdrawString = undefined;
            let minDepositString = undefined;
            let deposit = false;
            let withdraw = false;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chainId');
                const networkCode = this.networkIdToCode (networkId);
                const depositAllowed = this.safeBool (chain, 'isDepositEnabled') === true;
                deposit = (depositAllowed) ? depositAllowed : deposit;
                const withdrawAllowed = this.safeBool (chain, 'isWithdrawEnabled') === true;
                withdraw = (withdrawAllowed) ? withdrawAllowed : withdraw;
                const withdrawFeeString = this.safeString (chain, 'withdrawalFee');
                if (withdrawFeeString !== undefined) {
                    minWithdrawFeeString = (minWithdrawFeeString === undefined) ? withdrawFeeString : Precise.stringMin (withdrawFeeString, minWithdrawFeeString);
                }
                const minNetworkWithdrawString = this.safeString (chain, 'withdrawalMinSize');
                if (minNetworkWithdrawString !== undefined) {
                    minWithdrawString = (minWithdrawString === undefined) ? minNetworkWithdrawString : Precise.stringMin (minNetworkWithdrawString, minWithdrawString);
                }
                const minNetworkDepositString = this.safeString (chain, 'depositMinSize');
                if (minNetworkDepositString !== undefined) {
                    minDepositString = (minDepositString === undefined) ? minNetworkDepositString : Precise.stringMin (minNetworkDepositString, minDepositString);
                }
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'active': depositAllowed && withdrawAllowed,
                    'deposit': depositAllowed,
                    'withdraw': withdrawAllowed,
                    'fee': this.parseNumber (withdrawFeeString),
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': this.parseNumber (minNetworkWithdrawString),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.parseNumber (minNetworkDepositString),
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'code': code,
                'id': currencyId,
                'name': name,
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': this.parseNumber (minWithdrawFeeString),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.parseNumber (minWithdrawString),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.parseNumber (minDepositString),
                        'max': undefined,
                    },
                },
                'networks': networks,
            });
        }
        return result;
    }

    /**
     * @method
     * @name zebpay#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-exchange-fee
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.side] side to fetch trading fee
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let response = undefined;
        let data;
        const request: Dict = {
            'symbol': market['id'],
        };
        if (market['spot']) {
            response = await this.privateSpotGetV2ExTradefee (this.extend (request, params));
            //
            // {
            //     "statusDescription": "Success",
            //     "data":
            //       {
            //         "symbol": "BTCINR",
            //         "takerFeeRate": "0.01",
            //         "makerFeeRate": "0.05",
            //         "percentage": true
            //       } ,
            //     "statusCode": 200,
            // }
            data = this.safeDict (response, 'data', {});
        } else {
            response = await this.publicSwapGetV1ExchangeTradefee (this.extend (request, params));
            //
            // {
            //     "statusDescription": "OK",
            //     "data":
            //     [
            //       {
            //         "symbol": "BTCINR",
            //         "takerFee": "0.01",
            //         "makerFee": "0.05"
            //       }
            //     ] ,
            //     "statusCode": 200,
            //     "customMessage": ["OK"]
            // }
            //
            const responseData = this.safeList (response, 'data', []);
            data = this.safeDict (responseData, 0);
        }
        return this.parseTradingFee (data, market);
    }

    /**
     * @method
     * @name zebpay(futures)#fetchTradingFees
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fees-all-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTradingFees', undefined, params);
        const request: Dict = {};
        let response = undefined;
        if (type === 'spot') {
            response = await this.publicSpotGetV2ExTradefees (this.extend (request, params));
        } else {
            response = await this.publicSwapGetV1ExchangeTradefees (this.extend (request, params));
        }
        //
        // {
        //     "statusDescription": "OK",
        //     "data": [
        //         {
        //             "symbol": "BTCINR",
        //             "takerFee": "0.01",
        //             "makerFee": "0.05"
        //         }
        //     ],
        //     "statusCode": 200,
        //     "customMessage": ["OK"]
        // }
        //
        const fees = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = this.parseTradingFee (fees[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    /**
     * @method
     * @name zebpay#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-order-book
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
        let response = undefined;
        limit = (limit === undefined) ? 10 : limit;
        if (market['spot']) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            //
            //       {
            //         "asks": [
            //                 [5000, 1000],           //Price, quantity
            //                 [6000, 1983]            //Price, quantity
            //         ],
            //         "bids": [
            //                 [3200, 800],            //Price, quantity
            //                 [3100, 100]             //Price, quantity
            //         ],
            //       }
            // }
            response = await this.publicSpotGetV2MarketOrderbook (this.extend (request, params));
        } else {
            response = await this.publicSwapGetV1MarketOrderBook (this.extend (request, params));
        }
        const bookData = this.safeDict (response, 'data', {});
        const orderbook = this.parseOrderBook (bookData, market['symbol'], undefined, 'bids', 'asks', 0, 1);
        return orderbook;
    }

    /**
     * @method
     * @name zebpay#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-ticker
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
            response = await this.publicSpotGetV2MarketTicker (this.extend (request, params));
            //
            //     [
            //        {
            //            "symbol": "BTC-INR",
            //            "bestBid": "4900000",
            //            "bestBidQty": "0.00014938",
            //            "bestAsk": "",
            //            "bestAskQty": "0",
            //            "priceChange": "-98134.56",
            //            "priceChangePercent": "-1.84",
            //            "high": "5433400",
            //            "low": "5333400",
            //            "vol": "0.0002",
            //            "volValue": "1066.68",
            //            "last": "5333400"
            //        }
            //     ]
            //
        } else {
            response = await this.publicSwapGetV1MarketTicker24Hr (this.extend (request, params));
        }
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    /**
     * @method
     * @name zebpay#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-all-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', undefined, params);
        if (type !== 'spot') {
            throw new NotSupported (this.id + ' fetchTickers() does not support ' + type + ' markets');
        }
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.publicSpotGetV2MarketAllTickers (this.extend (request, params));
        //
        //     [
        //        {
        //            "symbol": "BTC-INR",
        //            "bestBid": "4900000",
        //            "bestBidQty": "0.00014938",
        //            "bestAsk": "",
        //            "bestAskQty": "0",
        //            "priceChange": "-98134.56",
        //            "priceChangePercent": "-1.84",
        //            "high": "5433400",
        //            "low": "5333400",
        //            "vol": "0.0002",
        //            "volValue": "1066.68",
        //            "last": "5333400"
        //        }
        //     ]
        //
        const tickerList = this.safeList (response, 'data', []);
        return this.parseTickers (tickerList, undefined);
    }

    /**
     * @method
     * @name zebpay#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-klinescandlesticks
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.endtime] the latest time in ms to fetch orders for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 200; // default is 200
        }
        const request: Dict = {
            'symbol': market['id'],
            'limit': limit,
            'interval': timeframe,
        };
        if (since !== undefined) {
            if (market['spot']) {
                request['startTime'] = since;
            } else {
                request['since'] = since;
            }
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicSpotGetV2MarketKlines (this.extend (request, params));
        } else {
            response = await this.publicSwapPostV1MarketKlines (this.extend (request, params));
        }
        //
        //             [
        //                 [
        //                     "1670608800000",
        //                     "17071",
        //                     "17073",
        //                     "17027",
        //                     "17055.5",
        //                     "268611",
        //                     "15.74462667"
        //                 ],
        //                 [
        //                     "1670605200000",
        //                     "17071.5",
        //                     "17071.5",
        //                     "17061",
        //                     "17071",
        //                     "4177",
        //                     "0.24469757"
        //                 ],
        //                 [
        //                     "1670601600000",
        //                     "17086.5",
        //                     "17088",
        //                     "16978",
        //                     "17071.5",
        //                     "6356",
        //                     "0.37288112"
        //                 ]
        //             ]
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name zebpay#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['type'] === 'swap') {
            throw new NotSupported (this.id + ' fetchTrades() does not support ' + market['type'] + ' markets');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['page'] = since;
        } else {
            request['page'] = 1;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        } else {
            request['limit'] = 10;
        }
        const response = await this.publicSpotGetV2MarketTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id" : "60014521",
        //             "price" : "23162.94",
        //             "qty" : "0.00009",
        //             "side" : "SELL",
        //             "time" : 1659684602042,
        //             "isBuyerMaker" : 1659684602036
        //         }
        //     ]
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name zebpatspot#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-fills
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchOrderTrades', undefined, params);
        if (type !== 'spot') {
            throw new NotSupported (this.id + ' fetchOrderTrades() does not support ' + type + ' markets');
        }
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateSpotGetV2ExOrderFills (this.extend (request, params));
        //
        //         {
        //             "orderId": "456789",
        //             "symbol": "LINK_USDT",
        //             "origQty": "1.5",
        //             "orderId": "30249408733945856",
        //             "side": "BUY",
        //             "type": "LIMIT",
        //             "matchRole": "MAKER",
        //             "createTime": 1648200366864,
        //             "price": "3.1",
        //             "avgExecutedPrice": "2.3456"
        //             "openQty": "1",
        //             "filledQty": "0",
        //             "fees": "0.00145",
        //         }
        //
        const data = this.safeDict (response, 'data', {});
        const trades = [ data ];
        return this.parseTrades (trades);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchMyTrades
        //
        //     {
        //         "id": "32164924331503616",
        //         "symbol": "LINK_USDT",
        //         "accountType": "SPOT",
        //         "orderId": "32164923987566592",
        //         "side": "SELL",
        //         "type": "MARKET",
        //         "matchRole": "TAKER",
        //         "createTime": 1648635115525,
        //         "price": "11",
        //         "quantity": "0.5",
        //         "amount": "5.5",
        //         "feeCurrency": "USDT",
        //         "feeAmount": "0.007975",
        //         "pageId": "32164924331503616",
        //         "clientOrderId": "myOwnId-321"
        //     }
        //
        //
        const id = this.safeNumber (trade, 'id');
        const orderId = this.safeNumber (trade, 'id');
        const timestamp = this.safeNumber (trade, 'timestamp');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeStringLower (trade, 'side');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const fees = this.safeString (trade, 'fees', undefined);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': this.safeStringLower (trade, 'type'),
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fees,
        }, market);
    }

    /**
     * @method
     * @name zebpay#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/wallet.md#get-wallet-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const isSpot = (type === 'spot');
        const request: Dict = {};
        let response = undefined;
        if (isSpot) {
            response = await this.privateSpotGetV2AccountBalance (this.extend (request, params));
        } else {
            response = await this.privateSwapGetV1WalletBalance (this.extend (request, params));
        }
        //
        //     {
        //         "data": [
        //              {
        //                 "free": 200,
        //                 "used": 100,
        //                 "total": 300,
        //                 "currency": "INR"
        //              },
        //              {
        //                 "free": 0,
        //                 "used": 0,
        //                 "total": 0,
        //                 "currency": "USDT"
        //              }
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name zebpay#createOrder
     * @description Create an order on the exchange
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--create-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {number} [params.leverage] Leverage size of the order
     * @param {string} [params.formType] The price at which a trigger order is triggered at
     * @param {string} [params.marginAsset] The asset the order creates.
     * @param {boolean} [params.takeProfit] Takeprofit flag for the order.
     * @param {boolean} [params.stopLoss] Stop loss flag for the order.
     * @param {string} [params.positionId] PositionId of the order.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marginAsset = this.safeString (params, 'marginAsset', 'INR');
        const leverage = this.safeString (params, 'leverage');
        const formType = this.safeString (params, 'formType', 'ORDER_FORM');
        const upperCaseFormType = formType.toUpperCase ();
        const upperCaseType = type.toUpperCase ();
        const takeProfitPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLossPrice = this.safeNumber (params, 'stopLossPrice');
        const orderType = this.safeString (params, 'orderType');
        const positionId = this.safeString (params, 'positionId', undefined);
        params = this.omit (params, [ 'marginAsset', 'leverage', 'formType', 'positionId', 'takeProfitPrice' ]);
        let request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
        };
        let response = undefined;
        if (market['spot']) {
            [ request, params ] = this.orderRequest (symbol, type, amount, request, price, params);
            response = await this.privateSpotPostV2ExOrders (this.extend (request, params));
        } else {
            params = this.omit (params, [ 'stopLossPrice' ]);
            if (leverage === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a leverage parameter argument');
            }
            request['formType'] = upperCaseFormType;
            request['amount'] = parseFloat (this.amountToPrecision (market['id'], amount));
            request['marginAsset'] = marginAsset;
            request['leverage'] = leverage;
            const hasTP = takeProfitPrice !== undefined;
            const hasSL = stopLossPrice !== undefined;
            if (hasTP || hasSL) {
                if (hasTP) {
                    request['takeProfitPrice'] = parseFloat (this.priceToPrecision (symbol, takeProfitPrice));
                }
                if (hasSL) {
                    request['stopLossPrice'] = parseFloat (this.priceToPrecision (symbol, stopLossPrice));
                }
                request['positionId'] = positionId;
                request['orderType'] = orderType;
                response = await this.privateSwapPostV1TradeOrderAddTPSL (this.extend (request, params));
            } else {
                request['type'] = upperCaseType;
                if (type === 'limit') {
                    if (price === undefined) {
                        throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
                    }
                    request['price'] = parseFloat (this.priceToPrecision (symbol, price));
                }
                params = this.omit (params, [ 'price' ]);
                response = await this.privateSwapPostV1TradeOrder (this.extend (request, params));
            }
        }
        //
        //    {
        //        "data": {
        //            "clientOrderId": "619717484f1d010001510cde",
        //        },
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    orderRequest (symbol, type, amount, request, price = undefined, params = {}) {
        const upperCaseType = type.toUpperCase ();
        const triggerPrice = this.safeString (params, 'stopLossPrice', undefined);
        const quoteOrderQty = this.safeString (params, 'quoteOrderQty', undefined);
        const timeInForce = this.safeString (params, 'timeInForce', 'GTC');
        const clientOrderId = this.safeString (params, 'clientOrderId', this.uuid ());
        params = this.omit (params, [ 'stopLossPrice', 'quoteOrderQty', 'timeInForce', 'clientOrderId' ]);
        request['type'] = upperCaseType;
        request['clientOrderId'] = clientOrderId;
        request['timeInForce'] = timeInForce;
        if (upperCaseType === 'MARKET') {
            if (quoteOrderQty === undefined) {
                throw new ExchangeError (this.id + ' market createOrder() requires quoteOrderQty as params');
            }
            if (quoteOrderQty !== undefined) {
                request['quoteOrderAmount'] = quoteOrderQty;
            }
            if (amount !== undefined) {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            if (triggerPrice !== undefined) {
                request['stopLossPrice'] = this.priceToPrecision (symbol, triggerPrice);
            }
            request['amount'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        return [ request, params ];
    }

    /**
     * @method
     * @name zebpay#cancelOrder
     * @description cancels an open order
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timestamp] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let response = undefined;
        const request: Dict = {};
        if (market['spot']) {
            if (id === undefined) {
                request['symbol'] = market['id'];
                response = await this.privateSpotDeleteV2ExOrders (this.extend (request, params));
            } else {
                request['orderId'] = id;
                response = await this.privateSpotDeleteV2ExOrder (this.extend (request, params));
            }
        } else {
            request['clientOrderId'] = id;
            request['symbol'] = market['id'];
            response = await this.privateSwapDeleteV1TradeOrder (this.extend (request, params));
        }
        //
        //    {
        //        "data": {
        //            "clientOrderId": "619714b8b6353000014c505a",
        //            "status": "canceled"
        //        },
        //    }
        //
        return this.safeDict (response, 'data');
    }

    /**
     * @method
     * @name zebpay#cancelOrders
     * @description cancels all open orders
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-all-orders
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timestamp] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', undefined, params);
        if (type !== 'spot') {
            throw new NotSupported (this.id + ' cancelAllOrders() does not support ' + type + ' markets');
        }
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateSpotDeleteV2ExOrdersCancelAll (this.extend (request, params));
        //
        //    {
        //        "data": {
        //            "orderId": "12345",
        //            "symbol": 'BTC-INR
        //        },
        //    }
        //
        return response;
    }

    /**
     * @method
     * @name zebpay#fetchOpenOrders
     * @description fetches information on multiple open orders made by the user
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        let orders = [];
        if (market['spot']) {
            request['currentPage'] = 1;
            if (limit !== undefined) {
                request['pageSize'] = limit;
            }
            response = await this.privateSpotGetV2ExOrders (this.extend (request, params));
            const responseData = this.safeDict (response, 'data', {});
            orders = this.safeList (responseData, 'items', []);
        } else {
            if (since !== undefined) {
                request['since'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.privateSwapGetV1TradeOrderOpenOrders (this.extend (request, params));
            const responseData = this.safeDict (response, 'data', {});
            orders = this.safeList (responseData, 'data', []);
        }
        //
        //     {
        //         "data": {
        //             "nextTimeStamp": null,
        //             "totalCount": 100,
        //             "data": [
        //                 {
        //                     "clientOrderId": "64507d02921f1c0001ff6892-123-zeb",
        //                     "datetime": "2025-03-14T14:34:34.4567",
        //                     "timestamp": 1741962557553,
        //                     "status": "open",
        //                     "symbol": "BTCINR",
        //                     "type": "market",
        //                     "timeInForce": "GTC",
        //                     "side": "buy",
        //                     "price": 700000,
        //                     "amount": 0.002,
        //                     "filled": null,
        //                     "remaining": 0.002,
        //                     "trades": []
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.parseOrders (orders, market, undefined, limit);
    }

    /**
     * @method
     * @name zebpay#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-order-details
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel order by client order id
     * @param {string} [params.timestamp] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        let response = undefined;
        if (market['spot']) {
            request['orderId'] = id;
            response = await this.privateSpotGetV2ExOrder (this.extend (request, params));
        } else {
            request['id'] = id;
            response = await this.privateSwapGetV1TradeOrder (this.extend (request, params));
        }
        //
        //     {
        //         "data": {
        //             "nextTimeStamp": null,
        //             "totalCount": 100,
        //             "data": [
        //                 {
        //                     "clientOrderId": "64507d02921f1c0001ff6892-123-zeb",
        //                     "datetime": "2025-03-14T14:34:34.4567",
        //                     "timestamp": 1741962557553,
        //                     "status": "open",
        //                     "symbol": "BTCINR",
        //                     "type": "market",
        //                     "timeInForce": "GTC",
        //                     "side": "buy",
        //                     "price": 700000,
        //                     "amount": 0.002,
        //                     "filled": null,
        //                     "remaining": 0.002,
        //                     "trades": []
        //                 }
        //             ]
        //         }
        //     }
        //
        const responseData = this.safeDict (response, 'data');
        return this.parseOrder (responseData, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //      {
        //          "clientOrderId": "64507d02921f1c0001ff6892-123-zeb",
        //          "datetime": "2025-03-14T14:34:34.4567",
        //          "timestamp": 1741962557553,
        //          "status": "open",
        //          "symbol": "BTCINR",
        //          "type": "market",
        //          "timeInForce": "GTC",
        //          "side": "buy",
        //          "price": 700000,
        //          "amount": 0.002,
        //          "filled": null,
        //          "remaining": 0.002,
        //          "trades": []
        //      }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const type = this.safeString (order, 'type');
        const timestamp = this.safeNumber (order, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeString (order, 'price');
        const side = this.safeString (order, 'side');
        const amount = this.safeString (order, 'amount');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timeInForce = this.safeString (order, 'timeInForce');
        const status = this.safeStringLower (order, 'status');
        const orderId = this.safeString (order, 'orderId', undefined);
        const parsedOrder = this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'amount': amount,
            'price': price,
            'triggerPrice': undefined,
            'cost': undefined,
            'filled': undefined,
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': undefined,
            'status': status,
            'info': order,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'average': undefined,
            'trades': undefined,
        }, market);
        return parsedOrder;
    }

    /**
     * @method
     * @name zebpay#closePosition
     * @description closes open positions for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-close-position
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side not used by kucoinfutures closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.positionId] client order id of the order
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateSwapPostV1TradePositionClose (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name zebpay#fetchLeverages
     * @description fetch the set leverage for all contract and margin markets
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-all-user-leverages
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverages (symbols: Strings = undefined, params = {}): Promise<Leverages> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateSwapGetV1TradeUserLeverages (this.extend (request, params));
        //
        //     {
        //         "leveragePreferences": [
        //             {
        //                 "symbol": "ETHINR",
        //                 "shortLeverage": 1,
        //                 "longLeverage": 10,
        //                 "marginMode": "isolated"
        //             },
        //         ]
        //     }
        //
        const leveragePreferences = this.safeList (response, 'data', []);
        return this.parseLeverages (leveragePreferences, symbols, 'symbol');
    }

    /**
     * @method
     * @name zebpay#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#get-user-leverage-single-symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'].toUpperCase (),
        };
        const response = await this.privateSwapGetV1TradeUserLeverage (this.extend (request, params));
        //
        //     {
        //         "data": { symbol: "ETHINR", longLeverage: 1, shortLeverage: 1, marginMode: "isolated" }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseLeverage (data, market);
    }

    /**
     * @method
     * @name zebpay#setLeverage
     * @description set the level of leverage for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-update-user-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'leverage': leverage,
            'symbol': market['id'],
        };
        //
        // { data: { "symbol", "longLeverage": 10, "shortLeverage": 1, "marginMode": "isolated" }
        //
        const response = await this.privateSwapPostV1TradeUpdateUserLeverage (this.extend (request, params));
        return response;
    }

    /**
     * @method
     * @name zebpay#fetchPositions
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--get-positions
     * @description Fetches current contract trading positions
     * @param {string[]} symbols List of unified symbols
     * @param {object} [params] Not used by krakenfutures
     * @returns Parsed exchange response for positions
     */
    async fetchPositions (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateSwapGetV1TradePositions (this.extend (request, params));
        //
        //    {
        //        "data": [
        //            {
        //                "id": "31998678-6056-413f-9d0d-fc3678641650",
        //                "symbol": "ETHINR",
        //                "entryPrice": "0.7533",
        //                "datetime": "2022-03-03T22:51:16.566Z",
        //                "contractSize": "230"
        //            }
        //        ],
        //    }
        //
        const positions = this.safeList (response, 'data', []);
        const result = this.parsePositions (positions);
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    /**
     * @method
     * @name zebpayfutures#addMargin
     * @description add margin
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-add-margin-to-position
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.positionId] PositionId of the order to add margin.
     * @param {string} [params.timestamp] Tiemstamp.
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'amount': amount,
        };
        const response = await this.privateSwapPostV1TradeAddMargin (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "BTCINR",
        //            "type": "add",
        //            "amount": 1000,
        //            "code": "INR",
        //            "status": "ok"
        //        }
        //    }
        //
        //
        //    {
        //        "code":"200000",
        //        "msg":"Position does not exist"
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.extend (this.parseMarginModification (data, market), {
            'amount': amount,
            'direction': 'in',
        });
    }

    /**
     * @method
     * @name zebpayfutures#reduceMargin
     * @description add margin
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-reduce-margin-from-position
     * @param {string} symbol unified market symbol.
     * @param {float} amount amount of margin to add.
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.positionId] PositionId of the order to add margin.
     * @param {string} [params.timestamp] Tiemstamp.
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'amount': amount,
        };
        const response = await this.privateSwapPostV1TradeReduceMargin (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "BTCINR",
        //            "type": "reduce",
        //            "amount": 1000,
        //            "code": "INR",
        //            "status": "ok"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.extend (this.parseMarginModification (data, market), {
            'amount': amount,
            'direction': 'out',
        });
    }

    async fetchSpotMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicSpotGetV2ExExchangeInfo (params);
        //
        //    {
        //        "data": {
        //            "symbol": "ETH-INR",
        //            "name": "ETH-INR",
        //            "baseCurrency": "ETH",
        //            "quoteCurrency": "INR",
        //            "feeCurrency": "INR",
        //            "baseMinSize": "",
        //            "quoteMinSize": "100",
        //            "baseMaxSize": "",
        //            "quoteMaxSize": "2000",
        //            "baseIncrement": "0.00001"
        //            "quoteIncrement": "0.00001",
        //            "enableTrading": true
        //        }
        //    }
        //
        const result = [];
        const data = this.safeDict (response, 'data', {});
        const markets = this.safeList (data, 'symbols', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'swap': false,
                'margin': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': undefined,
                'taker': this.safeNumber (market, 'takerFee'),
                'maker': this.safeNumber (market, 'makerFee'),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'lotSz'),
                    'price': this.safeNumber (market, 'tickSz'),
                },
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
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
                'info': market,
            });
        }
        return result;
    }

    async fetchSwapMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicSwapGetV1MarketMarkets (params);
        //
        //    {
        //        "data": {
        //            "symbol": "ETHUSDT",
        //            "status": "TRADING",
        //            "mainMarginPercent": "10",
        //            "baseAsset": "ETH",
        //            "quoteAsset": "USDT",
        //            "pricePrecision": 1,
        //            "quantityPrecision": 0.05,
        //            "baseAssetPrecision": 0,
        //            "quotePrecision": 0,
        //            "orderType": ["LIMIT", "MARKET" ]
        //            "timeInForce": ["GTC"],
        //            "makerFee": "0.01",
        //            "takerFee": "0.01",
        //            "minLeverage": "1",
        //            "maxLeverage": "20"
        //            "tickSz": "0.1",
        //            "lotSz": "0.1"
        //        }
        //    }
        //
        const result = [];
        const data = this.safeDict (response, 'data', {});
        const markets = this.safeList (data, 'symbols', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            const symbol = base + '/' + quote;
            result.push (this.safeMarketStructure ({
                'id': id,
                'symbol': symbol + ':' + settle,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'type': 'swap',
                'option': false,
                'active': (status === 'Open'),
                'contract': true,
                'taker': this.safeNumber (market, 'takerFee'),
                'maker': this.safeNumber (market, 'makerFee'),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'lotSz'),
                    'price': this.safeNumber (market, 'tickSz'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (market, 'minLeverage'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                },
                'info': market,
            }));
        }
        return result;
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencyList = this.safeList (response, 'data', []);
        for (let i = 0; i < currencyList.length; i++) {
            const entry = currencyList[i];
            const account = this.account ();
            account['total'] = this.safeString (entry, 'total');
            account['free'] = this.safeString (entry, 'free');
            account['used'] = this.safeString (entry, 'used');
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // isolated
        //    {
        //        "id":"long",
        //        "symbol":"pf_ftmusd",
        //        "entryPrice":"0.4921",
        //        "datetime":"2023-02-22T11:37:16.685Z",
        //        "contractSize":"1",
        //        "leverage":"1.0"
        //    }
        //
        const leverage = this.safeNumber (position, 'leverage');
        const datetime = this.safeString (position, 'datetime');
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        return {
            'info': position,
            'symbol': marketId,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'initialMargin': this.safeNumber (position, 'initialMargin'),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'notional': this.safeNumber (position, 'notional'),
            'leverage': leverage,
            'unrealizedPnl': undefined,
            'contracts': this.safeNumber (position, 'contracts'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'markPrice': undefined,
            'collateral': undefined,
            'marginType': 'isolated',
            'side': this.safeString (position, 'side'),
            'percentage': undefined,
        };
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        const info = this.safeDict (leverage, 'info');
        const leverageValue = this.safeInteger (leverage, 'longLeverage');
        const leverageValueShort = this.safeInteger (leverage, 'shortLeverage');
        const marginMode = this.safeString (leverage, 'marginMode');
        return {
            'info': info,
            'symbol': marketId,
            'marginMode': marginMode,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValueShort,
        } as Leverage;
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        const marketId = this.safeString (fee, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber2 (fee, 'makerFeeRate', 'makerFee'),
            'taker': this.safeNumber2 (fee, 'takerFeeRate', 'takerFee'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     [
        //        {
        //            "symbol": "BTC-INR",
        //            "bestBid": "4900000",
        //            "bestBidQty": "0.00014938",
        //            "bestAsk": "",
        //            "bestAskQty": "0",
        //            "priceChange": "-98134.56",
        //            "priceChangePercent": "-1.84",
        //            "high": "5433400",
        //            "low": "5333400",
        //            "vol": "0.0002",
        //            "volValue": "1066.68",
        //            "last": "5333400"
        //        }
        //     ]
        //
        const timestamp = this.safeInteger2 (ticker, 'timestamp', 'ts', undefined);
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId);
        const close = this.safeString (ticker, 'close', undefined);
        const last = this.safeString (ticker, 'last', undefined);
        const percentage = this.safeString (ticker, 'percentage');
        const bidVolume = this.safeString (ticker, 'bidVolume');
        const askVolume = this.safeString (ticker, 'askVolume');
        return this.safeTicker ({
            'id': marketId,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': bidVolume,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': askVolume,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': last,
            'previousClose': this.safeString (ticker, 'previousClose'),
            'change': this.safeString (ticker, 'change'),
            'percentage': percentage,
            'average': this.safeString (ticker, 'average'),
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'markPrice': undefined,
            'info': ticker,
        }, market);
    }

    parseMarginModification (info, market: Market = undefined): MarginModification {
        //
        //    {
        //         "symbol": "BTCINR",
        //         "type": "reduce",
        //         "amount": 1000,
        //         "code": "INR",
        //         "status": "ok"
        //    }
        //
        const timestamp = this.milliseconds ();
        return {
            'info': info,
            'symbol': market['id'],
            'type': undefined,
            'marginMode': undefined,
            'amount': this.safeNumber (info, 'amount'),
            'total': undefined,
            'code': this.safeString (info, 'code'),
            'status': this.safeString (info, 'status'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        params = this.omit (params, 'defaultType');
        const marketType = path.includes ('v1/') ? 'swap' : 'spot';
        let url = this.urls['api'][marketType];
        const tail = '/api/' + this.implodeParams (path, params);
        url += tail;
        const timestamp = this.milliseconds ().toString ();
        let signature = '';
        const query = this.omit (params, this.extractParams (path));
        const queryLength = Object.keys (query).length;
        if (api === 'public') {
            if (method === 'GET' || method === 'DELETE') {
                if (queryLength) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = JSON.stringify (params);
                headers = {
                    'Content-Type': 'application/json',
                };
            }
        } else {
            this.checkRequiredCredentials ();
            const isSpot = marketType === 'spot';
            params['timestamp'] = timestamp;
            if (method === 'GET' || (method === 'DELETE' && isSpot)) {
                // For GET/DELETE: Append params to URL and sign the query string
                if (method === 'DELETE' && path.includes ('ex/orders')) {
                    params = this.omit (params, 'orderId');
                }
                if (method === 'GET' && path.includes ('ex/orders/')) {
                    params = this.omit (params, 'orderId');
                }
                const queryString = this.urlencode (params);
                signature = this.hmac (queryString, this.secret, sha256, 'hex');
                url += '?' + queryString;
            } else {
                // For POST/PUT: Convert body to JSON and sign the stringified payload
                body = JSON.stringify (params);
                signature = this.hmac (body, this.secret, sha256, 'hex');
            }
            headers = {
                'X-AUTH-APIKEY': this.apiKey,
                'X-AUTH-SIGNATURE': signature,
            };
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, body);
            return undefined;
        }
        //
        // bad
        //     { "code": "400100", "msg": "validation.createOrder.clientOidIsRequired" }
        // good
        //     { code: "200000", data: { ... }}
        //
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg', '');
        const feedback = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
        return undefined;
    }
}
