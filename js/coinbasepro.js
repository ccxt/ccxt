'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InsufficientFunds, ArgumentsRequired, ExchangeError, InvalidOrder, InvalidAddress, AuthenticationError, NotSupported, OrderNotFound, OnMaintenance, PermissionDenied, RateLimitExceeded } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ----------------------------------------------------------------------------

module.exports = class coinbasepro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbasepro',
            'name': 'Coinbase Pro',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'userAgent': this.userAgents['chrome'],
            'pro': true,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': true,
                'createDepositAddress': true,
                'createOrder': true,
                'deposit': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': undefined, // the exchange does not have this method, only createDepositAddress, see https://github.com/ccxt/ccxt/pull/7405
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '1h': 3600,
                '6h': 21600,
                '1d': 86400,
            },
            'hostname': 'pro.coinbase.com',
            'urls': {
                'test': {
                    'public': 'https://api-public.sandbox.pro.coinbase.com',
                    'private': 'https://api-public.sandbox.pro.coinbase.com',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg',
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'www': 'https://pro.coinbase.com/',
                'doc': 'https://docs.pro.coinbase.com',
                'fees': [
                    'https://docs.pro.coinbase.com/#fees',
                    'https://support.pro.coinbase.com/customer/en/portal/articles/2945310-fees',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'products',
                        'products/{id}',
                        'products/{id}/book',
                        'products/{id}/candles',
                        'products/{id}/stats',
                        'products/{id}/ticker',
                        'products/{id}/trades',
                        'time',
                        'products/spark-lines', // experimental
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{id}',
                        'accounts/{id}/holds',
                        'accounts/{id}/ledger',
                        'accounts/{id}/transfers',
                        'coinbase-accounts',
                        'fills',
                        'funding',
                        'fees',
                        'margin/profile_information',
                        'margin/buying_power',
                        'margin/withdrawal_power',
                        'margin/withdrawal_power_all',
                        'margin/exit_plan',
                        'margin/liquidation_history',
                        'margin/position_refresh_amounts',
                        'margin/status',
                        'oracle',
                        'orders',
                        'orders/{id}',
                        'orders/client:{client_oid}',
                        'otc/orders',
                        'payment-methods',
                        'position',
                        'profiles',
                        'profiles/{id}',
                        'reports/{report_id}',
                        'transfers',
                        'transfers/{transfer_id}',
                        'users/self/exchange-limits',
                        'users/self/hold-balances',
                        'users/self/trailing-volume',
                        'withdrawals/fee-estimate',
                    ],
                    'post': [
                        'conversions',
                        'deposits/coinbase-account',
                        'deposits/payment-method',
                        'coinbase-accounts/{id}/addresses',
                        'funding/repay',
                        'orders',
                        'position/close',
                        'profiles/margin-transfer',
                        'profiles/transfer',
                        'reports',
                        'withdrawals/coinbase',
                        'withdrawals/coinbase-account',
                        'withdrawals/crypto',
                        'withdrawals/payment-method',
                    ],
                    'delete': [
                        'orders',
                        'orders/client:{client_oid}',
                        'orders/{id}',
                    ],
                },
            },
            'commonCurrencies': {
                'CGLD': 'CELO',
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': true, // complicated tier system per coin
                    'percentage': true,
                    'maker': 0.5 / 100, // highest fee of all tiers
                    'taker': 0.5 / 100, // highest fee of all tiers
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BCH': 0,
                        'BTC': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'EUR': 0.15,
                        'USD': 25,
                    },
                    'deposit': {
                        'BCH': 0,
                        'BTC': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'EUR': 0.15,
                        'USD': 10,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    'Insufficient funds': InsufficientFunds,
                    'NotFound': OrderNotFound,
                    'Invalid API Key': AuthenticationError,
                    'invalid signature': AuthenticationError,
                    'Invalid Passphrase': AuthenticationError,
                    'Invalid order id': InvalidOrder,
                    'Private rate limit exceeded': RateLimitExceeded,
                    'Trading pair not available': PermissionDenied,
                    'Product not found': InvalidOrder,
                },
                'broad': {
                    'Order already done': OrderNotFound,
                    'order not found': OrderNotFound,
                    'price too small': InvalidOrder,
                    'price too precise': InvalidOrder,
                    'under maintenance': OnMaintenance,
                    'size is too small': InvalidOrder,
                    'Cancel only mode': OnMaintenance, // https://github.com/ccxt/ccxt/issues/7690
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     [
        //         {
        //             id: 'XTZ',
        //             name: 'Tezos',
        //             min_size: '0.000001',
        //             status: 'online',
        //             message: '',
        //             max_precision: '0.000001',
        //             convertible_to: [],
        //             details: {
        //                 type: 'crypto',
        //                 symbol: 'Τ',
        //                 network_confirmations: 60,
        //                 sort_order: 53,
        //                 crypto_address_link: 'https://tzstats.com/{{address}}',
        //                 crypto_transaction_link: 'https://tzstats.com/{{txId}}',
        //                 push_payment_methods: [ 'crypto' ],
        //                 group_types: [],
        //                 display_name: '',
        //                 processing_time_seconds: 0,
        //                 min_withdrawal_amount: 1
        //             }
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (id);
            const details = this.safeValue (currency, 'details', {});
            const precision = this.safeNumber (currency, 'max_precision');
            const status = this.safeString (currency, 'status');
            const active = (status === 'online');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': this.safeString (details, 'type'),
                'name': name,
                'active': active,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (details, 'min_size'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (details, 'min_withdrawal_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProducts (params);
        //
        //     [
        //         {
        //             "id":"ZEC-BTC",
        //             "base_currency":"ZEC",
        //             "quote_currency":"BTC",
        //             "base_min_size":"0.01000000",
        //             "base_max_size":"1500.00000000",
        //             "quote_increment":"0.00000100",
        //             "base_increment":"0.00010000",
        //             "display_name":"ZEC/BTC",
        //             "min_market_funds":"0.001",
        //             "max_market_funds":"30",
        //             "margin_enabled":false,
        //             "post_only":false,
        //             "limit_only":false,
        //             "cancel_only":false,
        //             "trading_disabled":false,
        //             "status":"online",
        //             "status_message":""
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const priceLimits = {
                'min': this.safeNumber (market, 'quote_increment'),
                'max': undefined,
            };
            const precision = {
                'amount': this.safeNumber (market, 'base_increment'),
                'price': this.safeNumber (market, 'quote_increment'),
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'online');
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'type': 'spot',
                'spot': true,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'base_min_size'),
                        'max': this.safeNumber (market, 'base_max_size'),
                    },
                    'price': priceLimits,
                    'cost': {
                        'min': this.safeNumber (market, 'min_market_funds'),
                        'max': this.safeNumber (market, 'max_market_funds'),
                    },
                },
                'info': market,
            }));
        }
        return result;
    }

    async fetchAccounts (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        //
        //     [
        //         {
        //             id: '4aac9c60-cbda-4396-9da4-4aa71e95fba0',
        //             currency: 'BTC',
        //             balance: '0.0000000000000000',
        //             available: '0',
        //             hold: '0.0000000000000000',
        //             profile_id: 'b709263e-f42a-4c7d-949a-a95c83d065da'
        //         },
        //         {
        //             id: 'f75fa69a-1ad1-4a80-bd61-ee7faa6135a3',
        //             currency: 'USDC',
        //             balance: '0.0000000000000000',
        //             available: '0',
        //             hold: '0.0000000000000000',
        //             profile_id: 'b709263e-f42a-4c7d-949a-a95c83d065da'
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const account = response[i];
            const accountId = this.safeString (account, 'id');
            const currencyId = this.safeString (account, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            result.push ({
                'id': accountId,
                'type': undefined,
                'currency': code,
                'info': account,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'hold');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // level 1 - only the best bid and ask
        // level 2 - top 50 bids and asks (aggregated)
        // level 3 - full order book (non aggregated)
        const request = {
            'id': this.marketId (symbol),
            'level': 2, // 1 best bidask, 2 aggregated, 3 full
        };
        const response = await this.publicGetProductsIdBook (this.extend (request, params));
        //
        //     {
        //         "sequence":1924393896,
        //         "bids":[
        //             ["0.01825","24.34811287",2],
        //             ["0.01824","72.5463",3],
        //             ["0.01823","424.54298049",6],
        //         ],
        //         "asks":[
        //             ["0.01826","171.10414904",4],
        //             ["0.01827","22.60427028",1],
        //             ["0.01828","397.46018784",7],
        //         ]
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'sequence');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTickers
        //
        //      [
        //         1639472400, // timestamp
        //         4.26, // low
        //         4.38, // high
        //         4.35, // open
        //         4.27 // close
        //      ]
        //
        // fetchTicker
        //
        //     publicGetProductsIdTicker
        //
        //     {
        //         "trade_id":843439,
        //         "price":"0.997999",
        //         "size":"80.29769",
        //         "time":"2020-01-28T02:13:33.012523Z",
        //         "bid":"0.997094",
        //         "ask":"0.998",
        //         "volume":"1903188.03750000"
        //     }
        //
        //     publicGetProductsIdStats
        //
        //     {
        //         "open": "34.19000000",
        //         "high": "95.70000000",
        //         "low": "7.06000000",
        //         "volume": "2.41000000"
        //     }
        //
        let timestamp = undefined;
        let bid = undefined;
        let ask = undefined;
        let last = undefined;
        let high = undefined;
        let low = undefined;
        let open = undefined;
        let volume = undefined;
        const symbol = (market === undefined) ? undefined : market['symbol'];
        if (Array.isArray (ticker)) {
            last = this.safeNumber (ticker, 4);
            timestamp = this.milliseconds ();
        } else {
            timestamp = this.parse8601 (this.safeValue (ticker, 'time'));
            bid = this.safeNumber (ticker, 'bid');
            ask = this.safeNumber (ticker, 'ask');
            high = this.safeNumber (ticker, 'high');
            low = this.safeNumber (ticker, 'low');
            open = this.safeNumber (ticker, 'open');
            last = this.safeNumber2 (ticker, 'price', 'last');
            volume = this.safeNumber (ticker, 'volume');
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': volume,
            'quoteVolume': undefined,
            'info': ticker,
        });
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.publicGetProductsSparkLines (this.extend (request, params));
        //
        //     {
        //         YYY-USD: [
        //             [
        //                 1639472400, // timestamp
        //                 4.26, // low
        //                 4.38, // high
        //                 4.35, // open
        //                 4.27 // close
        //             ],
        //             [
        //                 1639468800,
        //                 4.31,
        //                 4.45,
        //                 4.35,
        //                 4.35
        //             ],
        //         ]
        //     }
        //
        const result = {};
        const marketIds = Object.keys (response);
        const delimiter = '-';
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const entry = this.safeValue (response, marketId, []);
            const first = this.safeValue (entry, 0, []);
            const market = this.safeMarket (marketId, undefined, delimiter);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (first, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        // publicGetProductsIdTicker or publicGetProductsIdStats
        const method = this.safeString (this.options, 'fetchTickerMethod', 'publicGetProductsIdTicker');
        const response = await this[method] (this.extend (request, params));
        //
        // publicGetProductsIdTicker
        //
        //     {
        //         "trade_id":843439,
        //         "price":"0.997999",
        //         "size":"80.29769",
        //         "time":"2020-01-28T02:13:33.012523Z",
        //         "bid":"0.997094",
        //         "ask":"0.998",
        //         "volume":"1903188.03750000"
        //     }
        //
        // publicGetProductsIdStats
        //
        //     {
        //         "open": "34.19000000",
        //         "high": "95.70000000",
        //         "low": "7.06000000",
        //         "volume": "2.41000000"
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         type: 'match',
        //         trade_id: 82047307,
        //         maker_order_id: '0f358725-2134-435e-be11-753912a326e0',
        //         taker_order_id: '252b7002-87a3-425c-ac73-f5b9e23f3caf',
        //         order_id: 'd50ec984-77a8-460a-b958-66f114b0de9b',
        //         side: 'sell',
        //         size: '0.00513192',
        //         price: '9314.78',
        //         product_id: 'BTC-USD',
        //         profile_id: '6244401d-c078-40d9-b305-7ad3551bc3b0',
        //         sequence: 12038915443,
        //         time: '2020-01-31T20:03:41.158814Z'
        //         created_at: '2014-11-07T22:19:28.578544Z',
        //         liquidity: 'T',
        //         fee: '0.00025',
        //         settled: true,
        //         usd_volume: '0.0924556000000000',
        //         user_id: '595eb864313c2b02ddf2937d'
        //     }
        //
        const timestamp = this.parse8601 (this.safeString2 (trade, 'time', 'created_at'));
        const marketId = this.safeString (trade, 'product_id');
        const symbol = this.safeSymbol (marketId, market, '-');
        let feeRate = undefined;
        let feeCurrency = undefined;
        let takerOrMaker = undefined;
        let cost = undefined;
        if (market !== undefined) {
            const feeCurrencyId = this.safeStringLower (market, 'quoteId');
            const costField = feeCurrencyId + '_value';
            cost = this.safeNumber (trade, costField);
            feeCurrency = market['quote'];
            const liquidity = this.safeString (trade, 'liquidity');
            if (liquidity !== undefined) {
                takerOrMaker = (liquidity === 'T') ? 'taker' : 'maker';
                feeRate = market[takerOrMaker];
            }
        }
        const feeCost = this.safeNumber2 (trade, 'fill_fees', 'fee');
        const fee = {
            'cost': feeCost,
            'currency': feeCurrency,
            'rate': feeRate,
        };
        const type = undefined;
        const id = this.safeString (trade, 'trade_id');
        let side = (trade['side'] === 'buy') ? 'sell' : 'buy';
        const orderId = this.safeString (trade, 'order_id');
        // Coinbase Pro returns inverted side to fetchMyTrades vs fetchTrades
        const makerOrderId = this.safeString (trade, 'maker_order_id');
        const takerOrderId = this.safeString (trade, 'taker_order_id');
        if ((orderId !== undefined) || ((makerOrderId !== undefined) && (takerOrderId !== undefined))) {
            side = (trade['side'] === 'buy') ? 'buy' : 'sell';
        }
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        if (cost === undefined) {
            cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        }
        return {
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'fee': fee,
            'cost': cost,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // as of 2018-08-23
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_id': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetFills (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'], // fixes issue #2
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.publicGetProductsIdTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591514160,
        //         0.02507,
        //         0.02507,
        //         0.02507,
        //         0.02507,
        //         0.02816506
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const granularity = this.timeframes[timeframe];
        const request = {
            'id': market['id'],
            'granularity': granularity,
        };
        if (since !== undefined) {
            request['start'] = this.iso8601 (since);
            if (limit === undefined) {
                // https://docs.pro.coinbase.com/#get-historic-rates
                limit = 300; // max = 300
            } else {
                limit = Math.min (300, limit);
            }
            request['end'] = this.iso8601 (this.sum ((limit - 1) * granularity * 1000, since));
        }
        const response = await this.publicGetProductsIdCandles (this.extend (request, params));
        //
        //     [
        //         [1591514160,0.02507,0.02507,0.02507,0.02507,0.02816506],
        //         [1591514100,0.02507,0.02507,0.02507,0.02507,1.63830323],
        //         [1591514040,0.02505,0.02507,0.02505,0.02507,0.19918178]
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "iso":"2020-05-12T08:00:51.504Z",
        //         "epoch":1589270451.504
        //     }
        //
        return this.safeTimestamp (response, 'epoch');
    }

    parseOrderStatus (status) {
        const statuses = {
            'pending': 'open',
            'active': 'open',
            'open': 'open',
            'done': 'closed',
            'canceled': 'canceled',
            'canceling': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "id": "d0c5340b-6d6c-49d9-b567-48c4bfca13d2",
        //         "price": "0.10000000",
        //         "size": "0.01000000",
        //         "product_id": "BTC-USD",
        //         "side": "buy",
        //         "stp": "dc",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "post_only": false,
        //         "created_at": "2016-12-08T20:02:28.53864Z",
        //         "fill_fees": "0.0000000000000000",
        //         "filled_size": "0.00000000",
        //         "executed_value": "0.0000000000000000",
        //         "status": "pending",
        //         "settled": false
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const marketId = this.safeString (order, 'product_id');
        market = this.safeMarket (marketId, market, '-');
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        const doneReason = this.safeString (order, 'done_reason');
        if ((status === 'closed') && (doneReason === 'canceled')) {
            status = 'canceled';
        }
        const price = this.safeString (order, 'price');
        const filled = this.safeString (order, 'filled_size');
        const amount = this.safeString (order, 'size', filled);
        const cost = this.safeString (order, 'executed_value');
        const feeCost = this.safeNumber (order, 'fill_fees');
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                feeCurrencyCode = market['quote'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
                'rate': undefined,
            };
        }
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const timeInForce = this.safeString (order, 'time_in_force');
        const postOnly = this.safeValue (order, 'post_only');
        const stopPrice = this.safeNumber (order, 'stop_price');
        const clientOrderId = this.safeString (order, 'client_oid');
        return this.safeOrder2 ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'fee': fee,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_oid');
        let method = undefined;
        if (clientOrderId === undefined) {
            method = 'privateGetOrdersId';
            request['id'] = id;
        } else {
            method = 'privateGetOrdersClientClientOid';
            request['client_oid'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'client_oid' ]);
        }
        const response = await this[method] (this.extend (request, params));
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
        const response = await this.privateGetFills (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'all',
        };
        return await this.fetchOpenOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'done',
        };
        return await this.fetchOpenOrders (symbol, since, limit, this.extend (request, params));
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // common params --------------------------------------------------
            // 'client_oid': clientOrderId,
            'type': type,
            'side': side,
            'product_id': market['id'],
            // 'size': this.amountToPrecision (symbol, amount),
            // 'stp': 'dc', // self-trade prevention, dc = decrease and cancel, co = cancel oldest, cn = cancel newest, cb = cancel both
            // 'stop': 'loss', // "loss" = stop loss below price, "entry" = take profit above price
            // 'stop_price': this.priceToPrecision (symbol, price),
            // limit order params ---------------------------------------------
            // 'price': this.priceToPrecision (symbol, price),
            // 'size': this.amountToPrecision (symbol, amount),
            // 'time_in_force': 'GTC', // GTC, GTT, IOC, or FOK
            // 'cancel_after' [optional]* min, hour, day, requires time_in_force to be GTT
            // 'post_only': false, // invalid when time_in_force is IOC or FOK
            // market order params --------------------------------------------
            // 'size': this.amountToPrecision (symbol, amount),
            // 'funds': this.costToPrecision (symbol, amount),
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_oid');
        if (clientOrderId !== undefined) {
            request['client_oid'] = clientOrderId;
        }
        const stopPrice = this.safeNumber2 (params, 'stopPrice', 'stop_price');
        if (stopPrice !== undefined) {
            request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
        }
        const timeInForce = this.safeString2 (params, 'timeInForce', 'time_in_force');
        if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        const postOnly = this.safeValue2 (params, 'postOnly', 'post_only', false);
        if (postOnly) {
            request['post_only'] = true;
        }
        params = this.omit (params, [ 'timeInForce', 'time_in_force', 'stopPrice', 'stop_price', 'clientOrderId', 'client_oid', 'postOnly', 'post_only' ]);
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['size'] = this.amountToPrecision (symbol, amount);
        } else if (type === 'market') {
            let cost = this.safeNumber2 (params, 'cost', 'funds');
            if (cost === undefined) {
                if (price !== undefined) {
                    cost = amount * price;
                }
            } else {
                params = this.omit (params, [ 'cost', 'funds' ]);
            }
            if (cost !== undefined) {
                request['funds'] = this.costToPrecision (symbol, cost);
            } else {
                request['size'] = this.amountToPrecision (symbol, amount);
            }
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //         "id": "d0c5340b-6d6c-49d9-b567-48c4bfca13d2",
        //         "price": "0.10000000",
        //         "size": "0.01000000",
        //         "product_id": "BTC-USD",
        //         "side": "buy",
        //         "stp": "dc",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "post_only": false,
        //         "created_at": "2016-12-08T20:02:28.53864Z",
        //         "fill_fees": "0.0000000000000000",
        //         "filled_size": "0.00000000",
        //         "executed_value": "0.0000000000000000",
        //         "status": "pending",
        //         "settled": false
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'product_id': market['id'], // the request will be more performant if you include it
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_oid');
        let method = undefined;
        if (clientOrderId === undefined) {
            method = 'privateDeleteOrdersId';
            request['id'] = id;
        } else {
            method = 'privateDeleteOrdersClientClientOid';
            request['client_oid'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'client_oid' ]);
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['symbol']; // the request will be more performant if you include it
        }
        return await this[method] (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['symbol']; // the request will be more performant if you include it
        }
        return await this.privateDeleteOrders (this.extend (request, params));
    }

    async fetchPaymentMethods (params = {}) {
        return await this.privateGetPaymentMethods (params);
    }

    async deposit (code, amount, address, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
        };
        let method = 'privatePostDeposits';
        if ('payment_method_id' in params) {
            // deposit from a payment_method, like a bank account
            method += 'PaymentMethod';
        } else if ('coinbase_account_id' in params) {
            // deposit into Coinbase Pro account from a Coinbase account
            method += 'CoinbaseAccount';
        } else {
            // deposit methodotherwise we did not receive a supported deposit location
            // relevant docs link for the Googlers
            // https://docs.pro.coinbase.com/#deposits
            throw new NotSupported (this.id + ' deposit() requires one of `coinbase_account_id` or `payment_method_id` extra params');
        }
        const response = await this[method] (this.extend (request, params));
        if (!response) {
            throw new ExchangeError (this.id + ' deposit() error: ' + this.json (response));
        }
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
        };
        let method = 'privatePostWithdrawals';
        if ('payment_method_id' in params) {
            method += 'PaymentMethod';
        } else if ('coinbase_account_id' in params) {
            method += 'CoinbaseAccount';
        } else {
            method += 'Crypto';
            request['crypto_address'] = address;
            if (tag !== undefined) {
                request['destination_tag'] = tag;
            }
        }
        const response = await this[method] (this.extend (request, params));
        if (!response) {
            throw new ExchangeError (this.id + ' withdraw() error: ' + this.json (response));
        }
        return {
            'info': response,
            'id': response['id'],
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'transfer': 'transfer', // Funds moved between portfolios
            'match': 'trade',       // Funds moved as a result of a trade
            'fee': 'fee',           // Fee as a result of a trade
            'rebate': 'rebate',     // Fee rebate
            'conversion': 'trade',  // Funds converted between fiat currency and a stablecoin
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //  {
        //      id: '12087495079',
        //      amount: '-0.0100000000000000',
        //      balance: '0.0645419900000000',
        //      created_at: '2021-10-28T17:14:32.593168Z',
        //      type: 'transfer',
        //      details: {
        //          from: '2f74edf7-1440-4586-86dc-ae58c5693691',
        //          profile_transfer_id: '3ef093ad-2482-40d1-8ede-2f89cff5099e',
        //          to: 'dda99503-4980-4b60-9549-0b770ee51336'
        //      }
        //  },
        //  {
        //     id: '11740725774',
        //     amount: '-1.7565669701255000',
        //     balance: '0.0016490047745000',
        //     created_at: '2021-10-22T03:47:34.764122Z',
        //     type: 'fee',
        //     details: {
        //         order_id: 'ad06abf4-95ab-432a-a1d8-059ef572e296',
        //         product_id: 'ETH-DAI',
        //         trade_id: '1740617'
        //     }
        //  }
        const id = this.safeString (item, 'id');
        let amountString = this.safeString (item, 'amount');
        let direction = undefined;
        const afterString = this.safeString (item, 'balance');
        const beforeString = Precise.stringSub (afterString, amountString);
        if (Precise.stringLt (amountString, '0')) {
            direction = 'out';
            amountString = Precise.stringAbs (amountString);
        } else {
            direction = 'in';
        }
        const amount = this.parseNumber (amountString);
        const after = this.parseNumber (afterString);
        const before = this.parseNumber (beforeString);
        const timestamp = this.parse8601 (this.safeValue (item, 'created_at'));
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (undefined, currency);
        const details = this.safeValue (item, 'details', {});
        let account = undefined;
        let referenceAccount = undefined;
        let referenceId = undefined;
        if (type === 'transfer') {
            account = this.safeString (details, 'from');
            referenceAccount = this.safeString (details, 'to');
            referenceId = this.safeString (details, 'profile_transfer_id');
        } else {
            referenceId = this.safeString (details, 'order_id');
        }
        const status = 'ok';
        return {
            'id': id,
            'currency': code,
            'account': account,
            'referenceAccount': referenceAccount,
            'referenceId': referenceId,
            'status': status,
            'amount': amount,
            'before': before,
            'after': after,
            'fee': undefined,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': type,
            'info': item,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        // https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccountledger
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchLedger() requires a code param');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const currency = this.currency (code);
        const accountsByCurrencyCode = this.indexBy (this.accounts, 'currency');
        const account = this.safeValue (accountsByCurrencyCode, code);
        if (account === undefined) {
            throw new ExchangeError (this.id + ' fetchLedger() could not find account id for ' + code);
        }
        const request = {
            'id': account['id'],
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (this.milliseconds ()),
            // 'before': 'cursor', // sets start cursor to before date
            // 'after': 'cursor', // sets end cursor to after date
            // 'limit': limit, // default 100
            // 'profile_id': 'string'
        };
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.privateGetAccountsIdLedger (this.extend (request, params));
        for (let i = 0; i < response.length; i++) {
            response[i]['currency'] = code;
        }
        return this.parseLedger (response, currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let currency = undefined;
        let id = this.safeString (params, 'id'); // account id
        if (id === undefined) {
            if (code !== undefined) {
                currency = this.currency (code);
                const accountsByCurrencyCode = this.indexBy (this.accounts, 'currency');
                const account = this.safeValue (accountsByCurrencyCode, code);
                if (account === undefined) {
                    throw new ExchangeError (this.id + ' fetchTransactions() could not find account id for ' + code);
                }
                id = account['id'];
            }
        }
        const request = {};
        if (id !== undefined) {
            request['id'] = id;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (id === undefined) {
            response = await this.privateGetTransfers (this.extend (request, params));
            for (let i = 0; i < response.length; i++) {
                const account_id = this.safeString (response[i], 'account_id');
                const account = this.safeValue (this.accountsById, account_id);
                const code = this.safeString (account, 'currency');
                response[i]['currency'] = code;
            }
        } else {
            response = await this.privateGetAccountsIdTransfers (this.extend (request, params));
            for (let i = 0; i < response.length; i++) {
                response[i]['currency'] = code;
            }
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchTransactions (code, since, limit, this.extend ({ 'type': 'deposit' }, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchTransactions (code, since, limit, this.extend ({ 'type': 'withdraw' }, params));
    }

    parseTransactionStatus (transaction) {
        const canceled = this.safeValue (transaction, 'canceled_at');
        if (canceled) {
            return 'canceled';
        }
        const processed = this.safeValue (transaction, 'processed_at');
        const completed = this.safeValue (transaction, 'completed_at');
        if (completed) {
            return 'ok';
        } else if (processed && !completed) {
            return 'failed';
        } else {
            return 'pending';
        }
    }

    parseTransaction (transaction, currency = undefined) {
        const details = this.safeValue (transaction, 'details', {});
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (details, 'crypto_transaction_hash');
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const updated = this.parse8601 (this.safeString (transaction, 'processed_at'));
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (transaction);
        let amount = this.safeNumber (transaction, 'amount');
        let type = this.safeString (transaction, 'type');
        let address = this.safeString (details, 'crypto_address');
        const tag = this.safeString (details, 'destination_tag');
        address = this.safeString (transaction, 'crypto_address', address);
        let fee = undefined;
        if (type === 'withdraw') {
            type = 'withdrawal';
            address = this.safeString (details, 'sent_to_address', address);
            const feeCost = this.safeNumber (details, 'fee');
            if (feeCost !== undefined) {
                if (amount !== undefined) {
                    amount -= feeCost;
                }
                fee = {
                    'cost': feeCost,
                    'currency': code,
                };
            }
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        let accounts = this.safeValue (this.options, 'coinbaseAccounts');
        if (accounts === undefined) {
            accounts = await this.privateGetCoinbaseAccounts ();
            this.options['coinbaseAccounts'] = accounts; // cache it
            this.options['coinbaseAccountsByCurrencyId'] = this.indexBy (accounts, 'currency');
        }
        const currencyId = currency['id'];
        const account = this.safeValue (this.options['coinbaseAccountsByCurrencyId'], currencyId);
        if (account === undefined) {
            // eslint-disable-next-line quotes
            throw new InvalidAddress (this.id + " fetchDepositAddress() could not find currency code " + code + " with id = " + currencyId + " in this.options['coinbaseAccountsByCurrencyId']");
        }
        const request = {
            'id': account['id'],
        };
        const response = await this.privatePostCoinbaseAccountsIdAddresses (this.extend (request, params));
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'destination_tag');
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.implodeHostname (this.urls['api'][api]) + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            const what = nonce + method + request + payload;
            let secret = undefined;
            try {
                secret = this.base64ToBinary (this.secret);
            } catch (e) {
                throw new AuthenticationError (this.id + ' sign() invalid base64 secret');
            }
            const signature = this.hmac (this.encode (what), secret, 'sha256', 'base64');
            headers = {
                'CB-ACCESS-KEY': this.apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 400) || (code === 404)) {
            if (body[0] === '{') {
                const message = this.safeString (response, 'message');
                const feedback = this.id + ' ' + message;
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}, context = {}) {
        const response = await this.fetch2 (path, api, method, params, headers, body, config, context);
        if (typeof response !== 'string') {
            if ('message' in response) {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
};
