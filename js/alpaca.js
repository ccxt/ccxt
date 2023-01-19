'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, PermissionDenied, BadSymbol, NotSupported, InsufficientFunds, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------xs

module.exports = class alpaca extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'alpaca',
            'name': 'Alpaca',
            'countries': [ 'US' ],
            'rateLimit': 333, // 3 req per second
            'hostname': 'alpaca.markets',
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/187234005-b864db3d-f1e3-447a-aaf9-a9fc7b955d07.jpg',
                'www': 'https://alpaca.markets',
                'api': {
                    'public': 'https://api.{hostname}/{version}',
                    'private': 'https://api.{hostname}/{version}',
                    'cryptoPublic': 'https://data.{hostname}/{version}',
                    'markets': 'https://api.{hostname}/{version}',
                },
                'test': {
                    'public': 'https://paper-api.{hostname}/{version}',
                    'private': 'https://paper-api.{hostname}/{version}',
                    'cryptoPublic': 'https://data.{hostname}/{version}',
                    'markets': 'https://api.{hostname}/{version}',
                },
                'doc': 'https://alpaca.markets/docs/',
                'fees': 'https://alpaca.markets/support/what-are-the-fees-associated-with-crypto-trading/',
            },
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchL1OrderBook': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'api': {
                'markets': {
                    'get': [
                        'assets/public/beta',
                    ],
                },
                'private': {
                    'get': [
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
                'cryptoPublic': {
                    'get': [
                        'crypto/latest/orderbooks',
                        'crypto/trades',
                        'crypto/quotes',
                        'crypto/latest/quotes',
                        'crypto/bars',
                        'crypto/snapshots',
                    ],
                },
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '8h': '8H',
                '12h': '12H',
                '1d': '1D',
                '3d': '3D',
                '1w': '1W',
                '1M': '1M',
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.003'),
                    'taker': this.parseNumber ('0.003'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.003') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0028') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0025') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00125') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.001') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.003') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0028') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0025') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00125') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.001') ],
                        ],
                    },
                },
            },
            'headers': {
                'APCA-PARTNER-ID': 'ccxt',
            },
            'options': {
                'fetchTradesMethod': 'cryptoPublicGetCryptoTrades', // or cryptoPublicGetCryptoLatestTrades
                'fetchOHLCVMethod': 'cryptoPublicGetCryptoBars', // or cryptoPublicGetCryptoLatestBars
                'versions': {
                    'public': 'v2',
                    'private': 'v2',
                    'cryptoPublic': 'v1beta2', // crypto beta
                    'markets': 'v2', // crypto beta
                },
                'defaultExchange': 'CBSE',
                'exchanges': [
                    'CBSE', // Coinbase
                    'FTX', // FTXUS
                    'GNSS', // Genesis
                    'ERSX', // ErisX
                ],
                'defaultTimeInForce': 'gtc', // fok, gtc, ioc
                'clientOrderId': 'ccxt_{id}',
            },
            'exceptions': {
                'exact': {
                    'forbidden.': PermissionDenied, // {"message": "forbidden."}
                    '40410000': InvalidOrder, // { "code": 40410000, "message": "order is not found."}
                    '40010001': BadRequest, // {"code":40010001,"message":"invalid order type for crypto order"}
                    '40110000': PermissionDenied, // { "code": 40110000, "message": "request is not authorized"}
                    '40310000': InsufficientFunds, // {"available":"0","balance":"0","code":40310000,"message":"insufficient balance for USDT (requested: 221.63, available: 0)","symbol":"USDT"}
                },
                'broad': {
                    'Invalid format for parameter': BadRequest, // {"message":"Invalid format for parameter start: error parsing '0' as RFC3339 or 2006-01-02 time: parsing time \"0\" as \"2006-01-02\": cannot parse \"0\" as \"2006\""}
                    'Invalid symbol': BadSymbol, // {"message":"Invalid symbol(s): BTC/USDdsda does not match ^[A-Z]+/[A-Z]+$"}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name alpaca#fetchMarkets
         * @description retrieves data on all markets for alpaca
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const request = {
            'asset_class': 'crypto',
            'tradeable': true,
        };
        const assets = await this.marketsGetAssetsPublicBeta (this.extend (request, params));
        //
        //    [
        //        {
        //           "id":"a3ba8ac0-166d-460b-b17a-1f035622dd47",
        //           "class":"crypto",
        //           "exchange":"FTXU",
        //           "symbol":"DOGEUSD",
        //           "name":"Dogecoin",
        //           "status":"active",
        //           "tradable":true,
        //           "marginable":false,
        //           "shortable":false,
        //           "easy_to_borrow":false,
        //           "fractionable":true,
        //           "min_order_size":"1",
        //           "min_trade_increment":"1",
        //           "price_increment":"0.0000005"
        //        }
        //    ]
        //
        const markets = [];
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const marketId = this.safeString (asset, 'symbol');
            const parts = marketId.split ('/');
            const baseId = this.safeString (parts, 0);
            const quoteId = this.safeString (parts, 1);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const status = this.safeString (asset, 'status');
            const active = (status === 'active');
            const minAmount = this.safeNumber (asset, 'min_order_size');
            const amount = this.safeNumber (asset, 'min_trade_increment');
            const price = this.safeNumber (asset, 'price_increment');
            markets.push ({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': active,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amount,
                    'price': price,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': asset,
            });
        }
        return markets;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the alpaca api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbols': id,
        };
        if (since !== undefined) {
            request['start'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = parseInt (limit);
        }
        const method = this.safeString (this.options, 'fetchTradesMethod', 'cryptoPublicGetCryptoTrades');
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "next_page_token":null,
        //     "trades":{
        //        "BTC/USD":[
        //           {
        //              "i":36440704,
        //              "p":22625,
        //              "s":0.0001,
        //              "t":"2022-07-21T11:47:31.073391Z",
        //              "tks":"B"
        //           }
        //        ]
        //     }
        // }
        //
        const trades = this.safeValue (response, 'trades', {});
        const symbolTrades = this.safeValue (trades, market['id'], {});
        return this.parseTrades (symbolTrades, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the alpaca api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbols': id,
        };
        const response = await this.cryptoPublicGetCryptoLatestOrderbooks (this.extend (request, params));
        //
        //   {
        //       "orderbooks":{
        //          "BTC/USD":{
        //             "a":[
        //                {
        //                   "p":22208,
        //                   "s":0.0051
        //                },
        //                {
        //                   "p":22209,
        //                   "s":0.1123
        //                },
        //                {
        //                   "p":22210,
        //                   "s":0.2465
        //                }
        //             ],
        //             "b":[
        //                {
        //                   "p":22203,
        //                   "s":0.395
        //                },
        //                {
        //                   "p":22202,
        //                   "s":0.2465
        //                },
        //                {
        //                   "p":22201,
        //                   "s":0.6455
        //                }
        //             ],
        //             "t":"2022-07-19T13:41:55.13210112Z"
        //          }
        //       }
        //   }
        //
        const orderbooks = this.safeValue (response, 'orderbooks', {});
        const rawOrderbook = this.safeValue (orderbooks, id, {});
        const timestamp = this.parse8601 (this.safeString (rawOrderbook, 't'));
        return this.parseOrderBook (rawOrderbook, market['symbol'], timestamp, 'b', 'a', 'p', 's');
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the alpha api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbols': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start'] = this.yyyymmdd (since);
        }
        const method = this.safeString (this.options, 'fetchOHLCVMethod', 'cryptoPublicGetCryptoBars');
        const response = await this[method] (this.extend (request, params));
        //
        //    {
        //        "bars":{
        //           "BTC/USD":[
        //              {
        //                 "c":22887,
        //                 "h":22888,
        //                 "l":22873,
        //                 "n":11,
        //                 "o":22883,
        //                 "t":"2022-07-21T05:00:00Z",
        //                 "v":1.1138,
        //                 "vw":22883.0155324116
        //              },
        //              {
        //                 "c":22895,
        //                 "h":22895,
        //                 "l":22884,
        //                 "n":6,
        //                 "o":22884,
        //                 "t":"2022-07-21T05:01:00Z",
        //                 "v":0.001,
        //                 "vw":22889.5
        //              }
        //           ]
        //        },
        //        "next_page_token":"QlRDL1VTRHxNfDIwMjItMDctMjFUMDU6MDE6MDAuMDAwMDAwMDAwWg=="
        //     }
        //
        const bars = this.safeValue (response, 'bars', {});
        const ohlcvs = this.safeValue (bars, market['id'], {});
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //        "c":22895,
        //        "h":22895,
        //        "l":22884,
        //        "n":6,
        //        "o":22884,
        //        "t":"2022-07-21T05:01:00Z",
        //        "v":0.001,
        //        "vw":22889.5
        //     }
        //
        const datetime = this.safeString (ohlcv, 't');
        const timestamp = this.parse8601 (datetime);
        return [
            timestamp, // timestamp
            this.safeNumber (ohlcv, 'o'), // open
            this.safeNumber (ohlcv, 'h'), // high
            this.safeNumber (ohlcv, 'l'), // low
            this.safeNumber (ohlcv, 'c'), // close
            this.safeNumber (ohlcv, 'v'), // volume
        ];
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit' or 'stop_limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the alpaca api endpoint
         * @param {float} params.triggerPrice The price at which a trigger order is triggered at
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbol': id,
            'qty': this.amountToPrecision (symbol, amount),
            'side': side,
            'type': type, // market, limit, stop_limit
        };
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stop_price' ]);
        if (triggerPrice !== undefined) {
            let newType = undefined;
            if (type.indexOf ('limit') >= 0) {
                newType = 'stop_limit';
            } else {
                throw new NotSupported (this.id + ' createOrder() does not support stop orders for ' + type + ' orders, only stop_limit orders are supported');
            }
            request['stop_price'] = this.priceToPrecision (symbol, triggerPrice);
            request['type'] = newType;
        }
        if (type.indexOf ('limit') >= 0) {
            request['limit_price'] = this.priceToPrecision (symbol, price);
        }
        const defaultTIF = this.safeString (this.options, 'defaultTimeInForce');
        request['time_in_force'] = this.safeString (params, 'timeInForce', defaultTIF);
        params = this.omit (params, [ 'timeInForce', 'triggerPrice' ]);
        const clientOrderIdprefix = this.safeString (this.options, 'clientOrderId');
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        const random_id = parts.join ('');
        const defaultClientId = this.implodeParams (clientOrderIdprefix, { 'id': random_id });
        const clientOrderId = this.safeString (params, 'clientOrderId', defaultClientId);
        request['client_order_id'] = clientOrderId;
        params = this.omit (params, [ 'clientOrderId' ]);
        const order = await this.privatePostOrders (this.extend (request, params));
        //
        //   {
        //      "id": "61e69015-8549-4bfd-b9c3-01e75843f47d",
        //      "client_order_id": "eb9e2aaa-f71a-4f51-b5b4-52a6c565dad4",
        //      "created_at": "2021-03-16T18:38:01.942282Z",
        //      "updated_at": "2021-03-16T18:38:01.942282Z",
        //      "submitted_at": "2021-03-16T18:38:01.937734Z",
        //      "filled_at": null,
        //      "expired_at": null,
        //      "canceled_at": null,
        //      "failed_at": null,
        //      "replaced_at": null,
        //      "replaced_by": null,
        //      "replaces": null,
        //      "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        //      "symbol": "AAPL",
        //      "asset_class": "us_equity",
        //      "notional": "500",
        //      "qty": null,
        //      "filled_qty": "0",
        //      "filled_avg_price": null,
        //      "order_class": "",
        //      "order_type": "market",
        //      "type": "market",
        //      "side": "buy",
        //      "time_in_force": "day",
        //      "limit_price": null,
        //      "stop_price": null,
        //      "status": "accepted",
        //      "extended_hours": false,
        //      "legs": null,
        //      "trail_percent": null,
        //      "trail_price": null,
        //      "hwm": null
        //   }
        //
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the alpaca api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'order_id': id,
        };
        const response = await this.privateDeleteOrdersOrderId (this.extend (request, params));
        //
        //   {
        //       "code": 40410000,
        //       "message": "order is not found."
        //   }
        //
        return this.safeValue (response, 'message', {});
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the alpaca api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const order = await this.privateGetOrdersOrderId (this.extend (request, params));
        const marketId = this.safeString (order, 'symbol');
        const market = this.safeMarket (marketId);
        return this.parseOrder (order, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the alpaca api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const orders = await this.privateGetOrders (params);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        //    {
        //        "id":"6ecfcc34-4bed-4b53-83ba-c564aa832a81",
        //        "client_order_id":"ccxt_1c6ceab0b5e84727b2f1c0394ba17560",
        //        "created_at":"2022-06-14T13:59:30.224037068Z",
        //        "updated_at":"2022-06-14T13:59:30.224037068Z",
        //        "submitted_at":"2022-06-14T13:59:30.221856828Z",
        //        "filled_at":null,
        //        "expired_at":null,
        //        "canceled_at":null,
        //        "failed_at":null,
        //        "replaced_at":null,
        //        "replaced_by":null,
        //        "replaces":null,
        //        "asset_id":"64bbff51-59d6-4b3c-9351-13ad85e3c752",
        //        "symbol":"BTCUSD",
        //        "asset_class":"crypto",
        //        "notional":null,
        //        "qty":"0.01",
        //        "filled_qty":"0",
        //        "filled_avg_price":null,
        //        "order_class":"",
        //        "order_type":"limit",
        //        "type":"limit",
        //        "side":"buy",
        //        "time_in_force":"day",
        //        "limit_price":"14000",
        //        "stop_price":null,
        //        "status":"accepted",
        //        "extended_hours":false,
        //        "legs":null,
        //        "trail_percent":null,
        //        "trail_price":null,
        //        "hwm":null,
        //        "commission":"0.42",
        //        "source":null
        //    }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const alpacaStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (alpacaStatus);
        const feeValue = this.safeString (order, 'commission');
        let fee = undefined;
        if (feeValue !== undefined) {
            fee = {
                'cost': feeValue,
                'currency': 'USD',
            };
        }
        let orderType = this.safeString (order, 'order_type');
        if (orderType.indexOf ('limit') >= 0) {
            // might be limit or stop-limit
            orderType = 'limit';
        }
        const datetime = this.safeString (order, 'submitted_at');
        const timestamp = this.parse8601 (datetime);
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimeStamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce (this.safeString (order, 'time_in_force')),
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeNumber (order, 'limit_price'),
            'stopPrice': this.safeNumber (order, 'stop_price'),
            'triggerPrice': this.safeNumber (order, 'stop_price'),
            'cost': undefined,
            'average': this.safeNumber (order, 'filled_avg_price'),
            'amount': this.safeNumber (order, 'qty'),
            'filled': this.safeNumber (order, 'filled_qty'),
            'remaining': undefined,
            'trades': undefined,
            'fee': fee,
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'pending_new': 'open',
            'accepted': 'open',
            'new': 'open',
            'partially_filled': 'open',
            'activated': 'open',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'day': 'Day',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseTrade (trade, market = undefined) {
        //
        //   {
        //       "t":"2022-06-14T05:00:00.027869Z",
        //       "x":"CBSE",
        //       "p":"21942.15",
        //       "s":"0.0001",
        //       "tks":"S",
        //       "i":"355681339"
        //   }
        //
        const marketId = this.safeString (trade, 'S');
        const symbol = this.safeSymbol (marketId, market);
        const datetime = this.safeString (trade, 't');
        const timestamp = this.parse8601 (datetime);
        const alpacaSide = this.safeString (trade, 'tks');
        let side = undefined;
        if (alpacaSide === 'B') {
            side = 'buy';
        } else if (alpacaSide === 'S') {
            side = 'sell';
        }
        const priceString = this.safeString (trade, 'p');
        const amountString = this.safeString (trade, 's');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': 'taker',
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const versions = this.safeValue (this.options, 'versions');
        const version = this.safeString (versions, api);
        let endpoint = '/' + this.implodeParams (path, params);
        let url = this.implodeParams (this.urls['api'][api], { 'version': version });
        url = this.implodeHostname (url);
        headers = (headers !== undefined) ? headers : {};
        if (api === 'private') {
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
        const feedback = this.id + ' ' + body;
        const errorCode = this.safeString (response, 'code');
        if (code !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        const message = this.safeValue (response, 'message', undefined);
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
