'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidAddress, ArgumentsRequired, InsufficientFunds, AuthenticationError, OrderNotFound, InvalidOrder, BadRequest, InvalidNonce, BadSymbol, OnMaintenance, NotSupported, PermissionDenied, ExchangeNotAvailable } = require ('./base/errors');
const { SIGNIFICANT_DIGITS, DECIMAL_PLACES, TRUNCATE, ROUND } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class bitzlato extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitzlato',
            'name': 'Bitzlato',
            'countries': [ 'HK' ],
            'version': 'v2',
            'rateLimit': 1000,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': true,
                'createOrder': true,
                'fetchDepositAddress': true,
                'fetchBalance': true,
                // 'fetchBidsAsks': undefined,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                // 'fetchOHLCV': 'emulated',
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchTransactions': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'hostname': 'bitzlato.com',
            'urls': {
                'logo': '',
                'test': {
                    'public': 'https://market-sandbox.{hostname}/api/v2/peatio/public',
                    'private': 'https://market-sandbox.{hostname}/api/v2/peatio',
                },
                'api': {
                    'public': 'https://market.{hostname}/api/v2/peatio/public',
                    'private': 'https://market.{hostname}/api/v2/peatio',
                },
                'www': 'https://market.bitzlato.com/',
                'doc': [
                    'https://market.bitzlato.com/docs',
                ],
                'fees': '',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'withdraw_limits',
                        'trading_fees',
                        'health/ready',
                        'timestamp',
                        'member-levels',
                        'markets/{market}/tickers',
                        'markets/tickers',
                        'markets/{market}/k-line',
                        'markets/{market}/depth',
                        'markets/{market}/trades',
                        'markets/{market}/order-book',
                        'markets',
                        'currencies',
                        'currencies/{id}',
                    ],
                },
                'private': {
                    'get': [
                        'account/internal_transfers',
                        'account/transactions',
                        'account/stats/pnl',
                        'account/withdraws',
                        'account/withdraws/sums',
                        'account/beneficiaries/{id}',
                        'account/beneficiaries',
                        'account/deposit_address/{currency}',
                        'account/deposits/{txid}',
                        'account/deposits',
                        'account/balances/{currency}',
                        'account/balances',
                        'market/trades',
                        'market/orders',
                        'market/orders/{id}',
                        'coinmarketcap/orderbook/{market_pair}',
                        'coinmarketcap/trades/{market_pair}',
                        'coinmarketcap/ticker',
                        'coinmarketcap/assets',
                        'coinmarketcap/summary',
                        'coingecko/historical_trades',
                        'coingecko/orderbook',
                        'coingecko/tickers',
                        'coingecko/pairs',
                    ],
                    'post': [
                        'account/internal_transfers',
                        'account/withdraws',
                        'account/beneficiaries',
                        'account/deposits/intention',
                        'market/orders/cancel',
                        'market/orders/{id}/cancel',
                        'market/orders',
                    ],
                    'patch': [
                        'account/beneficiaries/{id}/activate',
                        'account/beneficiaries/{id}/resend_pin',
                    ],
                    'delete': [
                        'account/beneficiaries/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                    'percentage': true,
                    // 'feeSide': 'get',
                    // 'tierBased': true,
                    // 'tiers': {
                    //     'taker': [
                    //         [this.parseNumber ('1'), this.parseNumber ('0.002')],
                    //         [this.parseNumber ('2'), this.parseNumber ('0.002')],
                    //         [this.parseNumber ('3'), this.parseNumber ('0.0018')],
                    //         [this.parseNumber ('4'), this.parseNumber ('0.0016')],
                    //         [this.parseNumber ('5'), this.parseNumber ('0.002')],
                    //         [this.parseNumber ('6'), this.parseNumber ('0.0')],
                    //     ],
                    //     'maker': [
                    //         [this.parseNumber ('1'), this.parseNumber ('0.002')],
                    //         [this.parseNumber ('2'), this.parseNumber ('0.001')],
                    //         [this.parseNumber ('3'), this.parseNumber ('0.0008')],
                    //         [this.parseNumber ('4'), this.parseNumber ('0.0006')],
                    //         [this.parseNumber ('5'), this.parseNumber ('0.002')],
                    //         [this.parseNumber ('6'), this.parseNumber ('0.0')],
                    //     ],
                    // },
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'BNB-BEP20': 'BNB',
                'MCR-ERC20': 'MCR',
                'MDT-ERC20': 'MDT',
                'USDC-ERC20': 'USDC',
                'USDT-ERC20': 'USDT',
            },
            'options': {
                'fetchMarkets': 'spot',
                'orderBookLimit': 100,
                'currencyType': [
                    'fiat',
                    'coin',
                ],
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTimestamp (params);
        //  "\"2021-10-05T12:34:56+00:00\""
        const parsed = JSON.parse (response);
        return this.parse8601 (parsed);
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetHealthReady (params);
        // 200
        let status = JSON.parse (response);
        status = (status === 200) ? 'ok' : 'maintenance';
        this.status = {
            'status': status,
            'updated': this.milliseconds (),
        };
        return this.status;
    }

    async fetchMarkets (params = {}) {
        const defaultType = this.safeString (this.options, 'fetchMarkets', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const limit = this.safeNumber (params, 'limit', 500);
        params = this.omit (params, [ 'type', 'limit' ]);
        const request = {
            'type': type,
            'limit': limit,
        };
        const response = await this.publicGetMarkets (this.extend (request, params));
        // [
        //   {
        //     "id": "btc_usdterc20",
        //     "symbol": "btc_usdterc20",
        //     "name": "BTC/USDT-ERC20",
        //     "type": "spot",
        //     "base_unit": "btc",
        //     "quote_unit": "usdt-erc20",
        //     "min_price": "20000.0",
        //     "max_price": "0.0",
        //     "min_amount": "0.0003",
        //     "amount_precision": 4,
        //     "price_precision": 4,
        //     "state": "enabled"
        //   },
        //   ...
        if (!this.isArray (response)) {
            return [];
        }
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base_unit');
            const quoteId = this.safeString (market, 'quote_unit');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const active = (market['state'] === 'enabled');
            const symbol = base + '/' + quote;
            const minPrice = this.safeInteger (market, 'min_price');
            const maxPrice = this.safeInteger (market, 'max_price');
            const type = this.safeString (market, 'type');
            const spot = (type === 'spot');
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeInteger (market, 'min_amount'),
                    'max': undefined,
                },
                'price': {
                    'min': (minPrice === 0) ? undefined : minPrice,
                    'max': (maxPrice === 0) ? undefined : maxPrice,
                },
            };
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': this.fees['trading']['taker'],
                'maker': this.fees['trading']['maker'],
                'percentage': this.fees['trading']['percentage'],
                'spot': spot,
                'precision': precision,
                'limits': limits,
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const limit = this.safeInteger (params, 'limit', 500);
        params = this.omit (params, 'limit');
        const request = {
            'limit': limit,
        };
        const response = await this.publicGetCurrencies (this.extend (request, params));
        if (!this.isArray (response)) {
            return {};
        }
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const fee = this.safeNumber (currency, 'withdraw_fee');
            const precision = this.safeNumber (currency, 'precision');
            const limits = {
                'amount': {
                    'min': this.safeNumber (currency, 'min_deposit_amount'),
                    'max': undefined,
                },
                'withdraw': {
                    'min': this.safeNumber (currency, 'min_withdraw_amount'),
                    'max': undefined,
                },
            };
            let type = this.safeString (currency, 'type');
            type = (type === 'fiat') ? 'fiat' : 'crypto';
            const isDepositEnabled = this.safeValue (currency, 'deposit_enabled');
            const isWithdrawEnabled = this.safeValue (currency, 'withdraw_enabled');
            const active = isDepositEnabled && isWithdrawEnabled;
            result[code] = {
                'id': id,
                'code': code,
                'type': type,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': limits,
                'info': currency,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        const response = await this.privateGetAccountBalances (params);
        // [
        //   {
        //     "currency": "string",
        //     "balance": 0,
        //     "locked": 0,
        //     "deposit_address": {
        //       "currencies": [
        //         [
        //           "bnb-bep20",
        //           "btc",
        //           "eth",
        //           "ht-hrc20",
        //           "mcr-erc20",
        //           "mdt-erc20",
        //           "usdt-erc20",
        //           "usdc-bep20",
        //           "usdc-erc20",
        //           "usdc-hrc20",
        //           "usdt-bep20",
        //           "usdt-hrc20"
        //         ]
        //       ],
        //       "address": "string",
        //       "state": "string"
        //     },
        //     "enable_invoice": true
        //   },
        //   ...
        // ]
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        if (!this.isArray (response)) {
            return result;
        }
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['bids_limit'] = limit;
            request['asks_limit'] = limit;
        } else {
            const defaultLimit = this.options['orderBookLimit'];
            request['bids_limit'] = defaultLimit;
            request['asks_limit'] = defaultLimit;
        }
        const response = await this.publicGetMarketsMarketOrderBook (this.extend (request, params));
        // [
        //   {
        //     "asks": [
        //       {
        //         "id": 0,
        //         "uuid": "string",
        //         "side": "string",
        //         "ord_type": "string",
        //         "price": 0,
        //         "avg_price": 0,
        //         "state": "string",
        //         "market": "string",
        //         "market_type": "string",
        //         "created_at": "string",
        //         "updated_at": "string",
        //         "origin_volume": 0,
        //         "remaining_volume": 0,
        //         "executed_volume": 0,
        //         "maker_fee": 0,
        //         "taker_fee": 0,
        //         "trades_count": 0,
        //         "trades": [
        //           {
        //             "id": "string",
        //             "price": 0,
        //             "amount": 0,
        //             "total": 0,
        //             "fee_currency": 0,
        //             "fee": 0,
        //             "fee_amount": 0,
        //             "market": "string",
        //             "market_type": "string",
        //             "created_at": "string",
        //             "taker_type": "string",
        //             "side": "string",
        //             "order_id": 0
        //           }
        //         ]
        //       }
        //     ],
        //     "bids": [
        //       {
        //         "id": 0,
        //         "uuid": "string",
        //         "side": "string",
        //         "ord_type": "string",
        //         "price": 0,
        //         "avg_price": 0,
        //         "state": "string",
        //         "market": "string",
        //         "market_type": "string",
        //         "created_at": "string",
        //         "updated_at": "string",
        //         "origin_volume": 0,
        //         "remaining_volume": 0,
        //         "executed_volume": 0,
        //         "maker_fee": 0,
        //         "taker_fee": 0,
        //         "trades_count": 0,
        //         "trades": [
        //           {
        //             "id": "string",
        //             "price": 0,
        //             "amount": 0,
        //             "total": 0,
        //             "fee_currency": 0,
        //             "fee": 0,
        //             "fee_amount": 0,
        //             "market": "string",
        //             "market_type": "string",
        //             "created_at": "string",
        //             "taker_type": "string",
        //             "side": "string",
        //             "order_id": 0
        //           }
        //         ]
        //       }
        //     ]
        //   }
        // ]
        const timestamp = undefined;
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 'price', 'remaining_volume');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'at');
        ticker = this.safeValue (ticker, 'ticker', {});
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const lastString = this.safeString (ticker, 'last');
        const openString = this.safeString (ticker, 'open');
        const changeString = Precise.stringSub (lastString, openString);
        const relChangeString = Precise.stringDiv (changeString, openString);
        const last = this.parseNumber (lastString);
        const open = this.parseNumber (openString);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'ask': undefined,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': this.safeNumber (ticker, 'avg_price'),
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.parseNumber (changeString),
            'percentage': this.parseNumber (Precise.stringMul (relChangeString, '100')),
            'average': this.parseNumber (Precise.stringDiv (Precise.stringAdd (lastString, openString), '2')),
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketsTickers (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            const ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketsMarketTickers (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseSymbol (marketId) {
    }

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'id');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'amount');
        const cost = this.safeNumber (trade, 'total');
        const createdAt = this.safeString (trade, 'created_at');
        const timestamp = this.parse8601 (createdAt);
        const side = this.safeString (trade, 'side');
        const order = this.safeString (trade, 'order_id');
        const marketId = this.safeString (trade, 'market');
        if (market === undefined) {
            market = this.markets_by_id[marketId];
        }
        const symbol = market['symbol'];
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': order,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'order_by': 'asc',
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            const timestamp = parseInt (since / 1000);
            request['timestamp'] = timestamp;
        }
        const response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        // [
        //   {
        //     "id": "string",
        //     "price": 0,
        //     "amount": 0,
        //     "total": 0,
        //     "fee_currency": 0,
        //     "fee": 0,
        //     "fee_amount": 0,
        //     "market": "string",
        //     "market_type": "string",
        //     "created_at": "string",
        //     "taker_type": "string",
        //     "side": "string",
        //     "order_id": 0
        //   },
        // ...
        // ]
        if (!this.isArray (response)) {
            return [];
        }
        return this.parseTrades (response, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 100, params = {}) {
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
            'pending': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // {
        //   "id": 0,
        //   "uuid": "string",
        //   "side": "string",
        //   "ord_type": "string",
        //   "price": 0,
        //   "avg_price": 0,
        //   "state": "string",
        //   "market": "string",
        //   "market_type": "string",
        //   "created_at": "string",
        //   "updated_at": "string",
        //   "origin_volume": 0,
        //   "remaining_volume": 0,
        //   "executed_volume": 0,
        //   "maker_fee": 0,
        //   "taker_fee": 0,
        //   "trades_count": 0,
        //   "trades": [
        //     {
        //       "id": "string",
        //       "price": 0,
        //       "amount": 0,
        //       "total": 0,
        //       "fee_currency": 0,
        //       "fee": 0,
        //       "fee_amount": 0,
        //       "market": "string",
        //       "market_type": "string",
        //       "created_at": "string",
        //       "taker_type": "string",
        //       "side": "string",
        //       "order_id": 0
        //     }
        //   ]
        // }
        const id = this.safeString (order, 'id');
        const createdAt = this.safeString (order, 'created_at');
        const updatedAt = this.safeString (order, 'updated_at');
        const timestamp = this.parse8601 (createdAt);
        const lastTradeTimestamp = this.parse8601 (updatedAt);
        if (market === undefined) {
            const marketId = this.safeString (order, 'market');
            market = this.markets_by_id[marketId];
        }
        const symbol = market['symbol'];
        const type = this.safeString (order, 'ord_type');
        const side = this.safeString (order, 'side');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'origin_volume');
        const filled = this.safeNumber (order, 'executed_volume');
        const remaining = this.safeNumber (order, 'remaining_volume');
        const average = this.safeNumber (order, 'avg_price');
        const trades = this.safeValue (order, 'trades', []);
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        return this.safeOrder ({
            'info': order,
            'id': id,
            'cliendOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
            'average': average,
            'status': status,
            'fee': undefined,
            'trades': this.parseTrades (trades),
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const volume = this.amountToPrecision (symbol, amount);
        if (type === 'limit') {
            price = this.priceToPrecision (symbol, price);
        }
        const request = {
            'market': marketId,
            'side': side,
            'volume': volume,
            'ord_type': type,
            'price': price,
        };
        // {
        //   "market": "btc_usdterc20",
        //   "side": "sell",
        //   "volume": 0,
        //   "ord_type": "limit",
        //   "price": 0
        // }
        const response = await this.privatePostMarketOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market_type': 'spot',
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privatePostMarketOrdersCancel (this.extend (request, params));
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostMarketOrdersIdCancel (this.extend (request, params));
        const order = this.parseOrder (response);
        const status = this.safeString (order, 'status');
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        const response = await this.privateGetMarketOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let marketId = undefined;
        if (symbol !== undefined) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            marketId = market['id'];
        }
        const request = {
            'market': marketId,
            'market_type': 'spot',
            'order_by': 'asc',
        };
        if (since !== undefined) {
            request['time_from'] = parseInt (since / 1000);
        }
        const response = await this.privateGetMarketOrders (this.extend (request, params));
        return this.parseOrders (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'wait',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'done',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'market_type': 'spot',
            'order_by': 'asc',
        };
        let market = undefined;
        if (symbol !== undefined) {
            await this.loadMarkets ();
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['time_from'] = parseInt (since / 1000);
        }
        const response = await this.privateGetMarketTrades (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetAccountDepositAddressCurrency (this.extend (request, params));
        const address = this.safeString (response, 'address');
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': undefined,
            'info': response,
        };
    }

    parseTransactionStatus (status) {
        // 'ok', 'pending', 'failed', 'canceled'
        const statuses = {
            'accepted': 'pending',
            'canceled': 'canceled',
            'confirming': 'pending',
            'dispatched': 'ok',
            'errored': 'failed',
            'failed': 'failed',
            'invoiced': 'pending',
            'prepared': 'pending',
            'processing': 'pending',
            'rejected': 'failed',
            'skipped': 'pending',
            'submitted': 'pending',
            'succeed': 'ok',
            'transfering': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'Deposit': 'deposit',
            'Withdraw': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    parseTransaction (transaction, currency = undefined) {
        const createdAt = this.safeString (transaction, 'created_at');
        const updatedAt = this.safeString (transaction, 'updated_at');
        const timestamp = this.parse8601 (createdAt);
        const updated = this.parse8601 (updatedAt);
        if (currency === undefined) {
            currency = this.safeString (transaction, 'currency');
            currency = this.safeCurrencyCode (currency);
        }
        const id = this.safeString (transaction, 'id', 'tid');
        const txid = this.safeString (transaction, 'txid');
        const state = this.safeString (transaction, 'state');
        const status = this.parseTransactionStatus (state);
        const comment = this.safeString (transaction, 'note');
        const addressTo = this.safeString (transaction, 'address');
        const fee = this.safeNumber (transaction, 'fee');
        const amount = this.safeNumber (transaction, 'amount');
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': addressTo,
            'addressTo': addressTo,
            'tagFrom': undefined,
            'tag': comment,
            'tagTo': comment,
            'type': type,
            'amount': amount,
            'currency': currency,
            'status': status,
            'updated': updated,
            'comment': comment,
            'fee': {
                'currency': currency,
                'cost': fee,
                'rate': undefined,
            },
        };
    }

    async fetchTransactionsByType (type = undefined, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'order_by': 'asc',
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['time_from'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let method = 'privateGetAccountTransactions';
        if (type === 'deposit') {
            method = 'privateGetAccountDeposits';
        } else if (type === 'withdrawal') {
            method = 'privateGetAccountWithdraws';
        }
        const response = await this[method] (this.extend (request, params));
        if (!this.isArray (response)) {
            return [];
        }
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            if (type === 'deposit') {
                item['type'] = 'deposit';
                item['updated_at'] = item['completed_at'];
            } else if (type === 'withdrawal') {
                item['type'] = 'withdrawal';
                item['address'] = item['rid'];
                item['txid'] = item['blockchain_txid'];
            }
            result.push (item);
        }
        return this.parseTransactions (result, currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        // [
        //   {
        //     address: '0x6fe5a2e4c137d7dc178bdaacfb8cda15b2181665',
        //     currency: 'bnb',
        //     amount: '1.000000000000000000',
        //     fee: '0.000000000000000000',
        //     txid: '0x6076decd3239e87cde86fd5de9366c08e489243eb976de29b424a27bfaa46032',
        //     state: 'dispatched',
        //     note: null,
        //     confirmations: '39957',
        //     created_at: '2021-10-09T08:08:46+03:00',
        //     updated_at: '2021-10-09T08:09:07+03:00',
        //     type: 'Deposit'
        //   },
        //   ...
        // ]
        return await this.fetchTransactionsByType (undefined, code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        // [
        //   {
        //     "id": 0,
        //     "currency": "string",
        //     "amount": 0,
        //     "fee": 0,
        //     "txid": "string",
        //     "confirmations": 0,
        //     "state": "string",
        //     "transfer_type": "string",
        //     "transfer_links": [
        //       [
        //         {
        //           "title": "telegram",
        //           "url": "https://t.me/BTC_STAGE_BOT?start=b_0f8c3db61f223ea9df072fd37e0b6315"
        //         },
        //         {
        //           "title": "web",
        //           "url": "https://s-www.lgk.one/p2p/?start=b_0f8c3db61f223ea9df072fd37e0b6315"
        //         }
        //       ]
        //     ],
        //     "created_at": "string",
        //     "completed_at": "string",
        //     "tid": "string",
        //     "invoice_expires_at": "string"
        //   },
        // ...
        // ]
        return await this.fetchTransactionsByType ('deposit', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        // [
        //   {
        //     "id": 0,
        //     "currency": "string",
        //     "type": "string",
        //     "amount": "string",
        //     "fee": 0,
        //     "blockchain_txid": "string",
        //     "rid": "string",
        //     "state": "string",
        //     "confirmations": 0,
        //     "note": "string",
        //     "transfer_type": "string",
        //     "created_at": "string",
        //     "updated_at": "string",
        //     "done_at": "string",
        //     "transfer_links": [
        //       [
        //         {
        //           "title": "telegram",
        //           "url": "https://t.me/BTC_STAGE_BOT?start=b_0f8c3db61f223ea9df072fd37e0b6315"
        //         },
        //         {
        //           "title": "web",
        //           "url": "https://s-www.lgk.one/p2p/?start=b_0f8c3db61f223ea9df072fd37e0b6315"
        //         }
        //       ]
        //     ]
        //   },
        //   ...
        // ]
        return await this.fetchTransactionsByType ('withdrawal', code, since, limit, params);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const id = this.safeString (params, 'id');
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires and extra `id` param (benericiary id from this.privateGetAccountBeneficiares() method)');
        }
        params = this.omit (params, 'id');
        const otp = this.totp (this.totpSecret);
        const request = {
            'otp': otp,
            'beneficiary_id': id,
            'currency': currency,
            'amount': amount,
            'note': tag,
        };
        const response = await this.privatePostAccountWithdraws (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const baseUrl = this.implodeHostname (this.urls.api[api]);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        headers = {
            'Accept': 'application/json',
        };
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (method === 'POST') {
            headers['Content-type'] = 'application/json';
            body = this.json (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const message = this.encode (nonce.toString ()) + this.encode (this.apiKey);
            const signature = this.hmac (message, this.encode (this.secret), 'sha256', 'hex');
            headers['X-Auth-ApiKey'] = this.apiKey;
            headers['X-Auth-Nonce'] = nonce;
            headers['X-Auth-Signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
    }
};
