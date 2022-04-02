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
            'rateLimit': 500,
            'certified': true,
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
                'createReduceOnlyOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
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
                        'get': [
                            'assets',
                            'products',
                            'ticker',
                            'barhist/info',
                            'barhist',
                            'depth',
                            'trades',
                            'cash/assets', // not documented
                            'cash/products', // not documented
                            'margin/assets', // not documented
                            'margin/products', // not documented
                            'futures/collateral',
                            'futures/contracts',
                            'futures/ref-px',
                            'futures/market-data',
                            'futures/funding-rates',
                            'risk-limit-info',
                        ],
                    },
                    'private': {
                        'get': [
                            'info',
                            'wallet/transactions',
                            'wallet/deposit/address', // not documented
                            'data/balance/snapshot',
                            'data/balance/history',
                        ],
                        'accountCategory': {
                            'get': [
                                'balance',
                                'order/open',
                                'order/status',
                                'order/hist/current',
                                'risk',
                            ],
                            'post': [
                                'order',
                                'order/batch',
                            ],
                            'delete': [
                                'order',
                                'order/all',
                                'order/batch',
                            ],
                        },
                        'accountGroup': {
                            'get': [
                                'cash/balance',
                                'margin/balance',
                                'margin/risk',
                                'futures/collateral-balance',
                                'futures/position',
                                'futures/risk',
                                'futures/funding-payments',
                                'order/hist',
                                'spot/fee',
                            ],
                            'post': [
                                'transfer',
                                'futures/transfer/deposit',
                                'futures/transfer/withdraw',
                            ],
                        },
                    },
                },
                'v2': {
                    'public': {
                        'get': [
                            'assets',
                            'futures/contract',
                            'futures/collateral',
                            'futures/pricing-data',
                        ],
                    },
                    'private': {
                        'get': [
                            'account/info',
                        ],
                        'accountGroup': {
                            'get': [
                                'order/hist',
                                'futures/position',
                                'futures/free-margin',
                                'futures/order/hist/current',
                                'futures/order/open',
                                'futures/order/status',
                            ],
                            'post': [
                                'futures/isolated-position-margin',
                                'futures/margin-type',
                                'futures/leverage',
                                'futures/transfer/deposit',
                                'futures/transfer/withdraw',
                                'futures/order',
                                'futures/order/batch',
                                'futures/order/open',
                                'subuser/subuser-transfer',
                                'subuser/subuser-transfer-hist',
                            ],
                            'delete': [
                                'futures/order',
                                'futures/order/batch',
                                'futures/order/all',
                            ],
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
                'accountCategories': {
                    'spot': 'cash',
                    'swap': 'futures',
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
        return account.toLowerCase ().capitalize ();
    }

    async fetchCurrencies (params = {}) {
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
            // why would the exchange API have different names for the same field
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
        const products = await this.v1PublicGetProducts (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"LBA/BTC",
        //                 "baseAsset":"LBA",
        //                 "quoteAsset":"BTC",
        //                 "status":"Normal",
        //                 "minNotional":"0.000625",
        //                 "maxNotional":"6.25",
        //                 "marginTradable":false,
        //                 "commissionType":"Quote",
        //                 "commissionReserveRate":"0.001",
        //                 "tickSize":"0.000000001",
        //                 "lotSize":"1"
        //             },
        //         ]
        //     }
        //
        const cash = await this.v1PublicGetCashProducts (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"QTUM/BTC",
        //                 "domain":"BTC",
        //                 "tradingStartTime":1569506400000,
        //                 "collapseDecimals":"0.0001,0.000001,0.00000001",
        //                 "minQty":"0.000000001",
        //                 "maxQty":"1000000000",
        //                 "minNotional":"0.000625",
        //                 "maxNotional":"12.5",
        //                 "statusCode":"Normal",
        //                 "statusMessage":"",
        //                 "tickSize":"0.00000001",
        //                 "useTick":false,
        //                 "lotSize":"0.1",
        //                 "useLot":false,
        //                 "commissionType":"Quote",
        //                 "commissionReserveRate":"0.001",
        //                 "qtyScale":1,
        //                 "priceScale":8,
        //                 "notionalScale":4
        //             }
        //         ]
        //     }
        //
        const perpetuals = await this.v2PublicGetFuturesContract (params);
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
            let baseId = this.safeString (market, 'baseAsset');
            let quoteId = this.safeString (market, 'quoteAsset');
            const settleId = this.safeValue (market, 'settlementAsset');
            let base = this.safeCurrencyCode (baseId);
            let quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const status = this.safeString (market, 'status');
            const spot = settle === undefined;
            const swap = !spot;
            const linear = swap ? true : undefined;
            let minQty = this.safeNumber (market, 'minQty');
            let maxQty = this.safeNumber (market, 'maxQty');
            let minPrice = this.safeNumber (market, 'tickSize');
            let maxPrice = undefined;
            let symbol = base + '/' + quote;
            if (swap) {
                const lotSizeFilter = this.safeValue (market, 'lotSizeFilter');
                minQty = this.safeNumber (lotSizeFilter, 'minQty');
                maxQty = this.safeNumber (lotSizeFilter, 'maxQty');
                const priceFilter = this.safeValue (market, 'priceFilter');
                minPrice = this.safeNumber (priceFilter, 'minPrice');
                maxPrice = this.safeNumber (priceFilter, 'maxPrice');
                const underlying = this.safeString (market, 'underlying');
                const parts = underlying.split ('/');
                baseId = this.safeString (parts, 0);
                quoteId = this.safeString (parts, 1);
                base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
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
                'active': (status === 'Normal'),
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

    async fetchAccounts (params = {}) {
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
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
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
        await this.loadMarkets ();
        await this.loadAccounts ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const options = this.safeValue (this.options, 'fetchBalance', {});
        const accountCategories = this.safeValue (this.options, 'accountCategories', {});
        const accountCategory = this.safeString (accountCategories, marketType, 'cash');
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
        if (accountCategory === 'cash') {
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
        } else {
            return this.parseBalance (response);
        }
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
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
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
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
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['symbol'] = marketIds.join (',');
        }
        const response = await this.v1PublicGetTicker (this.extend (request, params));
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
        const makerOrTaker = buyerIsMaker ? 'maker' : 'taker';
        const side = buyerIsMaker ? 'buy' : 'sell';
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': makerOrTaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
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
        //         "execInst":     "NULL_VAL"
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
        const timestamp = this.safeInteger2 (order, 'timestamp', 'sendingTime');
        const lastTradeTimestamp = this.safeInteger (order, 'lastExecTime');
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
        const type = this.safeStringLower (order, 'orderType');
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
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
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
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const [ style, query ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        const options = this.safeValue (this.options, 'createOrder', {});
        const accountCategories = this.safeValue (this.options, 'accountCategories', {});
        const accountCategory = this.safeString (accountCategories, style, 'cash');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'id');
        const reduceOnly = this.safeValue (params, 'execInst');
        if (reduceOnly !== undefined) {
            if ((style !== 'swap')) {
                throw new InvalidOrder (this.id + ' createOrder() does not support reduceOnly for ' + style + ' orders, reduceOnly orders are supported for perpetuals only');
            }
        }
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'symbol': market['id'],
            'time': this.milliseconds (),
            'orderQty': this.amountToPrecision (symbol, amount),
            'orderType': type, // "limit", "market", "stop_market", "stop_limit"
            'side': side, // "buy" or "sell"
            // 'orderPrice': this.priceToPrecision (symbol, price),
            // 'stopPrice': this.priceToPrecision (symbol, stopPrice), // required for stop orders
            // 'postOnly': 'false', // 'false', 'true'
            // 'timeInForce': 'GTC', // GTC, IOC, FOK
            // 'respInst': 'ACK', // ACK, 'ACCEPT, DONE
        };
        if (clientOrderId !== undefined) {
            request['id'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'id' ]);
        }
        if ((type === 'limit') || (type === 'stop_limit')) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        if ((type === 'stop_limit') || (type === 'stop_market')) {
            const stopPrice = this.safeNumber (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice parameter for ' + type + ' orders');
            } else {
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
                params = this.omit (params, 'stopPrice');
            }
        }
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountCategoryPostOrder');
        const method = this.getSupportedMapping (style, {
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
        const response = await this[method] (this.extend (request, query));
        //
        // AccountCategoryPostOrder
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "ac": "MARGIN",
        //             "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //             "action": "place-order",
        //             "info": {
        //                 "id": "16e607e2b83a8bXHbAwwoqDo55c166fa",
        //                 "orderId": "16e85b4d9b9a8bXHbAwwoqDoc3d66830",
        //                 "orderType": "Market",
        //                 "symbol": "BTC/USDT",
        //                 "timestamp": 1573576916201
        //             },
        //             "status": "Ack"
        //         }
        //     }
        //
        // AccountGroupPostFuturesOrder
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "meta": {
        //                 "id": "",
        //                 "action": "place-order",
        //                 "respInst": "ACK"
        //             },
        //             "order": {
        //                 "ac": "FUTURES",
        //                 "accountId": "fut2ODPhGiY71Pl4vtXnOZ00ssgD7QGn",
        //                 "time": 1640819389454,
        //                 "orderId": "a17e0874ecbdU0711043490bbtcpDU5X",
        //                 "seqNum": -1,
        //                 "orderType": "Limit",
        //                 "execInst": "NULL_VAL",
        //                 "side": "Buy",
        //                 "symbol": "BTC-PERP",
        //                 "price": "30000",
        //                 "orderQty": "0.002",
        //                 "stopPrice": "0",
        //                 "stopBy": "ref-px",
        //                 "status": "Ack",
        //                 "lastExecTime": 1640819389454,
        //                 "lastQty": "0",
        //                 "lastPx": "0",
        //                 "avgFilledPx": "0",
        //                 "cumFilledQty": "0",
        //                 "fee": "0",
        //                 "cumFee": "0",
        //                 "feeAsset": "",
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

    async createReduceOnlyOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const request = {
            'execInst': 'reduceOnly',
        };
        return await this.createOrder (symbol, type, side, amount, price, this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const options = this.safeValue (this.options, 'fetchOrder', {});
        const accountCategories = this.safeValue (this.options, 'accountCategories', {});
        const accountCategory = this.safeString (accountCategories, type, 'cash');
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
        const accountCategories = this.safeValue (this.options, 'accountCategories', {});
        const accountCategory = this.safeString (accountCategories, type, 'cash');
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
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchCLosedOrders', market, params);
        const options = this.safeValue (this.options, 'fetchClosedOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'v1PrivateAccountGroupGetOrderHist');
        const method = this.getSupportedMapping (type, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupGetFuturesOrderHistCurrent',
        });
        const accountCategories = this.safeValue (this.options, 'accountCategories', {});
        const accountCategory = this.safeString (accountCategories, type, 'cash');
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
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const options = this.safeValue (this.options, 'cancelOrder', {});
        const accountCategories = this.safeValue (this.options, 'accountCategories', {});
        const accountCategory = this.safeString (accountCategories, type, 'cash');
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
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        const options = this.safeValue (this.options, 'cancelAllOrders', {});
        const accountCategories = this.safeValue (this.options, 'accountCategories', {});
        const accountCategory = this.safeString (accountCategories, type, 'cash');
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
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress returned more than one address, a chainName parameter is required, one of ' + chains);
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
        const request = {
            'txType': 'deposit',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'txType': 'withdrawal',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
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
        const id = this.safeString (transaction, 'requestId');
        const amount = this.safeNumber (transaction, 'amount');
        const destAddress = this.safeValue (transaction, 'destAddress', {});
        const address = this.safeString (destAddress, 'address');
        const tag = this.safeString (destAddress, 'destTag');
        const txid = this.safeString (transaction, 'networkTransactionId');
        const type = this.safeString (transaction, 'transactionType');
        const timestamp = this.safeInteger (transaction, 'time');
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeNumber (transaction, 'commission');
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': undefined,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
        };
        return await this.v2PrivateAccountGroupGetFuturesPosition (this.extend (request, params));
    }

    parseFundingRate (fundingRate, market = undefined) {
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
        const marketId = this.safeString (fundingRate, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const currentTime = this.safeInteger (fundingRate, 'time');
        const nextFundingRate = this.safeNumber (fundingRate, 'fundingRate');
        const nextFundingRateTimestamp = this.safeInteger (fundingRate, 'nextFundingTime');
        const previousFundingTimestamp = undefined;
        return {
            'info': fundingRate,
            'symbol': symbol,
            'markPrice': this.safeNumber (fundingRate, 'markPrice'),
            'indexPrice': this.safeNumber (fundingRate, 'indexPrice'),
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
            'previousFundingRate': undefined,
            'nextFundingRate': nextFundingRate,
            'previousFundingTimestamp': previousFundingTimestamp,
            'nextFundingTimestamp': nextFundingRateTimestamp,
            'previousFundingDatetime': this.iso8601 (previousFundingTimestamp),
            'nextFundingDatetime': this.iso8601 (nextFundingRateTimestamp),
        };
    }

    async fetchFundingRates (symbols, params = {}) {
        await this.loadMarkets ();
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
        amount = this.numberToString (amount);
        const request = {
            'account-group': accountGroup,
            'symbol': market['id'],
            'amount': amount,
        };
        const response = await this.v2PrivateAccountGroupPostFuturesIsolatedPositionMargin (this.extend (request, params));
        //
        // Can only change margin for perpetual futures isolated margin positions
        //
        //     {
        //          "code": 0
        //     }
        //
        const errorCode = this.safeString (response, 'code');
        const status = (errorCode === '0') ? 'ok' : 'failed';
        return {
            'info': response,
            'type': type,
            'amount': amount,
            'code': market['quote'],
            'symbol': market['symbol'],
            'status': status,
        };
    }

    async reduceMargin (symbol, amount, params = {}) {
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    async addMargin (symbol, amount, params = {}) {
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
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

    async setMarginMode (marginType, symbol = undefined, params = {}) {
        marginType = marginType.toLowerCase ();
        if (marginType === 'cross') {
            marginType = 'crossed';
        }
        if (marginType !== 'isolated' && marginType !== 'crossed') {
            throw new BadRequest (this.id + ' setMarginMode() marginType argument should be isolated or cross');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
            'symbol': market['id'],
            'marginType': marginType,
        };
        if (market['type'] !== 'future') {
            throw new BadSymbol (this.id + ' setMarginMode() supports futures contracts only');
        }
        return await this.v2PrivateAccountGroupPostFuturesMarginType (this.extend (request, params));
    }

    async fetchLeverageTiers (symbols = undefined, params = {}) {
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
        return this.parseLeverageTiers (data, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market = undefined) {
        /**
            @param info: Exchange market response for 1 market
            {
                "symbol":"BTC-PERP",
                "status":"Normal",
                "displayName":"BTCUSDT",
                "settlementAsset":"USDT",
                "underlying":"BTC/USDT",
                "tradingStartTime":1579701600000,
                "priceFilter":{"minPrice":"1","maxPrice":"1000000","tickSize":"1"},
                "lotSizeFilter":{"minQty":"0.0001","maxQty":"1000000000","lotSize":"0.0001"},
                "commissionType":"Quote",
                "commissionReserveRate":"0.001",
                "marketOrderPriceMarkup":"0.03",
                "marginRequirements":[
                    {"positionNotionalLowerBound":"0","positionNotionalUpperBound":"50000","initialMarginRate":"0.01","maintenanceMarginRate":"0.006"},
                    {"positionNotionalLowerBound":"50000","positionNotionalUpperBound":"200000","initialMarginRate":"0.02","maintenanceMarginRate":"0.012"},
                    {"positionNotionalLowerBound":"200000","positionNotionalUpperBound":"2000000","initialMarginRate":"0.04","maintenanceMarginRate":"0.024"},
                    {"positionNotionalLowerBound":"2000000","positionNotionalUpperBound":"20000000","initialMarginRate":"0.1","maintenanceMarginRate":"0.06"},
                    {"positionNotionalLowerBound":"20000000","positionNotionalUpperBound":"40000000","initialMarginRate":"0.2","maintenanceMarginRate":"0.12"},
                    {"positionNotionalLowerBound":"40000000","positionNotionalUpperBound":"1000000000","initialMarginRate":"0.333333","maintenanceMarginRate":"0.2"}
                ]
            }
            @param market: CCXT market
        */
        const marginRequirements = this.safeValue (info, 'marginRequirements');
        const id = this.safeString (info, 'symbol');
        market = this.safeMarket (id, market);
        const tiers = [];
        for (let i = 0; i < marginRequirements.length; i++) {
            const tier = marginRequirements[i];
            const initialMarginRate = this.safeString (tier, 'initialMarginRate');
            tiers.push ({
                'tier': this.sum (i, 1),
                'currency': market['quote'],
                'notionalFloor': this.safeNumber (tier, 'positionNotionalLowerBound'),
                'notionalCap': this.safeNumber (tier, 'positionNotionalUpperBound'),
                'maintenanceMarginRate': this.safeNumber (tier, 'maintenanceMarginRate'),
                'maxLeverage': this.parseNumber (Precise.stringDiv ('1', initialMarginRate)),
                'info': tier,
            });
        }
        return tiers;
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const currency = this.currency (code);
        amount = this.currencyToPrecision (code, amount);
        const accountCategories = this.safeValue (this.options, 'accountCategories', {});
        const fromId = this.safeString (accountCategories, fromAccount);
        const toId = this.safeString (accountCategories, toAccount);
        if (fromId === undefined) {
            const keys = Object.keys (accountCategories);
            throw new ExchangeError (this.id + ' fromAccount must be one of ' + keys.join (', '));
        }
        if (toId === undefined) {
            const keys = Object.keys (accountCategories);
            throw new ExchangeError (this.id + ' toAccount must be one of ' + keys.join (', '));
        }
        if (fromAccount !== 'spot' && toAccount !== 'spot') {
            throw new ExchangeError ('This exchange only supports direct balance transfer between spot and swap, spot and margin');
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
        const status = this.safeInteger (response, 'code');
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        const transfer = {
            'info': response,
            'status': this.parseTransferStatus (status),
        };
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['amount'] = amount;
            transfer['currency'] = code;
        }
        return transfer;
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
