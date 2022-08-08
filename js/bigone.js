'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, InsufficientFunds, PermissionDenied, BadRequest, BadSymbol, RateLimitExceeded, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bigone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bigone',
            'name': 'BigONE',
            'countries': [ 'CN' ],
            'version': 'v3',
            'rateLimit': 1200, // 500 request per 10 minutes
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': true,
                'future': undefined, // has but unimplemented
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined, // TODO for swap
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'min1',
                '5m': 'min5',
                '15m': 'min15',
                '30m': 'min30',
                '1h': 'hour1',
                '3h': 'hour3',
                '4h': 'hour4',
                '6h': 'hour6',
                '12h': 'hour12',
                '1d': 'day1',
                '1w': 'week1',
                '1M': 'month1',
            },
            'hostname': 'big.one', // or 'bigone.com'
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/69354403-1d532180-0c91-11ea-88ed-44c06cefdf87.jpg',
                'api': {
                    'spot': 'https://{hostname}/api/v3',
                    'contract': 'https://{hostname}/api/contract/v2',
                },
                'www': 'https://big.one',
                'doc': 'https://open.big.one/docs/api.html',
                'fees': 'https://bigone.zendesk.com/hc/en-us/articles/115001933374-BigONE-Fee-Policy',
                'referral': 'https://b1.run/users/new?code=D3LLBVFT',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': [
                            'ping',
                            'asset_pairs',
                            'asset_pairs/{asset_pair_name}/depth',
                            'asset_pairs/{asset_pair_name}/trades',
                            'asset_pairs/{asset_pair_name}/ticker',
                            'asset_pairs/{asset_pair_name}/candles',
                            'asset_pairs/tickers',
                        ],
                    },
                    'private': {
                        'get': [
                            'viewer/accounts',
                            'viewer/fund/accounts',
                            'viewer/assets/{asset_symbol}/address',
                            'viewer/orders',
                            'viewer/orders/{id}',
                            'viewer/orders/multi',
                            'viewer/trades',
                            'viewer/withdrawals',
                            'viewer/deposits',
                        ],
                        'post': [
                            'viewer/orders',
                            'viewer/orders/{id}/cancel',
                            'viewer/orders/cancel',
                            'viewer/withdrawals',
                            'viewer/transfer',
                        ],
                    },
                },
                'contract': {
                    'public': {
                        'get': [
                            'instruments',
                            'instruments/prices',
                            'instruments/difference',
                            'depth@{symbol}/snapshot',
                        ],
                    },
                    'private': {
                        'get': [
                            'accounts',
                            'orders',
                            'orders/{id}',
                            'orders/count',
                            'orders/opening',
                            'orders/opening/count',
                            'trades',
                            'trades/count',
                            'candlesticks/{type}@{symbol}',
                        ],
                        'post': [
                            'orders',
                            'orders/batch',
                        ],
                        'delete': [
                            'orders/{id}',
                            'orders/batch',
                        ],
                        'put': [
                            'positions/{symbol}/margin',
                            'positions/{symbol}/risk-limit',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'options': {
                'accountsByType': {
                    'spot': 'SPOT',
                    'funding': 'FUND',
                    'future': 'CONTRACT',
                    'swap': 'CONTRACT',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'contractSizes': {
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '10001': BadRequest, // syntax error
                    '10005': ExchangeError, // internal error
                    "Amount's scale must greater than AssetPair's base scale": InvalidOrder,
                    "Price mulit with amount should larger than AssetPair's min_quote_value": InvalidOrder,
                    '10007': BadRequest, // parameter error, {"code":10007,"message":"Amount's scale must greater than AssetPair's base scale"}
                    '10011': ExchangeError, // system error
                    '10013': BadSymbol, // {"code":10013,"message":"Resource not found"}
                    '10014': InsufficientFunds, // {"code":10014,"message":"Insufficient funds"}
                    '10403': PermissionDenied, // permission denied
                    '10429': RateLimitExceeded, // too many requests
                    '40004': AuthenticationError, // {"code":40004,"message":"invalid jwt"}
                    '40103': AuthenticationError, // invalid otp code
                    '40104': AuthenticationError, // invalid asset pin code
                    '40301': PermissionDenied, // {"code":40301,"message":"Permission denied withdrawal create"}
                    '40302': ExchangeError, // already requested
                    '40601': ExchangeError, // resource is locked
                    '40602': ExchangeError, // resource is depleted
                    '40603': InsufficientFunds, // insufficient resource
                    '40604': InvalidOrder, // {"code":40604,"message":"Price exceed the maximum order price"}
                    '40605': InvalidOrder, // {"code":40605,"message":"Price less than the minimum order price"}
                    '40120': InvalidOrder, // Order is in trading
                    '40121': InvalidOrder, // Order is already cancelled or filled
                    '60100': BadSymbol, // {"code":60100,"message":"Asset pair is suspended"}
                },
                'broad': {
                },
            },
            'commonCurrencies': {
                'CRE': 'Cybereits',
                'FXT': 'FXTTOKEN',
                'FREE': 'FreeRossDAO',
                'MBN': 'Mobilian Coin',
                'ONE': 'BigONE Token',
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bigone#fetchMarkets
         * @description retrieves data on all markets for bigone
         * @see https://open.big.one/docs/spot_asset_pair.html
         * @see https://open.big.one/docs/contract_misc.html
         * @param {dict} params extra parameters specific to the exchange api endpoint
         * @returns {[dict]} an array of objects representing market data
         */
        let promises = [ this.spotPublicGetAssetPairs (params), this.contractPublicGetInstruments (params) ];
        promises = await Promise.all (promises);
        const spotResponse = promises[0];
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "id":"01e48809-b42f-4a38-96b1-c4c547365db1",
        //                 "name":"PCX-BTC",
        //                 "quote_scale":7,
        //                 "quote_asset":{
        //                     "id":"0df9c3c3-255a-46d7-ab82-dedae169fba9",
        //                     "symbol":"BTC",
        //                     "name":"Bitcoin",
        //                 },
        //                 "base_asset":{
        //                     "id":"405484f7-4b03-4378-a9c1-2bd718ecab51",
        //                     "symbol":"PCX",
        //                     "name":"ChainX",
        //                 },
        //                 "base_scale":3,
        //                 "min_quote_value":"0.0001",
        //                 "max_quote_value":"35"
        //             },
        //         ]
        //     }
        //
        const markets = this.safeValue (spotResponse, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseAsset = this.safeValue (market, 'base_asset', {});
            const quoteAsset = this.safeValue (market, 'quote_asset', {});
            const baseId = this.safeString (baseAsset, 'symbol');
            const quoteId = this.safeString (quoteAsset, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const entry = {
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'base_scale'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'quote_scale'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_quote_value'),
                        'max': this.safeNumber (market, 'max_quote_value'),
                    },
                },
                'info': market,
            };
            result.push (entry);
        }
        const contracts = promises[1];
        //
        //     [
        //        {
        //             "nextFundingRate": 0.00043725,
        //             "usdtPrice": 0.999742233120400266,
        //             "turnover24h": 1965.314165971383,
        //             "openInterest": 1186214.0,
        //             "nextFundingTime": 1658023200000,
        //             "volume24hInUsd": 41618417,
        //             "fundingRate": 0.00047145,
        //             "volume24h": 41212785,
        //             "ethPrice": 1345.31,
        //             "last24hMaxPrice": 21578,
        //             "btcPrice": 21176.47,
        //             "latestPrice": 21208.0,
        //             "symbol": "BTCUSD",
        //             "last24hPriceChange": 0.0146154766176294701,
        //             "openValue": 36.0977933512444842,
        //             "last24hMinPrice": 20510.5,
        //             "markPrice": 21180.90710576,
        //             "indexPrice": 21176.47
        //         },
        //         ...
        //     ]
        //
        for (let i = 0; i < contracts.length; i++) {
            // Assumes contract is settled to USDT it it's present in symbol
            // Else it assumes USD as the base and settle in base currency
            const market = contracts[i];
            const id = this.safeString (market, 'symbol');
            const lastChar = id[id.length - 1];
            const difference = (lastChar === 'T') ? 4 : 3;
            const index = id.length - difference;
            const quoteId = id.slice (index);
            const settleId = quoteId;
            const baseId = id.slice (0, index);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const entry = {
                'id': id,
                'symbol': base + '/' + quote + ':' + settle,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': true,
                'contract': true,
                'linear': true,
                'inverse': false,
                'contractSize': undefined, // todo hardcode contract size
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': undefined,
                    'price': undefined,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
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
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "asset_pair_name":"ETH-BTC",
        //         "bid":{"price":"0.021593","order_count":1,"quantity":"0.20936"},
        //         "ask":{"price":"0.021613","order_count":1,"quantity":"2.87064"},
        //         "open":"0.021795",
        //         "high":"0.021795",
        //         "low":"0.021471",
        //         "close":"0.021613",
        //         "volume":"117078.90431",
        //         "daily_change":"-0.000182"
        //     }
        //
        const marketId = this.safeString (ticker, 'asset_pair_name');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = undefined;
        const close = this.safeString (ticker, 'close');
        const bid = this.safeValue (ticker, 'bid', {});
        const ask = this.safeValue (ticker, 'ask', {});
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (bid, 'price'),
            'bidVolume': this.safeString (bid, 'quantity'),
            'ask': this.safeString (ask, 'price'),
            'askVolume': this.safeString (ask, 'quantity'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'daily_change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bigone#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'asset_pair_name': market['id'],
        };
        const response = await this.spotPublicGetAssetPairsAssetPairNameTicker (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "asset_pair_name":"ETH-BTC",
        //             "bid":{"price":"0.021593","order_count":1,"quantity":"0.20936"},
        //             "ask":{"price":"0.021613","order_count":1,"quantity":"2.87064"},
        //             "open":"0.021795",
        //             "high":"0.021795",
        //             "low":"0.021471",
        //             "close":"0.021613",
        //             "volume":"117078.90431",
        //             "daily_change":"-0.000182"
        //         }
        //     }
        //
        const ticker = this.safeValue (response, 'data', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[str]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const ids = this.marketIds (symbols);
            request['pair_names'] = ids.join (',');
        }
        const response = await this.spotPublicGetAssetPairsTickers (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "asset_pair_name":"PCX-BTC",
        //                 "bid":{"price":"0.000234","order_count":1,"quantity":"0.518"},
        //                 "ask":{"price":"0.0002348","order_count":1,"quantity":"2.348"},
        //                 "open":"0.0002343",
        //                 "high":"0.0002348",
        //                 "low":"0.0002162",
        //                 "close":"0.0002348",
        //                 "volume":"12887.016",
        //                 "daily_change":"0.0000005"
        //             },
        //             {
        //                 "asset_pair_name":"GXC-USDT",
        //                 "bid":{"price":"0.5054","order_count":1,"quantity":"40.53"},
        //                 "ask":{"price":"0.5055","order_count":1,"quantity":"38.53"},
        //                 "open":"0.5262",
        //                 "high":"0.5323",
        //                 "low":"0.5055",
        //                 "close":"0.5055",
        //                 "volume":"603963.05",
        //                 "daily_change":"-0.0207"
        //             }
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bigone#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.spotPublicGetPing (params);
        //
        //     {
        //         "data": {
        //             "timestamp": 1527665262168391000
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return parseInt (timestamp / 1000000);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'asset_pair_name': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 200
        }
        const response = await this.spotPublicGetAssetPairsAssetPairNameDepth (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data": {
        //             "asset_pair_name": "EOS-BTC",
        //             "bids": [
        //                 { "price": "42", "order_count": 4, "quantity": "23.33363711" }
        //             ],
        //             "asks": [
        //                 { "price": "45", "order_count": 2, "quantity": "4193.3283464" }
        //             ]
        //         }
        //     }
        //
        const orderbook = this.safeValue (response, 'data', {});
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'bids', 'asks', 'price', 'quantity');
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id": 38199941,
        //         "price": "3378.67",
        //         "amount": "0.019812",
        //         "taker_side": "ASK",
        //         "created_at": "2019-01-29T06:05:56Z"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id": 10854280,
        //         "asset_pair_name": "XIN-USDT",
        //         "price": "70",
        //         "amount": "1",
        //         "taker_side": "ASK",
        //         "maker_order_id": 58284908,
        //         "taker_order_id": 58284909,
        //         "maker_fee": "0.0008",
        //         "taker_fee": "0.07",
        //         "side": "SELF_TRADING",
        //         "inserted_at": "2019-04-16T12:00:01Z"
        //     },
        //
        //     {
        //         "id": 10854263,
        //         "asset_pair_name": "XIN-USDT",
        //         "price": "75.7",
        //         "amount": "12.743149",
        //         "taker_side": "BID",
        //         "maker_order_id": null,
        //         "taker_order_id": 58284888,
        //         "maker_fee": null,
        //         "taker_fee": "0.0025486298",
        //         "side": "BID",
        //         "inserted_at": "2019-04-15T06:20:57Z"
        //     }
        //
        //  fetchMyTrades (swap)
        //     {
        //         "fee": 2.4786220000E-8,
        //         "symbol": "BTCUSD",
        //         "feeRate": 0.000600000000000000,
        //         "pnl": 7.5224760000E-8,
        //         "size": 1.000000000000000000,
        //         "ts": 1658332399273,
        //         "notional": 0.000041310364770000,
        //         "currency": "BTC",
        //         "orderId": "60871411-a710-43bb-0008-38e5d6e30549",
        //         "id": "60871411-aa40-0000-0001-0000208f76a9",
        //         "side": "SELL",
        //         "order": {
        //             "id": "60871411-a710-43bb-0008-38e5d6e30549",
        //             "type": "MARKET",
        //             "size": 1.000000000000000000,
        //             "price": 24061.758000000000000000
        //         },
        //         "price": 24207.00
        //     }
        //
        const timestamp = this.parse8601 (this.safeStringN (trade, [ 'created_at', 'inserted_at', 'ts' ]));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString2 (trade, 'amount', 'size');
        const marketId = this.safeString2 (trade, 'asset_pair_name', 'symbol');
        market = this.safeMarket (marketId, market, '-');
        let side = this.safeStringLower (trade, 'side');
        const takerSide = this.safeString (trade, 'taker_side');
        let takerOrMaker = undefined;
        if ((takerSide !== undefined) && (side !== undefined) && (side !== 'SELF_TRADING')) {
            takerOrMaker = (takerSide === side) ? 'taker' : 'maker';
        }
        if (side === undefined) {
            // taker side is not related to buy/sell side
            // the following code is probably a mistake
            side = (takerSide === 'ask') ? 'sell' : 'buy';
        } else {
            if (side === 'bid') {
                side = 'buy';
            } else if (side === 'ask') {
                side = 'sell';
            }
        }
        const makerOrderId = this.safeString (trade, 'maker_order_id');
        const takerOrderId = this.safeString (trade, 'taker_order_id');
        let orderId = this.safeString (trade, 'orderId');
        if (makerOrderId !== undefined) {
            if (takerOrderId !== undefined) {
                orderId = [ makerOrderId, takerOrderId ];
            } else {
                orderId = makerOrderId;
            }
        } else if (takerOrderId !== undefined) {
            orderId = takerOrderId;
        }
        const id = this.safeString (trade, 'id');
        const order = this.safeValue (trade, 'order');
        const result = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': this.safeStringLower (order, 'type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': this.safeNumber (trade, 'notional'),
            'info': trade,
            'fee': undefined,
        };
        let makerCurrencyCode = undefined;
        let takerCurrencyCode = undefined;
        if (takerOrMaker !== undefined) {
            if (side === 'buy') {
                if (takerOrMaker === 'maker') {
                    makerCurrencyCode = market['base'];
                    takerCurrencyCode = market['quote'];
                } else {
                    makerCurrencyCode = market['quote'];
                    takerCurrencyCode = market['base'];
                }
            } else {
                if (takerOrMaker === 'maker') {
                    makerCurrencyCode = market['quote'];
                    takerCurrencyCode = market['base'];
                } else {
                    makerCurrencyCode = market['base'];
                    takerCurrencyCode = market['quote'];
                }
            }
        } else if (side === 'SELF_TRADING') {
            if (takerSide === 'BID') {
                makerCurrencyCode = market['quote'];
                takerCurrencyCode = market['base'];
            } else if (takerSide === 'ASK') {
                makerCurrencyCode = market['base'];
                takerCurrencyCode = market['quote'];
            }
        }
        const makerFeeCost = this.safeString (trade, 'maker_fee');
        const takerFeeCost = this.safeString (trade, 'taker_fee');
        const swapFee = this.safeNumber (trade, 'fee');
        if (makerFeeCost !== undefined) {
            if (takerFeeCost !== undefined) {
                result['fees'] = [
                    { 'cost': makerFeeCost, 'currency': makerCurrencyCode },
                    { 'cost': takerFeeCost, 'currency': takerCurrencyCode },
                ];
            } else {
                result['fee'] = { 'cost': makerFeeCost, 'currency': makerCurrencyCode };
            }
        } else if (takerFeeCost !== undefined) {
            result['fee'] = { 'cost': takerFeeCost, 'currency': takerCurrencyCode };
        } else if (swapFee !== undefined) {
            const currencyId = this.safeString (trade, 'currency');
            result['fee'] = {
                'cost': swapFee,
                'rate': this.safeNumber (trade, 'feeRate'),
                'currency': this.safeCurrencyCode (currencyId),
            };
        }
        return this.safeTrade (result, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'asset_pair_name': market['id'],
        };
        const response = await this.spotPublicGetAssetPairsAssetPairNameTrades (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "id": 38199941,
        //                 "price": "3378.67",
        //                 "amount": "0.019812",
        //                 "taker_side": "ASK",
        //                 "created_at": "2019-01-29T06:05:56Z"
        //             },
        //             {
        //                 "id": 38199934,
        //                 "price": "3376.14",
        //                 "amount": "0.019384",
        //                 "taker_side": "ASK",
        //                 "created_at": "2019-01-29T06:05:40Z"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         close: '0.021562',
        //         high: '0.021563',
        //         low: '0.02156',
        //         open: '0.021563',
        //         time: '2019-11-21T07:54:00Z',
        //         volume: '59.84376'
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'time')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {str} symbol unified symbol of the market to fetch OHLCV data for
         * @param {str} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100; // default 100, max 500
        }
        const request = {
            'asset_pair_name': market['id'],
            'period': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined) {
            // const start = parseInt (since / 1000);
            const duration = this.parseTimeframe (timeframe);
            const end = this.sum (since, limit * duration * 1000);
            request['time'] = this.iso8601 (end);
        }
        const response = await this.spotPublicGetAssetPairsAssetPairNameCandles (this.extend (request, params));
        //
        //     {
        //         code: 0,
        //         data: [
        //             {
        //                 close: '0.021656',
        //                 high: '0.021658',
        //                 low: '0.021652',
        //                 open: '0.021652',
        //                 time: '2019-11-21T09:30:00Z',
        //                 volume: '53.08664'
        //             },
        //             {
        //                 close: '0.021652',
        //                 high: '0.021656',
        //                 low: '0.021652',
        //                 open: '0.021656',
        //                 time: '2019-11-21T09:29:00Z',
        //                 volume: '88.39861'
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const symbol = this.safeString (balance, 'asset_symbol');
            const code = this.safeCurrencyCode (symbol);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked_balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseSwapBalance (response) {
        //
        //     [
        //         {
        //             "cash": {
        //                 "readableId": 1000000,
        //                 "positionValue": 0.004628,
        //                 "unrealizedPnl": 0.000013864628645684,
        //                 "positionMargin": 0.000939921597676495,
        //                 "balances": 1002.2989371904613,
        //                 "userId": "5c219261-1d2f-484c-0004-bc929117ec73",
        //                 "margin": 0.000926056969030811,
        //                 "available": 1002.2980111334923,
        //                 "orderMargin": 0,
        //                 "marginRate": 9.37765720185e-7,
        //                 "marginBalances": 1002.2989510550899,
        //                 "leverage": 0.000005,
        //                 "id": "5c26b683-7182-46cb-0004-0dfb00c0cac3",
        //                 "currency": "BTC"
        //             },
        //             "positions": [
        //                ...
        //             ]
        //         },
        //         ...
        //             ]
        //         }
        //     ]
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const swapAccount = response[i];
            const cash = this.safeValue (swapAccount, 'cash', {});
            const currencyId = this.safeString (cash, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (cash, 'available');
            account['total'] = this.safeNumber (cash, 'balances');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bigone#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const [ type ] = this.handleMarketTypeAndParams ('fetchClosedOrders', undefined, params);
        let method = 'spotPrivateGetViewerAccounts';
        if (type === 'fund' || type === 'funding') {
            method = 'spotPrivateGetViewerFundAccounts';
        }
        if (type === 'swap') {
            method = 'contractPrivateGetAccounts';
        }
        const response = await this[method] (params);
        //
        //  spot, fund
        //     {
        //         "code":0,
        //         "data":[
        //             {"asset_symbol":"NKC","balance":"0","locked_balance":"0"},
        //             {"asset_symbol":"UBTC","balance":"0","locked_balance":"0"},
        //             {"asset_symbol":"READ","balance":"0","locked_balance":"0"},
        //         ],
        //     }
        //
        //  swap
        //     [
        //         {
        //             "cash": {
        //                 "readableId": 1000000,
        //                 "positionValue": 0.004628,
        //                 "unrealizedPnl": 0.000013864628645684,
        //                 "positionMargin": 0.000939921597676495,
        //                 "balances": 1002.2989371904613,
        //                 "userId": "5c219261-1d2f-484c-0004-bc929117ec73",
        //                 "margin": 0.000926056969030811,
        //                 "available": 1002.2980111334923,
        //                 "orderMargin": 0,
        //                 "marginRate": 9.37765720185e-7,
        //                 "marginBalances": 1002.2989510550899,
        //                 "leverage": 0.000005,
        //                 "id": "5c26b683-7182-46cb-0004-0dfb00c0cac3",
        //                 "currency": "BTC"
        //             },
        //             "positions": [
        //                ...
        //             ]
        //         },
        //         ...
        //             ]
        //         }
        //     ]
        //
        if (type === 'swap') {
            return this.parseSwapBalance (response);
        }
        return this.parseBalance (response);
    }

    parseOrder (order, market = undefined) {
        //
        //  spot
        //    {
        //        "id": 10,
        //        "asset_pair_name": "EOS-BTC",
        //        "price": "10.00",
        //        "amount": "10.00",
        //        "filled_amount": "9.0",
        //        "avg_deal_price": "12.0",
        //        "side": "ASK",
        //        "state": "FILLED",
        //        "created_at":"2019-01-29T06:05:56Z",
        //        "updated_at":"2019-01-29T06:05:56Z",
        //    }
        //  swap
        //     {
        //         "liquidateUserId": null,
        //         "notional": 0.000043000000000000,
        //         "size": 1.000000000000000000,
        //         "profit": null,
        //         "id": "6086cc5e-2104-4370-0008-c1a1f032dd20",
        //         "userId": "6082322a-0352-4cc4-0008-7fccc879cc9b",
        //         "side": "BUY",
        //         "ts": 1658313603204,
        //         "filledNotional": 0.000042104376740000,
        //         "price": 23893.003000000000000000,
        //         "isLiquidate": false,
        //         "filled": 1.000000000000000000,
        //         "reduceOnly": false,
        //         "avgPrice": 23750.50,
        //         "symbol": "BTCUSD",
        //         "seqNo": null,
        //         "meta": {
        //             "bestPrice": 23750.5,
        //             "markPrice": 23734.76328308,
        //             "bestPrices": {
        //                 "ask": 23750.5,
        //                 "bid": 23747
        //             }
        //         },
        //         "conditional": null,
        //         "status": "FILLED",
        //         "type": "MARKET",
        //         "currency": "BTC"
        //     }
        //
        const id = this.safeString (order, 'id');
        const marketId = this.safeString2 (order, 'asset_pair_name', 'symbol');
        const symbol = this.safeSymbol (marketId, market, '-');
        let timestamp = this.safeNumber (order, 'ts');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        }
        const price = this.safeString (order, 'price');
        const amount = this.safeString2 (order, 'amount', 'size');
        const average = this.safeString2 (order, 'avg_deal_price', 'avgPrice');
        const filled = this.safeString2 (order, 'filled_amount', 'filled');
        const status = this.parseOrderStatus (this.safeString2 (order, 'state', 'status'));
        let side = this.safeStringLower (order, 'side');
        if (side === 'bid') {
            side = 'buy';
        } else if (side === 'ask') {
            side = 'sell';
        }
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'updated_at'));
        const conditional = this.safeValue (order, 'conditional');
        const stopPrice = this.safeNumber (conditional, 'price');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': this.safeStringLower (order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': this.safeNumber (order, 'filledNotional'),
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bigone#createOrder
         * @description create a trade order
         * @param {str} symbol unified symbol of the market to create an order in
         * @param {str} type 'market' or 'limit'. If swap 'limit', 'market', 'ioc', 'fok', 'post_only'
         * @param {str} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        let method = 'spotPrivatePostViewerOrders';
        let request = {};
        const uppercaseType = type.toUpperCase ();
        if (marketType === 'swap') {
            method = 'contractPrivatePostOrders';
            request = {
                'size': amount,
                'symbol': market['id'],
                'type': uppercaseType,
                'side': side.toUpperCase (),
                // reduceOnly
                // conditional
            };
            if (price !== undefined) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
        } else {
            side = (side === 'buy') ? 'BID' : 'ASK';
            request = {
                'asset_pair_name': market['id'], // asset pair name BTC-USDT, required
                'side': side, // order side one of "ASK"/"BID", required
                'amount': this.amountToPrecision (symbol, amount), // order amount, string, required
                // 'price': this.priceToPrecision (symbol, price), // order price, string, required
                'type': uppercaseType,
            // 'operator': 'GTE', // stop orders only, GTE greater than and equal, LTE less than and equal
            // 'immediate_or_cancel': false, // limit orders only, must be false when post_only is true
            // 'post_only': false, // limit orders only, must be false when immediate_or_cancel is true
            };
            if (uppercaseType === 'LIMIT') {
                request['price'] = this.priceToPrecision (symbol, price);
            } else {
                const isStopLimit = (uppercaseType === 'STOP_LIMIT');
                const isStopMarket = (uppercaseType === 'STOP_MARKET');
                if (isStopLimit || isStopMarket) {
                    const stopPrice = this.safeNumber2 (params, 'stop_price', 'stopPrice');
                    if (stopPrice === undefined) {
                        throw new ArgumentsRequired (this.id + ' createOrder() requires a stop_price parameter');
                    }
                    request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
                    params = this.omit (params, [ 'stop_price', 'stopPrice' ]);
                }
                if (isStopLimit) {
                    request['price'] = this.priceToPrecision (symbol, price);
                }
            }
        }
        const response = await this[method] (this.extend (request, query));
        //
        //  spot
        //    {
        //        "id": 10,
        //        "asset_pair_name": "EOS-BTC",
        //        "price": "10.00",
        //        "amount": "10.00",
        //        "filled_amount": "9.0",
        //        "avg_deal_price": "12.0",
        //        "side": "ASK",
        //        "state": "FILLED",
        //        "created_at":"2019-01-29T06:05:56Z",
        //        "updated_at":"2019-01-29T06:05:56Z"
        //    }
        //  swap
        //    {
        //        "liquidateUserId": null,
        //        "size": 1,
        //        "profit": null,
        //        "ts": 1658401409021,
        //        "userId": "6082322a-0352-4cc4-0008-7fccc879cc9b",
        //        "side": "BUY",
        //        "filledNotional": 0,
        //        "status": "NEW",
        //        "id": "60881b51-ff40-41b2-0008-b827053fef8e",
        //        "isLiquidate": false,
        //        "reduceOnly": false,
        //        "notional": 0.000044,
        //        "meta": {
        //            "markPrice": 22844.95476337,
        //            "bestPrices": {
        //                "ask": 22861,
        //                "bid": 22857
        //            },
        //            "bestPrice": 22861
        //        },
        //        "symbol": "BTCUSD",
        //        "seqNo": null,
        //        "filled": 0,
        //        "conditional": null,
        //        "type": "MARKET",
        //        "avgPrice": 0,
        //        "price": 22998.166,
        //        "currency": "BTC"
        //    }
        //
        const order = this.safeValue (response, 'data', response);
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bigone#cancelOrder
         * @description cancels an open order
         * @param {str} id order id
         * @param {str|undefined} symbol Not used by bigone cancelOrder ()
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = { 'id': id };
        const response = await this.spotPrivatePostViewerOrdersIdCancel (this.extend (request, params));
        //    {
        //        "id": 10,
        //        "asset_pair_name": "EOS-BTC",
        //        "price": "10.00",
        //        "amount": "10.00",
        //        "filled_amount": "9.0",
        //        "avg_deal_price": "12.0",
        //        "side": "ASK",
        //        "state": "CANCELLED",
        //        "created_at":"2019-01-29T06:05:56Z",
        //        "updated_at":"2019-01-29T06:05:56Z"
        //    }
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bigone#cancelAllOrders
         * @description cancel all open orders
         * @param {str|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'asset_pair_name': market['id'],
        };
        const response = await this.spotPrivatePostViewerOrdersCancel (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data": {
        //             "cancelled":[
        //                 58272370,
        //                 58272377
        //             ],
        //             "failed": []
        //         }
        //     }
        //
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchOrder
         * @description fetches information on an order made by the user
         * @param {str|undefined} symbol not used by bigone fetchOrder
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrder', undefined, params);
        let method = 'spotPrivateGetViewerOrdersId';
        if (type === 'swap') {
            method = 'contractPrivateGetOrdersId';
        }
        const request = { 'id': id };
        const response = await this[method] (this.extend (request, query));
        //
        // swap
        //     {
        //         "liquidateUserId": null,
        //         "notional": 0.000043000000000000,
        //         "size": 1.000000000000000000,
        //         "profit": null,
        //         "id": "6086cc5e-2104-4370-0008-c1a1f032dd20",
        //         "userId": "6082322a-0352-4cc4-0008-7fccc879cc9b",
        //         "side": "BUY",
        //         "ts": 1658313603204,
        //         "filledNotional": 0.000042104376740000,
        //         "price": 23893.003000000000000000,
        //         "isLiquidate": false,
        //         "filled": 1.000000000000000000,
        //         "reduceOnly": false,
        //         "avgPrice": 23750.50,
        //         "symbol": "BTCUSD",
        //         "seqNo": null,
        //         "meta": {
        //             "bestPrice": 23750.5,
        //             "markPrice": 23734.76328308,
        //             "bestPrices": {
        //                 "ask": 23750.5,
        //                 "bid": 23747
        //             }
        //         },
        //         "conditional": null,
        //         "status": "FILLED",
        //         "type": "MARKET",
        //         "currency": "BTC"
        //     }
        //
        const order = this.safeValue (response, 'data', response);
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {str} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        let method = 'spotPrivateGetViewerOrders';
        let request = {
            'asset_pair_name': market['id'],
            // 'page_token': 'dxzef', // request page after this page token
            // 'side': 'ASK', // 'ASK' or 'BID', optional
            // 'state': 'FILLED', // 'CANCELLED', 'FILLED', 'PENDING'
            // 'limit' 20, // default 20, max 200
        };
        if (type === 'swap') {
            method = 'contractPrivateGetOrders';
            request = {
                'symbol': market['id'],
            };
            if (since !== undefined) {
                request['start-time'] = since;
            }
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 200
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //    {
        //        "code":0,
        //        "data": [
        //             {
        //                 "id": 10,
        //                 "asset_pair_name": "ETH-BTC",
        //                 "price": "10.00",
        //                 "amount": "10.00",
        //                 "filled_amount": "9.0",
        //                 "avg_deal_price": "12.0",
        //                 "side": "ASK",
        //                 "state": "FILLED",
        //                 "created_at":"2019-01-29T06:05:56Z",
        //                 "updated_at":"2019-01-29T06:05:56Z",
        //             },
        //         ],
        //        "page_token":"dxzef",
        //    }
        //  swap
        //    [
        //        {
        //            "liquidateUserId": null,
        //            "size": 1.000000000000000000,
        //            "profit": null,
        //            "userId": "6082322a-0352-4cc4-0008-7fccc879cc9b",
        //            "side": "BUY",
        //            "price": 23000.178000000000000000,
        //            "isLiquidate": false,
        //            "filled": 1.000000000000000000,
        //            "reduceOnly": false,
        //            "id": "60881bc6-dd21-4555-0008-3538eb72fb2c",
        //            "notional": 0.000044000000000000,
        //            "symbol": "BTCUSD",
        //            "seqNo": null,
        //            "conditional": null,
        //            "status": "FILLED",
        //            "type": "MARKET",
        //            "ts": 1658401528692,
        //            "filledNotional": 0.000043738791930000,
        //            "meta": {
        //                "bestPrice": 22863,
        //                "markPrice": 22860.76212989,
        //                "bestPrices": {
        //                    "ask": 22863,
        //                    "bid": 22859
        //                }
        //            },
        //            "avgPrice": 22863.00,
        //            "currency": "BTC"
        //        }
        //        ...
        //    ]
        //
        let orders = this.safeValue (response, 'data', []);
        if (type === 'swap') {
            orders = response;
        }
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchPositions
         * @description fetch all open positions
         * @see https://open.big.one/docs/contract_accounts.html
         * @param {[str]|undefined} symbols list of unified market symbols
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                symbols[i] = market['symbol'];
            }
        }
        const accounts = await this.contractPrivateGetAccounts (params);
        //
        //     [
        //         {
        //             "cash": {
        //                 "userId": "6082322a-0352-4cc4-0008-7fccc879cc9b",
        //                 "id": "6083400a-640f-4840-0008-73173477f865",
        //                 "marginBalances": 0,
        //                 "marginRate": 0,
        //                 "positionValue": 0,
        //                 "leverage": 0,
        //                 "balances": 0,
        //                 "positionMargin": 0,
        //                 "available": 0,
        //                 "unrealizedPnl": 0,
        //                 "orderMargin": 0,
        //                 "readableId": null,
        //                 "currency": "BTC",
        //                 "margin": 0
        //             },
        //             "positions": [{
        //                 "feeRateMaker": 0.000200000000000000,
        //                 "value": 0,
        //                 "size": 0,
        //                 "liquidatePrice": 0,
        //                 "userId": "6082322a-0352-4cc4-0008-7fccc879cc9b",
        //                 "risk": 0,
        //                 "notional": 0,
        //                 "id": "6083400a-6167-4ae5-0008-23082e7c330c",
        //                 "buyingNotional": 0,
        //                 "isCross": true,
        //                 "entryPrice": 0,
        //                 "sellingNotional": 0,
        //                 "symbol": "BTCUSD",
        //                 "seqNo": null,
        //                 "initMargin": 0,
        //                 "totalPnl": 0,
        //                 "markPrice": 0,
        //                 "riskLimit": 1000,
        //                 "unrealizedPnl": 0,
        //                 "orderMargin": 0,
        //                 "feeRateTaker": 0.000600000000000000,
        //                 "sellingSize": 0,
        //                 "realisedPnl": 0,
        //                 "equity": 0,
        //                 "leverage": 10,
        //                 "marginRate": 0.1,
        //                 "buyingSize": 0,
        //                 "currency": "BTC",
        //                 "margin": 0,
        //                 "rom": 0
        //             }],
        //             "profits": []
        //         },
        //         ...
        //     ]
        //
        const result = [];
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const positions = this.safeValue (account, 'positions', []);
            for (let ii = 0; ii < positions.length; ii++) {
                const position = positions[ii];
                result.push (this.parsePosition (position));
            }
        }
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "feeRateMaker": 0.000200000000000000,
        //         "value": 0,
        //         "size": 0,
        //         "liquidatePrice": 0,
        //         "userId": "6082322a-0352-4cc4-0008-7fccc879cc9b",
        //         "risk": 0,
        //         "notional": 0,
        //         "id": "6083400a-6167-4ae5-0008-23082e7c330c",
        //         "buyingNotional": 0,
        //         "isCross": true,
        //         "entryPrice": 0,
        //         "sellingNotional": 0,
        //         "symbol": "BTCUSD",
        //         "seqNo": null,
        //         "initMargin": 0,
        //         "totalPnl": 0,
        //         "markPrice": 0,
        //         "riskLimit": 1000,
        //         "unrealizedPnl": 0,
        //         "orderMargin": 0,
        //         "feeRateTaker": 0.000600000000000000,
        //         "sellingSize": 0,
        //         "realisedPnl": 0,
        //         "equity": 0,
        //         "leverage": 10,
        //         "marginRate": 0.1,
        //         "buyingSize": 0,
        //         "currency": "BTC",
        //         "margin": 0,
        //         "rom": 0
        //     }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const isCross = this.safeString (position, 'isCross');
        return {
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': market['symbol'],
            'notional': this.safeNumber (position, 'notional'),
            'marginMode': isCross ? 'cross' : 'isolated',
            'liquidationPrice': this.safeNumber (position, 'liquidatePrice'),
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'unrealizedPnl': this.safeNumber (position, 'unrealizedPnl'),
            'percentage': undefined,
            'contracts': undefined,
            'contractSize': this.safeNumber (position, 'size'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'side': undefined,
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': this.safeNumber (position, 'initMargin'),
            'initialMarginPercentage': undefined,
            'leverage': this.safeInteger (position, 'leverage'),
            'marginRatio': this.safeNumber (position, 'marginRate'),
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {str} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        const market = this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        let method = undefined;
        let request = {};
        if (type === 'swap' || market['swap']) {
            method = 'contractPrivateGetTrades';
            request = {
                'symbol': market['id'],
            };
        } else {
            method = 'spotPrivateGetViewerTrades';
            request = {
                'asset_pair_name': market['id'],
                // 'page_token': 'dxzef', // request page after this page token
            };
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 200
        }
        const response = await this[method] (this.extend (request, query));
        //
        //  spot
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "id": 10854280,
        //                 "asset_pair_name": "XIN-USDT",
        //                 "price": "70",
        //                 "amount": "1",
        //                 "taker_side": "ASK",
        //                 "maker_order_id": 58284908,
        //                 "taker_order_id": 58284909,
        //                 "maker_fee": "0.0008",
        //                 "taker_fee": "0.07",
        //                 "side": "SELF_TRADING",
        //                 "inserted_at": "2019-04-16T12:00:01Z"
        //             },
        //             {
        //                 "id": 10854263,
        //                 "asset_pair_name": "XIN-USDT",
        //                 "price": "75.7",
        //                 "amount": "12.743149",
        //                 "taker_side": "BID",
        //                 "maker_order_id": null,
        //                 "taker_order_id": 58284888,
        //                 "maker_fee": null,
        //                 "taker_fee": "0.0025486298",
        //                 "side": "BID",
        //                 "inserted_at": "2019-04-15T06:20:57Z"
        //             }
        //         ],
        //         "page_token":"dxfv"
        //     }
        //
        //  swap
        //     [
        //         {
        //             "fee": 2.4786220000E-8,
        //             "symbol": "BTCUSD",
        //             "feeRate": 0.000600000000000000,
        //             "pnl": 7.5224760000E-8,
        //             "size": 1.000000000000000000,
        //             "ts": 1658332399273,
        //             "notional": 0.000041310364770000,
        //             "currency": "BTC",
        //             "orderId": "60871411-a710-43bb-0008-38e5d6e30549",
        //             "id": "60871411-aa40-0000-0001-0000208f76a9",
        //             "side": "SELL",
        //             "order": {
        //                 "id": "60871411-a710-43bb-0008-38e5d6e30549",
        //                 "type": "MARKET",
        //                 "size": 1.000000000000000000,
        //                 "price": 24061.758000000000000000
        //             },
        //             "price": 24207.00
        //         }
        //         ...
        //     ]
        //
        let trades = [];
        if (method === 'contractPrivateGetTrades') {
            trades = response;
        } else {
            trades = this.safeValue (response, 'data', []);
        }
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PENDING': 'open',
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
            'CANCELED': 'canceled',
            'NEW': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {str} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ type ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        let request = {
            'state': 'PENDING',
        };
        if (type === 'swap') {
            request = {
                'status': 'NEW,PARTIALLY_FILLED,UNTRIGGERED,PENDING_CANCEL',
            };
        }
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {str} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ type ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        let request = {
            'state': 'FILLED',
        };
        if (type === 'swap') {
            request = {
                'status': 'FILLED',
            };
        }
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    nonce () {
        return this.microseconds () * 1000;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const type = this.safeString (api, 0);
        const publicOrPrivate = this.safeString (api, 1);
        const baseUrl = this.implodeHostname (this.urls['api'][type]);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        if (publicOrPrivate === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (publicOrPrivate === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const request = {
                'type': 'OpenAPIV2',
                'sub': this.apiKey,
                'nonce': nonce,
                // 'recv_window': '30', // default 30
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

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bigone#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {str} code unified currency code
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset_symbol': currency['id'],
        };
        const response = await this.spotPrivateGetViewerAssetsAssetSymbolAddress (this.extend (request, params));
        //
        // the actual response format is not the same as the documented one
        // the data key contains an array in the actual response
        //
        //     {
        //         "code":0,
        //         "message":"",
        //         "data":[
        //             {
        //                 "id":5521878,
        //                 "chain":"Bitcoin",
        //                 "value":"1GbmyKoikhpiQVZ1C9sbF17mTyvBjeobVe",
        //                 "memo":""
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const dataLength = data.length;
        if (dataLength < 1) {
            throw new ExchangeError (this.id + ' fetchDepositAddress() returned empty address response');
        }
        const firstElement = data[0];
        const address = this.safeString (firstElement, 'value');
        const tag = this.safeString (firstElement, 'memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            // what are other statuses here?
            'WITHHOLD': 'ok', // deposits
            'UNCONFIRMED': 'pending',
            'CONFIRMED': 'ok', // withdrawals
            'COMPLETED': 'ok',
            'PENDING': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "amount": "25.0",
        //         "asset_symbol": "BTS"
        //         "confirms": 100,
        //         "id": 5,
        //         "inserted_at": "2018-02-16T11:39:58.000Z",
        //         "is_internal": false,
        //         "kind": "default",
        //         "memo": "",
        //         "state": "WITHHOLD",
        //         "txid": "72e03037d144dae3d32b68b5045462b1049a0755",
        //         "updated_at": "2018-11-09T10:20:09.000Z",
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amount": "5",
        //         "asset_symbol": "ETH",
        //         "completed_at": "2018-03-15T16:13:45.610463Z",
        //         "customer_id": "10",
        //         "id": 10,
        //         "inserted_at": "2018-03-15T16:13:45.610463Z",
        //         "is_internal": true,
        //         "note": "2018-03-15T16:13:45.610463Z",
        //         "state": "CONFIRMED",
        //         "target_address": "0x4643bb6b393ac20a6175c713175734a72517c63d6f7"
        //         "txid": "0x4643bb6b393ac20a6175c713175734a72517c63d6f73a3ca90a15356f2e967da0",
        //     }
        //
        // withdraw
        //
        //     {
        //         "id":1077391,
        //         "customer_id":1082679,
        //         "amount":"21.9000000000000000",
        //         "txid":"",
        //         "is_internal":false,
        //         "kind":"on_chain",
        //         "state":"PENDING",
        //         "inserted_at":"2020-06-03T00:50:57+00:00",
        //         "updated_at":"2020-06-03T00:50:57+00:00",
        //         "memo":"",
        //         "target_address":"rDYtYT3dBeuw376rvHqoZBKW3UmvguoBAf",
        //         "fee":"0.1000000000000000",
        //         "asset_symbol":"XRP"
        //     }
        //
        const currencyId = this.safeString (transaction, 'asset_symbol');
        const code = this.safeCurrencyCode (currencyId);
        const id = this.safeInteger (transaction, 'id');
        const amount = this.safeNumber (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'inserted_at'));
        const updated = this.parse8601 (this.safeString2 (transaction, 'updated_at', 'completed_at'));
        const txid = this.safeString (transaction, 'txid');
        const address = this.safeString (transaction, 'target_address');
        const tag = this.safeString (transaction, 'memo');
        const type = ('customer_id' in transaction) ? 'deposit' : 'withdrawal';
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': undefined,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {str|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'page_token': 'dxzef', // request page after this page token
            // 'limit': 50, // optional, default 50
            // 'kind': 'string', // optional - air_drop, big_holder_dividend, default, eosc_to_eos, internal, equally_airdrop, referral_mining, one_holder_dividend, single_customer, snapshotted_airdrop, trade_mining
            // 'asset_symbol': 'BTC', // optional
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset_symbol'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50
        }
        const response = await this.spotPrivateGetViewerDeposits (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "page_token": "NQ==",
        //         "data": [
        //             {
        //                 "id": 5,
        //                 "amount": "25.0",
        //                 "confirms": 100,
        //                 "txid": "72e03037d144dae3d32b68b5045462b1049a0755",
        //                 "is_internal": false,
        //                 "inserted_at": "2018-02-16T11:39:58.000Z",
        //                 "updated_at": "2018-11-09T10:20:09.000Z",
        //                 "kind": "default",
        //                 "memo": "",
        //                 "state": "WITHHOLD",
        //                 "asset_symbol": "BTS"
        //             }
        //         ]
        //     }
        //
        const deposits = this.safeValue (response, 'data', []);
        return this.parseTransactions (deposits, code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bigone#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {str|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {[dict]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'page_token': 'dxzef', // request page after this page token
            // 'limit': 50, // optional, default 50
            // 'kind': 'string', // optional - air_drop, big_holder_dividend, default, eosc_to_eos, internal, equally_airdrop, referral_mining, one_holder_dividend, single_customer, snapshotted_airdrop, trade_mining
            // 'asset_symbol': 'BTC', // optional
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset_symbol'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50
        }
        const response = await this.spotPrivateGetViewerWithdrawals (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "id": 10,
        //                 "customer_id": "10",
        //                 "asset_symbol": "ETH",
        //                 "amount": "5",
        //                 "state": "CONFIRMED",
        //                 "note": "2018-03-15T16:13:45.610463Z",
        //                 "txid": "0x4643bb6b393ac20a6175c713175734a72517c63d6f73a3ca90a15356f2e967da0",
        //                 "completed_at": "2018-03-15T16:13:45.610463Z",
        //                 "inserted_at": "2018-03-15T16:13:45.610463Z",
        //                 "is_internal": true,
        //                 "target_address": "0x4643bb6b393ac20a6175c713175734a72517c63d6f7"
        //             }
        //         ],
        //         "page_token":"dxvf"
        //     }
        //
        const withdrawals = this.safeValue (response, 'data', []);
        return this.parseTransactions (withdrawals, code, since, limit);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name bigone#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {str} code unified currency code
         * @param {float} amount amount to transfer
         * @param {str} fromAccount account to transfer from
         * @param {str} toAccount account to transfer to
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const guid = this.safeString (params, 'guid', this.uuid ());
        const request = {
            'symbol': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'from': fromId,
            'to': toId,
            'guid': guid,
            // 'type': type, // NORMAL, MASTER_TO_SUB, SUB_TO_MASTER, SUB_INTERNAL, default is NORMAL
            // 'sub_acccunt': '', // when type is NORMAL, it should be empty, and when type is others it is required
        };
        const response = await this.spotPrivatePostViewerTransfer (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": null
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['amount'] = amount;
            transfer['id'] = guid;
        }
        return transfer;
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         "code": 0,
        //         "data": null
        //     }
        //
        const code = this.safeNumber (transfer, 'code');
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': code,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': this.parseTransferStatus (code),
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            '0': 'ok',
        };
        return this.safeString (statuses, status, 'failed');
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bigone#withdraw
         * @description make a withdrawal
         * @param {str} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {str} address the address to withdraw to
         * @param {str|undefined} tag
         * @param {dict} params extra parameters specific to the bigone api endpoint
         * @returns {dict} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'target_address': address,
            'amount': this.currencyToPrecision (code, amount),
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        // requires write permission on the wallet
        const response = await this.spotPrivatePostViewerWithdrawals (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "message":"",
        //         "data":{
        //             "id":1077391,
        //             "customer_id":1082679,
        //             "amount":"21.9000000000000000",
        //             "txid":"",
        //             "is_internal":false,
        //             "kind":"on_chain",
        //             "state":"PENDING",
        //             "inserted_at":"2020-06-03T00:50:57+00:00",
        //             "updated_at":"2020-06-03T00:50:57+00:00",
        //             "memo":"",
        //             "target_address":"rDYtYT3dBeuw376rvHqoZBKW3UmvguoBAf",
        //             "fee":"0.1000000000000000",
        //             "asset_symbol":"XRP"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data, currency);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //  spot
        //      {"code":10013,"message":"Resource not found"}
        //      {"code":40004,"message":"invalid jwt"}
        //
        //  contract
        //       {"anomaly":"anomaly.token/device-unauthorized"}
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if (code !== undefined && code !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        const anomaly = this.safeString (response, 'anomaly');
        if (anomaly !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], anomaly, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], anomaly, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
