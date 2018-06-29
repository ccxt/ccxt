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
            'countries': [ 'NL' ], // Netherlands
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
                'fetchMyTrades': true,
                'fetchTickers': false,
            },
            'timeframes': {},
            'urls': {
                // 'test': 'https://test.deribit.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg',
                'api': 'https://www.deribit.com',
                'www': 'https://www.deribit.com',
                'doc': [
                    'https://www.deribit.com/pages/docs/api',
                    'https://github.com/deribit',
                ],
                'fees': 'https://www.deribit.com/pages/information/fees',
                'referral': 'https://www.deribit.com/reg-1189.4038',
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

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'created');
        let iso8601 = (typeof timestamp === 'undefined') ? undefined : this.iso8601 (timestamp);
        let symbol = this.findSymbol (this.safeString (ticker, 'instrumentName'), market);
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': iso8601,
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetsummary (this.extend ({
            'instrument': market['id'],
        }, params));
        return this.parseTicker (response['result'], market);
    }

    parseTrade (trade, market = undefined) {
        let id = this.safeString (trade, 'tradeId');
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = this.safeInteger (trade, 'timeStamp');
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
        let timestamp = parseInt (response['usOut'] / 1000);
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

    parseOrder (order, market = undefined) {
        // .
        //     {
        //         "success": true,  // true or false
        //         "message": "",    // empty or text message, e.g. error message
        //         "result": [       // list of open orders
        //         {
        //                 "orderId": 5258039,          // ID of the order
        //                 "instrument": "BTC-26MAY17", // instrument name
        //                 "direction": "sell",         // order direction, "buy" or "sell"
        //                 "price": 1860,               // float, USD for futures, BTC for options
        //                 "label": "",                 // label set by the owner, up to 32 chars
        //                 "quantity": 10,              // quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //                 "filledQuantity": 3,         // filled quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //                 "avgPrice": 1860,            // average fill price of the order
        //                 "commission": -0.000001613,  // in BTC units
        //                 "created": 1494491899308,    // creation timestamp
        //                 "state": "open",             // open, cancelled, etc
        //                 "postOnly": false            // true for post-only orders only
        // open orders --------------------------------------------------------
        //                 "lastUpdate": 1494491988754, // timestamp of the last order state change (before this cancelorder of course)
        // closed orders ------------------------------------------------------
        //                 "tstamp": 1494492913288,    // timestamp of the last order state change
        //                 "modified": 1494492913289,  // timestamp of the last db write operation, e.g. trade that doesn't change order status
        //                 "adv": false                // advanced type (false, or "usd" or "implv")
        //             }
        //         ]
        //     }
        //
        let timestamp = this.safeInteger (order, 'created');
        let lastUpdate = this.safeInteger (order, 'lastUpdate');
        lastUpdate = this.safeInteger (order, 'tstamp', lastUpdate);
        let modified = this.safeInteger (order, 'modified');
        let lastTradeTimestamp = Math.max (lastUpdate, modified);
        let id = this.safeString (order, 'orderId');
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
        let side = this.safeString (order, 'direction');
        if (typeof side !== 'undefined') {
            side = side.toLowerCase ();
        }
        let feeCost = this.safeFloat (order, 'commission');
        if (typeof feeCost !== 'undefined') {
            feeCost = Math.abs (feeCost);
        }
        let fee = {
            'cost': feeCost,
            'currency': 'BTC',
        };
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': order['instrument'],
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let response = await this.privateGetOrderstate ({ 'orderId': id });
        return this.parseOrder (response['result']);
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
        let method = 'privatePost' + this.capitalize (side);
        let response = await this[method] (this.extend (request, params));
        return this.parseOrder (response['result']);
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
        return this.parseOrder (response['result']);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostCancel (this.extend ({ 'orderId': id }, params));
        return this.parseOrder (response['result']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        let response = await this.privateGetGetopenorders (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        let response = await this.privateGetOrderhistory (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        if (typeof limit !== 'undefined') {
            request['count'] = limit; // default = 20
        }
        let response = await this.privateGetTradehistory (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
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
