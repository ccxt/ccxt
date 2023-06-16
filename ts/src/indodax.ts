
//  ---------------------------------------------------------------------------

import Exchange from './abstract/indodax.js';
import { ExchangeError, ArgumentsRequired, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError, BadSymbol } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class indodax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'indodax',
            'name': 'INDODAX',
            'countries': [ 'ID' ], // Indonesia
            // 10 requests per second for making trades => 1000ms / 10 = 100ms
            // 180 requests per minute (public endpoints) = 2 requests per second => cost = (1000ms / rateLimit) / 2 = 5
            'rateLimit': 100,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
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
                'fetchClosedOrders': true,
                'fetchDeposit': false,
                'fetchDeposits': false,
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
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFee': true,
                'fetchTransactionFees': false,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'version': '2.0', // as of 9 April 2018
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg',
                'api': {
                    'public': 'https://indodax.com/api',
                    'private': 'https://indodax.com/tapi',
                },
                'www': 'https://www.indodax.com',
                'doc': 'https://github.com/btcid/indodax-official-api-docs',
                'referral': 'https://indodax.com/ref/testbitcoincoid/1',
            },
            'api': {
                'public': {
                    'get': {
                        'server_time': 5,
                        'pairs': 5,
                        'price_increments': 5,
                        'summaries': 5,
                        'ticker_all': 5,
                        '{pair}/ticker': 5,
                        '{pair}/trades': 5,
                        '{pair}/depth': 5,
                    },
                },
                'private': {
                    'post': {
                        'getInfo': 4,
                        'transHistory': 4,
                        'trade': 1,
                        'tradeHistory': 4, // TODO add fetchMyTrades
                        'openOrders': 4,
                        'orderHistory': 4,
                        'getOrder': 4,
                        'cancelOrder': 4,
                        'withdrawFee': 4,
                        'withdrawCoin': 4,
                        'listDownline': 4,
                        'checkDownline': 4,
                        'createVoucher': 4, // partner only
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.003,
                },
            },
            'exceptions': {
                'exact': {
                    'invalid_pair': BadSymbol, // {"error":"invalid_pair","error_description":"Invalid Pair"}
                    'Insufficient balance.': InsufficientFunds,
                    'invalid order.': OrderNotFound,
                    'Invalid credentials. API not found or session has expired.': AuthenticationError,
                    'Invalid credentials. Bad sign.': AuthenticationError,
                },
                'broad': {
                    'Minimum price': InvalidOrder,
                    'Minimum order': InvalidOrder,
                },
            },
            // exchange-specific options
            'options': {
                'recvWindow': 5 * 1000, // default 5 sec
                'timeDifference': 0, // the difference between system clock and exchange clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
            },
            'commonCurrencies': {
                'STR': 'XLM',
                'BCHABC': 'BCH',
                'BCHSV': 'BSV',
                'DRK': 'DASH',
                'NEM': 'XEM',
            },
            'precisionMode': TICK_SIZE,
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name indodax#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetServerTime (params);
        //
        //     {
        //         "timezone": "UTC",
        //         "server_time": 1571205969552
        //     }
        //
        return this.safeInteger (response, 'server_time');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name indodax#fetchMarkets
         * @description retrieves data on all markets for indodax
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetPairs (params);
        //
        //     [
        //         {
        //             "id": "btcidr",
        //             "symbol": "BTCIDR",
        //             "base_currency": "idr",
        //             "traded_currency": "btc",
        //             "traded_currency_unit": "BTC",
        //             "description": "BTC/IDR",
        //             "ticker_id": "btc_idr",
        //             "volume_precision": 0,
        //             "price_precision": 1000,
        //             "price_round": 8,
        //             "pricescale": 1000,
        //             "trade_min_base_currency": 10000,
        //             "trade_min_traded_currency": 0.00007457,
        //             "has_memo": false,
        //             "memo_name": false,
        //             "has_payment_id": false,
        //             "trade_fee_percent": 0.3,
        //             "url_logo": "https://indodax.com/v2/logo/svg/color/btc.svg",
        //             "url_logo_png": "https://indodax.com/v2/logo/png/color/btc.png",
        //             "is_maintenance": 0
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'ticker_id');
            const baseId = this.safeString (market, 'traded_currency');
            const quoteId = this.safeString (market, 'base_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const isMaintenance = this.safeInteger (market, 'is_maintenance');
            result.push ({
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
                'active': isMaintenance ? false : true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'trade_fee_percent'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'percentage': true,
                'precision': {
                    'amount': this.parseNumber ('1e-8'),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_round'))),
                    'cost': this.parseNumber (this.parsePrecision (this.safeString (market, 'volume_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'trade_min_traded_currency'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'trade_min_base_currency'),
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
        const free = this.safeValue (balances, 'balance', {});
        const used = this.safeValue (balances, 'balance_hold', {});
        const timestamp = this.safeTimestamp (balances, 'server_time');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (free, currencyId);
            account['used'] = this.safeString (used, currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name indodax#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo (params);
        //
        //     {
        //         "success":1,
        //         "return":{
        //             "server_time":1619562628,
        //             "balance":{
        //                 "idr":167,
        //                 "btc":"0.00000000",
        //                 "1inch":"0.00000000",
        //             },
        //             "balance_hold":{
        //                 "idr":0,
        //                 "btc":"0.00000000",
        //                 "1inch":"0.00000000",
        //             },
        //             "address":{
        //                 "btc":"1KMntgzvU7iTSgMBWc11nVuJjAyfW3qJyk",
        //                 "1inch":"0x1106c8bb3172625e1f411c221be49161dac19355",
        //                 "xrp":"rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //                 "zrx":"0x1106c8bb3172625e1f411c221be49161dac19355"
        //             },
        //             "user_id":"276011",
        //             "name":"",
        //             "email":"testbitcoincoid@mailforspam.com",
        //             "profile_picture":null,
        //             "verification_status":"unverified",
        //             "gauth_enable":true
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const orderbook = await this.publicGetPairDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'buy', 'sell');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "high":"0.01951",
        //         "low":"0.01877",
        //         "vol_eth":"39.38839319",
        //         "vol_btc":"0.75320886",
        //         "last":"0.01896",
        //         "buy":"0.01896",
        //         "sell":"0.019",
        //         "server_time":1565248908
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'server_time');
        const baseVolume = 'vol_' + market['baseId'].toLowerCase ();
        const quoteVolume = 'vol_' + market['quoteId'].toLowerCase ();
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, baseVolume),
            'quoteVolume': this.safeString (ticker, quoteVolume),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name indodax#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairTicker (this.extend (request, params));
        //
        //     {
        //         "ticker": {
        //             "high":"0.01951",
        //             "low":"0.01877",
        //             "vol_eth":"39.38839319",
        //             "vol_btc":"0.75320886",
        //             "last":"0.01896",
        //             "buy":"0.01896",
        //             "sell":"0.019",
        //             "server_time":1565248908
        //         }
        //     }
        //
        const ticker = this.safeValue (response, 'ticker', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker-all
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        //
        // {
        //     "tickers": {
        //         "btc_idr": {
        //             "high": "120009000",
        //             "low": "116735000",
        //             "vol_btc": "218.13777777",
        //             "vol_idr": "25800033297",
        //             "last": "117088000",
        //             "buy": "117002000",
        //             "sell": "117078000",
        //             "server_time": 1571207881
        //         }
        //     }
        // }
        //
        const response = await this.publicGetTickerAll (params);
        const tickers = this.safeValue (response, 'tickers');
        return this.parseTickers (tickers, symbols);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        return this.safeTrade ({
            'id': this.safeString (trade, 'tid'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': undefined,
            'side': this.safeString (trade, 'type'),
            'order': undefined,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "order_id": "12345",
        //         "submit_time": "1392228122",
        //         "price": "8000000",
        //         "type": "sell",
        //         "order_ltc": "100000000",
        //         "remain_ltc": "100000000"
        //     }
        //
        // market closed orders - note that the price is very high
        // and does not reflect actual price the order executed at
        //
        //     {
        //       "order_id": "49326856",
        //       "type": "sell",
        //       "price": "1000000000",
        //       "submit_time": "1618314671",
        //       "finish_time": "1618314671",
        //       "status": "filled",
        //       "order_xrp": "30.45000000",
        //       "remain_xrp": "0.00000000"
        //     }
        let side = undefined;
        if ('type' in order) {
            side = order['type'];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status', 'open'));
        let symbol = undefined;
        let cost = undefined;
        const price = this.safeString (order, 'price');
        let amount = undefined;
        let remaining = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            let quoteId = market['quoteId'];
            let baseId = market['baseId'];
            if ((market['quoteId'] === 'idr') && ('order_rp' in order)) {
                quoteId = 'rp';
            }
            if ((market['baseId'] === 'idr') && ('remain_rp' in order)) {
                baseId = 'rp';
            }
            cost = this.safeString (order, 'order_' + quoteId);
            if (!cost) {
                amount = this.safeString (order, 'order_' + baseId);
                remaining = this.safeString (order, 'remain_' + baseId);
            }
        }
        const timestamp = this.safeInteger (order, 'submit_time');
        const fee = undefined;
        const id = this.safeString (order, 'order_id');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostGetOrder (this.extend (request, params));
        const orders = response['return'];
        const order = this.parseOrder (this.extend ({ 'id': id }, orders['order']), market);
        return this.extend ({ 'info': response }, order);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privatePostOpenOrders (this.extend (request, params));
        const rawOrders = response['return']['orders'];
        // { success: 1, return: { orders: null }} if no orders
        if (!rawOrders) {
            return [];
        }
        // { success: 1, return: { orders: [ ... objects ] }} for orders fetched by symbol
        if (symbol !== undefined) {
            return this.parseOrders (rawOrders, market, since, limit);
        }
        // { success: 1, return: { orders: { marketid: [ ... objects ] }}} if all orders are fetched
        const marketIds = Object.keys (rawOrders);
        let exchangeOrders = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketOrders = rawOrders[marketId];
            market = this.safeMarket (marketId);
            const parsedOrders = this.parseOrders (marketOrders, market, since, limit);
            exchangeOrders = this.arrayConcat (exchangeOrders, parsedOrders);
        }
        return exchangeOrders;
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            request['pair'] = market['id'];
        }
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        let orders = this.parseOrders (response['return']['orders'], market);
        orders = this.filterBy (orders, 'status', 'closed');
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit) as any;
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name indodax#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' createOrder() allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'price': price,
        };
        const currency = market['baseId'];
        if (side === 'buy') {
            request[market['quoteId']] = amount * price;
        } else {
            request[market['baseId']] = amount;
        }
        request[currency] = amount;
        const result = await this.privatePostTrade (this.extend (request, params));
        const data = this.safeValue (result, 'return', {});
        const id = this.safeString (data, 'order_id');
        return this.safeOrder ({
            'info': result,
            'id': id,
        }, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name indodax#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        const side = this.safeValue (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an extra "side" param');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'pair': market['id'],
            'type': side,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchTransactionFee (code: string, params = {}) {
        /**
         * @method
         * @name indodax#fetchTransactionFee
         * @description fetch the fee for a transaction
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostWithdrawFee (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": {
        //             "server_time": 1607923272,
        //             "withdraw_fee": 0.005,
        //             "currency": "eth"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'return', {});
        const currencyId = this.safeString (data, 'currency');
        return {
            'info': response,
            'rate': this.safeNumber (data, 'withdraw_fee'),
            'currency': this.safeCurrencyCode (currencyId, currency),
        };
    }

    async fetchTransactions (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            const startTime = this.iso8601 (since).slice (0, 10);
            request['start'] = startTime;
            request['end'] = this.iso8601 (this.milliseconds ()).slice (0, 10);
        }
        const response = await this.privatePostTransHistory (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": {
        //             "withdraw": {
        //                 "idr": [
        //                     {
        //                         "status": "success",
        //                         "type": "coupon",
        //                         "rp": "115205",
        //                         "fee": "500",
        //                         "amount": "114705",
        //                         "submit_time": "1539844166",
        //                         "success_time": "1539844189",
        //                         "withdraw_id": "1783717",
        //                         "tx": "BTC-IDR-RDTVVO2P-ETD0EVAW-VTNZGMIR-HTNTUAPI-84ULM9OI",
        //                         "sender": "boris",
        //                         "used_by": "viginia88"
        //                     },
        //                     ...
        //                 ],
        //                 "btc": [],
        //                 "abyss": [],
        //                 ...
        //             },
        //             "deposit": {
        //                 "idr": [
        //                     {
        //                         "status": "success",
        //                         "type": "duitku",
        //                         "rp": "393000",
        //                         "fee": "5895",
        //                         "amount": "387105",
        //                         "submit_time": "1576555012",
        //                         "success_time": "1576555012",
        //                         "deposit_id": "3395438",
        //                         "tx": "Duitku OVO Settlement"
        //                     },
        //                     ...
        //                 ],
        //                 "btc": [
        //                     {
        //                         "status": "success",
        //                         "btc": "0.00118769",
        //                         "amount": "0.00118769",
        //                         "success_time": "1539529208",
        //                         "deposit_id": "3602369",
        //                         "tx": "c816aeb35a5b42f389970325a32aff69bb6b2126784dcda8f23b9dd9570d6573"
        //                     },
        //                     ...
        //                 ],
        //                 "abyss": [],
        //                 ...
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'return', {});
        const withdraw = this.safeValue (data, 'withdraw', {});
        const deposit = this.safeValue (data, 'deposit', {});
        let transactions = [];
        let currency = undefined;
        if (code === undefined) {
            let keys = Object.keys (withdraw);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                transactions = this.arrayConcat (transactions, withdraw[key]);
            }
            keys = Object.keys (deposit);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                transactions = this.arrayConcat (transactions, deposit[key]);
            }
        } else {
            currency = this.currency (code);
            const withdraws = this.safeValue (withdraw, currency['id'], []);
            const deposits = this.safeValue (deposit, currency['id'], []);
            transactions = this.arrayConcat (withdraws, deposits);
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name indodax#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the indodax api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        // Custom string you need to provide to identify each withdrawal.
        // Will be passed to callback URL (assigned via website to the API key)
        // so your system can identify the request and confirm it.
        // Alphanumeric, max length 255.
        const requestId = this.milliseconds ();
        // Alternatively:
        // let requestId = this.uuid ();
        const request = {
            'currency': currency['id'],
            'withdraw_amount': amount,
            'withdraw_address': address,
            'request_id': requestId.toString (),
        };
        if (tag) {
            request['withdraw_memo'] = tag;
        }
        const response = await this.privatePostWithdrawCoin (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        // transHistory
        //
        //     {
        //         "status": "success",
        //         "type": "coupon",
        //         "rp": "115205",
        //         "fee": "500",
        //         "amount": "114705",
        //         "submit_time": "1539844166",
        //         "success_time": "1539844189",
        //         "withdraw_id": "1783717",
        //         "tx": "BTC-IDR-RDTVVO2P-ETD0EVAW-VTNZGMIR-HTNTUAPI-84ULM9OI",
        //         "sender": "boris",
        //         "used_by": "viginia88"
        //     }
        //
        //     {
        //         "status": "success",
        //         "btc": "0.00118769",
        //         "amount": "0.00118769",
        //         "success_time": "1539529208",
        //         "deposit_id": "3602369",
        //         "tx": "c816aeb35a5b42f389970325a32aff69bb6b2126784dcda8f23b9dd9570d6573"
        //     },
        const status = this.safeString (transaction, 'status');
        const timestamp = this.safeTimestamp2 (transaction, 'success_time', 'submit_time');
        const depositId = this.safeString (transaction, 'deposit_id');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': this.safeCurrencyCode (undefined, currency),
                'cost': feeCost,
                'rate': undefined,
            };
        }
        return {
            'id': this.safeString2 (transaction, 'withdraw_id', 'deposit_id'),
            'txid': this.safeString2 (transaction, 'txid', 'tx'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': this.safeString (transaction, 'withdraw_address'),
            'addressTo': undefined,
            'amount': this.safeNumberN (transaction, [ 'amount', 'withdraw_amount', 'deposit_amount' ]),
            'type': (depositId === undefined) ? 'withdraw' : 'deposit',
            'currency': this.safeCurrencyCode (undefined, currency),
            'status': this.parseTransactionStatus (status),
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': this.safeString (transaction, 'withdraw_memo'),
            'fee': fee,
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'timestamp': this.nonce (),
                'recvWindow': this.options['recvWindow'],
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), sha512),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        // { success: 0, error: "invalid order." }
        // or
        // [{ data, ... }, { ... }, ... ]
        if (Array.isArray (response)) {
            return undefined; // public endpoints may return []-arrays
        }
        const error = this.safeValue (response, 'error', '');
        if (!('success' in response) && error === '') {
            return undefined; // no 'success' property on public responses
        }
        if (this.safeInteger (response, 'success', 0) === 1) {
            // { success: 1, return: { orders: [] }}
            if (!('return' in response)) {
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            } else {
                return undefined;
            }
        }
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
}
