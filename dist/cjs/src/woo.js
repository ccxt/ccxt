'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var woo$1 = require('./abstract/woo.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class woo
 * @augments Exchange
 */
class woo extends woo$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'woo',
            'name': 'WOO X',
            'countries': ['KY'],
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'hostname': 'woox.io',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': true,
                'fetchConvertQuote': true,
                'fetchConvertTrade': true,
                'fetchConvertTradeHistory': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': true,
                'fetchFundingInterval': true,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://docx.woo.io/wootrade-documents/#token-withdraw
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg',
                'api': {
                    'pub': 'https://api-pub.woox.io',
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'pub': 'https://api-pub.staging.woox.io',
                    'public': 'https://api.staging.woox.io',
                    'private': 'https://api.staging.woox.io',
                },
                'www': 'https://woox.io/',
                'doc': [
                    'https://docs.woox.io/',
                ],
                'fees': [
                    'https://support.woox.io/hc/en-001/articles/4404611795353--Trading-Fees',
                ],
                'referral': {
                    'url': 'https://woox.io/register?ref=DIJT0CNL',
                    'discount': 0.35,
                },
            },
            'api': {
                'v1': {
                    'pub': {
                        'get': {
                            'hist/kline': 10,
                            'hist/trades': 10,
                        },
                    },
                    'public': {
                        'get': {
                            'info': 1,
                            'info/{symbol}': 1,
                            'system_info': 1,
                            'market_trades': 1,
                            'token': 1,
                            'token_network': 1,
                            'funding_rates': 1,
                            'funding_rate/{symbol}': 1,
                            'funding_rate_history': 1,
                            'futures': 1,
                            'futures/{symbol}': 1,
                            'orderbook/{symbol}': 1,
                            'kline': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/token': 1,
                            'order/{oid}': 1,
                            'client/order/{client_order_id}': 1,
                            'orders': 1,
                            'client/trade/{tid}': 1,
                            'order/{oid}/trades': 1,
                            'client/trades': 1,
                            'client/hist_trades': 1,
                            'staking/yield_history': 1,
                            'client/holding': 1,
                            'asset/deposit': 10,
                            'asset/history': 60,
                            'sub_account/all': 60,
                            'sub_account/assets': 60,
                            'sub_account/asset_detail': 60,
                            'sub_account/ip_restriction': 10,
                            'asset/main_sub_transfer_history': 30,
                            'token_interest': 60,
                            'token_interest/{token}': 60,
                            'interest/history': 60,
                            'interest/repay': 60,
                            'funding_fee/history': 30,
                            'positions': 3.33,
                            'position/{symbol}': 3.33,
                            'client/transaction_history': 60,
                            'client/futures_leverage': 60,
                        },
                        'post': {
                            'order': 1,
                            'order/cancel_all_after': 1,
                            'asset/ltv': 30,
                            'asset/internal_withdraw': 30,
                            'interest/repay': 60,
                            'client/account_mode': 120,
                            'client/position_mode': 5,
                            'client/leverage': 120,
                            'client/futures_leverage': 30,
                            'client/isolated_margin': 30,
                        },
                        'delete': {
                            'order': 1,
                            'client/order': 1,
                            'orders': 1,
                            'asset/withdraw': 120, // implemented in ccxt, disabled on the exchange side https://docx.woo.io/wootrade-documents/#cancel-withdraw-request
                        },
                    },
                },
                'v2': {
                    'private': {
                        'get': {
                            'client/holding': 1,
                        },
                    },
                },
                'v3': {
                    'public': {
                        'get': {
                            'systemInfo': 1,
                            'instruments': 1,
                            'token': 1,
                            'tokenNetwork': 1,
                            'tokenInfo': 1,
                            'marketTrades': 1,
                            'marketTradesHistory': 1,
                            'orderbook': 1,
                            'kline': 1,
                            'klineHistory': 1,
                            'futures': 1,
                            'fundingRate': 1,
                            'fundingRateHistory': 1,
                            'insuranceFund': 1, // 10/1s
                        },
                    },
                    'private': {
                        'get': {
                            'trade/order': 2,
                            'trade/orders': 1,
                            'trade/algoOrder': 1,
                            'trade/algoOrders': 1,
                            'trade/transaction': 1,
                            'trade/transactionHistory': 5,
                            'trade/tradingFee': 5,
                            'account/info': 60,
                            'account/tokenConfig': 1,
                            'account/symbolConfig': 1,
                            'account/subAccounts/all': 60,
                            'account/referral/summary': 60,
                            'account/referral/rewardHistory': 60,
                            'account/credentials': 60,
                            'asset/balances': 1,
                            'asset/token/history': 60,
                            'asset/transfer/history': 30,
                            'asset/wallet/history': 60,
                            'asset/wallet/deposit': 60,
                            'asset/staking/yieldHistory': 60,
                            'futures/positions': 3.33,
                            'futures/leverage': 60,
                            'futures/defaultMarginMode': 60,
                            'futures/fundingFee/history': 30,
                            'spotMargin/interestRate': 60,
                            'spotMargin/interestHistory': 60,
                            'spotMargin/maxMargin': 60,
                            'algo/order/{oid}': 1,
                            'algo/orders': 1,
                            'positions': 3.33,
                            'buypower': 1,
                            'convert/exchangeInfo': 1,
                            'convert/assetInfo': 1,
                            'convert/rfq': 60,
                            'convert/trade': 1,
                            'convert/trades': 1,
                        },
                        'post': {
                            'trade/order': 2,
                            'trade/algoOrder': 5,
                            'trade/cancelAllAfter': 1,
                            'account/tradingMode': 120,
                            'account/listenKey': 20,
                            'asset/transfer': 30,
                            'asset/wallet/withdraw': 60,
                            'spotMargin/leverage': 120,
                            'spotMargin/interestRepay': 60,
                            'algo/order': 5,
                            'convert/rft': 60,
                        },
                        'put': {
                            'trade/order': 2,
                            'trade/algoOrder': 2,
                            'futures/leverage': 60,
                            'futures/positionMode': 120,
                            'order/{oid}': 2,
                            'order/client/{client_order_id}': 2,
                            'algo/order/{oid}': 2,
                            'algo/order/client/{client_order_id}': 2,
                        },
                        'delete': {
                            'trade/order': 1,
                            'trade/orders': 1,
                            'trade/algoOrder': 1,
                            'trade/algoOrders': 1,
                            'trade/allOrders': 1,
                            'algo/order/{order_id}': 1,
                            'algo/orders/pending': 1,
                            'algo/orders/pending/{symbol}': 1,
                            'orders/pending': 1,
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
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'sandboxMode': false,
                'createMarketBuyOrderRequiresPrice': true,
                // these network aliases require manual mapping here
                'network-aliases-for-tokens': {
                    'HT': 'ERC20',
                    'OMG': 'ERC20',
                    'UATOM': 'ATOM',
                    'ZRX': 'ZRX',
                },
                'networks': {
                    'TRX': 'TRON',
                    'TRC20': 'TRON',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                    'ARB': 'Arbitrum',
                },
                'networksById': {
                    'TRX': 'TRC20',
                    'TRON': 'TRC20',
                },
                // override defaultNetworkCodePriorities for a specific currency
                'defaultNetworkCodeForCurrencies': {
                // 'USDT': 'TRC20',
                // 'BTC': 'BTC',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'brokerId': 'bc830de7-50f3-460b-9ee0-f430f83f9dad',
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
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
                            'GTD': true,
                        },
                        'hedged': false,
                        'trailing': true,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': true, // todo implement
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 90,
                        'untilDays': 10000,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'untilDays': 100000,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 100000,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'forSwap': {
                    'extends': 'default',
                    'createOrder': {
                        'hedged': true,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forSwap',
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
                    '-1000': errors.OperationFailed,
                    '-1001': errors.AuthenticationError,
                    '-1002': errors.AuthenticationError,
                    '-1003': errors.RateLimitExceeded,
                    '-1004': errors.BadRequest,
                    '-1005': errors.BadRequest,
                    '-1006': errors.BadRequest,
                    '-1007': errors.BadRequest,
                    '-1008': errors.InvalidOrder,
                    '-1009': errors.BadRequest,
                    '-1012': errors.BadRequest,
                    '-1101': errors.InvalidOrder,
                    '-1102': errors.InvalidOrder,
                    '-1103': errors.InvalidOrder,
                    '-1104': errors.InvalidOrder,
                    '-1105': errors.InvalidOrder, // { "code": -1105,  "message": "Price is X% too high or X% too low from the mid price." }
                },
                'broad': {
                    'Can not place': errors.ExchangeError,
                    'maintenance': errors.OnMaintenance,
                    'symbol must not be blank': errors.BadRequest,
                    'The token is not supported': errors.BadRequest,
                    'Your order and symbol are not valid or already canceled': errors.BadRequest,
                    'Insufficient WOO. Please enable margin trading for leverage trading': errors.BadRequest, // when selling insufficent token [-1012]
                },
            },
            'precisionMode': number.TICK_SIZE,
        });
    }
    /**
     * @method
     * @name woo#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://developer.woox.io/api-reference/endpoint/public_data/systemInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.v3PublicGetSystemInfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": 0,
        //             "msg": "System is functioning properly.",
        //             "estimatedEndTime": 1749963600362
        //         },
        //         "timestamp": 1751442989564
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        let status = this.safeString(data, 'status');
        if (status === undefined) {
            status = 'error';
        }
        else if (status === '0') {
            status = 'ok';
        }
        else {
            status = 'maintenance';
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
     * @name woo#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://developer.woox.io/api-reference/endpoint/public_data/systemInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.v3PublicGetSystemInfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": 0,
        //             "msg": "System is functioning properly.",
        //             "estimatedEndTime": 1749963600362
        //         },
        //         "timestamp": 1751442989564
        //     }
        //
        return this.safeInteger(response, 'timestamp');
    }
    /**
     * @method
     * @name woo#fetchMarkets
     * @description retrieves data on all markets for woo
     * @see https://developer.woox.io/api-reference/endpoint/public_data/instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const response = await this.v3PublicGetInstruments(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "SPOT_AAVE_USDT",
        //                     "status": "TRADING",
        //                     "baseAsset": "AAVE",
        //                     "baseAssetMultiplier": 1,
        //                     "quoteAsset": "USDT",
        //                     "quoteMin": "0",
        //                     "quoteMax": "100000",
        //                     "quoteTick": "0.01",
        //                     "baseMin": "0.005",
        //                     "baseMax": "5000",
        //                     "baseTick": "0.0001",
        //                     "minNotional": "1",
        //                     "bidCapRatio": "1.1",
        //                     "bidFloorRatio": null,
        //                     "askCapRatio": null,
        //                     "askFloorRatio": "0.9",
        //                     "orderMode": "NORMAL",
        //                     "impactNotional": null,
        //                     "isAllowedRpi": false,
        //                     "tickGranularity": null
        //                 }
        //             ]
        //         },
        //         "timestamp": 1751512951338
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseMarkets(rows);
    }
    parseMarket(market) {
        const marketId = this.safeString(market, 'symbol');
        const parts = marketId.split('_');
        const first = this.safeString(parts, 0);
        let marketType;
        let spot = false;
        let swap = false;
        if (first === 'SPOT') {
            spot = true;
            marketType = 'spot';
        }
        else if (first === 'PERP') {
            swap = true;
            marketType = 'swap';
        }
        const baseId = this.safeString(parts, 1);
        const quoteId = this.safeString(parts, 2);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        let settleId = undefined;
        let settle = undefined;
        let symbol = base + '/' + quote;
        let contractSize = undefined;
        let linear = undefined;
        let inverse = undefined;
        let margin = true;
        const contract = swap;
        if (contract) {
            margin = false;
            settleId = this.safeString(parts, 2);
            settle = this.safeCurrencyCode(settleId);
            symbol = base + '/' + quote + ':' + settle;
            contractSize = this.parseNumber('1');
            linear = true;
            inverse = false;
        }
        const active = this.safeString(market, 'status') === 'TRADING';
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': spot,
            'margin': margin,
            'swap': swap,
            'future': false,
            'option': false,
            'active': active,
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'baseTick'),
                'price': this.safeNumber(market, 'quoteTick'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'baseMin'),
                    'max': this.safeNumber(market, 'baseMax'),
                },
                'price': {
                    'min': this.safeNumber(market, 'quoteMin'),
                    'max': this.safeNumber(market, 'quoteMax'),
                },
                'cost': {
                    'min': this.safeNumber(market, 'minNotional'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }
    /**
     * @method
     * @name woo#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://developer.woox.io/api-reference/endpoint/public_data/marketTrades
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
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v3PublicGetMarketTrades(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "SPOT_BTC_USDT",
        //                     "side": "SELL",
        //                     "source": 0,
        //                     "executedPrice": "108741.01",
        //                     "executedQuantity": "0.02477",
        //                     "executedTimestamp": 1751513940144
        //                 }
        //             ]
        //         },
        //         "timestamp": 1751513988543
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseTrades(rows, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // public/market_trades
        //
        //     {
        //         "symbol": "SPOT_BTC_USDT",
        //         "side": "SELL",
        //         "source": 0,
        //         "executedPrice": "108741.01",
        //         "executedQuantity": "0.02477",
        //         "executedTimestamp": 1751513940144
        //     }
        //
        // fetchOrderTrades, fetchOrder
        //
        //     {
        //         "id": 1734947821,
        //         "symbol": "SPOT_LTC_USDT",
        //         "orderId": 60780383217,
        //         "executedPrice": 87.86,
        //         "executedQuantity": 0.1,
        //         "fee": 0.0001,
        //         "realizedPnl": null,
        //         "feeAsset": "LTC",
        //         "orderTag": "default",
        //         "side": "BUY",
        //         "executedTimestamp": "1752055173.630",
        //         "isMaker": 0
        //     }
        //
        const isFromFetchOrder = ('id' in trade);
        const timestampString = this.safeString2(trade, 'executed_timestamp', 'executedTimestamp');
        let timestamp = undefined;
        if (timestampString !== undefined) {
            if (timestampString.indexOf('.') > -1) {
                timestamp = this.safeTimestamp2(trade, 'executed_timestamp', 'executedTimestamp');
            }
            else {
                timestamp = this.safeInteger(trade, 'executedTimestamp');
            }
        }
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2(trade, 'executed_price', 'executedPrice');
        const amount = this.safeString2(trade, 'executed_quantity', 'executedQuantity');
        const order_id = this.safeString2(trade, 'order_id', 'orderId');
        const fee = this.parseTokenAndFeeTemp(trade, ['fee_asset', 'feeAsset'], ['fee']);
        const feeCost = this.safeString(fee, 'cost');
        if (feeCost !== undefined) {
            fee['cost'] = feeCost;
        }
        const cost = Precise["default"].stringMul(price, amount);
        const side = this.safeStringLower(trade, 'side');
        const id = this.safeString(trade, 'id');
        let takerOrMaker = undefined;
        if (isFromFetchOrder) {
            const isMaker = this.safeString2(trade, 'is_maker', 'isMaker') === '1';
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': order_id,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }
    parseTokenAndFeeTemp(item, feeTokenKeys, feeAmountKeys) {
        const feeCost = this.safeStringN(item, feeAmountKeys);
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeStringN(item, feeTokenKeys);
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return fee;
    }
    parseTradingFee(fee, market = undefined) {
        const marketId = this.safeString(fee, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.parseNumber(Precise["default"].stringDiv(this.safeString(fee, 'makerFee'), '100')),
            'taker': this.parseNumber(Precise["default"].stringDiv(this.safeString(fee, 'takerFee'), '100')),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    /**
     * @method
     * @name woo#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_tradingFee
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch trading fees in a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v3PrivateGetTradeTradingFee(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "symbol": "SPOT_BTC_USDT",
        //             "takerFee": "10",
        //             "makerFee": "8"
        //         },
        //         "timestamp": 1751858977368
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTradingFee(data, market);
    }
    /**
     * @method
     * @name woo#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://developer.woox.io/api-reference/endpoint/account/get_account_info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.v3PrivateGetAccountInfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "applicationId": "251bf5c4-f3c8-4544-bb8b-80001007c3c0",
        //             "account": "carlos_jose_lima@yahoo.com",
        //             "alias": "carlos_jose_lima@yahoo.com",
        //             "otpauth": true,
        //             "accountMode": "FUTURES",
        //             "positionMode": "ONE_WAY",
        //             "leverage": 0,
        //             "makerFeeRate": 0,
        //             "takerFeeRate": 0,
        //             "marginRatio": "10",
        //             "openMarginRatio": "10",
        //             "initialMarginRatio": "10",
        //             "maintenanceMarginRatio": "0.03",
        //             "totalCollateral": "165.55629469",
        //             "freeCollateral": "165.55629469",
        //             "totalAccountValue": "167.32418611",
        //             "totalTradingValue": "167.32418611",
        //             "totalVaultValue": "0",
        //             "totalStakingValue": "0",
        //             "totalLaunchpadValue": "0",
        //             "totalEarnValue": "0",
        //             "referrerID": null,
        //             "accountType": "Main"
        //         },
        //         "timestamp": 1752062807915
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const maker = this.safeString(data, 'makerFeeRate');
        const taker = this.safeString(data, 'takerFeeRate');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.parseNumber(Precise["default"].stringDiv(maker, '10000')),
                'taker': this.parseNumber(Precise["default"].stringDiv(taker, '10000')),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }
    /**
     * @method
     * @name woo#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.woox.io/#available-token-public
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const result = {};
        const tokenResponsePromise = this.v1PublicGetToken(params);
        //
        //    {
        //      "rows": [
        //         {
        //             "token": "ETH_USDT",
        //             "fullname": "Tether",
        //             "network": "ETH",
        //             "decimals": "6",
        //             "delisted": false,
        //             "balance_token": "USDT",
        //             "created_time": "1710123398",
        //             "updated_time": "1746528481",
        //             "can_collateral": true,
        //             "can_short": true
        //         },
        //         {
        //             "token": "BSC_USDT",
        //             "fullname": "Tether",
        //             "network": "BSC",
        //             "decimals": "18",
        //             "delisted": false,
        //             "balance_token": "USDT",
        //             "created_time": "1710123395",
        //             "updated_time": "1746528601",
        //             "can_collateral": true,
        //             "can_short": true
        //         },
        //         {
        //             "token": "ALGO",
        //             "fullname": "Algorand",
        //             "network": "ALGO",
        //             "decimals": "6",
        //             "delisted": false,
        //             "balance_token": "ALGO",
        //             "created_time": "1710123394",
        //             "updated_time": "1723087518",
        //             "can_collateral": true,
        //             "can_short": true
        //         },
        //         ...
        //     ],
        //     "success": true
        // }
        //
        // only make one request for currrencies...
        const tokenNetworkResponsePromise = this.v1PublicGetTokenNetwork(params);
        //
        // {
        //     "rows": [
        //         {
        //             "protocol": "ERC20",
        //             "network": "ETH",
        //             "token": "USDT",
        //             "name": "Ethereum (ERC20)",
        //             "minimum_withdrawal": "10.00000000",
        //             "withdrawal_fee": "2.00000000",
        //             "allow_deposit": "1",
        //             "allow_withdraw": "1"
        //         },
        //         {
        //             "protocol": "TRC20",
        //             "network": "TRX",
        //             "token": "USDT",
        //             "name": "Tron (TRC20)",
        //             "minimum_withdrawal": "10.00000000",
        //             "withdrawal_fee": "4.50000000",
        //             "allow_deposit": "1",
        //             "allow_withdraw": "1"
        //         },
        //         ...
        //     ],
        //     "success": true
        // }
        //
        const [tokenResponse, tokenNetworkResponse] = await Promise.all([tokenResponsePromise, tokenNetworkResponsePromise]);
        const tokenRows = this.safeList(tokenResponse, 'rows', []);
        const tokenNetworkRows = this.safeList(tokenNetworkResponse, 'rows', []);
        const networksById = this.groupBy(tokenNetworkRows, 'token');
        const tokensById = this.groupBy(tokenRows, 'balance_token');
        const currencyIds = Object.keys(tokensById);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode(currencyId);
            const tokensByNetworkId = this.indexBy(tokensById[currencyId], 'network');
            const chainsByNetworkId = this.indexBy(networksById[currencyId], 'network');
            const keys = Object.keys(chainsByNetworkId);
            const resultingNetworks = {};
            for (let j = 0; j < keys.length; j++) {
                const networkId = keys[j];
                const tokenEntry = this.safeDict(tokensByNetworkId, networkId, {});
                const networkEntry = this.safeDict(chainsByNetworkId, networkId, {});
                const networkCode = this.networkIdToCode(networkId, code);
                const specialNetworkId = this.safeString(tokenEntry, 'token');
                resultingNetworks[networkCode] = {
                    'id': networkId,
                    'currencyNetworkId': specialNetworkId,
                    'network': networkCode,
                    'active': undefined,
                    'deposit': this.safeString(networkEntry, 'allow_deposit') === '1',
                    'withdraw': this.safeString(networkEntry, 'allow_withdraw') === '1',
                    'fee': this.safeNumber(networkEntry, 'withdrawal_fee'),
                    'precision': this.parseNumber(this.parsePrecision(this.safeString(tokenEntry, 'decimals'))),
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber(networkEntry, 'minimum_withdrawal'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'info': [networkEntry, tokenEntry],
                };
            }
            result[code] = this.safeCurrencyStructure({
                'id': currencyId,
                'name': undefined,
                'code': code,
                'precision': undefined,
                'active': undefined,
                'fee': undefined,
                'networks': resultingNetworks,
                'deposit': undefined,
                'withdraw': undefined,
                'type': 'crypto',
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': [tokensByNetworkId, chainsByNetworkId],
            });
        }
        return result;
    }
    /**
     * @method
     * @name woo#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://docs.woox.io/#send-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        return await this.createOrder(symbol, 'market', 'buy', cost, 1, params);
    }
    /**
     * @method
     * @name woo#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://docs.woox.io/#send-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createMarketSellOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketSellOrderWithCost() supports spot orders only');
        }
        return await this.createOrder(symbol, 'market', 'sell', cost, 1, params);
    }
    /**
     * @method
     * @name woo#createTrailingAmountOrder
     * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
     * @see https://docs.woox.io/#send-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
     * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
     * @param {float} trailingAmount the quote amount to trail away from the current market price
     * @param {float} trailingTriggerPrice the price to activate a trailing order, default uses the price argument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createTrailingAmountOrder(symbol, type, side, amount, price = undefined, trailingAmount = undefined, trailingTriggerPrice = undefined, params = {}) {
        if (trailingAmount === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createTrailingAmountOrder() requires a trailingAmount argument');
        }
        if (trailingTriggerPrice === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createTrailingAmountOrder() requires a trailingTriggerPrice argument');
        }
        params['trailingAmount'] = trailingAmount;
        params['trailingTriggerPrice'] = trailingTriggerPrice;
        return await this.createOrder(symbol, type, side, amount, price, params);
    }
    /**
     * @method
     * @name woo#createTrailingPercentOrder
     * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
     * @see https://docs.woox.io/#send-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
     * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
     * @param {float} trailingPercent the percent to trail away from the current market price
     * @param {float} trailingTriggerPrice the price to activate a trailing order, default uses the price argument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createTrailingPercentOrder(symbol, type, side, amount, price = undefined, trailingPercent = undefined, trailingTriggerPrice = undefined, params = {}) {
        if (trailingPercent === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createTrailingPercentOrder() requires a trailingPercent argument');
        }
        if (trailingTriggerPrice === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createTrailingPercentOrder() requires a trailingTriggerPrice argument');
        }
        params['trailingPercent'] = trailingPercent;
        params['trailingTriggerPrice'] = trailingTriggerPrice;
        return await this.createOrder(symbol, type, side, amount, price, params);
    }
    /**
     * @method
     * @name woo#createOrder
     * @description create a trade order
     * @see https://developer.woox.io/api-reference/endpoint/trading/post_order
     * @see https://developer.woox.io/api-reference/endpoint/trading/post_algo_order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] *for swap markets only* 'cross' or 'isolated', default 'cross'
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.algoType] 'STOP' or 'TRAILING_STOP' or 'OCO' or 'CLOSE_POSITION'
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @param {string} [params.position_side] 'SHORT' or 'LONG' - if position mode is HEDGE_MODE and the trading involves futures, then is required, otherwise this parameter is not required
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only');
        params = this.omit(params, ['reduceOnly', 'reduce_only']);
        const orderType = type.toUpperCase();
        await this.loadMarkets();
        const market = this.market(symbol);
        const orderSide = side.toUpperCase();
        const request = {
            'symbol': market['id'],
            'side': orderSide,
        };
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
        if (marginMode !== undefined) {
            request['marginMode'] = this.encodeMarginMode(marginMode);
        }
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const takeProfit = this.safeValue(params, 'takeProfit');
        const hasStopLoss = (stopLoss !== undefined);
        const hasTakeProfit = (takeProfit !== undefined);
        const algoType = this.safeString(params, 'algoType');
        const trailingTriggerPrice = this.safeString2(params, 'trailingTriggerPrice', 'activatedPrice', this.numberToString(price));
        const trailingAmount = this.safeString2(params, 'trailingAmount', 'callbackValue');
        const trailingPercent = this.safeString2(params, 'trailingPercent', 'callbackRate');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isTrailing = isTrailingAmountOrder || isTrailingPercentOrder;
        const isConditional = isTrailing || triggerPrice !== undefined || hasStopLoss || hasTakeProfit || (this.safeValue(params, 'childOrders') !== undefined);
        const isMarket = orderType === 'MARKET';
        const timeInForce = this.safeStringLower(params, 'timeInForce');
        const postOnly = this.isPostOnly(isMarket, undefined, params);
        const clientOrderIdKey = isConditional ? 'clientAlgoOrderId' : 'clientOrderId';
        request['type'] = orderType; // LIMIT/MARKET/IOC/FOK/POST_ONLY/ASK/BID
        if (!isConditional) {
            if (postOnly) {
                request['type'] = 'POST_ONLY';
            }
            else if (timeInForce === 'fok') {
                request['type'] = 'FOK';
            }
            else if (timeInForce === 'ioc') {
                request['type'] = 'IOC';
            }
        }
        if (reduceOnly) {
            request['reduceOnly'] = reduceOnly;
        }
        if (!isMarket && price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (isMarket && !isConditional) {
            // for market buy it requires the amount of quote currency to spend
            const cost = this.safeStringN(params, ['cost', 'order_amount', 'orderAmount']);
            params = this.omit(params, ['cost', 'order_amount', 'orderAmount']);
            const isPriceProvided = price !== undefined;
            if (market['spot'] && (isPriceProvided || (cost !== undefined))) {
                let quoteAmount = undefined;
                if (cost !== undefined) {
                    quoteAmount = this.costToPrecision(symbol, cost);
                }
                else {
                    const amountString = this.numberToString(amount);
                    const priceString = this.numberToString(price);
                    const costRequest = Precise["default"].stringMul(amountString, priceString);
                    quoteAmount = this.costToPrecision(symbol, costRequest);
                }
                request['amount'] = quoteAmount;
            }
            else {
                request['quantity'] = this.amountToPrecision(symbol, amount);
            }
        }
        else if (algoType !== 'POSITIONAL_TP_SL') {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        if (clientOrderId !== undefined) {
            request[clientOrderIdKey] = clientOrderId;
        }
        if (isTrailing) {
            if (trailingTriggerPrice === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a trailingTriggerPrice parameter for trailing orders');
            }
            request['activatedPrice'] = this.priceToPrecision(symbol, trailingTriggerPrice);
            request['algoType'] = 'TRAILING_STOP';
            if (isTrailingAmountOrder) {
                request['callbackValue'] = trailingAmount;
            }
            else if (isTrailingPercentOrder) {
                const convertedTrailingPercent = Precise["default"].stringDiv(trailingPercent, '100');
                request['callbackRate'] = convertedTrailingPercent;
            }
        }
        else if (triggerPrice !== undefined) {
            if (algoType !== 'TRAILING_STOP') {
                request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
                request['algoType'] = 'STOP';
            }
        }
        else if (hasStopLoss || hasTakeProfit) {
            request['algoType'] = 'BRACKET';
            const outterOrder = {
                'symbol': market['id'],
                'reduceOnly': false,
                'algoType': 'POSITIONAL_TP_SL',
                'childOrders': [],
            };
            const childOrders = outterOrder['childOrders'];
            const closeSide = (orderSide === 'BUY') ? 'SELL' : 'BUY';
            if (hasStopLoss) {
                const stopLossPrice = this.safeString(stopLoss, 'triggerPrice', stopLoss);
                const stopLossOrder = {
                    'side': closeSide,
                    'algoType': 'STOP_LOSS',
                    'triggerPrice': this.priceToPrecision(symbol, stopLossPrice),
                    'type': 'CLOSE_POSITION',
                    'reduceOnly': true,
                };
                childOrders.push(stopLossOrder);
            }
            if (hasTakeProfit) {
                const takeProfitPrice = this.safeString(takeProfit, 'triggerPrice', takeProfit);
                const takeProfitOrder = {
                    'side': closeSide,
                    'algoType': 'TAKE_PROFIT',
                    'triggerPrice': this.priceToPrecision(symbol, takeProfitPrice),
                    'type': 'CLOSE_POSITION',
                    'reduceOnly': true,
                };
                childOrders.push(takeProfitOrder);
            }
            request['childOrders'] = [outterOrder];
        }
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'stopLoss', 'takeProfit', 'trailingPercent', 'trailingAmount', 'trailingTriggerPrice']);
        let response = undefined;
        if (isConditional) {
            response = await this.v3PrivatePostTradeAlgoOrder(this.extend(request, params));
            //
            // {
            //     "success": true,
            //     "data": {
            //       "rows": [
            //         {
            //           "orderId": "1578938",
            //           "clientOrderId": "0",
            //           "algoType": "STOP_LOSS",
            //           "quantity": "0.1"
            //         }
            //       ]
            //     },
            //     "timestamp": "1686149372216"
            // }
            //
        }
        else {
            response = await this.v3PrivatePostTradeOrder(this.extend(request, params));
            //
            //     {
            //         "success": true,
            //         "data": {
            //             "orderId": 60667653330,
            //             "clientOrderId": 0,
            //             "type": "LIMIT",
            //             "price": 60,
            //             "quantity": 0.1,
            //             "amount": null,
            //             "bidAskLevel": null
            //         },
            //         "timestamp": 1751871779855
            //     }
            //
        }
        let data = this.safeDict(response, 'data', {});
        data = this.safeDict(this.safeList(data, 'rows'), 0, data);
        data['timestamp'] = this.safeString(response, 'timestamp');
        return this.parseOrder(data, market);
    }
    encodeMarginMode(mode) {
        const modes = {
            'cross': 'CROSS',
            'isolated': 'ISOLATED',
        };
        return this.safeString(modes, mode, mode);
    }
    /**
     * @method
     * @name woo#editOrder
     * @description edit a trade order
     * @see https://docs.woox.io/#edit-order
     * @see https://docs.woox.io/#edit-order-by-client_order_id
     * @see https://docs.woox.io/#edit-algo-order
     * @see https://docs.woox.io/#edit-algo-order-by-client_order_id
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
        // 'quantity': this.amountToPrecision (symbol, amount),
        // 'price': this.priceToPrecision (symbol, price),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (amount !== undefined) {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        const clientOrderIdUnified = this.safeString2(params, 'clOrdID', 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString(params, 'client_order_id', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        const triggerPrice = this.safeNumberN(params, ['triggerPrice', 'stopPrice', 'takeProfitPrice', 'stopLossPrice']);
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
        }
        const trailingTriggerPrice = this.safeString2(params, 'trailingTriggerPrice', 'activatedPrice', this.numberToString(price));
        const trailingAmount = this.safeString2(params, 'trailingAmount', 'callbackValue');
        const trailingPercent = this.safeString2(params, 'trailingPercent', 'callbackRate');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isTrailing = isTrailingAmountOrder || isTrailingPercentOrder;
        if (isTrailing) {
            if (trailingTriggerPrice !== undefined) {
                request['activatedPrice'] = this.priceToPrecision(symbol, trailingTriggerPrice);
            }
            if (isTrailingAmountOrder) {
                request['callbackValue'] = trailingAmount;
            }
            else if (isTrailingPercentOrder) {
                const convertedTrailingPercent = Precise["default"].stringDiv(trailingPercent, '100');
                request['callbackRate'] = convertedTrailingPercent;
            }
        }
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id', 'stopPrice', 'triggerPrice', 'takeProfitPrice', 'stopLossPrice', 'trailingTriggerPrice', 'trailingAmount', 'trailingPercent']);
        const isConditional = isTrailing || (triggerPrice !== undefined) || (this.safeValue(params, 'childOrders') !== undefined);
        let response = undefined;
        if (isByClientOrder) {
            request['client_order_id'] = clientOrderIdExchangeSpecific;
            if (isConditional) {
                response = await this.v3PrivatePutAlgoOrderClientClientOrderId(this.extend(request, params));
            }
            else {
                response = await this.v3PrivatePutOrderClientClientOrderId(this.extend(request, params));
            }
        }
        else {
            request['oid'] = id;
            if (isConditional) {
                response = await this.v3PrivatePutAlgoOrderOid(this.extend(request, params));
            }
            else {
                response = await this.v3PrivatePutOrderOid(this.extend(request, params));
            }
        }
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "status": "string",
        //             "success": true
        //         },
        //         "message": "string",
        //         "success": true,
        //         "timestamp": 0
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name woo#cancelOrder
     * @see https://developer.woox.io/api-reference/endpoint/trading/cancel_order
     * @see https://developer.woox.io/api-reference/endpoint/trading/cancel_algo_order
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        const isTrigger = this.safeBool2(params, 'trigger', 'stop', false);
        params = this.omit(params, ['trigger', 'stop']);
        if (!isTrigger && (symbol === undefined)) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        const clientOrderIdUnified = this.safeString2(params, 'clOrdID', 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString(params, 'client_order_id', clientOrderIdUnified);
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        let response = undefined;
        if (isTrigger) {
            if (isByClientOrder) {
                request['clientAlgoOrderId'] = clientOrderIdExchangeSpecific;
            }
            else {
                request['algoOrderId'] = id;
            }
            response = await this.v3PrivateDeleteTradeAlgoOrder(this.extend(request, params));
        }
        else {
            request['symbol'] = market['id'];
            if (isByClientOrder) {
                request['clientOrderId'] = clientOrderIdExchangeSpecific;
            }
            else {
                request['orderId'] = id;
            }
            response = await this.v3PrivateDeleteTradeOrder(this.extend(request, params));
        }
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": "CANCEL_SENT"
        //         },
        //         "timestamp": 1751940315838
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        data['timestamp'] = this.safeString(response, 'timestamp');
        if (isByClientOrder) {
            data['clientOrderId'] = clientOrderIdExchangeSpecific;
        }
        else {
            data['orderId'] = id;
        }
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name woo#cancelAllOrders
     * @see https://developer.woox.io/api-reference/endpoint/trading/cancel_all_order
     * @see https://developer.woox.io/api-reference/endpoint/trading/cancel_algo_orders
     * @description cancel all open orders in a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        const request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let response = undefined;
        if (trigger) {
            response = await this.v3PrivateDeleteTradeAlgoOrders(params);
        }
        else {
            response = await this.v3PrivateDeleteTradeOrders(this.extend(request, params));
        }
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": "CANCEL_ALL_SENT"
        //         },
        //         "timestamp": 1751941988134
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return [this.safeOrder({ 'info': data })];
    }
    /**
     * @method
     * @name woo#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://developer.woox.io/api-reference/endpoint/trading/cancel_all_after
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    async cancelAllOrdersAfter(timeout, params = {}) {
        await this.loadMarkets();
        const request = {
            'triggerAfter': (timeout > 0) ? Math.min(timeout, 900000) : 0,
        };
        const response = await this.v3PrivatePostTradeCancelAllAfter(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 123,
        //     "data": {
        //         "expectedTriggerTime": 123
        //     }
        // }
        //
        return response;
    }
    /**
     * @method
     * @name woo#fetchOrder
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_order
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_algo_order
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        const request = {};
        const clientOrderId = this.safeString2(params, 'clOrdID', 'clientOrderId');
        let response = undefined;
        if (trigger) {
            if (clientOrderId !== undefined) {
                request['clientAlgoOrderId'] = id;
            }
            else {
                request['algoOrderId'] = id;
            }
            response = await this.v3PrivateGetTradeAlgoOrder(this.extend(request, params));
            //
            //     {
            //         "success": true,
            //         "data": {
            //             "algoOrderId": 10399260,
            //             "clientAlgoOrderId": 0,
            //             "rootAlgoOrderId": 10399260,
            //             "parentAlgoOrderId": 0,
            //             "symbol": "SPOT_LTC_USDT",
            //             "algoOrderTag": "default",
            //             "algoType": "TAKE_PROFIT",
            //             "side": "BUY",
            //             "quantity": 0.1,
            //             "isTriggered": false,
            //             "triggerPrice": 65,
            //             "triggerStatus": "USELESS",
            //             "type": "LIMIT",
            //             "rootAlgoStatus": "NEW",
            //             "algoStatus": "NEW",
            //             "triggerPriceType": "MARKET_PRICE",
            //             "price": 60,
            //             "triggerTime": "0",
            //             "totalExecutedQuantity": 0,
            //             "visibleQuantity": 0.1,
            //             "averageExecutedPrice": 0,
            //             "totalFee": 0,
            //             "feeAsset": "",
            //             "totalRebate": 0,
            //             "rebateAsset": "",
            //             "reduceOnly": false,
            //             "createdTime": "1752049747.732",
            //             "updatedTime": "1752049747.732",
            //             "positionSide": "BOTH"
            //         },
            //         "timestamp": 1752049767550
            //     }
            //
        }
        else {
            if (clientOrderId !== undefined) {
                request['clientOrderId'] = clientOrderId;
            }
            else {
                request['orderId'] = id;
            }
            response = await this.v3PrivateGetTradeOrder(this.extend(request, params));
            //
            //     {
            //         "success": true,
            //         "data": {
            //             "orderId": 60780315704,
            //             "clientOrderId": 0,
            //             "symbol": "SPOT_LTC_USDT",
            //             "orderTag": "default",
            //             "side": "BUY",
            //             "quantity": 0.1,
            //             "amount": null,
            //             "type": "LIMIT",
            //             "status": "NEW",
            //             "price": 60,
            //             "executed": 0,
            //             "visible": 0.1,
            //             "averageExecutedPrice": 0,
            //             "totalFee": 0,
            //             "feeAsset": "LTC",
            //             "totalRebate": 0,
            //             "rebateAsset": "USDT",
            //             "reduceOnly": false,
            //             "createdTime": "1752049062.496",
            //             "realizedPnl": null,
            //             "positionSide": "BOTH",
            //             "bidAskLevel": null
            //         },
            //         "timestamp": 1752049393466
            //     }
            //
        }
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name woo#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_orders
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_algo_orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchOrders', symbol, since, limit, params, 'page', 500);
        }
        const request = {};
        let market = undefined;
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        params = this.omit(params, ['until']);
        if (until !== undefined) {
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['size'] = Math.min(limit, 500);
        }
        let response = undefined;
        if (trigger) {
            response = await this.v3PrivateGetTradeAlgoOrders(this.extend(request, params));
            //
            //     {
            //         "success": true,
            //         "data": {
            //             "rows": [
            //                 {
            //                     "algoOrderId": 10399260,
            //                     "clientAlgoOrderId": 0,
            //                     "rootAlgoOrderId": 10399260,
            //                     "parentAlgoOrderId": 0,
            //                     "symbol": "SPOT_LTC_USDT",
            //                     "algoOrderTag": "default",
            //                     "algoType": "TAKE_PROFIT",
            //                     "side": "BUY",
            //                     "quantity": 0.1,
            //                     "isTriggered": false,
            //                     "triggerPrice": 65,
            //                     "triggerStatus": "USELESS",
            //                     "type": "LIMIT",
            //                     "rootAlgoStatus": "NEW",
            //                     "algoStatus": "NEW",
            //                     "triggerPriceType": "MARKET_PRICE",
            //                     "price": 60,
            //                     "triggerTime": "0",
            //                     "totalExecutedQuantity": 0,
            //                     "visibleQuantity": 0.1,
            //                     "averageExecutedPrice": 0,
            //                     "totalFee": 0,
            //                     "feeAsset": "",
            //                     "totalRebate": 0,
            //                     "rebateAsset": "",
            //                     "reduceOnly": false,
            //                     "createdTime": "1752049747.730",
            //                     "updatedTime": "1752049747.730",
            //                     "positionSide": "BOTH"
            //                 }
            //             ],
            //             "meta": {
            //                 "total": 7,
            //                 "recordsPerPage": 1,
            //                 "currentPage": 1
            //             }
            //         },
            //         "timestamp": 1752053127448
            //     }
            //
        }
        else {
            response = await this.v3PrivateGetTradeOrders(this.extend(request, params));
            //
            //     {
            //         "success": true,
            //         "data": {
            //             "rows": [
            //                 {
            //                     "orderId": 60780315704,
            //                     "clientOrderId": 0,
            //                     "symbol": "SPOT_LTC_USDT",
            //                     "orderTag": "default",
            //                     "side": "BUY",
            //                     "quantity": 0.1,
            //                     "amount": null,
            //                     "type": "LIMIT",
            //                     "status": "NEW",
            //                     "price": 60,
            //                     "executed": 0,
            //                     "visible": 0.1,
            //                     "averageExecutedPrice": 0,
            //                     "totalFee": 0,
            //                     "feeAsset": "LTC",
            //                     "totalRebate": 0,
            //                     "rebateAsset": "USDT",
            //                     "reduceOnly": false,
            //                     "createdTime": "1752049062.496",
            //                     "realizedPnl": null,
            //                     "positionSide": "BOTH",
            //                     "bidAskLevel": null
            //                 }
            //             ],
            //             "meta": {
            //                 "total": 11,
            //                 "recordsPerPage": 1,
            //                 "currentPage": 1
            //             }
            //         },
            //         "timestamp": 1752053061236
            //     }
            //
        }
        const data = this.safeValue(response, 'data', {});
        const orders = this.safeList(data, 'rows', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name woo#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_orders
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_algo_orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const extendedParams = this.extend(params, { 'status': 'INCOMPLETE' });
        return await this.fetchOrders(symbol, since, limit, extendedParams);
    }
    /**
     * @method
     * @name woo#fetchClosedOrders
     * @description fetches information on multiple orders made by the user
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_orders
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_algo_orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const extendedParams = this.extend(params, { 'status': 'COMPLETED' });
        return await this.fetchOrders(symbol, since, limit, extendedParams);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'ioc': 'IOC',
            'fok': 'FOK',
            'post_only': 'PO',
        };
        return this.safeString(timeInForces, timeInForce, undefined);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //     {
        //         "orderId": 60667653330,
        //         "clientOrderId": 0,
        //         "type": "LIMIT",
        //         "price": 60,
        //         "quantity": 0.1,
        //         "amount": null,
        //         "bidAskLevel": null,
        //         "timestamp": 1751871779855
        //     }
        //
        // createOrder - algo
        //     {
        //         "orderId": "1578938",
        //         "clientOrderId": "0",
        //         "algoType": "STOP_LOSS",
        //         "quantity": "0.1",
        //         "timestamp": "1686149372216"
        //     }
        //
        // fetchOrder
        //     {
        //         "orderId": 60780315704,
        //         "clientOrderId": 0,
        //         "symbol": "SPOT_LTC_USDT",
        //         "orderTag": "default",
        //         "side": "BUY",
        //         "quantity": 0.1,
        //         "amount": null,
        //         "type": "LIMIT",
        //         "status": "NEW",
        //         "price": 60,
        //         "executed": 0,
        //         "visible": 0.1,
        //         "averageExecutedPrice": 0,
        //         "totalFee": 0,
        //         "feeAsset": "LTC",
        //         "totalRebate": 0,
        //         "rebateAsset": "USDT",
        //         "reduceOnly": false,
        //         "createdTime": "1752049062.496",
        //         "realizedPnl": null,
        //         "positionSide": "BOTH",
        //         "bidAskLevel": null
        //     }
        //
        // fetchOrder - algo
        //     {
        //         "algoOrderId": 10399260,
        //         "clientAlgoOrderId": 0,
        //         "rootAlgoOrderId": 10399260,
        //         "parentAlgoOrderId": 0,
        //         "symbol": "SPOT_LTC_USDT",
        //         "algoOrderTag": "default",
        //         "algoType": "TAKE_PROFIT",
        //         "side": "BUY",
        //         "quantity": 0.1,
        //         "isTriggered": false,
        //         "triggerPrice": 65,
        //         "triggerStatus": "USELESS",
        //         "type": "LIMIT",
        //         "rootAlgoStatus": "NEW",
        //         "algoStatus": "NEW",
        //         "triggerPriceType": "MARKET_PRICE",
        //         "price": 60,
        //         "triggerTime": "0",
        //         "totalExecutedQuantity": 0,
        //         "visibleQuantity": 0.1,
        //         "averageExecutedPrice": 0,
        //         "totalFee": 0,
        //         "feeAsset": "",
        //         "totalRebate": 0,
        //         "rebateAsset": "",
        //         "reduceOnly": false,
        //         "createdTime": "1752049747.732",
        //         "updatedTime": "1752049747.732",
        //         "positionSide": "BOTH"
        //     }
        //
        let timestamp = undefined;
        const timestrampString = this.safeString(order, 'createdTime');
        if (timestrampString !== undefined) {
            if (timestrampString.indexOf('.') >= 0) {
                timestamp = this.safeTimestamp(order, 'createdTime'); // algo orders
            }
            else {
                timestamp = this.safeInteger(order, 'createdTime'); // regular orders
            }
        }
        if (timestamp === undefined) {
            timestamp = this.safeInteger(order, 'timestamp');
        }
        const orderId = this.safeString2(order, 'orderId', 'algoOrderId');
        const clientOrderId = this.omitZero(this.safeString2(order, 'clientOrderId', 'clientAlgoOrderId')); // Somehow, this always returns 0 for limit order
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString(order, 'price');
        const amount = this.safeString(order, 'quantity'); // This is base amount
        const cost = this.safeString(order, 'amount'); // This is quote amount
        const orderType = this.safeStringLower(order, 'type');
        const status = this.safeValue2(order, 'status', 'algoStatus');
        const side = this.safeStringLower(order, 'side');
        const filled = this.omitZero(this.safeValue2(order, 'executed', 'totalExecutedQuantity'));
        const average = this.omitZero(this.safeString(order, 'averageExecutedPrice'));
        // const remaining = Precise.stringSub (cost, filled);
        const fee = this.safeNumber(order, 'totalFee');
        const feeCurrency = this.safeString(order, 'feeAsset');
        const triggerPrice = this.safeNumber(order, 'triggerPrice');
        const lastUpdateTimestampString = this.safeString(order, 'updatedTime');
        let lastUpdateTimestamp = undefined;
        if (lastUpdateTimestampString !== undefined) {
            if (lastUpdateTimestampString.indexOf('.') >= 0) {
                lastUpdateTimestamp = this.safeTimestamp(order, 'updatedTime'); // algo orders
            }
            else {
                lastUpdateTimestamp = this.safeInteger(order, 'updatedTime'); // regular orders
            }
        }
        return this.safeOrder({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus(status),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce(orderType),
            'postOnly': undefined,
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': cost,
            'trades': undefined,
            'fee': {
                'cost': fee,
                'currency': feeCurrency,
            },
            'info': order,
        }, market);
    }
    parseOrderStatus(status) {
        if (status !== undefined) {
            const statuses = {
                'NEW': 'open',
                'FILLED': 'closed',
                'CANCEL_SENT': 'canceled',
                'CANCEL_ALL_SENT': 'canceled',
                'CANCELLED': 'canceled',
                'PARTIAL_FILLED': 'open',
                'REJECTED': 'rejected',
                'INCOMPLETE': 'open',
                'COMPLETED': 'closed',
            };
            return this.safeString(statuses, status, status);
        }
        return status;
    }
    /**
     * @method
     * @name woo#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer.woox.io/api-reference/endpoint/public_data/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['maxLevel'] = limit;
        }
        const response = await this.v3PublicGetOrderbook(this.extend(request, params));
        //
        // }
        //     {
        //         "success": true,
        //         "timestamp": 1751620923344,
        //         "data": {
        //             "asks": [
        //                 {
        //                     "price": "108924.86",
        //                     "quantity": "0.032126"
        //                 }
        //             ],
        //             "bids": [
        //                 {
        //                     "price": "108924.85",
        //                     "quantity": "1.714147"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const timestamp = this.safeInteger(response, 'timestamp');
        return this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }
    /**
     * @method
     * @name woo#fetchOHLCV
     * @see https://developer.woox.io/api-reference/endpoint/public_data/klineHistory
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'type': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        if (until !== undefined) {
            request['before'] = until;
        }
        const response = await this.v3PublicGetKlineHistory(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "SPOT_BTC_USDT",
        //                     "open": "108994.16",
        //                     "close": "108994.16",
        //                     "high": "108994.16",
        //                     "low": "108994.16",
        //                     "volume": "0",
        //                     "amount": "0",
        //                     "type": "1m",
        //                     "startTimestamp": 1751622120000,
        //                     "endTimestamp": 1751622180000
        //                 }
        //             ]
        //         },
        //         "timestamp": 1751622205410
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseOHLCVs(rows, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        return [
            this.safeInteger(ohlcv, 'startTimestamp'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    /**
     * @method
     * @name woo#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.woox.io/#get-trades
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'oid': id,
        };
        const response = await this.v1PrivateGetOrderOidTrades(this.extend(request, params));
        // {
        //     "success": true,
        //     "rows": [
        //       {
        //         "id": "99111647",
        //         "symbol": "SPOT_WOO_USDT",
        //         "fee": "0.0024",
        //         "side": "BUY",
        //         "executed_timestamp": "1641482113.084",
        //         "order_id": "87541111",
        //         "order_tag": "default",
        //         "executed_price": "1",
        //         "executed_quantity": "12",
        //         "fee_asset": "WOO",
        //         "is_maker": "1"
        //       }
        //     ]
        // }
        const trades = this.safeList(response, 'rows', []);
        return this.parseTrades(trades, market, since, limit, params);
    }
    /**
     * @method
     * @name woo#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://developer.woox.io/api-reference/endpoint/trading/get_transactions
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch trades with pagination
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchMyTrades', symbol, since, limit, params, 'page', 500);
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        params = this.omit(params, ['until']);
        if (until !== undefined) {
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v3PrivateGetTradeTransactionHistory(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "id": 1734947821,
        //                     "symbol": "SPOT_LTC_USDT",
        //                     "orderId": 60780383217,
        //                     "executedPrice": 87.86,
        //                     "executedQuantity": 0.1,
        //                     "fee": 0.0001,
        //                     "realizedPnl": null,
        //                     "feeAsset": "LTC",
        //                     "orderTag": "default",
        //                     "side": "BUY",
        //                     "executedTimestamp": "1752055173.630",
        //                     "isMaker": 0
        //                 }
        //             ],
        //             "meta": {
        //                 "total": 1,
        //                 "recordsPerPage": 100,
        //                 "currentPage": 1
        //             }
        //         },
        //         "timestamp": 1752055545121
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const trades = this.safeList(data, 'rows', []);
        return this.parseTrades(trades, market, since, limit, params);
    }
    /**
     * @method
     * @name woo#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://developer.woox.io/api-reference/endpoint/account/get_account_info
     * @see https://developer.woox.io/api-reference/endpoint/account/sub_accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        const mainAccountPromise = this.v3PrivateGetAccountInfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "applicationId": "251bf5c4-f3c8-4544-bb8b-80001007c3c0",
        //             "account": "carlos_jose_lima@yahoo.com",
        //             "alias": "carlos_jose_lima@yahoo.com",
        //             "otpauth": true,
        //             "accountMode": "FUTURES",
        //             "positionMode": "ONE_WAY",
        //             "leverage": 0,
        //             "marginRatio": "10",
        //             "openMarginRatio": "10",
        //             "initialMarginRatio": "10",
        //             "maintenanceMarginRatio": "0.03",
        //             "totalCollateral": "165.55629469",
        //             "freeCollateral": "165.55629469",
        //             "totalAccountValue": "167.32418611",
        //             "totalTradingValue": "167.32418611",
        //             "totalVaultValue": "0",
        //             "totalStakingValue": "0",
        //             "totalLaunchpadValue": "0",
        //             "totalEarnValue": "0",
        //             "referrerID": null,
        //             "accountType": "Main"
        //         },
        //         "timestamp": 1752062807915
        //     }
        //
        const subAccountPromise = this.v3PrivateGetAccountSubAccountsAll(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "applicationId": "6b43de5c-0955-4887-9862-d84e4689f9fe",
        //                     "name": "sub_account_2",
        //                     "createdTime": "1606897264.994"
        //                 },
        //             ]
        //         },
        //         "timestamp": 1721295317627
        //     }
        //
        const [mainAccountResponse, subAccountResponse] = await Promise.all([mainAccountPromise, subAccountPromise]);
        const mainData = this.safeDict(mainAccountResponse, 'data', {});
        const mainRows = [mainData];
        const subData = this.safeDict(subAccountResponse, 'data', {});
        const subRows = this.safeList(subData, 'rows', []);
        const rows = this.arrayConcat(mainRows, subRows);
        return this.parseAccounts(rows, params);
    }
    parseAccount(account) {
        //
        //     {
        //         "applicationId": "251bf5c4-f3c8-4544-bb8b-80001007c3c0",
        //         "account": "carlos_jose_lima@yahoo.com",
        //         "alias": "carlos_jose_lima@yahoo.com",
        //         "otpauth": true,
        //         "accountMode": "FUTURES",
        //         "positionMode": "ONE_WAY",
        //         "leverage": 0,
        //         "marginRatio": "10",
        //         "openMarginRatio": "10",
        //         "initialMarginRatio": "10",
        //         "maintenanceMarginRatio": "0.03",
        //         "totalCollateral": "165.55629469",
        //         "freeCollateral": "165.55629469",
        //         "totalAccountValue": "167.32418611",
        //         "totalTradingValue": "167.32418611",
        //         "totalVaultValue": "0",
        //         "totalStakingValue": "0",
        //         "totalLaunchpadValue": "0",
        //         "totalEarnValue": "0",
        //         "referrerID": null,
        //         "accountType": "Main"
        //     }
        //
        //     {
        //         "applicationId": "6b43de5c-0955-4887-9862-d84e4689f9fe",
        //         "name": "sub_account_2",
        //         "createdTime": "1606897264.994"
        //     }
        //
        return {
            'info': account,
            'id': this.safeString(account, 'applicationId'),
            'name': this.safeStringN(account, ['name', 'account', 'alias']),
            'code': undefined,
            'type': this.safeStringLower(account, 'accountType', 'subaccount'),
        };
    }
    /**
     * @method
     * @name woo#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.woox.io/#get-current-holding-get-balance-new
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v3PrivateGetAssetBalances(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "holding": [
        //                 {
        //                     "token": "0_token",
        //                     "holding": 1,
        //                     "frozen": 0,
        //                     "staked": 0,
        //                     "unbonding": 0,
        //                     "vault": 0,
        //                     "interest": 0,
        //                     "pendingShortQty": 0,
        //                     "pendingLongQty": 0,
        //                     "availableBalance": 0,
        //                     "updatedTime": 312321.121
        //                 }
        //             ]
        //         },
        //         "timestamp": 1673323746259
        //     }
        //
        const data = this.safeDict(response, 'data');
        return this.parseBalance(data);
    }
    parseBalance(response) {
        const result = {
            'info': response,
        };
        const balances = this.safeList(response, 'holding', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode(this.safeString(balance, 'token'));
            const account = this.account();
            account['total'] = this.safeString(balance, 'holding');
            account['free'] = this.safeString(balance, 'availableBalance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name woo#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://developer.woox.io/api-reference/endpoint/assets/get_wallet_deposit
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        // this method is TODO because of networks unification
        await this.loadMarkets();
        const currency = this.currency(code);
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        const request = {
            'token': currency['id'],
            'network': this.networkCodeToId(networkCode),
        };
        const response = await this.v3PrivateGetAssetWalletDeposit(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "address": "0x31d64B3230f8baDD91dE1710A65DF536aF8f7cDa",
        //             "extra": ""
        //         },
        //         "timestamp": 1721300689532
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    getDedicatedNetworkId(currency, params) {
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        networkCode = this.networkIdToCode(networkCode, currency['code']);
        const networkEntry = this.safeDict(currency['networks'], networkCode);
        if (networkEntry === undefined) {
            const supportedNetworks = Object.keys(currency['networks']);
            throw new errors.BadRequest(this.id + '  can not determine a network code, please provide unified "network" param, one from the following: ' + this.json(supportedNetworks));
        }
        const currentyNetworkId = this.safeString(networkEntry, 'currencyNetworkId');
        return [currentyNetworkId, params];
    }
    parseDepositAddress(depositEntry, currency = undefined) {
        const address = this.safeString(depositEntry, 'address');
        this.checkAddress(address);
        return {
            'info': depositEntry,
            'currency': this.safeString(currency, 'code'),
            'network': undefined,
            'address': address,
            'tag': this.safeString(depositEntry, 'extra'),
        };
    }
    async getAssetHistoryRows(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['token'] = currency['id'];
        }
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['network'] = this.networkCodeToId(networkCode);
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['size'] = Math.min(limit, 1000);
        }
        const transactionType = this.safeString(params, 'type');
        params = this.omit(params, 'type');
        if (transactionType !== undefined) {
            request['type'] = transactionType;
        }
        const response = await this.v3PrivateGetAssetWalletHistory(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "createdTime": "1734964440.523",
        //                     "updatedTime": "1734964614.081",
        //                     "id": "24122314340000585",
        //                     "externalId": "241223143600621",
        //                     "applicationId": "251bf5c4-f3c8-4544-bb8b-80001007c3c0",
        //                     "token": "ARB_USDCNATIVE",
        //                     "targetAddress": "0x4d6802d2736daa85e6242ef0dc0f00aa0e68f635",
        //                     "sourceAddress": "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        //                     "extra": "",
        //                     "type": "BALANCE",
        //                     "tokenSide": "WITHDRAW",
        //                     "amount": "10.00000000",
        //                     "txId": "0x891ade0a47fd55466bb9d06702bea4edcb75ed9367d9afbc47b93a84f496d2e6",
        //                     "feeToken": "USDC",
        //                     "feeAmount": "2",
        //                     "status": "COMPLETED",
        //                     "confirmingThreshold": null,
        //                     "confirmedNumber": null
        //                 }
        //             ],
        //             "meta": {
        //                 "total": 1,
        //                 "records_per_page": 25,
        //                 "current_page": 1
        //             }
        //         },
        //         "timestamp": 1752485344719
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return [currency, this.safeList(data, 'rows', [])];
    }
    /**
     * @method
     * @name woo#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
     * @see https://developer.woox.io/api-reference/endpoint/assets/get_wallet_history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        const currencyRows = await this.getAssetHistoryRows(code, since, limit, params);
        const currency = this.safeValue(currencyRows, 0);
        const rows = this.safeList(currencyRows, 1);
        return this.parseLedger(rows, currency, since, limit, params);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         "createdTime": "1734964440.523",
        //         "updatedTime": "1734964614.081",
        //         "id": "24122314340000585",
        //         "externalId": "241223143600621",
        //         "applicationId": "251bf5c4-f3c8-4544-bb8b-80001007c3c0",
        //         "token": "ARB_USDCNATIVE",
        //         "targetAddress": "0x4d6802d2736daa85e6242ef0dc0f00aa0e68f635",
        //         "sourceAddress": "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        //         "extra": "",
        //         "type": "BALANCE",
        //         "tokenSide": "WITHDRAW",
        //         "amount": "10.00000000",
        //         "txId": "0x891ade0a47fd55466bb9d06702bea4edcb75ed9367d9afbc47b93a84f496d2e6",
        //         "feeToken": "USDC",
        //         "feeAmount": "2",
        //         "status": "COMPLETED",
        //         "confirmingThreshold": null,
        //         "confirmedNumber": null
        //     }
        //
        const networkizedCode = this.safeString(item, 'token');
        const code = this.safeCurrencyCode(networkizedCode, currency);
        currency = this.safeCurrency(code, currency);
        const amount = this.safeNumber(item, 'amount');
        const side = this.safeString(item, 'tokenSide');
        const direction = (side === 'DEPOSIT') ? 'in' : 'out';
        const timestamp = this.safeTimestamp(item, 'createdTime');
        const fee = this.parseTokenAndFeeTemp(item, ['feeToken'], ['feeAmount']);
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString(item, 'id'),
            'currency': code,
            'account': this.safeString(item, 'account'),
            'referenceAccount': undefined,
            'referenceId': this.safeString(item, 'txId'),
            'status': this.parseTransactionStatus(this.safeString(item, 'status')),
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'type': this.parseLedgerEntryType(this.safeString(item, 'type')),
            'fee': fee,
        }, currency);
    }
    parseLedgerEntryType(type) {
        const types = {
            'BALANCE': 'transaction',
            'COLLATERAL': 'transfer', // Funds moved between portfolios
        };
        return this.safeString(types, type, type);
    }
    getCurrencyFromChaincode(networkizedCode, currency) {
        if (currency !== undefined) {
            return currency;
        }
        else {
            const parts = networkizedCode.split('_');
            const partsLength = parts.length;
            const firstPart = this.safeString(parts, 0);
            let currencyId = this.safeString(parts, 1, firstPart);
            if (partsLength > 2) {
                currencyId += '_' + this.safeString(parts, 2);
            }
            currency = this.safeCurrency(currencyId);
        }
        return currency;
    }
    /**
     * @method
     * @name woo#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://developer.woox.io/api-reference/endpoint/assets/get_wallet_history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'tokenSide': 'DEPOSIT',
        };
        return await this.fetchDepositsWithdrawals(code, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name woo#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://developer.woox.io/api-reference/endpoint/assets/get_wallet_history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'tokenSide': 'WITHDRAW',
        };
        return await this.fetchDepositsWithdrawals(code, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name woo#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://developer.woox.io/api-reference/endpoint/assets/get_wallet_history
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'BALANCE',
        };
        const currencyRows = await this.getAssetHistoryRows(code, since, limit, this.extend(request, params));
        const currency = this.safeValue(currencyRows, 0);
        const rows = this.safeList(currencyRows, 1);
        return this.parseTransactions(rows, currency, since, limit, params);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //     {
        //         "createdTime": "1734964440.523",
        //         "updatedTime": "1734964614.081",
        //         "id": "24122314340000585",
        //         "externalId": "241223143600621",
        //         "applicationId": "251bf5c4-f3c8-4544-bb8b-80001007c3c0",
        //         "token": "ARB_USDCNATIVE",
        //         "targetAddress": "0x4d6802d2736daa85e6242ef0dc0f00aa0e68f635",
        //         "sourceAddress": "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        //         "extra": "",
        //         "type": "BALANCE",
        //         "tokenSide": "WITHDRAW",
        //         "amount": "10.00000000",
        //         "txId": "0x891ade0a47fd55466bb9d06702bea4edcb75ed9367d9afbc47b93a84f496d2e6",
        //         "feeToken": "USDC",
        //         "feeAmount": "2",
        //         "status": "COMPLETED",
        //         "confirmingThreshold": null,
        //         "confirmedNumber": null
        //     }
        //
        const networkizedCode = this.safeString(transaction, 'token');
        const currencyDefined = this.getCurrencyFromChaincode(networkizedCode, currency);
        const code = currencyDefined['code'];
        let movementDirection = this.safeStringLowerN(transaction, ['token_side', 'tokenSide', 'type']);
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        const fee = this.parseTokenAndFeeTemp(transaction, ['fee_token', 'feeToken'], ['fee_amount', 'feeAmount']);
        const addressTo = this.safeStringN(transaction, ['target_address', 'targetAddress', 'addressTo']);
        const addressFrom = this.safeString2(transaction, 'source_address', 'sourceAddress');
        const timestamp = this.safeTimestampN(transaction, ['created_time', 'createdTime'], this.safeInteger(transaction, 'timestamp'));
        return {
            'info': transaction,
            'id': this.safeStringN(transaction, ['id', 'withdraw_id', 'withdrawId']),
            'txid': this.safeString2(transaction, 'tx_id', 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': this.safeString2(transaction, 'extra', 'tag'),
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': movementDirection,
            'amount': this.safeNumber(transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus(this.safeString(transaction, 'status')),
            'updated': this.safeTimestamp2(transaction, 'updated_time', 'updatedTime'),
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
            'network': this.networkIdToCode(this.safeString(transaction, 'network')),
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'NEW': 'pending',
            'CONFIRMING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETED': 'ok',
            'CANCELED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name woo#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.woox.io/#get-transfer-history
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'token': currency['id'],
            'amount': this.parseToNumeric(amount),
            'from': {
                'applicationId': fromAccount,
            },
            'to': {
                'applicationId': toAccount,
            },
        };
        const response = await this.v3PrivatePostAssetTransfer(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "id": 200
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        data['timestamp'] = this.safeInteger(response, 'timestamp');
        data['token'] = currency['id'];
        data['status'] = 'ok';
        const transfer = this.parseTransfer(data, currency);
        const transferOptions = this.safeDict(this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeBool(transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['amount'] = amount;
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
        }
        return transfer;
    }
    /**
     * @method
     * @name woo#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://developer.woox.io/api-reference/endpoint/assets/get_transfer_history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        params = this.omit(params, ['until']);
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.v3PrivateGetAssetTransferHistory(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "id": 225,
        //                     "token": "USDT",
        //                     "amount": "1000000",
        //                     "status": "COMPLETED",
        //                     "from": {
        //                         "applicationId": "046b5c5c-5b44-4d27-9593-ddc32c0a08ae",
        //                         "accountName": "Main"
        //                     },
        //                     "to": {
        //                         "applicationId": "082ae5ae-e26a-4fb1-be5b-03e5b4867663",
        //                         "accountName": "sub001"
        //                     },
        //                     "createdTime": "1642660941.534",
        //                     "updatedTime": "1642660941.950"
        //                 }
        //             ],
        //             "meta": {
        //                 "total": 46,
        //                 "recordsPerPage": 1,
        //                 "currentPage": 1
        //             }
        //         },
        //         "timestamp": 1721295317627
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseTransfers(rows, currency, since, limit, params);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        //    fetchTransfers
        //     {
        //         "id": 46704,
        //         "token": "USDT",
        //         "amount": 30000.00000000,
        //         "status": "COMPLETED",
        //         "from_application_id": "0f1bd3cd-dba2-4563-b8bb-0adb1bfb83a3",
        //         "to_application_id": "c01e6940-a735-4022-9b6c-9d3971cdfdfa",
        //         "from_user": "LeverageLow",
        //         "to_user": "dev",
        //         "created_time": "1709022325.427",
        //         "updated_time": "1709022325.542"
        //     }
        //     {
        //         "id": 225,
        //         "token": "USDT",
        //         "amount": "1000000",
        //         "status": "COMPLETED",
        //         "from": {
        //             "applicationId": "046b5c5c-5b44-4d27-9593-ddc32c0a08ae",
        //             "accountName": "Main"
        //         },
        //         "to": {
        //             "applicationId": "082ae5ae-e26a-4fb1-be5b-03e5b4867663",
        //             "accountName": "sub001"
        //         },
        //         "createdTime": "1642660941.534",
        //         "updatedTime": "1642660941.950"
        //     }
        //
        //    transfer
        //        {
        //            "success": true,
        //            "id": 200
        //        }
        //
        const code = this.safeCurrencyCode(this.safeString(transfer, 'token'), currency);
        const timestamp = this.safeTimestamp2(transfer, 'createdTime', 'timestamp');
        const success = this.safeBool(transfer, 'success');
        let status = undefined;
        if (success !== undefined) {
            status = success ? 'ok' : 'failed';
        }
        const fromAccount = this.safeDict(transfer, 'from', {});
        const toAccount = this.safeDict(transfer, 'to', {});
        return {
            'id': this.safeString(transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': this.safeString(fromAccount, 'applicationId'),
            'toAccount': this.safeString(toAccount, 'applicationId'),
            'status': this.parseTransferStatus(this.safeString(transfer, 'status', status)),
            'info': transfer,
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'NEW': 'pending',
            'CONFIRMING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETED': 'ok',
            'CANCELED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name woo#withdraw
     * @description make a withdrawal
     * @see https://docs.woox.io/#token-withdraw-v3
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        this.checkAddress(address);
        const currency = this.currency(code);
        const request = {
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['extra'] = tag;
        }
        const network = this.safeString(params, 'network');
        if (network === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' withdraw() requires a network parameter for ' + code);
        }
        params = this.omit(params, 'network');
        request['token'] = currency['id'];
        request['network'] = this.networkCodeToId(network);
        const response = await this.v3PrivatePostAssetWalletWithdraw(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "withdraw_id": "20200119145703654"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const transactionData = this.extend(data, {
            'id': this.safeString(data, 'withdrawId'),
            'timestamp': this.safeInteger(response, 'timestamp'),
            'currency': code,
            'amount': amount,
            'addressTo': address,
            'tag': tag,
            'network': network,
            'type': 'withdrawal',
            'status': 'pending',
        });
        return this.parseTransaction(transactionData, currency);
    }
    /**
     * @method
     * @name woo#repayMargin
     * @description repay borrowed margin and interest
     * @see https://docs.woox.io/#repay-interest
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {string} symbol not used by woo.repayMargin ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
     */
    async repayMargin(code, amount, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        const currency = this.currency(code);
        const request = {
            'token': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        const response = await this.v1PrivatePostInterestRepay(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //     }
        //
        const transaction = this.parseMarginLoan(response, currency);
        return this.extend(transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }
    parseMarginLoan(info, currency = undefined) {
        //
        //     {
        //         "success": true,
        //     }
        //
        return {
            'id': undefined,
            'currency': this.safeCurrencyCode(undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
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
            url += access + '/' + pathWithParams;
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        else if (access === 'pub') {
            url += pathWithParams;
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        else {
            this.checkRequiredCredentials();
            if (method === 'POST' && (path === 'trade/algoOrder' || path === 'trade/order')) {
                const isSandboxMode = this.safeBool(this.options, 'sandboxMode', false);
                if (!isSandboxMode) {
                    const applicationId = 'bc830de7-50f3-460b-9ee0-f430f83f9dad';
                    const brokerId = this.safeString(this.options, 'brokerId', applicationId);
                    const isTrigger = path.indexOf('algo') > -1;
                    if (isTrigger) {
                        params['brokerId'] = brokerId;
                    }
                    else {
                        params['broker_id'] = brokerId;
                    }
                }
                params = this.keysort(params);
            }
            let auth = '';
            const ts = this.nonce().toString();
            url += pathWithParams;
            headers = {
                'x-api-key': this.apiKey,
                'x-api-timestamp': ts,
            };
            if (version === 'v3') {
                auth = ts + method + '/' + version + '/' + pathWithParams;
                if (method === 'POST' || method === 'PUT') {
                    body = this.json(params);
                    auth += body;
                    headers['content-type'] = 'application/json';
                }
                else {
                    if (Object.keys(params).length) {
                        const query = this.urlencode(params);
                        url += '?' + query;
                        auth += '?' + query;
                    }
                }
            }
            else {
                auth = this.urlencode(params);
                if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                    body = auth;
                }
                else {
                    if (Object.keys(params).length) {
                        url += '?' + auth;
                    }
                }
                auth += '|' + ts;
                headers['content-type'] = 'application/x-www-form-urlencoded';
            }
            headers['x-api-signature'] = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     400 Bad Request {"success":false,"code":-1012,"message":"Amount is required for buy market orders when margin disabled."}
        //                     {"code":"-1011","message":"The system is under maintenance.","success":false}
        //
        const success = this.safeBool(response, 'success');
        const errorCode = this.safeString(response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json(response);
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
        }
        return undefined;
    }
    parseIncome(income, market = undefined) {
        //
        //     {
        //         "id": 1286360,
        //         "symbol": "PERP_BTC_USDT",
        //         "fundingRate": -0.00001445,
        //         "markPrice": "26930.60000000",
        //         "fundingFee": "9.56021744",
        //         "fundingIntervalHours": 8,
        //         "paymentType": "Pay",
        //         "status": "COMPLETED",
        //         "createdTime": 1696060873259,
        //         "updatedTime": 1696060873286
        //     }
        //
        const marketId = this.safeString(income, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        let amount = this.safeString(income, 'fundingFee');
        const code = this.safeCurrencyCode('USD');
        const id = this.safeString(income, 'id');
        const timestamp = this.safeInteger(income, 'updatedTime');
        const rate = this.safeNumber(income, 'fundingRate');
        const paymentType = this.safeString(income, 'paymentType');
        amount = (paymentType === 'Pay') ? Precise["default"].stringNeg(amount) : amount;
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': id,
            'amount': this.parseNumber(amount),
            'rate': rate,
        };
    }
    /**
     * @method
     * @name woo#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://developer.woox.io/api-reference/endpoint/futures/get_fundingFee_history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchFundingHistory', symbol, since, limit, params, 'page', 500);
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        params = this.omit(params, ['until']);
        if (until !== undefined) {
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['size'] = Math.min(limit, 500);
        }
        const response = await this.v3PrivateGetFuturesFundingFeeHistory(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "meta": {
        //                 "total": 670,
        //                 "recordsPerPage": 25,
        //                 "currentPage": 1
        //             },
        //             "rows": [
        //                 {
        //                     "id": 1286360,
        //                     "symbol": "PERP_BTC_USDT",
        //                     "fundingRate": -0.00001445,
        //                     "markPrice": "26930.60000000",
        //                     "fundingFee": "9.56021744",
        //                     "fundingIntervalHours": 8,
        //                     "paymentType": "Pay",
        //                     "status": "COMPLETED",
        //                     "createdTime": 1696060873259,
        //                     "updatedTime": 1696060873286
        //                 }
        //             ]
        //         },
        //         "timestamp": 1721351502594
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseIncomes(rows, market, since, limit);
    }
    parseFundingRate(fundingRate, market = undefined) {
        //
        //     {
        //         "symbol": "PERP_BTC_USDT",
        //         "estFundingRate": "-0.00000441",
        //         "estFundingRateTimestamp": 1751623979022,
        //         "lastFundingRate": "-0.00004953",
        //         "lastFundingRateTimestamp": 1751616000000,
        //         "nextFundingTime": 1751644800000,
        //         "lastFundingIntervalHours": 8,
        //         "estFundingIntervalHours": 8
        //     }
        //
        const symbol = this.safeString(fundingRate, 'symbol');
        market = this.market(symbol);
        const nextFundingTimestamp = this.safeInteger(fundingRate, 'nextFundingTime');
        const estFundingRateTimestamp = this.safeInteger(fundingRate, 'estFundingRateTimestamp');
        const lastFundingRateTimestamp = this.safeInteger(fundingRate, 'lastFundingRateTimestamp');
        const intervalString = this.safeString(fundingRate, 'estFundingIntervalHours');
        return {
            'info': fundingRate,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': estFundingRateTimestamp,
            'datetime': this.iso8601(estFundingRateTimestamp),
            'fundingRate': this.safeNumber(fundingRate, 'estFundingRate'),
            'fundingTimestamp': nextFundingTimestamp,
            'fundingDatetime': this.iso8601(nextFundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': this.safeNumber(fundingRate, 'lastFundingRate'),
            'previousFundingTimestamp': lastFundingRateTimestamp,
            'previousFundingDatetime': this.iso8601(lastFundingRateTimestamp),
            'interval': intervalString + 'h',
        };
    }
    /**
     * @method
     * @name woo#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://developer.woox.io/api-reference/endpoint/public_data/fundingRate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingInterval(symbol, params = {}) {
        return await this.fetchFundingRate(symbol, params);
    }
    /**
     * @method
     * @name woo#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://developer.woox.io/api-reference/endpoint/public_data/fundingRate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v3PublicGetFundingRate(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "PERP_BTC_USDT",
        //                     "estFundingRate": "-0.00000441",
        //                     "estFundingRateTimestamp": 1751623979022,
        //                     "lastFundingRate": "-0.00004953",
        //                     "lastFundingRateTimestamp": 1751616000000,
        //                     "nextFundingTime": 1751644800000,
        //                     "lastFundingIntervalHours": 8,
        //                     "estFundingIntervalHours": 8
        //                 }
        //             ]
        //         },
        //         "timestamp": 1751624037798
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        const first = this.safeDict(rows, 0, {});
        return this.parseFundingRate(first, market);
    }
    /**
     * @method
     * @name woo#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://developer.woox.io/api-reference/endpoint/public_data/fundingRate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.v3PublicGetFundingRate(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "PERP_BTC_USDT",
        //                     "estFundingRate": "-0.00000441",
        //                     "estFundingRateTimestamp": 1751623979022,
        //                     "lastFundingRate": "-0.00004953",
        //                     "lastFundingRateTimestamp": 1751616000000,
        //                     "nextFundingTime": 1751644800000,
        //                     "lastFundingIntervalHours": 8,
        //                     "estFundingIntervalHours": 8
        //                 }
        //             ]
        //         },
        //         "timestamp": 1751624037798
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseFundingRates(rows, symbols);
    }
    /**
     * @method
     * @name woo#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://developer.woox.io/api-reference/endpoint/public_data/fundingRateHistory
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchFundingRateHistory', symbol, since, limit, params, 'page', 25);
        }
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        const market = this.market(symbol);
        symbol = market['symbol'];
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.v3PublicGetFundingRateHistory(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "symbol": "PERP_BTC_USDT",
        //                     "fundingRate": "-0.00004953",
        //                     "fundingRateTimestamp": 1751616000000,
        //                     "nextFundingTime": 1751644800000,
        //                     "markPrice": "108708"
        //                 }
        //             ],
        //             "meta": {
        //                 "total": 11690,
        //                 "recordsPerPage": 25,
        //                 "currentPage": 1
        //             }
        //         },
        //         "timestamp": 1751632390031
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        const rates = [];
        for (let i = 0; i < rows.length; i++) {
            const entry = rows[i];
            const marketId = this.safeString(entry, 'symbol');
            const timestamp = this.safeInteger(entry, 'fundingRateTimestamp');
            rates.push({
                'info': entry,
                'symbol': this.safeSymbol(marketId),
                'fundingRate': this.safeNumber(entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    /**
     * @method
     * @name woo#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://developer.woox.io/api-reference/endpoint/futures/position_mode
     * @param {bool} hedged set to true to use HEDGE_MODE, false for ONE_WAY
     * @param {string} symbol not used by woo setPositionMode
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        let hedgeMode = undefined;
        if (hedged) {
            hedgeMode = 'HEDGE_MODE';
        }
        else {
            hedgeMode = 'ONE_WAY';
        }
        const request = {
            'positionMode': hedgeMode,
        };
        const response = await this.v3PrivatePutFuturesPositionMode(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "timestamp": 1752550492845
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name woo#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://developer.woox.io/api-reference/endpoint/account/get_account_info
     * @see https://developer.woox.io/api-reference/endpoint/futures/get_leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] *for swap markets only* 'cross' or 'isolated'
     * @param {string} [params.positionMode] *for swap markets only* 'ONE_WAY' or 'HEDGE_MODE'
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let response = undefined;
        if (market['spot']) {
            response = await this.v3PrivateGetAccountInfo(params);
            //
            //     {
            //         "success": true,
            //         "data": {
            //             "applicationId": "dsa",
            //             "account": "dsa",
            //             "alias": "haha",
            //             "otpauth": true,
            //             "accountMode": "FUTURES",
            //             "positionMode": "ONE_WAY",
            //             "leverage": 0,
            //             "marginRatio": "10",
            //             "openMarginRatio": "10",
            //             "initialMarginRatio": "10",
            //             "maintenanceMarginRatio": "0.03",
            //             "totalCollateral": "165.6115334",
            //             "freeCollateral": "165.6115334",
            //             "totalAccountValue": "167.52723093",
            //             "totalTradingValue": "167.52723093",
            //             "totalVaultValue": "0",
            //             "totalStakingValue": "0",
            //             "totalLaunchpadValue": "0",
            //             "totalEarnValue": "0",
            //             "referrerID": null,
            //             "accountType": "Main"
            //         },
            //         "timestamp": 1752645129054
            //     }
            //
        }
        else if (market['swap']) {
            const request = {
                'symbol': market['id'],
            };
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchLeverage', params, 'cross');
            request['marginMode'] = this.encodeMarginMode(marginMode);
            response = await this.v3PrivateGetFuturesLeverage(this.extend(request, params));
            //
            // HEDGE_MODE
            //     {
            //         "success": true,
            //         "data":
            //             {
            //                 "symbol": "PERP_ETH_USDT",
            //                 "marginMode": "CROSS",
            //                 "positionMode": "HEDGE_MODE",
            //                 "details":  [
            //                     {
            //                         "positionSide": "LONG",
            //                         "leverage": 10
            //                     },
            //                     {
            //                         "positionSide": "SHORT",
            //                         "leverage": 10
            //                     }
            //                 ]
            //             },
            //         "timestamp": 1720886470482
            //     }
            //
            // ONE_WAY
            //     {
            //         "success": true,
            //         "data": {
            //             "symbol": "PERP_ETH_USDT",
            //             "marginMode": "ISOLATED",
            //             "positionMode": "ONE_WAY",
            //             "details": [
            //                 {
            //                     "positionSide": "BOTH",
            //                     "leverage": 10
            //                 }
            //             ]
            //         },
            //         "timestamp": 1720886810317
            //     }
            //
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLeverage() is not supported for ' + market['type'] + ' markets');
        }
        const data = this.safeDict(response, 'data', {});
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        const marketId = this.safeString(leverage, 'symbol');
        market = this.safeMarket(marketId, market);
        const marginMode = this.safeStringLower(leverage, 'marginMode');
        let spotLeverage = this.safeInteger(leverage, 'leverage');
        if (spotLeverage === 0) {
            spotLeverage = null;
        }
        let longLeverage = spotLeverage;
        let shortLeverage = spotLeverage;
        const details = this.safeList(leverage, 'details', []);
        for (let i = 0; i < details.length; i++) {
            const position = this.safeDict(details, i, {});
            const positionLeverage = this.safeInteger(position, 'leverage');
            const side = this.safeString(position, 'positionSide');
            if (side === 'BOTH') {
                longLeverage = positionLeverage;
                shortLeverage = positionLeverage;
            }
            else if (side === 'LONG') {
                longLeverage = positionLeverage;
            }
            else if (side === 'SHORT') {
                shortLeverage = positionLeverage;
            }
        }
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': marginMode,
            'longLeverage': longLeverage,
            'shortLeverage': shortLeverage,
        };
    }
    /**
     * @method
     * @name woo#setLeverage
     * @description set the level of leverage for a market
     * @see https://developer.woox.io/api-reference/endpoint/spot_margin/set_leverage
     * @see https://developer.woox.io/api-reference/endpoint/futures/set_leverage
     * @param {float} leverage the rate of leverage (1, 2, 3, 4 or 5 for spot markets, 1, 2, 3, 4, 5, 10, 15, 20 for swap markets)
     * @param {string} [symbol] unified market symbol (is mandatory for swap markets)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] *for swap markets only* 'cross' or 'isolated'
     * @param {string} [params.positionMode] *for swap markets only* 'ONE_WAY' or 'HEDGE_MODE'
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'leverage': leverage,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        if ((symbol === undefined) || market['spot']) {
            return await this.v3PrivatePostSpotMarginLeverage(this.extend(request, params));
        }
        else if (market['swap']) {
            request['symbol'] = market['id'];
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchLeverage', params, 'cross');
            request['marginMode'] = this.encodeMarginMode(marginMode);
            return await this.v3PrivatePutFuturesLeverage(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLeverage() is not supported for ' + market['type'] + ' markets');
        }
    }
    /**
     * @method
     * @name woo#addMargin
     * @description add margin
     * @see https://docs.woox.io/#update-isolated-margin-setting
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.position_side] 'LONG' or 'SHORT' in hedge mode, 'BOTH' in one way mode
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 'ADD', params);
    }
    /**
     * @method
     * @name woo#reduceMargin
     * @description remove margin from a position
     * @see https://docs.woox.io/#update-isolated-margin-setting
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.position_side] 'LONG' or 'SHORT' in hedge mode, 'BOTH' in one way mode
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    async reduceMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 'REDUCE', params);
    }
    async modifyMarginHelper(symbol, amount, type, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'adjust_token': 'USDT',
            'adjust_amount': amount,
            'action': type,
        };
        return await this.v1PrivatePostClientIsolatedMargin(this.extend(request, params));
    }
    /**
     * @method
     * @name woo#fetchPosition
     * @description fetch data on an open position
     * @see https://developer.woox.io/api-reference/endpoint/futures/get_positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v3PrivateGetFuturesPositions(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "positions": [
        //                 {
        //                     "symbol": "PERP_LTC_USDT",
        //                     "holding": "0.1",
        //                     "pendingLongQty": "0",
        //                     "pendingShortQty": "0",
        //                     "settlePrice": "96.87",
        //                     "averageOpenPrice": "96.87",
        //                     "pnl24H": "0",
        //                     "fee24H": "0.0048435",
        //                     "markPrice": "96.83793449",
        //                     "estLiqPrice": "0",
        //                     "timestamp": 1752500555823,
        //                     "adlQuantile": 2,
        //                     "positionSide": "BOTH",
        //                     "marginMode": "CROSS",
        //                     "isolatedMarginToken": "",
        //                     "isolatedMarginAmount": "0",
        //                     "isolatedFrozenLong": "0",
        //                     "isolatedFrozenShort": "0",
        //                     "leverage": 10
        //                 }
        //             ]
        //         },
        //         "timestamp": 1752500579848
        //     }
        //
        const result = this.safeDict(response, 'data', {});
        const positions = this.safeList(result, 'positions', []);
        const first = this.safeDict(positions, 0, {});
        return this.parsePosition(first, market);
    }
    /**
     * @method
     * @name woo#fetchPositions
     * @description fetch all open positions
     * @see https://developer.woox.io/api-reference/endpoint/futures/get_positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.v3PrivateGetFuturesPositions(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "positions": [
        //                 {
        //                     "symbol": "PERP_LTC_USDT",
        //                     "holding": "0.1",
        //                     "pendingLongQty": "0",
        //                     "pendingShortQty": "0",
        //                     "settlePrice": "96.87",
        //                     "averageOpenPrice": "96.87",
        //                     "pnl24H": "0",
        //                     "fee24H": "0.0048435",
        //                     "markPrice": "96.83793449",
        //                     "estLiqPrice": "0",
        //                     "timestamp": 1752500555823,
        //                     "adlQuantile": 2,
        //                     "positionSide": "BOTH",
        //                     "marginMode": "CROSS",
        //                     "isolatedMarginToken": "",
        //                     "isolatedMarginAmount": "0",
        //                     "isolatedFrozenLong": "0",
        //                     "isolatedFrozenShort": "0",
        //                     "leverage": 10
        //                 }
        //             ]
        //         },
        //         "timestamp": 1752500579848
        //     }
        //
        const result = this.safeDict(response, 'data', {});
        const positions = this.safeList(result, 'positions', []);
        return this.parsePositions(positions, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        // v1PrivateGetPositionSymbol
        //     {
        //         "symbol": "PERP_ETH_USDT",
        //         "position_side": "BOTH",
        //         "leverage": 10,
        //         "margin_mode": "CROSS",
        //         "average_open_price": 3139.9,
        //         "isolated_margin_amount": 0.0,
        //         "isolated_margin_token": "",
        //         "opening_time": "1720627963.094",
        //         "mark_price": 3155.19169891,
        //         "pending_short_qty": 0.0,
        //         "pending_long_qty": 0.0,
        //         "holding": -0.7,
        //         "pnl_24_h": 0.0,
        //         "est_liq_price": 9107.40055552,
        //         "settle_price": 3151.0319904,
        //         "success": true,
        //         "fee_24_h": 0.0,
        //         "isolated_frozen_long": 0.0,
        //         "isolated_frozen_short": 0.0,
        //         "timestamp": "1720867502.544"
        //     }
        //
        // v3PrivateGetPositions
        //     {
        //         "symbol": "PERP_LTC_USDT",
        //         "holding": "0.1",
        //         "pendingLongQty": "0",
        //         "pendingShortQty": "0",
        //         "settlePrice": "96.87",
        //         "averageOpenPrice": "96.87",
        //         "pnl24H": "0",
        //         "fee24H": "0.0048435",
        //         "markPrice": "96.83793449",
        //         "estLiqPrice": "0",
        //         "timestamp": 1752500555823,
        //         "adlQuantile": 2,
        //         "positionSide": "BOTH",
        //         "marginMode": "CROSS",
        //         "isolatedMarginToken": "",
        //         "isolatedMarginAmount": "0",
        //         "isolatedFrozenLong": "0",
        //         "isolatedFrozenShort": "0",
        //         "leverage": 10
        //     }
        //
        const contract = this.safeString(position, 'symbol');
        market = this.safeMarket(contract, market);
        let size = this.safeString(position, 'holding');
        let side = undefined;
        if (Precise["default"].stringGt(size, '0')) {
            side = 'long';
        }
        else {
            side = 'short';
        }
        const contractSize = this.safeString(market, 'contractSize');
        const markPrice = this.safeString2(position, 'markPrice', 'mark_price');
        const timestampString = this.safeString(position, 'timestamp');
        let timestamp = undefined;
        if (timestampString !== undefined) {
            if (timestampString.indexOf('.') > -1) {
                timestamp = this.safeTimestamp(position, 'timestamp');
            }
            else {
                timestamp = this.safeInteger(position, 'timestamp');
            }
        }
        const entryPrice = this.safeString2(position, 'averageOpenPrice', 'average_open_price');
        const priceDifference = Precise["default"].stringSub(markPrice, entryPrice);
        const unrealisedPnl = Precise["default"].stringMul(priceDifference, size);
        size = Precise["default"].stringAbs(size);
        const notional = Precise["default"].stringMul(size, markPrice);
        const positionSide = this.safeString(position, 'positionSide'); // 'SHORT' or 'LONG' for hedged, 'BOTH' for non-hedged
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber(entryPrice),
            'notional': this.parseNumber(notional),
            'leverage': this.safeNumber(position, 'leverage'),
            'unrealizedPnl': this.parseNumber(unrealisedPnl),
            'contracts': this.parseNumber(size),
            'contractSize': this.parseNumber(contractSize),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber2(position, 'estLiqPrice', 'est_liq_price'),
            'markPrice': this.parseNumber(markPrice),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': this.safeStringLower2(position, 'marginMode', 'margin_mode'),
            'side': side,
            'percentage': undefined,
            'hedged': positionSide !== 'BOTH',
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name woo#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://docs.woox.io/#get-quote-rfq
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
     */
    async fetchConvertQuote(fromCode, toCode, amount = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'sellToken': fromCode.toUpperCase(),
            'buyToken': toCode.toUpperCase(),
            'sellQuantity': this.numberToString(amount),
        };
        const response = await this.v3PrivateGetConvertRfq(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "quoteId": 123123123,
        //             "counterPartyId": "",
        //             "sellToken": "ETH",
        //             "sellQuantity": "0.0445",
        //             "buyToken": "USDT",
        //             "buyQuantity": "33.45",
        //             "buyPrice": "6.77",
        //             "expireTimestamp": 1659084466000,
        //             "message": 1659084466000
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const fromCurrencyId = this.safeString(data, 'sellToken', fromCode);
        const fromCurrency = this.currency(fromCurrencyId);
        const toCurrencyId = this.safeString(data, 'buyToken', toCode);
        const toCurrency = this.currency(toCurrencyId);
        return this.parseConversion(data, fromCurrency, toCurrency);
    }
    /**
     * @method
     * @name woo#createConvertTrade
     * @description convert from one currency to another
     * @see https://docs.woox.io/#send-quote-rft
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
     */
    async createConvertTrade(id, fromCode, toCode, amount = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'quoteId': id,
        };
        const response = await this.v3PrivatePostConvertRft(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "quoteId": 123123123,
        //             "counterPartyId": "",
        //             "rftAccepted": 1 // 1 -> success; 2 -> processing; 3 -> fail
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseConversion(data);
    }
    /**
     * @method
     * @name woo#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://docs.woox.io/#get-quote-trade
     * @param {string} id the id of the trade that you want to fetch
     * @param {string} [code] the unified currency code of the conversion trade
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
     */
    async fetchConvertTrade(id, code = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'quoteId': id,
        };
        const response = await this.v3PrivateGetConvertTrade(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "quoteId": 12,
        //             "buyAsset": "",
        //             "sellAsset": "",
        //             "buyAmount": 12.11,
        //             "sellAmount": 12.11,
        //             "tradeStatus": 12,
        //             "createdTime": ""
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const fromCurrencyId = this.safeString(data, 'sellAsset');
        const toCurrencyId = this.safeString(data, 'buyAsset');
        let fromCurrency = undefined;
        let toCurrency = undefined;
        if (fromCurrencyId !== undefined) {
            fromCurrency = this.currency(fromCurrencyId);
        }
        if (toCurrencyId !== undefined) {
            toCurrency = this.currency(toCurrencyId);
        }
        return this.parseConversion(data, fromCurrency, toCurrency);
    }
    /**
     * @method
     * @name woo#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://docs.woox.io/#get-quote-trades
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest conversion to fetch
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
     */
    async fetchConvertTradeHistory(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let request = {};
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.v3PrivateGetConvertTrades(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "count": 12,
        //             "tradeVos":[
        //                 {
        //                     "quoteId": 12,
        //                     "buyAsset": "",
        //                     "sellAsset": "",
        //                     "buyAmount": 12.11,
        //                     "sellAmount": 12.11,
        //                     "tradeStatus": 12,
        //                     "createdTime": ""
        //                 }
        //                 ...
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'tradeVos', []);
        return this.parseConversions(rows, code, 'sellAsset', 'buyAsset', since, limit);
    }
    parseConversion(conversion, fromCurrency = undefined, toCurrency = undefined) {
        //
        // fetchConvertQuote
        //
        //     {
        //         "quoteId": 123123123,
        //         "counterPartyId": "",
        //         "sellToken": "ETH",
        //         "sellQuantity": "0.0445",
        //         "buyToken": "USDT",
        //         "buyQuantity": "33.45",
        //         "buyPrice": "6.77",
        //         "expireTimestamp": 1659084466000,
        //         "message": 1659084466000
        //     }
        //
        // createConvertTrade
        //
        //     {
        //         "quoteId": 123123123,
        //         "counterPartyId": "",
        //         "rftAccepted": 1 // 1 -> success; 2 -> processing; 3 -> fail
        //     }
        //
        // fetchConvertTrade, fetchConvertTradeHistory
        //
        //     {
        //         "quoteId": 12,
        //         "buyAsset": "",
        //         "sellAsset": "",
        //         "buyAmount": 12.11,
        //         "sellAmount": 12.11,
        //         "tradeStatus": 12,
        //         "createdTime": ""
        //     }
        //
        const timestamp = this.safeInteger2(conversion, 'expireTimestamp', 'createdTime');
        const fromCurr = this.safeString2(conversion, 'sellToken', 'buyAsset');
        const fromCode = this.safeCurrencyCode(fromCurr, fromCurrency);
        const to = this.safeString2(conversion, 'buyToken', 'sellAsset');
        const toCode = this.safeCurrencyCode(to, toCurrency);
        return {
            'info': conversion,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(conversion, 'quoteId'),
            'fromCurrency': fromCode,
            'fromAmount': this.safeNumber2(conversion, 'sellQuantity', 'sellAmount'),
            'toCurrency': toCode,
            'toAmount': this.safeNumber2(conversion, 'buyQuantity', 'buyAmount'),
            'price': this.safeNumber(conversion, 'buyPrice'),
            'fee': undefined,
        };
    }
    /**
     * @method
     * @name woo#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://docs.woox.io/#get-quote-asset-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchConvertCurrencies(params = {}) {
        await this.loadMarkets();
        const response = await this.v3PrivateGetConvertAssetInfo(params);
        //
        //     {
        //         "success": true,
        //         "rows": [
        //             {
        //                 "token": "BTC",
        //                 "tick": 0.0001,
        //                 "createdTime": "1575014248.99", // Unix epoch time in seconds
        //                 "updatedTime": "1575014248.99"  // Unix epoch time in seconds
        //             },
        //         ]
        //     }
        //
        const result = {};
        const data = this.safeList(response, 'rows', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString(entry, 'token');
            const code = this.safeCurrencyCode(id);
            result[code] = {
                'info': entry,
                'id': id,
                'code': code,
                'networks': undefined,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': this.safeNumber(entry, 'tick'),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': this.safeTimestamp(entry, 'createdTime'),
            };
        }
        return result;
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

exports["default"] = woo;
