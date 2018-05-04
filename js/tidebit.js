'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tidebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tidebit',
            'name': 'TideBit',
            'countries': 'HK',
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
                'api': 'https://www.tidebit.com/api',
                'www': 'https://www.tidebit.com',
                'doc': 'https://www.tidebit.com/documents/api_v2',
            },
            'api': {
                'public': {
                    'get': [
                        'v2/markets', // V2MarketsJson
                        'v2/tickers', // V2TickersJson
                        'v2/tickers/{market}', // V2TickersMarketJson
                        'v2/trades', // V2TradesJson
                        'v2/trades/{market}', // V2TradesMarketJson
                        'v2/order_book', // V2OrderBookJson
                        'v2/order', // V2OrderJson
                        'v2/k_with_pending_trades', // V2KWithPendingTradesJson
                        'v2/k', // V2KJson
                        'v2/depth', // V2DepthJson
                    ],
                    'post': [],
                },
                'private': {
                    'get': [
                        'v2/deposits', // V2DepositsJson
                        'v2/deposit_address', // V2DepositAddressJson
                        'v2/deposit', // V2DepositJson
                        'v2/members/me', // V2MembersMeJson
                        'v2/addresses/{address}', // V2AddressesAddressJson
                    ],
                    'post': [
                        'v2/order/delete', // V2OrderDeleteJson
                        'v2/order', // V2OrderJson
                        'v2/order/multi', // V2OrderMultiJson
                        'v2/order/clear', // V2OrderClearJson
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
        let response = await this.privateGetV2DepositAddress (this.extend ({
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
                    'status': 'ok',
                    'info': response,
                };
            }
        }
    }

    async fetchMarkets () {
        let markets = await this.publicGetV2Markets ();
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
        let response = await this.privateGetV2Deposits ();
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
        if (typeof limit === 'undefined')
            request['limit'] = limit; // default = 300
        request['market'] = market['id'];
        let orderbook = await this.publicGetV2Depth (this.extend (request, params));
        let timestamp = orderbook['timestamp'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['at'] * 1000;
        ticker = ticker['ticker'];
        let symbol = undefined;
        if (typeof market !== 'undefined')
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
        let tickers = await this.publicGetV2Tickers (params);
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
        let response = await this.publicGetV2TickersMarket (this.extend ({
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
        let response = await this.publicGetV2Trades (this.extend ({
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
        if (!limit)
            limit = 30; // default is 30
        let request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
            'limit': limit,
        };
        if (typeof since !== 'undefined') {
            request['timestamp'] = since;
        } else {
            request['timestamp'] = 1800000;
        }
        let response = await this.publicGetV2K (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market) {
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
            'price': parseFloat (order['price']),
            'amount': parseFloat (order['volume']),
            'filled': parseFloat (order['executed_volume']),
            'remaining': parseFloat (order['remaining_volume']),
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'market': this.marketId (symbol),
            'side': side,
            'volume': amount.toString (),
            'ord_type': type,
        };
        if (type === 'limit') {
            order['price'] = price.toString ();
        }
        let response = await this.privatePostV2Order (this.extend (order, params));
        let market = this.markets_by_id[response['market']];
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePostV2OrderDelete ({ 'id': id });
        let order = this.parseOrder (result);
        let status = order['status'];
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let result = await this.privatePostWithdraw (this.extend ({
            'currency': currency.toLowerCase (),
            'sum': amount,
            'address': address,
        }, params));
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
        let request = this.implodeParams (path, params) + '.json';
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let query = this.urlencode (this.extend ({
                'access_key': this.apiKey,
                'tonce': nonce,
            }, params));
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

    handleErrors (code, reason, url, method, headers, body) {
        if (code === 400) {
            const response = JSON.parse (body);
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
