'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tidebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tidebit',
            'name': 'TideBit',
            'countries': [ 'HK' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'fetchDepositAddress': true,
                'CORS': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/39034921-e3acf016-4480-11e8-9945-a6086a1082fe.jpg',
                'api': 'https://www.tidebit.com',
                'www': 'https://www.tidebit.com',
                'doc': [
                    'https://www.tidebit.com/documents/api/guide',
                    'https://www.tidebit.com/swagger/#/default',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'tickers/{market}',
                        'timestamp',
                        'trades',
                        'trades/{market}',
                        'order_book',
                        'order',
                        'k_with_pending_trades',
                        'k',
                        'depth',
                    ],
                    'post': [],
                },
                'private': {
                    'get': [
                        'addresses/{address}',
                        'deposits/history',
                        'deposits/get_deposit',
                        'deposits/deposit_address',
                        'historys/orders',
                        'historys/vouchers',
                        'historys/accounts',
                        'historys/snapshots',
                        'linkage/get_status',
                        'members/me',
                        'order',
                        'orders',
                        'partners/orders/{id}/trades',
                        'referral_commissions/get_undeposited',
                        'referral_commissions/get_graph_data',
                        'trades/my',
                        'withdraws/bind_account_list',
                        'withdraws/get_withdraw_account',
                        'withdraws/fetch_bind_info',
                    ],
                    'post': [
                        'deposits/deposit_cash',
                        'favorite_markets/update',
                        'order/delete',
                        'orders',
                        'orders/multi',
                        'orders/clear',
                        'referral_commissions/deposit',
                        'withdraws/apply',
                        'withdraws/bind_bank',
                        'withdraws/bind_address',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'withdraw': {}, // There is only 1% fee on withdrawals to your bank account.
                },
            },
            'exceptions': {
                '2002': InsufficientFunds,
                '2003': OrderNotFound,
            },
        });
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privateGetDepositAddress (this.extend ({
            'currency': currency['id'],
        }, params));
        if ('success' in response) {
            if (response['success']) {
                let address = this.safeString (response, 'address');
                let tag = this.safeString (response, 'addressTag');
                return {
                    'currency': code,
                    'address': this.checkAddress (address),
                    'tag': tag,
                    'info': response,
                };
            }
        }
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['id'];
            let symbol = market['name'];
            let [ baseId, quoteId ] = symbol.split ('/');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetMembersMe ();
        let balances = response['accounts'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currencyId = balance['currency'];
            let code = currencyId.toUpperCase ();
            if (currencyId in this.currencies_by_id)
                code = this.currencies_by_id[currencyId]['code'];
            let account = {
                'free': parseFloat (balance['balance']),
                'used': parseFloat (balance['locked']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (limit === undefined)
            request['limit'] = limit; // default = 300
        request['market'] = market['id'];
        let orderbook = await this.publicGetDepth (this.extend (request, params));
        let timestamp = orderbook['timestamp'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['at'] * 1000;
        ticker = ticker['ticker'];
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'previousClose': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let base = id.slice (0, 3);
                let quote = id.slice (3, 6);
                base = base.toUpperCase ();
                quote = quote.toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTickersMarket (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        return {
            'id': trade['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'volume'),
            'cost': this.safeFloat (trade, 'funds'),
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (limit === undefined)
            limit = 30; // default is 30
        let request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined) {
            request['timestamp'] = since;
        } else {
            request['timestamp'] = 1800000;
        }
        let response = await this.publicGetK (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            let marketId = order['market'];
            symbol = this.markets_by_id[marketId]['symbol'];
        }
        let timestamp = this.parse8601 (order['created_at']);
        let state = order['state'];
        let status = undefined;
        if (state === 'done') {
            status = 'closed';
        } else if (state === 'wait') {
            status = 'open';
        } else if (state === 'cancel') {
            status = 'canceled';
        }
        return {
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': order['ord_type'],
            'side': order['side'],
            'price': this.safeFloat (order, 'price'),
            'amount': this.safeFloat (order, 'volume'),
            'filled': this.safeFloat (order, 'executed_volume'),
            'remaining': this.safeFloat (order, 'remaining_volume'),
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'market': this.marketId (symbol),
            'side': side,
            'volume': amount.toString (),
            'ord_type': type,
        };
        if (type === 'limit') {
            request['price'] = price.toString ();
        }
        let response = await this.privatePostOrders (this.extend (request, params));
        let market = this.markets_by_id[response['market']];
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePostOrderDelete ({ 'id': id });
        let order = this.parseOrder (result);
        let status = order['status'];
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let id = this.safeString (params, 'id');
        if (id === undefined) {
            throw new ExchangeError (this.id + ' withdraw() requires an extra id param (withdraw account id according to withdraws/bind_account_list endpoint');
        }
        let request = {
            'id': id,
            'currency_type': 'coin', // or 'cash'
            'currency': currency.toLowerCase (),
            'body': amount,
            // 'address': address, // they don't allow withdrawing to direct addresses?
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        let result = await this.privatePostWithdrawsApply (this.extend (request, params));
        return {
            'info': result,
            'id': undefined,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    encodeParams (params) {
        return this.urlencode (this.keysort (params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + 'api/' + this.version + '/' + this.implodeParams (path, params) + '.json';
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let sortedByKey = this.keysort (this.extend ({
                'access_key': this.apiKey,
                'tonce': nonce,
            }, params));
            let query = this.urlencode (sortedByKey);
            let payload = method + '|' + request + '|' + query;
            let signature = this.hmac (this.encode (payload), this.encode (this.secret));
            let suffix = query + '&signature=' + signature;
            if (method === 'GET') {
                url += '?' + suffix;
            } else {
                body = suffix;
                headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code === 400) {
            const error = this.safeValue (response, 'error');
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            const exceptions = this.exceptions;
            if (errorCode in exceptions) {
                throw new exceptions[errorCode] (feedback);
            }
            // fallback to default error handler
        }
    }
};
