
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bithumb2.js';
import { ExchangeError, ExchangeNotAvailable, AuthenticationError, BadRequest, PermissionDenied, InvalidAddress, ArgumentsRequired, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { DECIMAL_PLACES, SIGNIFICANT_DIGITS, TRUNCATE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { jwt } from './base/functions/rsa.js';
import type { Balances, Currency, Dict, Int, Market, MarketInterface, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bithumb2
 * @augments Exchange
 */
export default class bithumb2 extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bithumb2',
            'name': 'Bithumb v2',
            'countries': [ 'KR' ], // South Korea
            'rateLimit': 500,
            'pro': true,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'hostname': 'bithumb.com',
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/c9e0eefb-4777-46b9-8f09-9d7f7c4af82d',
                'api': {
                    'public': 'https://api.bithumb.com/v1',
                    'private': 'https://api.bithumb.com/v1',
                    'order': 'https://api.bithumb.com/v2',
                },
                'www': 'https://www.bithumb.com',
                'doc': 'https://apidocs.bithumb.com',
                'fees': 'https://en.bithumb.com/customer_support/info_fee',
            },
            'api': {
                'public': {
                    'get': [
                        'market/all',
                        'ticker',
                        'orderbook',
                        'trades/recent',
                        'candlestick/{market}/{interval}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'orders/chance',
                        'order',
                        'orders',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.0025'),
                    'taker': this.parseNumber ('0.0025'),
                },
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'exceptions': {
                'Bad Request(SSL)': BadRequest,
                'Bad Request(Bad Method)': BadRequest,
                'Bad Request.(Auth Data)': AuthenticationError,
                'Not Member': AuthenticationError,
                'Invalid Apikey': AuthenticationError,
                'Method Not Allowed.(Access IP)': PermissionDenied,
                'Method Not Allowed.(BTC Adress)': InvalidAddress,
                'Method Not Allowed.(Access)': PermissionDenied,
                'Database Fail': ExchangeNotAvailable,
                'Invalid Parameter': BadRequest,
                'Unknown Error': ExchangeError,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '10m': '10m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '24h',
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarketAll (params);
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "korean_name": "비트코인",
        //            "english_name": "Bitcoin",
        //            "market_warning": "NONE"
        //        },
        //        ...
        //    ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const marketId = this.safeString (entry, 'market');
            const [ quoteId, baseId ] = marketId.split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': marketId,
                'symbol': symbol,
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
                'expiryDateTime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': parseInt ('4'),
                    'price': parseInt ('4'),
                },
                'limits': {
                    'leverage': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                },
                'info': entry,
            });
        }
        return result;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'markets': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "trade_date": "20231024",
        //            "trade_time": "063544",
        //            "trade_date_kts": "20231024",
        //            "trade_time_kts": "153544",
        //            "trade_timestamp": 1698125744000,
        //            "opening_price": 41531000,
        //            "high_price": 46473000,
        //            "low_price": 41511000,
        //            "trade_price": 45831000,
        //            "prev_closing_price": 41519000,
        //            "change": "RISE",
        //            "change_price": 4312000,
        //            "change_rate": 0.1038560659,
        //            "signed_change_price": 4312000,
        //            "signed_change_rate": 0.1038560659,
        //            "trade_volume": 0.0094943,
        //            "acc_trade_price": 315426173010.59125,
        //            "acc_trade_price_24h": 366228795843.045,
        //            "acc_trade_volume": 7248.51469502,
        //            "acc_trade_volume_24h": 8464.71765997,
        //            "highest_52_week_price": 46473000,
        //            "highest_52_week_date": "2023-10-24",
        //            "lowest_52_week_price": 20458000,
        //            "lowest_52_week_date": "2022-12-30",
        //            "timestamp": 1698125744837
        //        }
        //    ]
        //
        return this.parseTicker (response[0], market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const symbol = this.safeSymbol (undefined, market);
        const open = this.safeString (ticker, 'opening_price');
        const close = this.safeString (ticker, 'trade_price');
        const high = this.safeString (ticker, 'high_price');
        const low = this.safeString (ticker, 'low_price');
        const baseVolume = this.safeString (ticker, 'acc_trade_volume_24h');
        const quoteVolume = this.safeString (ticker, 'acc_trade_price_24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': this.safeString (ticker, 'prev_closing_price'),
            'change': this.safeString (ticker, 'change_price'),
            'percentage': this.safeString (ticker, 'change_rate'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'markets': market['id'],
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "timestamp": 1698125744837,
        //            "total_ask_size": 12.345,
        //            "total_bid_size": 23.456,
        //            "orderbook_units": [
        //                {
        //                    "ask_price": 45831000,
        //                    "bid_price": 45830000,
        //                    "ask_size": 0.123,
        //                    "bid_size": 0.234
        //                },
        //                ...
        //            ]
        //        }
        //    ]
        //
        const data = response[0];
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp, 'bid_price', 'ask_price', 'bid_size', 'ask_size', 'orderbook_units');
    }

    parseOrderBook (orderbook, symbol, timestamp = undefined, bidKey = 'price', askKey = 'price', bidAmountKey = 'amount', askAmountKey = 'amount', marketKey = 'orderbook_units') {
        const units = this.safeValue (orderbook, marketKey, []);
        const bids = [];
        const asks = [];
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            bids.push ([ this.safeNumber (unit, 'bid_price'), this.safeNumber (unit, 'bid_size') ]);
            asks.push ([ this.safeNumber (unit, 'ask_price'), this.safeNumber (unit, 'ask_size') ]);
        }
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicGetTradesRecent (this.extend (request, params));
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "trade_date_utc": "2023-10-24",
        //            "trade_time_utc": "06:35:44",
        //            "timestamp": 1698125744000,
        //            "trade_price": 45831000,
        //            "trade_volume": 0.0094943,
        //            "prev_closing_price": 41519000,
        //            "change_price": 4312000,
        //            "ask_bid": "ASK",
        //            "sequential_id": 1698125744000001
        //        },
        //        ...
        //    ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'ask_bid') === 'ask' ? 'sell' : 'buy';
        const price = this.safeString (trade, 'trade_price');
        const amount = this.safeString (trade, 'trade_volume');
        const id = this.safeString (trade, 'sequential_id');
        const symbol = this.safeSymbol (undefined, market);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicGetCandlestickMarketInterval (this.extend (request, params));
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "candle_date_time_utc": "2023-10-24T06:35:00",
        //            "candle_date_time_kts": "2023-10-24T15:35:00",
        //            "opening_price": 45831000,
        //            "high_price": 45831000,
        //            "low_price": 45831000,
        //            "trade_price": 45831000,
        //            "timestamp": 1698125700000,
        //            "candle_acc_trade_price": 435133614.99125,
        //            "candle_acc_trade_volume": 9.4943,
        //            "unit": 1
        //        },
        //        ...
        //    ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'opening_price'),
            this.safeNumber (ohlcv, 'high_price'),
            this.safeNumber (ohlcv, 'low_price'),
            this.safeNumber (ohlcv, 'trade_price'),
            this.safeNumber (ohlcv, 'candle_acc_trade_volume'),
        ];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        //
        //    [
        //        {
        //            "currency": "KRW",
        //            "balance": "1000000.0",
        //            "locked": "0.0",
        //            "avg_buy_price": "0",
        //            "avg_buy_price_modified": false,
        //            "unit_currency": "KRW"
        //        },
        //        ...
        //    ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (entry, 'balance');
            account['used'] = this.safeString (entry, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'side': (side === 'buy') ? 'bid' : 'ask',
            'volume': this.amountToPrecision (symbol, amount),
            'ord_type': (type === 'limit') ? 'limit' : 'price', // price is market buy/sell
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //    {
        //        "uuid": "whpnd-...",
        //        "side": "bid",
        //        "ord_type": "limit",
        //        "price": "45831000",
        //        "state": "wait",
        //        "market": "KRW-BTC",
        //        "created_at": "2023-10-24T06:35:44",
        //        "volume": "0.0094943",
        //        "remaining_volume": "0.0094943",
        //        "reserved_fee": "0.0",
        //        "remaining_fee": "100.0",
        //        "paid_fee": "0.0",
        //        "locked": "435133614.99125",
        //        "executed_volume": "0.0",
        //        "trades_count": 0
        //    }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        const request = {
            'uuid': id,
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const symbol = this.safeSymbol (this.safeString (order, 'market'), market);
        const side = this.safeStringLower (order, 'side') === 'bid' ? 'buy' : 'sell';
        const type = this.safeStringLower (order, 'ord_type');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'volume');
        const remaining = this.safeString (order, 'remaining_volume');
        const filled = this.safeString (order, 'executed_volume');
        const id = this.safeString (order, 'uuid');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
            'trades': undefined,
            'fee': {
                'currency': undefined,
                'cost': this.safeString (order, 'paid_fee'),
            },
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'wait': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.uuid ();
            const timestamp = this.milliseconds ();
            const payload: Dict = {
                'access_key': this.apiKey,
                'nonce': nonce,
                'timestamp': timestamp,
            };
            if (Object.keys (query).length) {
                if (method === 'GET' || method === 'DELETE') {
                    const queryString = this.urlencode (query);
                    url += '?' + queryString;
                    payload['query_hash'] = this.hash (this.encode (queryString), sha512);
                } else {
                    body = this.json (query);
                    payload['query_hash'] = this.hash (this.encode (this.urlencode (query)), sha512);
                }
            }
            const token = jwt (payload, this.encode (this.secret), sha256);
            headers = {
                'Authorization': 'Bearer ' + token,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
