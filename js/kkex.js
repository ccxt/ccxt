'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InvalidOrder, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kkex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kkex',
            'name': 'KKEX',
            'countries': [ 'CN', 'US', 'JP' ],
            'version': 'v2',
            'has': {
                'CORS': false,
                'fetchBalance': true,
                'fetchTickers': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'createMarketOrder': true,
                'fetchOrder': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '4h': '4hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
                '1M': '1month',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/47401462-2e59f800-d74a-11e8-814f-e4ae17b4968a.jpg',
                'api': {
                    'public': 'https://kkex.com/api/v1',
                    'private': 'https://kkex.com/api/v2',
                    'v1': 'https://kkex.com/api/v1',
                },
                'www': 'https://kkex.com',
                'doc': 'https://kkex.com/api_wiki/cn/',
                'fees': 'https://intercom.help/kkex/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange_rate',
                        'products',
                        'assets',
                        'tickers',
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                    ],
                },
                'private': {
                    'post': [
                        'profile',
                        'trade',
                        'batch_trade',
                        'cancel_order',
                        'cancel_all_orders',
                        'order_history',
                        'userinfo',
                        'order_info',
                        'orders_info',
                    ],
                },
                'v1': {
                    'post': [
                        'process_strategy',
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
        });
    }

    async fetchMarkets (params = {}) {
        let tickers = await this.publicGetTickers (params);
        tickers = tickers['tickers'];
        let products = await this.publicGetProducts (params);
        products = products['products'];
        const markets = [];
        for (let k = 0; k < tickers.length; k++) {
            const keys = Object.keys (tickers[k]);
            markets.push (keys[0]);
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const id = markets[i];
            const market = markets[i];
            let baseId = '';
            let quoteId = '';
            let precision = {};
            let limits = {};
            for (let j = 0; j < products.length; j++) {
                const p = products[j];
                if (p['mark_asset'] + p['base_asset'] === market) {
                    quoteId = p['base_asset'];
                    baseId = p['mark_asset'];
                    const price_scale_str = p['price_scale'].toString ();
                    const scale = price_scale_str.length - 1;
                    precision = {
                        'price': scale,
                        'amount': scale,
                    };
                    limits = {
                        'amount': {
                            'min': Math.max (this.safeFloat (p, 'min_bid_size'), this.safeFloat (p, 'min_ask_size')),
                            'max': Math.min (this.safeFloat (p, 'max_bid_size'), this.safeFloat (p, 'max_ask_size')),
                        },
                        'price': {
                            'min': this.safeFloat (p, 'min_price'),
                            'max': this.safeFloat (p, 'max_price'),
                        },
                    };
                    limits['cost'] = {
                        'min': this.safeFloat (p, 'min_bid_amount'),
                        'max': this.safeFloat (p, 'max_bid_amount'),
                    };
                }
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'date');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
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
        const market = this.markets[symbol];
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = this.extend (response['ticker'], this.omit (response, 'ticker'));
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        //
        //     {    date:    1540350657,
        //       tickers: [ { ENUBTC: { sell: "0.00000256",
        //                               buy: "0.00000253",
        //                              last: "0.00000253",
        //                               vol: "138686.828804",
        //                              high: "0.00000278",
        //                               low: "0.00000253",
        //                              open: "0.0000027"      } },
        //                  { ENUEOS: { sell: "0.00335",
        //                               buy: "0.002702",
        //                              last: "0.0034",
        //                               vol: "15084.9",
        //                              high: "0.0034",
        //                               low: "0.003189",
        //                              open: "0.003189"  } }           ],
        //        result:    true                                          }
        //
        const tickers = this.safeValue (response, 'tickers');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ids = Object.keys (tickers[i]);
            const id = ids[0];
            const market = this.safeValue (this.markets_by_id, id);
            if (market !== undefined) {
                const symbol = market['symbol'];
                const ticker = this.extend (tickers[i][id], this.omit (response, 'tickers'));
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'date_ms');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'tid');
        const type = undefined;
        const side = this.safeString (trade, 'type');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostUserinfo (params);
        const balances = this.safeValue (response, 'info');
        const result = { 'info': response };
        const funds = this.safeValue (balances, 'funds');
        const free = this.safeValue (funds, 'free', {});
        const freezed = this.safeValue (funds, 'freezed', {});
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (free, currencyId);
            account['used'] = this.safeFloat (freezed, currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'symbol': market['id'],
        };
        const response = await this.privatePostOrderInfo (this.extend (request, params));
        if (response['result']) {
            return this.parseOrder (response['order'], market);
        }
        throw new OrderNotFound (this.id + ' order ' + id + ' not found');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            parseInt (ohlcv[0]),
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            // since = this.milliseconds () - this.parseTimeframe (timeframe) * limit * 1000;
            request['since'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetKline (this.extend (request, params));
        //
        //     [
        //         [
        //             "1521072000000",
        //             "0.000002",
        //             "0.00003",
        //             "0.000002",
        //             "0.00003",
        //             "3.106889"
        //         ],
        //         [
        //             "1517356800000",
        //             "0.1",
        //             "0.1",
        //             "0.00000013",
        //             "0.000001",
        //             "542832.83114"
        //         ]
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let side = this.safeString (order, 'side');
        if (side === undefined) {
            side = this.safeString (order, 'type');
        }
        const timestamp = this.safeInteger (order, 'create_date');
        const id = this.safeString2 (order, 'order_id', 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'deal_amount');
        let average = this.safeFloat (order, 'avg_price');
        average = this.safeFloat (order, 'price_avg', average);
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
            }
            if (average !== undefined) {
                cost = average * filled;
            }
        }
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'average': average,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'type': side,
        };
        if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                if (this.options['createMarketBuyOrderRequiresPrice']) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    } else {
                        amount = amount * price;
                    }
                }
                request['price'] = this.amountToPrecision (symbol, amount);
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            request['type'] += '_' + type;
        } else {
            request['amount'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostTrade (this.extend (request, params));
        const id = this.safeString (response, 'order_id');
        return {
            'info': response,
            'id': id,
            'datetime': undefined,
            'timestamp': undefined,
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'symbol': market['id'],
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['page_length'] = limit; // 20 by default
        }
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        return this.parseOrders (response['orders'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 0,
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 1,
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            url += '?' + this.urlencode (params);
            headers = { 'Content-Type': 'application/json' };
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            let signature = this.extend ({
                'nonce': nonce,
                'api_key': this.apiKey,
            }, params);
            signature = this.urlencode (this.keysort (signature));
            signature += '&secret_key=' + this.secret;
            signature = this.hash (this.encode (signature), 'md5');
            signature = signature.toUpperCase ();
            body = this.extend ({
                'api_key': this.apiKey,
                'sign': signature,
                'nonce': nonce,
            }, params);
            body = this.urlencode (body);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
