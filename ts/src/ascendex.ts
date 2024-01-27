
//  ---------------------------------------------------------------------------

import Exchange from './abstract/ascendex.js';
import { ArgumentsRequired, AuthenticationError, ExchangeError, InsufficientFunds, InvalidOrder, BadSymbol, PermissionDenied, BadRequest, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { FundingHistory, Int, OHLCV, Order, OrderSide, OrderType, OrderRequest, Str, Trade, Balances, Transaction, Ticker, OrderBook, Tickers, Strings, Num, Currency, Market } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class ascendex
 * @augments Exchange
 */
export default class ascendex extends Exchange {
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
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createOrders': true,
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
                'fetchDepositsWithdrawals': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
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
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
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
                'fetchTransactions': 'emulated',
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
                            'risk-limit-info': 1,
                        },
                    },
                    'private': {
                        'data': {
                            'get': {
                                'order/hist': 1,
                            },
                        },
                        'get': {
                            'account/info': 1,
                        },
                        'accountGroup': {
                            'get': {
                                'order/hist': 1,
                                'futures/position': 1,
                                'futures/free-margin': 1,
                                'futures/order/hist/current': 1,
                                'futures/funding-payments': 1,
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
                    'method': 'v2PrivateDataGetOrderHist', // 'v1PrivateAccountCategoryGetOrderHistCurrent'
                },
                'defaultType': 'spot', // 'spot', 'margin', 'swap'
                'accountsByType': {
                    'spot': 'cash',
                    'swap': 'futures',
                    'margin': 'margin',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'networks': {
                    'BSC': 'BEP20 (BSC)',
                    'ARB': 'arbitrum',
                    'SOL': 'Solana',
                    'AVAX': 'avalanche C chain',
                    'OMNI': 'Omni',
                },
                'networksById': {
                    'BEP20 (BSC)': 'BSC',
                    'arbitrum': 'ARB',
                    'Solana': 'SOL',
                    'avalanche C chain': 'AVAX',
                    'Omni': 'OMNI',
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
         * @param {object} [params] extra parameters specific to the exchange API endpoint
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
            const marginInside = ('borrowAssetCode' in currency);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'margin': marginInside,
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
                'networks': {},
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name ascendex#fetchMarkets
         * @description retrieves data on all markets for ascendex
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
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
            let maxPrice: Num = undefined;
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
                'created': this.safeInteger (market, 'tradingStartTime'),
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
         * @param {object} [params] extra parameters specific to the exchange API endpoint
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
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
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

    parseBalance (response): Balances {
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

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name ascendex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://ascendex.github.io/ascendex-pro-api/#cash-account-balance
         * @see https://ascendex.github.io/ascendex-pro-api/#margin-account-balance
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#position
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let marketType = undefined;
        let marginMode = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBalance', params);
        const isMargin = this.safeValue (params, 'margin', false);
        const isCross = marginMode === 'cross';
        marketType = (isMargin || isCross) ? 'margin' : marketType;
        params = this.omit (params, 'margin');
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, marketType, 'cash');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
        };
        if ((marginMode === 'isolated') && (marketType !== 'swap')) {
            throw new BadRequest (this.id + ' does not supported isolated margin trading');
        }
        if ((accountCategory === 'cash') || (accountCategory === 'margin')) {
            request['account-category'] = accountCategory;
        }
        let response = undefined;
        if ((marketType === 'spot') || (marketType === 'margin')) {
            response = await this.v1PrivateAccountCategoryGetBalance (this.extend (request, params));
        } else if (marketType === 'swap') {
            response = await this.v2PrivateAccountGroupGetFuturesPosition (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchBalance() is not currently supported for ' + marketType + ' markets');
        }
        //
        // cash
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "asset": "BCHSV",
        //                 "totalBalance": "64.298000048",
        //                 "availableBalance": "64.298000048",
        //             },
        //         ]
        //     }
        //
        // margin
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "asset": "BCHSV",
        //                 "totalBalance": "64.298000048",
        //                 "availableBalance": "64.298000048",
        //                 "borrowed": "0",
        //                 "interest": "0",
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

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name ascendex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
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

    parseTicker (ticker, market: Market = undefined): Ticker {
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

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name ascendex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
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

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name ascendex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://ascendex.github.io/ascendex-pro-api/#ticker
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
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

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
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

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name ascendex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
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

    parseTrade (trade, market: Market = undefined): Trade {
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

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name ascendex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://ascendex.github.io/ascendex-pro-api/#market-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
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

    parseOrder (order, market: Market = undefined): Order {
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
        //         "orderId": "a173ad938fc3U22666567717788c3b66",   // orderId
        //         "seqNum": 18777366360,                           // sequence number
        //         "accountId": "cshwSjbpPjSwHmxPdz2CPQVU9mnbzPpt", // accountId
        //         "symbol": "BTC/USDT",                            // symbol
        //         "orderType": "Limit",                            // order type (Limit/Market/StopMarket/StopLimit)
        //         "side": "Sell",                                  // order side (Buy/Sell)
        //         "price": "11346.77",                             // order price
        //         "stopPrice": "0",                                // stop price (0 by default)
        //         "orderQty": "0.01",                              // order quantity (in base asset)
        //         "status": "Canceled",                            // order status (Filled/Canceled/Rejected)
        //         "createTime": 1596344995793,                     // order creation time
        //         "lastExecTime": 1596344996053,                   // last execution time
        //         "avgFillPrice": "11346.77",                      // average filled price
        //         "fillQty": "0.01",                               // filled quantity (in base asset)
        //         "fee": "-0.004992579",                           // cummulative fee. if negative, this value is the commission charged; if possitive, this value is the rebate received.
        //         "feeAsset": "USDT"                               // fee asset
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
        const filled = this.safeStringN (order, [ 'cumFilledQty', 'cumQty', 'fillQty' ]);
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
        const feeCost = this.safeNumber2 (order, 'cumFee', 'fee');
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
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
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
        //         "code": "0",
        //         "data": {
        //           "domain": "spot",
        //           "userUID": "U1479576458",
        //           "vipLevel": "0",
        //           "fees": [
        //             { symbol: 'HT/USDT', fee: { taker: '0.001', maker: "0.001" } },
        //             { symbol: 'LAMB/BTC', fee: { taker: '0.002', maker: "0.002" } },
        //             { symbol: 'STOS/USDT', fee: { taker: '0.002', maker: "0.002" } },
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

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name ascendex#createOrderRequest
         * @description helper function to build request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
         * @param {bool} [params.postOnly] true or false
         * @param {float} [params.stopPrice] the price at which a trigger order is triggered at
         * @returns {object} request to be sent to the exchange
         */
        const market = this.market (symbol);
        let marginMode = undefined;
        let marketType = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('createOrderRequest', params);
        [ marketType, params ] = this.handleMarketTypeAndParams ('createOrderRequest', market, params);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        let accountCategory = this.safeString (accountsByType, marketType, 'cash');
        if (marginMode !== undefined) {
            accountCategory = 'margin';
        }
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
        if (market['spot']) {
            if (accountCategory !== undefined) {
                request['category'] = accountCategory;
            }
        } else {
            request['account-category'] = accountCategory;
            if (reduceOnly) {
                request['execInst'] = 'ReduceOnly';
            }
            if (postOnly) {
                request['execInst'] = 'Post';
            }
        }
        params = this.omit (params, [ 'reduceOnly', 'triggerPrice' ]);
        return this.extend (request, params);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#createOrder
         * @description create a trade order on the exchange
         * @see https://ascendex.github.io/ascendex-pro-api/#place-order
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#new-order
         * @param {string} symbol unified CCXT market symbol
         * @param {string} type "limit" or "market"
         * @param {string} side "buy" or "sell"
         * @param {float} amount the amount of currency to trade
         * @param {float} [price] *ignored in "market" orders* the price at which the order is to be fullfilled at in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
         * @param {bool} [params.postOnly] true or false
         * @param {float} [params.stopPrice] the price at which a trigger order is triggered at
         * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered (perpetual swap markets only)
         * @param {float} [params.takeProfit.triggerPrice] *swap only* take profit trigger price
         * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered (perpetual swap markets only)
         * @param {float} [params.stopLoss.triggerPrice] *swap only* stop loss trigger price
         * @returns [An order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['swap']) {
            response = await this.v2PrivateAccountGroupPostFuturesOrder (request);
        } else {
            response = await this.v1PrivateAccountCategoryPostOrder (request);
        }
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

    async createOrders (orders: OrderRequest[], params = {}) {
        /**
         * @method
         * @name ascendex#createOrders
         * @description create a list of trade orders
         * @see https://ascendex.github.io/ascendex-pro-api/#place-batch-orders
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#place-batch-orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
         * @param {bool} [params.postOnly] true or false
         * @param {float} [params.stopPrice] the price at which a trigger order is triggered at
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const ordersRequests = [];
        let symbol = undefined;
        let marginMode = undefined;
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString (rawOrder, 'symbol');
            if (symbol === undefined) {
                symbol = marketId;
            } else {
                if (symbol !== marketId) {
                    throw new BadRequest (this.id + ' createOrders() requires all orders to have the same symbol');
                }
            }
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'amount');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeValue (rawOrder, 'params', {});
            const marginResult = this.handleMarginModeAndParams ('createOrders', orderParams);
            const currentMarginMode = marginResult[0];
            if (currentMarginMode !== undefined) {
                if (marginMode === undefined) {
                    marginMode = currentMarginMode;
                } else {
                    if (marginMode !== currentMarginMode) {
                        throw new BadRequest (this.id + ' createOrders() requires all orders to have the same margin mode (isolated or cross)');
                    }
                }
            }
            const orderRequest = this.createOrderRequest (marketId, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        const market = this.market (symbol);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        let accountCategory = this.safeString (accountsByType, market['type'], 'cash');
        if (marginMode !== undefined) {
            accountCategory = 'margin';
        }
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {};
        let response = undefined;
        if (market['swap']) {
            throw new NotSupported (this.id + ' createOrders() is not currently supported for swap markets on ascendex');
            // request['account-group'] = accountGroup;
            // request['category'] = accountCategory;
            // request['orders'] = ordersRequests;
            // response = await this.v2PrivateAccountGroupPostFuturesOrderBatch (request);
        } else {
            request['account-group'] = accountGroup;
            request['account-category'] = accountCategory;
            request['orders'] = ordersRequests;
            response = await this.v1PrivateAccountCategoryPostOrderBatch (request);
        }
        //
        // spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "accountId": "cshdAKBO43TKIh2kJtq7FVVb42KIePyS",
        //             "ac": "CASH",
        //             "action": "batch-place-order",
        //             "status": "Ack",
        //             "info": [
        //                 {
        //                     "symbol": "BTC/USDT",
        //                     "orderType": "Limit",
        //                     "timestamp": 1699326589344,
        //                     "id": "",
        //                     "orderId": "a18ba7c1f6efU0711043490p3HvjjN5x"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const info = this.safeValue (data, 'info', []);
        return this.parseOrders (info, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://ascendex.github.io/ascendex-pro-api/#query-order
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#query-order-by-id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, type, 'cash');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'orderId': id,
        };
        let response = undefined;
        if ((type === 'spot') || (type === 'margin')) {
            response = await this.v1PrivateAccountCategoryGetOrderStatus (this.extend (request, query));
        } else if (type === 'swap') {
            request['account-category'] = accountCategory;
            response = await this.v2PrivateAccountGroupGetFuturesOrderStatus (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' fetchOrder() is not currently supported for ' + type + ' markets');
        }
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

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name ascendex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://ascendex.github.io/ascendex-pro-api/#list-open-orders
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#list-open-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
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
        let response = undefined;
        if ((type === 'spot') || (type === 'margin')) {
            response = await this.v1PrivateAccountCategoryGetOrderOpen (this.extend (request, query));
        } else if (type === 'swap') {
            request['account-category'] = accountCategory;
            response = await this.v2PrivateAccountGroupGetFuturesOrderOpen (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' fetchOpenOrders() is not currently supported for ' + type + ' markets');
        }
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
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit) as Order[];
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name ascendex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://ascendex.github.io/ascendex-pro-api/#list-history-orders-v2
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#list-current-history-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
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
        const defaultMethod = this.safeString (options, 'method', 'v2PrivateDataGetOrderHist');
        const method = this.getSupportedMapping (type, {
            'spot': defaultMethod,
            'margin': defaultMethod,
            'swap': 'v2PrivateAccountGroupGetFuturesOrderHistCurrent',
        });
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeString (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const accountCategory = this.safeString (accountsByType, type, 'cash'); // margin, futures
        let response = undefined;
        if (method === 'v1PrivateAccountCategoryGetOrderHistCurrent') {
            request['account-group'] = accountGroup;
            request['account-category'] = accountCategory;
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.v1PrivateAccountCategoryGetOrderHistCurrent (this.extend (request, query));
        } else if (method === 'v2PrivateDataGetOrderHist') {
            request['account'] = accountCategory;
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.v2PrivateDataGetOrderHist (this.extend (request, query));
        } else if (method === 'v2PrivateAccountGroupGetFuturesOrderHistCurrent') {
            request['account-group'] = accountGroup;
            request['account-category'] = accountCategory;
            if (limit !== undefined) {
                request['pageSize'] = limit;
            }
            response = await this.v2PrivateAccountGroupGetFuturesOrderHistCurrent (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' fetchClosedOrders() is not currently supported for ' + type + ' markets');
        }
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
        //    {
        //        "code": 0,
        //        "data": [
        //            {
        //                "orderId"     :  "a173ad938fc3U22666567717788c3b66", // orderId
        //                "seqNum"      :  18777366360,                        // sequence number
        //                "accountId"   :  "cshwSjbpPjSwHmxPdz2CPQVU9mnbzPpt", // accountId
        //                "symbol"      :  "BTC/USDT",                         // symbol
        //                "orderType"   :  "Limit",                            // order type (Limit/Market/StopMarket/StopLimit)
        //                "side"        :  "Sell",                             // order side (Buy/Sell)
        //                "price"       :  "11346.77",                         // order price
        //                "stopPrice"   :  "0",                                // stop price (0 by default)
        //                "orderQty"    :  "0.01",                             // order quantity (in base asset)
        //                "status"      :  "Canceled",                         // order status (Filled/Canceled/Rejected)
        //                "createTime"  :  1596344995793,                      // order creation time
        //                "lastExecTime":  1596344996053,                      // last execution time
        //                "avgFillPrice":  "11346.77",                         // average filled price
        //                "fillQty"     :  "0.01",                             // filled quantity (in base asset)
        //                "fee"         :  "-0.004992579",                     // cummulative fee. if negative, this value is the commission charged; if possitive, this value is the rebate received.
        //                "feeAsset"    :  "USDT"                              // fee asset
        //            }
        //        ]
        //    }
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

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#cancelOrder
         * @description cancels an open order
         * @see https://ascendex.github.io/ascendex-pro-api/#cancel-order
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
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
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'id');
        if (clientOrderId === undefined) {
            request['orderId'] = id;
        } else {
            request['id'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'id' ]);
        }
        let response = undefined;
        if ((type === 'spot') || (type === 'margin')) {
            response = await this.v1PrivateAccountCategoryDeleteOrder (this.extend (request, query));
        } else if (type === 'swap') {
            request['account-category'] = accountCategory;
            response = await this.v2PrivateAccountGroupDeleteFuturesOrder (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' cancelOrder() is not currently supported for ' + type + ' markets');
        }
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

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#cancelAllOrders
         * @description cancel all open orders
         * @see https://ascendex.github.io/ascendex-pro-api/#cancel-all-orders
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#cancel-all-open-orders
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
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
        let response = undefined;
        if ((type === 'spot') || (type === 'margin')) {
            response = await this.v1PrivateAccountCategoryDeleteOrderAll (this.extend (request, query));
        } else if (type === 'swap') {
            request['account-category'] = accountCategory;
            response = await this.v2PrivateAccountGroupDeleteFuturesOrderAll (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' cancelAllOrders() is not currently supported for ' + type + ' markets');
        }
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

    parseDepositAddress (depositAddress, currency: Currency = undefined) {
        //
        //     {
        //         "address": "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722",
        //         "destTag": "",
        //         "tagType": "",
        //         "tagId": "",
        //         "chainName": "ERC20",
        //         "numConfirmations": 20,
        //         "withdrawalFee": 1,
        //         "nativeScale": 4,
        //         "tips": []
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

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name ascendex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
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

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name ascendex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {
            'txType': 'deposit',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name ascendex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {
            'txType': 'withdrawal',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name ascendex#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
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
        //         "code": 0,
        //         "data": {
        //             "data": [
        //                 {
        //                     "requestId": "wuzd1Ojsqtz4bCA3UXwtUnnJDmU8PiyB",
        //                     "time": 1591606166000,
        //                     "asset": "USDT",
        //                     "transactionType": "deposit",
        //                     "amount": "25",
        //                     "commission": "0",
        //                     "networkTransactionId": "0xbc4eabdce92f14dbcc01d799a5f8ca1f02f4a3a804b6350ea202be4d3c738fce",
        //                     "status": "pending",
        //                     "numConfirmed": 8,
        //                     "numConfirmations": 20,
        //                     "destAddress": { address: "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722" }
        //                 }
        //             ],
        //             "page": 1,
        //             "pageSize": 20,
        //             "hasNext": false
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

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "requestId": "wuzd1Ojsqtz4bCA3UXwtUnnJDmU8PiyB",
        //         "time": 1591606166000,
        //         "asset": "USDT",
        //         "transactionType": "deposit",
        //         "amount": "25",
        //         "commission": "0",
        //         "networkTransactionId": "0xbc4eabdce92f14dbcc01d799a5f8ca1f02f4a3a804b6350ea202be4d3c738fce",
        //         "status": "pending",
        //         "numConfirmed": 8,
        //         "numConfirmations": 20,
        //         "destAddress": {
        //             "address": "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722",
        //             "destTag": "..." // for currencies that have it
        //         }
        //     }
        //
        const destAddress = this.safeValue (transaction, 'destAddress', {});
        const address = this.safeString (destAddress, 'address');
        const tag = this.safeString (destAddress, 'destTag');
        const timestamp = this.safeInteger (transaction, 'time');
        const currencyId = this.safeString (transaction, 'asset');
        let amountString = this.safeString (transaction, 'amount');
        const feeCostString = this.safeString (transaction, 'commission');
        amountString = Precise.stringSub (amountString, feeCostString);
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'requestId'),
            'txid': this.safeString (transaction, 'networkTransactionId'),
            'type': this.safeString (transaction, 'transactionType'),
            'currency': code,
            'network': undefined,
            'amount': this.parseNumber (amountString),
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
                'cost': this.parseNumber (feeCostString),
                'rate': undefined,
            },
            'internal': false,
        };
    }

    async fetchPositions (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchPositions
         * @description fetch all open positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
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
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    parsePosition (position, market: Market = undefined) {
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
        let notional = this.safeString (position, 'buyOpenOrderNotional');
        if (Precise.stringEq (notional, '0')) {
            notional = this.safeString (position, 'sellOpenOrderNotional');
        }
        const marginMode = this.safeString (position, 'marginType');
        let collateral = undefined;
        if (marginMode === 'isolated') {
            collateral = this.safeString (position, 'isolatedMargin');
        }
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'notional': this.parseNumber (notional),
            'marginMode': marginMode,
            'liquidationPrice': undefined,
            'entryPrice': this.safeNumber (position, 'avgOpenPrice'),
            'unrealizedPnl': this.safeNumber (position, 'unrealizedPnl'),
            'percentage': undefined,
            'contracts': this.safeNumber (position, 'position'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'lastPrice': undefined,
            'side': this.safeStringLower (position, 'side'),
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': collateral,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': this.safeInteger (position, 'leverage'),
            'marginRatio': undefined,
            'stopLossPrice': this.safeNumber (position, 'stopLossPrice'),
            'takeProfitPrice': this.safeNumber (position, 'takeProfitPrice'),
        });
    }

    parseFundingRate (contract, market: Market = undefined) {
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

    async fetchFundingRates (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
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

    async modifyMarginHelper (symbol: string, amount, type, params = {}) {
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

    parseMarginModification (data, market: Market = undefined) {
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

    async reduceMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name ascendex#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, -amount, 'reduce', params);
    }

    async addMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name ascendex#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async setLeverage (leverage, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#setLeverage
         * @description set the level of leverage for a market
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#change-contract-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
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
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' setLeverage() supports swap contracts only');
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

    async setMarginMode (marginMode, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#change-margin-type
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
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
            'marginType': marginMode,
        };
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' setMarginMode() supports swap contracts only');
        }
        return await this.v2PrivateAccountGroupPostFuturesMarginType (this.extend (request, params));
    }

    async fetchLeverageTiers (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
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

    parseMarketLeverageTiers (info, market: Market = undefined) {
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

    parseDepositWithdrawFee (fee, currency: Currency = undefined) {
        //
        // {
        //     "assetCode":      "USDT",
        //     "assetName":      "Tether",
        //     "precisionScale":  9,
        //     "nativeScale":     4,
        //     "blockChain": [
        //         {
        //             "chainName":        "Omni",
        //             "withdrawFee":      "30.0",
        //             "allowDeposit":      true,
        //             "allowWithdraw":     true,
        //             "minDepositAmt":    "0.0",
        //             "minWithdrawal":    "50.0",
        //             "numConfirmations":  3
        //         },
        //     ]
        // }
        //
        const blockChains = this.safeValue (fee, 'blockChain', []);
        const blockChainsLength = blockChains.length;
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
        for (let i = 0; i < blockChainsLength; i++) {
            const blockChain = blockChains[i];
            const networkId = this.safeString (blockChain, 'chainName');
            const currencyCode = this.safeString (currency, 'code');
            const networkCode = this.networkIdToCode (networkId, currencyCode);
            result['networks'][networkCode] = {
                'deposit': { 'fee': undefined, 'percentage': undefined },
                'withdraw': { 'fee': this.safeNumber (blockChain, 'withdrawFee'), 'percentage': false },
            };
            if (blockChainsLength === 1) {
                result['withdraw']['fee'] = this.safeNumber (blockChain, 'withdrawFee');
                result['withdraw']['percentage'] = false;
            }
        }
        return result;
    }

    async fetchDepositWithdrawFees (codes: Strings = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://ascendex.github.io/ascendex-pro-api/#list-all-assets
         * @param {string[]|undefined} codes list of unified currency codes
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.v2PublicGetAssets (params);
        const data = this.safeValue (response, 'data');
        return this.parseDepositWithdrawFees (data, codes, 'assetCode');
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name ascendex#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
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
            throw new ExchangeError (this.id + ' transfer() only supports direct balance transfer between spot and swap, spot and margin');
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
        //    { "code": "0" }
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

    parseTransfer (transfer, currency: Currency = undefined) {
        //
        //    { "code": "0" }
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

    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name ascendex#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#funding-payment-history
         * @param {string} [symbol] unified market symbol
         * @param {int} [since] the earliest time in ms to fetch funding history for
         * @param {int} [limit] the maximum number of funding history structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchFundingHistory', symbol, since, limit, params, 'page', 25) as FundingHistory[];
        }
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.v2PrivateAccountGroupGetFuturesFundingPayments (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "data": [
        //                 {
        //                     "timestamp": 1640476800000,
        //                     "symbol": "BTC-PERP",
        //                     "paymentInUSDT": "-0.013991178",
        //                     "fundingRate": "0.000173497"
        //                 },
        //             ],
        //             "page": 1,
        //             "pageSize": 3,
        //             "hasNext": true
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeValue (data, 'data', []);
        return this.parseIncomes (rows, market, since, limit);
    }

    parseIncome (income, market: Market = undefined) {
        //
        //     {
        //         "timestamp": 1640476800000,
        //         "symbol": "BTC-PERP",
        //         "paymentInUSDT": "-0.013991178",
        //         "fundingRate": "0.000173497"
        //     }
        //
        const marketId = this.safeString (income, 'symbol');
        const timestamp = this.safeInteger (income, 'timestamp');
        return {
            'info': income,
            'symbol': this.safeSymbol (marketId, market, '-', 'swap'),
            'code': 'USDT',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': undefined,
            'amount': this.safeNumber (income, 'paymentInUSDT'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = api[0];
        const access = api[1];
        const type = this.safeString (api as any, 2);
        let url = '';
        const accountCategory = (type === 'accountCategory');
        if (accountCategory || (type === 'accountGroup')) {
            url += this.implodeParams ('/{account-group}', params);
            params = this.omit (params, 'account-group');
        }
        let request = this.implodeParams (path, params);
        url += '/api/pro/';
        if (version === 'v2') {
            if (type === 'data') {
                request = 'data/' + version + '/' + request;
            } else {
                request = version + '/' + request;
            }
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
            const hmac = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'base64');
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
            return undefined; // fallback to default error handler
        }
        //
        //     {"code": 6010, "message": "Not enough balance."}
        //     {"code": 60060, "message": "The order is already filled or canceled."}
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
        return undefined;
    }
}
