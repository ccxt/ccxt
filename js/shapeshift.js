'use strict';

const Exchange = require ('./base/Exchange');

module.exports = class shapeshift extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'shapeshift',
            'name': 'ShapeShift',
            'countries': 'CHE', // Switzerland,
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 2000,
            'urls': {
                'logo': 'https://shapeshift.io/logo.png',
                'api': 'https://shapeshift.io',
                'www': 'https://shapeshift.io',
                'doc': [
                    'https://info.shapeshift.io/api',
                ],
            },
            'has': {
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchTicker': true,
            },
            'api': {
                'public': {
                    'get': [
                        'getcoins',
                        'limit/{pair}',
                        'marketinfo',
                        'rate/{pair}',
                        'recenttx/{max}',
                        'txStat/{address}',
                    ],
                },
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams (path, params);
        const url = this.urls['api'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    // TODO: figure out how to get the other side of the market in here
    // TODO: think we can overload the params to include a conversion rate that'll be ignored by other exchanges
    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const baseToQuoteInfo = this.market (symbol).info;
        const now = new Date ();
        return {
            'symbol': symbol,
            'info': baseToQuoteInfo,
            'timestamp': now.getTime (),
            'datetime': now.toISOString (),
            'high': undefined,
            'low': undefined,
            'bid': undefined, // baseToQuoteInfo.rate - baseToQuoteInfo.minerFee
            'bidVolume': undefined,
            'ask': '', // TODO: ???
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
        };
    }

    async fetchCurrencies (params = {}) {
        const coinsResponse = await this.publicGetGetcoins ();
        const coins = Object.keys (coinsResponse);
        const result = {};
        for (let i = 0; i < coins.length; i++) {
            const coinKey = coins[i];
            const coinObj = coinsResponse[coinKey];
            const symbol = coinObj.symbol;
            result[symbol] = {
                'id': symbol,
                'code': symbol,
                'info': coinObj,
                'name': coinObj.name,
                'active': coinObj.status === 'available',
                'status': 'ok',
                'fee': undefined,
                'precision': undefined,
                'limits': {
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
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets () {
        const marketsResponse = await this.publicGetMarketinfo ({ 'pair': '' });
        const numMarkets = marketsResponse.length;
        const result = new Array (numMarkets);
        for (let i = 0; i < numMarkets; i++) {
            const market = marketsResponse[i];
            const [base, quote] = market.pair.split ('_');
            result[i] = {
                'id': market.pair,
                'symbol': `${base}/${quote}`,
                base,
                quote,
                'active': true,
                'precision': { 'amount': 8 },
                'limits': { 'amount': market.limit },
                'info': market,
            };
        }
        return result;
    }
};
