//  ---------------------------------------------------------------------------

import Exchange from './abstract/pacifica.js';
import { ExchangeError, ArgumentsRequired, InvalidOrder, OrderNotFound, BadRequest, InsufficientFunds, PermissionDenied, RateLimitExceeded, ExchangeNotAvailable, RequestTimeout, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { eddsa } from './base/functions/crypto.js';
import type { Market, TransferEntry, Balances, Int, OrderBook, OHLCV, Str, FundingRateHistory, Order, OrderType, OrderSide, Trade, Strings, Position, OrderRequest, Dict, Num, int, Transaction, Currency, TradingFeeInterface, LedgerEntry, FundingRates, FundingRate, OpenInterests, MarketInterface, Leverage, MarginMode, Tickers, Ticker } from './base/types.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';

//  ---------------------------------------------------------------------------

/**
 * @class pacifica
 * @augments Exchange
 */
export default class pacifica extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'pacifica',
            'name': 'pacifica',
            'countries': [ ],
            'version': 'v1',
            'rateLimit': 50, // 125 requests per minute without api-key (300 with api-key) ~ 2 req/sec = 1 req/500 ms.
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersForSymbols': undefined,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'editOrders': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': true,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': undefined,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTime': undefined,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
            },
            'hostname': 'pacifica.fi',
            'urls': {
                'logo': '', // provide it later
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'public': 'https://test-api.{hostname}',
                    'private': 'https://test-api.{hostname}',
                },
                'www': 'https://www.pacifica.fi',
                'doc': 'https://docs.pacifica.fi/api-documentation/api/rest-api',
                'fees': 'https://docs.pacifica.fi/trading-on-pacifica/trading-fees',
                'referral': 'https://app.pacifica.fi/',
            },
            'api': {
                'public': {
                    'get': {
                        // ~12 weight depends on the limit 3 max for api-key, but min without api-key
                        'info': 1,
                        'info/prices': 1,
                        'kline': 12,
                        'kline/mark': 12,
                        'book': 1,
                        'trades': 1, // Recent
                        'funding_rate/history': 1,
                        'account': 1,
                        'account/settings': 1,
                        'positions': 1,
                        'trades/history': 12,
                        'funding/history': 1,
                        'portfolio': 1,
                        'account/balance/history': 12,
                        'orders': 1,
                        'orders/history': 12,
                        'orders/history_by_id': 1,
                        'account/builder_codes/approvals': 1,
                    },
                },
                'private': {
                    'post': {
                        'account/leverage': 1,
                        'account/margin': 1,
                        'account/withdraw': 1,
                        'account/subaccount/create': 1,
                        'account/subaccount/list': 1,
                        'account/subaccount/transfer': 1,
                        'orders/create': 1,
                        'orders/create_market': 1,
                        'orders/stop/create': 1,
                        'positions/tpsl': 1,
                        'orders/cancel': 0.5,
                        'orders/cancel_all': 0.5,
                        'orders/stop/cancel': 0.5,
                        'orders/edit': 1,
                        'orders/batch': 1,
                        'account/builder_codes/approve': 1,
                        'account/builder_codes/revoke': 1,
                        'agent/bind': 1,
                        'account/api_keys/create': 1,
                        'account/api_keys/revoke': 1,
                        'account/api_keys': 1,
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber ('0.0004'),
                    'maker': this.parseNumber ('0.00015'),
                },
            },
            'requiredCredentials': {
                'apiKey': undefined, // We will use it for option. Rate Limit Api Key
                'secret': false,
                'walletAddress': undefined,
                'privateKey': true, // base58 solana private key
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest,
                    '403': PermissionDenied,
                    '404': BadRequest,
                    '409': ExchangeError,
                    '422': ExchangeError,
                    '429': RateLimitExceeded,
                    '500': ExchangeError,
                    '503': ExchangeNotAvailable,
                    '504': RequestTimeout,
                },
                'broad': {
                    'UNKNOWN': ExchangeError,
                    'ACCOUNT_NOT_FOUND': ExchangeError,
                    'BOOK_NOT_FOUND': ExchangeError,
                    'INVALID_TICK_LEVEL': InvalidOrder,
                    'INSUFFICIENT_BALANCE': InsufficientFunds,
                    'ORDER_NOT_FOUND': OrderNotFound,
                    'OVER_WITHDRAWAL': InsufficientFunds,
                    'INVALID_LEVERAGE': ExchangeError,
                    'CANNOT_UPDATE_MARGIN': ExchangeError,
                    'POSITION_NOT_FOUND': ExchangeError,
                    'POSITION_TPSL_LIMIT_EXCEEDED': InvalidOrder,
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': { },
            'options': {
                // There is a few choices:
                // 1. never setup walletAddress AND always provide account/originAddress/agentAddress in params (or init in options).
                // 2. always setup walletAddress equals pubkey of privateKey AND provide agentAddress and originAddress both in params (or init in options) if agent wallet in use.
                // 3. always setup walletAddress equal originAddress AND provide only agentAddress in params if agent wallet in use (or init in options). (both (..and originAddress) is optional and not required)
                'agentAddress': undefined,
                'originAddress': undefined,
                'builderCode': undefined,
                'batchOrdersMax': 10,
                'defaultType': 'swap',
                'sandboxMode': false,
                'defaultSlippage': 0.5,
                'expiryWindow': 5000,
                'maxCostHugeWithApiKey': 3,
                'marketHelperProps': [ ],
                'defaultMarginMode': 'cross',
                'builderSupportOperations': {
                    'create_market_order': true,
                    'create_limit_order': true,
                    'create_stop_order': true,
                    'set_position_tpsl': true,
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': false,
                                'mark': false,
                                'index': false,
                            },
                            'triggerPrice': true,
                            'type': true,
                            'price': true,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': true,
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
                    'createOrders': {
                        'max': 10,
                    },
                    'editOrder': {
                        'side': false,
                        'type': false,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
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
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 100,
                    },
                    'fetchLedger': {
                        'code': false,
                    },
                },
                'forPerps': {
                    'extends': 'default',
                    'createOrder': {
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                    },
                },
                'spot': undefined,
                'swap': {
                    'linear': {
                        'extends': 'forPerps',
                    },
                    'inverse': {
                        'extends': 'forPerps',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'forPerps',
                    },
                    'inverse': {
                        'extends': 'forPerps',
                    },
                },
            },
        });
    }

    setSandboxMode (enabled) {
        super.setSandboxMode (enabled);
        this.options['sandboxMode'] = enabled;
    }

    market (symbol: string): MarketInterface {
        if (this.markets === undefined) {
            throw new ExchangeError (this.id + ' markets not loaded');
        }
        return super.market (symbol);
    }

    /**
     * @method
     * @name pacifica#fetchMarkets
     * @description retrieves data on all markets for pacifica
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        return await this.fetchSwapMarkets (params);
    }

    /**
     * @method
     * @name pacifica#fetchSwapMarkets
     * @description retrieves data on all swap markets for pacifica
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-market-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchSwapMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetInfo (params); // meta
        // {
        //   "success": true,
        //   "data": [
        //     {
        //       "symbol": "ETH",
        //       "tick_size": "0.1",
        //       "min_tick": "0",
        //       "max_tick": "1000000",
        //       "lot_size": "0.0001",
        //       "max_leverage": 50,
        //       "isolated_only": false,
        //       "min_order_size": "10",
        //       "max_order_size": "5000000",
        //       "funding_rate": "0.0000125",
        //       "next_funding_rate": "0.0000125",
        //       "created_at": 1748881333944
        //     },
        //     {
        //       "symbol": "BTC",
        //       "tick_size": "1",
        //       "min_tick": "0",
        //       "max_tick": "1000000",
        //       "lot_size": "0.00001",
        //       "max_leverage": 50,
        //       "isolated_only": false,
        //       "min_order_size": "10",
        //       "max_order_size": "5000000",
        //       "funding_rate": "0.0000125",
        //       "next_funding_rate": "0.0000125",
        //       "created_at": 1748881333944
        //     },
        //     ....
        //   ],
        //   "error": null,
        //   "code": null
        // }
        const meta = this.safeList (response, 'data', []);
        const results = [];
        for (let i = 0; i < meta.length; i++) {
            results.push (meta[i]);
        }
        return this.parseMarkets (results);
    }

    parseMarket (market: Dict): Market {
        //     {
        //       "symbol": "ETH",
        //       "tick_size": "0.1",
        //       "min_tick": "0",
        //       "max_tick": "1000000",
        //       "lot_size": "0.0001",
        //       "max_leverage": 50,
        //       "isolated_only": false,
        //       "min_order_size": "10",
        //       "max_order_size": "5000000",
        //       "funding_rate": "0.0000125",
        //       "next_funding_rate": "0.0000125",
        //       "created_at": 1748881333944
        //     },
        //     {
        //       "symbol": "BTC",
        //       "tick_size": "1",
        //       "min_tick": "0",
        //       "max_tick": "1000000",
        //       "lot_size": "0.00001",
        //       "max_leverage": 50,
        //       "isolated_only": false,
        //       "min_order_size": "10",
        //       "max_order_size": "5000000",
        //       "funding_rate": "0.0000125",
        //       "next_funding_rate": "0.0000125",
        //       "created_at": 1748881333944
        //     },
        const quoteId = 'usdc';
        const settleId = 'usdc';
        const id = this.safeString (market, 'symbol');
        const baseId = id.toLowerCase ();
        const baseName = id.toUpperCase ();
        const base = this.safeCurrencyCode (baseName);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        const contract = true;
        const swap = true;
        if (contract) {
            if (swap) {
                symbol = symbol + ':' + settle;
            }
        }
        const fees = this.safeDict (this.fees, 'swap', {});
        const taker = this.safeNumber (fees, 'taker');
        const maker = this.safeNumber (fees, 'maker');
        const amountPrecisionStr = this.safeString (market, 'lot_size');
        const pricePrecisionStr = this.safeString (market, 'tick_size');
        const active = true; // No info about it
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'baseName': baseName,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': undefined,
            'swap': swap,
            'future': false,
            'option': false,
            'active': active,
            'contract': contract,
            'linear': true,
            'inverse': false,
            'taker': taker,
            'maker': maker,
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (amountPrecisionStr),
                'price': this.parseNumber (pricePrecisionStr),
            },
            'limits': {
                'leverage': {
                    'min': 1,
                    'max': this.safeInteger (market, 'max_leverage'),
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': this.safeString (market, 'min_tick'),
                    'max': this.safeString (market, 'max_tick'),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'marginModes': { 'cross': true, 'isolated': true },
            'info': market,
        });
    }

    /**
     * @method
     * @name pacifica#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        let userAccount = undefined;
        [ userAccount, params ] = this.handleOriginAndSingleAddress ('fetchBalance', params);
        const request = {
            'account': userAccount,
        };
        const response = await this.publicGetAccount (this.extend (request, params));
        // {
        //   "success": true,
        //   "data": {
        //     "balance": "2000.000000",
        //     "fee_level": 0,
        //     "maker_fee": "0.00015",
        //     "taker_fee": "0.0004",
        //     "account_equity": "2150.250000",
        //     "available_to_spend": "1800.750000",
        //     "available_to_withdraw": "1500.850000",
        //     "pending_balance": "0.000000",
        //     "total_margin_used": "349.500000",
        //     "cross_mmr": "420.690000",
        //     "positions_count": 2,
        //     "orders_count": 3,
        //     "stop_orders_count": 1,
        //     "updated_at": 1716200000000,
        //     "use_ltp_for_stop_orders": false
        //   },
        //   "error": null,
        //   "code": null
        // }
        const data = this.safeValue (response, 'data', {});
        const result = {
            'info': data,
        };
        result['free'] = {};
        result['used'] = {};
        result['total'] = {};
        const totalBalance = this.safeNumber (data, 'account_equity');
        const usedMargin = this.safeNumber (data, 'total_margin_used');
        const freeBalance = this.safeNumber (data, 'available_to_spend');
        result['total']['USDC'] = totalBalance;
        result['used']['USDC'] = usedMargin;
        result['free']['USDC'] = freeBalance;
        const timestamp = this.safeInteger (data, 'updated_at');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name pacifica#fetchLeverage
     * @description fetch the set leverage for a market
     * @param {string} symbol  unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let userAccount = undefined;
        [ userAccount, params ] = this.handleOriginAndSingleAddress ('fetchLeverage', params);
        const request: Dict = {
            'account': userAccount,
        };
        const settings = await this.fetchAccountSettings (this.extend (request, params));
        const setting = this.safeDict (settings, symbol, undefined);
        if (setting === undefined) {
            // NOTE: Upon account creation, all markets have margin settings default to cross margin and leverage default to max.
            // When querying this endpoint, all markets with default margin and leverage settings on this account will return blank.
            return this.parseLeverageFromMarket (market);
        } else {
            return this.parseLeverageFromSetting (symbol, setting);
        }
    }

    parseLeverageFromSetting (symbol: Str, setting: Dict): Leverage {
        // {
        //   "WLFI/USDC:USDC": {
        //       "symbol": "WLFI",
        //       "isolated": false,
        //       "leverage": 5,
        //       "created_at": 1758085929703,
        //       "updated_at": 1758086074002
        //    },
        // }
        const isIsolated = this.safeBool (setting, 'isolated', false);
        const leverage = this.safeInteger (setting, 'leverage');
        const marginMode = isIsolated ? 'isolated' : 'cross';
        return {
            'info': setting,
            'symbol': symbol,
            'marginMode': marginMode,
            'longLeverage': leverage,
            'shortLeverage': leverage,
        } as Leverage;
    }

    parseLeverageFromMarket (market: Market): Leverage {
        const marketLimits = this.safeDict (market, 'limits', {});
        const leverageLimits = this.safeDict (marketLimits, 'leverage', {});
        return {
            'info': market,
            'symbol': this.safeString (market, 'symbol'),
            'marginMode': this.handleOption ('fetchLeverage', 'defaultMarginMode'),
            'longLeverage': this.safeInteger (leverageLimits, 'max'),
            'shortLeverage': this.safeInteger (leverageLimits, 'max'),
        } as Leverage;
    }

    /**
     * @method
     * @name pacifica#fetchAccountSettings
     * @description fetch account's market settings
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-settings
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object} Dict repacked from list by symbol key
     */
    async fetchAccountSettings (params = {}): Promise<Dict> {
        let userAccount = undefined;
        [ userAccount, params ] = this.handleOriginAndSingleAddress ('fetchAccountSettings', params);
        const request: Dict = {
            'account': userAccount,
        };
        const response = await this.publicGetAccountSettings (this.extend (request, params));
        // {
        //   "success": true,
        //   "data": [
        //     {
        //       "symbol": "WLFI",
        //       "isolated": false,
        //       "leverage": 5,
        //       "created_at": 1758085929703,
        //       "updated_at": 1758086074002
        //     }
        //   ],
        //   "error": null,
        //   "code": null
        // }
        return this.parseAccountSettings (this.safeList (response, 'data', []));
    }

    parseAccountSettings (settings: any[]): Dict {
        const settingsLen = settings.length;
        if (settingsLen === 0) {
            return {};
        }
        const settingsBySymbol = {};
        for (let i = 0; i < settings.length; i++) {
            const symbolExc = settings[i]['symbol'];
            const symbolLocal = this.symbolExcToLocal (symbolExc);
            settingsBySymbol[symbolLocal] = settings[i];
        }
        return settingsBySymbol;
    }

    /**
     * @method
     * @name pacifica#fetchMarginMode
     * @description fetches the margin mode of the trading pair
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        let userAccount = undefined;
        [ userAccount, params ] = this.handleOriginAndSingleAddress ('fetchMarginMode', params);
        const request: Dict = {
            'account': userAccount,
        };
        const settings = await this.fetchAccountSettings (this.extend (request, params));
        // {
        //   "WLFI/USDC:USDC": {
        //       "symbol": "WLFI",
        //       "isolated": false,
        //       "leverage": 5,
        //       "created_at": 1758085929703,
        //       "updated_at": 1758086074002
        //    },
        // }
        const setting = this.safeDict (settings, symbol, undefined);
        if (setting === undefined) {
            // NOTE: Upon account creation, all markets have margin settings default to cross margin and leverage default to max.
            // When querying this endpoint, all markets with default margin and leverage settings on this account will return blank.
            return {
                'symbol': symbol,
                'marginMode': this.handleOption ('fetchMarginMode', 'defaultMarginMode', 'cross'),
            } as MarginMode;
        } else {
            return this.parseMarginModeFromSetting (symbol, setting);
        }
    }

    parseMarginModeFromSetting (symbol: Str, setting: Dict): MarginMode {
        // {
        //       "symbol": "WLFI",
        //       "isolated": false,
        //       "leverage": 5,
        //       "created_at": 1758085929703,
        //       "updated_at": 1758086074002
        //
        // }
        const isIsolated = this.safeBool (setting, 'isolated', false);
        const marginMode = isIsolated ? 'isolated' : 'cross';
        return {
            'symbol': symbol,
            'marginMode': marginMode,
            'info': setting,
        } as MarginMode;
    }

    /**
     * @method
     * @name pacifica#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.aggLevel] aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let aggLevel = undefined;
        [ aggLevel, params ] = this.handleOptionAndParams (params, 'fetchOrderBook', 'aggLevel', 1);
        const request: Dict = {
            'symbol': market['id'],
            'agg_level': aggLevel,
        };
        const response = await this.publicGetBook (this.extend (request, params));
        // {
        //   "success": true,
        //   "data": {
        //     "s": "BTC",
        //     "l": [
        //       [
        //         {
        //           "p": "106504",
        //           "a": "0.26203",
        //           "n": 1
        //         },
        //         {
        //           "p": "106498",
        //           "a": "0.29281",
        //           "n": 1
        //         }
        //       ],
        //       [
        //         {
        //           "p": "106559",
        //           "a": "0.26802",
        //           "n": 1
        //         },
        //         {
        //           "p": "106564",
        //           "a": "0.3002",
        //           "n": 1
        //         },
        //       ]
        //     ],
        //     "t": 1751370536325
        //   },
        //   "error": null,
        //   "code": null
        // }
        const data = this.safeDict (response, 'data', {});
        const levels = this.safeList (data, 'l', []);
        const result: Dict = {
            'bids': this.safeList (levels, 0, []),
            'asks': this.safeList (levels, 1, []),
        };
        const timestamp = this.safeInteger (data, 't');
        return this.parseOrderBook (result, this.safeSymbol (undefined, market), timestamp, 'bids', 'asks', 'p', 'a');
    }

    /**
     * @method
     * @name pacifica#fetchFundingRates
     * @description retrieves data on all swap markets for pacifica
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        const response = await this.publicGetInfoPrices (params);
        //
        //  {
        //     "success": true,
        //     "data": [
        //         {
        //         "funding": "0.00010529",
        //         "mark": "1.084819",
        //         "mid": "1.08615",
        //         "next_funding": "0.00011096",
        //         "open_interest": "3634796",
        //         "oracle": "1.084524",
        //         "symbol": "XPL",
        //         "timestamp": 1759222967974,
        //         "volume_24h": "20896698.0672",
        //         "yesterday_price": "1.3412"
        //         }
        //     ],
        //     "error": null,
        //     "code": null
        //   }
        //
        const result = this.safeList (response, 'data', []);
        return this.parseFundingRates (result, symbols);
    }

    parseFundingRate (info, market: Market = undefined): FundingRate {
        //
        //      {
        //         "funding": "0.00010529",
        //         "mark": "1.084819",
        //         "mid": "1.08615",
        //         "next_funding": "0.00011096",
        //         "open_interest": "3634796",
        //         "oracle": "1.084524",
        //         "symbol": "XPL",
        //         "timestamp": 1759222967974,
        //         "volume_24h": "20896698.0672",
        //         "yesterday_price": "1.3412"
        //       }
        //
        const symbolExc = this.safeString (info, 'symbol');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const funding = this.safeNumber (info, 'funding');
        const markPx = this.safeNumber (info, 'mark');
        const oraclePx = this.safeNumber (info, 'oracle');
        const nextFundingRate = this.safeNumber (info, 'next_funding');
        const timestamp = this.safeInteger (info, 'timestamp');
        const fundingTimestamp = (Math.floor (this.milliseconds () / 60 / 60 / 1000) + 1) * 60 * 60 * 1000;
        return {
            'info': info,
            'symbol': symbolLocal,
            'markPrice': markPx,
            'indexPrice': oraclePx,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': funding,
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': nextFundingRate,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': '1h',
        } as FundingRate;
    }

    /**
     * @method
     * @name pacifica#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-candle-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents, support '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d'
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.until] timestamp in ms of the latest candle to fetch. 'limit' is priority
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (since === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOHLCV() requires a "since" argument');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOHLCV() requires a "symbol" argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'until', undefined);
        const request: Dict = {
            'symbol': market['id'],
            'interval': timeframe,
            'start_time': since,
        };
        const nowMillis = this.milliseconds ();
        if (limit !== undefined) {
            until = since + (limit * (this.parseTimeframe (timeframe) * 1000));
        }
        if (until !== undefined) {
            if (until <= nowMillis) {
                request['end_time'] = until;
            }
        }
        const response = await this.publicGetKline (this.extend (request, params));
        //
        // {
        //   "success": true,
        //   "data": [
        //     {
        //       "t": 1748954160000,
        //       "T": 1748954220000,
        //       "s": "BTC",
        //       "i": "1m",
        //       "o": "105376",
        //       "c": "105376",
        //       "h": "105376",
        //       "l": "105376",
        //       "v": "0.00022",
        //       "n": 2
        //     }
        //   ],
        //   "error": null,
        //   "code": null
        // }
        //
        const candles = this.safeList (response, 'data', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //       "t": 1748954160000,
        //       "T": 1748954220000,
        //       "s": "BTC",
        //       "i": "1m",
        //       "o": "105376",
        //       "c": "105376",
        //       "h": "105376",
        //       "l": "105376",
        //       "v": "0.00022",
        //       "n": 2
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    /**
     * @method
     * @name pacifica#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-recent-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchTrades (symbol: Str, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        // {
        //   "success": true,
        //   "data": [
        //     {
        //       "event_type": "fulfill_taker",
        //       "price": "104721",
        //       "amount": "0.0001",
        //       "side": "close_long",
        //       "cause": "normal",
        //       "created_at": 1765006315306
        //     }
        //   ],
        //   "error": null,
        //   "code": null,
        //   "last_order_id": 1557404170
        // }
        //
        const recentTrades = this.safeList (response, 'data', []);
        return this.parseTrades (recentTrades, market, since, limit);
    }

    /**
     * @method
     * @name pacifica#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-trade-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.until] timestamp in ms of the latest trade
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @param {string|undefined} [params.cursor] pagination cursor from prev request (manual use)
     * @param {boolean|undefined} [params.paginate] set to true to fetch all trades with pagination
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate', false);
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('fetchMyTrades', params);
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'until');
        let cursor = undefined;
        [ cursor, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'cursor');
        const defaultLimit = 100;  // Default max limit
        if (paginate) {
            let allTrades = [];
            let hasMore = true;
            while (hasMore === true) {
                const request: Dict = {};
                request['account'] = userAddress;
                if (symbol !== undefined) {
                    request['symbol'] = market['id'];
                }
                if (since !== undefined) {
                    request['start_time'] = since;
                }
                if (until !== undefined) {
                    request['end_time'] = until;
                }
                request['limit'] = (limit !== undefined) ? Math.min (limit - allTrades.length, defaultLimit) : defaultLimit;
                if (cursor !== undefined) {
                    request['cursor'] = cursor;
                }
                const response = await this.publicGetTradesHistory (this.extend (request, params));
                //
                // {
                //   "success": true,
                //   "data": [
                //     {
                //       "history_id": 19329801,
                //       "order_id": 315293920,
                //       "client_order_id": "acf...",
                //       "symbol": "LDO",
                //       "amount": "0.1",
                //       "price": "1.1904",
                //       "entry_price": "1.176247",
                //       "fee": "0",
                //       "pnl": "-0.001415",
                //       "event_type": "fulfill_maker",
                //       "side": "close_short",
                //       "created_at": 1759215599188,
                //       "cause": "normal"
                //     },
                //     ...
                //   ],
                //   "next_cursor": "11111Z5RK", // not included to info!
                //   "has_more": true   // not included to info!
                // }
                //
                const data = this.safeList (response, 'data', []);
                const parsedTrades = this.parseTrades (data, market);
                allTrades = this.arrayConcat (allTrades, parsedTrades);
                cursor = this.safeString (response, 'next_cursor');
                hasMore = this.safeBool (response, 'has_more', false);
                if (limit !== undefined && allTrades.length >= limit) {
                    break;
                }
                if (!hasMore || cursor === undefined) {
                    break;
                }
            }
            return this.filterBySymbolSinceLimit (allTrades, symbol, since, limit);
        } else {
            const request: Dict = {};
            request['account'] = userAddress;
            if (symbol !== undefined) {
                request['symbol'] = market['id'];
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (cursor !== undefined) {
                request['cursor'] = cursor;
            }
            if (since !== undefined) {
                request['start_time'] = since;
            }
            if (until !== undefined) {
                request['end_time'] = until;
            }
            const response = await this.publicGetTradesHistory (this.extend (request, params));
            //
            // {
            //   "success": true,
            //   "data": [
            //     {
            //       "history_id": 19329801,
            //       "order_id": 315293920,
            //       "client_order_id": "acf...",
            //       "symbol": "LDO",
            //       "amount": "0.1",
            //       "price": "1.1904",
            //       "entry_price": "1.176247",
            //       "fee": "0",
            //       "pnl": "-0.001415",
            //       "event_type": "fulfill_maker",
            //       "side": "close_short",
            //       "created_at": 1759215599188,
            //       "cause": "normal"
            //     },
            //     ...
            //   ],
            //   "next_cursor": "11111Z5RK", // not included to info!
            //   "has_more": true   // not included to info!
            // }
            //
            const data = this.safeList (response, 'data', []);
            return this.parseTrades (data, market, since, limit);
        }
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // user trades:
        //     {
        //       "history_id": 19329801,
        //       "order_id": 315293920,
        //       "client_order_id": "acf...",
        //       "symbol": "LDO",
        //       "amount": "0.1",
        //       "price": "1.1904",
        //       "entry_price": "1.176247",
        //       "fee": "0",
        //       "pnl": "-0.001415",
        //       "event_type": "fulfill_maker",
        //       "side": "close_short",
        //       "created_at": 1759215599188,
        //       "cause": "normal"
        //     },
        // recent public trades:
        //     {
        //       "event_type": "fulfill_taker",
        //       "price": "104721",
        //       "amount": "0.0001",
        //       "side": "close_long",
        //       "cause": "normal",
        //       "created_at": 1765006315306
        //     }
        //
        const eventType = this.safeString (trade, 'event_type');
        const timestamp = this.safeInteger (trade, 'created_at');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const symbol = this.safeSymbol (undefined, market);
        const id = this.safeString (trade, 'history_id');
        let side = this.safeString (trade, 'side');
        if (side === 'open_long') {
            side = 'buy';
        } else if (side === 'close_long') {
            side = 'sell';
        } else if (side === 'open_short') {
            side = 'sell';
        } else if (side === 'close_short') {
            side = 'buy';
        }
        const fee = this.safeString (trade, 'fee');
        const orderId = this.safeString (trade, 'order_id');
        let takerOrMaker = undefined;
        if (eventType !== undefined) {
            takerOrMaker = (eventType === 'fulfill_maker') ? 'maker' : 'taker';
        }
        // public trades have no orderId
        if (orderId === undefined) {
            takerOrMaker = undefined;
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': {
                'cost': fee,
                'currency': 'USDC',
                'rate': undefined,
            },
        }, market);
    }

    /**
     * @method
     * @name pacifica#createOrder
     * @description create a trade order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-limit-order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-market-order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-stop-order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-position-tp-sl
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float|undefined} [params.stopPrice] alias for triggerPrice
     * @param {float|undefined} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float|undefined} [params.stopLossPrice] the price that a stop loss order is triggered at (optional provide stopLossCloid)
     * @param {float|undefined} [params.takeProfitPrice] the price that a take profit order is triggered at (optional provide takeProfitCloid)
     * @param {string|undefined} [params.timeInForce] "GTC", "IOC", or "PO" or "ALO" or "PO_TOB" (or "TOB" - PO by top of book)
     * @param {bool|undefined} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string|undefined} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use.
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @param {string|undefined} [params.builderCode] only if builder approved.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const [ request, operationType ] = this.createOrderRequest (symbol, type, side, amount, price, params);
        params = this.omit (params, [
            'reduceOnly', 'reduce_only', 'clientOrderId', 'stopLimitPrice', 'timeInForce', 'tif', 'stopPrice', 'triggerPrice', 'stopLossCloid', 'builderCode',
            'stopLossPrice', 'stopLossLimitPrice', 'takeProfitCloid', 'takeProfitPrice', 'takeProfitLimitPrice', 'expiryWindow', 'expiry_window', 'agentAddress', 'originAddress',
        ]);
        let response = undefined;
        if (operationType === 'create_market_order') {
            response = await this.privatePostOrdersCreateMarket (this.extend (request, params));
        } else if (operationType === 'create_stop_order') {
            response = await this.privatePostOrdersStopCreate (this.extend (request, params));
        } else if (operationType === 'set_position_tpsl') {
            response = await this.privatePostPositionsTpsl (this.extend (request, params));
        } else { // create_order
            response = await this.privatePostOrdersCreate (this.extend (request, params));
        }
        //
        // {
        //   'success': true,
        //   'data': {
        //    "order_id": 12345
        //    },
        // }
        //
        const error = this.safeString (response, 'error', undefined);
        const success = this.safeBool (response, 'success', false);
        let status = undefined;
        if ((error !== undefined) || (!success)) {
            status = 'rejected';
        } else {
            status = 'open';
        }
        const order = this.safeDict (response, 'data', {});
        const orderId = this.safeString (order, 'order_id');
        return this.safeOrder ({ 'id': orderId, 'status': status, 'info': response, 'symbol': symbol });
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name pacifica#createOrderRequest
         * @description create a trade order
         * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-limit-order
         * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-market-order
         * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-stop-order
         * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-position-tp-sl
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders, but can be used as limit_price of Trigger Order.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float|undefined} [params.stopPrice] alias for triggerPrice
         * @param {float|undefined} [params.triggerPrice] The price a trigger order is triggered at
         * @param {float|undefined} [params.stopLossPrice] the price that a stop loss order is triggered at (optional provide stopLossCloid)
         * @param {float|undefined} [params.takeProfitPrice] the price that a take profit order is triggered at (optional provide takeProfitCloid)
         * @param {string|undefined} [params.timeInForce] "GTC", "IOC", or "PO" or "ALO" or "PO_TOB" (or "TOB" - PO by top of book)
         * @param {bool|undefined} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
         * @param {string|undefined} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
         * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
         * @param {string|undefined} [params.agentAddress] only if agent wallet in use
         * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
         * @param {string|undefined} [params.builderCode] only if builder approved
         * @returns {object} an [order structure]
         */
        const market = this.market (symbol);
        const sigPayload: Dict = {
            'symbol': market['id'],
        };
        let operationType = undefined;
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only', false);
        const orderType = type.toUpperCase ();
        const orderSide = this.mapSide (side);
        if (orderSide !== undefined) {
            sigPayload['side'] = orderSide;
        }
        amount = this.parseNumber (amount);
        price = this.parseNumber (price);
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        const tifRaw = this.safeStringUpper2 (params, 'timeInForce', 'tif');
        const isMarket = orderType === 'MARKET';
        const isTakeProfitOrder = (takeProfitPrice !== undefined);
        const isStopLossOrder = (stopLossPrice !== undefined);
        const isStopOrder = (triggerPrice !== undefined);
        const timeInForce = this.mapTimeInForce (tifRaw);
        if (isMarket) {
            operationType = 'create_market_order';
            sigPayload['reduce_only'] = reduceOnly;
            const defaultSlippage = this.handleOption ('createOrder', 'defaultSlippage', '0.5');
            const slippage = this.safeString2 (params, 'slippage', 'slippage_percent', defaultSlippage);
            sigPayload['slippage_percent'] = slippage;
        } else if ((isTakeProfitOrder || isStopLossOrder) && (price === undefined)) { // the tpsl endpoint does not accept a 'price' parameter
            operationType = 'set_position_tpsl';
        } else if (isStopOrder) {
            operationType = 'create_stop_order';
            sigPayload['reduce_only'] = reduceOnly;
            const stopClientOrderId = this.safeString (params, 'clientOrderId');
            params = this.omit (params, [ 'clientOrderId' ]);
            const stopLimitPrice = this.safeString (params, 'stopLimitPrice', this.priceToPrecision (symbol, price)); // Default limit price for stop order is price from args.
            const stopPayload = {
                'amount': this.amountToPrecision (symbol, amount),
                'stop_price': this.priceToPrecision (symbol, triggerPrice),
            };
            if (stopClientOrderId !== undefined) {
                stopPayload['client_order_id'] = stopClientOrderId;
            }
            if (stopLimitPrice !== undefined) {
                stopPayload['limit_price'] = this.priceToPrecision (symbol, stopLimitPrice);
            }
            sigPayload['stop_order'] = stopPayload;
        } else {
            operationType = 'create_order';
            sigPayload['reduce_only'] = reduceOnly;
            if (timeInForce === undefined) {
                sigPayload['tif'] = 'GTC';
            } else {
                sigPayload['tif'] = timeInForce;
            }
        }
        if (isTakeProfitOrder) {
            const tpCloid = this.safeString (params, 'takeProfitCloid');
            const tpLimitPrice = this.safeString (params, 'takeProfitLimitPrice');
            const tpPayload: Dict = {
                'stop_price': this.priceToPrecision (symbol, takeProfitPrice),
            };
            if (tpCloid !== undefined) {
                tpPayload['client_order_id'] = tpCloid;
            }
            if (tpLimitPrice !== undefined) {
                tpPayload['limit_price'] = this.priceToPrecision (symbol, tpLimitPrice);
            }
            sigPayload['take_profit'] = tpPayload;
        }
        if (isStopLossOrder) {
            const slCloid = this.safeString (params, 'stopLossCloid');
            const slLimitPrice = this.safeString (params, 'stopLossLimitPrice');
            const slPayload: Dict = {
                'stop_price': this.priceToPrecision (symbol, stopLossPrice),
            };
            if (slCloid !== undefined) {
                slPayload['client_order_id'] = slCloid;
            }
            if (slLimitPrice !== undefined) {
                slPayload['limit_price'] = this.priceToPrecision (symbol, slLimitPrice);
            }
            sigPayload['stop_loss'] = slPayload;
        }
        if (price !== undefined && operationType === 'create_order') {
            sigPayload['price'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined && (operationType !== 'create_stop_order' && operationType !== 'set_position_tpsl')) {
            sigPayload['amount'] = this.amountToPrecision (symbol, amount);
        }
        const clientOrderId = this.safeStringN (params, [ 'clientOrderId' ]);
        if (clientOrderId !== undefined) {
            sigPayload['client_order_id'] = clientOrderId;
        }
        const request = this.postActionRequest (operationType, sigPayload, params);
        return [ request, operationType ];
    }

    batchOrdersRequest (actions: any[]) {
        //
        // [
        //     {
        //         "type":"Create",
        //         "data":{
        //             "account":"42trU9A5...",
        //             "signature":"5UpRZ14Q...",
        //             "timestamp":1749190500355,
        //             "expiry_window":5000,
        //             "symbol":"BTC",
        //             "price":"100000",
        //             "reduce_only":false,
        //             "amount":"0.1",
        //             "side":"bid",
        //             "tif":"GTC",
        //             "client_order_id":"57a5efb1-bb96-49a5-8bfd-f25d5f22bc7e"
        //         }
        //     },
        //     {
        //         "type":"Cancel",
        //         "data":{
        //             "account":"42trU9A5...",
        //             "signature":"4NDFHyTG...",
        //             "timestamp":1749190500355,
        //             "expiry_window":5000,
        //             "symbol":"BTC",
        //             "order_id":42069
        //         }
        //     }
        // ]
        //
        //  Create (Only Limit or Market, never stop order or tpsl order)
        //  Cancel (Only common (limit) orders)
        //
        const lenActions = actions.length;
        const maxLen = this.handleOption ('batchOrdersRequest', 'batchOrdersMax');
        if (maxLen !== undefined) {
            if (lenActions > maxLen) {
                throw new ExchangeError (this.id + ' batchOrdersRequest() too many orders to create/cancel. Limit is ' + maxLen);
            }
        }
        return {
            'actions': actions,
        };
    }

    createOrdersRequest (orders: OrderRequest[], params = {}) {
        const actions = [];
        const timestamp = this.milliseconds (); // unified sequence
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const symbol = this.safeString (order, 'symbol');
            const side = this.safeString (order, 'side');
            const price = this.safeNumber (order, 'price');
            const type = this.safeString (order, 'type', 'limit');
            const orderParams = this.safeDict (order, 'params', {});
            orderParams['timestamp'] = timestamp;
            const amount = this.safeNumber (order, 'amount');
            if (type !== 'limit') {
                throw new NotSupported (this.id + ' createOrders() supports only type = "limit"! Your value type=' + type);
            }
            const requestList = this.createOrderRequest (symbol, type, side, amount, price, orderParams);
            const action = {
                'type': 'Create',
                'data': requestList[0],
            };
            actions.push (action);
        }
        return this.batchOrdersRequest (actions);
    }

    /**
     * @method
     * @name pacifica#createOrders
     * @description create a list of trade orders. It is supports only limit orders!
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/batch-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type (optional or 'limit'), side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        const request = this.createOrdersRequest (orders);
        const response = await this.privatePostOrdersBatch (this.extend (request, params));
        // {
        //   "success": true,
        //   "data": {
        //     "results": [
        //       {
        //         "success": true,
        //         "order_id": 470506,
        //         "error": null
        //       },
        //       {
        //         "success": true,
        //       }
        //     ]
        //   },
        //     "error": null,
        //     "code": null
        // }
        //
        const data = this.safeDict (response, 'data', {});
        const results = this.safeList (data, 'results', []);
        const ordersToReturn = [];
        for (let i = 0; i < results.length; i++) {
            const order = results[i];
            const error = this.safeString (order, 'error', undefined);
            const success = this.safeBool (order, 'success', false);
            let status = undefined;
            if ((error !== undefined) || (!success)) {
                status = 'rejected';
            } else {
                status = 'open';
            }
            const order_id = this.safeString (order, 'order_id');
            ordersToReturn.push (this.safeOrder ({ 'info': order, 'id': order_id, 'status': status }));
        }
        return ordersToReturn as Order[];
    }

    /**
     * @method
     * @name pacifica#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/batch-order
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|string[]} [params.clientOrderIds] client order ids, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a "symbol" argument!');
        }
        const request = this.cancelOrdersRequest (ids, symbol, params);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window', 'clientOrderIds' ]);
        const response = await this.privatePostOrdersBatch (this.extend (request, params));
        //
        // {
        //   "success": true,
        //   "data": {
        //     "results": [
        //       {
        //         "success": true,
        //         "order_id": 470506,
        //         "error": null
        //       },
        //       {
        //         "success": true,
        //       }
        //     ]
        //   },
        //     "error": null,
        //     "code": null
        // }
        //
        const data = this.safeDict (response, 'data', {});
        const results = this.safeList (data, 'results', []);
        const ordersToReturn = [];
        for (let i = 0; i < results.length; i++) {
            const order = results[i];
            const error = this.safeString (order, 'error', undefined);
            const success = this.safeBool (order, 'success', false);
            let status = undefined;
            if ((error !== undefined) || (!success)) {
                status = 'closed';
            } else {
                status = 'canceled';
            }
            ordersToReturn.push (this.safeOrder ({ 'info': order, 'status': status, 'symbol': symbol }));
        }
        return ordersToReturn as Order[];
    }

    cancelOrdersRequest (ids: string[], symbol: Str = undefined, params = {}) {
        if (ids !== undefined) {
            ids = [];
        }
        const isStopOrder = this.safeBool (params, 'isStopOrder', false);
        if (isStopOrder) {
            throw new NotSupported (this.id + ' cancelOrders() do not support param "isStopOrder" (will be false only) !');
        }
        const actions = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const request = this.cancelOrderRequest (id, symbol, params);
            const action = {
                'type': 'Cancel',
                'data': request,
            };
            actions.push (action);
        }
        let clientOrderIds = undefined;
        [ clientOrderIds, params ] = this.handleOptionAndParams (params, 'cancelOrders', 'clientOrderIds', []);
        for (let i = 0; i < clientOrderIds.length; i++) {
            const cloid = clientOrderIds[i];
            const cloidParams = {
                'clientOrderId': cloid,
            };
            const request = this.cancelOrderRequest (cloid, symbol, this.extend (cloidParams, params));
            const action = {
                'type': 'Cancel',
                'data': request,
            };
            actions.push (action);
        }
        return this.batchOrdersRequest (actions);
    }

    /**
     * @method
     * @name pacifica#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-all-orders
     * @param {string} symbol (optional) unified market symbol of the market to cancel orders in.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.excludeReduceOnly] whether to exclude reduce-only orders
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        const request = this.cancelAllOrdersRequest (symbol, params);
        params = this.omit (params, [ 'excludeReduceOnly', 'exclude_reduce_only', 'agentAddress', 'originAddress', 'expiryWindow', 'expiry_window' ]);
        const response = await this.privatePostOrdersCancelAll (this.extend (request, params));
        //
        // {
        //   success: true,
        //   data: {
        //     "cancelled_count": 5,
        //   },
        //   code: null,
        //   error: null
        // }
        //
        return [
            this.safeOrder ({
                'info': response,
            }),
        ] as Order[];
    }

    cancelAllOrdersRequest (symbol: string, params: Dict = {}) {
        const operationType = 'cancel_all_orders';
        const sigPayload: Dict = { };
        const excludeReduceOnly = this.safeBool (params, 'excludeReduceOnly', false);
        sigPayload['exclude_reduce_only'] = excludeReduceOnly;
        let symbolExc = undefined;
        if (symbol !== undefined) {
            this.loadMarkets ();
            const market = this.market (symbol);
            symbolExc = this.safeString (market, 'id');
            sigPayload['all_symbols'] = false;
            sigPayload['symbol'] = symbolExc;
        } else {
            sigPayload['all_symbols'] = true;
        }
        const request = this.postActionRequest (operationType, sigPayload, params);
        return request;
    }

    /**
     * @method
     * @name pacifica#cancelOrder
     * @description cancels an open order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-stop-order#response
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @param {bool} [params.isStopOrder] Required if order is stop order. (Another endpoint in use)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        const request = this.cancelOrderRequest (id, symbol, params);
        const isStopOrder = this.safeBool2 (params, 'isStopOrder', 'is_stop_order', false);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window', 'is_stop_order', 'isStopOrder', 'clientOrderId' ]);
        let response = undefined;
        if (isStopOrder) {
            response = await this.privatePostOrdersStopCancel (this.extend (request, params));
        } else {
            response = await this.privatePostOrdersCancel (this.extend (request, params));
        }
        //
        // response:
        // {
        //   "success": true,
        //   "data": null
        // }
        //
        const success = this.safeBool (response, 'success', false);
        const status = success ? 'canceled' : 'closed';
        return this.safeOrder ({ 'id': id, 'status': status, 'info': response, 'symbol': symbol });
    }

    cancelOrderRequest (id: Str, symbol: Str = undefined, params = {}) {
        const market = this.market (symbol);
        const isStopOrder = this.safeBool (params, 'isStopOrder', false);
        let operationType = undefined;
        if (isStopOrder) {
            operationType = 'cancel_stop_order';
        } else {
            operationType = 'cancel_order';
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        const symbolExc = market['id'];
        const sigPayload: Dict = {
            'symbol': symbolExc,
        };
        if ((clientOrderId === undefined) && (id === undefined)) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires either "id" or "clientOrderId"');
        }
        if (clientOrderId !== undefined) {
            sigPayload['client_order_id'] = clientOrderId;
        } else {
            sigPayload['order_id'] = this.parseToInt (id);
        }
        const request = this.postActionRequest (operationType, sigPayload, params);
        return request;
    }

    /**
     * @method
     * @name pacifica#editOrder
     * @description edit a trade order
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/edit-order
     * @param {string} id edit order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit' WARN is not usable
     * @param {string} side 'buy' or 'sell' WARN is not usable
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = this.editOrderRequest (id, symbol, type, side, amount, price, market, params);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window', 'clientOrderId' ]);
        const response = await this.privatePostOrdersEdit (this.extend (request, params));
        //
        // {
        //     'data': {
        //         "order_id": 123498765
        //     }
        // }
        //
        const data = this.safeDict (response, 'data', {});
        const order_id = this.safeString (data, 'order_id');
        return this.safeOrder ({ 'id': order_id, 'info': response, 'symbol': symbol });
    }

    editOrderRequest (id: string, symbol: string, type: string, side: string, amount: Num, price: Num, market: Market, params = {}) {
        // should we throw?
        if (side !== undefined) {
            throw new NotSupported (this.id + ' editOrder() do not support side');
        }
        if (type !== undefined) {
            throw new NotSupported (this.id + ' editOrder() do not support type');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount!');
        }
        if (price === undefined) {
            throw new NotSupported (this.id + ' editOrder() requires a price');
        }
        const operationType = 'edit_order';
        const clientOrderId = this.safeString (params, 'clientOrderId');
        const symbolExc = market['id'];
        const priceNormalized = this.priceToPrecision (symbol, price);
        const amountNormalized = this.amountToPrecision (symbol, amount);
        const sigPayload: Dict = {
            'symbol': symbolExc,
            'price': priceNormalized,
            'amount': amountNormalized,
        };
        if ((clientOrderId === undefined) && (id === undefined)) {
            throw new ArgumentsRequired ('this.id' + 'editOrder() requires either "id" or "clientOrderId"');
        }
        if (clientOrderId !== undefined) {
            sigPayload['client_order_id'] = clientOrderId;
        } else {
            sigPayload['order_id'] = this.parseToInt (id);
        }
        const request = this.postActionRequest (operationType, sigPayload, params);
        return request;
    }

    /**
     * @method
     * @name pacifica#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-historical-funding
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.cursor] pagination cursor from prev request (manual use)
     * @param {boolean|undefined} [params.paginate] set to true to fetch all funding rates with pagination
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        const market = this.market (symbol);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate', false);
        let cursor = undefined;
        [ cursor, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'cursor');
        const defaultLimit = 100;  // Default max limit
        if (paginate) {
            let allEntries = [];
            let hasMore = true;
            while (hasMore === true) {
                const request: Dict = {
                    'symbol': market['id'],
                };
                request['limit'] = (limit !== undefined) ? Math.min (limit - allEntries.length, defaultLimit) : defaultLimit;
                if (cursor !== undefined) {
                    request['cursor'] = cursor;
                }
                const response = await this.publicGetFundingRateHistory (this.extend (request, params));
                //
                // {
                //   "success": true,
                //   "data": [
                //     {
                //       "oracle_price": "117170.410304",
                //       "bid_impact_price": "117126",
                //       "ask_impact_price": "117142",
                //       "funding_rate": "0.0000125",
                //       "next_funding_rate": "0.0000125",
                //       "created_at": 1753806934249
                //     },
                //     ...
                //   ],
                //   "next_cursor": "11114Lz77", // not included in info!
                //   "has_more": true            // not included in info!
                // }
                //
                const data = this.safeList (response, 'data', []);
                const parsed = [];
                for (let i = 0; i < data.length; i++) {
                    const entry = data[i];
                    const timestamp = this.safeInteger (entry, 'created_at');
                    parsed.push ({
                        'info': entry,
                        'symbol': market['symbol'],
                        'fundingRate': this.safeNumber (entry, 'funding_rate'),
                        'timestamp': timestamp,
                        'datetime': this.iso8601 (timestamp),
                    });
                }
                allEntries = this.arrayConcat (allEntries, parsed);
                cursor = this.safeString (response, 'next_cursor');
                hasMore = this.safeBool (response, 'has_more', false);
                if (limit !== undefined && allEntries.length >= limit) {
                    break;
                }
                if (!hasMore || cursor === undefined) {
                    break;
                }
            }
            const sorted = this.sortBy (allEntries, 'timestamp');
            return this.filterBySinceLimit (sorted, since, limit, 'timestamp') as FundingRateHistory[];
        } else {
            const request: Dict = {
                'symbol': market['id'],
            };
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (cursor !== undefined) {
                request['cursor'] = cursor;
            }
            const response = await this.publicGetFundingRateHistory (this.extend (request, params));
            //
            // {
            //   "success": true,
            //   "data": [
            //     {
            //       "oracle_price": "117170.410304",
            //       "bid_impact_price": "117126",
            //       "ask_impact_price": "117142",
            //       "funding_rate": "0.0000125",
            //       "next_funding_rate": "0.0000125",
            //       "created_at": 1753806934249
            //     },
            //     ...
            //   ],
            //   "next_cursor": "11114Lz77", // not included in info!
            //   "has_more": true            // not included in info!
            // }
            //
            const data = this.safeList (response, 'data', []);
            const result = [];
            for (let i = 0; i < data.length; i++) {
                const entry = data[i];
                const timestamp = this.safeInteger (entry, 'created_at');
                result.push ({
                    'info': entry,
                    'symbol': market['symbol'],
                    'fundingRate': this.safeNumber (entry, 'funding_rate'),
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                });
            }
            const sorted = this.sortBy (result, 'timestamp');
            return this.filterBySinceLimit (sorted, since, limit, 'timestamp') as FundingRateHistory[];
        }
    }

    /**
     * @method
     * @name pacifica#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-prices
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetInfoPrices (params);
        //
        //  {
        //   "success": true,
        //   "data": [
        //     {
        //       "funding": "0.00010529",
        //       "mark": "1.084819",
        //       "mid": "1.08615",
        //       "next_funding": "0.00011096",
        //       "open_interest": "3634796",
        //       "oracle": "1.084524",
        //       "symbol": "XPL",
        //       "timestamp": 1759222967974,
        //       "volume_24h": "20896698.0672",
        //       "yesterday_price": "1.3412"
        //     }
        //   ],
        //   "error": null,
        //   "code": null
        // }
        //
        const data = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const info = data[i];
            const ticker = this.parseTicker (info);
            const symbol = this.safeString (ticker, 'symbol');
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //       "funding": "0.00010529",
        //       "mark": "1.084819",
        //       "mid": "1.08615",
        //       "next_funding": "0.00011096",
        //       "open_interest": "3634796",
        //       "oracle": "1.084524",
        //       "symbol": "XPL",
        //       "timestamp": 1759222967974,
        //       "volume_24h": "20896698.0672",
        //       "yesterday_price": "1.3412"
        //     }
        //
        const symbolExc = this.safeString (ticker, 'symbol');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        return this.safeTicker ({
            'symbol': symbolLocal,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'previousClose': this.safeNumber (ticker, 'yesterday_price'),
            'close': this.safeNumber (ticker, 'mid'),
            'bid': undefined,
            'ask': undefined,
            'quoteVolume': this.safeNumber (ticker, 'volume_24h'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name pacifica#fetchClosedOrders
     * @description fetch all unfilled currently closed orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const orders = await this.fetchOrders (symbol, undefined, undefined, params); // don't filter here because we don't want to catch open orders
        const closedOrders = this.filterByArray (orders, 'status', [ 'closed' ], false);
        return this.filterBySymbolSinceLimit (closedOrders, symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name pacifica#fetchCanceledOrders
     * @description fetch all canceled orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const orders = await this.fetchOrders (symbol, undefined, undefined, params); // don't filter here because we don't want to catch open orders
        const closedOrders = this.filterByArray (orders, 'status', [ 'canceled' ], false);
        return this.filterBySymbolSinceLimit (closedOrders, symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name pacifica#fetchCanceledAndClosedOrders
     * @description fetch all closed and canceled orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const orders = await this.fetchOrders (symbol, undefined, undefined, params); // don't filter here because we don't want to catch open orders
        const closedOrders = this.filterByArray (orders, 'status', [ 'canceled', 'closed', 'rejected' ], false);
        return this.filterBySymbolSinceLimit (closedOrders, symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name pacifica#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-open-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('fetchOpenOrders', params);
        const request: Dict = {
            'account': userAddress,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.publicGetOrders (this.extend (request, params));
        //
        // {
        //   "success": true,
        //   "data": [
        //     {
        //       "order_id": 315979358,
        //       "client_order_id": "add9a4b5-c7f7-4124-b57f-86982d86d479",
        //       "symbol": "ASTER",
        //       "side": "ask",
        //       "price": "1.836",
        //       "initial_amount": "85.33",
        //       "filled_amount": "0",
        //       "cancelled_amount": "0",
        //       "stop_price": null,
        //       "order_type": "limit",
        //       "stop_parent_order_id": null,
        //       "reduce_only": false,
        //       "created_at": 1759224706737,
        //       "updated_at": 1759224706737
        //     }
        //   ],
        //   "error": null,
        //   "code": null,
        //   "last_order_id": 1557370337
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name pacifica#fetchOrders
     * @description fetch all orders
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-order-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @param {string|undefined} [params.cursor] pagination cursor from prev request (manual use)
     * @param {boolean|undefined} [params.paginate] set to true to fetch all orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate', false);
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('fetchOrders', params);
        let cursor = undefined;
        [ cursor, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'cursor');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const defaultLimit = 100; // max default 100
        if (paginate) {
            let allOrders = [];
            let hasMore = true;
            while (hasMore === true) {
                const request: Dict = {
                    'account': userAddress,
                };
                request['limit'] = (limit !== undefined) ? Math.min (limit - allOrders.length, defaultLimit) : defaultLimit;
                if (cursor !== undefined) {
                    request['cursor'] = cursor;
                }
                const response = await this.publicGetOrdersHistory (this.extend (request, params));
                //
                // {
                //   "success": true,
                //   "data": [
                //     {
                //       "order_id": 315992721,
                //       "client_order_id": "ade",
                //       "symbol": "XPL",
                //       "side": "ask",
                //       "initial_price": "1.0865",
                //       "average_filled_price": "0",
                //       "amount": "984",
                //       "filled_amount": "0",
                //       "order_status": "open",
                //       "order_type": "limit",
                //       "stop_price": null,
                //       "stop_parent_order_id": null,
                //       "reduce_only": false,
                //       "reason": null,
                //       "created_at": 1759224893638,
                //       "updated_at": 1759224893638
                //     },
                //     ...
                //   ],
                //   "next_cursor": "1111Hyd74",  // not included in info!
                //   "has_more": true             // not included in info!
                // }
                //
                const data = this.safeList (response, 'data', []);
                const parsed = this.parseOrders (data, market);
                allOrders = this.arrayConcat (allOrders, parsed);
                cursor = this.safeString (response, 'next_cursor');
                hasMore = this.safeBool (response, 'has_more', false);
                if (limit !== undefined && allOrders.length >= limit) {
                    break;
                }
                if (!hasMore || cursor === undefined) {
                    break;
                }
            }
            const sorted = this.sortBy (allOrders, 'timestamp');
            return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
        } else {
            const request: Dict = {
                'account': userAddress,
            };
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (cursor !== undefined) {
                request['cursor'] = cursor;
            }
            const response = await this.publicGetOrdersHistory (this.extend (request, params));
            const data = this.safeList (response, 'data', []);
            return this.parseOrders (data, market, since, limit);
        }
    }

    /**
     * @method
     * @name pacifica#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-order-history-by-id
     * @param {string} id order id
     * @param {string} symbol (optional) unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.publicGetOrdersHistoryById (this.extend (request, params));
        //
        // {
        //   "success": true,
        //   "data": [
        //     {
        //       "history_id": 641452639,
        //       "order_id": 315992721,
        //       "client_order_id": "ade1aa6...",
        //       "symbol": "XPL",
        //       "side": "ask",
        //       "price": "1.0865",
        //       "initial_amount": "984",
        //       "filled_amount": "0",
        //       "cancelled_amount": "984",
        //       "event_type": "cancel",
        //       "order_type": "limit",
        //       "order_status": "cancelled",
        //       "stop_price": null,
        //       "stop_parent_order_id": null,
        //       "reduce_only": false,
        //       "created_at": 1759224895038
        //     },
        //     {
        //       "history_id": 641452513,
        //       "order_id": 315992721,
        //       "client_order_id": "ade1aa6...",
        //       "symbol": "XPL",
        //       "side": "ask",
        //       "price": "1.0865",
        //       "initial_amount": "984",
        //       "filled_amount": "0",
        //       "cancelled_amount": "0",
        //       "event_type": "make",
        //       "order_type": "limit",
        //       "order_status": "open",
        //       "stop_price": null,
        //       "stop_parent_order_id": null,
        //       "reduce_only": false,
        //       "created_at": 1759224893638
        //     }
        //   ],
        //   "error": null,
        //   "code": null
        // }
        //
        const data = this.safeList (response, 'data', []);
        // return last state
        const sorted = this.sortBy (data, 'created_at');
        const lastIdx = sorted.length;
        let lastInfo = {};
        if (lastIdx > 0) {
            lastInfo = sorted[0];
        }
        return this.parseOrder (lastInfo, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'open': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'rejected': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    mapTimeInForce (tifRaw: string) {
        const tifMap: Dict = {
            'GTC': 'GTC',
            'IOC': 'IOC',
            'PO': 'ALO',
            'POST_ONLY': 'ALO',
            'PO_TOB': 'TOB',
            'TOB': 'TOB',
            'ALO': 'ALO',
        };
        let tif = undefined;
        if (tifRaw !== undefined) {
            tif = tifRaw.toUpperCase ();
        }
        return this.safeString (tifMap, tif, undefined);
    }

    mapSide (sideRaw: string) {
        const sideMap: Dict = {
            'BID': 'bid',
            'ASK': 'ask',
            'SELL': 'ask',
            'BUY': 'bid',
            'SHORT': 'ask',
            'LONG': 'bid',
        };
        let side = undefined;
        if (sideRaw !== undefined) {
            side = sideRaw.toUpperCase ();
        }
        return this.safeString (sideMap, side, undefined);
    }

    parseOrderType (status: string) {
        const statuses: Dict = {
            'stop_limit': 'limit',
            'stop_market': 'market',
            'take_profit_limit': 'limit',
            'stop_loss_limit': 'limit',
            'take_profit_market': 'market',
            'stop_loss_market': 'market',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // fetchOpenOrders
        //   [
        //     {
        //       "order_id": 315979358,
        //       "client_order_id": "add9a4b5-c7f7-4124-b57f-86982d86d479",
        //       "symbol": "ASTER",
        //       "side": "ask",
        //       "price": "1.836",
        //       "initial_amount": "85.33",
        //       "filled_amount": "0",
        //       "cancelled_amount": "0",
        //       "stop_price": null,
        //       "order_type": "limit",
        //       "stop_parent_order_id": null,
        //       "reduce_only": false,
        //       "created_at": 1759224706737,
        //       "updated_at": 1759224706737
        //     }
        //   ],
        //
        // fetchOrders
        //  [
        //     {
        //       "order_id": 315992721,
        //       "client_order_id": "ade",
        //       "symbol": "XPL",
        //       "side": "ask",
        //       "initial_price": "1.0865",
        //       "average_filled_price": "0",
        //       "amount": "984",
        //       "filled_amount": "0",
        //       "order_status": "open",
        //       "order_type": "limit",
        //       "stop_price": null,
        //       "stop_parent_order_id": null,
        //       "reduce_only": false,
        //       "reason": null,
        //       "created_at": 1759224893638,
        //       "updated_at": 1759224893638
        //     },
        //  ]
        //
        // fetchOrder
        //     {
        //       "history_id": 641452639,
        //       "order_id": 315992721,
        //       "client_order_id": "ade1aa6...",
        //       "symbol": "XPL",
        //       "side": "ask",
        //       "price": "1.0865",
        //       "initial_amount": "984",
        //       "filled_amount": "0",
        //       "cancelled_amount": "984",
        //       "event_type": "cancel",
        //       "order_type": "limit",
        //       "order_status": "cancelled",
        //       "stop_price": null,
        //       "stop_parent_order_id": null,
        //       "reduce_only": false,
        //       "created_at": 1759224895038
        //     }
        //
        // websocket watchOrders
        //     {
        //       "i": 1559665358,
        //       "I": null,
        //       "u": "BrZp5bidJ3WUvceSq7X78bhjTfZXeezzGvGEV4hAYKTa",
        //       "s": "BTC",
        //       "d": "bid",
        //       "p": "89501",
        //       "ip": "89501",
        //       "lp": "89501",
        //       "a": "0.00012",
        //       "f": "0.00012",
        //       "oe": "fulfill_limit",
        //       "os": "filled",
        //       "ot": "limit",
        //       "sp": null,
        //       "si": null,
        //       "r": false,
        //       "ct": 1765017049008,
        //       "ut": 1765017219639,
        //       "li": 1559696133
        //     }
        //
        const symbolExc = this.safeString2 (order, 'symbol', 's');
        let symbolLocal = undefined;
        if (symbolExc !== undefined) {
            symbolLocal = this.symbolExcToLocal (symbolExc);
        }
        const timestamp = this.safeInteger2 (order, 'created_at', 'ct');
        const status = this.safeString2 (order, 'order_status', 'os');
        let side = this.safeString (order, 'side', 'd');
        if (side !== undefined) {
            side = (side === 'bid') ? 'buy' : 'sell';
        }
        const totalAmount = this.safeString2 (order, 'initial_amount', 'a');
        const filledAmount = this.safeString2 (order, 'filled_amount', 'f');
        const remaining = Precise.stringSub (totalAmount, filledAmount);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'order_id', 'i'),
            'clientOrderId': this.safeString2 (order, 'client_order_id', 'I'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger2 (order, 'updated_at', 'ut'),
            'symbol': symbolLocal,
            'type': this.parseOrderType (this.safeStringLower2 (order, 'order_type', 'ot')),
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': this.safeBool2 (order, 'reduce_only', 'r'),
            'side': side,
            'price': this.safeString2 (order, 'price', 'lp'),
            'triggerPrice': this.safeNumber2 (order, 'stop_price', 'sp'),
            'amount': totalAmount,
            'cost': undefined,
            'average': this.safeString2 (order, 'average_filled_price', 'p'),
            'filled': filledAmount,
            'remaining': remaining,
            'status': this.parseOrderStatus (status),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name pacifica#fetchPosition
     * @description fetch data on an open position
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPosition (symbol: string, params = {}) {
        const positions = await this.fetchPositions ([ symbol ], params);
        return this.safeDict (positions, 0, {}) as Position;
    }

    /**
     * @method
     * @name pacifica#fetchPositions
     * @description fetch all open positions
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('fetchPositions', params);
        symbols = this.marketSymbols (symbols);
        const request: Dict = {
            'account': userAddress,
        };
        const response = await this.publicGetPositions (this.extend (request, params));
        // {
        //   "success": true,
        //   "data": [
        //     {
        //       "symbol": "AAVE",
        //       "side": "ask",
        //       "amount": "223.72",
        //       "entry_price": "279.283134",
        //       "margin": "0", // only shown for isolated margin
        //       "funding": "13.159593",
        //       "isolated": false,
        //       "created_at": 1754928414996,
        //       "updated_at": 1759223365538
        //     }
        //   ],
        //   "error": null,
        //   "code": null,
        //   "last_order_id": 1557431179
        // }
        const data = this.safeList (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push (this.parsePosition (data[i], undefined));
        }
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //     {
        //       "symbol": "AAVE",
        //       "side": "ask",
        //       "amount": "223.72",
        //       "entry_price": "279.283134",
        //       "margin": "0", // only shown for isolated margin
        //       "funding": "13.159593",
        //       "isolated": false,
        //       "created_at": 1754928414996,
        //       "updated_at": 1759223365538
        //     }
        //
        const symbolExc = this.safeString (position, 'symbol');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const margin = this.safeString (position, 'margin');
        const marginMode = (margin !== undefined && margin !== '0') ? 'isolated' : 'cross';
        const isIsolated = (marginMode === 'isolated');
        let side = this.safeString (position, 'side');
        if (side !== undefined) {
            side = (side === 'bid') ? 'long' : 'short';
        }
        const created_at = this.safeInteger (position, 'created_at');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': symbolLocal,
            'timestamp': created_at,
            'datetime': this.iso8601 (created_at),
            'isolated': isIsolated,
            'hedged': undefined,
            'side': side,
            'contracts': this.safeNumber (position, 'amount'),
            'contractSize': undefined,
            'entryPrice': this.safeNumber (position, 'entry_price'),
            'markPrice': undefined,
            'notional': undefined,
            'leverage': undefined,
            'collateral': margin,
            'initialMargin': undefined,
            'maintenanceMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'liquidationPrice': undefined,
            'marginMode': marginMode,
            'percentage': undefined,
        });
    }

    /**
     * @method
     * @name pacifica#setMarginMode
     * @description set margin mode (symbol)
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/update-margin-mode
     * @param {string} marginMode margin mode must be either [isolated, cross]
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} response from the exchange
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        const operationType = 'update_margin_mode';
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isIsolated = (marginMode === 'isolated');
        const sigPayload: Dict = {
            'symbol': market['id'],
            'is_isolated': isIsolated,
        };
        const request = this.postActionRequest (operationType, sigPayload, params);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window' ]);
        const response = await this.privatePostAccountMargin (request);
        // {
        //     "success": true
        // }
        return response;
    }

    /**
     * @method
     * @name pacifica#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/update-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        const operationType = 'update_leverage';
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const sigPayload: Dict = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        const request = this.postActionRequest (operationType, sigPayload, params);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window' ]);
        const response = await this.privatePostAccountLeverage (request);
        // {
        //     "success": true
        // }
        return response;
    }

    /**
     * @method
     * @name pacifica#withdraw
     * @description make a withdrawal (only support native USDC)
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/request-withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        const operationType = 'withdraw';
        await this.loadMarkets ();
        this.checkAddress (address);
        const sigPayload: Dict = {
            'amount': amount.toString (),
        };
        const request = this.postActionRequest (operationType, sigPayload, params);
        params = this.omit (params, [ 'originAddress', 'agentAddress', 'expiryWindow', 'expiry_window' ]);
        const response = await this.privatePostAccountWithdraw (this.extend (request, params));
        return { 'info': response } as Transaction;
    }

    /**
     * @method
     * @name pacifica#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-info
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('fetchTradingFee', params);
        const market = this.market (symbol);
        const request: Dict = {
            'account': userAddress,
        };
        const response = await this.publicGetAccount (this.extend (request, params));
        // {
        //   "success": true,
        //   "data": {
        //     "balance": "2000.000000",
        //     "fee_level": 0,
        //     "maker_fee": "0.00015",
        //     "taker_fee": "0.0004",
        //     "account_equity": "2150.250000",
        //     "available_to_spend": "1800.750000",
        //     "available_to_withdraw": "1500.850000",
        //     "pending_balance": "0.000000",
        //     "total_margin_used": "349.500000",
        //     "cross_mmr": "420.690000",
        //     "positions_count": 2,
        //     "orders_count": 3,
        //     "stop_orders_count": 1,
        //     "updated_at": 1716200000000,
        //     "use_ltp_for_stop_orders": false
        //   },
        //   "error": null,
        //   "code": null
        // }
        const data: Dict = this.safeDict (response, 'data', {});
        return this.parseTradingFee (data, market);
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        //
        //   {
        //     "balance": "2000.000000",
        //     "fee_level": 0,
        //     "maker_fee": "0.00015",
        //     "taker_fee": "0.0004",
        //     "account_equity": "2150.250000",
        //     "available_to_spend": "1800.750000",
        //     "available_to_withdraw": "1500.850000",
        //     "pending_balance": "0.000000",
        //     "total_margin_used": "349.500000",
        //     "cross_mmr": "420.690000",
        //     "positions_count": 2,
        //     "orders_count": 3,
        //     "stop_orders_count": 1,
        //     "updated_at": 1716200000000,
        //     "use_ltp_for_stop_orders": false
        //   }
        //
        //
        const symbol = this.safeSymbol (undefined, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'maker_fee'),
            'taker': this.safeNumber (fee, 'taker_fee'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    /**
     * @method
     * @name pacifica#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @param {string[]} [symbols] Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterests (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const swapMarkets = await this.fetchSwapMarkets ();
        return this.parseOpenInterests (swapMarkets, symbols) as OpenInterests;
    }

    /**
     * @method
     * @name pacifica#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterest (symbol: string, params = {}) {
        symbol = this.symbol (symbol);
        await this.loadMarkets ();
        const ois = await this.fetchOpenInterests ([ symbol ], params);
        return ois[symbol];
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //     {
        //       "funding": "0.00010529",
        //       "mark": "1.084819",
        //       "mid": "1.08615",
        //       "next_funding": "0.00011096",
        //       "open_interest": "3634796",
        //       "oracle": "1.084524",
        //       "symbol": "XPL",
        //       "timestamp": 1759222967974,
        //       "volume_24h": "20896698.0672",
        //       "yesterday_price": "1.3412"
        //     }
        //
        const symbolExc = this.safeString (interest, 'symbol');
        let symbolLocal = undefined;
        if (symbolExc !== undefined) {
            symbolLocal = this.symbolExcToLocal (symbolExc);
        }
        let interestValue = undefined;
        const markPrice = this.safeString (interest, 'mark');
        const openInterest = this.safeString (interest, 'open_interest');
        if ((openInterest !== undefined) && (markPrice !== undefined)) {
            interestValue = Precise.stringMul (openInterest, markPrice);
        }
        const timestamp = this.safeInteger (interest, 'timestamp');
        return this.safeOpenInterest ({
            'symbol': this.safeSymbol (symbolLocal),
            'openInterestAmount': this.parseNumber (openInterest),
            'openInterestValue': this.parseNumber (interestValue),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name pacifica#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-balance-history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @param {string|undefined} [params.cursor] pagination cursor from prev request (manual use)
     * @param {boolean|undefined} [params.paginate] set to true to fetch all ledger entries with pagination
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate', false);
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('fetchLedger', params);
        let cursor = undefined;
        [ cursor, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'cursor');
        const defaultLimit = 100; // Default max limit
        if (paginate) {
            let allEntries = [];
            let hasMore = true;
            while (hasMore === true) {
                const request: Dict = {
                    'account': userAddress,
                };
                request['limit'] = (limit !== undefined) ? Math.min (limit - allEntries.length, defaultLimit) : defaultLimit;
                if (cursor !== undefined) {
                    request['cursor'] = cursor;
                }
                const response = await this.publicGetAccountBalanceHistory (this.extend (request, params));
                // {
                //   "success": true,
                //   "data": [
                //     {
                //       "amount": "100.000000",
                //       "balance": "1200.000000",
                //       "pending_balance": "0.000000",
                //       "event_type": "deposit",
                //       "created_at": 1716200000000
                //     }
                //     ...
                //   ],
                //   "next_cursor": "11114Lz77",      // not included in info!
                //   "has_more": true                 // not included in info!
                // }
                const data = this.safeList (response, 'data', []);
                const parsed = this.parseLedger (data);
                allEntries = this.arrayConcat (allEntries, parsed);
                cursor = this.safeString (response, 'next_cursor');
                hasMore = this.safeBool (response, 'has_more', false);
                if (limit !== undefined && allEntries.length >= limit) {
                    break;
                }
                if (!hasMore || cursor === undefined) {
                    break;
                }
            }
            const sorted = this.sortBy (allEntries, 'timestamp');
            return this.filterByCurrencySinceLimit (sorted, code, since, limit);
        } else {
            const request: Dict = {
                'account': userAddress,
            };
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (cursor !== undefined) {
                request['cursor'] = cursor;
            }
            const response = await this.publicGetAccountBalanceHistory (this.extend (request, params));
            // {
            //   "success": true,
            //   "data": [
            //     {
            //       "amount": "100.000000",
            //       "balance": "1200.000000",
            //       "pending_balance": "0.000000",
            //       "event_type": "deposit",
            //       "created_at": 1716200000000
            //     }
            //     ...
            //   ],
            //   "next_cursor": "11114Lz77",      // not included in info!
            //   "has_more": true                 // not included in info!
            // }
            const data = this.safeList (response, 'data', []);
            return this.parseLedger (data, undefined, since, limit);
        }
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        //
        //     {
        //       "amount": "100.000000",
        //       "balance": "1200.000000",
        //       "pending_balance": "0.000000",
        //       "event_type": "deposit",
        //       "created_at": 1716200000000
        //     }
        //
        const timestamp = this.safeInteger (item, 'created_at');
        const type = this.safeString (item, 'event_type');
        const amount = this.safeString (item, 'amount');
        const balance = this.safeString (item, 'balance');
        return this.safeLedgerEntry ({
            'info': item,
            'id': undefined,
            'direction': undefined,
            'account': undefined,
            'referenceAccount': undefined,
            'referenceId': undefined,
            'type': this.parseLedgerEntryType (type),
            'currency': undefined,
            'amount': this.parseNumber (amount),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': this.parseNumber (balance),
            'status': undefined,
            'fee': undefined,
        }, currency) as LedgerEntry;
    }

    parseLedgerEntryType (type) {
        const ledgerType: Dict = {
            'subaccount_transfer': 'transfer',
            'deposit': 'transaction',
            'deposit_release': 'transaction',
            'withdraw': 'transaction',
            'trade': 'trade',
            'market_liquidation': 'trade',
            'backstop_liquidation': 'trade',
            'adl_liquidation': 'trade',
            'funding': 'funding',
            'fee': 'fee',
            'rebate': 'rebate',
            'cashback': 'cashback',
            'referral': 'referral',
            'airdrop': 'airdrop',
            'payout': 'payout',
        };
        return this.safeString (ledgerType, type, type);
    }

    /**
     * @method
     * @name pacifica#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to this.walletAddress if not provided
     * @param {string|undefined} [params.cursor] pagination cursor from prev request
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let userAddress = undefined;
        [ userAddress, params ] = this.handleOriginAndSingleAddress ('fetchFundingHistory', params);
        const request: Dict = {
            'account': userAddress,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetFundingHistory (this.extend (request, params));
        // {
        //   "success": true,
        //   "data": [
        //     {
        //       "history_id": 2287920,
        //       "symbol": "PUMP",
        //       "side": "ask",
        //       "amount": "39033804",
        //       "payout": "2.617479",
        //       "rate": "0.0000125",
        //       "created_at": 1759222804122
        //     },
        //     ...
        //   ],
        //   "next_cursor": "11114Lz77",     // not included in info!
        //   "has_more": true                // not included in info!
        // }
        const data = this.safeList (response, 'data', []);
        return this.parseIncomes (data, market, since, limit);
    }

    parseIncome (income, market: Market = undefined) {
        //
        //     {
        //       "history_id": 2287920,
        //       "symbol": "PUMP",
        //       "side": "ask",
        //       "amount": "39033804",
        //       "payout": "2.617479",
        //       "rate": "0.0000125",
        //       "created_at": 1759222804122
        //     }
        //
        const id = this.safeString (income, 'history_id');
        const timestamp = this.safeInteger (income, 'created_at');
        const symbolExc = this.safeString (income, 'symbol');
        const symbolLocal = this.symbolExcToLocal (symbolExc);
        const amount = this.safeString (income, 'amount');
        const code = this.safeCurrencyCode ('USDC');
        const rate = this.safeNumber (income, 'rate');
        return {
            'info': income,
            'symbol': symbolLocal,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'amount': this.parseNumber (amount),
            'rate': rate,
        };
    }

    /**
     * @method
     * @name pacifica#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.pacifica.fi/api-documentation/api/rest-api/subaccounts/subaccount-fund-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from *spot, swap*
     * @param {string} toAccount account to transfer to *swap, spot or address*
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        const operationType = 'transfer_funds';
        const sigPayload = {
            'to_account': toAccount,
            'amount': amount,
        };
        const request = this.postActionRequest (operationType, sigPayload, params);
        params = this.omit (params, [ 'expiryWindow', 'agentAddress', 'originAddress' ]);
        const response = this.privatePostAccountSubaccountTransfer (this.extend (request, params));
        //
        // {
        //   "success": true,
        //   "data": {
        //     "success": true,
        //     "error": null
        //   },
        //   "error": null,
        //   "code": null
        // }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTransfer (data);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // {
        //   "success": true,
        //   "data": {
        //     "success": true,
        //     "error": null
        //   },
        //   "error": null,
        //   "code": null
        // }
        //
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': undefined,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': 'ok',
        };
    }

    /**
     * @method
     * @name pacifica#createSubAccount
     * @description creates a sub-account under the main account
     * @param {string} name unused argument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @param {string} [params.subAccountAddress] - The public key (address) of the sub-account to use for creation
     * @param {string} [params.subAccountPrivateKey] - The private key of the sub-account to use for creation
     * @returns {object} a response object
     */
    async createSubAccount (name: string, params = {}) {
        const finalHeaders = { };
        let agentAddress = undefined;
        [ agentAddress, params ] = this.handleOptionAndParams (params, 'createSubAccount', 'agentAddress');
        let originAddress = undefined;
        [ originAddress, params ] = this.handleOriginAndSingleAddress ('createSubAccount', params);
        if (originAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' createSubAccount() requires "originAddress" in params or "walletAddress" in requiredCredentials');
        }
        if (agentAddress !== undefined) {
            finalHeaders['agent_wallet'] = agentAddress;
        }
        let subAccountAddress = undefined;
        [ subAccountAddress, params ] = this.handleOptionAndParams (params, 'createSubAccount', 'subAccountAddress');
        let subAccountPrivateKey = undefined;
        [ subAccountPrivateKey, params ] = this.handleOptionAndParams (params, 'createSubAccount', 'subAccountPrivateKey');
        if (subAccountAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' createSubAccount() requires a "subAccountAddress"!');
        }
        if (subAccountPrivateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' createSubAccount() requires a "subAccountPrivateKey"!');
        }
        const timestamp = this.milliseconds ();
        let expiryWindow = undefined;
        [ expiryWindow, params ] = this.handleOptionAndParams2 (params, 'createSubAccount', 'expiryWindow', 'expiry_window', 5000);
        const subaccount_signature_header = {
            'timestamp': timestamp,
            'expiry_window': expiryWindow,
            'type': 'subaccount_initiate',
        };
        const subSigPayload = {
            'account': originAddress,
        };
        const subaccount_signature = this.signMessage (subaccount_signature_header, subSigPayload, subAccountPrivateKey);
        const main_signature_header = {
            'timestamp': timestamp,
            'expiry_window': expiryWindow,
            'type': 'subaccount_confirm',
        };
        const mainSigPayload = {
            'signature': subaccount_signature,
        };
        const main_signature = this.signMessage (main_signature_header, mainSigPayload, this.privateKey);
        finalHeaders['main_account'] = originAddress;
        finalHeaders['subaccount'] = subAccountAddress;
        finalHeaders['sub_signature'] = subaccount_signature;
        finalHeaders['main_signature'] = main_signature;
        finalHeaders['timestamp'] = timestamp;
        finalHeaders['expiry_window'] = expiryWindow;
        const request = finalHeaders;
        const response = await this.privatePostAccountSubaccountCreate (request);
        //
        // {
        //   "success": true,
        //   "data": null,
        //   "error": null,
        //   "code": null,
        // }
        //
        return response;
    }

    async bindAgentWallet (agentAddress: string, params = {}) {
        const operationType = 'bind_agent_wallet';
        const sigPayload = {
            'agent_wallet': agentAddress,
        };
        const request = this.postActionRequest (operationType, sigPayload, params);
        return await this.privatePostAgentBind (this.extend (request, params));
    }

    async createApiKey (params = {}) {
        const operationType = 'create_api_key';
        const sigPayload = {};
        const request = this.postActionRequest (operationType, sigPayload, params);
        return await this.privatePostAccountApiKeysCreate (this.extend (request, params));
    }

    async revokeApiKey (apiKey: string, params = {}) {
        const operationType = 'revoke_api_key';
        const sigPayload = {
            'api_key': apiKey,
        };
        const request = this.postActionRequest (operationType, sigPayload, params);
        return await this.privatePostAccountApiKeysRevoke (this.extend (request, params));
    }

    async fetchApiKeys (params = {}) {
        const operationType = 'list_api_keys';
        const sigPayload = {};
        const request = this.postActionRequest (operationType, sigPayload, params);
        return await this.privatePostAccountApiKeys (this.extend (request, params));
    }

    async approveBuilderCode (builderCode: string, maxFeeRate: string, params = {}) {
        const operationType = 'approve_builder_code';
        const sigPayload = {
            'builder_code': builderCode,
            'max_fee_rate': maxFeeRate.toString (),
        };
        const request = this.postActionRequest (operationType, sigPayload, params);
        return await this.privatePostAccountBuilderCodesApprove (this.extend (request, params));
    }

    async fetchBuilderApprovals (address: string) {
        const request = {
            'account': address,
        };
        return await this.publicGetAccountBuilderCodesApprovals (this.extend (request));
    }

    async revokeBuilderCode (builderCode: string, params = {}) {
        const operationType = 'revoke_builder_code';
        const sigPayload = {
            'builder_code': builderCode,
        };
        const request = this.postActionRequest (operationType, sigPayload, params);
        return await this.privatePostAccountBuilderCodesRevoke (this.extend (request, params));
    }

    handleOriginAndSingleAddress (methodName: string, params: Dict) {
        let address1 = undefined;
        [ address1, params ] = this.handleOptionAndParams2 (params, methodName, 'originAddress', 'mainAddress');
        if (address1 !== undefined) {
            return [ address1, params ];
        }
        let address2 = undefined;
        [ address2, params ] = this.handleOptionAndParams2 (params, methodName, 'account', 'address');
        if (address2 !== undefined) {
            return [ address2, params ];
        }
        if (this.walletAddress !== undefined) {
            return [ this.walletAddress, params ];
        }
        throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires address');
    }

    symbolExcToLocal (symbolExc: Str) {
        if (symbolExc === undefined) {
            return undefined;
        }
        return this.safeCurrencyCode (symbolExc) + '/USDC:USDC';
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"success":false,"data":null,"error":"Beta access required. Signer must redeem a valid beta code.","code":403}
        //     {"success":false,"data":null,"error":"Agent not authorized for account","code":400}
        //     {"success":false,"data":null,"error":"Internal server error","code":500}
        //
        const inCode = this.safeInteger (response, 'code'); // actually if all ok -> code = undefined or code = 200
        const message = this.safeString (response, 'error');
        let error = undefined;
        if (inCode === undefined || inCode === 200) {
            error = false;
        } else {
            error = true;
        }
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (error || nonEmptyMessage) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback); // Try deeper catch first
            this.throwExactlyMatchedException (this.exceptions['exact'], inCode, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isTestnet = this.handleOption ('sign', 'sandboxMode', false);
        const urlKey = (isTestnet) ? 'test' : 'api';
        const host = this.implodeHostname (this.urls[urlKey][api]);
        let url = host + '/api/' + this.version + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        const paramsLen = Object.keys (params).length;
        headers = {
            'Content-Type': 'application/json',
        };
        if (method === 'GET' && paramsLen) {
            url += '?' + this.urlencode (params);
            headers['Accept'] = '*/*';
        }
        if (method === 'POST') {
            body = this.json (params);
        }
        if (this.apiKey) {
            headers['PF-API-KEY'] = this.apiKey;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    calculateRateLimiterCost (api, method, path, params, config = {}) {
        const cost = this.safeValue (config, 'cost', 1);
        // 1 is normal POST/GET, 0.5 is cancels, 3-12 is heavy GET
        if (cost > 1) {
            if (this.apiKey) {
                const costWithKey = this.handleOption (
                    method,
                    'maxCostHugeWithApiKey',
                    3
                );
                return costWithKey;
            }
        }
        return cost;
    }

    sortJsonKeys (value: any): any {
        if (typeof value === 'object') {
            const result = {};
            const keys = Object.keys (value);
            const sortedKeys = this.sort (keys);
            for (let i = 0; i < sortedKeys.length; i++) {
                const key = sortedKeys[i];
                result[key] = this.sortJsonKeys (value[key]);
            }
            return result;
        } else if (Array.isArray (value)) {
            const result = [];
            for (let i = 0; i < value.length; i++) {
                result.push (this.sortJsonKeys (value[i]));
            }
            return result;
        } else {
            return value;
        }
    }

    prepareMessage (header: Dict, payload: Dict): string {
        if (header['type'] === undefined || header['timestamp'] === undefined || header['expiry_window'] === undefined) {
            throw new ArgumentsRequired (this.id + ' prepareMessage() requires type, timestamp, expiry_window in header');
        }
        const data = this.extend (header, { 'data': payload });
        const sorted = this.sortJsonKeys (data);
        return this.json (sorted);
    }

    signMessage (header: Dict, payload: Dict, privateKey: string): string {
        const message = this.prepareMessage (header, payload);
        const messageBytes = this.encode (message);
        const secretBytes = this.base58ToBinary (privateKey);
        const seed = this.arraySlice (secretBytes, 0, 32);
        const signatureBase64 = eddsa (messageBytes, seed, ed25519);
        const signatureBinary = this.base64ToBinary (signatureBase64);
        const signatureBase58 = this.binaryToBase58 (signatureBinary);
        return signatureBase58;
    }

    postActionRequest (operationType: Str, sigPayload: Dict, params: Dict): Dict {
        this.checkRequiredCredentials (); // check credentials every post action
        if (operationType === 'undefined') {
            throw new ArgumentsRequired (this.id + ' action: ' + operationType + ' postActionRequest() requires "operationType"');
        }
        let expiryWindow = undefined;
        [ expiryWindow, params ] = this.handleOptionAndParams2 (params, 'postActionRequest', 'expiryWindow', 'expiry_window', 5000);
        const timestamp = this.safeInteger (params, 'timestamp', this.milliseconds ());
        const signatureHeader = {
            'timestamp': timestamp,
            'expiry_window': expiryWindow,
            'type': operationType,
        };
        const signature = this.signMessage (signatureHeader, sigPayload, this.privateKey);
        const finalHeaders = { };
        let agentAddress = undefined;
        [ agentAddress, params ] = this.handleOptionAndParams (params, 'postActionRequest', 'agentAddress');
        let originAddress = undefined;
        [ originAddress, params ] = this.handleOriginAndSingleAddress ('postActionRequest', params);
        if (originAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' action: ' + operationType + ' postActionRequest() requires "originAddress" in params or "walletAddress" in requiredCredentials');
        }
        finalHeaders['account'] = originAddress;
        if (agentAddress !== undefined) {
            finalHeaders['agent_wallet'] = agentAddress;
        }
        let builderCode = undefined;
        [ builderCode, params ] = this.handleOptionAndParams (params, 'postActionRequest', 'builderCode');
        const isOperationSupportBuilder = this.safeBool (this.options['builderSupportOperations'], operationType, false);
        if (builderCode !== undefined) {
            if (isOperationSupportBuilder) {
                finalHeaders['builder_code'] = builderCode;
            }
        }
        finalHeaders['signature'] = signature;
        finalHeaders['timestamp'] = this.safeInteger (signatureHeader, 'timestamp');
        finalHeaders['expiry_window'] = this.safeInteger (signatureHeader, 'expiry_window');
        const request = this.extend (finalHeaders, sigPayload);
        return request;
    }
}
