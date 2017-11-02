"use strict";

// ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc')
const { ExchangeError } = require ('./base/errors')

// ---------------------------------------------------------------------------

module.exports = class hitbtc2 extends hitbtc {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc2',
            'name': 'HitBTC v2',
            'countries': 'HK', // Hong Kong
            'rateLimit': 1500,
            'version': '2',
            'hasCORS': true,
            'hasFetchTickers': true,
            'hasFetchOrders': false,
            'hasFetchOpenOrders': false,
            'hasFetchClosedOrders': false,
            'hasWithdraw': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api': 'https://api.hitbtc.com',
                'www': 'https://hitbtc.com',
                'doc': [
                    'https://api.hitbtc.com/api/2/explore',
                    'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'symbol', // Available Currency Symbols
                        'symbol/{symbol}', // Get symbol info
                        'currency', // Available Currencies
                        'currency/{currency}', // Get currency info
                        'ticker', // Ticker list for all symbols
                        'ticker/{symbol}', // Ticker for symbol
                        'trades/{symbol}', // Trades
                        'orderbook/{symbol}', // Orderbook
                    ],
                },
                'private': {
                    'get': [
                        'order', // List your current open orders
                        'order/{clientOrderId}', // Get a single order by clientOrderId
                        'trading/balance', // Get trading balance
                        'trading/fee/{symbol}', // Get trading fee rate
                        'history/trades', // Get historical trades
                        'history/order', // Get historical orders
                        'history/order/{id}/trades', // Get historical trades by specified order
                        'account/balance', // Get main acccount balance
                        'account/transactions', // Get account transactions
                        'account/transactions/{id}', // Get account transaction by id
                        'account/crypto/address/{currency}', // Get deposit crypro address
                    ],
                    'post': [
                        'order', // Create new order
                        'account/crypto/withdraw', // Withdraw crypro
                        'account/crypto/address/{currency}', // Create new deposit crypro address
                        'account/transfer', // Transfer amount to trading
                    ],
                    'put': [
                        'order/{clientOrderId}', // Create new order
                        'account/crypto/withdraw/{id}', // Commit withdraw crypro
                    ],
                    'delete': [
                        'order', // Cancel all open orders
                        'order/{clientOrderId}', // Cancel order
                        'account/crypto/withdraw/{id}', // Rollback withdraw crypro
                    ],
                    'patch': [
                        'order/{clientOrderId}', // Cancel Replace order
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0 / 100,
                    'taker': 0.1 / 100,
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
        let markets = await this.publicGetSymbol ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'];
            let base = market['baseCurrency'];
            let quote = market['quoteCurrency'];
            let lot = market['quantityIncrement'];
            let step = parseFloat (market['tickSize']);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'price': 2,
                'amount': -1 * Math.log10(step),
            };
            let amountLimits = { 'min': lot };
            let limits = { 'amount': amountLimits };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': lot,
                'step': step,
                'info': market,
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetTradingBalance ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let code = balance['currency'];
            let currency = this.commonCurrencyCode (code);
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['reserved']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderbookSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bid', 'ask', 'price', 'size');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.parse8601 (ticker['timestamp']);
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
            'close': this.safeFloat (ticker, 'close'),
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volumeQuote'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['symbol'];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetTickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        if ('message' in ticker)
            throw new ExchangeError (this.id + ' ' + ticker['message']);
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['timestamp']);
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['quantity']),
        };
    }

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let clientOrderId = this.milliseconds ();
        amount = parseFloat (amount);
        let order = {
            'clientOrderId': clientOrderId.toString (),
            'symbol': market['id'],
            'side': side,
            'quantity': amount.toString (),
            'type': type,
        };
        if (type == 'limit') {
            price = parseFloat (price);
            order['price'] = price.toFixed (10);
        } else {
            order['timeInForce'] = 'FOK';
        }
        let response = await this.privatePostOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['clientOrderId'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrderClientOrderId (this.extend ({
            'clientOrderId': id,
        }, params));
    }

    parseOrder (order, market = undefined) {
        let lastTime = this.parse8601 (order['updatedAt']);
        let timestamp = lastTime.getTime();
        if (!market)
            market = this.markets_by_id[order['symbol']];
        let symbol = market['symbol'];
        let amount = order['quantity'];
        let filled = order['cumQuantity'];
        let remaining = amount - filled;
        return {
            'id': order['clientOrderId'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': order['status'],
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': order['price'],
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetOrder (this.extend ({
            'client_order_id': id,
        }, params));
        return this.parseOrder (response['orders'][0]);
    }

    async fetchOpenOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            params = this.extend ({'symbol': market['id']});
        }
        let response = await this.privateGetOrder (params);
        return this.parseOrders (response, market);
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        amount = parseFloat (amount);
        let response = await this.privatePostAccountCryptoWithdraw (this.extend ({
            'currency': currency,
            'amount': amount.toString (),
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/api' + '/' + this.version + '/';
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            url += api + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            url += this.implodeParams (path, params) + '?' + this.urlencode (query);
            if (method != 'GET')
                if (Object.keys (query).length)
                    body = this.json (query);
            let payload = this.encode (this.apiKey + ':' + this.secret);
            let auth = this.stringToBase64 (payload);
            headers = {
                'Authorization': "Basic " + this.decode (auth),
                'Content-Type': 'application/json',
            };
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
}
