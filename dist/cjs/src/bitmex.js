'use strict';

var bitmex$1 = require('./abstract/bitmex.js');
var number = require('./base/functions/number.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var totp = require('./base/functions/totp.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class bitmex
 * @augments Exchange
 */
class bitmex extends bitmex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitmex',
            'name': 'BitMEX',
            'countries': ['SC'],
            'version': 'v1',
            'userAgent': undefined,
            // cheapest endpoints are 10 requests per second (trading)
            // 10 per second => rateLimit = 1000ms / 10 = 100ms
            // 120 per minute => 2 per second => weight = 5 (authenticated)
            // 30 per minute => 0.5 per second => weight = 20 (unauthenticated)
            'rateLimit': 100,
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': undefined,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'createStopOrder': true,
                'createTrailingAmountOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDepositsWithdrawals': 'emulated',
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': 'emulated',
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': 'emulated',
                'fetchLeverages': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': 'emulated',
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': undefined,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': undefined,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'public': 'https://testnet.bitmex.com',
                    'private': 'https://testnet.bitmex.com',
                },
                'logo': 'https://github.com/user-attachments/assets/c78425ab-78d5-49d6-bd14-db7734798f04',
                'api': {
                    'public': 'https://www.bitmex.com',
                    'private': 'https://www.bitmex.com',
                },
                'www': 'https://www.bitmex.com',
                'doc': [
                    'https://www.bitmex.com/app/apiOverview',
                    'https://github.com/BitMEX/api-connectors/tree/master/official-http',
                ],
                'fees': 'https://www.bitmex.com/app/fees',
                'referral': {
                    'url': 'https://www.bitmex.com/app/register/NZTR1q',
                    'discount': 0.1,
                },
            },
            'api': {
                'public': {
                    'get': {
                        'announcement': 5,
                        'announcement/urgent': 5,
                        'chat': 5,
                        'chat/channels': 5,
                        'chat/connected': 5,
                        'chat/pinned': 5,
                        'funding': 5,
                        'guild': 5,
                        'instrument': 5,
                        'instrument/active': 5,
                        'instrument/activeAndIndices': 5,
                        'instrument/activeIntervals': 5,
                        'instrument/compositeIndex': 5,
                        'instrument/indices': 5,
                        'instrument/usdVolume': 5,
                        'insurance': 5,
                        'leaderboard': 5,
                        'liquidation': 5,
                        'orderBook/L2': 5,
                        'porl/nonce': 5,
                        'quote': 5,
                        'quote/bucketed': 5,
                        'schema': 5,
                        'schema/websocketHelp': 5,
                        'settlement': 5,
                        'stats': 5,
                        'stats/history': 5,
                        'stats/historyUSD': 5,
                        'trade': 5,
                        'trade/bucketed': 5,
                        'wallet/assets': 5,
                        'wallet/networks': 5,
                    },
                },
                'private': {
                    'get': {
                        'address': 5,
                        'apiKey': 5,
                        'execution': 5,
                        'execution/tradeHistory': 5,
                        'globalNotification': 5,
                        'leaderboard/name': 5,
                        'order': 5,
                        'porl/snapshots': 5,
                        'position': 5,
                        'user': 5,
                        'user/affiliateStatus': 5,
                        'user/checkReferralCode': 5,
                        'user/commission': 5,
                        'user/csa': 5,
                        'user/depositAddress': 5,
                        'user/executionHistory': 5,
                        'user/getWalletTransferAccounts': 5,
                        'user/margin': 5,
                        'user/quoteFillRatio': 5,
                        'user/quoteValueRatio': 5,
                        'user/staking': 5,
                        'user/staking/instruments': 5,
                        'user/staking/tiers': 5,
                        'user/tradingVolume': 5,
                        'user/unstakingRequests': 5,
                        'user/wallet': 5,
                        'user/walletHistory': 5,
                        'user/walletSummary': 5,
                        'userAffiliates': 5,
                        'userEvent': 5,
                    },
                    'post': {
                        'address': 5,
                        'chat': 5,
                        'guild': 5,
                        'guild/archive': 5,
                        'guild/join': 5,
                        'guild/kick': 5,
                        'guild/leave': 5,
                        'guild/sharesTrades': 5,
                        'order': 1,
                        'order/cancelAllAfter': 5,
                        'order/closePosition': 5,
                        'position/isolate': 1,
                        'position/leverage': 1,
                        'position/riskLimit': 5,
                        'position/transferMargin': 1,
                        'user/addSubaccount': 5,
                        'user/cancelWithdrawal': 5,
                        'user/communicationToken': 5,
                        'user/confirmEmail': 5,
                        'user/confirmWithdrawal': 5,
                        'user/logout': 5,
                        'user/preferences': 5,
                        'user/requestWithdrawal': 5,
                        'user/unstakingRequests': 5,
                        'user/updateSubaccount': 5,
                        'user/walletTransfer': 5,
                    },
                    'put': {
                        'guild': 5,
                        'order': 1,
                    },
                    'delete': {
                        'order': 1,
                        'order/all': 1,
                        'user/unstakingRequests': 5,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    'Invalid API Key.': errors.AuthenticationError,
                    'This key is disabled.': errors.PermissionDenied,
                    'Access Denied': errors.PermissionDenied,
                    'Duplicate clOrdID': errors.InvalidOrder,
                    'orderQty is invalid': errors.InvalidOrder,
                    'Invalid price': errors.InvalidOrder,
                    'Invalid stopPx for ordType': errors.InvalidOrder,
                    'Account is restricted': errors.PermissionDenied, // {"error":{"message":"Account is restricted","name":"HTTPError"}}
                },
                'broad': {
                    'Signature not valid': errors.AuthenticationError,
                    'overloaded': errors.ExchangeNotAvailable,
                    'Account has insufficient Available Balance': errors.InsufficientFunds,
                    'Service unavailable': errors.ExchangeNotAvailable,
                    'Server Error': errors.ExchangeError,
                    'Unable to cancel order due to existing state': errors.InvalidOrder,
                    'We require all new traders to verify': errors.PermissionDenied, // {"message":"We require all new traders to verify their identity before their first deposit. Please visit bitmex.com/verify to complete the process.","name":"HTTPError"}
                },
            },
            'precisionMode': number.TICK_SIZE,
            'options': {
                // https://blog.bitmex.com/api_announcement/deprecation-of-api-nonce-header/
                // https://github.com/ccxt/ccxt/issues/4789
                'api-expires': 5,
                'fetchOHLCVOpenTimestamp': true,
                'oldPrecision': false,
                'networks': {
                    'BTC': 'btc',
                    'ERC20': 'eth',
                    'BEP20': 'bsc',
                    'TRC20': 'tron',
                    'AVAXC': 'avax',
                    'NEAR': 'near',
                    'XTZ': 'xtz',
                    'DOT': 'dot',
                    'SOL': 'sol',
                    'ADA': 'ada',
                },
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
                        },
                        'triggerDirection': true,
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
                        'trailing': true,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        // exchange-supported features
                        // 'selfTradePrevention': true,
                        // 'twap': false,
                        // 'iceberg': false,
                        // 'oco': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'untilDays': 1000000,
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
                        'daysBack': undefined,
                        'untilDays': 1000000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 1000000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 10000,
                    },
                },
                'spot': {
                    'extends': 'default',
                    'createOrder': {
                        'triggerPriceType': {
                            'index': false,
                        },
                    },
                },
                'derivatives': {
                    'extends': 'default',
                    'createOrder': {
                        'triggerPriceType': {
                            'index': true,
                        },
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'derivatives',
                    },
                    'inverse': {
                        'extends': 'derivatives',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'derivatives',
                    },
                    'inverse': {
                        'extends': 'derivatives',
                    },
                },
            },
            'commonCurrencies': {
                'USDt': 'USDT',
                'XBt': 'BTC',
                'XBT': 'BTC',
                'Gwei': 'ETH',
                'GWEI': 'ETH',
                'LAMP': 'SOL',
                'LAMp': 'SOL',
            },
        });
    }
    /**
     * @method
     * @name bitmex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.bitmex.com/api/explorer/#!/Wallet/Wallet_getAssetsConfig
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetWalletAssets(params);
        //
        //    {
        //        "XBt": {
        //            "asset": "XBT",
        //            "currency": "XBt",
        //            "majorCurrency": "XBT",
        //            "name": "Bitcoin",
        //            "currencyType": "Crypto",
        //            "scale": "8",
        //            // "mediumPrecision": "8",
        //            // "shorterPrecision": "4",
        //            // "symbol": "₿",
        //            // "weight": "1",
        //            // "tickLog": "0",
        //            "enabled": true,
        //            "isMarginCurrency": true,
        //            "minDepositAmount": "10000",
        //            "minWithdrawalAmount": "1000",
        //            "maxWithdrawalAmount": "100000000000000",
        //            "networks": [
        //                {
        //                    "asset": "btc",
        //                    "tokenAddress": "",
        //                    "depositEnabled": true,
        //                    "withdrawalEnabled": true,
        //                    "withdrawalFee": "20000",
        //                    "minFee": "20000",
        //                    "maxFee": "10000000"
        //                }
        //            ]
        //        },
        //     }
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const asset = this.safeString(currency, 'asset');
            const code = this.safeCurrencyCode(asset);
            const id = this.safeString(currency, 'currency');
            const name = this.safeString(currency, 'name');
            const chains = this.safeValue(currency, 'networks', []);
            let depositEnabled = false;
            let withdrawEnabled = false;
            const networks = {};
            const scale = this.safeString(currency, 'scale');
            const precisionString = this.parsePrecision(scale);
            const precision = this.parseNumber(precisionString);
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString(chain, 'asset');
                const network = this.networkIdToCode(networkId);
                const withdrawalFeeRaw = this.safeString(chain, 'withdrawalFee');
                const withdrawalFee = this.parseNumber(Precise["default"].stringMul(withdrawalFeeRaw, precisionString));
                const isDepositEnabled = this.safeBool(chain, 'depositEnabled', false);
                const isWithdrawEnabled = this.safeBool(chain, 'withdrawalEnabled', false);
                const active = (isDepositEnabled && isWithdrawEnabled);
                if (isDepositEnabled) {
                    depositEnabled = true;
                }
                if (isWithdrawEnabled) {
                    withdrawEnabled = true;
                }
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'active': active,
                    'deposit': isDepositEnabled,
                    'withdraw': isWithdrawEnabled,
                    'fee': withdrawalFee,
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            const currencyEnabled = this.safeValue(currency, 'enabled');
            const currencyActive = currencyEnabled || (depositEnabled || withdrawEnabled);
            const minWithdrawalString = this.safeString(currency, 'minWithdrawalAmount');
            const minWithdrawal = this.parseNumber(Precise["default"].stringMul(minWithdrawalString, precisionString));
            const maxWithdrawalString = this.safeString(currency, 'maxWithdrawalAmount');
            const maxWithdrawal = this.parseNumber(Precise["default"].stringMul(maxWithdrawalString, precisionString));
            const minDepositString = this.safeString(currency, 'minDepositAmount');
            const minDeposit = this.parseNumber(Precise["default"].stringMul(minDepositString, precisionString));
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': currencyActive,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': minWithdrawal,
                        'max': maxWithdrawal,
                    },
                    'deposit': {
                        'min': minDeposit,
                        'max': undefined,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }
    convertFromRealAmount(code, amount) {
        const currency = this.currency(code);
        const precision = this.safeString(currency, 'precision');
        const amountString = this.numberToString(amount);
        const finalAmount = Precise["default"].stringDiv(amountString, precision);
        return this.parseNumber(finalAmount);
    }
    convertToRealAmount(code, amount) {
        if (code === undefined) {
            return amount;
        }
        else if (amount === undefined) {
            return undefined;
        }
        const currency = this.currency(code);
        const precision = this.safeString(currency, 'precision');
        return Precise["default"].stringMul(amount, precision);
    }
    amountToPrecision(symbol, amount) {
        symbol = this.safeSymbol(symbol);
        const market = this.market(symbol);
        const oldPrecision = this.safeValue(this.options, 'oldPrecision');
        if (market['spot'] && !oldPrecision) {
            amount = this.convertFromRealAmount(market['base'], amount);
        }
        return super.amountToPrecision(symbol, amount);
    }
    convertFromRawQuantity(symbol, rawQuantity, currencySide = 'base') {
        if (this.safeValue(this.options, 'oldPrecision')) {
            return this.parseNumber(rawQuantity);
        }
        symbol = this.safeSymbol(symbol);
        const marketExists = this.inArray(symbol, this.symbols);
        if (!marketExists) {
            return this.parseNumber(rawQuantity);
        }
        const market = this.market(symbol);
        if (market['spot']) {
            return this.parseNumber(this.convertToRealAmount(market[currencySide], rawQuantity));
        }
        return this.parseNumber(rawQuantity);
    }
    convertFromRawCost(symbol, rawQuantity) {
        return this.convertFromRawQuantity(symbol, rawQuantity, 'quote');
    }
    /**
     * @method
     * @name bitmex#fetchMarkets
     * @description retrieves data on all markets for bitmex
     * @see https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActive
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetInstrumentActive(params);
        //
        //  [
        //    {
        //        "symbol": "LTCUSDT",
        //        "rootSymbol": "LTC",
        //        "state": "Open",
        //        "typ": "FFWCSX",
        //        "listing": "2021-11-10T04:00:00.000Z",
        //        "front": "2021-11-10T04:00:00.000Z",
        //        "expiry": null,
        //        "settle": null,
        //        "listedSettle": null,
        //        "relistInterval": null,
        //        "inverseLeg": "",
        //        "sellLeg": "",
        //        "buyLeg": "",
        //        "optionStrikePcnt": null,
        //        "optionStrikeRound": null,
        //        "optionStrikePrice": null,
        //        "optionMultiplier": null,
        //        "positionCurrency": "LTC", // can be empty for spot markets
        //        "underlying": "LTC",
        //        "quoteCurrency": "USDT",
        //        "underlyingSymbol": "LTCT=", // can be empty for spot markets
        //        "reference": "BMEX",
        //        "referenceSymbol": ".BLTCT", // can be empty for spot markets
        //        "calcInterval": null,
        //        "publishInterval": null,
        //        "publishTime": null,
        //        "maxOrderQty": 1000000000,
        //        "maxPrice": 1000000,
        //        "lotSize": 1000,
        //        "tickSize": 0.01,
        //        "multiplier": 100,
        //        "settlCurrency": "USDt", // can be empty for spot markets
        //        "underlyingToPositionMultiplier": 10000,
        //        "underlyingToSettleMultiplier": null,
        //        "quoteToSettleMultiplier": 1000000,
        //        "isQuanto": false,
        //        "isInverse": false,
        //        "initMargin": 0.03,
        //        "maintMargin": 0.015,
        //        "riskLimit": 1000000000000, // can be null for spot markets
        //        "riskStep": 1000000000000, // can be null for spot markets
        //        "limit": null,
        //        "capped": false,
        //        "taxed": true,
        //        "deleverage": true,
        //        "makerFee": -0.0001,
        //        "takerFee": 0.0005,
        //        "settlementFee": 0,
        //        "insuranceFee": 0,
        //        "fundingBaseSymbol": ".LTCBON8H", // can be empty for spot markets
        //        "fundingQuoteSymbol": ".USDTBON8H", // can be empty for spot markets
        //        "fundingPremiumSymbol": ".LTCUSDTPI8H", // can be empty for spot markets
        //        "fundingTimestamp": "2022-01-14T20:00:00.000Z",
        //        "fundingInterval": "2000-01-01T08:00:00.000Z",
        //        "fundingRate": 0.0001,
        //        "indicativeFundingRate": 0.0001,
        //        "rebalanceTimestamp": null,
        //        "rebalanceInterval": null,
        //        "openingTimestamp": "2022-01-14T17:00:00.000Z",
        //        "closingTimestamp": "2022-01-14T18:00:00.000Z",
        //        "sessionInterval": "2000-01-01T01:00:00.000Z",
        //        "prevClosePrice": 138.511,
        //        "limitDownPrice": null,
        //        "limitUpPrice": null,
        //        "bankruptLimitDownPrice": null,
        //        "bankruptLimitUpPrice": null,
        //        "prevTotalVolume": 12699024000,
        //        "totalVolume": 12702160000,
        //        "volume": 3136000,
        //        "volume24h": 114251000,
        //        "prevTotalTurnover": 232418052349000,
        //        "totalTurnover": 232463353260000,
        //        "turnover": 45300911000,
        //        "turnover24h": 1604331340000,
        //        "homeNotional24h": 11425.1,
        //        "foreignNotional24h": 1604331.3400000003,
        //        "prevPrice24h": 135.48,
        //        "vwap": 140.42165,
        //        "highPrice": 146.42,
        //        "lowPrice": 135.08,
        //        "lastPrice": 144.36,
        //        "lastPriceProtected": 144.36,
        //        "lastTickDirection": "MinusTick",
        //        "lastChangePcnt": 0.0655,
        //        "bidPrice": 143.75,
        //        "midPrice": 143.855,
        //        "askPrice": 143.96,
        //        "impactBidPrice": 143.75,
        //        "impactMidPrice": 143.855,
        //        "impactAskPrice": 143.96,
        //        "hasLiquidity": true,
        //        "openInterest": 38103000,
        //        "openValue": 547963053300,
        //        "fairMethod": "FundingRate",
        //        "fairBasisRate": 0.1095,
        //        "fairBasis": 0.004,
        //        "fairPrice": 143.811,
        //        "markMethod": "FairPrice",
        //        "markPrice": 143.811,
        //        "indicativeTaxRate": null,
        //        "indicativeSettlePrice": 143.807,
        //        "optionUnderlyingPrice": null,
        //        "settledPriceAdjustmentRate": null,
        //        "settledPrice": null,
        //        "timestamp": "2022-01-14T17:49:55.000Z"
        //    }
        //  ]
        //
        return this.parseMarkets(response);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'symbol');
        let baseId = this.safeString(market, 'underlying');
        let quoteId = this.safeString(market, 'quoteCurrency');
        const settleId = this.safeString(market, 'settlCurrency');
        const settle = this.safeCurrencyCode(settleId);
        // 'positionCurrency' may be empty ("", as Bitmex currently returns for ETHUSD)
        // so let's take the settlCurrency first and then adjust if needed
        const typ = this.safeString(market, 'typ'); // type definitions at: https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_get
        let type;
        let swap = false;
        let spot = false;
        let future = false;
        if (typ === 'FFWCSX') {
            type = 'swap';
            swap = true;
        }
        else if (typ === 'IFXXXP') {
            type = 'spot';
            spot = true;
        }
        else if (typ === 'FFCCSX') {
            type = 'future';
            future = true;
        }
        else if (typ === 'FFICSX') {
            // prediction markets (without any volume)
            quoteId = baseId;
            baseId = this.safeString(market, 'rootSymbol');
            type = 'future';
            future = true;
        }
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const contract = swap || future;
        let contractSize = undefined;
        const isInverse = this.safeValue(market, 'isInverse'); // this is true when BASE and SETTLE are same, i.e. BTC/XXX:BTC
        const isQuanto = this.safeValue(market, 'isQuanto'); // this is true when BASE and SETTLE are different, i.e. AXS/XXX:BTC
        const linear = contract ? (!isInverse && !isQuanto) : undefined;
        const status = this.safeString(market, 'state');
        const active = status !== 'Unlisted';
        let expiry = undefined;
        let expiryDatetime = undefined;
        let symbol = undefined;
        if (spot) {
            symbol = base + '/' + quote;
        }
        else if (contract) {
            symbol = base + '/' + quote + ':' + settle;
            if (linear) {
                const multiplierString = this.safeString2(market, 'underlyingToPositionMultiplier', 'underlyingToSettleMultiplier');
                contractSize = this.parseNumber(Precise["default"].stringDiv('1', multiplierString));
            }
            else {
                const multiplierString = Precise["default"].stringAbs(this.safeString(market, 'multiplier'));
                contractSize = this.parseNumber(multiplierString);
            }
            if (future) {
                expiryDatetime = this.safeString(market, 'expiry');
                expiry = this.parse8601(expiryDatetime);
                symbol = symbol + '-' + this.yymmdd(expiry);
            }
        }
        else {
            // for index/exotic markets, default to id
            symbol = id;
        }
        const positionId = this.safeString2(market, 'positionCurrency', 'underlying');
        const position = this.safeCurrencyCode(positionId);
        const positionIsQuote = (position === quote);
        const maxOrderQty = this.safeNumber(market, 'maxOrderQty');
        const initMargin = this.safeString(market, 'initMargin', '1');
        const maxLeverage = this.parseNumber(Precise["default"].stringDiv('1', initMargin));
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'margin': false,
            'swap': swap,
            'future': future,
            'option': false,
            'active': active,
            'contract': contract,
            'linear': linear,
            'inverse': isInverse,
            'quanto': isQuanto,
            'taker': this.safeNumber(market, 'takerFee'),
            'maker': this.safeNumber(market, 'makerFee'),
            'contractSize': contractSize,
            'expiry': expiry,
            'expiryDatetime': expiryDatetime,
            'strike': this.safeNumber(market, 'optionStrikePrice'),
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'lotSize'),
                'price': this.safeNumber(market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': contract ? this.parseNumber('1') : undefined,
                    'max': contract ? maxLeverage : undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': positionIsQuote ? undefined : maxOrderQty,
                },
                'price': {
                    'min': undefined,
                    'max': this.safeNumber(market, 'maxPrice'),
                },
                'cost': {
                    'min': undefined,
                    'max': positionIsQuote ? maxOrderQty : undefined,
                },
            },
            'created': this.parse8601(this.safeString(market, 'listing')),
            'info': market,
        };
    }
    parseBalance(response) {
        //
        //     [
        //         {
        //             "account":1455728,
        //             "currency":"XBt",
        //             "riskLimit":1000000000000,
        //             "prevState":"",
        //             "state":"",
        //             "action":"",
        //             "amount":263542,
        //             "pendingCredit":0,
        //             "pendingDebit":0,
        //             "confirmedDebit":0,
        //             "prevRealisedPnl":0,
        //             "prevUnrealisedPnl":0,
        //             "grossComm":0,
        //             "grossOpenCost":0,
        //             "grossOpenPremium":0,
        //             "grossExecCost":0,
        //             "grossMarkValue":0,
        //             "riskValue":0,
        //             "taxableMargin":0,
        //             "initMargin":0,
        //             "maintMargin":0,
        //             "sessionMargin":0,
        //             "targetExcessMargin":0,
        //             "varMargin":0,
        //             "realisedPnl":0,
        //             "unrealisedPnl":0,
        //             "indicativeTax":0,
        //             "unrealisedProfit":0,
        //             "syntheticMargin":null,
        //             "walletBalance":263542,
        //             "marginBalance":263542,
        //             "marginBalancePcnt":1,
        //             "marginLeverage":0,
        //             "marginUsedPcnt":0,
        //             "excessMargin":263542,
        //             "excessMarginPcnt":1,
        //             "availableMargin":263542,
        //             "withdrawableMargin":263542,
        //             "timestamp":"2020-08-03T12:01:01.246Z",
        //             "grossLastValue":0,
        //             "commission":null
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            const free = this.safeString(balance, 'availableMargin');
            const total = this.safeString(balance, 'marginBalance');
            account['free'] = this.convertToRealAmount(code, free);
            account['total'] = this.convertToRealAmount(code, total);
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name bitmex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.bitmex.com/api/explorer/#!/User/User_getMargin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const request = {
            'currency': 'all',
        };
        const response = await this.privateGetUserMargin(this.extend(request, params));
        //
        //     [
        //         {
        //             "account":1455728,
        //             "currency":"XBt",
        //             "riskLimit":1000000000000,
        //             "prevState":"",
        //             "state":"",
        //             "action":"",
        //             "amount":263542,
        //             "pendingCredit":0,
        //             "pendingDebit":0,
        //             "confirmedDebit":0,
        //             "prevRealisedPnl":0,
        //             "prevUnrealisedPnl":0,
        //             "grossComm":0,
        //             "grossOpenCost":0,
        //             "grossOpenPremium":0,
        //             "grossExecCost":0,
        //             "grossMarkValue":0,
        //             "riskValue":0,
        //             "taxableMargin":0,
        //             "initMargin":0,
        //             "maintMargin":0,
        //             "sessionMargin":0,
        //             "targetExcessMargin":0,
        //             "varMargin":0,
        //             "realisedPnl":0,
        //             "unrealisedPnl":0,
        //             "indicativeTax":0,
        //             "unrealisedProfit":0,
        //             "syntheticMargin":null,
        //             "walletBalance":263542,
        //             "marginBalance":263542,
        //             "marginBalancePcnt":1,
        //             "marginLeverage":0,
        //             "marginUsedPcnt":0,
        //             "excessMargin":263542,
        //             "excessMarginPcnt":1,
        //             "availableMargin":263542,
        //             "withdrawableMargin":263542,
        //             "timestamp":"2020-08-03T12:01:01.246Z",
        //             "grossLastValue":0,
        //             "commission":null
        //         }
        //     ]
        //
        return this.parseBalance(response);
    }
    /**
     * @method
     * @name bitmex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.bitmex.com/api/explorer/#!/OrderBook/OrderBook_getL2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOrderBookL2(this.extend(request, params));
        const result = {
            'symbol': symbol,
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            const side = (order['side'] === 'Sell') ? 'asks' : 'bids';
            const amount = this.convertFromRawQuantity(symbol, this.safeString(order, 'size'));
            const price = this.safeNumber(order, 'price');
            // https://github.com/ccxt/ccxt/issues/4926
            // https://github.com/ccxt/ccxt/issues/4927
            // the exchange sometimes returns null price in the orderbook
            if (price !== undefined) {
                const resultSide = result[side];
                resultSide.push([price, amount]);
            }
        }
        result['bids'] = this.sortBy(result['bids'], 0, true);
        result['asks'] = this.sortBy(result['asks'], 0);
        return result;
    }
    /**
     * @method
     * @name bitmex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        const filter = {
            'filter': {
                'orderID': id,
            },
        };
        const response = await this.fetchOrders(symbol, undefined, undefined, this.deepExtend(filter, params));
        const numResults = response.length;
        if (numResults === 1) {
            return response[0];
        }
        throw new errors.OrderNotFound(this.id + ': The order ' + id + ' not found.');
    }
    /**
     * @method
     * @name bitmex#fetchOrders
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders
     * @description fetches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the earliest time in ms to fetch orders for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOrders', symbol, since, limit, params, 100);
        }
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger2(params, 'until', 'endTime');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['endTime'] = this.iso8601(until);
        }
        request = this.deepExtend(request, params);
        // why the hassle? urlencode in python is kinda broken for nested dicts.
        // E.g. self.urlencode({"filter": {"open": True}}) will return "filter={'open':+True}"
        // Bitmex doesn't like that. Hence resorting to this hack.
        if ('filter' in request) {
            request['filter'] = this.json(request['filter']);
        }
        const response = await this.privateGetOrder(request);
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name bitmex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'filter': {
                'open': true,
            },
        };
        return await this.fetchOrders(symbol, since, limit, this.deepExtend(request, params));
    }
    /**
     * @method
     * @name bitmex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_getOrders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Bitmex barfs if you set 'open': false in the filter...
        const orders = await this.fetchOrders(symbol, since, limit, params);
        return this.filterByArray(orders, 'status', ['closed', 'canceled'], false);
    }
    /**
     * @method
     * @name bitmex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.bitmex.com/api/explorer/#!/Execution/Execution_getTradeHistory
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params, 100);
        }
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['count'] = Math.min(500, limit);
        }
        const until = this.safeInteger2(params, 'until', 'endTime');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['endTime'] = this.iso8601(until);
        }
        request = this.deepExtend(request, params);
        // why the hassle? urlencode in python is kinda broken for nested dicts.
        // E.g. self.urlencode({"filter": {"open": True}}) will return "filter={'open':+True}"
        // Bitmex doesn't like that. Hence resorting to this hack.
        if ('filter' in request) {
            request['filter'] = this.json(request['filter']);
        }
        const response = await this.privateGetExecutionTradeHistory(request);
        //
        //     [
        //         {
        //             "execID": "string",
        //             "orderID": "string",
        //             "clOrdID": "string",
        //             "clOrdLinkID": "string",
        //             "account": 0,
        //             "symbol": "string",
        //             "side": "string",
        //             "lastQty": 0,
        //             "lastPx": 0,
        //             "underlyingLastPx": 0,
        //             "lastMkt": "string",
        //             "lastLiquidityInd": "string",
        //             "simpleOrderQty": 0,
        //             "orderQty": 0,
        //             "price": 0,
        //             "displayQty": 0,
        //             "stopPx": 0,
        //             "pegOffsetValue": 0,
        //             "pegPriceType": "string",
        //             "currency": "string",
        //             "settlCurrency": "string",
        //             "execType": "string",
        //             "ordType": "string",
        //             "timeInForce": "string",
        //             "execInst": "string",
        //             "contingencyType": "string",
        //             "exDestination": "string",
        //             "ordStatus": "string",
        //             "triggered": "string",
        //             "workingIndicator": true,
        //             "ordRejReason": "string",
        //             "simpleLeavesQty": 0,
        //             "leavesQty": 0,
        //             "simpleCumQty": 0,
        //             "cumQty": 0,
        //             "avgPx": 0,
        //             "commission": 0,
        //             "tradePublishIndicator": "string",
        //             "multiLegReportingType": "string",
        //             "text": "string",
        //             "trdMatchID": "string",
        //             "execCost": 0,
        //             "execComm": 0,
        //             "homeNotional": 0,
        //             "foreignNotional": 0,
        //             "transactTime": "2019-03-05T12:47:02.762Z",
        //             "timestamp": "2019-03-05T12:47:02.762Z"
        //         }
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    parseLedgerEntryType(type) {
        const types = {
            'Withdrawal': 'transaction',
            'RealisedPNL': 'margin',
            'UnrealisedPNL': 'margin',
            'Deposit': 'transaction',
            'Transfer': 'transfer',
            'AffiliatePayout': 'referral',
            'SpotTrade': 'trade',
        };
        return this.safeString(types, type, type);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         "transactID": "69573da3-7744-5467-3207-89fd6efe7a47",
        //         "account":  24321,
        //         "currency": "XBt",
        //         "transactType": "Withdrawal", // "AffiliatePayout", "Transfer", "Deposit", "RealisedPNL", ...
        //         "amount":  -1000000,
        //         "fee":  300000,
        //         "transactStatus": "Completed", // "Canceled", ...
        //         "address": "1Ex4fkF4NhQaQdRWNoYpqiPbDBbq18Kdd9",
        //         "tx": "3BMEX91ZhhKoWtsH9QRb5dNXnmnGpiEetA",
        //         "text": "",
        //         "transactTime": "2017-03-21T20:05:14.388Z",
        //         "walletBalance":  0, // balance after
        //         "marginBalance":  null,
        //         "timestamp": "2017-03-22T13:09:23.514Z"
        //     }
        //
        // ButMEX returns the unrealized pnl from the wallet history endpoint.
        // The unrealized pnl transaction has an empty timestamp.
        // It is not related to historical pnl it has status set to "Pending".
        // Therefore it's not a part of the history at all.
        // https://github.com/ccxt/ccxt/issues/6047
        //
        //     {
        //         "transactID":"00000000-0000-0000-0000-000000000000",
        //         "account":121210,
        //         "currency":"XBt",
        //         "transactType":"UnrealisedPNL",
        //         "amount":-5508,
        //         "fee":0,
        //         "transactStatus":"Pending",
        //         "address":"XBTUSD",
        //         "tx":"",
        //         "text":"",
        //         "transactTime":null,  # ←---------------------------- null
        //         "walletBalance":139198767,
        //         "marginBalance":139193259,
        //         "timestamp":null  # ←---------------------------- null
        //     }
        //
        const id = this.safeString(item, 'transactID');
        const account = this.safeString(item, 'account');
        const referenceId = this.safeString(item, 'tx');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType(this.safeString(item, 'transactType'));
        const currencyId = this.safeString(item, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const amountString = this.safeString(item, 'amount');
        let amount = this.convertToRealAmount(code, amountString);
        let timestamp = this.parse8601(this.safeString(item, 'transactTime'));
        if (timestamp === undefined) {
            // https://github.com/ccxt/ccxt/issues/6047
            // set the timestamp to zero, 1970 Jan 1 00:00:00
            // for unrealized pnl and other transactions without a timestamp
            timestamp = 0; // see comments above
        }
        let fee = undefined;
        let feeCost = this.safeString(item, 'fee');
        if (feeCost !== undefined) {
            feeCost = this.convertToRealAmount(code, feeCost);
            fee = {
                'cost': this.parseNumber(feeCost),
                'currency': code,
            };
        }
        let after = this.safeString(item, 'walletBalance');
        if (after !== undefined) {
            after = this.convertToRealAmount(code, after);
        }
        const before = this.parseNumber(Precise["default"].stringSub(this.numberToString(after), this.numberToString(amount)));
        let direction = undefined;
        if (Precise["default"].stringLt(amountString, '0')) {
            direction = 'out';
            amount = this.convertToRealAmount(code, Precise["default"].stringAbs(amountString));
        }
        else {
            direction = 'in';
        }
        const status = this.parseTransactionStatus(this.safeString(item, 'transactStatus'));
        return this.safeLedgerEntry({
            'info': item,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'amount': this.parseNumber(amount),
            'before': before,
            'after': this.parseNumber(after),
            'status': status,
            'fee': fee,
        }, currency);
    }
    /**
     * @method
     * @name bitmex#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.bitmex.com/api/explorer/#!/User/User_getWalletHistory
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'start': 123,
        };
        //
        //     if (since !== undefined) {
        //         // date-based pagination not supported
        //     }
        //
        if (limit !== undefined) {
            request['count'] = limit;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetUserWalletHistory(this.extend(request, params));
        //
        //     [
        //         {
        //             "transactID": "69573da3-7744-5467-3207-89fd6efe7a47",
        //             "account":  24321,
        //             "currency": "XBt",
        //             "transactType": "Withdrawal", // "AffiliatePayout", "Transfer", "Deposit", "RealisedPNL", ...
        //             "amount":  -1000000,
        //             "fee":  300000,
        //             "transactStatus": "Completed", // "Canceled", ...
        //             "address": "1Ex4fkF4NhQaQdRWNoYpqiPbDBbq18Kdd9",
        //             "tx": "3BMEX91ZhhKoWtsH9QRb5dNXnmnGpiEetA",
        //             "text": "",
        //             "transactTime": "2017-03-21T20:05:14.388Z",
        //             "walletBalance":  0, // balance after
        //             "marginBalance":  null,
        //             "timestamp": "2017-03-22T13:09:23.514Z"
        //         }
        //     ]
        //
        return this.parseLedger(response, currency, since, limit);
    }
    /**
     * @method
     * @name bitmex#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://www.bitmex.com/api/explorer/#!/User/User_getWalletHistory
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'currency': 'all',
            // 'start': 123,
        };
        //
        //     if (since !== undefined) {
        //         // date-based pagination not supported
        //     }
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetUserWalletHistory(this.extend(request, params));
        const transactions = this.filterByArray(response, 'transactType', ['Withdrawal', 'Deposit'], false);
        return this.parseTransactions(transactions, currency, since, limit);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'Confirmed': 'pending',
            'Canceled': 'canceled',
            'Completed': 'ok',
            'Pending': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //    {
        //        "transactID": "ffe699c2-95ee-4c13-91f9-0faf41daec25",
        //        "account": 123456,
        //        "currency": "XBt",
        //        "network":'', // "tron" for USDt, etc...
        //        "transactType": "Withdrawal",
        //        "amount": -100100000,
        //        "fee": 100000,
        //        "transactStatus": "Completed",
        //        "address": "385cR5DM96n1HvBDMzLHPYcw89fZAXULJP",
        //        "tx": "3BMEXabcdefghijklmnopqrstuvwxyz123",
        //        "text": '',
        //        "transactTime": "2019-01-02T01:00:00.000Z",
        //        "walletBalance": 99900000, // this field might be inexistent
        //        "marginBalance": None, // this field might be inexistent
        //        "timestamp": "2019-01-02T13:00:00.000Z"
        //    }
        //
        const currencyId = this.safeString(transaction, 'currency');
        currency = this.safeCurrency(currencyId, currency);
        // For deposits, transactTime == timestamp
        // For withdrawals, transactTime is submission, timestamp is processed
        const transactTime = this.parse8601(this.safeString(transaction, 'transactTime'));
        const timestamp = this.parse8601(this.safeString(transaction, 'timestamp'));
        const type = this.safeStringLower(transaction, 'transactType');
        // Deposits have no from address or to address, withdrawals have both
        let address = undefined;
        let addressFrom = undefined;
        let addressTo = undefined;
        if (type === 'withdrawal') {
            address = this.safeString(transaction, 'address');
            addressFrom = this.safeString(transaction, 'tx');
            addressTo = address;
        }
        else if (type === 'deposit') {
            addressTo = this.safeString(transaction, 'address');
            addressFrom = this.safeString(transaction, 'tx');
        }
        const amountString = this.safeString(transaction, 'amount');
        const amountStringAbs = Precise["default"].stringAbs(amountString);
        const amount = this.convertToRealAmount(currency['code'], amountStringAbs);
        const feeCostString = this.safeString(transaction, 'fee');
        const feeCost = this.convertToRealAmount(currency['code'], feeCostString);
        let status = this.safeString(transaction, 'transactStatus');
        if (status !== undefined) {
            status = this.parseTransactionStatus(status);
        }
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'transactID'),
            'txid': this.safeString(transaction, 'tx'),
            'type': type,
            'currency': currency['code'],
            'network': this.networkIdToCode(this.safeString(transaction, 'network'), currency['code']),
            'amount': this.parseNumber(amount),
            'status': status,
            'timestamp': transactTime,
            'datetime': this.iso8601(transactTime),
            'address': address,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': timestamp,
            'internal': undefined,
            'comment': undefined,
            'fee': {
                'currency': currency['code'],
                'cost': this.parseNumber(feeCost),
                'rate': undefined,
            },
        };
    }
    /**
     * @method
     * @name bitmex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_get
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
        const response = await this.publicGetInstrument(this.extend(request, params));
        const ticker = this.safeValue(response, 0);
        if (ticker === undefined) {
            throw new errors.BadSymbol(this.id + ' fetchTicker() symbol ' + symbol + ' not found');
        }
        return this.parseTicker(ticker, market);
    }
    /**
     * @method
     * @name bitmex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActiveAndIndices
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetInstrumentActiveAndIndices(params);
        // same response as under "fetchMarkets"
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker(response[i]);
            const symbol = this.safeString(ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    parseTicker(ticker, market = undefined) {
        // see response sample under "fetchMarkets" because same endpoint is being used here
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const timestamp = this.parse8601(this.safeString(ticker, 'timestamp'));
        const open = this.safeString(ticker, 'prevPrice24h');
        const last = this.safeString(ticker, 'lastPrice');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'highPrice'),
            'low': this.safeString(ticker, 'lowPrice'),
            'bid': this.safeString(ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': this.safeString(ticker, 'vwap'),
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'homeNotional24h'),
            'quoteVolume': this.safeString(ticker, 'foreignNotional24h'),
            'markPrice': this.safeString(ticker, 'markPrice'),
            'info': ticker,
        }, market);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "timestamp":"2015-09-25T13:38:00.000Z",
        //         "symbol":"XBTUSD",
        //         "open":237.45,
        //         "high":237.45,
        //         "low":237.45,
        //         "close":237.45,
        //         "trades":0,
        //         "volume":0,
        //         "vwap":null,
        //         "lastSize":null,
        //         "turnover":0,
        //         "homeNotional":0,
        //         "foreignNotional":0
        //     }
        //
        const marketId = this.safeString(ohlcv, 'symbol');
        market = this.safeMarket(marketId, market);
        const volume = this.convertFromRawQuantity(market['symbol'], this.safeString(ohlcv, 'volume'));
        return [
            this.parse8601(this.safeString(ohlcv, 'timestamp')),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            volume,
        ];
    }
    /**
     * @method
     * @name bitmex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.bitmex.com/api/explorer/#!/Trade/Trade_getBucketed
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
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params);
        }
        // send JSON key/value pairs, such as {"key": "value"}
        // filter by individual fields and do advanced queries on timestamps
        // let filter: Dict = { 'key': 'value' };
        // send a bare series (e.g. XBU) to nearest expiring contract in that series
        // you can also send a timeframe, e.g. XBU:monthly
        // timeframes: daily, weekly, monthly, quarterly, and biquarterly
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'binSize': this.safeString(this.timeframes, timeframe, timeframe),
            'partial': true, // true == include yet-incomplete current bins
            // 'filter': filter, // filter by individual fields and do advanced queries
            // 'columns': [],    // will return all columns if omitted
            // 'start': 0,       // starting point for results (wtf?)
            // 'reverse': false, // true == newest first
            // 'endTime': '',    // ending date filter for results
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 100, max 500
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['endTime'] = this.iso8601(until);
        }
        const duration = this.parseTimeframe(timeframe) * 1000;
        const fetchOHLCVOpenTimestamp = this.safeBool(this.options, 'fetchOHLCVOpenTimestamp', true);
        // if since is not set, they will return candles starting from 2017-01-01
        if (since !== undefined) {
            let timestamp = since;
            if (fetchOHLCVOpenTimestamp) {
                timestamp = this.sum(timestamp, duration);
            }
            const startTime = this.iso8601(timestamp);
            request['startTime'] = startTime; // starting date filter for results
        }
        else {
            request['reverse'] = true;
        }
        const response = await this.publicGetTradeBucketed(this.extend(request, params));
        //
        //     [
        //         {"timestamp":"2015-09-25T13:38:00.000Z","symbol":"XBTUSD","open":237.45,"high":237.45,"low":237.45,"close":237.45,"trades":0,"volume":0,"vwap":null,"lastSize":null,"turnover":0,"homeNotional":0,"foreignNotional":0},
        //         {"timestamp":"2015-09-25T13:39:00.000Z","symbol":"XBTUSD","open":237.45,"high":237.45,"low":237.45,"close":237.45,"trades":0,"volume":0,"vwap":null,"lastSize":null,"turnover":0,"homeNotional":0,"foreignNotional":0},
        //         {"timestamp":"2015-09-25T13:40:00.000Z","symbol":"XBTUSD","open":237.45,"high":237.45,"low":237.45,"close":237.45,"trades":0,"volume":0,"vwap":null,"lastSize":null,"turnover":0,"homeNotional":0,"foreignNotional":0}
        //     ]
        //
        const result = this.parseOHLCVs(response, market, timeframe, since, limit);
        if (fetchOHLCVOpenTimestamp) {
            // bitmex returns the candle's close timestamp - https://github.com/ccxt/ccxt/issues/4446
            // we can emulate the open timestamp by shifting all the timestamps one place
            // so the previous close becomes the current open, and we drop the first candle
            for (let i = 0; i < result.length; i++) {
                result[i][0] = result[i][0] - duration;
            }
        }
        return result;
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "timestamp": "2018-08-28T00:00:02.735Z",
        //         "symbol": "XBTUSD",
        //         "side": "Buy",
        //         "size": 2000,
        //         "price": 6906.5,
        //         "tickDirection": "PlusTick",
        //         "trdMatchID": "b9a42432-0a46-6a2f-5ecc-c32e9ca4baf8",
        //         "grossValue": 28958000,
        //         "homeNotional": 0.28958,
        //         "foreignNotional": 2000
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "execID": "string",
        //         "orderID": "string",
        //         "clOrdID": "string",
        //         "clOrdLinkID": "string",
        //         "account": 0,
        //         "symbol": "string",
        //         "side": "string",
        //         "lastQty": 0,
        //         "lastPx": 0,
        //         "underlyingLastPx": 0,
        //         "lastMkt": "string",
        //         "lastLiquidityInd": "string",
        //         "simpleOrderQty": 0,
        //         "orderQty": 0,
        //         "price": 0,
        //         "displayQty": 0,
        //         "stopPx": 0,
        //         "pegOffsetValue": 0,
        //         "pegPriceType": "string",
        //         "currency": "string",
        //         "settlCurrency": "string",
        //         "execType": "string",
        //         "ordType": "string",
        //         "timeInForce": "string",
        //         "execInst": "string",
        //         "contingencyType": "string",
        //         "exDestination": "string",
        //         "ordStatus": "string",
        //         "triggered": "string",
        //         "workingIndicator": true,
        //         "ordRejReason": "string",
        //         "simpleLeavesQty": 0,
        //         "leavesQty": 0,
        //         "simpleCumQty": 0,
        //         "cumQty": 0,
        //         "avgPx": 0,
        //         "commission": 0,
        //         "tradePublishIndicator": "string",
        //         "multiLegReportingType": "string",
        //         "text": "string",
        //         "trdMatchID": "string",
        //         "execCost": 0,
        //         "execComm": 0,
        //         "homeNotional": 0,
        //         "foreignNotional": 0,
        //         "transactTime": "2019-03-05T12:47:02.762Z",
        //         "timestamp": "2019-03-05T12:47:02.762Z"
        //     }
        //
        const marketId = this.safeString(trade, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const timestamp = this.parse8601(this.safeString(trade, 'timestamp'));
        const priceString = this.safeString2(trade, 'avgPx', 'price');
        const amountString = this.convertFromRawQuantity(symbol, this.safeString2(trade, 'size', 'lastQty'));
        const execCost = this.numberToString(this.convertFromRawCost(symbol, this.safeString(trade, 'execCost')));
        const id = this.safeString(trade, 'trdMatchID');
        const order = this.safeString(trade, 'orderID');
        const side = this.safeStringLower(trade, 'side');
        // price * amount doesn't work for all symbols (e.g. XBT, ETH)
        let fee = undefined;
        const feeCostString = this.numberToString(this.convertFromRawCost(symbol, this.safeString(trade, 'execComm')));
        if (feeCostString !== undefined) {
            const currencyId = this.safeString2(trade, 'settlCurrency', 'currency');
            fee = {
                'cost': feeCostString,
                'currency': this.safeCurrencyCode(currencyId),
                'rate': this.safeString(trade, 'commission'),
            };
        }
        // Trade or Funding
        const execType = this.safeString(trade, 'execType');
        let takerOrMaker = undefined;
        if (feeCostString !== undefined && execType === 'Trade') {
            takerOrMaker = Precise["default"].stringLt(feeCostString, '0') ? 'maker' : 'taker';
        }
        const type = this.safeStringLower(trade, 'ordType');
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'cost': Precise["default"].stringAbs(execCost),
            'amount': amountString,
            'fee': fee,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'DoneForDay': 'open',
            'Canceled': 'canceled',
            'PendingCancel': 'open',
            'PendingNew': 'open',
            'Rejected': 'rejected',
            'Expired': 'expired',
            'Stopped': 'open',
            'Untriggered': 'open',
            'Triggered': 'open',
        };
        return this.safeString(statuses, status, status);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'Day': 'Day',
            'GoodTillCancel': 'GTC',
            'ImmediateOrCancel': 'IOC',
            'FillOrKill': 'FOK',
        };
        return this.safeString(timeInForces, timeInForce, timeInForce);
    }
    parseOrder(order, market = undefined) {
        //
        //     {
        //         "orderID":"56222c7a-9956-413a-82cf-99f4812c214b",
        //         "clOrdID":"",
        //         "clOrdLinkID":"",
        //         "account":1455728,
        //         "symbol":"XBTUSD",
        //         "side":"Sell",
        //         "simpleOrderQty":null,
        //         "orderQty":1,
        //         "price":40000,
        //         "displayQty":null,
        //         "stopPx":null,
        //         "pegOffsetValue":null,
        //         "pegPriceType":"",
        //         "currency":"USD",
        //         "settlCurrency":"XBt",
        //         "ordType":"Limit",
        //         "timeInForce":"GoodTillCancel",
        //         "execInst":"",
        //         "contingencyType":"",
        //         "exDestination":"XBME",
        //         "ordStatus":"New",
        //         "triggered":"",
        //         "workingIndicator":true,
        //         "ordRejReason":"",
        //         "simpleLeavesQty":null,
        //         "leavesQty":1,
        //         "simpleCumQty":null,
        //         "cumQty":0,
        //         "avgPx":null,
        //         "multiLegReportingType":"SingleSecurity",
        //         "text":"Submitted via API.",
        //         "transactTime":"2021-01-02T21:38:49.246Z",
        //         "timestamp":"2021-01-02T21:38:49.246Z"
        //     }
        //
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const qty = this.safeString(order, 'orderQty');
        let cost = undefined;
        let amount = undefined;
        let isInverse = false;
        if (marketId === undefined) {
            const defaultSubType = this.safeString(this.options, 'defaultSubType', 'linear');
            isInverse = (defaultSubType === 'inverse');
        }
        else {
            isInverse = this.safeBool(market, 'inverse', false);
        }
        if (isInverse) {
            cost = this.convertFromRawQuantity(symbol, qty);
        }
        else {
            amount = this.convertFromRawQuantity(symbol, qty);
        }
        const average = this.safeString(order, 'avgPx');
        let filled = undefined;
        const cumQty = this.numberToString(this.convertFromRawQuantity(symbol, this.safeString(order, 'cumQty')));
        if (isInverse) {
            filled = Precise["default"].stringDiv(cumQty, average);
        }
        else {
            filled = cumQty;
        }
        const execInst = this.safeString(order, 'execInst');
        let postOnly = undefined;
        if (execInst !== undefined) {
            postOnly = (execInst === 'ParticipateDoNotInitiate');
        }
        const timestamp = this.parse8601(this.safeString(order, 'timestamp'));
        const triggerPrice = this.safeNumber(order, 'stopPx');
        const remaining = this.safeString(order, 'leavesQty');
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'orderID'),
            'clientOrderId': this.safeString(order, 'clOrdID'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.parse8601(this.safeString(order, 'transactTime')),
            'symbol': symbol,
            'type': this.safeStringLower(order, 'ordType'),
            'timeInForce': this.parseTimeInForce(this.safeString(order, 'timeInForce')),
            'postOnly': postOnly,
            'side': this.safeStringLower(order, 'side'),
            'price': this.safeString(order, 'price'),
            'triggerPrice': triggerPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': this.convertFromRawQuantity(symbol, remaining),
            'status': this.parseOrderStatus(this.safeString(order, 'ordStatus')),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    /**
     * @method
     * @name bitmex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.bitmex.com/api/explorer/#!/Trade/Trade_get
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchTrades', symbol, since, limit, params);
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = this.iso8601(since);
        }
        else {
            // by default reverse=false, i.e. trades are fetched since the time of market inception (year 2015 for XBTUSD)
            request['reverse'] = true;
        }
        if (limit !== undefined) {
            request['count'] = Math.min(limit, 1000); // api maximum 1000
        }
        const until = this.safeInteger2(params, 'until', 'endTime');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['endTime'] = this.iso8601(until);
        }
        const response = await this.publicGetTrade(this.extend(request, params));
        //
        //     [
        //         {
        //             "timestamp": "2018-08-28T00:00:02.735Z",
        //             "symbol": "XBTUSD",
        //             "side": "Buy",
        //             "size": 2000,
        //             "price": 6906.5,
        //             "tickDirection": "PlusTick",
        //             "trdMatchID": "b9a42432-0a46-6a2f-5ecc-c32e9ca4baf8",
        //             "grossValue": 28958000,
        //             "homeNotional": 0.28958,
        //             "foreignNotional": 2000
        //         },
        //         {
        //             "timestamp": "2018-08-28T00:00:03.778Z",
        //             "symbol": "XBTUSD",
        //             "side": "Sell",
        //             "size": 1000,
        //             "price": 6906,
        //             "tickDirection": "MinusTick",
        //             "trdMatchID": "0d4f1682-5270-a800-569b-4a0eb92db97c",
        //             "grossValue": 14480000,
        //             "homeNotional": 0.1448,
        //             "foreignNotional": 1000
        //         },
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    /**
     * @method
     * @name bitmex#createOrder
     * @description create a trade order
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_new
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.triggerPrice] the price at which a trigger order is triggered at
     * @param {object} [params.triggerDirection] the direction whenever the trigger happens with relation to price - 'above' or 'below'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @returns {object} an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let orderType = this.capitalize(type);
        const reduceOnly = this.safeValue(params, 'reduceOnly');
        if (reduceOnly !== undefined) {
            if ((!market['swap']) && (!market['future'])) {
                throw new errors.InvalidOrder(this.id + ' createOrder() does not support reduceOnly for ' + market['type'] + ' orders, reduceOnly orders are supported for swap and future markets only');
            }
        }
        const brokerId = this.safeString(this.options, 'brokerId', 'CCXT');
        const qty = this.parseToInt(this.amountToPrecision(symbol, amount));
        const request = {
            'symbol': market['id'],
            'side': this.capitalize(side),
            'orderQty': qty,
            'ordType': orderType,
            'text': brokerId,
        };
        // support for unified trigger format
        const triggerPrice = this.safeNumberN(params, ['triggerPrice', 'stopPx', 'stopPrice']);
        let trailingAmount = this.safeString2(params, 'trailingAmount', 'pegOffsetValue');
        const isTriggerOrder = triggerPrice !== undefined;
        const isTrailingAmountOrder = trailingAmount !== undefined;
        if (isTriggerOrder || isTrailingAmountOrder) {
            const triggerDirection = this.safeString(params, 'triggerDirection');
            const triggerAbove = (triggerDirection === 'above');
            if ((type === 'limit') || (type === 'market')) {
                this.checkRequiredArgument('createOrder', triggerDirection, 'triggerDirection', ['above', 'below']);
            }
            if (type === 'limit') {
                if (side === 'buy') {
                    orderType = triggerAbove ? 'StopLimit' : 'LimitIfTouched';
                }
                else {
                    orderType = triggerAbove ? 'LimitIfTouched' : 'StopLimit';
                }
            }
            else if (type === 'market') {
                if (side === 'buy') {
                    orderType = triggerAbove ? 'Stop' : 'MarketIfTouched';
                }
                else {
                    orderType = triggerAbove ? 'MarketIfTouched' : 'Stop';
                }
            }
            if (isTrailingAmountOrder) {
                const isStopSellOrder = (side === 'sell') && ((orderType === 'Stop') || (orderType === 'StopLimit'));
                const isBuyIfTouchedOrder = (side === 'buy') && ((orderType === 'MarketIfTouched') || (orderType === 'LimitIfTouched'));
                if (isStopSellOrder || isBuyIfTouchedOrder) {
                    trailingAmount = '-' + trailingAmount;
                }
                request['pegOffsetValue'] = this.parseToNumeric(trailingAmount);
                request['pegPriceType'] = 'TrailingStopPeg';
            }
            else {
                if (triggerPrice === undefined) {
                    // if exchange specific trigger types were provided
                    throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a triggerPrice parameter for the ' + orderType + ' order type');
                }
                request['stopPx'] = this.parseToNumeric(this.priceToPrecision(symbol, triggerPrice));
            }
            request['ordType'] = orderType;
            params = this.omit(params, ['triggerPrice', 'stopPrice', 'stopPx', 'triggerDirection', 'trailingAmount']);
        }
        if ((orderType === 'Limit') || (orderType === 'StopLimit') || (orderType === 'LimitIfTouched')) {
            request['price'] = this.parseToNumeric(this.priceToPrecision(symbol, price));
        }
        const clientOrderId = this.safeString2(params, 'clOrdID', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
            params = this.omit(params, ['clOrdID', 'clientOrderId']);
        }
        const response = await this.privatePostOrder(this.extend(request, params));
        return this.parseOrder(response, market);
    }
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let trailingAmount = this.safeString2(params, 'trailingAmount', 'pegOffsetValue');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        if (isTrailingAmountOrder) {
            const triggerDirection = this.safeString(params, 'triggerDirection');
            const triggerAbove = (triggerDirection === 'above');
            if ((type === 'limit') || (type === 'market')) {
                this.checkRequiredArgument('createOrder', triggerDirection, 'triggerDirection', ['above', 'below']);
            }
            let orderType = undefined;
            if (type === 'limit') {
                if (side === 'buy') {
                    orderType = triggerAbove ? 'StopLimit' : 'LimitIfTouched';
                }
                else {
                    orderType = triggerAbove ? 'LimitIfTouched' : 'StopLimit';
                }
            }
            else if (type === 'market') {
                if (side === 'buy') {
                    orderType = triggerAbove ? 'Stop' : 'MarketIfTouched';
                }
                else {
                    orderType = triggerAbove ? 'MarketIfTouched' : 'Stop';
                }
            }
            const isStopSellOrder = (side === 'sell') && ((orderType === 'Stop') || (orderType === 'StopLimit'));
            const isBuyIfTouchedOrder = (side === 'buy') && ((orderType === 'MarketIfTouched') || (orderType === 'LimitIfTouched'));
            if (isStopSellOrder || isBuyIfTouchedOrder) {
                trailingAmount = '-' + trailingAmount;
            }
            request['pegOffsetValue'] = this.parseToNumeric(trailingAmount);
            params = this.omit(params, ['triggerDirection', 'trailingAmount']);
        }
        const origClOrdID = this.safeString2(params, 'origClOrdID', 'clientOrderId');
        if (origClOrdID !== undefined) {
            request['origClOrdID'] = origClOrdID;
            const clientOrderId = this.safeString(params, 'clOrdID', 'clientOrderId');
            if (clientOrderId !== undefined) {
                request['clOrdID'] = clientOrderId;
            }
            params = this.omit(params, ['origClOrdID', 'clOrdID', 'clientOrderId']);
        }
        else {
            request['orderID'] = id;
        }
        if (amount !== undefined) {
            const qty = this.parseToInt(this.amountToPrecision(symbol, amount));
            request['orderQty'] = qty;
        }
        if (price !== undefined) {
            request['price'] = price;
        }
        const brokerId = this.safeString(this.options, 'brokerId', 'CCXT');
        request['text'] = brokerId;
        const response = await this.privatePutOrder(this.extend(request, params));
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name bitmex#cancelOrder
     * @description cancels an open order
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_cancel
     * @param {string} id order id
     * @param {string} symbol not used by bitmex cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        // https://github.com/ccxt/ccxt/issues/6507
        const clientOrderId = this.safeValue2(params, 'clOrdID', 'clientOrderId');
        const request = {};
        if (clientOrderId === undefined) {
            request['orderID'] = id;
        }
        else {
            request['clOrdID'] = clientOrderId;
            params = this.omit(params, ['clOrdID', 'clientOrderId']);
        }
        const response = await this.privateDeleteOrder(this.extend(request, params));
        const order = this.safeValue(response, 0, {});
        const error = this.safeString(order, 'error');
        if (error !== undefined) {
            if (error.indexOf('Unable to cancel order due to existing state') >= 0) {
                throw new errors.OrderNotFound(this.id + ' cancelOrder() failed: ' + error);
            }
        }
        return this.parseOrder(order);
    }
    /**
     * @method
     * @name bitmex#cancelOrders
     * @description cancel multiple orders
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_cancel
     * @param {string[]} ids order ids
     * @param {string} symbol not used by bitmex cancelOrders ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        // return await this.cancelOrder (ids, symbol, params);
        await this.loadMarkets();
        // https://github.com/ccxt/ccxt/issues/6507
        const clientOrderId = this.safeValue2(params, 'clOrdID', 'clientOrderId');
        const request = {};
        if (clientOrderId === undefined) {
            request['orderID'] = ids;
        }
        else {
            request['clOrdID'] = clientOrderId;
            params = this.omit(params, ['clOrdID', 'clientOrderId']);
        }
        const response = await this.privateDeleteOrder(this.extend(request, params));
        return this.parseOrders(response);
    }
    /**
     * @method
     * @name bitmex#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_cancelAll
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateDeleteOrderAll(this.extend(request, params));
        //
        //     [
        //         {
        //             "orderID": "string",
        //             "clOrdID": "string",
        //             "clOrdLinkID": "string",
        //             "account": 0,
        //             "symbol": "string",
        //             "side": "string",
        //             "simpleOrderQty": 0,
        //             "orderQty": 0,
        //             "price": 0,
        //             "displayQty": 0,
        //             "stopPx": 0,
        //             "pegOffsetValue": 0,
        //             "pegPriceType": "string",
        //             "currency": "string",
        //             "settlCurrency": "string",
        //             "ordType": "string",
        //             "timeInForce": "string",
        //             "execInst": "string",
        //             "contingencyType": "string",
        //             "exDestination": "string",
        //             "ordStatus": "string",
        //             "triggered": "string",
        //             "workingIndicator": true,
        //             "ordRejReason": "string",
        //             "simpleLeavesQty": 0,
        //             "leavesQty": 0,
        //             "simpleCumQty": 0,
        //             "cumQty": 0,
        //             "avgPx": 0,
        //             "multiLegReportingType": "string",
        //             "text": "string",
        //             "transactTime": "2020-06-01T09:36:35.290Z",
        //             "timestamp": "2020-06-01T09:36:35.290Z"
        //         }
        //     ]
        //
        return this.parseOrders(response, market);
    }
    /**
     * @method
     * @name bitmex#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://www.bitmex.com/api/explorer/#!/Order/Order_cancelAllAfter
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    async cancelAllOrdersAfter(timeout, params = {}) {
        await this.loadMarkets();
        const request = {
            'timeout': (timeout > 0) ? this.parseToInt(timeout / 1000) : 0,
        };
        const response = await this.privatePostOrderCancelAllAfter(this.extend(request, params));
        //
        //     {
        //         now: '2024-04-09T09:01:56.560Z',
        //         cancelTime: '2024-04-09T09:01:56.660Z'
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name bitmex#fetchLeverages
     * @description fetch the set leverage for all contract markets
     * @see https://www.bitmex.com/api/explorer/#!/Position/Position_get
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverages(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const leverages = await this.fetchPositions(symbols, params);
        return this.parseLeverages(leverages, symbols, 'symbol');
    }
    parseLeverage(leverage, market = undefined) {
        const marketId = this.safeString(leverage, 'symbol');
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': this.safeStringLower(leverage, 'marginMode'),
            'longLeverage': this.safeInteger(leverage, 'leverage'),
            'shortLeverage': this.safeInteger(leverage, 'leverage'),
        };
    }
    /**
     * @method
     * @name bitmex#fetchPositions
     * @description fetch all open positions
     * @see https://www.bitmex.com/api/explorer/#!/Position/Position_get
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetPosition(params);
        //
        //     [
        //         {
        //             "account": 0,
        //             "symbol": "string",
        //             "currency": "string",
        //             "underlying": "string",
        //             "quoteCurrency": "string",
        //             "commission": 0,
        //             "initMarginReq": 0,
        //             "maintMarginReq": 0,
        //             "riskLimit": 0,
        //             "leverage": 0,
        //             "crossMargin": true,
        //             "deleveragePercentile": 0,
        //             "rebalancedPnl": 0,
        //             "prevRealisedPnl": 0,
        //             "prevUnrealisedPnl": 0,
        //             "prevClosePrice": 0,
        //             "openingTimestamp": "2020-11-09T06:53:59.892Z",
        //             "openingQty": 0,
        //             "openingCost": 0,
        //             "openingComm": 0,
        //             "openOrderBuyQty": 0,
        //             "openOrderBuyCost": 0,
        //             "openOrderBuyPremium": 0,
        //             "openOrderSellQty": 0,
        //             "openOrderSellCost": 0,
        //             "openOrderSellPremium": 0,
        //             "execBuyQty": 0,
        //             "execBuyCost": 0,
        //             "execSellQty": 0,
        //             "execSellCost": 0,
        //             "execQty": 0,
        //             "execCost": 0,
        //             "execComm": 0,
        //             "currentTimestamp": "2020-11-09T06:53:59.893Z",
        //             "currentQty": 0,
        //             "currentCost": 0,
        //             "currentComm": 0,
        //             "realisedCost": 0,
        //             "unrealisedCost": 0,
        //             "grossOpenCost": 0,
        //             "grossOpenPremium": 0,
        //             "grossExecCost": 0,
        //             "isOpen": true,
        //             "markPrice": 0,
        //             "markValue": 0,
        //             "riskValue": 0,
        //             "homeNotional": 0,
        //             "foreignNotional": 0,
        //             "posState": "string",
        //             "posCost": 0,
        //             "posCost2": 0,
        //             "posCross": 0,
        //             "posInit": 0,
        //             "posComm": 0,
        //             "posLoss": 0,
        //             "posMargin": 0,
        //             "posMaint": 0,
        //             "posAllowance": 0,
        //             "taxableMargin": 0,
        //             "initMargin": 0,
        //             "maintMargin": 0,
        //             "sessionMargin": 0,
        //             "targetExcessMargin": 0,
        //             "varMargin": 0,
        //             "realisedGrossPnl": 0,
        //             "realisedTax": 0,
        //             "realisedPnl": 0,
        //             "unrealisedGrossPnl": 0,
        //             "longBankrupt": 0,
        //             "shortBankrupt": 0,
        //             "taxBase": 0,
        //             "indicativeTaxRate": 0,
        //             "indicativeTax": 0,
        //             "unrealisedTax": 0,
        //             "unrealisedPnl": 0,
        //             "unrealisedPnlPcnt": 0,
        //             "unrealisedRoePcnt": 0,
        //             "simpleQty": 0,
        //             "simpleCost": 0,
        //             "simpleValue": 0,
        //             "simplePnl": 0,
        //             "simplePnlPcnt": 0,
        //             "avgCostPrice": 0,
        //             "avgEntryPrice": 0,
        //             "breakEvenPrice": 0,
        //             "marginCallPrice": 0,
        //             "liquidationPrice": 0,
        //             "bankruptPrice": 0,
        //             "timestamp": "2020-11-09T06:53:59.894Z",
        //             "lastPrice": 0,
        //             "lastValue": 0
        //         }
        //     ]
        //
        const results = this.parsePositions(response, symbols);
        return this.filterByArrayPositions(results, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "account": 9371654,
        //         "symbol": "ETHUSDT",
        //         "currency": "USDt",
        //         "underlying": "ETH",
        //         "quoteCurrency": "USDT",
        //         "commission": 0.00075,
        //         "initMarginReq": 0.3333333333333333,
        //         "maintMarginReq": 0.01,
        //         "riskLimit": 1000000000000,
        //         "leverage": 3,
        //         "crossMargin": false,
        //         "deleveragePercentile": 1,
        //         "rebalancedPnl": 0,
        //         "prevRealisedPnl": 0,
        //         "prevUnrealisedPnl": 0,
        //         "prevClosePrice": 2053.738,
        //         "openingTimestamp": "2022-05-21T04:00:00.000Z",
        //         "openingQty": 0,
        //         "openingCost": 0,
        //         "openingComm": 0,
        //         "openOrderBuyQty": 0,
        //         "openOrderBuyCost": 0,
        //         "openOrderBuyPremium": 0,
        //         "openOrderSellQty": 0,
        //         "openOrderSellCost": 0,
        //         "openOrderSellPremium": 0,
        //         "execBuyQty": 2000,
        //         "execBuyCost": 39260000,
        //         "execSellQty": 0,
        //         "execSellCost": 0,
        //         "execQty": 2000,
        //         "execCost": 39260000,
        //         "execComm": 26500,
        //         "currentTimestamp": "2022-05-21T04:35:16.397Z",
        //         "currentQty": 2000,
        //         "currentCost": 39260000,
        //         "currentComm": 26500,
        //         "realisedCost": 0,
        //         "unrealisedCost": 39260000,
        //         "grossOpenCost": 0,
        //         "grossOpenPremium": 0,
        //         "grossExecCost": 39260000,
        //         "isOpen": true,
        //         "markPrice": 1964.195,
        //         "markValue": 39283900,
        //         "riskValue": 39283900,
        //         "homeNotional": 0.02,
        //         "foreignNotional": -39.2839,
        //         "posState": "",
        //         "posCost": 39260000,
        //         "posCost2": 39260000,
        //         "posCross": 0,
        //         "posInit": 13086667,
        //         "posComm": 39261,
        //         "posLoss": 0,
        //         "posMargin": 13125928,
        //         "posMaint": 435787,
        //         "posAllowance": 0,
        //         "taxableMargin": 0,
        //         "initMargin": 0,
        //         "maintMargin": 13149828,
        //         "sessionMargin": 0,
        //         "targetExcessMargin": 0,
        //         "varMargin": 0,
        //         "realisedGrossPnl": 0,
        //         "realisedTax": 0,
        //         "realisedPnl": -26500,
        //         "unrealisedGrossPnl": 23900,
        //         "longBankrupt": 0,
        //         "shortBankrupt": 0,
        //         "taxBase": 0,
        //         "indicativeTaxRate": null,
        //         "indicativeTax": 0,
        //         "unrealisedTax": 0,
        //         "unrealisedPnl": 23900,
        //         "unrealisedPnlPcnt": 0.0006,
        //         "unrealisedRoePcnt": 0.0018,
        //         "simpleQty": null,
        //         "simpleCost": null,
        //         "simpleValue": null,
        //         "simplePnl": null,
        //         "simplePnlPcnt": null,
        //         "avgCostPrice": 1963,
        //         "avgEntryPrice": 1963,
        //         "breakEvenPrice": 1964.35,
        //         "marginCallPrice": 1328.5,
        //         "liquidationPrice": 1328.5,
        //         "bankruptPrice": 1308.7,
        //         "timestamp": "2022-05-21T04:35:16.397Z",
        //         "lastPrice": 1964.195,
        //         "lastValue": 39283900
        //     }
        //
        market = this.safeMarket(this.safeString(position, 'symbol'), market);
        const symbol = market['symbol'];
        const datetime = this.safeString(position, 'timestamp');
        const crossMargin = this.safeValue(position, 'crossMargin');
        const marginMode = (crossMargin === true) ? 'cross' : 'isolated';
        const notionalString = Precise["default"].stringAbs(this.safeString2(position, 'foreignNotional', 'homeNotional'));
        const settleCurrencyCode = this.safeString(market, 'settle');
        const maintenanceMargin = this.convertToRealAmount(settleCurrencyCode, this.safeString(position, 'maintMargin'));
        const unrealisedPnl = this.convertToRealAmount(settleCurrencyCode, this.safeString(position, 'unrealisedPnl'));
        const contracts = this.parseNumber(Precise["default"].stringAbs(this.safeString(position, 'currentQty')));
        const contractSize = this.safeNumber(market, 'contractSize');
        let side = undefined;
        const homeNotional = this.safeString(position, 'homeNotional');
        if (homeNotional !== undefined) {
            if (homeNotional[0] === '-') {
                side = 'short';
            }
            else {
                side = 'long';
            }
        }
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'account'),
            'symbol': symbol,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'lastUpdateTimestamp': undefined,
            'hedged': undefined,
            'side': side,
            'contracts': contracts,
            'contractSize': contractSize,
            'entryPrice': this.safeNumber(position, 'avgEntryPrice'),
            'markPrice': this.safeNumber(position, 'markPrice'),
            'lastPrice': undefined,
            'notional': this.parseNumber(notionalString),
            'leverage': this.safeNumber(position, 'leverage'),
            'collateral': undefined,
            'initialMargin': this.safeNumber(position, 'initMargin'),
            'initialMarginPercentage': this.safeNumber(position, 'initMarginReq'),
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': this.safeNumber(position, 'maintMarginReq'),
            'unrealizedPnl': unrealisedPnl,
            'liquidationPrice': this.safeNumber(position, 'liquidationPrice'),
            'marginMode': marginMode,
            'marginRatio': undefined,
            'percentage': this.safeNumber(position, 'unrealisedPnlPcnt'),
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name bitmex#withdraw
     * @description make a withdrawal
     * @see https://www.bitmex.com/api/explorer/#!/User/User_requestWithdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        const qty = this.convertFromRealAmount(code, amount);
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        const request = {
            'currency': currency['id'],
            'amount': qty,
            'address': address,
            'network': this.networkCodeToId(networkCode, currency['code']),
            // 'otpToken': '123456', // requires if two-factor auth (OTP) is enabled
            // 'fee': 0.001, // bitcoin network fee
        };
        if (this.twofa !== undefined) {
            request['otpToken'] = totp.totp(this.twofa);
        }
        const response = await this.privatePostUserRequestWithdrawal(this.extend(request, params));
        //
        //     {
        //         "transactID": "3aece414-bb29-76c8-6c6d-16a477a51a1e",
        //         "account": 1403035,
        //         "currency": "USDt",
        //         "network": "tron",
        //         "transactType": "Withdrawal",
        //         "amount": -11000000,
        //         "fee": 1000000,
        //         "transactStatus": "Pending",
        //         "address": "TAf5JxcAQQsC2Nm2zu21XE2iDtnisxPo1x",
        //         "tx": "",
        //         "text": "",
        //         "transactTime": "2022-12-16T07:37:06.500Z",
        //         "timestamp": "2022-12-16T07:37:06.500Z",
        //     }
        //
        return this.parseTransaction(response, currency);
    }
    /**
     * @method
     * @name bitmex#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://www.bitmex.com/api/explorer/#!/Instrument/Instrument_getActiveAndIndices
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetInstrumentActiveAndIndices(params);
        // same response as under "fetchMarkets"
        const filteredResponse = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const marketId = this.safeString(item, 'symbol');
            const market = this.safeMarket(marketId);
            const swap = this.safeBool(market, 'swap', false);
            if (swap) {
                filteredResponse.push(item);
            }
        }
        symbols = this.marketSymbols(symbols);
        const result = this.parseFundingRates(filteredResponse);
        return this.filterByArray(result, 'symbol', symbols);
    }
    parseFundingRate(contract, market = undefined) {
        // see response sample under "fetchMarkets" because same endpoint is being used here
        const datetime = this.safeString(contract, 'timestamp');
        const marketId = this.safeString(contract, 'symbol');
        const fundingDatetime = this.safeString(contract, 'fundingTimestamp');
        return {
            'info': contract,
            'symbol': this.safeSymbol(marketId, market),
            'markPrice': this.safeNumber(contract, 'markPrice'),
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': this.safeNumber(contract, 'indicativeSettlePrice'),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'fundingRate': this.safeNumber(contract, 'fundingRate'),
            'fundingTimestamp': this.parse8601(fundingDatetime),
            'fundingDatetime': fundingDatetime,
            'nextFundingRate': this.safeNumber(contract, 'indicativeFundingRate'),
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
     * @name bitmex#fetchFundingRateHistory
     * @description Fetches the history of funding rates
     * @see https://www.bitmex.com/api/explorer/#!/Funding/Funding_get
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for ending date filter
     * @param {bool} [params.reverse] if true, will sort results newest first
     * @param {int} [params.start] starting point for results
     * @param {string} [params.columns] array of column names to fetch in info, if omitted, will return all columns
     * @param {string} [params.filter] generic table filter, send json key/value pairs, such as {"key": "value"}, you can key on individual fields, and do more advanced querying on timestamps, see the [timestamp docs]{@link https://www.bitmex.com/app/restAPI#Timestamp-Filters} for more details
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol in this.currencies) {
            const code = this.currency(symbol);
            request['symbol'] = code['id'];
        }
        else if (symbol !== undefined) {
            const splitSymbol = symbol.split(':');
            const splitSymbolLength = splitSymbol.length;
            const timeframes = ['nearest', 'daily', 'weekly', 'monthly', 'quarterly', 'biquarterly', 'perpetual'];
            if ((splitSymbolLength > 1) && this.inArray(splitSymbol[1], timeframes)) {
                const code = this.currency(splitSymbol[0]);
                symbol = code['id'] + ':' + splitSymbol[1];
                request['symbol'] = symbol;
            }
            else {
                market = this.market(symbol);
                request['symbol'] = market['id'];
            }
        }
        if (since !== undefined) {
            request['startTime'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['until']);
        if (until !== undefined) {
            request['endTime'] = this.iso8601(until);
        }
        if ((since === undefined) && (until === undefined)) {
            request['reverse'] = true;
        }
        const response = await this.publicGetFunding(this.extend(request, params));
        //
        //    [
        //        {
        //            "timestamp": "2016-05-07T12:00:00.000Z",
        //            "symbol": "ETHXBT",
        //            "fundingInterval": "2000-01-02T00:00:00.000Z",
        //            "fundingRate": 0.0010890000000000001,
        //            "fundingRateDaily": 0.0010890000000000001
        //        }
        //    ]
        //
        return this.parseFundingRateHistories(response, market, since, limit);
    }
    parseFundingRateHistory(info, market = undefined) {
        //
        //    {
        //        "timestamp": "2016-05-07T12:00:00.000Z",
        //        "symbol": "ETHXBT",
        //        "fundingInterval": "2000-01-02T00:00:00.000Z",
        //        "fundingRate": 0.0010890000000000001,
        //        "fundingRateDaily": 0.0010890000000000001
        //    }
        //
        const marketId = this.safeString(info, 'symbol');
        const datetime = this.safeString(info, 'timestamp');
        return {
            'info': info,
            'symbol': this.safeSymbol(marketId, market),
            'fundingRate': this.safeNumber(info, 'fundingRate'),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
        };
    }
    /**
     * @method
     * @name bitmex#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.bitmex.com/api/explorer/#!/Position/Position_updateLeverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 0.01) || (leverage > 100)) {
            throw new errors.BadRequest(this.id + ' leverage should be between 0.01 and 100');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['type'] !== 'swap' && market['type'] !== 'future') {
            throw new errors.BadSymbol(this.id + ' setLeverage() supports future and swap contracts only');
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.privatePostPositionLeverage(this.extend(request, params));
    }
    /**
     * @method
     * @name bitmex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.bitmex.com/api/explorer/#!/Position/Position_isolateMargin
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new errors.BadRequest(this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if ((market['type'] !== 'swap') && (market['type'] !== 'future')) {
            throw new errors.BadSymbol(this.id + ' setMarginMode() supports swap and future contracts only');
        }
        const enabled = (marginMode === 'cross') ? false : true;
        const request = {
            'symbol': market['id'],
            'enabled': enabled,
        };
        return await this.privatePostPositionIsolate(this.extend(request, params));
    }
    /**
     * @method
     * @name bitmex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.bitmex.com/api/explorer/#!/User/User_getDepositAddress
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] deposit chain, can view all chains via this.publicGetWalletAssets, default is eth, unless the currency has a default chain within this.options['networks']
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress requires params["network"]');
        }
        const currency = this.currency(code);
        params = this.omit(params, 'network');
        const request = {
            'currency': currency['id'],
            'network': this.networkCodeToId(networkCode, currency['code']),
        };
        const response = await this.privateGetUserDepositAddress(this.extend(request, params));
        //
        //    '"bc1qmex3puyrzn2gduqcnlu70c2uscpyaa9nm2l2j9le2lt2wkgmw33sy7ndjg"'
        //
        return {
            'info': response,
            'currency': code,
            'network': networkCode,
            'address': response.replace('"', '').replace('"', ''),
            'tag': undefined,
        };
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //        "asset": "XBT",
        //        "currency": "XBt",
        //        "majorCurrency": "XBT",
        //        "name": "Bitcoin",
        //        "currencyType": "Crypto",
        //        "scale": "8",
        //        "enabled": true,
        //        "isMarginCurrency": true,
        //        "minDepositAmount": "10000",
        //        "minWithdrawalAmount": "1000",
        //        "maxWithdrawalAmount": "100000000000000",
        //        "networks": [
        //            {
        //                "asset": "btc",
        //                "tokenAddress": '',
        //                "depositEnabled": true,
        //                "withdrawalEnabled": true,
        //                "withdrawalFee": "20000",
        //                "minFee": "20000",
        //                "maxFee": "10000000"
        //            }
        //        ]
        //    }
        //
        const networks = this.safeValue(fee, 'networks', []);
        const networksLength = networks.length;
        const result = {
            'info': fee,
            'withdraw': {
                'fee': undefined,
                'percentage': undefined,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
        if (networksLength !== 0) {
            const scale = this.safeString(fee, 'scale');
            const precision = this.parsePrecision(scale);
            for (let i = 0; i < networksLength; i++) {
                const network = networks[i];
                const networkId = this.safeString(network, 'asset');
                const currencyCode = this.safeString(currency, 'code');
                const networkCode = this.networkIdToCode(networkId, currencyCode);
                const withdrawalFeeId = this.safeString(network, 'withdrawalFee');
                const withdrawalFee = this.parseNumber(Precise["default"].stringMul(withdrawalFeeId, precision));
                result['networks'][networkCode] = {
                    'deposit': { 'fee': undefined, 'percentage': undefined },
                    'withdraw': { 'fee': withdrawalFee, 'percentage': false },
                };
                if (networksLength === 1) {
                    result['withdraw']['fee'] = withdrawalFee;
                    result['withdraw']['percentage'] = false;
                }
            }
        }
        return result;
    }
    /**
     * @method
     * @name bitmex#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://www.bitmex.com/api/explorer/#!/Wallet/Wallet_getAssetsConfig
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const assets = await this.publicGetWalletAssets(params);
        //
        //    [
        //        {
        //            "asset": "XBT",
        //            "currency": "XBt",
        //            "majorCurrency": "XBT",
        //            "name": "Bitcoin",
        //            "currencyType": "Crypto",
        //            "scale": "8",
        //            "enabled": true,
        //            "isMarginCurrency": true,
        //            "minDepositAmount": "10000",
        //            "minWithdrawalAmount": "1000",
        //            "maxWithdrawalAmount": "100000000000000",
        //            "networks": [
        //                {
        //                    "asset": "btc",
        //                    "tokenAddress": '',
        //                    "depositEnabled": true,
        //                    "withdrawalEnabled": true,
        //                    "withdrawalFee": "20000",
        //                    "minFee": "20000",
        //                    "maxFee": "10000000"
        //                }
        //            ]
        //        },
        //        ...
        //    ]
        //
        return this.parseDepositWithdrawFees(assets, codes, 'asset');
    }
    calculateRateLimiterCost(api, method, path, params, config = {}) {
        const isAuthenticated = this.checkRequiredCredentials(false);
        const cost = this.safeValue(config, 'cost', 1);
        if (cost !== 1) { // trading endpoints
            if (isAuthenticated) {
                return cost;
            }
            else {
                return 20;
            }
        }
        return cost;
    }
    /**
     * @method
     * @name bitmex#fetchLiquidations
     * @description retrieves the public liquidations of a trading pair
     * @see https://www.bitmex.com/api/explorer/#!/Liquidation/Liquidation_get
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    async fetchLiquidations(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLiquidations', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchLiquidations', symbol, since, limit, params);
        }
        const market = this.market(symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.publicGetLiquidation(this.extend(request, params));
        //
        //     [
        //         {
        //             "orderID": "string",
        //             "symbol": "string",
        //             "side": "string",
        //             "price": 0,
        //             "leavesQty": 0
        //         }
        //     ]
        //
        return this.parseLiquidations(response, market, since, limit);
    }
    parseLiquidation(liquidation, market = undefined) {
        //
        //     {
        //         "orderID": "string",
        //         "symbol": "string",
        //         "side": "string",
        //         "price": 0,
        //         "leavesQty": 0
        //     }
        //
        const marketId = this.safeString(liquidation, 'symbol');
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(marketId, market),
            'contracts': undefined,
            'contractSize': this.safeNumber(market, 'contractSize'),
            'price': this.safeNumber(liquidation, 'price'),
            'baseValue': undefined,
            'quoteValue': undefined,
            'timestamp': undefined,
            'datetime': undefined,
        });
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if (code === 429) {
            throw new errors.DDoSProtection(this.id + ' ' + body);
        }
        if (code >= 400) {
            const error = this.safeValue(response, 'error', {});
            const message = this.safeString(error, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            if (code === 400) {
                throw new errors.BadRequest(feedback);
            }
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/api/' + this.version + '/' + path;
        if (method === 'GET') {
            if (Object.keys(params).length) {
                query += '?' + this.urlencode(params);
            }
        }
        else {
            const format = this.safeString(params, '_format');
            if (format !== undefined) {
                query += '?' + this.urlencode({ '_format': format });
                params = this.omit(params, '_format');
            }
        }
        const url = this.urls['api'][api] + query;
        const isAuthenticated = this.checkRequiredCredentials(false);
        if (api === 'private' || (api === 'public' && isAuthenticated)) {
            this.checkRequiredCredentials();
            let auth = method + query;
            let expires = this.safeInteger(this.options, 'api-expires');
            headers = {
                'Content-Type': 'application/json',
                'api-key': this.apiKey,
            };
            expires = this.sum(this.seconds(), expires);
            const stringExpires = expires.toString();
            auth += stringExpires;
            headers['api-expires'] = stringExpires;
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (Object.keys(params).length) {
                    body = this.json(params);
                    auth += body;
                }
            }
            headers['api-signature'] = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = bitmex;
