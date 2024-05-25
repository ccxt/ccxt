'use strict';

var ramzinex$1 = require('./abstract/ramzinex.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class ramzinex
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class ramzinex extends ramzinex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'ramzinex',
            'name': 'Ramzinex',
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/ramzinex/64x64.png',
                'api': {
                    'public': 'https://publicapi.ramzinex.com',
                },
                'www': 'https://ramzinex.com/',
                'doc': [
                    'https://api-doc.ramzinex.com/',
                ],
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '3h': '180',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': 'D',
                '2d': '2D',
                '3d': '3D',
            },
            'api': {
                'public': {
                    'get': {
                        'exchange/api/v1.0/exchange/pairs': 1,
                        'exchange/api/v1.0/exchange/chart/tv/history': 1,
                        'exchange/api/v1.0/exchange/orderbooks': 1,
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
         * @name ramzinex#fetchMarkets
         * @description retrieves data on all markets for ramzinex
         * @see https://apidocs.ramzinex.ir/#6ae2dae4a2
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetExchangeApiV10ExchangePairs();
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
        //     'amount_step': 0.00002,
        //     'base_currency_id': 1,
        //     'base_currency_symbol': {
        //         'en': 'btc',
        //         'fa': 'بیت کوین',
        //     },
        //     'base_precision': 5,
        //     'buy': 39909989891,
        //     'crypto_box': 0,
        //     'financial': {
        //         'last24h': {
        //             'base_volume': 0.5642693,
        //             'change_percent': -2.12,
        //             'close': 39836757000,
        //             'highest': 40698025995,
        //             'lowest': 39336170240,
        //             'open': 40698025900,
        //             'quote_volume': 22460381464,
        //         },
        //     },
        //     'icon': 'exchange/img/coins/btc.png',
        //     'logo': 'https://public-assets.ramzinex.com/public/currencies/logo/btc.png',
        //     'name': {
        //         'en': 'bitcoin/rial',
        //         'fa': 'بیت کوین',
        //     },
        //     'pair_id': 2,
        //     'price_precision': 0,
        //     'price_step': 39999989,
        //     'quote_currency_id': 2,
        //     'quote_currency_symbol': {
        //         'en': 'irr',
        //         'fa': 'ریال',
        //     },
        //     'quote_precision': 0,
        //     'sell': 39999989872,
        //     'show_order': 50,
        //     'tv_symbol': {
        //         'international': 'BINANCE:BTCUSDT',
        //         'ramzinex': 'btcirr',
        //     },
        //     'url_name': 'bitcoin-btc',
        //     'web_link': 'https://ramzinex.com/exchange/orderbook/2',
        // }
        const baseAsset = this.safeDict(market, 'base_currency_symbol');
        const quoteAsset = this.safeDict(market, 'quote_currency_symbol');
        let baseId = this.safeStringUpper(baseAsset, 'en');
        let quoteId = this.safeStringUpper(quoteAsset, 'en');
        const id = this.safeValue(market, 'pair_id');
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
         * @name ramzinex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api-doc.ramzinex.com/#get-5
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetExchangeApiV10ExchangePairs();
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
         * @name ramzinex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api-doc.ramzinex.com/#get-5
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair_id': market['id'],
        };
        const response = await this.publicGetExchangeApiV10ExchangePairs(request);
        const markets = this.safeDict(response, 'data');
        const ticker = await this.parseTicker(markets);
        return ticker;
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     'amount_step': 0.00002,
        //     'base_currency_id': 1,
        //     'base_currency_symbol': {
        //         'en': 'btc',
        //         'fa': 'بیت کوین',
        //     },
        //     'base_precision': 5,
        //     'buy': 39909989891,
        //     'crypto_box': 0,
        //     'financial': {
        //         'last24h': {
        //             'base_volume': 0.5642693,
        //             'change_percent': -2.12,
        //             'close': 39836757000,
        //             'highest': 40698025995,
        //             'lowest': 39336170240,
        //             'open': 40698025900,
        //             'quote_volume': 22460381464,
        //         },
        //     },
        //     'icon': 'exchange/img/coins/btc.png',
        //     'logo': 'https://public-assets.ramzinex.com/public/currencies/logo/btc.png',
        //     'name': {
        //         'en': 'bitcoin/rial',
        //         'fa': 'بیت کوین',
        //     },
        //     'pair_id': 2,
        //     'price_precision': 0,
        //     'price_step': 39999989,
        //     'quote_currency_id': 2,
        //     'quote_currency_symbol': {
        //         'en': 'irr',
        //         'fa': 'ریال',
        //     },
        //     'quote_precision': 0,
        //     'sell': 39999989872,
        //     'show_order': 50,
        //     'tv_symbol': {
        //         'international': 'BINANCE:BTCUSDT',
        //         'ramzinex': 'btcirr',
        //     },
        //     'url_name': 'bitcoin-btc',
        //     'web_link': 'https://ramzinex.com/exchange/orderbook/2',
        // }
        let tickerinfo = this.safeDict(ticker, 'financial');
        tickerinfo = this.safeDict(tickerinfo, 'last24h');
        const marketType = 'spot';
        const marketId = this.safeValue(ticker, 'pair_id');
        const marketinfo = this.market(marketId);
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        let high = this.safeFloat(tickerinfo, 'highest');
        let low = this.safeFloat(tickerinfo, 'lowest');
        let bid = this.safeFloat(ticker, 'sell');
        let ask = this.safeFloat(ticker, 'buy');
        let open = this.safeFloat(tickerinfo, 'open');
        let close = this.safeFloat(tickerinfo, 'close');
        const change = this.safeFloat(tickerinfo, 'change_percent');
        let last = this.safeFloat(ticker, 'buy');
        let quoteVolume = this.safeFloat(tickerinfo, 'quote_volume');
        const baseVolume = this.safeFloat(tickerinfo, 'base_volume');
        if (marketinfo['quote'] === 'IRT') {
            high /= 10;
            low /= 10;
            bid /= 10;
            ask /= 10;
            open /= 10;
            close /= 10;
            last /= 10;
            quoteVolume /= 10;
        }
        return this.safeTicker({
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
            'open': open,
            'close': close,
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
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ramzinex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api-doc.ramzinex.com/
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
        const response = await this.publicGetExchangeApiV10ExchangeChartTvHistory(request);
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
         * @name ramzinex#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://api-doc.ramzinex.com/#get
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair_id': market['id'],
        };
        const response = await this.publicGetExchangeApiV10ExchangeOrderbooks(request);
        const orderbook = this.safeDict(response, 'data');
        if (market['quote'] === 'IRT') {
            const bids = this.safeList(orderbook, 'sells');
            const asks = this.safeList(orderbook, 'buys');
            for (let i = 0; i < bids.length; i++) {
                bids[i][0] /= 10;
            }
            for (let i = 0; i < asks.length; i++) {
                asks[i][0] /= 10;
            }
            orderbook['buys'] = asks;
            orderbook['sells'] = bids;
        }
        const timestamp = Date.now();
        return this.parseOrderBook(orderbook, symbol, timestamp, 'sells', 'buys');
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['public'] + '/' + path;
        if (params['pair_id'] !== undefined) {
            url = url + '/' + params['pair_id'];
        }
        if (path === 'exchange/api/v1.0/exchange/chart/tv/history') {
            url = this.urls['api']['public'] + '/' + path + '?' + this.urlencode(query);
        }
        if (path === 'exchange/api/v1.0/exchange/orderbooks') {
            url = url + '/buys_sells';
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = ramzinex;
