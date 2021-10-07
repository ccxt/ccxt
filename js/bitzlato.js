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
                // 'cancelAllOrders': true,
                // 'cancelOrder': true,
                // 'cancelOrders': undefined,
                'CORS': true,
                'createOrder': true,
                // 'createLimitOrder': true,
                // 'createMarketOrder': true,
                // 'createDepositAddress': undefined,
                // 'deposit': undefined,
                // 'editOrder': 'emulated',
                'fetchBalance': true,
                // 'fetchBidsAsks': undefined,
                // 'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
                // 'fetchDepositAddress': undefined,
                // 'fetchDeposits': undefined,
                // 'fetchFundingFees': undefined,
                // 'fetchLedger': undefined,
                'fetchMarkets': true,
                // 'fetchMyTrades': undefined,
                // 'fetchOHLCV': 'emulated',
                // 'fetchOpenOrders': undefined,
                // 'fetchOrder': undefined,
                'fetchOrderBook': true,
                // 'fetchOrderBooks': undefined,
                // 'fetchOrders': undefined,
                // 'fetchOrderTrades': undefined,
                'fetchStatus': true,
                // 'fetchTicker': true,
                // 'fetchTickers': undefined,
                'fetchTime': true,
                // 'fetchTrades': true,
                // 'fetchTradingFee': undefined,
                // 'fetchTradingFees': undefined,
                // 'fetchTradingLimits': undefined,
                // 'fetchTransactions': undefined,
                // 'fetchWithdrawals': undefined,
                // 'withdraw': undefined,
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
                        'account/trades',
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
            'headers': {
                'Accept': 'application/json',
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
        const response = await this.publicGetCurrencies(this.extend (request, params));
        if (!this.isArray(response)) {
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
            const account =  this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder is not implemented yet');
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
    }

    async fetchTickers (symbols = undefined, params = {}) {
    }

    async fetchTicker (symbol, params = {}) {
    }

    parseSymbol (marketId) {
    }

    parseTrade (trade, market = undefined) {
        // [
        //     {
        //         'info':       { ... },                  // the original decoded JSON as is
        //         'id':        '12345-67890:09876/54321', // string trade id
        //         'timestamp':  1502962946216,            // Unix timestamp in milliseconds
        //         'datetime':  '2017-08-17 12:42:48.000', // ISO8601 datetime with milliseconds
        //         'symbol':    'ETH/BTC',                 // symbol
        //         'order':     '12345-67890:09876/54321', // string order id or undefined/None/null
        //         'type':      'limit',                   // order type, 'market', 'limit' or undefined/None/null
        //         'side':      'buy',                     // direction of the trade, 'buy' or 'sell'
        //         'price':      0.06917684,               // float price in quote currency
        //         'amount':     1.5,                      // amount of base currency
        //     },
        //     ...
        // ]
    }

    purseTrades() {
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market,
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            const timestamp = 
            request['timestamp'] = timestamp;
        }
        const response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 100, params = {}) {
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
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
        const response = await this.privatePostMarketOrders(this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
    }

    async fetchClosedOrder (id, symbol = undefined, params = {}) {
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async createDepositAddress (code, params = {}) {
    }

    async fetchDepositAddress (code, params = {}) {
    }

    parseTransactionStatus (status) {
    }

    parseTransaction (transaction, currency = undefined) {
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
    }

    async fetchPositions (symbols = undefined, params = {}) {
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const baseUrl = this.implodeHostname (this.urls.api[api]);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        headers = {
          'Accept': 'application/json'
        }
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (method === 'POST') {
            headers['Content-type'] = 'application/json'
            body = this.json (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const message = this.encode (nonce.toString()) + this.encode (this.apiKey);
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
