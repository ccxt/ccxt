'use strict';

var coinone$1 = require('./abstract/coinone.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha512 = require('./static_dependencies/noble-hashes/sha512.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class coinone extends coinone$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': ['KR'],
            // 'enableRateLimit': false,
            'rateLimit': 667,
            'version': 'v2',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': false,
                'fetchDepositAddresses': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg',
                'api': {
                    'rest': 'https://api.coinone.co.kr',
                },
                'www': 'https://coinone.co.kr',
                'doc': 'https://doc.coinone.co.kr',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook/',
                        'trades/',
                        'ticker/',
                    ],
                },
                'private': {
                    'post': [
                        'account/deposit_address/',
                        'account/btc_deposit_address/',
                        'account/balance/',
                        'account/daily_balance/',
                        'account/user_info/',
                        'account/virtual_account/',
                        'order/cancel_all/',
                        'order/cancel/',
                        'order/limit_buy/',
                        'order/limit_sell/',
                        'order/complete_orders/',
                        'order/limit_orders/',
                        'order/query_order/',
                        'transaction/auth_number/',
                        'transaction/history/',
                        'transaction/krw/history/',
                        'transaction/btc/',
                        'transaction/coin/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                '405': errors.OnMaintenance,
                '104': errors.OrderNotFound,
                '108': errors.BadSymbol,
                '107': errors.BadRequest, // {"errorCode":"107","errorMsg":"Parameter error","result":"error"}
            },
            'commonCurrencies': {
                'SOC': 'Soda Coin',
            },
        });
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name coinone#fetchMarkets
         * @description retrieves data on all markets for coinone
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const request = {
            'currency': 'all',
        };
        const response = await this.publicGetTicker(request);
        //
        //    {
        //        "result": "success",
        //        "errorCode": "0",
        //        "timestamp": "1643676668",
        //        "xec": {
        //          "currency": "xec",
        //          "first": "0.0914",
        //          "low": "0.0894",
        //          "high": "0.096",
        //          "last": "0.0937",
        //          "volume": "1673283662.9797",
        //          "yesterday_first": "0.0929",
        //          "yesterday_low": "0.0913",
        //          "yesterday_high": "0.0978",
        //          "yesterday_last": "0.0913",
        //          "yesterday_volume": "1167285865.4571"
        //        },
        //        ...
        //    }
        //
        const result = [];
        const quoteId = 'krw';
        const quote = this.safeCurrencyCode(quoteId);
        const baseIds = Object.keys(response);
        for (let i = 0; i < baseIds.length; i++) {
            const baseId = baseIds[i];
            const ticker = this.safeValue(response, baseId, {});
            const currency = this.safeValue(ticker, 'currency');
            if (currency === undefined) {
                continue;
            }
            const base = this.safeCurrencyCode(baseId);
            result.push({
                'id': baseId,
                'symbol': base + '/' + quote,
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
                    'amount': this.parseNumber('1e-4'),
                    'price': this.parseNumber('1e-4'),
                    'cost': this.parseNumber('1e-8'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
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
                },
                'info': ticker,
            });
        }
        return result;
    }
    parseBalance(response) {
        const result = { 'info': response };
        const balances = this.omit(response, [
            'errorCode',
            'result',
            'normalWallets',
        ]);
        const currencyIds = Object.keys(balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = balances[currencyId];
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'avail');
            account['total'] = this.safeString(balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name coinone#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        const response = await this.privatePostAccountBalance(params);
        return this.parseBalance(response);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinone#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'currency': market['id'],
            'format': 'json',
        };
        const response = await this.publicGetOrderbook(this.extend(request, params));
        const timestamp = this.safeTimestamp(response, 'timestamp');
        return this.parseOrderBook(response, market['symbol'], timestamp, 'bid', 'ask', 'price', 'qty');
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name coinone#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {
            'currency': 'all',
            'format': 'json',
        };
        const response = await this.publicGetTicker(this.extend(request, params));
        const result = {};
        const ids = Object.keys(response);
        const timestamp = this.safeTimestamp(response, 'timestamp');
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket(id);
            const symbol = market['symbol'];
            const ticker = response[id];
            result[symbol] = this.parseTicker(ticker, market);
            result[symbol]['timestamp'] = timestamp;
        }
        return this.filterByArray(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name coinone#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'currency': market['id'],
            'format': 'json',
        };
        const response = await this.publicGetTicker(this.extend(request, params));
        return this.parseTicker(response, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "currency":"xec",
        //         "first":"0.1069",
        //         "low":"0.09",
        //         "high":"0.1069",
        //         "last":"0.0911",
        //         "volume":"4591217267.4974",
        //         "yesterday_first":"0.1128",
        //         "yesterday_low":"0.1035",
        //         "yesterday_high":"0.1167",
        //         "yesterday_last":"0.1069",
        //         "yesterday_volume":"4014832231.5102"
        //     }
        //
        const timestamp = this.safeTimestamp(ticker, 'timestamp');
        const open = this.safeString(ticker, 'first');
        const last = this.safeString(ticker, 'last');
        const previousClose = this.safeString(ticker, 'yesterday_last');
        const symbol = this.safeSymbol(undefined, market);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': previousClose,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "timestamp": "1416893212",
        //         "price": "420000.0",
        //         "qty": "0.1",
        //         "is_ask": "1"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "timestamp": "1416561032",
        //         "price": "419000.0",
        //         "type": "bid",
        //         "qty": "0.001",
        //         "feeRate": "-0.0015",
        //         "fee": "-0.0000015",
        //         "orderId": "E84A1AC2-8088-4FA0-B093-A3BCDB9B3C85"
        //     }
        //
        const timestamp = this.safeTimestamp(trade, 'timestamp');
        market = this.safeMarket(undefined, market);
        const is_ask = this.safeString(trade, 'is_ask');
        let side = this.safeString(trade, 'type');
        if (is_ask !== undefined) {
            if (is_ask === '1') {
                side = 'sell';
            }
            else if (is_ask === '0') {
                side = 'buy';
            }
        }
        else {
            if (side === 'ask') {
                side = 'sell';
            }
            else if (side === 'bid') {
                side = 'buy';
            }
        }
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'qty');
        const orderId = this.safeString(trade, 'orderId');
        let feeCostString = this.safeString(trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            feeCostString = Precise["default"].stringAbs(feeCostString);
            let feeRateString = this.safeString(trade, 'feeRate');
            feeRateString = Precise["default"].stringAbs(feeRateString);
            const feeCurrencyCode = (side === 'sell') ? market['quote'] : market['base'];
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': feeRateString,
            };
        }
        return this.safeTrade({
            'id': this.safeString(trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'order': orderId,
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinone#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'currency': market['id'],
            'format': 'json',
        };
        const response = await this.publicGetTrades(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "timestamp": "1416895635",
        //         "currency": "btc",
        //         "completeOrders": [
        //             {
        //                 "timestamp": "1416893212",
        //                 "price": "420000.0",
        //                 "qty": "0.1",
        //                 "is_ask": "1"
        //             }
        //         ]
        //     }
        //
        const completeOrders = this.safeValue(response, 'completeOrders', []);
        return this.parseTrades(completeOrders, market, since, limit);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name coinone#createOrder
         * @description create a trade order
         * @see https://doc.coinone.co.kr/#tag/Order-V2/operation/v2_order_limit_buy
         * @see https://doc.coinone.co.kr/#tag/Order-V2/operation/v2_order_limit_sell
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type must be 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (type !== 'limit') {
            throw new errors.ExchangeError(this.id + ' createOrder() allows limit orders only');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'price': price,
            'currency': market['id'],
            'qty': amount,
        };
        const method = 'privatePostOrder' + this.capitalize(type) + this.capitalize(side);
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "8a82c561-40b4-4cb3-9bc0-9ac9ffc1d63b"
        //     }
        //
        return this.parseOrder(response, market);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name coinone#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'order_id': id,
            'currency': market['id'],
        };
        const response = await this.privatePostOrderQueryOrder(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "0e3019f2-1e4d-11e9-9ec7-00e04c3600d7",
        //         "baseCurrency": "KRW",
        //         "targetCurrency": "BTC",
        //         "price": "10011000.0",
        //         "originalQty": "3.0",
        //         "executedQty": "0.62",
        //         "canceledQty": "1.125",
        //         "remainQty": "1.255",
        //         "status": "partially_filled",
        //         "side": "bid",
        //         "orderedAt": 1499340941,
        //         "updatedAt": 1499341142,
        //         "feeRate": "0.002",
        //         "fee": "0.00124",
        //         "averageExecutedPrice": "10011000.0"
        //     }
        //
        return this.parseOrder(response, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'live': 'open',
            'partially_filled': 'open',
            'partially_canceled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "8a82c561-40b4-4cb3-9bc0-9ac9ffc1d63b"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "0e3019f2-1e4d-11e9-9ec7-00e04c3600d7",
        //         "baseCurrency": "KRW",
        //         "targetCurrency": "BTC",
        //         "price": "10011000.0",
        //         "originalQty": "3.0",
        //         "executedQty": "0.62",
        //         "canceledQty": "1.125",
        //         "remainQty": "1.255",
        //         "status": "partially_filled",
        //         "side": "bid",
        //         "orderedAt": 1499340941,
        //         "updatedAt": 1499341142,
        //         "feeRate": "0.002",
        //         "fee": "0.00124",
        //         "averageExecutedPrice": "10011000.0"
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "index": "0",
        //         "orderId": "68665943-1eb5-4e4b-9d76-845fc54f5489",
        //         "timestamp": "1449037367",
        //         "price": "444000.0",
        //         "qty": "0.3456",
        //         "type": "ask",
        //         "feeRate": "-0.0015"
        //     }
        //
        const id = this.safeString(order, 'orderId');
        const baseId = this.safeString(order, 'baseCurrency');
        const quoteId = this.safeString(order, 'targetCurrency');
        const base = this.safeCurrencyCode(baseId, market['base']);
        const quote = this.safeCurrencyCode(quoteId, market['quote']);
        const symbol = base + '/' + quote;
        market = this.safeMarket(symbol, market, '/');
        const timestamp = this.safeTimestamp2(order, 'timestamp', 'updatedAt');
        let side = this.safeString2(order, 'type', 'side');
        if (side === 'ask') {
            side = 'sell';
        }
        else if (side === 'bid') {
            side = 'buy';
        }
        const remainingString = this.safeString(order, 'remainQty');
        const amountString = this.safeString2(order, 'originalQty', 'qty');
        let status = this.safeString(order, 'status');
        // https://github.com/ccxt/ccxt/pull/7067
        if (status === 'live') {
            if ((remainingString !== undefined) && (amountString !== undefined)) {
                const isLessThan = Precise["default"].stringLt(remainingString, amountString);
                if (isLessThan) {
                    status = 'canceled';
                }
            }
        }
        status = this.parseOrderStatus(status);
        let fee = undefined;
        const feeCostString = this.safeString(order, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyCode = (side === 'sell') ? quote : base;
            fee = {
                'cost': feeCostString,
                'rate': this.safeString(order, 'feeRate'),
                'currency': feeCurrencyCode,
            };
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString(order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'average': this.safeString(order, 'averageExecutedPrice'),
            'amount': amountString,
            'filled': this.safeString(order, 'executedQty'),
            'remaining': remainingString,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinone#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // The returned amount might not be same as the ordered amount. If an order is partially filled, the returned amount means the remaining amount.
        // For the same reason, the returned amount and remaining are always same, and the returned filled and cost are always zero.
        if (symbol === undefined) {
            throw new errors.ExchangeError(this.id + ' fetchOpenOrders() allows fetching closed orders with a specific symbol');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privatePostOrderLimitOrders(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "limitOrders": [
        //             {
        //                 "index": "0",
        //                 "orderId": "68665943-1eb5-4e4b-9d76-845fc54f5489",
        //                 "timestamp": "1449037367",
        //                 "price": "444000.0",
        //                 "qty": "0.3456",
        //                 "type": "ask",
        //                 "feeRate": "-0.0015"
        //             }
        //         ]
        //     }
        //
        const limitOrders = this.safeValue(response, 'limitOrders', []);
        return this.parseOrders(limitOrders, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinone#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privatePostOrderCompleteOrders(this.extend(request, params));
        //
        // despite the name of the endpoint it returns trades which may have a duplicate orderId
        // https://github.com/ccxt/ccxt/pull/7067
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "completeOrders": [
        //             {
        //                 "timestamp": "1416561032",
        //                 "price": "419000.0",
        //                 "type": "bid",
        //                 "qty": "0.001",
        //                 "feeRate": "-0.0015",
        //                 "fee": "-0.0000015",
        //                 "orderId": "E84A1AC2-8088-4FA0-B093-A3BCDB9B3C85"
        //             }
        //         ]
        //     }
        //
        const completeOrders = this.safeValue(response, 'completeOrders', []);
        return this.parseTrades(completeOrders, market, since, limit);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name coinone#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            // eslint-disable-next-line quotes
            throw new errors.ArgumentsRequired(this.id + " cancelOrder() requires a symbol argument. To cancel the order, pass a symbol argument and {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument of cancelOrder.");
        }
        const price = this.safeNumber(params, 'price');
        const qty = this.safeNumber(params, 'qty');
        const isAsk = this.safeInteger(params, 'is_ask');
        if ((price === undefined) || (qty === undefined) || (isAsk === undefined)) {
            // eslint-disable-next-line quotes
            throw new errors.ArgumentsRequired(this.id + " cancelOrder() requires {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument.");
        }
        await this.loadMarkets();
        const request = {
            'order_id': id,
            'price': price,
            'qty': qty,
            'is_ask': isAsk,
            'currency': this.marketId(symbol),
        };
        const response = await this.privatePostOrderCancel(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0"
        //     }
        //
        return response;
    }
    async fetchDepositAddresses(codes = undefined, params = {}) {
        /**
         * @method
         * @name coinone#fetchDepositAddresses
         * @description fetch deposit addresses for multiple currencies and chain types
         * @param {[string]|undefined} codes list of unified currency codes, default is undefined
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const response = await this.privatePostAccountDepositAddress(params);
        //
        //     {
        //         result: 'success',
        //         errorCode: '0',
        //         walletAddress: {
        //             matic: null,
        //             btc: "mnobqu4i6qMCJWDpf5UimRmr8JCvZ8FLcN",
        //             xrp: null,
        //             xrp_tag: '-1',
        //             kava: null,
        //             kava_memo: null,
        //         }
        //     }
        //
        const walletAddress = this.safeValue(response, 'walletAddress', {});
        const keys = Object.keys(walletAddress);
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = walletAddress[key];
            if ((!value) || (value === '-1')) {
                continue;
            }
            const parts = key.split('_');
            const currencyId = this.safeValue(parts, 0);
            const secondPart = this.safeValue(parts, 1);
            const code = this.safeCurrencyCode(currencyId);
            let depositAddress = this.safeValue(result, code);
            if (depositAddress === undefined) {
                depositAddress = {
                    'currency': code,
                    'address': undefined,
                    'tag': undefined,
                    'info': value,
                };
            }
            const address = this.safeString(depositAddress, 'address', value);
            this.checkAddress(address);
            depositAddress['address'] = address;
            depositAddress['info'] = address;
            if ((secondPart === 'tag' || secondPart === 'memo')) {
                depositAddress['tag'] = value;
                depositAddress['info'] = [address, value];
            }
            result[code] = depositAddress;
        }
        return result;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['rest'] + '/';
        if (api === 'public') {
            url += request;
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else {
            this.checkRequiredCredentials();
            url += this.version + '/' + request;
            const nonce = this.nonce().toString();
            const json = this.json(this.extend({
                'access_token': this.apiKey,
                'nonce': nonce,
            }, params));
            const payload = this.stringToBase64(json);
            body = payload;
            const secret = this.secret.toUpperCase();
            const signature = this.hmac(payload, this.encode(secret), sha512.sha512);
            headers = {
                'Content-Type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if ('result' in response) {
            const result = response['result'];
            if (result !== 'success') {
                //
                //    {  "errorCode": "405",  "status": "maintenance",  "result": "error"}
                //
                const errorCode = this.safeString(response, 'errorCode');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException(this.exceptions, errorCode, feedback);
                throw new errors.ExchangeError(feedback);
            }
        }
        else {
            throw new errors.ExchangeError(this.id + ' ' + body);
        }
        return undefined;
    }
}

module.exports = coinone;
