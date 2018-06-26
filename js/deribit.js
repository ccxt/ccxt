'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class deribit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deribit',
            'name': 'Deribit',
            'countries': 'NL', // Netherlands
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'CORS': true,
                'editOrder': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchTicker': false,
                'fetchTickers': false,
            },
            'timeframes': {},
            'urls': {
                // 'test': 'https://test.deribit.com',
                'logo': 'https://user-images.githubusercontent.com/629338/35326678-d005069c-0110-11e8-8a4c-8c8e201da2a2.png',
                'api': 'https://www.deribit.com',
                'www': 'https://www.deribit.com',
                'doc': [
                    'https://www.deribit.com/pages/docs/api',
                    'https://github.com/deribit',
                ],
                'fees': 'https://www.deribit.com/pages/information/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'test',
                        'getinstruments',
                        'index',
                        'getcurrencies',
                        'getorderbook',
                        'getlasttrades',
                        'getsummary',
                        'stats',
                        'getannouncments',
                    ],
                },
                'private': {
                    'get': [
                        'account',
                        'getopenorders',
                        'positions',
                        'orderhistory',
                        'orderstate',
                        'tradehistory',
                        'newannouncements',
                    ],
                    'post': [
                        'buy',
                        'sell',
                        'edit',
                        'cancel',
                        'cancelall',
                    ],
                },
            },
            'exceptions': {
                'Invalid API Key.': AuthenticationError,
                'Access Denied': PermissionDenied,
            },
            'options': {
                'fetchTickerQuotes': true,
            },
        });
    }

    async fetchMarkets () {
        let marketsResponse = await this.publicGetGetinstruments ();
        let markets = marketsResponse['result'];
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['instrumentName'];
            let base = market['baseCurrency'];
            let quote = market['currency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            result.push ({
                'id': id,
                'symbol': id,
                'base': base,
                'quote': quote,
                'active': market['isActive'],
                'precision': {
                    'amount': market['minTradeSize'],
                    'price': market['tickSize'],
                },
                'limits': {
                    'amount': {
                        'min': market['minTradeSize'],
                    },
                    'price': {
                        'min': market['tickSize'],
                    },
                },
                'type': market['kind'],
                'spot': false,
                'future': market['kind'] === 'future',
                'option': market['kind'] === 'option',
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        let account = await this.privateGetAccount ();
        let result = {
            'BTC': {
                'free': account['result']['availableFunds'],
                'used': account['result']['maintenanceMargin'],
                'total': account['result']['equity'],
            },
        };
        return this.parseBalance (result);
    }

    async fetchDepositAddress (currency, params = {}) {
        let account = await this.privateGetAccount ();
        return {
            'currency': 'BTC',
            'address': account['depositAddress'],
            'status': 'ok',
            'info': account,
        };
    }

    parseTrade (trade, market = undefined) {
        let id = this.safeString (trade, 'tradeId');
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = this.safeInteger (trade, 'timestamp');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': trade['direction'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'quantity'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        } else {
            request['limit'] = 10000;
        }
        let response = await this.publicGetGetlasttrades (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetorderbook ({ 'instrument': market['id'] });
        let timestamp = response['usOut'] / 1000000;
        let orderbook = this.parseOrderBook (response['result'], timestamp, 'bids', 'asks', 'price', 'quantity');
        return this.extend (orderbook, {
            'nonce': this.safeInteger (response, 'tstamp'),
        });
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
        };
        if (status in statuses) {
            return statuses['status'];
        }
        return status;
    }

    parseOrder (order) {

        // {
        //     "success": true,  // true or false
        //     "message": "",    // empty or text message, e.g. error message
        //     "result": [       // list of open orders
        //     {
        //             "orderId": 5258039,          // ID of the order
        //             "instrument": "BTC-26MAY17", // instrument name
        //             "direction": "sell",         // order direction, "buy" or "sell"
        //             "price": 1860,               // float, USD for futures, BTC for options
        //             "label": "",                 // label set by the owner, up to 32 chars
        //             "quantity": 10,              // quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //             "filledQuantity": 3,         // filled quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //             "avgPrice": 1860,            // average fill price of the order
        //             "commission": -0.000001613,  // in BTC units
        //             "created": 1494491899308,    // creation timestamp
        //             "lastUpdate": 1494491988754, // timestamp of the last order state change
        //                                          // (before this cancelorder of course)
        //             "state": "open",             // open, cancelled, etc
        //             "postOnly": false            // true for post-only orders only
        //         }
        //     ]
        // }

        // {
        //     "success": true,
        //     "result": [ // list of orders from history, filled quantity > 0
        //         {
        //             "orderId": 5258039,         // ID of the order
        //             "instrument": "BTC-26MAY17", // name of the instrument
        //             "direction": "sell",         // direction of the order, "buy" or "sell"
        //             "price": 1860,              // float, USD for futures, BTC for options
        //             "label" : "",               // order label, if present,
        //             "quantity": 10,             // quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //             "filledQuantity": 3,        // filled quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //             "avgPrice": 1860,           // average fill price of the order
        //             "commission": -0.000001613, // in ฿
        //             "created": 1494491899308,   // creation timestamp
        //             "tstamp": 1494492913288,    // timestamp of the last order state change
        //             "modified": 1494492913289,  // timestamp of the last db write operation,
        //                                         // e.g. trade that doesn't change order status
        //             "state": "cancelled",       // state of the order "open", "cancelled", "filled"
        //             "postOnly": false,          // true for post-only orders only
        //             "adv": false                // advanced type (false, or "usd" or "implv")
        //        } ....
        //     ]
        // }

        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'filledQuantity');
        let remaining = undefined;
        price = this.safeFloat (order, 'avgPrice', price);
        let cost = undefined;
        if (typeof filled !== 'undefined') {
            if (typeof amount !== 'undefined') {
                remaining = amount - filled;
            }
            if (typeof price !== 'undefined') {
                cost = price * filled;
            }
        }
        let status = this.safeString (order, 'state');
        status = this.parseOrderStatus (status);
        return {
            'info': order,
            'id': order['orderId'].toString (),
            'timestamp': order['created'],
            'datetime': this.iso8601 (order['created']),
            'lastTradeTimestamp': undefined,
            'symbol': order['instrument'],
            'type': undefined,
            'side': order['direction'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': {
                'cost': this.safeFloat (order, 'commission'),
                'currency': 'BTC',
            },
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let response = await this.privateGetOrderstate ({ 'orderId': id });
        return this.parseOrder (response['result']);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let response = await this.privateGetTradeHistory ({ 'instrument': symbol });
        return this.parseTrades (response['result']);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'instrument': this.marketId (symbol),
            'quantity': amount,
            'type': type,
        };
        if (typeof price !== 'undefined')
            request['price'] = price;
        let handler = (side === 'buy') ? this.privatePostBuy : this.privatePostSell;
        let response = await handler (this.extend (request, params));
        let order = this.parseOrder (response['result']);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response['result'] }, order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderId': id,
        };
        if (typeof amount !== 'undefined')
            request['quantity'] = amount;
        if (typeof price !== 'undefined')
            request['price'] = price;
        let response = await this.privatePostEdit (this.extend (request, params));
        let order = this.parseOrder (response['result']);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response['result'] }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostCancel (this.extend ({ 'orderId': id }, params));
        let order = this.parseOrder (response['result']);
        return this.extend ({ 'info': response['result'] }, order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        params['instrument'] = this.marketId (symbol);
        let response = await this.privateGetGetopenorders (params);
        return this.parseOrders (response['result']);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        params['instrument'] = this.marketId (symbol);
        let response = await this.privateGetOrderhistory (params);
        return this.parseOrders (response['result']);
    }

    async fetchMyTradesOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        params['instrument'] = this.marketId (symbol);
        let response = await this.privateGetGetopenorders (params);
        return this.parseTrades (response['result']);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/' + 'api/' + this.version + '/' + api + '/' + path;
        let url = this.urls['api'] + query;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let auth = '_=' + nonce + '&_ackey=' + this.apiKey + '&_acsec=' + this.secret + '&_action=' + query;
            if (method === 'POST') {
                params = this.keysort (params);
                auth += '&' + this.urlencode (params);
            }
            let hash = this.hash (this.encode (auth), 'sha256', 'base64');
            let signature = this.apiKey + '.' + nonce + '.' + hash;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-deribit-sig': signature,
            };
            body = this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
