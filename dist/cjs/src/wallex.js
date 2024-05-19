'use strict';

var wallex$1 = require('./abstract/wallex.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class wallex
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class wallex extends wallex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'wallex',
            'name': 'Wallex',
            'country': ['IR'],
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/wallex/64x64.png',
                'api': {
                    'public': 'https://api.wallex.ir',
                },
                'www': 'https://wallex.ir',
                'doc': [
                    'https://api-docs.wallex.ir',
                ],
            },
            'timeframes': {
                '1m': '1',
                '1h': '60',
                '3h': '180',
                '6h': '360',
                '12h': '720',
                '1d': '1D',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/markets': 1,
                        'v1/currencies/stats': 1,
                        'v1/depth': 1,
                        'v1/udf/history': 1,
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
                    'maker': this.parseNumber('0.001'),
                    'taker': this.parseNumber('0.001'),
                },
            },
        });
    }
    async fetchMarkets(symbols = undefined, params = {}) {
        /**
         * @method
         * @name wallex#fetchMarkets
         * @description retrieves data on all markets for wallex
         * @see https://api-docs.wallex.ir/#be8d9c51a2
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV1Markets(params);
        const markets = this.safeDict(response, 'result');
        const marketList = this.safeDict(markets, 'symbols');
        const marketKeys = Object.keys(marketList);
        const result = [];
        for (let i = 0; i < marketKeys.length; i++) {
            const index = marketKeys[i];
            const market = await this.parseMarket(marketList[index]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        //  {
        // symbol: "PEPETMN",
        // baseAsset: "PEPE",
        // baseAsset_png_icon: "https://api.wallex.ir/coins/PEPE/icon/png",
        // baseAsset_svg_icon: "https://api.wallex.ir/coins/PEPE/icon/svg",
        // baseAssetPrecision: 8,
        // quoteAsset: "TMN",
        // quoteAsset_png_icon: "https://api.wallex.ir/coins/TMN/icon/png",
        // quoteAsset_svg_icon: "https://api.wallex.ir/coins/TMN/icon/svg",
        // quotePrecision: 0,
        // faName: "پپه - تومان",
        // enName: "Pepe - Toman",
        // faBaseAsset: "پپه",
        // enBaseAsset: "Pepe",
        // faQuoteAsset: "تومان",
        // enQuoteAsset: "Toman",
        // stepSize: 0,
        // tickSize: 4,
        // minQty: 1,
        // minNotional: 100000,
        // stats: {
        // bidPrice: "0.5800000000000000",
        // askPrice: "0.5810000000000000",
        // 24h_ch: -2.35,
        // 7d_ch: 9.52,
        // 24h_volume: "102899374056.0000000000000000",
        // 7d_volume: "1444394386948.000000000000000",
        // 24h_quoteVolume: "60901904450.9036000000000000",
        // 24h_highPrice: "0.6086000000000000",
        // 24h_lowPrice: "0.5780000000000000",
        // lastPrice: "0.5810000000000000",
        // lastQty: "0.5810000000000000",
        // lastTradeSide: "SELL",
        // bidVolume: "0",
        // askVolume: "0",
        // bidCount: 7052,
        // askCount: 6395,
        // direction: {
        // SELL: 60,
        // BUY: 40
        // },
        // 24h_tmnVolume: "60901904450.9036000000000000"
        // },
        // createdAt: "2023-05-24T00:00:00.000000Z",
        // isNew: false,
        // isZeroFee: false
        // },
        const id = this.safeString(market, 'symbol');
        let baseId = this.safeString(market, 'baseAsset');
        let quoteId = this.safeString(market, 'quoteAsset');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        baseId = baseId.toLowerCase();
        quoteId = quoteId.toLowerCase();
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
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name wallex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api-docs.wallex.ir/#be8d9c51a2
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetV1Markets(params);
        const markets = this.safeDict(response, 'result');
        const marketList = this.safeDict(markets, 'symbols');
        const marketKeys = Object.keys(marketList);
        const result = {};
        for (let i = 0; i < marketKeys.length; i++) {
            const index = marketKeys[i];
            const ticker = await this.parseTicker(marketList[index]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name wallex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api-docs.wallex.ir/#be8d9c51a2
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const response = await this.publicGetV1Markets(params);
        const markets = this.safeDict(response, 'result');
        const marketList = this.safeDict(markets, 'symbols');
        const ticker = await this.parseTicker(marketList[market['id']]);
        return ticker;
    }
    parseTicker(ticker, market = undefined) {
        // {
        // symbol: "PEPETMN",
        // baseAsset: "PEPE",
        // baseAsset_png_icon: "https://api.wallex.ir/coins/PEPE/icon/png",
        // baseAsset_svg_icon: "https://api.wallex.ir/coins/PEPE/icon/svg",
        // baseAssetPrecision: 8,
        // quoteAsset: "TMN",
        // quoteAsset_png_icon: "https://api.wallex.ir/coins/TMN/icon/png",
        // quoteAsset_svg_icon: "https://api.wallex.ir/coins/TMN/icon/svg",
        // quotePrecision: 0,
        // faName: "پپه - تومان",
        // enName: "Pepe - Toman",
        // faBaseAsset: "پپه",
        // enBaseAsset: "Pepe",
        // faQuoteAsset: "تومان",
        // enQuoteAsset: "Toman",
        // stepSize: 0,
        // tickSize: 4,
        // minQty: 1,
        // minNotional: 100000,
        // stats: {
        // bidPrice: "0.5800000000000000",
        // askPrice: "0.5810000000000000",
        // 24h_ch: -2.35,
        // 7d_ch: 9.52,
        // 24h_volume: "102899374056.0000000000000000",
        // 7d_volume: "1444394386948.000000000000000",
        // 24h_quoteVolume: "60901904450.9036000000000000",
        // 24h_highPrice: "0.6086000000000000",
        // 24h_lowPrice: "0.5780000000000000",
        // lastPrice: "0.5810000000000000",
        // lastQty: "0.5810000000000000",
        // lastTradeSide: "SELL",
        // bidVolume: "0",
        // askVolume: "0",
        // bidCount: 7052,
        // askCount: 6395,
        // direction: {
        // SELL: 60,
        // BUY: 40
        // },
        // 24h_tmnVolume: "60901904450.9036000000000000"
        // },
        // createdAt: "2023-05-24T00:00:00.000000Z",
        // isNew: false,
        // isZeroFee: false
        // },
        const marketType = 'spot';
        const stats = this.safeValue(ticker, 'stats');
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        const high = this.safeFloat(stats, '24h_highPrice', 0);
        const low = this.safeFloat(stats, '24h_lowPrice', 0);
        const bid = this.safeFloat(stats, 'bidPrice', 0);
        const ask = this.safeFloat(stats, 'askPrice', 0);
        const last = this.safeFloat(stats, 'lastPrice', 0);
        const quoteVolume = this.safeFloat(stats, '24h_quoteVolume', 0);
        const baseVolume = this.safeFloat(stats, '24h_volume', 0);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': this.safeString(bid, 0),
            'bidVolume': undefined,
            'ask': this.safeString(ask, 0),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wallex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api-docs.wallex.ir/#be8d9c51a2
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const endTime = Date.now();
        const request = {
            'symbol': market['id'],
            'from': (endTime / 1000) - (24 * 60 * 60),
            'to': endTime / 1000,
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
            // 'limit': 500,
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        request['from'] = this.safeInteger(request, 'from');
        request['to'] = this.safeInteger(request, 'to');
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString(this.timeframes, timeframe, timeframe);
        }
        const response = await this.publicGetV1UdfHistory(request);
        const openList = this.safeValue(response, 'o', []);
        const highList = this.safeList(response, 'h', []);
        const lastList = this.safeList(response, 'l', []);
        const closeList = this.safeList(response, 'c', []);
        const volumeList = this.safeList(response, 'v', []);
        const timestampList = this.safeList(response, 't', []);
        const ohlcvs = [];
        for (let i = 0; i < openList.length; i++) {
            ohlcvs.push([
                timestampList[i],
                openList[i],
                highList[i],
                lastList[i],
                closeList[i],
                volumeList[i],
            ]);
        }
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name wallex#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://api-docs.wallex.ir/#be8d9c51a2
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1Depth(request);
        const orderBook = this.safeDict(response, 'result', {});
        const timestamp = Date.now();
        return this.parseOrderBook(orderBook, symbol, timestamp, 'bid', 'ask', 'price', 'quantity');
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['public'] + '/' + path;
        if (path === 'v1/udf/history') {
            url = url + '?' + this.urlencode(query);
        }
        if (path === 'v1/depth') {
            url = url + '?' + this.urlencode(query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = wallex;
