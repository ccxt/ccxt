
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bithumb.js';
import { ExchangeError, ExchangeNotAvailable, AuthenticationError, BadRequest, PermissionDenied, InvalidAddress } from './base/errors.js';
import { DECIMAL_PLACES, SIGNIFICANT_DIGITS, TRUNCATE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { jwt } from './base/functions/rsa.js';
import Precise from './base/Precise.js';
import type { Balances, Dict, Int, Market, MarketInterface, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bithumb
 * @augments Exchange
 */
export default class bithumb extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bithumb',
            'name': 'Bithumb',
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
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketOrder': true,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createOrderWithTakeProfitAndStopLossWs': false,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchLeverage': false,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchVolatilityHistory': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'hostname': 'bithumb.com',
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/c9e0eefb-4777-46b9-8f09-9d7f7c4af82d',
                'api': {
                    'public': 'https://api.{hostname}/public',
                    'private': 'https://api.{hostname}',
                    'v2public': 'https://api.bithumb.com/v1',
                    'v2private': 'https://api.bithumb.com/v1',
                    'v2order': 'https://api.bithumb.com/v2',
                },
                'www': 'https://www.bithumb.com',
                'doc': 'https://apidocs.bithumb.com',
                'fees': 'https://en.bithumb.com/customer_support/info_fee',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/ALL_{quoteId}',
                        'ticker/{baseId}_{quoteId}',
                        'orderbook/ALL_{quoteId}',
                        'orderbook/{baseId}_{quoteId}',
                        'transaction_history/{baseId}_{quoteId}',
                        'network-info',
                        'assetsstatus/multichain/ALL',
                        'assetsstatus/multichain/{currency}',
                        'withdraw/minimum/ALL',
                        'withdraw/minimum/{currency}',
                        'assetsstatus/ALL',
                        'assetsstatus/{baseId}',
                        'candlestick/{baseId}_{quoteId}/{interval}',
                    ],
                },
                'private': {
                    'post': [
                        'info/account',
                        'info/balance',
                        'info/wallet_address',
                        'info/ticker',
                        'info/orders',
                        'info/user_transactions',
                        'info/order_detail',
                        'trade/place',
                        'trade/cancel',
                        'trade/btc_withdrawal',
                        'trade/krw_deposit',
                        'trade/krw_withdrawal',
                        'trade/market_buy',
                        'trade/market_sell',
                        'trade/stop_limit',
                    ],
                },
                'v2public': {
                    'get': [
                        'market/all',
                        'ticker',
                        'orderbook',
                        'trades/ticks',
                        'candles/minutes/{unit}',
                        'candles/{interval}',
                        'candlestick/{market}/{interval}',
                    ],
                },
                'v2private': {
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
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'Bad Request(SSL)': BadRequest,
                'Bad Request(Bad Method)': BadRequest,
                'Bad Request.(Auth Data)': AuthenticationError, // { "status": "5100", "message": "Bad Request.(Auth Data)" }
                'Not Member': AuthenticationError,
                'Invalid Apikey': AuthenticationError, // {"status":"5300","message":"Invalid Apikey"}
                'Method Not Allowed.(Access IP)': PermissionDenied,
                'Method Not Allowed.(BTC Adress)': InvalidAddress,
                'Method Not Allowed.(Access)': PermissionDenied,
                'Database Fail': ExchangeNotAvailable,
                'Invalid Parameter': BadRequest,
                '5600': ExchangeError,
                'Unknown Error': ExchangeError,
                'After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions': ExchangeError, // {"status":"5100","message":"After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions"}
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '10m': '10',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': 'days',
                '1w': 'weeks',
                '1M': 'months',
            },
            'options': {
                'quoteCurrencies': {
                    'BTC': {
                        'limits': {
                            'cost': {
                                'min': 0.0002,
                                'max': 100,
                            },
                        },
                    },
                    'KRW': {
                        'limits': {
                            'cost': {
                                'min': 500,
                                'max': 5000000000,
                            },
                        },
                    },
                    'USDT': {
                        'limits': {
                            'cost': {
                                'min': undefined,
                                'max': undefined,
                            },
                        },
                    },
                },
            },
            'commonCurrencies': {
                'ALT': 'ArchLoot',
                'FTC': 'FTC2',
                'SOC': 'Soda Coin',
            },
        });
    }

    safeMarket (marketId: Str = undefined, market: Market = undefined, delimiter: Str = undefined, marketType: Str = undefined): MarketInterface {
        // bithumb has a different type of conflict in markets, because
        // their ids are the base currency (BTC for instance), so we can have
        // multiple "BTC" ids representing the different markets (BTC/ETH, "BTC/DOGE", etc)
        // since they're the same we just need to return one
        return super.safeMarket (marketId, market, delimiter, 'spot');
    }

    amountToPrecision (symbol, amount) {
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.v2publicGetMarketAll (params);
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
                    'amount': parseInt ('4'), // todo: check if api provides precision
                    'price': parseInt ('4'),
                },
                'limits': {
                    'leverage': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                },
                'created': undefined,
                'info': entry,
            });
        }
        return result;
    }

    parseBalance (response): Balances {
        const result: Dict = { 'info': response };
        const balances = this.safeList (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (entry, 'balance');
            account['used'] = this.safeString (entry, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.v2privateGetAccounts (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'markets': market['quote'] + '-' + market['base'],
        };
        const response = await this.v2publicGetOrderbook (this.extend (request, params));
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
        const data = this.safeDict (response, 0, {});
        const timestamp = this.safeInteger (data, 'timestamp');
        const orderbookUnits = this.safeList (data, 'orderbook_units', []);
        const bids = [];
        const asks = [];
        for (let i = 0; i < orderbookUnits.length; i++) {
            const entry = orderbookUnits[i];
            const askPrice = this.safeNumber (entry, 'ask_price');
            const askSize = this.safeNumber (entry, 'ask_size');
            const bidPrice = this.safeNumber (entry, 'bid_price');
            const bidSize = this.safeNumber (entry, 'bid_size');
            if (askPrice !== undefined && askSize !== undefined) {
                if (askSize > 0) {
                    asks.push ([ askPrice, askSize ]);
                }
            }
            if (bidPrice !== undefined && bidSize !== undefined) {
                if (bidSize > 0) {
                    bids.push ([ bidPrice, bidSize ]);
                }
            }
        }
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as any;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        let timestamp = this.safeInteger (ticker, 'timestamp');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (ticker, 'trade_timestamp');
        }
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const open = this.safeString (ticker, 'opening_price');
        const close = this.safeString (ticker, 'trade_price');
        let high = this.safeString (ticker, 'high_price');
        let low = this.safeString (ticker, 'low_price');
        // workaround for Bithumb data inconsistency
        if (close !== undefined) {
            if (high !== undefined) {
                if (Precise.stringLt (high, close)) {
                    high = close;
                }
            }
            if (low !== undefined) {
                if (Precise.stringGt (low, close)) {
                    low = close;
                }
            }
        }
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

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let marketIds = [];
        if (symbols === undefined) {
            marketIds = Object.keys (this.markets_by_id);
        } else {
            marketIds = this.marketIds (symbols);
        }
        const promises = [];
        const chunkSize = 20; // safe chunk size
        for (let i = 0; i < marketIds.length; i += chunkSize) {
            const chunk = marketIds.slice (i, i + chunkSize);
            const markets = [];
            for (let j = 0; j < chunk.length; j++) {
                const marketId = chunk[j];
                const market = this.safeMarket (marketId);
                markets.push (market['quote'] + '-' + market['base']);
            }
            const marketsString = markets.join (',');
            promises.push (this.v2publicGetTicker (this.extend (params, { 'markets': marketsString })));
        }
        const responses = await Promise.all (promises);
        const result = [];
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            for (let j = 0; j < response.length; j++) {
                result.push (response[j]);
            }
        }
        return this.parseTickers (result, symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'markets': market['quote'] + '-' + market['base'],
        };
        const response = await this.v2publicGetTicker (this.extend (request, params));
        const data = this.safeDict (response, 0, {});
        return this.parseTicker (data, market);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.parse8601 (this.safeString (ohlcv, 'candle_date_time_utc')),
            this.safeNumber (ohlcv, 'opening_price'),
            this.safeNumber (ohlcv, 'high_price'),
            this.safeNumber (ohlcv, 'low_price'),
            this.safeNumber (ohlcv, 'trade_price'),
            this.safeNumber (ohlcv, 'candle_acc_trade_volume'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'market': market['quote'] + '-' + market['base'],
        };
        if (timeframe === '1d' || timeframe === '1w' || timeframe === '1M') {
            request['interval'] = interval;
        } else {
            request['unit'] = interval;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        let response = undefined;
        if (timeframe === '1d' || timeframe === '1w' || timeframe === '1M') {
            response = await this.v2publicGetCandlesInterval (this.extend (request, params));
        } else {
            response = await this.v2publicGetCandlesMinutesUnit (this.extend (request, params));
        }
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

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['quote'] + '-' + market['base'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.v2publicGetTradesTicks (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['quote'] + '-' + market['base'],
            'side': (side === 'buy') ? 'bid' : 'ask',
            'volume': this.amountToPrecision (symbol, amount),
            'ord_type': (type === 'limit') ? 'limit' : 'price', // price is market buy/sell
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.v2privatePostOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        const request = {
            'uuid': id,
        };
        const response = await this.v2privateDeleteOrder (this.extend (request, params));
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

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['market'] = market['quote'] + '-' + market['base'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, undefined, since, limit);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request = {
            'uuid': id,
        };
        const response = await this.v2privateGetOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = this.implodeParams (path, params);
        let url = this.urls['api'][api] + '/' + endpoint;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'v2public' || api === 'v2private') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            if (api === 'v2private') {
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
                        payload['query_hash'] = this.hash (this.encode (queryString), sha512);
                        payload['query_hash_alg'] = 'SHA512';
                    } else {
                        body = this.json (query);
                        payload['query_hash'] = this.hash (this.encode (body), sha512);
                        payload['query_hash_alg'] = 'SHA512';
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
        } else {
            if (api === 'public') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                this.checkRequiredCredentials ();
                body = this.urlencode (this.extend ({
                    'endpoint': '/' + endpoint,
                }, query));
                const nonce = this.milliseconds ().toString ();
                const auth = '/' + endpoint + ';' + body + ';' + nonce;
                const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha512, 'hex');
                const signature64 = this.stringToBase64 (signature);
                headers = {
                    'Api-Key': this.apiKey,
                    'Api-Sign': signature64,
                    'Api-Nonce': nonce,
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
