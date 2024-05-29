
//  ---------------------------------------------------------------------------

import Exchange from './abstract/ubitex.js';
import { Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class ubitex
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class ubitex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ubitex',
            'name': 'Ubitex',
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
                'logo': 'https://ubitex.io/_next/image?url=https%3A%2F%2Fipfs.ubitex.io%2Fipfs%2FQmNqYsDFS1GoEeVYsPHkp8lFkodFeKo5cXLQlt1suO3T&w=256&q=75',
                'api': {
                    'public': 'https://appapi.ubitex.io',
                },
                'www': 'https://ubitex.io/',
                'doc': [
                    'https://ubitex.io/',
                ],
            },
            'timeframes': {
                '1m': '1',
                '1h': '60',
                '1d': '1D',
            },
            'api': {
                'public': {
                    'get': {
                        'api/dashboard/PairList': 1,
                        'api/chart/history': 1,
                        'api/dashboard': 1,
                    },
                },
            },
            'commonCurrencies': {
                'TMN': 'IRT',
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
         * @name ubitex#fetchMarkets
         * @description retrieves data on all markets for ubitex
         * @see https://ubitex.io/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetApiDashboardPairList (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = await this.parseMarket (response[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (market): Market {
        // {
        // id: "4c0f8205-e8af-42ec-8399-f8fcef4d3dfc",
        // selected: false,
        // destinationCoinSymbol: "SLP",
        // destinationCoinName: "SLP",
        // destinationCoinNameFa: "اس ال پی",
        // sourceCoinSymbol: "TMN",
        // sourceCoinName: "TMN",
        // sourceCoinNameFa: "تومان",
        // bestBuy: 221.82,
        // bestSell: 230.8,
        // isFavorite: false,
        // increased: true,
        // change: -1.48,
        // decimalLength: 2,
        // sourceCoinIcon: "https://cdn.ubitex.io/static/uploads/2022/1/4f96a35c-c234-454b-9e9c-d32f98149bdb.svg",
        // destinationIcon: "https://cdn.ubitex.io/static/uploads/2022/1/fe92b313-766c-4ca6-8c80-2a9101b89767.svg",
        // destinationCategoryName: "NFT",
        // destinationCategorySymbol: "NFT",
        // destinationCategoryId: "5afbccd9-cdb1-470c-84e3-57e8917a925a",
        // isLeverageToken: false,
        // active: false,
        // lowestRecentOrder: 219.5985,
        // highestRecentOrder: 232.274,
        // todayTradeAmount: 2015932.1165,
        // todayTradeTotal: 0,
        // lastOrderPrice: 229.47,
        // buyersDepth: 0,
        // sellersDepth: 0,
        // coinDecimalLength: 4,
        // globalPrice: 0.003916,
        // platform: "Kucoin"
        // },
        const id = this.safeString (market, 'id');
        let baseId = this.safeString (market, 'destinationCoinSymbol');
        let quoteId = this.safeString (market, 'sourceCoinSymbol');
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
         * @name ubitex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://ubitex.io/
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const response = await this.publicGetApiDashboardPairList (params);
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
         * @name ubitex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://ubitex.io/
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'src': this.safeStringUpper (market, 'quoteId'),
            'dest': this.safeStringUpper (market, 'baseId'),
        };
        const response = await this.publicGetApiDashboardPairList (request);
        const pair = this.safeDict (response, 0);
        const ticker = await this.parseTicker (pair);
        return ticker;
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        // id: "4c0f8205-e8af-42ec-8399-f8fcef4d3dfc",
        // selected: false,
        // destinationCoinSymbol: "SLP",
        // destinationCoinName: "SLP",
        // destinationCoinNameFa: "اس ال پی",
        // sourceCoinSymbol: "TMN",
        // sourceCoinName: "TMN",
        // sourceCoinNameFa: "تومان",
        // bestBuy: 221.82,
        // bestSell: 230.8,
        // isFavorite: false,
        // increased: true,
        // change: -1.48,
        // decimalLength: 2,
        // sourceCoinIcon: "https://cdn.ubitex.io/static/uploads/2022/1/4f96a35c-c234-454b-9e9c-d32f98149bdb.svg",
        // destinationIcon: "https://cdn.ubitex.io/static/uploads/2022/1/fe92b313-766c-4ca6-8c80-2a9101b89767.svg",
        // destinationCategoryName: "NFT",
        // destinationCategorySymbol: "NFT",
        // destinationCategoryId: "5afbccd9-cdb1-470c-84e3-57e8917a925a",
        // isLeverageToken: false,
        // active: false,
        // lowestRecentOrder: 219.5985,
        // highestRecentOrder: 232.274,
        // todayTradeAmount: 2015932.1165,
        // todayTradeTotal: 0,
        // lastOrderPrice: 229.47,
        // buyersDepth: 0,
        // sellersDepth: 0,
        // coinDecimalLength: 4,
        // globalPrice: 0.003916,
        // platform: "Kucoin"
        // },
        const marketType = 'spot';
        const marketId = this.safeString (ticker, 'id');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const high = this.safeFloat (ticker, 'highestRecentOrder', 0);
        const low = this.safeFloat (ticker, 'lowestRecentOrder', 0);
        const bid = this.safeFloat (ticker, 'bestBuy', 0);
        const ask = this.safeFloat (ticker, 'bestSell', 0);
        const last = this.safeFloat (ticker, 'lastOrderPrice', 0);
        const change = this.safeFloat (ticker, 'change', 0);
        const baseVolume = this.safeFloat (ticker, 'todayTradeAmount', 0);
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
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = 100, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name ubitex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://ubitex.io/
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
            'symbol': market['base'] + market['quote'],
            'from': (endTime / 1000) - (24 * 60 * 60),
            'to': endTime / 1000,
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
            'countback': limit,
        };
        if (market['quote'] === 'IRT') {
            request['symbol'] = market['base'] + 'TMN';
        }
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        request['from'] = this.safeInteger (request, 'from');
        request['to'] = this.safeInteger (request, 'to');
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString (this.timeframes, timeframe, timeframe);
        }
        const response = await this.publicGetApiChartHistory (request);
        const openList = this.safeValue (response, 'o', []);
        const highList = this.safeList (response, 'h', []);
        const lastList = this.safeList (response, 'l', []);
        const closeList = this.safeList (response, 'c', []);
        const volumeList = this.safeList (response, 'v', []);
        const timestampList = this.safeList (response, 't', []);
        const ohlcvs = [];
        for (let i = 0; i < openList.length; i++) {
            ohlcvs.push ([
                timestampList[i],
                openList[i],
                highList[i],
                lastList[i],
                closeList[i],
                volumeList[i],
            ]);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name ubitex#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://ubitex.io/
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
        const orderBook = await this.publicGetApiDashboard (request);
        const timestamp = Date.now ();
        return this.parseOrderBook (orderBook, symbol, timestamp, 'buyers', 'sellers', 'price', 'totalAmount');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['public'] + '/' + path;
        if (params['src'] !== undefined && params['dest'] !== undefined) {
            url = url + '?' + this.urlencode (query);
        }
        if (path === 'api/dashboard') {
            url = url + '/' + params['id'] + '/market';
        }
        if (path === 'api/chart/history') {
            url = url + '?' + this.urlencode (query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
