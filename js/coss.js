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
            'countries': [ 'SG', 'NL' ],
            'rateLimit': 1000,
            'version': 'v1',
            'certified': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/50328158-22e53c00-0503-11e9-825c-c5cfd79bfa74.jpg',
                'api': {
                    'trade': 'https://trade.coss.io/c/api/v1',
                    'engine': 'https://engine.coss.io/api/v1',
                    'public': 'https://trade.coss.io/c/api/v1',
                    'web': 'https://trade.coss.io/c', // undocumented
                    'exchange': 'https://exchange.coss.io/api',
                },
                'www': 'https://www.coss.io',
                'doc': 'https://api.coss.io/v1/spec',
                'referral': 'https://www.coss.io/c/reg?r=OWCMHQVW2Q',
            },
            'has': {
                'fetchTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
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
                'exchange': {
                    'get': [
                        'getmarketsummaries',
                    ],
                },
                'public': {
                    'get': [
                        'market-price',
                        'exchange-info',
                    ],
                },
                'web': {
                    'get': [
                        'coins/getinfo/all', // undocumented
                        'order/symbols', // undocumented
                        'coins/get_base_list', // undocumented
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
                        'ping',
                        'time',
                        'account/balances',
                        'account/details',
                    ],
                    'post': [
                        'order/add',
                        'order/details',
                        'order/list/open',
                        'order/list/completed',
                        'order/list/all',
                        'order/trade-detail',
                    ],
                    'delete': [
                        'order/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.0025,
                    'maker': 0.0,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
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
        const result = [];
        const markets = this.safeValue (response, 'symbols', []);
        const baseCurrencies = this.safeValue (response, 'base_currencies', []);
        const baseCurrenciesByIds = this.indexBy (baseCurrencies, 'currency_code');
        const currencies = this.safeValue (response, 'coins', []);
        const currenciesByIds = this.indexBy (currencies, 'currency_code');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = market['symbol'];
            const [ baseId, quoteId ] = marketId.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_limit_decimal'),
                'price': this.safeInteger (market, 'price_limit_decimal'),
            };
            const active = this.safeValue (market, 'allow_trading', false);
            const baseCurrency = this.safeValue (baseCurrenciesByIds, baseId, {});
            const minCost = this.safeFloat (baseCurrency, 'minimum_total_order');
            const currency = this.safeValue (currenciesByIds, baseId, {});
            const defaultMinAmount = Math.pow (10, -precision['amount']);
            const minAmount = this.safeFloat (currency, 'minimum_order_amount', defaultMinAmount);
            result.push ({
                'symbol': symbol,
                'id': marketId,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.webGetCoinsGetinfoAll (params);
        //
        //     [ {                 currency_code: "VET",
        //                                  name: "VeChain",
        //                             buy_limit:  0,
        //                            sell_limit:  0,
        //                                  usdt:  0,
        //                transaction_time_limit:  5,
        //                                status: "trade",
        //                         withdrawn_fee: "0.6",
        //              minimum_withdrawn_amount: "1.2",
        //                minimum_deposit_amount: "0.6",
        //                  minimum_order_amount: "0.00000001",
        //                        decimal_format: "0.########",
        //                            token_type:  null, // "erc", "eos", "stellar", "tron", "ripple"...
        //                                buy_at:  0,
        //                               sell_at:  0,
        //                              min_rate:  0,
        //                              max_rate:  0,
        //                       allow_withdrawn:  false,
        //                         allow_deposit:  false,
        //         explorer_website_mainnet_link:  null,
        //         explorer_website_testnet_link:  null,
        //            deposit_block_confirmation: "6",
        //           withdraw_block_confirmation: "0",
        //                              icon_url: "https://s2.coinmarketcap.com/static/img/coins/32x32/3077.png",
        //                               is_fiat:  false,
        //                            allow_sell:  true,
        //                             allow_buy:  true                                                           }]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const currencyId = this.safeString (currency, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const allowBuy = this.safeValue (currency, 'allow_buy');
            const allowSell = this.safeValue (currency, 'allow_sell');
            const allowWithdrawals = this.safeValue (currency, 'allow_withdrawn');
            const allowDeposits = this.safeValue (currency, 'allow_deposit');
            const active = allowBuy && allowSell && allowWithdrawals && allowDeposits;
            const fee = this.safeFloat (currency, 'withdrawn_fee');
            const type = this.safeString (currency, 'token_type');
            //
            // decimal_format can be anything...
            //
            //     0.########
            //     #.########
            //     0.##
            //     '' (empty string)
            //     0.000000
            //     null (undefined)
            //     0.0000
            //     0.###
            //
            const decimalFormat = this.safeString (currency, 'decimal_format');
            let precision = 8;
            if (decimalFormat !== undefined) {
                const parts = decimalFormat.split ('.');
                const numParts = parts.length; // transpiler workaround for array lengths
                if (numParts > 1) {
                    if (parts[1].length > 1) {
                        precision = parts[1].length;
                    }
                }
            }
            result[code] = {
                'id': currencyId,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'type': type,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minimum_order_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minimum_withdrawn_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.tradeGetAccountBalances (params);
        //
        //     [ { currency_code: "ETH",
        //               address: "0x6820511d43111a941d3e187b9e36ec64af763bde", // deposit address
        //                 total: "0.20399125",
        //             available: "0.20399125",
        //              in_order: "0",
        //                  memo:  null                                         }, // tag, if any
        //       { currency_code: "ICX",
        //               address: "",
        //                 total: "0",
        //             available: "0",
        //              in_order: "0",
        //                  memo:  null  }                                         ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const total = this.safeFloat (balance, 'total');
            const used = this.safeFloat (balance, 'in_order');
            const free = this.safeFloat (balance, 'available');
            result[code] = {
                'total': total,
                'used': used,
                'free': free,
            };
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
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
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'tt': this.timeframes[timeframe],
        };
        const response = await this.engineGetCs (this.extend (request, params));
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
        const marketId = this.marketId (symbol);
        const request = { 'symbol': marketId };
        // limit argument is not supported on COSS's end
        const response = await this.engineGetDp (this.extend (request, params));
        //
        //     { symbol:   "COSS_ETH",
        //         asks: [ ["0.00065200", "214.15000000"],
        //                 ["0.00065300", "645.45000000"],
        //                 ...
        //                 ["0.00076400", "380.00000000"],
        //                 ["0.00076900", "25.00000000"]     ],
        //        limit:    100,
        //         bids: [ ["0.00065100", "666.99000000"],
        //                 ["0.00065000", "1171.93000000"],
        //                 ...
        //                 ["0.00037700", "3300.00000000"],
        //                 ["0.00037600", "2010.82000000"]   ],
        //         time:    1545180569354                       }
        //
        const timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        //      { MarketName: "COSS-ETH",
        //              High:  0.00066,
        //               Low:  0.000628,
        //        BaseVolume:  131.09652674,
        //              Last:  0.000636,
        //         TimeStamp: "2018-12-19T05:16:41.369Z",
        //            Volume:  206126.6143710692,
        //               Ask: "0.00063600",
        //               Bid: "0.00063400",
        //           PrevDay:  0.000636                   }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'TimeStamp'));
        let symbol = undefined;
        let marketId = this.safeString (ticker, 'MarketName');
        if (marketId !== undefined) {
            marketId = marketId.replace ('-', '_');
        }
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market === undefined) {
            if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const previous = this.safeFloat (ticker, 'PrevDay');
        const last = this.safeFloat (ticker, 'Last');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined) {
            if (previous !== undefined) {
                change = last - previous;
                if (previous > 0) {
                    percentage = (change / previous) * 100;
                }
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'High'),
            'low': this.safeFloat (ticker, 'Low'),
            'bid': this.safeFloat (ticker, 'Bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'Ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': previous,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'Volume'),
            'quoteVolume': this.safeFloat (ticker, 'BaseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.exchangeGetGetmarketsummaries (params);
        //
        //     { success:    true,
        //       message:   "",
        //        result: [ { MarketName: "COSS-ETH",
        //                          High:  0.00066,
        //                           Low:  0.000628,
        //                    BaseVolume:  131.09652674,
        //                          Last:  0.000636,
        //                     TimeStamp: "2018-12-19T05:16:41.369Z",
        //                        Volume:  206126.6143710692,
        //                           Ask: "0.00063600",
        //                           Bid: "0.00063400",
        //                       PrevDay:  0.000636                   },
        //                  ...
        //                  { MarketName: "XLM-BTC",
        //                          High:  0.0000309,
        //                           Low:  0.0000309,
        //                    BaseVolume:  0,
        //                          Last:  0.0000309,
        //                     TimeStamp: "2018-12-19T02:00:02.145Z",
        //                        Volume:  0,
        //                           Ask: "0.00003300",
        //                           Bid: "0.00003090",
        //                       PrevDay:  0.0000309                  }  ],
        //       volumes: [ { CoinName: "ETH", Volume: 668.1928095999999 }, // these are overall exchange volumes
        //                  { CoinName: "USD", Volume: 9942.58480324 },
        //                  { CoinName: "BTC", Volume: 43.749184570000004 },
        //                  { CoinName: "COSS", Volume: 909909.26644574 },
        //                  { CoinName: "EUR", Volume: 0 },
        //                  { CoinName: "TUSD", Volume: 2613.3395026999997 },
        //                  { CoinName: "USDT", Volume: 1017152.07416519 },
        //                  { CoinName: "GUSD", Volume: 1.80438 },
        //                  { CoinName: "XRP", Volume: 15.95508 },
        //                  { CoinName: "GBP", Volume: 0 },
        //                  { CoinName: "USDC", Volume: 0 }                   ],
        //             t:    1545196604371                                       }
        //
        const tickers = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.engineGetHt (this.extend (request, params));
        //
        //     {  symbol:   "COSS_ETH",
        //         limit:    100,
        //       history: [ {           id:  481321,
        //                           price: "0.00065100",
        //                             qty: "272.92000000",
        //                    isBuyerMaker:  false,
        //                            time:  1545180845019  },
        //                  {           id:  481322,
        //                           price: "0.00065200",
        //                             qty: "1.90000000",
        //                    isBuyerMaker:  true,
        //                            time:  1545180847535 },
        //                  ...
        //                  {           id:  481420,
        //                           price: "0.00065300",
        //                             qty: "2.00000000",
        //                    isBuyerMaker:  true,
        //                            time:  1545181167702 }   ],
        //          time:    1545181171274                        }
        //
        return this.parseTrades (response['history'], market, since, limit);
    }

    parseTradeFee (fee) {
        if (fee === undefined) {
            return fee;
        }
        const parts = fee.split (' ');
        const numParts = parts.length;
        const cost = parts[0];
        let code = undefined;
        if (numParts > 1) {
            code = this.safeCurrencyCode (parts[1]);
        }
        return {
            'cost': cost,
            'currency': code,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {           id:  481322,
        //               price: "0.00065200",
        //                 qty: "1.90000000",
        //        isBuyerMaker:  true,
        //                time:  1545180847535 }
        //
        // fetchOrderTrades (private)
        //
        //     [ {         hex_id:  null,
        //                 symbol: "COSS_ETH",
        //               order_id: "ad6f6b47-3def-4add-a5d5-2549a9df1593",
        //             order_side: "BUY",
        //                  price: "0.00065900",
        //               quantity: "10",
        //                    fee: "0.00700000 COSS",
        //         additional_fee: "0.00000461 ETH",
        //                  total: "0.00659000 ETH",
        //              timestamp:  1545152356075                          } ]
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeInteger (trade, 'time');
        const orderId = this.safeString (trade, 'order_id');
        const side = this.safeStringLower (trade, 'order_side');
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        if (marketId !== undefined) {
            market = this.safeValue (this.markets_by_id, marketId, market);
            if (market === undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        } else if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat2 (trade, 'qty', 'quantity');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const result = {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
        const fee = this.parseTradeFee (this.safeString (trade, 'fee'));
        if (fee !== undefined) {
            const additionalFee = this.parseTradeFee (this.safeString (trade, 'additional_fee'));
            if (additionalFee === undefined) {
                result['fee'] = fee;
            } else {
                result['fees'] = [
                    fee,
                    additionalFee,
                ];
            }
        }
        return result;
    }

    async fetchOrdersByType (type, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'from_id': 'b2a2d379-f9b6-418b-9414-cbf8330b20d1', // string (uuid), fetchOrders (all orders) only
            // 'page': 0, // different pagination in fetchOpenOrders and fetchClosedOrders
            // 'limit': 50, // optional, max = default = 50
            'symbol': market['id'], // required
        };
        if (limit !== undefined) {
            request['limit'] = limit; // max = default = 50
        }
        const method = 'tradePostOrderList' + type;
        const response = await this[method] (this.extend (request, params));
        //
        // fetchOrders, fetchClosedOrders
        //
        //     [ {       hex_id: "5c192784330fe51149f556bb",
        //             order_id: "5e46e1b1-93d5-4656-9b43-a5635b08eae9",
        //           account_id: "a0c20128-b9e0-484e-9bc8-b8bb86340e5b",
        //         order_symbol: "COSS_ETH",
        //           order_side: "BUY",
        //               status: "filled",
        //           createTime:  1545152388019,
        //                 type: "limit",
        //         timeMatching:  0,
        //          order_price: "0.00065900",
        //           order_size: "10",
        //             executed: "10",
        //           stop_price: "0.00000000",
        //                  avg: "0.00065900",
        //                total: "0.00659000 ETH"                        }  ]
        //
        // fetchOpenOrders
        //
        //     {
        //         "total": 2,
        //         "list": [
        //             {
        //                 "order_id": "9e5ae4dd-3369-401d-81f5-dff985e1c4ty",
        //                 "account_id": "9e5ae4dd-3369-401d-81f5-dff985e1c4a6",
        //                 "order_symbol": "eth-btc",
        //                 "order_side": "BUY",
        //                 "status": "OPEN",
        //                 "createTime": 1538114348750,
        //                 "type": "limit",
        //                 "order_price": "0.12345678",
        //                 "order_size": "10.12345678",
        //                 "executed": "0",
        //                 "stop_price": "02.12345678",
        //                 "avg": "1.12345678",
        //                 "total": "2.12345678"
        //             }
        //         ]
        //     }
        //
        // the following code is to handle the above difference in response formats
        let orders = undefined;
        if (Array.isArray (response)) {
            orders = response;
        } else {
            orders = this.safeValue (response, 'list', []);
        }
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByType ('All', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByType ('Completed', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByType ('Open', symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.tradePostOrderDetails (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'order_id': id,
        };
        const response = await this.tradePostOrderTradeDetail (this.extend (request, params));
        //
        //     [ {         hex_id:  null,
        //                 symbol: "COSS_ETH",
        //               order_id: "ad6f6b47-3def-4add-a5d5-2549a9df1593",
        //             order_side: "BUY",
        //                  price: "0.00065900",
        //               quantity: "10",
        //                    fee: "0.00700000 COSS",
        //         additional_fee: "0.00000461 ETH",
        //                  total: "0.00659000 ETH",
        //              timestamp:  1545152356075                          } ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        if (status === undefined) {
            return status;
        }
        const statuses = {
            'OPEN': 'open',
            'CANCELLED': 'canceled',
            'FILLED': 'closed',
            'PARTIAL_FILL': 'closed',
            'CANCELLING': 'open',
        };
        return this.safeString (statuses, status.toUpperCase (), status);
    }

    parseOrder (order, market = undefined) {
        //
        //       {       hex_id: "5c192784330fe51149f556bb", // missing in fetchOpenOrders
        //             order_id: "5e46e1b1-93d5-4656-9b43-a5635b08eae9",
        //           account_id: "a0c20128-b9e0-484e-9bc8-b8bb86340e5b",
        //         order_symbol: "COSS_ETH", // coss-eth in docs
        //           order_side: "BUY",
        //               status: "filled",
        //           createTime:  1545152388019,
        //                 type: "limit",
        //         timeMatching:  0, // missing in fetchOpenOrders
        //          order_price: "0.00065900",
        //           order_size: "10",
        //             executed: "10",
        //           stop_price: "0.00000000",
        //                  avg: "0.00065900",
        //                total: "0.00659000 ETH"                        }
        //
        const id = this.safeString (order, 'order_id');
        let symbol = undefined;
        let marketId = this.safeString (order, 'order_symbol');
        if (marketId === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        } else {
            // a minor workaround for lowercase eth-btc symbols
            marketId = marketId.toUpperCase ();
            marketId = marketId.replace ('-', '_');
            market = this.safeValue (this.markets_by_id, marketId, market);
            if (market === undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            } else {
                symbol = market['symbol'];
            }
        }
        const timestamp = this.safeInteger (order, 'createTime');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const price = this.safeFloat (order, 'order_price');
        const filled = this.safeFloat (order, 'executed');
        const type = this.safeString (order, 'type');
        const amount = this.safeFloat (order, 'order_size');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = amount - filled;
            }
        }
        const average = this.safeFloat (order, 'avg');
        const side = this.safeStringLower (order, 'order_side');
        const cost = this.safeFloat (order, 'total');
        const fee = undefined;
        const trades = undefined;
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_symbol': market['id'],
            'order_size': this.amountToPrecision (symbol, amount),
            'order_side': side.toUpperCase (),
            'type': type,
        };
        if (price !== undefined) {
            request['order_price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.tradePostOrderAdd (this.extend (request, params));
        //
        //     {
        //         "order_id": "9e5ae4dd-3369-401d-81f5-dff985e1c4ty",
        //         "account_id": "9e5ae4dd-3369-401d-81f5-dff985e1c4a6",
        //         "order_symbol": "eth-btc",
        //         "order_side": "BUY",
        //         "status": "OPEN",
        //         "createTime": 1538114348750,
        //         "type": "limit",
        //         "order_price": "0.12345678",
        //         "order_size": "10.12345678",
        //         "executed": "0",
        //         "stop_price": "02.12345678",
        //         "avg": "1.12345678",
        //         "total": "2.12345678"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'order_symbol': market['id'],
        };
        const response = await this.tradeDeleteOrderCancel (this.extend (request, params));
        //
        //     { order_symbol: "COSS_ETH",
        //           order_id: "30f2d698-39a0-4b9f-a3a6-a179542373bd",
        //         order_size:  0,
        //         account_id: "a0c20128-b9e0-484e-9bc8-b8bb86340e5b",
        //          timestamp:  1545202728814,
        //         recvWindow:  null                                   }
        //
        return this.parseOrder (response);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'trade') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ();
            const query = this.extend ({
                'timestamp': timestamp, // required (int64)
                // 'recvWindow': 10000, // optional (int32)
            }, params);
            let request = undefined;
            if (method === 'GET') {
                request = this.urlencode (query);
                url += '?' + request;
            } else {
                request = this.json (query);
                body = request;
            }
            headers = {
                'Signature': this.hmac (this.encode (request), this.encode (this.secret)),
                'Authorization': this.apiKey,
            };
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
