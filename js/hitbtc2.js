"use strict";

// ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc')
const { ExchangeError, OrderNotFound } = require ('./base/errors')

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
            // older metainfo interface
            'hasFetchOHLCV': true,
            'hasFetchTickers': true,
            'hasFetchOrder': true,
            'hasFetchOrders': false,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            'hasFetchMyTrades': true,
            'hasWithdraw': true,
            // new metainfo interface
            'has': {
                'fetchOHLCV': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30', // default
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api': 'https://api.hitbtc.com',
                'www': 'https://hitbtc.com',
                'doc': 'https://api.hitbtc.com',
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
                        'candles/{symbol}', // Candles
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
                    'maker': -0.01 / 100,
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

    feeToPrecision (symbol, fee) {
        return this.truncate (fee, 8);
    }

    async fetchMarkets () {
        let markets = await this.publicGetSymbol ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'];
            let base = market['baseCurrency'];
            let quote = market['quoteCurrency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let lot = parseFloat (market['quantityIncrement']);
            let step = parseFloat (market['tickSize']);
            let precision = {
                'price': this.precisionFromString (market['tickSize']),
                'amount': this.precisionFromString (market['quantityIncrement']),
            };
            let taker = parseFloat (market['takeLiquidityRate']);
            let maker = parseFloat (market['provideLiquidityRate']);
            result.push (this.extend (this.fees['trading'], {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': lot,
                'step': step,
                'taker': taker,
                'maker': maker,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': step,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            }));
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let type = this.safeString (params, 'type', 'trading');
        let method = 'privateGet' + this.capitalize (type) + 'Balance';
        let balances = await this[method] ();
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['timestamp']);
        return [
            timestamp,
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['max']),
            parseFloat (ohlcv['min']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['volumeQuote']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.publicGetCandlesSymbol (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
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
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            let id = trade['symbol'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                symbol = id;
            }
        }
        let fee = undefined;
        if ('fee' in trade) {
            let currency = market ? market['quote'] : undefined;
            fee = {
                'cost': parseFloat (trade['fee']),
                'currency': currency,
            };
        }
        let orderId = undefined;
        if ('clientOrderId' in trade)
            orderId = trade['clientOrderId'];
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['quantity']);
        let cost = price * amount;
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': trade['side'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
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
        let request = {
            'clientOrderId': clientOrderId.toString (),
            'symbol': market['id'],
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type,
        };
        if (type == 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['timeInForce'] = 'FOK';
        }
        let response = await this.privatePostOrder (this.extend (request, params));
        let order = this.parseOrder (response);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrderClientOrderId (this.extend ({
            'clientOrderId': id,
        }, params));
    }

    parseOrder (order, market = undefined) {
        let created = undefined;
        if ('createdAt' in order)
            created = this.parse8601 (order['createdAt']);
        let updated = undefined;
        if ('updatedAt' in order)
            updated = this.parse8601 (order['updatedAt']);
        if (!market)
            market = this.markets_by_id[order['symbol']];
        let symbol = market['symbol'];
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'cumQuantity');
        let status = order['status'];
        if (status == 'new') {
            status = 'open';
        } else if (status == 'suspended') {
            status = 'open';
        } else if (status == 'partiallyFilled') {
            status = 'open';
        } else if (status == 'filled') {
            status = 'closed';
        }
        let remaining = undefined;
        if (typeof amount != 'undefined') {
            if (typeof filled != 'undefined') {
                remaining = amount - filled;
            }
        }
        return {
            'id': order['clientOrderId'].toString (),
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'created': created,
            'updated': updated,
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': this.safeFloat (order, 'price'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetHistoryOrder (this.extend ({
            'clientOrderId': id,
        }, params));
        let numOrders = response.length;
        if (numOrders > 0)
            return this.parseOrder (response[0]);
        throw OrderNotFound (this.id + ' order ' + id + ' not found');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit)
            request['limit'] = limit;
        if (since) {
            request['from'] = this.iso8601 (since);
        }
        let response = await this.privateGetHistoryOrder (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            // 'symbol': 'BTC/USD', // optional
            // 'sort': 'DESC', // or 'ASC'
            // 'by': 'timestamp', // or 'id'	String	timestamp by default, or id
            // 'from':	'Datetime or Number', // ISO 8601
            // 'till':	'Datetime or Number',
            // 'limit': 100,
            // 'offset': 0,
        };
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since)
            request['from'] = this.iso8601 (since);
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetHistoryTrades (this.extend (request, params));
        return this.parseTrades (response, market);
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
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            if (method == 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else {
                if (Object.keys (query).length)
                    body = this.json (query);
            }
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

    handleErrors (code, reason, url, method, headers, body) {
        if (code == 400) {
            if (body[0] == "{") {
                let response = JSON.parse (body);
                if ('error' in response) {
                    if ('message' in response['error']) {
                        let message = response['error']['message'];
                        if (message == 'Order not found') {
                            throw new OrderNotFound (this.id + ' order not found in active orders');
                        } else if (message == 'Insufficient funds') {
                            throw new InsufficientFunds (this.id + ' ' + message);
                        }
                    }
                }
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
}
