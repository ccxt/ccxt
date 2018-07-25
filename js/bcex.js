'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bcex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bcex',
            'name': 'bcex',
            'countries': [ 'CA' ],
            'version': '1',
            'has': {
                'fetchBalance': true,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://www.bcex.ca/images/bcex_logo0.png',
                'api': 'https://www.bcex.ca',
                'www': 'https://www.bcex.ca',
                'doc': 'https://www.bcex.ca/api_market/market/',
                'fees': 'http://bcex.udesk.cn/hc/articles/57085',
            },
            'api': {
                'public': {
                    'get': [
                        'Api_Market/getPriceList',
                    ],
                    'post': [
                        'Api_Order/marketOrder',
                        'Api_Market/getCoinTrade',
                    ],
                },
                'private': {
                    'post': [
                        'Api_User/userBalance',
                        'Api_Order/coinTrust',
                        'Api_Order/cancel',
                        'Api_Order/ticker',
                        'Api_Order/orderList',
                        'Api_Order/tradeList',
                        'Api_Order/trustList',
                        'Api_Order/orderList',
                        'Api_Order/depth',
                        'Api_Order/orderInfo',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'bid': 0.0,
                    'ask': 0.02 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'ckusd': 0.0,
                        'other': 0.05 / 100,
                    },
                    'deposit': {},
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetApiMarketGetPriceList ();
        let result = [];
        let keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            let currentMarketId = keys[i];
            let currentMarkets = response[currentMarketId];
            for (let j = 0; j < currentMarkets.length; j++) {
                let market = currentMarkets[j];
                let baseId = market.coin_from;
                let quoteId = market.coin_to;
                let base = this.commonCurrencyCode (baseId);
                let quote = this.commonCurrencyCode (quoteId);
                let id = base + '2' + quote;
                let symbol = base + '/' + quote;
                let active = true;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': active,
                    'info': market,
                });
            }
        }
        return result;
    }

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market.symbol,
            'type': undefined,
            'side': trade['type'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
            'order': undefined,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
        };
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        }
        let market = this.market (symbol);
        let response = await this.publicPostApiOrderMarketOrder (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostApiUserUserBalance (params);
        let data = response['data'];
        let keys = Object.keys (data);
        let result = { };
        for (let i = 0; i < keys.length; i++) {
            let currentKey = keys[i];
            let currentAmount = data[currentKey];
            let split = currentKey.split ('_');
            let id = split[0];
            let lockOrOver = split[1];
            let currency = this.commonCurrencyCode (id);
            if (!(currency in result)) {
                let account = this.account ();
                result[currency] = account;
            }
            if (lockOrOver === 'lock') {
                result[currency]['used'] = parseFloat (currentAmount);
            } else {
                result[currency]['free'] = parseFloat (currentAmount);
            }
        }
        keys = Object.keys (result);
        for (let i = 0; i < keys.length; i++) {
            let currentKey = keys[i];
            let total = result[currentKey]['used'] + result[currentKey]['total'];
            result[currentKey]['total'] = total;
        }
        result['info'] = data;
        return this.parseBalance (result);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let request = {
            'part': market.quoteId,
            'coin': market.baseId,
        };
        let response = await this.publicPostApiMarketGetCoinTrade (this.extend (request, params));
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (response, 'max'),
            'low': this.safeFloat (response, 'min'),
            'bid': this.safeFloat (response, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (response, 'sale'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (response, 'price'),
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (response, 'change_24h'),
            'average': undefined,
            'baseVolume': this.safeFloat (response, 'volume_24h'),
            'quoteVolume': undefined,
            'info': response,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.marketId (symbol);
        let request = {
            'symbol': marketId,
        };
        let response = await this.privatePostApiOrderDepth (this.extend (request, params));
        let data = response['data'];
        let orderbook = this.parseOrderBook (data, data['date']);
        return orderbook;
    }

    parseMyTrade (trade, market) {
        let timestamp = trade['created'] * 1000;
        return {
            'id': trade['order_id'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market.symbol,
            'type': undefined,
            'side': trade['side'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'number'),
            'order': undefined,
            'fee': undefined,
        };
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined) {
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            result.push (this.parseMyTrade (trades[i], market)); // will edit for parseMyTrade → parseTrade
        }
        result = this.sortBy (result, 'timestamp');
        let symbol = (typeof market !== 'undefined') ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.marketId (symbol);
        let request = {
            'symbol': marketId,
        };
        let response = await this.privatePostApiOrderOrderList (this.extend (request, params));
        let market = this.markets_by_id[marketId];
        let trades = response['data'];
        let result = this.parseMyTrades (trades, market);
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
            'trust_id': id,
        };
        let response = await this.privatePostApiOrderOrderInfo (this.extend (request, params));
        let order = response['data'];
        let timestamp = order['created'] * 1000;
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': order['flag'],
            'side': undefined,
            'price': order['price'],
            'cost': undefined,
            'average': undefined,
            'amount': order['number'],
            'filled': order['numberdeal'],
            'remaining': order['numberover'],
            'status': order['status'],
            'fee': undefined,
        };
        return result;
    }

    parseOrder (order, market = undefined) {
        let id = order['id'].toString ();
        let timestamp = order['datetime'] * 1000;
        let iso8601 = this.iso8601 (timestamp);
        let symbol = market['symbol'];
        let type = undefined;
        let side = order['type'];
        let price = order['price'];
        let average = order['avg_price'];
        let amount = order['amount'];
        let remaining = order['amount_outstanding'];
        let filled = amount - remaining;
        let status = order['status'];
        let cost = filled * price;
        let fee = undefined;
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
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

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let marketId = this.marketId (symbol);
        request['type'] = 'open';
        if (typeof symbol !== 'undefined') {
            request['symbol'] = marketId;
        }
        let orders = [];
        let response = await this.privatePostApiOrderTradeList (this.extend (request, params));
        if ('data' in response) {
            orders = response['data'];
        }
        let market = this.markets_by_id[marketId];
        let results = this.parseOrders (orders, market, since, limit);
        return results;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let marketId = this.marketId (symbol);
        request['type'] = 'all';
        if (typeof symbol !== 'undefined') {
            request['symbol'] = marketId;
        }
        let orders = [];
        let response = await this.privatePostApiOrderTradeList (this.extend (request, params));
        if ('data' in response) {
            orders = response['data'];
        }
        let market = this.markets_by_id[marketId];
        let results = this.parseOrders (orders, market, since, limit);
        return results;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'symbol': this.marketId (symbol),
            'type': side,
            'price': price,
            'number': amount,
        };
        let response = await this.privatePostApiOrderCoinTrust (this.extend (order, params));
        let data = response['data'];
        return {
            'info': response,
            'id': this.safeString (data, 'order_id'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (typeof symbol !== 'undefined') {
            request['symbol'] = symbol;
        }
        if (typeof id !== 'undefined') {
            request['order_id'] = id;
        }
        let results = await this.privatePostApiOrderCancel (this.extend (request, params));
        return results;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        }
        let url = this.urls['api'] + request;
        if (method === 'POST') {
            let messageParts = [];
            let keys = Object.keys (params);
            let paramsKeys = keys.sort ();
            for (let i = 0; i < paramsKeys.length; i++) {
                let paramKey = paramsKeys[i];
                let param = params[paramKey];
                messageParts.push (this.encode (paramKey) + '=' + this.encodeURIComponent (param));
            }
            if (api === 'private') {
                this.checkRequiredCredentials ();
                messageParts.unshift ('api_key=' + this.encodeURIComponent (this.apiKey));
                body = messageParts.join ('&');
                let message = body + '&secret_key=' + this.secret;
                let signedMessage = this.hash (message);
                body = body + '&sign=' + signedMessage;
                params['sign'] = signedMessage;
            } else {
                body = messageParts.join ('&');
            }
            headers = {};
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (body[0] === '{' && url.includes ('private')) {
            let response = JSON.parse (body);
            let code = this.safeValue (response, 'code');
            if (code !== 0) {
                throw new ExchangeError (this.id + ' ' + body);
            }
        }
    }
};
