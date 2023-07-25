'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tokenomy extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tokenomy',
            'name': 'TOKENOMY',
            'countries': [ 'SG' ], // Singapore
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchTickers': false,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': false,
                'fetchCurrencies': false,
                'withdraw': true,
                'fetchMarkets': true,
            },
            'version': '1.8',
            'urls': {
                'logo': 'https://camo.githubusercontent.com/b0fde0930f9bdb9b47b3abd2e31ac05418b2a051/68747470733a2f2f7777772e746f6b656e6f6d792e636f6d2f696d616765732f746f6b656e6f6d792f4c4f474f5f544f4b454e4f4d592e706e67',
                'api': {
                    'public': 'https://exchange.tokenomy.com/api',
                    'private': 'https://exchange.tokenomy.com/tapi',
                },
                'www': 'https://www.exchange.tokenomy.com',
                'doc': 'https://exchange.tokenomy.com/help/api',
                'referral': 'https://exchange.tokenomy.com/ref/201108ade331e6e0/1',
            },
            'api': {
                'public': {
                    'get': [
                        'summaries',
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
                        'market_info',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'transHistory',
                        'trade',
                        'tradeHistory',
                        'getOrder',
                        'openOrders',
                        'cancelOrder',
                        'orderHistory',
                        'withdrawCoin',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.003,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balance = response['return'];
        let result = { 'info': balance };
        let codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i];
            let currency = this.currencies[code];
            let lowercase = currency['id'];
            let account = this.account ();
            account['free'] = this.safeFloat (balance['balance'], lowercase, 0.0);
            account['used'] = this.safeFloat (balance['balance_hold'], lowercase, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetMarketInfo ();
        return markets;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const marketId = symbol.replace ('/', '_').toLowerCase ();
        let orderbook = await this.publicGetPairDepth (this.extend ({
            'pair': marketId,
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const marketId = symbol.replace ('/', '_').toLowerCase ();
        let response = await this.publicGetPairTicker (this.extend ({
            'pair': marketId,
        }, params));
        let ticker = response['ticker'];
        let timestamp = this.safeFloat (response, 'server_time') * 1000;
        let baseVolume = 'vol_' + market['base'].toLowerCase ();
        let quoteVolume = 'vol_' + market['quote'].toLowerCase ();
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
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, baseVolume),
            'quoteVolume': this.safeFloat (ticker, quoteVolume),
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const marketId = symbol.replace ('/', '_').toLowerCase ();
        let response = await this.publicGetPairTrades (this.extend ({
            'pair': marketId,
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        if ('type' in order)
            side = order['type'];
        let status = this.safeString (order, 'status', 'open');
        if (status === 'filled') {
            status = 'closed';
        } else if (status === 'calcelled') {
            status = 'canceled';
        }
        let symbol = undefined;
        let cost = undefined;
        let price = this.safeFloat (order, 'price');
        let amount = undefined;
        let remaining = undefined;
        let filled = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            let quoteId = market['quoteId'];
            let baseId = market['baseId'];
            if ((market['quoteId'] === 'idr') && ('order_rp' in order))
                quoteId = 'rp';
            if ((market['baseId'] === 'idr') && ('remain_rp' in order))
                baseId = 'rp';
            cost = this.safeFloat (order, 'order_' + quoteId);
            if (cost) {
                amount = cost / price;
                let remainingCost = this.safeFloat (order, 'remain_' + quoteId);
                if (remainingCost !== undefined) {
                    remaining = remainingCost / price;
                    filled = amount - remaining;
                }
            } else {
                amount = this.safeFloat (order, 'order_' + baseId);
                cost = price * amount;
                remaining = this.safeFloat (order, 'remain_' + baseId);
                filled = amount - remaining;
            }
        }
        let average = undefined;
        if (filled)
            average = cost / filled;
        let timestamp = parseInt (order['submit_time']) * 1000;
        let fee = undefined;
        let result = {
            'info': order,
            'id': order['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = symbol.replace ('/', '_').toLowerCase ();
        let response = await this.privatePostGetOrder (this.extend ({
            'pair': marketId,
            'order_id': id,
        }, params));
        let orders = response['return'];
        let order = this.parseOrder (this.extend ({ 'id': id }, orders['order']), market);
        return this.extend ({ 'info': response }, order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        let marketId = '';
        if (symbol !== undefined) {
            marketId = symbol.replace ('/', '_').toLowerCase ();
            market = this.market (symbol);
            request['pair'] = marketId;
        }
        let response = await this.privatePostOpenOrders (this.extend (request, params));
        let rawOrders = undefined;
        if (marketId !== '') {
            rawOrders = response['return']['orders'][marketId];
        } else {
            rawOrders = response['return']['orders'];
        }
        // { success: 1, return: { orders: null }} if no orders
        if (!rawOrders)
            return [];
        // { success: 1, return: { orders: [ ... objects ] }} for orders fetched by symbol
        if (symbol !== undefined)
            return this.parseOrders (rawOrders, market, since, limit);
        // { success: 1, return: { orders: { marketid: [ ... objects ] }}} if all orders are fetched
        let marketIds = Object.keys (rawOrders);
        let exchangeOrders = [];
        for (let i = 0; i < marketIds.length; i++) {
            let marketId = marketIds[i];
            let marketOrders = rawOrders[marketId];
            market = this.markets_by_id[marketId];
            let parsedOrders = this.parseOrders (marketOrders, market, since, limit);
            exchangeOrders = this.arrayConcat (exchangeOrders, parsedOrders);
        }
        return exchangeOrders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol');
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        let marketId = '';
        if (symbol !== undefined) {
            marketId = symbol.replace ('/', '_').toLowerCase ();
            market = this.market (symbol);
            request['pair'] = marketId;
        }
        let response = await this.privatePostOrderHistory (this.extend (request, params));
        let orders = this.parseOrders (response['return']['orders'], market, since, limit);
        orders = this.filterBy (orders, 'status', 'closed');
        if (symbol !== undefined)
            return this.filterBySymbol (orders, symbol);
        return orders;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'pair': symbol.replace ('/', '_').toLowerCase (),
            'type': side,
            'price': price,
        };
        let currency = market['base'].toLowerCase ();
        if (side !== 'buy') {
            order[currency] = amount;
        }
        order[currency] = amount;
        let result = await this.privatePostTrade (this.extend (order, params));
        return {
            'info': result,
            'id': result['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        let side = this.safeValue (params, 'side');
        if (side === undefined)
            throw new ExchangeError (this.id + ' cancelOrder requires an extra "side" param');
        await this.loadMarkets ();
        return await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
            'pair': symbol.replace ('/', '_').toLowerCase (),
            'type': params['side'],
        }, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        // Custom string you need to provide to identify each withdrawal.
        // Will be passed to callback URL (assigned via website to the API key)
        // so your system can identify the request and confirm it.
        // Alphanumeric, max length 255.
        let requestId = this.milliseconds ();
        // Alternatively:
        // let requestId = this.uuid ();
        let request = {
            'currency': currency['id'].toLowerCase (),
            'withdraw_amount': amount,
            'withdraw_address': address,
            'request_id': requestId.toString (),
        };
        if (tag)
            request['withdraw_memo'] = tag;
        let response = await this.privatePostWithdrawCoin (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        let id = undefined;
        if (('txid' in response) && (response['txid'].length > 0))
            id = response['txid'];
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': this.nonce () * 1000,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (typeof body !== 'string')
            return;
        // { success: 0, error: "invalid order." }
        // or
        // [{ data, ... }, { ... }, ... ]
        if (response === undefined)
            if (body[0] === '{' || body[0] === '[')
                response = JSON.parse (body);
        if (Array.isArray (response))
            return; // public endpoints may return []-arrays
        if (!('success' in response))
            return; // no 'success' property on public responses
        if (response['success'] === 1) {
            // { success: 1, return: { orders: [] }}
            if (!('return' in response)) {
                if (typeof response['order_id'] !== 'undefined' || typeof response['status'] !== 'undefined') {
                    return;
                } else {
                    throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
                }
            } else {
                return;
            }
        }
        let message = response['error'];
        let feedback = this.id + ' ' + this.json (response);
        if (message === 'Insufficient balance.') {
            throw new InsufficientFunds (feedback);
        } else if (message === 'invalid order.') {
            throw new OrderNotFound (feedback); // cancelOrder(1)
        } else if (message.indexOf ('Minimum price ') >= 0) {
            throw new InvalidOrder (feedback); // price < limits.price.min, on createLimitBuyOrder ('ETH/BTC', 1, 0)
        } else if (message.indexOf ('Minimum order ') >= 0) {
            throw new InvalidOrder (feedback); // cost < limits.cost.min on createLimitBuyOrder ('ETH/BTC', 0, 1)
        } else if (message === 'Invalid credentials. API not found or session has expired.') {
            throw new AuthenticationError (feedback); // on bad apiKey
        } else if (message === 'Invalid credentials. Bad sign.') {
            throw new AuthenticationError (feedback); // on bad secret
        }
        throw new ExchangeError (this.id + ': unknown error: ' + this.json (response));
    }
};
