'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinfloor extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinfloor',
            'name': 'coinfloor',
            'rateLimit': 1000,
            'countries': [ 'UK' ],
            'has': {
                'CORS': false,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg',
                'api': 'https://webapi.coinfloor.co.uk/bist',
                'www': 'https://www.coinfloor.co.uk',
                'doc': [
                    'https://github.com/coinfloor/api',
                    'https://www.coinfloor.co.uk/api',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'password': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        '{id}/ticker/',
                        '{id}/order_book/',
                        '{id}/transactions/',
                    ],
                },
                'private': {
                    'post': [
                        '{id}/balance/',
                        '{id}/user_transactions/',
                        '{id}/open_orders/',
                        '{id}/cancel_order/',
                        '{id}/buy/',
                        '{id}/sell/',
                        '{id}/buy_market/',
                        '{id}/sell_market/',
                        '{id}/estimate_sell_market/',
                        '{id}/estimate_buy_market/',
                    ],
                },
            },
            'markets': {
                'BTC/GBP': { 'id': 'XBT/GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP', 'baseId': 'XBT', 'quoteId': 'GBP' },
                'BTC/EUR': { 'id': 'XBT/EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'XBT', 'quoteId': 'EUR' },
                'BTC/USD': { 'id': 'XBT/USD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'XBT', 'quoteId': 'USD' },
                'BCH/GBP': { 'id': 'BCH/GBP', 'symbol': 'BCH/GBP', 'base': 'BCH', 'quote': 'GBP', 'baseId': 'BCH', 'quoteId': 'GBP' },
                'ETH/GBP': { 'id': 'ETH/GBP', 'symbol': 'ETH/GBP', 'base': 'ETH', 'quote': 'GBP', 'baseId': 'ETH', 'quoteId': 'GBP' },
            },
        });
    }

    async fetchBalance (params = {}) {
        let market = undefined;
        if ('symbol' in params)
            market = this.findMarket (params['symbol']);
        if ('id' in params)
            market = this.findMarket (params['id']);
        if (!market)
            throw new NotSupported (this.id + ' fetchBalance requires a symbol param');
        let response = await this.privatePostIdBalance ({
            'id': market['id'],
        });
        let result = {
            'info': response,
        };
        // base/quote used for keys e.g. "xbt_reserved"
        let keys = market['id'].toLowerCase ().split ('/');
        result[market['base']] = {
            'free': parseFloat (response[keys[0] + '_available']),
            'used': parseFloat (response[keys[0] + '_reserved']),
            'total': parseFloat (response[keys[0] + '_balance']),
        };
        result[market['quote']] = {
            'free': parseFloat (response[keys[1] + '_available']),
            'used': parseFloat (response[keys[1] + '_reserved']),
            'total': parseFloat (response[keys[1] + '_balance']),
        };
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderbook = await this.publicGetIdOrderBook (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        // rewrite to get the timestamp from HTTP headers
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let vwap = this.safeFloat (ticker, 'vwap');
        let baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let ticker = await this.publicGetIdTicker (this.extend ({
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
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetIdTransactions (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = { 'id': this.marketId (symbol) };
        let method = 'privatePostId' + this.capitalize (side);
        if (type === 'market') {
            order['quantity'] = amount;
            method += 'Market';
        } else {
            order['price'] = price;
            order['amount'] = amount;
        }
        return this[method] (this.extend (order, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostIdCancelOrder ({ 'id': id });
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.parse8601 (order['datetime']);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount');
        let cost = price * amount;
        let side = undefined;
        let status = this.safeString (order, 'status');
        if (order['type'] === 0)
            side = 'buy';
        else if (order['type'] === 1)
            side = 'sell';
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let id = order['id'].toString ();
        return {
            'info': order,
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new NotSupported (this.id + ' fetchOpenOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orders = await this.privatePostIdOpenOrders ({
            'id': market['id'],
        });
        for (let i = 0; i < orders.length; i++) {
            // Coinfloor open orders would always be limit orders
            orders[i] = this.extend (orders[i], { 'status': 'open' });
        }
        return this.parseOrders (orders, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // curl -k -u '[User ID]/[API key]:[Passphrase]' https://webapi.coinfloor.co.uk:8090/bist/XBT/GBP/balance/
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            let auth = this.uid + '/' + this.apiKey + ':' + this.password;
            let signature = this.decode (this.stringToBase64 (this.encode (auth)));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
