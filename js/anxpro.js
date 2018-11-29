'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class anxpro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'anxpro',
            'name': 'ANXPro',
            'countries': [ 'JP', 'SG', 'HK', 'NZ' ],
            'version': '2',
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchOHLCV': false,
                'fetchTrades': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api': 'https://anxpro.com/api',
                'www': 'https://anxpro.com',
                'doc': [
                    'http://docs.anxv2.apiary.io',
                    'https://anxpro.com/pages/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{currency_pair}/money/ticker',
                        '{currency_pair}/money/depth/full',
                        '{currency_pair}/money/trade/fetch', // disabled by ANXPro
                    ],
                },
                'private': {
                    'post': [
                        '{currency_pair}/money/order/add',
                        '{currency_pair}/money/order/cancel',
                        '{currency_pair}/money/order/quote',
                        '{currency_pair}/money/order/result',
                        '{currency_pair}/money/orders',
                        'money/{currency}/address',
                        'money/{currency}/send_simple',
                        'money/info',
                        'money/trade/list',
                        'money/wallet/history',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'BTC/HKD': { 'id': 'BTCHKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'BTC/CAD': { 'id': 'BTCCAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'BTC/AUD': { 'id': 'BTCAUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'BTC/SGD': { 'id': 'BTCSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'BTC/JPY': { 'id': 'BTCJPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'BTC/GBP': { 'id': 'BTCGBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'BTC/NZD': { 'id': 'BTCNZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'multiplier': 100000, 'limits': { 'amount': { 'min': 0.1, 'max': 10000000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                // delisting announced
                'XLM/BTC': { 'id': 'STRBTC', 'symbol': 'XLM/BTC', 'base': 'XLM', 'quote': 'BTC', 'multiplier': 100000000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'OAX/BTC': { 'id': 'OAXBTC', 'symbol': 'OAX/BTC', 'base': 'OAX', 'quote': 'BTC', 'multiplier': 100000000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'XRP/BTC': { 'id': 'XRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'multiplier': 100000000, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
                'DOGE/BTC': { 'id': 'DOGEBTC', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'multiplier': 100000000, 'limits': { 'amount': { 'min': 10000, 'max': 10000000000 }, 'price': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }}},
            },
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.6 / 100,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostMoneyInfo ();
        let balance = response['data'];
        let currencies = Object.keys (balance['Wallets']);
        let result = { 'info': balance };
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let account = this.account ();
            if (currency in balance['Wallets']) {
                let wallet = balance['Wallets'][currency];
                account['free'] = parseFloat (wallet['Available_Balance']['value']);
                account['total'] = parseFloat (wallet['Balance']['value']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let response = await this.publicGetCurrencyPairMoneyDepthFull (this.extend ({
            'currency_pair': this.marketId (symbol),
        }, params));
        let orderbook = response['data'];
        let t = parseInt (orderbook['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetCurrencyPairMoneyTicker (this.extend ({
            'currency_pair': this.marketId (symbol),
        }, params));
        let ticker = response['data'];
        let t = parseInt (ticker['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        let bid = this.safeFloat (ticker['buy'], 'value');
        let ask = this.safeFloat (ticker['sell'], 'value');
        let baseVolume = parseFloat (ticker['vol']['value']);
        let last = parseFloat (ticker['last']['value']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']['value']),
            'low': parseFloat (ticker['low']['value']),
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['avg']['value']),
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        throw new ExchangeError (this.id + ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/market-data/currencypairmoneytradefetch-disabled');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let order = {
            'currency_pair': market['id'],
            'amount_int': parseInt (amount * 100000000), // 10^8
        };
        if (type === 'limit') {
            order['price_int'] = parseInt (price * market['multiplier']); // 10^5 or 10^8
        }
        order['type'] = (side === 'buy') ? 'bid' : 'ask';
        let result = await this.privatePostCurrencyPairMoneyOrderAdd (this.extend (order, params));
        return {
            'info': result,
            'id': result['data'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCurrencyPairMoneyOrderCancel ({ 'oid': id });
    }

    getAmountMultiplier (code) {
        const multipliers = {
            'BTC': 100000000,
            'LTC': 100000000,
            'STR': 100000000,
            'XRP': 100000000,
            'DOGE': 100000000,
        };
        const defaultValue = 100;
        return this.safeInteger (multipliers, code, defaultValue);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let multiplier = this.getAmountMultiplier (code);
        let request = {
            'currency': currency,
            'amount_int': parseInt (amount * multiplier),
            'address': address,
        };
        if (tag !== undefined) {
            request['destinationTag'] = tag;
        }
        let response = await this.privatePostMoneyCurrencySendSimple (this.extend (request, params));
        return {
            'info': response,
            'id': response['data']['transactionId'],
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + this.version + '/' + request;
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            let secret = this.base64ToBinary (this.secret);
            // eslint-disable-next-line quotes
            let auth = request + "\0" + body;
            let signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': this.apiKey,
                'Rest-Sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (response !== undefined)
            if ('result' in response)
                if (response['result'] === 'success')
                    return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
