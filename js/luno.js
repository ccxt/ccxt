'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class luno extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'luno',
            'name': 'luno',
            'countries': [ 'GB', 'SG', 'ZA' ],
            // 300 calls per minute = 5 calls per second = 1000ms / 5 = 200ms between requests
            'rateLimit': 200,
            'version': '1',
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': false, // overload of base fetchOHLCV, as it doesn't work in this exchange
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'urls': {
                'referral': 'https://www.luno.com/invite/44893A',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
                'api': {
                    'public': 'https://api.luno.com/api',
                    'private': 'https://api.luno.com/api',
                    'exchange': 'https://api.luno.com/api/exchange',
                },
                'www': 'https://www.luno.com',
                'doc': [
                    'https://www.luno.com/en/api',
                    'https://npmjs.org/package/bitx',
                    'https://github.com/bausmeier/node-bitx',
                ],
            },
            'api': {
                'exchange': {
                    'get': {
                        'markets': 1,
                    },
                },
                'public': {
                    'get': {
                        'orderbook': 1,
                        'orderbook_top': 1,
                        'ticker': 1,
                        'tickers': 1,
                        'trades': 1,
                    },
                },
                'private': {
                    'get': {
                        'accounts/{id}/pending': 1,
                        'accounts/{id}/transactions': 1,
                        'balance': 1,
                        'beneficiaries': 1,
                        'fee_info': 1,
                        'funding_address': 1,
                        'listorders': 1,
                        'listtrades': 1,
                        'orders/{id}': 1,
                        'quotes/{id}': 1,
                        'withdrawals': 1,
                        'withdrawals/{id}': 1,
                        'transfers': 1,
                        // GET /api/exchange/2/listorders
                        // GET /api/exchange/2/orders/{id}
                        // GET /api/exchange/3/order
                    },
                    'post': {
                        'accounts': 1,
                        'accounts/{id}/name': 1,
                        'postorder': 1,
                        'marketorder': 1,
                        'stoporder': 1,
                        'funding_address': 1,
                        'withdrawals': 1,
                        'send': 1,
                        'quotes': 1,
                        'oauth2/grant': 1,
                    },
                    'put': {
                        'accounts/{id}/name': 1,
                        'quotes/{id}': 1,
                    },
                    'delete': {
                        'quotes/{id}': 1,
                        'withdrawals/{id}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true, // based on volume from your primary currency (not the same for everyone)
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0'),
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name luno#fetchMarkets
         * @description retrieves data on all markets for luno
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.exchangeGetMarkets (params);
        //
        //     {
        //         "markets":[
        //             {
        //                 "market_id":"BCHXBT",
        //                 "trading_status":"ACTIVE",
        //                 "base_currency":"BCH",
        //                 "counter_currency":"XBT",
        //                 "min_volume":"0.01",
        //                 "max_volume":"100.00",
        //                 "volume_scale":2,
        //                 "min_price":"0.0001",
        //                 "max_price":"1.00",
        //                 "price_scale":6,
        //                 "fee_scale":8,
        //             },
        //         ]
        //     }
        //
        const result = [];
        const markets = this.safeValue (response, 'markets', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'market_id');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'counter_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'trading_status');
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
                'active': (status === 'ACTIVE'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'volume_scale'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_scale'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_volume'),
                        'max': this.safeNumber (market, 'max_volume'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
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

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name luno#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/en/latest/manual.html#account-structure} indexed by the account type
         */
        const response = await this.privateGetBalance (params);
        const wallets = this.safeValue (response, 'balance', []);
        const result = [];
        for (let i = 0; i < wallets.length; i++) {
            const account = wallets[i];
            const accountId = this.safeString (account, 'account_id');
            const currencyId = this.safeString (account, 'asset');
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

    parseBalance (response) {
        const wallets = this.safeValue (response, 'balance', []);
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const currencyId = this.safeString (wallet, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const reserved = this.safeString (wallet, 'reserved');
            const unconfirmed = this.safeString (wallet, 'unconfirmed');
            const balance = this.safeString (wallet, 'balance');
            const reservedUnconfirmed = Precise.stringAdd (reserved, unconfirmed);
            const balanceUnconfirmed = Precise.stringAdd (balance, unconfirmed);
            if (code in result) {
                result[code]['used'] = Precise.stringAdd (result[code]['used'], reservedUnconfirmed);
                result[code]['total'] = Precise.stringAdd (result[code]['total'], balanceUnconfirmed);
            } else {
                const account = this.account ();
                account['used'] = reservedUnconfirmed;
                account['total'] = balanceUnconfirmed;
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name luno#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        //
        //     {
        //         'balance': [
        //             {'account_id': '119...1336','asset': 'XBT','balance': '0.00','reserved': '0.00','unconfirmed': '0.00'},
        //             {'account_id': '66...289','asset': 'XBT','balance': '0.00','reserved': '0.00','unconfirmed': '0.00'},
        //             {'account_id': '718...5300','asset': 'ETH','balance': '0.00','reserved': '0.00','unconfirmed': '0.00'},
        //             {'account_id': '818...7072','asset': 'ZAR','balance': '0.001417','reserved': '0.00','unconfirmed': '0.00'}]}
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        let method = 'publicGetOrderbook';
        if (limit !== undefined) {
            if (limit <= 100) {
                method += 'Top'; // get just the top of the orderbook when limit is low
            }
        }
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 'price', 'volume');
    }

    parseOrderStatus (status) {
        const statuses = {
            // todo add other statuses
            'PENDING': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "base": "string",
        //         "completed_timestamp": "string",
        //         "counter": "string",
        //         "creation_timestamp": "string",
        //         "expiration_timestamp": "string",
        //         "fee_base": "string",
        //         "fee_counter": "string",
        //         "limit_price": "string",
        //         "limit_volume": "string",
        //         "order_id": "string",
        //         "pair": "string",
        //         "state": "PENDING",
        //         "type": "BID"
        //     }
        //
        const timestamp = this.safeInteger (order, 'creation_timestamp');
        let status = this.parseOrderStatus (this.safeString (order, 'state'));
        status = (status === 'open') ? status : status;
        let side = undefined;
        const orderType = this.safeString (order, 'type');
        if ((orderType === 'ASK') || (orderType === 'SELL')) {
            side = 'sell';
        } else if ((orderType === 'BID') || (orderType === 'BUY')) {
            side = 'buy';
        }
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market);
        const price = this.safeString (order, 'limit_price');
        const amount = this.safeString (order, 'limit_volume');
        const quoteFee = this.safeNumber (order, 'fee_counter');
        const baseFee = this.safeNumber (order, 'fee_base');
        const filled = this.safeString (order, 'base');
        const cost = this.safeString (order, 'counter');
        let fee = undefined;
        if (quoteFee !== undefined) {
            fee = {
                'cost': quoteFee,
                'currency': market['quote'],
            };
        } else if (baseFee !== undefined) {
            fee = {
                'cost': baseFee,
                'currency': market['base'],
            };
        }
        const id = this.safeString (order, 'order_id');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': filled,
            'cost': cost,
            'remaining': undefined,
            'trades': undefined,
            'fee': fee,
            'info': order,
            'average': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by luno fetchOrder
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrdersByState (state = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (state !== undefined) {
            request['state'] = state;
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privateGetListorders (this.extend (request, params));
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByState (undefined, symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByState ('PENDING', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByState ('COMPLETE', symbol, since, limit, params);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "pair":"XBTAUD",
        //     "timestamp":1642201439301,
        //     "bid":"59972.30000000",
        //     "ask":"59997.99000000",
        //     "last_trade":"59997.99000000",
        //     "rolling_24_hour_volume":"1.89510000",
        //     "status":"ACTIVE"
        // }
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'last_trade');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'rolling_24_hour_volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetTickers (params);
        const tickers = this.indexBy (response['tickers'], 'pair');
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name luno#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        // {
        //     "pair":"XBTAUD",
        //     "timestamp":1642201439301,
        //     "bid":"59972.30000000",
        //     "ask":"59997.99000000",
        //     "last_trade":"59997.99000000",
        //     "rolling_24_hour_volume":"1.89510000",
        //     "status":"ACTIVE"
        // }
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "sequence":276989,
        //          "timestamp":1648651276949,
        //          "price":"35773.20000000",
        //          "volume":"0.00300000",
        //          "is_buy":false
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //          "pair":"LTCXBT",
        //          "sequence":3256813,
        //          "order_id":"BXEX6XHHDT5EGW2",
        //          "type":"ASK",
        //          "timestamp":1648652135235,
        //          "price":"0.002786",
        //          "volume":"0.10",
        //          "base":"0.10",
        //          "counter":"0.0002786",
        //          "fee_base":"0.0001",
        //          "fee_counter":"0.00",
        //          "is_buy":false,
        //          "client_order_id":""
        //      }
        //
        // For public trade data (is_buy === True) indicates 'buy' side but for private trade data
        // is_buy indicates maker or taker. The value of "type" (ASK/BID) indicate sell/buy side.
        // Private trade data includes ID field which public trade data does not.
        const orderId = this.safeString (trade, 'order_id');
        const id = this.safeString (trade, 'sequence');
        let takerOrMaker = undefined;
        let side = undefined;
        if (orderId !== undefined) {
            const type = this.safeString (trade, 'type');
            if ((type === 'ASK') || (type === 'SELL')) {
                side = 'sell';
            } else if ((type === 'BID') || (type === 'BUY')) {
                side = 'buy';
            }
            if (side === 'sell' && trade['is_buy']) {
                takerOrMaker = 'maker';
            } else if (side === 'buy' && !trade['is_buy']) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        } else {
            side = trade['is_buy'] ? 'buy' : 'sell';
        }
        const feeBaseString = this.safeString (trade, 'fee_base');
        const feeCounterString = this.safeString (trade, 'fee_counter');
        let feeCurrency = undefined;
        let feeCost = undefined;
        if (feeBaseString !== undefined) {
            if (!Precise.stringEquals (feeBaseString, '0.0')) {
                feeCurrency = market['base'];
                feeCost = feeBaseString;
            }
        } else if (feeCounterString !== undefined) {
            if (!Precise.stringEquals (feeCounterString, '0.0')) {
                feeCurrency = market['quote'];
                feeCost = feeCounterString;
            }
        }
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString2 (trade, 'volume', 'base'),
            // Does not include potential fee costs
            'cost': this.safeString (trade, 'counter'),
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
            },
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //      {
        //          "trades":[
        //              {
        //                  "sequence":276989,
        //                  "timestamp":1648651276949,
        //                  "price":"35773.20000000",
        //                  "volume":"0.00300000",
        //                  "is_buy":false
        //              },...
        //          ]
        //      }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetListtrades (this.extend (request, params));
        //
        //      {
        //          "trades":[
        //              {
        //                  "pair":"LTCXBT",
        //                  "sequence":3256813,
        //                  "order_id":"BXEX6XHHDT5EGW2",
        //                  "type":"ASK",
        //                  "timestamp":1648652135235,
        //                  "price":"0.002786",
        //                  "volume":"0.10",
        //                  "base":"0.10",
        //                  "counter":"0.0002786",
        //                  "fee_base":"0.0001",
        //                  "fee_counter":"0.00",
        //                  "is_buy":false,
        //                  "client_order_id":""
        //              },...
        //          ]
        //      }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name luno#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetFeeInfo (this.extend (request, params));
        //
        //     {
        //          "maker_fee": "0.00250000",
        //          "taker_fee": "0.00500000",
        //          "thirty_day_volume": "0"
        //     }
        //
        return {
            'info': response,
            'symbol': symbol,
            'maker': this.safeNumber (response, 'maker_fee'),
            'taker': this.safeNumber (response, 'taker_fee'),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name luno#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let method = 'privatePost';
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (type === 'market') {
            method += 'Marketorder';
            request['type'] = side.toUpperCase ();
            // todo add createMarketBuyOrderRequires price logic as it is implemented in the other exchanges
            if (side === 'buy') {
                request['counter_volume'] = this.amountToPrecision (market['symbol'], amount);
            } else {
                request['base_volume'] = this.amountToPrecision (market['symbol'], amount);
            }
        } else {
            method += 'Postorder';
            request['volume'] = this.amountToPrecision (market['symbol'], amount);
            request['price'] = this.priceToPrecision (market['symbol'], price);
            request['type'] = (side === 'buy') ? 'BID' : 'ASK';
        }
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name luno#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        return await this.privatePostStoporder (this.extend (request, params));
    }

    async fetchLedgerByEntries (code = undefined, entry = -1, limit = 1, params = {}) {
        // by default without entry number or limit number, return most recent entry
        const since = undefined;
        const request = {
            'min_row': entry,
            'max_row': this.sum (entry, limit),
        };
        return await this.fetchLedger (code, since, limit, this.extend (request, params));
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name luno#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the luno api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let currency = undefined;
        let id = this.safeString (params, 'id'); // account id
        let min_row = this.safeValue (params, 'min_row');
        let max_row = this.safeValue (params, 'max_row');
        if (id === undefined) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchLedger() requires a currency code argument if no account id specified in params');
            }
            currency = this.currency (code);
            const accountsByCurrencyCode = this.indexBy (this.accounts, 'currency');
            const account = this.safeValue (accountsByCurrencyCode, code);
            if (account === undefined) {
                throw new ExchangeError (this.id + ' fetchLedger() could not find account id for ' + code);
            }
            id = account['id'];
        }
        if (min_row === undefined && max_row === undefined) {
            max_row = 0; // Default to most recent transactions
            min_row = -1000; // Maximum number of records supported
        } else if (min_row === undefined || max_row === undefined) {
            throw new ExchangeError (this.id + " fetchLedger() require both params 'max_row' and 'min_row' or neither to be defined");
        }
        if (limit !== undefined && max_row - min_row > limit) {
            if (max_row <= 0) {
                min_row = max_row - limit;
            } else if (min_row > 0) {
                max_row = min_row + limit;
            }
        }
        if (max_row - min_row > 1000) {
            throw new ExchangeError (this.id + " fetchLedger() requires the params 'max_row' - 'min_row' <= 1000");
        }
        const request = {
            'id': id,
            'min_row': min_row,
            'max_row': max_row,
        };
        const response = await this.privateGetAccountsIdTransactions (this.extend (params, request));
        const entries = this.safeValue (response, 'transactions', []);
        return this.parseLedger (entries, currency, since, limit);
    }

    parseLedgerComment (comment) {
        const words = comment.split (' ');
        const types = {
            'Withdrawal': 'fee',
            'Trading': 'fee',
            'Payment': 'transaction',
            'Sent': 'transaction',
            'Deposit': 'transaction',
            'Received': 'transaction',
            'Released': 'released',
            'Reserved': 'reserved',
            'Sold': 'trade',
            'Bought': 'trade',
            'Failure': 'failed',
        };
        let referenceId = undefined;
        const firstWord = this.safeString (words, 0);
        const thirdWord = this.safeString (words, 2);
        const fourthWord = this.safeString (words, 3);
        let type = this.safeString (types, firstWord, undefined);
        if ((type === undefined) && (thirdWord === 'fee')) {
            type = 'fee';
        }
        if ((type === 'reserved') && (fourthWord === 'order')) {
            referenceId = this.safeString (words, 4);
        }
        return {
            'type': type,
            'referenceId': referenceId,
        };
    }

    parseLedgerEntry (entry, currency = undefined) {
        // const details = this.safeValue (entry, 'details', {});
        const id = this.safeString (entry, 'row_index');
        const account_id = this.safeString (entry, 'account_id');
        const timestamp = this.safeValue (entry, 'timestamp');
        const currencyId = this.safeString (entry, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const available_delta = this.safeString (entry, 'available_delta');
        const balance_delta = this.safeString (entry, 'balance_delta');
        const after = this.safeString (entry, 'balance');
        const comment = this.safeString (entry, 'description');
        let before = after;
        let amount = '0.0';
        const result = this.parseLedgerComment (comment);
        const type = result['type'];
        const referenceId = result['referenceId'];
        let direction = undefined;
        let status = undefined;
        if (!Precise.stringEquals (balance_delta, '0.0')) {
            before = Precise.stringSub (after, balance_delta);
            status = 'ok';
            amount = Precise.stringAbs (balance_delta);
        } else if (Precise.stringLt (available_delta, '0.0')) {
            status = 'pending';
            amount = Precise.stringAbs (available_delta);
        } else if (Precise.stringGt (available_delta, '0.0')) {
            status = 'canceled';
            amount = Precise.stringAbs (available_delta);
        }
        if (Precise.stringGt (balance_delta, '0') || Precise.stringGt (available_delta, '0')) {
            direction = 'in';
        } else if (Precise.stringLt (balance_delta, '0') || Precise.stringLt (available_delta, '0')) {
            direction = 'out';
        }
        return {
            'id': id,
            'direction': direction,
            'account': account_id,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': this.parseNumber (amount),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': before,
            'after': after,
            'status': status,
            'fee': undefined,
            'info': entry,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const auth = this.stringToBase64 (this.apiKey + ':' + this.secret);
            headers = {
                'Authorization': 'Basic ' + this.decode (auth),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
    }
};
