// ---------------------------------------------------------------------------

import Exchange from './abstract/mintme.js';
import { BadRequest, ExchangeError, ArgumentsRequired } from './base/errors.js';
import type { Dict, Int, OrderBook, Market, OrderType, OrderSide, Num, Order, Currencies, MarketInterface, Ticker, Trade, DepositAddress, Balances, Transaction, TradingFeeInterface } from './base/types.js';
import { TICK_SIZE } from './base/functions.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';

// ---------------------------------------------------------------------------

/**
 * @class mintme
 * @augments Exchange
 */
export default class mintme extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mintme',
            'name': 'MintMe',
            'countries': [ 'Global' ],
            'rateLimit': 2000,
            'version': 'v2',
            'pro': false,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deleteOrder': true,
                'fetchActiveMarketOrder': true,
                'fetchActiveUserOrders': true,
                'fetchAddresses': true,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCompletedTrades': true,
                'fetchCurrencies': true,
                'fetchCurrency': true,
                'fetchDeposits': false,
                'fetchFinishedMarketOrder': true,
                'fetchFinishedUserOrders': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchHistory': true,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketInfo': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTickerMarketPairs': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradesMarketPair': false,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchWithdrawalFee': true,
                'fetchWithdrawals': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://www.mintme.com/token.svg',
                'api': {
                    'public': 'https://www.mintme.com/dev/api/v2/open',
                    'private': 'https://www.mintme.com/dev/api/v2/auth',
                },
                'www': 'https://www.mintme.com',
                'doc': [ 'https://www.mintme.com/api' ],
                'fees': 'https://www.mintme.com/kb/Trading-fees',
            },
            'api': {
                'public': {
                    'get': {
                        'orderbook/{base_quote}': 1,
                        'summary': 1,
                        'ticker': 1,
                        'trades/{market_pair}': 1,
                    },
                },
                'private': {
                    'get': {
                        'currencies': 1,
                        'currencies/{name}': 1,
                        'markets/{base}/{quote}': 1,
                        'orders/active': 1,
                        'orders/finished': 1,
                        'user/orders/active': 1,
                        'user/orders/finished': 1,
                        'user/wallet/addresses': 1,
                        'user/wallet/balances': 1,
                        'user/wallet/history': 1,
                    },
                    'post': {
                        'user/orders': 1,
                        'user/wallet/withdraw': 1,
                    },
                    'delete': {
                        'user/orders/{id}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'regular': {
                        'maker': this.parseNumber ('0.005'), // 0.5% regular trading
                        'taker': this.parseNumber ('0.005'),
                    },
                    'quick': {
                        'maker': this.parseNumber ('0.005'), // 0.5% quick trading
                        'taker': this.parseNumber ('0.005'),
                    },
                },
                'funding': {
                    'withdraw': {
                        'MINTME': { 'MintMe': 1 }, // Min MINTME Coin
                        'BTC': { 'Bitcoin': 0.0004 },
                        'ETH': {
                            'Ethereum': 0.004,
                            'Arbitrum': 0.0004,
                            'BASE': 0.0004,
                        },
                        'USDC': {
                            'Ethereum': 20,
                            'BNB Smart Chain': 2,
                        },
                        'USDT': {
                            'Ethereum': 20,
                            'BNB Smart Chain': 2,
                        },
                        'BNB': { 'BNB Smart Chain': 0.002 },
                        'MATIC': { 'Polygon': 1.5 },
                        'SOL': { 'Solana': 0.008 },
                        'CFX': { 'Conflux': 6 },
                        'CRO': { 'Cronos': 10 },
                        'AVAX': { 'Avalanche': 0.04 },
                    },
                    'Deposit': { 'fee': 0 },
                },
                'donation': {
                    'direct_purchase_fee': this.parseNumber ('0.02'),
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '400': BadRequest,
                '401': ArgumentsRequired,
            },
        });
    }

    /**
     * @method
     * @name mintme#fetchMarkets
     * @description Retrieves data on all markets for MintMe by paginating through API responses.
     * Since the API has a limit of 101 results per request, this method fetches all available markets.
     * by incrementally increasing the offset until no more data is returned.
     * The `while (true)` loop ensures continuous fetching until all markets are retrieved.
     * @see https://www.mintme.com/dev/documentation/v2 /dev/api/v2/open/summary/
     * @param {object} params - Extra parameters for the API request.
     * @returns {object[]} an array of objects representing market data.
     */
    async fetchMarkets (params: {} = {}): Promise<MarketInterface[]> {
        const result: MarketInterface[] = [];
        // {
        // MDYS_MINTME: {
        //     id: undefined,
        //     lowercaseId: undefined,
        //     symbol: 'MDYS_MINTME',
        //     base: 'MDYS',
        //     quote: 'MINTME',
        //     settle: undefined,
        //     baseId: 'MDYS',
        //     quoteId: 'MINTME',
        //     settleId: undefined,
        //     type: 'spot',
        //     spot: true,
        //     margin: false,
        //     swap: false,
        //     future: false,
        //     option: false,
        //     index: undefined,
        //     active: true,
        //     contract: false,
        //     linear: undefined,
        //     inverse: undefined,
        //     subType: undefined,
        //     taker: 0.001,
        //     maker: 0.001,
        //     contractSize: undefined,
        //     expiry: undefined,
        //     expiryDatetime: undefined,
        //     strike: undefined,
        //     optionType: undefined,
        //     precision: { amount: undefined, price: undefined },
        //     limits: {
        //       leverage: [Object],
        //       amount: [Object],
        //       price: [Object],
        //       cost: [Object]
        //     },
        // }
        let offset = 0; // Start fetching from the first record
        const limit = 101; // Maximum number of results the API allows per request
        while (true) {
            // Fetch the next batch of markets
            const response = await this.publicGetSummary ({ ...params, offset, limit });
            // If the response is empty, stop fetching
            if ((!response) || (response.length === 0)) {
                break;
            }
            // Process each market in the response
            for (let i = 0; i < response.length; i++) {
                const market = response[i];
                const baseId = this.safeString (market, 'base_currency');
                const quoteId = this.safeString (market, 'quote_currency');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                result.push ({
                    'id': market.trading_pair,
                    'symbol': baseId + '_' + quoteId,
                    base,
                    quote,
                    baseId,
                    quoteId,
                    'type': 'spot',
                    'spot': true,
                    'margin': false,
                    'swap': false,
                    'future': false,
                    'option': false,
                    'contract': false,
                    'settle': undefined,
                    'settleId': undefined,
                    'contractSize': undefined,
                    'linear': undefined,
                    'inverse': undefined,
                    'expiry': undefined,
                    'expiryDatetime': undefined,
                    'strike': undefined,
                    'optionType': undefined,
                    'created': undefined,
                    'active': this.safeValue (market, 'active', true),
                    'precision': {
                        'amount': this.safeInteger (market, 'amount_precision'),
                        'price': this.safeInteger (market, 'price_precision'),
                    },
                    'limits': {
                        'amount': {
                            'min': this.safeNumber (market, 'min_amount'),
                            'max': this.safeNumber (market, 'max_amount'),
                        },
                        'price': {
                            'min': this.safeNumber (market, 'min_price'),
                            'max': this.safeNumber (market, 'max_price'),
                        },
                        'cost': {
                            'min': this.safeNumber (market, 'min_total'),
                            'max': undefined,
                        },
                    },
                    'info': market,
                });
            }
            // Increase the offset to fetch the next batch of markets
            offset += limit;
        }
        // Return all fetched markets
        return result;
    }

    /**
     * @method
     * @name mintme#fetchOrderBook
     * @description Retrieves the order book for a given trading pair.
     * This function requests order book data from the exchange API and structures it into a standard format.
     * @see https://www.mintme.com/dev/api/v2/auth/orderbook dev/api/v2/open/orderbook/{base_quote}
     * @param {string} symbol - The trading pair symbol (e.g., 'BTC/MINTME').
     * @param {number} depth - The maximum number of order book entries to return.
     * @param {number} level - The aggregation level for order book entries.
     * @param {object} params - Additional parameters for the API request.
     * @returns {Promise<OrderBook>} - The structured order book data.
     * @throws {ExchangeError} - If the API response is empty or invalid.
     */
    async fetchOrderBook (symbol: string, depth: number = 1, level: number = 2, params = {}): Promise<OrderBook> {
        // Ensure markets are loaded before making the request
        await this.loadMarkets ();
        // {
        //     "bids": [
        //       [
        //         "1000.000000000000000000",
        //         "0.000900000000"
        //       ]
        //     ],
        //     "asks": [
        //       [
        //         "310000.000000000000000000",
        //         "0.945900000000"
        //       ]
        //     ],
        //     "timestamp": 1738613041
        // }
        // Get the market details from the symbol
        const market = this.market (symbol.toUpperCase () + '_MINTME');
        // Construct the API request parameters
        const request: Dict = {
            'base_quote': market['symbol'],
            'depth': depth,
            'level': level,
        };
        // Send API request and retrieve order book data
        const response = await this.publicGetOrderbookBaseQuote (this.extend (request, params));
        // If the API response is empty, throw an error
        if (!response) {
            throw new ExchangeError (this.id + ' fetchOrderBook() returned an empty response');
        }
        // Parse and return the order book in a standardized format
        return this.parseOrderBook (response, symbol);
    }

    /**
     * @method
     * @name mintme#fetchTickerMarketPairs
     * @description Retrieves ticker information for all available market pairs.
     * This function paginates through the API to fetch all ticker data, since the API limit is 101 per request.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/open/ticker/
     * @param {object} params - Additional parameters for the API request.
     * @returns {Promise<Ticker[]>} - An array of structured ticker objects.
     * @throws {ExchangeError} - If the API response is empty or invalid.
     */
    async fetchTickerMarketPairs (params = {}): Promise<Ticker[]> {
        // Ensure market data is loaded before fetching tickers
        await this.loadMarkets ();
        // [
        //     {
        //       "Homelify_MINTME": {
        //         "base_id": 7863,
        //         "quote_id": 1,
        //         "last_price": "0",
        //         "quote_volume": "0",
        //         "base_volume": "0",
        //         "isFrozen": 0
        //       }
        //     }
        // ]
        let offset = 0;
        const limit = 101; // Maximum API limit per request
        const allTickers: Ticker[] = [];
        // Loop to fetch all ticker data using pagination
        while (true) {
            const request: Dict = {
                offset,
                limit,
            };
            // Fetch ticker data from the API
            const response = await this.publicGetTicker (this.extend (request, params));
            // Parse response into structured ticker objects
            const tickers = this.parseTickerPairs (response);
            // If no more tickers are returned, exit the loop
            if (tickers.length === 0) {
                break;
            }
            // Store fetched tickers
            allTickers.push (...tickers);
            // Increment offset for the next batch of results
            offset += limit;
        }
        // Return the full list of tickers
        return allTickers;
    }

    /**
     * Fetches the most recent completed trades for a given market pair.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/open/trades/{markets_pair}
     * @param {string} symbol - The market symbol (e.g., 'Rrush', 'THOR).
     * @param {string} pair - The pair symbol (e.g., 'mintme', 'btc').
     * @param {object} [params] - Additional parameters for the API request.
     * @returns {Promise<Trade[]>} - A list of completed trades, including price, volume, timestamp, and trade type.
     * @throws {ExchangeError} - If the API response is empty.
     */
    async fetchCompletedTrades (symbol: string, pair:string, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        // [
        //     {
        //       id: '1025005',
        //       symbol: 'Rrush_MINTME',
        //       price: 4.95,
        //       amount: 5.0403,
        //       cost: 24.949485,
        //       timestamp: 1739519424,
        //       datetime: '1970-01-21T03:11:59.424Z',
        //       side: 'buy'
        //     }
        // ]
        const marketPair = `${symbol}_${pair.toUpperCase ()}`;
        const market = this.market (marketPair);
        if (!market) {
            throw new ExchangeError (this.id + ' fetchCompletedTrades() market not found for' + marketPair);
        }
        const request: Dict = {
            'market_pair': marketPair,
        };
        const response = await this.publicGetTradesMarketPair (this.extend (request, params));
        if (!response) {
            throw new ExchangeError (this.id + ' fetchCompletedTrades() returned an empty response');
        }
        return this.parseCompletedOrder (response, marketPair);
    }

    /**
     * Fetches all available currencies with pagination support.
     * Iterates through paginated API responses to retrieve all currency data.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/currencies
     * @param {object} [params] - Additional parameters for the API request.
     * @returns {Promise<Currencies>} - A promise that resolves to an object containing all fetched currencies.
     * @throws {ExchangeError} - If the API response is empty or an error occurs.
     */
    async fetchCurrencies (params: {} = {}): Promise<Currencies> {
        const result: Currencies = {};
        let offset = 0;
        const limit = 500;
        while (true) {
            const request = this.extend ({ offset, limit }, params);
            const response = await this.privateGetCurrencies (request);
            if ((!response) || (response.length === 0)) {
                break;
            }
            // Parse the response and merge it into the result object
            const parsedCurrencies = this.parseCurrencies (response);
            const keys = Object.keys (parsedCurrencies);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                result[key] = parsedCurrencies[key];
            }
            offset += limit;
        }
        return result;
    }

    /**
     * Fetches details of a specific currency by its symbol.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/currencies/{name}
     * @param {string} symbol - The currency symbol (e.g., 'Aurah', 'CoDan', 'GAMER').
     * @param {object} [params] - Additional parameters for the API request.
     * @returns {Promise<Currency>} - A promise that resolves to the detailed currency data.
     * @throws {ExchangeError} - If the API response is empty or an error occurs.
     */
    async fetchCurrency (symbol: string, params = {}) {
        await this.loadMarkets ();
        // {
        //     id: 10504,
        //     name: 'GAMER',
        //     priceDecimals: undefined,
        //     hasTax: false,
        //     isPausable: false,
        //     depositsDisabled: false,
        //     withdrawalsDisabled: false,
        //     tradesDisabled: false,
        //     type: 'common',
        //     bondingCurvePool: undefined,
        //     symbol: 'GAMER',
        //     deploymentStatus: 'deployed',
        //     blocked: false,
        //     quiet: false,
        //     availableContentReward: false,
        //     bondingCurveType: false,
        //     networks: [ 'MINTME' ]
        // }
        const request: Dict = {
            'name': symbol,
        };
        const response = await this.privateGetCurrenciesName (this.extend (request, params));
        // If the response is empty, throw an error
        if (!response) {
            throw new ExchangeError (this.id + ' fetchCurrency() returned an empty response');
        }
        return this.parseCurrencyName (response);
    }

    /**
     * Fetches market information for a specific trading pair.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/markets/{base}/{quote}
     * @param {string} base - The market base (e.g., 'mintme').
     * @param {string} quote - The market quote (e.g., 'btc').
     * @param {string} interval - The time interval for market data (e.g., '1d', '1h').
     * @param {object} params - Additional parameters for the API request.
     * @returns {Promise<MarketInfo>} - A promise that resolves to the market data.
     * @throws {ExchangeError} - If the API response is empty or an error occurs.
     */
    async fetchMarketInfo (base: string, quote: string, interval: string = '1d', params = {}) {
        // {
        //     last: '0.000000030000000000',
        //     volume: '910.517500000000000000',
        //     open: '0.000000030000000000',
        //     close: '0.000000030000000000',
        //     high: '0.000000030000000000',
        //     low: '0.000000030000000000',
        //     deal: '0.000027315525000000',
        //     quote: 'btc',
        //     base: 'mintme',
        //     buyDepth: '0.003210174469000000'
        // }
        const request: Dict = {
            'interval': interval,
            'base': base,
            'quote': quote,
        };
        const response = await this.privateGetMarketsBaseQuote (this.extend (request, params));
        // If the response is empty, throw an error
        if (!response) {
            throw new ExchangeError (this.id + ' fetchMarketInfo() returned an empty response');
        }
        return this.parseMarketInfo (response);
    }

    /**
     * Fetches active market orders for a given trading pair.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/orders/active
     * @param {string} base - The base currency (e.g., 'btc').
     * @param {string} quote - The quote currency (e.g., 'mintme').
     * @param {string} side - The order side ('buy' or 'sell').
     * @param {number} offset - The starting offset for pagination.
     * @param {number} limit - The number of results to return (max limit depends on API).
     * @param {object} params - Additional parameters for the API request.
     * @returns {Promise<ActiveMarketOrder[]>} - A promise that resolves to an array of active orders.
     * @throws {ExchangeError} - If the market is not found or the response is empty.
     */
    async fetchActiveMarketOrder (base: string, quote: string, side: string, offset: number = 0, limit: number = 101, params = {}) {
        await this.loadMarkets ();
        // [
        //  {
        //      id: '3462456',
        //      timestamp: '1739581056',
        //      createdTimestamp: '1738605874',
        //      side: 2,
        //      amount: '32887.482500000000000000',
        //      price: '0.000000030000000000',
        //      fee: '0.002000000000000000',
        //      market: { base: [Object] },
        //      quote: { id: '2', name: 'Bitcoin', symbol: 'BTC' }
        //  }
        // ]
        const symbol = `${base}_${quote}`;
        const market = this.market (symbol.toUpperCase ());
        // Throw an error if the market is not found
        if (!market) {
            throw new ExchangeError (this.id + 'fetchActiveMarketOrder() market not found for ' + symbol);
        }
        const request: Dict = {
            'base': base,
            'quote': quote,
            'offset': offset,
            'limit': limit,
            'side': side,
        };
        const response = await this.privateGetOrdersActive (this.extend (request, params));
        // If the response is empty, throw an error
        if (!response) {
            throw new ExchangeError (this.id + ' fetchActiveMarketOrder() returned an empty response');
        }
        return this.parseActiveMarketOrder (response);
    }

    /**
     * Fetches finished market orders for a given trading pair.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/orders/finished
     * @param {string} base - The base currency (e.g., 'btc').
     * @param {string} quote - The quote currency (e.g., 'mintme').
     * @param {number} lastId - The ID of the last finished order, used for pagination.
     * @param {number} limit - The number of results to return (max limit depends on API).
     * @param {object} params - Additional parameters for the API request.
     * @returns {Promise<FinishedMarketOrder[]>} - A promise that resolves to an array of finished orders.
     * @throws {ExchangeError} - If the market is not found or the response is empty.
     */
    async fetchFinishedMarketOrder (base: string, quote: string, lastId: number = 0, limit: number = 101, params = {}) {
        await this.loadMarkets ();
        // [
        //     {
        //       id: '1025094',
        //       timestamp: '1739581056',
        //       createdTimestamp: null,
        //       side: 2,
        //       amount: '910.517500000000000000',
        //       price: '0.000000030000000000',
        //       fee: '0.000000000000000000',
        //       market: { base: [Object] },
        //       quote: { id: '2', name: 'Bitcoin', symbol: 'BTC' }
        //     }
        // ]
        const symbol = `${base}_${quote}`;
        const market = this.market (symbol.toUpperCase ());
        if (!market) {
            throw new ExchangeError (this.id + 'fetchFinishedMarketOrder() market not found for ' + symbol);
        }
        const request: Dict = {
            'base': base,
            'quote': quote,
            'lastId': lastId,
            'limit': limit,
        };
        const response = await this.privateGetOrdersFinished (this.extend (request, params));
        // If the response is empty, throw an error
        if (!response) {
            throw new ExchangeError (this.id + ' fetchFinishedMarketOrder() returned an empty response');
        }
        return this.parseFinishedMarketOrder (response);
    }

    /**
     * Fetches active orders for a user.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/user/orders/active
     * @param {number} offset - The offset to start fetching orders from.
     * @param {number} limit - The maximum number of orders to fetch.
     * @param {object} params - Additional parameters for the API request.
     * @returns {Promise<ActiveUserOrder[]>} - A promise that resolves to an array of active user orders.
     * @throws {ExchangeError} - If the response is empty or no active orders are found.
     */
    async fetchActiveUserOrders (offset: number = 0, limit: number = 101, params = {}) {
        await this.loadMarkets ();
        // [
        //     {
        //       "id": 2418501,
        //       "timestamp": 1738542721,
        //       "createdTimestamp": 1738542721,
        //       "side": 2,
        //       "amount": "12.293000000000000000",
        //       "price": "5.000000000000",
        //       "fee": "0.003000000000000000",
        //       "market": {
        //         "base": {
        //           "id": 67955,
        //           "name": "auto4541224578",
        //           "hasTax": false,
        //           "isPausable": false,
        //           "depositsDisabled": false,
        //           "withdrawalsDisabled": false,
        //           "tradesDisabled": false,
        //           "type": "common",
        //           "bondingCurvePool": null,
        //           "symbol": "auto4541224578",
        //           "deploymentStatus": "deployed",
        //           "blocked": false,
        //           "quiet": false,
        //           "availableContentReward": false,
        //           "priceDecimals": null,
        //           "bondingCurveType": false,
        //           "networks": [
        //             "SOL",
        //             "MINTME"
        //           ]
        //         },
        //         "quote": {
        //           "id": 1,
        //           "name": "MintMe Coin",
        //           "symbol": "MINTME"
        //         }
        //       }
        //     }
        // ]
        const request: Dict = {
            'offset': offset,
            'limit': limit,
        };
        const response = await this.privateGetUserOrdersActive (this.extend (request, params));
        // If the response is empty, throw an error
        if (!response) {
            throw new ExchangeError (this.id + ' fetchActiveUserOrders() returned an empty response');
        }
        return this.parseActiveUserOrders (response);
    }

    /**
     * Fetches finished (completed) orders for a user.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/user/orders/finished
     * @param {number} offset - The offset to start fetching orders from.
     * @param {number} limit - The maximum number of orders to fetch.
     * @param {object} params - Additional parameters for the API request.
     * @returns {Promise<FinishedUserOrder[]>} - A promise that resolves to an array of finished user orders.
     * @throws {ExchangeError} - If the response is empty or no finished orders are found.
     */
    async fetchFinishedUserOrders (offset: number = 0, limit: number = 101, params = {}) {
        await this.loadMarkets ();
        // [
        //     {
        //       "dealOrderId": 2418500,
        //       "orderId": 2418499,
        //       "id": 744966,
        //       "timestamp": 1738541800,
        //       "createdTimestamp": null,
        //       "side": 2,
        //       "amount": "45.003600000000000000",
        //       "price": "1.000000000000",
        //       "fee": "0.135010800000",
        //       "market": {
        //         "base": {
        //           "id": 67955,
        //           "name": "auto4541224578",
        //           "hasTax": false,
        //           "isPausable": false,
        //           "depositsDisabled": false,
        //           "withdrawalsDisabled": false,
        //           "tradesDisabled": false,
        //           "type": "common",
        //           "bondingCurvePool": null,
        //           "symbol": "auto4541224578",
        //           "deploymentStatus": "deployed",
        //           "blocked": false,
        //           "quiet": false,
        //           "availableContentReward": false,
        //           "priceDecimals": null,
        //           "bondingCurveType": false,
        //           "networks": [
        //             "SOL",
        //             "MINTME"
        //           ]
        //         },
        //         "quote": {
        //           "id": 1,
        //           "name": "MintMe Coin",
        //           "symbol": "MINTME"
        //         }
        //       }
        //     }
        // ]
        const request: Dict = {
            'offset': offset,
            'limit': limit,
        };
        const response = await this.privateGetUserOrdersFinished (this.extend (request, params));
        // If the response is empty, throw an error
        if ((!response) || (response.length === 0)) {
            throw new ExchangeError (this.id + ' fetchFinishedUserOrders() returned an empty response');
        }
        return this.parseFinishedUserOrders (response);
    }

    /**
     * Creates a new limit order.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/user/orders
     * @param {string} symbol - The trading pair symbol (e.g., "btc/usdt").
     * @param {OrderType} type - The order type (only "limit" is supported).
     * @param {OrderSide} side - The order side ("buy" or "sell").
     * @param {Num} price - The order price.
     * @param {number} amount - The amount to trade.
     * @param {number} donationAmount - Optional donation amount.
     * @param {object} params - Additional parameters for the order.
     * @throws {BadRequest} If the order type is not "limit".
     * @throws {ExchangeError} If the market is invalid or response is empty.
     * @returns {Promise<object>} The parsed order data.
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, price: Num, amount: number, donationAmount: number, params = {}) {
        await this.loadMarkets ();
        // {
        //     "result": 1,
        //     "orderId": 2418509,
        //     "message": "Order Created"
        // }
        if (type !== 'limit') {
            throw new BadRequest (this.id + ' createOrder() only supports "limit" orders');
        }
        const [ base, quote ] = symbol.split ('/');
        const market = this.market (`${base}_${quote.toUpperCase ()}`);
        if (!market) {
            throw new Error (`Market not found for symbol: ${symbol}`);
        }
        const request: Dict = {
            'base': base,
            'quote': quote,
            'priceInput': price,
            'amountInput': amount,
            'donationAmount': donationAmount,
            'marketPrice': false,
            'action': side,
        };
        const response = await this.privatePostUserOrders (this.extend (request, params));
        // If the response is empty, throw an error
        if ((!response) || (response.length === 0)) {
            throw new ExchangeError (this.id + ' createOrder() returned an empty response');
        }
        const result = this.safeDict (response, 'data');
        return this.parseUserOrder (result, market);
    }

    /**
     * Deletes an existing order.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/user/orders/{id}
     * @param {string} base - The base currency of the trading pair (e.g., "BTC").
     * @param {string} quote - The quote currency of the trading pair (e.g., "USDT").
     * @param {number} orderId - The ID of the order to be deleted.
     * @param {object} params - Additional request parameters.
     * @throws {ExchangeError} If the request is invalid.
     * @returns {Promise<object>} The API response confirming order deletion.
     */
    async deleteOrder (base: string, quote: string, orderId: number, params = {}) {
        await this.loadMarkets ();
        // {
        //   "message": "Order successfully removed"
        // }
        const request: Dict = {
            'id': orderId,
            'base': base,
            'quote': quote.toUpperCase (),
        };
        const response = await this.privateDeleteUserOrdersId (this.extend (request, params));
        if (response.message === 'Invalid request') {
            throw new ExchangeError (' deleteOrder() Invalid request');
        }
        if (!response) {
            throw new ExchangeError (this.id + ' deleteOrder() received an empty response');
        }
        return response;
    }

    /**
     * Fetches deposit addresses for various cryptocurrencies.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/user/wallet/addresses
     * @param {object} params - Additional request parameters.
     * @returns {Promise<DepositAddress[]>} A list of deposit addresses.
     */
    async fetchAddresses (params = {}): Promise<DepositAddress> {
        // {
        //     "MINTME": "0xda60fef80cba9356f6800c11de2ae01cd03ddc33",
        //     "BTC": "tb1q7svfqp5fund9rwrhgm8a74qxafs7gu289kfg78",
        //     "ETH": "0xda60fef80cdg9356f6800c11ne2ae01cd03cdc43",
        //     "BNB": "0xda60fef80cca9356f6800c11de2ae01cd03cdc43",
        //     "CRO": "0xda60fef80cba9c56f6800c11de2ae01cd03cdc43",
        //     "MATIC": "0xda60fef80cba9356f6800f11de2ae01cd03cdc43",
        //     "AVAX": "0xda60fef80cba9356f6800cgde2ae01cd03cdc43",
        //     "SOL": "Hz1fRdRRgSbgKRtXHhDPtALFVCuR79baqsczpvLPxfze",
        //     "CFX": "0xda60fekj0cba9356f6800c11de2ae01cd03cdc43",
        //     "BASE": "0xda60fefldcba9356f6800c11de2ae01cd03cdc43",
        // }
        const response = await this.privateGetUserWalletAddresses (params);
        if ((!response) || (Object.keys (response).length === 0)) {
            throw new ExchangeError (this.id + ' fetchAddresses() received an empty response');
        }
        const result = [];
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            result.push ({
                'info': response,
                'currency': keys[i],
                'address': response[keys[i]],
            });
        }
        return response;
    }

    /**
     * Fetches the user's wallet balances.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/user/wallet/balances
     * @param {Record<string, any>} params - Additional request parameters.
     * @returns {Promise<Balances>} An object containing balances for each currency.
     * @throws {ExchangeError} If the response is empty.
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetUserWalletBalances (params);
        if ((!response) || (Object.keys (response).length === 0)) {
            throw new ExchangeError (this.id + ' fetchBalance() received an empty response');
        }
        // {
        //     "MINTME": {
        //       "available": "622.021262400000000000",
        //       "freeze": "481.091200000000000000"
        //     },
        //     "BTC": {
        //       "available": "0.100000000000000000",
        //       "freeze": "0.000000000000000000"
        //     }
        // }
        const result: Balances = {
            'info': response,
        };
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const currency = keys[i];
            const balanceData = response[currency];
            const free = this.safeString (balanceData, 'available', '0');
            const used = this.safeString (balanceData, 'freeze', '0');
            const bonus = this.safeString (balanceData, 'bonus', '0');
            result[currency] = {
                'free': this.parseNumber (free),
                'used': this.parseNumber (used),
                'total': this.parseNumber (
                    this.sum (
                        this.safeNumber (free, 0),
                        this.safeNumber (used, 0),
                        this.safeNumber (bonus, 0)
                    )
                ),
            };
        }
        return result;
    }

    /**
     * Fetches the user's transaction history.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/user/wallet/history
     * @param {number} offset - The starting position for fetching history.
     * @param {number} limit - The maximum number of records to fetch.
     * @param {Record<string, any>} params - Additional request parameters.
     * @returns {Promise<any[]>} A promise resolving to an array of transaction history objects.
     * @throws {ExchangeError} If the response is empty or invalid.
     */
    async fetchHistory (offset: number = 0, limit: number = 101, params = {}): Promise<any[]> {
        const request = {
            'offset': offset,
            'limit': limit,
        };
        // [
        //     {
        //       "date": "2025-02-05T04:07:22+01:00",
        //       "hash": null,
        //       "blockchain": {
        //         "id": 1,
        //         "name": "MintMe Coin",
        //         "symbol": "MINTME"
        //       },
        //       "amount": "3.000000000000000000",
        //       "fee": "0.100000000000000000",
        //       "tradable": {
        //         "id": 1,
        //         "name": "MintMe Coin",
        //         "symbol": "MINTME"
        //       },
        //       "status": {
        //         "statusCode": "paid"
        //       },
        //       "type": {
        //         "typeCode": "withdraw"
        //       },
        //       "isBonus": false,
        //       "address": "0xa54a326a46940997ad86244318f9d174aae90811",
        //       "feeCurrency": "MINTME"
        //     }
        // ]
        const response = await this.privateGetUserWalletHistory (this.extend (request, params));
        if ((!response) || (!Array.isArray (response))) {
            throw new ExchangeError (this.id + ' fetchHistory() received an invalid response');
        }
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            result.push ({
                'date': item.date,
                'hash': item.hash,
                'blockchain': {
                    'id': item.blockchain.id,
                    'name': item.blockchain.name,
                    'symbol': item.blockchain.symbol,
                },
                'amount': item.amount,
                'fee': item.fee,
                'tradable': {
                    'id': item.tradable.id,
                    'name': item.tradable.name,
                    'symbol': item.tradable.symbol,
                },
                'status': item.status.statusCode,
                'type': item.type.typeCode,
                'isBonus': item.isBonus,
                'address': item.address,
                'feeCurrency': item.feeCurrency,
            });
        }
        return result;
    }

    /**
     * Fetches the trading fee for a given market symbol and type.
     * @see https://www.mintme.com/kb/Trading-fees
     * @param {string} symbol - The trading pair symbol (e.g., "usdt", "mintme").
     * @param {string} type - The type of trading (e.g., "quick", "regular").
     * @param {Record<string, any>} params - Additional request parameters.
     * @returns {Promise<TradingFeeInterface>} A promise resolving to an object containing trading fee details.
     */
    async fetchTradingFee (symbol: string, type = 'regular', params: {} = {}): Promise<TradingFeeInterface> {
        if (!this.fees.trading[type]) {
            throw new Error (`Unknown trading type: ${type}`);
        }
        // {
        //     symbol: 'USDT',
        //     maker: 0.005,
        //     taker: 0.005,
        //     percentage: true,
        //     tierBased: false,
        //     info: { maker: 0.005, taker: 0.005 }
        // }
        return {
            'symbol': symbol.toUpperCase (),
            'maker': this.fees.trading[type].maker,
            'taker': this.fees.trading[type].taker,
            'percentage': true,
            'tierBased': false,
            'info': {
                'maker': this.fees.trading[type].maker,
                'taker': this.fees.trading[type].taker,
            },
        };
    }

    /**
     * Fetches the withdrawal fee for a given currency and network.
     * @see https://www.mintme.com/kb/Trading-fees
     * @param {string} currency - The currency code (e.g., "usdt" ,"btc", "mintme").
     * @param {string} network - The blockchain network (e.g., "BNB Smart Chain").
     * @returns {Promise<{ symbol: string, network: string, fee: number | boolean }>}
     * A promise resolving to an object containing withdrawal fee details.
     */
    async fetchWithdrawalFee (currency, network) {
        const currencySymbol = currency.toUpperCase ();
        const withdrawFees = this.fees.funding.withdraw[currencySymbol];
        // [
        //     {
        //         symbol: 'USDT',
        //         network: 'BNB Smart Chain',
        //         fee: 2,
        //     },
        //     {
        //         symbol: 'SOL',
        //         network: 'Solana',
        //         fee: 0.008,
        //     }
        // ]
        if (!withdrawFees) {
            return {
                'symbol': currencySymbol,
                'network': network,
                'fee': false,
            };
        }
        const fee = this.safeValue (withdrawFees, network, false);
        if (fee === false) {
            console.warn (`no withdrawl fee found for ${currencySymbol} on ${network}`);
        }
        return {
            'symbol': currencySymbol,
            'network': network,
            'fee': fee,
        };
    }

    /**
     * Parses the order book response into a structured format.
     * @param {object} orderbook - The raw order book data from MintMe API.
     * @param {string} symbol - The market symbol (e.g., 'BTC/MINTME').
     * @param {int} [timestamp] - Timestamp of the order book (if available).
     * @returns {object} - A structured order book.
     */
    parseOrderBook (orderbook: { [key: string]: any }, symbol: string, timestamp?: number) {
        return {
            'symbol': symbol,
            'bids': this.parseBidsAsks (this.safeValue (orderbook, 'bids', []), 0, 1),
            'asks': this.parseBidsAsks (this.safeValue (orderbook, 'asks', []), 0, 1),
            'timestamp': this.safeInteger (orderbook, 'timestamp', timestamp),
            'datetime': this.iso8601 (timestamp),
            'nonce': this.safeInteger (orderbook, 'nonce'),
        };
    }

    /**
     * Parses the summary response data into a more structured format.
     * @param {object} response - The raw response from the API.
     * @returns {object} The structured summary data.
     */
    parseSummary (response) {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            result.push ({
                'trading_pairs': this.safeString (item, 'trading_pairs'),
                'last_price': this.safeString (item, 'last_price'),
                'base_currency': this.safeString (item, 'base_currency'),
                'quote_currency': this.safeString (item, 'quote_currency'),
                'lowest_ask': this.safeFloat (item, 'lowest_ask'),
                'highest_bid': this.safeFloat (item, 'highest_bid'),
                'base_volume': this.safeFloat (item, 'base_volume'),
                'quote_volume': this.safeFloat (item, 'quote_volume'),
                'price_change_percent_24h': this.safeFloat (item, 'price_change_percent_24h'),
                'highest_price_24h': this.safeFloat (item, 'highest_price_24h'),
                'lowest_price_24h': this.safeFloat (item, 'lowest_price_24h'),
            });
        }
        return result;
    }

    /**
     * Parses the summary response data into a more structured format.
     * @param {object} response - The raw response from the API.
     * @returns {object} The structured summary data.
     */
    parseTickerPairs (response: any): Ticker[] {
        const tickers: any[] = [];
        if (Array.isArray (response)) {
            response.forEach ((pairObject) => {
                const tradingPairName = Object.keys (pairObject)[0];
                const details = pairObject[tradingPairName];
                if (tradingPairName && details) {
                    tickers.push ({
                        'trading_pair': tradingPairName,
                        'base_id': this.safeInteger (details, 'base_id'),
                        'quote_id': this.safeInteger (details, 'quote_id'),
                        'last_price': this.safeString (details, 'last_price'),
                        'quote_volume': this.safeFloat (details, 'quote_volume'),
                        'base_volume': this.safeFloat (details, 'base_volume'),
                        'isFrozen': this.safeInteger (details, 'isFrozen'),
                    });
                }
            });
        } else {
            console.warn ('Response is not an array!', response);
        }
        return tickers;
    }

    /**
     * Parses the summary response data into a more structured format.
     * @param {object} response - The raw response from the API.
     * @returns {object} The structured summary data.
     */
    parseCurrencies (response: any) {
        const currencies: {[key: string]: any} = {};
        if (Array.isArray (response)) {
            response.forEach ((item: any) => {
                const currencyId = this.safeString (item, 'symbol');
                if (currencyId) {
                    currencies[currencyId] = {
                        'id': this.safeInteger (item, 'id'),
                        'name': this.safeString (item, 'name'),
                        'priceDecimals': this.safeInteger (item, 'priceDecimals'),
                        'hasTax': this.safeBool (item, 'hasTax'),
                        'isPausable': this.safeBool (item, 'isPausable'),
                        'depositsDisabled': this.safeBool (item, 'depositsDisabled'),
                        'withdrawalsDisabled': this.safeBool (item, 'withdrawalsDisabled'),
                        'tradesDisabled': this.safeBool (item, 'tradesDisabled'),
                        'type': this.safeString (item, 'type'),
                        'bondingCurvePool': this.safeBool (item, 'bondingCurvePool'),
                        'symbol': this.safeString (item, 'symbol'),
                        'deploymentStatus': this.safeString (item, 'deploymentStatus'),
                        'blocked': this.safeBool (item, 'blocked'),
                        'quiet': this.safeBool (item, 'quiet'),
                        'availableContentReward': this.safeBool (item, 'availableContentReward'),
                        'bondingCurveType': this.safeBool (item, 'bondingCurveType'),
                    };
                }
            });
        }
        return currencies;
    }

    /**
     * Parses the summary response data into a more structured format.
     * @param {object} response - The raw response from the API.
     * @returns {object} The structured summary data.
     */
    parseCurrencyName (response: any) {
        if (!response) {
            return null;
        }
        let networks = [];
        if (Array.isArray (response.networks)) {
            networks = response.networks;
        }
        return {
            'id': this.safeInteger (response, 'id'),
            'name': this.safeString (response, 'name'),
            'priceDecimals': this.safeInteger (response, 'priceDecimals'),
            'hasTax': this.safeBool (response, 'hasTax'),
            'isPausable': this.safeBool (response, 'isPausable'),
            'depositsDisabled': this.safeBool (response, 'depositsDisabled'),
            'withdrawalsDisabled': this.safeBool (response, 'withdrawalsDisabled'),
            'tradesDisabled': this.safeBool (response, 'tradesDisabled'),
            'type': this.safeString (response, 'type'),
            'bondingCurvePool': this.safeString (response, 'bondingCurvePool'),
            'symbol': this.safeString (response, 'symbol'),
            'deploymentStatus': this.safeString (response, 'deploymentStatus'),
            'blocked': this.safeBool (response, 'blocked'),
            'quiet': this.safeBool (response, 'quiet'),
            'availableContentReward': this.safeBool (response, 'availableContentReward'),
            'bondingCurveType': this.safeBool (response, 'bondingCurveType'),
            'networks': networks,
        };
    }

    /**
     * Parses the summary response data into a more structured format.
     * @param {object} response - The raw response from the API.
     * @returns {object} The structured summary data.
     */
    parseMarketInfo (response: any) {
        return {
            'last': response.last,
            'volume': response.volume,
            'open': response.open,
            'close': response.close,
            'high': response.high,
            'low': response.low,
            'deal': response.deal,
            'quote': response.quote,
            'base': response.base,
            'buyDepth': response.buyDepth,
        };
    }

    /**
     * Parses the active market order response data.
     * @param {object} response - The raw response from the API.
     * @returns {object[]} The structured order data.
     */
    parseActiveMarketOrder (response) {
        const parsedOrders = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            let sideValue = 1;
            if (order.side !== 1) {
                sideValue = 2;
            }
            const parsedOrder = {
                'id': order.id,
                'timestamp': order.timestamp,
                'createdTimestamp': order.createdTimestamp,
                'side': sideValue,
                'amount': order.amount,
                'price': order.price,
                'fee': order.fee,
                'market': {
                    'base': {
                        'id': order.market.base.id,
                        'name': order.market.base.name,
                        'priceDecimals': order.market.base.priceDecimals,
                        'isPausable': order.market.base.isPausable,
                        'depositsDisabled': order.market.base.depositsDisabled,
                        'withdrawalsDisabled': order.market.base.withdrawalsDisabled,
                        'tradesDisabled': order.market.base.tradesDisabled,
                        'type': order.market.base.type,
                        'deploymentStatus': order.market.base.deploymentStatus,
                        'blocked': order.market.base.blocked,
                        'quiet': order.market.base.quiet,
                        'availableContentReward': order.market.base.availableContentReward,
                        'bondingCurveType': order.market.base.bondingCurveType,
                    },
                },
                'quote': {
                    'id': order.market.quote.id,
                    'name': order.market.quote.name,
                    'symbol': order.market.quote.symbol,
                },
            };
            parsedOrders.push (parsedOrder);
        }
        return parsedOrders;
    }

    /**
     * Parses the active market order response data.
     * @param {object} response - The raw response from the API.
     * @returns {object[]} The structured order data.
     */
    parseFinishedMarketOrder (response) {
        const parsedOrders = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            let sideValue = 1;
            if (order.side !== 1) {
                sideValue = 2;
            }
            const parsedOrder = {
                'id': order.id,
                'timestamp': order.timestamp,
                'createdTimestamp': order.createdTimestamp,
                'side': sideValue,
                'amount': order.amount,
                'price': order.price,
                'fee': order.fee,
                'market': {
                    'base': {
                        'id': order.market.base.id,
                        'name': order.market.base.name,
                        'priceDecimals': order.market.base.priceDecimals,
                        'isPausable': order.market.base.isPausable,
                        'depositsDisabled': order.market.base.depositsDisabled,
                        'withdrawalsDisabled': order.market.base.withdrawalsDisabled,
                        'tradesDisabled': order.market.base.tradesDisabled,
                        'type': order.market.base.type,
                        'deploymentStatus': order.market.base.deploymentStatus,
                        'blocked': order.market.base.blocked,
                        'quiet': order.market.base.quiet,
                        'availableContentReward': order.market.base.availableContentReward,
                        'bondingCurveType': order.market.base.bondingCurveType,
                    },
                },
                'quote': {
                    'id': order.market.quote.id,
                    'name': order.market.quote.name,
                    'symbol': order.market.quote.symbol,
                },
            };
            parsedOrders.push (parsedOrder);
        }
        return parsedOrders;
    }

    /**
     * Parses the active market order response data.
     * @param {object} response - The raw response from the API.
     * @returns {object[]} The structured order data.
     */
    parseActiveUserOrders (response) {
        const parsedOrders = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            let sideValue = 1;
            if (order.side !== 1) {
                sideValue = 2;
            }
            const parsedOrder = {
                'id': order.id,
                'timestamp': order.timestamp,
                'createdTimestamp': order.createdTimestamp,
                'side': sideValue,
                'amount': order.amount,
                'price': order.price,
                'fee': order.fee,
                'market': {
                    'base': {
                        'id': order.market.base.id,
                        'name': order.market.base.name,
                        'hasTax': order.market.base.hasTax,
                        'isPausable': order.market.base.isPausable,
                        'depositsDisabled': order.market.base.depositsDisabled,
                        'withdrawalsDisabled': order.market.base.withdrawalsDisabled,
                        'tradesDisabled': order.market.base.tradesDisabled,
                        'type': order.market.base.type,
                        'bondingCurvePool': order.market.base.bondingCurvePool,
                        'symbol': order.market.base.symbol,
                        'deploymentStatus': order.market.base.deploymentStatus,
                        'blocked': order.market.base.blocked,
                        'quiet': order.market.base.quiet,
                        'availableContentReward': order.market.base.availableContentReward,
                        'priceDecimals': order.market.base.priceDecimals,
                        'bondingCurveType': order.market.base.bondingCurveType,
                        'network': [
                            order.market.base.symbol,
                            order.market.quote,
                        ],
                    },
                },
                'quote': {
                    'id': order.market.quote.id,
                    'name': order.market.quote.name,
                    'symbol': order.market.quote.symbol,
                },
            };
            parsedOrders.push (parsedOrder);
        }
        return parsedOrders;
    }

    /**
     * Parses the active market order response data.
     * @param {object} response - The raw response from the API.
     * @returns {object[]} The structured order data.
     */
    parseFinishedUserOrders (response) {
        const parsedOrders = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            let sideValue = 1;
            if (order.side !== 1) {
                sideValue = 2;
            }
            const parsedOrder = {
                'dealOrderId': order.dealOrderId,
                'orderId': order.orderId,
                'id': order.id,
                'timestamp': order.timestamp,
                'createdTimestamp': order.createdTimestamp,
                'side': sideValue,
                'amount': order.amount,
                'price': order.price,
                'fee': order.fee,
                'market': {
                    'base': {
                        'id': order.market.base.id,
                        'name': order.market.base.name,
                        'hasTax': order.market.base.hasTax,
                        'isPausable': order.market.base.isPausable,
                        'depositsDisabled': order.market.base.depositsDisabled,
                        'withdrawalsDisabled': order.market.base.withdrawalsDisabled,
                        'tradesDisabled': order.market.base.tradesDisabled,
                        'type': order.market.base.type,
                        'bondingCurvePool': order.market.base.bondingCurvePool,
                        'symbol': order.market.base.symbol,
                        'deploymentStatus': order.market.base.deploymentStatus,
                        'blocked': order.market.base.blocked,
                        'quiet': order.market.base.quiet,
                        'availableContentReward': order.market.base.availableContentReward,
                        'priceDecimals': order.market.base.priceDecimals,
                        'bondingCurveType': order.market.base.bondingCurveType,
                        'network': [
                            order.market.base.symbol,
                            order.market.quote,
                        ],
                    },
                },
                'quote': {
                    'id': order.market.quote.id,
                    'name': order.market.quote.name,
                    'symbol': order.market.quote.symbol,
                },
            };
            parsedOrders.push (parsedOrder);
        }
        return parsedOrders;
    }

    parseUserOrder (order: Dict, market: Market = undefined): Order {
        const timestamp = this.safeInteger (order, 'timestamp');
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': this.safeString (order, 'type'),
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'amount': this.safeString (order, 'amount'),
            'filled': this.safeString (order, 'filled_amount'),
            'remaining': this.safeString (order, 'remaining_amount'),
            'status': this.safeString (order, 'status'),
            'fee': {
                'currency': market['quote'],
                'cost': this.safeString (order, 'fee'),
            },
        }, market);
    }

    parseCompletedOrder (response: any[], symbol: string) {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const trade = response[i];
            result.push ({
                'id': this.safeString (trade, 'trade_id'),
                'symbol': symbol,
                'price': parseFloat (this.safeString (trade, 'price')),
                'amount': parseFloat (this.safeString (trade, 'base_volume')),
                'cost': parseFloat (this.safeString (trade, 'quote_volume')),
                'timestamp': this.safeInteger (trade, 'timestamp'),
                'datetime': this.iso8601 (this.safeInteger (trade, 'timestamp')),
                'side': this.safeString (trade, 'type'),
            });
        }
        return result;
    }

    /**
     * Initiates a withdrawal request.
     * @see https://www.mintme.com/dev/documentation/v2 dev/api/v2/auth/user/wallet/withdraw
     * @param {string} code - The currency code to withdraw.
     * @param {number} amount - The amount to withdraw.
     * @param {string} address - The recipient's blockchain address.
     * @param {string} network - The blockchain network to use.
     * @param {string | undefined} [tag] - Optional tag/memo (only required for some chains).
     * @param {Record<string, any>} params - Additional request parameters.
     * @returns {Promise<Transaction>} A promise resolving to a transaction object.
     * @throws {ExchangeError} If the withdrawal tag is not supported.
     */
    async withdraw (code: string, amount: number, address: string, network: string, tag = undefined, params = {}): Promise<Transaction> {
        try {
            [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
            this.checkAddress (address);
            await this.loadMarkets ();
            const request: Dict = {
                'currency': code,
                'amount': amount,
                'address': address,
                'network': network,
            };
            if (tag !== undefined) {
                throw new ExchangeError (
                    this.id + ' withdraw() does not support the tag argument yet due to a lack of docs on withdrawing on behalf of the exchange.'
                );
            }
            const response = await this.privatePostUserWalletWithdraw (this.extend (request, params));
            return {
                'info': response,
                'id': undefined,
                'txid': undefined,
                'type': undefined,
                'currency': undefined,
                'network': undefined,
                'amount': undefined,
                'status': undefined,
                'timestamp': undefined,
                'datetime': undefined,
                'address': undefined,
                'addressFrom': undefined,
                'addressTo': undefined,
                'tag': undefined,
                'tagFrom': undefined,
                'tagTo': undefined,
                'updated': undefined,
                'comment': undefined,
                'fee': {
                    'currency': undefined,
                    'cost': undefined,
                    'rate': undefined,
                },
            } as Transaction;
        } catch (error: any) {
            if (error.message.indexOf ('Minimum withdrawal amount is') !== -1) {
                throw new ExchangeError (
                    `Withdrawal failed: ${error.message} - Please increase your withdrawal amount.`
                );
            }
            throw new ExchangeError (`Withdrawal failed: ${error.message}`);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                headers['X-API-ID'] = this.apiKey;
                headers['X-API-KEY'] = this.secret;
            } else {
                const nonce = this.nonce ();
                body = this.urlencode (this.extend ({
                    'nonce': nonce,
                    'method': path,
                }, query));
                const signature = this.hmac (this.encode (body), this.encode (this.secret), sha512);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-API-ID': this.apiKey,
                    'X-API-KEY': this.secret,
                    'Sign': signature,
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            throw new Error (`Empty response from server (${httpCode} ${reason})`);
        }
        if (httpCode >= 400) {
            throw new Error (`Http Error: ${httpCode} ${reason}`);
        }
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString (error, 'code');
            const message = this.safeString (error, 'message');
            const feedback = this.id + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions, message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
