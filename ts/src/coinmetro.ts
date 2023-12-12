
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coinmetro.js';
import { ArgumentsRequired } from './base/errors.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
// import { Precise } from './base/Precise.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, Market, OHLCV, OrderBook, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class coinmetro
 * @extends Exchange
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
                'fetchBalance': false,
                'fetchBidsAsks': false,
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
                'fetchTickers': false,
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
                'signIn': false,
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
                    'test': 'https://api.coinmetro.com/open',
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
                        'exchange/bookUpdates/{pair}/{from}': 1,
                    },
                },
                'private': {
                    'get': {
                    },
                    'post': {
                    },
                    'put': {
                    },
                },
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
        return this.parseMarkets (response);
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'pair');
        const parsedMarketId = this.parseMarketId (id);
        const baseId = this.safeString (parsedMarketId, 'baseId');
        const quoteId = this.safeString (parsedMarketId, 'quoteId');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
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
                'amount': undefined,
                'price': this.parseNumber (pricePrecision), // todo: check
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
            'info': market,
        };
    }

    parseMarketId (marketId) {
        const result = {
            'baseId': undefined,
            'quoteId': undefined,
        };
        const currencyIds = this.safeValue (this, 'currencyIdsList', []);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const entryIndex = marketId.indexOf (currencyId);
            if (entryIndex !== -1) {
                const restId = marketId.replace (currencyId, '');
                if (this.inArray (restId, currencyIds)) {
                    if (entryIndex === 0) {
                        result['baseId'] = currencyId;
                        result['quoteId'] = restId;
                    } else {
                        result['baseId'] = restId;
                        result['quoteId'] = currencyId;
                    }
                    break;
                }
            }
        }
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode (request);
        if (query) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
