
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitkonan.js';
import { AccountSuspended, ArgumentsRequired, BadRequest, ExchangeError, InsufficientFunds, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { Int, OrderSide, OrderType } from './base/types.js';
import { TICK_SIZE } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitkonan
 * @extends Exchange
 */
export default class bitkonan extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitkonan',
            'name': 'Bitkonan',
            'countries': [ 'HR' ], // Croatia
            'rateLimit': 1000,
            'hostname': 'www.bitkonan.com',
            'precisionMode': TICK_SIZE,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': 'emulated',
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': undefined,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'api': {
                    'trade': 'https://{hostname}',
                    'market': 'https://{hostname}',
                    'chart': 'https://{hostname}',
                },
                'www': 'https://{hostname}',
                'doc': 'https://{hostname}/api-docs',
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '8h': '28800',
                '12h': '43200',
                '1d': '86400',
            },
            'api': {
                'trade': {
                    'private': {
                        'get': [
                            'orders/my',
                            'order_history',
                            'trade_history',
                            'assets',
                            'trade_fees',
                            'wallet/transfers',
                            'wallet/deposit',
                            'wallet/limits',
                        ],
                        'post': [
                            'order',
                            'wallet/withdrawal',
                        ],
                        'delete': [
                            'orders',
                            'orders/{id}',
                        ],
                    },
                    'public': {
                        'get': [
                            'info',
                            'assets-info',
                            'wallet/payment_systems',
                        ],
                    },
                },
                'market': {
                    'public': {
                        'get': [
                            'v2/marketdata/assets',
                            'v2/marketdata/ticker',
                            'v2/marketdata/ticker/{instrument}',
                            'v2/marketdata/trades/{instrument}',
                            'v2/marketdata/depth/{instrument}',
                        ],
                    },
                },
                'chart': {
                    'public': {
                        'get': [
                            'instruments/{instrument}/history',
                        ],
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'networksById': {
                    'Bitcoin': 'BTC',
                    'Ethereum': 'ERC20',
                    'BitcoinCash': 'BCH',
                    'Litecoin': 'LTC',
                    'Ripple': 'RIPPLE',
                },
                'networks': {
                    'BTC': 'Bitcoin',
                    'ETH': 'Ethereum',
                    'ERC20': 'Ethereum',
                    'BCH': 'BitcoinCash',
                    'LTC': 'Litecoin',
                    'RIPPLE': 'Ripple',
                },
                'defaultNetworks': {
                    'BTC': 'BTC',
                    'ETH': 'ERC20',
                    'USDT': 'ERC20',
                    'LTC': 'LTC',
                    'XRP': 'RIPPLE',
                },
            },
            'exceptions': {
                'exact': {
                    // general errors
                    '10000': ExchangeError, // 500, Unexpected error
                    '10001': BadRequest, // 400, Bad request
                    '10002': ExchangeError, // 404, Object not found
                    '10003': ExchangeError, // 409, Object already exists
                    '10005': PermissionDenied, // 403, Invalid X-Auth header parameters
                    '10006': RateLimitExceeded, // 429, Too many requests
                    '10007': RateLimitExceeded, // 429, WS connection limit reached
                    // spot errors
                    '30000': ExchangeError, // 404, Market not found
                    '30001': ExchangeError, // 400, Market not open for trading
                    '30002': ExchangeError, // 400, Market data is not ready for trading
                    '30003': ExchangeError, // 400, Market is currently unavailable
                    '30100': InsufficientFunds, // 400, Not enough funds
                    '30200': AccountSuspended, // 400, Account terminated
                    '30500': ExchangeError, // 400, Order is rejected
                    '30501': ExchangeError, // 400, Open orders limit reached
                    '30502': BadRequest, // 400, Account not found
                    '30600': ExchangeError, // 400, Failed to create transfer
                    '30601': ExchangeError, // 400, Transfer disabled for wallet
                    '30900': ExchangeError, // 500, Account db overloaded
                    // user errors
                    '50007': ExchangeError, // 400, Request allready processed
                    '50100': PermissionDenied, // 400, Insufficient KYC level
                    '50101': ExchangeError, // 400, Withdrawal limit reached
                    '50102': PermissionDenied, // 400 Company verification missing
                },
                'broad': {},
            },
        });
    }

    parseBalance (response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['locked'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitkonan#fetchMarkets
         * @description retrieves data on all markets for bitkonan
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.tradePublicGetInfo (params);
        const markets = this.safeValue (response, 'pairs', {});
        const marketIds = Object.keys (markets);
        // {
        //   "serverTime": 638241680574954844,
        //   "pairs": {
        //     "btc_usdt": {
        //       "baseAsset": "btc",
        //       "quoteAsset": "usdt",
        //       "minPrice": 0.0,
        //       "maxPrice": 0.0,
        //       "minAmount": 0.0,
        //       "maxAmount": 0.0,
        //       "minTotalAmount": 0.0,
        //       "maxTotalAmount": 0.0,
        //       "makerFee": 0.0,
        //       "takerFee": 0.001,
        //       "priceScale": 6,
        //       "amountScale": 6,
        //       "labels": [
        //         "BTC",
        //         "USDT"
        //       ],
        //       "status": "Open"
        //     }
        //   }
        // }
        const result = [];
        for (let i = 0; i < marketIds.length; i++) {
            const id = marketIds[i];
            const market = markets[id];
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            result.push ({
                'id': id,
                'symbol': id,
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
                'active': (status === 'Open'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'amountScale'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'priceScale'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minAmount'),
                        'max': this.safeNumber (market, 'maxAmount'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'minPrice'),
                        'max': this.safeNumber (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minTotalAmount'),
                        'max': this.safeNumber (market, 'maxTotalAmount'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitkonan#fetchCurrencies
         * @description fetches all available assets on an exchange
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const promisesUnresolved = [
            this.tradePublicGetAssetsInfo (params),
            this.tradePublicGetWalletPaymentSystems (params),
        ];
        const promises = await Promise.all (promisesUnresolved);
        const currenciesResponse = promises[0];
        const paymentSystemsResponse = promises[1];
        const currencies = this.safeValue (currenciesResponse, 'data', []);
        const paymentSystems = this.safeValue (paymentSystemsResponse, 'data', []);
        const paymentSystemsByAssetId = this.groupBy (paymentSystems, 'assetId');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'asset_name');
            const scale = this.safeString (currency, 'scale');
            const precision = this.parseNumber (this.parsePrecision (scale));
            const withdrawEnabled = this.safeValue (currency, 'can_withdraw');
            const depositEnabled = this.safeValue (currency, 'can_deposit');
            const active = withdrawEnabled && depositEnabled;
            const currencyPaymentSystems = this.safeValue (paymentSystemsByAssetId, id, []);
            const networks = {};
            for (let j = 0; i < currencyPaymentSystems.length; j++) {
                const paymentSystem = currencyPaymentSystems[j];
                const networkId = this.safeString (paymentSystem, 'paymentSystem');
                const network = this.networkIdToCode (networkId);
                const depositConfig = this.safeValue (paymentSystem, 'deposit', {});
                let networkDepositEnabled = this.safeValue (depositConfig, 'enabled', false);
                networkDepositEnabled = networkDepositEnabled && depositEnabled;
                const withdrawalConfig = this.safeValue (paymentSystem, 'withdrawal', {});
                let networkWithdrawEnabled = this.safeValue (withdrawalConfig, 'enabled', false);
                networkWithdrawEnabled = networkWithdrawEnabled && withdrawEnabled;
                const active = networkDepositEnabled && networkWithdrawEnabled;
                const withdrawalFee = this.safeNumber (withdrawalConfig, 'percentFee', 0);
                networks[network] = {
                    'info': paymentSystem,
                    'id': networkId,
                    'network': networkId,
                    'active': active,
                    'deposit': networkDepositEnabled,
                    'withdraw': networkWithdrawEnabled,
                    'fee': withdrawalFee,
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'info': currency,
                'active': active,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'min_withdraw'),
                        'max': undefined,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitkonan#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.tradePrivateGetAssets (params);
        //
        // [
        //     ...
        //     {
        //         "asset": "btc",
        //         "balance": 0.522,
        //         "locked": 0.2
        //     }
        // ]
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.marketPublicGetV2MarketdataDepthInstrument (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "instrument": "btc_usdt",
        //         "start": "2023-07-17T12:30:00Z",
        //         "end": "2023-07-17T12:31:00Z",
        //         "low": 30193.90000000,
        //         "high": 30193.90000000,
        //         "volume": 0.00000000,
        //         "open": 30193.90000000,
        //         "close": 30193.90000000
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (ohlcv, 'start'));
        return [
            timestamp,
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 1000;
        }
        const durationInSeconds = this.parseTimeframe (timeframe);
        const duration = durationInSeconds * limit;
        const request = {
            'instrument': market['id'],
            'type': this.safeString (this.timeframes, timeframe, timeframe),
            'count': limit,
        };
        if (since === undefined) {
            const now = this.milliseconds ();
            request['endDate'] = this.iso8601 (now);
            request['startDate'] = this.iso8601 (now - limit * duration);
        } else {
            request['startDate'] = this.iso8601 (since);
            request['endDate'] = this.iso8601 (this.sum (since, limit * duration));
        }
        const response = await this.chartPublicGetInstrumentsInstrumentHistory (this.extend (request, params));
        const history = this.safeValue (response, 'data');
        //
        //  {
        //      "success": true,
        //      "instrument": "btc_usdt",
        //      "data": [
        //          {
        //              "instrument": "btc_usdt",
        //              "start": "2023-07-17T12:30:00Z",
        //              "end": "2023-07-17T12:31:00Z",
        //              "low": 30193.90000000,
        //              "high": 30193.90000000,
        //              "volume": 0.00000000,
        //              "open": 30193.90000000,
        //              "close": 30193.90000000
        //          },
        //          ...
        //      ],
        //      "startDateTime": "2023-07-17T12:30:00Z",
        //      "endDateTime": "2023-07-17T13:31:00Z"
        //  }
        //
        return this.parseOHLCVs (history, market, timeframe, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        //     {
        //         "instrument": "matic_btc",
        //         "start": "2023-07-17T12:30:18Z",
        //         "end": "2023-07-18T12:30:18.9592475Z",
        //         "low": 0.00002426,
        //         "high": 0.00002426,
        //         "volume": 0.0,
        //         "open": 0.00002426,
        //         "close": 0.00002426
        //     }
        const timestamp = this.safeString (ticker, 'start');
        const marketId = this.safeString (ticker, 'instrument');
        const symbol = this.safeSymbol (marketId, market, '_');
        const last = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.marketPublicGetV2MarketdataTicker (params);
        //
        // [
        //     {
        //         "instrument": "matic_btc",
        //         "start": "2023-07-17T12:30:18Z",
        //         "end": "2023-07-18T12:30:18.9592475Z",
        //         "low": 0.00002426,
        //         "high": 0.00002426,
        //         "volume": 0.0,
        //         "open": 0.00002426,
        //         "close": 0.00002426
        //     },
        //     {
        //         "instrument": "btc_usdc",
        //         "start": "2023-07-17T12:30:18Z",
        //         "end": "2023-07-18T12:30:18.9592475Z",
        //         "low": 29822.01,
        //         "high": 30267.60,
        //         "volume": 0.09164,
        //         "open": 30225.79,
        //         "close": 29822.01
        //     }
        // ]
        //
        return this.filterByArray (response, 'instrument', symbols);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let instrument = market['id'];
        instrument = instrument.toLowerCase ();
        const request = {
            'instrument': instrument,
        };
        const response = await this.marketPublicGetV2MarketdataTickerInstrument (this.extend (request, params));
        //
        //     {
        //         "instrument": "matic_btc",
        //         "start": "2023-07-17T12:30:18Z",
        //         "end": "2023-07-18T12:30:18.9592475Z",
        //         "low": 0.00002426,
        //         "high": 0.00002426,
        //         "volume": 0.0,
        //         "open": 0.00002426,
        //         "close": 0.00002426
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //  {
        //      "tradeId": 2715398632,
        //      "tradeTime": "2023-07-18T07:52:09.389965Z",
        //      "amount": 0.00125,
        //      "executionPrice": 29972.09,
        //      "instrument": "btc_usdt",
        //      "side": 0
        //  }
        //
        //
        // public fetchMyTrades
        //
        //  {
        //      "tradeSeq": 12344,
        //      "tradeTime": "2023-07-13T10:07:58.906442Z",
        //      "amount": 0.5,
        //      "quoteAmount": 846.66,
        //      "remaining": 0.0,
        //      "executionPrice": 1693.32,
        //      "instrument": "eth_eur",
        //      "side": 0,
        //      "commission": 0.0025,
        //      "commissionAssetId": "eth",
        //      "orderId": "f3f1e66b-71f3-466c-b1e9-c635085916bd",
        //      "transactionId": 12344
        //  }
        //
        const tradeId = this.safeString2 (trade, 'tradeId', 'transactionId');
        const orderId = this.safeString (trade, 'orderId');
        const price = this.safeString (trade, 'executionPrice');
        const amount = this.safeString (trade, 'amount');
        const datetime = this.safeString (trade, 'tradeTime');
        const marketId = this.safeString (trade, 'instrument');
        const symbol = this.safeSymbol (marketId, market, '_');
        const side = this.safeNumber (trade, 'side');
        const feeSymbol = this.safeString (trade, 'commissionAssetId');
        const feeAmount = this.safeNumber (trade, 'commission');
        let fee = undefined;
        if (feeSymbol !== undefined && feeAmount !== 0) {
            fee = {
                'currency': feeSymbol,
                'cost': feeAmount,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': tradeId,
            'symbol': symbol,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'order': orderId,
            'type': undefined,
            'side': side === 0 ? 'buy' : 'sell',
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const response = await this.marketPublicGetV2MarketdataTradesInstrument (this.extend (request, params));
        //
        //  [
        //      {
        //          "tradeId": 2715398632,
        //          "tradeTime": "2023-07-18T07:52:09.389965Z",
        //          "amount": 0.00125,
        //          "executionPrice": 29972.09,
        //          "instrument": "btc_usdt",
        //          "side": 0
        //      },...
        //  ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['startDate'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['perPage'] = limit;
        }
        const response = await this.tradePrivateGetTradeHistory (this.extend (request, params));
        // {
        //     "filters": {
        //         "start_date": "2023-07-12T12:20:58.189316Z"
        //     },
        //     "paging": {
        //         "page": 1,
        //         "per_page": 15,
        //         "total": 3
        //     },
        //     "data": [
        //         {
        //             "tradeSeq": 12344,
        //             "tradeTime": "2023-07-13T10:07:58.906442Z",
        //             "amount": 0.5,
        //             "quoteAmount": 846.66,
        //             "remaining": 0.0,
        //             "executionPrice": 1693.32,
        //             "instrument": "eth_eur",
        //             "side": 0,
        //             "commission": 0.0025,
        //             "commissionAssetId": "eth",
        //             "orderId": "f3f1e66b-71f3-466c-b1e9-c635085916bd",
        //             "transactionId": 12344
        //         },...
        //      ]
        //  }
        const tradeHistory = this.safeValue (response, 'data', []);
        return this.parseTrades (tradeHistory, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitkonan#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.tradePrivateGetTradeFees (params);
        const rawFees = this.safeValue (response, 'data', {});
        const fees = this.indexBy (rawFees, 'instrument');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const fee = this.safeValue (fees, symbol, {});
            const maker = this.safeNumber (fee, 'makerFee', 0);
            const taker = this.safeNumber (fee, 'takerFee', 0);
            result[symbol] = {
                'info': fee,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    parseCancelationStrategy (strategy) {
        const strategies = {
            'cancelAggressor': '0',
            'cancelResting': '1',
            'cancelBoth': '2',
        };
        const defaultStrategy = '0';
        return this.safeString (strategies, strategy, defaultStrategy);
    }

    parseOrderStatus (rawOrder, key: string) {
        const status = this.safeString (rawOrder, key);
        const statuses = {
            '0': 'open',
            '1': 'rejected',
            '2': 'canceled',
            '3': 'closed',
            '4': 'canceled',
            '100': 'open',
            '101': 'open',
        };
        return this.safeString (statuses, status);
    }

    parseOrderType (rawOrder, key: string) {
        const typeCode = this.safeString (rawOrder, key);
        const types = {
            '0': 'limit',
            '1': 'market',
            '2': 'stop_limit',
            '3': 'stop_market',
        };
        return this.safeString (types, typeCode);
    }

    parseOrder (order, market = undefined, params = {}) {
        const rawOrder = this.safeValue (order, 'order', order);
        const id = this.safeString (rawOrder, 'orderId');
        const datetime = this.safeString (rawOrder, 'createdAt');
        const side = this.safeString (rawOrder, 'side');
        const marketId = this.safeString (rawOrder, 'instrument');
        const symbol = this.safeSymbol (marketId, market, '_');
        const price = this.safeString (rawOrder, 'price');
        const amount = this.safeString (rawOrder, 'amount');
        const filled = this.safeString (rawOrder, 'unitsFilled');
        const status = this.parseOrderStatus (rawOrder, 'status');
        const type = this.parseOrderType (rawOrder, 'type');
        const stopPrice = this.safeString (rawOrder, 'stopPrice');
        const cost = this.safeString (rawOrder, 'total');
        const rawFees = this.safeValue (rawOrder, 'commissions', {});
        const feeCurrencies = Object.keys (rawFees);
        const fees = [];
        for (let i = 0; i < feeCurrencies.length; i++) {
            const currency = feeCurrencies[i];
            const amount = rawFees[currency];
            fees.push ({
                'currency': currency,
                'cost': amount,
            });
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': false,
            'side': (side === '0' ? 'buy' : 'sell'),
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fees': fees,
            'trades': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const orders = await this.tradePrivateGetOrdersMy ();
        return this.parseOrders (orders, market, since, limit, params);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isLimit = type.indexOf ('limit') >= 0;
        const stopPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        const isStop = stopPrice !== undefined;
        const order = {
            'instrument': market['id'],
            'type': side,
            'isLimit': isLimit,
            'isStop': isStop,
            'useFeeDiscount': true,
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (isLimit) {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price for ' + type + ' orders');
            }
            order['price'] = this.priceToPrecision (symbol, price);
        }
        if (isStop) {
            order['activationPrice'] = stopPrice;
            params = this.omit (params, [ 'stopPrice', 'triggerPrice' ]);
        }
        const selfMatchToken = this.safeString (params, 'selfMatchToken');
        order['selfMatchToken'] = selfMatchToken;
        const selfMatchStrategy = this.safeString (params, 'selfMatchStrategy');
        order['selfMatchStrategy'] = this.parseCancelationStrategy (selfMatchStrategy);
        const request = {
            'order': order,
        };
        const response = await this.tradePrivatePostOrder (this.extend (request, params));
        return this.parseOrder (response, market, params);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol not used by bitkonan cancelOrder ()
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
        };
        const response = await this.tradePrivateDeleteOrdersId (this.extend (request, params));
        return this.parseOrder (response, market, params);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#cancelAllOrders
         * @description cancel all open orders
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.tradePrivateDeleteOrders (this.extend (request, params));
        return response;
    }

    parseTransactionStatus (status) {
        const statuses = {
            'Working': 'pending',
            'Pending': 'pending',
            'Completed': 'ok',
            'Failed': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'Deposit': 'deposit',
            'Withdrawal': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    parseTransaction (transaction, currency = undefined) {
        // {
        //     "id": "b647dcce-c3d8-4c29-8d51-9a4674075fdb",
        //     "asset": "eth",
        //     "paymentSystem": "Ethereum",
        //     "transferId": "Deposit-0x84116e8b7658c31fabc5d417c71d0ffc7ebc13d769bb12fb03ac106d12d02195-0xB4Df7888A66457d5c5E7F7375DF653Fd734532f0",
        //     "originator": "User",
        //     "type": "Deposit",
        //     "status": "Completed",
        //     "amount": 2.0,
        //     "fee": 0.0,
        //     "createdAt": "2023-07-26T13:08:12.905377Z",
        //     "updatedAt": "2023-07-26T13:09:12.88001Z",
        //     "txId": "0x84116e8b7658c31fabc5d417c71d0ffc7ebc13d769bb12fb03ac106d12d02195",
        //     "blockchainLink": "https://etherscan.io/tx/0x84116e8b7658c31fabc5d417c71d0ffc7ebc13d769bb12fb03ac106d12d02195",
        //     "confirmations": 78,
        //     "confirmationsRequired": 30,
        //     "targetInfo": {
        //         "address": "0xB4Df7888A66457d5c5E7F7375DF653Fd734532f0"
        //      }
        // }
        const id = this.safeString (transaction, 'id');
        const currencyId = this.safeString (transaction, 'asset');
        const networkCode = this.safeString (transaction, 'paymentSystem');
        const networkId = this.networkCodeToId (networkCode);
        const currencyCode = this.safeCurrencyCode (currencyId);
        const amount = this.safeNumber (transaction, 'amount');
        const info = this.safeValue (transaction, 'targetInfo');
        const address = this.safeValue (info, 'address');
        const tag = this.safeString (info, 'destination_tag');
        const addressFrom = this.safeString (info, 'beneficiary_address');
        const txid = this.safeString (transaction, 'txId');
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const updated = this.parse8601 (this.safeString (transaction, 'updatedAt'));
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined && feeCost !== 0) {
            fee = {
                'currency': currencyCode,
                'cost': feeCost,
            };
        }
        return {
            'id': id,
            'currency': currencyCode,
            'amount': amount,
            'network': networkId,
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'status': status,
            'type': type,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'updated': updated,
            'fee': fee,
            'info': transaction,
        };
    }

    async fetchTransactions (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchTransactions
         * @deprecated
         * @description use fetchDepositsWithdrawals instead
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch transactions for
         * @param {int} [limit] the maximum number of transaction structures to retrieve
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['assets'] = currency['id'];
        }
        if (since !== undefined) {
            request['startDate'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const transfers = await this.tradePrivateGetWalletTransfers (this.extend (request, params));
        return this.parseTransactions (transfers, currency, since, limit, params);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of transaction structures to retrieve
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {
            'transferType': '0',
        };
        const result = await this.fetchTransactions (code, since, limit, this.extend (request, params));
        return result;
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchWithdrawals
         * @description fetch all withdrawals made to an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of transaction structures to retrieve
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {
            'transferType': '1',
        };
        const result = await this.fetchTransactions (code, since, limit, this.extend (request, params));
        return result;
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name bitkonan#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @param {string} [params.network] network for fetch deposit address
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const currencyId = currency['id'];
        code = this.safeCurrencyCode (currencyId);
        const request = {
            'assetId': currencyId,
        };
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            networkCode = this.defaultNetworkCode (code);
        }
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress requires a network parameter for ' + code + '.');
        }
        const networkId = this.networkCodeToId (networkCode);
        request['paymentSystem'] = networkId;
        const response = await this.tradePrivateGetWalletDeposit (request);
        const info = this.safeValue (response, 'depositInfo', {});
        const address = this.safeString (info, 'address');
        const tag = this.safeString (info, 'destination_tag');
        const responseNetworkId = this.safeString (response, 'paymentSystem', networkId);
        const network = this.networkIdToCode (responseNetworkId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': network,
            'info': response,
        };
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitkonan#withdraw
         * @description make a withdrawal (API key must have whitelisted IP addresses)
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the bitkonan api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        code = this.safeCurrencyCode (code);
        const currency = this.currency (code);
        const accountInfo = {
            'address': address,
        };
        const request = {
            'nonce': this.safeString (params, 'nonce', this.uuid ()),
            'assetId': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        if (tag !== undefined) {
            accountInfo['destination_tag'] = tag;
        }
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            networkCode = this.defaultNetworkCode (code);
        }
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires a network parameter for ' + code + '.');
        }
        request['paymentSystem'] = this.networkCodeToId (networkCode);
        request['accountInfo'] = accountInfo;
        // requires write permission on the wallet
        const response = await this.tradePrivatePostWalletWithdrawal (this.extend (request, params));
        return this.parseTransaction (response, currency);
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const service = api[0];
        const signed = api[1] === 'private';
        const baseUrl = this.implodeHostname (this.urls['api'][service]);
        headers = {};
        let pathAndQs = '';
        if (service === 'trade') {
            pathAndQs = '/frontoffice/api/';
        }
        if (service === 'market') {
            pathAndQs = '/marketdata/api/';
        }
        if (service === 'chart') {
            pathAndQs = '/marketdata/';
        }
        pathAndQs = pathAndQs + this.implodeParams (path, params);
        let contentType = '';
        const query = this.omit (params, this.extractParams (path));
        const getOrDelete = (method === 'GET') || (method === 'DELETE');
        if (getOrDelete) {
            if (Object.keys (query).length) {
                const queryString = this.urlencode (query);
                pathAndQs += '?' + queryString;
            }
        } else if (Object.keys (query).length) {
            body = this.json (query);
            contentType = 'application/json';
            headers['Content-Type'] = contentType;
        }
        if (signed) {
            this.checkRequiredCredentials ();
            const xAuthKey = this.apiKey;
            const now = this.milliseconds ();
            const xAuthTimestamp = this.iso8601 (now);
            headers['X-Auth-Key'] = xAuthKey;
            headers['X-Auth-Timestamp'] = xAuthTimestamp;
            const authVerb = this.encode (method);
            const authPath = this.encode (pathAndQs);
            const authTimestamp = this.encode (xAuthTimestamp);
            const authContentType = this.encode (contentType);
            let authBody = body ? body : '';
            authBody = this.encode (authBody);
            const auth = this.binaryConcat (authVerb, authPath, authTimestamp, authContentType, authBody);
            const secret = this.encode (this.secret);
            let signature = this.hmac (auth, secret, sha512);
            signature = signature.toUpperCase ();
            headers['X-Auth-Signature'] = signature;
        }
        const url = baseUrl + pathAndQs;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        // {
        //     "errorCode": 10001,
        //     "message": "Email or password is not correct.",
        //     "errors": [
        //         {
        //             "key": "user",
        //             "code": "not_found",
        //             "message": "Email or password is not correct."
        //         }
        //     ]
        // }
        const message = this.safeStringLower (response, 'message');
        const errorCode = this.safeString (response, 'errorCode');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
