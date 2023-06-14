'use strict';

var cryptocom$1 = require('./abstract/cryptocom.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
class cryptocom extends cryptocom$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'cryptocom',
            'name': 'Crypto.com',
            'countries': ['MT'],
            'version': 'v2',
            'rateLimit': 10,
            'certified': true,
            'pro': true,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'borrowMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': true,
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'repayMargin': true,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg',
                'test': {
                    'v1': 'https://uat-api.3ona.co/exchange/v1',
                    'v2': 'https://uat-api.3ona.co/v2',
                    'derivatives': 'https://uat-api.3ona.co/v2',
                },
                'api': {
                    'v1': 'https://api.crypto.com/exchange/v1',
                    'v2': 'https://api.crypto.com/v2',
                    'derivatives': 'https://deriv-api.crypto.com/v1',
                },
                'www': 'https://crypto.com/',
                'referral': 'https://crypto.com/exch/5835vstech',
                'doc': [
                    'https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html',
                    'https://exchange-docs.crypto.com/spot/index.html',
                    'https://exchange-docs.crypto.com/derivatives/index.html',
                ],
                'fees': 'https://crypto.com/exchange/document/fees-limits',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'public/auth': 10 / 3,
                            'public/get-instruments': 10 / 3,
                            'public/get-book': 1,
                            'public/get-candlestick': 1,
                            'public/get-trades': 1,
                            'public/get-tickers': 1,
                            'public/get-valuations': 1,
                            'public/get-expired-settlement-price': 10 / 3,
                            'public/get-insurance': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'private/set-cancel-on-disconnect': 10 / 3,
                            'private/get-cancel-on-disconnect': 10 / 3,
                            'private/user-balance': 10 / 3,
                            'private/user-balance-history': 10 / 3,
                            'private/get-positions': 10 / 3,
                            'private/create-order': 2 / 3,
                            'private/create-order-list': 10 / 3,
                            'private/cancel-order': 2 / 3,
                            'private/cancel-order-list': 10 / 3,
                            'private/cancel-all-orders': 2 / 3,
                            'private/close-position': 10 / 3,
                            'private/get-order-history': 100,
                            'private/get-open-orders': 10 / 3,
                            'private/get-order-detail': 1 / 3,
                            'private/get-trades': 100,
                            'private/change-account-leverage': 10 / 3,
                            'private/get-transactions': 10 / 3,
                            'private/create-subaccount-transfer': 10 / 3,
                            'private/get-subaccount-balances': 10 / 3,
                            'private/get-order-list': 10 / 3,
                            'private/create-withdrawal': 10 / 3,
                            'private/get-currency-networks': 10 / 3,
                            'private/get-deposit-address': 10 / 3,
                            'private/get-accounts': 10 / 3,
                        },
                    },
                },
                'v2': {
                    'public': {
                        'get': {
                            'public/auth': 1,
                            'public/get-instruments': 1,
                            'public/get-book': 1,
                            'public/get-candlestick': 1,
                            'public/get-ticker': 1,
                            'public/get-trades': 1,
                            'public/margin/get-transfer-currencies': 1,
                            'public/margin/get-load-currenices': 1,
                            'public/respond-heartbeat': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'private/set-cancel-on-disconnect': 10 / 3,
                            'private/get-cancel-on-disconnect': 10 / 3,
                            'private/create-withdrawal': 10 / 3,
                            'private/get-withdrawal-history': 10 / 3,
                            'private/get-currency-networks': 10 / 3,
                            'private/get-deposit-history': 10 / 3,
                            'private/get-deposit-address': 10 / 3,
                            'private/get-account-summary': 10 / 3,
                            'private/create-order': 2 / 3,
                            'private/cancel-order': 2 / 3,
                            'private/cancel-all-orders': 2 / 3,
                            'private/create-order-list': 10 / 3,
                            'private/get-order-history': 10 / 3,
                            'private/get-open-orders': 10 / 3,
                            'private/get-order-detail': 1 / 3,
                            'private/get-trades': 100,
                            'private/margin/get-user-config': 10 / 3,
                            'private/margin/get-account-summary': 10 / 3,
                            'private/margin/transfer': 10 / 3,
                            'private/margin/borrow': 10 / 3,
                            'private/margin/repay': 10 / 3,
                            'private/margin/get-transfer-history': 10 / 3,
                            'private/margin/get-borrow-history': 10 / 3,
                            'private/margin/get-interest-history': 10 / 3,
                            'private/margin/get-repay-history': 10 / 3,
                            'private/margin/get-liquidation-history': 10 / 3,
                            'private/margin/get-liquidation-orders': 10 / 3,
                            'private/margin/create-order': 2 / 3,
                            'private/margin/cancel-order': 2 / 3,
                            'private/margin/cancel-all-orders': 2 / 3,
                            'private/margin/get-order-history': 10 / 3,
                            'private/margin/get-open-orders': 10 / 3,
                            'private/margin/get-order-detail': 1 / 3,
                            'private/margin/get-trades': 100,
                            'private/deriv/transfer': 10 / 3,
                            'private/deriv/get-transfer-history': 10 / 3,
                            'private/get-accounts': 10 / 3,
                            'private/get-subaccount-balances': 10 / 3,
                            'private/create-subaccount-transfer': 10 / 3,
                            'private/otc/get-otc-user': 10 / 3,
                            'private/otc/get-instruments': 10 / 3,
                            'private/otc/request-quote': 100,
                            'private/otc/accept-quote': 100,
                            'private/otc/get-quote-history': 10 / 3,
                            'private/otc/get-trade-history': 10 / 3,
                        },
                    },
                },
                'derivatives': {
                    'public': {
                        'get': {
                            'public/auth': 10 / 3,
                            'public/get-instruments': 10 / 3,
                            'public/get-book': 1,
                            'public/get-candlestick': 1,
                            'public/get-trades': 1,
                            'public/get-tickers': 1,
                            'public/get-valuations': 1,
                            'public/get-expired-settlement-price': 10 / 3,
                            'public/get-insurance': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'private/set-cancel-on-disconnect': 10 / 3,
                            'private/get-cancel-on-disconnect': 10 / 3,
                            'private/user-balance': 10 / 3,
                            'private/user-balance-history': 10 / 3,
                            'private/get-positions': 10 / 3,
                            'private/create-order': 2 / 3,
                            'private/create-order-list': 10 / 3,
                            'private/cancel-order': 2 / 3,
                            'private/cancel-order-list': 10 / 3,
                            'private/cancel-all-orders': 2 / 3,
                            'private/close-position': 10 / 3,
                            'private/convert-collateral': 10 / 3,
                            'private/get-order-history': 100,
                            'private/get-open-orders': 10 / 3,
                            'private/get-order-detail': 1 / 3,
                            'private/get-trades': 100,
                            'private/change-account-leverage': 10 / 3,
                            'private/get-transactions': 10 / 3,
                            'private/create-subaccount-transfer': 10 / 3,
                            'private/get-subaccount-balances': 10 / 3,
                            'private/get-order-list': 10 / 3,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber('0.004'),
                    'taker': this.parseNumber('0.004'),
                    'tiers': {
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.004')],
                            [this.parseNumber('25000'), this.parseNumber('0.0035')],
                            [this.parseNumber('50000'), this.parseNumber('0.0015')],
                            [this.parseNumber('100000'), this.parseNumber('0.001')],
                            [this.parseNumber('250000'), this.parseNumber('0.0009')],
                            [this.parseNumber('1000000'), this.parseNumber('0.0008')],
                            [this.parseNumber('20000000'), this.parseNumber('0.0007')],
                            [this.parseNumber('100000000'), this.parseNumber('0.0006')],
                            [this.parseNumber('200000000'), this.parseNumber('0.0004')],
                        ],
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.004')],
                            [this.parseNumber('25000'), this.parseNumber('0.0035')],
                            [this.parseNumber('50000'), this.parseNumber('0.0025')],
                            [this.parseNumber('100000'), this.parseNumber('0.0016')],
                            [this.parseNumber('250000'), this.parseNumber('0.00015')],
                            [this.parseNumber('1000000'), this.parseNumber('0.00014')],
                            [this.parseNumber('20000000'), this.parseNumber('0.00013')],
                            [this.parseNumber('100000000'), this.parseNumber('0.00012')],
                            [this.parseNumber('200000000'), this.parseNumber('0.0001')],
                        ],
                    },
                },
            },
            'options': {
                'defaultType': 'spot',
                'accountsById': {
                    'funding': 'SPOT',
                    'spot': 'SPOT',
                    'margin': 'MARGIN',
                    'derivatives': 'DERIVATIVES',
                    'swap': 'DERIVATIVES',
                    'future': 'DERIVATIVES',
                },
                'networks': {
                    'BEP20': 'BSC',
                    'ERC20': 'ETH',
                    'TRX': 'TRON',
                    'TRC20': 'TRON',
                },
                'networksById': {
                    'BSC': 'BEP20',
                    'ETH': 'ERC20',
                    'TRON': 'TRC20',
                },
                'broker': 'CCXT_',
            },
            // https://exchange-docs.crypto.com/spot/index.html#response-and-reason-codes
            'commonCurrencies': {
                'USD_STABLE_COIN': 'USDC',
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    '10001': errors.ExchangeError,
                    '10002': errors.PermissionDenied,
                    '10003': errors.PermissionDenied,
                    '10004': errors.BadRequest,
                    '10005': errors.PermissionDenied,
                    '10006': errors.DDoSProtection,
                    '10007': errors.InvalidNonce,
                    '10008': errors.BadRequest,
                    '10009': errors.BadRequest,
                    '20001': errors.BadRequest,
                    '20002': errors.InsufficientFunds,
                    '20005': errors.AccountNotEnabled,
                    '30003': errors.BadSymbol,
                    '30004': errors.BadRequest,
                    '30005': errors.BadRequest,
                    '30006': errors.InvalidOrder,
                    '30007': errors.InvalidOrder,
                    '30008': errors.InvalidOrder,
                    '30009': errors.InvalidOrder,
                    '30010': errors.BadRequest,
                    '30013': errors.InvalidOrder,
                    '30014': errors.InvalidOrder,
                    '30016': errors.InvalidOrder,
                    '30017': errors.InvalidOrder,
                    '30023': errors.InvalidOrder,
                    '30024': errors.InvalidOrder,
                    '30025': errors.InvalidOrder,
                    '40001': errors.BadRequest,
                    '40002': errors.BadRequest,
                    '40003': errors.BadRequest,
                    '40004': errors.BadRequest,
                    '40005': errors.BadRequest,
                    '40006': errors.BadRequest,
                    '40007': errors.BadRequest,
                    '40101': errors.AuthenticationError,
                    '50001': errors.BadRequest,
                    '9010001': errors.OnMaintenance, // {"code":9010001,"message":"SYSTEM_MAINTENANCE","details":"Crypto.com Exchange is currently under maintenance. Please refer to https://status.crypto.com for more details."}
                },
            },
        });
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name cryptocom#fetchMarkets
         * @see https://exchange-docs.crypto.com/spot/index.html#public-get-instruments
         * @see https://exchange-docs.crypto.com/derivatives/index.html#public-get-instruments
         * @description retrieves data on all markets for cryptocom
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        let promises = [this.fetchSpotMarkets(params), this.fetchDerivativesMarkets(params)];
        // @ts-ignore
        promises = await Promise.all(promises);
        const spotMarkets = promises[0];
        const derivativeMarkets = promises[1];
        const markets = this.arrayConcat(spotMarkets, derivativeMarkets);
        return markets;
    }
    async fetchSpotMarkets(params = {}) {
        const response = await this.v2PublicGetPublicGetInstruments(params);
        //
        //    {
        //        id: 11,
        //        method: 'public/get-instruments',
        //        code: 0,
        //        result: {
        //            'instruments': [
        //                {
        //                    instrument_name: 'NEAR_BTC',
        //                    quote_currency: 'BTC',
        //                    base_currency: 'NEAR',
        //                    price_decimals: '8',
        //                    quantity_decimals: '2',
        //                    margin_trading_enabled: true,
        //                    margin_trading_enabled_5x: true,
        //                    margin_trading_enabled_10x: true,
        //                    max_quantity: '100000000',
        //                    min_quantity: '0.01',
        //                    max_price:'1',
        //                    min_price:'0.00000001',
        //                    last_update_date:1667263094857,
        //                    quantity_tick_size:'0.1',
        //                    price_tick_size:'0.00000001'
        //               },
        //            ]
        //        }
        //    }
        //
        const resultResponse = this.safeValue(response, 'result', {});
        const markets = this.safeValue(resultResponse, 'instruments', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString(market, 'instrument_name');
            const baseId = this.safeString(market, 'base_currency');
            const quoteId = this.safeString(market, 'quote_currency');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const minPrice = this.safeString(market, 'min_price');
            const minQuantity = this.safeString(market, 'min_quantity');
            let maxLeverage = this.parseNumber('1');
            const margin_trading_enabled_5x = this.safeValue(market, 'margin_trading_enabled_5x');
            if (margin_trading_enabled_5x) {
                maxLeverage = this.parseNumber('5');
            }
            const margin_trading_enabled_10x = this.safeValue(market, 'margin_trading_enabled_10x');
            if (margin_trading_enabled_10x) {
                maxLeverage = this.parseNumber('10');
            }
            result.push({
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
                'margin': this.safeValue(market, 'margin_trading_enabled'),
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber(market, 'quantity_tick_size'),
                    'price': this.safeNumber(market, 'price_tick_size'),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber('1'),
                        'max': maxLeverage,
                    },
                    'amount': {
                        'min': this.parseNumber(minQuantity),
                        'max': this.safeNumber(market, 'max_quantity'),
                    },
                    'price': {
                        'min': this.parseNumber(minPrice),
                        'max': this.safeNumber(market, 'max_price'),
                    },
                    'cost': {
                        'min': this.parseNumber(Precise["default"].stringMul(minQuantity, minPrice)),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }
    async fetchDerivativesMarkets(params = {}) {
        const result = [];
        const futuresResponse = await this.derivativesPublicGetPublicGetInstruments();
        //
        //     {
        //       id: -1,
        //       method: 'public/get-instruments',
        //       code: 0,
        //       result: {
        //         data: [
        //           {
        //             symbol: '1INCHUSD-PERP',
        //             inst_type: 'PERPETUAL_SWAP',
        //             display_name: '1INCHUSD Perpetual',
        //             base_ccy: '1INCH',
        //             quote_ccy: 'USD_Stable_Coin',
        //             quote_decimals: 4,
        //             quantity_decimals: 0,
        //             price_tick_size: '0.0001',
        //             qty_tick_size: '1',
        //             max_leverage: '50',
        //             tradable: true,
        //             expiry_timestamp_ms: 0,
        //             beta_product: false,
        //             underlying_symbol: '1INCHUSD-INDEX',
        //             put_call: 'UNDEFINED',
        //             strike: '0',
        //             contract_size: '1'
        //           },
        //         ]
        //       }
        //     }
        //
        const futuresResult = this.safeValue(futuresResponse, 'result', {});
        const data = this.safeValue(futuresResult, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const inst_type = this.safeString(market, 'inst_type');
            const swap = inst_type === 'PERPETUAL_SWAP';
            const future = inst_type === 'FUTURE';
            if (inst_type === 'CCY_PAIR') {
                continue; // Found some inconsistencies between spot and derivatives api so use spot api for currency pairs.
            }
            const baseId = this.safeString(market, 'base_ccy');
            const quoteId = this.safeString(market, 'quote_ccy');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            let symbol = base + '/' + quote + ':' + quote;
            let expiry = this.safeInteger(market, 'expiry_timestamp_ms');
            if (expiry === 0) {
                expiry = undefined;
            }
            let type = 'swap';
            if (future) {
                type = 'future';
                symbol = symbol + '-' + this.yymmdd(expiry);
            }
            const contractSize = this.safeNumber(market, 'contract_size');
            result.push({
                'id': this.safeString(market, 'symbol'),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': quoteId,
                'type': type,
                'spot': false,
                'margin': false,
                'swap': swap,
                'future': future,
                'option': false,
                'active': this.safeValue(market, 'tradable'),
                'contract': true,
                'linear': true,
                'inverse': false,
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': this.iso8601(expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'quote_decimals'))),
                    'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'quantity_decimals'))),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber('1'),
                        'max': this.safeNumber(market, 'max_leverage'),
                    },
                    'amount': {
                        'min': this.parseNumber(contractSize),
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
                'info': market,
            });
        }
        return result;
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://exchange-docs.crypto.com/spot/index.html#public-get-ticker
         * @see https://exchange-docs.crypto.com/derivatives/index.html#public-get-tickers
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue(symbols, 0);
            market = this.market(symbol);
        }
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        const method = this.getSupportedMapping(marketType, {
            'spot': 'v2PublicGetPublicGetTicker',
            'future': 'derivativesPublicGetPublicGetTickers',
            'swap': 'derivativesPublicGetPublicGetTickers',
        });
        const response = await this[method](query);
        //
        //     {
        //         "code":0,
        //         "method":"public/get-ticker",
        //         "result":{
        //         "data": [
        //             {"i":"CRO_BTC","b":0.00000890,"k":0.00001179,"a":0.00001042,"t":1591770793901,"v":14905879.59,"h":0.00,"l":0.00,"c":0.00},
        //             {"i":"EOS_USDT","b":2.7676,"k":2.7776,"a":2.7693,"t":1591770798500,"v":774.51,"h":0.05,"l":0.05,"c":0.00},
        //             {"i":"BCH_USDT","b":247.49,"k":251.73,"a":251.67,"t":1591770797601,"v":1.01693,"h":0.01292,"l":0.01231,"c":-0.00047},
        //             {"i":"ETH_USDT","b":239.92,"k":242.59,"a":240.30,"t":1591770798701,"v":0.97575,"h":0.01236,"l":0.01199,"c":-0.00018},
        //             {"i":"ETH_CRO","b":2693.11,"k":2699.84,"a":2699.55,"t":1591770795053,"v":95.680,"h":8.218,"l":7.853,"c":-0.050}
        //         ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const data = this.safeValue(result, 'data', []);
        return this.parseTickers(data, symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTicker', market, params);
        if (marketType !== 'spot') {
            throw new errors.NotSupported(this.id + ' fetchTicker() only supports spot markets');
        }
        const response = await this.v2PublicGetPublicGetTicker(this.extend(request, query));
        //
        //   {
        //       "id":"-1",
        //       "method":"public/get-tickers",
        //       "code":"0",
        //       "result":{
        //          "data":[
        //             { "i":"BTC_USDT", "h":"20567.16", "l":"20341.39", "a":"20394.23", "v":"2236.3762", "vv":"45739074.30", "c":"-0.0036", "b":"20394.01", "k":"20394.02", "t":"1667406085934" }
        //          ]
        //   }
        //
        const resultResponse = this.safeValue(response, 'result', {});
        const data = this.safeValue(resultResponse, 'data', {});
        const first = this.safeValue(data, 0, {});
        return this.parseTicker(first, market);
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (since !== undefined) {
            // maximum date range is one day
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const [marketType, marketTypeQuery] = this.handleMarketTypeAndParams('fetchOrders', market, params);
        let method = this.getSupportedMapping(marketType, {
            'spot': 'v2PrivatePostPrivateGetOrderHistory',
            'margin': 'v2PrivatePostPrivateMarginGetOrderHistory',
            'future': 'derivativesPrivatePostPrivateGetOrderHistory',
            'swap': 'derivativesPrivatePostPrivateGetOrderHistory',
        });
        const [marginMode, query] = this.customHandleMarginModeAndParams('fetchOrders', marketTypeQuery);
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginGetOrderHistory';
        }
        const response = await this[method](this.extend(request, query));
        //
        // spot and margin
        //     {
        //       id: 1641026542065,
        //       method: 'private/get-order-history',
        //       code: 0,
        //       result: {
        //         order_list: [
        //           {
        //             status: 'FILLED',
        //             side: 'BUY',
        //             price: 0,
        //             quantity: 110,
        //             order_id: '2120246337927715937',
        //             client_oid: '',
        //             create_time: 1641025064904,
        //             update_time: 1641025064958,
        //             type: 'MARKET',
        //             instrument_name: 'USDC_USDT',
        //             avg_price: 1.0001,
        //             cumulative_quantity: 110,
        //             cumulative_value: 110.011,
        //             fee_currency: 'USDC',
        //             exec_inst: '',
        //             time_in_force: 'GOOD_TILL_CANCEL'
        //           }
        //         ]
        //       }
        //     }
        //
        // swap
        //     {
        //       id: 1641026373106,
        //       method: 'private/get-order-history',
        //       code: 0,
        //       result: {
        //         data: [
        //           {
        //             account_id: '85ff689a-7508-4b96-aa79-dc0545d6e637',
        //             order_id: 13191401932,
        //             client_oid: '1641025941461',
        //             order_type: 'LIMIT',
        //             time_in_force: 'GOOD_TILL_CANCEL',
        //             side: 'BUY',
        //             exec_inst: [],
        //             quantity: '0.0001',
        //             limit_price: '48000.0',
        //             order_value: '4.80000000',
        //             maker_fee_rate: '0.00050',
        //             taker_fee_rate: '0.00070',
        //             avg_price: '47253.5',
        //             trigger_price: '0.0',
        //             ref_price_type: 'NULL_VAL',
        //             cumulative_quantity: '0.0001',
        //             cumulative_value: '4.72535000',
        //             cumulative_fee: '0.00330775',
        //             status: 'FILLED',
        //             update_user_id: 'ce075bef-b600-4277-bd6e-ff9007251e63',
        //             order_date: '2022-01-01',
        //             instrument_name: 'BTCUSD-PERP',
        //             fee_instrument_name: 'USD_Stable_Coin',
        //             create_time: 1641025941827,
        //             create_time_ns: '1641025941827994756',
        //             update_time: 1641025941827
        //           }
        //         ]
        //       }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const orderList = this.safeValue2(data, 'order_list', 'data', []);
        return this.parseOrders(orderList, market, since, limit);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (since !== undefined) {
            // maximum date range is one day
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTrades', market, params);
        const method = this.getSupportedMapping(marketType, {
            'spot': 'v2PublicGetPublicGetTrades',
            'future': 'derivativesPublicGetPublicGetTrades',
            'swap': 'derivativesPublicGetPublicGetTrades',
        });
        const response = await this[method](this.extend(request, query));
        // {
        //     "code":0,
        //     "method":"public/get-trades",
        //     "result": {
        //          "instrument_name": "BTC_USDT",
        //          "data:": [
        //              {"dataTime":1591710781947,"d":465533583799589409,"s":"BUY","p":2.96,"q":16.0,"t":1591710781946,"i":"ICX_CRO"},
        //              {"dataTime":1591707701899,"d":465430234542863152,"s":"BUY","p":0.007749,"q":115.0,"t":1591707701898,"i":"VET_USDT"},
        //              {"dataTime":1591710786155,"d":465533724976458209,"s":"SELL","p":25.676,"q":0.55,"t":1591710786154,"i":"XTZ_CRO"},
        //              {"dataTime":1591710783300,"d":465533629172286576,"s":"SELL","p":2.9016,"q":0.6,"t":1591710783298,"i":"XTZ_USDT"},
        //              {"dataTime":1591710784499,"d":465533669425626384,"s":"SELL","p":2.7662,"q":0.58,"t":1591710784498,"i":"EOS_USDT"},
        //              {"dataTime":1591710784700,"d":465533676120104336,"s":"SELL","p":243.21,"q":0.01647,"t":1591710784698,"i":"ETH_USDT"},
        //              {"dataTime":1591710786600,"d":465533739878620208,"s":"SELL","p":253.06,"q":0.00516,"t":1591710786598,"i":"BCH_USDT"},
        //              {"dataTime":1591710786900,"d":465533749959572464,"s":"BUY","p":0.9999,"q":0.2,"t":1591710786898,"i":"USDC_USDT"},
        //              {"dataTime":1591710787500,"d":465533770081010000,"s":"BUY","p":3.159,"q":1.65,"t":1591710787498,"i":"ATOM_USDT"},
        //            ]
        //      }
        // }
        const resultResponse = this.safeValue(response, 'result', {});
        const data = this.safeValue(resultResponse, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOHLCV
         * @see https://exchange-docs.crypto.com/derivatives/index.html#public-get-candlestick
         * @see https://exchange-docs.crypto.com/spot/index.html#public-get-candlestick
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
            'timeframe': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (!market['spot']) {
            let reqLimit = 100;
            if (limit !== undefined) {
                reqLimit = limit;
            }
            request['count'] = reqLimit;
        }
        if (since !== undefined) {
            request['start_ts'] = since;
        }
        const until = this.safeInteger2(params, 'until', 'till');
        params = this.omit(params, ['until', 'till']);
        if (until !== undefined) {
            request['end_ts'] = until;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.v2PublicGetPublicGetCandlestick(this.extend(request, params));
        }
        else if (market['contract']) {
            response = await this.derivativesPublicGetPublicGetCandlestick(this.extend(request, params));
        }
        // {
        //     "code":0,
        //     "method":"public/get-candlestick",
        //     "result":{
        //       "instrument_name":"BTC_USDT",
        //       "interval":"5m",
        //       "data":[
        //         {"t":1596944700000,"o":11752.38,"h":11754.77,"l":11746.65,"c":11753.64,"v":3.694583},
        //         {"t":1596945000000,"o":11753.63,"h":11754.77,"l":11739.83,"c":11746.17,"v":2.073019},
        //         {"t":1596945300000,"o":11746.16,"h":11753.24,"l":11738.1,"c":11740.65,"v":0.867247},
        //         ...
        //       ]
        //     }
        // }
        const resultResponse = this.safeValue(response, 'result', {});
        const data = this.safeValue(resultResponse, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (limit) {
            request['depth'] = limit;
        }
        const [marketType, query] = this.handleMarketTypeAndParams('fetchOrderBook', market, params);
        const method = this.getSupportedMapping(marketType, {
            'spot': 'v2PublicGetPublicGetBook',
            'future': 'derivativesPublicGetPublicGetBook',
            'swap': 'derivativesPublicGetPublicGetBook',
        });
        const response = await this[method](this.extend(request, query));
        // {
        //     "code":0,
        //     "method":"public/get-book",
        //     "result":{
        //       "bids":[[9668.44,0.006325,1.0],[9659.75,0.006776,1.0],[9653.14,0.011795,1.0],[9647.13,0.019434,1.0],[9634.62,0.013765,1.0],[9633.81,0.021395,1.0],[9628.46,0.037834,1.0],[9627.6,0.020909,1.0],[9621.51,0.026235,1.0],[9620.83,0.026701,1.0]],
        //       "asks":[[9697.0,0.68251,1.0],[9697.6,1.722864,2.0],[9699.2,1.664177,2.0],[9700.8,1.824953,2.0],[9702.4,0.85778,1.0],[9704.0,0.935792,1.0],[9713.32,0.002926,1.0],[9716.42,0.78923,1.0],[9732.19,0.00645,1.0],[9737.88,0.020216,1.0]],
        //       "t":1591704180270
        //     }
        // }
        const result = this.safeValue(response, 'result');
        const data = this.safeValue(result, 'data');
        const orderBook = this.safeValue(data, 0);
        const timestamp = this.safeInteger(orderBook, 't');
        return this.parseOrderBook(orderBook, symbol, timestamp);
    }
    parseSwapBalance(response) {
        const responseResult = this.safeValue(response, 'result', {});
        const data = this.safeValue(responseResult, 'data', []);
        const result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString(balance, 'instrument_name');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(balance, 'total_cash_balance');
            account['free'] = this.safeString(balance, 'total_available_balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    parseSpotBalance(response) {
        const data = this.safeValue(response, 'result', {});
        const coinList = this.safeValue(data, 'accounts', []);
        const result = { 'info': response };
        for (let i = 0; i < coinList.length; i++) {
            const balance = coinList[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(balance, 'balance');
            account['free'] = this.safeString(balance, 'available');
            account['used'] = this.safeString(balance, 'order');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name cryptocom#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        const [marketType, marketTypeQuery] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        let method = this.getSupportedMapping(marketType, {
            'spot': 'v2PrivatePostPrivateGetAccountSummary',
            'margin': 'v2PrivatePostPrivateMarginGetAccountSummary',
            'future': 'derivativesPrivatePostPrivateUserBalance',
            'swap': 'derivativesPrivatePostPrivateUserBalance',
        });
        const [marginMode, query] = this.customHandleMarginModeAndParams('fetchBalance', marketTypeQuery);
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginGetAccountSummary';
        }
        const response = await this[method](query);
        // spot
        //     {
        //         "id": 11,
        //         "method": "private/get-account-summary",
        //         "code": 0,
        //         "result": {
        //             "accounts": [
        //                 {
        //                     "balance": 99999999.905000000000000000,
        //                     "available": 99999996.905000000000000000,
        //                     "order": 3.000000000000000000,
        //                     "stake": 0,
        //                     "currency": "CRO"
        //                 }
        //             ]
        //         }
        //     }
        //
        // margin
        //     {
        //         "id": 1656529728178,
        //         "method": "private/margin/get-account-summary",
        //         "code": 0,
        //         "result": {
        //             "accounts": [
        //                 {
        //                     "balance": 0,
        //                     "available": 0,
        //                     "order": 0,
        //                     "borrowed": 0,
        //                     "position": 0,
        //                     "positionHomeCurrency": 0,
        //                     "positionBtc": 0,
        //                     "lastPriceHomeCurrency": 20111.38,
        //                     "lastPriceBtc": 1,
        //                     "currency": "BTC",
        //                     "accrued_interest": 0,
        //                     "liquidation_price": 0
        //                 },
        //             ],
        //             "is_liquidating": false,
        //             "total_balance": 16,
        //             "total_balance_btc": 0.00079556,
        //             "equity_value": 16,
        //             "equity_value_btc": 0.00079556,
        //             "total_borrowed": 0,
        //             "total_borrowed_btc": 0,
        //             "total_accrued_interest": 0,
        //             "total_accrued_interest_btc": 0,
        //             "margin_score": "GOOD",
        //             "currency": "USDT"
        //         }
        //     }
        //
        // swap
        //     {
        //       "id" : 1641025392400,
        //       "method" : "private/user-balance",
        //       "code" : 0,
        //       "result" : {
        //         "data" : [ {
        //           "total_available_balance" : "109.56000000",
        //           "total_margin_balance" : "109.56000000",
        //           "total_initial_margin" : "0.00000000",
        //           "total_maintenance_margin" : "0.00000000",
        //           "total_position_cost" : "0.00000000",
        //           "total_cash_balance" : "109.56000000",
        //           "total_collateral_value" : "109.56000000",
        //           "total_session_unrealized_pnl" : "0.00000000",
        //           "instrument_name" : "USD_Stable_Coin",
        //           "total_session_realized_pnl" : "0.00000000",
        //           "position_balances" : [ {
        //             "quantity" : "109.56000000",
        //             "collateral_weight" : "1.000000",
        //             "collateral_amount" : "109.56000000",
        //             "market_value" : "109.56000000",
        //             "max_withdrawal_balance" : "109.56000000",
        //             "instrument_name" : "USD_Stable_Coin"
        //           } ],
        //           "total_effective_leverage" : "0.000000",
        //           "position_limit" : "3000000.00000000",
        //           "used_position_limit" : "0.00000000",
        //           "is_liquidating" : false
        //         } ]
        //       }
        //     }
        //
        const parser = this.getSupportedMapping(marketType, {
            'spot': 'parseSpotBalance',
            'margin': 'parseSpotBalance',
            'future': 'parseSwapBalance',
            'swap': 'parseSwapBalance',
        });
        return this[parser](response);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        const [marketType, marketTypeQuery] = this.handleMarketTypeAndParams('fetchOrder', market, params);
        const [marginMode, query] = this.customHandleMarginModeAndParams('fetchOrder', marketTypeQuery);
        if ((marketType === 'spot') || (marketType === 'margin') || (marginMode !== undefined)) {
            request['order_id'] = id.toString();
        }
        else {
            request['order_id'] = parseInt(id);
        }
        let method = this.getSupportedMapping(marketType, {
            'spot': 'v2PrivatePostPrivateGetOrderDetail',
            'margin': 'v2PrivatePostPrivateMarginGetOrderDetail',
            'future': 'derivativesPrivatePostPrivateGetOrderDetail',
            'swap': 'derivativesPrivatePostPrivateGetOrderDetail',
        });
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginGetOrderDetail';
        }
        const response = await this[method](this.extend(request, query));
        // {
        //     "id": 11,
        //     "method": "private/get-order-detail",
        //     "code": 0,
        //     "result": {
        //       "trade_list": [
        //         {
        //           "side": "BUY",
        //           "instrument_name": "ETH_CRO",
        //           "fee": 0.007,
        //           "trade_id": "371303044218155296",
        //           "create_time": 1588902493045,
        //           "traded_price": 7,
        //           "traded_quantity": 7,
        //           "fee_currency": "CRO",
        //           "order_id": "371302913889488619"
        //         }
        //       ],
        //       "order_info": {
        //         "status": "FILLED",
        //         "side": "BUY",
        //         "order_id": "371302913889488619",
        //         "client_oid": "9_yMYJDNEeqHxLqtD_2j3g",
        //         "create_time": 1588902489144,
        //         "update_time": 1588902493024,
        //         "type": "LIMIT",
        //         "instrument_name": "ETH_CRO",
        //         "cumulative_quantity": 7,
        //         "cumulative_value": 7,
        //         "avg_price": 7,
        //         "fee_currency": "CRO",
        //         "time_in_force": "GOOD_TILL_CANCEL",
        //         "exec_inst": "POST_ONLY"
        //       }
        //     }
        // }
        const result = this.safeValue(response, 'result', {});
        const order = this.safeValue(result, 'order_info', result);
        return this.parseOrder(order, market);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const uppercaseType = type.toUpperCase();
        const request = {
            'instrument_name': market['id'],
            'side': side.toUpperCase(),
            'type': uppercaseType,
            'quantity': this.amountToPrecision(symbol, amount),
        };
        if ((uppercaseType === 'LIMIT') || (uppercaseType === 'STOP_LIMIT')) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const broker = this.safeString(this.options, 'broker', 'CCXT_');
        let clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId === undefined) {
            clientOrderId = broker + this.uuid22();
        }
        request['client_oid'] = clientOrderId;
        const postOnly = this.safeValue(params, 'postOnly', false);
        if (postOnly) {
            request['exec_inst'] = 'POST_ONLY';
        }
        params = this.omit(params, ['postOnly', 'clientOrderId']);
        const [marketType, marketTypeQuery] = this.handleMarketTypeAndParams('createOrder', market, params);
        let method = this.getSupportedMapping(marketType, {
            'spot': 'v2PrivatePostPrivateCreateOrder',
            'margin': 'v2PrivatePostPrivateMarginCreateOrder',
            'future': 'derivativesPrivatePostPrivateCreateOrder',
            'swap': 'derivativesPrivatePostPrivateCreateOrder',
        });
        const [marginMode, query] = this.customHandleMarginModeAndParams('createOrder', marketTypeQuery);
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginCreateOrder';
        }
        const response = await this[method](this.extend(request, query));
        // {
        //     "id": 11,
        //     "method": "private/create-order",
        //     "result": {
        //       "order_id": "337843775021233500",
        //       "client_oid": "my_order_0002"
        //     }
        // }
        const result = this.safeValue(response, 'result', {});
        return this.parseOrder(result, market);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        const [marketType, marketTypeQuery] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        const [marginMode, query] = this.customHandleMarginModeAndParams('cancelAllOrders', marketTypeQuery);
        if ((marketType === 'spot') || (marketType === 'margin') || (marginMode !== undefined)) {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument for ' + marketType + ' orders');
            }
            request['instrument_name'] = market['id'];
        }
        let method = this.getSupportedMapping(marketType, {
            'spot': 'v2PrivatePostPrivateCancelAllOrders',
            'margin': 'v2PrivatePostPrivateMarginCancelAllOrders',
            'future': 'derivativesPrivatePostPrivateCancelAllOrders',
            'swap': 'derivativesPrivatePostPrivateCancelAllOrders',
        });
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginCancelAllOrders';
        }
        return await this[method](this.extend(request, query));
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        const [marketType, marketTypeQuery] = this.handleMarketTypeAndParams('cancelOrder', market, params);
        const [marginMode, query] = this.customHandleMarginModeAndParams('cancelOrder', marketTypeQuery);
        if ((marketType === 'spot') || (marketType === 'margin') || (marginMode !== undefined)) {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument for ' + marketType + ' orders');
            }
            request['instrument_name'] = market['id'];
            request['order_id'] = id.toString();
        }
        else {
            request['order_id'] = parseInt(id);
        }
        let method = this.getSupportedMapping(marketType, {
            'spot': 'v2PrivatePostPrivateCancelOrder',
            'margin': 'v2PrivatePostPrivateMarginCancelOrder',
            'future': 'derivativesPrivatePostPrivateCancelOrder',
            'swap': 'derivativesPrivatePostPrivateCancelOrder',
        });
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginCancelOrder';
        }
        const response = await this[method](this.extend(request, query));
        const result = this.safeValue(response, 'result', response);
        return this.parseOrder(result);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instrument_name'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const [marketType, marketTypeQuery] = this.handleMarketTypeAndParams('fetchOpenOrders', market, params);
        let method = this.getSupportedMapping(marketType, {
            'spot': 'v2PrivatePostPrivateGetOpenOrders',
            'margin': 'v2PrivatePostPrivateMarginGetOpenOrders',
            'future': 'derivativesPrivatePostPrivateGetOpenOrders',
            'swap': 'derivativesPrivatePostPrivateGetOpenOrders',
        });
        const [marginMode, query] = this.customHandleMarginModeAndParams('fetchOpenOrders', marketTypeQuery);
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginGetOpenOrders';
        }
        const response = await this[method](this.extend(request, query));
        // {
        //     "id": 11,
        //     "method": "private/get-open-orders",
        //     "code": 0,
        //     "result": {
        //       "count": 1177,
        //       "order_list": [
        //         {
        //           "status": "ACTIVE",
        //           "side": "BUY",
        //           "price": 1,
        //           "quantity": 1,
        //           "order_id": "366543374673423753",
        //           "client_oid": "my_order_0002",
        //           "create_time": 1588760643829,
        //           "update_time": 1588760644292,
        //           "type": "LIMIT",
        //           "instrument_name": "ETH_CRO",
        //           "cumulative_quantity": 0,
        //           "cumulative_value": 0,
        //           "avg_price": 0,
        //           "fee_currency": "CRO",
        //           "time_in_force": "GOOD_TILL_CANCEL"
        //         },
        //         {
        //           "status": "ACTIVE",
        //           "side": "BUY",
        //           "price": 1,
        //           "quantity": 1,
        //           "order_id": "366455245775097673",
        //           "client_oid": "my_order_0002",
        //           "create_time": 1588758017375,
        //           "update_time": 1588758017411,
        //           "type": "LIMIT",
        //           "instrument_name": "ETH_CRO",
        //           "cumulative_quantity": 0,
        //           "cumulative_value": 0,
        //           "avg_price": 0,
        //           "fee_currency": "CRO",
        //           "time_in_force": "GOOD_TILL_CANCEL"
        //         }
        //       ]
        //     }
        // }
        const data = this.safeValue(response, 'result', {});
        const resultList = this.safeValue2(data, 'order_list', 'data', []);
        return this.parseOrders(resultList, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instrument_name'] = market['id'];
        }
        if (since !== undefined) {
            // maximum date range is one day
            request['start_ts'] = since;
            const endTimestamp = this.sum(since, 24 * 60 * 60 * 1000);
            request['end_ts'] = endTimestamp;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const [marketType, marketTypeQuery] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        let method = this.getSupportedMapping(marketType, {
            'spot': 'v2PrivatePostPrivateGetTrades',
            'margin': 'v2PrivatePostPrivateMarginGetTrades',
            'future': 'derivativesPrivatePostPrivateGetTrades',
            'swap': 'derivativesPrivatePostPrivateGetTrades',
        });
        const [marginMode, query] = this.customHandleMarginModeAndParams('fetchMyTrades', marketTypeQuery);
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginGetTrades';
        }
        const response = await this[method](this.extend(request, query));
        // {
        //     "id": 11,
        //     "method": "private/get-trades",
        //     "code": 0,
        //     "result": {
        //       "trade_list": [
        //         {
        //           "side": "SELL",
        //           "instrument_name": "ETH_CRO",
        //           "fee": 0.014,
        //           "trade_id": "367107655537806900",
        //           "create_time": 1588777459755,
        //           "traded_price": 7,
        //           "traded_quantity": 1,
        //           "fee_currency": "CRO",
        //           "order_id": "367107623521528450"
        //         }
        //       ]
        //     }
        // }
        const data = this.safeValue(response, 'result', {});
        const resultList = this.safeValue2(data, 'trade_list', 'data', []);
        return this.parseTrades(resultList, market, since, limit);
    }
    parseAddress(addressString) {
        let address = undefined;
        let tag = undefined;
        let rawTag = undefined;
        if (addressString.indexOf('?') > 0) {
            [address, rawTag] = addressString.split('?');
            const splitted = rawTag.split('=');
            tag = splitted[1];
        }
        else {
            address = addressString;
        }
        return [address, tag];
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['address_tag'] = tag;
        }
        const response = await this.v2PrivatePostPrivateCreateWithdrawal(this.extend(request, params));
        //
        //    {
        //        "id":-1,
        //        "method":"private/create-withdrawal",
        //        "code":0,
        //        "result": {
        //            "id": 2220,
        //            "amount": 1,
        //            "fee": 0.0004,
        //            "symbol": "BTC",
        //            "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBf",
        //            "client_wid": "my_withdrawal_002",
        //            "create_time":1607063412000
        //        }
        //     }
        //
        const result = this.safeValue(response, 'result');
        return this.parseTransaction(result, currency);
    }
    async fetchDepositAddressesByNetwork(code, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchDepositAddressesByNetwork
         * @description fetch a dictionary of addresses for a currency, indexed by network
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.v2PrivatePostPrivateGetDepositAddress(this.extend(request, params));
        // {
        //     "id": 11,
        //     "method": "private/get-deposit-address",
        //     "code": 0,
        //     "result": {
        //          "deposit_address_list": [
        //              {
        //                  "currency": "CRO",
        //                  "create_time": 1615886328000,
        //                  "id": "12345",
        //                  "address": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        //                  "status": "1",
        //                  "network": "CRO"
        //              },
        //              {
        //                  "currency": "CRO",
        //                  "create_time": 1615886332000,
        //                  "id": "12346",
        //                  "address": "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
        //                  "status": "1",
        //                  "network": "ETH"
        //              }
        //          ]
        //    }
        // }
        const data = this.safeValue(response, 'result', {});
        const addresses = this.safeValue(data, 'deposit_address_list', []);
        const addressesLength = addresses.length;
        if (addressesLength === 0) {
            throw new errors.ExchangeError(this.id + ' fetchDepositAddressesByNetwork() generating address...');
        }
        const result = {};
        for (let i = 0; i < addressesLength; i++) {
            const value = this.safeValue(addresses, i);
            const addressString = this.safeString(value, 'address');
            const currencyId = this.safeString(value, 'currency');
            const responseCode = this.safeCurrencyCode(currencyId);
            const [address, tag] = this.parseAddress(addressString);
            this.checkAddress(address);
            const networkId = this.safeString(value, 'network');
            const network = this.safeNetwork(networkId);
            result[network] = {
                'info': value,
                'currency': responseCode,
                'address': address,
                'tag': tag,
                'network': network,
            };
        }
        return result;
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        const network = this.safeStringUpper(params, 'network');
        params = this.omit(params, ['network']);
        const depositAddresses = await this.fetchDepositAddressesByNetwork(code, params);
        if (network in depositAddresses) {
            return depositAddresses[network];
        }
        else {
            const keys = Object.keys(depositAddresses);
            return depositAddresses[keys[0]];
        }
    }
    safeNetwork(networkId) {
        const networksById = {
            'BTC': 'BTC',
            'ETH': 'ETH',
            'SOL': 'SOL',
            'BNB': 'BNB',
            'CRONOS': 'CRONOS',
            'MATIC': 'MATIC',
            'OP': 'OP',
        };
        return this.safeString(networksById, networkId, networkId);
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            // 90 days date range
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.v2PrivatePostPrivateGetDepositHistory(this.extend(request, params));
        // {
        //     "id": 11,
        //     "method": "private/get-deposit-history",
        //     "code": 0,
        //     "result": {
        //       "deposit_list": [
        //         {
        //           "currency": "XRP",
        //           "fee": 1.0,
        //           "create_time": 1607063412000,
        //           "id": "2220",
        //           "update_time": 1607063460000,
        //           "amount": 100,
        //           "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBf?1234567890",
        //           "status": "1"
        //         }
        //       ]
        //     }
        // }
        const data = this.safeValue(response, 'result', {});
        const depositList = this.safeValue(data, 'deposit_list', []);
        return this.parseTransactions(depositList, currency, since, limit);
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            // 90 days date range
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.v2PrivatePostPrivateGetWithdrawalHistory(this.extend(request, params));
        //
        //     {
        //       id: 1640704829096,
        //       method: 'private/get-withdrawal-history',
        //       code: 0,
        //       result: {
        //         withdrawal_list: [
        //           {
        //             currency: 'DOGE',
        //             client_wid: '',
        //             fee: 50,
        //             create_time: 1640425168000,
        //             id: '3180557',
        //             update_time: 1640425168000,
        //             amount: 1102.64092,
        //             address: 'DDrGGqmp5Ddo1QH9tUvDfoL4u4rqys5975',
        //             status: '5',
        //             txid: 'ce23e9e21b6c38eef953070a05110e6dca2fd2bcc76d3381000547b9ff5290b2/0'
        //           }
        //         ]
        //       }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const withdrawalList = this.safeValue(data, 'withdrawal_list', []);
        return this.parseTransactions(withdrawalList, currency, since, limit);
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name cryptocom#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        fromAccount = fromAccount.toLowerCase();
        toAccount = toAccount.toLowerCase();
        const accountsById = this.safeValue(this.options, 'accountsById', {});
        const fromId = this.safeString(accountsById, fromAccount, fromAccount);
        const toId = this.safeString(accountsById, toAccount, toAccount);
        const request = {
            'currency': currency['id'],
            'amount': parseFloat(amount),
            'from': fromId,
            'to': toId,
        };
        let method = 'v2PrivatePostPrivateDerivTransfer';
        if ((fromAccount === 'margin') || (toAccount === 'margin')) {
            method = 'v2PrivatePostPrivateMarginTransfer';
        }
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "id": 11,
        //         "method": "private/deriv/transfer",
        //         "code": 0
        //     }
        //
        return this.parseTransfer(response, currency);
    }
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        if (!('direction' in params)) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTransfers() requires a direction param to be either "IN" or "OUT"');
        }
        await this.loadMarkets();
        let currency = undefined;
        const request = {
            'direction': 'OUT',
        };
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        let method = 'v2PrivatePostPrivateDerivGetTransferHistory';
        const [marginMode, query] = this.customHandleMarginModeAndParams('fetchTransfers', params);
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginGetTransferHistory';
        }
        const response = await this[method](this.extend(request, query));
        //
        //     {
        //       id: '1641032709328',
        //       method: 'private/deriv/get-transfer-history',
        //       code: '0',
        //       result: {
        //         transfer_list: [
        //           {
        //             direction: 'IN',
        //             time: '1641025185223',
        //             amount: '109.56',
        //             status: 'COMPLETED',
        //             information: 'From Spot Wallet',
        //             currency: 'USDC'
        //           }
        //         ]
        //       }
        //     }
        //
        const transfer = [];
        transfer.push({
            'response': response,
        });
        return this.parseTransfers(transfer, currency, since, limit, params);
    }
    parseTransferStatus(status) {
        const statuses = {
            'COMPLETED': 'ok',
            'PROCESSING': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        //   {
        //     response: {
        //       id: '1641032709328',
        //       method: 'private/deriv/get-transfer-history',
        //       code: '0',
        //       result: {
        //         transfer_list: [
        //           {
        //             direction: 'IN',
        //             time: '1641025185223',
        //             amount: '109.56',
        //             status: 'COMPLETED',
        //             information: 'From Spot Wallet',
        //             currency: 'USDC'
        //           }
        //         ]
        //       }
        //     }
        //   }
        //
        const response = this.safeValue(transfer, 'response', {});
        const result = this.safeValue(response, 'result', {});
        const transferList = this.safeValue(result, 'transfer_list', []);
        let timestamp = undefined;
        let amount = undefined;
        let code = undefined;
        let information = undefined;
        let status = undefined;
        for (let i = 0; i < transferList.length; i++) {
            const entry = transferList[i];
            timestamp = this.safeInteger(entry, 'time');
            amount = this.safeNumber(entry, 'amount');
            const currencyId = this.safeString(entry, 'currency');
            code = this.safeCurrencyCode(currencyId);
            information = this.safeString(entry, 'information');
            const rawStatus = this.safeString(entry, 'status');
            status = this.parseTransferStatus(rawStatus);
        }
        let fromAccount = undefined;
        let toAccount = undefined;
        if (information !== undefined) {
            const parts = information.split(' ');
            const direction = this.safeStringLower(parts, 0);
            const method = this.safeString(response, 'method');
            if (direction === 'from') {
                fromAccount = this.safeStringLower(parts, 1);
                if (method === 'private/margin/get-transfer-history') {
                    toAccount = 'margin';
                }
                else {
                    toAccount = 'derivative';
                }
            }
            else if (direction === 'to') {
                toAccount = this.safeStringLower(parts, 1);
                if (method === 'private/margin/get-transfer-history') {
                    fromAccount = 'margin';
                }
                else {
                    fromAccount = 'derivative';
                }
            }
        }
        return {
            'info': transferList,
            'id': this.safeString(response, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        };
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     "i":"CRO_BTC",
        //     "b":0.00000890,
        //     "k":0.00001179,
        //     "a":0.00001042,
        //     "t":1591770793901,
        //     "v":14905879.59,
        //     "h":0.00,
        //     "l":0.00,
        //     "c":0.00
        // }
        const timestamp = this.safeInteger(ticker, 't');
        const marketId = this.safeString(ticker, 'i');
        market = this.safeMarket(marketId, market, '_');
        const symbol = market['symbol'];
        const last = this.safeString(ticker, 'a');
        const relativeChange = this.safeString(ticker, 'c');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'h'),
            'low': this.safeString(ticker, 'l'),
            'bid': this.safeString(ticker, 'b'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'k'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': relativeChange,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'v'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    parseTrade(trade, market = undefined) {
        //
        // public/get-trades
        //
        // {"dataTime":1591710781947,"d":465533583799589409,"s":"BUY","p":2.96,"q":16.0,"t":1591710781946,"i":"ICX_CRO"},
        //
        // private/get-trades
        //
        // {
        //     "side": "SELL",
        //     "instrument_name": "ETH_CRO",
        //     "fee": 0.014,
        //     "trade_id": "367107655537806900",
        //     "create_time": 1588777459755,
        //     "traded_price": 7,
        //     "traded_quantity": 1,
        //     "fee_currency": "CRO",
        //     "order_id": "367107623521528450"
        // }
        const timestamp = this.safeInteger2(trade, 't', 'create_time');
        const marketId = this.safeString2(trade, 'i', 'instrument_name');
        market = this.safeMarket(marketId, market, '_');
        const symbol = market['symbol'];
        const price = this.safeString2(trade, 'p', 'traded_price');
        const amount = this.safeString2(trade, 'q', 'traded_quantity');
        let side = this.safeString2(trade, 's', 'side');
        if (side !== undefined) {
            side = side.toLowerCase();
        }
        const id = this.safeString2(trade, 'd', 'trade_id');
        const takerOrMaker = this.safeStringLower2(trade, 'liquidity_indicator', 'taker_side');
        const order = this.safeString(trade, 'order_id');
        let fee = undefined;
        let feeCost = this.safeString2(trade, 'fee', 'fees');
        if (feeCost !== undefined) {
            const contract = this.safeValue(market, 'contract', false);
            if (contract) {
                feeCost = Precise["default"].stringNeg(feeCost);
            }
            let feeCurrency = undefined;
            if (market['spot']) {
                feeCurrency = this.safeString(trade, 'fee_currency');
            }
            else if (market['linear']) {
                feeCurrency = market['quote'];
            }
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': order,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
        }, market);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //      {"t":1596944700000,"o":11752.38,"h":11754.77,"l":11746.65,"c":11753.64,"v":3.694583}
        return [
            this.safeInteger(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    parseOrderStatus(status) {
        const statuses = {
            'ACTIVE': 'open',
            'CANCELED': 'canceled',
            'FILLED': 'closed',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString(statuses, status, status);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'GOOD_TILL_CANCEL': 'GTC',
            'IMMEDIATE_OR_CANCEL': 'IOC',
            'FILL_OR_KILL': 'FOK',
        };
        return this.safeString(timeInForces, timeInForce, timeInForce);
    }
    parseOrder(order, market = undefined) {
        //       {
        //         "status": "FILLED",
        //         "side": "BUY",
        //         "order_id": "371302913889488619",
        //         "client_oid": "9_yMYJDNEeqHxLqtD_2j3g",
        //         "create_time": 1588902489144,
        //         "update_time": 1588902493024,
        //         "type": "LIMIT",
        //         "instrument_name": "ETH_CRO",
        //         "cumulative_quantity": 7,
        //         "cumulative_value": 7,
        //         "avg_price": 7,
        //         "fee_currency": "CRO",
        //         "time_in_force": "GOOD_TILL_CANCEL",
        //         "exec_inst": "POST_ONLY"
        //       }
        //
        //     {
        //       id: 1641026373106,
        //       method: 'private/get-order-history',
        //       code: 0,
        //       result: {
        //         data: [
        //           {
        //             account_id: '85ff689a-7508-4b96-aa79-dc0545d6e637',
        //             order_id: 13191401932,
        //             client_oid: '1641025941461',
        //             order_type: 'LIMIT',
        //             time_in_force: 'GOOD_TILL_CANCEL',
        //             side: 'BUY',
        //             exec_inst: [],
        //             quantity: '0.0001',
        //             limit_price: '48000.0',
        //             order_value: '4.80000000',
        //             maker_fee_rate: '0.00050',
        //             taker_fee_rate: '0.00070',
        //             avg_price: '47253.5',
        //             trigger_price: '0.0',
        //             ref_price_type: 'NULL_VAL',
        //             cumulative_quantity: '0.0001',
        //             cumulative_value: '4.72535000',
        //             cumulative_fee: '0.00330775',
        //             status: 'FILLED',
        //             update_user_id: 'ce075bef-b600-4277-bd6e-ff9007251e63',
        //             order_date: '2022-01-01',
        //             instrument_name: 'BTCUSD-PERP',
        //             fee_instrument_name: 'USD_Stable_Coin',
        //             create_time: 1641025941827,
        //             create_time_ns: '1641025941827994756',
        //             update_time: 1641025941827
        //           }
        //         ]
        //       }
        //     }
        //
        const created = this.safeInteger(order, 'create_time');
        const updated = this.safeInteger(order, 'update_time');
        const marketId = this.safeString(order, 'instrument_name');
        const symbol = this.safeSymbol(marketId, market);
        const amount = this.safeString(order, 'quantity');
        const filled = this.safeString(order, 'cumulative_quantity');
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const id = this.safeString(order, 'order_id');
        const clientOrderId = this.safeString(order, 'client_oid');
        const price = this.safeString2(order, 'price', 'limit_price');
        const average = this.safeString(order, 'avg_price');
        const type = this.safeStringLower2(order, 'type', 'order_type');
        const side = this.safeStringLower(order, 'side');
        const timeInForce = this.parseTimeInForce(this.safeString(order, 'time_in_force'));
        const execInst = this.safeString(order, 'exec_inst');
        let postOnly = undefined;
        if (execInst !== undefined) {
            postOnly = (execInst === 'POST_ONLY');
        }
        const cost = this.safeString(order, 'cumulative_value');
        const feeCost = this.safeString(order, 'cumulative_fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = this.safeString(order, 'fee_instrument_name');
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode(feeCurrency),
            };
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': created,
            'datetime': this.iso8601(created),
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': cost,
            'fee': fee,
            'average': average,
            'trades': [],
        }, market);
    }
    parseDepositStatus(status) {
        const statuses = {
            '0': 'pending',
            '1': 'ok',
            '2': 'failed',
            '3': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseWithdrawalStatus(status) {
        const statuses = {
            '0': 'pending',
            '1': 'pending',
            '2': 'failed',
            '3': 'pending',
            '4': 'failed',
            '5': 'ok',
            '6': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "currency": "XRP",
        //         "fee": 1.0,
        //         "create_time": 1607063412000,
        //         "id": "2220",
        //         "update_time": 1607063460000,
        //         "amount": 100,
        //         "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBf?1234567890",
        //         "status": "1"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "currency": "XRP",
        //         "client_wid": "my_withdrawal_002",
        //         "fee": 1.0,
        //         "create_time": 1607063412000,
        //         "id": "2220",
        //         "update_time": 1607063460000,
        //         "amount": 100,
        //         "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBf?1234567890",
        //         "status": "1"
        //     }
        //
        // withdraw
        //
        //     {
        //         "id": 2220,
        //         "amount": 1,
        //         "fee": 0.0004,
        //         "symbol": "BTC",
        //         "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBf",
        //         "client_wid": "my_withdrawal_002",
        //         "create_time":1607063412000
        //     }
        //
        let type = undefined;
        const rawStatus = this.safeString(transaction, 'status');
        let status = undefined;
        if ('client_wid' in transaction) {
            type = 'withdrawal';
            status = this.parseWithdrawalStatus(rawStatus);
        }
        else {
            type = 'deposit';
            status = this.parseDepositStatus(rawStatus);
        }
        const id = this.safeString(transaction, 'id');
        const addressString = this.safeString(transaction, 'address');
        const [address, tag] = this.parseAddress(addressString);
        const currencyId = this.safeString(transaction, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeInteger(transaction, 'create_time');
        const amount = this.safeNumber(transaction, 'amount');
        const txId = this.safeString(transaction, 'txid');
        const feeCost = this.safeNumber(transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const updated = this.safeInteger(transaction, 'update_time');
        return {
            'info': transaction,
            'id': id,
            'txid': txId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': undefined,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': undefined,
            'fee': fee,
        };
    }
    async repayMargin(code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#repayMargin
         * @description repay borrowed margin and interest
         * @see https://exchange-docs.crypto.com/spot/index.html#private-margin-repay
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string|undefined} symbol unified market symbol, not used by cryptocom.repayMargin ()
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        const response = await this.v2PrivatePostPrivateMarginRepay(this.extend(request, params));
        //
        //     {
        //         "id": 1656620104211,
        //         "method": "private/margin/repay",
        //         "code": 0,
        //         "result": {
        //             "badDebt": 0
        //         }
        //     }
        //
        const transaction = this.parseMarginLoan(response, currency);
        return this.extend(transaction, {
            'amount': amount,
        });
    }
    async borrowMargin(code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#borrowMargin
         * @description create a loan to borrow margin
         * @see https://exchange-docs.crypto.com/spot/index.html#private-margin-borrow
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {string|undefined} symbol unified market symbol, not used by cryptocom.repayMargin ()
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        const response = await this.v2PrivatePostPrivateMarginBorrow(this.extend(request, params));
        //
        //     {
        //         "id": 1656619578559,
        //         "method": "private/margin/borrow",
        //         "code": 0
        //     }
        //
        const transaction = this.parseMarginLoan(response, currency);
        return this.extend(transaction, {
            'amount': amount,
        });
    }
    parseMarginLoan(info, currency = undefined) {
        //
        // borrowMargin
        //
        //     {
        //         "id": 1656619578559,
        //         "method": "private/margin/borrow",
        //         "code": 0
        //     }
        //
        // repayMargin
        //
        //     {
        //         "id": 1656620104211,
        //         "method": "private/margin/repay",
        //         "code": 0,
        //         "result": {
        //             "badDebt": 0
        //         }
        //     }
        //
        return {
            'id': this.safeInteger(info, 'id'),
            'currency': this.safeCurrencyCode(undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        let currency = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.v2PrivatePostPrivateMarginGetInterestHistory(this.extend(request, params));
        //
        //     {
        //         "id": 1656705829020,
        //         "method": "private/margin/get-interest-history",
        //         "code": 0,
        //         "result": {
        //             "list": [
        //                 {
        //                     "loan_id": "2643528867803765921",
        //                     "currency": "USDT",
        //                     "interest": 0.00000004,
        //                     "time": 1656702899559,
        //                     "stake_amount": 6,
        //                     "interest_rate": 0.000025
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const rows = this.safeValue(data, 'list', []);
        let interest = undefined;
        for (let i = 0; i < rows.length; i++) {
            interest = this.parseBorrowInterests(rows, market);
        }
        return this.filterByCurrencySinceLimit(interest, code, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
        //
        //     {
        //         "loan_id": "2643528867803765921",
        //         "currency": "USDT",
        //         "interest": 0.00000004,
        //         "time": 1656702899559,
        //         "stake_amount": 6,
        //         "interest_rate": 0.000025
        //     },
        //
        const timestamp = this.safeInteger(info, 'time');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'marginMode': undefined,
            'currency': this.safeCurrencyCode(this.safeString(info, 'currency')),
            'interest': this.safeNumber(info, 'interest'),
            'interestRate': this.safeNumber(info, 'interest_rate'),
            'amountBorrowed': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    async fetchBorrowRates(params = {}) {
        /**
         * @method
         * @name cryptocom#fetchBorrowRates
         * @description fetch the borrow interest rates of all currencies
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
         */
        await this.loadMarkets();
        const response = await this.v2PrivatePostPrivateMarginGetUserConfig(params);
        //
        //     {
        //         "id": 1656707947456,
        //         "method": "private/margin/get-user-config",
        //         "code": 0,
        //         "result": {
        //             "stake_amount": 6,
        //             "currency_configs": [
        //                 {
        //                     "currency": "AGLD",
        //                     "hourly_rate": 0.00003334,
        //                     "max_borrow_limit": 342.4032393,
        //                     "min_borrow_limit": 30
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const rates = this.safeValue(data, 'currency_configs', []);
        return this.parseBorrowRates(rates, 'currency');
    }
    parseBorrowRates(info, codeKey) {
        //
        //     {
        //         "currency": "AGLD",
        //         "hourly_rate": 0.00003334,
        //         "max_borrow_limit": 342.4032393,
        //         "min_borrow_limit": 30
        //     },
        //
        const timestamp = this.milliseconds();
        const rates = [];
        for (let i = 0; i < info.length; i++) {
            const entry = info[i];
            rates.push({
                'currency': this.safeCurrencyCode(this.safeString(entry, 'currency')),
                'rate': this.safeNumber(entry, 'hourly_rate'),
                'period': 3600000,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'info': entry,
            });
        }
        return rates;
    }
    customHandleMarginModeAndParams(methodName, params = {}) {
        /**
         * @ignore
         * @method
         * @description marginMode specified by params["marginMode"], this.options["marginMode"], this.options["defaultMarginMode"], params["margin"] = true or this.options["defaultType"] = 'margin'
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[string|undefined, object]} the marginMode in lowercase
         */
        const defaultType = this.safeString(this.options, 'defaultType');
        const isMargin = this.safeValue(params, 'margin', false);
        params = this.omit(params, 'margin');
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams(methodName, params);
        if (marginMode !== undefined) {
            if (marginMode !== 'cross') {
                throw new errors.NotSupported(this.id + ' only cross margin is supported');
            }
        }
        else {
            if ((defaultType === 'margin') || (isMargin === true)) {
                marginMode = 'cross';
            }
        }
        return [marginMode, params];
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //        full_name: 'Alchemix',
        //        default_network: 'ETH',
        //        network_list: [
        //          {
        //            network_id: 'ETH',
        //            withdrawal_fee: '0.25000000',
        //            withdraw_enabled: true,
        //            min_withdrawal_amount: '0.5',
        //            deposit_enabled: true,
        //            confirmation_required: '0'
        //          }
        //        ]
        //    }
        //
        const networkList = this.safeValue(fee, 'network_list');
        const networkListLength = networkList.length;
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
        if (networkList !== undefined) {
            for (let i = 0; i < networkListLength; i++) {
                const networkInfo = networkList[i];
                const networkId = this.safeString(networkInfo, 'network_id');
                const currencyCode = this.safeString(currency, 'code');
                const networkCode = this.networkIdToCode(networkId, currencyCode);
                result['networks'][networkCode] = {
                    'deposit': { 'fee': undefined, 'percentage': undefined },
                    'withdraw': { 'fee': this.safeNumber(networkInfo, 'withdrawal_fee'), 'percentage': false },
                };
                if (networkListLength === 1) {
                    result['withdraw']['fee'] = this.safeNumber(networkInfo, 'withdrawal_fee');
                    result['withdraw']['percentage'] = false;
                }
            }
        }
        return result;
    }
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://exchange-docs.crypto.com/spot/index.html#private-get-currency-networks
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets();
        const response = await this.v2PrivatePostPrivateGetCurrencyNetworks(params);
        const data = this.safeValue(response, 'result');
        const currencyMap = this.safeValue(data, 'currency_map');
        return this.parseDepositWithdrawFees(currencyMap, codes, 'full_name');
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = this.safeString(api, 0);
        const access = this.safeString(api, 1);
        let url = this.urls['api'][type] + '/' + path;
        const query = this.omit(params, this.extractParams(path));
        if (access === 'public') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else {
            this.checkRequiredCredentials();
            const nonce = this.nonce().toString();
            const requestParams = this.extend({}, params);
            const keysorted = this.keysort(requestParams);
            const paramsKeys = Object.keys(keysorted);
            let strSortKey = '';
            for (let i = 0; i < paramsKeys.length; i++) {
                strSortKey = strSortKey + paramsKeys[i].toString() + requestParams[paramsKeys[i]].toString();
            }
            const payload = path + nonce + this.apiKey + strSortKey + nonce;
            const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256.sha256);
            const paramsKeysLength = paramsKeys.length;
            body = this.json({
                'id': nonce,
                'method': path,
                'params': params,
                'api_key': this.apiKey,
                'sig': signature,
                'nonce': nonce,
            });
            // fix issue https://github.com/ccxt/ccxt/issues/11179
            // php always encodes dictionaries as arrays
            // if an array is empty, php will put it in square brackets
            // python and js will put it in curly brackets
            // the code below checks and replaces those brackets in empty requests
            if (paramsKeysLength === 0) {
                const paramsString = '{}';
                const arrayString = '[]';
                body = body.replace(arrayString, paramsString);
            }
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString(response, 'code');
        if (errorCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            throw new errors.ExchangeError(this.id + ' ' + body);
        }
        return undefined;
    }
}

module.exports = cryptocom;
