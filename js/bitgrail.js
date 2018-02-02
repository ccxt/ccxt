'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitgrail extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitgrail',
            'name': 'BitGrail',
            'countries': 'IT',
            'version': 'v1',
            'has': {
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://bitgrail.com/images/logo.png',
                'api': 'https://api.bitgrail.com/v1',
                'www': 'https://bitgrail.com/',
                'doc': 'https://bitgrail.com/api-documentation',
                'fees': 'https://bitgrail.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        '{fiat-coin}/ticker',
                        '{fiat-coin}/orderbook',
                        '{fiat-coin}/tradehistory',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'buyorder',
                        'sellorder',
                        'openorders',
                        'cancelorder',
                        'getdepositaddress',
                        'withdraw',
                        'lasttrades',
                        'depositshistory',
                        'withdrawshistory',
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
                        'BTC': 0.002,
                        'XRB': 0.0,
                        'DOGE': 15.0,
                        'LTC': 0.02,
                        'CREA': 0.05,
                        'LSK': 0.3,
                        'CFT': 1000.0,
                        'BCH': 0.005,
                        'ETH': 0.005,
                        'BTG': 0.0005,
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetMarkets ();
        let quotes = Object.keys (response['response']);
        let result = [];
        for (let bi = 0; bi < quotes.length; bi++) {
            let quote = quotes[bi];
            let markets = response['response'][quote]['markets'];
            let marketIds = Object.keys (markets);
            for (let i = 0; i < marketIds.length; i++) {
                let marketKey = marketIds[i];
                let market = markets[marketKey];
                let [ baseId, quoteId ] = marketKey.split ('/');
                let base = this.commonCurrencyCode (baseId);
                let precision = {
                    'amount': 8,
                    'price': 8,
                };
                let lot = Math.pow (10, -precision['amount']);
                result.push ({
                    'id': quoteId + '-' + baseId,
                    'symbol': base + '/' + quote,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': true,
                    'lot': lot,
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': lot,
                            'max': undefined,
                        },
                        'price': {
                            'min': Math.pow (10, -precision['price']),
                            'max': Math.pow (10, precision['price']),
                        },
                        'cost': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'info': market,
                });
            }
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'ask': this.safeFloat (ticker, 'ask'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'coinVolume'),
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetFiatCoinTicker (this.extend ({
            'fiat-coin': market['id'],
        }, params));
        return this.parseTicker (response['response'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarkets (params);
        let quotes = Object.keys (response['response']);
        let result = {};
        for (let bi = 0; bi < quotes.length; bi++) {
            let quote = quotes[bi];
            let markets = response['response'][quote]['markets'];
            let marketIds = Object.keys (markets);
            for (let i = 0; i < marketIds.length; i++) {
                let marketKey = marketIds[i];
                let [ baseId, quoteId] = marketKey.split ('/');
                let id = quoteId + '-' + baseId;
                let ticker = markets[marketKey];
                let market = this.marketsById[id];
                let symbol = market['symbol'];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetFiatCoinOrderbook (this.extend ({
            'fiat-coin': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (response['response'], undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (!market)
            market = this.safeValue (this.marketsById, trade['market']);
        if (market)
            symbol = market['symbol'];
        let timestamp = parseInt (trade['date']) * 1000;
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let cost = this.costToPrecision (symbol, price * amount);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'trade_id'),
            'order': undefined,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': this.safeValue (trade, 'info', trade),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetFiatCoinTradehistory (this.extend ({
            'fiat-coin': market['id'],
        }, params));
        return this.parseTrades (response['response'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalances (params);
        let result = { 'info': response };
        let balances = response['response'];
        let currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            let id = currencies[i];
            let currency = this.commonCurrencyCode (id);
            let balance = balances[id];
            let account = {
                'free': parseFloat (balance['balance']),
                'used': parseFloat (balance['reserved']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (!market)
            market = this.safeValue (this.marketsById, order['market']);
        if (market)
            symbol = market['symbol'];
        let timestamp = this.safeInteger (order, 'date') * 1000;
        let price = parseFloat (order['price']);
        let amount = this.safeFloat (order, 'amount');
        let status = this.safeString (order, 'status');
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': this.safeValue (order, 'info', order),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side) + 'order';
        let order = {
            'market': market['id'],
            'amount': amount,
            'price': price,
        };
        let response = await this[method] (this.extend (order, params));
        order['id'] = response['result']['orderId'];
        order['type'] = side;
        order['date'] = this.seconds ();
        order['info'] = response;
        order = this.parseOrder (order, market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privatePostCancelorder (this.extend ({
            'id': id,
        }, params));
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOpenorders ();
        let orders = response['response'];
        let orderIds = Object.keys (orders);
        let result = [];
        for (let i = 0; i < orderIds.length; i++) {
            let id = orderIds[i];
            result.push (this.extend (orders[id], {
                'id': id,
                'status': 'open',
                'info': orders[id],
            }));
        }
        return this.parseOrders (result, undefined, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostLasttrades (params);
        let result = [];
        let trades = response['response'];
        let tradeIds = Object.keys (trades);
        for (let i = 0; i < tradeIds.length; i++) {
            let id = tradeIds[i];
            let trade = trades[id];
            result.push (this.extend (trade, {
                'trade_id': id,
                'info': trade,
            }));
        }
        return this.parseTrades (result, undefined, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostDepositaddress (this.extend ({
            'coin': currency['id'],
        }, params));
        let address = this.safeString (response['response'], 'address');
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostWithdraw (this.extend ({
            'withdraw': currency['id'],
            'address': address,
            'amount': amount,
        }, params));
        return {
            'id': undefined,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'nonce': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'KEY': this.apiKey,
                'SIGNATURE': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let success = this.safeInteger (response, 'success');
        let data = this.safeValue (response, 'response');
        if (success !== 1 || !data) {
            let message = this.safeString (data, 'error', 'Error');
            throw new ExchangeError (message);
        }
        return response;
    }
};
