
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coinex.js';
import { ExchangeError, ArgumentsRequired, BadSymbol, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError, PermissionDenied, ExchangeNotAvailable, RequestTimeout, BadRequest, RateLimitExceeded, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { md5 } from './static_dependencies/noble-hashes/md5.js';
import type { Balances, Currency, FundingHistory, FundingRateHistory, Int, Market, OHLCV, Order, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, OrderRequest } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class coinex
 * @augments Exchange
 */
export default class coinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinex',
            'name': 'CoinEx',
            'version': 'v1',
            'countries': [ 'CN' ],
            // IP ratelimit is 400 requests per second
            // rateLimit = 1000ms / 400 = 2.5
            // 200 per 2 seconds => 100 per second => weight = 4
            // 120 per 2 seconds => 60 per second => weight = 6.667
            // 80 per 2 seconds => 40 per second => weight = 10
            // 60 per 2 seconds => 30 per second => weight = 13.334
            // 40 per 2 seconds => 20 per second => weight = 20
            // 20 per 2 seconds => 10 per second => weight = 40
            'rateLimit': 2.5,
            'pro': true,
            'certified': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createReduceOnlyOrder': true,
                'createStopLossOrder': true,
                'createTakeProfitOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddressByNetwork': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': true,
                'fetchIsolatedBorrowRates': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg',
                'api': {
                    'public': 'https://api.coinex.com',
                    'private': 'https://api.coinex.com',
                    'perpetualPublic': 'https://api.coinex.com/perpetual',
                    'perpetualPrivate': 'https://api.coinex.com/perpetual',
                },
                'www': 'https://www.coinex.com',
                'doc': 'https://github.com/coinexcom/coinex_exchange_api/wiki',
                'fees': 'https://www.coinex.com/fees',
                'referral': 'https://www.coinex.com/register?refer_code=yw5fz',
            },
            'api': {
                'public': {
                    'get': {
                        'amm/market': 1,
                        'common/currency/rate': 1,
                        'common/asset/config': 1,
                        'common/maintain/info': 1,
                        'common/temp-maintain/info': 1,
                        'margin/market': 1,
                        'market/info': 1,
                        'market/list': 1,
                        'market/ticker': 1,
                        'market/ticker/all': 1,
                        'market/depth': 1,
                        'market/deals': 1,
                        'market/kline': 1,
                        'market/detail': 1,
                    },
                },
                'private': {
                    'get': {
                        'account/amm/balance': 40,
                        'account/investment/balance': 40,
                        'account/balance/history': 40,
                        'account/market/fee': 40,
                        'balance/coin/deposit': 40,
                        'balance/coin/withdraw': 40,
                        'balance/info': 40,
                        'balance/deposit/address/{coin_type}': 40,
                        'contract/transfer/history': 40,
                        'credit/info': 40,
                        'credit/balance': 40,
                        'investment/transfer/history': 40,
                        'margin/account': 1,
                        'margin/config': 1,
                        'margin/loan/history': 40,
                        'margin/transfer/history': 40,
                        'order/deals': 40,
                        'order/finished': 40,
                        'order/pending': 8,
                        'order/status': 8,
                        'order/status/batch': 8,
                        'order/user/deals': 40,
                        'order/stop/finished': 40,
                        'order/stop/pending': 8,
                        'order/user/trade/fee': 1,
                        'order/market/trade/info': 1,
                        'sub_account/balance': 1,
                        'sub_account/transfer/history': 40,
                        'sub_account/auth/api': 40,
                        'sub_account/auth/api/{user_auth_id}': 40,
                    },
                    'post': {
                        'balance/coin/withdraw': 40,
                        'contract/balance/transfer': 40,
                        'margin/flat': 40,
                        'margin/loan': 40,
                        'margin/transfer': 40,
                        'order/limit/batch': 40,
                        'order/ioc': 13.334,
                        'order/limit': 13.334,
                        'order/market': 13.334,
                        'order/modify': 13.334,
                        'order/stop/limit': 13.334,
                        'order/stop/market': 13.334,
                        'order/stop/modify': 13.334,
                        'sub_account/transfer': 40,
                        'sub_account/register': 1,
                        'sub_account/unfrozen': 40,
                        'sub_account/frozen': 40,
                        'sub_account/auth/api': 40,
                    },
                    'put': {
                        'balance/deposit/address/{coin_type}': 40,
                        'sub_account/unfrozen': 40,
                        'sub_account/frozen': 40,
                        'sub_account/auth/api/{user_auth_id}': 40,
                        'v1/account/settings': 40,
                    },
                    'delete': {
                        'balance/coin/withdraw': 40,
                        'order/pending/batch': 40,
                        'order/pending': 13.334,
                        'order/stop/pending': 40,
                        'order/stop/pending/{id}': 13.334,
                        'order/pending/by_client_id': 40,
                        'order/stop/pending/by_client_id': 40,
                        'sub_account/auth/api/{user_auth_id}': 40,
                        'sub_account/authorize/{id}': 40,
                    },
                },
                'perpetualPublic': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'market/list': 1,
                        'market/limit_config': 1,
                        'market/ticker': 1,
                        'market/ticker/all': 1,
                        'market/depth': 1,
                        'market/deals': 1,
                        'market/funding_history': 1,
                        'market/kline': 1,
                    },
                },
                'perpetualPrivate': {
                    'get': {
                        'market/user_deals': 1,
                        'asset/query': 40,
                        'order/pending': 8,
                        'order/finished': 40,
                        'order/stop_finished': 40,
                        'order/stop_pending': 8,
                        'order/status': 8,
                        'order/stop_status': 8,
                        'position/finished': 40,
                        'position/pending': 40,
                        'position/funding': 40,
                        'position/adl_history': 40,
                        'market/preference': 40,
                        'position/margin_history': 40,
                        'position/settle_history': 40,
                    },
                    'post': {
                        'market/adjust_leverage': 1,
                        'market/position_expect': 1,
                        'order/put_limit': 20,
                        'order/put_market': 20,
                        'order/put_stop_limit': 20,
                        'order/put_stop_market': 20,
                        'order/modify': 20,
                        'order/modify_stop': 20,
                        'order/cancel': 20,
                        'order/cancel_all': 40,
                        'order/cancel_batch': 40,
                        'order/cancel_stop': 20,
                        'order/cancel_stop_all': 40,
                        'order/close_limit': 20,
                        'order/close_market': 20,
                        'position/adjust_margin': 20,
                        'position/stop_loss': 20,
                        'position/take_profit': 20,
                        'position/market_close': 20,
                        'order/cancel/by_client_id': 20,
                        'order/cancel_stop/by_client_id': 20,
                        'market/preference': 20,
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BCH': 0.0,
                        'BTC': 0.001,
                        'LTC': 0.001,
                        'ETH': 0.001,
                        'ZEC': 0.0001,
                        'DASH': 0.0001,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'options': {
                'brokerId': 'x-167673045',
                'createMarketBuyOrderRequiresPrice': true,
                'defaultType': 'spot', // spot, swap, margin
                'defaultSubType': 'linear', // linear, inverse
                'fetchDepositAddress': {
                    'fillResponseFromRequest': true,
                },
                'accountsById': {
                    'spot': '0',
                },
                'networks': {
                    'BEP20': 'BSC',
                    'TRX': 'TRC20',
                    'ETH': 'ERC20',
                },
            },
            'commonCurrencies': {
                'ACM': 'Actinium',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    // https://github.com/coinexcom/coinex_exchange_api/wiki/013error_code
                    '23': PermissionDenied, // IP Prohibited
                    '24': AuthenticationError,
                    '25': AuthenticationError,
                    '34': AuthenticationError, // Access id is expires
                    '35': ExchangeNotAvailable, // Service unavailable
                    '36': RequestTimeout, // Service timeout
                    '213': RateLimitExceeded, // Too many requests
                    '107': InsufficientFunds,
                    '600': OrderNotFound,
                    '601': InvalidOrder,
                    '602': InvalidOrder,
                    '606': InvalidOrder,
                },
                'broad': {
                    'ip not allow visit': PermissionDenied,
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCommonAssetConfig (params);
        //     {
        //         "code": 0,
        //         "data": {
        //             "USDT-ERC20": {
        //                  "asset": "USDT",
        //                  "chain": "ERC20",
        //                  "withdrawal_precision": 6,
        //                  "can_deposit": true,
        //                  "can_withdraw": true,
        //                  "deposit_least_amount": "4.9",
        //                  "withdraw_least_amount": "4.9",
        //                  "withdraw_tx_fee": "4.9",
        //                  "explorer_asset_url": "https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7"
        //             },
        //             ...
        //         },
        //         "message": "Success",
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const coins = Object.keys (data);
        const result = {};
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const currency = data[coin];
            const currencyId = this.safeString (currency, 'asset');
            const networkId = this.safeString (currency, 'chain');
            const code = this.safeCurrencyCode (currencyId);
            const precisionString = this.parsePrecision (this.safeString (currency, 'withdrawal_precision'));
            const precision = this.parseNumber (precisionString);
            const canDeposit = this.safeValue (currency, 'can_deposit');
            const canWithdraw = this.safeValue (currency, 'can_withdraw');
            const feeString = this.safeString (currency, 'withdraw_tx_fee');
            const fee = this.parseNumber (feeString);
            const minNetworkDepositString = this.safeString (currency, 'deposit_least_amount');
            const minNetworkDeposit = this.parseNumber (minNetworkDepositString);
            const minNetworkWithdrawString = this.safeString (currency, 'withdraw_least_amount');
            const minNetworkWithdraw = this.parseNumber (minNetworkWithdrawString);
            if (this.safeValue (result, code) === undefined) {
                result[code] = {
                    'id': currencyId,
                    'numericId': undefined,
                    'code': code,
                    'info': undefined,
                    'name': undefined,
                    'active': canDeposit && canWithdraw,
                    'deposit': canDeposit,
                    'withdraw': canWithdraw,
                    'fee': fee,
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': minNetworkDeposit,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': minNetworkWithdraw,
                            'max': undefined,
                        },
                    },
                };
            }
            let minFeeString = this.safeString (result[code], 'fee');
            if (feeString !== undefined) {
                minFeeString = (minFeeString === undefined) ? feeString : Precise.stringMin (feeString, minFeeString);
            }
            let depositAvailable = this.safeValue (result[code], 'deposit');
            depositAvailable = (canDeposit) ? canDeposit : depositAvailable;
            let withdrawAvailable = this.safeValue (result[code], 'withdraw');
            withdrawAvailable = (canWithdraw) ? canWithdraw : withdrawAvailable;
            let minDepositString = this.safeString (result[code]['limits']['deposit'], 'min');
            if (minNetworkDepositString !== undefined) {
                minDepositString = (minDepositString === undefined) ? minNetworkDepositString : Precise.stringMin (minNetworkDepositString, minDepositString);
            }
            let minWithdrawString = this.safeString (result[code]['limits']['withdraw'], 'min');
            if (minNetworkWithdrawString !== undefined) {
                minWithdrawString = (minWithdrawString === undefined) ? minNetworkWithdrawString : Precise.stringMin (minNetworkWithdrawString, minWithdrawString);
            }
            let minPrecisionString = this.safeString (result[code], 'precision');
            if (precisionString !== undefined) {
                minPrecisionString = (minPrecisionString === undefined) ? precisionString : Precise.stringMin (precisionString, minPrecisionString);
            }
            const networks = this.safeValue (result[code], 'networks', {});
            const network = {
                'info': currency,
                'id': networkId,
                'network': networkId,
                'name': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.safeNumber (currency, 'deposit_least_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'withdraw_least_amount'),
                        'max': undefined,
                    },
                },
                'active': canDeposit && canWithdraw,
                'deposit': canDeposit,
                'withdraw': canWithdraw,
                'fee': fee,
                'precision': precision,
            };
            networks[networkId] = network;
            result[code]['networks'] = networks;
            result[code]['active'] = depositAvailable && withdrawAvailable;
            result[code]['deposit'] = depositAvailable;
            result[code]['withdraw'] = withdrawAvailable;
            const info = this.safeValue (result[code], 'info', []);
            info.push (currency);
            result[code]['info'] = info;
            result[code]['fee'] = this.parseNumber (minFeeString);
            result[code]['precision'] = this.parseNumber (minPrecisionString);
            result[code]['limits']['deposit']['min'] = this.parseNumber (minDepositString);
            result[code]['limits']['withdraw']['min'] = this.parseNumber (minWithdrawString);
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name coinex#fetchMarkets
         * @description retrieves data on all markets for coinex
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market002_all_market_info
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http006_market_list
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        let promises = [
            this.fetchSpotMarkets (params),
            this.fetchContractMarkets (params),
        ] as any;
        promises = await Promise.all (promises) as any;
        const spotMarkets = promises[0];
        const swapMarkets = promises[1];
        return this.arrayConcat (spotMarkets, swapMarkets);
    }

    async fetchSpotMarkets (params) {
        const response = await this.publicGetMarketInfo (params);
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "WAVESBTC": {
        //                 "name": "WAVESBTC",
        //                 "min_amount": "1",
        //                 "maker_fee_rate": "0.001",
        //                 "taker_fee_rate": "0.001",
        //                 "pricing_name": "BTC",
        //                 "pricing_decimal": 8,
        //                 "trading_name": "WAVES",
        //                 "trading_decimal": 8
        //             }
        //         }
        //     }
        //
        const markets = this.safeValue (response, 'data', {});
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = markets[key];
            const id = this.safeString (market, 'name');
            const tradingName = this.safeString (market, 'trading_name');
            const baseId = tradingName;
            const quoteId = this.safeString (market, 'pricing_name');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            if (tradingName === id) {
                symbol = id;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
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
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'trading_decimal'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricing_decimal'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_amount'),
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
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }

    async fetchContractMarkets (params) {
        const response = await this.perpetualPublicGetMarketList (params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "name": "BTCUSD",
        //                 "type": 2, // 1: USDT-M Contracts, 2: Coin-M Contracts
        //                 "leverages": ["3", "5", "8", "10", "15", "20", "30", "50", "100"],
        //                 "stock": "BTC",
        //                 "money": "USD",
        //                 "fee_prec": 5,
        //                 "stock_prec": 8,
        //                 "money_prec": 1,
        //                 "amount_prec": 0,
        //                 "amount_min": "10",
        //                 "multiplier": "1",
        //                 "tick_size": "0.1", // Min. Price Increment
        //                 "available": true
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const fees = this.fees;
            const leverages = this.safeValue (entry, 'leverages', []);
            const subType = this.safeInteger (entry, 'type');
            const linear = (subType === 1);
            const inverse = (subType === 2);
            const id = this.safeString (entry, 'name');
            const baseId = this.safeString (entry, 'stock');
            const quoteId = this.safeString (entry, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settleId = (subType === 1) ? 'USDT' : baseId;
            const settle = this.safeCurrencyCode (settleId);
            const symbol = base + '/' + quote + ':' + settle;
            const leveragesLength = leverages.length;
            result.push ({
                'id': id,
                'symbol': symbol,
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
                'active': this.safeValue (entry, 'available'),
                'contract': true,
                'linear': linear,
                'inverse': inverse,
                'taker': fees['trading']['taker'],
                'maker': fees['trading']['maker'],
                'contractSize': this.safeNumber (entry, 'multiplier'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (entry, 'amount_prec'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (entry, 'money_prec'))),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (leverages, 0),
                        'max': this.safeNumber (leverages, leveragesLength - 1),
                    },
                    'amount': {
                        'min': this.safeNumber (entry, 'amount_min'),
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
                'created': undefined,
                'info': entry,
            });
        }
        return result;
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        // Spot fetchTicker, fetchTickers
        //
        //     {
        //         "vol": "293.19415130",
        //         "low": "38200.00",
        //         "open": "39514.99",
        //         "high": "39530.00",
        //         "last": "38649.57",
        //         "buy": "38640.20",
        //         "buy_amount": "0.22800000",
        //         "sell": "38640.21",
        //         "sell_amount": "0.02828439"
        //     }
        //
        // Swap fetchTicker, fetchTickers
        //
        //     {
        //         "vol": "7714.2175",
        //         "low": "38200.00",
        //         "open": "39569.23",
        //         "high": "39569.23",
        //         "last": "38681.37",
        //         "buy": "38681.36",
        //         "period": 86400,
        //         "funding_time": 462,
        //         "position_amount": "296.7552",
        //         "funding_rate_last": "0.00009395",
        //         "funding_rate_next": "0.00000649",
        //         "funding_rate_predict": "-0.00007176",
        //         "insurance": "16464465.09431942163278132918",
        //         "sign_price": "38681.93",
        //         "index_price": "38681.69500000",
        //         "sell_total": "16.6039",
        //         "buy_total": "19.8481",
        //         "buy_amount": "4.6315",
        //         "sell": "38681.37",
        //         "sell_amount": "11.4044"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date');
        const symbol = this.safeSymbol (undefined, market);
        ticker = this.safeValue (ticker, 'ticker', {});
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': this.safeString (ticker, 'buy_amount'),
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': this.safeString (ticker, 'sell_amount'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'vol', 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name coinex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market007_single_market_ticker
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http008_market_ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        let response = undefined;
        if (market['swap']) {
            response = await this.perpetualPublicGetMarketTicker (this.extend (request, params));
        } else {
            response = await this.publicGetMarketTicker (this.extend (request, params));
        }
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "date": 1651306913414,
        //             "ticker": {
        //                 "vol": "293.19415130",
        //                 "low": "38200.00",
        //                 "open": "39514.99",
        //                 "high": "39530.00",
        //                 "last": "38649.57",
        //                 "buy": "38640.20",
        //                 "buy_amount": "0.22800000",
        //                 "sell": "38640.21",
        //                 "sell_amount": "0.02828439"
        //             }
        //         },
        //         "message": "OK"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "date": 1651306641500,
        //             "ticker": {
        //                 "vol": "7714.2175",
        //                 "low": "38200.00",
        //                 "open": "39569.23",
        //                 "high": "39569.23",
        //                 "last": "38681.37",
        //                 "buy": "38681.36",
        //                 "period": 86400,
        //                 "funding_time": 462,
        //                 "position_amount": "296.7552",
        //                 "funding_rate_last": "0.00009395",
        //                 "funding_rate_next": "0.00000649",
        //                 "funding_rate_predict": "-0.00007176",
        //                 "insurance": "16464465.09431942163278132918",
        //                 "sign_price": "38681.93",
        //                 "index_price": "38681.69500000",
        //                 "sell_total": "16.6039",
        //                 "buy_total": "19.8481",
        //                 "buy_amount": "4.6315",
        //                 "sell": "38681.37",
        //                 "sell_amount": "11.4044"
        //             }
        //         },
        //         "message": "OK"
        //     }
        //
        return this.parseTicker (response['data'], market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coinex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market008_all_market_ticker
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http009_market_ticker_all
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
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
        let response = undefined;
        if (marketType === 'swap') {
            response = await this.perpetualPublicGetMarketTickerAll (query);
        } else {
            response = await this.publicGetMarketTickerAll ();
        }
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "date": 1651519857284,
        //             "ticker": {
        //                 "PSPUSDT": {
        //                     "vol": "127131.55227034",
        //                     "low": "0.0669",
        //                     "open": "0.0688",
        //                     "high": "0.0747",
        //                     "last": "0.0685",
        //                     "buy": "0.0676",
        //                     "buy_amount": "702.70117866",
        //                     "sell": "0.0690",
        //                     "sell_amount": "686.76861562"
        //                 },
        //             }
        //         },
        //         "message": "Ok"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "date": 1651520268644,
        //             "ticker": {
        //                 "KAVAUSDT": {
        //                     "vol": "834924",
        //                     "low": "3.9418",
        //                     "open": "4.1834",
        //                     "high": "4.4328",
        //                     "last": "4.0516",
        //                     "buy": "4.0443",
        //                     "period": 86400,
        //                     "funding_time": 262,
        //                     "position_amount": "16111",
        //                     "funding_rate_last": "-0.00069514",
        //                     "funding_rate_next": "-0.00061009",
        //                     "funding_rate_predict": "-0.00055812",
        //                     "insurance": "16532425.53026084124483989548",
        //                     "sign_price": "4.0516",
        //                     "index_price": "4.0530",
        //                     "sell_total": "59446",
        //                     "buy_total": "62423",
        //                     "buy_amount": "959",
        //                     "sell": "4.0466",
        //                     "sell_amount": "141"
        //                 },
        //             }
        //         },
        //         "message": "Ok"
        //     }
        //
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (data, 'date');
        const tickers = this.safeValue (data, 'ticker', {});
        const marketIds = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketInner = this.safeMarket (marketId, undefined, undefined, marketType);
            const symbol = marketInner['symbol'];
            const ticker = this.parseTicker ({
                'date': timestamp,
                'ticker': tickers[marketId],
            }, marketInner);
            ticker['symbol'] = symbol;
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name coinex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http005_system_time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.perpetualPublicGetTime (params);
        //
        //     {
        //         "code": "0",
        //         "data": "1653261274414",
        //         "message": "OK"
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchOrderBook (symbol: string, limit = 20, params = {}) {
        /**
         * @method
         * @name coinex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market004_market_depth
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http010_market_depth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 20; // default
        }
        const request = {
            'market': this.marketId (symbol),
            'merge': '0',
            'limit': limit.toString (),
        };
        let response = undefined;
        if (market['swap']) {
            response = await this.perpetualPublicGetMarketDepth (this.extend (request, params));
        } else {
            response = await this.publicGetMarketDepth (this.extend (request, params));
        }
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "asks": [
        //                 ["41056.33", "0.31727613"],
        //                 ["41056.34", "1.05657294"],
        //                 ["41056.35", "0.02346648"]
        //             ],
        //             "bids": [
        //                 ["41050.61", "0.40618608"],
        //                 ["41046.98", "0.13800000"],
        //                 ["41046.56", "0.22579234"]
        //             ],
        //             "last": "41050.61",
        //             "time": 1650573220346
        //         },
        //         "message": "OK"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "asks": [
        //                 ["40620.90", "0.0384"],
        //                 ["40625.50", "0.0219"],
        //                 ["40625.90", "0.3506"]
        //             ],
        //             "bids": [
        //                 ["40620.89", "19.6861"],
        //                 ["40620.80", "0.0012"],
        //                 ["40619.87", "0.0365"]
        //             ],
        //             "last": "40620.89",
        //             "time": 1650587672406,
        //             "sign_price": "40619.32",
        //             "index_price": "40609.93"
        //         },
        //         "message": "OK"
        //     }
        //
        const result = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (result, 'time');
        return this.parseOrderBook (result, symbol, timestamp);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // Spot and Swap fetchTrades (public)
        //
        //      {
        //          "id":  2611511379,
        //          "type": "buy",
        //          "price": "192.63",
        //          "amount": "0.02266931",
        //          "date":  1638990110,
        //          "date_ms":  1638990110518
        //      },
        //
        // Spot and Margin fetchMyTrades (private)
        //
        //      {
        //          "id": 2611520950,
        //          "order_id": 63286573298,
        //          "account_id": 0,
        //          "create_time": 1638990636,
        //          "type": "sell",
        //          "role": "taker",
        //          "price": "192.29",
        //          "amount": "0.098",
        //          "fee": "0.03768884",
        //          "fee_asset": "USDT",
        //          "market": "AAVEUSDT",
        //          "deal_money": "18.84442"
        //      }
        //
        // Swap fetchMyTrades (private)
        //
        //     {
        //         "amount": "0.0012",
        //         "deal_fee": "0.0237528",
        //         "deal_insurance": "0",
        //         "deal_margin": "15.8352",
        //         "deal_order_id": 17797031903,
        //         "deal_profit": "0",
        //         "deal_stock": "47.5056",
        //         "deal_type": 1,
        //         "deal_user_id": 2969195,
        //         "fee_asset": "",
        //         "fee_discount": "0",
        //         "fee_price": "0",
        //         "fee_rate": "0.0005",
        //         "fee_real_rate": "0.0005",
        //         "id": 379044296,
        //         "leverage": "3",
        //         "margin_amount": "15.8352",
        //         "market": "BTCUSDT",
        //         "open_price": "39588",
        //         "order_id": 17797092987,
        //         "position_amount": "0.0012",
        //         "position_id": 62052321,
        //         "position_type": 1,
        //         "price": "39588",
        //         "role": 2,
        //         "side": 2,
        //         "time": 1650675936.016103,
        //         "user_id": 3620173
        //     }
        //
        let timestamp = this.safeTimestamp2 (trade, 'create_time', 'time');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 'date_ms');
        }
        const tradeId = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const marketId = this.safeString (trade, 'market');
        const marketType = this.safeString (trade, 'market_type');
        const defaultType = (marketType === undefined) ? 'spot' : 'swap';
        market = this.safeMarket (marketId, market, undefined, defaultType);
        const symbol = market['symbol'];
        const costString = this.safeString (trade, 'deal_money');
        let fee = undefined;
        const feeCostString = this.safeString2 (trade, 'fee', 'deal_fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_asset');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        let takerOrMaker = this.safeString (trade, 'role');
        if (takerOrMaker === '1') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === '2') {
            takerOrMaker = 'taker';
        }
        let side: Str = undefined;
        if (market['type'] === 'swap') {
            const rawSide = this.safeInteger (trade, 'side');
            if (rawSide === 1) {
                side = 'sell';
            } else if (rawSide === 2) {
                side = 'buy';
            }
            if (side === undefined) {
                side = this.safeString (trade, 'type');
            }
        } else {
            side = this.safeString (trade, 'type');
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market005_market_deals
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http011_market_deals
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'last_id': 0,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['swap']) {
            response = await this.perpetualPublicGetMarketDeals (this.extend (request, params));
        } else {
            response = await this.publicGetMarketDeals (this.extend (request, params));
        }
        //
        // Spot and Swap
        //
        //      {
        //          "code":    0,
        //          "data": [
        //              {
        //                  "id":  2611511379,
        //                  "type": "buy",
        //                  "price": "192.63",
        //                  "amount": "0.02266931",
        //                  "date":  1638990110,
        //                  "date_ms":  1638990110518
        //                  },
        //              ],
        //          "message": "OK"
        //      }
        //
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchTradingFee (symbol: string, params = {}) {
        /**
         * @method
         * @name coinex#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market003_single_market_info
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketDetail (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //           "name": "BTCUSDC",
        //           "min_amount": "0.0005",
        //           "maker_fee_rate": "0.002",
        //           "taker_fee_rate": "0.002",
        //           "pricing_name": "USDC",
        //           "pricing_decimal": 2,
        //           "trading_name": "BTC",
        //           "trading_decimal": 8
        //         },
        //         "message": "OK"
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTradingFee (data, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name coinex#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market002_all_market_info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicGetMarketInfo (params);
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "WAVESBTC": {
        //                 "name": "WAVESBTC",
        //                 "min_amount": "1",
        //                 "maker_fee_rate": "0.001",
        //                 "taker_fee_rate": "0.001",
        //                 "pricing_name": "BTC",
        //                 "pricing_decimal": 8,
        //                 "trading_name": "WAVES",
        //                 "trading_decimal": 8
        //             }
        //             ...
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const fee = this.safeValue (data, market['id'], {});
            result[symbol] = this.parseTradingFee (fee, market);
        }
        return result;
    }

    parseTradingFee (fee, market: Market = undefined) {
        const marketId = this.safeValue (fee, 'name');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'maker_fee_rate'),
            'taker': this.safeNumber (fee, 'taker_fee_rate'),
            'percentage': true,
            'tierBased': true,
        };
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         1591484400,
        //         "0.02505349",
        //         "0.02506988",
        //         "0.02507000",
        //         "0.02505304",
        //         "343.19716223",
        //         "8.6021323866383196",
        //         "ETHBTC"
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coinex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market006_market_kline
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http012_market_kline
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
            'market': market['id'],
            'type': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['swap']) {
            response = await this.perpetualPublicGetMarketKline (this.extend (request, params));
        } else {
            response = await this.publicGetMarketKline (this.extend (request, params));
        }
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             [1591484400, "0.02505349", "0.02506988", "0.02507000", "0.02505304", "343.19716223", "8.6021323866383196", "ETHBTC"],
        //             [1591484700, "0.02506990", "0.02508109", "0.02508109", "0.02506979", "91.59841581", "2.2972047780447000", "ETHBTC"],
        //             [1591485000, "0.02508106", "0.02507996", "0.02508106", "0.02507500", "65.15307697", "1.6340597822306000", "ETHBTC"],
        //         ],
        //         "message": "OK"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             [1650569400, "41524.64", "41489.31", "41564.61", "41480.58", "29.7060", "1233907.099562"],
        //             [1650569700, "41489.31", "41438.29", "41489.31", "41391.87", "42.4115", "1756154.189061"],
        //             [1650570000, "41438.29", "41482.21", "41485.05", "41427.31", "22.2892", "924000.317861"]
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchMarginBalance (params = {}) {
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        let marketId = this.safeString (params, 'market');
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            marketId = market['id'];
        } else if (marketId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMarginBalance() fetching a margin account requires a market parameter or a symbol parameter');
        }
        params = this.omit (params, [ 'symbol', 'market' ]);
        const request = {
            'market': marketId,
        };
        const response = await this.privateGetMarginAccount (this.extend (request, params));
        //
        //      {
        //          "code":    0,
        //           "data": {
        //              "account_id":    126,
        //              "leverage":    3,
        //              "market_type":   "AAVEUSDT",
        //              "sell_asset_type":   "AAVE",
        //              "buy_asset_type":   "USDT",
        //              "balance": {
        //                  "sell_type": "0.3",     // borrowed
        //                  "buy_type": "30"
        //                  },
        //              "frozen": {
        //                  "sell_type": "0",
        //                  "buy_type": "0"
        //                  },
        //              "loan": {
        //                  "sell_type": "0.3", // loan
        //                  "buy_type": "0"
        //                  },
        //              "interest": {
        //                  "sell_type": "0.0000125",
        //                  "buy_type": "0"
        //                  },
        //              "can_transfer": {
        //                  "sell_type": "0.02500646",
        //                  "buy_type": "4.28635738"
        //                  },
        //              "warn_rate":   "",
        //              "liquidation_price":   ""
        //              },
        //          "message": "Success"
        //      }
        //
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', {});
        const free = this.safeValue (data, 'can_transfer', {});
        const total = this.safeValue (data, 'balance', {});
        const loan = this.safeValue (data, 'loan', {});
        const interest = this.safeValue (data, 'interest', {});
        //
        const sellAccount = this.account ();
        const sellCurrencyId = this.safeString (data, 'sell_asset_type');
        const sellCurrencyCode = this.safeCurrencyCode (sellCurrencyId);
        sellAccount['free'] = this.safeString (free, 'sell_type');
        sellAccount['total'] = this.safeString (total, 'sell_type');
        const sellDebt = this.safeString (loan, 'sell_type');
        const sellInterest = this.safeString (interest, 'sell_type');
        sellAccount['debt'] = Precise.stringAdd (sellDebt, sellInterest);
        result[sellCurrencyCode] = sellAccount;
        //
        const buyAccount = this.account ();
        const buyCurrencyId = this.safeString (data, 'buy_asset_type');
        const buyCurrencyCode = this.safeCurrencyCode (buyCurrencyId);
        buyAccount['free'] = this.safeString (free, 'buy_type');
        buyAccount['total'] = this.safeString (total, 'buy_type');
        const buyDebt = this.safeString (loan, 'buy_type');
        const buyInterest = this.safeString (interest, 'buy_type');
        buyAccount['debt'] = Precise.stringAdd (buyDebt, buyInterest);
        result[buyCurrencyCode] = buyAccount;
        //
        return this.safeBalance (result);
    }

    async fetchSpotBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalanceInfo (params);
        //
        //     {
        //       "code": 0,
        //       "data": {
        //         "BCH": {                     # BCH account
        //           "available": "13.60109",   # Available BCH
        //           "frozen": "0.00000"        # Frozen BCH
        //         },
        //         "BTC": {                     # BTC account
        //           "available": "32590.16",   # Available BTC
        //           "frozen": "7000.00"        # Frozen BTC
        //         },
        //         "ETH": {                     # ETH account
        //           "available": "5.06000",    # Available ETH
        //           "frozen": "0.00000"        # Frozen ETH
        //         }
        //       },
        //       "message": "Ok"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', {});
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchSwapBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.perpetualPrivateGetAssetQuery (params);
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "USDT": {
        //                 "available": "37.24817690383456000000",
        //                 "balance_total": "37.24817690383456000000",
        //                 "frozen": "0.00000000000000000000",
        //                 "margin": "0.00000000000000000000",
        //                 "profit_unreal": "0.00000000000000000000",
        //                 "transfer": "37.24817690383456000000"
        //             }
        //         },
        //         "message": "OK"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', {});
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
            account['total'] = this.safeString (balance, 'balance_total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchFinancialBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountInvestmentBalance (params);
        //
        //     {
        //          "code": 0,
        //          "data": [
        //              {
        //                  "asset": "CET",
        //                  "available": "0",
        //                  "frozen": "0",
        //                  "lock": "0",
        //              },
        //              {
        //                  "asset": "USDT",
        //                  "available": "999900",
        //                  "frozen": "0",
        //                  "lock": "0"
        //              }
        //          ],
        //          "message": "Success"
        //      }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', {});
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            const frozen = this.safeString (balance, 'frozen');
            const locked = this.safeString (balance, 'lock');
            account['used'] = Precise.stringAdd (frozen, locked);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name coinex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account001_account_info         // spot
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account004_investment_balance   // financial
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account006_margin_account       // margin
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http016_asset_query       // swap
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'margin', 'swap', 'financial', or 'spot'
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBalance', params);
        marketType = (marginMode !== undefined) ? 'margin' : marketType;
        params = this.omit (params, 'margin');
        if (marketType === 'margin') {
            return await this.fetchMarginBalance (params);
        } else if (marketType === 'swap') {
            return await this.fetchSwapBalance (params);
        } else if (marketType === 'financial') {
            return await this.fetchFinancialBalance (params);
        } else {
            return await this.fetchSpotBalance (params);
        }
    }

    parseOrderStatus (status) {
        const statuses = {
            'rejected': 'rejected',
            'open': 'open',
            'not_deal': 'open',
            'part_deal': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // fetchOrder
        //
        //     {
        //         "amount": "0.1",
        //         "asset_fee": "0.22736197736197736197",
        //         "avg_price": "196.85000000000000000000",
        //         "create_time": 1537270135,
        //         "deal_amount": "0.1",
        //         "deal_fee": "0",
        //         "deal_money": "19.685",
        //         "fee_asset": "CET",
        //         "fee_discount": "0.5",
        //         "id": 1788259447,
        //         "left": "0",
        //         "maker_fee_rate": "0",
        //         "market": "ETHUSDT",
        //         "order_type": "limit",
        //         "price": "170.00000000",
        //         "status": "done",
        //         "taker_fee_rate": "0.0005",
        //         "type": "sell",
        //         "client_id": "",
        //     }
        //
        // Spot and Margin createOrder, createOrders, cancelOrder, cancelOrders, fetchOrder
        //
        //      {
        //          "amount":"1.5",
        //          "asset_fee":"0",
        //          "avg_price":"0.14208538",
        //          "client_id":"",
        //          "create_time":1650993819,
        //          "deal_amount":"10.55703267",
        //          "deal_fee":"0.0029999999971787292",
        //          "deal_money":"1.4999999985893646",
        //          "fee_asset":null,
        //          "fee_discount":"1",
        //          "finished_time":null,
        //          "id":74556296907,
        //          "left":"0.0000000014106354",
        //          "maker_fee_rate":"0",
        //          "market":"DOGEUSDT",
        //          "money_fee":"0.0029999999971787292",
        //          "order_type":"market",
        //          "price":"0",
        //          "status":"done",
        //          "stock_fee":"0",
        //          "taker_fee_rate":"0.002",
        //          "type":"buy"
        //          "client_id": "",
        //      }
        //
        // Swap createOrder, cancelOrder, fetchOrder
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "",
        //         "create_time": 1651004578.618224,
        //         "deal_asset_fee": "0.00000000000000000000",
        //         "deal_fee": "0.00000000000000000000",
        //         "deal_profit": "0.00000000000000000000",
        //         "deal_stock": "0.00000000000000000000",
        //         "effect_type": 1,
        //         "fee_asset": "",
        //         "fee_discount": "0.00000000000000000000",
        //         "last_deal_amount": "0.00000000000000000000",
        //         "last_deal_id": 0,
        //         "last_deal_price": "0.00000000000000000000",
        //         "last_deal_role": 0,
        //         "last_deal_time": 0,
        //         "last_deal_type": 0,
        //         "left": "0.0005",
        //         "leverage": "3",
        //         "maker_fee": "0.00030",
        //         "market": "BTCUSDT",
        //         "order_id": 18221659097,
        //         "position_id": 0,
        //         "position_type": 1,
        //         "price": "30000.00",
        //         "side": 2,
        //         "source": "api.v1",
        //         "stop_id": 0,
        //         "taker_fee": "0.00050",
        //         "target": 0,
        //         "type": 1,
        //         "update_time": 1651004578.618224,
        //         "user_id": 3620173
        //     }
        //
        // Stop order createOrder
        //
        //     {"status":"success"}
        //
        // Swap Stop cancelOrder, fetchOrder
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "",
        //         "create_time": 1651034023.008771,
        //         "effect_type": 1,
        //         "fee_asset": "",
        //         "fee_discount": "0.00000000000000000000",
        //         "maker_fee": "0.00030",
        //         "market": "BTCUSDT",
        //         "order_id": 18256915101,
        //         "price": "31000.00",
        //         "side": 2,
        //         "source": "api.v1",
        //         "state": 1,
        //         "stop_price": "31500.00",
        //         "stop_type": 1,
        //         "taker_fee": "0.00050",
        //         "target": 0,
        //         "type": 1,
        //         "update_time": 1651034397.193624,
        //         "user_id": 3620173
        //     }
        //
        //
        // Spot and Margin fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "account_id": 0,
        //         "amount": "0.0005",
        //         "asset_fee": "0",
        //         "avg_price": "0.00",
        //         "client_id": "",
        //         "create_time": 1651089247,
        //         "deal_amount": "0",
        //         "deal_fee": "0",
        //         "deal_money": "0",
        //         "fee_asset": null,
        //         "fee_discount": "1",
        //         "finished_time": 0,
        //         "id": 74660190839,
        //         "left": "0.0005",
        //         "maker_fee_rate": "0.002",
        //         "market": "BTCUSDT",
        //         "money_fee": "0",
        //         "order_type": "limit",
        //         "price": "31000",
        //         "status": "not_deal",
        //         "stock_fee": "0",
        //         "taker_fee_rate": "0.002",
        //         "type": "buy"
        //     }
        //
        // Swap fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "",
        //         "create_time": 1651030414.088431,
        //         "deal_asset_fee": "0",
        //         "deal_fee": "0.00960069",
        //         "deal_profit": "0.009825",
        //         "deal_stock": "19.20138",
        //         "effect_type": 0,
        //         "fee_asset": "",
        //         "fee_discount": "0",
        //         "left": "0",
        //         "leverage": "3",
        //         "maker_fee": "0",
        //         "market": "BTCUSDT",
        //         "order_id": 18253447431,
        //         "position_id": 0,
        //         "position_type": 1,
        //         "price": "0",
        //         "side": 1,
        //         "source": "web",
        //         "stop_id": 0,
        //         "taker_fee": "0.0005",
        //         "target": 0,
        //         "type": 2,
        //         "update_time": 1651030414.08847,
        //         "user_id": 3620173
        //     }
        //
        // Spot and Margin Stop fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "account_id": 0,
        //         "amount": "155",
        //         "client_id": "",
        //         "create_time": 1651089182,
        //         "fee_asset": null,
        //         "fee_discount": "1",
        //         "maker_fee": "0.002",
        //         "market": "BTCUSDT",
        //         "order_id": 74660111965,
        //         "order_type": "market",
        //         "price": "0",
        //         "state": 0,
        //         "stop_price": "31500",
        //         "taker_fee": "0.002",
        //         "type": "buy"
        //     }
        //
        // Swap Stop fetchOpenOrders
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "",
        //         "create_time": 1651089147.321691,
        //         "effect_type": 1,
        //         "fee_asset": "",
        //         "fee_discount": "0.00000000000000000000",
        //         "maker_fee": "0.00030",
        //         "market": "BTCUSDT",
        //         "order_id": 18332143848,
        //         "price": "31000.00",
        //         "side": 2,
        //         "source": "api.v1",
        //         "state": 1,
        //         "stop_price": "31500.00",
        //         "stop_type": 1,
        //         "taker_fee": "0.00050",
        //         "target": 0,
        //         "type": 1,
        //         "update_time": 1651089147.321691,
        //         "user_id": 3620173
        //     }
        //
        // swap: cancelOrders
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "x-167673045-b0cee0c584718b65",
        //         "create_time": 1701233683.294231,
        //         "deal_asset_fee": "0.00000000000000000000",
        //         "deal_fee": "0.00000000000000000000",
        //         "deal_profit": "0.00000000000000000000",
        //         "deal_stock": "0.00000000000000000000",
        //         "effect_type": 1,
        //         "fee_asset": "",
        //         "fee_discount": "0.00000000000000000000",
        //         "last_deal_amount": "0.00000000000000000000",
        //         "last_deal_id": 0,
        //         "last_deal_price": "0.00000000000000000000",
        //         "last_deal_role": 0,
        //         "last_deal_time": 0,
        //         "last_deal_type": 0,
        //         "left": "0.0005",
        //         "leverage": "3",
        //         "maker_fee": "0.00030",
        //         "market": "BTCUSDT",
        //         "option": 0,
        //         "order_id": 115940476323,
        //         "position_id": 0,
        //         "position_type": 2,
        //         "price": "25000.00",
        //         "side": 2,
        //         "source": "api.v1",
        //         "stop_id": 0,
        //         "stop_loss_price": "0.00000000000000000000",
        //         "stop_loss_type": 0,
        //         "take_profit_price": "0.00000000000000000000",
        //         "take_profit_type": 0,
        //         "taker_fee": "0.00050",
        //         "target": 0,
        //         "type": 1,
        //         "update_time": 1701233721.718884,
        //         "user_id": 3620173
        //     }
        //
        const rawStatus = this.safeString (order, 'status');
        const timestamp = this.safeTimestamp (order, 'create_time');
        const marketId = this.safeString (order, 'market');
        const defaultType = this.safeString (this.options, 'defaultType');
        const orderType = ('source' in order) ? 'swap' : defaultType;
        market = this.safeMarket (marketId, market, undefined, orderType);
        const feeCurrencyId = this.safeString (order, 'fee_asset');
        let feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        if (feeCurrency === undefined) {
            feeCurrency = market['quote'];
        }
        const rawSide = this.safeInteger (order, 'side');
        let side: Str = undefined;
        if (rawSide === 1) {
            side = 'sell';
        } else if (rawSide === 2) {
            side = 'buy';
        } else {
            side = this.safeString (order, 'type');
        }
        const rawType = this.safeString (order, 'order_type');
        let type: Str = undefined;
        if (rawType === undefined) {
            const typeInteger = this.safeInteger (order, 'type');
            if (typeInteger === 1) {
                type = 'limit';
            } else if (typeInteger === 2) {
                type = 'market';
            }
        } else {
            type = rawType;
        }
        let clientOrderId = this.safeString (order, 'client_id');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        return this.safeOrder ({
            'id': this.safeString2 (order, 'id', 'order_id'),
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': this.safeTimestamp (order, 'update_time'),
            'status': this.parseOrderStatus (rawStatus),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'price'),
            'stopPrice': this.safeString (order, 'stop_price'),
            'triggerPrice': this.safeString (order, 'stop_price'),
            'takeProfitPrice': this.safeNumber (order, 'take_profit_price'),
            'stopLossPrice': this.safeNumber (order, 'stop_loss_price'),
            'cost': this.safeString (order, 'deal_money'),
            'average': this.safeString (order, 'avg_price'),
            'amount': this.safeString (order, 'amount'),
            'filled': this.safeString (order, 'deal_amount'),
            'remaining': this.safeString (order, 'left'),
            'trades': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': this.safeString (order, 'deal_fee'),
            },
            'info': order,
        }, market);
    }

    async createMarketBuyOrderWithCost (symbol: string, cost, params = {}) {
        /**
         * @method
         * @name coinex#createMarketBuyOrderWithCost
         * @description create a market buy order by providing the symbol and cost
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        return await this.createOrder (symbol, 'market', 'buy', cost, undefined, params);
    }

    createOrderRequest (symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market (symbol);
        const swap = market['swap'];
        const clientOrderId = this.safeString2 (params, 'client_id', 'clientOrderId');
        const stopPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const option = this.safeString (params, 'option');
        const isMarketOrder = type === 'market';
        const postOnly = this.isPostOnly (isMarketOrder, option === 'MAKER_ONLY', params);
        const positionId = this.safeInteger2 (params, 'position_id', 'positionId'); // Required for closing swap positions
        const timeInForceRaw = this.safeString (params, 'timeInForce'); // Spot: IOC, FOK, PO, GTC, ... NORMAL (default), MAKER_ONLY
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        if (reduceOnly) {
            if (!market['swap']) {
                throw new InvalidOrder (this.id + ' createOrder() does not support reduceOnly for ' + market['type'] + ' orders, reduceOnly orders are supported for swap markets only');
            }
            if (positionId === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a position_id/positionId parameter for reduceOnly orders');
            }
        }
        const request = {
            'market': market['id'],
        };
        if (clientOrderId === undefined) {
            const defaultId = 'x-167673045';
            const brokerId = this.safeString (this.options, 'brokerId', defaultId);
            request['client_id'] = brokerId + '-' + this.uuid16 ();
        } else {
            request['client_id'] = clientOrderId;
        }
        if (swap) {
            if (stopLossPrice || takeProfitPrice) {
                request['stop_type'] = this.safeInteger (params, 'stop_type', 1); // 1: triggered by the latest transaction, 2: mark price, 3: index price
                if (positionId === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a position_id parameter for stop loss and take profit orders');
                }
                request['position_id'] = positionId;
                if (stopLossPrice) {
                    request['stop_loss_price'] = this.priceToPrecision (symbol, stopLossPrice);
                } else if (takeProfitPrice) {
                    request['take_profit_price'] = this.priceToPrecision (symbol, takeProfitPrice);
                }
            } else {
                const requestSide = (side === 'buy') ? 2 : 1;
                if (stopPrice !== undefined) {
                    request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
                    request['stop_type'] = this.safeInteger (params, 'stop_type', 1); // 1: triggered by the latest transaction, 2: mark price, 3: index price;
                    request['amount'] = this.amountToPrecision (symbol, amount);
                    request['side'] = requestSide;
                    if (type === 'limit') {
                        request['price'] = this.priceToPrecision (symbol, price);
                    }
                    request['amount'] = this.amountToPrecision (symbol, amount);
                }
                let timeInForce = undefined;
                if ((type !== 'market') || (stopPrice !== undefined)) {
                    if (postOnly) {
                        request['option'] = 1;
                    } else if (timeInForceRaw !== undefined) {
                        if (timeInForceRaw === 'IOC') {
                            timeInForce = 2;
                        } else if (timeInForceRaw === 'FOK') {
                            timeInForce = 3;
                        } else {
                            timeInForce = 1;
                        }
                        request['effect_type'] = timeInForce; // exchange takes 'IOC' and 'FOK'
                    }
                }
                if (type === 'limit' && stopPrice === undefined) {
                    if (reduceOnly) {
                        request['position_id'] = positionId;
                    } else {
                        request['side'] = requestSide;
                    }
                    request['price'] = this.priceToPrecision (symbol, price);
                    request['amount'] = this.amountToPrecision (symbol, amount);
                } else if (type === 'market' && stopPrice === undefined) {
                    if (reduceOnly) {
                        request['position_id'] = positionId;
                    } else {
                        request['side'] = requestSide;
                        request['amount'] = this.amountToPrecision (symbol, amount);
                    }
                }
            }
        } else {
            request['type'] = side;
            if ((type === 'market') && (side === 'buy')) {
                let createMarketBuyOrderRequiresPrice = true;
                [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeNumber (params, 'cost');
                params = this.omit (params, 'cost');
                if (createMarketBuyOrderRequiresPrice) {
                    if ((price === undefined) && (cost === undefined)) {
                        throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                    } else {
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        const quoteAmount = this.parseToNumeric (Precise.stringMul (amountString, priceString));
                        const costRequest = (cost !== undefined) ? cost : quoteAmount;
                        request['amount'] = this.costToPrecision (symbol, costRequest);
                    }
                } else {
                    request['amount'] = this.costToPrecision (symbol, amount);
                }
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            if ((type === 'limit') || (type === 'ioc')) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (stopPrice !== undefined) {
                request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
            }
            if ((type !== 'market') || (stopPrice !== undefined)) {
                // following options cannot be applied to vanilla market orders (but can be applied to stop-market orders)
                if ((timeInForceRaw !== undefined) || postOnly) {
                    if ((postOnly || (timeInForceRaw !== 'IOC')) && ((type === 'limit') && (stopPrice !== undefined))) {
                        throw new InvalidOrder (this.id + ' createOrder() only supports the IOC option for stop-limit orders');
                    }
                    if (postOnly) {
                        request['option'] = 'MAKER_ONLY';
                    } else {
                        if (timeInForceRaw !== undefined) {
                            request['option'] = timeInForceRaw; // exchange takes 'IOC' and 'FOK'
                        }
                    }
                }
            }
        }
        const accountId = this.safeInteger (params, 'account_id');
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params);
        if (marginMode !== undefined) {
            if (accountId === undefined) {
                throw new BadRequest (this.id + ' createOrder() requires an account_id parameter for margin orders');
            }
            request['account_id'] = accountId;
        }
        params = this.omit (params, [ 'reduceOnly', 'positionId', 'timeInForce', 'postOnly', 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        return this.extend (request, params);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name coinex#createOrder
         * @description create a trade order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade001_limit_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade004_IOC_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade005_stop_limit_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade006_stop_market_order
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http017_put_limit
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http018_put_market
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http019_put_limit_stop
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http020_put_market_stop
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http031_market_close
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http030_limit_close
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] price to trigger stop orders
         * @param {float} [params.stopLossPrice] price to trigger stop loss orders
         * @param {float} [params.takeProfitPrice] price to trigger take profit orders
         * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO'
         * @param {boolean} [params.postOnly] set to true if you wish to make a post only order
         * @param {boolean} [params.reduceOnly] *contract only* indicates if this order is to reduce the size of a position
         * @param {int} [params.position_id] *required for reduce only orders* the position id to reduce
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        const triggerPrice = this.safeNumber2 (params, 'stopPrice', 'triggerPrice');
        const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['spot']) {
            if (isTriggerOrder) {
                if (type === 'limit') {
                    response = await this.privatePostOrderStopLimit (request);
                } else {
                    response = await this.privatePostOrderStopMarket (request);
                }
            } else {
                if (type === 'limit') {
                    response = await this.privatePostOrderLimit (request);
                } else {
                    response = await this.privatePostOrderMarket (request);
                }
            }
        } else {
            if (isTriggerOrder) {
                if (type === 'limit') {
                    response = await this.perpetualPrivatePostOrderPutStopLimit (request);
                } else {
                    response = await this.perpetualPrivatePostOrderPutStopMarket (request);
                }
            } else if (isStopLossOrTakeProfitTrigger) {
                if (isStopLossTriggerOrder) {
                    response = await this.perpetualPrivatePostPositionStopLoss (request);
                } else if (isTakeProfitTriggerOrder) {
                    response = await this.perpetualPrivatePostPositionTakeProfit (request);
                }
            } else {
                if (reduceOnly) {
                    if (type === 'limit') {
                        response = await this.perpetualPrivatePostOrderCloseLimit (request);
                    } else {
                        response = await this.perpetualPrivatePostOrderCloseMarket (request);
                    }
                } else {
                    if (type === 'limit') {
                        response = await this.perpetualPrivatePostOrderPutLimit (request);
                    } else {
                        response = await this.perpetualPrivatePostOrderPutMarket (request);
                    }
                }
            }
        }
        //
        // Spot and Margin
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "asset_fee": "0",
        //             "avg_price": "0.00",
        //             "client_id": "",
        //             "create_time": 1650951627,
        //             "deal_amount": "0",
        //             "deal_fee": "0",
        //             "deal_money": "0",
        //             "fee_asset": null,
        //             "fee_discount": "1",
        //             "finished_time": null,
        //             "id": 74510932594,
        //             "left": "0.0005",
        //             "maker_fee_rate": "0.002",
        //             "market": "BTCUSDT",
        //             "money_fee": "0",
        //             "order_type": "limit",
        //             "price": "30000",
        //             "status": "not_deal",
        //             "stock_fee": "0",
        //             "taker_fee_rate": "0.002",
        //             "type": "buy"
        //         },
        //         "message": "Success"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651004578.618224,
        //             "deal_asset_fee": "0.00000000000000000000",
        //             "deal_fee": "0.00000000000000000000",
        //             "deal_profit": "0.00000000000000000000",
        //             "deal_stock": "0.00000000000000000000",
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "last_deal_amount": "0.00000000000000000000",
        //             "last_deal_id": 0,
        //             "last_deal_price": "0.00000000000000000000",
        //             "last_deal_role": 0,
        //             "last_deal_time": 0,
        //             "last_deal_type": 0,
        //             "left": "0.0005",
        //             "leverage": "3",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18221659097,
        //             "position_id": 0,
        //             "position_type": 1,
        //             "price": "30000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "stop_id": 0,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651004578.618224,
        //             "user_id": 3620173
        //         },
        //         "message": "OK"
        //     }
        //
        // Stop Order
        //
        //     {"code":0,"data":{"status":"success"},"message":"OK"}
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coinex#createOrders
         * @description create a list of trade orders (all orders should be of the same symbol)
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade002_batch_limit_orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @param {object} [params] extra parameters specific to the api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const ordersRequests = [];
        let symbol = undefined;
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
            if (type !== 'limit') {
                throw new NotSupported (this.id + ' createOrders() does not support ' + type + ' orders, only limit orders are accepted');
            }
            const orderRequest = this.createOrderRequest (marketId, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' createOrders() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'market': market['id'],
            'batch_orders': this.json (ordersRequests),
        };
        const response = await this.privatePostOrderLimitBatch (request);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "code": 0,
        //                 "data": {
        //                     "amount": "0.0005",
        //                     "asset_fee": "0",
        //                     "avg_price": "0.00",
        //                     "client_id": "x-167673045-d34bfb41242d8fd1",
        //                     "create_time": 1701229157,
        //                     "deal_amount": "0",
        //                     "deal_fee": "0",
        //                     "deal_money": "0",
        //                     "fee_asset": null,
        //                     "fee_discount": "1",
        //                     "finished_time": null,
        //                     "id": 107745856676,
        //                     "left": "0.0005",
        //                     "maker_fee_rate": "0.002",
        //                     "market": "BTCUSDT",
        //                     "money_fee": "0",
        //                     "order_type": "limit",
        //                     "price": "23000",
        //                     "source_id": "",
        //                     "status": "not_deal",
        //                     "stock_fee": "0",
        //                     "taker_fee_rate": "0.002",
        //                     "type": "buy"
        //                 },
        //                 "message": "OK"
        //             },
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const results = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            let status = undefined;
            const code = this.safeInteger (entry, 'code');
            if (code !== undefined) {
                if (code !== 0) {
                    status = 'rejected';
                } else {
                    status = 'open';
                }
            }
            const item = this.safeValue (entry, 'data', {});
            item['status'] = status;
            const order = this.parseOrder (item, market);
            results.push (order);
        }
        return results;
    }

    async cancelOrders (ids, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coinex#cancelOrders
         * @description cancel multiple orders
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade016_batch_cancel_order
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http021-0_cancel_order_batch
         * @param {string[]} ids order ids
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const idsString = ids.join (',');
        let response = undefined;
        if (market['spot']) {
            request['batch_ids'] = idsString;
            response = await this.privateDeleteOrderPendingBatch (this.extend (request, params));
        } else {
            request['order_ids'] = idsString;
            response = await this.perpetualPrivatePostOrderCancelBatch (this.extend (request, params));
        }
        //
        // spot
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "code": 0,
        //                 "data": {
        //                     "account_id": 0,
        //                     "amount": "0.0005",
        //                     "asset_fee": "0",
        //                     "avg_price": "0.00",
        //                     "client_id": "x-167673045-d4e03c38f4d19b4e",
        //                     "create_time": 1701229157,
        //                     "deal_amount": "0",
        //                     "deal_fee": "0",
        //                     "deal_money": "0",
        //                     "fee_asset": null,
        //                     "fee_discount": "1",
        //                     "finished_time": 0,
        //                     "id": 107745856682,
        //                     "left": "0",
        //                     "maker_fee_rate": "0.002",
        //                     "market": "BTCUSDT",
        //                     "money_fee": "0",
        //                     "order_type": "limit",
        //                     "price": "22000",
        //                     "status": "not_deal",
        //                     "stock_fee": "0",
        //                     "taker_fee_rate": "0.002",
        //                     "type": "buy"
        //                 },
        //                 "message": ""
        //             },
        //         ],
        //         "message": "Success"
        //     }
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "code": 0,
        //                 "message": "",
        //                 "order": {
        //                     "amount": "0.0005",
        //                     "client_id": "x-167673045-b0cee0c584718b65",
        //                     "create_time": 1701233683.294231,
        //                     "deal_asset_fee": "0.00000000000000000000",
        //                     "deal_fee": "0.00000000000000000000",
        //                     "deal_profit": "0.00000000000000000000",
        //                     "deal_stock": "0.00000000000000000000",
        //                     "effect_type": 1,
        //                     "fee_asset": "",
        //                     "fee_discount": "0.00000000000000000000",
        //                     "last_deal_amount": "0.00000000000000000000",
        //                     "last_deal_id": 0,
        //                     "last_deal_price": "0.00000000000000000000",
        //                     "last_deal_role": 0,
        //                     "last_deal_time": 0,
        //                     "last_deal_type": 0,
        //                     "left": "0.0005",
        //                     "leverage": "3",
        //                     "maker_fee": "0.00030",
        //                     "market": "BTCUSDT",
        //                     "option": 0,
        //                     "order_id": 115940476323,
        //                     "position_id": 0,
        //                     "position_type": 2,
        //                     "price": "25000.00",
        //                     "side": 2,
        //                     "source": "api.v1",
        //                     "stop_id": 0,
        //                     "stop_loss_price": "0.00000000000000000000",
        //                     "stop_loss_type": 0,
        //                     "take_profit_price": "0.00000000000000000000",
        //                     "take_profit_type": 0,
        //                     "taker_fee": "0.00050",
        //                     "target": 0,
        //                     "type": 1,
        //                     "update_time": 1701233721.718884,
        //                     "user_id": 3620173
        //                 }
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const results = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const dataRequest = market['spot'] ? 'data' : 'order';
            const item = this.safeValue (entry, dataRequest, {});
            const order = this.parseOrder (item, market);
            results.push (order);
        }
        return results;
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name okx#editOrder
         * @description edit a trade order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade022_modify_order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' editOrder() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'market': market['id'],
            'id': parseInt (id),
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrderModify (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "id": 35436205,
        //             "create_time": 1636080705,
        //             "finished_time": null,
        //             "amount": "0.30000000",
        //             "price": " 56000",
        //             "deal_amount": "0.24721428",
        //             "deal_money": "13843.9996800000000000",
        //             "deal_fee": "0",
        //             "stock_fee": "0",
        //             "money_fee": "0",
        //             " asset_fee": "8.721719798400000000000000",
        //             "fee_asset": "CET",
        //             "fee_discount": "0.70",
        //             "avg_price": "56000",
        //             "market": "BTCUSDT",
        //             "left": "0.05278572 ",
        //             "maker_fee_rate": "0.0018",
        //             "taker_fee_rate": "0.0018",
        //             "order_type": "limit",
        //             "type": "buy",
        //             "status": "cancel",
        //             "client_id ": "abcd222",
        //             "source_id": "1234"
        //     },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coinex#cancelOrder
         * @description cancels an open order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade018_cancle_stop_pending_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade015_cancel_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade024_cancel_order_by_client_id
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade025_cancel_stop_order_by_client_id
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http023_cancel_stop_order
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http021_cancel_order
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http042_cancel_order_by_client_id
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http043_cancel_stop_order_by_client_id
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] client order id, defaults to id if not passed
         * @param {boolean} [params.stop] if stop order = true, default = false
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const stop = this.safeValue (params, 'stop');
        const swap = market['swap'];
        const request = {
            'market': market['id'],
        };
        const accountId = this.safeInteger (params, 'account_id');
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('cancelOrder', params);
        const clientOrderId = this.safeString2 (params, 'client_id', 'clientOrderId');
        if (marginMode !== undefined) {
            if (accountId === undefined) {
                throw new BadRequest (this.id + ' cancelOrder() requires an account_id parameter for margin orders');
            }
            request['account_id'] = accountId;
        }
        const query = this.omit (params, [ 'stop', 'account_id', 'clientOrderId' ]);
        let response = undefined;
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
            if (stop) {
                if (swap) {
                    response = await this.perpetualPrivatePostOrderCancelStopByClientId (this.extend (request, query));
                } else {
                    response = await this.privateDeleteOrderStopPendingByClientId (this.extend (request, query));
                }
            } else {
                if (swap) {
                    response = await this.perpetualPrivatePostOrderCancelByClientId (this.extend (request, query));
                } else {
                    response = await this.privateDeleteOrderPendingByClientId (this.extend (request, query));
                }
            }
        } else {
            const idRequest = swap ? 'order_id' : 'id';
            request[idRequest] = id;
            if (stop) {
                if (swap) {
                    response = await this.perpetualPrivatePostOrderCancelStop (this.extend (request, query));
                } else {
                    response = await this.privateDeleteOrderStopPendingId (this.extend (request, query));
                }
            } else {
                if (swap) {
                    response = await this.perpetualPrivatePostOrderCancel (this.extend (request, query));
                } else {
                    response = await this.privateDeleteOrderPending (this.extend (request, query));
                }
            }
        }
        //
        // Spot and Margin
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "asset_fee": "0",
        //             "avg_price": "0.00",
        //             "client_id": "",
        //             "create_time": 1650951627,
        //             "deal_amount": "0",
        //             "deal_fee": "0",
        //             "deal_money": "0",
        //             "fee_asset": null,
        //             "fee_discount": "1",
        //             "finished_time": null,
        //             "id": 74510932594,
        //             "left": "0.0005",
        //             "maker_fee_rate": "0.002",
        //             "market": "BTCUSDT",
        //             "money_fee": "0",
        //             "order_type": "limit",
        //             "price": "30000",
        //             "status": "not_deal",
        //             "stock_fee": "0",
        //             "taker_fee_rate": "0.002",
        //             "type": "buy"
        //         },
        //         "message": "Success"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651004578.618224,
        //             "deal_asset_fee": "0.00000000000000000000",
        //             "deal_fee": "0.00000000000000000000",
        //             "deal_profit": "0.00000000000000000000",
        //             "deal_stock": "0.00000000000000000000",
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "last_deal_amount": "0.00000000000000000000",
        //             "last_deal_id": 0,
        //             "last_deal_price": "0.00000000000000000000",
        //             "last_deal_role": 0,
        //             "last_deal_time": 0,
        //             "last_deal_type": 0,
        //             "left": "0.0005",
        //             "leverage": "3",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18221659097,
        //             "position_id": 0,
        //             "position_type": 1,
        //             "price": "30000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "stop_id": 0,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651004578.618224,
        //             "user_id": 3620173
        //         },
        //         "message": "OK"
        //     }
        //
        // Swap Stop
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651034023.008771,
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18256915101,
        //             "price": "31000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "state": 1,
        //             "stop_price": "31500.00",
        //             "stop_type": 1,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651034397.193624,
        //             "user_id": 3620173
        //         },
        //         "message":"OK"
        //     }
        //
        // Spot and Margin Stop
        //
        //     {"code":0,"data":{},"message":"Success"}
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coinex#cancelAllOrders
         * @description cancel all open orders in a market
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade018_cancle_stop_pending_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade015_cancel_order
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http024_cancel_stop_all
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http022_cancel_all
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const accountId = this.safeInteger (params, 'account_id', 0);
        const request = {
            'market': marketId,
            // 'account_id': accountId, // SPOT, main account ID: 0, margin account ID: See < Inquire Margin Account Market Info >, future account ID: See < Inquire Future Account Market Info >
            // 'side': 0, // SWAP, 0: All, 1: Sell, 2: Buy
        };
        const swap = market['swap'];
        const stop = this.safeValue (params, 'stop');
        params = this.omit (params, [ 'stop', 'account_id' ]);
        let response = undefined;
        if (swap) {
            if (stop) {
                response = await this.perpetualPrivatePostOrderCancelStopAll (this.extend (request, params));
            } else {
                response = await this.perpetualPrivatePostOrderCancelAll (this.extend (request, params));
            }
        } else {
            request['account_id'] = accountId;
            if (stop) {
                response = await this.privateDeleteOrderStopPending (this.extend (request, params));
            } else {
                response = await this.privateDeleteOrderPending (this.extend (request, params));
            }
        }
        //
        // Spot and Margin
        //
        //     {"code": 0, "data": null, "message": "Success"}
        //
        // Swap
        //
        //     {"code": 0, "data": {"status":"success"}, "message": "OK"}
        //
        return response;
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coinex#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http028_stop_status
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http026_order_status
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade007_order_status
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const stop = this.safeValue (params, 'stop');
        params = this.omit (params, 'stop');
        const request = {
            'market': market['id'],
            // 'id': id, // SPOT
            // 'order_id': id, // SWAP
        };
        const idRequest = swap ? 'order_id' : 'id';
        request[idRequest] = id;
        let response = undefined;
        if (swap) {
            if (stop) {
                response = await this.perpetualPrivateGetOrderStopStatus (this.extend (request, params));
            } else {
                response = await this.perpetualPrivateGetOrderStatus (this.extend (request, params));
            }
        } else {
            response = await this.privateGetOrderStatus (this.extend (request, params));
        }
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.1",
        //             "asset_fee": "0.22736197736197736197",
        //             "avg_price": "196.85000000000000000000",
        //             "create_time": 1537270135,
        //             "deal_amount": "0.1",
        //             "deal_fee": "0",
        //             "deal_money": "19.685",
        //             "fee_asset": "CET",
        //             "fee_discount": "0.5",
        //             "id": 1788259447,
        //             "left": "0",
        //             "maker_fee_rate": "0",
        //             "market": "ETHUSDT",
        //             "order_type": "limit",
        //             "price": "170.00000000",
        //             "status": "done",
        //             "taker_fee_rate": "0.0005",
        //             "type": "sell",
        //         },
        //         "message": "Ok"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651004578.618224,
        //             "deal_asset_fee": "0.00000000000000000000",
        //             "deal_fee": "0.00000000000000000000",
        //             "deal_profit": "0.00000000000000000000",
        //             "deal_stock": "0.00000000000000000000",
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "last_deal_amount": "0.00000000000000000000",
        //             "last_deal_id": 0,
        //             "last_deal_price": "0.00000000000000000000",
        //             "last_deal_role": 0,
        //             "last_deal_time": 0,
        //             "last_deal_type": 0,
        //             "left": "0.0005",
        //             "leverage": "3",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18221659097,
        //             "position_id": 0,
        //             "position_type": 1,
        //             "price": "30000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "stop_id": 0,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651004578.618224,
        //             "user_id": 3620173
        //         },
        //         "message": "OK"
        //     }
        //
        // Swap Stop
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651034023.008771,
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18256915101,
        //             "price": "31000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "state": 1,
        //             "stop_price": "31500.00",
        //             "stop_type": 1,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651034397.193624,
        //             "user_id": 3620173
        //         },
        //         "message":"OK"
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async fetchOrdersByStatus (status, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        limit = (limit === undefined) ? 100 : limit;
        const request = {
            'limit': limit,
            // 'page': 1, // SPOT
            // 'offset': 0, // SWAP
            // 'side': 0, // SWAP, 0: All, 1: Sell, 2: Buy
        };
        const stop = this.safeValue (params, 'stop');
        const side = this.safeInteger (params, 'side');
        params = this.omit (params, 'stop');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrdersByStatus', market, params);
        const accountId = this.safeInteger (params, 'account_id');
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchOrdersByStatus', params);
        if (marginMode !== undefined) {
            if (accountId === undefined) {
                throw new BadRequest (this.id + ' fetchOpenOrders() and fetchClosedOrders() require an account_id parameter for margin orders');
            }
            request['account_id'] = accountId;
        }
        params = this.omit (query, 'account_id');
        let response = undefined;
        if (marketType === 'swap') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrdersByStatus() requires a symbol argument for swap markets');
            }
            if (side !== undefined) {
                request['side'] = side;
            } else {
                request['side'] = 0;
            }
            request['offset'] = 0;
            if (stop) {
                response = await this.perpetualPrivateGetOrderStopPending (this.extend (request, params));
            } else {
                if (status === 'finished') {
                    response = await this.perpetualPrivateGetOrderFinished (this.extend (request, params));
                } else if (status === 'pending') {
                    response = await this.perpetualPrivateGetOrderPending (this.extend (request, params));
                }
            }
        } else {
            request['page'] = 1;
            if (status === 'finished') {
                if (stop) {
                    response = await this.privateGetOrderStopFinished (this.extend (request, params));
                } else {
                    response = await this.privateGetOrderFinished (this.extend (request, params));
                }
            } else if (status === 'pending') {
                if (stop) {
                    response = await this.privateGetOrderStopPending (this.extend (request, params));
                } else {
                    response = await this.privateGetOrderPending (this.extend (request, params));
                }
            }
        }
        //
        // Spot and Margin
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "count": 1,
        //             "curr_page": 1,
        //             "data": [
        //                 {
        //                     "account_id": 0,
        //                     "amount": "0.0005",
        //                     "asset_fee": "0",
        //                     "avg_price": "0.00",
        //                     "client_id": "",
        //                     "create_time": 1651089247,
        //                     "deal_amount": "0",
        //                     "deal_fee": "0",
        //                     "deal_money": "0",
        //                     "fee_asset": null,
        //                     "fee_discount": "1",
        //                     "finished_time": 0,
        //                     "id": 74660190839,
        //                     "left": "0.0005",
        //                     "maker_fee_rate": "0.002",
        //                     "market": "BTCUSDT",
        //                     "money_fee": "0",
        //                     "order_type": "limit",
        //                     "price": "31000",
        //                     "status": "not_deal",
        //                     "stock_fee": "0",
        //                     "taker_fee_rate": "0.002",
        //                     "type": "buy"
        //                 }
        //             ],
        //             "has_next": false,
        //             "total": 1
        //         },
        //         "message": "Success"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "limit": 100,
        //             "offset": 0,
        //             "records": [
        //                 {
        //                     "amount": "0.0005",
        //                     "client_id": "",
        //                     "create_time": 1651030414.088431,
        //                     "deal_asset_fee": "0",
        //                     "deal_fee": "0.00960069",
        //                     "deal_profit": "0.009825",
        //                     "deal_stock": "19.20138",
        //                     "effect_type": 0,
        //                     "fee_asset": "",
        //                     "fee_discount": "0",
        //                     "left": "0",
        //                     "leverage": "3",
        //                     "maker_fee": "0",
        //                     "market": "BTCUSDT",
        //                     "order_id": 18253447431,
        //                     "position_id": 0,
        //                     "position_type": 1,
        //                     "price": "0",
        //                     "side": 1,
        //                     "source": "web",
        //                     "stop_id": 0,
        //                     "taker_fee": "0.0005",
        //                     "target": 0,
        //                     "type": 2,
        //                     "update_time": 1651030414.08847,
        //                     "user_id": 3620173
        //                 },
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        // Spot and Margin Stop
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "count": 1,
        //             "curr_page": 1,
        //             "data": [
        //                 {
        //                     "account_id": 0,
        //                     "amount": "155",
        //                     "client_id": "",
        //                     "create_time": 1651089182,
        //                     "fee_asset": null,
        //                     "fee_discount": "1",
        //                     "maker_fee": "0.002",
        //                     "market": "BTCUSDT",
        //                     "order_id": 74660111965,
        //                     "order_type": "market",
        //                     "price": "0",
        //                     "state": 0,
        //                     "stop_price": "31500",
        //                     "taker_fee": "0.002",
        //                     "type": "buy"
        //                 }
        //             ],
        //             "has_next": false,
        //             "total": 0
        //         },
        //         "message": "Success"
        //     }
        //
        // Swap Stop
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "limit": 100,
        //             "offset": 0,
        //             "records": [
        //                 {
        //                     "amount": "0.0005",
        //                     "client_id": "",
        //                     "create_time": 1651089147.321691,
        //                     "effect_type": 1,
        //                     "fee_asset": "",
        //                     "fee_discount": "0.00000000000000000000",
        //                     "maker_fee": "0.00030",
        //                     "market": "BTCUSDT",
        //                     "order_id": 18332143848,
        //                     "price": "31000.00",
        //                     "side": 2,
        //                     "source": "api.v1",
        //                     "state": 1,
        //                     "stop_price": "31500.00",
        //                     "stop_type": 1,
        //                     "taker_fee": "0.00050",
        //                     "target": 0,
        //                     "type": 1,
        //                     "update_time": 1651089147.321691,
        //                     "user_id": 3620173
        //                 }
        //             ],
        //             "total": 1
        //         },
        //         "message": "OK"
        //     }
        //
        const tradeRequest = (marketType === 'swap') ? 'records' : 'data';
        const data = this.safeValue (response, 'data');
        const orders = this.safeValue (data, tradeRequest, []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coinex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http027_query_pending_stop
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http025_query_pending
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade013_stop_pending_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade011_pending_order
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByStatus ('pending', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coinex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http029_query_finished
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade010_stop_finished_order
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade012_finished_order
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByStatus ('finished', symbol, since, limit, params);
    }

    async createDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name coinex#createDepositAddress
         * @description create a currency deposit address
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account019_update_deposit_address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin_type': currency['id'],
        };
        if ('network' in params) {
            const network = this.safeString (params, 'network');
            params = this.omit (params, 'network');
            request['smart_contract_name'] = network;
        }
        const response = await this.privatePutBalanceDepositAddressCoinType (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "coin_address": "TV639dSpb9iGRtoFYkCp4AoaaDYKrK1pw5",
        //             "is_bitcoin_cash": false
        //         },
        //         "message": "Success"
        //     }
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name coinex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account020_query_deposit_address
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin_type': currency['id'],
        };
        const networks = this.safeValue (currency, 'networks', {});
        const network = this.safeString (params, 'network');
        params = this.omit (params, 'network');
        const networksKeys = Object.keys (networks);
        const numOfNetworks = networksKeys.length;
        if (networks !== undefined && numOfNetworks > 1) {
            if (network === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() ' + code + ' requires a network parameter');
            }
            if (!(network in networks)) {
                throw new ExchangeError (this.id + ' fetchDepositAddress() ' + network + ' network not supported for ' + code);
            }
        }
        if (network !== undefined) {
            request['smart_contract_name'] = network;
        }
        const response = await this.privateGetBalanceDepositAddressCoinType (this.extend (request, params));
        //
        //      {
        //          "code": 0,
        //          "data": {
        //            "coin_address": "1P1JqozxioQwaqPwgMAQdNDYNyaVSqgARq",
        //            // coin_address: "xxxxxxxxxxxxxx:yyyyyyyyy", // with embedded tag/memo
        //            "is_bitcoin_cash": false
        //          },
        //          "message": "Success"
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        const depositAddress = this.parseDepositAddress (data, currency);
        const options = this.safeValue (this.options, 'fetchDepositAddress', {});
        const fillResponseFromRequest = this.safeValue (options, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            depositAddress['network'] = this.safeNetworkCode (network, currency);
        }
        return depositAddress;
    }

    safeNetwork (networkId, currency: Currency = undefined) {
        const networks = this.safeValue (currency, 'networks', {});
        const networksCodes = Object.keys (networks);
        const networksCodesLength = networksCodes.length;
        if (networkId === undefined && networksCodesLength === 1) {
            return networks[networksCodes[0]];
        }
        return {
            'id': networkId,
            'network': (networkId === undefined) ? undefined : networkId.toUpperCase (),
        };
    }

    safeNetworkCode (networkId, currency: Currency = undefined) {
        const network = this.safeNetwork (networkId, currency);
        return network['network'];
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined) {
        //
        //     {
        //         "coin_address": "1P1JqozxioQwaqPwgMAQdNDYNyaVSqgARq",
        //         "is_bitcoin_cash": false
        //     }
        //
        const coinAddress = this.safeString (depositAddress, 'coin_address');
        const parts = coinAddress.split (':');
        let address = undefined;
        let tag = undefined;
        const partsLength = parts.length;
        if (partsLength > 1 && parts[0] !== 'cfx') {
            address = parts[0];
            tag = parts[1];
        } else {
            address = coinAddress;
        }
        return {
            'info': depositAddress,
            'currency': this.safeCurrencyCode (undefined, currency),
            'address': address,
            'tag': tag,
            'network': undefined,
        };
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinex#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http013_user_deals
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade014_user_deals
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'limit': limit, // SPOT and SWAP
            'offset': 0, // SWAP, means query from a certain record
            // 'page': 1, // SPOT
            // 'side': 2, // SWAP, 0 for no limit, 1 for sell, 2 for buy
            // 'start_time': since, // SWAP
            // 'end_time': 1524228297, // SWAP
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        if (type !== 'spot' && symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument for non-spot markets');
        }
        const swap = (type === 'swap');
        const accountId = this.safeInteger (params, 'account_id');
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMyTrades', params);
        if (marginMode !== undefined) {
            if (accountId === undefined) {
                throw new BadRequest (this.id + ' fetchMyTrades() requires an account_id parameter for margin trades');
            }
            request['account_id'] = accountId;
            params = this.omit (params, 'account_id');
        }
        let response = undefined;
        if (swap) {
            if (since !== undefined) {
                request['start_time'] = since;
            }
            request['side'] = 0;
            response = await this.perpetualPrivateGetMarketUserDeals (this.extend (request, params));
        } else {
            request['page'] = 1;
            response = await this.privateGetOrderUserDeals (this.extend (request, params));
        }
        //
        // Spot and Margin
        //
        //      {
        //          "code": 0,
        //          "data": {
        //              "data": [
        //                  {
        //                      "id": 2611520950,
        //                      "order_id": 63286573298,
        //                      "account_id": 0,
        //                      "create_time": 1638990636,
        //                      "type": "sell",
        //                      "role": "taker",
        //                      "price": "192.29",
        //                      "amount": "0.098",
        //                      "fee": "0.03768884",
        //                      "fee_asset": "USDT",
        //                      "market": "AAVEUSDT",
        //                      "deal_money": "18.84442"
        //                          },
        //                      ],
        //              "curr_page": 1,
        //              "has_next": false,
        //              "count": 3
        //              },
        //          "message": "Success"
        //      }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "limit": 100,
        //             "offset": 0,
        //             "records": [
        //                 {
        //                     "amount": "0.0012",
        //                     "deal_fee": "0.0237528",
        //                     "deal_insurance": "0",
        //                     "deal_margin": "15.8352",
        //                     "deal_order_id": 17797031903,
        //                     "deal_profit": "0",
        //                     "deal_stock": "47.5056",
        //                     "deal_type": 1,
        //                     "deal_user_id": 2969195,
        //                     "fee_asset": "",
        //                     "fee_discount": "0",
        //                     "fee_price": "0",
        //                     "fee_rate": "0.0005",
        //                     "fee_real_rate": "0.0005",
        //                     "id": 379044296,
        //                     "leverage": "3",
        //                     "margin_amount": "15.8352",
        //                     "market": "BTCUSDT",
        //                     "open_price": "39588",
        //                     "order_id": 17797092987,
        //                     "position_amount": "0.0012",
        //                     "position_id": 62052321,
        //                     "position_type": 1,
        //                     "price": "39588",
        //                     "role": 2,
        //                     "side": 2,
        //                     "time": 1650675936.016103,
        //                     "user_id": 3620173
        //                 }
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        const tradeRequest = swap ? 'records' : 'data';
        const data = this.safeValue (response, 'data');
        const trades = this.safeValue (data, tradeRequest, []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchPositions (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name coinex#fetchPositions
         * @description fetch all open positions
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http033_pending_position
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http033-0_finished_position
         * @param {string[]} [symbols] list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.method] the method to use 'perpetualPrivateGetPositionPending' or 'perpetualPrivateGetPositionFinished' default is 'perpetualPrivateGetPositionPending'
         * @param {int} [params.side] *history endpoint only* 0: All, 1: Sell, 2: Buy, default is 0
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        let defaultMethod = undefined;
        [ defaultMethod, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'method', 'perpetualPrivateGetPositionPending');
        const isHistory = (defaultMethod === 'perpetualPrivateGetPositionFinished');
        symbols = this.marketSymbols (symbols);
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            let symbol = undefined;
            if (Array.isArray (symbols)) {
                const symbolsLength = symbols.length;
                if (symbolsLength > 1) {
                    throw new BadRequest (this.id + ' fetchPositions() symbols argument cannot contain more than 1 symbol');
                }
                symbol = symbols[0];
            } else {
                symbol = symbols;
            }
            market = this.market (symbol);
            request['market'] = market['id'];
        } else {
            if (isHistory) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() requires a symbol argument for closed positions');
            }
        }
        if (isHistory) {
            request['limit'] = 100;
            request['side'] = this.safeInteger (params, 'side', 0); // 0: All, 1: Sell, 2: Buy
        }
        let response = undefined;
        if (defaultMethod === 'perpetualPrivateGetPositionPending') {
            response = await this.perpetualPrivateGetPositionPending (this.extend (request, params));
        } else {
            response = await this.perpetualPrivateGetPositionFinished (this.extend (request, params));
        }
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "adl_sort": 3396,
        //                 "adl_sort_val": "0.00007786",
        //                 "amount": "0.0005",
        //                 "amount_max": "0.0005",
        //                 "amount_max_margin": "6.42101333333333333333",
        //                 "bkr_price": "25684.05333333333333346175",
        //                 "bkr_price_imply": "0.00000000000000000000",
        //                 "close_left": "0.0005",
        //                 "create_time": 1651294226.110899,
        //                 "deal_all": "19.26000000000000000000",
        //                 "deal_asset_fee": "0.00000000000000000000",
        //                 "fee_asset": "",
        //                 "finish_type": 1,
        //                 "first_price": "38526.08",
        //                 "insurance": "0.00000000000000000000",
        //                 "latest_price": "38526.08",
        //                 "leverage": "3",
        //                 "liq_amount": "0.00000000000000000000",
        //                 "liq_order_price": "0",
        //                 "liq_order_time": 0,
        //                 "liq_price": "25876.68373333333333346175",
        //                 "liq_price_imply": "0.00000000000000000000",
        //                 "liq_profit": "0.00000000000000000000",
        //                 "liq_time": 0,
        //                 "mainten_margin": "0.005",
        //                 "mainten_margin_amount": "0.09631520000000000000",
        //                 "maker_fee": "0.00000000000000000000",
        //                 "margin_amount": "6.42101333333333333333",
        //                 "market": "BTCUSDT",
        //                 "open_margin": "0.33333333333333333333",
        //                 "open_margin_imply": "0.00000000000000000000",
        //                 "open_price": "38526.08000000000000000000",
        //                 "open_val": "19.26304000000000000000",
        //                 "open_val_max": "19.26304000000000000000",
        //                 "position_id": 65847227,
        //                 "profit_clearing": "-0.00963152000000000000",
        //                 "profit_real": "-0.00963152000000000000",
        //                 "profit_unreal": "0.00",
        //                 "side": 2,
        //                 "stop_loss_price": "0.00000000000000000000",
        //                 "stop_loss_type": 0,
        //                 "sys": 0,
        //                 "take_profit_price": "0.00000000000000000000",
        //                 "take_profit_type": 0,
        //                 "taker_fee": "0.00000000000000000000",
        //                 "total": 4661,
        //                 "type": 1,
        //                 "update_time": 1651294226.111196,
        //                 "user_id": 3620173
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const position = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < position.length; i++) {
            result.push (this.parsePosition (position[i], market));
        }
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name coinex#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http033_pending_position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.perpetualPrivateGetPositionPending (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "adl_sort": 3396,
        //                 "adl_sort_val": "0.00007786",
        //                 "amount": "0.0005",
        //                 "amount_max": "0.0005",
        //                 "amount_max_margin": "6.42101333333333333333",
        //                 "bkr_price": "25684.05333333333333346175",
        //                 "bkr_price_imply": "0.00000000000000000000",
        //                 "close_left": "0.0005",
        //                 "create_time": 1651294226.110899,
        //                 "deal_all": "19.26000000000000000000",
        //                 "deal_asset_fee": "0.00000000000000000000",
        //                 "fee_asset": "",
        //                 "finish_type": 1,
        //                 "first_price": "38526.08",
        //                 "insurance": "0.00000000000000000000",
        //                 "latest_price": "38526.08",
        //                 "leverage": "3",
        //                 "liq_amount": "0.00000000000000000000",
        //                 "liq_order_price": "0",
        //                 "liq_order_time": 0,
        //                 "liq_price": "25876.68373333333333346175",
        //                 "liq_price_imply": "0.00000000000000000000",
        //                 "liq_profit": "0.00000000000000000000",
        //                 "liq_time": 0,
        //                 "mainten_margin": "0.005",
        //                 "mainten_margin_amount": "0.09631520000000000000",
        //                 "maker_fee": "0.00000000000000000000",
        //                 "margin_amount": "6.42101333333333333333",
        //                 "market": "BTCUSDT",
        //                 "open_margin": "0.33333333333333333333",
        //                 "open_margin_imply": "0.00000000000000000000",
        //                 "open_price": "38526.08000000000000000000",
        //                 "open_val": "19.26304000000000000000",
        //                 "open_val_max": "19.26304000000000000000",
        //                 "position_id": 65847227,
        //                 "profit_clearing": "-0.00963152000000000000",
        //                 "profit_real": "-0.00963152000000000000",
        //                 "profit_unreal": "0.00",
        //                 "side": 2,
        //                 "stop_loss_price": "0.00000000000000000000",
        //                 "stop_loss_type": 0,
        //                 "sys": 0,
        //                 "take_profit_price": "0.00000000000000000000",
        //                 "take_profit_type": 0,
        //                 "taker_fee": "0.00000000000000000000",
        //                 "total": 4661,
        //                 "type": 1,
        //                 "update_time": 1651294226.111196,
        //                 "user_id": 3620173
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parsePosition (data[0], market);
    }

    parsePosition (position, market: Market = undefined) {
        //
        //     {
        //         "adl_sort": 3396,
        //         "adl_sort_val": "0.00007786",
        //         "amount": "0.0005",
        //         "amount_max": "0.0005",
        //         "amount_max_margin": "6.42101333333333333333",
        //         "bkr_price": "25684.05333333333333346175",
        //         "bkr_price_imply": "0.00000000000000000000",
        //         "close_left": "0.0005",
        //         "create_time": 1651294226.110899,
        //         "deal_all": "19.26000000000000000000",
        //         "deal_asset_fee": "0.00000000000000000000",
        //         "fee_asset": "",
        //         "finish_type": 1,
        //         "first_price": "38526.08",
        //         "insurance": "0.00000000000000000000",
        //         "latest_price": "38526.08",
        //         "leverage": "3",
        //         "liq_amount": "0.00000000000000000000",
        //         "liq_order_price": "0",
        //         "liq_order_time": 0,
        //         "liq_price": "25876.68373333333333346175",
        //         "liq_price_imply": "0.00000000000000000000",
        //         "liq_profit": "0.00000000000000000000",
        //         "liq_time": 0,
        //         "mainten_margin": "0.005",
        //         "mainten_margin_amount": "0.09631520000000000000",
        //         "maker_fee": "0.00000000000000000000",
        //         "margin_amount": "6.42101333333333333333",
        //         "market": "BTCUSDT",
        //         "open_margin": "0.33333333333333333333",
        //         "open_margin_imply": "0.00000000000000000000",
        //         "open_price": "38526.08000000000000000000",
        //         "open_val": "19.26304000000000000000",
        //         "open_val_max": "19.26304000000000000000",
        //         "position_id": 65847227,
        //         "profit_clearing": "-0.00963152000000000000",
        //         "profit_real": "-0.00963152000000000000",
        //         "profit_unreal": "0.00",
        //         "side": 2,
        //         "stop_loss_price": "0.00000000000000000000",
        //         "stop_loss_type": 0,
        //         "sys": 0,
        //         "take_profit_price": "0.00000000000000000000",
        //         "take_profit_type": 0,
        //         "taker_fee": "0.00000000000000000000",
        //         "total": 4661,
        //         "type": 1,
        //         "update_time": 1651294226.111196,
        //         "user_id": 3620173
        //     }
        //
        const marketId = this.safeString (position, 'market');
        const defaultType = this.safeString (this.options, 'defaultType');
        market = this.safeMarket (marketId, market, undefined, defaultType);
        const symbol = market['symbol'];
        const positionId = this.safeInteger (position, 'position_id');
        const marginModeInteger = this.safeInteger (position, 'type');
        const marginMode = (marginModeInteger === 1) ? 'isolated' : 'cross';
        const liquidationPrice = this.safeString (position, 'liq_price');
        const entryPrice = this.safeString (position, 'open_price');
        const unrealizedPnl = this.safeString (position, 'profit_unreal');
        const contracts = this.safeNumber (position, 'amount');
        const sideInteger = this.safeInteger (position, 'side');
        const side = (sideInteger === 1) ? 'short' : 'long';
        const timestamp = this.safeTimestamp (position, 'update_time');
        const maintenanceMargin = this.safeString (position, 'mainten_margin_amount');
        const maintenanceMarginPercentage = this.safeString (position, 'mainten_margin');
        const collateral = this.safeString (position, 'margin_amount');
        const leverage = this.safeString (position, 'leverage');
        const notional = this.safeString (position, 'open_val');
        const initialMargin = Precise.stringDiv (notional, leverage);
        const initialMarginPercentage = Precise.stringDiv ('1', leverage);
        return this.safePosition ({
            'info': position,
            'id': positionId,
            'symbol': symbol,
            'notional': this.parseNumber (notional),
            'marginMode': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.parseNumber (entryPrice),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'percentage': undefined,
            'contracts': contracts,
            'contractSize': this.safeNumber (market, 'contractSize'),
            'markPrice': undefined,
            'lastPrice': undefined,
            'side': side,
            'hedged': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': this.parseNumber (maintenanceMargin),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentage),
            'collateral': this.parseNumber (collateral),
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'leverage': this.parseNumber (leverage),
            'marginRatio': undefined,
            'stopLossPrice': this.omitZero (this.safeString (position, 'stop_loss_price')),
            'takeProfitPrice': this.omitZero (this.safeString (position, 'take_profit_price')),
        });
    }

    async setMarginMode (marginMode, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coinex#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http014_adjust_leverage
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase ();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['type'] !== 'swap') {
            throw new BadSymbol (this.id + ' setMarginMode() supports swap contracts only');
        }
        let defaultPositionType = undefined;
        if (marginMode === 'isolated') {
            defaultPositionType = 1;
        } else if (marginMode === 'cross') {
            defaultPositionType = 2;
        }
        const leverage = this.safeInteger (params, 'leverage');
        const maxLeverage = this.safeInteger (market['limits']['leverage'], 'max', 100);
        const positionType = this.safeInteger (params, 'position_type', defaultPositionType);
        if (leverage === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a leverage parameter');
        }
        if (positionType === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a position_type parameter that will transfer margin to the specified trading pair');
        }
        if ((leverage < 3) || (leverage > maxLeverage)) {
            throw new BadRequest (this.id + ' setMarginMode() leverage should be between 3 and ' + maxLeverage.toString () + ' for ' + symbol);
        }
        const request = {
            'market': market['id'],
            'leverage': leverage.toString (),
            'position_type': positionType, // 1: isolated, 2: cross
        };
        return await this.perpetualPrivatePostMarketAdjustLeverage (this.extend (request, params));
    }

    async setLeverage (leverage, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coinex#setLeverage
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http014_adjust_leverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' (default is 'cross')
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' setLeverage() supports swap contracts only');
        }
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('setLeverage', params, 'cross');
        let positionType = undefined;
        if (marginMode === 'isolated') {
            positionType = 1;
        } else if (marginMode === 'cross') {
            positionType = 2;
        }
        const minLeverage = this.safeInteger (market['limits']['leverage'], 'min', 1);
        const maxLeverage = this.safeInteger (market['limits']['leverage'], 'max', 100);
        if ((leverage < minLeverage) || (leverage > maxLeverage)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between ' + minLeverage.toString () + ' and ' + maxLeverage.toString () + ' for ' + symbol);
        }
        const request = {
            'market': market['id'],
            'leverage': leverage.toString (),
            'position_type': positionType, // 1: isolated, 2: cross
        };
        return await this.perpetualPrivatePostMarketAdjustLeverage (this.extend (request, params));
    }

    async fetchLeverageTiers (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name coinex#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http007_market_limit
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.perpetualPublicGetMarketLimitConfig (params);
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "BTCUSD": [
        //                 ["500001", "100", "0.005"],
        //                 ["1000001", "50", "0.01"],
        //                 ["2000001", "30", "0.015"],
        //                 ["5000001", "20", "0.02"],
        //                 ["10000001", "15", "0.025"],
        //                 ["20000001", "10", "0.03"]
        //             ],
        //             ...
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseLeverageTiers (data, symbols, undefined);
    }

    parseLeverageTiers (response, symbols: Strings = undefined, marketIdKey = undefined) {
        //
        //     {
        //         "BTCUSD": [
        //             ["500001", "100", "0.005"],
        //             ["1000001", "50", "0.01"],
        //             ["2000001", "30", "0.015"],
        //             ["5000001", "20", "0.02"],
        //             ["10000001", "15", "0.025"],
        //             ["20000001", "10", "0.03"]
        //         ],
        //         ...
        //     }
        //
        const tiers = {};
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId, undefined, undefined, 'spot');
            const symbol = this.safeString (market, 'symbol');
            let symbolsLength = 0;
            if (symbols !== undefined) {
                symbolsLength = symbols.length;
            }
            if (symbol !== undefined && (symbolsLength === 0 || this.inArray (symbols, symbol))) {
                tiers[symbol] = this.parseMarketLeverageTiers (response[marketId], market);
            }
        }
        return tiers;
    }

    parseMarketLeverageTiers (item, market: Market = undefined) {
        const tiers = [];
        let minNotional = 0;
        for (let j = 0; j < item.length; j++) {
            const bracket = item[j];
            const maxNotional = this.safeNumber (bracket, 0);
            tiers.push ({
                'tier': j + 1,
                'currency': market['linear'] ? market['base'] : market['quote'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeNumber (bracket, 2),
                'maxLeverage': this.safeInteger (bracket, 1),
                'info': bracket,
            });
            minNotional = maxNotional;
        }
        return tiers;
    }

    async modifyMarginHelper (symbol: string, amount, addOrReduce, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'type': addOrReduce,
        };
        const response = await this.perpetualPrivatePostPositionAdjustMargin (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "adl_sort": 1,
        //             "adl_sort_val": "0.00004320",
        //             "amount": "0.0005",
        //             "amount_max": "0.0005",
        //             "amount_max_margin": "6.57352000000000000000",
        //             "bkr_price": "16294.08000000000000011090",
        //             "bkr_price_imply": "0.00000000000000000000",
        //             "close_left": "0.0005",
        //             "create_time": 1651202571.320778,
        //             "deal_all": "19.72000000000000000000",
        //             "deal_asset_fee": "0.00000000000000000000",
        //             "fee_asset": "",
        //             "finish_type": 1,
        //             "first_price": "39441.12",
        //             "insurance": "0.00000000000000000000",
        //             "latest_price": "39441.12",
        //             "leverage": "3",
        //             "liq_amount": "0.00000000000000000000",
        //             "liq_order_price": "0",
        //             "liq_order_time": 0,
        //             "liq_price": "16491.28560000000000011090",
        //             "liq_price_imply": "0.00000000000000000000",
        //             "liq_profit": "0.00000000000000000000",
        //             "liq_time": 0,
        //             "mainten_margin": "0.005",
        //             "mainten_margin_amount": "0.09860280000000000000",
        //             "maker_fee": "0.00000000000000000000",
        //             "margin_amount": "11.57352000000000000000",
        //             "market": "BTCUSDT",
        //             "open_margin": "0.58687582908396110455",
        //             "open_margin_imply": "0.00000000000000000000",
        //             "open_price": "39441.12000000000000000000",
        //             "open_val": "19.72056000000000000000",
        //             "open_val_max": "19.72056000000000000000",
        //             "position_id": 65171206,
        //             "profit_clearing": "-0.00986028000000000000",
        //             "profit_real": "-0.00986028000000000000",
        //             "profit_unreal": "0.00",
        //             "side": 2,
        //             "stop_loss_price": "0.00000000000000000000",
        //             "stop_loss_type": 0,
        //             "sys": 0,
        //             "take_profit_price": "0.00000000000000000000",
        //             "take_profit_type": 0,
        //             "taker_fee": "0.00000000000000000000",
        //             "total": 3464,
        //             "type": 1,
        //             "update_time": 1651202638.911212,
        //             "user_id": 3620173
        //         },
        //         "message":"OK"
        //     }
        //
        const status = this.safeString (response, 'message');
        const type = (addOrReduce === 1) ? 'add' : 'reduce';
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
            'status': status,
        });
    }

    parseMarginModification (data, market: Market = undefined) {
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': market['quote'],
            'symbol': this.safeSymbol (undefined, market),
            'status': undefined,
        };
    }

    async addMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name coinex#addMargin
         * @description add margin
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http032_adjust_position_margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 1, params);
    }

    async reduceMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name coinex#reduceMargin
         * @description remove margin from a position
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http032_adjust_position_margin
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 2, params);
    }

    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinex#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http034_funding_position
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch funding history for
         * @param {int} [limit] the maximum number of funding history structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        limit = (limit === undefined) ? 100 : limit;
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'limit': limit,
            // 'offset': 0,
            // 'end_time': 1638990636000,
            // 'windowtime': 1638990636000,
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const response = await this.perpetualPrivateGetPositionFunding (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "limit": 100,
        //             "offset": 0,
        //             "records": [
        //                 {
        //                     "amount": "0.0012",
        //                     "asset": "USDT",
        //                     "funding": "-0.0095688273996",
        //                     "funding_rate": "0.00020034",
        //                     "market": "BTCUSDT",
        //                     "position_id": 62052321,
        //                     "price": "39802.45",
        //                     "real_funding_rate": "0.00020034",
        //                     "side": 2,
        //                     "time": 1650729623.933885,
        //                     "type": 1,
        //                     "user_id": 3620173,
        //                     "value": "47.76294"
        //                 },
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'records', []);
        const result = [];
        for (let i = 0; i < resultList.length; i++) {
            const entry = resultList[i];
            const timestamp = this.safeTimestamp (entry, 'time');
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            result.push ({
                'info': entry,
                'symbol': symbol,
                'code': code,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeNumber (entry, 'position_id'),
                'amount': this.safeNumber (entry, 'funding'),
            });
        }
        return result as FundingHistory[];
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name coinex#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http008_market_ticker
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'market': market['id'],
        };
        const response = await this.perpetualPublicGetMarketTicker (this.extend (request, params));
        //
        //     {
        //          "code": 0,
        //         "data":
        //         {
        //             "date": 1650678472474,
        //             "ticker": {
        //                 "vol": "6090.9430",
        //                 "low": "39180.30",
        //                 "open": "40474.97",
        //                 "high": "40798.01",
        //                 "last": "39659.30",
        //                 "buy": "39663.79",
        //                 "period": 86400,
        //                 "funding_time": 372,
        //                 "position_amount": "270.1956",
        //                 "funding_rate_last": "0.00022913",
        //                 "funding_rate_next": "0.00013158",
        //                 "funding_rate_predict": "0.00016552",
        //                 "insurance": "16045554.83969682659674035672",
        //                 "sign_price": "39652.48",
        //                 "index_price": "39648.44250000",
        //                 "sell_total": "22.3913",
        //                 "buy_total": "19.4498",
        //                 "buy_amount": "12.8942",
        //                 "sell": "39663.80",
        //                 "sell_amount": "0.9388"
        //             }
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const ticker = this.safeValue (data, 'ticker', {});
        const timestamp = this.safeInteger (data, 'date');
        ticker['timestamp'] = timestamp; // avoid changing parseFundingRate signature
        return this.parseFundingRate (ticker, market);
    }

    parseFundingRate (contract, market: Market = undefined) {
        //
        // fetchFundingRate
        //
        //     {
        //         "vol": "6090.9430",
        //         "low": "39180.30",
        //         "open": "40474.97",
        //         "high": "40798.01",
        //         "last": "39659.30",
        //         "buy": "39663.79",
        //         "period": 86400,
        //         "funding_time": 372,
        //         "position_amount": "270.1956",
        //         "funding_rate_last": "0.00022913",
        //         "funding_rate_next": "0.00013158",
        //         "funding_rate_predict": "0.00016552",
        //         "insurance": "16045554.83969682659674035672",
        //         "sign_price": "39652.48",
        //         "index_price": "39648.44250000",
        //         "sell_total": "22.3913",
        //         "buy_total": "19.4498",
        //         "buy_amount": "12.8942",
        //         "sell": "39663.80",
        //         "sell_amount": "0.9388"
        //     }
        //
        const timestamp = this.safeInteger (contract, 'timestamp');
        contract = this.omit (contract, 'timestamp');
        const fundingDelta = this.safeInteger (contract, 'funding_time') * 60 * 1000;
        const fundingHour = (timestamp + fundingDelta) / 3600000;
        const fundingTimestamp = Math.round (fundingHour) * 3600000;
        return {
            'info': contract,
            'symbol': this.safeSymbol (undefined, market),
            'markPrice': this.safeNumber (contract, 'sign_price'),
            'indexPrice': this.safeNumber (contract, 'index_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'funding_rate_next'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': this.safeNumber (contract, 'funding_rate_predict'),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': this.safeNumber (contract, 'funding_rate_last'),
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRates (symbols: Strings = undefined, params = {}) {
        /**
         *  @method
         * @name coinex#fetchFundingRates
         * @description fetch the current funding rates
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http009_market_ticker_all
         * @param {string[]} symbols unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue (symbols, 0);
            market = this.market (symbol);
            if (!market['swap']) {
                throw new BadSymbol (this.id + ' fetchFundingRates() supports swap contracts only');
            }
        }
        const response = await this.perpetualPublicGetMarketTickerAll (params);
        //
        //     {
        //         "code": 0,
        //         "data":
        //         {
        //             "date": 1650678472474,
        //             "ticker": {
        //                 "BTCUSDT": {
        //                     "vol": "6090.9430",
        //                     "low": "39180.30",
        //                     "open": "40474.97",
        //                     "high": "40798.01",
        //                     "last": "39659.30",
        //                     "buy": "39663.79",
        //                     "period": 86400,
        //                     "funding_time": 372,
        //                     "position_amount": "270.1956",
        //                     "funding_rate_last": "0.00022913",
        //                     "funding_rate_next": "0.00013158",
        //                     "funding_rate_predict": "0.00016552",
        //                     "insurance": "16045554.83969682659674035672",
        //                     "sign_price": "39652.48",
        //                     "index_price": "39648.44250000",
        //                     "sell_total": "22.3913",
        //                     "buy_total": "19.4498",
        //                     "buy_amount": "12.8942",
        //                     "sell": "39663.80",
        //                     "sell_amount": "0.9388"
        //                 }
        //             }
        //         },
        //         "message": "OK"
        //     }
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'ticker', {});
        const timestamp = this.safeInteger (data, 'date');
        const result = [];
        const marketIds = Object.keys (tickers);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            if (marketId.indexOf ('_') === -1) { // skip _signprice and _indexprice
                const marketInner = this.safeMarket (marketId, undefined, undefined, 'swap');
                const ticker = tickers[marketId];
                ticker['timestamp'] = timestamp;
                result.push (this.parseFundingRate (ticker, marketInner));
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name coinex#withdraw
         * @description make a withdrawal
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account015_submit_withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.network] unified network code
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networkCode = this.safeStringUpper (params, 'network');
        params = this.omit (params, 'network');
        if (tag) {
            address = address + ':' + tag;
        }
        const request = {
            'coin_type': currency['id'],
            'coin_address': address, // must be authorized, inter-user transfer by a registered mobile phone number or an email address is supported
            'actual_amount': parseFloat (amount), // the actual amount without fees, https://www.coinex.com/fees
            'transfer_method': 'onchain', // onchain, local
        };
        if (networkCode !== undefined) {
            request['smart_contract_name'] = this.networkCodeToId (networkCode);
        }
        const response = await this.privatePostBalanceCoinWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "actual_amount": "1.00000000",
        //             "amount": "1.00000000",
        //             "coin_address": "1KAv3pazbTk2JnQ5xTo6fpKK7p1it2RzD4",
        //             "coin_type": "BCH",
        //             "coin_withdraw_id": 206,
        //             "confirmations": 0,
        //             "create_time": 1524228297,
        //             "status": "audit",
        //             "tx_fee": "0",
        //             "tx_id": ""
        //         },
        //         "message": "Ok"
        //     }
        //
        const transaction = this.safeValue (response, 'data', {});
        return this.parseTransaction (transaction, currency);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'audit': 'pending',
            'pass': 'pending',
            'processing': 'pending',
            'confirming': 'pending',
            'not_pass': 'failed',
            'cancel': 'canceled',
            'finish': 'ok',
            'fail': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinex#fetchFundingRateHistory
         * @see https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http038_funding_history
         * @description fetches historical funding rate prices
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @param {int} [params.until] timestamp in ms of the latest funding rate
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchFundingRateHistory', symbol, since, limit, '8h', params, 1000) as FundingRateHistory[];
        }
        if (limit === undefined) {
            limit = 100;
        }
        const market = this.market (symbol);
        let request = {
            'market': market['id'],
            'limit': limit,
            'offset': 0,
            // 'end_time': 1638990636,
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        [ request, params ] = this.handleUntilOption ('end_time', request, params);
        const response = await this.perpetualPublicGetMarketFundingHistory (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "offset": 0,
        //             "limit": 3,
        //             "records": [
        //                 {
        //                     "time": 1650672021.6230309,
        //                     "market": "BTCUSDT",
        //                     "asset": "USDT",
        //                     "funding_rate": "0.00022913",
        //                     "funding_rate_real": "0.00022913"
        //                 },
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = this.safeValue (data, 'records', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'market');
            const symbolInner = this.safeSymbol (marketId, market, undefined, 'swap');
            const timestamp = this.safeTimestamp (entry, 'time');
            rates.push ({
                'info': entry,
                'symbol': symbolInner,
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //
        //    {
        //        "coin_deposit_id": 32555985,
        //        "create_time": 1673325495,
        //        "amount": "12.71",
        //        "amount_display": "12.71",
        //        "diff_amount": "0",
        //        "min_amount": "0",
        //        "actual_amount": "12.71",
        //        "actual_amount_display": "12.71",
        //        "confirmations": 35,
        //        "tx_id": "0x57f1c92cc10b48316e2bf5faf230694fec2174e7744c1562a9a88b9c1e585f56",
        //        "tx_id_display": "0x57f1c92cc10b48316e2bf5faf230694fec2174e7744c1562a9a88b9c1e585f56",
        //        "coin_address": "0xe7a3831c56836f466b6a6268cff4fc852cf4b738",
        //        "coin_address_display": "0xe7a3****f4b738",
        //        "add_explorer": "https://bscscan.com/address/0xe7a3831c56836f466b6a6268cff4fc852cf4b738",
        //        "coin_type": "USDT",
        //        "smart_contract_name": "BSC",
        //        "transfer_method": "onchain",
        //        "status": "finish",
        //        "status_display": "finish",
        //        "remark": "",
        //        "explorer": "https://bscscan.com/tx/0x57f1c92cc10b48316e2bf5faf230694fec2174e7744c1562a9a88b9c1e585f56"
        //    }
        //
        // fetchWithdrawals
        //
        //    {
        //        "coin_withdraw_id": 20076836,
        //        "create_time": 1673325776,
        //        "actual_amount": "0.029",
        //        "actual_amount_display": "0.029",
        //        "amount": "0.03",
        //        "amount_display": "0.03",
        //        "coin_address": "MBhJcc3r5b3insc7QxyvEPtf31NqUdJpAb",
        //        "app_coin_address_display": "MBh****pAb",
        //        "coin_address_display": "MBhJcc****UdJpAb",
        //        "add_explorer": "https://explorer.viawallet.com/ltc/address/MBhJcc3r5b3insc7QxyvEPtf31NqUdJpAb",
        //        "coin_type": "LTC",
        //        "confirmations": 7,
        //        "explorer": "https://explorer.viawallet.com/ltc/tx/a0aa082132619b8a499b87e7d5bc3c508e0227104f5202ae26b695bb4cb7fbf9",
        //        "fee": "0",
        //        "remark": "",
        //        "smart_contract_name": "",
        //        "status": "finish",
        //        "status_display": "finish",
        //        "transfer_method": "onchain",
        //        "tx_fee": "0.001",
        //        "tx_id": "a0aa082132619b8a499b87e7d5bc3c508e0227104f5202ae26b695bb4cb7fbf9"
        //    }
        //
        const id = this.safeString2 (transaction, 'coin_withdraw_id', 'coin_deposit_id');
        const address = this.safeString (transaction, 'coin_address');
        let tag = this.safeString (transaction, 'remark'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeValue (transaction, 'tx_id');
        if (txid !== undefined) {
            if (txid.length < 1) {
                txid = undefined;
            }
        }
        const currencyId = this.safeString (transaction, 'coin_type');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeTimestamp (transaction, 'create_time');
        const type = ('coin_withdraw_id' in transaction) ? 'withdrawal' : 'deposit';
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const networkId = this.safeString (transaction, 'smart_contract_name');
        const amount = this.safeNumber (transaction, 'actual_amount');
        let feeCost = this.safeString (transaction, 'tx_fee');
        const transferMethod = this.safeString (transaction, 'transfer_method');
        const internal = transferMethod === 'local';
        let addressTo = undefined;
        let addressFrom = undefined;
        if (type === 'deposit') {
            feeCost = '0';
            addressTo = address;
        } else {
            addressFrom = address;
        }
        const fee = {
            'cost': this.parseNumber (feeCost),
            'currency': code,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId),
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': addressTo,
            'tagFrom': addressFrom,
            'type': type,
            'amount': this.parseNumber (amount),
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
            'comment': undefined,
            'internal': internal,
        };
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name coinex#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account014_balance_contract_transfer
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account013_margin_transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const amountToPrecision = this.currencyToPrecision (code, amount);
        const request = {
            'amount': amountToPrecision,
            'coin_type': currency['id'],
        };
        let response = undefined;
        if ((fromAccount === 'spot') && (toAccount === 'swap')) {
            request['transfer_side'] = 'in'; // 'in' spot to swap, 'out' swap to spot
            response = await this.privatePostContractBalanceTransfer (this.extend (request, params));
        } else if ((fromAccount === 'swap') && (toAccount === 'spot')) {
            request['transfer_side'] = 'out'; // 'in' spot to swap, 'out' swap to spot
            response = await this.privatePostContractBalanceTransfer (this.extend (request, params));
        } else {
            const accountsById = this.safeValue (this.options, 'accountsById', {});
            const fromId = this.safeString (accountsById, fromAccount, fromAccount);
            const toId = this.safeString (accountsById, toAccount, toAccount);
            // fromAccount and toAccount must be integers for margin transfers
            // spot is 0, use fetchBalance() to find the margin account id
            request['from_account'] = parseInt (fromId);
            request['to_account'] = parseInt (toId);
            response = await this.privatePostMarginTransfer (this.extend (request, params));
        }
        //
        //     {"code": 0, "data": null, "message": "Success"}
        //
        return this.extend (this.parseTransfer (response, currency), {
            'amount': this.parseNumber (amountToPrecision),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }

    parseTransferStatus (status) {
        const statuses = {
            '0': 'ok',
            'SUCCESS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransfer (transfer, currency: Currency = undefined) {
        //
        // fetchTransfers Swap
        //
        //     {
        //         "amount": "10",
        //         "asset": "USDT",
        //         "transfer_type": "transfer_out", // from swap to spot
        //         "created_at": 1651633422
        //     },
        //
        // fetchTransfers Margin
        //
        //     {
        //         "id": 7580062,
        //         "updated_at": 1653684379,
        //         "user_id": 3620173,
        //         "from_account_id": 0,
        //         "to_account_id": 1,
        //         "asset": "BTC",
        //         "amount": "0.00160829",
        //         "balance": "0.00160829",
        //         "transfer_type": "IN",
        //         "status": "SUCCESS",
        //         "created_at": 1653684379
        //     },
        //
        const timestamp = this.safeTimestamp (transfer, 'created_at');
        const transferType = this.safeString (transfer, 'transfer_type');
        let fromAccount = undefined;
        let toAccount = undefined;
        if (transferType === 'transfer_out') {
            fromAccount = 'swap';
            toAccount = 'spot';
        } else if (transferType === 'transfer_in') {
            fromAccount = 'spot';
            toAccount = 'swap';
        } else if (transferType === 'IN') {
            fromAccount = 'spot';
            toAccount = 'margin';
        } else if (transferType === 'OUT') {
            fromAccount = 'margin';
            toAccount = 'spot';
        }
        const currencyId = this.safeString (transfer, 'asset');
        const currencyCode = this.safeCurrencyCode (currencyId, currency);
        return {
            'id': this.safeInteger (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': currencyCode,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus (this.safeString2 (transfer, 'code', 'status')),
        };
    }

    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinex#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account025_margin_transfer_history
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account024_contract_transfer_history
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for
         * @param {int} [limit] the maximum number of  transfers structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'page': 1,
            // 'limit': limit,
            // 'asset': 'USDT',
            // 'start_time': since,
            // 'end_time': 1515806440,
            // 'transfer_type': 'transfer_in', // transfer_in: from Spot to Swap Account, transfer_out: from Swap to Spot Account
        };
        const page = this.safeInteger (params, 'page');
        if (page !== undefined) {
            request['page'] = page;
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        } else {
            request['limit'] = 100;
        }
        params = this.omit (params, 'page');
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchTransfers', params);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginTransferHistory (this.extend (request, params));
        } else {
            response = await this.privateGetContractTransferHistory (this.extend (request, params));
        }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "records": [
        //                 {
        //                     "amount": "10",
        //                     "asset": "USDT",
        //                     "transfer_type": "transfer_out",
        //                     "created_at": 1651633422
        //                 },
        //             ],
        //             "total": 5
        //         },
        //         "message": "Success"
        //     }
        //
        // Margin
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "records": [
        //                 {
        //                     "id": 7580062,
        //                     "updated_at": 1653684379,
        //                     "user_id": 3620173,
        //                     "from_account_id": 0,
        //                     "to_account_id": 1,
        //                     "asset": "BTC",
        //                     "amount": "0.00160829",
        //                     "balance": "0.00160829",
        //                     "transfer_type": "IN",
        //                     "status": "SUCCESS",
        //                     "created_at": 1653684379
        //                 }
        //             ],
        //             "total": 1
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transfers = this.safeValue (data, 'records', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name coinex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account026_withdraw_list
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            await this.loadMarkets ();
            currency = this.currency (code);
            request['coin_type'] = currency['id'];
        }
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetBalanceCoinWithdraw (this.extend (request, params));
        //
        //    {
        //        "code": 0,
        //        "data": {
        //            "has_next": false,
        //            "curr_page": 1,
        //            "count": 1,
        //            "data": [
        //                {
        //                    "coin_withdraw_id": 20076836,
        //                    "create_time": 1673325776,
        //                    "actual_amount": "0.029",
        //                    "actual_amount_display": "0.029",
        //                    "amount": "0.03",
        //                    "amount_display": "0.03",
        //                    "coin_address": "MBhJcc3r5b3insc7QxyvEPtf31NqUdJpAb",
        //                    "app_coin_address_display": "MBh****pAb",
        //                    "coin_address_display": "MBhJcc****UdJpAb",
        //                    "add_explorer": "https://explorer.viawallet.com/ltc/address/MBhJcc3r5b3insc7QxyvEPtf31NqUdJpAb",
        //                    "coin_type": "LTC",
        //                    "confirmations": 7,
        //                    "explorer": "https://explorer.viawallet.com/ltc/tx/a0aa082132619b8a499b87e7d5bc3c508e0227104f5202ae26b695bb4cb7fbf9",
        //                    "fee": "0",
        //                    "remark": "",
        //                    "smart_contract_name": "",
        //                    "status": "finish",
        //                    "status_display": "finish",
        //                    "transfer_method": "onchain",
        //                    "tx_fee": "0.001",
        //                    "tx_id": "a0aa082132619b8a499b87e7d5bc3c508e0227104f5202ae26b695bb4cb7fbf9"
        //                }
        //            ],
        //            "total": 1,
        //            "total_page": 1
        //        },
        //        "message": "Success"
        //    }
        //
        let data = this.safeValue (response, 'data');
        if (!Array.isArray (data)) {
            data = this.safeValue (data, 'data', []);
        }
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name coinex#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account009_deposit_list
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            await this.loadMarkets ();
            currency = this.currency (code);
            request['coin_type'] = currency['id'];
        }
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetBalanceCoinDeposit (this.extend (request, params));
        //
        //    {
        //        "code": 0,
        //        "data": {
        //            "has_next": false,
        //            "curr_page": 1,
        //            "count": 1,
        //            "data": [
        //                {
        //                    "coin_deposit_id": 32555985,
        //                    "create_time": 1673325495,
        //                    "amount": "12.71",
        //                    "amount_display": "12.71",
        //                    "diff_amount": "0",
        //                    "min_amount": "0",
        //                    "actual_amount": "12.71",
        //                    "actual_amount_display": "12.71",
        //                    "confirmations": 35,
        //                    "tx_id": "0x57f1c92cc10b48316e2bf5faf230694fec2174e7744c1562a9a88b9c1e585f56",
        //                    "tx_id_display": "0x57f1c92cc10b48316e2bf5faf230694fec2174e7744c1562a9a88b9c1e585f56",
        //                    "coin_address": "0xe7a3831c56836f466b6a6268cff4fc852cf4b738",
        //                    "coin_address_display": "0xe7a3****f4b738",
        //                    "add_explorer": "https://bscscan.com/address/0xe7a3831c56836f466b6a6268cff4fc852cf4b738",
        //                    "coin_type": "USDT",
        //                    "smart_contract_name": "BSC",
        //                    "transfer_method": "onchain",
        //                    "status": "finish",
        //                    "status_display": "finish",
        //                    "remark": "",
        //                    "explorer": "https://bscscan.com/tx/0x57f1c92cc10b48316e2bf5faf230694fec2174e7744c1562a9a88b9c1e585f56"
        //                }
        //            ],
        //            "total": 1,
        //            "total_page": 1
        //        },
        //        "message": "Success"
        //    }
        //
        let data = this.safeValue (response, 'data');
        if (!Array.isArray (data)) {
            data = this.safeValue (data, 'data', []);
        }
        return this.parseTransactions (data, currency, since, limit);
    }

    parseIsolatedBorrowRate (info, market: Market = undefined) {
        //
        //     {
        //         "market": "BTCUSDT",
        //         "leverage": 10,
        //         "BTC": {
        //             "min_amount": "0.002",
        //             "max_amount": "200",
        //             "day_rate": "0.001"
        //         },
        //         "USDT": {
        //             "min_amount": "60",
        //             "max_amount": "5000000",
        //             "day_rate": "0.001"
        //         }
        //     },
        //
        const marketId = this.safeString (info, 'market');
        market = this.safeMarket (marketId, market, undefined, 'spot');
        const baseInfo = this.safeValue (info, market['baseId']);
        const quoteInfo = this.safeValue (info, market['quoteId']);
        return {
            'symbol': market['symbol'],
            'base': market['base'],
            'baseRate': this.safeNumber (baseInfo, 'day_rate'),
            'quote': market['quote'],
            'quoteRate': this.safeNumber (quoteInfo, 'day_rate'),
            'period': 86400000,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    async fetchIsolatedBorrowRate (symbol: string, params = {}) {
        /**
         * @method
         * @name coinex#fetchIsolatedBorrowRate
         * @description fetch the rate of interest to borrow a currency for margin trading
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account007_margin_account_settings
         * @param {string} symbol unified symbol of the market to fetch the borrow rate for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [isolated borrow rate structure]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetMarginConfig (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "market": "BTCUSDT",
        //             "leverage": 10,
        //             "BTC": {
        //                 "min_amount": "0.002",
        //                 "max_amount": "200",
        //                 "day_rate": "0.001"
        //             },
        //             "USDT": {
        //                 "min_amount": "60",
        //                 "max_amount": "5000000",
        //                 "day_rate": "0.001"
        //             }
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseIsolatedBorrowRate (data, market);
    }

    async fetchIsolatedBorrowRates (params = {}) {
        /**
         * @method
         * @name coinex#fetchIsolatedBorrowRates
         * @description fetch the borrow interest rates of all currencies
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account007_margin_account_settings
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [isolated borrow rate structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#isolated-borrow-rate-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetMarginConfig (params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "market": "BTCUSDT",
        //                 "leverage": 10,
        //                 "BTC": {
        //                     "min_amount": "0.002",
        //                     "max_amount": "200",
        //                     "day_rate": "0.001"
        //                 },
        //                 "USDT": {
        //                     "min_amount": "60",
        //                     "max_amount": "5000000",
        //                     "day_rate": "0.001"
        //                 }
        //             },
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            rates.push (this.parseIsolatedBorrowRate (data[i]));
        }
        return rates;
    }

    async fetchBorrowInterest (code: Str = undefined, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetMarginLoanHistory (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "page": 1,
        //             "limit": 10,
        //             "total": 1,
        //             "has_next": false,
        //             "curr_page": 1,
        //             "count": 1,
        //             "data": [
        //                 {
        //                     "loan_id": 2616357,
        //                     "create_time": 1654214027,
        //                     "market_type": "BTCUSDT",
        //                     "coin_type": "BTC",
        //                     "day_rate": "0.001",
        //                     "loan_amount": "0.0144",
        //                     "interest_amount": "0",
        //                     "unflat_amount": "0",
        //                     "expire_time": 1655078027,
        //                     "is_renew": true,
        //                     "status": "finish"
        //                 }
        //             ],
        //             "total_page": 1
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeValue (data, 'data', []);
        const interest = this.parseBorrowInterests (rows, market);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info, market: Market = undefined) {
        //
        //     {
        //         "loan_id": 2616357,
        //         "create_time": 1654214027,
        //         "market_type": "BTCUSDT",
        //         "coin_type": "BTC",
        //         "day_rate": "0.001",
        //         "loan_amount": "0.0144",
        //         "interest_amount": "0",
        //         "unflat_amount": "0",
        //         "expire_time": 1655078027,
        //         "is_renew": true,
        //         "status": "finish"
        //     }
        //
        const marketId = this.safeString (info, 'market_type');
        market = this.safeMarket (marketId, market, undefined, 'spot');
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeTimestamp (info, 'expire_time');
        const unflatAmount = this.safeString (info, 'unflat_amount');
        const loanAmount = this.safeString (info, 'loan_amount');
        let interest = Precise.stringSub (unflatAmount, loanAmount);
        if (unflatAmount === '0') {
            interest = undefined;
        }
        return {
            'account': undefined, // deprecated
            'symbol': symbol,
            'marginMode': 'isolated',
            'marginType': undefined, // deprecated
            'currency': this.safeCurrencyCode (this.safeString (info, 'coin_type')),
            'interest': this.parseNumber (interest),
            'interestRate': this.safeNumber (info, 'day_rate'),
            'amountBorrowed': this.parseNumber (loanAmount),
            'timestamp': timestamp,  // expiry time
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async borrowIsolatedMargin (symbol: string, code: string, amount, params = {}) {
        /**
         * @method
         * @name coinex#borrowIsolatedMargin
         * @description create a loan to borrow margin
         * @see https://github.com/coinexcom/coinex_exchange_api/wiki/086margin_loan
         * @param {string} symbol unified market symbol, required for coinex
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const currency = this.currency (code);
        const request = {
            'market': market['id'],
            'coin_type': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        const response = await this.privatePostMarginLoan (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "loan_id": 1670
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transaction = this.parseMarginLoan (data, currency);
        return this.extend (transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }

    async repayIsolatedMargin (symbol: string, code: string, amount, params = {}) {
        /**
         * @method
         * @name coinex#repayIsolatedMargin
         * @description repay borrowed margin and interest
         * @see https://github.com/coinexcom/coinex_exchange_api/wiki/087margin_flat
         * @param {string} symbol unified market symbol, required for coinex
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.loan_id] extra parameter that is not required
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const currency = this.currency (code);
        const request = {
            'market': market['id'],
            'coin_type': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        const response = await this.privatePostMarginFlat (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": null,
        //         "message": "Success"
        //     }
        //
        const transaction = this.parseMarginLoan (response, currency);
        return this.extend (transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }

    parseMarginLoan (info, currency: Currency = undefined) {
        //
        // borrowMargin
        //
        //     {
        //         "loan_id": 1670
        //     }
        //
        // repayMargin
        //
        //     {
        //         "code": 0,
        //         "data": null,
        //         "message": "Success"
        //     }
        //
        return {
            'id': this.safeInteger (info, 'loan_id'),
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    async fetchDepositWithdrawFees (codes: Strings = undefined, params = {}) {
        /**
         * @method
         * @name coinex#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market010_asset_config
         * @param {string[]|undefined} codes list of unified currency codes
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (codes !== undefined) {
            const codesLength = codes.length;
            if (codesLength === 1) {
                request['coin_type'] = this.safeValue (codes, 0);
            }
        }
        const response = await this.publicGetCommonAssetConfig (this.extend (request, params));
        //
        //    {
        //        "code": 0,
        //        "data": {
        //            "CET-CSC": {
        //                "asset": "CET",
        //                "chain": "CSC",
        //                "can_deposit": true,
        //                "can_withdraw ": false,
        //                "deposit_least_amount": "1",
        //                "withdraw_least_amount": "1",
        //                "withdraw_tx_fee": "0.1"
        //            },
        //            "CET-ERC20": {
        //                "asset": "CET",
        //                "chain": "ERC20",
        //                "can_deposit": true,
        //                "can_withdraw": false,
        //                "deposit_least_amount": "14",
        //                "withdraw_least_amount": "14",
        //                "withdraw_tx_fee": "14"
        //            }
        //        },
        //        "message": "Success"
        //    }
        //
        return this.parseDepositWithdrawFees (response, codes);
    }

    parseDepositWithdrawFees (response, codes = undefined, currencyIdKey = undefined) {
        const depositWithdrawFees = {};
        codes = this.marketCodes (codes);
        const data = this.safeValue (response, 'data');
        const currencyIds = Object.keys (data);
        for (let i = 0; i < currencyIds.length; i++) {
            const entry = currencyIds[i];
            const splitEntry = entry.split ('-');
            const feeInfo = data[currencyIds[i]];
            const currencyId = this.safeString (feeInfo, 'asset');
            const currency = this.safeCurrency (currencyId);
            const code = this.safeString (currency, 'code');
            if ((codes === undefined) || (this.inArray (code, codes))) {
                const depositWithdrawFee = this.safeValue (depositWithdrawFees, code);
                if (depositWithdrawFee === undefined) {
                    depositWithdrawFees[code] = this.depositWithdrawFee ({});
                }
                depositWithdrawFees[code]['info'][entry] = feeInfo;
                const networkId = this.safeString (splitEntry, 1);
                const withdrawFee = this.safeValue (feeInfo, 'withdraw_tx_fee');
                const withdrawResult = {
                    'fee': withdrawFee,
                    'percentage': (withdrawFee !== undefined) ? false : undefined,
                };
                const depositResult = {
                    'fee': undefined,
                    'percentage': undefined,
                };
                if (networkId !== undefined) {
                    const networkCode = this.networkIdToCode (networkId);
                    depositWithdrawFees[code]['networks'][networkCode] = {
                        'withdraw': withdrawResult,
                        'deposit': depositResult,
                    };
                } else {
                    depositWithdrawFees[code]['withdraw'] = withdrawResult;
                    depositWithdrawFees[code]['deposit'] = depositResult;
                }
            }
        }
        const depositWithdrawCodes = Object.keys (depositWithdrawFees);
        for (let i = 0; i < depositWithdrawCodes.length; i++) {
            const code = depositWithdrawCodes[i];
            const currency = this.currency (code);
            depositWithdrawFees[code] = this.assignDefaultDepositWithdrawFees (depositWithdrawFees[code], currency);
        }
        return depositWithdrawFees;
    }

    handleMarginModeAndParams (methodName, params = {}, defaultValue = undefined) {
        /**
         * @ignore
         * @method
         * @description marginMode specified by params["marginMode"], this.options["marginMode"], this.options["defaultMarginMode"], params["margin"] = true or this.options["defaultType"] = 'margin'
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {Array} the marginMode in lowercase
         */
        const defaultType = this.safeString (this.options, 'defaultType');
        const isMargin = this.safeValue (params, 'margin', false);
        let marginMode = undefined;
        [ marginMode, params ] = super.handleMarginModeAndParams (methodName, params, defaultValue);
        if (marginMode === undefined) {
            if ((defaultType === 'margin') || (isMargin === true)) {
                marginMode = 'isolated';
            }
        }
        return [ marginMode, params ];
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        let url = this.urls['api'][api] + '/' + this.version + '/' + path;
        let query = this.omit (params, this.extractParams (path));
        const nonce = this.nonce ().toString ();
        if (method === 'POST') {
            const parts = path.split ('/');
            const firstPart = this.safeString (parts, 0, '');
            const numParts = parts.length;
            const lastPart = this.safeString (parts, numParts - 1, '');
            const lastWords = lastPart.split ('_');
            const numWords = lastWords.length;
            const lastWord = this.safeString (lastWords, numWords - 1, '');
            if ((firstPart === 'order') && (lastWord === 'limit' || lastWord === 'market')) {
                // inject in implicit API calls
                // POST /order/limit - Place limit orders
                // POST /order/market - Place market orders
                // POST /order/stop/limit - Place stop limit orders
                // POST /order/stop/market - Place stop market orders
                // POST /perpetual/v1/order/put_limit - Place limit orders
                // POST /perpetual/v1/order/put_market - Place market orders
                // POST /perpetual/v1/order/put_stop_limit - Place stop limit orders
                // POST /perpetual/v1/order/put_stop_market - Place stop market orders
                const clientOrderId = this.safeString (params, 'client_id');
                if (clientOrderId === undefined) {
                    const defaultId = 'x-167673045';
                    const brokerId = this.safeValue (this.options, 'brokerId', defaultId);
                    query['client_id'] = brokerId + '_' + this.uuid16 ();
                }
            }
        }
        if (api === 'perpetualPrivate') {
            this.checkRequiredCredentials ();
            query = this.extend ({
                'access_id': this.apiKey,
                'timestamp': nonce,
            }, query);
            query = this.keysort (query);
            const urlencoded = this.rawencode (query);
            const signature = this.hash (this.encode (urlencoded + '&secret_key=' + this.secret), sha256);
            headers = {
                'Authorization': signature.toLowerCase (),
                'AccessId': this.apiKey,
            };
            if ((method === 'GET') || (method === 'PUT')) {
                url += '?' + urlencoded;
            } else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = urlencoded;
            }
        } else if (api === 'public' || api === 'perpetualPublic') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            query = this.extend ({
                'access_id': this.apiKey,
                'tonce': nonce,
            }, query);
            query = this.keysort (query);
            const urlencoded = this.rawencode (query);
            const signature = this.hash (this.encode (urlencoded + '&secret_key=' + this.secret), md5);
            headers = {
                'Authorization': signature.toUpperCase (),
                'Content-Type': 'application/json',
            };
            if ((method === 'GET') || (method === 'DELETE') || (method === 'PUT')) {
                url += '?' + urlencoded;
            } else {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const code = this.safeString (response, 'code');
        const data = this.safeValue (response, 'data');
        const message = this.safeString (response, 'message');
        if ((code !== '0') || ((message !== 'Success') && (message !== 'Succeeded') && (message !== 'Ok') && !data)) {
            const feedback = this.id + ' ' + message;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
