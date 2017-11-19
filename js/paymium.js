"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class paymium extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'paymium',
            'name': 'Paymium',
            'countries': [ 'FR', 'EU' ],
            'rateLimit': 2000,
            'version': 'v1',
            'hasCORS': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg',
                'api': 'https://paymium.com/api',
                'www': 'https://www.paymium.com',
                'doc': [
                    'https://github.com/Paymium/api-documentation',
                    'https://www.paymium.com/page/developers',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'countries',
                        'data/{id}/ticker',
                        'data/{id}/trades',
                        'data/{id}/depth',
                        'bitcoin_charts/{id}/trades',
                        'bitcoin_charts/{id}/depth',
                    ],
                },
                'private': {
                    'get': [
                        'merchant/get_payment/{UUID}',
                        'user',
                        'user/addresses',
                        'user/addresses/{btc_address}',
                        'user/orders',
                        'user/orders/{UUID}',
                        'user/price_alerts',
                    ],
                    'post': [
                        'user/orders',
                        'user/addresses',
                        'user/payment_requests',
                        'user/price_alerts',
                        'merchant/create_payment',
                    ],
                    'delete': [
                        'user/orders/{UUID}/cancel',
                        'user/price_alerts/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': { 'id': 'eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            },
            'fees': {
                'trading': {
                    'maker': 0.0059,
                    'taker': 0.0059,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        let balances = await this.privateGetUser ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            let balance = 'balance_' + lowercase;
            let locked = 'locked_' + lowercase;
            if (balance in balances)
                account['free'] = balances[balance];
            if (locked in balances)
                account['used'] = balances[locked];
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetDataIdDepth (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let result = this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
        result['bids'] = this.sortBy (result['bids'], 0, true);
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetDataIdTicker (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let timestamp = ticker['at'] * 1000;
        let vwap = parseFloat (ticker['vwap']);
        let baseVolume = parseFloat (ticker['volume']);
        let quoteVolume = baseVolume * vwap;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': vwap,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['price']),
            'change': undefined,
            'percentage': parseFloat (ticker['variation']),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['created_at_int']) * 1000;
        let volume = 'traded_' + market['base'].toLowerCase ();
        return {
            'info': trade,
            'id': trade['uuid'],
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'],
            'price': trade['price'],
            'amount': trade[volume],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetDataIdTrades (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        let order = {
            'type': this.capitalize (type) + 'Order',
            'currency': this.marketId (market),
            'direction': side,
            'amount': amount,
        };
        if (type == 'market')
            order['price'] = price;
        let response = await this.privatePostUserOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['uuid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'orderNumber': id,
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            body = this.json (params);
            let nonce = this.nonce ().toString ();
            let auth = nonce + url + body;
            headers = {
                'Api-Key': this.apiKey,
                'Api-Signature': this.hmac (this.encode (auth), this.secret),
                'Api-Nonce': nonce,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('errors' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
}
