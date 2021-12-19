'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidAddress, ExchangeError, BadRequest, AuthenticationError, RateLimitExceeded, BadSymbol, InvalidOrder, InsufficientFunds, ArgumentsRequired, OrderNotFound, PermissionDenied } = require ('./base/errors');
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
            'has': {
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingRateHistory': true,
                'fetchMarkets': true,
                'fetchMarketsByType': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrdersByState': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '1d': '1d',
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
                        },
                        'post': {
                            'order/place': 1,
                            'order/place_batch': 1,
                            'asset/withdraw': 1,
                        },
                        'delete': {
                            'order/cancel': 1,
                            'order/cancel_by_symbol': 1,
                        },
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100, // maker / taker
                    'taker': 0.2 / 100,
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
                    'TRX': 'TRC-20',
                    'TRC20': 'TRC-20',
                    'ETH': 'ERC-20',
                    'ERC20': 'ERC-20',
                    'BEP20': 'BEP20(BSC)',
                },
            },
            'commonCurrencies': {
                'BYN': 'BeyondFi',
                'COFI': 'COFIX', // conflict with CoinFi
                'DFT': 'dFuture',
                'DRK': 'DRK',
                'FLUX1': 'FLUX', // switched places
                'FLUX': 'FLUX1', // switched places
                'HERO': 'Step Hero', // conflict with Metahero
                'MIMO': 'Mimosa',
                'PROS': 'Pros.Finance', // conflict with Prosper
                'SIN': 'Sin City Token',
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Invalid parameter
                    '401': AuthenticationError, // Invalid signature, fail to pass the validation
                    '429': RateLimitExceeded, // too many requests, rate limit rule is violated
                    '1000': PermissionDenied, // {"success":false,"code":1000,"message":"Please open contract account first!"}
                    '1002': InvalidOrder, // {"success":false,"code":1002,"message":"Contract not allow place order!"}
                    '10072': AuthenticationError, // Invalid access key
                    '10073': AuthenticationError, // Invalid request time
                    '10216': InvalidAddress, // {"code":10216,"msg":"No available deposit address"}
                    '10232': BadSymbol, // {"code":10232,"msg":"The currency not exist"}
                    '30000': BadSymbol, // Trading is suspended for the requested symbol
                    '30001': InvalidOrder, // Current trading type (bid or ask) is not allowed
                    '30002': InvalidOrder, // Invalid trading amount, smaller than the symbol minimum trading amount
                    '30003': InvalidOrder, // Invalid trading amount, greater than the symbol maximum trading amount
                    '30004': InsufficientFunds, // Insufficient balance
                    '30005': InvalidOrder, // Oversell error
                    '30010': InvalidOrder, // Price out of allowed range
                    '30016': BadSymbol, // Market is closed
                    '30019': InvalidOrder, // Orders count over limit for batch processing
                    '30020': BadSymbol, // Restricted symbol, API access is not allowed for the time being
                    '30021': BadSymbol, // Invalid symbol
                    '33333': BadSymbol, // {"code":33333,"msg":"currency can not be null"}
                },
                'broad': {
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = 'spotPublicGetCommonTimestamp';
        if (type === 'contract') {
            method = 'contractPublicGetPing';
        }
        const response = await this[method] (query);
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
        const response = await this.spotPublicGetCommonPing (params);
        //
        // { "code":200 }
        //
        const code = this.safeInteger (response, 'code');
        if (code !== undefined) {
            const status = (code === 200) ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': status,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    async fetchCurrencies (params = {}) {
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
            let currencyPrecision = undefined;
            let currencyFee = undefined;
            let currencyWithdrawMin = undefined;
            let currencyWithdrawMax = undefined;
            const networks = {};
            const chains = this.safeValue (currency, 'coins', []);
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const network = this.safeNetwork (networkId);
                const isDepositEnabled = this.safeValue (chain, 'is_deposit_enabled', false);
                const isWithdrawEnabled = this.safeValue (chain, 'is_withdraw_enabled', false);
                const active = (isDepositEnabled && isWithdrawEnabled);
                currencyActive = active || currencyActive;
                const precisionDigits = this.safeInteger (chain, 'precision');
                const precision = 1 / Math.pow (10, precisionDigits);
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
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'active': active,
                    'fee': this.safeNumber (chain, 'fee'),
                    'precision': precision,
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
                    currencyPrecision = defaultNetwork['precision'];
                }
            }
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': currencyActive,
                'fee': currencyFee,
                'precision': currencyPrecision,
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

    async fetchMarketsByType (type, params = {}) {
        const method = 'fetch_' + type + '_markets';
        return await this[method] (params);
    }

    async fetchMarkets (params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const spot = (type === 'spot');
        const swap = (type === 'swap');
        if (!spot && !swap) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to 'spot', 'margin', 'delivery' or 'future'"); // eslint-disable-line quotes
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
                'futures': false,
                'option': false,
                'derivative': true,
                'contract': true,
                'linear': true,
                'inverse': false,
                'taker': this.safeNumber (market, 'takerFeeRate'),
                'maker': this.safeNumber (market, 'makerFeeRate'),
                'contractSize': this.safeString (market, 'contractSize'),
                'active': (state === '0'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': this.safeNumber (market, 'priceUnit'),
                    'amount': this.safeNumber (market, 'volUnit'),
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
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const priceScale = this.safeInteger (market, 'price_scale');
            const quantityScale = this.safeInteger (market, 'quantity_scale');
            const pricePrecision = 1 / Math.pow (10, priceScale);
            const quantityPrecision = 1 / Math.pow (10, quantityScale);
            const state = this.safeString (market, 'state');
            const type = 'spot';
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': (state === 'ENABLED'),
                'derivative': false,
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
                    'price': pricePrecision,
                    'amount': quantityPrecision,
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
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = 'spotPublicGetMarketTicker';
        if (type === 'swap') {
            method = 'contractPublicGetTicker';
        }
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
        const baseVolume = this.safeNumber2 (ticker, 'volume', 'volume24');
        const quoteVolume = this.safeNumber (ticker, 'amount24');
        const open = this.safeNumber (ticker, 'open');
        const lastString = this.safeString2 (ticker, 'last', 'lastPrice');
        const last = this.parseNumber (lastString);
        const change = this.safeNumber (ticker, 'riseFallValue');
        const riseFallRate = this.safeString (ticker, 'riseFallRate');
        const percentageString = Precise.stringAdd (riseFallRate, '1');
        const percentage = this.parseNumber (percentageString);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber2 (ticker, 'high', 'high24Price'),
            'low': this.safeNumber2 (ticker, 'low', 'lower24Price'),
            'bid': this.safeNumber2 (ticker, 'bid', 'bid1'),
            'bidVolume': undefined,
            'ask': this.safeNumber2 (ticker, 'ask', 'ask1'),
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
        let costString = this.safeString (trade, 'amount');
        if (costString === undefined) {
            costString = Precise.stringMul (priceString, amountString);
        }
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (costString);
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
        const feeCost = this.safeNumber (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const orderId = this.safeString (trade, 'order_id');
        const isTaker = this.safeValue (trade, 'is_taker', true);
        const takerOrMaker = isTaker ? 'taker' : 'maker';
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'timeframes', {});
        const timeframes = this.safeValue (options, market['type'], {});
        const request = {
            'symbol': market['id'],
            'interval': timeframes[timeframe],
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
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const spot = (type === 'spot');
        const swap = (type === 'swap');
        let method = undefined;
        if (spot) {
            method = 'spotPrivateGetAccountInfo';
        } else if (swap) {
            method = 'contractPrivateGetAccountAssets';
        }
        const query = this.omit (params, 'type');
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
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
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
        return this.parseBalance (result);
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
        const rawNetwork = this.safeString (params, 'network');
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
        result = this.safeValue (response, network);
        if (result === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find ' + network + ' deposit address for ' + code);
        }
        return result;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
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
        return this.parseTransactions (resultList, code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
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
        return this.parseTransactions (resultList, code, since, limit);
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
        const amount = this.safeNumber (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'tx_id');
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
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
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'network': network,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'WAIT': 'pending',
            'SUCCESS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.fetchPositions (this.extend (request, params));
        const firstPosition = this.safeValue (response, 0);
        return firstPosition;
    }

    async fetchPositions (symbols = undefined, params = {}) {
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
        // todo add parsePositions, parsePosition
        const data = this.safeValue (response, 'data', []);
        return data;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        } else if (market['swap']) {
            return await this.createSwapOrder (symbol, type, side, amount, price, params);
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
        if (orderType === 'LIMIT') {
            orderType = 'LIMIT_ORDER';
        } else if ((orderType !== 'POST_ONLY') && (orderType !== 'IMMEDIATE_OR_CANCEL')) {
            throw new InvalidOrder (this.id + ' createOrder does not support ' + type + ' order type, specify one of LIMIT, LIMIT_ORDER, POST_ONLY or IMMEDIATE_OR_CANCEL');
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
        params = this.omit (params, [ 'type', 'clientOrderId', 'client_order_id' ]);
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
            throw new ArgumentsRequired (this.id + ' createSwapOrder() requires an integer openType parameter, 1 for isolated margin, 2 for cross margin');
        }
        if ((type !== 'limit') && (type !== 'market') && (type !== 1) && (type !== 2) && (type !== 3) && (type !== 4) && (type !== 5) && (type !== 6)) {
            throw new InvalidOrder (this.id + ' createSwapOrder() order type must either limit, market, or 1 for limit orders, 2 for post-only orders, 3 for IOC orders, 4 for FOK orders, 5 for market orders or 6 to convert market price to current price');
        }
        if (type === 'limit') {
            type = 1;
        } else if (type === 'market') {
            type = 6;
        }
        if ((side !== 1) && (side !== 2) && (side !== 3) && (side !== 4)) {
            throw new InvalidOrder (this.id + ' createSwapOrder() order side must be 1 open long, 2 close short, 3 open short or 4 close long');
        }
        const request = {
            'symbol': market['id'],
            'price': parseFloat (this.priceToPrecision (symbol, price)),
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
            // 'stopLossPrice': this.priceToPrecision (symbol, stopLossPrice),
            // 'takeProfitPrice': this.priceToPrecision (symbol, takeProfitPrice),
        };
        if (openType === 1) {
            const leverage = this.safeInteger (params, 'leverage');
            if (leverage === undefined) {
                throw new ArgumentsRequired (this.id + ' createSwapOrder() requires a leverage parameter for isolated margin orders');
            }
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'externalOid');
        if (clientOrderId !== undefined) {
            request['externalOid'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'externalOid' ]);
        const response = await this.contractPrivatePostOrderSubmit (this.extend (request, params));
        //
        //     {"code":200,"data":"2ff3163e8617443cb9c6fc19d42b1ca4"}
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_ids');
        if (clientOrderId !== undefined) {
            params = this.omit (params, [ 'clientOrderId', 'client_order_ids' ]);
            request['client_order_ids'] = clientOrderId;
        } else {
            request['order_ids'] = id;
        }
        const response = await this.spotPrivateDeleteOrderCancel (this.extend (request, params));
        //
        //    {"code":200,"data":{"965245851c444078a11a7d771323613b":"success"}}
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'FILLED': 'closed',
            'PARTIALLY_FILLED': 'open',
            'CANCELED': 'canceled',
            'PARTIALLY_CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
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
        // fetchOpenOrders
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
        // fetchClosedOrders, fetchCanceledOrders, fetchOrder
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
        // cancelOrder
        //
        //     {"965245851c444078a11a7d771323613b":"success"}
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
        const timestamp = this.safeInteger (order, 'create_time');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'quantity');
        const remaining = this.safeString (order, 'remain_quantity');
        const filled = this.safeString (order, 'deal_quantity');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        let side = undefined;
        const bidOrAsk = this.safeString (order, 'type');
        if (bidOrAsk === 'BID') {
            side = 'buy';
        } else if (bidOrAsk === 'ASK') {
            side = 'sell';
        }
        status = this.parseOrderStatus (state);
        let clientOrderId = this.safeString (order, 'client_order_id');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        let orderType = this.safeStringLower (order, 'order_type');
        if (orderType !== undefined) {
            orderType = orderType.replace ('_order', '');
        }
        return this.safeOrder2 ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'start_time': since,
            // 'limit': limit, // default 50, max 1000
            // 'trade_type': 'BID', // BID / ASK
        };
        const response = await this.spotPrivateGetOrderOpenOrders (this.extend (request, params));
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
        //             {
        //                 "id":"2ff3163e8617443cb9c6fc19d42b1ca4",
        //                 "symbol":"ETH_USDT",
        //                 "price":"3420",
        //                 "quantity":"0.01",
        //                 "state":"NEW",
        //                 "type":"BID",
        //                 "remain_quantity":"0.01",
        //                 "remain_amount":"34.2",
        //                 "create_time":1633988662382,
        //                 "client_order_id":"",
        //                 "order_type":"LIMIT_ORDER"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_ids': id,
        };
        const response = await this.spotPrivateGetOrderQuery (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', []);
        const firstOrder = this.safeValue (data, 0);
        if (firstOrder === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find the order id ' + id);
        }
        return this.parseOrder (firstOrder);
    }

    async fetchOrdersByState (state, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByState requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'start_time': since, // default 7 days, max 30 days
            // 'limit': limit, // default 50, max 1000
            // 'trade_type': 'BID', // BID / ASK
            'states': state, // NEW, FILLED, PARTIALLY_FILLED, CANCELED, PARTIALLY_CANCELED
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const response = await this.spotPrivateGetOrderList (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('CANCELED', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('FILLED', symbol, since, limit, params);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.spotPrivateDeleteOrderCancelBySymbol (this.extend (request, params));
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
        return response;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
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
        return response;
    }

    async reduceMargin (symbol, amount, params = {}) {
        return await this.modifyMarginHelper (symbol, amount, 'SUB', params);
    }

    async addMargin (symbol, amount, params = {}) {
        return await this.modifyMarginHelper (symbol, amount, 'ADD', params);
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        const positionId = this.safeInteger (params, 'positionId');
        if (positionId === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a positionId parameter');
        }
        await this.loadMarkets ();
        const request = {
            'positionId': positionId,
            'leverage': leverage,
        };
        return await this.contractPrivatePostPositionChangeLeverage (this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeString2 (params, 'network', 'chain'); // this line allows the user to specify either ERC20 or ETH
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
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data, currency);
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
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            throw new ExchangeError (feedback);
        }
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //
        // Gets a history of funding rates with their timestamps
        //  (param) symbol: Future currency pair
        //  (param) limit: mexc limit is page_size default 20, maximum is 100
        //  (param) since: not used by mexc
        //  (param) params: Object containing more params for the request
        //  return: [{symbol, fundingRate, timestamp, dateTime}]
        //
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
        // {
        //     "success": true,
        //     "code": 0,
        //     "data": {
        //         "pageSize": 2,
        //         "totalCount": 21,
        //         "totalPage": 11,
        //         "currentPage": 1,
        //         "resultList": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "fundingRate": 0.000266,
        //                 "settleTime": 1609804800000
        //             },
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "fundingRate": 0.00029,
        //                 "settleTime": 1609776000000
        //             }
        //         ]
        //     }
        // }
        //
        const data = this.safeValue (response, 'data');
        const result = this.safeValue (data, 'resultList');
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeString (entry, 'settleTime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }
};
