'use strict';

// ---------------------------------------------------------------------------

const liqui = require ('./liqui.js');
const { ExchangeError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class dsx extends liqui {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dsx',
            'name': 'DSX',
            'countries': [ 'UK' ],
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchTickers': true,
                'fetchMyTrades': true,
                'fetchOrderBooks': false,
                'fetchL2OrderBook': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg',
                'api': {
                    'public': 'https://dsx.uk/mapi', // market data
                    'private': 'https://dsx.uk/tapi', // trading
                    'dwapi': 'https://dsx.uk/dwapi', // deposit/withdraw
                },
                'www': 'https://dsx.uk',
                'doc': [
                    'https://api.dsx.uk',
                    'https://dsx.uk/api_docs/public',
                    'https://dsx.uk/api_docs/private',
                    '',
                ],
            },
            'api': {
                // market data (public)
                'public': {
                    'get': [
                        'barsFromMoment/{id}/{period}/{start}', // empty reply :\
                        'depth/{pair}',
                        'info',
                        'lastBars/{id}/{period}/{amount}', // period is (m, h or d)
                        'periodBars/{id}/{period}/{start}/{end}',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ],
                },
                // trading (private)
                'private': {
                    'post': [
                        'info/account',
                        'history/transactions',
                        'history/trades',
                        'history/orders',
                        'orders',
                        'Trade',
                        'order/cancel',
                        'order/status',
                        'order/new',
                    ],
                },
                // deposit / withdraw (private)
                'dwapi': {
                    'post': [
                        'getCryptoDepositAddress',
                        'cryptoWithdraw',
                        'fiatWithdraw',
                        'getTransactionStatus',
                        'getTransactions',
                    ],
                },
            },
        });
    }

    getBaseQuoteFromMarketId (id) {
        let uppercase = id.toUpperCase ();
        let base = uppercase.slice (0, 3);
        let quote = uppercase.slice (3, 6);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return [ base, quote ];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostInfoAccount ();
        let balances = response['return'];
        let result = { 'info': balances };
        let funds = balances['funds'];
        let currencies = Object.keys (funds);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            uppercase = this.commonCurrencyCode (uppercase);
            let account = {
                'free': funds[currency]['available'],
                'used': 0.0,
                'total': funds[currency]['total'],
            };
            account['used'] = account['total'] - account['free'];
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let average = this.safeFloat (ticker, 'avg');
        if (typeof average !== 'undefined')
            if (average > 0)
                average = 1 / average;
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'vol_cur'),
            'info': ticker,
        };
    }

    signBodyWithSecret (body) {
        return this.decode (this.hmac (this.encode (body), this.encode (this.secret), 'sha512', 'base64'));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            url += '/v2/' + this.implodeParams (path, params);
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'method': path,
            }, query));
            let signature = this.signBodyWithSecret (body);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        } else if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            url += this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    headers = {
                        'Content-Type': 'application/json',
                    };
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['timestamp']) * 1000;
        let side = trade['type'];
        if (side === 'ask')
            side = 'sell';
        if (side === 'bid')
            side = 'buy';
        let price = this.safeFloat (trade, 'price');
        if ('rate' in trade) {
            price = this.safeFloat (trade, 'rate');
        }
        let id = this.safeString (trade, 'trade_id');
        let order = this.safeString (trade, 'orderId');
        if ('pair' in trade) {
            let marketId = trade['pair'];
            market = this.markets_by_id[marketId];
        }
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let amount = this.safeFloat (trade, 'amount');
        if ('volume' in trade) {
            amount = this.safeFloat (trade, 'volume');
        }
        let type = 'limit'; // all trades are still limit trades
        let isYourOrder = this.safeValue (trade, 'is_your_order');
        let takerOrMaker = 'taker';
        if (typeof isYourOrder !== 'undefined') {
            if (isYourOrder) {
                takerOrMaker = 'maker';
            }
        }
        let fee = this.calculateFee (symbol, type, side, amount, price, takerOrMaker);
        return {
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (typeof limit !== 'undefined') {
            request['count'] = parseInt (limit);
        }
        if (typeof since !== 'undefined') {
            request['since'] = parseInt (since / 1000);
        }
        let response = await this.privatePostHistoryTrades (this.extend (request, params));
        let trades = [];
        if ('return' in response) {
            trades = response['return'];
        }
        // trades = Object.keys (trades || []).map (trade => trades[trade].concat ({'trade_id':trade}));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderStatus (this.extend ({
            'orderId': parseInt (id),
        }, params));
        id = id.toString ();
        let newOrder = this.parseOrder (this.extend ({ 'id': id }, response['return']));
        let oldOrder = (id in this.orders) ? this.orders[id] : {};
        this.orders[id] = this.extend (oldOrder, newOrder);
        return this.orders[id];
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if ('fetchOrdersRequiresSymbol' in this.options)
            if (this.options['fetchOrdersRequiresSymbol'])
                if (typeof symbol === 'undefined')
                    throw new ExchangeError (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            let market = this.market (symbol);
            request['pair'] = market['id'];
        }
        let response = await this.privatePostOrders (this.extend (request, params));
        // liqui etc can only return 'open' orders (i.e. no way to fetch 'closed' orders)
        let openOrders = [];
        if ('return' in response)
            openOrders = this.parseOrders (response['return'], market);
        let allOrders = this.updateCachedOrders (openOrders, symbol);
        let result = this.filterBySymbol (allOrders, symbol);
        return this.filterBySinceLimit (result, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'type': side,
            'volume': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
            'orderType': type,
        };
        price = parseFloat (price);
        amount = parseFloat (amount);
        let response = await this.privatePostOrderNew (this.extend (request, params));
        let id = undefined;
        let status = 'open';
        let filled = 0.0;
        let remaining = amount;
        if ('return' in response) {
            id = this.safeString (response['return'], 'orderId');
            if (id === '0') {
                id = this.safeString (response['return'], 'init_order_id');
                status = 'closed';
            }
            filled = this.safeFloat (response['return'], 'received', 0.0);
            remaining = this.safeFloat (response['return'], 'remains', amount);
        }
        let timestamp = this.milliseconds ();
        let order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * filled,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    parseOrder (order, market = undefined) {
        let id = order['id'].toString ();
        let status = this.safeString (order, 'status');
        if (status !== 'undefined') {
            status = this.parseOrderStatus (status);
        }
        let timestamp = parseInt (order['timestampCreated']) * 1000;
        let symbol = undefined;
        if (typeof market === 'undefined') {
            market = this.markets_by_id[order['pair']];
        }
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let remaining = undefined;
        let amount = undefined;
        let price = this.safeFloat (order, 'rate');
        let filled = undefined;
        let cost = undefined;
        remaining = this.safeFloat (order, 'remainingVolume');
        amount = this.safeFloat (order, 'volume');
        if (typeof amount !== 'undefined') {
            if (typeof remaining !== 'undefined') {
                filled = amount - remaining;
                cost = price * filled;
            }
        }
        let fee = undefined;
        let result = {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        request['orderId'] = id;
        let response = await this.privatePostOrderCancel (this.extend (request, params));
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
        }
        return response;
    }
};
