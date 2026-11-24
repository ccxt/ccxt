//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/paribu.js';
import { AccountNotEnabled, AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, MarketClosed, OrderNotFound, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Bool, Currencies, Currency, CurrencyInterface, DepositAddress, Dict, Endpoint, FeeString, Int, int, List, Market, Num, NullableDict, NullableList, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class paribu
 * @augments Exchange
 */
export default class paribu extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'paribu',
            'name': 'Paribu',
            'countries': [ 'TR' ], // Turkey
            'rateLimit': 40, // 25 order requests per second, 100000 request weight per minute
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
                'cancelAllOrders': true,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'fetchBalance': true,
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
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
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
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
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
                'fetchSettlementHistory': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
                'ws': false,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/795b9cab-4f02-4623-b70b-ae12f28b49b1',
                'api': {
                    'public': 'https://api.paribu.com',
                    'private': 'https://api.paribu.com',
                },
                'www': 'https://www.paribu.com',
                'doc': 'https://docs.paribu.com/api',
            },
            'api': {
                'public': {
                    'get': {
                        'initials/config': { 'cost': 1 } as Endpoint<Dict>,
                        'market/ticker': { 'cost': 1 } as Endpoint<List>,
                        'orderbook': { 'cost': 1 } as Endpoint<Dict>,
                        'trades': { 'cost': 1 } as Endpoint<List>,
                    },
                },
                'private': {
                    'get': {
                        'users/me': { 'cost': 1 } as Endpoint<Dict>,
                        'user/assets': { 'cost': 1 } as Endpoint<List>,
                        'order/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                        'open-orders': { 'cost': 1 } as Endpoint<any>,
                        'trades/history': { 'cost': 1 } as Endpoint<Dict>,
                        'transfers/history': { 'cost': 1 } as Endpoint<Dict>,
                        'withdraw/{withdrawId}': { 'cost': 1 } as Endpoint<Dict>,
                        'declarations/pending': { 'cost': 1 } as Endpoint<List>,
                        'declarations/reasons': { 'cost': 1 } as Endpoint<List>,
                        'declarations/platforms': { 'cost': 1 } as Endpoint<List>,
                    },
                    'post': {
                        'order': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/order': { 'cost': 1 } as Endpoint<Dict>,
                        'addresses/assign': { 'cost': 1 } as Endpoint<Dict>,
                        'withdraw': { 'cost': 1 } as Endpoint<Dict>,
                        'declarations/{transactionId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'order': { 'cost': 1 } as Endpoint<Dict>,
                        'order/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/order': { 'cost': 1 } as Endpoint<Dict>,
                        'withdraw/{withdrawId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': true,
                        'marketBuyByCost': true,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
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
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0012'),
                    'taker': this.parseNumber ('0.0028'),
                },
            },
            'commonCurrencies': {
                'TL': 'TRY',
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'networks': {
                    'BTC': 'btc',
                    'ERC20': 'eth',
                    'TRC20': 'trx',
                    'BEP20': 'bsc',
                    'ARBITRUM': 'arb',
                    'OPTIMISM': 'op',
                    'BASE': 'base',
                    'MATIC': 'pol',
                    'SOL': 'sol',
                    'AVAXC': 'avaxc',
                    'AVAXX': 'avax',
                    'ZKSYNC': 'zk',
                    'LINEA': 'linea',
                    'TON': 'ton',
                    'XRP': 'xrp',
                    'XLM': 'xlm',
                    'LTC': 'ltc',
                    'DOGE': 'doge',
                    'BCH': 'bch',
                    'ADA': 'ada',
                    'DOT': 'dot',
                    'ATOM': 'atom',
                    'TRX': 'trx',
                },
                'networksById': {
                    'a': 'A',
                    'ada': 'ADA',
                    'akt': 'AKT',
                    'algo': 'ALGO',
                    'apt': 'APT',
                    'arb': 'ARBITRUM',
                    'arc': 'ARC',
                    'assethub': 'ASSETHUB',
                    'atom': 'ATOM',
                    'avax': 'AVAXX',
                    'avaxc': 'AVAXC',
                    'banktr': 'BANKTR',
                    'base': 'BASE',
                    'bch': 'BCH',
                    'bera': 'BERA',
                    'bsc': 'BEP20',
                    'btc': 'BTC',
                    'btg': 'BTG',
                    'chz': 'CHZ',
                    'chz2': 'CHZ2',
                    'dash': 'DASH',
                    'doge': 'DOGE',
                    'dot': 'DOT',
                    'dydx': 'DYDX',
                    'dym': 'DYM',
                    'enj': 'ENJ',
                    'eos': 'EOS',
                    'eth': 'ERC20',
                    'ethw': 'ETHW',
                    'fet': 'FET',
                    'fil': 'FIL',
                    'flr': 'FLR',
                    'hype': 'HYPE',
                    'icp': 'ICP',
                    'inj': 'INJ',
                    'internal': 'INTERNAL',
                    'iota': 'IOTA',
                    'linea': 'LINEA',
                    'ltc': 'LTC',
                    'manta': 'MANTA',
                    'mega': 'MEGA',
                    'mina': 'MINA',
                    'miota': 'MIOTA',
                    'monad': 'MONAD',
                    'near': 'NEAR',
                    'neo': 'NEO',
                    'neo3': 'NEO3',
                    'ont': 'ONT',
                    'op': 'OPTIMISM',
                    'pol': 'MATIC',
                    'prb': 'PRB',
                    'reef': 'REEF',
                    'rvn': 'RVN',
                    'sei': 'SEI',
                    'sei-evm': 'SEIEVM',
                    'sgb': 'SGB',
                    'sol': 'SOL',
                    'sonic': 'SONIC',
                    'stx': 'STX',
                    'sui': 'SUI',
                    'tao': 'TAO',
                    'theta': 'THETA',
                    'tia': 'TIA',
                    'ton': 'TON',
                    'trx': 'TRC20',
                    'vet': 'VET',
                    'waves': 'WAVES',
                    'xlm': 'XLM',
                    'xpl': 'XPL',
                    'xrp': 'XRP',
                    'xtz': 'XTZ',
                    'zil': 'ZIL',
                    'zilliqa': 'ZILLIQA',
                    'zk': 'ZKSYNC',
                },
                'fetchMyTrades': {
                    'maxLimit': 100,
                },
                'fetchDepositsWithdrawals': {
                    'maxLimit': 25,
                },
            },
            'exceptions': {
                'exact': {
                    '4001': BadRequest, // Bad Request / validation failed
                    '4002': InvalidOrder, // Maximum limit for TRYC market has been reached
                    '4003': InvalidOrder, // Minimum limit for TRYC market has been reached
                    '4004': InvalidOrder, // Provided minimum price is not acceptable
                    '4005': InvalidOrder, // Provided maximum price is not acceptable
                    '4006': InvalidOrder, // Provided minimum condition is not acceptable
                    '4007': InvalidOrder, // Provided maximum condition is not acceptable
                    '4008': InvalidOrder, // Minimum price for conditional order is not reasonable
                    '4009': InvalidOrder, // Maximum price for conditional order is not reasonable
                    '4010': InvalidOrder, // Total value is below the minimum limit
                    '4011': InvalidOrder, // Total value exceeds the maximum limit
                    '4012': AccountSuspended, // The user is currently under a lock status
                    '4013': AccountNotEnabled, // Some required user fields are missing
                    '4014': AccountNotEnabled, // The user has not been verified
                    '4015': MarketClosed, // The market is currently suspended
                    '4016': BadSymbol, // The specified market is not valid
                    '4018': PermissionDenied, // The user is not allowed to create an order
                    '4091': DuplicateOrderId, // Duplicate client order id (already in use by an active order)
                    '4092': InvalidOrder, // Order is pending acceptance
                    '4135': InsufficientFunds, // The user's asset is currently not available — insufficient available balance
                    '5001': ExchangeError, // Internal Server Error
                    '5031': ExchangeNotAvailable, // Client order id registry temporarily unavailable
                },
                'broad': {
                    'Invalid API key or signature': AuthenticationError,
                    'Rate limit exceeded': RateLimitExceeded,
                },
            },
        });
    }

    /**
     * @method
     * @name paribu#fetchMarkets
     * @description retrieves data on all markets for paribu
     * @see https://docs.paribu.com/api/market-data/exchange-config
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const request: Dict = {
            'scope': 'markets',
        };
        const response = await this.publicGetInitialsConfig (this.extend (request, params));
        //
        //     {
        //         "message": { "display": { "component": "none", "content": "status" }, "severity": "success" },
        //         "meta": null,
        //         "payload": {
        //             "markets": {
        //                 "btc_tl": {
        //                     "labels": [ "crypto_tl" ],
        //                     "pairs": { "market": "btc", "payment": "tl" },
        //                     "precisions": { "amount": 6, "price": 0 },
        //                     "steps": { "amount": "0.000001", "price": "1" }
        //                 },
        //                 "agix_tl": {
        //                     "labels": [ "crypto_tl" ],
        //                     "pairs": { "market": "agix", "payment": "tl" },
        //                     "precisions": { "amount": 2, "price": 4 },
        //                     "steps": { "amount": "0.01", "price": "0.0001" },
        //                     "suspended": "system_messages.market_suspended",
        //                     "unlisted": true
        //                 },
        //                 "1inch_usdt": {
        //                     "labels": [ "crypto_usdt" ],
        //                     "pairs": { "market": "1inch", "payment": "usdt" },
        //                     "precisions": { "amount": 2, "price": 4 },
        //                     "steps": { "amount": "0.01", "price": "0.0001" },
        //                     "otc_only": true
        //                 },
        //             }
        //         }
        //     }
        //
        const payload = this.safeDict (response, 'payload', {});
        const markets = this.safeDict (payload, 'markets', {});
        const marketIds = Object.keys (markets);
        const result: Market[] = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.extend (markets[marketId], { 'id': marketId });
            result.push (this.parseMarket (market));
        }
        return result;
    }

    override parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'id');
        const pairs = this.safeDict (market, 'pairs', {});
        const baseId = this.safeString (pairs, 'market');
        const quoteId = this.safeString (pairs, 'payment');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const steps = this.safeDict (market, 'steps', {});
        const suspended = this.safeString (market, 'suspended');
        const unlisted = this.safeBool (market, 'unlisted', false);
        // otc_only markets have no order book, they are not tradable through the order api
        const otcOnly = this.safeBool (market, 'otc_only', false);
        const active = (suspended === undefined) && !unlisted && !otcOnly;
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
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (steps, 'amount'),
                'price': this.safeNumber (steps, 'price'),
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
            'created': this.parse8601 (this.safeString (market, 'listing_date')),
            'info': market,
        });
    }

    /**
     * @method
     * @name paribu#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.paribu.com/api/market-data/exchange-config
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        const request: Dict = {
            'scope': 'currencies,fee_matrix',
        };
        const response = await this.publicGetInitialsConfig (this.extend (request, params));
        //
        //     {
        //         "message": { "display": { "component": "none", "content": "status" }, "severity": "success" },
        //         "meta": null,
        //         "payload": {
        //             "currencies": {
        //                 "usdt": {
        //                     "symbol": "usdt",
        //                     "name": "Tether",
        //                     "type": "crypto",
        //                     "precision": 2,
        //                     "step": "0.01",
        //                     "networks": [ "arb", "trx", "eth" ],
        //                     "deposit_limits": { "min_amount": "0" },
        //                     "withdraw_limits": { "min_once": "2", "max_once": "150000", "max_daily": "0", "max_monthly": "0" },
        //                     "labels": [ "stable", "crypto" ],
        //                     "listing_date": "2019-01-29T00:00:00Z"
        //                 },
        //             },
        //             "fee_matrix": {
        //                 "usdt": {
        //                     "arb": [ { "usdt": "0.25" } ],
        //                     "eth": [ { "usdt": "1.5" } ],
        //                     "trx": [ { "usdt": "5" } ]
        //                 },
        //             }
        //         }
        //     }
        //
        const payload = this.safeDict (response, 'payload', {});
        const currencies = this.safeDict (payload, 'currencies', {});
        const feeMatrix = this.safeDict (payload, 'fee_matrix', {});
        const currencyIds = Object.keys (currencies);
        const result: Dict = {};
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const currency = this.extend (currencies[currencyId], {
                'fees': this.safeDict (feeMatrix, currencyId, {}),
            });
            const parsed = this.parseCurrency (currency);
            const code = parsed['code'];
            if (code !== undefined) {
                result[code] = parsed;
            }
        }
        return result;
    }

    override parseCurrency (currency: Dict): CurrencyInterface {
        const id = this.safeString (currency, 'symbol');
        const code = this.safeCurrencyCode (id);
        const fees = this.safeDict (currency, 'fees', {});
        const depositLimits = this.safeDict (currency, 'deposit_limits', {});
        const withdrawLimits = this.safeDict (currency, 'withdraw_limits', {});
        const minDeposit = this.safeNumber (depositLimits, 'min_amount');
        const minWithdraw = this.safeNumber (withdrawLimits, 'min_once');
        const maxWithdrawString = this.safeString (withdrawLimits, 'max_once');
        // a zero limit means that the limit is not set
        const maxWithdraw = ((maxWithdrawString === undefined) || Precise.stringEq (maxWithdrawString, '0')) ? undefined : this.parseNumber (maxWithdrawString);
        const depositSuspended = this.safeBool (currency, 'deposit_suspended', false);
        const withdrawSuspended = this.safeBool (currency, 'withdraw_suspended', false);
        const deposit = !depositSuspended;
        const withdraw = !withdrawSuspended;
        const precision = this.safeNumber (currency, 'step');
        const networkIds = this.safeList (currency, 'networks', []);
        const networks: Dict = {};
        for (let i = 0; i < networkIds.length; i++) {
            const networkId = this.safeString (networkIds, i);
            const networkCode = this.networkIdToCode (networkId, code);
            if (networkCode === undefined) {
                continue;
            }
            const networkFees = this.safeList (fees, networkId, []);
            const networkFee = this.safeDict (networkFees, 0, {});
            const fee = this.safeNumber (networkFee, id);
            networks[networkCode] = {
                'info': networkFee,
                'id': networkId,
                'network': networkCode,
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'deposit': {
                        'min': minDeposit,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': minWithdraw,
                        'max': maxWithdraw,
                    },
                },
            };
        }
        const type = this.safeString (currency, 'type');
        return this.safeCurrencyStructure ({
            'info': currency,
            'id': id,
            'code': code,
            'name': this.safeString (currency, 'name'),
            'type': (type === 'fiat') ? 'fiat' : 'crypto',
            'active': deposit && withdraw,
            'deposit': deposit,
            'withdraw': withdraw,
            'fee': undefined,
            'precision': precision,
            'networks': networks,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': minDeposit,
                    'max': undefined,
                },
                'withdraw': {
                    'min': minWithdraw,
                    'max': maxWithdraw,
                },
            },
        });
    }

    /**
     * @method
     * @name paribu#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.paribu.com/api/market-data/ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols);
        const response = await this.publicGetMarketTicker (params);
        //
        //     [
        //         {
        //             "average": "4046013",
        //             "change": "53909",
        //             "first": "4042099",
        //             "high": "4100000",
        //             "last": "4096008",
        //             "low": "3994000",
        //             "market": "btc_tl",
        //             "pair_volume": "133489300",
        //             "percentage": "1.33",
        //             "volume": "32.992793"
        //         },
        //     ]
        //
        return this.parseTickers (response, symbolsResolved);
    }

    /**
     * @method
     * @name paribu#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.paribu.com/api/market-data/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        //
        //     [
        //         {
        //             "average": "4046013",
        //             "change": "53909",
        //             "first": "4042099",
        //             "high": "4100000",
        //             "last": "4096008",
        //             "low": "3994000",
        //             "market": "btc_tl",
        //             "pair_volume": "133489300",
        //             "percentage": "1.33",
        //             "volume": "32.992793"
        //         }
        //     ]
        //
        const ticker = this.safeDict (response, 0, {});
        return this.parseTicker (ticker, market);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "average": "4046013",
        //         "change": "53909",
        //         "first": "4042099",
        //         "high": "4100000",
        //         "last": "4096008",
        //         "low": "3994000",
        //         "market": "btc_tl",
        //         "pair_volume": "133489300",
        //         "percentage": "1.33",
        //         "volume": "32.992793"
        //     }
        //
        const marketId = this.safeString (ticker, 'market');
        const marketResolved = this.safeMarket (marketId, market, '_');
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': marketResolved['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            // the "average" field is the volume-weighted average price (pair_volume / volume)
            'vwap': this.safeString (ticker, 'average'),
            'open': this.safeString (ticker, 'first'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': this.safeString (ticker, 'percentage'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'pair_volume'),
            'info': ticker,
        }, marketResolved);
    }

    /**
     * @method
     * @name paribu#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paribu.com/api/market-data/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, default 20, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        //     {
        //         "bids": [ [ "4096599", "0.036284" ], [ "4096598", "0.006039" ] ],
        //         "asks": [ [ "4097545", "0.018372" ], [ "4097547", "0.00024" ] ],
        //         "timestamp": 1792394858,
        //         "last_offset": 381389004,
        //         "seq": 45607245
        //     }
        //
        // an unknown market or a market without an order book returns a null body
        //
        if (response === undefined) {
            throw new BadSymbol (this.id + ' fetchOrderBook() ' + symbol + ' has no order book');
        }
        const timestamp = this.safeTimestamp (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, market['symbol'], timestamp);
        orderbook['nonce'] = this.safeInteger (response, 'seq');
        return orderbook;
    }

    /**
     * @method
     * @name paribu#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.paribu.com/api/market-data/recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch, default 20, max 20
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'limit': (limit === undefined) ? 20 : Math.min (limit, 20),
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "price": "4096008.00000000",
        //             "amount": "0.10494700",
        //             "time": "2026-10-19T07:26:38.623999446Z",
        //             "trade": "sell"
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //     {
        //         "price": "4096008.00000000",
        //         "amount": "0.10494700",
        //         "time": "2026-10-19T07:26:38.623999446Z",
        //         "trade": "sell"
        //     }
        //
        // fetchMyTrades
        //
        //     {
        //         "amount": "12.53400000",
        //         "commission": "0.03509520",
        //         "createdAt": "2025-10-15T11:56:49Z",
        //         "direction": "buy",
        //         "marketCurrency": "avax",
        //         "matchId": "7c1f9a04b83e4d6215af0c73e8b91d52",
        //         "orderId": "z46plm1y-8q2g-ol39-zo05-grv0j37wno9o",
        //         "paymentCurrency": "tl",
        //         "price": "570.00000000",
        //         "role": "TAKER",
        //         "userId": "k2xorljq-07w6-g0w7-rnw9-e9mypn3814vz"
        //     }
        //
        // createOrder fills (response_type FULL)
        //
        //     {
        //         "price": "100000",
        //         "qty": "0.1",
        //         "trade_id": "1234"
        //     }
        //
        const baseId = this.safeString (trade, 'marketCurrency');
        const quoteId = this.safeString (trade, 'paymentCurrency');
        let marketId: Str = undefined;
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            marketId = baseId + '_' + quoteId;
        }
        const marketResolved = this.safeMarket (marketId, market, '_');
        const timestamp = this.parse8601 (this.safeString2 (trade, 'time', 'createdAt'));
        const side = this.safeString2 (trade, 'trade', 'direction');
        const role = this.safeStringLower (trade, 'role');
        let takerOrMaker: Str = undefined;
        if ((role === 'maker') || (role === 'taker')) {
            takerOrMaker = role;
        }
        let fee: FeeString = undefined;
        const feeCost = this.safeString (trade, 'commission');
        if (feeCost !== undefined) {
            // the commission is charged in the received currency: the base currency on buys, the quote currency on sells
            const feeCurrency = (side === 'buy') ? marketResolved['base'] : marketResolved['quote'];
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'matchId', 'trade_id'),
            'order': this.safeString (trade, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': marketResolved['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString2 (trade, 'amount', 'qty'),
            'cost': undefined,
            'fee': fee,
        }, marketResolved);
    }

    /**
     * @method
     * @name paribu#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.paribu.com/api/account/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const response = await this.privateGetUserAssets (params);
        //
        //     [
        //         {
        //             "currency": "btc",
        //             "total": "0.6",
        //             "blocked_in_orders": "0.1",
        //             "blocked_in_transactions": "0",
        //             "locked": "0",
        //             "available": "0.5",
        //             "details": {}
        //         },
        //     ]
        //
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = this.safeDict (response, i, {});
            const currencyId = this.safeString2 (balance, 'currency', 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['total'] = this.safeString (balance, 'total');
            if (code !== undefined) {
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name paribu#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://docs.paribu.com/api/orders/placing-orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createMarketBuyOrderWithCost (symbol: string, cost: number, params: Dict = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {
            'createMarketBuyOrderRequiresPrice': false,
        };
        return await this.createOrder (symbol, 'market', 'buy', cost, undefined, this.extend (request, params));
    }

    /**
     * @method
     * @name paribu#createOrder
     * @description create a trade order
     * @see https://docs.paribu.com/api/orders/placing-orders
     * @see https://docs.paribu.com/api/orders/client-order-id-v2
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a stop-limit or a stop-market order is triggered
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'PO', limit orders only
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.clientOrderId] a unique id for the order, 1-36 characters from [A-Za-z0-9_-], not supported for trigger orders
     * @param {float} [params.cost] the quote quantity to spend for market buy orders
     * @param {bool} [params.createMarketBuyOrderRequiresPrice] default true, set to false to pass the cost to spend in the amount argument of market buy orders
     * @param {string} [params.response_type] 'ACK', 'RESULT' or 'FULL', the amount of execution detail returned by the exchange
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const isMarketOrder = (type === 'market');
        const isLimitOrder = (type === 'limit');
        if (!isMarketOrder && !isLimitOrder) {
            throw new InvalidOrder (this.id + ' createOrder() supports limit and market orders only');
        }
        const isBuy = (side === 'buy');
        const request: Dict = {
            'market': market['id'],
            'trade': side,
            'type': type,
        };
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'newClientOrderId');
        const [ postOnly, paramsPostOnly ] = this.handlePostOnly (isMarketOrder, false, params);
        const timeInForce = this.safeStringUpper (paramsPostOnly, 'timeInForce');
        let query = this.omit (paramsPostOnly, [ 'triggerPrice', 'stopPrice', 'clientOrderId', 'newClientOrderId', 'timeInForce' ]);
        if (isLimitOrder) {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
            if (postOnly) {
                if (triggerPrice !== undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() does not support postOnly trigger orders');
                }
                request['type'] = 'limit_maker';
            } else if ((timeInForce === 'GTC') || (timeInForce === 'IOC') || (timeInForce === 'FOK')) {
                request['time_in_force'] = timeInForce;
            }
        } else if (isBuy) {
            const [ createMarketBuyOrderRequiresPrice, paramsRequiresPrice ] = this.handleOptionBoolAndParams (query, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
            const cost = this.safeString (paramsRequiresPrice, 'cost');
            query = this.omit (paramsRequiresPrice, 'cost');
            if (cost !== undefined) {
                request['total'] = this.costToPrecision (symbol, cost);
            } else if (createMarketBuyOrderRequiresPrice) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument, or pass the cost in params["cost"]');
                }
                const amountString = this.numberToString (amount);
                const priceString = this.numberToString (price);
                request['total'] = this.costToPrecision (symbol, Precise.stringMul (amountString, priceString));
            } else {
                request['total'] = this.costToPrecision (symbol, amount);
            }
        } else {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (triggerPrice !== undefined) {
            if (clientOrderId !== undefined) {
                throw new InvalidOrder (this.id + ' createOrder() does not support clientOrderId for trigger orders');
            }
            request['condition'] = this.priceToPrecision (symbol, triggerPrice);
        }
        let response: NullableDict = undefined;
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
            response = await this.privatePostV2Order (this.extend (request, query));
        } else {
            response = await this.privatePostOrder (this.extend (request, query));
        }
        //
        //     {
        //         "uid": "019e5186-e497-725a-9aab-971b4f0560f0",
        //         "user_uid": "019b1d7e-5c40-7a93-8e15-2f6c0d9ab471",
        //         "market": "btc_tl",
        //         "trade": "buy",
        //         "type": "limit",
        //         "status": "new",
        //         "price": "100000",
        //         "amount": "0.1",
        //         "total": "0",
        //         "remaining_amount": "0.1",
        //         "average": "0",
        //         "condition": "0",
        //         "created_at": "2026-06-10T19:49:57.529806Z",
        //         "clientOrderId": "mm-order-123"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name paribu#cancelOrder
     * @description cancels an open order
     * @see https://docs.paribu.com/api/orders/cancelling-orders
     * @see https://docs.paribu.com/api/orders/client-order-id-v2
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in, required when cancelling by clientOrderId
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the client order id of the order to cancel, the id argument is ignored if this is provided
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'origClientOrderId');
        if (clientOrderId !== undefined) {
            if (market === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument when cancelling by clientOrderId');
            }
            const query = this.omit (params, [ 'clientOrderId', 'origClientOrderId' ]);
            const clientOrderIdRequest: Dict = {
                'market': market['id'],
                'origClientOrderId': clientOrderId,
            };
            const clientOrderIdResponse = await this.privateDeleteV2Order (this.extend (clientOrderIdRequest, query));
            //
            //     {
            //         "orderId": "1234567890",
            //         "clientOrderId": "mm-order-123"
            //     }
            //
            return this.safeOrder ({
                'info': clientOrderIdResponse,
                'id': this.safeString (clientOrderIdResponse, 'orderId'),
                'clientOrderId': this.safeString (clientOrderIdResponse, 'clientOrderId', clientOrderId),
                'symbol': market['symbol'],
            }, market);
        }
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateDeleteOrderOrderId (this.extend (request, params));
        //
        //     {}
        //
        let symbolResult: Str = undefined;
        if (market !== undefined) {
            symbolResult = market['symbol'];
        }
        return this.safeOrder ({
            'info': response,
            'id': id,
            'symbol': symbolResult,
        }, market);
    }

    /**
     * @method
     * @name paribu#cancelAllOrders
     * @description cancel all open orders, optionally in a single market
     * @see https://docs.paribu.com/api/orders/cancelling-orders
     * @param {string} [symbol] unified market symbol, orders in all markets are cancelled if not provided
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'all' (default), 'limit' or 'conditional', the kind of orders to cancel
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelAllOrders (symbol: Str = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {
            'type': 'all',
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateDeleteOrder (this.extend (request, params));
        //
        //     {}
        //
        return [
            this.safeOrder ({
                'info': response,
            }),
        ];
    }

    /**
     * @method
     * @name paribu#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.paribu.com/api/orders/order-details-and-open-orders
     * @param {string} id the order id
     * @param {string} symbol not used by paribu fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateGetOrderOrderId (this.extend (request, params));
        //
        //     {
        //         "uid": "019e5186-e497-725a-9aab-971b4f0560f0",
        //         "user_uid": "019b1d7e-5c40-7a93-8e15-2f6c0d9ab471",
        //         "market": "btc_tl",
        //         "trade": "buy",
        //         "type": "limit",
        //         "status": "open",
        //         "price": "100000",
        //         "amount": "0.1",
        //         "total": "0",
        //         "remaining_amount": "0.1",
        //         "average": "0",
        //         "created_at": "2026-06-10T19:49:57.529806Z",
        //         "opened_at": "2026-06-10T19:49:57.529806Z",
        //         "closed_at": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name paribu#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.paribu.com/api/orders/order-details-and-open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "uid": "019e5186-e497-725a-9aab-971b4f0560f0",
        //             "market": "btc_tl",
        //             "trade": "sell",
        //             "type": "limit",
        //             "status": "unopen",
        //             "price": "2790000",
        //             "amount": "0.5",
        //             "remaining_amount": "0.5",
        //             "condition": "2800000",
        //             "condition_order_type": "stop_limit",
        //             "clientOrderId": "mm-order-123",
        //             "created_at": "2026-06-10T19:49:57.529806Z"
        //         },
        //     ]
        //
        let orders: Dict[] = [];
        if (Array.isArray (response)) {
            orders = response;
        } else {
            orders = this.safeList2 (response, 'orders', 'data', []);
        }
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'new': 'open',
            'open': 'open',
            'unopen': 'open', // conditional order waiting for its trigger
            'partially_filled': 'open',
            'filled': 'closed',
            'close': 'closed',
            'closed': 'closed',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'expired': 'expired',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder, fetchOrder, fetchOpenOrders
        //
        //     {
        //         "uid": "019e5186-e497-725a-9aab-971b4f0560f0",
        //         "user_uid": "019b1d7e-5c40-7a93-8e15-2f6c0d9ab471",
        //         "market": "btc_tl",
        //         "trade": "buy",
        //         "type": "limit",
        //         "status": "filled",
        //         "price": "100000",
        //         "amount": "0.1",
        //         "total": "10000",
        //         "remaining_amount": "0",
        //         "average": "100000",
        //         "condition": "0",
        //         "created_at": "2026-06-10T19:49:57.529806Z",
        //         "opened_at": "2026-06-10T19:49:57.529806Z",
        //         "closed_at": "2026-06-10T19:49:57.629806Z",
        //         "clientOrderId": "mm-order-123",
        //         "response_type": "FULL",
        //         "fills": [ { "price": "100000", "qty": "0.1", "trade_id": "1234" } ]
        //     }
        //
        const marketId = this.safeString (order, 'market');
        const marketResolved = this.safeMarket (marketId, market, '_');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        let type = this.safeString (order, 'type');
        let postOnly: Bool = undefined;
        if (type === 'limit_maker') {
            type = 'limit';
            postOnly = true;
        }
        let triggerPrice = this.safeString (order, 'condition');
        if ((triggerPrice !== undefined) && Precise.stringEq (triggerPrice, '0')) {
            triggerPrice = undefined;
        }
        let average = this.safeString (order, 'average');
        if ((average !== undefined) && Precise.stringEq (average, '0')) {
            average = undefined;
        }
        let price = this.safeString (order, 'price');
        if ((price !== undefined) && Precise.stringEq (price, '0')) {
            price = undefined;
        }
        let amount = this.safeString (order, 'amount');
        if ((amount !== undefined) && Precise.stringEq (amount, '0')) {
            // market buy orders are placed by total and have no amount
            amount = undefined;
        }
        let cost = this.safeString (order, 'total');
        if ((cost !== undefined) && Precise.stringEq (cost, '0')) {
            cost = undefined;
        }
        const fills = this.safeList (order, 'fills');
        let trades: NullableList = undefined;
        if (fills !== undefined) {
            trades = this.parseTrades (fills, marketResolved);
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'uid'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.parse8601 (this.safeString (order, 'closed_at')),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': marketResolved['symbol'],
            'type': type,
            'timeInForce': this.safeStringUpper (order, 'time_in_force'),
            'postOnly': postOnly,
            'reduceOnly': undefined,
            'side': this.safeString (order, 'trade'),
            'price': price,
            'triggerPrice': triggerPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': undefined,
            'remaining': this.safeString (order, 'remaining_amount'),
            'fee': undefined,
            'trades': trades,
        }, marketResolved);
    }

    /**
     * @method
     * @name paribu#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.paribu.com/api/account/trades-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for, the exchange returns the last 7 days by default
     * @param {int} [limit] the maximum number of trade structures to retrieve, default 20, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {int} [params.page] the page number to fetch, starting from 1
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['filter_market'] = market['id'];
        }
        if (since !== undefined) {
            request['begin_date'] = this.yyyymmdd (since, '-');
        }
        const [ until, paramsUntil ] = this.handleParamInteger (params, 'until');
        if (until !== undefined) {
            request['end_date'] = this.yyyymmdd (until, '-');
        }
        if (limit !== undefined) {
            request['per_page'] = Math.min (limit, 100);
        }
        const response = await this.privateGetTradesHistory (this.extend (request, paramsUntil));
        //
        //     {
        //         "paging": { "page": 1, "pageSize": 20, "total": 0 },
        //         "trades": [
        //             {
        //                 "amount": "12.53400000",
        //                 "commission": "0.03509520",
        //                 "createdAt": "2025-10-15T11:56:49Z",
        //                 "direction": "buy",
        //                 "marketCurrency": "avax",
        //                 "matchId": "7c1f9a04b83e4d6215af0c73e8b91d52",
        //                 "orderId": "z46plm1y-8q2g-ol39-zo05-grv0j37wno9o",
        //                 "paymentCurrency": "tl",
        //                 "price": "570.00000000",
        //                 "role": "TAKER",
        //                 "userId": "k2xorljq-07w6-g0w7-rnw9-e9mypn3814vz"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeList (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * @method
     * @name paribu#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.paribu.com/api/account/transfers
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, the exchange returns the last 60 days by default
     * @param {int} [limit] max number of deposit/withdrawals to return, default 20, max 25
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @param {int} [params.page] the zero-based page index to fetch
     * @returns {object} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            const currencyId = currency['id'];
            if (currencyId === 'tl') {
                request['filter_only_fiat'] = 'true';
            } else {
                request['filter_currency'] = currencyId;
            }
        }
        if (since !== undefined) {
            request['begin_date'] = this.yyyymmdd (since, '-');
        }
        const [ until, paramsUntil ] = this.handleParamInteger (params, 'until');
        if (until !== undefined) {
            request['end_date'] = this.yyyymmdd (until, '-');
        }
        if (limit !== undefined) {
            request['page_size'] = Math.min (limit, 25);
        }
        const response = await this.privateGetTransfersHistory (this.extend (request, paramsUntil));
        //
        //     {
        //         "paging": { "page": 1, "pageSize": 20, "total": 2 },
        //         "transfers": [
        //             {
        //                 "transferId": "<transfer-uuid>",
        //                 "userId": "<user-uuid>",
        //                 "currency": "usdt",
        //                 "amount": "500.00000000",
        //                 "direction": "TransferDirection_Deposit",
        //                 "status": "TransferStatus_Completed",
        //                 "kind": "TransferKind_Transfer",
        //                 "network": "arb",
        //                 "crossAddress": "",
        //                 "tx": "<tx-hash>",
        //                 "addressLabel": "<deposit-address>",
        //                 "bankName": "",
        //                 "createdAt": "2026-09-10T15:30:12.884105Z",
        //                 "verifiedAt": "2026-09-10T15:32:55.031276Z",
        //                 "deletedAt": null
        //             }
        //         ]
        //     }
        //
        const transfers = this.safeList (response, 'transfers', []);
        return this.parseTransactions (transfers, currency, since, limit);
    }

    /**
     * @method
     * @name paribu#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.paribu.com/api/account/transfers
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for, the exchange returns the last 60 days by default
     * @param {int} [limit] the maximum number of deposit structures to retrieve, default 20, max 25
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        const request: Dict = {
            'filter_direction': 'deposit',
        };
        return await this.fetchDepositsWithdrawals (code, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name paribu#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.paribu.com/api/account/transfers
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for, the exchange returns the last 60 days by default
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve, default 20, max 25
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        const request: Dict = {
            'filter_direction': 'withdraw',
        };
        return await this.fetchDepositsWithdrawals (code, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name paribu#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://docs.paribu.com/api/api-reference/transfers
     * @param {string} id withdrawal id
     * @param {string} [code] not used by paribu fetchWithdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawal (id: string, code: Str = undefined, params: Dict = {}): Promise<Transaction> {
        await this.loadMarkets ();
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request: Dict = {
            'withdrawId': id,
        };
        const response = await this.privateGetWithdrawWithdrawId (this.extend (request, params));
        //
        //     {
        //         "withdraw_uid": "019e5186-e497-725a-9aab-971b4f0560f0",
        //         "user_uid": "019b1d7e-5c40-7a93-8e15-2f6c0d9ab471",
        //         "direction": "withdraw",
        //         "amount": "100",
        //         "status": "pending",
        //         "currency": "usdt",
        //         "fee": "1.5",
        //         "fee_currency": "usdt",
        //         "is_cancelable": true,
        //         "created_at": "2026-06-10T19:49:57.529806Z"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'TransferStatus_WaitingApproval': 'pending',
            'TransferStatus_Queued': 'pending',
            'TransferStatus_Processing': 'pending',
            'TransferStatus_PendingDeclaration': 'pending',
            'TransferStatus_Completed': 'ok',
            'TransferStatus_Failed': 'failed',
            'TransferStatus_Cancelled': 'canceled',
            'pending': 'pending',
            'processing': 'pending',
            'completed': 'ok',
            'cancelled': 'canceled',
            'failed': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type: Str) {
        const types: Dict = {
            'TransferDirection_Deposit': 'deposit',
            'TransferDirection_Withdraw': 'withdrawal',
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDepositsWithdrawals
        //
        //     {
        //         "transferId": "<transfer-uuid>",
        //         "userId": "<user-uuid>",
        //         "currency": "usdt",
        //         "amount": "500.00000000",
        //         "direction": "TransferDirection_Deposit",
        //         "status": "TransferStatus_Completed",
        //         "kind": "TransferKind_Transfer",
        //         "network": "arb",
        //         "crossAddress": "",
        //         "tx": "<tx-hash>",
        //         "addressLabel": "<deposit-address>",
        //         "bankName": "",
        //         "createdAt": "2026-09-10T15:30:12.884105Z",
        //         "verifiedAt": "2026-09-10T15:32:55.031276Z",
        //         "deletedAt": null
        //     }
        //
        // fetchWithdrawal
        //
        //     {
        //         "withdraw_uid": "019e5186-e497-725a-9aab-971b4f0560f0",
        //         "user_uid": "019b1d7e-5c40-7a93-8e15-2f6c0d9ab471",
        //         "direction": "withdraw",
        //         "amount": "100",
        //         "status": "pending",
        //         "currency": "usdt",
        //         "fee": "1.5",
        //         "fee_currency": "usdt",
        //         "is_cancelable": true,
        //         "created_at": "2026-06-10T19:49:57.529806Z"
        //     }
        //
        // withdraw
        //
        //     {
        //         "withdraw_uid": "019e5186-e497-725a-9aab-971b4f0560f0"
        //     }
        //
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const type = this.parseTransactionType (this.safeString (transaction, 'direction'));
        const timestamp = this.parse8601 (this.safeString2 (transaction, 'createdAt', 'created_at'));
        const networkId = this.safeString (transaction, 'network');
        let network: Str = undefined;
        if ((networkId !== undefined) && (networkId !== '')) {
            network = this.networkIdToCode (networkId, code);
        }
        let address = this.safeString (transaction, 'addressLabel');
        if ((address === '') || (address === '-')) {
            address = undefined;
        }
        let crossAddress = this.safeString (transaction, 'crossAddress');
        if (crossAddress === '') {
            crossAddress = undefined;
        }
        let addressFrom: Str = undefined;
        let addressTo: Str = undefined;
        if (type === 'deposit') {
            addressFrom = crossAddress;
            addressTo = address;
        } else if (type === 'withdrawal') {
            addressTo = address;
        }
        let txid = this.safeString (transaction, 'tx');
        if (txid === '') {
            txid = undefined;
        }
        let fee: NullableDict = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (transaction, 'fee_currency'), currency),
            };
        }
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'transferId', 'withdraw_uid'),
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': address,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': this.parse8601 (this.safeString (transaction, 'verifiedAt')),
            'internal': (networkId === 'internal') ? true : undefined,
            'comment': undefined,
            'fee': fee,
        } as Transaction;
    }

    /**
     * @method
     * @name paribu#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account, the exchange returns the existing address if one was assigned before
     * @see https://docs.paribu.com/api/deposit-and-withdrawals/assigning-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code, defaults to the first network of the currency
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    override async fetchDepositAddress (code: string, params: Dict = {}): Promise<DepositAddress> {
        return await this.createDepositAddress (code, params);
    }

    /**
     * @method
     * @name paribu#createDepositAddress
     * @description create a deposit address for a currency, the exchange returns the existing address if one was assigned before
     * @see https://docs.paribu.com/api/deposit-and-withdrawals/assigning-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code, defaults to the first network of the currency
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    override async createDepositAddress (code: string, params: Dict = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const [ networkCode, paramsNetwork ] = this.handleNetworkCodeAndParams (params);
        const networkId = this.resolveNetworkId (currency, code, networkCode);
        const request: Dict = {
            'currency': currency['id'],
            'network': networkId,
        };
        const response = await this.privatePostAddressesAssign (this.extend (request, paramsNetwork));
        //
        //     {
        //         "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //         "id": "019a4f2c-3b81-7e60-9d24-5c8f1a0be7d3",
        //         "user_id": "019b1d7e-5c40-7a93-8e15-2f6c0d9ab471",
        //         "currency": "btc",
        //         "network": "btc",
        //         "created_at": "2026-06-10T19:49:57.529806Z",
        //         "updated_at": null,
        //         "deleted_at": ""
        //     }
        //
        return this.parseDepositAddress (response, currency);
    }

    override parseDepositAddress (depositAddress: Dict, currency: Currency = undefined): DepositAddress {
        //
        //     {
        //         "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //         "id": "019a4f2c-3b81-7e60-9d24-5c8f1a0be7d3",
        //         "user_id": "019b1d7e-5c40-7a93-8e15-2f6c0d9ab471",
        //         "currency": "btc",
        //         "network": "btc",
        //         "tag": "123456",
        //         "memo": "123456",
        //         "created_at": "2026-06-10T19:49:57.529806Z",
        //         "updated_at": null,
        //         "deleted_at": ""
        //     }
        //
        const currencyId = this.safeString (depositAddress, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const networkId = this.safeString (depositAddress, 'network');
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        return {
            'info': depositAddress,
            'currency': code,
            'network': this.networkIdToCode (networkId, code),
            'address': address,
            'tag': this.safeString2 (depositAddress, 'tag', 'memo'),
        } as DepositAddress;
    }

    resolveNetworkId (currency: Currency, code: string, networkCode: Str = undefined): string {
        const currencyInfo = this.safeDict (currency, 'info', {});
        const networkIds = this.safeList (currencyInfo, 'networks', []);
        if (networkCode === undefined) {
            const defaultNetworkId = this.safeString (networkIds, 0);
            if (defaultNetworkId === undefined) {
                throw new ArgumentsRequired (this.id + ' requires a network parameter for ' + code);
            }
            return defaultNetworkId;
        }
        const networkId = this.networkCodeToId (networkCode, code);
        if (networkId === undefined) {
            throw new BadRequest (this.id + ' network ' + networkCode + ' is not supported for ' + code);
        }
        return networkId;
    }

    /**
     * @method
     * @name paribu#withdraw
     * @description make a withdrawal
     * @see https://docs.paribu.com/api/deposit-and-withdrawals/withdrawals
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to, or the IBAN for TRY withdrawals
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tag] the memo or tag for networks that require one
     * @param {string} [params.network] unified network code, defaults to the first network of the currency
     * @param {string} [params.declaration_platform] travel rule: 'domestic', 'foreign', 'wallet' or 'internal', required for crypto withdrawals
     * @param {string} [params.declaration_platform_name] travel rule: the name of the destination platform
     * @param {string} [params.declaration_to] travel rule: 'me', 'other' or 'company'
     * @param {string} [params.declaration_to_name] travel rule: the name of the recipient
     * @param {string} [params.declaration_address] travel rule: the account identifier at the destination platform
     * @param {bool} [params.declaration_remember] travel rule: store the declaration for future withdrawals
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async withdraw (code: string, amount: number, address: string, params: Dict = {}): Promise<Transaction> {
        const [ tag, paramsTag ] = this.handleParamString (params, 'tag');
        this.checkAddress (address, code, tag);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const [ networkCode, paramsNetwork ] = this.handleNetworkCodeAndParams (paramsTag);
        const networkId = this.resolveNetworkId (currency, code, networkCode);
        const request: Dict = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'address': address,
            'network': networkId,
        };
        if (tag !== undefined) {
            request['address_tag'] = tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, paramsNetwork));
        //
        //     {
        //         "withdraw_uid": "019e5186-e497-725a-9aab-971b4f0560f0"
        //     }
        //
        const result = this.parseTransaction (response, currency);
        result['type'] = 'withdrawal';
        result['network'] = this.networkIdToCode (networkId, code);
        result['address'] = address;
        result['addressTo'] = address;
        result['tag'] = tag;
        result['tagTo'] = tag;
        return result;
    }

    override sign (path: string, api: string[] = [ 'public' ], method = 'GET', params: Dict = {}): Dict {
        const apiName = api[0];
        const baseUrl = this.safeString (this.urls['api'], apiName);
        if (baseUrl === undefined) {
            throw new ExchangeError (this.id + ' sign() has no API URL for this endpoint');
        }
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const isQueryMethod = (method === 'GET') || (method === 'DELETE');
        let queryString = '';
        let body: Str = undefined;
        if (isQueryMethod) {
            if (Object.keys (query).length > 0) {
                queryString = this.urlencode (query);
                url += '?' + queryString;
            }
        } else {
            body = this.json (query);
        }
        let headers: NullableDict = undefined;
        if (apiName === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            const bodyString = (body === undefined) ? '' : body;
            const payload = timestamp + queryString + bodyString;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'base64');
            headers = {
                'Authorization': this.apiKey,
                'X-Timestamp': timestamp,
                'X-Signature': signature,
            };
            if (!isQueryMethod) {
                headers['Content-Type'] = 'application/json';
            }
        } else if (!isQueryMethod) {
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     { "code": 4135, "message": "The user's asset is currently not available" }
        //     { "code": 401, "message": "Invalid API key or signature" }
        //     { "code": 429, "message": "Rate limit exceeded", "retry_after": 12 }
        //
        if (Array.isArray (response)) {
            return undefined;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString2 (response, 'message', 'error');
        if ((errorCode === undefined) && (code < 400)) {
            return undefined;
        }
        const feedback = this.id + ' ' + body;
        if ((code === 404) && ((url.indexOf ('/order/') >= 0) || (url.indexOf ('/v2/order') >= 0))) {
            throw new OrderNotFound (feedback);
        }
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        if (message !== undefined) {
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        if (code === 401) {
            throw new AuthenticationError (feedback);
        }
        if (code === 403) {
            throw new PermissionDenied (feedback);
        }
        if (code === 429) {
            throw new RateLimitExceeded (feedback);
        }
        if (code >= 400) {
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
