
//  ---------------------------------------------------------------------------

import Exchange from './abstract/btcalpha.js';
import { ExchangeError, AuthenticationError, DDoSProtection, InvalidOrder, InsufficientFunds } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class btcalpha extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcalpha',
            'name': 'BTC-Alpha',
            'countries': [ 'US' ],
            'version': 'v1',
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
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': true,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
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
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': 'D',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg',
                'api': {
                    'rest': 'https://btc-alpha.com/api',
                },
                'www': 'https://btc-alpha.com',
                'doc': 'https://btc-alpha.github.io/api-docs',
                'fees': 'https://btc-alpha.com/fees/',
                'referral': 'https://btc-alpha.com/?r=123788',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies/',
                        'pairs/',
                        'orderbook/{pair_name}',
                        'exchanges/',
                        'charts/{pair}/{type}/chart/',
                        'ticker/',
                    ],
                },
                'private': {
                    'get': [
                        'wallets/',
                        'orders/own/',
                        'order/{id}/',
                        'exchanges/own/',
                        'deposits/',
                        'withdraws/',
                    ],
                    'post': [
                        'order/',
                        'order-cancel/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'CBC': 'Cashbery',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {},
                'broad': {
                    'Out of balance': InsufficientFunds, // {"date":1570599531.4814300537,"error":"Out of balance -9.99243661 BTC"}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name btcalpha#fetchMarkets
         * @description retrieves data on all markets for btcalpha
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetPairs (params);
        //
        //    [
        //        {
        //            "name": "1INCH_USDT",
        //            "currency1": "1INCH",
        //            "currency2": "USDT",
        //            "price_precision": 4,
        //            "amount_precision": 2,
        //            "minimum_order_size": "0.01000000",
        //            "maximum_order_size": "900000.00000000",
        //            "minimum_order_value": "10.00000000",
        //            "liquidity_type": 10
        //        },
        //    ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'currency1');
            const quoteId = this.safeString (market, 'currency2');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const pricePrecision = this.safeString (market, 'price_precision');
            const priceLimit = this.parsePrecision (pricePrecision);
            const amountLimit = this.safeString (market, 'minimum_order_size');
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
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'amount_precision'))),
                    'price': this.parseNumber (this.parsePrecision ((pricePrecision))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.parseNumber (amountLimit),
                        'max': this.safeNumber (market, 'maximum_order_size'),
                    },
                    'price': {
                        'min': this.parseNumber (priceLimit),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber (Precise.stringMul (priceLimit, amountLimit)),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchTickers
         * @see https://btc-alpha.github.io/api-docs/#tickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //
        //    [
        //        {
        //            timestamp: '1674658.445272',
        //            pair: 'BTC_USDT',
        //            last: '22476.85',
        //            diff: '458.96',
        //            vol: '6660.847784',
        //            high: '23106.08',
        //            low: '22348.29',
        //            buy: '22508.46',
        //            sell: '22521.11'
        //        },
        //        ...
        //    ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchTicker
         * @see https://btc-alpha.github.io/api-docs/#tickers
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //    {
        //        timestamp: '1674658.445272',
        //        pair: 'BTC_USDT',
        //        last: '22476.85',
        //        diff: '458.96',
        //        vol: '6660.847784',
        //        high: '23106.08',
        //        low: '22348.29',
        //        buy: '22508.46',
        //        sell: '22521.11'
        //    }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //    {
        //        timestamp: '1674658.445272',
        //        pair: 'BTC_USDT',
        //        last: '22476.85',
        //        diff: '458.96',
        //        vol: '6660.847784',
        //        high: '23106.08',
        //        low: '22348.29',
        //        buy: '22508.46',
        //        sell: '22521.11'
        //    }
        //
        const timestamp = this.safeIntegerProduct (ticker, 'timestamp', 1000000);
        const marketId = this.safeString (ticker, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'info': ticker,
            'symbol': market['symbol'],
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
            'change': this.safeString (ticker, 'diff'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'vol'),
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair_name': market['id'],
        };
        if (limit) {
            request['limit_sell'] = limit;
            request['limit_buy'] = limit;
        }
        const response = await this.publicGetOrderbookPairName (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol'], undefined, 'buy', 'sell', 'price', 'amount');
    }

    parseBidsAsks (bidasks, priceKey = 0, amountKey = 1) {
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            const bidask = bidasks[i];
            if (bidask) {
                result.push (this.parseBidAsk (bidask, priceKey, amountKey));
            }
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "id": "202203440",
        //          "timestamp": "1637856276.264215",
        //          "pair": "AAVE_USDT",
        //          "price": "320.79900000",
        //          "amount": "0.05000000",
        //          "type": "buy"
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //          "id": "202203440",
        //          "timestamp": "1637856276.264215",
        //          "pair": "AAVE_USDT",
        //          "price": "320.79900000",
        //          "amount": "0.05000000",
        //          "type": "buy",
        //          "my_side": "buy"
        //      }
        //
        const marketId = this.safeString (trade, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const timestampRaw = this.safeString (trade, 'timestamp');
        const timestamp = this.parseToInt (Precise.stringMul (timestampRaw, '1000000'));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const id = this.safeString (trade, 'id');
        const side = this.safeString2 (trade, 'my_side', 'type');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': id,
            'type': 'limit',
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
         * @name btcalpha#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const trades = await this.publicGetExchanges (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetDeposits (params);
        //
        //     [
        //         {
        //             "timestamp": 1485363039.18359,
        //             "id": 317,
        //             "currency": "BTC",
        //             "amount": 530.00000000
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency_id'] = currency['id'];
        }
        const response = await this.privateGetWithdraws (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 403,
        //             "timestamp": 1485363466.868539,
        //             "currency": "BTC",
        //             "amount": 0.53000000,
        //             "status": 20
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'withdrawal' });
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //  deposit
        //      {
        //          "timestamp": 1485363039.18359,
        //          "id": 317,
        //          "currency": "BTC",
        //          "amount": 530.00000000
        //      }
        //
        //  withdrawal
        //      {
        //          "id": 403,
        //          "timestamp": 1485363466.868539,
        //          "currency": "BTC",
        //          "amount": 0.53000000,
        //          "status": 20
        //      }
        //
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const statusId = this.safeString (transaction, 'status');
        return {
            'id': this.safeString (transaction, 'id'),
            'info': transaction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transaction, 'amount'),
            'txid': undefined,
            'type': undefined,
            'status': this.parseTransactionStatus (statusId),
            'comment': undefined,
            'fee': undefined,
            'updated': undefined,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            '10': 'pending',  // New
            '20': 'pending',  // Verified, waiting for approving
            '30': 'ok',       // Approved by moderator
            '40': 'failed',   // Refused by moderator. See your email for more details
            '50': 'canceled', // Cancelled by user
        };
        return this.safeString (statuses, status, status);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "time":1591296000,
        //         "open":0.024746,
        //         "close":0.024728,
        //         "low":0.024728,
        //         "high":0.024753,
        //         "volume":16.624
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '5m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = this.parseToInt (since / 1000);
        }
        const response = await this.publicGetChartsPairTypeChart (this.extend (request, params));
        //
        //     [
        //         {"time":1591296000,"open":0.024746,"close":0.024728,"low":0.024728,"high":0.024753,"volume":16.624},
        //         {"time":1591295700,"open":0.024718,"close":0.02475,"low":0.024711,"high":0.02475,"volume":31.645},
        //         {"time":1591295400,"open":0.024721,"close":0.024717,"low":0.024711,"high":0.02473,"volume":65.071}
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString (balance, 'reserve');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name btcalpha#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetWallets (params);
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': 'open',
            '2': 'canceled',
            '3': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchClosedOrders / fetchOrder
        //     {
        //       "id": "923763073",
        //       "date": "1635451090368",
        //       "type": "sell",
        //       "pair": "XRP_USDT",
        //       "price": "1.00000000",
        //       "amount": "0.00000000",
        //       "status": "3",
        //       "amount_filled": "10.00000000",
        //       "amount_original": "10.0"
        //       "trades": [],
        //     }
        //
        // createOrder
        //     {
        //       "success": true,
        //       "date": "1635451754.497541",
        //       "type": "sell",
        //       "oid": "923776755",
        //       "price": "1.0",
        //       "amount": "10.0",
        //       "amount_filled": "0.0",
        //       "amount_original": "10.0",
        //       "trades": []
        //     }
        //
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const success = this.safeValue (order, 'success', false);
        let timestamp = undefined;
        if (success) {
            timestamp = this.safeTimestamp (order, 'date');
        } else {
            timestamp = this.safeInteger (order, 'date');
        }
        const price = this.safeString (order, 'price');
        const remaining = this.safeString (order, 'amount');
        const filled = this.safeString (order, 'amount_filled');
        const amount = this.safeString (order, 'amount_original');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString2 (order, 'oid', 'id');
        const trades = this.safeValue (order, 'trades');
        const side = this.safeString2 (order, 'my_side', 'type');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
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
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': undefined,
            'info': order,
            'lastTradeTimestamp': undefined,
            'average': undefined,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'amount': amount,
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        if (!response['success']) {
            throw new InvalidOrder (this.id + ' ' + this.json (response));
        }
        const order = this.parseOrder (response, market);
        const orderAmount = order['amount'].toString ();
        amount = Precise.stringGt (orderAmount, '0') ? order['amount'] : amount;
        return this.extend (order, {
            'amount': this.parseNumber (amount),
        });
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'order': id,
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        return response;
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by btcalpha fetchOrder
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const order = await this.privateGetOrderId (this.extend (request, params));
        return this.parseOrder (order);
    }

    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const orders = await this.privateGetOrdersOwn (this.extend (request, params));
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'status': '1',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'status': '3',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcalpha#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the btcalpha api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const trades = await this.privateGetExchangesOwn (this.extend (request, params));
        return this.parseTrades (trades, undefined, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.urlencode (this.keysort (this.omit (params, this.extractParams (path))));
        let url = this.urls['api']['rest'] + '/';
        if (path !== 'charts/{pair}/{type}/chart/') {
            url += 'v1/';
        }
        url += this.implodeParams (path, params);
        headers = { 'Accept': 'application/json' };
        if (api === 'public') {
            if (query.length) {
                url += '?' + query;
            }
        } else {
            this.checkRequiredCredentials ();
            let payload = this.apiKey;
            if (method === 'POST') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = query;
                payload += body;
            } else if (query.length) {
                url += '?' + query;
            }
            headers['X-KEY'] = this.apiKey;
            headers['X-SIGN'] = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
            headers['X-NONCE'] = this.nonce ().toString ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"date":1570599531.4814300537,"error":"Out of balance -9.99243661 BTC"}
        //
        const error = this.safeString (response, 'error');
        const feedback = this.id + ' ' + body;
        if (error !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        }
        if (code === 401 || code === 403) {
            throw new AuthenticationError (feedback);
        } else if (code === 429) {
            throw new DDoSProtection (feedback);
        }
        if (code < 400) {
            return undefined;
        }
        throw new ExchangeError (feedback);
    }
}
