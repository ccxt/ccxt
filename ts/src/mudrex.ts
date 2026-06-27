
// ---------------------------------------------------------------------------

import Exchange from './abstract/mudrex.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, OrderNotFound, RateLimitExceeded, NotSupported } from './base/errors.js';
import type { Balances, Dict, FundingRate, FundingRateHistory, Int, Market, Num, OHLCV, OpenInterest, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TransferEntry, int } from './base/types.js';

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

    mudrexSymbol (unified: string): string {
        if (!unified) {
            throw new BadSymbol (this.id + ' empty symbol');
        }
        if (!unified.includes ('/') && !unified.includes (':')) {
            return unified.toUpperCase ();
        }
        const baseQuote = unified.split (':')[0];
        const parts = baseQuote.split ('/');
        if (parts.length !== 2) {
            throw new BadSymbol (this.id + ' invalid unified symbol: ' + unified);
        }
        return (parts[0] + parts[1]).toUpperCase ();
    }

    unifiedSymbol (raw: string): string {
        if (!raw) {
            throw new BadSymbol (this.id + ' empty raw symbol');
        }
        const r = raw.toUpperCase ();
        if (r.includes ('/')) {
            return r.includes (':') ? r : r + ':USDT';
        }
        if (r.endsWith ('USDT') && r.length > 4) {
            const base = r.slice (0, -4);
            return base + '/USDT:USDT';
        }
        return r + '/USDT:USDT';
    }

    sign (path, api: string = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const apiUrls = this.safeDict (this.urls, 'api', {});
        const base = this.safeString (apiUrls, api);
        if (base === undefined) {
            throw new ExchangeError (this.id + ' unknown API namespace: ' + api);
        }
        let url = base + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
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
            let first: Dict = {};
            if (errors.length > 0 && typeof errors[0] === 'object' && errors[0] !== null) {
                first = errors[0] as Dict;
            }
            const text = this.safeString (first, 'text', this.json (response));
            const errCode = this.safeString (first, 'code');
            this.throwExactlyMatchedException (this.exceptions['exact'], text, this.id + ' ' + text);
            this.throwExactlyMatchedException (this.exceptions['exact'], errCode, this.id + ' ' + text);
            this.throwBroadlyMatchedException (this.exceptions['broad'], text, this.id + ' ' + text);
            const msg = this.id + ' ' + (text || 'Unknown error');
            const low = (text || '').toLowerCase ();
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
        let priceType = this.safeString(params, 'price');
        params = this.omit(params, 'price');
        let path = 'price/kline';
        if (priceType === 'mark') {
            path = 'price/mark-kline';
        }
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
        const response = await this.request (path, 'market', 'GET', this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchMarkOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (params, { 'price': 'mark' }));
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        const response = await this.request ('futures/' + market['id'], 'private', 'GET', this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.request ('futures', 'private', 'GET', this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const rows = Array.isArray (data) ? data : this.safeList (data, 'items', []);
        const resultTickers: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const t = rows[i];
            const sym = this.safeString (t, 'symbol');
            if (sym === undefined) {
                continue;
            }
            const unified = this.unifiedSymbol (sym);
            if (symbols !== undefined && !this.inArray (unified, symbols)) {
                continue;
            }
            const m = this.safeValue (this.markets, unified);
            resultTickers[unified] = this.parseTicker (t, m);
        }
        return this.filterByArrayTickers (resultTickers, 'symbol', symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        market = this.safeMarket (undefined, market);
        let symbol = this.safeString (market, 'symbol');
        if (!symbol) {
            const ms = this.safeString (ticker, 'symbol');
            symbol = ms ? this.unifiedSymbol (ms) : undefined;
        }
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
            const response = await this.request ('futures', 'private', 'GET', q);
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
        const unified = ms ? this.unifiedSymbol (ms) : undefined;
        let base = ms;
        if (ms !== undefined && ms.endsWith ('USDT')) {
            base = ms.slice (0, -4);
        }
        const priceStep = this.safeString (asset, 'price_step', '0.01');
        const qtyStep = this.safeString (asset, 'quantity_step', '0.001');
        return {
            'id': this.safeString (asset, 'id', ms),
            'lowercaseId': undefined,
            'symbol': unified,
            'base': base,
            'quote': 'USDT',
            'settle': 'USDT',
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
        let spotReq: Dict = {};
        let futReq: Dict = {};
        if (tradeCurrency !== undefined) {
            spotReq['currency'] = tradeCurrency;
            futReq['trade_currency'] = tradeCurrency;
        } else if (params['currency'] !== undefined) {
            spotReq['currency'] = params['currency'];
            futReq['trade_currency'] = params['currency'];
        }
        const p1 = this.omit (params, ['trade_currency', 'tradeCurrency', 'currency']);
        const spot = await this.request ('wallet/funds', 'private', 'GET', this.extend (spotReq, p1));
        const fut = await this.request ('futures/funds', 'private', 'GET', this.extend (futReq, p1));
        return this.parseBalance ({ 'spot': spot, 'futures': fut, 'currency': spotReq['currency'] || 'USDT' });
    }

    parseBalance (response: any): Balances {
        const spotR = this.safeDict (response, 'spot', {});
        const futR = this.safeDict (response, 'futures', {});
        const spotD = this.safeDict (spotR, 'data', {});
        const futD = this.safeDict (futR, 'data', {});
        const currency = this.safeString (response, 'currency', 'USDT');
        const futBal = this.safeNumber (futD, 'balance');
        const futLocked = this.safeNumber (futD, 'locked_amount');
        let futFree = undefined;
        if (futBal !== undefined && futLocked !== undefined) {
            futFree = futBal - futLocked;
        }
        const spotWithdrawable = this.safeNumber (spotD, 'withdrawable');
        const timestamp = this.milliseconds ();
        const balance: Dict = {
            'info': [ spotR, futR ],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        balance[currency] = {
            'free': futFree,
            'used': futLocked,
            'total': futBal,
        };
        if (spotWithdrawable !== undefined) {
            balance['SPOT'] = {
                'free': spotWithdrawable,
                'used': 0,
                'total': this.safeNumber (spotD, 'total'),
            };
        }
        return this.safeBalance (balance);
    }

    async fetchLeverage (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const path = 'futures/' + market['id'] + '/leverage';
        const request: Dict = {};
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        const response = await this.request (path, 'private', 'GET', this.extend (request, this.omit (params, ['trade_currency', 'tradeCurrency'])));
        const data = this.safeDict (response, 'data', {});
        return {
            'info': response,
            'symbol': symbol,
            'marginMode': this.safeStringLower (data, 'margin_type'),
            'leverage': this.safeNumber (data, 'leverage'),
        };
    }

    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}): Promise<any> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marginType = this.safeString (params, 'marginType', 'ISOLATED');
        const body: Dict = {
            'margin_type': marginType,
            'leverage': leverage,
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            body['trade_currency'] = tradeCurrency;
        }
        const path = 'futures/' + market['id'] + '/leverage?is_symbol=1';
        const response = await this.request (path, 'private', 'POST', this.extend(body, this.omit(params, ['trade_currency', 'tradeCurrency', 'marginType'])));
        let leverages = this.safeDict (this.options, 'leverages', {});
        this.options['leverages'] = this.extend (leverages, { [market['symbol']]: leverage });
        return response;
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ms = market['id'];
        let lev = this.safeInteger (params, 'leverage');
        let leverages = this.safeDict (this.options, 'leverages', {});
        if (lev === undefined) {
            lev = this.safeInteger (leverages, market['symbol']);
        }
        if (lev === undefined) {
            throw new ArgumentsRequired (this.id + " createOrder() requires params['leverage'] or a prior setLeverage() call");
        }
        const trig = (type === 'market') ? 'MARKET' : 'LIMIT';
        const otype = (side === 'buy') ? 'LONG' : 'SHORT';
        let px = price;
        if (type === 'market' && (px === undefined || px === 0)) {
            const t = await this.fetchTicker (symbol);
            px = this.safeNumber (t, 'last');
            if (px === undefined) {
                throw new ExchangeError (this.id + ' could not resolve market order price from ticker');
            }
        }
        const body: Dict = {
            'leverage': lev.toString (),
            'quantity': amount.toString (),
            'order_price': px.toString (),
            'order_type': otype,
            'trigger_type': trig,
            'reduce_only': this.safeBool (params, 'reduceOnly', false),
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            body['trade_currency'] = tradeCurrency;
        }
        if (this.safeBool (params, 'takeProfit', false) || params['takeprofit_price'] !== undefined) {
            body['is_takeprofit'] = true;
            const tp = this.safeString2 (params, 'takeprofit_price', 'takeProfitPrice');
            if (tp !== undefined) {
                body['takeprofit_price'] = tp;
            }
        }
        if (this.safeBool (params, 'stopLoss', false) || params['stoploss_price'] !== undefined) {
            body['is_stoploss'] = true;
            const sl = this.safeString2 (params, 'stoploss_price', 'stopLossPrice');
            if (sl !== undefined) {
                body['stoploss_price'] = sl;
            }
        }
        const path = 'futures/' + ms + '/order?is_symbol=1';
        const response = await this.request (path, 'private', 'POST', this.extend(body, this.omit(params, ['leverage', 'reduceOnly', 'takeProfit', 'stopLoss', 'takeprofit_price', 'takeProfitPrice', 'stoploss_price', 'stopLossPrice', 'trade_currency', 'tradeCurrency'])));
        leverages = this.safeDict (this.options, 'leverages', {});
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
        const response = await this.request ('futures/orders/' + id, 'private', 'PATCH', this.extend (request, this.omit (params, ['trade_currency', 'tradeCurrency'])));
        const data = this.safeDict (response, 'data', response);
        return this.parseOrder (data, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        market = this.safeMarket (undefined, market);
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
        let sym = this.safeString (market, 'symbol');
        if (!sym) {
            const oms = this.safeString (order, 'symbol');
            if (oms !== undefined) {
                sym = this.unifiedSymbol (oms);
            }
        }
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
        const path = 'futures/orders/' + id;
        const request: Dict = {};
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        const response = await this.request (path, 'private', 'DELETE', this.extend (request, this.omit (params, ['trade_currency', 'tradeCurrency'])));
        const data = this.safeDict (response, 'data', response);
        return this.parseOrder (data, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const path = 'futures/orders/' + id;
        const request: Dict = {};
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        const response = await this.request (path, 'private', 'GET', this.extend (request, this.omit (params, ['trade_currency', 'tradeCurrency'])));
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
        let path = 'futures/orders';
        if (state === 'closed') {
            path = 'futures/orders/history';
        }
        const response = await this.request (path, 'private', 'GET', this.extend (q, this.omit (params, ['trade_currency', 'tradeCurrency'])));
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
        const response = await this.request ('futures/positions', 'private', 'GET', this.extend (q, this.omit (params, ['trade_currency', 'tradeCurrency'])));
        const data = this.safeValue (response, 'data', []);
        if (data === undefined) {
            return [];
        }
        const rows = this.toArray (data);
        const out: Position[] = [];
        for (let i = 0; i < rows.length; i++) {
            const p = rows[i];
            const symRaw = this.safeString (p, 'symbol');
            let m: Market = undefined;
            if (symRaw !== undefined) {
                const u = this.unifiedSymbol (symRaw);
                m = this.resolveMarketOptional (u);
            }
            const pos = this.parsePosition (p, m);
            out.push (pos);
        }
        return this.filterByArrayPositions (out, 'symbol', symbols);
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        market = this.safeMarket (undefined, market);
        const ms = this.safeString (position, 'symbol');
        const symbol = this.safeString (market, 'symbol') ?? (ms ? this.unifiedSymbol (ms) : undefined);
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

    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<any> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let positionId = this.safeString (params, 'position_id');
        const amount = this.safeValue (params, 'amount');
        if (positionId === undefined) {
            const positions = await this.fetchPositions (symbol ? [ symbol ] : undefined, params);
            for (let i = 0; i < positions.length; i++) {
                const p = positions[i];
                if (side !== undefined && p['side'] !== side) {
                    continue;
                }
                if (p['symbol'] === symbol || this.mudrexSymbol (symbol) === this.mudrexSymbol (p['symbol'])) {
                    positionId = this.safeString (p, 'id');
                    break;
                }
            }
        }
        if (positionId === undefined) {
            throw new OrderNotFound (this.id + ' closePosition() could not resolve position_id');
        }
        const request: Dict = {};
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        if (amount !== undefined) {
            const partialPath = 'futures/positions/' + positionId + '/close/partial';
            const orderType = this.safeStringUpper (params, 'order_type', 'LIMIT');
            const body: Dict = this.extend (request, {
                'order_type': orderType,
                'quantity': amount.toString (),
            });
            const lp = this.safeString (params, 'limit_price');
            if (orderType === 'LIMIT' && lp !== undefined) {
                body['limit_price'] = lp;
            }
            return await this.request (partialPath, 'private', 'POST', this.extend (body, this.omit (params, ['trade_currency', 'tradeCurrency', 'order_type', 'limit_price', 'amount'])));
        }
        const closePath = 'futures/positions/' + positionId + '/close';
        return await this.request (closePath, 'private', 'POST', this.extend (request, this.omit (params, ['trade_currency', 'tradeCurrency'])));
    }
    
    async addMargin (symbol: string, amount: number, params = {}) {
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
            'margin': amount.toString(),
        };
        const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
        if (tradeCurrency !== undefined) {
            request['trade_currency'] = tradeCurrency;
        }
        return await this.request ('futures/positions/' + positionId + '/add-margin', 'private', 'POST', this.extend (request, this.omit (params, ['trade_currency', 'tradeCurrency', 'position_id'])));
    }

    async reduceMargin (symbol: string, amount: number, params = {}) {
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
        const response = await this.request ('futures/fee/history', 'private', 'GET', this.extend (request, this.omit (params, ['trade_currency', 'tradeCurrency'])));
        const data = this.safeValue (response, 'data', []);
        const rows = this.toArray (data);
        return this.parseTrades (rows, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        market = this.safeMarket (undefined, market);
        const ms = this.safeString (trade, 'symbol');
        const symbol = this.safeString (market, 'symbol') ?? (ms ? this.unifiedSymbol (ms) : undefined);
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
        let path = 'wallet/futures/transfer';
        if (code === 'INR') {
            path = 'futures/transfers/inr';
        } else {
            // default USDT does not use the inr path
            const tradeCurrency = this.safeString2 (params, 'trade_currency', 'tradeCurrency');
            if (tradeCurrency === 'INR') {
                path = 'futures/transfers/inr';
            }
        }
        const response = await this.request (path, 'private', 'POST', body, undefined, undefined, { 'cost': 5 });
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
