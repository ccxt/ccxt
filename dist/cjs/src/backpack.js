'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var backpack$1 = require('./abstract/backpack.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var ed25519 = require('./static_dependencies/noble-curves/ed25519.js');
var crypto = require('./base/functions/crypto.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class backpack
 * @augments Exchange
 */
class backpack extends backpack$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'backpack',
            'name': 'Backpack',
            'countries': ['JP'],
            'rateLimit': 50,
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLossOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsForSymbol': false,
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
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15': '15m',
                '30': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1month',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/cc04c278-679f-4554-9f72-930dd632b80f',
                'api': {
                    'public': 'https://api.backpack.exchange',
                    'private': 'https://api.backpack.exchange',
                },
                'www': 'https://backpack.exchange/',
                'doc': 'https://docs.backpack.exchange/',
                'referral': 'https://backpack.exchange/join/ib8qxwyl',
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/assets': 1,
                        'api/v1/collateral': 1,
                        'api/v1/borrowLend/markets': 1,
                        'api/v1/borrowLend/markets/history': 1,
                        'api/v1/markets': 1,
                        'api/v1/market': 1,
                        'api/v1/ticker': 1,
                        'api/v1/tickers': 1,
                        'api/v1/depth': 1,
                        'api/v1/klines': 1,
                        'api/v1/markPrices': 1,
                        'api/v1/openInterest': 1,
                        'api/v1/fundingRates': 1,
                        'api/v1/status': 1,
                        'api/v1/ping': 1,
                        'api/v1/time': 1,
                        'api/v1/wallets': 1,
                        'api/v1/trades': 1,
                        'api/v1/trades/history': 1, // done
                    },
                },
                'private': {
                    'get': {
                        'api/v1/account': 1,
                        'api/v1/account/limits/borrow': 1,
                        'api/v1/account/limits/order': 1,
                        'api/v1/account/limits/withdrawal': 1,
                        'api/v1/borrowLend/positions': 1,
                        'api/v1/capital': 1,
                        'api/v1/capital/collateral': 1,
                        'wapi/v1/capital/deposits': 1,
                        'wapi/v1/capital/deposit/address': 1,
                        'wapi/v1/capital/withdrawals': 1,
                        'api/v1/position': 1,
                        'wapi/v1/history/borrowLend': 1,
                        'wapi/v1/history/interest': 1,
                        'wapi/v1/history/borrowLend/positions': 1,
                        'wapi/v1/history/dust': 1,
                        'wapi/v1/history/fills': 1,
                        'wapi/v1/history/funding': 1,
                        'wapi/v1/history/orders': 1,
                        'wapi/v1/history/rfq': 1,
                        'wapi/v1/history/quote': 1,
                        'wapi/v1/history/settlement': 1,
                        'wapi/v1/history/strategies': 1,
                        'api/v1/order': 1,
                        'api/v1/orders': 1, // done
                    },
                    'post': {
                        'api/v1/account/convertDust': 1,
                        'api/v1/borrowLend': 1,
                        'wapi/v1/capital/withdrawals': 1,
                        'api/v1/order': 1,
                        'api/v1/orders': 1,
                        'api/v1/rfq': 1,
                        'api/v1/rfq/accept': 1,
                        'api/v1/rfq/refresh': 1,
                        'api/v1/rfq/cancel': 1,
                        'api/v1/rfq/quote': 1,
                    },
                    'delete': {
                        'api/v1/order': 1,
                        'api/v1/orders': 1, // done
                    },
                    'patch': {
                        'api/v1/account': 1,
                    },
                },
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'GTC': true,
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 20,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': undefined,
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'paginate': false,
                        'limit': 1000,
                    },
                },
                'spot': {
                    'extends': 'default',
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
            'precisionMode': number.TICK_SIZE,
            'options': {
                'instructions': {
                    'api/v1/account': {
                        'GET': 'accountQuery',
                        'PATCH': 'accountUpdate',
                    },
                    'api/v1/capital': {
                        'GET': 'balanceQuery',
                    },
                    'api/v1/account/limits/borrow': {
                        'GET': 'maxBorrowQuantity',
                    },
                    'api/v1/account/limits/order': {
                        'GET': 'maxOrderQuantity',
                    },
                    'api/v1/account/limits/withdrawal': {
                        'GET': 'maxWithdrawalQuantity',
                    },
                    'api/v1/borrowLend/positions': {
                        'GET': 'borrowLendPositionQuery',
                    },
                    'api/v1/borrowLend': {
                        'POST': 'borrowLendExecute',
                    },
                    'wapi/v1/history/borrowLend/positions': {
                        'GET': 'borrowPositionHistoryQueryAll',
                    },
                    'wapi/v1/history/borrowLend': {
                        'GET': 'borrowHistoryQueryAll',
                    },
                    'wapi/v1/history/dust': {
                        'GET': 'dustHistoryQueryAll',
                    },
                    'api/v1/capital/collateral': {
                        'GET': 'collateralQuery',
                    },
                    'wapi/v1/capital/deposit/address': {
                        'GET': 'depositAddressQuery',
                    },
                    'wapi/v1/capital/deposits': {
                        'GET': 'depositQueryAll',
                    },
                    'wapi/v1/history/fills': {
                        'GET': 'fillHistoryQueryAll',
                    },
                    'wapi/v1/history/funding': {
                        'GET': 'fundingHistoryQueryAll',
                    },
                    'wapi/v1/history/interest': {
                        'GET': 'interestHistoryQueryAll',
                    },
                    'api/v1/order': {
                        'GET': 'orderQuery',
                        'POST': 'orderExecute',
                        'DELETE': 'orderCancel',
                    },
                    'api/v1/orders': {
                        'GET': 'orderQueryAll',
                        'POST': 'orderExecute',
                        'DELETE': 'orderCancelAll',
                    },
                    'wapi/v1/history/orders': {
                        'GET': 'orderHistoryQueryAll',
                    },
                    'wapi/v1/history/pnl': {
                        'GET': 'pnlHistoryQueryAll',
                    },
                    'wapi/v1/history/rfq': {
                        'GET': 'rfqHistoryQueryAll',
                    },
                    'wapi/v1/history/quote': {
                        'GET': 'quoteHistoryQueryAll',
                    },
                    'wapi/v1/history/settlement': {
                        'GET': 'settlementHistoryQueryAll',
                    },
                    'api/v1/position': {
                        'GET': 'positionQuery',
                    },
                    'api/v1/rfq/quote': {
                        'POST': 'quoteSubmit',
                    },
                    'wapi/v1/history/strategies': {
                        'GET': 'strategyHistoryQueryAll',
                    },
                    'wapi/v1/capital/withdrawals': {
                        'GET': 'withdrawalQueryAll',
                        'POST': 'withdraw',
                    },
                },
                'recvWindow': 5000,
                'brokerId': '',
                'currencyIdsListForParseMarket': undefined,
                'broker': '',
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'networks': {
                    'APT': 'Aptos',
                    'ARB': 'Arbitrum',
                    'AVAX': 'Avalanche',
                    'BASE': 'Base',
                    'BERA': 'Berachain',
                    'BTC': 'Bitcoin',
                    'BCH': 'BitcoinCash',
                    'BSC': 'Bsc',
                    'ADA': 'Cardano',
                    'DOGE': 'Dogecoin',
                    'ECLIPSE': 'Eclipse',
                    'EQUALSMONEY': 'EqualsMoney',
                    'ERC20': 'Ethereum',
                    'HYP': 'Hyperliquid',
                    'LTC': 'Litecoin',
                    'OPTIMISM': 'Optimism',
                    'MATIC': 'Polygon',
                    'SEI': 'Sei',
                    'SUI': 'Sui',
                    'SOL': 'Solana',
                    'STORY': 'Story',
                    'TRC20': 'Tron',
                    'XRP': 'XRP',
                },
                'networksById': {
                    'aptos': 'APT',
                    'arbitrum': 'ARB',
                    'avalanche': 'AVAX',
                    'base': 'BASE',
                    'berachain': 'BERA',
                    'bitcoin': 'BTC',
                    'bitcoincash': 'BCH',
                    'bsc': 'BSC',
                    'cardano': 'ADA',
                    'dogecoin': 'DOGE',
                    'eclipse': 'ECLIPSE',
                    'equalsmoney': 'EQUALSMONEY',
                    'ethereum': 'ERC20',
                    'hyperliquid': 'HYP',
                    'litecoin': 'LTC',
                    'optimism': 'OPTIMISM',
                    'polygon': 'MATIC',
                    'sei': 'SEI',
                    'sui': 'SUI',
                    'solana': 'SOL',
                    'story': 'STORY',
                    'tron': 'TRC20',
                    'xrp': 'XRP',
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    'INVALID_CLIENT_REQUEST': errors.BadRequest,
                    'INVALID_ORDER': errors.InvalidOrder,
                    'ACCOUNT_LIQUIDATING': errors.BadRequest,
                    'BORROW_LIMIT': errors.BadRequest,
                    'BORROW_REQUIRES_LEND_REDEEM': errors.BadRequest,
                    'FORBIDDEN': errors.OperationRejected,
                    'INSUFFICIENT_FUNDS': errors.InsufficientFunds,
                    'INSUFFICIENT_MARGIN': errors.InsufficientFunds,
                    'INSUFFICIENT_SUPPLY': errors.InsufficientFunds,
                    'INVALID_ASSET': errors.BadRequest,
                    'INVALID_MARKET': errors.BadSymbol,
                    'INVALID_PRICE': errors.BadRequest,
                    'INVALID_POSITION_ID': errors.BadRequest,
                    'INVALID_QUANTITY': errors.BadRequest,
                    'INVALID_RANGE': errors.BadRequest,
                    'INVALID_SIGNATURE': errors.AuthenticationError,
                    'INVALID_SOURCE': errors.BadRequest,
                    'INVALID_SYMBOL': errors.BadSymbol,
                    'INVALID_TWO_FACTOR_CODE': errors.BadRequest,
                    'LEND_LIMIT': errors.BadRequest,
                    'LEND_REQUIRES_BORROW_REPAY': errors.BadRequest,
                    'MAINTENANCE': errors.ExchangeError,
                    'MAX_LEVERAGE_REACHED': errors.InsufficientFunds,
                    'NOT_IMPLEMENTED': errors.OperationFailed,
                    'ORDER_LIMIT': errors.OperationRejected,
                    'POSITION_LIMIT': errors.OperationRejected,
                    'PRECONDITION_FAILED': errors.OperationFailed,
                    'RESOURCE_NOT_FOUND': errors.ExchangeNotAvailable,
                    'SERVER_ERROR': errors.NetworkError,
                    'TIMEOUT': errors.RequestTimeout,
                    'TOO_MANY_REQUESTS': errors.RateLimitExceeded,
                    'TRADING_PAUSED': errors.ExchangeNotAvailable,
                    'UNAUTHORIZED': errors.AuthenticationError,
                },
                // Bad Request parse request payload error: failed to parse "MarketSymbol": Invalid market symbol (occurred while parsing "OrderExecutePayload")
                // failed to parse parameter `interval`: failed to parse "KlineInterval": Expect a valid enumeration value.
                'broad': {},
            },
        });
    }
    /**
     * @method
     * @name backpack#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.backpack.exchange/#tag/Assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetApiV1Assets(params);
        //
        //     [
        //         {
        //             "coingeckoId": "jito-governance-token",
        //             "displayName": "Jito",
        //             "symbol": "JTO",
        //             "tokens": [
        //                 {
        //                     "blockchain": "Solana",
        //                     "contractAddress": "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
        //                     "depositEnabled": true,
        //                     "displayName": "Jito",
        //                     "maximumWithdrawal": null,
        //                     "minimumDeposit": "0.29",
        //                     "minimumWithdrawal": "0.58",
        //                     "withdrawEnabled": true,
        //                     "withdrawalFee": "0.29"
        //                 }
        //             ]
        //         }
        //         ...
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currecy = response[i];
            const currencyId = this.safeString(currecy, 'symbol');
            const code = this.safeCurrencyCode(currencyId);
            const networks = this.safeList(currecy, 'tokens', []);
            const parsedNetworks = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.safeString(network, 'blockchain');
                const networkIdLowerCase = this.safeStringLower(network, 'blockchain');
                const networkCode = this.networkIdToCode(networkIdLowerCase);
                parsedNetworks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber(network, 'minimumWithdrawal'),
                            'max': this.parseNumber(this.omitZero(this.safeString(network, 'maximumWithdrawal'))),
                        },
                        'deposit': {
                            'min': this.safeNumber(network, 'minimumDeposit'),
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'deposit': this.safeBool(network, 'depositEnabled'),
                    'withdraw': this.safeBool(network, 'withdrawEnabled'),
                    'fee': this.safeNumber(network, 'withdrawalFee'),
                    'precision': undefined,
                    'info': network,
                };
            }
            let active = undefined;
            let deposit = undefined;
            let withdraw = undefined;
            if (this.isEmpty(parsedNetworks)) { // if networks are not provided
                active = false;
                deposit = false;
                withdraw = false;
            }
            result[code] = this.safeCurrencyStructure({
                'id': currencyId,
                'code': code,
                'precision': undefined,
                'type': 'crypto',
                'name': this.safeString(currecy, 'displayName'),
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
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
                'networks': parsedNetworks,
                'info': currecy,
            });
        }
        return result;
    }
    /**
     * @method
     * @name backpack#fetchMarkets
     * @description retrieves data on all markets for bitbank
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const response = await this.publicGetApiV1Markets(params);
        return this.parseMarkets(response);
    }
    parseMarket(market) {
        //
        //     [
        //         {
        //             "baseSymbol": "SOL",
        //             "createdAt": "2025-01-21T06:34:54.691858",
        //             "filters": {
        //                 "price": {
        //                     "borrowmarketFeeMaxMultiplier": null,
        //                     "borrowmarketFeeMinMultiplier": null,
        //                     "maxImpactMultiplier": "1.03",
        //                     "maxMultiplier": "1.25",
        //                     "maxPrice": null,
        //                     "meanMarkPriceBand": {
        //                         "maxMultiplier": "1.15",
        //                         "minMultiplier": "0.9"
        //                     },
        //                     "meanPremiumBand": null,
        //                     "minImpactMultiplier": "0.97",
        //                     "minMultiplier": "0.75",
        //                     "minPrice": "0.01",
        //                     "tickSize": "0.01"
        //                 },
        //                 "quantity": {
        //                     "maxQuantity": null,
        //                     "minQuantity": "0.01",
        //                     "stepSize": "0.01"
        //                 }
        //             },
        //             "fundingInterval": 28800000,
        //             "fundingRateLowerBound": null,
        //             "fundingRateUpperBound": null,
        //             "imfFunction": null,
        //             "marketType": "SPOT",
        //             "mmfFunction": null,
        //             "openInterestLimit": "0",
        //             "orderBookState": "Open",
        //             "quoteSymbol": "USDC",
        //             "symbol": "SOL_USDC"
        //         },
        //         {
        //             "baseSymbol": "SOL",
        //             "createdAt": "2025-01-21T06:34:54.691858",
        //             "filters": {
        //                 "price": {
        //                     "borrowEntryFeeMaxMultiplier": null,
        //                     "borrowEntryFeeMinMultiplier": null,
        //                     "maxImpactMultiplier": "1.03",
        //                     "maxMultiplier": "1.25",
        //                     "maxPrice": "1000",
        //                     "meanMarkPriceBand": {
        //                         "maxMultiplier": "1.1",
        //                         "minMultiplier": "0.9"
        //                     },
        //                     "meanPremiumBand": {
        //                         "tolerancePct": "0.05"
        //                     },
        //                     "minImpactMultiplier": "0.97",
        //                     "minMultiplier": "0.75",
        //                     "minPrice": "0.01",
        //                     "tickSize": "0.01"
        //                 },
        //                 "quantity": {
        //                     "maxQuantity": null,
        //                     "minQuantity": "0.01",
        //                     "stepSize": "0.01"
        //                 }
        //             },
        //             "fundingInterval": "28800000",
        //             "fundingRateLowerBound": "-100",
        //             "fundingRateUpperBound": "100",
        //             "imfFunction": {
        //                 "base": "0.02",
        //                 "factor": "0.0001275",
        //                 "type": "sqrt"
        //             },
        //             "marketType": "PERP",
        //             "mmfFunction": {
        //                 "base": "0.0125",
        //                 "factor": "0.0000765",
        //                 "type": "sqrt"
        //             },
        //             "openInterestLimit": "4000000",
        //             "orderBookState": "Open",
        //             "quoteSymbol": "USDC",
        //             "symbol": "SOL_USDC_PERP"
        //         }
        //     ]
        //
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString(market, 'baseSymbol');
        const quoteId = this.safeString(market, 'quoteSymbol');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        let symbol = base + '/' + quote;
        const filters = this.safeDict(market, 'filters', {});
        const priceFilter = this.safeDict(filters, 'price', {});
        const maxPrice = this.safeNumber(priceFilter, 'maxPrice');
        const minPrice = this.safeNumber(priceFilter, 'minPrice');
        const pricePrecision = this.safeNumber(priceFilter, 'tickSize');
        const quantityFilter = this.safeDict(filters, 'quantity', {});
        const maxQuantity = this.safeNumber(quantityFilter, 'maxQuantity');
        const minQuantity = this.safeNumber(quantityFilter, 'minQuantity');
        const amountPrecision = this.safeNumber(quantityFilter, 'stepSize');
        let type;
        const typeOfMarket = this.parseMarketType(this.safeString(market, 'marketType'));
        let linear = undefined;
        let inverse = undefined;
        let settle = undefined;
        let settleId = undefined;
        let contractSize = undefined;
        if (typeOfMarket === 'spot') {
            type = 'spot';
        }
        else if (typeOfMarket === 'swap') {
            type = 'swap';
            linear = true;
            inverse = false;
            settleId = this.safeString(market, 'quoteSymbol');
            settle = this.safeCurrencyCode(settleId);
            symbol += ':' + settle;
            contractSize = 1;
        }
        const orderBookState = this.safeString(market, 'orderBookState');
        return this.safeMarketStructure({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': type === 'spot',
            'margin': type === 'spot',
            'swap': type === 'swap',
            'future': false,
            'option': false,
            'active': orderBookState === 'Open',
            'contract': type !== 'spot',
            'linear': linear,
            'inverse': inverse,
            'taker': undefined,
            'maker': undefined,
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
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': minQuantity,
                    'max': maxQuantity,
                },
                'price': {
                    'min': minPrice,
                    'max': maxPrice,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': this.parse8601(this.safeString(market, 'createdAt')),
            'info': market,
        });
    }
    parseMarketType(type) {
        const types = {
            'SPOT': 'spot',
            'PERP': 'swap',
            // current types are described in the docs, but the exchange returns only 'SPOT' and 'PERP'
            // 'IPERP': 'swap',
            // 'DATED': 'swap',
            // 'PREDICTION': 'swap',
            // 'RFQ': 'swap',
        };
        return this.safeString(types, type, type);
    }
    /**
     * @method
     * @name backpack#fetchTickers
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_tickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const response = await this.publicGetApiV1Tickers(this.extend(request, params));
        const tickers = this.parseTickers(response);
        return this.filterByArrayTickers(tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name backpack#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_ticker
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
        const response = await this.publicGetApiV1Ticker(this.extend(request, params));
        return this.parseTicker(response, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        // fetchTicker/fetchTickers
        //
        //     {
        //         "firstPrice": "327.38",
        //         "high": "337.99",
        //         "lastPrice": "317.14",
        //         "low": "300.01",
        //         "priceChange": "-10.24",
        //         "priceChangePercent": "-0.031279",
        //         "quoteVolume": "21584.32278",
        //         "symbol": "AAVE_USDC",
        //         "trades": "245",
        //         "volume": "65.823"
        //     }, ...
        //
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market);
        const open = this.safeString(ticker, 'firstPrice');
        const last = this.safeString(ticker, 'lastPrice');
        const high = this.safeString(ticker, 'high');
        const low = this.safeString(ticker, 'low');
        const baseVolume = this.safeString(ticker, 'volume');
        const quoteVolume = this.safeString(ticker, 'quoteVolume');
        const percentage = this.safeString(ticker, 'priceChangePercent');
        const change = this.safeString(ticker, 'priceChange');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name backpack#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1Depth(this.extend(request, params));
        //
        //     {
        //         "asks": [
        //             ["118318.3","0.00633"],
        //             ["118567.2","0.08450"]
        //         ],
        //         "bids": [
        //             ["1.0","0.38647"],
        //             ["12.9","1.00000"]
        //         ],
        //         "lastUpdateId":"1504999670",
        //         "timestamp":1753102447307501
        //     }
        //
        const microseconds = this.safeInteger(response, 'timestamp');
        const timestamp = this.parseToInt(microseconds / 1000);
        const orderbook = this.parseOrderBook(response, symbol, timestamp);
        orderbook['nonce'] = this.safeInteger(response, 'lastUpdateId');
        return orderbook;
    }
    /**
     * @method
     * @name backpack#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in seconds of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const request = {
            'symbol': market['id'],
            'interval': interval,
        };
        let until = undefined;
        [until, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'until');
        if (until !== undefined) {
            request['endTime'] = this.parseToInt(until / 1000); // convert milliseconds to seconds
        }
        const defaultLimit = 100;
        if (since === undefined) {
            if (limit === undefined) {
                limit = defaultLimit;
            }
            const duration = this.parseTimeframe(timeframe);
            const endTime = until ? this.parseToInt(until / 1000) : this.seconds();
            const startTime = endTime - (limit * duration);
            request['startTime'] = startTime;
        }
        else {
            request['startTime'] = this.parseToInt(since / 1000); // convert milliseconds to seconds
        }
        const price = this.safeString(params, 'price');
        if (price !== undefined) {
            request['priceType'] = this.capitalize(price);
            params = this.omit(params, 'price');
        }
        const response = await this.publicGetApiV1Klines(this.extend(request, params));
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         {
        //             "close": "118294.6",
        //             "end": "2025-07-19 13:12:00",
        //             "high": "118297.6",
        //             "low": "118237.5",
        //             "open": "118238",
        //             "quoteVolume": "4106.558156",
        //             "start": "2025-07-19 13:09:00",
        //             "trades": "12",
        //             "volume": "0.03473"
        //         },
        //         ...
        //     ]
        //
        return [
            this.parse8601(this.safeString(ohlcv, 'start')),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    /**
     * @method
     * @name backpack#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_mark_prices
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['spot']) {
            throw new errors.BadRequest(this.id + ' fetchFundingRate() symbol does not support market ' + symbol);
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1MarkPrices(this.extend(request, params));
        const data = this.safeDict(response, 0, {});
        return this.parseFundingRate(data, market);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "fundingRate": "0.0001",
        //         "indexPrice": "118333.18643195",
        //         "markPrice": "118343.51853741",
        //         "nextFundingTimestamp": 1753113600000,
        //         "symbol": "BTC_USDC_PERP"
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market);
        const nextFundingTimestamp = this.safeInteger(contract, 'nextFundingTimestamp');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber(contract, 'markPrice'),
            'indexPrice': this.safeNumber(contract, 'indexPrice'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber(contract, 'fundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601(nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': '1h',
        };
    }
    /**
     * @method
     * @name backpack#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_open_interest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
     */
    async fetchOpenInterest(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['spot']) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterest() symbol does not support market ' + symbol);
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1OpenInterest(this.extend(request, params));
        const interest = this.safeDict(response, 0, {});
        return this.parseOpenInterest(interest, market);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //     [
        //         {
        //             "openInterest": "1273.85214",
        //             "symbol": "BTC_USDC_PERP",
        //             "timestamp":1753105735301
        //         }
        //     ]
        //
        const timestamp = this.safeInteger(interest, 'timestamp');
        const openInterest = this.safeNumber(interest, 'openInterest');
        return this.safeOpenInterest({
            'symbol': market['symbol'],
            'openInterestAmount': undefined,
            'openInterestValue': openInterest,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        }, market);
    }
    /**
     * @method
     * @name backpack#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_funding_interval_rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
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
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000); // api maximum 1000
        }
        const response = await this.publicGetApiV1FundingRates(this.extend(request, params));
        //
        //     [
        //         {
        //             "fundingRate": "0.0001",
        //             "intervalEndTimestamp": "2025-07-22T00:00:00",
        //             "symbol": "BTC_USDC_PERP"
        //         }
        //     ]
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const rate = response[i];
            const datetime = this.safeString(rate, 'intervalEndTimestamp');
            const timestamp = this.parse8601(datetime);
            rates.push({
                'info': rate,
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber(rate, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': datetime,
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    /**
     * @method
     * @name backpack#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.backpack.exchange/#tag/Trades/operation/get_recent_trades
     * @see https://docs.backpack.exchange/#tag/Trades/operation/get_historical_trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.offset] the number of trades to skip, default is 0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000); // api maximum 1000
        }
        let response = undefined;
        const offset = this.safeInteger(params, 'offset');
        if (offset !== undefined) {
            response = await this.publicGetApiV1TradesHistory(this.extend(request, params));
        }
        else {
            response = await this.publicGetApiV1Trades(this.extend(request, params));
        }
        return this.parseTrades(response, market, since, limit);
    }
    /**
     * @method
     * @name backpack#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.backpack.exchange/#tag/History/operation/get_fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {string} [params.fillType] 'User' (default) 'BookLiquidation' or 'Adl' or 'Backstop' or 'Liquidation' or 'AllLiquidation' or 'CollateralConversion' or 'CollateralConversionAndSpotLiquidation'
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['to'] = until;
        }
        const fillType = this.safeString(params, 'fillType');
        if (fillType === undefined) {
            request['fillType'] = 'User'; // default
        }
        const response = await this.privateGetWapiV1HistoryFills(this.extend(request, params));
        return this.parseTrades(response, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //     {
        //         "id": 8721564,
        //         "isBuyerMaker": false,
        //         "price": "117427.6",
        //         "quantity": "0.00016",
        //         "quoteQuantity": "18.788416",
        //         "timestamp": 1753123916818
        //     }
        //
        // fetchMyTrades
        //     {
        //         "clientId": null,
        //         "fee": "0.004974",
        //         "feeSymbol": "USDC",
        //         "isMaker": false,
        //         "orderId": "4238907375",
        //         "price": "3826.15",
        //         "quantity": "0.0026",
        //         "side": "Bid",
        //         "symbol": "ETH_USDC_PERP",
        //         "systemOrderType": null,
        //         "timestamp": "2025-07-27T17:39:00.092",
        //         "tradeId": 9748827
        //     }
        //
        const id = this.safeString2(trade, 'id', 'tradeId');
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const price = this.safeString(trade, 'price');
        const amount = this.safeString(trade, 'quantity');
        const isMaker = this.safeBool(trade, 'isMaker');
        const takerOrMaker = isMaker ? 'maker' : 'taker';
        const orderId = this.safeString(trade, 'orderId');
        const side = this.parseOrderSide(this.safeString(trade, 'side'));
        let fee = undefined;
        const feeAmount = this.safeString(trade, 'fee');
        let timestamp = this.safeInteger(trade, 'timestamp');
        if (feeAmount !== undefined) {
            // if fetchMyTrades
            const datetime = this.safeString(trade, 'timestamp');
            timestamp = this.parse8601(datetime);
        }
        const feeSymbol = this.safeCurrencyCode(this.safeString(trade, 'feeSymbol'));
        if (feeAmount !== undefined) {
            fee = {
                'cost': feeAmount,
                'currency': feeSymbol,
                'rate': undefined,
            };
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name backpack#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.backpack.exchange/#tag/System/operation/get_status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.publicGetApiV1Status(params);
        //
        //     {
        //         "message":null,
        //         "status":"Ok"
        //     }
        //
        const status = this.safeString(response, 'status');
        return {
            'status': status.toLowerCase(),
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name backpack#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://developer-pro.bitmart.com/en/spot/#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetApiV1Time(params);
        //
        //     1753131712992
        //
        return this.safeInteger(response, 0, this.milliseconds());
    }
    /**
     * @method
     * @name backpack#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetApiV1Capital(params);
        return this.parseBalance(response);
    }
    parseBalance(response) {
        //
        //     {
        //         "USDC": {
        //             "available": "120",
        //             "locked": "0",
        //             "staked": "0"
        //         }
        //     }
        //
        const balanceKeys = Object.keys(response);
        const result = {};
        for (let i = 0; i < balanceKeys.length; i++) {
            const id = balanceKeys[i];
            const code = this.safeCurrencyCode(id);
            const balance = response[id];
            const account = this.account();
            const locked = this.safeString(balance, 'locked');
            const staked = this.safeString(balance, 'staked');
            const used = Precise["default"].stringAdd(locked, staked);
            account['free'] = this.safeString(balance, 'available');
            account['used'] = used;
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name backpack#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        let until = undefined;
        [until, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.privateGetWapiV1CapitalDeposits(this.extend(request, params));
        return this.parseTransactions(response, currency, since, limit);
    }
    /**
     * @method
     * @name backpack#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_withdrawals
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until = undefined;
        [until, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'until');
        if (until !== undefined) {
            request['to'] = until;
        }
        const response = await this.privateGetWapiV1CapitalWithdrawals(this.extend(request, params));
        return this.parseTransactions(response, currency, since, limit);
    }
    /**
     * @method
     * @name backpack#withdraw
     * @description make a withdrawal
     * @see https://docs.backpack.exchange/#tag/Capital/operation/request_withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the network to withdraw on (mandatory)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'symbol': currency['id'],
            'amount': this.numberToString(amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['clientId'] = tag; // memo or tag
        }
        const [networkCode, query] = this.handleNetworkCodeAndParams(params);
        const networkId = this.networkCodeToId(networkCode);
        if (networkId === undefined) {
            throw new errors.BadRequest(this.id + ' withdraw() requires a network parameter');
        }
        request['blockchain'] = networkId;
        const response = await this.privatePostWapiV1CapitalWithdrawals(this.extend(request, query));
        return this.parseTransaction(response, currency);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //     [
        //         {
        //             "createdAt": "2025-07-23T13:55:54.267",
        //             "fiatAmount": null,
        //             "fiatCurrency": null,
        //             "fromAddress": "0x2e3ab3e88a7dbdc763aadf5b28c18fb085af420a",
        //             "id": 6695353,
        //             "institutionBic": null,
        //             "platformMemo": null,
        //             "quantity": "120",
        //             "source": "ethereum",
        //             "status": "confirmed",
        //             "symbol": "USDC",
        //             "toAddress": "0xfBe7CbfCde93c8a4204a4be6B56732Eb32690170",
        //             "transactionHash": "0x58edaac415398d617b34c6673fffcaf0024990d5700565030119db5cbf3765d1"
        //         }
        //     ]
        //
        // withdraw
        //     {
        //         "accountIdentifier": null,
        //         "bankIdentifier": null,
        //         "bankName": null,
        //         "blockchain": "Ethereum",
        //         "clientId": null,
        //         "createdAt": "2025-08-13T19:27:13.817",
        //         "fee": "3",
        //         "fiatFee": null,
        //         "fiatState": null,
        //         "fiatSymbol": null,
        //         "id": 5479929,
        //         "identifier": null,
        //         "isInternal": false,
        //         "providerId": null,
        //         "quantity": "10",
        //         "status": "pending",
        //         "subaccountId": null,
        //         "symbol": "USDC",
        //         "toAddress": "0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749",
        //         "transactionHash": null,
        //         "triggerAt": null
        //     }
        //
        // fetchWithdrawals
        //     [
        //         {
        //             "accountIdentifier": null,
        //             "bankIdentifier": null,
        //             "bankName": null,
        //             "blockchain": "Ethereum",
        //             "clientId": null,
        //             "createdAt": "2025-08-13T19:27:13.817",
        //             "fee": "3",
        //             "fiatFee": null,
        //             "fiatState": null,
        //             "fiatSymbol": null,
        //             "id": 5479929,
        //             "identifier": null,
        //             "isInternal": false,
        //             "providerId": null,
        //             "quantity": "10",
        //             "status": "confirmed",
        //             "subaccountId": null,
        //             "symbol": "USDC",
        //             "toAddress": "0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749",
        //             "transactionHash": "0x658b6d082af4afa0d3cf85caf344ff7c19d980117726bf193b00d8850f8746a1",
        //             "triggerAt": null
        //         }
        //     ]
        //
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const id = this.safeString(transaction, 'id');
        const txid = this.safeString(transaction, 'transactionHash');
        const coin = this.safeString(transaction, 'symbol');
        const code = this.safeCurrencyCode(coin, currency);
        const timestamp = this.parse8601(this.safeString(transaction, 'createdAt'));
        const amount = this.safeNumber(transaction, 'quantity');
        const networkId = this.safeStringLower2(transaction, 'source', 'blockchain');
        const network = this.networkIdToCode(networkId);
        const addressTo = this.safeString(transaction, 'toAddress');
        const addressFrom = this.safeString(transaction, 'fromAddress');
        const tag = this.safeString(transaction, 'platformMemo');
        const feeCost = this.safeNumber(transaction, 'fee');
        const internal = this.safeBool(transaction, 'isInternal', false);
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': network,
            'address': undefined,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': internal,
            'comment': undefined,
            'fee': fee,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'cancelled': 'cancelled',
            'confirmed': 'ok',
            'declined': 'declined',
            'expired': 'expired',
            'initiated': 'initiated',
            'pending': 'pending',
            'refunded': 'refunded',
            'information required': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name backpack#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_deposit_address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.networkCode] the network to fetch the deposit address (mandatory)
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress() requires a network parameter, see https://docs.ccxt.com/#/?id=network-codes');
        }
        const currency = this.currency(code);
        const request = {
            'blockchain': this.networkCodeToId(networkCode),
        };
        const response = await this.privateGetWapiV1CapitalDepositAddress(this.extend(request, params));
        return this.parseDepositAddress(response, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //     {
        //         "address": "0xfBe7CbfCde93c8a4204a4be6B56732Eb32690170"
        //     }
        //
        const address = this.safeString(depositAddress, 'address');
        const currencyId = this.safeString(depositAddress, 'currency');
        currency = this.safeCurrency(currencyId, currency);
        return {
            'info': depositAddress,
            'currency': currency['code'],
            'network': undefined,
            'address': address,
            'tag': undefined,
        };
    }
    /**
     * @method
     * @name backpack#createOrder
     * @description create a trade order
     * @see https://docs.backpack.exchange/#tag/Order/operation/execute_order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *market orders only* the cost of the order in units of the quote currency (could be used instead of amount)
     * @param {int} [params.clientOrderId] a unique id for the order
     * @param {boolean} [params.postOnly] true to place a post only order
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'PO'
     * @param {bool} [params.reduceOnly] *contract only* Indicates if this order is to reduce the size of a position
     * @param {string} [params.selfTradePrevention] 'RejectTaker', 'RejectMaker' or 'RejectBoth'
     * @param {bool} [params.autoLend] *spot margin only* if true then the order can lend
     * @param {bool} [params.autoLendRedeem] *spot margin only* if true then the order can redeem a lend if required
     * @param {bool} [params.autoBorrow] *spot margin only* if true then the order can borrow
     * @param {bool} [params.autoBorrowRepay] *spot margin only* if true then the order can repay a borrow
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {object} [params.takeProfit] *swap markets only - takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] take profit order price (if not provided the order will be a market order)
     * @param {object} [params.stopLoss] *swap markets only - stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] stop loss order price (if not provided the order will be a market order)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const orderRequest = this.createOrderRequest(symbol, type, side, amount, price, params);
        const response = await this.privatePostApiV1Order(orderRequest);
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name backpack#createOrders
     * @description create a list of trade orders
     * @see https://docs.backpack.exchange/#tag/Order/operation/execute_order_batch
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeNumber(rawOrder, 'amount');
            const price = this.safeNumber(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const extendedParams = this.extend(orderParams, params); // the request does not accept extra params since it's a list, so we're extending each order with the common params
            const orderRequest = this.createOrderRequest(marketId, type, side, amount, price, extendedParams);
            ordersRequests.push(orderRequest);
        }
        const response = await this.privatePostApiV1Orders(ordersRequests);
        return this.parseOrders(response);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'side': this.encodeOrderSide(side),
            'orderType': this.capitalize(type),
        };
        const triggerPrice = this.safeString(params, 'triggerPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const quantityKey = isTriggerOrder ? 'triggerQuantity' : 'quantity';
        // handle basic limit/market order types
        if (type === 'limit') {
            request['price'] = this.priceToPrecision(symbol, price);
            request[quantityKey] = this.amountToPrecision(symbol, amount);
        }
        else if (type === 'market') {
            const cost = this.safeString2(params, 'cost', 'quoteQuantity');
            if (cost !== undefined) {
                request['quoteQuantity'] = this.costToPrecision(symbol, cost);
                params = this.omit(params, ['cost', 'quoteQuantity']);
            }
            else {
                request[quantityKey] = this.amountToPrecision(symbol, amount);
            }
        }
        // trigger orders
        if (isTriggerOrder) {
            request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
            params = this.omit(params, 'triggerPrice');
        }
        const clientOrderId = this.safeInteger(params, 'clientOrderId'); // the exchange requires uint
        if (clientOrderId !== undefined) {
            request['clientId'] = clientOrderId;
            params = this.omit(params, 'clientOrderId');
        }
        let postOnly = false;
        [postOnly, params] = this.handlePostOnly(type === 'market', false, params);
        if (postOnly) {
            params['postOnly'] = true;
        }
        const takeProfit = this.safeDict(params, 'takeProfit');
        if (takeProfit !== undefined) {
            const takeProfitTriggerPrice = this.safeString(takeProfit, 'triggerPrice');
            if (takeProfitTriggerPrice !== undefined) {
                request['takeProfitTriggerPrice'] = this.priceToPrecision(symbol, takeProfitTriggerPrice);
            }
            const takeProfitPrice = this.safeString(takeProfit, 'price');
            if (takeProfitPrice !== undefined) {
                request['takeProfitLimitPrice'] = this.priceToPrecision(symbol, takeProfitPrice);
            }
            params = this.omit(params, 'takeProfit');
        }
        const stopLoss = this.safeDict(params, 'stopLoss');
        if (stopLoss !== undefined) {
            const stopLossTriggerPrice = this.safeString(stopLoss, 'triggerPrice');
            if (stopLossTriggerPrice !== undefined) {
                request['stopLossTriggerPrice'] = this.priceToPrecision(symbol, stopLossTriggerPrice);
            }
            const stopLossPrice = this.safeString(stopLoss, 'price');
            if (stopLossPrice !== undefined) {
                request['stopLossLimitPrice'] = this.priceToPrecision(symbol, stopLossPrice);
            }
            params = this.omit(params, 'stopLoss');
        }
        return this.extend(request, params);
    }
    encodeOrderSide(side) {
        const sides = {
            'buy': 'Bid',
            'sell': 'Ask',
        };
        return this.safeString(sides, side, side);
    }
    /**
     * @method
     * @name backpack#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.backpack.exchange/#tag/Order/operation/get_open_orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetApiV1Orders(this.extend(request, params));
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name backpack#fetchOpenOrder
     * @description fetch an open order by it's id
     * @see https://docs.backpack.exchange/#tag/Order/operation/get_order
     * @param {string} id order id
     * @param {string} symbol not used by hollaex fetchOpenOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrder() requires a symbol argument');
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this.privateGetApiV1Order(this.extend(request, params));
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name backpack#cancelOrder
     * @description cancels an open order
     * @see https://docs.backpack.exchange/#tag/Order/operation/cancel_order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        const market = this.market(symbol);
        const request = {
            'orderId': id,
            'symbol': market['id'],
        };
        const response = await this.privateDeleteApiV1Order(this.extend(request, params));
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name backpack#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.backpack.exchange/#tag/Order/operation/cancel_open_orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateDeleteApiV1Orders(this.extend(request, params));
        return this.parseOrders(response, market);
    }
    /**
     * @method
     * @name backpack#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.backpack.exchange/#tag/History/operation/get_order_history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of  orde structures to retrieve (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWapiV1HistoryOrders(this.extend(request, params));
        return this.parseOrders(response, market, since, limit);
    }
    parseOrder(order, market = undefined) {
        //
        //     {
        //         "clientId": null,
        //         "createdAt": 1753624283415,
        //         "executedQuantity": "0.001",
        //         "executedQuoteQuantity": "3.81428",
        //         "id": "4227701917",
        //         "orderType": "Market",
        //         "quantity": "0.001",
        //         "quoteQuantity": "3.82",
        //         "reduceOnly": null,
        //         "relatedOrderId": null,
        //         "selfTradePrevention": "RejectTaker",
        //         "side": "Bid",
        //         "status": "Filled",
        //         "stopLossLimitPrice": null,
        //         "stopLossTriggerBy": null,
        //         "stopLossTriggerPrice": null,
        //         "strategyId": null,
        //         "symbol": "ETH_USDC",
        //         "takeProfitLimitPrice": null,
        //         "takeProfitTriggerBy": null,
        //         "takeProfitTriggerPrice": null,
        //         "timeInForce": "GTC",
        //         "triggerBy": null,
        //         "triggerPrice": null,
        //         "triggerQuantity": null,
        //         "triggeredAt": null
        //     }
        //
        // fetchOpenOrders
        //     {
        //         "clientId": 123456789,
        //         "createdAt": 1753626206762,
        //         "executedQuantity": "0",
        //         "executedQuoteQuantity": "0",
        //         "id": "4228978331",
        //         "orderType": "Limit",
        //         "postOnly": true,
        //         "price": "3000",
        //         "quantity": "0.001",
        //         "reduceOnly": null,
        //         "relatedOrderId": null,
        //         "selfTradePrevention": "RejectTaker",
        //         "side": "Bid",
        //         "status": "New",
        //         "stopLossLimitPrice": null,
        //         "stopLossTriggerBy": null,
        //         "stopLossTriggerPrice": null,
        //         "strategyId": null,
        //         "symbol": "ETH_USDC",
        //         "takeProfitLimitPrice": null,
        //         "takeProfitTriggerBy": null,
        //         "takeProfitTriggerPrice": null,
        //         "timeInForce": "GTC",
        //         "triggerBy": null,
        //         "triggerPrice": null,
        //         "triggerQuantity": null,
        //         "triggeredAt": null
        //     }
        //
        // fetchOrders
        //     {
        //         "clientId": null,
        //         "createdAt": "2025-07-27T18:05:40.897",
        //         "executedQuantity": "0",
        //         "executedQuoteQuantity": "0",
        //         "expiryReason": null,
        //         "id": "4239996998",
        //         "orderType": "Limit",
        //         "postOnly": false,
        //         "price": "4500",
        //         "quantity": null,
        //         "quoteQuantity": null,
        //         "selfTradePrevention": "RejectTaker",
        //         "side": "Ask",
        //         "status": "Cancelled",
        //         "stopLossLimitPrice": null,
        //         "stopLossTriggerBy": null,
        //         "stopLossTriggerPrice": null,
        //         "strategyId": null,
        //         "symbol": "ETH_USDC",
        //         "systemOrderType": null,
        //         "takeProfitLimitPrice": null,
        //         "takeProfitTriggerBy": null,
        //         "takeProfitTriggerPrice": null,
        //         "timeInForce": "GTC",
        //         "triggerBy": null,
        //         "triggerPrice": "4300",
        //         "triggerQuantity": "0.001"
        //     }
        //
        let timestamp = this.safeInteger(order, 'createdAt');
        const timestamp2 = this.parse8601(this.safeString(order, 'createdAt'));
        if (timestamp2 !== undefined) {
            timestamp = timestamp2;
        }
        const id = this.safeString(order, 'id');
        const clientOrderId = this.safeString(order, 'clientId');
        const symbol = this.safeSymbol(this.safeString(order, 'symbol'), market);
        const type = this.safeStringLower(order, 'orderType');
        const timeInForce = this.safeString(order, 'timeInForce');
        const side = this.parseOrderSide(this.safeString(order, 'side'));
        const amount = this.safeString2(order, 'quantity', 'triggerQuantity');
        const price = this.safeString(order, 'price');
        const cost = this.safeString(order, 'executedQuoteQuantity');
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const triggerPrice = this.safeString(order, 'triggerPrice');
        const filled = this.safeString(order, 'executedQuantity');
        const reduceOnly = this.safeBool(order, 'reduceOnly');
        const postOnly = this.safeBool(order, 'postOnly');
        const stopLossPrice = this.safeString2(order, 'stopLossLimitPrice', 'stopLossTriggerPrice');
        const takeProfitPrice = this.safeString2(order, 'takeProfitLimitPrice', 'takeProfitTriggerPrice');
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'New': 'open',
            'Filled': 'closed',
            'Cancelled': 'canceled',
            'Expired': 'canceled',
            'PartiallyFilled': 'open',
            'TriggerPending': 'open',
            'TriggerFailed': 'rejected',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderSide(side) {
        const sides = {
            'Bid': 'buy',
            'Ask': 'sell',
        };
        return this.safeString(sides, side, side);
    }
    /**
     * @method
     * @name backpack#fetchPositions
     * @description fetch all open positions
     * @see https://docs.backpack.exchange/#tag/Futures/operation/get_positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetApiV1Position(params);
        const positions = this.parsePositions(response);
        if (this.isEmpty(symbols)) {
            return positions;
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArrayPositions(positions, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        // fetchPositions
        //     {
        //         "breakEvenPrice": "3831.3630555555555555555555556",
        //         "cumulativeFundingPayment": "-0.009218",
        //         "cumulativeInterest": "0",
        //         "entryPrice": "3826.8888888888888888888888889",
        //         "estLiquidationPrice": "0",
        //         "imf": "0.02",
        //         "imfFunction": {
        //             "base": "0.02",
        //             "factor": "0.0000935",
        //             "type": "sqrt"
        //         },
        //         "markPrice": "3787.46813304",
        //         "mmf": "0.0125",
        //         "mmfFunction": {
        //             "base": "0.0125",
        //             "factor": "0.0000561",
        //             "type": "sqrt"
        //         },
        //         "netCost": "13.7768",
        //         "netExposureNotional": "13.634885278944",
        //         "netExposureQuantity": "0.0036",
        //         "netQuantity": "0.0036",
        //         "pnlRealized": "0",
        //         "pnlUnrealized": "-0.141914",
        //         "positionId": "4238420454",
        //         "subaccountId": null,
        //         "symbol": "ETH_USDC_PERP",
        //         "userId":1813870
        //     }
        //
        //
        const id = this.safeString(position, 'positionId');
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const entryPrice = this.safeString(position, 'entryPrice');
        const markPrice = this.safeString(position, 'markPrice');
        const netCost = this.safeString(position, 'netCost');
        let hedged = false;
        let side = 'long';
        if (Precise["default"].stringLt(netCost, '0')) {
            side = 'short';
        }
        if (netCost === undefined) {
            hedged = undefined;
            side = undefined;
        }
        const unrealizedPnl = this.safeString(position, 'pnlUnrealized');
        const realizedPnl = this.safeString(position, 'pnlRealized');
        const liquidationPrice = this.safeString(position, 'estLiquidationPrice');
        return this.safePosition({
            'info': position,
            'id': id,
            'symbol': symbol,
            'timestamp': this.parse8601(this.safeString(position, 'timestamp')),
            'datetime': this.iso8601(this.parse8601(this.safeString(position, 'timestamp'))),
            'lastUpdateTimestamp': undefined,
            'hedged': hedged,
            'side': side,
            'contracts': this.safeString(position, 'netExposureQuantity'),
            'contractSize': undefined,
            'entryPrice': entryPrice,
            'markPrice': markPrice,
            'lastPrice': undefined,
            'notional': Precise["default"].stringAbs(netCost),
            'leverage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': this.safeString(position, 'imf'),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': this.safeString(position, 'mmf'),
            'realizedPnl': realizedPnl,
            'unrealizedPnl': unrealizedPnl,
            'liquidationPrice': liquidationPrice,
            'marginMode': undefined,
            'marginRatio': undefined,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name backpack#fetchFundingHistory
     * @description fetches the history of funding payments
     * @see https://docs.backpack.exchange/#tag/History/operation/get_funding_payments
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch (default 24 hours ago)
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWapiV1HistoryFunding(this.extend(request, params));
        return this.parseIncomes(response, market, since, limit);
    }
    parseIncome(income, market = undefined) {
        //
        //     {
        //         "fundingRate": "0.0001",
        //         "intervalEndTimestamp": "2025-08-01T16:00:00",
        //         "quantity": "-0.001301",
        //         "subaccountId": 0,
        //         "symbol": "ETH_USDC_PERP",
        //         "userId": 1813870
        //     }
        //
        const marketId = this.safeString(income, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const amount = this.safeNumber(income, 'quantity');
        const id = this.safeString(income, 'userId');
        const timestamp = this.parse8601(this.safeString(income, 'intervalEndTimestamp'));
        const rate = this.safeNumber(income, 'fundingRate');
        return {
            'info': income,
            'symbol': symbol,
            'code': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': id,
            'amount': amount,
            'rate': rate,
        };
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + path;
        let url = this.urls['api'][api];
        const sortedParams = Array.isArray(params) ? params : this.keysort(params);
        if (api === 'private') {
            this.checkRequiredCredentials();
            const ts = this.nonce().toString();
            const recvWindow = this.safeString2(this.options, 'recvWindow', 'X-Window', '5000');
            const optionInstructions = this.safeDict(this.options, 'instructions', {});
            const optionPathInstructions = this.safeDict(optionInstructions, path, {});
            const instruction = this.safeString(optionPathInstructions, method, '');
            let payload = '';
            if ((path === 'api/v1/orders') && (method === 'POST')) { // for createOrders
                payload = this.generateBatchPayload(sortedParams, ts, recvWindow, instruction);
            }
            else {
                let queryString = this.urlencode(sortedParams);
                if (queryString.length > 0) {
                    queryString += '&';
                }
                payload = 'instruction=' + instruction + '&' + queryString + 'timestamp=' + ts + '&window=' + recvWindow;
            }
            const secretBytes = this.base64ToBinary(this.secret);
            const seed = this.arraySlice(secretBytes, 0, 32);
            const signature = crypto.eddsa(this.encode(payload), seed, ed25519.ed25519);
            headers = {
                'X-Timestamp': ts,
                'X-Window': recvWindow,
                'X-API-Key': this.apiKey,
                'X-Signature': signature,
                'X-Broker-Id': '1400',
            };
            if (method !== 'GET') {
                body = this.json(sortedParams);
                headers['Content-Type'] = 'application/json';
            }
        }
        if (method === 'GET') {
            const query = this.urlencode(sortedParams);
            if (query.length !== 0) {
                endpoint += '?' + query;
            }
        }
        url += endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    generateBatchPayload(params, ts, recvWindow, instruction) {
        let payload = '';
        for (let i = 0; i < params.length; i++) {
            const order = this.safeDict(params, i, {});
            const sortedOrder = this.keysort(order);
            const orderQuery = this.urlencode(sortedOrder);
            payload += 'instruction=' + instruction + '&' + orderQuery + '&';
            if (i === (params.length - 1)) {
                payload += 'timestamp=' + ts + '&window=' + recvWindow;
            }
        }
        return payload;
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        // {"code":"INVALID_ORDER","message":"Invalid order"}
        // {"code":"INVALID_CLIENT_REQUEST","message":"Must specify both `triggerPrice` and `triggerQuantity` or neither"}
        //
        const errorCode = this.safeString(response, 'code');
        const message = this.safeString(response, 'message');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

exports["default"] = backpack;
