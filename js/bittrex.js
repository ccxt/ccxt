'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, ExchangeError, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound, DDoSProtection, PermissionDenied, AddressPending, OnMaintenance, BadRequest } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bittrex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bittrex',
            'name': 'Bittrex',
            'countries': [ 'US' ],
            'version': 'v3',
            'rateLimit': 1500,
            'certified': true,
            'pro': true,
            // new metainfo interface
            'has': {
                'CORS': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDeposits': true,
                'fetchDepositAddress': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': 'emulated',
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrderTrades': true,
                'fetchOrderBook': true,
                'fetchOpenOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'MINUTE_1',
                '5m': 'MINUTE_5',
                '1h': 'HOUR_1',
                '1d': 'DAY_1',
            },
            'hostname': 'bittrex.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87153921-edf53180-c2c0-11ea-96b9-f2a9a95a455b.jpg',
                'api': {
                    'public': 'https://api.bittrex.com',
                    'private': 'https://api.bittrex.com',
                },
                'www': 'https://bittrex.com',
                'doc': [
                    'https://bittrex.github.io/api/v3',
                ],
                'fees': [
                    'https://bittrex.zendesk.com/hc/en-us/articles/115003684371-BITTREX-SERVICE-FEES-AND-WITHDRAWAL-LIMITATIONS',
                    'https://bittrex.zendesk.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
                ],
                'referral': 'https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B',
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'currencies',
                        'currencies/{symbol}',
                        'markets',
                        'markets/tickers',
                        'markets/summaries',
                        'markets/{marketSymbol}',
                        'markets/{marketSymbol}/summary',
                        'markets/{marketSymbol}/orderbook',
                        'markets/{marketSymbol}/trades',
                        'markets/{marketSymbol}/ticker',
                        'markets/{marketSymbol}/candles/{candleInterval}/recent',
                        'markets/{marketSymbol}/candles/{candleInterval}/historical/{year}/{month}/{day}',
                        'markets/{marketSymbol}/candles/{candleInterval}/historical/{year}/{month}',
                        'markets/{marketSymbol}/candles/{candleInterval}/historical/{year}',
                    ],
                },
                'private': {
                    'get': [
                        'account',
                        'account/volume',
                        'addresses',
                        'addresses/{currencySymbol}',
                        'balances',
                        'balances/{currencySymbol}',
                        'deposits/open',
                        'deposits/closed',
                        'deposits/ByTxId/{txId}',
                        'deposits/{depositId}',
                        'orders/closed',
                        'orders/open',
                        'orders/{orderId}',
                        'orders/{orderId}/executions',
                        'ping',
                        'subaccounts/{subaccountId}',
                        'subaccounts',
                        'withdrawals/open',
                        'withdrawals/closed',
                        'withdrawals/ByTxId/{txId}',
                        'withdrawals/{withdrawalId}',
                        'withdrawals/whitelistAddresses',
                        'conditional-orders/{conditionalOrderId}',
                        'conditional-orders/closed',
                        'conditional-orders/open',
                        'transfers/sent',
                        'transfers/received',
                        'transfers/{transferId}',
                    ],
                    'post': [
                        'addresses',
                        'orders',
                        'subaccounts',
                        'withdrawals',
                        'conditional-orders',
                        'transfers',
                    ],
                    'delete': [
                        'orders/open',
                        'orders/{orderId}',
                        'withdrawals/{withdrawalId}',
                        'conditional-orders/{conditionalOrderId}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.0005,
                        'LTC': 0.01,
                        'DOGE': 2,
                        'VTC': 0.02,
                        'PPC': 0.02,
                        'FTC': 0.2,
                        'RDD': 2,
                        'NXT': 2,
                        'DASH': 0.05,
                        'POT': 0.002,
                        'BLK': 0.02,
                        'EMC2': 0.2,
                        'XMY': 0.2,
                        'GLD': 0.0002,
                        'SLR': 0.2,
                        'GRS': 0.2,
                    },
                    'deposit': {
                        'BTC': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'VTC': 0,
                        'PPC': 0,
                        'FTC': 0,
                        'RDD': 0,
                        'NXT': 0,
                        'DASH': 0,
                        'POT': 0,
                        'BLK': 0,
                        'EMC2': 0,
                        'XMY': 0,
                        'GLD': 0,
                        'SLR': 0,
                        'GRS': 0,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    'BAD_REQUEST': BadRequest, // {"code":"BAD_REQUEST","detail":"Refer to the data field for specific field validation failures.","data":{"invalidRequestParameter":"day"}}
                    'STARTDATE_OUT_OF_RANGE': BadRequest, // {"code":"STARTDATE_OUT_OF_RANGE"}
                    // 'Call to Cancel was throttled. Try again in 60 seconds.': DDoSProtection,
                    // 'Call to GetBalances was throttled. Try again in 60 seconds.': DDoSProtection,
                    'APISIGN_NOT_PROVIDED': AuthenticationError,
                    'INVALID_SIGNATURE': AuthenticationError,
                    'INVALID_CURRENCY': ExchangeError,
                    'INVALID_PERMISSION': AuthenticationError,
                    'INSUFFICIENT_FUNDS': InsufficientFunds,
                    'INVALID_CEILING_MARKET_BUY': InvalidOrder,
                    'INVALID_FIAT_ACCOUNT': InvalidOrder,
                    'INVALID_ORDER_TYPE': InvalidOrder,
                    'QUANTITY_NOT_PROVIDED': InvalidOrder,
                    'MIN_TRADE_REQUIREMENT_NOT_MET': InvalidOrder,
                    'ORDER_NOT_OPEN': OrderNotFound,
                    'INVALID_ORDER': InvalidOrder,
                    'UUID_INVALID': OrderNotFound,
                    'RATE_NOT_PROVIDED': InvalidOrder, // createLimitBuyOrder ('ETH/BTC', 1, 0)
                    'INVALID_MARKET': BadSymbol, // {"success":false,"message":"INVALID_MARKET","result":null,"explanation":null}
                    'WHITELIST_VIOLATION_IP': PermissionDenied,
                    'DUST_TRADE_DISALLOWED_MIN_VALUE': InvalidOrder,
                    'RESTRICTED_MARKET': BadSymbol,
                    'We are down for scheduled maintenance, but we\u2019ll be back up shortly.': OnMaintenance, // {"success":false,"message":"We are down for scheduled maintenance, but we\u2019ll be back up shortly.","result":null,"explanation":null}
                },
                'broad': {
                    'throttled': DDoSProtection,
                    'problem': ExchangeNotAvailable,
                },
            },
            'options': {
                'fetchTicker': {
                    'method': 'publicGetMarketsMarketSymbolTicker', // publicGetMarketsMarketSymbolSummary
                },
                'fetchTickers': {
                    'method': 'publicGetMarketsTickers', // publicGetMarketsSummaries
                },
                'parseOrderStatus': false,
                'hasAlreadyAuthenticatedSuccessfully': false, // a workaround for APIKEY_INVALID
                'symbolSeparator': '-',
                // With certain currencies, like
                // AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP
                // an additional tag / memo / payment id is usually required by exchanges.
                // With Bittrex some currencies imply the "base address + tag" logic.
                // The base address for depositing is stored on this.currencies[code]
                // The base address identifies the exchange as the recipient
                // while the tag identifies the user account within the exchange
                // and the tag is retrieved with fetchDepositAddress.
                'tag': {
                    'NXT': true, // NXT, BURST
                    'CRYPTO_NOTE_PAYMENTID': true, // AEON, XMR
                    'BITSHAREX': true, // BTS
                    'RIPPLE': true, // XRP
                    'NEM': true, // XEM
                    'STELLAR': true, // XLM
                    'STEEM': true, // SBD, GOLOS
                    // https://github.com/ccxt/ccxt/issues/4794
                    // 'LISK': true, // LSK
                },
                'subaccountId': undefined,
                // see the implementation of fetchClosedOrdersV3 below
                // 'fetchClosedOrdersMethod': 'fetch_closed_orders_v3',
                'fetchClosedOrdersFilterBySince': true,
                // 'createOrderMethod': 'create_order_v1',
            },
            'commonCurrencies': {
                'BITS': 'SWIFT',
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     [
        //         {
        //             "symbol":"LTC-BTC",
        //             "baseCurrencySymbol":"LTC",
        //             "quoteCurrencySymbol":"BTC",
        //             "minTradeSize":"0.01686767",
        //             "precision":8,
        //             "status":"ONLINE", // "OFFLINE"
        //             "createdAt":"2014-02-13T00:00:00Z"
        //         },
        //         {
        //             "symbol":"VDX-USDT",
        //             "baseCurrencySymbol":"VDX",
        //             "quoteCurrencySymbol":"USDT",
        //             "minTradeSize":"300.00000000",
        //             "precision":8,
        //             "status":"ONLINE", // "OFFLINE"
        //             "createdAt":"2019-05-23T00:41:21.843Z",
        //             "notice":"USDT has swapped to an ERC20-based token as of August 5, 2019."
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const baseId = this.safeString (market, 'baseCurrencySymbol');
            const quoteId = this.safeString (market, 'quoteCurrencySymbol');
            const id = this.safeString (market, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const pricePrecision = this.safeInteger (market, 'precision', 8);
            const precision = {
                'amount': 8,
                'price': pricePrecision,
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'ONLINE');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minTradeSize'),
                        'max': undefined,
                    },
                    'price': {
                        'min': 1 / Math.pow (10, precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetBalances (params);
        const result = { 'info': balances };
        const indexed = this.indexBy (balances, 'currencySymbol');
        const currencyIds = Object.keys (indexed);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const balance = indexed[currencyId];
            account['free'] = this.safeFloat (balance, 'available');
            account['total'] = this.safeFloat (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'marketSymbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            if ((limit !== 1) && (limit !== 25) && (limit !== 500)) {
                throw new BadRequest (this.id + ' fetchOrderBook() limit argument must be undefined, 1, 25 or 500, default is 25');
            }
            request['depth'] = limit;
        }
        const response = await this.publicGetMarketsMarketSymbolOrderbook (this.extend (request, params));
        //
        //     {
        //         "bid":[
        //             {"quantity":"0.01250000","rate":"10718.56200003"},
        //             {"quantity":"0.10000000","rate":"10718.56200002"},
        //             {"quantity":"0.39648292","rate":"10718.56200001"},
        //         ],
        //         "ask":[
        //             {"quantity":"0.05100000","rate":"10724.30099631"},
        //             {"quantity":"0.10000000","rate":"10724.30099632"},
        //             {"quantity":"0.26000000","rate":"10724.30099634"},
        //         ]
        //     }
        //
        const sequence = this.safeInteger (this.last_response_headers, 'Sequence');
        const orderbook = this.parseOrderBook (response, undefined, 'bid', 'ask', 'rate', 'quantity');
        orderbook['nonce'] = sequence;
        return orderbook;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     [
        //         {
        //             "symbol":"1ST",
        //             "name":"Firstblood",
        //             "coinType":"ETH_CONTRACT",
        //             "status":"ONLINE",
        //             "minConfirmations":36,
        //             "notice":"",
        //             "txFee":"4.50000000",
        //             "logoUrl":"https://bittrexblobstorage.blob.core.windows.net/public/5685a7be-1edf-4ba0-a313-b5309bb204f8.png",
        //             "prohibitedIn":[],
        //             "baseAddress":"0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98",
        //             "associatedTermsOfService":[]
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const precision = 8; // default precision, todo: fix "magic constants"
            const fee = this.safeFloat (currency, 'txFee'); // todo: redesign
            const isActive = this.safeString (currency, 'status');
            result[code] = {
                'id': id,
                'code': code,
                'address': this.safeString (currency, 'baseAddress'),
                'info': currency,
                'type': this.safeString (currency, 'coinType'),
                'name': this.safeString (currency, 'name'),
                'active': (isActive === 'ONLINE'),
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': 1 / Math.pow (10, precision),
                        'max': undefined,
                    },
                    'price': {
                        'min': 1 / Math.pow (10, precision),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // ticker
        //
        //     {
        //         "symbol":"ETH-BTC",
        //         "lastTradeRate":"0.03284496",
        //         "bidRate":"0.03284523",
        //         "askRate":"0.03286857"
        //     }
        //
        // summary
        //
        //     {
        //         "symbol":"ETH-BTC",
        //         "high":"0.03369528",
        //         "low":"0.03282442",
        //         "volume":"4307.83794556",
        //         "quoteVolume":"143.08608869",
        //         "percentChange":"0.79",
        //         "updatedAt":"2020-09-29T07:36:57.823Z"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'updatedAt'));
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const percentage = this.safeFloat (ticker, 'percentChange');
        const last = this.safeFloat (ticker, 'lastTradeRate');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bidRate'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'askRate'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchTickers', {});
        const defaultMethod = this.safeString (options, 'method', 'publicGetMarketsTickers');
        const method = this.safeString (params, 'method', defaultMethod);
        params = this.omit (params, 'method');
        const response = await this[method] (params);
        //
        // publicGetMarketsTickers
        //
        //     [
        //         {
        //             "symbol":"4ART-BTC",
        //             "lastTradeRate":"0.00000210",
        //             "bidRate":"0.00000210",
        //             "askRate":"0.00000215"
        //         }
        //     ]
        //
        // publicGetMarketsSummaries
        //
        //     [
        //         {
        //             "symbol":"4ART-BTC",
        //             "high":"0.00000206",
        //             "low":"0.00000196",
        //             "volume":"14871.32000233",
        //             "quoteVolume":"0.02932756",
        //             "percentChange":"1.48",
        //             "updatedAt":"2020-09-29T07:34:32.757Z"
        //         }
        //     ]
        //
        const tickers = [];
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            tickers.push (ticker);
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketSymbol': market['id'],
        };
        const options = this.safeValue (this.options, 'fetchTicker', {});
        const defaultMethod = this.safeString (options, 'method', 'publicGetMarketsMarketSymbolTicker');
        const method = this.safeString (params, 'method', defaultMethod);
        params = this.omit (params, 'method');
        const response = await this[method] (this.extend (request, params));
        //
        // publicGetMarketsMarketSymbolTicker
        //
        //     {
        //         "symbol":"ETH-BTC",
        //         "lastTradeRate":"0.03284496",
        //         "bidRate":"0.03284523",
        //         "askRate":"0.03286857"
        //     }
        //
        //
        // publicGetMarketsMarketSymbolSummary
        //
        //     {
        //         "symbol":"ETH-BTC",
        //         "high":"0.03369528",
        //         "low":"0.03282442",
        //         "volume":"4307.83794556",
        //         "quoteVolume":"143.08608869",
        //         "percentChange":"0.79",
        //         "updatedAt":"2020-09-29T07:36:57.823Z"
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "id":"9c5589db-42fb-436c-b105-5e2edcb95673",
        //         "executedAt":"2020-10-03T11:48:43.38Z",
        //         "quantity":"0.17939626",
        //         "rate":"0.03297952",
        //         "takerSide":"BUY"
        //     }
        //
        // private fetchOrderTrades
        //
        //     {
        //         "id": "aaa3e9bd-5b86-4a21-8b3d-1275c1d30b8e",
        //         "marketSymbol": "OMG-BTC",
        //         "executedAt": "2020-10-02T16:00:30.3Z",
        //         "quantity": "7.52710000",
        //         "rate": "0.00034907",
        //         "orderId": "3a3dbd33-3a30-4ae5-a41d-68d3c1ac537e",
        //         "commission": "0.00000525",
        //         "isTaker": false
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'executedAt'));
        const id = this.safeString (trade, 'id');
        const order = this.safeString (trade, 'orderId');
        const marketId = this.safeString (trade, 'marketSymbol');
        market = this.safeMarket (marketId, market, '-');
        let cost = undefined;
        const price = this.safeFloat (trade, 'rate');
        const amount = this.safeFloat (trade, 'quantity');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        let takerOrMaker = undefined;
        const isTaker = this.safeValue (trade, 'isTaker');
        if (isTaker !== undefined) {
            takerOrMaker = isTaker ? 'taker' : 'maker';
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'commission');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        const side = this.safeStringLower (trade, 'takerSide');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': order,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetPing (params);
        //
        //     {
        //         "serverTime": 1594596023162
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketSymbol': this.marketId (symbol),
        };
        const response = await this.publicGetMarketsMarketSymbolTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"9c5589db-42fb-436c-b105-5e2edcb95673",
        //             "executedAt":"2020-10-03T11:48:43.38Z",
        //             "quantity":"0.17939626",
        //             "rate":"0.03297952",
        //             "takerSide":"BUY"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "startsAt":"2020-06-12T02:35:00Z",
        //         "open":"0.02493753",
        //         "high":"0.02493753",
        //         "low":"0.02493753",
        //         "close":"0.02493753",
        //         "volume":"0.09590123",
        //         "quoteVolume":"0.00239153"
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'startsAt')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const reverseId = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'candleInterval': this.timeframes[timeframe],
            'marketSymbol': reverseId,
        };
        let method = 'publicGetMarketsMarketSymbolCandlesCandleIntervalRecent';
        if (since !== undefined) {
            const now = this.milliseconds ();
            const difference = Math.abs (now - since);
            const sinceDate = this.ymd (since);
            const parts = sinceDate.split ('-');
            const sinceYear = this.safeInteger (parts, 0);
            const sinceMonth = this.safeInteger (parts, 1);
            const sinceDay = this.safeInteger (parts, 2);
            if (timeframe === '1d') {
                // if the since argument is beyond one year into the past
                if (difference > 31622400000) {
                    method = 'publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYear';
                    request['year'] = sinceYear;
                }
                // request['year'] = year;
            } else if (timeframe === '1h') {
                // if the since argument is beyond 31 days into the past
                if (difference > 2678400000) {
                    method = 'publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYearMonth';
                    request['year'] = sinceYear;
                    request['month'] = sinceMonth;
                }
            } else {
                // if the since argument is beyond 1 day into the past
                if (difference > 86400000) {
                    method = 'publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYearMonthDay';
                    request['year'] = sinceYear;
                    request['month'] = sinceMonth;
                    request['day'] = sinceDay;
                }
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         {"startsAt":"2020-06-12T02:35:00Z","open":"0.02493753","high":"0.02493753","low":"0.02493753","close":"0.02493753","volume":"0.09590123","quoteVolume":"0.00239153"},
        //         {"startsAt":"2020-06-12T02:40:00Z","open":"0.02491874","high":"0.02491874","low":"0.02490970","close":"0.02490970","volume":"0.04515695","quoteVolume":"0.00112505"},
        //         {"startsAt":"2020-06-12T02:45:00Z","open":"0.02490753","high":"0.02493143","low":"0.02490753","close":"0.02493143","volume":"0.17769640","quoteVolume":"0.00442663"}
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketSymbol'] = market['id'];
        }
        const response = await this.privateGetOrdersOpen (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrdersOrderIdExecutions (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // A ceiling order is a market or limit order that allows you to specify
        // the amount of quote currency you want to spend (or receive, if selling)
        // instead of the quantity of the market currency (e.g. buy $100 USD of BTC
        // at the current market BTC price)
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const reverseId = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'marketSymbol': reverseId,
            'direction': side.toUpperCase (),
            'type': uppercaseType, // LIMIT, MARKET, CEILING_LIMIT, CEILING_MARKET
            // 'quantity': this.amountToPrecision (symbol, amount), // required for limit orders, excluded for ceiling orders
            // 'ceiling': this.priceToPrecision (symbol, price), // required for ceiling orders, excluded for non-ceiling orders
            // 'limit': this.priceToPrecision (symbol, price), // required for limit orders, excluded for market orders
            // 'timeInForce': 'GOOD_TIL_CANCELLED', // IMMEDIATE_OR_CANCEL, FILL_OR_KILL, POST_ONLY_GOOD_TIL_CANCELLED
            // 'useAwards': false, // optional
        };
        const isCeilingLimit = (uppercaseType === 'CEILING_LIMIT');
        const isCeilingMarket = (uppercaseType === 'CEILING_MARKET');
        const isCeilingOrder = isCeilingLimit || isCeilingMarket;
        if (isCeilingOrder) {
            request['ceiling'] = this.priceToPrecision (symbol, price);
            // bittrex only accepts IMMEDIATE_OR_CANCEL or FILL_OR_KILL for ceiling orders
            request['timeInForce'] = 'IMMEDIATE_OR_CANCEL';
        } else {
            request['quantity'] = this.amountToPrecision (symbol, amount);
            if (uppercaseType === 'LIMIT') {
                request['limit'] = this.priceToPrecision (symbol, price);
                request['timeInForce'] = 'GOOD_TIL_CANCELLED';
            } else {
                // bittrex does not allow GOOD_TIL_CANCELLED for market orders
                request['timeInForce'] = 'IMMEDIATE_OR_CANCEL';
            }
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //         id: 'f03d5e98-b5ac-48fb-8647-dd4db828a297',
        //         marketSymbol: 'BTC-USDT',
        //         direction: 'SELL',
        //         type: 'LIMIT',
        //         quantity: '0.01',
        //         limit: '6000',
        //         timeInForce: 'GOOD_TIL_CANCELLED',
        //         fillQuantity: '0.00000000',
        //         commission: '0.00000000',
        //         proceeds: '0.00000000',
        //         status: 'OPEN',
        //         createdAt: '2020-03-18T02:37:33.42Z',
        //         updatedAt: '2020-03-18T02:37:33.42Z'
        //       }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateDeleteOrdersOrderId (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'id': id,
            'info': response,
            'status': 'canceled',
        });
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketSymbol'] = market['id'];
        }
        const response = await this.privateDeleteOrdersOpen (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"66582be0-5337-4d8c-b212-c356dd525801",
        //             "statusCode":"SUCCESS",
        //             "result":{
        //                 "id":"66582be0-5337-4d8c-b212-c356dd525801",
        //                 "marketSymbol":"BTC-USDT",
        //                 "direction":"BUY",
        //                 "type":"LIMIT",
        //                 "quantity":"0.01000000",
        //                 "limit":"3000.00000000",
        //                 "timeInForce":"GOOD_TIL_CANCELLED",
        //                 "fillQuantity":"0.00000000",
        //                 "commission":"0.00000000",
        //                 "proceeds":"0.00000000",
        //                 "status":"CLOSED",
        //                 "createdAt":"2020-10-06T12:31:53.39Z",
        //                 "updatedAt":"2020-10-06T12:54:28.8Z",
        //                 "closedAt":"2020-10-06T12:54:28.8Z"
        //             }
        //         }
        //     ]
        //
        const orders = [];
        for (let i = 0; i < response.length; i++) {
            const result = this.safeValue (response[i], 'result', {});
            orders.push (result);
        }
        return this.parseOrders (orders, market);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // https://support.bittrex.com/hc/en-us/articles/115003723911
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currencySymbol'] = currency['id'];
        }
        const response = await this.privateGetDepositsClosed (this.extend (request, params));
        // we cannot filter by `since` timestamp, as it isn't set by Bittrex
        // see https://github.com/ccxt/ccxt/issues/4067
        // return this.parseTransactions (response, currency, since, limit);
        return this.parseTransactions (response, currency, undefined, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // https://support.bittrex.com/hc/en-us/articles/115003723911
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currencySymbol'] = currency['id'];
        }
        const response = await this.privateGetWithdrawalsClosed (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //     {
        //         "id": "d00fdf2e-df9e-48f1-....",
        //         "currencySymbol": "BTC",
        //         "quantity": "0.00550000",
        //         "cryptoAddress": "1PhmYjnJPZH5NUwV8AU...",
        //         "txId": "d1f1afffe1b9b6614eaee7e8133c85d98...",
        //         "confirmations": 2,
        //         "updatedAt": "2020-01-12T16:49:30.41Z",
        //         "completedAt": "2020-01-12T16:49:30.41Z",
        //         "status": "COMPLETED",
        //         "source": "BLOCKCHAIN"
        //     }
        //
        // fetchWithdrawals
        //     {
        //         "PaymentUuid" : "e293da98-788c-4188-a8f9-8ec2c33fdfcf",
        //         "Currency" : "XC",
        //         "Amount" : 7513.75121715,
        //         "Address" : "EVnSMgAd7EonF2Dgc4c9K14L12RBaW5S5J",
        //         "Opened" : "2014-07-08T23:13:31.83",
        //         "Authorized" : true,
        //         "PendingPayment" : false,
        //         "TxCost" : 0.00002000,
        //         "TxId" : "b4a575c2a71c7e56d02ab8e26bb1ef0a2f6cf2094f6ca2116476a569c1e84f6e",
        //         "Canceled" : false,
        //         "InvalidAddress" : false
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const amount = this.safeFloat (transaction, 'quantity');
        const address = this.safeString (transaction, 'cryptoAddress');
        const txid = this.safeString (transaction, 'txId');
        const updated = this.parse8601 (this.safeString (transaction, 'updatedAt'));
        const opened = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const timestamp = opened ? opened : updated;
        const type = (opened === undefined) ? 'deposit' : 'withdrawal';
        const currencyId = this.safeString (transaction, 'currencySymbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        let status = 'pending';
        if (type === 'deposit') {
            //
            // deposits numConfirmations never reach the minConfirmations number
            // we set all of them to 'ok', otherwise they'd all be 'pending'
            //
            //     const numConfirmations = this.safeInteger (transaction, 'Confirmations', 0);
            //     const minConfirmations = this.safeInteger (currency['info'], 'MinConfirmation');
            //     if (numConfirmations >= minConfirmations) {
            //         status = 'ok';
            //     }
            //
            status = 'ok';
        } else {
            const responseStatus = this.safeString (transaction, 'status');
            if (responseStatus === 'ERROR_INVALID_ADDRESS') {
                status = 'failed';
            } else if (responseStatus === 'CANCELLED') {
                status = 'canceled';
            } else if (responseStatus === 'PENDING') {
                status = 'pending';
            } else if (responseStatus === 'COMPLETED') {
                status = 'ok';
            } else if (responseStatus === 'AUTHORIZED' && (txid !== undefined)) {
                status = 'ok';
            }
        }
        let feeCost = this.safeFloat (transaction, 'txCost');
        if (feeCost === undefined) {
            if (type === 'deposit') {
                // according to https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-
                feeCost = 0;
            }
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseSymbol (id) {
        const [ quoteId, baseId ] = id.split (this.options['symbolSeparator']);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return base + '/' + quote;
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         id: '1be35109-b763-44ce-b6ea-05b6b0735c0c',
        //         marketSymbol: 'LTC-ETH',
        //         direction: 'BUY',
        //         type: 'LIMIT',
        //         quantity: '0.50000000',
        //         limit: '0.17846699',
        //         timeInForce: 'GOOD_TIL_CANCELLED',
        //         fillQuantity: '0.50000000',
        //         commission: '0.00022286',
        //         proceeds: '0.08914915',
        //         status: 'CLOSED',
        //         createdAt: '2018-06-23T13:14:28.613Z',
        //         updatedAt: '2018-06-23T13:14:30.19Z',
        //         closedAt: '2018-06-23T13:14:30.19Z'
        //     }
        //
        const marketSymbol = this.safeString (order, 'marketSymbol');
        let symbol = undefined;
        let feeCurrency = undefined;
        if (marketSymbol !== undefined) {
            const [ baseId, quoteId ] = marketSymbol.split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
            feeCurrency = quote;
        }
        const direction = this.safeStringLower (order, 'direction');
        const createdAt = this.safeString (order, 'createdAt');
        const updatedAt = this.safeString (order, 'updatedAt');
        const closedAt = this.safeString (order, 'closedAt');
        let lastTradeTimestamp = undefined;
        if (closedAt !== undefined) {
            lastTradeTimestamp = this.parse8601 (closedAt);
        } else if (updatedAt) {
            lastTradeTimestamp = this.parse8601 (updatedAt);
        }
        const timestamp = this.parse8601 (createdAt);
        const type = this.safeStringLower (order, 'type');
        const quantity = this.safeFloat (order, 'quantity');
        const limit = this.safeFloat (order, 'limit');
        const fillQuantity = this.safeFloat (order, 'fillQuantity');
        const commission = this.safeFloat (order, 'commission');
        const proceeds = this.safeFloat (order, 'proceeds');
        let average = undefined;
        let remaining = undefined;
        if (fillQuantity !== undefined) {
            if (proceeds !== undefined) {
                if (fillQuantity > 0) {
                    average = proceeds / fillQuantity;
                } else if (proceeds === 0) {
                    average = 0;
                }
            }
            if (quantity !== undefined) {
                remaining = quantity - fillQuantity;
            }
        }
        let status = this.safeStringLower (order, 'status');
        if ((status === 'closed') && (remaining !== undefined) && (remaining > 0)) {
            status = 'canceled';
        }
        return {
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': direction,
            'price': limit,
            'cost': proceeds,
            'average': average,
            'amount': quantity,
            'filled': fillQuantity,
            'remaining': remaining,
            'status': status,
            'fee': {
                'cost': commission,
                'currency': feeCurrency,
            },
            'info': order,
            'trades': undefined,
        };
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.options['fetchClosedOrdersFilterBySince']) {
            return super.parseOrders (orders, market, since, limit, params);
        } else {
            return super.parseOrders (orders, market, undefined, limit, params);
        }
    }

    parseOrderStatus (status) {
        const statuses = {
            'CLOSED': 'closed',
            'OPEN': 'open',
            'CANCELLED': 'canceled',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            const request = {
                'orderId': id,
            };
            response = await this.privateGetOrdersOrderId (this.extend (request, params));
        } catch (e) {
            if (this.last_json_response) {
                const message = this.safeString (this.last_json_response, 'message');
                if (message === 'UUID_INVALID') {
                    throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.last_http_response);
                }
            }
            throw e;
        }
        return this.parseOrder (response);
    }

    orderToTrade (order) {
        // this entire method should be moved to the base class
        const timestamp = this.safeInteger2 (order, 'lastTradeTimestamp', 'timestamp');
        return {
            'id': this.safeString (order, 'id'),
            'side': this.safeString (order, 'side'),
            'order': this.safeString (order, 'id'),
            'type': this.safeString (order, 'type'),
            'price': this.safeFloat (order, 'average'),
            'amount': this.safeFloat (order, 'filled'),
            'cost': this.safeFloat (order, 'cost'),
            'symbol': this.safeString (order, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': this.safeValue (order, 'fee'),
            'info': order,
            'takerOrMaker': undefined,
        };
    }

    ordersToTrades (orders) {
        // this entire method should be moved to the base class
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.orderToTrade (orders[i]));
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startDate'] = this.ymdhms (since, 'T') + 'Z';
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            // because of this line we will have to rethink the entire v3
            // in other words, markets define all the rest of the API
            // and v3 market ids are reversed in comparison to v1
            // v3 has to be a completely separate implementation
            // otherwise we will have to shuffle symbols and currencies everywhere
            // which is prone to errors, as was shown here
            // https://github.com/ccxt/ccxt/pull/5219#issuecomment-499646209
            request['marketSymbol'] = market['base'] + '-' + market['quote'];
        }
        const response = await this.privateGetOrdersClosed (this.extend (request, params));
        const orders = this.parseOrders (response, market);
        const trades = this.ordersToTrades (orders);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startDate'] = this.ymdhms (since, 'T') + 'Z';
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            // because of this line we will have to rethink the entire v3
            // in other words, markets define all the rest of the API
            // and v3 market ids are reversed in comparison to v1
            // v3 has to be a completely separate implementation
            // otherwise we will have to shuffle symbols and currencies everywhere
            // which is prone to errors, as was shown here
            // https://github.com/ccxt/ccxt/pull/5219#issuecomment-499646209
            request['marketSymbol'] = market['base'] + '-' + market['quote'];
        }
        const response = await this.privateGetOrdersClosed (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencySymbol': currency['id'],
        };
        const response = await this.privateGetAddressesCurrencySymbol (this.extend (request, params));
        // {
        //     "status": "PROVISIONED",
        //     "currencySymbol": "BTC",
        //     "cryptoAddress": "1PhmYjnJPZH5NUwV8AUjqkeDkCBpbE2xqX"
        // }
        let address = this.safeString (response, 'cryptoAddress');
        const message = this.safeString (response, 'status');
        if (!address || message === 'REQUESTED') {
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        }
        let tag = undefined;
        if (currency['type'] in this.options['tag']) {
            tag = address;
            address = currency['address'];
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencySymbol': currency['id'],
            'quantity': amount,
            'cryptoAddress': address,
        };
        if (tag !== undefined) {
            request['cryptoAddressTag'] = tag;
        }
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        const id = this.safeString (response, 'id');
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'v3', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/';
        if (api === 'private') {
            url += this.version + '/';
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            params = this.omit (params, this.extractParams (path));
            let hashString = '';
            if (method === 'POST') {
                body = this.json (params);
                hashString = body;
            } else {
                if (Object.keys (params).length) {
                    url += '?' + this.rawencode (params);
                }
            }
            const contentHash = this.hash (this.encode (hashString), 'sha512', 'hex');
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + url + method + contentHash;
            const subaccountId = this.safeValue (this.options, 'subaccountId');
            if (subaccountId !== undefined) {
                auth += subaccountId;
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            headers = {
                'Api-Key': this.apiKey,
                'Api-Timestamp': timestamp,
                'Api-Content-Hash': contentHash,
                'Api-Signature': signature,
            };
            if (subaccountId !== undefined) {
                headers['Api-Subaccount-Id'] = subaccountId;
            }
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        } else {
            if (api === 'public') {
                url += this.version + '/';
            }
            url += this.implodeParams (path, params);
            params = this.omit (params, this.extractParams (path));
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     { success: false, message: "message" }
        //
        if (body[0] === '{') {
            const feedback = this.id + ' ' + body;
            let success = this.safeValue (response, 'success');
            if (success === undefined) {
                const code = this.safeString (response, 'code');
                if (code !== undefined) {
                    this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                    this.throwBroadlyMatchedException (this.exceptions['broad'], code, feedback);
                }
                // throw new ExchangeError (this.id + ' malformed response ' + this.json (response));
                return;
            }
            if (typeof success === 'string') {
                // bleutrade uses string instead of boolean
                success = (success === 'true');
            }
            if (!success) {
                const message = this.safeString (response, 'message');
                if (message === 'APIKEY_INVALID') {
                    if (this.options['hasAlreadyAuthenticatedSuccessfully']) {
                        throw new DDoSProtection (feedback);
                    } else {
                        throw new AuthenticationError (feedback);
                    }
                }
                // https://github.com/ccxt/ccxt/issues/4932
                // the following two lines are now redundant, see line 171 in describe()
                //
                //     if (message === 'DUST_TRADE_DISALLOWED_MIN_VALUE_50K_SAT')
                //         throw new InvalidOrder (this.id + ' order cost should be over 50k satoshi ' + this.json (response));
                //
                if (message === 'INVALID_ORDER') {
                    // Bittrex will return an ambiguous INVALID_ORDER message
                    // upon canceling already-canceled and closed orders
                    // therefore this special case for cancelOrder
                    // let url = 'https://bittrex.com/api/v1.1/market/cancel?apikey=API_KEY&uuid=ORDER_UUID'
                    const cancel = 'cancel';
                    const indexOfCancel = url.indexOf (cancel);
                    if (indexOfCancel >= 0) {
                        const urlParts = url.split ('?');
                        const numParts = urlParts.length;
                        if (numParts > 1) {
                            const query = urlParts[1];
                            const params = query.split ('&');
                            const numParams = params.length;
                            let orderId = undefined;
                            for (let i = 0; i < numParams; i++) {
                                const param = params[i];
                                const keyValue = param.split ('=');
                                if (keyValue[0] === 'uuid') {
                                    orderId = keyValue[1];
                                    break;
                                }
                            }
                            if (orderId !== undefined) {
                                throw new OrderNotFound (this.id + ' cancelOrder ' + orderId + ' ' + this.json (response));
                            } else {
                                throw new OrderNotFound (this.id + ' cancelOrder ' + this.json (response));
                            }
                        }
                    }
                }
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                if (message !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
