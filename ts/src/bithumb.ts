
//  ---------------------------------------------------------------------------

import { sha256, sha512 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/bithumb.js';
import { jwt } from './base/functions/rsa.js';
import { ExchangeError, ExchangeNotAvailable, AuthenticationError, BadRequest, PermissionDenied, InvalidAddress, ArgumentsRequired, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { DECIMAL_PLACES, SIGNIFICANT_DIGITS, TRUNCATE } from './base/functions/number.js';
import type { Balances, Currency, Dict, Int, Market, MarketInterface, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int, NullableDict, OrderRequest, List, Fee, DepositAddress } from './base/types.js';

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
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createOrderWithTakeProfitAndStopLossWs': false,
                'createReduceOnlyOrder': false,
                'createTwapOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDeposits': true,
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
                'fetchOrders': true,
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
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': true,
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
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'www': 'https://www.bithumb.com',
                'doc': 'https://apidocs.bithumb.com',
                'fees': 'https://en.bithumb.com/customer_support/info_fee',
            },
            'api': {
                'public': {
                    'get': [
                        // API 1.0
                        'public/ticker/ALL_{quoteId}',
                        'public/ticker/{baseId}_{quoteId}',
                        'public/orderbook/ALL_{quoteId}',
                        'public/orderbook/{baseId}_{quoteId}',
                        'public/transaction_history/{baseId}_{quoteId}',
                        'public/network-info',
                        'public/assetsstatus/multichain/ALL',
                        'public/assetsstatus/multichain/{currency}',
                        'public/withdraw/minimum/ALL',
                        'public/withdraw/minimum/{currency}',
                        'public/assetsstatus/ALL',
                        'public/assetsstatus/{baseId}',
                        'public/candlestick/{baseId}_{quoteId}/{interval}',
                        // API 2.0
                        'v1/market/all',
                        'v1/candles/minutes/{unit}',
                        'v1/candles/days',
                        'v1/candles/weeks',
                        'v1/candles/months',
                        'v1/trades/ticks',
                        'v1/ticker',
                        'v1/orderbook',
                        'v1/market/virtual_asset_warning',
                        'v1/notices',
                        'v2/fee/inout/{currency}',
                    ],
                },
                'private': {
                    'get': [
                        // API 2.0
                        'v1/accounts',
                        'v1/orders/chance',
                        'v1/order',
                        'v1/orders',
                        'v1/twap',
                        'v1/withdraws',
                        'v1/withdraws/krw',
                        'v1/withdraw',
                        'v1/withdraws/chance',
                        'v1/withdraws/coin_addresses',
                        'v1/deposits',
                        'v1/deposits/krw',
                        'v1/deposit',
                        'v1/deposits/coin_addresses',
                        'v1/deposits/coin_address',
                        'v1/status/wallet',
                        'v1/api_keys',
                    ],
                    'post': [
                        // API 1.0
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
                        // API 2.0
                        'v2/orders',
                        'v2/orders/batch',
                        'v2/orders/cancel',
                        'v1/twap',
                        'v1/withdraws/coin',
                        'v1/withdraws/krw',
                        'v1/deposits/generate_coin_address',
                        'v1/deposits/krw',
                    ],
                    'delete': [
                        // API 2.0
                        'v2/order',
                        'v1/twap',
                        'v1/withdraws/coin',
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
                            'GTC': true,
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': true,
                        'marketBuyByCost': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 20,
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'GTC': true,
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
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
                    'fetchMyTrades': undefined,
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 0,
                        'untilDays': 0,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchCanceledOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 0,
                        'daysBackCanceled': 0,
                        'untilDays': 0,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 200,
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
                '400': BadRequest,
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
                'Missing request parameter error. Check the required parameters!': BadRequest,
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '10m': 10,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '4h': 240,
            },
            'options': {
                'generation': 2, // either API generation 1 or 2
                'createMarketBuyOrderRequiresPrice': true,
                'quoteCurrencies': {
                    'KRW': {
                        'limits': {
                            'cost': {
                                'min': 500,
                                'max': 5000000000,
                            },
                        },
                    },
                    'BTC': {
                        'limits': {
                            'cost': {
                                'min': 0.0002,
                                'max': 100,
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

    /**
     * @method
     * @name bithumb#fetchMarkets
     * @description retrieves data on all markets for bithumb
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
     * @see https://apidocs.bithumb.com/reference/%EA%B1%B0%EB%9E%98-%EB%8C%80%EC%83%81-%EB%AA%A9%EB%A1%9D-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const result: any[] = [];
        const request: Dict = {};
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchMarkets', 'generation', 2);
        if (generation === 2) {
            request['isDetails'] = true;
            const response = await this.publicGetV1MarketAll (this.extend (request, params));
            //
            //     [
            //         {
            //             "market": "KRW-BTC",
            //             "korean_name": "비트코인",
            //             "english_name": "Bitcoin",
            //             "market_warning": "NONE"
            //         },
            //     ]
            //
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const marketId = this.safeString (entry, 'market');
                let baseId = undefined;
                let quoteId = undefined;
                let base = undefined;
                let quote = undefined;
                if (marketId !== undefined) {
                    const parts = marketId.split ('-');
                    // to match gen 1, the quoteId is the first currency derived from the market id
                    baseId = parts[1];
                    quoteId = parts[0];
                    base = this.safeCurrencyCode (baseId);
                    quote = this.safeCurrencyCode (quoteId);
                }
                result.push ({
                    'id': marketId,
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
                        'cost': {},
                    },
                    'created': undefined,
                    'info': entry,
                });
            }
        } else {
            const quoteCurrencies = this.safeDict (this.options, 'quoteCurrencies', {});
            const quotes = Object.keys (quoteCurrencies);
            const promises: any[] = [];
            for (let i = 0; i < quotes.length; i++) {
                request['quoteId'] = quotes[i];
                promises.push (this.publicGetPublicTickerALLQuoteId (this.extend (request, params)));
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
                const data = this.safeDict (response, 'data', {});
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
                            'amount': parseInt ('4'),
                            'price': parseInt ('4'),
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
        }
        return result;
    }

    parseBalance (response): Balances {
        //
        // generation 1
        //
        //     {
        //         "status": "0000",
        //         "data": {
        //             "total_krw": "51026.000000",
        //             "in_use_krw": "0.00000000",
        //             "available_krw": "51026.00000000",
        //         }
        //     }
        //
        // generation 2
        //
        //     [
        //         {
        //             "currency": "KRW",
        //             "balance": "51026",
        //             "locked": "0",
        //             "avg_buy_price": "0",
        //             "avg_buy_price_modified": false,
        //             "unit_currency": "KRW"
        //         },
        //     ]
        //
        const result: Dict = { 'info': response };
        const balances = this.safeDict (response, 'data');
        if (balances !== undefined) {
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
        } else {
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const account = this.account ();
                const currencyId = this.safeString (entry, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                account['free'] = this.safeString (entry, 'balance');
                account['used'] = this.safeString (entry, 'locked');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name bithumb#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B3%B4%EC%9C%A0%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%A0%84%EC%B2%B4-%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'generation', 2);
        let response = undefined;
        if (generation === 2) {
            response = await this.privateGetV1Accounts (params);
            //
            //     [
            //         {
            //             "currency": "KRW",
            //             "balance": "51026",
            //             "locked": "0",
            //             "avg_buy_price": "0",
            //             "avg_buy_price_modified": false,
            //             "unit_currency": "KRW"
            //         },
            //     ]
            //
        } else {
            const request: Dict = {
                'currency': 'ALL',
            };
            response = await this.privatePostInfoBalance (this.extend (request, params));
            //
            //     {
            //         "status": "0000",
            //         "data": {
            //             "total_krw": "51026.000000",
            //             "in_use_krw": "0.00000000",
            //             "available_krw": "51026.00000000",
            //         }
            //     }
            //
        }
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name bithumb#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%ED%98%B8%EA%B0%80-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchOrderBook', 'generation', 2);
        const market = this.market (symbol);
        const request: Dict = {};
        let response = undefined;
        let data = undefined;
        let timestamp = undefined;
        if (generation === 2) {
            request['markets'] = market['id'];
            response = await this.publicGetV1Orderbook (this.extend (request, params));
            //
            //     [
            //         {
            //             "market": "BTC-USDC",
            //             "timestamp": 1782807920105,
            //             "total_ask_size": 40322.8585,
            //             "total_bid_size": 174206.4577,
            //             "orderbook_units": [
            //                 {
            //                     "ask_price": 0.00001687,
            //                     "bid_price": 0.0000168,
            //                     "ask_size": 155,
            //                     "bid_size": 41.6666
            //                 },
            //             ]
            //         }
            //     ]
            //
            const result = this.safeDict (response, 0, {});
            timestamp = this.safeInteger (result, 'timestamp');
            const orderBookUnits = this.safeList (result, 'orderbook_units', []);
            const bids = [];
            const asks = [];
            for (let i = 0; i < orderBookUnits.length; i++) {
                const entry = orderBookUnits[i];
                bids.push ({
                    'price': this.safeString (entry, 'bid_price'),
                    'quantity': this.safeString (entry, 'bid_size'),
                });
                asks.push ({
                    'price': this.safeString (entry, 'ask_price'),
                    'quantity': this.safeString (entry, 'ask_size'),
                });
            }
            data = {
                'bids': bids,
                'asks': asks,
            };
        } else {
            request['baseId'] = market['baseId'];
            request['quoteId'] = market['quoteId'];
            if (limit !== undefined) {
                request['count'] = limit; // default 30, max 30
            }
            response = await this.publicGetPublicOrderbookBaseIdQuoteId (this.extend (request, params));
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
            data = this.safeDict (response, 'data', {});
            timestamp = this.safeInteger (data, 'timestamp');
        }
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // generation 1: fetchTicker, fetchTickers
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
        // generation 2: fetchTicker, fetchTickers
        //
        //     {
        //         "market": "BTC-USDC",
        //         "trade_date": "20260701",
        //         "trade_time": "233533",
        //         "trade_date_kst": "20260702",
        //         "trade_time_kst": "083533",
        //         "trade_timestamp": 1782981333650,
        //         "opening_price": 0.00001667,
        //         "high_price": 0.00001667,
        //         "low_price": 0.00001645,
        //         "trade_price": 0.00001659,
        //         "prev_closing_price": 0.00001673,
        //         "change": "FALL",
        //         "change_price": 1.4E-7,
        //         "change_rate": 0.0084,
        //         "signed_change_price": -1.4E-7,
        //         "signed_change_rate": -0.0084,
        //         "trade_volume": 1.43724182,
        //         "acc_trade_price": 0.77934383561689,
        //         "acc_trade_price_24h": 1.76373410121466379999997512,
        //         "acc_trade_volume": 47175.3220805,
        //         "acc_trade_volume_24h": 104565.90238645676844763,
        //         "highest_52_week_price": 0.00006592,
        //         "highest_52_week_date": "2025-11-05",
        //         "lowest_52_week_price": 0.00000782,
        //         "lowest_52_week_date": "2026-02-22",
        //         "timestamp": 1782981333650
        //     }
        //
        // generation 2: watchTicker
        //
        //     {
        //         "type": "ticker",
        //         "code": "KRW-BTC",
        //         "opening_price": 94223000,
        //         "high_price": 95465000,
        //         "low_price": 93601000,
        //         "trade_price": 95299000,
        //         "prev_closing_price": 94201000,
        //         "change": "RISE",
        //         "change_price": 1098000,
        //         "signed_change_price": 1098000,
        //         "change_rate": 0.01165593,
        //         "signed_change_rate": 0.01165593,
        //         "trade_volume": 0.0094,
        //         "acc_trade_volume": 151.44914647,
        //         "acc_trade_volume_24h": 310.44065227,
        //         "acc_trade_price": 14330306973.41015,
        //         "acc_trade_price_24h": 29226371799.56915,
        //         "trade_date": "20260710",
        //         "trade_time": "124548",
        //         "trade_timestamp": 1783655148303,
        //         "ask_bid": "BID",
        //         "acc_ask_volume": 52.30413928,
        //         "acc_bid_volume": 99.14500719,
        //         "highest_52_week_price": 179734000,
        //         "highest_52_week_date": "2025-10-09",
        //         "lowest_52_week_price": 81110000,
        //         "lowest_52_week_date": "2026-02-06",
        //         "market_state": "ACTIVE",
        //         "is_trading_suspended": false,
        //         "delisting_date": "",
        //         "market_warning": "NONE",
        //         "timestamp": 1783655148485,
        //         "stream_type": "REALTIME"
        //     }
        //
        const timestamp = this.safeInteger2 (ticker, 'date', 'trade_timestamp');
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const close = this.safeString2 (ticker, 'closing_price', 'trade_price');
        let change = this.safeString2 (ticker, 'signed_change_price', 'change_price');
        let percentage = this.safeString2 (ticker, 'signed_change_rate', 'change_rate');
        const open = this.safeString (ticker, 'opening_price');
        const nonZeroOpen = this.omitZero (open);
        if ((marketId !== undefined) && (nonZeroOpen !== undefined) && (close !== undefined)) {
            const computedChange = Precise.stringSub (close, open);
            // Some v2 payloads return signed_change_price as 0 while open/last imply a non-zero move.
            if ((change !== undefined) && Precise.stringEq (change, '0') && !Precise.stringEq (computedChange, '0')) {
                change = computedChange;
                percentage = undefined;
            }
        }
        let high = this.safeString2 (ticker, 'max_price', 'high_price');
        let low = this.safeString2 (ticker, 'min_price', 'low_price');
        // Some generation 2 ticker payloads can contain inconsistent high/low versus last.
        if ((close !== undefined) && (high !== undefined) && Precise.stringGt (close, high)) {
            high = close;
        }
        if ((close !== undefined) && (low !== undefined) && Precise.stringLt (close, low)) {
            low = close;
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': this.safeString (ticker, 'buy_price'),
            'bidVolume': this.safeString (ticker, 'acc_bid_volume'),
            'ask': this.safeString (ticker, 'sell_price'),
            'askVolume': this.safeString (ticker, 'acc_ask_volume'),
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': this.safeString (ticker, 'prev_closing_price'),
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'units_traded_24H', 'acc_trade_volume_24h'),
            'quoteVolume': this.safeString2 (ticker, 'acc_trade_value_24H', 'acc_trade_price_24h'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bithumb#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
     * @see https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A1%B0%ED%9A%8C
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchTickers', 'generation', 2);
        const request: Dict = {};
        const result: Dict = {};
        if (generation === 2) {
            // Bithumb v2 ticker payloads are inconsistent for all-market calls,
            // so we aggregate one market per request only when symbols are not provided.
            let marketIds = [];
            if (symbols === undefined) {
                marketIds = this.marketIds (this.symbols);
            } else {
                marketIds = this.marketIds (symbols);
                request['markets'] = marketIds.join (',');
            }
            const promises = [];
            if (symbols === undefined) {
                for (let i = 0; i < marketIds.length; i++) {
                    promises.push (this.publicGetV1Ticker (this.extend ({ 'markets': marketIds[i] }, params)));
                }
            } else {
                promises.push (this.publicGetV1Ticker (this.extend (request, params)));
            }
            //
            //     [
            //         {
            //             "market": "BTC-USDC",
            //             "trade_date": "20260701",
            //             "trade_time": "233533",
            //             "trade_date_kst": "20260702",
            //             "trade_time_kst": "083533",
            //             "trade_timestamp": 1782981333650,
            //             "opening_price": 0.00001667,
            //             "high_price": 0.00001667,
            //             "low_price": 0.00001645,
            //             "trade_price": 0.00001659,
            //             "prev_closing_price": 0.00001673,
            //             "change": "FALL",
            //             "change_price": 1.4E-7,
            //             "change_rate": 0.0084,
            //             "signed_change_price": -1.4E-7,
            //             "signed_change_rate": -0.0084,
            //             "trade_volume": 1.43724182,
            //             "acc_trade_price": 0.77934383561689,
            //             "acc_trade_price_24h": 1.76373410121466379999997512,
            //             "acc_trade_volume": 47175.3220805,
            //             "acc_trade_volume_24h": 104565.90238645676844763,
            //             "highest_52_week_price": 0.00006592,
            //             "highest_52_week_date": "2025-11-05",
            //             "lowest_52_week_price": 0.00000782,
            //             "lowest_52_week_date": "2026-02-22",
            //             "timestamp": 1782981333650
            //         },
            //     ]
            //
            const responses = await Promise.all (promises);
            for (let i = 0; i < responses.length; i++) {
                let response = responses[i];
                if (this.isDictionary (response) && ('data' in response) && (response['data'] !== undefined)) {
                    response = response['data'];
                }
                let expectedMarketId = undefined;
                if (symbols === undefined) {
                    expectedMarketId = marketIds[i];
                }
                let tickers = [];
                if (Array.isArray (response)) {
                    tickers = response;
                } else if (this.isDictionary (response)) {
                    if (('market' in response) || ('trade_date' in response) || ('trade_timestamp' in response)) {
                        tickers = [ response ];
                    } else {
                        const ids = Object.keys (response);
                        for (let j = 0; j < ids.length; j++) {
                            const id = ids[j];
                            const ticker = this.safeDict (response, id);
                            if (ticker !== undefined) {
                                ticker['market'] = this.safeString (ticker, 'market', id);
                                tickers.push (ticker);
                            }
                        }
                    }
                }
                for (let j = 0; j < tickers.length; j++) {
                    const entry = tickers[j];
                    const marketId = this.safeString (entry, 'market', expectedMarketId);
                    if (marketId === undefined) {
                        continue;
                    }
                    const market = this.safeMarket (marketId);
                    const symbol = this.safeSymbol (marketId, market);
                    if (symbol === undefined) {
                        continue;
                    }
                    result[symbol] = this.parseTicker (entry, market);
                }
            }
        } else {
            const quoteCurrencies = this.safeDict (this.options, 'quoteCurrencies', {});
            let quotes = Object.keys (quoteCurrencies);
            if (symbols !== undefined) {
                const requiredQuotes: Dict = {};
                for (let i = 0; i < symbols.length; i++) {
                    const symbol = symbols[i];
                    const market = this.market (symbol);
                    const quoteId = this.safeString (market, 'quoteId');
                    if ((quoteId !== undefined) && (quoteId in quoteCurrencies)) {
                        requiredQuotes[quoteId] = true;
                    }
                }
                const requiredQuoteIds = Object.keys (requiredQuotes);
                const populatedQuotes = this.safeString (requiredQuoteIds, 0);
                if (populatedQuotes !== undefined) {
                    quotes = requiredQuoteIds;
                }
            }
            const promises: any[] = [];
            for (let i = 0; i < quotes.length; i++) {
                request['quoteId'] = quotes[i];
                promises.push (this.publicGetPublicTickerALLQuoteId (this.extend (request, params)));
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
            }
            const responses = await Promise.all (promises);
            for (let i = 0; i < quotes.length; i++) {
                const quote = quotes[i];
                const response = responses[i];
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
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    /**
     * @method
     * @name bithumb#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchTicker', 'generation', 2);
        const market = this.market (symbol);
        const request: Dict = {};
        let response = undefined;
        let data: Dict = {};
        if (generation === 2) {
            request['markets'] = market['id'];
            const marketId = this.safeString (market, 'id');
            const quote = this.safeString (market, 'quote');
            const base = this.safeString (market, 'base');
            let fallbackMarketId = undefined;
            if ((quote !== undefined) && (base !== undefined)) {
                fallbackMarketId = (quote + '-' + base);
            } else {
                fallbackMarketId = marketId;
            }
            let marketIdRequest = undefined;
            if ((marketId !== undefined) && (marketId.indexOf ('-') >= 0)) {
                marketIdRequest = marketId;
            } else {
                marketIdRequest = fallbackMarketId;
            }
            request['markets'] = marketIdRequest;
            response = await this.publicGetV1Ticker (this.extend (request, params));
            //
            //     [
            //         {
            //             "market": "BTC-USDC",
            //             "trade_date": "20260701",
            //             "trade_time": "233533",
            //             "trade_date_kst": "20260702",
            //             "trade_time_kst": "083533",
            //             "trade_timestamp": 1782981333650,
            //             "opening_price": 0.00001667,
            //             "high_price": 0.00001667,
            //             "low_price": 0.00001645,
            //             "trade_price": 0.00001659,
            //             "prev_closing_price": 0.00001673,
            //             "change": "FALL",
            //             "change_price": 1.4E-7,
            //             "change_rate": 0.0084,
            //             "signed_change_price": -1.4E-7,
            //             "signed_change_rate": -0.0084,
            //             "trade_volume": 1.43724182,
            //             "acc_trade_price": 0.77934383561689,
            //             "acc_trade_price_24h": 1.76373410121466379999997512,
            //             "acc_trade_volume": 47175.3220805,
            //             "acc_trade_volume_24h": 104565.90238645676844763,
            //             "highest_52_week_price": 0.00006592,
            //             "highest_52_week_date": "2025-11-05",
            //             "lowest_52_week_price": 0.00000782,
            //             "lowest_52_week_date": "2026-02-22",
            //             "timestamp": 1782981333650
            //         },
            //     ]
            //
            data = this.safeDict (response, 0, {});
        } else {
            request['baseId'] = market['baseId'];
            request['quoteId'] = market['quoteId'];
            response = await this.publicGetPublicTickerBaseIdQuoteId (this.extend (request, params));
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
            data = this.safeDict (response, 'data', {});
        }
        return this.parseTicker (data, market);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        // generation 1
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
        // generation 2
        //
        //     {
        //         "market": "BTC-USDC",
        //         "candle_date_time_utc": "2026-07-02T08:59:00",
        //         "candle_date_time_kst": "2026-07-02T17:59:00",
        //         "opening_price": 0.0000165,
        //         "high_price": 0.0000165,
        //         "low_price": 0.0000165,
        //         "trade_price": 0.0000165,
        //         "timestamp": 1782982784329,
        //         "candle_acc_trade_price": 0.001155,
        //         "candle_acc_trade_volume": 70,
        //         "unit": 1
        //     }
        //
        let timestamp = undefined;
        if (Array.isArray (ohlcv)) {
            timestamp = this.safeInteger2 (ohlcv, 0, 'timestamp');
        } else {
            timestamp = this.parse8601 (this.safeString2 (ohlcv, 'candle_date_time_utc', 'candle_date_time_kst'));
        }
        return [
            timestamp,
            this.safeNumber2 (ohlcv, 1, 'opening_price'),
            this.safeNumber2 (ohlcv, 3, 'high_price'),
            this.safeNumber2 (ohlcv, 4, 'low_price'),
            this.safeNumber2 (ohlcv, 2, 'trade_price'),
            this.safeNumber2 (ohlcv, 5, 'candle_acc_trade_volume'),
        ];
    }

    /**
     * @method
     * @name bithumb#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/candlestick-rest-api
     * @see https://apidocs.bithumb.com/reference/%EB%B6%84minute-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%9D%BCday-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BCweek-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%9B%94month-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'generation', 2);
        const market = this.market (symbol);
        const request: Dict = {};
        let response = undefined;
        let data = undefined;
        if (generation === 2) {
            request['market'] = market['id'];
            if (limit !== undefined) {
                request['count'] = limit;
            }
            if (timeframe === '1d') {
                response = await this.publicGetV1CandlesDays (this.extend (request, params));
            } else if (timeframe === '1w') {
                response = await this.publicGetV1CandlesWeeks (this.extend (request, params));
            } else if (timeframe === '1M') {
                response = await this.publicGetV1CandlesMonths (this.extend (request, params));
            } else {
                const timeframeInteger = this.safeInteger (this.timeframes, timeframe);
                if (timeframeInteger === undefined) {
                    throw new BadRequest (this.id + ' fetchOHLCV() unsupported timeframe ' + timeframe);
                }
                request['unit'] = timeframeInteger;
                response = await this.publicGetV1CandlesMinutesUnit (this.extend (request, params));
            }
            //
            //     [
            //         {
            //             "market": "BTC-USDC",
            //             "candle_date_time_utc": "2026-07-02T08:59:00",
            //             "candle_date_time_kst": "2026-07-02T17:59:00",
            //             "opening_price": 0.0000165,
            //             "high_price": 0.0000165,
            //             "low_price": 0.0000165,
            //             "trade_price": 0.0000165,
            //             "timestamp": 1782982784329,
            //             "candle_acc_trade_price": 0.001155,
            //             "candle_acc_trade_volume": 70,
            //             "unit": 1
            //         },
            //     ]
            //
            data = response;
        } else {
            const legacyTimeframes: Dict = {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '10m': '10m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '24h',
                '1w': '1w',
                '1M': '1mm',
            };
            request['interval'] = this.safeString (legacyTimeframes, timeframe, timeframe);
            request['baseId'] = market['baseId'];
            request['quoteId'] = market['quoteId'];
            response = await this.publicGetPublicCandlestickBaseIdQuoteIdInterval (this.extend (request, params));
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
            data = this.safeList (response, 'data', []);
        }
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // generation 1: fetchTrades (public)
        //
        //     {
        //         "transaction_date":"2020-04-23 22:21:46",
        //         "type":"ask",
        //         "units_traded":"0.0125",
        //         "price":"8667000",
        //         "total":"108337"
        //     }
        //
        // generation 1: fetchOrder (private)
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
        // generation 2: fetchTrades
        //
        //     {
        //         "market": "BTC-USDC",
        //         "trade_date_utc": "2026-07-02",
        //         "trade_time_utc": "08:41:10",
        //         "timestamp": "1782981670705",
        //         "trade_price": "0.00001646",
        //         "trade_volume": "42.0335581",
        //         "prev_closing_price": "0.00001673",
        //         "change_price": "-2.7E-7",
        //         "ask_bid": "ASK",
        //         "sequential_id": "17829816707050000"
        //     }
        //
        // generation 2: watchTrades
        //
        //     {
        //         "type": "trade",
        //         "code": "KRW-BTC",
        //         "trade_price": 95539000,
        //         "trade_volume": 0.00022664,
        //         "ask_bid": "ASK",
        //         "prev_closing_price": 94201000,
        //         "change": "RISE",
        //         "change_price": 1338000,
        //         "trade_date": "2026-07-10",
        //         "trade_time": "13:39:41",
        //         "trade_timestamp": 1783658381138,
        //         "sequential_id": "862683813820523888",
        //         "timestamp": 1783658381398,
        //         "stream_type": "REALTIME"
        //     }
        //
        // a workaround for their bug in date format, hours are not 0-padded
        let timestamp = this.safeInteger (trade, 'timestamp');
        const isGenerationTwo = (timestamp !== undefined);
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
        if ((timestamp !== undefined) && (!isGenerationTwo)) {
            timestamp -= 9 * 3600000; // they report UTC + 9 hours, server in Korean timezone
        }
        const type = undefined;
        let side = this.safeStringLower2 (trade, 'ask_bid', 'type');
        if (side === 'bid') {
            side = 'buy';
        } else if (side === 'ask') {
            side = 'sell';
        } else {
            side = undefined;
        }
        const id = this.safeString2 (trade, 'cont_no', 'sequential_id');
        const marketId = this.safeString (trade, 'market');
        market = this.safeMarket (marketId, market);
        const priceString = this.safeString2 (trade, 'price', 'trade_price');
        let amountString = this.safeString (trade, 'trade_volume');
        if (amountString === undefined) {
            amountString = this.fixCommaNumber (this.safeString2 (trade, 'units_traded', 'units'));
        }
        const costString = this.safeString (trade, 'total');
        let fee: NullableDict = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.commonCurrencyCode ((feeCurrencyId as string));
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

    /**
     * @method
     * @name bithumb#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD
     * @see https://apidocs.bithumb.com/reference/%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'generation', 2);
        const market = this.market (symbol);
        const request: Dict = {};
        if (limit !== undefined) {
            request['count'] = limit;
        }
        let response = undefined;
        let data = undefined;
        if (generation === 2) {
            request['market'] = market['id'];
            response = await this.publicGetV1TradesTicks (this.extend (request, params));
            //
            //     [
            //         {
            //             "market": "BTC-USDC",
            //             "trade_date_utc": "2026-07-02",
            //             "trade_time_utc": "08:41:10",
            //             "timestamp": "1782981670705",
            //             "trade_price": "0.00001646",
            //             "trade_volume": "42.0335581",
            //             "prev_closing_price": "0.00001673",
            //             "change_price": "-2.7E-7",
            //             "ask_bid": "ASK",
            //             "sequential_id": "17829816707050000"
            //         }
            //     ]
            //
            data = response;
        } else {
            request['baseId'] = market['baseId'];
            request['quoteId'] = market['quoteId'];
            response = await this.publicGetPublicTransactionHistoryBaseIdQuoteId (this.extend (request, params));
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
            data = this.safeList (response, 'data', []);
        }
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name bithumb#createOrders
     * @description create a list of trade orders, only available for the generation 2 API
     * @see https://apidocs.bithumb.com/reference/%EB%8B%A4%EA%B1%B4-%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] supports 'IOC', 'FOK', and 'PO'
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.clientOrderId] the clientOrderId of the order
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'createOrders', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' createOrders is only supported for the generation 2 API');
        }
        const ordersCount = orders.length;
        if (ordersCount === 0) {
            throw new ArgumentsRequired (this.id + ' createOrders() requires a non-empty orders array');
        }
        const ordersRequests: List = [];
        let orderSymbols: List = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString (rawOrder, 'symbol');
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrders() requires each order to have a symbol');
            }
            orderSymbols.push (symbol);
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'amount');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        orderSymbols = this.marketSymbols (orderSymbols, undefined, false, true, true);
        const market = this.market (orderSymbols[0]);
        const request: Dict = {
            'batch_orders': ordersRequests,
        };
        const response = await this.privatePostV2OrdersBatch (this.extend (request, params));
        //
        //     {
        //         "batch_orders_response": [
        //             {
        //                 "order_id": "C0101000003152500274",
        //                 "market": "KRW-BTC",
        //                 "side": "bid",
        //                 "order_type": "limit",
        //                 "created_at": "2026-07-04T15:49:24+09:00",
        //                 "stp_type": "cancel_taker"
        //             },
        //         ]
        //     }
        //
        const data = this.safeList (response, 'batch_orders_response', []);
        return this.parseOrders (data, market);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name bithumb#createOrderRequest
         * @description helper function to build the request *for generation 2 createOrder and createOrders only*
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} request to be sent to the exchange
         */
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        let sideRequest = undefined;
        if (side === 'buy') {
            sideRequest = 'bid';
        } else if (side === 'sell') {
            sideRequest = 'ask';
        } else {
            throw new InvalidOrder (this.id + ' createOrder() invalid side ' + side);
        }
        request['side'] = sideRequest;
        let timeInForce = this.safeString2 (params, 'timeInForce', 'time_in_force');
        if (timeInForce === undefined) {
            timeInForce = 'GTC';
        } else {
            params = this.omit (params, 'timeInForce');
        }
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (type === 'market', false, params);
        if (postOnly || (timeInForce === 'PO')) {
            request['time_in_force'] = 'post_only';
            params = this.omit (params, 'postOnly');
        } else if (timeInForce === 'FOK') {
            request['time_in_force'] = 'fok';
        } else if (timeInForce === 'IOC') {
            request['time_in_force'] = 'ioc';
        }
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['volume'] = this.amountToPrecision (symbol, amount);
            request['order_type'] = 'limit';
        } else {
            let typeRequest = undefined;
            if (side === 'buy') {
                typeRequest = 'price';
                // for market buy it requires the amount of quote currency to spend
                let cost = this.safeString (params, 'cost');
                params = this.omit (params, 'cost');
                let createMarketBuyOrderRequiresPrice = true;
                [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if ((price === undefined) && (cost === undefined)) {
                        throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                    } else {
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        cost = Precise.stringMul (amountString, priceString);
                    }
                } else {
                    cost = (cost === undefined) ? this.numberToString (amount) : cost;
                }
                request['price'] = this.priceToPrecision (symbol, cost);
            } else {
                request['volume'] = this.amountToPrecision (symbol, amount);
                typeRequest = 'market';
            }
            request['order_type'] = typeRequest;
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        return this.extend (request, params);
    }

    /**
     * @method
     * @name bithumb#createOrder
     * @description create a trade order
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%A7%80%EC%A0%95%EA%B0%80-%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EC%88%98%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EB%8F%84%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] supports 'IOC', 'FOK', and 'PO'
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.clientOrderId] the clientOrderId of the order
     * @param {string} [params.cost] *generation 2 only* optional cost parameter for market buy orders instead of setting the price, must also set createMarketBuyOrderRequiresPrice to false
     * @param {bool} [params.createMarketBuyOrderRequiresPrice] *generation 2 only* set to false if passing a cost param or using cost in the amount argument, defaults to true
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'createOrder', 'generation', 2);
        let request: Dict = {};
        const market = this.market (symbol);
        let response = undefined;
        if (generation === 2) {
            request = this.createOrderRequest (symbol, type, side, amount, price, params);
            response = await this.privatePostV2Orders (request);
            //
            //     {
            //         "order_id": "C0101000003152350309",
            //         "market": "KRW-BTC",
            //         "side": "bid",
            //         "order_type": "limit",
            //         "created_at": "2026-07-04T14:39:04+09:00",
            //         "stp_type": "cancel_taker"
            //     }
            //
        } else {
            request['order_currency'] = market['base'];
            request['payment_currency'] = market['quote'];
            request['units'] = this.amountToPrecision (symbol, amount);
            let method = 'privatePostTradePlace';
            if (type === 'limit') {
                request['price'] = this.priceToPrecision (symbol, price);
                let typeRequest = undefined;
                if (side === 'buy') {
                    typeRequest = 'bid';
                } else {
                    typeRequest = 'ask';
                }
                request['type'] = typeRequest;
            } else {
                method = 'privatePostTradeMarket' + this.capitalize ((side as string));
            }
            response = await this[method] (this.extend (request, params));
            //
            //     {
            //         "status": "0000",
            //         "order_id": "C0101000003152294086"
            //     }
            //
        }
        const id = this.safeString (response, 'order_id');
        if (id === undefined) {
            throw new InvalidOrder (this.id + ' createOrder() did not return an order id');
        }
        return this.extend (this.parseOrder (response, market), {
            'info': response,
            'symbol': symbol,
            'type': type,
            'side': side,
            'id': id,
        }) as Order;
    }

    /**
     * @method
     * @name bithumb#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createMarketBuyOrderWithCost (symbol: string, cost: number, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'createMarketBuyOrderWithCost', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' createMarketBuyOrderWithCost() is only supported for the generation 2 API');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        return await this.createOrder (symbol, 'market', 'buy', cost, undefined, params);
    }

    /**
     * @method
     * @name bithumb#createTwapOrder
     * @description create a trade order that is executed as a TWAP order over a specified duration.
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency, only required for sale
     * @param {int} duration the duration of the TWAP order in milliseconds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.frequency required order interval in seconds, 15, 20, 30, 60 or 120
     * @param {string} [params.price] order price, required for purchase
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createTwapOrder (symbol: string, side: OrderSide, amount: number, duration: number, params = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'createTwapOrder', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' createTwapOrder() is only supported for the generation 2 API');
        }
        const market = this.market (symbol);
        const durationString = this.numberToString (duration);
        const durationSeconds = Precise.stringDiv (durationString, '1000');
        const request: Dict = {
            'market': market['id'],
            'duration': durationSeconds,
        };
        if (amount !== undefined) {
            request['volume'] = this.amountToPrecision (symbol, amount); // required for sale
        }
        let sideRequest = undefined;
        if (side === 'buy') {
            sideRequest = 'bid';
        } else {
            sideRequest = 'ask';
        }
        request['side'] = sideRequest;
        const response = await this.privatePostV1Twap (this.extend (request, params));
        //
        //     {
        //         "algo_order_id": "019f3ed7-4f92-7179-beee-84b4c71e53fa"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bithumb#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%83%81%EC%84%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%A3%BC%EB%AC%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the clientOrderId of the order, alternative to using the order id
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] *generation 2 only* if you want to fetch a generation 2 twap order
     * @param {string} [params.state] *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchOrder', 'generation', 2);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const twap = this.safeBool (params, 'twap', false);
        params = this.omit (params, 'twap');
        const request: Dict = {};
        let response = undefined;
        let data = undefined;
        if (generation === 2) {
            if (twap) {
                if (market !== undefined) {
                    request['market'] = market['id'];
                }
                request['uuids'] = [ id ];
                response = await this.privateGetV1Twap (this.extend (request, params));
                //
                //     {
                //         "has_next": false,
                //         "next_key": null,
                //         "orders": [
                //             {
                //                 "uuid": "019f3ed7-4f92-7179-beee-84b4c71e53fa",
                //                 "side": "bid",
                //                 "price": "92500000",
                //                 "state": "progress",
                //                 "market": "KRW-BTC",
                //                 "created_at": "2025-12-04T10:00:00+09:00",
                //                 "volume": "1.0",
                //                 "total_order_count": 60,
                //                 "total_trades_count": 10,
                //                 "progress_count": 25,
                //                 "total_executed_amount": "2312500000",
                //                 "total_executed_volume": "0.25",
                //                 "avg_trade_price": "92500000.000",
                //                 "wallet_id": "0000000000-00-0000"
                //             },
                //         ]
                //     }
                //
                const orders = this.safeList (response, 'orders', []);
                data = this.safeDict (orders, 0, {});
            } else {
                const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
                if (clientOrderId !== undefined) {
                    request['client_order_id'] = clientOrderId;
                    params = this.omit (params, [ 'clientOrderId' ]);
                } else {
                    request['uuid'] = id;
                }
                response = await this.privateGetV1Order (this.extend (request, params));
                //
                //     {
                //         "uuid": "C0101000003152406454",
                //         "side": "bid",
                //         "ord_type": "limit",
                //         "price": "9500000",
                //         "state": "wait",
                //         "market": "KRW-BTC",
                //         "created_at": "2026-07-04T15:05:46+09:00",
                //         "volume": "0.001",
                //         "remaining_volume": "0.001",
                //         "reserved_fee": "23.75",
                //         "remaining_fee": "23.75",
                //         "paid_fee": "0",
                //         "locked": "9524.75",
                //         "executed_volume": "0",
                //         "executed_funds": "0",
                //         "trades_count": 0,
                //         "stp_type": "cancel_taker",
                //         "trades": []
                //     }
                //
                data = response;
            }
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
            }
            request['order_id'] = id;
            request['order_currency'] = market['base'];
            request['payment_currency'] = market['quote'];
            response = await this.privatePostInfoOrderDetail (this.extend (request, params));
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
            data = this.safeDict (response, 'data');
        }
        const orderData: Dict = {
            'order_id': id,
        };
        const parsedOrder = this.extend (data, orderData);
        return this.parseOrder (parsedOrder, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'Pending': 'open',
            'Completed': 'closed',
            'Cancel': 'canceled',
            'wait': 'open',
            'watch': 'open',
            'done': 'closed',
            'cancel': 'canceled',
            'progress': 'open',
        };
        return this.safeString (statuses, (status as string), status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //
        // generation 1: fetchOrder
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
        // generation 1: fetchOpenOrders
        //
        //     {
        //         "order_currency": "BTC",
        //         "payment_currency": "KRW",
        //         "order_id": "C0101000003152294086",
        //         "order_date": "1783141846061516",
        //         "type": "bid",
        //         "watch_price": "0",
        //         "units": "0.001",
        //         "units_remaining": "0.001",
        //         "price": "9500000",
        //         "stp_type": "cancel_taker"
        //     }
        //
        // generation 1: cancelOrder
        //
        //     {
        //         "status": "0000"
        //     }
        //
        // generation 2: createOrder, createOrders
        //
        //     {
        //         "order_id": "C0101000003152350309",
        //         "market": "KRW-BTC",
        //         "side": "bid",
        //         "order_type": "limit",
        //         "created_at": "2026-07-04T14:39:04+09:00",
        //         "stp_type": "cancel_taker"
        //     }
        //
        // generation 2: fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders
        //
        //     {
        //         "uuid": "C0101000003152406454",
        //         "side": "bid",
        //         "ord_type": "limit",
        //         "price": "9500000",
        //         "state": "wait",
        //         "market": "KRW-BTC",
        //         "created_at": "2026-07-04T15:05:46+09:00",
        //         "volume": "0.001",
        //         "remaining_volume": "0.001",
        //         "reserved_fee": "23.75",
        //         "remaining_fee": "23.75",
        //         "paid_fee": "0",
        //         "locked": "9524.75",
        //         "executed_volume": "0",
        //         "executed_funds": "0",
        //         "trades_count": 0,
        //         "stp_type": "cancel_taker",
        //         "trades": []
        //     }
        //
        // generation 2: cancelOrder, cancelOrders
        //
        //     {
        //         "order_id": "C0101000003152350309",
        //         "created_at": "2026-07-04T14:39:04+09:00"
        //     }
        //
        // generation 2: createTwapOrder, twap cancelOrder
        //
        //     {
        //         "algo_order_id": "019f3ed7-4f92-7179-beee-84b4c71e53fa"
        //     }
        //
        // generation 2: twap fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders
        //
        //     {
        //         "uuid": "019f3ed7-4f92-7179-beee-84b4c71e53fa",
        //         "side": "bid",
        //         "price": "92500000",
        //         "state": "progress",
        //         "market": "KRW-BTC",
        //         "created_at": "2025-12-03T09:00:00+09:00",
        //         "volume": "1.0",
        //         "total_order_count": 60,
        //         "total_trades_count": 10,
        //         "progress_count": 25,
        //         "total_executed_amount": "2312500000",
        //         "total_executed_volume": "0.25",
        //         "avg_trade_price": "92500000.000",
        //         "wallet_id": "0000000000-00-0000",
        //         "canceled_at": "2025-12-03T09:15:00+09:00",
        //         "cancel_type": "user"
        //     }
        //
        let datetime = this.safeString (order, 'created_at');
        let timestamp = undefined;
        if (datetime !== undefined) {
            if (datetime.indexOf ('+09:00') > -1) {
                const normalized = datetime.replace ('+09:00', 'Z');
                const normalizedTimestamp = this.parse8601 (normalized);
                if (normalizedTimestamp !== undefined) {
                    timestamp = normalizedTimestamp - 9 * 3600000;
                } else {
                    timestamp = this.parse8601 (datetime);
                }
            } else {
                timestamp = this.parse8601 (datetime);
            }
        } else {
            timestamp = this.safeIntegerProduct (order, 'order_date', 0.001);
            datetime = this.iso8601 (timestamp);
        }
        const sideProperty = this.safeString2 (order, 'type', 'side');
        let side = undefined;
        if (sideProperty === 'bid') {
            side = 'buy';
        } else if (sideProperty === 'ask') {
            side = 'sell';
        }
        const status = this.parseOrderStatus (this.safeString2 (order, 'order_status', 'state'));
        const price = this.safeString2 (order, 'order_price', 'price');
        let type = this.safeString2 (order, 'order_type', 'ord_type');
        const progressCount = this.safeString (order, 'progress_count');
        if ((type === undefined) && (price !== undefined) && (progressCount === undefined)) {
            if (Precise.stringEquals (price, '0')) {
                type = 'market';
            } else {
                type = 'limit';
            }
        }
        const amount = this.fixCommaNumber (this.safeStringN (order, [ 'order_qty', 'units', 'volume' ]));
        let remaining = this.fixCommaNumber (this.safeString2 (order, 'units_remaining', 'remaining_volume'));
        if (remaining === undefined) {
            if (status === 'closed') {
                remaining = '0';
            } else if (status !== 'canceled') {
                remaining = amount;
            }
        }
        let symbol: Str = undefined;
        const baseId = this.safeString (order, 'order_currency');
        const quoteId = this.safeString (order, 'payment_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        if ((base !== undefined) && (quote !== undefined)) {
            symbol = base + '/' + quote;
        }
        if (symbol === undefined) {
            const marketId = this.safeString (order, 'market');
            market = this.safeMarket (marketId, market);
            symbol = market['symbol'];
        }
        const id = this.safeStringN (order, [ 'order_id', 'uuid', 'algo_order_id' ]);
        const rawTrades = this.safeList2 (order, 'contract', 'trades', []);
        const feeCost = this.safeNumber (order, 'reserved_fee');
        let fee: Fee = undefined;
        if (feeCost !== undefined) {
            let currency = undefined;
            if (market !== undefined) {
                currency = market['quote'];
            }
            fee = {
                'currency': currency,
                'cost': feeCost,
                'rate': undefined,
            };
        }
        let postOnly = undefined;
        let timeInForce = this.safeStringUpper (order, 'time_in_force');
        if (timeInForce === 'POST_ONLY') {
            timeInForce = 'PO';
            postOnly = true;
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': this.safeNumber (order, 'avg_trade_price'),
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': rawTrades,
        }, market);
    }

    /**
     * @method
     * @name bithumb#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] *generation 2 only* if you want to fetch generation 2 twap orders
     * @param {string} [params.state] *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'generation', 2);
        const request: Dict = {};
        let market = undefined;
        let response = undefined;
        if (generation === 2) {
            const twap = this.safeBool (params, 'twap', false);
            if (twap) {
                params['state'] = 'progress';
            } else {
                params['state'] = 'wait';
            }
            const orders = await this.fetchOrders (symbol, since, limit, params);
            return this.filterBySinceLimit (orders, since, limit) as Order[];
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
            }
            market = this.market (symbol);
            if (since !== undefined) {
                request['after'] = since;
            }
            if (limit === undefined) {
                limit = 100;
            }
            request['count'] = limit;
            request['order_currency'] = market['base'];
            request['payment_currency'] = market['quote'];
            response = await this.privatePostInfoOrders (this.extend (request, params));
            //
            //     {
            //         "status": "0000",
            //         "data": [
            //             {
            //                 "order_currency": "BTC",
            //                 "payment_currency": "KRW",
            //                 "order_id": "C0101000003152294086",
            //                 "order_date": "1783141846061516",
            //                 "type": "bid",
            //                 "watch_price": "0",
            //                 "units": "0.001",
            //                 "units_remaining": "0.001",
            //                 "price": "9500000",
            //                 "stp_type": "cancel_taker"
            //             }
            //         ]
            //     }
            //
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name bithumb#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] an array of client order ids
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] *generation 2 only* if you want to fetch generation 2 twap orders
     * @param {string} [params.state] *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' fetchOrders is only supported for the generation 2 API');
        }
        const request: Dict = {};
        const twap = this.safeBool (params, 'twap', false);
        params = this.omit (params, 'twap');
        if (!twap) {
            const clientOrderIds = this.safeList2 (params, 'client_order_ids', 'clientOrderIds');
            if (clientOrderIds !== undefined) {
                request['client_order_ids'] = clientOrderIds;
                params = this.omit (params, [ 'clientOrderIds' ]);
            }
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let data = undefined;
        if (twap) {
            response = await this.privateGetV1Twap (this.extend (request, params));
            //
            //     {
            //         "has_next": false,
            //         "next_key": null,
            //         "orders": [
            //             {
            //                 "uuid": "019f3ed7-4f92-7179-beee-84b4c71e53fa",
            //                 "side": "bid",
            //                 "price": "92500000",
            //                 "state": "progress",
            //                 "market": "KRW-BTC",
            //                 "created_at": "2025-12-04T10:00:00+09:00",
            //                 "volume": "1.0",
            //                 "total_order_count": 60,
            //                 "total_trades_count": 10,
            //                 "progress_count": 25,
            //                 "total_executed_amount": "2312500000",
            //                 "total_executed_volume": "0.25",
            //                 "avg_trade_price": "92500000.000",
            //                 "wallet_id": "0000000000-00-0000"
            //             },
            //         ]
            //     }
            //
            data = this.safeList (response, 'orders', []);
        } else {
            response = await this.privateGetV1Orders (this.extend (request, params));
            //
            //     [
            //         {
            //             "uuid": "C0101000003152406454",
            //             "side": "bid",
            //             "ord_type": "limit",
            //             "price": "9500000",
            //             "state": "wait",
            //             "market": "KRW-BTC",
            //             "created_at": "2026-07-04T15:05:46+09:00",
            //             "volume": "0.001",
            //             "remaining_volume": "0.001",
            //             "reserved_fee": "23.75",
            //             "remaining_fee": "23.75",
            //             "paid_fee": "0",
            //             "locked": "9524.75",
            //             "executed_volume": "0",
            //             "executed_funds": "0",
            //             "trades_count": 0,
            //             "stp_type": "cancel_taker"
            //         }
            //     ]
            //
            data = response;
        }
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name bithumb#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] an array of client order ids
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] if you want to fetch generation 2 twap orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        params['state'] = 'done';
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBySinceLimit (orders, since, limit) as Order[];
    }

    /**
     * @method
     * @name bithumb#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] an array of client order ids
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] if you want to fetch generation 2 twap orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        params['state'] = 'cancel';
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBySinceLimit (orders, since, limit) as Order[];
    }

    /**
     * @method
     * @name bithumb#cancelOrder
     * @description cancels an open order
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C-%EC%A0%91%EC%88%98
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the clientOrderId of the order, alternative to using the order id
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] if you want to cancel a generation 2 twap order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'cancelOrder', 'generation', 2);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {};
        let response = undefined;
        const twap = this.safeBool (params, 'twap', false);
        params = this.omit (params, 'twap');
        if (twap) {
            request['algo_order_id'] = id;
        } else {
            const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
            if ((generation === 2) && (clientOrderId !== undefined)) {
                request['client_order_id'] = clientOrderId;
                params = this.omit (params, [ 'clientOrderId' ]);
            } else {
                request['order_id'] = id;
            }
        }
        if (generation === 2) {
            if (twap) {
                response = await this.privateDeleteV1Twap (this.extend (request, params));
                //
                //     {
                //         "algo_order_id": "TWAP-A01B02C03D04E05F06"
                //     }
                //
            } else {
                response = await this.privateDeleteV2Order (this.extend (request, params));
                //
                //     {
                //         "order_id": "C0101000003152350309",
                //         "created_at": "2026-07-04T14:39:04+09:00"
                //     }
                //
            }
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
            }
            const side_in_params = ('side' in params);
            if (!side_in_params) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a `side` parameter (sell or buy)');
            }
            let side = undefined;
            if (params['side'] === 'buy') {
                side = 'bid';
            } else {
                side = 'ask';
            }
            params = this.omit (params, 'side');
            // https://github.com/ccxt/ccxt/issues/6771
            request['type'] = side;
            request['order_currency'] = market['base'];
            request['payment_currency'] = market['quote'];
            response = await this.privatePostTradeCancel (this.extend (request, params));
            //
            //     {
            //         "status": "0000"
            //     }
            //
        }
        return this.extend (this.parseOrder (response, market), {
            'id': id,
        }) as Order;
    }

    /**
     * @method
     * @name bithumb#cancelOrders
     * @description cancel multiple orders
     * @see https://apidocs.bithumb.com/reference/%EB%8B%A4%EA%B1%B4-%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C-%EC%A0%91%EC%88%98
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] alternative to ids, array of client order ids
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders (ids:string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'cancelOrders', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' cancelOrders is only supported for the generation 2 API');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {};
        const clientOrderIds = this.safeList2 (params, 'client_order_ids', 'clientOrderIds');
        if (clientOrderIds !== undefined) {
            request['client_order_ids'] = clientOrderIds;
            params = this.omit (params, [ 'clientOrderIds' ]);
        } else {
            request['order_ids'] = ids;
        }
        const response = await this.privatePostV2OrdersCancel (this.extend (request, params));
        //
        //     {
        //         "success": [
        //             {
        //                 "order_id": "C0101000003152500274",
        //                 "created_at":"2026-07-04T15:49:24+09:00"
        //             },
        //         ],
        //         "fail": []
        //     }
        //
        const data = this.safeList (response, 'success', []);
        return this.parseOrders (data, market);
    }

    async cancelUnifiedOrder (order: Order, params = {}) {
        const request: Dict = {
            'side': order['side'],
        };
        return await this.cancelOrder ((order['id'] as string), order['symbol'], this.extend (request, params));
    }

    /**
     * @method
     * @name bithumb#withdraw
     * @description make a withdrawal
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%BD%94%EC%9D%B8-%EC%B6%9C%EA%B8%88%ED%95%98%EA%B8%B0-%EA%B0%9C%EC%9D%B8
     * @see https://apidocs.bithumb.com/reference/%EA%B0%80%EC%83%81-%EC%9E%90%EC%82%B0-%EC%B6%9C%EA%B8%88-%EC%9A%94%EC%B2%AD
     * @see https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%B6%9C%EA%B8%88-%EC%9A%94%EC%B2%AD
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag the secondary withdrawal destination address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @param {string} [params.network] the blockchain network to withdraw on, for example BTC or DASH
     * @param {string} [params.destination] secondary address destination for specific currencies, can alternatively use the tag argument
     * @param {string} [params.exchange_name] withdrawal exchange name
     * @param {string} [params.receiver_type] either personal or corporation
     * @param {string} [params.ko_name] *generation 1 only* the receiver name in korean
     * @param {string} [params.en_name] *generation 1 only* the receiver name in english
     * @param {string} [params.receiver_ko_name] *generation 2 only* the personal receiver name in korean
     * @param {string} [params.receiver_en_name] *generation 2 only* the personal receiver name in english
     * @param {string} [params.receiver_corp_ko_name] *generation 2 only* the corporation receiver name in korean
     * @param {string} [params.receiver_corp_en_name] *generation 2 only* the corporation receiver name in english
     * @param {string} [params.two_factor_type] *generation 2 KRW withdraw only* the two factor type, for example kakao
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'withdraw', 'generation', 2);
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        const network = this.safeString2 (params, 'network', 'net_type');
        params = this.omit (params, 'network');
        const currency = this.currency (code);
        const request: Dict = {};
        let response = undefined;
        let destinationRequest = undefined;
        if (code === 'XRP' || code === 'XMR' || code === 'EOS' || code === 'STEEM' || code === 'TON') {
            const destination = this.safeString2 (params, 'destination', 'secondary_address');
            params = this.omit (params, [ 'destination', 'secondary_address' ]);
            if ((tag === undefined) && (destination === undefined)) {
                throw new ArgumentsRequired (this.id + ' ' + code + ' withdraw() requires a tag argument or an extra destination param');
            } else if (tag !== undefined) {
                destinationRequest = tag;
            } else {
                destinationRequest = destination;
            }
        }
        const receiverType = this.safeString2 (params, 'receiver_type', 'cust_type_cd');
        params = this.omit (params, [ 'receiver_type', 'cust_type_cd' ]);
        if (generation === 2) {
            if (code === 'KRW') {
                const twoFactorType = this.safeString (params, 'two_factor_type');
                if (twoFactorType === undefined) {
                    throw new ArgumentsRequired (this.id + ' ' + code + ' withdraw() requires a two_factor_type parameter for withdrawing KRW');
                }
                const krwRequest: Dict = { 'amount': this.numberToString (amount) }; // KRW withdraw only accepts amount and two_factor_type parameters
                response = await this.privatePostV1WithdrawsKrw (this.extend (krwRequest, params));
            } else {
                if (network === undefined) {
                    throw new ArgumentsRequired (this.id + ' ' + code + ' withdraw() requires a network parameter');
                }
                request['address'] = address;
                request['currency'] = currency['id'];
                request['net_type'] = network;
                request['amount'] = this.numberToString (amount);
                if (destinationRequest !== undefined) {
                    request['secondary_address'] = destinationRequest;
                }
                if (receiverType !== undefined) {
                    request['receiver_type'] = receiverType;
                }
                response = await this.privatePostV1WithdrawsCoin (this.extend (request, params));
            }
            //
            //     {
            //         "type": "withdraw",
            //         "uuid": "200377211",
            //         "currency": "BTC",
            //         "net_type": "BTC",
            //         "state": "processing",
            //         "created_at": "2024-07-14T14:54:24+09:00",
            //         "done_at": null,
            //         "amount": "0.00010000",
            //         "fee": "0",
            //         "krw_amount": "8400",
            //         "transaction_type": null,
            //         "txid": null
            //     }
            //
        } else {
            request['address'] = address;
            request['currency'] = currency['id'];
            request['units'] = amount;
            if (network !== undefined) {
                request['net_type'] = network;
            }
            if (destinationRequest !== undefined) {
                request['destination'] = destinationRequest;
            }
            if (receiverType !== undefined) {
                if (receiverType === 'corporation') {
                    request['cust_type_cd'] = 'Corporation 02';
                } else if (receiverType === 'personal') {
                    request['cust_type_cd'] = 'Individual 01';
                } else {
                    request['cust_type_cd'] = receiverType;
                }
            }
            response = await this.privatePostTradeBtcWithdrawal (this.extend (request, params));
            //
            //     {
            //         "status": "0000"
            //     }
            //
        }
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // generation 1: withdraw
        //
        //     {"status": "0000"}
        //
        // generation 2: withdraw, fetchWithdrawal, fetchWithdrawals, fetchDeposit, fetchDeposits
        //
        //     {
        //         "type": "withdraw",
        //         "uuid": "200377211",
        //         "currency": "BTC",
        //         "net_type": "BTC",
        //         "state": "processing",
        //         "created_at": "2024-07-14T14:54:24+09:00",
        //         "done_at": null,
        //         "amount": "0.00010000",
        //         "fee": "0",
        //         "krw_amount": "8400",
        //         "transaction_type": null,
        //         "txid": null
        //     }
        //
        const type = this.safeString (transaction, 'type');
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const datetime = this.safeString (transaction, 'created_at');
        let timestamp = this.parse8601 (datetime);
        if ((datetime !== undefined) && (datetime.indexOf ('+09:00') > -1)) {
            const normalized = datetime.replace ('+09:00', 'Z');
            const normalizedTimestamp = this.parse8601 (normalized);
            if (normalizedTimestamp !== undefined) {
                timestamp = normalizedTimestamp - 9 * 3600000;
            }
        }
        return {
            'id': this.safeString (transaction, 'uuid'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': datetime,
            'network': this.safeString (transaction, 'net_type'),
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'type': type,
            'currency': currency['code'],
            'status': this.parseTransactionStatusByType (this.safeString (transaction, 'state'), type),
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': {
                'currency': undefined,
                'cost': this.safeNumber (transaction, 'fee'),
                'rate': undefined,
            },
            'info': transaction,
        } as Transaction;
    }

    parseTransactionStatusByType (status, type = undefined) {
        if (type === undefined) {
            return status;
        }
        const statusesByType: Dict = {
            'deposit': {
                'DEPOSIT_PROCESSING': 'pending',
                'DEPOSIT_ACCEPTED': 'ok',
                'DEPOSIT_CANCELLED': 'canceled',
                'PROCESSING': 'pending',
                'ACCEPTED': 'ok',
                'CANCELLED': 'canceled',
            },
            'withdraw': {
                'processing': 'pending',
                'done': 'ok',
                'cancelled': 'canceled',
                'PROCESSING': 'pending',
                'DONE': 'ok',
                'CANCELLED': 'canceled',
            },
        };
        const statuses = this.safeDict (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name bithumb#fetchWithdrawalWhitelist
     * @description fetch a list of allowed withdrawal addresses
     * @see https://apidocs.bithumb.com/reference/%EC%B6%9C%EA%B8%88-%ED%97%88%EC%9A%A9-%EC%A3%BC%EC%86%8C-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list response from the exchange
     */
    async fetchWithdrawalWhitelist (params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchWithdrawalWhitelist', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' fetchWithdrawalWhitelist() is only supported for the generation 2 API');
        }
        const response = await this.privateGetV1WithdrawsCoinAddresses (params);
        //
        //     [
        //         {
        //             "currency": "BTC",
        //             "wallet_state": "working",
        //             "block_state": "normal",
        //             "block_height": 852086,
        //             "block_updated_at": "2024-07-14T13:43:57+09:00",
        //             "block_elapsed_minutes": 2,
        //             "net_type": "BTC",
        //             "network_name": "Bitcoin"
        //         },
        //     ]
        //
        return response;
    }

    /**
     * @method
     * @name bithumb#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%B6%9C%EA%B8%88-%EC%A1%B0%ED%9A%8C
     * @param {string} id withdrawal id
     * @param {string} [code] the currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.txid] the transaction id for the withdrawal
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawal (id: string, code: Str = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchWithdrawal', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' fetchWithdrawal() is only supported for the generation 2 API');
        }
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawal() requires a code argument');
        }
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        if (id !== undefined) {
            request['uuid'] = id;
        }
        const response = await this.privateGetV1Withdraw (this.extend (request, params));
        //
        //     {
        //         "type": "withdraw",
        //         "uuid": "200377211",
        //         "currency": "BTC",
        //         "net_type": "BTC",
        //         "state": "processing",
        //         "created_at": "2024-07-14T14:54:24+09:00",
        //         "done_at": null,
        //         "amount": "0.00010000",
        //         "fee": "0",
        //         "transaction_type": null,
        //         "txid": null
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    /**
     * @method
     * @name bithumb#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://apidocs.bithumb.com/reference/%EC%B6%9C%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%B6%9C%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {int} [params.page] the number of pages to return, default is 1
     * @param {string} [params.state] the withdrawal state, either PROCESSING, DONE or CANCELLED
     * @param {string} [params.order_by] either asc or desc, desc is the default
     * @param {string[]} [params.uuids] an array of uuid strings
     * @param {string[]} [params.txids] an array of txid strings
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchWithdrawals', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' fetchWithdrawals() is only supported for the generation 2 API');
        }
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let currency: Currency = undefined;
        if (code === 'KRW') {
            currency = this.currency (code);
            response = await this.privateGetV1WithdrawsKrw (this.extend (request, params));
        } else {
            if (code !== undefined) {
                currency = this.currency (code);
                request['currency'] = currency['id'];
            }
            response = await this.privateGetV1Withdraws (this.extend (request, params));
        }
        //
        //     [
        //         {
        //             "type": "withdraw",
        //             "uuid": "200377211",
        //             "currency": "BTC",
        //             "net_type": "BTC",
        //             "state": "processing",
        //             "created_at": "2024-07-14T14:54:24+09:00",
        //             "done_at": null,
        //             "amount": "0.00010000",
        //             "fee": "0",
        //             "transaction_type": null,
        //             "txid": null
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    /**
     * @method
     * @name bithumb#fetchDeposit
     * @description fetch information on a deposit
     * @see https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%9E%85%EA%B8%88-%EC%A1%B0%ED%9A%8C
     * @param {string} id deposit id
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.txid] the transaction id for the deposit
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposit (id: string, code: Str = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchDeposit', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' fetchDeposit() is only supported for the generation 2 API');
        }
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposit() requires a code argument');
        }
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        if (id !== undefined) {
            request['uuid'] = id;
        }
        const response = await this.privateGetV1Deposit (this.extend (request, params));
        //
        //     {
        //         "type": "deposit",
        //         "uuid": "200377211",
        //         "currency": "BTC",
        //         "net_type": "BTC",
        //         "state": "DEPOSIT_ACCEPTED",
        //         "created_at": "2024-07-14T14:54:24+09:00",
        //         "done_at": null,
        //         "amount": "0.00010000",
        //         "fee": "0",
        //         "transaction_type": null,
        //         "txid": null
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    /**
     * @method
     * @name bithumb#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://apidocs.bithumb.com/reference/%EC%9E%85%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%9E%85%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {int} [params.page] the number of pages to return, default is 1
     * @param {string} [params.state] the deposit state, for KRW, PROCESSING, ACCEPTED or CANCELLED, for others, DEPOSIT_PROCESSING, DEPOSIT_ACCEPTED, DEPOSIT_CANCELLED
     * @param {string} [params.order_by] either asc or desc, desc is the default
     * @param {string[]} [params.uuids] an array of uuid strings
     * @param {string[]} [params.txids] an array of txid strings
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchDeposits', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' fetchDeposits() is only supported for the generation 2 API');
        }
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let currency: Currency = undefined;
        if (code === 'KRW') {
            currency = this.currency (code);
            response = await this.privateGetV1DepositsKrw (this.extend (request, params));
        } else {
            if (code !== undefined) {
                currency = this.currency (code);
                request['currency'] = currency['id'];
            }
            response = await this.privateGetV1Deposits (this.extend (request, params));
        }
        //
        //     [
        //         {
        //             "type": "deposit",
        //             "uuid": "200377211",
        //             "currency": "BTC",
        //             "net_type": "BTC",
        //             "state": "DEPOSIT_ACCEPTED",
        //             "created_at": "2024-07-14T14:54:24+09:00",
        //             "done_at": null,
        //             "amount": "0.00010000",
        //             "fee": "0",
        //             "transaction_type": null,
        //             "txid": null
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    /**
     * @method
     * @name bithumb#createDepositAddress
     * @description create a currency deposit address
     * @see https://apidocs.bithumb.com/reference/%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%83%9D%EC%84%B1-%EC%9A%94%EC%B2%AD
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {string} [params.network] the blockchain network to create a deposit address on
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async createDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'createDepositAddress', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' createDepositAddress() is only supported for the generation 2 API');
        }
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        const network = this.safeString2 (params, 'network', 'net_type');
        params = this.omit (params, 'network');
        if (network === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + code + ' createDepositAddress() requires a network parameter');
        }
        request['net_type'] = network;
        const response = await this.privatePostV1DepositsGenerateCoinAddress (this.extend (request, params));
        //
        //     {
        //         "currency": "BTC",
        //         "net_type": "BTC",
        //         "deposit_address": "195Y...rbJ3",
        //         "secondary_address": null
        //     }
        //
        return this.parseDepositAddress (response, currency);
    }

    /**
     * @method
     * @name bithumb#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%A1%B0%ED%9A%8C
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {string} [params.network] network for fetch deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchDepositAddress', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' fetchDepositAddress() is only supported for the generation 2 API');
        }
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        const network = this.safeString2 (params, 'network', 'net_type');
        params = this.omit (params, 'network');
        if (network === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + code + ' fetchDepositAddress() requires a network parameter');
        }
        request['net_type'] = network;
        const response = await this.privateGetV1DepositsCoinAddress (this.extend (request, params));
        //
        //     {
        //         "currency": "BTC",
        //         "net_type": "BTC",
        //         "deposit_address": "195Y...rbJ3",
        //         "secondary_address": null
        //     }
        //
        return this.parseDepositAddress (response, currency);
    }

    /**
     * @method
     * @name bithumb#fetchDepositAddresses
     * @description fetch deposit addresses for multiple currencies (when available)
     * @see https://apidocs.bithumb.com/reference/%EC%A0%84%EC%B2%B4-%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%A1%B0%ED%9A%8C
     * @param {string[]} [codes] list of unified currency codes, default is undefined (all currencies)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by currency code
     */
    async fetchDepositAddresses (codes: Strings = undefined, params = {}): Promise<DepositAddress[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'fetchDepositAddresses', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' fetchDepositAddresses() is only supported for the generation 2 API');
        }
        const response = await this.privateGetV1DepositsCoinAddresses (params);
        //
        //     [
        //         {
        //             "currency": "BTC",
        //             "net_type": "BTC",
        //             "deposit_address": "195Y...rbJ3",
        //             "secondary_address": null
        //         }
        //     ]
        //
        return this.parseDepositAddresses (response, codes, true, {});
    }

    parseDepositAddress (response, currency: Currency = undefined): DepositAddress {
        //
        // generation 2: createDepositAddress, fetchDepositAddress, fetchDepositAddresses
        //
        //     {
        //         "currency": "BTC",
        //         "net_type": "BTC",
        //         "deposit_address": "195Y...rbJ3",
        //         "secondary_address": null
        //     }
        //
        const currencyId = this.safeString (response, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (response, 'deposit_address');
        this.checkAddress (address);
        return {
            'info': response,
            'currency': code,
            'network': this.safeString (response, 'net_type'),
            'address': address,
            'tag': this.safeString (response, 'secondary_address'),
        } as DepositAddress;
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

    urlencodeWithArrayBrackets (query: Dict) {
        const keys = Object.keys (query);
        let result = '';
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = query[key];
            if (Array.isArray (value)) {
                const encodedKey = this.encodeURIComponent (key) + '[]';
                for (let j = 0; j < value.length; j++) {
                    const item = value[j];
                    let valueString = this.safeString (value, j);
                    if (valueString === undefined) {
                        valueString = this.json (item);
                    }
                    if (result.length > 0) {
                        result += '&';
                    }
                    result += encodedKey + '=' + this.encodeURIComponent (valueString);
                }
            } else {
                if (result.length > 0) {
                    result += '&';
                }
                const encodedKey = this.encodeURIComponent (key);
                const valueString = this.safeString (query, key);
                const encodedValue = this.encodeURIComponent (valueString);
                result += encodedKey + '=' + encodedValue;
            }
        }
        return result;
    }

    sign (path, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][api]) + endpoint;
        const query = this.omit (params, this.extractParams (path));
        const queryKeys = Object.keys (query);
        const queryKeysLength = queryKeys.length;
        const hasQuery = (queryKeysLength > 0);
        if (api === 'public') {
            if (hasQuery) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const isVersionedApi = (endpoint.startsWith ('/v1/') || endpoint.startsWith ('/v2/'));
            if (isVersionedApi) {
                headers = {
                    'Accept': 'application/json',
                };
                const request: Dict = {
                    'access_key': this.apiKey,
                    'nonce': this.uuid (),
                    'timestamp': this.milliseconds (),
                };
                let auth = undefined;
                if ((method !== 'GET') && (method !== 'DELETE')) {
                    headers['Content-Type'] = 'application/json';
                    if (hasQuery) {
                        body = this.json (query);
                        auth = this.urlencodeWithArrayBrackets (query);
                    }
                } else if (hasQuery) {
                    auth = this.urlencodeWithArrayBrackets (query);
                    url += '?' + auth;
                }
                if (hasQuery) {
                    request['query_hash'] = this.hash (this.encode (auth), sha512);
                    request['query_hash_alg'] = 'SHA512';
                }
                const token = jwt (request, this.encode (this.secret), sha256);
                headers['Authorization'] = 'Bearer ' + token;
            } else {
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
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        // generation 2:
        //
        //     {"error":{"name":400,"message":"Missing request parameter error. Check the required parameters!"}}
        //
        const error = this.safeDict (response, 'error');
        if (error !== undefined) {
            const errorName = this.safeString (error, 'name');
            const message = this.safeString (error, 'message');
            const feedback = this.id + ' ' + message;
            if (errorName !== undefined) {
                this.throwExactlyMatchedException (this.exceptions, errorName, feedback);
            }
            if (message !== undefined) {
                this.throwExactlyMatchedException (this.exceptions, message, feedback);
            }
            throw new ExchangeError (feedback);
        }
        if ('status' in response) {
            // generation 1:
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
