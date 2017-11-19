"use strict";

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, OrderNotFound, DDoSProtection } = require ('./base/errors')

// ---------------------------------------------------------------------------

module.exports = class liqui extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'liqui',
            'name': 'Liqui',
            'countries': 'UA',
            'rateLimit': 2500,
            'version': '3',
            'hasCORS': false,
            // obsolete metainfo interface
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            'hasFetchTickers': true,
            'hasFetchMyTrades': true,
            'hasWithdraw': true,
            // new metainfo interface
            'has': {
                'fetchOrder': true,
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchTickers': true,
                'fetchMyTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
                'api': {
                    'public': 'https://api.liqui.io/api',
                    'private': 'https://api.liqui.io/tapi',
                },
                'www': 'https://liqui.io',
                'doc': 'https://liqui.io/api',
                'fees': 'https://liqui.io/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.0025,
                },
                'funding': 0.0,
            },
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side == 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        };
    }

    commonCurrencyCode (currency) {
        if (!this.substituteCommonCurrencyCodes)
            return currency;
        if (currency == 'XBT')
            return 'BTC';
        if (currency == 'BCC')
            return 'BCH';
        if (currency == 'DRK')
            return 'DASH';
        // they misspell DASH as dsh :/
        if (currency == 'DSH')
            return 'DASH';
        return currency;
    }

    getBaseQuoteFromMarketId (id) {
        let uppercase = id.toUpperCase ();
        let [ base, quote ] = uppercase.split ('_');
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return [ base, quote ];
    }

    async fetchMarkets () {
        let response = await this.publicGetInfo ();
        let markets = response['pairs'];
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let [ base, quote ] = this.getBaseQuoteFromMarketId (id);
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
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'taker': market['fee'] / 100,
                'lot': amountLimits['min'],
                'precision': precision,
                'limits': limits,
                'info': market,
            }));
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let funds = balances['funds'];
        let currencies = Object.keys (funds);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            uppercase = this.commonCurrencyCode (uppercase);
            let total = undefined;
            let used = undefined;
            if (balances['open_orders'] == 0) {
                total = funds[currency];
                used = 0.0;
            }
            let account = {
                'free': funds[currency],
                'used': used,
                'total': total,
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetDepthPair (this.extend ({
            'pair': market['id'],
        }, params));
        let market_id_in_reponse = (market['id'] in response);
        if (!market_id_in_reponse)
            throw new ExchangeError (this.id + ' ' + market['symbol'] + ' order book is empty or not available');
        let orderbook = response[market['id']];
        let result = this.parseOrderBook (orderbook);
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'avg'),
            'baseVolume': this.safeFloat (ticker, 'vol_cur'),
            'quoteVolume': this.safeFloat (ticker, 'vol'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (!symbols) {
            let numIds = this.ids.length;
            if (numIds > 256)
                throw new ExchangeError (this.id + ' fetchTickers() requires symbols argument');
            ids = this.ids;
        } else {
            ids = this.marketIds (symbols);
        }
        let tickers = await this.publicGetTickerPair (this.extend ({
            'pair': ids.join ('-'),
        }, params));
        let result = {};
        let keys = Object.keys (tickers);
        for (let k = 0; k < keys.length; k++) {
            let id = keys[k];
            let ticker = tickers[id];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['timestamp'] * 1000;
        let side = trade['type'];
        if (side == 'ask')
            side = 'sell';
        if (side == 'bid')
            side = 'buy';
        let price = this.safeFloat (trade, 'price');
        if ('rate' in trade)
            price = this.safeFloat (trade, 'rate');
        let id = this.safeString (trade, 'tid');
        if ('trade_id' in trade)
            id = this.safeString (trade, 'trade_id');
        let order = this.safeString (trade, this.getOrderIdKey ());
        if ('pair' in trade) {
            let marketId = trade['pair'];
            market = this.markets_by_id[marketId];
        }
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let feeSide = (side == 'buy') ? 'base' : 'quote';
        return {
            'id': id,
            'order': order,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': trade['amount'],
            'fee': {
                'cost': undefined,
                'currency': market[feeSide],
            },
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.publicGetTradesPair (this.extend (request, params));
        return this.parseTrades (response[market['id']], market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'type': side,
            'amount': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        let response = await this.privatePostTrade (this.extend (request, params));
        let id = this.safeString (response['return'], this.getOrderIdKey ());
        if (!id)
            id = this.safeString (response['return'], 'init_order_id');
        let timestamp = this.milliseconds ();
        price = parseFloat (price);
        amount = parseFloat (amount);
        let order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    getOrderIdKey () {
        return 'order_id';
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let request = {};
            let idKey = this.getOrderIdKey ();
            request[idKey] = id;
            response = await this.privatePostCancelOrder (this.extend (request, params));
            if (id in this.orders)
                this.orders[id]['status'] = 'canceled';
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'error');
                if (message) {
                    if (message.indexOf ('not found') >= 0)
                        throw new OrderNotFound (this.id + ' cancelOrder() error: ' + this.last_http_response);
                }
            }
            throw e;
        }
        return response;
    }

    parseOrder (order, market = undefined) {
        let id = order['id'].toString ();
        let status = order['status'];
        if (status == 0) {
            status = 'open';
        } else if (status == 1) {
            status = 'closed';
        } else if ((status == 2) || (status == 3)) {
            status = 'canceled';
        }
        let timestamp = parseInt (order['timestamp_created']) * 1000;
        let symbol = undefined;
        if (!market)
            market = this.markets_by_id[order['pair']];
        if (market)
            symbol = market['symbol'];
        let remaining = this.safeFloat (order, 'amount');
        let amount = this.safeFloat (order, 'start_amount', remaining);
        if (typeof amount == 'undefined') {
            if (id in this.orders) {
                amount = this.safeFloat (this.orders[id], 'amount');
            }
        }
        let price = this.safeFloat (order, 'rate');
        let filled = undefined;
        let cost = undefined;
        if (typeof amount != 'undefined') {
            if (typeof remaining != 'undefined') {
                filled = amount - remaining;
                cost = price * filled;
            }
        }
        let fee = undefined;
        let result = {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    parseOrders (orders, market = undefined) {
        let ids = Object.keys (orders);
        let result = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let order = orders[id];
            let extended = this.extend (order, { 'id': id });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderInfo (this.extend ({
            'order_id': parseInt (id),
        }, params));
        id = id.toString ();
        let order = this.parseOrder (this.extend ({ 'id': id }, response['return'][id]));
        this.orders[id] = this.extend (this.orders[id], order);
        return order;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = { 'pair': market['id'] };
        let response = await this.privatePostActiveOrders (this.extend (request, params));
        let openOrders = [];
        if ('return' in response)
            openOrders = this.parseOrders (response['return'], market);
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            let id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] == 'open') {
                    this.orders[id] = this.extend (order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                }
            }
            let order = this.orders[id];
            if (order['symbol'] == symbol)
                result.push (order);
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'open')
                result.push (orders[i]);
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'closed')
                result.push (orders[i]);
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {
            // 'from': 123456789, // trade ID, from which the display starts numerical 0
            // 'count': 1000, // the number of trades for display numerical, default = 1000
            // 'from_id': trade ID, from which the display starts numerical 0
            // 'end_id': trade ID on which the display ends numerical ∞
            // 'order': 'ASC', // sorting, default = DESC
            // 'since': 1234567890, // UTC start time, default = 0
            // 'end': 1234567890, // UTC end time, default = ∞
            // 'pair': 'eth_btc', // default = all markets
        };
        if (symbol) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit)
            request['count'] = parseInt (limit);
        if (since)
            request['since'] = parseInt (since / 1000);
        let response = await this.privatePostTradeHistory (this.extend (request, params));
        let trades = [];
        if ('return' in response)
            trades = response['return'];
        return this.parseTrades (trades, market);
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdrawCoin (this.extend ({
            'coinName': currency,
            'amount': parseFloat (amount),
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['return']['tId'],
        };
    }

    signBodyWithSecret (body) {
        return this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
    }

    getVersionString () {
        return '/' + this.version;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        if (api == 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'method': path,
            }, query));
            let signature = this.signBodyWithSecret (body);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        } else {
            url += this.getVersionString () + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response) {
            if (!response['success']) {
                if (response['error'].indexOf ('Not enougth') >= 0) { // not enougTh is a typo inside Liqui's own API...
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                } else if (response['error'] == 'Requests too often') {
                    throw new DDoSProtection (this.id + ' ' + this.json (response));
                } else if ((response['error'] == 'not available') || (response['error'] == 'external service unavailable')) {
                    throw new DDoSProtection (this.id + ' ' + this.json (response));
                } else {
                    throw new ExchangeError (this.id + ' ' + this.json (response));
                }
            }
        }
        return response;
    }
}
