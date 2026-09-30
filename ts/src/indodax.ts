
//  ---------------------------------------------------------------------------

import { sha256, sha512 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/indodax.js';
import { ExchangeError, ArgumentsRequired, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError, BadSymbol, NotSupported, InvalidNonce, RateLimitExceeded, OnMaintenance, InvalidAddress, BadRequest, ExchangeNotAvailable } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type{ Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction, int, DepositAddress, Fee, List, NullableDict, DepositWithdrawFee, Endpoint } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class indodax
 * @augments Exchange
 */
export default class indodax extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'indodax',
            'name': 'INDODAX',
            'countries': [ 'ID' ], // Indonesia
            // 10 requests per second for making trades => 1000ms / 10 = 100ms
            // 180 requests per minute (public endpoints) = 2 requests per second => cost = (1000ms / rateLimit) / 2 = 5
            'rateLimit': 50,
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
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchAllGreeks': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': false,
                'fetchDepositAddress': 'emulated',
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchDepositWithdrawFee': true,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingLimits': false,
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
                'fetchMarkPrice': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
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
                'fetchPositionForSymbolWs': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsForSymbolWs': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTradingLimits': true,
                'fetchTransactionFee': true,
                'fetchTransactionFees': false,
                'fetchTransactions': 'emulated',
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
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
            'version': '2.0', // as of 9 April 2018
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg',
                'api': {
                    'public': 'https://indodax.com',
                    'private': 'https://indodax.com/tapi',
                    'v2': 'https://api.indodax.com',
                },
                'www': 'https://www.indodax.com',
                'doc': 'https://github.com/btcid/indodax-official-api-docs',
                'referral': 'https://indodax.com/ref/testbitcoincoid/1',
            },
            'api': {
                'public': {
                    'get': {
                        'api/server_time': { 'cost': 5 } as Endpoint<Dict>,
                        'api/pairs': { 'cost': 5 } as Endpoint<List>,
                        'api/price_increments': { 'cost': 5 } as Endpoint<Dict>,
                        'api/summaries': { 'cost': 5 } as Endpoint<Dict>,
                        'api/ticker/{pair}': { 'cost': 5 } as Endpoint<Dict>,
                        'api/ticker_all': { 'cost': 5 } as Endpoint<Dict>,
                        'api/trades/{pair}': { 'cost': 5 } as Endpoint<List>,
                        'api/depth/{pair}': { 'cost': 5 } as Endpoint<Dict>,
                        'tradingview/history_v2': { 'cost': 5 } as Endpoint<List>,
                    },
                },
                'private': {
                    'post': {
                        'getInfo': { 'cost': 4 } as Endpoint<Dict>,
                        'transHistory': { 'cost': 4 } as Endpoint<Dict>,
                        'trade': { 'cost': 1 } as Endpoint<Dict>,
                        'tradeHistory': { 'cost': 4 } as Endpoint<Dict>, // TODO add fetchMyTrades
                        'openOrders': { 'cost': 4 } as Endpoint<Dict>,
                        'orderHistory': { 'cost': 4 } as Endpoint<Dict>,
                        'getOrder': { 'cost': 4 } as Endpoint<Dict>,
                        'getOrderByClientOrderId': { 'cost': 4 } as Endpoint<Dict>,
                        'cancelOrder': { 'cost': 4 } as Endpoint<Dict>,
                        'cancelByClientOrderId': { 'cost': 4 } as Endpoint<Dict>,
                        'withdrawFee': { 'cost': 4 } as Endpoint<Dict>,
                        'withdrawCoin': { 'cost': 4 } as Endpoint<Dict>,
                        'listDownline': { 'cost': 4 } as Endpoint<Dict>,
                        'checkDownline': { 'cost': 4 } as Endpoint<Dict>,
                        'createVoucher': { 'cost': 4 } as Endpoint<Dict>, // partner only
                    },
                },
                'v2': {
                    'get': {
                        'order': { 'cost': 4 } as Endpoint<Dict>,
                        'openOrders': { 'cost': 4 } as Endpoint<List>,
                        'order/histories': { 'cost': 4 } as Endpoint<Dict>,
                        'myTrades': { 'cost': 4 } as Endpoint<Dict>,
                        'account': { 'cost': 4 } as Endpoint<Dict>,
                        'capital/withdraw/history': { 'cost': 24 } as Endpoint<List>,
                        'capital/deposit/hisrec': { 'cost': 24 } as Endpoint<List>,
                        'capital/deposit/address/list': { 'cost': 24 } as Endpoint<List>,
                        'fiat/orders': { 'cost': 24 } as Endpoint<Dict>,
                    },
                    'post': {
                        'order': { 'cost': 4 } as Endpoint<Dict>,
                        'capital/withdraw/apply': { 'cost': 24 } as Endpoint<Dict>,
                        'fiat/withdraw': { 'cost': 24 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'order': { 'cost': 4 } as Endpoint<Dict>,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.003,
                },
            },
            'exceptions': {
                'exact': {
                    'invalid_pair': BadSymbol, // {"error":"invalid_pair","error_description":"Invalid Pair"}
                    'Insufficient balance.': InsufficientFunds,
                    'invalid order.': OrderNotFound,
                    'Invalid credentials. API not found or session has expired.': AuthenticationError,
                    'Invalid credentials. Bad sign.': AuthenticationError,
                    '-1121': BadSymbol,
                    '-2013': OrderNotFound,
                    '-1021': InvalidNonce,
                    'invalid_timestamp': InvalidNonce,
                    '-1022': AuthenticationError,
                    '-1002': AuthenticationError,
                    '-2014': AuthenticationError,
                    '-2015': AuthenticationError,
                    '-1003': RateLimitExceeded,
                    '-2010': InvalidOrder,
                    '-4026': InsufficientFunds,
                    '-1102': BadRequest,
                    '-1001': ExchangeNotAvailable,
                    '-1099': BadRequest,
                    '-1016': OnMaintenance,
                    '1109': BadRequest,
                    '1112': OrderNotFound,
                    '-1130': InvalidOrder,
                    '-1111': InvalidOrder,
                    '-4022': InvalidOrder,
                    '-4023': InvalidOrder,
                    '-4033': InvalidAddress,
                    '-4035': InvalidAddress,
                    '-4039': BadRequest,
                    '-4060': InsufficientFunds,
                    '-4019': InvalidOrder,
                },
                'broad': {
                    'Minimum price': InvalidOrder,
                    'Minimum order': InvalidOrder,
                    'nsufficient balance': InsufficientFunds,
                },
            },
            'timeframes': {
                '1m': '1',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': '1D',
                '3d': '3D',
                '1w': '1W',
            },
            // exchange-specific options
            'options': {
                'tapiVersion': '1', // '2' opts private calls into TAPI v2; a v1 key cannot call v2
                'recvWindow': 5 * 1000, // default 5 sec
                'timeDifference': 0, // the difference between system clock and exchange clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'networks': {
                    'XLM': 'Stellar Token',
                    'BSC': 'bep20',
                    'TRC20': 'trc20',
                    'MATIC': 'polygon',
                    // 'BEP2': 'bep2',
                    // 'ARBITRUM': 'arb',
                    // 'ERC20': 'erc20',
                    // 'KIP7': 'kip7',
                    // 'MAINNET': 'mainnet',  // TODO: does mainnet just mean the default?
                    // 'OEP4': 'oep4',
                    // 'OP': 'op',
                    // 'TRC10': 'trc10',
                    // 'ZRC2': 'zrc2'
                    // 'ETH': 'eth'
                    // 'BASE': 'base'
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
                            'IOC': true, // todo implementation
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'daysBack': 7,
                        'limit': 1000,
                        'untilDays': 7,
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
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 7,
                        'untilDays': 7,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000, // todo
                        'daysBackCanceled': 1,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOHLCV': {
                        'limit': 2000, // todo: not in request
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
            'commonCurrencies': {
                'STR': 'XLM',
                'BCHABC': 'BCH',
                'BCHSV': 'BSV',
                'DRK': 'DASH',
                'NEM': 'XEM',
            },
            'precisionMode': TICK_SIZE,
        });
    }

    override nonce (): number {
        return this.milliseconds () - this.safeInteger (this.options, 'timeDifference', 0);
    }

    /**
     * @ignore
     * @method
     * @name indodax#requestTimestamp
     * @description millisecond timestamp for a signed request, as an integer string
     * @returns {string} timestamp in milliseconds
     */
    requestTimestamp (): string {
        const timeDifference = this.safeInteger (this.options, 'timeDifference', 0);
        return this.numberToString (this.milliseconds () - timeDifference);
    }

    /**
     * @ignore
     * @method
     * @name indodax#isTapiV2
     * @description whether private calls should use TAPI v2
     * @returns {boolean} true when options.tapiVersion is "2"
     */
    isTapiV2 (): boolean {
        return this.safeString (this.options, 'tapiVersion', '1') === '2';
    }

    /**
     * @ignore
     * @method
     * @name indodax#tapiV2Symbol
     * @description convert a market to the lowercase TAPI v2 symbol
     * @param {object} market market structure
     * @returns {string} exchange symbol such as btcidr
     */
    tapiV2Symbol (market: Market): string {
        let marketId = this.safeString (market, 'id', '');
        marketId = marketId.replace ('_', '');
        return marketId.toLowerCase ();
    }

    /**
     * @ignore
     * @method
     * @name indodax#v1PairId
     * @description TAPI v1 pair id, which is ticker_id rather than the public pair id
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md
     * @param {object} market unified market
     * @returns {string} pair id such as btc_idr
     */
    v1PairId (market: Market): string {
        const info = this.safeDict (market, 'info', {});
        const tickerId = this.safeString (info, 'ticker_id');
        if (tickerId !== undefined) {
            return tickerId;
        }
        return this.safeString (market, 'id', '');
    }

    /**
     * @ignore
     * @method
     * @name indodax#marketFromV1Pair
     * @description find a market for a TAPI v1 pair id such as btc_idr
     * @param {string} pairId pair id from an order or the open-orders map
     * @returns {object} a market structure
     */
    marketFromV1Pair (pairId: Str): Market {
        if ((pairId !== undefined) && (this.markets_by_id !== undefined) && (pairId in this.markets_by_id)) {
            return this.safeMarket (pairId);
        }
        const marketList = this.toArray (this.markets);
        for (let i = 0; i < marketList.length; i++) {
            const entry = marketList[i];
            const info = this.safeDict (entry, 'info', {});
            const tickerId = this.safeString (info, 'ticker_id');
            if ((tickerId !== undefined) && (tickerId === pairId)) {
                return entry;
            }
        }
        if ((pairId !== undefined) && (pairId.indexOf ('_') >= 0)) {
            return this.safeMarket (pairId, undefined, '_');
        }
        return this.safeMarket (pairId);
    }

    /**
     * @method
     * @name indodax#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params: Dict = {}): Promise<Int> {
        const response = await this.publicGetApiServerTime (params);
        //
        //     {
        //         "timezone": "UTC",
        //         "server_time": 1571205969552
        //     }
        //
        return this.safeInteger (response, 'server_time');
    }

    /**
     * @ignore
     * @method
     * @name indodax#pairPriceStep
     * @description tick size for a public pair
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#pairs
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#price-increments
     * @param {object} market raw pair from GET /api/pairs
     * @param {string} [increment] price step from GET /api/price_increments
     * @returns {string} tick size
     */
    pairPriceStep (market: Dict, increment: Str = undefined): Str {
        if ((increment !== undefined) && (increment !== '')) {
            return increment;
        }
        const pricescale = this.safeString (market, 'pricescale');
        if (pricescale !== undefined) {
            return pricescale;
        }
        const pricePrecision = this.safeString (market, 'price_precision');
        if (pricePrecision !== undefined) {
            return pricePrecision;
        }
        return this.parsePrecision (this.safeString (market, 'price_round'));
    }

    /**
     * @ignore
     * @method
     * @name indodax#pairIncrement
     * @description price step from GET /api/price_increments for one raw pair
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#price-increments
     * @param {object} market raw pair from GET /api/pairs
     * @param {object} increments map from GET /api/price_increments
     * @returns {string|undefined} tick size
     */
    pairIncrement (market: Dict, increments: Dict): Str {
        const tickerId = this.safeString (market, 'ticker_id');
        let priceStep = this.safeString (increments, tickerId);
        if (priceStep === undefined) {
            priceStep = this.safeString (increments, this.safeString (market, 'id'));
        }
        return priceStep;
    }

    /**
     * @ignore
     * @method
     * @name indodax#parsePublicTradingFee
     * @description parse the public pair fee, which is not an account fee tier
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#pairs
     * @param {object} market raw pair from GET /api/pairs
     * @returns {object} a trading fee structure, or undefined when the pair has no fee fields
     */
    parsePublicTradingFee (market: Dict) {
        const takerPercent = this.safeString2 (market, 'trade_fee_percent_taker', 'trade_fee_percent');
        const makerPercent = this.safeString2 (market, 'trade_fee_percent_maker', 'trade_fee_percent');
        if ((takerPercent === undefined) && (makerPercent === undefined)) {
            return undefined;
        }
        const baseId = this.safeString (market, 'traded_currency');
        const quoteId = this.safeString (market, 'base_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return {
            'info': market,
            'symbol': base + '/' + quote,
            'percentage': true,
            'tierBased': false,
            'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
            'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')),
        };
    }

    /**
     * @method
     * @name indodax#fetchMarkets
     * @description retrieves data on all markets for indodax
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#pairs
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#price-increments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const response = await this.publicGetApiPairs (params);
        const incrementsResponse = await this.publicGetApiPriceIncrements (params);
        const increments = this.safeDict (incrementsResponse, 'increments', {});
        //
        //     [
        //         {
        //             "id": "btcidr",
        //             "symbol": "BTCIDR",
        //             "base_currency": "idr",
        //             "traded_currency": "btc",
        //             "traded_currency_unit": "BTC",
        //             "description": "BTC/IDR",
        //             "ticker_id": "btc_idr",
        //             "volume_precision": 0,
        //             "price_precision": 1000,
        //             "price_round": 8,
        //             "pricescale": 1000,
        //             "quantity_increment": "0.00000001",
        //             "trade_min_base_currency": 10000,
        //             "trade_min_traded_currency": 0.00007457,
        //             "has_memo": false,
        //             "memo_name": false,
        //             "has_payment_id": false,
        //             "trade_fee_percent": 0.3,
        //             "trade_fee_percent_maker": 0.1,
        //             "trade_fee_percent_taker": 0.2,
        //             "url_logo": "https://indodax.com/v2/logo/svg/color/btc.svg",
        //             "url_logo_png": "https://indodax.com/v2/logo/png/color/btc.png",
        //             "is_maintenance": 0
        //         }
        //     ]
        //
        const result: List = [];
        const rawMarkets = this.toArray (response);
        for (let i = 0; i < rawMarkets.length; i++) {
            const market = rawMarkets[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'traded_currency');
            const quoteId = this.safeString (market, 'base_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            if ((base === undefined) || (quote === undefined)) {
                continue;
            }
            const isMaintenance = this.safeInteger (market, 'is_maintenance');
            const inMaintenance = (isMaintenance !== undefined) && (isMaintenance !== 0);
            let active = true;
            if (inMaintenance) {
                active = false;
            }
            const fee = this.parsePublicTradingFee (market);
            let taker = undefined;
            let maker = undefined;
            if (fee !== undefined) {
                taker = fee['taker'];
                maker = fee['maker'];
            }
            const amountStep = this.safeString (market, 'quantity_increment', '0.00000001');
            const priceStep = this.pairIncrement (market, increments);
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
                'active': active,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': taker,
                'maker': maker,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'percentage': true,
                'tierBased': false,
                'precision': {
                    'amount': this.parseNumber (amountStep),
                    'price': this.parseNumber (this.pairPriceStep (market, priceStep)),
                    'cost': this.parseNumber (this.parsePrecision (this.safeString (market, 'volume_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'trade_min_traded_currency'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'trade_min_base_currency'),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }

    /**
     * @method
     * @name indodax#fetchTradingFees
     * @description fetch the public trading fees for multiple markets
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=trading-fee-structure} indexed by market symbols
     */
    override async fetchTradingFees (params: Dict = {}): Promise<TradingFees> {
        const response = await this.publicGetApiPairs (params);
        const rawMarkets = this.toArray (response);
        const result: Dict = {};
        for (let i = 0; i < rawMarkets.length; i++) {
            const fee = this.parsePublicTradingFee (rawMarkets[i]);
            if (fee !== undefined) {
                const symbol = this.safeString (fee, 'symbol');
                if (symbol !== undefined) {
                    result[symbol] = fee;
                }
            }
        }
        return result;
    }

    /**
     * @method
     * @name indodax#fetchTradingLimits
     * @description fetch the public trading limits and price steps for markets
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#pairs
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#price-increments
     * @param {string[]|undefined} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [trading limits structures]{@link https://docs.ccxt.com/?id=trading-limits-structure} indexed by market symbol
     */
    override async fetchTradingLimits (symbols: Strings = undefined, params: Dict = {}): Promise<Dict> {
        const response = await this.publicGetApiPairs (params);
        const incrementsResponse = await this.publicGetApiPriceIncrements (params);
        const increments = this.safeDict (incrementsResponse, 'increments', {});
        const rawMarkets = this.toArray (response);
        const result: Dict = {};
        for (let i = 0; i < rawMarkets.length; i++) {
            const market = rawMarkets[i];
            const baseId = this.safeString (market, 'traded_currency');
            const quoteId = this.safeString (market, 'base_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            if (symbols !== undefined) {
                if (!this.inArray (symbol, symbols)) {
                    continue;
                }
            }
            const priceStep = this.pairIncrement (market, increments);
            const amountStep = this.safeString (market, 'quantity_increment');
            result[symbol] = {
                'info': market,
                'precision': {
                    'amount': this.parseNumber (amountStep),
                    'price': this.parseNumber (this.pairPriceStep (market, priceStep)),
                },
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'trade_min_traded_currency'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'trade_min_base_currency'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    /**
     * @method
     * @name indodax#editOrder
     * @description edit a trade order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params: Dict = {}): Promise<Order> {
        throw new NotSupported (this.id + ' editOrder() is not supported yet');
    }

    override parseBalance (response: any): Balances {
        const balances = this.safeDict (response, 'return', {});
        const free = this.safeDict (balances, 'balance', {});
        const used = this.safeDict (balances, 'balance_hold', {});
        const timestamp = this.safeTimestamp (balances, 'server_time');
        const result: Dict = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (free, currencyId);
            account['used'] = this.safeString (used, currencyId);
            if (code !== undefined) {
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name indodax#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#get-info-endpoint
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#get-account-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.omitZeroBalances] true to omit zero balances, only used when options.tapiVersion is "2"
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        if (this.isTapiV2 ()) {
            return await this.balanceV2 (params);
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const response = await this.privatePostGetInfo (params);
        //
        //     {
        //         "success":1,
        //         "return":{
        //             "server_time":1619562628,
        //             "balance":{
        //                 "idr":167,
        //                 "btc":"0.00000000",
        //                 "1inch":"0.00000000",
        //             },
        //             "balance_hold":{
        //                 "idr":0,
        //                 "btc":"0.00000000",
        //                 "1inch":"0.00000000",
        //             },
        //             "address":{
        //                 "btc":"1KMntgzvU7iTSgMBWc11nVuJjAyfW3qJyk",
        //                 "1inch":"0x1106c8bb3172625e1f411c221be49161dac19355",
        //                 "xrp":"rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //                 "zrx":"0x1106c8bb3172625e1f411c221be49161dac19355"
        //             },
        //             "user_id":"276011",
        //             "name":"",
        //             "email":"testbitcoincoid@mailforspam.com",
        //             "profile_picture":null,
        //             "verification_status":"unverified",
        //             "gauth_enable":true
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name indodax#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market: Market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        const orderbook = await this.publicGetApiDepthPair (this.extend (request, params));
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'buy', 'sell');
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "high":"0.01951",
        //         "low":"0.01877",
        //         "vol_eth":"39.38839319",
        //         "vol_btc":"0.75320886",
        //         "last":"0.01896",
        //         "buy":"0.01896",
        //         "sell":"0.019",
        //         "server_time":1565248908
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'server_time');
        const baseVolume = 'vol_' + this.safeStringLower (market, 'baseId');
        const quoteVolume = 'vol_' + this.safeStringLower (market, 'quoteId');
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, baseVolume),
            'quoteVolume': this.safeString (ticker, quoteVolume),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name indodax#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker
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
            'pair': market['id'],
        };
        const response = await this.publicGetApiTickerPair (this.extend (request, params));
        //
        //     {
        //         "ticker": {
        //             "high":"0.01951",
        //             "low":"0.01877",
        //             "vol_eth":"39.38839319",
        //             "vol_btc":"0.75320886",
        //             "last":"0.01896",
        //             "buy":"0.01896",
        //             "sell":"0.019",
        //             "server_time":1565248908
        //         }
        //     }
        //
        const ticker = this.safeDict (response, 'ticker', {});
        return this.parseTicker (ticker, market);
    }

    /**
     * @method
     * @name indodax#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker-all
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        //
        // {
        //     "tickers": {
        //         "btc_idr": {
        //             "high": "120009000",
        //             "low": "116735000",
        //             "vol_btc": "218.13777777",
        //             "vol_idr": "25800033297",
        //             "last": "117088000",
        //             "buy": "117002000",
        //             "sell": "117078000",
        //             "server_time": 1571207881
        //         }
        //     }
        // }
        //
        const response = await this.publicGetApiTickerAll (params);
        const tickers = this.safeDict (response, 'tickers', {});
        const keys = Object.keys (tickers);
        const parsedTickers: Dict = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const rawTicker = tickers[key];
            const marketId = key.replace ('_', '');
            const market = this.safeMarket (marketId);
            const parsed = this.parseTicker (rawTicker, market);
            parsedTickers[marketId] = parsed;
        }
        return this.filterByArray (parsedTickers, 'symbol', symbols);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        if ('tradeId' in trade) {
            // copy so Java and Go accept this return; parseV2Trade already built the trade
            return this.extend (this.parseV2Trade (trade, market), {});
        }
        const timestamp = this.safeTimestamp (trade, 'date');
        return this.safeTrade ({
            'id': this.safeString (trade, 'tid'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': undefined,
            'side': this.safeString (trade, 'type'),
            'order': undefined,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name indodax#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        const response = await this.publicGetApiTradesPair (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        //     {
        //         "Time": 1708416900,
        //         "Open": 51707.52,
        //         "High": 51707.52,
        //         "Low": 51707.52,
        //         "Close": 51707.52,
        //         "Volume": "0"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'Time'),
            this.safeNumber (ohlcv, 'Open'),
            this.safeNumber (ohlcv, 'High'),
            this.safeNumber (ohlcv, 'Low'),
            this.safeNumber (ohlcv, 'Close'),
            this.safeNumber (ohlcv, 'Volume'),
        ];
    }

    /**
     * @method
     * @name indodax#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const selectedTimeframe = this.safeString (this.timeframes, timeframe, timeframe);
        const now = this.seconds ();
        const until = this.safeInteger (params, 'until', now);
        const paramsOmitted: Dict = this.omit (params, [ 'until' ]);
        const request: Dict = {
            'to': until,
            'tf': selectedTimeframe,
            'symbol': market['id'],
        };
        const limitResolved = (limit === undefined) ? 1000 : limit;
        if (since !== undefined) {
            request['from'] = Math.floor (since / 1000);
        } else {
            const duration = this.parseTimeframe (timeframe);
            request['from'] = now - limitResolved * duration - 1;
        }
        const response = await this.publicGetTradingviewHistoryV2 (this.extend (request, paramsOmitted));
        //
        //     [
        //         {
        //             "Time": 1708416900,
        //             "Open": 51707.52,
        //             "High": 51707.52,
        //             "Low": 51707.52,
        //             "Close": 51707.52,
        //             "Volume": "0"
        //         }
        //     ]
        //
        return this.parseOHLCVs (this.toArray (response), market, timeframe, since, limitResolved);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'open': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
            'CANCELED': 'canceled',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status as string, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        if (('origQty' in order) || ('oriQty' in order) || ('fullOrderId' in order) || ('executedQty' in order)) {
            // copy so Java and Go accept this return; parseV2Order already built the order
            return this.extend (this.parseV2Order (order, market), {});
        }
        //
        //     {
        //         "order_id": "12345",
        //         "submit_time": "1392228122",
        //         "price": "8000000",
        //         "type": "sell",
        //         "order_ltc": "100000000",
        //         "remain_ltc": "100000000"
        //     }
        //
        // market closed orders - note that the price is very high
        // and does not reflect actual price the order executed at
        //
        //     {
        //       "order_id": "49326856",
        //       "type": "sell",
        //       "price": "1000000000",
        //       "submit_time": "1618314671",
        //       "finish_time": "1618314671",
        //       "status": "filled",
        //       "order_xrp": "30.45000000",
        //       "remain_xrp": "0.00000000"
        //     }
        //
        // cancelOrder
        //
        //    {
        //        "order_id": 666883,
        //        "client_order_id": "clientx-sj82ks82j",
        //        "type": "sell",
        //        "pair": "btc_idr",
        //        "balance": {
        //            "idr": "33605800",
        //            "btc": "0.00000000",
        //            ...
        //            "frozen_idr": "0",
        //            "frozen_btc": "0.00000000",
        //            ...
        //        }
        //    }
        //
        let side: Str = undefined;
        if ('type' in order) {
            side = this.safeString (order, 'type');
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status', 'open'));
        let symbol: Str = undefined;
        let cost: Str = undefined;
        const price = this.safeString (order, 'price');
        let amount: Str = undefined;
        let remaining: Str = undefined;
        let filled: Str = undefined;
        const marketId = this.safeString (order, 'pair');
        const marketResolved: Market = this.safeMarket (marketId, market);
        if (marketResolved !== undefined) {
            symbol = marketResolved['symbol'];
            let quoteId = this.safeString (marketResolved, 'quoteId');
            let baseId = this.safeString (marketResolved, 'baseId');
            if ((quoteId === undefined) || (baseId === undefined)) {
                const resolved = this.marketFromV1Pair (marketId);
                const resolvedQuoteId = this.safeString (resolved, 'quoteId');
                const resolvedBaseId = this.safeString (resolved, 'baseId');
                if (resolvedQuoteId !== undefined) {
                    quoteId = resolvedQuoteId;
                    symbol = this.safeString (resolved, 'symbol', symbol);
                }
                if (resolvedBaseId !== undefined) {
                    baseId = resolvedBaseId;
                }
            }
            if ((quoteId === 'idr') && ('order_rp' in order)) {
                quoteId = 'rp';
            }
            if ((baseId === 'idr') && ('remain_rp' in order)) {
                baseId = 'rp';
            }
            if (quoteId !== undefined) {
                const costKey = 'order_' + quoteId;
                cost = this.safeString (order, costKey);
            }
            if (baseId !== undefined) {
                const amountKey = 'order_' + baseId;
                const remainKey = 'remain_' + baseId;
                const filledKey = 'receive_' + baseId;
                amount = this.safeString (order, amountKey);
                remaining = this.safeString (order, remainKey);
                // filled buy orders on idr-quoted markets carry the executed base amount
                // only in a dynamic receive_{base} field, https://github.com/ccxt/ccxt/issues/26413
                filled = this.safeString (order, filledKey);
            }
        }
        const timestamp = this.safeInteger (order, 'submit_time');
        const fee = undefined;
        const id = this.safeString (order, 'order_id');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    /**
     * @method
     * @name indodax#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#get-order-endpoints
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#get-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, only used when options.tapiVersion is "2"
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (this.isTapiV2 ()) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            const orderRequest = this.v2OrderRequest (id, symbol, params);
            const v2Market = orderRequest[0];
            const v2Request = orderRequest[1];
            const paramsRest = orderRequest[2];
            const v2Response = await this.v2GetOrder (this.extend (v2Request, paramsRest));
            return this.parseOrder (v2Response, v2Market);
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'pair': this.v1PairId (market),
            'order_id': id,
        };
        const response = await this.privatePostGetOrder (this.extend (request, params));
        const orders = this.safeDict (response, 'return', {});
        const order = this.parseOrder (this.extend ({ 'id': id }, orders['order']), market);
        order['info'] = response;
        return order;
    }

    /**
     * @method
     * @name indodax#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#open-orders-endpoints
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#pending-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.isTapiV2 ()) {
            return await this.openOrdersV2 (symbol, since, limit, params);
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = this.v1PairId (market);
        }
        const response = await this.privatePostOpenOrders (this.extend (request, params));
        const openOrdersResult = this.safeDict (response, 'return', {});
        const rawOrders = openOrdersResult['orders'];
        // { success: 1, return: { orders: null }} if no orders
        if ((rawOrders === undefined) || (rawOrders === null)) {
            return [];
        }
        // { success: 1, return: { orders: [ ... objects ] }} for orders fetched by symbol
        if (symbol !== undefined) {
            return this.parseOrders (rawOrders, market, since, limit);
        }
        // { success: 1, return: { orders: { marketid: [ ... objects ] }}} if all orders are fetched
        const marketIds = Object.keys (rawOrders);
        let exchangeOrders: List = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketOrders = rawOrders[marketId];
            market = this.marketFromV1Pair (marketId);
            const parsedOrders = this.parseOrders (marketOrders, market, since, limit);
            exchangeOrders = this.arrayConcat (exchangeOrders, parsedOrders);
        }
        return exchangeOrders as Order[];
    }

    /**
     * @method
     * @name indodax#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#order-history
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.isTapiV2 ()) {
            const closedOrders = await this.fetchOrders (symbol, since, limit, params);
            return this.filterBy (closedOrders, 'status', 'closed') as Order[];
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'pair': this.v1PairId (market),
        };
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        const historyResult = this.safeDict (response, 'return', {});
        let orders = this.parseOrders (historyResult['orders'], market);
        orders = this.filterBy (orders, 'status', 'closed') as Order[];
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name indodax#createOrder
     * @description create a trade order
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#trade-endpoints
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] quote amount to spend on a market buy, only used when options.tapiVersion is "2"
     * @param {string} [params.clientOrderId] client order id, only used when options.tapiVersion is "2"
     * @param {string} [params.timeInForce] GTC or MOC, only used when options.tapiVersion is "2"
     * @param {string} [params.selfTradePreventionMode] EXPIRE_TAKER, EXPIRE_MAKER, or EXPIRE_BOTH, only used when options.tapiVersion is "2"
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        if (this.isTapiV2 ()) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            const v2Market = this.market (symbol);
            if (side === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a side argument');
            }
            const clientOrderId = this.safeString (params, 'clientOrderId');
            const timeInForce = this.safeString (params, 'timeInForce');
            const selfTradePreventionMode = this.safeString (params, 'selfTradePreventionMode');
            const cost = this.safeString (params, 'cost');
            const paramsOmitted = this.omit (params, [ 'clientOrderId', 'timeInForce', 'selfTradePreventionMode', 'cost' ]);
            const v2Request: Dict = {
                'symbol': this.tapiV2Symbol (v2Market),
                'side': side.toUpperCase (),
                'type': type.toUpperCase (),
            };
            if (type === 'market') {
                if (side === 'buy') {
                    let quoteAmount: Str = undefined;
                    if (cost !== undefined) {
                        quoteAmount = this.costToPrecision (symbol, cost);
                    } else {
                        if (price === undefined) {
                            throw new InvalidOrder (this.id + ' createOrder() requires the price argument or params.cost for market buy orders');
                        }
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        quoteAmount = this.costToPrecision (symbol, Precise.stringMul (amountString, priceString));
                    }
                    v2Request['quoteOrderQty'] = quoteAmount;
                } else {
                    v2Request['quantity'] = this.amountToPrecision (symbol, amount);
                }
            } else if (type === 'limit') {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires a price argument for a limit order');
                }
                v2Request['price'] = this.priceToPrecision (symbol, price);
                v2Request['quantity'] = this.amountToPrecision (symbol, amount);
                if (timeInForce !== undefined) {
                    v2Request['timeInForce'] = timeInForce;
                }
            } else {
                throw new InvalidOrder (this.id + ' createOrder() does not support order type ' + type);
            }
            if (clientOrderId !== undefined) {
                v2Request['newClientOrderId'] = clientOrderId;
            }
            if (selfTradePreventionMode !== undefined) {
                v2Request['selfTradePreventionMode'] = selfTradePreventionMode;
            }
            const v2Response = await this.v2PostOrder (this.extend (v2Request, paramsOmitted));
            return this.parseOrder (v2Response, v2Market);
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'pair': this.v1PairId (market),
            'type': side,
            'price': price,
        };
        let priceIsRequired = false;
        let quantityIsRequired = false;
        if (type === 'market') {
            if (side === 'buy') {
                let quoteAmount: Str = undefined;
                const cost = this.safeNumber (params, 'cost');
                if (cost !== undefined) {
                    quoteAmount = this.costToPrecision (symbol, cost);
                } else {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price).');
                    }
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    const costRequest = Precise.stringMul (amountString, priceString);
                    quoteAmount = this.costToPrecision (symbol, costRequest);
                }
                request[market['quoteId'] as string] = quoteAmount;
            } else {
                quantityIsRequired = true;
            }
        } else if (type === 'limit') {
            priceIsRequired = true;
            quantityIsRequired = true;
            if (side === 'buy') {
                request[market['quoteId'] as string] = this.parseToNumeric (this.costToPrecision (symbol, Precise.stringMul (this.numberToString (amount), this.numberToString (price))));
            }
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = price;
        }
        if (quantityIsRequired) {
            request[market['baseId'] as string] = this.amountToPrecision (symbol, amount);
        }
        const tradeParams = (type === 'market' && side === 'buy') ? this.omit (params, 'cost') : params;
        const result = await this.privatePostTrade (this.extend (request, tradeParams));
        const data = this.safeDict (result, 'return', {});
        const id = this.safeString (data, 'order_id');
        return this.safeOrder ({
            'info': result,
            'id': id,
        }, market);
    }

    /**
     * @method
     * @name indodax#cancelOrder
     * @description cancels an open order
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#cancel-order-endpoints
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] order side, required on TAPI v1 and not used when options.tapiVersion is "2"
     * @param {string} [params.clientOrderId] client order id, only used when options.tapiVersion is "2"
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (this.isTapiV2 ()) {
            if (this.markets === undefined) {
                await this.loadMarkets ();
            }
            const orderRequest = this.v2OrderRequest (id, symbol, params);
            const v2Market = orderRequest[0];
            const v2Request = orderRequest[1];
            const paramsRest = orderRequest[2];
            const v2Response = await this.v2DeleteOrder (this.extend (v2Request, paramsRest));
            return this.parseOrder (v2Response, v2Market);
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an extra "side" param');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'order_id': id,
            'pair': this.v1PairId (market),
            'type': side,
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        //
        //    {
        //        "success": 1,
        //        "return": {
        //            "order_id": 666883,
        //            "client_order_id": "clientx-sj82ks82j",
        //            "type": "sell",
        //            "pair": "btc_idr",
        //            "balance": {
        //                "idr": "33605800",
        //                "btc": "0.00000000",
        //                ...
        //                "frozen_idr": "0",
        //                "frozen_btc": "0.00000000",
        //                ...
        //            }
        //        }
        //    }
        //
        const data = this.safeDict (response, 'return');
        return this.parseOrder (data as Dict);
    }

    /**
     * @method
     * @name indodax#fetchTransactionFee
     * @description fetch the fee for a transaction
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-fee-endpoints
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    override async fetchTransactionFee (code: string, params: Dict = {}) {
        if (this.isTapiV2 ()) {
            throw new NotSupported (this.id + ' fetchTransactionFee() is not available when options.tapiVersion is "2"');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        const response = await this.privatePostWithdrawFee (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": {
        //             "server_time": 1607923272,
        //             "withdraw_fee": 0.005,
        //             "currency": "eth"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'return', {});
        const currencyId = this.safeString (data, 'currency');
        return {
            'info': response,
            'rate': this.safeNumber (data, 'withdraw_fee'),
            'currency': this.safeCurrencyCode (currencyId, currency),
        };
    }

    /**
     * @method
     * @name indodax#fetchDepositWithdrawFee
     * @description fetch the withdrawal fee for a currency; indodax charges no crypto deposit fees, see https://github.com/ccxt/ccxt/issues/25800
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-fee-endpoints
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    override async fetchDepositWithdrawFee (code: string, params: Dict = {}): Promise<DepositWithdrawFee> {
        if (this.isTapiV2 ()) {
            throw new NotSupported (this.id + ' fetchDepositWithdrawFee() is not available when options.tapiVersion is "2"');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        const response = await this.privatePostWithdrawFee (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": {
        //             "server_time": 1607923272,
        //             "withdraw_fee": 0.005,
        //             "currency": "eth"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'return', {});
        const result = this.depositWithdrawFee (response);
        result['withdraw']['fee'] = this.safeNumber (data, 'withdraw_fee');
        result['withdraw']['percentage'] = false;
        result['deposit']['fee'] = 0;
        result['deposit']['percentage'] = false;
        return this.assignDefaultDepositWithdrawFees (result, currency) as DepositWithdrawFee;
    }

    /**
     * @method
     * @name indodax#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#transaction-history-endpoints
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#get-withdraw-coin-information-history
     * @param {string} [code] unified currency code. On TAPI v2, omitting code returns only BTC crypto history plus IDR fiat history, because the exchange defaults coin to BTC
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        if (this.isTapiV2 ()) {
            const deposits = await this.fetchDeposits (code, since, limit, params);
            const withdrawals = await this.fetchWithdrawals (code, since, limit, params);
            const merged = this.arrayConcat (deposits, withdrawals);
            return this.filterBySinceLimit (merged, since, limit, 'timestamp');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        if (since !== undefined) {
            const startTime = this.yyyymmdd (since);
            request['start'] = startTime;
            request['end'] = this.yyyymmdd (this.milliseconds ());
        }
        const response = await this.privatePostTransHistory (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": {
        //             "withdraw": {
        //                 "idr": [
        //                     {
        //                         "status": "success",
        //                         "type": "coupon",
        //                         "rp": "115205",
        //                         "fee": "500",
        //                         "amount": "114705",
        //                         "submit_time": "1539844166",
        //                         "success_time": "1539844189",
        //                         "withdraw_id": "1783717",
        //                         "tx": "BTC-IDR-RDTVVO2P-ETD0EVAW-VTNZGMIR-HTNTUAPI-84ULM9OI",
        //                         "sender": "boris",
        //                         "used_by": "viginia88"
        //                     },
        //                     ...
        //                 ],
        //                 "btc": [],
        //                 "abyss": [],
        //                 ...
        //             },
        //             "deposit": {
        //                 "idr": [
        //                     {
        //                         "status": "success",
        //                         "type": "duitku",
        //                         "rp": "393000",
        //                         "fee": "5895",
        //                         "amount": "387105",
        //                         "submit_time": "1576555012",
        //                         "success_time": "1576555012",
        //                         "deposit_id": "3395438",
        //                         "tx": "Duitku OVO Settlement"
        //                     },
        //                     ...
        //                 ],
        //                 "btc": [
        //                     {
        //                         "status": "success",
        //                         "btc": "0.00118769",
        //                         "amount": "0.00118769",
        //                         "success_time": "1539529208",
        //                         "deposit_id": "3602369",
        //                         "tx": "c816aeb35a5b42f389970325a32aff69bb6b2126784dcda8f23b9dd9570d6573"
        //                     },
        //                     ...
        //                 ],
        //                 "abyss": [],
        //                 ...
        //             }
        //         }
        //     }
        //
        const data = this.safeDict (response, 'return', {});
        const withdraw = this.safeDict (data, 'withdraw', {});
        const deposit = this.safeDict (data, 'deposit', {});
        let transactions: List = [];
        let currency: Currency = undefined;
        if (code === undefined) {
            let keys = Object.keys (withdraw);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                transactions = this.arrayConcat (transactions, withdraw[key]);
            }
            keys = Object.keys (deposit);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                transactions = this.arrayConcat (transactions, deposit[key]);
            }
        } else {
            currency = this.currency (code);
            const withdraws = this.safeList (withdraw, currency['id'], []);
            const deposits = this.safeList (deposit, currency['id'], []);
            transactions = this.arrayConcat (withdraws, deposits);
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    /**
     * @method
     * @name indodax#withdraw
     * @description make a withdrawal
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-coin-endpoints
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#withdraw-coin
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#withdraw-idr
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code, used for crypto withdrawals when options.tapiVersion is "2"
     * @param {string} [params.clientOrderId] client request id, only used when options.tapiVersion is "2"
     * @param {string} [params.bankCode] bank code for an IDR withdrawal when options.tapiVersion is "2"
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params: Dict = {}): Promise<Transaction> {
        if (this.isTapiV2 ()) {
            const withdrawal = await this.sendWithdrawV2 (code, amount, address, tag, params);
            return this.extend (withdrawal, {});
        }
        const withdrawTag = this.handleWithdrawTagAndParams (tag, params);
        const tagWithdrawTag = withdrawTag[0];
        const paramsWithdrawTag = withdrawTag[1];
        this.checkAddress (address);
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const currency = this.currency (code);
        // Custom string you need to provide to identify each withdrawal.
        // Will be passed to callback URL (assigned via website to the API key)
        // so your system can identify the request and confirm it.
        // Alphanumeric, max length 255.
        const requestId = this.milliseconds ();
        // Alternatively:
        // let requestId = this.uuid ();
        const request: Dict = {
            'currency': currency['id'],
            'withdraw_amount': amount,
            'withdraw_address': address,
            'request_id': requestId.toString (),
        };
        if ((tagWithdrawTag !== undefined) && (tagWithdrawTag !== '')) {
            request['withdraw_memo'] = tagWithdrawTag;
        }
        const response = await this.privatePostWithdrawCoin (this.extend (request, paramsWithdrawTag));
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        if (('coin' in transaction) || ('fiatCurrency' in transaction) || ('withdrawStatus' in transaction) || ('depositStatus' in transaction) || ('txType' in transaction)) {
            // copy so Go accepts this return; parseV2Transaction already built the transaction
            return this.extend (this.parseV2Transaction (transaction, currency), {});
        }
        //
        // withdraw
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        // transHistory
        //
        //     {
        //         "status": "success",
        //         "type": "coupon",
        //         "rp": "115205",
        //         "fee": "500",
        //         "amount": "114705",
        //         "submit_time": "1539844166",
        //         "success_time": "1539844189",
        //         "withdraw_id": "1783717",
        //         "tx": "BTC-IDR-RDTVVO2P-ETD0EVAW-VTNZGMIR-HTNTUAPI-84ULM9OI",
        //         "sender": "boris",
        //         "used_by": "viginia88"
        //     }
        //
        //     {
        //         "status": "success",
        //         "btc": "0.00118769",
        //         "amount": "0.00118769",
        //         "success_time": "1539529208",
        //         "deposit_id": "3602369",
        //         "tx": "c816aeb35a5b42f389970325a32aff69bb6b2126784dcda8f23b9dd9570d6573"
        //     },
        const status = this.safeString (transaction, 'status');
        const timestamp = this.safeTimestamp2 (transaction, 'success_time', 'submit_time');
        const depositId = this.safeString (transaction, 'deposit_id');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee: Fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': this.safeCurrencyCode (undefined, currency),
                'cost': feeCost,
                'rate': undefined,
            };
        }
        return {
            'id': this.safeString2 (transaction, 'withdraw_id', 'deposit_id'),
            'txid': this.safeString2 (transaction, 'txid', 'tx'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': this.safeString (transaction, 'withdraw_address'),
            'addressTo': undefined,
            'amount': this.safeNumberN (transaction, [ 'amount', 'withdraw_amount', 'deposit_amount' ]),
            'type': (depositId === undefined) ? 'withdraw' : 'deposit',
            'currency': this.safeCurrencyCode (undefined, currency),
            'status': this.parseTransactionStatus (status),
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': this.safeString (transaction, 'withdraw_memo'),
            'internal': undefined,
            'fee': fee,
            'info': transaction,
        } as Transaction;
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'success': 'ok',
            'pending': 'pending',
            'failed': 'failed',
        };
        return this.safeString (statuses, status as string, status);
    }

    /**
     * @ignore
     * @method
     * @name indodax#v1DepositNetwork
     * @description parse a getInfo network value, which may be a string, a comma-separated string, a list, or empty
     * @param {object} networks network map from getInfo
     * @param {string} currencyId currency id key
     * @param {string} code unified currency code
     * @returns {string[]} unified network codes, one per network
     */
    v1DepositNetwork (networks: Dict, currencyId: string, code: Str) {
        const networkList = this.safeList (networks, currencyId);
        const networkIds = [];
        if (networkList !== undefined) {
            for (let i = 0; i < networkList.length; i++) {
                const networkId = this.safeString (networkList, i);
                if (networkId !== undefined) {
                    networkIds.push (networkId);
                }
            }
        } else {
            const networkId = this.safeString (networks, currencyId);
            if (networkId !== undefined) {
                if (networkId.indexOf (',') >= 0) {
                    const parts = networkId.split (',');
                    for (let j = 0; j < parts.length; j++) {
                        networkIds.push (parts[j]);
                    }
                } else {
                    networkIds.push (networkId);
                }
            }
        }
        const parsed = [];
        for (let i = 0; i < networkIds.length; i++) {
            const networkCode = this.networkIdToCode (networkIds[i], code);
            if (networkCode !== undefined) {
                parsed.push (networkCode.toUpperCase ());
            }
        }
        return parsed;
    }

    /**
     * @method
     * @name indodax#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#general-information-on-endpoints
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#list-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code, only used when options.tapiVersion is "2"
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    override async fetchDepositAddress (code: string, params: Dict = {}): Promise<DepositAddress> {
        const addresses = await this.fetchDepositAddresses ([ code ], params);
        const rows = this.toArray (addresses);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowCode = this.safeString (row, 'currency');
            if (rowCode === code) {
                return row as DepositAddress;
            }
        }
        throw new InvalidAddress (this.id + ' fetchDepositAddress() could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website');
    }

    /**
     * @method
     * @name indodax#fetchDepositAddresses
     * @description fetch deposit addresses for multiple currencies and chain types
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#general-information-on-endpoints
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#list-deposit-address
     * @param {string[]} [codes] list of unified currency codes, required when options.tapiVersion is "2"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code, only used when options.tapiVersion is "2"
     * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
     */
    override async fetchDepositAddresses (codes: Strings = undefined, params: Dict = {}): Promise<DepositAddress[]> {
        if (this.isTapiV2 ()) {
            return await this.depositAddressesV2 (codes, params);
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const response = await this.privatePostGetInfo (params);
        //
        //    {
        //        success: '1',
        //        return: {
        //            server_time: '1708031570',
        //            balance: {
        //                idr: '29952',
        //                ...
        //            },
        //            balance_hold: {
        //                idr: '0',
        //                ...
        //            },
        //            address: {
        //                btc: '1KMntgzvU7iTSgMBWc11nVuJjAyfW3qJyk',
        //                ...
        //            },
        //            memo_is_required: {
        //                btc: { mainnet: false },
        //                ...
        //            },
        //            network: {
        //                btc: 'mainnet',
        //                ...
        //            },
        //            user_id: '276011',
        //            name: '',
        //            email: 'testbitcoincoid@mailforspam.com',
        //            profile_picture: null,
        //            verification_status: 'unverified',
        //            gauth_enable: true,
        //            withdraw_status: '0'
        //        }
        //    }
        //
        const data = this.safeDict (response, 'return');
        const addresses = this.safeDict (data, 'address', {});
        const networks = this.safeDict (data, 'network', {});
        const addressKeys = Object.keys (addresses);
        const result = [];
        for (let i = 0; i < addressKeys.length; i++) {
            const marketId = addressKeys[i];
            const code = this.safeCurrencyCode (marketId);
            const address = this.safeString (addresses, marketId);
            if ((address !== undefined) && ((codes === undefined) || (this.inArray (code, codes)))) {
                this.checkAddress (address);
                const networkCodes = this.v1DepositNetwork (networks, marketId, code);
                const networkCount = networkCodes.length;
                if (code !== undefined) {
                    if (networkCount < 1) {
                        result.push ({
                            'info': {},
                            'currency': code,
                            'network': undefined,
                            'address': address,
                            'tag': undefined,
                        });
                    } else {
                        for (let n = 0; n < networkCount; n++) {
                            const networkCode = networkCodes[n];
                            result.push ({
                                'info': {},
                                'currency': code,
                                'network': networkCode,
                                'address': address,
                                'tag': undefined,
                            });
                        }
                    }
                }
            }
        }
        return result as DepositAddress[];
    }

    /**
     * @ignore
     * @method
     * @name indodax#balanceV2
     * @description query account balances on TAPI v2
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#get-account-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a balance structure
     */
    async balanceV2 (params: Dict = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        const omitZeroBalances = this.safeBool (params, 'omitZeroBalances');
        const paramsOmitted = this.omit (params, [ 'omitZeroBalances' ]);
        if (omitZeroBalances !== undefined) {
            request['omitZeroBalances'] = omitZeroBalances;
        }
        const response = await this.v2GetAccount (this.extend (request, paramsOmitted));
        return this.parseBalanceV2 (response);
    }

    /**
     * @ignore
     * @method
     * @name indodax#parseBalanceV2
     * @param {object} response account response
     * @returns {object} a balance structure
     */
    parseBalanceV2 (response: Dict): Balances {
        const balances = this.safeList (response, 'balances', []);
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (entry, 'free');
            account['used'] = this.safeString (entry, 'locked');
            if (code !== undefined) {
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @ignore
     * @method
     * @name indodax#parseV2Order
     * @param {object} order raw order
     * @param {object} [market] market structure
     * @returns {object} an order structure
     */
    parseV2Order (order: Dict, market: Market = undefined): Order {
        const marketId = this.safeStringLower (order, 'symbol');
        const marketResolved = this.safeMarket (marketId, market);
        const rawStatus = this.safeString (order, 'status');
        let status: Str = undefined;
        if (rawStatus !== undefined) {
            status = this.parseOrderStatus (rawStatus);
        }
        const timestamp = this.safeInteger2 (order, 'time', 'submitTime');
        const amount = this.safeString2 (order, 'origQty', 'oriQty');
        const filled = this.safeString (order, 'executedQty');
        let remaining: Str = undefined;
        if ((amount !== undefined) && (filled !== undefined)) {
            remaining = Precise.stringSub (amount, filled);
        }
        return {
            'info': order,
            'id': this.safeString2 (order, 'fullOrderId', 'orderId'),
            'clientOrderId': this.safeString2 (order, 'clientOrderId', 'origClientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'finishTime'),
            'symbol': this.safeSymbol (marketId, marketResolved),
            'type': this.safeStringLower (order, 'type'),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            'price': this.parseNumber (this.safeString (order, 'price')),
            'triggerPrice': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': this.parseNumber (amount),
            'filled': this.parseNumber (filled),
            'remaining': this.parseNumber (remaining),
            'status': status,
            'fee': undefined,
            'trades': [],
            'fees': [],
            'lastUpdateTimestamp': undefined,
            'reduceOnly': undefined,
            'stopPrice': undefined,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
        } as Order;
    }

    /**
     * @ignore
     * @method
     * @name indodax#parseV2Trade
     * @param {object} trade raw trade
     * @param {object} [market] market structure
     * @returns {object} a trade structure
     */
    parseV2Trade (trade: Dict, market: Market = undefined): Trade {
        const marketId = this.safeStringLower (trade, 'symbol');
        const marketResolved = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'time');
        const isBuyer = this.safeBool (trade, 'isBuyer');
        let side: Str = undefined;
        if (isBuyer === true) {
            side = 'buy';
        } else if (isBuyer === false) {
            side = 'sell';
        }
        const isMaker = this.safeBool (trade, 'isMaker');
        let takerOrMaker: Str = undefined;
        if (isMaker === true) {
            takerOrMaker = 'maker';
        } else if (isMaker === false) {
            takerOrMaker = 'taker';
        }
        const feeCost = this.safeString (trade, 'commission');
        let fee: Fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': this.safeCurrencyCode (this.safeString (trade, 'commissionAsset')),
                'cost': this.parseNumber (feeCost),
                'rate': undefined,
            };
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (marketId, marketResolved),
            'type': undefined,
            'side': side,
            'order': this.safeString (trade, 'orderId'),
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'qty'),
            'cost': this.safeString (trade, 'quoteQty'),
            'fee': fee,
        }, market);
    }

    /**
     * @ignore
     * @method
     * @name indodax#v2OrderRequest
     * @param {string} id order id
     * @param {string} symbol unified symbol
     * @param {object} params extra parameters
     * @returns {object[]} request and remaining params
     */
    v2OrderRequest (id: string, symbol: Str, params: Dict): any[] {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' order endpoints require a symbol argument');
        }
        const market = this.market (symbol);
        const clientOrderId = this.safeString (params, 'clientOrderId');
        const paramsOmitted = this.omit (params, [ 'clientOrderId' ]);
        const request: Dict = {
            'symbol': this.tapiV2Symbol (market),
        };
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = this.v2OrderId (id);
        }
        return [ market, request, paramsOmitted ];
    }

    /**
     * @ignore
     * @method
     * @name indodax#v2OrderId
     * @description numeric id for GET and DELETE /api/v2/order. fullOrderId stays the unified id
     * @param {string} orderId unified id, a number or a fullOrderId such as btcidr-limit-6423
     * @returns {string} numeric order id
     */
    v2OrderId (orderId: string): string {
        const parts = orderId.split ('-');
        const numParts = parts.length;
        const tail = parts[numParts - 1];
        const digits = '0123456789';
        if (tail.length < 1) {
            return orderId;
        }
        let index = 0;
        while (index < tail.length) {
            const character = tail[index];
            if (digits.indexOf (character) < 0) {
                return orderId;
            }
            index = this.sum (index, 1);
        }
        return tail;
    }

    /**
     * @ignore
     * @method
     * @name indodax#openOrdersV2
     * @param {string} [symbol] unified symbol
     * @param {int} [since] earliest timestamp
     * @param {int} [limit] max number of orders
     * @param {object} [params] extra parameters
     * @returns {object[]} a list of order structures
     */
    async openOrdersV2 (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = this.tapiV2Symbol (market);
        }
        const response = await this.v2GetOpenOrders (this.extend (request, params));
        const rows = this.toArray (response);
        return this.parseOrders (rows, market, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name indodax#clampV2Limit
     * @param {int} [limit] requested limit
     * @returns {int} limit clamped to 10-1000
     */
    clampV2Limit (limit: Int = undefined): Int {
        if (limit === undefined) {
            return undefined;
        }
        if (limit < 10) {
            return 10;
        }
        if (limit > 1000) {
            return 1000;
        }
        return limit;
    }

    /**
     * @ignore
     * @method
     * @name indodax#historyV2
     * @param {string} historyKind orders or trades
     * @param {string} symbol unified symbol
     * @param {int} [since] earliest timestamp
     * @param {int} [until] latest timestamp
     * @param {int} [limit] max rows per request
     * @param {object} [params] extra parameters
     * @returns {object[]} raw rows
     */
    async historyV2 (historyKind: string, symbol: string, since: Int = undefined, until: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<any[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const paginate = this.safeBool (params, 'paginate', false);
        const paramsOmitted = this.omit (params, [ 'symbol', 'startTime', 'endTime', 'limit', 'paginate' ]);
        const maxSpan = 7 * 24 * 60 * 60 * 1000;
        const windows = this.windowV2 (since, until, maxSpan);
        let numWindows = windows.length;
        if ((numWindows > 1) && (paginate !== true)) {
            numWindows = 1;
        }
        const requestLimit = this.clampV2Limit (limit);
        const result: List = [];
        for (let i = 0; i < numWindows; i++) {
            const window = windows[i];
            const request: Dict = {
                'symbol': this.tapiV2Symbol (market),
            };
            if (window[0] !== undefined) {
                request['startTime'] = window[0];
            }
            if (window[1] !== undefined) {
                request['endTime'] = window[1];
            }
            if (requestLimit !== undefined) {
                request['limit'] = requestLimit;
            }
            let response = undefined;
            if (historyKind === 'orders') {
                response = await this.v2GetOrderHistories (this.extend (request, paramsOmitted));
            } else {
                response = await this.v2GetMyTrades (this.extend (request, paramsOmitted));
            }
            const rows = this.safeList (response, 'data', []);
            for (let j = 0; j < rows.length; j++) {
                result.push (rows[j]);
            }
        }
        return result;
    }

    /**
     * @method
     * @name indodax#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.paginate] true to request every 7-day window. When omitted, only the first window from since is requested. v1 orderHistory was decommissioned on 2026-04-07, so this method requires options.tapiVersion "2"
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (!this.isTapiV2 ()) {
            throw new NotSupported (this.id + ' fetchOrders() requires options.tapiVersion set to "2"');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        const until = this.safeInteger (params, 'until');
        const paramsOmitted = this.omit (params, [ 'until' ]);
        const rows = await this.historyV2 ('orders', symbol, since, until, limit, paramsOmitted);
        const market = this.market (symbol);
        return this.parseOrders (rows, market, since, limit);
    }

    /**
     * @method
     * @name indodax#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#trade-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] true to request every 7-day window. When omitted, only the first window from since is requested. v1 tradeHistory was decommissioned on 2026-04-07, so this method requires options.tapiVersion "2"
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (!this.isTapiV2 ()) {
            throw new NotSupported (this.id + ' fetchMyTrades() requires options.tapiVersion set to "2"');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        const until = this.safeInteger (params, 'until');
        const paramsOmitted = this.omit (params, [ 'until' ]);
        const rows = await this.historyV2 ('trades', symbol, since, until, limit, paramsOmitted);
        const market = this.market (symbol);
        return this.parseTrades (rows, market, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name indodax#depositAddressesV2
     * @param {string[]} codes unified currency codes, required because each TAPI v2 query needs a coin
     * @param {object} [params] extra parameters
     * @returns {object[]} a list of address structures
     */
    async depositAddressesV2 (codes: Strings = undefined, params: Dict = {}): Promise<DepositAddress[]> {
        if (codes === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddresses() requires symbols like BTC');
        }
        const numCodes = codes.length;
        if (numCodes < 1) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddresses() requires symbols like BTC');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const networkAndParams = this.handleNetworkCodeAndParams (params);
        const networkCode = networkAndParams[0];
        const paramsOmitted = networkAndParams[1];
        const result = [];
        for (let i = 0; i < numCodes; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const coinId = this.safeString (currency, 'id', code);
            if ((coinId === undefined) || (coinId === '')) {
                continue;
            }
            const request: Dict = {
                'coin': coinId,
            };
            if (networkCode !== undefined) {
                request['network'] = this.networkCodeToId (networkCode, code);
            }
            const response = await this.v2GetCapitalDepositAddressList (this.extend (request, paramsOmitted));
            const rows = this.toArray (response);
            const numRows = rows.length;
            for (let j = 0; j < numRows; j++) {
                const row = rows[j];
                const address = this.safeString (row, 'address');
                if ((address === undefined) || (address === '')) {
                    continue;
                }
                this.checkAddress (address);
                const networkId = this.safeString (row, 'network');
                const currencyCode = this.safeString (currency, 'code');
                if (currencyCode !== undefined) {
                    result.push ({
                        'info': row,
                        'currency': currencyCode,
                        'network': this.networkIdToCode (networkId, currencyCode),
                        'address': address,
                        'tag': this.safeString (row, 'tag'),
                    });
                }
            }
        }
        return result as DepositAddress[];
    }

    /**
     * @ignore
     * @method
     * @name indodax#windowV2
     * @param {int} [since] earliest timestamp
     * @param {int} [until] latest timestamp
     * @param {int} maxSpan maximum window in ms
     * @returns {int[][]} windows of start and end
     */
    windowV2 (since: Int, until: Int, maxSpan: number): any[] {
        let windowStart = since;
        let windowEnd = until;
        if ((windowStart === undefined) && (windowEnd === undefined)) {
            return [ [ undefined, undefined ] ];
        }
        if (windowEnd === undefined) {
            windowEnd = this.milliseconds ();
        }
        if (windowStart === undefined) {
            windowStart = windowEnd - maxSpan;
        }
        const windows: List = [];
        let cursor = windowStart;
        while (cursor < windowEnd) {
            let chunkEnd = this.sum (cursor, maxSpan);
            if (chunkEnd > windowEnd) {
                chunkEnd = windowEnd;
            }
            windows.push ([ cursor, chunkEnd ]);
            if (chunkEnd === cursor) {
                break;
            }
            cursor = chunkEnd;
        }
        return windows;
    }

    /**
     * @ignore
     * @method
     * @name indodax#capitalHistoryV2
     * @param {string} direction deposit or withdraw
     * @param {string} [code] unified currency code
     * @param {int} [since] earliest timestamp
     * @param {int} [until] latest timestamp
     * @param {int} [limit] max rows
     * @param {object} [params] extra parameters
     * @returns {object[]} raw rows
     */
    async capitalHistoryV2 (direction: string, code: Str = undefined, since: Int = undefined, until: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<any[]> {
        const paginate = this.safeBool (params, 'paginate', false);
        const paramsOmitted = this.omit (params, [ 'coin', 'startTime', 'endTime', 'limit', 'paginate' ]);
        const requestLimit = this.clampV2Limit (limit);
        const maxSpan = 90 * 24 * 60 * 60 * 1000;
        const windows = this.windowV2 (since, until, maxSpan);
        let numWindows = windows.length;
        if ((numWindows > 1) && (paginate !== true)) {
            numWindows = 1;
        }
        const result: List = [];
        for (let i = 0; i < numWindows; i++) {
            const window = windows[i];
            const request: Dict = {};
            if (code !== undefined) {
                const currency = this.currency (code);
                request['coin'] = currency['id'];
            }
            if (window[0] !== undefined) {
                request['startTime'] = window[0];
            }
            if (window[1] !== undefined) {
                request['endTime'] = window[1];
            }
            if (requestLimit !== undefined) {
                request['limit'] = requestLimit;
            }
            let response = undefined;
            if (direction === 'deposit') {
                response = await this.v2GetCapitalDepositHisrec (this.extend (request, paramsOmitted));
            } else {
                response = await this.v2GetCapitalWithdrawHistory (this.extend (request, paramsOmitted));
            }
            const rows = this.toArray (response);
            for (let j = 0; j < rows.length; j++) {
                const txType = (direction === 'deposit') ? 'deposit' : 'withdraw';
                const row = this.extend (rows[j], {
                    'txType': txType,
                });
                result.push (row);
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name indodax#fiatHistoryV2
     * @param {string} direction deposit or withdraw
     * @param {string} [code] unified currency code
     * @param {int} [since] earliest timestamp
     * @param {int} [until] latest timestamp
     * @param {int} [limit] max rows
     * @param {object} [params] extra parameters
     * @returns {object[]} raw rows
     */
    async fiatHistoryV2 (direction: string, code: Str = undefined, since: Int = undefined, until: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<any[]> {
        if ((code !== undefined) && (code !== 'IDR')) {
            return [];
        }
        const paginate = this.safeBool (params, 'paginate', false);
        const paramsOmitted = this.omit (params, [ 'transactionType', 'beginTime', 'endTime', 'limit', 'paginate' ]);
        const requestLimit = this.clampV2Limit (limit);
        const maxSpan = 30 * 24 * 60 * 60 * 1000;
        const windows = this.windowV2 (since, until, maxSpan);
        let numWindows = windows.length;
        if ((numWindows > 1) && (paginate !== true)) {
            numWindows = 1;
        }
        const result: List = [];
        for (let i = 0; i < numWindows; i++) {
            const window = windows[i];
            const request: Dict = {};
            if (direction === 'deposit') {
                request['transactionType'] = '0';
            }
            if (window[0] !== undefined) {
                request['beginTime'] = window[0];
            }
            if (window[1] !== undefined) {
                request['endTime'] = window[1];
            }
            if (requestLimit !== undefined) {
                request['limit'] = requestLimit;
            }
            const response = await this.v2GetFiatOrders (this.extend (request, paramsOmitted));
            const rows = this.safeList (response, 'data', []);
            for (let j = 0; j < rows.length; j++) {
                const txType = (direction === 'deposit') ? 'deposit' : 'withdraw';
                const row = this.extend (rows[j], {
                    'txType': txType,
                });
                result.push (row);
            }
        }
        return result;
    }

    /**
     * @method
     * @name indodax#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#get-deposit-coin-information-history
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#get-withdrawdeposit-fiat-information-history
     * @param {string} [code] unified currency code. Omitting code returns only BTC crypto deposits plus IDR fiat deposits, because TAPI v2 defaults coin to BTC. Without params.paginate the crypto window is 90 days and the IDR window is the first 30 days, so paging by the newest row can skip IDR. Not available when options.tapiVersion is "1"
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for
     * @param {boolean} [params.paginate] true to request every exchange window. When omitted, only the first window from since is requested. Crypto windows are 90 days and IDR windows are 30 days
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        if (!this.isTapiV2 ()) {
            throw new NotSupported (this.id + ' fetchDeposits() requires options.tapiVersion set to "2"');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const until = this.safeInteger (params, 'until');
        const paramsOmitted = this.omit (params, [ 'until' ]);
        let rows: List = [];
        if (code !== 'IDR') {
            const cryptoRows = await this.capitalHistoryV2 ('deposit', code, since, until, limit, paramsOmitted);
            rows = this.arrayConcat (rows, cryptoRows);
        }
        if ((code === undefined) || (code === 'IDR')) {
            const fiatRows = await this.fiatHistoryV2 ('deposit', code, since, until, limit, paramsOmitted);
            rows = this.arrayConcat (rows, fiatRows);
        }
        const currency = (code === undefined) ? undefined : this.currency (code);
        return this.parseTransactions (rows, currency, since, limit);
    }

    /**
     * @method
     * @name indodax#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#get-withdraw-coin-information-history
     * @see https://github.com/btcid/indodax-official-api-docs/blob/master/INDODAX-TradeAPI-2.md#get-withdrawdeposit-fiat-information-history
     * @param {string} [code] unified currency code. Omitting code returns only BTC crypto withdrawals plus IDR fiat withdrawals, because TAPI v2 defaults coin to BTC. Not available when options.tapiVersion is "1"
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for
     * @param {boolean} [params.paginate] true to request every exchange window. When omitted, only the first window from since is requested. Crypto windows are 90 days and IDR windows are 30 days
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        if (!this.isTapiV2 ()) {
            throw new NotSupported (this.id + ' fetchWithdrawals() requires options.tapiVersion set to "2"');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const until = this.safeInteger (params, 'until');
        const paramsOmitted = this.omit (params, [ 'until' ]);
        let rows: List = [];
        if (code !== 'IDR') {
            const cryptoRows = await this.capitalHistoryV2 ('withdraw', code, since, until, limit, paramsOmitted);
            rows = this.arrayConcat (rows, cryptoRows);
        }
        if ((code === undefined) || (code === 'IDR')) {
            const fiatRows = await this.fiatHistoryV2 ('withdraw', code, since, until, limit, paramsOmitted);
            rows = this.arrayConcat (rows, fiatRows);
        }
        const currency = (code === undefined) ? undefined : this.currency (code);
        return this.parseTransactions (rows, currency, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name indodax#parseV2Transaction
     * @param {object} transaction raw transaction
     * @param {object} [currency] currency structure
     * @returns {object} a transaction structure
     */
    parseV2Transaction (transaction: Dict, currency: Currency = undefined): Transaction {
        const txKind = this.safeString (transaction, 'txType');
        const coin = this.safeString (transaction, 'coin');
        const fiatCurrency = this.safeString (transaction, 'fiatCurrency');
        const currencyId = (coin !== undefined) ? coin : fiatCurrency;
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.safeStringN (transaction, [ 'withdrawStatus', 'depositStatus', 'status' ]);
        let timestamp = this.safeInteger2 (transaction, 'createTime', 'updateTime');
        if (timestamp === undefined) {
            timestamp = this.safeIntegerN (transaction, [ 'applyTime', 'insertTime', 'completeTime' ]);
        }
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeStringN (transaction, [ 'applyTime', 'insertTime', 'completeTime' ]));
        }
        let updated = this.safeInteger2 (transaction, 'updateTime', 'completeTime');
        if (updated === undefined) {
            updated = this.parse8601 (this.safeString (transaction, 'completeTime'));
        }
        const info = this.omit (transaction, [ 'txType' ]);
        const feeCost = this.safeNumber2 (transaction, 'transactionFee', 'totalFee');
        let fee: Fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': code,
                'cost': feeCost,
                'rate': undefined,
            };
        }
        const networkId = this.safeString (transaction, 'network');
        return {
            'id': this.safeString2 (transaction, 'id', 'orderNo'),
            'txid': this.safeString (transaction, 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId, code),
            'addressFrom': undefined,
            'address': this.safeString (transaction, 'address'),
            'addressTo': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'type': (txKind === undefined) ? undefined : txKind,
            'currency': code,
            'status': this.parseTransactionStatus (status),
            'updated': updated,
            'tagFrom': undefined,
            'tag': this.safeString (transaction, 'addressTag'),
            'tagTo': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
            'info': info,
        } as Transaction;
    }

    /**
     * @ignore
     * @method
     * @name indodax#sendWithdrawV2
     * @param {string} code unified currency code
     * @param {float} amount amount to withdraw
     * @param {string} address destination address or bank account number
     * @param {string} [tag] destination tag or memo, sent as addressTag
     * @param {object} [params] extra parameters
     * @returns {object} a transaction structure
     */
    async sendWithdrawV2 (code: string, amount: number, address: string, tag: Str = undefined, params: Dict = {}): Promise<Transaction> {
        const withdrawTag = this.handleWithdrawTagAndParams (tag, params);
        const tagValue = withdrawTag[0];
        const paramsAfterTag = withdrawTag[1];
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const currency = this.currency (code);
        if (currency['code'] === 'IDR') {
            const bankCode = this.safeString (paramsAfterTag, 'bankCode');
            if ((bankCode === undefined) || (bankCode === '')) {
                throw new ArgumentsRequired (this.id + ' withdraw() requires a params.bankCode for IDR, the 3-digit bank code');
            }
            const clientRequestId = this.safeString (paramsAfterTag, 'clientOrderId', this.milliseconds ().toString ());
            const paramsOmitted = this.omit (paramsAfterTag, [ 'bankCode', 'clientOrderId' ]);
            const accountNumberJson = this.json (address);
            const bankCodeJson = this.json (bankCode);
            // hex braces: a '{...}' literal is rewritten to array() by the PHP transpiler
            const openBrace = this.binaryToString (this.base16ToBinary ('7b'));
            const closeBrace = this.binaryToString (this.base16ToBinary ('7d'));
            const accountInfo = openBrace + '"accountNumber":' + accountNumberJson + ',"bankCodeForPix":' + bankCodeJson + closeBrace;
            const fiatRequest: Dict = {
                'apiPaymentMethod': 'bank_transfer',
                'currency': 'idr',
                'amount': this.parseToInt (amount),
                'accountInfo': accountInfo,
                'clientRequestId': clientRequestId,
            };
            const fiatResponse = await this.v2PostFiatWithdraw (this.extend (fiatRequest, paramsOmitted));
            const data = this.safeDict (fiatResponse, 'data', {});
            const orderId = this.safeString (data, 'orderId');
            return this.parseV2Transaction ({
                'orderNo': orderId,
                'fiatCurrency': 'IDR',
                'amount': this.numberToString (amount),
                'txType': 'withdraw',
                'address': address,
            }, currency);
        }
        this.checkAddress (address);
        const networkAndParams = this.handleNetworkCodeAndParams (paramsAfterTag);
        const networkCode = networkAndParams[0];
        const paramsAfterNetwork = networkAndParams[1];
        const withdrawOrderId = this.safeString (paramsAfterNetwork, 'clientOrderId', this.milliseconds ().toString ());
        const paramsForWithdraw = this.omit (paramsAfterNetwork, [ 'clientOrderId' ]);
        const request: Dict = {
            'coin': currency['id'],
            'address': address,
            'amount': this.numberToString (amount),
            'withdrawOrderId': withdrawOrderId,
        };
        if (networkCode !== undefined) {
            request['network'] = this.networkCodeToId (networkCode, currency['code']);
        }
        if ((tagValue !== undefined) && (tagValue !== '')) {
            request['addressTag'] = tagValue;
        }
        const response = await this.v2PostCapitalWithdrawApply (this.extend (request, paramsForWithdraw));
        const annotated = this.extend (response, {
            'txType': 'withdraw',
        });
        return this.parseV2Transaction (annotated, currency);
    }

    override sign (path: string, api = 'public', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        const apiUrl = this.safeString (this.urls['api'], api);
        if (apiUrl === undefined) {
            throw new ExchangeError (this.id + ' sign() has no API URL for this endpoint');
        }
        let url = apiUrl;
        let requestBody: Str = body;
        let requestHeaders: NullableDict = headers;
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            const requestPath = '/' + this.implodeParams (path, params);
            url = url + requestPath;
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencodeWithArrayRepeat (query);
            }
        } else if (api === 'v2') {
            this.checkRequiredCredentials ();
            url = url + '/api/v2/' + this.implodeParams (path, params);
            const query = this.urlencode (this.extend ({
                'timestamp': this.requestTimestamp (),
                'recvWindow': this.safeInteger (this.options, 'recvWindow', 5000),
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret), sha256);
            requestHeaders = {
                'Accept': 'application/json',
                'X-APIKEY': this.apiKey,
                'Sign': signature,
            };
            if (method === 'POST') {
                requestBody = query;
                requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            } else {
                url += '?' + query;
            }
        } else {
            this.checkRequiredCredentials ();
            requestBody = this.urlencode (this.extend ({
                'method': path,
                'timestamp': this.requestTimestamp (),
                'recvWindow': this.safeInteger (this.options, 'recvWindow', 5000),
            }, params));
            requestHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (requestBody), this.encode (this.secret), sha512),
            };
        }
        return { 'url': url, 'method': method, 'body': requestBody, 'headers': requestHeaders };
    }

    /**
     * @ignore
     * @method
     * @name indodax#request
     * @description send a request and retry once when the exchange rejects the timestamp
     * @param {string} path endpoint path
     * @param {string} [api] api section, public, private, or v2
     * @param {string} [method] http method
     * @param {object} [params] request parameters
     * @param {object} [headers] request headers
     * @param {string} [body] request body
     * @param {object} [config] request config
     * @returns {object} the exchange response
     */
    override async request (path: any, api = 'public', method = 'GET', params: Dict = {}, headers: any = undefined, body: any = undefined, config: any = {}): Promise<any> {
        let response = undefined;
        try {
            response = await this.fetch2 (path, api, method, params, headers, body, config);
        } catch (e) {
            const adjusted = this.safeBool (this.options, 'timestampAdjusted', false);
            if ((api === 'public') || adjusted || !(e instanceof InvalidNonce)) {
                throw e;
            }
            await this.loadTimeDifference ();
            this.options['timestampAdjusted'] = true;
            response = await this.fetch2 (path, api, method, params, headers, body, config);
        }
        return response;
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        // { success: 0, error: "invalid order." }
        // or
        // [{ data, ... }, { ... }, ... ]
        // {"success":"1","status":"approved","withdraw_currency":"strm","withdraw_address":"0x2b9A8cd5535D99b419aEfFBF1ae8D90a7eBdb24E","withdraw_amount":"2165.05767839","fee":"21.11000000","amount_after_fee":"2143.94767839","submit_time":"1730759489","withdraw_id":"strm-3423","txid":""}
        if (Array.isArray (response)) {
            return undefined; // public endpoints may return []-arrays
        }
        const errorCode = this.safeInteger (response, 'code');
        if ((errorCode !== undefined) && (errorCode !== 0)) {
            const message = this.safeString (response, 'msg', '');
            const errorFeedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, errorFeedback);
            const codeString = this.numberToString (errorCode);
            this.throwExactlyMatchedException (this.exceptions['exact'], codeString, errorFeedback);
            throw new ExchangeError (errorFeedback);
        }
        const error = this.safeString (response, 'error', '');
        if (!('success' in response) && error === '') {
            return undefined; // no 'success' property on public responses
        }
        const status = this.safeString (response, 'success');
        if (status === 'approved') {
            return undefined;
        }
        if (this.safeInteger (response, 'success', 0) === 1) {
            // { success: 1, return: { orders: [] }}
            if (!('return' in response)) {
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            } else {
                return undefined;
            }
        }
        const feedback = this.id + ' ' + body;
        const errorCodeText = this.safeString (response, 'error_code');
        if (errorCodeText !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCodeText, feedback);
        }
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
}
