'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeNotAvailable, AccountSuspended, PermissionDenied, RateLimitExceeded, InvalidNonce, InvalidAddress, ArgumentsRequired, ExchangeError, InvalidOrder, InsufficientFunds, BadRequest, OrderNotFound, BadSymbol, NotSupported } = require ('./base/errors');
const { ROUND, TICK_SIZE, TRUNCATE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitmart extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmart',
            'name': 'BitMart',
            'countries': [ 'US', 'CN', 'HK', 'KR' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchStatus': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'hostname': 'bitmart.com', // bitmart.info for Hong Kong users
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/61835713-a2662f80-ae85-11e9-9d00-6442919701fd.jpg',
                'api': 'https://api-cloud.{hostname}', // bitmart.info for Hong Kong users
                'www': 'https://www.bitmart.com/',
                'doc': 'https://developer-pro.bitmart.com/',
                'referral': 'http://www.bitmart.com/?r=rQCFLh',
                'fees': 'https://www.bitmart.com/fee/en',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'system': {
                        'get': [
                            'time', // https://api-cloud.bitmart.com/system/time
                            'service', // https://api-cloud.bitmart.com/system/service
                        ],
                    },
                    'account': {
                        'get': [
                            'currencies', // https://api-cloud.bitmart.com/account/v1/currencies
                        ],
                    },
                    'spot': {
                        'get': [
                            'currencies',
                            'symbols',
                            'symbols/details',
                            'ticker', // ?symbol=BTC_USDT
                            'steps', // ?symbol=BMX_ETH
                            'symbols/kline', // ?symbol=BMX_ETH&step=15&from=1525760116&to=1525769116
                            'symbols/book', // ?symbol=BMX_ETH&precision=6
                            'symbols/trades', // ?symbol=BMX_ETH
                        ],
                    },
                    'contract': {
                        'get': [
                            'contracts', // https://api-cloud.bitmart.com/contract/v1/ifcontract/contracts
                            'pnls',
                            'indexes',
                            'tickers',
                            'quote',
                            'indexquote',
                            'trades',
                            'depth',
                            'fundingrate',
                        ],
                    },
                },
                'private': {
                    'account': {
                        'get': [
                            'wallet', // ?account_type=1
                            'deposit/address', // ?currency=USDT-TRC20
                            'withdraw/charge', // ?currency=BTC
                            'deposit-withdraw/history', // ?limit=10&offset=1&operationType=withdraw
                            'deposit-withdraw/detail', // ?id=1679952
                        ],
                        'post': [
                            'withdraw/apply',
                        ],
                    },
                    'spot': {
                        'get': [
                            'wallet',
                            'order_detail',
                            'orders',
                            'trades',
                        ],
                        'post': [
                            'submit_order', // https://api-cloud.bitmart.com/spot/v1/submit_order
                            'cancel_order', // https://api-cloud.bitmart.com/spot/v2/cancel_order
                            'cancel_orders',
                        ],
                    },
                    'contract': {
                        'get': [
                            'userOrders',
                            'userOrderInfo',
                            'userTrades',
                            'orderTrades',
                            'accounts',
                            'userPositions',
                            'userLiqRecords',
                            'positionFee',
                        ],
                        'post': [
                            'batchOrders',
                            'submitOrder',
                            'cancelOrders',
                            'marginOper',
                        ],
                    },
                },
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '45m': 45,
                '1h': 60,
                '2h': 120,
                '3h': 180,
                '4h': 240,
                '1d': 1440,
                '1w': 10080,
                '1M': 43200,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.0025,
                    'maker': 0.0025,
                    'tiers': {
                        'taker': [
                            [0, 0.20 / 100],
                            [10, 0.18 / 100],
                            [50, 0.16 / 100],
                            [250, 0.14 / 100],
                            [1000, 0.12 / 100],
                            [5000, 0.10 / 100],
                            [25000, 0.08 / 100],
                            [50000, 0.06 / 100],
                        ],
                        'maker': [
                            [0, 0.1 / 100],
                            [10, 0.09 / 100],
                            [50, 0.08 / 100],
                            [250, 0.07 / 100],
                            [1000, 0.06 / 100],
                            [5000, 0.05 / 100],
                            [25000, 0.04 / 100],
                            [50000, 0.03 / 100],
                        ],
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    // general errors
                    '30000': ExchangeError, // 404, Not found
                    '30001': AuthenticationError, // 401, Header X-BM-KEY is empty
                    '30002': AuthenticationError, // 401, Header X-BM-KEY not found
                    '30003': AccountSuspended, // 401, Header X-BM-KEY has frozen
                    '30004': AuthenticationError, // 401, Header X-BM-SIGN is empty
                    '30005': AuthenticationError, // 401, Header X-BM-SIGN is wrong
                    '30006': AuthenticationError, // 401, Header X-BM-TIMESTAMP is empty
                    '30007': AuthenticationError, // 401, Header X-BM-TIMESTAMP range. Within a minute
                    '30008': AuthenticationError, // 401, Header X-BM-TIMESTAMP invalid format
                    '30010': PermissionDenied, // 403, IP is forbidden. We recommend enabling IP whitelist for API trading. After that reauth your account
                    '30011': AuthenticationError, // 403, Header X-BM-KEY over expire time
                    '30012': AuthenticationError, // 403, Header X-BM-KEY is forbidden to request it
                    '30013': RateLimitExceeded, // 429, Request too many requests
                    '30014': ExchangeNotAvailable, // 503, Service unavailable
                    // funding account errors
                    '60000': BadRequest, // 400, Invalid request (maybe the body is empty, or the int parameter passes string data)
                    '60001': BadRequest, // 400, Asset account type does not exist
                    '60002': BadRequest, // 400, currency does not exist
                    '60003': ExchangeError, // 400, Currency has been closed recharge channel, if there is any problem, please consult customer service
                    '60004': ExchangeError, // 400, Currency has been closed withdraw channel, if there is any problem, please consult customer service
                    '60005': ExchangeError, // 400, Minimum amount is %s
                    '60006': ExchangeError, // 400, Maximum withdraw precision is %d
                    '60007': InvalidAddress, // 400, Only withdrawals from added addresses are allowed
                    '60008': InsufficientFunds, // 400, Balance not enough
                    '60009': ExchangeError, // 400, Beyond the limit
                    '60010': ExchangeError, // 400, Withdraw id or deposit id not found
                    '60011': InvalidAddress, // 400, Address is not valid
                    '60012': ExchangeError, // 400, This action is not supported in this currency(If IOTA, HLX recharge and withdraw calls are prohibited)
                    '60020': PermissionDenied, // 403, Your account is not allowed to recharge
                    '60021': PermissionDenied, // 403, Your account is not allowed to withdraw
                    '60022': PermissionDenied, // 403, No withdrawals for 24 hours
                    '60030': BadRequest, // 405, Method Not Allowed
                    '60031': BadRequest, // 415, Unsupported Media Type
                    '60050': ExchangeError, // 500, User account not found
                    '60051': ExchangeError, // 500, Internal Server Error
                    // spot errors
                    '50000': BadRequest, // 400, Bad Request
                    '50001': BadSymbol, // 400, Symbol not found
                    '50002': BadRequest, // 400, From Or To format error
                    '50003': BadRequest, // 400, Step format error
                    '50004': BadRequest, // 400, Kline size over 500
                    '50005': OrderNotFound, // 400, Order Id not found
                    '50006': InvalidOrder, // 400, Minimum size is %s
                    '50007': InvalidOrder, // 400, Maximum size is %s
                    '50008': InvalidOrder, // 400, Minimum price is %s
                    '50009': InvalidOrder, // 400, Minimum count*price is %s
                    '50010': InvalidOrder, // 400, RequestParam size is required
                    '50011': InvalidOrder, // 400, RequestParam price is required
                    '50012': InvalidOrder, // 400, RequestParam notional is required
                    '50013': InvalidOrder, // 400, Maximum limit*offset is %d
                    '50014': BadRequest, // 400, RequestParam limit is required
                    '50015': BadRequest, // 400, Minimum limit is 1
                    '50016': BadRequest, // 400, Maximum limit is %d
                    '50017': BadRequest, // 400, RequestParam offset is required
                    '50018': BadRequest, // 400, Minimum offset is 1
                    '50019': BadRequest, // 400, Maximum price is %s
                    // '50019': ExchangeError, // 400, Invalid status. validate status is [1=Failed, 2=Success, 3=Frozen Failed, 4=Frozen Success, 5=Partially Filled, 6=Fully Fulled, 7=Canceling, 8=Canceled
                    '50020': InsufficientFunds, // 400, Balance not enough
                    '50021': BadRequest, // 400, Invalid %s
                    '50022': ExchangeNotAvailable, // 400, Service unavailable
                    '50023': BadSymbol, // 400, This Symbol can't place order by api
                    '53000': AccountSuspended, // 403, Your account is frozen due to security policies. Please contact customer service
                    '57001': BadRequest, // 405, Method Not Allowed
                    '58001': BadRequest, // 415, Unsupported Media Type
                    '59001': ExchangeError, // 500, User account not found
                    '59002': ExchangeError, // 500, Internal Server Error
                    // contract errors
                    '40001': ExchangeError, // 400, Cloud account not found
                    '40002': ExchangeError, // 400, out_trade_no not found
                    '40003': ExchangeError, // 400, out_trade_no already existed
                    '40004': ExchangeError, // 400, Cloud account count limit
                    '40005': ExchangeError, // 400, Transfer vol precision error
                    '40006': PermissionDenied, // 400, Invalid ip error
                    '40007': BadRequest, // 400, Parse parameter error
                    '40008': InvalidNonce, // 400, Check nonce error
                    '40009': BadRequest, // 400, Check ver error
                    '40010': BadRequest, // 400, Not found func error
                    '40011': BadRequest, // 400, Invalid request
                    '40012': ExchangeError, // 500, System error
                    '40013': ExchangeError, // 400, Access too often" CLIENT_TIME_INVALID, "Please check your system time.
                    '40014': BadSymbol, // 400, This contract is offline
                    '40015': BadSymbol, // 400, This contract's exchange has been paused
                    '40016': InvalidOrder, // 400, This order would trigger user position liquidate
                    '40017': InvalidOrder, // 400, It is not possible to open and close simultaneously in the same position
                    '40018': InvalidOrder, // 400, Your position is closed
                    '40019': ExchangeError, // 400, Your position is in liquidation delegating
                    '40020': InvalidOrder, // 400, Your position volume is not enough
                    '40021': ExchangeError, // 400, The position is not exsit
                    '40022': ExchangeError, // 400, The position is not isolated
                    '40023': ExchangeError, // 400, The position would liquidate when sub margin
                    '40024': ExchangeError, // 400, The position would be warnning of liquidation when sub margin
                    '40025': ExchangeError, // 400, The position’s margin shouldn’t be lower than the base limit
                    '40026': ExchangeError, // 400, You cross margin position is in liquidation delegating
                    '40027': InsufficientFunds, // 400, You contract account available balance not enough
                    '40028': PermissionDenied, // 400, Your plan order's count is more than system maximum limit.
                    '40029': InvalidOrder, // 400, The order's leverage is too large.
                    '40030': InvalidOrder, // 400, The order's leverage is too small.
                    '40031': InvalidOrder, // 400, The deviation between current price and trigger price is too large.
                    '40032': InvalidOrder, // 400, The plan order's life cycle is too long.
                    '40033': InvalidOrder, // 400, The plan order's life cycle is too short.
                    '40034': BadSymbol, // 400, This contract is not found
                },
                'broad': {},
            },
            'commonCurrencies': {
                'COT': 'Community Coin',
                'ONE': 'Menlo One',
                'PLA': 'Plair',
            },
            'options': {
                'defaultType': 'spot', // 'spot', 'swap'
                'fetchBalance': {
                    'type': 'spot', // 'spot', 'swap', 'contract', 'account'
                },
                'createMarketBuyOrderRequiresPrice': true,
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicSystemGetTime (params);
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"c4e5e5b7-fe9f-4191-89f7-53f6c5bf9030",
        //         "data":{
        //             "server_time":1599843709578
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.safeInteger (data, 'server_time');
    }

    async fetchStatus (params = {}) {
        const options = this.safeValue (this.options, 'fetchBalance', {});
        const defaultType = this.safeString (this.options, 'defaultType');
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        params = this.omit (params, 'type');
        const response = await this.publicSystemGetService (params);
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "serivce":[
        //                 {
        //                     "title": "Spot API Stop",
        //                     "service_type": "spot",
        //                     "status": "2",
        //                     "start_time": 1527777538000,
        //                     "end_time": 1527777538000
        //                 },
        //                 {
        //                     "title": "Contract API Stop",
        //                     "service_type": "contract",
        //                     "status": "2",
        //                     "start_time": 1527777538000,
        //                     "end_time": 1527777538000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const services = this.safeValue (data, 'service', []);
        const servicesByType = this.indexBy (services, 'service_type');
        if ((type === 'swap') || (type === 'future')) {
            type = 'contract';
        }
        const service = this.safeValue (servicesByType, type);
        let status = undefined;
        let eta = undefined;
        if (service !== undefined) {
            const statusCode = this.safeInteger (service, 'status');
            if (statusCode === 2) {
                status = 'ok';
            } else {
                status = 'maintenance';
                eta = this.safeInteger (service, 'end_time');
            }
        }
        this.status = this.extend (this.status, {
            'status': status,
            'updated': this.milliseconds (),
            'eta': eta,
        });
        return this.status;
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.publicSpotGetSymbolsDetails (params);
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"a67c9146-086d-4d3f-9897-5636a9bb26e1",
        //         "data":{
        //             "symbols":[
        //                 {
        //                     "symbol":"PRQ_BTC",
        //                     "symbol_id":1232,
        //                     "base_currency":"PRQ",
        //                     "quote_currency":"BTC",
        //                     "quote_increment":"1.0000000000",
        //                     "base_min_size":"1.0000000000",
        //                     "base_max_size":"10000000.0000000000",
        //                     "price_min_precision":8,
        //                     "price_max_precision":10,
        //                     "expiration":"NA",
        //                     "min_buy_amount":"0.0001000000",
        //                     "min_sell_amount":"0.0001000000"
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const symbols = this.safeValue (data, 'symbols', []);
        const result = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const id = this.safeString (market, 'symbol');
            const numericId = this.safeInteger (market, 'symbol_id');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            //
            // https://github.com/bitmartexchange/bitmart-official-api-docs/blob/master/rest/public/symbols_details.md#response-details
            // from the above API doc:
            // quote_increment Minimum order price as well as the price increment
            // price_min_precision Minimum price precision (digit) used to query price and kline
            // price_max_precision Maximum price precision (digit) used to query price and kline
            //
            // the docs are wrong: https://github.com/ccxt/ccxt/issues/5612
            //
            const pricePrecision = this.safeInteger (market, 'price_max_precision');
            const precision = {
                'amount': this.safeFloat (market, 'base_min_size'),
                'price': parseFloat (this.decimalToPrecision (Math.pow (10, -pricePrecision), ROUND, 10)),
            };
            const minBuyCost = this.safeFloat (market, 'min_buy_amount');
            const minSellCost = this.safeFloat (market, 'min_sell_amount');
            const minCost = Math.max (minBuyCost, minSellCost);
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'base_min_size'),
                    'max': this.safeFloat (market, 'base_max_size'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': minCost,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'future': false,
                'swap': false,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': undefined,
            });
        }
        return result;
    }

    async fetchContractMarkets (params = {}) {
        const response = await this.publicContractGetContracts (params);
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"7fcedfb5-a660-4780-8a7a-b36a9e2159f7",
        //         "data":{
        //             "contracts":[
        //                 {
        //                     "contract":{
        //                         "contract_id":1,
        //                         "index_id":1,
        //                         "name":"BTCUSDT",
        //                         "display_name":"BTCUSDT永续合约",
        //                         "display_name_en":"BTCUSDT_SWAP",
        //                         "contract_type":1,
        //                         "base_coin":"BTC",
        //                         "quote_coin":"USDT",
        //                         "price_coin":"BTC",
        //                         "exchange":"*",
        //                         "contract_size":"0.0001",
        //                         "begin_at":"2018-08-17T04:00:00Z",
        //                         "delive_at":"2020-08-15T12:00:00Z",
        //                         "delivery_cycle":28800,
        //                         "min_leverage":"1",
        //                         "max_leverage":"100",
        //                         "price_unit":"0.1",
        //                         "vol_unit":"1",
        //                         "value_unit":"0.0001",
        //                         "min_vol":"1",
        //                         "max_vol":"300000",
        //                         "liquidation_warn_ratio":"0.85",
        //                         "fast_liquidation_ratio":"0.8",
        //                         "settgle_type":1,
        //                         "open_type":3,
        //                         "compensate_type":1,
        //                         "status":3,
        //                         "block":1,
        //                         "rank":1,
        //                         "created_at":"2018-07-12T19:16:57Z",
        //                         "depth_bord":"1.001",
        //                         "base_coin_zh":"比特币",
        //                         "base_coin_en":"Bitcoin",
        //                         "max_rate":"0.00375",
        //                         "min_rate":"-0.00375"
        //                     },
        //                     "risk_limit":{"contract_id":1,"base_limit":"1000000","step":"500000","maintenance_margin":"0.005","initial_margin":"0.01"},
        //                     "fee_config":{"contract_id":1,"maker_fee":"-0.0003","taker_fee":"0.001","settlement_fee":"0","created_at":"2018-07-12T20:47:22Z"},
        //                     "plan_order_config":{"contract_id":0,"min_scope":"0.001","max_scope":"2","max_count":10,"min_life_cycle":24,"max_life_cycle":168}
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const contracts = this.safeValue (data, 'contracts', []);
        const result = [];
        for (let i = 0; i < contracts.length; i++) {
            const market = contracts[i];
            const contract = this.safeValue (market, 'contract', {});
            const id = this.safeString (contract, 'contract_id');
            const numericId = this.safeInteger (contract, 'contract_id');
            const baseId = this.safeString (contract, 'base_coin');
            const quoteId = this.safeString (contract, 'quote_coin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = this.safeString (contract, 'name');
            //
            // https://github.com/bitmartexchange/bitmart-official-api-docs/blob/master/rest/public/symbols_details.md#response-details
            // from the above API doc:
            // quote_increment Minimum order price as well as the price increment
            // price_min_precision Minimum price precision (digit) used to query price and kline
            // price_max_precision Maximum price precision (digit) used to query price and kline
            //
            // the docs are wrong: https://github.com/ccxt/ccxt/issues/5612
            //
            const amountPrecision = this.safeFloat (contract, 'vol_unit');
            const pricePrecision = this.safeFloat (contract, 'price_unit');
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (contract, 'min_vol'),
                    'max': this.safeFloat (contract, 'max_vol'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            const contractType = this.safeValue (contract, 'contract_type');
            let future = false;
            let swap = false;
            let type = 'contract';
            if (contractType === 1) {
                type = 'swap';
                swap = true;
            } else if (contractType === 2) {
                type = 'future';
                future = true;
            }
            const feeConfig = this.safeValue (market, 'fee_config', {});
            const maker = this.safeFloat (feeConfig, 'maker_fee');
            const taker = this.safeFloat (feeConfig, 'taker_fee');
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': maker,
                'taker': taker,
                'type': type,
                'spot': false,
                'future': future,
                'swap': swap,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': undefined,
            });
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const spotMarkets = await this.fetchSpotMarkets ();
        const contractMarkets = await this.fetchContractMarkets ();
        const allMarkets = this.arrayConcat (spotMarkets, contractMarkets);
        return allMarkets;
    }

    parseTicker (ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "symbol":"ETH_BTC",
        //         "last_price":"0.036037",
        //         "quote_volume_24h":"4380.6660000000",
        //         "base_volume_24h":"159.3582006712",
        //         "high_24h":"0.036972",
        //         "low_24h":"0.035524",
        //         "open_24h":"0.036561",
        //         "close_24h":"0.036037",
        //         "best_ask":"0.036077",
        //         "best_ask_size":"9.9500",
        //         "best_bid":"0.035983",
        //         "best_bid_size":"4.2792",
        //         "fluctuation":"-0.0143",
        //         "url":"https://www.bitmart.com/trade?symbol=ETH_BTC"
        //     }
        //
        // contract
        //
        //     {
        //         "last_price":"422.2",
        //         "open":"430.5",
        //         "close":"422.2",
        //         "low":"421.9",
        //         "high":"436.9",
        //         "avg_price":"430.8569900089815372072",
        //         "volume":"2720",
        //         "total_volume":"18912248",
        //         "timestamp":1597631495,
        //         "rise_fall_rate":"-0.0192799070847851336",
        //         "rise_fall_value":"-8.3",
        //         "contract_id":2,
        //         "position_size":"3067404",
        //         "volume_day":"9557384",
        //         "amount24":"80995537.0919999999999974153",
        //         "base_coin_volume":"189122.48",
        //         "quote_coin_volume":"81484742.475833810590837937856",
        //         "pps":"1274350547",
        //         "index_price":"422.135",
        //         "fair_price":"422.147253318507",
        //         "depth_price":{"bid_price":"421.9","ask_price":"422","mid_price":"421.95"},
        //         "fair_basis":"0.000029027013",
        //         "fair_value":"0.012253318507",
        //         "rate":{"quote_rate":"0.0006","base_rate":"0.0003","interest_rate":"0.000099999999"},
        //         "premium_index":"0.000045851604",
        //         "funding_rate":"0.000158",
        //         "next_funding_rate":"0.000099999999",
        //         "next_funding_at":"2020-08-17T04:00:00Z"
        //     }
        //
        const timestamp = this.safeTimestamp (ticker, 'timestamp', this.milliseconds ());
        const marketId = this.safeString2 (ticker, 'symbol', 'contract_id');
        const symbol = this.safeSymbol (marketId, market, '_');
        const last = this.safeFloat2 (ticker, 'close_24h', 'last_price');
        let percentage = this.safeFloat (ticker, 'fluctuation', 'rise_fall_rate');
        if (percentage !== undefined) {
            percentage *= 100;
        }
        const baseVolume = this.safeFloat2 (ticker, 'base_volume_24h', 'base_coin_volume');
        const quoteVolume = this.safeFloat2 (ticker, 'quote_volume_24h', 'quote_coin_volume');
        const vwap = this.vwap (baseVolume, quoteVolume);
        const open = this.safeFloat2 (ticker, 'open_24h', 'open');
        let average = undefined;
        if ((last !== undefined) && (open !== undefined)) {
            average = this.sum (last, open) / 2;
        }
        average = this.safeFloat (ticker, 'avg_price', average);
        const price = this.safeValue (ticker, 'depth_price', ticker);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat2 (ticker, 'high', 'high_24h'),
            'low': this.safeFloat2 (ticker, 'low', 'low_24h'),
            'bid': this.safeFloat (price, 'best_bid', 'bid_price'),
            'bidVolume': this.safeFloat (ticker, 'best_bid_size'),
            'ask': this.safeFloat (price, 'best_ask', 'ask_price'),
            'askVolume': this.safeFloat (ticker, 'best_ask_size'),
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'open_24h'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = undefined;
        if (market['swap'] || market['future']) {
            method = 'publicContractGetTickers';
            request['contractID'] = market['id'];
        } else if (market['spot']) {
            method = 'publicSpotGetTicker';
            request['symbol'] = market['id'];
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"6aa5b923-2f57-46e3-876d-feca190e0b82",
        //         "data":{
        //             "tickers":[
        //                 {
        //                     "symbol":"ETH_BTC",
        //                     "last_price":"0.036037",
        //                     "quote_volume_24h":"4380.6660000000",
        //                     "base_volume_24h":"159.3582006712",
        //                     "high_24h":"0.036972",
        //                     "low_24h":"0.035524",
        //                     "open_24h":"0.036561",
        //                     "close_24h":"0.036037",
        //                     "best_ask":"0.036077",
        //                     "best_ask_size":"9.9500",
        //                     "best_bid":"0.035983",
        //                     "best_bid_size":"4.2792",
        //                     "fluctuation":"-0.0143",
        //                     "url":"https://www.bitmart.com/trade?symbol=ETH_BTC"
        //                 }
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"d09b57c4-d99b-4a13-91a8-2df98f889909",
        //         "data":{
        //             "tickers":[
        //                 {
        //                     "last_price":"422.2",
        //                     "open":"430.5",
        //                     "close":"422.2",
        //                     "low":"421.9",
        //                     "high":"436.9",
        //                     "avg_price":"430.8569900089815372072",
        //                     "volume":"2720",
        //                     "total_volume":"18912248",
        //                     "timestamp":1597631495,
        //                     "rise_fall_rate":"-0.0192799070847851336",
        //                     "rise_fall_value":"-8.3",
        //                     "contract_id":2,
        //                     "position_size":"3067404",
        //                     "volume_day":"9557384",
        //                     "amount24":"80995537.0919999999999974153",
        //                     "base_coin_volume":"189122.48",
        //                     "quote_coin_volume":"81484742.475833810590837937856",
        //                     "pps":"1274350547",
        //                     "index_price":"422.135",
        //                     "fair_price":"422.147253318507",
        //                     "depth_price":{"bid_price":"421.9","ask_price":"422","mid_price":"421.95"},
        //                     "fair_basis":"0.000029027013",
        //                     "fair_value":"0.012253318507",
        //                     "rate":{"quote_rate":"0.0006","base_rate":"0.0003","interest_rate":"0.000099999999"},
        //                     "premium_index":"0.000045851604",
        //                     "funding_rate":"0.000158",
        //                     "next_funding_rate":"0.000099999999",
        //                     "next_funding_at":"2020-08-17T04:00:00Z"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'tickers', []);
        const tickersById = this.indexBy (tickers, 'symbol');
        const ticker = this.safeValue (tickersById, market['id']);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        let method = undefined;
        if ((type === 'swap') || (type === 'future')) {
            method = 'publicContractGetTickers';
        } else if (type === 'spot') {
            method = 'publicSpotGetTicker';
        }
        const response = await this[method] (params);
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'tickers', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicAccountGetCurrencies (params);
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"8c768b3c-025f-413f-bec5-6d6411d46883",
        //         "data":{
        //             "currencies":[
        //                 {"currency":"MATIC","name":"Matic Network","withdraw_enabled":true,"deposit_enabled":true},
        //                 {"currency":"KTN","name":"Kasoutuuka News","withdraw_enabled":true,"deposit_enabled":false},
        //                 {"currency":"BRT","name":"Berith","withdraw_enabled":true,"deposit_enabled":true},
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const currencies = this.safeValue (data, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const withdrawEnabled = this.safeValue (currency, 'withdraw_enabled');
            const depositEnabled = this.safeValue (currency, 'deposit_enabled');
            const active = withdrawEnabled && depositEnabled;
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'info': currency, // the original payload
                'active': active,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = undefined;
        if (market['spot']) {
            method = 'publicSpotGetSymbolsBook';
            request['symbol'] = market['id'];
            // request['precision'] = 4; // optional price precision / depth level whose range is defined in symbol details
        } else if (market['swap'] || market['future']) {
            method = 'publicContractGetDepth';
            request['contractID'] = market['id'];
            if (limit !== undefined) {
                request['count'] = limit; // returns all records if size is omitted
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"8254f8fc-431d-404f-ad9a-e716339f66c7",
        //         "data":{
        //             "buys":[
        //                 {"amount":"4.7091","total":"4.71","price":"0.034047","count":"1"},
        //                 {"amount":"5.7439","total":"10.45","price":"0.034039","count":"1"},
        //                 {"amount":"2.5249","total":"12.98","price":"0.032937","count":"1"},
        //             ],
        //             "sells":[
        //                 {"amount":"41.4365","total":"41.44","price":"0.034174","count":"1"},
        //                 {"amount":"4.2317","total":"45.67","price":"0.034183","count":"1"},
        //                 {"amount":"0.3000","total":"45.97","price":"0.034240","count":"1"},
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"c330dfca-ca5b-4f15-b350-9fef3f049b4f",
        //         "data":{
        //             "sells":[
        //                 {"price":"347.6","vol":"6678"},
        //                 {"price":"347.7","vol":"3452"},
        //                 {"price":"347.8","vol":"6331"},
        //             ],
        //             "buys":[
        //                 {"price":"347.5","vol":"6222"},
        //                 {"price":"347.4","vol":"20979"},
        //                 {"price":"347.3","vol":"15179"},
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        if (market['spot']) {
            return this.parseOrderBook (data, undefined, 'buys', 'sells', 'price', 'amount');
        } else if (market['swap'] || market['future']) {
            return this.parseOrderBook (data, undefined, 'buys', 'sells', 'price', 'vol');
        }
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades spot
        //
        //     {
        //         "amount":"0.005703",
        //         "order_time":1599652045394,
        //         "price":"0.034029",
        //         "count":"0.1676",
        //         "type":"sell"
        //     }
        //
        // public fetchTrades contract, private fetchMyTrades contract
        //
        //     {
        //         "order_id":109159616160,
        //         "trade_id":109159616197,
        //         "contract_id":2,
        //         "deal_price":"347.6",
        //         "deal_vol":"5623",
        //         "make_fee":"-5.8636644",
        //         "take_fee":"9.772774",
        //         "created_at":"2020-09-09T11:49:50.749170536Z",
        //         "way":1,
        //         "fluctuation":"0"
        //     }
        //
        // private fetchMyTrades spot
        //
        //     {
        //         "detail_id":256348632,
        //         "order_id":2147484350,
        //         "symbol":"BTC_USDT",
        //         "create_time":1590462303000,
        //         "side":"buy",
        //         "fees":"0.00001350",
        //         "fee_coin_name":"BTC",
        //         "notional":"88.00000000",
        //         "price_avg":"8800.00",
        //         "size":"0.01000",
        //         "exec_type":"M"
        //     }
        //
        const id = this.safeString2 (trade, 'trade_id', 'detail_id');
        let timestamp = this.safeInteger2 (trade, 'order_time', 'create_time');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        }
        const type = undefined;
        const way = this.safeInteger (trade, 'way');
        let side = this.safeStringLower2 (trade, 'type', 'side');
        if ((side === undefined) && (way !== undefined)) {
            if (way < 5) {
                side = 'buy';
            } else {
                side = 'sell';
            }
        }
        let takerOrMaker = undefined;
        const execType = this.safeString (trade, 'exec_type');
        if (execType !== undefined) {
            takerOrMaker = (execType === 'M') ? 'maker' : 'taker';
        }
        let price = this.safeFloat2 (trade, 'price', 'deal_price');
        price = this.safeFloat (trade, 'price_avg', price);
        let amount = this.safeFloat2 (trade, 'amount', 'deal_vol');
        amount = this.safeFloat (trade, 'size', amount);
        let cost = this.safeFloat2 (trade, 'count', 'notional');
        if ((cost === undefined) && (price !== undefined) && (amount !== undefined)) {
            cost = amount * price;
        }
        const orderId = this.safeInteger (trade, 'order_id');
        const marketId = this.safeString2 (trade, 'contract_id', 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const feeCost = this.safeFloat (trade, 'fees');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_coin_name');
            let feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            if ((feeCurrencyCode === undefined) && (market !== undefined)) {
                feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            request['symbol'] = market['id'];
            method = 'publicSpotGetSymbolsTrades';
        } else if (market['swap'] || market['future']) {
            method = 'publicContractGetTrades';
            request['contractID'] = market['id'];
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"222d74c0-8f6d-49d9-8e1b-98118c50eeba",
        //         "data":{
        //             "trades":[
        //                 {
        //                     "amount":"0.005703",
        //                     "order_time":1599652045394,
        //                     "price":"0.034029",
        //                     "count":"0.1676",
        //                     "type":"sell"
        //                 },
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"782bc746-b86e-43bf-8d1a-c68b479c9bdd",
        //         "data":{
        //             "trades":[
        //                 {
        //                     "order_id":109159616160,
        //                     "trade_id":109159616197,
        //                     "contract_id":2,
        //                     "deal_price":"347.6",
        //                     "deal_vol":"5623",
        //                     "make_fee":"-5.8636644",
        //                     "take_fee":"9.772774",
        //                     "created_at":"2020-09-09T11:49:50.749170536Z",
        //                     "way":1,
        //                     "fluctuation":"0"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // spot
        //
        //     {
        //         "last_price":"0.034987",
        //         "timestamp":1598787420,
        //         "volume":"1.0198",
        //         "open":"0.035007",
        //         "close":"0.034987",
        //         "high":"0.035007",
        //         "low":"0.034986"
        //     }
        //
        // contract
        //
        //     {
        //         "low":"404.4",
        //         "high":"404.4",
        //         "open":"404.4",
        //         "close":"404.4",
        //         "last_price":"404.4",
        //         "avg_price":"404.4",
        //         "volume":"7670",
        //         "timestamp":1598758441,
        //         "rise_fall_rate":"0",
        //         "rise_fall_value":"0",
        //         "base_coin_volume":"76.7",
        //         "quote_coin_volume":"31017.48"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const type = market['type'];
        let method = undefined;
        const request = {};
        const duration = this.parseTimeframe (timeframe);
        if (type === 'spot') {
            method = 'publicSpotGetSymbolsKline';
            request['symbol'] = market['id'];
            request['step'] = this.timeframes[timeframe];
            // the exchange will return an empty array if more than 500 candles is requested
            const maxLimit = 500;
            if (limit === undefined) {
                limit = maxLimit;
            }
            limit = Math.min (maxLimit, limit);
            if (since === undefined) {
                const end = parseInt (this.milliseconds () / 1000);
                const start = end - limit * duration;
                request['from'] = start;
                request['to'] = end;
            } else {
                const start = parseInt (since / 1000);
                const end = this.sum (start, limit * duration);
                request['from'] = start;
                request['to'] = end;
            }
        } else if ((type === 'swap') || (type === 'future')) {
            method = 'publicContractGetQuote';
            request['contractID'] = market['id'];
            const defaultLimit = 500;
            if (limit === undefined) {
                limit = defaultLimit;
            }
            if (since === undefined) {
                const end = parseInt (this.milliseconds () / 1000);
                const start = end - limit * duration;
                request['startTime'] = start;
                request['endTime'] = end;
            } else {
                const start = parseInt (since / 1000);
                const end = this.sum (start, limit * duration);
                request['startTime'] = start;
                request['endTime'] = end;
            }
            request['unit'] = this.timeframes[timeframe];
            request['resolution'] = 'M';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"80d86378-ab4e-4c70-819e-b42146cf87ad",
        //         "data":{
        //             "klines":[
        //                 {"last_price":"0.034987","timestamp":1598787420,"volume":"1.0198","open":"0.035007","close":"0.034987","high":"0.035007","low":"0.034986"},
        //                 {"last_price":"0.034986","timestamp":1598787480,"volume":"0.3959","open":"0.034982","close":"0.034986","high":"0.034986","low":"0.034980"},
        //                 {"last_price":"0.034978","timestamp":1598787540,"volume":"0.3259","open":"0.034987","close":"0.034978","high":"0.034987","low":"0.034977"},
        //             ]
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"32965074-5804-4655-b693-e953e36026a0",
        //         "data":[
        //             {"low":"404.4","high":"404.4","open":"404.4","close":"404.4","last_price":"404.4","avg_price":"404.4","volume":"7670","timestamp":1598758441,"rise_fall_rate":"0","rise_fall_value":"0","base_coin_volume":"76.7","quote_coin_volume":"31017.48"},
        //             {"low":"404.1","high":"404.4","open":"404.4","close":"404.1","last_price":"404.1","avg_price":"404.15881086","volume":"12076","timestamp":1598758501,"rise_fall_rate":"-0.000741839762611276","rise_fall_value":"-0.3","base_coin_volume":"120.76","quote_coin_volume":"48806.2179994536"},
        //             {"low":"404","high":"404.3","open":"404.1","close":"404","last_price":"404","avg_price":"404.08918918","volume":"740","timestamp":1598758561,"rise_fall_rate":"-0.000247463499133878","rise_fall_value":"-0.1","base_coin_volume":"7.4","quote_coin_volume":"2990.259999932"},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        if (Array.isArray (data)) {
            return this.parseOHLCVs (data, market, timeframe, since, limit);
        } else {
            const klines = this.safeValue (data, 'klines', []);
            return this.parseOHLCVs (klines, market, timeframe, since, limit);
        }
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        const request = {};
        if (market['spot']) {
            request['symbol'] = market['id'];
            request['offset'] = 1; // max offset * limit < 500
            if (limit === undefined) {
                limit = 100; // max 100
            }
            request['limit'] = limit;
            method = 'privateSpotGetTrades';
        } else if (market['swap'] || market['future']) {
            request['contractID'] = market['id'];
            // request['offset'] = 1;
            if (limit !== undefined) {
                request['size'] = limit; // max 60
            }
            method = 'privateContractGetUserTrades';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"a06a5c53-8e6f-42d6-8082-2ff4718d221c",
        //         "data":{
        //             "current_page":1,
        //             "trades":[
        //                 {
        //                     "detail_id":256348632,
        //                     "order_id":2147484350,
        //                     "symbol":"BTC_USDT",
        //                     "create_time":1590462303000,
        //                     "side":"buy",
        //                     "fees":"0.00001350",
        //                     "fee_coin_name":"BTC",
        //                     "notional":"88.00000000",
        //                     "price_avg":"8800.00",
        //                     "size":"0.01000",
        //                     "exec_type":"M"
        //                 },
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "trades": [
        //                 {
        //                     "order_id": 10116361,
        //                     "trade_id": 10116363,
        //                     "contract_id": 1,
        //                     "deal_price": "16",
        //                     "deal_vol": "10",
        //                     "make_fee": "0.04",
        //                     "take_fee": "0.12",
        //                     "created_at": null,
        //                     "way": 5,
        //                     "fluctuation": "0"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        const request = {};
        if (market['spot']) {
            request['symbol'] = market['id'];
            request['order_id'] = id;
            method = 'privateSpotGetTrades';
        } else if (market['swap'] || market['future']) {
            request['contractID'] = market['id'];
            request['orderID'] = id;
            method = 'privateContractGetOrderTrades';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"a06a5c53-8e6f-42d6-8082-2ff4718d221c",
        //         "data":{
        //             "current_page":1,
        //             "trades":[
        //                 {
        //                     "detail_id":256348632,
        //                     "order_id":2147484350,
        //                     "symbol":"BTC_USDT",
        //                     "create_time":1590462303000,
        //                     "side":"buy",
        //                     "fees":"0.00001350",
        //                     "fee_coin_name":"BTC",
        //                     "notional":"88.00000000",
        //                     "price_avg":"8800.00",
        //                     "size":"0.01000",
        //                     "exec_type":"M"
        //                 },
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "trades": [
        //                 {
        //                     "order_id": 10116361,
        //                     "trade_id": 10116363,
        //                     "contract_id": 1,
        //                     "deal_price": "16",
        //                     "deal_vol": "10",
        //                     "make_fee": "0.04",
        //                     "take_fee": "0.12",
        //                     "created_at": null,
        //                     "way": 5,
        //                     "fluctuation": "0"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let method = undefined;
        const options = this.safeValue (this.options, 'fetchBalance', {});
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        params = this.omit (params, 'type');
        if (type === 'spot') {
            method = 'privateSpotGetWallet';
        } else if (type === 'account') {
            method = 'privateAccountGetWallet';
        } else if ((type === 'swap') || (type === 'future') || (type === 'contract')) {
            method = 'privateContractGetAccounts';
        }
        const response = await this[method] (params);
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"39069916-72f9-44c7-acde-2ad5afd21cad",
        //         "data":{
        //             "wallet":[
        //                 {"id":"BTC","name":"Bitcoin","available":"0.00000062","frozen":"0.00000000"},
        //                 {"id":"ETH","name":"Ethereum","available":"0.00002277","frozen":"0.00000000"},
        //                 {"id":"BMX","name":"BitMart Token","available":"0.00000000","frozen":"0.00000000"}
        //             ]
        //         }
        //     }
        //
        // account
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"5c3b7fc7-93b2-49ef-bb59-7fdc56915b59",
        //         "data":{
        //             "wallet":[
        //                 {"currency":"BTC","name":"Bitcoin","available":"0.00000062","frozen":"0.00000000"},
        //                 {"currency":"ETH","name":"Ethereum","available":"0.00002277","frozen":"0.00000000"}
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "accounts": [
        //                 {
        //                     "account_id": 10,
        //                     "coin_code": "USDT",
        //                     "freeze_vol": "1201.8",
        //                     "available_vol": "8397.65",
        //                     "cash_vol": "0",
        //                     "realised_vol": "-0.5",
        //                     "unrealised_vol": "-0.5",
        //                     "earnings_vol": "-0.5",
        //                     "created_at": "2018-07-13T16:48:49+08:00",
        //                     "updated_at": "2018-07-13T18:34:45.900387+08:00"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const wallet = this.safeValue2 (data, 'wallet', 'accounts', []);
        const result = { 'info': response };
        for (let i = 0; i < wallet.length; i++) {
            const balance = wallet[i];
            let currencyId = this.safeString2 (balance, 'id', 'currency');
            currencyId = this.safeString (balance, 'coind_code', currencyId);
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat2 (balance, 'available', 'available_vol');
            account['used'] = this.safeFloat2 (balance, 'frozen', 'freeze_vol');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "order_id": 2707217580
        //     }
        //
        // cancelOrder
        //
        //     '2707217580' // order id
        //
        // spot fetchOrder, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "order_id":1736871726781,
        //         "symbol":"BTC_USDT",
        //         "create_time":1591096004000,
        //         "side":"sell",
        //         "type":"market",
        //         "price":"0.00",
        //         "price_avg":"0.00",
        //         "size":"0.02000",
        //         "notional":"0.00000000",
        //         "filled_notional":"0.00000000",
        //         "filled_size":"0.00000",
        //         "status":"8"
        //     }
        //
        // contract fetchOrder, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders, fetchOrders
        //
        //     {
        //         "order_id": 10539098,
        //         "contract_id": 1,
        //         "position_id": 10539088,
        //         "account_id": 10,
        //         "price": "16",
        //         "vol": "1",
        //         "done_avg_price": "16",
        //         "done_vol": "1",
        //         "way": 3,
        //         "category": 1,
        //         "open_type": 2,
        //         "make_fee": "0.00025",
        //         "take_fee": "0.012",
        //         "origin": "",
        //         "created_at": "2018-07-23T11:55:56.715305Z",
        //         "finished_at": "2018-07-23T11:55:56.763941Z",
        //         "status": 4,
        //         "errno": 0
        //     }
        //
        let id = undefined;
        if (typeof order === 'string') {
            id = order;
            order = {};
        }
        id = this.safeString (order, 'order_id', id);
        let timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        timestamp = this.safeInteger (order, 'create_time', timestamp);
        const marketId = this.safeString2 (order, 'symbol', 'contract_id');
        const symbol = this.safeSymbol (marketId, market, '_');
        let status = undefined;
        if (market !== undefined) {
            status = this.parseOrderStatusByType (market['type'], this.safeString (order, 'status'));
        }
        let price = this.safeFloat (order, 'price');
        let average = this.safeFloat2 (order, 'price_avg', 'done_avg_price');
        const amount = this.safeFloat2 (order, 'size', 'vol');
        let cost = undefined;
        let filled = this.safeFloat2 (order, 'filled_size', 'done_vol');
        let remaining = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                if (filled === undefined) {
                    filled = Math.max (0, amount - remaining);
                }
            }
            if (filled !== undefined) {
                if (remaining === undefined) {
                    remaining = Math.max (0, amount - filled);
                }
                if (cost === undefined) {
                    if (average !== undefined) {
                        cost = average * filled;
                    }
                }
            }
        }
        let side = this.safeString (order, 'side');
        // 1 = Open long
        // 2 = Close short
        // 3 = Close long
        // 4 = Open short
        side = this.safeString (order, 'way', side);
        const category = this.safeInteger (order, 'category');
        let type = this.safeString (order, 'type');
        if (category === 1) {
            type = 'limit';
        } else if (category === 2) {
            type = 'market';
        }
        if (type === 'market') {
            if (price === 0.0) {
                price = undefined;
            }
            if (average === 0.0) {
                average = undefined;
            }
        }
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    parseOrderStatusByType (type, status) {
        const statusesByType = {
            'spot': {
                '1': 'failed', // Order failure
                '2': 'open', // Placing order
                '3': 'failed', // Order failure, Freeze failure
                '4': 'open', // Order success, Pending for fulfilment
                '5': 'open', // Partially filled
                '6': 'closed', // Fully filled
                '7': 'canceling', // Canceling
                '8': 'canceled', // Canceled
            },
            'swap': {
                '1': 'open', // Submitting
                '2': 'open', // Commissioned
                '4': 'closed', // Completed
            },
        };
        const statuses = this.safeValue (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = undefined;
        if (market['spot']) {
            request['symbol'] = market['id'];
            request['side'] = side;
            request['type'] = type;
            method = 'privateSpotPostSubmitOrder';
            if (type === 'limit') {
                request['size'] = this.amountToPrecision (symbol, amount);
                request['price'] = this.priceToPrecision (symbol, price);
            } else if (type === 'market') {
                // for market buy it requires the amount of quote currency to spend
                if (side === 'buy') {
                    let notional = this.safeFloat (params, 'notional');
                    const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price !== undefined) {
                            if (notional === undefined) {
                                notional = amount * price;
                            }
                        } else if (notional === undefined) {
                            throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'notional' extra parameter (the exchange-specific behaviour)");
                        }
                    } else {
                        notional = (notional === undefined) ? amount : notional;
                    }
                    const precision = market['precision']['price'];
                    request['notional'] = this.decimalToPrecision (notional, TRUNCATE, precision, this.precisionMode);
                } else if (side === 'sell') {
                    request['size'] = this.amountToPrecision (symbol, amount);
                }
            }
        } else if (market['swap'] || market['future']) {
            method = 'privateContractPostSubmitOrder';
            request['contractID'] = market['id'];
            if (type === 'limit') {
                request['category'] = 1;
            } else if (type === 'market') {
                request['category'] = 2;
            }
            request['way'] = side; // 1 = open long, 2 = close short, 3 = close long, 4 = open short
            request['custom_id'] = this.nonce ();
            request['open_type'] = 1; // 1 = cross margin, 2 = fixed margin
            request['leverage'] = 1; // must meet the effective range of leverage configured in the contract
            request['price'] = this.priceToPrecision (symbol, price);
            request['vol'] = this.amountToPrecision (symbol, amount);
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot and contract
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "order_id": 2707217580
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = undefined;
        if (market['spot']) {
            method = 'privateSpotPostCancelOrder';
            request['order_id'] = parseInt (id);
            request['symbol'] = market['id'];
        } else if (market['swap'] || market['future']) {
            method = 'privateContractPostCancelOrders';
            request['contractID'] = market['id'];
            request['orders'] = [ parseInt (id) ];
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "result": true
        //         }
        //     }
        //
        // spot alternative
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": true
        //     }
        //
        // contract
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "succeed": [
        //                 2707219612
        //             ],
        //             "failed": []
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        if (data === true) {
            return this.parseOrder (id, market);
        }
        const succeeded = this.safeValue (data, 'succeed');
        if (succeeded !== undefined) {
            id = this.safeString (succeeded, 0);
            if (id === undefined) {
                throw new InvalidOrder (this.id + ' cancelOrder() failed to cancel ' + symbol + ' order id ' + id);
            }
        } else {
            const result = this.safeValue (data, 'result');
            if (!result) {
                throw new InvalidOrder (this.id + ' cancelOrder() ' + symbol + ' order id ' + id + ' is filled or canceled');
            }
        }
        const order = this.parseOrder (id, market);
        return this.extend (order, { 'id': id });
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + " cancelAllOrders() requires a `side` parameter ('buy' or 'sell')");
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' cancelAllOrders() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'symbol': market['id'],
            'side': side, // 'buy' or 'sell'
        };
        const response = await this.privateSpotPostCancelOrders (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {}
        //     }
        //
        return response;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' canelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' cancelOrders() does not support ' + market['type'] + ' orders, only contract orders are accepted');
        }
        const orders = [];
        for (let i = 0; i < ids.length; i++) {
            orders.push (parseInt (ids[i]));
        }
        const request = {
            'orders': orders,
        };
        const response = await this.privateContractPostCancelOrders (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "result": true
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "succeed": [
        //                 2707219612
        //             ],
        //             "failed": []
        //         }
        //     }
        //
        return response;
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByStatus() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = undefined;
        if (market['spot']) {
            method = 'privateSpotGetOrders';
            request['symbol'] = market['id'];
            request['offset'] = 1; // max offset * limit < 500
            request['limit'] = 100; // max limit is 100
            //  1 = Order failure
            //  2 = Placing order
            //  3 = Order failure, Freeze failure
            //  4 = Order success, Pending for fulfilment
            //  5 = Partially filled
            //  6 = Fully filled
            //  7 = Canceling
            //  8 = Canceled
            //  9 = Outstanding (4 and 5)
            // 10 = 6 and 8
            if (status === 'open') {
                request['status'] = 9;
            } else if (status === 'closed') {
                request['status'] = 6;
            } else {
                request['status'] = status;
            }
        } else if (market['swap'] || market['future']) {
            method = 'privateContractGetUserOrders';
            request['contractID'] = market['id'];
            // request['offset'] = 1;
            if (limit !== undefined) {
                request['size'] = limit; // max 60
            }
            // 0 = All
            // 1 = Submitting
            // 2 = Commissioned
            // 3 = 1 and 2
            // 4 = Completed
            if (status === 'open') {
                request['status'] = 3;
            } else if (status === 'closed') {
                request['status'] = 4;
            } else {
                request['status'] = status;
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"70e7d427-7436-4fb8-8cdd-97e1f5eadbe9",
        //         "data":{
        //             "current_page":1,
        //             "orders":[
        //                 {
        //                     "order_id":2147601241,
        //                     "symbol":"BTC_USDT",
        //                     "create_time":1591099963000,
        //                     "side":"sell",
        //                     "type":"limit",
        //                     "price":"9000.00",
        //                     "price_avg":"0.00",
        //                     "size":"1.00000",
        //                     "notional":"9000.00000000",
        //                     "filled_notional":"0.00000000",
        //                     "filled_size":"0.00000",
        //                     "status":"4"
        //                 }
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "orders": [
        //                 {
        //                     "order_id": 10284160,
        //                     "contract_id": 1,
        //                     "price": "8",
        //                     "vol": "4",
        //                     "done_avg_price": "0",
        //                     "done_vol": "0",
        //                     "way": 1,
        //                     "category": 1,
        //                     "open_type": 2,
        //                     "make_fee": "0",
        //                     "take_fee": "0",
        //                     "origin": "",
        //                     "created_at": "2018-07-17T07:24:13.410507Z",
        //                     "finished_at": null,
        //                     "status": 2,
        //                     "errno": 0
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!(market['swap'] || market['future'])) {
            throw new NotSupported (this.id + ' fetchOrders does not support ' + market['type'] + ' markets, only contracts are supported');
        }
        return await this.fetchOrdersByStatus (0, symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {};
        const market = this.market (symbol);
        let method = undefined;
        if (typeof id !== 'string') {
            id = id.toString ();
        }
        if (market['spot']) {
            request['symbol'] = market['id'];
            request['order_id'] = id;
            method = 'privateSpotGetOrderDetail';
        } else if (market['swap'] || market['future']) {
            request['contractID'] = market['id'];
            request['orderID'] = id;
            method = 'privateContractGetUserOrderInfo';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"a27c2cb5-ead4-471d-8455-1cfeda054ea6",
        //         "data": {
        //             "order_id":1736871726781,
        //             "symbol":"BTC_USDT",
        //             "create_time":1591096004000,
        //             "side":"sell",
        //             "type":"market",
        //             "price":"0.00",
        //             "price_avg":"0.00",
        //             "size":"0.02000",
        //             "notional":"0.00000000",
        //             "filled_notional":"0.00000000",
        //             "filled_size":"0.00000",
        //             "status":"8"
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "orders": [
        //                 {
        //                     "order_id": 10539098,
        //                     "contract_id": 1,
        //                     "position_id": 10539088,
        //                     "account_id": 10,
        //                     "price": "16",
        //                     "vol": "1",
        //                     "done_avg_price": "16",
        //                     "done_vol": "1",
        //                     "way": 3,
        //                     "category": 1,
        //                     "make_fee": "0.00025",
        //                     "take_fee": "0.012",
        //                     "origin": "",
        //                     "created_at": "2018-07-23T11:55:56.715305Z",
        //                     "finished_at": "2018-07-23T11:55:56.763941Z",
        //                     "status": 4,
        //                     "errno": 0
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        if ('orders' in data) {
            const orders = this.safeValue (data, 'orders', []);
            const firstOrder = this.safeValue (orders, 0);
            if (firstOrder === undefined) {
                throw new OrderNotFound (this.id + ' fetchOrder() could not find ' + symbol + ' order id ' + id);
            }
            return this.parseOrder (firstOrder, market);
        } else {
            return this.parseOrder (data, market);
        }
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateAccountGetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"0e6edd79-f77f-4251-abe5-83ba75d06c1a",
        //         "data":{
        //             "currency":"USDT-TRC20",
        //             "chain":"USDT-TRC20",
        //             "address":"TGR3ghy2b5VLbyAYrmiE15jasR6aPHTvC5",
        //             "address_memo":""
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'address');
        const tag = this.safeString (data, 'address_memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'destination': 'To Digital Address', // To Digital Address, To Binance, To OKEX
            'address': address,
        };
        if (tag !== undefined) {
            request['address_memo'] = tag;
        }
        const response = await this.privateAccountPostWithdrawApply (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "withdraw_id": "121212"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const transaction = this.parseTransaction (data, currency);
        return this.extend (transaction, {
            'code': code,
            'address': address,
            'tag': tag,
        });
    }

    async fetchTransactionsByType (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 50; // max 50
        }
        const request = {
            'operation_type': type, // deposit or withdraw
            'offset': 1,
            'limit': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currenc (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateAccountGetDepositWithdrawHistory (this.extend (request, params));
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"142bf92a-fc50-4689-92b6-590886f90b97",
        //         "data":{
        //             "records":[
        //                 {
        //                     "withdraw_id":"1679952",
        //                     "deposit_id":"",
        //                     "operation_type":"withdraw",
        //                     "currency":"BMX",
        //                     "apply_time":1588867374000,
        //                     "arrival_amount":"59.000000000000",
        //                     "fee":"1.000000000000",
        //                     "status":0,
        //                     "address":"0xe57b69a8776b37860407965B73cdFFBDFe668Bb5",
        //                     "address_memo":"",
        //                     "tx_id":""
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const records = this.safeValue (data, 'records', []);
        return this.parseTransactions (records, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposit', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdraw', code, since, limit, params);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '0': 'pending', // Create
            '1': 'pending', // Submitted, waiting for withdrawal
            '2': 'pending', // Processing
            '3': 'ok', // Success
            '4': 'canceled', // Cancel
            '5': 'failed', // Fail
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "withdraw_id": "121212"
        //     }
        //
        // fetchDeposits, fetchWithdrawals
        //
        //     {
        //         "withdraw_id":"1679952",
        //         "deposit_id":"",
        //         "operation_type":"withdraw",
        //         "currency":"BMX",
        //         "apply_time":1588867374000,
        //         "arrival_amount":"59.000000000000",
        //         "fee":"1.000000000000",
        //         "status":0,
        //         "address":"0xe57b69a8776b37860407965B73cdFFBDFe668Bb5",
        //         "address_memo":"",
        //         "tx_id":""
        //     }
        //
        let id = undefined;
        const withdrawId = this.safeString (transaction, 'withdraw_id');
        const depositId = this.safeString (transaction, 'deposit_id');
        let type = undefined;
        if ((withdrawId !== undefined) && (withdrawId !== '')) {
            type = 'withdraw';
            id = withdrawId;
        } else if ((depositId !== undefined) && (depositId !== '')) {
            type = 'deposit';
            id = depositId;
        }
        const amount = this.safeFloat (transaction, 'arrival_amount');
        const timestamp = this.safeInteger (transaction, 'tapply_timeime');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeFloat (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        let txid = this.safeString (transaction, 'tx_id');
        if (txid === '') {
            txid = undefined;
        }
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'address_memo');
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const baseUrl = this.implodeParams (this.urls['api'], { 'hostname': this.hostname });
        const access = this.safeString (api, 0);
        const type = this.safeString (api, 1);
        let url = baseUrl + '/' + type;
        if (type !== 'system') {
            url += '/' + this.version;
        }
        if (type === 'contract') {
            url += '/' + 'ifcontract';
        }
        url += '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (type === 'system') {
            if (Object.keys (query).length) {
                // console.log (query);
                url += '?' + this.urlencode (query);
            }
        } else if (access === 'public') {
            if (Object.keys (query).length) {
                // console.log (query);
                url += '?' + this.urlencode (query);
            }
        } else if (access === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let queryString = '';
            headers = {
                'X-BM-KEY': this.apiKey,
                'X-BM-TIMESTAMP': timestamp,
            };
            if ((method === 'POST') || (method === 'PUT')) {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
                queryString = body;
            } else {
                if (Object.keys (query).length) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
            }
            const auth = timestamp + '#' + this.uid + '#' + queryString;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            headers['X-BM-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        // spot
        //
        //     {"message":"Bad Request [to is empty]","code":50000,"trace":"f9d46e1b-4edb-4d07-a06e-4895fb2fc8fc","data":{}}
        //     {"message":"Bad Request [from is empty]","code":50000,"trace":"579986f7-c93a-4559-926b-06ba9fa79d76","data":{}}
        //     {"message":"Kline size over 500","code":50004,"trace":"d625caa8-e8ca-4bd2-b77c-958776965819","data":{}}
        //     {"message":"Balance not enough","code":50020,"trace":"7c709d6a-3292-462c-98c5-32362540aeef","data":{}}
        //
        // contract
        //
        //     {"errno":"OK","message":"INVALID_PARAMETER","code":49998,"trace":"eb5ebb54-23cd-4de2-9064-e090b6c3b2e3","data":null}
        //
        const message = this.safeString (response, 'message');
        const errorCode = this.safeString (response, 'code');
        if (((errorCode !== undefined) && (errorCode !== '1000')) || ((message !== undefined) && (message !== 'OK'))) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorCode, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
