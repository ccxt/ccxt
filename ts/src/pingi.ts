
//  ---------------------------------------------------------------------------

import Exchange from './abstract/pingi.js';
import { Int, Market, OHLCV, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class pingi
 * @augments Exchange
 * @description Pingi OTC exchange implementation
 */
export default class pingi extends Exchange {
    describe () : any {
        return this.deepExtend (super.describe (), {
            'id': 'pingi',
            'name': 'Pingi',
            'countries': [ 'IR' ],
            'rateLimit': 1000,
            'version': '1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'otc': true,
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
                'fetchOrderBook': false,
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
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'comment': 'Pingi OTC Exchange',
            'urls': {
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/pingi/64x64.png',
                'api': {
                    'public': 'https://api5.pingi.co/trading',
                },
                'www': 'https://pingi.co',
                'doc': [
                    'https://pingi.co',
                ],
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': '1D',
                '1w': '1W',
            },
            'api': {
                'public': {
                    'get': {
                        'market/prices': 1,
                        'udf/history': 1,
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
         * @name pingi#fetchMarkets
         * @description retrieves data on all markets for pingi
         * @see https://api5.pingi.co/trading/market/prices/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarketPrices (params);
        // Response structure:
        // {
        //   "statusCode": 200,
        //   "ok": true,
        //   "data": {
        //     "ETH_USDT": {
        //       "market": "ETH_USDT",
        //       "marketId": 6,
        //       "marketVolume": "128889.02937760774364521500000000",
        //       "currentPrice": "4083.7744580000000",
        //       "maxPrice": "4218.0241700000000",
        //       "minPrice": "3786.9124050000000",
        //       "startPrice": "3830.5800220000000",
        //       "marketPlatform": 0
        //     },
        //     "BTC_IRT": {
        //       "market": "BTC_IRT",
        //       "marketId": 8,
        //       "marketVolume": "27140908320.17800246693400000000000000",
        //       "currentPrice": "12909088630.0000000000000",
        //       "maxPrice": "13213902170.0000000000000",
        //       "minPrice": "12000000000.0000000000000",
        //       "startPrice": "12752332240.0000000000000",
        //       "marketPlatform": 0
        //     },
        //     ...
        //   }
        // }
        const data = this.safeDict (response, 'data', {});
        const marketKeys = Object.keys (data);
        const result = [];
        for (let i = 0; i < marketKeys.length; i++) {
            const marketId = marketKeys[i];
            const marketData = data[marketId];
            const market = this.parseMarket (marketData);
            result.push (market);
        }
        return result;
    }

    parseMarket (market): Market {
        //  {
        //    "market": "BTC_IRT",
        //    "marketId": 8,
        //    "marketVolume": "27140908320.17800246693400000000000000",
        //    "currentPrice": "12909088630.0000000000000",
        //    "maxPrice": "13213902170.0000000000000",
        //    "minPrice": "12000000000.0000000000000",
        //    "startPrice": "12752332240.0000000000000",
        //    "marketPlatform": 0
        //  }
        const id = this.safeString (market, 'market');
        const parts = id.split ('_');
        let baseId = this.safeString (parts, 0);
        let quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        baseId = baseId.toLowerCase ();
        quoteId = quoteId.toLowerCase ();
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
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
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
            'created': undefined,
            'info': market,
        };
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name pingi#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api5.pingi.co/trading/market/prices/
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const response = await this.publicGetMarketPrices (params);
        // Response structure:
        // {
        //   "statusCode": 200,
        //   "ok": true,
        //   "data": {
        //     "ETH_USDT": {
        //       "market": "ETH_USDT",
        //       "marketId": 6,
        //       "marketVolume": "128889.02937760774364521500000000",
        //       "currentPrice": "4083.7744580000000",
        //       "maxPrice": "4218.0241700000000",
        //       "minPrice": "3786.9124050000000",
        //       "startPrice": "3830.5800220000000",
        //       "marketPlatform": 0
        //     },
        //     ...
        //   }
        // }
        const data = this.safeDict (response, 'data', {});
        const marketKeys = Object.keys (data);
        const result = {};
        for (let i = 0; i < marketKeys.length; i++) {
            const marketId = marketKeys[i];
            const marketData = data[marketId];
            const ticker = this.parseTicker (marketData);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name pingi#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api5.pingi.co/trading/market/prices/
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetMarketPrices (params);
        // Response structure:
        // {
        //   "statusCode": 200,
        //   "ok": true,
        //   "data": {
        //     "BTC_IRT": {
        //       "market": "BTC_IRT",
        //       "marketId": 8,
        //       "marketVolume": "27140908320.17800246693400000000000000",
        //       "currentPrice": "12909088630.0000000000000",
        //       "maxPrice": "13213902170.0000000000000",
        //       "minPrice": "12000000000.0000000000000",
        //       "startPrice": "12752332240.0000000000000",
        //       "marketPlatform": 0
        //     },
        //     ...
        //   }
        // }
        const data = this.safeDict (response, 'data', {});
        const tickerData = this.safeDict (data, market['id']);
        return this.parseTicker (tickerData, market);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        //   "market": "BTC_IRT",
        //   "marketId": 8,
        //   "marketVolume": "27140908320.17800246693400000000000000",
        //   "currentPrice": "12909088630.0000000000000",
        //   "maxPrice": "13213902170.0000000000000",
        //   "minPrice": "12000000000.0000000000000",
        //   "startPrice": "12752332240.0000000000000",
        //   "marketPlatform": 0
        // }
        const marketType = 'otc';
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market, '_', marketType);
        const last = this.safeString (ticker, 'currentPrice');
        const high = this.safeString (ticker, 'maxPrice');
        const low = this.safeString (ticker, 'minPrice');
        const open = this.safeString (ticker, 'startPrice');
        const baseVolume = this.safeString (ticker, 'marketVolume');
        // Calculate change and percentage
        let change = undefined;
        let percentage = undefined;
        if (open !== undefined && last !== undefined) {
            const openNum = this.parseNumber (open);
            const lastNum = this.parseNumber (last);
            if (openNum !== undefined && lastNum !== undefined && openNum > 0) {
                change = this.parseNumber (this.numberToString (lastNum - openNum));
                percentage = this.parseNumber (this.numberToString ((lastNum - openNum) / openNum * 100));
            }
        }
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
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1d', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name pingi#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api5.pingi.co/trading/udf/history/
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
            'symbol': market['base'] + '/' + market['quote'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
            'from': (endTime / 1000) - (30 * 24 * 60 * 60), // 30 days ago
            'to': endTime / 1000,
        };
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        request['from'] = this.safeInteger (request, 'from');
        request['to'] = this.safeInteger (request, 'to');
        const response = await this.publicGetUdfHistory (request);
        // Response structure:
        // {
        //   "c": [12710726290.0, 12732737270.0, ...],  // close prices
        //   "v": [0.015461630724, 0.024055443184, ...], // volumes
        //   "l": [12702815580.0, 12689256670.0, ...],  // low prices
        //   "h": [12723701120.0, 12752332240.0, ...],  // high prices
        //   "o": [12752332240.0, 12710726290.0, ...],  // open prices
        //   "t": [1760271600, 1760272500, ...]         // timestamps
        // }
        const closeList = this.safeList (response, 'c', []);
        const volumeList = this.safeList (response, 'v', []);
        const lowList = this.safeList (response, 'l', []);
        const highList = this.safeList (response, 'h', []);
        const openList = this.safeList (response, 'o', []);
        const timestampList = this.safeList (response, 't', []);
        const ohlcvs = [];
        for (let i = 0; i < openList.length; i++) {
            ohlcvs.push ([
                this.safeTimestamp (timestampList, i),
                this.safeNumber (openList, i),
                this.safeNumber (highList, i),
                this.safeNumber (lowList, i),
                this.safeNumber (closeList, i),
                this.safeNumber (volumeList, i),
            ]);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['public'] + '/' + path;
        if (path === 'market/prices') {
            url = url + '/';
        }
        if (path === 'udf/history') {
            url = url + '/?' + this.urlencode (query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
