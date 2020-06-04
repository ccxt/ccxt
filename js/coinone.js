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
                'CORS': false,
                'createMarketOrder': false,
                'fetchClosedOrders': true,  // good to be true, but an same order can have multiple occurrences in the list
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,    // good to be true, but not sure enough to meet CCXT's semantic requirement
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                // 'fetchOrders': false, // not implemented yet
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
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
            'precision': {
                'price': 4,
                'amount': 4,
                'cost': 8,
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
        const quote = this.safeCurrencyCode (quoteId);
        const baseIds = Object.keys (response);
        for (let i = 0; i < baseIds.length; i++) {
            const baseId = baseIds[i];
            const ticker = this.safeValue (response, baseId, {});
            const currency = this.safeValue (ticker, 'currency');
            if (currency === undefined) {
                continue;
            }
            const base = this.safeCurrencyCode (baseId);
            result.push ({
                'id': baseId,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': baseId,
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
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, timestamp, 'bid', 'ask', 'price', 'qty');
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
        const timestamp = this.safeTimestamp (response, 'timestamp');
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
                const ticker = response[id];
                result[symbol] = this.parseTicker (ticker, market);
                result[symbol]['timestamp'] = timestamp;
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
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const first = this.safeFloat (ticker, 'first');
        const last = this.safeFloat (ticker, 'last');
        let average = undefined;
        if (first !== undefined && last !== undefined) {
            average = this.sum (first, last) / 2;
        }
        const previousClose = this.safeFloat (ticker, 'yesterday_last');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined && previousClose !== undefined) {
            change = last - previousClose;
            if (previousClose !== 0) {
                percentage = change / previousClose * 100;
            }
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
            'open': first,
            'close': last,
            'last': last,
            'previousClose': previousClose,
            'change': change,
            'percentage': percentage,
            'average': average,
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
            'id': this.safeString (trade, 'id'),
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
        // [WARNING] This implementation is only for fetchOrder()
        const info = this.safeValue (order, 'info');
        const currency = this.safeString (info, 'currency');
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
        const id = this.safeStringUpper (info, 'orderId');
        const timestamp = this.safeTimestamp (info, 'timestamp');
        let feeCurrency = undefined;
        let side = this.safeString (info, 'type');
        if (side.indexOf ('ask') >= 0) {
            side = 'sell';
            feeCurrency = market['quote'];
        } else {
            side = 'buy';
            feeCurrency = market['base'];
        }
        const price = this.safeFloat (info, 'price');
        let amount = this.safeFloat (info, 'qty');
        let remaining = this.safeFloat (info, 'remainQty');
        let filled = undefined;
        let status = undefined;
        const orderStatus = this.safeString (order, 'status');
        if (orderStatus === 'live') {
            status = 'open';
            filled = 0;
            if (amount > remaining) {
                amount = remaining;
                remaining = 0;
            }
        } else if (orderStatus === 'partially_filled') {
            status = 'open';
            filled = amount - remaining;
        } else {    // 'filled'
            status = 'closed';
            filled = amount - remaining;
        }
        const cost = price * filled;
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': this.safeFloat (info, 'fee'),
                'rate': this.safeFloat (info, 'feeRate'),
            },
            'info': order,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // [WARNING] Because of the limited capabilities of Coinone V2 API, you should be noticed below
        // * The symbol parameter must be given. If not, an exception will occur.
        // * Always returns the list of the all open orders with the symbol: The since and limit parameters are totally ignored.
        // * The returned amount might not be same as the ordered amount. If an order is partially filled, the returned amount means the remaining amount.
        // * For the same reason, the returned amount and remaining are always same, and the returned filled and cost are always zero.
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' allows fetching closed orders with a specific symbol');
        }
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privatePostOrderLimitOrders (this.extend (request, params));
        const result = [];
        const limitOrders = this.safeValue (response, 'limitOrders');
        for (let i = 0; i < limitOrders.length; i++) {
            const order = limitOrders[i];
            const timestamp = this.safeTimestamp (order, 'timestamp');
            let side = this.safeString (order, 'type');
            let feeCurrency = undefined;
            if (side.indexOf ('ask') >= 0) {
                side = 'sell';
                feeCurrency = market['quote'];
            } else {
                side = 'buy';
                feeCurrency = market['base'];
            }
            const amount = this.safeFloat (order, 'qty');
            result.push ({
                'id': this.safeString (order, 'orderId'),
                'clientOrderId': undefined,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'lastTradeTimestamp': undefined,
                'status': 'open',
                'symbol': market['symbol'],
                'type': 'limit',
                'side': side,
                'price': this.safeFloat (order, 'price'),
                'amount': amount,
                'filled': 0,            // coinone set amount as same as remaining, different with ordered amount
                'remaining': amount,    // coinone set amount as same as remaining, different with ordered amount
                'cost': 0,              // coinone set amount as same as remaining, different with ordered amount
                'trades': undefined,    // coinone doesn't support fills
                'fee': {
                    'currency': feeCurrency,
                    'rate': this.safeFloat (order, 'feeRate'),
                    'cost': 0,          // coinone set amount as same as remaining, different with ordered amount
                },
                'info': order,
            });
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // [WARNING] Because of the limited capabilities of Coinone V2 API, you should be noticed below
        // * The symbol parameter must be given. If not, an exception will occur.
        // * The since and limit parameters are totally ignored.
        // * At maximum, 50 closed orders can be returned.
        // * An returned closed order might be in open status: Because the backing Coinone API returns my trades, a parially-filled but-not-closed order can be returned.
        // * For the same reason, a same order id can occur muliple times in the returned list.
        // * For the same reason, the returned amount and filled are always same, and the returned remaining is always zero.
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' allows fetching closed orders with a specific symbol');
        }
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privatePostOrderCompleteOrders (this.extend (request, params));
        const result = [];
        const completOrders = this.safeValue (response, 'completeOrders');
        for (let i = 0; i < completOrders.length; i++) {
            const order = completOrders[i];
            const timestamp = this.safeTimestamp (order, 'timestamp');
            let side = this.safeString (order, 'type');
            let feeCurrency = undefined;
            if (side.indexOf ('ask') >= 0) {
                side = 'sell';
                feeCurrency = market['quote'];
            } else {
                side = 'buy';
                feeCurrency = market['base'];
            }
            const price = this.safeFloat (order, 'price');
            const amount = this.safeFloat (order, 'qty');
            let cost = undefined;
            if (price !== undefined && amount !== undefined) {
                cost = price * amount;
            }
            result.push ({
                'id': this.safeString (order, 'orderId'),
                'clientOrderId': undefined,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'lastTradeTimestamp': undefined,
                'status': 'closed',     // might be 'canceled'
                'symbol': market['symbol'],
                'type': 'limit',
                'side': side,
                'price': price,
                'amount': amount,
                'filled': amount,    // coinone set amount as same as filled for completed order
                'remaining': 0,      // amount is always equal to filled
                'cost': cost,
                'trades': undefined,    // coinone doesn't support fills
                'fee': {
                    'currency': feeCurrency,
                    'rate': this.safeFloat (order, 'feeRate'),
                    'cost': this.safeFloat (order, 'fee'),
                },
                'info': order,
            });
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // [WARNING] Because of the limited capabilities of Coinone V2 API, you should be noticed below
        // * The symbol parameter must be given. If not, an exception will occur.
        // * The since and limit parameters are totally ignored.
        // * At maximum, 50 of my recent trades can be returned.
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' allows fetching my trades with a specific symbol');
        }
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privatePostOrderCompleteOrders (this.extend (request, params));
        const result = [];
        const completOrders = this.safeValue (response, 'completeOrders');
        for (let i = 0; i < completOrders.length; i++) {
            const order = completOrders[i];
            const timestamp = this.safeTimestamp (order, 'timestamp');
            let side = this.safeString (order, 'type');
            let feeCurrency = undefined;
            if (side.indexOf ('ask') >= 0) {
                side = 'sell';
                feeCurrency = market['quote'];
            } else {
                side = 'buy';
                feeCurrency = market['base'];
            }
            const price = this.safeFloat (order, 'price');
            const amount = this.safeFloat (order, 'qty');
            let cost = undefined;
            if (price !== undefined && amount !== undefined) {
                cost = price * amount;
            }
            result.push ({
                'id': undefined,    // coinone doesn't support trade id
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'symbol': market['symbol'],
                'order': this.safeString (order, 'orderId'),
                'type': 'limit',
                'side': side,
                'price': price,
                'amount': amount,
                'cost': cost,
                'fee': {
                    'currency': feeCurrency,
                    'rate': this.safeFloat (order, 'feeRate'),
                    'cost': this.safeFloat (order, 'fee'),
                },
                'info': order,
            });
        }
        return result;
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
