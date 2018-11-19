'use strict';

const okex = require('./okex');
const { ExchangeError, ArgumentsRequired, DDoSProtection, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError } = require('./base/errors');

module.exports = class okex3 extends okex {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'okex3',
            'name': 'OKEX v3',
            'version': 'v3',
            'has': {
                'CORS': false,
                'futures': true,
                'fetchTickers': true,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': {
                    'public': 'https://www.okex.com/api',
                    'private': 'https://www.okex.com/api',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/docs/',
                'fees': 'https://www.okex.com/pages/products/fees.html',
            },
            'api': {
                'public': {
                    'get': [
                        'spot/v3/instruments/{symbol}/book',    //instrument-id
                        'spot/v3/instruments/ticker',
                        'spot/v3/instruments/{symbol}/ticker',
                        'spot/v3/instruments/{symbol}/trades',
                        'spot/v3/instruments/{symbol}/candles',
                        'futures/v3/instruments/{symbol}/book',
                        'futures/v3/instruments/ticker',
                        'futures/v3/instruments/{symbol}/ticker',
                        'futures/v3/instruments/{symbol}/trades',
                        'futures/v3/instruments/{symbol}/candles',
                        'general/v3/time'
                    ]
                },
                'private': {
                    'post': [
                        'account/v3/transfer',
                        'account/v3/withdrawal',
                        
                    ],
                    'get': [
                        'account/v3/withdrawal/fee'
                    ]
                }
            },
        });
    }

    // async fetchTicker(symbol, params = {}) {
    //     await this.loadMarkets();
    //     let market = this.market(symbol);
    //     let method = 'publicGet';
    //     let request = {
    //         'symbol': market['id'],
    //     };
    //     if (market['future']) {
    //         method += 'Futures';
    //         request['contract'] = this.options['defaultContractType']; // this_week, next_week, quarter
    //     }
    //     else {
    //         method += 'Spot'
    //     }
    //     method += 'V3InstrumentsSymbolTicker';
    //     let ticker = await this[method](this.extend(request, params));
    //     if (ticker === undefined)
    //         throw new ExchangeError(this.id + ' fetchTicker returned an empty response: ' + this.json(ticker));
    //     let timestamp = this.parseDate(ticker['timestamp']);
    //     if (timestamp !== undefined) {
    //         ticker = this.extend(ticker, { 'timestamp': timestamp });
    //     }
    //     return this.parseTicker(ticker, market);
    // }

    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        url += this.implodeParams(path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials();
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
            }
            let seconds = this.milliseconds ();
            let timestamp = this.iso8601 (seconds + '-08:00');
            let payload = [timestamp, method, '/api' + url].join('');
            if (body) {
                payload += body;
            }
            let signature = this.hmac(payload, this.secret, 'sha256', 'base64');
            headers = { 
                'OK-ACCESS-KEY': this.apiKey,
                'OK-ACCESS-SIGN': this.decode (signature),
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json' 
            };
        } 
        else {
            if (Object.keys(params).length)
                url += '?' + this.urlencode(params);
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    // parseTicker(ticker, market = undefined) {
    //     // {
    //     //     ask: "5752.5297",
    //     //     base_volume_24h: "75415",
    //     //     best_ask: "5752.5297",
    //     //     best_bid: "5752.1805",
    //     //     bid: "5752.1805",
    //     //     high_24h: "6484.98",
    //     //     instrument_id: "BTC-USDT",
    //     //     last: "5751.8177",
    //     //     low_24h: "5642.6087",
    //     //     open_24h: "6459.4281",
    //     //     product_id: "BTC-USDT",
    //     //     quote_volume_24h: "",
    //     //     timestamp: "2018-11-15T03:59:05.750Z",
    //     // }
    //     let timestamp = this.safeInteger2(ticker, 'timestamp', 'createdDate');
    //     let symbol = undefined;
    //     if (market === undefined) {
    //         if ('symbol' in ticker) {
    //             let marketId = ticker['symbol'];
    //             if (marketId in this.markets_by_id) {
    //                 market = this.markets_by_id[marketId];
    //             } else {
    //                 let [baseId, quoteId] = ticker['symbol'].split('_');
    //                 let base = baseId.toUpperCase();
    //                 let quote = quoteId.toUpperCase();
    //                 base = this.commonCurrencyCode(base);
    //                 quote = this.commonCurrencyCode(quote);
    //                 symbol = base + '/' + quote;
    //             }
    //         }
    //     }
    //     if (market !== undefined) {
    //         symbol = market['symbol'];
    //     }
    //     let last = this.safeFloat(ticker, 'last');
    //     let open = this.safeFloat(ticker, 'open_24h');
    //     let change = this.safeFloat(ticker, 'change');
    //     let percentage = this.safeFloat(ticker, 'changePercentage');
    //     return {
    //         'symbol': symbol,
    //         'timestamp': timestamp,
    //         'datetime': this.iso8601(timestamp),
    //         'high': this.safeFloat(ticker, 'high_24h'),
    //         'low': this.safeFloat(ticker, 'low_24h'),
    //         'bid': this.safeFloat(ticker, 'bid'),
    //         'bidVolume': undefined,
    //         'ask': this.safeFloat(ticker, 'ask'),
    //         'askVolume': undefined,
    //         'vwap': undefined,
    //         'open': open,
    //         'close': last,
    //         'last': last,
    //         'previousClose': undefined,
    //         'change': change,
    //         'percentage': percentage,
    //         'average': undefined,
    //         'baseVolume': this.safeFloat2(ticker, 'base_volume_24h'),
    //         'quoteVolume': this.safeFloat2(ticker, 'quote_volume_24h'),
    //         'info': ticker,
    //     };
    // }
};
