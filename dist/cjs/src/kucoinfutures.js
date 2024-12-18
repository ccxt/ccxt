'use strict';

var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var kucoinfutures$1 = require('./abstract/kucoinfutures.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class kucoinfutures
 * @augments Exchange
 */
class kucoinfutures extends kucoinfutures$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'kucoinfutures',
            'name': 'KuCoin Futures',
            'countries': ['SC'],
            'rateLimit': 75,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'comment': 'Platform 2.0',
            'quoteJsonNumbers': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': true,
                'closePositions': false,
                'createDepositAddress': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTriggerOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingInterval': true,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': true,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrice': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTransactionFee': false,
                'fetchWithdrawals': true,
                'setLeverage': false,
                'setMarginMode': true,
                'transfer': true,
                'withdraw': undefined,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg',
                'doc': [
                    'https://docs.kucoin.com/futures',
                    'https://docs.kucoin.com',
                ],
                'www': 'https://futures.kucoin.com/',
                'referral': 'https://futures.kucoin.com/?rcode=E5wkqe',
                'api': {
                    'public': 'https://openapi-v2.kucoin.com',
                    'private': 'https://openapi-v2.kucoin.com',
                    'futuresPrivate': 'https://api-futures.kucoin.com',
                    'futuresPublic': 'https://api-futures.kucoin.com',
                    'webExchange': 'https://futures.kucoin.com/_api/web-front',
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'futuresPublic': {
                    'get': {
                        'contracts/active': 1,
                        'contracts/{symbol}': 1,
                        'contracts/risk-limit/{symbol}': 1,
                        'ticker': 1,
                        'allTickers': 1,
                        'level2/snapshot': 1.33,
                        'level2/depth{limit}': 1,
                        'level2/message/query': 1,
                        'level3/message/query': 1,
                        'level3/snapshot': 1,
                        'trade/history': 1,
                        'interest/query': 1,
                        'index/query': 1,
                        'mark-price/{symbol}/current': 1,
                        'premium/query': 1,
                        'funding-rate/{symbol}/current': 1,
                        'timestamp': 1,
                        'status': 1,
                        'kline/query': 1,
                    },
                    'post': {
                        'bullet-public': 1,
                    },
                },
                'futuresPrivate': {
                    'get': {
                        'account-overview': 1.33,
                        'transaction-history': 4.44,
                        'deposit-address': 1,
                        'deposit-list': 1,
                        'withdrawals/quotas': 1,
                        'withdrawal-list': 1,
                        'transfer-list': 1,
                        'orders': 1.33,
                        'stopOrders': 1,
                        'recentDoneOrders': 1,
                        'orders/{orderId}': 1,
                        'orders/byClientOid': 1,
                        'fills': 4.44,
                        'recentFills': 4.44,
                        'openOrderStatistics': 1,
                        'position': 1,
                        'positions': 4.44,
                        'funding-history': 4.44,
                        'sub/api-key': 1,
                        'trade-statistics': 1,
                        'trade-fees': 1,
                        'history-positions': 1,
                        'getMaxOpenSize': 1,
                        'getCrossUserLeverage': 1,
                        'position/getMarginMode': 1,
                    },
                    'post': {
                        'withdrawals': 1,
                        'transfer-out': 1,
                        'transfer-in': 1,
                        'orders': 1.33,
                        'st-orders': 1.33,
                        'orders/test': 1.33,
                        'position/margin/auto-deposit-status': 1,
                        'position/margin/deposit-margin': 1,
                        'position/risk-limit-level/change': 1,
                        'bullet-private': 1,
                        'sub/api-key': 1,
                        'sub/api-key/update': 1,
                        'changeCrossUserLeverage': 1,
                        'position/changeMarginMode': 1,
                    },
                    'delete': {
                        'withdrawals/{withdrawalId}': 1,
                        'cancel/transfer-out': 1,
                        'orders/{orderId}': 1,
                        'orders': 4.44,
                        'stopOrders': 1,
                        'sub/api-key': 1,
                        'orders/client-order/{clientOid}': 1,
                        'orders/multi-cancel': 20,
                    },
                },
                'webExchange': {
                    'get': {
                        'contract/{symbol}/funding-rates': 1,
                    },
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    '400': errors.BadRequest,
                    '401': errors.AuthenticationError,
                    '403': errors.NotSupported,
                    '404': errors.NotSupported,
                    '405': errors.NotSupported,
                    '415': errors.BadRequest,
                    '429': errors.RateLimitExceeded,
                    '500': errors.ExchangeNotAvailable,
                    '503': errors.ExchangeNotAvailable,
                    '100001': errors.InvalidOrder,
                    '100004': errors.BadRequest,
                    '101030': errors.PermissionDenied,
                    '200004': errors.InsufficientFunds,
                    '230003': errors.InsufficientFunds,
                    '260100': errors.InsufficientFunds,
                    '300003': errors.InsufficientFunds,
                    '300012': errors.InvalidOrder,
                    '400001': errors.AuthenticationError,
                    '400002': errors.InvalidNonce,
                    '400003': errors.AuthenticationError,
                    '400004': errors.AuthenticationError,
                    '400005': errors.AuthenticationError,
                    '400006': errors.AuthenticationError,
                    '400007': errors.AuthenticationError,
                    '404000': errors.NotSupported,
                    '400100': errors.BadRequest,
                    '411100': errors.AccountSuspended,
                    '500000': errors.ExchangeNotAvailable,
                    '300009': errors.InvalidOrder, // {"msg":"No open positions to close.","code":"300009"}
                },
                'broad': {
                    'Position does not exist': errors.OrderNotFound, // { "code":"200000", "msg":"Position does not exist" }
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0006'),
                    'maker': this.parseNumber('0.0002'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0006')],
                            [this.parseNumber('50'), this.parseNumber('0.0006')],
                            [this.parseNumber('200'), this.parseNumber('0.0006')],
                            [this.parseNumber('500'), this.parseNumber('0.0005')],
                            [this.parseNumber('1000'), this.parseNumber('0.0004')],
                            [this.parseNumber('2000'), this.parseNumber('0.0004')],
                            [this.parseNumber('4000'), this.parseNumber('0.00038')],
                            [this.parseNumber('8000'), this.parseNumber('0.00035')],
                            [this.parseNumber('15000'), this.parseNumber('0.00032')],
                            [this.parseNumber('25000'), this.parseNumber('0.0003')],
                            [this.parseNumber('40000'), this.parseNumber('0.0003')],
                            [this.parseNumber('60000'), this.parseNumber('0.0003')],
                            [this.parseNumber('80000'), this.parseNumber('0.0003')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.02')],
                            [this.parseNumber('50'), this.parseNumber('0.015')],
                            [this.parseNumber('200'), this.parseNumber('0.01')],
                            [this.parseNumber('500'), this.parseNumber('0.01')],
                            [this.parseNumber('1000'), this.parseNumber('0.01')],
                            [this.parseNumber('2000'), this.parseNumber('0')],
                            [this.parseNumber('4000'), this.parseNumber('0')],
                            [this.parseNumber('8000'), this.parseNumber('0')],
                            [this.parseNumber('15000'), this.parseNumber('-0.003')],
                            [this.parseNumber('25000'), this.parseNumber('-0.006')],
                            [this.parseNumber('40000'), this.parseNumber('-0.009')],
                            [this.parseNumber('60000'), this.parseNumber('-0.012')],
                            [this.parseNumber('80000'), this.parseNumber('-0.015')],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
                'HOT': 'HOTNOW',
                'EDGE': 'DADI',
                'WAX': 'WAXP',
                'TRY': 'Trias',
                'VAI': 'VAIOT',
                'XBT': 'BTC',
            },
            'timeframes': {
                '1m': 1,
                '3m': undefined,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 240,
                '6h': undefined,
                '8h': 480,
                '12h': 720,
                '1d': 1440,
                '1w': 10080,
            },
            'options': {
                'version': 'v1',
                'symbolSeparator': '-',
                'defaultType': 'swap',
                'code': 'USDT',
                'marginModes': {},
                'marginTypes': {},
                // endpoint versions
                'versions': {
                    'futuresPrivate': {
                        'GET': {
                            'getMaxOpenSize': 'v2',
                            'getCrossUserLeverage': 'v2',
                            'position/getMarginMode': 'v2',
                        },
                        'POST': {
                            'transfer-out': 'v2',
                            'changeCrossUserLeverage': 'v2',
                            'position/changeMarginMode': 'v2',
                        },
                    },
                    'futuresPublic': {
                        'GET': {
                            'level3/snapshot': 'v2',
                        },
                    },
                },
                'networks': {
                    'OMNI': 'omni',
                    'ERC20': 'eth',
                    'TRC20': 'trx',
                },
                // 'code': 'BTC',
                // 'fetchBalance': {
                //    'code': 'BTC',
                // },
            },
            'features': {
                'spot': undefined,
                'forDerivs': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': true,
                        },
                        'triggerDirection': true,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPrice': undefined,
                            'triggerPriceType': undefined,
                            'limitPrice': true,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        // exchange-supported features
                        // 'iceberg': true,
                        // 'selfTradePrevention': true,
                        // 'twap': false,
                        // 'oco': false,
                    },
                    'createOrders': {
                        'max': 20,
                    },
                    'fetchMyTrades': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': 7,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': true,
                        'trailing': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBackClosed': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': true,
                        'trailing': false,
                    },
                    'fetchOHLCV': {
                        'limit': 500,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivs',
                    },
                    'inverse': {
                        'extends': 'forDerivs',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'forDerivs',
                    },
                    'inverse': {
                        'extends': 'forDerivs',
                    },
                },
            },
        });
    }
    /**
     * @method
     * @name kucoinfutures#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-service-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.futuresPublicGetStatus(params);
        //
        //     {
        //         "code":"200000",
        //         "data":{
        //             "status": "open", // open, close, cancelonly
        //             "msg": "upgrade match engine" // remark for operation when status not open
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const status = this.safeString(data, 'status');
        return {
            'status': (status === 'open') ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name kucoinfutures#fetchMarkets
     * @description retrieves data on all markets for kucoinfutures
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-symbols-list
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.futuresPublicGetContractsActive(params);
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "ETHUSDTM",
        //            "rootSymbol": "USDT",
        //            "type": "FFWCSX",
        //            "firstOpenDate": 1591086000000,
        //            "expireDate": null,
        //            "settleDate": null,
        //            "baseCurrency": "ETH",
        //            "quoteCurrency": "USDT",
        //            "settleCurrency": "USDT",
        //            "maxOrderQty": 1000000,
        //            "maxPrice": 1000000.0000000000,
        //            "lotSize": 1,
        //            "tickSize": 0.05,
        //            "indexPriceTickSize": 0.01,
        //            "multiplier": 0.01,
        //            "initialMargin": 0.01,
        //            "maintainMargin": 0.005,
        //            "maxRiskLimit": 1000000,
        //            "minRiskLimit": 1000000,
        //            "riskStep": 500000,
        //            "makerFeeRate": 0.00020,
        //            "takerFeeRate": 0.00060,
        //            "takerFixFee": 0.0000000000,
        //            "makerFixFee": 0.0000000000,
        //            "settlementFee": null,
        //            "isDeleverage": true,
        //            "isQuanto": true,
        //            "isInverse": false,
        //            "markMethod": "FairPrice",
        //            "fairMethod": "FundingRate",
        //            "fundingBaseSymbol": ".ETHINT8H",
        //            "fundingQuoteSymbol": ".USDTINT8H",
        //            "fundingRateSymbol": ".ETHUSDTMFPI8H",
        //            "indexSymbol": ".KETHUSDT",
        //            "settlementSymbol": "",
        //            "status": "Open",
        //            "fundingFeeRate": 0.000535,
        //            "predictedFundingFeeRate": 0.002197,
        //            "openInterest": "8724443",
        //            "turnoverOf24h": 341156641.03354263,
        //            "volumeOf24h": 74833.54000000,
        //            "markPrice": 4534.07,
        //            "indexPrice":4531.92,
        //            "lastTradePrice": 4545.4500000000,
        //            "nextFundingRateTime": 25481884,
        //            "maxLeverage": 100,
        //            "sourceExchanges":  [ "huobi", "Okex", "Binance", "Kucoin", "Poloniex", "Hitbtc" ],
        //            "premiumsSymbol1M": ".ETHUSDTMPI",
        //            "premiumsSymbol8H": ".ETHUSDTMPI8H",
        //            "fundingBaseSymbol1M": ".ETHINT",
        //            "fundingQuoteSymbol1M": ".USDTINT",
        //            "lowPrice": 4456.90,
        //            "highPrice":  4674.25,
        //            "priceChgPct": 0.0046,
        //            "priceChg": 21.15
        //        }
        //    }
        //
        const result = [];
        const data = this.safeValue(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString(market, 'symbol');
            const expiry = this.safeInteger(market, 'expireDate');
            const future = expiry ? true : false;
            const swap = !future;
            const baseId = this.safeString(market, 'baseCurrency');
            const quoteId = this.safeString(market, 'quoteCurrency');
            const settleId = this.safeString(market, 'settleCurrency');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            let symbol = base + '/' + quote + ':' + settle;
            let type = 'swap';
            if (future) {
                symbol = symbol + '-' + this.yymmdd(expiry, '');
                type = 'future';
            }
            const inverse = this.safeValue(market, 'isInverse');
            const status = this.safeString(market, 'status');
            const multiplier = this.safeString(market, 'multiplier');
            const tickSize = this.safeNumber(market, 'tickSize');
            const lotSize = this.safeNumber(market, 'lotSize');
            let limitAmountMin = lotSize;
            if (limitAmountMin === undefined) {
                limitAmountMin = this.safeNumber(market, 'baseMinSize');
            }
            let limitAmountMax = this.safeNumber(market, 'maxOrderQty');
            if (limitAmountMax === undefined) {
                limitAmountMax = this.safeNumber(market, 'baseMaxSize');
            }
            let limitPriceMax = this.safeNumber(market, 'maxPrice');
            if (limitPriceMax === undefined) {
                const baseMinSizeString = this.safeString(market, 'baseMinSize');
                const quoteMaxSizeString = this.safeString(market, 'quoteMaxSize');
                limitPriceMax = this.parseNumber(Precise["default"].stringDiv(quoteMaxSizeString, baseMinSizeString));
            }
            result.push({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': false,
                'margin': false,
                'swap': swap,
                'future': future,
                'option': false,
                'active': (status === 'Open'),
                'contract': true,
                'linear': !inverse,
                'inverse': inverse,
                'taker': this.safeNumber(market, 'takerFeeRate'),
                'maker': this.safeNumber(market, 'makerFeeRate'),
                'contractSize': this.parseNumber(Precise["default"].stringAbs(multiplier)),
                'expiry': expiry,
                'expiryDatetime': this.iso8601(expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': lotSize,
                    'price': tickSize,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber('1'),
                        'max': this.safeNumber(market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': limitAmountMin,
                        'max': limitAmountMax,
                    },
                    'price': {
                        'min': tickSize,
                        'max': limitPriceMax,
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'quoteMinSize'),
                        'max': this.safeNumber(market, 'quoteMaxSize'),
                    },
                },
                'created': this.safeInteger(market, 'firstOpenDate'),
                'info': market,
            });
        }
        return result;
    }
    /**
     * @method
     * @name kucoinfutures#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.futuresPublicGetTimestamp(params);
        //
        //    {
        //        "code": "200000",
        //        "data": 1637385119302,
        //    }
        //
        return this.safeInteger(response, 'data');
    }
    /**
     * @method
     * @name kucoinfutures#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 200);
        }
        const market = this.market(symbol);
        const marketId = market['id'];
        const parsedTimeframe = this.safeInteger(this.timeframes, timeframe);
        const request = {
            'symbol': marketId,
        };
        if (parsedTimeframe !== undefined) {
            request['granularity'] = parsedTimeframe;
        }
        else {
            request['granularity'] = timeframe;
        }
        const duration = this.parseTimeframe(timeframe) * 1000;
        let endAt = this.milliseconds();
        if (since !== undefined) {
            request['from'] = since;
            if (limit === undefined) {
                limit = this.safeInteger(this.options, 'fetchOHLCVLimit', 200);
            }
            endAt = this.sum(since, limit * duration);
        }
        else if (limit !== undefined) {
            since = endAt - limit * duration;
            request['from'] = since;
        }
        request['to'] = endAt;
        const response = await this.futuresPublicGetKlineQuery(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            [1636459200000, 4779.3, 4792.1, 4768.7, 4770.3, 78051],
        //            [1636460100000, 4770.25, 4778.55, 4757.55, 4777.25, 80164],
        //            [1636461000000, 4777.25, 4791.45, 4774.5, 4791.3, 51555]
        //        ]
        //    }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //    [
        //        "1545904980000",          // Start time of the candle cycle
        //        "0.058",                  // opening price
        //        "0.049",                  // closing price
        //        "0.058",                  // highest price
        //        "0.049",                  // lowest price
        //        "0.018",                  // base volume
        //        "0.000945",               // quote volume
        //    ]
        //
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 5),
        ];
    }
    /**
     * @method
     * @name kucoinfutures#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const currencyId = currency['id'];
        const request = {
            'currency': currencyId, // Currency,including XBT,USDT
        };
        const response = await this.futuresPrivateGetDepositAddress(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "address": "0x78d3ad1c0aa1bf068e19c94a2d7b16c9c0fcd8b1",//Deposit address
        //            "memo": null//Address tag. If the returned value is null, it means that the requested token has no memo. If you are to transfer funds from another platform to KuCoin Futures and if the token to be //transferred has memo(tag), you need to fill in the memo to ensure the transferred funds will be sent //to the address you specified.
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        const address = this.safeString(data, 'address');
        if (currencyId !== 'NIM') {
            // contains spaces
            this.checkAddress(address);
        }
        return {
            'info': response,
            'currency': currencyId,
            'network': this.safeString(data, 'chain'),
            'address': address,
            'tag': this.safeString(data, 'memo'),
        };
    }
    /**
     * @method
     * @name kucoinfutures#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-part-order-book-level-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const level = this.safeNumber(params, 'level');
        if (level !== 2 && level !== undefined) {
            throw new errors.BadRequest(this.id + ' fetchOrderBook() can only return level 2');
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            if ((limit === 20) || (limit === 100)) {
                request['limit'] = limit;
            }
            else {
                throw new errors.BadRequest(this.id + ' fetchOrderBook() limit argument must be 20 or 100');
            }
        }
        else {
            request['limit'] = 20;
        }
        const response = await this.futuresPublicGetLevel2DepthLimit(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //           "symbol": "XBTUSDM",      //Symbol
        //           "sequence": 100,          //Ticker sequence number
        //           "asks": [
        //                 ["5000.0", 1000],   //Price, quantity
        //                 ["6000.0", 1983]    //Price, quantity
        //           ],
        //           "bids": [
        //                 ["3200.0", 800],    //Price, quantity
        //                 ["3100.0", 100]     //Price, quantity
        //           ],
        //           "ts": 1604643655040584408  // timestamp
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const timestamp = this.parseToInt(this.safeInteger(data, 'ts') / 1000000);
        const orderbook = this.parseOrderBook(data, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
        orderbook['nonce'] = this.safeInteger(data, 'sequence');
        return orderbook;
    }
    /**
     * @method
     * @name kucoinfutures#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-ticker
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
        const response = await this.futuresPublicGetTicker(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "sequence": 1638444978558,
        //            "symbol": "ETHUSDTM",
        //            "side": "sell",
        //            "size": 4,
        //            "price": "4229.35",
        //            "bestBidSize": 2160,
        //            "bestBidPrice": "4229.0",
        //            "bestAskPrice": "4229.05",
        //            "tradeId": "61aaa8b777a0c43055fe4851",
        //            "ts": 1638574296209786785,
        //            "bestAskSize": 36,
        //        }
        //    }
        //
        return this.parseTicker(response['data'], market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchMarkPrice
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-current-mark-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchMarkPrice(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPublicGetMarkPriceSymbolCurrent(this.extend(request, params));
        //
        return this.parseTicker(response['data'], market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-symbols-list
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] the method to use, futuresPublicGetAllTickers or futuresPublicGetContractsActive
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchTickers', 'method', 'futuresPublicGetContractsActive');
        let response = undefined;
        if (method === 'futuresPublicGetAllTickers') {
            response = await this.futuresPublicGetAllTickers(params);
        }
        else {
            response = await this.futuresPublicGetContractsActive(params);
        }
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "ETHUSDTM",
        //            "rootSymbol": "USDT",
        //            "type": "FFWCSX",
        //            "firstOpenDate": 1591086000000,
        //            "expireDate": null,
        //            "settleDate": null,
        //            "baseCurrency": "ETH",
        //            "quoteCurrency": "USDT",
        //            "settleCurrency": "USDT",
        //            "maxOrderQty": 1000000,
        //            "maxPrice": 1000000.0000000000,
        //            "lotSize": 1,
        //            "tickSize": 0.05,
        //            "indexPriceTickSize": 0.01,
        //            "multiplier": 0.01,
        //            "initialMargin": 0.01,
        //            "maintainMargin": 0.005,
        //            "maxRiskLimit": 1000000,
        //            "minRiskLimit": 1000000,
        //            "riskStep": 500000,
        //            "makerFeeRate": 0.00020,
        //            "takerFeeRate": 0.00060,
        //            "takerFixFee": 0.0000000000,
        //            "makerFixFee": 0.0000000000,
        //            "settlementFee": null,
        //            "isDeleverage": true,
        //            "isQuanto": true,
        //            "isInverse": false,
        //            "markMethod": "FairPrice",
        //            "fairMethod": "FundingRate",
        //            "fundingBaseSymbol": ".ETHINT8H",
        //            "fundingQuoteSymbol": ".USDTINT8H",
        //            "fundingRateSymbol": ".ETHUSDTMFPI8H",
        //            "indexSymbol": ".KETHUSDT",
        //            "settlementSymbol": "",
        //            "status": "Open",
        //            "fundingFeeRate": 0.000535,
        //            "predictedFundingFeeRate": 0.002197,
        //            "openInterest": "8724443",
        //            "turnoverOf24h": 341156641.03354263,
        //            "volumeOf24h": 74833.54000000,
        //            "markPrice": 4534.07,
        //            "indexPrice":4531.92,
        //            "lastTradePrice": 4545.4500000000,
        //            "nextFundingRateTime": 25481884,
        //            "maxLeverage": 100,
        //            "sourceExchanges":  [ "huobi", "Okex", "Binance", "Kucoin", "Poloniex", "Hitbtc" ],
        //            "premiumsSymbol1M": ".ETHUSDTMPI",
        //            "premiumsSymbol8H": ".ETHUSDTMPI8H",
        //            "fundingBaseSymbol1M": ".ETHINT",
        //            "fundingQuoteSymbol1M": ".USDTINT",
        //            "lowPrice": 4456.90,
        //            "highPrice":  4674.25,
        //            "priceChgPct": 0.0046,
        //            "priceChg": 21.15
        //        }
        //    }
        //
        const data = this.safeList(response, 'data');
        const tickers = this.parseTickers(data, symbols);
        return this.filterByArrayTickers(tickers, 'symbol', symbols);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "symbol": "LTCUSDTM",
        //         "granularity": 1000,
        //         "timePoint": 1727967339000,
        //         "value": 62.37, mark price
        //         "indexPrice": 62.37
        //      }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "sequence":  1629930362547,
        //             "symbol": "ETHUSDTM",
        //             "side": "buy",
        //             "size":  130,
        //             "price": "4724.7",
        //             "bestBidSize":  5,
        //             "bestBidPrice": "4724.6",
        //             "bestAskPrice": "4724.65",
        //             "tradeId": "618d2a5a77a0c4431d2335f4",
        //             "ts":  1636641371963227600,
        //             "bestAskSize":  1789
        //          }
        //     }
        //
        // from fetchTickers
        //
        // {
        //     symbol: "XBTUSDTM",
        //     rootSymbol: "USDT",
        //     type: "FFWCSX",
        //     firstOpenDate: 1585555200000,
        //     expireDate: null,
        //     settleDate: null,
        //     baseCurrency: "XBT",
        //     quoteCurrency: "USDT",
        //     settleCurrency: "USDT",
        //     maxOrderQty: 1000000,
        //     maxPrice: 1000000,
        //     lotSize: 1,
        //     tickSize: 0.1,
        //     indexPriceTickSize: 0.01,
        //     multiplier: 0.001,
        //     initialMargin: 0.008,
        //     maintainMargin: 0.004,
        //     maxRiskLimit: 100000,
        //     minRiskLimit: 100000,
        //     riskStep: 50000,
        //     makerFeeRate: 0.0002,
        //     takerFeeRate: 0.0006,
        //     takerFixFee: 0,
        //     makerFixFee: 0,
        //     settlementFee: null,
        //     isDeleverage: true,
        //     isQuanto: true,
        //     isInverse: false,
        //     markMethod: "FairPrice",
        //     fairMethod: "FundingRate",
        //     fundingBaseSymbol: ".XBTINT8H",
        //     fundingQuoteSymbol: ".USDTINT8H",
        //     fundingRateSymbol: ".XBTUSDTMFPI8H",
        //     indexSymbol: ".KXBTUSDT",
        //     settlementSymbol: "",
        //     status: "Open",
        //     fundingFeeRate: 0.000297,
        //     predictedFundingFeeRate: 0.000327,
        //     fundingRateGranularity: 28800000,
        //     openInterest: "8033200",
        //     turnoverOf24h: 659795309.2524643,
        //     volumeOf24h: 9998.54,
        //     markPrice: 67193.51,
        //     indexPrice: 67184.81,
        //     lastTradePrice: 67191.8,
        //     nextFundingRateTime: 20022985,
        //     maxLeverage: 125,
        //     premiumsSymbol1M: ".XBTUSDTMPI",
        //     premiumsSymbol8H: ".XBTUSDTMPI8H",
        //     fundingBaseSymbol1M: ".XBTINT",
        //     fundingQuoteSymbol1M: ".USDTINT",
        //     lowPrice: 64041.6,
        //     highPrice: 67737.3,
        //     priceChgPct: 0.0447,
        //     priceChg: 2878.7
        // }
        //
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market, '-');
        const last = this.safeString2(ticker, 'price', 'lastTradePrice');
        const timestamp = this.safeIntegerProduct(ticker, 'ts', 0.000001);
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'highPrice'),
            'low': this.safeString(ticker, 'lowPrice'),
            'bid': this.safeString(ticker, 'bestBidPrice'),
            'bidVolume': this.safeString(ticker, 'bestBidSize'),
            'ask': this.safeString(ticker, 'bestAskPrice'),
            'askVolume': this.safeString(ticker, 'bestAskSize'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString(ticker, 'priceChg'),
            'percentage': this.safeString(ticker, 'priceChgPct'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volumeOf24h'),
            'quoteVolume': this.safeString(ticker, 'turnoverOf24h'),
            'markPrice': this.safeString2(ticker, 'markPrice', 'value'),
            'indexPrice': this.safeString(ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        const request = {
            'method': 'futuresPublicGetAllTickers',
        };
        return await this.fetchTickers(symbols, this.extend(request, params));
    }
    /**
     * @method
     * @name kucoinfutures#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://www.kucoin.com/docs/rest/futures-trading/funding-fees/get-funding-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            // * Since is ignored if limit is defined
            request['maxCount'] = limit;
        }
        const response = await this.futuresPrivateGetFundingHistory(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "dataList": [
        //                {
        //                    "id": 239471298749817,
        //                    "symbol": "ETHUSDTM",
        //                    "timePoint": 1638532800000,
        //                    "fundingRate": 0.000100,
        //                    "markPrice": 4612.8300000000,
        //                    "positionQty": 12,
        //                    "positionCost": 553.5396000000,
        //                    "funding": -0.0553539600,
        //                    "settleCurrency": "USDT"
        //                },
        //                ...
        //            ],
        //            "hasMore": true
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data');
        const dataList = this.safeValue(data, 'dataList', []);
        const fees = [];
        for (let i = 0; i < dataList.length; i++) {
            const listItem = dataList[i];
            const timestamp = this.safeInteger(listItem, 'timePoint');
            fees.push({
                'info': listItem,
                'symbol': symbol,
                'code': this.safeCurrencyCode(this.safeString(listItem, 'settleCurrency')),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'id': this.safeNumber(listItem, 'id'),
                'amount': this.safeNumber(listItem, 'funding'),
                'fundingRate': this.safeNumber(listItem, 'fundingRate'),
                'markPrice': this.safeNumber(listItem, 'markPrice'),
                'positionQty': this.safeNumber(listItem, 'positionQty'),
                'positionCost': this.safeNumber(listItem, 'positionCost'),
            });
        }
        return fees;
    }
    /**
     * @method
     * @name kucoinfutures#fetchPosition
     * @see https://docs.kucoin.com/futures/#get-position-details
     * @description fetch data on an open position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPrivateGetPosition(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "id": "6505ee6eaff4070001f651c4",
        //            "symbol": "XBTUSDTM",
        //            "autoDeposit": false,
        //            "maintMarginReq": 0,
        //            "riskLimit": 200,
        //            "realLeverage": 0.0,
        //            "crossMode": false,
        //            "delevPercentage": 0.0,
        //            "currentTimestamp": 1694887534594,
        //            "currentQty": 0,
        //            "currentCost": 0.0,
        //            "currentComm": 0.0,
        //            "unrealisedCost": 0.0,
        //            "realisedGrossCost": 0.0,
        //            "realisedCost": 0.0,
        //            "isOpen": false,
        //            "markPrice": 26611.71,
        //            "markValue": 0.0,
        //            "posCost": 0.0,
        //            "posCross": 0,
        //            "posInit": 0.0,
        //            "posComm": 0.0,
        //            "posLoss": 0.0,
        //            "posMargin": 0.0,
        //            "posMaint": 0.0,
        //            "maintMargin": 0.0,
        //            "realisedGrossPnl": 0.0,
        //            "realisedPnl": 0.0,
        //            "unrealisedPnl": 0.0,
        //            "unrealisedPnlPcnt": 0,
        //            "unrealisedRoePcnt": 0,
        //            "avgEntryPrice": 0.0,
        //            "liquidationPrice": 0.0,
        //            "bankruptPrice": 0.0,
        //            "settleCurrency": "USDT",
        //            "maintainMargin": 0,
        //            "riskLimitLevel": 1
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parsePosition(data, market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchPositions
     * @description fetch all open positions
     * @see https://docs.kucoin.com/futures/#get-position-list
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.futuresPrivateGetPositions(params);
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "id": "615ba79f83a3410001cde321",
        //                "symbol": "ETHUSDTM",
        //                "autoDeposit": false,
        //                "maintMarginReq": 0.005,
        //                "riskLimit": 1000000,
        //                "realLeverage": 18.61,
        //                "crossMode": false,
        //                "delevPercentage": 0.86,
        //                "openingTimestamp": 1638563515618,
        //                "currentTimestamp": 1638576872774,
        //                "currentQty": 2,
        //                "currentCost": 83.64200000,
        //                "currentComm": 0.05018520,
        //                "unrealisedCost": 83.64200000,
        //                "realisedGrossCost": 0.00000000,
        //                "realisedCost": 0.05018520,
        //                "isOpen": true,
        //                "markPrice": 4225.01,
        //                "markValue": 84.50020000,
        //                "posCost": 83.64200000,
        //                "posCross": 0.0000000000,
        //                "posInit": 3.63660870,
        //                "posComm": 0.05236717,
        //                "posLoss": 0.00000000,
        //                "posMargin": 3.68897586,
        //                "posMaint": 0.50637594,
        //                "maintMargin": 4.54717586,
        //                "realisedGrossPnl": 0.00000000,
        //                "realisedPnl": -0.05018520,
        //                "unrealisedPnl": 0.85820000,
        //                "unrealisedPnlPcnt": 0.0103,
        //                "unrealisedRoePcnt": 0.2360,
        //                "avgEntryPrice": 4182.10,
        //                "liquidationPrice": 4023.00,
        //                "bankruptPrice": 4000.25,
        //                "settleCurrency": "USDT",
        //                "isInverse": false
        //            }
        //        ]
        //    }
        //
        const data = this.safeList(response, 'data');
        return this.parsePositions(data, symbols);
    }
    /**
     * @method
     * @name kucoinfutures#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/get-positions-history
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch position history for
     * @param {int} [limit] the maximum number of entries to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] closing end time
     * @param {int} [params.pageId] page id
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionsHistory(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (limit === undefined) {
            limit = 200;
        }
        const request = {
            'limit': limit,
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['to'] = until;
        }
        const response = await this.futuresPrivateGetHistoryPositions(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "code": "200",
        //     "msg": "success",
        //     "retry": false,
        //     "data": {
        //         "currentPage": 1,
        //         "pageSize": 10,
        //         "totalNum": 25,
        //         "totalPage": 3,
        //         "items": [
        //             {
        //                 "closeId": "300000000000000030",
        //                 "positionId": "300000000000000009",
        //                 "uid": 99996908309485,
        //                 "userId": "6527d4fc8c7f3d0001f40f5f",
        //                 "symbol": "XBTUSDM",
        //                 "settleCurrency": "XBT",
        //                 "leverage": "0.0",
        //                 "type": "LIQUID_LONG",
        //                 "side": null,
        //                 "closeSize": null,
        //                 "pnl": "-1.0000003793999999",
        //                 "realisedGrossCost": "0.9993849748999999",
        //                 "withdrawPnl": "0.0",
        //                 "roe": null,
        //                 "tradeFee": "0.0006154045",
        //                 "fundingFee": "0.0",
        //                 "openTime": 1713785751181,
        //                 "closeTime": 1713785752784,
        //                 "openPrice": null,
        //                 "closePrice": null
        //             }
        //         ]
        //     }
        // }
        //
        const data = this.safeDict(response, 'data');
        const items = this.safeList(data, 'items', []);
        return this.parsePositions(items, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "id": "615ba79f83a3410001cde321",         // Position ID
        //                "symbol": "ETHUSDTM",                     // Symbol
        //                "autoDeposit": false,                     // Auto deposit margin or not
        //                "maintMarginReq": 0.005,                  // Maintenance margin requirement
        //                "riskLimit": 1000000,                     // Risk limit
        //                "realLeverage": 25.92,                    // Leverage of the order
        //                "crossMode": false,                       // Cross mode or not
        //                "delevPercentage": 0.76,                  // ADL ranking percentile
        //                "openingTimestamp": 1638578546031,        // Open time
        //                "currentTimestamp": 1638578563580,        // Current timestamp
        //                "currentQty": 2,                          // Current postion quantity
        //                "currentCost": 83.787,                    // Current postion value
        //                "currentComm": 0.0167574,                 // Current commission
        //                "unrealisedCost": 83.787,                 // Unrealised value
        //                "realisedGrossCost": 0.0,                 // Accumulated realised gross profit value
        //                "realisedCost": 0.0167574,                // Current realised position value
        //                "isOpen": true,                           // Opened position or not
        //                "markPrice": 4183.38,                     // Mark price
        //                "markValue": 83.6676,                     // Mark value
        //                "posCost": 83.787,                        // Position value
        //                "posCross": 0.0,                          // added margin
        //                "posInit": 3.35148,                       // Leverage margin
        //                "posComm": 0.05228309,                    // Bankruptcy cost
        //                "posLoss": 0.0,                           // Funding fees paid out
        //                "posMargin": 3.40376309,                  // Position margin
        //                "posMaint": 0.50707892,                   // Maintenance margin
        //                "maintMargin": 3.28436309,                // Position margin
        //                "realisedGrossPnl": 0.0,                  // Accumulated realised gross profit value
        //                "realisedPnl": -0.0167574,                // Realised profit and loss
        //                "unrealisedPnl": -0.1194,                 // Unrealised profit and loss
        //                "unrealisedPnlPcnt": -0.0014,             // Profit-loss ratio of the position
        //                "unrealisedRoePcnt": -0.0356,             // Rate of return on investment
        //                "avgEntryPrice": 4189.35,                 // Average entry price
        //                "liquidationPrice": 4044.55,              // Liquidation price
        //                "bankruptPrice": 4021.75,                 // Bankruptcy price
        //                "settleCurrency": "USDT",                 // Currency used to clear and settle the trades
        //                "isInverse": false
        //            }
        //        ]
        //    }
        // position history
        //             {
        //                 "closeId": "300000000000000030",
        //                 "positionId": "300000000000000009",
        //                 "uid": 99996908309485,
        //                 "userId": "6527d4fc8c7f3d0001f40f5f",
        //                 "symbol": "XBTUSDM",
        //                 "settleCurrency": "XBT",
        //                 "leverage": "0.0",
        //                 "type": "LIQUID_LONG",
        //                 "side": null,
        //                 "closeSize": null,
        //                 "pnl": "-1.0000003793999999",
        //                 "realisedGrossCost": "0.9993849748999999",
        //                 "withdrawPnl": "0.0",
        //                 "roe": null,
        //                 "tradeFee": "0.0006154045",
        //                 "fundingFee": "0.0",
        //                 "openTime": 1713785751181,
        //                 "closeTime": 1713785752784,
        //                 "openPrice": null,
        //                 "closePrice": null
        //             }
        //
        const symbol = this.safeString(position, 'symbol');
        market = this.safeMarket(symbol, market);
        const timestamp = this.safeInteger(position, 'currentTimestamp');
        const size = this.safeString(position, 'currentQty');
        let side = undefined;
        const type = this.safeStringLower(position, 'type');
        if (size !== undefined) {
            if (Precise["default"].stringGt(size, '0')) {
                side = 'long';
            }
            else if (Precise["default"].stringLt(size, '0')) {
                side = 'short';
            }
        }
        else if (type !== undefined) {
            if (type.indexOf('long') > -1) {
                side = 'long';
            }
            else {
                side = 'short';
            }
        }
        const notional = Precise["default"].stringAbs(this.safeString(position, 'posCost'));
        const initialMargin = this.safeString(position, 'posInit');
        const initialMarginPercentage = Precise["default"].stringDiv(initialMargin, notional);
        // const marginRatio = Precise.stringDiv (maintenanceRate, collateral);
        const unrealisedPnl = this.safeString(position, 'unrealisedPnl');
        const crossMode = this.safeValue(position, 'crossMode');
        // currently crossMode is always set to false and only isolated positions are supported
        let marginMode = undefined;
        if (crossMode !== undefined) {
            marginMode = crossMode ? 'cross' : 'isolated';
        }
        return this.safePosition({
            'info': position,
            'id': this.safeString2(position, 'id', 'positionId'),
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': this.safeInteger(position, 'closeTime'),
            'initialMargin': this.parseNumber(initialMargin),
            'initialMarginPercentage': this.parseNumber(initialMarginPercentage),
            'maintenanceMargin': this.safeNumber(position, 'posMaint'),
            'maintenanceMarginPercentage': this.safeNumber(position, 'maintMarginReq'),
            'entryPrice': this.safeNumber2(position, 'avgEntryPrice', 'openPrice'),
            'notional': this.parseNumber(notional),
            'leverage': this.safeNumber2(position, 'realLeverage', 'leverage'),
            'unrealizedPnl': this.parseNumber(unrealisedPnl),
            'contracts': this.parseNumber(Precise["default"].stringAbs(size)),
            'contractSize': this.safeValue(market, 'contractSize'),
            'realizedPnl': this.safeNumber2(position, 'realisedPnl', 'pnl'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber(position, 'liquidationPrice'),
            'markPrice': this.safeNumber(position, 'markPrice'),
            'lastPrice': undefined,
            'collateral': this.safeNumber(position, 'maintMargin'),
            'marginMode': marginMode,
            'side': side,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name kucoinfutures#createOrder
     * @description Create an order on the exchange
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/place-order
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/place-take-profit-and-stop-loss-order#http-request
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {bool} [params.reduceOnly] A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
     * @param {string} [params.timeInForce] GTC, GTT, IOC, or FOK, default is GTC, limit orders only
     * @param {string} [params.postOnly] Post only flag, invalid when timeInForce is IOC or FOK
     * @param {float} [params.cost] the cost of the order in units of USDT
     * ----------------- Exchange Specific Parameters -----------------
     * @param {float} [params.leverage] Leverage size of the order (mandatory param in request, default is 1)
     * @param {string} [params.clientOid] client order id, defaults to uuid if not passed
     * @param {string} [params.remark] remark for the order, length cannot exceed 100 utf8 characters
     * @param {string} [params.stop] 'up' or 'down', the direction the triggerPrice is triggered from, requires triggerPrice. down: Triggers when the price reaches or goes below the triggerPrice. up: Triggers when the price reaches or goes above the triggerPrice.
     * @param {string} [params.triggerPriceType] "last", "mark", "index" - defaults to "mark"
     * @param {string} [params.stopPriceType] exchange-specific alternative for triggerPriceType: TP, IP or MP
     * @param {bool} [params.closeOrder] set to true to close position
     * @param {bool} [params.test] set to true to use the test order endpoint (does not submit order, use to validate params)
     * @param {bool} [params.forceHold] A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const testOrder = this.safeBool(params, 'test', false);
        params = this.omit(params, 'test');
        const isTpAndSlOrder = (this.safeValue(params, 'stopLoss') !== undefined) || (this.safeValue(params, 'takeProfit') !== undefined);
        const orderRequest = this.createContractOrderRequest(symbol, type, side, amount, price, params);
        let response = undefined;
        if (testOrder) {
            response = await this.futuresPrivatePostOrdersTest(orderRequest);
        }
        else {
            if (isTpAndSlOrder) {
                response = await this.futuresPrivatePostStOrders(orderRequest);
            }
            else {
                response = await this.futuresPrivatePostOrders(orderRequest);
            }
        }
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "orderId": "619717484f1d010001510cde",
        //        },
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name kucoinfutures#createOrders
     * @description create a list of trade orders
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/place-multiple-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString(rawOrder, 'symbol');
            const market = this.market(symbol);
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeValue(rawOrder, 'params', {});
            const orderRequest = this.createContractOrderRequest(market['id'], type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        const response = await this.futuresPrivatePostOrdersMulti(ordersRequests);
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "orderId": "135241412609331200",
        //                 "clientOid": "3d8fcc13-0b13-447f-ad30-4b3441e05213",
        //                 "symbol": "LTCUSDTM",
        //                 "code": "200000",
        //                 "msg": "success"
        //             },
        //             {
        //                 "orderId": "135241412747743234",
        //                 "clientOid": "b878c7ee-ae3e-4d63-a20b-038acbb7306f",
        //                 "symbol": "LTCUSDTM",
        //                 "code": "200000",
        //                 "msg": "success"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data);
    }
    createContractOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        // required param, cannot be used twice
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId', this.uuid());
        params = this.omit(params, ['clientOid', 'clientOrderId']);
        const request = {
            'clientOid': clientOrderId,
            'side': side,
            'symbol': market['id'],
            'type': type,
            'leverage': 1,
        };
        const cost = this.safeString(params, 'cost');
        params = this.omit(params, 'cost');
        if (cost !== undefined) {
            request['valueQty'] = this.costToPrecision(symbol, cost);
        }
        else {
            if (amount < 1) {
                throw new errors.InvalidOrder(this.id + ' createOrder() minimum contract order amount is 1');
            }
            request['size'] = parseInt(this.amountToPrecision(symbol, amount));
        }
        const [triggerPrice, stopLossPrice, takeProfitPrice] = this.handleTriggerPrices(params);
        const stopLoss = this.safeDict(params, 'stopLoss');
        const takeProfit = this.safeDict(params, 'takeProfit');
        // const isTpAndSl = stopLossPrice && takeProfitPrice;
        const triggerPriceTypes = {
            'mark': 'MP',
            'last': 'TP',
            'index': 'IP',
        };
        const triggerPriceType = this.safeString(params, 'triggerPriceType', 'mark');
        const triggerPriceTypeValue = this.safeString(triggerPriceTypes, triggerPriceType, triggerPriceType);
        params = this.omit(params, ['stopLossPrice', 'takeProfitPrice', 'triggerPrice', 'stopPrice', 'takeProfit', 'stopLoss']);
        if (triggerPrice) {
            request['stop'] = (side === 'buy') ? 'up' : 'down';
            request['stopPrice'] = this.priceToPrecision(symbol, triggerPrice);
            request['stopPriceType'] = triggerPriceTypeValue;
        }
        else if (stopLoss !== undefined || takeProfit !== undefined) {
            let priceType = triggerPriceTypeValue;
            if (stopLoss !== undefined) {
                const slPrice = this.safeString2(stopLoss, 'triggerPrice', 'stopPrice');
                request['triggerStopDownPrice'] = this.priceToPrecision(symbol, slPrice);
                priceType = this.safeString(stopLoss, 'triggerPriceType', 'mark');
                priceType = this.safeString(triggerPriceTypes, priceType, priceType);
            }
            if (takeProfit !== undefined) {
                const tpPrice = this.safeString2(takeProfit, 'triggerPrice', 'takeProfitPrice');
                request['triggerStopUpPrice'] = this.priceToPrecision(symbol, tpPrice);
                priceType = this.safeString(takeProfit, 'triggerPriceType', 'mark');
                priceType = this.safeString(triggerPriceTypes, priceType, priceType);
            }
            request['stopPriceType'] = priceType;
        }
        else if (stopLossPrice || takeProfitPrice) {
            if (stopLossPrice) {
                request['stop'] = (side === 'buy') ? 'up' : 'down';
                request['stopPrice'] = this.priceToPrecision(symbol, stopLossPrice);
            }
            else {
                request['stop'] = (side === 'buy') ? 'down' : 'up';
                request['stopPrice'] = this.priceToPrecision(symbol, takeProfitPrice);
            }
            request['reduceOnly'] = true;
            request['stopPriceType'] = triggerPriceTypeValue;
        }
        const uppercaseType = type.toUpperCase();
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        if (uppercaseType === 'LIMIT') {
            if (price === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price argument for limit orders');
            }
            else {
                request['price'] = this.priceToPrecision(symbol, price);
            }
            if (timeInForce !== undefined) {
                request['timeInForce'] = timeInForce;
            }
        }
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(type === 'market', false, params);
        if (postOnly) {
            request['postOnly'] = true;
        }
        const hidden = this.safeValue(params, 'hidden');
        if (postOnly && (hidden !== undefined)) {
            throw new errors.BadRequest(this.id + ' createOrder() does not support the postOnly parameter together with a hidden parameter');
        }
        const iceberg = this.safeValue(params, 'iceberg');
        if (iceberg) {
            const visibleSize = this.safeValue(params, 'visibleSize');
            if (visibleSize === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a visibleSize parameter for iceberg orders');
            }
        }
        params = this.omit(params, ['timeInForce', 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice']); // Time in force only valid for limit orders, exchange error when gtc for market orders
        return this.extend(request, params);
    }
    /**
     * @method
     * @name kucoinfutures#cancelOrder
     * @description cancels an open order
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/cancel-futures-order-by-orderid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        params = this.omit(params, ['clientOrderId']);
        const request = {};
        let response = undefined;
        if (clientOrderId !== undefined) {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument when cancelling by clientOrderId');
            }
            const market = this.market(symbol);
            request['symbol'] = market['id'];
            request['clientOid'] = clientOrderId;
            response = await this.futuresPrivateDeleteOrdersClientOrderClientOid(this.extend(request, params));
        }
        else {
            request['orderId'] = id;
            response = await this.futuresPrivateDeleteOrdersOrderId(this.extend(request, params));
        }
        //
        //   {
        //       "code": "200000",
        //       "data": {
        //           "cancelledOrderIds": [
        //                "619714b8b6353000014c505a",
        //           ],
        //       },
        //   }
        //
        return this.safeValue(response, 'data');
    }
    /**
     * @method
     * @name kucoinfutures#cancelOrders
     * @description cancel multiple orders
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/batch-cancel-orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const ordersRequests = [];
        const clientOrderIds = this.safeList2(params, 'clientOrderIds', 'clientOids', []);
        params = this.omit(params, ['clientOrderIds', 'clientOids']);
        let useClientorderId = false;
        for (let i = 0; i < clientOrderIds.length; i++) {
            useClientorderId = true;
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument when cancelling by clientOrderIds');
            }
            ordersRequests.push({
                'symbol': market['id'],
                'clientOid': this.safeString(clientOrderIds, i),
            });
        }
        for (let i = 0; i < ids.length; i++) {
            ordersRequests.push(ids[i]);
        }
        const requestKey = useClientorderId ? 'clientOidsList' : 'orderIdsList';
        const request = {};
        request[requestKey] = ordersRequests;
        const response = await this.futuresPrivateDeleteOrdersMultiCancel(this.extend(request, params));
        //
        //   {
        //       "code": "200000",
        //       "data":
        //       [
        //           {
        //               "orderId": "80465574458560512",
        //               "clientOid": null,
        //               "code": "200",
        //               "msg": "success"
        //           },
        //           {
        //               "orderId": "80465575289094144",
        //               "clientOid": null,
        //               "code": "200",
        //               "msg": "success"
        //           }
        //       ]
        //   }
        //
        const orders = this.safeList(response, 'data', []);
        return this.parseOrders(orders, market);
    }
    /**
     * @method
     * @name kucoinfutures#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/cancel-multiple-futures-limit-orders
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/cancel-multiple-futures-stop-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.trigger] When true, all the trigger orders will be cancelled
     * @returns Response from the exchange
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = this.marketId(symbol);
        }
        const trigger = this.safeValue2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        let response = undefined;
        if (trigger) {
            response = await this.futuresPrivateDeleteStopOrders(this.extend(request, params));
        }
        else {
            response = await this.futuresPrivateDeleteOrders(this.extend(request, params));
        }
        //
        //   {
        //       "code": "200000",
        //       "data": {
        //           "cancelledOrderIds": [
        //                "619714b8b6353000014c505a",
        //           ],
        //       },
        //   }
        //
        return this.safeValue(response, 'data');
    }
    /**
     * @method
     * @name kucoinfutures#addMargin
     * @description add margin
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/add-margin-manually
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const uuid = this.uuid();
        const request = {
            'symbol': market['id'],
            'margin': this.amountToPrecision(symbol, amount),
            'bizNo': uuid,
        };
        const response = await this.futuresPrivatePostPositionMarginDepositMargin(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "id": "62311d26064e8f00013f2c6d",
        //            "symbol": "XRPUSDTM",
        //            "autoDeposit": false,
        //            "maintMarginReq": 0.01,
        //            "riskLimit": 200000,
        //            "realLeverage": 0.88,
        //            "crossMode": false,
        //            "delevPercentage": 0.4,
        //            "openingTimestamp": 1647385894798,
        //            "currentTimestamp": 1647414510672,
        //            "currentQty": -1,
        //            "currentCost": -7.658,
        //            "currentComm": 0.0053561,
        //            "unrealisedCost": -7.658,
        //            "realisedGrossCost": 0,
        //            "realisedCost": 0.0053561,
        //            "isOpen": true,
        //            "markPrice": 0.7635,
        //            "markValue": -7.635,
        //            "posCost": -7.658,
        //            "posCross": 1.00016084,
        //            "posInit": 7.658,
        //            "posComm": 0.00979006,
        //            "posLoss": 0,
        //            "posMargin": 8.6679509,
        //            "posMaint": 0.08637006,
        //            "maintMargin": 8.6909509,
        //            "realisedGrossPnl": 0,
        //            "realisedPnl": -0.0038335,
        //            "unrealisedPnl": 0.023,
        //            "unrealisedPnlPcnt": 0.003,
        //            "unrealisedRoePcnt": 0.003,
        //            "avgEntryPrice": 0.7658,
        //            "liquidationPrice": 1.6239,
        //            "bankruptPrice": 1.6317,
        //            "settleCurrency": "USDT"
        //        }
        //    }
        //
        //
        //    {
        //        "code":"200000",
        //        "msg":"Position does not exist"
        //    }
        //
        const data = this.safeValue(response, 'data');
        return this.extend(this.parseMarginModification(data, market), {
            'amount': this.amountToPrecision(symbol, amount),
            'direction': 'in',
        });
    }
    parseMarginModification(info, market = undefined) {
        //
        //    {
        //        "id": "62311d26064e8f00013f2c6d",
        //        "symbol": "XRPUSDTM",
        //        "autoDeposit": false,
        //        "maintMarginReq": 0.01,
        //        "riskLimit": 200000,
        //        "realLeverage": 0.88,
        //        "crossMode": false,
        //        "delevPercentage": 0.4,
        //        "openingTimestamp": 1647385894798,
        //        "currentTimestamp": 1647414510672,
        //        "currentQty": -1,
        //        "currentCost": -7.658,
        //        "currentComm": 0.0053561,
        //        "unrealisedCost": -7.658,
        //        "realisedGrossCost": 0,
        //        "realisedCost": 0.0053561,
        //        "isOpen": true,
        //        "markPrice": 0.7635,
        //        "markValue": -7.635,
        //        "posCost": -7.658,
        //        "posCross": 1.00016084,
        //        "posInit": 7.658,
        //        "posComm": 0.00979006,
        //        "posLoss": 0,
        //        "posMargin": 8.6679509,
        //        "posMaint": 0.08637006,
        //        "maintMargin": 8.6909509,
        //        "realisedGrossPnl": 0,
        //        "realisedPnl": -0.0038335,
        //        "unrealisedPnl": 0.023,
        //        "unrealisedPnlPcnt": 0.003,
        //        "unrealisedRoePcnt": 0.003,
        //        "avgEntryPrice": 0.7658,
        //        "liquidationPrice": 1.6239,
        //        "bankruptPrice": 1.6317,
        //        "settleCurrency": "USDT"
        //    }
        //
        //    {
        //        "code":"200000",
        //        "msg":"Position does not exist"
        //    }
        //
        const id = this.safeString(info, 'id');
        market = this.safeMarket(id, market);
        const currencyId = this.safeString(info, 'settleCurrency');
        const crossMode = this.safeValue(info, 'crossMode');
        const mode = crossMode ? 'cross' : 'isolated';
        const marketId = this.safeString(market, 'symbol');
        const timestamp = this.safeInteger(info, 'currentTimestamp');
        return {
            'info': info,
            'symbol': this.safeSymbol(marketId, market),
            'type': undefined,
            'marginMode': mode,
            'amount': undefined,
            'total': undefined,
            'code': this.safeCurrencyCode(currencyId),
            'status': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name kucoinfutures#fetchOrdersByStatus
     * @description fetches a list of orders placed on the exchange
     * @see https://docs.kucoin.com/futures/#get-order-list
     * @see https://docs.kucoin.com/futures/#get-untriggered-stop-order-list
     * @param {string} status 'active' or 'closed', only 'active' is valid for stop orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {bool} [params.trigger] set to true to retrieve untriggered stop orders
     * @param {int} [params.until] End time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit or market
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns An [array of order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrdersByStatus', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOrdersByStatus', symbol, since, limit, params);
        }
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['stop', 'until', 'trigger']);
        if (status === 'closed') {
            status = 'done';
        }
        else if (status === 'open') {
            status = 'active';
        }
        const request = {};
        if (!trigger) {
            request['status'] = status;
        }
        else if (status !== 'active') {
            throw new errors.BadRequest(this.id + ' fetchOrdersByStatus() can only fetch untriggered stop orders');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (until !== undefined) {
            request['endAt'] = until;
        }
        let response = undefined;
        if (trigger) {
            response = await this.futuresPrivateGetStopOrders(this.extend(request, params));
        }
        else {
            response = await this.futuresPrivateGetOrders(this.extend(request, params));
        }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 50,
        //             "totalNum": 4,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "id": "64507d02921f1c0001ff6892",
        //                     "symbol": "XBTUSDTM",
        //                     "type": "market",
        //                     "side": "buy",
        //                     "price": null,
        //                     "size": 1,
        //                     "value": "27.992",
        //                     "dealValue": "27.992",
        //                     "dealSize": 1,
        //                     "stp": "",
        //                     "stop": "",
        //                     "stopPriceType": "",
        //                     "stopTriggered": false,
        //                     "stopPrice": null,
        //                     "timeInForce": "GTC",
        //                     "postOnly": false,
        //                     "hidden": false,
        //                     "iceberg": false,
        //                     "leverage": "17",
        //                     "forceHold": false,
        //                     "closeOrder": false,
        //                     "visibleSize": null,
        //                     "clientOid": null,
        //                     "remark": null,
        //                     "tags": null,
        //                     "isActive": false,
        //                     "cancelExist": false,
        //                     "createdAt": 1682996482000,
        //                     "updatedAt": 1682996483062,
        //                     "endAt": 1682996483062,
        //                     "orderTime": 1682996482953900677,
        //                     "settleCurrency": "USDT",
        //                     "status": "done",
        //                     "filledValue": "27.992",
        //                     "filledSize": 1,
        //                     "reduceOnly": false
        //                 }
        //             ]
        //         }
        //     }
        //
        const responseData = this.safeValue(response, 'data', {});
        const orders = this.safeList(responseData, 'items', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name kucoinfutures#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.kucoin.com/futures/#get-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, or market
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchClosedOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchClosedOrders', symbol, since, limit, params);
        }
        return await this.fetchOrdersByStatus('done', symbol, since, limit, params);
    }
    /**
     * @method
     * @name kucoinfutures#fetchOpenOrders
     * @description fetches information on multiple open orders made by the user
     * @see https://docs.kucoin.com/futures/#get-order-list
     * @see https://docs.kucoin.com/futures/#get-untriggered-stop-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, or market
     * @param {boolean} [params.trigger] set to true to retrieve untriggered stop orders
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOpenOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOpenOrders', symbol, since, limit, params);
        }
        return await this.fetchOrdersByStatus('open', symbol, since, limit, params);
    }
    /**
     * @method
     * @name kucoinfutures#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.kucoin.com/futures/#get-details-of-a-single-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id = undefined, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let response = undefined;
        if (id === undefined) {
            const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
            if (clientOrderId === undefined) {
                throw new errors.InvalidOrder(this.id + ' fetchOrder() requires parameter id or params.clientOid');
            }
            request['clientOid'] = clientOrderId;
            params = this.omit(params, ['clientOid', 'clientOrderId']);
            response = await this.futuresPrivateGetOrdersByClientOid(this.extend(request, params));
        }
        else {
            request['orderId'] = id;
            response = await this.futuresPrivateGetOrdersOrderId(this.extend(request, params));
        }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "id": "64507d02921f1c0001ff6892",
        //             "symbol": "XBTUSDTM",
        //             "type": "market",
        //             "side": "buy",
        //             "price": null,
        //             "size": 1,
        //             "value": "27.992",
        //             "dealValue": "27.992",
        //             "dealSize": 1,
        //             "stp": "",
        //             "stop": "",
        //             "stopPriceType": "",
        //             "stopTriggered": false,
        //             "stopPrice": null,
        //             "timeInForce": "GTC",
        //             "postOnly": false,
        //             "hidden": false,
        //             "iceberg": false,
        //             "leverage": "17",
        //             "forceHold": false,
        //             "closeOrder": false,
        //             "visibleSize": null,
        //             "clientOid": null,
        //             "remark": null,
        //             "tags": null,
        //             "isActive": false,
        //             "cancelExist": false,
        //             "createdAt": 1682996482000,
        //             "updatedAt": 1682996483000,
        //             "endAt": 1682996483000,
        //             "orderTime": 1682996482953900677,
        //             "settleCurrency": "USDT",
        //             "status": "done",
        //             "filledSize": 1,
        //             "filledValue": "27.992",
        //             "reduceOnly": false
        //         }
        //     }
        //
        const market = (symbol !== undefined) ? this.market(symbol) : undefined;
        const responseData = this.safeDict(response, 'data');
        return this.parseOrder(responseData, market);
    }
    parseOrder(order, market = undefined) {
        //
        // fetchOrder, fetchOrdersByStatus
        //
        //     {
        //         "id": "64507d02921f1c0001ff6892",
        //         "symbol": "XBTUSDTM",
        //         "type": "market",
        //         "side": "buy",
        //         "price": null,
        //         "size": 1,
        //         "value": "27.992",
        //         "dealValue": "27.992",
        //         "dealSize": 1,
        //         "stp": "",
        //         "stop": "",
        //         "stopPriceType": "",
        //         "stopTriggered": false,
        //         "stopPrice": null,
        //         "timeInForce": "GTC",
        //         "postOnly": false,
        //         "hidden": false,
        //         "iceberg": false,
        //         "leverage": "17",
        //         "forceHold": false,
        //         "closeOrder": false,
        //         "visibleSize": null,
        //         "clientOid": null,
        //         "remark": null,
        //         "tags": null,
        //         "isActive": false,
        //         "cancelExist": false,
        //         "createdAt": 1682996482000,
        //         "updatedAt": 1682996483062,
        //         "endAt": 1682996483062,
        //         "orderTime": 1682996482953900677,
        //         "settleCurrency": "USDT",
        //         "status": "done",
        //         "filledValue": "27.992",
        //         "filledSize": 1,
        //         "reduceOnly": false
        //     }
        //
        // createOrder
        //
        //     {
        //         "orderId": "619717484f1d010001510cde"
        //     }
        //
        // createOrders
        //
        //     {
        //         "orderId": "80465574458560512",
        //         "clientOid": "5c52e11203aa677f33e491",
        //         "symbol": "ETHUSDTM",
        //         "code": "200000",
        //         "msg": "success"
        //     }
        //
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const orderId = this.safeString2(order, 'id', 'orderId');
        const type = this.safeString(order, 'type');
        const timestamp = this.safeInteger(order, 'createdAt');
        const datetime = this.iso8601(timestamp);
        const price = this.safeString(order, 'price');
        // price is zero for market order
        // omitZero is called in safeOrder2
        const side = this.safeString(order, 'side');
        const feeCurrencyId = this.safeString(order, 'feeCurrency');
        const feeCurrency = this.safeCurrencyCode(feeCurrencyId);
        const feeCost = this.safeNumber(order, 'fee');
        const amount = this.safeString(order, 'size');
        const filled = this.safeString(order, 'filledSize');
        const cost = this.safeString(order, 'filledValue');
        let average = this.safeString(order, 'avgDealPrice');
        if ((average === undefined) && Precise["default"].stringGt(filled, '0')) {
            const contractSize = this.safeString(market, 'contractSize');
            if (market['linear']) {
                average = Precise["default"].stringDiv(cost, Precise["default"].stringMul(contractSize, filled));
            }
            else {
                average = Precise["default"].stringDiv(Precise["default"].stringMul(contractSize, filled), cost);
            }
        }
        // precision reported by their api is 8 d.p.
        // const average = Precise.stringDiv (cost, Precise.stringMul (filled, market['contractSize']));
        // bool
        const isActive = this.safeValue(order, 'isActive');
        const cancelExist = this.safeBool(order, 'cancelExist', false);
        let status = undefined;
        if (isActive !== undefined) {
            status = isActive ? 'open' : 'closed';
        }
        status = cancelExist ? 'canceled' : status;
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
            };
        }
        const clientOrderId = this.safeString(order, 'clientOid');
        const timeInForce = this.safeString(order, 'timeInForce');
        const postOnly = this.safeValue(order, 'postOnly');
        const reduceOnly = this.safeValue(order, 'reduceOnly');
        const lastUpdateTimestamp = this.safeInteger(order, 'updatedAt');
        return this.safeOrder({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'side': side,
            'amount': amount,
            'price': price,
            'triggerPrice': this.safeNumber(order, 'stopPrice'),
            'cost': cost,
            'filled': filled,
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': fee,
            'status': status,
            'info': order,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'average': average,
            'trades': undefined,
        }, market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.kucoin.com/docs/rest/futures-trading/funding-fees/get-current-funding-rate
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
        const response = await this.futuresPublicGetFundingRateSymbolCurrent(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": ".ETHUSDTMFPI8H",
        //            "granularity": 28800000,
        //            "timePoint": 1637380800000,
        //            "value": 0.0001,
        //            "predictedValue": 0.0001,
        //        },
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        // the website displayes the previous funding rate as "funding rate"
        return this.parseFundingRate(data, market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://www.kucoin.com/docs/rest/futures-trading/funding-fees/get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingInterval(symbol, params = {}) {
        return await this.fetchFundingRate(symbol, params);
    }
    parseFundingRate(data, market = undefined) {
        //
        //     {
        //         "symbol": ".ETHUSDTMFPI8H",
        //         "granularity": 28800000,
        //         "timePoint": 1637380800000,
        //         "value": 0.0001,
        //         "predictedValue": 0.0001,
        //     }
        //
        const fundingTimestamp = this.safeInteger(data, 'timePoint');
        const marketId = this.safeString(data, 'symbol');
        return {
            'info': data,
            'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber(data, 'value'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601(fundingTimestamp),
            'nextFundingRate': this.safeNumber(data, 'predictedValue'),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': this.parseFundingInterval(this.safeString(data, 'granularity')),
        };
    }
    parseFundingInterval(interval) {
        const intervals = {
            '3600000': '1h',
            '14400000': '4h',
            '28800000': '8h',
            '57600000': '16h',
            '86400000': '24h',
        };
        return this.safeString(intervals, interval, interval);
    }
    parseBalance(response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue(response, 'data');
        const currencyId = this.safeString(data, 'currency');
        const code = this.safeCurrencyCode(currencyId);
        const account = this.account();
        account['free'] = this.safeString(data, 'availableBalance');
        account['total'] = this.safeString(data, 'accountEquity');
        result[code] = account;
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name kucoinfutures#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs/rest/funding/funding-overview/get-account-detail-futures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        // only fetches one balance at a time
        let defaultCode = this.safeString(this.options, 'code');
        const fetchBalanceOptions = this.safeValue(this.options, 'fetchBalance', {});
        defaultCode = this.safeString(fetchBalanceOptions, 'code', defaultCode);
        const code = this.safeString(params, 'code', defaultCode);
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.futuresPrivateGetAccountOverview(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "accountEquity": 0.00005,
        //             "unrealisedPNL": 0,
        //             "marginBalance": 0.00005,
        //             "positionMargin": 0,
        //             "orderMargin": 0,
        //             "frozenFunds": 0,
        //             "availableBalance": 0.00005,
        //             "currency": "XBT"
        //         }
        //     }
        //
        return this.parseBalance(response);
    }
    /**
     * @method
     * @name kucoinfutures#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.kucoin.com/docs/rest/funding/transfer/transfer-to-main-or-trade-account
     * @see https://www.kucoin.com/docs/rest/funding/transfer/transfer-to-futures-account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const amountToPrecision = this.currencyToPrecision(code, amount);
        const request = {
            'currency': this.safeString(currency, 'id'),
            'amount': amountToPrecision,
        };
        const toAccountString = this.parseTransferType(toAccount);
        let response = undefined;
        if (toAccountString === 'TRADE' || toAccountString === 'MAIN') {
            request['recAccountType'] = toAccountString;
            response = await this.futuresPrivatePostTransferOut(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "applyId": "6738754373ceee00011ec3f8",
            //             "bizNo": "6738754373ceee00011ec3f7",
            //             "payAccountType": "CONTRACT",
            //             "payTag": "DEFAULT",
            //             "remark": "",
            //             "recAccountType": "MAIN",
            //             "recTag": "DEFAULT",
            //             "recRemark": "",
            //             "recSystem": "KUCOIN",
            //             "status": "PROCESSING",
            //             "currency": "USDT",
            //             "amount": "5",
            //             "fee": "0",
            //             "sn": 1519769124846692,
            //             "reason": "",
            //             "createdAt": 1731753283000,
            //             "updatedAt": 1731753283000
            //         }
            //     }
            //
        }
        else if (toAccount === 'future' || toAccount === 'swap' || toAccount === 'contract') {
            request['payAccountType'] = this.parseTransferType(fromAccount);
            response = await this.futuresPrivatePostTransferIn(this.extend(request, params));
            //
            //    {
            //        "code": "200000",
            //        "data": {
            //            "applyId": "5bffb63303aa675e8bbe18f9" // Transfer-out request ID
            //        }
            //    }
            //
        }
        else {
            throw new errors.BadRequest(this.id + ' transfer() only supports transfers between future/swap, spot and funding accounts');
        }
        const data = this.safeDict(response, 'data', {});
        return this.extend(this.parseTransfer(data, currency), {
            'amount': this.parseNumber(amountToPrecision),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer to spot or funding account
        //
        //     {
        //            "applyId": "5bffb63303aa675e8bbe18f9" // Transfer-out request ID
        //     }
        //
        // transfer to future account
        //
        //     {
        //         "applyId": "6738754373ceee00011ec3f8",
        //         "bizNo": "6738754373ceee00011ec3f7",
        //         "payAccountType": "CONTRACT",
        //         "payTag": "DEFAULT",
        //         "remark": "",
        //         "recAccountType": "MAIN",
        //         "recTag": "DEFAULT",
        //         "recRemark": "",
        //         "recSystem": "KUCOIN",
        //         "status": "PROCESSING",
        //         "currency": "USDT",
        //         "amount": "5",
        //         "fee": "0",
        //         "sn": 1519769124846692,
        //         "reason": "",
        //         "createdAt": 1731753283000,
        //         "updatedAt": 1731753283000
        //     }
        //
        const timestamp = this.safeInteger(transfer, 'updatedAt');
        return {
            'id': this.safeString(transfer, 'applyId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': this.safeCurrencyCode(undefined, currency),
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': this.safeString(transfer, 'status'),
            'info': transfer,
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'PROCESSING': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransferType(transferType) {
        const transferTypes = {
            'spot': 'TRADE',
            'funding': 'MAIN',
        };
        return this.safeStringUpper(transferTypes, transferType, transferType);
    }
    /**
     * @method
     * @name kucoinfutures#fetchMyTrades
     * @see https://docs.kucoin.com/futures/#get-fills
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] End time in ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        let request = {
        // orderId (String) [optional] Fills for a specific order (other parameters can be ignored if specified)
        // symbol (String) [optional] Symbol of the contract
        // side (String) [optional] buy or sell
        // type (String) [optional] limit, market, limit_stop or market_stop
        // startAt (long) [optional] Start time (millisecond)
        // endAt (long) [optional] End time (millisecond)
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = Math.min(1000, limit);
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        const response = await this.futuresPrivateGetFills(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //          "currentPage": 1,
        //          "pageSize": 1,
        //          "totalNum": 251915,
        //          "totalPage": 251915,
        //          "items": [
        //              {
        //                  "symbol": "XBTUSDM",  // Ticker symbol of the contract
        //                  "tradeId": "5ce24c1f0c19fc3c58edc47c",  // Trade ID
        //                  "orderId": "5ce24c16b210233c36ee321d",  // Order ID
        //                  "side": "sell",  // Transaction side
        //                  "liquidity": "taker",  // Liquidity- taker or maker
        //                  "price": "8302",  // Filled price
        //                  "size": 10,  // Filled amount
        //                  "value": "0.001204529",  // Order value
        //                  "feeRate": "0.0005",  // Floating fees
        //                  "fixFee": "0.00000006",  // Fixed fees
        //                  "feeCurrency": "XBT",  // Charging currency
        //                  "stop": "",  // A mark to the stop order type
        //                  "fee": "0.0000012022",  // Transaction fee
        //                  "orderType": "limit",  // Order type
        //                  "tradeType": "trade",  // Trade type (trade, liquidation, ADL or settlement)
        //                  "createdAt": 1558334496000,  // Time the order created
        //                  "settleCurrency": "XBT", // settlement currency
        //                  "tradeTime": 1558334496000000000 // trade time in nanosecond
        //              }
        //            ]
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        const trades = this.safeList(data, 'items', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name kucoinfutures#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-transaction-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPublicGetTradeHistory(this.extend(request, params));
        //
        //      {
        //          "code": "200000",
        //          "data": [
        //              {
        //                  "sequence": 32114961,
        //                  "side": "buy",
        //                  "size": 39,
        //                  "price": "4001.6500000000",
        //                  "takerOrderId": "61c20742f172110001e0ebe4",
        //                  "makerOrderId": "61c2073fcfc88100010fcb5d",
        //                  "tradeId": "61c2074277a0c473e69029b8",
        //                  "ts": 1640105794099993896   // filled time
        //              }
        //          ]
        //      }
        //
        const trades = this.safeList(response, 'data', []);
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "sequence": 32114961,
        //         "side": "buy",
        //         "size": 39,
        //         "price": "4001.6500000000",
        //         "takerOrderId": "61c20742f172110001e0ebe4",
        //         "makerOrderId": "61c2073fcfc88100010fcb5d",
        //         "tradeId": "61c2074277a0c473e69029b8",
        //         "ts": 1640105794099993896   // filled time
        //     }
        //
        // fetchMyTrades (private) v2
        //
        //     {
        //         "symbol":"BTC-USDT",
        //         "tradeId":"5c35c02709e4f67d5266954e",
        //         "orderId":"5c35c02703aa673ceec2a168",
        //         "counterOrderId":"5c1ab46003aa676e487fa8e3",
        //         "side":"buy",
        //         "liquidity":"taker",
        //         "forceTaker":true,
        //         "price":"0.083",
        //         "size":"0.8424304",
        //         "funds":"0.0699217232",
        //         "fee":"0",
        //         "feeRate":"0",
        //         "feeCurrency":"USDT",
        //         "stop":"",
        //         "type":"limit",
        //         "createdAt":1547026472000
        //     }
        //
        // fetchMyTrades (private) v1
        //
        //    {
        //        "symbol":"DOGEUSDTM",
        //        "tradeId":"620ec41a96bab27b5f4ced56",
        //        "orderId":"620ec41a0d1d8a0001560bd0",
        //        "side":"sell",
        //        "liquidity":"taker",
        //        "forceTaker":true,
        //        "price":"0.13969",
        //        "size":1,
        //        "value":"13.969",
        //        "feeRate":"0.0006",
        //        "fixFee":"0",
        //        "feeCurrency":"USDT",
        //        "stop":"",
        //        "tradeTime":1645134874858018058,
        //        "fee":"0.0083814",
        //        "settleCurrency":"USDT",
        //        "orderType":"market",
        //        "tradeType":"trade",
        //        "createdAt":1645134874858
        //    }
        //
        // watchTrades
        //
        //    {
        //        "makerUserId": "62286a4d720edf0001e81961",
        //        "symbol": "ADAUSDTM",
        //        "sequence": 41320766,
        //        "side": "sell",
        //        "size": 2,
        //        "price": 0.35904,
        //        "takerOrderId": "636dd9da9857ba00010cfa44",
        //        "makerOrderId": "636dd9c8df149d0001e62bc8",
        //        "takerUserId": "6180be22b6ab210001fa3371",
        //        "tradeId": "636dd9da0000d400d477eca7",
        //        "ts": 1668143578987357700
        //    }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market, '-');
        const id = this.safeString2(trade, 'tradeId', 'id');
        const orderId = this.safeString(trade, 'orderId');
        const takerOrMaker = this.safeString(trade, 'liquidity');
        let timestamp = this.safeInteger(trade, 'ts');
        if (timestamp !== undefined) {
            timestamp = this.parseToInt(timestamp / 1000000);
        }
        else {
            timestamp = this.safeInteger(trade, 'createdAt');
            // if it's a historical v1 trade, the exchange returns timestamp in seconds
            if (('dealValue' in trade) && (timestamp !== undefined)) {
                timestamp = timestamp * 1000;
            }
        }
        const priceString = this.safeString2(trade, 'price', 'dealPrice');
        const amountString = this.safeString2(trade, 'size', 'amount');
        const side = this.safeString(trade, 'side');
        let fee = undefined;
        const feeCostString = this.safeString(trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'feeCurrency');
            let feeCurrency = this.safeCurrencyCode(feeCurrencyId);
            if (feeCurrency === undefined) {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrency,
                'rate': this.safeString(trade, 'feeRate'),
            };
        }
        let type = this.safeString2(trade, 'type', 'orderType');
        if (type === 'match') {
            type = undefined;
        }
        let costString = this.safeString2(trade, 'funds', 'value');
        if (costString === undefined) {
            const contractSize = this.safeString(market, 'contractSize');
            const contractCost = Precise["default"].stringMul(priceString, amountString);
            costString = Precise["default"].stringMul(contractCost, contractSize);
        }
        return this.safeTrade({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.futuresPrivateGetDepositList(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "address": "0x5f047b29041bcfdbf0e4478cdfa753a336ba6989",
        //                     "memo": "5c247c8a03aa677cea2a251d",
        //                     "amount": 1,
        //                     "fee": 0.0001,
        //                     "currency": "KCS",
        //                     "isInner": false,
        //                     "walletTxId": "5bbb57386d99522d9f954c5a@test004",
        //                     "status": "SUCCESS",
        //                     "createdAt": 1544178843000,
        //                     "updatedAt": 1544178891000
        //                     "remark":"foobar"
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions(responseData, currency, since, limit, { 'type': 'deposit' });
    }
    /**
     * @method
     * @name kucoinfutures#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.futuresPrivateGetWithdrawalList(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "id": "5c2dc64e03aa675aa263f1ac",
        //                     "address": "0x5bedb060b8eb8d823e2414d82acce78d38be7fe9",
        //                     "memo": "",
        //                     "currency": "ETH",
        //                     "amount": 1.0000000,
        //                     "fee": 0.0100000,
        //                     "walletTxId": "3e2414d82acce78d38be7fe9",
        //                     "isInner": false,
        //                     "status": "FAILURE",
        //                     "createdAt": 1546503758000,
        //                     "updatedAt": 1546504603000
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions(responseData, currency, since, limit, { 'type': 'withdrawal' });
    }
    /**
     * @method
     * @name kucoinfutures#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://www.kucoin.com/docs/rest/futures-trading/risk-limit/get-futures-risk-limit-level
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    async fetchMarketLeverageTiers(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' fetchMarketLeverageTiers() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPublicGetContractsRiskLimitSymbol(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "symbol": "ETHUSDTM",
        //                "level": 1,
        //                "maxRiskLimit": 300000,
        //                "minRiskLimit": 0,
        //                "maxLeverage": 100,
        //                "initialMargin": 0.0100000000,
        //                "maintainMargin": 0.0050000000
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data');
        return this.parseMarketLeverageTiers(data, market);
    }
    parseMarketLeverageTiers(info, market = undefined) {
        /**
         * @ignore
         * @method
         * @name kucoinfutures#parseMarketLeverageTiers
         * @param {object} info Exchange market response for 1 market
         * @param {object} market CCXT market
         */
        //
        //    {
        //        "symbol": "ETHUSDTM",
        //        "level": 1,
        //        "maxRiskLimit": 300000,
        //        "minRiskLimit": 0,
        //        "maxLeverage": 100,
        //        "initialMargin": 0.0100000000,
        //        "maintainMargin": 0.0050000000
        //    }
        //
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const tier = info[i];
            const marketId = this.safeString(tier, 'symbol');
            tiers.push({
                'tier': this.safeNumber(tier, 'level'),
                'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
                'currency': market['base'],
                'minNotional': this.safeNumber(tier, 'minRiskLimit'),
                'maxNotional': this.safeNumber(tier, 'maxRiskLimit'),
                'maintenanceMarginRate': this.safeNumber(tier, 'maintainMargin'),
                'maxLeverage': this.safeNumber(tier, 'maxLeverage'),
                'info': tier,
            });
        }
        return tiers;
    }
    /**
     * @method
     * @name kucoinfutures#fetchFundingRateHistory
     * @see https://www.kucoin.com/docs/rest/futures-trading/funding-fees/get-public-funding-history#request-url
     * @description fetches historical funding rate prices
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not used by kucuoinfutures
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'from': 0,
            'to': this.milliseconds(),
        };
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['until']);
        if (since !== undefined) {
            request['from'] = since;
            if (until === undefined) {
                request['to'] = since + 1000 * 8 * 60 * 60 * 100;
            }
        }
        if (until !== undefined) {
            request['to'] = until;
            if (since === undefined) {
                request['to'] = until - 1000 * 8 * 60 * 60 * 100;
            }
        }
        const response = await this.futuresPublicGetContractFundingRates(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "symbol": "IDUSDTM",
        //                 "fundingRate": 2.26E-4,
        //                 "timepoint": 1702296000000
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.parseFundingRateHistories(data, market, since, limit);
    }
    parseFundingRateHistory(info, market = undefined) {
        const timestamp = this.safeInteger(info, 'timepoint');
        const marketId = this.safeString(info, 'symbol');
        return {
            'info': info,
            'symbol': this.safeSymbol(marketId, market),
            'fundingRate': this.safeNumber(info, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name kucoinfutures#closePosition
     * @description closes open positions for a market
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/place-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side not used by kucoinfutures closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.clientOrderId] client order id of the order
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async closePosition(symbol, side = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let clientOrderId = this.safeString(params, 'clientOrderId');
        const testOrder = this.safeBool(params, 'test', false);
        params = this.omit(params, ['test', 'clientOrderId']);
        if (clientOrderId === undefined) {
            clientOrderId = this.numberToString(this.nonce());
        }
        const request = {
            'symbol': market['id'],
            'closeOrder': true,
            'clientOid': clientOrderId,
            'type': 'market',
        };
        let response = undefined;
        if (testOrder) {
            response = await this.futuresPrivatePostOrdersTest(this.extend(request, params));
        }
        else {
            response = await this.futuresPrivatePostOrders(this.extend(request, params));
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.kucoin.com/docs/rest/funding/trade-fee/trading-pair-actual-fee-futures
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbols': market['id'],
        };
        const response = await this.privateGetTradeFees(this.extend(request, params));
        //
        //  {
        //      "code": "200000",
        //      "data": {
        //        "symbol": "XBTUSDTM",
        //        "takerFeeRate": "0.0006",
        //        "makerFeeRate": "0.0002"
        //      }
        //  }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0);
        const marketId = this.safeString(first, 'symbol');
        return {
            'info': response,
            'symbol': this.safeSymbol(marketId, market),
            'maker': this.safeNumber(first, 'makerFeeRate'),
            'taker': this.safeNumber(first, 'takerFeeRate'),
            'percentage': true,
            'tierBased': true,
        };
    }
    /**
     * @method
     * @name kucoinfutures#fetchMarginMode
     * @description fetches the margin mode of a trading pair
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/get-margin-mode
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    async fetchMarginMode(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPrivateGetPositionGetMarginMode(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "symbol": "XBTUSDTM",
        //             "marginMode": "ISOLATED"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginMode(data, market);
    }
    parseMarginMode(marginMode, market = undefined) {
        let marginType = this.safeString(marginMode, 'marginMode');
        marginType = (marginType === 'ISOLATED') ? 'isolated' : 'cross';
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': marginType,
        };
    }
    /**
     * @method
     * @name kucoinfutures#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/modify-margin-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        this.checkRequiredArgument('setMarginMode', marginMode, 'marginMode', ['cross', 'isolated']);
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'marginMode': marginMode.toUpperCase(),
        };
        const response = await this.futuresPrivatePostPositionChangeMarginMode(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "XBTUSDTM",
        //            "marginMode": "ISOLATED"
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginMode(data, market);
    }
    /**
     * @method
     * @name kucoinfutures#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/get-cross-margin-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams(symbol, params);
        if (marginMode !== 'cross') {
            throw new errors.NotSupported(this.id + ' fetchLeverage() currently supports only params["marginMode"] = "cross"');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPrivateGetGetCrossUserLeverage(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "XBTUSDTM",
        //            "leverage": "3"
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        const parsed = this.parseLeverage(data, market);
        return this.extend(parsed, {
            'marginMode': marginMode,
        });
    }
    /**
     * @method
     * @name kucoinfutures#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/modify-cross-margin-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams(symbol, params);
        if (marginMode !== 'cross') {
            throw new errors.NotSupported(this.id + ' setLeverage() currently supports only params["marginMode"] = "cross"');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'leverage': leverage.toString(),
        };
        const response = await this.futuresPrivatePostChangeCrossUserLeverage(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": true
        //    }
        //
        return this.parseLeverage(response, market);
    }
    parseLeverage(leverage, market = undefined) {
        const marketId = this.safeString(leverage, 'symbol');
        market = this.safeMarket(marketId, market);
        const leverageNum = this.safeInteger(leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': undefined,
            'longLeverage': leverageNum,
            'shortLeverage': leverageNum,
        };
    }
}

module.exports = kucoinfutures;
