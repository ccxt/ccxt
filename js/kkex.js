'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kkex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kkex',
            'name': 'Kkex',
            'countries': [ 'CN', 'US', 'JA' ],
            'version': 'v1',
            'has': {
                'CORS': false,
                'publicAPI': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchFundingFees': false,
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'createMarketOrder': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '8h': '12hour',
                '1d': 'day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/12462602/39745941-70adc518-52db-11e8-8e21-94778cb3c7ca.jpg',
                'api': {
                    'public': 'http://kkex.vip/api/v1',
                    'private': 'http://kkex.vip/api/v2',
                },
                'www': 'http://kkex.vip',
                'doc': [
                    'http://kkex.vip/api_wiki/cn/',
                ],
                'fees': 'https://intercom.help/kkex/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'products',
                        'assets',
                        'tickers',
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                        'exchange_rate',
                    ],
                    'post': [
                        'process_strategy',
                    ],
                },
                'private': {
                    'get': [],
                    'post': [
                        'profile',
                        'userinfo',
                        'trade',
                        'batch_trade',
                        'cancel_order',
                        'cancel_all_orders',
                        'order_info',
                        'orders_info',
                        'order_history',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'options': {
                'lastNonceTimestamp': 0,
            },
            'exceptions': {
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        let tickers = await this.publicGetTickers (params);
        tickers = tickers['tickers'];
        let products = await this.publicGetProducts (params);
        products = products['products'];
        let markets = [];
        for (let k = 0; k < tickers.length; k++) {
            let keys = Object.keys (tickers[k]);
            markets.push (keys[0]);
        }
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let id = markets[i];
            let market = markets[i];
            let baseId = '';
            let quoteId = '';
            for (let j = 0; j < products.length; j++) {
                let p = products[j];
                if (p['mark_asset'] + p['base_asset'] === market) {
                    quoteId = p['base_asset'];
                    baseId = p['mark_asset'];
                }
            }
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['date'] * 1000;
        let symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
        ticker = ticker['ticker'];
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

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let response = await this.publicGetTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        let t = {
            'ticker': response['ticker'],
            'symbol': symbol,
            'date': response['date'],
        };
        return this.parseTicker (t, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickers (params);
        let tickers = response['tickers'];
        let date = response['date'];
        let ids = [];
        for (let k = 0; k < tickers.length; k++) {
            let keys = Object.keys (tickers[k]);
            ids.push (keys[0]);
        }
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[i][id];
            let t = {
                'ticker': ticker,
                'symbol': symbol,
                'date': date,
            };
            result[symbol] = this.parseTicker (t, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetDepth (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (response);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['date']) * 1000;
        let datetime = this.iso8601 (timestamp);
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let symbol = market['symbol'];
        return {
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': market['id'],
            'order': undefined,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetKline (this.extend ({
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'since': since,
        }, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let side = this.safeString (order, 'side');
        if (typeof side === 'undefined') {
            side = this.safeString (order, 'type');
        }
        let timestamp = undefined;
        let iso8601 = undefined;
        if ('datetime' in order) {
            timestamp = this.parse8601 (order['datetime']);
            iso8601 = this.iso8601 (timestamp);
        }
        return {
            'id': order['order_id'] || order['id'],
            'datetime': iso8601,
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': order['price'],
            'cost': undefined,
            'amount': order['number'],
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let sides = ['buy', 'sell', 'buy_market', 'sell_market'];
        let request = { 'symbol': market['id'] };
        if (type === 'market') {
            if (side === 'sell') {
                request['amount'] = amount;
            } else if (side === 'buy') {
                request['price'] = amount;
            }
            side += '_market';
        } else {
            request['amount'] = amount;
            request['price'] = price;
        }
        request['type'] = side;
        if (!(sides in side)) {
            throw new ExchangeError ('side not in', sides);
        }
        let response = await this.privatePostTrade (this.extend (request, params));
        if (!response['result']) {
            throw new ExchangeError (response);
        }
        let id = response['order_id'];
        let order = this.parseOrder ({
            'id': id,
            'price': price,
            'number': amount,
            'side': side,
        }, market);
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
            'symbol': symbol.replace ('/', ''),
        }, params));
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrderHistory (this.extend ({
            'symbol': market['id'],
            'status': 0,
        }, params));
        let orders = this.parseOrders (response['orders'], market, since, limit);
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrderHistory (this.extend ({
            'symbol': market['id'],
            'status': 1,
        }, params));
        return this.parseOrders (response['orders'], market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            url += '?' + this.urlencode (params);
            headers = { 'Content-Type': 'application/json' };
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let signature = this.extend ({ 'nonce': nonce, 'api_key': this.apiKey }, params);
            signature = this.keysort (signature);
            signature['secret_key'] = this.secret;
            signature = this.urlencode (signature);
            signature = this.hash (signature, 'md5').toUpperCase ();
            body = this.extend ({
                'api_key': this.apiKey,
                'sign': signature,
                'nonce': nonce,
            }, params);
            body = this.urlencode (body);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        }
    }
};
