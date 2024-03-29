/* eslint-disable indent */
import Exchange from './abstract/commex.js';
import { ExchangeError, ArgumentsRequired, InvalidOrder } from './base/errors.js';
import type { Currency, Int, OHLCV, Trade, Market, Ticker, Str, Tickers, Strings, Balances, Order, OrderType, OrderSide, Transaction } from './base/types.js';
import { TRUNCATE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { rsa } from './base/functions/rsa.js';
import { eddsa } from './base/functions/crypto.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';

/**
 * @class Commex
 * @augments Exchange
 */
export default class commex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'commex',
            'name': 'Commex',
            'countries': [ 'RU' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': true,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLedgerEntry': true,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': 'emulated',
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'options': {
                'recvWindow': 5 * 1000, // 5 sec,
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'warnOnFetchOpenOrdersWithoutSymbol': true,
            },
            // https://www.commex.com/api-docs/en/?shell#public-api-definitions
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.006') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.005') ],
                            [ this.parseNumber ('4000000'), this.parseNumber ('0.004') ],
                            [ this.parseNumber ('8000000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('3000000'), this.parseNumber ('0.002') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.005') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.004') ],
                            [ this.parseNumber ('4000000'), this.parseNumber ('0.003') ],
                            [ this.parseNumber ('8000000'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('3000000'), this.parseNumber ('0.0') ],
                        ],
                    },
                },
            },
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': {
                    'public': 'https://api.commex.com/api',
                    'private': 'https://api.commex.com/api',
                },
                'www': 'https://www.commex.com',
                'doc': [
                    'https://www.commex.com/api-docs/en/#rest-open-api',
                    'https://www.commex.com/api-docs/en/futures-api.html',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'time',
                        'ticker/bookTicker',
                        'exchangeInfo',
                        'symbolType',
                        'ticker/bookTicker',
                        'klines',
                        'ticker/24h',
                        'depth',
                        'trades',
                        'aggTrades',
                        'ticker/price',
                        'account',
                        'userTrades',
                        'asset/tradeFee',
                        'ticker/24hr',
                    ],
                    'post': [
                        'inner/getAllAsset',
                    ],
                },
                'private': {
                    'get': [
                        'allOrders',
                        'account',
                        'openOrders',
                        'allOrders',
                        'order',
                        'capital/deposit/history',
                        'capital/withdraw/history',
                        'capital/deposit/address',
                        'asset/transfer-history',
                    ],
                    'delete': [
                        'order',
                        'openOrders',
                        'order/oco',
                        'listenKey',
                    ],
                    'post': [
                        'order',
                        'order/oco',
                        'widthdraw',
                        'capital/widthraw',
                        'asset/transfer',
                        'inner/getAllAsset',
                        'inner/getCloudKycStatus',
                        'inner/oauth/queryOauthBindInfo',
                        'listenKey',
                    ],
                    'put': [
                        'listenKey',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name commex#fetchMarkets
         * @description retrieves data on all markets for commex
         * @see https://www.commex.com/api-docs/en/index.html#exchange-information
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetExchangeInfo (params);
        //         https://api.commex.com/api/v1/ticker/bookTicker
        // [
        //   {
        //     symbol: 'BTCUSDT',
        //     bidPrice: '43599.00000000',
        //     bidQty: '0.00010000',
        //     askPrice: '43600.60000000',
        //     askQty: '0.00515000'
        //   },
        //   {
        //     symbol: 'ETHUSDT',
        //     bidPrice: '2282.14000000',
        //     bidQty: '1.44540000',
        //     askPrice: '2282.15000000',
        //     askQty: '0.83530000'
        //   },
        // commex end
        const markets = this.safeValue (response, 'symbols', {});
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const altName = this.safeString (market, 'symbol');
            const leverageBuy = undefined;
            const leverageBuyLength = undefined;
            const precisionPrice = this.parseNumber (this.parsePrecision (this.safeString (market, 'pair_decimals')));
            result.push ({
                'id': market['symbol'],
                'wsId': undefined,
                'symbol': altName,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'darkpool': undefined,
                'altname': altName,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                // 'taker': false,
                // 'maker': false,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'lot_decimals'))),
                    'price': precisionPrice,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (leverageBuy, leverageBuyLength - 1, 1),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'ordermin'),
                        'max': undefined,
                    },
                    'price': {
                        'min': precisionPrice,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'costmin'),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        this.options['marketsByAltname'] = this.indexBy (result, 'altname');
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                // urlencodeNested is used to address https://github.com/ccxt/ccxt/issues/12872
                url += '?' + this.urlencodeNested (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            let query = undefined;
            const defaultRecvWindow = this.safeInteger (this.options, 'recvWindow');
            const extendedParams = this.extend ({
                'timestamp': this.nonce () * 1000,
            }, params);
            if (defaultRecvWindow !== undefined) {
                extendedParams['recvWindow'] = defaultRecvWindow;
            }
            const recvWindow = this.safeInteger (params, 'recvWindow');
            if (recvWindow !== undefined) {
                extendedParams['recvWindow'] = recvWindow;
            }
            query = this.urlencode (extendedParams);
            let signature = undefined;
            if (this.secret.indexOf ('PRIVATE KEY') > -1) {
                if (this.secret.length > 120) {
                    signature = this.encodeURIComponent (rsa (query, this.secret, sha256));
                } else {
                    signature = this.encodeURIComponent (eddsa (this.encode (query), this.secret, ed25519));
                }
            } else {
                signature = this.hmac (this.encode (query), this.encode (this.secret), sha256);
            }
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            url = '/' + path;
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name commex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.commex.com/api-docs/en/?shell#kline-candlestick-data
         * @param {string} symbol unified symbol of the market to fetch OHLCV data
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 720) as OHLCV[];
        }
        const market = this.market (symbol);
        const parsedTimeframe = this.safeString (this.timeframes, timeframe);
        const request = {
            'symbol': market['id'],
        };
        if (parsedTimeframe !== undefined) {
            request['interval'] = parsedTimeframe;
        } else {
            request['interval'] = timeframe;
        }
        if (since !== undefined) {
            request['startTime'] = this.parseToInt ((since - 1) / 1000);
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        // commex.fetchOHLCV('BTCUSDT','1d','unix time stamp start time','limit', {aditional query paramters example endTime for commex})
        // [
        //     [
        //       1499040000000,      // Open time
        //       "0.01634790",       // Open
        //       "0.80000000",       // High
        //       "0.01575800",       // Low
        //       "0.01577100",       // Close
        //       "148976.11427815",  // Volume
        //       1499644799999,      // Close time
        //       "2434.19055334",    // Quote asset volume
        //       308,                // Number of trades
        //       "1756.87402397",    // Taker buy base asset volume
        //       "28.46694368"       // Taker buy quote asset volume
        //     ]
        //   ]
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name commex#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://www.commex.com/api-docs/en/?shell#check-server-time
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.publicGetTime (params);
        // { "serverTime": 1655374964469 }
        const data = this.safeTimestamp (response, 'serverTime', 0);
        return {
            'status': (data !== 0) ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': undefined,
        };
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name commex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * Default fetchTradesMethod
         * @see https://www.commex.com/api-docs/en/#compressed-aggregate-trades-list
         * Other fetchTradesMethod
         * @see https://www.commex.com/api-docs/en/#recent-trades-list                      // publicGetTrades (spot)
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] not used by commex
         * @param {int} [limit] default 500, max 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] only used when fetchTradesMethod is 'publicGetAggTrades'
         * @param {int} [params.fetchTradesMethod] 'publicGetAggTrades' (spot default), 'publicGetTrades'         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int} [params.fromId] trade id to fetch from, default gets most recent trades, not used when fetchTradesMethod is 'publicGetTrades'
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const method = this.safeString (params, 'fetchTradesMethod', 'publicGetAggTrades');
        if (since !== undefined) {
            request['startTime'] = since;
            request['endTime'] = this.sum (since, 3600000);
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 500, maximum = 1000
        }
        params = this.omit (params, [ 'until', 'fetchTradesMethod' ]);
        const response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        // Binance
        // aggregate trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
        //
        //     {
        //         "a": 26129,         // Aggregate tradeId
        //         "p": "0.01633102",  // Price
        //         "q": "4.70443515",  // Quantity
        //         "f": 27781,         // First tradeId
        //         "l": 27781,         // Last tradeId
        //         "T": 1498793709153, // Timestamp
        //         "m": true,          // Was the buyer the maker?
        //         "M": true           // Was the trade the best price match?
        //     }
        //
        // REST: aggregate trades for swap & future (both linear and inverse)
        //
        //     {
        //         "a": "269772814",
        //         "p": "25864.1",
        //         "q": "3",
        //         "f": "662149354",
        //         "l": "662149355",
        //         "T": "1694209776022",
        //         "m": false,
        //     }
        //
        // recent public trades and old public trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#recent-trades-list
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#old-trade-lookup-market_data
        //
        //     {
        //         "id": 28457,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "time": 1499865549590,
        //         "isBuyerMaker": true,
        //         "isBestMatch": true
        //     }
        //
        // private trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#account-trade-list-user_data
        //
        //     {
        //         "symbol": "BNBBTC",
        //         "id": 28457,
        //         "orderId": 100234,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "commission": "10.10000000",
        //         "commissionAsset": "BNB",
        //         "time": 1499865549590,
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        // futures trades
        // https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
        //
        //     {
        //       "accountId": 20,
        //       "buyer": False,
        //       "commission": "-0.07819010",
        //       "commissionAsset": "USDT",
        //       "counterPartyId": 653,
        //       "id": 698759,
        //       "maker": False,
        //       "orderId": 25851813,
        //       "price": "7819.01",
        //       "qty": "0.002",
        //       "quoteQty": "0.01563",
        //       "realizedPnl": "-0.91539999",
        //       "side": "SELL",
        //       "symbol": "BTCUSDT",
        //       "time": 1569514978020
        //     }
        //     {
        //       "symbol": "BTCUSDT",
        //       "id": 477128891,
        //       "orderId": 13809777875,
        //       "side": "SELL",
        //       "price": "38479.55",
        //       "qty": "0.001",
        //       "realizedPnl": "-0.00009534",
        //       "marginAsset": "USDT",
        //       "quoteQty": "38.47955",
        //       "commission": "-0.00076959",
        //       "commissionAsset": "USDT",
        //       "time": 1612733566708,
        //       "positionSide": "BOTH",
        //       "maker": true,
        //       "buyer": false
        //     }
        //
        // { respType: FULL }
        //
        //     {
        //       "price": "4000.00000000",
        //       "qty": "1.00000000",
        //       "commission": "4.00000000",
        //       "commissionAsset": "USDT",
        //       "tradeId": "1234",
        //     }
        //
        // options: fetchMyTrades
        //
        //     {
        //         "id": 1125899906844226012,
        //         "tradeId": 73,
        //         "orderId": 4638761100843040768,
        //         "symbol": "ETH-230211-1500-C",
        //         "price": "18.70000000",
        //         "quantity": "-0.57000000",
        //         "fee": "0.17305890",
        //         "realizedProfit": "-3.53400000",
        //         "side": "SELL",
        //         "type": "LIMIT",
        //         "volatility": "0.30000000",
        //         "liquidity": "MAKER",
        //         "time": 1676085216845,
        //         "priceScale": 1,
        //         "quantityScale": 2,
        //         "optionSide": "CALL",
        //         "quoteAsset": "USDT"
        //     }
        //
        // options: fetchTrades
        //
        //     {
        //         "id": 1,
        //         "symbol": "ETH-230216-1500-C",
        //         "price": "35.5",
        //         "qty": "0.03",
        //         "quoteQty": "1.065",
        //         "side": 1,
        //         "time": 1676366446072
        //     }
        //
        // Commex
        // Aggregate data
        // https://www.commex.com/api-docs/en/#compressed-aggregate-trades-list
        //     {
        //       "a": 26129,          // Aggregate tradeId
        //       "p": "0.01633102",   // Price
        //       "q": "4.70443515",   // Quantity
        //       "f": 27781,          // First tradeId
        //       "l": 27781,          // First tradeId
        //       "T": 1498793709153,  // Timestamp
        //       "m": true            // Was the buyer the maker?
        //     }
        // Rescent trades list
        // https://www.commex.com/api-docs/en/#recent-trades-list
        //   {
        //     "id": 28457,
        //     "price": "4.00000100",
        //     "qty": "12.00000000",
        //     "quoteQty": "48.000012",
        //     "time": 1499865549590,
        //     "isBuyerMaker": true,
        //     "isBestMatch": true
        //   }
        const timestamp = this.safeInteger2 (trade, 'T', 'time');
        const price = this.safeString2 (trade, 'p', 'price');
        const amount = this.safeString2 (trade, 'q', 'qty');
        const cost = this.safeString2 (trade, 'quoteQty', undefined);
        const symbol = market['symbol'];
        const id = this.safeString2 (trade, 'a', 'id');
        let side = undefined;
        const buyerMaker = this.safeValue2 (trade, 'm', 'isBuyerMaker');
        side = buyerMaker ? 'sell' : 'buy'; // this is reversed intentionally
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            // 'type': this.safeStringLower (trade, 'type'),
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name commex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://www.commex.com/api-docs/en/#24hr-ticker-price-change-statistics
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         * Example request single ticker
         * {"symbol":"BTCUSDT","priceChange":"536.40000000","priceChangePercent":"1.257","weightedAvgPrice":"43067.42186779","prevClosePrice":null,"lastPrice":"43205.10000000",
         * "lastQty":null,"bidPrice":"43222.80000000","bidQty":"0.05410000","askPrice":"43253.10000000","askQty":"0.09600000","openPrice":"42668.70000000",
         * "highPrice":"43466.80000000","lowPrice":"42566.40000000","volume":"69.86994000","openTime":1706806740000,"closeTime":1706893164145,"firstId":168282,
         * "lastId":172205,"count":3924,"quoteVolume":"3009118.18185700"};
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        response = await this.publicGetTicker24hr (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name commex#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://www.commex.com/api-docs/en/#all-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params) as Trade[];
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        [ params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        [ params ] = this.handleMarginModeAndParams ('fetchMyTrades', params);
        const endTime = this.safeInteger2 (params, 'until', 'endTime');
        if (since !== undefined) {
            const startTime = since;
            request['startTime'] = startTime;
        }
        if (endTime !== undefined) {
            request['endTime'] = endTime;
            params = this.omit (params, [ 'endTime', 'until' ]);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAllOrders (this.extend (request, params));
        // Commex
        // [  {    "symbol": "LTCBTC",    "orderId": 1,    "clientOrderId": "myOrder1",    "price": "0.1",    "origQty": "1.0",    "executedQty": "0.0",
        //    "cumulativeQuoteQty": "0.0",    "status": "NEW",    "timeInForce": "GTC",    "type": "LIMIT",    "side": "BUY",    "stopPrice": "0.0",
        //  "time": 1499827319559,    "updateTime": 1499827319559,    "isWorking": true,    "origQuoteOrderQty": "0.000000"  }]
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name commex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://www.commex.com/api-docs/en/#24hr-ticker-price-change-statistics
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const marketType = 'spot';
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const last = this.safeString (ticker, 'lastPrice');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString2 (ticker, 'quoteVolume', 'amount');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString2 (ticker, 'highPrice', 'high'),
            'low': this.safeString2 (ticker, 'lowPrice', 'low'),
            'bid': this.safeString (ticker, 'bidPrice'),
            'bidVolume': this.safeString (ticker, 'bidQty'),
            'ask': this.safeString (ticker, 'askPrice'),
            'askVolume': this.safeString (ticker, 'askQty'),
            'vwap': this.safeString (ticker, 'weightedAvgPrice'),
            'open': this.safeString2 (ticker, 'openPrice', 'open'),
            'close': last,
            'last': last,
            'previousClose': this.safeString (ticker, 'prevClosePrice'), // previous day close
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    parseBalance (response, type = undefined, marginMode = undefined): Balances {
        const result = {
            'info': response,
        };
        let timestamp = undefined;
        timestamp = this.safeInteger (response, 'updateTime');
        const balances = this.safeValue2 (response, 'balances', 'userAssets', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name commex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://www.commex.com/api-docs/en/#account-information
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        [ params ] = this.handleSubTypeAndParams ('fetchBalance', undefined, params);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchBalance', params);
        const method = 'privateGetAccount';
        const request = {};
        const requestParams = this.omit (query, [ 'type', 'symbols' ]);
        const response = await this[method] (this.extend (request, requestParams));
        return this.parseBalance (response, type, marginMode);
    }

    isInverse (type, subType = undefined): boolean {
        if (subType === undefined) {
            return type === 'delivery';
        } else {
            return subType === 'inverse';
        }
    }

    isLinear (type, subType = undefined): boolean {
        if (subType === undefined) {
            return (type === 'future') || (type === 'swap');
        } else {
            return subType === 'linear';
        }
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name commex#fetchOpenOrders
         * @see https://www.commex.com/api-docs/en/#current-open-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        let query = undefined;
        [ query ] = this.handleMarginModeAndParams ('fetchOpenOrders', params);
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        } else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            throw new ExchangeError (this.id + ' fetchOpenOrders() WARNING: fetching open orders without specifying a symbol is rate-limited. Do not call this method frequently to avoid ban. Set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        }
        [ query ] = this.handleSubTypeAndParams ('fetchOpenOrders', market, query);
        const response = await this.privateGetAllOrders (this.extend (request, query));
        return this.parseOrders (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'ACCEPTED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'CANCELLED': 'canceled',
            'PENDING_CANCEL': 'canceling', // currently unused
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
            'EXPIRED_IN_MATCH': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market: Market = undefined): Order {
        const code = this.safeString (order, 'code');
        if (code !== undefined) {
            // cancelOrders/createOrders might have a partial success
            return this.safeOrder ({ 'info': order, 'status': 'rejected' }, market);
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const marketType = ('closePosition' in order) ? 'contract' : 'spot';
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const filled = this.safeString (order, 'executedQty', '0');
        const timestamp = this.safeIntegerN (order, [ 'time', 'createTime', 'workingTime', 'transactTime', 'updateTime' ]); // order of the keys matters here
        let lastTradeTimestamp = undefined;
        if (('transactTime' in order) || ('updateTime' in order)) {
            const timestampValue = this.safeInteger2 (order, 'updateTime', 'transactTime');
            if (status === 'open') {
                if (Precise.stringGt (filled, '0')) {
                    lastTradeTimestamp = timestampValue;
                }
            } else if (status === 'closed') {
                lastTradeTimestamp = timestampValue;
            }
        }
        const lastUpdateTimestamp = this.safeInteger2 (order, 'transactTime', 'updateTime');
        const average = this.safeString (order, 'avgPrice');
        const price = this.safeString (order, 'price');
        const amount = this.safeString2 (order, 'origQty', 'quantity');
        // - Spot/Margin market: cummulativeQuoteQty
        // - Futures market: cumQuote.
        //   Note this is not the actual cost, since Binance futures uses leverage to calculate margins.
        let cost = this.safeString2 (order, 'cummulativeQuoteQty', 'cumQuote');
        cost = this.safeString (order, 'cumBase', cost);
        const id = this.safeString (order, 'orderId');
        let type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const fills = this.safeValue (order, 'fills', []);
        const clientOrderId = this.safeString (order, 'clientOrderId');
        let timeInForce = this.safeString (order, 'timeInForce');
        if (timeInForce === 'GTX') {
            // GTX means "Good Till Crossing" and is an equivalent way of saying Post Only
            timeInForce = 'PO';
        }
        const postOnly = (type === 'limit_maker') || (timeInForce === 'PO');
        if (type === 'limit_maker') {
            type = 'limit';
        }
        const stopPriceString = this.safeString (order, 'stopPrice');
        const stopPrice = this.parseNumber (this.omitZero (stopPriceString));
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeValue (order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': {
                'currency': this.safeString (order, 'quoteAsset'),
                'cost': this.safeNumber (order, 'fee'),
                'rate': undefined,
            },
            'trades': fills,
        }, market);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name commex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://binance-docs.github.io/apidocs/spot/en/#all-orders-user_data
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        const filteredOrders = this.filterBy (orders, 'status', 'closed');
        return this.filterBySinceLimit (filteredOrders, since, limit) as Order[];
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name commex#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://www.commex.com/api-docs/en/#all-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchOrders', symbol, since, limit, params) as Order[];
        }
        const market = this.market (symbol);
        const [ query ] = this.handleMarginModeAndParams ('fetchOrders', params);
        const request = {
            'symbol': market['id'],
        };
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAllOrders (this.extend (request, query));
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name commex#cancelOrder
         * @description cancels an open order
         * @see https://www.commex.com/api-docs/en/#delete-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ query ] = this.handleMarginModeAndParams ('cancelOrder', params);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const requestParams = this.omit (query, [ 'type', 'origClientOrderId', 'clientOrderId' ]);
        const response = await this.privateDeleteOrder (this.extend (request, requestParams));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name commex#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://www.commex.com/api-docs/en/#query-order
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ query ] = this.handleMarginModeAndParams ('fetchOrder', params);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const requestParams = this.omit (query, [ 'type', 'clientOrderId', 'origClientOrderId' ]);
        const response = await this.privateGetOrder (this.extend (request, requestParams));
        return this.parseOrder (response, market);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name commex#createOrderRequest
         * @description helper function to build request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object} request to be sent to the exchange
         */
        const market = this.market (symbol);
        const marketType = this.safeString (params, 'type', market['type']);
        const clientOrderId = this.safeString2 (params, 'newClientOrderId', 'clientOrderId');
        const initialUppercaseType = type.toUpperCase ();
        const isMarketOrder = initialUppercaseType === 'MARKET';
        const isLimitOrder = initialUppercaseType === 'LIMIT';
        const postOnly = this.isPostOnly (isMarketOrder, initialUppercaseType === 'LIMIT_MAKER', params);
        const triggerPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice', triggerPrice);  // fallback to stopLoss
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const trailingDelta = this.safeValue (params, 'trailingDelta');
        const isStopLoss = stopLossPrice !== undefined || trailingDelta !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        params = this.omit (params, [ 'type', 'newClientOrderId', 'clientOrderId', 'postOnly', 'stopLossPrice', 'takeProfitPrice', 'stopPrice', 'triggerPrice' ]);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('createOrder', params);
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
        };
        if (market['spot'] || marketType === 'margin') {
            // only supported for spot/margin api (all margin markets are spot markets)
            if (postOnly) {
                type = 'LIMIT_MAKER';
            }
        }
        if (marketType === 'margin' || marginMode !== undefined) {
            const reduceOnly = this.safeValue (params, 'reduceOnly');
            if (reduceOnly) {
                request['sideEffectType'] = 'AUTO_REPAY';
                params = this.omit (params, 'reduceOnly');
            }
        }
        let uppercaseType = type.toUpperCase ();
        let stopPrice = undefined;
        if (isStopLoss) {
            stopPrice = stopLossPrice;
            if (isMarketOrder) {
                // spot STOP_LOSS market orders are not a valid order type
                uppercaseType = market['contract'] ? 'STOP_MARKET' : 'STOP_LOSS';
            } else if (isLimitOrder) {
                uppercaseType = market['contract'] ? 'STOP' : 'STOP_LOSS_LIMIT';
            }
        } else if (isTakeProfit) {
            stopPrice = takeProfitPrice;
            if (isMarketOrder) {
                // spot TAKE_PROFIT market orders are not a valid order type
                uppercaseType = market['contract'] ? 'TAKE_PROFIT_MARKET' : 'TAKE_PROFIT';
            } else if (isLimitOrder) {
                uppercaseType = market['contract'] ? 'TAKE_PROFIT' : 'TAKE_PROFIT_LIMIT';
            }
        }
        if (marginMode === 'isolated') {
            request['isIsolated'] = true;
        }
        if (clientOrderId === undefined) {
            const broker = this.safeValue (this.options, 'broker', {});
            const defaultId = (market['contract']) ? 'x-xcKtGhcu' : 'x-R4BD3S82';
            const brokerId = this.safeString (broker, marketType, defaultId);
            request['newClientOrderId'] = brokerId + this.uuid22 ();
        } else {
            request['newClientOrderId'] = clientOrderId;
        }
        if ((marketType === 'spot') || (marketType === 'margin')) {
            request['newOrderRespType'] = this.safeValue (this.options['newOrderRespType'], type, 'RESULT'); // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
        } else {
            // swap, futures and options
            request['newOrderRespType'] = 'RESULT';  // "ACK", "RESULT", default "ACK"
        }
        // if (market['option']) {
        //     if (type === 'market') {
        //         throw new InvalidOrder (this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
        //     }
        // } else {
        //     const validOrderTypes = this.safeValue (market['info'], 'orderTypes');
        //     if (!this.inArray (uppercaseType, validOrderTypes)) {
        //         if (initialUppercaseType !== uppercaseType) {
        //             throw new InvalidOrder (this.id + ' stopPrice parameter is not allowed for ' + symbol + ' ' + type + ' orders');
        //         } else {
        //             throw new InvalidOrder (this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
        //         }
        //     }
        // }
        request['type'] = uppercaseType;
        // additional required fields depending on the order type
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        let quantityIsRequired = false;
        //
        // spot/margin
        //
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity or quoteOrderQty
        //     STOP_LOSS            quantity, stopPrice
        //     STOP_LOSS_LIMIT      timeInForce, quantity, price, stopPrice
        //     TAKE_PROFIT          quantity, stopPrice
        //     TAKE_PROFIT_LIMIT    timeInForce, quantity, price, stopPrice
        //     LIMIT_MAKER          quantity, price
        //
        // futures
        //
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity
        //     STOP/TAKE_PROFIT     quantity, price, stopPrice
        //     STOP_MARKET          stopPrice
        //     TAKE_PROFIT_MARKET   stopPrice
        //     TRAILING_STOP_MARKET callbackRate
        //
        if (uppercaseType === 'MARKET') {
            if (market['spot']) {
                const quoteOrderQty = this.safeValue (this.options, 'quoteOrderQty', true);
                if (quoteOrderQty) {
                    const quoteOrderQtyNew = this.safeValue2 (query, 'quoteOrderQty', 'cost');
                    const precision = market['precision']['price'];
                    if (quoteOrderQtyNew !== undefined) {
                        request['quoteOrderQty'] = this.decimalToPrecision (quoteOrderQtyNew, TRUNCATE, precision, this.precisionMode);
                    } else if (price !== undefined) {
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        const quoteOrderQuantity = Precise.stringMul (amountString, priceString);
                        request['quoteOrderQty'] = this.decimalToPrecision (quoteOrderQuantity, TRUNCATE, precision, this.precisionMode);
                    } else {
                        quantityIsRequired = true;
                    }
                } else {
                    quantityIsRequired = true;
                }
            } else {
                quantityIsRequired = true;
            }
        } else if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
            timeInForceIsRequired = true;
            quantityIsRequired = true;
        } else if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
            stopPriceIsRequired = true;
            quantityIsRequired = true;
            if (market['linear'] || market['inverse']) {
                priceIsRequired = true;
            }
        } else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            quantityIsRequired = true;
            stopPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        } else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
            quantityIsRequired = true;
        } else if (uppercaseType === 'STOP') {
            quantityIsRequired = true;
            stopPriceIsRequired = true;
            priceIsRequired = true;
        } else if ((uppercaseType === 'STOP_MARKET') || (uppercaseType === 'TAKE_PROFIT_MARKET')) {
            const closePosition = this.safeValue (query, 'closePosition');
            if (closePosition === undefined) {
                quantityIsRequired = true;
            }
            stopPriceIsRequired = true;
        } else if (uppercaseType === 'TRAILING_STOP_MARKET') {
            quantityIsRequired = true;
            const callbackRate = this.safeNumber (query, 'callbackRate');
            if (callbackRate === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a callbackRate extra param for a ' + type + ' order');
            }
        }
        if (quantityIsRequired) {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (timeInForceIsRequired) {
            request['timeInForce'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (market['contract'] && postOnly) {
            request['timeInForce'] = 'GTX';
        }
        if (stopPriceIsRequired) {
            if (market['contract']) {
                if (stopPrice === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice extra param for a ' + type + ' order');
                }
            } else {
                // check for delta price as well
                if (trailingDelta === undefined && stopPrice === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice or trailingDelta param for a ' + type + ' order');
                }
            }
            if (stopPrice !== undefined) {
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        // remove timeInForce from params because PO is only used by this.isPostOnly and it's not a valid value for Binance
        if (this.safeString (params, 'timeInForce') === 'PO') {
            params = this.omit (params, [ 'timeInForce' ]);
        }
        const requestParams = this.omit (params, [ 'quoteOrderQty', 'cost', 'stopPrice', 'test', 'type', 'newClientOrderId', 'clientOrderId', 'postOnly' ]);
        return this.extend (request, requestParams);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: number = undefined, params = {}) {
        /**
         * @method
         * @name commex#createOrder
         * @description create a trade order
         * @see https://www.commex.com/api-docs/en/#new-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.privatePostOrder (request);
        return this.parseOrder (response, market);
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //
        //     {
        //       "amount": "4500",
        //       "coin": "USDT",
        //       "network": "BSC",
        //       "status": 1,
        //       "address": "0xc9c923c87347ca0f3451d6d308ce84f691b9f501",
        //       "addressTag": "",
        //       "txId": "Internal transfer 51376627901",
        //       "insertTime": 1618394381000,
        //       "transferType": 1,
        //       "confirmTimes": "1/15"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //       "id": "69e53ad305124b96b43668ceab158a18",
        //       "amount": "28.75",
        //       "transactionFee": "0.25",
        //       "coin": "XRP",
        //       "status": 6,
        //       "address": "r3T75fuLjX51mmfb5Sk1kMNuhBgBPJsjza",
        //       "addressTag": "101286922",
        //       "txId": "19A5B24ED0B697E4F0E9CD09FCB007170A605BC93C9280B9E6379C5E6EF0F65A",
        //       "applyTime": "2021-04-15 12:09:16",
        //       "network": "XRP",
        //       "transferType": 0
        //     }
        //
        // fiat transaction
        // withdraw
        //     {
        //       "orderNo": "CJW684897551397171200",
        //       "fiatCurrency": "GBP",
        //       "indicatedAmount": "29.99",
        //       "amount": "28.49",
        //       "totalFee": "1.50",
        //       "method": "bank transfer",
        //       "status": "Successful",
        //       "createTime": 1614898701000,
        //       "updateTime": 1614898820000
        //     }
        //
        // deposit
        //     {
        //       "orderNo": "25ced37075c1470ba8939d0df2316e23",
        //       "fiatCurrency": "EUR",
        //       "transactionType": 0,
        //       "indicatedAmount": "15.00",
        //       "amount": "15.00",
        //       "totalFee": "0.00",
        //       "method": "card",
        //       "status": "Failed",
        //       "createTime": "1627501026000",
        //       "updateTime": "1627501027000"
        //     }
        //
        // withdraw
        //
        //    { id: "9a67628b16ba4988ae20d329333f16bc" }
        //
        const id = this.safeString2 (transaction, 'id', 'orderNo');
        const address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'addressTag'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeString (transaction, 'txId');
        if ((txid !== undefined) && (txid.indexOf ('Internal transfer ') >= 0)) {
            txid = txid.slice (18);
        }
        const currencyId = this.safeString2 (transaction, 'coin', 'fiatCurrency');
        let code = this.safeCurrencyCode (currencyId, currency);
        let timestamp = undefined;
        timestamp = this.safeInteger2 (transaction, 'insertTime', 'createTime');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (transaction, 'applyTime'));
        }
        const updated = this.safeInteger2 (transaction, 'successTime', 'updateTime');
        let type = this.safeString (transaction, 'type');
        if (type === undefined) {
            const txType = this.safeString (transaction, 'transactionType');
            if (txType !== undefined) {
                type = (txType === '0') ? 'deposit' : 'withdrawal';
            }
            const legalMoneyCurrenciesById = this.safeValue (this.options, 'legalMoneyCurrenciesById');
            code = this.safeString (legalMoneyCurrenciesById, code, code);
        }
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const amount = this.safeNumber (transaction, 'amount');
        const feeCost = this.safeNumber2 (transaction, 'transactionFee', 'totalFee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const internalInteger = this.safeInteger (transaction, 'transferType');
        let internal = undefined;
        if (internalInteger !== undefined) {
            internal = internalInteger ? true : false;
        }
        const network = this.safeString (transaction, 'network');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': internal,
            'comment': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statusesByType = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
                '6': 'ok',
                // Fiat
                // Processing, Failed, Successful, Finished, Refunding, Refunded, Refund Failed, Order Partial credit Stopped
                'Processing': 'pending',
                'Failed': 'failed',
                'Successful': 'ok',
                'Refunding': 'canceled',
                'Refunded': 'canceled',
                'Refund Failed': 'failed',
            },
            'withdrawal': {
                '0': 'pending', // Email Sent
                '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
                '2': 'pending', // Awaiting Approval
                '3': 'failed', // Rejected
                '4': 'pending', // Processing
                '5': 'failed', // Failure
                '6': 'ok', // Completed
                // Fiat
                // Processing, Failed, Successful, Finished, Refunding, Refunded, Refund Failed, Order Partial credit Stopped
                'Processing': 'pending',
                'Failed': 'failed',
                'Successful': 'ok',
                'Refunding': 'canceled',
                'Refunded': 'canceled',
                'Refund Failed': 'failed',
            },
        };
        const statuses = this.safeDict (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name commex#fetchDeposits
         * @see https://www.commex.com/api-docs/en/#user-deposit-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchDeposits', code, since, limit, params);
        }
        let currency = undefined;
        let response = undefined;
        const request = {};
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
            let endTime = this.sum (since, 7776000000);
            if (until !== undefined) {
                endTime = Math.min (endTime, until);
            }
            request['endTime'] = endTime;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        response = await this.privateGetCapitalDepositHistory (this.extend (request, params));
        for (let i = 0; i < response.length; i++) {
            response[i]['type'] = 'deposit';
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name binance#fetchWithdrawals
         * @see https://binance-docs.github.io/apidocs/spot/en/#get-fiat-deposit-withdraw-history-user_data
         * @see https://binance-docs.github.io/apidocs/spot/en/#withdraw-history-supporting-network-user_data
         * @description fetch all withdrawals made from an account
         * @see https://binance-docs.github.io/apidocs/spot/en/#get-fiat-deposit-withdraw-history-user_data
         * @see https://binance-docs.github.io/apidocs/spot/en/#withdraw-history-supporting-network-user_data
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.fiat] if true, only fiat withdrawals will be returned
         * @param {int} [params.until] the latest time in ms to fetch withdrawals for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchWithdrawals', code, since, limit, params);
        }
        const request = {};
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        let response = undefined;
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        request['transactionType'] = 1;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
            // max 3 months range https://github.com/ccxt/ccxt/issues/6495
            request['endTime'] = this.sum (since, 7776000000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        response = await this.privateGetCapitalWithdrawHistory (this.extend (request, params));
        //     [
        //       {
        //         "id": "69e53ad305124b96b43668ceab158a18",
        //         "amount": "28.75",
        //         "transactionFee": "0.25",
        //         "coin": "XRP",
        //         "status": 6,
        //         "address": "r3T75fuLjX51mmfb5Sk1kMNuhBgBPJsjza",
        //         "addressTag": "101286922",
        //         "txId": "19A5B24ED0B697E4F0E9CD09FCB007170A605BC93C9280B9E6379C5E6EF0F65A",
        //         "applyTime": "2021-04-15 12:09:16",
        //         "network": "XRP",
        //         "transferType": 0
        //       },
        //       {
        //         "id": "9a67628b16ba4988ae20d329333f16bc",
        //         "amount": "20",
        //         "transactionFee": "20",
        //         "coin": "USDT",
        //         "status": 6,
        //         "address": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //         "txId": "0x77fbf2cf2c85b552f0fd31fd2e56dc95c08adae031d96f3717d8b17e1aea3e46",
        //         "applyTime": "2021-04-15 12:06:53",
        //         "network": "ETH",
        //         "transferType": 0
        //       },
        //       {
        //         "id": "a7cdc0afbfa44a48bd225c9ece958fe2",
        //         "amount": "51",
        //         "transactionFee": "1",
        //         "coin": "USDT",
        //         "status": 6,
        //         "address": "TYDmtuWL8bsyjvcauUTerpfYyVhFtBjqyo",
        //         "txId": "168a75112bce6ceb4823c66726ad47620ad332e69fe92d9cb8ceb76023f9a028",
        //         "applyTime": "2021-04-13 12:46:59",
        //         "network": "TRX",
        //         "transferType": 0
        //       }
        //     ]
        for (let i = 0; i < response.length; i++) {
            response[i]['type'] = 'withdrawal';
        }
        return this.parseTransactions (response, currency, since, limit);
  }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name commex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://www.commex.com/api-docs/en/#get-all-asset
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicPostInnerGetAllAsset (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const enableWithdraw = this.safeBool (entry, 'enableWithdraw');
            const id = this.safeString (entry, 'assetCode');
            const assetName = this.safeString (entry, 'assetName');
            const assetCode = this.safeCurrencyCode (id);
            result[assetCode] = {
                'id': id,
                'name': assetName,
                'code': assetCode,
                'info': entry,
                'withdraw': enableWithdraw,
            };
        }
        return result;
    }
}
