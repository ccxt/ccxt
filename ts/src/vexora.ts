//  ---------------------------------------------------------------------------
import Exchange from './abstract/vexora.js';
import { ExchangeError, RateLimitExceeded, BadResponse } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, OrderBook, Ticker, Trade, OHLCV, Int, Market } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class vexora
 * @augments Exchange
 */
export default class vexora extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'vexora',
            'name': 'Vexora',
            'countries': [ 'RU' ],
            'version': 'v1',
            'rateLimit': 250,
            'certified': false,
            'pro': false,
            'urls': {
                'logo': 'https://coin.smartcore.su/favicon.png',
                'api': {
                    'public': 'https://trade.smartcore.su/api',
                },
                'www': 'https://trade.smartcore.su',
                'doc': 'https://trade.smartcore.su/swagger-ui/index.html',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': false,
                'createOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTickers': false,
                'fetchTicker': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchWithdrawals': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'api': {
                'public': {
                    'get': {
                        'products': 1,
                        'products/{id}/book': 1,
                        'products/{id}/trades': 1,
                        'products/{id}/candles': 1,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '429': RateLimitExceeded,
                },
            },
            'options': {
                // the public trades endpoint is capped by the exchange at the
                // most recent 50 trades and exposes no pagination parameters;
                // ticker aggregates are therefore computed over that window
                'tradesWindowLimit': 50,
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {},
        });
    }

    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict {
        const apiName = api[0];
        const baseApiUrl = this.safeString (this.urls['api'], apiName);
        if (baseApiUrl === undefined) {
            throw new ExchangeError (this.id + ' sign() has no API URL for ' + apiName);
        }
        let url = baseApiUrl + '/' + path;
        if ((method.toUpperCase () !== 'POST') && (Object.keys (params).length > 0)) {
            url += '?' + this.urlencode (params);
        }
        return {
            'url': url,
            'method': method,
            'body': undefined,
            'headers': { 'Accept': 'application/json' },
        };
    }

    /**
     * @method fetchMarkets
     * @description retrieves the list of markets from the public products endpoint
     * @see https://trade.smartcore.su/api/products
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of @link market unified structures
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const products = await this.publicGetProducts (params) as any;
        const result: Market[] = [];
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            result.push (this.marketFromProduct (product));
        }
        return result;
    }

    override parseMarket (product: Dict): Market {
        return this.marketFromProduct (product) as Market;
    }

    marketFromProduct (product: Dict): Market {
        const baseScale = this.safeInteger (product, 'baseScale', 8);
        const quoteScale = this.safeInteger (product, 'quoteScale', 8);
        const market: Dict = {
            'id': this.safeString (product, 'id'),
            'symbol': this.safeSymbol (this.safeString (product, 'id'), undefined, '-'),
            'base': this.safeCurrencyCode (this.safeString (product, 'baseCurrency')),
            'quote': this.safeCurrencyCode (this.safeString (product, 'quoteCurrency')),
            'settle': undefined,
            'baseId': this.safeString (product, 'baseCurrency'),
            'quoteId': this.safeString (product, 'quoteCurrency'),
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
                'amount': Math.pow (10, -baseScale),
                'price': Math.pow (10, -quoteScale),
            },
            'limits': {
                'leverage': { 'min': undefined, 'max': undefined },
                'amount': {
                    'min': this.safeNumber (product, 'baseMinSize'),
                    'max': this.safeNumber (product, 'baseMaxSize'),
                },
                'price': {
                    'min': this.safeNumber (product, 'quoteIncrement'),
                    'max': undefined,
                },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'created': undefined,
            'info': product,
        };
        return market as Market;
    }

    /**
     * @method fetchOrderBook
     * @description fetches information on open orders with bid buy and sell ask prices, volumes and other orderbook details
     * @see https://trade.smartcore.su/api/products/{id}/book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of @link order-book structures
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetProductsIdBook (market['id'] as string, params);
        return this.parseOrderBook (response, market['symbol'], this.safeInteger (response, 'time'), 'bids', 'asks', 0, 1, 2);
    }

    /**
     * @method fetchTrades
     * @description get the list of most recent trades for a currency or symbol
     * @see https://trade.smartcore.su/api/products/{id}/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to report — not supported by the endpoint, filtered locally
     * @param {int} [limit] the maximum amount of trades to report, capped by the exchange at 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of @link trade structures
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetProductsIdTrades (market['id'] as string, params);
        // the exchange returns at most the 50 most recent trades, newest first
        const trades = this.parseTrades (response as any, market, since, limit);
        return this.sortBy (trades, 'timestamp');
    }

    override parseTrade (trade: Dict, market: Market = undefined): any {
        const marketId = this.safeString (trade, 'productId');
        const symbol = (marketId !== undefined) ? this.safeSymbol (marketId, market, '-') : this.safeSymbol (undefined, market);
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const side = this.safeStringLower (trade, 'side');
        const id = this.safeString (trade, 'sequence');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side as any,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        };
    }

    /**
     * @method fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://trade.smartcore.su/api/products/{id}/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to report — filtered locally, the endpoint only returns the most recent window
     * @param {int} [limit] the maximum amount of candles to report
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'granularity': this.safeInteger (this.timeframes, timeframe, 3600),
        };
        const response = await this.publicGetProductsIdCandles (market['id'] as string, this.extend (request, params));
        // returned newest-first, bars exist only for buckets that contain trades
        const ohlcvs = this.parseOHLCVs (response as any, market, timeframe, since, limit);
        return this.sortBy (ohlcvs, 0);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        // the API returns unix timestamps in seconds; ccxt expects milliseconds
        return [
            this.safeIntegerProduct (ohlcv, 0, 1000),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ] as OHLCV;
    }

    /**
     * @method fetchTicker
     * @description fetches information on price, a 24-hour trading stats for a specific market; note that the exchange exposes only the most recent 50 trades, so aggregates are computed over that window
     * @see https://trade.smartcore.su/api/products/{id}/book
     * @param {string} symbol unified symbol of the market to fetch a ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a @link ticker structure
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const bookRequest = await this.publicGetProductsIdBook (market['id'] as string, params);
        const tradesResponse = await this.publicGetProductsIdTrades (market['id'] as string, params);
        const timestamp = this.safeInteger (bookRequest, 'time');
        let last: number | undefined = undefined;
        let open: number | undefined = undefined;
        let high: number | undefined = undefined;
        let low: number | undefined = undefined;
        let baseVolume = 0;
        let quoteVolume = 0;
        // the exchange returns trades newest-first, so they are aggregated
        // directly: index 0 is the latest trade, the last visited is the oldest
        for (let i = 0; i < tradesResponse['length']; i++) {
            const trade = tradesResponse[i];
            const price = this.safeNumber (trade, 'price');
            const amount = this.safeNumber (trade, 'size');
            if (price === undefined || amount === undefined) {
                continue;
            }
            if (i === 0) {
                last = price;
            }
            open = price;
            high = (high === undefined) ? price : Math.max (high, price);
            low = (low === undefined) ? price : Math.min (low, price);
            baseVolume = this.sum (baseVolume, amount);
            quoteVolume = this.sum (quoteVolume, price * amount);
        }
        const bidsArray = this.safeValue (bookRequest, 'bids', []) as number[][];
        const asksArray = this.safeValue (bookRequest, 'asks', []) as number[][];
        const bestBid = (bidsArray.length > 0) ? bidsArray[0] : undefined;
        const bestAsk = (asksArray.length > 0) ? asksArray[0] : undefined;
        const ticker: Dict = {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'last': last,
            'high': high,
            'low': low,
            'bid': (bestBid !== undefined) ? this.safeNumber (bestBid, 0) : undefined,
            'bidVolume': (bestBid !== undefined) ? this.safeNumber (bestBid, 1) : undefined,
            'ask': (bestAsk !== undefined) ? this.safeNumber (bestAsk, 0) : undefined,
            'askVolume': (bestAsk !== undefined) ? this.safeNumber (bestAsk, 1) : undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': { 'book': bookRequest, 'tradesCount': tradesResponse['length'] },
        };
        return this.safeTicker (ticker, market);
    }

    override handleErrors (statusCode: number, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any): undefined {
        const message = this.safeString (response, 'message');
        if (statusCode === 429) {
            throw new RateLimitExceeded (this.id + ' rate limit exceeded' + ((message !== undefined) ? (': ' + message) : ''));
        }
        if (message !== undefined) {
            if (statusCode >= 400 && statusCode < 500) {
                throw new BadResponse (this.id + ' ' + message);
            }
            // the exchange wraps most internal failures (including unknown
            // product lookups) into HTTP 500 with a { "message": ... } body
            if (statusCode >= 500) {
                throw new ExchangeError (this.id + ' ' + message);
            }
        }
        return undefined;
    }
}
