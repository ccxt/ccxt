
//  ---------------------------------------------------------------------------

import Exchange from './abstract/mazdax.js';
import { Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class mazdax
 * @augments Exchange
 * @description Mazdax OTC exchange implementation
 */
export default class mazdax extends Exchange {
    describe () : any {
        return this.deepExtend (super.describe (), {
            'id': 'mazdax',
            'name': 'Mazdax',
            'countries': [ 'IR' ],
            'rateLimit': 1000,
            'version': '1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': false,
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
                'fetchL2OrderBook': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': 'emulated',
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': false,
                'otc': true,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'comment': 'Mazdax OTC Exchange',
            'urls': {
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/mazdax/64x64.png',
                'api': {
                    'public': 'https://api.mazdax.ir',
                },
                'www': 'https://mazdax.ir',
                'doc': [
                    'https://api.mazdax.ir',
                ],
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
            'api': {
                'public': {
                    'get': {
                        'market/symbols': 1,
                        'market/rollingprice': 1,
                        'market/candle': 1,
                        'market/order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name mazdax#fetchMarkets
         * @description retrieves data on all markets for mazdax
         * @see https://api.mazdax.ir/market/symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarketSymbols (params);
        // Response is an array of market objects:
        // [
        //   {
        //     "id": 67,
        //     "createdAt": "2022-12-26T07:33:25Z",
        //     "updatedAt": "2025-07-04T16:18:57Z",
        //     "order": 2,
        //     "symbol": "AHRM1IRR",
        //     "baseAsset": "AHRM1",
        //     "baseAssetTranslate": "AHRM1",
        //     "baseAssetPrecision": 0,
        //     "quoteAsset": "IRR",
        //     "quoteAssetTranslate": "IRR",
        //     "takerFee": "0.00116",
        //     "makerFee": "0.001044",
        //     "quoteAssetPrecision": 0,
        //     "isTradable": true,
        //     "isActive": true,
        //     "isPublic": true,
        //     "minimumOrderSize": "100000",
        //     "maximumOrderSize": "0",
        //     "minimumPrice": "0",
        //     "maximumPrice": "0",
        //     "marketCOV": "0.01",
        //     "marketCap": "10",
        //     "tickSize": "1",
        //     "stepSize": "1",
        //     ...
        //   }
        // ]
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = this.parseMarket (response[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (market): Market {
        //  {
        //    "id": 67,
        //    "createdAt": "2022-12-26T07:33:25Z",
        //    "updatedAt": "2025-07-04T16:18:57Z",
        //    "order": 2,
        //    "symbol": "AHRM1IRR",
        //    "baseAsset": "AHRM1",
        //    "baseAssetTranslate": "AHRM1",
        //    "baseAssetPrecision": 0,
        //    "quoteAsset": "IRR",
        //    "quoteAssetTranslate": "IRR",
        //    "takerFee": "0.00116",
        //    "makerFee": "0.001044",
        //    "quoteAssetPrecision": 0,
        //    "isTradable": true,
        //    "isActive": true,
        //    "isPublic": true,
        //    "minimumOrderSize": "100000",
        //    "maximumOrderSize": "0",
        //    "minimumPrice": "0",
        //    "maximumPrice": "0",
        //    "marketCOV": "0.01",
        //    "marketCap": "10",
        //    "tickSize": "1",
        //    "stepSize": "1",
        //    ...
        //  }
        const id = this.safeString (market, 'symbol');
        let baseId = this.safeString (market, 'baseAsset');
        let quoteId = this.safeString (market, 'quoteAsset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        baseId = baseId.toLowerCase ();
        quoteId = quoteId.toLowerCase ();
        const isActive = this.safeBool (market, 'isActive', false);
        const isTradable = this.safeBool (market, 'isTradable', false);
        const active = isActive && isTradable;
        return {
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'otc',
            'spot': false,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'baseAssetPrecision'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'quoteAssetPrecision'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'minimumOrderSize'),
                    'max': this.safeNumber (market, 'maximumOrderSize'),
                },
                'price': {
                    'min': this.safeNumber (market, 'minimumPrice'),
                    'max': this.safeNumber (market, 'maximumPrice'),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': this.parse8601 (this.safeString (market, 'createdAt')),
            'info': market,
        };
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name mazdax#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api.mazdax.ir/market/rollingprice
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const markets = await this.fetchMarkets ();
        const result = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = market['id'];
            const request = {
                'from': 'mazdax',
                'symbol': marketId,
            };
            try {
                const response = await this.publicGetMarketRollingprice (request);
                // {
                //   "AHRM1IRR": {
                //     "symbol": "AHRM1IRR",
                //     "priceChange": "525",
                //     "priceChangePercent": "2.077",
                //     "weightedAvgPrice": "0",
                //     "prevClosePrice": "0",
                //     "lastPrice": "25800",
                //     "lastQty": "14050",
                //     "bidPrice": "0",
                //     "askPrice": "0",
                //     "openPrice": "25275",
                //     "highPrice": "26200",
                //     "lowPrice": "25274",
                //     "volume": "1076873",
                //     "valueIrr": "55104642690",
                //     "openTime": 1760271737577,
                //     "closeTime": 1760351215075,
                //     "count": 348
                //   }
                // }
                const tickerData = this.safeDict (response, marketId);
                if (tickerData !== undefined) {
                    const ticker = this.parseTicker (tickerData, market);
                    const symbol = ticker['symbol'];
                    result[symbol] = ticker;
                }
            } catch (e) {
                // Skip markets that fail
                continue;
            }
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name mazdax#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.mazdax.ir/market/rollingprice
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'from': 'mazdax',
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketRollingprice (request);
        // {
        //   "AHRM1IRR": {
        //     "symbol": "AHRM1IRR",
        //     "priceChange": "525",
        //     "priceChangePercent": "2.077",
        //     "weightedAvgPrice": "0",
        //     "prevClosePrice": "0",
        //     "lastPrice": "25800",
        //     "lastQty": "14050",
        //     "bidPrice": "0",
        //     "askPrice": "0",
        //     "openPrice": "25275",
        //     "highPrice": "26200",
        //     "lowPrice": "25274",
        //     "volume": "1076873",
        //     "valueIrr": "55104642690",
        //     "openTime": 1760271737577,
        //     "closeTime": 1760351215075,
        //     "count": 348
        //   }
        // }
        const tickerData = this.safeDict (response, market['id']);
        return this.parseTicker (tickerData, market);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        //   "symbol": "AHRM1IRR",
        //   "priceChange": "525",
        //   "priceChangePercent": "2.077",
        //   "weightedAvgPrice": "0",
        //   "prevClosePrice": "0",
        //   "lastPrice": "25800",
        //   "lastQty": "14050",
        //   "bidPrice": "0",
        //   "askPrice": "0",
        //   "openPrice": "25275",
        //   "highPrice": "26200",
        //   "lowPrice": "25274",
        //   "volume": "1076873",
        //   "valueIrr": "55104642690",
        //   "openTime": 1760271737577,
        //   "closeTime": 1760351215075,
        //   "count": 348
        // }
        const marketType = 'otc';
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        const bid = this.safeString (ticker, 'bidPrice');
        const ask = this.safeString (ticker, 'askPrice');
        const last = this.safeString (ticker, 'lastPrice');
        const open = this.safeString (ticker, 'openPrice');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString (ticker, 'valueIrr');
        const priceChange = this.safeString (ticker, 'priceChange');
        const percentage = this.safeString (ticker, 'priceChangePercent');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': priceChange,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1d', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name mazdax#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api.mazdax.ir/market/candle
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const endTime = Date.now ();
        const request = {
            'from': 'binance',
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
            'limit': limit !== undefined ? limit : 1000,
            'starttime': (endTime) - (30 * 24 * 60 * 60 * 1000), // 30 days ago
            'endtime': endTime,
        };
        if (since !== undefined) {
            request['starttime'] = since / 1000;
        }
        const response = await this.publicGetMarketCandle (request);
        // {
        //   "Candles": [
        //     {
        //       "openTime": "2021-12-20T03:30:00+03:30",
        //       "openPrice": "10000",
        //       "highPrice": "10000",
        //       "lowPrice": "10000",
        //       "closePrice": "10000",
        //       "volume": "490000000",
        //       "closeTime": "2021-12-20T03:30:00+03:30",
        //       "quoteAssetVolume": "0",
        //       "numberOfTrades": 0,
        //       "takerBuyBaseAssetVolume": "0",
        //       "takerBuyQuoteAssetVolume": "0",
        //       "ignore": "0"
        //     },
        //     ...
        //   ]
        // }
        const candles = this.safeList (response, 'Candles', []);
        const ohlcvs = [];
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const timestamp = this.parse8601 (this.safeString (candle, 'openTime'));
            const open = this.safeString (candle, 'openPrice');
            const high = this.safeString (candle, 'highPrice');
            const low = this.safeString (candle, 'lowPrice');
            const close = this.safeString (candle, 'closePrice');
            const volume = this.safeString (candle, 'volume');
            ohlcvs.push ([
                timestamp,
                open,
                high,
                low,
                close,
                volume,
            ]);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name mazdax#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://api.mazdax.ir/market/order
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'from': 'mazdax',
            'symbol': market['id'],
            'limit': limit !== undefined ? limit : 25,
        };
        const response = await this.publicGetMarketOrder (request);
        // {
        //   "timestamp": "0001-01-01T00:00:00Z",
        //   "bids": [
        //     ["25321", "9344"],
        //     ["25320", "15000"],
        //     ...
        //   ],
        //   "asks": [
        //     ["26190", "5341"],
        //     ["26195", "2310"],
        //     ...
        //   ]
        // }
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 0, 1);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['public'] + '/' + path;
        if (Object.keys (query).length) {
            url = url + '?' + this.urlencode (query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
