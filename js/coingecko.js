'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class coingecko extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coingecko',
            'name': 'CoinGecko',
            'rateLimit': 67, // 15 requests per second
            'version': 'v3',
            'countries': [ 'SG' ],
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': false,
                'cancelOrder': false,
                'createDepositAddress': false,
                'createOrder': false,
                'deposit': false,
                'fetchBalance': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchL2OrderBook': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchBidsAsks': false,
                'fetchTrades': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/2256515/43684626-2318304a-98d6-11e8-9b80-e46e9d248976.png',
                'api': {
                    'public': 'https://api.coingecko.com/api',
                },
                'www': 'https://coingecko.com',
                'doc': 'https://www.coingecko.com/api/docs/v3',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'simple/supported_vs_currencies',
                        'coins',
                        'coins/list',
                        'coins/markets',
                        'coins/{id}',
                        'coins/{id}/history',
                        'coins/{id}/market_chart',
                        'exchange_rates',
                        'global',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        const coins = await this.publicGetCoinsList ();
        const markets = [];
        const supportedVsCurrencies = await this.publicGetSimpleSupportedVsCurrencies ();
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const vsCurrencies = supportedVsCurrencies;
            for (let j = 0; j < vsCurrencies.length; j++) {
                markets.push ({
                    'id': coin['id'] + '/' + vsCurrencies[j].toLowerCase (),
                    'symbol': coin['symbol'].toUpperCase () + '/' + vsCurrencies[j],
                    'base': coin['symbol'].toUpperCase (),
                    'quote': vsCurrencies[j],
                    'baseId': coin['id'],
                    'quoteId': vsCurrencies[j].toLowerCase (),
                    'info': coin,
                });
            }
        }
        return markets;
    }

    async fetchCurrencies () {
        const coins = await this.publicGetCoins ();
        const currencies = {};
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const symbol = coin['symbol'].toUpperCase ();
            currencies[symbol] = {
                'id': coin['id'],
                'code': symbol,
                'info': coin,
                'name': coin['name'],
                'active': true,
                'fee': undefined,
                'precision': 8,
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
        return currencies;
    }

    async fetchTickers (currency = 'USD', params = {}) {
        const markets = await this.publicGetCoinsMarkets (this.extend (params, { 'vs_currency': currency }));
        const tickers = {};
        const timestamp = this.milliseconds ();
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const symbol = market['symbol'].toUpperCase () + '/' + currency;
            tickers[symbol] = this.parseTicker (market, symbol, timestamp);
        }
        return tickers;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const baseCurrency = this.markets[symbol]['baseId'];
        const vsCurrency = this.markets[symbol]['quoteId'];
        const timestamp = this.milliseconds ();
        const market = await this.publicGetCoinsMarkets (this.extend (params, { 'ids': baseCurrency, 'vs_currency': vsCurrency }));
        return this.parseTicker (market[0], symbol, timestamp);
    }

    parseTicker (market, symbol, timestamp) {
        return {
            'symbol': symbol,
            'info': market,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': market['high_24h'],
            'low': market['low_24h'],
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': parseFloat (market['price_change_24h']),
            'percentage': parseFloat (market['price_change_percentage_24h']),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': market['total_volume'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
