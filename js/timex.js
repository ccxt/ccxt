'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, PermissionDenied, InvalidAddress, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, NotSupported, BadRequest, AuthenticationError } = require ('./base/errors');

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
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchTickers': true,
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
                'logo': 'https://timex.io/static/img/exchange-logo.svg',
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
                // 'public': {
                //     'get': [
                //         '/public/candles',
                //         '/public/currencies',
                //         '/public/markets',
                //         '/public/orderbook/v2',
                //         '/public/tickers',
                //         '/public/trades',
                //     ],
                // },
                // 'private': {
                //     'get': [
                //         '/custody/deposit-addresses',
                //         '/history/orders',
                //         '/history/orders/details',
                //         '/history/trades',
                //         '/trading/balances',
                //         '/trading/orders',
                //     ],
                //     'post': [
                //         '/trading/orders',
                //     ],
                //     'put': [
                //         '/trading/orders',
                //     ],
                //     'delete': [
                //         '/trading/orders',
                //     ],
                // },
            },
            'exceptions': {
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
                '429': DDoSProtection,
                '500': ExchangeError,
                '503': ExchangeNotAvailable,
            },
            'options': {
                'fetchTickers': {
                    'period': '1d',
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
        const response = await this.publicGetPublicOrderbookV2 (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (response, timestamp, 'bid', 'ask', 'price', 'baseTokenAmount');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'sort': this.options['defaultSort'],
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetPublicTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
            // 'from': this.iso8601 (this.parseDate ('2019-08-01T00:00:00Z')),
            'till': this.iso8601 (this.milliseconds ()),
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        const response = await this.publicGetCandles (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetTradingBalances (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = balance['currency'];
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
        };
        let expireTimeIsRequired = false;
        let priceIsRequired = false;
        if (type === 'limit') {
            priceIsRequired = true;
            expireTimeIsRequired = true;
        } else {
            request['price'] = 0;
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (expireTimeIsRequired) {
            const expireTime = this.safeValue (params, 'expireTime') || this.safeValue (params, 'expireIn');
            if (expireTime === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a expireTime or expireIn param for a ' + type + ' order');
            }
        }
        const response = await this.privatePostTradingOrders (this.extend (request, params));
        return this.parseOrder (response['orders'].shift (), market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        if (amount !== undefined) {
            request['quantity'] = amount;
        }
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this.privatePutTradingOrders (this.extend (request, params));
        if ('unchangedOrders' in response) {
            const orderId = response['unchangedOrders'][0];
            return {
                'id': orderId,
                'info': response,
            };
        }
        return this.parseOrder (response['changedOrders'].shift ()['newOrder']);
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
        const response = await this.privateDeleteTradingOrders (this.extend (request, params));
        return {
            'info': response,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderHash': id,
        };
        const response = await this.privateGetHistoryOrdersDetails (request);
        return this.parseOrder (this.extend (response['order'], { 'trades': response['trades'] }));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const openOrders = await this.fetchOpenOrders (symbol, since, limit, params);
        const closedOrders = await this.fetchClosedOrders (symbol, since, limit, params);
        let orders = this.arrayConcat (openOrders, closedOrders);
        orders = this.sortBy (orders, 'timestamp');
        return this.filterBySinceLimit (orders, undefined, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'sort': this.options['defaultSortOrders'],
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privateGetTradingOrders (this.extend (request, params));
        return this.parseOrders (response['orders'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'sort': this.options['defaultSortOrders'],
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privateGetHistoryOrders (this.extend (request, params));
        return this.parseOrders (response['orders'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'sort': this.options['defaultSort'],
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
        const response = await this.privateGetHistoryTrades (this.extend (request, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const response = await this.privateGetCustodyDepositAddresses (params);
        const addresses = this.parseDepositAddresses (response, currency['code']);
        if (addresses.length) {
            return addresses.shift ();
        }
        throw new InvalidAddress (this.id + ' fetchDepositAddress returned an empty response – create the deposit address in the user settings first.');
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        if (codes === undefined) {
            codes = Object.keys (this.currencies);
        }
        if (!Array.isArray (codes)) {
            throw new InvalidAddress (this.id + ' fetchDepositAddresses expected an array in the codes argument');
        }
        const response = await this.privateGetCustodyDepositAddresses (params);
        let result = [];
        for (let i = 0; i < codes.length; ++i) {
            const currency = this.currency (codes[i]);
            result = this.arrayConcat (result, this.parseDepositAddresses (response, currency['code']));
        }
        if (result.length) {
            return result;
        }
        throw new InvalidAddress (this.id + ' fetchDepositAddresses returned an empty response – create the deposit address in the user settings first.');
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

    parseTrade (trade, market = undefined, orderId = undefined) {
        if (market === undefined) {
            market = this.findMarket (this.safeString (trade, 'symbol'));
        }
        const symbol = market['symbol'];
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        const id = this.safeString (trade, 'id');
        let side = undefined;
        if ('direction' in trade) {
            side = this.safeString (trade, 'direction').toLowerCase ();
        } else {
            side = this.safeString (trade, 'side').toLowerCase ();
        }
        let takerOrMaker = this.safeString (trade, 'makerOrTaker');
        if (takerOrMaker !== undefined) {
            takerOrMaker = takerOrMaker.toLowerCase ();
            orderId = this.safeString (trade, takerOrMaker + 'OrderId');
        } else if (orderId !== undefined) {
            if (this.safeString (trade, 'makerOrderId') === orderId) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        }
        let fee = undefined;
        const costFee = this.safeFloat (trade, 'fee');
        if (costFee !== undefined) {
            fee = {
                'cost': costFee,
                'currency': market['feeCurrency'],
            };
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
            'cost': this.costToPrecision (symbol, price * amount),
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        };
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined, orderId = undefined, params = {}) {
        let result = [];
        for (let i = 0; i < trades.length; ++i) {
            result.push (this.extend (this.parseTrade (trades[i], market, orderId), params));
        }
        result = this.sortBy (result, 'timestamp');
        const symbol = this.findSymbol (undefined, market);
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (this.safeString (ohlcv, 'timestamp')),
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['volume']),
        ];
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        if (market === undefined) {
            market = this.findMarket (this.safeString (order, 'symbol'));
        }
        const symbol = market['symbol'];
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'quantity');
        const filled = this.safeFloat (order, 'filledQuantity');
        const remaining = Math.max (amount - filled, 0.0);
        const cost = parseFloat (this.costToPrecision (symbol, price * filled));
        let status = undefined;
        if (filled === amount) {
            status = 'closed';
        } else if (this.safeFloat (order, 'cancelledQuantity') > 0) {
            status = 'canceled';
        } else {
            status = 'open';
        }
        const fee = undefined;
        let lastTradeTimestamp = undefined;
        let trades = undefined;
        if ('trades' in order) {
            trades = this.parseTrades (order['trades'], market, undefined, undefined, id);
        }
        if (trades && trades.length > 0) {
            const numTrades = trades.length;
            lastTradeTimestamp = trades[numTrades - 1]['timestamp'];
        }
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': trades,
            'lastTradeTimestamp': lastTradeTimestamp,
            'fee': fee,
            'info': order,
        };
    }

    parseDepositAddresses (addresses, code) {
        const result = [];
        const isBTC = (code === 'BTC');
        for (let i = 0; i < addresses.length; ++i) {
            const address = addresses[i]['address'];
            if ((address['type'] !== 'ETHEREUM') === isBTC) {
                result.push (this.parseDepositAddress (addresses[i], code));
            }
        }
        return result;
    }

    parseDepositAddress (dataAddress, code) {
        const address = dataAddress['address'];
        return {
            'currency': code,
            'address': this.checkAddress (this.safeString (address, 'depositAddress')),
            'tag': undefined,
            'info': dataAddress,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/' + path;
        if (Object.keys (params).length) {
            // url += '?' + this.urlencodewitharrayrepeat (params);
            url += '?' + this.urlencode (params);
        }
        if (api === 'private') {
            const secret = 'Basic ' + this.stringToBase64 (this.apiKey + ':' + this.secret);
            headers = { 'authorization': secret };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (statusCode >= 400) {
            if (responseBody[0] === '{') {
                let error = response;
                if (this.isObject (response['error'])) {
                    error = response['error'];
                }
                const errorCode = this.safeInteger (error, 'code') || this.safeInteger (error, 'status');
                let message = this.safeString (error, 'message') || this.safeString (error, 'debugMessage');
                const ExceptionClass = this.safeValue2 (this.exceptions, message, errorCode);
                if (message === 'Validation error') {
                    const fieldErrors = error['subErrors'];
                    const messages = [];
                    for (let i = 0; i < fieldErrors.length; ++i) {
                        const fieldError = fieldErrors[i];
                        messages.push (fieldError['field'] + ' ' + fieldError['problem']);
                    }
                    message = messages.join ('; ');
                }
                if (ExceptionClass !== undefined) {
                    throw new ExceptionClass (this.id + ' ' + message);
                }
                const feedback = this.id + ' ' + responseBody;
                throw new ExchangeError (feedback);
            }
        }
    }
};
