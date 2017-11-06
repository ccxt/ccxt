"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class chbtc extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'chbtc',
            'name': 'CHBTC',
            'countries': 'CN',
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': false,
            'hasFetchOrder': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg',
                'api': {
                    'public': 'http://api.chbtc.com/data', // no https for public API
                    'private': 'https://trade.chbtc.com/api',
                },
                'www': 'https://trade.chbtc.com/api',
                'doc': 'https://www.chbtc.com/i/developer',
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
            'markets': {
                'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
                'LTC/CNY': { 'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY' },
                'ETH/CNY': { 'id': 'eth_cny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY' },
                'ETC/CNY': { 'id': 'etc_cny', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY' },
                'BTS/CNY': { 'id': 'bts_cny', 'symbol': 'BTS/CNY', 'base': 'BTS', 'quote': 'CNY' },
                // 'EOS/CNY': { 'id': 'eos_cny', 'symbol': 'EOS/CNY', 'base': 'EOS', 'quote': 'CNY' },
                'BCH/CNY': { 'id': 'bcc_cny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY' },
                'HSR/CNY': { 'id': 'hsr_cny', 'symbol': 'HSR/CNY', 'base': 'HSR', 'quote': 'CNY' },
                'QTUM/CNY': { 'id': 'qtum_cny', 'symbol': 'QTUM/CNY', 'base': 'QTUM', 'quote': 'CNY' },
            },
        });
    }

    async fetchBalance (params = {}) {
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

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetDepth (this.extend ({
            'currency': market['id'],
        }, params));
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
        let response = await this.publicGetTicker (this.extend ({
            'currency': this.marketId (symbol),
        }, params));
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
        let response = await this.publicGetTrades (this.extend ({
            'currency': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
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
        let paramString = '&id=' + id.toString ();
        if ('currency' in params)
            paramString += '&currency=' + params['currency'];
        return await this.privatePostCancelOrder (paramString);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
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
