"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class zb extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zb',
            'name': 'ZB',
            'countries': 'CN',
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': false,
            'hasFetchOrder': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg',
                'api': {
                    'public': 'http://api.zb.com/data', // no https for public API
                    'private': 'https://trade.zb.com/api',
                },
                'www': 'https://trade.zb.com/api',
                'doc': 'https://www.zb.com/i/developer',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                    ],
                },
                'private': {
                    'post': [
                        'order',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getAccountInfo',
                        'getUserAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        return {
            'BTC/USDT': { 'id': 'btc_usdt', 'symbol': 'BTC/USDT', 'base': 'BTC', 'quote': 'USDT' },
            'LTC/USDT': { 'id': 'ltc_usdt', 'symbol': 'LTC/USDT', 'base': 'LTC', 'quote': 'USDT' },
            'ETH/USDT': { 'id': 'eth_usdt', 'symbol': 'ETH/USDT', 'base': 'ETH', 'quote': 'USDT' },
            'ETC/USDT': { 'id': 'etc_usdt', 'symbol': 'ETC/USDT', 'base': 'ETC', 'quote': 'USDT' },
            'BTS/USDT': { 'id': 'bts_usdt', 'symbol': 'BTS/USDT', 'base': 'BTS', 'quote': 'USDT' },
            'EOS/USDT': { 'id': 'eos_usdt', 'symbol': 'EOS/USDT', 'base': 'EOS', 'quote': 'USDT' },
            'BCH/USDT': { 'id': 'bcc_usdt', 'symbol': 'BCH/USDT', 'base': 'BCH', 'quote': 'USDT' },
            'HSR/USDT': { 'id': 'hsr_usdt', 'symbol': 'HSR/USDT', 'base': 'HSR', 'quote': 'USDT' },
            'QTUM/USDT': { 'id': 'qtum_usdt', 'symbol': 'QTUM/USDT', 'base': 'QTUM', 'quote': 'USDT' },
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['result'];
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balances['balance'])
                account['free'] = parseFloat (balances['balance'][currency]['amount']);
            if (currency in balances['frozen'])
                account['used'] = parseFloat (balances['frozen'][currency]['amount']);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    getMarketFieldName () {
        return 'market';
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let orderbook = await this.publicGetDepth (this.extend (request, params));
        let timestamp = this.milliseconds ();
        let bids = undefined;
        let asks = undefined;
        if ('bids' in orderbook)
            bids = orderbook['bids'];
        if ('asks' in orderbook)
            asks = orderbook['asks'];
        let result = {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        if (result['bids'])
            result['bids'] = this.sortBy (result['bids'], 0, true);
        if (result['asks'])
            result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let response = await this.publicGetTicker (this.extend (request, params));
        let ticker = response['ticker'];
        let timestamp = this.milliseconds ();
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
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date'] * 1000;
        let side = (trade['trade_type'] == 'bid') ? 'buy' : 'sell';
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let paramString = '&price=' + price.toString ();
        paramString += '&amount=' + amount.toString ();
        let tradeType = (side == 'buy') ? '1' : '0';
        paramString += '&tradeType=' + tradeType;
        paramString += '&currency=' + this.marketId (symbol);
        let response = await this.privatePostOrder (paramString);
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let paramString = '&id=' + id.toString ();
        if ('currency' in params)
            paramString += '&currency=' + params['currency'];
        return await this.privatePostCancelOrder (paramString);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let paramString = '&id=' + id.toString ();
        if ('currency' in params)
            paramString += '&currency=' + params['currency'];
        return await this.privatePostGetOrder (paramString);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api == 'public') {
            url += '/' + this.version + '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let paramsLength = params.length; // params should be a string here
            let nonce = this.nonce ();
            let auth = 'method=' + path;
            auth += '&accesskey=' + this.apiKey;
            auth += paramsLength ? params : '';
            let secret = this.hash (this.encode (this.secret), 'sha1');
            let signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            let suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api == 'private')
            if ('code' in response)
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
}
