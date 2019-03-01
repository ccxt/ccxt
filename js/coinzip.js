'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinzip extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinzip',
            'name': 'Coinzip',
            'countries': ['PH', 'KR', 'JP', 'SG', 'AU'],
            'rateLimit': 400,
            'version': 'v2',
            'has': {
                'CORS': false,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTicker': true,
                'fetchOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchMyTrades': true,
                'fetchTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/coinzip.logo.jpg',
                'api': 'https://coinzip.co',
                'www': 'https://coinzip.co',
                'documents': 'https://coinzip.co/documents/api_v2'
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true
            },
            'api': {
                'public': {
                    'get': [
                        'api/v2/markets',
                        'api/v2/tickers',
                        'api/v2/tickers/{market}',
                        'api/v2/order_book',
                        'api/v2/depth',
                        'api/v2/trades',
                        'api/v2/k',
                        'api/v2/k_with_pending_trades',
                        'api/v2/timestamp'
                    ]
                },
                'private': {
                    'get': [
                        'api/v2/members/me',
                        'api/v2/deposits',
                        'api/v2/deposit/id',
                        'api/v2/orders',
                        'api/v2/orders/{id}',
                        'api/v2/orders/summary',
                        'api/v2/trades/my',
                    ],
                    'post': [
                        'api/v2/orders',
                        'api/v2/orders/multi',
                        'api/v2/orders/clear',
                        'api/v2/order/delete'
                    ]
                }
            }
        });
    }

    async fetchTickers (params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetApiV2Tickers (params);
        return Object.keys(tickers).reduce((obj, k) => {
            const { at, ticker } = tickers[k];
            const timestamp = at * 1000;
            const { symbol } = Object
                .keys (this.markets)
                .map (m => this.markets[m])
                .find (m => m.id === k.toUpperCase ());

            return {
                [symbol]: {
                    'symbol': symbol,
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                    'high': ticker.high,
                    'low': ticker.low,
                    'bid': undefined,
                    'bidVolume': undefined,
                    'ask': undefined,
                    'askVolume': undefined,
                    'vwap': undefined,
                    'open': undefined,
                    'close': ticker.last,
                    'last': ticker.last,
                    'previousClose': undefined,
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': undefined,
                    'quoteVolume': undefined,
                    'info': tickers[k],
                }
            }
        }, {});
    }

    async fetchTicker (symbol, params = {}) {
        const market = symbol.replace ('/', '').toLowerCase ();
        const tickerObj = await this.publicGetApiV2TickersMarket ({ market });
        const { at, ticker } = tickerObj;
        const timestamp = at * 1000;

        return  {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker.high,
            'low': ticker.low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': ticker.last,
            'last': ticker.last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': tickerObj,
        }
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetApiV2Markets (params);

        return markets.map(m => ({
            'id': m.id.toUpperCase (),
            'symbol': m.name,
            'base': m.base_unit.toUpperCase (),
            'quote': m.quote_unit.toUpperCase (),
            'baseId': m.base_unit,
            'quoteId': m.quote_unit,
            'info': m,
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            }
        }));
    }

    async fetchOrderBook (symbol, limit = 30, params = {}) {
        const market = symbol.replace ('/', '').toLowerCase ();
        const orderbook = await this.publicGetApiV2OrderBook (this.extend ({
            'market': market,
            'asks_limit': limit,
            'bids_limit': limit
        }, params));

        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'volume');
    }

    async fetchOHLCV (symbol, period = 1, timestamp = undefined, limit = undefined, params = {}) {
        const market = symbol.replace ('/', '').toLowerCase ();
        const query = this.extend ({ market, period, timestamp, limit}, params)
        return await this.publicGetApiV2K(query)
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const market = symbol.replace ('/', '').toLowerCase ();
        const trades = await this.publicGetApiV2Trades (this.extend ({
            'market': market,
            'timestamp': since,
            'limit': limit
        }, params));

        return this.parseTrades (trades, symbol, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (trade['created_at']);
        return {
            'id': trade.id.toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market,
            'type': undefined,
            'side': trade.side || undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'volume'),
            'cost': this.safeFloat (trade, 'funds'),
            'info': trade,
        };
    }

    async fetchBalance (params = {}) {
        const { accounts: balances } = await this.privateGetApiV2MembersMe ();
        const mappedBalances = balances.reduce((obj, { balance, locked, currency }) => {
            const free = parseFloat (balance);
            const used = parseFloat (locked);

            obj[currency.toUpperCase()] = {
                free,
                used,
                total: this.sum (free, used)
            };

            return obj;
        }, {});
        const result = {
            info: balances,
            ...mappedBalances
        };

        return this.parseBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        if ('extension' in this.urls)
            request += this.urls['extension'];
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.now ();
            let query = this.encodeParams (this.extend ({
                'access_key': this.apiKey,
                'tonce': nonce,
            }, params));
            let auth = method + '|' + request + '|' + query;
            let signed = this.hmac (this.encode (auth), this.encode (this.secret));
            let suffix = query + '&signature=' + signed;
            if (method === 'GET') {
                url += '?' + suffix;
            } else {
                body = suffix;
                headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    encodeParams (params) {
        if ('orders' in params) {
            let orders = params['orders'];
            let query = this.urlencode (this.keysort (this.omit (params, 'orders')));
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let keys = Object.keys (order);
                for (let k = 0; k < keys.length; k++) {
                    let key = keys[k];
                    let value = order[key];
                    query += '&orders%5B%5D%5B' + key + '%5D=' + value.toString ();
                }
            }
            return query;
        }
        return this.urlencode (this.keysort (params));
    }
};

