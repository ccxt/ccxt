'use strict';

var exnovin$1 = require('./abstract/exnovin.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class exnovin
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class exnovin extends exnovin$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'exnovin',
            'name': 'Exnovin',
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
                'fetchOHLCV': false,
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/exnovin/64x64.png',
                'api': {
                    'public': 'https://api.exnovinmarket.com',
                },
                'www': 'https://exnovin.io',
                'doc': [
                    'https://exnovin.io/',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'v2/pairs': 1,
                        'v1/orderbook': 1,
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
         * @name exnovin#fetchMarkets
         * @description retrieves data on all markets for exnovin
         * @see https://exnovin.io/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV2Pairs();
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = await this.parseMarket(response[i]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        //         {
        // lastPrice: 214715147,
        // name: "ETH/TMN",
        // tradeAmountDecimals: 6,
        // priceDecimals: 0,
        // maxVariationRatio: "5.00",
        // minCost: "100000",
        // high24: 214755000,
        // low24: 203102000,
        // vol24: 440913246,
        // vol24Base: 2.112867,
        // change24Percentage: 3.4,
        // lastWeekPrices: [
        // 214715000,
        // 206934000,
        // 216552000,
        // 217787000,
        // 216443000,
        // 216832000,
        // 222969000,
        // 225776000
        // ],
        // localeName: "ETH/TMN",
        // zones: [
        // {
        // id: "d4eeb449-7d91-4cae-ad3b-f8b1ef376d1d",
        // label: "Toman",
        // name: "TMN"
        // }
        // ],
        // imageUrl: "https://api.exnovinmarket.com/static-contents/images/icons/d22722b936d9409f9f9b15c7a5a07046.svg",
        // active: true
        // },
        const id = this.safeString(market, 'name');
        let [baseId, quoteId] = id.split('/');
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
         * @name exnovin#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://exnovin.io/
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetV2Pairs(params);
        const result = {};
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
         * @name exnovin#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://exnovin.io/
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers([symbol]);
        return ticker[symbol];
    }
    parseTicker(ticker, market = undefined) {
        //         {
        // lastPrice: 214715147,
        // name: "ETH/TMN",
        // tradeAmountDecimals: 6,
        // priceDecimals: 0,
        // maxVariationRatio: "5.00",
        // minCost: "100000",
        // high24: 214755000,
        // low24: 203102000,
        // vol24: 440913246,
        // vol24Base: 2.112867,
        // change24Percentage: 3.4,
        // lastWeekPrices: [
        // 214715000,
        // 206934000,
        // 216552000,
        // 217787000,
        // 216443000,
        // 216832000,
        // 222969000,
        // 225776000
        // ],
        // localeName: "ETH/TMN",
        // zones: [
        // {
        // id: "d4eeb449-7d91-4cae-ad3b-f8b1ef376d1d",
        // label: "Toman",
        // name: "TMN"
        // }
        // ],
        // imageUrl: "https://api.exnovinmarket.com/static-contents/images/icons/d22722b936d9409f9f9b15c7a5a07046.svg",
        // active: true
        // },
        const marketType = 'spot';
        const marketId = this.safeString(ticker, 'name');
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        const high = this.safeFloat(ticker, 'high24', 0);
        const low = this.safeFloat(ticker, 'low24', 0);
        const last = this.safeFloat(ticker, 'lastPrice', 0);
        const change = this.safeFloat(ticker, 'change24Percentage', 0);
        const baseVolume = this.safeFloat(ticker, 'vol24Base', 0);
        const quoteVolume = this.safeFloat(ticker, 'vol24', 0);
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
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name exnovin#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://exnovin.io/
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        //         {
        // price: "59034.0000000000",
        // amount: "128.0200000000",
        // pair: "USDT/TMN",
        // side: "BUY"
        // },
        // {
        // price: "59032.0000000000",
        // amount: "461.1300000000",
        // pair: "USDT/TMN",
        // side: "BUY"
        // },
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
            'limit': 30,
        };
        let orderBook = await this.publicGetV1Orderbook(request);
        const bids = [];
        const asks = [];
        for (let index = 0; index < orderBook.length; index++) {
            if (orderBook[index]['side'] === 'BUY') {
                bids.push(orderBook[index]);
            }
            else {
                asks.push(orderBook[index]);
            }
        }
        orderBook = { 'bids': bids, 'asks': asks };
        const timestamp = Date.now();
        return this.parseOrderBook(orderBook, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        const url = this.urls['api']['public'] + '/' + path + '?' + this.urlencode(query);
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = exnovin;
