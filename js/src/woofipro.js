// ---------------------------------------------------------------------------
import Exchange from './abstract/woofipro.js';
import { AuthenticationError, RateLimitExceeded, BadRequest, ExchangeError, InvalidOrder, InsufficientFunds, ArgumentsRequired, NetworkError, NotSupported } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { ecdsa, eddsa } from './base/functions/crypto.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
// ---------------------------------------------------------------------------
/**
 * @class woofipro
 * @augments Exchange
 */
export default class woofipro extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'woofipro',
            'name': 'WOOFI PRO',
            'countries': ['KY'],
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'dex': true,
            'hostname': 'dex.woo.org',
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': true,
                'fetchFundingInterval': true,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#token-withdraw
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/9ba21b8a-a9c7-4770-b7f1-ce3bcbde68c1',
                'api': {
                    'public': 'https://api-evm.orderly.org',
                    'private': 'https://api-evm.orderly.org',
                },
                'test': {
                    'public': 'https://testnet-api-evm.orderly.org',
                    'private': 'https://testnet-api-evm.orderly.org',
                },
                'www': 'https://dex.woo.org',
                'doc': [
                    'https://orderly.network/docs/build-on-evm/building-on-evm',
                ],
                'fees': [
                    'https://dex.woo.org/en/orderly',
                ],
                'referral': {
                    'url': 'https://dex.woo.org/en/trade?ref=CCXT',
                    'discount': 0.05,
                },
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'public/volume/stats': 1,
                            'public/broker/name': 1,
                            'public/chain_info/{broker_id}': 1,
                            'public/system_info': 1,
                            'public/vault_balance': 1,
                            'public/insurancefund': 1,
                            'public/chain_info': 1,
                            'faucet/usdc': 1,
                            'public/account': 1,
                            'get_account': 1,
                            'registration_nonce': 1,
                            'get_orderly_key': 1,
                            'public/liquidation': 1,
                            'public/liquidated_positions': 1,
                            'public/config': 1,
                            'public/campaign/ranking': 10,
                            'public/campaign/stats': 10,
                            'public/campaign/user': 10,
                            'public/campaign/stats/details': 10,
                            'public/campaigns': 10,
                            'public/points/leaderboard': 1,
                            'client/points': 1,
                            'public/points/epoch': 1,
                            'public/points/epoch_dates': 1,
                            'public/referral/check_ref_code': 1,
                            'public/referral/verify_ref_code': 1,
                            'referral/admin_info': 1,
                            'referral/info': 1,
                            'referral/referee_info': 1,
                            'referral/referee_rebate_summary': 1,
                            'referral/referee_history': 1,
                            'referral/referral_history': 1,
                            'referral/rebate_summary': 1,
                            'client/distribution_history': 1,
                            'tv/config': 1,
                            'tv/history': 1,
                            'tv/symbol_info': 1,
                            'public/funding_rate_history': 1,
                            'public/funding_rate/{symbol}': 0.33,
                            'public/funding_rates': 1,
                            'public/info': 1,
                            'public/info/{symbol}': 1,
                            'public/market_trades': 1,
                            'public/token': 1,
                            'public/futures': 1,
                            'public/futures/{symbol}': 1,
                        },
                        'post': {
                            'register_account': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/key_info': 6,
                            'client/orderly_key_ip_restriction': 6,
                            'order/{oid}': 1,
                            'client/order/{client_order_id}': 1,
                            'algo/order/{oid}': 1,
                            'algo/client/order/{client_order_id}': 1,
                            'orders': 1,
                            'algo/orders': 1,
                            'trade/{tid}': 1,
                            'trades': 1,
                            'order/{oid}/trades': 1,
                            'client/liquidator_liquidations': 1,
                            'liquidations': 1,
                            'asset/history': 60,
                            'client/holding': 1,
                            'withdraw_nonce': 1,
                            'settle_nonce': 1,
                            'pnl_settlement/history': 1,
                            'volume/user/daily': 60,
                            'volume/user/stats': 60,
                            'client/statistics': 60,
                            'client/info': 60,
                            'client/statistics/daily': 60,
                            'positions': 3.33,
                            'position/{symbol}': 3.33,
                            'funding_fee/history': 30,
                            'notification/inbox/notifications': 60,
                            'notification/inbox/unread': 60,
                            'volume/broker/daily': 60,
                            'broker/fee_rate/default': 10,
                            'broker/user_info': 10,
                            'orderbook/{symbol}': 1,
                            'kline': 1,
                        },
                        'post': {
                            'orderly_key': 1,
                            'client/set_orderly_key_ip_restriction': 6,
                            'client/reset_orderly_key_ip_restriction': 6,
                            'order': 1,
                            'batch-order': 10,
                            'algo/order': 1,
                            'liquidation': 1,
                            'claim_insurance_fund': 1,
                            'withdraw_request': 1,
                            'settle_pnl': 1,
                            'notification/inbox/mark_read': 60,
                            'notification/inbox/mark_read_all': 60,
                            'client/leverage': 120,
                            'client/maintenance_config': 60,
                            'delegate_signer': 10,
                            'delegate_orderly_key': 10,
                            'delegate_settle_pnl': 10,
                            'delegate_withdraw_request': 10,
                            'broker/fee_rate/set': 10,
                            'broker/fee_rate/set_default': 10,
                            'broker/fee_rate/default': 10,
                            'referral/create': 10,
                            'referral/update': 10,
                            'referral/bind': 10,
                            'referral/edit_split': 10,
                        },
                        'put': {
                            'order': 1,
                            'algo/order': 1,
                        },
                        'delete': {
                            'order': 1,
                            'algo/order': 1,
                            'client/order': 1,
                            'algo/client/order': 1,
                            'algo/orders': 1,
                            'orders': 1,
                            'batch-order': 1,
                            'client/batch-order': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'accountId': true,
                'privateKey': false,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber('0.0002'),
                    'taker': this.parseNumber('0.0005'),
                },
            },
            'options': {
                'sandboxMode': false,
                'brokerId': 'CCXT',
                'verifyingContractAddress': '0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203',
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': true,
                        'leverage': true,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': true, // todo implement
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'untilDays': 100000,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 100000,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'forDerivatives': {
                    'extends': 'default',
                    'createOrder': {
                        // todo: implementation needs unification
                        'triggerPriceType': undefined,
                        'attachedStopLossTakeProfit': {
                            // todo: implementation needs unification
                            'triggerPriceType': undefined,
                            'price': false,
                        },
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivatives',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    '-1000': ExchangeError,
                    '-1001': AuthenticationError,
                    '-1002': AuthenticationError,
                    '-1003': RateLimitExceeded,
                    '-1004': BadRequest,
                    '-1005': BadRequest,
                    '-1006': InvalidOrder,
                    '-1007': BadRequest,
                    '-1008': InvalidOrder,
                    '-1009': InsufficientFunds,
                    '-1011': NetworkError,
                    '-1012': BadRequest,
                    '-1101': InsufficientFunds,
                    '-1102': InvalidOrder,
                    '-1103': InvalidOrder,
                    '-1104': InvalidOrder,
                    '-1105': InvalidOrder,
                    '-1201': BadRequest,
                    '-1202': BadRequest,
                    '29': BadRequest,
                    '9': AuthenticationError,
                    '3': AuthenticationError,
                    '2': BadRequest,
                    '15': BadRequest, // {"success":false,"code":15,"message":"BrokerId is not exist"}
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
        });
    }
    setSandboxMode(enable) {
        super.setSandboxMode(enable);
        this.options['sandboxMode'] = enable;
    }
    /**
     * @method
     * @name woofipro#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-system-maintenance-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.v1PublicGetPublicSystemInfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": 0,
        //             "msg": "System is functioning properly."
        //         },
        //         "timestamp": "1709274106602"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        let status = this.safeString(data, 'status');
        if (status === undefined) {
            status = 'error';
        }
        else if (status === '0') {
            status = 'ok';
        }
        else {
            status = 'maintenance';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name woofipro#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-system-maintenance-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.v1PublicGetPublicSystemInfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": 0,
        //             "msg": "System is functioning properly."
        //         },
        //         "timestamp": "1709274106602"
        //     }
        //
        return this.safeInteger(response, 'timestamp');
    }
    parseMarket(market) {
        //
        //   {
        //     "symbol": "PERP_BTC_USDC",
        //     "quote_min": 123,
        //     "quote_max": 100000,
        //     "quote_tick": 0.1,
        //     "base_min": 0.00001,
        //     "base_max": 20,
        //     "base_tick": 0.00001,
        //     "min_notional": 1,
        //     "price_range": 0.02,
        //     "price_scope": 0.4,
        //     "std_liquidation_fee": 0.03,
        //     "liquidator_fee": 0.015,
        //     "claim_insurance_fund_discount": 0.0075,
        //     "funding_period": 8,
        //     "cap_funding": 0.000375,
        //     "floor_funding": -0.000375,
        //     "interest_rate": 0.0001,
        //     "created_time": 1684140107326,
        //     "updated_time": 1685345968053,
        //     "base_mmr": 0.05,
        //     "base_imr": 0.1,
        //     "imr_factor": 0.0002512,
        //     "liquidation_tier": "1"
        //   }
        //
        const marketId = this.safeString(market, 'symbol');
        const parts = marketId.split('_');
        const marketType = 'swap';
        const baseId = this.safeString(parts, 1);
        const quoteId = this.safeString(parts, 2);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const settleId = this.safeString(parts, 2);
        const settle = this.safeCurrencyCode(settleId);
        const symbol = base + '/' + quote + ':' + settle;
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.parseNumber('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'base_tick'),
                'price': this.safeNumber(market, 'quote_tick'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'base_min'),
                    'max': this.safeNumber(market, 'base_max'),
                },
                'price': {
                    'min': this.safeNumber(market, 'quote_min'),
                    'max': this.safeNumber(market, 'quote_max'),
                },
                'cost': {
                    'min': this.safeNumber(market, 'min_notional'),
                    'max': undefined,
                },
            },
            'created': this.safeInteger(market, 'created_time'),
            'info': market,
        };
    }
    /**
     * @method
     * @name woofipro#fetchMarkets
     * @description retrieves data on all markets for woofipro
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-available-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.v1PublicGetPublicInfo(params);
        //
        //   {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "rows": [
        //         {
        //           "symbol": "PERP_BTC_USDC",
        //           "quote_min": 123,
        //           "quote_max": 100000,
        //           "quote_tick": 0.1,
        //           "base_min": 0.00001,
        //           "base_max": 20,
        //           "base_tick": 0.00001,
        //           "min_notional": 1,
        //           "price_range": 0.02,
        //           "price_scope": 0.4,
        //           "std_liquidation_fee": 0.03,
        //           "liquidator_fee": 0.015,
        //           "claim_insurance_fund_discount": 0.0075,
        //           "funding_period": 8,
        //           "cap_funding": 0.000375,
        //           "floor_funding": -0.000375,
        //           "interest_rate": 0.0001,
        //           "created_time": 1684140107326,
        //           "updated_time": 1685345968053,
        //           "base_mmr": 0.05,
        //           "base_imr": 0.1,
        //           "imr_factor": 0.0002512,
        //           "liquidation_tier": "1"
        //         }
        //       ]
        //     }
        //   }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseMarkets(rows);
    }
    /**
     * @method
     * @name woofipro#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://orderly.network/docs/build-on-omnichain/evm-api/restful-api/public/get-supported-collateral-info#get-supported-collateral-info
     * @see https://orderly.network/docs/build-on-omnichain/evm-api/restful-api/public/get-supported-chains-per-builder#get-supported-chains-per-builder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const result = {};
        const tokenPromise = this.v1PublicGetPublicToken(params);
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "rows": [{
        //         "token": "USDC",
        //         "decimals": 6,
        //         "minimum_withdraw_amount": 0.000001,
        //         "token_hash": "0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa",
        //         "chain_details": [{
        //             "chain_id": 43113,
        //             "contract_address": "0x5d64c9cfb0197775b4b3ad9be4d3c7976e0d8dc3",
        //             "cross_chain_withdrawal_fee": 123,
        //             "decimals": 6,
        //             "withdraw_fee": 2
        //             }]
        //         }
        //       ]
        //     }
        // }
        //
        const chainPromise = this.v1PublicGetPublicChainInfo(params);
        const [tokenResponse, chainResponse] = await Promise.all([tokenPromise, chainPromise]);
        const tokenData = this.safeDict(tokenResponse, 'data', {});
        const tokenRows = this.safeList(tokenData, 'rows', []);
        const chainData = this.safeDict(chainResponse, 'data', {});
        const chainRows = this.safeList(chainData, 'rows', []);
        const indexedChains = this.indexBy(chainRows, 'chain_id');
        for (let i = 0; i < tokenRows.length; i++) {
            const token = tokenRows[i];
            const currencyId = this.safeString(token, 'token');
            const networks = this.safeList(token, 'chain_details');
            const code = this.safeCurrencyCode(currencyId);
            const resultingNetworks = {};
            for (let j = 0; j < networks.length; j++) {
                const networkEntry = networks[j];
                const networkId = this.safeString(networkEntry, 'chain_id');
                const networkRow = this.safeDict(indexedChains, networkId);
                const networkName = this.safeString(networkRow, 'name');
                const networkCode = this.networkIdToCode(networkName, code);
                resultingNetworks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': this.safeNumber(networkEntry, 'withdrawal_fee'),
                    'precision': this.parseNumber(this.parsePrecision(this.safeString(networkEntry, 'decimals'))),
                    'info': [networkEntry, networkRow],
                };
            }
            result[code] = this.safeCurrencyStructure({
                'id': currencyId,
                'name': undefined,
                'code': code,
                'precision': undefined,
                'active': undefined,
                'fee': undefined,
                'networks': resultingNetworks,
                'deposit': undefined,
                'withdraw': undefined,
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber(token, 'minimum_withdraw_amount'),
                        'max': undefined,
                    },
                },
                'info': token,
            });
        }
        return result;
    }
    parseTokenAndFeeTemp(item, feeTokenKey, feeAmountKey) {
        const feeCost = this.safeString(item, feeAmountKey);
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(item, feeTokenKey);
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return fee;
    }
    parseTrade(trade, market = undefined) {
        //
        // public/market_trades
        //
        //     {
        //         "symbol": "SPOT_BTC_USDT",
        //         "side": "SELL",
        //         "executed_price": 46222.35,
        //         "executed_quantity": 0.0012,
        //         "executed_timestamp": "1683878609166"
        //     }
        //
        // fetchOrderTrades, fetchOrder
        //
        //     {
        //         "id": "99119876",
        //         "symbol": "SPOT_WOO_USDT",
        //         "fee": "0.0024",
        //         "side": "BUY",
        //         "executed_timestamp": "1641481113084",
        //         "order_id": "87001234",
        //         "order_tag": "default", <-- this param only in "fetchOrderTrades"
        //         "executed_price": "1",
        //         "executed_quantity": "12",
        //         "fee_asset": "WOO",
        //         "is_maker": "1"
        //     }
        //
        const isFromFetchOrder = ('id' in trade);
        const timestamp = this.safeInteger(trade, 'executed_timestamp');
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString(trade, 'executed_price');
        const amount = this.safeString(trade, 'executed_quantity');
        const order_id = this.safeString(trade, 'order_id');
        const fee = this.parseTokenAndFeeTemp(trade, 'fee_asset', 'fee');
        const feeCost = this.safeString(fee, 'cost');
        if (feeCost !== undefined) {
            fee['cost'] = feeCost;
        }
        const cost = Precise.stringMul(price, amount);
        const side = this.safeStringLower(trade, 'side');
        const id = this.safeString(trade, 'id');
        let takerOrMaker = undefined;
        if (isFromFetchOrder) {
            const isMaker = this.safeString(trade, 'is_maker') === '1';
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': order_id,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name woofipro#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-market-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetPublicMarketTrades(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "rows": [{
        //         "symbol": "PERP_ETH_USDC",
        //         "side": "BUY",
        //         "executed_price": 2050,
        //         "executed_quantity": 1,
        //         "executed_timestamp": 1683878609166
        //       }]
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseTrades(rows, market, since, limit);
    }
    parseFundingRate(fundingRate, market = undefined) {
        //
        //         {
        //             "symbol":"PERP_AAVE_USDT",
        //             "est_funding_rate":-0.00003447,
        //             "est_funding_rate_timestamp":1653633959001,
        //             "last_funding_rate":-0.00002094,
        //             "last_funding_rate_timestamp":1653631200000,
        //             "next_funding_time":1653634800000,
        //            "sum_unitary_funding": 521.367
        //         }
        //
        const symbol = this.safeString(fundingRate, 'symbol');
        market = this.market(symbol);
        const nextFundingTimestamp = this.safeInteger(fundingRate, 'next_funding_time');
        const estFundingRateTimestamp = this.safeInteger(fundingRate, 'est_funding_rate_timestamp');
        const lastFundingRateTimestamp = this.safeInteger(fundingRate, 'last_funding_rate_timestamp');
        const fundingTimeString = this.safeString(fundingRate, 'last_funding_rate_timestamp');
        const nextFundingTimeString = this.safeString(fundingRate, 'next_funding_time');
        const millisecondsInterval = Precise.stringSub(nextFundingTimeString, fundingTimeString);
        return {
            'info': fundingRate,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': estFundingRateTimestamp,
            'datetime': this.iso8601(estFundingRateTimestamp),
            'fundingRate': this.safeNumber(fundingRate, 'est_funding_rate'),
            'fundingTimestamp': nextFundingTimestamp,
            'fundingDatetime': this.iso8601(nextFundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': this.safeNumber(fundingRate, 'last_funding_rate'),
            'previousFundingTimestamp': lastFundingRateTimestamp,
            'previousFundingDatetime': this.iso8601(lastFundingRateTimestamp),
            'interval': this.parseFundingInterval(millisecondsInterval),
        };
    }
    parseFundingInterval(interval) {
        const intervals = {
            '3600000': '1h',
            '14400000': '4h',
            '28800000': '8h',
            '57600000': '16h',
            '86400000': '24h',
        };
        return this.safeString(intervals, interval, interval);
    }
    /**
     * @method
     * @name woofipro#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-predicted-funding-rate-for-one-market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingInterval(symbol, params = {}) {
        return await this.fetchFundingRate(symbol, params);
    }
    /**
     * @method
     * @name woofipro#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-predicted-funding-rate-for-one-market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetPublicFundingRateSymbol(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //         "symbol": "PERP_ETH_USDC",
        //         "est_funding_rate": 123,
        //         "est_funding_rate_timestamp": 1683880020000,
        //         "last_funding_rate": 0.0001,
        //         "last_funding_rate_timestamp": 1683878400000,
        //         "next_funding_time": 1683907200000,
        //         "sum_unitary_funding": 521.367
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseFundingRate(data, market);
    }
    /**
     * @method
     * @name woofipro#fetchFundingRates
     * @description fetch the current funding rate for multiple markets
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-predicted-funding-rates-for-all-markets
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.v1PublicGetPublicFundingRates(params);
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "rows": [{
        //         "symbol": "PERP_ETH_USDC",
        //         "est_funding_rate": 123,
        //         "est_funding_rate_timestamp": 1683880020000,
        //         "last_funding_rate": 0.0001,
        //         "last_funding_rate_timestamp": 1683878400000,
        //         "next_funding_time": 1683907200000,
        //         "sum_unitary_funding": 521.367
        //       }]
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseFundingRates(rows, symbols);
    }
    /**
     * @method
     * @name woofipro#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-funding-rate-history-for-one-market
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchFundingRateHistory', symbol, since, limit, params, 'page', 25);
        }
        let request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        [request, params] = this.handleUntilOption('end_t', request, params, 0.001);
        const response = await this.v1PublicGetPublicFundingRateHistory(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "rows": [{
        //         "symbol": "PERP_ETH_USDC",
        //         "funding_rate": 0.0001,
        //         "funding_rate_timestamp": 1684224000000,
        //         "next_funding_time": 1684252800000
        //       }],
        //       "meta": {
        //         "total": 9,
        //         "records_per_page": 25,
        //         "current_page": 1
        //       }
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const result = this.safeList(data, 'rows', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString(entry, 'symbol');
            const timestamp = this.safeInteger(entry, 'funding_rate_timestamp');
            rates.push({
                'info': entry,
                'symbol': this.safeSymbol(marketId),
                'fundingRate': this.safeNumber(entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    /**
     * @method
     * @name woofipro#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-account-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetClientInfo(params);
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //         "account_id": "<string>",
        //         "email": "test@test.com",
        //         "account_mode": "FUTURES",
        //         "max_leverage": 20,
        //         "taker_fee_rate": 123,
        //         "maker_fee_rate": 123,
        //         "futures_taker_fee_rate": 123,
        //         "futures_maker_fee_rate": 123,
        //         "maintenance_cancel_orders": true,
        //         "imr_factor": {
        //             "PERP_BTC_USDC": 123,
        //             "PERP_ETH_USDC": 123,
        //             "PERP_NEAR_USDC": 123
        //         },
        //         "max_notional": {
        //             "PERP_BTC_USDC": 123,
        //             "PERP_ETH_USDC": 123,
        //             "PERP_NEAR_USDC": 123
        //         }
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const maker = this.safeString(data, 'futures_maker_fee_rate');
        const taker = this.safeString(data, 'futures_taker_fee_rate');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.parseNumber(Precise.stringDiv(maker, '10000')),
                'taker': this.parseNumber(Precise.stringDiv(taker, '10000')),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }
    /**
     * @method
     * @name woofipro#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/orderbook-snapshot
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            limit = Math.min(limit, 1000);
            request['max_level'] = limit;
        }
        const response = await this.v1PrivateGetOrderbookSymbol(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "asks": [{
        //         "price": 10669.4,
        //         "quantity": 1.56263218
        //       }],
        //       "bids": [{
        //         "price": 10669.4,
        //         "quantity": 1.56263218
        //       }],
        //       "timestamp": 123
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const timestamp = this.safeInteger(data, 'timestamp');
        return this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }
    parseOHLCV(ohlcv, market = undefined) {
        return [
            this.safeInteger(ohlcv, 'start_timestamp'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    /**
     * @method
     * @name woofipro#fetchOHLCV
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-kline
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'type': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        const response = await this.v1PrivateGetKline(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "rows": [{
        //         "open": 66166.23,
        //         "close": 66124.56,
        //         "low": 66038.06,
        //         "high": 66176.97,
        //         "volume": 23.45528526,
        //         "amount": 1550436.21725288,
        //         "symbol": "PERP_BTC_USDC",
        //         "type": "1m",
        //         "start_timestamp": 1636388220000,
        //         "end_timestamp": 1636388280000
        //       }]
        //     }
        // }
        //
        const rows = this.safeList(data, 'rows', []);
        return this.parseOHLCVs(rows, market, timeframe, since, limit);
    }
    parseOrder(order, market = undefined) {
        //
        // Possible input functions:
        // * createOrder
        // * createOrders
        // * cancelOrder
        // * fetchOrder
        // * fetchOrders
        // const isFromFetchOrder = ('order_tag' in order); TO_DO
        //
        // stop order after creating it:
        //   {
        //     "orderId": "1578938",
        //     "clientOrderId": "0",
        //     "algoType": "STOP_LOSS",
        //     "quantity": "0.1"
        //   }
        // stop order after fetching it:
        //   {
        //       "algoOrderId": "1578958",
        //       "clientOrderId": "0",
        //       "rootAlgoOrderId": "1578958",
        //       "parentAlgoOrderId": "0",
        //       "symbol": "SPOT_LTC_USDT",
        //       "orderTag": "default",
        //       "algoType": "STOP_LOSS",
        //       "side": "BUY",
        //       "quantity": "0.1",
        //       "isTriggered": false,
        //       "triggerPrice": "100",
        //       "triggerStatus": "USELESS",
        //       "type": "LIMIT",
        //       "rootAlgoStatus": "CANCELLED",
        //       "algoStatus": "CANCELLED",
        //       "triggerPriceType": "MARKET_PRICE",
        //       "price": "75",
        //       "triggerTime": "0",
        //       "totalExecutedQuantity": "0",
        //       "averageExecutedPrice": "0",
        //       "totalFee": "0",
        //       "feeAsset": '',
        //       "reduceOnly": false,
        //       "createdTime": "1686149609.744",
        //       "updatedTime": "1686149903.362"
        //   }
        //
        const timestamp = this.safeIntegerN(order, ['timestamp', 'created_time', 'createdTime']);
        const orderId = this.safeStringN(order, ['order_id', 'orderId', 'algoOrderId']);
        const clientOrderId = this.omitZero(this.safeString2(order, 'client_order_id', 'clientOrderId')); // Somehow, this always returns 0 for limit order
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2(order, 'order_price', 'price');
        const amount = this.safeString2(order, 'order_quantity', 'quantity'); // This is base amount
        const cost = this.safeString2(order, 'order_amount', 'amount'); // This is quote amount
        const orderType = this.safeStringLower2(order, 'order_type', 'type');
        let status = this.safeValue2(order, 'status', 'algoStatus');
        const success = this.safeBool(order, 'success');
        if (success !== undefined) {
            status = (success) ? 'NEW' : 'REJECTED';
        }
        const side = this.safeStringLower(order, 'side');
        const filled = this.omitZero(this.safeValue2(order, 'executed', 'totalExecutedQuantity'));
        const average = this.omitZero(this.safeString2(order, 'average_executed_price', 'averageExecutedPrice'));
        const remaining = Precise.stringSub(cost, filled);
        const fee = this.safeValue2(order, 'total_fee', 'totalFee');
        const feeCurrency = this.safeString2(order, 'fee_asset', 'feeAsset');
        const transactions = this.safeValue(order, 'Transactions');
        const triggerPrice = this.safeNumber(order, 'triggerPrice');
        let takeProfitPrice = undefined;
        let stopLossPrice = undefined;
        const childOrders = this.safeValue(order, 'childOrders');
        if (childOrders !== undefined) {
            const first = this.safeValue(childOrders, 0);
            const innerChildOrders = this.safeValue(first, 'childOrders', []);
            const innerChildOrdersLength = innerChildOrders.length;
            if (innerChildOrdersLength > 0) {
                const takeProfitOrder = this.safeValue(innerChildOrders, 0);
                const stopLossOrder = this.safeValue(innerChildOrders, 1);
                takeProfitPrice = this.safeNumber(takeProfitOrder, 'triggerPrice');
                stopLossPrice = this.safeNumber(stopLossOrder, 'triggerPrice');
            }
        }
        const lastUpdateTimestamp = this.safeInteger2(order, 'updatedTime', 'updated_time');
        return this.safeOrder({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus(status),
            'symbol': symbol,
            'type': this.parseOrderType(orderType),
            'timeInForce': this.parseTimeInForce(orderType),
            'postOnly': undefined,
            'reduceOnly': this.safeBool(order, 'reduce_only'),
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': transactions,
            'fee': {
                'cost': fee,
                'currency': feeCurrency,
            },
            'info': order,
        }, market);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'ioc': 'IOC',
            'fok': 'FOK',
            'post_only': 'PO',
        };
        return this.safeString(timeInForces, timeInForce, undefined);
    }
    parseOrderStatus(status) {
        if (status !== undefined) {
            const statuses = {
                'NEW': 'open',
                'FILLED': 'closed',
                'CANCEL_SENT': 'canceled',
                'CANCEL_ALL_SENT': 'canceled',
                'CANCELLED': 'canceled',
                'PARTIAL_FILLED': 'open',
                'REJECTED': 'rejected',
                'INCOMPLETE': 'open',
                'COMPLETED': 'closed',
            };
            return this.safeString(statuses, status, status);
        }
        return status;
    }
    parseOrderType(type) {
        const types = {
            'LIMIT': 'limit',
            'MARKET': 'market',
            'POST_ONLY': 'limit',
        };
        return this.safeStringLower(types, type, type);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name woofipro#createOrderRequest
         * @description helper function to build the request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} request to be sent to the exchange
         */
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only');
        const orderType = type.toUpperCase();
        const market = this.market(symbol);
        const orderSide = side.toUpperCase();
        const request = {
            'symbol': market['id'],
            'side': orderSide,
        };
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const takeProfit = this.safeValue(params, 'takeProfit');
        const algoType = this.safeString(params, 'algoType');
        const isConditional = triggerPrice !== undefined || stopLoss !== undefined || takeProfit !== undefined || (this.safeValue(params, 'childOrders') !== undefined);
        const isMarket = orderType === 'MARKET';
        const timeInForce = this.safeStringLower(params, 'timeInForce');
        const postOnly = this.isPostOnly(isMarket, undefined, params);
        const orderQtyKey = isConditional ? 'quantity' : 'order_quantity';
        const priceKey = isConditional ? 'price' : 'order_price';
        const typeKey = isConditional ? 'type' : 'order_type';
        request[typeKey] = orderType; // LIMIT/MARKET/IOC/FOK/POST_ONLY/ASK/BID
        if (!isConditional) {
            if (postOnly) {
                request['order_type'] = 'POST_ONLY';
            }
            else if (timeInForce === 'fok') {
                request['order_type'] = 'FOK';
            }
            else if (timeInForce === 'ioc') {
                request['order_type'] = 'IOC';
            }
        }
        if (reduceOnly) {
            request['reduce_only'] = reduceOnly;
        }
        if (price !== undefined) {
            request[priceKey] = this.priceToPrecision(symbol, price);
        }
        if (isMarket && !isConditional) {
            request[orderQtyKey] = this.amountToPrecision(symbol, amount);
        }
        else if (algoType !== 'POSITIONAL_TP_SL') {
            request[orderQtyKey] = this.amountToPrecision(symbol, amount);
        }
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        if (triggerPrice !== undefined) {
            request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
            request['algo_type'] = 'STOP';
        }
        else if ((stopLoss !== undefined) || (takeProfit !== undefined)) {
            request['algo_type'] = 'TP_SL';
            const outterOrder = {
                'symbol': market['id'],
                'reduce_only': false,
                'algo_type': 'POSITIONAL_TP_SL',
                'child_orders': [],
            };
            const childOrders = outterOrder['child_orders'];
            const closeSide = (orderSide === 'BUY') ? 'SELL' : 'BUY';
            if (stopLoss !== undefined) {
                const stopLossPrice = this.safeNumber2(stopLoss, 'triggerPrice', 'price', stopLoss);
                const stopLossOrder = {
                    'side': closeSide,
                    'algo_type': 'TP_SL',
                    'trigger_price': this.priceToPrecision(symbol, stopLossPrice),
                    'type': 'LIMIT',
                    'reduce_only': true,
                };
                childOrders.push(stopLossOrder);
            }
            if (takeProfit !== undefined) {
                const takeProfitPrice = this.safeNumber2(takeProfit, 'triggerPrice', 'price', takeProfit);
                const takeProfitOrder = {
                    'side': closeSide,
                    'algo_type': 'TP_SL',
                    'trigger_price': this.priceToPrecision(symbol, takeProfitPrice),
                    'type': 'LIMIT',
                    'reduce_only': true,
                };
                outterOrder.push(takeProfitOrder);
            }
            request['child_orders'] = [outterOrder];
        }
        params = this.omit(params, ['reduceOnly', 'reduce_only', 'clOrdID', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'stopLoss', 'takeProfit']);
        return this.extend(request, params);
    }
    /**
     * @method
     * @name woofipro#createOrder
     * @description create a trade order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/create-order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/create-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.algoType] 'STOP'or 'TP_SL' or 'POSITIONAL_TP_SL'
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = this.createOrderRequest(symbol, type, side, amount, price, params);
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const takeProfit = this.safeValue(params, 'takeProfit');
        const isConditional = triggerPrice !== undefined || stopLoss !== undefined || takeProfit !== undefined || (this.safeValue(params, 'childOrders') !== undefined);
        let response = undefined;
        if (isConditional) {
            response = await this.v1PrivatePostAlgoOrder(request);
            //
            // {
            //     "success": true,
            //     "timestamp": 1702989203989,
            //     "data": {
            //       "order_id": 13,
            //       "client_order_id": "testclientid",
            //       "algo_type": "STOP",
            //       "quantity": 100.12
            //     }
            // }
            //
        }
        else {
            response = await this.v1PrivatePostOrder(request);
            //
            // {
            //     "success": true,
            //     "timestamp": 1702989203989,
            //     "data": {
            //       "order_id": 13,
            //       "client_order_id": "testclientid",
            //       "order_type": "LIMIT",
            //       "order_price": 100.12,
            //       "order_quantity": 0.987654,
            //       "order_amount": 0.8,
            //       "error_message": "none"
            //     }
            // }
            //
        }
        const data = this.safeDict(response, 'data');
        data['timestamp'] = this.safeInteger(response, 'timestamp');
        const order = this.parseOrder(data, market);
        order['type'] = type;
        return order;
    }
    /**
     * @method
     * @name woofipro#createOrders
     * @description *contract only* create a list of trade orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/batch-create-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const triggerPrice = this.safeString2(orderParams, 'triggerPrice', 'stopPrice');
            const stopLoss = this.safeValue(orderParams, 'stopLoss');
            const takeProfit = this.safeValue(orderParams, 'takeProfit');
            const isConditional = triggerPrice !== undefined || stopLoss !== undefined || takeProfit !== undefined || (this.safeValue(orderParams, 'childOrders') !== undefined);
            if (isConditional) {
                throw new NotSupported(this.id + ' createOrders() only support non-stop order');
            }
            const orderRequest = this.createOrderRequest(marketId, type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        const request = {
            'orders': ordersRequests,
        };
        const response = await this.v1PrivatePostBatchOrder(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "timestamp": 1702989203989,
        //         "data": {
        //             "rows": [{
        //                 "order_id": 13,
        //                 "client_order_id": "testclientid",
        //                 "order_type": "LIMIT",
        //                 "order_price": 100.12,
        //                 "order_quantity": 0.987654,
        //                 "order_amount": 0.8,
        //                 "error_message": "none"
        //             }]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseOrders(rows);
    }
    /**
     * @method
     * @name woofipro#editOrder
     * @description edit a trade order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/edit-order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/edit-algo-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'order_id': id,
        };
        const triggerPrice = this.safeStringN(params, ['triggerPrice', 'stopPrice', 'takeProfitPrice', 'stopLossPrice']);
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
        }
        const isConditional = (triggerPrice !== undefined) || (this.safeValue(params, 'childOrders') !== undefined);
        const orderQtyKey = isConditional ? 'quantity' : 'order_quantity';
        const priceKey = isConditional ? 'price' : 'order_price';
        if (price !== undefined) {
            request[priceKey] = this.priceToPrecision(symbol, price);
        }
        if (amount !== undefined) {
            request[orderQtyKey] = this.amountToPrecision(symbol, amount);
        }
        params = this.omit(params, ['stopPrice', 'triggerPrice', 'takeProfitPrice', 'stopLossPrice', 'trailingTriggerPrice', 'trailingAmount', 'trailingPercent']);
        let response = undefined;
        if (isConditional) {
            response = await this.v1PrivatePutAlgoOrder(this.extend(request, params));
        }
        else {
            request['symbol'] = market['id'];
            request['side'] = side.toUpperCase();
            const orderType = type.toUpperCase();
            const timeInForce = this.safeStringLower(params, 'timeInForce');
            const isMarket = orderType === 'MARKET';
            const postOnly = this.isPostOnly(isMarket, undefined, params);
            if (postOnly) {
                request['order_type'] = 'POST_ONLY';
            }
            else if (timeInForce === 'fok') {
                request['order_type'] = 'FOK';
            }
            else if (timeInForce === 'ioc') {
                request['order_type'] = 'IOC';
            }
            else {
                request['order_type'] = orderType;
            }
            const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
            params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce']);
            if (clientOrderId !== undefined) {
                request['client_order_id'] = clientOrderId;
            }
            // request['side'] = side.toUpperCase ();
            // request['symbol'] = market['id'];
            response = await this.v1PrivatePutOrder(this.extend(request, params));
        }
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "status": "EDIT_SENT"
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        data['timestamp'] = this.safeInteger(response, 'timestamp');
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name woofipro#cancelOrder
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-order-by-client_order_id
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-algo-order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-algo-order-by-client_order_id
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        params = this.omit(params, ['stop', 'trigger']);
        if (!trigger && (symbol === undefined)) {
            throw new ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'symbol': market['id'],
        };
        const clientOrderIdUnified = this.safeString2(params, 'clOrdID', 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString(params, 'client_order_id', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        let response = undefined;
        if (trigger) {
            if (isByClientOrder) {
                request['client_order_id'] = clientOrderIdExchangeSpecific;
                params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
                response = await this.v1PrivateDeleteAlgoClientOrder(this.extend(request, params));
            }
            else {
                request['order_id'] = id;
                response = await this.v1PrivateDeleteAlgoOrder(this.extend(request, params));
            }
        }
        else {
            if (isByClientOrder) {
                request['client_order_id'] = clientOrderIdExchangeSpecific;
                params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
                response = await this.v1PrivateDeleteClientOrder(this.extend(request, params));
            }
            else {
                request['order_id'] = id;
                response = await this.v1PrivateDeleteOrder(this.extend(request, params));
            }
        }
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "status": "CANCEL_SENT"
        //     }
        // }
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "status": "CANCEL_SENT"
        // }
        //
        const extendParams = { 'symbol': symbol };
        if (isByClientOrder) {
            extendParams['client_order_id'] = clientOrderIdExchangeSpecific;
        }
        else {
            extendParams['id'] = id;
        }
        if (trigger) {
            return this.extend(this.parseOrder(response), extendParams);
        }
        const data = this.safeDict(response, 'data', {});
        return this.extend(this.parseOrder(data), extendParams);
    }
    /**
     * @method
     * @name woofipro#cancelOrders
     * @description cancel multiple orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/batch-cancel-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/batch-cancel-orders-by-client_order_id
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.client_order_ids] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const clientOrderIds = this.safeListN(params, ['clOrdIDs', 'clientOrderIds', 'client_order_ids']);
        params = this.omit(params, ['clOrdIDs', 'clientOrderIds', 'client_order_ids']);
        const request = {};
        let response = undefined;
        if (clientOrderIds) {
            request['client_order_ids'] = clientOrderIds.join(',');
            response = await this.v1PrivateDeleteClientBatchOrder(this.extend(request, params));
        }
        else {
            request['order_ids'] = ids.join(',');
            response = await this.v1PrivateDeleteBatchOrder(this.extend(request, params));
        }
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //         "status": "CANCEL_ALL_SENT"
        //     }
        // }
        //
        return [this.safeOrder({
                'info': response,
            })];
    }
    /**
     * @method
     * @name woofipro#cancelAllOrders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-all-pending-algo-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-orders-in-bulk
     * @description cancel all open orders in a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        const request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let response = undefined;
        if (trigger) {
            response = await this.v1PrivateDeleteAlgoOrders(this.extend(request, params));
        }
        else {
            response = await this.v1PrivateDeleteOrders(this.extend(request, params));
        }
        // trigger
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //      "status": "CANCEL_ALL_SENT"
        // }
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "status": "CANCEL_ALL_SENT"
        //     }
        // }
        //
        return [
            {
                'info': response,
            },
        ];
    }
    /**
     * @method
     * @name woofipro#fetchOrder
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-order-by-order_id
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-order-by-client_order_id
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-order-by-order_id
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-order-by-client_order_id
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        const request = {};
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        params = this.omit(params, ['stop', 'trigger', 'clOrdID', 'clientOrderId', 'client_order_id']);
        let response = undefined;
        if (trigger) {
            if (clientOrderId) {
                request['client_order_id'] = clientOrderId;
                response = await this.v1PrivateGetAlgoClientOrderClientOrderId(this.extend(request, params));
            }
            else {
                request['oid'] = id;
                response = await this.v1PrivateGetAlgoOrderOid(this.extend(request, params));
            }
        }
        else {
            if (clientOrderId) {
                request['client_order_id'] = clientOrderId;
                response = await this.v1PrivateGetClientOrderClientOrderId(this.extend(request, params));
            }
            else {
                request['oid'] = id;
                response = await this.v1PrivateGetOrderOid(this.extend(request, params));
            }
        }
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //         "order_id": 78151,
        //         "user_id": 12345,
        //         "price": 0.67772,
        //         "type": "LIMIT",
        //         "quantity": 20,
        //         "amount": 10,
        //         "executed_quantity": 20,
        //         "total_executed_quantity": 20,
        //         "visible_quantity": 1,
        //         "symbol": "PERP_WOO_USDC",
        //         "side": "BUY",
        //         "status": "FILLED",
        //         "total_fee": 0.5,
        //         "fee_asset": "WOO",
        //         "client_order_id": 1,
        //         "average_executed_price": 0.67772,
        //         "created_time": 1653563963000,
        //         "updated_time": 1653564213000,
        //         "realized_pnl": 123
        //     }
        // }
        //
        const orders = this.safeDict(response, 'data', response);
        return this.parseOrder(orders, market);
    }
    /**
     * @method
     * @name woofipro#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {boolean} [params.is_triggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @param {int} params.until timestamp in ms of the latest order to fetch
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        const isTrigger = this.safeBool2(params, 'stop', 'trigger', false);
        const maxLimit = (isTrigger) ? 100 : 500;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchOrders', symbol, since, limit, params, 'page', maxLimit);
        }
        let request = {};
        let market = undefined;
        params = this.omit(params, ['stop', 'trigger']);
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        else {
            request['size'] = maxLimit;
        }
        if (isTrigger) {
            request['algo_type'] = 'STOP';
        }
        [request, params] = this.handleUntilOption('end_t', request, params);
        let response = undefined;
        if (isTrigger) {
            response = await this.v1PrivateGetAlgoOrders(this.extend(request, params));
        }
        else {
            response = await this.v1PrivateGetOrders(this.extend(request, params));
        }
        //
        //     {
        //         "success": true,
        //         "timestamp": 1702989203989,
        //         "data": {
        //             "meta": {
        //                 "total": 9,
        //                 "records_per_page": 25,
        //                 "current_page": 1
        //             },
        //             "rows": [{
        //                 "order_id": 78151,
        //                 "user_id": 12345,
        //                 "price": 0.67772,
        //                 "type": "LIMIT",
        //                 "quantity": 20,
        //                 "amount": 10,
        //                 "executed_quantity": 20,
        //                 "total_executed_quantity": 20,
        //                 "visible_quantity": 1,
        //                 "symbol": "PERP_WOO_USDC",
        //                 "side": "BUY",
        //                 "status": "FILLED",
        //                 "total_fee": 0.5,
        //                 "fee_asset": "WOO",
        //                 "client_order_id": 1,
        //                 "average_executed_price": 0.67772,
        //                 "created_time": 1653563963000,
        //                 "updated_time": 1653564213000,
        //                 "realized_pnl": 123
        //             }]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', response);
        const orders = this.safeList(data, 'rows');
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name woofipro#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {boolean} [params.is_triggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {int} params.until timestamp in ms of the latest order to fetch
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const extendedParams = this.extend(params, { 'status': 'INCOMPLETE' });
        return await this.fetchOrders(symbol, since, limit, extendedParams);
    }
    /**
     * @method
     * @name woofipro#fetchClosedOrders
     * @description fetches information on multiple orders made by the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {boolean} [params.is_triggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {int} params.until timestamp in ms of the latest order to fetch
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const extendedParams = this.extend(params, { 'status': 'COMPLETED' });
        return await this.fetchOrders(symbol, since, limit, extendedParams);
    }
    /**
     * @method
     * @name woofipro#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-all-trades-of-specific-order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'oid': id,
        };
        const response = await this.v1PrivateGetOrderOidTrades(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "rows": [{
        //         "id": 2,
        //         "symbol": "PERP_BTC_USDC",
        //         "fee": 0.0001,
        //         "fee_asset": "USDC",
        //         "side": "BUY",
        //         "order_id": 1,
        //         "executed_price": 123,
        //         "executed_quantity": 0.05,
        //         "executed_timestamp": 1567382401000,
        //         "is_maker": 1,
        //         "realized_pnl": 123
        //       }]
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const trades = this.safeList(data, 'rows', []);
        return this.parseTrades(trades, market, since, limit, params);
    }
    /**
     * @method
     * @name woofipro#fetchMyTrades
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-trades
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch trades with pagination
     * @param {int} params.until timestamp in ms of the latest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchMyTrades', symbol, since, limit, params, 'page', 500);
        }
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        else {
            request['size'] = 500;
        }
        [request, params] = this.handleUntilOption('end_t', request, params);
        const response = await this.v1PrivateGetTrades(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "meta": {
        //         "total": 9,
        //         "records_per_page": 25,
        //         "current_page": 1
        //       },
        //       "rows": [{
        //         "id": 2,
        //         "symbol": "PERP_BTC_USDC",
        //         "fee": 0.0001,
        //         "fee_asset": "USDC",
        //         "side": "BUY",
        //         "order_id": 1,
        //         "executed_price": 123,
        //         "executed_quantity": 0.05,
        //         "executed_timestamp": 1567382401000,
        //         "is_maker": 1,
        //         "realized_pnl": 123
        //       }]
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const trades = this.safeList(data, 'rows', []);
        return this.parseTrades(trades, market, since, limit, params);
    }
    parseBalance(response) {
        const result = {
            'info': response,
        };
        const balances = this.safeList(response, 'holding', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode(this.safeString(balance, 'token'));
            const account = this.account();
            account['total'] = this.safeString(balance, 'holding');
            account['frozen'] = this.safeString(balance, 'frozen');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name woofipro#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-current-holding
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetClientHolding(params);
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "holding": [{
        //         "updated_time": 1580794149000,
        //         "token": "BTC",
        //         "holding": -28.000752,
        //         "frozen": 123,
        //         "pending_short": -2000
        //       }]
        //     }
        // }
        //
        const data = this.safeDict(response, 'data');
        return this.parseBalance(data);
    }
    async getAssetHistoryRows(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['balance_token'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const transactionType = this.safeString(params, 'type');
        params = this.omit(params, 'type');
        if (transactionType !== undefined) {
            request['type'] = transactionType;
        }
        const response = await this.v1PrivateGetAssetHistory(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //       "meta": {
        //         "total": 9,
        //         "records_per_page": 25,
        //         "current_page": 1
        //       },
        //       "rows": [{
        //         "id": "230707030600002",
        //         "tx_id": "0x4b0714c63cc7abae72bf68e84e25860b88ca651b7d27dad1e32bf4c027fa5326",
        //         "side": "WITHDRAW",
        //         "token": "USDC",
        //         "amount": 555,
        //         "fee": 123,
        //         "trans_status": "FAILED",
        //         "created_time": 1688699193034,
        //         "updated_time": 1688699193096,
        //         "chain_id": "986532"
        //       }]
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        return [currency, this.safeList(data, 'rows', [])];
    }
    parseLedgerEntry(item, currency = undefined) {
        const currencyId = this.safeString(item, 'token');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const amount = this.safeNumber(item, 'amount');
        const side = this.safeString(item, 'token_side');
        const direction = (side === 'DEPOSIT') ? 'in' : 'out';
        const timestamp = this.safeInteger(item, 'created_time');
        const fee = this.parseTokenAndFeeTemp(item, 'fee_token', 'fee_amount');
        return this.safeLedgerEntry({
            'id': this.safeString(item, 'id'),
            'currency': code,
            'account': this.safeString(item, 'account'),
            'referenceAccount': undefined,
            'referenceId': this.safeString(item, 'tx_id'),
            'status': this.parseTransactionStatus(this.safeString(item, 'status')),
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'fee': fee,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'type': this.parseLedgerEntryType(this.safeString(item, 'type')),
            'info': item,
        }, currency);
    }
    parseLedgerEntryType(type) {
        const types = {
            'BALANCE': 'transaction',
            'COLLATERAL': 'transfer', // Funds moved between portfolios
        };
        return this.safeString(types, type, type);
    }
    /**
     * @method
     * @name woofipro#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-asset-history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        const currencyRows = await this.getAssetHistoryRows(code, since, limit, params);
        const currency = this.safeValue(currencyRows, 0);
        const rows = this.safeList(currencyRows, 1);
        return this.parseLedger(rows, currency, since, limit, params);
    }
    parseTransaction(transaction, currency = undefined) {
        // example in fetchLedger
        const code = this.safeString(transaction, 'token');
        let movementDirection = this.safeStringLower(transaction, 'token_side');
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        const fee = this.parseTokenAndFeeTemp(transaction, 'fee_token', 'fee_amount');
        const addressTo = this.safeString(transaction, 'target_address');
        const addressFrom = this.safeString(transaction, 'source_address');
        const timestamp = this.safeInteger(transaction, 'created_time');
        return {
            'info': transaction,
            'id': this.safeString2(transaction, 'id', 'withdraw_id'),
            'txid': this.safeString(transaction, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': this.safeString(transaction, 'extra'),
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': movementDirection,
            'amount': this.safeNumber(transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus(this.safeString(transaction, 'status')),
            'updated': this.safeInteger(transaction, 'updated_time'),
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
            'network': undefined,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'NEW': 'pending',
            'CONFIRMING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETED': 'ok',
            'CANCELED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name woofipro#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-asset-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'side': 'DEPOSIT',
        };
        return await this.fetchDepositsWithdrawals(code, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name woofipro#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-asset-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'side': 'WITHDRAW',
        };
        return await this.fetchDepositsWithdrawals(code, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name woofipro#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-asset-history
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        const currencyRows = await this.getAssetHistoryRows(code, since, limit, this.extend(request, params));
        const currency = this.safeValue(currencyRows, 0);
        const rows = this.safeList(currencyRows, 1);
        //
        //     {
        //         "rows":[],
        //         "meta":{
        //             "total":0,
        //             "records_per_page":25,
        //             "current_page":1
        //         },
        //         "success":true
        //     }
        //
        return this.parseTransactions(rows, currency, since, limit, params);
    }
    async getWithdrawNonce(params = {}) {
        const response = await this.v1PrivateGetWithdrawNonce(params);
        //
        //     {
        //         "success": true,
        //         "timestamp": 1702989203989,
        //         "data": {
        //             "withdraw_nonce": 1
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.safeNumber(data, 'withdraw_nonce');
    }
    hashMessage(message) {
        return '0x' + this.hash(message, keccak, 'hex');
    }
    signHash(hash, privateKey) {
        const signature = ecdsa(hash.slice(-64), privateKey.slice(-64), secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = this.intToBase16(this.sum(27, signature['v']));
        return '0x' + r.padStart(64, '0') + s.padStart(64, '0') + v;
    }
    signMessage(message, privateKey) {
        return this.signHash(this.hashMessage(message), privateKey.slice(-64));
    }
    /**
     * @method
     * @name woofipro#withdraw
     * @description make a withdrawal
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/create-withdraw-request
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets();
        this.checkAddress(address);
        if (code !== undefined) {
            code = code.toUpperCase();
            if (code !== 'USDC') {
                throw new NotSupported(this.id + ' withdraw() only support USDC');
            }
        }
        const currency = this.currency(code);
        const verifyingContractAddress = this.safeString(this.options, 'verifyingContractAddress');
        const chainId = this.safeString(params, 'chainId');
        const currencyNetworks = this.safeDict(currency, 'networks', {});
        const coinNetwork = this.safeDict(currencyNetworks, chainId, {});
        const coinNetworkId = this.safeNumber(coinNetwork, 'id');
        if (coinNetworkId === undefined) {
            throw new BadRequest(this.id + ' withdraw() require chainId parameter');
        }
        const withdrawNonce = await this.getWithdrawNonce(params);
        const nonce = this.nonce();
        const domain = {
            'chainId': chainId,
            'name': 'Orderly',
            'verifyingContract': verifyingContractAddress,
            'version': '1',
        };
        const messageTypes = {
            'Withdraw': [
                { 'name': 'brokerId', 'type': 'string' },
                { 'name': 'chainId', 'type': 'uint256' },
                { 'name': 'receiver', 'type': 'address' },
                { 'name': 'token', 'type': 'string' },
                { 'name': 'amount', 'type': 'uint256' },
                { 'name': 'withdrawNonce', 'type': 'uint64' },
                { 'name': 'timestamp', 'type': 'uint64' },
            ],
        };
        const withdrawRequest = {
            'brokerId': this.safeString(this.options, 'keyBrokerId', 'woofi_pro'),
            'chainId': this.parseToInt(chainId),
            'receiver': address,
            'token': code,
            'amount': amount.toString(),
            'withdrawNonce': withdrawNonce,
            'timestamp': nonce,
        };
        const msg = this.ethEncodeStructuredData(domain, messageTypes, withdrawRequest);
        const signature = this.signMessage(msg, this.privateKey);
        const request = {
            'signature': signature,
            'userAddress': address,
            'verifyingContract': verifyingContractAddress,
            'message': withdrawRequest,
        };
        params = this.omit(params, 'chainId');
        const response = await this.v1PrivatePostWithdrawRequest(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "timestamp": 1702989203989,
        //         "data": {
        //             "withdraw_id": 123
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTransaction(data, currency);
    }
    parseLeverage(leverage, market = undefined) {
        const leverageValue = this.safeInteger(leverage, 'max_leverage');
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': undefined,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    /**
     * @method
     * @name woofipro#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-account-information
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const response = await this.v1PrivateGetClientInfo(params);
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //         "account_id": "<string>",
        //         "email": "test@test.com",
        //         "account_mode": "FUTURES",
        //         "max_leverage": 20,
        //         "taker_fee_rate": 123,
        //         "maker_fee_rate": 123,
        //         "futures_taker_fee_rate": 123,
        //         "futures_maker_fee_rate": 123,
        //         "maintenance_cancel_orders": true,
        //         "imr_factor": {
        //             "PERP_BTC_USDC": 123,
        //             "PERP_ETH_USDC": 123,
        //             "PERP_NEAR_USDC": 123
        //         },
        //         "max_notional": {
        //             "PERP_BTC_USDC": 123,
        //             "PERP_ETH_USDC": 123,
        //             "PERP_NEAR_USDC": 123
        //         }
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseLeverage(data, market);
    }
    /**
     * @method
     * @name woofipro#setLeverage
     * @description set the level of leverage for a market
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/update-leverage-setting
     * @param {int} [leverage] the rate of leverage
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        await this.loadMarkets();
        if ((leverage < 1) || (leverage > 50)) {
            throw new BadRequest(this.id + ' leverage should be between 1 and 50');
        }
        const request = {
            'leverage': leverage,
        };
        return await this.v1PrivatePostClientLeverage(this.extend(request, params));
    }
    parsePosition(position, market = undefined) {
        //
        // {
        //     "IMR_withdraw_orders": 0.1,
        //     "MMR_with_orders": 0.05,
        //     "average_open_price": 27908.14386047,
        //     "cost_position": -139329.358492,
        //     "est_liq_price": 117335.92899428,
        //     "fee_24_h": 123,
        //     "imr": 0.1,
        //     "last_sum_unitary_funding": 70.38,
        //     "mark_price": 27794.9,
        //     "mmr": 0.05,
        //     "pending_long_qty": 123,
        //     "pending_short_qty": 123,
        //     "pnl_24_h": 123,
        //     "position_qty": -5,
        //     "settle_price": 27865.8716984,
        //     "symbol": "PERP_BTC_USDC",
        //     "timestamp": 1685429350571,
        //     "unsettled_pnl": 354.858492
        // }
        //
        const contract = this.safeString(position, 'symbol');
        market = this.safeMarket(contract, market);
        let size = this.safeString(position, 'position_qty');
        let side = undefined;
        if (Precise.stringGt(size, '0')) {
            side = 'long';
        }
        else {
            side = 'short';
        }
        const contractSize = this.safeString(market, 'contractSize');
        const markPrice = this.safeString(position, 'mark_price');
        const timestamp = this.safeInteger(position, 'timestamp');
        const entryPrice = this.safeString(position, 'average_open_price');
        const unrealisedPnl = this.safeString(position, 'unsettled_pnl');
        size = Precise.stringAbs(size);
        const notional = Precise.stringMul(size, markPrice);
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber(entryPrice),
            'notional': this.parseNumber(notional),
            'leverage': undefined,
            'unrealizedPnl': this.parseNumber(unrealisedPnl),
            'contracts': this.parseNumber(size),
            'contractSize': this.parseNumber(contractSize),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber(position, 'est_liq_price'),
            'markPrice': this.parseNumber(markPrice),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': 'cross',
            'marginType': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name woofipro#fetchPosition
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-one-position-info
     * @description fetch data on an open position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PrivateGetPositionSymbol(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //         "IMR_withdraw_orders": 0.1,
        //         "MMR_with_orders": 0.05,
        //         "average_open_price": 27908.14386047,
        //         "cost_position": -139329.358492,
        //         "est_liq_price": 117335.92899428,
        //         "fee_24_h": 123,
        //         "imr": 0.1,
        //         "last_sum_unitary_funding": 70.38,
        //         "mark_price": 27794.9,
        //         "mmr": 0.05,
        //         "pending_long_qty": 123,
        //         "pending_short_qty": 123,
        //         "pnl_24_h": 123,
        //         "position_qty": -5,
        //         "settle_price": 27865.8716984,
        //         "symbol": "PERP_BTC_USDC",
        //         "timestamp": 1685429350571,
        //         "unsettled_pnl": 354.858492
        //     }
        // }
        //
        const data = this.safeDict(response, 'data');
        return this.parsePosition(data, market);
    }
    /**
     * @method
     * @name woofipro#fetchPositions
     * @description fetch all open positions
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-all-positions-info
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetPositions(params);
        //
        // {
        //     "success": true,
        //     "timestamp": 1702989203989,
        //     "data": {
        //         "current_margin_ratio_with_orders": 1.2385,
        //         "free_collateral": 450315.09115,
        //         "initial_margin_ratio": 0.1,
        //         "initial_margin_ratio_with_orders": 0.1,
        //         "maintenance_margin_ratio": 0.05,
        //         "maintenance_margin_ratio_with_orders": 0.05,
        //         "margin_ratio": 1.2385,
        //         "open_margin_ratio": 1.2102,
        //         "total_collateral_value": 489865.71329,
        //         "total_pnl_24_h": 123,
        //         "rows": [{
        //             "IMR_withdraw_orders": 0.1,
        //             "MMR_with_orders": 0.05,
        //             "average_open_price": 27908.14386047,
        //             "cost_position": -139329.358492,
        //             "est_liq_price": 117335.92899428,
        //             "fee_24_h": 123,
        //             "imr": 0.1,
        //             "last_sum_unitary_funding": 70.38,
        //             "mark_price": 27794.9,
        //             "mmr": 0.05,
        //             "pending_long_qty": 123,
        //             "pending_short_qty": 123,
        //             "pnl_24_h": 123,
        //             "position_qty": -5,
        //             "settle_price": 27865.8716984,
        //             "symbol": "PERP_BTC_USDC",
        //             "timestamp": 1685429350571,
        //             "unsettled_pnl": 354.858492
        //         }]
        //     }
        // }
        //
        const result = this.safeDict(response, 'data', {});
        const positions = this.safeList(result, 'rows', []);
        return this.parsePositions(positions, symbols);
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = section[0];
        const access = section[1];
        const pathWithParams = this.implodeParams(path, params);
        let url = this.implodeHostname(this.urls['api'][access]);
        url += '/' + version + '/';
        params = this.omit(params, this.extractParams(path));
        params = this.keysort(params);
        if (access === 'public') {
            url += pathWithParams;
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        else {
            this.checkRequiredCredentials();
            if ((method === 'POST' || method === 'PUT') && (path === 'algo/order' || path === 'order' || path === 'batch-order')) {
                const isSandboxMode = this.safeBool(this.options, 'sandboxMode', false);
                if (!isSandboxMode) {
                    const brokerId = this.safeString(this.options, 'brokerId', 'CCXT');
                    if (path === 'batch-order') {
                        const ordersList = this.safeList(params, 'orders', []);
                        for (let i = 0; i < ordersList.length; i++) {
                            params['orders'][i]['order_tag'] = brokerId;
                        }
                    }
                    else {
                        params['order_tag'] = brokerId;
                    }
                }
                params = this.keysort(params);
            }
            let auth = '';
            const ts = this.nonce().toString();
            url += pathWithParams;
            let apiKey = this.apiKey;
            if (apiKey.indexOf('ed25519:') < 0) {
                apiKey = 'ed25519:' + apiKey;
            }
            headers = {
                'orderly-account-id': this.accountId,
                'orderly-key': apiKey,
                'orderly-timestamp': ts,
            };
            auth = ts + method + '/' + version + '/' + pathWithParams;
            if (method === 'POST' || method === 'PUT') {
                body = this.json(params);
                auth += body;
                headers['content-type'] = 'application/json';
            }
            else {
                if (Object.keys(params).length) {
                    url += '?' + this.urlencode(params);
                    auth += '?' + this.rawencode(params);
                }
                headers['content-type'] = 'application/x-www-form-urlencoded';
                if (method === 'DELETE') {
                    body = '';
                }
            }
            let secret = this.secret;
            if (secret.indexOf('ed25519:') >= 0) {
                const parts = secret.split('ed25519:');
                secret = parts[1];
            }
            const signature = eddsa(this.encode(auth), this.base58ToBinary(secret), ed25519);
            headers['orderly-signature'] = this.urlencodeBase64(this.base64ToBinary(signature));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     400 Bad Request {"success":false,"code":-1012,"message":"Amount is required for buy market orders when margin disabled."}
        //                     {"code":"-1011","message":"The system is under maintenance.","success":false}
        //
        const success = this.safeBool(response, 'success');
        const errorCode = this.safeString(response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json(response);
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError(feedback);
        }
        return undefined;
    }
}
