'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bigone extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bigone',
            'name': 'BigONE',
            'countries': 'GB',
            'has': {
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://p14.zdassets.com/hc/settings_assets/2042110/115000083534/FxqlPvZoc8SvIhRfAju5Vg-BigONE.jpg',
                'api': 'https://api.big.one',
                'www': 'https://big.one/',
                'doc': 'https://developer.big.one/',
                'fees': 'https://help.big.one/hc/en-us/articles/115001933374-BigONE-Fee-Policy',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{symbol}',
                        'markets/{symbol}/book',
                        'markets/{symbol}/trades',
                        'orders',
                        'orders/{id}',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{currency}',
                        'withdrawals',
                        'deposits',
                    ],
                    'post': [
                        'orders',
                        'orders/cancel',
                        'withdrawals',
                    ],
                    'delete': [
                        'orders/{id}',
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
                        'BTC': 0.002,
                        'ETH': 0.01,
                        'EOS': 0.01,
                        'ZEC': 0.002,
                        'LTC': 0.01,
                        'QTUM': 0.01,
                        // 'INK': 0.01 QTUM,
                        // 'BOT': 0.01 QTUM,
                        'ETC': 0.01,
                        'GAS': 0.0,
                        'BTS': 1.0,
                        'GXS': 0.1,
                        'BITCNY': 1.0,
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let base = this.commonCurrencyCode (market['quote']);
            let quote = this.commonCurrencyCode (market['base']);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let lot = Math.pow (10, -precision['amount']);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'lot': lot,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': parseInt (market['base_min']),
                        'max': parseInt (market['base_max']),
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

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': undefined,
            'ask': undefined,
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': parseFloat (ticker['close']),
            'first': undefined,
            'last': parseFloat (ticker['price']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketsSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response['ticker'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetMarkets (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['symbol'];
            let market = this.marketsById[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker['ticker'], market);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetMarketsSymbolBook (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let symbol = market['symbol'];
        let cost = this.costToPrecision (symbol, price * amount);
        let side = trade['trade_side'] === 'ASK' ? 'sell' : 'buy';
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'trade_id'),
            'order': undefined,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.publicGetMarketsSymbolTrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccounts (params);
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let id = balance['account_type'];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['active_balance']),
                'used': parseFloat (balance['frozen_balance']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let marketId = this.safeString (order, 'order_market');
        let symbol = undefined;
        if (marketId && !market && (marketId in this.marketsById)) {
            market = this.marketsById[marketId];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = this.parse8601 (order['created_at']);
        let price = parseFloat (order['price']);
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'filled_amount');
        let remaining = amount - filled;
        let status = this.safeString (order, 'order_state');
        if (status === 'filled') {
            status = 'closed';
        }
        let side = this.safeInteger (order, 'order_side');
        if (side === 'BID') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        return {
            'id': this.safeString (order, 'order_id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': order['order_type'].toLowerCase (),
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrders (this.extend ({
            'order_market': market['id'],
            'order_side': (side === 'buy' ? 'BID' : 'ASK'),
            'amount': amount,
            'price': price,
        }, params));
        // TODO: what's the response here actually
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let result = await this.privateDeleteOrdersId (this.extend ({
            'id': id,
        }, params));
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // TODO: check if it's for open orders only
        let request = {
            'market': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let orders = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (limit) {
            request['limit'] = limit;
        }
        let trades = await this.privateGetTrades (this.extend (request, params));
        return this.parseTrades (trades['trade_history'], market, since, limit);
    }

    async fetchDepositAddress (currencyCode, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (currencyCode);
        let response = await this.privateGetAccountsCurrency (this.extend ({
            'currency': currency['id'],
        }, params));
        let address = this.safeString (response, 'public_key');
        let status = address ? 'ok' : 'none';
        return {
            'currency': currencyCode,
            'address': address,
            'status': status,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'withdrawal_type': currency['id'],
            'address': address,
            'amount': amount,
            // 'fee': 0.0,
            // 'asset_pin': 'YOUR_ASSET_PIN',
        };
        if (tag) {
            // probably it's not the same
            request['label'] = tag;
        }
        let result = await this.privatePostWithdrawals (this.extend (request, params));
        return {
            'info': result,
            'id': undefined,
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
            headers = {
                'Authorization': 'Bearer ' + this.secret,
                'Big-Device-Id': this.apiKey,
            };
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let error = this.safeValue (response, 'error');
        let data = this.safeValue (response, 'data');
        if (error || !data) {
            let code = this.safeInteger (error, 'code');
            let errorClasses = {
                '401': AuthenticationError,
            };
            let message = this.safeString (error, 'description', 'Error');
            let ErrorClass = this.safeString (errorClasses, code, ExchangeError);
            throw new ErrorClass (message);
        }
        return data;
    }
};
