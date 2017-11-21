"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class coinmarketcap extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinmarketcap',
            'name': 'CoinMarketCap',
            'rateLimit': 10000,
            'version': 'v1',
            'countries': 'US',
            'hasCORS': true,
            'hasPrivateAPI': false,
            'hasCreateOrder': false,
            'hasCancelOrder': false,
            'hasFetchBalance': false,
            'hasFetchOrderBook': false,
            'hasFetchTrades': false,
            'hasFetchTickers': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg',
                'api': 'https://api.coinmarketcap.com',
                'www': 'https://coinmarketcap.com',
                'doc': 'https://coinmarketcap.com/api',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/',
                        'ticker/{id}/',
                        'global/',
                    ],
                },
            },
            'currencies': [
                'AUD',
                'BRL',
                'CAD',
                'CHF',
                'CNY',
                'EUR',
                'GBP',
                'HKD',
                'IDR',
                'INR',
                'JPY',
                'KRW',
                'MXN',
                'RUB',
                'USD',
            ],
        });
    }

    async fetchOrderBook (symbol, params = {}) {
        throw new ExchangeError ('Fetching order books is not supported by the API of ' + this.id);
    }

    async fetchMarkets () {
        let markets = await this.publicGetTicker ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            for (let c = 0; c < this.currencies.length; c++) {
                let base = market['symbol'];
                let baseId = market['id'];
                let quote = this.currencies[c];
                let quoteId = quote.toLowerCase ();
                let symbol = base + '/' + quote;
                let id = baseId + '/' + quote;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': market,
                });
            }
        }
        return result;
    }

    async fetchGlobal (currency = 'USD') {
        await this.loadMarkets ();
        let request = {};
        if (currency)
            request['convert'] = currency;
        return await this.publicGetGlobal (request);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        if ('last_updated' in ticker)
            if (ticker['last_updated'])
                timestamp = parseInt (ticker['last_updated']) * 1000;
        let change = undefined;
        let changeKey = 'percent_change_24h';
        if (changeKey in ticker)
            change = parseFloat (ticker[changeKey]);
        let last = undefined;
        let symbol = undefined;
        let volume = undefined;
        if (market) {
            let price = 'price_' + market['quoteId'];
            if (price in ticker)
                if (ticker[price])
                    last = parseFloat (ticker[price]);
            symbol = market['symbol'];
            let volumeKey = '24h_volume_' + market['quoteId'];
            if (volumeKey in ticker)
                volume = parseFloat (ticker[volumeKey]);
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'ask': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': last,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': ticker,
        };
    }

    async fetchTickers (currency = 'USD', params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (currency)
            request['convert'] = currency;
        let response = await this.publicGetTicker (this.extend (request, params));
        let tickers = {};
        for (let t = 0; t < response.length; t++) {
            let ticker = response[t];
            let id = ticker['id'] + '/' + currency;
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            tickers[symbol] = this.parseTicker (ticker, market);
        }
        return tickers;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'convert': market['quote'],
            'id': market['baseId'],
        }, params);
        let response = await this.publicGetTickerId (request);
        let ticker = response[0];
        return this.parseTicker (ticker, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length)
            url += '?' + this.urlencode (query);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            if (response['error']) {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
}
