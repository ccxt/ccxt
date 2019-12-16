'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinflex',
            'name': 'CoinFlex',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 2000,
            'urls': {
                'www': 'https://coinflex.com/',
                'api': {
                    'public': 'https://webapi.coinflex.com',
                    'private': 'https://webapi.coinflex.com',
                },
                'fees': 'https://coinflex.com/fees/',
                'doc': [
                    'https://github.com/coinflex-exchange/API/blob/master/REST.md',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'assets/',
                        'markets/',
                        'tickers/',
                        'tickers/{base}:{counter}',
                        'depth/{base}:{counter}',
                    ],
                },
                'private': {
                    'get': [
                        'balances/',
                    ],
                },
            },
            'has': {
                'fetchMarkets': true,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchCurrencies': true,
            },
            'requiredCredentials': {
                'apiKey': true,
                'privateKey': true,
                'uid': true,
                'secret': false,
            },
            'options': {
                'fetchCurrencies': {
                    'expires': 5000,
                },
            },
        });
    }

    async fetchCurrencies () {
    // https://github.com/coinflex-exchange/API/blob/master/REST.md#get-assets
        const answer = await this.fetchCurrenciesFromCache ();
        const assets = this.safeValue (answer, 'currencies');
        const result = {};
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const code = this.safeCurrencyCode (this.safeString2 (asset, 'name', 'spot_name'));
            result[code] = {
                'id': this.safeInteger (asset, 'id'),
                'code': code,
                'name': code,
                'active': true,
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
                'info': asset,
            };
        }
        return result;
    }

    async fetchCurrenciesFromCache (params = {}) {
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 5000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const currencies = await this.publicGetAssets (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'currencies': currencies,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options, 'fetchCurrencies', {});
    }

    async fetchMarkets (params = {}) {
    // https://github.com/coinflex-exchange/API/blob/master/REST.md#get-markets
        const currencies = await this.fetchCurrencies ();
        const markets = await this.publicGetMarkets ();
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeInteger (market, 'base');
            const base = this.findCurrencyById (currencies, baseId);
            const quoteId = this.safeInteger (market, 'counter');
            const quote = this.findCurrencyById (currencies, quoteId);
            const symbol = base + '/' + quote;
            let active = true;
            const expires = this.safeInteger (market, 'expires');
            if (expires !== undefined) {
                if (this.milliseconds () > expires) {
                    active = false;
                }
            }
            result.push ({
                'id': this.safeString (market, 'name'),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': undefined,
                'limits': undefined,
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
    // https://github.com/coinflex-exchange/API/blob/master/REST.md#get-tickers
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol = undefined, params = {}) {
    // https://github.com/coinflex-exchange/API/blob/master/REST.md#get-tickersbasecounter
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'base': market['baseId'],
            'counter': market['quoteId'],
        };
        const response = await this.publicGetTickersBaseCounter (this.extend (request, params));
        return this.parseTicker (response);
    }

    parseTicker (ticker, market = undefined) {
        const tickerName = this.safeString (ticker, 'name');
        if (market === undefined) {
            market = this.findMarket (tickerName);
        }
        let timestamp = this.safeInteger (ticker, 'time'); // in microseconds
        timestamp = parseInt (timestamp / 1000000);
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': market['symbol'],

            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
    // https://github.com/coinflex-exchange/API/blob/master/REST.md#get-depthbasecounter
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'base': market['baseId'],
            'counter': market['quoteId'],
        };
        const response = await this.publicGetDepthBaseCounter (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
        }
    }

    findCurrencyById (currencies, id) {
        const keys = Object.keys (currencies);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currency = currencies[key];
            if (currency['id'] === id) {
                return currency['code'];
            }
        }
        throw new ExchangeError ('Currency with id ' + id + ' no founded');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const base = this.urls['api'][api];
        const request = '/' + this.implodeParams (path, params);
        let url = base + request;
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const sid = this.uid + '/' + this.apiKey + ':' + this.privateKey;
            headers = {
                'Authorization': 'Basic ' + this.stringToBase64 (sid),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
