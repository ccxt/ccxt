'use strict';

var ompfinex$1 = require('./abstract/ompfinex.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class ompfinex
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class ompfinex extends ompfinex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'ompfinex',
            'name': 'OMPFinex',
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/ompfinex/64x64.png',
                'api': {
                    'public': 'https://api.ompfinex.com',
                },
                'www': 'https://www.ompfinex.com/',
                'doc': [
                    'https://docs.ompfinex.com/',
                ],
            },
            'timeframes': {
                '1h': '60',
                '3h': '180',
                '6h': '360',
                '12h': '720',
                '1d': '1D',
                '1W': '1W',
                '1M': '3M',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/market': 1,
                        'v2/udf/real/history': 1,
                        'v1/orderbook': 1,
                    },
                },
            },
            'commonCurrencies': {
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
         * @name ompfinex#fetchMarkets
         * @description retrieves data on all markets for ompfinex
         * @see https://apidocs.ompfinex.ir/#6ae2dae4a2
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV1Market();
        const markets = this.safeList(response, 'data');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = await this.parseMarket(markets[i]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        // {
        //     'id': 1,
        //     'base_currency': {
        //         'id': 'BTC',
        //         'icon_path': 'https://s3.ir-thr-at1.arvanstorage.com/ompfinex-static/t/btc.png',
        //         'name': 'بیت کوین',
        //         'decimal_precision': 8,
        //     },
        //     'quote_currency': {
        //         'id': 'IRR',
        //         'icon_path': 'https://s3.ir-thr-at1.arvanstorage.com/ompfinex-static/t/irt.png',
        //         'name': 'تومان',
        //         'decimal_precision': 0,
        //     },
        //     'name': 'بیت کوین - تومان',
        //     'quote_currency_precision': 0,
        //     'base_currency_precision': 8,
        //     'history': [
        //         '39904073000',
        //         '39869830000',
        //         '39724396000',
        //         '39701684000',
        //         '39712038000',
        //         '39528137000',
        //         '39639658000',
        //         '39644885000',
        //         '39654055000',
        //         '39574451000',
        //         '39615152000',
        //         '39677500800',
        //         '39606862870',
        //         '39737426850',
        //         '39546858000',
        //         '39593530000',
        //         '39385856000',
        //         '39502536080',
        //         '39527561000',
        //         '39581729000',
        //         '39637343000',
        //         '39806512800',
        //         '39616055090',
        //         '39516007000',
        //     ],
        //     'min_price': '39382265000',
        //     'max_price': '40128888990',
        //     'last_price': '39516007000',
        //     'last_volume': '186449950855',
        //     'day_change_percent': -0.97,
        //     'week_change_percent': 1.64,
        //     'tradingview_symbol': 'BINANCE:BTCUSDT',
        //     'is_visible': true,
        // }
        const baseAsset = this.safeDict(market, 'base_currency');
        const quoteAsset = this.safeDict(market, 'quote_currency');
        let baseId = this.safeStringUpper(baseAsset, 'id');
        let quoteId = this.safeStringUpper(quoteAsset, 'id');
        const id = this.safeValue(market, 'id');
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
         * @name ompfinex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api-doc.ompfinex.com/#get-5
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetV1Market();
        const markets = this.safeList(response, 'data');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const ticker = await this.parseTicker(markets[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name ompfinex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api-doc.ompfinex.com/#get-5
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetV1Market(request);
        const markets = this.safeDict(response, 'data');
        const ticker = await this.parseTicker(markets);
        return ticker;
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     'id': 1,
        //     'base_currency': {
        //         'id': 'BTC',
        //         'icon_path': 'https://s3.ir-thr-at1.arvanstorage.com/ompfinex-static/t/btc.png',
        //         'name': 'بیت کوین',
        //         'decimal_precision': 8,
        //     },
        //     'quote_currency': {
        //         'id': 'IRR',
        //         'icon_path': 'https://s3.ir-thr-at1.arvanstorage.com/ompfinex-static/t/irt.png',
        //         'name': 'تومان',
        //         'decimal_precision': 0,
        //     },
        //     'name': 'بیت کوین - تومان',
        //     'quote_currency_precision': 0,
        //     'base_currency_precision': 8,
        //     'history': [
        //         '39904073000',
        //         '39869830000',
        //         '39724396000',
        //         '39701684000',
        //         '39712038000',
        //         '39528137000',
        //         '39639658000',
        //         '39644885000',
        //         '39654055000',
        //         '39574451000',
        //         '39615152000',
        //         '39677500800',
        //         '39606862870',
        //         '39737426850',
        //         '39546858000',
        //         '39593530000',
        //         '39385856000',
        //         '39502536080',
        //         '39527561000',
        //         '39581729000',
        //         '39637343000',
        //         '39806512800',
        //         '39616055090',
        //         '39516007000',
        //     ],
        //     'min_price': '39382265000',
        //     'max_price': '40128888990',
        //     'last_price': '39516007000',
        //     'last_volume': '186449950855',
        //     'day_change_percent': -0.97,
        //     'week_change_percent': 1.64,
        //     'tradingview_symbol': 'BINANCE:BTCUSDT',
        //     'is_visible': true,
        // }
        const marketType = 'spot';
        const marketId = this.safeValue(ticker, 'id');
        const marketinfo = this.market(marketId);
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        let high = this.safeFloat(ticker, 'max_price');
        let low = this.safeFloat(ticker, 'min_price');
        const change = this.safeFloat(ticker, 'day_change_percent');
        let last = this.safeFloat(ticker, 'last_price');
        let quoteVolume = this.safeFloat(ticker, 'last_volume');
        if (marketinfo['quote'] === 'IRT') {
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
            'open': last,
            'close': last,
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
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ompfinex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api-doc.ompfinex.com/
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['quote'] === 'IRT') {
            symbol = market['base'] + 'IRR';
        }
        const endTime = Date.now();
        const request = {
            'symbol': symbol.replace('/', ''),
            'from': (endTime / 1000) - (24 * 60 * 60),
            'to': endTime / 1000,
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
            // 'limit': 500,
        };
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        request['from'] = this.safeInteger(request, 'from');
        request['to'] = this.safeInteger(request, 'to');
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString(this.timeframes, timeframe, timeframe);
        }
        const response = await this.publicGetV2UdfRealHistory(request);
        const openList = this.safeValue(response, 'o', []);
        const highList = this.safeList(response, 'h', []);
        const lastList = this.safeList(response, 'l', []);
        const closeList = this.safeList(response, 'c', []);
        const volumeList = this.safeList(response, 'v', []);
        const timestampList = this.safeList(response, 't', []);
        const ohlcvs = [];
        for (let i = 0; i < openList.length; i++) {
            if (market['quote'] === 'IRT') {
                openList[i] /= 10;
                highList[i] /= 10;
                lastList[i] /= 10;
                closeList[i] /= 10;
                volumeList[i] /= 10;
            }
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
         * @name ompfinex#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://api-doc.ompfinex.com/#get
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const response = await this.publicGetV1Orderbook();
        let orderbook = this.safeDict(response, 'data');
        if (market['quote'] === 'IRT') {
            orderbook = this.safeDict(orderbook, market['base'] + 'IRR');
            const bids = this.safeList(orderbook, 'bids');
            const asks = this.safeList(orderbook, 'asks');
            for (let i = 0; i < bids.length; i++) {
                bids[i][0] /= 10;
            }
            for (let i = 0; i < asks.length; i++) {
                asks[i][0] /= 10;
            }
            orderbook['bids'] = asks;
            orderbook['asks'] = bids;
        }
        else {
            orderbook = this.safeDict(orderbook, market['base'] + market['quote']);
        }
        const timestamp = Date.now();
        return this.parseOrderBook(orderbook, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['public'] + '/' + path;
        if (params['id'] !== undefined) {
            url = url + '/' + params['id'];
        }
        if (path === 'v2/udf/real/history') {
            url = this.urls['api']['public'] + '/' + path + '?' + this.urlencode(query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = ompfinex;
