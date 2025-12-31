
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bithumb.js';
import { ExchangeError, ExchangeNotAvailable, AuthenticationError, BadRequest, PermissionDenied, InvalidAddress, ArgumentsRequired, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { jwt } from './base/functions/rsa.js';
import type { Balances, Currency, Dict, Int, Market, MarketInterface, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int } from './base/types.js';

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
                    'v2Public': 'https://api.{hostname}/v1',
                    'v2Private': 'https://api.{hostname}/v1',
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
                'v2Public': {
                    'get': [
                        'market/all',
                        'ticker',
                        'orderbook',
                        'trades/ticks',
                        'candles/minutes/{unit}',
                        'candles/days',
                        'candles/weeks',
                        'candles/months',
                    ],
                },
                'v2Private': {
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
            'precisionMode': TICK_SIZE,
            // todo: update to v2 apis
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
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '10m': '10m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',   // V1 only
                '12h': '12h', // V1 only
                '1d': '24h',
                '1w': '1w',   // V2 only
                '1M': '1M',   // V2 only
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
                // V1/V2 API version dispatch options
                // Set to 'fetchMarketsV1', 'fetchTickerV1', etc. to use V1 API
                'fetchMarkets': 'fetchMarketsV2',
                'fetchTicker': 'fetchTickerV2',
                'fetchTickers': 'fetchTickersV2',
                'fetchOrderBook': 'fetchOrderBookV2',
                'fetchTrades': 'fetchTradesV2',
                'fetchOHLCV': 'fetchOHLCVV2',
                'fetchBalance': 'fetchBalanceV2',
                'createOrder': 'createOrderV2',
                'cancelOrder': 'cancelOrderV2',
                'fetchOrder': 'fetchOrderV2',
                'fetchOpenOrders': 'fetchOpenOrdersV2',
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

    /**
     * @method
     * @name bithumb#fetchMarkets
     * @description retrieves data on all markets for bithumb
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%EB%A7%88%EC%BC%93%EC%BD%94%EB%93%9C-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const methodName = this.safeString (this.options, 'fetchMarkets', 'fetchMarketsV2');
        if (methodName === 'fetchMarketsV2') {
            return await this.fetchMarketsV2 (params);
        }
        return await this.fetchMarketsV1 (params);
    }

    async fetchMarketsV1 (params = {}): Promise<Market[]> {
        const result = [];
        const quoteCurrencies = this.safeDict (this.options, 'quoteCurrencies', {});
        const quotes = Object.keys (quoteCurrencies);
        const promises = [];
        for (let i = 0; i < quotes.length; i++) {
            const request = {
                'quoteId': quotes[i],
            };
            promises.push (this.publicGetTickerALLQuoteId (this.extend (request, params)));
            //
            //    {
            //        "status": "0000",
            //        "data": {
            //            "ETH": {
            //                "opening_price": "0.05153399",
            //                "closing_price": "0.05145144",
            //                "min_price": "0.05145144",
            //                "max_price": "0.05160781",
            //                "units_traded": "6.541124172077830855",
            //                "acc_trade_value": "0.33705472498492329997697755",
            //                "prev_closing_price": "0.0515943",
            //                "units_traded_24H": "43.368879902677400513",
            //                "acc_trade_value_24H": "2.24165339555398079994373342",
            //                "fluctate_24H": "-0.00018203",
            //                "fluctate_rate_24H": "-0.35"
            //            },
            //            "XRP": {
            //                "opening_price": "0.00000918",
            //                "closing_price": "0.0000092",
            //                "min_price": "0.00000918",
            //                "max_price": "0.0000092",
            //                "units_traded": "6516.949363",
            //                "acc_trade_value": "0.0598792533602796",
            //                "prev_closing_price": "0.00000916",
            //                "units_traded_24H": "229161.50354738",
            //                "acc_trade_value_24H": "2.0446589371637117",
            //                "fluctate_24H": "0.00000049",
            //                "fluctate_rate_24H": "5.63"
            //            },
            //            ...
            //            "date": "1721675913145"
            //        }
            //    }
            //
        }
        const results = await Promise.all (promises);
        for (let i = 0; i < quotes.length; i++) {
            const quote = quotes[i];
            const quoteId = quote;
            const response = results[i];
            const data = this.safeDict (response, 'data');
            const extension = this.safeDict (quoteCurrencies, quote, {});
            const currencyIds = Object.keys (data);
            for (let j = 0; j < currencyIds.length; j++) {
                const currencyId = currencyIds[j];
                if (currencyId === 'date') {
                    continue;
                }
                const market = data[currencyId];
                const base = this.safeCurrencyCode (currencyId);
                let active = true;
                if (Array.isArray (market)) {
                    const numElements = market.length;
                    if (numElements === 0) {
                        active = false;
                    }
                }
                const entry = this.deepExtend ({
                    'id': currencyId,
                    'symbol': base + '/' + quote,
                    'base': base,
                    'quote': quote,
                    'settle': undefined,
                    'baseId': currencyId,
                    'quoteId': quoteId,
                    'settleId': undefined,
                    'type': 'spot',
                    'spot': true,
                    'margin': false,
                    'swap': false,
                    'future': false,
                    'option': false,
                    'active': active,
                    'contract': false,
                    'linear': undefined,
                    'inverse': undefined,
                    'contractSize': undefined,
                    'expiry': undefined,
                    'expiryDateTime': undefined,
                    'strike': undefined,
                    'optionType': undefined,
                    'precision': {
                        'amount': this.parseNumber ('1e-8'),
                        'price': this.parseNumber ('1e-8'),
                    },
                    'limits': {
                        'leverage': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'price': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'cost': {}, // set via options
                    },
                    'created': undefined,
                    'info': market,
                }, extension);
                result.push (entry);
            }
        }
        return result;
    }

    async fetchMarketsV2 (params = {}): Promise<Market[]> {
        //
        // V2 API: GET /v1/market/all
        // Response: [{ "market": "KRW-BTC", "korean_name": "비트코인", "english_name": "Bitcoin", "market_warning": "NONE" }]
        //
        const response = await this.v2PublicGetMarketAll (params);
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
        const quoteCurrencies = this.safeDict (this.options, 'quoteCurrencies', {});
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const marketId = this.safeString (market, 'market');
            const parts = marketId.split ('-');
            const quoteId = this.safeString (parts, 0);
            const baseId = this.safeString (parts, 1);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const extension = this.safeDict (quoteCurrencies, quote, {});
            const entry = this.deepExtend ({
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
                    'amount': this.parseNumber ('1e-8'),
                    'price': this.parseNumber ('1e-8'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {}, // set via options
                },
                'created': undefined,
                'info': market,
            }, extension);
            result.push (entry);
        }
        return result;
    }

    /**
     * @method
     * @name bithumb#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B3%B4%EC%9C%A0%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%EC%A0%84%EC%B2%B4-%EA%B3%84%EC%A2%8C-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        const methodName = this.safeString (this.options, 'fetchBalance', 'fetchBalanceV2');
        if (methodName === 'fetchBalanceV2') {
            return await this.fetchBalanceV2 (params);
        }
        return await this.fetchBalanceV1 (params);
    }

    async fetchBalanceV1 (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const request: Dict = {
            'currency': 'ALL',
        };
        const response = await this.privatePostInfoBalance (this.extend (request, params));
        return this.parseBalanceV1 (response);
    }

    parseBalanceV1 (response): Balances {
        const result: Dict = { 'info': response };
        const balances = this.safeDict (response, 'data');
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const account = this.account ();
            const currency = this.currency (code);
            const lowerCurrencyId = this.safeStringLower (currency, 'id');
            account['total'] = this.safeString (balances, 'total_' + lowerCurrencyId);
            account['used'] = this.safeString (balances, 'in_use_' + lowerCurrencyId);
            account['free'] = this.safeString (balances, 'available_' + lowerCurrencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalanceV2 (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.v2PrivateGetAccounts (params);
        //
        //    [
        //        {
        //            "currency": "BTC",
        //            "balance": "1.0",
        //            "locked": "0.0",
        //            "avg_buy_price": "50000000",
        //            "avg_buy_price_modified": false,
        //            "unit_currency": "KRW"
        //        },
        //        ...
        //    ]
        //
        return this.parseBalanceV2 (response);
    }

    parseBalanceV2 (response: any[]): Balances {
        const result: Dict = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name bithumb#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const methodName = this.safeString (this.options, 'fetchOrderBook', 'fetchOrderBookV2');
        if (methodName === 'fetchOrderBookV2') {
            return await this.fetchOrderBookV2 (symbol, limit, params);
        }
        return await this.fetchOrderBookV1 (symbol, limit, params);
    }

    async fetchOrderBookV1 (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'baseId': market['baseId'],
            'quoteId': market['quoteId'],
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 30, max 30
        }
        const response = await this.publicGetOrderbookBaseIdQuoteId (this.extend (request, params));
        //
        //     {
        //         "status":"0000",
        //         "data":{
        //             "timestamp":"1587621553942",
        //             "payment_currency":"KRW",
        //             "order_currency":"BTC",
        //             "bids":[
        //                 {"price":"8652000","quantity":"0.0043"},
        //                 {"price":"8651000","quantity":"0.0049"},
        //                 {"price":"8650000","quantity":"8.4791"},
        //             ],
        //             "asks":[
        //                 {"price":"8654000","quantity":"0.119"},
        //                 {"price":"8655000","quantity":"0.254"},
        //                 {"price":"8658000","quantity":"0.119"},
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    async fetchOrderBookV2 (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        // Note: Bithumb V2 API does not support limit parameter
        // - Single market: returns up to 30 orderbook levels
        // - Multiple markets: returns up to 15 orderbook levels
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'markets': market['id'],
        };
        const response = await this.v2PublicGetOrderbook (this.extend (request, params));
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "timestamp": 1696161600000,
        //            "total_ask_size": 100.5,
        //            "total_bid_size": 200.3,
        //            "orderbook_units": [
        //                {
        //                    "ask_price": 38000000,
        //                    "bid_price": 37900000,
        //                    "ask_size": 1.5,
        //                    "bid_size": 2.0
        //                },
        //                ...
        //            ]
        //        }
        //    ]
        //
        const data = this.safeValue (response, 0, {});
        const timestamp = this.safeInteger (data, 'timestamp');
        const orderbookUnits = this.safeList (data, 'orderbook_units', []);
        return this.parseOrderBookV2 (orderbookUnits, symbol, timestamp);
    }

    parseOrderBookV2 (orderbookUnits: any[], symbol: Str, timestamp: Int): OrderBook {
        const bids = [];
        const asks = [];
        for (let i = 0; i < orderbookUnits.length; i++) {
            const unit = orderbookUnits[i];
            const bidPrice = this.safeNumber (unit, 'bid_price');
            const bidSize = this.safeNumber (unit, 'bid_size');
            const askPrice = this.safeNumber (unit, 'ask_price');
            const askSize = this.safeNumber (unit, 'ask_size');
            bids.push ([ bidPrice, bidSize ]);
            asks.push ([ askPrice, askSize ]);
        }
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': timestamp,
        } as OrderBook;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        // V2 response has 'market' field, V1 does not
        if ('market' in ticker) {
            return this.parseTickerV2 (ticker, market);
        }
        return this.parseTickerV1 (ticker, market);
    }

    parseTickerV1 (ticker: Dict, market: Market = undefined): Ticker {
        //
        // fetchTicker, fetchTickers (V1)
        //
        //     {
        //         "opening_price":"227100",
        //         "closing_price":"228400",
        //         "min_price":"222300",
        //         "max_price":"230000",
        //         "units_traded":"82618.56075337",
        //         "acc_trade_value":"18767376138.6031",
        //         "prev_closing_price":"227100",
        //         "units_traded_24H":"151871.13484676",
        //         "acc_trade_value_24H":"34247610416.8974",
        //         "fluctate_24H":"8700",
        //         "fluctate_rate_24H":"3.96",
        //         "date":"1587710327264", // fetchTickers inject this
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date');
        const symbol = this.safeSymbol (undefined, market);
        const open = this.safeString (ticker, 'opening_price');
        const close = this.safeString (ticker, 'closing_price');
        const baseVolume = this.safeString (ticker, 'units_traded_24H');
        const quoteVolume = this.safeString (ticker, 'acc_trade_value_24H');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'max_price'),
            'low': this.safeString (ticker, 'min_price'),
            'bid': this.safeString (ticker, 'buy_price'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell_price'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bithumb#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        const methodName = this.safeString (this.options, 'fetchTickers', 'fetchTickersV2');
        if (methodName === 'fetchTickersV2') {
            return await this.fetchTickersV2 (symbols, params);
        }
        return await this.fetchTickersV1 (symbols, params);
    }

    async fetchTickersV1 (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const result: Dict = {};
        const quoteCurrencies = this.safeDict (this.options, 'quoteCurrencies', {});
        const quotes = Object.keys (quoteCurrencies);
        const promises = [];
        for (let i = 0; i < quotes.length; i++) {
            const request: Dict = {
                'quoteId': quotes[i],
            };
            promises.push (this.publicGetTickerALLQuoteId (this.extend (request, params)));
        }
        const responses = await Promise.all (promises);
        for (let i = 0; i < quotes.length; i++) {
            const quote = quotes[i];
            const response = responses[i];
            //
            //     {
            //         "status":"0000",
            //         "data":{
            //             "BTC":{
            //                 "opening_price":"9045000",
            //                 "closing_price":"9132000",
            //                 "min_price":"8938000",
            //                 "max_price":"9168000",
            //                 "units_traded":"4619.79967497",
            //                 "acc_trade_value":"42021363832.5187",
            //                 "prev_closing_price":"9041000",
            //                 "units_traded_24H":"8793.5045804",
            //                 "acc_trade_value_24H":"78933458515.4962",
            //                 "fluctate_24H":"530000",
            //                 "fluctate_rate_24H":"6.16"
            //             },
            //             "date":"1587710878669"
            //         }
            //     }
            //
            const data = this.safeDict (response, 'data', {});
            const timestamp = this.safeInteger (data, 'date');
            const tickers = this.omit (data, 'date');
            const currencyIds = Object.keys (tickers);
            for (let j = 0; j < currencyIds.length; j++) {
                const currencyId = currencyIds[j];
                const ticker = data[currencyId];
                const base = this.safeCurrencyCode (currencyId);
                const symbol = base + '/' + quote;
                const market = this.safeMarket (symbol);
                ticker['date'] = timestamp;
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTickersV2 (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let marketIds = undefined;
        if (symbols === undefined) {
            marketIds = this.ids;
        } else {
            marketIds = this.marketIds (symbols);
        }
        // Bithumb V2 API has URL length limit (~3000 chars for markets parameter)
        // so we need to split into batches
        const maxBatchSize = 300;
        const numMarkets = marketIds.length;
        let numBatches = this.parseToInt (numMarkets / maxBatchSize);
        numBatches = this.sum (numBatches, 1);
        const promises = [];
        for (let j = 0; j < numBatches; j++) {
            const batchIds = [];
            for (let k = 0; k < maxBatchSize; k++) {
                const index = this.sum (j * maxBatchSize, k);
                if (index < numMarkets) {
                    batchIds.push (marketIds[index]);
                }
            }
            if (batchIds.length > 0) {
                const request: Dict = {
                    'markets': batchIds.join (','),
                };
                promises.push (this.v2PublicGetTicker (this.extend (request, params)));
            }
        }
        const responses = await Promise.all (promises);
        let response = [];
        for (let i = 0; i < responses.length; i++) {
            response = this.arrayConcat (response, responses[i]);
        }
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "trade_date": "20231001",
        //            "trade_time": "120000",
        //            "trade_date_kst": "20231001",
        //            "trade_time_kst": "210000",
        //            "trade_timestamp": 1696161600000,
        //            "opening_price": 37000000,
        //            "high_price": 38000000,
        //            "low_price": 36000000,
        //            "trade_price": 37500000,
        //            "prev_closing_price": 37000000,
        //            "change": "RISE",
        //            "change_price": 500000,
        //            "change_rate": 0.0135,
        //            "signed_change_price": 500000,
        //            "signed_change_rate": 0.0135,
        //            "trade_volume": 0.5,
        //            "acc_trade_price": 1000000000,
        //            "acc_trade_price_24h": 2000000000,
        //            "acc_trade_volume": 100,
        //            "acc_trade_volume_24h": 200,
        //            "highest_52_week_price": 50000000,
        //            "highest_52_week_date": "2023-01-01",
        //            "lowest_52_week_price": 30000000,
        //            "lowest_52_week_date": "2023-06-01",
        //            "timestamp": 1696161600000
        //        },
        //        ...
        //    ]
        //
        return this.parseTickers (response, symbols);
    }

    /**
     * @method
     * @name bithumb#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        const methodName = this.safeString (this.options, 'fetchTicker', 'fetchTickerV2');
        if (methodName === 'fetchTickerV2') {
            return await this.fetchTickerV2 (symbol, params);
        }
        return await this.fetchTickerV1 (symbol, params);
    }

    async fetchTickerV1 (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'baseId': market['baseId'],
            'quoteId': market['quoteId'],
        };
        const response = await this.publicGetTickerBaseIdQuoteId (this.extend (request, params));
        //
        //     {
        //         "status":"0000",
        //         "data":{
        //             "opening_price":"227100",
        //             "closing_price":"228400",
        //             "min_price":"222300",
        //             "max_price":"230000",
        //             "units_traded":"82618.56075337",
        //             "acc_trade_value":"18767376138.6031",
        //             "prev_closing_price":"227100",
        //             "units_traded_24H":"151871.13484676",
        //             "acc_trade_value_24H":"34247610416.8974",
        //             "fluctate_24H":"8700",
        //             "fluctate_rate_24H":"3.96",
        //             "date":"1587710327264"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickerV2 (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'markets': market['id'],
        };
        const response = await this.v2PublicGetTicker (this.extend (request, params));
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "trade_date": "20231001",
        //            "trade_time": "120000",
        //            "trade_date_kst": "20231001",
        //            "trade_time_kst": "210000",
        //            "trade_timestamp": 1696161600000,
        //            "opening_price": 37000000,
        //            "high_price": 38000000,
        //            "low_price": 36000000,
        //            "trade_price": 37500000,
        //            "prev_closing_price": 37000000,
        //            "change": "RISE",
        //            "change_price": 500000,
        //            "change_rate": 0.0135,
        //            "signed_change_price": 500000,
        //            "signed_change_rate": 0.0135,
        //            "trade_volume": 0.5,
        //            "acc_trade_price": 1000000000,
        //            "acc_trade_price_24h": 2000000000,
        //            "acc_trade_volume": 100,
        //            "acc_trade_volume_24h": 200,
        //            "highest_52_week_price": 50000000,
        //            "highest_52_week_date": "2023-01-01",
        //            "lowest_52_week_price": 20000000,
        //            "lowest_52_week_date": "2023-06-01",
        //            "timestamp": 1696161600000
        //        }
        //    ]
        //
        const data = this.safeValue (response, 0, {});
        return this.parseTickerV2 (data, market);
    }

    parseTickerV2 (ticker: Dict, market: Market = undefined): Ticker {
        //
        //    {
        //        "market": "KRW-BTC",
        //        "trade_date": "20231001",
        //        "trade_timestamp": 1696161600000,
        //        "opening_price": 37000000,
        //        "high_price": 38000000,
        //        "low_price": 36000000,
        //        "trade_price": 37500000,
        //        "prev_closing_price": 37000000,
        //        "change": "RISE",
        //        "change_price": 500000,
        //        "change_rate": 0.0135,
        //        "acc_trade_price_24h": 2000000000,
        //        "acc_trade_volume_24h": 200,
        //        "timestamp": 1696161600000
        //    }
        //
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeString (ticker, 'trade_price');
        const open = this.safeString (ticker, 'opening_price');
        const high = this.safeString (ticker, 'high_price');
        const low = this.safeString (ticker, 'low_price');
        const previousClose = this.safeString (ticker, 'prev_closing_price');
        const baseVolume = this.safeString (ticker, 'acc_trade_volume_24h');
        const quoteVolume = this.safeString (ticker, 'acc_trade_price_24h');
        const change = this.safeString (ticker, 'signed_change_price');
        const percentage = Precise.stringMul (this.safeString (ticker, 'signed_change_rate'), '100');
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
            'close': last,
            'last': last,
            'previousClose': previousClose,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        // V2 response is an object with 'market' field
        if ('market' in ohlcv) {
            //
            //    {
            //        "market": "KRW-BTC",
            //        "candle_date_time_utc": "2023-10-01T00:00:00",
            //        "candle_date_time_kst": "2023-10-01T09:00:00",
            //        "opening_price": 35000000,
            //        "high_price": 36000000,
            //        "low_price": 34500000,
            //        "trade_price": 35500000,
            //        "timestamp": 1696161600000,
            //        "candle_acc_trade_price": 1234567890.12,
            //        "candle_acc_trade_volume": 123.456,
            //        "unit": 1
            //    }
            //
            return [
                this.parse8601 (this.safeString (ohlcv, 'candle_date_time_utc')),
                this.safeNumber (ohlcv, 'opening_price'),
                this.safeNumber (ohlcv, 'high_price'),
                this.safeNumber (ohlcv, 'low_price'),
                this.safeNumber (ohlcv, 'trade_price'),
                this.safeNumber (ohlcv, 'candle_acc_trade_volume'),
            ];
        }
        // V1 response is an array
        //
        //     [
        //         1576823400000, // 기준 시간
        //         "8284000", // 시가
        //         "8286000", // 종가
        //         "8289000", // 고가
        //         "8276000", // 저가
        //         "15.41503692" // 거래량
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name bithumb#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/candlestick-rest-api
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%EB%B6%84minute-%EC%BA%94%EB%93%A4-1
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const methodName = this.safeString (this.options, 'fetchOHLCV', 'fetchOHLCVV2');
        if (methodName === 'fetchOHLCVV2') {
            return await this.fetchOHLCVV2 (symbol, timeframe, since, limit, params);
        }
        return await this.fetchOHLCVV1 (symbol, timeframe, since, limit, params);
    }

    async fetchOHLCVV1 (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'baseId': market['baseId'],
            'quoteId': market['quoteId'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const response = await this.publicGetCandlestickBaseIdQuoteIdInterval (this.extend (request, params));
        //
        //     {
        //         "status": "0000",
        //         "data": {
        //             [
        //                 1576823400000, // 기준 시간
        //                 "8284000", // 시가
        //                 "8286000", // 종가
        //                 "8289000", // 고가
        //                 "8276000", // 저가
        //                 "15.41503692" // 거래량
        //             ],
        //             [
        //                 1576824000000, // 기준 시간
        //                 "8284000", // 시가
        //                 "8281000", // 종가
        //                 "8289000", // 고가
        //                 "8275000", // 저가
        //                 "6.19584467" // 거래량
        //             ],
        //         }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchOHLCVV2 (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timeframePeriod = this.parseTimeframe (timeframe);
        if (limit === undefined) {
            limit = 200;
        }
        const request: Dict = {
            'market': market['id'],
            'count': limit,
        };
        if (since !== undefined) {
            // convert `since` to `to` value (V2 API uses 'to' as exclusive end time)
            request['to'] = this.iso8601 (this.sum (since, timeframePeriod * limit * 1000));
        }
        let response = undefined;
        if (timeframe === '1m' || timeframe === '3m' || timeframe === '5m' || timeframe === '10m' || timeframe === '15m' || timeframe === '30m' || timeframe === '1h' || timeframe === '4h') {
            const numMinutes = Math.round (timeframePeriod / 60);
            request['unit'] = numMinutes;
            response = await this.v2PublicGetCandlesMinutesUnit (this.extend (request, params));
        } else if (timeframe === '1d') {
            response = await this.v2PublicGetCandlesDays (this.extend (request, params));
        } else if (timeframe === '1w') {
            response = await this.v2PublicGetCandlesWeeks (this.extend (request, params));
        } else if (timeframe === '1M') {
            response = await this.v2PublicGetCandlesMonths (this.extend (request, params));
        } else {
            throw new BadRequest (this.id + ' fetchOHLCVV2() does not support timeframe ' + timeframe);
        }
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "candle_date_time_utc": "2023-10-01T00:00:00",
        //            "candle_date_time_kst": "2023-10-01T09:00:00",
        //            "opening_price": 35000000,
        //            "high_price": 36000000,
        //            "low_price": 34500000,
        //            "trade_price": 35500000,
        //            "timestamp": 1696161600000,
        //            "candle_acc_trade_price": 1234567890.12,
        //            "candle_acc_trade_volume": 123.456,
        //            "unit": 1
        //        }
        //    ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name bithumb#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const methodName = this.safeString (this.options, 'fetchTrades', 'fetchTradesV2');
        if (methodName === 'fetchTradesV2') {
            return await this.fetchTradesV2 (symbol, since, limit, params);
        }
        return await this.fetchTradesV1 (symbol, since, limit, params);
    }

    async fetchTradesV1 (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'baseId': market['baseId'],
            'quoteId': market['quoteId'],
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 20, max 100
        }
        const response = await this.publicGetTransactionHistoryBaseIdQuoteId (this.extend (request, params));
        //
        //     {
        //         "status":"0000",
        //         "data":[
        //             {
        //                 "transaction_date":"2020-04-23 22:21:46",
        //                 "type":"ask",
        //                 "units_traded":"0.0125",
        //                 "price":"8667000",
        //                 "total":"108337"
        //             },
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTradesV1 (data, market, since, limit);
    }

    parseTradesV1 (trades: any[], market: Market = undefined, since: Int = undefined, limit: Int = undefined): Trade[] {
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.parseTradeV1 (trades[i], market);
            result.push (trade);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseTradeV1 (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //     {
        //         "transaction_date":"2020-04-23 22:21:46",
        //         "type":"ask",
        //         "units_traded":"0.0125",
        //         "price":"8667000",
        //         "total":"108337"
        //     }
        //
        // fetchOrder (private)
        //
        //     {
        //         "transaction_date": "1572497603902030",
        //         "price": "8601000",
        //         "units": "0.005",
        //         "fee_currency": "KRW",
        //         "fee": "107.51",
        //         "total": "43005"
        //     }
        //
        // a workaround for their bug in date format, hours are not 0-padded
        let timestamp = undefined;
        const transactionDatetime = this.safeString (trade, 'transaction_date');
        if (transactionDatetime !== undefined) {
            const parts = transactionDatetime.split (' ');
            const numParts = parts.length;
            if (numParts > 1) {
                const transactionDate = parts[0];
                let transactionTime = parts[1];
                if (transactionTime.length < 8) {
                    transactionTime = '0' + transactionTime;
                }
                timestamp = this.parse8601 (transactionDate + ' ' + transactionTime);
            } else {
                timestamp = this.safeIntegerProduct (trade, 'transaction_date', 0.001);
            }
        }
        if (timestamp !== undefined) {
            timestamp -= 9 * 3600000; // they report UTC + 9 hours, server in Korean timezone
        }
        const type = undefined;
        let side = this.safeStringLower (trade, 'type');
        side = (side === 'ask') ? 'sell' : 'buy';
        const id = this.safeString (trade, 'cont_no');
        market = this.safeMarket (undefined, market);
        const priceString = this.safeString (trade, 'price');
        const amountString = this.fixCommaNumber (this.safeString2 (trade, 'units_traded', 'units'));
        const costString = this.safeString (trade, 'total');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.commonCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTradesV2 (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        //
        // WARNING: Bithumb's sequential_id is NOT unique per trade.
        // When a market order fills across multiple price levels, all resulting trades share the same sequential_id.
        // This may cause:
        // - Duplicate trades at page boundaries (users should deduplicate results)
        // - Pagination stall if a single order has 500+ fills (extremely rare but theoretically possible)
        //
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTradesV2', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTradesV2', symbol, since, limit, params, 'sequential_id', 'cursor', '1', 500) as Trade[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = Math.min (limit, 500); // API default 1, max 500
        }
        const response = await this.v2PublicGetTradesTicks (this.extend (request, params));
        //
        //    [
        //        {
        //            "market": "KRW-BTC",
        //            "trade_date_utc": "2023-10-01",
        //            "trade_time_utc": "12:00:00",
        //            "timestamp": 1696161600000,
        //            "trade_price": 37500000,
        //            "trade_volume": 0.5,
        //            "prev_closing_price": 37000000,
        //            "change_price": 500000,
        //            "ask_bid": "BID",
        //            "sequential_id": 1234567890
        //        },
        //        ...
        //    ]
        //
        return this.parseTradesV2 (response, market, since, limit);
    }

    parseTradesV2 (trades: any[], market: Market = undefined, since: Int = undefined, limit: Int = undefined): Trade[] {
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.parseTradeV2 (trades[i], market);
            result.push (trade);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseTradeV2 (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //    {
        //        "market": "KRW-BTC",
        //        "trade_date_utc": "2023-10-01",
        //        "trade_time_utc": "12:00:00",
        //        "timestamp": 1696161600000,
        //        "trade_price": 37500000,
        //        "trade_volume": 0.5,
        //        "prev_closing_price": 37000000,
        //        "change_price": 500000,
        //        "ask_bid": "BID",
        //        "sequential_id": 1234567890
        //    }
        //
        // fetchOrder trades (private)
        //
        //    {
        //        "market": "KRW-BTC",
        //        "uuid": "trade-uuid-1234",
        //        "price": "50000000",
        //        "volume": "0.01",
        //        "funds": "500000",
        //        "side": "bid",
        //        "created_at": "2023-10-01T12:00:01+09:00"
        //    }
        //
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        let timestamp = this.safeInteger (trade, 'timestamp');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        }
        const id = this.safeString2 (trade, 'sequential_id', 'uuid');
        const priceString = this.safeString2 (trade, 'trade_price', 'price');
        const amountString = this.safeString2 (trade, 'trade_volume', 'volume');
        const cost = this.safeString (trade, 'funds');
        let side = undefined;
        const askBid = this.safeStringLower (trade, 'ask_bid');
        if (askBid !== undefined) {
            side = (askBid === 'bid') ? 'buy' : 'sell';
        } else {
            const sideRaw = this.safeStringLower (trade, 'side');
            if (sideRaw !== undefined) {
                side = (sideRaw === 'bid') ? 'buy' : 'sell';
            }
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': cost,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name bithumb#createOrder
     * @description create a trade order
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%A7%80%EC%A0%95%EA%B0%80-%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EC%88%98%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EB%8F%84%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const methodName = this.safeString (this.options, 'createOrder', 'createOrderV2');
        if (methodName === 'createOrderV2') {
            return await this.createOrderV2 (symbol, type, side, amount, price, params);
        }
        return await this.createOrderV1 (symbol, type, side, amount, price, params);
    }

    async createOrderV1 (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'order_currency': market['id'],
            'payment_currency': market['quote'],
            'units': amount,
        };
        let method = 'privatePostTradePlace';
        if (type === 'limit') {
            request['price'] = price;
            request['type'] = (side === 'buy') ? 'bid' : 'ask';
        } else {
            method = 'privatePostTradeMarket' + this.capitalize (side);
        }
        const response = await this[method] (this.extend (request, params));
        const id = this.safeString (response, 'order_id');
        if (id === undefined) {
            throw new InvalidOrder (this.id + ' createOrder() did not return an order id');
        }
        return this.safeOrder ({
            'info': response,
            'symbol': symbol,
            'type': type,
            'side': side,
            'id': id,
        }, market);
    }

    async createOrderV2 (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'side': (side === 'buy') ? 'bid' : 'ask',
        };
        if (type === 'limit') {
            request['ord_type'] = 'limit';
            request['volume'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            // market order
            if (side === 'buy') {
                // market buy - requires price (total KRW to spend)
                request['ord_type'] = 'price';
                request['price'] = this.priceToPrecision (symbol, price);
            } else {
                // market sell - requires volume
                request['ord_type'] = 'market';
                request['volume'] = this.amountToPrecision (symbol, amount);
            }
        }
        const response = await this.v2PrivatePostOrders (this.extend (request, params));
        //
        //    {
        //        "uuid": "d0c5a9c6-1234-5678-abcd-ef1234567890",
        //        "side": "bid",
        //        "ord_type": "limit",
        //        "price": "50000000",
        //        "state": "wait",
        //        "market": "KRW-BTC",
        //        "created_at": "2023-10-01T12:00:00+09:00",
        //        "volume": "0.01",
        //        "remaining_volume": "0.01",
        //        "reserved_fee": "25",
        //        "remaining_fee": "25",
        //        "paid_fee": "0",
        //        "locked": "500025",
        //        "executed_volume": "0",
        //        "trades_count": 0
        //    }
        //
        return this.parseOrderV2 (response, market);
    }

    /**
     * @method
     * @name bithumb#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%83%81%EC%84%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%EA%B0%9C%EB%B3%84-%EC%A3%BC%EB%AC%B8-%EC%A1%B0%ED%9A%8C
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        const methodName = this.safeString (this.options, 'fetchOrder', 'fetchOrderV2');
        if (methodName === 'fetchOrderV2') {
            return await this.fetchOrderV2 (id, symbol, params);
        }
        return await this.fetchOrderV1 (id, symbol, params);
    }

    async fetchOrderV1 (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderV1() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'order_id': id,
            'count': 1,
            'order_currency': market['base'],
            'payment_currency': market['quote'],
        };
        const response = await this.privatePostInfoOrderDetail (this.extend (request, params));
        //
        //     {
        //         "status": "0000",
        //         "data": {
        //             "order_date": "1603161798539254",
        //             "type": "ask",
        //             "order_status": "Cancel",
        //             "order_currency": "BTC",
        //             "payment_currency": "KRW",
        //             "watch_price": "0",
        //             "order_price": "13344000",
        //             "order_qty": "0.0125",
        //             "cancel_date": "1603161803809993",
        //             "cancel_type": "사용자취소",
        //             "contract": [
        //                 {
        //                     "transaction_date": "1603161799976383",
        //                     "price": "13344000",
        //                     "units": "0.0015",
        //                     "fee_currency": "KRW",
        //                     "fee": "0",
        //                     "total": "20016"
        //                 }
        //             ],
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data');
        return this.parseOrderV1 (this.extend (data, { 'order_id': id }), market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'Pending': 'open',
            'Completed': 'closed',
            'Cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderV1 (order: Dict, market: Market = undefined): Order {
        //
        //
        // fetchOrder
        //
        //     {
        //         "transaction_date": "1572497603668315",
        //         "type": "bid",
        //         "order_status": "Completed", // Completed, Cancel ...
        //         "order_currency": "BTC",
        //         "payment_currency": "KRW",
        //         "watch_price": "0", // present in Cancel order
        //         "order_price": "8601000",
        //         "order_qty": "0.007",
        //         "cancel_date": "", // filled in Cancel order
        //         "cancel_type": "", // filled in Cancel order, i.e. 사용자취소
        //         "contract": [
        //             {
        //                 "transaction_date": "1572497603902030",
        //                 "price": "8601000",
        //                 "units": "0.005",
        //                 "fee_currency": "KRW",
        //                 "fee": "107.51",
        //                 "total": "43005"
        //             },
        //         ]
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "order_currency": "BTC",
        //         "payment_currency": "KRW",
        //         "order_id": "C0101000007408440032",
        //         "order_date": "1571728739360570",
        //         "type": "bid",
        //         "units": "5.0",
        //         "units_remaining": "5.0",
        //         "price": "501000",
        //     }
        //
        const timestamp = this.safeIntegerProduct (order, 'order_date', 0.001);
        const sideProperty = this.safeStringLower2 (order, 'type', 'side');
        const side = (sideProperty === 'bid') ? 'buy' : 'sell';
        const status = this.parseOrderStatus (this.safeString (order, 'order_status'));
        const price = this.safeString2 (order, 'order_price', 'price');
        let type = 'limit';
        if (Precise.stringEquals (price, '0')) {
            type = 'market';
        }
        const amount = this.fixCommaNumber (this.safeString2 (order, 'order_qty', 'units'));
        let remaining = this.fixCommaNumber (this.safeString (order, 'units_remaining'));
        if (remaining === undefined) {
            if (status === 'closed') {
                remaining = '0';
            } else if (status !== 'canceled') {
                remaining = amount;
            }
        }
        let symbol = undefined;
        const baseId = this.safeString (order, 'order_currency');
        const quoteId = this.safeString (order, 'payment_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        if ((base !== undefined) && (quote !== undefined)) {
            symbol = base + '/' + quote;
        }
        if (symbol === undefined) {
            market = this.safeMarket (undefined, market);
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'order_id');
        const rawTrades = this.safeList (order, 'contract', []);
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': rawTrades,
        }, market);
    }

    async fetchOrderV2 (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'uuid': id,
        };
        const response = await this.v2PrivateGetOrder (this.extend (request, params));
        //
        //    {
        //        "uuid": "d0c5a9c6-1234-5678-abcd-ef1234567890",
        //        "side": "bid",
        //        "ord_type": "limit",
        //        "price": "50000000",
        //        "state": "done",
        //        "market": "KRW-BTC",
        //        "created_at": "2023-10-01T12:00:00+09:00",
        //        "volume": "0.01",
        //        "remaining_volume": "0",
        //        "reserved_fee": "25",
        //        "remaining_fee": "0",
        //        "paid_fee": "25",
        //        "locked": "0",
        //        "executed_volume": "0.01",
        //        "trades_count": 1,
        //        "trades": [
        //            {
        //                "market": "KRW-BTC",
        //                "uuid": "trade-uuid-1234",
        //                "price": "50000000",
        //                "volume": "0.01",
        //                "funds": "500000",
        //                "side": "bid",
        //                "created_at": "2023-10-01T12:00:01+09:00"
        //            }
        //        ]
        //    }
        //
        return this.parseOrderV2 (response, market);
    }

    parseOrderV2 (order: Dict, market: Market = undefined): Order {
        //
        //    {
        //        "uuid": "d0c5a9c6-1234-5678-abcd-ef1234567890",
        //        "side": "bid",
        //        "ord_type": "limit",
        //        "price": "50000000",
        //        "state": "wait",
        //        "market": "KRW-BTC",
        //        "created_at": "2023-10-01T12:00:00+09:00",
        //        "volume": "0.01",
        //        "remaining_volume": "0.01",
        //        "reserved_fee": "25",
        //        "remaining_fee": "25",
        //        "paid_fee": "0",
        //        "locked": "500025",
        //        "executed_volume": "0",
        //        "trades_count": 0
        //    }
        //
        const id = this.safeString (order, 'uuid');
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        let side = this.safeStringLower (order, 'side');
        if (side === 'bid') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        const ordType = this.safeString (order, 'ord_type');
        let type = undefined;
        if (ordType === 'limit') {
            type = 'limit';
        } else if ((ordType === 'price') || (ordType === 'market')) {
            type = 'market';
        }
        const stateRaw = this.safeString (order, 'state');
        let status = undefined;
        if (stateRaw === 'wait') {
            status = 'open';
        } else if (stateRaw === 'watch') {
            status = 'open';  // pre-order (stop-limit)
        } else if (stateRaw === 'done') {
            status = 'closed';
        } else if (stateRaw === 'cancel') {
            status = 'canceled';
        }
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'volume');
        const remaining = this.safeString (order, 'remaining_volume');
        const filled = this.safeString (order, 'executed_volume');
        let feeCurrency = undefined;
        if (market !== undefined) {
            feeCurrency = market['quote'];
        }
        const fee = {
            'cost': this.safeString (order, 'paid_fee'),
            'currency': feeCurrency,
        };
        const rawTrades = this.safeList (order, 'trades', []);
        const trades = this.parseTrades (rawTrades, market, undefined, undefined, {
            'order': id,
            'type': type,
        });
        const tradesLength = trades.length;
        let lastTradeTimestamp = undefined;
        let cost = undefined;
        let average = undefined;
        if (tradesLength > 0) {
            lastTradeTimestamp = trades[tradesLength - 1]['timestamp'];
            cost = '0';
            for (let i = 0; i < tradesLength; i++) {
                cost = Precise.stringAdd (cost, this.safeString (trades[i], 'cost'));
            }
            average = Precise.stringDiv (cost, filled);
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
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
            'cost': cost,
            'trades': trades,
            'fee': fee,
            'info': order,
            'average': average,
        }, market);
    }

    /**
     * @method
     * @name bithumb#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const methodName = this.safeString (this.options, 'fetchOpenOrders', 'fetchOpenOrdersV2');
        if (methodName === 'fetchOpenOrdersV2') {
            return await this.fetchOpenOrdersV2 (symbol, since, limit, params);
        }
        return await this.fetchOpenOrdersV1 (symbol, since, limit, params);
    }

    async fetchOpenOrdersV1 (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrdersV1() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request: Dict = {
            'count': limit,
            'order_currency': market['base'],
            'payment_currency': market['quote'],
        };
        if (since !== undefined) {
            request['after'] = since;
        }
        const response = await this.privatePostInfoOrders (this.extend (request, params));
        //
        //     {
        //         "status": "0000",
        //         "data": [
        //             {
        //                 "order_currency": "BTC",
        //                 "payment_currency": "KRW",
        //                 "order_id": "C0101000007408440032",
        //                 "order_date": "1571728739360570",
        //                 "type": "bid",
        //                 "units": "5.0",
        //                 "units_remaining": "5.0",
        //                 "price": "501000",
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOpenOrdersV2 (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {
            'state': 'wait',
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetOrders (this.extend (request, params));
        //
        //    [
        //        {
        //            "uuid": "d0c5a9c6-1234-5678-abcd-ef1234567890",
        //            "side": "bid",
        //            "ord_type": "limit",
        //            "price": "50000000",
        //            "state": "wait",
        //            "market": "KRW-BTC",
        //            "created_at": "2023-10-01T12:00:00+09:00",
        //            "volume": "0.01",
        //            "remaining_volume": "0.01",
        //            "reserved_fee": "25",
        //            "remaining_fee": "25",
        //            "paid_fee": "0",
        //            "locked": "500025",
        //            "executed_volume": "0",
        //            "trades_count": 0
        //        },
        //        ...
        //    ]
        //
        return this.parseOrdersV2 (response, market, since, limit);
    }

    parseOrdersV2 (orders: any[], market: Market = undefined, since: Int = undefined, limit: Int = undefined): Order[] {
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.parseOrderV2 (orders[i], market);
            result.push (order);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    /**
     * @method
     * @name bithumb#cancelOrder
     * @description cancels an open order
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v2.1.0/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C-%EC%A0%91%EC%88%98
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        const methodName = this.safeString (this.options, 'cancelOrder', 'cancelOrderV2');
        if (methodName === 'cancelOrderV2') {
            return await this.cancelOrderV2 (id, symbol, params);
        }
        return await this.cancelOrderV1 (id, symbol, params);
    }

    async cancelOrderV1 (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrderV1() requires a symbol argument');
        }
        const side_in_params = ('side' in params);
        if (!side_in_params) {
            throw new ArgumentsRequired (this.id + ' cancelOrderV1() requires a `side` parameter (sell or buy)');
        }
        const market = this.market (symbol);
        const side = (params['side'] === 'buy') ? 'bid' : 'ask';
        params = this.omit (params, [ 'side', 'currency' ]);
        // https://github.com/ccxt/ccxt/issues/6771
        const request: Dict = {
            'order_id': id,
            'type': side,
            'order_currency': market['base'],
            'payment_currency': market['quote'],
        };
        const response = await this.privatePostTradeCancel (this.extend (request, params));
        //
        //    {
        //       'status': 'string',
        //    }
        //
        return this.safeOrder ({
            'info': response,
        });
    }

    async cancelOrderV2 (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'uuid': id,
        };
        const response = await this.v2PrivateDeleteOrder (this.extend (request, params));
        //
        //    {
        //        "uuid": "d0c5a9c6-1234-5678-abcd-ef1234567890",
        //        "side": "bid",
        //        "ord_type": "limit",
        //        "price": "50000000",
        //        "state": "cancel",
        //        "market": "KRW-BTC",
        //        "created_at": "2023-10-01T12:00:00+09:00",
        //        "volume": "0.01",
        //        "remaining_volume": "0.01",
        //        "reserved_fee": "25",
        //        "remaining_fee": "25",
        //        "paid_fee": "0",
        //        "locked": "500025",
        //        "executed_volume": "0",
        //        "trades_count": 0
        //    }
        //
        return this.parseOrderV2 (response, market);
    }

    async cancelUnifiedOrder (order: Order, params = {}) {
        const request: Dict = {
            'side': order['side'],
        };
        return await this.cancelOrder (order['id'], order['symbol'], this.extend (request, params));
    }

    /**
     * @method
     * @name bithumb#withdraw
     * @description make a withdrawal
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%BD%94%EC%9D%B8-%EC%B6%9C%EA%B8%88%ED%95%98%EA%B8%B0-%EA%B0%9C%EC%9D%B8
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'units': amount,
            'address': address,
            'currency': currency['id'],
        };
        if (code === 'XRP' || code === 'XMR' || code === 'EOS' || code === 'STEEM' || code === 'TON') {
            const destination = this.safeString (params, 'destination');
            if ((tag === undefined) && (destination === undefined)) {
                throw new ArgumentsRequired (this.id + ' ' + code + ' withdraw() requires a tag argument or an extra destination param');
            } else if (tag !== undefined) {
                request['destination'] = tag;
            }
        }
        const response = await this.privatePostTradeBtcWithdrawal (this.extend (request, params));
        //
        // { "status" : "0000"}
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // withdraw
        //
        //     { "status" : "0000"}
        //
        currency = this.safeCurrency (undefined, currency);
        return {
            'id': undefined,
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': undefined,
            'info': transaction,
        } as Transaction;
    }

    fixCommaNumber (numberStr) {
        // some endpoints need this https://github.com/ccxt/ccxt/issues/11031
        if (numberStr === undefined) {
            return undefined;
        }
        let finalNumberStr = numberStr;
        while (finalNumberStr.indexOf (',') > -1) {
            finalNumberStr = finalNumberStr.replace (',', '');
        }
        return finalNumberStr;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][api]) + endpoint;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v2Public') {
            // V2 public API - no authentication required
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v2Private') {
            // V2 private API - JWT Bearer Token authentication
            this.checkRequiredCredentials ();
            const payload: Dict = {
                'access_key': this.apiKey,
                'nonce': this.uuid (),
                'timestamp': this.milliseconds (),
            };
            let queryString = '';
            if (Object.keys (query).length) {
                queryString = this.urlencode (query);
                // Add query hash for request with query parameters
                payload['query_hash'] = this.hash (this.encode (queryString), sha512);
                payload['query_hash_alg'] = 'SHA512';
            }
            const jwtToken = jwt (payload, this.encode (this.secret), sha256);
            headers = {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json',
            };
            if (method === 'GET' || method === 'DELETE') {
                if (queryString.length > 0) {
                    url += '?' + queryString;
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                }
            }
        } else {
            // V1 private API - HMAC-SHA512 authentication
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'endpoint': endpoint,
            }, query));
            const nonce = this.nonce ().toString ();
            const auth = endpoint + "\0" + body + "\0" + nonce; // eslint-disable-line quotes
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha512);
            const signature64 = this.stringToBase64 (signature);
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Api-Key': this.apiKey,
                'Api-Sign': signature64,
                'Api-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        if ('status' in response) {
            //
            //     {"status":"5100","message":"After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions"}
            //
            const status = this.safeString (response, 'status');
            const message = this.safeString (response, 'message');
            if (status !== undefined) {
                if (status === '0000') {
                    return undefined; // no error
                } else if (message === '거래 진행중인 내역이 존재하지 않습니다.') {
                    // https://github.com/ccxt/ccxt/issues/9017
                    return undefined; // no error
                }
                const feedback = this.id + ' ' + message;
                this.throwExactlyMatchedException (this.exceptions, status, feedback);
                this.throwExactlyMatchedException (this.exceptions, message, feedback);
                throw new ExchangeError (feedback);
            }
        }
        return undefined;
    }
}
