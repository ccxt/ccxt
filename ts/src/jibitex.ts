
//  ---------------------------------------------------------------------------

import Exchange from './abstract/jibitex.js';
import { Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class jibitex
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class jibitex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'jibitex',
            'name': 'Jibitex',
            'country': [ 'IR' ],
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
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'comment': 'This comment is optional',
            'urls': {
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/jibitex/64x64.png',
                'api': {
                    'public': 'https://jibitex.co',
                },
                'www': 'https://jibitex.net',
                'doc': [
                    'https://jibitex.net',
                ],
            },
            'timeframes': {
                '1h': '60',
                '2h': '120',
                '1d': '1D',
                '1w': '1W',
            },
            'api': {
                'public': {
                    'get': {
                        'api/1/markets': 1,
                        'api/1/ohlcvs/tradingView': 1,
                        'api/1/orders/orderBook/market': 1,
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

    async fetchMarkets (symbols: Strings = undefined, params = {}): Promise<Market[]> {
        /**
         * @method
         * @name jibitex#fetchMarkets
         * @description retrieves data on all markets for jibitex
         * @see https://jibitex.co/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetApi1Markets ();
        const markets = this.safeList (response, 'content');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = await this.parseMarket (markets[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (market): Market {
        // {
        //     "id": "BTC_IRT",
        //     "symbol": "بیت کوین-تومان",
        //     "base": "BTC",
        //     "quote": "IRT",
        //     "buyPrice": "4033165000",
        //     "sellPrice": "4150000000",
        //     "userOrderPricePrecision": 0,
        //     "minimumOrder": 100000.00000000,
        //     "maximumOrder": 300000000.00000000,
        //     "last7DayGraph": "https://jibitex.co/api/1/markets/BTC_IRT/7d-price-graph",
        //     "changePrice": "-4298000",
        //     "changeRate": "-0.11",
        //     "changePrice7d": "-47147000",
        //     "lastTradedPrice": "4025872000",
        //     "lowestPrice": "4004218000",
        //     "highestPrice": "4149839000",
        //     "sourceVolume": "0.002",
        //     "destinationVolume": "115146752",
        //     "rank": 1,
        //     "baseTags": {
        //         "en": [
        //             "POW"
        //         ]
        //     },
        //     "quoteTags": {},
        //     "tradingEnabled": true,
        //     "swappingEnabled": false
        // },
        const id = this.safeString (market, 'id');
        let baseId = this.safeString (market, 'base');
        let quoteId = this.safeString (market, 'quote');
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

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name jibitex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://jibitex.co/
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const request = {
            'with_price': 'true',
        };
        const response = await this.publicGetApi1Markets (request);
        const markets = this.safeList (response, 'content');
        const result = {};
        for (let i = 0; i < markets.length; i++) {
            const ticker = await this.parseTicker (markets[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name jibitex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://jibitex.co/
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'with_price': 'true',
            'quote': market['quote'],
            'base': market['base'],
        };
        const response = await this.publicGetApi1Markets (request);
        const marketData = this.safeList (response, 'content');
        const ticker = await this.parseTicker (marketData[0]);
        return ticker;
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        //     "id": "BTC_IRT",
        //     "symbol": "بیت کوین-تومان",
        //     "base": "BTC",
        //     "quote": "IRT",
        //     "buyPrice": "4033165000",
        //     "sellPrice": "4150000000",
        //     "userOrderPricePrecision": 0,
        //     "minimumOrder": 100000.00000000,
        //     "maximumOrder": 300000000.00000000,
        //     "last7DayGraph": "https://jibitex.co/api/1/markets/BTC_IRT/7d-price-graph",
        //     "changePrice": "-4298000",
        //     "changeRate": "-0.11",
        //     "changePrice7d": "-47147000",
        //     "lastTradedPrice": "4025872000",
        //     "lowestPrice": "4004218000",
        //     "highestPrice": "4149839000",
        //     "sourceVolume": "0.002",
        //     "destinationVolume": "115146752",
        //     "rank": 1,
        //     "baseTags": {
        //         "en": [
        //             "POW"
        //         ]
        //     },
        //     "quoteTags": {},
        //     "tradingEnabled": true,
        //     "swappingEnabled": false
        // },
        const marketType = 'spot';
        const marketId = this.safeString (ticker, 'id');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const high = this.safeFloat (ticker, 'highestPrice', 0);
        const low = this.safeFloat (ticker, 'lowestPrice', 0);
        const bid = this.safeFloat (ticker, 'buyPrice', 0);
        const ask = this.safeFloat (ticker, 'sellPrice', 0);
        const last = this.safeFloat (ticker, 'lastTradedPrice', 0);
        const change = this.safeFloat (ticker, 'changeRate', 0);
        const baseVolume = this.safeFloat (ticker, 'sourceVolume', 0);
        const quoteVolume = this.safeFloat (ticker, 'destinationVolume', 0);
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
            'open': last,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name jibitex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://jibitex.co/
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
            'market': market['id'],
            'from': (endTime / 1000) - (24 * 60 * 60),
            'to': endTime / 1000,
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString (this.timeframes, timeframe, timeframe);
        }
        request['from'] = this.safeInteger (request, 'from');
        request['to'] = this.safeInteger (request, 'to');
        const response = await this.publicGetApi1OhlcvsTradingView (request);
        const ohlcvList = this.safeList (response, 'content');
        const ohlcvs = [];
        for (let i = 0; i < ohlcvList.length; i++) {
            ohlcvs.push ([
                this.safeValue (ohlcvList[i], 'time'),
                this.safeValue (ohlcvList[i], 'open'),
                this.safeValue (ohlcvList[i], 'high'),
                this.safeValue (ohlcvList[i], 'low'),
                this.safeValue (ohlcvList[i], 'close'),
                this.safeValue (ohlcvList[i], 'volumeTo'),
            ]);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name jibitex#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://jibitex.co/
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetApi1OrdersOrderBookMarket (request);
        const orderBook = this.safeDict (response, 'content');
        const timestamp = Date.now ();
        return this.parseOrderBook (orderBook, symbol, timestamp, 'buys', 'sells', 'unitPrice', 'size');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['public'] + '/' + path + '?' + this.urlencode (query);
        if (params['id'] !== undefined) {
            url = this.urls['api']['public'] + '/' + path + '/' + params['id'];
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
