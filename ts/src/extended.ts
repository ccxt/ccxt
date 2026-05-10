
//  ---------------------------------------------------------------------------

import Exchange from './abstract/extended.js';
import { Precise } from './base/Precise.js';
import type { Balances, Currencies, Currency, Dict, FundingHistory, FundingRateHistory, Int, int, Leverage, Market, Num, OHLCV, OpenInterest, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction } from './base/types.js';
import { ArgumentsRequired, BadRequest } from './base/errors.js';
import { DECIMAL_PLACES, NO_PADDING, TICK_SIZE, TRUNCATE } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class extended
 * @augments Exchange
 */
export default class extended extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'extended',
            'name': 'Extended',
            'countries': [ 'SG' ],
            'version': 'v2',
            'rateLimit': 600, // Default Tier 1,000 requests/minute ≈ 1.67 request per second
            'precisionMode': TICK_SIZE,
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMarkPrice': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': 'PT1M',
                '5m': 'PT5M',
                '15m': 'PT15M',
                '30m': 'PT30M',
                '1h': 'PT1H',
                '2h': 'PT2H',
                '4h': 'PT4H',
                '8h': 'PT8H',
                '12h': 'PT12H',
                '1d': 'PT24H',
                '1w': 'P7D',
                '1M': 'P30D',
            },
            'hostname': 'extended.exchange',
            'urls': {
                'logo': '',
                'api': {
                    'rest': 'https://api.starknet.{hostname}',
                },
                'test': {
                    'rest': 'https://api.starknet.sepolia.{hostname}',
                },
                'www': 'https://app.{hostname}',
                'doc': 'https://api.docs.{hostname}',
                'fees': 'https://docs.{hostname}/extended-resources/trading/trading-fees-and-rebates',
                'referral': '',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': [
                            'info/markets',
                            'info/assets',
                            'info/assets/{asset}/price',
                            'info/markets/{market}/stats',
                            'info/markets/{market}/orderbook',
                            'info/markets/{market}/trades',
                            'info/candles/{market}/{candleType}',
                            'info/{market}/funding',
                            'info/{market}/open-interests',
                            'info/builder/dashboard',
                        ],
                    },
                    'private': {
                        'get': [
                            'user/account/info',
                            'user/balance',
                            'user/spot/balances',
                            'user/assetOperations',
                            'user/positions',
                            'user/positions/history',
                            'user/orders',
                            'user/orders/history',
                            'user/orders/{id}',
                            'user/orders/external/{externalId}',
                            'user/trades',
                            'user/funding/history',
                            'user/rebates/stats',
                            'user/leverage',
                            'user/fees',
                            'user/bridge/config',
                            'user/bridge/quote',
                            'user/affiliate',
                            'user/referrals/status',
                            'user/referrals/links',
                            'user/referrals/dashboard',
                            'user/rewards/earned',
                            'user/rewards/leaderboard/stats',
                            'portfolio/charts/equities',
                            'portfolio/charts/pnl',
                            'vault/public/performance',
                            'vault/public/summary',
                        ],
                        'post': [
                            'user/order',
                            'user/order/massCancel',
                            'user/deadmanswitch',
                            'user/bridge/quote',
                            'user/withdrawal',
                            'user/transfer',
                            'user/referrals/use',
                            'user/referrals',
                        ],
                        'put': [
                            'user/referrals',
                        ],
                        'patch': [
                            'user/leverage',
                        ],
                        'delete': [
                            'user/order/{id}',
                            'user/order',
                        ],
                    },
                },
            },
            'fees': {
                'taker': this.parseNumber ('0.002'),
                'maker': this.parseNumber ('0.002'),
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'privateKey': false,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'options': {
                'brokerId': 'CCXT-CODE',
                'brokerReferralCodeApplied': false,
            },
        });
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        const currenciesByNumericId = this.safeDict (this.options, 'currenciesByNumericId');
        if ((currenciesByNumericId === undefined) || reload) {
            this.options['currenciesByNumericId'] = this.indexByStringifiedNumericId (this.currencies);
        }
        return markets;
    }

    indexByStringifiedNumericId (input) {
        const result: Dict = {};
        if (input === undefined) {
            return undefined;
        }
        const keys = Object.keys (input);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const item = input[key];
            const numericIdString = this.safeString (item, 'numericId');
            if (numericIdString === undefined) {
                continue;
            }
            result[numericIdString] = item;
        }
        return result;
    }

    /**
     * @method
     * @name extended#fetchMarkets
     * @description retrieves data on all markets for extended
     * @see https://api.docs.extended.exchange/#get-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.v1PublicGetInfoMarkets (params);
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "name": "BTC-USD",
        //           "uiName": "BTC-USD",
        //           "category": "Crypto",
        //           "subCategory": "L1",
        //           "assetName": "BTC",
        //           "assetPrecision": 5,
        //           "collateralAssetName": "USD",
        //           "collateralAssetPrecision": 6,
        //           "description": "Bitcoin",
        //           "active": true,
        //           "status": "ACTIVE",
        //           "marketStats": {
        //             "dailyVolume": "231016077.512960",
        //             "dailyVolumeBase": "3025.00058",
        //             "dailyPriceChange": "420",
        //             "dailyPriceChangePercentage": "0.0055",
        //             "dailyLow": "75635",
        //             "dailyHigh": "77399",
        //             "lastPrice": "77259",
        //             "askPrice": "77260",
        //             "bidPrice": "77259",
        //             "markPrice": "77259.680250000004",
        //             "indexPrice": "77299.020412500001",
        //             "fundingRate": "0.000013",
        //             "nextFundingRate": 1777442400000,
        //             "openInterest": "115861923.311902",
        //             "openInterestBase": "1500.40958",
        //             "deleverageLevels": {
        //               "shortPositions": [
        //                 {
        //                   "level": 1,
        //                   "rankingLowerBound": "-815.7788"
        //                 },
        //                 {
        //                   "level": 2,
        //                   "rankingLowerBound": "-2.1328"
        //                 },
        //                 {
        //                   "level": 3,
        //                   "rankingLowerBound": "-0.9297"
        //                 },
        //                 {
        //                   "level": 4,
        //                   "rankingLowerBound": "0.0000"
        //                 }
        //               ],
        //               "longPositions": [
        //                 {
        //                   "level": 1,
        //                   "rankingLowerBound": "-47234.9095"
        //                 },
        //                 {
        //                   "level": 2,
        //                   "rankingLowerBound": "-0.0030"
        //                 },
        //                 {
        //                   "level": 3,
        //                   "rankingLowerBound": "0.0020"
        //                 },
        //                 {
        //                   "level": 4,
        //                   "rankingLowerBound": "0.0033"
        //                 }
        //               ]
        //             }
        //           },
        //           "tradingConfig": {
        //             "minOrderSize": "0.0001",
        //             "minOrderSizeChange": "0.00001",
        //             "minPriceChange": "1",
        //             "maxMarketOrderValue": "3000000",
        //             "maxLimitOrderValue": "15000000",
        //             "maxPositionValue": "60000000",
        //             "maxLeverage": "50.00",
        //             "hourlyFundingRateCap": "0.25",
        //             "maxNumOrders": "200",
        //             "limitPriceCap": "0.05",
        //             "limitPriceFloor": "0.05",
        //             "riskFactorConfig": [
        //               {
        //                 "upperBound": "4000000",
        //                 "riskFactor": "0.02",
        //                 "isAvailableForUsers": true
        //               }
        //             ]
        //           },
        //           "l2Config": {
        //             "type": "STARKX",
        //             "collateralId": "0x1",
        //             "syntheticId": "0x4254432d3600000000000000000000",
        //             "syntheticResolution": 1000000,
        //             "collateralResolution": 1000000
        //           },
        //           "visibleOnUi": true,
        //           "createdAt": 1752829532673
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //       "name": "BTC-USD",
        //       "uiName": "BTC-USD",
        //       "category": "Crypto",
        //       "subCategory": "L1",
        //       "assetName": "BTC",
        //       "assetPrecision": 5,
        //       "collateralAssetName": "USD",
        //       "collateralAssetPrecision": 6,
        //       "description": "Bitcoin",
        //       "active": true,
        //       "status": "ACTIVE",
        //       "marketStats": { ... },
        //       "tradingConfig": {
        //         "minOrderSize": "0.0001",
        //         "minOrderSizeChange": "0.00001",
        //         "minPriceChange": "1",
        //         "maxMarketOrderValue": "3000000",
        //         "maxLimitOrderValue": "15000000",
        //         "maxPositionValue": "60000000",
        //         "maxLeverage": "50.00",
        //         "hourlyFundingRateCap": "0.25",
        //         "maxNumOrders": "200",
        //         "limitPriceCap": "0.05",
        //         "limitPriceFloor": "0.05",
        //         "riskFactorConfig": [
        //           {
        //             "upperBound": "4000000",
        //             "riskFactor": "0.02",
        //             "isAvailableForUsers": true
        //           }
        //         ]
        //       },
        //       "l2Config": { ... },
        //       "visibleOnUi": true,
        //       "createdAt": 1752829532673
        //     }
        //
        const tradingConfig = this.safeDict (market, 'tradingConfig', {});
        const marketId = this.safeString (market, 'name');
        const baseId = this.safeString (market, 'assetName');
        let quoteId = this.safeString (market, 'collateralAssetName');
        if (quoteId === 'USD') {
            quoteId = 'USDC';
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settleId = 'USDC';
        const settle = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const status = this.safeString (market, 'status');
        const active = (status === 'ACTIVE');
        const amountPrecision = this.safeNumber (tradingConfig, 'minOrderSizeChange');
        const pricePrecision = this.safeNumber (tradingConfig, 'minPriceChange');
        const maxLeverage = this.safeNumber (tradingConfig, 'maxLeverage');
        const minAmount = this.safeNumber (tradingConfig, 'minOrderSize');
        const maxCost = this.safeNumber (tradingConfig, 'maxLimitOrderValue');
        const created: Int = this.safeInteger (market, 'createdAt');
        return this.safeMarketStructure ({
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': active,
            'contract': true,
            'linear': true,
            'inverse': false,
            'taker': this.safeNumber (this.fees, 'taker'),
            'maker': this.safeNumber (this.fees, 'maker'),
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': maxLeverage,
                },
                'amount': {
                    'min': minAmount,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': maxCost,
                },
            },
            'created': created,
            'info': market,
        });
    }

    /**
     * @method
     * @name extended#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api.docs.extended.exchange/#get-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.v1PublicGetInfoAssets (params);
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "id": 1,
        //           "name": "USD",
        //           "symbol": "USD",
        //           "description": "USD Collateral",
        //           "precision": 6,
        //           "isActive": true,
        //           "isCollateral": true,
        //           "starkexId": "0x1",
        //           "starkexResolution": 1000000,
        //           "l1Id": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        //           "l1Resolution": 1000000,
        //           "version": 3,
        //           "createdAt": 1752829532673,
        //           "type": "SPOT",
        //           "canBeUsedAsCollateral": true,
        //           "riskFactors": [],
        //           "availableForTradeFactors": []
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseCurrencies (data);
    }

    parseCurrency (currency: Dict): Currency {
        //
        //     {
        //       "id": 1,
        //       "name": "USD",
        //       "symbol": "USD",
        //       "description": "USD Collateral",
        //       "precision": 6,
        //       "isActive": true,
        //       "isCollateral": true,
        //       "starkexId": "0x1",
        //       "starkexResolution": 1000000,
        //       "l1Id": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        //       "l1Resolution": 1000000,
        //       "version": 3,
        //       "createdAt": 1752829532673,
        //       "type": "SPOT",
        //       "canBeUsedAsCollateral": true,
        //       "riskFactors": [],
        //       "availableForTradeFactors": []
        //     }
        //
        const currencyId = this.safeString (currency, 'symbol');
        let code = this.safeCurrencyCode (currencyId);
        if (currencyId === 'USD') {
            code = 'USDC';
        }
        const name = this.safeString (currency, 'name');
        const precision = this.safeInteger (currency, 'precision');
        const isActive = this.safeBool (currency, 'isActive');
        return this.safeCurrencyStructure ({
            'id': currencyId,
            'code': code,
            'numericId': this.safeInteger (currency, 'id'),
            'name': name,
            'active': isActive,
            'deposit': undefined,
            'withdraw': undefined,
            'precision': precision,
            'type': this.safeStringLower (currency, 'type'),
            'margin': this.safeBool (currency, 'canBeUsedAsCollateral'),
            'info': currency,
        });
    }

    /**
     * @method
     * @name extended#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.docs.extended.exchange/#get-market-statistics
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: Str, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetInfoMarketsMarketStats (this.extend (request, params));
        //
        //     {
        //       "status": "OK",
        //       "data": {
        //         "dailyVolume": "231216165.666600",
        //         "dailyVolumeBase": "3027.36710",
        //         "dailyPriceChange": "181",
        //         "dailyPriceChangePercentage": "0.0024",
        //         "dailyLow": "75635",
        //         "dailyHigh": "77399",
        //         "lastPrice": "77026",
        //         "askPrice": "77026",
        //         "bidPrice": "77025",
        //         "markPrice": "77006.091897999984",
        //         "indexPrice": "77050.739529925005",
        //         "fundingRate": "0.000012",
        //         "nextFundingRate": 1777446000000,
        //         "openInterest": "114851569.088316",
        //         "openInterestBase": "1491.33012",
        //         "deleverageLevels": {
        //           "shortPositions": [
        //             { "level": 1, "rankingLowerBound": "-784.2884" },
        //             { "level": 2, "rankingLowerBound": "-2.1078" },
        //             { "level": 3, "rankingLowerBound": "-0.8754" },
        //             { "level": 4, "rankingLowerBound": "0.0000" }
        //           ],
        //           "longPositions": [
        //             { "level": 1, "rankingLowerBound": "-47747.2010" },
        //             { "level": 2, "rankingLowerBound": "-0.0131" },
        //             { "level": 3, "rankingLowerBound": "0.0019" },
        //             { "level": 4, "rankingLowerBound": "0.0032" }
        //           ]
        //         }
        //       }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    /**
     * @method
     * @name extended#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for all markets
     * @see https://api.docs.extended.exchange/#get-markets
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds = [];
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                marketIds.push (market['id']);
            }
            request['market'] = marketIds;
        }
        const response = await this.v1PublicGetInfoMarkets (this.extend (request, params));
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "name": "BTC-USD",
        //           "assetName": "BTC",
        //           "collateralAssetName": "USD",
        //           "marketStats": {
        //             "dailyVolume": "231016077.512960",
        //             ...
        //           },
        //           ...
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const tickers: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const marketData = data[i];
            const marketId = this.safeString (marketData, 'name');
            const market = this.safeMarket (marketId);
            const stats = this.safeDict (marketData, 'marketStats', {});
            const ticker = this.parseTicker (stats, market);
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
        }
        return this.filterByArrayTickers (tickers, 'symbol', symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //       "dailyVolume": "231216165.666600",
        //       "dailyVolumeBase": "3027.36710",
        //       "dailyPriceChange": "181",
        //       "dailyPriceChangePercentage": "0.0024",
        //       "dailyLow": "75635",
        //       "dailyHigh": "77399",
        //       "lastPrice": "77026",
        //       "askPrice": "77026",
        //       "bidPrice": "77025",
        //       "markPrice": "77006.091897999984",
        //       "indexPrice": "77050.739529925005",
        //       "fundingRate": "0.000012",
        //       "nextFundingRate": 1777446000000,
        //       "openInterest": "114851569.088316",
        //       "openInterestBase": "1491.33012",
        //       "deleverageLevels": {
        //         "shortPositions": [
        //           { "level": 1, "rankingLowerBound": "-784.2884" },
        //           { "level": 2, "rankingLowerBound": "-2.1078" },
        //           { "level": 3, "rankingLowerBound": "-0.8754" },
        //           { "level": 4, "rankingLowerBound": "0.0000" }
        //         ],
        //         "longPositions": [
        //           { "level": 1, "rankingLowerBound": "-47747.2010" },
        //           { "level": 2, "rankingLowerBound": "-0.0131" },
        //           { "level": 3, "rankingLowerBound": "0.0019" },
        //           { "level": 4, "rankingLowerBound": "0.0032" }
        //         ]
        //       }
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeNumber (ticker, 'lastPrice');
        const percentageRaw = this.safeNumber (ticker, 'dailyPriceChangePercentage');
        const percentage = (percentageRaw !== undefined) ? percentageRaw * 100 : undefined;
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeNumber (ticker, 'dailyHigh'),
            'low': this.safeNumber (ticker, 'dailyLow'),
            'bid': this.safeNumber (ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeNumber (ticker, 'dailyPriceChange'),
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'dailyVolumeBase'),
            'quoteVolume': this.safeNumber (ticker, 'dailyVolume'),
            'markPrice': this.safeNumber (ticker, 'markPrice'),
            'indexPrice': this.safeNumber (ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name extended#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.docs.extended.exchange/#get-market-order-book
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
        };
        const response = await this.v1PublicGetInfoMarketsMarketOrderbook (this.extend (request, params));
        //
        //     {
        //       "status": "OK",
        //       "data": {
        //         "market": "BTC-USD",
        //         "bid": [
        //           {
        //             "qty": "14.46084",
        //             "price": "76214"
        //           }
        //         ],
        //         "ask": [
        //           {
        //             "qty": "0.11585",
        //             "price": "76215"
        //           }
        //         ]
        //       }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const orderbook = this.parseOrderBook (data, market['symbol'], undefined, 'bid', 'ask', 'price', 'qty');
        if (limit !== undefined) {
            orderbook['bids'] = this.arraySlice (orderbook['bids'], 0, limit);
            orderbook['asks'] = this.arraySlice (orderbook['asks'], 0, limit);
        }
        return orderbook;
    }

    /**
     * @method
     * @name extended#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.docs.extended.exchange/#get-market-last-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetInfoMarketsMarketTrades (this.extend (request, params));
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "i": 2.049676905958871e+18,
        //           "m": "BTC-USD",
        //           "S": "SELL",
        //           "tT": "TRADE",
        //           "T": 1777516030193,
        //           "p": "76140",
        //           "q": "0.00165"
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name extended#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.docs.extended.exchange/#get-trades
     * @param {string} [symbol] unified market symbol of the trades
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchMyTrades', symbol, since, limit, params, 'cursor', 'cursor', undefined, 100) as Trade[];
        }
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserTrades (this.extend (params, request));
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "id": 1,
        //                 "orderId": 1784980437895231232,
        //                 "externalId": "ExtId-1",
        //                 "accountId": 1,
        //                 "market": "BTC-USD",
        //                 "side": "BUY",
        //                 "price": "39000",
        //                 "qty": "0.2",
        //                 "value": "7800",
        //                 "fee": "1.3",
        //                 "tradeType": "TRADE",
        //                 "isTaker": true,
        //                 "createdTime": 1701563440000
        //             }
        //         ],
        //         "pagination": {
        //             "cursor": 1784963886257016832,
        //             "count": 1
        //         }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const pagination = this.safeDict (response, 'pagination', {});
        const cursor = this.safeValue (pagination, 'cursor');
        if ((cursor !== undefined) && (data.length > 0)) {
            const lastIndex = data.length - 1;
            data[lastIndex] = this.extend (data[lastIndex], { 'cursor': cursor });
        }
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name extended#fetchFundingHistory
     * @description fetch the funding payments history
     * @see https://api.docs.extended.exchange/#get-funding-payments
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {FundingHistory[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingHistory[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchFundingHistory', symbol, since, limit, params, 'cursor', 'cursor', undefined, 100) as FundingHistory[];
        }
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserFundingHistory (this.extend (params, request));
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "id": 8341,
        //                 "accountId": 3137,
        //                 "market": "BNB-USD",
        //                 "positionId": 1821237954501148672,
        //                 "side": "LONG",
        //                 "size": "1.116",
        //                 "value": "560.77401888",
        //                 "markPrice": "502.48568",
        //                 "fundingFee": "0",
        //                 "fundingRate": "0",
        //                 "paidTime": 1723147241346
        //             }
        //         ],
        //         "pagination": {
        //             "cursor": 8341,
        //             "count": 1
        //         }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const pagination = this.safeDict (response, 'pagination', {});
        const cursor = this.safeValue (pagination, 'cursor');
        if ((cursor !== undefined) && (data.length > 0)) {
            const lastIndex = data.length - 1;
            data[lastIndex] = this.extend (data[lastIndex], { 'cursor': cursor });
        }
        return this.parseFundingHistories (data, market, since, limit);
    }

    parseFundingHistory (history: Dict, market: Market = undefined): FundingHistory {
        //
        //     {
        //         "id": 8341,
        //         "accountId": 3137,
        //         "market": "BNB-USD",
        //         "positionId": 1821237954501148672,
        //         "side": "LONG",
        //         "size": "1.116",
        //         "value": "560.77401888",
        //         "markPrice": "502.48568",
        //         "fundingFee": "0",
        //         "fundingRate": "0",
        //         "paidTime": 1723147241346
        //     }
        //
        const marketId = this.safeString (history, 'market');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (history, 'paidTime');
        return {
            'info': history,
            'symbol': market['symbol'],
            'code': market['settle'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': this.safeString (history, 'id'),
            'amount': this.safeNumber (history, 'fundingFee'),
            'rate': this.safeNumber (history, 'fundingRate'),
        } as FundingHistory;
    }

    parseFundingHistories (histories, market: Market = undefined, since: Int = undefined, limit: Int = undefined): FundingHistory[] {
        const result: FundingHistory[] = [];
        for (let i = 0; i < histories.length; i++) {
            result.push (this.parseFundingHistory (histories[i], market));
        }
        const symbol = (market === undefined) ? undefined : market['symbol'];
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as FundingHistory[];
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //     {
        //       "i": 2.049676905958871e+18,
        //       "m": "BTC-USD",
        //       "S": "SELL",
        //       "tT": "TRADE",
        //       "T": 1777516030193,
        //       "p": "76140",
        //       "q": "0.00165"
        //     }
        //
        // fetchMyTrades
        //
        //     {
        //         "id": 1,
        //         "orderId": 1784980437895231232,
        //         "externalId": "ExtId-1",
        //         "accountId": 1,
        //         "market": "BTC-USD",
        //         "side": "BUY",
        //         "price": "39000",
        //         "qty": "0.2",
        //         "value": "7800",
        //         "fee": "1.3",
        //         "tradeType": "TRADE",
        //         "isTaker": true,
        //         "createdTime": 1701563440000
        //     }
        //
        const marketId = this.safeString2 (trade, 'm', 'market');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (trade, 'T', 'createdTime');
        const priceString = this.safeString2 (trade, 'p', 'price');
        const amountString = this.safeString2 (trade, 'q', 'qty');
        const sideRaw = this.safeString2 (trade, 'S', 'side');
        const side = (sideRaw !== undefined) ? sideRaw.toLowerCase () : undefined;
        const feeCost = this.safeString (trade, 'fee');
        const fee = (feeCost === undefined) ? undefined : {
            'cost': feeCost,
            'currency': (market === undefined) ? undefined : market['settle'],
        };
        const isTaker = this.safeBool (trade, 'isTaker');
        let takerOrMaker = undefined;
        if (isTaker !== undefined) {
            takerOrMaker = isTaker ? 'taker' : 'maker';
        }
        return this.safeTrade ({
            'id': this.safeString2 (trade, 'i', 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'orderId'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': this.safeString (trade, 'value'),
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name extended#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.docs.extended.exchange/#get-candles-history
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.candleType] candle type: 'trades' (default), 'mark-prices', or 'index-prices'
     * @param {string} [params.price] *ignored if params.candleType is set* 'mark' or 'index' for mark price and index price candles
     * @param {int} [params.until] end timestamp in ms for the requested period
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: Str, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const price = this.safeString (params, 'price');
        let candleType = this.safeString (params, 'candleType');
        if (candleType === undefined) {
            if (price === 'mark') {
                candleType = 'mark-prices';
            } else if (price === 'index') {
                candleType = 'index-prices';
            } else {
                candleType = 'trades';
            }
        }
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, [ 'candleType', 'price', 'until' ]);
        const request: Dict = {
            'market': market['id'],
            'candleType': candleType,
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
            'limit': (limit !== undefined) ? limit : 100,
        };
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.v1PublicGetInfoCandlesMarketCandleType (this.extend (request, params));
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "o": "75657.5",
        //           "l": "75657.5",
        //           "h": "75657.5",
        //           "c": "75657.5",
        //           "v": "0",
        //           "T": 1777517880000
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv: Dict, market: Market = undefined): OHLCV {
        //
        //     {
        //       "o": "75657.5",
        //       "l": "75657.5",
        //       "h": "75657.5",
        //       "c": "75657.5",
        //       "v": "0",
        //       "T": 1777517880000
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'T'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    /**
     * @method
     * @name extended#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api.docs.extended.exchange/#get-funding-rates-history
     * @param {string} symbol unified symbol of the market to fetch funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of entries to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {int} [params.endTime] exchange-specific end timestamp in ms of the latest funding rate to fetch
     * @param {int} [params.cursor] offset of the result set
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchFundingRateHistory', symbol, since, limit, params, 'cursor', 'cursor', undefined, 10000) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        if (limit === undefined) {
            limit = 100;
        }
        const until = this.safeInteger (params, 'until', this.milliseconds ());
        const endTime = this.safeInteger (params, 'endTime', until);
        params = this.omit (params, [ 'endTime', 'until' ]);
        if (since === undefined) {
            since = endTime - (limit * 60 * 60 * 1000);
        }
        const request: Dict = {
            'market': market['id'],
            'startTime': since,
            'endTime': endTime,
            'limit': limit,
        };
        const response = await this.v1PublicGetInfoMarketFunding (this.extend (request, params));
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "m": "BTC-USD",
        //           "f": "0.000008",
        //           "T": 1777507201028
        //         }
        //       ],
        //       "pagination": {
        //         "cursor": 1784963886257016832,
        //         "count": 1
        //       }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const pagination = this.safeDict (response, 'pagination', {});
        const cursor = this.safeValue (pagination, 'cursor');
        const result: FundingRateHistory[] = [];
        for (let i = 0; i < data.length; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === data.length - 1)) {
                entry = this.extend (entry, { 'cursor': cursor });
            }
            result.push (this.parseFundingRateHistory (entry, market));
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingRateHistory[];
    }

    parseFundingRateHistory (info: Dict, market: Market = undefined): FundingRateHistory {
        //
        //     {
        //       "m": "BTC-USD",
        //       "f": "0.000008",
        //       "T": 1777507201028
        //     }
        //
        const marketId = this.safeString (info, 'm');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (info, 'T');
        return {
            'info': info,
            'symbol': market['symbol'],
            'fundingRate': this.safeNumber (info, 'f'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        } as FundingRateHistory;
    }

    /**
     * @method
     * @name extended#fetchOpenInterestHistory
     * @description Retrieves the open interest history of a currency
     * @see https://api.docs.extended.exchange/#get-open-interest-history
     * @param {string} symbol unified CCXT market symbol
     * @param {string} timeframe '1h' or '1d'
     * @param {int} [since] the time(ms) of the earliest record to retrieve as a unix timestamp
     * @param {int} [limit] the maximum amount of open interest structures to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.until] timestamp in ms of the latest open interest record to fetch
     * @returns {object[]} an array of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterestHistory (symbol: string, timeframe = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OpenInterest[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe);
        if (!this.inArray (interval, [ 'PT1H', 'P1D' ])) {
            throw new BadRequest (this.id + ' fetchOpenInterestHistory() supports 1h and 1d timeframes only');
        }
        if (limit === undefined) {
            limit = 100;
        }
        const until = this.safeInteger (params, 'until', this.milliseconds ());
        const endTime = this.safeInteger (params, 'endTime', until);
        params = this.omit (params, [ 'endTime', 'until' ]);
        if (since === undefined) {
            since = endTime - (limit * this.parseTimeframe (timeframe) * 1000);
        }
        const request: Dict = {
            'market': market['id'],
            'interval': interval,
            'startTime': since,
            'endTime': endTime,
            'limit': limit,
        };
        const response = await this.v1PublicGetInfoMarketOpenInterests (this.extend (request, params));
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "i": "112620590.6060360000000000",
        //           "I": "1473.1408400000000000",
        //           "t": 1777420800000
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOpenInterestsHistory (data, market, since, limit);
    }

    parseOpenInterest (interest: Dict, market: Market = undefined): OpenInterest {
        //
        //     {
        //       "i": "112620590.6060360000000000",
        //       "I": "1473.1408400000000000",
        //       "t": 1777420800000
        //     }
        //
        const timestamp = this.safeInteger (interest, 't');
        return this.safeOpenInterest ({
            'symbol': market['symbol'],
            'openInterestAmount': this.safeNumber (interest, 'I'),
            'openInterestValue': this.safeNumber (interest, 'i'),
            'baseVolume': this.safeNumber (interest, 'I'),
            'quoteVolume': this.safeNumber (interest, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name extended#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.docs.extended.exchange/#get-spot-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.v1PrivateGetUserSpotBalances (params);
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "accountId": 123,
        //                 "asset": "USDC",
        //                 "balance": "13500",
        //                 "indexPrice": "1",
        //                 "notionalValue": "13500",
        //                 "contributionFactor": "1",
        //                 "equityContribution": "13500",
        //                 "availableToWithdraw": "100",
        //                 "updatedAt": 1701563440
        //             },
        //             {
        //                 "accountId": 123,
        //                 "asset": "BTC",
        //                 "balance": "0.5",
        //                 "indexPrice": "65000",
        //                 "notionalValue": "32500",
        //                 "contributionFactor": "0.95",
        //                 "equityContribution": "30875",
        //                 "availableToWithdraw": "0.5",
        //                 "updatedAt": 1701563440
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseBalance (data);
    }

    parseBalance (response): Balances {
        const result: Dict = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = this.safeDict (response, i, {});
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'availableToWithdraw');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name extended#fetchTransactions
     * @description fetch history of deposits, withdrawals, and transfers
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch transactions for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchTransactions (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTransactions', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTransactions', code, since, limit, params, 'cursor', 'cursor', undefined, 50) as Transaction[];
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserAssetOperations (this.extend (request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "id": "1951255127004282880",
        //                 "type": "TRANSFER",
        //                 "status": "COMPLETED",
        //                 "amount": "-3.0000000000000000",
        //                 "fee": "0",
        //                 "asset": 1,
        //                 "time": 1754050449502,
        //                 "accountId": 100009,
        //                 "counterpartyAccountId": 100023
        //             }
        //         ],
        //         "pagination": {
        //             "cursor": 1951255127004282880,
        //             "count": 1
        //         }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const pagination = this.safeDict (response, 'pagination', {});
        const cursor = this.safeValue (pagination, 'cursor');
        if ((cursor !== undefined) && (data.length > 0)) {
            const lastIndex = data.length - 1;
            data[lastIndex] = this.extend (data[lastIndex], { 'cursor': cursor });
        }
        return this.parseTransactions (data, currency, since, limit);
    }

    getExtendedCurrencyCodeById (assetId: Str, currency: Currency = undefined): Str {
        if (assetId === undefined) {
            return this.safeString (currency, 'code');
        }
        const currenciesByNumericId = this.safeDict (this.options, 'currenciesByNumericId', {});
        const currencyByNumericId = this.safeDict (currenciesByNumericId, assetId);
        if (currencyByNumericId !== undefined) {
            return this.safeString (currencyByNumericId, 'code');
        }
        if (currency !== undefined) {
            return currency['code'];
        }
        let code = this.safeCurrencyCode (assetId);
        if (code === 'USD') {
            code = 'USDC';
        }
        return code;
    }

    parseTransactionStatus (status: Str): Str {
        const statuses: Dict = {
            'CREATED': 'pending',
            'IN_PROGRESS': 'pending',
            'COMPLETED': 'ok',
            'REJECTED': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type: Str): Str {
        const types: Dict = {
            'DEPOSIT': 'deposit',
            'WITHDRAWAL': 'withdrawal',
            'TRANSFER': 'transfer',
            'CLAIM': 'claim',
        };
        return this.safeString (types, type, type);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "id": "1951255127004282880",
        //         "type": "TRANSFER",
        //         "status": "COMPLETED",
        //         "amount": "-3.0000000000000000",
        //         "fee": "0",
        //         "asset": 1,
        //         "time": 1754050449502,
        //         "accountId": 100009,
        //         "counterpartyAccountId": 100023
        //     }
        //
        const timestamp = this.safeInteger (transaction, 'time');
        const assetId = this.safeString (transaction, 'asset');
        const code = this.getExtendedCurrencyCodeById (assetId, currency);
        const amountString = this.safeString (transaction, 'amount');
        const amount = (amountString === undefined) ? undefined : this.parseNumber (Precise.stringAbs (amountString));
        let fee = undefined;
        const feeCost = this.safeString (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'currency': code,
                'cost': this.parseNumber (Precise.stringAbs (feeCost)),
            };
        }
        const transactionType = this.parseTransactionType (this.safeString (transaction, 'type'));
        const network = this.safeString (transaction, 'chain');
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'transactionHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': transactionType,
            'amount': amount,
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': timestamp,
            'fee': fee,
            'network': network,
            'comment': undefined,
            'internal': (transactionType === 'transfer'),
        };
    }

    /**
     * @method
     * @name extended#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://api.docs.extended.exchange/#get-fees
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.builderId] builder client id
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.v1PrivateGetUserFees (this.extend (request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "market": "BTC-USD",
        //                 "makerFeeRate": "0.00000",
        //                 "takerFeeRate": "0.00025",
        //                 "builderFeeRate": "0.0001"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const first = this.safeDict (data, 0, {});
        return this.parseTradingFee (first, market);
    }

    /**
     * @method
     * @name extended#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://api.docs.extended.exchange/#get-fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.market] exchange market id
     * @param {string} [params.builderId] builder client id
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.v1PrivateGetUserFees (params);
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "market": "BTC-USD",
        //                 "makerFeeRate": "0.00000",
        //                 "takerFeeRate": "0.00025",
        //                 "builderFeeRate": "0.0001"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const fee = this.safeDict (data, i, {});
            const parsed = this.parseTradingFee (fee);
            const symbol = this.safeString (parsed, 'symbol');
            result[symbol] = parsed;
        }
        return result;
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        //
        //     {
        //         "market": "BTC-USD",
        //         "makerFeeRate": "0.00000",
        //         "takerFeeRate": "0.00025",
        //         "builderFeeRate": "0.0001"
        //     }
        //
        const marketId = this.safeString (fee, 'market');
        market = this.safeMarket (marketId, market);
        return {
            'info': fee,
            'symbol': market['symbol'],
            'maker': this.safeNumber (fee, 'makerFeeRate'),
            'taker': this.safeNumber (fee, 'takerFeeRate'),
            'percentage': true,
            'tierBased': undefined,
        };
    }

    /**
     * @method
     * @name extended#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://api.docs.extended.exchange/#get-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.v1PrivateGetUserLeverage (this.extend (request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "market": "SOL-USD",
        //                 "leverage": "10"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseLeverage (this.safeDict (data, 0), market);
    }

    /**
     * @method
     * @name extended#setLeverage
     * @description set the level of leverage for a market
     * @see https://api.docs.extended.exchange/#update-leverage
     * @param {int} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}): Promise<Leverage> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'leverage': this.numberToString (leverage),
        };
        const response = await this.v1PrivatePatchUserLeverage (this.extend (request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": {}
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseLeverage (data, market);
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        //
        //     {
        //         "market": "BTC-USD",
        //         "leverage": "10"
        //     }
        //
        const marketId = this.safeString (leverage, 'market');
        market = this.safeMarket (marketId, market);
        const leverageValue = this.safeNumber (leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': undefined,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        } as Leverage;
    }

    /**
     * @method
     * @name extended#fetchPositions
     * @description fetch all open positions
     * @see https://api.docs.extended.exchange/#get-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['market'] = (marketIds.length === 1) ? marketIds[0] : marketIds;
        }
        const response = await this.v1PrivateGetUserPositions (this.extend (request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "id": 1,
        //                 "accountId": 1,
        //                 "market": "BTC-USD",
        //                 "side": "LONG",
        //                 "leverage": "10",
        //                 "size": "0.1",
        //                 "value": "4000",
        //                 "openPrice": "39000",
        //                 "markPrice": "40000",
        //                 "liquidationPrice": "38200",
        //                 "margin": "20",
        //                 "unrealisedPnl": "1000",
        //                 "realisedPnl": "1.2",
        //                 "tpTriggerPrice": "41000",
        //                 "tpLimitPrice": "41500",
        //                 "slTriggerPrice": "39500",
        //                 "slLimitPrice": "39000",
        //                 "adl": "2.5",
        //                 "maxPositionSize": "0.2",
        //                 "createdAt": 1701563440000,
        //                 "updatedAt": 1701563440000
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    /**
     * @method
     * @name extended#fetchPosition
     * @description fetch data on an open position
     * @see https://api.docs.extended.exchange/#get-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition (symbol: string, params = {}): Promise<Position> {
        const positions = await this.fetchPositions ([ symbol ], params);
        return this.safeDict (positions, 0) as Position;
    }

    /**
     * @method
     * @name extended#fetchPositionsHistory
     * @description fetch historical positions
     * @see https://api.docs.extended.exchange/#get-positions-history
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionsHistory (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        if (typeof symbols === 'string') {
            symbols = [ symbols ];
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchPositionsHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchPositionsHistory', symbols as any, since, limit, params, 'cursor', 'cursor', undefined, 10000) as Position[];
        }
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['market'] = (marketIds.length === 1) ? marketIds[0] : marketIds;
        }
        const response = await this.v1PrivateGetUserPositionsHistory (this.extend (request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": [
        //             {
        //                 "id": 1784963886257016832,
        //                 "accountId": 1,
        //                 "market": "BTC-USD",
        //                 "side": "LONG",
        //                 "exitType": "TRADE",
        //                 "leverage": "10",
        //                 "size": "0.1",
        //                 "maxPositionSize": "0.2",
        //                 "openPrice": "39000",
        //                 "exitPrice": "40000",
        //                 "realisedPnl": "10",
        //                 "createdTime": 1701563440000,
        //                 "closedTime": 1701567040000
        //             }
        //         ],
        //         "pagination": {
        //             "cursor": 1784963886257016832,
        //             "count": 1
        //         }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const pagination = this.safeDict (response, 'pagination', {});
        const cursor = this.safeValue (pagination, 'cursor');
        if ((cursor !== undefined) && (data.length > 0)) {
            const lastIndex = data.length - 1;
            data[lastIndex] = this.extend (data[lastIndex], { 'cursor': cursor });
        }
        const positions = this.parsePositions (data, symbols);
        return this.filterBySinceLimit (positions, since, limit, 'timestamp') as Position[];
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        //
        //     {
        //         "id": 1,
        //         "accountId": 1,
        //         "market": "BTC-USD",
        //         "side": "LONG",
        //         "leverage": "10",
        //         "size": "0.1",
        //         "value": "4000",
        //         "openPrice": "39000",
        //         "markPrice": "40000",
        //         "liquidationPrice": "38200",
        //         "margin": "20",
        //         "unrealisedPnl": "1000",
        //         "realisedPnl": "1.2",
        //         "tpTriggerPrice": "41000",
        //         "tpLimitPrice": "41500",
        //         "slTriggerPrice": "39500",
        //         "slLimitPrice": "39000",
        //         "adl": "2.5",
        //         "maxPositionSize": "0.2",
        //         "createdAt": 1701563440000,
        //         "updatedAt": 1701563440000
        //     }
        //
        const marketId = this.safeString (position, 'market');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (position, 'createdAt', 'createdTime');
        let lastUpdateTimestamp = this.safeInteger2 (position, 'updatedAt', 'updatedTime');
        lastUpdateTimestamp = this.safeInteger (position, 'closedTime', lastUpdateTimestamp);
        const side = this.safeStringLower (position, 'side');
        const margin = this.safeString (position, 'margin');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'initialMargin': margin,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeString (position, 'openPrice'),
            'notional': this.safeString (position, 'value'),
            'leverage': this.safeString (position, 'leverage'),
            'unrealizedPnl': this.safeString (position, 'unrealisedPnl'),
            'realizedPnl': this.safeString (position, 'realisedPnl'),
            'contracts': this.safeString (position, 'size'),
            'contractSize': this.safeString (market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeString (position, 'liquidationPrice'),
            'markPrice': this.safeString (position, 'markPrice'),
            'lastPrice': this.safeString (position, 'exitPrice'),
            'collateral': margin,
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': this.safeString (position, 'slTriggerPrice'),
            'takeProfitPrice': this.safeString (position, 'tpTriggerPrice'),
        });
    }

    getExtendedStarkAmount (amount: string, resolution, roundUp = false): string {
        const resolutionString = this.numberToString (resolution);
        const precise = Precise.stringMul (amount, resolutionString);
        let result = this.decimalToPrecision (precise, TRUNCATE, 0, DECIMAL_PLACES, NO_PADDING);
        if (roundUp && Precise.stringGt (precise, result)) {
            result = Precise.stringAdd (result, '1');
        }
        return result;
    }

    async createExtendedOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: Num, price: Num = undefined, params = {}): Promise<Dict> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const uppercaseSide = side.toUpperCase ();
        if (!this.inArray (uppercaseType, [ 'LIMIT', 'MARKET' ])) {
            throw new BadRequest (this.id + ' createOrder() supports limit and market orders only');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument');
        }
        const amountString = this.amountToPrecision (symbol, amount);
        const priceString = this.priceToPrecision (symbol, price);
        const postOnly = this.isPostOnly (uppercaseType === 'MARKET', undefined, params);
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only', false);
        let timeInForce = this.safeStringUpper (params, 'timeInForce');
        if (timeInForce === undefined) {
            timeInForce = (uppercaseType === 'MARKET') ? 'IOC' : 'GTT';
        }
        const fee = this.safeString (params, 'fee', '0.0005');
        let builderFee = undefined;
        let builderId = undefined;
        [ builderFee, params ] = this.handleOptionAndParams (params, 'createOrder', 'builderFee', '0.00025');
        [ builderId, params ] = this.handleOptionAndParams (params, 'createOrder', 'builderId', 'TODO:BUILDERID');
        const totalFee = Precise.stringAdd (fee, builderFee);
        const now = this.milliseconds ();
        const expiryEpochMillis = this.safeInteger (params, 'expiryEpochMillis', now + 3600000);
        const settlementExpiration = this.safeInteger (params, 'settlementExpiration', this.parseToInt ((expiryEpochMillis + 999) / 1000) + 1209600);
        const nonce = this.numberToString (this.nonce ());
        const account = await this.v1PrivateGetUserAccountInfo ();
        const accountData = this.safeDict (account, 'data', {});
        const starkKey = this.safeString (accountData, 'l2Key');
        const collateralPosition = this.safeString (accountData, 'l2Vault');
        const info = this.safeDict (market, 'info', {});
        const l2Config = this.safeDict (info, 'l2Config', {});
        const syntheticId = this.safeString (l2Config, 'syntheticId');
        const collateralId = this.safeString (l2Config, 'collateralId');
        const syntheticResolution = this.safeValue (l2Config, 'syntheticResolution');
        const collateralResolution = this.safeValue (l2Config, 'collateralResolution');
        if ((syntheticId === undefined) || (collateralId === undefined) || (syntheticResolution === undefined) || (collateralResolution === undefined)) {
            throw new BadRequest (this.id + ' createOrder() requires l2Config in market info');
        }
        const isBuy = (uppercaseSide === 'BUY');
        const quoteAmount = Precise.stringMul (amountString, priceString);
        const baseRoundUp = isBuy;
        const quoteRoundUp = isBuy;
        let baseAmount = this.getExtendedStarkAmount (amountString, syntheticResolution, baseRoundUp);
        let collateralAmount = this.getExtendedStarkAmount (quoteAmount, collateralResolution, quoteRoundUp);
        if (isBuy) {
            collateralAmount = Precise.stringNeg (collateralAmount);
        } else {
            baseAmount = Precise.stringNeg (baseAmount);
        }
        const feeAmount = this.getExtendedStarkAmount (Precise.stringMul (totalFee, quoteAmount), collateralResolution, true);
        const settlement = {
            'starkKey': starkKey,
            'collateralPosition': collateralPosition,
            'baseAssetId': syntheticId,
            'baseAmount': baseAmount,
            'quoteAssetId': collateralId,
            'quoteAmount': collateralAmount,
            'feeAssetId': collateralId,
            'feeAmount': feeAmount,
            'expiration': this.numberToString (settlementExpiration),
            'salt': nonce,
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_id', this.uuid ());
        const request: Dict = {
            'id': clientOrderId,
            'market': market['id'],
            'type': uppercaseType,
            'side': uppercaseSide,
            'qty': amountString,
            'price': priceString,
            'timeInForce': timeInForce,
            'expiryEpochMillis': expiryEpochMillis,
            'fee': fee,
            'nonce': nonce,
            'settlement': settlement,
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'selfTradeProtectionLevel': 'ACCOUNT',
            'builderFee': builderFee,
            'builderId': builderId,
        };
        const cancelId = this.safeString2 (params, 'cancelId', 'previousOrderId');
        if (cancelId !== undefined) {
            request['cancelId'] = cancelId;
        }
        params = this.omit (params, [ 'clientOrderId', 'client_id', 'timeInForce', 'postOnly', 'reduceOnly', 'reduce_only', 'fee', 'nonce', 'expiryEpochMillis', 'settlementExpiration', 'cancelId', 'previousOrderId', 'brokerId', 'referralCode' ]);
        return {
            'request': this.extend (request, params),
            'market': market,
            'timestamp': now,
            'clientOrderId': clientOrderId,
            'price': priceString,
            'amount': amountString,
        };
    }

    /**
     * @method
     * @name extended#createOrder
     * @description create a trade order
     * @see https://api.docs.extended.exchange/#create-or-edit-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, required for all order types
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, sent as the exchange order id
     * @param {string} [params.cancelId] previous external order id to replace
     * @param {string} [params.timeInForce] 'GTT' or 'IOC'
     * @param {boolean} [params.postOnly] true if the order should only make liquidity
     * @param {boolean} [params.reduceOnly] true if the order should only reduce a position
     * @param {string} [params.fee] max fee rate for the order, default is 0.0005
     * @param {int} [params.expiryEpochMillis] order expiration timestamp in milliseconds, default is now + 1 hour
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        const extendedOrderRequest = await this.createExtendedOrderRequest (symbol, type, side, amount, price, params);
        const request = this.safeDict (extendedOrderRequest, 'request', {});
        const response = await this.v1PrivatePostUserOrder (request);
        //
        //     {
        //         "status": "OK",
        //         "data": {
        //             "id": "2051479786538188800",
        //             "externalId": "3480985089570526249141260266819446928410958787024864860785196119336740291620"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const market = extendedOrderRequest['market'] as Market;
        const now = this.safeInteger (extendedOrderRequest, 'timestamp');
        const priceString = this.safeString (extendedOrderRequest, 'price');
        const amountString = this.safeString (extendedOrderRequest, 'amount');
        return this.safeOrder ({
            'info': response,
            'id': this.safeString (data, 'externalId'),
            'clientOrderId': this.safeString (data, 'id'),
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'status': 'open',
        }, market);
    }

    /**
     * @method
     * @name extended#editOrder
     * @description edit a trade order
     * @see https://api.docs.extended.exchange/#create-or-edit-order
     * @param {string} id the external order id to replace
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an id argument');
        }
        let expiryEpochMillis = this.safeInteger (params, 'expiryEpochMillis');
        let postOnly = this.safeBool (params, 'postOnly');
        let reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only');
        if ((amount === undefined) || (price === undefined) || (expiryEpochMillis === undefined) || (postOnly === undefined) || (reduceOnly === undefined)) {
            const response = await this.v1PrivateGetUserOrdersExternalExternalId ({ 'externalId': id });
            const data = this.safeList (response, 'data', []);
            const order = this.safeDict (data, 0, {});
            if (amount === undefined) {
                amount = this.safeNumber (order, 'qty');
            }
            if (price === undefined) {
                price = this.safeNumber (order, 'price');
            }
            if (expiryEpochMillis === undefined) {
                expiryEpochMillis = this.safeInteger (order, 'expireTime');
            }
            if (postOnly === undefined) {
                postOnly = this.safeBool (order, 'postOnly', false);
            }
            if (reduceOnly === undefined) {
                reduceOnly = this.safeBool (order, 'reduceOnly', false);
            }
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount argument or an existing order with qty');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a price argument or an existing order with price');
        }
        params = this.extend ({
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
        }, params);
        const requestParams = this.extend (params, {
            'cancelId': id,
            'expiryEpochMillis': expiryEpochMillis,
        });
        const extendedOrderRequest = await this.createExtendedOrderRequest (symbol, type, side, amount, price, requestParams);
        const request = this.safeDict (extendedOrderRequest, 'request', {});
        const editResponse = await this.v1PrivatePostUserOrder (request);
        //
        //     {
        //         "status": "OK",
        //         "data": {
        //             "id": "2051479786538188800",
        //             "externalId": "3480985089570526249141260266819446928410958787024864860785196119336740291620"
        //         }
        //     }
        //
        const responseData = this.safeDict (editResponse, 'data', {});
        const market = extendedOrderRequest['market'] as Market;
        const now = this.safeInteger (extendedOrderRequest, 'timestamp');
        const priceString = this.safeString (extendedOrderRequest, 'price');
        const amountString = this.safeString (extendedOrderRequest, 'amount');
        return this.safeOrder ({
            'info': editResponse,
            'id': this.safeString (responseData, 'externalId'),
            'clientOrderId': this.safeString (responseData, 'id'),
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'status': 'open',
        }, market);
    }

    /**
     * @method
     * @name extended#cancelOrder
     * @description cancels an open order
     * @see https://api.docs.extended.exchange/#cancel-order-by-id
     * @see https://api.docs.extended.exchange/#cancel-order-by-external-id
     * @param {string} id order id assigned by Extended
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] user-defined order id, cancels by external id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let response = undefined;
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_id');
        params = this.omit (params, [ 'clientOrderId', 'client_id' ]);
        if (clientOrderId !== undefined) {
            const request: Dict = {
                'externalId': clientOrderId,
            };
            response = await this.v1PrivateDeleteUserOrder (this.extend (request, params));
        } else {
            if (id === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires an id argument');
            }
            const request: Dict = {
                'id': id,
            };
            response = await this.v1PrivateDeleteUserOrderId (this.extend (request, params));
        }
        //
        //     {
        //         "status": "OK"
        //     }
        //
        const orderId = (clientOrderId === undefined) ? id : undefined;
        const orderSymbol = (market === undefined) ? symbol : market['symbol'];
        return this.safeOrder ({
            'info': response,
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': undefined,
            'datetime': undefined,
            'symbol': orderSymbol,
            'status': 'canceled',
        }, market);
    }

    /**
     * @method
     * @name extended#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.docs.extended.exchange/#get-order-by-id
     * @see https://api.docs.extended.exchange/#get-orders-by-external-id
     * @param {string} id order id assigned by Extended
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] user-defined order id, fetches by external id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let response = undefined;
        let order = undefined;
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_id');
        params = this.omit (params, [ 'clientOrderId', 'client_id' ]);
        if (clientOrderId !== undefined) {
            const request: Dict = {
                'externalId': clientOrderId,
            };
            response = await this.v1PrivateGetUserOrdersExternalExternalId (this.extend (request, params));
            const data = this.safeList (response, 'data', []);
            order = this.safeDict (data, 0, {});
        } else {
            if (id === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires an id argument');
            }
            const request: Dict = {
                'id': id,
            };
            response = await this.v1PrivateGetUserOrdersId (this.extend (request, params));
            order = this.safeDict (response, 'data', {});
        }
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name extended#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.docs.extended.exchange/#get-open-orders
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.v1PrivateGetUserOrders (this.extend (request, params));
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "id": 1775511783722512384,
        //           "accountId": 3017,
        //           "externalId": "2554612759479898620327573136214120486511160383028978112799136270841501275076",
        //           "market": "ETH-USD",
        //           "type": "LIMIT",
        //           "side": "BUY",
        //           "status": "PARTIALLY_FILLED",
        //           "price": "3300",
        //           "averagePrice": "3297.00",
        //           "qty": "0.2",
        //           "filledQty": "0.1",
        //           "payedFee": "0.0120000000000000",
        //           "reduceOnly": false,
        //           "postOnly": false,
        //           "createdTime": 1701563440000,
        //           "updatedTime": 1701563440000,
        //           "timeInForce": "IOC",
        //           "expireTime": 1712754771819
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const orders = this.parseOrders (data, market, since, limit);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    /**
     * @method
     * @name extended#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.docs.extended.exchange/#get-orders-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchOrders', symbol, since, limit, params, 'cursor', 'cursor', undefined, 100) as Order[];
        }
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserOrdersHistory (this.extend (params, request));
        //
        //     {
        //       "status": "OK",
        //       "data": [
        //         {
        //           "id": 1784963886257016832,
        //           "externalId": "ExtId-1",
        //           "accountId": 1,
        //           "market": "BTC-USD",
        //           "status": "FILLED",
        //           "type": "LIMIT",
        //           "side": "BUY",
        //           "price": "39000",
        //           "averagePrice": "39000",
        //           "qty": "0.2",
        //           "filledQty": "0.1",
        //           "payedFee": "0.0120000000000000",
        //           "reduceOnly": false,
        //           "postOnly": false,
        //           "createdTime": 1701563440000,
        //           "updatedTime": 1701563440000,
        //           "timeInForce": "IOC",
        //           "expireTime": 1706563440
        //         }
        //       ],
        //       "pagination": {
        //         "cursor": 1784963886257016832,
        //         "count": 1
        //       }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const pagination = this.safeDict (response, 'pagination', {});
        const cursor = this.safeValue (pagination, 'cursor');
        if ((cursor !== undefined) && (data.length > 0)) {
            const lastIndex = data.length - 1;
            data[lastIndex] = this.extend (data[lastIndex], { 'cursor': cursor });
        }
        const orders = this.parseOrders (data, market, since, limit);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    /**
     * @method
     * @name extended#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api.docs.extended.exchange/#get-orders-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        const closedOrders = this.filterBy (orders, 'status', 'closed') as Order[];
        return this.filterBySymbolSinceLimit (closedOrders, symbol, since, limit);
    }

    /**
     * @method
     * @name extended#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://api.docs.extended.exchange/#get-orders-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        const canceledOrders = this.filterBy (orders, 'status', 'canceled') as Order[];
        return this.filterBySymbolSinceLimit (canceledOrders, symbol, since, limit);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'UNTRIGGERED': 'open',
            'TRIGGERED': 'open',
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "id": 1784963886257016832,
        //         "externalId": "ExtId-1",
        //         "accountId": 1,
        //         "market": "BTC-USD",
        //         "status": "FILLED",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "price": "39000",
        //         "averagePrice": "39000",
        //         "qty": "0.2",
        //         "filledQty": "0.1",
        //         "payedFee": "0.0120000000000000",
        //         "reduceOnly": false,
        //         "postOnly": false,
        //         "trigger": {
        //             "triggerPrice": "34000",
        //             "triggerPriceType": "LAST",
        //             "triggerPriceDirection": "UP",
        //             "executionPriceType": "MARKET"
        //         },
        //         "takeProfit": {
        //             "triggerPrice": "34000",
        //             "triggerPriceType": "LAST",
        //             "price": "35000",
        //             "priceType": "MARKET"
        //         },
        //         "stopLoss": {
        //             "triggerPrice": "34000",
        //             "triggerPriceType": "LAST",
        //             "price": "35000",
        //             "priceType": "MARKET"
        //         },
        //         "createdTime": 1701563440000,
        //         "updatedTime": 1701563440000,
        //         "timeInForce": "IOC",
        //         "expireTime": 1706563440
        //     }
        //
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'createdTime');
        const lastUpdateTimestamp = this.safeInteger (order, 'updatedTime');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeStringLower (order, 'side');
        const type = this.safeStringLower (order, 'type');
        const amount = this.safeString (order, 'qty');
        const filled = this.safeString (order, 'filledQty');
        const feeCost = this.safeString (order, 'payedFee');
        const trigger = this.safeDict (order, 'trigger', {});
        const takeProfit = this.safeDict (order, 'takeProfit', {});
        const stopLoss = this.safeDict (order, 'stopLoss', {});
        const fee = {
            'cost': feeCost,
            'currency': (market === undefined) ? undefined : market['settle'],
        };
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'externalId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': this.safeBool (order, 'postOnly'),
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': side,
            'price': this.safeString (order, 'price'),
            'triggerPrice': this.safeString (trigger, 'triggerPrice'),
            'takeProfitPrice': this.safeString (takeProfit, 'triggerPrice'),
            'stopLossPrice': this.safeString (stopLoss, 'triggerPrice'),
            'amount': amount,
            'cost': undefined,
            'average': this.safeString (order, 'averagePrice'),
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    getExtendedStringToFelt (value: string) {
        return this.convertToBigInt ('0x' + this.binaryToBase16 (this.encode (value)));
    }

    getExtendedEncodeI64 (value) {
        // Cairo prime for i64 negative encoding: negative n becomes PRIME + n.
        const PRIME = this.convertToBigInt ('0x800000000000011000000000000000000000000000000000000000000000001');
        const zero = this.convertToBigInt ('0');
        if (value < zero) {
            return PRIME + value;
        }
        return value;
    }

    getExtendedOrderMsgHash (settlement: Dict): string {
        const orderTypeHash = this.convertToBigInt (this.starknetGetSelectorFromName (
            '"Order"("position_id":"felt","base_asset_id":"AssetId","base_amount":"i64","quote_asset_id":"AssetId","quote_amount":"i64","fee_asset_id":"AssetId","fee_amount":"u64","expiration":"Timestamp","salt":"felt")"PositionId"("value":"u32")"AssetId"("value":"felt")"Timestamp"("seconds":"u64")'
        ));
        const domainTypeHash = this.convertToBigInt (this.starknetGetSelectorFromName (
            '"StarknetDomain"("name":"shortstring","version":"shortstring","chainId":"shortstring","revision":"shortstring")'
        ));
        // Domain: revision is encoded as integer 1, not as shortstring
        const isTestnet = this.urls['api']['rest'].indexOf ('sepolia') >= 0;
        const defaultChainId = isTestnet ? 'SN_SEPOLIA' : 'SN_MAIN';
        const chainId = this.safeString (this.options, 'chainId', defaultChainId);
        const domainHash = this.convertToBigInt (this.starknetComputePoseidonHashOnElements ([
            domainTypeHash,
            this.getExtendedStringToFelt ('Perpetuals'),
            this.getExtendedStringToFelt ('v0'),
            this.getExtendedStringToFelt (chainId),
            this.convertToBigInt ('1'),
        ]));
        // Order fields
        const positionId = this.convertToBigInt (this.safeString (settlement, 'collateralPosition'));
        const baseAssetId = this.safeString (settlement, 'baseAssetId');
        const baseAmount = this.convertToBigInt (this.safeString (settlement, 'baseAmount'));
        const quoteAssetId = this.safeString (settlement, 'quoteAssetId');
        const quoteAmount = this.convertToBigInt (this.safeString (settlement, 'quoteAmount'));
        const feeAssetId = this.safeString (settlement, 'feeAssetId');
        const feeAmount = this.convertToBigInt (this.safeString (settlement, 'feeAmount'));
        const expiration = this.convertToBigInt (this.safeString2 (settlement, 'expiration', 'expirationTimestamp'));
        const salt = this.convertToBigInt (this.safeString2 (settlement, 'salt', 'nonce'));
        const starkKey = this.convertToBigInt (this.safeString (settlement, 'starkKey'));
        // Order struct hash
        const orderHash = this.convertToBigInt (this.starknetComputePoseidonHashOnElements ([
            orderTypeHash,
            positionId,
            this.convertToBigInt (baseAssetId),
            this.getExtendedEncodeI64 (baseAmount),
            this.convertToBigInt (quoteAssetId),
            this.getExtendedEncodeI64 (quoteAmount),
            this.convertToBigInt (feeAssetId),
            feeAmount,
            expiration,
            salt,
        ]));
        // SNIP-12 final message hash: poseidon('StarkNet Message', domainHash, starkKey, orderHash)
        return this.starknetComputePoseidonHashOnElements ([
            this.getExtendedStringToFelt ('StarkNet Message'),
            domainHash,
            starkKey,
            orderHash,
        ]);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString (api, 0);
        const accessibility = this.safeString (api, 1);
        const endpoint = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api']['rest']);
        if (accessibility === 'private') {
            this.checkRequiredCredentials ();
            headers = {
                'X-Api-Key': this.apiKey,
            };
            if ((method === 'POST') || (method === 'PATCH')) {
                const settlement = this.safeDict (query, 'settlement');
                if (settlement !== undefined && this.safeDict (settlement, 'signature') === undefined) {
                    if ((this.privateKey === undefined) || (this.privateKey === '')) {
                        throw new ArgumentsRequired (this.id + ' sign() requires a privateKey credential to sign the settlement');
                    }
                    const msgHash = this.getExtendedOrderMsgHash (settlement);
                    const sig = JSON.parse (this.starknetSign (msgHash, this.privateKey));
                    const r = '0x' + this.intToBase16 (this.convertToBigInt (sig[0]));
                    const s = '0x' + this.intToBase16 (this.convertToBigInt (sig[1]));
                    query['settlement'] = {
                        'signature': { 'r': r, 's': s },
                        'starkKey': this.safeString (settlement, 'starkKey'),
                        'collateralPosition': this.safeString (settlement, 'collateralPosition'),
                    };
                }
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        url = url + '/api/' + version + endpoint;
        if ((method === 'GET' || method === 'DELETE') && Object.keys (query).length) {
            url += '?' + this.urlencodeWithArrayRepeat (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
