
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitflyer.js';
import { ExchangeError, ArgumentsRequired, OrderNotFound } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class bitflyer extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitflyer',
            'name': 'bitFlyer',
            'countries': [ 'JP' ],
            'version': 'v1',
            'rateLimit': 1000, // their nonce-timestamp is in seconds...
            'hostname': 'bitflyer.com', // or bitflyer.com
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': undefined, // has but not fully implemented
                'future': undefined, // has but not fully implemented
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': 'emulated',
                'fetchDeposits': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': 'emulated',
                'fetchOrder': 'emulated',
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg',
                'api': {
                    'rest': 'https://api.{hostname}',
                },
                'www': 'https://bitflyer.com',
                'doc': 'https://lightning.bitflyer.com/docs?lang=en',
            },
            'api': {
                'public': {
                    'get': [
                        'getmarkets/usa', // new (wip)
                        'getmarkets/eu',  // new (wip)
                        'getmarkets',     // or 'markets'
                        'getboard',       // ...
                        'getticker',
                        'getexecutions',
                        'gethealth',
                        'getboardstate',
                        'getchats',
                    ],
                },
                'private': {
                    'get': [
                        'getpermissions',
                        'getbalance',
                        'getbalancehistory',
                        'getcollateral',
                        'getcollateralhistory',
                        'getcollateralaccounts',
                        'getaddresses',
                        'getcoinins',
                        'getcoinouts',
                        'getbankaccounts',
                        'getdeposits',
                        'getwithdrawals',
                        'getchildorders',
                        'getparentorders',
                        'getparentorder',
                        'getexecutions',
                        'getpositions',
                        'gettradingcommission',
                    ],
                    'post': [
                        'sendcoin',
                        'withdraw',
                        'sendchildorder',
                        'cancelchildorder',
                        'sendparentorder',
                        'cancelparentorder',
                        'cancelallchildorders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    parseExpiryDate (expiry) {
        const day = expiry.slice (0, 2);
        const monthName = expiry.slice (2, 5);
        const year = expiry.slice (5, 9);
        const months = {
            'JAN': '01',
            'FEB': '02',
            'MAR': '03',
            'APR': '04',
            'MAY': '05',
            'JUN': '06',
            'JUL': '07',
            'AUG': '08',
            'SEP': '09',
            'OCT': '10',
            'NOV': '11',
            'DEC': '12',
        };
        const month = this.safeString (months, monthName);
        return this.parse8601 (year + '-' + month + '-' + day + 'T00:00:00Z');
    }

    safeMarket (marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        // Bitflyer has a different type of conflict in markets, because
        // some of their ids (ETH/BTC and BTC/JPY) are duplicated in US, EU and JP.
        // Since they're the same we just need to return one
        return super.safeMarket (marketId, market, delimiter, 'spot');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitflyer#fetchMarkets
         * @description retrieves data on all markets for bitflyer
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const jp_markets = await this.publicGetGetmarkets (params);
        //
        //     [
        //         // spot
        //         { "product_code": "BTC_JPY", "market_type": "Spot" },
        //         { "product_code": "BCH_BTC", "market_type": "Spot" },
        //         // forex swap
        //         { "product_code": "FX_BTC_JPY", "market_type": "FX" },
        //         // future
        //         {
        //             "product_code": "BTCJPY11FEB2022",
        //             "alias": "BTCJPY_MAT1WK",
        //             "market_type": "Futures",
        //         },
        //     ];
        //
        const us_markets = await this.publicGetGetmarketsUsa (params);
        //
        //     [
        //         { "product_code": "BTC_USD", "market_type": "Spot" },
        //         { "product_code": "BTC_JPY", "market_type": "Spot" },
        //     ];
        //
        const eu_markets = await this.publicGetGetmarketsEu (params);
        //
        //     [
        //         { "product_code": "BTC_EUR", "market_type": "Spot" },
        //         { "product_code": "BTC_JPY", "market_type": "Spot" },
        //     ];
        //
        let markets = this.arrayConcat (jp_markets, us_markets);
        markets = this.arrayConcat (markets, eu_markets);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'product_code');
            const currencies = id.split ('_');
            const marketType = this.safeString (market, 'market_type');
            const swap = (marketType === 'FX');
            const future = (marketType === 'Futures');
            const spot = !swap && !future;
            let type = 'spot';
            let settle = undefined;
            let baseId = undefined;
            let quoteId = undefined;
            let expiry = undefined;
            if (spot) {
                baseId = this.safeString (currencies, 0);
                quoteId = this.safeString (currencies, 1);
            } else if (swap) {
                type = 'swap';
                baseId = this.safeString (currencies, 1);
                quoteId = this.safeString (currencies, 2);
            } else if (future) {
                const alias = this.safeString (market, 'alias');
                if (alias === undefined) {
                    // no alias:
                    // { product_code: 'BTCJPY11MAR2022', market_type: 'Futures' }
                    // TODO this will break if there are products with 4 chars
                    baseId = id.slice (0, 3);
                    quoteId = id.slice (3, 6);
                    // last 9 chars are expiry date
                    const expiryDate = id.slice (-9);
                    expiry = this.parseExpiryDate (expiryDate);
                } else {
                    const splitAlias = alias.split ('_');
                    const currencyIds = this.safeString (splitAlias, 0);
                    baseId = currencyIds.slice (0, -3);
                    quoteId = currencyIds.slice (-3);
                    const splitId = id.split (currencyIds);
                    const expiryDate = this.safeString (splitId, 1);
                    expiry = this.parseExpiryDate (expiryDate);
                }
                type = 'future';
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let taker = this.fees['trading']['taker'];
            let maker = this.fees['trading']['maker'];
            const contract = swap || future;
            if (contract) {
                maker = 0.0;
                taker = 0.0;
                settle = 'JPY';
                symbol = symbol + ':' + settle;
                if (future) {
                    symbol = symbol + '-' + this.yymmdd (expiry);
                }
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': spot,
                'margin': false,
                'swap': swap,
                'future': future,
                'option': false,
                'active': true,
                'contract': contract,
                'linear': spot ? undefined : true,
                'inverse': spot ? undefined : false,
                'taker': taker,
                'maker': maker,
                'contractSize': undefined,
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': undefined,
                    'price': undefined,
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
                'info': market,
            });
        }
        return result;
    }

    parseBalance (response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'amount');
            account['free'] = this.safeString (balance, 'available');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitflyer#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetGetbalance (params);
        //
        //     [
        //         {
        //             "currency_code": "JPY",
        //             "amount": 1024078,
        //             "available": 508000
        //         },
        //         {
        //             "currency_code": "BTC",
        //             "amount": 10.24,
        //             "available": 4.12
        //         },
        //         {
        //             "currency_code": "ETH",
        //             "amount": 20.48,
        //             "available": 16.38
        //         }
        //     ]
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
        };
        const orderbook = await this.publicGetGetboard (this.extend (request, params));
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'bids', 'asks', 'price', 'size');
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const last = this.safeString (ticker, 'ltp');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume_by_product'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
        };
        const response = await this.publicGetGetticker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public) v1
        //
        //     {
        //          "id":2278466664,
        //          "side":"SELL",
        //          "price":56810.7,
        //          "size":0.08798,
        //          "exec_date":"2021-11-19T11:46:39.323",
        //          "buy_child_order_acceptance_id":"JRF20211119-114209-236525",
        //          "sell_child_order_acceptance_id":"JRF20211119-114639-236919"
        //      }
        //
        //      {
        //          "id":2278463423,
        //          "side":"BUY",
        //          "price":56757.83,
        //          "size":0.6003,"exec_date":"2021-11-19T11:28:00.523",
        //          "buy_child_order_acceptance_id":"JRF20211119-112800-236526",
        //          "sell_child_order_acceptance_id":"JRF20211119-112734-062017"
        //      }
        //
        //
        //
        let side = this.safeStringLower (trade, 'side');
        if (side !== undefined) {
            if (side.length < 1) {
                side = undefined;
            }
        }
        let order = undefined;
        if (side !== undefined) {
            const idInner = side + '_child_order_acceptance_id';
            if (idInner in trade) {
                order = trade[idInner];
            }
        }
        if (order === undefined) {
            order = this.safeString (trade, 'child_order_acceptance_id');
        }
        const timestamp = this.parse8601 (this.safeString (trade, 'exec_date'));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const id = this.safeString (trade, 'id');
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': order,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicGetGetexecutions (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTradingFee (symbol: string, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
        };
        const response = await this.privateGetGettradingcommission (this.extend (request, params));
        //
        //   {
        //       commission_rate: '0.0020'
        //   }
        //
        const fee = this.safeNumber (response, 'commission_rate');
        return {
            'info': response,
            'symbol': market['symbol'],
            'maker': fee,
            'taker': fee,
        };
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'product_code': this.marketId (symbol),
            'child_order_type': type.toUpperCase (),
            'side': side.toUpperCase (),
            'price': price,
            'size': amount,
        };
        const result = await this.privatePostSendchildorder (this.extend (request, params));
        // { "status": - 200, "error_message": "Insufficient funds", "data": null }
        const id = this.safeString (result, 'child_order_acceptance_id');
        return this.safeOrder ({
            'id': id,
            'info': result,
        });
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const request = {
            'product_code': this.marketId (symbol),
            'child_order_acceptance_id': id,
        };
        return await this.privatePostCancelchildorder (this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'COMPLETED': 'closed',
            'CANCELED': 'canceled',
            'EXPIRED': 'canceled',
            'REJECTED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (order, 'child_order_date'));
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'executed_size');
        const remaining = this.safeString (order, 'outstanding_size');
        const status = this.parseOrderStatus (this.safeString (order, 'child_order_state'));
        const type = this.safeStringLower (order, 'child_order_type');
        const side = this.safeStringLower (order, 'side');
        const marketId = this.safeString (order, 'product_code');
        const symbol = this.safeSymbol (marketId, market);
        let fee = undefined;
        const feeCost = this.safeNumber (order, 'total_commission');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
                'rate': undefined,
            };
        }
        const id = this.safeString (order, 'child_order_acceptance_id');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit = 100, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
            'count': limit,
        };
        const response = await this.privateGetGetchildorders (this.extend (request, params));
        let orders = this.parseOrders (response, market, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit = 100, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'child_order_state': 'ACTIVE',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit = 100, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'child_order_state': 'COMPLETED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a `symbol` argument');
        }
        const orders = await this.fetchOrders (symbol);
        const ordersById = this.indexBy (orders, 'id');
        if (id in ordersById) {
            return ordersById[id];
        }
        throw new OrderNotFound (this.id + ' No order found with id ' + id);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_code': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetexecutions (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchPositions (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchPositions
         * @description fetch all open positions
         * @param {[string]} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPositions() requires a `symbols` argument, exactly one symbol in an array');
        }
        await this.loadMarkets ();
        const request = {
            'product_code': this.marketIds (symbols),
        };
        const response = await this.privateGetGetpositions (this.extend (request, params));
        //
        //     [
        //         {
        //             "product_code": "FX_BTC_JPY",
        //             "side": "BUY",
        //             "price": 36000,
        //             "size": 10,
        //             "commission": 0,
        //             "swap_point_accumulate": -35,
        //             "require_collateral": 120000,
        //             "open_date": "2015-11-03T10:04:45.011",
        //             "leverage": 3,
        //             "pnl": 965,
        //             "sfd": -0.5
        //         }
        //     ]
        //
        // todo unify parsePosition/parsePositions
        return response;
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        this.checkAddress (address);
        await this.loadMarkets ();
        if (code !== 'JPY' && code !== 'USD' && code !== 'EUR') {
            throw new ExchangeError (this.id + ' allows withdrawing JPY, USD, EUR only, ' + code + ' is not supported');
        }
        const currency = this.currency (code);
        const request = {
            'currency_code': currency['id'],
            'amount': amount,
            // 'bank_account_id': 1234,
        };
        const response = await this.privatePostWithdraw (this.extend (request, params));
        //
        //     {
        //         "message_id": "69476620-5056-4003-bcbe-42658a2b041b"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (limit !== undefined) {
            request['count'] = limit; // default 100
        }
        const response = await this.privateGetGetcoinins (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 100,
        //             "order_id": "CDP20151227-024141-055555",
        //             "currency_code": "BTC",
        //             "amount": 0.00002,
        //             "address": "1WriteySQufKZ2pVuM1oMhPrTtTVFq35j",
        //             "tx_hash": "9f92ee65a176bb9545f7becb8706c50d07d4cee5ffca34d8be3ef11d411405ae",
        //             "status": "COMPLETED",
        //             "event_date": "2015-11-27T08:59:20.301"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitflyer#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitflyer api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (limit !== undefined) {
            request['count'] = limit; // default 100
        }
        const response = await this.privateGetGetcoinouts (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 500,
        //             "order_id": "CWD20151224-014040-077777",
        //             "currency_code": "BTC",
        //             "amount": 0.1234,
        //             "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //             "tx_hash": "724c07dfd4044abcb390b0412c3e707dd5c4f373f0a52b3bd295ce32b478c60a",
        //             "fee": 0.0005,
        //             "additional_fee": 0.0001,
        //             "status": "COMPLETED",
        //             "event_date": "2015-12-24T01:40:40.397"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    parseDepositStatus (status) {
        const statuses = {
            'PENDING': 'pending',
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseWithdrawalStatus (status) {
        const statuses = {
            'PENDING': 'pending',
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "id": 100,
        //         "order_id": "CDP20151227-024141-055555",
        //         "currency_code": "BTC",
        //         "amount": 0.00002,
        //         "address": "1WriteySQufKZ2pVuM1oMhPrTtTVFq35j",
        //         "tx_hash": "9f92ee65a176bb9545f7becb8706c50d07d4cee5ffca34d8be3ef11d411405ae",
        //         "status": "COMPLETED",
        //         "event_date": "2015-11-27T08:59:20.301"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": 500,
        //         "order_id": "CWD20151224-014040-077777",
        //         "currency_code": "BTC",
        //         "amount": 0.1234,
        //         "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //         "tx_hash": "724c07dfd4044abcb390b0412c3e707dd5c4f373f0a52b3bd295ce32b478c60a",
        //         "fee": 0.0005,
        //         "additional_fee": 0.0001,
        //         "status": "COMPLETED",
        //         "event_date": "2015-12-24T01:40:40.397"
        //     }
        //
        // withdraw
        //
        //     {
        //         "message_id": "69476620-5056-4003-bcbe-42658a2b041b"
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'message_id');
        const address = this.safeString (transaction, 'address');
        const currencyId = this.safeString (transaction, 'currency_code');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString (transaction, 'event_date'));
        const amount = this.safeNumber (transaction, 'amount');
        const txId = this.safeString (transaction, 'tx_hash');
        const rawStatus = this.safeString (transaction, 'status');
        let type = undefined;
        let status = undefined;
        let fee = undefined;
        if ('fee' in transaction) {
            type = 'withdrawal';
            status = this.parseWithdrawalStatus (rawStatus);
            const feeCost = this.safeNumber (transaction, 'fee');
            const additionalFee = this.safeNumber (transaction, 'additional_fee');
            fee = { 'currency': code, 'cost': feeCost + additionalFee };
        } else {
            type = 'deposit';
            status = this.parseDepositStatus (rawStatus);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': undefined,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/';
        if (api === 'private') {
            request += 'me/';
        }
        request += path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                request += '?' + this.urlencode (params);
            }
        }
        const baseUrl = this.implodeHostname (this.urls['api']['rest']);
        const url = baseUrl + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let auth = [ nonce, method, request ].join ('');
            if (Object.keys (params).length) {
                if (method !== 'GET') {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-TIMESTAMP': nonce,
                'ACCESS-SIGN': this.hmac (this.encode (auth), this.encode (this.secret), sha256),
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
