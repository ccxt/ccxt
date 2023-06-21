
//  ---------------------------------------------------------------------------

import Exchange from './abstract/cryptocom.js';
import { Precise } from './base/Precise.js';
import { AuthenticationError, ArgumentsRequired, ExchangeError, InsufficientFunds, DDoSProtection, InvalidNonce, PermissionDenied, BadRequest, BadSymbol, NotSupported, AccountNotEnabled, OnMaintenance, InvalidOrder } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

export default class cryptocom extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptocom',
            'name': 'Crypto.com',
            'countries': [ 'MT' ],
            'version': 'v2',
            'rateLimit': 10, // 100 requests per second
            'certified': true,
            'pro': true,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': undefined, // has but not fully implemented
                'future': undefined, // has but not fully implemented
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
                'fetchDepositsWithdrawals': false,
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
                    'maker': this.parseNumber ('0.004'),
                    'taker': this.parseNumber ('0.004'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.004') ],
                            [ this.parseNumber ('25000'), this.parseNumber ('0.0035') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('20000000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('200000000'), this.parseNumber ('0.0004') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.004') ],
                            [ this.parseNumber ('25000'), this.parseNumber ('0.0035') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0025') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.00015') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00014') ],
                            [ this.parseNumber ('20000000'), this.parseNumber ('0.00013') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00012') ],
                            [ this.parseNumber ('200000000'), this.parseNumber ('0.0001') ],
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
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '10001': ExchangeError,
                    '10002': PermissionDenied,
                    '10003': PermissionDenied,
                    '10004': BadRequest,
                    '10005': PermissionDenied,
                    '10006': DDoSProtection,
                    '10007': InvalidNonce,
                    '10008': BadRequest,
                    '10009': BadRequest,
                    '20001': BadRequest,
                    '20002': InsufficientFunds,
                    '20005': AccountNotEnabled, // {"id":"123xxx","method":"private/margin/xxx","code":"20005","message":"ACCOUNT_NOT_FOUND"}
                    '30003': BadSymbol,
                    '30004': BadRequest,
                    '30005': BadRequest,
                    '30006': InvalidOrder,
                    '30007': InvalidOrder,
                    '30008': InvalidOrder,
                    '30009': InvalidOrder,
                    '30010': BadRequest,
                    '30013': InvalidOrder,
                    '30014': InvalidOrder,
                    '30016': InvalidOrder,
                    '30017': InvalidOrder,
                    '30023': InvalidOrder,
                    '30024': InvalidOrder,
                    '30025': InvalidOrder,
                    '40001': BadRequest,
                    '40002': BadRequest,
                    '40003': BadRequest,
                    '40004': BadRequest,
                    '40005': BadRequest,
                    '40006': BadRequest,
                    '40007': BadRequest,
                    '40101': AuthenticationError,
                    '50001': BadRequest,
                    '9010001': OnMaintenance, // {"code":9010001,"message":"SYSTEM_MAINTENANCE","details":"Crypto.com Exchange is currently under maintenance. Please refer to https://status.crypto.com for more details."}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name cryptocom#fetchMarkets
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-instruments
         * @description retrieves data on all markets for cryptocom
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.v1PublicGetPublicGetInstruments (params);
        //
        //     {
        //         "id": 1,
        //         "method": "public/get-instruments",
        //         "code": 0,
        //         "result": {
        //             "data": [
        //                 {
        //                     "symbol": "BTC_USDT",
        //                     "inst_type": "CCY_PAIR",
        //                     "display_name": "BTC/USDT",
        //                     "base_ccy": "BTC",
        //                     "quote_ccy": "USDT",
        //                     "quote_decimals": 2,
        //                     "quantity_decimals": 5,
        //                     "price_tick_size": "0.01",
        //                     "qty_tick_size": "0.00001",
        //                     "max_leverage": "50",
        //                     "tradable": true,
        //                     "expiry_timestamp_ms": 0,
        //                     "beta_product": false,
        //                     "margin_buy_enabled": false,
        //                     "margin_sell_enabled": true
        //                 },
        //                 {
        //                     "symbol": "RUNEUSD-PERP",
        //                     "inst_type": "PERPETUAL_SWAP",
        //                     "display_name": "RUNEUSD Perpetual",
        //                     "base_ccy": "RUNE",
        //                     "quote_ccy": "USD",
        //                     "quote_decimals": 3,
        //                     "quantity_decimals": 1,
        //                     "price_tick_size": "0.001",
        //                     "qty_tick_size": "0.1",
        //                     "max_leverage": "50",
        //                     "tradable": true,
        //                     "expiry_timestamp_ms": 0,
        //                     "beta_product": false,
        //                     "underlying_symbol": "RUNEUSD-INDEX",
        //                     "contract_size": "1",
        //                     "margin_buy_enabled": false,
        //                     "margin_sell_enabled": false
        //                 },
        //                 {
        //                     "symbol": "ETHUSD-230825",
        //                     "inst_type": "FUTURE",
        //                     "display_name": "ETHUSD Futures 20230825",
        //                     "base_ccy": "ETH",
        //                     "quote_ccy": "USD",
        //                     "quote_decimals": 2,
        //                     "quantity_decimals": 4,
        //                     "price_tick_size": "0.01",
        //                     "qty_tick_size": "0.0001",
        //                     "max_leverage": "100",
        //                     "tradable": true,
        //                     "expiry_timestamp_ms": 1692950400000,
        //                     "beta_product": false,
        //                     "underlying_symbol": "ETHUSD-INDEX",
        //                     "contract_size": "1",
        //                     "margin_buy_enabled": false,
        //                     "margin_sell_enabled": false
        //                 },
        //                 {
        //                     "symbol": "BTCUSD-230630-CW30000",
        //                     "inst_type": "WARRANT",
        //                     "display_name": "BTCUSD-230630-CW30000",
        //                     "base_ccy": "BTC",
        //                     "quote_ccy": "USD",
        //                     "quote_decimals": 3,
        //                     "quantity_decimals": 0,
        //                     "price_tick_size": "0.001",
        //                     "qty_tick_size": "10",
        //                     "max_leverage": "50",
        //                     "tradable": true,
        //                     "expiry_timestamp_ms": 1688112000000,
        //                     "beta_product": false,
        //                     "underlying_symbol": "BTCUSD-INDEX",
        //                     "put_call": "CALL",
        //                     "strike": "30000",
        //                     "contract_size": "0.0001",
        //                     "margin_buy_enabled": false,
        //                     "margin_sell_enabled": false
        //                 },
        //             ]
        //         }
        //     }
        //
        const resultResponse = this.safeValue (response, 'result', {});
        const data = this.safeValue (resultResponse, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const inst_type = this.safeString (market, 'inst_type');
            const spot = inst_type === 'CCY_PAIR';
            const swap = inst_type === 'PERPETUAL_SWAP';
            const future = inst_type === 'FUTURE';
            const option = inst_type === 'WARRANT';
            const baseId = this.safeString (market, 'base_ccy');
            const quoteId = this.safeString (market, 'quote_ccy');
            const settleId = spot ? undefined : quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = spot ? undefined : this.safeCurrencyCode (settleId);
            const optionType = this.safeStringLower (market, 'put_call');
            const strike = this.safeString (market, 'strike');
            const marginBuyEnabled = this.safeValue (market, 'margin_buy_enabled');
            const marginSellEnabled = this.safeValue (market, 'margin_sell_enabled');
            const expiry = this.omitZero (this.safeInteger (market, 'expiry_timestamp_ms'));
            let symbol = base + '/' + quote;
            let type = undefined;
            let contract = undefined;
            if (inst_type === 'CCY_PAIR') {
                type = 'spot';
                contract = false;
            } else if (inst_type === 'PERPETUAL_SWAP') {
                type = 'swap';
                symbol = symbol + ':' + quote;
                contract = true;
            } else if (inst_type === 'FUTURE') {
                type = 'future';
                symbol = symbol + ':' + quote + '-' + this.yymmdd (expiry);
                contract = true;
            } else if (inst_type === 'WARRANT') {
                type = 'option';
                const symbolOptionType = (optionType === 'call') ? 'C' : 'P';
                symbol = symbol + ':' + quote + '-' + this.yymmdd (expiry) + '-' + strike + '-' + symbolOptionType;
                contract = true;
            }
            result.push ({
                'id': this.safeString (market, 'symbol'),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': ((marginBuyEnabled) || (marginSellEnabled)),
                'swap': swap,
                'future': future,
                'option': option,
                'active': this.safeValue (market, 'tradable'),
                'contract': contract,
                'linear': (contract) ? true : undefined,
                'inverse': (contract) ? false : undefined,
                'contractSize': this.safeNumber (market, 'contract_size'),
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'strike': this.parseNumber (strike),
                'optionType': optionType,
                'precision': {
                    'price': this.parseNumber (this.safeString (market, 'price_tick_size')),
                    'amount': this.parseNumber (this.safeString (market, 'qty_tick_size')),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (market, 'max_leverage'),
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
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
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
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue (symbols, 0);
            market = this.market (symbol);
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v2PublicGetPublicGetTicker',
            'future': 'derivativesPublicGetPublicGetTickers',
            'swap': 'derivativesPublicGetPublicGetTickers',
        });
        const response = await this[method] (query);
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTickers (data, symbols);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTicker', market, params);
        if (marketType !== 'spot') {
            throw new NotSupported (this.id + ' fetchTicker() only supports spot markets');
        }
        const response = await this.v2PublicGetPublicGetTicker (this.extend (request, query));
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
        const resultResponse = this.safeValue (response, 'result', {});
        const data = this.safeValue (resultResponse, 'data', {});
        const first = this.safeValue (data, 0, {});
        return this.parseTicker (first, market);
    }

    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-history
         * @param {string} symbol unified market symbol of the market the orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for, max date range is one day
         * @param {int|undefined} limit the maximum number of order structures to retrieve, default 100 max 100
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @param {int|undefined} params.until timestamp in ms for the ending date filter, default is the current time
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'until', 'till' ]);
        if (until !== undefined) {
            request['end_time'] = until;
        }
        const response = await this.v1PrivatePostPrivateGetOrderHistory (this.extend (request, params));
        //
        //     {
        //         "id": 1686881486183,
        //         "method": "private/get-order-history",
        //         "code": 0,
        //         "result": {
        //             "data": [
        //                 {
        //                     "account_id": "ce075bef-1234-4321-bd6g-ff9007252e63",
        //                     "order_id": "6142909895014042762",
        //                     "client_oid": "4e918597-1234-4321-8201-a7577e1e1d91",
        //                     "order_type": "MARKET",
        //                     "time_in_force": "GOOD_TILL_CANCEL",
        //                     "side": "SELL",
        //                     "exec_inst": [ ],
        //                     "quantity": "0.00024",
        //                     "order_value": "5.7054672",
        //                     "maker_fee_rate": "0",
        //                     "taker_fee_rate": "0",
        //                     "avg_price": "25023.97",
        //                     "trigger_price": "0",
        //                     "ref_price": "0",
        //                     "ref_price_type": "NULL_VAL",
        //                     "cumulative_quantity": "0.00024",
        //                     "cumulative_value": "6.0057528",
        //                     "cumulative_fee": "0.001501438200",
        //                     "status": "FILLED",
        //                     "update_user_id": "ce075bef-1234-4321-bd6g-ff9007252e63",
        //                     "order_date": "2023-06-15",
        //                     "instrument_name": "BTC_USD",
        //                     "fee_instrument_name": "USD",
        //                     "create_time": 1686805465891,
        //                     "create_time_ns": "1686805465891812578",
        //                     "update_time": 1686805465891
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'result', {});
        const orders = this.safeValue (data, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchTrades
         * @description get a list of the most recent trades for a particular symbol
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch, maximum date range is one day
         * @param {int|undefined} limit the maximum number of trades to fetch
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @param {int|undefined} params.until timestamp in ms for the ending date filter, default is the current time
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (since !== undefined) {
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'until', 'till' ]);
        if (until !== undefined) {
            request['end_ts'] = until;
        }
        const response = await this.v1PublicGetPublicGetTrades (this.extend (request, params));
        //
        //     {
        //         "id": -1,
        //         "method": "public/get-trades",
        //         "code": 0,
        //         "result": {
        //             "data": [
        //                 {
        //                     "s": "sell",
        //                     "p": "26386.00",
        //                     "q": "0.00453",
        //                     "t": 1686944282062,
        //                     "d": "4611686018455979970",
        //                     "i": "BTC_USD"
        //                 },
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-candlestick
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @param {int|undefined} params.until timestamp in ms for the ending date filter, default is the current time
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            'timeframe': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'until', 'till' ]);
        if (until !== undefined) {
            request['end_ts'] = until;
        }
        const response = await this.v1PublicGetPublicGetCandlestick (this.extend (request, params));
        //
        //     {
        //         "id": -1,
        //         "method": "public/get-candlestick",
        //         "code": 0,
        //         "result": {
        //             "interval": "1m",
        //             "data": [
        //                 {
        //                     "o": "26949.89",
        //                     "h": "26957.64",
        //                     "l": "26948.24",
        //                     "c": "26950.00",
        //                     "v": "0.0670",
        //                     "t": 1687237080000
        //                 },
        //             ],
        //             "instrument_name": "BTC_USD"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (limit) {
            request['depth'] = limit;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderBook', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v2PublicGetPublicGetBook',
            'future': 'derivativesPublicGetPublicGetBook',
            'swap': 'derivativesPublicGetPublicGetBook',
        });
        const response = await this[method] (this.extend (request, query));
        // {
        //     "code":0,
        //     "method":"public/get-book",
        //     "result":{
        //       "bids":[[9668.44,0.006325,1.0],[9659.75,0.006776,1.0],[9653.14,0.011795,1.0],[9647.13,0.019434,1.0],[9634.62,0.013765,1.0],[9633.81,0.021395,1.0],[9628.46,0.037834,1.0],[9627.6,0.020909,1.0],[9621.51,0.026235,1.0],[9620.83,0.026701,1.0]],
        //       "asks":[[9697.0,0.68251,1.0],[9697.6,1.722864,2.0],[9699.2,1.664177,2.0],[9700.8,1.824953,2.0],[9702.4,0.85778,1.0],[9704.0,0.935792,1.0],[9713.32,0.002926,1.0],[9716.42,0.78923,1.0],[9732.19,0.00645,1.0],[9737.88,0.020216,1.0]],
        //       "t":1591704180270
        //     }
        // }
        const result = this.safeValue (response, 'result');
        const data = this.safeValue (result, 'data');
        const orderBook = this.safeValue (data, 0);
        const timestamp = this.safeInteger (orderBook, 't');
        return this.parseOrderBook (orderBook, symbol, timestamp);
    }

    parseBalance (response) {
        const responseResult = this.safeValue (response, 'result', {});
        const data = this.safeValue (responseResult, 'data', []);
        const positionBalances = this.safeValue (data[0], 'position_balances', []);
        const result = { 'info': response };
        for (let i = 0; i < positionBalances.length; i++) {
            const balance = positionBalances[i];
            const currencyId = this.safeString (balance, 'instrument_name');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'quantity');
            account['used'] = this.safeString (balance, 'reserved_qty');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name cryptocom#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-user-balance
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.v1PrivatePostPrivateUserBalance (params);
        //
        //     {
        //         "id": 1687300499018,
        //         "method": "private/user-balance",
        //         "code": 0,
        //         "result": {
        //             "data": [
        //                 {
        //                     "total_available_balance": "5.84684368",
        //                     "total_margin_balance": "5.84684368",
        //                     "total_initial_margin": "0",
        //                     "total_maintenance_margin": "0",
        //                     "total_position_cost": "0",
        //                     "total_cash_balance": "6.44412101",
        //                     "total_collateral_value": "5.846843685",
        //                     "total_session_unrealized_pnl": "0",
        //                     "instrument_name": "USD",
        //                     "total_session_realized_pnl": "0",
        //                     "position_balances": [
        //                         {
        //                             "quantity": "0.0002119875",
        //                             "reserved_qty": "0",
        //                             "collateral_weight": "0.9",
        //                             "collateral_amount": "5.37549592",
        //                             "market_value": "5.97277325",
        //                             "max_withdrawal_balance": "0.00021198",
        //                             "instrument_name": "BTC",
        //                             "hourly_interest_rate": "0"
        //                         },
        //                     ],
        //                     "total_effective_leverage": "0",
        //                     "position_limit": "3000000",
        //                     "used_position_limit": "0",
        //                     "total_borrow": "0",
        //                     "margin_score": "0",
        //                     "is_liquidating": false,
        //                     "has_risk": false,
        //                     "terminatable": true
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-detail
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'order_id': id,
        };
        const response = await this.v1PrivatePostPrivateGetOrderDetail (this.extend (request, params));
        //
        //     {
        //         "id": 1686872583882,
        //         "method": "private/get-order-detail",
        //         "code": 0,
        //         "result": {
        //             "account_id": "ae075bef-1234-4321-bd6g-bb9007252a63",
        //             "order_id": "6142909895025252686",
        //             "client_oid": "CCXT_c2d2152cc32d40a3ae7fbf",
        //             "order_type": "LIMIT",
        //             "time_in_force": "GOOD_TILL_CANCEL",
        //             "side": "BUY",
        //             "exec_inst": [ ],
        //             "quantity": "0.00020",
        //             "limit_price": "20000.00",
        //             "order_value": "4",
        //             "avg_price": "0",
        //             "trigger_price": "0",
        //             "ref_price": "0",
        //             "cumulative_quantity": "0",
        //             "cumulative_value": "0",
        //             "cumulative_fee": "0",
        //             "status": "ACTIVE",
        //             "update_user_id": "ae075bef-1234-4321-bd6g-bb9007252a63",
        //             "order_date": "2023-06-15",
        //             "instrument_name": "BTC_USD",
        //             "fee_instrument_name": "BTC",
        //             "create_time": 1686870220684,
        //             "create_time_ns": "1686870220684239675",
        //             "update_time": 1686870220684
        //         }
        //     }
        //
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const request = {
            'instrument_name': market['id'],
            'side': side.toUpperCase (),
            'type': uppercaseType,
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if ((uppercaseType === 'LIMIT') || (uppercaseType === 'STOP_LIMIT')) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const broker = this.safeString (this.options, 'broker', 'CCXT_');
        let clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            clientOrderId = broker + this.uuid22 ();
        }
        request['client_oid'] = clientOrderId;
        const postOnly = this.safeValue (params, 'postOnly', false);
        if (postOnly) {
            request['exec_inst'] = 'POST_ONLY';
        }
        params = this.omit (params, [ 'postOnly', 'clientOrderId' ]);
        const [ marketType, marketTypeQuery ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'v2PrivatePostPrivateCreateOrder',
            'margin': 'v2PrivatePostPrivateMarginCreateOrder',
            'future': 'derivativesPrivatePostPrivateCreateOrder',
            'swap': 'derivativesPrivatePostPrivateCreateOrder',
        });
        const [ marginMode, query ] = this.customHandleMarginModeAndParams ('createOrder', marketTypeQuery);
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginCreateOrder';
        }
        const response = await this[method] (this.extend (request, query));
        // {
        //     "id": 11,
        //     "method": "private/create-order",
        //     "result": {
        //       "order_id": "337843775021233500",
        //       "client_oid": "my_order_0002"
        //     }
        // }
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#cancelAllOrders
         * @description cancel all open orders
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders
         * @param {string|undefined} symbol unified market symbol of the orders to cancel
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        return await this.v1PrivatePostPrivateCancelAllOrders (this.extend (request, params));
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#cancelOrder
         * @description cancels an open order
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order
         * @param {string} id the order id of the order to cancel
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'order_id': id,
        };
        const response = await this.v1PrivatePostPrivateCancelOrder (this.extend (request, params));
        //
        //     {
        //         "id": 1686882846638,
        //         "method": "private/cancel-order",
        //         "code": 0,
        //         "message": "NO_ERROR",
        //         "result": {
        //             "client_oid": "CCXT_c2d2152cc32d40a3ae7fbf",
        //             "order_id": "6142909895025252686"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-open-orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of open order structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        const response = await this.v1PrivatePostPrivateGetOpenOrders (this.extend (request, params));
        //
        //     {
        //         "id": 1686806134961,
        //         "method": "private/get-open-orders",
        //         "code": 0,
        //         "result": {
        //             "data": [
        //                 {
        //                     "account_id": "ce075bef-1234-4321-bd6g-ff9007252e63",
        //                     "order_id": "6530219477767564494",
        //                     "client_oid": "CCXT_7ce730f0388441df9bc218",
        //                     "order_type": "LIMIT",
        //                     "time_in_force": "GOOD_TILL_CANCEL",
        //                     "side": "BUY",
        //                     "exec_inst": [ ],
        //                     "quantity": "0.00020",
        //                     "limit_price": "20000.00",
        //                     "order_value": "4",
        //                     "avg_price": "0",
        //                     "trigger_price": "0",
        //                     "ref_price": "0",
        //                     "cumulative_quantity": "0",
        //                     "cumulative_value": "0",
        //                     "cumulative_fee": "0",
        //                     "status": "ACTIVE",
        //                     "update_user_id": "ce075bef-1234-4321-bd6g-gg9007252e63",
        //                     "order_date": "2023-06-15",
        //                     "instrument_name": "BTC_USD",
        //                     "fee_instrument_name": "BTC",
        //                     "create_time": 1686806053992,
        //                     "create_time_ns": "1686806053992921880",
        //                     "update_time": 1686806053993
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'result', {});
        const orders = this.safeValue (data, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-trades
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for, maximum date range is one day
         * @param {int|undefined} limit the maximum number of trade structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @param {int|undefined} params.until timestamp in ms for the ending date filter, default is the current time
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'until', 'till' ]);
        if (until !== undefined) {
            request['end_time'] = until;
        }
        const response = await this.v1PrivatePostPrivateGetTrades (this.extend (request, params));
        //
        //     {
        //         "id": 1686942003520,
        //         "method": "private/get-trades",
        //         "code": 0,
        //         "result": {
        //             "data": [
        //                 {
        //                     "account_id": "ds075abc-1234-4321-bd6g-ff9007252r63",
        //                     "event_date": "2023-06-16",
        //                     "journal_type": "TRADING",
        //                     "side": "BUY",
        //                     "instrument_name": "BTC_USD",
        //                     "fees": "-0.0000000525",
        //                     "trade_id": "6142909898247428343",
        //                     "trade_match_id": "4611686018455978480",
        //                     "create_time": 1686941992887,
        //                     "traded_price": "26347.16",
        //                     "traded_quantity": "0.00021",
        //                     "fee_instrument_name": "BTC",
        //                     "client_oid": "d1c70a60-810e-4c92-b2a0-72b931cb31e0",
        //                     "taker_side": "TAKER",
        //                     "order_id": "6142909895036331486",
        //                     "create_time_ns": "1686941992887207066"
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseAddress (addressString) {
        let address = undefined;
        let tag = undefined;
        let rawTag = undefined;
        if (addressString.indexOf ('?') > 0) {
            [ address, rawTag ] = addressString.split ('?');
            const splitted = rawTag.split ('=');
            tag = splitted[1];
        } else {
            address = addressString;
        }
        return [ address, tag ];
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
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
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['address_tag'] = tag;
        }
        const response = await this.v2PrivatePostPrivateCreateWithdrawal (this.extend (request, params));
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
        const result = this.safeValue (response, 'result');
        return this.parseTransaction (result, currency);
    }

    async fetchDepositAddressesByNetwork (code: string, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchDepositAddressesByNetwork
         * @description fetch a dictionary of addresses for a currency, indexed by network
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.v2PrivatePostPrivateGetDepositAddress (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const addresses = this.safeValue (data, 'deposit_address_list', []);
        const addressesLength = addresses.length;
        if (addressesLength === 0) {
            throw new ExchangeError (this.id + ' fetchDepositAddressesByNetwork() generating address...');
        }
        const result = {};
        for (let i = 0; i < addressesLength; i++) {
            const value = this.safeValue (addresses, i);
            const addressString = this.safeString (value, 'address');
            const currencyId = this.safeString (value, 'currency');
            const responseCode = this.safeCurrencyCode (currencyId);
            const [ address, tag ] = this.parseAddress (addressString);
            this.checkAddress (address);
            const networkId = this.safeString (value, 'network');
            const network = this.safeNetwork (networkId);
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

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        const network = this.safeStringUpper (params, 'network');
        params = this.omit (params, [ 'network' ]);
        const depositAddresses = await this.fetchDepositAddressesByNetwork (code, params);
        if (network in depositAddresses) {
            return depositAddresses[network];
        } else {
            const keys = Object.keys (depositAddresses);
            return depositAddresses[keys[0]];
        }
    }

    safeNetwork (networkId) {
        const networksById = {
            'BTC': 'BTC',
            'ETH': 'ETH',
            'SOL': 'SOL',
            'BNB': 'BNB',
            'CRONOS': 'CRONOS',
            'MATIC': 'MATIC',
            'OP': 'OP',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            // 90 days date range
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.v2PrivatePostPrivateGetDepositHistory (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const depositList = this.safeValue (data, 'deposit_list', []);
        return this.parseTransactions (depositList, currency, since, limit);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            // 90 days date range
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.v2PrivatePostPrivateGetWithdrawalHistory (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const withdrawalList = this.safeValue (data, 'withdrawal_list', []);
        return this.parseTransactions (withdrawalList, currency, since, limit);
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
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
        await this.loadMarkets ();
        const currency = this.currency (code);
        fromAccount = fromAccount.toLowerCase ();
        toAccount = toAccount.toLowerCase ();
        const accountsById = this.safeValue (this.options, 'accountsById', {});
        const fromId = this.safeString (accountsById, fromAccount, fromAccount);
        const toId = this.safeString (accountsById, toAccount, toAccount);
        const request = {
            'currency': currency['id'],
            'amount': parseFloat (amount),
            'from': fromId,
            'to': toId,
        };
        let method = 'v2PrivatePostPrivateDerivTransfer';
        if ((fromAccount === 'margin') || (toAccount === 'margin')) {
            method = 'v2PrivatePostPrivateMarginTransfer';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "id": 11,
        //         "method": "private/deriv/transfer",
        //         "code": 0
        //     }
        //
        return this.parseTransfer (response, currency);
    }

    async fetchTransfers (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
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
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a direction param to be either "IN" or "OUT"');
        }
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'direction': 'OUT',
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        let method = 'v2PrivatePostPrivateDerivGetTransferHistory';
        const [ marginMode, query ] = this.customHandleMarginModeAndParams ('fetchTransfers', params);
        if (marginMode !== undefined) {
            method = 'v2PrivatePostPrivateMarginGetTransferHistory';
        }
        const response = await this[method] (this.extend (request, query));
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
        transfer.push ({
            'response': response,
        });
        return this.parseTransfers (transfer, currency, since, limit, params);
    }

    parseTransferStatus (status) {
        const statuses = {
            'COMPLETED': 'ok',
            'PROCESSING': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransfer (transfer, currency = undefined) {
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
        const response = this.safeValue (transfer, 'response', {});
        const result = this.safeValue (response, 'result', {});
        const transferList = this.safeValue (result, 'transfer_list', []);
        let timestamp = undefined;
        let amount = undefined;
        let code = undefined;
        let information = undefined;
        let status = undefined;
        for (let i = 0; i < transferList.length; i++) {
            const entry = transferList[i];
            timestamp = this.safeInteger (entry, 'time');
            amount = this.safeNumber (entry, 'amount');
            const currencyId = this.safeString (entry, 'currency');
            code = this.safeCurrencyCode (currencyId);
            information = this.safeString (entry, 'information');
            const rawStatus = this.safeString (entry, 'status');
            status = this.parseTransferStatus (rawStatus);
        }
        let fromAccount = undefined;
        let toAccount = undefined;
        if (information !== undefined) {
            const parts = information.split (' ');
            const direction = this.safeStringLower (parts, 0);
            const method = this.safeString (response, 'method');
            if (direction === 'from') {
                fromAccount = this.safeStringLower (parts, 1);
                if (method === 'private/margin/get-transfer-history') {
                    toAccount = 'margin';
                } else {
                    toAccount = 'derivative';
                }
            } else if (direction === 'to') {
                toAccount = this.safeStringLower (parts, 1);
                if (method === 'private/margin/get-transfer-history') {
                    fromAccount = 'margin';
                } else {
                    fromAccount = 'derivative';
                }
            }
        }
        return {
            'info': transferList,
            'id': this.safeString (response, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        };
    }

    parseTicker (ticker, market = undefined) {
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
        const timestamp = this.safeInteger (ticker, 't');
        const marketId = this.safeString (ticker, 'i');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'a');
        const relativeChange = this.safeString (ticker, 'c');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'k'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': relativeChange,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //
        //     {
        //         "s": "sell",
        //         "p": "26386.00",
        //         "q": "0.00453",
        //         "t": 1686944282062,
        //         "d": "4611686018455979970",
        //         "i": "BTC_USD"
        //     }
        //
        // fetchMyTrades
        //
        //     {
        //         "account_id": "ds075abc-1234-4321-bd6g-ff9007252r63",
        //         "event_date": "2023-06-16",
        //         "journal_type": "TRADING",
        //         "side": "BUY",
        //         "instrument_name": "BTC_USD",
        //         "fees": "-0.0000000525",
        //         "trade_id": "6142909898247428343",
        //         "trade_match_id": "4611686018455978480",
        //         "create_time": 1686941992887,
        //         "traded_price": "26347.16",
        //         "traded_quantity": "0.00021",
        //         "fee_instrument_name": "BTC",
        //         "client_oid": "d1c70a60-1234-4c92-b2a0-72b931cb31e0",
        //         "taker_side": "TAKER",
        //         "order_id": "6142909895036331486",
        //         "create_time_ns": "1686941992887207066"
        //     }
        //
        const timestamp = this.safeInteger2 (trade, 't', 'create_time');
        const marketId = this.safeString2 (trade, 'i', 'instrument_name');
        market = this.safeMarket (marketId, market, '_');
        const feeCurrency = this.safeString (trade, 'fee_instrument_name');
        const feeCostString = this.safeString (trade, 'fees');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'd', 'trade_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'order_id'),
            'side': this.safeStringLower2 (trade, 's', 'side'),
            'takerOrMaker': this.safeStringLower (trade, 'taker_side'),
            'price': this.safeNumber2 (trade, 'p', 'traded_price'),
            'amount': this.safeNumber2 (trade, 'q', 'traded_quantity'),
            'cost': undefined,
            'type': undefined,
            'fee': {
                'currency': this.safeCurrencyCode (feeCurrency),
                'cost': this.parseNumber (Precise.stringNeg (feeCostString)),
            },
        }, market);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "o": "26949.89",
        //         "h": "26957.64",
        //         "l": "26948.24",
        //         "c": "26950.00",
        //         "v": "0.0670",
        //         "t": 1687237080000
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    parseOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'CANCELED': 'canceled',
            'FILLED': 'closed',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'GOOD_TILL_CANCEL': 'GTC',
            'IMMEDIATE_OR_CANCEL': 'IOC',
            'FILL_OR_KILL': 'FOK',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, cancelOrder
        //
        //     {
        //         "order_id": "6540219377766741832",
        //         "client_oid": "CCXT_d6ef7c3db6c1495aa8b757"
        //     }
        //
        // fetchOpenOrders, fetchOrder, fetchOrders
        //
        //     {
        //         "account_id": "ce075bef-1234-4321-bd6g-ff9007252e63",
        //         "order_id": "6530219477767564494",
        //         "client_oid": "CCXT_7ce730f0388441df9bc218",
        //         "order_type": "LIMIT",
        //         "time_in_force": "GOOD_TILL_CANCEL",
        //         "side": "BUY",
        //         "exec_inst": [ ],
        //         "quantity": "0.00020",
        //         "limit_price": "20000.00",
        //         "order_value": "4",
        //         "avg_price": "0",
        //         "trigger_price": "0",
        //         "ref_price": "0",
        //         "cumulative_quantity": "0",
        //         "cumulative_value": "0",
        //         "cumulative_fee": "0",
        //         "status": "ACTIVE",
        //         "update_user_id": "ce075bef-1234-4321-bd6g-gg9007252e63",
        //         "order_date": "2023-06-15",
        //         "instrument_name": "BTC_USD",
        //         "fee_instrument_name": "BTC",
        //         "create_time": 1686806053992,
        //         "create_time_ns": "1686806053992921880",
        //         "update_time": 1686806053993
        //     }
        //
        const created = this.safeInteger (order, 'create_time');
        const marketId = this.safeString (order, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const execInst = this.safeString (order, 'exec_inst');
        let postOnly = undefined;
        if (execInst !== undefined) {
            postOnly = (execInst === 'POST_ONLY');
        }
        const feeCurrency = this.safeString (order, 'fee_instrument_name');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': this.safeString (order, 'client_oid'),
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': this.safeInteger (order, 'update_time'),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': symbol,
            'type': this.safeStringLower (order, 'order_type'),
            'timeInForce': this.parseTimeInForce (this.safeString (order, 'time_in_force')),
            'postOnly': postOnly,
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeNumber (order, 'limit_price'),
            'amount': this.safeNumber (order, 'quantity'),
            'filled': this.safeNumber (order, 'cumulative_quantity'),
            'remaining': undefined,
            'average': this.safeNumber (order, 'avg_price'),
            'cost': this.safeNumber (order, 'cumulative_value'),
            'fee': {
                'currency': this.safeCurrencyCode (feeCurrency),
                'cost': this.safeNumber (order, 'cumulative_fee'),
            },
            'trades': [],
        }, market);
    }

    parseDepositStatus (status) {
        const statuses = {
            '0': 'pending',
            '1': 'ok',
            '2': 'failed',
            '3': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseWithdrawalStatus (status) {
        const statuses = {
            '0': 'pending',
            '1': 'pending',
            '2': 'failed',
            '3': 'pending',
            '4': 'failed',
            '5': 'ok',
            '6': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
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
        const rawStatus = this.safeString (transaction, 'status');
        let status = undefined;
        if ('client_wid' in transaction) {
            type = 'withdrawal';
            status = this.parseWithdrawalStatus (rawStatus);
        } else {
            type = 'deposit';
            status = this.parseDepositStatus (rawStatus);
        }
        const id = this.safeString (transaction, 'id');
        const addressString = this.safeString (transaction, 'address');
        const [ address, tag ] = this.parseAddress (addressString);
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'create_time');
        const amount = this.safeNumber (transaction, 'amount');
        const txId = this.safeString (transaction, 'txid');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const updated = this.safeInteger (transaction, 'update_time');
        return {
            'info': transaction,
            'id': id,
            'txid': txId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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

    async repayMargin (code: string, amount, symbol: string = undefined, params = {}) {
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
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        const response = await this.v2PrivatePostPrivateMarginRepay (this.extend (request, params));
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
        const transaction = this.parseMarginLoan (response, currency);
        return this.extend (transaction, {
            'amount': amount,
        });
    }

    async borrowMargin (code: string, amount, symbol: string = undefined, params = {}) {
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
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        const response = await this.v2PrivatePostPrivateMarginBorrow (this.extend (request, params));
        //
        //     {
        //         "id": 1656619578559,
        //         "method": "private/margin/borrow",
        //         "code": 0
        //     }
        //
        const transaction = this.parseMarginLoan (response, currency);
        return this.extend (transaction, {
            'amount': amount,
        });
    }

    parseMarginLoan (info, currency = undefined) {
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
            'id': this.safeInteger (info, 'id'),
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    async fetchBorrowInterest (code: string = undefined, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let currency = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_ts'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.v2PrivatePostPrivateMarginGetInterestHistory (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const rows = this.safeValue (data, 'list', []);
        let interest = undefined;
        for (let i = 0; i < rows.length; i++) {
            interest = this.parseBorrowInterests (rows, market);
        }
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info, market = undefined) {
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
        const timestamp = this.safeInteger (info, 'time');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'marginMode': undefined,
            'currency': this.safeCurrencyCode (this.safeString (info, 'currency')),
            'interest': this.safeNumber (info, 'interest'),
            'interestRate': this.safeNumber (info, 'interest_rate'), // hourly interest rate
            'amountBorrowed': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async fetchBorrowRates (params = {}) {
        /**
         * @method
         * @name cryptocom#fetchBorrowRates
         * @description fetch the borrow interest rates of all currencies
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
         */
        await this.loadMarkets ();
        const response = await this.v2PrivatePostPrivateMarginGetUserConfig (params);
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
        const data = this.safeValue (response, 'result', {});
        const rates = this.safeValue (data, 'currency_configs', []);
        return this.parseBorrowRates (rates, 'currency');
    }

    parseBorrowRates (info, codeKey) {
        //
        //     {
        //         "currency": "AGLD",
        //         "hourly_rate": 0.00003334,
        //         "max_borrow_limit": 342.4032393,
        //         "min_borrow_limit": 30
        //     },
        //
        const timestamp = this.milliseconds ();
        const rates = [];
        for (let i = 0; i < info.length; i++) {
            const entry = info[i];
            rates.push ({
                'currency': this.safeCurrencyCode (this.safeString (entry, 'currency')),
                'rate': this.safeNumber (entry, 'hourly_rate'),
                'period': 3600000, // 1-Hour
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'info': entry,
            });
        }
        return rates;
    }

    customHandleMarginModeAndParams (methodName, params = {}) {
        /**
         * @ignore
         * @method
         * @description marginMode specified by params["marginMode"], this.options["marginMode"], this.options["defaultMarginMode"], params["margin"] = true or this.options["defaultType"] = 'margin'
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[string|undefined, object]} the marginMode in lowercase
         */
        const defaultType = this.safeString (this.options, 'defaultType');
        const isMargin = this.safeValue (params, 'margin', false);
        params = this.omit (params, 'margin');
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams (methodName, params);
        if (marginMode !== undefined) {
            if (marginMode !== 'cross') {
                throw new NotSupported (this.id + ' only cross margin is supported');
            }
        } else {
            if ((defaultType === 'margin') || (isMargin === true)) {
                marginMode = 'cross';
            }
        }
        return [ marginMode, params ];
    }

    parseDepositWithdrawFee (fee, currency = undefined) {
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
        const networkList = this.safeValue (fee, 'network_list');
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
                const networkId = this.safeString (networkInfo, 'network_id');
                const currencyCode = this.safeString (currency, 'code');
                const networkCode = this.networkIdToCode (networkId, currencyCode);
                result['networks'][networkCode] = {
                    'deposit': { 'fee': undefined, 'percentage': undefined },
                    'withdraw': { 'fee': this.safeNumber (networkInfo, 'withdrawal_fee'), 'percentage': false },
                };
                if (networkListLength === 1) {
                    result['withdraw']['fee'] = this.safeNumber (networkInfo, 'withdrawal_fee');
                    result['withdraw']['percentage'] = false;
                }
            }
        }
        return result;
    }

    async fetchDepositWithdrawFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://exchange-docs.crypto.com/spot/index.html#private-get-currency-networks
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const response = await (this as any).v2PrivatePostPrivateGetCurrencyNetworks (params);
        const data = this.safeValue (response, 'result');
        const currencyMap = this.safeValue (data, 'currency_map');
        return this.parseDepositWithdrawFees (currencyMap, codes, 'full_name');
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = this.safeString (api, 0);
        const access = this.safeString (api, 1);
        let url = this.urls['api'][type] + '/' + path;
        const query = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const requestParams = this.extend ({}, params);
            const keysorted = this.keysort (requestParams);
            const paramsKeys = Object.keys (keysorted);
            let strSortKey = '';
            for (let i = 0; i < paramsKeys.length; i++) {
                strSortKey = strSortKey + paramsKeys[i].toString () + requestParams[paramsKeys[i]].toString ();
            }
            const payload = path + nonce + this.apiKey + strSortKey + nonce;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
            const paramsKeysLength = paramsKeys.length;
            body = this.json ({
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
                body = body.replace (arrayString, paramsString);
            }
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (this.id + ' ' + body);
        }
        return undefined;
    }
}
