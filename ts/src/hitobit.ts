
//  ---------------------------------------------------------------------------

import Exchange from './abstract/hitobit.js';
import { Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class hitobit
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class hitobit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitobit',
            'name': 'Hitobit',
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/hitobit/64x64.png',
                'api': {
                    'public': 'https://hitobit.com',
                },
                'www': 'https://hitobit.com/',
                'doc': [
                    'https://hitobit.com/',
                ],
            },
            'timeframes': {
                '1m': 'OneMinute',
                '5m': 'FiveMinutes',
                '15m': 'FifteenMinutes',
                '30m': 'ThirtyMinutes',
                '1h': 'OneHour',
                '1d': 'OneDay',
                '1w': 'OneWeek',
                '1M': 'OneMonth',
            },
            'api': {
                'public': {
                    'get': {
                        'hapi/exchange/v1/public/alltickers/24hr': 1,
                        'hapi/exchange/v1/public/ticker/24hr': 1,
                        'hapi/exchange/v1/public/klines': 1,
                        'hapi/exchange/v1/public/depth': 1,
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
         * @name hitobit#fetchMarkets
         * @description retrieves data on all markets for hitobit
         * @see https://hitobit-docs.github.io/#general-info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetHapiExchangeV1PublicAlltickers24hr (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = await this.parseMarket (response[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (market): Market {
        // {
        //     'symbol': 'ENSIRT',
        //     'baseCurrencySymbol': 'ENS',
        //     'quoteCurrencySymbol': 'IRT',
        //     'symbolPublicOfferingDate': 1676263272189,
        //     'isHighlight': false,
        //     'priceChange': -141761,
        //     'priceChangePercent': -9.9,
        //     'weightedAveragePrice': 1302802.5923348605,
        //     'lastPrice': 1290756,
        //     'lastQuantity': 0.06698461538461538,
        //     'openPrice': 1432517,
        //     'highPrice': 1441389,
        //     'lowPrice': 1171122,
        //     'openTime': 1717762920000,
        //     'closeTime': 1717849320000,
        //     'firstTradeId': 9167561172598788,
        //     'lastTradeId': 9180948480278536,
        //     'totalTrades': 9210,
        //     'prevDayClosePrice': 1286855,
        //     'bidPrice': 1288866,
        //     'bidQuantity': 31.0938,
        //     'askPrice': 1290107,
        //     'askQuantity': 1.8,
        //     'baseVolume': 7544.726084104318,
        //     'quoteVolume': 9829288700.827547,
        //     'smartTradeEngine': true,
        //     'lastMarketInfoChangeDate': 1717849693023,
        // },
        const id = this.safeString (market, 'symbol');
        let baseId = this.safeString (market, 'baseCurrencySymbol');
        let quoteId = this.safeString (market, 'quoteCurrencySymbol');
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
         * @name hitobit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://hitobit-docs.github.io/#general-info
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const response = await this.publicGetHapiExchangeV1PublicAlltickers24hr (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = await this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name hitobit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://hitobit-docs.github.io/#general-info
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetHapiExchangeV1PublicTicker24hr (request);
        const ticker = await this.parseTicker (response);
        return ticker;
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        //     'symbol': 'ENSIRT',
        //     'baseCurrencySymbol': 'ENS',
        //     'quoteCurrencySymbol': 'IRT',
        //     'symbolPublicOfferingDate': 1676263272189,
        //     'isHighlight': false,
        //     'priceChange': -141761,
        //     'priceChangePercent': -9.9,
        //     'weightedAveragePrice': 1302802.5923348605,
        //     'lastPrice': 1290756,
        //     'lastQuantity': 0.06698461538461538,
        //     'openPrice': 1432517,
        //     'highPrice': 1441389,
        //     'lowPrice': 1171122,
        //     'openTime': 1717762920000,
        //     'closeTime': 1717849320000,
        //     'firstTradeId': 9167561172598788,
        //     'lastTradeId': 9180948480278536,
        //     'totalTrades': 9210,
        //     'prevDayClosePrice': 1286855,
        //     'bidPrice': 1288866,
        //     'bidQuantity': 31.0938,
        //     'askPrice': 1290107,
        //     'askQuantity': 1.8,
        //     'baseVolume': 7544.726084104318,
        //     'quoteVolume': 9829288700.827547,
        //     'smartTradeEngine': true,
        //     'lastMarketInfoChangeDate': 1717849693023,
        // },
        const marketType = 'spot';
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const high = this.safeFloat (ticker, 'highPrice', 0);
        const low = this.safeFloat (ticker, 'lowPrice', 0);
        const bid = this.safeFloat (ticker, 'bidPrice', 0);
        const ask = this.safeFloat (ticker, 'askPrice', 0);
        const last = this.safeFloat (ticker, 'lastPrice', 0);
        const change = this.safeFloat (ticker, 'priceChangePercent', 0);
        const baseVolume = this.safeFloat (ticker, 'baseVolume', 0);
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume', 0);
        const timestamp = this.safeInteger (ticker, 'closeTime');
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

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name hitobit#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://hitobit-docs.github.io/#general-info
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
            'symbol': market['id'],
            'from': this.iso8601 ((endTime) - (24 * 60 * 60)),
            'to': this.iso8601 (endTime),
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
            'limit': 300,
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (timeframe !== undefined) {
            request['interval'] = this.safeString (this.timeframes, timeframe, timeframe);
        }
        const response = await this.publicGetHapiExchangeV1PublicKlines (request);
        const ohlcvs = [];
        for (let i = 0; i < response.length; i++) {
            ohlcvs.push ([
                this.safeValue (response[i], 'closeTime'),
                this.safeValue (response[i], 'open'),
                this.safeValue (response[i], 'high'),
                this.safeValue (response[i], 'low'),
                this.safeValue (response[i], 'close'),
                this.safeValue (response[i], 'baseVolume'),
            ]);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name hitobit#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://hitobit-docs.github.io/#general-info
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'limit': 30,
        };
        const orderBook = await this.publicGetHapiExchangeV1PublicDepth (request);
        const timestamp = Date.now ();
        return this.parseOrderBook (orderBook, symbol, timestamp, 'bids', 'asks');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const url = this.urls['api']['public'] + '/' + path + '?' + this.urlencode (query);
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
