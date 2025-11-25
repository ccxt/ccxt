import Exchange from './base/Exchange.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, Int, Num, Str, Strings, Market, Currency, Trade, Ticker, OrderBook, Order, Balances, OHLCV, Transaction } from './base/types.js';
import { AuthenticationError, BadRequest, BadSymbol, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, NotSupported, OnMaintenance, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256, sha512, md5 } from './static_dependencies/noble-hashes/sha2.js';
import { eddsa, rsa } from './base/functions/crypto.js';

export default class Kraken extends Exchange {

    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': ["US"],
            'rateLimit': 1000,
            'certified': true,
            'pro': true,
            'urls': {
                "logo": "https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg",
                "api": {
                    "public": "https://api.kraken.com",
                    "private": "https://api.kraken.com"
                },
                "www": "https://www.kraken.com",
                "doc": [
                    "https://docs.kraken.com/rest",
                    "https://docs.kraken.com/api"
                ],
                "fees": "https://www.kraken.com/features/fee-schedule"
            },
            'api': {
                'public': {
                    'get': ['time', 'assets', 'assetPairs', 'ticker', 'depth', 'trades', 'ohlc'],
                },
                'private': {
                    'post': ['balance', 'openOrders', 'closedOrders', 'queryOrders', 'addOrder', 'cancelOrder', 'addOrderBatch', 'cancelOrderBatch', 'tradesHistory', 'depositAddresses'],
                },
            },
            'has': {
                "publicAPI": true,
                "privateAPI": true,
                "spot": true,
                "margin": true,
                "fetchMarkets": true,
                "fetchCurrencies": true,
                "fetchTicker": true,
                "fetchTickers": false,
                "fetchOrderBook": true,
                "fetchTrades": true,
                "fetchOHLCV": true,
                "fetchBalance": true,
                "createOrder": true,
                "cancelOrder": true,
                "cancelAllOrders": false,
                "fetchOrder": true,
                "fetchOrders": true,
                "fetchOpenOrders": true,
                "fetchClosedOrders": true,
                "fetchMyTrades": true,
                "fetchDeposits": false,
                "fetchWithdrawals": false,
                "fetchDepositAddress": true,
                "withdraw": true
            },
            'requiredCredentials': {
                "apiKey": true,
                "secret": true
            },
            'exceptions': {
                'exact': {
                    'EGeneral:Internal error': ExchangeError,
                    'EService:Unavailable': ExchangeNotAvailable,
                    'EService:Market in cancel_only mode': OnMaintenance,
                    'EService:Market in post_only mode': OnMaintenance,
                    'EService:Deadline elapsed': RequestTimeout,
                    'EQuery:Invalid asset pair': BadSymbol,
                    'EQuery:Unknown asset pair': BadSymbol,
                    'EGeneral:Invalid arguments': BadRequest,
                    'EGeneral:Invalid arguments:volume': InvalidOrder,
                    'EAPI:Invalid key': AuthenticationError,
                    'EAPI:Invalid signature': AuthenticationError,
                    'EAPI:Invalid nonce': InvalidNonce,
                    'EGeneral:Permission denied': PermissionDenied,
                    'EOrder:Rate limit exceeded': RateLimitExceeded,
                    'EOrder:Orders limit exceeded': RateLimitExceeded,
                    'EOrder:Positions limit exceeded': InvalidOrder,
                    'EFunding:Insufficient funds': InsufficientFunds,
                    'EOrder:Insufficient funds': InsufficientFunds,
                    'EOrder:Order minimum not met': InvalidOrder,
                    'EOrder:Invalid order': InvalidOrder,
                    'EOrder:Unknown order': OrderNotFound,
                    'EQuery:Unknown order': OrderNotFound,
                },
            },
        });
    }

    sign(path: string, api: Str = 'public', method: Str = 'GET', params: Dict = {}, headers: any = undefined, body: any = undefined) {
        let url = this.urls['api'][api] + '/' + path;

        if (api === 'private' || api.includes('Private')) {
            this.checkRequiredCredentials();
            const nonce = this.nonce();

            const body = this.urlencode(this.extend({ 'nonce': nonce }, params));
            const hash = this.hash(this.encode((nonce + body)), 'sha256', 'binary');
            const urlBinary = this.encode(("/0/private/" + path));
            const payload = this.binaryConcat([urlBinary, hash]);
            const secretBinary = this.base64ToBinary(this.secret);
            const signature = this.hmac(this.encode(payload), this.encode(secretBinary), 'sha512', 'base64');
            headers = {
                'API-Key': this.apiKey,
                'API-Sign': signature,
                'Content-Type': ((path in ["CancelOrderBatch", "AddOrderBatch"])) ? "application/json" : "application/x-www-form-urlencoded",
            };
        } else {
            // Public endpoint
            if (Object.keys(params).length > 0) {
                url += '?' + this.urlencode(params);
            }
        }

        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce() {
        return (this.milliseconds() - this.options.timeDifference);
    }

    parseTime(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        return {
            'timestamp': this.multiply1000(this.safeInteger(this.safeValue(data, 'unixtime'))),
            'iso': this.iso8601(timestamp),
        };
    }

    parseBalance(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        const result: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const balanceData = data[key];
            const entry = {
                'currency': this.safeCurrencyCode(currencyId),
                'total': this.safeString(this.safeValue(balanceData, 'balanceData', 'balance')),
                'used': this.safeString(this.safeValue(balanceData, 'balanceData', 'hold_trade')),
                'free': null,
            };
            result[key] = entry;
        }
        return this.safeBalance(result);
    }

    parseTicker(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        const result: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const tickerData = data[key];
            const entry = {
                'symbol': this.safeSymbol(marketId),
                'timestamp': null,
                'datetime': null,
                'high': this.safeNumber(tickerData.h[1]),
                'low': this.safeNumber(tickerData.l[1]),
                'bid': this.safeNumber(tickerData.b[0]),
                'bidVolume': this.safeNumber(tickerData.b[2]),
                'ask': this.safeNumber(tickerData.a[0]),
                'askVolume': this.safeNumber(tickerData.a[2]),
                'vwap': this.safeNumber(tickerData.p[1]),
                'open': this.safeNumber(this.safeValue(tickerData, 'tickerData', 'o')),
                'close': this.safeNumber(tickerData.c[0]),
                'last': this.safeNumber(tickerData.c[0]),
                'previousClose': null,
                'change': null,
                'percentage': null,
                'average': null,
                'baseVolume': this.safeNumber(tickerData.v[1]),
                'quoteVolume': null,
                'info': this.safeValue(tickerData, 'tickerData'),
            };
            result[key] = entry;
        }
        return result;
    }

    parseOrderBook(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        const result: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const bookData = data[key];
            const entry = {
                'symbol': this.safeSymbol(marketId),
                'bids': this.parseOrderBookSide(this.safeValue(bookData, 'bookData', 'bids')),
                'asks': this.parseOrderBookSide(this.safeValue(bookData, 'bookData', 'asks')),
                'timestamp': null,
                'datetime': null,
                'nonce': null,
            };
            result[key] = entry;
        }
        return result;
    }

    parseTradesArray(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        const result: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const tradeArray = data[key];
            if (!((marketId !== "last"))) continue;
            const entry = {
                'id': null,
                'timestamp': this.multiply1000(this.safeNumber(item[2])),
                'datetime': this.iso8601(timestamp),
                'symbol': this.safeSymbol(marketId),
                'side': this.parseTradeSide(item[3]),
                'type': this.parseTradeType(item[4]),
                'price': this.safeNumber(item[0]),
                'amount': this.safeNumber(item[1]),
                'cost': (price * amount),
                'info': this.safeValue(tradeArray, 'item'),
            };
            result[key] = entry;
        }
        return result;
    }

    parseMyTrades(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', 'trades', response);
        const result: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const tradeData = data[key];
            const entry = {
                'id': this.safeValue(tradeData, 'tradeId'),
                'order': this.safeString(this.safeValue(tradeData, 'tradeData', 'ordertxid')),
                'timestamp': this.multiply1000(this.safeNumber(this.safeValue(tradeData, 'tradeData', 'time'))),
                'datetime': this.iso8601(timestamp),
                'symbol': this.safeSymbol(this.findMarketByAltnameOrId(tradeData.pair)),
                'side': this.safeString(this.safeValue(tradeData, 'tradeData', 'type')),
                'type': this.parseOrderType(this.safeValue(tradeData, 'tradeData', 'ordertype')),
                'price': this.safeNumber(this.safeValue(tradeData, 'tradeData', 'price')),
                'amount': this.safeNumber(this.safeValue(tradeData, 'tradeData', 'vol')),
                'cost': this.safeNumber(this.safeValue(tradeData, 'tradeData', 'cost')),
                'fee': { 'currency': { 'path': tradeData.fee, 'transform': "parseFeeFromFlags" }, 'cost': { 'path': tradeData.fee, 'transform': "safeNumber" } },
                'info': this.safeValue(tradeData, 'tradeData'),
            };
            result[key] = entry;
        }
        return result;
    }

    parseOrders(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', 'open', response);
        const result: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const orderData = data[key];
            const entry = {
                'id': this.safeValue(orderData, 'orderId'),
                'clientOrderId': this.safeString(this.safeValue(orderData, 'orderData', 'userref')),
                'timestamp': this.multiply1000(this.safeNumber(this.safeValue(orderData, 'orderData', 'opentm'))),
                'datetime': this.iso8601(timestamp),
                'lastTradeTimestamp': this.multiply1000(this.safeNumber(this.safeValue(orderData, 'orderData', 'closetm'))),
                'symbol': this.safeSymbol(this.findMarketByAltnameOrId(orderData.descr.pair)),
                'type': this.parseOrderType(this.safeValue(orderData, 'orderData', 'descr', 'ordertype')),
                'timeInForce': null,
                'postOnly': orderData.oflags.includes("post"),
                'side': this.safeString(this.safeValue(orderData, 'orderData', 'descr', 'type')),
                'price': this.omitZero(this.safeNumber(this.safeValueN(orderData, [['orderData', 'descr', 'price'], ['orderData', 'price'], ['orderData', 'limitprice']]))),
                'stopPrice': this.safeNumber(this.safeValue(orderData, 'orderData', 'stopprice')),
                'triggerPrice': { 'switch': orderData.descr.ordertype, 'cases': { 'stop-loss': $orderData.descr.price, 'stop-loss-limit': $orderData.descr.price, 'take-profit': $orderData.descr.price, 'take-profit-limit': $orderData.descr.price }, 'default': null },
                'amount': this.safeNumber(this.safeValue(orderData, 'orderData', 'vol')),
                'filled': this.safeNumber(this.safeValue(orderData, 'orderData', 'vol_exec')),
                'remaining': (amount - filled),
                'cost': this.safeNumber(this.safeValue(orderData, 'orderData', 'cost')),
                'average': ((filled > 0)) ? (cost / filled) : null,
                'status': this.parseOrderStatus(this.safeValue(orderData, 'orderData', 'status')),
                'fee': this.safeNumber(this.safeValue(orderData, 'orderData', 'fee')),
                'trades': this.safeValue(orderData, 'orderData', 'trades'),
                'info': this.safeValue(orderData, 'orderData'),
            };
            result[key] = entry;
        }
        return result;
    }

    parseOrderResult(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        return {
            'id': this.safeString(txid[0]),
            'info': this.safeValue(data, 'response'),
        };
    }

    parseCancelResult(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        return {
            'id': params['txid'],
            'count': this.safeInteger(this.safeValue(data, 'count')),
            'info': this.safeValue(data, 'response'),
        };
    }

    parseMarkets(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        const result: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const marketData = data[key];
            const entry = {
                'id': this.safeValue(marketData, 'marketId'),
                'symbol': this.buildSymbol(base, quote),
                'base': this.safeCurrencyCode(this.safeValue(marketData, 'marketData', 'base')),
                'quote': this.safeCurrencyCode(this.safeValue(marketData, 'marketData', 'quote')),
                'baseId': this.safeValue(marketData, 'marketData', 'base'),
                'quoteId': this.safeValue(marketData, 'marketData', 'quote'),
                'active': (this.safeValue(marketData, 'marketData', 'status') == 'online'),
                'type': "spot",
                'spot': true,
                'margin': (this.length(value) > 0),
                'swap': false,
                'future': false,
                'option': false,
                'precision': undefined,
                'limits': undefined,
                'info': this.safeValue(marketData, 'marketData'),
            };
            result[key] = entry;
        }
        return result;
    }

    parseCurrencies(response: any, market: Market = undefined) {
        const data = this.safeValue(response, 'result', response);
        const result: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currencyData = data[key];
            const entry = {
                'id': this.safeValue(currencyData, 'currencyId'),
                'code': this.safeCurrencyCode(this.safeValue(currencyData, 'currencyId')),
                'name': this.safeValue(currencyData, 'currencyData', 'altname'),
                'active': (this.safeValue(currencyData, 'currencyData', 'status') == 'enabled'),
                'precision': this.parsePrecision(this.safeValue(currencyData, 'currencyData', 'decimals')),
                'fee': null,
                'limits': undefined,
                'info': this.safeValue(currencyData, 'currencyData'),
            };
            result[key] = entry;
        }
        return result;
    }

    parseTradeSide(value: any) {
        switch (value) {
            case 's':
                return 'sell';
            case 'b':
                return 'buy';
            default:
                return value;
        }
    }

    parseTradeType(value: any) {
        switch (value) {
            case 'l':
                return 'limit';
            case 'm':
                return 'market';
            default:
                return value;
        }
    }

    parseOrderType(value: any) {
        switch (value) {
            case 'limit':
                return 'limit';
            case 'market':
                return 'market';
            case 'stop-loss':
                return 'stop';
            case 'stop-loss-limit':
                return 'stop';
            case 'take-profit':
                return 'takeProfit';
            case 'take-profit-limit':
                return 'takeProfit';
            case 'trailing-stop':
                return 'trailing';
            case 'trailing-stop-limit':
                return 'trailing';
            case 'settle-position':
                return 'market';
            default:
                return value;
        }
    }

    parseOrderStatus(value: any) {
        switch (value) {
            case 'pending':
                return 'open';
            case 'open':
                return 'open';
            case 'closed':
                return 'closed';
            case 'canceled':
                return 'canceled';
            case 'expired':
                return 'expired';
            default:
                return value;
        }
    }

    parsePrecision(value: any) {
        return Math.pow(10, (0 - value));
    }

    multiply1000(value: any) {
        return (value * 1000);
    }

    parseFeeFromFlags(value: any) {
        if (orderData.oflags.includes("fciq")) {
            return "$market.quote";
        } else {
            return {"if":{"op":"contains","left":"$orderData.oflags","right":"fcib"},"then":"$market.base","else":null};
        }
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

}