
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coinone.js';
import { BadSymbol, BadRequest, ExchangeError, ArgumentsRequired, OrderNotFound, OnMaintenance, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import type { Balances, Currencies, Dict, Int, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, int, DepositAddress } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class coinone
 * @augments Exchange
 */
export default class coinone extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': [ 'KR' ], // Korea
            'rateLimit': 50,
            'version': 'v2',
            'pro': false,
            'has': {
                'CORS': undefined,
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
                'createMarketOrder': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createOrderWithTakeProfitAndStopLossWs': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true, // the endpoint that should return closed orders actually returns trades, https://github.com/ccxt/ccxt/pull/7067
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': false,
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
                'fetchMyTrades': true,
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
                'fetchVolatilityHistory': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'ws': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg',
                'api': {
                    'rest': 'https://api.coinone.co.kr',
                    'v2Public': 'https://api.coinone.co.kr/public/v2',
                    'v2Private': 'https://api.coinone.co.kr/v2',
                    'v2_1Private': 'https://api.coinone.co.kr/v2.1',
                },
                'www': 'https://coinone.co.kr',
                'doc': 'https://doc.coinone.co.kr',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook',
                        'ticker',
                        'ticker_utc',
                        'trades',
                    ],
                },
                'v2Public': {
                    'get': [
                        'range_units', // deprecated
                        'range_units/{quote_currency}/{target_currency}',
                        'markets/{quote_currency}',
                        'markets/{quote_currency}/{target_currency}',
                        'orderbook/{quote_currency}/{target_currency}',
                        'trades/{quote_currency}/{target_currency}',
                        'ticker_new/{quote_currency}',
                        'ticker_new/{quote_currency}/{target_currency}',
                        'ticker_utc_new/{quote_currency}',
                        'ticker_utc_new/{quote_currency}/{target_currency}',
                        'currencies',
                        'currencies/{currency}',
                        'chart/{quote_currency}/{target_currency}',
                    ],
                },
                'private': {
                    'post': [
                        'account/deposit_address',
                        'account/btc_deposit_address',
                        'account/balance',
                        'account/daily_balance',
                        'account/user_info',
                        'account/virtual_account',
                        'order/cancel_all',
                        'order/cancel',
                        'order/limit_buy',
                        'order/limit_sell',
                        'order/complete_orders',
                        'order/limit_orders',
                        'order/order_info',
                        'transaction/auth_number',
                        'transaction/history',
                        'transaction/krw/history',
                        'transaction/btc',
                        'transaction/coin',
                    ],
                },
                'v2Private': {
                    'post': [
                        'account/balance',
                        'account/deposit_address',
                        'account/user_info',
                        'account/virtual_account',
                        'order/cancel',
                        'order/limit_buy',
                        'order/limit_sell',
                        'order/limit_orders',
                        'order/complete_orders',
                        'order/query_order',
                        'transaction/auth_number',
                        'transaction/btc',
                        'transaction/history',
                        'transaction/krw/history',
                    ],
                },
                'v2_1Private': {
                    'post': [
                        'account/balance/all',
                        'account/balance',
                        'account/trade_fee',
                        'account/trade_fee/{quote_currency}/{target_currency}',
                        'order/active_orders',
                        'order/detail',
                        'order/completed_orders/all',
                        'order/completed_orders',
                        'order',
                        'order/limit', // deprecated
                        'order/cancel',
                        'order/cancel/all',
                        'order/open_orders', // deprecated
                        'order/open_orders/all', // deprecated
                        'order/complete_orders', // deprecated
                        'order/complete_orders/all', // deprecated
                        'order/info', // deprecated
                        'transaction/krw/history',
                        'transaction/coin/history',
                        'transaction/coin/history/detail',
                        'transaction/coin/withdrawal/limit',
                        'transaction/coin/withdrawal/address_book',
                        'transaction/coin/withdrawal',
                        'event/order-reward/programs',
                        'event/order-reward/history',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
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
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100, // todo implement
                        'daysBack': 100000, // todo implement
                        'untilDays': 100000, // todo implement
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined, // todo implement
                    'fetchOHLCV': undefined, // todo implement
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
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '104': OrderNotFound,
                '107': BadRequest,
                '108': BadSymbol,
                '405': OnMaintenance,
            },
            'commonCurrencies': {
                'SOC': 'Soda Coin',
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
            },
        });
    }

    /**
     * @method
     * @name coinone#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.coinone.co.kr/reference/currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.v2PublicGetCurrencies (params);
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701054555578,
        //         "currencies": [
        //           {
        //             "name": "Polygon",
        //             "symbol": "MATIC",
        //             "deposit_status": "normal",
        //             "withdraw_status": "normal",
        //             "deposit_confirm_count": 150,
        //             "max_precision": 8,
        //             "deposit_fee": "0.0",
        //             "withdrawal_min_amount": "1.0",
        //             "withdrawal_fee": "3.0"
        //           }
        //         ]
        //     }
        //
        const result: Dict = {};
        const currencies = this.safeList (response, 'currencies', []);
        for (let i = 0; i < currencies.length; i++) {
            const entry = currencies[i];
            const id = this.safeString (entry, 'symbol');
            const code = this.safeCurrencyCode (id);
            const isWithdrawEnabled = this.safeString (entry, 'withdraw_status', '') === 'normal';
            const isDepositEnabled = this.safeString (entry, 'deposit_status', '') === 'normal';
            const type = (code !== 'KRW') ? 'crypto' : 'fiat';
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'code': code,
                'info': entry,
                'name': this.safeString (entry, 'name'),
                'active': undefined,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'fee': this.safeNumber (entry, 'withdrawal_fee'),
                'precision': this.parseNumber (this.parsePrecision (this.safeString (entry, 'max_precision'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (entry, 'withdrawal_min_amount'),
                        'max': undefined,
                    },
                },
                'networks': {},
                'type': type,
            });
        }
        return result;
    }

    /**
     * @method
     * @name coinone#fetchMarkets
     * @description retrieves data on all markets for coinone
     * @see https://docs.coinone.co.kr/reference/tickers
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const request: Dict = {
            'quote_currency': 'KRW',
        };
        const response = await this.v2PublicGetTickerNewQuoteCurrency (request);
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701067923060,
        //         "tickers": [
        //             {
        //                 "quote_currency": "krw",
        //                 "target_currency": "stg",
        //                 "timestamp": 1701067920001,
        //                 "high": "667.5",
        //                 "low": "667.5",
        //                 "first": "667.5",
        //                 "last": "667.5",
        //                 "quote_volume": "0.0",
        //                 "target_volume": "0.0",
        //                 "best_asks": [
        //                     {
        //                         "price": "777.0",
        //                         "qty": "73.9098"
        //                     }
        //                 ],
        //                 "best_bids": [
        //                     {
        //                         "price": "690.8",
        //                         "qty": "40.7768"
        //                     }
        //                 ],
        //                 "id": "1701067920001001"
        //             }
        //         ]
        //     }
        //
        const tickers = this.safeList (response, 'tickers', []);
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            const entry = this.safeValue (tickers, i);
            const id = this.safeString (entry, 'id');
            const baseId = this.safeStringUpper (entry, 'target_currency');
            const quoteId = this.safeStringUpper (entry, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
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
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber ('1e-4'),
                    'price': this.parseNumber ('1e-4'),
                    'cost': this.parseNumber ('1e-8'),
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
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': entry,
            });
        }
        return result;
    }

    parseBalance (response): Balances {
        //
        //     [
        //         {
        //             "available": "998999692485",
        //             "limit": "0",
        //             "average_price": "100000000",
        //             "currency": "BTC"
        //         }
        //     ]
        //
        const result: Dict = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'limit');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name coinone#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.coinone.co.kr/reference/find-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.v2_1PrivatePostAccountBalanceAll (params);
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "balances": [
        //             {
        //                 "available": "998999692485",
        //                 "limit": "0",
        //                 "average_price": "100000000",
        //                 "currency": "BTC"
        //             },
        //             {
        //                 "available": "100",
        //                 "limit": "0",
        //                 "average_price": "3290000",
        //                 "currency": "XRP"
        //             },
        //             {
        //                 "available": "232706745677",
        //                 "limit": "0",
        //                 "average_price": "0",
        //                 "currency": "KRW"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'balances', []);
        return this.parseBalance (data);
    }

    /**
     * @method
     * @name coinone#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.coinone.co.kr/reference/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'quote_currency': market['quote'],
            'target_currency': market['base'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // only support 5, 10, 15, 16
        }
        const response = await this.v2PublicGetOrderbookQuoteCurrencyTargetCurrency (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "timestamp": 1701071108673,
        //         "id": "1701071108673001",
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "order_book_unit": "0.0",
        //         "bids": [
        //             {
        //                 "price": "50048000",
        //                 "qty": "0.01080229"
        //             }
        //         ],
        //         "asks": [
        //             {
        //                 "price": "50058000",
        //                 "qty": "0.00272592"
        //             }
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 'price', 'qty');
    }

    /**
     * @method
     * @name coinone#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.coinone.co.kr/reference/tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {
            'quote_currency': 'KRW',
        };
        const response = await this.v2PublicGetTickerNewQuoteCurrency (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701073358487,
        //         "tickers": [
        //             {
        //                 "quote_currency": "krw",
        //                 "target_currency": "btc",
        //                 "timestamp": 1701073357818,
        //                 "high": "50543000.0",
        //                 "low": "49945000.0",
        //                 "first": "50487000.0",
        //                 "last": "50062000.0",
        //                 "quote_volume": "11349804285.3859",
        //                 "target_volume": "226.07268994",
        //                 "best_asks": [
        //                     {
        //                         "price": "50081000.0",
        //                         "qty": "0.18471358"
        //                     }
        //                 ],
        //                 "best_bids": [
        //                     {
        //                         "price": "50062000.0",
        //                         "qty": "0.04213455"
        //                     }
        //                 ],
        //                 "id": "1701073357818001"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'tickers', []);
        return this.parseTickers (data, symbols);
    }

    /**
     * @method
     * @name coinone#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.coinone.co.kr/reference/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'quote_currency': market['quote'],
            'target_currency': market['base'],
        };
        const response = await this.v2PublicGetTickerNewQuoteCurrencyTargetCurrency (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701073358487,
        //         "tickers": [
        //             {
        //                 "quote_currency": "krw",
        //                 "target_currency": "btc",
        //                 "timestamp": 1701073357818,
        //                 "high": "50543000.0",
        //                 "low": "49945000.0",
        //                 "first": "50487000.0",
        //                 "last": "50062000.0",
        //                 "quote_volume": "11349804285.3859",
        //                 "target_volume": "226.07268994",
        //                 "best_asks": [
        //                     {
        //                         "price": "50081000.0",
        //                         "qty": "0.18471358"
        //                     }
        //                 ],
        //                 "best_bids": [
        //                     {
        //                         "price": "50062000.0",
        //                         "qty": "0.04213455"
        //                     }
        //                 ],
        //                 "id": "1701073357818001"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'tickers', []);
        const ticker = this.safeDict (data, 0, {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "quote_currency": "krw",
        //         "target_currency": "btc",
        //         "timestamp": 1701073357818,
        //         "high": "50543000.0",
        //         "low": "49945000.0",
        //         "first": "50487000.0",
        //         "last": "50062000.0",
        //         "quote_volume": "11349804285.3859",
        //         "target_volume": "226.07268994",
        //         "best_asks": [
        //             {
        //                 "price": "50081000.0",
        //                 "qty": "0.18471358"
        //             }
        //         ],
        //         "best_bids": [
        //             {
        //                 "price": "50062000.0",
        //                 "qty": "0.04213455"
        //             }
        //         ],
        //         "id": "1701073357818001"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeString (ticker, 'last');
        const asks = this.safeList (ticker, 'best_asks', []);
        const bids = this.safeList (ticker, 'best_bids', []);
        const baseId = this.safeString (ticker, 'target_currency');
        const quoteId = this.safeString (ticker, 'quote_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return this.safeTicker ({
            'symbol': base + '/' + quote,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (bids, 'price'),
            'bidVolume': this.safeString (bids, 'qty'),
            'ask': this.safeString (asks, 'price'),
            'askVolume': this.safeString (asks, 'qty'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'first'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'target_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id": "1701075265708001",
        //         "timestamp": 1701075265708,
        //         "price": "50020000",
        //         "qty": "0.00155177",
        //         "is_seller_maker": false
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "trade_id": "0e2bb80f-1e4d-11e9-9ec7-00e04c3600d1",
        //         "order_id": "0e2b9627-1e4d-11e9-9ec7-00e04c3600d2",
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "order_type": "LIMIT",
        //         "is_ask": true,
        //         "is_maker": true,
        //         "price": "8420",
        //         "qty": "0.1599",
        //         "timestamp": 8964000,
        //         "fee_rate": "0.001",
        //         "fee": "162",
        //         "fee_currency": "KRW"
        //     }
        //
        const timestamp = this.safeInteger (trade, 'timestamp');
        market = this.safeMarket (undefined, market);
        const isSellerMaker = this.safeBool (trade, 'is_seller_maker');
        let side = undefined;
        if (isSellerMaker !== undefined) {
            side = isSellerMaker ? 'sell' : 'buy';
        }
        let takerOrMaker = undefined;
        if (side === undefined) {
            const isAsk = this.safeBool (trade, 'is_ask');
            const isMaker = this.safeBool (trade, 'is_maker');
            if (isMaker !== undefined) {
                takerOrMaker = isMaker ? 'maker' : 'taker';
                if (isAsk !== undefined) {
                    side = (isAsk === isMaker) ? 'sell' : 'buy';
                }
            }
        }
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'qty');
        const orderId = this.safeString2 (trade, 'orderId', 'order_id');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'rate': this.safeString (trade, 'fee_rate'),
                'currency': this.safeString (trade, 'fee_currency', 'KRW'),
            };
        }
        return this.safeTrade ({
            'id': this.safeString2 (trade, 'id', 'trade_id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name coinone#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.coinone.co.kr/reference/recent-completed-orders
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'quote_currency': market['quote'],
            'target_currency': market['base'],
        };
        if (limit !== undefined) {
            request['size'] = Math.min (limit, 200);
        }
        const response = await this.v2PublicGetTradesQuoteCurrencyTargetCurrency (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701075315771,
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "transactions": [
        //             {
        //                 "id": "1701075265708001",
        //                 "timestamp": 1701075265708,
        //                 "price": "50020000",
        //                 "qty": "0.00155177",
        //                 "is_seller_maker": false
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'transactions', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name coinone#createOrder
     * @description create a trade order
     * @see https://docs.coinone.co.kr/reference/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        type = type.toUpperCase ();
        const isMarket = type === 'MARKET';
        const request: Dict = {
            'quote_currency': market['quote'],
            'target_currency': market['base'],
            'side': side.toUpperCase (),
        };
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarket, false, params);
        request['post_only'] = postOnly;
        const triggerPrice = this.safeValueN (params, [ 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        params = this.omit (params, [ 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'timeInForce', 'postOnly' ]);
        if (triggerPrice !== undefined) {
            request['type'] = 'STOP_LIMIT';
            request['trigger_price'] = this.priceToPrecision (symbol, triggerPrice);
            request['price'] = this.priceToPrecision (symbol, price);
            request['qty'] = this.amountToPrecision (symbol, amount);
        } else {
            request['type'] = type;
            if (!isMarket) {
                request['price'] = this.priceToPrecision (symbol, price);
                request['qty'] = this.amountToPrecision (symbol, amount);
            } else {
                if (side === 'buy') {
                    const cost = this.safeString (params, 'cost');
                    params = this.omit (params, 'cost');
                    let createMarketBuyOrderRequiresPrice = true;
                    [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                    if (cost !== undefined) {
                        request['amount'] = this.costToPrecision (symbol, cost);
                    } else if (createMarketBuyOrderRequiresPrice) {
                        if (price === undefined) {
                            throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                        } else {
                            const amountString = this.numberToString (amount);
                            const priceString = this.numberToString (price);
                            const quoteAmount = Precise.stringMul (amountString, priceString);
                            request['amount'] = this.costToPrecision (symbol, quoteAmount);
                        }
                    } else {
                        request['amount'] = this.costToPrecision (symbol, amount);
                    }
                } else {
                    request['qty'] = this.amountToPrecision (symbol, amount);
                }
            }
        }
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        params = this.omit (params, [ 'clientOid', 'clientOrderId' ]);
        if (clientOrderId !== undefined) {
            request['user_order_id'] = clientOrderId;
        }
        const response = await this.v2_1PrivatePostOrder (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "order_id": "8a82c561-40b4-4cb3-9bc0-9ac9ffc1d63b"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name coinone#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.coinone.co.kr/reference/order-detail
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'quote_currency': market['quote'],
            'target_currency': market['base'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        params = this.omit (params, [ 'clientOid', 'clientOrderId' ]);
        if (clientOrderId !== undefined) {
            request['user_order_id'] = clientOrderId;
        } else {
            request['order_id'] = id;
        }
        const response = await this.v2_1PrivatePostOrderDetail (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "order": {
        //             "order_id": "0f1c26d0-1e4d-11e9-9ec7-00e04c3600d7",
        //             "type": "LIMIT",
        //             "quote_currency": "KRW",
        //             "target_currency": "BTC",
        //             "status": "CANCELED",
        //             "side": "BUY",
        //             "fee": "0",
        //             "fee_rate": "0.0",
        //             "average_executed_price": "0",
        //             "updated_at": 1680055490000,
        //             "ordered_at": 1680051059000,
        //             "price": "100000",
        //             "original_qty": "1",
        //             "executed_qty": "0",
        //             "canceled_qty": "1",
        //             "remain_qty": "0",
        //             "limit_price": null,
        //             "traded_amount": null,
        //             "original_amount": null,
        //             "canceled_amount": null,
        //             "is_triggered": null,
        //             "trigger_price": null
        //         }
        //     }
        //
        const data = this.safeDict (response, 'order', {});
        return this.parseOrder (data, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'LIVE': 'open',
            'PARTIALLY_FILLED': 'open',
            'PARTIALLY_CANCELED': 'canceled',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'NOT_TRIGGERED': 'open',
            'NOT_TRIGGERED_PARTIALLY_CANCELED': 'canceled',
            'NOT_TRIGGERED_CANCELED': 'canceled',
            'TRIGGERED': 'open',
            'CANCELED_NO_ORDER': 'canceled',
            'CANCELED_LIMIT_PRICE_EXCEED': 'canceled',
            'CANCELED_UNDER_PRODUCT_UNIT': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "order_id": "8a82c561-40b4-4cb3-9bc0-9ac9ffc1d63b"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "order_id": "0f1c26d0-1e4d-11e9-9ec7-00e04c3600d7",
        //         "type": "LIMIT",
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "status": "CANCELED",
        //         "side": "BUY",
        //         "fee": "0",
        //         "fee_rate": "0.0",
        //         "average_executed_price": "0",
        //         "updated_at": 1680055490000,
        //         "ordered_at": 1680051059000,
        //         "price": "100000",
        //         "original_qty": "1",
        //         "executed_qty": "0",
        //         "canceled_qty": "1",
        //         "remain_qty": "0",
        //         "limit_price": null,
        //         "traded_amount": null,
        //         "original_amount": null,
        //         "canceled_amount": null,
        //         "is_triggered": null,
        //         "trigger_price": null
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "order_id": "0f5122d8-1e4d-11e9-9ec7-00e04c3600d7",
        //         "type": "STOP_LIMIT",
        //         "quote_currency": "KRW",
        //         "target_currency": "ETH",
        //         "price": "35000000",
        //         "remain_qty": "1",
        //         "original_qty": "1",
        //         "canceled_qty": "0",
        //         "executed_qty": "0",
        //         "side": "SELL",
        //         "fee": "0",
        //         "fee_rate": "0.0",
        //         "average_executed_price": "0",
        //         "ordered_at": 1682382211000,
        //         "is_triggered": false,
        //         "trigger_price": "37000000",
        //         "triggered_at": null
        //     }
        //
        // fetchClosedOrders
        //
        //     {
        //         "trade_id": "0e2bb80f-1e4d-11e9-9ec7-00e04c3600d1",
        //         "order_id": "0e2b9627-1e4d-11e9-9ec7-00e04c3600d2",
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "order_type": "LIMIT",
        //         "is_ask": true,
        //         "is_maker": true,
        //         "price": "8420",
        //         "qty": "0.1599",
        //         "timestamp": 8964000,
        //         "fee_rate": "0.001",
        //         "fee": "162",
        //         "fee_currency": "KRW"
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "order_id": "d85cc6af-b131-4398-b269-ddbafa760a39",
        //         "price": "26231000.0",
        //         "qty": "0.002",
        //         "remain_qty": "0.0",
        //         "side": "BUY",
        //         "original_qty": "0.005",
        //         "traded_qty": "0.003",
        //         "canceled_qty": "0.002",
        //         "fee": "26231.0",
        //         "fee_rate": "0.001",
        //         "avg_price": "26231000.0",
        //         "canceled_at": 1650525935,
        //         "ordered_at": 1650125935
        //     }
        //
        const id = this.safeString (order, 'order_id');
        const baseId = this.safeString (order, 'target_currency');
        const quoteId = this.safeString (order, 'quote_currency');
        let base = undefined;
        let quote = undefined;
        if (baseId !== undefined) {
            base = this.safeCurrencyCode (baseId);
        }
        if (quoteId !== undefined) {
            quote = this.safeCurrencyCode (quoteId);
        }
        let symbol = undefined;
        if ((base !== undefined) && (quote !== undefined)) {
            symbol = base + '/' + quote;
            market = this.safeMarket (symbol, market, '/');
        }
        const timestamp = this.safeInteger2 (order, 'updated_at', 'canceled_at');
        let type = this.safeStringLower2 (order, 'type', 'order_type');
        if (type === 'stop_limit') {
            type = 'limit';
        }
        let side = this.safeStringLower (order, 'side');
        if (side === undefined) {
            const isAsk = this.safeBool (order, 'is_ask');
            const isMaker = this.safeBool (order, 'is_maker');
            if (isAsk !== undefined && isMaker !== undefined) {
                side = (isAsk === isMaker) ? 'sell' : 'buy';
            }
        }
        const remainingString = this.safeString (order, 'remain_qty');
        const amountString = this.safeString2 (order, 'original_qty', 'qty');
        let status = this.safeString (order, 'status');
        // https://github.com/ccxt/ccxt/pull/7067
        if (status === 'LIVE') {
            if ((remainingString !== undefined) && (amountString !== undefined)) {
                const isLessThan = Precise.stringLt (remainingString, amountString);
                if (isLessThan) {
                    status = 'canceled';
                }
            }
        }
        if (this.safeInteger (order, 'canceled_at') !== undefined) {
            status = 'canceled';
        }
        status = this.parseOrderStatus (status);
        let fee = undefined;
        const feeCostString = this.safeString (order, 'fee');
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'rate': this.safeString (order, 'fee_rate'),
                'currency': this.safeString (order, 'fee_currency', 'KRW'),
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'price'),
            'triggerPrice': this.safeString (order, 'trigger_price'),
            'cost': undefined,
            'average': this.safeString (order, 'average_executed_price'),
            'amount': amountString,
            'filled': this.safeString (order, 'executed_qty'),
            'remaining': remainingString,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name coinone#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.coinone.co.kr/reference/find-active-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        // The returned amount might not be same as the ordered amount. If an order is partially filled, the returned amount means the remaining amount.
        // For the same reason, the returned amount and remaining are always same, and the returned filled and cost are always zero.
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['quote_currency'] = market['quote'];
            request['target_currency'] = market['base'];
        }
        const response = await this.v2_1PrivatePostOrderActiveOrders (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "active_orders": [
        //             {
        //                 "order_id": "0f5122d8-1e4d-11e9-9ec7-00e04c3600d7",
        //                 "type": "STOP_LIMIT",
        //                 "quote_currency": "KRW",
        //                 "target_currency": "ETH",
        //                 "price": "35000000",
        //                 "remain_qty": "1",
        //                 "original_qty": "1",
        //                 "canceled_qty": "0",
        //                 "executed_qty": "0",
        //                 "side": "SELL",
        //                 "fee": "0",
        //                 "fee_rate": "0.0",
        //                 "average_executed_price": "0",
        //                 "ordered_at": 1682382211000,
        //                 "is_triggered": false,
        //                 "trigger_price": "37000000",
        //                 "triggered_at": null
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'active_orders', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name coinone#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.coinone.co.kr/reference/find-all-completed-orders
     * @see https://docs.coinone.co.kr/reference/find-completed-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const now = this.milliseconds ();
        const until = this.safeInteger (params, 'until', now);
        params = this.omit (params, 'until');
        const request: Dict = {
            'size': (limit === undefined) ? 100 : Math.min (limit, 100),
            'from_ts': (since === undefined) ? now - 7776000000 : since,
            'to_ts': until,
        };
        let market = undefined;
        let response = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['quote_currency'] = market['quote'];
            request['target_currency'] = market['base'];
            response = await this.v2_1PrivatePostOrderCompletedOrders (this.extend (request, params));
        } else {
            response = await this.v2_1PrivatePostOrderCompletedOrdersAll (this.extend (request, params));
        }
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "completed_orders": [
        //             {
        //                 "trade_id": "0e2bb80f-1e4d-11e9-9ec7-00e04c3600d1",
        //                 "order_id": "0e2b9627-1e4d-11e9-9ec7-00e04c3600d2",
        //                 "quote_currency": "KRW",
        //                 "target_currency": "BTC",
        //                 "order_type": "LIMIT",
        //                 "is_ask": true,
        //                 "is_maker": true,
        //                 "price": "8420",
        //                 "qty": "0.1599",
        //                 "timestamp": 8964000,
        //                 "fee_rate": "0.001",
        //                 "fee": "162",
        //                 "fee_currency": "KRW"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'completed_orders', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name coinone#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.coinone.co.kr/reference/find-all-completed-orders
     * @see https://docs.coinone.co.kr/reference/find-completed-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const now = this.milliseconds ();
        const until = this.safeInteger (params, 'until', now);
        params = this.omit (params, 'until');
        const request: Dict = {
            'size': (limit === undefined) ? 100 : Math.min (limit, 100),
            'from_ts': (since === undefined) ? now - 7776000000 : since,
            'to_ts': until,
        };
        let market = undefined;
        let response = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['quote_currency'] = market['quote'];
            request['target_currency'] = market['base'];
            response = await this.v2_1PrivatePostOrderCompletedOrders (this.extend (request, params));
        } else {
            response = await this.v2_1PrivatePostOrderCompletedOrdersAll (this.extend (request, params));
        }
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "completed_orders": [
        //             {
        //                 "trade_id": "0e2bb80f-1e4d-11e9-9ec7-00e04c3600d1",
        //                 "order_id": "0e2b9627-1e4d-11e9-9ec7-00e04c3600d2",
        //                 "quote_currency": "KRW",
        //                 "target_currency": "BTC",
        //                 "order_type": "LIMIT",
        //                 "is_ask": true,
        //                 "is_maker": true,
        //                 "price": "8420",
        //                 "qty": "0.1599",
        //                 "timestamp": 8964000,
        //                 "fee_rate": "0.001",
        //                 "fee": "162",
        //                 "fee_currency": "KRW"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'completed_orders', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name coinone#cancelOrder
     * @description cancels an open order
     * @see https://docs.coinone.co.kr/reference/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'order_id': id,
            'quote_currency': market['quote'],
            'target_currency': market['base'],
        };
        const response = await this.v2_1PrivatePostOrderCancel (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "order_id": "d85cc6af-b131-4398-b269-ddbafa760a39",
        //         "price": "26231000.0",
        //         "qty": "0.002",
        //         "remain_qty": "0.0",
        //         "side": "BUY",
        //         "original_qty": "0.005",
        //         "traded_qty": "0.003",
        //         "canceled_qty": "0.002",
        //         "fee": "26231.0",
        //         "fee_rate": "0.001",
        //         "avg_price": "26231000.0",
        //         "canceled_at": 1650525935,
        //         "ordered_at": 1650125935
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name coinone#fetchDepositAddresses
     * @description fetch deposit addresses for multiple currencies and chain types
     * @see https://docs.coinone.co.kr/reference/deposit-address
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddresses (codes: Strings = undefined, params = {}): Promise<DepositAddress[]> {
        await this.loadMarkets ();
        const response = await this.v2PrivatePostAccountDepositAddress (params);
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "walletAddress": {
        //             "matic": null,
        //             "btc": "mnobqu4i6qMCJWDpf5UimRmr8JCvZ8FLcN",
        //             "xrp": null,
        //             "xrp_tag": "-1",
        //             "kava": null,
        //             "kava_memo": null,
        //         }
        //     }
        //
        const walletAddress = this.safeDict (response, 'walletAddress', {});
        const keys = Object.keys (walletAddress);
        const result: Dict = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = walletAddress[key];
            if ((!value) || (value === '-1')) {
                continue;
            }
            const parts = key.split ('_');
            const currencyId = this.safeValue (parts, 0);
            const secondPart = this.safeValue (parts, 1);
            const code = this.safeCurrencyCode (currencyId);
            let depositAddress = this.safeValue (result, code);
            if (depositAddress === undefined) {
                depositAddress = {
                    'info': value,
                    'currency': code,
                    'network': undefined,
                    'address': undefined,
                    'tag': undefined,
                } as DepositAddress;
            }
            const address = this.safeString (depositAddress, 'address', value);
            this.checkAddress (address);
            depositAddress['address'] = address;
            depositAddress['info'] = address;
            if ((secondPart === 'tag' || secondPart === 'memo')) {
                depositAddress['tag'] = value;
                depositAddress['info'] = [ address, value ];
            }
            result[code] = depositAddress;
        }
        return result as DepositAddress[];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['rest'] + '/';
        if (api === 'v2Public') {
            url = this.urls['api']['v2Public'] + '/';
            api = 'public';
        } else if (api === 'v2Private') {
            url = this.urls['api']['v2Private'] + '/';
        } else if (api === 'v2_1Private') {
            url = this.urls['api']['v2_1Private'] + '/';
        }
        if (api === 'public') {
            url += request;
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += request;
            let nonce = undefined;
            if (api === 'v2_1Private') {
                nonce = this.uuid ();
            } else {
                nonce = this.nonce ().toString ();
            }
            const json = this.json (this.extend ({
                'access_token': this.apiKey,
                'nonce': nonce,
            }, params));
            const payload = this.stringToBase64 (json);
            body = payload;
            const secret = this.secret.toUpperCase ();
            const signature = this.hmac (this.encode (payload), this.encode (secret), sha512);
            headers = {
                'Content-Type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"result":"error","error_code":"107","error_msg":"Parameter value is wrong"}
        //     {"result":"error","error_code":"108","error_msg":"Unknown CryptoCurrency"}
        //
        const errorCode = this.safeString (response, 'error_code');
        if (errorCode !== undefined && errorCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
