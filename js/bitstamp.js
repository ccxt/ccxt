'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, NotSupported, PermissionDenied, InvalidNonce, OrderNotFound, InsufficientFunds, InvalidAddress, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitstamp extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitstamp',
            'name': 'Bitstamp',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'version': 'v2',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': true,
                'fetchDepositAddress': true,
                'fetchOrder': 'emulated',
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api': 'https://www.bitstamp.net/api',
                'www': 'https://www.bitstamp.net',
                'doc': 'https://www.bitstamp.net/api',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        'order_book/{pair}/',
                        'ticker_hour/{pair}/',
                        'ticker/{pair}/',
                        'transactions/{pair}/',
                        'trading-pairs-info/',
                    ],
                },
                'private': {
                    'post': [
                        'balance/',
                        'balance/{pair}/',
                        'bch_withdrawal/',
                        'bch_address/',
                        'user_transactions/',
                        'user_transactions/{pair}/',
                        'open_orders/all/',
                        'open_orders/{pair}/',
                        'order_status/',
                        'cancel_order/',
                        'buy/{pair}/',
                        'buy/market/{pair}/',
                        'buy/instant/{pair}/',
                        'sell/{pair}/',
                        'sell/market/{pair}/',
                        'sell/instant/{pair}/',
                        'ltc_withdrawal/',
                        'ltc_address/',
                        'eth_withdrawal/',
                        'eth_address/',
                        'xrp_withdrawal/',
                        'xrp_address/',
                        'transfer-to-main/',
                        'transfer-from-main/',
                        'withdrawal-requests/',
                        'withdrawal/open/',
                        'withdrawal/status/',
                        'withdrawal/cancel/',
                        'liquidation_address/new/',
                        'liquidation_address/info/',
                    ],
                },
                'v1': {
                    'post': [
                        'bitcoin_deposit_address/',
                        'unconfirmed_btc/',
                        'bitcoin_withdrawal/',
                        'ripple_withdrawal/',
                        'ripple_address/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.25 / 100],
                            [20000, 0.24 / 100],
                            [100000, 0.22 / 100],
                            [400000, 0.20 / 100],
                            [600000, 0.15 / 100],
                            [1000000, 0.14 / 100],
                            [2000000, 0.13 / 100],
                            [4000000, 0.12 / 100],
                            [20000000, 0.11 / 100],
                            [20000001, 0.10 / 100],
                        ],
                        'maker': [
                            [0, 0.25 / 100],
                            [20000, 0.24 / 100],
                            [100000, 0.22 / 100],
                            [400000, 0.20 / 100],
                            [600000, 0.15 / 100],
                            [1000000, 0.14 / 100],
                            [2000000, 0.13 / 100],
                            [4000000, 0.12 / 100],
                            [20000000, 0.11 / 100],
                            [20000001, 0.10 / 100],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0,
                        'BCH': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'XRP': 0,
                        'USD': 25,
                        'EUR': 0.90,
                    },
                    'deposit': {
                        'BTC': 0,
                        'BCH': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'XRP': 0,
                        'USD': 25,
                        'EUR': 0,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    'No permission found': PermissionDenied,
                    'API key not found': AuthenticationError,
                    'IP address not allowed': PermissionDenied,
                    'Invalid nonce': InvalidNonce,
                    'Invalid signature': AuthenticationError,
                    'Authentication failed': AuthenticationError,
                    'Missing key, signature and nonce parameters': AuthenticationError,
                    'Your account is frozen': PermissionDenied,
                    'Please update your profile with your FATCA information, before using API.': PermissionDenied,
                    'Order not found': OrderNotFound,
                    'Price is more than 20% below market price.': InvalidOrder,
                },
                'broad': {
                    'Minimum order size is': InvalidOrder, // Minimum order size is 5.0 EUR.
                    'Check your account balance for details.': InsufficientFunds, // You have only 0.00100000 BTC available. Check your account balance for details.
                    'Ensure this value has at least': InvalidAddress, // Ensure this value has at least 25 characters (it has 4).
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTradingPairsInfo (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const name = this.safeString (market, 'name');
            let [ base, quote ] = name.split ('/');
            const baseId = base.toLowerCase ();
            const quoteId = quote.toLowerCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            const symbolId = baseId + '_' + quoteId;
            const id = this.safeString (market, 'url_symbol');
            const precision = {
                'amount': market['base_decimals'],
                'price': market['counter_decimals'],
            };
            const parts = market['minimum_order'].split (' ');
            const cost = parts[0];
            // let [ cost, currency ] = market['minimum_order'].split (' ');
            const active = (market['trading'] === 'Enabled');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'symbolId': symbolId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': parseFloat (cost),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this.publicGetOrderBookPair (this.extend (request, params));
        let timestamp = this.safeInteger (response, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        return this.parseOrderBook (response, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const ticker = await this.publicGetTickerPair (this.extend (request, params));
        let timestamp = this.safeInteger (ticker, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const vwap = this.safeFloat (ticker, 'vwap');
        const baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    getCurrencyIdFromTransaction (transaction) {
        //
        //     {
        //         "fee": "0.00000000",
        //         "btc_usd": "0.00",
        //         "datetime": XXX,
        //         "usd": 0.0,
        //         "btc": 0.0,
        //         "eth": "0.05000000",
        //         "type": "0",
        //         "id": XXX,
        //         "eur": 0.0
        //     }
        //
        if ('currency' in transaction) {
            return transaction['currency'].toLowerCase ();
        }
        transaction = this.omit (transaction, [
            'fee',
            'price',
            'datetime',
            'type',
            'status',
            'id',
        ]);
        const ids = Object.keys (transaction);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (id.indexOf ('_') < 0) {
                const value = this.safeFloat (transaction, id);
                if ((value !== undefined) && (value !== 0)) {
                    return id;
                }
            }
        }
        return undefined;
    }

    getMarketFromTrade (trade) {
        trade = this.omit (trade, [
            'fee',
            'price',
            'datetime',
            'tid',
            'type',
            'order_id',
            'side',
        ]);
        const currencyIds = Object.keys (trade);
        const numCurrencyIds = currencyIds.length;
        if (numCurrencyIds > 2) {
            throw new ExchangeError (this.id + ' getMarketFromTrade too many keys: ' + this.json (currencyIds) + ' in the trade: ' + this.json (trade));
        }
        if (numCurrencyIds === 2) {
            let marketId = currencyIds[0] + currencyIds[1];
            if (marketId in this.markets_by_id) {
                return this.markets_by_id[marketId];
            }
            marketId = currencyIds[1] + currencyIds[0];
            if (marketId in this.markets_by_id) {
                return this.markets_by_id[marketId];
            }
        }
        return undefined;
    }

    getMarketFromTrades (trades) {
        const tradesBySymbol = this.indexBy (trades, 'symbol');
        const symbols = Object.keys (tradesBySymbol);
        const numSymbols = symbols.length;
        if (numSymbols === 1) {
            return this.markets[symbols[0]];
        }
        return undefined;
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         date: '1551814435',
        //         tid: '83581898',
        //         price: '0.03532850',
        //         type: '1',
        //         amount: '0.85945907'
        //     },
        //
        // fetchMyTrades, trades returned within fetchOrder (private)
        //
        //     {
        //         "usd": "6.0134400000000000",
        //         "price": "4008.96000000",
        //         "datetime": "2019-03-28 23:07:37.233599",
        //         "fee": "0.02",
        //         "btc": "0.00150000",
        //         "tid": 84452058,
        //         "type": 2
        //     }
        //
        // from fetchOrder:
        //    { fee: '0.000019',
        //     price: '0.00015803',
        //     datetime: '2018-01-07 10:45:34.132551',
        //     btc: '0.0079015000000000',
        //     tid: 42777395,
        //     type: 2, //(0 - deposit; 1 - withdrawal; 2 - market trade) NOT buy/sell
        //     xrp: '50.00000000' }
        const id = this.safeString2 (trade, 'id', 'tid');
        let symbol = undefined;
        let side = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        const orderId = this.safeString (trade, 'order_id');
        const type = undefined;
        let cost = this.safeFloat (trade, 'cost');
        if (market === undefined) {
            const keys = Object.keys (trade);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].indexOf ('_') >= 0) {
                    const marketId = keys[i].replace ('_', '');
                    if (marketId in this.markets_by_id) {
                        market = this.markets_by_id[marketId];
                    }
                }
            }
            // if the market is still not defined
            // try to deduce it from used keys
            if (market === undefined) {
                market = this.getMarketFromTrade (trade);
            }
        }
        const feeCost = this.safeFloat (trade, 'fee');
        let feeCurrency = undefined;
        if (market !== undefined) {
            price = this.safeFloat (trade, market['symbolId'], price);
            amount = this.safeFloat (trade, market['baseId'], amount);
            cost = this.safeFloat (trade, market['quoteId'], cost);
            feeCurrency = market['quote'];
            symbol = market['symbol'];
        }
        let timestamp = this.safeString2 (trade, 'date', 'datetime');
        if (timestamp !== undefined) {
            if (timestamp.indexOf (' ') >= 0) {
                // iso8601
                timestamp = this.parse8601 (timestamp);
            } else {
                // string unix epoch in seconds
                timestamp = parseInt (timestamp);
                timestamp = timestamp * 1000;
            }
        }
        // if it is a private trade
        if ('id' in trade) {
            if (amount !== undefined) {
                if (amount < 0) {
                    side = 'sell';
                    amount = -amount;
                } else {
                    side = 'buy';
                }
            }
        } else {
            side = this.safeString (trade, 'type');
            if (side === '1') {
                side = 'sell';
            } else if (side === '0') {
                side = 'buy';
            }
        }
        if (cost === undefined) {
            if (price !== undefined) {
                if (amount !== undefined) {
                    cost = price * amount;
                }
            }
        }
        if (cost !== undefined) {
            cost = Math.abs (cost);
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'time': 'hour',
        };
        const response = await this.publicGetTransactionsPair (this.extend (request, params));
        //
        //     [
        //         {
        //             date: '1551814435',
        //             tid: '83581898',
        //             price: '0.03532850',
        //             type: '1',
        //             amount: '0.85945907'
        //         },
        //         {
        //             date: '1551814434',
        //             tid: '83581896',
        //             price: '0.03532851',
        //             type: '1',
        //             amount: '11.34130961'
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balance = await this.privatePostBalance (params);
        const result = { 'info': balance };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const account = this.account ();
            account['free'] = this.safeFloat (balance, currencyId + '_available');
            account['used'] = this.safeFloat (balance, currencyId + '_reserved');
            account['total'] = this.safeFloat (balance, currencyId + '_balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side);
        const request = {
            'pair': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (type === 'market') {
            method += 'Market';
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        method += 'Pair';
        const response = await this[method] (this.extend (request, params));
        const order = this.parseOrder (response, market);
        return this.extend (order, {
            'type': type,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'In Queue': 'open',
            'Open': 'open',
            'Finished': 'closed',
            'Canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        return this.parseOrderStatus (this.safeString (response, 'status'));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = { 'id': id };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        //
        //     {
        //         "status": "Finished",
        //         "id": 3047704374,
        //         "transactions": [
        //             {
        //                 "usd": "6.0134400000000000",
        //                 "price": "4008.96000000",
        //                 "datetime": "2019-03-28 23:07:37.233599",
        //                 "fee": "0.02",
        //                 "btc": "0.00150000",
        //                 "tid": 84452058,
        //                 "type": 2
        //             }
        //         ]
        //     }
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'privatePostUserTransactions';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
            method += 'Pair';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.filterBy (response, 'type', '2');
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostUserTransactions (this.extend (request, params));
        //
        //     [
        //         {
        //             "fee": "0.00000000",
        //             "btc_usd": "0.00",
        //             "id": 1234567894,
        //             "usd": 0,
        //             "btc": 0,
        //             "datetime": "2018-09-08 09:00:31",
        //             "type": "1",
        //             "xrp": "-20.00000000",
        //             "eur": 0,
        //         },
        //         {
        //             "fee": "0.00000000",
        //             "btc_usd": "0.00",
        //             "id": 1134567891,
        //             "usd": 0,
        //             "btc": 0,
        //             "datetime": "2018-09-07 18:47:52",
        //             "type": "0",
        //             "xrp": "20.00000000",
        //             "eur": 0,
        //         },
        //     ]
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const transactions = this.filterByArray (response, 'type', [ '0', '1' ], false);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['timedelta'] = this.milliseconds () - since;
        }
        const response = await this.privatePostWithdrawalRequests (this.extend (request, params));
        //
        //     [
        //         {
        //             status: 2,
        //             datetime: '2018-10-17 10:58:13',
        //             currency: 'BTC',
        //             amount: '0.29669259',
        //             address: 'aaaaa',
        //             type: 1,
        //             id: 111111,
        //             transaction_id: 'xxxx',
        //         },
        //         {
        //             status: 2,
        //             datetime: '2018-10-17 10:55:17',
        //             currency: 'ETH',
        //             amount: '1.11010664',
        //             address: 'aaaa',
        //             type: 16,
        //             id: 222222,
        //             transaction_id: 'xxxxx',
        //         },
        //     ]
        //
        return this.parseTransactions (response, undefined, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchTransactions
        //
        //     {
        //         "fee": "0.00000000",
        //         "btc_usd": "0.00",
        //         "id": 1234567894,
        //         "usd": 0,
        //         "btc": 0,
        //         "datetime": "2018-09-08 09:00:31",
        //         "type": "1",
        //         "xrp": "-20.00000000",
        //         "eur": 0,
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         status: 2,
        //         datetime: '2018-10-17 10:58:13',
        //         currency: 'BTC',
        //         amount: '0.29669259',
        //         address: 'aaaaa',
        //         type: 1,
        //         id: 111111,
        //         transaction_id: 'xxxx',
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (transaction, 'datetime'));
        const id = this.safeString (transaction, 'id');
        const currencyId = this.getCurrencyIdFromTransaction (transaction);
        const code = this.safeCurrencyCode (currencyId, currency);
        const feeCost = this.safeFloat (transaction, 'fee');
        let feeCurrency = undefined;
        let amount = undefined;
        if (currency !== undefined) {
            amount = this.safeFloat (transaction, currency['id'], amount);
            feeCurrency = currency['code'];
        } else if ((code !== undefined) && (currencyId !== undefined)) {
            amount = this.safeFloat (transaction, currencyId, amount);
            feeCurrency = code;
        }
        if (amount !== undefined) {
            // withdrawals have a negative amount
            amount = Math.abs (amount);
        }
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'));
        let type = this.safeString (transaction, 'type');
        if (status === undefined) {
            if (type === '0') {
                type = 'deposit';
            } else if (type === '1') {
                type = 'withdrawal';
            }
        } else {
            type = 'withdrawal';
        }
        const txid = this.safeString (transaction, 'transaction_id');
        const address = this.safeString (transaction, 'address');
        const tag = undefined; // not documented
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
            'updated': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': feeCost,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatusByType (status) {
        // withdrawals:
        // 0 (open), 1 (in process), 2 (finished), 3 (canceled) or 4 (failed).
        const statuses = {
            '0': 'pending', // Open
            '1': 'pending', // In process
            '2': 'ok', // Finished
            '3': 'canceled', // Canceled
            '4': 'failed', // Failed
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // from fetch order:
        //   { status: 'Finished',
        //     id: 731693945,
        //     transactions:
        //     [ { fee: '0.000019',
        //         price: '0.00015803',
        //         datetime: '2018-01-07 10:45:34.132551',
        //         btc: '0.0079015000000000',
        //         tid: 42777395,
        //         type: 2,
        //         xrp: '50.00000000' } ] }
        //
        // partially filled order:
        //   { "id": 468646390,
        //     "status": "Canceled",
        //     "transactions": [{
        //         "eth": "0.23000000",
        //         "fee": "0.09",
        //         "tid": 25810126,
        //         "usd": "69.8947000000000000",
        //         "type": 2,
        //         "price": "303.89000000",
        //         "datetime": "2017-11-11 07:22:20.710567"
        //     }]}
        //
        // from create order response:
        //     {
        //         price: '0.00008012',
        //         currency_pair: 'XRP/BTC',
        //         datetime: '2019-01-31 21:23:36',
        //         amount: '15.00000000',
        //         type: '0',
        //         id: '2814205012'
        //     }
        //
        const id = this.safeString (order, 'id');
        let side = this.safeString (order, 'type');
        if (side !== undefined) {
            side = (side === '1') ? 'sell' : 'buy';
        }
        // there is no timestamp from fetchOrder
        const timestamp = this.parse8601 (this.safeString (order, 'datetime'));
        let lastTradeTimestamp = undefined;
        let symbol = undefined;
        let marketId = this.safeString (order, 'currency_pair');
        if (marketId !== undefined) {
            marketId = marketId.replace ('/', '');
            marketId = marketId.toLowerCase ();
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        let amount = this.safeFloat (order, 'amount');
        let filled = 0.0;
        const trades = [];
        const transactions = this.safeValue (order, 'transactions', []);
        let feeCost = undefined;
        let cost = undefined;
        const numTransactions = transactions.length;
        if (numTransactions > 0) {
            feeCost = 0.0;
            for (let i = 0; i < numTransactions; i++) {
                const trade = this.parseTrade (this.extend ({
                    'order_id': id,
                    'side': side,
                }, transactions[i]), market);
                filled = this.sum (filled, trade['amount']);
                feeCost = this.sum (feeCost, trade['fee']['cost']);
                if (cost === undefined) {
                    cost = 0.0;
                }
                cost = this.sum (cost, trade['cost']);
                trades.push (trade);
            }
            lastTradeTimestamp = trades[numTransactions - 1]['timestamp'];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        if ((status === 'closed') && (amount === undefined)) {
            amount = filled;
        }
        let remaining = undefined;
        if (amount !== undefined) {
            remaining = amount - filled;
        }
        let price = this.safeFloat (order, 'price');
        if (market === undefined) {
            market = this.getMarketFromTrades (trades);
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            if (symbol === undefined) {
                symbol = market['symbol'];
            }
            feeCurrency = market['quote'];
        }
        if (cost === undefined) {
            if (price !== undefined) {
                cost = price * filled;
            }
        } else if (price === undefined) {
            if (filled > 0) {
                price = cost / filled;
            }
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            if (feeCurrency !== undefined) {
                fee = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        await this.loadMarkets ();
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privatePostOpenOrdersAll (params);
        //     [
        //         {
        //             price: '0.00008012',
        //             currency_pair: 'XRP/BTC',
        //             datetime: '2019-01-31 21:23:36',
        //             amount: '15.00000000',
        //             type: '0',
        //             id: '2814205012',
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const order = this.parseOrder (response[i], market);
            result.push (this.extend (order, {
                'status': 'open',
                'type': 'limit',
            }));
        }
        if (symbol === undefined) {
            return this.filterBySinceLimit (result, since, limit);
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    getCurrencyName (code) {
        if (code === 'BTC') {
            return 'bitcoin';
        }
        return code.toLowerCase ();
    }

    isFiat (code) {
        if (code === 'USD') {
            return true;
        }
        if (code === 'EUR') {
            return true;
        }
        return false;
    }

    async fetchDepositAddress (code, params = {}) {
        if (this.isFiat (code)) {
            throw new NotSupported (this.id + ' fiat fetchDepositAddress() for ' + code + ' is not implemented yet');
        }
        const name = this.getCurrencyName (code);
        const v1 = (code === 'BTC');
        let method = v1 ? 'v1' : 'private'; // v1 or v2
        method += 'Post' + this.capitalize (name);
        method += v1 ? 'Deposit' : '';
        method += 'Address';
        const response = await this[method] (params);
        const address = v1 ? response : this.safeString (response, 'address');
        const tag = v1 ? undefined : this.safeString (response, 'destination_tag');
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
        if (this.isFiat (code)) {
            throw new NotSupported (this.id + ' fiat withdraw() for ' + code + ' is not implemented yet');
        }
        const name = this.getCurrencyName (code);
        const request = {
            'amount': amount,
            'address': address,
        };
        const v1 = (code === 'BTC');
        let method = v1 ? 'v1' : 'private'; // v1 or v2
        method += 'Post' + this.capitalize (name) + 'Withdrawal';
        let query = params;
        if (code === 'XRP') {
            if (tag !== undefined) {
                request['destination_tag'] = tag;
                query = this.omit (params, 'destination_tag');
            } else {
                throw new ExchangeError (this.id + ' withdraw() requires a destination_tag param for ' + code);
            }
        }
        const response = await this[method] (this.extend (request, query));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (api !== 'v1') {
            url += this.version + '/';
        }
        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const auth = nonce + this.uid + this.apiKey;
            const signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            query = this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        //
        //     {"error": "No permission found"} // fetchDepositAddress returns this on apiKeys that don't have the permission required
        //     {"status": "error", "reason": {"__all__": ["Minimum order size is 5.0 EUR."]}}
        //     reuse of a nonce gives: { status: 'error', reason: 'Invalid nonce', code: 'API0004' }
        const status = this.safeString (response, 'status');
        const error = this.safeValue (response, 'error');
        if ((status === 'error') || (error !== undefined)) {
            let errors = [];
            if (typeof error === 'string') {
                errors.push (error);
            } else if (error !== undefined) {
                const keys = Object.keys (error);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = this.safeValue (error, key);
                    if (Array.isArray (value)) {
                        errors = this.arrayConcat (errors, value);
                    } else {
                        errors.push (value);
                    }
                }
            }
            const reason = this.safeValue (response, 'reason', {});
            if (typeof reason === 'string') {
                errors.push (reason);
            } else {
                const all = this.safeValue (reason, '__all__', []);
                for (let i = 0; i < all.length; i++) {
                    errors.push (all[i]);
                }
            }
            const code = this.safeString (response, 'code');
            if (code === 'API0005') {
                throw new AuthenticationError (this.id + ' invalid signature, use the uid for the main account if you have subaccounts');
            }
            const exact = this.exceptions['exact'];
            const broad = this.exceptions['broad'];
            const feedback = this.id + ' ' + body;
            for (let i = 0; i < errors.length; i++) {
                const value = errors[i];
                if (value in exact) {
                    throw new exact[value] (feedback);
                }
                const broadKey = this.findBroadlyMatchedKey (broad, value);
                if (broadKey !== undefined) {
                    throw new broad[broadKey] (feedback);
                }
            }
            throw new ExchangeError (feedback);
        }
    }
};
