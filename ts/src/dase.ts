//  ---------------------------------------------------------------------------

import Exchange from './abstract/dase.js';
import { TICK_SIZE } from './base/functions/number.js';
import { BadRequest, AuthenticationError, PermissionDenied, DDoSProtection, ExchangeNotAvailable, ExchangeError, ArgumentsRequired, InsufficientFunds, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Dict, Int, Market, Order, OrderBook, Strings, Ticker, Tickers, Trade, OHLCV, Balances, OrderType, OrderSide, Num, Str, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class dase
 * @augments Exchange
 */
export default class dase extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'dase',
            'name': 'DASE Exchange',
            'countries': [ 'EU' ],
            'rateLimit': 200,
            'version': 'v1',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': undefined,
                'api': {
                    'rest': 'https://api.dase.com/v1',
                },
                'www': 'https://www.dase.com',
                'doc': 'https://api.dase.com/docs',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/stats',
                        'markets/{market}/ticker',
                        'markets/{market}/snapshot',
                        'markets/{market}/trades',
                        'markets/{market}/candles',
                        'status',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'orders',
                        'orders/{order_id}',
                        'accounts/transactions',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{order_id}',
                        'orders/',
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'timeframes': { '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m', '1h': '1h', '2h': '2h', '6h': '6h', '1d': '1d' },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0020'),
                    'maker': this.parseNumber ('0.0015'),
                },
            },
            'features': {},
            'exceptions': {
                'exact': {
                    'InternalError': ExchangeNotAvailable,
                    'NotFound': ExchangeError,
                    'InsufficientFunds': InsufficientFunds,
                    'InvalidInput': BadRequest,
                    'InvalidId': InvalidOrder,
                    'InvalidIdFormat': InvalidOrder,
                    'InvalidNumberFormat': BadRequest,
                    'Unauthorized': AuthenticationError,
                    'Forbidden': PermissionDenied,
                    'PayloadTooLarge': BadRequest,
                    'ServiceStarting': ExchangeNotAvailable,
                    'ServiceRestarting': ExchangeNotAvailable,
                    'ServiceUnavailable': ExchangeNotAvailable,
                    'ServiceReadOnly': ExchangeNotAvailable,
                    'ServiceCancelOnly': ExchangeNotAvailable,
                    'ServicePostOnly': ExchangeNotAvailable,
                    'ServiceShuttingDown': ExchangeNotAvailable,
                    'TooManyRequests': DDoSProtection,
                    'MarketOrdersDisabled': InvalidOrder,
                    'InvalidSignature': AuthenticationError,
                    'InvalidApiKey': AuthenticationError,
                    'InvalidSignatureData': AuthenticationError,
                    'MissingMessageData': BadRequest,
                    'InvalidObjectState': ExchangeError,
                },
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name dase#fetchMarkets
     * @description retrieves data on all markets for dase
     * @see https://api.dase.com/docs#tag/markets/get/v1/markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarkets (params);
        //
        //     [
        //         {
        //             "market":"BTC-EUR",
        //             "description":"Bitcoin/Euro",
        //             "base":"BTC",
        //             "size_precision":8,
        //             "quote":"EUR",
        //             "price_precision":2,
        //             "market_order_price_slippage":"0.15",
        //             "min_order_size":"0.0001",
        //             "min_funds":"10"
        //         }
        //     ]
        //
        const markets = (Array.isArray (response)) ? response : this.safeValue (response, 'markets', []);
        const result: Market[] = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'market');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            let base = this.safeCurrencyCode (baseId);
            let quote = this.safeCurrencyCode (quoteId);
            if ((base === undefined || quote === undefined) && (id !== undefined)) {
                const parts = id.split ('-');
                if (parts.length === 2) {
                    base = this.safeCurrencyCode (parts[0]);
                    quote = this.safeCurrencyCode (parts[1]);
                }
            }
            const amountPrecision = this.safeString (market, 'size_precision');
            const pricePrecision = this.safeString (market, 'price_precision');
            const minOrderSize = this.safeNumber (market, 'min_order_size');
            const minFunds = this.safeNumber (market, 'min_funds');
            const fallbackId = (base !== undefined && quote !== undefined) ? (base + '-' + quote) : undefined;
            const fallbackSymbol = (base !== undefined && quote !== undefined) ? (base + '/' + quote) : undefined;
            result.push ({
                'id': (id !== undefined) ? id : fallbackId,
                'symbol': fallbackSymbol,
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
                    'amount': this.parseNumber (this.parsePrecision (amountPrecision)),
                    'price': this.parseNumber (this.parsePrecision (pricePrecision)),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minOrderSize,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minFunds,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            } as Market);
        }
        return result;
    }

    parseBalance (response): Balances {
        const items = (Array.isArray (response)) ? response : this.safeList (response, 'balances', []);
        const result: Dict = { 'info': response };
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const currencyId = this.safeString (item, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (item, 'available');
            account['used'] = this.safeString (item, 'blocked');
            account['total'] = this.safeString (item, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name dase#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.dase.com/docs#tag/balances/get/v1/balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await (this as any).privateGetBalances (params);
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name dase#createOrder
     * @description create a trade order
     * @see https://api.dase.com/docs#tag/orders/post/v1/orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'side': side,
            'type': type,
        };
        const postOnly = this.safeBool (params, 'postOnly');
        params = this.omit (params, [ 'postOnly' ]);
        if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            if (amount === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires an amount for limit orders');
            }
            request['size'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
            if (postOnly) {
                request['post_only'] = true;
            }
        } else {
            const funds = this.safeString2 (params, 'funds', 'cost');
            if (funds !== undefined) {
                request['funds'] = this.costToPrecision (symbol, funds);
                params = this.omit (params, [ 'funds', 'cost' ]);
            } else {
                if (amount === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires either params.funds (quote) or amount (base) for market orders');
                }
                request['size'] = this.amountToPrecision (symbol, amount);
            }
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_id');
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'client_id' ]);
        }
        const response = await (this as any).privatePostOrders (this.extend (request, params));
        // { order_id: "uuid" }
        const id = this.safeString (response, 'order_id');
        return this.safeOrder ({
            'info': response,
            'id': id,
        }, market);
    }

    /**
     * @method
     * @name dase#cancelOrder
     * @description cancels an open order
     * @see https://api.dase.com/docs#tag/orders/delete/v1/orders/{order_id}
     * @param {string} id order id
     * @param {string} symbol not used by dase cancelOrder()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pathParams = { 'order_id': id };
        const response = await (this as any).privateDeleteOrdersOrderId (pathParams);
        // 204 No Content is expected; return minimal order object without forcing status
        return this.safeOrder ({
            'info': response,
            'id': id,
            'symbol': (market === undefined) ? undefined : market['symbol'],
        }, market);
    }

    /**
     * @method
     * @name dase#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api.dase.com/docs#tag/orders/delete/v1/orders/
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await (this as any).privateDeleteOrders (this.extend (request, params));
        // 204 No Content is expected; return minimal order structure
        return [
            this.safeOrder ({
                'info': response,
                'symbol': (market === undefined) ? undefined : market['symbol'],
            }, market),
        ];
    }

    /**
     * @method
     * @name dase#fetchStatus
     * @description fetches the current status of all markets and overall exchange
     * @see https://api.dase.com/docs#tag/status/get/v1/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.publicGetStatus (params);
        //
        //     [
        //         { "market": "BTC-EUR", "status": "running" },
        //         { "market": "ETH-EUR", "status": "running" }
        //     ]
        //  or
        //     { "markets": [ { "market": "BTC-EUR", "status": "running" } ] }
        //
        const items = (Array.isArray (response)) ? response : this.safeValue (response, 'markets', []);
        let allRunning = true;
        for (let i = 0; i < items.length; i++) {
            const st = this.safeString (items[i], 'status');
            if (st !== 'running') {
                allRunning = false;
                break;
            }
        }
        return {
            'status': allRunning ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name dase#fetchTicker
     * @description fetches a price ticker, a statistical calculation with latest market data
     * @see https://api.dase.com/docs#tag/markets/get/v1/markets/{market}/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'market': market['id'] };
        const response = await this.publicGetMarketsMarketTicker (this.extend (request, params));
        //
        //     {
        //         "time": "1719354237834.784",
        //         "ask": "50001.0",
        //         "bid": "49999.0",
        //         "volume": "100.0",
        //         "price": "50000.0",
        //         "size": "0.5"
        //     }
        //
        let timestamp = this.safeInteger (response, 'time');
        if (timestamp === undefined) {
            const t = this.safeNumber (response, 'time');
            if (t !== undefined) {
                timestamp = this.parseToInt (t);
            }
        }
        const last = this.safeNumber (response, 'price');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (response, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (response, 'ask'),
            'vwap': undefined,
            'askVolume': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (response, 'volume'),
            'quoteVolume': undefined,
            'info': response,
        }, market);
    }

    /**
     * @method
     * @name dase#fetchTickers
     * @description fetches price tickers for multiple markets
     * @see https://api.dase.com/docs#tag/markets/get/v1/markets/stats
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketsStats (params);
        //
        //     [
        //         {
        //             "market": "BTC-EUR",
        //             "last_price": "50000.0",
        //             "open_24h": "48000.0",
        //             "high_24h": "51000.0",
        //             "low_24h": "47000.0",
        //             "volume_24h": "100.0"
        //         }
        //     ]
        //  or
        //     { "stats": [ { ... } ] }
        //
        const stats = (Array.isArray (response)) ? response : this.safeValue (response, 'stats', []);
        const result: Dict = {};
        for (let i = 0; i < stats.length; i++) {
            const item = stats[i];
            const marketId = this.safeString (item, 'market');
            const market = this.safeMarket (marketId, undefined, '-');
            const last = this.safeNumber (item, 'last_price');
            const open = this.safeNumber (item, 'open_24h');
            const high = this.safeNumber (item, 'high_24h');
            const low = this.safeNumber (item, 'low_24h');
            const baseVolume = this.safeNumber (item, 'volume_24h');
            const ticker = this.safeTicker ({
                'symbol': market['symbol'],
                'timestamp': undefined,
                'datetime': undefined,
                'high': high,
                'low': low,
                'bid': undefined,
                'bidVolume': undefined,
                'ask': undefined,
                'vwap': undefined,
                'askVolume': undefined,
                'open': open,
                'close': last,
                'last': last,
                'previousClose': undefined,
                'change': undefined,
                'percentage': undefined,
                'average': undefined,
                'baseVolume': baseVolume,
                'quoteVolume': undefined,
                'info': item,
            }, market);
            result[market['symbol']] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    /**
     * @method
     * @name dase#fetchOrderBook
     * @description fetches order book snapshot (bids/asks) for a market
     * @see https://api.dase.com/docs#tag/markets/get/v1/markets/{market}/snapshot
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'market': market['id'] };
        const response = await this.publicGetMarketsMarketSnapshot (this.extend (request, params));
        //
        //     {
        //         "timestamp": "1719354237834.784",
        //         "bids": [[49999.0, 1.5], [49998.0, 2.0]],
        //         "asks": [[50001.0, 1.0], [50002.0, 1.5]],
        //         "event_id": 123456
        //     }
        //
        let timestamp = this.safeInteger (response, 'timestamp');
        if (timestamp === undefined) {
            const t = this.safeNumber (response, 'timestamp');
            if (t !== undefined) {
                timestamp = this.parseToInt (t);
            }
        }
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const marketId = this.safeString (trade, 'market');
        market = this.safeMarket (marketId, market, '-');
        const id = this.safeString (trade, 'id');
        // server may return millisecond timestamps as floats or strings with decimals
        let timestamp = this.safeInteger (trade, 'time');
        if (timestamp === undefined) {
            const timeNumber = this.safeNumber (trade, 'time');
            if (timeNumber !== undefined) {
                timestamp = this.parseToInt (timeNumber);
            }
        }
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'size');
        const side = this.safeStringLower (trade, 'side');
        const makerSide = this.safeStringLower (trade, 'maker_side');
        let takerOrMaker = undefined;
        if ((makerSide !== undefined) && (side !== undefined) && (makerSide !== side)) {
            takerOrMaker = 'taker';
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': (timestamp === undefined) ? undefined : this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name dase#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.dase.com/docs#tag/accounts/get/v1/accounts/transactions
     * @param {string} symbol unified market symbol
     * @param {int} [since] not used by dase fetchMyTrades()
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {};
        if (limit !== undefined) {
            const minLimit = 1;
            const maxLimit = 100;
            request['limit'] = Math.max (minLimit, Math.min (limit, maxLimit));
        }
        const before = this.safeString (params, 'before');
        if (before !== undefined) {
            request['before'] = before;
            params = this.omit (params, [ 'before' ]);
        }
        const response = await (this as any).privateGetAccountsTransactions (this.extend (request, params));
        const items = this.safeList (response, 'transactions', response);
        const grouped: Dict = {};
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            const tradeId = this.safeString (entry, 'trade_id');
            if (tradeId === undefined) {
                continue;
            }
            const txnType = this.safeString (entry, 'txn_type');
            const isFill = (txnType !== undefined) ? (txnType.indexOf ('trade_fill_') === 0) : false;
            if (!isFill) {
                continue;
            }
            if (!(tradeId in grouped)) {
                grouped[tradeId] = [];
            }
            grouped[tradeId].push (entry);
        }
        const tradeIds = Object.keys (grouped);
        const trades: Trade[] = [];
        for (let i = 0; i < tradeIds.length; i++) {
            const tradeId = tradeIds[i];
            const fills = grouped[tradeId];
            if (!Array.isArray (fills)) {
                continue;
            }
            let tradeMarket = market;
            let timestamp = undefined;
            let side = undefined;
            let orderId = undefined;
            let baseSize = '0';
            let quoteCost = '0';
            let feeCurrency = undefined;
            let feeCost = '0';
            for (let j = 0; j < fills.length; j++) {
                const fill = fills[j];
                const createdAt = this.safeInteger (fill, 'created_at');
                if (timestamp === undefined || ((createdAt !== undefined) && (createdAt < timestamp))) {
                    timestamp = createdAt;
                }
                const marketIdFromTx = this.safeString2 (fill, 'market', 'market_id');
                if (marketIdFromTx !== undefined) {
                    tradeMarket = this.safeMarket (marketIdFromTx, tradeMarket, '-');
                }
                const orderIdCandidate = this.safeString (fill, 'order_id');
                if (orderIdCandidate !== undefined) {
                    orderId = orderIdCandidate;
                }
                const txnType = this.safeString (fill, 'txn_type');
                const amountString = this.safeString (fill, 'amount');
                const currencyId = this.safeString (fill, 'currency');
                if (txnType === 'trade_fill_credit_base' || txnType === 'trade_fill_debit_base') {
                    if (txnType === 'trade_fill_credit_base') {
                        side = 'buy';
                    } else if (txnType === 'trade_fill_debit_base') {
                        side = 'sell';
                    }
                    if (amountString !== undefined) {
                        baseSize = Precise.stringAdd (baseSize, Precise.stringAbs (amountString));
                    }
                } else if (txnType === 'trade_fill_credit_quote' || txnType === 'trade_fill_debit_quote') {
                    if (txnType === 'trade_fill_credit_quote') {
                        side = 'sell';
                    } else if (txnType === 'trade_fill_debit_quote') {
                        side = 'buy';
                    }
                    if (amountString !== undefined) {
                        quoteCost = Precise.stringAdd (quoteCost, Precise.stringAbs (amountString));
                    }
                } else if ((txnType === 'trade_fill_fee_base') || (txnType === 'trade_fill_fee_quote')) {
                    feeCurrency = this.safeCurrencyCode (currencyId);
                    if (amountString !== undefined) {
                        feeCost = Precise.stringAdd (feeCost, Precise.stringAbs (amountString));
                    }
                }
            }
            const amount = this.parseNumber (baseSize);
            let cost = undefined;
            let price = undefined;
            if (!Precise.stringEquals (quoteCost, '0')) {
                cost = this.parseNumber (quoteCost);
                if (!Precise.stringEquals (baseSize, '0')) {
                    price = this.parseNumber (Precise.stringDiv (quoteCost, baseSize));
                }
            }
            const trade: Trade = this.safeTrade ({
                'id': tradeId,
                'info': fills,
                'timestamp': timestamp,
                'datetime': (timestamp === undefined) ? undefined : this.iso8601 (timestamp),
                'symbol': (tradeMarket === undefined) ? undefined : tradeMarket['symbol'],
                'type': undefined,
                'side': side,
                'order': orderId,
                'takerOrMaker': undefined,
                'price': price,
                'amount': amount,
                'cost': cost,
                'fee': (feeCurrency === undefined || Precise.stringEquals (feeCost, '0')) ? undefined : {
                    'currency': feeCurrency,
                    'cost': this.parseNumber (feeCost),
                },
            }, tradeMarket);
            trades.push (trade);
        }
        const sortedTrades = this.sortBy (trades, 'timestamp');
        return this.filterBySymbolSinceLimit (sortedTrades, symbol, since, limit);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        // DASE ApiOrder example fields (from docs schemas):
        // {
        //   id, market, type, side, filled, filled_cost, filled_price,
        //   status, created_at, price?, size?, funds?, client_id?, reason?
        // }
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market, '-');
        const id = this.safeString (order, 'id');
        const timestamp = this.safeInteger (order, 'created_at');
        const side = this.safeStringLower (order, 'side');
        const type = this.safeStringLower (order, 'type');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'filled');
        const cost = this.safeString (order, 'filled_cost');
        const average = this.safeString (order, 'filled_price');
        const status = this.safeString (order, 'status');
        const clientOrderId = this.safeString (order, 'client_id');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'trades': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name dase#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.dase.com/docs#tag/trades/get/v1/markets/{market}/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'market': market['id'] };
        if (limit !== undefined) {
            const minLimit = 1;
            const maxLimit = 100;
            const bounded = Math.max (minLimit, Math.min (limit, maxLimit));
            request['limit'] = bounded;
        }
        const before = this.safeString (params, 'before');
        if (before !== undefined) {
            // pass-through cursor/id unchanged to avoid surprising normalization
            request['before'] = before;
            params = this.omit (params, [ 'before' ]);
        }
        const response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        //
        //     {
        //         "trades": [
        //             {
        //                 "time": "1719347541953",
        //                 "id": "12345678-1234-1234-1234-123456789abc",
        //                 "price": "50000.0",
        //                 "size": "0.5",
        //                 "side": "buy"
        //             }
        //         ]
        //     }
        //  or a plain array
        //
        const trades = (Array.isArray (response)) ? response : this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * @method
     * @name dase#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.dase.com/docs#tag/orders/get/v1/orders/{order_id}
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pathParams = { 'order_id': id };
        const response = await (this as any).privateGetOrdersOrderId (pathParams);
        const order = this.safeDict (response, 'order', response);
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name dase#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.dase.com/docs#tag/orders/get/v1/orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            const minLimit = 1;
            const maxLimit = 100;
            request['limit'] = Math.max (minLimit, Math.min (limit, maxLimit));
        }
        const before = this.safeString (params, 'before');
        if (before !== undefined) {
            request['before'] = before;
            params = this.omit (params, [ 'before' ]);
        }
        const status = this.safeString (params, 'status');
        if (status !== undefined) {
            request['status'] = status;
            params = this.omit (params, [ 'status' ]);
        }
        const response = await (this as any).privateGetOrders (this.extend (request, params));
        const list = this.safeList (response, 'orders', []);
        return this.parseOrders (list, market, since, limit);
    }

    /**
     * @method
     * @name dase#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.dase.com/docs#tag/orders/get/v1/orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] not used by dase fetchOpenOrders()
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = { 'status': 'open' };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            const minLimit = 1;
            const maxLimit = 100;
            request['limit'] = Math.max (minLimit, Math.min (limit, maxLimit));
        }
        const before = this.safeString (params, 'before');
        if (before !== undefined) {
            request['before'] = before;
            params = this.omit (params, [ 'before' ]);
        }
        const response = await (this as any).privateGetOrders (this.extend (request, params));
        const list = this.safeList (response, 'orders', []);
        return this.parseOrders (list, market, since, limit);
    }

    /**
     * @method
     * @name dase#fetchClosedOrders
     * @description fetches information on multiple canceled or filled orders made by the user
     * @see https://api.dase.com/docs#tag/orders/get/v1/orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = { 'status': 'closed' };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            const minLimit = 1;
            const maxLimit = 100;
            request['limit'] = Math.max (minLimit, Math.min (limit, maxLimit));
        }
        const before = this.safeString (params, 'before');
        if (before !== undefined) {
            request['before'] = before;
            params = this.omit (params, [ 'before' ]);
        }
        const response = await (this as any).privateGetOrders (this.extend (request, params));
        const list = this.safeList (response, 'orders', response);
        return this.parseOrders (list, market, since, limit);
    }

    /**
     * @method
     * @name dase#fetchOHLCV
     * @description fetches a list of OHLCV candles for a market
     * @see https://api.dase.com/docs#tag/markets/get/v1/markets/{market}/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV for
     * @param {string} [timeframe] timeframe string mapped to API granularity
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OHLCV[]} a list of [OHLCV structures]{@link https://docs.ccxt.com/#/?id=ohlcv-structure}
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const allowed = { '1m': true, '5m': true, '15m': true, '30m': true, '1h': true, '2h': true, '6h': true, '1d': true } as Dict;
        const resolvedTimeframe = (timeframe in allowed) ? timeframe : '1m';
        const request: Dict = { 'market': market['id'], 'granularity': resolvedTimeframe };
        // API requires both 'from' and 'to'. Compute sensible defaults if missing.
        const durationMs = this.parseTimeframe (resolvedTimeframe) * 1000;
        const now = this.milliseconds ();
        const fromParam = this.safeNumber (params, 'from');
        const toParam = this.safeNumber (params, 'to');
        params = this.omit (params, [ 'from', 'to' ]);
        let fromMs: Int = undefined;
        let toMs: Int = undefined;
        if ((fromParam !== undefined) || (toParam !== undefined)) {
            if (fromParam !== undefined) {
                fromMs = this.parseToInt (fromParam);
            }
            if (toParam !== undefined) {
                toMs = this.parseToInt (toParam);
            }
            // If only one bound provided, infer the other using limit or reasonable default
            const candles = (limit === undefined) ? 500 : limit;
            if (fromMs === undefined && toMs !== undefined) {
                fromMs = toMs - candles * durationMs;
            }
            if (toMs === undefined && fromMs !== undefined) {
                toMs = (limit !== undefined) ? (fromMs + candles * durationMs) : now;
            }
        } else {
            if (since !== undefined) {
                fromMs = since;
                const candles = (limit === undefined) ? 500 : limit;
                toMs = (limit !== undefined) ? (fromMs + candles * durationMs) : now;
            } else {
                const candles = (limit === undefined) ? 500 : limit;
                toMs = now;
                fromMs = toMs - candles * durationMs;
            }
        }
        request['from'] = fromMs;
        request['to'] = toMs;
        const response = await this.publicGetMarketsMarketCandles (this.extend (request, params));
        //
        // Endpoint returns array of candles for a given market
        // Candles are returned in tuple format: [time, open, high, low, close, volume]
        //
        //     {
        //         "candles": [
        //             [1716288360000.0,"19989.9","19993.7","19984.8","19993.7","0.35570574"],
        //             [1716288420000.0,"19984.4","19984.4","19982.4","19982.4","0.1661198"]
        //         ]
        //     }
        //
        const list = this.safeValue (response, 'candles', []);
        const result: OHLCV[] = [];
        for (let i = 0; i < list.length; i++) {
            const ohlcv = list[i];
            let ts = this.safeInteger (ohlcv, 0);
            if (ts === undefined) {
                const t = this.safeNumber (ohlcv, 0);
                if (t !== undefined) {
                    ts = this.parseToInt (t);
                }
            }
            const open = this.safeNumber (ohlcv, 1);
            const high = this.safeNumber (ohlcv, 2);
            const low = this.safeNumber (ohlcv, 3);
            const close = this.safeNumber (ohlcv, 4);
            const volume = this.safeNumber (ohlcv, 5);
            result.push ([ ts, open, high, low, close, volume ]);
        }
        // Local fallback filters (should be redundant when 'from'/'to' are sent)
        let filtered = result;
        if (since !== undefined) {
            filtered = this.filterBySinceLimit (result, since, undefined, 0, true);
        }
        if (limit !== undefined) {
            filtered = filtered.slice (-limit);
        }
        return filtered;
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback
        }
        if ((code >= 200) && (code <= 299)) {
            return undefined;
        }
        const responseType = this.safeString (response, 'type');
        const message = this.safeString (response, 'message', body);
        const feedback = this.id + ' ' + message;
        if (responseType !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], responseType, feedback);
        }
        if (code >= 500) {
            throw new ExchangeNotAvailable (feedback);
        }
        if (code === 429) {
            throw new DDoSProtection (feedback);
        }
        if (code === 404) {
            throw new ExchangeError (feedback);
        }
        if (code === 403) {
            throw new PermissionDenied (feedback);
        }
        if (code === 401) {
            throw new AuthenticationError (feedback);
        }
        throw new BadRequest (feedback);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const pathWithParams = this.implodeParams (path, params);
        let url = this.urls['api']['rest'] + '/' + pathWithParams;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const versionedPath = '/v1/' + pathWithParams;
            const hasQuery = Object.keys (query).length > 0;
            const queryString = hasQuery ? ('?' + this.urlencode (query)) : '';
            const timestamp = this.milliseconds ().toString ();
            const upperMethod = method.toUpperCase ();
            let payload = '';
            if (upperMethod === 'GET') {
                if (hasQuery) {
                    url += queryString;
                }
            } else {
                if (hasQuery) {
                    body = this.json (query);
                    payload = body;
                }
                headers = (headers === undefined) ? {} : headers;
                headers['Content-Type'] = 'application/json';
            }
            const requestPath = versionedPath + ((upperMethod === 'GET' && hasQuery) ? queryString : '');
            const auth = timestamp + upperMethod + requestPath + payload;
            const signature = this.hmac (this.encode (auth), this.base64ToBinary (this.secret), sha256, 'base64');
            headers = (headers === undefined) ? {} : headers;
            headers['ex-api-key'] = this.apiKey;
            headers['ex-api-sign'] = signature;
            headers['ex-api-timestamp'] = timestamp;
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        }
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
