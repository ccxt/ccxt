'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InsufficientFunds, ArgumentsRequired, ExchangeError, InvalidOrder, InvalidAddress, AuthenticationError, NotSupported, OrderNotFound } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class gdax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gdax',
            'name': 'GDAX',
            'countries': [ 'US' ],
            'rateLimit': 1000,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'cancelAllOrders': true,
                'CORS': true,
                'deposit': true,
                'fetchAccounts': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'createDepositAddress': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderTrades': true,
                'fetchOrders': true,
                'fetchTransactions': true,
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
            'urls': {
                'test': 'https://api-public.sandbox.gdax.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
                'api': 'https://api.gdax.com',
                'www': 'https://www.gdax.com',
                'doc': 'https://docs.gdax.com',
                'fees': [
                    'https://www.gdax.com/fees',
                    'https://support.gdax.com/customer/en/portal/topics/939402-depositing-and-withdrawing-funds/articles',
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
                        'coinbase-accounts/{id}/addresses',
                        'fills',
                        'funding',
                        'orders',
                        'orders/{id}',
                        'otc/orders',
                        'payment-methods',
                        'position',
                        'reports/{id}',
                        'users/self/trailing-volume',
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
                        'reports',
                        'withdrawals/coinbase',
                        'withdrawals/crypto',
                        'withdrawals/payment-method',
                    ],
                    'delete': [
                        'orders',
                        'orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true, // complicated tier system per coin
                    'percentage': true,
                    'maker': 0.15 / 100, // highest fee of all tiers
                    'taker': 0.25 / 100, // highest fee of all tiers
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
                },
                'broad': {
                    'Order already done': OrderNotFound,
                    'order not found': OrderNotFound,
                    'price too small': InvalidOrder,
                    'price too precise': InvalidOrder,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProducts (params);
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
                'amount': this.precisionFromString (this.safeString (market, 'base_increment')),
                'price': this.precisionFromString (this.safeString (market, 'quote_increment')),
            };
            let taker = this.fees['trading']['taker'];  // does not seem right
            if ((base === 'ETH') || (base === 'LTC')) {
                taker = 0.003;
            }
            const active = market['status'] === 'online';
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
                'taker': taker,
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
        const request = {
            'id': this.marketId (symbol),
            'level': 2, // 1 best bidask, 2 aggregated, 3 full
        };
        const response = await this.publicGetProductsIdBook (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const ticker = await this.publicGetProductsIdTicker (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeValue (ticker, 'time'));
        const bid = this.safeFloat (ticker, 'bid');
        const ask = this.safeFloat (ticker, 'ask');
        const last = this.safeFloat (ticker, 'price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
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

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString2 (trade, 'time', 'created_at'));
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (trade, 'product_id');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market) {
            symbol = market['symbol'];
        }
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
        // GDAX returns inverted side to fetchMyTrades vs fetchTrades
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[3],
            ohlcv[2],
            ohlcv[1],
            ohlcv[4],
            ohlcv[5],
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
            request['start'] = this.ymdhms (since);
            if (limit === undefined) {
                // https://docs.gdax.com/#get-historic-rates
                limit = 300; // max = 300
            }
            request['end'] = this.ymdhms (this.sum (limit * granularity * 1000, since));
        }
        const response = await this.publicGetProductsIdCandles (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        return this.parse8601 (this.parse8601 (response, 'iso'));
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
        const timestamp = this.parse8601 (order['created_at']);
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'product_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const price = this.safeFloat (order, 'price');
        let amount = this.safeFloat2 (order, 'size', 'funds');
        if (amount === undefined) {
            amount = this.safeFloat (order, 'specified_funds');
        }
        const filled = this.safeFloat (order, 'filled_size');
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
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        return {
            'id': id,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
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
            // deposit into GDAX account from a Coinbase account
            method += 'CoinbaseAccount';
        } else {
            // deposit methodotherwise we did not receive a supported deposit location
            // relevant docs link for the Googlers
            // https://docs.gdax.com/#deposits
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
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency code argument if no account id specified in params');
            }
            currency = this.currency (code);
            const accountsByCurrencyCode = this.indexBy (this.accounts, 'currency');
            const account = this.safeValue (accountsByCurrencyCode, code);
            if (account === undefined) {
                throw new ExchangeError (this.id + ' fetchTransactions() could not find account id for ' + code);
            }
            id = account['id'];
        }
        const request = {
            'id': id,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAccountsIdTransfers (this.extend (request, params));
        for (let i = 0; i < response.length; i++) {
            response[i]['currency'] = code;
        }
        return this.parseTransactions (response, currency, since, limit);
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
        const fee = undefined;
        const status = this.parseTransactionStatus (transaction);
        const amount = this.safeFloat (transaction, 'amount');
        let type = this.safeString (transaction, 'type');
        let address = this.safeString (details, 'crypto_address');
        const tag = this.safeString (details, 'destination_tag');
        address = this.safeString (transaction, 'crypto_address', address);
        if (type === 'withdraw') {
            type = 'withdrawal';
            address = this.safeString (details, 'sent_to_address', address);
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
        const url = this.urls['api'] + request;
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
            // let payload = (body) ? body : '';
            const what = nonce + method + request + payload;
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (what), secret, 'sha256', 'base64');
            headers = {
                'CB-ACCESS-KEY': this.apiKey,
                'CB-ACCESS-SIGN': this.decode (signature),
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchDepositAddress (code, params = {}) {
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
        const response = await this.privateGetCoinbaseAccountsIdAddresses (this.extend (request, params));
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'destination_tag');
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'info': response,
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

    handleErrors (code, reason, url, method, headers, body, response) {
        if ((code === 400) || (code === 404)) {
            if (body[0] === '{') {
                const message = response['message'];
                const feedback = this.id + ' ' + message;
                const exact = this.exceptions['exact'];
                if (message in exact) {
                    throw new exact[message] (feedback);
                }
                const broad = this.exceptions['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, message);
                if (broadKey !== undefined) {
                    throw new broad[broadKey] (feedback);
                }
                throw new ExchangeError (feedback); // unknown message
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
