'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitcoincoid extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincoid',
            'name': 'Bitcoin.co.id',
            'countries': 'ID', // Indonesia
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
                'withdraw': false,
            },
            'version': '1.7', // as of 6 November 2017
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg',
                'api': {
                    'public': 'https://vip.bitcoin.co.id/api',
                    'private': 'https://vip.bitcoin.co.id/tapi',
                },
                'www': 'https://www.bitcoin.co.id',
                'doc': [
                    'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
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
                    ],
                },
            },
            'markets': {
                'BTC/IDR': { 'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 0.0001, 'max': undefined }}},
                'BCH/IDR': { 'id': 'bch_idr', 'symbol': 'BCH/IDR', 'base': 'BCH', 'quote': 'IDR', 'baseId': 'bch', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'BTG/IDR': { 'id': 'btg_idr', 'symbol': 'BTG/IDR', 'base': 'BTG', 'quote': 'IDR', 'baseId': 'btg', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'ETH/IDR': { 'id': 'eth_idr', 'symbol': 'ETH/IDR', 'base': 'ETH', 'quote': 'IDR', 'baseId': 'eth', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'ETC/IDR': { 'id': 'etc_idr', 'symbol': 'ETC/IDR', 'base': 'ETC', 'quote': 'IDR', 'baseId': 'etc', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'IGNIS/IDR': { 'id': 'ignis_idr', 'symbol': 'IGNIS/IDR', 'base': 'IGNIS', 'quote': 'IDR', 'baseId': 'ignis', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'LTC/IDR': { 'id': 'ltc_idr', 'symbol': 'LTC/IDR', 'base': 'LTC', 'quote': 'IDR', 'baseId': 'ltc', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'NXT/IDR': { 'id': 'nxt_idr', 'symbol': 'NXT/IDR', 'base': 'NXT', 'quote': 'IDR', 'baseId': 'nxt', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'WAVES/IDR': { 'id': 'waves_idr', 'symbol': 'WAVES/IDR', 'base': 'WAVES', 'quote': 'IDR', 'baseId': 'waves', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'XRP/IDR': { 'id': 'xrp_idr', 'symbol': 'XRP/IDR', 'base': 'XRP', 'quote': 'IDR', 'baseId': 'xrp', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 10, 'max': undefined }}},
                'XZC/IDR': { 'id': 'xzc_idr', 'symbol': 'XZC/IDR', 'base': 'XZC', 'quote': 'IDR', 'baseId': 'xzc', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'XLM/IDR': { 'id': 'str_idr', 'symbol': 'XLM/IDR', 'base': 'XLM', 'quote': 'IDR', 'baseId': 'str', 'quoteId': 'idr', 'limits': { 'amount': { 'min': 20, 'max': undefined }}},
                'BTS/BTC': { 'id': 'bts_btc', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'DASH/BTC': { 'id': 'drk_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'drk', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'NXT/BTC': { 'id': 'nxt_btc', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC', 'baseId': 'nxt', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'XLM/BTC': { 'id': 'str_btc', 'symbol': 'XLM/BTC', 'base': 'XLM', 'quote': 'BTC', 'baseId': 'str', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'XEM/BTC': { 'id': 'nem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC', 'baseId': 'nem', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetPairDepth (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPairTicker (this.extend ({
            'pair': market['id'],
        }, params));
        let ticker = response['ticker'];
        let timestamp = parseFloat (ticker['server_time']) * 1000;
        let baseVolume = 'vol_' + market['baseId'].toLowerCase ();
        let quoteVolume = 'vol_' + market['quoteId'].toLowerCase ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker[baseVolume]),
            'quoteVolume': parseFloat (ticker[quoteVolume]),
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
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPairTrades (this.extend ({
            'pair': market['id'],
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
        if (market) {
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
                if (typeof remainingCost !== 'undefined') {
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
        let timestamp = parseInt (order['submit_time']);
        let fee = undefined;
        let result = {
            'info': order,
            'id': order['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostGetOrder (this.extend ({
            'pair': market['id'],
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
        if (symbol) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        let response = await this.privatePostOpenOrders (this.extend (request, params));
        let rawOrders = response['return']['orders'];
        // { success: 1, return: { orders: null }} if no orders
        if (!rawOrders)
            return [];
        // { success: 1, return: { orders: [ ... objects ] }} for orders fetched by symbol
        if (typeof symbol !== 'undefined')
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
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol');
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        let response = await this.privatePostOrderHistory (this.extend (request, params));
        let orders = this.parseOrders (response['return']['orders'], market, since, limit);
        orders = this.filterBy (orders, 'status', 'closed');
        if (symbol)
            return this.filterBySymbol (orders, symbol);
        return orders;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'pair': market['id'],
            'type': side,
            'price': price,
        };
        let currency = market['baseId'];
        if (side === 'buy') {
            order[market['quoteId']] = amount * price;
        } else {
            order[market['baseId']] = amount;
        }
        order[currency] = amount;
        let result = await this.privatePostTrade (this.extend (order, params));
        return {
            'info': result,
            'id': result['return']['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol argument');
        let side = this.safeValue (params, 'side');
        if (typeof side === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder requires an extra "side" param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        return await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
            'pair': market['id'],
            'type': params['side'],
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': this.nonce (),
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
        // { success: 0, error: "invalid order." }
        if (typeof response === 'undefined')
            if (body[0] === '{')
                response = JSON.parse (body);
        if (!('success' in response))
            return; // no 'success' property on public responses
        if (response['success'] === 1) {
            // { success: 1, return: { orders: [] }}
            if (!('return' in response))
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            else
                return;
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
