import Exchange from './base/Exchange.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, Int, Num, Str, Strings, Market, Currency, Trade, Ticker, OrderBook, Order, Balances, OHLCV, Transaction } from './base/types.js';
import { AuthenticationError, BadRequest, BadSymbol, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, NotSupported, OnMaintenance, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256, sha512, md5 } from './static_dependencies/noble-hashes/sha2.js';
import { eddsa, rsa } from './base/functions/crypto.js';

export default class Binance extends Exchange {

    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'binance',
            'name': 'Binance',
            'countries': ["JP","MT"],
            'rateLimit': 50,
            'certified': true,
            'pro': true,
            'urls': {
                "logo": "https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg",
                "api": {
                    "public": "https://api.binance.com/api/v3",
                    "private": "https://api.binance.com/api/v3",
                    "sapi": "https://api.binance.com/sapi/v1",
                    "fapiPublic": "https://fapi.binance.com/fapi/v1",
                    "fapiPrivate": "https://fapi.binance.com/fapi/v1",
                    "fapiPrivateV2": "https://fapi.binance.com/fapi/v2",
                    "fapiPrivateV3": "https://fapi.binance.com/fapi/v3",
                    "dapiPublic": "https://dapi.binance.com/dapi/v1",
                    "dapiPrivate": "https://dapi.binance.com/dapi/v1",
                    "papi": "https://papi.binance.com/papi/v1"
                },
                "www": "https://www.binance.com",
                "doc": [
                    "https://binance-docs.github.io/apidocs/spot/en",
                    "https://binance-docs.github.io/apidocs/futures/en",
                    "https://binance-docs.github.io/apidocs/delivery/en"
                ],
                "fees": "https://www.binance.com/en/fee/schedule"
            },
            'api': {
                'public': {
                    'get': ['time', 'exchangeInfo', 'ticker24hr', 'tickerPrice', 'depth', 'trades', 'historicalTrades', 'klines'],
                },
                'private': {
                    'get': ['account', 'openOrders', 'allOrders', 'order', 'myTrades'],
                    'post': ['order'],
                    'delete': ['order'],
                },
                'sapi': {
                    'get': ['capital/config/getall', 'margin/account', 'margin/isolated/account', 'asset/get-funding-asset'],
                },
                'fapiPrivate': {
                    'get': ['account', 'openOrders'],
                    'post': ['order'],
                },
            },
            'has': {
                "publicAPI": true,
                "privateAPI": true,
                "sandbox": true,
                "spot": true,
                "margin": true,
                "swap": true,
                "future": true,
                "option": true,
                "fetchMarkets": true,
                "fetchCurrencies": true,
                "fetchTicker": true,
                "fetchTickers": true,
                "fetchOrderBook": true,
                "fetchTrades": true,
                "fetchOHLCV": true,
                "fetchBalance": true,
                "createOrder": true,
                "cancelOrder": true,
                "cancelAllOrders": true,
                "editOrder": true,
                "fetchOrder": true,
                "fetchOrders": true,
                "fetchOpenOrders": true,
                "fetchClosedOrders": true,
                "fetchMyTrades": true,
                "fetchDeposits": true,
                "fetchWithdrawals": true,
                "fetchDepositAddress": true,
                "withdraw": true,
                "transfer": true,
                "fetchPositions": true,
                "setLeverage": true,
                "setMarginMode": true
            },
            'requiredCredentials': {
                "apiKey": true,
                "secret": true
            },
            'broker': {
                "spot": "x-R4BD3S82",
                "margin": "x-R4BD3S82",
                "future": "x-xcKtGhcu",
                "delivery": "x-xcKtGhcu"
            },
            'exceptions': {
                'exact': {
                    '-1000': ExchangeNotAvailable,
                    '-1001': ExchangeNotAvailable,
                    '-1002': AuthenticationError,
                    '-1003': RateLimitExceeded,
                    '-1004': OperationFailed,
                    '-1008': OperationFailed,
                    '-1010': BadRequest,
                    '-1013': InvalidOrder,
                    '-1014': InvalidOrder,
                    '-1015': RateLimitExceeded,
                    '-1016': ExchangeNotAvailable,
                    '-1020': NotSupported,
                    '-1021': InvalidNonce,
                    '-1022': AuthenticationError,
                    '-1099': AuthenticationError,
                    '-1100': BadRequest,
                    '-1101': BadRequest,
                    '-1102': BadRequest,
                    '-1103': BadRequest,
                    '-1104': BadRequest,
                    '-1105': BadRequest,
                    '-1106': BadRequest,
                    '-1108': BadRequest,
                    '-1109': BadRequest,
                    '-1110': BadRequest,
                    '-1111': BadRequest,
                    '-1112': BadRequest,
                    '-1114': BadRequest,
                    '-1115': BadRequest,
                    '-1116': BadRequest,
                    '-1117': BadRequest,
                    '-1118': BadRequest,
                    '-1119': BadRequest,
                    '-1120': BadRequest,
                    '-1121': BadSymbol,
                    '-1125': AuthenticationError,
                    '-1127': BadRequest,
                    '-1128': BadRequest,
                    '-1130': BadRequest,
                    '-1131': BadRequest,
                    '-2010': InvalidOrder,
                    '-2011': OrderNotFound,
                    '-2013': OrderNotFound,
                    '-2014': AuthenticationError,
                    '-2015': AuthenticationError,
                    '-2016': ExchangeError,
                    '-2018': InsufficientFunds,
                    '-2019': InsufficientFunds,
                    '-2020': InvalidOrder,
                    '-2021': InvalidOrder,
                    '-2022': InvalidOrder,
                    '-2024': InsufficientFunds,
                    '-2025': InvalidOrder,
                    '-2026': InvalidOrder,
                },
            },
        });
    }

    sign(path: string, api: Str = 'public', method: Str = 'GET', params: Dict = {}, headers: any = undefined, body: any = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        let authVariant = 'default';
        if (this.secret.includes("PRIVATE KEY")) {
            authVariant = {"type":"hmac"};
        }
        if (true) {
            authVariant = 'hmac';
        }
        // Check for endpoint-specific auth
        if (path === 'historicalTrades') {
            authVariant = 'apiKeyOnly';
        }
        if (path === 'userDataStream') {
            authVariant = 'apiKeyOnly';
        }
        if (path === 'listenKey') {
            authVariant = 'apiKeyOnly';
        }

        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseTime(response: any, market: Market = undefined) {
        const data = response;
        return {
            'serverTime': this.safeInteger(this.safeValue(data, 'serverTime')),
        };
    }

    parseExchangeInfo(response: any, market: Market = undefined) {
        const data = response;
        return {
            'timezone': this.safeValue(data, 'timezone'),
            'serverTime': this.safeValue(data, 'serverTime'),
            'rateLimits': this.safeValue(data, 'rateLimits'),
            'symbols': this.parseMarkets(this.safeValue(data, 'symbols')),
        };
    }

    parseTicker(response: any, market: Market = undefined) {
        const data = response;
        return {
            'symbol': this.safeSymbol(this.safeValue(data, 'symbol')),
            'timestamp': this.safeTimestamp(this.safeValue(data, 'closeTime')),
            'datetime': this.iso8601(timestamp),
            'high': this.safeNumber(this.safeValue(data, 'highPrice')),
            'low': this.safeNumber(this.safeValue(data, 'lowPrice')),
            'bid': this.safeNumber(this.safeValue(data, 'bidPrice')),
            'bidVolume': this.safeNumber(this.safeValue(data, 'bidQty')),
            'ask': this.safeNumber(this.safeValue(data, 'askPrice')),
            'askVolume': this.safeNumber(this.safeValue(data, 'askQty')),
            'vwap': this.safeNumber(this.safeValue(data, 'weightedAvgPrice')),
            'open': this.safeNumber(this.safeValue(data, 'openPrice')),
            'close': this.safeNumber(this.safeValue(data, 'lastPrice')),
            'last': this.safeNumber(this.safeValue(data, 'lastPrice')),
            'previousClose': this.safeNumber(this.safeValue(data, 'prevClosePrice')),
            'change': this.safeNumber(this.safeValue(data, 'priceChange')),
            'percentage': this.safeNumber(this.safeValue(data, 'priceChangePercent')),
            'average': null,
            'baseVolume': this.safeNumber(this.safeValue(data, 'volume')),
            'quoteVolume': this.safeNumber(this.safeValue(data, 'quoteVolume')),
            'info': this.safeValue(data, 'response'),
        };
    }

    parseTickers(response: any, market: Market = undefined) {
        const data = response;
        return this.parseTicker(data, market);
    }

    parseOrderBook(response: any, market: Market = undefined) {
        const data = response;
        return {
            'symbol': params['symbol'],
            'timestamp': this.safeInteger(this.safeValue(data, 'lastUpdateId')),
            'datetime': null,
            'nonce': this.safeInteger(this.safeValue(data, 'lastUpdateId')),
            'bids': this.parseOrderBookSide(this.safeValue(data, 'bids')),
            'asks': this.parseOrderBookSide(this.safeValue(data, 'asks')),
        };
    }

    parsePublicTrades(response: any, market: Market = undefined) {
        const data = response;
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parsePublicTradesEntry(item, market));
        }
        return result;
    }

    parsePublicTradesEntry(item: any, market: Market = undefined) {
        return {
            'id': this.safeString(this.safeValue(item, 'id')),
            'timestamp': this.safeTimestamp(this.safeValue(item, 'time')),
            'datetime': this.iso8601(timestamp),
            'symbol': params['symbol'],
            'side': (isBuyerMaker) ? "sell" : "buy",
            'type': null,
            'price': this.safeNumber(this.safeValue(item, 'price')),
            'amount': this.safeNumber(this.safeValue(item, 'qty')),
            'cost': this.safeNumber(this.safeValue(item, 'quoteQty')),
            'info': this.safeValue(item, 'item'),
        };
    }

    parseKlines(response: any, market: Market = undefined) {
        const data = response;
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parseKlinesEntry(item, market));
        }
        return result;
    }

    parseKlinesEntry(item: any, market: Market = undefined) {
        return {
            'timestamp': this.safeInteger(item[0]),
            'open': this.safeNumber(item[1]),
            'high': this.safeNumber(item[2]),
            'low': this.safeNumber(item[3]),
            'close': this.safeNumber(item[4]),
            'volume': this.safeNumber(item[5]),
        };
    }

    parseBalance(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'balances', response);
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parseBalanceEntry(item, market));
        }
        return result;
    }

    parseBalanceEntry(item: any, market: Market = undefined) {
        return {
            'currency': this.safeCurrencyCode(this.safeValue(item, 'asset')),
            'free': this.safeString(this.safeValue(item, 'free')),
            'used': this.safeString(this.safeValue(item, 'locked')),
            'total': null,
        };
    }

    parseMarginBalance(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'userAssets', response);
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parseMarginBalanceEntry(item, market));
        }
        return result;
    }

    parseMarginBalanceEntry(item: any, market: Market = undefined) {
        return {
            'currency': this.safeCurrencyCode(this.safeValue(item, 'asset')),
            'free': this.safeString(this.safeValue(item, 'free')),
            'used': this.safeString(this.safeValue(item, 'locked')),
            'total': null,
            'borrowed': this.safeString(this.safeValue(item, 'borrowed')),
            'interest': this.safeString(this.safeValue(item, 'interest')),
            'debt': (borrowed + interest),
        };
    }

    parseIsolatedMarginBalance(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'assets', response);
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parseIsolatedMarginBalanceEntry(item, market));
        }
        return result;
    }

    parseIsolatedMarginBalanceEntry(item: any, market: Market = undefined) {
        return {
            '_symbolKey': this.safeSymbol(this.safeValue(item, 'asset', 'symbol')),
            '_baseAsset': this.safeValue(item, 'asset', 'baseAsset'),
            '_quoteAsset': this.safeValue(item, 'asset', 'quoteAsset'),
        };
    }

    parseFundingBalance(response: any, market: Market = undefined) {
        const data = response;
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parseFundingBalanceEntry(item, market));
        }
        return result;
    }

    parseFundingBalanceEntry(item: any, market: Market = undefined) {
        return {
            'currency': this.safeCurrencyCode(this.safeValue(item, 'asset')),
            'free': this.safeString(this.safeValue(item, 'free')),
            'used': (freeze + (locked + withdrawing)),
            'total': null,
        };
    }

    parseFuturesBalance(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'assets', response);
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parseFuturesBalanceEntry(item, market));
        }
        return result;
    }

    parseFuturesBalanceEntry(item: any, market: Market = undefined) {
        return {
            'currency': this.safeCurrencyCode(this.safeValue(item, 'asset')),
            'free': this.safeString(this.safeValue(item, 'availableBalance')),
            'used': this.safeString(this.safeValue(item, 'initialMargin')),
            'total': this.safeString(this.safeValue(item, 'walletBalance')),
        };
    }

    parseOrder(response: any, market: Market = undefined) {
        const data = response;
        return {
            'id': this.safeString(this.safeValue(data, 'orderId')),
            'clientOrderId': this.safeString(this.safeValue(data, 'clientOrderId')),
            'timestamp': this.safeTimestamp(this.safeValueN(data, [['time'], ['transactTime'], ['updateTime']])),
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.safeTimestamp(this.safeValue(data, 'updateTime')),
            'symbol': this.safeSymbol(this.safeValue(data, 'symbol')),
            'type': this.parseOrderType((this.safeValue(data, 'type'))?.toLowerCase()),
            'timeInForce': this.safeString(this.safeValue(data, 'timeInForce')),
            'postOnly': (timeInForce === "GTX"),
            'side': (this.safeValue(data, 'side'))?.toLowerCase(),
            'price': this.safeNumber(this.safeValue(data, 'price')),
            'stopPrice': this.safeNumber(this.safeValue(data, 'stopPrice')),
            'amount': this.safeNumber(this.safeValue(data, 'origQty')),
            'cost': this.safeNumber(this.safeValue(data, 'cummulativeQuoteQty')),
            'average': ((filled > 0)) ? (cost / filled) : null,
            'filled': this.safeNumber(this.safeValue(data, 'executedQty')),
            'remaining': (amount - filled),
            'status': this.parseOrderStatus(this.safeValue(data, 'status')),
            'fee': null,
            'trades': this.safeValue(data, 'fills'),
            'info': this.safeValue(data, 'response'),
        };
    }

    parseOrders(response: any, market: Market = undefined) {
        const data = response;
        return this.parseOrder(data, market);
    }

    parseOrderResult(response: any, market: Market = undefined) {
        const data = response;
        return this.parseOrder(data, market);
    }

    parseCancelResult(response: any, market: Market = undefined) {
        const data = response;
        return this.parseOrder(data, market);
    }

    parseMyTrades(response: any, market: Market = undefined) {
        const data = response;
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parseMyTradesEntry(item, market));
        }
        return result;
    }

    parseMyTradesEntry(item: any, market: Market = undefined) {
        return {
            'id': this.safeString(this.safeValue(item, 'id')),
            'order': this.safeString(this.safeValue(item, 'orderId')),
            'timestamp': this.safeTimestamp(this.safeValue(item, 'time')),
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeSymbol(this.safeValue(item, 'symbol')),
            'side': (isBuyer) ? "buy" : "sell",
            'type': null,
            'takerOrMaker': (isMaker) ? "maker" : "taker",
            'price': this.safeNumber(this.safeValue(item, 'price')),
            'amount': this.safeNumber(this.safeValue(item, 'qty')),
            'cost': this.safeNumber(this.safeValue(item, 'quoteQty')),
            'fee': { 'cost': { 'path': "commission", 'transform': "safeNumber" }, 'currency': { 'path': "commissionAsset", 'transform': "safeCurrencyCode" } },
            'info': this.safeValue(item, 'item'),
        };
    }

    parseCurrencies(response: any, market: Market = undefined) {
        const data = response;
        const result: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            result.push(this.parseCurrenciesEntry(item, market));
        }
        return result;
    }

    parseCurrenciesEntry(item: any, market: Market = undefined) {
        return {
            'id': this.safeValue(item, 'coin'),
            'code': this.safeCurrencyCode(this.safeValue(item, 'coin')),
            'name': this.safeValue(item, 'name'),
            'active': (depositAllEnable && withdrawAllEnable),
            'fee': null,
            'precision': null,
            'limits': undefined,
            'networks': this.parseNetworks(this.safeValue(item, 'networkList')),
            'info': this.safeValue(item, 'item'),
        };
    }

    parseOrderType(value: any) {
        switch (value) {
            case 'limit':
                return 'limit';
            case 'market':
                return 'market';
            case 'stop_loss':
                return 'stop';
            case 'stop_loss_limit':
                return 'stop';
            case 'take_profit':
                return 'takeProfit';
            case 'take_profit_limit':
                return 'takeProfit';
            case 'limit_maker':
                return 'limit';
            case 'trailing_stop_market':
                return 'trailing';
            default:
                return value;
        }
    }

    parseOrderStatus(value: any) {
        switch (value) {
            case 'NEW':
                return 'open';
            case 'PARTIALLY_FILLED':
                return 'open';
            case 'FILLED':
                return 'closed';
            case 'CANCELED':
                return 'canceled';
            case 'PENDING_CANCEL':
                return 'canceling';
            case 'REJECTED':
                return 'rejected';
            case 'EXPIRED':
                return 'expired';
            case 'EXPIRED_IN_MATCH':
                return 'expired';
            default:
                return value;
        }
    }

    parseOrderBookSide(value: any) {
        const result: any[] = [];
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            result.push([this.safeNumber(item[0]), this.safeNumber(item[1])]);
        }
        return result;
    }

    parseMarkets(value: any) {
        const result: any[] = [];
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            result.push({
                'id': this.safeValue(item, 'symbol'),
                'symbol': this.buildSymbol(base, quote),
                'base': this.safeCurrencyCode(this.safeValue(item, 'baseAsset')),
                'quote': this.safeCurrencyCode(this.safeValue(item, 'quoteAsset')),
                'baseId': this.safeValue(item, 'baseAsset'),
                'quoteId': this.safeValue(item, 'quoteAsset'),
                'active': (this.safeValue(item, 'status') == 'TRADING'),
                'type': (contractType) ? {"switch":"$contractType","cases":{"PERPETUAL":"swap","CURRENT_QUARTER":"future","NEXT_QUARTER":"future"},"default":"spot"} : 'spot',
                'spot': (type === 'spot'),
                'margin': this.safeValue(item, 'isMarginTradingAllowed'),
                'swap': (type === 'swap'),
                'future': (type === 'future'),
                'option': false,
                'precision': undefined,
                'limits': undefined,
            });
        }
        return result;
    }

    parsePrecision(value: any) {
        return Math.pow(10, (0 - value));
    }

    parseNetworks(value: any) {
        const result: any[] = [];
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            result.push({
                'id': this.safeValue(item, 'network'),
                'network': this.safeValue(item, 'network'),
                'name': this.safeValue(item, 'name'),
                'active': (depositEnable && withdrawEnable),
                'fee': this.safeNumber(this.safeValue(item, 'withdrawFee')),
                'limits': undefined,
            });
        }
        return result;
    }

    async fetchBalance(params: Dict = {}): Promise<Balances> {
        await this.loadMarkets();
        let type = this.safeString(params, 'type', 'spot');
        params = this.omit(params, 'type');
        let response: any;
        let parser: string;

        if (type === 'margin') {
            response = await this.sapiGetMarginAccount(params);
            parser = 'marginBalance';
        }
        else if (type === 'isolatedMargin') {
            response = await this.sapiGetMarginIsolatedAccount(params);
            parser = 'isolatedMarginBalance';
        }
        else if (type === 'funding') {
            response = await this.sapiGetAssetGetFundingAsset(params);
            parser = 'fundingBalance';
        }
        else if (type === 'linear') {
            response = await this.fapiPrivateGetAccount(params);
            parser = 'futuresBalance';
        }
        else if (type === 'inverse') {
            response = await this.dapiPrivateGetAccount(params);
            parser = 'deliveryBalance';
        }
        else if (type === 'portfolioMargin') {
            response = await this.papiGetBalance(params);
            parser = 'portfolioBalance';
        } else {
            response = await this.privateGetAccount(params);
            parser = 'balance';
        }

        return this.parseBalance(response);
    }

    async fetchTicker(symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request: Dict = { 'symbol': market['id'] };
        const response = await this.publicGetTicker(this.extend(request, params));
        return this.parseTicker(response, market);
    }

    async fetchOrderBook(symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request: Dict = { 'symbol': market['id'] };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepth(this.extend(request, params));
        return this.parseOrderBook(response, market['symbol']);
    }

    async fetchTrades(symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request: Dict = { 'symbol': market['id'] };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades(this.extend(request, params));
        return this.parseTrades(response, market, since, limit);
    }

    async fetchOHLCV(symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetKlines(this.extend(request, params));
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }

}