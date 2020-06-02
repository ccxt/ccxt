'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, BadRequest, ExchangeError, ArgumentsRequired, InvalidOrder, OrderNotFound, OnMaintenance } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': [ 'KR' ], // Korea
            // 'enableRateLimit': false,
            'rateLimit': 667,
            'version': 'v2',
            'has': {
                // 'loadMarkets': true,         // true
                // 'cancelAllOrders': false,
                // 'cancelOrder': true,         // true
                // 'cancelOrders': false,
                'CORS': false,
                // 'createDepositAddress': false,
                // 'createLimitOrder': true,    // true
                'createMarketOrder': false,
                // 'createOrder': true,         // true
                // 'deposit': false,
                // 'editOrder': 'emulated',
                // 'fetchBalance': true,        // true
                // 'fetchBidsAsks': false,
                // 'fetchClosedOrders': false,  // good to be true
                // 'fetchCurrencies': false,
                // 'fetchDepositAddress': false,
                // 'fetchDeposits': false,
                // 'fetchFundingFees': false,
                // 'fetchL2OrderBook': true,    // true
                // 'fetchLedger': false,
                // 'fetchMarkets': true,        // true
                // 'fetchMyTrades': false,      // good to be true
                // 'fetchOHLCV': 'emulated',
                // 'fetchOpenOrders': false,    // good to be true
                'fetchOrder': true,
                // 'fetchOrderBook': true,      // true
                // 'fetchOrderBooks': false,
                // 'fetchOrders': false,        // good to be true
                // 'fetchOrderTrades': false,
                // 'fetchStatus': 'emulated',
                // 'fetchTicker': true,         // true
                'fetchTickers': true,
                // 'fetchTime': false,
                // 'fetchTrades': true,         // true
                // 'fetchTradingFee': false,
                // 'fetchTradingFees': false,
                // 'fetchTradingLimits': false,
                // 'fetchTransactions': false,
                // 'fetchWithdrawals': false,
                // 'privateAPI': true,
                // 'publicAPI': true,
                // 'withdraw': false,
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
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'exceptions': {
                '405': OnMaintenance, // {"errorCode":"405","status":"maintenance","result":"error"}
                '104': OrderNotFound,
                '108': BadSymbol, // {"errorCode":"108","errorMsg":"Unknown CryptoCurrency","result":"error"}
                '107': BadRequest, // {"errorCode":"107","errorMsg":"Parameter error","result":"error"}
            },
        });
    }

    async fetchMarkets (params = {}) {
        const request = {
            'currency': 'all',
        };
        const response = await this.publicGetTicker (request);
        const result = [];
        const quoteId = 'krw';
        const quote = quoteId.toUpperCase ();
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const ticker = response[currencyIds[i]];
            let id = this.safeString (ticker, 'currency');
            if (id === undefined) {
                continue;
            }
            id = id.toLowerCase ();
            const base = id.toUpperCase ();
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': id,
                'quoteId': quoteId,
                'active': true,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccountBalance (params);
        const result = { 'info': response };
        const balances = this.omit (response, [
            'errorCode',
            'result',
            'normalWallets',
        ]);
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = balances[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'avail');
            account['total'] = this.safeFloat (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'format': 'json',
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bid', 'ask', 'price', 'qty');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': 'all',
            'format': 'json',
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
                const ticker = response[id];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'format': 'json',
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last');
        const previousClose = this.safeFloat (ticker, 'yesterday_last');
        let change = undefined;
        if (last !== undefined && previousClose !== undefined) {
            change = previousClose - last;
        }
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
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
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        const is_ask = this.safeString (trade, 'is_ask');
        let side = undefined;
        if (is_ask === '1') {
            side = 'sell';
        } else if (is_ask === '0') {
            side = 'buy';
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'qty');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'period': 'hour',
            'format': 'json',
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response['completeOrders'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const request = {
            'price': price,
            'currency': this.marketId (symbol),
            'qty': amount,
        };
        const method = 'privatePostOrder' + this.capitalize (type) + this.capitalize (side);
        const response = await this[method] (this.extend (request, params));
        let id = this.safeString (response, 'orderId');
        if (id !== undefined) {
            id = id.toUpperCase ();
        }
        const timestamp = this.milliseconds ();
        const cost = price * amount;
        const order = {
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
            'clientOrderId': undefined,
            'trades': undefined,
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
            const request = {
                'order_id': id,
                'currency': market['id'],
            };
            const response = await this.privatePostOrderOrderInfo (this.extend (request, params));
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
        const statuses = {
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "index": "0",
        //         "orderId": "68665943-1eb5-4e4b-9d76-845fc54f5489",
        //         "timestamp": "1449037367",
        //         "price": "444000.0",
        //         "qty": "0.3456",
        //         "type": "ask",
        //         "feeRate": "-0.0015"
        //     }
        //
        const info = this.safeValue (order, 'info');
        const id = this.safeStringUpper (info, 'orderId');
        const timestamp = this.safeTimestamp (info, 'timestamp');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let cost = undefined;
        let side = this.safeString (info, 'type');
        if (side.indexOf ('ask') >= 0) {
            side = 'sell';
        } else {
            side = 'buy';
        }
        const price = this.safeFloat (info, 'price');
        const amount = this.safeFloat (info, 'qty');
        const remaining = this.safeFloat (info, 'remainQty');
        let filled = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
            }
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const currency = this.safeString (info, 'currency');
        const fee = {
            'currency': currency,
            'cost': this.safeFloat (info, 'fee'),
            'rate': this.safeFloat (info, 'feeRate'),
        };
        let symbol = undefined;
        if (market === undefined) {
            const marketId = currency.toLowerCase ();
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
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
            'average': undefined,
            'trades': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const order = this.safeValue (this.orders, id);
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
        const request = {
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
        const request = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/';
        if (api === 'public') {
            url += request;
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += this.version + '/' + request;
            const nonce = this.nonce ().toString ();
            const json = this.json (this.extend ({
                'access_token': this.apiKey,
                'nonce': nonce,
            }, params));
            const payload = this.stringToBase64 (this.encode (json));
            body = this.decode (payload);
            const secret = this.secret.toUpperCase ();
            const signature = this.hmac (payload, this.encode (secret), 'sha512');
            headers = {
                'content-type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if ('result' in response) {
            const result = response['result'];
            if (result !== 'success') {
                //
                //    {  "errorCode": "405",  "status": "maintenance",  "result": "error"}
                //
                const errorCode = this.safeString (response, 'errorCode');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
                throw new ExchangeError (feedback);
            }
        } else {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }
};
