
//  ---------------------------------------------------------------------------

import Exchange from './abstract/deepcoin.js';
import {
    ArgumentsRequired,
    ExchangeError,
} from './base/errors.js';
import {
    OrderSide,
    OrderType,
    Num,
    Dict,
    int,
    Market,
    Order,
    Strings,
    Tickers,
    Ticker,
    MarketType, Int, OrderBook, Str, OHLCV, Balances, Trade,
} from './base/types.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { TICK_SIZE } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class deepcoin
 * @augments Exchange
 */
export default class deepcoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deepcoin',
            'name': 'deepcoin',
            'version': 'v1',
            'countries': [ 'SG' ],
            'rateLimit': 1000,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1H': '1H',
                '2H': '2H',
                '4H': '4H',
                '12H': '12H',
                '1D': '1D',
                '1W': '1W',
                '1M': '1M',
                '1Y': '1Y',
            },
            'urls': {
                'logo': 'https://www.deepcoin.com/static/images/nav-logo-black-7ad2482d753feb3.svg',
                'api': {
                    'v1': {
                        'public': 'https://api.deepcoin.com', // 'https://test-api.goodtest.cc', // 'https://api.deepcoin.com/',
                        'private': 'https://test-api.goodtest.cc',
                    },
                },
                'www': 'https://www.deepcoin.com',
                'doc': 'https://www.deepcoin.com/en/docs',
            },
            'precisionMode': TICK_SIZE,
            'api': {
                'v1': {
                    'private': {
                        'post': [
                            'deepcoin/trade/cancel-order',
                            'deepcoin/trade/order',
                        ],
                        'get': [
                            'deepcoin/trade/orders-pending',
                            'deepcoin/trade/orders-history',
                            'deepcoin/trade/order',
                            'deepcoin/trade/fills',
                            'deepcoin/account/balances',
                        ],
                    },
                    'public': {
                        'get': [
                            'deepcoin/market/instruments',
                            'deepcoin/market/tickers',
                            'deepcoin/market/books',
                            'deepcoin/market/candles',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    // 'tierBased': false,
                    // 'percentage': true,
                    // 'taker': this.parseNumber ('0.001'),
                    // 'maker': this.parseNumber ('0.001'),
                },
            },
            'exceptions': {
                'exact': {},
                'broad': {
                },
            },
        });
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deepcoin#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://www.deepcoin.com/en/docs#deepcoin-trade-fills
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {string} [params.instType] Instrument type. 'SPOT' or 'SWAP', 'SPOT' by default
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'instType': this.safeString (params, 'instType', 'SPOT'),
        };
        if (since !== undefined) {
            request['begin'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetDeepcoinTradeFills (this.extend (request, params));
        const result = this.safeList (response, 'data', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name deepcoin#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {string} [params.instType] Instrument type. 'SPOT' or 'SWAP', 'SPOT' by default
         * @param {object} [params.ccy] currency, eg:'USDT'
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        const request: Dict = {
            'instType': this.safeString (params, 'instType', 'SPOT'),
        };
        const response = await this.v1PrivateGetDeepcoinAccountBalances (this.extend (request, params));
        return this.parseBalance (response);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) : Promise<Order> {
        /**
         * @method
         * @name deepcoin#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            'ordId': id,
        };
        const response = await this.v1PrivateGetDeepcoinTradeOrder (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        if (data.length === 0) {
            return this.safeOrder ({});
        }
        return this.parseOrder (this.extend (request, params, data[0]));
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) : Promise<Order[]> {
        /**
         * @method
         * @name delta#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://www.deepcoin.com/en/docs#deepcoin-trade-orders-history
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {string} [params.instType] Instrument type. 'SPOT' or 'SWAP', 'SPOT' by default
         * @param {string} [params.ordType] Order type. 'market': Market order,'limit': Limit order,'post_only': Post-only order
         * @param {string} [params.state] State. 'live' or 'partially_filled'
         * @param {string} [params.after] Pagination of data to return records earlier than the requested ordId, eg:"1000314896749646
         * @param {string} [params.before] Pagination of data to return records newer than the requested ordId, eg:"1000314896749646
         * @param {object} [params.ordId] order id
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request: Dict = {
            'instType': this.safeString (params, 'instType', 'SPOT'),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetDeepcoinTradeOrdersHistory (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push (this.parseOrder (this.extend (request, params, data[i])));
        }
        return result;
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) : Promise<Order[]> {
        /**
         * @method
         * @name deepcoin#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://www.deepcoin.com/en/docs#deepcoin-trade-orders-pending
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {string} [params.instType] Instrument type. 'SPOT' or 'SWAP', 'SPOT' by default
         * @param {string} [params.ordType] Order type. 'market': Market order,'limit': Limit order,'post_only': Post-only order
         * @param {string} [params.state] State. 'live' or 'partially_filled'
         * @param {string} [params.after] Pagination of data to return records earlier than the requested ordId, eg:"1000314896749646
         * @param {string} [params.before] Pagination of data to return records newer than the requested ordId, eg:"1000314896749646
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const ordType = this.safeString (params, 'ordType');
        const state = this.safeString (params, 'state');
        const after = this.safeString (params, 'after');
        const before = this.safeString (params, 'before');
        const request: Dict = {
            'instType': this.safeString (params, 'instType', 'SPOT'),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (ordType !== undefined) {
            request['ordType'] = ordType;
        }
        if (state !== undefined) {
            request['state'] = state;
        }
        if (after !== undefined) {
            request['after'] = after;
        }
        if (before !== undefined) {
            request['before'] = before;
        }
        const response = await this.v1PrivateGetDeepcoinTradeOrdersPending (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push (this.parseOrder (this.extend (request, params, data[i])));
        }
        return result;
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) : Promise<OHLCV[]> {
        /**
         * @method
         * @name deepcoin#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.deepcoin.com/en/docs#deepcoin-market-candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume(base units)
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            'bar': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['before'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetDeepcoinMarketCandles (this.extend (request, params));
        const result = this.safeList (response, 'data', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = 10, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name deepcoin#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.deepcoin.com/en/docs#deepcoin-market-books
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            'sz': limit,
        };
        const response = await this.v1PublicGetDeepcoinMarketBooks (this.extend (request, params));
        const result = this.safeDict (response, 'data', {});
        return this.parseOrderBook (result, market['symbol'], undefined);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name deepcoin#fetchTicker
         * @description fetches price tickers for multiple data, statistical information calculated over the past 24 hours for each market
         * @see https://www.deepcoin.com/en/docs#deepcoin-market-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://www.deepcoin.com/en/docs#deepcoin-market-tickers}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instType': this.marketTypeToInstType (market['type']),
            'instId': market['id'],
        };
        const response = await this.v1PublicGetDeepcoinMarketTickers (this.extend (request, params));
        const tickers = this.safeList (response, 'data', []);
        let result: Dict = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            result[ticker['symbol']] = ticker;
        }
        result = this.filterByArrayTickers (result, 'symbol', [ symbol ]);
        return result[symbol];
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name deepcoin#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://www.deepcoin.com/en/docs#deepcoin-market-tickers
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://www.deepcoin.com/en/docs#deepcoin-market-tickers}
         */
        const request: Dict = {
            'instType': this.safeString (params, 'instType', 'SPOT'),
        };
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.v1PublicGetDeepcoinMarketTickers (this.extend (request, params));
        const tickers = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name deepcoin#fetchMarkets
         * @description retrieves data on all markets for deepcoin
         * @see https://www.deepcoin.com/en/docs#deepcoin-market-instruments
         * @param {string} [params.uly] Underlying. Only applicable to SWAP
         * @param {string} [params.instId] Instrument ID
         * @returns {object[]} an array of objects representing market data
         */
        const instTypes = [ 'SPOT', 'SWAP' ];
        const result = [];
        for (let j = 0; j < instTypes.length; j++) {
            const request: Dict = {
                'instType': instTypes[j],
            };
            const response = await this.v1PublicGetDeepcoinMarketInstruments (this.extend (request, params));
            const markets = this.safeList (response, 'data', []);
            for (let i = 0; i < markets.length; i++) {
                result.push (this.parseMarket (markets[i]));
            }
        }
        return result;
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#createOrder
         * @description create a trade order
         * @see https://www.deepcoin.com/en/docs#deepcoin-trade-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {string} [params.tdMode] Margin mode 'cross', isolated Non-Margin mode 'cash', 'cash' by default
         * @param {string} [params.ccy] Margin currency. Only applicable to cross MARGIN orders in Single-currency margin. eg:'USDT'
         * @param {string} [params.clOrdId] client order id as assigned by the client, A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters
         * @param {string} [params.ccy] Margin currency. Only applicable to cross MARGIN orders in Single-currency margin. eg:'USDT'
         * @param {string} [params.tag]  Order tag. A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters
         * @param {string} [params.posSide] Position side. 'long' or 'short'
         * @param {string} [params.mrgPosition] Margin position. 'merge' or 'split'
         * @param {string} [params.closePosId] Waiting for closing split margin positions. Required in split margin mode. eg:'1001063717138767'
         * @param {string} [params.reduceOnly] Whether the order can only reduce the position size. Valid options: 'true' or 'false'. The default value is 'false'. Only applicable to MARGIN orders, and FUTURES/SWAP orders in net mode Only applicable to Single-currency margin and Multi-currency margin
         * @param {string} [params.tgtCcy] Quantity type. 'base_ccy': Base currency, 'quote_ccy': Quote currency, Only applicable to SPOT Market Orders Default is 'quote_ccy' for buy, 'base_ccy' for sell
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tdMode = this.safeString (params, 'tdMode', 'cash');
        const request: Dict = {
            'instId': market['id'],
            'side': side,
            'sz': amount,
            'tdMode': tdMode,
            'ordType': type,
            'px': price,
        };
        const response = await this.v1PrivatePostDeepcoinTradeOrder (this.extend (request, params));
        const result = this.safeDict (response, 'data', {});
        return this.parseOrder (this.extend (request, params, result));
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name deepcoin#cancelOrder
         * @description cancels an open order
         * @see https://www.deepcoin.com/en/docs#deepcoin-trade-cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {string} [params.clOrdId] client order id as assigned by the client, A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            'ordId': id,
        };
        const response = await this.v1PrivatePostDeepcoinTradeCancelOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const orderId = this.safeString (trade, 'ordId');
        const timestamp = this.safeNumber (trade, 'ts');
        const fee = {
            'cost': this.safeString (trade, 'fee'),
            'currency': this.safeString (trade, 'feeCcy'),
        };
        return this.safeTrade ({
            'info': trade,
            'id': orderId,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeStringUpper (trade, 'instId'),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'price': this.safeNumber (trade, 'fillPx'),
            'amount': this.safeNumber (trade, 'fillSz'),
            'cost': undefined,
            'takerOrMaker': this.safeStringUpper (trade, 'execType'),
            'fee': fee,
        }, market);
    }

    parseBalance (response): Balances {
        const balances = this.safeList (response, 'data', []);
        const result: Dict = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeString (balance, 'ccy');
            const account = this.account ();
            account['total'] = this.safeString (balance, 'bal');
            account['free'] = this.safeString (balance, 'availBal');
            account['used'] = this.safeString (balance, 'frozenBal');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeNumber (ticker, 'ts', 0.001);
        // const last = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeStringUpper (ticker, 'instId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high24h'),
            'low': this.safeNumber (ticker, 'low24h'),
            'bid': this.safeNumber (ticker, 'bidPx'),
            'bidVolume': this.safeNumber (ticker, 'bidSz'),
            'ask': this.safeNumber (ticker, 'askPx'),
            'askVolume': this.safeNumber (ticker, 'askSz'),
            'vwap': undefined, // volume weighed average price
            'open': this.safeString (ticker, 'open24h'),
            'close': this.safeNumber (ticker, 'last'),  // price of last trade (closing price for current period)
            'last': this.safeNumber (ticker, 'last'),  // same as `close`, duplicated for convenience
            'previousClose': undefined,  // closing price for the previous period
            'baseVolume': this.safeNumber (ticker, 'volCcy24h'),    // volume of base currency traded for last 24 hours
            'quoteVolume': this.safeNumber (ticker, 'vol24h'),  // volume of quote currency traded for last 24 hours
        }, market);
    }

    parseMarket (market: Dict): Market {
        const instType = this.safeString (market, 'instType');
        const id = this.safeString (market, 'instId');
        let isSpot = false;
        let isSwap = false;
        let isContract = false;
        let type: MarketType;
        if (instType === 'SPOT') {
            isSpot = true;
            type = 'spot';
        } else if (instType === 'SWAP') {
            isSwap = true;
            isContract = true;
            type = 'swap';
        }
        // const uly = this.safeString (market, 'uly');
        const base = this.safeStringUpper (market, 'baseCcy');
        const quote = this.safeStringUpper (market, 'quoteCcy');
        const state = this.safeString (market, 'state');
        const active = state === 'live';
        const contractSize = this.safeNumber (market, 'ctVal');
        const settle = this.safeString (market, 'ctValCcy');
        const created = this.safeNumber (market, 'listTime');
        const maxLever = this.safeNumber (market, 'lever');
        const minSz = this.safeNumber (market, 'minSz');
        const ctType = this.safeString (market, 'ctType');
        // const alias = this.safeString (market, 'alias');
        // const maxLmtSz = this.safeString (market, 'maxLmtSz');
        // const maxMktSz = this.safeString (market, 'maxMktSz');
        const pricePrecision = this.safeNumber (market, 'tickSz');
        const amountPrecision = this.safeNumber (market, 'lotSz');
        return {
            'info': market,
            'id': id,                           // string literal for referencing within an exchange
            'symbol': this.safeStringUpper (market, 'instId'),                   // uppercase string literal of a pair of currencies
            'base': base,                       // uppercase string, unified base currency code, 3 or more letters
            'quote': quote,                     // uppercase string, unified quote currency code, 3 or more letters
            'baseId': base,                     // any string, exchange-specific base currency id
            'quoteId': quote,                   // any string, exchange-specific quote currency id
            'active': active,                   // boolean, market status
            'type': type,                       // spot for spot, future for expiry futures, swap for perpetual swaps, 'option' for options
            'spot': isSpot,                     // whether the market is a spot market
            'margin': undefined,                // whether the market is a margin market
            'future': undefined,                // whether the market is a expiring future
            'swap': isSwap,                     // whether the market is a perpetual swap
            'option': undefined,                // whether the market is an option contract
            'contract': isContract,              // whether the market is a future, a perpetual swap, or an option
            'settle': settle,                // the unified currency code that the contract will settle in, only set if `contract` is true
            'settleId': settle,              // the currencyId of that the contract will settle in, only set if `contract` is true
            'contractSize': contractSize,          // the size of one contract, only used if `contract` is true
            'linear': ctType === 'linear',      // the contract is a linear contract (settled in quote currency)
            'inverse': ctType === 'inverse',               // the contract is an inverse contract (settled in base currency)
            'expiry': undefined,                // the unix expiry timestamp in milliseconds, undefined for everything except market['type'] `future`
            'expiryDatetime': undefined,        // The datetime contract will in iso8601 format
            'strike': undefined,                // price at which a put or call option can be exercised
            'optionType': undefined,            // call or put string, call option represents an option with the right to buy and put an option with the right to sell
            'taker': undefined,                 // taker fee rate, 0.002 = 0.2%
            'maker': undefined,                 // maker fee rate, 0.0016 = 0.16%
            'percentage': undefined,            // whether the taker and maker fee rate is a multiplier or a fixed flat amount
            'tierBased': undefined,             // whether the fee depends on your trading tier (your trading volume)
            'feeSide': undefined,               // string literal can be 'get', 'give', 'base', 'quote', 'other'
            'precision': {                      // number of decimal digits "after the dot"
                'price': pricePrecision,            // integer or float for tick_size roundingMode, might be missing if not supplied by the exchange
                'amount': amountPrecision,          // integer, might be missing if not supplied by the exchange
                'cost': undefined,                  // integer, very few exchanges actually have it
            },
            'limits': {                         // value limits when placing orders on this market
                'amount': {
                    'min': minSz,    // order amount should be > min
                    'max': undefined,                   // order amount should be < max
                },
                'price': {          // same min/max limits for the price of the order
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {           // same limits for order cost = price * amount
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {           // same limits for order cost = price * amount
                    'min': undefined,
                    'max': maxLever,
                },
            },
            'created': created,
        };
    }

    parseStatus (state: string): string {
        if (state === 'live' || state === 'partially_filled') {
            return 'open';
        } else if (state === 'filled') {
            return 'closed';
        } else if (state === 'canceled') {
            return 'canceled';
        } else {
            return undefined;
        }
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const timestamp = this.safeNumber (order, 'cTime');
        const lastTradeTimestamp = this.safeNumber (order, 'fillTime');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'ordId'),
            'symbol': this.safeStringUpper (order, 'instId'),
            'clientOrderId': this.safeString (order, 'clOrdId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': this.parseStatus (this.safeString (order, 'state')),
            'timeInForce': undefined,                                              // 'GTC', 'IOC', 'FOK', 'PO'
            'side': this.safeString (order, 'side'),
            'type': this.safeString (order, 'ordType'),                         // 'market', 'limit'
            'price': this.safeNumber (order, 'px'),                             // float price in quote currency (may be empty for market orders)
            'average': this.safeNumber (order, 'avgPx'),                        // float average filling price
            'amount': this.safeNumber (order, 'sz'),                            // ordered amount of base currency
            'filled': this.safeNumber (order, 'accFillSz'),                     // filled amount of base currency
            'remaining': undefined,                                                 // remaining amount to fill
            'cost': undefined,                                                      // 'filled' * 'price' (filling price used where available)
            'fee': {
                'currency': this.safeString (order, 'feeCcy'),
                'cost': this.safeNumber (order, 'fee'),
            },
            // stopPrice?: number;
            // triggerPrice?: number;
            // 'takeProfitPrice': this.safeNumber (order, 'tpOrdPx'),
            // 'stopLossPrice': this.safeNumber (order, 'slOrdPx'),
            // reduceOnly: Bool;
            'postOnly': this.safeString (order, 'ordType') === 'post_only',
            'trades': undefined,
        });
    }

    marketTypeToInstType (type: string): string {
        return type.toUpperCase ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeValue (api as any, 0);
        const accessibility = this.safeValue (api as any, 1);
        const query = this.urlencode (params);
        const timestamp = this.iso8601 (this.milliseconds ());
        let url = this.urls['api'][version][accessibility] + '/' + path;
        let payload = timestamp + method + '/' + path;
        if (method === 'GET') {
            url += '?' + query;
            payload += '?' + query;
        } else if (method === 'POST') {
            body = this.json (params);
            payload += body;
        }
        if (accessibility === 'private') {
            const secret = this.secret;
            const signature = this.hmac (this.encode (payload), this.encode (secret), sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'DC-ACCESS-KEY': this.apiKey,
                'DC-ACCESS-SIGN': signature,
                'DC-ACCESS-TIMESTAMP': timestamp,
                'DC-ACCESS-PASSPHRASE': this.password,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeString2 (response, 'sCode', 'code');
        const errorMsg = this.safeString2 (response, 'sMsg', 'msg');
        if (errorCode !== undefined && errorCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMsg, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
