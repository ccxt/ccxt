'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, InvalidOrder, OrderNotFound, DDoSProtection, NotSupported, ExchangeNotAvailable, InsufficientFunds } = require ('./base/errors');

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
                'test': 'https://test.deribit.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg',
                'api': 'https://www.deribit.com',
                'www': 'https://www.deribit.com',
                'doc': [
                    'https://docs.deribit.com/',
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
                // 0 or absent Success, No error
                '9999': PermissionDenied,   // "api_not_enabled" User didn't enable API for the Account
                '10000': AuthenticationError,  // "authorization_required" Authorization issue, invalid or absent signature etc
                '10001': ExchangeError,     // "error" Some general failure, no public information available
                '10002': InvalidOrder,      // "qty_too_low" Order quantity is too low
                '10003': InvalidOrder,      // "order_overlap" Rejection, order overlap is found and self-trading is not enabled
                '10004': OrderNotFound,     // "order_not_found" Attempt to operate with order that can't be found by specified id
                '10005': InvalidOrder,      // "price_too_low <Limit>" Price is too low, <Limit> defines current limit for the operation
                '10006': InvalidOrder,      // "price_too_low4idx <Limit>" Price is too low for current index, <Limit> defines current bottom limit for the operation
                '10007': InvalidOrder, // "price_too_high <Limit>" Price is too high, <Limit> defines current up limit for the operation
                '10008': InvalidOrder, // "price_too_high4idx <Limit>" Price is too high for current index, <Limit> defines current up limit for the operation
                '10009': InsufficientFunds, // "not_enough_funds" Account has not enough funds for the operation
                '10010': OrderNotFound, // "already_closed" Attempt of doing something with closed order
                '10011': InvalidOrder, // "price_not_allowed" This price is not allowed for some reason
                '10012': InvalidOrder, // "book_closed" Operation for instrument which order book had been closed
                '10013': PermissionDenied, // "pme_max_total_open_orders <Limit>" Total limit of open orders has been exceeded, it is applicable for PME users
                '10014': PermissionDenied, // "pme_max_future_open_orders <Limit>" Limit of count of futures' open orders has been exceeded, it is applicable for PME users
                '10015': PermissionDenied, // "pme_max_option_open_orders <Limit>" Limit of count of options' open orders has been exceeded, it is applicable for PME users
                '10016': PermissionDenied, // "pme_max_future_open_orders_size <Limit>" Limit of size for futures has been exceeded, it is applicable for PME users
                '10017': PermissionDenied, // "pme_max_option_open_orders_size <Limit>" Limit of size for options has been exceeded, it is applicable for PME users
                '10019': PermissionDenied, // "locked_by_admin" Trading is temporary locked by admin
                '10020': ExchangeError, // "invalid_or_unsupported_instrument" Instrument name is not valid
                '10022': InvalidOrder, // "invalid_quantity" quantity was not recognized as a valid number
                '10023': InvalidOrder, // "invalid_price" price was not recognized as a valid number
                '10024': InvalidOrder, // "invalid_max_show" max_show parameter was not recognized as a valid number
                '10025': InvalidOrder, // "invalid_order_id" Order id is missing or its format was not recognized as valid
                '10026': InvalidOrder, // "price_precision_exceeded" Extra precision of the price is not supported
                '10027': InvalidOrder, // "non_integer_contract_amount" Futures contract amount was not recognized as integer
                '10028': DDoSProtection, // "too_many_requests" Allowed request rate has been exceeded
                '10029': OrderNotFound, // "not_owner_of_order" Attempt to operate with not own order
                '10030': ExchangeError, // "must_be_websocket_request" REST request where Websocket is expected
                '10031': ExchangeError, // "invalid_args_for_instrument" Some of arguments are not recognized as valid
                '10032': InvalidOrder, // "whole_cost_too_low" Total cost is too low
                '10033': NotSupported, // "not_implemented" Method is not implemented yet
                '10034': InvalidOrder, // "stop_price_too_high" Stop price is too high
                '10035': InvalidOrder, // "stop_price_too_low" Stop price is too low
                '11035': InvalidOrder, // "no_more_stops <Limit>" Allowed amount of stop orders has been exceeded
                '11036': InvalidOrder, // "invalid_stoppx_for_index_or_last" Invalid StopPx (too high or too low) as to current index or market
                '11037': InvalidOrder, // "outdated_instrument_for_IV_order" Instrument already not available for trading
                '11038': InvalidOrder, // "no_adv_for_futures" Advanced orders are not available for futures
                '11039': InvalidOrder, // "no_adv_postonly" Advanced post-only orders are not supported yet
                '11040': InvalidOrder, // "impv_not_in_range 0..499%" Implied volatility is out of allowed range
                '11041': InvalidOrder, // "not_adv_order" Advanced order properties can't be set if the order is not advanced
                '11042': PermissionDenied, // "permission_denied" Permission for the operation has been denied
                '11044': OrderNotFound, // "not_open_order" Attempt to do open order operations with the not open order
                '11045': ExchangeError, // "invalid_event" Event name has not been recognized
                '11046': ExchangeError, // "outdated_instrument" At several minutes to instrument expiration, corresponding advanced implied volatility orders are not allowed
                '11047': ExchangeError, // "unsupported_arg_combination" The specified combination of arguments is not supported
                '11048': ExchangeError, // "not_on_this_server" The requested operation is not available on this server.
                '11050': ExchangeError, // "invalid_request" Request has not been parsed properly
                '11051': ExchangeNotAvailable, // "system_maintenance" System is under maintenance
                '11030': ExchangeError, // "other_reject <Reason>" Some rejects which are not considered as very often, more info may be specified in <Reason>
                '11031': ExchangeError, // "other_error <Error>" Some errors which are not considered as very often, more info may be specified in <Error>
            },
            'options': {
                'fetchTickerQuotes': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
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
            'tag': undefined,
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
        return this.parseOrder (response['result']['order']);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostCancel (this.extend ({ 'orderId': id }, params));
        return this.parseOrder (response['result']['order']);
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
                'x-deribit-sig': signature,
            };
            if (method !== 'GET') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (!response) {
            return; // fallback to default error handler
        }
        //
        //     {"usOut":1535877098645376,"usIn":1535877098643364,"usDiff":2012,"testnet":false,"success":false,"message":"order_not_found","error":10004}
        //
        const error = this.safeString (response, 'error');
        if ((error !== undefined) && (error !== '0')) {
            const feedback = this.id + ' ' + body;
            const exceptions = this.exceptions;
            if (error in exceptions) {
                throw new exceptions[error] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
