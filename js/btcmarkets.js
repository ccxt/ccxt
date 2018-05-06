'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, OrderNotFound, NotSupported, InvalidOrder, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btcmarkets extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcmarkets',
            'name': 'BTC Markets',
            'countries': 'AU', // Australia
            'rateLimit': 1000, // market data cached for 1 second (trades cached for 2 seconds)
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'cancelOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg',
                'api': {
                    'public': 'https://api.btcmarkets.net',
                    'private': 'https://api.btcmarkets.net',
                    'web': 'https://btcmarkets.net/data',
                },
                'www': 'https://btcmarkets.net/',
                'doc': 'https://github.com/BTCMarkets/API',
            },
            'api': {
                'public': {
                    'get': [
                        'market/{id}/tick',
                        'market/{id}/orderbook',
                        'market/{id}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'account/{id}/tradingfee',
                    ],
                    'post': [
                        'fundtransfer/withdrawCrypto',
                        'fundtransfer/withdrawEFT',
                        'order/create',
                        'order/cancel',
                        'order/history',
                        'order/open',
                        'order/trade/history',
                        'order/createBatch', // they promise it's coming soon...
                        'order/detail',
                    ],
                },
                'web': {
                    'get': [
                        'market/BTCMarkets/{id}/tickByTime',
                    ],
                },
            },
            'markets': {
                'BTC/AUD': { 'id': 'BTC/AUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', 'maker': 0.0085, 'taker': 0.0085, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}, 'precision': { 'price': 2 }},
                'LTC/AUD': { 'id': 'LTC/AUD', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD', 'maker': 0.0085, 'taker': 0.0085, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}, 'precision': { 'price': 2 }},
                'ETH/AUD': { 'id': 'ETH/AUD', 'symbol': 'ETH/AUD', 'base': 'ETH', 'quote': 'AUD', 'maker': 0.0085, 'taker': 0.0085, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}, 'precision': { 'price': 2 }},
                'ETC/AUD': { 'id': 'ETC/AUD', 'symbol': 'ETC/AUD', 'base': 'ETC', 'quote': 'AUD', 'maker': 0.0085, 'taker': 0.0085, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}, 'precision': { 'price': 2 }},
                'XRP/AUD': { 'id': 'XRP/AUD', 'symbol': 'XRP/AUD', 'base': 'XRP', 'quote': 'AUD', 'maker': 0.0085, 'taker': 0.0085, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}, 'precision': { 'price': 2 }},
                'BCH/AUD': { 'id': 'BCH/AUD', 'symbol': 'BCH/AUD', 'base': 'BCH', 'quote': 'AUD', 'maker': 0.0085, 'taker': 0.0085, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}, 'precision': { 'price': 2 }},
                'LTC/BTC': { 'id': 'LTC/BTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'maker': 0.0022, 'taker': 0.0022, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'ETH/BTC': { 'id': 'ETH/BTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'maker': 0.0022, 'taker': 0.0022, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'ETC/BTC': { 'id': 'ETC/BTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'maker': 0.0022, 'taker': 0.0022, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'XRP/BTC': { 'id': 'XRP/BTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'maker': 0.0022, 'taker': 0.0022, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'BCH/BTC': { 'id': 'BCH/BTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'maker': 0.0022, 'taker': 0.0022, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
            },
            'timeframes': {
                '1m': 'minute',
                '1h': 'hour',
                '1d': 'day',
            },
            'exceptions': {
                '3': InvalidOrder,
                '6': DDoSProtection,
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountBalance ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let multiplier = 100000000;
            let total = parseFloat (balance['balance'] / multiplier);
            let used = parseFloat (balance['pendingFunds'] / multiplier);
            let free = total - used;
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let multiplier = 100000000; // for price and volume
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]) / multiplier,
            parseFloat (ohlcv[2]) / multiplier,
            parseFloat (ohlcv[3]) / multiplier,
            parseFloat (ohlcv[4]) / multiplier,
            parseFloat (ohlcv[5]) / multiplier,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.load_markets ();
        let market = this.market (symbol);
        let request = {
            'id': market['id'],
            'timeWindow': this.timeframes[timeframe],
        };
        if (typeof since !== 'undefined')
            request['since'] = since;
        let response = await this.webGetMarketBTCMarketsIdTickByTime (this.extend (request, params));
        return this.parseOHLCVs (response['ticks'], market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetMarketIdOrderbook (this.extend ({
            'id': market['id'],
        }, params));
        let timestamp = orderbook['timestamp'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = parseFloat (ticker['lastPrice']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['bestBid']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['bestAsk']),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume24h']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetMarketIdTick (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketIdTrades (this.extend ({
            // 'since': 59868345231,
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let multiplier = 100000000; // for price and volume
        let orderSide = (side === 'buy') ? 'Bid' : 'Ask';
        let order = this.ordered ({
            'currency': market['quote'],
        });
        order['currency'] = market['quote'];
        order['instrument'] = market['base'];
        order['price'] = parseInt (price * multiplier);
        order['volume'] = parseInt (amount * multiplier);
        order['orderSide'] = orderSide;
        order['ordertype'] = this.capitalize (type);
        order['clientRequestId'] = this.nonce ().toString ();
        let response = await this.privatePostOrderCreate (order);
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    }

    async cancelOrders (ids) {
        await this.loadMarkets ();
        for (let i = 0; i < ids.length; i++) {
            ids[i] = parseInt (ids[i]);
        }
        return await this.privatePostOrderCancel ({ 'orderIds': ids });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.cancelOrders ([ id ]);
    }

    parseMyTrade (trade, market) {
        let multiplier = 100000000;
        let timestamp = trade['creationTime'];
        let side = (trade['side'] === 'Bid') ? 'buy' : 'sell';
        // BTCMarkets always charge in AUD for AUD-related transactions.
        let currency = (market['quote'] === 'AUD') ? market['quote'] : market['base'];
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': trade['price'] / multiplier,
            'fee': {
                'currency': currency,
                'cost': trade['fee'] / multiplier,
            },
            'amount': trade['volume'] / multiplier,
            'order': this.safeString (trade, 'orderId'),
        };
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined) {
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            let trade = this.parseMyTrade (trades[i], market);
            result.push (trade);
        }
        return result;
    }

    parseOrder (order, market = undefined) {
        let multiplier = 100000000;
        let side = (order['orderSide'] === 'Bid') ? 'buy' : 'sell';
        let type = (order['ordertype'] === 'Limit') ? 'limit' : 'market';
        let timestamp = order['creationTime'];
        if (!market) {
            market = this.market (order['instrument'] + '/' + order['currency']);
        }
        let status = 'open';
        if (order['status'] === 'Failed' || order['status'] === 'Cancelled' || order['status'] === 'Partially Cancelled' || order['status'] === 'Error') {
            status = 'canceled';
        } else if (order['status'] === 'Fully Matched' || order['status'] === 'Partially Matched') {
            status = 'closed';
        }
        let price = this.safeFloat (order, 'price') / multiplier;
        let amount = this.safeFloat (order, 'volume') / multiplier;
        let remaining = this.safeFloat (order, 'openVolume', 0.0) / multiplier;
        let filled = amount - remaining;
        let cost = price * amount;
        let trades = this.parseMyTrades (order['trades'], market);
        let result = {
            'info': order,
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'trades': trades,
            'fee': undefined,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = [ parseInt (id) ];
        let response = await this.privatePostOrderDetail (this.extend ({
            'orderIds': ids,
        }, params));
        let numOrders = response['orders'].length;
        if (numOrders < 1)
            throw new OrderNotFound (this.id + ' No matching order found: ' + id);
        let order = response['orders'][0];
        return this.parseOrder (order);
    }

    prepareHistoryRequest (market, since = undefined, limit = undefined) {
        let request = this.ordered ({
            'currency': market['quote'],
            'instrument': market['base'],
        });
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        else
            request['limit'] = 100;
        if (typeof since !== 'undefined')
            request['since'] = since;
        else
            request['since'] = 0;
        return request;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new NotSupported (this.id + ': fetchOrders requires a `symbol` parameter.');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.prepareHistoryRequest (market, since, limit);
        let response = await this.privatePostOrderHistory (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new NotSupported (this.id + ': fetchOpenOrders requires a `symbol` parameter.');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.prepareHistoryRequest (market, since, limit);
        let response = await this.privatePostOrderOpen (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new NotSupported (this.id + ': fetchMyTrades requires a `symbol` parameter.');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.prepareHistoryRequest (market, since, limit);
        let response = await this.privatePostOrderTradeHistory (this.extend (request, params));
        return this.parseMyTrades (response['trades'], market);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let uri = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + uri;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            // eslint-disable-next-line quotes
            let auth = uri + "\n" + nonce + "\n";
            headers = {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
                'timestamp': nonce,
            };
            if (method === 'POST') {
                body = this.json (params);
                auth += body;
            }
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers['signature'] = this.decode (signature);
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (body.length < 2)
            return; // fallback to default error handler
        if (body[0] === '{') {
            let response = JSON.parse (body);
            if ('success' in response) {
                if (!response['success']) {
                    let error = this.safeString (response, 'errorCode');
                    let message = this.id + ' ' + this.json (response);
                    if (error in this.exceptions) {
                        let ExceptionClass = this.exceptions[error];
                        throw new ExceptionClass (message);
                    } else {
                        throw new ExchangeError (message);
                    }
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
};
