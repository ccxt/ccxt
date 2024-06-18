'use strict';

var afratether$1 = require('./abstract/afratether.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class afratether
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class afratether extends afratether$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'afratether',
            'name': 'Afratether',
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
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/afratether/64x64.png',
                'api': {
                    'public': 'https://afrap2p.com',
                    'token': 'https://afratether.com',
                },
                'www': 'https://afratether.com',
                'doc': [
                    'https://afratether.com',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1.0/price': 1,
                        'token': 1,
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
         * @name afratether#fetchMarkets
         * @description retrieves data on all markets for afratether
         * @see https://afratether.com/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const token = await this.publicGetToken();
        const request = {
            'Authorization': token,
        };
        const response = await this.publicGetApiV10Price(request);
        const markets = this.safeList(response, 'Items');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = await this.parseMarket(markets[i]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        // {
        //     "currencyAbb": "BTC",
        //     "nameEn": "Bitcoin",
        //     "nameFa": "بیت کوین",
        //     "icon": "/assets/crypto/BTC.png",
        //     "currency": "BTC",
        //     "prices": [
        //         {
        //             "currency": "USDT",
        //             "price": "67797.1"
        //         }
        //     ]
        // },
        const details = this.safeList(market, 'prices');
        let baseId = this.safeString(market, 'currency');
        let quoteId = this.safeString(details[0], 'currency');
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
         * @name afratether#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://afratether.com/
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const token = await this.publicGetToken();
        const request = {
            'Authorization': token,
        };
        const response = await this.publicGetApiV10Price(request);
        const markets = this.safeList(response, 'Items');
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
         * @name afratether#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://afratether.com/
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers([symbol]);
        return ticker[symbol];
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     "currencyAbb": "BTC",
        //     "nameEn": "Bitcoin",
        //     "nameFa": "بیت کوین",
        //     "icon": "/assets/crypto/BTC.png",
        //     "currency": "BTC",
        //     "prices": [
        //         {
        //             "currency": "USDT",
        //             "price": "67797.1"
        //         }
        //     ]
        // },
        const marketType = 'otc';
        const details = this.safeList(ticker, 'prices');
        const base = this.safeString(ticker, 'currency');
        const quote = this.safeString(details[0], 'currency');
        const marketId = base + quote;
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        const last = this.safeFloat(details[0], 'price', 0);
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
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['public'] + '/' + path;
        if (path === 'token') {
            url = this.urls['api']['token'] + '/' + path;
        }
        headers = { 'Content-Type': 'application/json' };
        if (path === 'api/v1.0/price') {
            headers = { 'Content-Type': 'application/json', 'Authorization': params['Authorization'].replace('\n', '') };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = afratether;
