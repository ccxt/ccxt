import Exchange from './abstract/commex.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import type { Int, OHLCV, OrderBook } from './base/types.js';

/**
 * @class commex
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
                'future': true,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
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
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': {
                    'public': 'https://api.commex.com/api',
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
                        'ticker/bookTicker',
                        'exchangeInfo',
                        'klines',
                        'time',
                        'depth',
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
        const markets = this.safeValue (response, 'symbols', {});
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const altName = this.safeString (market, 'symbol');
            const firstMakerFeeRate = undefined;
            let maker = undefined;
            if (firstMakerFeeRate !== undefined) {
                maker = this.parseNumber (Precise.stringDiv (firstMakerFeeRate, '100'));
            }
            const firstTakerFeeRate = undefined;
            let taker = undefined;
            if (firstTakerFeeRate !== undefined) {
                taker = this.parseNumber (Precise.stringDiv (firstTakerFeeRate, '100'));
            }
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
                'taker': taker,
                'maker': maker,
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
            const isCancelOrderBatch = (path === 'CancelOrderBatch');
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            // urlencodeNested is used to address https://github.com/ccxt/ccxt/issues/12872
            if (isCancelOrderBatch) {
                body = this.json (this.extend ({ 'nonce': nonce }, params));
            } else {
                body = this.urlencodeNested (this.extend ({ 'nonce': nonce }, params));
            }
            const auth = this.encode (nonce + body);
            const hash = this.hash (auth, sha256, 'binary');
            const binary = this.encode (url);
            const binhash = this.binaryConcat (binary, hash);
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (binhash, secret, sha512, 'base64');
            headers = {
                'API-Key': this.apiKey,
                'API-Sign': signature,
                // 'Content-Type': 'application/x-www-form-urlencoded',
            };
            if (isCancelOrderBatch) {
                headers['Content-Type'] = 'application/json';
            } else {
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

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name commex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.commex.com/api-docs/en/?shell#order-book
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
        if (limit !== undefined) {
            request['limit'] = limit; // 100
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response, symbol);
    }
}
