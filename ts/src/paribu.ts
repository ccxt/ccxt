
//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/paribu.js';
import { AccountNotEnabled, AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, MarketClosed, OperationRejected, OrderNotFound, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type { Balances, Currencies, Currency, DepositAddress, Dict, Endpoint, Int, List, Market, NullableDict, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int } from './base/types.js';

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
            // the documented budget is a 100000 weight bucket per minute, but the
            // edge additionally caps every client at 100 requests per second and
            // answers the 101st with HTTP 429 and "Retry-After: 1". 10ms per unit
            // cost is that per-second ceiling, which binds first on every endpoint
            // except the heaviest one (see the per-endpoint costs below)
            'rateLimit': 10,
            'version': '1',
            'certified': false,
            'pro': true,
            // GET /initials/config answers a request with no User-Agent header with
            // HTTP 403 (the other three public endpoints do not), and the C# binding
            // sends no User-Agent unless one is pinned here, so loadMarkets would be
            // unreachable from C# without this
            'userAgent': this.userAgents['chrome'],
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
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
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
                'fetchLedger': false,
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
                'fetchOHLCV': false, // no candle endpoint exists
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false, // no closed-order listing endpoint exists
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false, // no such endpoint
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false, // no such endpoint
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false, // no fee schedule endpoint, commission is observable only after a fill
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
                'ws': true,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/21727215-4c09-4c2d-b058-0802186d8f1e',
                'api': {
                    'public': 'https://api.paribu.com',
                    'private': 'https://api.paribu.com',
                },
                // there is no sandbox, so no 'test' key — setSandboxMode() throws NotSupported
                'www': 'https://www.paribu.com',
                'doc': [
                    'https://docs.paribu.com/api',
                ],
                // no 'fees' url: the exchange publishes no trading fee schedule page,
                // the commission rate is only observable per fill
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
                        'user/assets': { 'cost': 1 } as Endpoint<List>,
                        'open-orders': { 'cost': 1 } as Endpoint<List>,
                        'order/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        // weight 20 out of a 100000 per minute bucket — at the 100/s
                        // edge ceiling this endpoint alone would spend 120000 per
                        // minute, so it is the one endpoint the weight budget binds on
                        'trades/history': { 'cost': 1.25 } as Endpoint<Dict>,
                        'transfers/history': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        // order create is capped at 25 per second
                        'v2/order': { 'cost': 4 } as Endpoint<Dict>,
                        'addresses/assign': { 'cost': 4 } as Endpoint<Dict>,
                        'withdraw': { 'cost': 4 } as Endpoint<Dict>,
                    },
                    'delete': {
                        // order cancel is capped at 25 per second
                        'order/{id}': { 'cost': 4 } as Endpoint<Dict>,
                        'order': { 'cost': 4 } as Endpoint<Dict>,
                        'v2/order': { 'cost': 4 } as Endpoint<Dict>,
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': false, // there is no sandbox
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false, // the read side describes conditional orders but the create contract for them is not published
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true, // a post-only order is its own order type, limit_maker
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': true, // a market buy is sized by quote amount, so a price is needed to convert
                        'marketBuyByCost': true,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined, // the window is bounded by begin_date and end_date, with no published floor
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
                    'fetchOrders': undefined, // no closed-order listing endpoint exists
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
            'precisionMode': TICK_SIZE,
            // the exchange publishes no fee schedule endpoint, so maker and taker
            // stay undefined on every market rather than carrying a guess
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': undefined,
                    'taker': undefined,
                },
            },
            'commonCurrencies': {
                'TL': 'TRY', // the exchange spells the Turkish lira 'tl', not 'try'
            },
            'options': {
                'networks': {
                    'ADA': 'ada',
                    'AKT': 'akt',
                    'ALGO': 'algo',
                    'APT': 'apt',
                    'ARBITRUM': 'arb',
                    'ATOM': 'atom',
                    'AVAXC': 'avaxc',
                    'AVAXX': 'avax',
                    'BASE': 'base',
                    'BCH': 'bch',
                    'BEP20': 'bsc',
                    'BERA': 'bera',
                    'BTC': 'btc',
                    'BTG': 'btg',
                    'CHZ': 'chz',
                    'CHZ2': 'chz2',
                    'DASH': 'dash',
                    'DOGE': 'doge',
                    'DOT': 'dot',
                    'DYDX': 'dydx',
                    'ENJ': 'enj',
                    'EOS': 'eos',
                    'ERC20': 'eth',
                    'ETHW': 'ethw',
                    'FIL': 'fil',
                    'FLR': 'flr',
                    'HYPE': 'hype',
                    'ICP': 'icp',
                    'INJ': 'inj',
                    'IOTA': 'iota',
                    'LINEA': 'linea',
                    'LTC': 'ltc',
                    'MANTA': 'manta',
                    'MATIC': 'pol',
                    'MINA': 'mina',
                    'MONAD': 'monad',
                    'NEAR': 'near',
                    'NEO': 'neo',
                    'NEO3': 'neo3',
                    'ONT': 'ont',
                    'OPTIMISM': 'op',
                    'REEF': 'reef',
                    'RVN': 'rvn',
                    'SEI': 'sei',
                    'SGB': 'sgb',
                    'SOL': 'sol',
                    'SONIC': 'sonic',
                    'STX': 'stx',
                    'SUI': 'sui',
                    'TAO': 'tao',
                    'THETA': 'theta',
                    'TIA': 'tia',
                    'TON': 'ton',
                    'TRC20': 'trx',
                    'VET': 'vet',
                    'WAVES': 'waves',
                    'XLM': 'xlm',
                    'XRP': 'xrp',
                    'XTZ': 'xtz',
                    'ZIL': 'zil',
                    'ZKSYNC': 'zk',
                },
            },
            'exceptions': {
                'exact': {
                    '401': AuthenticationError, // wrong key, wrong signature, or a timestamp outside the +-5s window
                    '403': PermissionDenied, // client ip not allowlisted, or the key lacks the scope
                    '413': BadRequest, // request body too large
                    '429': RateLimitExceeded,
                    '4001': BadRequest,
                    '4002': InvalidOrder, // maximum limit for TRYC market has been reached
                    '4003': InvalidOrder, // minimum limit for TRYC market has been reached
                    '4004': InvalidOrder, // provided minimum price is not acceptable
                    '4005': InvalidOrder, // provided maximum price is not acceptable
                    '4006': InvalidOrder, // provided minimum condition is not acceptable
                    '4007': InvalidOrder, // provided maximum condition is not acceptable
                    '4008': InvalidOrder, // minimum price for conditional order is not reasonable
                    '4009': InvalidOrder, // maximum price for conditional order is not reasonable
                    '4010': InvalidOrder, // total value is below the minimum limit
                    '4011': InvalidOrder, // total value exceeds the maximum limit
                    '4012': AccountSuspended, // the user is currently under a lock status
                    '4013': AccountNotEnabled, // some required user fields are missing
                    '4014': AccountNotEnabled, // the user has not been verified
                    '4015': MarketClosed, // the market is currently suspended
                    '4016': BadSymbol, // the specified market is not valid
                    '4018': PermissionDenied, // the user is not allowed to create an order
                    '4091': DuplicateOrderId, // client order id already in use by an active order
                    '4092': OperationRejected, // order is pending acceptance
                    '4135': InsufficientFunds, // the user's asset is currently not available
                    // 5001 is genuinely ambiguous: it is returned both for a real
                    // internal error and for an unknown market on GET /market/ticker,
                    // so it is mapped to the neutral parent rather than claiming the
                    // exchange is down. An unknown unified symbol never reaches the
                    // wire — market() raises BadSymbol first
                    '5001': ExchangeError,
                    '5031': ExchangeNotAvailable, // client order id registry temporarily unavailable
                },
                'broad': {
                    'Invalid API key or signature': AuthenticationError,
                    'Rate limit exceeded': RateLimitExceeded,
                    'Order not found': OrderNotFound,
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
    override async fetchMarkets (params = {}): Promise<Market[]> {
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
        //                 }
        //             }
        //         }
        //     }
        //
        const payload = this.safeDict (response, 'payload', {});
        const markets = this.safeDict (payload, 'markets', {});
        const marketIds = Object.keys (markets);
        const result = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const entry = this.safeDict (markets, marketId, {});
            result.push (this.parseMarket (this.extend (entry, { 'id': marketId })));
        }
        // the endpoint keys markets by id rather than listing them, and a dictionary
        // has no order in several of the languages this class is transpiled to, so
        // the result is sorted to keep it identical everywhere
        return this.sortBy (result, 'id');
    }

    override parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'id');
        const pairs = this.safeDict (market, 'pairs', {});
        const baseId = this.safeString (pairs, 'market');
        const quoteId = this.safeString (pairs, 'payment');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const steps = this.safeDict (market, 'steps', {});
        // a market is tradable unless it carries a suspension reason or has been delisted
        const suspended = this.safeString (market, 'suspended');
        const unlisted = this.safeBool (market, 'unlisted', false);
        const active = (suspended === undefined) && !unlisted;
        return this.safeMarketStructure ({
            'id': marketId,
            'lowercaseId': marketId,
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
            // the exchange publishes no fee schedule endpoint
            'taker': undefined,
            'maker': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.safeString (steps, 'amount')),
                'price': this.parseNumber (this.safeString (steps, 'price')),
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
                // the minimum notional is enforced by error 4010 but is not published anywhere
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
    override async fetchCurrencies (params = {}): Promise<Currencies> {
        const request: Dict = {
            'scope': 'currencies,networks,fee_matrix',
        };
        const response = await this.publicGetInitialsConfig (this.extend (request, params));
        //
        //     {
        //         "payload": {
        //             "currencies": {
        //                 "btc": {
        //                     "symbol": "btc",
        //                     "name": "Bitcoin",
        //                     "type": "crypto",
        //                     "precision": 8,
        //                     "step": "0.00000001",
        //                     "networks": [ "btc" ],
        //                     "deposit_limits": { "min_amount": "0" },
        //                     "withdraw_limits": { "min_once": "0.00006", "max_once": "2", "max_daily": "0", "max_monthly": "0" },
        //                     "labels": [ "crypto" ],
        //                     "listing_date": "2017-02-14T00:00:00Z"
        //                 }
        //             },
        //             "networks": {
        //                 "btc": {
        //                     "name": "Bitcoin (BTC)",
        //                     "symbol": "btc",
        //                     "network_type": "btc",
        //                     "estimated_arrival_minutes": 10,
        //                     "validations": { "address_regex": "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$" },
        //                     "explorer": { "address": "...", "transaction": "..." }
        //                 }
        //             },
        //             "fee_matrix": { "btc": { "btc": [ { "btc": "0.00005" } ] } }
        //         }
        //     }
        //
        const payload = this.safeDict (response, 'payload', {});
        const currencies = this.safeDict (payload, 'currencies', {});
        const allNetworks = this.safeDict (payload, 'networks', {});
        const feeMatrix = this.safeDict (payload, 'fee_matrix', {});
        const currencyIds = Object.keys (currencies);
        const rows = [];
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const entry = this.safeDict (currencies, currencyId, {});
            const networkIds = this.safeList (entry, 'networks', []);
            const currencyFees = this.safeDict (feeMatrix, currencyId, {});
            const chains = [];
            for (let j = 0; j < networkIds.length; j++) {
                const networkId = this.safeString (networkIds, j);
                const networkEntry = this.safeDict (allNetworks, networkId, {});
                // fee_matrix nests one single-key object per network, keyed by the
                // currency being withdrawn: { "btc": [ { "btc": "0.00005" } ] }
                const feeList = this.safeList (currencyFees, networkId, []);
                const feeEntry = this.safeDict (feeList, 0, {});
                chains.push (this.extend (networkEntry, {
                    'id': networkId,
                    'withdraw_fee': this.safeString (feeEntry, currencyId),
                }));
            }
            rows.push (this.extend (entry, {
                'id': currencyId,
                'chains': chains,
            }));
        }
        return this.parseCurrencies (rows);
    }

    override parseCurrency (rawCurrency: Dict): Currency {
        const currencyId = this.safeString (rawCurrency, 'id');
        const code = this.safeCurrencyCode (currencyId);
        const precision = this.parseNumber (this.safeString (rawCurrency, 'step'));
        const depositLimits = this.safeDict (rawCurrency, 'deposit_limits', {});
        const withdrawLimits = this.safeDict (rawCurrency, 'withdraw_limits', {});
        // both flags carry a localisation key when set and are absent otherwise
        const depositSuspended = this.safeString (rawCurrency, 'deposit_suspended');
        const withdrawSuspended = this.safeString (rawCurrency, 'withdraw_suspended');
        const deposit = (depositSuspended === undefined);
        const withdraw = (withdrawSuspended === undefined);
        const hidden = this.safeBool (rawCurrency, 'hidden', false);
        const chains = this.safeList (rawCurrency, 'chains', []);
        const parsedNetworks: Dict = {};
        for (let i = 0; i < chains.length; i++) {
            const chain = this.safeDict (chains, i, {});
            const networkId = this.safeString (chain, 'id');
            const networkCode = this.networkIdToCode (networkId, code);
            const networkWithdrawSuspended = this.safeString (chain, 'withdraw_suspended');
            if (networkCode !== undefined) {
                parsedNetworks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'name': this.safeString (chain, 'name'),
                    'active': undefined,
                    'deposit': deposit,
                    'withdraw': withdraw && (networkWithdrawSuspended === undefined),
                    'fee': this.parseNumber (this.safeString (chain, 'withdraw_fee')),
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.parseNumber (this.safeString (depositLimits, 'min_amount')),
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.parseNumber (this.safeString (withdrawLimits, 'min_once')),
                            'max': this.parseNumber (this.safeString (withdrawLimits, 'max_once')),
                        },
                    },
                    'info': chain,
                };
            }
        }
        return this.safeCurrencyStructure ({
            'id': currencyId,
            'code': code,
            'name': this.safeString (rawCurrency, 'name'),
            'type': this.safeString (rawCurrency, 'type'),
            'active': !hidden,
            // left undefined on purpose: safeCurrencyStructure ORs the parsed
            // networks into these, and each network already carries the
            // currency-wide suspension, so a currency whose every network is
            // suspended reports false instead of inheriting a stale true
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': this.parseNumber (this.safeString (depositLimits, 'min_amount')),
                    'max': undefined,
                },
                'withdraw': {
                    'min': this.parseNumber (this.safeString (withdrawLimits, 'min_once')),
                    'max': this.parseNumber (this.safeString (withdrawLimits, 'max_once')),
                },
            },
            'networks': parsedNetworks,
            'info': rawCurrency,
        });
    }

    /**
     * @method
     * @name paribu#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.paribu.com/api/market-data/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        //
        //     [
        //         {
        //             "average": "3705073",
        //             "change": "20950",
        //             "first": "3685212",
        //             "high": "3748788",
        //             "last": "3706162",
        //             "low": "3651754",
        //             "market": "btc_tl",
        //             "pair_volume": "145911624",
        //             "percentage": "0.56",
        //             "volume": "39.381576"
        //         }
        //     ]
        //
        const first = this.safeDict (response, 0, {});
        return this.parseTicker (first, market);
    }

    /**
     * @method
     * @name paribu#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.paribu.com/api/market-data/ticker
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketTicker (params);
        return this.parseTickers (response, symbols);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'market');
        market = this.safeMarket (marketId, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': market['symbol'],
            // the endpoint carries no timestamp of its own and inventing one would
            // make every ticker look fresh, so both stay undefined
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            // the endpoint publishes no top of book
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            // the exchange's own 'average' field is the volume weighted average price
            // rounded to the market's price tick, not the midpoint of open and close
            // that the unified structure means by 'average'. safeTicker derives the
            // exact vwap from the two volumes and the midpoint from open and close
            'vwap': undefined,
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
        }, market);
    }

    /**
     * @method
     * @name paribu#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paribu.com/api/market-data/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, between 1 and 100, defaults to 20
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        //     {
        //         "bids": [ [ "3708334", "0.025942" ] ],
        //         "asks": [ [ "3710326", "0.027108" ] ],
        //         "timestamp": 1789652868,
        //         "last_offset": 253813712,
        //         "seq": 31377006
        //     }
        //
        const timestamp = this.safeTimestamp (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
        orderbook['nonce'] = this.safeInteger (response, 'seq');
        return orderbook;
    }

    /**
     * @method
     * @name paribu#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.paribu.com/api/market-data/recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms, filters the returned window locally, the endpoint itself only serves the most recent trades
     * @param {int} [limit] the maximum amount of trades to fetch, the exchange caps it at 20
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the endpoint rejects a missing limit with error 4001 and refuses anything
        // above 20, so an unset or oversized limit is clamped to the maximum
        const maxLimit = 20;
        if ((limit === undefined) || (limit > maxLimit)) {
            limit = maxLimit;
        }
        const request: Dict = {
            'market': market['id'],
            'limit': limit,
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "price": "3709357.00000000",
        //             "amount": "0.09993500",
        //             "time": "2026-09-17T13:47:46.690598470Z",
        //             "trade": "sell"
        //         }
        //     ]
        //
        // the endpoint answers newest first and timestamps to the nanosecond, while
        // the unified structure holds milliseconds. parseTrades sorts on the
        // truncated value, so trades sharing a millisecond would keep the
        // newest-first order they arrived in, which is backwards — sorting on the
        // published time first puts them in execution order and the later sort is
        // stable over them. the fractional part is fixed width, so the string
        // comparison is chronological
        const chronological = this.sortBy (response, 'time', false, '');
        return this.parseTrades (chronological, market, since, limit);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        // the public feed and the private trade history publish two different
        // shapes, and only the private one carries an identifier
        const matchId = this.safeString (trade, 'matchId');
        if (matchId !== undefined) {
            return this.parseMyTrade (trade, market);
        }
        // the endpoint timestamps trades with nanosecond precision, which
        // parse8601 truncates to milliseconds
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            // the endpoint publishes no trade id
            'id': undefined,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            // 'trade' is the side the taker took
            'side': this.safeString (trade, 'trade'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    parseMyTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "amount": "12.53400000",
        //         "commission": "0.03509520",
        //         "createdAt": "2025-10-15T11:56:49Z",
        //         "direction": "buy",
        //         "marketCurrency": "avax",
        //         "paymentCurrency": "tl",
        //         "price": "570.00000000",
        //         "orderId": "...",
        //         "matchId": "...",
        //         "role": "TAKER",
        //         "userId": "..."
        //     }
        //
        const baseId = this.safeString (trade, 'marketCurrency');
        const quoteId = this.safeString (trade, 'paymentCurrency');
        // the private history names the two sides instead of publishing the market id
        const marketId = baseId + '_' + quoteId;
        market = this.safeMarket (marketId, market);
        const timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        const side = this.safeStringLower (trade, 'direction');
        let takerOrMaker = this.safeStringLower (trade, 'role');
        if (takerOrMaker === 'unknown') {
            takerOrMaker = undefined;
        }
        // the commission carries no currency of its own. Measured across buy and
        // sell fills in both directions, it is always charged in the currency the
        // account receives: the base currency on a buy, the quote currency on a sell
        const feeCurrencyId = (side === 'buy') ? baseId : quoteId;
        return this.safeTrade ({
            'id': this.safeString (trade, 'matchId'),
            'order': this.safeString (trade, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': {
                'cost': this.safeString (trade, 'commission'),
                'currency': this.safeCurrencyCode (feeCurrencyId),
            },
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name paribu#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.paribu.com/api/account/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetUserAssets (params);
        //
        //     [
        //         {
        //             "currency": "tl",
        //             "total": "100.00000000",
        //             "blocked_in_orders": "0.00000000",
        //             "blocked_in_transactions": "0.00000000",
        //             "blocked_in_staked": "0.00000000",
        //             "blocked": "0.00000000",
        //             "locked": "0.00000000",
        //             "available": "100.00000000",
        //             "details": { "conversion_in": "0", "conversion_out": "0", "assigned": "0" }
        //         }
        //     ]
        //
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const entry = this.safeDict (response, i, {});
            // the two documented schemas spell the code differently, the live
            // endpoint serves the first spelling
            const currencyId = this.safeString2 (entry, 'currency', 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (entry, 'available');
            // the exchange withholds a balance in several separate fields, of which
            // 'locked' is only one — staked and in-flight amounts sit in their own —
            // while the published total covers every one of them, so the used part is
            // derived from the total rather than read from any single field
            account['total'] = this.safeString (entry, 'total');
            if (code !== undefined) {
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name paribu#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.paribu.com/api/orders/order-details-and-open-orders
     * @param {string} [symbol] unified market symbol, all markets are returned if not assigned
     * @param {int} [since] the earliest time in ms to fetch open orders for, filters the returned window locally
     * @param {int} [limit] the maximum number of open order structures to retrieve, applied locally
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name paribu#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.paribu.com/api/orders/order-details-and-open-orders
     * @param {string} id the order id
     * @param {string} [symbol] not used by paribu fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        const response = await this.privateGetOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const rawType = this.safeString (order, 'type');
        // post-only is an order type of its own rather than a flag on a limit order.
        // an acknowledgement that carries no type at all — the empty body of a cancel —
        // leaves this unknown rather than claiming the order was not post-only
        let isPostOnly = undefined;
        let orderType = rawType;
        if (rawType === 'limit_maker') {
            isPostOnly = true;
            orderType = 'limit';
        } else if (rawType !== undefined) {
            isPostOnly = false;
        }
        const remaining = this.safeString (order, 'remaining_amount');
        let status = this.safeString (order, 'status');
        // 'close' is the only terminal status the exchange publishes and it covers a
        // filled order and a cancelled one alike — both were observed live — so the
        // remaining amount is what separates them
        if (status === 'close') {
            if ((remaining !== undefined) && Precise.stringGt (remaining, '0')) {
                status = 'canceled';
            } else {
                status = 'closed';
            }
        } else {
            status = this.parseOrderStatus (status);
        }
        return this.safeOrder ({
            // the cancel-by-client-id route names the same field differently
            'id': this.safeString2 (order, 'uid', 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': isPostOnly,
            'side': this.safeString (order, 'trade'),
            'price': this.safeString (order, 'price'),
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'amount'),
            // the exchange's own total is the notional of the whole order, not the
            // filled part — an untouched resting order already carries it — so the
            // filled cost is left to be derived from the amount actually executed
            'cost': undefined,
            'average': this.safeString (order, 'average'),
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'new': 'open',
            'open': 'open',
        };
        // an unrecognised value is passed through unchanged rather than being
        // defaulted, so a status the exchange adds later is never mislabelled
        return this.safeString (statuses, status, status);
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
     * @param {float} amount how much of the base currency to trade, ignored for a market buy
     * @param {float} [price] the price to trade at, required for a limit order
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] true to place the order as a post-only limit_maker order
     * @param {string} [params.timeInForce] 'GTC', 'IOC' or 'FOK', limit orders only
     * @param {string} [params.clientOrderId] a client-assigned id, 1-36 characters of letters, digits, underscore and hyphen
     * @param {float} [params.cost] the quote amount to spend on a market buy, an alternative to passing amount and price
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'trade': side,
            'type': type,
        };
        const postOnly = this.safeBool (params, 'postOnly', false);
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        const clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, [ 'postOnly', 'timeInForce', 'clientOrderId' ]);
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
        }
        if (type === 'market') {
            if (side === 'buy') {
                // a market buy is sized by the quote amount the exchange calls the
                // total, so either it is passed directly or it is derived from the
                // base amount and a price
                let quoteAmount = this.safeString (params, 'cost');
                params = this.omit (params, 'cost');
                if (quoteAmount === undefined) {
                    if (price === undefined) {
                        throw new ArgumentsRequired (this.id + ' createOrder() requires the price argument or a cost parameter for a market buy order, the exchange sizes it by the quote amount');
                    }
                    quoteAmount = Precise.stringMul (this.numberToString (amount), this.numberToString (price));
                }
                request['total'] = this.costToPrecision (symbol, quoteAmount);
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires the price argument for a limit order');
            }
            if (postOnly) {
                // post-only is its own order type rather than a flag, and it rejects
                // a time in force of its own
                request['type'] = 'limit_maker';
            } else if (timeInForce !== undefined) {
                request['time_in_force'] = timeInForce;
            }
            request['amount'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostV2Order (this.extend (request, params));
        //
        //     {
        //         "uid": "019e5186-e497-725a-9aab-971b4f0560f0",
        //         "status": "new",
        //         "remaining_amount": "0.1",
        //         "average": "0",
        //         "total": "0",
        //         "response_type": "ACK"
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
     * @param {string} id order id, ignored when a clientOrderId is supplied
     * @param {string} [symbol] unified market symbol, required only when cancelling by clientOrderId
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel by the client-assigned id instead of the exchange id
     * @returns {object} An [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'origClientOrderId');
        let response = undefined;
        if (clientOrderId === undefined) {
            const request: Dict = {
                'id': id,
            };
            response = await this.privateDeleteOrderId (this.extend (request, params));
            //
            //     {}
            //
            // the acknowledgement carries no order at all, so the id that was asked
            // to be cancelled is carried over from the request to keep the returned
            // structure identifiable
            response = this.extend ({ 'uid': id }, response);
        } else {
            if (market === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument when cancelling by clientOrderId');
            }
            params = this.omit (params, [ 'clientOrderId', 'origClientOrderId' ]);
            const request: Dict = {
                'market': market['id'],
                'origClientOrderId': clientOrderId,
            };
            response = await this.privateDeleteV2Order (this.extend (request, params));
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name paribu#cancelAllOrders
     * @description cancel all open orders, optionally in a single market
     * @see https://docs.paribu.com/api/orders/cancelling-orders
     * @param {string} [symbol] unified market symbol, every market is cancelled if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] which orders to cancel, one of 'all', 'limit' or 'conditional', defaults to 'all'
     * @returns {object[]} a list with a single [order structure](https://docs.ccxt.com/#/?id=order-structure) carrying the raw response
     */
    override async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
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
        // the endpoint reports no per-order outcome, so there is nothing to parse
        // beyond the raw acknowledgement
        return [ this.safeOrder ({
            'info': response,
        }) ];
    }

    /**
     * @method
     * @name paribu#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.paribu.com/api/account/trades-history
     * @param {string} [symbol] unified market symbol, every market is returned if not assigned
     * @param {int} [since] the earliest time in ms to fetch trades for, sent as a whole-day lower bound
     * @param {int} [limit] the maximum number of trades to retrieve, the exchange caps a page at 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for, sent as a whole-day upper bound
     * @param {int} [params.page] the page to retrieve, the exchange pages from 1
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['filter_market'] = market['id'];
        }
        // the window is expressed in whole days and a value the exchange cannot read
        // is silently ignored in favour of its own default of the last sixty days
        if (since !== undefined) {
            request['begin_date'] = this.yyyymmdd (since, '-');
        }
        const endTime = this.safeInteger (params, 'until');
        if (endTime !== undefined) {
            params = this.omit (params, 'until');
            request['end_date'] = this.yyyymmdd (endTime, '-');
        }
        const maxPageSize = 100;
        if (limit !== undefined) {
            if (limit > maxPageSize) {
                limit = maxPageSize;
            }
            request['per_page'] = limit;
        }
        const response = await this.privateGetTradesHistory (this.extend (request, params));
        //
        //     {
        //         "paging": { "page": 1, "pageSize": 20 },
        //         "trades": [ { "amount": "12.53400000", "commission": "0.03509520" } ]
        //     }
        //
        const rows = this.safeList (response, 'trades', []);
        return this.parseTrades (rows, market, since, limit);
    }

    /**
     * @method
     * @name paribu#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.paribu.com/api/account/transfers
     * @param {string} [code] unified currency code, every currency is returned if not assigned
     * @param {int} [since] the earliest time in ms to fetch transfers for, sent as a whole-day lower bound
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for, sent as a whole-day upper bound
     * @param {int} [params.page] the page to retrieve, the exchange pages from 1
     * @returns {object[]} a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)
     */
    override async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let currency = undefined;
        const request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['filter_currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['begin_date'] = this.yyyymmdd (since, '-');
        }
        const endTime = this.safeInteger (params, 'until');
        if (endTime !== undefined) {
            params = this.omit (params, 'until');
            request['end_date'] = this.yyyymmdd (endTime, '-');
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetTransfersHistory (this.extend (request, params));
        //
        //     {
        //         "paging": { "page": 1, "pageSize": 20, "total": 74 },
        //         "transfers": [ { "amount": "975.30329900", "currency": "usdt" } ]
        //     }
        //
        const rows = this.safeList (response, 'transfers', []);
        return this.parseTransactions (rows, currency, since, limit);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "addressLabel": "0x...",
        //         "amount": "975.30329900",
        //         "bankName": "",
        //         "createdAt": "2026-09-16T12:22:33.820058Z",
        //         "crossAddress": "",
        //         "currency": "usdt",
        //         "deletedAt": null,
        //         "direction": "TransferDirection_Deposit",
        //         "kind": "TransferKind_Transfer",
        //         "network": "arb",
        //         "status": "TransferStatus_Completed",
        //         "transferId": "...",
        //         "tx": "0x...",
        //         "userId": "...",
        //         "verifiedAt": "2026-09-16T12:22:45.697393Z"
        //     }
        //
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const networkId = this.safeString (transaction, 'network');
        // the destination of the movement: the account's own address on a deposit,
        // the external one on a withdrawal
        const address = this.safeString (transaction, 'addressLabel');
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'transferId', 'withdraw_uid'),
            'txid': this.safeString (transaction, 'tx'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId, code),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': this.parseTransactionType (this.safeString (transaction, 'direction')),
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': this.parse8601 (this.safeString (transaction, 'verifiedAt')),
            'comment': undefined,
            'internal': undefined,
            // the endpoint publishes no per-transfer fee
            'fee': undefined,
        } as Transaction;
    }

    parseTransactionType (type: Str): Str {
        // the live endpoint prefixes the value with the name of its own enum while
        // the documentation spells the bare form, so both are mapped. Only the two
        // prefixed spellings below were seen on the wire
        const types: Dict = {
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
            'TransferDirection_Deposit': 'deposit',
            'TransferDirection_Withdraw': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    parseTransactionStatus (status: Str): Str {
        // same two spellings as the direction above. Only the completed value was
        // seen on the wire, the rest follow the documented vocabulary
        const statuses: Dict = {
            'completed': 'ok',
            'pending': 'pending',
            'failed': 'failed',
            'TransferStatus_Completed': 'ok',
            'TransferStatus_Pending': 'pending',
            'TransferStatus_Failed': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name paribu#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account, assigning one if the account does not have it yet
     * @see https://docs.paribu.com/api/deposit-and-withdrawals/assigning-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the unified network to assign the address on, required unless the currency has exactly one network
     * @returns {object} an [address structure](https://docs.ccxt.com/#/?id=address-structure)
     */
    override async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        let networkCode = this.safeString (params, 'network');
        params = this.omit (params, 'network');
        if (networkCode === undefined) {
            // the endpoint assigns one address per network and has no default of its
            // own, so a currency reachable over several of them needs to be told
            const chains = this.safeDict (currency, 'networks', {});
            // the length check is inline on purpose: reading it off a local loses the
            // list hint and the php transpiler emits strlen () against an array
            if (Object.keys (chains).length !== 1) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a network parameter for ' + code + ', the exchange assigns one address per network');
            }
            const chainCodes = Object.keys (chains);
            networkCode = this.safeString (chainCodes, 0);
        }
        const networkId = this.networkCodeToId (networkCode, code);
        const request: Dict = {
            'currency': currency['id'],
            'network': networkId,
        };
        const response = await this.privatePostAddressesAssign (this.extend (request, params));
        //
        //     {
        //         "address": "r...",
        //         "id": "...",
        //         "user_id": "...",
        //         "currency": "xrp",
        //         "network": "xrp",
        //         "memo": "649096111",
        //         "tag": "649096111",
        //         "created_at": "2026-09-17T15:48:14.592725344Z",
        //         "updated_at": null,
        //         "deleted_at": ""
        //     }
        //
        // an address already on file is echoed with the network it was first stored
        // under rather than the one that was asked for, and an address-family record
        // covers every network in that family, so the requested network is the one
        // reported back
        return this.parseDepositAddress (this.extend (response, { 'network': networkId }), currency);
    }

    override parseDepositAddress (depositAddress: any, currency: Currency = undefined): DepositAddress {
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        const currencyId = this.safeString (depositAddress, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const networkId = this.safeString (depositAddress, 'network');
        return {
            'info': depositAddress,
            'currency': code,
            'network': this.networkIdToCode (networkId, code),
            'address': address,
            // only a currency whose network needs one carries it, under two names
            'tag': this.safeString2 (depositAddress, 'tag', 'memo'),
        } as DepositAddress;
    }

    /**
     * @method
     * @name paribu#withdraw
     * @description make a withdrawal
     * @see https://docs.paribu.com/api/deposit-and-withdrawals/withdrawals
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] the destination tag or memo, required by some networks
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the unified network to withdraw over, required unless the currency has exactly one network
     * @param {string} [params.declaration_platform] travel rule declaration, required for every currency other than the lira
     * @param {string} [params.declaration_to] travel rule declaration, required unless the destination is internal
     * @param {string} [params.declaration_to_name] travel rule declaration, required unless the destination is internal
     * @param {string} [params.declaration_platform_name] travel rule declaration, required unless the destination is internal
     * @param {string} [params.declaration_address] travel rule declaration, required unless the destination is internal or your own
     * @returns {object} a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)
     */
    override async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        let networkCode = this.safeString (params, 'network');
        params = this.omit (params, 'network');
        if (networkCode === undefined) {
            const chains = this.safeDict (currency, 'networks', {});
            // inline for the same reason as in fetchDepositAddress above
            if (Object.keys (chains).length !== 1) {
                throw new ArgumentsRequired (this.id + ' withdraw() requires a network parameter for ' + code + ', the exchange withdraws over one named network');
            }
            const chainCodes = Object.keys (chains);
            networkCode = this.safeString (chainCodes, 0);
        }
        const request: Dict = {
            'currency': currency['id'],
            'network': this.networkCodeToId (networkCode, code),
            'amount': this.currencyToPrecision (code, amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['address_tag'] = tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        //
        //     { "withdraw_uid": "..." }
        //
        return this.parseTransaction (response, currency);
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        // the signature covers the query string byte for byte as it appears on the
        // URL, so the same string is both appended and signed
        let queryString = '';
        let bodyString = '';
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length > 0) {
                queryString = this.urlencode (query);
                url += '?' + queryString;
            }
        } else {
            bodyString = this.json (query);
            body = bodyString;
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            // the request path is not part of the payload, and the timestamp must be
            // within five seconds of server time
            const timestamp = this.numberToString (this.milliseconds ());
            const payload = timestamp + queryString + bodyString;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'base64');
            headers = {
                'Authorization': this.apiKey, // raw, no Bearer prefix
                'X-Timestamp': timestamp,
                'X-Signature': signature,
            };
            if ((method === 'POST') || (method === 'PUT')) {
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            // GET /orderbook answers an unknown market with HTTP 200 and a bare
            // "null" body instead of an error, and that null would reach the
            // parser. The match is on the exact body so that any other
            // unparseable payload keeps its own handling
            // the base trims the body before parsing it but hands this handler the
            // untrimmed one, so the comparison has to trim for itself or a padded
            // body would slip past as an empty book
            // the four-character text this endpoint answers an unknown market with.
            // it is spelled in two halves because the transpiler to python rewrites
            // that word into python's own null keyword wherever it lands on a line —
            // inside a quoted string and inside an identifier alike — which silently
            // turns the comparison below into one that can never be true. split, it
            // survives into all six languages intact
            const bareNull = 'nu' + 'll';
            if ((httpCode === 200) && (body !== undefined) && (bareNull === body.trim ())) {
                // the message deliberately avoids the bare word that names this
                // method's own parameter, which the php transpiler would rewrite
                // into the string
                throw new BadSymbol (this.id + ' ' + method + ' ' + url + ' returned a null payload, the requested market does not exist');
            }
            return undefined;
        }
        const errorCode = this.safeString (response, 'code');
        if (errorCode === undefined) {
            return undefined;
        }
        const message = this.safeString (response, 'message');
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        throw new ExchangeError (feedback);
    }
}
