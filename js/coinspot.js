'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinspot extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinspot',
            'name': 'CoinSpot',
            'countries': 'AU', // Australia
            'rateLimit': 1000,
            'has': {
                'CORS': false,
                'createMarketOrder': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg',
                'api': {
                    'public': 'https://www.coinspot.com.au/pubapi',
                    'private': 'https://www.coinspot.com.au/api',
                },
                'www': 'https://www.coinspot.com.au',
                'doc': 'https://www.coinspot.com.au/api',
            },
            'api': {
                'public': {
                    'get': [
                        'latest',
                    ],
                },
                'private': {
                    'post': [
                        'orders',
                        'orders/history',
                        'my/coin/deposit',
                        'my/coin/send',
                        'quote/buy',
                        'quote/sell',
                        'my/balances',
                        'my/orders',
                        'my/buy',
                        'my/sell',
                        'my/buy/cancel',
                        'my/sell/cancel',
                    ],
                },
            },
            'markets': {
                'BTC/AUD': { 'id': 'BTC', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD' },
                'LTC/AUD': { 'id': 'LTC', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD' },
                'DOGE/AUD': { 'id': 'DOGE', 'symbol': 'DOGE/AUD', 'base': 'DOGE', 'quote': 'AUD' },
            },
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostMyBalances ();
        let result = { 'info': response };
        if ('balance' in response) {
            let balances = response['balance'];
            let currencies = Object.keys (balances);
            for (let c = 0; c < currencies.length; c++) {
                let currency = currencies[c];
                let uppercase = currency.toUpperCase ();
                let account = {
                    'free': balances[currency],
                    'used': 0.0,
                    'total': balances[currency],
                };
                if (uppercase === 'DRK')
                    uppercase = 'DASH';
                result[uppercase] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.privatePostOrders (this.extend ({
            'cointype': market['id'],
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buyorders', 'sellorders', 'rate', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetLatest (params);
        let id = this.marketId (symbol);
        id = id.toLowerCase ();
        let ticker = response['prices'][id];
        let timestamp = this.milliseconds ();
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
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
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        return this.privatePostOrdersHistory (this.extend ({
            'cointype': this.marketId (symbol),
        }, params));
    }

    createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePostMy' + this.capitalize (side);
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let order = {
            'cointype': this.marketId (symbol),
            'amount': amount,
            'rate': price,
        };
        return this[method] (this.extend (order, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' cancelOrder () is not fully implemented yet');
        // let method = 'privatePostMyBuy';
        // return await this[method] ({ 'id': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey)
            throw new AuthenticationError (this.id + ' requires apiKey for all requests');
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.json (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/json',
                'key': this.apiKey,
                'sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
