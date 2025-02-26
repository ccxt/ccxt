
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coindcx.js';
import { ArgumentsRequired, AuthenticationError, BadSymbol, BadRequest, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, NotSupported, OnMaintenance, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Bool, Dict, IndexType, Int, int, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class coindcx
 * @augments Exchange
 */
export default class coindcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coindcx',
            'name': 'CoinDCX',
            'countries': [ 'IN' ], // India
            'version': 'v1',
            'rateLimit': 30, // 2000 per minute // todo ask about limits for contracts
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': undefined,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
                'ws': false,
            },
            'timeframes': {
                'spot': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '2h': '2h',
                    '4h': '4h',
                    '6h': '6h',
                    '8h': '8h',
                    '1d': '1d',
                    '3d': '3d',
                    '1w': '1w',
                    '1M': '1M',
                },
                'contract': {
                    '1m': '1',
                    '5m': '5',
                    '1h': '60',
                    '1d': '1D',
                },
            },
            'urls': {
                'logo': '', // todo: add a logo
                'api': {
                    'public1': 'https://api.coindcx.com', // base URL for some public endpoint is https://public.coindcx.com. However, it will only be used where it is exclusively mentioned in the documentation.
                    'private': 'https://api.coindcx.com',
                    'public2': 'https://public.coindcx.com',
                },
                'www': 'https://coindcx.com/',
                'doc': [
                    'https://docs.coindcx.com/',
                ],
                'fees': 'https://docs.coindcx.com/#3-fees-and-charges',
            },
            'api': {
                'public1': {
                    'get': {
                        'exchange/ticker': 1, // done
                        'exchange/v1/markets': 1, // not unified
                        'exchange/v1/markets_details': 1, // done
                        'exchange/v1/derivatives/futures/data/active_instruments': 1,
                        'exchange/v1/derivatives/futures/data/instrument': 1,
                        'exchange/v1/derivatives/futures/data/trades': 1, // done
                    },
                },
                'public2': {
                    'get': {
                        'market_data/trade_history': 1, // done
                        'market_data/orderbook': 1, // done
                        'market_data/candles': 1, // done
                        'market_data/v3/orderbook/{pair}-futures/{limit}': 1, // done
                        'market_data/candlesticks': 1, // done
                        'market_data/v3/current_prices/futures/rt': 1, // new
                    },
                },
                'private': {
                    'post': {
                        'exchange/v1/users/balances': 1, // done
                        'exchange/v1/users/info': 1, // not unified
                        'exchange/v1/wallets/sub_account_transfer': 1, // new
                        'exchange/v1/wallets/transfer': 1, // new
                        'exchange/v1/orders/create': 1, // done
                        'exchange/v1/orders/create_multiple': 1, // done
                        'exchange/v1/orders/status': 1, // done
                        'exchange/v1/orders/status_multiple': 1, // done
                        'exchange/v1/orders/active_orders': 6.66, // done
                        'exchange/v1/orders/trade_history': 1, // done
                        'exchange/v1/orders/active_orders_count': 1, // not unified
                        'exchange/v1/orders/cancel_all': 66.66, // done
                        'exchange/v1/orders/cancel_by_ids': 6.66, // done
                        'exchange/v1/orders/cancel': 1, // done
                        'exchange/v1/orders/edit': 1, // done
                        'exchange/v1/funding/fetch_orders': 1,
                        'exchange/v1/funding/lend': 1,
                        'exchange/v1/funding/settle': 1,
                        'exchange/v1/margin/create': 1, // done
                        'exchange/v1/margin/cancel': 1, // done
                        'exchange/v1/margin/exit': 1, // done
                        'exchange/v1/margin/edit_target': 1, // done
                        'exchange/v1/margin/edit_price_of_target_order': 1, // not unified
                        'exchange/v1/margin/edit_sl': 1,
                        'exchange/v1/margin/edit_trailing_sl': 1,
                        'exchange/v1/margin/add_margin': 1, // done
                        'exchange/v1/margin/remove_margin': 1, // done
                        'exchange/v1/margin/fetch_orders': 1, // done
                        'exchange/v1/margin/order': 1, // done
                        'exchange/v1/derivatives/futures/orders': 1, // done
                        'exchange/v1/derivatives/futures/orders/create': 1, // done
                        'exchange/v1/derivatives/futures/orders/cancel': 1, // done
                        'exchange/v1/derivatives/futures/positions': 1, // done
                        'exchange/v1/derivatives/futures/positions/update_leverage': 1, // new
                        'exchange/v1/derivatives/futures/positions/add_margin': 1, // done todo check
                        'exchange/v1/derivatives/futures/positions/remove_margin': 1, // done todo check
                        'exchange/v1/derivatives/futures/positions/cancel_all_open_orders': 1, // done
                        'exchange/v1/derivatives/futures/positions/cancel_all_open_orders_for_position': 1, // done
                        'exchange/v1/derivatives/futures/positions/exit': 1, // done
                        'exchange/v1/derivatives/futures/positions/create_tpsl': 1, // todo check
                        'exchange/v1/derivatives/futures/positions/transactions': 1, // not unified
                        'exchange/v1/derivatives/futures/trades': 1, // done
                        'exchange/v1/derivatives/futures/positions/cross_margin_details': 1, // new
                        'exchange/v1/derivatives/futures/wallets/transfer': 1, // new
                        'exchange/v1/derivatives/futures/wallets': 1, // new
                        'exchange/v1/derivatives/futures/wallets/transactions': 1, // new
                        'exchange/v1/derivatives/futures/orders/edit': 1, // new
                        '/exchange/v1/derivatives/futures/positions/margin_type': 1, // new
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'quote',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0'),
                    'maker': this.parseNumber ('0'),
                },
            },
            'precisionMode': TICK_SIZE,
            // exchange-specific options
            'options': {
                'defaultType': 'spot', // spot, margin or swap
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // {"code":400,"message":"Minimum order value should be 24.0 USDT","status":"error"}
                    '401': AuthenticationError, // {"code":401,"message":"Invalid credentials","status":"error"}
                    '404': ExchangeError, // {"status":"error","message":"not_found","code":404}
                    '422': BadRequest, // {"code":422,"message":"Invalid Request","status":"error"}
                    '429': RateLimitExceeded, // 429 Too Many Requests - You're making too many API calls
                    '500': ExchangeNotAvailable, // 500 Internal Server Error -- We had a problem with our server. Try again later.
                    '503': OnMaintenance, // 503 Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
                },
                'broad': {
                    'Order not found': OrderNotFound, // {"code":404,"message":"Order not found","status":"error"}
                    'Currency pair is not valid': BadSymbol, // {"code":422,"message":"Currency pair is not valid","status":"error"}
                    'Insufficient funds': InsufficientFunds, // {"code":422,"message":"Insufficient funds","status":"error"}
                },
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name coindcx#fetchMarkets
         * @description retrieves data on all markets for coindcx
         * @see https://docs.coindcx.com/#markets-details
         * @see https://docs.coindcx.com/#get-instrument-details
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const responseFromSpot = await this.public1GetExchangeV1MarketsDetails (params);
        //
        //     [
        //         {
        //             "coindcx_name": "ONDOUSDT",
        //             "base_currency_short_name": "USDT",
        //             "target_currency_short_name": "ONDO",
        //             "target_currency_name": "Ondo",
        //             "base_currency_name": "Tether",
        //             "min_quantity": 10.0,
        //             "max_quantity": 10000000000.0,
        //             "max_quantity_market": 10000000000.0,
        //             "min_price": 1.0e-05,
        //             "max_price": 10000000000.0,
        //             "min_notional": 0.1,
        //             "base_currency_precision": 5,
        //             "target_currency_precision": 4,
        //             "step": 0.0001,
        //             "order_types": [
        //                 "market_order",
        //                 "limit_order"
        //             ],
        //             "symbol": "ONDOUSDT",
        //             "ecode": "KC",
        //             "bo_sl_safety_percent": null,
        //             "max_leverage": null,
        //             "max_leverage_short": null,
        //             "pair": "KC-ONDO_USDT",
        //             "status": "active"
        //         }
        //     ]
        //
        const markets = this.toArray (responseFromSpot);
        const request: Dict = {
            'pair': 'B-ETH_USDT',
        };
        const responseFromSwap = await this.public1GetExchangeV1DerivativesFuturesDataInstrument (this.extend (request, params)); // todo using it to fetch and test a contract market
        //
        //     {
        //         "instrument": {
        //             "settle_currency_short_name": "USDT",
        //             "quote_currency_short_name": "USDT",
        //             "position_currency_short_name": "ETH",
        //             "underlying_currency_short_name": "ETH",
        //             "status": "active",
        //             "pair": "B-ETH_USDT",
        //             "kind": "perpetual",
        //             "settlement": "never",
        //             "max_leverage_long": 20.0,
        //             "max_leverage_short": 20.0,
        //             "unit_contract_value": 1.0,
        //             "price_increment": 0.01,
        //             "quantity_increment": 0.001,
        //             "min_trade_size": 0.001,
        //             "min_price": 41.853,
        //             "max_price": 98898.0,
        //             "min_quantity": 0.001,
        //             "max_quantity": 9500.0,
        //             "min_notional": 24.0,
        //             "maker_fee": 0.025,
        //             "taker_fee": 0.075,
        //             "safety_percentage": 1.5,
        //             "quanto_to_settle_multiplier": 1.0,
        //             "is_inverse": false,
        //             "is_quanto": false,
        //             "allow_post_only": false,
        //             "allow_hidden": false,
        //             "max_market_order_quantity": 2000.0,
        //             "funding_frequency": 8,
        //             "max_notional": 20000000.0,
        //             "expiry_time": 2548162800000,
        //             "time_in_force_options": [
        //                 "good_till_cancel",
        //                 "immediate_or_cancel",
        //                 "fill_or_kill"
        //             ],
        //             "order_types": [
        //                 "market_order",
        //                 "limit_order",
        //                 "stop_limit",
        //                 "take_profit_limit",
        //                 "stop_market",
        //                 "take_profit_market"
        //             ]
        //         }
        //     }
        //
        const contractMarket = this.safeDict (responseFromSwap, 'instrument', {});
        markets.push (contractMarket);
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        //
        // spot markets
        //     {
        //         "coindcx_name": "ONDOUSDT",
        //         "base_currency_short_name": "USDT",
        //         "target_currency_short_name": "ONDO",
        //         "target_currency_name": "Ondo",
        //         "base_currency_name": "Tether",
        //         "min_quantity": 10.0,
        //         "max_quantity": 10000000000.0,
        //         "max_quantity_market": 10000000000.0,
        //         "min_price": 1.0e-05,
        //         "max_price": 10000000000.0,
        //         "min_notional": 0.1,
        //         "base_currency_precision": 5,
        //         "target_currency_precision": 4,
        //         "step": 0.0001,
        //         "order_types": [
        //             "market_order",
        //             "limit_order"
        //         ],
        //         "symbol": "ONDOUSDT",
        //         "ecode": "KC",
        //         "bo_sl_safety_percent": null,
        //         "max_leverage": null,
        //         "max_leverage_short": null,
        //         "pair": "KC-ONDO_USDT",
        //         "status": "active"
        //     }
        //
        // contract markets
        //     {
        //         "settle_currency_short_name": "USDT",
        //         "quote_currency_short_name": "USDT",
        //         "position_currency_short_name": "ETH",
        //         "underlying_currency_short_name": "ETH",
        //         "status": "active",
        //         "pair": "B-ETH_USDT",
        //         "kind": "perpetual",
        //         "settlement": "never",
        //         "max_leverage_long": 20.0,
        //         "max_leverage_short": 20.0,
        //         "unit_contract_value": 1.0,
        //         "price_increment": 0.01,
        //         "quantity_increment": 0.001,
        //         "min_trade_size": 0.001,
        //         "min_price": 41.853,
        //         "max_price": 98898.0,
        //         "min_quantity": 0.001,
        //         "max_quantity": 9500.0,
        //         "min_notional": 24.0,
        //         "maker_fee": 0.025,
        //         "taker_fee": 0.075,
        //         "safety_percentage": 1.5,
        //         "quanto_to_settle_multiplier": 1.0,
        //         "is_inverse": false,
        //         "is_quanto": false,
        //         "allow_post_only": false,
        //         "allow_hidden": false,
        //         "max_market_order_quantity": 2000.0,
        //         "funding_frequency": 8,
        //         "max_notional": 20000000.0,
        //         "expiry_time": 2548162800000,
        //         "time_in_force_options": [
        //             "good_till_cancel",
        //             "immediate_or_cancel",
        //             "fill_or_kill"
        //         ],
        //         "order_types": [
        //             "market_order",
        //             "limit_order",
        //             "stop_limit",
        //             "take_profit_limit",
        //             "stop_market",
        //             "take_profit_market"
        //         ]
        //     }
        //
        const marketId = this.safeString2 (market, 'coindcx_name', 'pair');
        const baseId = this.safeString2 (market, 'target_currency_short_name', 'position_currency_short_name');
        const quoteId = this.safeString2 (market, 'base_currency_short_name', 'quote_currency_short_name');
        const settleId = this.safeString (market, 'settle_currency_short_name');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        let isSpot = true;
        if (settleId !== undefined) {
            symbol += ':' + settle;
            isSpot = false;
        }
        let amountPresicionString = this.safeString (market, 'quantity_increment');
        if (amountPresicionString === undefined) {
            amountPresicionString = this.parsePrecision (this.safeString (market, 'target_currency_precision'));
        }
        let pricePresicionString = this.safeString (market, 'price_increment');
        if (pricePresicionString === undefined) {
            pricePresicionString = this.parsePrecision (this.safeString (market, 'base_currency_precision'));
        }
        let isMargin: Bool = undefined;
        let maxLeverage: Num = undefined;
        const maxLeverageString = this.omitZero (this.safeString2 (market, 'max_leverage', 'max_leverage_long'));
        if (maxLeverageString !== undefined) {
            maxLeverage = this.parseNumber (maxLeverageString);
        }
        let type = 'spot' as any;
        let expiry: Int = undefined;
        if (isSpot) {
            if (maxLeverage !== undefined) {
                isMargin = true;
            } else {
                isMargin = false;
            }
        } else {
            const kind = this.safeString (market, 'kind'); // for now every futures market is perpetual
            if (kind === 'perpetual') {
                type = 'swap';
            } else {
                type = 'future';
                expiry = this.safeInteger (market, 'expiry_time');
            }
        }
        const active = this.safeString (market, 'status');
        let isActive = false;
        if (active === 'active') {
            isActive = true;
        }
        const isInverse = this.safeBool (market, 'is_inverse');
        const isLinear = isSpot ? undefined : (!isInverse);
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': isSpot,
            'margin': isMargin,
            'swap': (type === 'swap'),
            'future': (type === 'future'),
            'option': false,
            'active': isActive,
            'contract': (!isSpot),
            'linear': isLinear,
            'inverse': isInverse,
            'contractSize': this.safeNumber (market, 'unit_contract_value'),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'taker': this.safeNumber (market, 'taker_fee', 0), // spot markets have no fees yet
            'maker': this.safeNumber (market, 'maker_fee', 0), // spot markets have no fees yet
            'precision': {
                'amount': this.parseNumber (amountPresicionString),
                'price': this.parseNumber (pricePresicionString),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': maxLeverage,
                },
                'amount': {
                    'min': this.safeNumber (market, 'min_quantity'),
                    'max': this.safeNumber (market, 'max_quantity'),
                },
                'price': {
                    'min': this.safeNumber (market, 'min_price'),
                    'max': this.safeNumber (market, 'max_price'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_notional'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coindcx#fetchTickers
         * @description *for spot markets only* fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.coindcx.com/#ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.public1GetExchangeTicker (params);
        //
        // [
        //     {
        //         "market": "BTCINR",
        //         "change_24_hour": "1.486",
        //         "high": "6199999.0",
        //         "low": "6028180.13",
        //         "volume": "16901590.410328545",
        //         "last_price": "6181299.060000000000",
        //         "bid": "6103600.520000000000",
        //         "ask": "6180699.010000000000",
        //         "timestamp": 1717616755
        //     }
        // ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        //  {
        //      "market": "BTCINR",
        //      "change_24_hour": "1.486",
        //      "high": "6199999.0",
        //      "low": "6028180.13",
        //      "volume": "16901590.410328545",
        //      "last_price": "6181299.060000000000",
        //      "bid": "6103600.520000000000",
        //      "ask": "6180699.010000000000",
        //      "timestamp": 1717616755
        //  }
        //
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'market');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': this.safeString (ticker, 'bid'),
            'ask': undefined,
            'askVolume': this.safeString (ticker, 'ask'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change_24_hour'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coindcx#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.coindcx.com/#candles
         * @see https://docs.coindcx.com/#get-instrument-candlesticks
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch (is mandatory for contract markets)
         * @param {int} [limit] the maximum amount of candles to fetch (default 500, max 1000)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch (is mandatory for contract markets, works only if since is also defined for spot markets)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketInfo = this.safeDict (market, 'info', {});
        const pair = this.safeString (marketInfo, 'pair');
        const request: Dict = {
            'pair': pair,
        };
        if (market['spot']) {
            const timeframes = this.safeDict (this.timeframes, 'spot');
            request['interval'] = this.safeString (timeframes, timeframe, timeframe);
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            const until = this.safeInteger (params, 'until');
            if (until !== undefined) {
                request['endTime'] = until;
                params = this.omit (params, 'until');
            }
            const response = await this.public2GetMarketDataCandles (this.extend (request, params));
            //
            //     [
            //         {
            //             "open":70938.55,
            //             "high":70938.55,
            //             "low":70926.27,
            //             "volume":7.60989,
            //             "close":70931.98,
            //             "time":1717692120000
            //         }
            //     ]
            //
            return this.parseOHLCVs (response, market, timeframe, since, limit);
        } else if (market['swap']) {
            const timeframes = this.safeDict (this.timeframes, 'contract');
            request['resolution'] = this.safeString (timeframes, timeframe, timeframe);
            const until = this.safeString (params, 'until');
            if ((since === undefined) || (until === undefined)) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV requires both since and params.until arguments for ' + market['type'] + ' markets');
            }
            const sinceString = since.toString ();
            request['from'] = sinceString.slice (0, -3); // the exchange accepts from and to params in seconds
            request['to'] = until.slice (0, -3);
            params = this.omit (params, 'until');
            request['pcode'] = 'f';
            const response = await this.public2GetMarketDataCandlesticks (this.extend (request, params));
            //
            //     {
            //         "s": "ok",
            //         "data": [
            //             {
            //                 "open": 2292.74,
            //                 "high": 2294.27,
            //                 "low": 2291.01,
            //                 "volume": 3523.044,
            //                 "close": 2291.56,
            //                 "time": 1704101100000
            //             }
            //         ]
            //     }
            //
            const data = this.safeList (response, 'data');
            return this.parseOHLCVs (data, market, timeframe, since, limit);
        } else {
            throw new NotSupported (this.id + ' fetchOHLCV() does not supports ' + market['type'] + ' markets');
        }
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coindcx#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.coindcx.com/#order-book
         * @see https://docs.coindcx.com/#get-instrument-orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] *for contract markets only* the maximum amount of order book entries to return (10, 20 or 50)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketInfo = this.safeDict (market, 'info', {});
        const pair = this.safeString (marketInfo, 'pair');
        const request: Dict = {
            'pair': pair,
        };
        let response: Dict = undefined;
        if (market['spot']) {
            response = await this.public2GetMarketDataOrderbook (this.extend (request, params));
            //
            //     {
            //         "timestamp": 1717694482206,
            //         "asks":
            //         {
            //             "71198.00": "7.630",
            //             "71198.10": "0.116",
            //             "71198.40": "0.069",
            //             "71198.50": "0.056",
            //             "71198.70": "0.046",
            //             "71198.80": "0.258",
            //             "71198.90": "0.095",
            //             "71199.00": "0.324",
            //             ...
            //         },
            //         "bids":
            //         {
            //             "71197.90": "8.563",
            //             "71197.80": "0.011",
            //             "71196.80": "0.561",
            //             "71196.70": "0.892",
            //             "71196.60": "0.019",
            //             "71196.30": "0.100",
            //             "71196.10": "0.007",
            //             "71196.00": "0.002",
            //             ...
            //         }
            //     }
            //
        } else if (market['swap']) {
            let depth = 50;
            if (limit !== undefined) {
                if (limit <= 10) {
                    depth = 10;
                } else if (limit <= 20) {
                    depth = 20;
                }
            }
            request['limit'] = depth;
            response = await this.public2GetMarketDataV3OrderbookPairFuturesLimit (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchOrderBook() does not supports ' + market['type'] + ' markets');
        }
        const timestamp = this.safeInteger2 (response, 'timestamp', 'ts');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    parseBidsAsks (bidasks, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        const prices = Object.keys (bidasks);
        const result = [];
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            const amount = bidasks[price];
            result.push ([ this.parseNumber (price), this.parseNumber (amount) ]);
        }
        return result;
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coindcx#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.coindcx.com/#trades
         * @see https://docs.coindcx.com/#get-instrument-real-time-trade-history
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch (default 30, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketInfo = this.safeDict (market, 'info', {});
        const pair = this.safeString (marketInfo, 'pair');
        const request: Dict = {
            'pair': pair,
        };
        let response = undefined;
        if (market['spot']) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.public2GetMarketDataTradeHistory (this.extend (request, params));
            //
            //     [
            //         {
            //             "p": 0.00000153,
            //             "q": 10971,
            //             "s": "SNTBTC",
            //             "T": 1663742387385,
            //             "m": true
            //         }
            //     ]
            //
        } else if (market['swap']) {
            response = await this.public1GetExchangeV1DerivativesFuturesDataTrades (this.extend (request, params));
            //
            //     [
            //         {
            //             "price": 3412.14,
            //             "quantity": 7.401,
            //             "timestamp": 1719345760928.0,
            //             "is_maker": true
            //         }
            //     ]
            //
        } else {
            throw new NotSupported (this.id + ' fetchTrades() does not supports ' + market['type'] + ' markets');
        }
        return this.parseTrades (response, market, since, limit);
    }

    handleMarketTypeMarginAndParams (methodName: string, market: Market = undefined, params = {}, defaultValue = undefined): any {
        let marketType = defaultValue;
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params, defaultValue);
        let isMargin = false;
        [ isMargin, params ] = this.handleOptionAndParams (params, methodName, 'margin', isMargin);
        if ((isMargin) && (marketType === 'spot')) {
            marketType = 'margin';
        }
        return [ marketType, params ];
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.coindcx.com/#account-trade-history
         * @see https://docs.coindcx.com/#get-trades
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum amount of trades to fetch (default 500, max 5000)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'margin' or 'swap'
         * @param {bool} [params.margin] *for spot markets only* true for creating a margin order
         * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
         * @param {int} [params.from_id] trade ID after which you want the data. If not supplied, trades in ascending order will be returned
         * @param {string} [params.order_id] *for swap markets only* a unique id for the order
         * @param {string} [params.sort] asc or desc to get trades in ascending or descending order, default: asc
         * @param {int} [params.page] *for swap markets only* no of pages needed
         * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
         */
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchMyTrades', market, params, marketType);
        let response = undefined;
        const request: Dict = {};
        if (marketType === 'spot') {
            if (symbol !== undefined) {
                request['symbol'] = market['id'];
            }
            if (since !== undefined) {
                request['from_timestamp'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            const until = this.safeInteger (params, 'until');
            if (until !== undefined) {
                request['to_timestamp'] = until;
                params = this.omit (params, 'until');
            }
            response = await this.privatePostExchangeV1OrdersTradeHistory (this.extend (request, params));
            //
            //     [
            //         {
            //             "id": 113754608,
            //             "order_id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
            //             "side": "buy",
            //             "fee_amount": "0.00000000000000",
            //             "ecode": "B",
            //             "quantity": "0.00010000000000",
            //             "price": "65483.14000000000000",
            //             "symbol": "BTCUSDT",
            //             "timestamp": 1718386312255.3608
            //         }
            //     ]
            //
        } else if (marketType === 'margin') {
            throw new NotSupported (this.id + ' fetchMyTrades() does not supports ' + marketType + ' markets');
        } else if (marketType === 'swap') {
            if (market !== undefined) {
                request['pair'] = market['id'];
            }
            if (since !== undefined) {
                const datetime = this.iso8601 (since);
                const datetimeParts = datetime.split ('T');
                request['from_date'] = datetimeParts[0];
            }
            if (limit !== undefined) {
                request['size'] = limit;
            }
            const until = this.safeInteger (params, 'until');
            if (until !== undefined) {
                const datetime = this.iso8601 (until);
                const datetimeParts = datetime.split ('T');
                request['to_date'] = datetimeParts[0];
                params = this.omit (params, 'until');
            }
            response = await this.privatePostExchangeV1DerivativesFuturesTrades (this.extend (request, params));
            //
            //     [
            //         {
            //             "price": 3369.03,
            //             "quantity": 0.01,
            //             "is_maker": false,
            //             "fee_amount": 0.025267725,
            //             "pair": "B-ETH_USDT",
            //             "side": "sell",
            //             "timestamp": 1719472930332.058,
            //             "order_id": "f467934a-3455-11ef-850c-bf95c3d2646c"
            //         }
            //     ]
            //
        } else {
            throw new NotSupported (this.id + ' fetchMyTrades() does not supports ' + marketType + ' markets');
        }
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // fetchTrades spot
        //
        //     {
        //         "p": 0.00000153,
        //         "q": 10971,
        //         "s": "SNTBTC",
        //         "T": 1663742387385,
        //         "m": true
        //     }
        //
        // fetchTrades swap
        //     {
        //         "price": 3412.14,
        //         "quantity": 7.401,
        //         "timestamp": 1719345760928.0,
        //         "is_maker": true
        //     }
        //
        // private fetchMyTrades
        //
        //     {
        //         "id": 113754608,
        //         "order_id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
        //         "side": "buy",
        //         "fee_amount": "0.00000000000000",
        //         "ecode": "B",
        //         "quantity": "0.00010000000000",
        //         "price": "65483.14000000000000",
        //         "symbol": "BTCUSDT",
        //         "timestamp": 1718386312255.3608
        //     }
        //
        // fetchMyTrades swap
        //
        //     {
        //         "price": 3369.03,
        //         "quantity": 0.01,
        //         "is_maker": false,
        //         "fee_amount": 0.025267725,
        //         "pair": "B-ETH_USDT",
        //         "side": "sell",
        //         "timestamp": 1719472930332.058,
        //         "order_id": "f467934a-3455-11ef-850c-bf95c3d2646c"
        //     }
        //
        const marketId = this.safeStringN (trade, [ 's', 'symbol', 'pair' ]);
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestampString = this.safeString2 (trade, 'timestamp', 'T');
        const parts = timestampString.split ('.');
        const timestamp = this.parseToInt (this.safeString (parts, 0));
        const isMaker = this.safeBool2 (trade, 'm', 'is_maker');
        let takerOrMaker: Str = undefined;
        if (isMaker) {
            takerOrMaker = 'maker';
        } else if (isMaker !== undefined) {
            takerOrMaker = 'taker';
        }
        const fee = {
            'cost': this.safeString (trade, 'fee_amount'),
            'currency': undefined,
        };
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': this.safeString (trade, 'order_id'),
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': takerOrMaker,
            'price': this.safeString2 (trade, 'p', 'price'),
            'amount': this.safeString2 (trade, 'q', 'quantity'),
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name coindcx#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.coindcx.com/#get-balances
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostExchangeV1UsersBalances (params);
        //
        //     [
        //         {
        //             "balance": "80.0",
        //             "locked_balance": "0.0",
        //             "currency": "USDT"
        //         },
        //         {
        //             "balance": "0.0",
        //             "locked_balance": "0.0",
        //             "currency":"XRP"
        //         }
        //     ]
        //
        return this.parseBalance (response);
    }

    parseBalance (balances): Balances {
        const result: Dict = {
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balanceEntry = this.safeDict (balances, i, {});
            const currencyId = this.safeString (balanceEntry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balanceEntry, 'balance');
            account['used'] = this.safeString (balanceEntry, 'locked_balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name coindcx#createOrder
         * @description create a trade order
         * @see https://docs.coindcx.com/#new-order
         * @see https://docs.coindcx.com/#place-order
         * @see https://docs.coindcx.com/#create-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit', 'stop_limit', 'take_profit', 'stop_market', 'take_profit_limit', 'take_profit_market'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'margin' or 'swap'
         * @param {bool} [params.margin] *for spot markets only* true for creating a margin order
         * @param {string} [params.clientOrderId] *for spot markets without margin only* a unique id for the order
         * @param {float} [params.triggerPrice] *for spot margin markets only* triggerPrice at which the attached take profit / stop loss order will be triggered
         * @param {float} [params.stopLossPrice] *for spot margin markets only* stop loss trigger price
         * @param {float} [params.takeProfitPrice] *for spot margin markets only* take profit trigger price
         * @param {int} [params.leverage] *for contract and spot margin markets only* the rate of leverage
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('createOrder', market, params, marketType);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if ((clientOrderId !== undefined) && (marketType !== 'spot')) {
            throw new NotSupported (this.id + ' createOrder() supports params.clientOrderId for spot markets without margin only');
        }
        if (marketType === 'spot') {
            type = this.encodeSpotOrderType (type);
            if (type === undefined) {
                throw new NotSupported (this.id + ' createOrder() does not supports ' + type + ' type of orders for spot markets without margin (market and limit types are supported only)');
            }
            return this.createSpotOrder (symbol, type, side, amount, price, params);
        } else if (marketType === 'margin') {
            type = this.encodeMarginOrderType (type);
            if (type === undefined) {
                throw new NotSupported (this.id + ' createOrder() does not supports ' + type + ' type of orders for spot margin markets (market, limit, stop_limit, take_profit and take_profit_limit types are supported only)');
            }
            return this.createMarginOrder (symbol, type, side, amount, price, params);
        } else if (marketType === 'swap') {
            type = this.encodeContractOrderType (type);
            if (type === undefined) {
                throw new NotSupported (this.id + ' createOrder() does not supports ' + type + ' type of orders for contract markets (market, limit, stop_limit, stop_market, take_profit_limit and take_profit_market types are supported only)');
            }
            return this.createContractOrder (symbol, type, side, amount, price, params);
        } else {
            throw new NotSupported (this.id + ' createOrder() does not supports ' + marketType + ' markets');
        }
    }

    async createSpotOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] a unique id for the order
         */
        const market = this.market (symbol);
        const request: Dict = this.createSpotOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.privatePostExchangeV1OrdersCreate (request);
        //
        //     {
        //         "orders": [
        //             {
        //                 "id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
        //                 "client_order_id": null,
        //                 "order_type": "market_order",
        //                 "side": "buy",
        //                 "status": "open",
        //                 "fee_amount": 0.0,
        //                 "fee": 0.0,
        //                 "maker_fee": 0.0,
        //                 "taker_fee": 0.0,
        //                 "total_quantity": 0.0001,
        //                 "remaining_quantity": 0.0001,
        //                 "source": "web",
        //                 "base_currency_name": null,
        //                 "target_currency_name": null,
        //                 "base_currency_short_name": null,
        //                 "target_currency_short_name": null,
        //                 "base_currency_precision": null,
        //                 "target_currency_precision": null,
        //                 "avg_price": 0.0,
        //                 "price_per_unit": 65483.14,
        //                 "stop_price": 0.0,
        //                 "market": "BTCUSDT",
        //                 "time_in_force": "good_till_cancel",
        //                 "created_at": 1718386312000,
        //                 "updated_at": 1718386312000,
        //                 "trades": null
        //             }
        //         ]
        //     }
        //
        const orders = this.safeList (response, 'orders', []);
        const order = this.safeDict (orders, 0, {});
        return this.parseOrder (order, market);
    }

    createSpotOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] a unique id for the order
         * @param {bool} [params.multiple] true for creating a request for createOrders()
         */
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'order_type': type,
            'side': side,
            'total_quantity': this.amountToPrecision (symbol, amount),
        };
        if (price !== undefined) {
            request['price_per_unit'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        const isMultiple = this.safeBool (params, 'multiple');
        params = this.omit (params, 'multiple');
        if (isMultiple) {
            request['ecode'] = 'I';
        }
        return this.extend (request, params);
    }

    async createMarginOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit', 'stop_limit', 'take_profit', 'take_profit_limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.leverage] the rate of leverage
         * @param {float} [params.triggerPrice] triggerPrice at which the attached take profit / stop loss order will be triggered
         * @param {float} [params.stopLossPrice] stop loss trigger price
         * @param {float} [params.takeProfitPrice] take profit trigger price
         */
        const market = this.market (symbol);
        const marketInfo = this.safeDict (market, 'info', {});
        const request: Dict = {
            'market': market['id'],
            'order_type': type,
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
            'ecode': this.safeString (marketInfo, 'ecode'),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const isStopLoss = (this.safeString (params, 'stopLossPrice') !== undefined);
        const isTakeProfit = (this.safeString (params, 'takeProfitPrice') !== undefined);
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        if (triggerPrice !== undefined) {
            if (type === 'market_order') {
                throw new NotSupported (this.id + ' createOrder() supports only limit type for takeProfit and stopLoss orders for spot markets with margin');
            }
            request['stop_price'] = this.priceToPrecision (symbol, triggerPrice);
            if (type === 'limit_order') {
                if (isStopLoss) {
                    request['order_type'] = 'stop_limit';
                } else if (isTakeProfit) {
                    request['order_type'] = 'take_profit';
                }
            }
            params = this.omit (params, [ 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        }
        const response = await this.privatePostExchangeV1MarginCreate (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "93c5ecee-2bdb-11ef-8777-0bea7a6ac553",
        //             "side": "buy",
        //             "status": "init",
        //             "market": "ACHUSDT",
        //             "order_type": "market_order",
        //             "base_currency_name": null,
        //             "target_currency_name": null,
        //             "base_currency_short_name": null,
        //             "target_currency_short_name": null,
        //             "base_currency_precision": null,
        //             "target_currency_precision": null,
        //             "trailing_sl": false,
        //             "trail_percent": null,
        //             "avg_entry": 0.0,
        //             "avg_exit": 0.0,
        //             "maker_fee": 0.1,
        //             "taker_fee": 0.1,
        //             "fee": 0.1,
        //             "entry_fee": 0.0,
        //             "exit_fee": 0.0,
        //             "active_pos": 0.0,
        //             "exit_pos": 0.0,
        //             "total_pos": 0.0,
        //             "quantity": 1.0,
        //             "price": 0.02414,
        //             "sl_price": 0.00483,
        //             "target_price": 0.0,
        //             "stop_price": 0.0,
        //             "pnl": 0.0,
        //             "initial_margin": 0.02418828,
        //             "interest": 0.0667,
        //             "interest_amount": 0.0,
        //             "interest_amount_updated_at": 0,
        //             "interest_free_hours": 1.0,
        //             "leverage": 1.0,
        //             "result": null,
        //             "tds_amount": null,
        //             "margin_tds_records": [],
        //             "created_at": 1718540754877,
        //             "updated_at": 1718540754877,
        //             "orders": [
        //                 {
        //                     "id": 104430986,
        //                     "order_type": "market_order",
        //                     "status": "initial",
        //                     "market": "ACHUSDT",
        //                     "side": "buy",
        //                     "avg_price": 0.0,
        //                     "total_quantity": 1.0,
        //                     "remaining_quantity": 1.0,
        //                     "price_per_unit": 0.0,
        //                     "timestamp": 1718540754920.9573,
        //                     "maker_fee": 0.1,
        //                     "taker_fee": 0.1,
        //                     "fee": 0.1,
        //                     "fee_amount": 0.0,
        //                     "filled_quantity": 0.0,
        //                     "bo_stage": "stage_entry",
        //                     "cancelled_quantity": 0.0,
        //                     "stop_price": 0.0
        //                 }
        //             ]
        //         }
        //     ]
        //
        const position = this.safeDict (response, 0, {});
        const orders = this.safeList (position, 'orders', []);
        const order = this.safeDict (orders, 0, {});
        const parsedOrder = this.parseOrder (order, market);
        const id = this.safeString (position, 'id'); // using id of the position as id of the order for user could fetch or cancel it
        if (id !== undefined) {
            parsedOrder['id'] = id;
        }
        parsedOrder['info'] = position;
        return parsedOrder;
    }

    async createContractOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit', 'stop_market', 'stop_limit', 'take_profit_market', 'take_profit_limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.leverage] the rate of leverage
         * @param {float} [params.triggerPrice] triggerPrice at which the attached take profit / stop loss order will be triggered
         * @param {float} [params.stopLossPrice] stop loss trigger price
         * @param {float} [params.takeProfitPrice] take profit trigger price
         * @param {string} [params.timeInForce] *for limit orders only* 'GTC', 'IOC', 'FOK', or 'PO' - 'PO' is not supported at the moment
         * @param {bool} [params.postOnly] true or false - not supported at the moment
         * @param {string} [params.notification] no_notification or email_notification - set as email_notification to receive an email once the order is filled
         * @param {bool} [params.hidden] not supported at the moment
         */
        const market = this.market (symbol);
        const orderRequest: Dict = {
            'pair': market['id'],
            'order_type': type,
            'side': side,
            'total_quantity': this.amountToPrecision (symbol, amount),
        };
        if (price !== undefined) {
            orderRequest['price'] = this.priceToPrecision (symbol, price);
        }
        let postOnly = false;
        const exchangeSpecificPostOnlyOption = this.safeBool (params, 'post_only');
        const isMarketOrder = type === 'market';
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, exchangeSpecificPostOnlyOption, params);
        if (postOnly) {
            orderRequest['post_only'] = true;
        }
        const timeInForce = this.safeString (params, 'timeInForce');
        if (timeInForce !== undefined) {
            orderRequest['time_in_force'] = this.encodeTimeInForce (timeInForce);
            params = this.omit (params, 'timeInForce');
        }
        const isStopLoss = (this.safeString (params, 'stopLossPrice') !== undefined);
        const isTakeProfit = (this.safeString (params, 'takeProfitPrice') !== undefined);
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        if (triggerPrice !== undefined) {
            orderRequest['stop_price'] = this.priceToPrecision (symbol, triggerPrice);
            if (type === 'limit_order') {
                if (isStopLoss) {
                    orderRequest['order_type'] = 'stop_limit';
                } else if (isTakeProfit) {
                    orderRequest['order_type'] = 'take_profit_limit';
                }
            } else if (type === 'market_order') {
                if (isStopLoss) {
                    orderRequest['order_type'] = 'stop_market';
                } else if (isTakeProfit) {
                    orderRequest['order_type'] = 'take_profit_market';
                }
            }
            params = this.omit (params, [ 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        }
        const request: Dict = {
            'order': this.extend (orderRequest, params),
        };
        const response = await this.privatePostExchangeV1DerivativesFuturesOrdersCreate (request);
        //
        //     [
        //         {
        //             "id": "091da8ec-3c3a-11ef-ae30-eff9d9f1239c",
        //             "pair": "B-ETH_USDT",
        //             "side": "buy",
        //             "status": "initial",
        //             "order_type": "limit_order",
        //             "stop_trigger_instruction": "last_price",
        //             "notification": "no_notification",
        //             "leverage": 1.0,
        //             "maker_fee": 0.025,
        //             "taker_fee": 0.075,
        //             "fee_amount": 0.0,
        //             "price": 3000.0,
        //             "stop_price": 0.0,
        //             "avg_price": 0.0,
        //             "total_quantity": 0.01,
        //             "remaining_quantity": 0.01,
        //             "cancelled_quantity": 0.0,
        //             "ideal_margin": 30.045,
        //             "order_category": null,
        //             "stage": "default",
        //             "group_id": null,
        //             "display_message": null,
        //             "group_status": null,
        //             "created_at": 1720340542955,
        //             "updated_at": 1720340542955
        //         }
        //     ]
        //
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    encodeSpotOrderType (type) {
        const types = {
            'market': 'market_order',
            'limit': 'limit_order',
            'market_order': 'market_order',
            'limit_order': 'limit_order',
        };
        return this.safeString (types, type, undefined);
    }

    encodeMarginOrderType (type) {
        const types = {
            'market': 'market_order',
            'limit': 'limit_order',
            'market_order': 'market_order',
            'limit_order': 'limit_order',
            'stop_limit': 'stop_limit',
            'take_profit': 'take_profit',
            'take_profit_limit': 'take_profit',
        };
        return this.safeString (types, type, undefined);
    }

    encodeContractOrderType (type) {
        const types = {
            'market': 'market_order',
            'limit': 'limit_order',
            'market_order': 'market_order',
            'limit_order': 'limit_order',
            'stop_limit': 'stop_limit',
            'stop_market': 'stop_market',
            'take_profit_limit': 'take_profit_limit',
            'take_profit_market': 'take_profit_market',
        };
        return this.safeString (types, type, undefined);
    }

    encodeTimeInForce (type) {
        const types = {
            'GTC': 'good_till_cancel',
            'IOC': 'immediate_or_cancel',
            'FOK': 'fill_or_kill',
        };
        return this.safeString (types, type, type);
    }

    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coindcx#createOrders
         * @description create a list of trade orders, for spot markets without margin only
         * @see https://docs.coindcx.com/#create-multiple-orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchMyTrades', undefined, params, marketType);
        if (marketType !== 'spot') {
            throw new NotSupported (this.id + ' createOrders is supported for spot markets without margin only');
        }
        const encodedOrders = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const symbol = this.safeString (order, 'symbol');
            let type = this.safeString (order, 'type');
            type = this.encodeSpotOrderType (type);
            const side = this.safeString (order, 'side');
            const amount = this.safeNumber (order, 'amount');
            const price = this.safeNumber (order, 'price');
            let orderParams = this.safeDict (order, 'params');
            const market = this.market (symbol);
            [ marketType, orderParams ] = this.handleMarketTypeMarginAndParams ('createOrders', market, orderParams, 'spot');
            if (marketType !== 'spot') {
                throw new NotSupported (this.id + ' createOrders is supported for spot markets without margin only');
            }
            const requestParams = this.extend (orderParams, { 'multiple': true });
            const encodedOrder = this.createSpotOrderRequest (symbol, type, side, amount, price, requestParams);
            encodedOrders.push (encodedOrder);
        }
        const request: Dict = {
            'orders': encodedOrders,
        };
        const response = await this.privatePostExchangeV1OrdersCreateMultiple (this.extend (request, params));
        //
        //     {
        //         "orders": [
        //             {
        //                 "id": "a00ffbfe-2fcb-11ef-bd96-e742b7985dd8",
        //                 "client_order_id": null,
        //                 "order_type": "market_order",
        //                 "side": "sell",
        //                 "status": "open",
        //                 "fee_amount": 0.0,
        //                 "fee": 5.0,
        //                 "maker_fee": 5.0,
        //                 "taker_fee": 5.0,
        //                 "total_quantity": 10.0,
        //                 "remaining_quantity": 10.0,
        //                 "source": "web",
        //                 "base_currency_name": null,
        //                 "target_currency_name": null,
        //                 "base_currency_short_name": null,
        //                 "target_currency_short_name": null,
        //                 "base_currency_precision": null,
        //                 "target_currency_precision": null,
        //                 "avg_price": 0.0,
        //                 "price_per_unit": 0.0,
        //                 "stop_price": 0.0,
        //                 "market": "USDTINR",
        //                 "time_in_force": "good_till_cancel",
        //                 "created_at": 1718973708000,
        //                 "updated_at": 1718973708000,
        //                 "trades": null
        //             },
        //             {
        //                 "error_message": "Currency pair is not valid"
        //             }
        //         ]
        //     }
        //
        const ordersFromResponse = this.safeList (response, 'orders', []);
        return this.parseOrders (ordersFromResponse);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name coindcx#fetchOrder
         * @see https://docs.coindcx.com/#order-status
         * @see https://docs.coindcx.com/#query-order
         * @description fetches information on an order made by the user
         * @param {string} id a unique id for the order
         * @param {string} [symbol] not used by coindcx fetchOrder (not used by coindcx)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'margin' or 'swap'
         * @param {bool} [params.margin] *for spot markets only* true for fetching a margin order
         * @param {string} [params.clientOrderId] *for spot markets without margin only* the client order id of the order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {};
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchMyTrades', market, params, marketType);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            if (marketType === 'spot') {
                request['client_order_id'] = clientOrderId;
                params = this.omit (params, 'clientOrderId');
            } else {
                throw new NotSupported (this.id + ' fetchOrder() supports params.clientOrderId only for spot markets without margin');
            }
        } else {
            request['id'] = id;
        }
        if (marketType === 'spot') {
            const response = await this.privatePostExchangeV1OrdersStatus (this.extend (request, params));
            //
            //     {
            //         "id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
            //         "client_order_id": null,
            //         "order_type": "market_order",
            //         "side": "buy",
            //         "status": "filled",
            //         "fee_amount": 0.0,
            //         "fee": 0.0,
            //         "maker_fee": 0.0,
            //         "taker_fee": 0.0,
            //         "total_quantity": 0.0001,
            //         "remaining_quantity": 0.0,
            //         "source": "web",
            //         "base_currency_name": null,
            //         "target_currency_name": null,
            //         "base_currency_short_name": null,
            //         "target_currency_short_name": null,
            //         "base_currency_precision": null,
            //         "target_currency_precision": null,
            //         "avg_price": 65483.14,
            //         "price_per_unit": 65483.14,
            //         "stop_price": 0.0,
            //         "market": "BTCUSDT",
            //         "time_in_force": "good_till_cancel",
            //         "created_at": 1718386312000,
            //         "updated_at": 1718386312000,
            //         "trades": null
            //     }
            //
            return this.parseOrder (response);
        } else if (marketType === 'margin') {
            request['details'] = true;
            const response = await this.privatePostExchangeV1MarginOrder (this.extend (request, params));
            //
            //     [
            //         {
            //             "id": "3468752c-2cef-11ef-a18b-2f35285b4b24",
            //             "side": "buy",
            //             "status": "close",
            //             "market": "ETHUSDT",
            //             "order_type": "market_order",
            //             "base_currency_name": null,
            //             "target_currency_name": null,
            //             "base_currency_short_name": null,
            //             "target_currency_short_name": null,
            //             "base_currency_precision": null,
            //             "target_currency_precision": null,
            //             "trailing_sl": false,
            //             "trail_percent": null,
            //             "avg_entry": 3511.66,
            //             "avg_exit": 3517.81,
            //             "maker_fee": 0.1,
            //             "taker_fee": 0.1,
            //             "fee": 0.1,
            //             "entry_fee": 0.01053498,
            //             "exit_fee": 0.01055343,
            //             "active_pos": 0.0,
            //             "exit_pos": 0.003,
            //             "total_pos": 0.003,
            //             "quantity": 0.003,
            //             "price": 3511.66,
            //             "sl_price": 701.62,
            //             "target_price": 0.0,
            //             "stop_price": 0.0,
            //             "pnl": -0.00263841,
            //             "initial_margin": 0.0,
            //             "interest": 0.0667,
            //             "interest_amount": 0.0,
            //             "interest_amount_updated_at": 0,
            //             "interest_free_hours": 1.0,
            //             "leverage": 1.0,
            //             "result": "exit",
            //             "tds_amount": 0.0,
            //             "margin_tds_records": [],
            //             "created_at": 1718659135979,
            //             "updated_at": 1718659527638,
            //             "orders":  [
            //                 {
            //                     "id": 104528027,
            //                     "order_type": "market_order",
            //                     "status": "filled",
            //                     "market": "ETHUSDT",
            //                     "side": "sell",
            //                     "avg_price": 3517.81,
            //                     "total_quantity": 0.003,
            //                     "remaining_quantity": 0.0,
            //                     "price_per_unit": 0.0,
            //                     "timestamp": 1718659527302.5588,
            //                     "maker_fee": 0.1,
            //                     "taker_fee": 0.1,
            //                     "fee": 0.1,
            //                     "fee_amount": 0.01055343,
            //                     "filled_quantity": 0.003,
            //                     "bo_stage": "stage_exit",
            //                     "cancelled_quantity": 0.0,
            //                     "stop_price": null
            //                 },
            //                 {
            //                     "id": 104527960,
            //                     "order_type": "market_order",
            //                     "status": "filled",
            //                     "market": "ETHUSDT",
            //                     "side": "buy",
            //                     "avg_price": 3511.66,
            //                     "total_quantity": 0.003,
            //                     "remaining_quantity": 0.0,
            //                     "price_per_unit": 0.0,
            //                     "timestamp": 1718659136022.4058,
            //                     "maker_fee": 0.1,
            //                     "taker_fee": 0.1,
            //                     "fee": 0.1,
            //                     "fee_amount": 0.01053498,
            //                     "filled_quantity": 0.003,
            //                     "bo_stage": "stage_entry",
            //                     "cancelled_quantity": 0.0,
            //                     "stop_price": 0.0
            //                 }
            //             ]
            //         }
            //     ]
            //
            const position = this.safeDict (response, 0, {});
            let orders = this.safeList (position, 'orders', []);
            orders = this.sortBy (orders, 'timestamp');
            const firstOrder = this.safeDict (orders, 0, {});
            const parsedOrder = this.parseOrder (firstOrder, market);
            const positionId = this.safeString (position, 'id'); // using id of the position as id of the order for user could fetch or cancel it
            if (positionId !== undefined) {
                parsedOrder['id'] = positionId;
            }
            parsedOrder['info'] = position;
            return parsedOrder;
        } else {
            throw new NotSupported (this.id + ' fetchOrder() supports only spot markets');
        }
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coindcx#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://docs.coindcx.com/#active-orders
         * @see https://docs.coindcx.com/#fetch-orders-2
         * @see https://docs.coindcx.com/#list-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] not used by coindxc
         * @param {int} [limit] the maximum number of order structures to retrieve (default 10)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'margin' or 'swap'
         * @param {bool} [params.margin] *for spot markets only* true for fetching margin orders
         * @param {string[]} [params.ids] *for spot markets without margin only* order ids
         * @param {string[]} [params.clientOrderIds] *for spot markets without margin only* client order ids
         * @param {string} [params.status] *for contract markets only* 'open', 'filled' or 'cancelled' - could be one or more statuses, if many they should be separated by comma (i.e. 'open,filled,cancelled')
         * @param {string} [params.side] *for contract markets only* 'buy' or 'sell'
         * @param {string} [params.page] *for contract markets only* number of a required page
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchMyTrades', market, params, marketType);
        const request: Dict = {};
        if (marketType === 'spot') {
            const ids = this.safeList (params, 'ids');
            const clientOrderIds = this.safeList (params, 'clientOrderIds');
            if ((ids === undefined) && (clientOrderIds === undefined)) {
                throw new ArgumentsRequired (this.id + ' fetchOrders requires params.ids or params.clientOrderIds argument for spot markets without margin');
            }
            if (clientOrderIds !== undefined) {
                request['client_order_ids'] = clientOrderIds;
                params = this.omit (params, 'clientOrderIds');
            }
            const response = await this.privatePostExchangeV1OrdersStatusMultiple (this.extend (request, params));
            //
            //     [
            //         {
            //             "id": "91422042-2b53-11ef-be1e-d7a80073e1ba",
            //             "client_order_id": null,
            //             "order_type": "limit_order",
            //             "side": "buy",
            //             "status": "cancelled",
            //             "fee_amount": 0.0,
            //             "fee": 0.0,
            //             "maker_fee": 0.0,
            //             "taker_fee": 0.0,
            //             "total_quantity": 0.0001,
            //             "remaining_quantity": 0.0001,
            //             "source": "web",
            //             "base_currency_name": null,
            //             "target_currency_name": null,
            //             "base_currency_short_name": null,
            //             "target_currency_short_name": null,
            //             "base_currency_precision": null,
            //             "target_currency_precision": null,
            //             "avg_price": 0.0,
            //             "price_per_unit": 59000.0,
            //             "stop_price": 0.0,
            //             "market": "BTCUSDT",
            //             "time_in_force": "good_till_cancel",
            //             "created_at": 1718482339000,
            //             "updated_at": 1718655228000,
            //             "trades": null
            //         }
            //     ]
            //
            return this.parseOrders (response, market, since, limit);
        } else if (marketType === 'margin') {
            request['details'] = true;
            if (market !== undefined) {
                request['market'] = market['id'];
            }
            if (limit !== undefined) {
                request['size'] = limit;
            }
            const response = await this.privatePostExchangeV1MarginFetchOrders (this.extend (request, params));
            //
            //     [
            //         {
            //             "id": "ae077a5e-2cf4-11ef-8851-77a95a586a3a",
            //             "side": "buy",
            //             "status": "close",
            //             "market": "ETHUSDT",
            //             "order_type": "market_order",
            //             "base_currency_name": null,
            //             "target_currency_name": null,
            //             "base_currency_short_name": null,
            //             "target_currency_short_name": null,
            //             "base_currency_precision": null,
            //             "target_currency_precision": null,
            //             "trailing_sl": false,
            //             "trail_percent": null,
            //             "avg_entry": 3525.41,
            //             "avg_exit": 3522.87,
            //             "maker_fee": 0.1,
            //             "taker_fee": 0.1,
            //             "fee": 0.1,
            //             "entry_fee": 0.01057623,
            //             "exit_fee": 0.01056861,
            //             "active_pos": 0.0,
            //             "exit_pos": 0.003,
            //             "total_pos": 0.003,
            //             "quantity": 0.003,
            //             "price": 3525.41,
            //             "sl_price": 704.5,
            //             "target_price": 0.0,
            //             "stop_price": 0.0,
            //             "pnl": -0.02876484,
            //             "initial_margin": 0.0,
            //             "interest": 0.0667,
            //             "interest_amount": 0.0,
            //             "interest_amount_updated_at": 0,
            //             "interest_free_hours": 1.0,
            //             "leverage": 1.0,
            //             "result": "exit",
            //             "tds_amount": 0.0,
            //             "margin_tds_records": [],
            //             "created_at": 1718661487503,
            //             "updated_at": 1718661890487,
            //             "orders": [
            //                 {
            //                     "id": 104528544,
            //                     "order_type": "market_order",
            //                     "status": "filled",
            //                     "market": "ETHUSDT",
            //                     "side": "sell",
            //                     "avg_price": 3522.87,
            //                     "total_quantity": 0.003,
            //                     "remaining_quantity": 0.0,
            //                     "price_per_unit": 0.0,
            //                     "timestamp": 1718661890114.6968,
            //                     "maker_fee": 0.1,
            //                     "taker_fee": 0.1,
            //                     "fee": 0.1,
            //                     "fee_amount": 0.01056861,
            //                     "filled_quantity": 0.003,
            //                     "bo_stage": "stage_exit",
            //                     "cancelled_quantity": 0.0,
            //                     "stop_price": null
            //                 },
            //                 ...
            //             ]
            //         },
            //         ...
            //     ]
            //
            const responseList = this.toArray (response); // convertin type any into any[]
            let result = [];
            for (let i = 0; i < responseList.length; i++) {
                const position = this.safeDict (responseList, i, {});
                const orders = this.safeList (position, 'orders', []);
                const positionId = this.safeString (position, 'id');
                const parsingParams: Dict = {
                    'id': positionId,
                    'info': position,
                };
                const parsedOrders = this.parseOrders (orders, market, since, limit, parsingParams);
                result = this.arrayConcat (result, parsedOrders);
            }
            return this.sortBy (result, 'timestamp');
        } else if (marketType === 'swap') {
            if (limit !== undefined) {
                request['size'] = limit; // should be a string but the exchange accepts an integer as well
            }
            const response = await this.privatePostExchangeV1DerivativesFuturesOrders (this.extend (request, params));
            //
            //     [
            //         {
            //             "id": "f467934a-3455-11ef-850c-bf95c3d2646c",
            //             "pair": "B-ETH_USDT",
            //             "side": "sell",
            //             "status": "filled",
            //             "order_type": "market_order",
            //             "stop_trigger_instruction": "last_price",
            //             "notification": "no_notification",
            //             "leverage": 1.0,
            //             "maker_fee": 0.025,
            //             "taker_fee": 0.075,
            //             "fee_amount": 0.025267725,
            //             "price": 3368.55,
            //             "stop_price": 0.0,
            //             "avg_price": 3369.03,
            //             "total_quantity": 0.01,
            //             "remaining_quantity": 0.0,
            //             "cancelled_quantity": 0.0,
            //             "ideal_margin": 0.0,
            //             "order_category": null,
            //             "stage": "exit",
            //             "group_id": "809359e6B-ETH_USDT1719472924",
            //             "display_message": "ETHUSDT Position exited successfully!",
            //             "group_status": "success",
            //             "created_at": 1719472924881,
            //             "updated_at": 1719472930403
            //         }
            //     ]
            //
            return this.parseOrders (response, market, since, limit);
        } else {
            throw new NotSupported (this.id + ' fetchOrders is not supported for ' + marketType + ' markets');
        }
    }

    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#fetchCanceledOrders
         * @description *for contract markets only* fetches information on multiple canceled orders made by the user
         * @see https://docs.coindcx.com/#list-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] max number of orders to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.page] required page number
         * @param {int} [params.size] number of records needed per page
         * @param {string} [params.side] 'buy' or 'sell'
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol !== undefined) {
            const market = this.market (symbol);
            if (!market['swap']) {
                throw new NotSupported (this.id + ' fetchCanceledOrders() is supported only for swap markets');
            }
        }
        const request: Dict = {
            'status': 'partially_cancelled,cancelled',
            'type': 'swap',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#fetchCanceledAndClosedOrders
         * @description *for contract markets only* fetches information on multiple canceled and closed orders made by the user
         * @see https://docs.coindcx.com/#list-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] max number of orders to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.page] required page number
         * @param {int} [params.size] number of records needed per page
         * @param {string} [params.side] 'buy' or 'sell'
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol !== undefined) {
            const market = this.market (symbol);
            if (!market['swap']) {
                throw new NotSupported (this.id + ' fetchCanceledAndClosedOrders() is supported only for swap markets');
            }
        }
        const request: Dict = {
            'status': 'partially_cancelled,cancelled,filled,partially_filled',
            'type': 'swap',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#fetchCanceledAndClosedOrders
         * @description *for contract markets only* fetches information on multiple closed orders made by the user
         * @see https://docs.coindcx.com/#list-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] max number of orders to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.page] required page number
         * @param {int} [params.size] number of records needed per page
         * @param {string} [params.side] 'buy' or 'sell'
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol !== undefined) {
            const market = this.market (symbol);
            if (!market['swap']) {
                throw new NotSupported (this.id + ' fetchClosedOrders() is supported only for swap markets');
            }
        }
        const request: Dict = {
            'status': 'filled,partially_filled',
            'type': 'swap',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coindcx#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.coindcx.com/#active-orders
         * @see https://docs.coindcx.com/#list-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] not used by coindxc
         * @param {int} [limit] not used by coindxc
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'margin' or 'swap'
         * @param {bool} [params.margin] *for spot markets only* true for fetching a margin orders
         * @param {int} [params.side] toggle between 'buy' or 'sell'
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchOpenOrders', market, params, marketType);
        const request: Dict = {};
        if (marketType === 'spot') {
            if (market === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol param for spot type of markets');
            }
            request['market'] = market['id'];
            const response = await this.privatePostExchangeV1OrdersActiveOrders (this.extend (request, params));
            //
            //     {
            //         "orders": [
            //             {
            //                 "id": "2614a58a-2b29-11ef-8787-833693318846",
            //                 "user_id": "390ec282-4f54-47c2-9cc3-c842a8834b88",
            //                 "fee": 0.0,
            //                 "fee_amount": 0.0,
            //                 "side": "buy",
            //                 "order_type": "limit_order",
            //                 "status": "open",
            //                 "total_quantity": 0.0001,
            //                 "remaining_quantity": 0.0001,
            //                 "price_per_unit": 60000.0,
            //                 "created_at": "2024-06-15T15:08:40.430Z",
            //                 "updated_at": "2024-06-15T15:08:40.430Z",
            //                 "market": "BTCUSDT",
            //                 "market_order_locked": 6.0,
            //                 "avg_price": 0.0,
            //                 "ecode": "B",
            //                 "stop_price": 0.0,
            //                 "notification": "no_notification",
            //                 "source": "web",
            //                 "maker_fee": 0.0,
            //                 "taker_fee": 0.0,
            //                 "time_in_force": "good_till_cancel",
            //                 "locked_spot_balance": true,
            //                 "closed_at": null,
            //                 "client_order_id": null
            //             }
            //         ],
            //         "details": false,
            //         "cp": false,
            //         "cp_hash": {}
            //     }
            //
            const orders = this.safeList (response, 'orders', []);
            return this.parseOrders (orders, market, since, limit);
        } else if (marketType === 'margin') {
            throw new NotSupported (this.id + ' fetchOpenOrders is not supported for spot margin markets');
        } else if (marketType === 'swap') {
            request['status'] = 'open';
            request['type'] = 'swap';
            return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchOpenOrders is not supported for ' + marketType + ' markets');
        }
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#cancelOrder
         * @description cancels an open order
         * @see https://docs.coindcx.com/#cancel
         * @see https://docs.coindcx.com/#cancel-order
         * @see https://docs.coindcx.com/#cancel-order-2
         * @param {string} id order id
         * @param {string} symbol not used by coindcx cancelOrder
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'margin' or 'swap'
         * @param {bool} [params.margin] *for spot markets only* true for fetching a margin orders
         * @param {string} [params.clientOrderId] *for spot markets without margin only* a unique id for the order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchMyTrades', market, params, marketType);
        const request: Dict = {};
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            if (marketType === 'spot') {
                request['client_order_id'] = clientOrderId;
                params = this.omit (params, 'clientOrderId');
            } else {
                throw new NotSupported (this.id + ' cancelOrder() supports params.clientOrderId for spot markets without margin only');
            }
        } else {
            request['id'] = id;
        }
        if (marketType === 'spot') {
            return await this.privatePostExchangeV1OrdersCancel (this.extend (request, params));
            //
            //     {
            //         "message": "success",
            //         "status": 200,
            //         "code": 200
            //     }
            //
        } else if (marketType === 'margin') {
            return await this.privatePostExchangeV1MarginCancel (this.extend (request, params));
            //
            //     {
            //         "message": "Cancellation accepted",
            //         "status": 200,
            //         "code": 200
            //     }
            //
        } else if (marketType === 'swap') {
            return await this.privatePostExchangeV1DerivativesFuturesOrdersCancel (this.extend (request, params));
            //
            //     {
            //         "message": "success",
            //         "status": 200,
            //         "code": 200
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' cancelOrder is not supported for ' + marketType + ' markets');
        }
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#cancelAllOrders
         * @description cancel all open orders
         * @see https://docs.coindcx.com/#cancel-all
         * @see https://docs.coindcx.com/#cancel-all-open-orders
         * @see https://docs.coindcx.com/#cancel-all-open-orders-for-position
         * @param {string} symbol *for spot markets without margin only* unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'margin' or 'swap'
         * @param {bool} [params.margin] *for spot markets only* true for fetching a margin orders
         * @param {int} [params.side] *for spot markets without margin only* toggle between 'buy' or 'sell'
         * @param {string} [params.id] position id - for canceling open orders for specific position
         * @returns {object} response from exchange
         */
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchMyTrades', market, params, marketType);
        if (marketType === 'spot') {
            return await this.privatePostExchangeV1OrdersCancelAll (this.extend (request, params));
            //
            //     {
            //         "message": "success",
            //         "status": 200,
            //         "code": 200
            //     }
            //
        } else if (marketType === 'margin') {
            throw new NotSupported (this.id + ' cancelAllOrders is not supported for spot margin markets');
        } else if (marketType === 'swap') {
            let positionId: Str = undefined;
            [ positionId, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'id');
            if (positionId !== undefined) {
                request['id'] = positionId;
                return await this.privatePostExchangeV1DerivativesFuturesPositionsCancelAllOpenOrdersForPosition (this.extend (request, params));
            } else {
                return await this.privatePostExchangeV1DerivativesFuturesPositionsCancelAllOpenOrders (this.extend (request, params));
                //
                //     {
                //         "message": "success",
                //         "status": 200,
                //         "code": 200
                //     }
                //
            }
        } else {
            throw new NotSupported (this.id + ' cancelAllOrders is not supported for ' + marketType + ' markets');
        }
    }

    async cancelOrders (ids:string[], symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#cancelOrders
         * @description cancel multiple orders
         * @see https://docs.coindcx.com/#cancel-multiple-by-ids
         * @param {string[]} ids order ids
         * @param {string} [symbol] not used by coindcx cancelOrders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string[]} [params.clientOrderIds] client order ids
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchMyTrades', market, params, marketType);
        if (marketType !== 'spot') {
            throw new NotSupported (this.id + ' cancelOrders() supports only spot markets without margin');
        }
        const request: Dict = {};
        const clientOrderIds = this.safeString2 (params, 'clientOrderIds', 'client_order_ids');
        if (clientOrderIds !== undefined) {
            request['client_order_ids'] = clientOrderIds;
            params = this.omit (params, 'clientOrderIds');
        } else {
            request['orderIds'] = ids;
        }
        //
        //     {
        //         "message": "success",
        //         "status": 200,
        //         "code": 200
        //     }
        //
        return await this.privatePostExchangeV1OrdersCancelByIds (this.extend (request, params));
    }

    async editOrder (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#editOrder
         * @description edit a trade order
         * @see https://docs.coindcx.com/#edit-price
         * @see https://docs.coindcx.com/#edit-target
         * @see https://docs.coindcx.com/#edit-price-of-target-order
         * @see https://docs.coindcx.com/#edit-sl-price
         * @see https://docs.coindcx.com/#edit-sl-price-of-trailing-stop-loss
         * @param {string} id order id
         * @param {string} symbol not used by coindcx
         * @param {string} type not used by coindcx
         * @param {string} side not used by coindcx
         * @param {float} amount not used by coindcx
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot', 'margin' or 'swap'
         * @param {bool} [params.margin] *for spot markets only* true for fetching a margin orders
         * @param {string} [params.clientOrderId] *for spot markets without margin only* a unique id for the order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (amount !== undefined) {
            throw new NotSupported (this.id + ' editOrder() does not supports amount argument');
        }
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeMarginAndParams ('fetchMyTrades', market, params, marketType);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if ((clientOrderId !== undefined) && (marketType !== 'spot')) {
            throw new NotSupported (this.id + ' createOrder() supports params.clientOrderId for spot markets without margin only');
        }
        if (marketType === 'spot') {
            return await this.editSpotOrder (id, symbol, type, side, amount, price, params);
        } else if (marketType === 'margin') {
            return await this.editMarginOrder (id, symbol, type, side, amount, price, params);
        } else {
            throw new NotSupported (this.id + ' EditOrder is not supported for ' + marketType + ' markets');
        }
    }

    async editSpotOrder (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#editSpotOrder
         * @description edit a trade order
         * @see https://docs.coindcx.com/#edit-target
         * @see https://docs.coindcx.com/#edit-price-of-target-order
         * @see https://docs.coindcx.com/#edit-sl-price
         * @see https://docs.coindcx.com/#edit-sl-price-of-trailing-stop-loss
         * @param {string} id order id
         * @param {string} symbol not used by coindcx
         * @param {string} type not used by coindcx
         * @param {string} side not used by coindcx
         * @param {float} amount not used by coindcx
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] a unique id for the order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        let market: Market = undefined;
        let priceString = price.toString ();
        if (symbol !== undefined) {
            market = this.market (symbol);
            priceString = this.priceToPrecision (market['symbol'], price);
        }
        const request: Dict = {
            'price_per_unit': priceString,
        };
        if (id !== undefined) {
            request['id'] = id;
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        const response = await this.privatePostExchangeV1OrdersEdit (this.extend (request, params));
        // {"code":422,"message":"Edit order is not available yet for this exchange","status":"error"}
        return this.parseOrder (response);
    }

    async editMarginOrder (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#editSpotOrder
         * @description edit a trade order
         * @see https://docs.coindcx.com/#edit-price
         * @param {string} id order id
         * @param {string} symbol not used by coindcx
         * @param {string} type not used by coindcx
         * @param {string} side not used by coindcx
         * @param {float} amount not used by coindcx
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        let market: Market = undefined;
        let priceString = price.toString ();
        if (symbol !== undefined) {
            market = this.market (symbol);
            priceString = this.priceToPrecision (market['symbol'], price);
        }
        const request: Dict = {
            'id': id,
            'target_price': priceString,
        };
        // todo handle with the SL Price
        const response = this.privatePostExchangeV1MarginEditTarget (this.extend (request, params));
        //
        //     {
        //         "message": "Target price updated",
        //         "status": 200,
        //         "code": 200
        //     }
        //
        return this.parseOrder (response);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // privatePostExchangeV1OrdersCreate
        //     {
        //         "id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
        //         "client_order_id": null,
        //         "order_type": "market_order",
        //         "side": "buy",
        //         "status": "open",
        //         "fee_amount": 0.0,
        //         "fee": 0.0,
        //         "maker_fee": 0.0,
        //         "taker_fee": 0.0,
        //         "total_quantity": 0.0001,
        //         "remaining_quantity": 0.0001,
        //         "source": "web",
        //         "base_currency_name": null,
        //         "target_currency_name": null,
        //         "base_currency_short_name": null,
        //         "target_currency_short_name": null,
        //         "base_currency_precision": null,
        //         "target_currency_precision": null,
        //         "avg_price": 0.0,
        //         "price_per_unit": 65483.14,
        //         "stop_price": 0.0,
        //         "market": "BTCUSDT",
        //         "time_in_force": "good_till_cancel",
        //         "created_at": 1718386312000,
        //         "updated_at": 1718386312000,
        //         "trades": null
        //     }
        //
        // privatePostExchangeV1MarginCreate
        //     {
        //         "id": 104525583,
        //         "order_type": "market_order",
        //         "status": "filled",
        //         "market": "BTCUSDT",
        //         "side": "buy",
        //         "avg_price": 67021.58,
        //         "total_quantity": 0.0001,
        //         "remaining_quantity": 0.0,
        //         "price_per_unit": 0.0,
        //         "timestamp": 1718650490144.9124,
        //         "maker_fee": 0.1,
        //         "taker_fee": 0.1,
        //         "fee": 0.1,
        //         "fee_amount": 0.00670216,
        //         "filled_quantity": 0.0001,
        //         "bo_stage": "stage_entry",
        //         "cancelled_quantity": 0.0,
        //         "stop_price": 0.0
        //     }
        //
        // privatePostExchangeV1DerivativesFuturesOrders
        //     {
        //         "id": "f467934a-3455-11ef-850c-bf95c3d2646c",
        //         "pair": "B-ETH_USDT",
        //         "side": "sell",
        //         "status": "filled",
        //         "order_type": "market_order",
        //         "stop_trigger_instruction": "last_price",
        //         "notification": "no_notification",
        //         "leverage": 1.0,
        //         "maker_fee": 0.025,
        //         "taker_fee": 0.075,
        //         "fee_amount": 0.025267725,
        //         "price": 3368.55,
        //         "stop_price": 0.0,
        //         "avg_price": 3369.03,
        //         "total_quantity": 0.01,
        //         "remaining_quantity": 0.0,
        //         "cancelled_quantity": 0.0,
        //         "ideal_margin": 0.0,
        //         "order_category": null,
        //         "stage": "exit",
        //         "group_id": "809359e6B-ETH_USDT1719472924",
        //         "display_message": "ETHUSDT Position exited successfully!",
        //         "group_status": "success",
        //         "created_at": 1719472924881,
        //         "updated_at": 1719472930403
        //     }
        //
        // privatePostExchangeV1DerivativesFuturesOrdersCreate
        //     {
        //         "id": "091da8ec-3c3a-11ef-ae30-eff9d9f1239c",
        //         "pair": "B-ETH_USDT",
        //         "side": "buy",
        //         "status": "initial",
        //         "order_type": "limit_order",
        //         "stop_trigger_instruction": "last_price",
        //         "notification": "no_notification",
        //         "leverage": 1.0,
        //         "maker_fee": 0.025,
        //         "taker_fee": 0.075,
        //         "fee_amount": 0.0,
        //         "price": 3000.0,
        //         "stop_price": 0.0,
        //         "avg_price": 0.0,
        //         "total_quantity": 0.01,
        //         "remaining_quantity": 0.01,
        //         "cancelled_quantity": 0.0,
        //         "ideal_margin": 30.045,
        //         "order_category": null,
        //         "stage": "default",
        //         "group_id": null,
        //         "display_message": null,
        //         "group_status": null,
        //         "created_at": 1720340542955,
        //         "updated_at": 1720340542955
        //     }
        //
        const marketId = this.safeString2 (order, 'market', 'pair');
        market = this.safeMarket (marketId, market);
        let timestamp = this.safeInteger (order, 'created_at');
        let datetime: Str = undefined;
        if (timestamp === undefined) {
            datetime = this.safeString (order, 'created_at');
            if (datetime !== undefined) {
                timestamp = this.parse8601 (datetime);
            } else {
                const timestampString = this.safeString (order, 'timestamp', '');
                const parts = timestampString.split ('.');
                timestamp = this.parseToInt (this.safeString (parts, 0));
            }
        }
        let lastUpdateTimestamp = this.safeInteger (order, 'updated_at');
        if (lastUpdateTimestamp === undefined) {
            datetime = this.safeString (order, 'updated_at');
            lastUpdateTimestamp = this.parse8601 (datetime);
        }
        const fee = {
            'currency': undefined,
            'cost': this.safeNumber (order, 'fee_amount'),
        };
        const type = this.safeString (order, 'order_type');
        const status = this.safeString (order, 'status');
        const triggerPrice = this.omitZero (this.safeString (order, 'stop_price'));
        let takeProfitPrice: Str = undefined;
        let stopLossPrice: Str = undefined;
        if ((triggerPrice !== undefined) && (type !== undefined)) {
            if (type.indexOf ('take_profit') >= 0) {
                takeProfitPrice = triggerPrice;
            } else if (type.indexOf ('stop') >= 0) {
                stopLossPrice = triggerPrice;
            }
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus (status),
            'symbol': market['symbol'],
            'type': this.parseOrderType (type),
            'timeInForce': this.parseOrderTimeInForce (this.safeString (order, 'time_in_force')), // only for limit orders
            'side': this.safeString (order, 'side'),
            'price': this.omitZero (this.safeString2 (order, 'price_per_unit', 'price')),
            'average': this.omitZero (this.safeString (order, 'avg_price')),
            'amount': this.safeString (order, 'total_quantity'),
            'filled': this.safeString (order, 'filled_quantity'),
            'remaining': this.safeString (order, 'remaining_quantity'),
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'cost': undefined,
            'trades': undefined,
            'fee': fee,
            'reduceOnly': false,
            'postOnly': undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses: Dict = {
            'open': 'open',
            'init': 'open',
            'initial': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'close': 'canceled',
            'partially_cancelled': 'canceled',
            'rejected': 'rejected',
            'partial_entry': 'open',
            'triggered': 'open',
            'partial_close': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types: Dict = {
            'market_order': 'market',
            'limit_order': 'limit',
            'stop_limit': 'limit',
            'stop_market': 'market',
            'take_profit': 'limit',
            'take_profit_limit': 'limit',
            'take_profit_market': 'market',
        };
        return this.safeString (types, type, type);
    }

    parseOrderTimeInForce (type) {
        const types: Dict = {
            'good_till_cancel': 'GTC',
            'immediate_or_cancel': 'IOC',
            'fill_or_kill': 'FOK',
        };
        return this.safeString (types, type, type);
    }

    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        /**
         * @method
         * @name coindcx#addMargin
         * @description add margin
         * @see https://docs.coindcx.com/#add-margin
         * @see https://docs.coindcx.com/#add-margin-2
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.id] *mandatory* the ID of Margin Order (position)
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        /**
         * @method
         * @name coindcx#reduceMargin
         * @see https://docs.coindcx.com/?python#remove-margin
         * @see https://docs.coindcx.com/#remove-margin-2
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.id] *mandatory* the ID of Margin Order (position)
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    async modifyMarginHelper (symbol: string, amount, type, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = this.safeString (params, 'id');
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' addMargin() and reduceMargin() require a params.id argument');
        }
        const request: Dict = {
            'amount': amount,
        };
        if (market['spot']) {
            if (type === 'add') {
                return await this.privatePostExchangeV1MarginAddMargin (this.extend (request, params));
            } else if (type === 'reduce') {
                return await this.privatePostExchangeV1MarginRemoveMargin (this.extend (request, params));
            } else {
                throw new NotSupported (this.id + ' modifyMarginHelper does not supports a ' + type + ' type');
            }
        } else if (market['swap']) {
            if (type === 'add') {
                return await this.privatePostExchangeV1DerivativesFuturesPositionsAddMargin (this.extend (request, params));
            } else if (type === 'reduce') {
                return await this.privatePostExchangeV1DerivativesFuturesPositionsRemoveMargin (this.extend (request, params));
            } else {
                throw new NotSupported (this.id + ' modifyMarginHelper does not supports a ' + type + ' type');
            }
        } else {
            throw new NotSupported (this.id + ' modifyMarginHelper() does not supports ' + market['type'] + ' markets');
        }
    }

    async fetchPosition (symbol: string, params = {}): Promise<Position> {
        /**
         * @method
         * @name coindcx#fetchPosition
         * @description *for contract markets only* fetch data on an open position
         * @see https://docs.coindcx.com/?javascript#list-positions
         * @see https://docs.coindcx.com/?javascript#get-positions-by-pairs-or-positionid
         * @param {string} symbol unified market symbol of the market the position is held in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.id] position id (can be used instead of symbol)
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new NotSupported (this.id + ' fetchPosition() supports contract markets only');
        }
        const positions = await this.fetchPositions ([ symbol ], params);
        return positions[0];
    }

    async fetchPositions (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#fetchPositions
         * @description *for contract markets only* fetch all open positions
         * @see https://docs.coindcx.com/?javascript#list-positions
         * @see https://docs.coindcx.com/?javascript#get-positions-by-pairs-or-positionid
         * @param {string[]} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.page] required page number
         * @param {int} [params.size] number of records needed per page
         * @param {string} [params.position_ids] position id’s separated with comma (can be used instead of symbols)
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            let idsString = '';
            for (let i = 0; i < marketIds.length; i++) {
                const id = marketIds[i];
                idsString = idsString + id;
                if (i !== marketIds.length - 1) {
                    idsString = idsString + ',';
                }
            }
            request['pairs'] = idsString;
        }
        const response = await this.privatePostExchangeV1DerivativesFuturesPositions (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "5265ec86-3455-11ef-93b4-a74b335c160f",
        //             "pair": "B-ETH_USDT",
        //             "active_pos": 0.01,
        //             "inactive_pos_buy": 0.0,
        //             "inactive_pos_sell": 0.0,
        //             "avg_price": 3045.02,
        //             "liquidation_price": 43.088450847474,
        //             "locked_margin": 30.47606849152526,
        //             "locked_user_margin": 30.501684,
        //             "locked_order_margin": 0.0,
        //             "take_profit_trigger": 0.0,
        //             "stop_loss_trigger": 0.0,
        //             "leverage": 1.0,
        //             "maintenance_margin": 0.445336501137,
        //             "mark_price": 2968.91000758,
        //             "updated_at": 1720454415762
        //         }
        //     ]
        //
        return this.parsePositions (response, symbols); // todo should we add timestamp here?
    }

    async fetchPositionsHistory (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name coindcx#fetchPositionsHistory
         * @description *spot margin markets only* fetches historical positions
         * @see https://docs.coindcx.com/#query-order
         * @param {string[]} [symbols] unified contract symbols
         * @param {int} [since] timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months
         * @param {int} [limit] the maximum amount of records to fetch, default 10
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @param {bool} [params.details] whether you want detailed information or not, default: false
         * @param {string} [params.status] init, open, close, rejected, cancelled, partial_entry, partial_close or triggered - the status of the order (position), default: all
         * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        let marketType = 'spot';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 0) {
                const market = this.market (symbols[0]);
                marketType = this.safeString (market, 'type', marketType);
            }
        }
        if (marketType !== 'spot') {
            throw new NotSupported (this.id + ' fetchPositionsHistory() supports only spot markets with margin');
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privatePostExchangeV1MarginFetchOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "ae077a5e-2cf4-11ef-8851-77a95a586a3a",
        //             "side": "buy",
        //             "status": "close",
        //             "market": "ETHUSDT",
        //             "order_type": "market_order",
        //             "base_currency_name": null,
        //             "target_currency_name": null,
        //             "base_currency_short_name": null,
        //             "target_currency_short_name": null,
        //             "base_currency_precision": null,
        //             "target_currency_precision": null,
        //             "trailing_sl": false,
        //             "trail_percent": null,
        //             "avg_entry": 3525.41,
        //             "avg_exit": 3522.87,
        //             "maker_fee": 0.1,
        //             "taker_fee": 0.1,
        //             "fee": 0.1,
        //             "entry_fee": 0.01057623,
        //             "exit_fee": 0.01056861,
        //             "active_pos": 0.0,
        //             "exit_pos": 0.003,
        //             "total_pos": 0.003,
        //             "quantity": 0.003,
        //             "price": 3525.41,
        //             "sl_price": 704.5,
        //             "target_price": 0.0,
        //             "stop_price": 0.0,
        //             "pnl": -0.02876484,
        //             "initial_margin": 0.0,
        //             "interest": 0.0667,
        //             "interest_amount": 0.0,
        //             "interest_amount_updated_at": 0,
        //             "interest_free_hours": 1.0,
        //             "leverage": 1.0,
        //             "result": "exit",
        //             "tds_amount": 0.0,
        //             "margin_tds_records": [],
        //             "created_at": 1718661487503,
        //             "updated_at": 1718661890487,
        //             "orders": [
        //                 {
        //                     "id": 104528544,
        //                     "order_type": "market_order",
        //                     "status": "filled",
        //                     "market": "ETHUSDT",
        //                     "side": "sell",
        //                     "avg_price": 3522.87,
        //                     "total_quantity": 0.003,
        //                     "remaining_quantity": 0.0,
        //                     "price_per_unit": 0.0,
        //                     "timestamp": 1718661890114.6968,
        //                     "maker_fee": 0.1,
        //                     "taker_fee": 0.1,
        //                     "fee": 0.1,
        //                     "fee_amount": 0.01056861,
        //                     "filled_quantity": 0.003,
        //                     "bo_stage": "stage_exit",
        //                     "cancelled_quantity": 0.0,
        //                     "stop_price": null
        //                 },
        //                 ...
        //             ]
        //         },
        //         ...
        //     ]
        //
        const positions = this.parsePositions (response, symbols);
        return this.filterBySinceLimit (positions, since, limit);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // fetchPositionsHistory
        //     {
        //         "id": "ae077a5e-2cf4-11ef-8851-77a95a586a3a",
        //         "side": "buy",
        //         "status": "close",
        //         "market": "ETHUSDT",
        //         "order_type": "market_order",
        //         "base_currency_name": null,
        //         "target_currency_name": null,
        //         "base_currency_short_name": null,
        //         "target_currency_short_name": null,
        //         "base_currency_precision": null,
        //         "target_currency_precision": null,
        //         "trailing_sl": false,
        //         "trail_percent": null,
        //         "avg_entry": 3525.41,
        //         "avg_exit": 3522.87,
        //         "maker_fee": 0.1,
        //         "taker_fee": 0.1,
        //         "fee": 0.1,
        //         "entry_fee": 0.01057623,
        //         "exit_fee": 0.01056861,
        //         "active_pos": 0.0,
        //         "exit_pos": 0.003,
        //         "total_pos": 0.003,
        //         "quantity": 0.003,
        //         "price": 3525.41,
        //         "sl_price": 704.5,
        //         "target_price": 0.0,
        //         "stop_price": 0.0,
        //         "pnl": -0.02876484,
        //         "initial_margin": 0.0,
        //         "interest": 0.0667,
        //         "interest_amount": 0.0,
        //         "interest_amount_updated_at": 0,
        //         "interest_free_hours": 1.0,
        //         "leverage": 1.0,
        //         "result": "exit",
        //         "tds_amount": 0.0,
        //         "margin_tds_records": [],
        //         "created_at": 1718661487503,
        //         "updated_at": 1718661890487,
        //         "orders": [
        //             {
        //                 "id": 104528544,
        //                 "order_type": "market_order",
        //                 "status": "filled",
        //                 "market": "ETHUSDT",
        //                 "side": "sell",
        //                 "avg_price": 3522.87,
        //                 "total_quantity": 0.003,
        //                 "remaining_quantity": 0.0,
        //                 "price_per_unit": 0.0,
        //                 "timestamp": 1718661890114.6968,
        //                 "maker_fee": 0.1,
        //                 "taker_fee": 0.1,
        //                 "fee": 0.1,
        //                 "fee_amount": 0.01056861,
        //                 "filled_quantity": 0.003,
        //                 "bo_stage": "stage_exit",
        //                 "cancelled_quantity": 0.0,
        //                 "stop_price": null
        //             },
        //             ...
        //         ]
        //     }
        //
        // fetchPosition and fetchPositions
        //     {
        //         "id": "5265ec86-3455-11ef-93b4-a74b335c160f",
        //         "pair": "B-ETH_USDT",
        //         "active_pos": 0.01,
        //         "inactive_pos_buy": 0.0,
        //         "inactive_pos_sell": 0.0,
        //         "avg_price": 3045.02,
        //         "liquidation_price": 43.088450847474,
        //         "locked_margin": 30.47606849152526,
        //         "locked_user_margin": 30.501684,
        //         "locked_order_margin": 0.0,
        //         "take_profit_trigger": 0.0,
        //         "stop_loss_trigger": 0.0,
        //         "leverage": 1.0,
        //         "maintenance_margin": 0.445336501137,
        //         "mark_price": 2968.91000758,
        //         "updated_at": 1720454415762
        //     }
        //
        const marketId = this.safeString2 (position, 'market', 'pair');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2 (position, 'created_at', 'updated_at'); // todo check
        const initialMargin = this.safeString2 (position, 'initial_margin', 'locked_user_margin');
        let side = this.parsePositionSide (this.safeString (position, 'side', 'long'));
        let baseAmount = this.safeString2 (position, 'quantity', 'active_pos');
        if (Precise.stringLt (baseAmount, '0')) {
            baseAmount = Precise.stringAbs (baseAmount);
            side = 'short';
        }
        const leverage = this.omitZero (this.safeString (position, 'leverage'));
        const entryPrice = this.safeString2 (position, 'avg_entry', 'avg_price');
        const stopLossPrice = this.omitZero (this.safeString (position, 'stop_loss_trigger'));
        const takeProfitPrice = this.omitZero (this.safeString (position, 'take_profit_trigger'));
        return this.safePosition ({
            'id': this.safeString (position, 'id'),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'notional': undefined, // todo check
            'marginMode': 'isolated', // todo check
            'liquidationPrice': this.safeNumber (position, 'liquidation_price'),
            'entryPrice': this.parseNumber (entryPrice),
            'unrealizedPnl': undefined, // todo check
            'realizedPnl': this.safeNumber (position, 'pnl'),
            'percentage': undefined, // todo check
            'contracts': this.parseNumber (baseAmount), // todo check
            'contractSize': this.safeNumber (market, 'contractSize'), // todo check
            'markPrice': this.safeNumber (position, 'mark_price'), // todo check
            'lastPrice': this.safeNumber (position, 'avg_exit'),
            'side': side,
            'hedged': true, // todo check
            'lastUpdateTimestamp': this.safeInteger (position, 'updated_at'),
            'maintenanceMargin': this.safeNumber (position, 'maintenance_margin'),
            'maintenanceMarginPercentage': undefined, // todo check
            'collateral': undefined, // todo check
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': undefined, // todo check
            'leverage': this.parseNumber (leverage),
            'marginRatio': undefined, // todo check
            'stopLossPrice': this.parseNumber (stopLossPrice), // todo check
            'takeProfitPrice': this.parseNumber (takeProfitPrice), // todo check
            'info': position,
        });
    }

    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name coindcx#closePosition
         * @description closes open positions for a market
         * @see https://docs.coindcx.com/#exit
         * @see https://docs.coindcx.com/#exit-position
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} [side] not used by coinbase
         * @param {object} [params] extra parameters specific to the coinbase api endpoint
         * @param {string}  params.id *mandatory* the ID of Margin Order (position)
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = this.safeString (params, 'id');
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' closePosition() requires a params.id argument');
        }
        if (market['spot']) {
            const response = await this.privatePostExchangeV1MarginExit (params);
            return this.parseOrder (response);
        } else if (market['swap']) {
            const response = await this.privatePostExchangeV1DerivativesFuturesPositionsExit (params);
            return this.parseOrder (response);
        } else {
            throw new NotSupported (this.id + ' closePosition() does not supports ' + market['type'] + ' markets');
        }
    }

    parsePositionSide (side) {
        const sides = {
            'buy': 'long',
            'sell': 'short',
        };
        return this.safeString (sides, side, side);
    }

    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#setLeverage
         * @description set the level of leverage for a market
         * @see https://docs.coindcx.com/#update-position-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginCurrencyShortName] *mandatory* Futures margin mode. Default value - "USDT". Possible values INR & USDT.
         * @returns {object} response from the exchange
         */
        await this.loadMarkets ();
        let market = undefined;
        let request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            if (!market['swap']) {
                throw new NotSupported (this.id + ' setLeverage() supports swap markets only');
            }
            request['symbol'] = market['id'];
        }
        let marginCurrencyShortName = 'USDT';
        if (params['marginCurrencyShortName'] !== undefined) {
            marginCurrencyShortName = params['marginCurrencyShortName'];
            params = this.omit (params, 'marginCurrencyShortName');
        }
        request = {
            'leverage': leverage.toString (),
            'margin_currency_short_name': marginCurrencyShortName,
        };
        return await this.privatePostExchangeV1DerivativesFuturesPositionsUpdateLeverage (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (method === 'POST') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            const secret = this.encode (this.secret);
            params['timestamp'] = timestamp;
            const payload = this.json (params);
            const signature = this.hmac (this.encode (payload), secret, sha256);
            headers = {
                'Content-Type': 'application/json',
                'X-AUTH-APIKEY': this.apiKey,
                'X-AUTH-SIGNATURE': signature,
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if (url.indexOf ('create_multiple') >= 0) {
            const orders = this.safeList (response, 'orders'); // createOrders() could return an error inside of property 'orders'
            for (let i = 0; i < orders.length; i++) {
                const orderInfo = orders[i];
                const errorMessage = this.safeString (orderInfo, 'error_message');
                if (errorMessage !== undefined) {
                    throw new InvalidOrder ('{"error_message":"' + errorMessage + '"}'); // todo check
                }
            }
        }
        const status = this.safeString (response, 'status');
        if (status === 'error') {
            const feedback = this.id + ' ' + body;
            const message = this.safeString (response, 'message');
            let messageCode = this.safeString (reason, 'code');
            if (messageCode === undefined) {
                messageCode = code.toString ();
            }
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], messageCode, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
