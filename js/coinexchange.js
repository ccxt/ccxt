"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinexchange extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinexchange',
            'name': 'CoinExchange',
            'countries': [ 'IN', 'JP', 'VN', 'US' ],
            'rateLimit': 1000,
            // obsolete metainfo interface
            'hasPrivateAPI': false,
            'hasFetchTrades': false,
            'hasFetchCurrencies': true,
            'hasFetchTickers': true,
            // new metainfo interface
            'has': {
                'fetchTrades': false,
                'fetchCurrencies': true,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34842303-29c99fca-f71c-11e7-83c1-09d900cb2334.jpg',
                'api': 'https://www.coinexchange.io/api/v1',
                'www': 'https://www.coinexchange.io',
                'doc': 'https://coinexchangeio.github.io/slate/',
                'fees': 'https://www.coinexchange.io/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'getcurrency',
                        'getcurrencies',
                        'getmarkets',
                        'getmarketsummaries',
                        'getmarketsummary',
                        'getorderbook',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0015,
                    'taker': 0.0015,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    commonCurrencyCode (currency) {
        return currency;
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetCurrencies (params);
        let precision = this.precision['amount'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['CurrencyID'];
            let code = this.commonCurrencyCode (currency['TickerCode']);
            let active = currency['WalletStatus'] == 'online';
            let status = 'ok';
            if (!active)
                status = 'disabled';
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['Name'],
                'active': active,
                'status': status,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['MarketID'];
            let base = this.commonCurrencyCode (market['MarketAssetCode']);
            let quote = this.commonCurrencyCode (market['BaseCurrencyCode']);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'lot': undefined,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        if (!market) {
            let marketId = ticker['MarketID'];
            market = this.marketsById[marketId];
        }
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['HighPrice']),
            'low': parseFloat (ticker['LowPrice']),
            'bid': parseFloat (ticker['BidPrice']),
            'ask': parseFloat (ticker['AskPrice']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['LastPrice']),
            'change': parseFloat (ticker['Change']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['Volume']),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetMarketsummary (this.extend ({
            'market_id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetMarketsummaries (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = this.parseTicker (tickers[i]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderbook (this.extend ({
            'market_id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'BuyOrders', 'SellOrders', 'Price', 'Quantity');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (api == 'public') {
            params = this.urlencode (params);
            if (params.length)
                url += '?' + params;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let success = this.safeInteger (response, 'success');
        if (success != 1) {
            throw new ExchangeError (response['message']);
        }
        return response['result'];
    }
}
