
// ----------------------------------------------------------------------------

import { sha256, sha512 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/bit2me.js';
import { ExchangeError, AuthenticationError, BadRequest, BadSymbol, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Currencies, CurrencyInterface, Dict, Endpoint, Int, List, Market, NullableDict, OHLCV, OrderBook, Str, Strings, Ticker, Tickers, Trade, int } from './base/types.js';

// ----------------------------------------------------------------------------

/**
 * @class bit2me
 * @augments Exchange
 */
export default class bit2me extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bit2me',
            'name': 'Bit2Me',
            'countries': [ 'ES' ], // Spain
            'rateLimit': 100, // 600 requests per minute on the starter tier
            'version': 'v1',
            'certified': false,
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
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
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
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': '1440',
            },
            'urls': {
                'logo': 'https://api.bit2me.com/icon.png', // todo: replace with a github-hosted banner
                'api': {
                    'public': 'https://gateway.bit2me.com',
                    'private': 'https://gateway.bit2me.com',
                },
                'www': 'https://bit2me.com/',
                'doc': [
                    'https://api.bit2me.com/docs/pro/overview',
                    'https://api.bit2me.com/docs',
                ],
                'fees': 'https://bit2me.com/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'v2/trading/market-config': { 'cost': 1 } as Endpoint<List>,
                        'v2/trading/tickers': { 'cost': 1 } as Endpoint<List>,
                        'v2/trading/order-book': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/candle': { 'cost': 1 } as Endpoint<List>,
                        'v1/trading/trade/last': { 'cost': 1 } as Endpoint<List>,
                        'v2/currency/assets': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/currency/assets/{symbol}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/wallet/settings/assets': { 'cost': 1 } as Endpoint<List>,
                    },
                },
                'private': {
                    'get': {
                        'v1/trading/order': { 'cost': 1 } as Endpoint<List>,
                        'v1/trading/order/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/order/{id}/trades': { 'cost': 1 } as Endpoint<List>,
                        'v1/trading/trade': { 'cost': 1 } as Endpoint<List>,
                        'v1/trading/wallet/balance': { 'cost': 1 } as Endpoint<List>,
                        'v1/trading/working-capital': { 'cost': 1 } as Endpoint<List>,
                        'v1/trading/movement': { 'cost': 1 } as Endpoint<List>,
                    },
                    'post': {
                        'v1/trading/order': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/wallet/deposit': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/wallet/withdraw': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/signin/apikey': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'v1/trading/order/{id}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0016'),
                    'taker': this.parseNumber ('0.0026'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': undefined,
                    'fetchOpenOrders': undefined,
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
            'options': {
                'fetchCurrencies': {
                    'includeTestnet': false,
                },
                'networks': {
                    'BTC': 'BITCOIN',
                    'ERC20': 'ETHEREUM (ERC20)',
                    'SOL': 'SOLANA',
                    'BSC': 'binanceSmartChain',
                    'BASE': 'BASE',
                    'MATIC': 'POLYGON',
                    'TRC20': 'TRON',
                    'AVAX': 'AVALANCHE',
                    'TON': 'TONCOIN',
                    'ARBITRUM': 'ARBITRUM',
                    'SUI': 'SUI',
                    'KSM': 'KUSAMA',
                },
                'networksById': {
                    'BITCOIN': 'BTC',
                    'ETHEREUM (ERC20)': 'ERC20',
                    'ethereum': 'ERC20',
                    'SOLANA': 'SOL',
                    'binanceSmartChain': 'BSC',
                    'BASE': 'BASE',
                    'POLYGON': 'MATIC',
                    'TRON': 'TRC20',
                    'AVALANCHE': 'AVAX',
                    'TONCOIN': 'TON',
                    'ARBITRUM': 'ARBITRUM',
                    'SUI': 'SUI',
                    'KUSAMA': 'KSM',
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // http status codes returned in the body
                    '400': BadRequest, // invalid or missing fields
                    '401': AuthenticationError, // hmac or clock problem
                    '403': AuthenticationError, // {"code":403,"description":"invalid credentials"}
                    '404': BadRequest, // {"statusCode":404,"error":"Not Found","message":"Market not found for symbol FOO/BAR"}
                    '406': ExchangeError, // business rule violation
                    '412': InvalidOrder, // price or amount outside market min/max
                    '417': BadRequest, // amount too low or too high
                    '418': PermissionDenied, // api ban after rate-limit abuse
                    '420': AuthenticationError, // invalid 2fa
                    '423': PermissionDenied, // operation blocked
                    '428': AuthenticationError, // step-up (totp) required
                    '429': RateLimitExceeded,
                    '500': ExchangeNotAvailable,
                    '502': ExchangeNotAvailable,
                    // order rejection codes
                    'AMOUNT_PRECISION_EXCEEDED': InvalidOrder,
                    'BUY_PRICE_IS_ABOVE_INITIAL_PRICE': InvalidOrder,
                    'BUY_STOP_PRICE_IS_BELOW_INITIAL_PRICE': InvalidOrder,
                    'CREATE_ORDERS_DISABLED_TEMPORALLY': OnMaintenance,
                    'CURRENCY_NOT_SUPPORTED': BadRequest,
                    'DELETE_CLOSED_ORDER': OrderNotFound,
                    'DELETE_ORDERS_DISABLED_TEMPORALLY': OnMaintenance,
                    'DEPOSITS_DISABLED_TEMPORALLY': OnMaintenance,
                    'ERROR_CREATING_INTERNAL_ORDER': ExchangeError,
                    'ERROR_CREATING_ORDER': ExchangeError,
                    'MARKET_CONFIG_NOT_FOUND': BadSymbol,
                    'MAX_CREATED_ORDERS_REACHED': RateLimitExceeded,
                    'MAX_OPEN_ORDERS_REACHED': InvalidOrder,
                    'MISSING_FROM_POCKET_ID': BadRequest,
                    'NOT_ENOUGH_BALANCE': InsufficientFunds,
                    'NOT_ENOUGH_LIQUIDITY': InvalidOrder,
                    'ONLY_LIMIT_ORDERS_ALLOWED': InvalidOrder,
                    'ORDER_AMOUNT_GREATER_MARKET_MAX': InvalidOrder,
                    'ORDER_AMOUNT_GREATER_TOTAL_AMOUNT_IN_PURCHASE': InvalidOrder,
                    'ORDER_AMOUNT_GREATER_TOTAL_AMOUNT_IN_SALE': InvalidOrder,
                    'ORDER_AMOUNT_LOWER_EQUAL_ZERO': InvalidOrder,
                    'ORDER_AMOUNT_LOWER_MARKET_MIN': InvalidOrder,
                    'ORDER_PRICE_LOWER_EQUAL_ZERO': InvalidOrder,
                    'ORDER_SIZE_LOWER_MARKET_MIN': InvalidOrder,
                    'ORDER_STOP_PRICE_LOWER_EQUAL_ZERO': InvalidOrder,
                    'PRICE_GREATER_MARKET_MAX': InvalidOrder,
                    'PRICE_LOWER_MARKET_MIN': InvalidOrder,
                    'PRICE_PRECISION_EXCEEDED': InvalidOrder,
                    'SELL_PRICE_IS_BELOW_INITIAL_PRICE': InvalidOrder,
                    'SELL_STOP_PRICE_IS_ABOVE_INITIAL_PRICE': InvalidOrder,
                    'TIME_IN_FORCE_INVALID': InvalidOrder,
                    'TRADING_WALLET_NOT_BALANCE': InsufficientFunds,
                    'TRADING_WALLET_NOT_FOUND': ExchangeError,
                    'USER_IS_ALREADY_CREATING_ORDER': ExchangeError,
                    'WITHDRAWS_DISABLED_TEMPORALLY': OnMaintenance,
                },
                'broad': {
                    'Market not found': BadSymbol, // {"statusCode":404,"error":"Not Found","message":"Market not found for symbol FOO/BAR"}
                    'invalid credentials': AuthenticationError, // {"code":403,"description":"invalid credentials"}
                    'Validation errors': BadRequest, // {"message":"Validation errors","errors":[...]}
                    'Invalid parameter': BadRequest,
                },
            },
        });
    }

    /**
     * @method
     * @name bit2me#fetchMarkets
     * @description retrieves data on all markets for bit2me
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/market-config/get
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marketEnabled] filter by market state, one of 'enabled', 'enabled_at', 'frozen', 'restricted'
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const response = await this.publicGetV2TradingMarketConfig (params);
        //
        //     [
        //         {
        //             "id": "5daf7851-c883-4e34-ad1a-52a8bb7651e3",
        //             "symbol": "BTC/EUR",
        //             "marketEnabled": "enabled",
        //             "marketEnabledAt": null,
        //             "minAmount": 0.00006,
        //             "maxAmount": 20,
        //             "minPrice": 7500,
        //             "maxPrice": 7500000,
        //             "minOrderSize": 1,
        //             "tickSize": 0.1,
        //             "initialPrice": 0,
        //             "pricePrecision": 1,
        //             "amountPrecision": 8,
        //             "feeMakerPercentage": 0,
        //             "feeTakerPercentage": 0
        //         }
        //     ]
        //
        return this.parseMarkets (response);
    }

    override parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'symbol', '');
        const parts = id.split ('/');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const status = this.safeString (market, 'marketEnabled');
        const fees = this.fees;
        return this.safeMarketStructure ({
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
            'active': (status === 'enabled'),
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': fees['trading']['taker'],
            'maker': fees['trading']['maker'],
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'amountPrecision'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision'))),
                'cost': undefined,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'minAmount'),
                    'max': this.safeNumber (market, 'maxAmount'),
                },
                'price': {
                    'min': this.safeNumber (market, 'minPrice'),
                    'max': this.safeNumber (market, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'minOrderSize'),
                    'max': undefined,
                },
            },
            'created': this.parse8601 (this.safeString (market, 'marketEnabledAt')),
            'info': market,
        });
    }

    /**
     * @method
     * @name bit2me#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api.bit2me.com/docs/wallet/rest-overview
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.includeTestnet] default false, when true testnet assets are included
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        const [ includeTestnet, query ] = this.handleOptionBoolAndParams (params, 'fetchCurrencies', 'includeTestnet', false);
        const request: Dict = {
            'includeTestnet': (includeTestnet) ? 'true' : 'false',
        };
        const promises = [
            this.publicGetV2CurrencyAssets (this.extend (request, query)),
            this.publicGetV1WalletSettingsAssets (query),
        ];
        const responses = await Promise.all (promises);
        //
        // assets
        //
        //     {
        //         "BTC": {
        //             "symbol": "BTC",
        //             "name": "Bitcoin",
        //             "slug": "bitcoin",
        //             "mainwebUri": "bitcoin",
        //             "uriScheme": "bitcoin",
        //             "hexColor": "#eca24d",
        //             "assetType": "currency",
        //             "addressRegex": "^([13][a-km-zA-HJ-NP-Z1-9]{25,34})|...",
        //             "hasImage": true,
        //             "hasPaymentRequest": true,
        //             "isERC20Token": false,
        //             "image": "/crypto-icons/v8/svg/btc-circle-solid-default.svg",
        //             "network": "BITCOIN",
        //             "enabled": true,
        //             "lite": false,
        //             "pairsWith": [ "EUR" ],
        //             "ticker": true,
        //             "loanable": true,
        //             "exponent": 8, // optional
        //             "createdAt": "2024-10-08", // optional
        //             "removedAt": "2025-05-22T00:00:00.000Z" // optional, set for delisted assets
        //         }
        //     }
        //
        // wallet settings
        //
        //     [
        //         {
        //             "symbol": "BTC",
        //             "actions": [ "deposit", "deposit-app", "deposit-web", "earn", "instant", "purchase", "transfer", "withdrawal" ]
        //         }
        //     ]
        //
        const assets = this.safeDict (responses, 0, {});
        const settings = this.safeList (responses, 1, []);
        const settingsById = this.indexBy (settings, 'symbol');
        const ids = Object.keys (assets);
        const result: Dict = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const asset = this.safeDict (assets, id, {});
            const assetSettings = this.safeDict (settingsById, id, {});
            // an operation that is not listed for an asset is not available for it
            const actions = this.safeList (assetSettings, 'actions', []);
            const currency = this.parseCurrency (this.extend (asset, { 'actions': actions }));
            const code = currency['code'];
            result[code] = currency;
        }
        return result;
    }

    override parseCurrency (rawCurrency: Dict): CurrencyInterface {
        const id = this.safeString (rawCurrency, 'symbol');
        const code = this.safeCurrencyCode (id);
        const assetType = this.safeString (rawCurrency, 'assetType');
        const enabled = this.safeBool (rawCurrency, 'enabled', false);
        const removedAt = this.safeString (rawCurrency, 'removedAt');
        const active = enabled && (removedAt === undefined);
        const actions = this.safeList (rawCurrency, 'actions', []);
        const deposit = this.inArray ('deposit', actions);
        const withdraw = this.inArray ('withdrawal', actions);
        const precision = this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'exponent')));
        const networks: Dict = {};
        const networkId = this.safeString (rawCurrency, 'network');
        const networkCode = this.networkIdToCode (networkId, code);
        if (networkCode !== undefined) {
            networks[networkCode] = {
                'info': rawCurrency,
                'id': networkId,
                'network': networkCode,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return this.safeCurrencyStructure ({
            'info': rawCurrency,
            'id': id,
            'code': code,
            'name': this.safeString (rawCurrency, 'name'),
            'active': active,
            'deposit': deposit,
            'withdraw': withdraw,
            'networks': networks,
            'fee': undefined,
            'precision': precision,
            'type': (assetType === 'fiat') ? 'fiat' : 'crypto',
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
        });
    }

    /**
     * @method
     * @name bit2me#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/tickers/get
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const response = await this.publicGetV2TradingTickers (params);
        //
        //     [
        //         {
        //             "timestamp": 1793711134437,
        //             "symbol": "BTC/EUR",
        //             "open": 69219.9,
        //             "close": 69085.4,
        //             "bid": 69085.4,
        //             "ask": 69085.5,
        //             "percentage": -0.19,
        //             "high": 69613.8,
        //             "low": 68111,
        //             "baseVolume": 658.2554895,
        //             "quoteVolume": 45221164.74541575
        //         }
        //     ]
        //
        return this.parseTickers (response, marketSymbols);
    }

    /**
     * @method
     * @name bit2me#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/tickers/get
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV2TradingTickers (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp": 1793711134437,
        //             "symbol": "BTC/EUR",
        //             "open": 69219.9,
        //             "close": 69085.4,
        //             "bid": 69085.4,
        //             "ask": 69085.5,
        //             "percentage": -0.19,
        //             "high": 69613.8,
        //             "low": 68111,
        //             "baseVolume": 658.2554895,
        //             "quoteVolume": 45221164.74541575
        //         }
        //     ]
        //
        const ticker = this.safeDict (response, 0, {});
        return this.parseTicker (ticker, market);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "timestamp": 1793711134437,
        //         "symbol": "BTC/EUR",
        //         "open": 69219.9,
        //         "close": 69085.4,
        //         "bid": 69085.4,
        //         "ask": 69085.5,
        //         "percentage": -0.19,
        //         "high": 69613.8,
        //         "low": 68111,
        //         "baseVolume": 658.2554895,
        //         "quoteVolume": 45221164.74541575
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeString (ticker, 'close');
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
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'percentage'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bit2me#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/order-book/get
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by bit2me.fetchOrderBook, the endpoint always returns up to 100 levels per side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV2TradingOrderBook (this.extend (request, params));
        //
        //     {
        //         "bids": [ [ 69058.9, 0.19431333 ], [ 69058.8, 0.0001448 ] ],
        //         "asks": [ [ 69059.0, 0.00284291 ], [ 69060.1, 0.1 ] ],
        //         "symbol": "BTC/EUR",
        //         "timestamp": 1793711134413
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
    }

    /**
     * @method
     * @name bit2me#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v1/trading/trade/last/get
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch, default 50, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 50);
        }
        const response = await this.publicGetV1TradingTradeLast (this.extend (request, params));
        //
        //     [
        //         [ "sell", 69085.4, 0.00284291, 1793711134413 ],
        //         [ "buy", 69083.4, 0.00060614, 1793711113677 ]
        //     ]
        //
        // the exchange returns the newest trades first, reverse them so that trades sharing a timestamp keep their execution order
        const reversed = [];
        const length = response.length;
        for (let i = 0; i < length; i++) {
            reversed.push (response[length - 1 - i]);
        }
        return this.parseTrades (reversed, market, since, limit);
    }

    override parseTrade (trade: Dict | List, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //     [ "sell", 69085.4, 0.00284291, 1793711134413 ]
        //
        const side = this.safeStringLower (trade, 0);
        const price = this.safeString (trade, 1);
        const amount = this.safeString (trade, 2);
        const timestamp = this.safeInteger (trade, 3);
        const resolvedMarket = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'symbol': resolvedMarket['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name bit2me#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v1/trading/candle/get
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 1000, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ paginate, paramsPaginate ] = this.handleOptionBoolAndParams (params, 'fetchOHLCV', 'paginate', false);
        const maxLimit = 1000;
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, paramsPaginate, maxLimit) as OHLCV[];
        }
        const requestLimit = (limit === undefined) ? maxLimit : Math.min (limit, maxLimit);
        const [ until, paramsUntil ] = this.handleParamInteger (paramsPaginate, 'until');
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
            'limit': requestLimit,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        } else {
            // the endpoint returns the oldest candles first, so request a window that covers `limit` candles
            const duration = this.parseTimeframe (timeframe) * 1000;
            const end = (until !== undefined) ? until : this.milliseconds ();
            request['startTime'] = end - requestLimit * duration;
        }
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicGetV1TradingCandle (this.extend (request, paramsUntil));
        //
        //     [
        //         [ 1793628000000, 69397.5, 69549.9, 69200.1, 69334.1, 20.37762874 ],
        //         [ 1793631600000, 69334, 69613.8, 68923.4, 69137.8, 22.29039127 ]
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        //     [ 1793628000000, 69397.5, 69549.9, 69200.1, 69334.1, 20.37762874 ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict {
        const apiName = api[0];
        let requestHeaders: NullableDict = undefined;
        let requestBody: Str = undefined;
        const query = this.omit (params, this.extractParams (path));
        let url = '/' + this.implodeParams (path, params);
        const isGetOrDelete = (method === 'GET') || (method === 'DELETE');
        if (isGetOrDelete) {
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencode (query);
            }
        }
        if (apiName === 'private') {
            this.checkRequiredCredentials ();
            // https://api.bit2me.com/docs/guides/authentication
            // message = nonce:path[:compactJsonBody] -> sha256 (binary) -> hmac-sha512 (base64)
            const nonce = this.nonce ().toString ();
            let message = nonce + ':' + url;
            if (!isGetOrDelete) {
                if (Object.keys (query).length > 0) {
                    requestBody = this.json (query);
                    message += ':' + requestBody;
                }
            }
            const digest = this.hash (this.encode (message), sha256, 'binary');
            const signature = this.hmac (digest, this.encode (this.secret), sha512, 'base64');
            requestHeaders = {
                'x-api-key': this.apiKey,
                'x-nonce': nonce,
                'api-signature': signature,
            };
            if (requestBody !== undefined) {
                requestHeaders['Content-Type'] = 'application/json';
            }
        }
        const apiUrl = this.safeString (this.urls['api'], apiName);
        const fullUrl = apiUrl + url;
        return { 'url': fullUrl, 'method': method, 'body': requestBody, 'headers': requestHeaders };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"statusCode":404,"error":"Not Found","message":"Market not found for symbol FOO/BAR","reqId":"9834b8a8-97b8-470d-ade2-3d31687c0723"}
        //     {"code":403,"description":"invalid credentials"}
        //     {"message":"Validation errors","errors":[{"code":"INVALID_REQUEST_PARAMETER","message":"Invalid parameter (symbol): Value is required but was not provided","in":"query","name":"symbol"}]}
        //     {"message":["type must be one of the following values: all, fiat, crypto"],"error":"Bad Request","statusCode":400}
        //
        const errorCode = this.safeString2 (response, 'code', 'statusCode');
        const errorsList = this.safeList (response, 'errors');
        if ((errorCode !== undefined) || (errorsList !== undefined)) {
            const message = this.safeStringN (response, [ 'message', 'description', 'error' ]);
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
