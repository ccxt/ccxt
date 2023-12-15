
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coinmetro.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, InsufficientFunds, InvalidOrder } from './base/errors.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class coinmetro
 * @augments Exchange
 */
export default class coinmetro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinmetro',
            'name': 'Coinmetro',
            'countries': [ 'EE' ], // Republic of Estonia todo: check
            'version': 'v1', // todo: check
            'rateLimit': 300, // todo: check
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false, // todo: check
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createOrder': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
                'transfer': false,
                'withdraw': false,
                'ws': false,
            },
            'timeframes': {
                '1m': '60000',
                '5m': '300000',
                '30m': '1800000',
                '4h': '14400000',
                '24h': '86400000',
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://api.coinmetro.com',
                    'private': 'https://api.coinmetro.com',
                },
                'test': {
                    'public': 'https://api.coinmetro.com',
                    'private': 'https://api.coinmetro.com/open',
                },
                'www': 'https://coinmetro.com/',
                'doc': [
                    'https://documenter.getpostman.com/view/3653795/SVfWN6KS',
                ],
                'fees': 'https://help.coinmetro.com/hc/en-gb/articles/6844007317789-What-are-the-fees-on-Coinmetro-',
            },
            'api': {
                'public': {
                    'get': {
                        'exchange/candles/{pair}/{timeframe}/{from}/{to}': 1,
                        'exchange/prices': 1,
                        'exchange/ticks/{pair}/{from}': 1,
                        'assets': 1,
                        'markets': 1,
                        'exchange/book/{pair}': 1,
                        'exchange/bookUpdates/{pair}/{from}': 1, // todo: not unified
                    },
                },
                'private': {
                    'get': {
                        'users/balances': 1,
                        'users/wallets/history/{since}': 1,
                        'exchange/orders/status/{orderID}': 1, // todo: fetchOrder
                        'exchange/orders/active': 1, // todo: fetchOpenOrders
                        'exchange/orders/history/{since}': 1, // todo: fetchOrders
                        'exchange/fills/{since}': 1, // todo: fetchMyTrades
                        'exchange/margin': 1, // todo: check
                    },
                    'post': {
                        'jwt': 1,
                        'jwtDevice': 1, // not unified: login with mobile divice
                        'devices': 1, // not unified: provides information about a yet-to-be authorized mobile device
                        'jwt-read-only': 1, // not unified: requests a read-only long-lived token
                        'exchange/orders/create': 1, // todo: createOrder
                        'exchange/orders/modify/{orderID}': 1, // todo: editOrder
                        'exchange/swap': 1, // todo: check
                        'exchange/swap/confirm/{swapId}': 1, // todo: check
                        'exchange/orders/close/{orderID}': 1, // todo: check - closePosition?
                        'exchange/orders/hedge': 1, // todo: check
                    },
                    'put': {
                        'jwt': 1, // not unified: logout
                        'exchange/orders/cancel/{orderID}': 1, // todo: cancelOrder
                        'users/margin/collateral': 1, // todo: check
                        'users/margin/primary/{currency}': 1, // todo: check
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'login': true,
                'password': true,
            },
            'fees': {
                // todo: add swap and margin
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0'),
                },
            },
            'precisionMode': DECIMAL_PLACES,
            // exchange-specific options
            'options': {
            },
            'exceptions': {
                // https://trade-docs.coinmetro.co/?javascript--nodejs#message-codes
                'exact': {
                },
                'broad': {
                    'Insufficient order size': InvalidOrder, // 422 Unprocessable Entity {"message":"Insufficient order size - min 0.002 ETH"}
                    'Not enough balance': InsufficientFunds, // 422 Unprocessable Entity {"message":"Not enough balance!"}
                    'orderType missing': BadRequest, // 422 Unprocessable Entity {"message":"orderType missing!"}
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name coinmetro#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#d5876d43-a3fe-4479-8c58-24d0f044edfb
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetAssets (params);
        //
        //     [
        //         {
        //             "symbol": "BTC",
        //             "name": "Bitcoin",
        //             "color": "#FFA500",
        //             "type": "coin",
        //             "canDeposit": true,
        //             "canWithdraw": true,
        //             "canTrade": true,
        //             "notabeneDecimals": 8,
        //             "canMarket": true,
        //             "maxSwap": 10000,
        //             "digits": 6,
        //             "multiplier": 1000000,
        //             "bookDigits": 8,
        //             "bookMultiplier": 100000000,
        //             "sentimentData": {
        //                 "sentiment": 51.59555555555555,
        //                 "interest": 1.127511216044664
        //             },
        //             "minQty": 0.0001
        //         },
        //         {
        //             "symbol": "EUR",
        //             "name": "Euro",
        //             "color": "#1246FF",
        //             "type": "fiat",
        //             "canDeposit": true,
        //             "canWithdraw": true,
        //             "canTrade": true,
        //             "canMarket": true,
        //             "maxSwap": 10000,
        //             "digits": 2,
        //             "multiplier": 100,
        //             "bookDigits": 3,
        //             "bookMultiplier": 1000,
        //             "minQty": 5
        //         }
        //         ...
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const withdraw = this.safeValue (currency, 'canWithdraw');
            const deposit = this.safeValue (currency, 'canDeposit');
            const canTrade = this.safeValue (currency, 'canTrade');
            // todo: check active limits and precision (what are notabeneDecimals, digits and bookDigits?)
            const active = canTrade ? withdraw : true;
            const precision = this.safeInteger (currency, 'digits');
            const minAmount = this.safeNumber (currency, 'minQty');
            result[code] = {
                'id': id,
                'code': code,
                'name': code,
                'info': currency,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': { 'min': minAmount, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
                'networks': {},
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name coinmetro#fetchMarkets
         * @description retrieves data on all markets for coinmetro
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#9fd18008-338e-4863-b07d-722878a46832
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        // todo: check
        if (this.safeValue (this, 'currencyIdsList') === undefined) {
            const currencies = await this.fetchCurrencies ();
            const currenciesById = this.indexBy (currencies, 'id');
            this['currenciesByIdForFetchMarkets'] = currenciesById;
            this['currencyIdsList'] = Object.keys (currenciesById);
        }
        //
        //     [
        //         {
        //             "pair": "PERPEUR",
        //             "precision": 5,
        //             "margin": false
        //         },
        //         {
        //             "pair": "PERPUSD",
        //             "precision": 5,
        //             "margin": false
        //         },
        //         {
        //             "pair": "YFIEUR",
        //             "precision": 5,
        //             "margin": false
        //         },
        //         ...
        //     ]
        //
        // todo: check what is precision
        return this.parseMarkets (response);
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'pair');
        const parsedMarketId = this.parseMarketId (id);
        const baseId = this.safeString (parsedMarketId, 'baseId');
        const quoteId = this.safeString (parsedMarketId, 'quoteId');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        // todo: check
        const basePrecisionAndLimits = this.parseMarketPrecisionAndLimits (baseId);
        const quotePrecisionAndLimits = this.parseMarketPrecisionAndLimits (quoteId);
        const pricePrecision = this.safeInteger (market, 'precision');
        const margin = this.safeValue (market, 'margin', false);
        return {
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
            'margin': margin,
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
                'amount': basePrecisionAndLimits['precision'],
                'price': pricePrecision,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': basePrecisionAndLimits['minLimit'],
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': quotePrecisionAndLimits['minLimit'],
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    parseMarketId (marketId) {
        let baseId = undefined;
        let quoteId = undefined;
        const currencyIds = this.safeValue (this, 'currencyIdsList', []);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const entryIndex = marketId.indexOf (currencyId);
            if (entryIndex !== -1) {
                const restId = marketId.replace (currencyId, '');
                if (this.inArray (restId, currencyIds)) {
                    if (entryIndex === 0) {
                        baseId = currencyId;
                        quoteId = restId;
                    } else {
                        baseId = restId;
                        quoteId = currencyId;
                    }
                    break;
                }
            }
        }
        const result = {
            'baseId': baseId,
            'quoteId': quoteId,
        };
        return result;
    }

    parseMarketPrecisionAndLimits (currencyId) {
        const currencies = this.safeValue (this, 'currenciesByIdForFetchMarkets', {});
        const currency = this.safeValue (currencies, currencyId, {});
        const precision = this.safeInteger (currency, 'precision');
        const limits = this.safeValue (currency, 'limits', {});
        const amountLimits = this.safeValue (limits, 'amount', {});
        const minLimit = this.safeNumber (amountLimits, 'min');
        const result = {
            'precision': precision,
            'minLimit': minLimit,
        };
        return result;
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coinmetro#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#13cfb5bc-7bfb-4847-85e1-e0f35dfb3573
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'timeframe': this.safeString (this.timeframes, timeframe),
        };
        if (since !== undefined) {
            request['from'] = since;
            if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe) * 1000;
                // todo: should we substract 1 from duration?
                request['to'] = this.sum (since, duration * (limit));
            } else {
                request['to'] = this.milliseconds ();
            }
        }
        const until = this.safeInteger2 (params, 'till', 'until');
        if (until !== undefined) {
            params = this.omit (params, [ 'till', 'until' ]);
            request['to'] = until;
        }
        const response = await this.publicGetExchangeCandlesPairTimeframeFromTo (this.extend (request, params));
        //
        //     {
        //         "candleHistory": [
        //             {
        //                 "pair": "ETHUSDT",
        //                 "timeframe": 86400000,
        //                 "timestamp": 1697673600000,
        //                 "c": 1567.4409353098604,
        //                 "h": 1566.7514068472303,
        //                 "l": 1549.4563666936847,
        //                 "o": 1563.4490341395904,
        //                 "v": 0
        //             },
        //             {
        //                 "pair": "ETHUSDT",
        //                 "timeframe": 86400000,
        //                 "timestamp": 1697760000000,
        //                 "c": 1603.7831363339324,
        //                 "h": 1625.0356823666407,
        //                 "l": 1565.4629390011505,
        //                 "o": 1566.8387619426028,
        //                 "v": 0
        //             },
        //             ...
        //         ]
        //     }
        //
        const candleHistory = this.safeValue (response, 'candleHistory', []);
        return this.parseOHLCVs (candleHistory, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeNumber (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinmetro#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ee5d698-06da-4570-8c84-914185e05065
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['from'] = since;
        } else {
            request['from'] = '';
        }
        const response = await this.publicGetExchangeTicksPairFrom (this.extend (request, params));
        //
        //     {
        //         "tickHistory": [
        //             {
        //                 "pair": "ETHUSDT",
        //                 "price": 2077.5623,
        //                 "qty": 0.002888,
        //                 "timestamp": 1700684689420,
        //                 "seqNum": 10644554718
        //             },
        //             {
        //                 "pair": "ETHUSDT",
        //                 "price": 2078.3848,
        //                 "qty": 0.003368,
        //                 "timestamp": 1700684738410,
        //                 "seqNum": 10644559561
        //             },
        //             {
        //                 "pair": "ETHUSDT",
        //                 "price": 2077.1513,
        //                 "qty": 0.00337,
        //                 "timestamp": 1700684816853,
        //                 "seqNum": 10644567113
        //             },
        //             ...
        //         ]
        //     }
        //
        // todo: check what is seqNum?
        const tickHistory = this.safeValue (response, 'tickHistory', []);
        return this.parseTrades (tickHistory, market, since, limit);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     {
        //         "pair": "ETHUSDT",
        //         "price": 2077.1513,
        //         "qty": 0.00337,
        //         "timestamp": 1700684816853,
        //         "seqNum": 10644567113
        //     },
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const id = this.safeString (trade, 'pair');
        const timestamp = this.safeString (trade, 'timestamp');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'qty');
        const order = undefined;
        const fee = undefined;
        const side = undefined;
        const takerOrMaker = undefined;
        return this.safeTrade ({
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coinmetro#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#26ad80d7-8c46-41b5-9208-386f439a8b87
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetExchangeBookPair (this.extend (request, params));
        //
        //     {
        //         "book": {
        //             "pair": "ETHUSDT",
        //             "seqNumber": 10800409239,
        //             "ask": {
        //                 "2354.2861": 3.75,
        //                 "2354.3138": 19,
        //                 "2354.7538": 80,
        //                 "2355.5430": 260,
        //                 "2356.4611": 950,
        //                 "2361.7150": 1500,
        //                 "206194.0000": 0.01
        //             },
        //             "bid": {
        //                 "2352.6339": 3.75,
        //                 "2352.6002": 19,
        //                 "2352.2402": 80,
        //                 "2351.4582": 260,
        //                 "2349.3111": 950,
        //                 "2343.8601": 1500,
        //                 "1.0000": 5
        //             },
        //             "checksum": 2108177337
        //         }
        //     }
        //
        const book = this.safeValue (response, 'book', {});
        const rawBids = this.safeValue (book, 'bid', {});
        const rawAsks = this.safeValue (book, 'ask', {});
        const rawOrderbook = {
            'bids': rawBids,
            'asks': rawAsks,
        };
        const orderbook = this.parseOrderBook (rawOrderbook, symbol);
        orderbook['nonce'] = this.safeInteger (book, 'checksum'); // todo: check
        return orderbook;
    }

    parseBidsAsks (rawBidsAsks) {
        // overriding Exchange.parseBidsAsks
        const prices = Object.keys (rawBidsAsks);
        const result = [];
        for (let i = 0; i < prices.length; i++) {
            const priceString = this.safeString (prices, i);
            const price = this.safeNumber (prices, i);
            const volume = this.safeNumber (rawBidsAsks, priceString);
            result.push ([ price, volume ]);
        }
        return result;
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coinmetro#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ecd1cd1-f162-45a3-8b3b-de690332a485
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetExchangePrices (params);
        //
        //     {
        //         "latestPrices": [
        //             {
        //                 "pair": "PERPEUR",
        //                 "timestamp": 1702549840393,
        //                 "price": 0.7899997816001223,
        //                 "qty": 1e-12,
        //                 "ask": 0.8,
        //                 "bid": 0.7799995632002446
        //             },
        //             {
        //                 "pair": "PERPUSD",
        //                 "timestamp": 1702549841973,
        //                 "price": 0.8615317721366659,
        //                 "qty": 1e-12,
        //                 "ask": 0.8742333599999257,
        //                 "bid": 0.8490376365388491
        //             },
        //             ...
        //         ],
        //         "24hInfo": [
        //             {
        //                 "delta": 0.25396444229149906,
        //                 "h": 0.78999978160012,
        //                 "l": 0.630001740844,
        //                 "v": 54.910000002833996,
        //                 "pair": "PERPEUR",
        //                 "sentimentData": {
        //                     "sentiment": 36.71333333333333,
        //                     "interest": 0.47430830039525695
        //                     }
        //                 },
        //             {
        //                 "delta": 0.26915154078134096,
        //                 "h": 0.86220315458898,
        //                 "l": 0.67866757035154,
        //                 "v": 2.835000000000001e-9,
        //                 "pair": "PERPUSD",
        //                 "sentimentData": {
        //                     "sentiment": 36.71333333333333,
        //                     "interest": 0.47430830039525695
        //                 }
        //             },
        //             ...
        //         ]
        //     }
        //
        const latestPrices = this.safeValue (response, 'latestPrices', []);
        const twentyFourHInfos = this.safeValue (response, '24hInfo', []);
        const tickersObject = {};
        // merging info from two lists into one
        for (let i = 0; i < latestPrices.length; i++) {
            const latestPrice = latestPrices[i];
            const marketId = this.safeString (latestPrice, 'pair');
            if (marketId !== undefined) {
                tickersObject[marketId] = latestPrice;
            }
        }
        for (let i = 0; i < twentyFourHInfos.length; i++) {
            const twentyFourHInfo = twentyFourHInfos[i];
            const marketId = this.safeString (twentyFourHInfo, 'pair');
            if (marketId !== undefined) {
                const latestPrice = this.safeValue (tickersObject, marketId, {});
                tickersObject[marketId] = this.extend (twentyFourHInfo, latestPrice);
            }
        }
        const tickers = Object.values (tickersObject);
        return this.parseTickers (tickers, symbols);
    }

    async fetchBidsAsks (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name coinmetro#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple markets
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ecd1cd1-f162-45a3-8b3b-de690332a485
         * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetExchangePrices (params);
        const latestPrices = this.safeValue (response, 'latestPrices', []);
        return this.parseTickers (latestPrices, symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        //     {
        //         "pair": "PERPUSD",
        //         "timestamp": 1702549841973,
        //         "price": 0.8615317721366659,
        //         "qty": 1e-12,
        //         "ask": 0.8742333599999257,
        //         "bid": 0.8490376365388491
        //         "delta": 0.26915154078134096,
        //         "h": 0.86220315458898,
        //         "l": 0.67866757035154,
        //         "v": 2.835000000000001e-9,
        //         "sentimentData": {
        //             "sentiment": 36.71333333333333,
        //             "interest": 0.47430830039525695
        //         }
        //     }
        //
        const marketId = this.safeString (ticker, 'pair');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const bid = this.safeString (ticker, 'bid');
        const ask = this.safeString (ticker, 'ask');
        const high = this.safeString (ticker, 'h');
        const low = this.safeString (ticker, 'l');
        const close = this.safeString (ticker, 'price'); // todo: check the GUI shows it as a last price
        const baseVolume = this.safeString (ticker, 'v');
        const delta = this.safeString (ticker, 'delta');
        const percentage = Precise.stringMul (delta, '100');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'open': undefined,
            'high': high,
            'low': low,
            'close': close,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name coinmetro#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#698ae067-43dd-4e19-a0ac-d9ba91381816
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetUsersBalances (params);
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        //
        //     {
        //         "USDC": {
        //             "USDC": 99,
        //             "EUR": 91.16,
        //             "BTC": 0.002334
        //         },
        //         "XCM": {
        //             "XCM": 0,
        //             "EUR": 0,
        //             "BTC": 0
        //         },
        //         "TOTAL": {
        //             "EUR": 91.16,
        //             "BTC": 0.002334
        //         },
        //         "REF": {
        //             "XCM": 0,
        //             "EUR": 0,
        //             "BTC": 0
        //         }
        //     }
        //
        const timestamp = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const balances = this.omit (response, [ 'TOTAL', 'REF' ]);
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const currency = this.safeValue (balances, currencyId, {});
            account['total'] = this.safeString (currency, currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinmetro#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#4e7831f7-a0e7-4c3e-9336-1d0e5dcb15cf
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return (default 200, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        const request = {};
        if (since !== undefined) {
            request['since'] = since;
        } else {
            request['since'] = '';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetUsersWalletsHistorySince (this.extend (request, params));
        //
        //
        const ledger = this.safeValue (response, 'transactions', []);
        return this.parseLedger (ledger, currency, since, limit);
    }

    parseLedgerEntry (item, currency: Currency = undefined) {
        //
        //
        return {
            'info': item,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'direction': undefined,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': undefined,
            'currency': undefined,
            'amount': undefined,
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        };
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name coinmetro#createOrder
         * @description create a trade order
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#a4895a1d-3f50-40ae-8231-6962ef06c771
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount in market orders
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", "GTD"
         * @param {number} [params.expirationTime] timestamp in millisecond, for GTD orders only
         * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
         * @param {bool} [params.margin] true for creating a margin order
         * @param {string} [params.fillStyle] fill style of the limit order: "sell" fulfills selling quantity "buy" fulfills buying quantity "base" fulfills base currency quantity "quote" fulfills quote currency quantity
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderType': type,
        };
        let precisedAmount = undefined;
        if (amount !== undefined) {
            precisedAmount = this.amountToPrecision (symbol, amount);
        }
        let cost = this.safeNumber (params, 'cost');
        params = this.omit (params, 'cost');
        if (type === 'limit') {
            if ((price === undefined) && (cost === undefined)) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price or params.cost argument for a ' + type + ' order');
            } else if ((price !== undefined) && (amount !== undefined)) {
                const costString = Precise.stringMul (price.toString (), precisedAmount.toString ());
                cost = this.number (costString);
            }
        }
        let precisedCost = undefined;
        if (cost !== undefined) {
            precisedCost = this.costToPrecision (symbol, cost);
        }
        if (side === 'sell') {
            this.handleCreateOrderSide (market['baseId'], market['quoteId'], precisedAmount, precisedCost, request);
        } else if (side === 'buy') {
            this.handleCreateOrderSide (market['quoteId'], market['baseId'], precisedCost, precisedAmount, request);
        }
        const timeInForce = this.safeValue (params, 'timeInForce');
        if (timeInForce !== undefined) {
            params = this.omit (params, 'timeInForce');
            request['timeInForce'] = this.encodeOrderTimeInForce (timeInForce);
            // todo: check the expiration time for GTD
        }
        const stopPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        if (stopPrice !== undefined) {
            params = this.omit (params, 'triggerPrice', 'stopPrice');
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        }
        // todo: add margin order support
        const response = await this.privatePostExchangeOrdersCreate (this.extend (request, params));
        //
        //     {
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e36170257448481749b7ee2893bafec2",
        //         "orderType": "market",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "buyingQty": 0.002,
        //         "timeInForce": 4,
        //         "boughtQty": 0.002,
        //         "soldQty": 4.587,
        //         "creationTime": 1702574484829,
        //         "seqNumber": 10874285330,
        //         "firstFillTime": 1702574484831,
        //         "lastFillTime": 1702574484831,
        //         "fills": [
        //             {
        //                 "seqNumber": 10874285329,
        //                 "timestamp": 1702574484831,
        //                 "qty": 0.002,
        //                 "price": 2293.5,
        //                 "side": "buy"
        //             }
        //         ],
        //         "completionTime": 1702574484831,
        //         "takerQty": 0.002
        //     }
        //
        return this.parseOrder (response, market);
    }

    handleCreateOrderSide (sellingCurrency, buyingCurrency, sellingQty, buyingQty, request = {}) {
        request['sellingCurrency'] = sellingCurrency;
        request['buyingCurrency'] = buyingCurrency;
        if (sellingQty !== undefined) {
            request['sellingQty'] = sellingQty;
        }
        if (buyingQty !== undefined) {
            request['buyingQty'] = buyingQty;
        }
    }

    encodeOrderTimeInForce (timeInForce) {
        const timeInForceTypes = {
            'GTC': 1,
            'IOC': 2,
            'GTD': 3,
            'FOK': 4,
        };
        return this.safeValue (timeInForceTypes, timeInForce, timeInForce);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // createOrder
        //     {
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e36170257448481749b7ee2893bafec2",
        //         "orderType": "market",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "buyingQty": 0.002,
        //         "timeInForce": 4,
        //         "boughtQty": 0.002,
        //         "soldQty": 4.587,
        //         "creationTime": 1702574484829,
        //         "seqNumber": 10874285330,
        //         "firstFillTime": 1702574484831,
        //         "lastFillTime": 1702574484831,
        //         "fills": [
        //             {
        //                 "seqNumber": 10874285329,
        //                 "timestamp": 1702574484831,
        //                 "qty": 0.002,
        //                 "price": 2293.5,
        //                 "side": "buy"
        //             }
        //         ],
        //         "completionTime": 1702574484831,
        //         "takerQty": 0.002
        //     }
        //
        const timestamp = this.safeInteger (order, 'creationTime');
        const buyingQty = this.safeNumber (order, 'buyingQty');
        const sellingQty = this.safeNumber (order, 'sellingQty');
        // market buy orders has buyingQty
        // market sell orders has sellingQty
        let side = undefined;
        if (buyingQty === undefined) {
            side = 'sell';
        } else if (sellingQty === undefined) {
            side = 'buy';
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'orderID'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'lastFillTime'),
            'status': undefined,
            'symbol': undefined,
            'type': this.safeString (order, 'orderType'),
            'timeInForce': this.parseOrderTimeInForce (this.safeInteger (order, 'timeInForce')),
            'side': side,
            'price': undefined,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'average': undefined,
            'amount': undefined,
            'cost': undefined,
            'filled': undefined,
            'remaining': undefined,
            'fee': undefined,
            'fees': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderTimeInForce (timeInForce) {
        const timeInForceTypes = [
            undefined,
            'GTC',
            'IOC',
            'GTD',
            'FOK',
        ];
        return this.safeValue (timeInForceTypes, timeInForce, timeInForce);
    }

    async signIn (params = {}) {
        /**
         * @method
         * @name coinmetro#signIn
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#1d422cd5-03ad-4abe-a1f7-30a18bac9645
         * @description sign in, must be called prior to using other authenticated methods
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns response from exchange
         */
        this.checkRequiredCredentials ();
        const request = {
            'login': this.login,
            'password': this.password,
        };
        const response = await this.privatePostJwt (this.extend (request, params));
        //
        //     {
        //         "userId": "5c52d1a2e1d1c928d5ddefe5",
        //         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjNTJkMWEyZTFkMWM5MjhkNWRkZWZlNSIsInVzZXJuYW1lIjoic29tZUBtYWlsLmNvbSIsImV4cCI6MTU3MDM4MDU3MTU1NCwiaWF0IjoxNTY3Nzg4NTcxfQ.2A5PbS8Oo7ZDGfNlhNEs43gHfmj0OyCHM2sbGFBbi1Y",
        //     }
        //
        this['token'] = this.safeString (response, 'token');
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode (request);
        if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = {};
            if (url === 'https://api.coinmetro.com/jwt') {
                // if signIn
                headers['X-Device-Id'] = 'bypass';
                if (this.twofa !== undefined) {
                    headers['X-OTP'] = this.twofa;
                }
            } else {
                const token = this.safeValue (this, 'token');
                if (token !== undefined) {
                    headers['Authorization'] = 'Bearer ' + token;
                } else {
                    throw new AuthenticationError (this.id + ' access token required, call signIn() method');
                }
            }
            if ((method === 'POST') || (method === 'PUT')) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = this.urlencode (request);
            }
        } else if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
