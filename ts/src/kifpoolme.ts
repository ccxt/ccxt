
//  ---------------------------------------------------------------------------
import Exchange from './abstract/kifpoolme.js';
import { Int, Market, OHLCV, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class kifpoolme
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class kifpoolme extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'kifpoolme',
            'name': 'Kifpool',
            'countries': [ 'IR' ],
            'rateLimit': 1000,
            'version': '1',
            'certified': false,
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
            'comment': 'This comment is optional',
            'urls': {
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/kifpoolme/64x64.png',
                'api': {
                    'public': 'https://api.kifpool.app',
                },
                'www': 'https://kifpool.me/',
                'doc': [
                    'https://kifpool.me/',
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
                        'api/spot/price': 1,
                        'api/spot/tickers/1m': 1,
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

    parseMarket (market): Market {
        // {
        //     "symbol": "BTC",
        //     "faName": "بیت کوین",
        //     "name": "Bitcoin",
        //     "smallImage": "https://kifpool.me/uploads/coin-new-images/bitcoin.png",
        //     "price": 115430,
        //     "priceBuyIRT": 13043590000,
        //     "priceSellIRT": 13135934000,
        //     "volume": 1700068128.9919832,
        //     "priceChangePercent": 3.4799999999999995,
        //     "high": 115968.8,
        //     "low": 111145.4,
        //     "slug": "bitcoin-BTC"
        // }
        const baseId = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteId', 'USDT');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const id = baseId + '/' + quoteId;
        return {
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

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name kifpoolme#fetchMarkets
         * @description retrieves data on all markets for kifpoolme
         * @see https://api.kifpool.app/api/spot/price
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetApiSpotPrice (params);
        const result = [];
        // Response is an array of coin objects
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            // Create markets for both USDT and IRT quotes
            const quotes = [ 'USDT', 'IRT' ];
            for (let j = 0; j < quotes.length; j++) {
                const quoteId = quotes[j];
                const marketData = this.extend (item, {
                    'quoteId': quoteId,
                });
                const market = this.parseMarket (marketData);
                result.push (market);
            }
        }
        return result;
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name kifpoolme#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api.kifpool.app/api/spot/price
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        // Extract base symbols from the requested symbols
        let symbolsParam = undefined;
        if (symbols !== undefined && symbols.length > 0) {
            const baseSymbols = [];
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                if (!(market['baseId'] in baseSymbols)) {
                    baseSymbols.push (market['baseId']);
                }
            }
            symbolsParam = baseSymbols.join (',');
        }
        const request = {};
        if (symbolsParam !== undefined) {
            request['symbol'] = symbolsParam;
        }
        const response = await this.publicGetApiSpotPrice (this.extend (request));
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const baseId = this.safeString (item, 'symbol');
            // Create tickers for both USDT and IRT quotes
            const quotes = [ 'USDT', 'IRT' ];
            for (let j = 0; j < quotes.length; j++) {
                const quoteId = quotes[j];
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const symbol = base + '/' + quote;
                const ticker = this.extend (item, {
                    'quoteId': quoteId,
                    'marketId': baseId + '/' + quoteId,
                });
                result[symbol] = this.parseTicker (ticker);
            }
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name kifpoolme#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.kifpool.app/api/spot/price
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers ([ symbol ], params);
        return ticker[symbol];
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        //     "symbol": "BTC",
        //     "faName": "بیت کوین",
        //     "name": "Bitcoin",
        //     "smallImage": "https://kifpool.me/uploads/coin-new-images/bitcoin.png",
        //     "price": 115430,               // USDT price
        //     "priceBuyIRT": 13043590000,    // IRT buy price
        //     "priceSellIRT": 13135934000,   // IRT sell price
        //     "volume": 1700068128.9919832,
        //     "priceChangePercent": 3.48,
        //     "high": 115968.8,
        //     "low": 111145.4,
        //     "slug": "bitcoin-BTC",
        //     "quoteId": "USDT" or "IRT"
        // }
        const marketType = 'spot';
        const marketId = this.safeString (ticker, 'marketId');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const quoteId = this.safeString (ticker, 'quoteId', 'USDT');
        let last = undefined;
        let bid = undefined;
        let ask = undefined;
        if (quoteId === 'IRT') {
            // For IRT: priceSellIRT is the sell price (bid), priceBuyIRT is the buy price (ask)
            bid = this.safeNumber (ticker, 'priceSellIRT');
            ask = this.safeNumber (ticker, 'priceBuyIRT');
            last = ask;
        } else {
            // For USDT: price is in USDT
            const price = this.safeNumber (ticker, 'price');
            last = price;
            bid = price;
            ask = price;
        }
        const high = this.safeNumber (ticker, 'high');
        const low = this.safeNumber (ticker, 'low');
        const percentage = this.safeNumber (ticker, 'priceChangePercent');
        const baseVolume = this.safeNumber (ticker, 'volume');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name kifpoolme#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api.kifpool.app/api/spot/tickers/1m
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
            'symbol': market['baseId'],
            'currency': market['quoteId'],
            'fromTs': Math.floor ((endTime / 1000) - (24 * 60 * 60)),
            'toTs': Math.floor (endTime / 1000),
        };
        if (since !== undefined) {
            request['fromTs'] = Math.floor (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetApiSpotTickers1m (request);
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        // {
        //     "data_captured_datetime": 1760169720,
        //     "open": 110419.9,
        //     "high": 110468.4,
        //     "low": 110330.7,
        //     "close": 110330.7,
        //     "volume": 3356941116.288925,
        //     "changePercentage": -0.0808
        // }
        return [
            this.safeTimestamp (ohlcv, 'data_captured_datetime'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['public'] + '/' + path;
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
