'use strict';

var excoino$1 = require('./abstract/excoino.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class excoino
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class excoino extends excoino$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'excoino',
            'name': 'Excoino',
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/excoino/64x64.png',
                'api': {
                    'public': 'https://market-api.excoino.com',
                },
                'www': 'https://www.excoino.com/',
                'doc': [
                    'https://market-api.excoino.com',
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
                '1W': '1W',
                '1M': '3M',
            },
            'api': {
                'public': {
                    'get': {
                        'market/symbol-thumb-trend': 1,
                        'market/history': 1,
                        'market/exchange-plate-full': 1,
                    },
                },
            },
            'commonCurrencies': {
                'BTCB': 'BTC',
                'IRR': 'IRT',
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
         * @name excoino#fetchMarkets
         * @description retrieves data on all markets for excoino
         * @see https://apidocs.excoino.ir/#6ae2dae4a2
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarketSymbolThumbTrend();
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = await this.parseMarket(response[i]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        // {
        // coinType: "ORDINARY",
        // symbol: "USDT/IRR",
        // chg: -0.0065,
        // coinScale: 2,
        // displayName: "Tether",
        // change: -3807,
        // twentyFourHourVolume: 364506.8462,
        // oneHourTurnover: -3689066797218.638,
        // volume: 6455037.5749,
        // lastDayClose: 588715,
        // high: 590885,
        // coinUrl: "https://market-api.excoino.com/market/icons/currencies/USDT.png",
        // low: 584015,
        // zone: 0,
        // baseCoinScale: 0,
        // oneHourVolume: -6371368.6146,
        // usdRate: 1,
        // close: 584914,
        // turnover: 3738577518315.463,
        // baseUsdRate: 0.000001709653,
        // open: 588721,
        // twentyFourHourTurnover: 214737798378.2562
        // },
        let [baseId, quoteId] = this.safeString(market, 'symbol').split('/');
        const id = this.safeValue(market, 'symbol');
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
         * @name excoino#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://market-api.excoino.com
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetMarketSymbolThumbTrend();
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const ticker = await this.parseTicker(response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name excoino#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://market-api.excoino.com
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers([symbol]);
        return ticker[symbol];
    }
    parseTicker(ticker, market = undefined) {
        // {
        // coinType: "ORDINARY",
        // symbol: "USDT/IRR",
        // chg: -0.0065,
        // coinScale: 2,
        // displayName: "Tether",
        // change: -3807,
        // twentyFourHourVolume: 364506.8462,
        // oneHourTurnover: -3689066797218.638,
        // volume: 6455037.5749,
        // lastDayClose: 588715,
        // high: 590885,
        // coinUrl: "https://market-api.excoino.com/market/icons/currencies/USDT.png",
        // low: 584015,
        // zone: 0,
        // baseCoinScale: 0,
        // oneHourVolume: -6371368.6146,
        // usdRate: 1,
        // close: 584914,
        // turnover: 3738577518315.463,
        // baseUsdRate: 0.000001709653,
        // open: 588721,
        // twentyFourHourTurnover: 214737798378.2562
        // },
        const marketType = 'spot';
        const marketId = this.safeValue(ticker, 'symbol');
        const marketinfo = this.market(marketId);
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        let high = this.safeFloat(ticker, 'high');
        let low = this.safeFloat(ticker, 'low');
        let open = this.safeFloat(ticker, 'open');
        let close = this.safeFloat(ticker, 'close');
        const change = this.safeFloat(ticker, 'chg');
        let last = this.safeFloat(ticker, 'close');
        let quoteVolume = this.safeFloat(ticker, 'twentyFourHourTurnover');
        if (marketinfo['quote'] === 'IRT') {
            open /= 10;
            close /= 10;
            high /= 10;
            low /= 10;
            last /= 10;
            quoteVolume /= 10;
        }
        return this.safeTicker({
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
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchOHLCV(symbol, timeframe = '1h', since = undefined, limit = 200, params = {}) {
        /**
         * @method
         * @name excoino#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://market-api.excoino.com
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
            'from': endTime - (24 * 60 * 60 * 1000),
            'to': endTime,
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
            'size': limit,
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        request['from'] = this.safeInteger(request, 'from');
        request['to'] = this.safeInteger(request, 'to');
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString(this.timeframes, timeframe, timeframe);
        }
        const response = await this.publicGetMarketHistory(request);
        for (let i = 0; i < response.length; i++) {
            if (market['quote'] === 'IRT') {
                response[i][1] /= 10;
                response[i][2] /= 10;
                response[i][3] /= 10;
                response[i][4] /= 10;
                response[i][5] /= 10;
            }
        }
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name excoino#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://market-api.excoino.com
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
        const response = await this.publicGetMarketExchangePlateFull(request);
        const orderBook = {};
        let bids = this.safeDict(response, 'bid');
        let asks = this.safeDict(response, 'ask');
        if (market['quote'] === 'IRT') {
            bids = this.safeDict(bids, 'items');
            asks = this.safeDict(asks, 'items');
            for (let i = 0; i < bids.length; i++) {
                bids[i]['price'] /= 10;
            }
            for (let i = 0; i < asks.length; i++) {
                asks[i]['price'] /= 10;
            }
            orderBook['bids'] = bids;
            orderBook['asks'] = asks;
        }
        else {
            bids = this.safeDict(bids, 'items');
            asks = this.safeDict(asks, 'items');
            orderBook['bids'] = bids;
            orderBook['asks'] = asks;
        }
        const timestamp = Date.now();
        return this.parseOrderBook(orderBook, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['public'] + '/' + path;
        if (path === 'market/history' || path === 'market/exchange-plate-full') {
            url = url + '?' + this.urlencode(query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = excoino;
