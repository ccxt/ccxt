
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitrue.js';
import { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, BadRequest, BadSymbol, AccountSuspended, OrderImmediatelyFillable, OnMaintenance } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TRUNCATE, TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class bitrue extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitrue',
            'name': 'Bitrue',
            'countries': [ 'SG' ], // Singapore, Malta
            'rateLimit': 1000,
            'certified': false,
            'version': 'v1',
            'pro': true,
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': undefined, // has but unimplemented
                'future': undefined,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPositionMode': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '1d': '1D',
                '1w': '1W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/139516488-243a830d-05dd-446b-91c6-c1f18fe30c63.jpg',
                'api': {
                    'v1': 'https://www.bitrue.com/api/v1',
                    'v2': 'https://www.bitrue.com/api/v2',
                    'kline': 'https://www.bitrue.com/kline-api',
                },
                'www': 'https://www.bitrue.com',
                'referral': 'https://www.bitrue.com/activity/task/task-landing?inviteCode=EZWETQE&cn=900000',
                'doc': [
                    'https://github.com/Bitrue-exchange/bitrue-official-api-docs',
                ],
                'fees': 'https://bitrue.zendesk.com/hc/en-001/articles/4405479952537',
            },
            'api': {
                'kline': {
                    'public': {
                        'get': {
                            'public.json': 1,
                            'public{currency}.json': 1,
                        },
                    },
                },
                'v1': {
                    'public': {
                        'get': {
                            'ping': 1,
                            'time': 1,
                            'exchangeInfo': 1,
                            'depth': { 'cost': 1, 'byLimit': [ [ 100, 1 ], [ 500, 5 ], [ 1000, 10 ] ] },
                            'trades': 1,
                            'historicalTrades': 5,
                            'aggTrades': 1,
                            'ticker/24hr': { 'cost': 1, 'noSymbol': 40 },
                            'ticker/price': { 'cost': 1, 'noSymbol': 2 },
                            'ticker/bookTicker': { 'cost': 1, 'noSymbol': 2 },
                            'market/kline': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'order': 1,
                            'openOrders': 1,
                            'allOrders': 5,
                            'account': 5,
                            'myTrades': { 'cost': 5, 'noSymbol': 40 },
                            'etf/net-value/{symbol}': 1,
                            'withdraw/history': 1,
                            'deposit/history': 1,
                        },
                        'post': {
                            'order': 4,
                            'withdraw/commit': 1,
                        },
                        'delete': {
                            'order': 1,
                        },
                    },
                },
                'v2': {
                    'private': {
                        'get': {
                            'myTrades': 5,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.00098'),
                    'maker': this.parseNumber ('0.00098'),
                },
                'future': {
                    'trading': {
                        'feeSide': 'quote',
                        'tierBased': true,
                        'percentage': true,
                        'taker': this.parseNumber ('0.000400'),
                        'maker': this.parseNumber ('0.000200'),
                        'tiers': {
                            'taker': [
                                [ this.parseNumber ('0'), this.parseNumber ('0.000400') ],
                                [ this.parseNumber ('250'), this.parseNumber ('0.000400') ],
                                [ this.parseNumber ('2500'), this.parseNumber ('0.000350') ],
                                [ this.parseNumber ('7500'), this.parseNumber ('0.000320') ],
                                [ this.parseNumber ('22500'), this.parseNumber ('0.000300') ],
                                [ this.parseNumber ('50000'), this.parseNumber ('0.000270') ],
                                [ this.parseNumber ('100000'), this.parseNumber ('0.000250') ],
                                [ this.parseNumber ('200000'), this.parseNumber ('0.000220') ],
                                [ this.parseNumber ('400000'), this.parseNumber ('0.000200') ],
                                [ this.parseNumber ('750000'), this.parseNumber ('0.000170') ],
                            ],
                            'maker': [
                                [ this.parseNumber ('0'), this.parseNumber ('0.000200') ],
                                [ this.parseNumber ('250'), this.parseNumber ('0.000160') ],
                                [ this.parseNumber ('2500'), this.parseNumber ('0.000140') ],
                                [ this.parseNumber ('7500'), this.parseNumber ('0.000120') ],
                                [ this.parseNumber ('22500'), this.parseNumber ('0.000100') ],
                                [ this.parseNumber ('50000'), this.parseNumber ('0.000080') ],
                                [ this.parseNumber ('100000'), this.parseNumber ('0.000060') ],
                                [ this.parseNumber ('200000'), this.parseNumber ('0.000040') ],
                                [ this.parseNumber ('400000'), this.parseNumber ('0.000020') ],
                                [ this.parseNumber ('750000'), this.parseNumber ('0') ],
                            ],
                        },
                    },
                },
                'delivery': {
                    'trading': {
                        'feeSide': 'base',
                        'tierBased': true,
                        'percentage': true,
                        'taker': this.parseNumber ('0.000500'),
                        'maker': this.parseNumber ('0.000100'),
                        'tiers': {
                            'taker': [
                                [ this.parseNumber ('0'), this.parseNumber ('0.000500') ],
                                [ this.parseNumber ('250'), this.parseNumber ('0.000450') ],
                                [ this.parseNumber ('2500'), this.parseNumber ('0.000400') ],
                                [ this.parseNumber ('7500'), this.parseNumber ('0.000300') ],
                                [ this.parseNumber ('22500'), this.parseNumber ('0.000250') ],
                                [ this.parseNumber ('50000'), this.parseNumber ('0.000240') ],
                                [ this.parseNumber ('100000'), this.parseNumber ('0.000240') ],
                                [ this.parseNumber ('200000'), this.parseNumber ('0.000240') ],
                                [ this.parseNumber ('400000'), this.parseNumber ('0.000240') ],
                                [ this.parseNumber ('750000'), this.parseNumber ('0.000240') ],
                            ],
                            'maker': [
                                [ this.parseNumber ('0'), this.parseNumber ('0.000100') ],
                                [ this.parseNumber ('250'), this.parseNumber ('0.000080') ],
                                [ this.parseNumber ('2500'), this.parseNumber ('0.000050') ],
                                [ this.parseNumber ('7500'), this.parseNumber ('0.0000030') ],
                                [ this.parseNumber ('22500'), this.parseNumber ('0') ],
                                [ this.parseNumber ('50000'), this.parseNumber ('-0.000050') ],
                                [ this.parseNumber ('100000'), this.parseNumber ('-0.000060') ],
                                [ this.parseNumber ('200000'), this.parseNumber ('-0.000070') ],
                                [ this.parseNumber ('400000'), this.parseNumber ('-0.000080') ],
                                [ this.parseNumber ('750000'), this.parseNumber ('-0.000090') ],
                            ],
                        },
                    },
                },
            },
            // exchange-specific options
            'options': {
                // 'fetchTradesMethod': 'publicGetAggTrades', // publicGetTrades, publicGetHistoricalTrades
                'fetchMyTradesMethod': 'v2PrivateGetMyTrades', // v1PrivateGetMyTrades
                'hasAlreadyAuthenticatedSuccessfully': false,
                'recvWindow': 5 * 1000, // 5 sec, binance default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': {
                    'market': 'FULL', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
                    'limit': 'FULL', // we change it from 'ACK' by default to 'FULL' (returns immediately if limit is not hit)
                },
                'networks': {
                    'ERC20': 'ETH',
                    'TRC20': 'TRX',
                    'TRON': 'TRX',
                },
                'networksById': {
                    'TRX': 'TRC20',
                    'ETH': 'ERC20',
                },
            },
            'commonCurrencies': {
                'MIM': 'MIM Swarm',
            },
            'precisionMode': TICK_SIZE,
            // https://binance-docs.github.io/apidocs/spot/en/#error-codes-2
            'exceptions': {
                'exact': {
                    'System is under maintenance.': OnMaintenance, // {"code":1,"msg":"System is under maintenance."}
                    'System abnormality': ExchangeError, // {"code":-1000,"msg":"System abnormality"}
                    'You are not authorized to execute this request.': PermissionDenied, // {"msg":"You are not authorized to execute this request."}
                    'API key does not exist': AuthenticationError,
                    'Order would trigger immediately.': OrderImmediatelyFillable,
                    'Stop price would trigger immediately.': OrderImmediatelyFillable, // {"code":-2010,"msg":"Stop price would trigger immediately."}
                    'Order would immediately match and take.': OrderImmediatelyFillable, // {"code":-2010,"msg":"Order would immediately match and take."}
                    'Account has insufficient balance for requested action.': InsufficientFunds,
                    'Rest API trading is not enabled.': ExchangeNotAvailable,
                    "You don't have permission.": PermissionDenied, // {"msg":"You don't have permission.","success":false}
                    'Market is closed.': ExchangeNotAvailable, // {"code":-1013,"msg":"Market is closed."}
                    'Too many requests. Please try again later.': DDoSProtection, // {"msg":"Too many requests. Please try again later.","success":false}
                    '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                    '-1001': ExchangeNotAvailable, // 'Internal error; unable to process your request. Please try again.'
                    '-1002': AuthenticationError, // 'You are not authorized to execute this request.'
                    '-1003': RateLimitExceeded, // {"code":-1003,"msg":"Too much request weight used, current limit is 1200 request weight per 1 MINUTE. Please use the websocket for live updates to avoid polling the API."}
                    '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                    '-1015': RateLimitExceeded, // 'Too many new orders; current limit is %s orders per %s.'
                    '-1016': ExchangeNotAvailable, // 'This service is no longer available.',
                    '-1020': BadRequest, // 'This operation is not supported.'
                    '-1021': InvalidNonce, // 'your time is ahead of server'
                    '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                    '-1100': BadRequest, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                    '-1101': BadRequest, // Too many parameters; expected %s and received %s.
                    '-1102': BadRequest, // Param %s or %s must be sent, but both were empty
                    '-1103': BadRequest, // An unknown parameter was sent.
                    '-1104': BadRequest, // Not all sent parameters were read, read 8 parameters but was sent 9
                    '-1105': BadRequest, // Parameter %s was empty.
                    '-1106': BadRequest, // Parameter %s sent when not required.
                    '-1111': BadRequest, // Precision is over the maximum defined for this asset.
                    '-1112': InvalidOrder, // No orders on book for symbol.
                    '-1114': BadRequest, // TimeInForce parameter sent when not required.
                    '-1115': BadRequest, // Invalid timeInForce.
                    '-1116': BadRequest, // Invalid orderType.
                    '-1117': BadRequest, // Invalid side.
                    '-1118': BadRequest, // New client order ID was empty.
                    '-1119': BadRequest, // Original client order ID was empty.
                    '-1120': BadRequest, // Invalid interval.
                    '-1121': BadSymbol, // Invalid symbol.
                    '-1125': AuthenticationError, // This listenKey does not exist.
                    '-1127': BadRequest, // More than %s hours between startTime and endTime.
                    '-1128': BadRequest, // {"code":-1128,"msg":"Combination of optional parameters invalid."}
                    '-1130': BadRequest, // Data sent for paramter %s is not valid.
                    '-1131': BadRequest, // recvWindow must be less than 60000
                    '-2008': AuthenticationError, // {"code":-2008,"msg":"Invalid Api-Key ID."}
                    '-2010': ExchangeError, // generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc...
                    '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                    '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
                    '-2014': AuthenticationError, // { "code":-2014, "msg": "API-key format invalid." }
                    '-2015': AuthenticationError, // "Invalid API-key, IP, or permissions for action."
                    '-2019': InsufficientFunds, // {"code":-2019,"msg":"Margin is insufficient."}
                    '-3005': InsufficientFunds, // {"code":-3005,"msg":"Transferring out not allowed. Transfer out amount exceeds max amount."}
                    '-3006': InsufficientFunds, // {"code":-3006,"msg":"Your borrow amount has exceed maximum borrow amount."}
                    '-3008': InsufficientFunds, // {"code":-3008,"msg":"Borrow not allowed. Your borrow amount has exceed maximum borrow amount."}
                    '-3010': ExchangeError, // {"code":-3010,"msg":"Repay not allowed. Repay amount exceeds borrow amount."}
                    '-3015': ExchangeError, // {"code":-3015,"msg":"Repay amount exceeds borrow amount."}
                    '-3022': AccountSuspended, // You account's trading is banned.
                    '-4028': BadRequest, // {"code":-4028,"msg":"Leverage 100 is not valid"}
                    '-3020': InsufficientFunds, // {"code":-3020,"msg":"Transfer out amount exceeds max amount."}
                    '-3041': InsufficientFunds, // {"code":-3041,"msg":"Balance is not enough"}
                    '-5013': InsufficientFunds, // Asset transfer failed: insufficient balance"
                    '-11008': InsufficientFunds, // {"code":-11008,"msg":"Exceeding the account's maximum borrowable limit."}
                    '-4051': InsufficientFunds, // {"code":-4051,"msg":"Isolated balance insufficient."}
                },
                'broad': {
                    'has no operation privilege': PermissionDenied,
                    'MAX_POSITION': InvalidOrder, // {"code":-2010,"msg":"Filter failure: MAX_POSITION"}
                },
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['quote'], this.precisionMode, this.paddingMode);
    }

    currencyToPrecision (code, fee, networkCode = undefined) {
        // info is available in currencies only if the user has configured his api keys
        if (this.safeValue (this.currencies[code], 'precision') !== undefined) {
            return this.decimalToPrecision (fee, TRUNCATE, this.currencies[code]['precision'], this.precisionMode, this.paddingMode);
        } else {
            return this.numberToString (fee);
        }
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name bitrue#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v1PublicGetPing (params);
        //
        // empty means working status.
        //
        //     {}
        //
        const keys = Object.keys (response);
        const keysLength = keys.length;
        const formattedStatus = keysLength ? 'maintenance' : 'ok';
        return {
            'status': formattedStatus,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bitrue#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v1PublicGetTime (params);
        //
        //     {
        //         "serverTime":1635467280514
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    safeNetwork (networkId) {
        const uppercaseNetworkId = networkId.toUpperCase ();
        const networksById = {
            'Aeternity': 'Aeternity',
            'AION': 'AION',
            'Algorand': 'Algorand',
            'ASK': 'ASK',
            'ATOM': 'ATOM',
            'AVAX C-Chain': 'AVAX C-Chain',
            'bch': 'bch',
            'BCH': 'BCH',
            'BEP2': 'BEP2',
            'BEP20': 'BEP20',
            'Bitcoin': 'Bitcoin',
            'BRP20': 'BRP20',
            'Cardano': 'ADA',
            'CasinoCoin': 'CasinoCoin',
            'CasinoCoin XRPL': 'CasinoCoin XRPL',
            'Contentos': 'Contentos',
            'Dash': 'Dash',
            'Decoin': 'Decoin',
            'DeFiChain': 'DeFiChain',
            'DGB': 'DGB',
            'Divi': 'Divi',
            'dogecoin': 'DOGE',
            'EOS': 'EOS',
            'ERC20': 'ERC20',
            'ETC': 'ETC',
            'Filecoin': 'Filecoin',
            'FREETON': 'FREETON',
            'HBAR': 'HBAR',
            'Hedera Hashgraph': 'Hedera Hashgraph',
            'HRC20': 'HRC20',
            'ICON': 'ICON',
            'ICP': 'ICP',
            'Ignis': 'Ignis',
            'Internet Computer': 'Internet Computer',
            'IOTA': 'IOTA',
            'KAVA': 'KAVA',
            'KSM': 'KSM',
            'LiteCoin': 'LiteCoin',
            'Luna': 'Luna',
            'MATIC': 'MATIC',
            'Mobile Coin': 'Mobile Coin',
            'MonaCoin': 'MonaCoin',
            'Monero': 'Monero',
            'NEM': 'NEM',
            'NEP5': 'NEP5',
            'OMNI': 'OMNI',
            'PAC': 'PAC',
            'Polkadot': 'Polkadot',
            'Ravencoin': 'Ravencoin',
            'Safex': 'Safex',
            'SOLANA': 'SOL',
            'Songbird': 'Songbird',
            'Stellar Lumens': 'Stellar Lumens',
            'Symbol': 'Symbol',
            'Tezos': 'XTZ',
            'theta': 'theta',
            'THETA': 'THETA',
            'TRC20': 'TRC20',
            'VeChain': 'VeChain',
            'VECHAIN': 'VECHAIN',
            'Wanchain': 'Wanchain',
            'XinFin Network': 'XinFin Network',
            'XRP': 'XRP',
            'XRPL': 'XRPL',
            'ZIL': 'ZIL',
        };
        return this.safeString2 (networksById, networkId, uppercaseNetworkId, networkId);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitrue#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.v1PublicGetExchangeInfo (params);
        //
        //     {
        //         "timezone":"CTT",
        //         "serverTime":1635464889117,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUESTS_WEIGHT","interval":"MINUTES","limit":6000},
        //             {"rateLimitType":"ORDERS","interval":"SECONDS","limit":150},
        //             {"rateLimitType":"ORDERS","interval":"DAYS","limit":288000},
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"SHABTC",
        //                 "status":"TRADING",
        //                 "baseAsset":"sha",
        //                 "baseAssetPrecision":0,
        //                 "quoteAsset":"btc",
        //                 "quotePrecision":10,
        //                 "orderTypes":["MARKET","LIMIT"],
        //                 "icebergAllowed":false,
        //                 "filters":[
        //                     {"filterType":"PRICE_FILTER","minPrice":"0.00000001349","maxPrice":"0.00000017537","priceScale":10},
        //                     {"filterType":"LOT_SIZE","minQty":"1.0","minVal":"0.00020","maxQty":"1000000000","volumeScale":0},
        //                 ],
        //                 "defaultPrice":"0.0000006100",
        //             },
        //         ],
        //         "coins":[
        //           {
        //               coin: "near",
        //               coinFulName: "NEAR Protocol",
        //               chains: [ "BEP20", ],
        //               chainDetail: [
        //                 {
        //                     chain: "BEP20",
        //                     enableWithdraw: true,
        //                     enableDeposit: true,
        //                     withdrawFee: "0.2000",
        //                     minWithdraw: "5.0000",
        //                     maxWithdraw: "1000000000000000.0000",
        //                 },
        //               ],
        //           },
        //         ],
        //     }
        //
        const result = {};
        const coins = this.safeValue (response, 'coins', []);
        for (let i = 0; i < coins.length; i++) {
            const currency = coins[i];
            const id = this.safeString (currency, 'coin');
            const name = this.safeString (currency, 'coinFulName');
            const code = this.safeCurrencyCode (id);
            let deposit = undefined;
            let withdraw = undefined;
            let minWithdrawString = undefined;
            let maxWithdrawString = undefined;
            let minWithdrawFeeString = undefined;
            const networkDetails = this.safeValue (currency, 'chainDetail', []);
            const networks = {};
            for (let j = 0; j < networkDetails.length; j++) {
                const entry = networkDetails[j];
                const networkId = this.safeString (entry, 'chain');
                const network = this.networkIdToCode (networkId, code);
                const enableDeposit = this.safeValue (entry, 'enableDeposit');
                deposit = (enableDeposit) ? enableDeposit : deposit;
                const enableWithdraw = this.safeValue (entry, 'enableWithdraw');
                withdraw = (enableWithdraw) ? enableWithdraw : withdraw;
                const networkWithdrawFeeString = this.safeString (entry, 'withdrawFee');
                if (networkWithdrawFeeString !== undefined) {
                    minWithdrawFeeString = (minWithdrawFeeString === undefined) ? networkWithdrawFeeString : Precise.stringMin (networkWithdrawFeeString, minWithdrawFeeString);
                }
                const networkMinWithdrawString = this.safeString (entry, 'minWithdraw');
                if (networkMinWithdrawString !== undefined) {
                    minWithdrawString = (minWithdrawString === undefined) ? networkMinWithdrawString : Precise.stringMin (networkMinWithdrawString, minWithdrawString);
                }
                const networkMaxWithdrawString = this.safeString (entry, 'maxWithdraw');
                if (networkMaxWithdrawString !== undefined) {
                    maxWithdrawString = (maxWithdrawString === undefined) ? networkMaxWithdrawString : Precise.stringMax (networkMaxWithdrawString, maxWithdrawString);
                }
                networks[network] = {
                    'info': entry,
                    'id': networkId,
                    'network': network,
                    'deposit': enableDeposit,
                    'withdraw': enableWithdraw,
                    'active': enableDeposit && enableWithdraw,
                    'fee': this.parseNumber (networkWithdrawFeeString),
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': this.parseNumber (networkMinWithdrawString),
                            'max': this.parseNumber (networkMaxWithdrawString),
                        },
                    },
                };
            }
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': undefined,
                'info': currency,
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'networks': networks,
                'fee': this.parseNumber (minWithdrawFeeString),
                // 'fees': fees,
                'limits': {
                    'withdraw': {
                        'min': this.parseNumber (minWithdrawString),
                        'max': this.parseNumber (maxWithdrawString),
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitrue#fetchMarkets
         * @description retrieves data on all markets for bitrue
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.v1PublicGetExchangeInfo (params);
        //
        //     {
        //         "timezone":"CTT",
        //         "serverTime":1635464889117,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUESTS_WEIGHT","interval":"MINUTES","limit":6000},
        //             {"rateLimitType":"ORDERS","interval":"SECONDS","limit":150},
        //             {"rateLimitType":"ORDERS","interval":"DAYS","limit":288000},
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"SHABTC",
        //                 "status":"TRADING",
        //                 "baseAsset":"sha",
        //                 "baseAssetPrecision":0,
        //                 "quoteAsset":"btc",
        //                 "quotePrecision":10,
        //                 "orderTypes":["MARKET","LIMIT"],
        //                 "icebergAllowed":false,
        //                 "filters":[
        //                     {"filterType":"PRICE_FILTER","minPrice":"0.00000001349","maxPrice":"0.00000017537","priceScale":10},
        //                     {"filterType":"LOT_SIZE","minQty":"1.0","minVal":"0.00020","maxQty":"1000000000","volumeScale":0},
        //                 ],
        //                 "defaultPrice":"0.0000006100",
        //             },
        //         ],
        //         "coins":[
        //             {
        //                 "coin":"sbr",
        //                 "coinFulName":"Saber",
        //                 "enableWithdraw":true,
        //                 "enableDeposit":true,
        //                 "chains":["SOLANA"],
        //                 "withdrawFee":"2.0",
        //                 "minWithdraw":"5.0",
        //                 "maxWithdraw":"1000000000000000",
        //             },
        //         ],
        //     }
        //
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const markets = this.safeValue (response, 'symbols', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const lowercaseId = this.safeStringLower (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const filters = this.safeValue (market, 'filters', []);
            const filtersByType = this.indexBy (filters, 'filterType');
            const status = this.safeString (market, 'status');
            const priceFilter = this.safeValue (filtersByType, 'PRICE_FILTER', {});
            const amountFilter = this.safeValue (filtersByType, 'LOT_SIZE', {});
            const defaultPricePrecision = this.safeString (market, 'pricePrecision');
            const defaultAmountPrecision = this.safeString (market, 'quantityPrecision');
            const pricePrecision = this.safeString (priceFilter, 'priceScale', defaultPricePrecision);
            const amountPrecision = this.safeString (amountFilter, 'volumeScale', defaultAmountPrecision);
            const entry = {
                'id': id,
                'lowercaseId': lowercaseId,
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
                'active': (status === 'TRADING'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (amountPrecision)),
                    'price': this.parseNumber (this.parsePrecision (pricePrecision)),
                    'base': this.parseNumber (this.parsePrecision (this.safeString (market, 'baseAssetPrecision'))),
                    'quote': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (amountFilter, 'minQty'),
                        'max': this.safeNumber (amountFilter, 'maxQty'),
                    },
                    'price': {
                        'min': this.safeNumber (priceFilter, 'minPrice'),
                        'max': this.safeNumber (priceFilter, 'maxPrice'),
                    },
                    'cost': {
                        'min': this.safeNumber (amountFilter, 'minVal'),
                        'max': undefined,
                    },
                },
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    parseBalance (response) {
        const result = {
            'info': response,
        };
        const timestamp = this.safeInteger (response, 'updateTime');
        const balances = this.safeValue (response, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitrue#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.v1PrivateGetAccount (params);
        //
        //     {
        //         "makerCommission":0,
        //         "takerCommission":0,
        //         "buyerCommission":0,
        //         "sellerCommission":0,
        //         "updateTime":null,
        //         "balances":[
        //             {"asset":"sbr","free":"0","locked":"0"},
        //             {"asset":"ksm","free":"0","locked":"0"},
        //             {"asset":"neo3s","free":"0","locked":"0"},
        //         ],
        //         "canTrade":false,
        //         "canWithdraw":false,
        //         "canDeposit":false
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000, see https://github.com/Bitrue-exchange/bitrue-official-api-docs#order-book
        }
        const response = await this.v1PublicGetDepth (this.extend (request, params));
        //
        //     {
        //         "lastUpdateId":1635474910177,
        //         "bids":[
        //             ["61436.84","0.05",[]],
        //             ["61435.77","0.0124",[]],
        //             ["61434.88","0.012",[]],
        //         ],
        //         "asks":[
        //             ["61452.46","0.0001",[]],
        //             ["61452.47","0.0597",[]],
        //             ["61452.76","0.0713",[]],
        //         ]
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "id":397945892,
        //         "last":"1.143411",
        //         "lowestAsk":"1.144223",
        //         "highestBid":"1.141696",
        //         "percentChange":"-0.001432",
        //         "baseVolume":"338287",
        //         "quoteVolume":"415013.244366",
        //         "isFrozen":"0",
        //         "high24hr":"1.370087",
        //         "low24hr":"1.370087",
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high24hr'),
            'low': this.safeString (ticker, 'low24hr'),
            'bid': this.safeString (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'percentChange'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bitrue#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseBaseId = this.safeStringUpper (market, 'baseId');
        const uppercaseQuoteId = this.safeStringUpper (market, 'quoteId');
        const request = {
            'currency': uppercaseQuoteId,
            'command': 'returnTicker',
        };
        const response = await this.klinePublicGetPublicCurrencyJson (this.extend (request, params));
        //
        //     {
        //         "code":"200",
        //         "msg":"success",
        //         "data":{
        //             "DODO3S_USDT":{
        //                 "id":397945892,
        //                 "last":"1.143411",
        //                 "lowestAsk":"1.144223",
        //                 "highestBid":"1.141696",
        //                 "percentChange":"-0.001432",
        //                 "baseVolume":"338287",
        //                 "quoteVolume":"415013.244366",
        //                 "isFrozen":"0",
        //                 "high24hr":"1.370087",
        //                 "low24hr":"1.370087"
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const id = uppercaseBaseId + '_' + uppercaseQuoteId;
        const ticker = this.safeValue (data, id);
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' fetchTicker() could not find the ticker for ' + market['symbol']);
        }
        return this.parseTicker (ticker, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'scale': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetMarketKline (this.extend (request, params));
        //
        //       {
        //           "symbol":"BTCUSDT",
        //           "scale":"KLINE_1MIN",
        //           "data":[
        //                {
        //                   "i":"1660825020",
        //                   "a":"93458.778",
        //                   "v":"3.9774",
        //                   "c":"23494.99",
        //                   "h":"23509.63",
        //                   "l":"23491.93",
        //                   "o":"23508.34"
        //                }
        //           ]
        //       }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //      {
        //         "i":"1660825020",
        //         "a":"93458.778",
        //         "v":"3.9774",
        //         "c":"23494.99",
        //         "h":"23509.63",
        //         "l":"23491.93",
        //         "o":"23508.34"
        //      }
        //
        return [
            this.safeTimestamp (ohlcv, 'i'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    async fetchBidsAsks (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple markets
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBidsAsks', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = undefined;
        if (type === 'future') {
            method = 'fapiPublicGetTickerBookTicker';
        } else if (type === 'delivery') {
            method = 'dapiPublicGetTickerBookTicker';
        } else {
            method = 'publicGetTickerBookTicker';
        }
        const response = await this[method] (query);
        return this.parseTickers (response, symbols);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const request = {
            'command': 'returnTicker',
        };
        const response = await this.klinePublicGetPublicJson (this.extend (request, params));
        //
        //     {
        //         "code":"200",
        //         "msg":"success",
        //         "data":{
        //             "DODO3S_USDT":{
        //                 "id":397945892,
        //                 "last":"1.143411",
        //                 "lowestAsk":"1.144223",
        //                 "highestBid":"1.141696",
        //                 "percentChange":"-0.001432",
        //                 "baseVolume":"338287",
        //                 "quoteVolume":"415013.244366",
        //                 "isFrozen":"0",
        //                 "high24hr":"1.370087",
        //                 "low24hr":"1.370087"
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        // the exchange returns market ids with an underscore from the tickers endpoint
        // the market ids do not have an underscore, so it has to be removed
        // https://github.com/ccxt/ccxt/issues/13856
        const tickers = {};
        const marketIds = Object.keys (data);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i].replace ('_', '');
            tickers[marketId] = data[marketIds[i]];
        }
        return this.parseTickers (tickers, symbols);
    }

    parseTrade (trade, market = undefined) {
        //
        // aggregate trades
        //  - "T" is timestamp of *api-call* not trades. Use more expensive v1PublicGetHistoricalTrades if actual timestamp of trades matter
        //  - Trades are aggregated by timestamp, price, and side. But "m" is always True. Use method above if side of trades matter
        //
        //     {
        //         "a": 26129,         // Aggregate tradeId
        //         "p": "0.01633102",  // Price
        //         "q": "4.70443515",  // Quantity
        //         "f": 27781,         // First tradeId
        //         "l": 27781,         // Last tradeId
        //         "T": 1498793709153, // Timestamp of *Api-call* not trade!
        //         "m": true,          // Was the buyer the maker?  // Always True -> ignore it and leave side undefined
        //         "M": true           // Was the trade the best price match?
        //     }
        //
        // recent public trades and old public trades
        //
        //     {
        //         "id": 28457,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "time": 1499865549590,  // Actual timestamp of trade
        //         "isBuyerMaker": true,
        //         "isBestMatch": true
        //     }
        //
        // private trades
        //
        //     {
        //         "symbol":"USDCUSDT",
        //         "id":20725156,
        //         "orderId":2880918576,
        //         "origClientOrderId":null,
        //         "price":"0.9996000000000000",
        //         "qty":"100.0000000000000000",
        //         "commission":null,
        //         "commissionAssert":null,
        //         "time":1635558511000,
        //         "isBuyer":false,
        //         "isMaker":false,
        //         "isBestMatch":true
        //     }
        //
        const timestamp = this.safeInteger2 (trade, 'T', 'time');
        const priceString = this.safeString2 (trade, 'p', 'price');
        const amountString = this.safeString2 (trade, 'q', 'qty');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const orderId = this.safeString (trade, 'orderId');
        let id = this.safeString2 (trade, 't', 'a');
        id = this.safeString2 (trade, 'id', 'tradeId', id);
        let side = undefined;
        const buyerMaker = this.safeValue (trade, 'isBuyerMaker');  // ignore "m" until Bitrue fixes api
        const isBuyer = this.safeValue (trade, 'isBuyer');
        if (buyerMaker !== undefined) {
            side = buyerMaker ? 'sell' : 'buy';
        }
        if (isBuyer !== undefined) {
            side = isBuyer ? 'buy' : 'sell'; // this is a true side
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeString (trade, 'commission'),
                'currency': this.safeCurrencyCode (this.safeString (trade, 'commissionAssert')),
            };
        }
        let takerOrMaker = undefined;
        const isMaker = this.safeValue2 (trade, 'isMaker', 'maker');
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'limit': 100, // default 100, max = 1000
        };
        const method = this.safeString (this.options, 'fetchTradesMethod', 'v1PublicGetAggTrades');
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        //
        // Caveats:
        // - default limit (500) applies only if no other parameters set, trades up
        //   to the maximum limit may be returned to satisfy other parameters
        // - if both limit and time window is set and time window contains more
        //   trades than the limit then the last trades from the window are returned
        // - 'tradeId' accepted and returned by this method is "aggregate" trade id
        //   which is different from actual trade id
        // - setting both fromId and time window results in error
        const response = await this[method] (this.extend (request, params));
        //
        // aggregate trades
        //
        //     [
        //         {
        //             "a": 26129,         // Aggregate tradeId
        //             "p": "0.01633102",  // Price
        //             "q": "4.70443515",  // Quantity
        //             "f": 27781,         // First tradeId
        //             "l": 27781,         // Last tradeId
        //             "T": 1498793709153, // Timestamp
        //             "m": true,          // Was the buyer the maker?
        //             "M": true           // Was the trade the best price match?
        //         }
        //     ]
        //
        // recent public trades and historical public trades
        //
        //     [
        //         {
        //             "id": 28457,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "time": 1499865549590,
        //             "isBuyerMaker": true,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceling', // currently unused
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "symbol":"USDCUSDT",
        //         "orderId":2878854881,
        //         "clientOrderId":"",
        //         "transactTime":1635551031276
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "symbol":"USDCUSDT",
        //         "orderId":"2878854881",
        //         "clientOrderId":"",
        //         "price":"1.1000000000000000",
        //         "origQty":"100.0000000000000000",
        //         "executedQty":"0.0000000000000000",
        //         "cummulativeQuoteQty":"0.0000000000000000",
        //         "status":"NEW",
        //         "timeInForce":"",
        //         "type":"LIMIT",
        //         "side":"SELL",
        //         "stopPrice":"",
        //         "icebergQty":"",
        //         "time":1635551031000,
        //         "updateTime":1635551031000,
        //         "isWorking":false
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const filled = this.safeString (order, 'executedQty');
        let timestamp = undefined;
        let lastTradeTimestamp = undefined;
        if ('time' in order) {
            timestamp = this.safeInteger (order, 'time');
        } else if ('transactTime' in order) {
            timestamp = this.safeInteger (order, 'transactTime');
        } else if ('updateTime' in order) {
            if (status === 'open') {
                if (Precise.stringGt (filled, '0')) {
                    lastTradeTimestamp = this.safeInteger (order, 'updateTime');
                } else {
                    timestamp = this.safeInteger (order, 'updateTime');
                }
            }
        }
        const average = this.safeString (order, 'avgPrice');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'origQty');
        // - Spot/Margin market: cummulativeQuoteQty
        // - Futures market: cumQuote.
        //   Note this is not the actual cost, since Binance futures uses leverage to calculate margins.
        const cost = this.safeString2 (order, 'cummulativeQuoteQty', 'cumQuote');
        const id = this.safeString (order, 'orderId');
        let type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const fills = this.safeValue (order, 'fills', []);
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timeInForce = this.safeString (order, 'timeInForce');
        const postOnly = (type === 'limit_maker') || (timeInForce === 'GTX');
        if (type === 'limit_maker') {
            type = 'limit';
        }
        const stopPriceString = this.safeString (order, 'stopPrice');
        const stopPrice = this.parseNumber (this.omitZero (stopPriceString));
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': fills,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const validOrderTypes = this.safeValue (market['info'], 'orderTypes');
        if (!this.inArray (uppercaseType, validOrderTypes)) {
            throw new InvalidOrder (this.id + ' ' + type + ' is not a valid order type in market ' + symbol);
        }
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': uppercaseType,
            // 'timeInForce': '',
            'quantity': this.amountToPrecision (symbol, amount),
            // 'price': this.priceToPrecision (symbol, price),
            // 'newClientOrderId': clientOrderId, // automatically generated if not sent
            // 'stopPrice': this.priceToPrecision (symbol, 'stopPrice'),
            // 'icebergQty': this.amountToPrecision (symbol, icebergQty),
        };
        const clientOrderId = this.safeString2 (params, 'newClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit (params, [ 'newClientOrderId', 'clientOrderId' ]);
            request['newClientOrderId'] = clientOrderId;
        }
        if (uppercaseType === 'LIMIT') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const stopPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        if (stopPrice !== undefined) {
            params = this.omit (params, [ 'triggerPrice', 'stopPrice' ]);
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        }
        const response = await this.v1PrivatePostOrder (this.extend (request, params));
        //
        //     {
        //         "symbol":"USDCUSDT",
        //         "orderId":2878854881,
        //         "clientOrderId":"",
        //         "transactTime":1635551031276
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const query = this.omit (params, [ 'type', 'clientOrderId', 'origClientOrderId' ]);
        const response = await this.v1PrivateGetOrder (this.extend (request, query));
        return this.parseOrder (response, market);
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'orderId': 123445, // long
            // 'startTime': since,
            // 'endTime': this.milliseconds (),
            // 'limit': limit, // default 100, max 1000
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        const response = await this.v1PrivateGetAllOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "0.0",
        //             "cummulativeQuoteQty": "0.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": 1499827319559,
        //             "updateTime": 1499827319559,
        //             "isWorking": true
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PrivateGetOpenOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol":"USDCUSDT",
        //             "orderId":"2878854881",
        //             "clientOrderId":"",
        //             "price":"1.1000000000000000",
        //             "origQty":"100.0000000000000000",
        //             "executedQty":"0.0000000000000000",
        //             "cummulativeQuoteQty":"0.0000000000000000",
        //             "status":"NEW",
        //             "timeInForce":"",
        //             "type":"LIMIT",
        //             "side":"SELL",
        //             "stopPrice":"",
        //             "icebergQty":"",
        //             "time":1635551031000,
        //             "updateTime":1635551031000,
        //             "isWorking":false
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const origClientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        const request = {
            'symbol': market['id'],
            // 'orderId': id,
            // 'origClientOrderId': id,
            // 'newClientOrderId': id,
        };
        if (origClientOrderId === undefined) {
            request['orderId'] = id;
        } else {
            request['origClientOrderId'] = origClientOrderId;
        }
        const query = this.omit (params, [ 'type', 'origClientOrderId', 'clientOrderId' ]);
        const response = await this.v1PrivateDeleteOrder (this.extend (request, query));
        //
        //     {
        //         "symbol": "LTCBTC",
        //         "origClientOrderId": "myOrder1",
        //         "orderId": 1,
        //         "clientOrderId": "cancelMyOrder1"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const method = this.safeString (this.options, 'fetchMyTradesMethod', 'v2PrivateGetMyTrades');
        if ((symbol === undefined) && (method === 'v2PrivateGetMyTrades')) {
            throw new ArgumentsRequired (this.id + ' v2PrivateGetMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'startTime': since,
            // 'endTime': this.milliseconds (),
            // 'fromId': 12345, // trade id to fetch from, most recent trades by default
            // 'limit': limit, // default 100, max 1000
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol":"USDCUSDT",
        //             "id":20725156,
        //             "orderId":2880918576,
        //             "origClientOrderId":null,
        //             "price":"0.9996000000000000",
        //             "qty":"100.0000000000000000",
        //             "commission":null,
        //             "commissionAssert":null,
        //             "time":1635558511000,
        //             "isBuyer":false,
        //             "isMaker":false,
        //             "isBestMatch":true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'status': 1, // 0 init, 1 finished, default 0
            // 'offset': 0,
            // 'limit': limit, // default 10, max 1000
            // 'startTime': since,
            // 'endTime': this.milliseconds (),
        };
        if (since !== undefined) {
            request['startTime'] = since;
            // request['endTime'] = this.sum (since, 7776000000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetDepositHistory (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "msg":"succ",
        //         "data":[
        //             {
        //                 "id":2659137,
        //                 "symbol":"USDC",
        //                 "amount":"200.0000000000000000",
        //                 "fee":"0.0E-15",
        //                 "createdAt":1635503169000,
        //                 "updatedAt":1635503202000,
        //                 "addressFrom":"0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2",
        //                 "addressTo":"0x190ceccb1f8bfbec1749180f0ba8922b488d865b",
        //                 "txid":"0x9970aec41099ac385568859517308707bc7d716df8dabae7b52f5b17351c3ed0",
        //                 "confirmations":5,
        //                 "status":0,
        //                 "tagType":null,
        //             },
        //             {
        //                 "id":2659137,
        //                 "symbol": "XRP",
        //                 "amount": "20.0000000000000000",
        //                 "fee": "0.0E-15",
        //                 "createdAt": 1544669393000,
        //                 "updatedAt": 1544669413000,
        //                 "addressFrom": "",
        //                 "addressTo": "raLPjTYeGezfdb6crXZzcC8RkLBEwbBHJ5_18113641",
        //                 "txid": "515B23E1F9864D3AF7F5B4C4FCBED784BAE861854FAB95F4031922B6AAEFC7AC",
        //                 "confirmations": 7,
        //                 "status": 1,
        //                 "tagType": "Tag"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'status': 5, // 0 init, 5 finished, 6 canceled, default 0
            // 'offset': 0,
            // 'limit': limit, // default 10, max 1000
            // 'startTime': since,
            // 'endTime': this.milliseconds (),
        };
        if (since !== undefined) {
            request['startTime'] = since;
            // request['endTime'] = this.sum (since, 7776000000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetWithdrawHistory (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "msg": "succ",
        //         "data": {
        //             "msg": null,
        //             "amount": 1000,
        //             "fee": 1,
        //             "ctime": null,
        //             "coin": "usdt_erc20",
        //             "addressTo": "0x2edfae3878d7b6db70ce4abed177ab2636f60c83"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransactions (data, currency);
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statusesByType = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': {
                '0': 'pending', // Email Sent
                '5': 'ok', // Failure
                '6': 'canceled',
            },
        };
        const statuses = this.safeValue (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "symbol": "XRP",
        //         "amount": "261.3361000000000000",
        //         "fee": "0.0E-15",
        //         "createdAt": 1548816979000,
        //         "updatedAt": 1548816999000,
        //         "addressFrom": "",
        //         "addressTo": "raLPjTYeGezfdb6crXZzcC8RkLBEwbBHJ5_18113641",
        //         "txid": "86D6EB68A7A28938BCE06BD348F8C07DEF500C5F7FE92069EF8C0551CE0F2C7D",
        //         "confirmations": 8,
        //         "status": 1,
        //         "tagType": "Tag"
        //     },
        //     {
        //         "symbol": "XRP",
        //         "amount": "20.0000000000000000",
        //         "fee": "0.0E-15",
        //         "createdAt": 1544669393000,
        //         "updatedAt": 1544669413000,
        //         "addressFrom": "",
        //         "addressTo": "raLPjTYeGezfdb6crXZzcC8RkLBEwbBHJ5_18113641",
        //         "txid": "515B23E1F9864D3AF7F5B4C4FCBED784BAE861854FAB95F4031922B6AAEFC7AC",
        //         "confirmations": 7,
        //         "status": 1,
        //         "tagType": "Tag"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": 183745,
        //         "symbol": "usdt_erc20",
        //         "amount": "8.4000000000000000",
        //         "fee": "1.6000000000000000",
        //         "payAmount": "0.0000000000000000",
        //         "createdAt": 1595336441000,
        //         "updatedAt": 1595336576000,
        //         "addressFrom": "",
        //         "addressTo": "0x2edfae3878d7b6db70ce4abed177ab2636f60c83",
        //         "txid": "",
        //         "confirmations": 0,
        //         "status": 6,
        //         "tagType": null
        //     }
        //
        // withdraw
        //
        //     {
        //         "msg": null,
        //         "amount": 1000,
        //         "fee": 1,
        //         "ctime": null,
        //         "coin": "usdt_erc20",
        //         "withdrawId": 1156423,
        //         "addressTo": "0x2edfae3878d7b6db70ce4abed177ab2636f60c83"
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'withdrawId');
        const tagType = this.safeString (transaction, 'tagType');
        let addressTo = this.safeString (transaction, 'addressTo');
        let addressFrom = this.safeString (transaction, 'addressFrom');
        let tagTo = undefined;
        let tagFrom = undefined;
        if (tagType !== undefined) {
            if (addressTo !== undefined) {
                const parts = addressTo.split ('_');
                addressTo = this.safeString (parts, 0);
                tagTo = this.safeString (parts, 1);
            }
            if (addressFrom !== undefined) {
                const parts = addressFrom.split ('_');
                addressFrom = this.safeString (parts, 0);
                tagFrom = this.safeString (parts, 1);
            }
        }
        const txid = this.safeString (transaction, 'txid');
        const timestamp = this.safeInteger (transaction, 'createdAt');
        const updated = this.safeInteger (transaction, 'updatedAt');
        const payAmount = ('payAmount' in transaction);
        const ctime = ('ctime' in transaction);
        const type = (payAmount || ctime) ? 'withdrawal' : 'deposit';
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const amount = this.safeNumber (transaction, 'amount');
        let network = undefined;
        let currencyId = this.safeString2 (transaction, 'symbol', 'coin');
        if (currencyId !== undefined) {
            const parts = currencyId.split ('_');
            currencyId = this.safeString (parts, 0);
            const networkId = this.safeString (parts, 1);
            if (networkId !== undefined) {
                network = networkId.toUpperCase ();
            }
        }
        const code = this.safeCurrencyCode (currencyId, currency);
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': addressTo,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': tagTo,
            'tagTo': tagTo,
            'tagFrom': tagFrom,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': false,
            'fee': fee,
        };
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        let chainName = this.safeString (params, 'chainName');
        if (chainName === undefined) {
            const networks = this.safeValue (currency, 'networks', {});
            const optionsNetworks = this.safeValue (this.options, 'networks', {});
            let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
            network = this.safeString (optionsNetworks, network, network);
            const networkEntry = this.safeValue (networks, network, {});
            chainName = this.safeString (networkEntry, 'id'); // handle ERC20>ETH alias
            if (chainName === undefined) {
                throw new ArgumentsRequired (this.id + ' withdraw() requires a network parameter or a chainName parameter');
            }
            params = this.omit (params, 'network');
        }
        const request = {
            'coin': currency['id'].toUpperCase (),
            'amount': amount,
            'addressTo': address,
            'chainName': chainName, // 'ERC20', 'TRC20', 'SOL'
            // 'addressMark': '', // mark of address
            // 'addrType': '', // type of address
            // 'tag': tag,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.v1PrivatePostWithdrawCommit (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "msg": "succ",
        //         "data": {
        //             "msg": null,
        //             "amount": 1000,
        //             "fee": 1,
        //             "ctime": null,
        //             "coin": "usdt_erc20",
        //             "withdrawId": 1156423,
        //             "addressTo": "0x2edfae3878d7b6db70ce4abed177ab2636f60c83"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTransaction (data, currency);
    }

    parseDepositWithdrawFee (fee, currency = undefined) {
        //
        //   {
        //       coin: 'adx',
        //       coinFulName: 'Ambire AdEx',
        //       chains: [ 'BSC' ],
        //       chainDetail: [ [Object] ]
        //   }
        //
        const chainDetails = this.safeValue (fee, 'chainDetail', []);
        const chainDetailLength = chainDetails.length;
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
        if (chainDetailLength !== 0) {
            for (let i = 0; i < chainDetailLength; i++) {
                const chainDetail = chainDetails[i];
                const networkId = this.safeString (chainDetail, 'chain');
                const currencyCode = this.safeString (currency, 'code');
                const networkCode = this.networkIdToCode (networkId, currencyCode);
                result['networks'][networkCode] = {
                    'deposit': { 'fee': undefined, 'percentage': undefined },
                    'withdraw': { 'fee': this.safeNumber (chainDetail, 'withdrawFee'), 'percentage': false },
                };
                if (chainDetailLength === 1) {
                    result['withdraw']['fee'] = this.safeNumber (chainDetail, 'withdrawFee');
                    result['withdraw']['percentage'] = false;
                }
            }
        }
        return result;
    }

    async fetchDepositWithdrawFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name bitrue#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#exchangeInfo_endpoint
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the bitrue api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.v1PublicGetExchangeInfo (params);
        const coins = this.safeValue (response, 'coins');
        return this.parseDepositWithdrawFees (coins, codes, 'coin');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString (api, 0);
        const access = this.safeString (api, 1);
        let url = this.urls['api'][version] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (access === 'private') {
            this.checkRequiredCredentials ();
            const recvWindow = this.safeInteger (this.options, 'recvWindow', 5000);
            let query = this.urlencode (this.extend ({
                'timestamp': this.nonce (),
                'recvWindow': recvWindow,
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret), sha256);
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0) {
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf ('LOT_SIZE') >= 0) {
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf ('PRICE_FILTER') >= 0) {
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        // check success value for wapi endpoints
        // response in format {'msg': 'The coin does not exist.', 'success': true/false}
        const success = this.safeValue (response, 'success', true);
        if (!success) {
            const messageInner = this.safeString (response, 'msg');
            let parsedMessage = undefined;
            if (messageInner !== undefined) {
                try {
                    parsedMessage = JSON.parse (messageInner);
                } catch (e) {
                    // do nothing
                    parsedMessage = undefined;
                }
                if (parsedMessage !== undefined) {
                    response = parsedMessage;
                }
            }
        }
        const message = this.safeString (response, 'msg');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, this.id + ' ' + message);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, this.id + ' ' + message);
        }
        // checks against error codes
        const error = this.safeString (response, 'code');
        if (error !== undefined) {
            // https://github.com/ccxt/ccxt/issues/6501
            // https://github.com/ccxt/ccxt/issues/7742
            if ((error === '200') || Precise.stringEquals (error, '0')) {
                return undefined;
            }
            // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
            // despite that their message is very confusing, it is raised by Binance
            // on a temporary ban, the API key is valid, but disabled for a while
            if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                throw new DDoSProtection (this.id + ' temporary banned: ' + body);
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            throw new ExchangeError (feedback);
        }
        if (!success) {
            throw new ExchangeError (this.id + ' ' + body);
        }
        return undefined;
    }

    calculateRateLimiterCost (api, method, path, params, config = {}) {
        if (('noSymbol' in config) && !('symbol' in params)) {
            return config['noSymbol'];
        } else if (('byLimit' in config) && ('limit' in params)) {
            const limit = params['limit'];
            const byLimit = config['byLimit'] as any;
            for (let i = 0; i < byLimit.length; i++) {
                const entry = byLimit[i];
                if (limit <= entry[0]) {
                    return entry[1];
                }
            }
        }
        return this.safeValue (config, 'cost', 1);
    }
}
