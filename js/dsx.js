'use strict';

// ---------------------------------------------------------------------------

const liqui = require ('./liqui.js');
const { ArgumentsRequired, InvalidOrder } = require ('./base/errors');

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
                'createDepositAddress': true,
                'fetchDepositAddress': true,
                'fetchTransactions': true,
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
                    'https://dsx.uk/developers/publicApiV2',
                    'https://api.dsx.uk',
                    'https://dsx.uk/api_docs/public',
                    'https://dsx.uk/api_docs/private',
                    '',
                ],
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.15 / 100,
                    'taker': 0.25 / 100,
                },
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
            'exceptions': {
                'exact': {
                    "Order wasn't cancelled": InvalidOrder, // non-existent order
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

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostHistoryTransactions (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": [
        //             {
        //                 "id": 1,
        //                 "timestamp": 11,
        //                 "type": "Withdraw",
        //                 "amount": 1,
        //                 "currency": "btc",
        //                 "confirmationsCount": 6,
        //                 "address": "address",
        //                 "status": 2,
        //                 "commission": 0.0001
        //             }
        //         ]
        //     }
        //
        const transactions = this.safeValue (response, 'return', []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '1': 'failed',
            '2': 'ok',
            '3': 'pending',
            '4': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": 1,
        //         "timestamp": 11, // 11 in their docs (
        //         "type": "Withdraw",
        //         "amount": 1,
        //         "currency": "btc",
        //         "confirmationsCount": 6,
        //         "address": "address",
        //         "status": 2,
        //         "commission": 0.0001
        //     }
        //
        let timestamp = this.safeInteger (transaction, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        let type = this.safeString (transaction, 'type');
        if (type !== undefined) {
            if (type === 'Incoming') {
                type = 'deposit';
            } else if (type === 'Withdraw') {
                type = 'withdrawal';
            }
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'address'),
            'type': type,
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': status,
            'fee': {
                'currency': code,
                'cost': this.safeFloat (transaction, 'commission'),
                'rate': undefined,
            },
            'info': transaction,
        };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInfo (params);
        const markets = response['pairs'];
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quoted_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'decimal_places'),
                'price': this.safeInteger (market, 'decimal_places'),
            };
            const amountLimits = {
                'min': this.safeFloat (market, 'min_amount'),
                'max': this.safeFloat (market, 'max_amount'),
            };
            const priceLimits = {
                'min': this.safeFloat (market, 'min_price'),
                'max': this.safeFloat (market, 'max_price'),
            };
            const costLimits = {
                'min': this.safeFloat (market, 'min_total'),
            };
            const limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            const hidden = this.safeInteger (market, 'hidden');
            const active = (hidden === 0);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostInfoAccount ();
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
        const balances = this.safeValue (response, 'return');
        const result = { 'info': response };
        const funds = this.safeValue (balances, 'funds');
        const currencyIds = Object.keys (funds);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (funds, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['total'] = this.safeFloat (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createDepositAddress (code, params = {}) {
        const request = {
            'new': 1,
        };
        const response = await this.fetchDepositAddress (code, this.extend (request, params));
        return response;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.dwapiPostDepositCryptoaddress (this.extend (request, params));
        const result = this.safeValue (response, 'return', {});
        const address = this.safeString (result, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined, // not documented in DSX API
            'info': response,
        };
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
        const timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        // dsx has 'pair' in the ticker, liqui does not have it
        const marketId = this.safeString (ticker, 'pair');
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
        const last = this.safeFloat (ticker, 'last');
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
        const market = this.market (symbol);
        if (type === 'market' && price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument even for market orders, that is the worst price that you agree to fill your order for');
        }
        const request = {
            'pair': market['id'],
            'type': side,
            'volume': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
            'orderType': type,
        };
        price = parseFloat (price);
        amount = parseFloat (amount);
        const response = await this.privatePostOrderNew (this.extend (request, params));
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
        const responseReturn = this.safeValue (response, 'return');
        let id = this.safeString2 (responseReturn, 'orderId', 'order_id');
        if (id === '0') {
            id = this.safeString (responseReturn, 'initOrderId', 'init_order_id');
            status = 'closed';
        }
        filled = this.safeFloat (responseReturn, 'received', 0.0);
        remaining = this.safeFloat (responseReturn, 'remains', amount);
        const timestamp = this.milliseconds ();
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

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "amount" : 0.0128,
        //         "price" : 6483.99000,
        //         "timestamp" : 1540334614,
        //         "tid" : 35684364,
        //         "type" : "ask"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "number": "36635882", // <-- this is present if the trade has come from the '/order/status' call
        //         "id": "36635882", // <-- this may have been artifically added by the parseTrades method
        //         "pair": "btcusd",
        //         "type": "buy",
        //         "volume": 0.0595,
        //         "rate": 9750,
        //         "orderId": 77149299,
        //         "timestamp": 1519612317,
        //         "commission": 0.00020825,
        //         "commissionCurrency": "btc"
        //     }
        //
        let timestamp = this.safeInteger (trade, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        let side = this.safeString (trade, 'type');
        if (side === 'ask') {
            side = 'sell';
        } else if (side === 'bid') {
            side = 'buy';
        }
        const price = this.safeFloat2 (trade, 'rate', 'price');
        const id = this.safeString2 (trade, 'number', 'id');
        const orderId = this.safeString (trade, 'orderId');
        if ('pair' in trade) {
            const marketId = this.safeString (trade, 'pair');
            market = this.safeValue (this.markets_by_id, marketId, market);
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const amount = this.safeFloat2 (trade, 'amount', 'volume');
        const type = 'limit'; // all trades are still limit trades
        let takerOrMaker = undefined;
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'commission');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commissionCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const isYourOrder = this.safeValue (trade, 'is_your_order');
        if (isYourOrder !== undefined) {
            takerOrMaker = 'taker';
            if (isYourOrder) {
                takerOrMaker = 'maker';
            }
            if (fee === undefined) {
                fee = this.calculateFee (symbol, type, side, amount, price, takerOrMaker);
            }
        }
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder
        //
        //   {
        //     "number": 36635882,
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
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let timestamp = this.safeInteger (order, 'timestampCreated');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        const marketId = this.safeString (order, 'pair');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const remaining = this.safeFloat (order, 'remainingVolume');
        const amount = this.safeFloat (order, 'volume');
        const price = this.safeFloat (order, 'rate');
        let filled = undefined;
        let cost = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
                cost = price * filled;
            }
        }
        const orderType = this.safeString (order, 'orderType');
        const side = this.safeString (order, 'type');
        let fee = undefined;
        const deals = this.safeValue (order, 'deals', []);
        const numDeals = deals.length;
        let trades = undefined;
        let lastTradeTimestamp = undefined;
        if (numDeals > 0) {
            trades = this.parseTrades (deals);
            let feeCost = undefined;
            let feeCurrency = undefined;
            for (let i = 0; i < trades.length; i++) {
                const trade = trades[i];
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
        const ids = Object.keys (orders);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const order = this.parseOrder (this.extend ({
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
        const response = await this.privatePostOrders (this.extend (request, params));
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
        return this.parseOrdersById (this.safeValue (response, 'return', {}), symbol, since, limit);
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
        return this.parseOrdersById (this.safeValue (response, 'return', {}), symbol, since, limit);
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        let result = [];
        if (Array.isArray (trades)) {
            for (let i = 0; i < trades.length; i++) {
                result.push (this.parseTrade (trades[i], market));
            }
        } else {
            const ids = Object.keys (trades);
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                const trade = this.parseTrade (trades[id], market);
                result.push (this.extend (trade, { 'id': id }, params));
            }
        }
        result = this.sortBy (result, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private' || api === 'dwapi') {
            url += this.getPrivatePath (path, params);
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'method': path,
            }, query));
            const signature = this.signBodyWithSecret (body);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        } else if (api === 'public') {
            url += this.getVersionString () + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            url += '/' + this.implodeParams (path, params);
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
};
