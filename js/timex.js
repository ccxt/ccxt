'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, PermissionDenied, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, RateLimitExceeded, NotSupported, BadRequest, AuthenticationError } = require ('./base/errors');

module.exports = class timex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'timex',
            'name': 'TimeX',
            'countries': [ 'AU' ],
            'version': 'v1',
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'cancelOrders': true,
                'editOrder': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTickers': true,
                'fetchTradingFee': true, // maker fee only
            },
            'timeframes': {
                '1m': 'I1',
                '5m': 'I5',
                '15m': 'I15',
                '30m': 'I30',
                '1h': 'H1',
                '2h': 'H2',
                '4h': 'H4',
                '6h': 'H6',
                '12h': 'H12',
                '1d': 'D1',
                '1w': 'W1',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/70423869-6839ab00-1a7f-11ea-8f94-13ae72c31115.jpg',
                'api': 'https://plasma-relay-backend.timex.io',
                'www': 'https://timex.io',
                'doc': 'https://docs.timex.io',
            },
            'api': {
                'custody': {
                    'get': [
                        'credentials', // Get api key for address
                        'credentials/h/{hash}', // Get api key by hash
                        'credentials/k/{key}', // Get api key by key
                        'credentials/me/address', // Get api key by hash
                        'deposit-addresses', // Get deposit addresses list
                        'deposit-addresses/h/{hash}', // Get deposit address by hash
                    ],
                },
                'history': {
                    'get': [
                        'orders', // Gets historical orders
                        'orders/details', // Gets order details
                        'orders/export/csv', // Export orders to csv
                        'trades', // Gets historical trades
                        'trades/export/csv', // Export trades to csv
                    ],
                },
                'currencies': {
                    'get': [
                        'a/{address}', // Gets currency by address
                        'i/{id}', // Gets currency by id
                        's/{symbol}', // Gets currency by symbol
                    ],
                    'post': [
                        'perform', // Creates new currency
                        'prepare', // Prepare creates new currency
                        'remove/perform', // Removes currency by symbol
                        's/{symbol}/remove/prepare', // Prepare remove currency by symbol
                        's/{symbol}/update/perform', // Prepare update currency by symbol
                        's/{symbol}/update/prepare', // Prepare update currency by symbol
                    ],
                },
                'markets': {
                    'get': [
                        'i/{id}', // Gets market by id
                        's/{symbol}', // Gets market by symbol
                    ],
                    'post': [
                        'perform', // Creates new market
                        'prepare', // Prepare creates new market
                        'remove/perform', // Removes market by symbol
                        's/{symbol}/remove/prepare', // Prepare remove market by symbol
                        's/{symbol}/update/perform', // Prepare update market by symbol
                        's/{symbol}/update/prepare', // Prepare update market by symbol
                    ],
                },
                'public': {
                    'get': [
                        'candles', // Gets candles
                        'currencies', // Gets all the currencies
                        'markets', // Gets all the markets
                        'orderbook', // Gets orderbook
                        'orderbook/raw', // Gets raw orderbook
                        'orderbook/v2', // Gets orderbook v2
                        'tickers', // Gets all the tickers
                        'trades', // Gets trades
                    ],
                },
                'statistics': {
                    'get': [
                        'address', // calculateAddressStatistics
                    ],
                },
                'trading': {
                    'get': [
                        'balances', // Get trading balances for all (or selected) currencies
                        'fees', // Get trading fee rates for all (or selected) markets
                        'orders', // Gets open orders
                    ],
                    'post': [
                        'orders', // Create new order
                        'orders/json', // Create orders
                    ],
                    'put': [
                        'orders', // Cancel or update orders
                        'orders/json', // Update orders
                    ],
                    'delete': [
                        'orders', // Delete orders
                        'orders/json', // Delete orders
                    ],
                },
                'tradingview': {
                    'get': [
                        'config', // Gets config
                        'history', // Gets history
                        'symbol_info', // Gets symbol info
                        'time', // Gets time
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    '0': ExchangeError,
                    '1': NotSupported,
                    '4000': BadRequest,
                    '4001': BadRequest,
                    '4002': InsufficientFunds,
                    '4003': AuthenticationError,
                    '4004': AuthenticationError,
                    '4005': BadRequest,
                    '4006': BadRequest,
                    '4007': BadRequest,
                    '4300': PermissionDenied,
                    '4100': AuthenticationError,
                    '4400': OrderNotFound,
                    '5001': InvalidOrder,
                    '5002': ExchangeError,
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': PermissionDenied,
                    '404': OrderNotFound,
                    '429': RateLimitExceeded,
                    '500': ExchangeError,
                    '503': ExchangeNotAvailable,
                },
                'broad': {
                    'Insufficient': InsufficientFunds,
                },
            },
            'options': {
                'fetchTickers': {
                    'period': '1d',
                },
                'fetchTrades': {
                    'sort': 'timestamp,asc',
                },
                'fetchMyTrades': {
                    'sort': 'timestamp,asc',
                },
                'fetchOpenOrders': {
                    'sort': 'createdAt,asc',
                },
                'fetchClosedOrders': {
                    'sort': 'createdAt,asc',
                },
                'defaultSort': 'timestamp,asc',
                'defaultSortOrders': 'createdAt,asc',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     [
        //         {
        //             "symbol": "ETHBTC",
        //             "name": "ETH/BTC",
        //             "baseCurrency": "ETH",
        //             "baseTokenAddress": "0x45932db54b38af1f5a57136302eeba66a5975c15",
        //             "quoteCurrency": "BTC",
        //             "quoteTokenAddress": "0x8370fbc6ddec1e18b4e41e72ed943e238458487c",
        //             "feeCurrency": "BTC",
        //             "feeTokenAddress": "0x8370fbc6ddec1e18b4e41e72ed943e238458487c",
        //             "quantityIncrement": "0.0000001",
        //             "takerFee": "0.005",
        //             "makerFee": "0.0025",
        //             "tickSize": "0.00000001",
        //             "baseMinSize": "0.0001",
        //             "quoteMinSize": "0.00001",
        //             "locked": false
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseMarket (response[i]));
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     [
        //         {
        //             "symbol": "BTC",
        //             "name": "Bitcoin",
        //             "address": "0x8370fbc6ddec1e18b4e41e72ed943e238458487c",
        //             "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggb3BhY2l0eT0iMC41IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwIDUzQzQyLjcwMjUgNTMgNTMgNDIuNzAyNSA1MyAzMEM1MyAxNy4yOTc1IDQyLjcwMjUgNyAzMCA3QzE3LjI5NzUgNyA3IDE3LjI5NzUgNyAzMEM3IDQyLjcwMjUgMTcuMjk3NSA1MyAzMCA1M1pNMzAgNTVDNDMuODA3MSA1NSA1NSA0My44MDcxIDU1IDMwQzU1IDE2LjE5MjkgNDMuODA3MSA1IDMwIDVDMTYuMTkyOSA1IDUgMTYuMTkyOSA1IDMwQzUgNDMuODA3MSAxNi4xOTI5IDU1IDMwIDU1WiIvPgo8cGF0aCBkPSJNNDAuOTQyNSAyNi42NTg1QzQxLjQwMDMgMjMuNjExMyAzOS4wNzA1IDIxLjk3MzIgMzUuODg0OCAyMC44ODA0TDM2LjkxODIgMTYuNzUyNkwzNC4zOTUxIDE2LjEyNjRMMzMuMzg5IDIwLjE0NTVDMzIuNzI1OCAxOS45ODA5IDMyLjA0NDUgMTkuODI1NiAzMS4zNjc1IDE5LjY3MTdMMzIuMzgwOCAxNS42MjYyTDI5Ljg1OTEgMTVMMjguODI1IDE5LjEyNjRDMjguMjc2IDE5LjAwMTkgMjcuNzM3IDE4Ljg3ODggMjcuMjEzOSAxOC43NDkzTDI3LjIxNjggMTguNzM2NEwyMy43MzcyIDE3Ljg3MTJMMjMuMDY2IDIwLjU1NDhDMjMuMDY2IDIwLjU1NDggMjQuOTM4IDIwLjk4MjEgMjQuODk4NSAyMS4wMDg1QzI1LjkyMDQgMjEuMjYyNiAyNi4xMDUgMjEuOTM2IDI2LjA3NDEgMjIuNDY5OUwyNC44OTcgMjcuMTcyNEMyNC45Njc1IDI3LjE5MDMgMjUuMDU4NyAyNy4yMTYgMjUuMTU5MyAyNy4yNTYxQzI1LjA3NTMgMjcuMjM1NCAyNC45ODU0IDI3LjIxMjQgMjQuODkyNyAyNy4xOTAzTDIzLjI0MjggMzMuNzc3OEMyMy4xMTc3IDM0LjA4NjkgMjIuODAwOCAzNC41NTA2IDIyLjA4NjUgMzQuMzc0NkMyMi4xMTE3IDM0LjQxMTEgMjAuMjUyNiAzMy45MTg3IDIwLjI1MjYgMzMuOTE4N0wxOSAzNi43OTQ5TDIyLjI4MzQgMzcuNjFDMjIuODk0MiAzNy43NjI0IDIzLjQ5MjggMzcuOTIyIDI0LjA4MjEgMzguMDcyM0wyMy4wMzggNDIuMjQ3NEwyNS41NTgyIDQyLjg3MzZMMjYuNTkyMyAzOC43NDI5QzI3LjI4MDcgMzguOTI5IDI3Ljk0OSAzOS4xMDA3IDI4LjYwMyAzOS4yNjI0TDI3LjU3MjUgNDMuMzczOEwzMC4wOTU2IDQ0TDMxLjEzOTcgMzkuODMyOEMzNS40NDIyIDQwLjY0MzYgMzguNjc3NCA0MC4zMTY2IDQwLjAzOTIgMzYuNDQxNEM0MS4xMzY1IDMzLjMyMTIgMzkuOTg0NiAzMS41MjEzIDM3LjcyMDkgMzAuMzQ3N0MzOS4zNjk0IDI5Ljk2OTEgNDAuNjExMiAyOC44ODkyIDQwLjk0MjUgMjYuNjU4NVYyNi42NTg1Wk0zNS4xNzc3IDM0LjcwODhDMzQuMzk4IDM3LjgyOSAyOS4xMjI2IDM2LjE0MjIgMjcuNDEyMiAzNS43MTkzTDI4Ljc5NzcgMzAuMTg4MUMzMC41MDgxIDMwLjYxMzIgMzUuOTkyNiAzMS40NTQ4IDM1LjE3NzcgMzQuNzA4OFpNMzUuOTU4MSAyNi42MTM0QzM1LjI0NjcgMjkuNDUxNyAzMC44NTU5IDI4LjAwOTcgMjkuNDMxNiAyNy42NTYxTDMwLjY4NzcgMjIuNjM5NUMzMi4xMTIgMjIuOTkzIDM2LjY5OSAyMy42NTI4IDM1Ljk1ODEgMjYuNjEzNFoiLz4KPC9zdmc+Cg==",
        //             "background": "transparent",
        //             "fiatSymbol": "BTC",
        //             "decimals": 8,
        //             "tradeDecimals": 20,
        //             "displayDecimals": 4,
        //             "crypto": true,
        //             "depositEnabled": true,
        //             "withdrawalEnabled": true,
        //             "transferEnabled": true,
        //             "buyEnabled": false,
        //             "purchaseEnabled": false,
        //             "redeemEnabled": false,
        //             "active": true,
        //             "withdrawalFee": "50000000000000000",
        //             "purchaseCommissions": []
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            result.push (this.parseCurrency (currency));
        }
        return this.indexBy (result, 'code');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const period = this.safeString (this.options['fetchTickers'], 'period', '1d');
        const request = {
            'period': this.timeframes[period], // I1, I5, I15, I30, H1, H2, H4, H6, H12, D1, W1
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        //
        //     [
        //         {
        //             "ask": 0.017,
        //             "bid": 0.016,
        //             "high": 0.019,
        //             "last": 0.017,
        //             "low": 0.015,
        //             "market": "TIME/ETH",
        //             "open": 0.016,
        //             "period": "H1",
        //             "timestamp": "2018-12-14T20:50:36.134Z",
        //             "volume": 4.57,
        //             "volumeQuote": 0.07312
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const period = this.safeString (this.options['fetchTickers'], 'period', '1d');
        const request = {
            'market': market['id'],
            'period': this.timeframes[period], // I1, I5, I15, I30, H1, H2, H4, H6, H12, D1, W1
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        //
        //     [
        //         {
        //             "ask": 0.017,
        //             "bid": 0.016,
        //             "high": 0.019,
        //             "last": 0.017,
        //             "low": 0.015,
        //             "market": "TIME/ETH",
        //             "open": 0.016,
        //             "period": "H1",
        //             "timestamp": "2018-12-14T20:50:36.134Z",
        //             "volume": 4.57,
        //             "volumeQuote": 0.07312
        //         }
        //     ]
        //
        const ticker = this.safeValue (response, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderbookV2 (this.extend (request, params));
        //
        //     {
        //         "timestamp":"2019-12-05T00:21:09.538",
        //         "bid":[
        //             {
        //                 "index":"2",
        //                 "price":"0.02024007",
        //                 "baseTokenAmount":"0.0096894",
        //                 "baseTokenCumulativeAmount":"0.0096894",
        //                 "quoteTokenAmount":"0.000196114134258",
        //                 "quoteTokenCumulativeAmount":"0.000196114134258"
        //             },
        //         "ask":[
        //             {
        //                 "index":"-3",
        //                 "price":"0.02024012",
        //                 "baseTokenAmount":"0.005",
        //                 "baseTokenCumulativeAmount":"0.005",
        //                 "quoteTokenAmount":"0.0001012006",
        //                 "quoteTokenCumulativeAmount":"0.0001012006"
        //             },
        //         ]
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (response, timestamp, 'bid', 'ask', 'price', 'baseTokenAmount');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'fetchTrades', {});
        const defaultSort = this.safeValue (options, 'sort', 'timestamp,asc');
        const sort = this.safeString (params, 'sort', defaultSort);
        const query = this.omit (params, 'sort');
        const request = {
            // 'address': 'string', // trade’s member account (?)
            // 'cursor': 1234, // int64 (?)
            // 'from': this.iso8601 (since),
            'market': market['id'],
            // 'page': 0, // results page you want to retrieve 0 .. N
            // 'size': limit, // number of records per page, 100 by default
            'sort': sort, // array[string], sorting criteria in the format "property,asc" or "property,desc", default is ascending
            // 'till': this.iso8601 (this.milliseconds ()),
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['size'] = limit; // default is 100
        }
        const response = await this.publicGetTrades (this.extend (request, query));
        //
        //     [
        //         {
        //             "id":1,
        //             "timestamp":"2019-06-25T17:01:50.309",
        //             "direction":"BUY",
        //             "price":"0.027",
        //             "quantity":"0.001"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
        };
        // if since and limit are not specified
        const duration = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
            if (limit !== undefined) {
                request['till'] = this.iso8601 (this.sum (since, this.sum (limit, 1) * duration * 1000));
            }
        } else if (limit !== undefined) {
            const now = this.milliseconds ();
            request['till'] = this.iso8601 (now);
            request['from'] = this.iso8601 (now - limit * duration * 1000 - 1);
        } else {
            request['till'] = this.iso8601 (this.milliseconds ());
        }
        const response = await this.publicGetCandles (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp":"2019-12-04T23:00:00",
        //             "open":"0.02024009",
        //             "high":"0.02024009",
        //             "low":"0.02024009",
        //             "close":"0.02024009",
        //             "volume":"0.00008096036",
        //             "volumeQuote":"0.004",
        //         },
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.tradingGetBalances (params);
        //
        //     [
        //         {"currency":"BTC","totalBalance":"0","lockedBalance":"0"},
        //         {"currency":"AUDT","totalBalance":"0","lockedBalance":"0"},
        //         {"currency":"ETH","totalBalance":"0","lockedBalance":"0"},
        //         {"currency":"TIME","totalBalance":"0","lockedBalance":"0"},
        //         {"currency":"USDT","totalBalance":"0","lockedBalance":"0"}
        //     ]
        //
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'totalBalance');
            account['used'] = this.safeFloat (balance, 'lockedBalance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'side': side.toUpperCase (),
            // 'clientOrderId': '123',
            // 'expireIn': 1575523308, // in seconds
            // 'expireTime': 1575523308, // unix timestamp
        };
        let query = params;
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            const defaultExpireIn = this.safeInteger (this.options, 'expireIn');
            const expireTime = this.safeValue (params, 'expireTime');
            const expireIn = this.safeValue (params, 'expireIn', defaultExpireIn);
            if (expireTime !== undefined) {
                request['expireTime'] = expireTime;
            } else if (expireIn !== undefined) {
                request['expireIn'] = expireIn;
            } else {
                throw new InvalidOrder (this.id + ' createOrder method requires a expireTime or expireIn param for a ' + type + ' order, you can also set the expireIn exchange-wide option');
            }
            query = this.omit (params, [ 'expireTime', 'expireIn' ]);
        } else {
            request['price'] = 0;
        }
        const response = await this.tradingPostOrders (this.extend (request, query));
        //
        //     {
        //         "orders": [
        //             {
        //                 "cancelledQuantity": "0.3",
        //                 "clientOrderId": "my-order-1",
        //                 "createdAt": "1970-01-01T00:00:00",
        //                 "cursorId": 50,
        //                 "expireTime": "1970-01-01T00:00:00",
        //                 "filledQuantity": "0.3",
        //                 "id": "string",
        //                 "price": "0.017",
        //                 "quantity": "0.3",
        //                 "side": "BUY",
        //                 "symbol": "TIMEETH",
        //                 "type": "LIMIT",
        //                 "updatedAt": "1970-01-01T00:00:00"
        //             }
        //         ]
        //     }
        //
        const orders = this.safeValue (response, 'orders', []);
        const order = this.safeValue (orders, 0, {});
        return this.parseOrder (order, market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
        };
        if (amount !== undefined) {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.tradingPutOrders (this.extend (request, params));
        //
        //     {
        //         "changedOrders": [
        //             {
        //                 "newOrder": {
        //                 "cancelledQuantity": "0.3",
        //                 "clientOrderId": "my-order-1",
        //                 "createdAt": "1970-01-01T00:00:00",
        //                 "cursorId": 50,
        //                 "expireTime": "1970-01-01T00:00:00",
        //                 "filledQuantity": "0.3",
        //                 "id": "string",
        //                 "price": "0.017",
        //                 "quantity": "0.3",
        //                 "side": "BUY",
        //                 "symbol": "TIMEETH",
        //                 "type": "LIMIT",
        //                 "updatedAt": "1970-01-01T00:00:00"
        //                 },
        //                 "oldId": "string",
        //             },
        //         ],
        //         "unchangedOrders": [ "string" ],
        //     }
        //
        if ('unchangedOrders' in response) {
            const orderIds = this.safeValue (response, 'unchangedOrders', []);
            const orderId = this.safeString (orderIds, 0);
            return {
                'id': orderId,
                'info': response,
            };
        }
        const orders = this.safeValue (response, 'changedOrders', []);
        const firstOrder = this.safeValue (orders, 0, {});
        const order = this.safeValue (firstOrder, 'newOrder', {});
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.cancelOrders ([ id ], symbol, params);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': ids,
        };
        const response = await this.tradingDeleteOrders (this.extend (request, params));
        //
        //     {
        //         "changedOrders": [
        //             {
        //                 "newOrder": {
        //                     "cancelledQuantity": "0.3",
        //                     "clientOrderId": "my-order-1",
        //                     "createdAt": "1970-01-01T00:00:00",
        //                     "cursorId": 50,
        //                     "expireTime": "1970-01-01T00:00:00",
        //                     "filledQuantity": "0.3",
        //                     "id": "string",
        //                     "price": "0.017",
        //                     "quantity": "0.3",
        //                     "side": "BUY",
        //                     "symbol": "TIMEETH",
        //                     "type": "LIMIT",
        //                     "updatedAt": "1970-01-01T00:00:00"
        //                 },
        //                 "oldId": "string",
        //             },
        //         ],
        //         "unchangedOrders": [ "string" ],
        //     }
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderHash': id,
        };
        const response = await this.historyGetOrdersDetails (request);
        //
        //     {
        //         "order": {
        //             "cancelledQuantity": "0.3",
        //             "clientOrderId": "my-order-1",
        //             "createdAt": "1970-01-01T00:00:00",
        //             "cursorId": 50,
        //             "expireTime": "1970-01-01T00:00:00",
        //             "filledQuantity": "0.3",
        //             "id": "string",
        //             "price": "0.017",
        //             "quantity": "0.3",
        //             "side": "BUY",
        //             "symbol": "TIMEETH",
        //             "type": "LIMIT",
        //             "updatedAt": "1970-01-01T00:00:00"
        //         },
        //         "trades": [
        //             {
        //                 "fee": "0.3",
        //                 "id": 100,
        //                 "makerOrTaker": "MAKER",
        //                 "makerOrderId": "string",
        //                 "price": "0.017",
        //                 "quantity": "0.3",
        //                 "side": "BUY",
        //                 "symbol": "TIMEETH",
        //                 "takerOrderId": "string",
        //                 "timestamp": "2019-12-05T07:48:26.310Z"
        //             }
        //         ]
        //     }
        //
        const order = this.safeValue (response, 'order', {});
        const trades = this.safeValue (response, 'trades', []);
        return this.parseOrder (this.extend (order, { 'trades': trades }));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        const defaultSort = this.safeValue (options, 'sort', 'createdAt,asc');
        const sort = this.safeString (params, 'sort', defaultSort);
        const query = this.omit (params, 'sort');
        const request = {
            // 'clientOrderId': '123', // order’s client id list for filter
            // page: 0, // results page you want to retrieve (0 .. N)
            'sort': sort, // sorting criteria in the format "property,asc" or "property,desc", default order is ascending, multiple sort criteria are supported
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.tradingGetOrders (this.extend (request, query));
        //
        //     {
        //         "orders": [
        //             {
        //                 "cancelledQuantity": "0.3",
        //                 "clientOrderId": "my-order-1",
        //                 "createdAt": "1970-01-01T00:00:00",
        //                 "cursorId": 50,
        //                 "expireTime": "1970-01-01T00:00:00",
        //                 "filledQuantity": "0.3",
        //                 "id": "string",
        //                 "price": "0.017",
        //                 "quantity": "0.3",
        //                 "side": "BUY",
        //                 "symbol": "TIMEETH",
        //                 "type": "LIMIT",
        //                 "updatedAt": "1970-01-01T00:00:00"
        //             }
        //         ]
        //     }
        //
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchClosedOrders', {});
        const defaultSort = this.safeValue (options, 'sort', 'createdAt,asc');
        const sort = this.safeString (params, 'sort', defaultSort);
        const query = this.omit (params, 'sort');
        const request = {
            // 'clientOrderId': '123', // order’s client id list for filter
            // page: 0, // results page you want to retrieve (0 .. N)
            'sort': sort, // sorting criteria in the format "property,asc" or "property,desc", default order is ascending, multiple sort criteria are supported
            'side': 'BUY', // or 'SELL'
            // 'till': this.iso8601 (this.milliseconds ()),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.historyGetOrders (this.extend (request, query));
        //
        //     {
        //         "orders": [
        //             {
        //                 "cancelledQuantity": "0.3",
        //                 "clientOrderId": "my-order-1",
        //                 "createdAt": "1970-01-01T00:00:00",
        //                 "cursorId": 50,
        //                 "expireTime": "1970-01-01T00:00:00",
        //                 "filledQuantity": "0.3",
        //                 "id": "string",
        //                 "price": "0.017",
        //                 "quantity": "0.3",
        //                 "side": "BUY",
        //                 "symbol": "TIMEETH",
        //                 "type": "LIMIT",
        //                 "updatedAt": "1970-01-01T00:00:00"
        //             }
        //         ]
        //     }
        //
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchMyTrades', {});
        const defaultSort = this.safeValue (options, 'sort', 'timestamp,asc');
        const sort = this.safeString (params, 'sort', defaultSort);
        const query = this.omit (params, 'sort');
        const request = {
            // 'cursorId': 123, // int64 (?)
            // 'from': this.iso8601 (since),
            // 'makerOrderId': '1234', // maker order hash
            // 'owner': '...', // owner address (?)
            // 'page': 0, // results page you want to retrieve (0 .. N)
            // 'side': 'BUY', // or 'SELL'
            // 'size': limit,
            'sort': sort, // sorting criteria in the format "property,asc" or "property,desc", default order is ascending, multiple sort criteria are supported
            // 'symbol': market['id'],
            // 'takerOrderId': '1234',
            // 'till': this.iso8601 (this.milliseconds ()),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.historyGetTrades (this.extend (request, query));
        //
        //     {
        //         "trades": [
        //             {
        //                 "fee": "0.3",
        //                 "id": 100,
        //                 "makerOrTaker": "MAKER",
        //                 "makerOrderId": "string",
        //                 "price": "0.017",
        //                 "quantity": "0.3",
        //                 "side": "BUY",
        //                 "symbol": "TIMEETH",
        //                 "takerOrderId": "string",
        //                 "timestamp": "2019-12-08T04:54:11.171Z"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'markets': market['id'],
        };
        const response = await this.tradingGetFees (this.extend (request, params));
        //
        //     [
        //         {
        //             "fee": 0.0075,
        //             "market": "ETHBTC"
        //         }
        //     ]
        //
        const result = this.safeValue (response, 0, {});
        return {
            'info': response,
            'maker': this.safeFloat (result, 'fee'),
            'taker': undefined,
        };
    }

    parseMarket (market) {
        //
        //     {
        //         "symbol": "ETHBTC",
        //         "name": "ETH/BTC",
        //         "baseCurrency": "ETH",
        //         "baseTokenAddress": "0x45932db54b38af1f5a57136302eeba66a5975c15",
        //         "quoteCurrency": "BTC",
        //         "quoteTokenAddress": "0x8370fbc6ddec1e18b4e41e72ed943e238458487c",
        //         "feeCurrency": "BTC",
        //         "feeTokenAddress": "0x8370fbc6ddec1e18b4e41e72ed943e238458487c",
        //         "quantityIncrement": "0.0000001",
        //         "takerFee": "0.005",
        //         "makerFee": "0.0025",
        //         "tickSize": "0.00000001",
        //         "baseMinSize": "0.0001",
        //         "quoteMinSize": "0.00001",
        //         "locked": false
        //     }
        //
        const locked = this.safeValue (market, 'locked');
        const active = !locked;
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseCurrency');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const precision = {
            'amount': this.precisionFromString (this.safeString (market, 'quantityIncrement')),
            'price': this.precisionFromString (this.safeString (market, 'tickSize')),
        };
        const amountIncrement = this.safeFloat (market, 'quantityIncrement');
        const minBase = this.safeFloat (market, 'baseMinSize');
        const minAmount = Math.max (amountIncrement, minBase);
        const priceIncrement = this.safeFloat (market, 'tickSize');
        const minCost = this.safeFloat (market, 'quoteMinSize');
        const limits = {
            'amount': { 'min': minAmount, 'max': undefined },
            'price': { 'min': priceIncrement, 'max': undefined },
            'cost': { 'min': Math.max (minCost, minAmount * priceIncrement), 'max': undefined },
        };
        const taker = this.safeFloat (market, 'takerFee');
        const maker = this.safeFloat (market, 'makerFee');
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'type': 'spot',
            'active': active,
            'precision': precision,
            'limits': limits,
            'taker': taker,
            'maker': maker,
            'info': market,
        };
    }

    parseCurrency (currency) {
        //
        //     {
        //         "symbol": "BTC",
        //         "name": "Bitcoin",
        //         "address": "0x8370fbc6ddec1e18b4e41e72ed943e238458487c",
        //         "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR...mc+Cg==",
        //         "background": "transparent",
        //         "fiatSymbol": "BTC",
        //         "decimals": 8,
        //         "tradeDecimals": 20,
        //         "displayDecimals": 4,
        //         "crypto": true,
        //         "depositEnabled": true,
        //         "withdrawalEnabled": true,
        //         "transferEnabled": true,
        //         "buyEnabled": false,
        //         "purchaseEnabled": false,
        //         "redeemEnabled": false,
        //         "active": true,
        //         "withdrawalFee": "50000000000000000",
        //         "purchaseCommissions": []
        //     },
        //
        const id = this.safeString (currency, 'symbol');
        const code = this.safeCurrencyCode (id);
        const name = this.safeString (currency, 'name');
        const precision = this.safeInteger (currency, 'decimals');
        const active = this.safeValue (currency, 'active');
        // const fee = this.safeFloat (currency, 'withdrawalFee');
        const feeString = this.safeString (currency, 'withdrawalFee');
        const feeStringLen = feeString.length;
        const tradeDecimals = this.safeInteger (currency, 'tradeDecimals');
        let fee = undefined;
        const dotIndex = feeStringLen - tradeDecimals;
        if (dotIndex > 0) {
            const whole = feeString.slice (0, dotIndex);
            const fraction = feeString.slice (-dotIndex);
            fee = parseFloat (whole + '.' + fraction);
        } else {
            let fraction = '.';
            for (let i = 0; i < -dotIndex; i++) {
                fraction += '0';
            }
            fee = parseFloat (fraction + feeString);
        }
        return {
            'id': code,
            'code': code,
            'info': currency,
            'type': undefined,
            'name': name,
            'active': active,
            'fee': fee,
            'precision': precision,
            'limits': {
                'withdraw': { 'min': fee, 'max': undefined },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            },
        };
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "ask": 0.017,
        //         "bid": 0.016,
        //         "high": 0.019,
        //         "last": 0.017,
        //         "low": 0.015,
        //         "market": "TIME/ETH",
        //         "open": 0.016,
        //         "period": "H1",
        //         "timestamp": "2018-12-14T20:50:36.134Z",
        //         "volume": 4.57,
        //         "volumeQuote": 0.07312
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'market');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('/');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const last = this.safeFloat (ticker, 'last');
        const open = this.safeFloat (ticker, 'open');
        let change = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        let percentage = undefined;
        if (change !== undefined && open) {
            percentage = (change / open) * 100;
        }
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volumeQuote'),
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":1,
        //         "timestamp":"2019-06-25T17:01:50.309",
        //         "direction":"BUY",
        //         "price":"0.027",
        //         "quantity":"0.001"
        //     }
        //
        // fetchMyTrades, fetchOrder (private)
        //
        //     {
        //         "fee": "0.3",
        //         "id": 100,
        //         "makerOrTaker": "MAKER",
        //         "makerOrderId": "string",
        //         "price": "0.017",
        //         "quantity": "0.3",
        //         "side": "BUY",
        //         "symbol": "TIMEETH",
        //         "takerOrderId": "string",
        //         "timestamp": "2019-12-08T04:54:11.171Z"
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        const id = this.safeString (trade, 'id');
        const side = this.safeStringLower2 (trade, 'direction', 'side');
        const takerOrMaker = this.safeStringLower (trade, 'makerOrTaker');
        let orderId = undefined;
        if (takerOrMaker !== undefined) {
            orderId = this.safeString (trade, takerOrMaker + 'OrderId');
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrency = (market === undefined) ? undefined : market['quote'];
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = this.costToPrecision (symbol, amount * price);
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //     {
        //         "timestamp":"2019-12-04T23:00:00",
        //         "open":"0.02024009",
        //         "high":"0.02024009",
        //         "low":"0.02024009",
        //         "close":"0.02024009",
        //         "volume":"0.00008096036",
        //         "volumeQuote":"0.004",
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'timestamp')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volumeQuote'),
        ];
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder, createOrder, cancelOrder, cancelOrders, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "cancelledQuantity": "0.3",
        //         "clientOrderId": "my-order-1",
        //         "createdAt": "1970-01-01T00:00:00",
        //         "cursorId": 50,
        //         "expireTime": "1970-01-01T00:00:00",
        //         "filledQuantity": "0.3",
        //         "id": "string",
        //         "price": "0.017",
        //         "quantity": "0.3",
        //         "side": "BUY",
        //         "symbol": "TIMEETH",
        //         "type": "LIMIT",
        //         "updatedAt": "1970-01-01T00:00:00"
        //         "trades": [], // injected from the outside
        //     }
        //
        const id = this.safeString (order, 'id');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        let symbol = undefined;
        const marketId = this.safeString (order, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'quantity');
        const filled = this.safeFloat (order, 'filledQuantity');
        const canceledQuantity = this.safeFloat (order, 'cancelledQuantity');
        let remaining = undefined;
        let status = undefined;
        if ((amount !== undefined) && (filled !== undefined)) {
            remaining = Math.max (amount - filled, 0.0);
            if (filled >= amount) {
                status = 'closed';
            } else if ((canceledQuantity !== undefined) && (canceledQuantity > 0)) {
                status = 'canceled';
            } else {
                status = 'open';
            }
        }
        const cost = parseFloat (this.costToPrecision (symbol, price * filled));
        const fee = undefined;
        let lastTradeTimestamp = undefined;
        let trades = undefined;
        const rawTrades = this.safeValue (order, 'trades');
        if (rawTrades !== undefined) {
            trades = this.parseTrades (rawTrades, market, undefined, undefined, {
                'order': id,
            });
        }
        if (trades !== undefined) {
            const numTrades = trades.length;
            if (numTrades > 0) {
                lastTradeTimestamp = trades[numTrades - 1]['timestamp'];
            }
        }
        const clientOrderId = this.safeString (order, 'clientOrderId');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/' + path;
        if (Object.keys (params).length) {
            url += '?' + this.urlencodeWithArrayRepeat (params);
        }
        if (api !== 'public') {
            this.checkRequiredCredentials ();
            const auth = this.stringToBase64 (this.encode (this.apiKey + ':' + this.secret));
            const secret = 'Basic ' + this.decode (auth);
            headers = { 'authorization': secret };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (statusCode >= 400) {
            //
            //     {"error":{"timestamp":"05.12.2019T05:25:43.584+0000","status":"BAD_REQUEST","message":"Insufficient ETH balance. Required: 1, actual: 0.","code":4001}}
            //     {"error":{"timestamp":"05.12.2019T04:03:25.419+0000","status":"FORBIDDEN","message":"Access denied","code":4300}}
            //
            const feedback = this.id + ' ' + responseBody;
            let error = this.safeValue (response, 'error');
            if (error === undefined) {
                error = response;
            }
            const code = this.safeString2 (error, 'code', 'status');
            const message = this.safeString2 (error, 'message', 'debugMessage');
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
