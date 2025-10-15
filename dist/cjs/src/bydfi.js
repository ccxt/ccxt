'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bydfi$1 = require('./abstract/bydfi.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class bydfi
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class bydfi extends bydfi$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bydfi',
            'name': 'Bydfi',
            'countries': ['SC'],
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/bydfi/64x64.png',
                'api': {
                    'public': 'https://www.bydfi.com',
                    'quote': 'https://quote.bydfi.pro',
                },
                'www': 'https://www.bydfi.com/',
                'doc': [
                    'https://www.bydfi.com/',
                ],
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'api': {
                'public': {
                    'get': {
                        'api/spot/product/list': 1,
                        'api/tv/tradingView/history': 1,
                    },
                },
                'quote': {
                    'get': {
                        'tickers': 1,
                        'mkpai/depth-v2': 1,
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
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name bydfi#fetchMarkets
         * @description retrieves data on all markets for bydfi
         * @see https://www.bydfi.com/api/spot/product/list
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetApiSpotProductList(params);
        const data = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = this.parseMarket(data[i]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        // {
        //     "symbol": "BTC_USDT",
        //     "alias": "BTC/USDT",
        //     "baseCoin": "BTC",
        //     "quoteCoin": "USDT",
        //     "icon": "https://...",
        //     "type": 1,
        //     "tags": "hot",
        //     "visible": true,
        //     "anonymous": false,
        //     "canBuy": true,
        //     "canSell": true,
        //     "canGrid": true,
        //     "depth": "0.01,0.1,1",
        //     "matchMode": 1,
        //     "priceScale": 2,
        //     "volumeScale": 6,
        //     "amountScale": 2,
        //     "makerRate": 0.001,
        //     "takerRate": 0.001,
        //     "feeCoin": "USDT",
        //     "volumeMin": 0.000001,
        //     "amountMin": 5
        // }
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString(market, 'baseCoin');
        const quoteId = this.safeString(market, 'quoteCoin');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const visible = this.safeBool(market, 'visible', true);
        const canBuy = this.safeBool(market, 'canBuy', true);
        const canSell = this.safeBool(market, 'canSell', true);
        const active = visible && canBuy && canSell;
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
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeInteger(market, 'volumeScale'),
                'price': this.safeInteger(market, 'priceScale'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'volumeMin'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(market, 'amountMin'),
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
         * @name bydfi#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://quote.bydfi.pro/tickers?preHour=24
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const request = {
            'preHour': 24,
        };
        const response = await this.quoteGetTickers(this.extend(request, params));
        const data = this.safeString(response, 'data', '');
        // Parse the CSV-like response (cast to string for safety)
        const tickers = String(data).split(';');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const tickerStr = tickers[i].trim();
            if (tickerStr.length === 0) {
                continue;
            }
            const ticker = this.parseTicker(tickerStr);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name bydfi#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://quote.bydfi.pro/tickers?preHour=24
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const tickers = await this.fetchTickers([symbol], params);
        return tickers[symbol];
    }
    parseTicker(ticker, market = undefined) {
        // BTC_USDT, -1, 112148.56000, 121452.59000, 0.00000, 0.00000, 0.00000, 0.0000, 122518.22000, 102403.50000, 2935.7203
        // Fields:
        // 0: symbol (BTC_USDT)
        // 1: trend indicator (-1 = down, 0 = neutral, 1 = up)
        // 2: last price
        // 3: 24h high
        // 4: 24h low
        // 5: price change
        // 6: base volume (BTC)
        // 7: price change percentage
        // 8: bid price
        // 9: ask price
        // 10: 24h quote volume (USDT)
        let parts = [];
        if (typeof ticker === 'string') {
            parts = ticker.split(',');
        }
        else {
            return this.safeTicker({}, market);
        }
        if (parts.length < 11) {
            return this.safeTicker({}, market);
        }
        const marketType = 'spot';
        const marketId = parts[0].trim();
        const symbol = this.safeSymbol(marketId, market, '_', marketType);
        const last = this.safeFloat(parts, 2);
        const high = this.safeFloat(parts, 3);
        const low = this.safeFloat(parts, 4);
        const change = this.safeFloat(parts, 5);
        const baseVolume = this.safeFloat(parts, 6);
        const percentage = this.safeFloat(parts, 7);
        const bid = this.safeFloat(parts, 8);
        const ask = this.safeFloat(parts, 9);
        const quoteVolume = this.safeFloat(parts, 10);
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bydfi#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.bydfi.com/api/tv/tradingView/history
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
        };
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        request['from'] = this.safeInteger(request, 'from');
        request['to'] = this.safeInteger(request, 'to');
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString(this.timeframes, timeframe, timeframe);
        }
        const response = await this.publicGetApiTvTradingViewHistory(request);
        const openList = this.safeList(response, 'o', []);
        const highList = this.safeList(response, 'h', []);
        const lowList = this.safeList(response, 'l', []);
        const closeList = this.safeList(response, 'c', []);
        const volumeList = this.safeList(response, 'v', []);
        const timestampList = this.safeList(response, 't', []);
        const ohlcvs = [];
        for (let i = 0; i < openList.length; i++) {
            ohlcvs.push([
                this.safeInteger(timestampList, i),
                this.safeFloat(openList, i),
                this.safeFloat(highList, i),
                this.safeFloat(lowList, i),
                this.safeFloat(closeList, i),
                this.safeFloat(volumeList, i),
            ]);
        }
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    async fetchOrderBook(symbol, limit = 1, params = {}) {
        /**
         * @method
         * @name bydfi#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://quote.bydfi.pro/mkpai/depth-v2
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'businessType': market['id'],
            'dType': 0,
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.quoteGetMkpaiDepthV2(request);
        const data = this.safeDict(response, 'data', {});
        const timestamp = Date.now();
        const orderbook = this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
        return orderbook;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        let url = '';
        if (api === 'quote') {
            url = this.urls['api']['quote'] + '/' + path;
        }
        else {
            url = this.urls['api']['public'] + '/' + path;
        }
        if (Object.keys(query).length) {
            url += '?' + this.urlencode(query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

exports["default"] = bydfi;
