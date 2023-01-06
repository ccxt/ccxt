'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, InsufficientFunds, InvalidOrder, BadSymbol, PermissionDenied, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class ascendex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ascendex',
            'name': 'AscendEX',
            'countries': [ 'SG' ], // Singapore
            // 8 requests per minute = 0.13333 per second => rateLimit = 750
            // testing 400 works
            'rateLimit': 400,
            'certified': false,
            'pro': true,
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': 'emulated',
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1d',
                '1w': '1w',
                '1M': '1m',
            },
            'version': 'v2',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/112027508-47984600-8b48-11eb-9e17-d26459cc36c6.jpg',
                'api': {
                    'rest': 'https://ascendex.com',
                },
                'test': {
                    'rest': 'https://api-test.ascendex-sandbox.com',
                },
                'www': 'https://ascendex.com',
                'doc': [
                    'https://ascendex.github.io/ascendex-pro-api/#ascendex-pro-api-documentation',
                ],
                'fees': 'https://ascendex.com/en/feerate/transactionfee-traderate',
                'referral': {
                    'url': 'https://ascendex.com/en-us/register?inviteCode=EL6BXBQM',
                    'discount': 0.25,
                },
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'assets': 1,
                            'products': 1,
                            'ticker': 1,
                            'barhist/info': 1,
                            'barhist': 1,
                            'depth': 1,
                            'trades': 1,
                            'cash/assets': 1, // not documented
                            'cash/products': 1, // not documented
                            'margin/assets': 1, // not documented
                            'margin/products': 1, // not documented
                            'futures/collateral': 1,
                            'futures/contracts': 1,
                            'futures/ref-px': 1,
                            'futures/market-data': 1,
                            'futures/funding-rates': 1,
                            'risk-limit-info': 1,
                            'exchange-info': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'info': 1,
                            'wallet/transactions': 1,
                            'wallet/deposit/address': 1, // not documented
                            'data/balance/snapshot': 1,
                            'data/balance/history': 1,
                        },
                        'accountCategory': {
                            'get': {
                                'balance': 1,
                                'order/open': 1,
                                'order/status': 1,
                                'order/hist/current': 1,
                                'risk': 1,
                            },
                            'post': {
                                'order': 1,
                                'order/batch': 1,
                            },
                            'delete': {
                                'order': 1,
                                'order/all': 1,
                                'order/batch': 1,
                            },
                        },
                        'accountGroup': {
                            'get': {
                                'cash/balance': 1,
                                'margin/balance': 1,
                                'margin/risk': 1,
                                'futures/collateral-balance': 1,
                                'futures/position': 1,
                                'futures/risk': 1,
                                'futures/funding-payments': 1,
                                'order/hist': 1,
                                'spot/fee': 1,
                            },
                            'post': {
                                'transfer': 1,
                                'futures/transfer/deposit': 1,
                                'futures/transfer/withdraw': 1,
                            },
                        },
                    },
                },
                'v2': {
                    'public': {
                        'get': {
                            'assets': 1,
                            'futures/contract': 1,
                            'futures/collateral': 1,
                            'futures/pricing-data': 1,
                            'futures/ticker': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'account/info': 1,
                        },
                        'accountGroup': {
                            'get': {
                                'order/hist': 1,
                                'futures/position': 1,
                                'futures/free-margin': 1,
                                'futures/order/hist/current': 1,
                                'futures/order/open': 1,
                                'futures/order/status': 1,
                            },
                            'post': {
                                'futures/isolated-position-margin': 1,
                                'futures/margin-type': 1,
                                'futures/leverage': 1,
                                'futures/transfer/deposit': 1,
                                'futures/transfer/withdraw': 1,
                                'futures/order': 1,
                                'futures/order/batch': 1,
                                'futures/order/open': 1,
                                'subuser/subuser-transfer': 1,
                                'subuser/subuser-transfer-hist': 1,
                            },
                            'delete': {
                                'futures/order': 1,
                                'futures/order/batch': 1,
                                'futures/order/all': 1,
                            },
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'account-category': 'cash', // 'cash', 'margin', 'futures' // obsolete
                'account-group': undefined,
                'fetchClosedOrders': {
                    'method': 'v1PrivateAccountGroupGetOrderHist', // 'v1PrivateAccountGroupGetAccountCategoryOrderHistCurrent'
                },
                'defaultType': 'spot', // 'spot', 'margin', 'swap'
                'accountsByType': {
                    'spot': 'cash',
                    'swap': 'futures',
                    'future': 'futures',
                    'margin': 'margin',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
            },
            'exceptions': {
                'exact': {
                    // not documented
                    '1900': BadRequest, // {"code":1900,"message":"Invalid Http Request Input"}
                    '2100': AuthenticationError, // {"code":2100,"message":"ApiKeyFailure"}
                    '5002': BadSymbol, // {"code":5002,"message":"Invalid Symbol"}
                    '6001': BadSymbol, // {"code":6001,"message":"Trading is disabled on symbol."}
                    '6010': InsufficientFunds, // {'code': 6010, 'message': 'Not enough balance.'}
                    '60060': InvalidOrder, // { 'code': 60060, 'message': 'The order is already filled or canceled.' }
                    '600503': InvalidOrder, // {"code":600503,"message":"Notional is too small."}
                    // documented
                    '100001': BadRequest, // INVALID_HTTP_INPUT Http request is invalid
                    '100002': BadRequest, // DATA_NOT_AVAILABLE Some required data is missing
                    '100003': BadRequest, // KEY_CONFLICT The same key exists already
                    '100004': BadRequest, // INVALID_REQUEST_DATA The HTTP request contains invalid field or argument
                    '100005': BadRequest, // INVALID_WS_REQUEST_DATA Websocket request contains invalid field or argument
                    '100006': BadRequest, // INVALID_ARGUMENT The arugment is invalid
                    '100007': BadRequest, // ENCRYPTION_ERROR Something wrong with data encryption
                    '100008': BadSymbol, // SYMBOL_ERROR Symbol does not exist or not valid for the request
                    '100009': AuthenticationError, // AUTHORIZATION_NEEDED Authorization is require for the API access or request
                    '100010': BadRequest, // INVALID_OPERATION The action is invalid or not allowed for the account
                    '100011': BadRequest, // INVALID_TIMESTAMP Not a valid timestamp
                    '100012': BadRequest, // INVALID_STR_FORMAT String format does not
                    '100013': BadRequest, // INVALID_NUM_FORMAT Invalid number input
                    '100101': ExchangeError, // UNKNOWN_ERROR Some unknown error
                    '150001': BadRequest, // INVALID_JSON_FORMAT Require a valid json object
                    '200001': AuthenticationError, // AUTHENTICATION_FAILED Authorization failed
                    '200002': ExchangeError, // TOO_MANY_ATTEMPTS Tried and failed too many times
                    '200003': ExchangeError, // ACCOUNT_NOT_FOUND Account not exist
                    '200004': ExchangeError, // ACCOUNT_NOT_SETUP Account not setup properly
                    '200005': ExchangeError, // ACCOUNT_ALREADY_EXIST Account already exist
                    '200006': ExchangeError, // ACCOUNT_ERROR Some error related with error
                    '200007': ExchangeError, // CODE_NOT_FOUND
                    '200008': ExchangeError, // CODE_EXPIRED Code expired
                    '200009': ExchangeError, // CODE_MISMATCH Code does not match
                    '200010': AuthenticationError, // PASSWORD_ERROR Wrong assword
                    '200011': ExchangeError, // CODE_GEN_FAILED Do not generate required code promptly
                    '200012': ExchangeError, // FAKE_COKE_VERIFY
                    '200013': ExchangeError, // SECURITY_ALERT Provide security alert message
                    '200014': PermissionDenied, // RESTRICTED_ACCOUNT Account is restricted for certain activity, such as trading, or withdraw.
                    '200015': PermissionDenied, // PERMISSION_DENIED No enough permission for the operation
                    '300001': InvalidOrder, // INVALID_PRICE Order price is invalid
                    '300002': InvalidOrder, // INVALID_QTY Order size is invalid
                    '300003': InvalidOrder, // INVALID_SIDE Order side is invalid
                    '300004': InvalidOrder, // INVALID_NOTIONAL Notional is too small or too large
                    '300005': InvalidOrder, // INVALID_TYPE Order typs is invalid
                    '300006': InvalidOrder, // INVALID_ORDER_ID Order id is invalid
                    '300007': InvalidOrder, // INVALID_TIME_IN_FORCE Time In Force in order request is invalid
                    '300008': InvalidOrder, // INVALID_ORDER_PARAMETER Some order parameter is invalid
                    '300009': InvalidOrder, // TRADING_VIOLATION Trading violation on account or asset
                    '300011': InsufficientFunds, // INVALID_BALANCE No enough account or asset balance for the trading
                    '300012': BadSymbol, // INVALID_PRODUCT Not a valid product supported by exchange
                    '300013': InvalidOrder, // INVALID_BATCH_ORDER Some or all orders are invalid in batch order request
                    '300014': InvalidOrder, // {"code":300014,"message":"Order price doesn't conform to the required tick size: 0.1","reason":"TICK_SIZE_VIOLATION"}
                    '300020': InvalidOrder, // TRADING_RESTRICTED There is some trading restriction on account or asset
                    '300021': InvalidOrder, // TRADING_DISABLED Trading is disabled on account or asset
                    '300031': InvalidOrder, // NO_MARKET_PRICE No market price for market type order trading
                    '310001': InsufficientFunds, // INVALID_MARGIN_BALANCE No enough margin balance
                    '310002': InvalidOrder, // INVALID_MARGIN_ACCOUNT Not a valid account for margin trading
                    '310003': InvalidOrder, // MARGIN_TOO_RISKY Leverage is too high
                    '310004': BadSymbol, // INVALID_MARGIN_ASSET This asset does not support margin trading
                    '310005': InvalidOrder, // INVALID_REFERENCE_PRICE There is no valid reference price
                    '510001': ExchangeError, // SERVER_ERROR Something wrong with server.
                    '900001': ExchangeError, // HUMAN_CHALLENGE Human change do not pass
                },
                'broad': {},
            },
            'commonCurrencies': {
                'BOND': 'BONDED',
                'BTCBEAR': 'BEAR',
                'BTCBULL': 'BULL',
                'BYN': 'BeyondFi',
                'PLN': 'Pollen',
            },
        });
    }

    getAccount (params = {}) {
        // get current or provided bitmax sub-account
        const account = this.safeValue (params, 'account', this.options['account']);
        const lowercaseAccount = account.toLowerCase ();
        return this.capitalize (lowercaseAccount);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name ascendex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const assets = await this.v1PublicGetAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode" : "LTCBULL",
        //                 "assetName" : "3X Long LTC Token",
        //                 "precisionScale" : 9,
        //                 "nativeScale" : 4,
        //                 "withdrawalFee" : "0.2",
        //                 "minWithdrawalAmt" : "1.0",
        //                 "status" : "Normal"
        //             },
        //         ]
        //     }
        //
        const margin = await this.v1PublicGetMarginAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode":"BTT",
        //                 "borrowAssetCode":"BTT-B",
        //                 "interestAssetCode":"BTT-I",
        //                 "nativeScale":0,
        //                 "numConfirmations":1,
        //                 "withdrawFee":"100.0",
        //                 "minWithdrawalAmt":"1000.0",
        //                 "statusCode":"Normal",
        //                 "statusMessage":"",
        //                 "interestRate":"0.001"
        //             }
        //         ]
        //     }
        //
        const cash = await this.v1PublicGetCashAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode":"LTCBULL",
        //                 "nativeScale":4,
        //                 "numConfirmations":20,
        //                 "withdrawFee":"0.2",
        //                 "minWithdrawalAmt":"1.0",
        //                 "statusCode":"Normal",
        //                 "statusMessage":""
        //             }
        //         ]
        //     }
        //
        const assetsData = this.safeValue (assets, 'data', []);
        const marginData = this.safeValue (margin, 'data', []);
        const cashData = this.safeValue (cash, 'data', []);
        const assetsById = this.indexBy (assetsData, 'assetCode');
        const marginById = this.indexBy (marginData, 'assetCode');
        const cashById = this.indexBy (cashData, 'assetCode');
        const dataById = this.deepExtend (assetsById, marginById, cashById);
        const ids = Object.keys (dataById);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = dataById[id];
            const code = this.safeCurrencyCode (id);
            const scale = this.safeString2 (currency, 'precisionScale', 'nativeScale');
            const precision = this.parseNumber (this.parsePrecision (scale));
            const fee = this.safeNumber2 (currency, 'withdrawFee', 'withdrawalFee');
            const status = this.safeString2 (currency, 'status', 'statusCode');
            const active = (status === 'Normal');
            const margin = ('borrowAssetCode' in currency);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'margin': margin,
                'name': this.safeString (currency, 'assetName'),
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': precision,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'minWithdrawalAmt'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name ascendex#fetchMarkets
         * @description retrieves data on all markets for ascendex
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const products = await this.v1PublicGetProducts (params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "LBA/BTC",
        //                 "baseAsset": "LBA",
        //                 "quoteAsset": "BTC",
        //                 "status": "Normal",
        //                 "minNotional": "0.000625",
        //                 "maxNotional": "6.25",
        //                 "marginTradable": false,
        //                 "commissionType": "Quote",
        //                 "commissionReserveRate": "0.001",
        //                 "tickSize": "0.000000001",
        //                 "lotSize": "1"
        //             },
        //         ]
        //     }
        //
        const cash = await this.v1PublicGetCashProducts (params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "QTUM/BTC",
        //                 "displayName": "QTUM/BTC",
        //                 "domain": "BTC",
        //                 "tradingStartTime": 1569506400000,
        //                 "collapseDecimals": "0.0001,0.000001,0.00000001",
        //                 "minQty": "0.000000001",
        //                 "maxQty": "1000000000",
        //                 "minNotional": "0.000625",
        //                 "maxNotional": "12.5",
        //                 "statusCode": "Normal",
        //                 "statusMessage": "",
        //                 "tickSize": "0.00000001",
        //                 "useTick": false,
        //                 "lotSize": "0.1",
        //                 "useLot": false,
        //                 "commissionType": "Quote",
        //                 "commissionReserveRate": "0.001",
        //                 "qtyScale": 1,
        //                 "priceScale": 8,
        //                 "notionalScale": 4
        //             }
        //         ]
        //     }
        //
        const perpetuals = await this.v2PublicGetFuturesContract (params);
        //
        //    {
        //        "code": 0,
        //        "data": [
        //            {
        //                "symbol": "BTC-PERP",
        //                "status": "Normal",
        //                "displayName": "BTCUSDT",
        //                "settlementAsset": "USDT",
        //                "underlying": "BTC/USDT",
        //                "tradingStartTime": 1579701600000,
        //                "priceFilter": {
        //                    "minPrice": "1",
        //                    "maxPrice": "1000000",
        //                    "tickSize": "1"
        //                },
        //                "lotSizeFilter": {
        //                    "minQty": "0.0001",
        //                    "maxQty": "1000000000",
        //                    "lotSize": "0.0001"
        //                },
        //                "commissionType": "Quote",
        //                "commissionReserveRate": "0.001",
        //                "marketOrderPriceMarkup": "0.03",
        //                "marginRequirements": [
        //                    {
        //                        "positionNotionalLowerBound": "0",
        //                        "positionNotionalUpperBound": "50000",
        //                        "initialMarginRate": "0.01",
        //                        "maintenanceMarginRate": "0.006"
        //                    },
        //                    ...
        //                ]
        //            }
        //        ]
        //    }
        //
        const productsData = this.safeValue (products, 'data', []);
        const productsById = this.indexBy (productsData, 'symbol');
        const cashData = this.safeValue (cash, 'data', []);
        const perpetualsData = this.safeValue (perpetuals, 'data', []);
        const cashAndPerpetualsData = this.arrayConcat (cashData, perpetualsData);
        const cashAndPerpetualsById = this.indexBy (cashAndPerpetualsData, 'symbol');
        const dataById = this.deepExtend (productsById, cashAndPerpetualsById);
        const ids = Object.keys (dataById);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = dataById[id];
            const settleId = this.safeValue (market, 'settlementAsset');
            const settle = this.safeCurrencyCode (settleId);
            const status = this.safeString (market, 'status');
            const domain = this.safeString (market, 'domain');
            let active = false;
            if (((status === 'Normal') || (status === 'InternalTrading')) && (domain !== 'LeveragedETF')) {
                active = true;
            }
            const spot = settle === undefined;
            const swap = !spot;
            const linear = swap ? true : undefined;
            let minQty = this.safeNumber (market, 'minQty');
            let maxQty = this.safeNumber (market, 'maxQty');
            let minPrice = this.safeNumber (market, 'tickSize');
            let maxPrice = undefined;
            const underlying = this.safeString2 (market, 'underlying', 'symbol');
            const parts = underlying.split ('/');
            const baseId = this.safeString (parts, 0);
            const quoteId = this.safeString (parts, 1);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            if (swap) {
                const lotSizeFilter = this.safeValue (market, 'lotSizeFilter');
                minQty = this.safeNumber (lotSizeFilter, 'minQty');
                maxQty = this.safeNumber (lotSizeFilter, 'maxQty');
                const priceFilter = this.safeValue (market, 'priceFilter');
                minPrice = this.safeNumber (priceFilter, 'minPrice');
                maxPrice = this.safeNumber (priceFilter, 'maxPrice');
                symbol = base + '/' + quote + ':' + settle;
            }
            const fee = this.safeNumber (market, 'commissionReserveRate');
            const marginTradable = this.safeValue (market, 'marginTradable', false);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': swap ? 'swap' : 'spot',
                'spot': spot,
                'margin': spot ? marginTradable : undefined,
                'swap': swap,
                'future': false,
                'option': false,
                'active': active,
                'contract': swap,
                'linear': linear,
                'inverse': swap ? !linear : undefined,
                'taker': fee,
                'maker': fee,
                'contractSize': swap ? this.parseNumber ('1') : undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'lotSize'),
                    'price': this.safeNumber (market, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minQty,
                        'max': maxQty,
                    },
                    'price': {
                        'min': minPrice,
                        'max': maxPrice,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minNotional'),
                        'max': this.safeNumber (market, 'maxNotional'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name ascendex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the ascendex server
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the ascendex server
         */
        const request = {
            'requestTime': this.milliseconds (),
        };
        const response = await this.v1PublicGetExchangeInfo (this.extend (request, params));
        //
        //    {
        //        "code": 0,
        //        "data": {
        //            "requestTimeEcho": 1656560463601,
        //            "requestReceiveAt": 1656560464331,
        //            "latency": 730
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data');
        return this.safeInteger (data, 'requestReceiveAt');
    }

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name ascendex#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/en/latest/manual.html#account-structure} indexed by the account type
         */
        let accountGroup = this.safeString (this.options, 'account-group');
        let response = undefined;
        if (accountGroup === undefined) {
            response = await this.v1PrivateGetInfo (params);
            //
            //     {
            //         "code":0,
            //         "data":{
            //             "email":"igor.kroitor@gmail.com",
            //             "accountGroup":8,
            //             "viewPermission":true,
            //             "tradePermission":true,
            //             "transferPermission":true,
            //             "cashAccount":["cshrHKLZCjlZ2ejqkmvIHHtPmLYqdnda"],
            //             "marginAccount":["martXoh1v1N3EMQC5FDtSj5VHso8aI2Z"],
            //             "futuresAccount":["futc9r7UmFJAyBY2rE3beA2JFxav2XFF"],
            //             "userUID":"U6491137460"
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            accountGroup = this.safeString (data, 'accountGroup');
            this.options['account-group'] = accountGroup;
        }
        return [
            {
                'id': accountGroup,
                'type': undefined,
                'currency': undefined,
                'info': response,
            },
        ];
    }

    parseBalance (response) {
        const timestamp = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'asset'));
            const account = this.account ();
            account['free'] = this.safeString (balance, 'availableBalance');
            account['total'] = this.safeString (balance, 'totalBalance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseMarginBalance (response) {
        const timestamp = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'asset'));
            const account = this.account ();
            account['free'] = this.safeString (balance, 'availableBalance');
            account['total'] = this.safeString (balance, 'totalBalance');
            const debt = this.safeString (balance, 'borrowed');
            const interest = this.safeString (balance, 'interest');
            account['debt'] = Precise.stringAdd (debt, interest);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseSwapBalance (response) {
        const timestamp = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const data = this.safeValue (response, 'data', {});
        const collaterals = this.safeValue (data, 'collaterals', []);
        for (let i = 0; i < collaterals.length; i++) {
            const balance = collaterals[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'asset'));
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name ascendex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let query = undefined;
        let marketType = undefined;
        [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const isMargin = this.safeValue (params, 'margin', false);
        marketType = isMargin ? 'margin' : marketType;
        params = this.omit (params, 'margin');
        const options = this.safeValue (this.options, 'fetchBalance', {});
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, marketType, 'cash');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
        };
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountCategoryGetBalance');
        const method = this.getSupportedMapping (marketType, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupGetFuturesPosition',
        });
        if ((accountCategory === 'cash') || (accountCategory === 'margin')) {
            request['account-category'] = accountCategory;
        }
        const response = await this[method] (this.extend (request, query));
        //
        // cash
        //
        //     {
        //         'code': 0,
        //         'data': [
        //             {
        //                 'asset': 'BCHSV',
        //                 'totalBalance': '64.298000048',
        //                 'availableBalance': '64.298000048',
        //             },
        //         ]
        //     }
        //
        // margin
        //
        //     {
        //         'code': 0,
        //         'data': [
        //             {
        //                 'asset': 'BCHSV',
        //                 'totalBalance': '64.298000048',
        //                 'availableBalance': '64.298000048',
        //                 'borrowed': '0',
        //                 'interest': '0',
        //             },
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //             "ac": "FUTURES",
        //             "collaterals": [
        //                 {"asset":"ADA","balance":"0.355803","referencePrice":"1.05095","discountFactor":"0.9"},
        //                 {"asset":"USDT","balance":"0.000014519","referencePrice":"1","discountFactor":"1"}
        //             ],
        //         }j
        //     }
        //
        if (marketType === 'swap') {
            return this.parseSwapBalance (response);
        } else if (marketType === 'margin') {
            return this.parseMarginBalance (response);
        } else {
            return this.parseBalance (response);
        }
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetDepth (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "m":"depth-snapshot",
        //             "symbol":"BTC-PERP",
        //             "data":{
        //                 "ts":1590223998202,
        //                 "seqnum":115444921,
        //                 "asks":[
        //                     ["9207.5","18.2383"],
        //                     ["9207.75","18.8235"],
        //                     ["9208","10.7873"],
        //                 ],
        //                 "bids":[
        //                     ["9207.25","0.4009"],
        //                     ["9207","0.003"],
        //                     ["9206.5","0.003"],
        //                 ]
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orderbook = this.safeValue (data, 'data', {});
        const timestamp = this.safeInteger (orderbook, 'ts');
        const result = this.parseOrderBook (orderbook, symbol, timestamp);
        result['nonce'] = this.safeInteger (orderbook, 'seqnum');
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"QTUM/BTC",
        //         "open":"0.00016537",
        //         "close":"0.00019077",
        //         "high":"0.000192",
        //         "low":"0.00016537",
        //         "volume":"846.6",
        //         "ask":["0.00018698","26.2"],
        //         "bid":["0.00018408","503.7"],
        //         "type":"spot"
        //     }
        //
        const timestamp = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        const type = this.safeString (ticker, 'type');
        const delimiter = (type === 'spot') ? '/' : undefined;
        const symbol = this.safeSymbol (marketId, market, delimiter);
        const close = this.safeString (ticker, 'close');
        const bid = this.safeValue (ticker, 'bid', []);
        const ask = this.safeValue (ticker, 'ask', []);
        const open = this.safeString (ticker, 'open');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (bid, 0),
            'bidVolume': this.safeString (bid, 1),
            'ask': this.safeString (ask, 0),
            'askVolume': this.safeString (ask, 1),
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ascendex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetTicker (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "symbol":"BTC-PERP", // or "BTC/USDT"
        //             "open":"9073",
        //             "close":"9185.75",
        //             "high":"9185.75",
        //             "low":"9185.75",
        //             "volume":"576.8334",
        //             "ask":["9185.75","15.5863"],
        //             "bid":["9185.5","0.003"],
        //             "type":"derivatives", // or "spot"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://ascendex.github.io/ascendex-pro-api/#ticker
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#ticker
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue (symbols, 0);
            market = this.market (symbol);
            const marketIds = this.marketIds (symbols);
            request['symbol'] = marketIds.join (',');
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.v1PublicGetTicker (this.extend (request, params));
        } else {
            response = await this.v2PublicGetFuturesTicker (this.extend (request, params));
        }
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"QTUM/BTC",
        //                 "open":"0.00016537",
        //                 "close":"0.00019077",
        //                 "high":"0.000192",
        //                 "low":"0.00016537",
        //                 "volume":"846.6",
        //                 "ask":["0.00018698","26.2"],
        //                 "bid":["0.00018408","503.7"],
        //                 "type":"spot"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        if (!Array.isArray (data)) {
            return this.parseTickers ([ data ], symbols);
        }
        return this.parseTickers (data, symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "m":"bar",
        //         "s":"BTC/USDT",
        //         "data":{
        //             "i":"1",
        //             "ts":1590228000000,
        //             "o":"9139.59",
        //             "c":"9131.94",
        //             "h":"9139.99",
        //             "l":"9121.71",
        //             "v":"25.20648"
        //         }
        //     }
        //
        const data = this.safeValue (ohlcv, 'data', {});
        return [
            this.safeInteger (data, 'ts'),
            this.safeNumber (data, 'o'),
            this.safeNumber (data, 'h'),
            this.safeNumber (data, 'l'),
            this.safeNumber (data, 'c'),
            this.safeNumber (data, 'v'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        // if since and limit are not specified
        // the exchange will return just 1 last candle by default
        const duration = this.parseTimeframe (timeframe);
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const defaultLimit = this.safeInteger (options, 'limit', 500);
        if (since !== undefined) {
            request['from'] = since;
            if (limit === undefined) {
                limit = defaultLimit;
            } else {
                limit = Math.min (limit, defaultLimit);
            }
            request['to'] = this.sum (since, limit * duration * 1000, 1);
        } else if (limit !== undefined) {
            request['n'] = limit; // max 500
        }
        const response = await this.v1PublicGetBarhist (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "m":"bar",
        //                 "s":"BTC/USDT",
        //                 "data":{
        //                     "i":"1",
        //                     "ts":1590228000000,
        //                     "o":"9139.59",
        //                     "c":"9131.94",
        //                     "h":"9139.99",
        //                     "l":"9121.71",
        //                     "v":"25.20648"
        //                 }
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "p":"9128.5", // price
        //         "q":"0.0030", // quantity
        //         "ts":1590229002385, // timestamp
        //         "bm":false, // if true, the buyer is the market maker, we only use this field to "define the side" of a public trade
        //         "seqnum":180143985289898554
        //     }
        //
        const timestamp = this.safeInteger (trade, 'ts');
        const priceString = this.safeString2 (trade, 'price', 'p');
        const amountString = this.safeString (trade, 'q');
        const buyerIsMaker = this.safeValue (trade, 'bm', false);
        const side = buyerIsMaker ? 'sell' : 'buy';
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://ascendex.github.io/ascendex-pro-api/#market-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['n'] = limit; // max 100
        }
        const response = await this.v1PublicGetTrades (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "m":"trades",
        //             "symbol":"BTC-PERP",
        //             "data":[
        //                 {"p":"9128.5","q":"0.0030","ts":1590229002385,"bm":false,"seqnum":180143985289898554},
        //                 {"p":"9129","q":"0.0030","ts":1590229002642,"bm":false,"seqnum":180143985289898587},
        //                 {"p":"9129.5","q":"0.0030","ts":1590229021306,"bm":false,"seqnum":180143985289899043}
        //             ]
        //         }
        //     }
        //
        const records = this.safeValue (response, 'data', []);
        const trades = this.safeValue (records, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PendingNew': 'open',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
            'Rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "id": "16e607e2b83a8bXHbAwwoqDo55c166fa",
        //         "orderId": "16e85b4d9b9a8bXHbAwwoqDoc3d66830",
        //         "orderType": "Market",
        //         "symbol": "BTC/USDT",
        //         "timestamp": 1573576916201
        //     }
        //
        //     {
        //         "ac": "FUTURES",
        //         "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //         "time": 1640819389454,
        //         "orderId": "a17e0874ecbdU0711043490bbtcpDU5X",
        //         "seqNum": -1,
        //         "orderType": "Limit",
        //         "execInst": "NULL_VAL",
        //         "side": "Buy",
        //         "symbol": "BTC-PERP",
        //         "price": "30000",
        //         "orderQty": "0.002",
        //         "stopPrice": "0",
        //         "stopBy": "ref-px",
        //         "status": "Ack",
        //         "lastExecTime": 1640819389454,
        //         "lastQty": "0",
        //         "lastPx": "0",
        //         "avgFilledPx": "0",
        //         "cumFilledQty": "0",
        //         "fee": "0",
        //         "cumFee": "0",
        //         "feeAsset": "",
        //         "errorCode": "",
        //         "posStopLossPrice": "0",
        //         "posStopLossTrigger": "market",
        //         "posTakeProfitPrice": "0",
        //         "posTakeProfitTrigger": "market",
        //         "liquidityInd": "n"
        //      }
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "symbol":       "BTC/USDT",
        //         "price":        "8131.22",
        //         "orderQty":     "0.00082",
        //         "orderType":    "Market",
        //         "avgPx":        "7392.02",
        //         "cumFee":       "0.005152238",
        //         "cumFilledQty": "0.00082",
        //         "errorCode":    "",
        //         "feeAsset":     "USDT",
        //         "lastExecTime": 1575953151764,
        //         "orderId":      "a16eee20b6750866943712zWEDdAjt3",
        //         "seqNum":       2623469,
        //         "side":         "Buy",
        //         "status":       "Filled",
        //         "stopPrice":    "",
        //         "execInst":     "NULL_VAL" // "Post" (for postOnly orders), "reduceOnly" (for reduceOnly orders)
        //     }
        //
        //     {
        //         "ac": "FUTURES",
        //         "accountId": "testabcdefg",
        //         "avgPx": "0",
        //         "cumFee": "0",
        //         "cumQty": "0",
        //         "errorCode": "NULL_VAL",
        //         "execInst": "NULL_VAL",
        //         "feeAsset": "USDT",
        //         "lastExecTime": 1584072844085,
        //         "orderId": "r170d21956dd5450276356bbtcpKa74",
        //         "orderQty": "1.1499",
        //         "orderType": "Limit",
        //         "price": "4000",
        //         "sendingTime": 1584072841033,
        //         "seqNum": 24105338,
        //         "side": "Buy",
        //         "status": "Canceled",
        //         "stopPrice": "",
        //         "symbol": "BTC-PERP"
        //     },
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '/');
        let timestamp = this.safeInteger2 (order, 'timestamp', 'sendingTime');
        const lastTradeTimestamp = this.safeInteger (order, 'lastExecTime');
        if (timestamp === undefined) {
            timestamp = lastTradeTimestamp;
        }
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'orderQty');
        const average = this.safeString (order, 'avgPx');
        const filled = this.safeString2 (order, 'cumFilledQty', 'cumQty');
        const id = this.safeString (order, 'orderId');
        let clientOrderId = this.safeString (order, 'id');
        if (clientOrderId !== undefined) {
            if (clientOrderId.length < 1) {
                clientOrderId = undefined;
            }
        }
        const rawTypeLower = this.safeStringLower (order, 'orderType');
        let type = rawTypeLower;
        if (rawTypeLower !== undefined) {
            if (rawTypeLower === 'stoplimit') {
                type = 'limit';
            }
            if (rawTypeLower === 'stopmarket') {
                type = 'market';
            }
        }
        const side = this.safeStringLower (order, 'side');
        const feeCost = this.safeNumber (order, 'cumFee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'feeAsset');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const stopPrice = this.safeNumber (order, 'stopPrice');
        let reduceOnly = undefined;
        const execInst = this.safeString (order, 'execInst');
        if (execInst === 'reduceOnly') {
            reduceOnly = true;
        }
        let postOnly = undefined;
        if (execInst === 'Post') {
            postOnly = true;
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name ascendex#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
        };
        const response = await this.v1PrivateAccountGroupGetSpotFee (this.extend (request, params));
        //
        //      {
        //         code: '0',
        //         data: {
        //           domain: 'spot',
        //           userUID: 'U1479576458',
        //           vipLevel: '0',
        //           fees: [
        //             { symbol: 'HT/USDT', fee: { taker: '0.001', maker: '0.001' } },
        //             { symbol: 'LAMB/BTC', fee: { taker: '0.002', maker: '0.002' } },
        //             { symbol: 'STOS/USDT', fee: { taker: '0.002', maker: '0.002' } },
        //             ...
        //           ]
        //         }
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        const fees = this.safeValue (data, 'fees', []);
        const result = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            const marketId = this.safeString (fee, 'symbol');
            const symbol = this.safeSymbol (marketId, undefined, '/');
            const takerMaker = this.safeValue (fee, 'fee', {});
            result[symbol] = {
                'info': fee,
                'symbol': symbol,
                'maker': this.safeNumber (takerMaker, 'maker'),
                'taker': this.safeNumber (takerMaker, 'taker'),
            };
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#createOrder
         * @description Create an order on the exchange
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} type "limit" or "market"
         * @param {string} side "buy" or "sell"
         * @param {float} amount the amount of currency to trade
         * @param {float} price *ignored in "market" orders* the price at which the order is to be fullfilled at in units of the quote currency
         * @param {object} params Extra parameters specific to the exchange API endpoint
         * @param {string} params.timeInForce "GTC", "IOC", "FOK", or "PO"
         * @param {bool} params.postOnly true or false
         * @param {float} params.stopPrice The price at which a trigger order is triggered at
         * @returns [An order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        const options = this.safeValue (this.options, 'createOrder', {});
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, marketType, 'cash');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'symbol': market['id'],
            'time': this.milliseconds (),
            'orderQty': this.amountToPrecision (symbol, amount),
            'orderType': type, // limit, market, stop_market, stop_limit
            'side': side, // buy or sell,
            // 'execInst': // Post for postOnly, ReduceOnly for reduceOnly
            // 'respInst': 'ACK', // ACK, 'ACCEPT, DONE
        };
        const isMarketOrder = ((type === 'market') || (type === 'stop_market'));
        const isLimitOrder = ((type === 'limit') || (type === 'stop_limit'));
        const timeInForce = this.safeString (params, 'timeInForce');
        const postOnly = this.isPostOnly (isMarketOrder, false, params);
        const reduceOnly = this.safeValue (params, 'reduceOnly', false);
        const stopPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        params = this.omit (params, [ 'timeInForce', 'postOnly', 'reduceOnly', 'stopPrice', 'triggerPrice' ]);
        if (reduceOnly) {
            if (marketType !== 'swap') {
                throw new InvalidOrder (this.id + ' createOrder() does not support reduceOnly for ' + marketType + ' orders, reduceOnly orders are supported for perpetuals only');
            }
            request['execInst'] = 'ReduceOnly';
        }
        if (isLimitOrder) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        if (timeInForce === 'IOC') {
            request['timeInForce'] = 'IOC';
        }
        if (timeInForce === 'FOK') {
            request['timeInForce'] = 'FOK';
        }
        if (postOnly) {
            request['postOnly'] = true;
        }
        if (stopPrice !== undefined) {
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            if (isLimitOrder) {
                request['orderType'] = 'stop_limit';
            } else if (isMarketOrder) {
                request['orderType'] = 'stop_market';
            }
        }
        if (clientOrderId !== undefined) {
            request['id'] = clientOrderId;
        }
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountCategoryPostOrder');
        const method = this.getSupportedMapping (marketType, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupPostFuturesOrder',
        });
        if (method === 'v1PrivateAccountCategoryPostOrder') {
            if (accountCategory !== undefined) {
                request['category'] = accountCategory;
            }
        } else {
            request['account-category'] = accountCategory;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //      {
        //          "code":0,
        //          "data": {
        //              "accountId":"cshwT8RKojkT1HoaA5UdeimR2SrmHG2I",
        //              "ac":"CASH",
        //              "action":"place-order",
        //              "status":"Ack",
        //              "info": {
        //                  "symbol":"TRX/USDT",
        //                  "orderType":"StopLimit",
        //                  "timestamp":1654290662172,
        //                  "id":"",
        //                  "orderId":"a1812b6840ddU8191168955av0k6Eyhj"
        //              }
        //          }
        //      }
        //
        //
        // swap
        //
        //      {
        //          "code":0,
        //          "data": {
        //              "meta": {
        //                  "id":"",
        //                  "action":"place-order",
        //                  "respInst":"ACK"
        //              },
        //              "order": {
        //                  "ac":"FUTURES",
        //                  "accountId":"futwT8RKojkT1HoaA5UdeimR2SrmHG2I",
        //                  "time":1654290969965,
        //                  "orderId":"a1812b6cf322U8191168955oJamfTh7b",
        //                  "seqNum":-1,
        //                  "orderType":"StopLimit",
        //                  "execInst":"NULL_VAL",
        //                  "side":"Buy",
        //                  "symbol":"TRX-PERP",
        //                  "price":"0.083",
        //                  "orderQty":"1",
        //                  "stopPrice":"0.082",
        //                  "stopBy":"ref-px",
        //                  "status":"Ack",
        //                  "lastExecTime":1654290969965,
        //                  "lastQty":"0",
        //                  "lastPx":"0",
        //                  "avgFilledPx":"0",
        //                  "cumFilledQty":"0",
        //                  "fee":"0",
        //                  "cumFee":"0",
        //                  "feeAsset":"",
        //                  "errorCode":"",
        //                  "posStopLossPrice":"0",
        //                  "posStopLossTrigger":"market",
        //                  "posTakeProfitPrice":"0",
        //                  "posTakeProfitTrigger":"market",
        //                  "liquidityInd":"n"
        //              }
        //          }
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        const order = this.safeValue2 (data, 'order', 'info', {});
        return this.parseOrder (order, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const options = this.safeValue (this.options, 'fetchOrder', {});
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, type, 'cash');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'orderId': id,
        };
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountCategoryGetOrderStatus');
        const method = this.getSupportedMapping (type, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupGetFuturesOrderStatus',
        });
        if (method === 'v1PrivateAccountCategoryGetOrderStatus') {
            if (accountCategory !== undefined) {
                request['category'] = accountCategory;
            }
        } else {
            request['account-category'] = accountCategory;
        }
        const response = await this[method] (this.extend (request, query));
        //
        // AccountCategoryGetOrderStatus
        //
        //     {
        //         "code": 0,
        //         "accountCategory": "CASH",
        //         "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //         "data": [
        //             {
        //                 "symbol":       "BTC/USDT",
        //                 "price":        "8131.22",
        //                 "orderQty":     "0.00082",
        //                 "orderType":    "Market",
        //                 "avgPx":        "7392.02",
        //                 "cumFee":       "0.005152238",
        //                 "cumFilledQty": "0.00082",
        //                 "errorCode":    "",
        //                 "feeAsset":     "USDT",
        //                 "lastExecTime": 1575953151764,
        //                 "orderId":      "a16eee20b6750866943712zWEDdAjt3",
        //                 "seqNum":       2623469,
        //                 "side":         "Buy",
        //                 "status":       "Filled",
        //                 "stopPrice":    "",
        //                 "execInst":     "NULL_VAL"
        //             }
        //         ]
        //     }
        //
        // AccountGroupGetFuturesOrderStatus
        //
        //     {
        //         "code": 0,
        //         "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //         "ac": "FUTURES",
        //         "data": {
        //             "ac": "FUTURES",
        //             "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //             "time": 1640247020217,
        //             "orderId": "r17de65747aeU0711043490bbtcp0cmt",
        //             "seqNum": 28796162908,
        //             "orderType": "Limit",
        //             "execInst": "NULL_VAL",
        //             "side": "Buy",
        //             "symbol": "BTC-PERP",
        //             "price": "30000",
        //             "orderQty": "0.0021",
        //             "stopPrice": "0",
        //             "stopBy": "market",
        //             "status": "New",
        //             "lastExecTime": 1640247020232,
        //             "lastQty": "0",
        //             "lastPx": "0",
        //             "avgFilledPx": "0",
        //             "cumFilledQty": "0",
        //             "fee": "0",
        //             "cumFee": "0",
        //             "feeAsset": "USDT",
        //             "errorCode": "",
        //             "posStopLossPrice": "0",
        //             "posStopLossTrigger": "market",
        //             "posTakeProfitPrice": "0",
        //             "posTakeProfitTrigger": "market",
        //             "liquidityInd": "n"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, type, 'cash');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
        };
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountCategoryGetOrderOpen');
        const method = this.getSupportedMapping (type, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupGetFuturesOrderOpen',
        });
        if (method === 'v1PrivateAccountCategoryGetOrderOpen') {
            if (accountCategory !== undefined) {
                request['category'] = accountCategory;
            }
        } else {
            request['account-category'] = accountCategory;
        }
        const response = await this[method] (this.extend (request, query));
        //
        // AccountCategoryGetOrderOpen
        //
        //     {
        //         "ac": "CASH",
        //         "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //         "code": 0,
        //         "data": [
        //             {
        //                 "avgPx": "0",         // Average filled price of the order
        //                 "cumFee": "0",       // cumulative fee paid for this order
        //                 "cumFilledQty": "0", // cumulative filled quantity
        //                 "errorCode": "",     // error code; could be empty
        //                 "feeAsset": "USDT",  // fee asset
        //                 "lastExecTime": 1576019723550, //  The last execution time of the order
        //                 "orderId": "s16ef21882ea0866943712034f36d83", // server provided orderId
        //                 "orderQty": "0.0083",  // order quantity
        //                 "orderType": "Limit",  // order type
        //                 "price": "7105",       // order price
        //                 "seqNum": 8193258,     // sequence number
        //                 "side": "Buy",         // order side
        //                 "status": "New",       // order status on matching engine
        //                 "stopPrice": "",       // only available for stop market and stop limit orders; otherwise empty
        //                 "symbol": "BTC/USDT",
        //                 "execInst": "NULL_VAL" // execution instruction
        //             },
        //         ]
        //     }
        //
        // AccountGroupGetFuturesOrderOpen
        //
        // {
        //     "code": 0,
        //     "data": [
        //         {
        //             "ac": "FUTURES",
        //             "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //             "time": 1640247020217,
        //             "orderId": "r17de65747aeU0711043490bbtcp0cmt",
        //             "seqNum": 28796162908,
        //             "orderType": "Limit",
        //             "execInst": "NULL_VAL",
        //             "side": "Buy",
        //             "symbol": "BTC-PERP",
        //             "price": "30000",
        //             "orderQty": "0.0021",
        //             "stopPrice": "0",
        //             "stopBy": "market",
        //             "status": "New",
        //             "lastExecTime": 1640247020232,
        //             "lastQty": "0",
        //             "lastPx": "0",
        //             "avgFilledPx": "0",
        //             "cumFilledQty": "0",
        //             "fee": "0",
        //             "cumFee": "0",
        //             "feeAsset": "USDT",
        //             "errorCode": "",
        //             "posStopLossPrice": "0",
        //             "posStopLossTrigger": "market",
        //             "posTakeProfitPrice": "0",
        //             "posTakeProfitTrigger": "market",
        //             "liquidityInd": "n"
        //         }
        //     ]
        // }
        //
        const data = this.safeValue (response, 'data', []);
        if (accountCategory === 'futures') {
            return this.parseOrders (data, market, since, limit);
        }
        // a workaround for https://github.com/ccxt/ccxt/issues/7187
        const orders = [];
        for (let i = 0; i < data.length; i++) {
            const order = this.parseOrder (data[i], market);
            orders.push (order);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            // 'category': accountCategory,
            // 'symbol': market['id'],
            // 'orderType': 'market', // optional, string
            // 'side': 'buy', // or 'sell', optional, case insensitive.
            // 'status': 'Filled', // "Filled", "Canceled", or "Rejected"
            // 'startTime': exchange.milliseconds (),
            // 'endTime': exchange.milliseconds (),
            // 'page': 1,
            // 'pageSize': 100,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        const options = this.safeValue (this.options, 'fetchClosedOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountGroupGetOrderHist');
        const method = this.getSupportedMapping (type, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupGetFuturesOrderHistCurrent',
        });
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, type, 'cash');
        if (method === 'v1PrivateAccountGroupGetOrderHist') {
            if (accountCategory !== undefined) {
                request['category'] = accountCategory;
            }
        } else {
            request['account-category'] = accountCategory;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this[method] (this.extend (request, query));
        //
        // accountCategoryGetOrderHistCurrent
        //
        //     {
        //         "code":0,
        //         "accountId":"cshrHKLZCjlZ2ejqkmvIHHtPmLYqdnda",
        //         "ac":"CASH",
        //         "data":[
        //             {
        //                 "seqNum":15561826728,
        //                 "orderId":"a17294d305c0U6491137460bethu7kw9",
        //                 "symbol":"ETH/USDT",
        //                 "orderType":"Limit",
        //                 "lastExecTime":1591635618200,
        //                 "price":"200",
        //                 "orderQty":"0.1",
        //                 "side":"Buy",
        //                 "status":"Canceled",
        //                 "avgPx":"0",
        //                 "cumFilledQty":"0",
        //                 "stopPrice":"",
        //                 "errorCode":"",
        //                 "cumFee":"0",
        //                 "feeAsset":"USDT",
        //                 "execInst":"NULL_VAL"
        //             }
        //         ]
        //     }
        //
        // accountGroupGetOrderHist
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "data": [
        //                 {
        //                     "ac": "FUTURES",
        //                     "accountId": "testabcdefg",
        //                     "avgPx": "0",
        //                     "cumFee": "0",
        //                     "cumQty": "0",
        //                     "errorCode": "NULL_VAL",
        //                     "execInst": "NULL_VAL",
        //                     "feeAsset": "USDT",
        //                     "lastExecTime": 1584072844085,
        //                     "orderId": "r170d21956dd5450276356bbtcpKa74",
        //                     "orderQty": "1.1499",
        //                     "orderType": "Limit",
        //                     "price": "4000",
        //                     "sendingTime": 1584072841033,
        //                     "seqNum": 24105338,
        //                     "side": "Buy",
        //                     "status": "Canceled",
        //                     "stopPrice": "",
        //                     "symbol": "BTC-PERP"
        //                 },
        //             ],
        //             "hasNext": False,
        //             "limit": 500,
        //             "page": 1,
        //             "pageSize": 20
        //         }
        //     }
        //
        // accountGroupGetFuturesOrderHistCurrent
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "ac": "FUTURES",
        //                 "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //                 "time": 1640245777002,
        //                 "orderId": "r17de6444fa6U0711043490bbtcpJ2lI",
        //                 "seqNum": 28796124902,
        //                 "orderType": "Limit",
        //                 "execInst": "NULL_VAL",
        //                 "side": "Buy",
        //                 "symbol": "BTC-PERP",
        //                 "price": "30000",
        //                 "orderQty": "0.0021",
        //                 "stopPrice": "0",
        //                 "stopBy": "market",
        //                 "status": "Canceled",
        //                 "lastExecTime": 1640246574886,
        //                 "lastQty": "0",
        //                 "lastPx": "0",
        //                 "avgFilledPx": "0",
        //                 "cumFilledQty": "0",
        //                 "fee": "0",
        //                 "cumFee": "0",
        //                 "feeAsset": "USDT",
        //                 "errorCode": "",
        //                 "posStopLossPrice": "0",
        //                 "posStopLossTrigger": "market",
        //                 "posTakeProfitPrice": "0",
        //                 "posTakeProfitTrigger": "market",
        //                 "liquidityInd": "n"
        //             }
        //         ]
        //     }
        //
        let data = this.safeValue (response, 'data');
        const isArray = Array.isArray (data);
        if (!isArray) {
            data = this.safeValue (data, 'data', []);
        }
        return this.parseOrders (data, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const options = this.safeValue (this.options, 'cancelOrder', {});
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, type, 'cash');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'symbol': market['id'],
            'time': this.milliseconds (),
            'id': 'foobar',
        };
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountCategoryDeleteOrder');
        const method = this.getSupportedMapping (type, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupDeleteFuturesOrder',
        });
        if (method === 'v1PrivateAccountCategoryDeleteOrder') {
            if (accountCategory !== undefined) {
                request['category'] = accountCategory;
            }
        } else {
            request['account-category'] = accountCategory;
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'id');
        if (clientOrderId === undefined) {
            request['orderId'] = id;
        } else {
            request['id'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'id' ]);
        }
        const response = await this[method] (this.extend (request, query));
        //
        // AccountCategoryDeleteOrder
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //             "ac": "CASH",
        //             "action": "cancel-order",
        //             "status": "Ack",
        //             "info": {
        //                 "id":        "wv8QGquoeamhssvQBeHOHGQCGlcBjj23",
        //                 "orderId":   "16e6198afb4s8bXHbAwwoqDo2ebc19dc",
        //                 "orderType": "", // could be empty
        //                 "symbol":    "ETH/USDT",
        //                 "timestamp":  1573594877822
        //             }
        //         }
        //     }
        //
        // AccountGroupDeleteFuturesOrder
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "meta": {
        //                 "id": "foobar",
        //                 "action": "cancel-order",
        //                 "respInst": "ACK"
        //             },
        //             "order": {
        //                 "ac": "FUTURES",
        //                 "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //                 "time": 1640244480476,
        //                 "orderId": "r17de63086f4U0711043490bbtcpPUF4",
        //                 "seqNum": 28795959269,
        //                 "orderType": "Limit",
        //                 "execInst": "NULL_VAL",
        //                 "side": "Buy",
        //                 "symbol": "BTC-PERP",
        //                 "price": "30000",
        //                 "orderQty": "0.0021",
        //                 "stopPrice": "0",
        //                 "stopBy": "market",
        //                 "status": "New",
        //                 "lastExecTime": 1640244480491,
        //                 "lastQty": "0",
        //                 "lastPx": "0",
        //                 "avgFilledPx": "0",
        //                 "cumFilledQty": "0",
        //                 "fee": "0",
        //                 "cumFee": "0",
        //                 "feeAsset": "BTCPC",
        //                 "errorCode": "",
        //                 "posStopLossPrice": "0",
        //                 "posStopLossTrigger": "market",
        //                 "posTakeProfitPrice": "0",
        //                 "posTakeProfitTrigger": "market",
        //                 "liquidityInd": "n"
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const order = this.safeValue2 (data, 'order', 'info', {});
        return this.parseOrder (order, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        const options = this.safeValue (this.options, 'cancelAllOrders', {});
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, type, 'cash');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'time': this.milliseconds (),
        };
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountCategoryDeleteOrderAll');
        const method = this.getSupportedMapping (type, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupDeleteFuturesOrderAll',
        });
        if (method === 'v1PrivateAccountCategoryDeleteOrderAll') {
            if (accountCategory !== undefined) {
                request['category'] = accountCategory;
            }
        } else {
            request['account-category'] = accountCategory;
        }
        const response = await this[method] (this.extend (request, query));
        //
        // AccountCategoryDeleteOrderAll
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "ac": "CASH",
        //             "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //             "action": "cancel-all",
        //             "info": {
        //                 "id":  "2bmYvi7lyTrneMzpcJcf2D7Pe9V1P9wy",
        //                 "orderId": "",
        //                 "orderType": "NULL_VAL",
        //                 "symbol": "",
        //                 "timestamp": 1574118495462
        //             },
        //             "status": "Ack"
        //         }
        //     }
        //
        // AccountGroupDeleteFuturesOrderAll
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "ac": "FUTURES",
        //             "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //             "action": "cancel-all",
        //             "info": {
        //                 "symbol":"BTC-PERP"
        //             }
        //         }
        //     }
        //
        return response;
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         address: "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722",
        //         destTag: "",
        //         tagType: "",
        //         tagId: "",
        //         chainName: "ERC20",
        //         numConfirmations: 20,
        //         withdrawalFee: 1,
        //         nativeScale: 4,
        //         tips: []
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tagId = this.safeString (depositAddress, 'tagId');
        const tag = this.safeString (depositAddress, tagId);
        this.checkAddress (address);
        const code = (currency === undefined) ? undefined : currency['code'];
        const chainName = this.safeString (depositAddress, 'chainName');
        const network = this.safeNetwork (chainName);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': network,
            'info': depositAddress,
        };
    }

    safeNetwork (networkId) {
        const networksById = {
            'TRC20': 'TRC20',
            'ERC20': 'ERC20',
            'GO20': 'GO20',
            'BEP2': 'BEP2',
            'BEP20 (BSC)': 'BEP20',
            'Bitcoin': 'BTC',
            'Bitcoin ABC': 'BCH',
            'Litecoin': 'LTC',
            'Matic Network': 'MATIC',
            'Solana': 'SOL',
            'xDai': 'STAKE',
            'Akash': 'AKT',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name ascendex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const chainName = this.safeString (params, 'chainName');
        params = this.omit (params, 'chainName');
        const request = {
            'asset': currency['id'],
        };
        const response = await this.v1PrivateGetWalletDepositAddress (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "asset":"USDT",
        //             "assetName":"Tether",
        //             "address":[
        //                 {
        //                     "address":"1N22odLHXnLPCjC8kwBJPTayarr9RtPod6",
        //                     "destTag":"",
        //                     "tagType":"",
        //                     "tagId":"",
        //                     "chainName":"Omni",
        //                     "numConfirmations":3,
        //                     "withdrawalFee":4.7,
        //                     "nativeScale":4,
        //                     "tips":[]
        //                 },
        //                 {
        //                     "address":"0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722",
        //                     "destTag":"",
        //                     "tagType":"",
        //                     "tagId":"",
        //                     "chainName":"ERC20",
        //                     "numConfirmations":20,
        //                     "withdrawalFee":1.0,
        //                     "nativeScale":4,
        //                     "tips":[]
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const addresses = this.safeValue (data, 'address', []);
        const numAddresses = addresses.length;
        let address = undefined;
        if (numAddresses > 1) {
            const addressesByChainName = this.indexBy (addresses, 'chainName');
            if (chainName === undefined) {
                const chainNames = Object.keys (addressesByChainName);
                const chains = chainNames.join (', ');
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() returned more than one address, a chainName parameter is required, one of ' + chains);
            }
            address = this.safeValue (addressesByChainName, chainName, {});
        } else {
            // first address
            address = this.safeValue (addresses, 0, {});
        }
        const result = this.parseDepositAddress (address, currency);
        return this.extend (result, {
            'info': response,
        });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'txType': 'deposit',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'txType': 'withdrawal',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'asset': currency['id'],
            // 'page': 1,
            // 'pageSize': 20,
            // 'startTs': this.milliseconds (),
            // 'endTs': this.milliseconds (),
            // 'txType': undefned, // deposit, withdrawal
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTs'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.v1PrivateGetWalletTransactions (this.extend (request, params));
        //
        //     {
        //         code: 0,
        //         data: {
        //             data: [
        //                 {
        //                     requestId: "wuzd1Ojsqtz4bCA3UXwtUnnJDmU8PiyB",
        //                     time: 1591606166000,
        //                     asset: "USDT",
        //                     transactionType: "deposit",
        //                     amount: "25",
        //                     commission: "0",
        //                     networkTransactionId: "0xbc4eabdce92f14dbcc01d799a5f8ca1f02f4a3a804b6350ea202be4d3c738fce",
        //                     status: "pending",
        //                     numConfirmed: 8,
        //                     numConfirmations: 20,
        //                     destAddress: { address: "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722" }
        //                 }
        //             ],
        //             page: 1,
        //             pageSize: 20,
        //             hasNext: false
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transactions = this.safeValue (data, 'data', []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'reviewing': 'pending',
            'pending': 'pending',
            'confirmed': 'ok',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         requestId: "wuzd1Ojsqtz4bCA3UXwtUnnJDmU8PiyB",
        //         time: 1591606166000,
        //         asset: "USDT",
        //         transactionType: "deposit",
        //         amount: "25",
        //         commission: "0",
        //         networkTransactionId: "0xbc4eabdce92f14dbcc01d799a5f8ca1f02f4a3a804b6350ea202be4d3c738fce",
        //         status: "pending",
        //         numConfirmed: 8,
        //         numConfirmations: 20,
        //         destAddress: {
        //             address: "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722",
        //             destTag: "..." // for currencies that have it
        //         }
        //     }
        //
        const destAddress = this.safeValue (transaction, 'destAddress', {});
        const address = this.safeString (destAddress, 'address');
        const tag = this.safeString (destAddress, 'destTag');
        const timestamp = this.safeInteger (transaction, 'time');
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'requestId'),
            'txid': this.safeString (transaction, 'networkTransactionId'),
            'type': this.safeString (transaction, 'transactionType'),
            'currency': code,
            'network': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressFrom': undefined,
            'addressTo': address,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': tag,
            'updated': undefined,
            'comment': undefined,
            'fee': {
                'currency': code,
                'cost': this.safeNumber (transaction, 'commission'),
                'rate': undefined,
            },
        };
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
        };
        const response = await this.v2PrivateAccountGroupGetFuturesPosition (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //             "ac": "FUTURES",
        //             "collaterals": [
        //                 {
        //                     "asset": "USDT",
        //                     "balance": "44.570287262",
        //                     "referencePrice": "1",
        //                     "discountFactor": "1"
        //                 }
        //             ],
        //             "contracts": [
        //                 {
        //                     "symbol": "BTC-PERP",
        //                     "side": "LONG",
        //                     "position": "0.0001",
        //                     "referenceCost": "-3.12277254",
        //                     "unrealizedPnl": "-0.001700233",
        //                     "realizedPnl": "0",
        //                     "avgOpenPrice": "31209",
        //                     "marginType": "isolated",
        //                     "isolatedMargin": "1.654972977",
        //                     "leverage": "2",
        //                     "takeProfitPrice": "0",
        //                     "takeProfitTrigger": "market",
        //                     "stopLossPrice": "0",
        //                     "stopLossTrigger": "market",
        //                     "buyOpenOrderNotional": "0",
        //                     "sellOpenOrderNotional": "0",
        //                     "markPrice": "31210.723063672",
        //                     "indexPrice": "31223.148857925"
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const position = this.safeValue (data, 'contracts', []);
        const result = [];
        for (let i = 0; i < position.length; i++) {
            result.push (this.parsePosition (position[i]));
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-PERP",
        //         "side": "LONG",
        //         "position": "0.0001",
        //         "referenceCost": "-3.12277254",
        //         "unrealizedPnl": "-0.001700233",
        //         "realizedPnl": "0",
        //         "avgOpenPrice": "31209",
        //         "marginType": "isolated",
        //         "isolatedMargin": "1.654972977",
        //         "leverage": "2",
        //         "takeProfitPrice": "0",
        //         "takeProfitTrigger": "market",
        //         "stopLossPrice": "0",
        //         "stopLossTrigger": "market",
        //         "buyOpenOrderNotional": "0",
        //         "sellOpenOrderNotional": "0",
        //         "markPrice": "31210.723063672",
        //         "indexPrice": "31223.148857925"
        //     },
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        let notional = this.safeNumber (position, 'buyOpenOrderNotional');
        if (notional === 0) {
            notional = this.safeNumber (position, 'sellOpenOrderNotional');
        }
        const marginMode = this.safeString (position, 'marginType');
        let collateral = undefined;
        if (marginMode === 'isolated') {
            collateral = this.safeNumber (position, 'isolatedMargin');
        }
        return {
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'notional': notional,
            'marginMode': marginMode,
            'liquidationPrice': undefined,
            'entryPrice': this.safeNumber (position, 'avgOpenPrice'),
            'unrealizedPnl': this.safeNumber (position, 'unrealizedPnl'),
            'percentage': undefined,
            'contracts': this.safeNumber (position, 'position'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'side': this.safeStringLower (position, 'side'),
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': collateral,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': this.safeInteger (position, 'leverage'),
            'marginRatio': undefined,
        };
    }

    parseFundingRate (contract, market = undefined) {
        //
        //      {
        //          "time": 1640061364830,
        //          "symbol": "EOS-PERP",
        //          "markPrice": "3.353854865",
        //          "indexPrice": "3.3542",
        //          "openInterest": "14242",
        //          "fundingRate": "-0.000073026",
        //          "nextFundingTime": 1640073600000
        //      }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const currentTime = this.safeInteger (contract, 'time');
        const nextFundingRate = this.safeNumber (contract, 'fundingRate');
        const nextFundingRateTimestamp = this.safeInteger (contract, 'nextFundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
            'previousFundingRate': undefined,
            'nextFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'nextFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'nextFundingDatetime': undefined,
            'fundingRate': nextFundingRate,
            'fundingTimestamp': nextFundingRateTimestamp,
            'fundingDatetime': this.iso8601 (nextFundingRateTimestamp),
        };
    }

    async fetchFundingRates (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.v2PublicGetFuturesPricingData (params);
        //
        //     {
        //          "code": 0,
        //          "data": {
        //              "contracts": [
        //                  {
        //                      "time": 1640061364830,
        //                      "symbol": "EOS-PERP",
        //                      "markPrice": "3.353854865",
        //                      "indexPrice": "3.3542",
        //                      "openInterest": "14242",
        //                      "fundingRate": "-0.000073026",
        //                      "nextFundingTime": 1640073600000
        //                  },
        //              ],
        //              "collaterals": [
        //                  {
        //                      "asset": "USDTR",
        //                      "referencePrice": "1"
        //                  },
        //              ]
        //          }
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        const contracts = this.safeValue (data, 'contracts', []);
        const result = this.parseFundingRates (contracts);
        return this.filterByArray (result, 'symbol', symbols);
    }

    async modifyMarginHelper (symbol, amount, type, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        amount = this.amountToPrecision (symbol, amount);
        const request = {
            'account-group': accountGroup,
            'symbol': market['id'],
            'amount': amount, // positive value for adding margin, negative for reducing
        };
        const response = await this.v2PrivateAccountGroupPostFuturesIsolatedPositionMargin (this.extend (request, params));
        //
        // Can only change margin for perpetual futures isolated margin positions
        //
        //     {
        //          "code": 0
        //     }
        //
        if (type === 'reduce') {
            amount = Precise.stringAbs (amount);
        }
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
        });
    }

    parseMarginModification (data, market = undefined) {
        const errorCode = this.safeString (data, 'code');
        const status = (errorCode === '0') ? 'ok' : 'failed';
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': market['quote'],
            'symbol': market['symbol'],
            'status': status,
        };
    }

    async reduceMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name ascendex#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#reduce-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    async addMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name ascendex#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 1) || (leverage > 100)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 100');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        if (market['type'] !== 'future') {
            throw new BadSymbol (this.id + ' setLeverage() supports futures contracts only');
        }
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.v2PrivateAccountGroupPostFuturesLeverage (this.extend (request, params));
    }

    async setMarginMode (marginMode, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} response from the exchange
         */
        marginMode = marginMode.toLowerCase ();
        if (marginMode === 'cross') {
            marginMode = 'crossed';
        }
        if (marginMode !== 'isolated' && marginMode !== 'crossed') {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
            'symbol': market['id'],
            'marginMode': marginMode,
        };
        if (market['type'] !== 'future') {
            throw new BadSymbol (this.id + ' setMarginMode() supports futures contracts only');
        }
        return await this.v2PrivateAccountGroupPostFuturesMarginType (this.extend (request, params));
    }

    async fetchLeverageTiers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/en/latest/manual.html#leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.v2PublicGetFuturesContract (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"BTC-PERP",
        //                 "status":"Normal",
        //                 "displayName":"BTCUSDT",
        //                 "settlementAsset":"USDT",
        //                 "underlying":"BTC/USDT",
        //                 "tradingStartTime":1579701600000,
        //                 "priceFilter":{"minPrice":"1","maxPrice":"1000000","tickSize":"1"},
        //                 "lotSizeFilter":{"minQty":"0.0001","maxQty":"1000000000","lotSize":"0.0001"},
        //                 "commissionType":"Quote",
        //                 "commissionReserveRate":"0.001",
        //                 "marketOrderPriceMarkup":"0.03",
        //                 "marginRequirements":[
        //                     {"positionNotionalLowerBound":"0","positionNotionalUpperBound":"50000","initialMarginRate":"0.01","maintenanceMarginRate":"0.006"},
        //                     {"positionNotionalLowerBound":"50000","positionNotionalUpperBound":"200000","initialMarginRate":"0.02","maintenanceMarginRate":"0.012"},
        //                     {"positionNotionalLowerBound":"200000","positionNotionalUpperBound":"2000000","initialMarginRate":"0.04","maintenanceMarginRate":"0.024"},
        //                     {"positionNotionalLowerBound":"2000000","positionNotionalUpperBound":"20000000","initialMarginRate":"0.1","maintenanceMarginRate":"0.06"},
        //                     {"positionNotionalLowerBound":"20000000","positionNotionalUpperBound":"40000000","initialMarginRate":"0.2","maintenanceMarginRate":"0.12"},
        //                     {"positionNotionalLowerBound":"40000000","positionNotionalUpperBound":"1000000000","initialMarginRate":"0.333333","maintenanceMarginRate":"0.2"}
        //                 ]
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        symbols = this.marketSymbols (symbols);
        return this.parseLeverageTiers (data, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market = undefined) {
        /**
         * @param {object} info Exchange market response for 1 market
         * @param {object} market CCXT market
         */
        //
        //    {
        //        "symbol":"BTC-PERP",
        //        "status":"Normal",
        //        "displayName":"BTCUSDT",
        //        "settlementAsset":"USDT",
        //        "underlying":"BTC/USDT",
        //        "tradingStartTime":1579701600000,
        //        "priceFilter":{"minPrice":"1","maxPrice":"1000000","tickSize":"1"},
        //        "lotSizeFilter":{"minQty":"0.0001","maxQty":"1000000000","lotSize":"0.0001"},
        //        "commissionType":"Quote",
        //        "commissionReserveRate":"0.001",
        //        "marketOrderPriceMarkup":"0.03",
        //        "marginRequirements":[
        //            {"positionNotionalLowerBound":"0","positionNotionalUpperBound":"50000","initialMarginRate":"0.01","maintenanceMarginRate":"0.006"},
        //            {"positionNotionalLowerBound":"50000","positionNotionalUpperBound":"200000","initialMarginRate":"0.02","maintenanceMarginRate":"0.012"},
        //            {"positionNotionalLowerBound":"200000","positionNotionalUpperBound":"2000000","initialMarginRate":"0.04","maintenanceMarginRate":"0.024"},
        //            {"positionNotionalLowerBound":"2000000","positionNotionalUpperBound":"20000000","initialMarginRate":"0.1","maintenanceMarginRate":"0.06"},
        //            {"positionNotionalLowerBound":"20000000","positionNotionalUpperBound":"40000000","initialMarginRate":"0.2","maintenanceMarginRate":"0.12"},
        //            {"positionNotionalLowerBound":"40000000","positionNotionalUpperBound":"1000000000","initialMarginRate":"0.333333","maintenanceMarginRate":"0.2"}
        //        ]
        //    }
        //
        const marginRequirements = this.safeValue (info, 'marginRequirements', []);
        const id = this.safeString (info, 'symbol');
        market = this.safeMarket (id, market);
        const tiers = [];
        for (let i = 0; i < marginRequirements.length; i++) {
            const tier = marginRequirements[i];
            const initialMarginRate = this.safeString (tier, 'initialMarginRate');
            tiers.push ({
                'tier': this.sum (i, 1),
                'currency': market['quote'],
                'minNotional': this.safeNumber (tier, 'positionNotionalLowerBound'),
                'maxNotional': this.safeNumber (tier, 'positionNotionalUpperBound'),
                'maintenanceMarginRate': this.safeNumber (tier, 'maintenanceMarginRate'),
                'maxLeverage': this.parseNumber (Precise.stringDiv ('1', initialMarginRate)),
                'info': tier,
            });
        }
        return tiers;
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name ascendex#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the ascendex api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const currency = this.currency (code);
        amount = this.currencyToPrecision (code, amount);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        if (fromId !== 'cash' && toId !== 'cash') {
            throw new ExchangeError (this.id + ' transfer() only supports direct balance transfer between spot and future, spot and margin');
        }
        const request = {
            'account-group': accountGroup,
            'amount': amount,
            'asset': currency['id'],
            'fromAccount': fromId,
            'toAccount': toId,
        };
        const response = await this.v1PrivateAccountGroupPostTransfer (this.extend (request, params));
        //
        //    { code: '0' }
        //
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        const transfer = this.parseTransfer (response, currency);
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['amount'] = amount;
            transfer['currency'] = code;
        }
        return transfer;
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //    { code: '0' }
        //
        const status = this.safeInteger (transfer, 'code');
        const currencyCode = this.safeCurrencyCode (undefined, currency);
        const timestamp = this.milliseconds ();
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': currencyCode,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status) {
        if (status === 0) {
            return 'ok';
        }
        return 'failed';
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = api[0];
        const access = api[1];
        const type = this.safeString (api, 2);
        let url = '';
        const accountCategory = (type === 'accountCategory');
        if (accountCategory || (type === 'accountGroup')) {
            url += this.implodeParams ('/{account-group}', params);
            params = this.omit (params, 'account-group');
        }
        let request = this.implodeParams (path, params);
        url += '/api/pro/';
        if (version === 'v2') {
            request = version + '/' + request;
        } else {
            url += version + '/';
        }
        if (accountCategory) {
            url += this.implodeParams ('{account-category}/', params);
        }
        params = this.omit (params, 'account-category');
        url += request;
        if ((version === 'v1') && (request === 'cash/balance') || (request === 'margin/balance')) {
            request = 'balance';
        }
        if ((version === 'v1') && (request === 'spot/fee')) {
            request = 'fee';
        }
        if (request.indexOf ('subuser') >= 0) {
            const parts = request.split ('/');
            request = parts[2];
        }
        params = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            const payload = timestamp + '+' + request;
            const hmac = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'x-auth-key': this.apiKey,
                'x-auth-timestamp': timestamp,
                'x-auth-signature': hmac,
            };
            if (method === 'GET') {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            } else {
                headers['Content-Type'] = 'application/json';
                body = this.json (params);
            }
        }
        url = this.urls['api']['rest'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {'code': 6010, 'message': 'Not enough balance.'}
        //     {'code': 60060, 'message': 'The order is already filled or canceled.'}
        //     {"code":2100,"message":"ApiKeyFailure"}
        //     {"code":300001,"message":"Price is too low from market price.","reason":"INVALID_PRICE","accountId":"cshrHKLZCjlZ2ejqkmvIHHtPmLYqdnda","ac":"CASH","action":"place-order","status":"Err","info":{"symbol":"BTC/USDT"}}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        const error = (code !== undefined) && (code !== '0');
        if (error || (message !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
