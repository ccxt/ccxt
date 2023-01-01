'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountNotEnabled, InvalidAddress, ExchangeError, BadRequest, AuthenticationError, RateLimitExceeded, BadSymbol, InvalidOrder, InsufficientFunds, ArgumentsRequired, OrderNotFound, PermissionDenied, NotSupported } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class mexc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mexc',
            'name': 'MEXC Global',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 50, // default rate limit is 20 times per second
            'version': 'v2',
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchLeverage': undefined,
                'fetchLeverageTiers': true,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransfer': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg',
                'api': {
                    'spot': {
                        'public': 'https://www.mexc.com/open/api/v2',
                        'private': 'https://www.mexc.com/open/api/v2',
                    },
                    'contract': {
                        'public': 'https://contract.mexc.com/api/v1/contract',
                        'private': 'https://contract.mexc.com/api/v1/private',
                    },
                },
                'www': 'https://www.mexc.com/',
                'doc': [
                    'https://mxcdevelop.github.io/APIDoc/',
                ],
                'fees': [
                    'https://www.mexc.com/fee',
                ],
                'referral': 'https://m.mexc.com/auth/signup?inviteCode=1FQ1G',
            },
            'api': {
                'contract': {
                    'public': {
                        'get': {
                            'ping': 2,
                            'detail': 2,
                            'support_currencies': 2,
                            'depth/{symbol}': 2,
                            'depth_commits/{symbol}/{limit}': 2,
                            'index_price/{symbol}': 2,
                            'fair_price/{symbol}': 2,
                            'funding_rate/{symbol}': 2,
                            'kline/{symbol}': 2,
                            'kline/index_price/{symbol}': 2,
                            'kline/fair_price/{symbol}': 2,
                            'deals/{symbol}': 2,
                            'ticker': 2,
                            'risk_reverse': 2,
                            'risk_reverse/history': 2,
                            'funding_rate/history': 2,
                        },
                    },
                    'private': {
                        'get': {
                            'account/assets': 2,
                            'account/asset/{currency}': 2,
                            'account/transfer_record': 2,
                            'position/list/history_positions': 2,
                            'position/open_positions': 2,
                            'position/funding_records': 2,
                            'position/position_mode': 2,
                            'order/list/open_orders/{symbol}': 2,
                            'order/list/history_orders': 2,
                            'order/external/{symbol}/{external_oid}': 2,
                            'order/get/{order_id}': 2,
                            'order/batch_query': 8,
                            'order/deal_details/{order_id}': 2,
                            'order/list/order_deals': 2,
                            'planorder/list/orders': 2,
                            'stoporder/list/orders': 2,
                            'stoporder/order_details/{stop_order_id}': 2,
                            'account/risk_limit': 2,
                            'account/tiered_fee_rate': 2,
                        },
                        'post': {
                            'position/change_margin': 2,
                            'position/change_leverage': 2,
                            'position/change_position_mode': 2,
                            'order/submit': 2,
                            'order/submit_batch': 40,
                            'order/cancel': 2,
                            'order/cancel_with_external': 2,
                            'order/cancel_all': 2,
                            'account/change_risk_level': 2,
                            'planorder/place': 2,
                            'planorder/cancel': 2,
                            'planorder/cancel_all': 2,
                            'stoporder/cancel': 2,
                            'stoporder/cancel_all': 2,
                            'stoporder/change_price': 2,
                            'stoporder/change_plan_price': 2,
                        },
                    },
                },
                'spot': {
                    'public': {
                        'get': {
                            'market/symbols': 1,
                            'market/coin/list': 2,
                            'common/timestamp': 1,
                            'common/ping': 1,
                            'market/ticker': 1,
                            'market/depth': 1,
                            'market/deals': 1,
                            'market/kline': 1,
                            'market/api_default_symbols': 2,
                        },
                    },
                    'private': {
                        'get': {
                            'account/info': 1,
                            'order/open_orders': 1,
                            'order/list': 1,
                            'order/query': 1,
                            'order/deals': 1,
                            'order/deal_detail': 1,
                            'asset/deposit/address/list': 2,
                            'asset/deposit/list': 2,
                            'asset/address/list': 2,
                            'asset/withdraw/list': 2,
                            'asset/internal/transfer/record': 10,
                            'account/balance': 10,
                            'asset/internal/transfer/info': 10,
                            'market/api_symbols': 2,
                        },
                        'post': {
                            'order/place': 1,
                            'order/place_batch': 1,
                            'asset/withdraw': 2,
                            'asset/internal/transfer': 10,
                        },
                        'delete': {
                            'order/cancel': 1,
                            'order/cancel_by_symbol': 1,
                            'asset/withdraw': 2,
                        },
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'), // maker / taker
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'options': {
                'timeframes': {
                    'spot': {
                        '1m': '1m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '1d': '1d',
                        '1M': '1M',
                    },
                    'contract': {
                        '1m': 'Min1',
                        '5m': 'Min5',
                        '15m': 'Min15',
                        '30m': 'Min30',
                        '1h': 'Min60',
                        '4h': 'Hour4',
                        '8h': 'Hour8',
                        '1d': 'Day1',
                        '1w': 'Week1',
                        '1M': 'Month1',
                    },
                },
                'defaultType': 'spot', // spot, swap
                'networks': {
                    'TRX': 'TRC20',
                    'ETH': 'ERC20',
                    'BEP20': 'BEP20(BSC)',
                    'BSC': 'BEP20(BSC)',
                },
                'accountsByType': {
                    'spot': 'MAIN',
                    'swap': 'CONTRACT',
                },
                'transfer': {
                    'accountsById': {
                        'MAIN': 'spot',
                        'CONTRACT': 'swap',
                    },
                    'status': {
                        'SUCCESS': 'ok',
                        'FAILED': 'failed',
                        'WAIT': 'pending',
                    },
                },
                'fetchOrdersByState': {
                    'method': 'spotPrivateGetOrderList', // contractPrivateGetPlanorderListOrders
                },
                'cancelOrder': {
                    'method': 'spotPrivateDeleteOrderCancel', // contractPrivatePostOrderCancel contractPrivatePostPlanorderCancel
                },
                'broker': 'CCXT',
            },
            'commonCurrencies': {
                'BEYONDPROTOCOL': 'BEYOND',
                'BIFI': 'BIFIF',
                'BYN': 'BeyondFi',
                'COFI': 'COFIX', // conflict with CoinFi
                'DFI': 'DfiStarter',
                'DFT': 'dFuture',
                'DRK': 'DRK',
                'EGC': 'Egoras Credit',
                'FLUX1': 'FLUX', // switched places
                'FLUX': 'FLUX1', // switched places
                'FREE': 'FreeRossDAO', // conflict with FREE Coin
                'GAS': 'GASDAO',
                'GMT': 'GMT Token',
                'HERO': 'Step Hero', // conflict with Metahero
                'MIMO': 'Mimosa',
                'PROS': 'Pros.Finance', // conflict with Prosper
                'SIN': 'Sin City Token',
                'SOUL': 'Soul Swap',
                'STEPN': 'GMT',
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Invalid parameter
                    '401': AuthenticationError, // Invalid signature, fail to pass the validation
                    '402': AuthenticationError, // {"success":false,"code":402,"message":"API key expired!"}
                    '403': PermissionDenied, // {"msg":"no permission to access the endpoint","code":403}
                    '429': RateLimitExceeded, // too many requests, rate limit rule is violated
                    '703': PermissionDenied, // Require trade read permission!
                    '1000': AccountNotEnabled, // {"success":false,"code":1000,"message":"Please open contract account first!"}
                    '1002': InvalidOrder, // {"success":false,"code":1002,"message":"Contract not allow place order!"}
                    '10072': AuthenticationError, // Invalid access key
                    '10073': AuthenticationError, // Invalid request time
                    '10075': PermissionDenied, // {"msg":"IP [xxx.xxx.xxx.xxx] not in the ip white list","code":10075}
                    '10101': InsufficientFunds, // {"code":10101,"msg":"Insufficient balance"}
                    '10216': InvalidAddress, // {"code":10216,"msg":"No available deposit address"}
                    '10232': BadSymbol, // {"code":10232,"msg":"The currency not exist"}
                    '30000': BadSymbol, // Trading is suspended for the requested symbol
                    '30001': InvalidOrder, // Current trading type (bid or ask) is not allowed
                    '30002': InvalidOrder, // Invalid trading amount, smaller than the symbol minimum trading amount
                    '30003': InvalidOrder, // Invalid trading amount, greater than the symbol maximum trading amount
                    '30004': InsufficientFunds, // Insufficient balance
                    '30005': InvalidOrder, // Oversell error
                    '30010': InvalidOrder, // Price out of allowed range
                    '30014': BadSymbol, // {"msg":"invalid symbol","code":30014}
                    '30016': BadSymbol, // Market is closed
                    '30019': InvalidOrder, // Orders count over limit for batch processing
                    '30020': BadSymbol, // Restricted symbol, API access is not allowed for the time being
                    '30021': BadSymbol, // Invalid symbol
                    '33333': BadSymbol, // {"code":33333,"msg":"currency can not be null"}
                },
                'broad': {
                    'price and quantity must be positive': InvalidOrder, // {"msg":"price and quantity must be positive","code":400}
                },
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name mexc#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetCommonTimestamp',
            'swap': 'contractPublicGetPing',
        });
        const response = await this[method] (this.extend (query));
        //
        // spot
        //
        //     {
        //         "code":200,
        //         "data":1633375641837
        //     }
        //
        // contract
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":1634095541710
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name mexc#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
        const response = await this.spotPublicGetCommonPing (params);
        //
        //     { "code":200 }
        //
        const code = this.safeInteger (response, 'code');
        const status = (code === 200) ? 'ok' : 'maintenance';
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name mexc#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.spotPublicGetMarketCoinList (params);
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "currency":"AGLD",
        //                 "coins":[
        //                     {
        //                         "chain":"ERC20",
        //                         "precision":18,
        //                         "fee":8.09,
        //                         "is_withdraw_enabled":true,
        //                         "is_deposit_enabled":true,
        //                         "deposit_min_confirm":16,
        //                         "withdraw_limit_max":500000.0,
        //                         "withdraw_limit_min":14.0
        //                     }
        //                 ],
        //                 "full_name":"Adventure Gold"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'full_name');
            let currencyActive = false;
            let minPrecision = undefined;
            let currencyFee = undefined;
            let currencyWithdrawMin = undefined;
            let currencyWithdrawMax = undefined;
            const networks = {};
            const chains = this.safeValue (currency, 'coins', []);
            let depositEnabled = false;
            let withdrawEnabled = false;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const network = this.safeNetwork (networkId);
                const isDepositEnabled = this.safeValue (chain, 'is_deposit_enabled', false);
                const isWithdrawEnabled = this.safeValue (chain, 'is_withdraw_enabled', false);
                const active = (isDepositEnabled && isWithdrawEnabled);
                currencyActive = active || currencyActive;
                const withdrawMin = this.safeString (chain, 'withdraw_limit_min');
                const withdrawMax = this.safeString (chain, 'withdraw_limit_max');
                currencyWithdrawMin = (currencyWithdrawMin === undefined) ? withdrawMin : currencyWithdrawMin;
                currencyWithdrawMax = (currencyWithdrawMax === undefined) ? withdrawMax : currencyWithdrawMax;
                if (Precise.stringGt (currencyWithdrawMin, withdrawMin)) {
                    currencyWithdrawMin = withdrawMin;
                }
                if (Precise.stringLt (currencyWithdrawMax, withdrawMax)) {
                    currencyWithdrawMax = withdrawMax;
                }
                if (isDepositEnabled) {
                    depositEnabled = true;
                }
                if (isWithdrawEnabled) {
                    withdrawEnabled = true;
                }
                const precision = this.parsePrecision (this.safeString (chain, 'precision'));
                if (precision !== undefined) {
                    minPrecision = (minPrecision === undefined) ? precision : Precise.stringMin (precision, minPrecision);
                }
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'active': active,
                    'deposit': isDepositEnabled,
                    'withdraw': isWithdrawEnabled,
                    'fee': this.safeNumber (chain, 'fee'),
                    'precision': this.parseNumber (minPrecision),
                    'limits': {
                        'withdraw': {
                            'min': withdrawMin,
                            'max': withdrawMax,
                        },
                    },
                };
            }
            const networkKeys = Object.keys (networks);
            const networkKeysLength = networkKeys.length;
            if ((networkKeysLength === 1) || ('NONE' in networks)) {
                const defaultNetwork = this.safeValue2 (networks, 'NONE', networkKeysLength - 1);
                if (defaultNetwork !== undefined) {
                    currencyFee = defaultNetwork['fee'];
                }
            }
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': currencyActive,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': currencyFee,
                'precision': this.parseNumber (minPrecision),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currencyWithdrawMin,
                        'max': currencyWithdrawMax,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name mexc#fetchMarkets
         * @description retrieves data on all markets for mexc
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const spot = (type === 'spot');
        const swap = (type === 'swap');
        if (!spot && !swap) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to 'spot' or 'swap''"); // eslint-disable-line quotes
        }
        if (spot) {
            return await this.fetchSpotMarkets (query);
        } else if (swap) {
            return await this.fetchContractMarkets (query);
        }
    }

    async fetchContractMarkets (params = {}) {
        const response = await this.contractPublicGetDetail (params);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"BTC_USDT",
        //                 "displayName":"BTC_USDT永续",
        //                 "displayNameEn":"BTC_USDT SWAP",
        //                 "positionOpenType":3,
        //                 "baseCoin":"BTC",
        //                 "quoteCoin":"USDT",
        //                 "settleCoin":"USDT",
        //                 "contractSize":0.0001,
        //                 "minLeverage":1,
        //                 "maxLeverage":125,
        //                 "priceScale":2,
        //                 "volScale":0,
        //                 "amountScale":4,
        //                 "priceUnit":0.5,
        //                 "volUnit":1,
        //                 "minVol":1,
        //                 "maxVol":1000000,
        //                 "bidLimitPriceRate":0.1,
        //                 "askLimitPriceRate":0.1,
        //                 "takerFeeRate":0.0006,
        //                 "makerFeeRate":0.0002,
        //                 "maintenanceMarginRate":0.004,
        //                 "initialMarginRate":0.008,
        //                 "riskBaseVol":10000,
        //                 "riskIncrVol":200000,
        //                 "riskIncrMmr":0.004,
        //                 "riskIncrImr":0.004,
        //                 "riskLevelLimit":5,
        //                 "priceCoefficientVariation":0.1,
        //                 "indexOrigin":["BINANCE","GATEIO","HUOBI","MXC"],
        //                 "state":0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //                 "isNew":false,
        //                 "isHot":true,
        //                 "isHidden":false
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCoin');
            const quoteId = this.safeString (market, 'quoteCoin');
            const settleId = this.safeString (market, 'settleCoin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const state = this.safeString (market, 'state');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote + ':' + settle,
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
                'active': (state === '0'),
                'contract': true,
                'linear': true,
                'inverse': false,
                'taker': this.safeNumber (market, 'takerFeeRate'),
                'maker': this.safeNumber (market, 'makerFeeRate'),
                'contractSize': this.safeNumber (market, 'contractSize'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'volUnit'),
                    'price': this.safeNumber (market, 'priceUnit'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (market, 'minLeverage'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minVol'),
                        'max': this.safeNumber (market, 'maxVol'),
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
                'info': market,
            });
        }
        return result;
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.spotPublicGetMarketSymbols (params);
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "symbol":"DFD_USDT",
        //                 "state":"ENABLED",
        //                 "countDownMark":1,
        //                 "vcoinName":"DFD",
        //                 "vcoinStatus":1,
        //                 "price_scale":4,
        //                 "quantity_scale":2,
        //                 "min_amount":"5", // not an amount = cost
        //                 "max_amount":"5000000",
        //                 "maker_fee_rate":"0.002",
        //                 "taker_fee_rate":"0.002",
        //                 "limited":true,
        //                 "etf_mark":0,
        //                 "symbol_partition":"ASSESS"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const response2 = await this.spotPublicGetMarketApiDefaultSymbols (params);
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "symbol":[
        //                 "ALEPH_USDT","OGN_USDT","HC_USDT",
        //              ]
        //         }
        //     }
        //
        const data2 = this.safeValue (response2, 'data', {});
        const symbols = this.safeValue (data2, 'symbol', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const state = this.safeString (market, 'state');
            let active = false;
            for (let j = 0; j < symbols.length; j++) {
                if (symbols[j] === id) {
                    if (state === 'ENABLED') {
                        active = true;
                    }
                    break;
                }
            }
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
                'taker': this.safeNumber (market, 'taker_fee_rate'),
                'maker': this.safeNumber (market, 'maker_fee_rate'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quantity_scale'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_scale'))),
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
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': this.safeNumber (market, 'max_amount'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const first = this.safeString (symbols, 0);
        let market = undefined;
        if (first !== undefined) {
            market = this.market (first);
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetMarketTicker',
            'swap': 'contractPublicGetTicker',
        });
        const response = await this[method] (this.extend (query));
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"NKN_USDT",
        //                 "lastPrice":0.36199,
        //                 "bid1":0.35908,
        //                 "ask1":0.36277,
        //                 "volume24":657754,
        //                 "amount24":239024.53998,
        //                 "holdVol":149969,
        //                 "lower24Price":0.34957,
        //                 "high24Price":0.37689,
        //                 "riseFallRate":0.0117,
        //                 "riseFallValue":0.00419,
        //                 "indexPrice":0.36043,
        //                 "fairPrice":0.36108,
        //                 "fundingRate":0.000535,
        //                 "maxBidPrice":0.43251,
        //                 "minAskPrice":0.28834,
        //                 "timestamp":1634163352075
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name mexc#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'spotPublicGetMarketTicker';
        } else if (market['swap']) {
            method = 'contractPublicGetTicker';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "symbol":"BTC_USDT",
        //                 "volume":"880.821523",
        //                 "high":"49496.95", // highest price over the past 24 hours
        //                 "low":"46918.4", // lowest
        //                 "bid":"49297.64", // current buying price == the best price you can sell for
        //                 "ask":"49297.75", // current selling price == the best price you can buy for
        //                 "open":"48764.9", // open price 24h ago
        //                 "last":"49297.73", // last = close
        //                 "time":1633378200000, // timestamp
        //                 "change_rate":"0.0109265" // (last / open) - 1
        //             }
        //         ]
        //     }
        //
        // swap / contract
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":{
        //             "symbol":"ETH_USDT",
        //             "lastPrice":3581.3,
        //             "bid1":3581.25,
        //             "ask1":3581.5,
        //             "volume24":4045530,
        //             "amount24":141331823.5755,
        //             "holdVol":5832946,
        //             "lower24Price":3413.4,
        //             "high24Price":3588.7,
        //             "riseFallRate":0.0275,
        //             "riseFallValue":95.95,
        //             "indexPrice":3580.7852,
        //             "fairPrice":3581.08,
        //             "fundingRate":0.000063,
        //             "maxBidPrice":3938.85,
        //             "minAskPrice":3222.7,
        //             "timestamp":1634162885016
        //         }
        //     }
        //
        if (market['spot']) {
            const data = this.safeValue (response, 'data', []);
            const ticker = this.safeValue (data, 0);
            return this.parseTicker (ticker, market);
        } else if (market['swap']) {
            const data = this.safeValue (response, 'data', {});
            return this.parseTicker (data, market);
        }
    }

    parseTicker (ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "symbol":"BTC_USDT",
        //         "volume":"880.821523",
        //         "high":"49496.95",
        //         "low":"46918.4",
        //         "bid":"49297.64",
        //         "ask":"49297.75",
        //         "open":"48764.9",
        //         "last":"49297.73",
        //         "time":1633378200000,
        //         "change_rate":"0.0109265"
        //     }
        //
        // contract
        //
        //     {
        //         "symbol":"ETH_USDT",
        //         "lastPrice":3581.3,
        //         "bid1":3581.25,
        //         "ask1":3581.5,
        //         "volume24":4045530,
        //         "amount24":141331823.5755,
        //         "holdVol":5832946,
        //         "lower24Price":3413.4,
        //         "high24Price":3588.7,
        //         "riseFallRate":0.0275,
        //         "riseFallValue":95.95,
        //         "indexPrice":3580.7852,
        //         "fairPrice":3581.08,
        //         "fundingRate":0.000063,
        //         "maxBidPrice":3938.85,
        //         "minAskPrice":3222.7,
        //         "timestamp":1634162885016
        //     }
        //
        const timestamp = this.safeInteger2 (ticker, 'time', 'timestamp');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const baseVolume = this.safeString2 (ticker, 'volume', 'volume24');
        const quoteVolume = this.safeString (ticker, 'amount24');
        const open = this.safeString (ticker, 'open');
        const last = this.safeString2 (ticker, 'last', 'lastPrice');
        const change = this.safeString (ticker, 'riseFallValue');
        const riseFallRate = this.safeString (ticker, 'riseFallRate');
        const percentage = Precise.stringAdd (riseFallRate, '1');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString2 (ticker, 'high', 'high24Price'),
            'low': this.safeString2 (ticker, 'low', 'lower24Price'),
            'bid': this.safeString2 (ticker, 'bid', 'bid1'),
            'bidVolume': undefined,
            'ask': this.safeString2 (ticker, 'ask', 'ask1'),
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
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'spotPublicGetMarketDepth';
            if (limit === undefined) {
                limit = 100; // the spot api requires a limit
            }
            request['depth'] = limit;
        } else if (market['swap']) {
            method = 'contractPublicGetDepthSymbol';
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "asks":[
        //                 {"price":"49060.56","quantity":"0.099842"},
        //                 {"price":"49060.58","quantity":"0.016003"},
        //                 {"price":"49060.6","quantity":"0.023677"}
        //             ],
        //             "bids":[
        //                 {"price":"49060.45","quantity":"1.693009"},
        //                 {"price":"49060.44","quantity":"0.000843"},
        //                 {"price":"49059.98","quantity":"0.735"},
        //             ],
        //             "version":"202454074",
        //         }
        //     }
        //
        // swap / contract
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":{
        //             "asks":[
        //                 [3445.7,48379,1],
        //                 [3445.75,34994,1],
        //                 [3445.8,68634,2],
        //             ],
        //             "bids":[
        //                 [3445.55,44081,1],
        //                 [3445.5,24857,1],
        //                 [3445.45,50272,1],
        //             ],
        //             "version":2827730444,
        //             "timestamp":1634117846232
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const priceKey = market['spot'] ? 'price' : 0;
        const amountKey = market['spot'] ? 'quantity' : 1;
        const timestamp = this.safeInteger (data, 'timestamp');
        const orderbook = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', priceKey, amountKey);
        orderbook['nonce'] = this.safeInteger (data, 'version');
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        let method = undefined;
        if (market['spot']) {
            method = 'spotPublicGetMarketDeals';
        } else if (market['swap']) {
            method = 'contractPublicGetDealsSymbol';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {"trade_time":1633381766725,"trade_price":"0.068981","trade_quantity":"0.005","trade_type":"BID"},
        //             {"trade_time":1633381732705,"trade_price":"0.068979","trade_quantity":"0.006","trade_type":"BID"},
        //             {"trade_time":1633381694604,"trade_price":"0.068975","trade_quantity":"0.011","trade_type":"ASK"},
        //         ]
        //     }
        //
        // swap / contract
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {"p":3598.85,"v":52,"T":1,"O":2,"M":2,"t":1634169038038},
        //             {"p":3599.2,"v":15,"T":2,"O":3,"M":1,"t":1634169035603},
        //             {"p":3600.15,"v":229,"T":2,"O":1,"M":2,"t":1634169026354},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     spot
        //
        //     {
        //         "trade_time":1633381766725,
        //         "trade_price":"0.068981",
        //         "trade_quantity":"0.005",
        //         "trade_type":"BID"
        //     }
        //
        //     swap / contract
        //
        //     {
        //         "p":3598.85,
        //         "v":52,
        //         "T":1, // 1 buy, 2 sell
        //         "O":2, // 1 opens a position, 2 does not open a position
        //         "M":2, // self-trading, 1 yes, 2 no
        //         "t":1634169038038
        //     }
        //
        // private fetchMyTrades, fetchOrderTrades
        //
        //     {
        //         "id":"b160b8f072d9403e96289139d5544809",
        //         "symbol":"USDC_USDT",
        //         "quantity":"150",
        //         "price":"0.9997",
        //         "amount":"149.955",
        //         "fee":"0.29991",
        //         "trade_type":"ASK",
        //         "order_id":"d798765285374222990bbd14decb86cd",
        //         "is_taker":true,
        //         "fee_currency":"USDT",
        //         "create_time":1633984904000
        //     }
        //
        let timestamp = this.safeInteger2 (trade, 'create_time', 'trade_time');
        timestamp = this.safeInteger (trade, 't', timestamp);
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        let priceString = this.safeString2 (trade, 'price', 'trade_price');
        priceString = this.safeString (trade, 'p', priceString);
        let amountString = this.safeString2 (trade, 'quantity', 'trade_quantity');
        amountString = this.safeString (trade, 'v', amountString);
        const costString = this.safeString (trade, 'amount');
        let side = this.safeString2 (trade, 'trade_type', 'T');
        if ((side === 'BID') || (side === '1')) {
            side = 'buy';
        } else if ((side === 'ASK') || (side === '2')) {
            side = 'sell';
        }
        let id = this.safeString2 (trade, 'id', 'trade_time');
        if (id === undefined) {
            id = this.safeString (trade, 't', id);
            if (id !== undefined) {
                id += '-' + market['id'] + '-' + amountString;
            }
        }
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        const orderId = this.safeString (trade, 'order_id');
        const isTaker = this.safeValue (trade, 'is_taker', true);
        const takerOrMaker = isTaker ? 'taker' : 'maker';
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name mexc#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.spotPublicGetMarketSymbols (params);
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "symbol":"DFD_USDT",
        //                 "state":"ENABLED",
        //                 "countDownMark":1,
        //                 "vcoinName":"DFD",
        //                 "vcoinStatus":1,
        //                 "price_scale":4,
        //                 "quantity_scale":2,
        //                 "min_amount":"5", // not an amount = cost
        //                 "max_amount":"5000000",
        //                 "maker_fee_rate":"0.002",
        //                 "taker_fee_rate":"0.002",
        //                 "limited":true,
        //                 "etf_mark":0,
        //                 "symbol_partition":"ASSESS"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const fee = data[i];
            const marketId = this.safeString (fee, 'symbol');
            const market = this.safeMarket (marketId, undefined, '_');
            const symbol = market['symbol'];
            result[symbol] = {
                'info': fee,
                'symbol': symbol,
                'maker': this.safeNumber (fee, 'maker_fee_rate'),
                'taker': this.safeNumber (fee, 'taker_fee_rate'),
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'timeframes', {});
        const timeframes = this.safeValue (options, market['type'], {});
        const timeframeValue = this.safeString (timeframes, timeframe);
        if (timeframeValue === undefined) {
            throw new NotSupported (this.id + ' fetchOHLCV() does not support ' + timeframe + ' timeframe for ' + market['type'] + ' markets');
        }
        const request = {
            'symbol': market['id'],
            'interval': timeframeValue,
        };
        let method = undefined;
        if (market['spot']) {
            method = 'spotPublicGetMarketKline';
            if (since !== undefined) {
                request['start_time'] = parseInt (since / 1000);
            }
            if (limit !== undefined) {
                request['limit'] = limit; // default 100
            }
        } else if (market['swap']) {
            method = 'contractPublicGetKlineSymbol';
            if (since !== undefined) {
                request['start'] = parseInt (since / 1000);
            }
            // request['end'] = this.seconds ();
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code":200,
        //         "data":[
        //             [1633377000,"49227.47","49186.21","49227.47","49169.48","0.5984809999999999","29434.259665989997"],
        //             [1633377060,"49186.21","49187.03","49206.64","49169.18","0.3658478","17990.651234393"],
        //             [1633377120,"49187.03","49227.2","49227.2","49174.4","0.0687651","3382.353190352"],
        //         ],
        //     }
        //
        // swap / contract
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":{
        //             "time":[1634052300,1634052360,1634052420],
        //             "open":[3492.2,3491.3,3495.65],
        //             "close":[3491.3,3495.65,3495.2],
        //             "high":[3495.85,3496.55,3499.4],
        //             "low":[3491.15,3490.9,3494.2],
        //             "vol":[1740.0,351.0,314.0],
        //             "amount":[60793.623,12260.4885,10983.1375],
        //         }
        //     }
        //
        if (market['spot']) {
            const data = this.safeValue (response, 'data', []);
            return this.parseOHLCVs (data, market, timeframe, since, limit);
        } else if (market['swap']) {
            const data = this.safeValue (response, 'data', {});
            const result = this.convertTradingViewToOHLCV (data, 'time', 'open', 'high', 'low', 'close', 'vol');
            return this.parseOHLCVs (result, market, timeframe, since, limit);
        }
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // the ordering in spot candles is OCHLV
        //
        //     [
        //         1633377000, // 0 timestamp (unix seconds)
        //         "49227.47", // 1 open price
        //         "49186.21", // 2 closing price
        //         "49227.47", // 3 high
        //         "49169.48", // 4 low
        //         "0.5984809999999999", // 5 base volume
        //         "29434.259665989997", // 6 quote volume
        //     ]
        //
        // the ordering in swap / contract candles is OHLCV
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, market['spot'] ? 3 : 2),
            this.safeNumber (ohlcv, market['spot'] ? 4 : 3),
            this.safeNumber (ohlcv, market['spot'] ? 2 : 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name mexc#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateGetAccountInfo',
            'margin': 'spotPrivateGetAccountInfo',
            'swap': 'contractPrivateGetAccountAssets',
        });
        const spot = (marketType === 'spot');
        const response = await this[method] (query);
        //
        // spot
        //
        //     {
        //         code: "200",
        //         data: {
        //             USDC: { frozen: "0", available: "150" }
        //         }
        //     }
        //
        // swap / contract
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {"currency":"BSV","positionMargin":0,"availableBalance":0,"cashBalance":0,"frozenBalance":0,"equity":0,"unrealized":0,"bonus":0},
        //             {"currency":"BCH","positionMargin":0,"availableBalance":0,"cashBalance":0,"frozenBalance":0,"equity":0,"unrealized":0,"bonus":0},
        //             {"currency":"CRV","positionMargin":0,"availableBalance":0,"cashBalance":0,"frozenBalance":0,"equity":0,"unrealized":0,"bonus":0},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const currentTime = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
        };
        if (spot) {
            const currencyIds = Object.keys (data);
            for (let i = 0; i < currencyIds.length; i++) {
                const currencyId = currencyIds[i];
                const code = this.safeCurrencyCode (currencyId);
                const balance = this.safeValue (data, currencyId, {});
                const account = this.account ();
                account['free'] = this.safeString (balance, 'available');
                account['used'] = this.safeString (balance, 'frozen');
                result[code] = account;
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                const balance = data[i];
                const currencyId = this.safeString (balance, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'availableBalance');
                account['used'] = this.safeString (balance, 'frozenBalance');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    safeNetwork (networkId) {
        if (networkId.indexOf ('BSC') >= 0) {
            return 'BEP20';
        }
        const parts = networkId.split (' ');
        networkId = parts.join ('');
        networkId = networkId.replace ('-20', '20');
        const networksById = {
            'ETH': 'ETH',
            'ERC20': 'ERC20',
            'BEP20(BSC)': 'BEP20',
            'TRX': 'TRC20',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {"chain":"ERC-20","address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6"},
        //     {"chain":"MATIC","address":"0x05aa3236f1970eae0f8feb17ec19435b39574d74"},
        //     {"chain":"TRC20","address":"TGaPfhW41EXD3sAfs1grLF6DKfugfqANNw"},
        //     {"chain":"SOL","address":"5FSpUKuh2gjw4mF89T2e7sEjzUA1SkRKjBChFqP43KhV"},
        //     {"chain":"ALGO","address":"B3XTZND2JJTSYR7R2TQVCUDT4QSSYVAIZYDPWVBX34DGAYATBU3AUV43VU"}
        //
        //
        const address = this.safeString (depositAddress, 'address');
        const code = this.safeCurrencyCode (undefined, currency);
        const networkId = this.safeString (depositAddress, 'chain');
        const network = this.safeNetwork (networkId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': network,
            'info': depositAddress,
        };
    }

    async fetchDepositAddressesByNetwork (code, params = {}) {
        /**
         * @method
         * @name mexc#fetchDepositAddressesByNetwork
         * @description fetch a dictionary of addresses for a currency, indexed by network
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure} indexed by the network
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spotPrivateGetAssetDepositAddressList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "currency":"USDC",
        //             "chains":[
        //                 {"chain":"ERC-20","address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6"},
        //                 {"chain":"MATIC","address":"0x05aa3236f1970eae0f8feb17ec19435b39574d74"},
        //                 {"chain":"TRC20","address":"TGaPfhW41EXD3sAfs1grLF6DKfugfqANNw"},
        //                 {"chain":"SOL","address":"5FSpUKuh2gjw4mF89T2e7sEjzUA1SkRKjBChFqP43KhV"},
        //                 {"chain":"ALGO","address":"B3XTZND2JJTSYR7R2TQVCUDT4QSSYVAIZYDPWVBX34DGAYATBU3AUV43VU"}
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const chains = this.safeValue (data, 'chains', []);
        const depositAddresses = [];
        for (let i = 0; i < chains.length; i++) {
            const depositAddress = this.parseDepositAddress (chains[i], currency);
            depositAddresses.push (depositAddress);
        }
        return this.indexBy (depositAddresses, 'network');
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name mexc#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        const rawNetwork = this.safeStringUpper (params, 'network');
        params = this.omit (params, 'network');
        const response = await this.fetchDepositAddressesByNetwork (code, params);
        const networks = this.safeValue (this.options, 'networks', {});
        const network = this.safeString (networks, rawNetwork, rawNetwork);
        let result = undefined;
        if (network === undefined) {
            result = this.safeValue (response, code);
            if (result === undefined) {
                const alias = this.safeString (networks, code, code);
                result = this.safeValue (response, alias);
                if (result === undefined) {
                    const defaultNetwork = this.safeString (this.options, 'defaultNetwork', 'ERC20');
                    result = this.safeValue (response, defaultNetwork);
                    if (result === undefined) {
                        const values = Object.values (response);
                        result = this.safeValue (values, 0);
                        if (result === undefined) {
                            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find deposit address for ' + code);
                        }
                    }
                }
            }
            return result;
        }
        // TODO: add support for all aliases here
        result = this.safeValue (response, rawNetwork);
        if (result === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find ' + network + ' deposit address for ' + code);
        }
        return result;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'state': 'state',
            // 'start_time': since, // default 1 day
            // 'end_time': this.milliseconds (),
            // 'page_num': 1,
            // 'page_size': limit, // default 20, maximum 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetAssetDepositList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "page_size":20,
        //             "total_page":1,
        //             "total_size":1,
        //             "page_num":1,
        //             "result_list":[
        //                 {
        //                     "currency":"USDC",
        //                     "amount":150.0,
        //                     "fee":0.0,
        //                     "confirmations":19,
        //                     "address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6",
        //                     "state":"SUCCESS",
        //                     "tx_id":"0xc65a9b09e1b71def81bf8bb3ec724c0c1b2b4c82200c8c142e4ea4c1469fd789:0",
        //                     "require_confirmations":12,
        //                     "create_time":"2021-10-11T18:58:25.000+00:00",
        //                     "update_time":"2021-10-11T19:01:06.000+00:00"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'result_list', []);
        return this.parseTransactions (resultList, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'withdrawal_id': '4b450616042a48c99dd45cacb4b092a7', // string
            // 'currency': currency['id'],
            // 'state': 'state',
            // 'start_time': since, // default 1 day
            // 'end_time': this.milliseconds (),
            // 'page_num': 1,
            // 'page_size': limit, // default 20, maximum 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetAssetWithdrawList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "page_size":20,
        //             "total_page":1,
        //             "total_size":1,
        //             "page_num":1,
        //             "result_list":[
        //                 {
        //                     "id":"4b450616042a48c99dd45cacb4b092a7",
        //                     "currency":"USDT-TRX",
        //                     "address":"TRHKnx74Gb8UVcpDCMwzZVe4NqXfkdtPak",
        //                     "amount":30.0,
        //                     "fee":1.0,
        //                     "remark":"this is my first withdrawal remark",
        //                     "state":"WAIT",
        //                     "create_time":"2021-10-11T20:45:08.000+00:00"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'result_list', []);
        return this.parseTransactions (resultList, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "currency":"USDC",
        //         "amount":150.0,
        //         "fee":0.0,
        //         "confirmations":19,
        //         "address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6",
        //         "state":"SUCCESS",
        //         "tx_id":"0xc65a9b09e1b71def81bf8bb3ec724c0c1b2b4c82200c8c142e4ea4c1469fd789:0",
        //         "require_confirmations":12,
        //         "create_time":"2021-10-11T18:58:25.000+00:00",
        //         "update_time":"2021-10-11T19:01:06.000+00:00"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id":"4b450616042a48c99dd45cacb4b092a7",
        //         "currency":"USDT-TRX",
        //         "address":"TRHKnx74Gb8UVcpDCMwzZVe4NqXfkdtPak",
        //         "amount":30.0,
        //         "fee":1.0,
        //         "remark":"this is my first withdrawal remark",
        //         "state":"WAIT",
        //         "create_time":"2021-10-11T20:45:08.000+00:00"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const type = (id === undefined) ? 'deposit' : 'withdrawal';
        const timestamp = this.parse8601 (this.safeString (transaction, 'create_time'));
        const updated = this.parse8601 (this.safeString (transaction, 'update_time'));
        let currencyId = this.safeString (transaction, 'currency');
        let network = undefined;
        if ((currencyId !== undefined) && (currencyId.indexOf ('-') >= 0)) {
            const parts = currencyId.split ('-');
            currencyId = this.safeString (parts, 0);
            const networkId = this.safeString (parts, 1);
            network = this.safeNetwork (networkId);
        }
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        let amountString = this.safeString (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'tx_id');
        let fee = undefined;
        const feeCostString = this.safeString (transaction, 'fee');
        if (feeCostString !== undefined) {
            fee = {
                'cost': this.parseNumber (feeCostString),
                'currency': code,
            };
        }
        if (type === 'withdrawal') {
            // mexc withdrawal amount includes the fee
            amountString = Precise.stringSub (amountString, feeCostString);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.parseNumber (amountString),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'WAIT': 'pending',
            'WAIT_PACKAGING': 'pending',
            'SUCCESS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchPosition (symbol, params = {}) {
        /**
         * @method
         * @name mexc#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.fetchPositions (this.extend (request, params));
        const firstPosition = this.safeValue (response, 0);
        return this.parsePosition (firstPosition, market);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const response = await this.contractPrivateGetPositionOpenPositions (params);
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "positionId": 1394650,
        //                 "symbol": "ETH_USDT",
        //                 "positionType": 1,
        //                 "openType": 1,
        //                 "state": 1,
        //                 "holdVol": 1,
        //                 "frozenVol": 0,
        //                 "closeVol": 0,
        //                 "holdAvgPrice": 1217.3,
        //                 "openAvgPrice": 1217.3,
        //                 "closeAvgPrice": 0,
        //                 "liquidatePrice": 1211.2,
        //                 "oim": 0.1290338,
        //                 "im": 0.1290338,
        //                 "holdFee": 0,
        //                 "realised": -0.0073,
        //                 "leverage": 100,
        //                 "createTime": 1609991676000,
        //                 "updateTime": 1609991676000,
        //                 "autoAddIm": false
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "positionId": 1394650,
        //         "symbol": "ETH_USDT",
        //         "positionType": 1,
        //         "openType": 1,
        //         "state": 1,
        //         "holdVol": 1,
        //         "frozenVol": 0,
        //         "closeVol": 0,
        //         "holdAvgPrice": 1217.3,
        //         "openAvgPrice": 1217.3,
        //         "closeAvgPrice": 0,
        //         "liquidatePrice": 1211.2,
        //         "oim": 0.1290338,
        //         "im": 0.1290338,
        //         "holdFee": 0,
        //         "realised": -0.0073,
        //         "leverage": 100,
        //         "createTime": 1609991676000,
        //         "updateTime": 1609991676000,
        //         "autoAddIm": false
        //     }
        //
        market = this.safeMarket (this.safeString (position, 'symbol'), market);
        const symbol = market['symbol'];
        const contracts = this.safeString (position, 'holdVol');
        const entryPrice = this.safeNumber (position, 'openAvgPrice');
        const initialMargin = this.safeString (position, 'im');
        const rawSide = this.safeString (position, 'positionType');
        const side = (rawSide === '1') ? 'long' : 'short';
        const openType = this.safeString (position, 'margin_mode');
        const marginMode = (openType === '1') ? 'isolated' : 'cross';
        const leverage = this.safeString (position, 'leverage');
        const liquidationPrice = this.safeNumber (position, 'liquidatePrice');
        const timestamp = this.safeNumber (position, 'updateTime');
        return {
            'info': position,
            'symbol': symbol,
            'contracts': this.parseNumber (contracts),
            'contractSize': undefined,
            'entryPrice': entryPrice,
            'collateral': undefined,
            'side': side,
            'unrealizedProfit': undefined,
            'leverage': this.parseNumber (leverage),
            'percentage': undefined,
            'marginMode': marginMode,
            'notional': undefined,
            'markPrice': undefined,
            'liquidationPrice': liquidationPrice,
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'marginRatio': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name mexc#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        if (marketType === 'spot') {
            return await this.createSpotOrder (symbol, type, side, amount, price, query);
        } else if (marketType === 'swap') {
            return await this.createSwapOrder (symbol, type, side, amount, price, query);
        }
    }

    async createSpotOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let orderSide = undefined;
        if (side === 'buy') {
            orderSide = 'BID';
        } else if (side === 'sell') {
            orderSide = 'ASK';
        }
        let orderType = type.toUpperCase ();
        const isMarketOrder = orderType === 'MARKET';
        if (isMarketOrder) {
            throw new InvalidOrder (this.id + ' createOrder () does not support market orders, only limit orders are allowed');
        }
        if (orderType === 'LIMIT') {
            orderType = 'LIMIT_ORDER';
        }
        const postOnly = this.isPostOnly (isMarketOrder, orderType === 'POST_ONLY', params);
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        const ioc = (timeInForce === 'IOC');
        if (postOnly) {
            orderType = 'POST_ONLY';
        } else if (ioc) {
            orderType = 'IMMEDIATE_OR_CANCEL';
        }
        if (timeInForce === 'FOK') {
            throw new InvalidOrder (this.id + ' createOrder () does not support timeInForce FOK, only IOC, PO, and GTC are allowed');
        }
        if (((orderType !== 'POST_ONLY') && (orderType !== 'IMMEDIATE_OR_CANCEL') && (orderType !== 'LIMIT_ORDER'))) {
            throw new InvalidOrder (this.id + ' createOrder () does not support ' + type + ' order type, only LIMIT, LIMIT_ORDER, POST_ONLY or IMMEDIATE_OR_CANCEL are allowed');
        }
        const request = {
            'symbol': market['id'],
            'price': this.priceToPrecision (symbol, price),
            'quantity': this.amountToPrecision (symbol, amount),
            'trade_type': orderSide,
            'order_type': orderType, // LIMIT_ORDER，POST_ONLY，IMMEDIATE_OR_CANCEL
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        params = this.omit (params, [ 'type', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce' ]);
        const response = await this.spotPrivatePostOrderPlace (this.extend (request, params));
        //
        //     {"code":200,"data":"2ff3163e8617443cb9c6fc19d42b1ca4"}
        //
        return this.parseOrder (response, market);
    }

    async createSwapOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const openType = this.safeInteger (params, 'openType');
        if (openType === undefined) {
            throw new ArgumentsRequired (this.id + ' createSwapOrder () requires an integer openType parameter, 1 for isolated margin, 2 for cross margin');
        }
        if ((type !== 'limit') && (type !== 'market') && (type !== 1) && (type !== 2) && (type !== 3) && (type !== 4) && (type !== 5) && (type !== 6)) {
            throw new InvalidOrder (this.id + ' createSwapOrder () order type must either limit, market, or 1 for limit orders, 2 for post-only orders, 3 for IOC orders, 4 for FOK orders, 5 for market orders or 6 to convert market price to current price');
        }
        const isMarketOrder = (type === 'market') || (type === 5);
        const postOnly = this.isPostOnly (isMarketOrder, type === 2, params);
        if (postOnly) {
            type = 2;
        } else if (type === 'limit') {
            type = 1;
        } else if (type === 'market') {
            type = 5;
        }
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        const ioc = (timeInForce === 'IOC');
        const fok = (timeInForce === 'FOK');
        if (ioc) {
            type = 3;
        } else if (fok) {
            type = 4;
        }
        if ((side !== 1) && (side !== 2) && (side !== 3) && (side !== 4)) {
            throw new InvalidOrder (this.id + ' createSwapOrder () order side must be 1 open long, 2 close short, 3 open short or 4 close long');
        }
        const request = {
            'symbol': market['id'],
            // 'price': parseFloat (this.priceToPrecision (symbol, price)),
            'vol': parseFloat (this.amountToPrecision (symbol, amount)),
            // 'leverage': int, // required for isolated margin
            'side': side, // 1 open long, 2 close short, 3 open short, 4 close long
            //
            // supported order types
            //
            //     1 limit
            //     2 post only maker (PO)
            //     3 transact or cancel instantly (IOC)
            //     4 transact completely or cancel completely (FOK)
            //     5 market orders
            //     6 convert market price to current price
            //
            'type': type,
            'openType': openType, // 1 isolated, 2 cross
            // 'positionId': 1394650, // long, filling in this parameter when closing a position is recommended
            // 'externalOid': clientOrderId,
            // 'triggerPrice': 10.0, // Required for trigger order
            // 'triggerType': 1, // Required for trigger order 1: more than or equal, 2: less than or equal
            // 'executeCycle': 1, // Required for trigger order 1: 24 hours,2: 7 days
            // 'trend': 1, // Required for trigger order 1: latest price, 2: fair price, 3: index price
            // 'orderType': 1, // Required for trigger order 1: limit order,2:Post Only Maker,3: close or cancel instantly ,4: close or cancel completely,5: Market order
        };
        let method = 'contractPrivatePostOrderSubmit';
        const stopPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        params = this.omit (params, [ 'stopPrice', 'triggerPrice', 'timeInForce', 'postOnly' ]);
        if (stopPrice !== undefined) {
            method = 'contractPrivatePostPlanorderPlace';
            request['triggerPrice'] = this.priceToPrecision (symbol, stopPrice);
            request['triggerType'] = this.safeInteger (params, 'triggerType', 1);
            request['executeCycle'] = this.safeInteger (params, 'executeCycle', 1);
            request['trend'] = this.safeInteger (params, 'trend', 1);
            request['orderType'] = this.safeInteger (params, 'orderType', type);
        }
        if ((type !== 5) && (type !== 6) && (type !== 'market')) {
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        if (openType === 1) {
            const leverage = this.safeInteger (params, 'leverage');
            if (leverage === undefined) {
                throw new ArgumentsRequired (this.id + ' createSwapOrder () requires a leverage parameter for isolated margin orders');
            }
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'externalOid');
        if (clientOrderId !== undefined) {
            request['externalOid'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'externalOid' ]);
        const response = await this[method] (this.extend (request, params));
        //
        // Swap
        //     {"code":200,"data":"2ff3163e8617443cb9c6fc19d42b1ca4"}
        //
        // Trigger
        //     {"success":true,"code":0,"data":259208506303929856}
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name mexc#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'cancelOrder', {});
        const defaultMethod = this.safeString (options, 'method', 'spotPrivateDeleteOrderCancel');
        let method = this.safeString (params, 'method', defaultMethod);
        const stop = this.safeValue (params, 'stop');
        let request = {};
        if (market['type'] === 'spot') {
            method = 'spotPrivateDeleteOrderCancel';
            const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_ids');
            if (clientOrderId !== undefined) {
                params = this.omit (params, [ 'clientOrderId', 'client_order_ids' ]);
                request['client_order_ids'] = clientOrderId;
            } else {
                request['order_ids'] = id;
            }
        } else if (stop) {
            method = 'contractPrivatePostPlanorderCancel';
            request = [];
            if (Array.isArray (id)) {
                for (let i = 0; i < id.length; i++) {
                    request.push ({
                        'symbol': market['id'],
                        'orderId': id[i],
                    });
                }
            } else if (typeof id === 'string') {
                request.push ({
                    'symbol': market['id'],
                    'orderId': id,
                });
            }
        } else if (market['type'] === 'swap') {
            method = 'contractPrivatePostOrderCancel';
            request = [ id ];
        }
        const response = await this[method] (request); // dont extend with params, otherwise ARRAY will be turned into OBJECT
        //
        // Spot
        //
        //     {"code":200,"data":{"965245851c444078a11a7d771323613b":"success"}}
        //
        // Swap
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "orderId": 268726891790294528,
        //                 "errorCode": 0,
        //                 "errorMsg": "success"
        //             }
        //         ]
        //     }
        //
        // Trigger
        //
        //     {
        //         "success": true,
        //         "code": 0
        //     }
        //
        let data = this.safeValue (response, 'data', []);
        if (stop) {
            data = response;
        }
        return this.parseOrder (data, market);
    }

    parseOrderStatus (status, market = undefined) {
        let statuses = {};
        if (market['type'] === 'spot') {
            statuses = {
                'NEW': 'open',
                'FILLED': 'closed',
                'PARTIALLY_FILLED': 'open',
                'CANCELED': 'canceled',
                'PARTIALLY_CANCELED': 'canceled',
            };
        } else if (market['type'] === 'swap') {
            statuses = {
                '2': 'open',
                '3': 'closed',
                '4': 'canceled',
            };
        } else {
            statuses = {
                '1': 'open',
                '2': 'canceled',
                '3': 'closed',
            };
        }
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // TODO update parseOrder to reflect type, timeInForce, and postOnly from fetchOrder ()
        //
        // createOrder
        //
        // spot
        //
        //     {"code":200,"data":"2ff3163e8617443cb9c6fc19d42b1ca4"}
        //
        // swap / contract
        //
        //     { "success": true, "code": 0, "data": 102057569836905984 }
        //
        // spot fetchOpenOrders
        //
        //     {
        //         "id":"965245851c444078a11a7d771323613b",
        //         "symbol":"ETH_USDT",
        //         "price":"3430",
        //         "quantity":"0.01",
        //         "state":"NEW",
        //         "type":"BID",
        //         "remain_quantity":"0.01",
        //         "remain_amount":"34.3",
        //         "create_time":1633989029039,
        //         "client_order_id":"",
        //         "order_type":"LIMIT_ORDER"
        //     }
        //
        // swap fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrder
        //
        //     {
        //         "orderId": "266578267438402048",
        //         "symbol": "BTC_USDT",
        //         "positionId": 0,
        //         "price": 30000,
        //         "vol": 11,
        //         "leverage": 20,
        //         "side": 1,
        //         "category": 1,
        //         "orderType": 1,
        //         "dealAvgPrice": 0,
        //         "dealVol": 0,
        //         "orderMargin": 1.6896,
        //         "takerFee": 0,
        //         "makerFee": 0,
        //         "profit": 0,
        //         "feeCurrency": "USDT",
        //         "openType": 1,
        //         "state": 2,
        //         "externalOid": "_m_8d673a31c47642d9a59993aca61ae394",
        //         "errorCode": 0,
        //         "usedMargin": 0,
        //         "createTime": 1649227612000,
        //         "updateTime": 1649227611000,
        //         "positionMode": 1
        //     }
        //
        // spot fetchClosedOrders, fetchCanceledOrders, fetchOrder
        //
        //     {
        //         "id":"d798765285374222990bbd14decb86cd",
        //         "symbol":"USDC_USDT",
        //         "price":"0.9988",
        //         "quantity":"150",
        //         "state":"FILLED", // CANCELED
        //         "type":"ASK", // BID
        //         "deal_quantity":"150",
        //         "deal_amount":"149.955",
        //         "create_time":1633984904000,
        //         "order_type":"MARKET_ORDER" // LIMIT_ORDER
        //     }
        //
        // trigger fetchClosedOrders, fetchCanceledOrders, fetchOpenOrders
        //
        //     {
        //         "id": "266583973507973632",
        //         "symbol": "BTC_USDT",
        //         "leverage": 20,
        //         "side": 1,
        //         "triggerPrice": 30000,
        //         "price": 31000,
        //         "vol": 11,
        //         "openType": 1,
        //         "triggerType": 2,
        //         "state": 2,
        //         "executeCycle": 87600,
        //         "trend": 1,
        //         "orderType": 1,
        //         "errorCode": 0,
        //         "createTime": 1649228972000,
        //         "updateTime": 1649230287000
        //     }
        //
        // spot cancelOrder
        //
        //     {"965245851c444078a11a7d771323613b":"success"}
        //
        // swap cancelOrder
        //
        //     {
        //         "orderId": 268726891790294528,
        //         "errorCode": 0,
        //         "errorMsg": "success"
        //     }
        //
        // trigger cancelOrder
        //
        //     {
        //         "success": true,
        //         "code": 0
        //     }
        //
        let id = this.safeString2 (order, 'data', 'id');
        let status = undefined;
        if (id === undefined) {
            const keys = Object.keys (order);
            id = this.safeString (keys, 0);
            const state = this.safeString (order, id);
            if (state === 'success') {
                status = 'canceled';
            }
        }
        const state = this.safeString (order, 'state');
        const timestamp = this.safeInteger2 (order, 'create_time', 'createTime');
        const price = this.safeString (order, 'price');
        const amount = this.safeString2 (order, 'quantity', 'vol');
        const remaining = this.safeString (order, 'remain_quantity');
        const filled = this.safeString2 (order, 'deal_quantity', 'dealVol');
        const cost = this.safeString (order, 'deal_amount');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const sideCheck = this.safeInteger (order, 'side');
        let side = undefined;
        const bidOrAsk = this.safeString (order, 'type');
        if (bidOrAsk === 'BID') {
            side = 'buy';
        } else if (bidOrAsk === 'ASK') {
            side = 'sell';
        }
        if (sideCheck === 1) {
            side = 'open long';
        } else if (side === 2) {
            side = 'close short';
        } else if (side === 3) {
            side = 'open short';
        } else if (side === 4) {
            side = 'close long';
        }
        status = this.parseOrderStatus (state, market);
        const clientOrderId = this.safeString2 (order, 'client_order_id', 'orderId');
        const rawOrderType = this.safeString2 (order, 'orderType', 'order_type');
        let orderType = undefined;
        // swap: 1:price limited order, 2:Post Only Maker, 3:transact or cancel instantly, 4:transact completely or cancel completely，5:market orders, 6:convert market price to current price
        // spot: LIMIT_ORDER, POST_ONLY, IMMEDIATE_OR_CANCEL
        let timeInForce = undefined;
        let postOnly = undefined;
        if (rawOrderType !== undefined) {
            postOnly = false;
            if (rawOrderType === '1') {
                orderType = 'limit';
                timeInForce = 'GTC';
            } else if (rawOrderType === '2') {
                orderType = 'limit';
                timeInForce = 'PO';
                postOnly = true;
            } else if (rawOrderType === '3') {
                orderType = 'limit';
                timeInForce = 'IOC';
            } else if (rawOrderType === '4') {
                orderType = 'limit';
                timeInForce = 'FOK';
            } else if ((rawOrderType === '5') || (rawOrderType === '6')) {
                orderType = 'market';
                timeInForce = 'GTC';
            } else if (rawOrderType === 'LIMIT_ORDER') {
                orderType = 'limit';
                timeInForce = 'GTC';
            } else if (rawOrderType === 'POST_ONLY') {
                orderType = 'limit';
                timeInForce = 'PO';
                postOnly = true;
            } else if (rawOrderType === 'IMMEDIATE_OR_CANCEL') {
                orderType = 'limit';
                timeInForce = 'IOC';
            }
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'updateTime'),
            'status': status,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': this.safeString (order, 'triggerPrice'),
            'average': this.safeString (order, 'dealAvgPrice'),
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'], // spot, swap
            // 'start_time': since, // spot
            // 'limit': limit, // spot default 50, max 1000
            // 'trade_type': 'BID', // spot BID / ASK
            // 'page_num': 1, // swap required default 1
            // 'page_size': limit, // swap required default 20 max 100
            // 'end_time': 1633988662382, // trigger order
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateGetOrderOpenOrders',
            'swap': 'contractPrivateGetOrderListOpenOrdersSymbol',
        });
        const stop = this.safeValue (params, 'stop');
        if (stop) {
            return await this.fetchOrdersByState ('1', symbol, since, limit, params);
        }
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "id":"965245851c444078a11a7d771323613b",
        //                 "symbol":"ETH_USDT",
        //                 "price":"3430",
        //                 "quantity":"0.01",
        //                 "state":"NEW",
        //                 "type":"BID",
        //                 "remain_quantity":"0.01",
        //                 "remain_amount":"34.3",
        //                 "create_time":1633989029039,
        //                 "client_order_id":"",
        //                 "order_type":"LIMIT_ORDER"
        //             },
        //         ]
        //     }
        //
        // Swap
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "orderId": "266578267438402048",
        //                 "symbol": "BTC_USDT",
        //                 "positionId": 0,
        //                 "price": 30000,
        //                 "vol": 11,
        //                 "leverage": 20,
        //                 "side": 1,
        //                 "category": 1,
        //                 "orderType": 1,
        //                 "dealAvgPrice": 0,
        //                 "dealVol": 0,
        //                 "orderMargin": 1.6896,
        //                 "takerFee": 0,
        //                 "makerFee": 0,
        //                 "profit": 0,
        //                 "feeCurrency": "USDT",
        //                 "openType": 1,
        //                 "state": 2,
        //                 "externalOid": "_m_8d673a31c47642d9a59993aca61ae394",
        //                 "errorCode": 0,
        //                 "usedMargin": 0,
        //                 "createTime": 1649227612000,
        //                 "updateTime": 1649227611000,
        //                 "positionMode": 1
        //             }
        //         ]
        //     }
        //
        // Trigger
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "id": "267198217203040768",
        //                 "symbol": "BTC_USDT",
        //                 "leverage": 20,
        //                 "side": 1,
        //                 "triggerPrice": 31111,
        //                 "price": 31115,
        //                 "vol": 2,
        //                 "openType": 1,
        //                 "triggerType": 2,
        //                 "state": 1,
        //                 "executeCycle": 87600,
        //                 "trend": 1,
        //                 "orderType": 1,
        //                 "errorCode": 0,
        //                 "createTime": 1649375419000,
        //                 "updateTime": 1649375419000
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const request = {
            'order_ids': id,
        };
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateGetOrderQuery',
            'swap': 'contractPrivateGetOrderBatchQuery',
        });
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "id":"2ff3163e8617443cb9c6fc19d42b1ca4",
        //                 "symbol":"ETH_USDT",
        //                 "price":"3420",
        //                 "quantity":"0.01",
        //                 "state":"CANCELED",
        //                 "type":"BID",
        //                 "deal_quantity":"0",
        //                 "deal_amount":"0",
        //                 "create_time":1633988662000,
        //                 "order_type":"LIMIT_ORDER"
        //             }
        //         ]
        //     }
        //
        // Swap
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "orderId": "259208506647860224",
        //                 "symbol": "BTC_USDT",
        //                 "positionId": 0,
        //                 "price": 30000,
        //                 "vol": 10,
        //                 "leverage": 20,
        //                 "side": 1,
        //                 "category": 1,
        //                 "orderType": 1,
        //                 "dealAvgPrice": 0,
        //                 "dealVol": 0,
        //                 "orderMargin": 1.536,
        //                 "takerFee": 0,
        //                 "makerFee": 0,
        //                 "profit": 0,
        //                 "feeCurrency": "USDT",
        //                 "openType": 1,
        //                 "state": 4,
        //                 "externalOid": "planorder_279208506303929856_10",
        //                 "errorCode": 0,
        //                 "usedMargin": 0,
        //                 "createTime": 1647470524000,
        //                 "updateTime": 1647470540000,
        //                 "positionMode": 1
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const firstOrder = this.safeValue (data, 0);
        if (firstOrder === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find the order id ' + id);
        }
        return this.parseOrder (firstOrder, market);
    }

    async fetchOrdersByState (state, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByState() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'start_time': since, // default 7 days, max 30 days
            // 'limit': limit, // default 50, max 1000
            // 'trade_type': 'BID', // BID / ASK
            'states': state, // NEW, FILLED, PARTIALLY_FILLED, CANCELED, PARTIALLY_CANCELED, trigger orders: 1 untriggered, 2 cancelled, 3 executed, 4 invalid, 5 execution failed
            // 'end_time': 1633988662000, // trigger orders
            // 'page_num': 1, // trigger orders default is 1
            // 'page_size': limit, // trigger orders default 20 max 100
        };
        const stop = this.safeValue (params, 'stop');
        const limitRequest = stop ? 'page_size' : 'limit';
        if (limit !== undefined) {
            request[limitRequest] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const options = this.safeValue (this.options, 'fetchOrdersByState', {});
        const defaultMethod = this.safeString (options, 'method', 'spotPrivateGetOrderList');
        let method = this.safeString (params, 'method', defaultMethod);
        method = this.getSupportedMapping (market['type'], {
            'spot': 'spotPrivateGetOrderList',
            'swap': 'contractPrivateGetOrderListHistoryOrders',
        });
        if (stop) {
            method = 'contractPrivateGetPlanorderListOrders';
        }
        const query = this.omit (params, [ 'method', 'stop' ]);
        const response = await this[method] (this.extend (request, query));
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order, default is undefined
         * @param {int|undefined} limit max number of orders to return, default is undefined
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchCanceledOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const stop = this.safeValue (params, 'stop');
        let state = 'CANCELED';
        if (market['type'] === 'swap') {
            state = '4';
        } else if (stop) {
            state = '2';
        }
        return await this.fetchOrdersByState (state, symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const stop = this.safeValue (params, 'stop');
        let state = 'FILLED';
        if (stop || market['type'] === 'swap') {
            state = '3';
        }
        return await this.fetchOrdersByState (state, symbol, since, limit, params);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name mexc#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = this.getSupportedMapping (market['type'], {
            'spot': 'spotPrivateDeleteOrderCancelBySymbol',
            'swap': 'contractPrivatePostOrderCancelAll',
        });
        const stop = this.safeValue (params, 'stop');
        if (stop) {
            method = 'contractPrivatePostPlanorderCancelAll';
        }
        const query = this.omit (params, [ 'method', 'stop' ]);
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     {
        //         "code": 200,
        //         "data": [
        //             {
        //                 "msg": "success",
        //                 "order_id": "75ecf99feef04538b78e4622beaba6eb",
        //                 "client_order_id": "a9329e86f2094b0d8b58e92c25029554"
        //             },
        //             {
        //                 "msg": "success",
        //                 "order_id": "139413c48f8b4c018f452ce796586bcf"
        //             },
        //             {
        //                 "msg": "success",
        //                 "order_id": "b58ef34c570e4917981f276d44091484"
        //             }
        //         ]
        //     }
        //
        // Swap and Trigger
        //
        //     {
        //         "success": true,
        //         "code": 0
        //     }
        //
        return response;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'start_time': since, // default 7 days, max 30 days
            // 'limit': limit, // default 50, max 1000
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetOrderDeals (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "id":"b160b8f072d9403e96289139d5544809",
        //                 "symbol":"USDC_USDT",
        //                 "quantity":"150",
        //                 "price":"0.9997",
        //                 "amount":"149.955",
        //                 "fee":"0.29991",
        //                 "trade_type":"ASK",
        //                 "order_id":"d798765285374222990bbd14decb86cd",
        //                 "is_taker":true,
        //                 "fee_currency":"USDT",
        //                 "create_time":1633984904000
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'order_id': id,
        };
        const response = await this.spotPrivateGetOrderDealDetail (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "id":"b160b8f072d9403e96289139d5544809",
        //                 "symbol":"USDC_USDT",
        //                 "quantity":"150",
        //                 "price":"0.9997",
        //                 "amount":"149.955",
        //                 "fee":"0.29991",
        //                 "trade_type":"ASK",
        //                 "order_id":"d798765285374222990bbd14decb86cd",
        //                 "is_taker":true,
        //                 "fee_currency":"USDT",
        //                 "create_time":1633984904000
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async modifyMarginHelper (symbol, amount, addOrReduce, params = {}) {
        const positionId = this.safeInteger (params, 'positionId');
        if (positionId === undefined) {
            throw new ArgumentsRequired (this.id + ' modifyMarginHelper() requires a positionId parameter');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        amount = this.amountToPrecision (symbol, amount);
        const request = {
            'positionId': positionId,
            'amount': amount,
            'type': addOrReduce,
        };
        const response = await this.contractPrivatePostPositionChangeMargin (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0
        //     }
        //
        const type = (addOrReduce === 'ADD') ? 'add' : 'reduce';
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
        });
    }

    parseMarginModification (data, market = undefined) {
        const statusRaw = this.safeValue (data, 'success');
        const status = (statusRaw === true) ? 'ok' : 'failed';
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': undefined,
            'symbol': this.safeSymbol (undefined, market),
            'status': status,
        };
    }

    async reduceMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name mexc#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#reduce-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'SUB', params);
    }

    async addMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name mexc#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'ADD', params);
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name mexc#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} response from the exchange
         */
        await this.loadMarkets ();
        const request = {
            'leverage': leverage,
        };
        const positionId = this.safeInteger (params, 'positionId');
        if (positionId === undefined) {
            const openType = this.safeNumber (params, 'openType'); // 1 or 2
            const positionType = this.safeNumber (params, 'positionType'); // 1 or 2
            const market = (symbol !== undefined) ? this.market (symbol) : undefined;
            if ((openType === undefined) || (positionType === undefined) || (market === undefined)) {
                throw new ArgumentsRequired (this.id + ' setLeverage() requires a positionId parameter or a symbol argument with openType and positionType parameters, use openType 1 or 2 for isolated or cross margin respectively, use positionType 1 or 2 for long or short positions');
            } else {
                request['openType'] = openType;
                request['symbol'] = market['id'];
                request['positionType'] = positionType;
            }
        } else {
            request['positionId'] = positionId;
        }
        return await this.contractPrivatePostPositionChangeLeverage (this.extend (request, params));
    }

    async fetchTransfer (id, code = undefined, params = {}) {
        const request = {
            'transact_id': id,
        };
        const response = await this.spotPrivateGetAssetInternalTransferInfo (this.extend (request, params));
        //
        //     {
        //         code: '200',
        //         data: {
        //             currency: 'USDT',
        //             amount: '1',
        //             transact_id: '954877a2ef54499db9b28a7cf9ebcf41',
        //             from: 'MAIN',
        //             to: 'CONTRACT',
        //             transact_state: 'SUCCESS'
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransfer (data);
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            if (limit > 50) {
                throw new ExchangeError ('This exchange supports a maximum limit of 50');
            }
            request['page-size'] = limit;
        }
        const response = await this.spotPrivateGetAssetInternalTransferRecord (this.extend (request, params));
        //
        //     {
        //         code: '200',
        //         data: {
        //             total_page: '1',
        //             total_size: '5',
        //             result_list: [{
        //                     currency: 'USDT',
        //                     amount: '1',
        //                     transact_id: '954877a2ef54499db9b28a7cf9ebcf41',
        //                     from: 'MAIN',
        //                     to: 'CONTRACT',
        //                     transact_state: 'SUCCESS'
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'result_list', []);
        return this.parseTransfers (resultList, currency, since, limit);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name mexc#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'from': fromId,
            'to': toId,
        };
        const response = await this.spotPrivatePostAssetInternalTransfer (this.extend (request, params));
        //
        //     {
        //         code: '200',
        //         data: {
        //             currency: 'USDT',
        //             amount: '1',
        //             transact_id: 'b60c1df8e7b24b268858003f374ecb75',
        //             from: 'MAIN',
        //             to: 'CONTRACT',
        //             transact_state: 'WAIT'
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransfer (data, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         currency: 'USDT',
        //         amount: '1',
        //         transact_id: 'b60c1df8e7b24b268858003f374ecb75',
        //         from: 'MAIN',
        //         to: 'CONTRACT',
        //         transact_state: 'WAIT'
        //     }
        //
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const transferStatusById = this.safeValue (transferOptions, 'status', {});
        const currencyId = this.safeString (transfer, 'currency');
        const id = this.safeString (transfer, 'transact_id');
        const fromId = this.safeString (transfer, 'from');
        const toId = this.safeString (transfer, 'to');
        const accountsById = this.safeValue (transferOptions, 'accountsById', {});
        const fromAccount = this.safeString (accountsById, fromId);
        const toAccount = this.safeString (accountsById, toId);
        const statusId = this.safeString (transfer, 'transact_state');
        return {
            'info': transfer,
            'id': id,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.safeString (transferStatusById, statusId),
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name mexc#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper2 (params, 'network', 'chain'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString (networks, network, network); // handle ETH > ERC-20 alias
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag !== undefined) {
            address += ':' + tag;
        }
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
        };
        if (network !== undefined) {
            request['chain'] = network;
            params = this.omit (params, [ 'network', 'chain' ]);
        }
        const response = await this.spotPrivatePostAssetWithdraw (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data": {
        //             "withdrawId":"25fb2831fb6d4fc7aa4094612a26c81d"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return {
            'info': data,
            'id': this.safeString (data, 'withdrawId'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        let url = this.urls['api'][section][access] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = '';
            headers = {
                'ApiKey': this.apiKey,
                'Request-Time': timestamp,
                'Content-Type': 'application/json',
                'source': this.safeString (this.options, 'broker', 'CCXT'),
            };
            if (method === 'POST') {
                auth = this.json (params);
                body = auth;
            } else {
                params = this.keysort (params);
                if (Object.keys (params).length) {
                    auth += this.urlencode (params);
                    url += '?' + auth;
                }
            }
            auth = this.apiKey + timestamp + auth;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers['Signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //     {"code":10232,"msg":"The currency not exist"}
        //     {"code":10216,"msg":"No available deposit address"}
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":1634095541710
        //     }
        //
        const success = this.safeValue (response, 'success', false);
        if (success === true) {
            return;
        }
        const responseCode = this.safeString (response, 'code');
        if ((responseCode !== '200') && (responseCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            throw new ExchangeError (feedback);
        }
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch funding history for
         * @param {int|undefined} limit the maximum number of funding history structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-history-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'position_id': positionId,
            // 'page_num': 1,
            // 'page_size': limit, // default 20, max 100
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.contractPrivateGetPositionFundingRecords (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": {
        //             "pageSize": 20,
        //             "totalCount": 2,
        //             "totalPage": 1,
        //             "currentPage": 1,
        //             "resultList": [
        //                 {
        //                     "id": 7423910,
        //                     "symbol": "BTC_USDT",
        //                     "positionType": 1,
        //                     "positionValue": 29.30024,
        //                     "funding": 0.00076180624,
        //                     "rate": -0.000026,
        //                     "settleTime": 1643299200000
        //                 },
        //                 {
        //                     "id": 7416473,
        //                     "symbol": "BTC_USDT",
        //                     "positionType": 1,
        //                     "positionValue": 28.9188,
        //                     "funding": 0.0014748588,
        //                     "rate": -0.000051,
        //                     "settleTime": 1643270400000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'resultList', []);
        const result = [];
        for (let i = 0; i < resultList.length; i++) {
            const entry = resultList[i];
            const timestamp = this.safeInteger (entry, 'settleTime');
            result.push ({
                'info': entry,
                'symbol': symbol,
                'code': undefined,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeNumber (entry, 'id'),
                'amount': this.safeNumber (entry, 'funding'),
            });
        }
        return result;
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "fundingRate": 0.000014,
        //         "maxFundingRate": 0.003,
        //         "minFundingRate": -0.003,
        //         "collectCycle": 8,
        //         "nextSettleTime": 1643241600000,
        //         "timestamp": 1643240373359
        //     }
        //
        const nextFundingRate = this.safeNumber (contract, 'fundingRate');
        const nextFundingTimestamp = this.safeInteger (contract, 'nextSettleTime');
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (contract, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fundingRate': nextFundingRate,
            'fundingTimestamp': nextFundingTimestamp,
            'fundingDatetime': this.iso8601 (nextFundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name mexc#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.contractPublicGetFundingRateSymbol (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": {
        //             "symbol": "BTC_USDT",
        //             "fundingRate": 0.000014,
        //             "maxFundingRate": 0.003,
        //             "minFundingRate": -0.003,
        //             "collectCycle": 8,
        //             "nextSettleTime": 1643241600000,
        //             "timestamp": 1643240373359
        //         }
        //     }
        //
        const result = this.safeValue (response, 'data', {});
        return this.parseFundingRate (result, market);
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since not used by mexc, but filtered internally by ccxt
         * @param {int|undefined} limit mexc limit is page_size default 20, maximum is 100
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'page_size': limit, // optional
            // 'page_num': 1, // optional, current page number, default is 1
        };
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.contractPublicGetFundingRateHistory (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "code": 0,
        //        "data": {
        //            "pageSize": 2,
        //            "totalCount": 21,
        //            "totalPage": 11,
        //            "currentPage": 1,
        //            "resultList": [
        //                {
        //                    "symbol": "BTC_USDT",
        //                    "fundingRate": 0.000266,
        //                    "settleTime": 1609804800000
        //                },
        //                {
        //                    "symbol": "BTC_USDT",
        //                    "fundingRate": 0.00029,
        //                    "settleTime": 1609776000000
        //                }
        //            ]
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data');
        const result = this.safeValue (data, 'resultList', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeInteger (entry, 'settleTime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    async fetchLeverageTiers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/en/latest/manual.html#leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.contractPublicGetDetail (params);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "displayName": "BTC_USDT永续",
        //                 "displayNameEn": "BTC_USDT SWAP",
        //                 "positionOpenType": 3,
        //                 "baseCoin": "BTC",
        //                 "quoteCoin": "USDT",
        //                 "settleCoin": "USDT",
        //                 "contractSize": 0.0001,
        //                 "minLeverage": 1,
        //                 "maxLeverage": 125,
        //                 "priceScale": 2,
        //                 "volScale": 0,
        //                 "amountScale": 4,
        //                 "priceUnit": 0.5,
        //                 "volUnit": 1,
        //                 "minVol": 1,
        //                 "maxVol": 1000000,
        //                 "bidLimitPriceRate": 0.1,
        //                 "askLimitPriceRate": 0.1,
        //                 "takerFeeRate": 0.0006,
        //                 "makerFeeRate": 0.0002,
        //                 "maintenanceMarginRate": 0.004,
        //                 "initialMarginRate": 0.008,
        //                 "riskBaseVol": 10000,
        //                 "riskIncrVol": 200000,
        //                 "riskIncrMmr": 0.004,
        //                 "riskIncrImr": 0.004,
        //                 "riskLevelLimit": 5,
        //                 "priceCoefficientVariation": 0.1,
        //                 "indexOrigin": ["BINANCE","GATEIO","HUOBI","MXC"],
        //                 "state": 0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //                 "isNew": false,
        //                 "isHot": true,
        //                 "isHidden": false
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseLeverageTiers (data, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market) {
        /**
         * @ignore
         * @method
         * @param {object} info Exchange response for 1 market
         * @param {object} market CCXT market
         */
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "displayName": "BTC_USDT永续",
        //        "displayNameEn": "BTC_USDT SWAP",
        //        "positionOpenType": 3,
        //        "baseCoin": "BTC",
        //        "quoteCoin": "USDT",
        //        "settleCoin": "USDT",
        //        "contractSize": 0.0001,
        //        "minLeverage": 1,
        //        "maxLeverage": 125,
        //        "priceScale": 2,
        //        "volScale": 0,
        //        "amountScale": 4,
        //        "priceUnit": 0.5,
        //        "volUnit": 1,
        //        "minVol": 1,
        //        "maxVol": 1000000,
        //        "bidLimitPriceRate": 0.1,
        //        "askLimitPriceRate": 0.1,
        //        "takerFeeRate": 0.0006,
        //        "makerFeeRate": 0.0002,
        //        "maintenanceMarginRate": 0.004,
        //        "initialMarginRate": 0.008,
        //        "riskBaseVol": 10000,
        //        "riskIncrVol": 200000,
        //        "riskIncrMmr": 0.004,
        //        "riskIncrImr": 0.004,
        //        "riskLevelLimit": 5,
        //        "priceCoefficientVariation": 0.1,
        //        "indexOrigin": ["BINANCE","GATEIO","HUOBI","MXC"],
        //        "state": 0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //        "isNew": false,
        //        "isHot": true,
        //        "isHidden": false
        //    }
        //
        let maintenanceMarginRate = this.safeString (info, 'maintenanceMarginRate');
        let initialMarginRate = this.safeString (info, 'initialMarginRate');
        const maxVol = this.safeString (info, 'maxVol');
        const riskIncrVol = this.safeString (info, 'riskIncrVol');
        const riskIncrMmr = this.safeString (info, 'riskIncrMmr');
        const riskIncrImr = this.safeString (info, 'riskIncrImr');
        let floor = '0';
        const tiers = [];
        const quoteId = this.safeString (info, 'quoteCoin');
        while (Precise.stringLt (floor, maxVol)) {
            const cap = Precise.stringAdd (floor, riskIncrVol);
            tiers.push ({
                'tier': this.parseNumber (Precise.stringDiv (cap, riskIncrVol)),
                'currency': this.safeCurrencyCode (quoteId),
                'minNotional': this.parseNumber (floor),
                'maxNotional': this.parseNumber (cap),
                'maintenanceMarginRate': this.parseNumber (maintenanceMarginRate),
                'maxLeverage': this.parseNumber (Precise.stringDiv ('1', initialMarginRate)),
                'info': info,
            });
            initialMarginRate = Precise.stringAdd (initialMarginRate, riskIncrImr);
            maintenanceMarginRate = Precise.stringAdd (maintenanceMarginRate, riskIncrMmr);
            floor = cap;
        }
        return tiers;
    }

    async setPositionMode (hedged, symbol = undefined, params = {}) {
        const request = {
            'positionMode': hedged ? 1 : 2, // 1 Hedge, 2 One-way, before changing position mode make sure that there are no active orders, planned orders, or open positions, the risk limit level will be reset to 1
        };
        const response = await this.contractPrivatePostPositionChangePositionMode (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "code":0
        //     }
        //
        return response;
    }

    async fetchPositionMode (symbol = undefined, params = {}) {
        const response = await this.contractPrivateGetPositionPositionMode (params);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":2
        //     }
        //
        const positionMode = this.safeInteger (response, 'data');
        return {
            'info': response,
            'hedged': (positionMode === 1),
        };
    }
};
