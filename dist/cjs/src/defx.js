'use strict';

var defx$1 = require('./abstract/defx.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var errors = require('./base/errors.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class defx
 * @augments Exchange
 */
class defx extends defx$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'defx',
            'name': 'Defx X',
            // 'countries': [ '' ],
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'hostname': 'defx.com',
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelWithdraw': false,
                'closeAllPositions': true,
                'closePosition': true,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrice': false,
                'fetchMarkPrices': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
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
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/4e92bace-d7a9-45ea-92be-122168dc87e4',
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'public': 'https://api.testnet.{hostname}',
                    'private': 'https://api.testnet.{hostname}',
                },
                'www': 'https://defx.com/home',
                'doc': [
                    'https://docs.defx.com/docs',
                    'https://api-docs.defx.com/',
                ],
                'fees': [
                    '',
                ],
                'referral': {
                    'url': 'https://app.defx.com/join/6I2CZ7',
                },
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'healthcheck/ping': 1,
                            'symbols/{symbol}/ohlc': 1,
                            'symbols/{symbol}/trades': 1,
                            'symbols/{symbol}/prices': 1,
                            'symbols/{symbol}/ticker/24hr': 1,
                            'symbols/{symbol}/depth/{level}/{slab}': 1,
                            'ticker/24HrAgg': 1,
                            'c/markets': 1,
                            'c/markets/metadata': 1,
                            'analytics/market/stats/newUsers': 1,
                            'analytics/market/stats/tvl': 1,
                            'analytics/market/stats/volumeByInstrument': 1,
                            'analytics/market/stats/liquidation': 1,
                            'analytics/market/stats/totalVolume': 1,
                            'analytics/market/stats/openInterest': 1,
                            'analytics/market/stats/totalTrades': 1,
                            'analytics/market/stats/basis': 1,
                            'analytics/market/stats/insuranceFund': 1,
                            'analytics/market/stats/longAndShortRatio': 1,
                            'analytics/market/stats/fundingRate': 1,
                            'analytics/market/overview': 1,
                            'explorer/search': 1,
                            'explorer/transactions': 1,
                            'explorer/blocks': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'api/order/{orderId}': 1,
                            'api/orders': 1,
                            'api/orders/oco/{parentOrderId}': 1,
                            'api/trades': 1,
                            'api/position/active': 1,
                            'api/users/metadata/leverage': 1,
                            'api/users/metadata/feeMultiplier': 1,
                            'api/users/metadata/slippage': 1,
                            'api/users/referral': 1,
                            'api/users/apikeys': 1,
                            'connection-signature-message/evm': 1,
                            'api/users/profile/wallets': 1,
                            'api/notifications': 1,
                            'api/wallet/balance': 1,
                            'api/wallet/transactions': 1,
                            'api/analytics/user/overview': 1,
                            'api/analytics/user/pnl': 1,
                            'api/analytics/points/overview': 1,
                            'api/analytics/points/history': 1,
                        },
                        'post': {
                            'api/order': 1,
                            'api/position/oco': 1,
                            'api/users/socket/listenKeys': 1,
                            'api/users/metadata/leverage': 1,
                            'api/users/metadata/feeMultiplier': 1,
                            'api/users/metadata/slippage': 1,
                            'api/users/referral/recordReferralSignup': 1,
                            'api/users/apikeys': 1,
                            'api/users/profile/wallets': 1,
                            'api/transfers/withdrawal': 1,
                            'api/transfers/bridge/withdrawal': 1,
                        },
                        'put': {
                            'api/position/updatePositionMargin': 1,
                            'api/users/socket/listenKeys/{listenKey}': 1,
                            'api/users/apikeys/{accessKey}/status': 1,
                            'api/users/referral': 1,
                        },
                        'patch': {
                            'api/users/apikeys/{accessKey}': 1,
                        },
                        'delete': {
                            'api/orders/allOpen': 1,
                            'api/order/{orderId}': 1,
                            'api/position/{positionId}': 1,
                            'api/position/all': 1,
                            'api/users/socket/listenKeys/{listenKey}': 1,
                            'api/users/apikeys/{accessKey}': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber('0.0002'),
                    'taker': this.parseNumber('0.0005'),
                },
            },
            'options': {
                'sandboxMode': false,
            },
            'features': {
                'spot': undefined,
                'forDerivatives': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        // todo implement
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': false,
                        },
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
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
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
                        'marginMode': true,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 100000,
                        'daysBackCanceled': 1,
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
                    'linear': {
                        'extends': 'forDerivatives',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    '404': errors.BadRequest,
                    'missing_auth_signature': errors.AuthenticationError,
                    'order_rejected': errors.InvalidOrder,
                    'invalid_order_id': errors.InvalidOrder,
                    'filter_lotsize_maxqty': errors.InvalidOrder,
                    'filter_notional_min': errors.InvalidOrder,
                    'failed_index_price_up_multiplier_filter': errors.InvalidOrder,
                    'no_open_orders': errors.InvalidOrder,
                    'active_position_not_found': errors.InvalidOrder,
                    'position_inactive': errors.InvalidOrder,
                    'invalid_position_id': errors.InvalidOrder,
                    'Internal server error': errors.ExchangeError, // {"msg":"Internal server error","code":"internal_server_error"}
                },
                'broad': {
                    'Bad Request': errors.BadRequest, // {"errorMessage":"Bad Request","data":[{"param":"symbol","message":"\"symbol\" must be one of [ETH_USDC, BTC_USDC, BNB_USDC, SOL_USDC, DOGE_USDC, TON_USDC, AVAX_USDC, WIF_USDC, KPEPE_USDC, KSHIB_USDC, KBONK_USDC, MOODENG_USDC, POPCAT_USDC, MOTHER_USDC]"}]}
                },
            },
            'precisionMode': number.TICK_SIZE,
        });
    }
    /**
     * @method
     * @name defx#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://api-docs.defx.com/#4b03bb3b-a0fa-4dfb-b96c-237bde0ce9e6
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.v1PublicGetHealthcheckPing(params);
        //
        // {
        //     "success": true,
        //     "t": 1709705048323,
        //     "v": "0.0.7",
        //     "msg": "A programmer’s wife tells him, “While you’re at the grocery store, buy some eggs.” He never comes back."
        // }
        //
        let status = undefined;
        const success = this.safeBool(response, 'success');
        if (success) {
            status = 'ok';
        }
        else {
            status = 'error';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name defx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api-docs.defx.com/#4b03bb3b-a0fa-4dfb-b96c-237bde0ce9e6
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.v1PublicGetHealthcheckPing(params);
        //
        // {
        //     "success": true,
        //     "t": 1709705048323,
        //     "v": "0.0.7",
        //     "msg": "A programmer’s wife tells him, “While you’re at the grocery store, buy some eggs.” He never comes back."
        // }
        //
        return this.safeInteger(response, 't');
    }
    /**
     * @method
     * @name defx#fetchMarkets
     * @description retrieves data on all markets for defx
     * @see https://api-docs.defx.com/#73cce0c8-f842-4891-9145-01bb6d61324d
     * @see https://api-docs.defx.com/#24fd4e5b-840e-451e-99e0-7fea47c7f371
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const request = {
            'type': 'perps',
        };
        const promises = [
            this.v1PublicGetCMarkets(this.extend(request, params)),
            this.v1PublicGetCMarketsMetadata(this.extend(request, params)),
        ];
        const responses = await Promise.all(promises);
        //
        // {
        //     "data": [
        //       {
        //         "market": "DOGE_USDC",
        //         "candleWindows": [
        //           "1m",
        //           "3m",
        //           "5m",
        //           "15m",
        //           "30m",
        //           "1h",
        //           "2h",
        //           "4h",
        //           "12h",
        //           "1d",
        //           "1w",
        //           "1M"
        //         ],
        //         "depthSlabs": [
        //           "0.00001",
        //           "0.00005",
        //           "0.0001",
        //           "0.001",
        //           "0.01"
        //         ],
        //         "filters": [
        //           {
        //             "filterType": "LOT_SIZE",
        //             "minQty": "1.00000",
        //             "maxQty": "1500000.00000",
        //             "stepSize": "1.00000"
        //           },
        //           {
        //             "filterType": "MARKET_LOT_SIZE",
        //             "minQty": "1.00000",
        //             "maxQty": "750000.00000",
        //             "stepSize": "1.00000"
        //           },
        //           {
        //             "filterType": "PRICE_FILTER",
        //             "minPrice": "0.00244000",
        //             "maxPrice": "30.00000000",
        //             "tickSize": "0.00001"
        //           },
        //           {
        //             "filterType": "NOTIONAL",
        //             "minNotional": "100.00000000"
        //           },
        //           {
        //             "filterType": "PERCENT_PRICE_BY_SIDE",
        //             "bidMultiplierUp": "1.5",
        //             "bidMultiplierDown": "0.5",
        //             "askMultiplierUp": "1.5",
        //             "askMultiplierDown": "0.5"
        //           },
        //           {
        //             "filterType": "INDEX_PRICE_FILTER",
        //             "multiplierUp": "1.3",
        //             "multiplierDown": "0.7"
        //           }
        //         ],
        //         "cappedLeverage": "25",
        //         "maintenanceMarginTiers": [
        //           {
        //             "tier": "1",
        //             "minMaintenanceMargin": "0",
        //             "maxMaintenanceMargin": "2500",
        //             "leverage": "25"
        //           },
        //           {
        //             "tier": "2",
        //             "minMaintenanceMargin": "2500",
        //             "maxMaintenanceMargin": "12500",
        //             "leverage": "20"
        //           },
        //           {
        //             "tier": "3",
        //             "minMaintenanceMargin": "12500",
        //             "maxMaintenanceMargin": "25000",
        //             "leverage": "15"
        //           },
        //           {
        //             "tier": "4",
        //             "minMaintenanceMargin": "25000",
        //             "maxMaintenanceMargin": "50000",
        //             "leverage": "10"
        //           },
        //           {
        //             "tier": "5",
        //             "minMaintenanceMargin": "50000",
        //             "maxMaintenanceMargin": "75000",
        //             "leverage": "8"
        //           },
        //           {
        //             "tier": "6",
        //             "minMaintenanceMargin": "75000",
        //             "maxMaintenanceMargin": "125000",
        //             "leverage": "7"
        //           },
        //           {
        //             "tier": "7",
        //             "minMaintenanceMargin": "125000",
        //             "maxMaintenanceMargin": "187500",
        //             "leverage": "5"
        //           },
        //           {
        //             "tier": "8",
        //             "minMaintenanceMargin": "187500",
        //             "maxMaintenanceMargin": "250000",
        //             "leverage": "3"
        //           },
        //           {
        //             "tier": "9",
        //             "minMaintenanceMargin": "250000",
        //             "maxMaintenanceMargin": "375000",
        //             "leverage": "2"
        //           },
        //           {
        //             "tier": "10",
        //             "minMaintenanceMargin": "375000",
        //             "maxMaintenanceMargin": "500000",
        //             "leverage": "1"
        //           }
        //         ],
        //         "fees": {
        //           "maker": "0.08",
        //           "taker": "0.1"
        //         }
        //       },
        //     ]
        // }
        //
        const activeMarkets = this.safeList(responses[0], 'data');
        const activeMarketsByType = this.indexBy(activeMarkets, 'market');
        const marketMetadatas = this.safeList(responses[1], 'data');
        for (let i = 0; i < marketMetadatas.length; i++) {
            const marketId = marketMetadatas[i]['market'];
            let status = undefined;
            if (marketId in activeMarketsByType) {
                status = activeMarketsByType[marketId]['status'];
            }
            marketMetadatas[i]['status'] = status;
        }
        return this.parseMarkets(marketMetadatas);
    }
    parseMarket(market) {
        const marketId = this.safeString(market, 'market');
        const parts = marketId.split('_');
        const baseId = this.safeString(parts, 0);
        const quoteId = this.safeString(parts, 1);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = base + '/' + quote + ':' + quote;
        const filters = this.safeList(market, 'filters', []);
        const fees = this.safeDict(market, 'fees', {});
        const filtersByType = this.indexBy(filters, 'filterType');
        const priceFilter = this.safeDict(filtersByType, 'PRICE_FILTER', {});
        const lotFilter = this.safeDict(filtersByType, 'LOT_SIZE', {});
        const marketLotFilter = this.safeDict(filtersByType, 'MARKET_LOT_SIZE', {});
        const notionalFilter = this.safeDict(filtersByType, 'NOTIONAL', {});
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': quoteId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeString(market, 'status', '') === 'active',
            'contract': true,
            'linear': true,
            'inverse': false,
            'taker': this.safeNumber(fees, 'taker'),
            'maker': this.safeNumber(fees, 'maker'),
            'contractSize': this.parseNumber('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(lotFilter, 'stepSize'),
                'price': this.safeNumber(priceFilter, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeNumber(market, 'cappedLeverage'),
                },
                'amount': {
                    'min': this.safeNumber(lotFilter, 'minQty'),
                    'max': this.safeNumber(lotFilter, 'maxQty'),
                },
                'price': {
                    'min': this.safeNumber(priceFilter, 'minPrice'),
                    'max': this.safeNumber(priceFilter, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber(notionalFilter, 'minNotional'),
                    'max': undefined,
                },
                'market': {
                    'min': this.safeNumber(marketLotFilter, 'minQty'),
                    'max': this.safeNumber(marketLotFilter, 'maxQty'),
                },
            },
            'created': undefined,
            'info': market,
        };
    }
    /**
     * @method
     * @name defx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.defx.com/#fe6f81d0-2f3a-4eee-976f-c8fc8f4c5d56
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetSymbolsSymbolTicker24hr(this.extend(request, params));
        //
        // {
        //     "symbol": "BTC_USDC",
        //     "priceChange": "0",
        //     "priceChangePercent": "0",
        //     "weightedAvgPrice": "0",
        //     "lastPrice": "2.00",
        //     "lastQty": "10.000",
        //     "bestBidPrice": "1646.00",
        //     "bestBidQty": "10.000",
        //     "bestAskPrice": "1646.00",
        //     "bestAskQty": "10.000",
        //     "openPrice": "0.00",
        //     "highPrice": "0.00",
        //     "lowPrice": "0.00",
        //     "volume": "0.000",
        //     "quoteVolume": "0.00",
        //     "openTime": 1700142658697,
        //     "closeTime": 1700142658697,
        //     "openInterestBase": "1.000",
        //     "openInterestQuote": "0.43112300"
        // }
        //
        return this.parseTicker(response, market);
    }
    /**
     * @method
     * @name defx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api-docs.defx.com/#8c61cfbd-40d9-410e-b014-f5b36eba51d1
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            const firstSymbol = this.safeString(symbols, 0);
            if (firstSymbol !== undefined) {
                market = this.market(firstSymbol);
            }
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        if (type === 'spot') {
            throw new errors.NotSupported(this.id + ' fetchTickers() is not supported for ' + type + ' markets');
        }
        const response = await this.v1PublicGetTicker24HrAgg(params);
        //
        // {
        //     "ETH_USDC": {
        //       "priceChange": "0",
        //       "priceChangePercent": "0",
        //       "openPrice": "1646.15",
        //       "highPrice": "1646.15",
        //       "lowPrice": "1646.15",
        //       "lastPrice": "1646.15",
        //       "quoteVolume": "13.17",
        //       "volume": "0.008",
        //       "markPrice": "1645.15"
        //     }
        // }
        //
        return this.parseTickers(response, symbols);
    }
    parseTicker(ticker, market = undefined) {
        //
        // fetchTicker
        //
        // {
        //     "symbol": "BTC_USDC",
        //     "priceChange": "0",
        //     "priceChangePercent": "0",
        //     "weightedAvgPrice": "0",
        //     "lastPrice": "2.00",
        //     "lastQty": "10.000",
        //     "bestBidPrice": "1646.00",
        //     "bestBidQty": "10.000",
        //     "bestAskPrice": "1646.00",
        //     "bestAskQty": "10.000",
        //     "openPrice": "0.00",
        //     "highPrice": "0.00",
        //     "lowPrice": "0.00",
        //     "volume": "0.000",
        //     "quoteVolume": "0.00",
        //     "openTime": 1700142658697,
        //     "closeTime": 1700142658697,
        //     "openInterestBase": "1.000",
        //     "openInterestQuote": "0.43112300"
        // }
        //
        // fetchTickers
        //
        //     "ETH_USDC": {
        //       "priceChange": "0",
        //       "priceChangePercent": "0",
        //       "openPrice": "1646.15",
        //       "highPrice": "1646.15",
        //       "lowPrice": "1646.15",
        //       "lastPrice": "1646.15",
        //       "quoteVolume": "13.17",
        //       "volume": "0.008",
        //       "markPrice": "1645.15"
        //     }
        //
        // fetchMarkPrice
        //
        // {
        //     "markPrice": "100.00",
        //     "indexPrice": "100.00",
        //     "ltp": "101.34",
        //     "movingFundingRate": "0.08",
        //     "payoutFundingRate": "-0.03",
        //     "nextFundingPayout": 1711555532146
        // }
        //
        const marketId = this.safeString(ticker, 'symbol');
        if (marketId !== undefined) {
            market = this.market(marketId);
        }
        const symbol = market['symbol'];
        const open = this.safeString(ticker, 'openPrice');
        const high = this.safeString(ticker, 'highPrice');
        const low = this.safeString(ticker, 'lowPrice');
        const close = this.safeString(ticker, 'lastPrice');
        const quoteVolume = this.safeString(ticker, 'quoteVolume');
        const baseVolume = this.safeString(ticker, 'volume');
        const percentage = this.safeString(ticker, 'priceChangePercent');
        const change = this.safeString(ticker, 'priceChange');
        let ts = this.safeInteger(ticker, 'closeTime');
        if (ts === 0) {
            ts = undefined;
        }
        const datetime = this.iso8601(ts);
        const bid = this.safeString(ticker, 'bestBidPrice');
        const bidVolume = this.safeString(ticker, 'bestBidQty');
        const ask = this.safeString(ticker, 'bestAskPrice');
        const askVolume = this.safeString(ticker, 'bestAskQty');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': ts,
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': undefined,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': this.safeString(ticker, 'markPrice'),
            'indexPrice': this.safeString(ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name defx#fetchOHLCV
     * @see https://api-docs.defx.com/#54b71951-1472-4670-b5af-4c2dc41e73d0
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const maxLimit = 1000;
        if (limit === undefined) {
            limit = maxLimit;
        }
        limit = Math.min(maxLimit, limit);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
            'limit': limit,
        };
        const until = this.safeInteger2(params, 'until', 'till');
        params = this.omit(params, ['until', 'till']);
        request['endTime'] = (until === undefined) ? this.milliseconds() : until;
        if (since === undefined) {
            request['startTime'] = 0;
        }
        else {
            request['startTime'] = since;
            if (until === undefined) {
                const timeframeInSeconds = this.parseTimeframe(timeframe);
                const timeframeInMilliseconds = timeframeInSeconds * 1000;
                const totalTimeframeInMilliseconds = limit * timeframeInMilliseconds;
                request['endTime'] = this.sum(since, totalTimeframeInMilliseconds);
            }
        }
        const response = await this.v1PublicGetSymbolsSymbolOhlc(this.extend(request, params));
        //
        // [
        //     {
        //       "symbol": "BTC_USDC",
        //       "open": "0.00",
        //       "high": "0.00",
        //       "low": "0.00",
        //       "close": "0.00",
        //       "volume": "0.000",
        //       "quoteAssetVolume": "0.00",
        //       "takerBuyAssetVolume": "0.000",
        //       "takerBuyQuoteAssetVolume": "0.00",
        //       "numberOfTrades": 0,
        //       "start": 1702453663894,
        //       "end": 1702453663894,
        //       "isClosed": true
        //     }
        // ]
        //
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        // example response in fetchOHLCV
        return [
            this.safeInteger(ohlcv, 'start'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    /**
     * @method
     * @name defx#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.defx.com/#5865452f-ea32-4f13-bfbc-03af5f5574fd
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const maxLimit = 50;
        if (limit === undefined) {
            limit = maxLimit;
        }
        limit = Math.min(maxLimit, limit);
        const request = {
            'symbol': market['id'],
            'limit': limit,
        };
        const response = await this.v1PublicGetSymbolsSymbolTrades(this.extend(request, params));
        //
        // [
        //     {
        //       "buyerMaker": "false",
        //       "price": "2.0000",
        //       "qty": "10.0000",
        //       "symbol": "BTC_USDC",
        //       "timestamp": "1702453663894"
        //     }
        // ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    /**
     * @method
     * @name defx#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api-docs.defx.com/#06b5b33c-2fc6-48de-896c-fc316f5871a7
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbols'] = market['id'];
        }
        if (limit !== undefined) {
            const maxLimit = 100;
            limit = Math.min(maxLimit, limit);
            request['pageSize'] = limit;
        }
        const response = await this.v1PrivateGetApiTrades(this.extend(request, params));
        //
        // {
        //     "data": [
        //         {
        //             "id": "0192f665-c05b-7ba0-a080-8b6c99083489",
        //             "orderId": "757730811259651728",
        //             "time": "2024-11-04T08:58:36.474Z",
        //             "symbol": "SOL_USDC",
        //             "side": "SELL",
        //             "price": "160.43600000",
        //             "qty": "1.00",
        //             "fee": "0.08823980",
        //             "role": "TAKER",
        //             "pnl": "0.00000000"
        //         }
        //     ]
        // }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, undefined, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //     {
        //       "buyerMaker": "false",
        //       "price": "2.0000",
        //       "qty": "10.0000",
        //       "symbol": "BTC_USDC",
        //       "timestamp": "1702453663894"
        //     }
        //
        // fetchMyTrades
        //     {
        //         "id": "0192f665-c05b-7ba0-a080-8b6c99083489",
        //         "orderId": "757730811259651728",
        //         "time": "2024-11-04T08:58:36.474Z",
        //         "symbol": "SOL_USDC",
        //         "side": "SELL",
        //         "price": "160.43600000",
        //         "qty": "1.00",
        //         "fee": "0.08823980",
        //         "role": "TAKER",
        //         "pnl": "0.00000000"
        //     }
        //
        const time = this.safeString(trade, 'time');
        const timestamp = this.safeInteger(trade, 'timestamp', this.parse8601(time));
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString(trade, 'price');
        const amount = this.safeString(trade, 'qty');
        const id = this.safeString(trade, 'id');
        const oid = this.safeString(trade, 'orderId');
        const takerOrMaker = this.safeStringLower(trade, 'role');
        const buyerMaker = this.safeBool(trade, 'buyerMaker');
        let side = this.safeStringLower(trade, 'side');
        if (buyerMaker !== undefined) {
            if (buyerMaker) {
                side = 'sell';
            }
            else {
                side = 'buy';
            }
        }
        return this.safeTrade({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': oid,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': {
                'cost': this.safeString(trade, 'fee'),
                'currency': 'USDC',
            },
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name defx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.defx.com/#6c1a2971-8325-4e7d-9962-e0bfcaacf9c4
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.slab] slab from market.info.depthSlabs
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (limit === undefined) {
            limit = 10; // limit must be one of [5, 10, 20]
        }
        const marketInfo = this.safeDict(market, 'info', {});
        const slab = this.safeList(marketInfo, 'depthSlabs', []);
        const request = {
            'symbol': market['id'],
            'level': limit,
            'slab': this.safeString(slab, 0),
        };
        const response = await this.v1PublicGetSymbolsSymbolDepthLevelSlab(this.extend(request, params));
        //
        // {
        //     "symbol": "ETH_USDC",
        //     "level": "5",
        //     "slab": "1",
        //     "lastTradeTimestamp": "1708313446812",
        //     "timestamp": "1708313446812",
        //     "bids": [
        //       {
        //         "price": "1646.16",
        //         "qty": "0.001"
        //       }
        //     ],
        //     "asks": [
        //       {
        //         "price": "1646.16",
        //         "qty": "0.001"
        //       }
        //     ]
        // }
        //
        const timestamp = this.safeInteger(response, 'timestamp');
        return this.parseOrderBook(response, symbol, timestamp, 'bids', 'asks', 'price', 'qty');
    }
    /**
     * @method
     * @name defx#fetchMarkPrice
     * @description fetches mark price for the market
     * @see https://api-docs.defx.com/#12168192-4e7b-4458-a001-e8b80961f0b7
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchMarkPrice(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetSymbolsSymbolPrices(this.extend(request, params));
        //
        // {
        //     "markPrice": "100.00",
        //     "indexPrice": "100.00",
        //     "ltp": "101.34",
        //     "movingFundingRate": "0.08",
        //     "payoutFundingRate": "-0.03",
        //     "nextFundingPayout": 1711555532146
        // }
        //
        return this.parseTicker(response, market);
    }
    /**
     * @method
     * @name defx#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://api-docs.defx.com/#12168192-4e7b-4458-a001-e8b80961f0b7
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetSymbolsSymbolPrices(this.extend(request, params));
        //
        // {
        //     "markPrice": "100.00",
        //     "indexPrice": "100.00",
        //     "ltp": "101.34",
        //     "movingFundingRate": "0.08",
        //     "payoutFundingRate": "-0.03",
        //     "nextFundingPayout": 1711555532146
        // }
        //
        return this.parseFundingRate(response, market);
    }
    parseFundingRate(contract, market = undefined) {
        //
        // {
        //     "markPrice": "100.00",
        //     "indexPrice": "100.00",
        //     "ltp": "101.34",
        //     "movingFundingRate": "0.08",
        //     "payoutFundingRate": "-0.03",
        //     "nextFundingPayout": 1711555532146
        // }
        //
        const markPrice = this.safeNumber(contract, 'markPrice');
        const indexPrice = this.safeNumber(contract, 'indexPrice');
        const fundingRate = this.safeNumber(contract, 'payoutFundingRate');
        const fundingTime = this.safeInteger(contract, 'nextFundingPayout');
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTime,
            'fundingDatetime': this.iso8601(fundingTime),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        };
    }
    /**
     * @method
     * @name defx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs.defx.com/#26414338-14f7-40a1-b246-f8ea8571493f
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetApiWalletBalance(params);
        //
        // {
        //     "assets": [
        //       {
        //         "asset": "USDC",
        //         "balance": "0.000"
        //       }
        //     ]
        // }
        //
        const data = this.safeList(response, 'assets');
        return this.parseBalance(data);
    }
    parseBalance(balances) {
        const result = {
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode(this.safeString(balance, 'asset'));
            const account = this.account();
            account['total'] = this.safeString(balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name defx#createOrder
     * @description create a trade order
     * @see https://api-docs.defx.com/#ba222d88-8856-4d3c-87a9-7cec07bb2622
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {string} [params.reduceOnly] for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only');
        params = this.omit(params, ['reduceOnly', 'reduce_only']);
        const orderType = type.toUpperCase();
        const orderSide = side.toUpperCase();
        const request = {
            'symbol': market['id'],
            'side': orderSide,
            'type': orderType,
        };
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const triggerPrice = this.safeString2(params, 'stopPrice', 'triggerPrice');
        const isMarket = orderType === 'MARKET';
        const isLimit = orderType === 'LIMIT';
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        if (timeInForce !== undefined) {
            // GTC, IOC, FOK, AON
            request['timeInForce'] = timeInForce;
        }
        else {
            if (isLimit) {
                request['timeInForce'] = 'GTC';
            }
        }
        if (reduceOnly) {
            request['reduceOnly'] = reduceOnly;
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
        }
        if (triggerPrice !== undefined || takeProfitPrice !== undefined) {
            request['workingType'] = 'MARK_PRICE';
            if (takeProfitPrice !== undefined) {
                request['stopPrice'] = this.priceToPrecision(symbol, takeProfitPrice);
                if (isMarket) {
                    request['type'] = 'TAKE_PROFIT_MARKET';
                }
                else {
                    request['type'] = 'TAKE_PROFIT_LIMIT';
                }
            }
            else {
                request['stopPrice'] = this.priceToPrecision(symbol, triggerPrice);
                if (isMarket) {
                    request['type'] = 'STOP_MARKET';
                }
                else {
                    request['type'] = 'STOP_LIMIT';
                }
            }
        }
        if (isLimit && price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        request['quantity'] = this.amountToPrecision(symbol, amount);
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'takeProfitPrice']);
        const response = await this.v1PrivatePostApiOrder(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "data": {
        //       "orderId": "",
        //       "clientOrderId": "",
        //       "cumulativeQty": "",
        //       "cumulativeQuote": "",
        //       "executedQty": "",
        //       "avgPrice": "",
        //       "origQty": "",
        //       "price": "",
        //       "reduceOnly": true,
        //       "side": "",
        //       "status": "",
        //       "symbol": "",
        //       "timeInForce": "",
        //       "type": "",
        //       "workingType": ""
        //     }
        // }
        //
        const data = this.safeDict(response, 'data');
        return this.parseOrder(data, market);
    }
    parseOrderStatus(status) {
        if (status !== undefined) {
            const statuses = {
                'NEW': 'open',
                'OPEN': 'open',
                'CANCELLED': 'canceled',
                'REJECTED': 'rejected',
                'FILLED': 'closed',
            };
            return this.safeString(statuses, status, status);
        }
        return status;
    }
    parseOrder(order, market = undefined) {
        //
        // {
        //     "orderId": "746472647227344528",
        //     "createdAt": "2024-10-25T16:49:31.077Z",
        //     "updatedAt": "2024-10-25T16:49:31.378Z",
        //     "clientOrderId": "0192c495-49c3-71ee-b3d3-7442a2090807",
        //     "reduceOnly": false,
        //     "side": "SELL",
        //     "status": "FILLED",
        //     "symbol": "SOL_USDC",
        //     "timeInForce": "GTC",
        //     "type": "MARKET",
        //     "origQty": "0.80",
        //     "executedQty": "0.80",
        //     "cumulativeQuote": "137.87440000",
        //     "avgPrice": "172.34300000",
        //     "totalPnL": "0.00000000",
        //     "totalFee": "0.07583092",
        //     "workingType": null,
        //     "postOnly": false,
        //     "linkedOrderParentType": null,
        //     "isTriggered": false,
        //     "slippagePercentage": "5"
        // }
        //
        const orderId = this.safeString(order, 'orderId');
        const clientOrderId = this.safeString(order, 'clientOrderId');
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString(order, 'price');
        const amount = this.safeString(order, 'origQty');
        const orderType = this.safeStringLower(order, 'type');
        const status = this.safeString(order, 'status');
        const side = this.safeStringLower(order, 'side');
        const filled = this.omitZero(this.safeString(order, 'executedQty'));
        const average = this.omitZero(this.safeString(order, 'avgPrice'));
        const timeInForce = this.safeStringLower(order, 'timeInForce');
        let takeProfitPrice = undefined;
        let triggerPrice = undefined;
        if (orderType !== undefined) {
            if (orderType.indexOf('take_profit') >= 0) {
                takeProfitPrice = this.safeString(order, 'stopPrice');
            }
            else {
                triggerPrice = this.safeString(order, 'stopPrice');
            }
        }
        const timestamp = this.parse8601(this.safeString(order, 'createdAt'));
        const lastTradeTimestamp = this.parse8601(this.safeString(order, 'updatedAt'));
        return this.safeOrder({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastTradeTimestamp,
            'status': this.parseOrderStatus(status),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': this.safeBool(order, 'postOnly'),
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': undefined,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': {
                'cost': this.safeString(order, 'totalFee'),
                'currency': 'USDC',
            },
            'info': order,
        }, market);
    }
    /**
     * @method
     * @name defx#cancelOrder
     * @see https://api-docs.defx.com/#09186f23-f8d1-4993-acf4-9974d8a6ddb0
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderId': id,
            'idType': 'orderId',
        };
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        const isByClientOrder = clientOrderId !== undefined;
        if (isByClientOrder) {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
            }
            const market = this.market(symbol);
            request['orderId'] = clientOrderId;
            request['idType'] = 'clientOrderId';
            request['symbol'] = market['id'];
        }
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        const response = await this.v1PrivateDeleteApiOrderOrderId(this.extend(request, params));
        //
        // {
        //     "success": true
        // }
        //
        const extendParams = { 'symbol': symbol };
        if (isByClientOrder) {
            extendParams['clientOrderId'] = clientOrderId;
        }
        else {
            extendParams['id'] = id;
        }
        return this.extend(this.parseOrder(response), extendParams);
    }
    /**
     * @method
     * @name defx#cancelAllOrders
     * @description cancel all open orders
     * @see https://api-docs.defx.com/#db5531da-3692-4a53-841f-6ad6495f823a
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbols': [market['id']],
        };
        const response = await this.v1PrivateDeleteApiOrdersAllOpen(this.extend(request, params));
        //
        // {
        //     "data": {
        //         "msg": "The operation of cancel all open order is done."
        //     }
        // }
        //
        return response;
    }
    /**
     * @method
     * @name defx#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://api-docs.defx.com/#d89dbb86-9aba-4f59-ac5d-a97ff25ea80e
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchPosition() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PrivateGetApiPositionActive(this.extend(request, params));
        //
        // {
        //     "data": [
        //         {
        //             "positionId": "0192c495-4a68-70ee-9081-9d368bd16dfc",
        //             "symbol": "SOL_USDC",
        //             "positionSide": "SHORT",
        //             "entryPrice": "172.34300000",
        //             "quantity": "0.80",
        //             "marginAmount": "20.11561173",
        //             "marginAsset": "USDC",
        //             "pnl": "0.00000000"
        //         }
        //     ]
        // }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.parsePosition(first, market);
    }
    /**
     * @method
     * @name defx#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.defx.com/#d89dbb86-9aba-4f59-ac5d-a97ff25ea80e
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetApiPositionActive(params);
        //
        // {
        //     "data": [
        //         {
        //             "positionId": "0192c495-4a68-70ee-9081-9d368bd16dfc",
        //             "symbol": "SOL_USDC",
        //             "positionSide": "SHORT",
        //             "entryPrice": "172.34300000",
        //             "quantity": "0.80",
        //             "marginAmount": "20.11561173",
        //             "marginAsset": "USDC",
        //             "pnl": "0.00000000"
        //         }
        //     ]
        // }
        //
        const positions = this.safeList(response, 'data', []);
        return this.parsePositions(positions, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        // {
        //     "positionId": "0192c495-4a68-70ee-9081-9d368bd16dfc",
        //     "symbol": "SOL_USDC",
        //     "positionSide": "SHORT",
        //     "entryPrice": "172.34300000",
        //     "quantity": "0.80",
        //     "marginAmount": "20.11561173",
        //     "marginAsset": "USDC",
        //     "pnl": "0.00000000"
        // }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const size = Precise["default"].stringAbs(this.safeString(position, 'quantity'));
        const side = this.safeStringLower(position, 'positionSide');
        const unrealisedPnl = this.omitZero(this.safeString(position, 'pnl'));
        const entryPrice = this.omitZero(this.safeString(position, 'entryPrice'));
        const initialMargin = this.safeString(position, 'marginAmount');
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'positionId'),
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.parseNumber(initialMargin),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber(entryPrice),
            'notional': undefined,
            'leverage': undefined,
            'unrealizedPnl': this.parseNumber(unrealisedPnl),
            'realizedPnl': undefined,
            'contracts': this.parseNumber(size),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'hedged': undefined,
        });
    }
    /**
     * @method
     * @name defx#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs.defx.com/#44f82dd5-26b3-4e1f-b4aa-88ceddd65237
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderId': id,
            'idType': 'orderId',
        };
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        if (clientOrderId !== undefined) {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
            }
            const market = this.market(symbol);
            request['orderId'] = clientOrderId;
            request['idType'] = 'clientOrderId';
            request['symbol'] = market['id'];
        }
        const response = await this.v1PrivateGetApiOrderOrderId(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "data": {
        //         "orderId": "555068654076559792",
        //         "createdAt": "2024-05-08T05:45:42.148Z",
        //         "updatedAt": "2024-05-08T05:45:42.166Z",
        //         "clientOrderId": "dummyClientOrderId",
        //         "reduceOnly": false,
        //         "side": "SELL",
        //         "status": "REJECTED",
        //         "symbol": "BTC_USDC",
        //         "timeInForce": "GTC",
        //         "type": "TAKE_PROFIT_MARKET",
        //         "origQty": "1.000",
        //         "executedQty": "0.000",
        //         "cumulativeQuote": "0.00",
        //         "avgPrice": "0.00",
        //         "stopPrice": "65000.00",
        //         "totalPnL": "0.00",
        //         "workingType": "MARK_PRICE",
        //         "postOnly": false
        //     }
        // }
        //
        const data = this.safeDict(response, 'data');
        return this.parseOrder(data);
    }
    /**
     * @method
     * @name defx#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.defx.com/#ab200038-8acb-4170-b05e-4fcb4cc13751
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbols'] = market['id'];
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['end'] = this.iso8601(until);
        }
        if (since !== undefined) {
            request['start'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            const maxLimit = 100;
            limit = Math.min(maxLimit, limit);
            request['pageSize'] = limit;
        }
        const response = await this.v1PrivateGetApiOrders(this.extend(request, params));
        //
        // {
        //     "data": [
        //         {
        //             "orderId": "746472647227344528",
        //             "createdAt": "2024-10-25T16:49:31.077Z",
        //             "updatedAt": "2024-10-25T16:49:31.378Z",
        //             "clientOrderId": "0192c495-49c3-71ee-b3d3-7442a2090807",
        //             "reduceOnly": false,
        //             "side": "SELL",
        //             "status": "FILLED",
        //             "symbol": "SOL_USDC",
        //             "timeInForce": "GTC",
        //             "type": "MARKET",
        //             "origQty": "0.80",
        //             "executedQty": "0.80",
        //             "cumulativeQuote": "137.87440000",
        //             "avgPrice": "172.34300000",
        //             "totalPnL": "0.00000000",
        //             "totalFee": "0.07583092",
        //             "workingType": null,
        //             "postOnly": false,
        //             "linkedOrderParentType": null,
        //             "isTriggered": false,
        //             "slippagePercentage": 5
        //         }
        //     ]
        // }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, undefined, since, limit);
    }
    /**
     * @method
     * @name defx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-docs.defx.com/#ab200038-8acb-4170-b05e-4fcb4cc13751
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const req = {
            'statuses': 'OPEN',
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(req, params));
    }
    /**
     * @method
     * @name defx#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api-docs.defx.com/#ab200038-8acb-4170-b05e-4fcb4cc13751
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const req = {
            'statuses': 'FILLED',
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(req, params));
    }
    /**
     * @method
     * @name defx#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://api-docs.defx.com/#ab200038-8acb-4170-b05e-4fcb4cc13751
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const req = {
            'statuses': 'CANCELED',
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(req, params));
    }
    /**
     * @method
     * @name defx#closePosition
     * @description closes an open position for a market
     * @see https://api-docs.defx.com/#b2c08074-c4d9-4e50-b637-0d6c498fa29e
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] one-way mode: 'buy' or 'sell', hedge-mode: 'long' or 'short'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] the position id you want to close
     * @param {string} [params.type] 'MARKET' or 'LIMIT'
     * @param {string} [params.quantity] how much of currency you want to trade in units of base currency
     * @param {string} [params.price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async closePosition(symbol, side = undefined, params = {}) {
        await this.loadMarkets();
        const positionId = this.safeString(params, 'positionId');
        if (positionId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' closePosition() requires a positionId');
        }
        const type = this.safeStringUpper(params, 'type');
        if (type === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' closePosition() requires a type');
        }
        const quantity = this.safeString(params, 'quantity');
        if (quantity === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' closePosition() requires a quantity');
        }
        const request = {
            'positionId': positionId,
            'type': type,
            'quantity': quantity,
        };
        if (type !== 'MARKET') {
            const price = this.safeString(params, 'price');
            if (price === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' closePosition() requires a price');
            }
            request['price'] = price;
        }
        params = this.omit(params, ['positionId', 'type', 'quantity', 'price']);
        const response = await this.v1PrivateDeleteApiPositionPositionId(this.extend(request, params));
        //
        //     {}
        //
        return response;
    }
    /**
     * @method
     * @name defx#closeAllPositions
     * @description closes all open positions for a market type
     * @see https://api-docs.defx.com/#d6f63b43-100e-47a9-998c-8b6c0c72d204
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} A list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async closeAllPositions(params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateDeleteApiPositionAll(params);
        //
        // {
        //     "data": [
        //         {
        //             "positionId": "d6ca1a27-28ad-47ae-b244-0bda5ac37b2b",
        //             "success": true
        //         }
        //     ]
        // }
        //
        const data = this.safeList(response, 'data', []);
        return this.parsePositions(data, undefined, params);
    }
    /**
     * @method
     * @name defx#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://api-docs.defx.com/#38cc8974-794f-48c0-b959-db045a0ee565
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchLedger', code, since, limit, params);
        }
        const request = {};
        if (since !== undefined) {
            request['start'] = since;
        }
        else {
            request['start'] = 0;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['end'] = until;
        }
        else {
            request['end'] = this.milliseconds();
        }
        const response = await this.v1PrivateGetApiWalletTransactions(this.extend(request, params));
        const data = this.safeList(response, 'transactions', []);
        return this.parseLedger(data, undefined, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        // {
        //     "id": "01JCSZS6H5VQND3GF5P98SJ29C",
        //     "timestamp": 1731744012054,
        //     "type": "FundingFee",
        //     "amount": "0.02189287",
        //     "asset": "USDC",
        //     "operation": "CREDIT"
        // }
        //
        const amount = this.safeString(item, 'amount');
        const currencyId = this.safeString(item, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const timestamp = this.safeInteger(item, 'timestamp');
        const type = this.safeString(item, 'type');
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString(item, 'id'),
            'direction': undefined,
            'account': undefined,
            'referenceAccount': undefined,
            'referenceId': undefined,
            'type': this.parseLedgerEntryType(type),
            'currency': code,
            'amount': this.parseNumber(amount),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency);
    }
    parseLedgerEntryType(type) {
        const ledgerType = {
            'FundingFee': 'fee',
            'FeeRebate': 'fee',
            'FeeKickback': 'fee',
            'RealizedPnl': 'trade',
            'LiquidationClearance': 'trade',
            'Transfer': 'transfer',
            'ReferralPayout': 'referral',
            'Commission': 'commission',
        };
        return this.safeString(ledgerType, type, type);
    }
    /**
     * @method
     * @name defx#withdraw
     * @description make a withdrawal
     * @see https://api-docs.defx.com/#2600f503-63ed-4672-b8f6-69ea5f03203b
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'amount': this.currencyToPrecision(code, amount),
            'asset': currency['id'],
            // 'network': 'ARB_SEPOLIA',
            // 'chainId': '421614',
        };
        const response = await this.v1PrivatePostApiTransfersBridgeWithdrawal(this.extend(request, params));
        //
        // {
        //     "transactionId": "0x301e5851e5aefa733abfbc8b30817ca3b61601e0ddf1df8c59656fb888b0bc9c"
        // }
        //
        return this.parseTransaction(response, currency);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // withdraw
        //
        // {
        //     "transactionId": "0x301e5851e5aefa733abfbc8b30817ca3b61601e0ddf1df8c59656fb888b0bc9c"
        // }
        //
        const txid = this.safeString(transaction, 'transactionId');
        return {
            'info': transaction,
            'id': undefined,
            'txid': txid,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': undefined,
            'amount': undefined,
            'currency': this.safeCurrencyCode(undefined, currency),
            'status': undefined,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }
    /**
     * @method
     * @name defx#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.defx.com/#4cb4ecc4-6c61-4194-8353-be67faaf7ca7
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        const request = {
            'leverage': this.numberToString(leverage),
        };
        const market = this.market(symbol);
        request['symbol'] = market['id'];
        const response = await this.v1PrivatePostApiUsersMetadataLeverage(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "data": {
        //       "leverage": "11",
        //       "symbol": "BTC_USDC"
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        //
        //     "data": {
        //       "leverage": "11",
        //       "symbol": "BTC_USDC"
        //     }
        //
        const marketId = this.safeString(leverage, 'symbol');
        const leverageValue = this.safeInteger(leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': undefined,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = section[0];
        const access = section[1];
        const pathWithParams = this.implodeParams(path, params);
        let url = this.implodeHostname(this.urls['api'][access]);
        url += '/' + version + '/';
        params = this.omit(params, this.extractParams(path));
        params = this.keysort(params);
        if (access === 'public') {
            url += 'open/' + pathWithParams;
            if (Object.keys(params).length) {
                url += '?' + this.rawencode(params);
            }
        }
        else {
            this.checkRequiredCredentials();
            headers = { 'X-DEFX-SOURCE': 'ccxt' };
            url += 'auth/' + pathWithParams;
            const nonce = this.milliseconds().toString();
            let payload = nonce;
            if (method === 'GET' || path === 'api/order/{orderId}') {
                payload += this.rawencode(params);
                if (Object.keys(params).length) {
                    url += '?' + this.rawencode(params);
                }
            }
            else {
                if (params !== undefined) {
                    body = this.json(params);
                    payload += body;
                }
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256.sha256);
            headers['X-DEFX-APIKEY'] = this.apiKey;
            headers['X-DEFX-TIMESTAMP'] = nonce;
            headers['X-DEFX-SIGNATURE'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        // {"errorCode":404,"errorMessage":"Not Found"}
        // {"msg":"Missing auth signature","code":"missing_auth_signature"}
        // {"success":false,"err":{"msg":"Invalid order id","code":"invalid_order_id"}}
        const success = this.safeBool(response, 'success');
        const err = this.safeDict(response, 'err', response);
        const errorCode = this.safeString2(err, 'errorCode', 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json(response);
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
        }
        return undefined;
    }
    defaultNetworkCodeForCurrency(code) {
        const currencyItem = this.currency(code);
        const networks = currencyItem['networks'];
        const networkKeys = Object.keys(networks);
        for (let i = 0; i < networkKeys.length; i++) {
            const network = networkKeys[i];
            if (network === 'ETH') {
                return network;
            }
        }
        // if it was not returned according to above options, then return the first network of currency
        return this.safeValue(networkKeys, 0);
    }
    setSandboxMode(enable) {
        super.setSandboxMode(enable);
        this.options['sandboxMode'] = enable;
    }
}

module.exports = defx;
