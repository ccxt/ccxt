// ---------------------------------------------------------------------------

import Exchange from './abstract/exkoin.js';
import { InsufficientFunds, AuthenticationError, BadRequest, ExchangeError, ArgumentsRequired, PermissionDenied, BadSymbol, AccountSuspended, AccountNotEnabled, MarketClosed, RateLimitExceeded, OnMaintenance, InvalidAddress, OrderNotFound } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Market, Int, Num, Order, OrderSide, OrderType, Str, Dict, int, Strings, Tickers, OHLCV, Trade, Transaction, Currency, DepositAddress, Ticker, Currencies, TradingFees, LedgerEntry } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class exkoin
 * @augments Exchange
 */
export default class exkoin extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'exkoin',
            'name': 'ExKoin',
            'countries': [ ],
            'rateLimit': 30,
            'version': 'v1',
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLedgerEntry': true,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'referral': '',
                'logo': 'https://api.exkoin.com/logo-for-ccxt.png',
                'api': {
                    'rest': 'https://api.exkoin.com/v1',
                },
                'www': 'https://exkoin.com',
                'doc': 'https://exkoin.com/api',
                'fees': 'https://exkoin.com/profile',
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0'),
                    'taker': this.parseNumber ('0.0004'),
                },
            },
            'api': {
                'public': {
                    'get': {
                        'public/currencies': 1,
                        'public/networks': 1,
                        'public/markets': 1,
                        'public/orderbook': 1,
                        'public/ohlcv': 1,
                        'public/markets/tickers-list': 1,
                        'public/markets/ticker': 1,
                        'public/trades': 1,
                        'public/gains-losses-transparency': 1,
                        'public/pools': 1,
                        'public/pools/fees-history': 1,
                        'public/pool/state': 1,
                        'public/funds-transparency': 1,
                        'public/exk/config': 1,
                        'public/forex-prices': 1,
                        'public/exk/reserves': 1,
                    },
                },
                'private': {
                    'get': {
                        'private/deposit-address': 1,
                        'private/balances': 1,
                        'private/orders': 1,
                        'private/order': 1,
                        'private/trade': 1,
                        'private/trades/by-order-id': 1,
                        'private/trades': 1,
                        'private/deposit': 1,
                        'private/deposits': 1,
                        'private/withdrawal': 1,
                        'private/withdrawals': 1,
                        'private/withdrawals/detail': 1,
                        'private/pool/tasks': 1,
                        'private/pool/positions': 1,
                        'private/pool/task': 1,
                        'private/account/get-trading-fees': 1,
                        'private/ledgers': 1,
                        'private/ledger': 1,
                    },
                    'post': {
                        'private/orders': 1,
                        'private/orders/cancel': 1,
                        'private/orders/cancel-all': 1,
                        'private/withdrawals/prepare': 1,
                        'private/withdrawals/finish': 1,
                        'private/pool/join': 1,
                        'private/pool/leave': 1,
                        'private/exk/redeem': 1,
                    },
                },
            },
            'commonCurrencies': {
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'UNAUTHORIZED': AuthenticationError,
                    'INSUFFICIENT_BALANCE': InsufficientFunds,
                    'INVALID_INPUT': BadRequest,
                    'INVALID_ADDRESS': InvalidAddress,
                    'NOT_FOUND': OrderNotFound,
                    'ORDER_NOT_FOUND': OrderNotFound,
                    'SYMBOL_NOT_FOUND': BadSymbol,
                    'ACCOUNT_FREEZED': AccountSuspended,
                    'ACCOUNT_NOT_ENABLED': AccountNotEnabled,
                    'MARKET_CLOSED': MarketClosed,
                    'FORBIDDEN': PermissionDenied,
                    'INTERNAL_ERROR': ExchangeError,
                    'INVALID_SIGNATURE': AuthenticationError,
                    'EXPIRED_TOKEN': AuthenticationError,
                    'RATE_LIMIT': RateLimitExceeded,
                    'MAINTENANCE': OnMaintenance,
                },
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '4h': 240,
                '1d': 1440,
            },
            'options': {
                'TRC20': 'TRX',
                'ERC20': 'ETH',
                'BEP20': 'BSC',
                'OPTIMISM': 'OP',
                'ARB': 'ARB',
                'MATIC': 'POL',
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerDirection': false,
                        'triggerPriceType': undefined,
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
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': undefined,
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
        });
    }

    /**
     * @method
     * @name exkoin#fetchMarkets
     * @description retrieves data on all markets for exkoin
     * @see https://api.exkoin.com/documentation#operations-public-get_public_markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetPublicMarkets (params);
        //
        //   [
        //       {
        //          "id": "BTC/USDT",
        //          "base": "BTC",
        //          "quote": "USDT",
        //          "active": true,
        //          "precision": {
        //             "amount": 8,
        //             "cost": 2,
        //             "price": 2
        //          },
        //          "limits": {
        //             "price": {
        //                "min": "0.01",
        //                "max": "1000000"
        //             },
        //             "amount": {
        //                "min": "0.00000001",
        //                "max": "1000"
        //             },
        //             "cost": {
        //                "min": "1",
        //                "max": "1000000"
        //             }
        //          }
        //       }
        //   ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const rawMarket = response[i];
            const id = this.safeString (rawMarket, 'id');
            const baseId = this.safeString (rawMarket, 'base');
            const quoteId = this.safeString (rawMarket, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const precision = this.safeDict (rawMarket, 'precision', {});
            const limits = this.safeDict (rawMarket, 'limits', {});
            const market = this.safeMarketStructure ({
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
                'active': this.safeBool (rawMarket, 'active', true),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'taker': this.fees['trading']['taker'],
                'maker': this.fees['trading']['maker'],
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parsePrecision (this.safeString (precision, 'amount')),
                    'price': this.parsePrecision (this.safeString (precision, 'price')),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (limits['amount'], 'min'),
                        'max': this.safeNumber (limits['amount'], 'max'),
                    },
                    'price': {
                        'min': this.safeNumber (limits['price'], 'min'),
                        'max': this.safeNumber (limits['price'], 'max'),
                    },
                    'cost': {
                        'min': this.safeNumber (limits['cost'], 'min'),
                        'max': this.safeNumber (limits['cost'], 'max'),
                    },
                },
                'created': undefined,
                'info': rawMarket,
            });
            result.push (market);
        }
        return result;
    }

    /**
     * @method
     * @name exkoin#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.exkoin.com/documentation#operations-public-get_public_markets_ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}) : Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPublicMarketsTicker (this.extend (request, params));
        //
        //         {
        //             "symbol": "BTC/USDT",
        //             "last_price": "50000.00",
        //             "price_change_percent": "2.5",
        //             "base_volume": "123.45"
        //         }
        //
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name exkoin#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api.exkoin.com/documentation#operations-public-get_public_markets_tickers_list
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetPublicMarketsTickersList (params);
        //
        //     [
        //         {
        //             "symbol": "BTC/USDT",
        //             "last_price": "50000.00",
        //             "price_change_percent": "2.5",
        //             "base_volume": "123.45"
        //         },
        //         ...
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = response[i];
            const marketId = this.safeString (ticker, 'symbol');
            const market = this.safeMarket (marketId);
            const parsedTicker = this.parseTicker (ticker, market);
            const symbol = parsedTicker['symbol'];
            result[symbol] = parsedTicker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    parseTicker (ticker, market: Market = undefined) {
        //
        //     {
        //         "symbol": "BTC/USDT",
        //         "last_price": "50000.00",
        //         "price_change_percent": "2.5",
        //         "base_volume": "123.45"
        //     }
        //
        return this.safeTicker ({
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'price_change_percent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name exkoin#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.exkoin.com/documentation#operations-public-get_public_ohlcv
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeInteger (this.timeframes, timeframe, 60),
        };
        if (since !== undefined) {
            request['from'] = this.parseToInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPublicOhlcv (this.extend (request, params));
        //
        //     [
        //         {
        //             "time": 1729130040000,
        //             "open": "67581.47",
        //             "high": "67581.47",
        //             "low": "67338.01",
        //             "close": "67338.01",
        //             "volume": "6.72168016"
        //         },
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name exkoin#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api.exkoin.com/documentation#operations-public-get_public_currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Currencies} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetPublicCurrencies (params);
        //
        //     [
        //         {
        //             "id": "BTC",
        //             "name": "Bitcoin",
        //             "precision": 8,
        //             "deposit_enabled": true,
        //             "withdrawal_enabled": true,
        //             "value_usd": "67000.00",
        //             "logo_url": "/logos/btc.png",
        //             "networks": [
        //                 {
        //                     "id": "BTC",
        //                     "contract_address": ""
        //                 },
        //                 {
        //                     "id": "ETH",
        //                     "contract_address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
        //                 }
        //             ],
        //             "lp_token_of": ""
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (id);
            const precision = this.parsePrecision (this.safeString (currency, 'precision'));
            const depositEnabled = this.safeValue (currency, 'deposit_enabled', true);
            const withdrawalEnabled = this.safeValue (currency, 'withdrawal_enabled', true);
            const active = depositEnabled && withdrawalEnabled;
            const networks = this.safeList (currency, 'networks', []);
            const networksResult: Dict = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.networkIdToCode (this.safeString (network, 'id'), id);
                const contractAddress = this.safeString (network, 'contract_address');
                networksResult[networkId] = network;
                if (contractAddress !== undefined && contractAddress !== '') {
                    networksResult[networkId]['address'] = contractAddress;
                }
            }
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'fee': undefined,
                'precision': precision,
                'deposit': depositEnabled,
                'withdraw': withdrawalEnabled,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networksResult,
                'info': currency,
            });
        }
        return result;
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "time": 1729130040000,
        //         "open": "67581.47",
        //         "high": "67581.47",
        //         "low": "67338.01",
        //         "close": "67338.01",
        //         "volume": "6.72168016"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name exkoin#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.exkoin.com/documentation#operations-public-get_public_orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPublicOrderbook (this.extend (request, params));
        //
        // {
        //     "bids": [
        //        ["50000.00", "0.1"],
        //        ["49999.00", "0.2"]
        //     ],
        //     "asks": [
        //        ["50001.00", "0.1"],
        //        ["50002.00", "0.2"]
        //     ],
        //     "timestamp": 1729130040000
        // }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    /**
     * @method
     * @name exkoin#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.exkoin.com/documentation#operations-public-get_public_trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPublicTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //  {
        //      "id": "12345-67890",
        //      "order_id": "order-123",
        //      "client_order_id": "client-456",
        //      "symbol": "BTC/USDT",
        //      "type": "limit",
        //      "side": "buy",
        //      "taker_or_maker": "taker",
        //      "price": "50000.00",
        //      "amount": "0.1",
        //      "cost": "5000.00",
        //      "fee": {
        //          "currency": "USDT",
        //          "cost": "2.0",
        //          "rate": "0.0004"
        //      },
        //      "created_at": 1729130040000
        //  }
        //
        const timestamp = this.safeInteger (trade, 'created_at');
        const fee = this.safeDict (trade, 'fee');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'order': this.safeString (trade, 'order_id'),
            'type': this.safeString (trade, 'type'),
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeString (trade, 'taker_or_maker'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': this.safeString (trade, 'cost'),
            'fee': {
                'currency': this.safeString (fee, 'currency'),
                'cost': this.safeString (fee, 'cost'),
                'rate': this.safeString (fee, 'rate'),
            },
        }, market);
    }

    /**
     * @method
     * @name exkoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.exkoin.com/documentation#operations-account-get_private_balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPrivateBalances (params);
        return this.parseBalance (response);
    }

    parseBalance (response) {
        //
        //    {
        //        "free": {
        //            "BTC": "1.0",
        //            "USDT": "1000.0"
        //        },
        //        "locked": {
        //            "BTC": "0.1",
        //            "USDT": "100.0"
        //        }
        //    }
        //
        const result: Dict = {
            'info': response,
        };
        const free = this.safeDict (response, 'free', {});
        const locked = this.safeDict (response, 'locked', {});
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const freeBalance = this.safeString (free, currencyId, '0');
            const lockedBalance = this.safeString (locked, currencyId, '0');
            const account: Dict = {
                'free': freeBalance,
                'used': lockedBalance,
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name exkoin#createOrder
     * @description create a trade order
     * @see https://api.exkoin.com/documentation#operations-trade-post_private_orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'type': type,
            'side': side,
        };
        if (type === 'market') {
            if (side === 'buy') {
                if (params['cost'] !== undefined) {
                    request['cost'] = params['cost'];
                } else {
                    if (price === undefined) {
                        throw new ArgumentsRequired (this.id + ' createOrder requires a price parameter for market buy orders');
                    }
                    request['cost'] = this.costToPrecision (symbol, amount * price);
                }
            } else {
                request['quantity'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder requires a price parameter for limit orders');
            }
            request['quantity'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId' ]);
        }
        const response = await this.privatePostPrivateOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name exkoin#cancelOrder
     * @description cancels an open order
     * @see https://api.exkoin.com/documentation#operations-trade-post_private_orders_cancel
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'order_id': id,
            'symbol': market['id'],
        };
        const response = await this.privatePostPrivateOrdersCancel (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name exkoin#cancelAllOrders
     * @description cancel all open orders
     * @see https://api.exkoin.com/documentation#operations-trade-post_private_orders_cancel_all
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        if (!symbol) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a symbol parameter');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privatePostPrivateOrdersCancelAll (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    /**
     * @method
     * @name exkoin#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.exkoin.com/documentation#operations-trade-get_private_orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {
            'is_open': true,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.privateGetPrivateOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name exkoin#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api.exkoin.com/documentation#operations-trade-get_private_orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {
            'is_open': false,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.privateGetPrivateOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name exkoin#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.exkoin.com/documentation#operations-trade-get_private_orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.privateGetPrivateOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name exkoin#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.exkoin.com/documentation#operations-trade-get_private_order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.privateGetPrivateOrder (this.extend (request, params));
        return this.parseOrder (response, undefined);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // {
        //     "id": "12345",
        //     "client_order_id": "my-order-1",
        //     "symbol": "BTC/USDT",
        //     "type": "limit",
        //     "side": "buy",
        //     "status": "open",
        //     "price": "50000.00",
        //     "average": "0.00",
        //     "amount": "0.1",
        //     "filled": "0.0",
        //     "remaining": "0.1",
        //     "cost": "0.00",
        //     "fee": {
        //         "currency": "USDT",
        //         "cost": "0.00",
        //         "rate": "0.001"
        //     },
        //     "created_at": 1729130040000,
        //     "updated_at": 1729130040000
        // }
        //
        const timestamp = this.safeInteger (order, 'created_at');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const fee = this.safeDict (order, 'fee', {});
        const rawStatus = this.safeString (order, 'status');
        let status = rawStatus;
        if (rawStatus === 'cancelled') {
            status = 'canceled';
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'updated_at'),
            'symbol': market['symbol'],
            'type': this.safeString (order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'amount'),
            'cost': this.safeString (order, 'cost'),
            'average': this.safeString (order, 'average'),
            'filled': this.safeString (order, 'filled'),
            'remaining': this.safeString (order, 'remaining'),
            'status': status,
            'fee': {
                'currency': this.safeString (fee, 'currency'),
                'cost': this.safeString (fee, 'cost'),
                'rate': this.safeString (fee, 'rate'),
            },
            'trades': undefined,
            'lastUpdateTimestamp': this.safeInteger (order, 'updated_at'),
        }, market);
    }

    /**
     * @method
     * @name exkoin#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.exkoin.com/documentation#operations-trade-get_private_trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.privateGetPrivateTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name exkoin#fetchTradingFees
     * @description fetch the trading fees for all markets
     * @see https://api.exkoin.com/documentation#operations-account-get_private_account_get_trading_fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.privateGetPrivateAccountGetTradingFees (params);
        // ExKoin uses account specific fees, apply to all markets
        // {
        //     "maker": "0",  // 0% fee
        //     "taker": "0.0004"  // 0.04% fee
        // }
        //
        const makerFee = this.safeNumber (response, 'maker');
        const takerFee = this.safeNumber (response, 'taker');
        const result: Dict = {};
        // Apply the same fees to all markets since exkoin has fixed fees
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': makerFee,
                'taker': takerFee,
                'percentage': false,
                'tierBased': false,
            };
        }
        return result;
    }

    /**
     * @method
     * @name exkoin#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://api.exkoin.com/documentation#operations-trade-get_private_trades_by_order_id
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const request: Dict = {
            'order_id': id,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetPrivateTradesByOrderId (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name exkoin#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://api.exkoin.com/documentation#operations-account-get_private_deposit_address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the chain of currency
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}) : Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networkCode = this.networkCodeToId (this.safeString (params, 'network'), currency['id']);
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress requires a network parameter');
        }
        const request: Dict = {
            'currency': currency['id'],
            'network': networkCode,
        };
        const response = await this.privateGetPrivateDepositAddress (this.extend (request, params));
        //
        // {
        //     "active": true,
        //     "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //     "memo": "",
        //     "min_deposit_amount": "0.001",
        //     "currencyDetails": {...},
        //     "networkDetails": {...}
        // }
        //
        return {
            'currency': code,
            'address': this.safeString (response, 'address'),
            'tag': this.safeString (response, 'memo'),
            'network': networkCode,
            'info': response,
        };
    }

    async createDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        return await this.fetchDepositAddress (code, params);
    }

    /**
     * @method
     * @name exkoin#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api.exkoin.com/documentation#operations-account-get_private_deposits
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = this.parseToInt (since / 1000);
        }
        const response = await this.privateGetPrivateDeposits (this.extend (request, params));
        //
        // [
        //     {
        //         "id": "dep123",
        //         "currency": "BTC",
        //         "amount": "0.1",
        //         "fee": "0.0",
        //         "address_to": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //         "address_from": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        //         "network": "BTC",
        //         "memo": "",
        //         "txid": "abc123",
        //         "block_height": 700000,
        //         "status": "completed",
        //         "timestamp": 1729130040000,
        //         "confirmations": 6,
        //         "confirmations_required": 6
        //     }
        // ]
        //
        return this.parseTransactions (response, currency, since, limit, params);
    }

    /**
     * @method
     * @name exkoin#fetchDeposit
     * @description fetch information on a deposit
     * @see https://api.exkoin.com/documentation#operations-account-get_private_deposit_address
     * @param {string} id deposit id
     * @param {string} [code] unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposit (id: string, code: Str = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        const response = await this.privateGetPrivateDeposit (this.extend (request, params));
        //
        // {
        //     "id": "dep123",
        //     "currency": "BTC",
        //     "amount": "0.1",
        //     "fee": "0.0",
        //     "address_to": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //     "address_from": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        //     "network": "BTC",
        //     "memo": "",
        //     "txid": "abc123",
        //     "block_height": 700000,
        //     "status": "completed",
        //     "timestamp": 1729130040000,
        //     "confirmations": 6,
        //     "confirmations_required": 6
        // }
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransaction (response, currency);
    }

    /**
     * @method
     * @name exkoin#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://api.exkoin.com/documentation#operations-account-get_private_ledgers
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch ledger entries for
     * @param {int} [limit] the maximum number of ledger entries to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] page number for pagination
     * @returns {object[]} a list of [ledger entry structures]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['since'] = this.parseToInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const page = this.safeInteger (params, 'page');
        if (page !== undefined) {
            request['page'] = page;
        }
        const response = await this.privateGetPrivateLedgers (this.extend (request, params));
        //
        // [
        //     {
        //         "id": "ledger123",
        //         "type": "trade",
        //         "in": true,
        //         "amount": 100.5,
        //         "currency": "USDT",
        //         "created_at": 1729130040000,
        //         "after": 1000.5,
        //         "ref": "order123"
        //     }
        // ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    /**
     * @method
     * @name exkoin#fetchLedgerEntry
     * @description fetch a single ledger entry
     * @see https://api.exkoin.com/documentation#operations-account-get_private_ledger
     * @param {string} id ledger entry id
     * @param {string} [code] unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger entry structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedgerEntry (id: string, code: Str = undefined, params = {}): Promise<LedgerEntry> {
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        const currency = this.currency (code);
        const response = await this.privateGetPrivateLedger (this.extend (request, params));
        //
        // {
        //     "id": "ledger123",
        //     "type": "trade",
        //     "in": true,
        //     "amount": 100.5,
        //     "currency": "USDT",
        //     "created_at": 1729130040000,
        //     "after": 1000.5,
        //     "ref": "order123"
        // }
        //
        return this.parseLedgerEntry (response, currency);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        //
        // {
        //     "id": "ledger123",
        //     "type": "trade",
        //     "in": true,
        //     "amount": 100.5,
        //     "currency": "USDT",
        //     "created_at": 1729130040000,
        //     "after": 1000.5, // or undefined if originating from time sensitive operation (order-fill, ...)
        //     "ref": "order123"
        // }
        //
        const timestamp = this.safeInteger (item, 'created_at');
        const currencyId = this.safeString (item, 'currency');
        currency = this.safeCurrency (currencyId);
        const amount = this.safeNumber (item, 'amount');
        const isIn = this.safeBool (item, 'in');
        const direction = isIn ? 'in' : 'out';
        const type = this.safeString (item, 'type');
        const after = this.safeNumber (item, 'after');
        let before: Num = undefined;
        if (after !== undefined) {
            if (direction === 'in') {
                before = after - amount;
            } else {
                before = after + amount;
            }
        }
        const referenceId = this.safeString (item, 'ref');
        return this.safeLedgerEntry ({
            'id': this.safeString (item, 'id'),
            'direction': direction,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': currency['code'],
            'amount': amount,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': before,
            'after': after,
            'status': 'ok',
            'fee': undefined,
            'info': item,
        }, currency);
    }

    parseLedger (data, currency: Currency = undefined, since: Int = undefined, limit: Int = undefined, params = {}): LedgerEntry[] {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const entry = this.parseLedgerEntry (data[i]);
            result.push (entry);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    /**
     * @method
     * @name exkoin#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://api.exkoin.com/documentation#operations-account-get_private_withdrawals_detail
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = this.parseToInt (since / 1000);
        }
        const response = await this.privateGetPrivateWithdrawals (this.extend (request, params));
        //
        // [
        //     {
        //         "id": "with123",
        //         "currency": "BTC",
        //         "amount": "0.1",
        //         "user_fee": "0.001",
        //         "message": "",
        //         "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //         "from_address": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        //         "network": "BTC",
        //         "memo": "",
        //         "txid": "abc123",
        //         "status": "completed",
        //         "timestamp": 1729130040000
        //     }
        // ]
        //
        return this.parseTransactions (response, currency, since, limit, params);
    }

    /**
     * @method
     * @name exkoin#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://api.exkoin.com/documentation#operations-account-get_private_withdrawal
     * @param {string} id withdrawal id
     * @param {string} [code] unified currency code of the currency withdrawn, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawal (id: string, code: Str = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        const response = await this.privateGetPrivateWithdrawal (this.extend (request, params));
        return this.parseTransaction (response);
    }

    parseTransactions (transactions: any[], currency: Currency = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Transaction[] {
        transactions = this.toArray (transactions);
        let result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = this.extend (this.parseTransaction (transactions[i], currency), params);
            result.push (transaction);
        }
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // deposit:
        // {
        //     "id": "dep123",
        //     "currency": "BTC",
        //     "amount": "0.1",
        //     "fee": "0.0",
        //     "address_to": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //     "address_from": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        //     "network": "BTC",
        //     "memo": "",
        //     "txid": "abc123",
        //     "block_height": 700000,
        //     "status": "completed",
        //     "timestamp": 1729130040000,
        //     "confirmations": 6,
        //     "confirmations_required": 6
        // }
        //
        // withdrawal:
        // {
        //     "id": "with123",
        //     "currency": "BTC",
        //     "amount": "0.1",
        //     "user_fee": "0.001",
        //     "message": "",
        //     "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //     "from_address": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        //     "network": "BTC",
        //     "memo": "",
        //     "txid": "abc123",
        //     "status": "completed",
        //     "timestamp": 1729130040000
        // }
        //
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeNumber2 (transaction, 'fee', 'user_fee');
        const address = this.safeString2 (transaction, 'address_to', 'address');
        const addressFrom = this.safeString2 (transaction, 'address_from', 'from_address');
        const tag = this.safeString (transaction, 'memo');
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'txid');
        const network = this.safeString (transaction, 'network');
        const comment = this.safeString (transaction, 'message');
        // determine transaction type based on presence of certain fields
        let type = undefined;
        if (this.safeValue (transaction, 'address_to') !== undefined) {
            type = 'deposit';
        } else if (this.safeValue (transaction, 'address') !== undefined) {
            type = 'withdrawal';
        }
        const amount = this.safeNumber (transaction, 'amount');
        let feeRate = undefined;
        if (feeCost !== undefined && amount !== undefined) {
            const totalAmount = amount + feeCost;
            if (totalAmount > 0) {
                feeRate = feeCost / totalAmount;
            }
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'comment': comment,
            'internal': false,
            'fee': {
                'currency': code,
                'cost': feeCost,
                'rate': feeRate,
            },
        };
    }

    parseTransactionStatus (status: Str): Str {
        const statuses: Dict = {
            'pending': 'pending',
            'processing': 'pending',
            'completed': 'ok',
            'failed': 'failed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name exkoin#withdraw
     * @description make a withdrawal
     * @see https://api.exkoin.com/documentation#operations-account-post_private_withdrawals_prepare
     * @see https://api.exkoin.com/documentation#operations-account-post_private_withdrawals_finish
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        const network = this.networkCodeToId (this.safeString (params, 'network'), currency['id']);
        if (network === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires a network parameter');
        }
        // First, prepare the withdrawal
        const prepareRequest: Dict = {
            'currency': currency['id'],
            'address': address,
            'amount': this.numberToString (amount),
            'network': network,
        };
        if (tag !== undefined) {
            prepareRequest['memo'] = tag;
        }
        const prepareResponse = await this.privatePostPrivateWithdrawalsPrepare (this.extend (prepareRequest, this.omit (params, 'network')));
        //
        //     {
        //       "currency": {...},
        //       "amount_you_receive": "0.1",
        //       "fee": "0.001",
        //       "amount_you_pay": "0.101",
        //       "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //       "network": {...},
        //       "memo": "",
        //       "payload": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        //       "expire_in_ms": 300000
        //     }
        //
        // Then, finish the withdrawal with the payload
        const payload = this.safeString (prepareResponse, 'payload');
        const finishRequest: Dict = {
            'payload': payload,
        };
        const response = await this.privatePostPrivateWithdrawalsFinish (finishRequest);
        //
        //     {
        //       "id": "12345",
        //       "currency": "BTC",
        //       "amount": "0.1",
        //       "fee": "0.001",
        //       "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //       "memo": "",
        //       "network": "BTC",
        //       "status": "pending",
        //       "txid": "",
        //       "created_at": 1729130040000
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = {
                'Content-Type': 'application/json',
                'authorization': 'Basic ' + this.stringToBase64 (this.apiKey + ':' + this.secret),
                'user-agent': 'ccxt',
            };
            if (method !== 'GET') {
                body = this.json (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if (!('success' in response)) {
            return undefined;
        }
        //
        //  {"success":false,"error":"Must be authorized"}
        //
        const success = this.safeBool (response, 'success');
        if (success) {
            return undefined;
        }
        const successString = this.safeString (response, 'success');
        if (successString === 'true') {
            return undefined;
        }
        const error = this.safeValue (response, 'error');
        const errorCode = this.safeString (error, 'code');
        const feedback = this.id + ' ' + this.json (response);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        throw new ExchangeError (feedback);
    }
}
