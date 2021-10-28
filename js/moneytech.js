'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, InvalidAddress, AuthenticationError, OnMaintenance, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class b2c2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'moneytech',
            'name': 'MoneyTech',
            'countries': [ 'AU' ],
            'rateLimit': 500,
            'has': {
                'createOrder': true,
                'createQuote': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
            },
            'urls': {
                'logo': '',
                'api': {
                    'private': '',
                },
                'test': {
                    'private': ','
                },
                'www': 'https://moneytech.com.au',
                'doc': 'https://moneytech.com.au',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
            'api': {
                'private': {
                    'get': [],
                    'post': [],
                    'delete': [],
                },
            },
            'httpExceptions': {
            },
            'exceptions': {
                'exact': {
                },
            },
            'currencies': {
                'AUD': {'id': 'AUD', 'code': 'AUD', 'name': 'Australian Dollars', 'type': 'fiat', 'active': True, 'precision': 4, 'limits': {'deposit': {'min': 1, 'max': 1000000}, 'withdraw': {'min': 1, 'max': 1000000}, 'amount': {'min': 1, 'max': 1000000}}}, 
                'USD': {'id': 'USD', 'code': 'USD', 'name': 'US Dollars', 'type': 'fiat', 'active': True, 'precision': 4, 'limits': {'deposit': {'min': 1, 'max': 1000000}, 'withdraw': {'min': 1, 'max': 1000000}, 'amount': {'min': 1, 'max': 1000000}}}, 
            },
            'markets': {
                'AUD/USD': {'limits': {'amount': {'min': 1, 'max': 1000000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 100000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0, 'maker': 0, 'id': 'AUD/USD', 'symbol': 'ADA/USD', 'base': 'AUD', 'quote': 'USD', 'baseId': 'AUD', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'USD/AUD': {'limits': {'amount': {'min': 1, 'max': 1000000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 100000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0, 'maker': 0, 'id': 'USD/AUD', 'symbol': 'USD/AUD', 'base': 'USD', 'quote': 'AUD', 'baseId': 'USD', 'quoteId': 'AUD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
            },
        });
    }

    async createQuote (symbol, side, amount, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseSide = side.toLowerCase ();
        const request = {
            'quantity': this.amountToPrecision (symbol, amount),
            'side': lowercaseSide,
            'instrument': market['id'],
        };
        const response = await this.privatePostRequestForQuote (this.extend (request, params)); // FIXME - pipe to Selenium instead :)
        return this.parseQuote (response, market);
    }

    parseQuote (quote, market = undefined) {
        return undefined; // FIXME !!
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseSide = side.toLowerCase ();
        const lowercaseType = type.toLowerCase ();
        const request = {
            'quantity': this.amountToPrecision (symbol, amount),
            'side': lowercaseSide,
            'instrument': market['id'],
            'order_type': 'market',
        };
        const response = await this.privatePostOrder (this.extend (request, params)); // FIXME - pipe to Selenium instead :)
        return this.parseOrder (response, market);
    }

    parseOrder (order, market = undefined) {
        return undefined; // FIXME !!
    }
    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetAllTicker (params); // FIXME - pipe to Selenium instead :)
        const result = {};
        const marketsByIdWithoutUnderscore = {};
        const marketIds = Object.keys (this.markets_by_id);
        for (let i = 0; i < marketIds.length; i++) {
            const tickerId = marketIds[i].replace ('_', '');
            marketsByIdWithoutUnderscore[tickerId] = this.markets_by_id[marketIds[i]];
        }
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const market = marketsByIdWithoutUnderscore[ids[i]];
            result[market['symbol']] = this.parseTicker (response[ids[i]], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params)); // FIXME - pipe to Selenium instead :)
        const ticker = this.safeValue (response, 'ticker', {});
        ticker['date'] = this.safeValue (response, 'date');
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
         // FIXME - this is just an example response from zb.js
        //
        //     {
        //         "asks":[
        //             [35000.0,0.2741],
        //             [34949.0,0.0173],
        //             [34900.0,0.5004],
        //         ],
        //         "bids":[
        //             [34119.32,0.0030],
        //             [34107.83,0.1500],
        //             [34104.42,0.1500],
        //         ],
        //         "timestamp":1624536510
        //     }
        //
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetDepth (this.extend (request, params)); // FIXME - pipe to Selenium instead :)
        return this.parseOrderBook (response, symbol); // FIXME - might need to override with our own mappings
    }


    parseTicker (ticker, market = undefined) {
         // FIXME - this is just an example response from zb.js
        //
        //     {
        //         "date":"1624399623587", // injected from outside
        //         "high":"33298.38",
        //         "vol":"56152.9012",
        //         "last":"32578.55",
        //         "low":"28808.19",
        //         "buy":"32572.68",
        //         "sell":"32615.37",
        //         "turnover":"1764201303.6100",
        //         "open":"31664.85",
        //         "riseRate":"2.89"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date', this.milliseconds ());
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // FIXME - this is copied from b2c2
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api'][api]) + '/';
        url += this.implodeParams (path, params);
        if (api === 'private') {
            if (method === 'GET') {
                headers = {
                    'Authorization': 'Token ' + this.apiKey,
                };
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + this.apiKey,
                };
                if (Object.keys (params).length) {
                    body = this.json (query);
                }
            }
        }
        const r = { 'url': url, 'method': method, 'body': body, 'headers': headers };
        return r;
    }
};
