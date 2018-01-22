"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinex extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinex',
            'name': 'CoinEx',
            'countries': 'CN',
            'rateLimit': 1000,
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
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
            'urls': {
                'logo': 'https://www.coinex.com/_nuxt/img/coin-ex-logo-white.abfd6af.svg',
                'api': 'https://api.coinex.com/v1',
                'www': 'https://www.coinex.com/',
                'doc': 'https://github.com/coinexcom/coinex_exchange_api/wiki',
                'fees': 'https://www.coinex.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'market/list',
                        'market/ticker',
                        'market/ticker/all',
                        'market/depth',
                        'market/deals',
                        'market/kline',
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'order',
                        'order/pending',
                        'order/finished',
                        'order/finished/{id}',
                    ],
                    'post': [
                        'order/limit',
                        'order/market',
                    ],
                    'delete': [
                        'order/pending',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0,
                    'taker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BCH': 0.0,
                        'BTC': 0.001,
                        'LTC': 0.001,
                        'ETH': 0.001,
                        'ZEC': 0.0001,
                        'DASH': 0.0001,
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

    commonCurrencyCode (currency) {
        return currency;
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarketList ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let id = markets[i];
            let [ quote, base ] = [id.slice (0, -3), id.slice (-3)];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'lot': this.limits['amount']['min'],
                'info': id,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['date'];
        let symbol = market['symbol'];
        ticker = ticker['ticker'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetMarketTicker (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetMarketTickerAll (params);
        let timestamp = tickers['date'];
        tickers = tickers['ticker'];
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = {
                'date': timestamp,
                'ticker': tickers[id],
            };
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetMarketDepth (this.extend ({
            'market': this.marketId (symbol),
            'merge': '0.00000001',
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date_ms'];
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let symbol = market['symbol'];
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.publicGetMarketDeals (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
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
        let response = await this.publicGetMarketKline (this.extend ({
            'market': market['id'],
            'type': this.timeframes[timeframe],
        }, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetBalance (params);
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            let id = currencies[i];
            let balance = balances[id];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['frozen']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        // TODO: check if it's actually milliseconds, since examples were in seconds
        let timestamp = this.safeInteger (order, 'create_time') * 1000;
        let price = parseFloat (order['price']);
        let cost = this.safeFloat (order, 'deal_money');
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'deal_amount');
        let symbol = market['symbol'];
        let remaining = this.amountToPrecision (symbol, amount - filled);
        let status = order['status'];
        if (status == 'done') {
            status = 'closed';
        } else {
            // not_deal
            // part_deal
            status = 'open';
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': order['order_type'],
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': {
                'currency': market['quote'],
                'cost': parseFloat (order['deal_fee']),
            },
            'info': order,
        };
    }

    parseOrders (orders, market, result = []) {
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            result.push (this.parseOrder (order, market));
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePostOrder' + this.capitalize (type);
        let market = this.market (symbol);
        amount = parseFloat (amount);
        let request = {
            'market': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'type': side,
        };
        if (type == 'limit') {
            price = parseFloat (price);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let response = await this[method] (this.extend (request, params));
        let order = this.parseOrder (response, market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let result = await this.privateDeleteOrderPending (this.extend ({
            'id': id,
            'market': market['id'],
        }, params));
        return this.parseOrder (result, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = await this.privateGetOrder (this.extend ({
            'id': id,
            'market': market['id'],
        }, params));
        return this.parseOrder (order, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let orders = await this.privateGetOrderPending (this.extend (request, params));
        return this.parseOrders (orders['data'], market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let orders = await this.privateGetOrderFinished (this.extend (request, params));
        return this.parseOrders (orders['data'], market);
    }

    // async fetchOrderTrades (id, symbol = undefined, params = {}) {
    //     await this.loadMarkets ();
    //     let market = this.market (symbol);
    //     let trades = await this.privateGetOrderFinishedId (this.extend ({
    //         'id': id,
    //         'market': market['id'],
    //         'page': 1,
    //         'limit': 100,
    //     }, params));
    //     return trades['data'];
    // }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            query = this.extend ({
                'access_id': this.apiKey,
                'tonce': nonce.toString (),
            }, query);
            query = this.keysort (query);
            let encQuery = this.urlencode (query);
            let signature = this.hash (encQuery + '&secret_key=' + this.secret);
            headers = {
                'Authorization': signature.toUpperCase (),
                'Content-Type': 'application/json',
            };
            if (method == 'GET') {
                url += '?' + encQuery;
            } else {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let code = this.safeString (response, 'code');
        if (code != '0' || !this.safeValue (response, 'data')) {
            let responseCodes = {
                '24': AuthenticationError,
                '25': AuthenticationError,
                '107': InsufficientFunds,
                '600': OrderNotFound,
                '601': InvalidOrder,
                '602': InvalidOrder,
                '606': InvalidOrder,
            };
            let errorClass = this.safeValue (responseCodes, code, ExchangeError);
            throw new errorClass (response['message']);
        }
        // code and message will always be the same here (0, 'Ok'), so ignore them
        return response['data'];
    }
}
