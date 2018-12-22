'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, DDoSProtection, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class okex3 extends Exchange {
    describe () {
        const allTypes = [ 'spot', 'futures', 'swap' ]
        return this.deepExtend (super.describe (), {
            'id': 'okex3',
            'name': 'OKEX',
            'countries': [ 'CN', 'US' ],
            'version': 'v3',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'futures': false,
            },
            'timeframes': {
                '1m': '60',
                '3m': '180',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '6h': '21600',
                '12h': '43200',
                '1d': '86400',
                '1w': '604800',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api': 'https://www.okex.com',
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/docs/en/',
                'fees': 'https://www.okex.com/pages/products/fees.html',
            },
            'api': {
                'general': {
                    'get': [
                        'time',
                    ],
                },
                'account': {
                    'get': [
                        'currencies',
                        'wallet',
                        'wallet/{currency}',
                        'withdrawal/fee',
                        'withdrawal/history',
                        'withdrawal/history/{currency}',
                        'ledger',
                        'deposit/address',
                        'deposit/history',
                        'deposit/history/{currency}',
                    ],
                    'post': [
                        'transfer',
                        'withdrawal',
                    ],
                },
                'spot': {
                    'get': [
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/ledger',
                        'orders',
                        'orders_pending',
                        'orders/{order_id}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/book',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                    ],
                    'post': [
                        'orders',
                        'batch_orders',
                        'cancel_orders/{order_id}',
                        'cancel_batch_orders',
                    ],
                },
                'margin': {
                    'get': [
                        'accounts',
                        'accounts/{instrument_id}',
                        'accounts/{instrument_id}/ledger',
                        'accounts/availability',
                        'accounts/{instrument_id}/availability',
                        'accounts/borrowed',
                        'accounts/{instrument_id}/borrowed',
                        'orders',
                        'orders/{order_id}',
                        'orders_pending',
                        'fills',
                    ],
                    'post': [
                        'accounts/borrow',
                        'accounts/repayment',
                        'orders',
                        'batch_orders',
                    ],
                    'delete': [
                        'cancel_orders',
                        'cancel_batch_orders',
                    ],
                },
                'futures': {
                    'get': [
                        'position',
                        '{instrument_id}/position',
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/leverage',
                        'accounts/{currency}/ledger',
                        'orders/{instrument_id}',
                        'orders/{instrument_id}/{order_id}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/book',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                        'accounts/{instrument_id}/holds',
                        'instruments/{instrument_id}/index',
                        'rate',
                        'instruments/{instrument_id}/estimated_price',
                        'instruments/{instrument_id}/open_interest',
                        'instruments/{instrument_id}/price_limit',
                        'instruments/{instrument_id}/liquidation',
                        'instruments/{instrument_id}/mark_price',
                    ],
                    'post': [
                        'accounts/{currency}/leverage',
                        'order',
                        'orders',
                        'cancel_order/{instrument_id}/{order_id}',
                        'cancel_batch_orders/{instrument_id}',
                    ],
                },
                'swap': {
                    'get': [
                        '{instrument_id}/position',
                        'accounts',
                        '{instrument_id}/accounts',
                        'accounts/{instrument_id}/settings',
                        'accounts/{instrument_id}/ledger',
                        'accounts/{instrument_id}/holds',
                        'orders/{instrument_id}',
                        'orders/{instrument_id}/{order_id}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/depth?size=50',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                        'instruments/{instrument_id}/index',
                        'rate',
                        'instruments/{instrument_id}/open_interest',
                        'instruments/{instrument_id}/price_limit',
                        'instruments/{instrument_id}/liquidation',
                        'instruments/{instrument_id}/funding_time',
                        'instruments/{instrument_id}/mark_price',
                        'instruments/{instrument_id}/historical_funding_rate',
                    ],
                    'post': [
                        'accounts/{instrument_id}/leverage',
                        'order',
                        'orders',
                        'cancel_order/{instrument_id}/{order_id}',
                        'cancel_batch_orders/{instrument_id}',
                    ],
                },
                'ett': {
                    'get': [
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/ledger',
                        'orders', // fetchOrder, fetchOrders
                        // public
                        'constituents/{ett}',
                        'define-price/{ett}',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{order_id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'exceptions': {
                // Common Error Codes
                // 400 Bad Request — Invalid request format
                // 401 Unauthorized — Invalid API Key
                // 403 Forbidden — You do not have access to the requested resource
                // 404 Not Found
                // 500 Internal Server Error — We had a problem with our server
                'exact': {
                    'failure to get a peer from the ring-balancer': ExchangeError, // {"message":"failure to get a peer from the ring-balancer"}
                    'The currency pair does not exist': ExchangeError, // {"code":30032,"message":"The currency pair does not exist"}
                    'OK-ACCESS-KEY header is required': AuthenticationError, // {"code":30001,"message":"OK-ACCESS-KEY header is required"}
                    'Invalid Sign': AuthenticationError, // {"code":30013,"message":"Invalid Sign"}
                    'User does not exist': AuthenticationError, // {"code":35005,"message":"User does not exist"}
                },
                'broad': {
                },
            },
            'options': {
                'fetchMarkets': allTypes,
                'fetchTickers': allTypes,
                'fetchBalance': allTypes,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const marketTypes = this.safeValue (this.options, 'fetchMarkets', [ 'spot', 'futures', 'swap' ]);
        const warning = this.safeValue (this.options, 'somename', true);
        if (warning) {
            throw new ExchangeError (this.id + ' is configured to use ' + marketTypes.join (', ') + ' API by default'
        }
        let result = [];
        for (let i = 0; i < marketTypes.length; i++) {
            const marketType = marketTypes[i];
            const method = 'fetch' + this.capitalize (marketType) + 'Markets';
            const markets = await this[method] (params);
            result = this.arrayConcat (result, markets);
        }
        return result;
    }

    async parseMarkets (markets) {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push (this.parseMarket (markets[i]));
        }
        return result;
    }

    parseMarket (market) {
        //
        // fetchSpotMarkets
        //
        //     [ {   base_currency: "EOS",
        //          base_increment: "0.000001",
        //           base_min_size: "0.01",
        //           instrument_id: "EOS-OKB",
        //                min_size: "0.01",
        //              product_id: "EOS-OKB",
        //          quote_currency: "OKB",
        //         quote_increment: "0.0001",
        //          size_increment: "0.000001",
        //               tick_size: "0.0001"        },
        //
        //       ..., // the spot endpoint also returns ETT instruments
        //
        //       {   base_currency: "OK06ETT",
        //          base_increment: "0.00000001",
        //           base_min_size: "0.01",
        //           instrument_id: "OK06ETT-USDT",
        //                min_size: "0.01",
        //              product_id: "OK06ETT-USDT",
        //          quote_currency: "USDT",
        //         quote_increment: "0.0001",
        //          size_increment: "0.00000001",
        //               tick_size: "0.0001"        } ]
        //
        // fetchFuturesMarkets
        //
        //     [ {    instrument_id: "BTG-USD-190329",
        //         underlying_index: "BTG",
        //           quote_currency: "USD",
        //                tick_size: "0.01",
        //             contract_val: "10",
        //                  listing: "2018-12-14",
        //                 delivery: "2019-03-29",
        //          trade_increment: "1"               }  ]
        //
        // fetchSwapMarkets
        //
        //     [ {    instrument_id: "BTC-USD-SWAP",
        //         underlying_index: "BTC",
        //           quote_currency: "USD",
        //                     coin: "BTC",
        //             contract_val: "100",
        //                  listing: "2018-10-23T20:11:00.443Z",
        //                 delivery: "2018-10-24T20:11:00.443Z",
        //           size_increment: "4",
        //                tick_size: "4"                         }  ]
        //
        const id = this.safeString (market, 'instrument_id');
        let marketType = 'spot';
        let spot = true;
        let future = false;
        let swap = false;
        let baseId = this.safeString (market, 'base_currency');
        if (baseId === undefined) {
            marketType = 'swap';
            spot = false;
            swap = true;
            baseId = this.safeString (market, 'coin');
            if (baseId === undefined) {
                swap = false;
                future = true;
                marketType = 'futures';
                baseId = this.safeString (market, 'underlying_index');
            }
        }
        const quoteId = this.safeString (market, 'quote_currency');
        const base = this.commonCurrencyCode (baseId);
        const quote = this.commonCurrencyCode (quoteId);
        const symbol = spot ? (base + '/' + quote) : id;
        const precision = {
            'amount': market['maxSizeDigit'],
            'price': market['maxPriceDigit'],
        };
        const minAmount = market['minTradeSize'];
        const minPrice = Math.pow (10, -precision['price']);
        const active = (market['online'] !== 0);
        const baseNumericId = market['baseCurrency'];
        const quoteNumericId = market['quoteCurrency'];
        // let market =
        return this.extend (this.fees['trading'], {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'baseNumericId': baseNumericId,
            'quoteNumericId': quoteNumericId,
            'info': market,
            'type': marketType,
            'spot': spot,
            'futures': future,
            'swap': swap,
            'active': active,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': minAmount,
                    'max': undefined,
                },
                'price': {
                    'min': minPrice,
                    'max': undefined,
                },
                'cost': {
                    'min': minAmount * minPrice,
                    'max': undefined,
                },
            },
        });
    }

    async fetchMarketsByType (type, params = {}) {
        const method = type + 'GetInstruments';
        const response = await this[method] (params);
        return this.parseMarkets (response);
    }

    async fetchSwapMarkets (params = {}) {
        let response = await this.swapGetInstruments (params);
        //
        //     [ {    instrument_id: "BTC-USD-SWAP",
        //         underlying_index: "BTC",
        //           quote_currency: "USD",
        //                     coin: "BTC",
        //             contract_val: "100",
        //                  listing: "2018-10-23T20:11:00.443Z",
        //                 delivery: "2018-10-24T20:11:00.443Z",
        //           size_increment: "4",
        //                tick_size: "4"                         }  ]
        //
        return this.parseMarkets (response);
    }

    async fetchFuturesMarkets (params = {}) {
        let response = await this.futuresGetInstruments (params);
        //
        //     [ {    instrument_id: "BTG-USD-190329",
        //         underlying_index: "BTG",
        //           quote_currency: "USD",
        //                tick_size: "0.01",
        //             contract_val: "10",
        //                  listing: "2018-12-14",
        //                 delivery: "2019-03-29",
        //          trade_increment: "1"               }  ]
        //
        return this.parseMarkets (response);
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.spotGetInstruments (params);
        //
        //     [ {   base_currency: "EOS",
        //          base_increment: "0.000001",
        //           base_min_size: "0.01",
        //           instrument_id: "EOS-OKB",
        //                min_size: "0.01",
        //              product_id: "EOS-OKB",
        //          quote_currency: "OKB",
        //         quote_increment: "0.0001",
        //          size_increment: "0.000001",
        //               tick_size: "0.0001"    }      ]
        //
        return this.parseMarkets (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketType = this.safeString (market, 'type', 'spot');
        let method = marketType + 'GetInstrumentsInstrumentId';
        method += (marketType === 'swap') ? 'Depth' : 'Book';
        let request = {
            'instrument_id': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // max 200
        }
        let response = await this[method] (this.extend (request, params));
        //
        //     {      asks: [ ["0.02685268", "0.242571", "1"],
        //                    ["0.02685493", "0.164085", "1"],
        //                    ...
        //                    ["0.02779", "1.039", "1"],
        //                    ["0.027813", "0.0876", "1"]        ],
        //            bids: [ ["0.02684052", "10.371849", "1"],
        //                    ["0.02684051", "3.707", "4"],
        //                    ...
        //                    ["0.02634963", "0.132934", "1"],
        //                    ["0.02634962", "0.264838", "2"]    ],
        //       timestamp:   "2018-12-17T20:24:16.159Z"            }
        //
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {         best_ask: "0.02665472",
        //               best_bid: "0.02665221",
        //          instrument_id: "ETH-BTC",
        //             product_id: "ETH-BTC",
        //                   last: "0.02665472",
        //                    ask: "0.02665472", // missing in the docs
        //                    bid: "0.02665221", // not mentioned in the docs
        //               open_24h: "0.02645482",
        //               high_24h: "0.02714633",
        //                low_24h: "0.02614109",
        //        base_volume_24h: "572298.901923",
        //              timestamp: "2018-12-17T21:20:07.856Z",
        //       quote_volume_24h: "15094.86831261"            }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'instrument_id');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else if (marketId !== undefined) {
            const parts = marketId.split ('-');
            const numParts = parts.length;
            if (numParts === 2) {
                const [ baseId, quoteId ] = parts;
                let base = baseId.toUpperCase ();
                let quote = quoteId.toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                symbol = base + '/' + quote;
            } else {
                symbol = marketId;
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let last = this.safeFloat (ticker, 'last');
        let open = this.safeFloat (ticker, 'open_24h');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_24h'),
            'low': this.safeFloat (ticker, 'low_24h'),
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'base_volume_24h'),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume_24h'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdTicker';
        const request = {
            'instrument_id': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        //
        //     {         best_ask: "0.02665472",
        //               best_bid: "0.02665221",
        //          instrument_id: "ETH-BTC",
        //             product_id: "ETH-BTC",
        //                   last: "0.02665472",
        //                    ask: "0.02665472",
        //                    bid: "0.02665221",
        //               open_24h: "0.02645482",
        //               high_24h: "0.02714633",
        //                low_24h: "0.02614109",
        //        base_volume_24h: "572298.901923",
        //              timestamp: "2018-12-17T21:20:07.856Z",
        //       quote_volume_24h: "15094.86831261"            }
        //
        return this.parseTicker (response);
    }

    async fetchTickersByType (type, symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const method = type + 'GetInstrumentsTicker';
        const response = await this[method] (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'fetchTickersType', 'spot');
        const type = this.safeString2 (params, 'type', 'api', defaultType);
        params = this.omit (params, [ 'type', 'api' ]);
        return await this.fetchTickersByType (type, symbols, params);
    }

    async fetchSpotTickers (symbols = undefined, params = {}) {
        return await this.fetchTickersByType ('spot', symbols, params);
    }

    async fetchFuturesTickers (symbols = undefined, params = {}) {
        return await this.fetchTickersByType ('futures', symbols, params);
    }

    async fetchSwapTickers (symbols = undefined, params = {}) {
        return await this.fetchTickersByType ('swap', symbols, params);
    }

    parseTrade (trade, market = undefined) {
        //
        // spot markets
        //
        //     [ {      time: "2018-12-17T23:31:08.268Z",
        //         timestamp: "2018-12-17T23:31:08.268Z",
        //          trade_id: "409687906",
        //             price: "0.02677805",
        //              size: "0.923467",
        //              side: "sell"                      }  ]
        //
        // futures
        //
        //     [ {  trade_id: "1989230840021013",
        //              side: "buy",
        //             price: "92.42",
        //               qty: "184",
        //         timestamp: "2018-12-17T23:26:04.613Z" }  ]
        //
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'trade_id'),
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat2 (trade, 'qty', 'size'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdTrades';
        const request = {
            'instrument_id': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        //
        // spot markets
        //
        //     [ {      time: "2018-12-17T23:31:08.268Z",
        //         timestamp: "2018-12-17T23:31:08.268Z",
        //          trade_id: "409687906",
        //             price: "0.02677805",
        //              size: "0.923467",
        //              side: "sell"                      }  ]
        //
        // futures
        //
        //     [ {  trade_id: "1989230840021013",
        //              side: "buy",
        //             price: "92.42",
        //               qty: "184",
        //         timestamp: "2018-12-17T23:26:04.613Z" }  ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        // spot markets
        //
        //       {  close: "0.02684545",
        //           high: "0.02685084",
        //            low: "0.02683312",
        //           open: "0.02683894",
        //           time: "2018-12-17T20:28:00.000Z",
        //         volume: "101.457222"                }
        //
        // futures
        //
        //       [ 1545072720000,
        //         0.3159,
        //         0.3161,
        //         0.3144,
        //         0.3149,
        //         22886,
        //         725179.26172331 ]
        //
        if (Array.isArray (ohlcv)) {
            let numElements = ohlcv.length;
            let volumeIndex = (numElements > 6) ? 6 : 5;
            return [
                ohlcv[0], // timestamp
                parseFloat (ohlcv[1]), // (O) Open
                parseFloat (ohlcv[2]), // (H) High
                parseFloat (ohlcv[3]), // (L) Low
                parseFloat (ohlcv[4]), // (C) Close
                // parseFloat (ohlcv[5]), // (V) quote volume
                // parseFloat (ohlcv[6]), // (V) base volume
                parseFloat (ohlcv[volumeIndex]), // (V) okex will return base volume in the 7th element for future markets
            ];
        } else {
            return [
                this.parse8601 (this.safeString (ohlcv, 'time')),
                this.safeFloat (ohlcv, 'open'),  // (O) Open
                this.safeFloat (ohlcv, 'high'),  // (H) High
                this.safeFloat (ohlcv, 'low'),   // (L) Low
                this.safeFloat (ohlcv, 'close'), // (C) Close
                this.safeFloat (ohlcv, 'volume'), // (V) base volume
            ];
        }
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdCandles';
        const request = {
            'instrument_id': market['id'],
            'granularity': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = this.iso8601 (since);
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot markets
        //
        //     [ {  close: "0.02683401",
        //           high: "0.02683401",
        //            low: "0.02683401",
        //           open: "0.02683401",
        //           time: "2018-12-17T23:47:00.000Z",
        //         volume: "0"                         },
        //       ...
        //       {  close: "0.02684545",
        //           high: "0.02685084",
        //            low: "0.02683312",
        //           open: "0.02683894",
        //           time: "2018-12-17T20:28:00.000Z",
        //         volume: "101.457222"                }  ]
        //
        // futures
        //
        //     [ [ 1545090660000,
        //         0.3171,
        //         0.3174,
        //         0.3171,
        //         0.3173,
        //         1648,
        //         51930.38579450868 ],
        //       ...
        //       [ 1545072720000,
        //         0.3159,
        //         0.3161,
        //         0.3144,
        //         0.3149,
        //         22886,
        //         725179.26172331 ]    ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalanceByType (type, params = {}) {
        await this.loadMarkets ();
        const method = type + 'GetAccounts';
        const response = await this[method] (params);
        const log = require ('ololog').unlimited;
        log.red (response);
        process.exit ();
        // let balances = response['info']['funds'];
        // let result = { 'info': response };
        // let ids = Object.keys (balances['free']);
        // let usedField = 'freezed';
        // // wtf, okex?
        // // https://github.com/okcoin-okex/API-docs-OKEx.com/commit/01cf9dd57b1f984a8737ef76a037d4d3795d2ac7
        // if (!(usedField in balances))
        //     usedField = 'holds';
        // let usedKeys = Object.keys (balances[usedField]);
        // ids = this.arrayConcat (ids, usedKeys);
        // for (let i = 0; i < ids.length; i++) {
        //     let id = ids[i];
        //     let code = id.toUpperCase ();
        //     if (id in this.currencies_by_id) {
        //         code = this.currencies_by_id[id]['code'];
        //     } else {
        //         code = this.commonCurrencyCode (code);
        //     }
        //     let account = this.account ();
        //     account['free'] = this.safeFloat (balances['free'], id, 0.0);
        //     account['used'] = this.safeFloat (balances[usedField], id, 0.0);
        //     account['total'] = this.sum (account['free'], account['used']);
        //     result[code] = account;
        // }
        // return this.parseBalance (result);
        return this.parseBalance (response);
    }

    async fetchSpotBalance (params = {}) {
        await this.loadMarkets ();
        const response = this.spotGetAccounts (params);
        //
        //     [ {    frozen: "0",
        //              hold: "0",
        //                id: "2149632",
        //          currency: "BTC",
        //           balance: "0.0000000497717339",
        //         available: "0.0000000497717339",
        //             holds: "0"                   },
        //       {    frozen: "0",
        //              hold: "0",
        //                id: "2149632",
        //          currency: "ETH",
        //           balance: "0.000835354575",
        //         available: "0.000835354575",
        //             holds: "0"               },
        //       {    frozen: "0",
        //              hold: "0",
        //                id: "2149632",
        //          currency: "ICN",
        //           balance: "0.00000000925",
        //         available: "0.00000000925",
        //             holds: "0"              }       ]
        //

    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const defaultFetchBalanceType = this.safeString (this.options, 'defaultFetchBalanceType', 'spot');
        const type = this.safeString2 (params, 'type', 'api', defaultFetchBalanceType);
        params = this.omit (params, [ 'type', 'api' ]);
        return await this.fetchBalanceByType (type, params);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let order = {
            'symbol': market['id'],
            'type': side,
        };
        if (market['future']) {
            method += 'Future';
            order = this.extend (order, {
                'contract_type': this.options['defaultContractType'], // this_week, next_week, quarter
                'match_price': 0, // match best counter party price? 0 or 1, ignores price if 1
                'lever_rate': 10, // leverage rate value: 10 or 20 (10 by default)
                'price': price,
                'amount': amount,
            });
        } else {
            if (type === 'limit') {
                order['price'] = price;
                order['amount'] = amount;
            } else {
                order['type'] += '_market';
                if (side === 'buy') {
                    if (this.options['marketBuyPrice']) {
                        if (price === undefined) {
                            // eslint-disable-next-line quotes
                            throw new ExchangeError (this.id + " market buy orders require a price argument (the amount you want to spend or the cost of the order) when this.options['marketBuyPrice'] is true.");
                        }
                        order['price'] = price;
                    } else {
                        order['price'] = this.safeFloat (params, 'cost');
                        if (!order['price']) {
                            // eslint-disable-next-line quotes
                            throw new ExchangeError (this.id + " market buy orders require an additional cost parameter, cost = price * amount. If you want to pass the cost of the market order (the amount you want to spend) in the price argument (the default " + this.id + " behaviour), set this.options['marketBuyPrice'] = true. It will effectively suppress this warning exception as well.");
                        }
                    }
                } else {
                    order['amount'] = amount;
                }
            }
        }
        params = this.omit (params, 'cost');
        method += 'Trade';
        let response = await this[method] (this.extend (order, params));
        let timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': response['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'order_id': id,
        };
        let method = 'privatePost';
        if (market['future']) {
            method += 'FutureCancel';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
        } else {
            method += 'CancelOrder';
        }
        let response = await this[method] (this.extend (request, params));
        return response;
    }

    parseOrderStatus (status) {
        let statuses = {
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeValue (statuses, status, status);
    }

    parseOrderSide (side) {
        if (side === 1)
            return 'buy'; // open long position
        if (side === 2)
            return 'sell'; // open short position
        if (side === 3)
            return 'sell'; // liquidate long position
        if (side === 4)
            return 'buy'; // liquidate short position
        return side;
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        let type = undefined;
        if ('type' in order) {
            if ((order['type'] === 'buy') || (order['type'] === 'sell')) {
                side = order['type'];
                type = 'limit';
            } else if (order['type'] === 'buy_market') {
                side = 'buy';
                type = 'market';
            } else if (order['type'] === 'sell_market') {
                side = 'sell';
                type = 'market';
            } else {
                side = this.parseOrderSide (order['type']);
                if (('contract_name' in order) || ('lever_rate' in order))
                    type = 'margin';
            }
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = undefined;
        let createDateField = this.getCreateDateField ();
        if (createDateField in order)
            timestamp = order[createDateField];
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'deal_amount');
        amount = Math.max (amount, filled);
        let remaining = Math.max (0, amount - filled);
        if (type === 'market') {
            remaining = 0;
        }
        let average = this.safeFloat (order, 'avg_price');
        // https://github.com/ccxt/ccxt/issues/2452
        average = this.safeFloat (order, 'price_avg', average);
        let cost = average * filled;
        let result = {
            'info': order,
            'id': order['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': order['price'],
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    getCreateDateField () {
        // needed for derived exchanges
        // allcoin typo create_data instead of create_date
        return 'create_date';
    }

    getOrdersField () {
        // needed for derived exchanges
        // allcoin typo order instead of orders (expected based on their API docs)
        return 'orders';
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let request = {
            'order_id': id,
            'symbol': market['id'],
            // 'status': 0, // 0 for unfilled orders, 1 for filled orders
            // 'current_page': 1, // current page number
            // 'page_length': 200, // number of orders returned per page, maximum 200
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
        }
        method += 'OrderInfo';
        let response = await this[method] (this.extend (request, params));
        let ordersField = this.getOrdersField ();
        let numOrders = response[ordersField].length;
        if (numOrders > 0)
            return this.parseOrder (response[ordersField][0]);
        throw new OrderNotFound (this.id + ' order ' + id + ' not found');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let request = {
            'symbol': market['id'],
        };
        let order_id_in_params = ('order_id' in params);
        if (market['future']) {
            method += 'FutureOrdersInfo';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
            if (!order_id_in_params)
                throw new ExchangeError (this.id + ' fetchOrders() requires order_id param for futures market ' + symbol + ' (a string of one or more order ids, comma-separated)');
        } else {
            let status = undefined;
            if ('type' in params) {
                status = params['type'];
            } else if ('status' in params) {
                status = params['status'];
            } else {
                let name = order_id_in_params ? 'type' : 'status';
                throw new ExchangeError (this.id + ' fetchOrders() requires ' + name + ' param for spot market ' + symbol + ' (0 - for unfilled orders, 1 - for filled/canceled orders)');
            }
            if (order_id_in_params) {
                method += 'OrdersInfo';
                request = this.extend (request, {
                    'type': status,
                    'order_id': params['order_id'],
                });
            } else {
                method += 'OrderHistory';
                request = this.extend (request, {
                    'status': status,
                    'current_page': 1, // current page number
                    'page_length': 200, // number of orders returned per page, maximum 200
                });
            }
            params = this.omit (params, [ 'type', 'status' ]);
        }
        let response = await this[method] (this.extend (request, params));
        let ordersField = this.getOrdersField ();
        return this.parseOrders (response[ordersField], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let open = 0; // 0 for unfilled orders, 1 for filled orders
        return await this.fetchOrders (symbol, since, limit, this.extend ({
            'status': open,
        }, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let closed = 1; // 0 for unfilled orders, 1 for filled orders
        let orders = await this.fetchOrders (symbol, since, limit, this.extend ({
            'status': closed,
        }, params));
        return orders;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        // if (amount < 0.01)
        //     throw new ExchangeError (this.id + ' withdraw() requires amount > 0.01');
        // for some reason they require to supply a pair of currencies for withdrawing one currency
        let currencyId = currency['id'] + '_usd';
        if (tag) {
            address = address + ':' + tag;
        }
        let request = {
            'symbol': currencyId,
            'withdraw_address': address,
            'withdraw_amount': amount,
            'target': 'address', // or 'okcn', 'okcom', 'okex'
        };
        let query = params;
        if ('chargefee' in query) {
            request['chargefee'] = query['chargefee'];
            query = this.omit (query, 'chargefee');
        } else {
            throw new ExchangeError (this.id + ' withdraw() requires a `chargefee` parameter');
        }
        if (this.password) {
            request['trade_pwd'] = this.password;
        } else if ('password' in query) {
            request['trade_pwd'] = query['password'];
            query = this.omit (query, 'password');
        } else if ('trade_pwd' in query) {
            request['trade_pwd'] = query['trade_pwd'];
            query = this.omit (query, 'trade_pwd');
        }
        let passwordInRequest = ('trade_pwd' in request);
        if (!passwordInRequest)
            throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a password / trade_pwd parameter');
        let response = await this.privatePostWithdraw (this.extend (request, query));
        return {
            'info': response,
            'id': this.safeString (response, 'withdraw_id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/api' + '/' + api + '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + request;
        let query = this.omit (params, this.extractParams (path));
        const type = this.getPathAuthenticationType (path);
        if (type === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (type === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.iso8601 (this.milliseconds ());
            headers = {
                'OK-ACCESS-KEY': this.apiKey,
                'OK-ACCESS-PASSPHRASE': this.password,
                'OK-ACCESS-TIMESTAMP': timestamp,
                // 'OK-FROM': '',
                // 'OK-TO': '',
                // 'OK-LIMIT': '',
            };
            let auth = timestamp + method + request;
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                }
                headers['Content-Type'] = 'application/json';
            }
            headers['OK-ACCESS-SIGN'] = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    getPathAuthenticationType (path) {
        const paths = {
            'instruments': 'public',
            'rate': 'public',
            'constituents/{ett}': 'public',
            'define-price/{ett}': 'public',
        };
        const key = this.findBroadlyMatchedKey (paths, path);
        return this.safeString (paths, key, 'private');
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (!this.isJsonEncodedObject (body)) {
            return;
        }
        const feedback = this.id + ' ' + body;
        if (code === 503) {
            throw new ExchangeError (feedback);
        }
        response = JSON.parse (body);
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            if (message in this.exceptions) {
                let ExceptionClass = this.exceptions[message];
                throw new ExceptionClass (feedback);
            } else {
                throw new ExchangeError (feedback);
            }
        }
    }
};
