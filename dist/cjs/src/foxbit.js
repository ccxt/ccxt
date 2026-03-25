'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Precise = require('./base/Precise.js');
var foxbit$1 = require('./abstract/foxbit.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class foxbit
 * @augments Exchange
 */
class foxbit extends foxbit$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'foxbit',
            'name': 'Foxbit',
            'countries': ['pt-BR'],
            // 300 requests per 10 seconds = 30 requests per second
            // rateLimit = 1000 ms / 30 requests ~= 33.334
            'rateLimit': 33.334,
            'version': '1',
            'comment': 'Foxbit Exchange',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'fecthOrderBook': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchL2OrderBook': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'loadMarkets': true,
                'sandbox': false,
                'withdraw': true,
                'ws': false,
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
                '2w': '2w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/1f8faca2-ae2f-4222-b33e-5671e7d873dd',
                'api': {
                    'public': 'https://api.foxbit.com.br',
                    'private': 'https://api.foxbit.com.br',
                    'status': 'https://metadata-v2.foxbit.com.br/api',
                },
                'www': 'https://app.foxbit.com.br',
                'doc': [
                    'https://docs.foxbit.com.br',
                ],
            },
            'precisionMode': number.DECIMAL_PLACES,
            'exceptions': {
                'exact': {
                    // https://docs.foxbit.com.br/rest/v3/#tag/API-Codes/Errors
                    '400': errors.BadRequest,
                    '429': errors.RateLimitExceeded,
                    '404': errors.BadRequest,
                    '500': errors.ExchangeError,
                    '2001': errors.AuthenticationError,
                    '2002': errors.AuthenticationError,
                    '2003': errors.AuthenticationError,
                    '2004': errors.BadRequest,
                    '2005': errors.PermissionDenied,
                    '3001': errors.PermissionDenied,
                    '3002': errors.PermissionDenied,
                    '3003': errors.AccountSuspended,
                    '4001': errors.BadRequest,
                    '4002': errors.InsufficientFunds,
                    '4003': errors.InvalidOrder,
                    '4004': errors.BadSymbol,
                    '4005': errors.BadRequest,
                    '4007': errors.ExchangeError,
                    '4008': errors.InvalidOrder,
                    '4009': errors.PermissionDenied,
                    '4011': errors.RateLimitExceeded,
                    '4012': errors.ExchangeError,
                    '5001': errors.ExchangeNotAvailable,
                    '5002': errors.OnMaintenance,
                    '5003': errors.OnMaintenance,
                    '5004': errors.InvalidOrder,
                    '5005': errors.InvalidOrder,
                    '5006': errors.InvalidOrder, // Significant price deviation detected, exceeding acceptable limits. The order price is exceeding acceptable limits from market to complete your request.
                },
                'broad': {
                // todo: add details messages that can be usefull here, like when market is not found
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'v3': {
                    'public': {
                        'get': {
                            'currencies': 5,
                            'markets': 5,
                            'markets/ticker/24hr': 60,
                            'markets/{market}/orderbook': 6,
                            'markets/{market}/candlesticks': 12,
                            'markets/{market}/trades/history': 12,
                            'markets/{market}/ticker/24hr': 15, // 4 requests per 2 seconds
                        },
                    },
                    'private': {
                        'get': {
                            'accounts': 2,
                            'accounts/{symbol}/transactions': 60,
                            'orders': 2,
                            'orders/by-order-id/{id}': 2,
                            'trades': 6,
                            'deposits/address': 10,
                            'deposits': 10,
                            'withdrawals': 10,
                            'me/fees/trading': 60, // 1 requests per 2 seconds
                        },
                        'post': {
                            'orders': 2,
                            'orders/batch': 7.5,
                            'orders/cancel-replace': 3,
                            'withdrawals': 10, // 3 requests per second
                        },
                        'put': {
                            'orders/cancel': 2, // 30 requests per 2 seconds
                        },
                    },
                },
                'status': {
                    'public': {
                        'get': {
                            'status': 30, // 1 request per second
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber('0.005'),
                    'maker': this.parseNumber('0.0025'),
                },
            },
            'options': {
                'sandboxMode': false,
                'networksById': {
                    'algorand': 'ALGO',
                    'arbitrum': 'ARBITRUM',
                    'avalanchecchain': 'AVAX',
                    'bitcoin': 'BTC',
                    'bitcoincash': 'BCH',
                    'bsc': 'BEP20',
                    'cardano': 'ADA',
                    'cosmos': 'ATOM',
                    'dogecoin': 'DOGE',
                    'erc20': 'ETH',
                    'hedera': 'HBAR',
                    'litecoin': 'LTC',
                    'near': 'NEAR',
                    'optimism': 'OPTIMISM',
                    'polkadot': 'DOT',
                    'polygon': 'MATIC',
                    'ripple': 'XRP',
                    'solana': 'SOL',
                    'stacks': 'STX',
                    'stellar': 'XLM',
                    'tezos': 'XTZ',
                    'trc20': 'TRC20',
                },
                'networks': {
                    'ALGO': 'algorand',
                    'ARBITRUM': 'arbitrum',
                    'AVAX': 'avalanchecchain',
                    'BTC': 'bitcoin',
                    'BCH': 'bitcoincash',
                    'BEP20': 'bsc',
                    'ADA': 'cardano',
                    'ATOM': 'cosmos',
                    'DOGE': 'dogecoin',
                    'ETH': 'erc20',
                    'HBAR': 'hedera',
                    'LTC': 'litecoin',
                    'NEAR': 'near',
                    'OPTIMISM': 'optimism',
                    'DOT': 'polkadot',
                    'MATIC': 'polygon',
                    'XRP': 'ripple',
                    'SOL': 'solana',
                    'STX': 'stacks',
                    'XLM': 'stellar',
                    'XTZ': 'tezos',
                    'TRC20': 'trc20',
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': false,
                            'index': false,
                        },
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'GTC': true,
                            'FOK': true,
                            'IOC': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': {
                            'expire_maker': true,
                            'expire_taker': true,
                            'expire_both': true,
                            'none': true, // foxbit prevents self trading by default, no params can change this
                        },
                        'trailing': false,
                        'icebergAmount': false,
                    },
                    'createOrders': {
                        'max': 5,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 90,
                        'untilDays': 10000,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'limit': 1,
                        'daysBack': 90,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 90,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': true,
                        'limit': 100,
                        'daysBack': 90,
                        'untilDays': 10000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 100,
                        'daysBack': 90,
                        'daysBackCanceled': 90,
                        'untilDays': 10000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 500,
                    },
                },
            },
        });
    }
    async fetchCurrencies(params = {}) {
        const response = await this.v3PublicGetCurrencies(params);
        // {
        //   "data": [
        //     {
        //       "symbol": "btc",
        //       "name": "Bitcoin",
        //       "type": "CRYPTO",
        //       "precision": 8,
        //       "deposit_info": {
        //         "min_to_confirm": "1",
        //         "min_amount": "0.0001"
        //       },
        //       "withdraw_info": {
        //         "enabled": true,
        //         "min_amount": "0.0001",
        //         "fee": "0.0001"
        //       },
        //       "category": {
        //           "code": "cripto",
        //         "name": "Cripto"
        //       },
        //       "networks": [
        //           {
        //               "name": "Bitcoin",
        //               "code": "btc",
        //               "deposit_info": {
        //                  status: "ENABLED",
        //               },
        //               "withdraw_info": {
        //                  "status": "ENABLED",
        //                  "fee": "0.0001",
        //               },
        //               "has_destination_tag": false
        //           }
        //       ]
        //     }
        //   ]
        // }
        const data = this.safeList(response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const precision = this.safeInteger(currency, 'precision');
            const currencyId = this.safeString(currency, 'symbol');
            const name = this.safeString(currency, 'name');
            const code = this.safeCurrencyCode(currencyId);
            const depositInfo = this.safeDict(currency, 'deposit_info');
            const withdrawInfo = this.safeDict(currency, 'withdraw_info');
            const networks = this.safeList(currency, 'networks', []);
            const type = this.safeStringLower(currency, 'type');
            const parsedNetworks = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.safeString(network, 'code');
                const networkCode = this.networkIdToCode(networkId, code);
                const networkWithdrawInfo = this.safeDict(network, 'withdraw_info');
                const networkDepositInfo = this.safeDict(network, 'deposit_info');
                const isWithdrawEnabled = this.safeString(networkWithdrawInfo, 'status') === 'ENABLED';
                const isDepositEnabled = this.safeString(networkDepositInfo, 'status') === 'ENABLED';
                parsedNetworks[networkCode] = {
                    'info': currency,
                    'id': networkId,
                    'network': networkCode,
                    'name': this.safeString(network, 'name'),
                    'deposit': isDepositEnabled,
                    'withdraw': isWithdrawEnabled,
                    'active': true,
                    'precision': precision,
                    'fee': this.safeNumber(networkWithdrawInfo, 'fee'),
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber(depositInfo, 'min_amount'),
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.safeNumber(withdrawInfo, 'min_amount'),
                            'max': undefined,
                        },
                    },
                };
            }
            if (this.safeDict(result, code) === undefined) {
                result[code] = this.safeCurrencyStructure({
                    'id': currencyId,
                    'code': code,
                    'info': currency,
                    'name': name,
                    'active': true,
                    'type': type,
                    'deposit': this.safeBool(depositInfo, 'enabled', false),
                    'withdraw': this.safeBool(withdrawInfo, 'enabled', false),
                    'fee': this.safeNumber(withdrawInfo, 'fee'),
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber(depositInfo, 'min_amount'),
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.safeNumber(withdrawInfo, 'min_amount'),
                            'max': undefined,
                        },
                    },
                    'networks': parsedNetworks,
                });
            }
        }
        return result;
    }
    /**
     * @method
     * @name foxbit#fetchMarkets
     * @description Retrieves data on all markets for foxbit.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_index
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.v3PublicGetMarkets(params);
        // {
        //     "data": [
        //       {
        //         "symbol": "btcbrl",
        //         "quantity_min": "0.00000236",
        //         "quantity_increment": "0.00000001",
        //         "quantity_precision": 8,
        //         "price_min": "0.0001",
        //         "price_increment": "0.0001",
        //         "price_precision": 4,
        //         "default_fees": {
        //           "maker": "0.001",
        //           "taker": "0.001"
        //         },
        //         "base": {
        //           "symbol": "btc",
        //           "name": "Bitcoin",
        //           "type": "CRYPTO",
        //           "precision": 8,
        //           "category": {
        //             "code": "cripto",
        //             "name": "Cripto"
        //           },
        //           "deposit_info": {
        //             "min_to_confirm": "1",
        //             "min_amount": "0.0001",
        //             "enabled": true
        //           },
        //           "withdraw_info": {
        //             "enabled": true,
        //             "min_amount": "0.0001",
        //             "fee": "0.0001"
        //           },
        //           "networks": [
        //             {
        //               "name": "Bitcoin",
        //               "code": "bitcoin",
        //               "deposit_info": {
        //                 "status": "ENABLED"
        //               },
        //               "withdraw_info": {
        //                 "status": "ENABLED",
        //                 "fee": "0.0001"
        //               },
        //               "has_destination_tag": false
        //             }
        //           ],
        //           "default_network_code": "bitcoin"
        //         },
        //         "quote": {
        //           "symbol": "btc",
        //           "name": "Bitcoin",
        //           "type": "CRYPTO",
        //           "precision": 8,
        //           "category": {
        //             "code": "cripto",
        //             "name": "Cripto"
        //           },
        //           "deposit_info": {
        //             "min_to_confirm": "1",
        //             "min_amount": "0.0001",
        //             "enabled": true
        //           },
        //           "withdraw_info": {
        //             "enabled": true,
        //             "min_amount": "0.0001",
        //             "fee": "0.0001"
        //           },
        //           "networks": [
        //             {
        //               "name": "Bitcoin",
        //               "code": "bitcoin",
        //               "deposit_info": {
        //                 "status": "ENABLED"
        //               },
        //               "withdraw_info": {
        //                 "status": "ENABLED",
        //                 "fee": "0.0001"
        //               },
        //               "has_destination_tag": false
        //             }
        //           ],
        //           "default_network_code": "bitcoin"
        //         },
        //         "order_type": [
        //           "LIMIT",
        //           "MARKET",
        //           "INSTANT",
        //           "STOP_LIMIT",
        //           "STOP_MARKET"
        //         ]
        //       }
        //     ]
        //   }
        const markets = this.safeList(response, 'data', []);
        return this.parseMarkets(markets);
    }
    /**
     * @method
     * @name foxbit#fetchTicker
     * @description Get last 24 hours ticker information, in real-time, for given market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v3PublicGetMarketsMarketTicker24hr(this.extend(request, params));
        //  {
        //    "data": [
        //      {
        //        "market_symbol": "btcbrl",
        //        "last_trade": {
        //          "price": "358504.69340000",
        //          "volume": "0.00027893",
        //          "date": "2024-01-01T00:00:00.000Z"
        //        },
        //        "rolling_24h": {
        //          "price_change": "3211.87290000",
        //          "price_change_percent": "0.90400726",
        //          "volume": "20.03206866",
        //          "trades_count": "4376",
        //          "open": "355292.82050000",
        //          "high": "362999.99990000",
        //          "low": "355002.88880000"
        //        },
        //        "best": {
        //          "ask": {
        //            "price": "358504.69340000",
        //            "volume": "0.00027893"
        //          },
        //          "bid": {
        //            "price": "358504.69340000",
        //            "volume": "0.00027893"
        //          }
        //        }
        //      }
        //    ]
        //  }
        const data = this.safeList(response, 'data', []);
        const result = this.safeDict(data, 0, {});
        return this.parseTicker(result, market);
    }
    /**
     * @method
     * @name foxbit#fetchTickers
     * @description Retrieve the ticker data of all markets.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.v3PublicGetMarketsTicker24hr(params);
        //  {
        //    "data": [
        //      {
        //        "market_symbol": "btcbrl",
        //        "last_trade": {
        //          "price": "358504.69340000",
        //          "volume": "0.00027893",
        //          "date": "2024-01-01T00:00:00.000Z"
        //        },
        //        "rolling_24h": {
        //          "price_change": "3211.87290000",
        //          "price_change_percent": "0.90400726",
        //          "volume": "20.03206866",
        //          "trades_count": "4376",
        //          "open": "355292.82050000",
        //          "high": "362999.99990000",
        //          "low": "355002.88880000"
        //        },
        //      }
        //    ]
        //  }
        const data = this.safeList(response, 'data', []);
        return this.parseTickers(data, symbols);
    }
    /**
     * @method
     * @name foxbit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Member-Info/operation/MembersController_listTradingFees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.v3PrivateGetMeFeesTrading(params);
        // [
        //     {
        //         "market_symbol": "btcbrl",
        //         "maker": "0.0025",
        //         "taker": "0.005"
        //     }
        // ]
        const data = this.safeList(response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString(entry, 'market_symbol');
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            result[symbol] = this.parseTradingFee(entry, market);
        }
        return result;
    }
    /**
     * @method
     * @name foxbit#fetchOrderBook
     * @description Exports a copy of the order book of a specific market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_findOrderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, the maximum is 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const defaultLimit = 20;
        const request = {
            'market': market['id'],
            'depth': (limit === undefined) ? defaultLimit : limit,
        };
        const response = await this.v3PublicGetMarketsMarketOrderbook(this.extend(request, params));
        //  {
        //    "sequence_id": 1234567890,
        //    "timestamp": 1713187921336,
        //    "bids": [
        //      [
        //        "3.00000000",
        //        "300.00000000"
        //      ],
        //      [
        //        "1.70000000",
        //        "310.00000000"
        //      ]
        //    ],
        //    "asks": [
        //      [
        //        "3.00000000",
        //        "300.00000000"
        //      ],
        //      [
        //        "2.00000000",
        //        "321.00000000"
        //      ]
        //    ]
        //  }
        const timestamp = this.safeInteger(response, 'timestamp');
        return this.parseOrderBook(response, symbol, timestamp);
    }
    /**
     * @method
     * @name foxbit#fetchTrades
     * @description Retrieve the trades of a specific market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_publicTrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['page_size'] = limit;
            if (limit > 200) {
                request['page_size'] = 200;
            }
        }
        // [
        //     {
        //         "id": 1,
        //         "price": "329248.74700000",
        //         "volume": "0.00100000",
        //         "taker_side": "BUY",
        //         "created_at": "2024-01-01T00:00:00Z"
        //     }
        // ]
        const response = await this.v3PublicGetMarketsMarketTradesHistory(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    /**
     * @method
     * @name foxbit#fetchOHLCV
     * @description Fetch historical candlestick data containing the open, high, low, and close price, and the volume of a market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_findCandlesticks
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const request = {
            'market': market['id'],
            'interval': interval,
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
            if (limit > 500) {
                request['limit'] = 500;
            }
        }
        const response = await this.v3PublicGetMarketsMarketCandlesticks(this.extend(request, params));
        // [
        //     [
        //         "1692918000000", // timestamp
        //         "127772.05150000", // open
        //         "128467.99980000", // high
        //         "127750.01000000", // low
        //         "128353.99990000", // close
        //         "1692918060000", // close timestamp
        //         "0.17080431", // base volume
        //         "21866.35948786", // quote volume
        //         66, // number of trades
        //         "0.12073605", // taker buy base volume
        //         "15466.34096391" // taker buy quote volume
        //     ]
        // ]
        return this.parseOHLCVs(response, market, interval, since, limit);
    }
    /**
     * @method
     * @name foxbit#fetchBalance
     * @description Query for balance and get the amount of funds available for trading or funds locked in orders.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Account/operation/AccountsController_all
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v3PrivateGetAccounts(params);
        // {
        //     "data": [
        //         {
        //         "currency_symbol": "btc",
        //         "balance": "10000.0",
        //         "balance_available": "9000.0",
        //         "balance_locked": "1000.0"
        //         }
        //     ]
        // }
        const accounts = this.safeList(response, 'data', []);
        const result = {
            'info': response,
        };
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const currencyId = this.safeString(account, 'currency_symbol');
            const currencyCode = this.safeCurrencyCode(currencyId);
            const total = this.safeString(account, 'balance');
            const used = this.safeString(account, 'balance_locked');
            const free = this.safeString(account, 'balance_available');
            const balanceObj = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[currencyCode] = balanceObj;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name foxbit#fetchOpenOrders
     * @description Fetch all unfilled currently open orders.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_listOrders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus('ACTIVE', symbol, since, limit, params);
    }
    /**
     * @method
     * @name foxbit#fetchClosedOrders
     * @description Fetch all currently closed orders.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_listOrders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus('FILLED', symbol, since, limit, params);
    }
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus('CANCELED', symbol, since, limit, params);
    }
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {
            'state': status,
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market_symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
            if (limit > 100) {
                request['page_size'] = 100;
            }
        }
        const response = await this.v3PrivateGetOrders(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data);
    }
    /**
     * @method
     * @name foxbit#createOrder
     * @description Create an order with the specified characteristics
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_create
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'stop_market', 'stop_limit', 'instant'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "FOK", "IOC", "PO"
     * @param {float} [params.triggerPrice] The time in force for the order. One of GTC, FOK, IOC, PO. See .features or foxbit's doc to see more details.
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {string} [params.clientOrderId] a unique identifier for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        type = type.toUpperCase();
        if (type !== 'LIMIT' && type !== 'MARKET' && type !== 'STOP_MARKET' && type !== 'STOP_LIMIT' && type !== 'INSTANT') {
            throw new errors.InvalidOrder('Invalid order type: ' + type + '. Must be one of: limit, market, stop_market, stop_limit, instant.');
        }
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        const postOnly = this.safeBool(params, 'postOnly', false);
        const triggerPrice = this.safeNumber(params, 'triggerPrice');
        const request = {
            'market_symbol': market['id'],
            'side': side.toUpperCase(),
            'type': type,
        };
        if (type === 'STOP_MARKET' || type === 'STOP_LIMIT') {
            if (triggerPrice === undefined) {
                throw new errors.InvalidOrder('Invalid order type: ' + type + '. Must have triggerPrice.');
            }
        }
        if (timeInForce !== undefined) {
            if (timeInForce === 'PO') {
                request['post_only'] = true;
            }
            else {
                request['time_in_force'] = timeInForce;
            }
        }
        if (postOnly) {
            request['post_only'] = true;
        }
        if (triggerPrice !== undefined) {
            request['stop_price'] = this.priceToPrecision(symbol, triggerPrice);
        }
        if (type === 'INSTANT') {
            request['amount'] = this.priceToPrecision(symbol, amount);
        }
        else {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        if (type === 'LIMIT' || type === 'STOP_LIMIT') {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        params = this.omit(params, ['timeInForce', 'postOnly', 'triggerPrice', 'clientOrderId']);
        const response = await this.v3PrivatePostOrders(this.extend(request, params));
        // {
        //     "id": 1234567890,
        //     "sn": "OKMAKSDHRVVREK",
        //     "client_order_id": "451637946501"
        // }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name foxbit#createOrders
     * @description create a list of trade orders
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/createBatch
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.safeDict(orders, i);
            const symbol = this.safeString(order, 'symbol');
            const market = this.market(symbol);
            const type = this.safeStringUpper(order, 'type');
            const orderParams = this.safeDict(order, 'params', {});
            if (type !== 'LIMIT' && type !== 'MARKET' && type !== 'STOP_MARKET' && type !== 'STOP_LIMIT' && type !== 'INSTANT') {
                throw new errors.InvalidOrder('Invalid order type: ' + type + '. Must be one of: limit, market, stop_market, stop_limit, instant.');
            }
            const timeInForce = this.safeStringUpper(orderParams, 'timeInForce');
            const postOnly = this.safeBool(orderParams, 'postOnly', false);
            const triggerPrice = this.safeNumber(orderParams, 'triggerPrice');
            const request = {
                'market_symbol': market['id'],
                'side': this.safeStringUpper(order, 'side'),
                'type': type,
            };
            if (type === 'STOP_MARKET' || type === 'STOP_LIMIT') {
                if (triggerPrice === undefined) {
                    throw new errors.InvalidOrder('Invalid order type: ' + type + '. Must have triggerPrice.');
                }
            }
            if (timeInForce !== undefined) {
                if (timeInForce === 'PO') {
                    request['post_only'] = true;
                }
                else {
                    request['time_in_force'] = timeInForce;
                }
                delete orderParams['timeInForce'];
            }
            if (postOnly) {
                request['post_only'] = true;
                delete orderParams['postOnly'];
            }
            if (triggerPrice !== undefined) {
                request['stop_price'] = this.priceToPrecision(symbol, triggerPrice);
                delete orderParams['triggerPrice'];
            }
            if (type === 'INSTANT') {
                request['amount'] = this.priceToPrecision(symbol, this.safeString(order, 'amount'));
            }
            else {
                request['quantity'] = this.amountToPrecision(symbol, this.safeString(order, 'amount'));
            }
            if (type === 'LIMIT' || type === 'STOP_LIMIT') {
                request['price'] = this.priceToPrecision(symbol, this.safeString(order, 'price'));
            }
            ordersRequests.push(this.extend(request, orderParams));
        }
        const createOrdersRequest = { 'data': ordersRequests };
        const response = await this.v3PrivatePostOrdersBatch(this.extend(createOrdersRequest, params));
        // {
        //     "data": [
        //         {
        //         "side": "BUY",
        //         "type": "LIMIT",
        //         "market_symbol": "btcbrl",
        //         "client_order_id": "451637946501",
        //         "remark": "A remarkable note for the order.",
        //         "quantity": "0.42",
        //         "price": "250000.0",
        //         "post_only": true,
        //         "time_in_force": "GTC"
        //         }
        //     ]
        // }
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data);
    }
    /**
     * @method
     * @name foxbit#cancelOrder
     * @description Cancel open orders.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_cancel
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'id': this.parseNumber(id),
            'type': 'ID',
        };
        const response = await this.v3PrivatePutOrdersCancel(this.extend(request, params));
        // {
        //     "data": [
        //         {
        //         "sn": "OKMAKSDHRVVREK",
        //         "id": 123456789
        //         }
        //     ]
        // }
        const data = this.safeList(response, 'data', []);
        const result = this.safeDict(data, 0, {});
        return this.parseOrder(result);
    }
    /**
     * @method
     * @name foxbit#cancelAllOrders
     * @description Cancel all open orders or all open orders for a specific market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_cancel
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'type': 'ALL',
        };
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['type'] = 'MARKET';
            request['market_symbol'] = market['id'];
        }
        const response = await this.v3PrivatePutOrdersCancel(this.extend(request, params));
        // {
        //     "data": [
        //         {
        //           "sn": "OKMAKSDHRVVREK",
        //           "id": 123456789
        //         }
        //     ]
        // }
        return [this.safeOrder({
                'info': response,
            })];
    }
    /**
     * @method
     * @name foxbit#fetchOrder
     * @description Get an order by ID.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_findByOrderId
     * @param id
     * @param {string} symbol it is not used in the foxbit API
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'id': id,
        };
        const response = await this.v3PrivateGetOrdersByOrderIdId(this.extend(request, params));
        // {
        //     "id": "1234567890",
        //     "sn": "OKMAKSDHRVVREK",
        //     "client_order_id": "451637946501",
        //     "market_symbol": "btcbrl",
        //     "side": "BUY",
        //     "type": "LIMIT",
        //     "state": "ACTIVE",
        //     "price": "290000.0",
        //     "price_avg": "295333.3333",
        //     "quantity": "0.42",
        //     "quantity_executed": "0.41",
        //     "instant_amount": "290.0",
        //     "instant_amount_executed": "290.0",
        //     "created_at": "2021-02-15T22:06:32.999Z",
        //     "trades_count": "2",
        //     "remark": "A remarkable note for the order.",
        //     "funds_received": "290.0"
        // }
        return this.parseOrder(response, undefined);
    }
    /**
     * @method
     * @name foxbit#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_listOrders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.state] Enum: ACTIVE, CANCELED, FILLED, PARTIALLY_CANCELED, PARTIALLY_FILLED
     * @param {string} [params.side] Enum: BUY, SELL
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market_symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
            if (limit > 100) {
                request['page_size'] = 100;
            }
        }
        const response = await this.v3PrivateGetOrders(this.extend(request, params));
        // {
        //     "data": [
        //         {
        //         "id": "1234567890",
        //         "sn": "OKMAKSDHRVVREK",
        //         "client_order_id": "451637946501",
        //         "market_symbol": "btcbrl",
        //         "side": "BUY",
        //         "type": "LIMIT",
        //         "state": "ACTIVE",
        //         "price": "290000.0",
        //         "price_avg": "295333.3333",
        //         "quantity": "0.42",
        //         "quantity_executed": "0.41",
        //         "instant_amount": "290.0",
        //         "instant_amount_executed": "290.0",
        //         "created_at": "2021-02-15T22:06:32.999Z",
        //         "trades_count": "2",
        //         "remark": "A remarkable note for the order.",
        //         "funds_received": "290.0"
        //         }
        //     ]
        // }
        const list = this.safeList(response, 'data', []);
        return this.parseOrders(list, market, since, limit);
    }
    /**
     * @method
     * @name foxbit#fetchMyTrades
     * @description Trade history queries will only have data available for the last 3 months, in descending order (most recents trades first).
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/TradesController_all
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_symbol': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
            if (limit > 100) {
                request['page_size'] = 100;
            }
        }
        const response = await this.v3PrivateGetTrades(this.extend(request, params));
        // {
        //     "data": [
        //         "id": 1234567890,
        //         "sn": "TC5JZVW2LLJ3IW",
        //         "order_id": 1234567890,
        //         "market_symbol": "btcbrl",
        //         "side": "BUY",
        //         "price": "290000.0",
        //         "quantity": "1.0",
        //         "fee": "0.01",
        //         "fee_currency_symbol": "btc",
        //         "created_at": "2021-02-15T22:06:32.999Z"
        //     ]
        // }
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    /**
     * @method
     * @name foxbit#fetchDepositAddress
     * @description Fetch the deposit address for a currency associated with this account.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Deposit/operation/DepositsController_depositAddress
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.networkCode] the blockchain network to create a deposit address on
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency_symbol': currency['id'],
        };
        const [networkCode, paramsOmited] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['network_code'] = this.networkCodeToId(networkCode, code);
        }
        const response = await this.v3PrivateGetDepositsAddress(this.extend(request, paramsOmited));
        // {
        //     "currency_symbol": "btc",
        //     "address": "2N9sS8LgrY19rvcCWDmE1ou1tTVmqk4KQAB",
        //     "message": "Address was retrieved successfully",
        //     "destination_tag": "string",
        //     "network": {
        //         "name": "Bitcoin Network",
        //         "code": "btc"
        //     }
        // }
        return this.parseDepositAddress(response, currency);
    }
    /**
     * @method
     * @name foxbit#fetchDeposits
     * @description Fetch all deposits made to an account.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Deposit/operation/DepositsController_listOrders
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
            if (limit > 100) {
                request['page_size'] = 100;
            }
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        const response = await this.v3PrivateGetDeposits(this.extend(request, params));
        // {
        //     "data": [
        //         {
        //             "sn": "OKMAKSDHRVVREK",
        //             "state": "ACCEPTED",
        //             "currency_symbol": "btc",
        //             "amount": "1.0",
        //             "fee": "0.1",
        //             "created_at": "2022-02-18T22:06:32.999Z",
        //             "details_crypto": {
        //                 "transaction_id": "e20f035387020c5d5ea18ad53244f09f3",
        //                 "receiving_address": "2N2rTrnKEFcyJjEJqvVjgWZ3bKvKT7Aij61"
        //             }
        //         }
        //     ]
        // }
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit);
    }
    /**
     * @method
     * @name foxbit#fetchWithdrawals
     * @description Fetch all withdrawals made from an account.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Withdrawal/operation/WithdrawalsController_listWithdrawals
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
            if (limit > 100) {
                request['page_size'] = 100;
            }
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        const response = await this.v3PrivateGetWithdrawals(this.extend(request, params));
        // {
        //     "data": [
        //         {
        //             "sn": "OKMAKSDHRVVREK",
        //             "state": "ACCEPTED",
        //             "rejection_reason": "monthly_limit_exceeded",
        //             "currency_symbol": "btc",
        //             "amount": "1.0",
        //             "fee": "0.1",
        //             "created_at": "2022-02-18T22:06:32.999Z",
        //             "details_crypto": {
        //                 "transaction_id": "e20f035387020c5d5ea18ad53244f09f3",
        //                 "destination_address": "2N2rTrnKEFcyJjEJqvVjgWZ3bKvKT7Aij61"
        //             },
        //             "details_fiat": {
        //                 "bank": {
        //                     "code": "1",
        //                     "branch": {
        //                         "number": "1234567890",
        //                         "digit": "1"
        //                     },
        //                     "account": {
        //                         "number": "1234567890",
        //                         "digit": "1",
        //                         "type": "CHECK"
        //                     }
        //                 }
        //             }
        //         }
        //     ]
        // }
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit);
    }
    /**
     * @method
     * @name foxbit#fetchTransactions
     * @description Fetch all transactions (deposits and withdrawals) made from an account.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Withdrawal/operation/WithdrawalsController_listWithdrawals
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Deposit/operation/DepositsController_listOrders
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchTransactions(code = undefined, since = undefined, limit = undefined, params = {}) {
        const withdrawals = await this.fetchWithdrawals(code, since, limit, params);
        const deposits = await this.fetchDeposits(code, since, limit, params);
        const allTransactions = this.arrayConcat(withdrawals, deposits);
        const result = this.sortBy(allTransactions, 'timestamp');
        return result;
    }
    /**
     * @method
     * @name foxbit#fetchStatus
     * @description The latest known information on the availability of the exchange API.
     * @see https://status.foxbit.com/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.statusPublicGetStatus(params);
        // {
        //     "data": {
        //       "id": 1,
        //       "attributes": {
        //         "status": "NORMAL",
        //         "createdAt": "2023-05-17T18:37:05.934Z",
        //         "updatedAt": "2024-04-17T02:33:50.945Z",
        //         "publishedAt": "2023-05-17T18:37:07.653Z",
        //         "locale": "pt-BR"
        //       }
        //     },
        //     "meta": {
        //     }
        // }
        const data = this.safeDict(response, 'data', {});
        const attributes = this.safeDict(data, 'attributes', {});
        const statusRaw = this.safeString(attributes, 'status');
        const statusMap = {
            'NORMAL': 'ok',
            'UNDER_MAINTENANCE': 'maintenance',
        };
        return {
            'status': this.safeString(statusMap, statusRaw, statusRaw),
            'updated': this.safeString(attributes, 'updatedAt'),
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name foxbit#editOrder
     * @description Simultaneously cancel an existing order and create a new one.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_cancelReplace
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders, used as stop_price on stop market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires a symbol argument');
        }
        type = type.toUpperCase();
        if (type !== 'LIMIT' && type !== 'MARKET' && type !== 'STOP_MARKET' && type !== 'INSTANT') {
            throw new errors.InvalidOrder('Invalid order type: ' + type + '. Must be one of: LIMIT, MARKET, STOP_MARKET, INSTANT.');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'mode': 'ALLOW_FAILURE',
            'cancel': {
                'type': 'ID',
                'id': this.parseNumber(id),
            },
            'create': {
                'type': type,
                'side': side.toUpperCase(),
                'market_symbol': market['id'],
            },
        };
        if (type === 'LIMIT' || type === 'MARKET') {
            request['create']['quantity'] = this.amountToPrecision(symbol, amount);
            if (type === 'LIMIT') {
                request['create']['price'] = this.priceToPrecision(symbol, price);
            }
        }
        if (type === 'STOP_MARKET') {
            request['create']['stop_price'] = this.priceToPrecision(symbol, price);
            request['create']['quantity'] = this.amountToPrecision(symbol, amount);
        }
        if (type === 'INSTANT') {
            request['create']['amount'] = this.priceToPrecision(symbol, amount);
        }
        const response = await this.v3PrivatePostOrdersCancelReplace(this.extend(request, params));
        // {
        //     "cancel": {
        //         "id": 123456789
        //     },
        //     "create": {
        //         "id": 1234567890,
        //         "client_order_id": "451637946501"
        //     }
        // }
        return this.parseOrder(response['create'], market);
    }
    /**
     * @method
     * @name foxbit#withdraw
     * @description Make a withdrawal.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Withdrawal/operation/WithdrawalsController_createWithdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency_symbol': currency['id'],
            'amount': this.numberToString(amount),
            'destination_address': address,
        };
        if (tag !== undefined) {
            request['destination_tag'] = tag;
        }
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['network_code'] = this.networkCodeToId(networkCode);
        }
        const response = await this.v3PrivatePostWithdrawals(this.extend(request, params));
        // {
        //     "amount": "2",
        //     "currency_symbol": "xrp",
        //     "network_code": "ripple",
        //     "destination_address": "0x1234567890123456789012345678",
        //     "destination_tag": "123456"
        // }
        return this.parseTransaction(response);
    }
    /**
     * @method
     * @name foxbit#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Account/operation/AccountsController_getTransactions
     * @param {string} code unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entrys to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-structure}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchLedger() requires a code argument');
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
            if (limit > 100) {
                request['page_size'] = 100;
            }
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        const currency = this.currency(code);
        request['symbol'] = currency['id'];
        const response = await this.v3PrivateGetAccountsSymbolTransactions(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseLedger(data, currency, since, limit);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'symbol');
        const baseAssets = this.safeDict(market, 'base');
        const baseId = this.safeString(baseAssets, 'symbol');
        const quoteAssets = this.safeDict(market, 'quote');
        const quoteId = this.safeString(quoteAssets, 'symbol');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = base + '/' + quote;
        const fees = this.safeDict(market, 'default_fees');
        return this.safeMarketStructure({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': true,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'future': false,
            'swap': false,
            'option': false,
            'contract': false,
            'settle': undefined,
            'settleId': undefined,
            'contractSize': undefined,
            'linear': undefined,
            'inverse': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': this.safeNumber(fees, 'taker'),
            'maker': this.safeNumber(fees, 'maker'),
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': {
                'price': this.safeInteger(quoteAssets, 'precision'),
                'amount': this.safeInteger(baseAssets, 'precision'),
                'cost': this.safeInteger(quoteAssets, 'precision'),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber(market, 'quantity_min'),
                    'max': undefined,
                },
                'price': {
                    'min': this.safeNumber(market, 'price_min'),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': market,
        });
    }
    parseTradingFee(entry, market = undefined) {
        return {
            'info': entry,
            'symbol': market['symbol'],
            'maker': this.safeNumber(entry, 'maker'),
            'taker': this.safeNumber(entry, 'taker'),
            'percentage': true,
            'tierBased': true,
        };
    }
    parseTicker(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 'market_symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, 'spot');
        const rolling_24h = ticker['rolling_24h'];
        const best = this.safeDict(ticker, 'best');
        const bestAsk = this.safeDict(best, 'ask');
        const bestBid = this.safeDict(best, 'bid');
        const lastTrade = ticker['last_trade'];
        const lastPrice = this.safeString(lastTrade, 'price');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': this.parseDate(this.safeString(lastTrade, 'date')),
            'datetime': this.iso8601(this.parseDate(this.safeString(lastTrade, 'date'))),
            'high': this.safeNumber(rolling_24h, 'high'),
            'low': this.safeNumber(rolling_24h, 'low'),
            'bid': this.safeNumber(bestBid, 'price'),
            'bidVolume': this.safeNumber(bestBid, 'volume'),
            'ask': this.safeNumber(bestAsk, 'price'),
            'askVolume': this.safeNumber(bestAsk, 'volume'),
            'vwap': undefined,
            'open': this.safeNumber(rolling_24h, 'open'),
            'close': lastPrice,
            'last': lastPrice,
            'previousClose': undefined,
            'change': this.safeString(rolling_24h, 'price_change'),
            'percentage': this.safeString(rolling_24h, 'price_change_percent'),
            'average': undefined,
            'baseVolume': this.safeString(rolling_24h, 'volume'),
            'quoteVolume': this.safeString(rolling_24h, 'quote_volume'),
            'info': ticker,
        }, market);
    }
    parseOHLCV(ohlcv, market = undefined) {
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 6),
        ];
    }
    parseTrade(trade, market = undefined) {
        const timestamp = this.parseDate(this.safeString(trade, 'created_at'));
        const price = this.safeString(trade, 'price');
        const amount = this.safeString(trade, 'volume', this.safeString(trade, 'quantity'));
        const privateSideField = this.safeStringLower(trade, 'side');
        const side = this.safeStringLower(trade, 'taker_side', privateSideField);
        const cost = Precise["default"].stringMul(price, amount);
        const fee = {
            'currency': this.safeSymbol(this.safeString(trade, 'fee_currency_symbol')),
            'cost': this.safeNumber(trade, 'fee'),
            'rate': undefined,
        };
        return this.safeTrade({
            'id': this.safeString(trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'PARTIALLY_CANCELED': 'open',
            'ACTIVE': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'PENDING_CANCEL': 'canceled',
            'CANCELED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        let symbol = this.safeString(order, 'market_symbol');
        if (market === undefined && symbol !== undefined) {
            market = this.market(symbol);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parseDate(this.safeString(order, 'created_at'));
        const price = this.safeString(order, 'price');
        const filled = this.safeString(order, 'quantity_executed');
        const remaining = this.safeString(order, 'quantity');
        // TODO: validate logic of amount here, should this be calculated?
        let amount = undefined;
        if (remaining !== undefined && filled !== undefined) {
            amount = Precise["default"].stringAdd(remaining, filled);
        }
        let cost = this.safeString(order, 'funds_received');
        if (!cost) {
            const priceAverage = this.safeString(order, 'price_avg');
            const priceToCalculate = this.safeString(order, 'price', priceAverage);
            cost = Precise["default"].stringMul(priceToCalculate, amount);
        }
        const side = this.safeStringLower(order, 'side');
        let feeCurrency = this.safeStringUpper(market, 'quoteId');
        if (side === 'buy') {
            feeCurrency = this.safeStringUpper(market, 'baseId');
        }
        return this.safeOrder({
            'id': this.safeString(order, 'id'),
            'info': order,
            'clientOrderId': this.safeString(order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus(this.safeString(order, 'state')),
            'symbol': this.safeString(market, 'symbol'),
            'type': this.safeString(order, 'type'),
            'timeInForce': this.safeString(order, 'time_in_force'),
            'postOnly': this.safeBool(order, 'post_only'),
            'reduceOnly': undefined,
            'side': side,
            'price': this.parseNumber(price),
            'triggerPrice': this.safeNumber(order, 'stop_price'),
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'cost': this.parseNumber(cost),
            'average': this.safeNumber(order, 'price_avg'),
            'amount': this.parseNumber(amount),
            'filled': this.parseNumber(filled),
            'remaining': this.parseNumber(remaining),
            'trades': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': this.safeNumber(order, 'fee_paid'),
            },
        });
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        const network = this.safeDict(depositAddress, 'network');
        const networkId = this.safeString(network, 'code');
        const currencyCode = this.safeCurrencyCode(undefined, currency);
        const unifiedNetwork = this.networkIdToCode(networkId, currencyCode);
        return {
            'address': this.safeString(depositAddress, 'address'),
            'tag': this.safeString(depositAddress, 'tag'),
            'currency': currencyCode,
            'network': unifiedNetwork,
            'info': depositAddress,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            // BOTH
            'SUBMITTING': 'pending',
            'SUBMITTED': 'pending',
            'REJECTED': 'failed',
            // DEPOSIT-SPECIFIC
            'CANCELLED': 'canceled',
            'ACCEPTED': 'ok',
            'WARNING': 'pending',
            'UNBLOCKED': 'pending',
            'BLOCKED': 'pending',
            // WITHDRAWAL-SPECIFIC
            'PROCESSING': 'pending',
            'CANCELED': 'canceled',
            'FAILED': 'failed',
            'DONE': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined, since = undefined, limit = undefined) {
        const cryptoDetails = this.safeDict(transaction, 'details_crypto');
        const address = this.safeString2(cryptoDetails, 'receiving_address', 'destination_address');
        const sn = this.safeString(transaction, 'sn');
        let type = 'withdrawal';
        if (sn !== undefined && sn[0] === 'D') {
            type = 'deposit';
        }
        const fee = this.safeString(transaction, 'fee', '0');
        const amount = this.safeString(transaction, 'amount');
        const currencySymbol = this.safeString(transaction, 'currency_symbol');
        let actualAmount = amount;
        const currencyCode = this.safeCurrencyCode(currencySymbol);
        const status = this.parseTransactionStatus(this.safeString(transaction, 'state'));
        const created_at = this.safeString(transaction, 'created_at');
        const timestamp = this.parseDate(created_at);
        const datetime = this.iso8601(timestamp);
        if (fee !== undefined && amount !== undefined) {
            // actualAmount = amount - fee;
            actualAmount = Precise["default"].stringSub(amount, fee);
        }
        const feeRate = Precise["default"].stringDiv(fee, actualAmount);
        const feeObj = {
            'cost': this.parseNumber(fee),
            'currency': currencyCode,
            'rate': this.parseNumber(feeRate),
        };
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'sn'),
            'txid': this.safeString(cryptoDetails, 'transaction_id'),
            'timestamp': timestamp,
            'datetime': datetime,
            'network': this.safeString(transaction, 'network_code'),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': this.safeString(transaction, 'destination_tag'),
            'tagTo': this.safeString(transaction, 'destination_tag'),
            'tagFrom': undefined,
            'type': type,
            'amount': this.parseNumber(amount),
            'currency': currencyCode,
            'status': status,
            'updated': undefined,
            'fee': feeObj,
            'comment': undefined,
            'internal': undefined,
        };
    }
    parseLedgerEntryType(type) {
        const types = {
            'DEPOSITING': 'transaction',
            'WITHDRAWING': 'transaction',
            'TRADING': 'trade',
            'INTERNAL_TRANSFERING': 'transfer',
            'OTHERS': 'transaction',
        };
        return this.safeString(types, type, type);
    }
    parseLedgerEntry(item, currency = undefined) {
        // {
        //     "uuid": "f8e9f2d6-3c1e-4f2d-8f8e-9f2d6c1e4f2d",
        //     "amount": "0.0001",
        //     "balance": "0.0002",
        //     "created_at": "2021-07-01T12:00:00Z",
        //     "currency_symbol": "btc",
        //     "fee": "0.0001",
        //     "locked": "0.0001",
        //     "locked_amount": "0.0001",
        //     "reason_type": "DEPOSITING"
        // }
        const id = this.safeString(item, 'uuid');
        const createdAt = this.safeString(item, 'created_at');
        const timestamp = this.parse8601(createdAt);
        const reasonType = this.safeString(item, 'reason_type');
        const type = this.parseLedgerEntryType(reasonType);
        const exchangeSymbol = this.safeString(item, 'currency_symbol');
        const currencySymbol = this.safeCurrencyCode(exchangeSymbol);
        let direction = 'in';
        const amount = this.safeNumber(item, 'amount');
        let realAmount = amount;
        const balance = this.safeNumber(item, 'balance');
        const fee = {
            'cost': this.safeNumber(item, 'fee'),
            'currency': currencySymbol,
        };
        if (amount < 0) {
            direction = 'out';
            realAmount = amount * -1;
        }
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': currencySymbol,
            'amount': realAmount,
            'before': balance - amount,
            'after': balance,
            'status': 'ok',
            'fee': fee,
        };
    }
    sign(path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = api[0];
        let urlPath = api[1];
        let fullPath = '/rest/' + version + '/' + this.implodeParams(path, params);
        if (version === 'status') {
            fullPath = '/status';
            urlPath = 'status';
        }
        let url = this.urls['api'][urlPath] + fullPath;
        params = this.omit(params, this.extractParams(path));
        const timestamp = this.milliseconds();
        let query = '';
        let signatureQuery = '';
        if (method === 'GET') {
            const paramKeys = Object.keys(params);
            const paramKeysLength = paramKeys.length;
            if (paramKeysLength > 0) {
                query = this.urlencode(params);
                url += '?' + query;
            }
            for (let i = 0; i < paramKeys.length; i++) {
                const key = paramKeys[i];
                const value = this.safeString(params, key);
                if (value !== undefined) {
                    signatureQuery += key + '=' + value;
                }
                if (i < paramKeysLength - 1) {
                    signatureQuery += '&';
                }
            }
        }
        if (method === 'POST' || method === 'PUT') {
            body = this.json(params);
        }
        let bodyToSignature = '';
        if (body !== undefined) {
            bodyToSignature = body;
        }
        headers = {
            'Content-Type': 'application/json',
        };
        if (urlPath === 'private') {
            this.checkRequiredCredentials();
            const preHash = this.numberToString(timestamp) + method + fullPath + signatureQuery + bodyToSignature;
            const signature = this.hmac(this.encode(preHash), this.encode(this.secret), sha256.sha256, 'hex');
            headers['X-FB-ACCESS-KEY'] = this.apiKey;
            headers['X-FB-ACCESS-TIMESTAMP'] = this.numberToString(timestamp);
            headers['X-FB-ACCESS-SIGNATURE'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeDict(response, 'error');
        const code = this.safeString(error, 'code');
        const details = this.safeList(error, 'details');
        const message = this.safeString(error, 'message');
        let detailsString = '';
        if (details) {
            for (let i = 0; i < details.length; i++) {
                detailsString = detailsString + details[i] + ' ';
            }
        }
        if (error !== undefined) {
            const feedback = this.id + ' ' + message + ' details: ' + detailsString;
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], detailsString, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
}

exports["default"] = foxbit;
