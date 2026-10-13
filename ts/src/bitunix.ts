import Exchange from './abstract/bitunix.js';
import type { Int, OrderSide, OrderType, OHLCV, Order, Str, Trade, OrderBook, Balances, Tickers, Ticker, Position, Leverage, Strings, Market, Num, Dict, int, FundingRate, FundingRates } from './base/types.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { ArgumentsRequired, ExchangeError, AuthenticationError, PermissionDenied, BadRequest, BadSymbol, RateLimitExceeded, InsufficientFunds, InvalidOrder, OrderNotFound } from './base/errors.js';

/**
 * @class bitunix
 * @augments Exchange
 */
export default class bitunix extends Exchange {
    override describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitunix',
            'name': 'Bitunix',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 200, // cancel_orders is limited to 5 requests per second
            'precisionMode': TICK_SIZE,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchFundingRate': true,
                'fetchFundingRates': true,
                'fetchLeverage': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://www.bitunix.com/images/logo.png',
                'api': {
                    'public': 'https://fapi.bitunix.com',
                    'private': 'https://fapi.bitunix.com',
                },
                'www': 'https://www.bitunix.com',
                'doc': [
                    'https://www.bitunix.com/api-docs/futures/common/introduction.html',
                ],
                'fees': 'https://www.bitunix.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'api/v1/futures/market/tickers',
                        'api/v1/futures/market/depth',
                        'api/v1/futures/market/kline',
                        'api/v1/futures/market/funding_rate',
                        'api/v1/futures/market/funding_rate/batch',
                        'api/v1/futures/market/trading_pairs',
                        'api/v1/futures/position/get_position_tiers',
                    ],
                },
                'private': {
                    'get': [
                        'api/v1/futures/account',
                        'api/v1/futures/account/get_leverage_margin_mode',
                        'api/v1/futures/position/get_history_positions',
                        'api/v1/futures/position/get_pending_positions',
                        'api/v1/futures/trade/get_pending_orders',
                        'api/v1/futures/trade/get_history_orders',
                        'api/v1/futures/trade/get_history_trades',
                        'api/v1/futures/trade/get_order_detail',
                    ],
                    'post': [
                        'api/v1/futures/account/adjust_position_margin',
                        'api/v1/futures/account/change_leverage',
                        'api/v1/futures/account/change_margin_mode',
                        'api/v1/futures/account/change_position_mode',
                        'api/v1/futures/trade/place_order',
                        'api/v1/futures/trade/cancel_orders',
                        'api/v1/futures/trade/cancel_all_orders',
                        'api/v1/futures/trade/modify_order',
                        'api/v1/futures/trade/batch_order',
                        'api/v1/futures/trade/close_all_position',
                        'api/v1/futures/trade/flash_close_position',
                    ],
                },
            },
            'options': {
                'defaultType': 'swap',
                'defaultMarginMode': 'isolated',
            },
            'exceptions': {
                'exact': {
                    '403': PermissionDenied,
                    '10002': BadRequest,
                    '10003': AuthenticationError,
                    '10004': PermissionDenied,
                    '10005': RateLimitExceeded,
                    '10006': RateLimitExceeded,
                    '10007': AuthenticationError,
                    '20001': BadSymbol,
                    '20003': InsufficientFunds,
                    '20005': BadRequest,
                    '20006': BadRequest,
                    '20007': OrderNotFound,
                    '20008': InsufficientFunds,
                    '20009': BadRequest,
                    '20011': PermissionDenied,
                    '30004': InvalidOrder,
                },
            },
        });
    }

    /**
     * @method
     * @name bitunix#fetchMarkets
     * @description retrieves data on all markets for bitunix
     * @see https://www.bitunix.com/api-docs/futures/market/get_trading_pairs.html
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetApiV1FuturesMarketTradingPairs (params);
        //
        // {
        //   "code": 0,
        //   "data": [
        //     {
        //       "symbol": "BTCUSDT",
        //       "base": "BTC",
        //       "quote": "USDT",
        //       "minTradeVolume": "0.0001",
        //       "basePrecision": 4,
        //       "quotePrecision": 1,
        //       "maxLeverage": 125,
        //       "minLeverage": 1,
        //       "symbolStatus": "OPEN"
        //     }
        //   ]
        // }
        //
        const data = this.safeList (response, 'data', []);
        const result: Market[] = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId) as string;
            const quote = this.safeCurrencyCode (quoteId) as string;
            const symbol = base + '/' + quote + ':' + quote;
            const minAmount = this.safeString (market, 'minTradeVolume');
            const basePrecision = this.safeInteger (market, 'basePrecision', 0);
            const quotePrecision = this.safeInteger (market, 'quotePrecision', 0);
            const maxLeverage = this.safeInteger (market, 'maxLeverage', 1);
            const minLeverage = this.safeInteger (market, 'minLeverage', 1);
            const status = this.safeString (market, 'symbolStatus');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': quoteId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': (status === 'OPEN') && this.safeBool (market, 'isApiSupported', true),
                'contract': true,
                'linear': true,
                'inverse': false,
                'contractSize': this.parseNumber ('1'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'created': undefined,
                'precision': {
                    'amount': this.parseNumber ('1e-' + basePrecision.toString ()),
                    'price': this.parseNumber ('1e-' + quotePrecision.toString ()),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber (minLeverage.toString ()),
                        'max': this.parseNumber (maxLeverage.toString ()),
                    },
                    'amount': {
                        'min': this.parseNumber (minAmount),
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
                'info': market,
            });
        }
        return result;
    }

    /**
     * @method
     * @name bitunix#fetchTicker
     * @description retrieves a ticker for a market
     * @see https://www.bitunix.com/api-docs/futures/market/get_tickers.html
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbols': market['id'],
        };
        const response = await this.publicGetApiV1FuturesMarketTickers (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        if (data.length === 0) {
            return this.safeTicker ({}, market);
        }
        return this.parseTicker (data[0], market);
    }

    /**
     * @method
     * @name bitunix#fetchTickers
     * @description retrieves the ticker for all markets or a list of markets
     * @see https://www.bitunix.com/api-docs/futures/market/get_tickers.html
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of ticker structures indexed by market symbol
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds = [];
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                marketIds.push (market['id']);
            }
            request['symbols'] = marketIds.join (',');
        }
        const response = await this.publicGetApiV1FuturesMarketTickers (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const tickers: Dict[] = [];
        for (let i = 0; i < data.length; i++) {
            const ticker = data[i];
            const marketId = this.safeString (ticker, 'symbol');
            if (marketId !== undefined && this.markets_by_id !== undefined && (marketId in this.markets_by_id)) {
                tickers.push (ticker);
            }
        }
        return this.parseTickers (tickers, symbols);
    }

    /**
     * @method
     * @name bitunix#parseTicker
     * @description parses exchange ticker data into a unified structure
     * @param {object} ticker exchange ticker data
     * @param {object} [market] market metadata
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     * @ignore
     */
    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const last = this.safeString2 (ticker, 'lastPrice', 'last');
        const open = this.safeString (ticker, 'open');
        const baseVolume = this.safeString (ticker, 'baseVol');
        const quoteVolume = this.safeString (ticker, 'quoteVol');
        const timestamp = this.safeInteger (ticker, 'time');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': this.safeString (ticker, 'markPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bitunix#fetchOrderBook
     * @description retrieves the order book for a market
     * @see https://www.bitunix.com/api-docs/futures/market/get_depth.html
     * @param {string} symbol unified market symbol
     * @param {int} [limit] order book limit (1, 5, 15, 50, or 'max')
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            if (limit <= 1) {
                request['limit'] = 1;
            } else if (limit <= 5) {
                request['limit'] = 5;
            } else if (limit <= 15) {
                request['limit'] = 15;
            } else if (limit <= 50) {
                request['limit'] = 50;
            } else {
                request['limit'] = 'max';
            }
        }
        const response = await this.publicGetApiV1FuturesMarketDepth (this.extend (request, params));
        const dataList = this.safeList (response, 'data', []);
        let data = {};
        if (dataList.length > 0) {
            data = dataList[0];
        } else {
            data = this.safeDict (response, 'data', {});
        }
        const timestamp = this.safeInteger (data, 'time');
        return this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
    }

    /**
     * @method
     * @name bitunix#fetchOHLCV
     * @description retrieves historical candlestick data
     * @see https://www.bitunix.com/api-docs/futures/market/get_kline.html
     * @param {string} symbol unified market symbol
     * @param {string} timeframe the length of each candle
     * @param {int} [since] timestamp in ms of the earliest candle
     * @param {int} [limit] the maximum number of candles to return (max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} [timestamp, open, high, low, close, volume] entries
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 200);
        }
        const response = await this.publicGetApiV1FuturesMarketKline (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name bitunix#parseOHLCV
     * @description parses exchange candlestick data into a unified structure
     * @param {object[]} candle exchange candlestick data
     * @param {object} [market] market metadata
     * @returns {int[]} [timestamp, open, high, low, close, volume]
     * @ignore
     */
    override parseOHLCV (candle: Dict, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (candle, 'time'),
            this.safeNumber (candle, 'open'),
            this.safeNumber (candle, 'high'),
            this.safeNumber (candle, 'low'),
            this.safeNumber (candle, 'close'),
            this.safeNumber (candle, 'baseVol'),
        ];
    }

    /**
     * @method
     * @name bitunix#fetchFundingRate
     * @description retrieves the current funding rate for a market
     * @see https://www.bitunix.com/api-docs/futures/market/get_funding_rate.html
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)
     */
    override async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1FuturesMarketFundingRate (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.parseFundingRate (data, market);
    }

    /**
     * @method
     * @name bitunix#fetchFundingRates
     * @description retrieves the current funding rates for all markets
     * @see https://www.bitunix.com/api-docs/futures/market/get_funding_rate_batch.html
     * @param {string[]} [symbols] unified market symbols (unused by bitunix)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of funding rate structures indexed by market symbol
     */
    override async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        const response = await this.publicGetApiV1FuturesMarketFundingRateBatch (params);
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRates (data, symbols);
    }

    /**
     * @method
     * @name bitunix#parseFundingRate
     * @description parses exchange funding rate data into a unified structure
     * @param {object} contract exchange funding rate data
     * @param {object} [market] market metadata
     * @returns {object} a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)
     * @ignore
     */
    override parseFundingRate (contract: any, market: Market = undefined): FundingRate {
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const fundingTime = this.safeInteger (contract, 'nextFundingTime');
        const intervalHours = this.safeInteger (contract, 'fundingInterval');
        const interval = intervalHours === undefined ? undefined : intervalHours.toString () + 'h';
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'nextFundingTimestamp': fundingTime,
            'nextFundingDatetime': this.iso8601 (fundingTime),
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': interval,
        };
    }

    /**
     * Parses an order from Bitunix into a unified CCXT order structure.
     * @param {object} order exchange order response
     * @param {object} [market] market metadata
     * @returns {object} a unified order structure
     */
    override parseOrder (order: Dict, market: Market = undefined): Order {
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (order, 'ctime', 'createTime');
        const status = this.safeString (order, 'status');
        const statuses: Dict = {
            'INIT': 'open',
            'NEW': 'open',
            'PART_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PART_FILLED_CANCELED': 'canceled',
            'EXPIRED': 'canceled',
        };
        const unifiedStatus = this.safeString (statuses, status);
        let side = this.safeStringLower (order, 'side');
        const tradeSide = this.safeStringUpper (order, 'tradeSide');
        if (tradeSide === 'CLOSE' && side !== undefined) {
            side = (side === 'buy') ? 'sell' : 'buy';
        }
        const orderType = this.safeStringLower2 (order, 'orderType', 'type');
        let timeInForce = this.safeStringUpper (order, 'effect');
        const postOnly = timeInForce === 'POST_ONLY';
        if (postOnly) {
            timeInForce = 'PO';
        }
        const amount = this.safeString (order, 'qty');
        const filled = this.safeString (order, 'tradeQty');
        const remaining = (amount !== undefined && filled !== undefined) ? Precise.stringSub (amount, filled) : undefined;
        const price = this.safeString (order, 'price');
        const feeCost = this.safeString (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            if (market !== undefined) {
                feeCurrency = market['settle'];
            }
            fee = { 'cost': this.parseNumber (feeCost), 'currency': feeCurrency };
        }
        const result = this.safeOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': (market !== undefined) ? market['symbol'] : undefined,
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': this.parseNumber (price),
            'triggerPrice': undefined,
            'amount': this.parseNumber (amount),
            'filled': this.parseNumber (filled),
            'remaining': this.parseNumber (remaining),
            'cost': undefined,
            'average': undefined,
            'status': unifiedStatus,
            'fee': fee,
            'trades': undefined,
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'info': order,
        }, market);
        // The API reports the requested limit price, not the executed quote value.
        // safeOrder would otherwise infer cost and average from that limit price.
        result['cost'] = undefined;
        result['average'] = undefined;
        return result;
    }

    /**
     * Fetches USDT futures account balances.
     * @method
     * @name bitunix#fetchBalance
     * @param {object} [params] exchange-specific request parameters
     * @returns {object} a unified balance structure
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = { 'marginCoin': 'USDT' };
        const response = await this.privateGetApiV1FuturesAccount (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const result: Dict = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const currencyId = this.safeString (account, 'marginCoin');
            if (currencyId === undefined) {
                continue;
            }
            const code = this.safeCurrencyCode (currencyId);
            if (code === undefined) {
                continue;
            }
            const accountBalance: Dict = this.account ();
            const free = this.safeString (account, 'available');
            let used = undefined;
            if (('frozen' in account) || ('margin' in account)) {
                const frozen = this.safeString (account, 'frozen', '0');
                const positionMargin = this.safeString (account, 'margin', '0');
                used = Precise.stringAdd (frozen, positionMargin);
            }
            const total = (free !== undefined && used !== undefined) ? Precise.stringAdd (free, used) : free;
            accountBalance['free'] = free;
            accountBalance['used'] = used;
            accountBalance['total'] = total;
            result[code] = accountBalance;
        }
        return this.safeBalance (result);
    }

    /**
     * Creates a Bitunix USDT-margined futures order.
     * In HEDGE mode, callers should pass tradeSide=OPEN/CLOSE; a close request
     * also needs the Bitunix positionId. Unified buy/sell is mapped to Bitunix's
     * position direction when tradeSide is CLOSE.
     * @method
     * @name bitunix#createOrder
     * @param {string} symbol unified market symbol
     * @param {string} type market or limit
     * @param {string} side buy or sell
     * @param {number} amount order amount in base currency
     * @param {number} [price] limit price
     * @param {object} [params] exchange-specific parameters including tradeSide, positionId, reduceOnly, clientId and timeInForce
     * @returns {object} a unified order structure
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a side');
        }
        if (side !== 'buy' && side !== 'sell') {
            throw new InvalidOrder (this.id + ' createOrder() side must be buy or sell');
        }
        if (type !== 'limit' && type !== 'market') {
            throw new InvalidOrder (this.id + ' createOrder() supports limit and market orders only');
        }
        const request: Dict = {
            'symbol': market['id'],
            'qty': this.amountToPrecision (symbol, amount),
            'side': side.toUpperCase (),
            'orderType': type.toUpperCase (),
        };
        if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
            request['effect'] = 'GTC';
        }
        const positionId = this.safeString (params, 'positionId');
        const tradeSide = this.safeStringUpper (params, 'tradeSide');
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        if (tradeSide !== undefined && tradeSide !== 'OPEN' && tradeSide !== 'CLOSE') {
            throw new InvalidOrder (this.id + ' createOrder() tradeSide must be OPEN or CLOSE');
        }
        if (tradeSide === 'CLOSE' && positionId === undefined) {
            throw new ArgumentsRequired (this.id + ' close orders require params.positionId');
        }
        if (tradeSide === 'CLOSE') {
            request['side'] = (side === 'buy') ? 'SELL' : 'BUY';
        }
        if (positionId !== undefined) {
            request['positionId'] = positionId;
        }
        if (tradeSide !== undefined) {
            request['tradeSide'] = tradeSide;
        }
        if (reduceOnly) {
            request['reduceOnly'] = true;
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clientId');
        if (clientOrderId !== undefined) {
            request['clientId'] = clientOrderId;
        }
        let effect = this.safeStringUpper (params, 'timeInForce');
        const postOnly = this.safeBool (params, 'postOnly', false);
        if (postOnly) {
            if (type !== 'limit') {
                throw new InvalidOrder (this.id + ' createOrder() postOnly requires a limit order');
            }
            if (effect !== undefined && effect !== 'PO' && effect !== 'POST_ONLY') {
                throw new InvalidOrder (this.id + ' createOrder() postOnly conflicts with timeInForce');
            }
            effect = 'POST_ONLY';
        } else if (effect === 'PO') {
            effect = 'POST_ONLY';
        }
        if (effect !== undefined) {
            request['effect'] = effect;
        }
        const response = await this.privatePostApiV1FuturesTradePlaceOrder (this.extend (request, this.omit (params, [ 'positionId', 'tradeSide', 'reduceOnly', 'clientOrderId', 'clientId', 'timeInForce', 'postOnly', 'positionMode' ])));
        const data = this.safeDict (response, 'data', {});
        const order = this.extend (data, request);
        order['symbol'] = market['id'];
        order['orderType'] = request['orderType'];
        order['qty'] = request['qty'];
        order['price'] = request['price'];
        return this.parseOrder (order, market);
    }

    /**
     * Cancels one Bitunix futures order.
     * @method
     * @name bitunix#cancelOrder
     * @param {string} id order ID
     * @param {string} symbol unified market symbol
     * @param {object} [params] exchange-specific parameters; clientId may replace id
     * @returns {object} a unified order structure
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market['id'], 'orderList': [ { 'orderId': id } ] };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clientId');
        if (clientOrderId !== undefined) {
            request['orderList'] = [ { 'clientId': clientOrderId } ];
        }
        const response = await this.privatePostApiV1FuturesTradeCancelOrders (this.extend (request, this.omit (params, [ 'clientOrderId', 'clientId' ])));
        const data = this.safeDict (response, 'data', {});
        const failures = this.safeList (data, 'failureList', []);
        if (failures.length > 0) {
            throw new OrderNotFound (this.id + ' cancelOrder() failed: ' + this.json (failures[0]));
        }
        const successes = this.safeList (data, 'successList', []);
        const success = (successes.length > 0) ? successes[0] : {};
        return this.parseOrder (this.extend (success, request), market);
    }

    /**
     * Fetches pending or historical Bitunix orders using the corresponding list endpoint.
     * @param {string} method pending or history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] oldest order timestamp in milliseconds
     * @param {int} [limit] maximum number of orders to return (endpoint maximum 100)
     * @param {object} [params] exchange-specific parameters including skip, endTime and subAccountId for historical orders
     * @returns {Order[]} a list of unified orders
     */
    async requestBitunixOrders (method: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = (limit > 100) ? 100 : limit;
        }
        let response: any = {};
        if (method === 'pending') {
            response = await this.privateGetApiV1FuturesTradeGetPendingOrders (this.extend (request, params));
        } else {
            response = await this.privateGetApiV1FuturesTradeGetHistoryOrders (this.extend (request, params));
        }
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'orderList', []);
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * Fetches one Bitunix futures order by ID.
     * @method
     * @name bitunix#fetchOrder
     * @param {string} id order ID
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] exchange-specific parameters
     * @returns {object} a unified order structure
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = { 'orderId': id };
        const response = await this.privateGetApiV1FuturesTradeGetOrderDetail (this.extend (request, this.omit (params, [ 'symbol' ])));
        const data = this.safeDict (response, 'data', {});
        const market = (symbol === undefined) ? this.safeMarket (this.safeString (data, 'symbol')) : this.market (symbol);
        return this.parseOrder (data, market);
    }

    /**
     * Fetches currently pending futures orders.
     * @method
     * @name bitunix#fetchOpenOrders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] oldest order timestamp in milliseconds
     * @param {int} [limit] maximum number of orders to return
     * @param {object} [params] exchange-specific parameters including skip and endTime
     * @returns {Order[]} a list of unified orders
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        return await this.requestBitunixOrders ('pending', symbol, since, limit, params);
    }

    /**
     * Fetches non-canceled futures order history. Bitunix limits this partition to the last 90 days.
     * @method
     * @name bitunix#fetchClosedOrders
     * @see https://www.bitunix.com/api-docs/futures/trade/get_history_orders.html
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] oldest order timestamp in milliseconds
     * @param {int} [limit] maximum number of orders to return
     * @param {object} [params] exchange-specific parameters including status, skip, endTime and subAccountId
     * @returns {Order[]} a list of unified orders
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        return await this.requestBitunixOrders ('history', symbol, since, limit, params);
    }

    /**
     * Fetches canceled futures orders. Bitunix limits this partition to the last 3 days.
     * @method
     * @name bitunix#fetchCanceledOrders
     * @see https://www.bitunix.com/api-docs/futures/trade/get_history_orders.html
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] oldest order timestamp in milliseconds
     * @param {int} [limit] maximum number of orders to return
     * @param {object} [params] exchange-specific parameters including status, skip, endTime and subAccountId
     * @returns {Order[]} a list of unified orders
     */
    override async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const requestParams: Dict = this.extend (params, { 'queryCanceled': true });
        return await this.requestBitunixOrders ('history', symbol, since, limit, requestParams);
    }

    /**
     * Fetches the authenticated user's futures fills.
     * @method
     * @name bitunix#fetchMyTrades
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] oldest fill timestamp in milliseconds
     * @param {int} [limit] maximum number of fills to return (endpoint maximum 100)
     * @param {object} [params] exchange-specific parameters including orderId, positionId, skip and endTime
     * @returns {Trade[]} a list of unified trades
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = (limit > 100) ? 100 : limit;
        }
        const response = await this.privateGetApiV1FuturesTradeGetHistoryTrades (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const trades = this.safeList (data, 'tradeList', []);
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * Parses one Bitunix futures fill into a unified CCXT trade structure.
     * @param {object} trade exchange fill response
     * @param {object} [market] market metadata
     * @returns {object} a unified trade structure
     */
    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const amount = this.safeString (trade, 'qty');
        const price = this.safeString (trade, 'price');
        const cost = (amount !== undefined && price !== undefined) ? Precise.stringMul (amount, price) : undefined;
        const feeCost = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'cost': this.parseNumber (feeCost), 'currency': (market !== undefined) ? market['settle'] : undefined };
        }
        const timestamp = this.safeInteger (trade, 'ctime');
        let side = this.safeStringLower (trade, 'side');
        if (this.safeStringUpper (trade, 'tradeSide') === 'CLOSE' && side !== undefined) {
            side = (side === 'buy') ? 'sell' : 'buy';
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'tradeId'),
            'order': this.safeString (trade, 'orderId'),
            'symbol': (market !== undefined) ? market['symbol'] : undefined,
            'side': side,
            'type': this.safeStringLower (trade, 'orderType'),
            'takerOrMaker': this.safeStringLower (trade, 'roleType'),
            'price': price,
            'amount': amount,
            'cost': cost,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        }, market);
    }

    /**
     * Parses a Bitunix open position into a unified CCXT position structure.
     * @param {object} position exchange position response
     * @param {object} [market] market metadata
     * @returns {object} a unified position structure
     */
    override parsePosition (position: Dict, market: Market = undefined): Position {
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const side = this.safeStringLower (position, 'side');
        const rawMarginMode = this.safeString (position, 'marginMode');
        let marginMode = undefined;
        if (rawMarginMode === 'ISOLATION') {
            marginMode = 'isolated';
        } else if (rawMarginMode === 'CROSS') {
            marginMode = 'cross';
        }
        const contracts = this.safeString (position, 'qty');
        const entryPrice = this.safeString2 (position, 'avgOpenPrice', 'entryPrice');
        const markPrice = this.safeString (position, 'markPrice');
        const unrealizedPnl = this.safeString (position, 'unrealizedPNL');
        const notional = (contracts !== undefined && markPrice !== undefined) ? Precise.stringMul (contracts, markPrice) : undefined;
        const timestamp = this.safeInteger (position, 'ctime');
        const leverage = this.safeString (position, 'leverage');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': (market !== undefined) ? market['symbol'] : undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'side': side,
            'contracts': this.parseNumber (contracts),
            'contractSize': (market !== undefined) ? market['contractSize'] : undefined,
            'entryPrice': this.parseNumber (entryPrice),
            'markPrice': this.parseNumber (markPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'collateral': this.safeNumber (position, 'margin'),
            'initialMargin': this.safeNumber (position, 'margin'),
            'maintenanceMargin': undefined,
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'liquidationPrice': this.safeNumber (position, 'liqPrice'),
            'marginMode': marginMode,
            'percentage': undefined,
            'lastUpdateTimestamp': this.safeInteger (position, 'mtime'),
            'hedged': this.safeString (position, 'positionMode') === 'HEDGE',
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'marginRatio': this.safeNumber (position, 'marginRate'),
        });
    }

    /**
     * Fetches open futures positions.
     * @method
     * @name bitunix#fetchPositions
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] exchange-specific parameters including subAccountId and includeSubAccounts
     * @returns {Position[]} a list of unified positions
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        if (symbols !== undefined && symbols.length === 1) {
            request['symbol'] = this.marketId (symbols[0]);
        }
        const response = await this.privateGetApiV1FuturesPositionGetPendingPositions (this.extend (request, params));
        const positions = this.safeList (response, 'data', []);
        return this.parsePositions (positions, symbols);
    }

    /**
     * Fetches leverage and margin mode for a futures market.
     * @method
     * @name bitunix#fetchLeverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] exchange-specific parameters
     * @returns {object} a unified leverage structure
     */
    override async fetchLeverage (symbol: string, params: Dict = {}): Promise<Leverage> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const response = await this.privateGetApiV1FuturesAccountGetLeverageMarginMode (this.extend ({ 'symbol': market['id'], 'marginCoin': market['settleId'] }, params));
        const data = this.safeDict (response, 'data', {});
        const leverage = this.safeString (data, 'leverage');
        const rawMarginMode = this.safeString (data, 'marginMode');
        let marginMode = undefined;
        if (rawMarginMode === 'ISOLATION') {
            marginMode = 'isolated';
        } else if (rawMarginMode === 'CROSS') {
            marginMode = 'cross';
        }
        return {
            'info': data,
            'symbol': market['symbol'],
            'marginMode': marginMode,
            'longLeverage': this.parseNumber (leverage),
            'shortLeverage': this.parseNumber (leverage),
        } as Leverage;
    }

    /**
     * Sets the leverage for a futures market.
     * @method
     * @name bitunix#setLeverage
     * @param {int} leverage leverage multiplier
     * @param {string} symbol unified market symbol
     * @param {object} [params] exchange-specific parameters
     * @returns {object} exchange response
     */
    override async setLeverage (leverage: int, symbol: Str = undefined, params: Dict = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market['id'], 'leverage': leverage, 'marginCoin': market['settleId'] };
        return await this.privatePostApiV1FuturesAccountChangeLeverage (this.extend (request, params));
    }

    /**
     * Sets cross or isolated margin mode for a futures market.
     * @method
     * @name bitunix#setMarginMode
     * @param {string} marginMode cross or isolated
     * @param {string} symbol unified market symbol
     * @param {object} [params] exchange-specific parameters
     * @returns {object} exchange response
     */
    override async setMarginMode (marginMode: string, symbol: Str = undefined, params: Dict = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        if (marginMode !== 'cross' && marginMode !== 'isolated') {
            throw new BadRequest (this.id + ' setMarginMode() marginMode must be cross or isolated');
        }
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market['id'], 'marginMode': (marginMode === 'isolated') ? 'ISOLATION' : 'CROSS', 'marginCoin': market['settleId'] };
        return await this.privatePostApiV1FuturesAccountChangeMarginMode (this.extend (request, params));
    }

    /**
     * Changes position mode for all Bitunix futures markets. The exchange rejects
     * this request while positions or orders exist.
     * @method
     * @name bitunix#setPositionMode
     * @see https://www.bitunix.com/api-docs/futures/account/change_position_mode.html
     * @param {bool} hedged true for hedge mode, false for one-way mode
     * @param {string} [symbol] unsupported because Bitunix changes all futures markets
     * @param {object} [params] exchange-specific parameters
     * @returns {object} exchange response
     */
    override async setPositionMode (hedged: boolean, symbol: Str = undefined, params: Dict = {}) {
        if (symbol !== undefined) {
            throw new BadRequest (this.id + ' setPositionMode() changes all futures markets; omit symbol');
        }
        const request: Dict = this.extend (params, { 'positionMode': hedged ? 'HEDGE' : 'ONE_WAY' });
        return await this.privatePostApiV1FuturesAccountChangePositionMode (request);
    }

    override sign (path: string, api = 'public', method = 'GET', params: Dict = {}, headers: Dict = {}, body: Str = undefined): Dict {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length > 0) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.uuid16 () + this.uuid16 ();
            const timestamp = this.milliseconds ().toString ();
            let queryString = '';
            let bodyString = '';
            if (method === 'GET') {
                const filteredParams: Dict = {};
                const paramKeys = Object.keys (params);
                for (let i = 0; i < paramKeys.length; i++) {
                    const key = paramKeys[i];
                    const value = this.safeValue (params, key);
                    if (value !== undefined && value !== null && value !== '') {
                        let stringValue = this.safeString (params, key);
                        if (stringValue === undefined) {
                            stringValue = this.json (value);
                        }
                        filteredParams[key] = stringValue;
                    }
                }
                const sortedParams = this.keysort (filteredParams);
                const keys = Object.keys (sortedParams);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    queryString += key + sortedParams[key];
                }
                if (Object.keys (sortedParams).length > 0) {
                    url += '?' + this.urlencode (sortedParams);
                }
            } else if (method === 'POST') {
                if (Object.keys (params).length > 0) {
                    body = this.json (params);
                    bodyString = body;
                }
            }
            const digestInput = nonce + timestamp + this.apiKey + queryString + bodyString;
            const digest = this.hash (this.encode (digestInput), sha256, 'hex');
            const signInput = digest + this.secret;
            const signature = this.hash (this.encode (signInput), sha256, 'hex');
            headers = {
                'api-key': this.apiKey,
                'sign': signature,
                'nonce': nonce,
                'timestamp': timestamp,
                'language': 'en-US',
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any {
        if (response === undefined || response === null) {
            return undefined;
        }
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== undefined && errorCode !== '0') {
            const message = this.safeString (response, 'msg', 'Unknown error');
            const feedback = this.id + ' ' + errorCode + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
