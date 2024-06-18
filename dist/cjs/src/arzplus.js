'use strict';

var arzplus$1 = require('./abstract/arzplus.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class arzplus
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class arzplus extends arzplus$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'arzplus',
            'name': 'Arzplus',
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/arzplus/64x64.png',
                'api': {
                    'public': 'https://api.arzplus.net',
                },
                'www': 'https://arzplus.net',
                'doc': [
                    'https://arzplus.net',
                ],
            },
            'timeframes': {
                '1h': '60',
                '1d': '1D',
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/market/symbols': 1,
                        'api/v1/market/tradingview/ohlcv': 1,
                        'api/v1/market/depth': 1,
                    },
                },
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
         * @name arzplus#fetchMarkets
         * @description retrieves data on all markets for arzplus
         * @see https://api.arzplus.net/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'stats': '1',
            'enable': 'true',
        };
        const response = await this.publicGetApiV1MarketSymbols(request);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = await this.parseMarket(response[i]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        // {
        //     'name': 'USDTIRT',
        //     'asset': {
        //         'id': 2,
        //         'symbol': 'USDT',
        //         'precision': 8,
        //         'step_size': 8,
        //         'name': 'tether',
        //         'name_fa': 'تتر',
        //         'logo': 'https://cdn.arzplus.net/core-static/coins/USDT.png',
        //         'original_symbol': 'USDT',
        //         'original_name_fa': 'تتر',
        //         'trading_view_symbol': '',
        //     },
        //     'base_asset': {
        //         'id': 1,
        //         'symbol': 'IRT',
        //         'precision': 0,
        //         'step_size': 8,
        //         'name': 'toman',
        //         'name_fa': 'تومان',
        //         'logo': 'https://cdn.arzplus.net/core-static/coins/IRT.png',
        //         'original_symbol': 'IRT',
        //         'original_name_fa': 'تومان',
        //         'trading_view_symbol': '',
        //     },
        //     'enable': true,
        //     'price': '59165',
        //     'change': '-246',
        //     'change_percent': '-0.41',
        //     'high': '59619',
        //     'low': '58750',
        //     'volume': '215768.82',
        //     'base_volume': '12757163742',
        //     'bookmark': true,
        // };
        const id = this.safeString(market, 'name');
        const baseAsset = this.safeDict(market, 'asset');
        const quoteAsset = this.safeDict(market, 'base_asset');
        let baseId = this.safeString(baseAsset, 'symbol');
        let quoteId = this.safeString(quoteAsset, 'symbol');
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
         * @name arzplus#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api.arzplus.net/
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetApiV1MarketSymbols(params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const request = {
                'symbol': response[i]['name'],
            };
            const assetDetails = await this.publicGetApiV1MarketSymbols(request);
            const ticker = await this.parseTicker(assetDetails);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name arzplus#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.arzplus.net/
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1MarketSymbols(request);
        const ticker = await this.parseTicker(response);
        return ticker;
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     'name': 'USDTIRT',
        //     'asset': {
        //         'id': 2,
        //         'symbol': 'USDT',
        //         'precision': 8,
        //         'step_size': 8,
        //         'name': 'tether',
        //         'name_fa': 'تتر',
        //         'logo': 'https://cdn.arzplus.net/core-static/coins/USDT.png',
        //         'original_symbol': 'USDT',
        //         'original_name_fa': 'تتر',
        //         'trading_view_symbol': '',
        //     },
        //     'base_asset': {
        //         'id': 1,
        //         'symbol': 'IRT',
        //         'precision': 0,
        //         'step_size': 8,
        //         'name': 'toman',
        //         'name_fa': 'تومان',
        //         'logo': 'https://cdn.arzplus.net/core-static/coins/IRT.png',
        //         'original_symbol': 'IRT',
        //         'original_name_fa': 'تومان',
        //         'trading_view_symbol': '',
        //     },
        //     'enable': true,
        //     'price': '59165',
        //     'change': '-246',
        //     'change_percent': '-0.41',
        //     'high': '59619',
        //     'low': '58750',
        //     'volume': '215768.82',
        //     'base_volume': '12757163742',
        //     'bookmark': true,
        // };
        const marketType = 'spot';
        const marketId = this.safeString(ticker, 'name');
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        const high = this.safeFloat(ticker, 'high', 0);
        const low = this.safeFloat(ticker, 'low', 0);
        const last = this.safeFloat(ticker, 'price', 0);
        const change = this.safeFloat(ticker, 'change_percent', 0);
        const baseVolume = this.safeFloat(ticker, 'volume', 0);
        const quoteVolume = this.safeFloat(ticker, 'base_volume', 0);
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
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchOHLCV(symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name arzplus#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api.arzplus.net/
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
            'countBack': 300,
        };
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        if (limit !== undefined) {
            request['countBack'] = limit;
        }
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString(this.timeframes, timeframe, timeframe);
        }
        request['from'] = this.safeInteger(request, 'from');
        request['to'] = this.safeInteger(request, 'to');
        const response = await this.publicGetApiV1MarketTradingviewOhlcv(request);
        const ohlcvs = [];
        for (let i = 0; i < response.length; i++) {
            ohlcvs.push([
                this.safeValue(response[i], 'time'),
                this.safeValue(response[i], 'open'),
                this.safeValue(response[i], 'high'),
                this.safeValue(response[i], 'low'),
                this.safeValue(response[i], 'close'),
                this.safeValue(response[i], 'volume'),
            ]);
        }
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name arzplus#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://api.arzplus.net/
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
        const orderBook = await this.publicGetApiV1MarketDepth(request);
        const timestamp = Date.now();
        return this.parseOrderBook(orderBook, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['public'] + '/' + path;
        if (params['stats'] !== undefined) {
            url = url + '?' + this.urlencode(query);
        }
        if (path === 'api/v1/market/tradingview/ohlcv') {
            url = url + '?' + this.urlencode(query);
        }
        else if (params['symbol'] !== undefined) {
            url = url + '/' + params['symbol'];
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = arzplus;
