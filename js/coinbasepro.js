'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InsufficientFunds, ArgumentsRequired, ExchangeError, InvalidOrder, InvalidAddress, AuthenticationError, NotSupported, OrderNotFound, OnMaintenance, PermissionDenied, RateLimitExceeded } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

// ----------------------------------------------------------------------------

module.exports = class coinbasepro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbasepro',
            'name': 'Coinbase Pro',
            'countries': [ 'US' ],
            'rateLimit': 1000,
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
                'fetchCurrencies': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': false, // the exchange does not have this method, only createDepositAddress, see https://github.com/ccxt/ccxt/pull/7405
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchTime': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '1h': 3600,
                '6h': 21600,
                '1d': 86400,
            },
            'urls': {
                'test': {
                    'public': 'https://api-public.sandbox.pro.coinbase.com',
                    'private': 'https://api-public.sandbox.pro.coinbase.com',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg',
                'api': {
                    'public': 'https://api.pro.coinbase.com',
                    'private': 'https://api.pro.coinbase.com',
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
                        'users/self/trailing-volume',
                        'users/self/exchange-limits',
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
            const precision = this.safeFloat (currency, 'max_precision');
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
                        'min': this.safeFloat (details, 'min_size'),
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
                    'withdraw': {
                        'min': this.safeFloat (details, 'min_withdrawal_amount'),
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
                'min': this.safeFloat (market, 'quote_increment'),
                'max': undefined,
            };
            const precision = {
                'amount': this.safeFloat (market, 'base_increment'),
                'price': this.safeFloat (market, 'quote_increment'),
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
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'base_min_size'),
                        'max': this.safeFloat (market, 'base_max_size'),
                    },
                    'price': priceLimits,
                    'cost': {
                        'min': this.safeFloat (market, 'min_market_funds'),
                        'max': this.safeFloat (market, 'max_market_funds'),
                    },
                },
                'active': active,
                'info': market,
            }));
        }
        return result;
    }

    async fetchAccounts (params = {}) {
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
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'hold'),
                'total': this.safeFloat (balance, 'balance'),
            };
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
        const orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'sequence');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
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
        const timestamp = this.parse8601 (this.safeValue (ticker, 'time'));
        const bid = this.safeFloat (ticker, 'bid');
        const ask = this.safeFloat (ticker, 'ask');
        const last = this.safeFloat (ticker, 'price');
        const symbol = (market === undefined) ? undefined : market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
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
        //         side: 'sell',
        //         size: '0.00513192',
        //         price: '9314.78',
        //         product_id: 'BTC-USD',
        //         sequence: 12038915443,
        //         time: '2020-01-31T20:03:41.158814Z'
        //     }
        //
        const timestamp = this.parse8601 (this.safeString2 (trade, 'time', 'created_at'));
        const marketId = this.safeString (trade, 'product_id');
        const symbol = this.safeSymbol (marketId, market, '-');
        let feeRate = undefined;
        let feeCurrency = undefined;
        let takerOrMaker = undefined;
        if (market !== undefined) {
            feeCurrency = market['quote'];
            if ('liquidity' in trade) {
                takerOrMaker = (trade['liquidity'] === 'T') ? 'taker' : 'maker';
                feeRate = market[takerOrMaker];
            }
        }
        const feeCost = this.safeFloat2 (trade, 'fill_fees', 'fee');
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
        if (orderId !== undefined) {
            side = (trade['side'] === 'buy') ? 'buy' : 'sell';
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
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
            'cost': price * amount,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // as of 2018-08-23
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
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
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
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
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const marketId = this.safeString (order, 'product_id');
        market = this.safeMarket (marketId, market, '-');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const price = this.safeFloat (order, 'price');
        const filled = this.safeFloat (order, 'filled_size');
        const amount = this.safeFloat (order, 'size', filled);
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = amount - filled;
            }
        }
        const cost = this.safeFloat (order, 'executed_value');
        const feeCost = this.safeFloat (order, 'fill_fees');
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
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            'average': undefined,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
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
        await this.loadMarkets ();
        const request = {
            'status': 'all',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'status': 'done',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        // let oid = this.nonce ().toString ();
        const request = {
            'product_id': this.marketId (symbol),
            'side': side,
            'size': this.amountToPrecision (symbol, amount),
            'type': type,
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrdersId ({ 'id': id });
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        return await this.privateDeleteOrders (params);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        const rate = market[takerOrMaker];
        const cost = amount * price;
        const currency = market['quote'];
        return {
            'type': takerOrMaker,
            'currency': currency,
            'rate': rate,
            'cost': parseFloat (this.currencyToPrecision (currency, rate * cost)),
        };
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
        return this.fetchTransactions (code, since, limit, this.extend (params, { 'type': 'deposit' }));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchTransactions (code, since, limit, this.extend (params, { 'type': 'withdraw' }));
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
        const amount = this.safeFloat (transaction, 'amount');
        let type = this.safeString (transaction, 'type');
        let address = this.safeString (details, 'crypto_address');
        const tag = this.safeString (details, 'destination_tag');
        address = this.safeString (transaction, 'crypto_address', address);
        let fee = undefined;
        if (type === 'withdraw') {
            type = 'withdrawal';
            address = this.safeString (details, 'sent_to_address', address);
            const feeCost = this.safeFloat (details, 'fee');
            if (feeCost !== undefined) {
                fee = {
                    'cost': feeCost,
                    'code': code,
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'][api] + request;
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
            const secret = this.base64ToBinary (this.secret);
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

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (typeof response !== 'string') {
            if ('message' in response) {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
};
