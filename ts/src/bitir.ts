
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitir.js';
import { Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitir
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class bitir extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitir',
            'name': 'Bit.ir',
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
                'logo': 'https://iranbroker.net/wp-content/uploads/2023/05/bit.ir-logo-png.png',
                'api': {
                    'public': 'https://api.bit.ir',
                },
                'www': 'https://www.bit.ir',
                'doc': [
                    'https://www.bit.ir',
                ],
            },
            'timeframes': {
                '1h': '60',
                '3h': '180',
                '6h': '360',
                '12h': '720',
                '1d': '1D',
                '2d': '2D',
                '3d': '3D',
                '1w': '1W',
                '1M': '1M',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/market': 1,
                        'v2/udf/real/history': 1,
                        'v1/market/{id}/order': 1,
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
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
        });
    }

    async fetchMarkets (symbols: Strings = undefined, params = {}): Promise<Market[]> {
        /**
         * @method
         * @name bitir#fetchMarkets
         * @description retrieves data on all markets for bitir
         * @see https://www.bit.ir/fa
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV1Market ();
        const markets = this.safeList (response, 'data');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = await this.parseMarket (markets[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (market): Market {
        // {
        //     'id': 1,
        //     'uid': 'ec00b2c906039253d62f0f1cf03f0c3c992a3262',
        //     'base_currency': {
        //         'id': 'BTC',
        //         'icon_path': 'https://coins-ir-bit.bit.ir/front-pngs/btc.png',
        //         'name': 'بیت کوین',
        //         'decimal_precision': 8,
        //     },
        //     'quote_currency': {
        //         'id': 'IRR',
        //         'icon_path': 'https://coins-ir-bit.bit.ir/front-pngs/irt.png',
        //         'name': 'تومان',
        //         'decimal_precision': 0,
        //     },
        //     'name': 'بیت کوین - تومان',
        //     'quote_currency_precision': 0,
        //     'base_currency_precision': 8,
        //     'history': [
        //         '39720036590',
        //         '39554414710',
        //         '39749295670',
        //         '39928938500',
        //         '39640942650',
        //         '39658390120',
        //         '39610761890',
        //         '39993818410',
        //         '39864571220',
        //         '39896337660',
        //         '39940417440',
        //         '39886829510',
        //         '39852060060',
        //         '39831320470',
        //         '40060533430',
        //         '40162665220',
        //         '40077517070',
        //         '39867289240',
        //         '39827433250',
        //         '39667574820',
        //         '39699242910',
        //         '39547099850',
        //         '39643401200',
        //         '39619745360',
        //     ],
        //     'min_price': '39351207320',
        //     'max_price': '40209135030',
        //     'last_price': '39619745360',
        //     'last_volume': '12146697437',
        //     'day_change_percent': -0.25,
        //     'week_change_percent': -0.8,
        //     'tradingview_symbol': 'BINANCE:BTCUSDT',
        //     'liked_by_user': false,
        // },
        const baseCurrency = this.safeDict (market, 'base_currency');
        const quoteCurrency = this.safeDict (market, 'quote_currency');
        const id = this.safeString (market, 'id');
        let baseId = this.safeString (baseCurrency, 'id');
        let quoteId = this.safeString (quoteCurrency, 'id');
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
         * @name bitir#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://www.bit.ir/fa
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const response = await this.publicGetV1Market ();
        const markets = this.safeList (response, 'data');
        const result = [];
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
         * @name bitir#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://www.bit.ir/fa
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetV1Market (request);
        const markets = this.safeDict (response, 'data');
        const ticker = await this.parseTicker (markets);
        return ticker;
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        //     'id': 1,
        //     'uid': 'ec00b2c906039253d62f0f1cf03f0c3c992a3262',
        //     'base_currency': {
        //         'id': 'BTC',
        //         'icon_path': 'https://coins-ir-bit.bit.ir/front-pngs/btc.png',
        //         'name': 'بیت کوین',
        //         'decimal_precision': 8,
        //     },
        //     'quote_currency': {
        //         'id': 'IRR',
        //         'icon_path': 'https://coins-ir-bit.bit.ir/front-pngs/irt.png',
        //         'name': 'تومان',
        //         'decimal_precision': 0,
        //     },
        //     'name': 'بیت کوین - تومان',
        //     'quote_currency_precision': 0,
        //     'base_currency_precision': 8,
        //     'history': [
        //         '39720036590',
        //         '39554414710',
        //         '39749295670',
        //         '39928938500',
        //         '39640942650',
        //         '39658390120',
        //         '39610761890',
        //         '39993818410',
        //         '39864571220',
        //         '39896337660',
        //         '39940417440',
        //         '39886829510',
        //         '39852060060',
        //         '39831320470',
        //         '40060533430',
        //         '40162665220',
        //         '40077517070',
        //         '39867289240',
        //         '39827433250',
        //         '39667574820',
        //         '39699242910',
        //         '39547099850',
        //         '39643401200',
        //         '39619745360',
        //     ],
        //     'min_price': '39351207320',
        //     'max_price': '40209135030',
        //     'last_price': '39619745360',
        //     'last_volume': '12146697437',
        //     'day_change_percent': -0.25,
        //     'week_change_percent': -0.8,
        //     'tradingview_symbol': 'BINANCE:BTCUSDT',
        //     'liked_by_user': false,
        // },
        const marketType = 'spot';
        const marketId = this.safeString (ticker, 'id');
        const marketinfo = this.market (marketId);
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        let high = this.safeFloat (ticker, 'max_price');
        let low = this.safeFloat (ticker, 'min_price');
        let bid = this.safeFloat (ticker, 'min_price');
        let ask = this.safeFloat (ticker, 'max_price');
        let open = this.safeFloat (ticker, 'last_price');
        let close = this.safeFloat (ticker, 'last_price');
        const change = this.safeFloat (ticker, 'day_change_percent');
        let last = this.safeFloat (ticker, 'last_price');
        let quoteVolume = this.safeFloat (ticker, 'last_volume');
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

    async fetchOHLCV (symbol: string, timeframe = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bitir#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.bit.ir/fa
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['base'] + market['quote'];
        if (market['quote'] === 'IRT') {
            symbol = market['base'] + 'IRR';
        }
        const endTime = Date.now ();
        const request = {
            'symbol': symbol,
            'from': (endTime / 1000) - (24 * 60 * 60),
            'to': endTime / 1000,
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        request['from'] = this.safeInteger (request, 'from');
        request['to'] = this.safeInteger (request, 'to');
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString (this.timeframes, timeframe, timeframe);
        }
        const response = await this.publicGetV2UdfRealHistory (request);
        const openList = this.safeValue (response, 'o', []);
        const highList = this.safeList (response, 'h', []);
        const lowList = this.safeList (response, 'l', []);
        const closeList = this.safeList (response, 'c', []);
        const volumeList = this.safeList (response, 'v', []);
        const timestampList = this.safeList (response, 't', []);
        const ohlcvs = [];
        for (let i = 0; i < openList.length; i++) {
            if (market['quote'] === 'IRT') {
                openList[i] /= 10;
                highList[i] /= 10;
                lowList[i] /= 10;
                closeList[i] /= 10;
                volumeList[i] /= 10;
            }
            ohlcvs.push ([
                timestampList[i],
                openList[i],
                highList[i],
                lowList[i],
                closeList[i],
                volumeList[i],
            ]);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitir#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://www.bit.ir/fa
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
        const response = await this.publicGetV1MarketIdOrder (request);
        const orderbookList = this.safeList (response, 'data');
        const orberbook = { 'asks': [], 'bids': [] };
        for (let i = 0; i < orderbookList.length; i++) {
            const orderType = this.safeString (orderbookList[i], 'type');
            let price = this.safeFloat (orderbookList[i], 'price');
            const amount = this.safeFloat (orderbookList[i], 'amount');
            if (orderType === 'sell') {
                if (market['quote'] === 'IRT') {
                    price /= 10;
                }
                orberbook['asks'].push ([ price, amount ]);
            }
            if (orderType === 'buy') {
                if (market['quote'] === 'IRT') {
                    price /= 10;
                }
                orberbook['bids'].push ([ price, amount ]);
            }
        }
        const timestamp = Date.now ();
        return this.parseOrderBook (orberbook, symbol, timestamp);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['public'] + '/' + path;
        if (path === 'v1/market' && params['id'] !== undefined) {
            url = url + '/' + params['id'];
        }
        if (path === 'v2/udf/real/history') {
            url = url + '?' + this.urlencode (query);
        }
        if (path === 'v1/market/{id}/order') {
            url = this.urls['api']['public'] + '/v1/market/' + params['id'] + '/order';
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
