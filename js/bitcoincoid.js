"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bitcoincoid extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincoid',
            'name': 'Bitcoin.co.id',
            'countries': 'ID', // Indonesia
            'hasCORS': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg',
                'api': {
                    'public': 'https://vip.bitcoin.co.id/api',
                    'private': 'https://vip.bitcoin.co.id/tapi',
                },
                'www': 'https://www.bitcoin.co.id',
                'doc': [
                    'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
                    'https://vip.bitcoin.co.id/trade_api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'transHistory',
                        'trade',
                        'tradeHistory',
                        'openOrders',
                        'cancelOrder',
                    ],
                },
            },
            'markets': {
                'BTC/IDR': { 'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr' },
                'BCH/IDR': { 'id': 'bch_idr', 'symbol': 'BCH/IDR', 'base': 'BCH', 'quote': 'IDR', 'baseId': 'bch', 'quoteId': 'idr' },
                'ETH/IDR': { 'id': 'eth_idr', 'symbol': 'ETH/IDR', 'base': 'ETH', 'quote': 'IDR', 'baseId': 'eth', 'quoteId': 'idr' },
                'ETC/IDR': { 'id': 'etc_idr', 'symbol': 'ETC/IDR', 'base': 'ETC', 'quote': 'IDR', 'baseId': 'etc', 'quoteId': 'idr' },
                'XRP/IDR': { 'id': 'xrp_idr', 'symbol': 'XRP/IDR', 'base': 'XRP', 'quote': 'IDR', 'baseId': 'xrp', 'quoteId': 'idr' },
                'XZC/IDR': { 'id': 'xzc_idr', 'symbol': 'XZC/IDR', 'base': 'XZC', 'quote': 'IDR', 'baseId': 'xzc', 'quoteId': 'idr' },
                'BTS/BTC': { 'id': 'bts_btc', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc' },
                'DASH/BTC': { 'id': 'drk_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'drk', 'quoteId': 'btc' },
                'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc' },
                'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc' },
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc' },
                'NXT/BTC': { 'id': 'nxt_btc', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC', 'baseId': 'nxt', 'quoteId': 'btc' },
                'XLM/BTC': { 'id': 'str_btc', 'symbol': 'XLM/BTC', 'base': 'XLM', 'quote': 'BTC', 'baseId': 'str', 'quoteId': 'btc' },
                'XEM/BTC': { 'id': 'nem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC', 'baseId': 'nem', 'quoteId': 'btc' },
                'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc' },
            },
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostGetInfo ();
        let balance = response['return'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            account['free'] = this.safeFloat (balance['balance'], lowercase, 0.0);
            account['used'] = this.safeFloat (balance['balance_hold'], lowercase, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetPairDepth (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell');
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetPairTicker (this.extend ({
            'pair': market['id'],
        }, params));
        let ticker = response['ticker'];
        let timestamp = parseFloat (ticker['server_time']) * 1000;
        let baseVolume = 'vol_' + market['baseId'].toLowerCase ();
        let quoteVolume = 'vol_' + market['quoteId'].toLowerCase ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker[baseVolume]),
            'quoteVolume': parseFloat (ticker[quoteVolume]),
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetPairTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let order = {
            'pair': market['id'],
            'type': side,
            'price': price,
        };
        let base = market['baseId'];
        order[base] = amount;
        let result = await this.privatePostTrade (this.extend (order, params));
        return {
            'info': result,
            'id': result['return']['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api == 'public') {
            url += '/' + this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + response['error']);
        return response;
    }
}
