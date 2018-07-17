'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, ExchangeNotAvailable } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bigone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bigone',
            'name': 'BigONE',
            'countries': 'GB',
            'version': 'v2',
            'has': {
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'withdraw': true,
                'fetchOHLCV': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42803606-27c2b5ec-89af-11e8-8d15-9c8c245e8b2c.jpg',
                'api': {
                    'public': 'https://big.one/api/v2',
                    'private': 'https://big.one/api/v2/viewer',
                },
                'www': 'https://big.one',
                'doc': 'https://open.big.one/docs/api.html',
                'fees': 'https://help.big.one/hc/en-us/articles/115001933374-BigONE-Fee-Policy',
                'referral': 'https://b1.run/users/new?code=D3LLBVFT',
            },
            'api': {
                'public': {
                    'get': [
                        'ping', // timestamp in nanoseconds
                        'markets',
                        'markets/{symbol}/depth',
                        'markets/{symbol}/trades',
                        'markets/{symbol}/ticker',
                        'orders',
                        'orders/{id}',
                        'tickers',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'orders',
                        'orders/{order_id}',
                    ],
                    'post': [
                        'orders',
                        'orders/{order_id}/cancel',
                        'orders/cancel_all',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    // HARDCODING IS DEPRECATED THE FEES BELOW ARE TO BE REMOVED SOON
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
            'exceptions': {
                'codes': {
                    '401': AuthenticationError,
                },
                'detail': {
                    'Internal server error': ExchangeNotAvailable,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetMarkets ();
        let markets = response['data'];
        let result = [];
        this.options['marketsByUuid'] = {};
        for (let i = 0; i < markets.length; i++) {
            //
            //      {       uuid:   "550b34db-696e-4434-a126-196f827d9172",
            //        quoteScale:    3,
            //        quoteAsset: {   uuid: "17082d1c-0195-4fb6-8779-2cdbcb9eeb3c",
            //                      symbol: "USDT",
            //                        name: "TetherUS"                              },
            //              name:   "BTC-USDT",
            //         baseScale:    5,
            //         baseAsset: {   uuid: "0df9c3c3-255a-46d7-ab82-dedae169fba9",
            //                      symbol: "BTC",
            //                        name: "Bitcoin"                               }  } }
            //
            let market = markets[i];
            let id = market['name'];
            let uuid = market['uuid'];
            let baseId = market['baseAsset']['symbol'];
            let quoteId = market['quoteAsset']['symbol'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': market['baseScale'],
                'price': market['quoteScale'],
            };
            const entry = {
                'id': id,
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
            };
            this.options['marketsByUuid'][uuid] = entry;
            result.push (entry);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     [
        //         {
        //             "volume": "190.4925000000000000",
        //             "open": "0.0777371200000000",
        //             "market_uuid": "38dd30bf-76c2-4777-ae2a-a3222433eef3",
        //             "market_id": "ETH-BTC",
        //             "low": "0.0742925600000000",
        //             "high": "0.0789150000000000",
        //             "daily_change_perc": "-0.3789180767180466680525339760",
        //             "daily_change": "-0.0002945600000000",
        //             "close": "0.0774425600000000", // last price
        //             "bid": {
        //                 "price": "0.0764777900000000",
        //                 "amount": "6.4248000000000000"
        //             },
        //             "ask": {
        //                 "price": "0.0774425600000000",
        //                 "amount": "1.1741000000000000"
        //             }
        //         }
        //     ]
        //
        if (typeof market === 'undefined') {
            let marketId = this.safeString (ticker, 'market_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let timestamp = this.milliseconds ();
        let close = this.safeFloat (ticker, 'close');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker['bid'], 'price'),
            'bidVolume': this.safeFloat (ticker['bid'], 'amount'),
            'ask': this.safeFloat (ticker['ask'], 'price'),
            'askVolume': this.safeFloat (ticker['ask'], 'amount'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'daily_change'),
            'percentage': this.safeFloat (ticker, 'daily_change_perc'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketsSymbolTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response['data'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickers (params);
        let tickers = response['data'];
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = this.parseTicker (tickers[i]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketsSymbolDepth (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (response['data'], undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        //
        //     {   node: {  taker_side: "ASK",
        //                       price: "0.0694071600000000",
        //                 market_uuid: "38dd30bf-76c2-4777-ae2a-a3222433eef3",
        //                   market_id: "ETH-BTC",
        //                 inserted_at: "2018-07-14T09:22:06Z",
        //                          id: "19913306",
        //                      amount: "0.8800000000000000"                    },
        //       cursor:   "Y3Vyc29yOnYxOjE5OTEzMzA2"                              }
        //
        let node = trade['node'];
        let timestamp = this.parse8601 (node['inserted_at']);
        let price = this.safeFloat (node, 'price');
        let amount = this.safeFloat (node, 'amount');
        if (typeof market === 'undefined') {
            let marketId = this.safeString (node, 'market_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let cost = this.costToPrecision (symbol, price * amount);
        let side = node['taker_side'] === 'ASK' ? 'sell' : 'buy';
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (node, 'id'),
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
        let request = {
            'symbol': market['id'],
        };
        if (typeof limit !== 'undefined') {
            request['first'] = limit;
        }
        let response = await this.publicGetMarketsSymbolTrades (this.extend (request, params));
        //
        //     { data: { page_info: {      start_cursor: "Y3Vyc29yOnYxOjE5OTEzMzA2",
        //                            has_previous_page:  true,
        //                                has_next_page:  false,
        //                                   end_cursor: "Y3Vyc29yOnYxOjIwMDU0NzIw"  },
        //                   edges: [ {   node: {  taker_side: "ASK",
        //                                              price: "0.0694071600000000",
        //                                        market_uuid: "38dd30bf-76c2-4777-ae2a-a3222433eef3",
        //                                          market_id: "ETH-BTC",
        //                                        inserted_at: "2018-07-14T09:22:06Z",
        //                                                 id: "19913306",
        //                                             amount: "0.8800000000000000"                    },
        //                              cursor:   "Y3Vyc29yOnYxOjE5OTEzMzA2"                              },
        //                            {   node: {  taker_side: "ASK",
        //                                              price: "0.0694071600000000",
        //                                        market_uuid: "38dd30bf-76c2-4777-ae2a-a3222433eef3",
        //                                          market_id: "ETH-BTC",
        //                                        inserted_at: "2018-07-14T09:22:07Z",
        //                                                 id: "19913307",
        //                                             amount: "0.3759000000000000"                    },
        //                              cursor:   "Y3Vyc29yOnYxOjE5OTEzMzA3"                              },
        //                            {   node: {  taker_side: "ASK",
        //                                              price: "0.0694071600000000",
        //                                        market_uuid: "38dd30bf-76c2-4777-ae2a-a3222433eef3",
        //                                          market_id: "ETH-BTC",
        //                                        inserted_at: "2018-07-14T09:22:08Z",
        //                                                 id: "19913321",
        //                                             amount: "0.2197000000000000"                    },
        //                              cursor:   "Y3Vyc29yOnYxOjE5OTEzMzIx"                              },
        //
        return this.parseTrades (response['data']['edges'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccounts (params);
        //
        //     { data: [ { locked_balance: "0",
        //                        balance: "0",
        //                     asset_uuid: "04479958-d7bb-40e4-b153-48bd63f2f77f",
        //                       asset_id: "NKC"                                   },
        //               { locked_balance: "0",
        //                        balance: "0",
        //                     asset_uuid: "04c8da0e-44fd-4d71-aeb0-8f4d54a4a907",
        //                       asset_id: "UBTC"                                  },
        //               { locked_balance: "0",
        //                        balance: "0",
        //                     asset_uuid: "05bc0d34-4809-4a39-a3c8-3a1851c8d224",
        //                       asset_id: "READ"                                  },
        //
        let result = { 'info': response };
        let balances = response['data'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = balance['asset_id'];
            let code = this.commonCurrencyCode (currencyId);
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            }
            let total = this.safeFloat (balance, 'balance');
            let used = this.safeFloat (balance, 'locked_balance');
            let free = undefined;
            if (typeof total !== 'undefined' && typeof used !== 'undefined') {
                free = total - used;
            }
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //       "id": 10,
        //       "market_uuid": "d2185614-50c3-4588-b146-b8afe7534da6",
        //       "market_uuid": "BTC-EOS", // not sure which one is correct
        //       "market_id": "BTC-EOS",   // not sure which one is correct
        //       "price": "10.00",
        //       "amount": "10.00",
        //       "filled_amount": "9.0",
        //       "avg_deal_price": "12.0",
        //       "side": "ASK",
        //       "state": "FILLED"
        //     }
        //
        let id = this.safeString (order, 'order_id');
        if (typeof market === 'undefined') {
            let marketId = this.safeString (order, 'market_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                let marketUuid = this.safeString (order, 'market_uuid');
                if (marketUuid in this.options['marketsByUuid']) {
                    market = this.options['marketsByUuid'][marketUuid];
                }
            }
        }
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let timestamp = this.parse8601 (order['created_at']);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'filled_amount');
        let remaining = Math.max (0, amount - filled);
        let status = this.parseOrderStatus (this.safeString (order, 'state'));
        let side = this.safeString (order, 'side');
        if (side === 'BID') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': undefined,
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
        // NAME      DESCRIPTION       EXAMPLE                              REQUIRE
        // market_id market uuid       d2185614-50c3-4588-b146-b8afe7534da6 true
        // side      order side one of "ASK"/"BID"                          true
        // price     order price       string                               true
        // amount    order amount      string, must larger than 0           true
        //
        //     {
        //       "id": 10,
        //       "market_uuid": "BTC-EOS",
        //       "price": "10.00",
        //       "amount": "10.00",
        //       "filled_amount": "9.0",
        //       "avg_deal_price": "12.0",
        //       "side": "ASK",
        //       "state": "FILLED"
        //     }
        //
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrders (this.extend ({
            'order_market': market['id'],
            'order_side': (side === 'buy' ? 'BID' : 'ASK'),
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        }, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { 'order_id': id };
        let response = await this.privatePostOrdersOrderIdCancel (this.extend (request, params));
        //
        //     {
        //       "id": 10,
        //       "market_uuid": "BTC-EOS",
        //       "price": "10.00",
        //       "amount": "10.00",
        //       "filled_amount": "9.0",
        //       "avg_deal_price": "12.0",
        //       "side": "ASK",
        //       "state": "FILLED"
        //     }
        //
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrdersOrderIdCancel (params);
        //
        //     [
        //         {
        //             "id": 10,
        //             "market_uuid": "d2185614-50c3-4588-b146-b8afe7534da6",
        //             "price": "10.00",
        //             "amount": "10.00",
        //             "filled_amount": "9.0",
        //             "avg_deal_price": "12.0",
        //             "side": "ASK",
        //             "state": "FILLED"
        //         },
        //         {
        //             ...
        //         },
        //     ]
        //
        return this.parseOrders (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { 'order_id': id };
        let response = await this.privateGetOrdersOrderId (this.extend (request, params));
        //
        //     {
        //         "id": 10,
        //         "market_uuid": "d2185614-50c3-4588-b146-b8afe7534da6",
        //         "price": "10.00",
        //         "amount": "10.00",
        //         "filled_amount": "9.0",
        //         "avg_deal_price": "12.0",
        //         "side": "ASK",
        //         "state": "FILLED"
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // NAME      DESCRIPTION                                           EXAMPLE         REQUIRED
        // market_id market id                                             ETH-BTC         true
        // after     ask for the server to return orders after the cursor  dGVzdGN1cmVzZQo false
        // before    ask for the server to return orders before the cursor dGVzdGN1cmVzZQo false
        // first     slicing count                                         20              false
        // last      slicing count                                         20              false
        // side      order side one of                                     "ASK"/"BID"     false
        // state     order state one of                      "CANCELED"/"FILLED"/"PENDING" false
        if (typeof symbol === 'undefined') {
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market_id': market['id'],
        };
        if (typeof limit !== 'undefined') {
            request['first'] = limit;
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        //
        //     {
        //       "edges": [
        //         {
        //           "node": {
        //             "id": 10,
        //             "market_id": "ETH-BTC",
        //             "price": "10.00",
        //             "amount": "10.00",
        //             "filled_amount": "9.0",
        //             "avg_deal_price": "12.0",
        //             "side": "ASK",
        //             "state": "FILLED"
        //           },
        //           "cursor": "dGVzdGN1cmVzZQo="
        //         }
        //       ],
        //       "page_info": {
        //         "end_cursor": "dGVzdGN1cmVzZQo=",
        //         "start_cursor": "dGVzdGN1cmVzZQo=",
        //         "has_next_page": true,
        //         "has_previous_page": false
        //       }
        //     }
        //
        let orders = this.safeValue (response, 'edges', []);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.parseOrder (orders[i]['node'], market));
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({
            'state': 'PENDING',
        }, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({
            'state': 'FILLED',
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce () * 1000000000;
            let request = {
                'type': 'OpenAPI',
                'sub': this.apiKey,
                'nonce': nonce,
            };
            let jwt = this.jwt (request, this.secret);
            headers = {
                'Authorization': 'Bearer ' + jwt,
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

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            //
            //      {"errors":{"detail":"Internal server error"}}
            //
            const error = this.safeValue (response, 'error');
            const errors = this.safeValue (response, 'errors');
            const data = this.safeValue (response, 'data');
            if (typeof error !== 'undefined' || typeof errors !== 'undefined' || typeof data === 'undefined') {
                const feedback = this.id + ' ' + this.json (response);
                let code = this.safeInteger (error, 'code');
                let exceptions = this.exceptions['codes'];
                if (typeof errors !== 'undefined') {
                    code = this.safeString (errors, 'detail');
                    exceptions = this.exceptions['detail'];
                }
                if (code in exceptions) {
                    throw new exceptions[code] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
