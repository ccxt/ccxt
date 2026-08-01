'use strict';

//  ---------------------------------------------------------------------------

const hitbtc3Rest = require ('../hitbtc3.js');
const { ExchangeError, InvalidOrder, AuthenticationError } = require ('../base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class hitbtc3 extends hitbtc3Rest {
    describe () {
        return this.deepExtend (super.describe (), {
            'pro': true,
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchBalance': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchOrders': true,
                'watchMyTrades': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.hitbtc.com/api/3/ws/public',
                        'trading': 'wss://api.hitbtc.com/api/3/ws/trading',
                        'wallet': 'wss://api.hitbtc.com/api/3/ws/wallet',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://api.demo.hitbtc.com/api/3/ws/public',
                        'trading': 'wss://api.demo.hitbtc.com/api/3/ws/trading',
                        'wallet': 'wss://api.demo.hitbtc.com/api/3/ws/wallet',
                    },
                },
            },
            'methods': {
                'spot': {
                    'createOrder': 'spot_new_order',
                    'editOrder': 'spot_replace_order',
                    'cancelOrder': 'spot_cancel_order',
                    'cancelAllOrders': 'spot_cancel_orders',
                    'watchBalance': 'spot_balance_subscribe',
                    'watchOrders': 'spot_subscribe',
                    'watchMyTrades': 'spot_subscribe',
                },
                'margin': {
                    'createOrder': 'margin_new_order',
                    'editOrder': 'margin_replace_order',
                    'cancelOrder': 'margin_cancel_order',
                    'cancelAllOrders': 'margin_cancel_orders',
                    'watchPositions': 'margin_subscribe',
                    'watchOrders': 'margin_subscribe',
                    'watchMyTrades': 'margin_subscribe',
                },
                'swap': {
                    'createOrder': 'futures_new_order',
                    'editOrder': 'futures_replace_order',
                    'cancelOrder': 'futures_cancel_order',
                    'cancelAllOrders': 'futures_cancel_orders',
                    'watchPositions': 'futures_subscribe',
                    'watchOrders': 'futures_subscribe',
                    'watchMyTrades': 'futures_subscribe',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'BasicAuth': false,                           // BASIC or HS256 authenticate
                'defaultMarketType': 'spot',                  // spot | margin | swap
                'lastRequestId': this.milliseconds (),
            },
        });
    }

    getRequestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'lastRequestId', 0), 1);
        this.options['lastRequestId'] = requestId;
        return requestId;
    }

    makeBasicAuth () {
        return {
            'type': 'BASIC',
            'api_key': this.apiKey,
            'secret_key': this.secret,
        };
    }

    makeHs256Auth () {
        const timestamp = this.nonce ();
        const payload = [ timestamp ];
        const payloadString = payload.join ('');
        const signature = this.hmac (this.encode (payloadString), this.encode (this.secret), 'sha256', 'hex');
        return {
            'type': 'HS256',
            'api_key': this.apiKey,
            'timestamp': timestamp,
            'signature': signature,
        };
    }

    async authenticate (url) {
        const messageHash = 'authenticated';
        const client = this.client (url);
        let future = this.safeValue (client.futures, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            const method = 'login';
            let params = {};
            if (this.options['BasicAuth'] === true) {
                params = this.makeBasicAuth ();
            } else {
                params = this.makeHs256Auth ();
            }
            const requestId = this.getRequestId ();
            const request = {
                'method': method,
                'params': params,
                'id': requestId,
            };
            const subscription = {
                'method': messageHash,
                'callback': this.handleAuthenticationMessage,
            };
            this.spawn (this.watch, url, method, request, requestId, subscription);
        }
        return future;
    }

    async watchPrivate (access, method, params = {}, messageHash = undefined) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'][access];
        await this.authenticate (url);
        if (messageHash === undefined) {
            messageHash = method;
        }
        const requestId = this.getRequestId ();
        const subscribe = {
            'method': method,
            'id': requestId,
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchPublic (symbol, channel, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const requestId = this.getRequestId ();
        const marketId = this.marketId (symbol);
        const messageHash = channel + ':' + marketId;
        const subscribe = {
            'method': 'subscribe',
            'ch': channel,
            'params': {
                'symbols': [ marketId ],
            },
            'id': requestId,
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async executePrivate (access, method, params, callback) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'][access];
        await this.authenticate (url);
        const requestId = this.getRequestId ();
        const messageHash = method + ':' + requestId;
        let request = {
            'method': method,
            'params': [],
            'id': requestId,
        };
        request = this.deepExtend (request, params);
        const subscription = {
            'method': messageHash,
            'callback': callback,
        };
        return await this.watch (url, messageHash, request, requestId, subscription);
    }

    getMethod (methodName, market, params) {
        let marketType = this.safeValue (this.options, 'defaultMarketType', 'spot');
        if (market !== undefined) {
            marketType = this.safeValue (market, 'type', marketType);
        }
        marketType = this.safeValue (params, 'marketType', marketType);
        const methods = this.safeValue (this.methods, marketType);
        if (methods === undefined) {
            throw new ExchangeError (this.id + ' market type "' + marketType + '" not found!');
        }
        const method = this.safeValue (methods, methodName);
        if (method === undefined) {
            throw new ExchangeError (this.id + ' method ' + marketType + '/' + methodName + ' not found!');
        }
        return method;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#createOrder
         * @description create a trade order
         * @param {string} symbol unified $symbol of the $market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the $price at which the order is to be fullfilled, in units of the quote currency, ignored in $market orders
         * @param {array} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string} params.timeInForce accepted values: 'GTC', 'IOC', 'FOK', 'Day', 'GTD'; default value: 'GTC'
         * @param {string} params.expireTime date of order expiration; required if time_in_force is GTD
         * @param {float} params.stopPrice the price level that triggers order activation; required if type is stopLimit, stopMarket, takeProfitLimit, or takeProfitMarket
         * @param {boolean} params.postOnly if a post-only order causes a match with a pre-existing order as a taker, then the order will expire
         * @param {boolean} params.reduceOnly reduce-only order, being filled, guarantees not to put the position quantity to the point when the position flips
         * @return {array} an {@link https://docs.ccxt.com/en/latest/manual.html#order-structure order structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timeInForce = this.safeString2 (params, 'timeInForce', 'time_in_force', 'GTC');
        const expireTime = this.safeString2 (params, 'expireTime', 'expire_time');
        const stopPrice = this.safeNumber2 (params, 'stopPrice', 'stop_price');
        // A post-only limit order is either placed in the order book or expires if matches an existing order.
        // Post-only option guarantees that you will not pay the taker fee.
        const postOnly = this.safeValue2 (params, 'postOnly', 'post_only');
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        const marketType = market['type'];
        const cmd = {
            'params': {
                'type': type,
                'side': side,
                'quantity': this.amountToPrecision (symbol, amount),
                'symbol': market['id'],
                'time_in_force': timeInForce,
            },
        };
        if ((type === 'limit') || (type === 'stopLimit') || (type === 'takeProfitLimit')) {
            if (price === undefined) {
                throw new ExchangeError (this.id + ' createOrder() requires a price argument for limit orders');
            }
            cmd['params']['price'] = this.priceToPrecision (symbol, price);
        }
        if ((timeInForce === 'GTD')) {
            if (expireTime === undefined) {
                throw new ExchangeError (this.id + ' createOrder() requires an expireTime parameter for a GTD order');
            }
            cmd['params']['expire_time'] = expireTime;
        }
        if ((type === 'stopLimit') || (type === 'stopMarket') || (type === 'takeProfitLimit') || (type === 'takeProfitMarket')) {
            if (stopPrice === undefined) {
                throw new ExchangeError (this.id + ' createOrder() requires a stopPrice parameter for stop-loss and take-profit orders');
            }
            cmd['params']['stop_price'] = this.priceToPrecision (symbol, stopPrice);
        }
        if (postOnly !== undefined) {
            cmd['params']['post_only'] = postOnly;
        }
        if (reduceOnly !== undefined) {
            if ((marketType !== 'margin') && (marketType !== 'swap')) {
                throw new InvalidOrder (this.id + ' createOrder() does not support reduce_only for ' + market['type'] + ' orders, reduce_only orders are supported for swap and margin markets only');
            }
        }
        if (reduceOnly === true) {
            cmd['params']['reduce_only'] = reduceOnly;
        }
        const method = this.getMethod ('createOrder', market, params);
        return this.executePrivate ('trading', method, cmd, this.handleOrderMessage);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#editOrder
         * @description edit a trade order
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string} params.clientOrderId new clientOrderId after successful operation
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId', this.uuid22 ());
        const cmd = {
            'params': {
                'client_order_id': id,
                'new_client_order_id': clientOrderId,
                'quantity': this.amountToPrecision (symbol, amount),
            },
        };
        if ((type === 'limit') || (type === 'stopLimit') || (type === 'takeProfitLimit')) {
            if (price === undefined) {
                throw new ExchangeError (this.id + ' editOrder() limit order requires price');
            }
            cmd['params']['price'] = this.priceToPrecision (symbol, price);
        }
        const method = this.getMethod ('editOrder', market, params);
        return this.executePrivate ('trading', method, cmd, this.handleOrderMessage);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in (not supported by Exchange)
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const cmd = {
            'params': {
                'client_order_id': id,
            },
        };
        const method = this.getMethod ('cancelOrder', market, params);
        return this.executePrivate ('trading', method, cmd, this.handleOrderMessage);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined (not supported by Exchange)
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol !== undefined) {
            throw new ExchangeError (this.id + ' cancelAllOrders() does not support symbol param. Symbol must be undefined.');
        }
        const cmd = {
            'params': {},
        };
        const method = this.getMethod ('cancelAllOrders', undefined, params);
        return this.executePrivate ('trading', method, cmd, this.handleOrdersMessage);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name hitbtc3#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const methodParams = {
            'params': {
                'mode': 'updates',
            },
        };
        const method = this.getMethod ('watchBalance', undefined, params);
        return await this.watchPrivate ('trading', method, methodParams);
    }

    handleBalance (client, message) {
        //
        //     {
        //          "jsonrpc": "2.0",
        //          "method": "spot_balance",
        //          "params": [
        //              {
        //                  "currency": "BCN",
        //                  "available": "100.000000000000",
        //                  "reserved": "0",
        //                  "reserved_margin": "0"
        //              },
        //              {
        //                  "currency": "BTC",
        //                  "available": "0.013634021",
        //                  "reserved": "0",
        //                  "reserved_margin": "0"
        //              },
        //              {
        //                  "currency": "ETH",
        //                  "available": "0",
        //                  "reserved": "0.00200000",
        //                  "reserved_margin": "0"
        //              }
        //          ]
        //      }
        //
        const method = this.safeValue (message, 'method') + '_subscribe';
        const accountType = 'spot';
        const params = this.safeValue (message, 'params', []);
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            const account = this.account ();
            const currencyId = this.safeString (param, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            account['free'] = this.safeString (param, 'available', 0);
            account['used'] = this.safeString (param, 'reserved', 0);
            this.balance[accountType][code] = account;
        }
        this.balance[accountType] = this.safeBalance (this.balance[accountType]);
        client.resolve (this.balance[accountType], method);
    }

    async watchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const methodParams = {
            'params': {},
        };
        const method = this.getMethod ('watchPositions', undefined, params);
        return await this.watchPrivate ('trading', method, methodParams, 'positions');
    }

    handleAccounts (client, message) {
        //  {
        //      "jsonrpc": "2.0",
        //      "method": "margin_account",
        //      "params": {
        //          "symbol": "BTCUSDT",
        //          "type": "isolated",
        //          "leverage": "12.00",
        //          "created_at": "2021-07-01T21:43:19.727Z",
        //          "updated_at": "2021-07-02T00:54:28.591Z",
        //          "currencies": [
        //              {
        //                  "code": "USDT",
        //                  "margin_balance": "0.080706742356",
        //                  "reserved_orders": "0",
        //                  "reserved_positions": "0.029630234750"
        //              }
        //          ],
        //          "positions": [
        //              {
        //                  "id": 485264,
        //                  "symbol": "BTCUSDT",
        //                  "quantity": "0.00001",
        //                  "price_entry": "33386.18",
        //                  "price_margin_call": "27269.85",
        //                  "price_liquidation": "26721.57",
        //                  "pnl": "0",
        //                  "created_at": "2021-07-01T21:43:19.727Z",
        //                  "updated_at": "2021-07-02T00:54:28.591Z"
        //              }
        //          ],
        //          "report_type": "status",
        //          "report_reason": "status"
        //      }
        //  }
        const method = this.safeString (message, 'method');
        let accounts = [];
        if ((method === 'margin_accounts') || (method === 'futures_accounts')) {
            accounts = this.safeValue (message, 'params', []);
        } else {
            accounts = [ this.safeValue (message, 'params') ];
        }
        const positions = [];
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            positions.push (this.parsePosition (account));
        }
        client.resolve (positions, 'positions');
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string} params.speed supported speed: '1s', '3s'
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const speed = this.safeString (params, 'speed', '1s');
        const channel = 'ticker/' + speed;
        const methodParams = {
            'params': {},
        };
        return await this.watchPublic (symbol, channel, methodParams);
    }

    wsParseTicker (ticker, market = undefined) {
        //
        //     {
        //            "t": 1614815872000,             // Timestamp in milliseconds
        //            "a": "0.031175",                // Best ask
        //            "A": "0.03329",                 // Best ask quantity
        //            "b": "0.031148",                // Best bid
        //            "B": "0.10565",                 // Best bid quantity
        //            "c": "0.031210",                // Last price
        //            "o": "0.030781",                // Open price
        //            "h": "0.031788",                // High price
        //            "l": "0.030733",                // Low price
        //            "v": "62.587",                  // Base asset volume
        //            "q": "1.951420577",             // Quote asset volume
        //            "p": "0.000429",                // Price change
        //            "P": "1.39",                    // Price change percent
        //            "L": 1182694927                 // Last trade identifier
        //      }
        //
        const timestamp = this.safeInteger (ticker, 't');
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'c');
        const change = this.safeString (ticker, 'p');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': this.safeString (ticker, 'B'),
            'ask': this.safeString (ticker, 'a'),
            'askVolume': this.safeString (ticker, 'A'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': parseFloat (last) - parseFloat (change),
            'change': change,
            'percentage': this.safeString (ticker, 'P'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'q'),
            'info': ticker,
        }, market);
    }

    handleTicker (client, message) {
        //
        //     {
        //          "ch": "ticker/1s",
        //          "data": {
        //              "ETHBTC": {
        //                  "t": 1614815872000,             // Timestamp in milliseconds
        //                  "a": "0.031175",                // Best ask
        //                  "A": "0.03329",                 // Best ask quantity
        //                  "b": "0.031148",                // Best bid
        //                  "B": "0.10565",                 // Best bid quantity
        //                  "c": "0.031210",                // Last price
        //                  "o": "0.030781",                // Open price
        //                  "h": "0.031788",                // High price
        //                  "l": "0.030733",                // Low price
        //                  "v": "62.587",                  // Base asset volume
        //                  "q": "1.951420577",             // Quote asset volume
        //                  "p": "0.000429",                // Price change
        //                  "P": "1.39",                    // Price change percent
        //                  "L": 1182694927                 // Last trade identifier
        //              }
        //          }
        //      }
        //
        const channel = this.safeValue (message, 'ch');
        const tickers = this.safeValue (message, 'data', []);
        const keys = Object.keys (tickers);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const ticker = tickers[marketId];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const result = this.wsParseTicker (ticker, market);
            this.tickers[symbol] = result;
            const messageHash = channel + ':' + marketId;
            client.resolve (result, messageHash);
        }
        return message;
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        if (limit === undefined) {
            limit = 2;
        }
        const period = this.safeValue (this.timeframes, timeframe, timeframe);
        const methodParams = {
            'params': {
                'limit': limit,
            },
        };
        const ohlcv = await this.watchPublic (symbol, 'candles/' + period, methodParams);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    wsParseOHLCV (ohlcv, market = undefined) {
        //
        //                  "t": 1626860340000,             // Message timestamp
        //                  "o": "30881.95",                // Open price
        //                  "c": "30890.96",                // Last price
        //                  "h": "30900.8",                 // High price
        //                  "l": "30861.27",                // Low price
        //                  "v": "1.27852",                 // Base asset volume
        //                  "q": "39493.9021811"            // Quote asset volume
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    handleOHLCV (client, message) {
        //
        //      {
        //          "ch": "candles/M1",                     // Channel
        //          "snapshot": {
        //              "BTCUSDT": [{
        //                  "t": 1626860340000,             // Message timestamp
        //                  "o": "30881.95",                // Open price
        //                  "c": "30890.96",                // Last price
        //                  "h": "30900.8",                 // High price
        //                  "l": "30861.27",                // Low price
        //                  "v": "1.27852",                 // Base asset volume
        //                  "q": "39493.9021811"            // Quote asset volume
        //              }, {
        //                  "t": 1626860460000,
        //                  "o": "30858.39",
        //                  "c": "30863.56",
        //                  "h": "30864.89",
        //                  "l": "30853.83",
        //                  "v": "53.04288",
        //                  "q": "1636858.7119248"
        //              }]
        //          }
        //      }
        //
        //      {
        //          "ch": "candles/M1",
        //          "update": {
        //              "ETHBTC": [{
        //                  "t": 1626860880000,
        //                  "o": "0.060711",
        //                  "c": "0.060749",
        //                  "h": "0.060749",
        //                  "l": "0.060711",
        //                  "v": "12.2800",
        //                  "q": "0.7455339675"
        //              }]
        //          }
        //      }
        const ch = this.safeString (message, 'ch');
        const period = this.strstr (ch, '/');
        const timeframe = this.findTimeframe (period);
        const data = this.safeValue2 (message, 'snapshot', 'update');
        const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
        const keys = Object.keys (data);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const candles = data[marketId];
            const messageHash = ch + ':' + marketId;
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            for (let i = 0; i < candles.length; i++) {
                const candle = candles[i];
                const parsed = this.wsParseOHLCV (candle, market);
                stored.append (parsed);
                client.resolve (stored, messageHash);
            }
        }
        return message;
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return; supported depth: 5, 10, 20
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {int} params.speed order book speed; supported integer speed: 100, 500, 1000
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const speed = this.safeInteger (params, 'speed', 1000);
        let channel = '';
        if (limit === undefined) {
            channel = 'orderbook/full';
        } else {
            channel = 'orderbook/D' + limit + '/' + speed + 'ms';
        }
        const methodParams = {
            'params': {},
        };
        const orderbook = await this.watchPublic (symbol, channel, methodParams);
        return orderbook.limit ();
    }

    handleOrderbook (client, message) {
        if (this.safeValue2 (message, 'snapshot', 'data', undefined) !== undefined) {
            this.handleOrderBookSnapshot (client, message);
        } else if (this.safeValue (message, 'update', undefined) !== undefined) {
            this.handleOrderBookUpdate (client, message);
        }
    }

    getOrderBookDepth (ch) {
        const parts = ch.split ('/');
        const partsLen = parts.length;
        const textDepth = parts[1];
        if ((partsLen > 1) && (textDepth === 'full')) {
            return undefined;
        } else {
            return parseInt (textDepth.slice (1));
        }
    }

    handleOrderBookSnapshot (client, message) {
        //
        //      {
        //          "ch": "orderbook/full",                 // Channel
        //          "snapshot": {
        //              "ETHBTC": {
        //                  "t": 1626866578796,             // Timestamp in milliseconds
        //                  "s": 27617207,                  // Sequence number
        //                  "a": [                          // Asks
        //                      ["0.060506", "0"],
        //                      ["0.060549", "12.6431"],
        //                      ["0.060570", "0"],
        //                      ["0.060612", "0"]
        //                  ],
        //                  "b": [                          // Bids
        //                      ["0.060439", "4.4095"],
        //                      ["0.060414", "0"],
        //                      ["0.060407", "7.3349"],
        //                      ["0.060390", "0"]
        //                  ]
        //              }
        //          }
        //      }
        //
        const ch = this.safeValue (message, 'ch');
        const snapshots = this.safeValue2 (message, 'snapshot', 'data', {});
        const depth = this.getOrderBookDepth (ch);
        const keys = Object.keys (snapshots);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const data = snapshots[marketId];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const timestamp = this.safeInteger (data, 't');
            const nonce = this.safeInteger (data, 's');
            if (symbol in this.orderbooks) {
                delete this.orderbooks[symbol];
            }
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
            const orderbook = this.orderBook (snapshot, depth);
            orderbook['nonce'] = nonce;
            this.orderbooks[symbol] = orderbook;
            const messageHash = ch + ':' + marketId;
            client.resolve (orderbook, messageHash);
        }
    }

    handleOrderBookUpdate (client, message) {
        //
        //      {
        //          "ch": "orderbook/full",
        //          "update": {
        //              "ETHBTC": {
        //                  "t": 1626866578902,
        //                  "s": 27617208,
        //                  "a": [
        //                      ["0.060508", "0"],
        //                      ["0.060509", "2.5486"]
        //                  ],
        //                  "b": [
        //                      ["0.060501", "3.9000"],
        //                      ["0.060500", "3.0459"]
        //                  ]
        //              }
        //          }
        //      }
        //
        const ch = this.safeValue (message, 'ch');
        const update = this.safeValue (message, 'update', {});
        const keys = Object.keys (update);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const data = update[marketId];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            if (symbol in this.orderbooks) {
                const timestamp = this.safeInteger (data, 't');
                const nonce = this.safeInteger (data, 's');
                const orderbook = this.orderbooks[symbol];
                const asks = this.safeValue (data, 'a', []);
                const bids = this.safeValue (data, 'b', []);
                this.handleDeltas (orderbook['asks'], asks);
                this.handleDeltas (orderbook['bids'], bids);
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
                orderbook['nonce'] = nonce;
                this.orderbooks[symbol] = orderbook;
                const messageHash = ch + ':' + marketId;
                client.resolve (orderbook, messageHash);
            }
        }
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchTrades
         * @description watches information on multiple trades made in a market
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const methodParams = {
            'params': {},
        };
        if (limit !== undefined) {
            methodParams['params']['limit'] = limit;
        }
        const trades = await this.watchPublic (symbol, 'trades', methodParams);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    wsParseTrade (trade, market = undefined) {
        //
        //  {
        //      "t": 1626861109494,             // Timestamp in milliseconds
        //      "i": 1555634969,                // Trade identifier
        //      "p": "30881.96",                // Price
        //      "q": "12.66828",                // Quantity
        //      "s": "buy"                      // Side
        //  }
        const symbol = market['symbol'];
        const id = this.safeString (trade, 'i');
        const timestamp = this.safeInteger (trade, 't');
        const priceString = this.safeString (trade, 'p');
        const amountString = this.safeString (trade, 'q');
        const side = this.safeString (trade, 's');
        const order = undefined;
        const type = undefined;
        const takerOrMaker = undefined;
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': order,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
        }, market);
    }

    handleTrades (client, message) {
        //
        //      {
        //          "ch": "trades",                         // Channel
        //          "snapshot": {
        //              "BTCUSDT": [{
        //                  "t": 1626861109494,             // Timestamp in milliseconds
        //                  "i": 1555634969,                // Trade identifier
        //                  "p": "30881.96",                // Price
        //                  "q": "12.66828",                // Quantity
        //                  "s": "buy"                      // Side
        //              }]
        //          }
        //      }
        //
        //      {
        //          "ch": "trades",
        //          "update": {
        //              "BTCUSDT": [{
        //                  "t": 1626861123552,
        //                  "i": 1555634969,
        //                  "p": "30877.68",
        //                  "q": "0.00006",
        //                  "s": "sell"
        //              }]
        //          }
        //      }
        //
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        const data = this.safeValue2 (message, 'snapshot', 'update', {});
        const keys = Object.keys (data);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const trades = data[marketId];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const messageHash = 'trades:' + marketId;
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                stored = new ArrayCache (tradesLimit);
                this.trades[symbol] = stored;
            }
            for (let i = 0; i < trades.length; i++) {
                let trade = trades[i];
                trade = this.wsParseTrade (trade, market);
                stored.append (trade);
            }
            client.resolve (stored, messageHash);
        }
        return message;
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the hibtc3 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol !== undefined) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const method = this.getMethod ('watchOrders', undefined, params);
        const methodParams = {
            'params': {},
        };
        const orders = await this.watch_private ('trading', method, methodParams, 'orders');
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message) {
        //
        //      {
        //          "jsonrpc": "2.0",
        //          "method": "spot_order",
        //          "params": {
        //              "id": 584244931496,
        //              "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //              "symbol": "BTCUSDT",
        //              "side": "buy",
        //              "status": "new",
        //              "type": "limit",
        //              "time_in_force": "GTC",
        //              "quantity": "0.01000",
        //              "quantity_cumulative": "0",
        //              "price": "0.01",
        //              "post_only": false,
        //              "display_quantity": "0",
        //              "created_at": "2021-07-02T22:52:32.864Z",
        //              "updated_at": "2021-07-02T22:52:32.864Z",
        //              "report_type": "new"
        //          }
        //      }
        //
        //      {
        //          "jsonrpc": "2.0",
        //          "method": "spot_orders",
        //          "params": [
        //              {
        //                  "id": 584244931496,
        //                  "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //                  "symbol": "BTCUSDT",
        //                  "side": "buy",
        //                  "status": "new",
        //                  "type": "limit",
        //                  "time_in_force": "GTC",
        //                  "quantity": "0.01000",
        //                  "quantity_cumulative": "0",
        //                  "price": "0.01",
        //                  "post_only": false,
        //                  "created_at": "2021-07-02T22:52:32.864Z",
        //                  "updated_at": "2021-07-02T22:52:32.864Z",
        //                  "report_type": "status"
        //              },
        //          ]
        //      }
        //
        const method = this.safeString (message, 'method');
        let orders = [];
        if ((method === 'spot_orders') || (method === 'margin_orders') || (method === 'futures_orders')) {
            orders = this.safeValue (message, 'params', []);
        } else {
            orders = [ this.safeValue (message, 'params') ];
        }
        // Parse orders
        let messageHash = 'orders';
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const cachedOrders = this.orders;
        const parsedOrders = this.parseOrders (orders);
        const parsedOrdersLen = parsedOrders.length;
        if (parsedOrdersLen > 0) {
            for (let i = 0; i < parsedOrders.length; i++) {
                const parsedOrder = parsedOrders[i];
                cachedOrders.append (parsedOrder);
            }
            client.resolve (this.orders, messageHash);
        }
        // Parse trades
        messageHash = 'myTrades';
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const cachedTrades = this.myTrades;
        const parsedTrades = this.wsParseMyTrades (orders);
        const parsedTradesLen = parsedTrades.length;
        if (parsedTradesLen > 0) {
            for (let i = 0; i < parsedTrades.length; i++) {
                const parsedTrade = parsedTrades[i];
                cachedTrades.append (parsedTrade);
            }
            client.resolve (this.myTrades, messageHash);
        }
        return message;
    }

    wsParseMyTrades (orders) {
        const trades = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const id = this.safeString (order, 'trade_id');
            if (id !== undefined) {
                const trade = this.wsParseMyTrade (order);
                trades.push (trade);
            }
        }
        return trades;
    }

    wsParseMyTrade (trade) {
        //
        // {
        //         "id": 583583708580,
        //         "client_order_id": "5c8c50cbf326488cb1d3415cd3e01386",
        //         "symbol": "BTCUSDT",
        //         "side": "sell",
        //         "status": "filled",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "quantity": "0.00001",
        //         "quantity_cumulative": "0.00001",
        //         "price": "80000.00",
        //         "post_only": false,
        //         "reduce_only": false,
        //         "created_at": "2021-07-02T01:32:15.732Z",
        //         "updated_at": "2021-07-02T01:32:15.732Z",
        //         "trade_id": 1361988214,
        //         "trade_quantity": "0.00001",
        //         "trade_price": "49509.81",
        //         "trade_fee": "0.001237745250",
        //         "trade_position_id": 485308,
        //         "report_type": "trade"
        // }
        //
        const marketId = this.safeString (trade, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const id = this.safeString (trade, 'trade_id');
        const orderId = this.safeString (trade, 'client_order_id');
        const datetime = this.safeString (trade, 'updated_at');
        const timestamp = this.parse8601 (datetime);
        const priceString = this.safeString (trade, 'trade_price');
        const amountString = this.safeString (trade, 'trade_quantity');
        const side = this.safeString (trade, 'side');
        const takerOrMaker = this.safeValue (trade, 'trade_taker');
        const type = this.safeString (trade, 'type');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'trade_fee');
        if (feeCostString !== undefined) {
            const info = this.safeValue (market, 'info', {});
            const feeCurrency = this.safeString (info, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrency);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the hibtc3 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        if (symbol !== undefined) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const method = this.getMethod ('watchMyTrades', undefined, params);
        const trades = await this.watchPrivate ('trading', method, params, 'myTrades');
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleNotification (client, message) {
        //
        //     array( jsonrpc: '2.0', result: true, id: requestId )
        //
        const id = this.safeString (message, 'id');
        if (id !== undefined) {
            const subscription = this.safeValue (client.subscriptions, id);
            if (subscription !== undefined) {
                const method = subscription['method'];
                const callback = subscription['callback'];
                callback.call (this, client, message, method);
                delete client.subscriptions[id];
            }
        }
        return message;
    }

    handleOrderMessage (client, message, method) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        let order = this.safeValue (message, 'result');
        order = this.parseOrder (order);
        client.resolve (order, method);
    }

    handleOrdersMessage (client, message, method) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        let orders = this.safeValue (message, 'result');
        orders = this.parseOrders (orders);
        client.resolve (orders, method);
    }

    handleAuthenticationMessage (client, message, method) {
        //
        //     array( jsonrpc: '2.0', result: true, id: requestId )
        //
        const future = this.safeValue (client.futures, method);
        if (future !== undefined) {
            future.resolve (message);
        }
    }

    handleErrorMessage (client, message) {
        //
        //     {"jsonrpc":"2.0","error":{"code":1002,"message":"Authorization is required or has been failed"},"id":requestId}
        //
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            const errorCode = this.safeInteger (error, 'code');
            const messageString = this.safeString (error, 'message');
            try {
                if (errorCode !== undefined) {
                    const feedback = this.id + ' ' + this.json (message);
                    this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                    if (messageString !== undefined) {
                        this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                    }
                }
            } catch (e) {
                if (e instanceof AuthenticationError) {
                    client.reject (e, 'authenticated');
                    const method = 'login';
                    if (method in client.subscriptions) {
                        delete client.subscriptions[method];
                    }
                    return false;
                }
                throw e;
            }
        }
        return true;
    }

    handleMessage (client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        let event = this.safeString2 (message, 'ch', 'method');
        if (event !== undefined) {
            event = this.strstr (event, '/', true);
            const channels = {
                'ticker': this.handleTicker,
                'candles': this.handleOHLCV,
                'orderbook': this.handleOrderbook,
                'trades': this.handleTrades,
                'spot_balance': this.handleBalance,
                'spot_order': this.handleOrders,
                'spot_orders': this.handleOrders,
                'margin_account': this.handleAccounts,
                'margin_accounts': this.handleAccounts,
                'margin_order': this.handleOrders,
                'margin_orders': this.handleOrders,
                'futures_account': this.handleAccounts,
                'futures_accounts': this.handleAccounts,
                'futures_order': this.handleOrders,
                'futures_orders': this.handleOrders,
            };
            const method = this.safeValue (channels, event);
            if (method !== undefined) {
                method.call (this, client, message);
                return;
            }
        }
        this.handleNotification (client, message);
    }

    strstr (haystack, needle, bool = false) {
        const pos = haystack.indexOf (needle);
        if ((pos === -1) || (!pos)) {
            return haystack;
        } else {
            if (bool) {
                return haystack.slice (0, pos);
            } else {
                return haystack.slice (pos);
            }
        }
    }
};
