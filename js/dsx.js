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
            'version': 'v2',
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
            'options': {
                'fetchOrderMethod': 'privatePostOrderStatus',
                'fetchMyTradesMethod': 'privatePostHistoryTrades',
                'cancelOrderMethod': 'privatePostOrderCancel',
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
        //
        //     {
        //       "success" : 1,
        //       "return" : {
        //         "funds" : {
        //           "BTC" : {
        //             "total" : 0,
        //             "available" : 0
        //           },
        //           "USD" : {
        //             "total" : 0,
        //             "available" : 0
        //           },
        //           "USDT" : {
        //             "total" : 0,
        //             "available" : 0
        //           }
        //         },
        //         "rights" : {
        //           "info" : 1,
        //           "trade" : 1
        //         },
        //         "transactionCount" : 0,
        //         "openOrders" : 0,
        //         "serverTime" : 1537451465
        //       }
        //     }
        //
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
        if (average !== undefined)
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

    getVersionString () {
        return '';
    }

    getPrivatePath (path, params) {
        return '/' + this.version + '/' + this.implodeParams (path, params);
    }

    getOrderIdKey () {
        return 'orderId';
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
};
