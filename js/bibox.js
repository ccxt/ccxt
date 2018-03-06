'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection, ExchangeNotAvailable, InvalidOrder, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bibox extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bibox',
            'name': 'Bibox',
            'countries': [ 'CN', 'US', 'KR' ],
            'version': 'v1',
            'has': {
                'CORS': false,
                'publicAPI': false,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '8h': '12hour',
                '1d': 'day',
                '1w': 'week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34902611-2be8bf1a-f830-11e7-91a2-11b2f292e750.jpg',
                'api': 'https://api.bibox.com',
                'www': 'https://www.bibox.com',
                'doc': [
                    'https://github.com/Biboxcom/api_reference/wiki/home_en',
                    'https://github.com/Biboxcom/api_reference/wiki/api_reference',
                ],
                'fees': 'https://bibox.zendesk.com/hc/en-us/articles/115004417013-Fee-Structure-on-Bibox',
            },
            'api': {
                'public': {
                    'post': [
                        // TODO: rework for full endpoint/cmd paths here
                        'mdata',
                    ],
                    'get': [
                        'mdata',
                    ],
                },
                'private': {
                    'post': [
                        'user',
                        'orderpending',
                        'transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.0,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'marketAll',
        }, params));
        let markets = response['result'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let base = market['coin_symbol'];
            let quote = market['currency_symbol'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let id = base + '_' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': undefined,
                'info': market,
                'lot': Math.pow (10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'timestamp', this.seconds ());
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            symbol = ticker['coin_symbol'] + '/' + ticker['currency_symbol'];
        }
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
            'percentage': this.safeString (ticker, 'percent'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'ticker',
            'pair': market['id'],
        }, params));
        return this.parseTicker (response['result'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'marketAll',
        }, params));
        let tickers = response['result'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = this.parseTicker (tickers[t]);
            let symbol = ticker['symbol'];
            if (symbols && (!(symbol in symbols))) {
                continue;
            }
            result[symbol] = ticker;
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['time'];
        let side = this.safeInteger (trade, 'side');
        side = this.safeInteger (trade, 'order_side', side);
        side = (side === 1) ? 'buy' : 'sell';
        if (typeof market === 'undefined') {
            let marketId = this.safeString (trade, 'pair');
            if (typeof marketId !== 'undefined')
                if (marketId in this.markets_by_id)
                    market = this.markets_by_id[marketId];
        }
        let symbol = (typeof market !== 'undefined') ? market['symbol'] : undefined;
        let fee = undefined;
        if ('fee' in trade) {
            fee = {
                'cost': this.safeFloat (trade, 'fee'),
                'currency': undefined,
            };
        }
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let size = (limit) ? limit : 200;
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'deals',
            'pair': market['id'],
            'size': size,
        }, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchOrderBook (symbol, limit = 200, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'cmd': 'depth',
            'pair': market['id'],
        };
        request['size'] = limit; // default = 200 ?
        let response = await this.publicGetMdata (this.extend (request, params));
        return this.parseOrderBook (response['result'], this.safeFloat (response['result'], 'update_time'), 'bids', 'asks', 'price', 'volume');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['time'],
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['vol'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'kline',
            'pair': market['id'],
            'period': this.timeframes[timeframe],
            'size': limit,
        }, params));
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    async fetchCurrencies (params = {}) {
        let response = await this.privatePostTransfer ({
            'cmd': 'transfer/coinList',
            'body': {},
        });
        let currencies = response['result'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['symbol'];
            let code = this.commonCurrencyCode (id);
            let precision = 8;
            let deposit = currency['enable_deposit'];
            let withdraw = currency['enable_withdraw'];
            let active = (deposit && withdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': 'ok',
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostTransfer ({
            'cmd': 'transfer/assets',
            'body': this.extend ({
                'select': 1,
            }, params),
        });
        let balances = response['result'];
        let result = { 'info': balances };
        let indexed = undefined;
        if ('assets_list' in balances) {
            indexed = this.indexBy (balances['assets_list'], 'coin_symbol');
        } else {
            indexed = {};
        }
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let used = parseFloat (balance['freeze']);
            let free = parseFloat (balance['balance']);
            let total = this.sum (free, used);
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderType = (type === 'limit') ? 2 : 1;
        let orderSide = (side === 'buy') ? 1 : 2;
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/trade',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0,
                'order_type': orderType,
                'order_side': orderSide,
                'pay_bix': 0,
                'amount': amount,
                'price': price,
            }, params),
        });
        return {
            'info': response,
            'id': this.safeString (response, 'result'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/cancelTrade',
            'body': this.extend ({
                'orders_id': id,
            }, params),
        });
        return response;
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            symbol = order['coin_symbol'] + '/' + order['currency_symbol'];
        }
        let type = (order['order_type'] === 1) ? 'market' : 'limit';
        let timestamp = order['createdAt'];
        let price = order['price'];
        let filled = this.safeFloat (order, 'deal_amount');
        let amount = this.safeFloat (order, 'amount');
        let cost = this.safeFloat (order, 'money');
        let remaining = undefined;
        if (typeof filled !== 'undefined') {
            if (typeof amount !== 'undefined')
                remaining = amount - filled;
            if (typeof cost === 'undefined')
                cost = price * filled;
        }
        let side = (order['order_side'] === 1) ? 'buy' : 'sell';
        let status = this.safeString (order, 'status');
        if (typeof status !== 'undefined')
            status = this.parseOrderStatus (status);
        let result = {
            'info': order,
            'id': this.safeString (order, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost ? cost : parseFloat (price) * filled,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': this.safeFloat (order, 'fee'),
        };
        return result;
    }

    parseOrderStatus (status) {
        let statuses = {
            // original comments from bibox:
            '1': 'pending', // pending
            '2': 'open', // part completed
            '3': 'closed', // completed
            '4': 'canceled', // part canceled
            '5': 'canceled', // canceled
            '6': 'canceled', // canceling
        };
        return this.safeString (statuses, status, status.toLowerCase ());
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        let pair = undefined;
        if (typeof symbol !== 'undefined') {
            await this.loadMarkets ();
            market = this.market (symbol);
            pair = market['id'];
        }
        let size = (limit) ? limit : 200;
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/orderPendingList',
            'body': this.extend ({
                'pair': pair,
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': size,
            }, params),
        });
        let orders = this.safeValue (response['result'], 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 200, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchClosedOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/pendingHistoryList',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': limit,
            }, params),
        });
        let orders = this.safeValue (response['result'], 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let size = (limit) ? limit : 200;
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/orderHistoryList',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': size,
            }, params),
        });
        let trades = this.safeValue (response['result'], 'items', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostTransfer ({
            'cmd': 'transfer/transferOutInfo',
            'body': this.extend ({
                'coin_symbol': currency['id'],
            }, params),
        });
        let result = {
            'info': response,
            'address': undefined,  // POINTLESS?
        };
        return result;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        if (typeof this.password === 'undefined')
            if (!('trade_pwd' in params))
                throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a trade_pwd parameter');
        if (!('totp_code' in params))
            throw new ExchangeError (this.id + ' withdraw() requires a totp_code parameter for 2FA authentication');
        let body = {
            'trade_pwd': this.password,
            'coin_symbol': currency['id'],
            'amount': amount,
            'addr': address,
        };
        if (typeof tag !== 'undefined')
            body['address_remark'] = tag;
        let response = await this.privatePostTransfer ({
            'cmd': 'transfer/transferOut',
            'body': this.extend (body, params),
        });
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        let cmds = this.json ([ params ]);
        if (api === 'public') {
            if (method !== 'GET')
                body = { 'cmds': cmds };
            else if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            body = {
                'cmds': cmds,
                'apikey': this.apiKey,
                'sign': this.hmac (this.encode (cmds), this.encode (this.secret), 'md5'),
            };
        }
        if (typeof body !== 'undefined')
            body = this.json (body, { 'convertArraysToObjects': true });
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let message = this.id + ' ' + this.json (response);
        if ('error' in response) {
            if ('code' in response['error']) {
                let code = response['error']['code'];
                if (code === '2033')
                    // \u64cd\u4f5c\u5931\u8d25\uff01\u8ba2\u5355\u5df2\u5b8c\u6210\u6216\u5df2\u64a4\u9500
                    // operation failed! Orders have been completed or revoked
                    // e.g. trying to cancel a filled order
                    throw new OrderNotFound (message);
                else if (code === '2068')
                    // \u4e0b\u5355\u6570\u91cf\u4e0d\u80fd\u4f4e\u4e8e
                    // The number of orders can not be less than
                    throw new InvalidOrder (message);
                else if (code === '3012')
                    throw new AuthenticationError (message); // invalid api key
                else if (code === '3025')
                    throw new AuthenticationError (message); // signature failed
                else if (code === '4000')
                    // \u5f53\u524d\u7f51\u7edc\u8fde\u63a5\u4e0d\u7a33\u5b9a\uff0c\u8bf7\u7a0d\u5019\u91cd\u8bd5
                    // The current network connection is unstable. Please try again later
                    throw new ExchangeNotAvailable (message);
                else if (code === '4003')
                    throw new DDoSProtection (message); // server is busy, try again later
            }
            throw new ExchangeError (message);
        }
        if (!('result' in response))
            throw new ExchangeError (message);
        if (method === 'GET') {
            return response;
        } else {
            return response['result'][0];
        }
    }
};
