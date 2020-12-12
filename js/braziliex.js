'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidOrder, AuthenticationError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class braziliex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'braziliex',
            'name': 'Braziliex',
            'countries': [ 'BR' ],
            'rateLimit': 1000,
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34703593-c4498674-f504-11e7-8d14-ff8e44fb78c1.jpg',
                'api': 'https://braziliex.com/api/v1',
                'www': 'https://braziliex.com/',
                'doc': 'https://braziliex.com/exchange/api.php',
                'fees': 'https://braziliex.com/exchange/fees.php',
                'referral': 'https://braziliex.com/?ref=5FE61AB6F6D67DA885BC98BA27223465',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'ticker',
                        'ticker/{market}',
                        'orderbook/{market}',
                        'tradehistory/{market}',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'complete_balance',
                        'open_orders',
                        'trade_history',
                        'deposit_address',
                        'sell',
                        'buy',
                        'cancel_order',
                        'order_status',
                    ],
                },
            },
            'commonCurrencies': {
                'EPC': 'Epacoin',
                'ABC': 'Anti Bureaucracy Coin',
            },
            'fees': {
                'trading': {
                    'maker': 0.005,
                    'taker': 0.005,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'options': {
                'fetchCurrencies': {
                    'expires': 1000, // 1 second
                },
            },
        });
    }

    async fetchCurrenciesFromCache (params = {}) {
        // this method is now redundant
        // currencies are now fetched before markets
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const response = await this.publicGetCurrencies (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'response': response,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options['fetchCurrencies'], 'response');
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        //
        //     {
        //         brl: {
        //             name: "Real",
        //             withdrawal_txFee:  0.0075,
        //             txWithdrawalFee:  9,
        //             MinWithdrawal:  30,
        //             minConf:  1,
        //             minDeposit:  0,
        //             txDepositFee:  0,
        //             txDepositPercentageFee:  0,
        //             minAmountTradeFIAT:  5,
        //             minAmountTradeBTC:  0.0001,
        //             minAmountTradeUSDT:  0.0001,
        //             decimal:  8,
        //             decimal_withdrawal:  8,
        //             active:  1,
        //             dev_active:  1,
        //             under_maintenance:  0,
        //             order: "010",
        //             is_withdrawal_active:  1,
        //             is_deposit_active:  1,
        //             is_token_erc20:  0,
        //             is_fiat:  1,
        //             gateway:  0,
        //         },
        //         btc: {
        //             name: "Bitcoin",
        //             txWithdrawalMinFee:  0.000125,
        //             txWithdrawalFee:  0.00015625,
        //             MinWithdrawal:  0.0005,
        //             minConf:  1,
        //             minDeposit:  0,
        //             txDepositFee:  0,
        //             txDepositPercentageFee:  0,
        //             minAmountTradeFIAT:  5,
        //             minAmountTradeBTC:  0.0001,
        //             minAmountTradeUSDT:  0.0001,
        //             decimal:  8,
        //             decimal_withdrawal:  8,
        //             active:  1,
        //             dev_active:  1,
        //             under_maintenance:  0,
        //             order: "011",
        //             is_withdrawal_active:  1,
        //             is_deposit_active:  1,
        //             is_token_erc20:  0,
        //             is_fiat:  0,
        //             gateway:  1,
        //         }
        //     }
        //
        this.options['currencies'] = {
            'timestamp': this.milliseconds (),
            'response': response,
        };
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = response[id];
            const precision = this.safeInteger (currency, 'decimal');
            const code = this.safeCurrencyCode (id);
            let active = this.safeInteger (currency, 'active') === 1;
            const maintenance = this.safeInteger (currency, 'under_maintenance');
            if (maintenance !== 0) {
                active = false;
            }
            const canWithdraw = this.safeInteger (currency, 'is_withdrawal_active') === 1;
            const canDeposit = this.safeInteger (currency, 'is_deposit_active') === 1;
            if (!canWithdraw || !canDeposit) {
                active = false;
            }
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': active,
                'precision': precision,
                'funding': {
                    'withdraw': {
                        'active': canWithdraw,
                        'fee': this.safeFloat (currency, 'txWithdrawalFee'),
                    },
                    'deposit': {
                        'active': canDeposit,
                        'fee': this.safeFloat (currency, 'txDepositFee'),
                    },
                },
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'MinWithdrawal'),
                        'max': Math.pow (10, precision),
                    },
                    'deposit': {
                        'min': this.safeFloat (currency, 'minDeposit'),
                        'max': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const currencies = await this.fetchCurrenciesFromCache (params);
        const response = await this.publicGetTicker ();
        //
        //     {
        //         btc_brl: {
        //             active: 1,
        //             market: 'btc_brl',
        //             last: 14648,
        //             percentChange: -0.95,
        //             baseVolume24: 27.856,
        //             quoteVolume24: 409328.039,
        //             baseVolume: 27.856,
        //             quoteVolume: 409328.039,
        //             highestBid24: 14790,
        //             lowestAsk24: 14450.01,
        //             highestBid: 14450.37,
        //             lowestAsk: 14699.98
        //         },
        //         ...
        //     }
        //
        const ids = Object.keys (response);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = response[id];
            const [ baseId, quoteId ] = id.split ('_');
            const uppercaseBaseId = baseId.toUpperCase ();
            const uppercaseQuoteId = quoteId.toUpperCase ();
            const base = this.safeCurrencyCode (uppercaseBaseId);
            const quote = this.safeCurrencyCode (uppercaseQuoteId);
            const symbol = base + '/' + quote;
            const baseCurrency = this.safeValue (currencies, baseId, {});
            const quoteCurrency = this.safeValue (currencies, quoteId, {});
            const quoteIsFiat = this.safeInteger (quoteCurrency, 'is_fiat', 0);
            let minCost = undefined;
            if (quoteIsFiat) {
                minCost = this.safeFloat (baseCurrency, 'minAmountTradeFIAT');
            } else {
                minCost = this.safeFloat (baseCurrency, 'minAmountTrade' + uppercaseQuoteId);
            }
            const isActive = this.safeInteger (market, 'active');
            const active = (isActive === 1);
            const precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highestBid24'),
            'low': this.safeFloat (ticker, 'lowestAsk24'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'percentChange'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume24'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume24'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTickerMarket (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const marketId = ids[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (response[marketId], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        const response = await this.publicGetOrderbookMarket (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString2 (trade, 'date_exec', 'date'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const cost = this.safeFloat (trade, 'total');
        const orderId = this.safeString (trade, 'order_number');
        const type = 'limit';
        const side = this.safeString (trade, 'type');
        const id = this.safeString (trade, '_id');
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
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTradehistoryMarket (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privatePostCompleteBalance (params);
        const result = { 'info': balances };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = balances[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['total'] = this.safeFloat (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "order_number":"58ee441d05f8233fadabfb07",
        //         "type":"buy",
        //         "market":"ltc_btc",
        //         "price":"0.01000000",
        //         "amount":"0.00200000",
        //         "total":"0.00002000",
        //         "progress":"1.0000",
        //         "date":"2017-03-12 15:13:33"
        //     }
        //
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market, '_');
        let timestamp = this.safeInteger (order, 'timestamp');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (order, 'date'));
        }
        const price = this.safeFloat (order, 'price');
        const cost = this.safeFloat (order, 'total', 0.0);
        const amount = this.safeFloat (order, 'amount');
        const filledPercentage = this.safeFloat (order, 'progress');
        const filled = amount * filledPercentage;
        const remaining = parseFloat (this.amountToPrecision (symbol, amount - filled));
        let info = order;
        if ('info' in info) {
            info = order['info'];
        }
        const id = this.safeString (order, 'order_number');
        const fee = this.safeValue (order, 'fee'); // propagated from createOrder
        const status = (filledPercentage === 1.0) ? 'closed' : 'open';
        const side = this.safeString (order, 'type');
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': info,
            'average': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = 'privatePost' + this.capitalize (side);
        const request = {
            'market': market['id'],
            // 'price': this.priceToPrecision (symbol, price),
            // 'amount': this.amountToPrecision (symbol, amount),
            'price': price,
            'amount': amount,
        };
        const response = await this[method] (this.extend (request, params));
        //
        // sell
        //
        //     {
        //         "success":1,
        //         "message":" ##RESERVED FOR ORDER / SELL / XMR_BTC / AMOUNT: 0.01 XMR / PRICE: 0.017 BTC / TOTAL: 0.00017000 BTC / FEE: 0.00002500 XMR ",
        //         "order_number":"590b962ba5b98335965fa0a8"
        //     }
        //
        // buy
        //
        //     {
        //         "success":1,
        //         "message":" ##RESERVED FOR ORDER / BUY / XMR_BTC / AMOUNT: 0.005 XMR / PRICE: 0.017 BTC / TOTAL: 0.00008500 BTC / FEE: 0.00000021 BTC ",
        //         "order_number":"590b962ba5b98335965fa0c0"
        //     }
        //
        const success = this.safeInteger (response, 'success');
        if (success !== 1) {
            throw new InvalidOrder (this.id + ' ' + this.json (response));
        }
        const message = this.safeString (response, 'message');
        let parts = message.split (' / ');
        parts = parts.slice (1);
        const feeParts = parts[5].split (' ');
        const amountParts = parts[2].split (' ');
        const priceParts = parts[3].split (' ');
        const totalParts = parts[4].split (' ');
        const order = this.parseOrder ({
            'timestamp': this.milliseconds (),
            'order_number': response['order_number'],
            'type': this.safeStringLower (parts, 0),
            'market': parts[0].toLowerCase (),
            'amount': this.safeString (amountParts, 1),
            'price': this.safeString (priceParts, 1),
            'total': this.safeString (totalParts, 1),
            'fee': {
                'cost': this.safeFloat (feeParts, 1),
                'currency': this.safeString (feeParts, 2),
            },
            'progress': '0.0',
            'info': response,
        }, market);
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_number': id,
            'market': market['id'],
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_number': id,
            'market': market['id'],
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privatePostOpenOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'order_open', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        const trades = this.safeValue (response, 'trade_history', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostDepositAddress (this.extend (request, params));
        const address = this.safeString (response, 'deposit_address');
        this.checkAddress (address);
        const tag = this.safeString (response, 'payment_id');
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            query = this.extend ({
                'command': path,
                'nonce': this.nonce (),
            }, query);
            body = this.urlencode (query);
            const signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
            headers = {
                'Content-type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ((typeof response === 'string') && (response.length < 1)) {
            throw new ExchangeError (this.id + ' returned empty response');
        }
        if ('success' in response) {
            const success = this.safeInteger (response, 'success');
            if (success === 0) {
                const message = this.safeString (response, 'message');
                if (message === 'Invalid APIKey') {
                    throw new AuthenticationError (message);
                }
                throw new ExchangeError (message);
            }
        }
        return response;
    }
};
