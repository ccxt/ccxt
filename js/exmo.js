'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, OrderNotFound, AuthenticationError, InsufficientFunds, InvalidOrder, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class exmo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'exmo',
            'name': 'EXMO',
            'countries': [ 'ES', 'RU' ], // Spain, Russia
            'rateLimit': 350, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchClosedOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': 'emulated',
                'fetchOrders': 'emulated',
                'fetchOrderTrades': true,
                'fetchOrderBooks': true,
                'fetchMyTrades': true,
                'fetchTickers': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg',
                'api': 'https://api.exmo.com',
                'www': 'https://exmo.me',
                'doc': [
                    'https://exmo.me/en/api_doc',
                    'https://github.com/exmo-dev/exmo_api_lib/tree/master/nodejs',
                ],
                'fees': 'https://exmo.com/en/docs/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'currency',
                        'order_book',
                        'pair_settings',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'user_info',
                        'order_create',
                        'order_cancel',
                        'user_open_orders',
                        'user_trades',
                        'user_cancelled_orders',
                        'order_trades',
                        'required_amount',
                        'deposit_address',
                        'withdraw_crypt',
                        'withdraw_get_txid',
                        'excode_create',
                        'excode_load',
                        'wallet_history',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.001,
                        'LTC': 0.01,
                        'DOGE': 1,
                        'DASH': 0.01,
                        'ETH': 0.01,
                        'WAVES': 0.001,
                        'ZEC': 0.001,
                        'USDT': 25,
                        'XMR': 0.05,
                        'XRP': 0.02,
                        'KICK': 350,
                        'ETC': 0.01,
                        'BCH': 0.001,
                    },
                    'deposit': {
                        'USDT': 15,
                        'KICK': 50,
                    },
                },
            },
            'exceptions': {
                '40005': AuthenticationError, // Authorization error, incorrect signature
                '40009': InvalidNonce, //
                '40015': ExchangeError, // API function do not exist
                '40016': ExchangeNotAvailable, // Maintenance work in progress
                '40017': AuthenticationError, // Wrong API Key
                '50052': InsufficientFunds,
                '50054': InsufficientFunds,
                '50304': OrderNotFound, // "Order was not found '123456789'" (fetching order trades for an order that does not have trades yet)
                '50173': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
                '50319': InvalidOrder, // Price by order is less than permissible minimum for this pair
                '50321': InvalidOrder, // Price by order is more than permissible maximum for this pair
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetPairSettings ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let symbol = id.replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_quantity'),
                        'max': this.safeFloat (market, 'max_quantity'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'min_price'),
                        'max': this.safeFloat (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'min_amount'),
                        'max': this.safeFloat (market, 'max_amount'),
                    },
                },
                'precision': {
                    'amount': 8,
                    'price': 8,
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserInfo ();
        let result = { 'info': response };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = this.account ();
            if (currency in response['balances'])
                account['free'] = parseFloat (response['balances'][currency]);
            if (currency in response['reserved'])
                account['used'] = parseFloat (response['reserved'][currency]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'pair': market['id'],
        }, params);
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.publicGetOrderBook (request);
        let result = response[market['id']];
        return this.parseOrderBook (result, undefined, 'bid', 'ask');
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (!symbols) {
            ids = this.ids.join (',');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                let numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join (',');
        }
        let response = await this.publicGetOrderBook (this.extend ({
            'pair': ids,
        }, params));
        let result = {};
        ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let symbol = this.findSymbol (id);
            result[symbol] = this.parseOrderBook (response[id], undefined, 'bid', 'ask');
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        const last = parseFloat (ticker['last_trade']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy_price']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['sell_price']),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['avg']),
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': parseFloat (ticker['vol_curr']),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (params);
        let result = {};
        let ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (params);
        let market = this.market (symbol);
        return this.parseTicker (response[market['id']], market);
    }

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['trade_id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'order_id'),
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['quantity']),
            'cost': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response[market['id']], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        let response = await this.privatePostUserTrades (this.extend (request, params));
        if (typeof market !== 'undefined')
            response = response[market['id']];
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let prefix = (type === 'market') ? (type + '_') : '';
        let market = this.market (symbol);
        if ((type === 'market') && (typeof price === 'undefined')) {
            price = 0;
        }
        let request = {
            'pair': market['id'],
            'quantity': this.amountToString (symbol, amount),
            'type': prefix + side,
            'price': this.priceToPrecision (symbol, price),
        };
        let response = await this.privatePostOrderCreate (this.extend (request, params));
        let id = this.safeString (response, 'order_id');
        let timestamp = this.milliseconds ();
        amount = parseFloat (amount);
        price = parseFloat (price);
        let status = 'open';
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
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': undefined,
            'trades': undefined,
        };
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderCancel ({ 'order_id': id });
        if (id in this.orders)
            this.orders[id]['status'] = 'canceled';
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        try {
            let response = await this.privatePostOrderTrades ({
                'order_id': id.toString (),
            });
            return this.parseOrder (response);
        } catch (e) {
            if (e instanceof OrderNotFound) {
                if (id in this.orders)
                    return this.orders[id];
            }
        }
        throw new OrderNotFound (this.id + ' fetchOrder order id ' + id.toString () + ' not found in cache.');
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        if (typeof symbol !== 'undefined')
            market = this.market (symbol);
        let response = await this.privatePostOrderTrades ({
            'order_id': id.toString (),
        });
        return this.parseTrades (response, market, since, limit);
    }

    updateCachedOrders (openOrders, symbol) {
        // update local cache with open orders
        for (let j = 0; j < openOrders.length; j++) {
            const id = openOrders[j]['id'];
            this.orders[id] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            // match each cached order to an order in the open orders array
            // possible reasons why a cached order may be missing in the open orders array:
            // - order was closed or canceled -> update cache
            // - symbol mismatch (e.g. cached BTC/USDT, fetched ETH/USDT) -> skip
            let id = cachedOrderIds[k];
            let order = this.orders[id];
            result.push (order);
            if (!(id in openOrdersIndexedById)) {
                // cached order is not in open orders array
                // if we fetched orders by symbol and it doesn't match the cached order -> won't update the cached order
                if (typeof symbol !== 'undefined' && symbol !== order['symbol'])
                    continue;
                // order is cached but not present in the list of open orders -> mark the cached order as closed
                if (order['status'] === 'open') {
                    order = this.extend (order, {
                        'status': 'closed', // likewise it might have been canceled externally (unnoticed by "us")
                        'cost': undefined,
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                    if (typeof order['cost'] === 'undefined') {
                        if (typeof order['filled'] !== 'undefined')
                            order['cost'] = order['filled'] * order['price'];
                    }
                    this.orders[id] = order;
                }
            }
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserOpenOrders (params);
        let marketIds = Object.keys (response);
        let orders = [];
        for (let i = 0; i < marketIds.length; i++) {
            let marketId = marketIds[i];
            let market = undefined;
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
            let parsedOrders = this.parseOrders (response[marketId], market);
            orders = this.arrayConcat (orders, parsedOrders);
        }
        this.updateCachedOrders (orders, symbol);
        return this.filterBySymbolSinceLimit (this.orders, symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.fetchOrders (symbol, since, limit, params);
        let orders = this.filterBy (this.orders, 'status', 'open');
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.fetchOrders (symbol, since, limit, params);
        let orders = this.filterBy (this.orders, 'status', 'closed');
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    parseOrder (order, market = undefined) {
        let id = this.safeString (order, 'order_id');
        let timestamp = this.safeInteger (order, 'created');
        if (typeof timestamp !== 'undefined')
            timestamp *= 1000;
        let iso8601 = undefined;
        let symbol = undefined;
        let side = this.safeString (order, 'type');
        if (typeof market === 'undefined') {
            let marketId = undefined;
            if ('pair' in order) {
                marketId = order['pair'];
            } else if (('in_currency' in order) && ('out_currency' in order)) {
                if (side === 'buy')
                    marketId = order['in_currency'] + '_' + order['out_currency'];
                else
                    marketId = order['out_currency'] + '_' + order['in_currency'];
            }
            if ((typeof marketId !== 'undefined') && (marketId in this.markets_by_id))
                market = this.markets_by_id[marketId];
        }
        let amount = this.safeFloat (order, 'quantity');
        if (typeof amount === 'undefined') {
            let amountField = (side === 'buy') ? 'in_amount' : 'out_amount';
            amount = this.safeFloat (order, amountField);
        }
        let price = this.safeFloat (order, 'price');
        let cost = this.safeFloat (order, 'amount');
        let filled = 0.0;
        let trades = [];
        let transactions = this.safeValue (order, 'trades');
        let feeCost = undefined;
        if (typeof transactions !== 'undefined') {
            if (Array.isArray (transactions)) {
                for (let i = 0; i < transactions.length; i++) {
                    let trade = this.parseTrade (transactions[i], market);
                    if (typeof id === 'undefined')
                        id = trade['order'];
                    if (typeof timestamp === 'undefined')
                        timestamp = trade['timestamp'];
                    if (timestamp > trade['timestamp'])
                        timestamp = trade['timestamp'];
                    filled += trade['amount'];
                    if (typeof feeCost === 'undefined')
                        feeCost = 0.0;
                    // feeCost += trade['fee']['cost'];
                    if (typeof cost === 'undefined')
                        cost = 0.0;
                    cost += trade['cost'];
                    trades.push (trade);
                }
            }
        }
        if (typeof timestamp !== 'undefined')
            iso8601 = this.iso8601 (timestamp);
        let remaining = undefined;
        if (typeof amount !== 'undefined')
            remaining = amount - filled;
        let status = this.safeString (order, 'status'); // in case we need to redefine it for canceled orders
        if (filled >= amount)
            status = 'closed';
        else
            status = 'open';
        if (typeof market === 'undefined')
            market = this.getMarketFromTrades (trades);
        let feeCurrency = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        if (typeof cost === 'undefined') {
            if (typeof price !== 'undefined')
                cost = price * filled;
        } else if (typeof price === 'undefined') {
            if (filled > 0)
                price = cost / filled;
        }
        let fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        return {
            'id': id,
            'datetime': iso8601,
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
    }

    getMarketFromTrades (trades) {
        let tradesBySymbol = this.indexBy (trades, 'pair');
        let symbols = Object.keys (tradesBySymbol);
        let numSymbols = symbols.length;
        if (numSymbols === 1)
            return this.markets[symbols[0]];
        return undefined;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        let key = 'quote';
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'amount': amount,
            'currency': currency,
            'address': address,
        };
        if (typeof tag !== 'undefined')
            request['invoice'] = tag;
        let result = await this.privatePostWithdrawCrypt (this.extend (request, params));
        return {
            'info': result,
            'id': result['task_id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('result' in response) {
                //
                //     {"result":false,"error":"Error 50052: Insufficient funds"}
                //
                let success = this.safeValue (response, 'result', false);
                if (typeof success === 'string') {
                    if ((success === 'true') || (success === '1'))
                        success = true;
                    else
                        success = false;
                }
                if (!success) {
                    let code = undefined;
                    const message = this.safeString (response, 'error');
                    const errorParts = message.split (':');
                    let numParts = errorParts.length;
                    if (numParts > 1) {
                        const errorSubParts = errorParts[0].split (' ');
                        let numSubParts = errorSubParts.length;
                        code = (numSubParts > 1) ? errorSubParts[1] : errorSubParts[0];
                    }
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        throw new exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
