'use strict';

//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class excraft extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'excraft',
            'name': 'ExCraft',
            'countries': ['HK', 'UK'],
            'has': {
                'fetchOrder': true,
                'fetchTickers': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://www.excraft.com/static/images/excraft_2480.png',
                'api': {
                    'rest': 'https://www.excraft.com/apis/trading/v1',
                },
                'www': 'https://www.excraft.com',
                'doc': 'https://github.com/ExCraftExchange/ExCraftExchange-REST-API',
                'fees': 'https://www.excraft.com/faq/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{market}/status_today',
                        'markets/status_today',
                        'markets/{market}/trades',
                        'markets/{market}/depth',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'markets/{market}/finished_orders',
                        'markets/{market}/pending_orders',
                        'markets/{market}/finished_orders/{order_id}',
                    ],
                    'post': [
                        'markets/{market}/limit_order',
                        'markets/{market}/market_order',
                        'markets/{market}/orders/{order_id}/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0005,
                        'ETH': 0.01,
                        'BCH': 0.0001,
                        'LTC': 0.001,
                        'HSR': 0.001,
                        'EOS': 0.1,
                        'EXT': 500,
                        'OMG': 1,
                        'ZRX': 10,
                        'BAT': 20,
                        'KNC': 10,
                        'BNT': 2,
                        'MANA': 50,
                        'CTXC': 20,
                        'REP': 0.2,
                        'GNT': 20,
                        'LRC': 50,
                        'ENG': 5,
                        'NPXS': 2000,
                        'PAY': 5,
                        'HC': 0.2,
                        'USDT': 3,
                    },
                },
            },
            'exceptions': {
            },
            'errorMessages': {
            },
            'options': {
                'quoteIds': ['btc', 'eth', 'usdt'],
            },
        });
    }

    async fetchMarkets () {
        let data = await this.publicGetMarkets ();
        let result = [];
        for (let i = 0; i < data['markets'].length; i++) {
            let item = data['markets'][i];
            let baseId = item['base'];
            let quoteId = item['quote'];
            let market = item['name'];
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            let symbol = base + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': baseId + quoteId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
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
        return result;
    }

    parse_ticker (ticker, symbol, market = undefined) {
        let timestamp = this.milliseconds () / 1000;
        let close = this.safeFloat (ticker, 'last');
        let open = this.safeFloat (ticker, 'open');
        let percentage = 0;
        let average = 0;
        let change = 0;
        if (open !== undefined && close !== undefined) {
            let change = close - open;
            average = (open + close) / 2;
            if (close !== undefined && close > 0) {
                percentage = (change / open) * 100;
            }
        }
        let baseVolume = this.safeFloat (ticker, 'volume');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp * 1000),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'last'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'last'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = []) {
        symbol = symbol.replace ('/', '').toUpperCase ();
        let ticker = await this.publicGetMarketsMarketStatusToday (this.extend ({
            'market': symbol,
        }, params));
        return this.parse_ticker (ticker, symbol);
    }

    async fetchTickers (symbols = undefined, params = []) {
        let data = await this.publicGetMarketsStatusToday ();
        let result = {};
        let tickers = data['markets'];
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            result[ticker['name']] = this.parse_ticker (ticker, ticker['name']);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = []) {
        symbol = symbol.replace ('/', '').toUpperCase ();
        let orderbook = await this.publicGetMarketsMarketDepth (this.extend ({
            'market': symbol,
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parse_trade_type (type) {
        if (type === 1)
            return 'sell';
        else
            return 'buy';
    }

    parse_trade (trade, market = undefined) {
        let timestamp = this.milliseconds ();
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let symbol = market;
        let cost = amount * price;
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp * 1000),
            'symbol': symbol,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'type': 'limit',
            'side': this.parse_trade_type (trade['side']),
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = []) {
        symbol = symbol.replace ('/', '').toUpperCase ();
        let data = await this.publicGetMarketsMarketTrades (this.extend ({
            'market': symbol,
        }, params));
        let result = [];
        let trades = data['trades'];
        if (trades == null) {
            return [];
        }
        for (let i = 0; i < trades.length; i++) {
            let trade = trades[i];
            trade = this.parse_trade (trade, symbol);
            result.push (trade);
        }
        result = this.sort_by (result, 'timestamp');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetBalances ();
        let balances = response['balances'];
        let result = { 'info': balances };
        let keys = Object.getOwnPropertyNames (balances);
        for (let i = 0; i < keys.length; i++) {
            let value = balances[keys[i]];
            let account = {
                'free': parseFloat (value['available']),
                'used': parseFloat (value['holds']),
                'total': parseFloat (value['available']) + parseFloat (value['holds']),
            };
            result[keys[i]] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        symbol = symbol.replace ('/', '').toUpperCase ();
        let response = {};
        if (side === 'buy')
            side = 2;
        else
            side = 1;
        if (type === 'limit') {
            params = this.extend ({
                'market': symbol,
                'side': side,
                'amount': amount + '',
                'price': price + '',
            }, params);
            response = await this.privatePostMarketsMarketLimitOrder (params);
        } else {
            response = await this.privatePostMarketsMarketMarketOrder (this.extend ({
                'market': symbol,
                'side': side,
                'amount': amount,
            }, params));
        }
        return {
            'info': response,
            'id': response['order']['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        symbol = symbol.replace ('/', '').toUpperCase ();
        let response = await this.privatePostMarketsMarketOrdersOrderIdCancel (this.extend ({
            'market': symbol,
            'order_id': id,
        }, params));
        return response;
    }

    parseQuote (market = undefined) {
        let iStartIndex = market.indexOf ('/');
        return market.substring (iStartIndex + 1);
    }

    parseOrderType (type) {
        return type === 2 ? 'limit' : 'market';
    }

    parseOrderSide (side) {
        return side === 1 ? 'sell' : 'buy';
    }

    parseOrderState (type, remaining) {
        if (type === 2 && remaining === 0) {
            return 'closed';
        } else if (type === 2 && remaining !== 0) {
            return 'open';
        } else {
            return 'closed';
        }
    }

    parseOrder (order, market = undefined) {
        let symbol = market.replace ('/', '').toUpperCase ();
        let timestamp = parseInt (order['created_at']);
        let price = this.safeFloat (order, 'price');
        let cost = this.safeFloat (order, 'exec_quote');
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'exec_base', 0.0);
        let remaining = amount - filled;
        let type = parseInt (order['type']);
        let status = this.parseOrderState (type, remaining);
        let fee = undefined;
        if (order['fee'] !== undefined) {
            fee = {
                'cost': this.safeFloat (order, 'fee'),
                'currency': this.parseQuote (market),
            };
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp * 1000),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': this.parseOrderType (order['type']),
            'side': this.parseOrderSide (order['side']),
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    async fetchOrder (id, market = undefined, params = {}) {
        let symbol = market.replace ('/', '').toUpperCase ();
        let order = await this.privateGetMarketsMarketFinishedOrdersOrderId (this.extend ({
            'market': symbol,
            'order_id': id,
        }, params));
        return this.parseOrder (order['order'], market);
    }

    async fetchOrders (market = undefined, since = undefined, limit = undefined, params = {}) {
        let symbol = market.replace ('/', '').toUpperCase ();
        if (params === undefined)
            params = {
                'start_time': 0,
                'end_time': 0,
            };
        else {
            if (params['start_time'] === undefined)
                params['start_time'] = 0;
            if (params['end_time'] === undefined)
                params['end_time'] = 0;
            if (params['side'] === undefined)
                params['side'] = 0;
            else {
                if (params['side'] === 'buy')
                    params['side'] = 2;
                else
                    params['side'] = 1;
            }
        }
        let newParams = this.extend ({
            'market': symbol,
            'offset': since === undefined ? 0 : since,
            'limit': limit === undefined ? 20 : limit,
        }, params);
        // resort params
        let finalParams = {
            'market': newParams['market'],
            'start_time': newParams['start_time'],
            'end_time': newParams['end_time'],
            'offset': newParams['offset'],
            'limit': newParams['limit'],
            'side': newParams['side'],
        };
        let orders = await this.privateGetMarketsMarketFinishedOrders (finalParams);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (market = undefined, since = undefined, limit = undefined, params = {}) {
        let symbol = market.replace ('/', '').toUpperCase ();
        let newParams = {
            'market': symbol,
            'offset': since === undefined ? 0 : since,
            'limit': limit === undefined ? 20 : limit,
        };
        let orders = await this.privateGetMarketsMarketPendingOrders (newParams);
        return this.parseOrders (orders, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    getParams (params = {}) {
        let string = '';
        let keys = Object.getOwnPropertyNames (params);
        for (let i = 0; i < keys.length; i++) {
            string += keys[i] + '=' + params[keys[i]] + '&';
        }
        string = string.substr (0, string.length - 1);
        return string;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let apiType = 'rest';
        if (api === 'web') {
            apiType = api;
        }
        let url = this.urls['api'][apiType] + '/' + this.implodeParams (path, params);
        let query = params;
        if (api === 'public' || api === 'web') {
            if (api === 'web')
                query['t'] = this.nonce ();
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            // let secret = this.hash (this.encode (this.secret));
            params = this.extend (params, {
                'app_key': this.apiKey,
            });
            let plainttext = this.getParams (params);
            let signature = this.hmac (plainttext, this.secret, 'sha256');
            if (method === 'GET') {
                url += '?' + this.urlencode (query);
                body = {};
            } else {
                body = JSON.stringify (query);
            }
            headers = {
                'Content-type': 'text/plain',
                'app_key': this.apiKey,
                'sign': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
