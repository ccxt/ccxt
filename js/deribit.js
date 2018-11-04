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
        let iso8601 = (timestamp === undefined) ? undefined : this.iso8601 (timestamp);
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
        if (market !== undefined)
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
        if (limit !== undefined) {
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
            return statuses[status];
        }
        return status;
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "orderId": 5258039,          // ID of the order
        //         "type": "limit",             // not documented, but present in the actual response
        //         "instrument": "BTC-26MAY17", // instrument name (market id)
        //         "direction": "sell",         // order direction, "buy" or "sell"
        //         "price": 1860,               // float, USD for futures, BTC for options
        //         "label": "",                 // label set by the owner, up to 32 chars
        //         "quantity": 10,              // quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //         "filledQuantity": 3,         // filled quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //         "avgPrice": 1860,            // average fill price of the order
        //         "commission": -0.000001613,  // in BTC units
        //         "created": 1494491899308,    // creation timestamp
        //         "state": "open",             // open, cancelled, etc
        //         "postOnly": false            // true for post-only orders only
        // open orders --------------------------------------------------------
        //         "lastUpdate": 1494491988754, // timestamp of the last order state change (before this cancelorder of course)
        // closed orders ------------------------------------------------------
        //         "tstamp": 1494492913288,     // timestamp of the last order state change, documented, but may be missing in the actual response
        //         "modified": 1494492913289,   // timestamp of the last db write operation, e.g. trade that doesn't change order status, documented, but may missing in the actual response
        //         "adv": false                 // advanced type (false, or "usd" or "implv")
        //         "trades": [],                // not documented, injected from the outside of the parseOrder method into the order
        //     }
        //
        let timestamp = this.safeInteger (order, 'created');
        let lastUpdate = this.safeInteger (order, 'lastUpdate');
        let lastTradeTimestamp = this.safeInteger2 (order, 'tstamp', 'modified');
        let id = this.safeString (order, 'orderId');
        let price = this.safeFloat (order, 'price');
        let average = this.safeFloat (order, 'avgPrice');
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'filledQuantity');
        if (lastTradeTimestamp === undefined) {
            if (filled !== undefined) {
                if (filled > 0) {
                    lastTradeTimestamp = lastUpdate;
                }
            }
        }
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
            }
            if (price !== undefined) {
                cost = price * filled;
            }
        }
        let status = this.parseOrderStatus (this.safeString (order, 'state'));
        let side = this.safeString (order, 'direction');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        let feeCost = this.safeFloat (order, 'commission');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        let fee = {
            'cost': feeCost,
            'currency': 'BTC',
        };
        let type = this.safeString (order, 'type');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': order['instrument'],
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined, // todo: parse trades
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
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
        if (price !== undefined)
            request['price'] = price;
        let method = 'privatePost' + this.capitalize (side);
        let response = await this[method] (this.extend (request, params));
        let order = this.safeValue (response['result'], 'order');
        if (order === undefined) {
            return response;
        }
        return this.parseOrder (order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderId': id,
        };
        if (amount !== undefined)
            request['quantity'] = amount;
        if (price !== undefined)
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
        if (limit !== undefined) {
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
            let signature = this.apiKey + '.' + nonce + '.' + this.decode (hash);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-deribit-sig': signature,
            };
            body = this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
