'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, ExchangeNotAvailable, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bigone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bigone',
            'name': 'BigONE',
            'countries': [ 'GB' ],
            'version': 'v2',
            'has': {
                'cancelAllOrders': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'withdraw': true,
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
                        'trades',
                        'withdrawals',
                        'deposits',
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
                    '10030': InvalidNonce, // {"message":"invalid nonce, nonce should be a 19bits number","code":10030}
                },
                'detail': {
                    'Internal server error': ExchangeNotAvailable,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const markets = this.safeValue (response, 'data');
        const result = [];
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
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const uuid = this.safeString (market, 'uuid');
            const baseAsset = this.safeValue (market, 'baseAsset', {});
            const quoteAsset = this.safeValue (market, 'quoteAsset', {});
            const baseId = this.safeString (baseAsset, 'symbol');
            const quoteId = this.safeString (quoteAsset, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'baseScale'),
                'price': this.safeInteger (market, 'quoteScale'),
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
        if (market === undefined) {
            const marketId = this.safeString (ticker, 'market_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.milliseconds ();
        const close = this.safeFloat (ticker, 'close');
        const bid = this.safeValue (ticker, 'bid', {});
        const ask = this.safeValue (ticker, 'ask', {});
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (bid, 'price'),
            'bidVolume': this.safeFloat (bid, 'amount'),
            'ask': this.safeFloat (ask, 'price'),
            'askVolume': this.safeFloat (ask, 'amount'),
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
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketsSymbolTicker (this.extend (request, params));
        return this.parseTicker (response['data'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickers = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetMarketsSymbolDepth (this.extend (request, params));
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
        const node = this.safeValue (trade, 'node', {});
        const timestamp = this.parse8601 (this.safeString (node, 'inserted_at'));
        const price = this.safeFloat (node, 'price');
        const amount = this.safeFloat (node, 'amount');
        if (market === undefined) {
            const marketId = this.safeString (node, 'market_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = this.costToPrecision (symbol, price * amount);
            }
        }
        // taker side is not related to buy/sell side
        // the following code is probably a mistake
        let side = undefined;
        if (node['taker_side'] === 'ASK') {
            side = 'sell';
        } else {
            side = 'buy';
        }
        const id = this.safeString (node, 'id');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': 'limit',
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['first'] = limit;
        }
        const response = await this.publicGetMarketsSymbolTrades (this.extend (request, params));
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
        const response = await this.privateGetAccounts (params);
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
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset_id');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'locked_balance');
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
        const id = this.safeString (order, 'id');
        if (market === undefined) {
            const marketId = this.safeString (order, 'market_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const marketUuid = this.safeString (order, 'market_uuid');
                if (marketUuid in this.options['marketsByUuid']) {
                    market = this.options['marketsByUuid'][marketUuid];
                }
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (order, 'inserted_at'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'filled_amount');
        const remaining = Math.max (0, amount - filled);
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        let side = this.safeString (order, 'side');
        if (side === 'BID') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        let cost = undefined;
        if (filled !== undefined) {
            if (price !== undefined) {
                cost = filled * price;
            }
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
            'cost': cost,
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
        const market = this.market (symbol);
        side = (side === 'buy') ? 'BID' : 'ASK';
        const request = {
            'market_id': market['id'], // market uuid d2185614-50c3-4588-b146-b8afe7534da6, required
            'side': side, // order side one of "ASK"/"BID", required
            'amount': this.amountToPrecision (symbol, amount), // order amount, string, required
            'price': this.priceToPrecision (symbol, price), // order price, string, required
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //       "data":
        //         {
        //           "id": 10,
        //           "market_uuid": "BTC-EOS",
        //           "price": "10.00",
        //           "amount": "10.00",
        //           "filled_amount": "9.0",
        //           "avg_deal_price": "12.0",
        //           "side": "ASK",
        //           "state": "FILLED"
        //         }
        //     }
        //
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { 'order_id': id };
        const response = await this.privatePostOrdersOrderIdCancel (this.extend (request, params));
        //
        //     {
        //       "data":
        //         {
        //           "id": 10,
        //           "market_uuid": "BTC-EOS",
        //           "price": "10.00",
        //           "amount": "10.00",
        //           "filled_amount": "9.0",
        //           "avg_deal_price": "12.0",
        //           "side": "ASK",
        //           "state": "FILLED"
        //         }
        //     }
        //
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostOrdersOrderIdCancel (params);
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
        const request = { 'order_id': id };
        const response = await this.privateGetOrdersOrderId (this.extend (request, params));
        //
        //     {
        //       "data":
        //         {
        //           "id": 10,
        //           "market_uuid": "BTC-EOS",
        //           "price": "10.00",
        //           "amount": "10.00",
        //           "filled_amount": "9.0",
        //           "avg_deal_price": "12.0",
        //           "side": "ASK",
        //           "state": "FILLED"
        //         }
        //     }
        //
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // NAME      DESCRIPTION                                           EXAMPLE         REQUIRED
            // market_id market id                                             ETH-BTC         true
            // after     ask for the server to return orders after the cursor  dGVzdGN1cmVzZQo false
            // before    ask for the server to return orders before the cursor dGVzdGN1cmVzZQo false
            // first     slicing count                                         20              false
            // last      slicing count                                         20              false
            // side      order side one of                                     "ASK"/"BID"     false
            // state     order state one of                      "CANCELED"/"FILLED"/"PENDING" false
            'market_id': market['id'],
        };
        if (limit !== undefined) {
            request['first'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     {
        //          "data": {
        //              "edges": [
        //                  {
        //                      "node": {
        //                          "id": 10,
        //                          "market_id": "ETH-BTC",
        //                          "price": "10.00",
        //                          "amount": "10.00",
        //                          "filled_amount": "9.0",
        //                          "avg_deal_price": "12.0",
        //                          "side": "ASK",
        //                          "state": "FILLED"
        //                      },
        //                      "cursor": "dGVzdGN1cmVzZQo="
        //                  }
        //              ],
        //              "page_info": {
        //                  "end_cursor": "dGVzdGN1cmVzZQo=",
        //                  "start_cursor": "dGVzdGN1cmVzZQo=",
        //                  "has_next_page": true,
        //                  "has_previous_page": false
        //              }
        //          }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'edges', []);
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.parseOrder (orders[i]['node'], market));
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PENDING': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'PENDING',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'FILLED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    nonce () {
        return this.microseconds () * 1000;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const request = {
                'type': 'OpenAPI',
                'sub': this.apiKey,
                'nonce': nonce,
            };
            const jwt = this.jwt (request, this.encode (this.secret));
            headers = {
                'Authorization': 'Bearer ' + jwt,
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //      {"errors":{"detail":"Internal server error"}}
        //      {"errors":[{"message":"invalid nonce, nonce should be a 19bits number","code":10030}],"data":null}
        //
        const error = this.safeValue (response, 'error');
        const errors = this.safeValue (response, 'errors');
        const data = this.safeValue (response, 'data');
        if (error !== undefined || errors !== undefined || data === undefined) {
            const feedback = this.id + ' ' + this.json (response);
            let code = undefined;
            if (error !== undefined) {
                code = this.safeInteger (error, 'code');
            }
            let exceptions = this.exceptions['codes'];
            if (errors !== undefined) {
                if (Array.isArray (errors)) {
                    code = this.safeString (errors[0], 'code');
                } else {
                    code = this.safeString (errors, 'detail');
                    exceptions = this.exceptions['detail'];
                }
            }
            if (code in exceptions) {
                throw new exceptions[code] (feedback);
            } else {
                throw new ExchangeError (feedback);
            }
        }
    }
};
