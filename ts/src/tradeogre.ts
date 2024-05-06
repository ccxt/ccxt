
// ---------------------------------------------------------------------------

import { Market } from '../ccxt.js';
import Exchange from './abstract/tradeogre.js';
import { InsufficientFunds, AuthenticationError, BadRequest, ExchangeError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Int, Num, Order, OrderSide, OrderType, Str, Ticker, IndexType } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class tradeogre
 * @augments Exchange
 */
export default class tradeogre extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tradeogre',
            'name': 'tradeogre',
            'countries': [ ],
            'rateLimit': 100,
            'version': 'v2',
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createMarketOrder': false,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPermissions': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'referral': '',
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/3aa748b7-ea44-45e9-a9e7-b1d207a2578a',
                'api': {
                    'rest': 'https://tradeogre.com/api/v1',
                },
                'www': 'https://tradeogre.com',
                'doc': 'https://tradeogre.com/help/api',
                'fees': 'https://tradeogre.com/help/fees',
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'api': {
                'public': {
                    'get': {
                        'markets': 1,
                        'orders/{market}': 1,
                        'ticker/{market}': 1,
                        'history/{market}': 1,
                    },
                },
                'private': {
                    'get': {
                        'account/balance': 1,
                        'account/balances': 1,
                        'account/order/{uuid}': 1,
                    },
                    'post': {
                        'order/buy': 1,
                        'order/sell': 1,
                        'order/cancel': 1,
                        'orders': 1,
                        'account/orders': 1,
                    },
                },
            },
            'commonCurrencies': {
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Must be authorized': AuthenticationError,
                    'Market not found': BadRequest,
                    'Insufficient funds': InsufficientFunds,
                    'Order not found': BadRequest,
                },
            },
            'options': {
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name tradeogre#fetchMarkets
         * @description retrieves data on all markets for bigone
         * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        //
        //   [
        //       {
        //          "AEON-BTC": {
        //             "initialprice": "0.00022004",
        //             "price": "0.00025992",
        //             "high": "0.00025992",
        //             "low": "0.00022003",
        //             "volume": "0.00359066",
        //             "bid": "0.00022456",
        //             "ask": "0.00025993"
        //          }
        //       }
        //   ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const rawMarket = response[i];
            const keys = Object.keys (rawMarket);
            const id = this.safeString (keys, 0);
            const keyParts = id.split ('-');
            const baseId = this.safeString (keyParts, 0);
            const quoteId = this.safeString (keyParts, 1);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const market = this.safeMarketStructure ({
                'id': id,
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
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'taker': this.fees['trading']['taker'],
                'maker': this.fees['trading']['taker'],
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision ('8')),
                    'price': this.parseNumber (this.parsePrecision ('8')), // they're not explicit about it
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
                'created': undefined,
                'info': rawMarket,
            });
            result.push (market);
        }
        return result;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name tradeogre#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTickerMarket (this.extend (request, params));
        //
        //   {
        //       "success":true,
        //       "initialprice":"0.02502002",
        //       "price":"0.02500000",
        //       "high":"0.03102001",
        //       "low":"0.02500000",
        //       "volume":"0.15549958",
        //       "bid":"0.02420000",
        //       "ask":"0.02625000"
        //   }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market: Market = undefined) {
        //
        //  {
        //       "success":true,
        //       "initialprice":"0.02502002",
        //       "price":"0.02500000",
        //       "high":"0.03102001",
        //       "low":"0.02500000",
        //       "volume":"0.15549958",
        //       "bid":"0.02420000",
        //       "ask":"0.02625000"
        //   }
        //
        return this.safeTicker ({
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name tradeogre#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetOrdersMarket (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "buy": {
        //        "0.02425501": "36.46986607",
        //        "0.02425502": "93.64201137",
        //        "0.02425503": "19.02000000",
        //        "0.02425515": "115.49000000"
        // }
        //
        const rawBids = this.safeDict (response, 'buy', {});
        const rawAsks = this.safeDict (response, 'sell', {});
        const rawOrderbook = {
            'bids': rawBids,
            'asks': rawAsks,
        };
        const orderbook = this.parseOrderBook (rawOrderbook, symbol);
        return orderbook;
    }

    parseBidsAsks (bidasks, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        const prices = Object.keys (bidasks);
        const result = [];
        for (let i = 0; i < prices.length; i++) {
            const priceString = this.safeString (prices, i);
            const price = this.safeNumber (prices, i);
            const volume = this.safeNumber (bidasks, priceString);
            result.push ([ price, volume ]);
        }
        return result;
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name tradeogre#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum number of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} params.lastId order id
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetHistoryMarket (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market: Market = undefined) {
        //
        //  {
        //      "date":1515128233,
        //      "type":"sell",
        //      "price":"0.02454320",
        //      "quantity":"0.17614230"
        //  }
        //
        const timestamp = this.safeIntegerProduct (trade, 'date', 1000);
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'type'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'quantity'),
            'cost': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
        }, market);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name tradeogre#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountBalances (params);
        const result = this.safeDict (response, 'balances', {});
        return this.parseBalance (result);
    }

    parseBalance (response) {
        //
        //    {
        //        "USDT": "12"
        //    }
        //
        const result = {
            'info': response,
        };
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const currencyId = keys[i];
            const balance = response[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'total': balance,
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name tradeogre#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type not used by tradeogre
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fullfilled, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'quantity': this.parseToNumeric (this.amountToPrecision (symbol, amount)),
            'price': this.parseToNumeric (this.priceToPrecision (symbol, price)),
        };
        if (type === 'market') {
            throw new BadRequest (this.id + ' createOrder does not support market orders');
        }
        let response = undefined;
        if (side === 'buy') {
            response = await this.privatePostOrderBuy (this.extend (request, params));
        } else {
            response = await this.privatePostOrderSell (this.extend (request, params));
        }
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name tradeogre#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'uuid': id,
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name tradeogre#cancelAllOrders
         * @description cancel all open orders
         * @param {string} symbol alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        return await this.cancelOrder ('all', symbol, params);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name tradeogre#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {};
        if (symbol !== undefined) {
            request['market'] = market['id'];
        }
        const response = await this.privatePostAccountOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://github.com/ace-exchange/ace-official-api-docs/blob/master/api_v2.md#open-api---order-status
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'uuid': id,
        };
        const response = await this.privateGetAccountOrderUuid (this.extend (request, params));
        return this.parseOrder (response, undefined);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        //
        // {
        //     "uuid": "a40ac710-8dc5-b5a8-aa69-389715197b14",
        //     "date": 1514876938,
        //     "type": "sell",
        //     "price": "0.02621960",
        //     "quantity": "1.55772526",
        //     "market": "XMR-BTC"
        // }
        //
        const timestamp = this.safeIntegerProduct (order, 'date', 1000);
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'uuid'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'type'),
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'amount': this.safeString (order, 'quantity'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeString (order, 'fulfilled'),
            'remaining': undefined,
            'status': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
            'trades': undefined,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'CCXT',
                'authorization': 'Basic ' + this.stringToBase64 (this.apiKey + ':' + this.secret),
            };
            if (method !== 'GET') {
                body = this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if (!('success' in response)) {
            return undefined;
        }
        //
        //  {"success":false,"error":"Must be authorized"}
        //
        const success = this.safeBool (response, 'success');
        if (success) {
            return undefined;
        }
        const successString = this.safeString (response, 'success');
        if (successString === 'true') {
            return undefined;
        }
        const error = this.safeValue (response, 'error');
        const errorCode = this.safeString (error, 'code');
        const feedback = this.id + ' ' + this.json (response);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        throw new ExchangeError (feedback);
    }
}
