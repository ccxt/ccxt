'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var extended$1 = require('./abstract/extended.js');
var Precise = require('./base/Precise.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class extended
 * @augments Exchange
 */
class extended extends extended$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'extended',
            'name': 'Extended',
            'countries': ['SG'],
            'version': 'v2',
            'rateLimit': 600, // Default Tier 1,000 requests/minute ≈ 1.67 request per second
            'precisionMode': number.TICK_SIZE,
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
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
                'fetchAccounts': true,
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
                'fetchDeposits': true,
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
                'fetchLedger': true,
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
                'fetchTransfers': true,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
            },
            'features': {},
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
                'logo': 'https://github.com/user-attachments/assets/e2fe2bdf-6b28-4af8-b30f-38db496dc079',
                'api': {
                    'rest': 'https://api.starknet.{hostname}',
                },
                'test': {
                    'rest': 'https://api.starknet.sepolia.{hostname}',
                },
                'www': 'https://app.extended.exchange',
                'doc': 'https://api.docs.extended.exchange',
                'fees': 'https://docs.extended.exchange/extended-resources/trading/trading-fees-and-rebates',
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
                            'user/accounts',
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
                            'builder/trades',
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
                'taker': this.parseNumber('0.002'),
                'maker': this.parseNumber('0.002'),
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {
                    '1000': errors.InvalidOrder, // Asset not found.
                    '1001': errors.InvalidOrder, // Market not found.
                    '1002': errors.InvalidOrder, // Market is disabled.
                    '1003': errors.InvalidOrder, // Market group not found.
                    '1004': errors.InvalidOrder, // Account not found.
                    '1005': errors.InvalidOrder, // Not supported interval.
                    '1006': errors.ExchangeError, // Application error.
                    '1008': errors.InvalidOrder, // Client not found.
                    '1009': errors.InvalidOrder, // Action is not allowed.
                    '1010': errors.ExchangeError, // Maintenance mode.
                    '1011': errors.InvalidOrder, // Post only mode.
                    '1012': errors.InvalidOrder, // Reduce only mode.
                    '1013': errors.InvalidOrder, // Percentage should be between 0 and 1.
                    '1014': errors.InvalidOrder, // Market is in reduce only mode, non-reduce only orders are not allowed.
                    '1049': errors.InvalidOrder, // Leverage below min leverage.
                    '1050': errors.InvalidOrder, // Leverage exceeds max leverage.
                    '10501': errors.InvalidOrder, // Max position value exceeded for new leverage.
                    '1052': errors.InvalidOrder, // Insufficient margin for new leverage.
                    '1053': errors.InvalidOrder, // Leverage has invalid precision.
                    '1100': errors.InvalidOrder, // Invalid Starknet public key.
                    '1101': errors.InvalidOrder, // Invalid Starknet signature.
                    '1102': errors.InvalidOrder, // Invalid Starknet vault.
                    '1120': errors.InvalidOrder, // Order quantity less than min trade size, based on market-specific trading rules.
                    '1121': errors.InvalidOrder, // Invalid quantity due to the wrong size increment, based on market-specific Minimum Change in Trade Size trading rule.
                    '1122': errors.InvalidOrder, // Order value exceeds max order value, based on market-specific trading rules.
                    '1123': errors.InvalidOrder, // Invalid quantity precision, currently equals to market-specific Minimum Change in Trade Size.
                    '1124': errors.InvalidOrder, // Invalid price due to wrong price movement, based on market-specific Minimum Price Change trading rule.
                    '1125': errors.InvalidOrder, // Invalid price precision, currently equals to market-specific Minimum Price Change.
                    '1126': errors.InvalidOrder, // Max open orders number exceeded, currently 200 orders per market.
                    '1127': errors.InvalidOrder, // Max position value exceeded, based on the Margin schedule.
                    '1128': errors.InvalidOrder, // Trading fees are invalid. Refer to Order management section for details.
                    '1129': errors.InvalidOrder, // Invalid quantity for position TP/SL.
                    '1130': errors.InvalidOrder, // Order price is missing.
                    '1131': errors.InvalidOrder, // TP/SL order trigger is missing.
                    '1132': errors.InvalidOrder, // Order type is not allowed.
                    '1133': errors.InvalidOrder, // Invalid order parameters.
                    '1134': errors.InvalidOrder, // Duplicate Order.
                    '1135': errors.InvalidOrder, // Order expiration date must be within 90 days for the Mainnet, 28 days for the Testnet.
                    '1136': errors.InvalidOrder, // Reduce-only order size exceeds open position size.
                    '1137': errors.InvalidOrder, // Position is missing for a reduce-only order.
                    '1138': errors.InvalidOrder, // Position is the same side as a reduce-only order.
                    '1139': errors.InvalidOrder, // Market order must have time in force IOC.
                    '1140': errors.InsufficientFunds, // New order cost exceeds available balance.
                    '1141': errors.InvalidOrder, // Invalid price value.
                    '1142': errors.InvalidOrder, // Edit order not found.
                    '1143': errors.InvalidOrder, // Conditional order trigger is missing.
                    '1144': errors.InvalidOrder, // Conditional market order can't be Post-only.
                    '1145': errors.InvalidOrder, // Non reduce-only orders are not allowed.
                    '1146': errors.InvalidOrder, // Twap order must have time in force GTT.
                    '1147': errors.InvalidOrder, // Open loss exceeds equity.
                    '1148': errors.InvalidOrder, // TP/SL open loss exceeds equity.
                    '1500': errors.InvalidOrder, // Account not selected.
                    '1600': errors.BadRequest, // Withdrawal amount must be positive.
                    '1601': errors.BadRequest, // Withdrawal description is too long.
                    '1602': errors.BadRequest, // Withdrawal request does not match settlement.
                    '1604': errors.BadRequest, // Withdrawal expiration time is below the 14 days minimum.
                    '1605': errors.BadRequest, // Withdrawal asset is not valid.
                    '1607': errors.BadRequest, // Withdrawals blocked for the account. Please contact the team on Discord to unblock the withdrawals.
                    '1608': errors.BadRequest, // The withdrawal address does not match the account address.
                    '1650': errors.BadRequest, // Vault transfer amount is incorrect.
                    '1700': errors.BadRequest, // Referral code already exist.
                    '1701': errors.BadRequest, // Referral code is not valid.
                    '1703': errors.BadRequest, // Referral program is not enabled.
                    '1704': errors.BadRequest, // Referral code already applied.
                },
                'broad': {},
            },
            'options': {
                'builderFee': true,
                'builderFeeRate': '0.0001',
                'builderId': '257624',
            },
        });
    }
    async loadMarkets(reload = false, params = {}) {
        const markets = await super.loadMarkets(reload, params);
        const currenciesByNumericId = this.safeDict(this.options, 'currenciesByNumericId');
        if ((currenciesByNumericId === undefined) || reload) {
            this.options['currenciesByNumericId'] = this.indexByStringifiedNumericId(this.currencies);
        }
        return markets;
    }
    indexByStringifiedNumericId(input) {
        const result = {};
        if (input === undefined) {
            return undefined;
        }
        const keys = Object.keys(input);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const item = input[key];
            const numericIdString = this.safeString(item, 'numericId');
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
    async fetchMarkets(params = {}) {
        const response = await this.v1PublicGetInfoMarkets(params);
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
        const data = this.safeList(response, 'data', []);
        return this.parseMarkets(data);
    }
    parseMarket(market) {
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
        const tradingConfig = this.safeDict(market, 'tradingConfig', {});
        const marketId = this.safeString(market, 'name');
        let baseId = this.safeString(market, 'assetName', '');
        if (baseId.indexOf('SPOT') >= 0) {
            baseId = baseId.replace('SPOT', '');
        }
        const quoteId = this.safeString(market, 'collateralAssetName');
        const base = this.safeCurrencyCode(baseId);
        let quote = this.safeCurrencyCode(quoteId);
        if (quoteId === 'USD') {
            quote = 'USDC';
        }
        const status = this.safeString(market, 'status');
        const active = (status === 'ACTIVE');
        const amountPrecision = this.safeNumber(tradingConfig, 'minOrderSizeChange');
        const pricePrecision = this.safeNumber(tradingConfig, 'minPriceChange');
        const maxLeverage = this.safeNumber(tradingConfig, 'maxLeverage');
        const minAmount = this.safeNumber(tradingConfig, 'minOrderSize');
        const maxCost = this.safeNumber(tradingConfig, 'maxLimitOrderValue');
        const created = this.safeInteger(market, 'createdAt');
        let settleId = undefined;
        let settle = undefined;
        let symbol = base + '/' + quote;
        let isSpot = false;
        let type = this.safeStringLower(market, 'type');
        let contractSize = undefined;
        let linear = undefined;
        let inverse = undefined;
        if (type === 'spot') {
            isSpot = true;
        }
        else {
            type = 'swap';
            settleId = quoteId;
            settle = quote;
            symbol += ':' + settle;
            contractSize = this.parseNumber('1');
            linear = true;
            inverse = false;
        }
        return this.safeMarketStructure({
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
            'margin': false,
            'swap': !isSpot,
            'future': false,
            'option': false,
            'active': active,
            'contract': !isSpot,
            'linear': linear,
            'inverse': inverse,
            'taker': this.safeNumber(this.fees, 'taker'),
            'maker': this.safeNumber(this.fees, 'maker'),
            'contractSize': contractSize,
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
                    'min': this.parseNumber('1'),
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
    async fetchCurrencies(params = {}) {
        const response = await this.v1PublicGetInfoAssets(params);
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
        const data = this.safeList(response, 'data', []);
        return this.parseCurrencies(data);
    }
    parseCurrency(currency) {
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
        let currencyId = this.safeString(currency, 'symbol');
        if ((currencyId !== undefined) && (currencyId.indexOf('SPOT') >= 0)) {
            currencyId = currencyId.replace('SPOT', '');
        }
        let code = this.safeCurrencyCode(currencyId);
        if (currencyId === 'USD') {
            code = 'USDC';
        }
        const name = this.safeString(currency, 'name');
        const precision = this.safeInteger(currency, 'precision', 0);
        const isActive = this.safeBool(currency, 'isActive');
        return this.safeCurrencyStructure({
            'id': currencyId,
            'code': code,
            'numericId': this.safeInteger(currency, 'id'),
            'name': name,
            'active': isActive,
            'deposit': true,
            'withdraw': true,
            'precision': Math.pow(10, precision * -1),
            'type': 'other',
            'margin': this.safeBool(currency, 'canBeUsedAsCollateral'),
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
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetInfoMarketsMarketStats(this.extend(request, params));
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
        const data = this.safeDict(response, 'data', {});
        return this.parseTicker(data, market);
    }
    /**
     * @method
     * @name extended#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for all markets
     * @see https://api.docs.extended.exchange/#get-markets
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            const marketIds = [];
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market(symbols[i]);
                marketIds.push(market['id']);
            }
            request['market'] = marketIds;
        }
        const response = await this.v1PublicGetInfoMarkets(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        const tickers = {};
        for (let i = 0; i < data.length; i++) {
            const marketData = data[i];
            const marketId = this.safeString(marketData, 'name');
            const market = this.safeMarket(marketId);
            const stats = this.safeDict(marketData, 'marketStats', {});
            const ticker = this.parseTicker(stats, market);
            const symbol = ticker['symbol'];
            if (symbol !== undefined) {
                tickers[symbol] = ticker;
            }
        }
        return this.filterByArrayTickers(tickers, 'symbol', symbols);
    }
    parseTicker(ticker, market = undefined) {
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
        const symbol = this.safeSymbol(undefined, market);
        const last = this.safeNumber(ticker, 'lastPrice');
        const percentageRaw = this.safeString(ticker, 'dailyPriceChangePercentage');
        const percentage = (percentageRaw !== undefined) ? Precise["default"].stringMul(percentageRaw, '100') : undefined;
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeNumber(ticker, 'dailyHigh'),
            'low': this.safeNumber(ticker, 'dailyLow'),
            'bid': this.safeNumber(ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeNumber(ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeNumber(ticker, 'dailyPriceChange'),
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeNumber(ticker, 'dailyVolumeBase'),
            'quoteVolume': this.safeNumber(ticker, 'dailyVolume'),
            'markPrice': this.safeNumber(ticker, 'markPrice'),
            'indexPrice': this.safeNumber(ticker, 'indexPrice'),
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
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetInfoMarketsMarketOrderbook(this.extend(request, params));
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
        const data = this.safeDict(response, 'data', {});
        const timestamp = this.milliseconds();
        const orderbook = this.parseOrderBook(data, market['symbol'], timestamp, 'bid', 'ask', 'price', 'qty');
        if (limit !== undefined) {
            orderbook['bids'] = this.arraySlice(orderbook['bids'], 0, limit);
            orderbook['asks'] = this.arraySlice(orderbook['asks'], 0, limit);
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
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetInfoMarketsMarketTrades(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
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
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchMyTrades', symbol, since, limit, params, 'cursor', 'cursor', undefined, 100);
        }
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserTrades(this.extend(params, request));
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
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'cursor');
        const result = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === dataLength - 1)) {
                entry = this.extend(entry, { 'cursor': cursor });
            }
            result.push(entry);
        }
        return this.parseTrades(result, market, since, limit);
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
     * @returns {FundingHistory[]} a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchFundingHistory', symbol, since, limit, params, 'cursor', 'cursor', undefined, 100);
        }
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserFundingHistory(this.extend(params, request));
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
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'cursor');
        const result = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === dataLength - 1)) {
                entry = this.extend(entry, { 'cursor': cursor });
            }
            result.push(entry);
        }
        return this.parseFundingHistories(result, market, since, limit);
    }
    parseFundingHistory(history, market = undefined) {
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
        const marketId = this.safeString(history, 'market');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(history, 'paidTime');
        return {
            'info': history,
            'symbol': market['symbol'],
            'code': market['settle'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(history, 'id'),
            'amount': this.safeNumber(history, 'fundingFee'),
            'rate': this.safeNumber(history, 'fundingRate'),
        };
    }
    parseFundingHistories(histories, market = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < histories.length; i++) {
            result.push(this.parseFundingHistory(histories[i], market));
        }
        const symbol = (market === undefined) ? undefined : market['symbol'];
        return this.filterBySymbolSinceLimit(result, symbol, since, limit);
    }
    parseTrade(trade, market = undefined) {
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
        const marketId = this.safeString2(trade, 'm', 'market');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger2(trade, 'T', 'createdTime');
        const priceString = this.safeString2(trade, 'p', 'price');
        const amountString = this.safeString2(trade, 'q', 'qty');
        const sideRaw = this.safeString2(trade, 'S', 'side');
        const side = (sideRaw !== undefined) ? sideRaw.toLowerCase() : undefined;
        const feeCost = this.safeString(trade, 'fee');
        const fee = (feeCost === undefined) ? undefined : {
            'cost': feeCost,
            'currency': (market === undefined) ? undefined : market['settle'],
        };
        const isTaker = this.safeBool(trade, 'isTaker');
        let takerOrMaker = undefined;
        if (isTaker !== undefined) {
            takerOrMaker = isTaker ? 'taker' : 'maker';
        }
        return this.safeTrade({
            'id': this.safeString2(trade, 'i', 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': this.safeString(trade, 'orderId'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': this.safeString(trade, 'value'),
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
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const price = this.safeString(params, 'price');
        let candleType = this.safeString(params, 'candleType');
        if (candleType === undefined) {
            if (price === 'mark') {
                candleType = 'mark-prices';
            }
            else if (price === 'index') {
                candleType = 'index-prices';
            }
            else {
                candleType = 'trades';
            }
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['candleType', 'price', 'until']);
        const request = {
            'market': market['id'],
            'candleType': candleType,
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
            'limit': (limit !== undefined) ? limit : 100,
        };
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.v1PublicGetInfoCandlesMarketCandleType(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
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
            this.safeInteger(ohlcv, 'T'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
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
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchFundingRateHistory', symbol, since, limit, params, 'cursor', 'cursor', undefined, 10000);
        }
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (limit === undefined) {
            limit = 100;
        }
        const until = this.safeInteger(params, 'until', this.milliseconds());
        const endTime = this.safeInteger(params, 'endTime', until);
        params = this.omit(params, ['endTime', 'until']);
        if (since === undefined) {
            since = endTime - (limit * 60 * 60 * 1000);
        }
        const request = {
            'market': market['id'],
            'startTime': since,
            'endTime': endTime,
            'limit': limit,
        };
        const response = await this.v1PublicGetInfoMarketFunding(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'cursor');
        const result = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === dataLength - 1)) {
                entry = this.extend(entry, { 'cursor': cursor });
            }
            result.push(this.parseFundingRateHistory(entry, market));
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    parseFundingRateHistory(info, market = undefined) {
        //
        //     {
        //       "m": "BTC-USD",
        //       "f": "0.000008",
        //       "T": 1777507201028
        //     }
        //
        const marketId = this.safeString(info, 'm');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(info, 'T');
        return {
            'info': info,
            'symbol': market['symbol'],
            'fundingRate': this.safeNumber(info, 'f'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
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
     * @returns {object[]} an array of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterestHistory(symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const interval = this.safeString(this.timeframes, timeframe);
        if (!this.inArray(interval, ['PT1H', 'P1D'])) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterestHistory() supports 1h and 1d timeframes only');
        }
        if (limit === undefined) {
            limit = 100;
        }
        const until = this.safeInteger(params, 'until', this.milliseconds());
        const endTime = this.safeInteger(params, 'endTime', until);
        params = this.omit(params, ['endTime', 'until']);
        if (since === undefined) {
            since = endTime - (limit * this.parseTimeframe(timeframe) * 1000);
        }
        const request = {
            'market': market['id'],
            'interval': interval,
            'startTime': since,
            'endTime': endTime,
            'limit': limit,
        };
        const response = await this.v1PublicGetInfoMarketOpenInterests(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        return this.parseOpenInterestsHistory(data, market, since, limit);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //     {
        //       "i": "112620590.6060360000000000",
        //       "I": "1473.1408400000000000",
        //       "t": 1777420800000
        //     }
        //
        const timestamp = this.safeInteger(interest, 't');
        return this.safeOpenInterest({
            'symbol': this.safeString(market, 'symbol'),
            'openInterestAmount': this.safeNumber(interest, 'I'),
            'openInterestValue': this.safeNumber(interest, 'i'),
            'baseVolume': this.safeNumber(interest, 'I'),
            'quoteVolume': this.safeNumber(interest, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetUserSpotBalances(params);
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
        const data = this.safeList(response, 'data', []);
        return this.parseBalance(data);
    }
    parseBalance(response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = this.safeDict(response, i, {});
            const currencyId = this.safeString(balance, 'asset');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'availableToWithdraw');
            account['total'] = this.safeString(balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name extended#fetchAccount
     * @description fetch the current authenticated sub-account
     * @see https://api.docs.extended.exchange/#get-account-details
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [account structure]{@link https://docs.ccxt.com/?id=account-structure}
     */
    async fetchAccount(params = {}) {
        const response = await this.v1PrivateGetUserAccountInfo(params);
        //
        //     {
        //         "status": "OK",
        //         "data": {
        //             "accountId": 3342,
        //             "description": "Main account",
        //             "accountIndex": 0,
        //             "status": "ACTIVE",
        //             "l2Key": "0x...",
        //             "l2Vault": "500343",
        //             "bridgeStarknetAddress": "0x...",
        //             "apiKeys": [
        //                 "..."
        //             ],
        //             "accountIndexForKeyGeneration": 0
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseAccount(data);
    }
    /**
     * @method
     * @name extended#fetchAccounts
     * @description fetch the current authenticated sub-account, extended private endpoints only return records for the authenticated sub-account
     * @see https://api.docs.extended.exchange/#get-sub-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    async fetchAccounts(params = {}) {
        const response = await this.v1PrivateGetUserAccounts(params);
        //
        // {
        //     "status": "OK",
        //     "data": [{
        //         "accountId": 123,
        //         "description": "Main",
        //         "accountIndex": 0,
        //         "status": "ACTIVE",
        //         "l2Key": "0x123",
        //         "l2Vault": "321",
        //         "bridgeStarknetAddress": "0xabc",
        //         "accountIndexForKeyGeneration": 0
        //       }, {
        //         "accountId": 999,
        //         "description": "Vault Balance",
        //         "accountIndex": 1001,
        //         "status": "ACTIVE",
        //         "l2Key": "0x123",
        //         "l2Vault": "999",
        //         "bridgeStarknetAddress": "0xabc",
        //         "accountIndexForKeyGeneration": 0
        //       }
        //     ]}
        //
        const data = this.safeList(response, 'data', []);
        return this.parseAccounts(data);
    }
    parseAccount(account) {
        const accountIndex = this.safeInteger(account, 'accountIndex');
        let type = undefined;
        if (accountIndex !== undefined) {
            type = (accountIndex === 0) ? 'main' : 'subaccount';
        }
        return {
            'id': this.safeString2(account, 'accountId', 'id'),
            'type': type,
            'code': undefined,
            'info': account,
        };
    }
    /**
     * @method
     * @name extended#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [ledger structures]{@link https://docs.ccxt.com/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchLedger', code, since, limit, params, 'cursor', 'cursor', undefined, 50);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserAssetOperations(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'cursor');
        const result = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === dataLength - 1)) {
                entry = this.extend(entry, { 'cursor': cursor });
            }
            result.push(entry);
        }
        return this.parseLedger(result, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
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
        const timestamp = this.safeInteger(item, 'time');
        const assetId = this.safeString(item, 'asset');
        const code = this.getExtendedCurrencyCodeById(assetId, currency);
        const ledgerCurrency = this.safeCurrency(code, currency);
        const amountString = this.safeString(item, 'amount');
        let direction = undefined;
        if (amountString !== undefined) {
            direction = Precise["default"].stringLt(amountString, '0') ? 'out' : 'in';
        }
        let fee = undefined;
        const feeCost = this.safeString(item, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'currency': code,
                'cost': this.parseNumber(Precise["default"].stringAbs(feeCost)),
            };
        }
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString(item, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'direction': direction,
            'account': this.safeString(item, 'accountId'),
            'referenceId': this.safeString(item, 'transactionHash'),
            'referenceAccount': this.safeString(item, 'counterpartyAccountId'),
            'type': this.parseTransactionType(this.safeString(item, 'type')),
            'currency': code,
            'amount': (amountString === undefined) ? undefined : this.parseNumber(Precise["default"].stringAbs(amountString)),
            'before': undefined,
            'after': undefined,
            'status': this.parseTransactionStatus(this.safeString(item, 'status')),
            'fee': fee,
        }, ledgerCurrency);
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
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchTransactions(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTransactions', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchTransactions', code, since, limit, params, 'cursor', 'cursor', undefined, 50);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserAssetOperations(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'cursor');
        const result = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === dataLength - 1)) {
                entry = this.extend(entry, { 'cursor': cursor });
            }
            result.push(entry);
        }
        return this.parseTransactions(result, currency, since, limit);
    }
    /**
     * @method
     * @name extended#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactions(code, since, limit, this.extend({ 'type': 'DEPOSIT' }, params));
    }
    /**
     * @method
     * @name extended#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactions(code, since, limit, this.extend({ 'type': 'WITHDRAWAL' }, params));
    }
    /**
     * @method
     * @name extended#withdraw
     * @description make a Starknet withdrawal
     * @see https://api.docs.extended.exchange/#withdrawals
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the Starknet address to withdraw to
     * @param {string} tag unused
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chainId] only STRK is supported
     * @param {int} [params.settlementExpiration] settlement expiration timestamp in seconds, defaults to now + 14 days + 60 seconds
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        this.checkRequiredCredentials();
        await this.loadMarkets();
        const currency = this.currency(code);
        const chainId = this.safeStringUpper2(params, 'chainId', 'network', 'STRK');
        if (chainId !== 'STRK') {
            throw new errors.BadRequest(this.id + ' withdraw() only supports Starknet withdrawals with chainId STRK');
        }
        if (address.length <= 42) {
            throw new errors.BadRequest(this.id + ' withdraw() requires a Starknet address for STRK withdrawals, EVM withdrawals require the bridge quote flow');
        }
        const account = await this.fetchExtendedAccount();
        const amountString = this.currencyToPrecision(code, amount);
        const accountId = this.safeString(account, 'accountId');
        const settlement = this.createWithdrawalSettlementData(address, amountString, currency, account, params);
        const request = {
            'accountId': accountId,
            'amount': amountString,
            'chainId': chainId,
            'asset': currency['id'],
            'settlement': settlement,
        };
        params = this.omit(params, ['chainId', 'network', 'settlementExpiration', 'nonce', 'recipient', 'positionId', 'l2Vault', 'collateralId', 'resolution']);
        const response = await this.v1PrivatePostUserWithdrawal(this.extend(request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": 1820796462590083072
        //     }
        //
        const now = this.milliseconds();
        return {
            'info': response,
            'id': this.safeString(response, 'data'),
            'txid': undefined,
            'timestamp': now,
            'datetime': this.iso8601(now),
            'address': address,
            'addressFrom': undefined,
            'addressTo': address,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': tag,
            'type': 'withdrawal',
            'amount': this.parseNumber(amountString),
            'currency': currency['code'],
            'status': 'pending',
            'updated': now,
            'fee': undefined,
            'network': chainId,
            'comment': undefined,
            'internal': false,
        };
    }
    /**
     * @method
     * @name extended#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {TransferEntry[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTransfers', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchTransfers', code, since, limit, params, 'cursor', 'cursor', undefined, 50);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {
            'type': 'TRANSFER',
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserAssetOperations(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'cursor');
        const result = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === dataLength - 1)) {
                entry = this.extend(entry, { 'cursor': cursor });
            }
            result.push(entry);
        }
        return this.parseTransfers(result, currency, since, limit);
    }
    /**
     * @method
     * @name extended#transfer
     * @description transfer collateral between sub-accounts associated with the same wallet
     * @see https://api.docs.extended.exchange/#create-transfer
     * @param {string} code unified currency code
     * @param {float} amount the amount to transfer
     * @param {string} fromAccount source account id, defaults to the authenticated account id
     * @param {string} toAccount destination account id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.toVault destination account L2 vault
     * @param {string} params.toL2Key destination account L2 public key
     * @param {int} [params.settlementExpiration] settlement expiration timestamp in seconds, defaults to now + 21 days
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        this.checkRequiredCredentials();
        await this.loadMarkets();
        const currency = this.currency(code);
        const account = await this.fetchExtendedAccount();
        const currentAccountId = this.safeString(account, 'accountId', '');
        if (fromAccount === undefined) {
            fromAccount = currentAccountId;
        }
        else if (fromAccount !== currentAccountId) {
            throw new errors.BadRequest(this.id + ' transfer() can only transfer from the authenticated account');
        }
        const toVault = this.safeString2(params, 'toVault', 'receiverPositionId');
        const toL2Key = this.safeString2(params, 'toL2Key', 'receiverPublicKey');
        if ((toAccount === undefined) || (toVault === undefined) || (toL2Key === undefined)) {
            throw new errors.ArgumentsRequired(this.id + ' transfer() requires a toAccount argument and params["toVault"] and params["toL2Key"]');
        }
        const amountString = this.currencyToPrecision(code, amount);
        const settlement = this.createTransferSettlementData(amountString, currency, account, toVault, toL2Key, params);
        const request = {
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'amount': amountString,
            'transferredAsset': currency['id'],
            'settlement': settlement,
        };
        params = this.omit(params, ['fromVault', 'senderPositionId', 'fromL2Key', 'senderPublicKey', 'toVault', 'receiverPositionId', 'toL2Key', 'receiverPublicKey', 'settlementExpiration', 'nonce', 'assetId', 'collateralId', 'resolution']);
        const response = await this.v1PrivatePostUserTransfer(this.extend(request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": {
        //             "validSignature": true,
        //             "id": 1820778187672010752
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const validSignature = this.safeBool(data, 'validSignature');
        const now = this.milliseconds();
        let status = 'pending';
        if (validSignature !== undefined) {
            status = validSignature ? 'ok' : 'failed';
        }
        return {
            'info': response,
            'id': this.safeString(data, 'id'),
            'timestamp': now,
            'datetime': this.iso8601(now),
            'currency': currency['code'],
            'amount': this.parseNumber(amountString),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        };
    }
    parseTransfer(transfer, currency = undefined) {
        const timestamp = this.safeInteger(transfer, 'time');
        const assetId = this.safeString(transfer, 'asset');
        const code = this.getExtendedCurrencyCodeById(assetId, currency);
        const amountString = this.safeString(transfer, 'amount');
        const amount = (amountString === undefined) ? undefined : this.parseNumber(Precise["default"].stringAbs(amountString));
        const accountId = this.safeString(transfer, 'accountId');
        const counterpartyAccountId = this.safeString(transfer, 'counterpartyAccountId');
        let fromAccount = accountId;
        let toAccount = counterpartyAccountId;
        if ((amountString !== undefined) && !Precise["default"].stringLt(amountString, '0')) {
            fromAccount = counterpartyAccountId;
            toAccount = accountId;
        }
        const validSignature = this.safeBool(transfer, 'validSignature');
        let status = undefined;
        if (validSignature !== undefined) {
            status = validSignature ? 'ok' : 'failed';
        }
        else {
            status = this.parseTransactionStatus(this.safeString(transfer, 'status'));
        }
        return {
            'info': transfer,
            'id': this.safeString(transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        };
    }
    getExtendedCurrencyCodeById(assetId, currency = undefined) {
        if (assetId === undefined) {
            return this.safeString(currency, 'code');
        }
        const currenciesByNumericId = this.safeDict(this.options, 'currenciesByNumericId', {});
        const currencyByNumericId = this.safeDict(currenciesByNumericId, assetId);
        if (currencyByNumericId !== undefined) {
            return this.safeString(currencyByNumericId, 'code');
        }
        if (currency !== undefined) {
            return currency['code'];
        }
        let code = this.safeCurrencyCode(assetId);
        if (code === 'USD') {
            code = 'USDC';
        }
        return code;
    }
    parseTransactionStatus(status) {
        const statuses = {
            'CREATED': 'pending',
            'IN_PROGRESS': 'pending',
            'COMPLETED': 'ok',
            'REJECTED': 'failed',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransactionType(type) {
        const types = {
            'DEPOSIT': 'deposit',
            'WITHDRAWAL': 'withdrawal',
            'TRANSFER': 'transfer',
            'CLAIM': 'claim',
        };
        return this.safeString(types, type, type);
    }
    parseTransaction(transaction, currency = undefined) {
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
        const timestamp = this.safeInteger(transaction, 'time');
        const assetId = this.safeString(transaction, 'asset');
        const code = this.getExtendedCurrencyCodeById(assetId, currency);
        const amountString = this.safeString(transaction, 'amount');
        const amount = (amountString === undefined) ? undefined : this.parseNumber(Precise["default"].stringAbs(amountString));
        let fee = undefined;
        const feeCost = this.safeString(transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'currency': code,
                'cost': this.parseNumber(Precise["default"].stringAbs(feeCost)),
            };
        }
        const transactionType = this.parseTransactionType(this.safeString(transaction, 'type'));
        const network = this.safeString(transaction, 'chain');
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'id'),
            'txid': this.safeString(transaction, 'transactionHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': transactionType,
            'amount': amount,
            'currency': code,
            'status': this.parseTransactionStatus(this.safeString(transaction, 'status')),
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
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PrivateGetUserFees(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.parseTradingFee(first, market);
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
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetUserFees(params);
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
        const data = this.safeList(response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const fee = this.safeDict(data, i, {});
            const parsed = this.parseTradingFee(fee);
            const symbol = this.safeString(parsed, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = parsed;
            }
        }
        return result;
    }
    parseTradingFee(fee, market = undefined) {
        //
        //     {
        //         "market": "BTC-USD",
        //         "makerFeeRate": "0.00000",
        //         "takerFeeRate": "0.00025",
        //         "builderFeeRate": "0.0001"
        //     }
        //
        const marketId = this.safeString(fee, 'market');
        market = this.safeMarket(marketId, market);
        return {
            'info': fee,
            'symbol': market['symbol'],
            'maker': this.safeNumber(fee, 'makerFeeRate'),
            'taker': this.safeNumber(fee, 'takerFeeRate'),
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
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PrivateGetUserLeverage(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        return this.parseLeverage(this.safeDict(data, 0), market);
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
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'leverage': this.numberToString(leverage),
        };
        const response = await this.v1PrivatePatchUserLeverage(this.extend(request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": {}
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        //
        //     {
        //         "market": "BTC-USD",
        //         "leverage": "10"
        //     }
        //
        const marketId = this.safeString(leverage, 'market');
        market = this.safeMarket(marketId, market);
        const leverageValue = this.safeNumber(leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': undefined,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    /**
     * @method
     * @name extended#fetchPositions
     * @description fetch all open positions
     * @see https://api.docs.extended.exchange/#get-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds(symbols);
            request['market'] = marketIds;
        }
        const response = await this.v1PrivateGetUserPositions(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        return this.parsePositions(data, symbols);
    }
    /**
     * @method
     * @name extended#fetchPosition
     * @description fetch data on an open position
     * @see https://api.docs.extended.exchange/#get-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        const positions = await this.fetchPositions([symbol], params);
        return this.safeDict(positions, 0);
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
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionsHistory(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (typeof symbols === 'string') {
            symbols = [symbols];
        }
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchPositionsHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchPositionsHistory', symbols, since, limit, params, 'cursor', 'cursor', undefined, 10000);
        }
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds(symbols);
            request['market'] = marketIds;
        }
        const response = await this.v1PrivateGetUserPositionsHistory(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'cursor');
        const result = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === dataLength - 1)) {
                entry = this.extend(entry, { 'cursor': cursor });
            }
            result.push(entry);
        }
        const positions = this.parsePositions(result, symbols);
        return this.filterBySinceLimit(positions, since, limit, 'timestamp');
    }
    parsePosition(position, market = undefined) {
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
        const marketId = this.safeString(position, 'market');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger2(position, 'createdAt', 'createdTime');
        let lastUpdateTimestamp = this.safeInteger2(position, 'updatedAt', 'updatedTime');
        lastUpdateTimestamp = this.safeInteger(position, 'closedTime', lastUpdateTimestamp);
        const side = this.safeStringLower(position, 'side');
        const margin = this.safeString(position, 'margin');
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'id'),
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'initialMargin': margin,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeString(position, 'openPrice'),
            'notional': this.safeString(position, 'value'),
            'leverage': this.safeString(position, 'leverage'),
            'unrealizedPnl': this.safeString(position, 'unrealisedPnl'),
            'realizedPnl': this.safeString(position, 'realisedPnl'),
            'contracts': this.safeString(position, 'size'),
            'contractSize': this.safeString(market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeString(position, 'liquidationPrice'),
            'markPrice': this.safeString(position, 'markPrice'),
            'lastPrice': this.safeString(position, 'exitPrice'),
            'collateral': margin,
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': this.safeString(position, 'slTriggerPrice'),
            'takeProfitPrice': this.safeString(position, 'tpTriggerPrice'),
        });
    }
    getExtendedStarkAmount(amount, resolution, roundUp = false) {
        const resolutionString = this.numberToString(resolution);
        const precise = Precise["default"].stringMul(amount, resolutionString);
        let result = this.decimalToPrecision(precise, number.TRUNCATE, 0, number.DECIMAL_PLACES, number.NO_PADDING);
        if (roundUp && Precise["default"].stringGt(precise, result)) {
            result = Precise["default"].stringAdd(result, '1');
        }
        return result;
    }
    async fetchExtendedAccount(params = {}) {
        let account = this.safeDict(this.options, 'account');
        if (account !== undefined) {
            return account;
        }
        const accountData = await this.fetchAccount(params);
        account = accountData['info'];
        this.options['account'] = account;
        return account;
    }
    createOrderSettlementData(isBuy, amountString, priceString, params = {}) {
        const totalFee = this.safeString(params, 'totalFee');
        const settlementExpiration = this.safeInteger(params, 'settlementExpiration');
        const nonce = this.safeInteger(params, 'nonce');
        const starkKey = this.safeString(params, 'starkKey');
        const collateralPosition = this.safeString(params, 'collateralPosition');
        const syntheticId = this.safeString(params, 'syntheticId');
        const collateralId = this.safeString(params, 'collateralId');
        const syntheticResolution = this.safeInteger(params, 'syntheticResolution');
        const collateralResolution = this.safeInteger(params, 'collateralResolution');
        const quoteAmount = Precise["default"].stringMul(amountString, priceString);
        const baseRoundUp = isBuy;
        const quoteRoundUp = isBuy;
        let baseAmount = this.getExtendedStarkAmount(amountString, syntheticResolution, baseRoundUp);
        let collateralAmount = this.getExtendedStarkAmount(quoteAmount, collateralResolution, quoteRoundUp);
        if (isBuy) {
            collateralAmount = Precise["default"].stringNeg(collateralAmount);
        }
        else {
            baseAmount = Precise["default"].stringNeg(baseAmount);
        }
        const feeAmount = this.getExtendedStarkAmount(Precise["default"].stringMul(totalFee, quoteAmount), collateralResolution, true);
        const settlement = {
            'starkKey': starkKey,
            'collateralPosition': collateralPosition,
            'baseAssetId': syntheticId,
            'baseAmount': baseAmount,
            'quoteAssetId': collateralId,
            'quoteAmount': collateralAmount,
            'feeAssetId': collateralId,
            'feeAmount': feeAmount,
            'expiration': this.numberToString(settlementExpiration),
            'salt': nonce,
        };
        const msgHash = this.getExtendedOrderMsgHash(settlement);
        const sig = JSON.parse(this.extendedStarknetSign(msgHash, this.privateKey));
        const r = this.getExtendedSignatureHex(sig[0]);
        const s = this.getExtendedSignatureHex(sig[1]);
        settlement['r'] = r;
        settlement['s'] = s;
        return settlement;
    }
    createWithdrawalSettlementData(address, amountString, currency, account, params = {}) {
        const now = this.milliseconds();
        const settlementExpiration = this.safeInteger(params, 'settlementExpiration', this.parseToInt((now + 999) / 1000) + 1209600 + 60);
        const nonce = this.safeInteger(params, 'nonce', this.nonce());
        const positionId = this.safeString2(params, 'positionId', 'l2Vault', this.safeString(account, 'l2Vault'));
        const recipient = this.safeString(params, 'recipient', address);
        const currencyInfo = this.safeDict(currency, 'info', {});
        const collateralId = this.safeString(params, 'collateralId', this.safeString2(currencyInfo, 'starkexId', 'l1Id'));
        const resolution = this.safeInteger(params, 'resolution', this.safeValue2(currencyInfo, 'starkexResolution', 'l1Resolution'));
        const starkKey = this.safeString(account, 'l2Key');
        if ((positionId === undefined) || (collateralId === undefined) || (resolution === undefined) || (starkKey === undefined)) {
            throw new errors.BadRequest(this.id + ' withdraw() requires currency starkexId/starkexResolution, account l2Vault and account l2Key');
        }
        const amount = this.getExtendedStarkAmount(amountString, resolution);
        const settlement = {
            'recipient': recipient,
            'positionId': positionId,
            'collateralId': collateralId,
            'amount': amount,
            'expiration': {
                'seconds': settlementExpiration,
            },
            'salt': nonce,
        };
        const msgHash = this.getExtendedWithdrawalMsgHash(settlement, starkKey);
        const sig = JSON.parse(this.extendedStarknetSign(msgHash, this.privateKey));
        settlement['signature'] = {
            'r': this.getExtendedSignatureHex(sig[0]),
            's': this.getExtendedSignatureHex(sig[1]),
        };
        return settlement;
    }
    createTransferSettlementData(amountString, currency, account, toVault, toL2Key, params = {}) {
        const now = this.milliseconds();
        const settlementExpiration = this.safeInteger(params, 'settlementExpiration', this.parseToInt((now + 999) / 1000) + 1814400);
        const nonce = this.safeInteger(params, 'nonce', this.nonce());
        const fromVault = this.safeString2(params, 'fromVault', 'senderPositionId', this.safeString(account, 'l2Vault'));
        const fromL2Key = this.safeString2(params, 'fromL2Key', 'senderPublicKey', this.safeString(account, 'l2Key'));
        const currencyInfo = this.safeDict(currency, 'info', {});
        const collateralId = this.safeString2(params, 'assetId', 'collateralId', this.safeString2(currencyInfo, 'starkexId', 'l1Id'));
        const resolution = this.safeInteger(params, 'resolution', this.safeValue2(currencyInfo, 'starkexResolution', 'l1Resolution'));
        if ((fromVault === undefined) || (fromL2Key === undefined) || (collateralId === undefined) || (resolution === undefined)) {
            throw new errors.BadRequest(this.id + ' transfer() requires currency starkexId/starkexResolution, account l2Vault and account l2Key');
        }
        const transferAmount = this.getExtendedStarkAmount(amountString, resolution);
        const settlement = {
            'amount': transferAmount,
            'assetId': collateralId,
            'expirationTimestamp': settlementExpiration,
            'nonce': nonce,
            'receiverPositionId': toVault,
            'receiverPublicKey': toL2Key,
            'senderPositionId': fromVault,
            'senderPublicKey': fromL2Key,
        };
        const msgHash = this.getExtendedTransferMsgHash(settlement);
        const sig = JSON.parse(this.extendedStarknetSign(msgHash, this.privateKey));
        settlement['signature'] = {
            'r': this.getExtendedSignatureHex(sig[0]),
            's': this.getExtendedSignatureHex(sig[1]),
        };
        return settlement;
    }
    async createExtendedOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const uppercaseType = type.toUpperCase();
        const uppercaseSide = side.toUpperCase();
        if (market['spot'] && uppercaseType !== 'LIMIT') {
            throw new errors.BadRequest(this.id + ' createOrder() supports limit orders for spot markets only');
        }
        if (!this.inArray(uppercaseType, ['LIMIT', 'MARKET', 'CONDITIONAL', 'TPSL'])) {
            throw new errors.BadRequest(this.id + ' createOrder() supports limit, market, conditional and tpsl orders only');
        }
        if (price === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price argument');
        }
        const amountString = this.amountToPrecision(symbol, amount);
        const priceString = this.priceToPrecision(symbol, price);
        const postOnly = this.isPostOnly(uppercaseType === 'MARKET', undefined, params);
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only', false);
        let timeInForce = this.safeStringUpper(params, 'timeInForce');
        if (timeInForce === undefined) {
            timeInForce = (uppercaseType === 'MARKET') ? 'IOC' : 'GTT';
        }
        const fee = this.safeString(params, 'fee', '0.0005');
        let builderFeeRate = undefined;
        let builderId = undefined;
        if (this.isSandboxModeEnabled) {
            builderFeeRate = this.safeString2(params, 'builderFeeRate', 'defaultBuilderFeeRate');
            builderId = this.safeString2(params, 'builderId', 'defaultBuilderId');
            params = this.omit(params, ['builderFeeRate', 'defaultBuilderFeeRate', 'builderId', 'defaultBuilderId']);
        }
        else {
            [builderFeeRate, params] = this.handleOptionAndParams(params, 'createOrder', 'builderFeeRate', '0.0001');
            [builderId, params] = this.handleOptionAndParams(params, 'createOrder', 'builderId');
        }
        let totalFee = fee;
        if (builderFeeRate !== undefined) {
            totalFee = Precise["default"].stringAdd(fee, builderFeeRate);
        }
        const now = this.milliseconds();
        const expiryEpochMillis = this.safeInteger(params, 'expiryEpochMillis', now + 3600000);
        const settlementExpiration = this.safeInteger(params, 'settlementExpiration', this.parseToInt((expiryEpochMillis + 999) / 1000) + 1209600);
        const nonce = this.numberToString(this.nonce());
        const account = await this.fetchExtendedAccount();
        const starkKey = this.safeString(account, 'l2Key');
        const collateralPosition = this.safeString(account, 'l2Vault');
        const info = this.safeDict(market, 'info', {});
        const l2Config = this.safeDict(info, 'l2Config', {});
        const syntheticId = this.safeString(l2Config, 'syntheticId');
        const collateralId = this.safeString(l2Config, 'collateralId');
        const syntheticResolution = this.safeInteger(l2Config, 'syntheticResolution');
        const collateralResolution = this.safeInteger(l2Config, 'collateralResolution');
        if ((syntheticId === undefined) || (collateralId === undefined) || (syntheticResolution === undefined) || (collateralResolution === undefined)) {
            throw new errors.BadRequest(this.id + ' createOrder() requires l2Config in market info');
        }
        const settlementParams = {
            'totalFee': totalFee,
            'starkKey': starkKey,
            'syntheticId': syntheticId,
            'syntheticResolution': syntheticResolution,
            'collateralId': collateralId,
            'collateralResolution': collateralResolution,
            'settlementExpiration': settlementExpiration,
            'nonce': nonce,
            'collateralPosition': collateralPosition,
        };
        const isBuy = (uppercaseSide === 'BUY');
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_id', this.uuid());
        const request = {
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
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'selfTradeProtectionLevel': 'ACCOUNT',
        };
        if (builderFeeRate !== undefined) {
            request['builderFee'] = builderFeeRate;
        }
        if (builderId !== undefined) {
            request['builderId'] = builderId;
        }
        const cancelId = this.safeString2(params, 'cancelId', 'previousOrderId');
        if (cancelId !== undefined) {
            request['cancelId'] = cancelId;
        }
        const settlement = this.createOrderSettlementData(isBuy, amountString, priceString, settlementParams);
        request['settlement'] = {
            'signature': { 'r': settlement['r'], 's': settlement['s'] },
            'starkKey': starkKey,
            'collateralPosition': collateralPosition,
        };
        let triggerPriceStr = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossTriggerPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeString(params, 'takeProfitPrice');
        const isStopLossOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitOrder = takeProfitTriggerPrice !== undefined;
        const stopLoss = this.safeDict(params, 'stopLoss');
        const takeProfit = this.safeDict(params, 'takeProfit');
        const hasStopLoss = (stopLoss !== undefined);
        const hasTakeProfit = (takeProfit !== undefined);
        if (hasStopLoss || hasTakeProfit) {
            request['tpSlType'] = 'ORDER';
            if (hasStopLoss) {
                const stopLossTrigger = this.safeString(stopLoss, 'triggerPrice');
                const stopLossTriggerPriceType = this.safeString(stopLoss, 'triggerPriceType');
                const stopLossExecutionPrice = this.safeString(stopLoss, 'price');
                const stopLossType = this.safeString(stopLoss, 'type');
                const stopLossSettlement = this.createOrderSettlementData(!isBuy, amountString, stopLossExecutionPrice, settlementParams);
                const requestStopLoss = {
                    'triggerPrice': this.priceToPrecision(symbol, stopLossTrigger),
                    'price': this.priceToPrecision(symbol, stopLossExecutionPrice),
                    'settlement': {
                        'signature': { 'r': stopLossSettlement['r'], 's': stopLossSettlement['s'] },
                        'starkKey': starkKey,
                        'collateralPosition': collateralPosition,
                    },
                };
                if (stopLossTriggerPriceType !== undefined) {
                    requestStopLoss['triggerPriceType'] = stopLossTriggerPriceType;
                }
                if (stopLossType !== undefined) {
                    requestStopLoss['priceType'] = stopLossType;
                }
                request['stopLoss'] = requestStopLoss;
            }
            if (hasTakeProfit) {
                const takeProfitTrigger = this.safeString(takeProfit, 'triggerPrice');
                const takeProfitTriggerPriceType = this.safeString(takeProfit, 'triggerPriceType');
                const takeProfitExecutionPrice = this.safeString(takeProfit, 'price');
                const takeProfitType = this.safeString(takeProfit, 'type');
                const takeProfitSettlement = this.createOrderSettlementData(!isBuy, amountString, takeProfitExecutionPrice, settlementParams);
                const requestTakeProfit = {
                    'triggerPrice': this.priceToPrecision(symbol, takeProfitTrigger),
                    'price': this.priceToPrecision(symbol, takeProfitExecutionPrice),
                    'settlement': {
                        'signature': { 'r': takeProfitSettlement['r'], 's': takeProfitSettlement['s'] },
                        'starkKey': starkKey,
                        'collateralPosition': collateralPosition,
                    },
                };
                if (takeProfitTriggerPriceType !== undefined) {
                    requestTakeProfit['triggerPriceType'] = takeProfitTriggerPriceType;
                }
                if (takeProfitType !== undefined) {
                    requestTakeProfit['priceType'] = takeProfitType;
                }
                request['takeProfit'] = requestTakeProfit;
            }
        }
        else {
            if (triggerPriceStr !== undefined) {
                const triggerDirection = this.safeStringUpper(params, 'triggerDirection');
                if (triggerDirection === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' createOrder() requires triggerDirection for trigger order');
                }
                const trigger = {
                    'triggerPrice': this.priceToPrecision(symbol, triggerPriceStr),
                };
                trigger['direction'] = triggerDirection;
                request['type'] = 'CONDITIONAL';
                request['trigger'] = trigger;
            }
            else if (isStopLossOrder || isTakeProfitOrder) {
                triggerPriceStr = isStopLossOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
                const trigger = {
                    'triggerPrice': this.priceToPrecision(symbol, triggerPriceStr),
                };
                if (isBuy) {
                    trigger['direction'] = isStopLossOrder ? 'UP' : 'DOWN';
                }
                else {
                    trigger['direction'] = isStopLossOrder ? 'DOWN' : 'UP';
                }
                request['type'] = 'CONDITIONAL';
                request['trigger'] = trigger;
            }
        }
        params = this.omit(params, ['clientOrderId', 'client_id', 'timeInForce', 'postOnly', 'reduceOnly', 'reduce_only', 'fee', 'nonce', 'expiryEpochMillis', 'settlementExpiration', 'cancelId', 'previousOrderId', 'brokerId', 'referralCode', 'triggerPrice', 'stopPrice', 'triggerDirection', 'stopLossPrice', 'takeProfitPrice', 'stopLoss', 'takeProfit']);
        return {
            'request': this.extend(request, params),
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
     * @param {float} [params.triggerPrice] *swap only* The price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] *swap only* The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *swap only* The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *swap only* take profit trigger price
     * @param {float} [params.takeProfit.price] *swap only* the execution price for a take profit attached to a trigger order
     * @param {string} [params.takeProfit.type] *swap only* the type for a take profit attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is ''
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *swap only* stop loss trigger price
     * @param {float} [params.stopLoss.price] *swap only* the execution price for a stop loss attached to a trigger order
     * @param {string} [params.stopLoss.type] *swap only* the type for a stop loss attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is ''
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        this.checkRequiredCredentials();
        const extendedOrderRequest = await this.createExtendedOrderRequest(symbol, type, side, amount, price, params);
        const request = this.safeDict(extendedOrderRequest, 'request', {});
        const response = await this.v1PrivatePostUserOrder(request);
        //
        //     {
        //         "status": "OK",
        //         "data": {
        //             "id": "2051479786538188800",
        //             "externalId": "3480985089570526249141260266819446928410958787024864860785196119336740291620"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const market = extendedOrderRequest['market'];
        const now = this.safeInteger(extendedOrderRequest, 'timestamp');
        data['timestamp'] = now;
        data['status'] = 'NEW';
        return this.parseOrder(this.extend(request, data), market);
    }
    /**
     * @method
     * @name extended#editOrder
     * @description edit a trade order
     * @see https://api.docs.extended.exchange/#create-or-edit-order
     * @param {string} id order id assigned by Extended
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (id === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires an id argument');
        }
        let expiryEpochMillis = this.safeInteger(params, 'expiryEpochMillis');
        let postOnly = this.safeBool(params, 'postOnly');
        let reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only');
        let cancelId = this.safeString2(params, 'cancelId', 'previousOrderId');
        if ((amount === undefined) || (price === undefined) || (expiryEpochMillis === undefined) || (postOnly === undefined) || (reduceOnly === undefined) || (cancelId === undefined)) {
            const response = await this.v1PrivateGetUserOrdersId({ 'id': id });
            const order = this.safeDict(response, 'data', {});
            if (amount === undefined) {
                amount = this.safeNumber(order, 'qty');
            }
            if (price === undefined) {
                price = this.safeNumber(order, 'price');
            }
            if (expiryEpochMillis === undefined) {
                expiryEpochMillis = this.safeInteger(order, 'expireTime');
            }
            if (postOnly === undefined) {
                postOnly = this.safeBool(order, 'postOnly', false);
            }
            if (reduceOnly === undefined) {
                reduceOnly = this.safeBool(order, 'reduceOnly', false);
            }
            if (cancelId === undefined) {
                cancelId = this.safeString(order, 'externalId');
            }
        }
        if (amount === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires an amount argument or an existing order with qty');
        }
        if (price === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires a price argument or an existing order with price');
        }
        params = this.extend({
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
        }, params);
        const requestParams = this.extend(params, {
            'cancelId': cancelId,
            'expiryEpochMillis': expiryEpochMillis,
        });
        const extendedOrderRequest = await this.createExtendedOrderRequest(symbol, type, side, amount, price, requestParams);
        const request = this.safeDict(extendedOrderRequest, 'request', {});
        const editResponse = await this.v1PrivatePostUserOrder(request);
        //
        //     {
        //         "status": "OK",
        //         "data": {
        //             "id": "2051479786538188800",
        //             "externalId": "3480985089570526249141260266819446928410958787024864860785196119336740291620"
        //         }
        //     }
        //
        const responseData = this.safeDict(editResponse, 'data', {});
        const market = extendedOrderRequest['market'];
        const now = this.safeInteger(extendedOrderRequest, 'timestamp');
        responseData['timestamp'] = now;
        responseData['status'] = 'NEW';
        return this.parseOrder(this.extend(request, responseData), market);
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
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let response = undefined;
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_id');
        params = this.omit(params, ['clientOrderId', 'client_id']);
        if (clientOrderId !== undefined) {
            const request = {
                'externalId': clientOrderId,
            };
            response = await this.v1PrivateDeleteUserOrder(this.extend(request, params));
        }
        else {
            if (id === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires an id argument');
            }
            const request = {
                'id': id,
            };
            response = await this.v1PrivateDeleteUserOrderId(this.extend(request, params));
        }
        //
        //     {
        //         "status": "OK"
        //     }
        //
        const orderId = (clientOrderId === undefined) ? id : undefined;
        const orderSymbol = (market === undefined) ? symbol : market['symbol'];
        return this.safeOrder({
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
     * @name extended#cancelOrders
     * @description cancel multiple orders by order ids or client order ids
     * @see https://api.docs.extended.exchange/#mass-cancel
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol, only used to populate the returned orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @param {string} [params.clientOrderId] single client order id
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let clientOrderIds = this.safeListN(params, ['clientOrderIds', 'client_order_ids', 'externalOrderIds', 'external_order_ids']);
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_id');
        params = this.omit(params, ['clientOrderIds', 'client_order_ids', 'clientOrderId', 'client_id', 'externalOrderIds', 'external_order_ids', 'orderIds', 'order_ids', 'markets', 'cancelAll', 'cancel_all']);
        const request = {};
        const hasOrderIds = ids !== undefined;
        if (hasOrderIds) {
            const idsLength = ids.length;
            if (idsLength > 0) {
                request['orderIds'] = ids;
            }
        }
        if (clientOrderIds === undefined && clientOrderId !== undefined) {
            clientOrderIds = [clientOrderId];
        }
        const hasClientOrderIds = clientOrderIds !== undefined;
        if (clientOrderIds !== undefined) {
            const clientOrderIdsLength = clientOrderIds.length;
            if (clientOrderIdsLength > 0) {
                request['externalOrderIds'] = clientOrderIds;
            }
        }
        if (!hasOrderIds && !hasClientOrderIds) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires an ids argument or clientOrderIds parameter');
        }
        await this.v1PrivatePostUserOrderMassCancel(this.extend(request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": {}
        //     }
        //
        return [];
    }
    /**
     * @method
     * @name extended#cancelAllOrders
     * @description cancels all open orders, optionally filtered by symbol
     * @see https://api.docs.extended.exchange/#mass-cancel
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'cancelAll': true,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['markets'] = [market['id']];
        }
        await this.v1PrivatePostUserOrderMassCancel(this.extend(request, params));
        //
        //     {
        //         "status": "OK",
        //         "data": {}
        //     }
        //
        return [];
    }
    /**
     * @method
     * @name extended#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://api.docs.extended.exchange/#mass-auto-cancel-dead-man-39-s-switch
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    async cancelAllOrdersAfter(timeout, params = {}) {
        await this.loadMarkets();
        const request = {
            'countdownTime': (timeout > 0) ? this.parseToInt(timeout / 1000) : 0,
        };
        return await this.v1PrivatePostUserDeadmanswitch(this.extend(request, params));
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
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let response = undefined;
        let order = undefined;
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_id');
        params = this.omit(params, ['clientOrderId', 'client_id']);
        if (clientOrderId !== undefined) {
            const request = {
                'externalId': clientOrderId,
            };
            response = await this.v1PrivateGetUserOrdersExternalExternalId(this.extend(request, params));
            const data = this.safeList(response, 'data', []);
            order = this.safeDict(data, 0, {});
        }
        else {
            if (id === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires an id argument');
            }
            const request = {
                'id': id,
            };
            response = await this.v1PrivateGetUserOrdersId(this.extend(request, params));
            order = this.safeDict(response, 'data', {});
        }
        return this.parseOrder(order, market);
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
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        const response = await this.v1PrivateGetUserOrders(this.extend(request, params));
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
        const data = this.safeList(response, 'data', []);
        const orders = this.parseOrders(data, market, since, limit);
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
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
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchOrders', symbol, since, limit, params, 'cursor', 'cursor', undefined, 100);
        }
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetUserOrdersHistory(this.extend(params, request));
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
        const data = this.safeList(response, 'data', []);
        const pagination = this.safeDict(response, 'pagination', {});
        const cursor = this.safeString(pagination, 'cursor');
        const result = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let entry = data[i];
            if ((cursor !== undefined) && (i === dataLength - 1)) {
                entry = this.extend(entry, { 'cursor': cursor });
            }
            result.push(entry);
        }
        const orders = this.parseOrders(result, market, since, limit);
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
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
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders(symbol, since, undefined, params);
        const closedOrders = this.filterBy(orders, 'status', 'closed');
        return this.filterBySymbolSinceLimit(closedOrders, symbol, since, limit);
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
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders(symbol, since, undefined, params);
        const canceledOrders = this.filterBy(orders, 'status', 'canceled');
        return this.filterBySymbolSinceLimit(canceledOrders, symbol, since, limit);
    }
    parseOrderStatus(status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'UNTRIGGERED': 'open',
            'TRIGGERED': 'open',
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
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
        const marketId = this.safeString(order, 'market');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger2(order, 'createdTime', 'timestamp');
        const lastUpdateTimestamp = this.safeInteger(order, 'updatedTime');
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const side = this.safeStringLower(order, 'side');
        const type = this.safeStringLower(order, 'type');
        const amount = this.safeString(order, 'qty');
        const filled = this.safeString(order, 'filledQty');
        const feeCost = this.safeString(order, 'payedFee');
        const trigger = this.safeDict(order, 'trigger', {});
        const takeProfit = this.safeDict(order, 'takeProfit', {});
        const stopLoss = this.safeDict(order, 'stopLoss', {});
        const fee = {
            'cost': feeCost,
            'currency': (market === undefined) ? undefined : market['settle'],
        };
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'id'),
            'clientOrderId': this.safeString(order, 'externalId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': this.safeString(order, 'timeInForce'),
            'postOnly': this.safeBool(order, 'postOnly'),
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': side,
            'price': this.safeString(order, 'price'),
            'triggerPrice': this.safeString(trigger, 'triggerPrice'),
            'takeProfitPrice': this.safeString(takeProfit, 'triggerPrice'),
            'stopLossPrice': this.safeString(stopLoss, 'triggerPrice'),
            'amount': amount,
            'cost': undefined,
            'average': this.safeString(order, 'averagePrice'),
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    getExtendedStringToFelt(value) {
        return this.convertToBigInt(this.stringToBase16(value));
    }
    getExtendedEncodeI64(value) {
        // Cairo prime offset for i64 negative encoding.
        const prime = '3618502788666131213697322783095070105623107215331596699973092056135872020481';
        const valueString = this.numberToString(value);
        if (Precise["default"].stringLt(valueString, '0')) {
            return Precise["default"].stringAdd(prime, valueString);
        }
        return value;
    }
    getExtendedDecimalToBase16(value) {
        let decimalString = '';
        if (typeof value === 'string') {
            decimalString = value;
        }
        else {
            decimalString = this.numberToString(value);
        }
        const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        let result = '';
        while (Precise["default"].stringGt(decimalString, '0')) {
            const remainder = this.parseToInt(Precise["default"].stringMod(decimalString, '16'));
            result = hexChars[remainder] + result;
            decimalString = Precise["default"].stringDiv(decimalString, '16', 0);
        }
        if (result === '') {
            return '0';
        }
        return result;
    }
    getExtendedSignatureHex(signature) {
        if (typeof signature === 'string') {
            if (signature.indexOf('0x') === 0) {
                return signature;
            }
            return '0x' + this.getExtendedDecimalToBase16(signature);
        }
        const signatureString = this.numberToString(signature);
        if (signatureString.indexOf('0x') === 0) {
            return signatureString;
        }
        return '0x' + this.getExtendedDecimalToBase16(signatureString);
    }
    getExtendedDomainHash() {
        const domainTypeHash = this.convertToBigInt(this.extendedStarknetGetSelectorFromName('"StarknetDomain"("name":"shortstring","version":"shortstring","chainId":"shortstring","revision":"shortstring")'));
        const isTestnet = this.urls['api']['rest'].indexOf('sepolia') >= 0;
        const defaultChainId = isTestnet ? 'SN_SEPOLIA' : 'SN_MAIN';
        const chainId = this.safeString(this.options, 'chainId', defaultChainId);
        return this.convertToBigInt(this.extendedStarknetComputePoseidonHashOnElements([
            domainTypeHash,
            this.getExtendedStringToFelt('Perpetuals'),
            this.getExtendedStringToFelt('v0'),
            this.getExtendedStringToFelt(chainId),
            this.convertToBigInt('1'),
        ]));
    }
    getExtendedOrderMsgHash(settlement) {
        const orderTypeHash = this.convertToBigInt(this.extendedStarknetGetSelectorFromName('"Order"("position_id":"felt","base_asset_id":"AssetId","base_amount":"i64","quote_asset_id":"AssetId","quote_amount":"i64","fee_asset_id":"AssetId","fee_amount":"u64","expiration":"Timestamp","salt":"felt")"PositionId"("value":"u32")"AssetId"("value":"felt")"Timestamp"("seconds":"u64")'));
        const domainHash = this.getExtendedDomainHash();
        // Order fields
        const positionId = this.convertToBigInt(this.safeString(settlement, 'collateralPosition', '0'));
        const baseAssetId = this.safeString(settlement, 'baseAssetId', '0');
        const baseAmount = this.convertToBigInt(this.safeString(settlement, 'baseAmount', '0'));
        const quoteAssetId = this.safeString(settlement, 'quoteAssetId', '0');
        const quoteAmount = this.convertToBigInt(this.safeString(settlement, 'quoteAmount', '0'));
        const feeAssetId = this.safeString(settlement, 'feeAssetId', '0');
        const feeAmount = this.convertToBigInt(this.safeString(settlement, 'feeAmount', '0'));
        const expiration = this.convertToBigInt(this.safeString2(settlement, 'expiration', 'expirationTimestamp', '0'));
        const salt = this.convertToBigInt(this.safeString2(settlement, 'salt', 'nonce', '0'));
        const starkKey = this.convertToBigInt(this.safeString(settlement, 'starkKey', '0'));
        // Order struct hash
        const orderHash = this.convertToBigInt(this.extendedStarknetComputePoseidonHashOnElements([
            orderTypeHash,
            positionId,
            this.convertToBigInt(baseAssetId),
            this.getExtendedEncodeI64(baseAmount),
            this.convertToBigInt(quoteAssetId),
            this.getExtendedEncodeI64(quoteAmount),
            this.convertToBigInt(feeAssetId),
            feeAmount,
            expiration,
            salt,
        ]));
        // SNIP-12 final message hash: poseidon('StarkNet Message', domainHash, starkKey, orderHash)
        return this.extendedStarknetComputePoseidonHashOnElements([
            this.getExtendedStringToFelt('StarkNet Message'),
            domainHash,
            starkKey,
            orderHash,
        ]);
    }
    getExtendedWithdrawalMsgHash(settlement, starkKey) {
        const withdrawalTypeHash = this.convertToBigInt(this.extendedStarknetGetSelectorFromName('"Withdrawal"("recipient":"felt","position_id":"PositionId","collateral_id":"AssetId","amount":"u64","expiration":"Timestamp","salt":"felt")"PositionId"("value":"u32")"AssetId"("value":"felt")"Timestamp"("seconds":"u64")'));
        const domainHash = this.getExtendedDomainHash();
        const expiration = this.safeDict(settlement, 'expiration', {});
        const withdrawalHash = this.convertToBigInt(this.extendedStarknetComputePoseidonHashOnElements([
            withdrawalTypeHash,
            this.convertToBigInt(this.safeString(settlement, 'recipient', '0')),
            this.convertToBigInt(this.safeString(settlement, 'positionId', '0')),
            this.convertToBigInt(this.safeString(settlement, 'collateralId', '0')),
            this.convertToBigInt(this.safeString(settlement, 'amount', '0')),
            this.convertToBigInt(this.safeString(expiration, 'seconds', '0')),
            this.convertToBigInt(this.safeString(settlement, 'salt', '0')),
        ]));
        return this.extendedStarknetComputePoseidonHashOnElements([
            this.getExtendedStringToFelt('StarkNet Message'),
            domainHash,
            this.convertToBigInt(starkKey),
            withdrawalHash,
        ]);
    }
    getExtendedTransferMsgHash(settlement) {
        const transferTypeHash = this.convertToBigInt(this.extendedStarknetGetSelectorFromName('"Transfer"("sender_position_id":"PositionId","receiver_position_id":"PositionId","asset_id":"AssetId","amount":"u64","expiration":"Timestamp","salt":"felt")"PositionId"("value":"u32")"AssetId"("value":"felt")"Timestamp"("seconds":"u64")'));
        const domainHash = this.getExtendedDomainHash();
        const senderPublicKey = this.convertToBigInt(this.safeString(settlement, 'senderPublicKey', '0'));
        const transferHash = this.convertToBigInt(this.extendedStarknetComputePoseidonHashOnElements([
            transferTypeHash,
            this.convertToBigInt(this.safeString(settlement, 'senderPositionId', '0')),
            this.convertToBigInt(this.safeString(settlement, 'receiverPositionId', '0')),
            this.convertToBigInt(this.safeString(settlement, 'assetId', '0')),
            this.convertToBigInt(this.safeString(settlement, 'amount', '0')),
            this.convertToBigInt(this.safeString(settlement, 'expirationTimestamp', '0')),
            this.convertToBigInt(this.safeString(settlement, 'nonce', '0')),
        ]));
        return this.extendedStarknetComputePoseidonHashOnElements([
            this.getExtendedStringToFelt('StarkNet Message'),
            domainHash,
            senderPublicKey,
            transferHash,
        ]);
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"status":"ERROR","error":{"code":1140,"message":"New order cost exceeds available balance","debugInfo":"Order cost 2.000000 exceeds available for trade 0\nOrder price = 200, mark price = 95.2147597125 estimated market price = 94.81"}}
        //
        const status = this.safeStringLower(response, 'status');
        if (status === 'error') {
            const error = this.safeDict(response, 'error');
            const errorCode = this.safeString(error, 'code');
            const feedback = this.id + ' ' + this.json(response);
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString(api, 0);
        const accessibility = this.safeString(api, 1);
        const endpoint = '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        const queryPost = (path === 'user/deadmanswitch');
        let url = this.implodeHostname(this.urls['api']['rest']);
        if (accessibility === 'private') {
            // this.checkRequiredCredentials ();
            if (this.apiKey === undefined) {
                throw new errors.AuthenticationError(this.id + ' sign() requires an apiKey for private endpoints');
            }
            headers = {
                'X-Api-Key': this.apiKey,
            };
            if (((method === 'POST') || (method === 'PATCH')) && !queryPost) {
                body = this.json(query);
                headers['Content-Type'] = 'application/json';
            }
        }
        url = url + '/api/' + version + endpoint;
        if ((method === 'GET' || method === 'DELETE' || queryPost) && Object.keys(query).length) {
            url += '?' + this.urlencodeWithArrayRepeat(query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

exports["default"] = extended;
