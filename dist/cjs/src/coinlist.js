'use strict';

var coinlist$1 = require('./abstract/coinlist.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
/**
 * @class coinlist
 * @augments Exchange
 */
class coinlist extends coinlist$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinlist',
            'name': 'Coinlist',
            'countries': ['US'],
            'version': 'v1',
            'rateLimit': 300,
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
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'deposit': false,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': true,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': true,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
                'ws': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '30m': '30m',
            },
            'urls': {
                'logo': 'https://github-production-user-asset-6210df.s3.amazonaws.com/1294454/281108917-eff2ae1d-ce8a-4b2a-950d-8678b12da965.jpg',
                'api': {
                    'public': 'https://trade-api.coinlist.co',
                    'private': 'https://trade-api.coinlist.co',
                },
                'www': 'https://coinlist.co',
                'doc': [
                    'https://trade-docs.coinlist.co',
                ],
                'fees': 'https://coinlist.co/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/symbols': 1,
                        'v1/symbols/summary': 1,
                        'v1/symbols/{symbol}': 1,
                        'v1/symbols/{symbol}/summary': 1,
                        'v1/symbols/{symbol}/book': 1,
                        'v1/symbols/{symbol}/quote': 1,
                        'v1/symbols/{symbol}/candles': 1,
                        'v1/symbols/{symbol}/auctions': 1,
                        'v1/symbols/{symbol}/auctions/{auction_code}': 1,
                        'v1/time': 1,
                        'v1/assets': 1,
                        'v1/leaderboard': 1,
                        'v1/affiliate/{competition_code}': 1,
                        'v1/competition/{competition_id}': 1,
                        'v1/symbols/{symbol}/funding': 1,
                    },
                },
                'private': {
                    'get': {
                        'v1/fees': 1,
                        'v1/accounts': 1,
                        'v1/accounts/{trader_id}': 1,
                        'v1/accounts/{trader_id}/alias': 1,
                        'v1/accounts/{trader_id}/ledger': 1,
                        'v1/accounts/{trader_id}/wallets': 1,
                        'v1/accounts/{trader_id}/wallet-ledger': 1,
                        'v1/accounts/{trader_id}/ledger-summary': 1,
                        'v1/keys': 1,
                        'v1/fills': 1,
                        'v1/orders': 1,
                        'v1/orders/{order_id}': 1,
                        'v1/reports': 1,
                        'v1/balances': 1,
                        'v1/transfers': 1,
                        'v1/user': 1,
                        'v1/credits': 1,
                        'v1/positions': 1,
                        'v1/accounts/{trader_id}/competitions': 1,
                        'v1/closedPositions': 1,
                    },
                    'post': {
                        'v1/keys': 1,
                        'v1/orders': 1,
                        'v1/orders/cancel-all-after': 1,
                        'v1/reports': 1,
                        'v1/transfers/to-wallet': 1,
                        'v1/transfers/from-wallet': 1,
                        'v1/transfers/internal-transfer': 1,
                        'v1/transfers/withdrawal-request': 1,
                        'v1/orders/bulk': 1,
                        'v1/accounts/{trader_id}/competitions': 1,
                        'v1/accounts/{trader_id}/create-competition': 1,
                    },
                    'patch': {
                        'v1/orders/{order_id}': 1,
                        'v1/orders/bulk': 1, // not unified
                    },
                    'put': {
                        'v1/accounts/{trader_id}/alias': 1,
                    },
                    'delete': {
                        'v1/keys/{key}': 1,
                        'v1/orders': 1,
                        'v1/orders/{order_id}': 1,
                        'v1/orders/bulk': 1,
                    },
                },
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': true,
                        },
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': true,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': true,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 100000,
                        'untilDays': 100000,
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
                        'limit': 500,
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
                        'daysBackCanceled': undefined,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 300,
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
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0045'),
                    'maker': this.parseNumber('0.0025'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0045')],
                            [this.parseNumber('20000'), this.parseNumber('0.003')],
                            [this.parseNumber('50000'), this.parseNumber('0.0025')],
                            [this.parseNumber('100000'), this.parseNumber('0.002')],
                            [this.parseNumber('500000'), this.parseNumber('0.0018')],
                            [this.parseNumber('750000'), this.parseNumber('0.0018')],
                            [this.parseNumber('1000000'), this.parseNumber('0.0016')],
                            [this.parseNumber('2500000'), this.parseNumber('0.0013')],
                            [this.parseNumber('5000000'), this.parseNumber('0.0012')],
                            [this.parseNumber('10000000'), this.parseNumber('0.001')],
                            [this.parseNumber('50000000'), this.parseNumber('0.0005')],
                            [this.parseNumber('100000000'), this.parseNumber('0.0005')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.0025')],
                            [this.parseNumber('20000'), this.parseNumber('0.0025')],
                            [this.parseNumber('50000'), this.parseNumber('0.0025')],
                            [this.parseNumber('100000'), this.parseNumber('0.002')],
                            [this.parseNumber('500000'), this.parseNumber('0.0015')],
                            [this.parseNumber('750000'), this.parseNumber('0.0012')],
                            [this.parseNumber('1000000'), this.parseNumber('0.001')],
                            [this.parseNumber('2500000'), this.parseNumber('0.0008')],
                            [this.parseNumber('5000000'), this.parseNumber('0.0007')],
                            [this.parseNumber('10000000'), this.parseNumber('0.0006')],
                            [this.parseNumber('50000000'), this.parseNumber('0.0000')],
                            [this.parseNumber('100000000'), this.parseNumber('0.00')],
                        ],
                    },
                },
            },
            'precisionMode': number.TICK_SIZE,
            // exchange-specific options
            'options': {
                'accountsByType': {
                    'CoinList Pro': 'trading',
                    'CoinList Pro trading account': 'trading',
                    'Pro': 'trading',
                    'pro': 'trading',
                    'trade': 'trading',
                    'trading': 'trading',
                    'CoinList': 'funding',
                    'CoinList wallet': 'funding',
                    'Wallet': 'funding',
                    'wallet': 'funding',
                    'fund': 'funding',
                    'funding': 'funding',
                },
            },
            'exceptions': {
                // https://trade-docs.coinlist.co/?javascript--nodejs#message-codes
                'exact': {
                    'AUTH_SIG_INVALID': errors.AuthenticationError,
                    'DENIED_MAINTENANCE': errors.OnMaintenance,
                    'ORDER_REJECT_BAD_STATUS': errors.InvalidOrder,
                    'ORDER_REJECT_INVALID_POST_ONLY': errors.InvalidOrder,
                    'ORDER_REJECT_INVALID_CLOSE_ONLY': errors.InvalidOrder,
                    'ORDER_REJECT_POST_ONLY_REQUIRED': errors.InvalidOrder,
                    'ORDER_REJECT_FROZEN_ORDER': errors.InvalidOrder,
                    'ORDER_REJECT_LIMIT_PRICE_PROTECTION_VIOLATION': errors.InvalidOrder,
                    'ORDER_REJECT_CLOSED': errors.NotSupported,
                    'ORDER_REJECT_MAX_ORDERS': errors.BadRequest,
                    'ORDER_REJECT_NOT_FOUND': errors.OrderNotFound,
                    'ORDER_REJECT_PARSE_ERROR': errors.BadRequest,
                    'ORDER_REJECT_PRICE_INVALID': errors.InvalidOrder,
                    'ORDER_REJECT_QUANTITY_ZERO': errors.InvalidOrder,
                    'ORDER_REJECT_TOKEN_LIMIT': errors.InsufficientFunds,
                    'ORDER_REJECT_TOKEN_LIMIT_OTHER': errors.InvalidOrder,
                    'ORDER_REJECT_SELF_TRADE': errors.InvalidOrder,
                    'ORDER_VALIDATE_BAD_SIZE_ALIGNMENT': errors.InvalidOrder,
                    'ORDER_VALIDATE_BAD_TICK_ALIGNMENT': errors.InvalidOrder,
                    'ORDER_VALIDATE_SYMBOL_NOT_FOUND': errors.BadSymbol,
                    'TRANSFERS_WITHDRAWAL_REQUEST_TOO_LARGE': errors.InsufficientFunds,
                    'WITHDRAWAL_REQUEST_NOT_ALLOWED': errors.PermissionDenied, // {"message":"Withdrawal from CoinList not allowed for trader.","message_code":"WITHDRAWAL_REQUEST_NOT_ALLOWED","message_details":{"asset":"USDT","amount":"5","trader_id":"9c6f737e-a829-4843-87b1-b1ce86f2853b","destination_address":"0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee"}}
                },
                'broad': {
                    'A destinationAddress is required for non-USD withdrawals': errors.InvalidAddress,
                    'fails to match the JsonSchema date-time format pattern': errors.BadRequest,
                    'is required': errors.ArgumentsRequired,
                    'must be a string': errors.BadRequest,
                    'must be a valid GUID': errors.BadRequest,
                    'must be greater than or equal to': errors.BadRequest,
                    'must be less than or equal to': errors.BadRequest,
                    'must be one of': errors.BadRequest,
                    'Symbol not found': errors.BadSymbol, // {"message":"Symbol not found: {symbol}"}
                },
            },
        });
    }
    calculateRateLimiterCost(api, method, path, params, config = {}) {
        if (Array.isArray(params)) {
            const length = params.length;
            return Math.ceil(length / 2);
        }
        return 1;
    }
    /**
     * @method
     * @name coinlist#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetV1Time(params);
        //
        //     {
        //         "epoch": 1698087996.039,
        //         "iso": "2023-10-23T19:06:36.039Z"
        //     }
        //
        const string = this.safeString(response, 'iso');
        return this.parse8601(string);
    }
    /**
     * @method
     * @name coinlist#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-supported-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetV1Assets(params);
        //
        //     {
        //         "assets": [
        //             {
        //                 "asset": "AAVE",
        //                 "index_code": ".AAVEUSD",
        //                 "decimal_places": 18,
        //                 "min_withdrawal": "1.0000",
        //                 "is_transferable": true,
        //                 "is_visible": true
        //             },
        //             {
        //                 "asset": "ALGO",
        //                 "index_code": ".ALGOUSD",
        //                 "decimal_places": 6,
        //                 "min_withdrawal": "1.0000",
        //                 "is_transferable": true,
        //                 "is_visible": true
        //             }
        //         ]
        //     }
        //
        const currencies = this.safeValue(response, 'assets', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString(currency, 'asset');
            const code = this.safeCurrencyCode(id);
            const isTransferable = this.safeBool(currency, 'is_transferable', false);
            const withdrawEnabled = isTransferable;
            const depositEnabled = isTransferable;
            const active = isTransferable;
            const decimalPlaces = this.safeString(currency, 'decimal_places');
            const precision = this.parseNumber(this.parsePrecision(decimalPlaces));
            const minWithdrawal = this.safeString(currency, 'min_withdrawal');
            result[code] = {
                'id': id,
                'code': code,
                'name': code,
                'info': currency,
                'active': active,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': minWithdrawal, 'max': undefined },
                },
                'networks': {},
                'type': 'crypto',
            };
        }
        return result;
    }
    /**
     * @method
     * @name coinlist#fetchMarkets
     * @description retrieves data on all markets for coinlist
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetV1Symbols(params);
        //
        //     {
        //         "symbols": [
        //             {
        //                 "symbol": "CQT-USDT", // spot
        //                 "base_currency": "CQT",
        //                 "is_trader_geofenced": false,
        //                 "list_time": "2021-06-15T00:00:00.000Z",
        //                 "type": "spot",
        //                 "series_code": "CQT-USDT-SPOT",
        //                 "long_name": "Covalent",
        //                 "asset_class": "CRYPTO",
        //                 "minimum_price_increment": "0.0001",
        //                 "minimum_size_increment": "0.0001",
        //                 "quote_currency": "USDT",
        //                 "index_code": null,
        //                 "price_band_threshold_market": "0.05",
        //                 "price_band_threshold_limit": "0.25",
        //                 "last_price": "0.12160000",
        //                 "fair_price": "0.12300000",
        //                 "index_price": null
        //             },
        //         ]
        //     }
        //
        const markets = this.safeValue(response, 'symbols', []);
        return this.parseMarkets(markets);
    }
    parseMarket(market) {
        // perp
        //   {
        //       "symbol":"BTC-PERP",
        //       "base_currency":"BTC",
        //       "is_trader_geofenced":false,
        //       "expiry_name":null,
        //       "expiry_time":null,
        //       "list_time":"2024-09-16T00:00:00.000Z",
        //       "type":"perp-swap",
        //       "series_code":"BTC",
        //       "long_name":"Bitcoin",
        //       "asset_class":"CRYPTO",
        //       "minimum_price_increment":"0.01",
        //       "minimum_size_increment":"0.0001",
        //       "quote_currency":"USDT",
        //       "multiplier":"1",
        //       "contract_frequency":"FGHJKMNQUVXZ",
        //       "index_code":".BTC-USDT",
        //       "price_band_threshold_market":"0.05",
        //       "price_band_threshold_limit":"0.25",
        //       "maintenance_initial_ratio":"0.500000000000000000",
        //       "liquidation_initial_ratio":"0.500000000000000000",
        //       "last_price":"75881.36000000",
        //       "fair_price":"76256.00000000",
        //       "index_price":"77609.90000000",
        //       "mark_price":"76237.75000000",
        //       "mark_price_dollarizer":"0.99950000",
        //       "funding_interval":{
        //          "hours":"8"
        //       },
        //       "funding_rate_index_code":".BTC-USDT-FR8H",
        //       "initial_margin_base":"0.200000000000000000",
        //       "initial_margin_per_contract":"0.160000000000000000",
        //       "position_limit":"5.0000"
        //   }
        // spot
        //    {
        //        "symbol": "CQT-USDT", // spot
        //        "base_currency": "CQT",
        //        "is_trader_geofenced": false,
        //        "list_time": "2021-06-15T00:00:00.000Z",
        //        "type": "spot",
        //        "series_code": "CQT-USDT-SPOT",
        //        "long_name": "Covalent",
        //        "asset_class": "CRYPTO",
        //        "minimum_price_increment": "0.0001",
        //        "minimum_size_increment": "0.0001",
        //        "quote_currency": "USDT",
        //        "index_code": null,
        //        "price_band_threshold_market": "0.05",
        //        "price_band_threshold_limit": "0.25",
        //        "last_price": "0.12160000",
        //        "fair_price": "0.12300000",
        //        "index_price": null
        //    }
        const isSwap = this.safeString(market, 'type') === 'perp-swap';
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString(market, 'base_currency');
        const quoteId = this.safeString(market, 'quote_currency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const amountPrecision = this.safeString(market, 'minimum_size_increment');
        const pricePrecision = this.safeString(market, 'minimum_price_increment');
        const created = this.safeString(market, 'list_time');
        let settledId = undefined;
        let settled = undefined;
        let linear = undefined;
        let inverse = undefined;
        let contractSize = undefined;
        let symbol = base + '/' + quote;
        if (isSwap) {
            contractSize = this.parseNumber('1');
            linear = true;
            inverse = false;
            settledId = quoteId;
            settled = quote;
            symbol = symbol + ':' + quote;
        }
        const type = isSwap ? 'swap' : 'spot';
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settled,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settledId,
            'type': type,
            'spot': !isSwap,
            'margin': false,
            'swap': isSwap,
            'future': false,
            'option': false,
            'active': true,
            'contract': isSwap,
            'linear': linear,
            'inverse': inverse,
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber(amountPrecision),
                'price': this.parseNumber(pricePrecision),
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
            'created': this.parse8601(created),
            'info': market,
        };
    }
    /**
     * @method
     * @name coinlist#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-symbol-summaries
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const tickers = await this.publicGetV1SymbolsSummary(this.extend(request, params));
        //
        //     {
        //         "MATIC-USD": {
        //             "type":"spot",
        //             "last_price":"0.60990000",
        //             "lowest_ask":"0.61190000",
        //             "highest_bid":"0.60790000",
        //             "last_trade": {
        //                 "price":"0.60000000",
        //                 "volume":"2.0000",
        //                 "imbalance":"198.0000",
        //                 "logicalTime":"2023-10-22T23:02:25.000Z",
        //                 "auctionCode":"MATIC-USD-2023-10-22T23:02:25.000Z"
        //         },
        //             "volume_base_24h":"34.0555",
        //             "volume_quote_24h":"19.9282",
        //             "price_change_percent_24h":"7.50925436",
        //             "highest_price_24h":"0.68560000",
        //             "lowest_price_24h":"0.55500000"
        //         },
        //     }
        //
        return this.parseTickers(tickers, symbols, params);
    }
    /**
     * @method
     * @name coinlist#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-market-summary
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
        const ticker = await this.publicGetV1SymbolsSymbolSummary(this.extend(request, params));
        //
        //     {
        //         "type":"spot",
        //         "last_price":"31125.00000000",
        //         "lowest_ask":"31349.99000000",
        //         "highest_bid":"30900.00000000",
        //         "last_trade": {
        //             "price":"31000.00000000",
        //             "volume":"0.0003",
        //             "imbalance":"0.0000",
        //             "logicalTime":"2023-10-23T16:57:15.000Z",
        //             "auctionCode":"BTC-USDT-2023-10-23T16:57:15.000Z"
        //         },
        //         "volume_base_24h":"0.3752",
        //         "volume_quote_24h":"11382.7181",
        //         "price_change_percent_24h":"3.66264694",
        //         "highest_price_24h":"31225.12000000",
        //         "lowest_price_24h":"29792.81000000"
        //     }
        //
        return this.parseTicker(ticker, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "type":"spot",
        //         "last_price":"0.60990000",
        //         "lowest_ask":"0.61190000",
        //         "highest_bid":"0.60790000",
        //         "last_trade": {
        //             "price":"0.60000000",
        //             "volume":"2.0000",
        //             "imbalance":"198.0000",
        //             "logicalTime":"2023-10-22T23:02:25.000Z",
        //             "auctionCode":"MATIC-USD-2023-10-22T23:02:25.000Z"
        //          },
        //         "volume_base_24h":"34.0555",
        //         "volume_quote_24h":"19.9282",
        //         "price_change_percent_24h":"7.50925436",
        //         "highest_price_24h":"0.68560000",
        //         "lowest_price_24h":"0.55500000"
        //     }
        //
        const lastTrade = this.safeValue(ticker, 'last_trade', {});
        const timestamp = this.parse8601(this.safeString(lastTrade, 'logicalTime'));
        const bid = this.safeString(ticker, 'highest_bid');
        const ask = this.safeString(ticker, 'lowest_ask');
        const baseVolume = this.safeString(ticker, 'volume_base_24h');
        const quoteVolume = this.safeString(ticker, 'volume_quote_24h');
        const high = this.safeString(ticker, 'highest_price_24h');
        const low = this.safeString(ticker, 'lowest_price_24h');
        const close = this.safeString(ticker, 'last_price');
        const changePcnt = this.safeString(ticker, 'price_change_percent_24h');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'open': undefined,
            'high': high,
            'low': low,
            'close': close,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': changePcnt,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name coinlist#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-order-book-level-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1SymbolsSymbolBook(this.extend(request, params));
        //
        //     {
        //         "bids": [
        //             [ "30900.00000000", "0.0001" ],
        //             [ "30664.21000000", "0.0172" ],
        //             [ "30664.20000000", "0.0906" ],
        //         ],
        //         "asks": [
        //             [ "31349.99000000", "0.0003" ],
        //             [ "31350.00000000", "0.0023" ],
        //             [ "31359.33000000", "0.0583" ],
        //         ],
        //         "after_auction_code": "BTC-USDT-2023-10-23T18:40:51.000Z",
        //         "call_time": "2023-10-23T18:40:51.068Z",
        //         "logical_time": "2023-10-23T18:40:51.000Z"
        //     }
        //
        const logical_time = this.parse8601(this.safeString(response, 'logical_time'));
        const orderbook = this.parseOrderBook(response, symbol, logical_time);
        orderbook['nonce'] = undefined;
        return orderbook;
    }
    /**
     * @method
     * @name coinlist#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const granularity = this.safeString(this.timeframes, timeframe);
        const request = {
            'symbol': market['id'],
            'granularity': granularity,
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
            if (limit !== undefined) {
                const duration = this.parseTimeframe(timeframe) * 1000;
                request['end_time'] = this.iso8601(this.sum(since, duration * (limit)));
            }
            else {
                request['end_time'] = this.iso8601(this.milliseconds());
            }
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_time'] = this.iso8601(until);
        }
        const response = await this.publicGetV1SymbolsSymbolCandles(this.extend(request, params));
        //
        //     {
        //         "candles": [
        //             [
        //                 "2023-10-17T15:00:00.000Z",
        //                 "28522.96000000",
        //                 "28522.96000000",
        //                 "28522.96000000",
        //                 "28522.96000000",
        //                 "0.1881",
        //                 null
        //             ],
        //             [
        //                 "2023-10-17T15:30:00.000Z",
        //                 "28582.64000000",
        //                 "28582.64000000",
        //                 "28582.64000000",
        //                 "28582.64000000",
        //                 "0.0050",
        //                 null
        //             ]
        //         ]
        //     }
        //
        const candles = this.safeList(response, 'candles', []);
        return this.parseOHLCVs(candles, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         "2023-10-17T15:30:00.000Z",
        //         "28582.64000000",
        //         "28582.64000000",
        //         "28582.64000000",
        //         "28582.64000000",
        //         "0.0050",
        //         null
        //     ]
        //
        return [
            this.parse8601(this.safeString(ohlcv, 0)),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 5),
        ];
    }
    /**
     * @method
     * @name coinlist#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-auctions
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['count'] = Math.min(limit, 500);
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_time'] = this.iso8601(until);
        }
        const response = await this.publicGetV1SymbolsSymbolAuctions(this.extend(request, params));
        //
        //     {
        //         "auctions": [
        //             {
        //                 "symbol":"BTC-USDT",
        //                 "auction_code":"BTC-USDT-2023-10-01T08:05:56.000Z",
        //                 "price":"27241.53000000",
        //                 "volume":"0.0052",
        //                 "imbalance":"-1.0983",
        //                 "logical_time":"2023-10-01T08:05:56.000Z",
        //                 "call_time":"2023-10-01T08:05:56.068Z"
        //             },
        //             {
        //                 "symbol":"BTC-USDT",
        //                 "auction_code":"BTC-USDT-2023-10-01T08:09:09.000Z",
        //                 "price":"27236.83000000",
        //                 "volume":"0.0283",
        //                 "imbalance":"-1.0754",
        //                 "logical_time":"2023-10-01T08:09:09.000Z",
        //                 "call_time":"2023-10-01T08:09:09.078Z"
        //             }
        //         ]
        //     }
        //
        const auctions = this.safeList(response, 'auctions', []);
        return this.parseTrades(auctions, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //     {
        //         "symbol": "BTC-USDT",
        //         "auction_code": "BTC-USDT-2023-10-01T08:05:56.000Z",
        //         "price": "27241.53000000",
        //         "volume": "0.0052",
        //         "imbalance": "-1.0983",
        //         "logical_time": "2023-10-01T08:05:56.000Z",
        //         "call_time": "2023-10-01T08:05:56.068Z"
        //     }
        //
        // fetchMyTrades
        //     {
        //         "symbol": "ETH-USDT",
        //         "auction_code": "ETH-USDT-2023-10-20T13:22:14.000Z",
        //         "order_id": "83ed365f-497d-433b-96c1-9d08c1a12842",
        //         "quantity": "0.0008",
        //         "price": "1615.24000000",
        //         "fee": "0.005815",
        //         "fee_type": "taker",
        //         "fee_currency": "USDT",
        //         "logical_time": "2023-10-20T13:22:14.000Z"
        //     }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const id = this.safeString(trade, 'auction_code');
        const timestamp = this.parse8601(this.safeString(trade, 'logical_time'));
        const priceString = this.safeString(trade, 'price');
        let amountString = this.safeString2(trade, 'volume', 'quantity');
        const order = this.safeString(trade, 'order_id');
        let fee = undefined;
        let side = undefined;
        const feeCost = this.safeString(trade, 'fee');
        if (feeCost !== undefined) {
            // only in fetchMyTrades
            const amountIsNegative = Precise["default"].stringLt(amountString, '0');
            if (amountIsNegative) {
                side = 'sell';
                amountString = Precise["default"].stringNeg(amountString);
            }
            else {
                side = 'buy';
            }
            fee = {
                'cost': feeCost,
                'currency': this.safeString(trade, 'fee_currency'),
            };
        }
        else {
            const imbalance = this.safeString(trade, 'imbalance');
            if (Precise["default"].stringLt(imbalance, '0')) {
                side = 'buy';
            }
            else {
                side = 'sell';
            }
        }
        const takerOrMaker = this.safeString(trade, 'fee_type');
        return this.safeTrade({
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name coinlist#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetV1Fees(params);
        //
        //     {
        //         fees_by_symbols: {
        //             'BTC-USD,BTC-USDT,ETH-USD,ETH-USDT,ETH-BTC,AAVE-USD,AAVE-USDT,ALGO-USD,ALGO-USDT,AVAX-USD,AVAX-USDT,BICO-USD,BICO-USDT,BLD-USD,BLD-USDT,BTRST-USDT,BZZ-USDT,CELO-USD,CELO-BTC,CFG-USD,CFG-USDT,CLV-USDT,COMP-USD,COMP-USDT,CYBER-USDT,CQT-USDT,CSPR-USD,CSPR-USDT,CUSD-USD,CUSD-USDC,DOGE-USD,DOGE-USDT,DOT-USD,DOT-USDT,EFI-USDT,FIL-USD,FIL-USDT,FLOW-USD,FLOW-USDT,GAL-USD,GAL-USDT,GODS-USDT,GOG-USDT,HMT-USD,HMT-USDT,ICP-USD,ICP-USDT,IMX-USD,IMX-USDT,LINK-USD,LINK-USDT,MATIC-USD,MATIC-USDT,MINA-USD,MINA-USDT,MKR-USD,MKR-USDT,NEON-USDT,NYM-USD,NYM-USDT,OCEAN-USD,OXT-USD,ROSE-USD,ROSE-USDT,SKL-USD,SKL-USDT,SOL-USD,SOL-USDT,STX-USDT,SUI-USDT,T-USDT,UNI-USD,UNI-USDT,USDT-USD,VEGA-USDT,WAXL-USD,WAXL-USDT,WBTC-BTC,WCFG-USD,WCFG-USDT,XTZ-USD': {
        //                 base: {
        //                     fees: { maker: '0', taker: '0.0045', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_1: {
        //                     fees: { maker: '0', taker: '0.003', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_2: {
        //                     fees: { maker: '0', taker: '0.0025', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_3: {
        //                     fees: { maker: '0', taker: '0.002', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_4: {
        //                     fees: { maker: '0', taker: '0.0018', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_5: {
        //                     fees: { maker: '0', taker: '0.0018', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_6: {
        //                     fees: { maker: '0', taker: '0.0016', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_7: {
        //                     fees: { maker: '0', taker: '0.0013', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_8: {
        //                     fees: { maker: '0', taker: '0.0012', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_9: {
        //                     fees: { maker: '0', taker: '0.001', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 }
        //                 volume_tier_10: {
        //                     fees: { maker: '0', taker: '0.0005', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //                 volume_tier_11: {
        //                     fees: { maker: '0', taker: '0.0005', liquidation: '0' },
        //                     floors: { maker: null, taker: null }
        //                 },
        //             }
        //         }
        //     }
        //
        const fees = this.safeValue(response, 'fees_by_symbols', {});
        const result = {};
        const groupsOfSymbols = Object.keys(fees);
        for (let i = 0; i < groupsOfSymbols.length; i++) {
            const group = groupsOfSymbols[i];
            const feeTiers = this.safeValue(fees, group, {});
            const tiers = this.parseFeeTiers(feeTiers);
            const firstTier = this.safeValue(feeTiers, 'base', {});
            const firstTierFees = this.safeValue(firstTier, 'fees', {});
            const ids = group.split(',');
            for (let j = 0; j < ids.length; j++) {
                const id = ids[j];
                const market = this.safeMarket(id);
                const symbol = market['symbol'];
                const info = {};
                info[group] = feeTiers;
                result[symbol] = {
                    'info': info,
                    'symbol': symbol,
                    'maker': this.safeNumber(firstTierFees, 'maker'),
                    'taker': this.safeNumber(firstTierFees, 'taker'),
                    'percentage': true,
                    'tierBased': true,
                    'tiers': tiers,
                };
            }
        }
        return result;
    }
    parseFeeTiers(feeTiers, market = undefined) {
        //
        //     base: {
        //         fees: { maker: '0', taker: '0.0045', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_1: {
        //         fees: { maker: '0', taker: '0.003', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_2: {
        //         fees: { maker: '0', taker: '0.0025', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_3: {
        //         fees: { maker: '0', taker: '0.002', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_4: {
        //         fees: { maker: '0', taker: '0.0018', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_5: {
        //         fees: { maker: '0', taker: '0.0018', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_6: {
        //         fees: { maker: '0', taker: '0.0016', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_7: {
        //         fees: { maker: '0', taker: '0.0013', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_8: {
        //         fees: { maker: '0', taker: '0.0012', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_9: {
        //         fees: { maker: '0', taker: '0.001', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     }
        //     volume_tier_10: {
        //         fees: { maker: '0', taker: '0.0005', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //     volume_tier_11: {
        //         fees: { maker: '0', taker: '0.0005', liquidation: '0' },
        //         floors: { maker: null, taker: null }
        //     },
        //
        let takerFees = [];
        let makerFees = [];
        const keys = Object.keys(feeTiers);
        const keysLength = keys.length;
        if (keysLength > 0) {
            for (let i = 0; i < keysLength; i++) {
                const key = keys[i];
                const tier = this.safeValue(feeTiers, key, {});
                const tierFees = this.safeValue(tier, 'fees', {});
                const taker = this.safeString(tierFees, 'taker');
                const maker = this.safeString(tierFees, 'maker');
                makerFees.push([undefined, this.parseNumber(maker)]);
                takerFees.push([undefined, this.parseNumber(taker)]);
            }
            takerFees = this.sortBy(takerFees, 1, true);
            makerFees = this.sortBy(makerFees, 1, true);
            const firstTier = this.safeDict(takerFees, 0, []);
            const exchangeFees = this.safeDict(this, 'fees', {});
            const exchangeFeesTrading = this.safeDict(exchangeFees, 'trading', {});
            const exchangeFeesTradingTiers = this.safeDict(exchangeFeesTrading, 'tiers', {});
            const exchangeFeesTradingTiersTaker = this.safeList(exchangeFeesTradingTiers, 'taker', []);
            const exchangeFeesTradingTiersMaker = this.safeList(exchangeFeesTradingTiers, 'maker', []);
            const exchangeFeesTradingTiersTakerLength = exchangeFeesTradingTiersTaker.length;
            const firstTierLength = firstTier.length;
            if ((keysLength === exchangeFeesTradingTiersTakerLength) && (firstTierLength > 0)) {
                for (let i = 0; i < keysLength; i++) {
                    takerFees[i][0] = exchangeFeesTradingTiersTaker[i][0];
                    makerFees[i][0] = exchangeFeesTradingTiersMaker[i][0];
                }
            }
        }
        return {
            'maker': makerFees,
            'taker': takerFees,
        };
    }
    /**
     * @method
     * @name coinlist#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetV1Accounts(params);
        //
        //     {
        //         "accounts": [
        //             {
        //                 "trader_id": "b18507ce-7d55-4bf1-b12a-0ccca5b90936",
        //                 "name": "string"
        //             }
        //         ]
        //     }
        //
        const accounts = this.safeValue(response, 'accounts', []);
        return this.parseAccounts(accounts, params);
    }
    parseAccount(account) {
        //
        //     {
        //         "trader_id": "b18507ce-7d55-4bf1-b12a-0ccca5b90936",
        //         "name": "string"
        //     }
        //
        return {
            'id': this.safeString(account, 'trader_id'),
            'type': 'trading',
            'code': undefined,
            'info': account,
        };
    }
    /**
     * @method
     * @name coinlist#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetV1Balances(params);
        return this.parseBalance(response);
    }
    parseBalance(response) {
        //
        //     {
        //         "asset_balances": {
        //             "BTC": "0.00308696",
        //             "ETH": "20.000000000000000000"
        //         },
        //         "asset_holds": {
        //             "BTC": "0.00000000",
        //             "ETH": "1.000000000000000000"
        //         },
        //         "net_liquidation_value_usd": "string"
        //     }
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const totalBalances = this.safeValue(response, 'asset_balances', {});
        const usedBalances = this.safeValue(response, 'asset_holds', {});
        const currencyIds = Object.keys(totalBalances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(totalBalances, currencyId);
            account['used'] = this.safeString(usedBalances, currencyId, '0');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name coinlist#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
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
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_time'] = this.iso8601(until);
        }
        const response = await this.privateGetV1Fills(this.extend(request, params));
        //
        //     {
        //         "fills": [
        //             {
        //                 "symbol": "ETH-USDT",
        //                 "auction_code": "ETH-USDT-2023-10-20T13:16:30.000Z",
        //                 "order_id": "39911d5f-c789-4a7d-ad34-820a804d1da6",
        //                 "quantity": "-0.0009",
        //                 "price": "1608.83000000",
        //                 "fee": "0.006516",
        //                 "fee_type": "taker",
        //                 "fee_currency": "USDT",
        //                 "logical_time": "2023-10-20T13:16:30.000Z"
        //             },
        //             {
        //                 "symbol": "ETH-USDT",
        //                 "auction_code": "ETH-USDT-2023-10-20T13:22:14.000Z",
        //                 "order_id": "83ed365f-497d-433b-96c1-9d08c1a12842",
        //                 "quantity": "0.0008",
        //                 "price": "1615.24000000",
        //                 "fee": "0.005815",
        //                 "fee_type": "taker",
        //                 "fee_currency": "USDT",
        //                 "logical_time": "2023-10-20T13:22:14.000Z"
        //             },
        //         ]
        //     }
        //
        const fills = this.safeList(response, 'fills', []);
        return this.parseTrades(fills, market, since, limit);
    }
    /**
     * @method
     * @name coinlist#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-fills
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'order_id': id,
        };
        return await this.fetchMyTrades(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name coinlist#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {string|string[]} [params.status] the status of the order - 'accepted', 'done', 'canceled', 'rejected', 'pending' (default [ 'accepted', 'done', 'canceled', 'rejected', 'pending' ])
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let status = this.safeString(params, 'status');
        if (status === undefined) {
            status = ['accepted', 'done', 'canceled', 'rejected', 'pending'];
        }
        const request = {
            'status': status,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_time'] = this.iso8601(until);
        }
        const response = await this.privateGetV1Orders(this.extend(request, params));
        //
        //     {
        //         "orders":[
        //             {
        //                 "order_id":"913ea6e7-9fc9-43fb-9db1-f195d3baa93f",
        //                 "price":"35800.00000000",
        //                 "stop_price":null,
        //                 "cost":"0.00000000",
        //                 "fill_fees":"0.00000000",
        //                 "trader_id":"9c6f737e-a829-4843-87b1-b1ce86f2853b",
        //                 "status":"accepted",
        //                 "epoch_timestamp":"2023-10-26T08:20:56.307Z",
        //                 "origin":"web",
        //                 "self_trade_prevention":null,
        //                 "client_id":null,
        //                 "created_at":"2023-10-26T08:20:56.307Z",
        //                 "symbol":"BTC-USDT",
        //                 "size":"0.0003",
        //                 "side":"sell",
        //                 "type":"limit",
        //                 "post_only":false,
        //                 "size_filled":"0.0000"
        //             }
        //         ]
        //     }
        //
        const orders = this.safeList(response, 'orders', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name coinlist#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-specific-order-by-id
     * @param {int|string} id order id
     * @param {string} symbol not used by coinlist fetchOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetV1OrdersOrderId(this.extend(request, params));
        //
        //     {
        //         "order_id": "93101167-9065-4b9c-b98b-5d789a3ed9fe",
        //         "client_id": "string",
        //         "symbol": "string",
        //         "type": "market",
        //         "side": "buy",
        //         "size": "string",
        //         "price": "string",
        //         "stop_price": "string",
        //         "stop_trigger": "last",
        //         "self_trade_prevention": "keep-newest",
        //         "average_fill_price": "string",
        //         "fill_fees": "string",
        //         "size_filled": "string",
        //         "created_at": "2019-08-24T14:15:22Z",
        //         "epoch_timestamp": "2019-08-24T14:15:22Z",
        //         "post_only": true,
        //         "peg_price_type": "trailing-stop",
        //         "peg_offset_value": "string",
        //         "origin": "web",
        //         "status": "pending"
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name coinlist#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'status': 'accepted',
        };
        return this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name coinlist#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of closed order structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'status': 'done',
        };
        return this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name coinlist#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of canceled order structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'status': 'canceled',
        };
        return this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name coinlist#cancelAllOrders
     * @description cancel open orders of market
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#cancel-all-orders
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateDeleteV1Orders(this.extend(request, params));
        //
        //     {
        //         "message": "Order cancellation request received.",
        //         "timestamp": "2023-10-26T10:29:28.652Z"
        //     }
        //
        const orders = [response];
        return this.parseOrders(orders, market);
    }
    /**
     * @method
     * @name coinlist#cancelOrder
     * @description cancels an open order
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#cancel-specific-order-by-id
     * @param {string} id order id
     * @param {string} symbol not used by coinlist cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'order_id': id,
        };
        const response = await this.privateDeleteV1OrdersOrderId(this.extend(request, params));
        //
        //     {
        //         "message": "Cancel order request received.",
        //         "order_id": "d36e7588-6525-485c-b768-8ad8b3f745f9",
        //         "timestamp": "2023-10-26T14:36:37.559Z"
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name coinlist#cancelOrders
     * @description cancel multiple orders
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#cancel-specific-orders
     * @param {string[]} ids order ids
     * @param {string} symbol not used by coinlist cancelOrders ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        params = ids;
        const response = await this.privateDeleteV1OrdersBulk(params);
        //
        //    {
        //        "message": "Cancel order requests received.",
        //        "order_ids": [
        //            "ff132955-43bc-4fe5-9d9c-5ba226cc89a0"
        //        ],
        //        "timestamp": "2024-06-01T02:32:30.305Z"
        //    }
        //
        const orderIds = this.safeList(response, 'order_ids', []);
        const orders = [];
        const datetime = this.safeString(response, 'timestamp');
        for (let i = 0; i < orderIds.length; i++) {
            orders.push(this.safeOrder({
                'info': orderIds[i],
                'id': orderIds[i],
                'lastUpdateTimestamp': this.parse8601(datetime),
            }));
        }
        return orders;
    }
    /**
     * @method
     * @name coinlist#createOrder
     * @description create a trade order
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#create-new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'stop_market' or 'stop_limit' or 'take_market' or 'take_limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default false)
     * @param {float} [params.triggerPrice] only for the 'stop_market', 'stop_limit', 'take_market' or 'take_limit' orders (the price at which an order is triggered)
     * @param {string} [params.clientOrderId] client order id (default undefined)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'type': type,
            'side': side,
            'size': this.amountToPrecision(symbol, amount),
        };
        let isMarket = false;
        if ((type === 'limit') || (type === 'stop_limit') || (type === 'take_limit')) {
            if (price === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision(symbol, price);
        }
        else {
            isMarket = true;
        }
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(isMarket, false, params);
        if (postOnly) {
            request['post_only'] = true;
        }
        const triggerPrice = this.safeNumberN(params, ['triggerPrice', 'trigger_price', 'stopPrice', 'stop_price']);
        if (triggerPrice !== undefined) {
            params = this.omit(params, ['triggerPrice', 'trigger_price', 'stopPrice']);
            request['stop_price'] = this.priceToPrecision(symbol, triggerPrice);
            if (type === 'market') {
                request['type'] = 'stop_market';
            }
            else if (type === 'limit') {
                request['type'] = 'stop_limit';
            }
        }
        else if ((type === 'stop_market') || (type === 'stop_limit') || (type === 'take_market') || (type === 'take_limit')) {
            throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a triggerPrice parameter for stop-loss and take-profit orders');
        }
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_id');
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
            params = this.omit(params, ['clientOrderId', 'client_id']);
        }
        const response = await this.privatePostV1Orders(this.extend(request, params));
        //
        //     {
        //         "message": "New order request received.",
        //         "order": {
        //             "symbol": "BTC-USDT",
        //             "type": "market",
        //             "side": "sell",
        //             "size": "0.0003",
        //             "order_id": "cad67c0f-9aec-4ac8-ac03-aaf5db299ff7",
        //             "trader_id": "9c6f737e-a829-4843-87b1-b1ce86f2853b"
        //         },
        //         "timestamp": "2023-10-26T11:30:55.376Z"
        //     }
        //
        const order = this.safeDict(response, 'order', {});
        return this.parseOrder(order, market);
    }
    /**
     * @method
     * @name coinlist#editOrder
     * @description create a trade order
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#modify-existing-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'stop_market' or 'stop_limit' or 'take_market' or 'take_limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        if (amount === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires an amount argument');
        }
        const market = this.market(symbol);
        const request = {
            'order_id': id,
            'type': type,
            'side': side,
            'size': this.amountToPrecision(symbol, amount),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const response = await this.privatePatchV1OrdersOrderId(this.extend(request, params));
        return this.parseOrder(response, market);
    }
    parseOrder(order, market = undefined) {
        //
        // fetchOrder
        //     {
        //         "order_id": "913ea6e7-9fc9-43fb-9db1-f195d3baa93f",
        //         "price": "35800.00000000",
        //         "stop_price":null,
        //         "cost": "0.00000000",
        //         "fill_fees": "0.00000000",
        //         "trader_id": "9c6f737e-a829-4843-87b1-b1ce86f2853b",
        //         "status": "canceled",
        //         "epoch_timestamp": "2023-10-26T08:20:56.307Z",
        //         "origin": "web",
        //         "self_trade_prevention":null,
        //         "client_id":null,
        //         "symbol": "BTC-USDT",
        //         "size": "0.0003",
        //         "side": "sell",
        //         "type": "limit",
        //         "post_only":false,
        //         "size_filled": "0.0000"
        //     }
        //
        // fetchOrders
        //     {
        //         "order_id":"913ea6e7-9fc9-43fb-9db1-f195d3baa93f",
        //         "price":"35800.00000000",
        //         "stop_price":null,
        //         "cost":"0.00000000",
        //         "fill_fees":"0.00000000",
        //         "trader_id":"9c6f737e-a829-4843-87b1-b1ce86f2853b",
        //         "status":"accepted",
        //         "epoch_timestamp":"2023-10-26T08:20:56.307Z",
        //         "origin":"web",
        //         "self_trade_prevention":null,
        //         "client_id":null,
        //         "created_at":"2023-10-26T08:20:56.307Z",
        //         "symbol":"BTC-USDT",
        //         "size":"0.0003",
        //         "side":"sell",
        //         "type":"limit",
        //         "post_only":false,
        //         "size_filled":"0.0000"
        //     }
        //
        // createOrder
        //     {
        //         "symbol": "BTC-USDT",
        //         "type": "market",
        //         "side": "sell",
        //         "size": "0.0003",
        //         "order_id": "cad67c0f-9aec-4ac8-ac03-aaf5db299ff7",
        //         "trader_id": "9c6f737e-a829-4843-87b1-b1ce86f2853b"
        //     },
        //
        // cancelOrder
        //     {
        //         "message": "Cancel order request received.",
        //         "order_id": "d36e7588-6525-485c-b768-8ad8b3f745f9",
        //         "timestamp": "2023-10-26T14:36:37.559Z"
        //     }
        //
        // cancelOrders
        //     {
        //         "message": "Order cancellation request received.",
        //         "timestamp": "2023-10-26T10:29:28.652Z"
        //     }
        //
        // cancelAllOrders
        //     {
        //         "message": "Order cancellation request received.",
        //         "timestamp": "2023-10-26T10:29:28.652Z"
        //     }
        //
        const id = this.safeString(order, 'order_id');
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const clientOrderId = this.safeString(order, 'client_id');
        let timestampString = this.safeString2(order, 'created_at', 'epoch_timestamp');
        if (timestampString === undefined) {
            timestampString = this.safeString(order, 'timestamp');
        }
        const timestamp = this.parse8601(timestampString);
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const type = this.parseOrderType(this.safeString(order, 'type'));
        const side = this.safeString(order, 'side');
        const price = this.safeString(order, 'price');
        const triggerPrice = this.safeString(order, 'stop_price');
        const average = this.safeString(order, 'average_fill_price'); // from documentation
        const amount = this.safeString(order, 'size');
        const filled = this.safeString(order, 'size_filled');
        const feeCost = this.safeString(order, 'fill_fees');
        const postOnly = this.safeValue(order, 'post_only');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': market['quote'],
                'cost': feeCost,
                'rate': undefined,
            };
        }
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': 'GTC',
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'average': average,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': undefined,
            'fee': fee,
            'trades': undefined,
            'info': order,
            'postOnly': postOnly,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'pending': 'open',
            'accepted': 'open',
            'rejected': 'rejected',
            'done': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(status) {
        const statuses = {
            'market': 'market',
            'limit': 'limit',
            'stop_market': 'market',
            'stop_limit': 'limit',
            'take_market': 'market',
            'take_limit': 'limit',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name coinlist#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#transfer-funds-between-entities
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#transfer-funds-from-wallet-to-pro
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#transfer-funds-from-pro-to-wallet
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
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        const accountsByType = this.safeValue(this.options, 'accountsByType', {});
        const fromAcc = this.safeString(accountsByType, fromAccount, fromAccount);
        const toAcc = this.safeString(accountsByType, toAccount, toAccount);
        let response = undefined;
        if ((fromAcc === 'funding') && (toAcc === 'trading')) {
            response = await this.privatePostV1TransfersFromWallet(this.extend(request, params));
        }
        else if ((fromAcc === 'trading') && (toAcc === 'funding')) {
            response = await this.privatePostV1TransfersToWallet(this.extend(request, params));
        }
        else {
            request['from_trader_id'] = fromAcc;
            request['to_trader_id'] = toAcc;
            response = await this.privatePostV1TransfersInternalTransfer(this.extend(request, params));
        }
        //
        // privatePostV1TransfersInternalTransfer
        //     {
        //         "from_trader_id": "1f494ace-b3ed-4324-b202-55526ed06381",
        //         "to_trader_id": "d32c7a40-cc24-44b0-8597-f9edb3da989f",
        //         "asset": "string",
        //         "amount": "string"
        //     }
        //
        // privatePostV1TransfersFromWallet, privatePostV1TransfersToWallet
        //     {
        //         "transfer_id": "bb34f528-d9b0-47c6-b11f-4d4840b86ee3"
        //     }
        //
        const transfer = this.parseTransfer(response, currency);
        return transfer;
    }
    /**
     * @method
     * @name coinlist#fetchTransfers
     * @description fetch a history of internal transfers between CoinList.co and CoinList Pro. It does not return external deposits or withdrawals
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-transfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {};
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_time'] = this.iso8601(until);
        }
        const response = await this.privateGetV1Transfers(this.extend(request, params));
        //
        //     {
        //         "transfers": [
        //             {
        //                 "transfer_id": "2c02db25-e8f2-4271-8222-e110bfd0aa2a",
        //                 "created_at": "2023-10-20T13:15:37.000Z",
        //                 "confirmed_at": "2023-10-20T13:15:37.000Z",
        //                 "asset": "ETH",
        //                 "amount": "0.010000000000000000",
        //                 "status": "confirmed"
        //             },
        //             {
        //                 "transfer_id": "890694db-156c-4e93-a3ef-4db61685aca7",
        //                 "created_at": "2023-10-26T14:32:22.000Z",
        //                 "confirmed_at": "2023-10-26T14:32:22.000Z",
        //                 "asset": "USD",
        //                 "amount": "-3.00",
        //                 "status": "confirmed"
        //             }
        //         ]
        //     }
        //
        const transfers = this.safeList(response, 'transfers', []);
        return this.parseTransfers(transfers, currency, since, limit);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // fetchTransfers
        //     {
        //         "transfer_id": "890694db-156c-4e93-a3ef-4db61685aca7",
        //         "created_at": "2023-10-26T14:32:22.000Z",
        //         "confirmed_at": "2023-10-26T14:32:22.000Z",
        //         "asset": "USD",
        //         "amount": "-3.00",
        //         "status": "confirmed"
        //     }
        //
        // transfer - privatePostV1TransfersInternalTransfer
        //     {
        //         "from_trader_id": "1f494ace-b3ed-4324-b202-55526ed06381",
        //         "to_trader_id": "d32c7a40-cc24-44b0-8597-f9edb3da989f",
        //         "asset": "string",
        //         "amount": "string"
        //     }
        //
        // transfer - privatePostV1TransfersFromWallet, privatePostV1TransfersToWallet
        //     {
        //         "transfer_id": "bb34f528-d9b0-47c6-b11f-4d4840b86ee3"
        //     }
        //
        const currencyId = this.safeString(transfer, 'asset');
        const confirmedAt = this.safeString(transfer, 'confirmed_at');
        const timetstamp = this.parse8601(confirmedAt);
        const status = this.safeString(transfer, 'status');
        let amountString = this.safeString(transfer, 'amount');
        let fromAccount = undefined;
        let toAccount = undefined;
        let amount = undefined;
        if (amountString !== undefined) {
            const amountIsNegative = Precise["default"].stringLt(amountString, '0');
            if (amountIsNegative) {
                fromAccount = 'trading';
                toAccount = 'funding';
                amountString = Precise["default"].stringNeg(amountString);
            }
            else {
                fromAccount = 'funding';
                toAccount = 'trading';
            }
            amount = this.parseNumber(amountString);
        }
        return {
            'info': transfer,
            'id': this.safeString(transfer, 'transfer_id'),
            'timestamp': timetstamp,
            'datetime': this.iso8601(timetstamp),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus(status),
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'confirmed': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name coinlist#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals from external wallets and between CoinList Pro trading account and CoinList wallet
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-coinlist-wallet-ledger
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal
     * @param {int} [limit] max number of deposit/withdrawals to return (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDepositsWithdrawals() requires a code argument');
        }
        const traderId = this.safeString2(params, 'trader_id', 'traderId');
        if (traderId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDepositsWithdrawals() requires a traderId argument in the params');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'trader_id': traderId,
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        params = this.omit(params, ['trader_id', 'traderId']);
        const response = await this.privateGetV1AccountsTraderIdWalletLedger(this.extend(request, params));
        //
        //     [
        //         {
        //             "id": "2c02db25-e8f2-4271-8222-e110bfd0aa2a",
        //             "asset": "ETH",
        //             "amount": "0.01",
        //             "created_at": "2023-10-20T13:15:37.000Z",
        //             "description": "Transfer to CoinList Pro",
        //             "type": "PRO_TRANSFER",
        //             "delta": "-0.010000000000000000"
        //         },
        //         {
        //             "id": "7139384d-6cec-479e-a19c-d498647ccb47",
        //             "asset": "ETH",
        //             "amount": "0.01",
        //             "created_at": "2023-10-20T13:10:55.000Z",
        //             "description": "CRYPTO_DEPOSIT",
        //             "type": "CRYPTO_DEPOSIT",
        //             "delta": "0.010000000000000000"
        //         },
        //
        //         ...
        //
        //         {
        //             "id": "91bbbb22-5ede-4e9a-81ef-3f9318aa83d2",
        //             "asset": "USDT",
        //             "amount": "4.169654",
        //             "withdrawal_fee_amount": "8.830346000000000000",
        //             "created_at": "2023-10-27T16:14:11.000Z",
        //             "description": "CRYPTO_WITHDRAWAL",
        //             "type": "CRYPTO_WITHDRAWAL",
        //             "delta": "-4.169654000000000000"
        //         },
        //         {
        //             "id": "830261bd-cda9-401f-b6df-105f4da3b37c",
        //             "asset": "USDT",
        //             "amount": "13",
        //             "created_at": "2023-10-27T14:52:05.000Z",
        //             "description": "Transfer from CoinList Pro",
        //             "type": "PRO_TRANSFER",
        //             "delta": "13.000000000000000000"
        //         }
        //     ]
        //
        // coinlist returns both internal transfers and blockchain transactions
        return this.parseTransactions(response, currency, since, limit);
    }
    /**
     * @method
     * @name coinlist#withdraw
     * @description request a withdrawal from CoinList wallet. (Disabled by default. Contact CoinList to apply for an exception.)
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#request-withdrawal-from-wallet
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
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
            'destination_address': address,
        };
        const response = await this.privatePostV1TransfersWithdrawalRequest(this.extend(request, params));
        //
        //     {
        //         "transfer_id": "d4a2d8dd-7def-4545-a062-761683b9aa05"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTransaction(data, currency);
    }
    parseTransaction(transaction, currency = undefined) {
        // withdraw
        //
        //     {
        //         "transfer_id": "d4a2d8dd-7def-4545-a062-761683b9aa05"
        //     }
        //
        // fetchDepositsWithdrawals
        //     {
        //         "id": "91bbbb22-5ede-4e9a-81ef-3f9318aa83d2",
        //         "asset": "USDT",
        //         "amount": "4.169654",
        //         "withdrawal_fee_amount": "8.830346000000000000",
        //         "created_at": "2023-10-27T16:14:11.000Z",
        //         "description": "CRYPTO_WITHDRAWAL",
        //         "type": "CRYPTO_WITHDRAWAL",
        //         "delta": "-4.169654000000000000"
        //     },
        //
        const currencyId = this.safeString(transaction, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        const id = this.safeString2(transaction, 'id', 'transfer_id');
        const amount = this.safeNumber(transaction, 'amount');
        const timestamp = this.parse8601(this.safeString(transaction, 'created_at'));
        let type = this.safeString(transaction, 'type', undefined);
        if (type === undefined) {
            type = 'withdrawal'; // undefined only in withdraw() method
        }
        else {
            type = this.parseTransactionType(type);
        }
        let fee = undefined;
        const feeCost = this.safeString(transaction, 'withdrawal_fee_amount');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': undefined,
            'updated': undefined,
            'fee': fee,
            'comment': this.safeString(transaction, 'description'),
            'internal': undefined,
        };
    }
    parseTransactionType(type) {
        const types = {
            'CRYPTO_DEPOSIT': 'deposit',
            'CRYPTO_WITHDRAWAL': 'withdrawal',
            'PRO_TRANSFER': 'transfer',
        };
        return this.safeString(types, type, type);
    }
    /**
     * @method
     * @name coinlist#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-account-history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        const traderId = this.safeString2(params, 'trader_id', 'traderId');
        if (traderId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchLedger() requires a traderId argument in the params');
        }
        await this.loadMarkets();
        const request = {
            'trader_id': traderId,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_time'] = this.iso8601(until);
        }
        params = this.omit(params, ['trader_id', 'traderId']);
        const response = await this.privateGetV1AccountsTraderIdLedger(this.extend(request, params));
        //
        //     {
        //         "transactions": [
        //             {
        //                 "transaction_id": "0288634e-49bd-494d-b04a-18fd1832d394",
        //                 "transaction_type": "XFER",
        //                 "type": "deposit",
        //                 "asset": "ETH",
        //                 "symbol": null,
        //                 "amount": "0.010000000000000000",
        //                 "details": null,
        //                 "created_at": "2023-10-20T13:15:39.443Z"
        //             },
        //             {
        //                 "transaction_id": "47a45928-abcd-4c12-8bd6-587c3028025f",
        //                 "transaction_type": "SWAP",
        //                 "type": "atomic token swap",
        //                 "asset": "USDT",
        //                 "symbol": "ETH-USDT",
        //                 "amount": "1.447947",
        //                 "details": null,
        //                 "created_at": "2023-10-20T13:16:30.373Z"
        //             },
        //             {
        //                 "transaction_id": "1ffe3a54-916e-41f0-b957-3a01309eb009",
        //                 "transaction_type": "FEE",
        //                 "type": "fee",
        //                 "asset": "USDT",
        //                 "symbol": "ETH-USDT",
        //                 "amount": "-0.006516",
        //                 "details": {
        //                     "fee_details": [
        //                         {
        //                             "insurance_fee": "0",
        //                             "order_id": "39911d5f-c789-4a7d-ad34-820a804d1da6",
        //                             "fee_type": "taker",
        //                             "fee_currency": "USDT"
        //                         }
        //                     ]
        //                 },
        //                 "created_at": "2023-10-20T13:16:30.373Z"
        //             },
        //             {
        //                 "transaction_id": "3930e8a3-2218-481f-8c3c-2219287e205e",
        //                 "transaction_type": "SWAP",
        //                 "type": "atomic token swap",
        //                 "asset": "ETH",
        //                 "symbol": "ETH-USDT",
        //                 "amount": "-0.000900000000000000",
        //                 "details": null,
        //                 "created_at": "2023-10-20T13:16:30.373Z"
        //             },
        //             {
        //                 "transaction_id": "a6c65cb3-95d0-44e2-8202-f70581d6e55c",
        //                 "transaction_type": "XFER",
        //                 "type": "withdrawal",
        //                 "asset": "USD",
        //                 "symbol": null,
        //                 "amount": "-3.00",
        //                 "details": null,
        //                 "created_at": "2023-10-26T14:32:24.887Z"
        //             }
        //         ]
        //     }
        //
        const ledger = this.safeValue(response, 'transactions', []);
        return this.parseLedger(ledger, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        // deposit transaction from wallet (funding) to pro (trading)
        //     {
        //         "transaction_id": "0288634e-49bd-494d-b04a-18fd1832d394",
        //         "transaction_type": "XFER",
        //         "type": "deposit",
        //         "asset": "ETH",
        //         "symbol": null,
        //         "amount": "0.010000000000000000",
        //         "details": null,
        //         "created_at": "2023-10-20T13:15:39.443Z"
        //     }
        //
        // withdrawal transaction from pro (trading) to wallet (funding)
        //     {
        //         "transaction_id": "a6c65cb3-95d0-44e2-8202-f70581d6e55c",
        //         "transaction_type": "XFER",
        //         "type": "withdrawal",
        //         "asset": "USD",
        //         "symbol": null,
        //         "amount": "-3.00",
        //         "details": null,
        //         "created_at": "2023-10-26T14:32:24.887Z"
        //     }
        //
        // sell trade
        //     {
        //         "transaction_id": "47a45928-abcd-4c12-8bd6-587c3028025f",
        //         "transaction_type": "SWAP",
        //         "type": "atomic token swap",
        //         "asset": "USDT",
        //         "symbol": "ETH-USDT",
        //         "amount": "1.447947",
        //         "details": null,
        //         "created_at": "2023-10-20T13:16:30.373Z"
        //     }
        //
        // buy trade
        //     {
        //         "transaction_id": "46d20a93-45c4-4441-a238-f89602eb8c8c",
        //         "transaction_type": "SWAP",
        //         "type": "atomic token swap",
        //         "asset": "ETH",
        //         "symbol": "ETH-USDT",
        //         "amount": "0.000800000000000000",
        //         "details": null,
        //         "created_at": "2023-10-20T13:22:14.256Z"
        //     },
        //
        //  fee
        //     {
        //         "transaction_id": "57fd526c-36b1-4721-83ce-42aadcb1e953",
        //         "transaction_type": "FEE",
        //         "type": "fee",
        //         "asset": "USDT",
        //         "symbol": "BTC-USDT",
        //         "amount": "-0.047176",
        //         "details": {
        //             "fee_details": [
        //                 {
        //                     "insurance_fee": "0",
        //                     "order_id": "c0bc33cd-eeb9-40a0-ab5f-2d99f323ef58",
        //                     "fee_type": "taker",
        //                     "fee_currency": "USDT"
        //                 }
        //             ]
        //         },
        //         "created_at": "2023-10-25T16:46:24.294Z"
        //     }
        //
        const id = this.safeString(item, 'transaction_id');
        const createdAt = this.safeString(item, 'created_at');
        const timestamp = this.parse8601(createdAt);
        let amount = this.safeString(item, 'amount');
        const amountIsNegative = Precise["default"].stringLt(amount, '0');
        let direction = undefined;
        if (amountIsNegative) {
            direction = 'out';
            amount = Precise["default"].stringNeg(amount);
        }
        else {
            direction = 'in';
        }
        const currencyId = this.safeString(item, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const type = this.parseLedgerEntryType(this.safeString(item, 'type'));
        return this.safeLedgerEntry({
            'info': item,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'direction': direction,
            'account': 'trading',
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': this.parseNumber(amount),
            'before': undefined,
            'after': undefined,
            'status': 'ok',
            'fee': undefined,
        }, currency);
    }
    parseLedgerEntryType(type) {
        const types = {
            'atomic token swap': 'trade',
            'fee': 'fee',
            'deposit': 'transfer',
            'withdrawal': 'transfer',
        };
        return this.safeString(types, type, type);
    }
    /**
     * @method
     * @name coinlist#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://trade-docs.coinlist.co/#coinlist-pro-api-Funding-Rates
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1SymbolsSymbolFunding(this.extend(request, params));
        //
        //     {
        //         "last": {
        //             "funding_rate": "-0.00043841",
        //             "funding_time": "2025-04-15T04:00:00.000Z"
        //         },
        //         "next": {
        //             "funding_rate": "-0.00046952",
        //             "funding_time": "2025-04-15T12:00:00.000Z"
        //         },
        //         "indicative": {
        //             "funding_rate": "-0.00042517",
        //             "funding_time": "2025-04-15T20:00:00.000Z"
        //         },
        //         "timestamp": "2025-04-15T07:01:15.219Z"
        //     }
        //
        return this.parseFundingRate(response, market);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "last": {
        //             "funding_rate": "-0.00043841",
        //             "funding_time": "2025-04-15T04:00:00.000Z"
        //         },
        //         "next": {
        //             "funding_rate": "-0.00046952",
        //             "funding_time": "2025-04-15T12:00:00.000Z"
        //         },
        //         "indicative": {
        //             "funding_rate": "-0.00042517",
        //             "funding_time": "2025-04-15T20:00:00.000Z"
        //         },
        //         "timestamp": "2025-04-15T07:01:15.219Z"
        //     }
        //
        const previous = this.safeDict(contract, 'last', {});
        const current = this.safeDict(contract, 'next', {});
        const next = this.safeDict(contract, 'indicative', {});
        const previousDatetime = this.safeString(previous, 'funding_time');
        const currentDatetime = this.safeString(current, 'funding_time');
        const nextDatetime = this.safeString(next, 'funding_time');
        const datetime = this.safeString(contract, 'timestamp');
        return {
            'info': contract,
            'symbol': this.safeSymbol(undefined, market),
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'fundingRate': this.safeNumber(current, 'funding_rate'),
            'fundingTimestamp': this.parse8601(currentDatetime),
            'fundingDatetime': currentDatetime,
            'nextFundingRate': this.safeNumber(next, 'funding_rate'),
            'nextFundingTimestamp': this.parse8601(nextDatetime),
            'nextFundingDatetime': nextDatetime,
            'previousFundingRate': this.safeNumber(previous, 'funding_rate'),
            'previousFundingTimestamp': this.parse8601(previousDatetime),
            'previousFundingDatetime': previousDatetime,
            'interval': '8h',
        };
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit(params, this.extractParams(path));
        const endpoint = '/' + this.implodeParams(path, params);
        let url = this.urls['api'][api] + endpoint;
        const isBulk = Array.isArray(params);
        let query = undefined;
        if (!isBulk) {
            query = this.urlencode(request);
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            const timestamp = this.seconds().toString();
            let auth = timestamp + method + endpoint;
            if ((method === 'POST') || (method === 'PATCH') || isBulk) {
                body = this.json(request);
                auth += body;
            }
            else if (query !== undefined && query.length !== 0) {
                auth += '?' + query;
                url += '?' + query;
            }
            const signature = this.hmac(this.encode(auth), this.base64ToBinary(this.secret), sha256.sha256, 'base64');
            headers = {
                'CL-ACCESS-KEY': this.apiKey,
                'CL-ACCESS-SIG': signature,
                'CL-ACCESS-TIMESTAMP': timestamp,
                'Content-Type': 'application/json',
            };
        }
        else if (query !== undefined && query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            // In some cases the exchange returns 202 Accepted for bad orders.
            // The body of that response contains order_id of the order.
            // Some bad orders will get status 'rejected' and could be fetched later (by using fetchOrders() or fetchOrder(order_id)).
            // While others don't get any status, they simply disappear, but the response is still 202 Accepted and contains their order_id.
            // When using fechOrder(order_id) for such disappeared orders, the exchange returns an empty response with code 404.
            if ((code === 404) && (url.indexOf('/orders/') >= 0) && (method === 'GET')) {
                const parts = url.split('/orders/');
                const orderId = this.safeString(parts, 1);
                throw new errors.OrderNotFound(this.id + ' order ' + orderId + ' not found (or rejected on the exchange side)');
            }
            return undefined;
        }
        const responseCode = this.safeString(response, 'status');
        const messageCode = this.safeString(response, 'message_code');
        if ((messageCode !== undefined) || ((responseCode !== undefined) && (code !== 200) && (code !== 202) && (responseCode !== '200') && (responseCode !== '202'))) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString(response, 'message');
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], messageCode, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
}

module.exports = coinlist;
