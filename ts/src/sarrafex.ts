
//  ---------------------------------------------------------------------------

import Exchange from './abstract/sarrafex.js';
import { Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class sarrafex
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class sarrafex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'sarrafex',
            'name': 'Sarrafex',
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
                'logo': 'https://iranbroker.net/wp-content/uploads/2023/05/sarrafex-logo-png.png',
                'api': {
                    'public': 'https://sarrafex.com',
                    'ohlcv': 'https://api.sarrafex.com',
                },
                'www': 'https://sarrafex.com',
                'doc': [
                    'https://sarrafex.com',
                ],
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '8h': '480',
                '12h': '720',
                '1d': '1D',
                '3d': '3D',
                '1w': '1W',
                '1M': '1M',
            },
            'api': {
                'public': {
                    'get': {
                        'api/gateway/exchanger/query/market': 1,
                        'exchanger/tradingview/history': 1,
                        'api/gateway/exchanger/orderbook': 1,
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
         * @name sarrafex#fetchMarkets
         * @description retrieves data on all markets for sarrafex
         * @see https://sarrafex.io/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetApiGatewayExchangerQueryMarket (params);
        const markets = this.safeList (response, 'value');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = await this.parseMarket (markets[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (market): Market {
        // {
        //     'assetPairId': 201,
        //     'pair': 'BAL/IRT',
        //     'symbol': 'BALIRT',
        //     'name': 'بالانسر',
        //     'enName': 'Balancer',
        //     'faName': 'بالانسر',
        //     'order': 0,
        //     'canSell': true,
        //     'canConvert': true,
        //     'convertBaseMinAmount': 500000,
        //     'convertCounterMinAmount': 2,
        //     'convertBaseMaxAmount': 500000000,
        //     'convertCounterMaxAmount': 2000,
        //     'canBuy': true,
        //     'iconUrl': 'coins/bal.png',
        //     'assetCategoryId': 1,
        //     'baseAssetId': 'IRT',
        //     'counterAssetId': 'BAL',
        //     'close': 234533.352,
        //     'high': 238562.277,
        //     'low': 232049.832,
        //     'open': 232780.632,
        //     'volume': 381744.504000004,
        //     'value': 89857376296.1089,
        //     'latestRate': 234838.604,
        //     'baseEnName': 'Toman',
        //     'baseFaName': 'تومان',
        //     'baseIconUrl': 'coins/irr.png',
        //     'secondLatestRate': 235483.765,
        //     'yesterdayLatestRate': 232780.632,
        //     'timestamp': '2024-05-29T08:30:28.7386055+00:00',
        //     'previewsPriceChangeValue': -645.161,
        //     'previewsPriceChangePercent': -0.27,
        //     'yesterdayPriceChangeValue': 2057.972,
        //     'yesterdayPriceChangePercent': 0.88,
        //     'baseAssetDecimals': 4,
        //     'counterAssetDecimals': 8,
        //     'minAmount': 2,
        //     'maxAmount': 0,
        //     'blockExplorer': 'https://etherscan.io',
        //     'socialNetworks': '{"Telegram":"https://t.me/","Twitter":"https://twitter.com/Balancer","Website":"https://balancer.finance/"}',
        //     'acceptedOrderTypes': [
        //         'Limit',
        //         'Market',
        //         'Stop-Market',
        //         'Stop-Limit',
        //         'IOC',
        //     ],
        //     'acceptedDecimals': [
        //         0.1,
        //         0.001,
        //         0.0001,
        //         1,
        //         10,
        //     ],
        //     'rank': 0,
        //     'profitRatio': 0.01,
        //     'obBaseAssetDecimals': 0,
        //     'obCounterAssetDecimals': 0,
        //     'hasRiskDisclosure': false,
        // };
        const id = this.safeString (market, 'assetPairId');
        let baseId = this.safeString (market, 'counterAssetId');
        let quoteId = this.safeString (market, 'baseAssetId');
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
         * @name sarrafex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://sarrafex.io/
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const response = await this.publicGetApiGatewayExchangerQueryMarket (params);
        const markets = this.safeList (response, 'value');
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
         * @name sarrafex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://sarrafex.io/
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'filter': 'assetPairId eq ' + market['id'],
        };
        const response = await this.publicGetApiGatewayExchangerQueryMarket (request);
        const pair = this.safeList (response, 'value');
        const ticker = await this.parseTicker (pair[0]);
        return ticker;
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        // {
        //     'assetPairId': 201,
        //     'pair': 'BAL/IRT',
        //     'symbol': 'BALIRT',
        //     'name': 'بالانسر',
        //     'enName': 'Balancer',
        //     'faName': 'بالانسر',
        //     'order': 0,
        //     'canSell': true,
        //     'canConvert': true,
        //     'convertBaseMinAmount': 500000,
        //     'convertCounterMinAmount': 2,
        //     'convertBaseMaxAmount': 500000000,
        //     'convertCounterMaxAmount': 2000,
        //     'canBuy': true,
        //     'iconUrl': 'coins/bal.png',
        //     'assetCategoryId': 1,
        //     'baseAssetId': 'IRT',
        //     'counterAssetId': 'BAL',
        //     'close': 234533.352,
        //     'high': 238562.277,
        //     'low': 232049.832,
        //     'open': 232780.632,
        //     'volume': 381744.504000004,
        //     'value': 89857376296.1089,
        //     'latestRate': 234838.604,
        //     'baseEnName': 'Toman',
        //     'baseFaName': 'تومان',
        //     'baseIconUrl': 'coins/irr.png',
        //     'secondLatestRate': 235483.765,
        //     'yesterdayLatestRate': 232780.632,
        //     'timestamp': '2024-05-29T08:30:28.7386055+00:00',
        //     'previewsPriceChangeValue': -645.161,
        //     'previewsPriceChangePercent': -0.27,
        //     'yesterdayPriceChangeValue': 2057.972,
        //     'yesterdayPriceChangePercent': 0.88,
        //     'baseAssetDecimals': 4,
        //     'counterAssetDecimals': 8,
        //     'minAmount': 2,
        //     'maxAmount': 0,
        //     'blockExplorer': 'https://etherscan.io',
        //     'socialNetworks': '{"Telegram":"https://t.me/","Twitter":"https://twitter.com/Balancer","Website":"https://balancer.finance/"}',
        //     'acceptedOrderTypes': [
        //         'Limit',
        //         'Market',
        //         'Stop-Market',
        //         'Stop-Limit',
        //         'IOC',
        //     ],
        //     'acceptedDecimals': [
        //         0.1,
        //         0.001,
        //         0.0001,
        //         1,
        //         10,
        //     ],
        //     'rank': 0,
        //     'profitRatio': 0.01,
        //     'obBaseAssetDecimals': 0,
        //     'obCounterAssetDecimals': 0,
        //     'hasRiskDisclosure': false,
        // };
        const marketType = 'spot';
        const marketId = this.safeString (ticker, 'assetPairId');
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const high = this.safeFloat (ticker, 'high', 0);
        const low = this.safeFloat (ticker, 'low', 0);
        const bid = this.safeFloat (ticker, 'latestRate', 0);
        const ask = this.safeFloat (ticker, 'latestRate', 0);
        const last = this.safeFloat (ticker, 'latestRate', 0);
        const change = this.safeFloat (ticker, 'yesterdayPriceChangePercent', 0);
        const baseVolume = this.safeFloat (ticker, 'volume', 0);
        const quoteVolume = this.safeFloat (ticker, 'value', 0);
        const datetime = this.safeString (ticker, 'timestamp');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': Date.parse (datetime),
            'datetime': datetime,
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
         * @name sarrafex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://sarrafex.io/
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
        const response = await this.publicGetExchangerTradingviewHistory (request);
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
         * @name sarrafex#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://sarrafex.io/
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'filter': 'assetPairId eq ' + market['id'],
        };
        let orderBook = await this.publicGetApiGatewayExchangerOrderbook (request);
        orderBook = this.safeDict (orderBook, 0);
        const timestamp = Date.now ();
        return this.parseOrderBook (orderBook, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['public'] + '/' + path;
        if (params['filter'] !== undefined) {
            url = url + '?' + this.urlencode (query);
        }
        if (path === 'exchanger/tradingview/history') {
            url = this.urls['api']['ohlcv'] + '/' + path + '?' + this.urlencode (query);
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
