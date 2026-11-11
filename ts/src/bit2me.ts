
// ----------------------------------------------------------------------------

import { sha256, sha512 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/bit2me.js';
import { ExchangeError, AuthenticationError, ArgumentsRequired, BadRequest, BadSymbol, InsufficientFunds, InvalidOrder, NotSupported, OrderNotFound, PermissionDenied, RateLimitExceeded, ExchangeNotAvailable, OnMaintenance } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Currencies, Currency, CurrencyInterface, Dict, Endpoint, Int, List, Market, NullableDict, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TransferEntry, int } from './base/types.js';

// ----------------------------------------------------------------------------

/**
 * @class bit2me
 * @augments Exchange
 */
export default class bit2me extends Exchange {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'id': 'bit2me',
            'name': 'Bit2Me',
            'countries': [ 'ES' ], // Spain
            'rateLimit': 100, // 600 requests per minute on the starter tier
            'version': 'v1',
            'certified': false,
            'pro': true,
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
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
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
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
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
                'fetchTransfers': true,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
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
                        'v1/trading/trade': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/wallet/balance': { 'cost': 1 } as Endpoint<List>,
                        'v1/trading/working-capital': { 'cost': 1 } as Endpoint<List>,
                        'v1/trading/movement': { 'cost': 1 } as Endpoint<List>,
                    },
                    'post': {
                        'v1/trading/order': { 'cost': 1 } as Endpoint<Dict | List>, // a list for oco orders
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
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
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
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 50,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'symbolRequired': false,
                    },
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
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000,
                        'daysBackCanceled': 100000,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
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
                'mica': true, // MiCA compliant, USDT was delisted on 2025-03-21
                'createMarketBuyOrderRequiresPrice': true, // market buy orders with a price are converted to a cost (amount * price), without a price the amount is sent in the base currency
                'accountsByType': {
                    'funding': 'wallet',
                    'main': 'wallet',
                    'wallet': 'wallet',
                    'spot': 'trading',
                    'trading': 'trading',
                    'pro': 'trading',
                },
                'accountsById': {
                    'wallet': 'funding',
                    'trading': 'spot',
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
                    'AMOUNT_IN_QUOTE_INVALID_ORDER_TYPE': InvalidOrder,
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
                    'OCO_SIDE_NOT_ALLOWED': InvalidOrder, // {"statusCode":412,"message":"Only sell OCO orders are allowed","errorPayload":{"code":"OCO_SIDE_NOT_ALLOWED","side":"buy"}}
                    'ONLY_LIMIT_ORDERS_ALLOWED': InvalidOrder,
                    'ORDER_AMOUNT_GREATER_MARKET_MAX': InvalidOrder,
                    'ORDER_AMOUNT_GREATER_TOTAL_AMOUNT_IN_PURCHASE': InvalidOrder,
                    'ORDER_AMOUNT_GREATER_TOTAL_AMOUNT_IN_SALE': InvalidOrder,
                    'ORDER_AMOUNT_LOWER_EQUAL_ZERO': InvalidOrder,
                    'ORDER_AMOUNT_LOWER_MARKET_MIN': InvalidOrder,
                    'ORDER_NOT_FOUND': OrderNotFound, // {"statusCode":404,"error":"Not Found","message":"The order with ID ... was not found","errorPayload":{"code":"ORDER_NOT_FOUND"}}
                    'ORDER_PRICE_LOWER_EQUAL_ZERO': InvalidOrder,
                    'ORDER_SIZE_LOWER_MARKET_MIN': InvalidOrder,
                    'ORDER_STOP_PRICE_LOWER_EQUAL_ZERO': InvalidOrder,
                    'PRICE_GREATER_MARKET_MAX': InvalidOrder,
                    'PRICE_LOWER_MARKET_MIN': InvalidOrder,
                    'PRICE_PRECISION_EXCEEDED': InvalidOrder,
                    'SELL_PRICE_IS_BELOW_INITIAL_PRICE': InvalidOrder,
                    'SELL_STOP_PRICE_IS_ABOVE_INITIAL_PRICE': InvalidOrder,
                    'TIME_IN_FORCE_INVALID': InvalidOrder,
                    'TIME_IN_FORCE_NOT_AVAILABLE': InvalidOrder,
                    'TRADING_WALLET_NOT_BALANCE': InsufficientFunds,
                    'TRADING_WALLET_NOT_FOUND': ExchangeError,
                    'USER_IS_ALREADY_CREATING_ORDER': ExchangeError,
                    'WITHDRAWS_DISABLED_TEMPORALLY': OnMaintenance,
                },
                'broad': {
                    'Market not found': BadSymbol, // {"statusCode":404,"error":"Not Found","message":"Market not found for symbol FOO/BAR"}
                    'was not found': OrderNotFound, // {"statusCode":404,"error":"Not Found","message":"The ID ... was not found","errorPayload":null}
                    'balance of the pocket is lower': InsufficientFunds, // {"statusCode":412,"error":"Precondition Failed","message":"The balance of the pocket is lower than the deposit amount"}
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
        // the exponent is only published for a handful of assets, fall back to the usual decimals
        const defaultExponent = (assetType === 'fiat') ? '2' : '8';
        const precision = this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'exponent', defaultExponent)));
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
        // fetchMyTrades, fetchOrderTrades (private)
        //
        //     {
        //         "amount": 0.24,
        //         "amountCurrency": "BTC",
        //         "clientOrderId": null,
        //         "cost": 15600.12,
        //         "costEuro": 15600.12,
        //         "createdAt": "2024-05-07T14:09:02.310Z",
        //         "feeAmount": 15.60012,
        //         "feeCurrency": "EUR",
        //         "feePercentage": 0.1,
        //         "feePercentageDiscount": 0, // fetchOrderTrades only
        //         "id": "4278a86a-53e7-4997-9102-01646ae8954a",
        //         "isMaker": true,
        //         "orderId": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //         "orderType": "limit",
        //         "price": 65000.5,
        //         "priceCurrency": "EUR",
        //         "side": "buy",
        //         "spaceCenterLevelId": null, // fetchOrderTrades only
        //         "symbol": "BTC/EUR"
        //     }
        //
        if (Array.isArray (trade)) {
            const publicSide = this.safeStringLower (trade, 0);
            const publicPrice = this.safeString (trade, 1);
            const publicAmount = this.safeString (trade, 2);
            const publicTimestamp = this.safeInteger (trade, 3);
            const resolvedMarket = this.safeMarket (undefined, market);
            return this.safeTrade ({
                'info': trade,
                'id': undefined,
                'symbol': resolvedMarket['symbol'],
                'timestamp': publicTimestamp,
                'datetime': this.iso8601 (publicTimestamp),
                'order': undefined,
                'type': undefined,
                'side': publicSide,
                'takerOrMaker': undefined,
                'price': publicPrice,
                'amount': publicAmount,
                'cost': undefined,
                'fee': undefined,
            }, resolvedMarket);
        }
        const marketId = this.safeString (trade, 'symbol');
        const privateMarket = this.safeMarket (marketId, market);
        const timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        const isMaker = this.safeBool (trade, 'isMaker');
        let takerOrMaker: Str = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = (isMaker) ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString (trade, 'feeAmount');
        if (feeCost !== undefined) {
            let feeRate: Str = undefined;
            const feePercentage = this.safeString (trade, 'feePercentage');
            if (feePercentage !== undefined) {
                feeRate = Precise.stringDiv (feePercentage, '100');
            }
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')),
                'rate': feeRate,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'symbol': privateMarket['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': this.safeString (trade, 'orderId'),
            'type': this.parseOrderType (this.safeString (trade, 'orderType')),
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': this.safeString (trade, 'cost'),
            'fee': fee,
        }, privateMarket);
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

    /**
     * @method
     * @name bit2me#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/balance/get
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbols] comma-separated currency codes, only those wallets are returned
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetV1TradingWalletBalance (params);
        //
        //     [
        //         {
        //             "balance": 1350.5,
        //             "blockedBalance": 0,
        //             "createdAt": "2023-09-13T14:05:42.149Z",
        //             "currency": "EUR",
        //             "id": "3a9f1c2d-7e4b-4f6a-8c1d-2b3e4f5a6b7c",
        //             "rawBalance": "1350.5",
        //             "rawBlockedBalance": "0",
        //             "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96"
        //         }
        //     ]
        //
        return this.parseBalanceList (response);
    }

    parseBalanceList (response: Dict[]): Balances {
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const wallet = response[i];
            const currencyId = this.safeString (wallet, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            // balance is the amount available for trading, blockedBalance is reserved by open orders and bots
            account['free'] = this.safeString2 (wallet, 'rawBalance', 'balance');
            account['used'] = this.safeString2 (wallet, 'rawBlockedBalance', 'blockedBalance');
            if (code !== undefined) {
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name bit2me#createOrder
     * @description create a trade order
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/post
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, required for limit orders, for market buy orders it is used to compute the cost to spend (amount * price)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a stop-limit order is activated, requires a limit price
     * @param {float} [params.stopLossPrice] the trigger price of a stop loss, placed as a stop-limit order at the limit price, or as the stop loss leg of an OCO when takeProfitPrice is also set
     * @param {float} [params.takeProfitPrice] the trigger price of a take profit, placed as a stop-limit order at the limit price, or as the take profit leg of an OCO when stopLossPrice is also set
     * @param {float} [params.stopLimitPrice] OCO only, the limit price of the stop loss leg, defaults to the price argument and then to stopLossPrice
     * @param {float} [params.cost] for market orders only, the amount to trade in units of the quote currency, overrides amount
     * @param {string} [params.timeInForce] 'GTC' (default) or 'FOK' (limit orders only), IOC is not available on bit2me
     * @param {boolean} [params.postOnly] true to place a post-only limit order
     * @param {string} [params.clientOrderId] a unique identifier for the order, up to 48 characters
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure), for an OCO the take profit leg is returned and both legs are available in info, cancelling one leg does not cancel the other
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.privatePostV1TradingOrder (request);
        //
        // oco, the take profit limit leg first and the stop loss stop-limit leg second, linked by orderGroupId
        //
        //     [
        //         { "id": "59b27fb6-...", "orderType": "limit", "status": "open", "price": 95928.16, "stopPrice": 0, "orderGroupId": "9a28690c-...", ... },
        //         { "id": "514bf92e-...", "orderType": "stop-limit", "status": "inactive", "price": 50892.91, "stopPrice": 51630.49, "orderGroupId": "9a28690c-...", ... }
        //     ]
        //
        if (Array.isArray (response)) {
            const takeProfitLeg = this.safeDict (response, 0, {});
            const ocoOrder = this.parseOrder (takeProfitLeg, market);
            ocoOrder['info'] = response;
            return ocoOrder;
        }
        //
        //     {
        //         "cancelReason": null,
        //         "clientOrderId": null,
        //         "cost": 0,
        //         "createdAt": "2024-05-07T14:08:30.961Z",
        //         "feeAmount": 0,
        //         "feeCurrency": "EUR",
        //         "filledAmount": 0,
        //         "id": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //         "orderAmount": 0.35,
        //         "orderGroupId": null,
        //         "orderType": "limit",
        //         "postOnly": null,
        //         "price": 65000.5,
        //         "side": "buy",
        //         "status": "open",
        //         "stopPrice": 0,
        //         "symbol": "BTC/EUR",
        //         "timeInForce": "GTC",
        //         "updatedAt": "2024-05-07T14:08:30.961Z",
        //         "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @ignore
     * @method
     * @name bit2me#createOrderRequest
     * @description helper function to build the request body for createOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the request body
     */
    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Dict {
        const market = this.market (symbol);
        const isMarketOrder = (type === 'market');
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        const stopLimitPrice = this.safeString (params, 'stopLimitPrice');
        const isOco = (stopLossPrice !== undefined) && (takeProfitPrice !== undefined);
        // a lone stop loss or take profit is a stop-limit order, the exchange triggers it in either direction
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        const cost = this.safeString (params, 'cost');
        const clientOrderId = this.safeString (params, 'clientOrderId');
        let query = this.omit (params, [ 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'stopLimitPrice', 'cost', 'clientOrderId' ]);
        let postOnly = false;
        [ postOnly, query ] = this.handlePostOnly (isMarketOrder, false, query);
        const timeInForce = this.safeStringUpper (query, 'timeInForce');
        query = this.omit (query, 'timeInForce');
        const request: Dict = {
            'symbol': market['id'],
            'side': side,
            'orderType': type,
        };
        if (isOco) {
            if (side !== 'sell') {
                throw new InvalidOrder (this.id + ' createOrder() only supports OCO orders on the sell side');
            }
            if (isMarketOrder) {
                throw new InvalidOrder (this.id + ' createOrder() OCO legs are limit orders, use the limit type');
            }
            request['orderType'] = 'oco';
            request['amount'] = this.amountToPrecision (symbol, amount);
            request['takeProfitPrice'] = this.priceToPrecision (symbol, takeProfitPrice);
            request['stopPrice'] = this.priceToPrecision (symbol, stopLossPrice);
            let stopLossLimit = stopLimitPrice;
            if (stopLossLimit === undefined) {
                stopLossLimit = (price !== undefined) ? this.numberToString (price) : stopLossPrice;
            }
            request['stopLimitPrice'] = this.priceToPrecision (symbol, stopLossLimit);
        } else if (isMarketOrder) {
            if (triggerPrice !== undefined) {
                throw new InvalidOrder (this.id + ' createOrder() does not support stop-market orders, use a limit price to place a stop-limit order');
            }
            let quoteAmount: Str = undefined;
            if (cost !== undefined) {
                quoteAmount = cost;
            } else if ((side === 'buy') && (price !== undefined)) {
                // the unified convention for market buy orders, the cost to spend is amount * price
                quoteAmount = Precise.stringMul (this.numberToString (amount), this.numberToString (price));
            }
            if (quoteAmount !== undefined) {
                request['amount'] = this.costToPrecision (symbol, quoteAmount);
                request['amountInQuote'] = true;
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['amount'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
            if (triggerPrice !== undefined) {
                request['orderType'] = 'stop-limit';
                request['stopPrice'] = this.priceToPrecision (symbol, triggerPrice);
            }
        }
        if (postOnly) {
            request['postOnly'] = true;
        }
        if (timeInForce !== undefined) {
            request['timeInForce'] = timeInForce;
        }
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        return this.extend (request, query);
    }

    /**
     * @method
     * @name bit2me#cancelOrder
     * @description cancels an open order
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/delete
     * @param {string} id order id
     * @param {string} [symbol] not used by bit2me.cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'id': id,
        };
        const response = await this.privateDeleteV1TradingOrderId (this.extend (request, params));
        //
        //     {
        //         "cancelReason": "CR-1: User request",
        //         "clientOrderId": null,
        //         "cost": 0,
        //         "createdAt": "2024-05-07T14:08:30.961Z",
        //         "feeAmount": 0,
        //         "feeCurrency": "EUR",
        //         "filledAmount": 0,
        //         "id": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //         "orderAmount": 0.35,
        //         "orderGroupId": null,
        //         "orderType": "limit",
        //         "postOnly": null,
        //         "price": 65000.5,
        //         "side": "buy",
        //         "status": "cancelled",
        //         "stopPrice": 0,
        //         "symbol": "BTC/EUR",
        //         "timeInForce": "GTC",
        //         "updatedAt": "2024-05-07T14:10:34.837Z",
        //         "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bit2me#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/get
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} id the order id
     * @param {string} [symbol] not used by bit2me.fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] fetch the order by its client order id instead of its id
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            const query = this.omit (params, 'clientOrderId');
            const requestByClientId: Dict = {
                'clientOrderId': clientOrderId,
            };
            const orders = await this.privateGetV1TradingOrder (this.extend (requestByClientId, query));
            const numOrders = orders.length;
            if (numOrders === 0) {
                throw new OrderNotFound (this.id + ' fetchOrder() could not find an order with clientOrderId ' + clientOrderId);
            }
            const first = this.safeDict (orders, 0, {});
            return this.parseOrder (first, market);
        }
        const request: Dict = {
            'id': id,
        };
        const response = await this.privateGetV1TradingOrderId (this.extend (request, params));
        //
        //     {
        //         "cancelReason": null,
        //         "clientOrderId": null,
        //         "cost": 15600.12,
        //         "createdAt": "2024-05-07T14:08:30.961Z",
        //         "feeAmount": 15.60012,
        //         "feeCurrency": "EUR",
        //         "filledAmount": 0.24,
        //         "id": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //         "orderAmount": 0.35,
        //         "orderGroupId": null,
        //         "orderType": "limit",
        //         "postOnly": null,
        //         "price": 65000.5,
        //         "side": "buy",
        //         "status": "open",
        //         "stopPrice": 0,
        //         "symbol": "BTC/EUR",
        //         "timeInForce": "GTC",
        //         "updatedAt": "2024-05-07T14:09:02.310Z",
        //         "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bit2me#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {int} [params.offset] the number of orders to skip, for pagination
     * @param {string} [params.status] only orders in exactly this status, one of 'open', 'inactive', 'filled', 'cancelled'
     * @param {string} [params.status_in] comma-separated statuses to include
     * @param {string} [params.clientOrderId] comma-separated client order ids to filter by
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const [ until, query ] = this.handleParamInteger (params, 'until');
        // startTime and endTime must always be sent together
        if ((since !== undefined) || (until !== undefined)) {
            const start = (since !== undefined) ? since : 0;
            const end = (until !== undefined) ? until : this.milliseconds ();
            request['startTime'] = this.iso8601 (start);
            request['endTime'] = this.iso8601 (end);
        }
        const response = await this.privateGetV1TradingOrder (this.extend (request, query));
        //
        //     [
        //         {
        //             "cancelReason": null,
        //             "clientOrderId": "my-bot-order-0001",
        //             "cost": 649.87,
        //             "createdAt": "2024-05-06T09:12:03.114Z",
        //             "feeAmount": 1.94961,
        //             "feeCurrency": "EUR",
        //             "filledAmount": 0.01,
        //             "id": "0f5c3e7a-2b1d-4c8e-9f6a-7d2e1b3c4a5f",
        //             "orderAmount": 0.01,
        //             "orderGroupId": null,
        //             "orderType": "market",
        //             "postOnly": null,
        //             "price": 0,
        //             "side": "sell",
        //             "status": "filled",
        //             "stopPrice": 0,
        //             "symbol": "BTC/EUR",
        //             "timeInForce": "GTC",
        //             "updatedAt": "2024-05-06T09:12:03.402Z",
        //             "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name bit2me#fetchOpenOrders
     * @description fetch all unfilled currently open orders, including stop-limit orders waiting for their trigger
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const request: Dict = {
            'status_in': 'open,inactive',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name bit2me#fetchClosedOrders
     * @description fetches information on multiple filled orders made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const request: Dict = {
            'status': 'filled',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name bit2me#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const request: Dict = {
            'status': 'cancelled',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name bit2me#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and filled orders made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const request: Dict = {
            'status_in': 'filled,cancelled',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'open': 'open',
            'inactive': 'open', // stop-limit order waiting for its trigger
            'filled': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str): Str {
        const types: Dict = {
            'limit': 'limit',
            'market': 'market',
            'stop-limit': 'limit',
        };
        return this.safeString (types, type, type);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder, cancelOrder, fetchOrder, fetchOrders
        //
        //     {
        //         "cancelReason": null,
        //         "clientOrderId": null,
        //         "cost": 15600.12,
        //         "createdAt": "2024-05-07T14:08:30.961Z",
        //         "feeAmount": 15.60012,
        //         "feeCurrency": "EUR",
        //         "filledAmount": 0.24,
        //         "id": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //         "orderAmount": 0.35,
        //         "orderGroupId": null,
        //         "orderType": "limit",
        //         "postOnly": null,
        //         "price": 65000.5,
        //         "side": "buy",
        //         "status": "open",
        //         "stopPrice": 0,
        //         "symbol": "BTC/EUR",
        //         "timeInForce": "GTC",
        //         "updatedAt": "2024-05-07T14:09:02.310Z",
        //         "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        const resolvedMarket = this.safeMarket (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const rawType = this.safeString (order, 'orderType');
        let fee = undefined;
        const feeCost = this.safeNumber (order, 'feeAmount');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (order, 'feeCurrency')),
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.parse8601 (this.safeString (order, 'updatedAt')),
            'symbol': resolvedMarket['symbol'],
            'type': this.parseOrderType (rawType),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': this.safeBool (order, 'postOnly'),
            'reduceOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            // market orders are stored with a price of 0
            'price': this.omitZero (this.safeString (order, 'price')),
            'triggerPrice': this.omitZero (this.safeString (order, 'stopPrice')),
            'amount': this.safeString (order, 'orderAmount'),
            'cost': this.safeString (order, 'cost'),
            'average': undefined,
            'filled': this.safeString (order, 'filledAmount'),
            'remaining': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': fee,
            'trades': undefined,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name bit2me#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/trade/get
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve, default 50, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {int} [params.offset] the number of trades to skip, for pagination
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 50);
        }
        const [ until, query ] = this.handleParamInteger (params, 'until');
        // startTime and endTime must always be sent together
        if ((since !== undefined) || (until !== undefined)) {
            const start = (since !== undefined) ? since : 0;
            const end = (until !== undefined) ? until : this.milliseconds ();
            request['startTime'] = this.iso8601 (start);
            request['endTime'] = this.iso8601 (end);
        }
        const response = await this.privateGetV1TradingTrade (this.extend (request, query));
        //
        //     {
        //         "data": [
        //             {
        //                 "amount": 0.24,
        //                 "amountCurrency": "BTC",
        //                 "clientOrderId": null,
        //                 "cost": 15600.12,
        //                 "costEuro": 15600.12,
        //                 "createdAt": "2024-05-07T14:09:02.310Z",
        //                 "feeAmount": 15.60012,
        //                 "feeCurrency": "EUR",
        //                 "feePercentage": 0.1,
        //                 "id": "4278a86a-53e7-4997-9102-01646ae8954a",
        //                 "isMaker": true,
        //                 "orderId": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //                 "orderType": "limit",
        //                 "price": 65000.5,
        //                 "priceCurrency": "EUR",
        //                 "side": "buy",
        //                 "symbol": "BTC/EUR"
        //             }
        //         ],
        //         "total": 12
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name bit2me#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/trades/get
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'id': id,
        };
        const response = await this.privateGetV1TradingOrderIdTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "amount": 0.24,
        //             "amountCurrency": "BTC",
        //             "clientOrderId": null,
        //             "cost": 15600.12,
        //             "costEuro": 15600.12,
        //             "createdAt": "2024-05-07T14:09:02.310Z",
        //             "feeAmount": 15.60012,
        //             "feeCurrency": "EUR",
        //             "feePercentage": 0.1,
        //             "feePercentageDiscount": 0,
        //             "id": "4278a86a-53e7-4997-9102-01646ae8954a",
        //             "isMaker": true,
        //             "orderId": "536ee1dc-528a-419e-9c00-5e04c010658d",
        //             "orderType": "limit",
        //             "price": 65000.5,
        //             "priceCurrency": "EUR",
        //             "side": "buy",
        //             "spaceCenterLevelId": null,
        //             "symbol": "BTC/EUR"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name bit2me#transfer
     * @description transfer currency internally between the bit2me wallet and the trading (pro) wallet
     * @see https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/deposit/post
     * @see https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/withdraw/post
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'funding' (the bit2me wallet) or 'spot' (the trading wallet)
     * @param {string} toAccount 'funding' (the bit2me wallet) or 'spot' (the trading wallet)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)
     */
    override async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params: Dict = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeDict (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const request: Dict = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        let response = undefined;
        if ((fromId === 'wallet') && (toId === 'trading')) {
            response = await this.privatePostV1TradingWalletDeposit (this.extend (request, params));
        } else if ((fromId === 'trading') && (toId === 'wallet')) {
            response = await this.privatePostV1TradingWalletWithdraw (this.extend (request, params));
        } else {
            throw new BadRequest (this.id + ' transfer() only supports transfers between the funding account (bit2me wallet) and the spot account (trading wallet)');
        }
        //
        //     {
        //         "balance": 1350.5,
        //         "blockedBalance": 0,
        //         "createdAt": "2023-09-13T14:05:42.149Z",
        //         "currency": "EUR",
        //         "id": "3a9f1c2d-7e4b-4f6a-8c1d-2b3e4f5a6b7c",
        //         "rawBalance": "1350.5",
        //         "rawBlockedBalance": "0",
        //         "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96"
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        transfer['amount'] = amount;
        transfer['fromAccount'] = fromAccount;
        transfer['toAccount'] = toAccount;
        return transfer;
    }

    /**
     * @method
     * @name bit2me#fetchTransfers
     * @description fetch the history of movements between the bit2me wallet and the trading (pro) wallet
     * @see https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/movement/get
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @param {string} [params.movementType] 'deposit' or 'withdrawal', to fetch only one direction
     * @returns {object[]} a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)
     */
    override async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        let currency: Currency = undefined;
        const request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const [ until, query ] = this.handleParamInteger (params, 'until');
        if (until !== undefined) {
            request['to'] = this.iso8601 (until);
        }
        const response = await this.privateGetV1TradingMovement (this.extend (request, query));
        //
        //     [
        //         {
        //             "amount": 100,
        //             "createdAt": "2025-03-10T09:30:00.000Z",
        //             "currency": "EUR",
        //             "id": "1b2c3d4e-5f60-4718-9a2b-3c4d5e6f7a8b",
        //             "movementType": "deposit",
        //             "serviceOrderName": "wallet",
        //             "status": "completed",
        //             "walletId": "3a9f1c2d-7e4b-4f6a-8c1d-2b3e4f5a6b7c"
        //         }
        //     ]
        //
        return this.parseTransfers (response, currency, since, limit);
    }

    override parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // transfer
        //
        //     {
        //         "balance": 1350.5,
        //         "blockedBalance": 0,
        //         "createdAt": "2023-09-13T14:05:42.149Z",
        //         "currency": "EUR",
        //         "id": "3a9f1c2d-7e4b-4f6a-8c1d-2b3e4f5a6b7c",
        //         "rawBalance": "1350.5",
        //         "rawBlockedBalance": "0",
        //         "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96"
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "amount": 100,
        //         "createdAt": "2025-03-10T09:30:00.000Z",
        //         "currency": "EUR",
        //         "id": "1b2c3d4e-5f60-4718-9a2b-3c4d5e6f7a8b",
        //         "movementType": "deposit",
        //         "serviceOrderName": "wallet",
        //         "status": "completed",
        //         "walletId": "3a9f1c2d-7e4b-4f6a-8c1d-2b3e4f5a6b7c"
        //     }
        //
        const currencyId = this.safeString (transfer, 'currency');
        const movementType = this.safeString (transfer, 'movementType');
        const accountsById = this.safeDict (this.options, 'accountsById', {});
        let fromAccount: Str = undefined;
        let toAccount: Str = undefined;
        let id: Str = undefined;
        let timestamp: Int = undefined;
        let status: Str = undefined;
        if (movementType !== undefined) {
            // a movement from the historical list
            id = this.safeString (transfer, 'id');
            timestamp = this.parse8601 (this.safeString (transfer, 'createdAt'));
            status = this.parseTransferStatus (this.safeString (transfer, 'status'));
            const wallet = this.safeString (accountsById, 'wallet');
            const trading = this.safeString (accountsById, 'trading');
            fromAccount = (movementType === 'deposit') ? wallet : trading;
            toAccount = (movementType === 'deposit') ? trading : wallet;
        } else {
            // the trading wallet returned by deposit/withdraw, createdAt is the wallet creation date
            status = 'ok';
        }
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        };
    }

    parseTransferStatus (status: Str): Str {
        const statuses: Dict = {
            'completed': 'ok',
            'pending': 'pending',
            'failed': 'failed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    override nonce (): int {
        // the nonce must be a unix timestamp in milliseconds, within 5 seconds of the server clock
        return this.milliseconds ();
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
                // always send a json body, some http clients label an empty body as octet-stream and the gateway rejects it
                requestBody = this.json (query);
                message += ':' + requestBody;
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
        if (apiUrl === undefined) {
            throw new NotSupported (this.id + ' does not have a URL for ' + apiName + ' endpoints');
        }
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
        //     {"statusCode":412,"error":"Precondition Failed","message":"...","errorPayload":{"code":"ORDER_AMOUNT_LOWER_MARKET_MIN"}}
        //
        const errorCode = this.safeString2 (response, 'code', 'statusCode');
        const errorsList = this.safeList (response, 'errors');
        const errorPayload = this.safeDict (response, 'errorPayload', {});
        const payloadCode = this.safeString (errorPayload, 'code');
        if ((errorCode !== undefined) || (errorsList !== undefined) || (payloadCode !== undefined)) {
            const message = this.safeStringN (response, [ 'message', 'description', 'error' ]);
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], payloadCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
