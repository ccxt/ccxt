'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coss extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coss',
            'name': 'COSS',
            'country': [ 'SG', 'NL' ],
            'rateLimit': 1000,
            'version': 'v1',
            'comment': 'Certified exchange',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/50185321-88c99c00-0328-11e9-8bc1-0ce1f7606ef3.jpg',
                'api': {
                    'trade': 'https://trade.coss.io/c/api/v1',
                    'engine': 'https://engine.coss.io/api/v1',
                    'public': 'https://trade.coss.io/c/api/v1',
                    'web': 'https://trade.coss.io/c', // undocumented
                },
                'www': 'https://www.coss.io',
                'doc': 'https://api.coss.io/v1/spec',
            },
            'has': {
                'fetchTrades': false, // temporarily
                'fetchTicker': false, // temporarily
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchOHLCV': true,
                'createOrder': true,
                'cancelOrder': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'api': {
                'public': {
                    'get': [
                        'getmarketsummaries', // broken on COSS's end
                        'market-price',
                        'exchange-info',
                    ],
                },
                'web': {
                    'get': [
                        'coins/getinfo/all', // undocumented
                        'order/symbols', // undocumented
                    ],
                },
                'engine': {
                    'get': [
                        'dp',
                        'ht',
                        'cs',
                    ],
                },
                'trade': {
                    'get': [
                        'account/balances',
                        'account/details',
                    ],
                    'post': [
                        'order/add',
                        'order/details',
                        'order/list/open',
                        'order/list/completed',
                        'order/list/all',
                    ],
                    'delete': [
                        'order/cancel',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeInfo (params);
        //
        //     {        timezone:   "UTC",
        //           server_time:    1545171487108,
        //           rate_limits: [ {     type: "REQUESTS",
        //                            interval: "MINUTE",
        //                               limit:  1000       } ],
        //       base_currencies: [ { currency_code: "BTC", minimum_total_order: "0.0001" },
        //                          { currency_code: "USDT", minimum_total_order: "1" },
        //                          { currency_code: "EUR", minimum_total_order: "1" } ],
        //                 coins: [ {        currency_code: "ADI",
        //                                            name: "Aditus",
        //                            minimum_order_amount: "0.00000001" },
        //                          ...
        //                          {        currency_code: "NPXSXEM",
        //                                            name: "PundiX-XEM",
        //                            minimum_order_amount: "0.00000001"  }                ],
        //               symbols: [ {               symbol: "ADI_BTC",
        //                            amount_limit_decimal:  0,
        //                             price_limit_decimal:  8,
        //                                   allow_trading:  true      },
        //                          ...
        //                          {               symbol: "ETH_GUSD",
        //                            amount_limit_decimal:  5,
        //                             price_limit_decimal:  3,
        //                                   allow_trading:  true       }     ]               }
        //
        let result = [];
        const markets = this.safeValue (response, symbols, []);
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let marketId = market['symbol'];
            let [ baseId, quoteId ] = marketId.split ('_');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': this.safeInteger (market, 'amount_limit_decimal'),
                'price': this.safeInteger (market, 'price_limit_decimal'),
            };
            // todo: fill limits
            let active = this.safeValue (market, 'allow_trading', false);
            result.push ({
                'symbol': symbol,
                'id': marketId,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let result = {};
        let currencies = await this.webGetCoinsGetinfoAll (params);
        for (let i = 0; i < currencies.length; i++) {
            let info = currencies[i];
            let currencyId = info['currency_code'];
            let code = this.commonCurrencyCode (currencyId);
            let name = info['name'];
            let limits = {
                'amount': {
                    'min': this.safeFloat (info, 'minimum_order_amount'),
                    'max': undefined,
                },
                'withdraw': {
                    'min': this.safeFloat (info, 'minimum_withdrawn_amount'),
                    'max': undefined,
                },
            };
            let active = info['allow_buy'] && info['allow_sell'] && info['allow_withdrawn'] && info['allow_deposit'];
            let fee = this.safeFloat (info, 'withdrawn_fee');
            let type = this.safeString (info, 'token_type');
            result[code] = {
                'code': code,
                'id': currencyId,
                'limits': limits,
                'name': name,
                'active': active,
                'fee': fee,
                'type': type,
                'info': info,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.tradeGetAccountBalances ();
        let result = {};
        for (let i = 0; i < response.length; i++) {
            let info = response[i];
            let currencyId = info['currency_code'];
            let code = this.currencies_by_id[currencyId]['code'];
            let total = this.safeFloat (info, 'total');
            let used = this.safeFloat (info, 'in_order');
            let free = this.safeFloat (info, 'available');
            result[code] = {
                'total': total,
                'used': used,
                'free': free,
            };
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        return [
            parseInt (ohlcv[0]),   // timestamp
            parseFloat (ohlcv[1]), // Open
            parseFloat (ohlcv[2]), // High
            parseFloat (ohlcv[3]), // Low
            parseFloat (ohlcv[4]), // Close
            parseFloat (ohlcv[5]), // base Volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'tt': this.timeframes[timeframe],
        };
        let response = await this.engineGetCs (this.extend (request, params));
        //
        //     {       tt:   "1m",
        //         symbol:   "ETH_BTC",
        //       nextTime:    1545138960000,
        //         series: [ [  1545138960000,
        //                     "0.02705000",
        //                     "0.02705000",
        //                     "0.02705000",
        //                     "0.02705000",
        //                     "0.00000000"    ],
        //                   ...
        //                   [  1545168900000,
        //                     "0.02684000",
        //                     "0.02684000",
        //                     "0.02684000",
        //                     "0.02684000",
        //                     "0.00000000"    ]  ],
        //          limit:    500                    }
        //
        return this.parseOHLCVs (response['series'], market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.marketId (symbol);
        let response = await this.engineGetDp (this.extend ({ 'symbol': marketId }, params));
        let timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (response, timestamp);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a symbol parameter to fetchOrders');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        let response = await this.tradePostOrderListAll (this.extend ({
            'symbol': marketId,
            'timestamp': this.nonce (),
            'limit': limit,
        }, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a symbol parameter to fetchOrders');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        // returns partial fills also
        let response = await this.tradePostOrderListCompleted (this.extend ({
            'symbol': marketId,
            'timestamp': this.nonce (),
            'limit': limit,
        }, params));
        let orders = this.parseOrders (response['list'], market, since, limit);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a symbol parameter to fetchOrders');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        let response = await this.tradePostOrderListOpen (this.extend ({
            'symbol': marketId,
            'timestamp': this.nonce (),
            'limit': limit,
        }, params));
        return this.parseOrders (response['list'], market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.tradePostOrderDetails (this.extend ({
            'timestamp': this.nonce (),
            'order_id': id,
        }));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status) {
        let statuses = {
            'OPEN': 'open',
            'CANCELLED': 'canceled',
            'FILLED': 'closed',
            'PARTIAL_FILL': 'open',
            'CANCELLING': 'open',
        };
        return this.safeString (statuses, status.toUpperCase ());
    }

    parseOrder (order, market = undefined) {
        let symbol = this.markets_by_id[order['order_symbol']]['symbol'];
        let timestamp = this.safeInteger (order, 'createTime');
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let price = this.safeFloat (order, 'order_price');
        let filled = this.safeFloat (order, 'executed');
        let type = this.safeString (order, 'type');
        let amount = this.safeFloat (order, 'order_size');
        let average = this.safeFloat (order, 'avg');
        let side = this.safeString (order, 'order_side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        let cost = this.safeFloat (order, 'total');
        return {
            'id': this.safeString (order, 'order_id'),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': status,
            'price': price,
            'filled': filled,
            'remaining': amount - filled,
            'type': type,
            'average': average,
            'side': side,
            'cost': cost,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        let response = await this.tradePostOrderAdd (this.extend ({
            'order_symbol': marketId,
            'order_price': this.priceToPrecision (symbol, price),
            'order_size': this.amountToPrecision (symbol, amount),
            'order_side': side.toUpperCase (),
            'type': type,
            'timestamp': this.nonce (),
        }, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.tradeDeleteOrderCancel (this.extend ({
            'timestamp': this.nonce (),
            'order_id': id,
        }, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public' || api === 'engine' || api === 'web') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            if (method === 'GET') {
                if (Object.keys (params).length > 0) {
                    url = url + '&' + this.urlencode (params);
                }
                if (path.indexOf ('account') >= 0) {
                    let requestParams = { 'recvWindow': '10000', 'timestamp': this.nonce () };
                    let request = this.implodeParams ('recvWindow={recvWindow}&timestamp={timestamp}', requestParams);
                    url = url + '?' + request;
                    headers = {
                        'Signature': this.hmac (request, this.secret, 'sha256', 'hex'),
                        'Authorization': this.apiKey,
                    };
                }
            } else {
                body = this.json (params);
                headers = {
                    'Signature': this.hmac (body, this.secret, 'sha256', 'hex'),
                    'Authorization': this.apiKey,
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
