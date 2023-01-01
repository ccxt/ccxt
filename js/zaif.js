'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class zaif extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zaif',
            'name': 'Zaif',
            'countries': [ 'JP' ],
            // 10 requests per second = 1000ms / 10 = 100ms between requests (public market endpoints)
            'rateLimit': 100,
            'version': '1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg',
                'api': {
                    'rest': 'https://api.zaif.jp',
                },
                'www': 'https://zaif.jp',
                'doc': [
                    'https://techbureau-api-document.readthedocs.io/ja/latest/index.html',
                    'https://corp.zaif.jp/api-docs',
                    'https://corp.zaif.jp/api-docs/api_links',
                    'https://www.npmjs.com/package/zaif.jp',
                    'https://github.com/you21979/node-zaif',
                ],
                'fees': 'https://zaif.jp/fee?lang=en',
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0'),
                },
            },
            'api': {
                'public': {
                    'get': {
                        'depth/{pair}': 1,
                        'currencies/{pair}': 1,
                        'currencies/all': 1,
                        'currency_pairs/{pair}': 1,
                        'currency_pairs/all': 1,
                        'last_price/{pair}': 1,
                        'ticker/{pair}': 1,
                        'trades/{pair}': 1,
                    },
                },
                'private': {
                    'post': {
                        'active_orders': 5, // 10 in 5 seconds = 2 per second => cost = 10 / 2 = 5
                        'cancel_order': 5,
                        'deposit_history': 5,
                        'get_id_info': 5,
                        'get_info': 10, // 10 in 10 seconds = 1 per second => cost = 10 / 1 = 10
                        'get_info2': 5, // 20 in 10 seconds = 2 per second => cost = 10 / 2 = 5
                        'get_personal_info': 5,
                        'trade': 5,
                        'trade_history': 50, // 12 in 60 seconds = 0.2 per second => cost = 10 / 0.2 = 50
                        'withdraw': 5,
                        'withdraw_history': 5,
                    },
                },
                'ecapi': {
                    'post': {
                        'createInvoice': 1, // unverified
                        'getInvoice': 1,
                        'getInvoiceIdsByOrderNumber': 1,
                        'cancelInvoice': 1,
                    },
                },
                'tlapi': {
                    'post': {
                        'get_positions': 66, // 10 in 60 seconds = 0.166 per second => cost = 10 / 0.166 = 66
                        'position_history': 66, // 10 in 60 seconds
                        'active_positions': 5, // 20 in 10 seconds
                        'create_position': 33, // 3 in 10 seconds = 0.3 per second => cost = 10 / 0.3 = 33
                        'change_position': 33, // 3 in 10 seconds
                        'cancel_position': 33, // 3 in 10 seconds
                    },
                },
                'fapi': {
                    'get': {
                        'groups/{group_id}': 1, // testing
                        'last_price/{group_id}/{pair}': 1,
                        'ticker/{group_id}/{pair}': 1,
                        'trades/{group_id}/{pair}': 1,
                        'depth/{group_id}/{pair}': 1,
                    },
                },
            },
            'options': {
                // zaif schedule defines several market-specific fees
                'fees': {
                    'BTC/JPY': { 'maker': this.parseNumber ('0'), 'taker': this.parseNumber ('0.001') },
                    'BCH/JPY': { 'maker': this.parseNumber ('0'), 'taker': this.parseNumber ('0.003') },
                    'BCH/BTC': { 'maker': this.parseNumber ('0'), 'taker': this.parseNumber ('0.003') },
                    'PEPECASH/JPY': { 'maker': this.parseNumber ('0'), 'taker': this.parseNumber ('0.0001') },
                    'PEPECASH/BT': { 'maker': this.parseNumber ('0'), 'taker': this.parseNumber ('0.0001') },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'unsupported currency_pair': BadRequest, // {"error": "unsupported currency_pair"}
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name zaif#fetchMarkets
         * @description retrieves data on all markets for zaif
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const markets = await this.publicGetCurrencyPairsAll (params);
        //
        //     [
        //         {
        //             "aux_unit_point": 0,
        //             "item_japanese": "\u30d3\u30c3\u30c8\u30b3\u30a4\u30f3",
        //             "aux_unit_step": 5.0,
        //             "description": "\u30d3\u30c3\u30c8\u30b3\u30a4\u30f3\u30fb\u65e5\u672c\u5186\u306e\u53d6\u5f15\u3092\u884c\u3046\u3053\u3068\u304c\u3067\u304d\u307e\u3059",
        //             "item_unit_min": 0.001,
        //             "event_number": 0,
        //             "currency_pair": "btc_jpy",
        //             "is_token": false,
        //             "aux_unit_min": 5.0,
        //             "aux_japanese": "\u65e5\u672c\u5186",
        //             "id": 1,
        //             "item_unit_step": 0.0001,
        //             "name": "BTC/JPY",
        //             "seq": 0,
        //             "title": "BTC/JPY"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'currency_pair');
            const name = this.safeString (market, 'name');
            const [ baseId, quoteId ] = name.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const fees = this.safeValue (this.options['fees'], symbol, this.fees['trading']);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined, // can trade or not
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': fees['taker'],
                'maker': fees['maker'],
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'item_unit_step'),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'aux_unit_point'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'item_unit_min'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'aux_unit_min'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'return', {});
        const deposit = this.safeValue (balances, 'deposit');
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const funds = this.safeValue (balances, 'funds', {});
        const currencyIds = Object.keys (funds);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeString (funds, currencyId);
            const account = this.account ();
            account['free'] = balance;
            account['total'] = balance;
            if (deposit !== undefined) {
                if (currencyId in deposit) {
                    account['total'] = this.safeString (deposit, currencyId);
                }
            }
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name zaif#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name zaif#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetDepthPair (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol']);
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "last": 9e-08,
        //     "high": 1e-07,
        //     "low": 9e-08,
        //     "vwap": 0.0,
        //     "volume": 135250.0,
        //     "bid": 9e-08,
        //     "ask": 1e-07
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.milliseconds ();
        const vwap = this.safeString (ticker, 'vwap');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = Precise.stringMul (baseVolume, vwap);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name zaif#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const ticker = await this.publicGetTickerPair (this.extend (request, params));
        //
        // {
        //     "last": 9e-08,
        //     "high": 1e-07,
        //     "low": 9e-08,
        //     "vwap": 0.0,
        //     "volume": 135250.0,
        //     "bid": 9e-08,
        //     "ask": 1e-07
        // }
        //
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "date": 1648559414,
        //          "price": 5880375.0,
        //          "amount": 0.017,
        //          "tid": 176126557,
        //          "currency_pair": "btc_jpy",
        //          "trade_type": "ask"
        //      }
        //
        let side = this.safeString (trade, 'trade_type');
        side = (side === 'bid') ? 'buy' : 'sell';
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString2 (trade, 'id', 'tid');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const marketId = this.safeString (trade, 'currency_pair');
        const symbol = this.safeSymbol (marketId, market, '_');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zaif#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        let response = await this.publicGetTradesPair (this.extend (request, params));
        //
        //      [
        //          {
        //              "date": 1648559414,
        //              "price": 5880375.0,
        //              "amount": 0.017,
        //              "tid": 176126557,
        //              "currency_pair": "btc_jpy",
        //              "trade_type": "ask"
        //          }, ...
        //      ]
        //
        const numTrades = response.length;
        if (numTrades === 1) {
            const firstTrade = response[0];
            if (!Object.keys (firstTrade).length) {
                response = [];
            }
        }
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name zaif#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' createOrder() allows limit orders only');
        }
        const market = this.market (symbol);
        const request = {
            'currency_pair': market['id'],
            'action': (side === 'buy') ? 'bid' : 'ask',
            'amount': amount,
            'price': price,
        };
        const response = await this.privatePostTrade (this.extend (request, params));
        return {
            'info': response,
            'id': response['return']['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name zaif#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by zaif cancelOrder ()
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'order_id': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "currency_pair": "btc_jpy",
        //         "action": "ask",
        //         "amount": 0.03,
        //         "price": 56000,
        //         "timestamp": 1402021125,
        //         "comment" : "demo"
        //     }
        //
        let side = this.safeString (order, 'action');
        side = (side === 'bid') ? 'buy' : 'sell';
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const marketId = this.safeString (order, 'currency_pair');
        const symbol = this.safeSymbol (marketId, market, '_');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const id = this.safeString (order, 'id');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zaif#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'is_token': false,
            // 'is_token_both': false,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currency_pair'] = market['id'];
        }
        const response = await this.privatePostActiveOrders (this.extend (request, params));
        return this.parseOrders (response['return'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zaif#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'from': 0,
            // 'count': 1000,
            // 'from_id': 0,
            // 'end_id': 1000,
            // 'order': 'DESC',
            // 'since': 1503821051,
            // 'end': 1503821051,
            // 'is_token': false,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currency_pair'] = market['id'];
        }
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        return this.parseOrders (response['return'], market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name zaif#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the zaif api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (code === 'JPY') {
            throw new ExchangeError (this.id + ' withdraw() does not allow ' + code + ' withdrawals');
        }
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
            // 'message': 'Hi!', // XEM and others
            // 'opt_fee': 0.003, // BTC and MONA only
        };
        if (tag !== undefined) {
            request['message'] = tag;
        }
        const result = await this.privatePostWithdraw (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": {
        //             "id": 23634,
        //             "fee": 0.001,
        //             "txid":,
        //             "funds": {
        //                 "jpy": 15320,
        //                 "btc": 1.392,
        //                 "xem": 100.2,
        //                 "mona": 2600
        //             }
        //         }
        //     }
        //
        const returnData = this.safeValue (result, 'return');
        return this.parseTransaction (returnData, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": 23634,
        //         "fee": 0.001,
        //         "txid":,
        //         "funds": {
        //             "jpy": 15320,
        //             "btc": 1.392,
        //             "xem": 100.2,
        //             "mona": 2600
        //         }
        //     }
        //
        currency = this.safeCurrency (undefined, currency);
        let fee = undefined;
        const feeCost = this.safeValue (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': currency['code'],
            };
        }
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': fee,
            'info': transaction,
        };
    }

    nonce () {
        const nonce = parseFloat (this.milliseconds () / 1000);
        return nonce.toFixed (8);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/';
        if (api === 'public') {
            url += 'api/' + this.version + '/' + this.implodeParams (path, params);
        } else if (api === 'fapi') {
            url += 'fapi/' + this.version + '/' + this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            if (api === 'ecapi') {
                url += 'ecapi';
            } else if (api === 'tlapi') {
                url += 'tlapi';
            } else {
                url += 'tapi';
            }
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': nonce,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"error": "unsupported currency_pair"}
        //
        const feedback = this.id + ' ' + body;
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        const success = this.safeValue (response, 'success', true);
        if (!success) {
            throw new ExchangeError (feedback);
        }
    }
};
