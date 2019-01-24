'use strict';

// ---------------------------------------------------------------------------

const liqui = require ('./liqui.js');
const { ArgumentsRequired } = require ('./base/errors');

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
                'fetchClosedOrders': false,
                'fetchOrderBooks': false,
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
                        'order/cancel',
                        'order/cancel/all',
                        'order/status',
                        'order/new',
                        'volume',
                        'fees', // trading fee schedule
                    ],
                },
                // deposit / withdraw (private)
                'dwapi': {
                    'post': [
                        'deposit/cryptoaddress',
                        'withdraw/crypto',
                        'withdraw/fiat',
                        'withdraw/submit',
                        'withdraw/cancel',
                        'transaction/status', // see 'history/transactions' in private tapi above
                    ],
                },
            },
            'options': {
                'fetchOrderMethod': 'privatePostOrderStatus',
                'fetchMyTradesMethod': 'privatePostHistoryTrades',
                'cancelOrderMethod': 'privatePostOrderCancel',
                'fetchTickersMaxLength': 250,
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetInfo ();
        let markets = response['pairs'];
        let keys = Object.keys (markets);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let market = markets[id];
            let baseId = this.safeString (market, 'base_currency');
            let quoteId = this.safeString (market, 'quoted_currency');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': this.safeInteger (market, 'decimal_places'),
                'price': this.safeInteger (market, 'decimal_places'),
            };
            let amountLimits = {
                'min': this.safeFloat (market, 'min_amount'),
                'max': this.safeFloat (market, 'max_amount'),
            };
            let priceLimits = {
                'min': this.safeFloat (market, 'min_price'),
                'max': this.safeFloat (market, 'max_price'),
            };
            let costLimits = {
                'min': this.safeFloat (market, 'min_total'),
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            let hidden = this.safeInteger (market, 'hidden');
            let active = (hidden === 0);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': market['fee'] / 100,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
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
        let ids = Object.keys (funds);
        for (let c = 0; c < ids.length; c++) {
            let id = ids[c];
            let code = this.commonCurrencyCode (id);
            let account = {
                'free': funds[id]['available'],
                'used': 0.0,
                'total': funds[id]['total'],
            };
            account['used'] = account['total'] - account['free'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseTicker (ticker, market = undefined) {
        //
        //   {    high:  0.03492,
        //         low:  0.03245,
        //         avg:  29.46133,
        //         vol:  500.8661,
        //     vol_cur:  17.000797104,
        //        last:  0.03364,
        //         buy:  0.03362,
        //        sell:  0.03381,
        //     updated:  1537521993,
        //        pair: "ethbtc"       }
        //
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        // dsx has 'pair' in the ticker, liqui does not have it
        let marketId = this.safeString (ticker, 'pair');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        // dsx average is inverted, liqui average is not
        let average = this.safeFloat (ticker, 'avg');
        if (average !== undefined) {
            if (average > 0) {
                average = 1 / average;
            }
        }
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
            'baseVolume': this.safeFloat (ticker, 'vol'), // dsx shows baseVolume in 'vol', liqui shows baseVolume in 'vol_cur'
            'quoteVolume': this.safeFloat (ticker, 'vol_cur'), // dsx shows baseVolume in 'vol_cur', liqui shows baseVolume in 'vol'
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

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (type === 'market' && price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument even for market orders, that is the worst price that you agree to fill your order for');
        }
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
        //
        //     {
        //       "success": 1,
        //       "return": {
        //         "received": 0,
        //         "remains": 10,
        //         "funds": {
        //           "BTC": {
        //             "total": 100,
        //             "available": 95
        //           },
        //           "USD": {
        //             "total": 10000,
        //             "available": 9995
        //           },
        //           "EUR": {
        //             "total": 1000,
        //             "available": 995
        //           },
        //           "LTC": {
        //             "total": 1000,
        //             "available": 995
        //           }
        //         },
        //         "orderId": 0, // https://github.com/ccxt/ccxt/issues/3677
        //       }
        //     }
        //
        let status = 'open';
        let filled = 0.0;
        let remaining = amount;
        let responseReturn = this.safeValue (response, 'return');
        let id = this.safeString2 (responseReturn, 'orderId', 'order_id');
        if (id === '0') {
            id = this.safeString (responseReturn, 'initOrderId', 'init_order_id');
            status = 'closed';
        }
        filled = this.safeFloat (responseReturn, 'received', 0.0);
        remaining = this.safeFloat (responseReturn, 'remains', amount);
        let timestamp = this.milliseconds ();
        return {
            'info': response,
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
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open', // Active
            '1': 'closed', // Filled
            '2': 'canceled', // Killed
            '3': 'canceling', // Killing
            '7': 'canceled', // Rejected
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder
        //
        //   {
        //     "pair": "btcusd",
        //     "type": "buy",
        //     "remainingVolume": 10,
        //     "volume": 10,
        //     "rate": 1000.0,
        //     "timestampCreated": 1496670,
        //     "status": 0,
        //     "orderType": "limit",
        //     "deals": [
        //       {
        //         "pair": "btcusd",
        //         "type": "buy",
        //         "amount": 1,
        //         "rate": 1000.0,
        //         "orderId": 1,
        //         "timestamp": 1496672724,
        //         "commission": 0.001,
        //         "commissionCurrency": "btc"
        //       }
        //     ]
        //   }
        //
        let id = this.safeString (order, 'id');
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let timestamp = this.safeInteger (order, 'timestampCreated');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        let marketId = this.safeString (order, 'pair');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let remaining = this.safeFloat (order, 'remainingVolume');
        let amount = this.safeFloat (order, 'volume');
        let price = this.safeFloat (order, 'rate');
        let filled = undefined;
        let cost = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
                cost = price * filled;
            }
        }
        let orderType = this.safeString (order, 'orderType');
        let side = this.safeString (order, 'type');
        let fee = undefined;
        let deals = this.safeValue (order, 'deals', []);
        let numDeals = deals.length;
        let trades = undefined;
        let lastTradeTimestamp = undefined;
        if (numDeals > 0) {
            trades = this.parseTrades (deals);
            let feeCost = undefined;
            let feeCurrency = undefined;
            for (let i = 0; i < trades.length; i++) {
                let trade = trades[i];
                if (feeCost === undefined) {
                    feeCost = 0;
                }
                feeCost += trade['fee']['cost'];
                feeCurrency = trade['fee']['currency'];
                lastTradeTimestamp = trade['timestamp'];
            }
            if (feeCost !== undefined) {
                fee = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
        return {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        //
        //     {
        //       "success": 1,
        //       "return": {
        //         "pair": "btcusd",
        //         "type": "buy",
        //         "remainingVolume": 10,
        //         "volume": 10,
        //         "rate": 1000.0,
        //         "timestampCreated": 1496670,
        //         "status": 0,
        //         "orderType": "limit",
        //         "deals": [
        //           {
        //             "pair": "btcusd",
        //             "type": "buy",
        //             "amount": 1,
        //             "rate": 1000.0,
        //             "orderId": 1,
        //             "timestamp": 1496672724,
        //             "commission": 0.001,
        //             "commissionCurrency": "btc"
        //           }
        //         ]
        //       }
        //     }
        //
        return this.parseOrder (this.extend ({
            'id': id,
        }, response['return']));
    }

    parseOrdersById (orders, symbol = undefined, since = undefined, limit = undefined) {
        let ids = Object.keys (orders);
        let result = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let order = this.parseOrder (this.extend ({
                'id': id.toString (),
            }, orders[id]));
            result.push (order);
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'count': 10, // Decimal, The maximum number of orders to return
            // 'fromId': 123, // Decimal, ID of the first order of the selection
            // 'endId': 321, // Decimal, ID of the last order of the selection
            // 'order': 'ASC', // String, Order in which orders shown. Possible values are "ASC" — from first to last, "DESC" — from last to first.
        };
        const response = await this.privatePostHistoryOrders (this.extend (request, params));
        //
        //     {
        //       "success": 1,
        //       "return": {
        //         "0": {
        //           "pair": "btcusd",
        //           "type": "buy",
        //           "remainingVolume": 10,
        //           "volume": 10,
        //           "rate": 1000.0,
        //           "timestampCreated": 1496670,
        //           "status": 0,
        //           "orderType": "limit"
        //         }
        //       }
        //     }
        //
        return this.parseOrdersById (this.safeValue (response, 'return', {}));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'count': 10, // Decimal, The maximum number of orders to return
            // 'fromId': 123, // Decimal, ID of the first order of the selection
            // 'endId': 321, // Decimal, ID of the last order of the selection
            // 'order': 'ASC', // String, Order in which orders shown. Possible values are "ASC" — from first to last, "DESC" — from last to first.
        };
        const response = await this.privatePostHistoryOrders (this.extend (request, params));
        //
        //     {
        //       "success": 1,
        //       "return": {
        //         "0": {
        //           "pair": "btcusd",
        //           "type": "buy",
        //           "remainingVolume": 10,
        //           "volume": 10,
        //           "rate": 1000.0,
        //           "timestampCreated": 1496670,
        //           "status": 0,
        //           "orderType": "limit"
        //         }
        //       }
        //     }
        //
        return this.parseOrdersById (this.safeValue (response, 'return', {}));
    }
};
