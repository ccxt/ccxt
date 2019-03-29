'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class bitmart extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmart',
            'name': 'Bitmart',
            'countries': [ 'US', 'CN', 'HK', 'KR' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchCurrencies': true,
            },
            'urls': {
                'logo': 'https://www.bitmart.com/_nuxt/img/ed5c199.png',
                'api': 'https://openapi.bitmart.com',
                'www': 'https://www.bitmart.com/',
                'doc': 'https://github.com/bitmartexchange/bitmart-official-api-docs/blob/master/REST.md',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'symbols',
                        'symbols_details',
                        'symbols/{symbol}/trades',
                        'currencies',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetSymbolsDetails ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'];
            let base = market['base_currency'];
            let quote = market['quote_currency'];
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': market['price_max_precision'],
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'precision': precision,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = ticker['symbol_id'];
        let last = this.safeFloat (ticker, 'current_price');
        let percentage = this.safeFloat (ticker, 'fluctuation');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highest_price'),
            'low': this.safeFloat (ticker, 'lowest_price'),
            'bid': this.safeFloat (ticker, 'bid_1'),
            'bidVolume': this.safeFloat (ticker, 'bid_1_amount'),
            'ask': this.safeFloat (ticker, 'ask_1'),
            'askVolume': this.safeFloat (ticker, 'ask_1_amount'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage * 100,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'base_volume'),
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetTicker (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseTicker (ticker);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = this.parseTicker (tickers[i]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetCurrencies (params);
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['id'];
            result[id] = {
                'id': id,
                'code': id,
                'name': currency['name'],
                'info': currency, // the original payload
                'active': true,
            };
        }
        return result;
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['order_time']);
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'].toLowerCase (),
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetSymbolsSymbolTrades (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            // FIXME: need to fetch bearer token before sending a request. params must be sorted a-z.
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'timestamp': nonce }, params));
            headers = {
                'Content-Type': 'application/json',
                'X-BM-TIMESTAMP': nonce,
                'X-BM-AUTHORIZATION': 'Bearer: <token>',
                'X-BM-SIGNATURE': this.hmac (this.encode (body), this.encode (this.secret), 'sha256'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
