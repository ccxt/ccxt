'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InvalidOrder, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': [ 'KR' ], // Korea
            'rateLimit': 667,
            'version': 'v2',
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchTickers': true,
                'fetchOrder': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg',
                'api': 'https://api.coinone.co.kr',
                'www': 'https://coinone.co.kr',
                'doc': 'https://doc.coinone.co.kr',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook/',
                        'trades/',
                        'ticker/',
                    ],
                },
                'private': {
                    'post': [
                        'account/btc_deposit_address/',
                        'account/balance/',
                        'account/daily_balance/',
                        'account/user_info/',
                        'account/virtual_account/',
                        'order/cancel_all/',
                        'order/cancel/',
                        'order/limit_buy/',
                        'order/limit_sell/',
                        'order/complete_orders/',
                        'order/limit_orders/',
                        'order/order_info/',
                        'transaction/auth_number/',
                        'transaction/history/',
                        'transaction/krw/history/',
                        'transaction/btc/',
                        'transaction/coin/',
                    ],
                },
            },
            'markets': {
                'BCH/KRW': { 'id': 'bch', 'symbol': 'BCH/KRW', 'base': 'BCH', 'quote': 'KRW', 'baseId': 'bch', 'quoteId': 'krw' },
                'BTC/KRW': { 'id': 'btc', 'symbol': 'BTC/KRW', 'base': 'BTC', 'quote': 'KRW', 'baseId': 'btc', 'quoteId': 'krw' },
                'BTG/KRW': { 'id': 'btg', 'symbol': 'BTG/KRW', 'base': 'BTG', 'quote': 'KRW', 'baseId': 'btg', 'quoteId': 'krw' },
                'ETC/KRW': { 'id': 'etc', 'symbol': 'ETC/KRW', 'base': 'ETC', 'quote': 'KRW', 'baseId': 'etc', 'quoteId': 'krw' },
                'ETH/KRW': { 'id': 'eth', 'symbol': 'ETH/KRW', 'base': 'ETH', 'quote': 'KRW', 'baseId': 'eth', 'quoteId': 'krw' },
                'IOTA/KRW': { 'id': 'iota', 'symbol': 'IOTA/KRW', 'base': 'IOTA', 'quote': 'KRW', 'baseId': 'iota', 'quoteId': 'krw' },
                'LTC/KRW': { 'id': 'ltc', 'symbol': 'LTC/KRW', 'base': 'LTC', 'quote': 'KRW', 'baseId': 'ltc', 'quoteId': 'krw' },
                'OMG/KRW': { 'id': 'omg', 'symbol': 'OMG/KRW', 'base': 'OMG', 'quote': 'KRW', 'baseId': 'omg', 'quoteId': 'krw' },
                'QTUM/KRW': { 'id': 'qtum', 'symbol': 'QTUM/KRW', 'base': 'QTUM', 'quote': 'KRW', 'baseId': 'qtum', 'quoteId': 'krw' },
                'XRP/KRW': { 'id': 'xrp', 'symbol': 'XRP/KRW', 'base': 'XRP', 'quote': 'KRW', 'baseId': 'xrp', 'quoteId': 'krw' },
                'EOS/KRW': { 'id': 'eos', 'symbol': 'EOS/KRW', 'base': 'EOS', 'quote': 'KRW', 'baseId': 'eos', 'quoteId': 'krw' },
                'DATA/KRW': { 'id': 'data', 'symbol': 'DATA/KRW', 'base': 'DATA', 'quote': 'KRW', 'baseId': 'data', 'quoteId': 'krw' },
                'ZIL/KRW': { 'id': 'zil', 'symbol': 'ZIL/KRW', 'base': 'ZIL', 'quote': 'KRW', 'baseId': 'zil', 'quoteId': 'krw' },
                'KNC/KRW': { 'id': 'knc', 'symbol': 'KNC/KRW', 'base': 'KNC', 'quote': 'KRW', 'baseId': 'knc', 'quoteId': 'krw' },
                'ZRX/KRW': { 'id': 'zrx', 'symbol': 'ZRX/KRW', 'base': 'ZRX', 'quote': 'KRW', 'baseId': 'zrx', 'quoteId': 'krw' },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                    'tiers': {
                        'taker': [
                            [0, 0.001],
                            [100000000, 0.0009],
                            [1000000000, 0.0008],
                            [5000000000, 0.0007],
                            [10000000000, 0.0006],
                            [20000000000, 0.0005],
                            [30000000000, 0.0004],
                            [40000000000, 0.0003],
                            [50000000000, 0.0002],
                        ],
                        'maker': [
                            [0, 0.001],
                            [100000000, 0.0008],
                            [1000000000, 0.0006],
                            [5000000000, 0.0004],
                            [10000000000, 0.0002],
                            [20000000000, 0],
                            [30000000000, 0],
                            [40000000000, 0],
                            [50000000000, 0],
                        ],
                    },
                },
            },
            'exceptions': {
                '405': ExchangeNotAvailable,
                '104': OrderNotFound,
            },
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostAccountBalance ();
        let result = { 'info': response };
        let balances = this.omit (response, [
            'errorCode',
            'result',
            'normalWallets',
        ]);
        let ids = Object.keys (balances);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let balance = balances[id];
            let code = id.toUpperCase ();
            if (id in this.currencies_by_id)
                code = this.currencies_by_id[id]['code'];
            let free = parseFloat (balance['avail']);
            let total = parseFloat (balance['balance']);
            let used = total - free;
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetOrderbook (this.extend ({
            'currency': market['id'],
            'format': 'json',
        }, params));
        return this.parseOrderBook (response, undefined, 'bid', 'ask', 'price', 'qty');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (this.extend ({
            'currency': 'all',
            'format': 'json',
        }, params));
        let result = {};
        let tickers = response;
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
                let ticker = tickers[id];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'currency': market['id'],
            'format': 'json',
        }, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let last = this.safeFloat (ticker, 'last');
        let previousClose = this.safeFloat (ticker, 'yesterday_last');
        let change = undefined;
        if (last !== undefined && previousClose !== undefined)
            change = previousClose - last;
        let symbol = (market !== undefined) ? market['symbol'] : undefined;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'first'),
            'close': last,
            'last': last,
            'previousClose': previousClose,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['timestamp']) * 1000;
        let symbol = (market !== undefined) ? market['symbol'] : undefined;
        let is_ask = this.safeString (trade, 'is_ask');
        let side = undefined;
        if (is_ask === '1') {
            side = 'sell';
        } else if (is_ask === '0') {
            side = 'buy';
        }
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'qty'),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'currency': market['id'],
            'period': 'hour',
            'format': 'json',
        }, params));
        return this.parseTrades (response['completeOrders'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let request = {
            'price': price,
            'currency': this.marketId (symbol),
            'qty': amount,
        };
        let method = 'privatePostOrder' + this.capitalize (type) + this.capitalize (side);
        let response = await this[method] (this.extend (request, params));
        let id = this.safeString (response, 'orderId');
        if (id !== undefined) {
            id = id.toUpperCase ();
        }
        let timestamp = this.milliseconds ();
        let cost = price * amount;
        let order = {
            'info': response,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': amount,
            'status': 'open',
            'fee': undefined,
        };
        this.orders[id] = order;
        return order;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let result = undefined;
        let market = undefined;
        if (symbol === undefined) {
            if (id in this.orders) {
                market = this.market (this.orders[id]['symbol']);
            } else {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument for order ids missing in the .orders cache (the order was created with a different instance of this class or within a different run of this code).');
            }
        } else {
            market = this.market (symbol);
        }
        try {
            let response = await this.privatePostOrderOrderInfo (this.extend ({
                'order_id': id,
                'currency': market['id'],
            }, params));
            result = this.parseOrder (response);
            this.orders[id] = result;
        } catch (e) {
            if (e instanceof OrderNotFound) {
                if (id in this.orders) {
                    this.orders[id]['status'] = 'canceled';
                    result = this.orders[id];
                } else {
                    throw e;
                }
            } else {
                throw e;
            }
        }
        return result;
    }

    parseOrderStatus (status) {
        let statuses = {
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    parseOrder (order, market = undefined) {
        let info = this.safeValue (order, 'info');
        let id = this.safeString (info, 'orderId');
        if (id !== undefined) {
            id = id.toUpperCase ();
        }
        let timestamp = parseInt (info['timestamp']) * 1000;
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let cost = undefined;
        let side = this.safeString (info, 'type');
        if (side.indexOf ('ask') >= 0) {
            side = 'sell';
        } else {
            side = 'buy';
        }
        let price = this.safeFloat (info, 'price');
        let amount = this.safeFloat (info, 'qty');
        let remaining = this.safeFloat (info, 'remainQty');
        let filled = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
            }
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        let currency = this.safeString (info, 'currency');
        let fee = {
            'currency': currency,
            'cost': this.safeFloat (info, 'fee'),
            'rate': this.safeFloat (info, 'feeRate'),
        };
        let symbol = undefined;
        if (market === undefined) {
            let marketId = currency.toLowerCase ();
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        if (market !== undefined)
            symbol = market['symbol'];
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let order = this.safeValue (this.orders, id);
        let amount = undefined;
        let price = undefined;
        let side = undefined;
        if (order === undefined) {
            if (symbol === undefined) {
                // eslint-disable-next-line quotes
                throw new InvalidOrder (this.id + " cancelOrder could not find the order id " + id + " in orders cache. The order was probably created with a different instance of this class earlier. The `symbol` argument is missing. To cancel the order, pass a symbol argument and {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument of cancelOrder.");
            }
            price = this.safeFloat (params, 'price');
            if (price === undefined) {
                // eslint-disable-next-line quotes
                throw new InvalidOrder (this.id + " cancelOrder could not find the order id " + id + " in orders cache. The order was probably created with a different instance of this class earlier. The `price` parameter is missing. To cancel the order, pass a symbol argument and {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument of cancelOrder.");
            }
            amount = this.safeFloat (params, 'qty');
            if (amount === undefined) {
                // eslint-disable-next-line quotes
                throw new InvalidOrder (this.id + " cancelOrder could not find the order id " + id + " in orders cache. The order was probably created with a different instance of this class earlier. The `qty` (amount) parameter is missing. To cancel the order, pass a symbol argument and {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument of cancelOrder.");
            }
            side = this.safeFloat (params, 'is_ask');
            if (side === undefined) {
                // eslint-disable-next-line quotes
                throw new InvalidOrder (this.id + " cancelOrder could not find the order id " + id + " in orders cache. The order was probably created with a different instance of this class earlier. The `is_ask` (side) parameter is missing. To cancel the order, pass a symbol argument and {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument of cancelOrder.");
            }
        } else {
            price = order['price'];
            amount = order['amount'];
            side = (order['side'] === 'buy') ? 0 : 1;
            symbol = order['symbol'];
        }
        let request = {
            'order_id': id,
            'price': price,
            'qty': amount,
            'is_ask': side,
            'currency': this.marketId (symbol),
        };
        this.orders[id]['status'] = 'canceled';
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/';
        if (api === 'public') {
            url += request;
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += this.version + '/' + request;
            let nonce = this.nonce ().toString ();
            let json = this.json (this.extend ({
                'access_token': this.apiKey,
                'nonce': nonce,
            }, params));
            let payload = this.stringToBase64 (this.encode (json));
            body = this.decode (payload);
            let secret = this.secret.toUpperCase ();
            let signature = this.hmac (payload, this.encode (secret), 'sha512');
            headers = {
                'content-type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if ((body[0] === '{') || (body[0] === '[')) {
            if ('result' in response) {
                let result = response['result'];
                if (result !== 'success') {
                    //
                    //    {  "errorCode": "405",  "status": "maintenance",  "result": "error"}
                    //
                    const code = this.safeString (response, 'errorCode');
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        throw new exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            } else {
                throw new ExchangeError (this.id + ' ' + body);
            }
        }
    }
};
