'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, AuthenticationError } = require ('./base/errors');

module.exports = class graviex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'graviex',
            'name': 'Graviex',
            'version': 'v2',
            'countries': [ 'MT', 'RU' ],
            'rateLimit': 1000,
            'has': {
                'createOrder': true,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'createDepositAddress': true,
                'deposit': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchBalance': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38046312-0b450aac-32c8-11e8-99ab-bc6b136b6cc7.jpg',
                'api': {
                    'public': 'https://graviex.net',
                    'private': 'https://graviex.net',
                },
                'www': 'https://graviex.net',
                'doc': 'https://graviex.net/documents/api_v2?lang=en',
                'fees': 'https://graviex.net/documents/fees-and-discounts',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'order_book',
                        'depth',
                        'trades',
                        'k',
                        'k_with_pending_trades',
                    ],
                },
                'private': {
                    'get': [
                        'members/me',
                        'deposits',
                        'deposit',
                        'deposit_address',
                        'orders',
                        'order',
                        'trades/my',
                    ],
                    'post': [
                        'orders',
                        'orders/multi',
                        'orders/clear',
                        'order/delete',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'maker': 0.0,
                    'taker': 0.2,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0004,
                        'ETH': 0.0055,
                        'DOGE': 2.0,
                        'NYC': 1.0,
                        'XMR': 0.02,
                        'PIVX': 0.2,
                        'NEM': 0.05,
                        'SCAVO': 5.0,
                        'SEDO': 5.0,
                        'USDT': 3.0,
                        'GDM': 0.3,
                        'PIRL': 0.005,
                        'PK': 0.1,
                        'ORM': 10,
                        'NCP': 10,
                        'ETM': 10,
                        'USD': 0,
                        'EUR': 0,
                        'RUB': 0,
                        'other': 0.002,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let symbolParts = market['name'].split ('/');
            let baseId = symbolParts[0];
            let quoteId = symbolParts[1];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let active = true;
            result.push ({
                'id': this.safeString (market, 'id'),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'at');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        ticker = this.safeValue (ticker, 'ticker');
        return {
            'symbol': this.safeString (market, 'symbol'),
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
            'close': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'volbtc'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTickers (this.extend ({ 'addpath': market['id'] }, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickers (params);
        let data = response;
        let ids = Object.keys (data);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (response[id], market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 20; // default
        }
        const request = {
            'market': this.marketId (symbol),
            'limit': limit,
        };
        let response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTrade (trade, market = undefined) {
        // this method parses both public and private trades
        let timestamp = this.safeInteger (trade, 'at');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'volume');
        let marketId = this.safeString (trade, 'market');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'order_id'),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (limit === undefined)
            limit = 20; // default
        let response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
            'limit': limit,
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetK (this.extend ({
            'market': market['id'],
            'type': this.timeframes[timeframe],
        }, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        let response = await this.privateGetDepositAddress (this.extend ({
            'currency': code.toLowerCase (),
        }, params));
        let address = JSON.parse (response);
        address = JSON.parse (address);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        let response = await this.privateGetDepositAddress (this.extend ({
            'currency': code.toLowerCase (),
        }, params));
        let address = JSON.parse (response);
        address = JSON.parse (address);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency code argument');
        }
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'].toLowerCase (),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privatePostHistoryMovements (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        let timestamp = this.safeFloat (transaction, 'done_at');
        if (timestamp !== undefined && timestamp !== 'NULL') {
            timestamp = parseInt (timestamp * 1000);
        }
        let updated = this.safeFloat (transaction, 'timestamp');
        if (updated !== undefined) {
            updated = parseInt (updated * 1000);
        }
        let code = undefined;
        if (currency === undefined) {
            let currencyId = this.safeString (transaction, 'currency');
            if (currencyId in this.currencies_by_id) {
                currency = this.currencies_by_id[currencyId];
            } else {
                code = this.commonCurrencyCode (currencyId);
            }
        } else {
            code = currency['code'].toLowerCase ();
        }
        let type = 'deposit'; // DEPOSIT or WITHDRAWAL
        let feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (this.safeString (transaction, 'created_at')),
            'address': undefined,
            'tag': undefined, // refix it properly for the tag from description
            'type': type,
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'state')),
            'updated': updated,
            'fee': {
                'currency': code,
                'cost': feeCost,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        let statuses = {
            'COMPLETED': 'accepted',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrderStatus (status) {
        let statuses = {
            'wait': 'open',
            'closed': 'closed',
            'cancel': 'canceled',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrderStatusRe (status) {
        let statuses = {
            'open': 'wait',
            'closed': 'closed',
            'canceled': 'cancel',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'at');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let symbol = undefined;
        let marketId = this.safeString (order, 'market');
        market = this.safeValue (this.markets_by_id, marketId);
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            if (feeCurrency === undefined) {
                feeCurrency = market['quote'];
            }
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'state')),
            'symbol': symbol,
            'type': this.safeString (order, 'ord_type'),
            'side': this.safeString (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'cost': undefined,
            'average': this.safeFloat (order, 'avg_price'),
            'amount': this.safeFloat (order, 'volume'),
            'filled': this.safeFloat (order, 'executed_volume'),
            'remaining': this.safeFloat (order, 'remaining_volume'),
            'trades': this.safeInteger (order, 'trades_count'),
            'fee': {
                'currency': feeCurrency,
                'cost': undefined,
            },
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePostOrders';
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
            'volume': this.amountToPrecision (symbol, amount),
            'side': side,
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        if (type !== 'NULL' || type !== undefined) {
            request['ord_type'] = type;
        }
        let response = await this[method] (this.extend (request, params));
        let order = this.parseOrder (response, market);
        let id = this.safeString (order, 'id');
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.privatePostOrderDelete (this.extend ({
            'id': id,
        }, params));
        return this.fetchOrder (id, symbol);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOrder (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response, market);
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        let request = {
            'page': 1,
            'limit': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (status !== undefined) {
            let status = this.parseOrderStatusRe ('closed');
            request['state'] = status;
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let status = this.parseOrderStatusRe ('open');
        return await this.fetchOrdersByStatus (status, symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let status = this.parseOrderStatusRe ('closed');
        return await this.fetchOrdersByStatus (status, symbol, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        let request = {
            'limit': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['since'] = market['id'];
        }
        let response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let host = this.urls['api'][api];
        if ('incmarket' in params) {
            path = '/' + 'api' + '/' + 'v2' + '/' + path + '/' + params['incmarket'];
        } else {
            path = '/' + 'api' + '/' + 'v2' + '/' + path;
        }
        let tonce = this.nonce ();
        params['tonce'] = tonce;
        params['access_key'] = this.apiKey;
        let url = host + path;
        let sorted = this.keysort (params);
        let paramencoded = this.urlencode (sorted);
        if (method === 'POST') {
            body = paramencoded;
        } else {
            url += '?' + paramencoded;
        }
        if (api !== 'public') {
            let sign_str = method + '|' + path + '|' + paramencoded;
            let signature = this.hmac (sign_str, this.secret, 'sha256');
            sorted['signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if ('error' in response) {
            let code = this.safeInteger (response['error'], 'code');
            if (code !== undefined) {
                let error = this.safeString (response['error'], 'message');
                if (code === 2002) {
                    throw new InsufficientFunds (error);
                } else if (code === 2005 || code === 2007) {
                    throw new AuthenticationError (error);
                } else {
                    throw new ExchangeError (error);
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
};
