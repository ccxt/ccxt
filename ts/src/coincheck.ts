
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coincheck.js';
import { BadSymbol, ExchangeError, AuthenticationError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class coincheck extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coincheck',
            'name': 'coincheck',
            'countries': [ 'JP', 'ID' ],
            'rateLimit': 1500,
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
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87182088-1d6d6380-c2ec-11ea-9c64-8ab9f9b289f5.jpg',
                'api': {
                    'rest': 'https://coincheck.com/api',
                },
                'www': 'https://coincheck.com',
                'doc': 'https://coincheck.com/documents/exchange/api',
                'fees': [
                    'https://coincheck.com/exchange/fee',
                    'https://coincheck.com/info/fee',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/orders/rate',
                        'order_books',
                        'rate/{pair}',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/balance',
                        'accounts/leverage_balance',
                        'bank_accounts',
                        'deposit_money',
                        'exchange/orders/opens',
                        'exchange/orders/transactions',
                        'exchange/orders/transactions_pagination',
                        'exchange/leverage/positions',
                        'lending/borrows/matches',
                        'send_money',
                        'withdraws',
                    ],
                    'post': [
                        'bank_accounts',
                        'deposit_money/{id}/fast',
                        'exchange/orders',
                        'exchange/transfers/to_leverage',
                        'exchange/transfers/from_leverage',
                        'lending/borrows',
                        'lending/borrows/{id}/repay',
                        'send_money',
                        'withdraws',
                    ],
                    'delete': [
                        'bank_accounts/{id}',
                        'exchange/orders/{id}',
                        'withdraws/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/JPY': { 'id': 'btc_jpy', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', 'baseId': 'btc', 'quoteId': 'jpy', 'type': 'spot', 'spot': true }, // the only real pair
                // 'ETH/JPY': { 'id': 'eth_jpy', 'symbol': 'ETH/JPY', 'base': 'ETH', 'quote': 'JPY', 'baseId': 'eth', 'quoteId': 'jpy' },
                'ETC/JPY': { 'id': 'etc_jpy', 'symbol': 'ETC/JPY', 'base': 'ETC', 'quote': 'JPY', 'baseId': 'etc', 'quoteId': 'jpy', 'type': 'spot', 'spot': true },
                // 'DAO/JPY': { 'id': 'dao_jpy', 'symbol': 'DAO/JPY', 'base': 'DAO', 'quote': 'JPY', 'baseId': 'dao', 'quoteId': 'jpy' },
                // 'LSK/JPY': { 'id': 'lsk_jpy', 'symbol': 'LSK/JPY', 'base': 'LSK', 'quote': 'JPY', 'baseId': 'lsk', 'quoteId': 'jpy' },
                'FCT/JPY': { 'id': 'fct_jpy', 'symbol': 'FCT/JPY', 'base': 'FCT', 'quote': 'JPY', 'baseId': 'fct', 'quoteId': 'jpy', 'type': 'spot', 'spot': true },
                'MONA/JPY': { 'id': 'mona_jpy', 'symbol': 'MONA/JPY', 'base': 'MONA', 'quote': 'JPY', 'baseId': 'mona', 'quoteId': 'jpy', 'type': 'spot', 'spot': true },
                // 'XMR/JPY': { 'id': 'xmr_jpy', 'symbol': 'XMR/JPY', 'base': 'XMR', 'quote': 'JPY', 'baseId': 'xmr', 'quoteId': 'jpy' },
                // 'REP/JPY': { 'id': 'rep_jpy', 'symbol': 'REP/JPY', 'base': 'REP', 'quote': 'JPY', 'baseId': 'rep', 'quoteId': 'jpy' },
                // 'XRP/JPY': { 'id': 'xrp_jpy', 'symbol': 'XRP/JPY', 'base': 'XRP', 'quote': 'JPY', 'baseId': 'xrp', 'quoteId': 'jpy' },
                // 'ZEC/JPY': { 'id': 'zec_jpy', 'symbol': 'ZEC/JPY', 'base': 'ZEC', 'quote': 'JPY', 'baseId': 'zec', 'quoteId': 'jpy' },
                // 'XEM/JPY': { 'id': 'xem_jpy', 'symbol': 'XEM/JPY', 'base': 'XEM', 'quote': 'JPY', 'baseId': 'xem', 'quoteId': 'jpy' },
                // 'LTC/JPY': { 'id': 'ltc_jpy', 'symbol': 'LTC/JPY', 'base': 'LTC', 'quote': 'JPY', 'baseId': 'ltc', 'quoteId': 'jpy' },
                // 'DASH/JPY': { 'id': 'dash_jpy', 'symbol': 'DASH/JPY', 'base': 'DASH', 'quote': 'JPY', 'baseId': 'dash', 'quoteId': 'jpy' },
                // 'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc' },
                'ETC/BTC': { 'id': 'etc_btc', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'baseId': 'etc', 'quoteId': 'btc', 'type': 'spot', 'spot': true },
                // 'LSK/BTC': { 'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC', 'baseId': 'lsk', 'quoteId': 'btc' },
                // 'FCT/BTC': { 'id': 'fct_btc', 'symbol': 'FCT/BTC', 'base': 'FCT', 'quote': 'BTC', 'baseId': 'fct', 'quoteId': 'btc' },
                // 'XMR/BTC': { 'id': 'xmr_btc', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC', 'baseId': 'xmr', 'quoteId': 'btc' },
                // 'REP/BTC': { 'id': 'rep_btc', 'symbol': 'REP/BTC', 'base': 'REP', 'quote': 'BTC', 'baseId': 'rep', 'quoteId': 'btc' },
                // 'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc' },
                // 'ZEC/BTC': { 'id': 'zec_btc', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC', 'baseId': 'zec', 'quoteId': 'btc' },
                // 'XEM/BTC': { 'id': 'xem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC', 'baseId': 'xem', 'quoteId': 'btc' },
                // 'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc' },
                // 'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'dash', 'quoteId': 'btc' },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0'),
                    'taker': this.parseNumber ('0'),
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'disabled API Key': AuthenticationError, // {"success":false,"error":"disabled API Key"}'
                    'invalid authentication': AuthenticationError, // {"success":false,"error":"invalid authentication"}
                },
                'broad': {},
            },
        });
    }

    parseBalance (response) {
        const result = { 'info': response };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            if (currencyId in response) {
                const account = this.account ();
                const reserved = currencyId + '_reserved';
                account['free'] = this.safeString (response, currencyId);
                account['used'] = this.safeString (response, reserved);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name coincheck#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountsBalance (params);
        return this.parseBalance (response);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coincheck#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        // Only BTC/JPY is meaningful
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetExchangeOrdersOpens (params);
        const rawOrders = this.safeValue (response, 'orders', []);
        const parsedOrders = this.parseOrders (rawOrders, market, since, limit);
        const result = [];
        for (let i = 0; i < parsedOrders.length; i++) {
            result.push (this.extend (parsedOrders[i], { 'status': 'open' }));
        }
        return result;
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOpenOrders
        //
        //     {                        id:  202835,
        //                      order_type: "buy",
        //                            rate:  26890,
        //                            pair: "btc_jpy",
        //                  pending_amount: "0.5527",
        //       pending_market_buy_amount:  null,
        //                  stop_loss_rate:  null,
        //                      created_at: "2015-01-10T05:55:38.000Z" }
        //
        // todo: add formats for fetchOrder, fetchClosedOrders here
        //
        const id = this.safeString (order, 'id');
        const side = this.safeString (order, 'order_type');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const amount = this.safeString (order, 'pending_amount');
        const remaining = this.safeString (order, 'pending_amount');
        const price = this.safeString (order, 'rate');
        const status = undefined;
        const marketId = this.safeString (order, 'pair');
        const symbol = this.safeSymbol (marketId, market, '_');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'side': side,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'status': status,
            'symbol': symbol,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coincheck#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetOrderBooks (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol']);
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "last":4192632.0,
        //     "bid":4192496.0,
        //     "ask":4193749.0,
        //     "high":4332000.0,
        //     "low":4101047.0,
        //     "volume":2313.43191762,
        //     "timestamp":1643374115
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
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
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name coincheck#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        if (symbol !== 'BTC/JPY') {
            throw new BadSymbol (this.id + ' fetchTicker() supports BTC/JPY only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const ticker = await this.publicGetTicker (this.extend (request, params));
        //
        // {
        //     "last":4192632.0,
        //     "bid":4192496.0,
        //     "ask":4193749.0,
        //     "high":4332000.0,
        //     "low":4101047.0,
        //     "volume":2313.43191762,
        //     "timestamp":1643374115
        // }
        //
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "id": "206849494",
        //          "amount": "0.01",
        //          "rate": "5598346.0",
        //          "pair": "btc_jpy",
        //          "order_type": "sell",
        //          "created_at": "2021-12-08T14:10:33.000Z"
        //      }
        //
        // fetchMyTrades (private) - example from docs
        //
        //      {
        //          "id": 38,
        //          "order_id": 49,
        //          "created_at": "2015-11-18T07:02:21.000Z",
        //          "funds": {
        //              "btc": "0.1",
        //              "jpy": "-4096.135"
        //                  },
        //           "pair": "btc_jpy",
        //           "rate": "40900.0",
        //           "fee_currency": "JPY",
        //           "fee": "6.135",
        //           "liquidity": "T",
        //           "side": "buy"
        //      }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const id = this.safeString (trade, 'id');
        const priceString = this.safeString (trade, 'rate');
        const marketId = this.safeString (trade, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const baseId = market['baseId'];
        const quoteId = market['quoteId'];
        const symbol = market['symbol'];
        let takerOrMaker = undefined;
        let amountString = undefined;
        let costString = undefined;
        let side = undefined;
        let fee = undefined;
        let orderId = undefined;
        if ('liquidity' in trade) {
            if (this.safeString (trade, 'liquidity') === 'T') {
                takerOrMaker = 'taker';
            } else if (this.safeString (trade, 'liquidity') === 'M') {
                takerOrMaker = 'maker';
            }
            const funds = this.safeValue (trade, 'funds', {});
            amountString = this.safeString (funds, baseId);
            costString = this.safeString (funds, quoteId);
            fee = {
                'currency': this.safeString (trade, 'fee_currency'),
                'cost': this.safeString (trade, 'fee'),
            };
            side = this.safeString (trade, 'side');
            orderId = this.safeString (trade, 'order_id');
        } else {
            amountString = this.safeString (trade, 'amount');
            side = this.safeString (trade, 'order_type');
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': orderId,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coincheck#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetExchangeOrdersTransactionsPagination (this.extend (request, params));
        //
        //      {
        //          "success": true,
        //          "data": [
        //                      {
        //                          "id": 38,
        //                          "order_id": 49,
        //                          "created_at": "2015-11-18T07:02:21.000Z",
        //                          "funds": {
        //                              "btc": "0.1",
        //                              "jpy": "-4096.135"
        //                                  },
        //                          "pair": "btc_jpy",
        //                          "rate": "40900.0",
        //                          "fee_currency": "JPY",
        //                          "fee": "6.135",
        //                          "liquidity": "T",
        //                          "side": "buy"
        //                       },
        //                  ]
        //      }
        //
        const transactions = this.safeValue (response, 'data', []);
        return this.parseTrades (transactions, market, since, limit);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coincheck#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //      {
        //          "id": "206849494",
        //          "amount": "0.01",
        //          "rate": "5598346.0",
        //          "pair": "btc_jpy",
        //          "order_type": "sell",
        //          "created_at": "2021-12-08T14:10:33.000Z"
        //      }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name coincheck#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        //
        //     {
        //         success: true,
        //         id: '7487995',
        //         email: 'some@email.com',
        //         identity_status: 'identity_pending',
        //         bitcoin_address: null,
        //         lending_leverage: '4',
        //         taker_fee: '0.0',
        //         maker_fee: '0.0',
        //         exchange_fees: {
        //           btc_jpy: { taker_fee: '0.0', maker_fee: '0.0' },
        //           etc_jpy: { taker_fee: '0.0', maker_fee: '0.0' },
        //           fct_jpy: { taker_fee: '0.0', maker_fee: '0.0' },
        //           mona_jpy: { taker_fee: '0.0', maker_fee: '0.0' },
        //           plt_jpy: { taker_fee: '0.0', maker_fee: '0.0' }
        //         }
        //     }
        //
        const fees = this.safeValue (response, 'exchange_fees', {});
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const fee = this.safeValue (fees, market['id'], {});
            result[symbol] = {
                'info': fee,
                'symbol': symbol,
                'maker': this.safeNumber (fee, 'maker_fee'),
                'taker': this.safeNumber (fee, 'taker_fee'),
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name coincheck#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (type === 'market') {
            const order_type = type + '_' + side;
            request['order_type'] = order_type;
            const prefix = (side === 'buy') ? (order_type + '_') : '';
            request[prefix + 'amount'] = amount;
        } else {
            request['order_type'] = side;
            request['rate'] = price;
            request['amount'] = amount;
        }
        const response = await this.privatePostExchangeOrders (this.extend (request, params));
        const id = this.safeString (response, 'id');
        return this.safeOrder ({
            'id': id,
            'info': response,
        }, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name coincheck#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by coincheck cancelOrder ()
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'id': id,
        };
        return await this.privateDeleteExchangeOrdersId (this.extend (request, params));
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coincheck#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetDepositMoney (this.extend (request, params));
        // {
        //   "success": true,
        //   "deposits": [
        //     {
        //       "id": 2,
        //       "amount": "0.05",
        //       "currency": "BTC",
        //       "address": "13PhzoK8me3u5nHzzFD85qT9RqEWR9M4Ty",
        //       "status": "confirmed",
        //       "confirmed_at": "2015-06-13T08:29:18.000Z",
        //       "created_at": "2015-06-13T08:22:18.000Z"
        //     },
        //     {
        //       "id": 1,
        //       "amount": "0.01",
        //       "currency": "BTC",
        //       "address": "13PhzoK8me3u5nHzzFD85qT9RqEWR9M4Ty",
        //       "status": "received",
        //       "confirmed_at": "2015-06-13T08:21:18.000Z",
        //       "created_at": "2015-06-13T08:21:18.000Z"
        //     }
        //   ]
        // }
        const data = this.safeValue (response, 'deposits', []);
        return this.parseTransactions (data, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coincheck#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the coincheck api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWithdraws (this.extend (request, params));
        //  {
        //   "success": true,
        //   "pagination": {
        //     "limit": 25,
        //     "order": "desc",
        //     "starting_after": null,
        //     "ending_before": null
        //   },
        //   "data": [
        //     {
        //       "id": 398,
        //       "status": "finished",
        //       "amount": "242742.0",
        //       "currency": "JPY",
        //       "created_at": "2014-12-04T15:00:00.000Z",
        //       "bank_account_id": 243,
        //       "fee": "400.0",
        //       "is_fast": true
        //     }
        //   ]
        // }
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, { 'type': 'withdrawal' });
    }

    parseTransactionStatus (status) {
        const statuses = {
            // withdrawals
            'pending': 'pending',
            'processing': 'pending',
            'finished': 'ok',
            'canceled': 'canceled',
            // deposits
            'confirmed': 'pending',
            'received': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        // {
        //       "id": 2,
        //       "amount": "0.05",
        //       "currency": "BTC",
        //       "address": "13PhzoK8me3u5nHzzFD85qT9RqEWR9M4Ty",
        //       "status": "confirmed",
        //       "confirmed_at": "2015-06-13T08:29:18.000Z",
        //       "created_at": "2015-06-13T08:22:18.000Z"
        //  }
        //
        // fetchWithdrawals
        //
        //  {
        //       "id": 398,
        //       "status": "finished",
        //       "amount": "242742.0",
        //       "currency": "JPY",
        //       "created_at": "2014-12-04T15:00:00.000Z",
        //       "bank_account_id": 243,
        //       "fee": "400.0",
        //       "is_fast": true
        //  }
        //
        const id = this.safeString (transaction, 'id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const address = this.safeString (transaction, 'address');
        const amount = this.safeNumber (transaction, 'amount');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const updated = this.parse8601 (this.safeString (transaction, 'confirmed_at'));
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': undefined,
            'fee': fee,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let queryString = '';
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (this.keysort (query));
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.urlencode (this.keysort (query));
                    queryString = body;
                }
            }
            const auth = nonce + url + queryString;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'ACCESS-KEY': this.apiKey,
                'ACCESS-NONCE': nonce,
                'ACCESS-SIGNATURE': this.hmac (this.encode (auth), this.encode (this.secret), sha256),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     {"success":false,"error":"disabled API Key"}'
        //     {"success":false,"error":"invalid authentication"}
        //
        const success = this.safeValue (response, 'success', true);
        if (!success) {
            const error = this.safeString (response, 'error');
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return undefined;
    }
}
