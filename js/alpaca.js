'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidOrder, BadRequest, InsufficientFunds, OrderNotFound, RateLimitExceeded, PermissionDenied, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');
//  ---------------------------------------------------------------------------xs

module.exports = class alpaca extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'alpaca',
            'name': 'Alpaca',
            'countries': [ 'US' ],
            'rateLimit': 300, // 200 calls per min --> 300 ms between calls
            'hostname': 'alpaca.markets',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/26471228/142237130-8f3a06c5-7e35-4fa1-9a82-28ac25795490.jpg',
                'www': 'https://alpaca.markets',
                'api': {
                    'public': 'https://api.alpaca.markets/{version}',
                    'private': 'https://api.alpaca.markets/{version}',
                    'cryptoPrivate': 'https://data.alpaca.markets/{version}',
                },
                'test': {
                    'public': 'https://paper-api.alpaca.markets/{version}',
                    'private': 'https://paper-api.alpaca.markets/{version}',
                    'cryptoPrivate': 'https://data.alpaca.markets/{version}',
                },
                'doc': 'https://alpaca.markets/docs/',
                'fees': 'https://alpaca.markets/support/what-are-the-fees-associated-with-crypto-trading/',
            },
            'has': {
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchOrderBook': 'emulated',
                'fetchBalance': 'emulated',
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
            },
            'api': {
                'public': {
                },
                'private': {
                    'get': [
                        'assets',
                        'account',
                        'orders',
                        'orders/{order_id}',
                        'positions',
                        'positions/{symbol}',
                        'account/activities/{activity_type}',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders',
                        'orders/{order_id}',
                    ],
                },
                'cryptoPrivate': {
                    'get': [
                        'crypto/{symbol}/quotes/latest',
                        'crypto/{symbol}/trades/latest',
                        'crypto/{symbol}/xbbo/latest',
                        'crypto/{symbol}/trades',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'versions': {
                    'public': 'v2',
                    'private': 'v2',
                    'cryptoPrivate': 'v1beta1', // crypto beta
                },
                'defaultExchange': 'CBSE',
                'exchanges': [
                    'CBSE', // Coinbase
                    'FTX',
                    'GNSS', // Genesis
                    'ERSX', // ErisX
                ],
                'defaultTimeInForce': 'day', // fok, gtc, ioc
                'clientOrderId': 'ccxt_{id}',
            },
            'exceptions': {
                'exact': {
                    'buying power or shares is not sufficient.': InsufficientFunds,
                    'order is not found': OrderNotFound,
                    'failed to cancel order': InvalidOrder,
                    'the order is not cancelable': InvalidOrder,
                    'position is not found': BadRequest,
                    'Failed to liquidate': InvalidOrder,
                    'position does not exist': BadRequest,
                },
                'broad': {
                    'input parameters are not recognized': BadRequest,
                    'invalid query parameters': BadRequest,
                    'unauthorized': PermissionDenied,
                    'too many requests': RateLimitExceeded,
                    'not found': BadSymbol,
                    'request is not authorized': PermissionDenied,
                    'forbidden': PermissionDenied,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const request = {
            'asset_class': 'crypto',
            'tradeable': true,
        };
        const assets = await this.privateGetAssets (this.extend (request, params));
        // {
        //     "id": "904837e3-3b76-47ec-b432-046db621571b",
        //     "class": "us_equity",
        //     "exchange": "NASDAQ",
        //     "symbol": "AAPL",
        //     "status": "active",
        //     "tradable": true,
        //     "marginable": true,
        //     "shortable": true,
        //     "easy_to_borrow": true,
        //     "fractionable": true
        //   }
        const ids = [];
        for (let i = 0; i < assets.length; i++) {
            ids.push (assets[i]['symbol']);
        }
        const markets = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            // will need to change if base or quote currency ticker` length changes
            const base = id.slice (0, 3).toUpperCase ();
            const quote = id.slice (3, 6).toUpperCase ();
            const symbol = base + '/' + quote;
            const baseId = base.toLowerCase ();
            const quoteId = quote.toLowerCase ();
            const active = true;
            const taker = 0;
            const maker = 0;
            const percentage = false;
            const tierBased = false;
            const feeSide = undefined;
            const precision = {
                'price': undefined,
                'amount': undefined,
                'cost': undefined,
            };
            const info = undefined;
            const spot = true;
            markets.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': taker,
                'maker': maker,
                'tierBased': percentage,
                'percentage': tierBased,
                'feeSide': feeSide,
                'type': 'spot',
                'spot': spot,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': info,
            });
        }
        return markets;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbol': id,
        };
        // specify exchange to avoid bidPrice > askPrice --- interexchange arbitrage opportunities
        // needed to add to pass orderbook test: assert (bids[0][0] <= asks[0][0])
        if (!('exchanges' in params)) {
            params['exchanges'] = this.safeString (this.options, 'defaultExchange');
        }
        const response = await this.cryptoPrivateGetCryptoSymbolXbboLatest (this.extend (request, params));
        // {
        //     "symbol": "BTCUSD",
        //     "xbbo": {
        //     "t": "2021-11-16T22:16:00.468860416Z",
        //     "ax": "FTX",
        //     "ap": 60564,
        //     "as": 0.36,
        //     "bx": "FTX",
        //     "bp": 60555,
        //     "bs": 0.36
        // }
        const ticker = this.safeValue (response, 'xbbo', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbol': id,
        };
        if (since !== undefined) {
            request['start'] = this.iso8601 (since);
        } else {
            request['start'] = this.iso8601 (this.milliseconds ());
        }
        if (limit !== undefined) {
            // hack to parse limit as integer
            request['limit'] = this.safeInteger ({ 'limit': limit }, 'limit');
        }
        const response = await this.cryptoPrivateGetCryptoSymbolTrades (this.extend (request, params));
        // {
        //     "symbol": "BTCUSD",
        //     "trades": [
        //          {
        //          "t": "2021-11-17T00:18:02.530806Z",
        //          "x": "CBSE",
        //          "p": 60011.36,
        //          "s": 0.00956419,
        //          "tks": "S",
        //          "i": 237168320
        //          },
        // }
        const trades = this.safeValue (response, 'trades', {});
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // Alpaca does not support level 2 depth orderbook
        // We emulate fetchOrderbook with single BBO
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbol': id,
        };
        // specify exchange to avoid bidPrice > askPrice --- interexchange arbitrage opportunities
        // needed to add to pass orderbook test: assert (bids[0][0] <= asks[0][0])
        if (!('exchanges' in params)) {
            params['exchanges'] = this.safeString (this.options, 'defaultExchange');
        }
        const response = await this.cryptoPrivateGetCryptoSymbolXbboLatest (this.extend (request, params));
        // {
        //     "symbol": "BTCUSD",
        //     "xbbo": {
        //     "t": "2021-11-16T22:16:00.468860416Z",
        //     "ax": "FTX",
        //     "ap": 60564,
        //     "as": 0.36,
        //     "bx": "FTX",
        //     "bp": 60555,
        //     "bs": 0.36
        // }
        const quote = this.safeValue (response, 'xbbo', {});
        const shallow_bid = [this.safeNumber (quote, 'bp'), this.safeNumber (quote, 'bs')];
        const shallow_ask = [this.safeNumber (quote, 'ap'), this.safeNumber (quote, 'as')];
        const timestamp = this.milliseconds (); // parseDate (this.safeString (quote, 't'));
        const orderbook = {
            'bids': [shallow_bid],
            'asks': [shallow_ask],
        };
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const free = {};
        const used = {};
        const total = {};
        const currencies = {};
        const accountResponse = await this.privateGetAccount ();
        // {
        //     "account_blocked": false,
        //     "account_number": "010203ABCD",
        //     "buying_power": "262113.632",
        //     "cash": "-23140.2",
        //     "created_at": "2019-06-12T22:47:07.99658Z",
        //     "currency": "USD",
        //     "daytrade_count": 0,
        //     "daytrading_buying_power": "262113.632",
        //     "equity": "103820.56",
        //     "id": "e6fe16f3-64a4-4921-8928-cadf02f92f98",
        //     "initial_margin": "63480.38",
        //     "last_equity": "103529.24",
        //     "last_maintenance_margin": "38000.832",
        //     "long_market_value": "126960.76",
        //     "maintenance_margin": "38088.228",
        //     "multiplier": "4",
        //     "pattern_day_trader": false,
        //     "portfolio_value": "103820.56",
        //     "regt_buying_power": "80680.36",
        //     "short_market_value": "0",
        //     "shorting_enabled": true,
        //     "sma": "0",
        //     "status": "ACTIVE",
        //     "trade_suspended_by_user": false,
        //     "trading_blocked": false,
        //     "transfers_blocked": false
        // }
        const accountCurrency = this.safeString (accountResponse, 'currency');
        const accountCurrencyFree = this.safeString (accountResponse, 'cash');
        free[accountCurrency] = accountCurrencyFree;
        used[accountCurrency] = 0;
        total[accountCurrency] = accountCurrencyFree;
        currencies[accountCurrency] = { 'free': accountCurrencyFree, 'used': 0, 'total': accountCurrencyFree };
        // initialize currencies
        const symbols = this.symbols;
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            const base = this.safeString (market, 'base');
            free[base] = 0;
            used[base] = 0;
            total[base] = 0;
            currencies[base] = { 'free': 0, 'used': 0, 'total': 0 };
        }
        // fill in existing positions
        const positions = await this.privateGetPositions ();
        // [
        //     {
        //         "asset_id": "ef145fe0-95cd-453a-8609-db7200ff0279",
        //         "symbol": "BTCUSD",
        //         "exchange": "crypto",
        //         "asset_class": "crypto",
        //         "asset_marginable": false,
        //         "qty": "0.0167",
        //         "avg_entry_price": "59506.1",
        //         "side": "long",
        //         "market_value": "988.423067",
        //         "cost_basis": "993.75187",
        //         "unrealized_pl": "-5.328803",
        //         "unrealized_plpc": "-0.0053623073936958",
        //         "unrealized_intraday_pl": "-5.328803",
        //         "unrealized_intraday_plpc": "-0.0053623073936958",
        //         "current_price": "59187.01",
        //         "lastday_price": "59440.5",
        //         "change_today": "-0.004264600735189"
        //     }
        // ]
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            if (this.safeString (position, 'asset_class') === 'crypto') {
                const id = this.safeString (position, 'symbol');
                const market = this.markets_by_id[id];
                const base = this.safeString (market, 'base');
                const amount = this.safeNumber (position, 'qty');
                free[base] = amount;
                used[base] = 0;
                total[base] = amount;
                currencies[base] = { 'free': amount, 'used': 0, 'total': amount };
            }
        }
        const timestamp = this.milliseconds (); // alpaca doesn't provide timestamps with account/positions data
        let balance = {
            'info': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        balance = this.extend (balance, free, used, total, currencies);
        return this.parseBalance (balance);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbol': id,
            'qty': amount,
            'side': side,
            'type': type,
        };
        if (type === 'limit') {
            request['limit_price'] = price;
        }
        if (!('timeInForce' in params)) {
            request['time_in_force'] = this.safeString (this.options, 'defaultTimeInForce');
        }
        const clientOrderId = this.safeString (this.options, 'clientOrderId');
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        const random_id = parts.join ('');
        request['client_order_id'] = this.implodeParams (clientOrderId, { 'id': random_id });
        const order = await this.privatePostOrders (this.extend (request, params));
        // {
        // "id": "61e69015-8549-4bfd-b9c3-01e75843f47d",
        // "client_order_id": "eb9e2aaa-f71a-4f51-b5b4-52a6c565dad4",
        // "created_at": "2021-03-16T18:38:01.942282Z",
        // "updated_at": "2021-03-16T18:38:01.942282Z",
        // "submitted_at": "2021-03-16T18:38:01.937734Z",
        // "filled_at": null,
        // "expired_at": null,
        // "canceled_at": null,
        // "failed_at": null,
        // "replaced_at": null,
        // "replaced_by": null,
        // "replaces": null,
        // "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        // "symbol": "AAPL",
        // "asset_class": "us_equity",
        // "notional": "500",
        // "qty": null,
        // "filled_qty": "0",
        // "filled_avg_price": null,
        // "order_class": "",
        // "order_type": "market",
        // "type": "market",
        // "side": "buy",
        // "time_in_force": "day",
        // "limit_price": null,
        // "stop_price": null,
        // "status": "accepted",
        // "extended_hours": false,
        // "legs": null,
        // "trail_percent": null,
        // "trail_price": null,
        // "hwm": null
        // }
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // cancelling order by symbol not yet supported
        const request = {
            'order_id': id,
        };
        const response = await this.privateDeleteOrdersOrderId (this.extend (request, params));
        // {
        //     "code": 40410000,
        //     "message": "order is not found."
        // }
        return this.safeValue (response, 'message', {});
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // fetching order by symbol not yet supported
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const order = await this.privateGetOrdersOrderId (this.extend (request, params));
        // {
        //     "id": "61e69015-8549-4bfd-b9c3-01e75843f47d",
        //     "client_order_id": "eb9e2aaa-f71a-4f51-b5b4-52a6c565dad4",
        //     "created_at": "2021-03-16T18:38:01.942282Z",
        //     "updated_at": "2021-03-16T18:38:01.942282Z",
        //     "submitted_at": "2021-03-16T18:38:01.937734Z",
        //     "filled_at": null,
        //     "expired_at": null,
        //     "canceled_at": null,
        //     "failed_at": null,
        //     "replaced_at": null,
        //     "replaced_by": null,
        //     "replaces": null,
        //     "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        //     "symbol": "AAPL",
        //     "asset_class": "us_equity",
        //     "notional": "500",
        //     "qty": null,
        //     "filled_qty": "0",
        //     "filled_avg_price": null,
        //     "order_class": "",
        //     "order_type": "market",
        //     "type": "market",
        //     "side": "buy",
        //     "time_in_force": "day",
        //     "limit_price": null,
        //     "stop_price": null,
        //     "status": "accepted",
        //     "extended_hours": false,
        //     "legs": null,
        //     "trail_percent": null,
        //     "trail_price": null,
        //     "hwm": null
        // }
        const _id = this.safeString (order, 'symbol');
        const market = this.safeString (this.markets_by_id, _id);
        return this.parseOrder (order, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // symbol, since, and limit filtering done by base class
        await this.loadMarkets ();
        // returns open orders by default
        const _orders = await this.privateGetOrders (params);
        // add symbols to orders to handle parseOrders
        const ordersWithSymbols = [];
        for (let i = 0; i < _orders.length; i++) {
            let order = _orders[i];
            const market = this.safeString (this.markets_by_id, 'symbol');
            const symbol = this.safeString (market, 'symbol');
            order = this.extend (order, { 'symbol': symbol });
            ordersWithSymbols.push (order);
        }
        return this.parseOrders (ordersWithSymbols, undefined, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = this.safeString (order, 'symbol', '');
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const alpacaStatus = this.safeString (order, 'status');
        let status = 'open';
        if (alpacaStatus === 'filled') {
            status = 'closed';
        } else if (alpacaStatus === 'canceled') {
            status = 'canceled';
        } else if (alpacaStatus === 'expired') {
            status = 'expired';
        }
        return this.safeOrder2 ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': this.milliseconds (),
            'datetime': this.safeString (order, 'submitted_at'),
            'lastTradeTimeStamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': this.safeString (order, 'order_type'),
            'timeInForce': this.safeString (order, 'time_in_force'),
            'side': this.safeString (order, 'side'),
            'price': this.safeNumber (order, 'limit_price'),
            'average': this.safeNumber (order, 'filled_avg_price'),
            'amount': this.safeNumber (order, 'qty'),
            'filled': this.safeNumber (order, 'filled_qty'),
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
                'rate': undefined,
            },
            'info': order,
        }, market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = this.safeString (trade, 'symbol', '');
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.milliseconds (); // parseDate (this.safeString (quote, 't'));
        const alpacaSide = this.safeString (trade, 'tks');
        let side = undefined;
        if (alpacaSide === 'B') {
            side = 'buy';
        } else if (alpacaSide === 'S') {
            side = 'sell';
        }
        const priceString = this.safeString (trade, 'p');
        const amountString = this.safeString (trade, 's');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        return {
            'info': trade,
            'id': this.safeString (trade, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': 'taker',
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
        };
    }

    parseTicker (ticker, market = undefined) {
        const symbol = market['symbol'];
        const timestamp = this.milliseconds (); // parseDate (this.safeString (quote, 't'));
        return this.safeTicker ({
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (ticker, 'bp'),
            'bidVolume': this.safeNumber (ticker, 'bs'),
            'ask': this.safeNumber (ticker, 'ap'),
            'askVolume': this.safeNumber (ticker, 'as'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const versions = this.safeValue (this.options, 'versions');
        const version = this.safeString (versions, api);
        let endpoint = '/' + this.implodeParams (path, params);
        let url = this.implodeParams (this.urls['api'][api], { 'version': version });
        headers = (headers !== undefined) ? headers : {};
        if ((api === 'private') || (api === 'cryptoPrivate')) {
            headers['APCA-API-KEY-ID'] = this.apiKey;
            headers['APCA-API-SECRET-KEY'] = this.secret;
        }
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            if ((method === 'GET') || (method === 'DELETE')) {
                endpoint += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        url = url + endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // default error handler
        }
        // {
        //     "code": 40110000,
        //     "message": "request is not authorized"
        // }
        const message = this.safeValue (response, 'message', undefined);
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
