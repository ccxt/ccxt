
// ---------------------------------------------------------------------------

import Exchange from './abstract/mudrex.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import type { Balances, Dict, Int, Leverage, MarginModification, Market, Num, OHLCV, Order, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TransferEntry, int } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class mudrex
 * @augments Exchange
 */
export default class mudrex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'mudrex',
            'name': 'Mudrex',
            'countries': [ 'IN' ],
            'rateLimit': 100, // 10 req/s default
            'version': 'v1',
            'pro': true,
            'certified': false,
            'dex': false,
            'hostname': 'trade.mudrex.com',
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelOrder': true,
                'closePosition': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
                'reduceMargin': true,
                'setLeverage': true,
                'transfer': true,
                'watchOHLCV': true,
                'watchTicker': true,
                'watchTickers': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/b4eb2663-e31b-4fbf-ab2b-8716a506720f',
                'api': {
                    'public': 'https://trade.mudrex.com/fapi/v1',
                    'private': 'https://trade.mudrex.com/fapi/v1',
                    'market': 'https://trade.mudrex.com/fapi/v1',
                },
                'www': 'https://mudrex.com',
                'doc': 'https://docs.trade.mudrex.com/docs',
                'fees': 'https://docs.trade.mudrex.com',
            },
            'api': {
                'market': {
                    'get': {
                        'price/kline': 1,
                        'price/mark-kline': 1,
                    },
                },
                'public': {
                    'get': {
                    },
                },
                'private': {
                    'get': {
                        'futures': 1,
                        'futures/{asset_id}': 1,
                        'wallet/funds': 5,
                        'futures/funds': 5,
                        'futures/orders': 1,
                        'futures/orders/history': 1,
                        'futures/orders/{order_id}': 1,
                        'futures/positions': 1,
                        'futures/positions/history': 1,
                        'futures/fee/history': 1,
                        'futures/{asset_id}/leverage': 2,
                        'futures/positions/{position_id}/liq-price': 1,
                    },
                    'post': {
                        'wallet/futures/transfer': 5,
                        'futures/transfers/inr': 5,
                        'futures/{asset_id}/order': 2,
                        'futures/positions/{position_id}/close': 2,
                        'futures/positions/{position_id}/close/partial': 2,
                        'futures/positions/{position_id}/reverse': 2,
                        'futures/positions/{position_id}/add-margin': 2,
                        'futures/positions/{position_id}/riskorder': 2,
                        'futures/{asset_id}/leverage': 2,
                    },
                    'patch': {
                        'futures/orders/{order_id}': 1,
                        'futures/positions/{position_id}/riskorder': 2,
                    },
                    'delete': {
                        'futures/orders/{order_id}': 2,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': true,
            },
            'options': {
                'broker': '42ce8902-8585-448c-a1e8-0371a6ca7ca8',
            },
            'exceptions': {
                'exact': {
                    '400 Invalid trade currency': BadRequest,
                },
                'broad': {
                    'Invalid trade currency': BadRequest,
                    'Params error': BadRequest,
                    'invalid trigger type': BadRequest,
                    'invalid order type': BadRequest,
                    'order price out of permissible range': BadRequest,
                    'quantity not a multiple of the quantity step': BadRequest,
                    'leverage out of permissible range': BadRequest,
                    'insufficient balance': InsufficientFunds,
                    'asset not found': BadSymbol,
                    'leverage not found': OrderNotFound,
                    'order not found': OrderNotFound,
                    'Rate limit exceeded': RateLimitExceeded,
                },
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const apiUrls = this.safeDict (this.urls, 'api', {});
        const base = this.safeString (apiUrls, api);
        if (base === undefined) {
            throw new ExchangeError (this.id + ' unknown API namespace: ' + api);
        }
        let url = base + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = (headers !== undefined) ? this.extend ({}, headers) : {};
        const brokerId = this.safeString (this.options, 'broker');
        if (brokerId !== undefined) {
            headers['Partner-Id'] = brokerId;
        }
        const methodUpper = method.toUpperCase ();
        if (api === 'private') {
            this.checkRequiredCredentials ();
            headers['X-Authentication'] = this.secret;
            if (methodUpper === 'POST' || methodUpper === 'PATCH' || methodUpper === 'DELETE') {
                headers['Content-Type'] = 'application/json';
                // is_symbol is a query-string flag even on write requests
                const isSymbol = this.safeString (query, 'is_symbol');
                if (isSymbol !== undefined) {
                    query = this.omit (query, 'is_symbol');
                    url += '?' + this.urlencode ({ 'is_symbol': isSymbol });
                }
                if (methodUpper === 'DELETE' && Object.keys (query).length === 0) {
                    return { 'url': url, 'method': methodUpper, 'body': undefined, 'headers': headers };
                }
                const bodyStr = this.json (query);
                return { 'url': url, 'method': methodUpper, 'body': bodyStr, 'headers': headers };
            }
        }
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': methodUpper, 'body': undefined, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined || typeof response !== 'object') {
            return undefined;
        }
        const success = this.safeBool (response, 'success', true);
        if (!success) {
            const errors = this.safeList (response, 'errors', []);
            const first = this.safeDict (errors, 0, {});
            const text = this.safeString (first, 'text', this.json (response));
            const errCode = this.safeString (first, 'code');
            this.throwExactlyMatchedException (this.exceptions['exact'], text, this.id + ' ' + text);
            this.throwExactlyMatchedException (this.exceptions['exact'], errCode, this.id + ' ' + text);
            this.throwBroadlyMatchedException (this.exceptions['broad'], text, this.id + ' ' + text);
            const msg = this.id + ' ' + text;
            const low = text.toLowerCase ();
            if (code === 401 || low.indexOf ('auth') >= 0) {
                throw new AuthenticationError (msg);
            }
            if (code === 429 || low.indexOf ('rate') >= 0) {
                throw new RateLimitExceeded (msg);
            }
            if (low.indexOf ('insufficient') >= 0) {
                throw new InsufficientFunds (msg);
            }
            if (code === 400) {
                throw new BadRequest (msg);
            }
            throw new ExchangeError (msg);
        }
        return undefined;
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeTimestamp (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ms = market['baseId'] + '/' + market['quoteId'];
        const priceType = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        const request: Dict = {
            'symbol': ms,
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = Math.floor (since / 1000);
            request['end_time'] = Math.floor (this.milliseconds () / 1000);
        }
        let response = undefined;
        if (priceType === 'mark') {
            response = await this.marketGetPriceMarkKline (this.extend (request, params));
        } else {
            response = await this.marketGetPriceKline (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchMarkOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (params, { 'price': 'mark' }));
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'asset_id': market['id'],
        };
        const response = await this.privateGetFuturesAssetId (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateGetFutures (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const rows = Array.isArray (data) ? data : this.safeList (data, 'items', []);
        const resultTickers: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const t = rows[i];
            const sym = this.safeString (t, 'symbol');
            if (sym === undefined) {
                continue;
            }
            const m = this.safeMarket (sym);
            const symbol = m['symbol'];
            if (symbols !== undefined && !this.inArray (symbol, symbols)) {
                continue;
            }
            resultTickers[symbol] = this.parseTicker (t, m);
        }
        return this.filterByArrayTickers (resultTickers, 'symbol', symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const ms = this.safeString (ticker, 'symbol');
        market = this.safeMarket (ms, market);
        const symbol = market['symbol'];
        const ts = this.milliseconds ();
        const pct = this.safeNumber (ticker, 'change_perc');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'last_day_price'),
            'close': this.safeNumber (ticker, 'price'),
            'last': this.safeNumber (ticker, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': pct,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeNumber (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        const aggregated = [];
        let offset = 0;
        const pageLimit = 100;
        let paging = true;
        while (paging) {
            const q = this.extend ({ 'limit': pageLimit, 'offset': offset }, params);
            const response = await this.privateGetFutures (q);
            const data = this.safeValue (response, 'data', []);
            let items = [];
            if (typeof data === 'object' && !Array.isArray (data)) {
                items = this.safeList (data, 'items', []);
                if (!items.length) {
                    items = this.safeList (data, 'results', []);
                }
                if (!items.length && ('symbol' in data)) {
                    items = [ data ];
                }
            } else {
                items = this.toArray (data);
            }
            if (!items.length) {
                paging = false;
                break;
            }
            for (let i = 0; i < items.length; i++) {
                aggregated.push (items[i]);
            }
            if (items.length < pageLimit) {
                paging = false;
            } else {
                offset += pageLimit;
            }
        }
        const result = [];
        for (let i = 0; i < aggregated.length; i++) {
            result.push (this.parseMarket (aggregated[i]));
        }
        return result;
    }

    parseMarket (asset: Dict): Market {
        const ms = this.safeString (asset, 'symbol');
        let base = ms;
        if (ms !== undefined && ms.endsWith ('USDT')) {
            base = ms.slice (0, -4);
        }
        const quote = 'USDT';
        const settle = 'USDT';
        let symbol = undefined;
        if (base !== undefined) {
            symbol = base + '/' + quote + ':' + settle;
        }
        const priceStep = this.safeString (asset, 'price_step', '0.01');
        const qtyStep = this.safeString (asset, 'quantity_step', '0.001');
        return {
            'id': ms,
            'lowercaseId': undefined,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': 'USDT',
            'settleId': 'USDT',
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': true,
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.safeNumber (asset, 'contract_size', 1),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.precisionFromString (qtyStep),
                'price': this.precisionFromString (priceStep),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber (asset, 'min_contract'),
                    'max': this.safeNumber (asset, 'max_contract'),
                },
                'price': {
                    'min': this.safeNumber (asset, 'min_price'),
                    'max': this.safeNumber (asset, 'max_price'),
                },
                'cost': {
                    'min': this.safeNumber (asset, 'min_notional_value'),
                    'max': undefined,
                },
            },
            'info': asset,
            'created': undefined,
        } as Market;
    }

    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        const spotReq: Dict = {};
        const futReq: Dict = {};
        if (tradeCurrency !== undefined) {
            spotReq['currency'] = tradeCurrency;
            futReq['trade_currency'] = tradeCurrency;
        } else if (params['currency'] !== undefined) {
            spotReq['currency'] = params['currency'];
            futReq['trade_currency'] = params['currency'];
        }
        const p1 = this.omit (params, [ 'trade_currency', 'tradeCurrency', 'currency' ]);
        const spot = await this.privateGetWalletFunds (this.extend (spotReq, p1));
        const fut = await this.privateGetFuturesFunds (this.extend (futReq, p1));
        const currency = this.safeString (spotReq, 'currency', 'USDT');
        return this.parseBalance ({ 'spot': spot, 'futures': fut, 'currency': currency });
    }

    parseBalance (response: any): Balances {
        const spotR = this.safeDict (response, 'spot', {});
        const futR = this.safeDict (response, 'futures', {});
        const futD = this.safeDict (futR, 'data', {});
        const currency = this.safeString (response, 'currency', 'USDT');
        const futBal = this.safeString (futD, 'balance');
        const futLocked = this.safeString (futD, 'locked_amount');
        const timestamp = this.milliseconds ();
        const balance: Dict = {
            'info': [ spotR, futR ],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const account = this.account ();
        account['total'] = futBal;
        account['used'] = futLocked;
        account['free'] = Precise.stringSub (futBal, futLocked);
        balance[currency] = account;
        return this.safeBalance (balance);
    }

    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'asset_id': market['id'],
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency' ]);
        const response = await this.privateGetFuturesAssetIdLeverage (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return {
            'info': response,
            'symbol': symbol,
            'marginMode': this.safeStringLower (data, 'margin_type'),
            'longLeverage': this.safeNumber (data, 'leverage'),
            'shortLeverage': this.safeNumber (data, 'leverage'),
        };
    }

    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marginType = this.safeString (params, 'marginType', 'ISOLATED');
        const request: Dict = {
            'asset_id': market['id'],
            'is_symbol': 1,
            'margin_type': marginType,
            'leverage': leverage,
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency', 'marginType' ]);
        const response = await this.privatePostFuturesAssetIdLeverage (this.extend (request, params));
        const leverages = this.safeDict (this.options, 'leverages', {});
        this.options['leverages'] = this.extend (leverages, { [market['symbol']]: leverage });
        return response;
    }

    /**
     * @method
     * @name mudrex#createOrder
     * @description create a trade order
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} symbol unified market symbol
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order, in units of the quote currency (also required for market orders on this exchange)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.leverage] leverage for the order, required if setLeverage() was not called beforehand
     * @param {bool} [params.reduceOnly] true if the order is reduce only
     * @param {float} [params.takeProfitPrice] the price to trigger an attached take-profit order
     * @param {float} [params.stopLossPrice] the price to trigger an attached stop-loss order
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the trigger price of the attached take-profit order
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the trigger price of the attached stop-loss order
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.trade_currency] the settlement currency for the order
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let lev = this.safeInteger (params, 'leverage');
        const leverages = this.safeDict (this.options, 'leverages', {});
        if (lev === undefined) {
            lev = this.safeInteger (leverages, market['symbol']);
        }
        if (lev === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a leverage parameter or a prior setLeverage() call');
        }
        if ((type === 'market') && (price === undefined)) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for market orders');
        }
        const body: Dict = {
            'asset_id': market['id'],
            'is_symbol': 1,
            'leverage': this.numberToString (lev),
            'quantity': this.amountToPrecision (symbol, amount),
            'order_price': this.priceToPrecision (symbol, price),
            'order_type': (side === 'buy') ? 'LONG' : 'SHORT',
            'trigger_type': (type === 'market') ? 'MARKET' : 'LIMIT',
            'reduce_only': this.safeBool (params, 'reduceOnly', false),
        };
        const takeProfit = this.safeDict (params, 'takeProfit');
        const stopLoss = this.safeDict (params, 'stopLoss');
        let takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        let stopLossPrice = this.safeString (params, 'stopLossPrice');
        if (takeProfit !== undefined) {
            takeProfitPrice = this.safeStringN (takeProfit, [ 'triggerPrice', 'stopPrice', 'price' ], takeProfitPrice);
        }
        if (stopLoss !== undefined) {
            stopLossPrice = this.safeStringN (stopLoss, [ 'triggerPrice', 'stopPrice', 'price' ], stopLossPrice);
        }
        if (takeProfitPrice !== undefined) {
            body['is_takeprofit'] = true;
            body['takeprofit_price'] = this.priceToPrecision (symbol, takeProfitPrice);
        }
        if (stopLossPrice !== undefined) {
            body['is_stoploss'] = true;
            body['stoploss_price'] = this.priceToPrecision (symbol, stopLossPrice);
        }
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            body['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'leverage', 'reduceOnly', 'takeProfit', 'stopLoss', 'takeProfitPrice', 'stopLossPrice', 'trade_currency', 'tradeCurrency' ]);
        const response = await this.privatePostFuturesAssetIdOrder (this.extend (body, params));
        this.options['leverages'] = this.extend (leverages, { [market['symbol']]: lev });
        const data = this.safeDict (response, 'data', response);
        return this.parseOrder (data, market);
    }

    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'order_id': id,
        };
        if (amount !== undefined) {
            request['quantity'] = amount.toString ();
        }
        if (price !== undefined) {
            request['order_price'] = price.toString ();
        }
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency' ]);
        const response = await this.privatePatchFuturesOrdersOrderId (this.extend (request, params));
        const data = this.safeDict (response, 'data', response);
        return this.parseOrder (data, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const oms = this.safeString (order, 'symbol');
        market = this.safeMarket (oms, market);
        const oid = this.safeString2 (order, 'order_id', 'id');
        const rawSide = this.safeStringUpper (order, 'order_type');
        let side: string = undefined;
        if (rawSide === 'LONG') {
            side = 'buy';
        } else if (rawSide === 'SHORT') {
            side = 'sell';
        }
        const trig = this.safeStringUpper (order, 'trigger_type');
        let typ: string = undefined;
        if (trig === 'MARKET') {
            typ = 'market';
        } else if (trig === 'LIMIT') {
            typ = 'limit';
        }
        let ts = this.parse8601 (this.safeString (order, 'created_at'));
        if (ts === undefined) {
            ts = this.milliseconds ();
        }
        const statusL = this.safeStringLower (order, 'status');
        const status = (statusL === 'open' || statusL === 'created' || statusL === 'new') ? 'open' : statusL;
        const sym = market['symbol'];
        return this.safeOrder ({
            'info': order,
            'id': oid,
            'clientOrderId': undefined,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'lastTradeTimestamp': undefined,
            'symbol': sym,
            'type': typ,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeNumber2 (order, 'price', 'order_price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeNumber2 (order, 'quantity', 'amount'),
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': [],
            'fees': [],
            'lastUpdateTimestamp': undefined,
            'reduceOnly': this.safeBool (order, 'reduce_only'),
        }, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'order_id': id,
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency' ]);
        const response = await this.privateDeleteFuturesOrdersOrderId (this.extend (request, params));
        const data = this.safeDict (response, 'data', response);
        return this.parseOrder (data, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'order_id': id,
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency' ]);
        const response = await this.privateGetFuturesOrdersOrderId (this.extend (request, params));
        const data = this.safeDict (response, 'data', response);
        return this.parseOrder (data, market);
    }

    async fetchOrdersByState (state: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const q: Dict = {};
        if (limit !== undefined) {
            q['limit'] = limit;
        }
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            q['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency' ]);
        const request = this.extend (q, params);
        let response = undefined;
        if (state === 'closed') {
            response = await this.privateGetFuturesOrdersHistory (request);
        } else {
            response = await this.privateGetFuturesOrders (request);
        }
        const data = this.safeValue (response, 'data', []);
        const rows = this.toArray (data);
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const orders = [];
        for (let i = 0; i < rows.length; i++) {
            orders.push (this.parseOrder (rows[i], market));
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit) as Order[];
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.fetchOrdersByState ('closed', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.fetchOrdersByState ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.fetchOrdersByState ('closed', symbol, since, limit, params);
    }

    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const q: Dict = {};
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            q['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency' ]);
        const response = await this.privateGetFuturesPositions (this.extend (q, params));
        const data = this.safeValue (response, 'data', []);
        if (data === undefined) {
            return [];
        }
        const rows = this.toArray (data);
        const out: Position[] = [];
        for (let i = 0; i < rows.length; i++) {
            const p = rows[i];
            const symRaw = this.safeString (p, 'symbol');
            const m = this.safeMarket (symRaw);
            const pos = this.parsePosition (p, m);
            out.push (pos);
        }
        return this.filterByArrayPositions (out, 'symbol', symbols);
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        market = this.safeMarket (undefined, market);
        const ms = this.safeString (position, 'symbol');
        const symbol = this.safeSymbol (ms, market);
        const rawSide = this.safeStringUpper (position, 'order_type');
        let side: string = undefined;
        if (rawSide === 'LONG') {
            side = 'long';
        } else if (rawSide === 'SHORT') {
            side = 'short';
        }
        let ts = this.parse8601 (this.safeString (position, 'updated_at'));
        if (ts === undefined) {
            ts = this.parse8601 (this.safeString (position, 'created_at'));
        }
        return {
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': symbol,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'isolated': true,
            'hedged': undefined,
            'side': side,
            'contracts': this.safeNumber (position, 'quantity'),
            'contractSize': 1,
            'entryPrice': this.safeNumber (position, 'entry_price'),
            'markPrice': undefined,
            'notional': undefined,
            'leverage': this.safeInteger (position, 'leverage'),
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidation_price'),
            'marginMode': 'isolated',
            'percentage': undefined,
        } as Position;
    }

    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let positionId = this.safeString (params, 'position_id');
        const amount = this.safeValue (params, 'amount');
        if (positionId === undefined) {
            const market = this.market (symbol);
            const positions = await this.fetchPositions ([ symbol ], params);
            for (let i = 0; i < positions.length; i++) {
                const p = positions[i];
                if (side !== undefined && p['side'] !== side) {
                    continue;
                }
                if (p['symbol'] === market['symbol']) {
                    positionId = this.safeString (p, 'id');
                    break;
                }
            }
        }
        if (positionId === undefined) {
            throw new OrderNotFound (this.id + ' closePosition() could not resolve position_id');
        }
        const request: Dict = {
            'position_id': positionId,
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        if (amount !== undefined) {
            const orderType = this.safeStringUpper (params, 'order_type', 'LIMIT');
            request['order_type'] = orderType;
            request['quantity'] = amount.toString ();
            const lp = this.safeString (params, 'limit_price');
            if (orderType === 'LIMIT' && lp !== undefined) {
                request['limit_price'] = lp;
            }
            params = this.omit (params, [ 'trade_currency', 'tradeCurrency', 'order_type', 'limit_price', 'amount', 'position_id' ]);
            return await this.privatePostFuturesPositionsPositionIdClosePartial (this.extend (request, params));
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency', 'position_id' ]);
        return await this.privatePostFuturesPositionsPositionIdClose (this.extend (request, params));
    }

    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        let positionId = this.safeString (params, 'position_id');
        if (positionId === undefined) {
            const positions = await this.fetchPositions ([ symbol ], params);
            for (let i = 0; i < positions.length; i++) {
                const p = positions[i];
                if (p['symbol'] === symbol) {
                    positionId = this.safeString (p, 'id');
                    break;
                }
            }
        }
        if (positionId === undefined) {
            throw new OrderNotFound (this.id + ' addMargin() could not resolve position_id');
        }
        const request: Dict = {
            'position_id': positionId,
            'margin': amount.toString (),
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency', 'position_id' ]);
        return await this.privatePostFuturesPositionsPositionIdAddMargin (this.extend (request, params));
    }

    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.addMargin (symbol, -amount, params);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        params = this.omit (params, [ 'trade_currency', 'tradeCurrency' ]);
        const response = await this.privateGetFuturesFeeHistory (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const rows = this.toArray (data);
        return this.parseTrades (rows, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const ms = this.safeString (trade, 'symbol');
        market = this.safeMarket (ms, market);
        const symbol = market['symbol'];
        let ts = this.parse8601 (this.safeString (trade, 'created_at'));
        if (ts === undefined) {
            ts = this.safeInteger (trade, 'time');
        }
        const side = this.safeStringLower (trade, 'side');
        let tradeSide: string = undefined;
        if (side === 'buy' || side === 'long') {
            tradeSide = 'buy';
        } else if (side === 'sell' || side === 'short') {
            tradeSide = 'sell';
        }
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'fee_amount');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeString (trade, 'trade_currency'),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'symbol': symbol,
            'id': this.safeString2 (trade, 'execId', 'id'),
            'order': this.safeString (trade, 'order_id'),
            'type': this.safeStringLower (trade, 'trigger_type'),
            'side': tradeSide,
            'takerOrMaker': undefined,
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeNumber2 (trade, 'size', 'quantity'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        const mp: Dict = {
            'spot': 'SPOT',
            'SPOT': 'SPOT',
            'futures': 'FUTURES',
            'future': 'FUTURES',
            'FUTURES': 'FUTURES',
        };
        const fw = this.safeString (mp, fromAccount, fromAccount.toUpperCase ());
        const tw = this.safeString (mp, toAccount, toAccount.toUpperCase ());
        const body: Dict = {
            'from_wallet_type': fw,
            'to_wallet_type': tw,
            'amount': amount.toString (),
        };
        let useInr = false;
        if (code === 'INR') {
            useInr = true;
        } else {
            // default USDT does not use the inr path
            const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
            if (tradeCurrency === 'INR') {
                useInr = true;
            }
        }
        let response = undefined;
        if (useInr) {
            response = await this.privatePostFuturesTransfersInr (this.extend (body, params));
        } else {
            response = await this.privatePostWalletFuturesTransfer (this.extend (body, params));
        }
        const data = this.safeDict (response, 'data', response);
        return {
            'info': response,
            'id': this.safeString (data, 'id'),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': code,
            'amount': amount,
            'fromAccount': fw,
            'toAccount': tw,
            'status': 'ok',
        };
    }
}
