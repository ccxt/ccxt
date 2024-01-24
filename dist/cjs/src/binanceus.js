'use strict';

var binance = require('./binance.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class binanceus extends binance {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'binanceus',
            'name': 'Binance US',
            'countries': ['US'],
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg',
                'api': {
                    'web': 'https://www.binance.us',
                    'sapi': 'https://api.binance.us/sapi/v1',
                    'wapi': 'https://api.binance.us/wapi/v3',
                    'public': 'https://api.binance.us/api/v3',
                    'private': 'https://api.binance.us/api/v3',
                },
                'www': 'https://www.binance.us',
                'referral': 'https://www.binance.us/?ref=35005074',
                'doc': 'https://github.com/binance-us/binance-official-api-docs',
                'fees': 'https://www.binance.us/en/fee/schedule',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.001'),
                    'maker': this.parseNumber('0.001'), // 0.1% trading fee, zero fees for all trading pairs before November 1.
                },
            },
            'options': {
                'fetchMarkets': ['spot'],
                'defaultType': 'spot',
                'quoteOrderQty': false,
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': undefined,
                'option': false,
                'addMargin': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createReduceOnlyOrder': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedPositions': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'api': {
                'public': {
                    'get': {
                        'exchangeInfo': 10,
                        'ping': 1,
                        'time': 1,
                        'depth': { 'cost': 1, 'byLimit': [[100, 1], [500, 5], [1000, 10], [5000, 50]] },
                        'trades': 1,
                        'aggTrades': 1,
                        'historicalTrades': 5,
                        'klines': 1,
                        'ticker/price': { 'cost': 1, 'noSymbol': 2 },
                        'avgPrice': 1,
                        'ticker/bookTicker': { 'cost': 1, 'noSymbol': 2 },
                        'ticker/24hr': { 'cost': 1, 'noSymbol': 40 },
                        'ticker': { 'cost': 2, 'noSymbol': 100 },
                    },
                },
                'private': {
                    'get': {
                        'status': 1,
                    },
                },
            },
        });
    }
}

module.exports = binanceus;
