"use strict";
//  ---------------------------------------------------------------------------
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zaif_js_1 = __importDefault(require("./abstract/zaif.js"));
const errors_js_1 = require("./base/errors.js");
const Precise_js_1 = require("./base/Precise.js");
const number_js_1 = require("./base/functions/number.js");
const sha512_js_1 = require("./static_dependencies/noble-hashes/sha512.js");
//  ---------------------------------------------------------------------------
/**
 * @class zaif
 * @extends Exchange
 */
class zaif extends zaif_js_1.default {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'zaif',
            'name': 'Zaif',
            'countries': ['JP'],
            // 10 requests per second = 1000ms / 10 = 100ms between requests (public market endpoints)
            'rateLimit': 100,
            'version': '1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createMarketOrder': false,
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
                    'taker': this.parseNumber('0.001'),
                    'maker': this.parseNumber('0'),
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
                        'active_orders': 5,
                        'cancel_order': 5,
                        'deposit_history': 5,
                        'get_id_info': 5,
                        'get_info': 10,
                        'get_info2': 5,
                        'get_personal_info': 5,
                        'trade': 5,
                        'trade_history': 50,
                        'withdraw': 5,
                        'withdraw_history': 5,
                    },
                },
                'ecapi': {
                    'post': {
                        'createInvoice': 1,
                        'getInvoice': 1,
                        'getInvoiceIdsByOrderNumber': 1,
                        'cancelInvoice': 1,
                    },
                },
                'tlapi': {
                    'post': {
                        'get_positions': 66,
                        'position_history': 66,
                        'active_positions': 5,
                        'create_position': 33,
                        'change_position': 33,
                        'cancel_position': 33, // 3 in 10 seconds
                    },
                },
                'fapi': {
                    'get': {
                        'groups/{group_id}': 1,
                        'last_price/{group_id}/{pair}': 1,
                        'ticker/{group_id}/{pair}': 1,
                        'trades/{group_id}/{pair}': 1,
                        'depth/{group_id}/{pair}': 1,
                    },
                },
            },
            'options': {},
            'precisionMode': number_js_1.TICK_SIZE,
            'exceptions': {
                'exact': {
                    'unsupported currency_pair': errors_js_1.BadRequest, // {"error": "unsupported currency_pair"}
                },
                'broad': {},
            },
        });
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name zaif#fetchMarkets
         * @see https://zaif-api-document.readthedocs.io/ja/latest/PublicAPI.html#id12
         * @description retrieves data on all markets for zaif
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const markets = await this.publicGetCurrencyPairsAll(params);
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
        return this.parseMarkets(markets);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'currency_pair');
        const name = this.safeString(market, 'name');
        const [baseId, quoteId] = name.split('/');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = base + '/' + quote;
        return {
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
            'active': undefined,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'item_unit_step'),
                'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'aux_unit_point'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'item_unit_min'),
                    'max': undefined,
                },
                'price': {
                    'min': this.safeNumber(market, 'aux_unit_min'),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }
    parseBalance(response) {
        const balances = this.safeValue(response, 'return', {});
        const deposit = this.safeValue(balances, 'deposit');
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const funds = this.safeValue(balances, 'funds', {});
        const currencyIds = Object.keys(funds);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode(currencyId);
            const balance = this.safeString(funds, currencyId);
            const account = this.account();
            account['free'] = balance;
            account['total'] = balance;
            if (deposit !== undefined) {
                if (currencyId in deposit) {
                    account['total'] = this.safeString(deposit, currencyId);
                }
            }
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name zaif#fetchBalance
         * @see https://zaif-api-document.readthedocs.io/ja/latest/TradingAPI.html#id10
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const response = await this.privatePostGetInfo(params);
        return this.parseBalance(response);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name zaif#fetchOrderBook
         * @see https://zaif-api-document.readthedocs.io/ja/latest/PublicAPI.html#id34
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetDepthPair(this.extend(request, params));
        return this.parseOrderBook(response, market['symbol']);
    }
    parseTicker(ticker, market = undefined) {
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
        const symbol = this.safeSymbol(undefined, market);
        const timestamp = this.milliseconds();
        const vwap = this.safeString(ticker, 'vwap');
        const baseVolume = this.safeString(ticker, 'volume');
        const quoteVolume = Precise_js_1.Precise.stringMul(baseVolume, vwap);
        const last = this.safeString(ticker, 'last');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.safeString(ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'ask'),
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
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name zaif#fetchTicker
         * @see https://zaif-api-document.readthedocs.io/ja/latest/PublicAPI.html#id22
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        const ticker = await this.publicGetTickerPair(this.extend(request, params));
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
        return this.parseTicker(ticker, market);
    }
    parseTrade(trade, market = undefined) {
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
        let side = this.safeString(trade, 'trade_type');
        side = (side === 'bid') ? 'buy' : 'sell';
        const timestamp = this.safeTimestamp(trade, 'date');
        const id = this.safeString2(trade, 'id', 'tid');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'amount');
        const marketId = this.safeString(trade, 'currency_pair');
        const symbol = this.safeSymbol(marketId, market, '_');
        return this.safeTrade({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zaif#fetchTrades
         * @see https://zaif-api-document.readthedocs.io/ja/latest/PublicAPI.html#id28
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        let response = await this.publicGetTradesPair(this.extend(request, params));
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
            if (!Object.keys(firstTrade).length) {
                response = [];
            }
        }
        return this.parseTrades(response, market, since, limit);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name zaif#createOrder
         * @see https://zaif-api-document.readthedocs.io/ja/latest/MarginTradingAPI.html#id23
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type must be 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        if (type !== 'limit') {
            throw new errors_js_1.ExchangeError(this.id + ' createOrder() allows limit orders only');
        }
        const market = this.market(symbol);
        const request = {
            'currency_pair': market['id'],
            'action': (side === 'buy') ? 'bid' : 'ask',
            'amount': amount,
            'price': price,
        };
        const response = await this.privatePostTrade(this.extend(request, params));
        return this.safeOrder({
            'info': response,
            'id': response['return']['order_id'].toString(),
        }, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name zaif#cancelOrder
         * @see https://zaif-api-document.readthedocs.io/ja/latest/TradingAPI.html#id37
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol not used by zaif cancelOrder ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'order_id': id,
        };
        return await this.privatePostCancelOrder(this.extend(request, params));
    }
    parseOrder(order, market = undefined) {
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
        let side = this.safeString(order, 'action');
        side = (side === 'bid') ? 'buy' : 'sell';
        const timestamp = this.safeTimestamp(order, 'timestamp');
        const marketId = this.safeString(order, 'currency_pair');
        const symbol = this.safeSymbol(marketId, market, '_');
        const price = this.safeString(order, 'price');
        const amount = this.safeString(order, 'amount');
        const id = this.safeString(order, 'id');
        return this.safeOrder({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
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
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zaif#fetchOpenOrders
         * @see https://zaif-api-document.readthedocs.io/ja/latest/MarginTradingAPI.html#id28
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {
        // 'is_token': false,
        // 'is_token_both': false,
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['currency_pair'] = market['id'];
        }
        const response = await this.privatePostActiveOrders(this.extend(request, params));
        return this.parseOrders(response['return'], market, since, limit);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zaif#fetchClosedOrders
         * @see https://zaif-api-document.readthedocs.io/ja/latest/TradingAPI.html#id24
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
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
            market = this.market(symbol);
            request['currency_pair'] = market['id'];
        }
        const response = await this.privatePostTradeHistory(this.extend(request, params));
        return this.parseOrders(response['return'], market, since, limit);
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name zaif#withdraw
         * @see https://zaif-api-document.readthedocs.io/ja/latest/TradingAPI.html#id41
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        if (code === 'JPY') {
            throw new errors_js_1.ExchangeError(this.id + ' withdraw() does not allow ' + code + ' withdrawals');
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
        const result = await this.privatePostWithdraw(this.extend(request, params));
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
        const returnData = this.safeValue(result, 'return');
        return this.parseTransaction(returnData, currency);
    }
    parseTransaction(transaction, currency = undefined) {
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
        currency = this.safeCurrency(undefined, currency);
        let fee = undefined;
        const feeCost = this.safeValue(transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': currency['code'],
            };
        }
        return {
            'id': this.safeString(transaction, 'id'),
            'txid': this.safeString(transaction, 'txid'),
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
            'internal': undefined,
            'fee': fee,
            'info': transaction,
        };
    }
    customNonce() {
        const num = (this.milliseconds() / 1000).toString();
        const nonce = parseFloat(num);
        return nonce.toFixed(8);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/';
        if (api === 'public') {
            url += 'api/' + this.version + '/' + this.implodeParams(path, params);
        }
        else if (api === 'fapi') {
            url += 'fapi/' + this.version + '/' + this.implodeParams(path, params);
        }
        else {
            this.checkRequiredCredentials();
            if (api === 'ecapi') {
                url += 'ecapi';
            }
            else if (api === 'tlapi') {
                url += 'tlapi';
            }
            else {
                url += 'tapi';
            }
            const nonce = this.customNonce();
            body = this.urlencode(this.extend({
                'method': path,
                'nonce': nonce,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac(this.encode(body), this.encode(this.secret), sha512_js_1.sha512),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     {"error": "unsupported currency_pair"}
        //
        const feedback = this.id + ' ' + body;
        const error = this.safeString(response, 'error');
        if (error !== undefined) {
            this.throwExactlyMatchedException(this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], error, feedback);
            throw new errors_js_1.ExchangeError(feedback); // unknown message
        }
        const success = this.safeValue(response, 'success', true);
        if (!success) {
            throw new errors_js_1.ExchangeError(feedback);
        }
        return undefined;
    }
}
exports.default = zaif;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemFpZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInphaWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLCtFQUErRTs7Ozs7QUFFL0UsaUVBQTBDO0FBQzFDLGdEQUE2RDtBQUM3RCxrREFBNEM7QUFDNUMsMERBQXVEO0FBQ3ZELDRFQUFzRTtBQUd0RSwrRUFBK0U7QUFFL0U7OztHQUdHO0FBQ0gsTUFBcUIsSUFBSyxTQUFRLGlCQUFRO0lBQ3RDLFFBQVE7UUFDSixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRyxFQUFFO1lBQ3ZDLElBQUksRUFBRSxNQUFNO1lBQ1osTUFBTSxFQUFFLE1BQU07WUFDZCxXQUFXLEVBQUUsQ0FBRSxJQUFJLENBQUU7WUFDckIsMEZBQTBGO1lBQzFGLFdBQVcsRUFBRSxHQUFHO1lBQ2hCLFNBQVMsRUFBRSxHQUFHO1lBQ2QsS0FBSyxFQUFFO2dCQUNILE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsSUFBSTtnQkFDWixRQUFRLEVBQUUsU0FBUztnQkFDbkIsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLG1CQUFtQixFQUFFLEtBQUs7Z0JBQzFCLGFBQWEsRUFBRSxJQUFJO2dCQUNuQixjQUFjLEVBQUUsSUFBSTtnQkFDcEIsbUJBQW1CLEVBQUUsSUFBSTtnQkFDekIscUJBQXFCLEVBQUUsS0FBSztnQkFDNUIsa0JBQWtCLEVBQUUsS0FBSztnQkFDekIseUJBQXlCLEVBQUUsS0FBSztnQkFDaEMsbUJBQW1CLEVBQUUsS0FBSztnQkFDMUIsaUJBQWlCLEVBQUUsS0FBSztnQkFDeEIsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGdCQUFnQixFQUFFLEtBQUs7Z0JBQ3ZCLDBCQUEwQixFQUFFLEtBQUs7Z0JBQ2pDLGlCQUFpQixFQUFFLElBQUk7Z0JBQ3ZCLGdCQUFn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QVMsRUFBRTtZQUNyQixJQUFJLENBQUMsNEJBQTRCLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLDRCQUE0QixDQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sSUFBSSx5QkFBYSxDQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCO1NBQ3pEO1FBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixNQUFNLElBQUkseUJBQWEsQ0FBRSxRQUFRLENBQUMsQ0FBQztTQUN0QztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQWp1QkQsdUJBaXVCQyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5pbXBvcnQgRXhjaGFuZ2UgZnJvbSAnLi9hYnN0cmFjdC96YWlmLmpzJztcbmltcG9ydCB7IEV4Y2hhbmdlRXJyb3IsIEJhZFJlcXVlc3QgfSBmcm9tICcuL2Jhc2UvZXJyb3JzLmpzJztcbmltcG9ydCB7IFByZWNpc2UgfSBmcm9tICcuL2Jhc2UvUHJlY2lzZS5qcyc7XG5pbXBvcnQgeyBUSUNLX1NJWkUgfSBmcm9tICcuL2Jhc2UvZnVuY3Rpb25zL251bWJlci5qcyc7XG5pbXBvcnQgeyBzaGE1MTIgfSBmcm9tICcuL3N0YXRpY19kZXBlbmRlbmNpZXMvbm9ibGUtaGFzaGVzL3NoYTUxMi5qcyc7XG5pbXBvcnQgeyBCYWxhbmNlcywgQ3VycmVuY3ksIEludCwgTWFya2V0LCBPcmRlciwgT3JkZXJCb29rLCBPcmRlclNpZGUsIE9yZGVyVHlwZSwgU3RyLCBUaWNrZXIsIFRyYWRlLCBUcmFuc2FjdGlvbiB9IGZyb20gJy4vYmFzZS90eXBlcy5qcyc7XG5cbi8vICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBAY2xhc3MgemFpZlxuICogQGV4dGVuZHMgRXhjaGFuZ2VcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgemFpZiBleHRlbmRzIEV4Y2hhbmdlIHtcbiAgICBkZXNjcmliZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZXBFeHRlbmQgKHN1cGVyLmRlc2NyaWJlICgpLCB7XG4gICAgICAgICAgICAnaWQnOiAnemFpZicsXG4gICAgICAgICAgICAnbmFtZSc6ICdaYWlmJyxcbiAgICAgICAgICAgICdjb3VudHJpZXMnOiBbICdKUCcgXSxcbiAgICAgICAgICAgIC8vIDEwIHJlcXVlc3RzIHBlciBzZWNvbmQgPSAxMDAwbXMgLyAxMCA9IDEwMG1zIGJldHdlZW4gcmVxdWVzdHMgKHB1YmxpYyBtYXJrZXQgZW5kcG9pbnRzKVxuICAgICAgICAgICAgJ3JhdGVMaW1pdCc6IDEwMCxcbiAgICAgICAgICAgICd2ZXJzaW9uJzogJzEnLFxuICAgICAgICAgICAgJ2hhcyc6IHtcbiAgICAgICAgICAgICAgICAnQ09SUyc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAnc3BvdCc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ21hcmdpbic6IHVuZGVmaW5lZCwgLy8gaGFzIGJ1dCB1bmltcGxlbWVudGVkXG4gICAgICAgICAgICAgICAgJ3N3YXAnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnZnV0dXJlJzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ29wdGlvbic6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxPcmRlcic6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZU1hcmtldE9yZGVyJzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2NyZWF0ZU9yZGVyJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnZmV0Y2hCYWxhbmNlJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnZmV0Y2hDbG9zZWRPcmRlcnMnOiB0cnVlLFxuICAgICAgICAgICAgICAgICdmZXRjaEZ1bmRpbmdIaXN0b3J5JzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2ZldGNoRnVuZGluZ1JhdGUnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnZmV0Y2hGdW5kaW5nUmF0ZUhpc3RvcnknOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnZmV0Y2hGdW5kaW5nUmF0ZXMnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnZmV0Y2hJbmRleE9ITENWJzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2ZldGNoTWFya2V0cyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2ZldGNoTWFya09ITENWJzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2ZldGNoT3BlbkludGVyZXN0SGlzdG9yeSc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdmZXRjaE9wZW5PcmRlcnMnOiB0cnVlLFxuICAgICAgICAgICAgICAgICdmZXRjaE9yZGVyQm9vayc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2ZldGNoUHJlbWl1bUluZGV4T0hMQ1YnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnZmV0Y2hUaWNrZXInOiB0cnVlLFxuICAgICAgICAgICAgICAgICdmZXRjaFRyYWRlcyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2ZldGNoVHJhZGluZ0ZlZSc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdmZXRjaFRyYWRpbmdGZWVzJzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3JzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAndXJscyc6IHtcbiAgICAgICAgICAgICAgICAnbG9nbyc6ICdodHRwczovL3VzZXItaW1hZ2VzLmdpdGh1YnVzZXJjb250ZW50LmNvbS8xMjk0NDU0LzI3NzY2OTI3LTM5Y2EyYWRhLTVlZWItMTFlNy05NzJmLTFiNDE5OTUxOGNhNi5qcGcnLFxuICAgICAgICAgICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAgICAgICAgICdyZXN0JzogJ2h0dHBzOi8vYXBpLnphaWYuanAnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ3d3dyc6ICdodHRwczovL3phaWYuanAnLFxuICAgICAgICAgICAgICAgICdkb2MnOiBbXG4gICAgICAgICAgICAgICAgICAgICdodHRwczovL3RlY2hidXJlYXUtYXBpLWRvY3VtZW50LnJlYWR0aGVkb2NzLmlvL2phL2xhdGVzdC9pbmRleC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vY29ycC56YWlmLmpwL2FwaS1kb2NzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vY29ycC56YWlmLmpwL2FwaS1kb2NzL2FwaV9saW5rcycsXG4gICAgICAgICAgICAgICAgICAgICdodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS96YWlmLmpwJyxcbiAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS95b3UyMTk3OS9ub2RlLXphaWYnLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgJ2ZlZXMnOiAnaHR0cHM6Ly96YWlmLmpwL2ZlZT9sYW5nPWVuJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnZmVlcyc6IHtcbiAgICAgICAgICAgICAgICAndHJhZGluZyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAndGFrZXInOiB0aGlzLnBhcnNlTnVtYmVyICgnMC4wMDEnKSxcbiAgICAgICAgICAgICAgICAgICAgJ21ha2VyJzogdGhpcy5wYXJzZU51bWJlciAoJzAnKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdhcGknOiB7XG4gICAgICAgICAgICAgICAgJ3B1YmxpYyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdkZXB0aC97cGFpcn0nOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2N1cnJlbmNpZXMve3BhaXJ9JzogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdjdXJyZW5jaWVzL2FsbCc6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAnY3VycmVuY3lfcGFpcnMve3BhaXJ9JzogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdjdXJyZW5jeV9wYWlycy9hbGwnOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2xhc3RfcHJpY2Uve3BhaXJ9JzogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0aWNrZXIve3BhaXJ9JzogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0cmFkZXMve3BhaXJ9JzogMSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdwcml2YXRlJzoge1xuICAgICAgICAgICAgICAgICAgICAncG9zdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhY3RpdmVfb3JkZXJzJzogNSwgLy8gMTAgaW4gNSBzZWNvbmRzID0gMiBwZXIgc2Vjb25kID0+IGNvc3QgPSAxMCAvIDIgPSA1XG4gICAgICAgICAgICAgICAgICAgICAgICAnY2FuY2VsX29yZGVyJzogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkZXBvc2l0X2hpc3RvcnknOiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2dldF9pZF9pbmZvJzogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdnZXRfaW5mbyc6IDEwLCAvLyAxMCBpbiAxMCBzZWNvbmRzID0gMSBwZXIgc2Vjb25kID0+IGNvc3QgPSAxMCAvIDEgPSAxMFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2dldF9pbmZvMic6IDUsIC8vIDIwIGluIDEwIHNlY29uZHMgPSAyIHBlciBzZWNvbmQgPT4gY29zdCA9IDEwIC8gMiA9IDVcbiAgICAgICAgICAgICAgICAgICAgICAgICdnZXRfcGVyc29uYWxfaW5mbyc6IDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAndHJhZGUnOiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RyYWRlX2hpc3RvcnknOiA1MCwgLy8gMTIgaW4gNjAgc2Vjb25kcyA9IDAuMiBwZXIgc2Vjb25kID0+IGNvc3QgPSAxMCAvIDAuMiA9IDUwXG4gICAgICAgICAgICAgICAgICAgICAgICAnd2l0aGRyYXcnOiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3dpdGhkcmF3X2hpc3RvcnknOiA1LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2VjYXBpJzoge1xuICAgICAgICAgICAgICAgICAgICAncG9zdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdjcmVhdGVJbnZvaWNlJzogMSwgLy8gdW52ZXJpZmllZFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2dldEludm9pY2UnOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2dldEludm9pY2VJZHNCeU9yZGVyTnVtYmVyJzogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdjYW5jZWxJbnZvaWNlJzogMSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICd0bGFwaSc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Bvc3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnZ2V0X3Bvc2l0aW9ucyc6IDY2LCAvLyAxMCBpbiA2MCBzZWNvbmRzID0gMC4xNjYgcGVyIHNlY29uZCA9PiBjb3N0ID0gMTAgLyAwLjE2NiA9IDY2XG4gICAgICAgICAgICAgICAgICAgICAgICAncG9zaXRpb25faGlzdG9yeSc6IDY2LCAvLyAxMCBpbiA2MCBzZWNvbmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAnYWN0aXZlX3Bvc2l0aW9ucyc6IDUsIC8vIDIwIGluIDEwIHNlY29uZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICdjcmVhdGVfcG9zaXRpb24nOiAzMywgLy8gMyBpbiAxMCBzZWNvbmRzID0gMC4zIHBlciBzZWNvbmQgPT4gY29zdCA9IDEwIC8gMC4zID0gMzNcbiAgICAgICAgICAgICAgICAgICAgICAgICdjaGFuZ2VfcG9zaXRpb24nOiAzMywgLy8gMyBpbiAxMCBzZWNvbmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAnY2FuY2VsX3Bvc2l0aW9uJzogMzMsIC8vIDMgaW4gMTAgc2Vjb25kc1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2ZhcGknOiB7XG4gICAgICAgICAgICAgICAgICAgICdnZXQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnZ3JvdXBzL3tncm91cF9pZH0nOiAxLCAvLyB0ZXN0aW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAnbGFzdF9wcmljZS97Z3JvdXBfaWR9L3twYWlyfSc6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAndGlja2VyL3tncm91cF9pZH0ve3BhaXJ9JzogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0cmFkZXMve2dyb3VwX2lkfS97cGFpcn0nOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RlcHRoL3tncm91cF9pZH0ve3BhaXJ9JzogMSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdwcmVjaXNpb25Nb2RlJzogVElDS19TSVpFLFxuICAgICAgICAgICAgJ2V4Y2VwdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgJ2V4YWN0Jzoge1xuICAgICAgICAgICAgICAgICAgICAndW5zdXBwb3J0ZWQgY3VycmVuY3lfcGFpcic6IEJhZFJlcXVlc3QsIC8vIHtcImVycm9yXCI6IFwidW5zdXBwb3J0ZWQgY3VycmVuY3lfcGFpclwifVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2Jyb2FkJzoge1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBmZXRjaE1hcmtldHMgKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAqIEBuYW1lIHphaWYjZmV0Y2hNYXJrZXRzXG4gICAgICAgICAqIEBzZWUgaHR0cHM6Ly96YWlmLWFwaS1kb2N1bWVudC5yZWFkdGhlZG9jcy5pby9qYS9sYXRlc3QvUHVibGljQVBJLmh0bWwjaWQxMlxuICAgICAgICAgKiBAZGVzY3JpcHRpb24gcmV0cmlldmVzIGRhdGEgb24gYWxsIG1hcmtldHMgZm9yIHphaWZcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIGV4dHJhIHBhcmFtZXRlcnMgc3BlY2lmaWMgdG8gdGhlIGV4Y2hhbmdlIEFQSSBlbmRwb2ludFxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0W119IGFuIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIG1hcmtldCBkYXRhXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBtYXJrZXRzID0gYXdhaXQgdGhpcy5wdWJsaWNHZXRDdXJyZW5jeVBhaXJzQWxsIChwYXJhbXMpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgW1xuICAgICAgICAvLyAgICAgICAgIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJhdXhfdW5pdF9wb2ludFwiOiAwLFxuICAgICAgICAvLyAgICAgICAgICAgICBcIml0ZW1famFwYW5lc2VcIjogXCJcXHUzMGQzXFx1MzBjM1xcdTMwYzhcXHUzMGIzXFx1MzBhNFxcdTMwZjNcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJhdXhfdW5pdF9zdGVwXCI6IDUuMCxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlxcdTMwZDNcXHUzMGMzXFx1MzBjOFxcdTMwYjNcXHUzMGE0XFx1MzBmM1xcdTMwZmJcXHU2NWU1XFx1NjcyY1xcdTUxODZcXHUzMDZlXFx1NTNkNlxcdTVmMTVcXHUzMDkyXFx1ODg0Y1xcdTMwNDZcXHUzMDUzXFx1MzA2OFxcdTMwNGNcXHUzMDY3XFx1MzA0ZFxcdTMwN2VcXHUzMDU5XCIsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwiaXRlbV91bml0X21pblwiOiAwLjAwMSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJldmVudF9udW1iZXJcIjogMCxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJjdXJyZW5jeV9wYWlyXCI6IFwiYnRjX2pweVwiLFxuICAgICAgICAvLyAgICAgICAgICAgICBcImlzX3Rva2VuXCI6IGZhbHNlLFxuICAgICAgICAvLyAgICAgICAgICAgICBcImF1eF91bml0X21pblwiOiA1LjAsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwiYXV4X2phcGFuZXNlXCI6IFwiXFx1NjVlNVxcdTY3MmNcXHU1MTg2XCIsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwiaWRcIjogMSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJpdGVtX3VuaXRfc3RlcFwiOiAwLjAwMDEsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwibmFtZVwiOiBcIkJUQy9KUFlcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJzZXFcIjogMCxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIkJUQy9KUFlcIlxuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIF1cbiAgICAgICAgLy9cbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VNYXJrZXRzIChtYXJrZXRzKTtcbiAgICB9XG5cbiAgICBwYXJzZU1hcmtldCAobWFya2V0KTogTWFya2V0IHtcbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLnNhZmVTdHJpbmcgKG1hcmtldCwgJ2N1cnJlbmN5X3BhaXInKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMuc2FmZVN0cmluZyAobWFya2V0LCAnbmFtZScpO1xuICAgICAgICBjb25zdCBbIGJhc2VJZCwgcXVvdGVJZCBdID0gbmFtZS5zcGxpdCAoJy8nKTtcbiAgICAgICAgY29uc3QgYmFzZSA9IHRoaXMuc2FmZUN1cnJlbmN5Q29kZSAoYmFzZUlkKTtcbiAgICAgICAgY29uc3QgcXVvdGUgPSB0aGlzLnNhZmVDdXJyZW5jeUNvZGUgKHF1b3RlSWQpO1xuICAgICAgICBjb25zdCBzeW1ib2wgPSBiYXNlICsgJy8nICsgcXVvdGU7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnaWQnOiBpZCxcbiAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAnYmFzZSc6IGJhc2UsXG4gICAgICAgICAgICAncXVvdGUnOiBxdW90ZSxcbiAgICAgICAgICAgICdzZXR0bGUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYmFzZUlkJzogYmFzZUlkLFxuICAgICAgICAgICAgJ3F1b3RlSWQnOiBxdW90ZUlkLFxuICAgICAgICAgICAgJ3NldHRsZUlkJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3R5cGUnOiAnc3BvdCcsXG4gICAgICAgICAgICAnc3BvdCc6IHRydWUsXG4gICAgICAgICAgICAnbWFyZ2luJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3N3YXAnOiBmYWxzZSxcbiAgICAgICAgICAgICdmdXR1cmUnOiBmYWxzZSxcbiAgICAgICAgICAgICdvcHRpb24nOiBmYWxzZSxcbiAgICAgICAgICAgICdhY3RpdmUnOiB1bmRlZmluZWQsIC8vIGNhbiB0cmFkZSBvciBub3RcbiAgICAgICAgICAgICdjb250cmFjdCc6IGZhbHNlLFxuICAgICAgICAgICAgJ2xpbmVhcic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdpbnZlcnNlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2NvbnRyYWN0U2l6ZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdleHBpcnknOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZXhwaXJ5RGF0ZXRpbWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnc3RyaWtlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ29wdGlvblR5cGUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncHJlY2lzaW9uJzoge1xuICAgICAgICAgICAgICAgICdhbW91bnQnOiB0aGlzLnNhZmVOdW1iZXIgKG1hcmtldCwgJ2l0ZW1fdW5pdF9zdGVwJyksXG4gICAgICAgICAgICAgICAgJ3ByaWNlJzogdGhpcy5wYXJzZU51bWJlciAodGhpcy5wYXJzZVByZWNpc2lvbiAodGhpcy5zYWZlU3RyaW5nIChtYXJrZXQsICdhdXhfdW5pdF9wb2ludCcpKSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2xpbWl0cyc6IHtcbiAgICAgICAgICAgICAgICAnbGV2ZXJhZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgICdtaW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICdtYXgnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnYW1vdW50Jzoge1xuICAgICAgICAgICAgICAgICAgICAnbWluJzogdGhpcy5zYWZlTnVtYmVyIChtYXJrZXQsICdpdGVtX3VuaXRfbWluJyksXG4gICAgICAgICAgICAgICAgICAgICdtYXgnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAncHJpY2UnOiB7XG4gICAgICAgICAgICAgICAgICAgICdtaW4nOiB0aGlzLnNhZmVOdW1iZXIgKG1hcmtldCwgJ2F1eF91bml0X21pbicpLFxuICAgICAgICAgICAgICAgICAgICAnbWF4JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2Nvc3QnOiB7XG4gICAgICAgICAgICAgICAgICAgICdtaW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICdtYXgnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY3JlYXRlZCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdpbmZvJzogbWFya2V0LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHBhcnNlQmFsYW5jZSAocmVzcG9uc2UpOiBCYWxhbmNlcyB7XG4gICAgICAgIGNvbnN0IGJhbGFuY2VzID0gdGhpcy5zYWZlVmFsdWUgKHJlc3BvbnNlLCAncmV0dXJuJywge30pO1xuICAgICAgICBjb25zdCBkZXBvc2l0ID0gdGhpcy5zYWZlVmFsdWUgKGJhbGFuY2VzLCAnZGVwb3NpdCcpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAnaW5mbyc6IHJlc3BvbnNlLFxuICAgICAgICAgICAgJ3RpbWVzdGFtcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdkYXRldGltZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZnVuZHMgPSB0aGlzLnNhZmVWYWx1ZSAoYmFsYW5jZXMsICdmdW5kcycsIHt9KTtcbiAgICAgICAgY29uc3QgY3VycmVuY3lJZHMgPSBPYmplY3Qua2V5cyAoZnVuZHMpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGN1cnJlbmN5SWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW5jeUlkID0gY3VycmVuY3lJZHNbaV07XG4gICAgICAgICAgICBjb25zdCBjb2RlID0gdGhpcy5zYWZlQ3VycmVuY3lDb2RlIChjdXJyZW5jeUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGJhbGFuY2UgPSB0aGlzLnNhZmVTdHJpbmcgKGZ1bmRzLCBjdXJyZW5jeUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGFjY291bnQgPSB0aGlzLmFjY291bnQgKCk7XG4gICAgICAgICAgICBhY2NvdW50WydmcmVlJ10gPSBiYWxhbmNlO1xuICAgICAgICAgICAgYWNjb3VudFsndG90YWwnXSA9IGJhbGFuY2U7XG4gICAgICAgICAgICBpZiAoZGVwb3NpdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbmN5SWQgaW4gZGVwb3NpdCkge1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50Wyd0b3RhbCddID0gdGhpcy5zYWZlU3RyaW5nIChkZXBvc2l0LCBjdXJyZW5jeUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbY29kZV0gPSBhY2NvdW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNhZmVCYWxhbmNlIChyZXN1bHQpO1xuICAgIH1cblxuICAgIGFzeW5jIGZldGNoQmFsYW5jZSAocGFyYW1zID0ge30pOiBQcm9taXNlPEJhbGFuY2VzPiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAqIEBuYW1lIHphaWYjZmV0Y2hCYWxhbmNlXG4gICAgICAgICAqIEBzZWUgaHR0cHM6Ly96YWlmLWFwaS1kb2N1bWVudC5yZWFkdGhlZG9jcy5pby9qYS9sYXRlc3QvVHJhZGluZ0FQSS5odG1sI2lkMTBcbiAgICAgICAgICogQGRlc2NyaXB0aW9uIHF1ZXJ5IGZvciBiYWxhbmNlIGFuZCBnZXQgdGhlIGFtb3VudCBvZiBmdW5kcyBhdmFpbGFibGUgZm9yIHRyYWRpbmcgb3IgZnVuZHMgbG9ja2VkIGluIG9yZGVyc1xuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gZXh0cmEgcGFyYW1ldGVycyBzcGVjaWZpYyB0byB0aGUgZXhjaGFuZ2UgQVBJIGVuZHBvaW50XG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGEgW2JhbGFuY2Ugc3RydWN0dXJlXXtAbGluayBodHRwczovL2RvY3MuY2N4dC5jb20vIy8/aWQ9YmFsYW5jZS1zdHJ1Y3R1cmV9XG4gICAgICAgICAqL1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRNYXJrZXRzICgpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHJpdmF0ZVBvc3RHZXRJbmZvIChwYXJhbXMpO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUJhbGFuY2UgKHJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICBhc3luYyBmZXRjaE9yZGVyQm9vayAoc3ltYm9sOiBzdHJpbmcsIGxpbWl0OiBJbnQgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KTogUHJvbWlzZTxPcmRlckJvb2s+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICogQG5hbWUgemFpZiNmZXRjaE9yZGVyQm9va1xuICAgICAgICAgKiBAc2VlIGh0dHBzOi8vemFpZi1hcGktZG9jdW1lbnQucmVhZHRoZWRvY3MuaW8vamEvbGF0ZXN0L1B1YmxpY0FQSS5odG1sI2lkMzRcbiAgICAgICAgICogQGRlc2NyaXB0aW9uIGZldGNoZXMgaW5mb3JtYXRpb24gb24gb3BlbiBvcmRlcnMgd2l0aCBiaWQgKGJ1eSkgYW5kIGFzayAoc2VsbCkgcHJpY2VzLCB2b2x1bWVzIGFuZCBvdGhlciBkYXRhXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzeW1ib2wgdW5pZmllZCBzeW1ib2wgb2YgdGhlIG1hcmtldCB0byBmZXRjaCB0aGUgb3JkZXIgYm9vayBmb3JcbiAgICAgICAgICogQHBhcmFtIHtpbnR9IFtsaW1pdF0gdGhlIG1heGltdW0gYW1vdW50IG9mIG9yZGVyIGJvb2sgZW50cmllcyB0byByZXR1cm5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIGV4dHJhIHBhcmFtZXRlcnMgc3BlY2lmaWMgdG8gdGhlIGV4Y2hhbmdlIEFQSSBlbmRwb2ludFxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBBIGRpY3Rpb25hcnkgb2YgW29yZGVyIGJvb2sgc3RydWN0dXJlc117QGxpbmsgaHR0cHM6Ly9kb2NzLmNjeHQuY29tLyMvP2lkPW9yZGVyLWJvb2stc3RydWN0dXJlfSBpbmRleGVkIGJ5IG1hcmtldCBzeW1ib2xzXG4gICAgICAgICAqL1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRNYXJrZXRzICgpO1xuICAgICAgICBjb25zdCBtYXJrZXQgPSB0aGlzLm1hcmtldCAoc3ltYm9sKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICdwYWlyJzogbWFya2V0WydpZCddLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHVibGljR2V0RGVwdGhQYWlyICh0aGlzLmV4dGVuZCAocmVxdWVzdCwgcGFyYW1zKSk7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlT3JkZXJCb29rIChyZXNwb25zZSwgbWFya2V0WydzeW1ib2wnXSk7XG4gICAgfVxuXG4gICAgcGFyc2VUaWNrZXIgKHRpY2tlciwgbWFya2V0OiBNYXJrZXQgPSB1bmRlZmluZWQpOiBUaWNrZXIge1xuICAgICAgICAvL1xuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICBcImxhc3RcIjogOWUtMDgsXG4gICAgICAgIC8vICAgICBcImhpZ2hcIjogMWUtMDcsXG4gICAgICAgIC8vICAgICBcImxvd1wiOiA5ZS0wOCxcbiAgICAgICAgLy8gICAgIFwidndhcFwiOiAwLjAsXG4gICAgICAgIC8vICAgICBcInZvbHVtZVwiOiAxMzUyNTAuMCxcbiAgICAgICAgLy8gICAgIFwiYmlkXCI6IDllLTA4LFxuICAgICAgICAvLyAgICAgXCJhc2tcIjogMWUtMDdcbiAgICAgICAgLy8gfVxuICAgICAgICAvL1xuICAgICAgICBjb25zdCBzeW1ib2wgPSB0aGlzLnNhZmVTeW1ib2wgKHVuZGVmaW5lZCwgbWFya2V0KTtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gdGhpcy5taWxsaXNlY29uZHMgKCk7XG4gICAgICAgIGNvbnN0IHZ3YXAgPSB0aGlzLnNhZmVTdHJpbmcgKHRpY2tlciwgJ3Z3YXAnKTtcbiAgICAgICAgY29uc3QgYmFzZVZvbHVtZSA9IHRoaXMuc2FmZVN0cmluZyAodGlja2VyLCAndm9sdW1lJyk7XG4gICAgICAgIGNvbnN0IHF1b3RlVm9sdW1lID0gUHJlY2lzZS5zdHJpbmdNdWwgKGJhc2VWb2x1bWUsIHZ3YXApO1xuICAgICAgICBjb25zdCBsYXN0ID0gdGhpcy5zYWZlU3RyaW5nICh0aWNrZXIsICdsYXN0Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLnNhZmVUaWNrZXIgKHtcbiAgICAgICAgICAgICdzeW1ib2wnOiBzeW1ib2wsXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2hpZ2gnOiB0aGlzLnNhZmVTdHJpbmcgKHRpY2tlciwgJ2hpZ2gnKSxcbiAgICAgICAgICAgICdsb3cnOiB0aGlzLnNhZmVTdHJpbmcgKHRpY2tlciwgJ2xvdycpLFxuICAgICAgICAgICAgJ2JpZCc6IHRoaXMuc2FmZVN0cmluZyAodGlja2VyLCAnYmlkJyksXG4gICAgICAgICAgICAnYmlkVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Fzayc6IHRoaXMuc2FmZVN0cmluZyAodGlja2VyLCAnYXNrJyksXG4gICAgICAgICAgICAnYXNrVm9sdW1lJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3Z3YXAnOiB2d2FwLFxuICAgICAgICAgICAgJ29wZW4nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2xvc2UnOiBsYXN0LFxuICAgICAgICAgICAgJ2xhc3QnOiBsYXN0LFxuICAgICAgICAgICAgJ3ByZXZpb3VzQ2xvc2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY2hhbmdlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnYXZlcmFnZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdiYXNlVm9sdW1lJzogYmFzZVZvbHVtZSxcbiAgICAgICAgICAgICdxdW90ZVZvbHVtZSc6IHF1b3RlVm9sdW1lLFxuICAgICAgICAgICAgJ2luZm8nOiB0aWNrZXIsXG4gICAgICAgIH0sIG1hcmtldCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZmV0Y2hUaWNrZXIgKHN5bWJvbDogc3RyaW5nLCBwYXJhbXMgPSB7fSk6IFByb21pc2U8VGlja2VyPiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAqIEBuYW1lIHphaWYjZmV0Y2hUaWNrZXJcbiAgICAgICAgICogQHNlZSBodHRwczovL3phaWYtYXBpLWRvY3VtZW50LnJlYWR0aGVkb2NzLmlvL2phL2xhdGVzdC9QdWJsaWNBUEkuaHRtbCNpZDIyXG4gICAgICAgICAqIEBkZXNjcmlwdGlvbiBmZXRjaGVzIGEgcHJpY2UgdGlja2VyLCBhIHN0YXRpc3RpY2FsIGNhbGN1bGF0aW9uIHdpdGggdGhlIGluZm9ybWF0aW9uIGNhbGN1bGF0ZWQgb3ZlciB0aGUgcGFzdCAyNCBob3VycyBmb3IgYSBzcGVjaWZpYyBtYXJrZXRcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN5bWJvbCB1bmlmaWVkIHN5bWJvbCBvZiB0aGUgbWFya2V0IHRvIGZldGNoIHRoZSB0aWNrZXIgZm9yXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBleHRyYSBwYXJhbWV0ZXJzIHNwZWNpZmljIHRvIHRoZSBleGNoYW5nZSBBUEkgZW5kcG9pbnRcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH0gYSBbdGlja2VyIHN0cnVjdHVyZV17QGxpbmsgaHR0cHM6Ly9kb2NzLmNjeHQuY29tLyMvP2lkPXRpY2tlci1zdHJ1Y3R1cmV9XG4gICAgICAgICAqL1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRNYXJrZXRzICgpO1xuICAgICAgICBjb25zdCBtYXJrZXQgPSB0aGlzLm1hcmtldCAoc3ltYm9sKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICdwYWlyJzogbWFya2V0WydpZCddLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aWNrZXIgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRpY2tlclBhaXIgKHRoaXMuZXh0ZW5kIChyZXF1ZXN0LCBwYXJhbXMpKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgXCJsYXN0XCI6IDllLTA4LFxuICAgICAgICAvLyAgICAgXCJoaWdoXCI6IDFlLTA3LFxuICAgICAgICAvLyAgICAgXCJsb3dcIjogOWUtMDgsXG4gICAgICAgIC8vICAgICBcInZ3YXBcIjogMC4wLFxuICAgICAgICAvLyAgICAgXCJ2b2x1bWVcIjogMTM1MjUwLjAsXG4gICAgICAgIC8vICAgICBcImJpZFwiOiA5ZS0wOCxcbiAgICAgICAgLy8gICAgIFwiYXNrXCI6IDFlLTA3XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy9cbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VUaWNrZXIgKHRpY2tlciwgbWFya2V0KTtcbiAgICB9XG5cbiAgICBwYXJzZVRyYWRlICh0cmFkZSwgbWFya2V0OiBNYXJrZXQgPSB1bmRlZmluZWQpOiBUcmFkZSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGZldGNoVHJhZGVzIChwdWJsaWMpXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICAge1xuICAgICAgICAvLyAgICAgICAgICBcImRhdGVcIjogMTY0ODU1OTQxNCxcbiAgICAgICAgLy8gICAgICAgICAgXCJwcmljZVwiOiA1ODgwMzc1LjAsXG4gICAgICAgIC8vICAgICAgICAgIFwiYW1vdW50XCI6IDAuMDE3LFxuICAgICAgICAvLyAgICAgICAgICBcInRpZFwiOiAxNzYxMjY1NTcsXG4gICAgICAgIC8vICAgICAgICAgIFwiY3VycmVuY3lfcGFpclwiOiBcImJ0Y19qcHlcIixcbiAgICAgICAgLy8gICAgICAgICAgXCJ0cmFkZV90eXBlXCI6IFwiYXNrXCJcbiAgICAgICAgLy8gICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBzaWRlID0gdGhpcy5zYWZlU3RyaW5nICh0cmFkZSwgJ3RyYWRlX3R5cGUnKTtcbiAgICAgICAgc2lkZSA9IChzaWRlID09PSAnYmlkJykgPyAnYnV5JyA6ICdzZWxsJztcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gdGhpcy5zYWZlVGltZXN0YW1wICh0cmFkZSwgJ2RhdGUnKTtcbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLnNhZmVTdHJpbmcyICh0cmFkZSwgJ2lkJywgJ3RpZCcpO1xuICAgICAgICBjb25zdCBwcmljZVN0cmluZyA9IHRoaXMuc2FmZVN0cmluZyAodHJhZGUsICdwcmljZScpO1xuICAgICAgICBjb25zdCBhbW91bnRTdHJpbmcgPSB0aGlzLnNhZmVTdHJpbmcgKHRyYWRlLCAnYW1vdW50Jyk7XG4gICAgICAgIGNvbnN0IG1hcmtldElkID0gdGhpcy5zYWZlU3RyaW5nICh0cmFkZSwgJ2N1cnJlbmN5X3BhaXInKTtcbiAgICAgICAgY29uc3Qgc3ltYm9sID0gdGhpcy5zYWZlU3ltYm9sIChtYXJrZXRJZCwgbWFya2V0LCAnXycpO1xuICAgICAgICByZXR1cm4gdGhpcy5zYWZlVHJhZGUgKHtcbiAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgJ2luZm8nOiB0cmFkZSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB0aGlzLmlzbzg2MDEgKHRpbWVzdGFtcCksXG4gICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgJ3R5cGUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnc2lkZSc6IHNpZGUsXG4gICAgICAgICAgICAnb3JkZXInOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndGFrZXJPck1ha2VyJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2VTdHJpbmcsXG4gICAgICAgICAgICAnYW1vdW50JzogYW1vdW50U3RyaW5nLFxuICAgICAgICAgICAgJ2Nvc3QnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZmVlJzogdW5kZWZpbmVkLFxuICAgICAgICB9LCBtYXJrZXQpO1xuICAgIH1cblxuICAgIGFzeW5jIGZldGNoVHJhZGVzIChzeW1ib2w6IHN0cmluZywgc2luY2U6IEludCA9IHVuZGVmaW5lZCwgbGltaXQ6IEludCA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pOiBQcm9taXNlPFRyYWRlW10+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICogQG5hbWUgemFpZiNmZXRjaFRyYWRlc1xuICAgICAgICAgKiBAc2VlIGh0dHBzOi8vemFpZi1hcGktZG9jdW1lbnQucmVhZHRoZWRvY3MuaW8vamEvbGF0ZXN0L1B1YmxpY0FQSS5odG1sI2lkMjhcbiAgICAgICAgICogQGRlc2NyaXB0aW9uIGdldCB0aGUgbGlzdCBvZiBtb3N0IHJlY2VudCB0cmFkZXMgZm9yIGEgcGFydGljdWxhciBzeW1ib2xcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN5bWJvbCB1bmlmaWVkIHN5bWJvbCBvZiB0aGUgbWFya2V0IHRvIGZldGNoIHRyYWRlcyBmb3JcbiAgICAgICAgICogQHBhcmFtIHtpbnR9IFtzaW5jZV0gdGltZXN0YW1wIGluIG1zIG9mIHRoZSBlYXJsaWVzdCB0cmFkZSB0byBmZXRjaFxuICAgICAgICAgKiBAcGFyYW0ge2ludH0gW2xpbWl0XSB0aGUgbWF4aW11bSBhbW91bnQgb2YgdHJhZGVzIHRvIGZldGNoXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBleHRyYSBwYXJhbWV0ZXJzIHNwZWNpZmljIHRvIHRoZSBleGNoYW5nZSBBUEkgZW5kcG9pbnRcbiAgICAgICAgICogQHJldHVybnMge1RyYWRlW119IGEgbGlzdCBvZiBbdHJhZGUgc3RydWN0dXJlc117QGxpbmsgaHR0cHM6Ly9kb2NzLmNjeHQuY29tLyMvP2lkPXB1YmxpYy10cmFkZXN9XG4gICAgICAgICAqL1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRNYXJrZXRzICgpO1xuICAgICAgICBjb25zdCBtYXJrZXQgPSB0aGlzLm1hcmtldCAoc3ltYm9sKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICdwYWlyJzogbWFya2V0WydpZCddLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnB1YmxpY0dldFRyYWRlc1BhaXIgKHRoaXMuZXh0ZW5kIChyZXF1ZXN0LCBwYXJhbXMpKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICBbXG4gICAgICAgIC8vICAgICAgICAgIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgIFwiZGF0ZVwiOiAxNjQ4NTU5NDE0LFxuICAgICAgICAvLyAgICAgICAgICAgICAgXCJwcmljZVwiOiA1ODgwMzc1LjAsXG4gICAgICAgIC8vICAgICAgICAgICAgICBcImFtb3VudFwiOiAwLjAxNyxcbiAgICAgICAgLy8gICAgICAgICAgICAgIFwidGlkXCI6IDE3NjEyNjU1NyxcbiAgICAgICAgLy8gICAgICAgICAgICAgIFwiY3VycmVuY3lfcGFpclwiOiBcImJ0Y19qcHlcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgIFwidHJhZGVfdHlwZVwiOiBcImFza1wiXG4gICAgICAgIC8vICAgICAgICAgIH0sIC4uLlxuICAgICAgICAvLyAgICAgIF1cbiAgICAgICAgLy9cbiAgICAgICAgY29uc3QgbnVtVHJhZGVzID0gcmVzcG9uc2UubGVuZ3RoO1xuICAgICAgICBpZiAobnVtVHJhZGVzID09PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBmaXJzdFRyYWRlID0gcmVzcG9uc2VbMF07XG4gICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzIChmaXJzdFRyYWRlKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlVHJhZGVzIChyZXNwb25zZSwgbWFya2V0LCBzaW5jZSwgbGltaXQpO1xuICAgIH1cblxuICAgIGFzeW5jIGNyZWF0ZU9yZGVyIChzeW1ib2w6IHN0cmluZywgdHlwZTogT3JkZXJUeXBlLCBzaWRlOiBPcmRlclNpZGUsIGFtb3VudCwgcHJpY2UgPSB1bmRlZmluZWQsIHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAqIEBuYW1lIHphaWYjY3JlYXRlT3JkZXJcbiAgICAgICAgICogQHNlZSBodHRwczovL3phaWYtYXBpLWRvY3VtZW50LnJlYWR0aGVkb2NzLmlvL2phL2xhdGVzdC9NYXJnaW5UcmFkaW5nQVBJLmh0bWwjaWQyM1xuICAgICAgICAgKiBAZGVzY3JpcHRpb24gY3JlYXRlIGEgdHJhZGUgb3JkZXJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN5bWJvbCB1bmlmaWVkIHN5bWJvbCBvZiB0aGUgbWFya2V0IHRvIGNyZWF0ZSBhbiBvcmRlciBpblxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBtdXN0IGJlICdsaW1pdCdcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHNpZGUgJ2J1eScgb3IgJ3NlbGwnXG4gICAgICAgICAqIEBwYXJhbSB7ZmxvYXR9IGFtb3VudCBob3cgbXVjaCBvZiBjdXJyZW5jeSB5b3Ugd2FudCB0byB0cmFkZSBpbiB1bml0cyBvZiBiYXNlIGN1cnJlbmN5XG4gICAgICAgICAqIEBwYXJhbSB7ZmxvYXR9IFtwcmljZV0gdGhlIHByaWNlIGF0IHdoaWNoIHRoZSBvcmRlciBpcyB0byBiZSBmdWxsZmlsbGVkLCBpbiB1bml0cyBvZiB0aGUgcXVvdGUgY3VycmVuY3ksIGlnbm9yZWQgaW4gbWFya2V0IG9yZGVyc1xuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gZXh0cmEgcGFyYW1ldGVycyBzcGVjaWZpYyB0byB0aGUgZXhjaGFuZ2UgQVBJIGVuZHBvaW50XG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFuIFtvcmRlciBzdHJ1Y3R1cmVde0BsaW5rIGh0dHBzOi8vZG9jcy5jY3h0LmNvbS8jLz9pZD1vcmRlci1zdHJ1Y3R1cmV9XG4gICAgICAgICAqL1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRNYXJrZXRzICgpO1xuICAgICAgICBpZiAodHlwZSAhPT0gJ2xpbWl0Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2hhbmdlRXJyb3IgKHRoaXMuaWQgKyAnIGNyZWF0ZU9yZGVyKCkgYWxsb3dzIGxpbWl0IG9yZGVycyBvbmx5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWFya2V0ID0gdGhpcy5tYXJrZXQgKHN5bWJvbCk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAnY3VycmVuY3lfcGFpcic6IG1hcmtldFsnaWQnXSxcbiAgICAgICAgICAgICdhY3Rpb24nOiAoc2lkZSA9PT0gJ2J1eScpID8gJ2JpZCcgOiAnYXNrJyxcbiAgICAgICAgICAgICdhbW91bnQnOiBhbW91bnQsXG4gICAgICAgICAgICAncHJpY2UnOiBwcmljZSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnByaXZhdGVQb3N0VHJhZGUgKHRoaXMuZXh0ZW5kIChyZXF1ZXN0LCBwYXJhbXMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZU9yZGVyICh7XG4gICAgICAgICAgICAnaW5mbyc6IHJlc3BvbnNlLFxuICAgICAgICAgICAgJ2lkJzogcmVzcG9uc2VbJ3JldHVybiddWydvcmRlcl9pZCddLnRvU3RyaW5nICgpLFxuICAgICAgICB9LCBtYXJrZXQpO1xuICAgIH1cblxuICAgIGFzeW5jIGNhbmNlbE9yZGVyIChpZDogc3RyaW5nLCBzeW1ib2w6IFN0ciA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICogQG5hbWUgemFpZiNjYW5jZWxPcmRlclxuICAgICAgICAgKiBAc2VlIGh0dHBzOi8vemFpZi1hcGktZG9jdW1lbnQucmVhZHRoZWRvY3MuaW8vamEvbGF0ZXN0L1RyYWRpbmdBUEkuaHRtbCNpZDM3XG4gICAgICAgICAqIEBkZXNjcmlwdGlvbiBjYW5jZWxzIGFuIG9wZW4gb3JkZXJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIG9yZGVyIGlkXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzeW1ib2wgbm90IHVzZWQgYnkgemFpZiBjYW5jZWxPcmRlciAoKVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gZXh0cmEgcGFyYW1ldGVycyBzcGVjaWZpYyB0byB0aGUgZXhjaGFuZ2UgQVBJIGVuZHBvaW50XG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEFuIFtvcmRlciBzdHJ1Y3R1cmVde0BsaW5rIGh0dHBzOi8vZG9jcy5jY3h0LmNvbS8jLz9pZD1vcmRlci1zdHJ1Y3R1cmV9XG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgJ29yZGVyX2lkJzogaWQsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnByaXZhdGVQb3N0Q2FuY2VsT3JkZXIgKHRoaXMuZXh0ZW5kIChyZXF1ZXN0LCBwYXJhbXMpKTtcbiAgICB9XG5cbiAgICBwYXJzZU9yZGVyIChvcmRlciwgbWFya2V0OiBNYXJrZXQgPSB1bmRlZmluZWQpOiBPcmRlciB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICB7XG4gICAgICAgIC8vICAgICAgICAgXCJjdXJyZW5jeV9wYWlyXCI6IFwiYnRjX2pweVwiLFxuICAgICAgICAvLyAgICAgICAgIFwiYWN0aW9uXCI6IFwiYXNrXCIsXG4gICAgICAgIC8vICAgICAgICAgXCJhbW91bnRcIjogMC4wMyxcbiAgICAgICAgLy8gICAgICAgICBcInByaWNlXCI6IDU2MDAwLFxuICAgICAgICAvLyAgICAgICAgIFwidGltZXN0YW1wXCI6IDE0MDIwMjExMjUsXG4gICAgICAgIC8vICAgICAgICAgXCJjb21tZW50XCIgOiBcImRlbW9cIlxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvL1xuICAgICAgICBsZXQgc2lkZSA9IHRoaXMuc2FmZVN0cmluZyAob3JkZXIsICdhY3Rpb24nKTtcbiAgICAgICAgc2lkZSA9IChzaWRlID09PSAnYmlkJykgPyAnYnV5JyA6ICdzZWxsJztcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gdGhpcy5zYWZlVGltZXN0YW1wIChvcmRlciwgJ3RpbWVzdGFtcCcpO1xuICAgICAgICBjb25zdCBtYXJrZXRJZCA9IHRoaXMuc2FmZVN0cmluZyAob3JkZXIsICdjdXJyZW5jeV9wYWlyJyk7XG4gICAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc2FmZVN5bWJvbCAobWFya2V0SWQsIG1hcmtldCwgJ18nKTtcbiAgICAgICAgY29uc3QgcHJpY2UgPSB0aGlzLnNhZmVTdHJpbmcgKG9yZGVyLCAncHJpY2UnKTtcbiAgICAgICAgY29uc3QgYW1vdW50ID0gdGhpcy5zYWZlU3RyaW5nIChvcmRlciwgJ2Ftb3VudCcpO1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMuc2FmZVN0cmluZyAob3JkZXIsICdpZCcpO1xuICAgICAgICByZXR1cm4gdGhpcy5zYWZlT3JkZXIgKHtcbiAgICAgICAgICAgICdpZCc6IGlkLFxuICAgICAgICAgICAgJ2NsaWVudE9yZGVySWQnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndGltZXN0YW1wJzogdGltZXN0YW1wLFxuICAgICAgICAgICAgJ2RhdGV0aW1lJzogdGhpcy5pc284NjAxICh0aW1lc3RhbXApLFxuICAgICAgICAgICAgJ2xhc3RUcmFkZVRpbWVzdGFtcCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdzdGF0dXMnOiAnb3BlbicsXG4gICAgICAgICAgICAnc3ltYm9sJzogc3ltYm9sLFxuICAgICAgICAgICAgJ3R5cGUnOiAnbGltaXQnLFxuICAgICAgICAgICAgJ3RpbWVJbkZvcmNlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3Bvc3RPbmx5JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3NpZGUnOiBzaWRlLFxuICAgICAgICAgICAgJ3ByaWNlJzogcHJpY2UsXG4gICAgICAgICAgICAnc3RvcFByaWNlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3RyaWdnZXJQcmljZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjb3N0JzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdmaWxsZWQnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAncmVtYWluaW5nJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3RyYWRlcyc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmZWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnaW5mbyc6IG9yZGVyLFxuICAgICAgICAgICAgJ2F2ZXJhZ2UnOiB1bmRlZmluZWQsXG4gICAgICAgIH0sIG1hcmtldCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZmV0Y2hPcGVuT3JkZXJzIChzeW1ib2w6IFN0ciA9IHVuZGVmaW5lZCwgc2luY2U6IEludCA9IHVuZGVmaW5lZCwgbGltaXQ6IEludCA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pOiBQcm9taXNlPE9yZGVyW10+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICogQG5hbWUgemFpZiNmZXRjaE9wZW5PcmRlcnNcbiAgICAgICAgICogQHNlZSBodHRwczovL3phaWYtYXBpLWRvY3VtZW50LnJlYWR0aGVkb2NzLmlvL2phL2xhdGVzdC9NYXJnaW5UcmFkaW5nQVBJLmh0bWwjaWQyOFxuICAgICAgICAgKiBAZGVzY3JpcHRpb24gZmV0Y2ggYWxsIHVuZmlsbGVkIGN1cnJlbnRseSBvcGVuIG9yZGVyc1xuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3ltYm9sIHVuaWZpZWQgbWFya2V0IHN5bWJvbFxuICAgICAgICAgKiBAcGFyYW0ge2ludH0gW3NpbmNlXSB0aGUgZWFybGllc3QgdGltZSBpbiBtcyB0byBmZXRjaCBvcGVuIG9yZGVycyBmb3JcbiAgICAgICAgICogQHBhcmFtIHtpbnR9IFtsaW1pdF0gdGhlIG1heGltdW0gbnVtYmVyIG9mICBvcGVuIG9yZGVycyBzdHJ1Y3R1cmVzIHRvIHJldHJpZXZlXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBleHRyYSBwYXJhbWV0ZXJzIHNwZWNpZmljIHRvIHRoZSBleGNoYW5nZSBBUEkgZW5kcG9pbnRcbiAgICAgICAgICogQHJldHVybnMge09yZGVyW119IGEgbGlzdCBvZiBbb3JkZXIgc3RydWN0dXJlc117QGxpbmsgaHR0cHM6Ly9kb2NzLmNjeHQuY29tLyMvP2lkPW9yZGVyLXN0cnVjdHVyZX1cbiAgICAgICAgICovXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZE1hcmtldHMgKCk7XG4gICAgICAgIGxldCBtYXJrZXQ6IE1hcmtldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIC8vICdpc190b2tlbic6IGZhbHNlLFxuICAgICAgICAgICAgLy8gJ2lzX3Rva2VuX2JvdGgnOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHN5bWJvbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtYXJrZXQgPSB0aGlzLm1hcmtldCAoc3ltYm9sKTtcbiAgICAgICAgICAgIHJlcXVlc3RbJ2N1cnJlbmN5X3BhaXInXSA9IG1hcmtldFsnaWQnXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHJpdmF0ZVBvc3RBY3RpdmVPcmRlcnMgKHRoaXMuZXh0ZW5kIChyZXF1ZXN0LCBwYXJhbXMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VPcmRlcnMgKHJlc3BvbnNlWydyZXR1cm4nXSwgbWFya2V0LCBzaW5jZSwgbGltaXQpO1xuICAgIH1cblxuICAgIGFzeW5jIGZldGNoQ2xvc2VkT3JkZXJzIChzeW1ib2w6IFN0ciA9IHVuZGVmaW5lZCwgc2luY2U6IEludCA9IHVuZGVmaW5lZCwgbGltaXQ6IEludCA9IHVuZGVmaW5lZCwgcGFyYW1zID0ge30pOiBQcm9taXNlPE9yZGVyW10+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICogQG5hbWUgemFpZiNmZXRjaENsb3NlZE9yZGVyc1xuICAgICAgICAgKiBAc2VlIGh0dHBzOi8vemFpZi1hcGktZG9jdW1lbnQucmVhZHRoZWRvY3MuaW8vamEvbGF0ZXN0L1RyYWRpbmdBUEkuaHRtbCNpZDI0XG4gICAgICAgICAqIEBkZXNjcmlwdGlvbiBmZXRjaGVzIGluZm9ybWF0aW9uIG9uIG11bHRpcGxlIGNsb3NlZCBvcmRlcnMgbWFkZSBieSB0aGUgdXNlclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3ltYm9sIHVuaWZpZWQgbWFya2V0IHN5bWJvbCBvZiB0aGUgbWFya2V0IG9yZGVycyB3ZXJlIG1hZGUgaW5cbiAgICAgICAgICogQHBhcmFtIHtpbnR9IFtzaW5jZV0gdGhlIGVhcmxpZXN0IHRpbWUgaW4gbXMgdG8gZmV0Y2ggb3JkZXJzIGZvclxuICAgICAgICAgKiBAcGFyYW0ge2ludH0gW2xpbWl0XSB0aGUgbWF4aW11bSBudW1iZXIgb2YgIG9yZGUgc3RydWN0dXJlcyB0byByZXRyaWV2ZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gZXh0cmEgcGFyYW1ldGVycyBzcGVjaWZpYyB0byB0aGUgZXhjaGFuZ2UgQVBJIGVuZHBvaW50XG4gICAgICAgICAqIEByZXR1cm5zIHtPcmRlcltdfSBhIGxpc3Qgb2YgW29yZGVyIHN0cnVjdHVyZXNde0BsaW5rIGh0dHBzOi8vZG9jcy5jY3h0LmNvbS8jLz9pZD1vcmRlci1zdHJ1Y3R1cmV9XG4gICAgICAgICAqL1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRNYXJrZXRzICgpO1xuICAgICAgICBsZXQgbWFya2V0OiBNYXJrZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAvLyAnZnJvbSc6IDAsXG4gICAgICAgICAgICAvLyAnY291bnQnOiAxMDAwLFxuICAgICAgICAgICAgLy8gJ2Zyb21faWQnOiAwLFxuICAgICAgICAgICAgLy8gJ2VuZF9pZCc6IDEwMDAsXG4gICAgICAgICAgICAvLyAnb3JkZXInOiAnREVTQycsXG4gICAgICAgICAgICAvLyAnc2luY2UnOiAxNTAzODIxMDUxLFxuICAgICAgICAgICAgLy8gJ2VuZCc6IDE1MDM4MjEwNTEsXG4gICAgICAgICAgICAvLyAnaXNfdG9rZW4nOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHN5bWJvbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtYXJrZXQgPSB0aGlzLm1hcmtldCAoc3ltYm9sKTtcbiAgICAgICAgICAgIHJlcXVlc3RbJ2N1cnJlbmN5X3BhaXInXSA9IG1hcmtldFsnaWQnXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHJpdmF0ZVBvc3RUcmFkZUhpc3RvcnkgKHRoaXMuZXh0ZW5kIChyZXF1ZXN0LCBwYXJhbXMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VPcmRlcnMgKHJlc3BvbnNlWydyZXR1cm4nXSwgbWFya2V0LCBzaW5jZSwgbGltaXQpO1xuICAgIH1cblxuICAgIGFzeW5jIHdpdGhkcmF3IChjb2RlOiBzdHJpbmcsIGFtb3VudCwgYWRkcmVzcywgdGFnID0gdW5kZWZpbmVkLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZFxuICAgICAgICAgKiBAbmFtZSB6YWlmI3dpdGhkcmF3XG4gICAgICAgICAqIEBzZWUgaHR0cHM6Ly96YWlmLWFwaS1kb2N1bWVudC5yZWFkdGhlZG9jcy5pby9qYS9sYXRlc3QvVHJhZGluZ0FQSS5odG1sI2lkNDFcbiAgICAgICAgICogQGRlc2NyaXB0aW9uIG1ha2UgYSB3aXRoZHJhd2FsXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIHVuaWZpZWQgY3VycmVuY3kgY29kZVxuICAgICAgICAgKiBAcGFyYW0ge2Zsb2F0fSBhbW91bnQgdGhlIGFtb3VudCB0byB3aXRoZHJhd1xuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWRkcmVzcyB0aGUgYWRkcmVzcyB0byB3aXRoZHJhdyB0b1xuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBleHRyYSBwYXJhbWV0ZXJzIHNwZWNpZmljIHRvIHRoZSBleGNoYW5nZSBBUEkgZW5kcG9pbnRcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH0gYSBbdHJhbnNhY3Rpb24gc3RydWN0dXJlXXtAbGluayBodHRwczovL2RvY3MuY2N4dC5jb20vIy8/aWQ9dHJhbnNhY3Rpb24tc3RydWN0dXJlfVxuICAgICAgICAgKi9cbiAgICAgICAgWyB0YWcsIHBhcmFtcyBdID0gdGhpcy5oYW5kbGVXaXRoZHJhd1RhZ0FuZFBhcmFtcyAodGFnLCBwYXJhbXMpO1xuICAgICAgICB0aGlzLmNoZWNrQWRkcmVzcyAoYWRkcmVzcyk7XG4gICAgICAgIGF3YWl0IHRoaXMubG9hZE1hcmtldHMgKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbmN5ID0gdGhpcy5jdXJyZW5jeSAoY29kZSk7XG4gICAgICAgIGlmIChjb2RlID09PSAnSlBZJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEV4Y2hhbmdlRXJyb3IgKHRoaXMuaWQgKyAnIHdpdGhkcmF3KCkgZG9lcyBub3QgYWxsb3cgJyArIGNvZGUgKyAnIHdpdGhkcmF3YWxzJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IGN1cnJlbmN5WydpZCddLFxuICAgICAgICAgICAgJ2Ftb3VudCc6IGFtb3VudCxcbiAgICAgICAgICAgICdhZGRyZXNzJzogYWRkcmVzcyxcbiAgICAgICAgICAgIC8vICdtZXNzYWdlJzogJ0hpIScsIC8vIFhFTSBhbmQgb3RoZXJzXG4gICAgICAgICAgICAvLyAnb3B0X2ZlZSc6IDAuMDAzLCAvLyBCVEMgYW5kIE1PTkEgb25seVxuICAgICAgICB9O1xuICAgICAgICBpZiAodGFnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcXVlc3RbJ21lc3NhZ2UnXSA9IHRhZztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnByaXZhdGVQb3N0V2l0aGRyYXcgKHRoaXMuZXh0ZW5kIChyZXF1ZXN0LCBwYXJhbXMpKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIHtcbiAgICAgICAgLy8gICAgICAgICBcInN1Y2Nlc3NcIjogMSxcbiAgICAgICAgLy8gICAgICAgICBcInJldHVyblwiOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgIFwiaWRcIjogMjM2MzQsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwiZmVlXCI6IDAuMDAxLFxuICAgICAgICAvLyAgICAgICAgICAgICBcInR4aWRcIjosXG4gICAgICAgIC8vICAgICAgICAgICAgIFwiZnVuZHNcIjoge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJqcHlcIjogMTUzMjAsXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcImJ0Y1wiOiAxLjM5MixcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIFwieGVtXCI6IDEwMC4yLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJtb25hXCI6IDI2MDBcbiAgICAgICAgLy8gICAgICAgICAgICAgfVxuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgY29uc3QgcmV0dXJuRGF0YSA9IHRoaXMuc2FmZVZhbHVlIChyZXN1bHQsICdyZXR1cm4nKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VUcmFuc2FjdGlvbiAocmV0dXJuRGF0YSwgY3VycmVuY3kpO1xuICAgIH1cblxuICAgIHBhcnNlVHJhbnNhY3Rpb24gKHRyYW5zYWN0aW9uLCBjdXJyZW5jeTogQ3VycmVuY3kgPSB1bmRlZmluZWQpOiBUcmFuc2FjdGlvbiB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICB7XG4gICAgICAgIC8vICAgICAgICAgXCJpZFwiOiAyMzYzNCxcbiAgICAgICAgLy8gICAgICAgICBcImZlZVwiOiAwLjAwMSxcbiAgICAgICAgLy8gICAgICAgICBcInR4aWRcIjosXG4gICAgICAgIC8vICAgICAgICAgXCJmdW5kc1wiOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgIFwianB5XCI6IDE1MzIwLFxuICAgICAgICAvLyAgICAgICAgICAgICBcImJ0Y1wiOiAxLjM5MixcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJ4ZW1cIjogMTAwLjIsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwibW9uYVwiOiAyNjAwXG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvL1xuICAgICAgICBjdXJyZW5jeSA9IHRoaXMuc2FmZUN1cnJlbmN5ICh1bmRlZmluZWQsIGN1cnJlbmN5KTtcbiAgICAgICAgbGV0IGZlZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgZmVlQ29zdCA9IHRoaXMuc2FmZVZhbHVlICh0cmFuc2FjdGlvbiwgJ2ZlZScpO1xuICAgICAgICBpZiAoZmVlQ29zdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmZWUgPSB7XG4gICAgICAgICAgICAgICAgJ2Nvc3QnOiBmZWVDb3N0LFxuICAgICAgICAgICAgICAgICdjdXJyZW5jeSc6IGN1cnJlbmN5Wydjb2RlJ10sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnaWQnOiB0aGlzLnNhZmVTdHJpbmcgKHRyYW5zYWN0aW9uLCAnaWQnKSxcbiAgICAgICAgICAgICd0eGlkJzogdGhpcy5zYWZlU3RyaW5nICh0cmFuc2FjdGlvbiwgJ3R4aWQnKSxcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnZGF0ZXRpbWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnbmV0d29yayc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhZGRyZXNzRnJvbSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhZGRyZXNzJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ2FkZHJlc3NUbyc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdhbW91bnQnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndHlwZSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdjdXJyZW5jeSc6IGN1cnJlbmN5Wydjb2RlJ10sXG4gICAgICAgICAgICAnc3RhdHVzJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgJ3VwZGF0ZWQnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndGFnRnJvbSc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICd0YWcnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAndGFnVG8nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAnY29tbWVudCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdpbnRlcm5hbCc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICdmZWUnOiBmZWUsXG4gICAgICAgICAgICAnaW5mbyc6IHRyYW5zYWN0aW9uLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGN1c3RvbU5vbmNlICgpIHtcbiAgICAgICAgY29uc3QgbnVtID0gKHRoaXMubWlsbGlzZWNvbmRzICgpIC8gMTAwMCkudG9TdHJpbmcgKCk7XG4gICAgICAgIGNvbnN0IG5vbmNlID0gcGFyc2VGbG9hdCAobnVtKTtcbiAgICAgICAgcmV0dXJuIG5vbmNlLnRvRml4ZWQgKDgpO1xuICAgIH1cblxuICAgIHNpZ24gKHBhdGgsIGFwaSA9ICdwdWJsaWMnLCBtZXRob2QgPSAnR0VUJywgcGFyYW1zID0ge30sIGhlYWRlcnMgPSB1bmRlZmluZWQsIGJvZHkgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMudXJsc1snYXBpJ11bJ3Jlc3QnXSArICcvJztcbiAgICAgICAgaWYgKGFwaSA9PT0gJ3B1YmxpYycpIHtcbiAgICAgICAgICAgIHVybCArPSAnYXBpLycgKyB0aGlzLnZlcnNpb24gKyAnLycgKyB0aGlzLmltcGxvZGVQYXJhbXMgKHBhdGgsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXBpID09PSAnZmFwaScpIHtcbiAgICAgICAgICAgIHVybCArPSAnZmFwaS8nICsgdGhpcy52ZXJzaW9uICsgJy8nICsgdGhpcy5pbXBsb2RlUGFyYW1zIChwYXRoLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jaGVja1JlcXVpcmVkQ3JlZGVudGlhbHMgKCk7XG4gICAgICAgICAgICBpZiAoYXBpID09PSAnZWNhcGknKSB7XG4gICAgICAgICAgICAgICAgdXJsICs9ICdlY2FwaSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFwaSA9PT0gJ3RsYXBpJykge1xuICAgICAgICAgICAgICAgIHVybCArPSAndGxhcGknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cmwgKz0gJ3RhcGknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgbm9uY2UgPSB0aGlzLmN1c3RvbU5vbmNlICgpO1xuICAgICAgICAgICAgYm9keSA9IHRoaXMudXJsZW5jb2RlICh0aGlzLmV4dGVuZCAoe1xuICAgICAgICAgICAgICAgICdtZXRob2QnOiBwYXRoLFxuICAgICAgICAgICAgICAgICdub25jZSc6IG5vbmNlLFxuICAgICAgICAgICAgfSwgcGFyYW1zKSk7XG4gICAgICAgICAgICBoZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgICAgICAgICAgICAnS2V5JzogdGhpcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgJ1NpZ24nOiB0aGlzLmhtYWMgKHRoaXMuZW5jb2RlIChib2R5KSwgdGhpcy5lbmNvZGUgKHRoaXMuc2VjcmV0KSwgc2hhNTEyKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgJ3VybCc6IHVybCwgJ21ldGhvZCc6IG1ldGhvZCwgJ2JvZHknOiBib2R5LCAnaGVhZGVycyc6IGhlYWRlcnMgfTtcbiAgICB9XG5cbiAgICBoYW5kbGVFcnJvcnMgKGh0dHBDb2RlLCByZWFzb24sIHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5LCByZXNwb25zZSwgcmVxdWVzdEhlYWRlcnMsIHJlcXVlc3RCb2R5KSB7XG4gICAgICAgIGlmIChyZXNwb25zZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICB7XCJlcnJvclwiOiBcInVuc3VwcG9ydGVkIGN1cnJlbmN5X3BhaXJcIn1cbiAgICAgICAgLy9cbiAgICAgICAgY29uc3QgZmVlZGJhY2sgPSB0aGlzLmlkICsgJyAnICsgYm9keTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSB0aGlzLnNhZmVTdHJpbmcgKHJlc3BvbnNlLCAnZXJyb3InKTtcbiAgICAgICAgaWYgKGVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFeGFjdGx5TWF0Y2hlZEV4Y2VwdGlvbiAodGhpcy5leGNlcHRpb25zWydleGFjdCddLCBlcnJvciwgZmVlZGJhY2spO1xuICAgICAgICAgICAgdGhpcy50aHJvd0Jyb2FkbHlNYXRjaGVkRXhjZXB0aW9uICh0aGlzLmV4Y2VwdGlvbnNbJ2Jyb2FkJ10sIGVycm9yLCBmZWVkYmFjayk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXhjaGFuZ2VFcnJvciAoZmVlZGJhY2spOyAvLyB1bmtub3duIG1lc3NhZ2VcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdWNjZXNzID0gdGhpcy5zYWZlVmFsdWUgKHJlc3BvbnNlLCAnc3VjY2VzcycsIHRydWUpO1xuICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFeGNoYW5nZUVycm9yIChmZWVkYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59XG4iXX0=