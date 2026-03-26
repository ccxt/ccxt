
// ---------------------------------------------------------------------------

import Exchange from './abstract/mudrex.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import type { Balances, Dict, FundingRate, FundingRateHistory, Int, Market, Num, OHLCV, OpenInterest, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TransferEntry, int } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class mudrex
 * @augments Exchange
 */
export default class mudrex extends Exchange {
    leverageCache: Dict = {};

    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'mudrex',
            'name': 'Mudrex',
            'countries': [ 'IN' ],
            'rateLimit': 500,
            'version': 'v1',
            'pro': false,
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
                'cancelOrder': true,
                'closePosition': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'setLeverage': true,
                'transfer': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'urls': {
                'logo': 'https://raw.githubusercontent.com/ccxt/ccxt/master/doc/brand/mudrex-logo.png',
                'api': {
                    'bybit_public': 'https://api.bybit.com',
                    'mudrex_public': 'https://trade.mudrex.com/fapi/v1',
                    'mudrex_private': 'https://trade.mudrex.com/fapi/v1',
                },
                'www': 'https://mudrex.com',
                'doc': 'https://docs.trade.mudrex.com',
                'fees': 'https://docs.trade.mudrex.com',
            },
            'api': {
                'bybit_public': {
                    'get': {
                        'v5/market/kline': 1,
                        'v5/market/tickers': 1,
                        'v5/market/orderbook': 1,
                        'v5/market/recent-trade': 1,
                        'v5/market/funding/history': 1,
                        'v5/market/mark-price-kline': 1,
                        'v5/market/index-price-kline': 1,
                    },
                },
                'mudrex_public': {
                    'get': {
                        'futures': 5,
                        'futures/funds': 5,
                        'wallet/funds': 5,
                    },
                },
                'mudrex_private': {
                    'post': {
                        'wallet/futures/transfer': 5,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': true,
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

    bybitInterval (timeframe: string): string {
        const tf = this.safeString (this.timeframes, timeframe);
        if (tf === undefined) {
            throw new BadRequest (this.id + ' unsupported timeframe: ' + timeframe);
        }
        return tf;
    }

    resolveMarketOptional (symbol: string): Market | undefined {
        if (!this.markets || !symbol) {
            return undefined;
        }
        try {
            return this.market (symbol);
        } catch (e) {
            return undefined;
        }
    }

    async bybitPublicRequest (path: string, params: Dict = {}): Promise<any> {
        return await this.request (path, 'bybit_public', 'GET', params, undefined, undefined, { 'cost': 1 });
    }

    async mudrexRequest (method: string, path: string, params: Dict = {}, body: Dict = {}, api: string = 'mudrex_private'): Promise<any> {
        this.checkRequiredCredentials ();
        const m = method.toUpperCase ();
        if (m === 'GET') {
            return await this.request (path, 'mudrex_public', 'GET', params, undefined, undefined, { 'cost': 5 });
        }
        return await this.request (path, api, m, body, undefined, undefined, { 'cost': 5 });
    }

    sign (path, api: string = 'bybit_public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const apiUrls = this.safeDict (this.urls, 'api', {});
        const base = this.safeString (apiUrls, api);
        if (base === undefined) {
            throw new ExchangeError (this.id + ' unknown API namespace: ' + api);
        }
        let url = base + '/' + path;
        headers = (headers !== undefined) ? this.extend ({}, headers) : {};
        const methodUpper = method.toUpperCase ();
        if (api === 'bybit_public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
            return { 'url': url, 'method': method, 'body': undefined, 'headers': headers };
        }
        if (api === 'mudrex_public' || api === 'mudrex_private') {
            this.checkRequiredCredentials ();
            headers['X-Authentication'] = this.secret;
            if (methodUpper === 'POST' || methodUpper === 'PATCH' || methodUpper === 'DELETE') {
                headers['Content-Type'] = 'application/json';
                if (methodUpper === 'DELETE' && Object.keys (params).length === 0) {
                    return { 'url': url, 'method': methodUpper, 'body': undefined, 'headers': headers };
                }
                const bodyStr = this.json (params);
                return { 'url': url, 'method': methodUpper, 'body': bodyStr, 'headers': headers };
            }
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
            return { 'url': url, 'method': methodUpper, 'body': undefined, 'headers': headers };
        }
        throw new ExchangeError (this.id + ' unknown API namespace: ' + api);
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined || typeof response !== 'object') {
            return undefined;
        }
        if (url.indexOf ('trade.mudrex.com') >= 0) {
            const success = this.safeBool (response, 'success', true);
            if (!success) {
                const errors = this.safeList (response, 'errors', []);
                let first: Dict = {};
                if (errors.length > 0 && typeof errors[0] === 'object' && errors[0] !== null) {
                    first = errors[0] as Dict;
                }
                const text = this.safeString (first, 'text', this.json (response));
                const errCode = this.safeInteger (first, 'code', code);
                this.throwMudrexError (code, errCode, text);
            }
        }
        if (url.indexOf ('api.bybit.com') >= 0) {
            const retCode = this.safeInteger (response, 'retCode');
            if (retCode !== undefined && retCode !== 0) {
                const retMsg = this.safeString (response, 'retMsg', 'Bybit error');
                this.throwBybitError (retCode, retMsg);
            }
        }
        return undefined;
    }

    throwMudrexError (httpStatus: number, code: Int, text: string) {
        const msg = this.id + ' ' + (text || 'Unknown error');
        const low = (text || '').toLowerCase ();
        if (httpStatus === 401 || low.indexOf ('auth') >= 0) {
            throw new AuthenticationError (msg);
        }
        if (httpStatus === 429 || low.indexOf ('rate') >= 0) {
            throw new RateLimitExceeded (msg);
        }
        if (low.indexOf ('insufficient') >= 0) {
            throw new InsufficientFunds (msg);
        }
        if (low.indexOf ('order not found') >= 0 || (low.indexOf ('not found') >= 0 && low.indexOf ('order') >= 0)) {
            throw new OrderNotFound (msg);
        }
        if (httpStatus === 400 || code === 400) {
            throw new BadRequest (msg);
        }
        throw new ExchangeError (msg);
    }

    throwBybitError (retCode: number, retMsg: string) {
        const msg = this.id + ' Bybit ' + retCode.toString () + ' ' + retMsg;
        if (retCode === 10001 || retCode === 10002 || retCode === 110001) {
            throw new BadRequest (msg);
        }
        if (retCode === 10003 || retCode === 10004) {
            throw new AuthenticationError (msg);
        }
        throw new ExchangeError (msg);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const ms = this.mudrexSymbol (symbol);
        const interval = this.bybitInterval (timeframe);
        const request: Dict = {
            'category': 'linear',
            'symbol': ms,
            'interval': interval,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        if (since !== undefined) {
            request['start'] = since;
            request['end'] = this.milliseconds ();
        }
        const response = await this.bybitPublicRequest ('v5/market/kline', this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const rows = this.safeList (result, 'list', []);
        const reversed = rows.slice ().reverse ();
        const market = this.resolveMarketOptional (symbol);
        return this.parseOHLCVs (reversed, market, timeframe, since, limit);
    }

    async fetchMarkOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return await this.fetchPriceOHLCV ('v5/market/mark-price-kline', symbol, timeframe, since, limit, params);
    }

    async fetchIndexOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return await this.fetchPriceOHLCV ('v5/market/index-price-kline', symbol, timeframe, since, limit, params);
    }

    async fetchPriceOHLCV (path: string, symbol: string, timeframe: string, since: Int, limit: Int, params = {}): Promise<OHLCV[]> {
        const ms = this.mudrexSymbol (symbol);
        const interval = this.bybitInterval (timeframe);
        const request: Dict = {
            'category': 'linear',
            'symbol': ms,
            'interval': interval,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        if (since !== undefined) {
            request['start'] = since;
            request['end'] = this.milliseconds ();
        }
        const response = await this.bybitPublicRequest (path, this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const rows = this.safeList (result, 'list', []);
        const reversed = rows.slice ().reverse ();
        const market = this.resolveMarketOptional (symbol);
        return this.parseOHLCVs (reversed, market, timeframe, since, limit);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        const ms = this.mudrexSymbol (symbol);
        const request: Dict = {
            'category': 'linear',
            'symbol': ms,
        };
        const response = await this.bybitPublicRequest ('v5/market/tickers', this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const lst = this.safeList (result, 'list', []);
        const raw = this.safeDict (lst, 0, {});
        const market = this.resolveMarketOptional (symbol);
        return this.parseTicker (raw, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        const request: Dict = { 'category': 'linear' };
        const response = await this.bybitPublicRequest ('v5/market/tickers', this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const lst = this.safeList (result, 'list', []);
        const resultTickers: Dict = {};
        for (let i = 0; i < lst.length; i++) {
            const t = lst[i];
            const sym = this.safeString (t, 'symbol');
            if (sym === undefined) {
                continue;
            }
            const unified = this.unifiedSymbol (sym);
            if (symbols !== undefined && !this.inArray (unified, symbols) && !this.inArray (sym, symbols)) {
                continue;
            }
            const m = this.resolveMarketOptional (unified);
            resultTickers[unified] = this.parseTicker (t, m);
        }
        return resultTickers;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        market = this.safeMarket (undefined, market);
        let symbol = this.safeString (market, 'symbol');
        if (!symbol) {
            const ms = this.safeString (ticker, 'symbol');
            symbol = ms ? this.unifiedSymbol (ms) : undefined;
        }
        const ts = this.safeInteger (ticker, 'time', this.milliseconds ());
        const pct = this.safeNumber (ticker, 'price24hPcnt');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'high': this.safeNumber (ticker, 'highPrice24h'),
            'low': this.safeNumber (ticker, 'lowPrice24h'),
            'bid': this.safeNumber (ticker, 'bid1Price'),
            'bidVolume': this.safeNumber (ticker, 'bid1Size'),
            'ask': this.safeNumber (ticker, 'ask1Price'),
            'askVolume': this.safeNumber (ticker, 'ask1Size'),
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'prevPrice24h'),
            'close': this.safeNumber (ticker, 'lastPrice'),
            'last': this.safeNumber (ticker, 'lastPrice'),
            'previousClose': this.safeNumber (ticker, 'prevPrice24h'),
            'change': undefined,
            'percentage': pct !== undefined ? pct * 100 : undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume24h'),
            'quoteVolume': this.safeNumber (ticker, 'turnover24h'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const ms = this.mudrexSymbol (symbol);
        const request: Dict = {
            'category': 'linear',
            'symbol': ms,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 500);
        }
        const response = await this.bybitPublicRequest ('v5/market/orderbook', this.extend (request, params));
        const ob = this.safeDict (response, 'result', {});
        const ts = this.safeInteger (ob, 'ts');
        const market = this.resolveMarketOptional (symbol);
        const sym = this.safeString (market, 'symbol') ?? this.unifiedSymbol (ms);
        return this.parseOrderBook (ob, sym, ts, 'b', 'a');
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const ms = this.mudrexSymbol (symbol);
        const request: Dict = {
            'category': 'linear',
            'symbol': ms,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const response = await this.bybitPublicRequest ('v5/market/recent-trade', this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const lst = this.safeList (result, 'list', []);
        const market = this.resolveMarketOptional (symbol);
        return this.parseTrades (lst, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        market = this.safeMarket (undefined, market);
        const ms = this.safeString (trade, 'symbol');
        const symbol = this.safeString (market, 'symbol') ?? (ms ? this.unifiedSymbol (ms) : undefined);
        const ts = this.safeInteger (trade, 'time');
        const side = this.safeStringLower (trade, 'side');
        let tradeSide: string = undefined;
        if (side === 'buy') {
            tradeSide = 'buy';
        } else if (side === 'sell') {
            tradeSide = 'sell';
        }
        return {
            'info': trade,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'symbol': symbol,
            'id': this.safeString (trade, 'execId'),
            'order': undefined,
            'type': undefined,
            'side': tradeSide,
            'takerOrMaker': undefined,
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeNumber (trade, 'size'),
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        const ticker = await this.fetchTicker (symbol, params);
        const info = this.safeDict (ticker, 'info', {});
        const fr = this.safeNumber (info, 'fundingRate');
        const nft = this.safeInteger (info, 'nextFundingTime');
        const now = this.milliseconds ();
        return {
            'info': info,
            'symbol': this.safeString (ticker, 'symbol'),
            'markPrice': this.safeNumber (info, 'markPrice'),
            'indexPrice': this.safeNumber (info, 'indexPrice'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'fundingRate': fr,
            'fundingTimestamp': nft,
            'fundingDatetime': this.iso8601 (nft),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nft,
            'nextFundingDatetime': this.iso8601 (nft),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol');
        }
        const ms = this.mudrexSymbol (symbol);
        const request: Dict = {
            'category': 'linear',
            'symbol': ms,
        };
        if (since !== undefined) {
            request['startTime'] = since;
            request['endTime'] = this.milliseconds ();
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 200);
        }
        const response = await this.bybitPublicRequest ('v5/market/funding/history', this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const lst = this.safeList (result, 'list', []);
        const market = this.resolveMarketOptional (symbol);
        const out: FundingRateHistory[] = [];
        for (let i = 0; i < lst.length; i++) {
            out.push (this.parseFundingRateHistory (lst[i], market));
        }
        return out;
    }

    parseFundingRateHistory (info: Dict, market: Market = undefined): FundingRateHistory {
        market = this.safeMarket (undefined, market);
        const ms = this.safeString (info, 'symbol');
        const symbol = this.safeString (market, 'symbol') ?? (ms ? this.unifiedSymbol (ms) : undefined);
        const ts = this.safeInteger (info, 'fundingRateTimestamp');
        return {
            'info': info,
            'symbol': symbol,
            'fundingRate': this.safeNumber (info, 'fundingRate'),
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
        };
    }

    async fetchOpenInterest (symbol: string, params = {}): Promise<OpenInterest> {
        const ticker = await this.fetchTicker (symbol, params);
        const info = this.safeDict (ticker, 'info', {});
        const ts = this.milliseconds ();
        return {
            'symbol': this.safeString (ticker, 'symbol'),
            'openInterestAmount': this.safeNumber (info, 'openInterest'),
            'openInterestValue': this.safeNumber (info, 'openInterestValue'),
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'info': info,
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        const aggregated = [];
        let offset = 0;
        const pageLimit = 100;
        let paging = true;
        while (paging) {
            const q = this.extend ({ 'limit': pageLimit, 'offset': offset }, params);
            const response = await this.mudrexRequest ('GET', 'futures', q, {});
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
        this.setMarkets (result);
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
        const spot = await this.mudrexRequest ('GET', 'wallet/funds', {}, {});
        const fut = await this.mudrexRequest ('GET', 'futures/funds', {}, {});
        return this.parseBalance ({ 'spot': spot, 'futures': fut });
    }

    parseBalance (response: any): Balances {
        const spotR = this.safeDict (response, 'spot', {});
        const futR = this.safeDict (response, 'futures', {});
        const spotD = this.safeDict (spotR, 'data', {});
        const futD = this.safeDict (futR, 'data', {});
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
            'USDT': {
                'free': futFree,
                'used': futLocked,
                'total': futBal,
            },
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

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        const ms = this.mudrexSymbol (symbol);
        let market: Market = undefined;
        if (this.markets) {
            market = this.market (symbol);
        } else {
            market = { 'symbol': symbol } as Market;
        }
        let lev = this.safeInteger (params, 'leverage');
        if (lev === undefined) {
            lev = this.safeInteger (this.leverageCache, ms);
        }
        if (lev === undefined) {
            throw new ArgumentsRequired (this.id + " createOrder() requires params['leverage'] or a prior setLeverage() call");
        }
        const trig = (type === 'market') ? 'MARKET' : 'LIMIT';
        const otype = (side === 'buy') ? 'LONG' : 'SHORT';
        let px = price;
        if (type === 'market' && (px === undefined || px === 0)) {
            const t = await this.fetchTicker (symbol, this.omit (params, [ 'leverage' ]));
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
        const response = await this.request (path, 'mudrex_private', 'POST', body, undefined, undefined, { 'cost': 5 });
        this.leverageCache[ms] = lev;
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
        let market: Market = undefined;
        if (symbol !== undefined && this.markets) {
            market = this.market (symbol);
        } else if (symbol !== undefined) {
            market = { 'symbol': symbol } as Market;
        }
        const path = 'futures/orders/' + id;
        const response = await this.request (path, 'mudrex_private', 'DELETE', {}, undefined, undefined, { 'cost': 5 });
        const data = this.safeDict (response, 'data', response);
        return this.parseOrder (data, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        let market: Market = undefined;
        if (symbol !== undefined && this.markets) {
            market = this.market (symbol);
        } else if (symbol !== undefined) {
            market = { 'symbol': symbol } as Market;
        }
        const path = 'futures/orders/' + id;
        const response = await this.mudrexRequest ('GET', path, {}, {});
        const data = this.safeDict (response, 'data', response);
        return this.parseOrder (data, market);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const q: Dict = {};
        if (limit !== undefined) {
            q['limit'] = limit;
        }
        const response = await this.mudrexRequest ('GET', 'futures/orders', q, {});
        const data = this.safeValue (response, 'data', []);
        const rows = this.toArray (data);
        let market: Market = undefined;
        if (symbol !== undefined && this.markets) {
            market = this.market (symbol);
        } else if (symbol !== undefined) {
            market = { 'symbol': symbol } as Market;
        }
        let orders = [];
        for (let i = 0; i < rows.length; i++) {
            orders.push (this.parseOrder (rows[i], market));
        }
        if (symbol !== undefined) {
            const sym = this.safeString (market, 'symbol') ?? symbol;
            orders = this.filterByArray (orders, 'symbol', [ sym ], false);
        }
        return orders;
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const q: Dict = {};
        if (limit !== undefined) {
            q['limit'] = limit;
        }
        const response = await this.mudrexRequest ('GET', 'futures/orders/history', q, {});
        const data = this.safeValue (response, 'data', []);
        const rows = this.toArray (data);
        let market: Market = undefined;
        if (symbol !== undefined && this.markets) {
            market = this.market (symbol);
        } else if (symbol !== undefined) {
            market = { 'symbol': symbol } as Market;
        }
        let orders = [];
        for (let i = 0; i < rows.length; i++) {
            orders.push (this.parseOrder (rows[i], market));
        }
        if (symbol !== undefined) {
            const sym = this.safeString (market, 'symbol') ?? symbol;
            orders = this.filterByArray (orders, 'symbol', [ sym ], false);
        }
        return orders;
    }

    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        const response = await this.mudrexRequest ('GET', 'futures/positions', {}, {});
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
            if (symbols === undefined || this.inArray (pos['symbol'], symbols)) {
                out.push (pos);
            }
        }
        return out;
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

    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}): Promise<any> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol');
        }
        const ms = this.mudrexSymbol (symbol);
        const marginType = this.safeString (params, 'marginType', 'ISOLATED');
        const body: Dict = {
            'margin_type': marginType,
            'leverage': leverage,
        };
        const path = 'futures/' + ms + '/leverage?is_symbol=1';
        const response = await this.request (path, 'mudrex_private', 'POST', body, undefined, undefined, { 'cost': 5 });
        this.leverageCache[ms] = leverage;
        return response;
    }

    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<any> {
        this.checkRequiredCredentials ();
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
        if (amount !== undefined) {
            const partialPath = 'futures/positions/' + positionId + '/close/partial';
            const orderType = this.safeStringUpper (params, 'order_type', 'LIMIT');
            const body: Dict = {
                'order_type': orderType,
                'quantity': amount.toString (),
            };
            const lp = this.safeString (params, 'limit_price');
            if (orderType === 'LIMIT' && lp !== undefined) {
                body['limit_price'] = lp;
            }
            return await this.request (partialPath, 'mudrex_private', 'POST', body, undefined, undefined, { 'cost': 5 });
        }
        const closePath = 'futures/positions/' + positionId + '/close';
        return await this.request (closePath, 'mudrex_private', 'POST', {}, undefined, undefined, { 'cost': 5 });
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
        return await this.request ('wallet/futures/transfer', 'mudrex_private', 'POST', body, undefined, undefined, { 'cost': 5 }) as TransferEntry;
    }
}
