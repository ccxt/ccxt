"use strict";

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds } = require ('./base/errors')

// ---------------------------------------------------------------------------

module.exports = class hitbtc extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc',
            'name': 'HitBTC',
            'countries': 'HK', // Hong Kong
            'rateLimit': 1500,
            'version': '1',
            'hasCORS': false,
            'hasFetchTickers': true,
            'hasFetchOrder': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            'hasWithdraw': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api': 'http://api.hitbtc.com',
                'www': 'https://hitbtc.com',
                'doc': 'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv1.md',
            },
            'api': {
                'public': {
                    'get': [
                        '{symbol}/orderbook',
                        '{symbol}/ticker',
                        '{symbol}/trades',
                        '{symbol}/trades/recent',
                        'symbols',
                        'ticker',
                        'time,'
                    ],
                },
                'trading': {
                    'get': [
                        'balance',
                        'orders/active',
                        'orders/recent',
                        'order',
                        'trades/by/order',
                        'trades',
                    ],
                    'post': [
                        'new_order',
                        'cancel_order',
                        'cancel_orders',
                    ],
                },
                'payment': {
                    'get': [
                        'balance',
                        'address/{currency}',
                        'transactions',
                        'transactions/{transaction}',
                    ],
                    'post': [
                        'transfer_to_trading',
                        'transfer_to_main',
                        'address/{currency}',
                        'payout',
                    ],
                },
            },
        });
    }

    commonCurrencyCode (currency) {
        if (currency == 'XBT')
            return 'BTC';
        if (currency == 'DRK')
            return 'DASH';
        if (currency == 'CAT')
            return 'BitClave';
        return currency;
    }

    async fetchMarkets () {
        let markets = await this.publicGetSymbols ();
        let result = [];
        for (let p = 0; p < markets['symbols'].length; p++) {
            let market = markets['symbols'][p];
            let id = market['symbol'];
            let base = market['commodity'];
            let quote = market['currency'];
            let lot = parseFloat (market['lot']);
            let step = parseFloat (market['step']);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': lot,
                'step': step,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let method = this.safeString (params, 'type', 'trading');
        method += 'GetBalance';
        let query = this.omit (params, 'type');
        let response = await this[method] (query);
        let balances = response['balance'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let code = balance['currency_code'];
            let currency = this.commonCurrencyCode (code);
            let free = this.safeFloat (balance, 'cash', 0.0);
            free = this.safeFloat (balance, 'balance', free);
            let used = this.safeFloat (balance, 'reserved', 0.0);
            let account = {
                'free': free,
                'used': used,
                'total': this.sum (free, used),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetSymbolOrderbook (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'ask': this.safeFloat (ticker, 'ask'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volume_quote'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetSymbolTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        if ('message' in ticker)
            throw new ExchangeError (this.id + ' ' + ticker['message']);
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        return {
            'info': trade,
            'id': trade[0],
            'timestamp': trade[3],
            'datetime': this.iso8601 (trade[3]),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade[4],
            'price': parseFloat (trade[1]),
            'amount': parseFloat (trade[2]),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetSymbolTrades (this.extend ({
            'symbol': market['id'],
            // 'from': 0,
            // 'till': 100,
            // 'by': 'ts', // or by trade_id
            // 'sort': 'desc', // or asc
            // 'start_index': 0,
            // 'max_results': 1000,
            // 'format_item': 'object',
            // 'format_price': 'number',
            // 'format_amount': 'number',
            // 'format_tid': 'string',
            // 'format_timestamp': 'millisecond',
            // 'format_wrap': false,
            'side': 'true',
        }, params));
        return this.parseTrades (response['trades'], market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // check if amount can be evenly divided into lots
        // they want integer quantity in lot units
        let quantity = parseFloat (amount) / market['lot'];
        let wholeLots = Math.round (quantity);
        let difference = quantity - wholeLots;
        if (Math.abs (difference) > market['step'])
            throw new ExchangeError (this.id + ' order amount should be evenly divisible by lot unit size of ' + market['lot'].toString ());
        let clientOrderId = this.milliseconds ();
        let order = {
            'clientOrderId': clientOrderId.toString (),
            'symbol': market['id'],
            'side': side,
            'quantity': wholeLots.toString (), // quantity in integer lot units
            'type': type,
        };
        if (type == 'limit') {
            order['price'] = price.toFixed (10);
        } else {
            order['timeInForce'] = 'FOK';
        }
        let response = await this.tradingPostNewOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['ExecutionReport']['clientOrderId'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.tradingPostCancelOrder (this.extend ({
            'clientOrderId': id,
        }, params));
    }

    getOrderStatus (status) {
        let statuses = {
            'new': 'open',
            'partiallyFilled': 'partial',
            'filled': 'closed',
            'canceled': 'canceled',
            'rejected': 'rejected',
            'expired': 'expired',
        };
        return this.safeString (statuses, status);
    }

    parseOrder (order, market = undefined) {
        let timestamp = parseInt (order['lastTimestamp']);
        let symbol = undefined;
        if (!market)
            market = this.markets_by_id[order['symbol']];
        let status = this.safeString (order, 'orderStatus');
        if (status)
            status = this.getOrderStatus (status);
        let averagePrice = this.safeFloat (order, 'avgPrice', 0.0);
        let price = this.safeFloat (order, 'orderPrice');
        let amount = this.safeFloat (order, 'orderQuantity');
        let remaining = this.safeFloat (order, 'quantityLeaves');
        let filled = undefined;
        let cost = undefined;
        if (market) {
            symbol = market['symbol'];
            amount *= market['lot'];
            remaining *= market['lot'];
        }
        if (amount && remaining) {
            filled = amount - remaining;
            cost = averagePrice * filled;
        }
        return {
            'id': order['clientOrderId'].toString (),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.tradingGetOrder (this.extend ({
            'client_order_id': id,
        }, params));
        return this.parseOrder (response['orders'][0]);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let statuses = [ 'new', 'partiallyFiiled' ];
        let market = undefined;
        let request = {
            'sort': 'desc',
            'statuses': statuses.join (','),
        };
        if (symbol) {
            market = this.market (symbol);
            request['symbols'] = market['id'];
        }
        let response = await this.tradingGetOrdersActive (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let statuses = [ 'filled', 'canceled', 'rejected', 'expired' ];
        let request = {
            'sort': 'desc',
            'statuses': statuses.join (','),
            'max_results': 1000,
        };
        if (symbol) {
            market = this.market (symbol);
            request['symbols'] = market['id'];
        }
        let response = await this.tradingGetOrdersRecent (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.paymentPostPayout (this.extend ({
            'currency_code': currency,
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['transaction'],
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + 'api' + '/' + this.version + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let payload = { 'nonce': nonce, 'apikey': this.apiKey };
            query = this.extend (payload, query);
            if (method == 'GET')
                url += '?' + this.urlencode (query);
            else
                url += '?' + this.urlencode (payload);
            let auth = url;
            if (method == 'POST') {
                if (Object.keys (query).length) {
                    body = this.urlencode (query);
                    auth += body;
                }
            }
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Signature': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512').toLowerCase (),
            };
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response) {
            if ('ExecutionReport' in response) {
                if (response['ExecutionReport']['orderRejectReason'] == 'orderExceedsLimit')
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
            }
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
}
