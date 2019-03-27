'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, OrderNotFound, ExchangeNotAvailable, InvalidOrder, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class ceo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ceo',
            'name': 'CEO',
            'countries': [ 'CN' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchOHLCV': true,
                'fetchTickers': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'exceptions': {
                '1001': ExchangeError,
                '1002': ExchangeError,
                '1003': AuthenticationError,
                '1004': ExchangeNotAvailable,
                '1005': ExchangeNotAvailable,
                '1006': PermissionDenied,
                '1007': ExchangeError,
                '1008': AuthenticationError,
            },
            'urls': {
                'api': 'https://ceo.bi/api',
                'www': 'https://ceo.bi',
                'doc': 'https://ceo.bi/api/doc',
            },
            'api': {
                'public': {
                    'get': [
                        'market/markets',
                        'market/allTicker',
                        'market/ticker',
                        'market/entrust',
                        'market/trades',
                        'market/kline',
                    ],
                },
                'private': {
                    'get': [
                        'deal/accountInfo',
                        'deal/order',
                        'deal/cancelOrder',
                        'deal/getOrder',
                        'deal/getOrders',
                        'deal/getTrades',
                        'deal/getUserAddress',
                        'deal/getWithdrawAddress',
                        'deal/getWithdrawRecord',
                        'deal/getChargeRecord',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetMarketMarkets ();
        let markets = response['data'];
        let keys = Object.keys (markets);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let market = markets[id];
            let [ baseId, quoteId ] = id.split ('_');
            let base = this.commonCurrencyCode (baseId.toUpperCase ());
            let quote = this.commonCurrencyCode (quoteId.toUpperCase ());
            let symbol = base + '/' + quote;
            let precision = {
                'amount': market['amountScale'],
                'price': market['priceScale'],
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -parseInt (precision['amount'])),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -parseInt (precision['price'])),
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetDealAccountInfo (params);
        let balances = response['data']['coins'];
        let result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let account = this.account ();
            let currency = balance['key'];
            if (currency in this.currencies_by_id)
                currency = this.currencies_by_id[currency]['code'];
            else
                currency = this.commonCurrencyCode (balance['enName']);
            account['free'] = parseFloat (balance['available']);
            account['used'] = parseFloat (balance['freez']);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privateGetDealGetUserAddress ({
            'currency': currency['id'],
        });
        let data = response['data'];
        let tag = undefined;
        if (data['memo']) {
            tag = data['memo'];
        }
        return {
            'currency': code,
            'address': data['address'],
            'tag': tag,
            'info': response,
        };
    }

    getMarketFieldName () {
        return 'market';
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let response = await this.publicGetMarketEntrust (this.extend (request, params));
        let orderbook = {
            'bids': response['data']['b'],
            'asks': response['data']['s'],
        };
        return this.parseOrderBook (orderbook);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketAllTicker (params);
        let result = {};
        let ids = Object.keys (response['data']);
        for (let i = 0; i < ids.length; i++) {
            let market = this.marketsById[ids[i]];
            result[market['symbol']] = this.parseTicker (response['data'][ids[i]], market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let response = await this.publicGetMarketTicker (this.extend (request, params));
        let ticker = response['data'];
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
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
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (limit === undefined)
            limit = 1000;
        let request = {
            'market': market['id'],
            'type': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined)
            request['since'] = since;
        let response = await this.publicGetMarketKline (this.extend (request, params));
        let klines = this.safeValue (response['data'], 'data', []);
        let data = [];
        for (let i = 0; i < klines.length; i++) {
            let kline = [
                klines[i][0],
                klines[i][2],
                klines[i][3],
                klines[i][4],
                klines[i][5],
                klines[i][1],
            ];
            data.push (kline);
        }
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['time'] * 1000;
        let side = (trade['type'] === 1) ? 'buy' : 'sell';
        return {
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let response = await this.publicGetMarketTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new InvalidOrder (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let order = {
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            'tradeType': (side === 'buy') ? '1' : '2',
            'currency': this.marketId (symbol),
        };
        let response = await this.privateGetDealOrder (this.extend (order, params));
        return {
            'info': response['data'],
            'id': response['data']['orderId'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        order = this.extend (order, params);
        return await this.privateGetDealCancelOrder (order);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        await this.loadMarkets ();
        let order = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        order = this.extend (order, params);
        let response = await this.privateGetDealGetOrder (order);
        return this.parseOrder (response['data'], undefined);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + 'fetchOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'currency': market['id'],
            'pageIndex': 1,
            'pageSize': limit,
        };
        let response = undefined;
        try {
            response = await this.privateGetDealGetOrders (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + 'fetchOpenOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'currency': market['id'],
            'pageIndex': 1,
            'pageSize': limit,
        };
        let response = undefined;
        try {
            response = await this.privateGetDealGetOrders (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        return this.parseOrders (response['data'], market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let side = (order['type'] === 1) ? 'buy' : 'sell';
        let type = 'limit';
        let timestamp = undefined;
        let createDateField = this.getCreateDateField ();
        if (createDateField in order)
            timestamp = order[createDateField];
        let createTimeField = this.getCreateTimeField ();
        if (createTimeField in order)
            timestamp = order[createTimeField];
        let symbol = undefined;
        if ('currency' in order) {
            market = this.marketsById[order['currency']];
        }
        if (market) {
            symbol = market['symbol'];
        }
        let price = order['price'];
        let filled = order['trade_amount'];
        let amount = order['total_amount'];
        let remaining = amount - filled;
        let cost = this.safeFloat (order, 'trade_money');
        let average = undefined;
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        if ((cost !== undefined) && (filled !== undefined) && (filled > 0)) {
            average = cost / filled;
        }
        let result = {
            'info': order,
            'id': order['id'],
            'timestamp': timestamp * 1000,
            'datetime': this.iso8601 (timestamp * 1000),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    getCreateDateField () {
        return 'trade_date';
    }

    getCreateTimeField () {
        return 'trade_time';
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'open',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        if (api === 'public') {
            url += '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let query = this.keysort (this.extend ({
                'method': path.split ('/')[1],
                'accesskey': this.apiKey,
                'reqTime': this.nonce ().toString (),
            }, params));
            query = this.rawencode (query);
            let signature = this.hmac (query, this.secret, 'md5');
            url += '/' + path + '?' + query + '&sign=' + signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return;
        if (body.length < 2)
            return;
        if (body[0] === '{') {
            let feedback = this.id + ' ' + this.json (response);
            if ('code' in response) {
                let code = this.safeString (response, 'code');
                if (code in this.exceptions) {
                    let ExceptionClass = this.exceptions[code];
                    throw new ExceptionClass (feedback);
                } else if (code !== '1000') {
                    throw new ExchangeError (feedback);
                }
            }
            let result = this.safeValue (response, 'data');
            if (result !== undefined) {
                if (!result) {
                    let message = this.safeString (response, 'message');
                    if (message === '撤销成功') {
                        return;
                    }
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
