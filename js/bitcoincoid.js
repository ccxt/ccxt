"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitcoincoid extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincoid',
            'name': 'Bitcoin.co.id',
            'countries': 'ID', // Indonesia
            'hasCORS': false,
            // new metainfo interface
            'has': {
                'fetchTickers': false,
                'fetchOHLCV': false,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': false,
                'fetchCurrencies': false,
                'withdraw': false,
            },
            'version': '1.7', // as of 6 November 2017
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
                        'getOrder',
                        'openOrders',
                        'cancelOrder',
                        'orderHistory',
                    ],
                },
            },
            'markets': {
                'BTC/IDR': { 'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr' },
                'BCH/IDR': { 'id': 'bch_idr', 'symbol': 'BCH/IDR', 'base': 'BCH', 'quote': 'IDR', 'baseId': 'bch', 'quoteId': 'idr' },
                'BTG/IDR': { 'id': 'btg_idr', 'symbol': 'BTG/IDR', 'base': 'BTG', 'quote': 'IDR', 'baseId': 'btg', 'quoteId': 'idr' },
                'ETH/IDR': { 'id': 'eth_idr', 'symbol': 'ETH/IDR', 'base': 'ETH', 'quote': 'IDR', 'baseId': 'eth', 'quoteId': 'idr' },
                'ETC/IDR': { 'id': 'etc_idr', 'symbol': 'ETC/IDR', 'base': 'ETC', 'quote': 'IDR', 'baseId': 'etc', 'quoteId': 'idr' },
                'IGNIS/IDR': { 'id': 'ignis_idr', 'symbol': 'IGNIS/IDR', 'base': 'IGNIS', 'quote': 'IDR', 'baseId': 'ignis', 'quoteId': 'idr' },
                'LTC/IDR': { 'id': 'ltc_idr', 'symbol': 'LTC/IDR', 'base': 'LTC', 'quote': 'IDR', 'baseId': 'ltc', 'quoteId': 'idr' },
                'NXT/IDR': { 'id': 'nxt_idr', 'symbol': 'NXT/IDR', 'base': 'NXT', 'quote': 'IDR', 'baseId': 'nxt', 'quoteId': 'idr' },
                'WAVES/IDR': { 'id': 'waves_idr', 'symbol': 'WAVES/IDR', 'base': 'WAVES', 'quote': 'IDR', 'baseId': 'waves', 'quoteId': 'idr' },
                'XRP/IDR': { 'id': 'xrp_idr', 'symbol': 'XRP/IDR', 'base': 'XRP', 'quote': 'IDR', 'baseId': 'xrp', 'quoteId': 'idr' },
                'XZC/IDR': { 'id': 'xzc_idr', 'symbol': 'XZC/IDR', 'base': 'XZC', 'quote': 'IDR', 'baseId': 'xzc', 'quoteId': 'idr' },
                'XLM/IDR': { 'id': 'str_idr', 'symbol': 'XLM/IDR', 'base': 'XLM', 'quote': 'IDR', 'baseId': 'str', 'quoteId': 'idr' },
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
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balance = response['return'];
        let result = { 'info': balance };
        let codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i];
            let currency = this.currencies[code];
            let lowercase = currency['id'];
            let account = this.account ();
            account['free'] = this.safeFloat (balance['balance'], lowercase, 0.0);
            account['used'] = this.safeFloat (balance['balance_hold'], lowercase, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetPairDepth (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
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
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPairTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        if ('type' in order)
            side = order['type'];
        let status = this.safeString (order, 'status', 'open');
        if (status == 'filled') {
            status = 'closed';
        } else if (status == 'calcelled') {
            status = 'canceled';
        }
        let symbol = undefined;
        let cost = undefined;
        let price = this.safeFloat (order, 'price');
        let amount = undefined;
        let remaining = undefined;
        let filled = undefined;
        if (market) {
            symbol = market['symbol'];
            let quoteId = market['quoteId'];
            let baseId = market['baseId'];
            if ((market['quoteId'] == 'idr') && ('order_rp' in order))
                quoteId = 'rp';
            if ((market['baseId'] == 'idr') && ('remain_rp' in order))
                baseId = 'rp';
            cost = this.safeFloat (order, 'order_' + quoteId);
            if (cost) {
                amount = cost / price;
                let remainingCost = this.safeFloat (order, 'remain_' + quoteId);
                if (typeof remainingCost !== 'undefined') {
                    remaining = remainingCost / price;
                    filled = amount - remaining;
                }
            } else {
                amount = this.safeFloat (order, 'order_' + baseId);
                cost = price * amount;
                remaining = this.safeFloat (order, 'remain_' + baseId);
                filled = amount - remaining;
            }
        }
        let average = undefined;
        if (filled)
            average = cost / filled;
        let timestamp = parseInt (order['submit_time']);
        let fee = undefined;
        let result = {
            'info': order,
            'id': order['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostGetOrder (this.extend ({
            'pair': market['id'],
            'order_id': id,
        }, params));
        let orders = response['return'];
        let order = this.parseOrder (this.extend ({ 'id': id }, orders['order']), market);
        return this.extend ({ 'info': response }, order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        let response = await this.privatePostOpenOrders (this.extend (request, params));
        let orders = this.parseOrders (response['return']['orders'], market, since, limit);
        return this.filterOrdersBySymbol (orders, symbol);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol');
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        let response = await this.privatePostOrderHistory (this.extend (request, params));
        let orders = this.parseOrders (response['return']['orders'], market, since, limit);
        orders = this.filterBy (orders, 'status', 'closed');
        if (symbol)
            return this.filterOrdersBySymbol (orders, symbol);
        return orders;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
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
        await this.loadMarkets ();
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
