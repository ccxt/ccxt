'use strict';

var abantether$1 = require('./abstract/abantether.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class abantether
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class abantether extends abantether$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'abantether',
            'name': 'Aban tether',
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
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/abantether/64x64.png',
                'api': {
                    'public': 'https://abantether.com',
                },
                'www': 'https://abantether.com',
                'doc': [
                    'https://abantether.com',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'management/all-coins/': 1,
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
         * @name abantether#fetchMarkets
         * @description retrieves data on all markets for abantether
         * @see https://abantether.com/management/all-coins/?format=json
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetManagementAllCoins(params);
        const result = [];
        const quotes = ['IRT', 'USDT'];
        for (let i = 0; i < response.length; i++) {
            const base = this.safeString(response[i], 'symbol');
            for (let index = 0; index < quotes.length; index++) {
                const quote = quotes[index];
                response[i]['base'] = base;
                response[i]['quote'] = quote;
                if (base === quote) {
                    continue;
                }
                const market = await this.parseMarket(response[i]);
                result.push(market);
            }
        }
        return result;
    }
    parseMarket(market) {
        // {
        //     'symbol': 'USDT',
        //     'name': 'Tether',
        //     'categories': [],
        //     'tetherPrice': '1',
        //     'priceBuy': '59200.0',
        //     'priceSell': '58800.0',
        //     'persianName': '\u062a\u062a\u0631',
        //     'past24': '0',
        //     'marketVolume': '1',
        //     'id': '1',
        //     'active': true,
        //     'irtDecimalPoint': '2',
        //     'tetherDecimalPoint': '6',
        //     'amountDecimalPoint': '6',
        //     'past24volume': '767287.60530837810210936763',
        //     'operationStatus': {
        //         'buyActive': true,
        //         'sellActive': true,
        //         'withdrawalActive': true,
        //         'depositActive': true,
        //         'transferActive': true,
        //     },
        // };
        let baseId = this.safeString(market, 'base');
        let quoteId = this.safeString(market, 'quote');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const id = base + quote;
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
         * @name abantether#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://abantether.com/management/all-coins/?format=json
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const response = await this.publicGetManagementAllCoins(params);
        const result = {};
        const quotes = ['IRT', 'USDT'];
        for (let i = 0; i < response.length; i++) {
            const base = this.safeString(response[i], 'symbol');
            for (let index = 0; index < quotes.length; index++) {
                const quote = quotes[index];
                if (base === quote) {
                    continue;
                }
                response[i]['base'] = base;
                response[i]['quote'] = quote;
                response[i]['symbol'] = base + quote;
                const ticker = this.parseTicker(response[i]);
                const symbol = ticker['symbol'];
                result[symbol] = ticker;
            }
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name abantether#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://abantether.com/management/all-coins/?format=json
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers([symbol]);
        return ticker[symbol];
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     'symbol': 'USDT',
        //     'name': 'Tether',
        //     'categories': [],
        //     'tetherPrice': '1',
        //     'priceBuy': '59200.0',
        //     'priceSell': '58800.0',
        //     'persianName': '\u062a\u062a\u0631',
        //     'past24': '0',
        //     'marketVolume': '1',
        //     'id': '1',
        //     'active': true,
        //     'irtDecimalPoint': '2',
        //     'tetherDecimalPoint': '6',
        //     'amountDecimalPoint': '6',
        //     'past24volume': '767287.60530837810210936763',
        //     'operationStatus': {
        //         'buyActive': true,
        //         'sellActive': true,
        //         'withdrawalActive': true,
        //         'depositActive': true,
        //         'transferActive': true,
        //     },
        // };
        const marketType = 'otc';
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        let last = this.safeFloat(ticker, 'tetherPrice', 0);
        if (ticker['quote'] === 'IRT') {
            last = this.safeFloat(ticker, 'priceSell', 0);
        }
        const change = this.safeFloat(ticker, 'past24', 0);
        const baseVolume = this.safeFloat(ticker, 'past24volume', 0);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
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
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api']['public'] + '/' + path + '?format=json';
        headers = { 'Content-Type': 'application/json', 'Cookie': '__arcsco=9593a1412d8bfc752c7170b1d2264544' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = abantether;
