
// ---------------------------------------------------------------------------

import Exchange from './abstract/idex.js';
import { TICK_SIZE } from './base/functions/number.js';
import { ArgumentsRequired, InvalidOrder, InsufficientFunds, ExchangeError, ExchangeNotAvailable, DDoSProtection, BadRequest, NotSupported, InvalidAddress, AuthenticationError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Balances, Currency, Dict, FundingRateHistory, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int, DepositAddress } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class idex
 * @augments Exchange
 */
export default class idex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'idex',
            'name': 'IDEX',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'version': 'v4',
            'pro': true,
            'dex': true,
            'certified': false,
            'requiresWeb3': true,
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
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketOrder': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawaFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'api': 'https://api-sandbox.idex.io',
                },
                'api': {
                    'api': 'https://api.idex.io',
                },
                'logo': 'https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg',
                'www': 'https://idex.io',
                'doc': [
                    'https://api-docs-v4.idex.io',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'ping': { 'cost': 1 },
                        'time': { 'cost': 1 },
                        'exchange': { 'cost': 1 },
                        'markets': { 'cost': 1 },
                        'tickers': { 'cost': 1 },
                        'candles': { 'cost': 1, 'bundled': 10 },
                        'trades': { 'cost': 1, 'bundled': 10 },
                        'liquidations': { 'cost': 1, 'bundled': 10 }, // not unified
                        'orderbook': { 'cost': 1, 'bundled': 10 },
                        'fundingRates': { 'cost': 1, 'bundled': 10 },
                        'gasFees': { 'cost': 1 }, // todo
                    },
                },
                'private': {
                    'get': {
                        // 'user': { 'cost': 1 }, not available in v4 API
                        'wallets': { 'cost': 1 },
                        'positions': { 'cost': 1 }, // todo
                        'fundingPayments': { 'cost': 1, 'bundled': 10 }, // todo should it be unified?
                        'historicalPnL': { 'cost': 1, 'bundled': 10 }, // todo should it be unified?
                        'initialMarginFractionOverride': { 'cost': 1 }, // todo should it be unified? (add/reduce margin)
                        'orders': { 'cost': 1, 'bundled': 10 },
                        'fills': { 'cost': 1, 'bundled': 10 },
                        'deposits': { 'cost': 1, 'bundled': 10 },
                        'withdrawals': { 'cost': 1, 'bundled': 10 },
                        'gasFees': { 'cost': 1 },
                        'marketMakerRewardsV1/epochs': { 'cost': 1 }, // todo
                        'marketMakerRewardsV1/epoch': { 'cost': 1 }, // todo
                        'payouts': { 'cost': 1 }, // todo
                        'wsToken': { 'cost': 1 },
                    },
                    'post': {
                        'wallets': { 'cost': 1 },
                        'initialMarginFractionOverride': { 'cost': 1 }, // todo should it be unified? (add/reduce margin)
                        'orders': { 'cost': 1 },
                        // 'orders/test': { 'cost': 1 }, not available in v4 API
                        'withdrawals': { 'cost': 1 }, // todo
                        'payouts': { 'cost': 1 }, // todo
                    },
                    'delete': {
                        'orders': { 'cost': 1, 'bundled': 10 },
                    },
                },
            },
            'options': {
                'defaultTimeInForce': 'gtc',
                'defaultSelfTradePrevention': 'cn',
                'precision': '8',
                'defaultSettle': 'USDC',
                'createOrder': {
                    'triggerType': 'last',
                },
                'networks': {
                    'XCHAIN': 'xchain.xchain',
                    'ARB': 'stargate.arbitrum',
                    'BASE': 'stargate.base',
                    'BEP20': 'stargate.bnb',
                    'ERC20': 'stargate.ethereum',
                    'MANTLE': 'stargate.mantle',
                    'OPTIMISM': 'stargate.optimism',
                    'MATIC': 'stargate.polygon',
                    'SEI': 'stargate.sei',
                },
                'networksById': {
                    'xchain.xchain': 'XCHAIN',
                    'stargate.arbitrum': 'ARB',
                    'stargate.base': 'BASE',
                    'stargate.bnb': 'BEP20',
                    'stargate.ethereum': 'ERC20',
                    'stargate.mantle': 'MANTLE',
                    'stargate.optimism': 'OPTIMISM',
                    'stargate.polygon': 'MATIC',
                    'stargate.sei': 'SEI',
                },
            },
            'exceptions': {
                'exact': {
                    'INVALID_ORDER_QUANTITY': InvalidOrder,
                    'INSUFFICIENT_FUNDS': InsufficientFunds,
                    'SERVICE_UNAVAILABLE': ExchangeNotAvailable,
                    'EXCEEDED_RATE_LIMIT': DDoSProtection,
                    'INVALID_PARAMETER': BadRequest,
                    'WALLET_NOT_ASSOCIATED': InvalidAddress,
                    'INVALID_WALLET_SIGNATURE': AuthenticationError,
                },
            },
            'requiredCredentials': {
                'walletAddress': true,
                'privateKey': true,
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {},
        });
    }

    priceToPrecision (symbol: string, price: any): string {
        const priceString = super.priceToPrecision (symbol, price);
        return this.padWithZeroes (priceString, 8);
    }

    amountToPrecision (symbol: string, amount: any): string {
        const amountString = super.amountToPrecision (symbol, amount);
        return this.padWithZeroes (amountString, 8);
    }

    padWithZeroes (num: string, decimalSize: number): string {
        const parts = num.split ('.');
        const integerPart = this.safeString (parts, 0);
        let decimalPart = this.safeString (parts, 1, '');
        const decimalLength = decimalPart.length;
        for (let i = decimalLength; i < decimalSize; i++) {
            decimalPart += '0';
        }
        return integerPart + '.' + decimalPart;
    }

    /**
     * @method
     * @name idex#fetchMarkets
     * @description retrieves data on all markets for idex
     * @see https://api-docs-v4.idex.io/#get-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarkets (params);
        //
        //    [
        //         {
        //             "market": "ETH-USD",
        //             "type": "perpetual",
        //             "status": "active",
        //             "baseAsset": "ETH",
        //             "quoteAsset": "USD",
        //             "stepSize": "0.00000100",
        //             "tickSize": "0.01000000",
        //             "indexPrice": "2236.32000000",
        //             "indexPrice24h": "2101.81000000",
        //             "indexPricePercentChange": "0.06399722",
        //             "lastFundingRate": "0.00017100",
        //             "currentFundingRate": "0.00010000",
        //             "nextFundingTime": 1704182400000,
        //             "makerOrderMinimum": "0.01000000",
        //             "takerOrderMinimum": "0.01000000",
        //             "marketOrderExecutionPriceLimit": "0.10000000",
        //             "limitOrderExecutionPriceLimit": "0.40000000",
        //             "minimumPositionSize": "0.01000000",
        //             "maximumPositionSize": "500.00000000",
        //             "initialMarginFraction": "0.05000000",
        //             "maintenanceMarginFraction": "0.03000000",
        //             "basePositionSize": "25.00000000",
        //             "incrementalPositionSize": "5.00000000",
        //             "incrementalInitialMarginFraction": "0.01000000",
        //             "makerFeeRate": "-0.00010000",
        //             "takerFeeRate": "0.00040000",
        //             "volume24h": "294856820.05",
        //             "trades24h": 221307,
        //             "openInterest": "57178.63200000",
        //         },
        //    ]
        //
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "market": "ETH-USD",
        //         "type": "perpetual",
        //         "status": "active",
        //         "baseAsset": "ETH",
        //         "quoteAsset": "USD",
        //         "stepSize": "0.00000100",
        //         "tickSize": "0.01000000",
        //         "indexPrice": "2236.32000000",
        //         "indexPrice24h": "2101.81000000",
        //         "indexPricePercentChange": "0.06399722",
        //         "lastFundingRate": "0.00017100",
        //         "currentFundingRate": "0.00010000",
        //         "nextFundingTime": 1704182400000,
        //         "makerOrderMinimum": "0.01000000",
        //         "takerOrderMinimum": "0.01000000",
        //         "marketOrderExecutionPriceLimit": "0.10000000",
        //         "limitOrderExecutionPriceLimit": "0.40000000",
        //         "minimumPositionSize": "0.01000000",
        //         "maximumPositionSize": "500.00000000",
        //         "initialMarginFraction": "0.05000000",
        //         "maintenanceMarginFraction": "0.03000000",
        //         "basePositionSize": "25.00000000",
        //         "incrementalPositionSize": "5.00000000",
        //         "incrementalInitialMarginFraction": "0.01000000",
        //         "makerFeeRate": "-0.00010000",
        //         "takerFeeRate": "0.00040000",
        //         "volume24h": "294856820.05",
        //         "trades24h": 221307,
        //         "openInterest": "57178.63200000",
        //     }
        //
        const marketId = this.safeString (market, 'market');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = 'USDC'; // todo check
        const status = this.safeString (market, 'status');
        const takerMinAmount = this.safeString (market, 'takerOrderMinimum');
        const makerMinAmount = this.safeString (market, 'makerOrderMinimum');
        const minAmount = this.parseNumber (Precise.stringMin (takerMinAmount, makerMinAmount));
        const basePrecision = this.safeNumber (market, 'stepSize');
        const quotePrecision = this.safeNumber (market, 'tickSize');
        return this.safeMarketStructure ({
            'id': marketId,
            'lowercaseId': marketId.toLowerCase (),
            'symbol': baseId + '/' + quoteId + ':' + settle,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settle,
            'type': 'swap', // todo check
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'index': false,
            'active': status === 'active',
            'contract': true,
            'linear': undefined,
            'inverse': undefined,
            'subType': undefined,
            'taker': this.safeNumber (market, 'takerFeeRate'),
            'maker': this.safeNumber (market, 'makerFeeRate'),
            'contractSize': 1, // todo check
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': basePrecision,
                'price': quotePrecision,
                'cost': undefined,
                'base': basePrecision,
                'quote': quotePrecision,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': minAmount,
                    'max': this.safeNumber (market, 'maximumPositionSize'),
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
            'marginModes': {
                'cross': undefined,
                'isolated': undefined,
            },
            'created': undefined,
            'info': undefined,
        });
    }

    /**
     * @method
     * @name idex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs-v4.idex.io/#get-tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        //
        //     [
        //         {
        //             "market": "ETH-USD",
        //             "time": 1735917438000,
        //             "open": "3484.90000000",
        //             "high": "3539.40000000",
        //             "low": "3423.60000000",
        //             "close": "3539.40000000",
        //             "closeQuantity": "0.01000000",
        //             "baseVolume": "25.30400000",
        //             "quoteVolume": "87590.84350000",
        //             "percentChange": "1.56388900",
        //             "trades": 1502,
        //             "sequence": 214572,
        //             "ask": "3535.60000000",
        //             "bid": "3535.30000000",
        //             "markPrice": "3535.60000000",
        //             "indexPrice": "3533.90000000",
        //             "indexPrice24h": "3484.10000000",
        //             "indexPricePercentChange": "0.01429350",
        //             "lastFundingRate": "0.00010000",
        //             "currentFundingRate": "0.00010000",
        //             "nextFundingTime": 1735920000000,
        //             "openInterest": "119.42700000"
        //         }
        //     ]
        //
        const response = await this.publicGetTickers (this.extend (request, params));
        const ticker = this.safeDict (response, 0);
        return this.parseTicker (ticker, market);
    }

    /**
     * @method
     * @name idex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api-docs-v4.idex.io/#get-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        //
        //     [
        //         {
        //             "market": "BNB-USD",
        //             "time": 1735917617000,
        //             "open": "708.25000000",
        //             "high": "708.82000000",
        //             "low": "695.91000000",
        //             "close": "706.80000000",
        //             "closeQuantity": "0.05000000",
        //             "baseVolume": "4689.56000000",
        //             "quoteVolume": "3304350.75710000",
        //             "percentChange": "-0.20472900",
        //             "trades": 1758,
        //             "sequence": 141478,
        //             "ask": "706.65000000",
        //             "bid": "706.50000000",
        //             "markPrice": "706.65000000",
        //             "indexPrice": "707.34000000",
        //             "indexPrice24h": "709.23000000",
        //             "indexPricePercentChange": "-0.00266486",
        //             "lastFundingRate": "0.00010000",
        //             "currentFundingRate": "0.00010000",
        //             "nextFundingTime": 1735920000000,
        //             "openInterest": "62.30000000"
        //         }, ...
        //     ]
        //
        const response = await this.publicGetTickers (params);
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     [
        //         {
        //             "market": "ETH-USD",
        //             "time": 1735917438000,
        //             "open": "3484.90000000",
        //             "high": "3539.40000000",
        //             "low": "3423.60000000",
        //             "close": "3539.40000000",
        //             "closeQuantity": "0.01000000",
        //             "baseVolume": "25.30400000",
        //             "quoteVolume": "87590.84350000",
        //             "percentChange": "1.56388900",
        //             "trades": 1502,
        //             "sequence": 214572,
        //             "ask": "3535.60000000",
        //             "bid": "3535.30000000",
        //             "markPrice": "3535.60000000",
        //             "indexPrice": "3533.90000000",
        //             "indexPrice24h": "3484.10000000",
        //             "indexPricePercentChange": "0.01429350",
        //             "lastFundingRate": "0.00010000",
        //             "currentFundingRate": "0.00010000",
        //             "nextFundingTime": 1735920000000,
        //             "openInterest": "119.42700000"
        //         }
        //     ]
        //
        const marketId = this.safeString (ticker, 'market');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 'time');
        const close = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'percentChange'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'indexPrice': this.safeString (ticker, 'indexPrice'),
            'markPrice': this.safeString (ticker, 'markPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name idex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs-v4.idex.io/#get-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 50, maximum 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'interval': timeframe,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['end'] = until;
            params = this.omit (params, 'until');
        }
        const response = await this.publicGetCandles (this.extend (request, params));
        //
        //     [
        //         {
        //             "start": 1735913340000,
        //             "open": "3495.90000000",
        //             "high": "3496.60000000",
        //             "low": "3495.90000000",
        //             "close": "3496.60000000",
        //             "baseVolume": "0.02000000",
        //             "quoteVolume": "69.92500000",
        //             "trades": 2,
        //             "sequence": 214495
        //         }, ...
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "start": 1735913340000,
        //         "open": "3495.90000000",
        //         "high": "3496.60000000",
        //         "low": "3495.90000000",
        //         "close": "3496.60000000",
        //         "baseVolume": "0.02000000",
        //         "quoteVolume": "69.92500000",
        //         "trades": 2,
        //         "sequence": 214495
        //     }
        //
        const timestamp = this.safeInteger (ohlcv, 'start');
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const volume = this.safeNumber (ohlcv, 'baseVolume');
        return [ timestamp, open, high, low, close, volume ];
    }

    /**
     * @method
     * @name idex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs-v4.idex.io/#get-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {string} [params.fromId] trade id of the earliest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['end'] = until;
            params = this.omit (params, 'until');
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "fillId": "b5467d00-b13e-3fa9-8216-dd66735550fc",
        //             "price": "0.09771286",
        //             "quantity": "1.45340410",
        //             "quoteQuantity": "0.14201627",
        //             "time": 1598345638994,
        //             "makerSide": "buy",
        //             "sequence": 3853
        //         }, ...
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public trades
        //  {
        //      "fillId":"a4883704-850b-3c4b-8588-020b5e4c62f1",
        //      "price":"0.20377008",
        //      "quantity":"47.58448728",
        //      "quoteQuantity":"9.69629509",
        //      "time":1642091300873,
        //      "makerSide":"buy",
        //      "type":"hybrid",        // one of either: "orderBook", "hybrid", or "pool"
        //      "sequence":31876
        //  }
        //
        // private trades
        //  {
        //      "fillId":"83429066-9334-3582-b710-78858b2f0d6b",
        //      "price":"0.20717368",
        //      "quantity":"15.00000000",
        //      "quoteQuantity":"3.10760523",
        //      "orderBookQuantity":"0.00000003",
        //      "orderBookQuoteQuantity":"0.00000001",
        //      "poolQuantity":"14.99999997",
        //      "poolQuoteQuantity":"3.10760522",
        //      "time":1642083351215,
        //      "makerSide":"sell",
        //      "sequence":31795,
        //      "market":"IDEX-USDC",
        //      "orderId":"4fe993f0-747b-11ec-bd08-79d4a0b6e47c",
        //      "side":"buy",
        //      "fee":"0.03749989",
        //      "feeAsset":"IDEX",
        //      "gas":"0.40507261",
        //      "liquidity":"taker",
        //      "type":"hybrid",
        //      "txId":"0x69f6d82a762d12e3201efd0b3e9cc1969351e3c6ea3cf07c47c66bf24a459815",
        //      "txStatus":"mined"
        //  }
        //
        const id = this.safeString (trade, 'fillId');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'quantity');
        const costString = this.safeString (trade, 'quoteQuantity');
        const timestamp = this.safeInteger (trade, 'time');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        // this code handles the duality of public vs private trades
        const makerSide = this.safeString (trade, 'makerSide');
        const oppositeSide = (makerSide === 'buy') ? 'sell' : 'buy';
        const side = this.safeString (trade, 'side', oppositeSide);
        const takerOrMaker = this.safeString (trade, 'liquidity', 'taker');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeAsset');
            fee = {
                'cost': feeCostString,
                'currency': this.safeCurrencyCode (feeCurrencyId),
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': 'limit', // todo must be checked
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name idex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs-v4.idex.io/#get-order-books
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'level': 2,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        //     {
        //         "sequence": 228525431,
        //         "bids": [
        //             ["3581.60000000", "11.19600000", 2]
        //         ],
        //         "asks": [
        //             ["3582.50000000", "11.17000000", 1]
        //         ],
        //         "lastPrice": "3581.80000000",
        //         "markPrice": "3581.80000000",
        //         "indexPrice": "3579.30000000"
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'sequence');
        return orderbook;
    }

    /**
     * @method
     * @name idex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-docs-v4.idex.io/#get-funding-rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'until');
        if (until !== undefined) {
            request['end'] = until;
        }
        const response = await this.publicGetFundingRates (this.extend (request, params));
        //
        //     [
        //         {
        //             "fundingRate": "0.00010005",
        //             "indexPrice": "3846.80000000",
        //             "time": 1734508800000
        //         }, ...
        //     ]
        //
        let data = [];
        if (Array.isArray (response)) {
            data = response;
        }
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger (entry, 'time');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return sorted as FundingRateHistory[];
    }

    /**
     * @method
     * @name idex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs-v4.idex.io/#get-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] the wallet address to fetch the balance for
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request: Dict = {
            'nonce': nonce,
        };
        const wallet = this.safeString (params, 'wallet');
        if (wallet !== undefined) {
            request['wallet'] = wallet;
        }
        //
        //     [
        //         {
        //             "wallet": "0x63c678E26a1EaF97f85D96e042fC14f04B186B38",
        //             "equity": "63.07000000",
        //             "freeCollateral": "63.07000000",
        //             "heldCollateral": "0.00000000",
        //             "availableCollateral": "63.07000000",
        //             "buyingPower": "1261.40000000",
        //             "leverage": "0.00000000",
        //             "marginRatio": "0.00000000",
        //             "quoteBalance": "63.07000000",
        //             "unrealizedPnL": "0.00000000",
        //             "makerFeeRate": "-0.00005000",
        //             "takerFeeRate": "0.00030000",
        //             "positions": []
        //         }
        //     ]
        //
        const response = await this.privateGetWallets (this.extend (request, params));
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const responseLength = response.length;
        const entry = response[responseLength - 1];
        const code = this.safeString (this.options, 'defaultSettle');
        const account = this.account ();
        account['total'] = this.safeString (entry, 'availableCollateral');
        account['free'] = this.safeString (entry, 'freeCollateral');
        account['used'] = this.safeString (entry, 'heldCollateral');
        result[code] = account;
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name idex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api-docs-v4.idex.io/#get-fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {
            'nonce': this.uuidv1 (),
            'wallet': this.walletAddress,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // [
        //   {
        //     "fillId": "48582d10-b9bb-3c4b-94d3-e67537cf2472",
        //     "price": "0.09905990",
        //     "quantity": "0.40000000",
        //     "quoteQuantity": "0.03962396",
        //     "time": 1598873478762,
        //     "makerSide": "sell",
        //     "sequence": 5053,
        //     "market": "DIL-ETH",
        //     "orderId": "7cdc8e90-eb7d-11ea-9e60-4118569f6e63",
        //     "side": "buy",
        //     "fee": "0.00080000",
        //     "feeAsset": "DIL",
        //     "gas": "0.00857497",
        //     "liquidity": "taker",
        //     "txId": "0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65",
        //     "txStatus": "mined"
        //   }
        // ]
        const extendedRequest = this.extend (request, params);
        if (extendedRequest['wallet'] === undefined) {
            throw new BadRequest (this.id + ' fetchMyTrades() walletAddress is undefined, set this.walletAddress or "address" in params');
        }
        let response = undefined;
        try {
            response = await this.privateGetFills (extendedRequest);
        } catch (e) {
            if (e instanceof InvalidAddress) {
                const walletAddress = extendedRequest['wallet'];
                await this.associateWallet (walletAddress);
                response = await this.privateGetFills (extendedRequest);
            } else {
                throw e;
            }
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name idex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs-v4.idex.io/#get-orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        const request: Dict = {
            'orderId': id,
        };
        return await this.fetchOrdersHelper (symbol, undefined, undefined, this.extend (request, params)) as Order;
    }

    /**
     * @method
     * @name idex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-docs-v4.idex.io/#get-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const request: Dict = {
            'closed': false,
        };
        return await this.fetchOrdersHelper (symbol, since, limit, this.extend (request, params)) as Order[];
    }

    /**
     * @method
     * @name idex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api-docs-v4.idex.io/#get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const request: Dict = {
            'closed': true,
        };
        return await this.fetchOrdersHelper (symbol, since, limit, this.extend (request, params)) as Order[];
    }

    async fetchOrdersHelper (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'nonce': this.uuidv1 (),
            'wallet': this.walletAddress,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        // fetchClosedOrders / fetchOpenOrders
        // [
        //   {
        //     "market": "DIL-ETH",
        //     "orderId": "7cdc8e90-eb7d-11ea-9e60-4118569f6e63",
        //     "wallet": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //     "time": 1598873478650,
        //     "status": "filled",
        //     "type": "limit",
        //     "side": "buy",
        //     "originalQuantity": "0.40000000",
        //     "executedQuantity": "0.40000000",
        //     "cumulativeQuoteQuantity": "0.03962396",
        //     "avgExecutionPrice": "0.09905990",
        //     "price": "1.00000000",
        //     "fills": [
        //       {
        //         "fillId": "48582d10-b9bb-3c4b-94d3-e67537cf2472",
        //         "price": "0.09905990",
        //         "quantity": "0.40000000",
        //         "quoteQuantity": "0.03962396",
        //         "time": 1598873478650,
        //         "makerSide": "sell",
        //         "sequence": 5053,
        //         "fee": "0.00080000",
        //         "feeAsset": "DIL",
        //         "gas": "0.00857497",
        //         "liquidity": "taker",
        //         "txId": "0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65",
        //         "txStatus": "mined"
        //       }
        //     ]
        //   }
        // ]
        // fetchOrder
        // { market: "DIL-ETH",
        //   "orderId": "7cdc8e90-eb7d-11ea-9e60-4118569f6e63",
        //   "wallet": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //   "time": 1598873478650,
        //   "status": "filled",
        //   "type": "limit",
        //   "side": "buy",
        //   "originalQuantity": "0.40000000",
        //   "executedQuantity": "0.40000000",
        //   "cumulativeQuoteQuantity": "0.03962396",
        //   "avgExecutionPrice": "0.09905990",
        //   "price": "1.00000000",
        //   "fills":
        //    [ { fillId: "48582d10-b9bb-3c4b-94d3-e67537cf2472",
        //        "price": "0.09905990",
        //        "quantity": "0.40000000",
        //        "quoteQuantity": "0.03962396",
        //        "time": 1598873478650,
        //        "makerSide": "sell",
        //        "sequence": 5053,
        //        "fee": "0.00080000",
        //        "feeAsset": "DIL",
        //        "gas": "0.00857497",
        //        "liquidity": "taker",
        //        "txId": "0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65",
        //        "txStatus": "mined" } ] }
        if (Array.isArray (response)) {
            return this.parseOrders (response, market, since, limit) as any;
        } else {
            return this.parseOrder (response, market);
        }
    }

    parseOrderStatus (status: Str) {
        // https://docs.idex.io/#order-states-amp-lifecycle
        const statuses: Dict = {
            'active': 'open',
            'partiallyFilled': 'open',
            'rejected': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "market": "DIL-ETH",
        //         "orderId": "7cdc8e90-eb7d-11ea-9e60-4118569f6e63",
        //         "wallet": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //         "time": 1598873478650,
        //         "status": "filled",
        //         "type": "limit",
        //         "side": "buy",
        //         "originalQuantity": "0.40000000",
        //         "executedQuantity": "0.40000000",
        //         "cumulativeQuoteQuantity": "0.03962396",
        //         "avgExecutionPrice": "0.09905990",
        //         "price": "1.00000000",
        //         "fills": [
        //             {
        //             "fillId": "48582d10-b9bb-3c4b-94d3-e67537cf2472",
        //             "price": "0.09905990",
        //             "quantity": "0.40000000",
        //             "quoteQuantity": "0.03962396",
        //             "time": 1598873478650,
        //             "makerSide": "sell",
        //             "sequence": 5053,
        //             "fee": "0.00080000",
        //             "feeAsset": "DIL",
        //             "gas": "0.00857497",
        //             "liquidity": "taker",
        //             "txId": "0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65",
        //             "txStatus": "mined"
        //             }
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (order, 'time');
        const fills = this.safeList (order, 'fills', []);
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const marketId = this.safeString (order, 'market');
        const side = this.safeString (order, 'side');
        const symbol = this.safeSymbol (marketId, market, '-');
        const type = this.safeString (order, 'type');
        const amount = this.safeString (order, 'originalQuantity');
        const filled = this.safeString (order, 'executedQuantity');
        const average = this.safeString (order, 'avgExecutionPrice');
        const price = this.safeString (order, 'price');
        const rawStatus = this.safeString (order, 'status');
        const timeInForce = this.safeStringUpper (order, 'timeInForce');
        const status = this.parseOrderStatus (rawStatus);
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': fills,
        }, market);
    }

    async associateWallet (walletAddress, params = {}) {
        const nonce = this.uuidv1 ();
        const noPrefix = this.remove0xPrefix (walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (noPrefix),
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        // {
        //   "address": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //   "totalPortfolioValueUsd": "0.00",
        //   "time": 1598468353626
        // }
        const request: Dict = {
            'parameters': {
                'nonce': nonce,
                'wallet': walletAddress,
            },
            'signature': signature,
        };
        const result = await this.privatePostWallets (request);
        return result;
    }

    /**
     * @method
     * @name idex#createOrder
     * @description create a trade order, https://docs.idex.io/#create-order
     * @see https://api-docs-v4.idex.io/#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'stopLossMarket', 'stopLossLimit', 'takeProfitMarket', or 'takeProfitLimit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] the wallet address to create the order for
     * @param {string} [params.delegatedKey] delegated key public address if authorized via delegated key
     * @param {string} [params.triggerPrice] the price at which the stop loss or take profit order is to be triggered, in units of the quote currency
     * @param {string} [params.stopLossPrice] the price at which the stop loss order is to be triggered, in units of the quote currency
     * @param {string} [params.takeProfitPrice] the price at which the take profit order is to be triggered, in units of the quote currency
     * @param {string} [params.triggerType] 'last' or 'index', default is 'last'
     * @param {string} [params.clientOrderId] a unique identifier for the order, automatically generated if not provided
     * @param {bool} [params.reduceOnly] if true, the order will only reduce your position, not increase it (default is false)
     * @param {string} [params.timeInForce] 'GTC', 'IOK', 'FOK' or 'GTX' (post-only) default is 'GTC'
     * @param {string} [params.postOnly] if true, the order will only be placed if it would not execute immediately
     * @param {string} [params.selfTradePrevention] 'dc', 'co', 'cn', or 'cb', default is 'dc', must be cn if fok timeInForce is specified
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        let wallet = this.walletAddress;
        [ wallet, params ] = this.handleOptionAndParams (params, 'createOrder', 'wallet', wallet);
        const order: Dict = {
            'nonce': this.uuidv1 (),
            'wallet': wallet,
            'market': market['id'],
            'side': side.toLowerCase (),
            'quantity': this.amountToPrecision (symbol, amount),
            'reduceOnly': this.safeBool (params, 'reduceOnly', false),
        };
        let delegatedKey = undefined;
        [ delegatedKey, params ] = this.handleOptionAndParams (params, 'createOrder', 'delegatedKey');
        if (delegatedKey !== undefined) {
            order['delegatedKey'] = delegatedKey;
        }
        let triggerPrice = this.safeString (params, 'triggerPrice');
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if ((type === 'market') || (type === 'limit')) {
            if (triggerPrice !== undefined) {
                throw new BadRequest (this.id + ' createOrder() triggerPrice is supported with stopLossMarket, stopLossLimit, takeProfitMarket, or takeProfitLimit types only');
            } else if (stopLossPrice !== undefined) {
                type = 'stopLoss' + this.capitalize (type);
                triggerPrice = stopLossPrice;
            } else if (takeProfitPrice !== undefined) {
                type = 'takeProfit' + this.capitalize (type);
                triggerPrice = takeProfitPrice;
            }
        }
        order['type'] = type;
        if (triggerPrice !== undefined) {
            order['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            let triggerType = 'last';
            [ triggerType, params ] = this.handleOptionAndParams (params, 'createOrder', 'triggerType', triggerType);
            order['triggerType'] = triggerType;
        }
        const isLimitOrder = (type === 'limit') || (type === 'stopLossLimit') || (type === 'takeProfitLimit');
        const isMarketOrder = (type === 'market') || (type === 'stopLossMarket') || (type === 'takeProfitMarket');
        if (price !== undefined) {
            if (isMarketOrder) {
                throw new BadRequest (this.id + ' createOrder() price is supported with limit, stopLossLimit, or takeProfitLimit types only');
            }
            order['price'] = this.priceToPrecision (symbol, price);
        } else if (isLimitOrder) {
            throw new BadRequest (this.id + ' createOrder() price is required with limit, stopLossLimit, or takeProfitLimit types');
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            order['clientOrderId'] = clientOrderId;
        }
        let timeInForce = this.safeStringLower (params, 'timeInForce');
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, timeInForce === 'gtx', params);
        if (postOnly) {
            timeInForce = 'gtx';
        }
        if (timeInForce !== undefined) {
            order['timeInForce'] = timeInForce;
        }
        const selfTradePrevention = this.safeStringLower (params, 'selfTradePrevention');
        const isFillOrKill = timeInForce === 'fok';
        if (selfTradePrevention !== undefined) {
            if (isFillOrKill && (selfTradePrevention !== 'cn')) {
                throw new BadRequest (this.id + ' createOrder() selfTradePrevention must be "cn" if timeInForce is "FOK"');
            } else {
                order['selfTradePrevention'] = selfTradePrevention;
            }
        } else if (isFillOrKill) {
            order['selfTradePrevention'] = 'cn';
        }
        const signature = this.generateSignatureForCreateOrder (order);
        const request: Dict = {
            'parameters': order,
            'signature': signature,
        };
        //
        // we don't use extend here because it is a signed endpoint
        const response = await this.privatePostOrders (request);
        return this.parseOrder (response, market);
    }

    generateSignatureForCreateOrder (order) {
        // https://api-docs-v4.idex.io/#authentication
        const nonce = order['nonce'];
        const wallet = this.safeString (order, 'wallet');
        const walletBytes = this.remove0xPrefix (wallet);
        const market = this.safeString (order, 'market');
        const type = this.safeString (order, 'type');
        // https://api-docs-v4.idex.io/#wallet-signature-hash-enums
        const typeEnums: Dict = {
            'market': 0,
            'limit': 1,
            'stopLossMarket': 2,
            'stopLossLimit': 3,
            'takeProfitMarket': 4,
            'takeProfitLimit': 5,
        };
        if (!(type in typeEnums)) {
            throw new BadRequest (this.id + ' createOrder() invalid order type: ' + type + ' (limit, market, stopLossMarket, stopLossLimit, takeProfitMarket, takeProfitLimit types are supported only)');
        }
        const typeEnum = typeEnums[type];
        const side = this.safeString (order, 'side');
        const sideEnums: Dict = {
            'buy': 0,
            'sell': 1,
        };
        if (!(side in sideEnums)) {
            throw new BadRequest (this.id + ' createOrder() invalid order side: ' + side + ' (buy or sell sides are supported only)');
        }
        const sideEnum = sideEnums[side];
        const quantity = this.safeString (order, 'quantity');
        const price = this.safeString (order, 'price', '0.00000000');
        const triggerPrice = this.safeString (order, 'triggerPrice', '0.00000000');
        const triggerTypeEnums: Dict = {
            'none': 0,
            'last': 1,
            'index': 2,
        };
        const triggerType = this.safeString (order, 'triggerType', 'none');
        if (!(triggerType in triggerTypeEnums)) {
            throw new BadRequest (this.id + ' createOrder() invalid triggerType: ' + triggerType + ' (last or index are supported only)');
        }
        const triggerTypeEnum = triggerTypeEnums[triggerType];
        const callbackRate = '0.00000000'; // unused
        const conditionalOrderId = 0; // unused
        const reduceOnly = this.safeBool (order, 'reduceOnly', false);
        const reduceOnlyEnum = reduceOnly ? 1 : 0;
        const timeInForceEnums: Dict = {
            'gtc': 0,
            'gtx': 1,
            'ioc': 2,
            'fok': 3,
        };
        const timeInForce = this.safeString (order, 'timeInForce', 'gtc');
        if (!(timeInForce in timeInForceEnums)) {
            throw new BadRequest (this.id + ' createOrder() invalid timeInForce: ' + timeInForce + ' (GTC, GTX, IOC, FOK are supported only)');
        }
        const timeInForceEnum = timeInForceEnums[timeInForce];
        const selfTradePreventionEnums: Dict = {
            'dc': 0,
            'co': 1,
            'cn': 2,
            'cb': 3,
        };
        const selfTradePrevention = this.safeString (order, 'selfTradePrevention', 'dc');
        if (!(selfTradePrevention in selfTradePreventionEnums)) {
            throw new BadRequest (this.id + ' createOrder() invalid selfTradePrevention: ' + selfTradePrevention + ' (dc, co, cn, cb are supported only)');
        }
        const selfTradePreventionEnum = selfTradePreventionEnums[selfTradePrevention];
        const isLiquidationAcquisitionOnlyInt = 0; // false - unused
        // const delegatedPublicKey = this.safeString (order, 'delegatedKey', '0x0');
        // const delegatedPublicKeyBytes = this.remove0xPrefix (delegatedPublicKey);
        const clientOrderId = this.safeString (order, 'clientOrderId', '');
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.encode (market),
            this.numberToBE (typeEnum, 1),
            this.numberToBE (sideEnum, 1),
            this.encode (quantity),
            this.encode (price),
            this.encode (triggerPrice),
            this.numberToBE (triggerTypeEnum, 1),
            this.encode (callbackRate),
            this.numberToBE (conditionalOrderId, 8),
            this.numberToBE (reduceOnlyEnum, 1),
            this.numberToBE (timeInForceEnum, 1),
            this.numberToBE (selfTradePreventionEnum, 1),
            this.numberToBE (isLiquidationAcquisitionOnlyInt, 1),
            // this.base16ToBinary (delegatedPublicKeyBytes), todo handle with delegatedKey
            this.encode (clientOrderId),
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        return signature;
    }

    /**
     * @method
     * @name idex#withdraw
     * @description make a withdrawal
     * @see https://api-docs-v4.idex.io/#withdraw-funds
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const amountString = this.currencyToPrecision (code, amount);
        const currency = this.currency (code);
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.encode (currency['id']),
            this.encode (amountString),
            this.numberToBE (1, 1), // bool set to true
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        const request: Dict = {
            'parameters': {
                'nonce': nonce,
                'wallet': address,
                'asset': currency['id'],
                'quantity': amountString,
            },
            'signature': signature,
        };
        const response = await this.privatePostWithdrawals (request);
        //
        //     {
        //         "withdrawalId": "a61dcff0-ec4d-11ea-8b83-c78a6ecb3180",
        //         "asset": "ETH",
        //         "assetContractAddress": "0x0000000000000000000000000000000000000000",
        //         "quantity": "0.20000000",
        //         "time": 1598962883190,
        //         "fee": "0.00024000",
        //         "txStatus": "pending",
        //         "txId": null
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    /**
     * @method
     * @name idex#cancelAllOrders
     * @description cancel all open orders
     * @see https://api-docs-v4.idex.io/#cancel-order
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const nonce = this.uuidv1 ();
        const request: Dict = {
            'parameters': {
                'nonce': nonce,
                'wallet': this.walletAddress,
            },
        };
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
        ];
        if (market !== undefined) {
            byteArray.push (this.encode (market['id']));
            request['parameters']['market'] = market['id'];
        }
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        request['signature'] = signature;
        // [ { orderId: "688336f0-ec50-11ea-9842-b332f8a34d0e" } ]
        const response = await this.privateDeleteOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    /**
     * @method
     * @name idex#cancelOrder
     * @description cancels an open order
     * @see https://api-docs-v4.idex.io/#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const nonce = this.uuidv1 ();
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.encode (id),
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        const request: Dict = {
            'parameters': {
                'nonce': nonce,
                'wallet': this.walletAddress,
                'orderId': id,
            },
            'signature': signature,
        };
        // [ { orderId: "688336f0-ec50-11ea-9842-b332f8a34d0e" } ]
        const response = await this.privateDeleteOrders (this.extend (request, params));
        const canceledOrder = this.safeDict (response, 0);
        return this.parseOrder (canceledOrder, market);
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if (errorCode !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, message);
            throw new ExchangeError (this.id + ' ' + message);
        }
        return undefined;
    }

    /**
     * @method
     * @name idex#fetchDeposit
     * @description fetch information on a deposit
     * @see https://api-docs-v4.idex.io/#get-deposits
     * @param {string} id deposit id
     * @param {string} code not used by idex fetchDeposit ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposit (id: string, code: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request: Dict = {
            'nonce': nonce,
            'wallet': this.walletAddress,
            'depositId': id,
        };
        const response = await this.privateGetDeposits (this.extend (request, params));
        //
        //     {
        //         "depositId": "82b44a70-cc23-11ef-b8de-9990667b52c0",
        //         "asset": "USDC",
        //         "quantity": "30.00000000",
        //         "bridgeSource": "stargate.ethereum",
        //         "time":1736163836056,
        //         "bridgeTxId": "0xcf3fe7b1c717e21ccf4381539064b4a0c0f990fa7816382e0ff30af986392b81",
        //         "xchainTxId": "0xfaa73a0c19b91934759f4831a94b3edcaac49ac40af2bc486240365d5dfd9826"
        //     }
        //
        return this.parseTransaction (response);
    }

    /**
     * @method
     * @name idex#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api-docs-v4.idex.io/#get-deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        params = this.extend ({
            'method': 'privateGetDeposits',
        }, params);
        //
        //     [
        //         {
        //             "depositId": "82b44a70-cc23-11ef-b8de-9990667b52c0",
        //             "asset": "USDC",
        //             "quantity": "30.00000000",
        //             "bridgeSource": "stargate.ethereum",
        //             "time":1736163836056,
        //             "bridgeTxId": "0xcf3fe7b1c717e21ccf4381539064b4a0c0f990fa7816382e0ff30af986392b81",
        //             "xchainTxId": "0xfaa73a0c19b91934759f4831a94b3edcaac49ac40af2bc486240365d5dfd9826"
        //         },
        //         {
        //             "depositId": "feb34d60-cc23-11ef-b8de-9990667b52c0",
        //             "asset": "USDC",
        //             "quantity": "33.07000000",
        //             "bridgeSource": "stargate.ethereum",
        //             "time":1736164044086,
        //             "bridgeTxId": "0xa42a14e7b5c907a42c43a148df679e3ac977608bb6793fccd5d0e9963e6f52a3",
        //             "xchainTxId": "0xb58a46bc7bfe602bc53d4985781586c496c540596084e3e825431cb7d8b36f9e"
        //         }
        //     ]
        //
        return await this.fetchTransactionsHelper (code, since, limit, params);
    }

    /**
     * @method
     * @name idex#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://api-docs-v4.idex.io/#get-ping
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.publicGetPing (params);
        return {
            'status': 'ok', // if there's no Errors, status = 'ok'
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name idex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api-docs-v4.idex.io/#get-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //    { serverTime: "1655258263236" }
        //
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name idex#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://api-docs-v4.idex.io/#get-withdrawals
     * @param {string} id withdrawal id
     * @param {string} code not used by idex.fetchWithdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawal (id: string, code: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request: Dict = {
            'nonce': nonce,
            'wallet': this.walletAddress,
            'withdrawalId': id,
        };
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        return this.parseTransaction (response);
    }

    /**
     * @method
     * @name idex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://api-docs-v4.idex.io/#get-withdrawals
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        params = this.extend ({
            'method': 'privateGetWithdrawals',
        }, params);
        return await this.fetchTransactionsHelper (code, since, limit, params);
    }

    async fetchTransactionsHelper (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request: Dict = {
            'nonce': nonce,
            'wallet': this.walletAddress,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['end'] = until;
            params = this.omit (params, 'until');
        }
        const method = params['method'];
        params = this.omit (params, 'method');
        let response = undefined;
        if (method === 'privateGetDeposits') {
            response = await this.privateGetDeposits (this.extend (request, params));
        } else if (method === 'privateGetWithdrawals') {
            response = await this.privateGetWithdrawals (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchTransactionsHelper() not support this method');
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //
        //     {
        //         "depositId": "82b44a70-cc23-11ef-b8de-9990667b52c0",
        //         "asset": "USDC",
        //         "quantity": "30.00000000",
        //         "bridgeSource": "stargate.ethereum",
        //         "time":1736163836056,
        //         "bridgeTxId": "0xcf3fe7b1c717e21ccf4381539064b4a0c0f990fa7816382e0ff30af986392b81",
        //         "xchainTxId": "0xfaa73a0c19b91934759f4831a94b3edcaac49ac40af2bc486240365d5dfd9826"
        //     }
        //
        // fetchWithdrwalas
        //
        //     {
        //         "withdrawalId": "a62d8760-ec4d-11ea-9fa6-47904c19499b",
        //         "asset": "ETH",
        //         "assetContractAddress": "0x0000000000000000000000000000000000000000",
        //         "quantity": "0.20000000",
        //         "time": 1598962883288,
        //         "fee": "0.00024000",
        //         "txId": "0x305e9cdbaa85ad029f50578d13d31d777c085de573ed5334d95c19116d8c03ce",
        //         "txStatus": "mined"
        //     }
        //
        // withdraw
        //
        //     {
        //         "withdrawalId": "a61dcff0-ec4d-11ea-8b83-c78a6ecb3180",
        //         "asset": "ETH",
        //         "assetContractAddress": "0x0000000000000000000000000000000000000000",
        //         "quantity": "0.20000000",
        //         "time": 1598962883190,
        //         "fee": "0.00024000",
        //         "txStatus": "pending",
        //         "txId": null
        //     }
        //
        let type = undefined;
        if ('depositId' in transaction) {
            type = 'deposit';
        } else if (('withdrawId' in transaction) || ('withdrawalId' in transaction)) {
            type = 'withdrawal';
        }
        let id = this.safeString2 (transaction, 'depositId', 'withdrawId');
        id = this.safeString (transaction, 'withdrawalId', id);
        const code = this.safeCurrencyCode (this.safeString (transaction, 'asset'), currency);
        const amount = this.safeNumber (transaction, 'quantity');
        const txid = this.safeString2 (transaction, 'txId', 'xchainTxId');
        const timestamp = this.safeInteger2 (transaction, 'txTime', 'time');
        let fee = undefined;
        if ('fee' in transaction) {
            fee = {
                'cost': this.safeNumber (transaction, 'fee'),
                'currency': 'ETH',
            };
        }
        const rawStatus = this.safeString (transaction, 'txStatus');
        const status = this.parseTransactionStatus (rawStatus);
        const updated = this.safeInteger (transaction, 'confirmationTime');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
        } as Transaction;
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'mined': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name idex#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://api-docs-v4.idex.io/#get-gas-fees
     * @param {string[]|undefined} codes not used by binance fetchDepositWithdrawFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees (codes: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetGasFees (params);
        //
        //     {
        //         "withdrawal": {
        //             "xchain.xchain": "0.05000000",
        //             "stargate.arbitrum": "0.07648418",
        //             "stargate.base": "0.07453254",
        //             "stargate.bnb": "0.35694860",
        //             "stargate.ethereum": "8.11213457",
        //             "stargate.mantle": "0.09499113",
        //             "stargate.optimism": "0.04842092",
        //             "stargate.polygon": "0.05420854",
        //             "stargate.sei": "0.01914629"
        //         }
        //     }
        //
        const withdrawal = this.safeDict (response, 'withdrawal', {});
        return this.parseDepositWithdrawFees (withdrawal, codes, 'coin');
    }

    parseDepositWithdrawFee (fee, currency: Currency = undefined) {
        //
        //     {
        //         "xchain.xchain": "0.05000000",
        //         "stargate.arbitrum": "0.07648418",
        //         "stargate.base": "0.07453254",
        //         "stargate.bnb": "0.35694860",
        //         "stargate.ethereum": "8.11213457",
        //         "stargate.mantle": "0.09499113",
        //         "stargate.optimism": "0.04842092",
        //         "stargate.polygon": "0.05420854",
        //         "stargate.sei": "0.01914629"
        //     }
        //
        // todo should make the name of the network as ccxt unified network name
        return {
            'withdraw': {
                'fee': this.parseNumber (fee),
                'percentage': undefined,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
            'info': fee,
        };
    }

    calculateRateLimiterCost (api, method, path, params, config = {}) {
        let cost = this.safeNumber (config, 'cost', 1);
        const bundled = this.safeNumber (config, 'bundled');
        const limit = this.safeNumber (params, 'limit');
        if ((bundled !== undefined) && (limit !== undefined) && (limit > 100)) {
            cost = bundled;
        } else if (api === 'public') {
            const signed = this.checkRequiredCredentials (false);
            if (!signed) {
                cost = cost * 2;
            }
        }
        return cost;
    }

    /**
     * @method
     * @name idex#fetchDepositAddress
     * @description fetch the Polygon address of the wallet
     * @see https://api-docs-v4.idex.io/#get-wallets
     * @param {string} code not used by idex
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: Str = undefined, params = {}): Promise<DepositAddress> {
        const request: Dict = {};
        request['nonce'] = this.uuidv1 ();
        const response = await this.privateGetWallets (this.extend (request, params));
        //
        //     [
        //         {
        //             "wallet": "0x63c678E26a1EaF97f85D96e042fC14f04B186B38",
        //             "equity": "63.07000000",
        //             "freeCollateral": "63.07000000",
        //             "heldCollateral": "0.00000000",
        //             "availableCollateral": "63.07000000",
        //             "buyingPower": "1261.40000000",
        //             "leverage": "0.00000000",
        //             "marginRatio": "0.00000000",
        //             "quoteBalance": "63.07000000",
        //             "unrealizedPnL": "0.00000000",
        //             "makerFeeRate": "-0.00005000",
        //             "takerFeeRate": "0.00030000",
        //             "positions": []
        //         }
        //     ]
        //
        return this.parseDepositAddress (response);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined): DepositAddress {
        //
        //     [
        //         {
        //             "wallet": "0x63c678E26a1EaF97f85D96e042fC14f04B186B38",
        //             "equity": "63.07000000",
        //             "freeCollateral": "63.07000000",
        //             "heldCollateral": "0.00000000",
        //             "availableCollateral": "63.07000000",
        //             "buyingPower": "1261.40000000",
        //             "leverage": "0.00000000",
        //             "marginRatio": "0.00000000",
        //             "quoteBalance": "63.07000000",
        //             "unrealizedPnL": "0.00000000",
        //             "makerFeeRate": "-0.00005000",
        //             "takerFeeRate": "0.00030000",
        //             "positions": []
        //         }
        //     ]
        //
        const length = depositAddress.length;
        const entry = this.safeDict (depositAddress, length - 1);
        const address = this.safeString (entry, 'wallet');
        this.checkAddress (address);
        return {
            'info': depositAddress,
            'currency': this.options['defaultSettle'], // todo check if it's correct
            'network': undefined,
            'address': address,
            'tag': undefined,
        } as DepositAddress;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString (this.options, 'version', 'v4');
        let url = this.urls['api']['api'] + '/' + version + '/' + path;
        const keys = Object.keys (params);
        const length = keys.length;
        let query = undefined;
        if (length > 0) {
            if (method === 'GET') {
                query = this.urlencode (params);
                url = url + '?' + query;
            } else {
                body = this.json (params);
            }
        }
        headers = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey !== undefined) {
            headers['IDEX-API-Key'] = this.apiKey;
        }
        if (api === 'private') {
            let payload = undefined;
            if (method === 'GET') {
                payload = query;
            } else {
                payload = body;
            }
            headers['IDEX-HMAC-Signature'] = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    remove0xPrefix (hexData) {
        if (hexData.slice (0, 2) === '0x') {
            return hexData.slice (2);
        } else {
            return hexData;
        }
    }

    hashMessage (message) {
        // takes a hex encoded message
        const binaryMessage = this.base16ToBinary (this.remove0xPrefix (message));
        const prefix = this.encode ('\x19Ethereum Signed Message:\n' + binaryMessage.byteLength);
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), keccak, 'hex');
    }

    signHash (hash, privateKey) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': 27 + signature['v'],
        };
    }

    signMessage (message, privateKey) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    signMessageString (message, privateKey) {
        // still takes the input as a hex string
        // same as above but returns a string instead of an object
        const signature = this.signMessage (message, privateKey);
        return signature['r'] + this.remove0xPrefix (signature['s']) + this.binaryToBase16 (this.numberToBE (signature['v'], 1));
    }
}
