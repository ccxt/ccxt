'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var grvt$1 = require('./abstract/grvt.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var sha3 = require('./static_dependencies/noble-hashes/sha3.js');
var secp256k1 = require('./static_dependencies/noble-curves/secp256k1.js');
var crypto = require('./base/functions/crypto.js');
var number = require('./base/functions/number.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class grvt
 * @augments Exchange
 */
class grvt extends grvt$1["default"] {
    describe() {
        const rlOthers = 40;
        const rlOrders = 20;
        return this.deepExtend(super.describe(), {
            'id': 'grvt',
            'name': 'GRVT',
            'countries': ['SG'],
            'rateLimit': 10,
            'certified': false,
            'version': 'v1',
            'dex': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRateHistory': true,
                'fetchLeverages': true,
                'fetchMarginModes': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'setLeverage': true,
                'signIn': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'CI_1_M',
                '3m': 'CI_3_M',
                '5m': 'CI_5_M',
                '15m': 'CI_15_M',
                '30m': 'CI_30_M',
                '1h': 'CI_1_H',
                '2h': 'CI_2_H',
                '4h': 'CI_4_H',
                '6h': 'CI_6_H',
                '8h': 'CI_8_H',
                '12h': 'CI_12_H',
                '1d': 'CI_1_D',
                '3d': 'CI_3_D',
                '5d': 'CI_5_D',
                '1w': 'CI_1_W',
                '2w': 'CI_2_W',
                '3w': 'CI_3_W',
                '4w': 'CI_4_W',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/7a2e8108-29f6-45d1-822d-48eb1c8cbbe6',
                'api': {
                    'privateEdge': 'https://edge.grvt.io/',
                    'privateTrading': 'https://trades.grvt.io/',
                    'publicMarket': 'https://market-data.grvt.io/',
                },
                'test': {
                    'privateEdge': 'https://edge.testnet.grvt.io/',
                    'privateTrading': 'https://trades.testnet.grvt.io/',
                    'publicMarket': 'https://market-data.testnet.grvt.io/',
                },
                'www': 'https://grvt.io',
                'referral': 'https://grvt.io/?ref=WBLS9D1',
                'doc': [
                    'https://api-docs.grvt.io/',
                ],
                'fees': 'https://help.grvt.io/en/articles/9614699-how-does-grvt-s-fee-model-work',
            },
            'api': {
                // RL : https://help.grvt.io/en/articles/9636566-what-are-the-rate-limitations-on-grvt
                'privateEdge': {
                    'post': {
                        'auth/api_key/login': 100,
                        'auth/wallet/login': 100,
                    },
                },
                'publicMarket': {
                    'post': {
                        'full/v1/instrument': 4,
                        'full/v1/all_instruments': 4,
                        'full/v1/instruments': 4,
                        'full/v1/currency': 12,
                        'full/v1/margin_rules': 12,
                        'full/v1/mini': 4,
                        'full/v1/ticker': 4,
                        'full/v1/book': 12,
                        'full/v1/trade': 12,
                        'full/v1/trade_history': 12,
                        'full/v1/kline': 12,
                        'full/v1/funding': 12,
                    },
                },
                'privateTrading': {
                    'post': {
                        'full/v1/create_order': 5,
                        'full/v1/cancel_order': 5,
                        'full/v1/cancel_on_disconnect': 100,
                        'full/v1/cancel_all_orders': 50,
                        'full/v1/order': rlOrders,
                        'full/v1/order_history': rlOrders,
                        'full/v1/open_orders': rlOrders,
                        'full/v1/fill_history': rlOrders,
                        'full/v1/positions': rlOrders,
                        'full/v1/funding_payment_history': rlOthers,
                        'full/v1/get_sub_accounts': rlOthers,
                        'full/v1/account_summary': rlOthers,
                        'full/v1/account_history': rlOthers,
                        'full/v1/aggregated_account_summary': rlOthers,
                        'full/v1/funding_account_summary': rlOthers,
                        'full/v1/transfer': 100,
                        'full/v1/deposit_history': 100,
                        'full/v1/transfer_history': 100,
                        'full/v1/withdrawal': 100,
                        'full/v1/withdrawal_history': 100,
                        'full/v1/add_position_margin': rlOthers,
                        'full/v1/get_position_margin_limits': rlOthers,
                        'full/v1/set_position_config': rlOthers,
                        'full/v1/set_initial_leverage': rlOthers,
                        'full/v1/get_all_initial_leverage': rlOthers,
                        'full/v1/set_derisk_mm_ratio': rlOthers,
                        'full/v1/vault_burn_tokens': rlOthers,
                        'full/v1/vault_invest': rlOthers,
                        'full/v1/vault_investor_summary': rlOthers,
                        'full/v1/vault_redeem': rlOthers,
                        'full/v1/vault_redeem_cancel': rlOthers,
                        'full/v1/vault_view_redemption_queue': rlOthers,
                        'full/v1/vault_manager_investor_history': rlOthers,
                        'full/v1/authorize_builder': rlOthers,
                        'full/v1/get_authorized_builders': rlOthers,
                        'full/v1/builder_fill_history': rlOthers,
                    },
                },
            },
            // exchange-specific options
            'options': {
                'accountId': undefined,
                // https://api.rhino.fi/bridge/configs
                'networks': {
                    'ARBONE': '42161',
                    'AVAXC': '43114',
                    'BASE': '8453',
                    'BSC': '56',
                    'ETH': '1',
                    'ERC20': '1',
                    'OP': '10',
                    'SOL': '900',
                    'TRX': '728126428',
                    'ZKSYNCERA': '324',
                    'KAIA': '8217',
                },
                'networksById': {
                    '1': 'ERC20',
                },
                'builderFee': true,
                'builder': '0x21d2a053495994b1132a38cd1171acec40c6741e',
                'builderRate': 0.01,
            },
            'precisionMode': number.TICK_SIZE,
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': true,
                            'median': true, // mid
                        },
                        'triggerDirection': true,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 1000,
                        'untilDays': 1000,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': undefined,
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'requiredCredentials': {
                'privateKey': true,
                'apiKey': false,
                'secret': false,
            },
            'quoteJsonNumbers': false,
            'exceptions': {
                'exact': {
                    '1000': errors.AuthenticationError,
                    '1001': errors.PermissionDenied,
                    '1002': errors.OperationFailed,
                    '1003': errors.BadRequest,
                    '1004': errors.OperationRejected,
                    '1005': errors.OperationFailed,
                    '1006': errors.RateLimitExceeded,
                    '1008': errors.PermissionDenied,
                    '1009': errors.OperationRejected,
                    '1012': errors.BadRequest,
                    '1400': errors.PermissionDenied,
                    '2000': errors.PermissionDenied,
                    '2001': errors.InvalidNonce,
                    '2002': errors.BadRequest,
                    '2003': errors.PermissionDenied,
                    '2004': errors.InvalidNonce,
                    '2005': errors.BadRequest,
                    '2006': errors.BadRequest,
                    '2007': errors.BadRequest,
                    '2008': errors.BadRequest,
                    '2010': errors.InvalidOrder,
                    '2011': errors.InvalidOrder,
                    '2012': errors.InvalidOrder,
                    '2020': errors.InvalidOrder,
                    '2021': errors.InvalidOrder,
                    '2030': errors.InvalidOrder,
                    '2031': errors.InvalidOrder,
                    '2032': errors.InvalidOrder,
                    '2040': errors.InvalidOrder,
                    '2041': errors.InvalidOrder,
                    '2042': errors.InvalidOrder,
                    '2050': errors.InvalidOrder,
                    '2051': errors.InvalidOrder,
                    '2060': errors.BadSymbol,
                    '2061': errors.BadSymbol,
                    '2062': errors.InvalidOrder,
                    '2063': errors.InvalidOrder,
                    '2064': errors.InvalidOrder,
                    '2065': errors.InvalidOrder,
                    '2070': errors.InvalidOrder,
                    '2080': errors.InsufficientFunds,
                    '2081': errors.OperationRejected,
                    '2082': errors.InvalidOrder,
                    '2083': errors.OperationRejected,
                    '2090': errors.RateLimitExceeded,
                    '2100': errors.BadRequest,
                    '2101': errors.BadRequest,
                    '2102': errors.OperationRejected,
                    '2103': errors.OperationRejected,
                    '2104': errors.BadRequest,
                    '2105': errors.BadRequest,
                    '2107': errors.BadRequest,
                    '2108': errors.BadRequest,
                    '2110': errors.InvalidOrder,
                    '2111': errors.InvalidOrder,
                    '2112': errors.InvalidOrder,
                    '2113': errors.InvalidOrder,
                    '2114': errors.InvalidOrder,
                    '2115': errors.InvalidOrder,
                    '2116': errors.InvalidOrder,
                    '2117': errors.InvalidOrder,
                    '2300': errors.OperationRejected,
                    '2301': errors.OperationRejected,
                    '2400': errors.OperationRejected,
                    '2401': errors.OperationRejected,
                    '2402': errors.OperationRejected,
                    '3000': errors.BadSymbol,
                    '3004': errors.OperationRejected,
                    '3005': errors.OperationRejected,
                    '3006': errors.OperationRejected,
                    '3021': errors.BadRequest,
                    '3031': errors.BadRequest,
                    '4000': errors.InsufficientFunds,
                    '4002': errors.OperationFailed,
                    '4010': errors.OperationRejected,
                    '5000': errors.OperationRejected,
                    '5001': errors.OperationRejected,
                    '5002': errors.OperationRejected,
                    '5003': errors.OperationRejected,
                    '5004': errors.OperationRejected,
                    '5005': errors.OperationRejected,
                    '6000': errors.OperationRejected,
                    '6100': errors.OperationRejected,
                    '7000': errors.OperationRejected,
                    '7001': errors.InsufficientFunds,
                    '7002': errors.OperationFailed,
                    '7003': errors.OperationRejected,
                    '7004': errors.OperationRejected,
                    '7005': errors.InsufficientFunds,
                    '7006': errors.OperationFailed,
                    '7007': errors.PermissionDenied,
                    '7100': errors.OperationFailed,
                    '7101': errors.OperationRejected,
                    '7102': errors.OperationRejected,
                    '7103': errors.OperationRejected,
                    '7201': errors.OperationRejected,
                    '7450': errors.OperationRejected,
                    '7451': errors.OperationRejected,
                    '7452': errors.OperationRejected,
                    '7453': errors.OperationRejected,
                    '7454': errors.OperationRejected,
                    '7455': errors.OperationRejected,
                    '7500': errors.OperationRejected,
                    '7501': errors.BadRequest,
                    '7502': errors.OperationRejected,
                    '7503': errors.OperationRejected,
                    '7504': errors.OperationRejected, // "Builder is not authorized for the specified user.","status":400
                },
                'broad': {},
            },
        });
    }
    eipDefinitions() {
        return {
            'EIP712_ORDER_TYPE': {
                'Order': [
                    { 'name': 'subAccountID', 'type': 'uint64' },
                    { 'name': 'isMarket', 'type': 'bool' },
                    { 'name': 'timeInForce', 'type': 'uint8' },
                    { 'name': 'postOnly', 'type': 'bool' },
                    { 'name': 'reduceOnly', 'type': 'bool' },
                    { 'name': 'legs', 'type': 'OrderLeg[]' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
                'OrderLeg': [
                    { 'name': 'assetID', 'type': 'uint256' },
                    { 'name': 'contractSize', 'type': 'uint64' },
                    { 'name': 'limitPrice', 'type': 'uint64' },
                    { 'name': 'isBuyingContract', 'type': 'bool' },
                ],
            },
            'EIP712_ORDER_WITH_BUILDER_TYPE': {
                'OrderWithBuilderFee': [
                    { 'name': 'subAccountID', 'type': 'uint64' },
                    { 'name': 'isMarket', 'type': 'bool' },
                    { 'name': 'timeInForce', 'type': 'uint8' },
                    { 'name': 'postOnly', 'type': 'bool' },
                    { 'name': 'reduceOnly', 'type': 'bool' },
                    { 'name': 'legs', 'type': 'OrderLeg[]' },
                    { 'name': 'builder', 'type': 'address' },
                    { 'name': 'builderFee', 'type': 'uint32' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
                'OrderLeg': [
                    { 'name': 'assetID', 'type': 'uint256' },
                    { 'name': 'contractSize', 'type': 'uint64' },
                    { 'name': 'limitPrice', 'type': 'uint64' },
                    { 'name': 'isBuyingContract', 'type': 'bool' },
                ],
            },
            'EIP712_TRANSFER_TYPE': {
                'Transfer': [
                    { 'name': 'fromAccount', 'type': 'address' },
                    { 'name': 'fromSubAccount', 'type': 'uint64' },
                    { 'name': 'toAccount', 'type': 'address' },
                    { 'name': 'toSubAccount', 'type': 'uint64' },
                    { 'name': 'tokenCurrency', 'type': 'uint8' },
                    { 'name': 'numTokens', 'type': 'uint64' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
            },
            'EIP712_WITHDRAWAL_TYPE': {
                'Withdrawal': [
                    { 'name': 'fromAccount', 'type': 'address' },
                    { 'name': 'toEthAddress', 'type': 'address' },
                    { 'name': 'tokenCurrency', 'type': 'uint8' },
                    { 'name': 'numTokens', 'type': 'uint64' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
            },
            'EIP712_BUILDER_APPROVAL_TYPE': {
                'AuthorizeBuilder': [
                    { 'name': 'mainAccountID', 'type': 'address' },
                    { 'name': 'builderAccountID', 'type': 'address' },
                    { 'name': 'maxFutureFeeRate', 'type': 'uint32' },
                    { 'name': 'maxSpotFeeRate', 'type': 'uint32' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
            },
            'EIP712_WALLETLOGIN_TYPE': {
                'WalletLogin': [
                    { 'name': 'signer', 'type': 'address' },
                    { 'name': 'nonce', 'type': 'uint32' },
                    { 'name': 'expiration', 'type': 'int64' },
                ],
            },
        };
    }
    usesPrivateKey() {
        const privateKeyDefined = this.privateKey !== undefined && this.privateKey !== '';
        const apiKeyDefined = this.apiKey !== undefined && this.apiKey !== '';
        if (privateKeyDefined && apiKeyDefined) {
            throw new errors.ExchangeError('You should provide either "privateKey" or "apikey & secret"');
        }
        return privateKeyDefined;
    }
    /**
     * @method
     * @name grvt#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://api-docs.grvt.io/#authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    async signIn(params = {}) {
        if (this.usesPrivateKey()) {
            await this.signInWithPrivateKey(params);
            await this.initializeClient(params);
        }
        else {
            await this.signInWithApiKey(params);
        }
        await this.loadAccountInfos();
        return true;
    }
    async signInWithApiKey(params = {}) {
        const now = this.milliseconds();
        // expires in 24 hours as CS suggested
        const expires = this.safeInteger(this.options, 'signInExpiration', 0);
        // if previous sign-in not expired (give 10 seconds margin)
        if (expires !== undefined && expires > now + 10000) {
            return {};
        }
        const request = {
            'api_key': this.apiKey,
        };
        const response = await this.privateEdgePostAuthApiKeyLogin(this.extend(request, params));
        //
        //    {
        //        "location": "",
        //        "status": "success"
        //    }
        //
        this.options['signInExpiration'] = now + 86400000; // 24 hours
        return response;
    }
    async signInWithPrivateKey(params = {}) {
        this.checkRequiredCredentials();
        const now = this.milliseconds();
        // expires in 24 hours as CS suggested
        const expires = this.safeInteger(this.options, 'signInExpiration', 0);
        // if previous sign-in not expired (give 10 seconds margin)
        if (expires !== undefined && expires > now + 10000) {
            return {};
        }
        const walletAddress = this.ethGetAddressFromPrivateKey(this.privateKey);
        let request = {
            'address': walletAddress,
            'signature': this.defaultSignature(),
        };
        request = this.createSignedRequest(request, 'EIP712_WALLETLOGIN_TYPE');
        const response = await this.privateEdgePostAuthWalletLogin(this.extend(request, params));
        //
        //    {
        //        "location": "",
        //        "status": "success"
        //    }
        //
        this.options['signInExpiration'] = now + 86400000; // 24 hours
        return response;
    }
    async initializeClient(params = {}) {
        const builderFee = this.safeBool(params, 'builderFee', this.safeBool(this.options, 'builderFee', true)); // we shouldn't omit here
        if (!builderFee) {
            return false; // skip if builder fee is not enabled
        }
        const approvedBuilderFee = this.safeBool(this.options, 'approvedBuilderFee', false);
        if (approvedBuilderFee) {
            return true; // skip if builder fee is already approved
        }
        const results = await Promise.all([this.privateTradingPostFullV1GetAuthorizedBuilders(), this.loadAccountInfos()]);
        //
        // {
        //     "results": [{
        //         "builder_account_id": "GRVT_MAIN_ACCOUNT_ID_HERE",
        //         "max_futures_fee_rate": 0.001,
        //         "max_spot_fee_rate": 0.0001
        //     }]
        // }
        //
        const currentBuilders = results[0];
        const approvedBuilder = this.safeList(currentBuilders, 'results', []);
        const length = approvedBuilder.length;
        let found = false;
        for (let i = 0; i < length; i++) {
            const builderInfo = this.safeDict(approvedBuilder, i, {});
            const builderAccountId = this.safeString(builderInfo, 'builder_account_id');
            if (builderAccountId === this.safeString(this.options, 'builder')) {
                found = true;
                break;
            }
        }
        if (found) {
            this.options['approvedBuilderFee'] = true;
        }
        else {
            try {
                const defaultFromAccountId = this.safeString(this.options, 'userMainAccountId'); // this.ethGetAddressFromPrivateKey (this.secret); // this.safeString (this.options, 'userMainAccountId');
                let request = {
                    'main_account_id': defaultFromAccountId,
                    'builder_account_id': this.safeString(this.options, 'builder'),
                    'max_futures_fee_rate': this.safeString(this.options, 'builderRate'),
                    'max_spot_fee_rate': this.safeString(this.options, 'builderRate'),
                    'signature': this.defaultSignature(),
                };
                request = this.createSignedRequest(request, 'EIP712_BUILDER_APPROVAL_TYPE');
                const authResponse = await this.privateTradingPostFullV1AuthorizeBuilder(this.extend(request, params));
                //
                // {
                //     "result": {
                //         "ack": "true",
                //         "tx_id":"0"
                //     }
                // }
                //
                const authResult = this.safeDict(authResponse, 'result');
                const ack = this.safeBool(authResult, 'ack');
                if (!ack) {
                    throw new errors.ExchangeError('Builder authorization failed, ' + this.json(authResponse));
                }
                this.options['approvedBuilderFee'] = true;
            }
            catch (e) {
                this.options['builderFee'] = false; // disable builder fee if an error occurs
            }
        }
        return undefined; // just c#
    }
    /**
     * @method
     * @name grvt#fetchMarkets
     * @description retrieves data on all markets
     * @see https://api-docs.grvt.io/market_data_api/#get-instrument-prod
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const marketsPromise = this.publicMarketPostFullV1AllInstruments(params);
        //
        //    {
        //        "result": [
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "instrument_hash": "0x032201",
        //                "base": "AAVE",
        //                "quote": "USDT",
        //                "kind": "PERPETUAL",
        //                "venues": [
        //                    "ORDERBOOK",
        //                    "RFQ"
        //                ],
        //                "settlement_period": "PERPETUAL",
        //                "base_decimals": "9",
        //                "quote_decimals": "6",
        //                "tick_size": "0.01",
        //                "min_size": "0.1",
        //                "create_time": "1764303867576216941",
        //                "max_position_size": "3000.0",
        //                "funding_interval_hours": "8",
        //                "adjusted_funding_rate_cap": "0.75",
        //                "adjusted_funding_rate_floor": "-0.75"
        //            },
        //            ...
        //
        const promises = [marketsPromise];
        if (!this.isEmptyString(this.apiKey) || !this.isEmptyString(this.privateKey)) {
            promises.push(this.signIn());
        }
        const results = await Promise.all(promises);
        const response = results[0];
        const result = this.safeList(response, 'result', []);
        return this.parseMarkets(result);
    }
    parseMarket(market) {
        //
        //    {
        //        "instrument": "BTC_USDT_Perp",
        //        "instrument_hash": "0x030501",
        //        "base": "BTC",
        //        "quote": "USDT",
        //        "kind": "PERPETUAL",
        //        "venues": [
        //            "ORDERBOOK",
        //            "RFQ"
        //        ],
        //        "settlement_period": "PERPETUAL",
        //        "base_decimals": 9,
        //        "quote_decimals": 6,
        //        "tick_size": "0.1",
        //        "min_size": "0.001",
        //        "create_time": "1768040726362828205",
        //        "max_position_size": "1000.0",
        //        "funding_interval_hours": 8,
        //        "adjusted_funding_rate_cap": "0.3",
        //        "adjusted_funding_rate_floor": "-0.3",
        //        "min_notional": "100.0"
        //    }
        //
        const marketId = this.safeString(market, 'instrument');
        const baseId = this.safeString(market, 'base');
        const quoteId = this.safeString(market, 'quote');
        const settleId = quoteId;
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const settle = this.safeCurrencyCode(settleId);
        const symbol = base + '/' + quote + ':' + settle;
        let type = undefined;
        const typeRaw = this.safeString(market, 'kind');
        if (typeRaw === 'PERPETUAL') {
            type = 'swap';
        }
        const isSpot = (type === 'spot');
        const isSwap = (type === 'swap');
        const isFuture = (type === 'future');
        const isContract = isSwap || isFuture;
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': isSpot,
            'margin': false,
            'swap': isSwap,
            'future': isFuture,
            'option': false,
            'active': undefined,
            'contract': isContract,
            'linear': isSwap ? true : undefined,
            'inverse': isSwap ? false : undefined,
            'contractSize': this.parseNumber('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'min_size'),
                'price': this.safeNumber(market, 'tick_size'),
                'base': this.parseNumber(this.parsePrecision(this.safeString(market, 'base_decimals'))),
                'quote': this.parseNumber(this.parsePrecision(this.safeString(market, 'quote_decimals'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'min_size'),
                    'max': this.safeNumber(market, 'max_position_size'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(market, 'min_notional'),
                    'max': undefined,
                },
            },
            'created': this.safeIntegerProduct(market, 'create_time', 0.000001),
            'info': market,
        };
    }
    /**
     * @method
     * @name grvt#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.grvt.io/market_data_api/#get-currency-response
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const request = { '': '' }; // workaround for php [] empty arr
        const response = await this.publicMarketPostFullV1Currency(request);
        //
        //    {
        //        "result": [
        //            {
        //                "id": "4",
        //                "symbol": "ETH",
        //                "balance_decimals": "9",
        //                "quantity_multiplier": "1000000000"
        //            },
        //            ..
        //
        const responseResult = this.safeList(response, 'result', []);
        return this.parseCurrencies(responseResult);
    }
    parseCurrency(rawCurrency) {
        //
        //            {
        //                "id": "4",
        //                "symbol": "ETH",
        //                "balance_decimals": "9",
        //                "quantity_multiplier": "1000000000"
        //            },
        //
        const id = this.safeString(rawCurrency, 'symbol');
        const code = this.safeCurrencyCode(id);
        return this.safeCurrencyStructure({
            'info': rawCurrency,
            'id': id,
            'code': code,
            'name': undefined,
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'precision': this.parseNumber(this.parsePrecision(this.safeString(rawCurrency, 'balance_decimals'))),
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'type': 'crypto',
            'networks': undefined,
            'numericId': this.safeInteger(rawCurrency, 'id'),
        });
    }
    /**
     * @method
     * @name grvt#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.grvt.io/market_data_api/#ticker_1
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument': this.marketId(symbol),
        };
        const response = await this.publicMarketPostFullV1Ticker(this.extend(request, params));
        //
        //    {
        //        "result": {
        //            "event_time": "1764774730025055205",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "92697.300078773",
        //            "index_price": "92727.818122278",
        //            "last_price": "92683.0",
        //            "last_size": "0.001",
        //            "mid_price": "92682.95",
        //            "best_bid_price": "92682.9",
        //            "best_bid_size": "5.332",
        //            "best_ask_price": "92683.0",
        //            "best_ask_size": "0.009",
        //            "funding_rate_8h_curr": "0.0037",
        //            "funding_rate_8h_avg": "0.0037",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "buy_volume_24h_b": "2893.898",
        //            "sell_volume_24h_b": "2907.847",
        //            "buy_volume_24h_q": "266955739.1606",
        //            "sell_volume_24h_q": "268170211.7109",
        //            "high_price": "93908.3",
        //            "low_price": "89900.1",
        //            "open_price": "90129.2",
        //            "open_interest": "1523.218935908",
        //            "long_short_ratio": "1.472543",
        //            "funding_rate": "0.0037",
        //            "next_funding_time": "1764777600000000000"
        //        }
        //    }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseTicker(result, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        //  {
        //            "event_time": "1764774730025055205",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "92697.300078773",
        //            "index_price": "92727.818122278",
        //            "last_price": "92683.0",
        //            "last_size": "0.001",
        //            "mid_price": "92682.95",
        //            "best_bid_price": "92682.9",
        //            "best_bid_size": "5.332",
        //            "best_ask_price": "92683.0",
        //            "best_ask_size": "0.009",
        //            "funding_rate_8h_curr": "0.0037",
        //            "funding_rate_8h_avg": "0.0037",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "buy_volume_24h_b": "2893.898",
        //            "sell_volume_24h_b": "2907.847",
        //            "buy_volume_24h_q": "266955739.1606",
        //            "sell_volume_24h_q": "268170211.7109",
        //            "high_price": "93908.3",
        //            "low_price": "89900.1",
        //            "open_price": "90129.2",
        //            "open_interest": "1523.218935908",
        //            "long_short_ratio": "1.472543",
        //            "funding_rate": "0.0037",
        //            "next_funding_time": "1764777600000000000"
        //        }
        //
        const marketId = this.safeString(ticker, 'instrument');
        return this.safeTicker({
            'info': ticker,
            'symbol': this.safeSymbol(marketId, market),
            'open': this.safeString(ticker, 'open_price'),
            'high': this.safeString(ticker, 'high_price'),
            'low': this.safeString(ticker, 'low_price'),
            'last': this.safeString(ticker, 'last_price'),
            'bid': this.safeString(ticker, 'best_bid_price'),
            'bidVolume': this.safeString(ticker, 'best_bid_size'),
            'ask': this.safeString(ticker, 'best_ask_price'),
            'askVolume': this.safeString(ticker, 'best_ask_size'),
            'change': undefined,
            'percentage': undefined,
            'baseVolume': this.safeString(ticker, 'buy_volume_24h_b'),
            'quoteVolume': this.safeString(ticker, 'buy_volume_24h_q'),
            'markPrice': this.safeString(ticker, 'mark_price'),
            'indexPrice': this.safeString(ticker, 'index_price'),
            'vwap': undefined,
            'average': undefined,
            'previousClose': undefined,
        });
    }
    /**
     * @method
     * @name grvt#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.grvt.io/market_data_api/#orderbook-levels
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'instrument': this.marketId(symbol),
        };
        if (limit === undefined) {
            limit = 100;
        }
        if (limit <= 500) {
            request['depth'] = this.findNearestCeiling([10, 50, 100, 500], limit);
        }
        const response = await this.publicMarketPostFullV1Book(this.extend(request, params));
        //
        //    {
        //        "result": {
        //            "event_time": "1764777396650000000",
        //            "instrument": "BTC_USDT_Perp",
        //            "bids": [
        //                { "price": "92336.0", "size": "0.005", "num_orders": "1" },
        //                ...
        //            ],
        //            "asks": [
        //                { "price": "92336.1", "size": "5.711", "num_orders": "37" },
        //                ...
        //            ]
        //        }
        //    }
        //
        const result = this.safeDict(response, 'result', {});
        const timestamp = this.parse8601(this.safeString(result, 'event_time'));
        const marketId = this.safeString(result, 'instrument');
        return this.parseOrderBook(result, this.safeSymbol(marketId), timestamp, 'bids', 'asks', 'price', 'size');
    }
    /**
     * @method
     * @name grvt#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.grvt.io/market_data_api/#trade_1
     * @param {string} symbol unified symbol of the market
     * @param {int} [since] timestamp in ms of the earliest item to fetch
     * @param {int} [limit] the maximum amount of items to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const response = await this.publicMarketPostFullV1TradeHistory(this.extend(request, params));
        //
        //    {
        //        "next": "eyJ0cmFkZUlkIjo2NDc5MTAyMywidHJhZGVJbmRleCI6MX0",
        //        "result": [
        //            {
        //                "event_time": "1764779531332118705",
        //                "instrument": "ETH_USDT_Perp",
        //                "is_taker_buyer": false,
        //                "size": "23.73",
        //                "price": "3089.88",
        //                "mark_price": "3089.360002315",
        //                "index_price": "3090.443723246",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "trade_id": "64796657-1",
        //                "venue": "ORDERBOOK",
        //                "is_rpi": false
        //            },
        //            ...
        //
        const result = this.safeList(response, 'result', []);
        return this.parseTrades(result, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //
        //            {
        //                "event_time": "1764779531332118705",
        //                "instrument": "ETH_USDT_Perp",
        //                "size": "23.73",
        //                "price": "3089.88",
        //                "is_rpi": false,
        //                "mark_price": "3089.360002315",
        //                "index_price": "3090.443723246",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "trade_id": "64796657-1",
        //                "venue": "ORDERBOOK",
        //                "is_taker_buyer": false
        //            }
        //
        // fetchMyTrades
        //
        //            {
        //                "event_time": "1764945709702747558",
        //                "instrument": "BTC_USDT_Perp",
        //                "size": "0.001",
        //                "price": "90000.0",
        //                "is_rpi": false
        //                "mark_price": "90050.164063298",
        //                "index_price": "90089.803654938",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "trade_id": "65424692-2",
        //                "venue": "ORDERBOOK",
        //                "is_buyer": true,
        //                "is_taker": false,
        //                "broker": "UNSPECIFIED",
        //                "realized_pnl": "0.0",
        //                "fee": "-0.00009",
        //                "fee_rate": "0.0",
        //                "order_id": "0x01010105034cddc7000000006621285c",
        //                "client_order_id": "1375879248",
        //                "signer": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "sub_account_id": "2147050003876484",
        //            }
        //
        const marketId = this.safeString(trade, 'instrument');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeIntegerProduct(trade, 'event_time', 0.000001);
        let takerOrMaker = undefined;
        const isTakerBuyer = this.safeBool(trade, 'is_taker_buyer');
        let side = undefined;
        if (isTakerBuyer !== undefined) {
            side = isTakerBuyer ? 'buy' : 'sell';
            takerOrMaker = 'taker';
        }
        else {
            takerOrMaker = this.safeBool(trade, 'is_taker') ? 'taker' : 'maker';
            side = this.safeBool(trade, 'is_buyer') ? 'buy' : 'sell';
        }
        let fee = undefined;
        const feeString = this.safeString(trade, 'fee');
        if (feeString !== undefined) {
            fee = {
                'cost': this.parseNumber(feeString),
                'currency': market['quote'],
                'rate': this.safeNumber(trade, 'fee_rate'),
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'trade_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'size'),
            'cost': undefined,
            'fee': fee,
            'order': this.safeString(trade, 'order_id'),
        }, market);
    }
    /**
     * @method
     * @name grvt#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.grvt.io/market_data_api/#candlestick_1
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest item to fetch
     * @param {int} [limit] the maximum amount of items to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const maxLimit = 1000;
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const market = this.market(symbol);
        let request = {
            'instrument': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const priceTypeMap = {
            'last': 'TRADE',
            'mark': 'MARK',
            'index': 'INDEX',
            // 'median': 'MEDIAN',
        };
        const selectedPriceType = this.safeString(params, 'priceType', 'last');
        request['type'] = this.safeString(priceTypeMap, selectedPriceType);
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const response = await this.publicMarketPostFullV1Kline(this.extend(request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "open_time": "1767288240000000000",
        //                "close_time": "1767288300000000000",
        //                "open": "88178.8",
        //                "close": "88176.7",
        //                "high": "88192.7",
        //                "low": "88176.6",
        //                "volume_b": "15.32",
        //                "volume_q": "1350962.4782",
        //                "trades": 38,
        //                "instrument": "BTC_USDT_Perp"
        //            },
        //        ],
        //        "next": "eyJvcGVuVGltZSI6MTc2NzI1ODMwMDAwMDAwMDAwMH0"
        //    }
        //
        const candles = this.safeList(response, 'result', []);
        return this.parseOHLCVs(candles, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //            {
        //                "open_time": "1767288240000000000",
        //                "close_time": "1767288300000000000",
        //                "open": "88178.8",
        //                "close": "88176.7",
        //                "high": "88192.7",
        //                "low": "88176.6",
        //                "volume_b": "15.32",
        //                "volume_q": "1350962.4782",
        //                "trades": 38,
        //                "instrument": "BTC_USDT_Perp"
        //            }
        //
        return [
            this.safeIntegerProduct(ohlcv, 'open_time', 0.000001),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume_b'),
        ];
    }
    /**
     * @method
     * @name grvt#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-docs.grvt.io/market_data_api/#funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, '8h', params);
        }
        const market = this.market(symbol);
        let request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const response = await this.publicMarketPostFullV1Funding(this.extend(request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "instrument": "BTC_USDT_Perp",
        //                "funding_rate": "-0.0034",
        //                "funding_time": "1760494260000000000",
        //                "mark_price": "112721.159060304",
        //                "funding_rate_8_h_avg": "-0.0038",
        //                "funding_interval_hours": "0"
        //            },
        //            ...
        //        ],
        //        "next": "eyJmdW5kaW5nVGltZSI6MTc2MDQ5NDI2MDAwMDAwMDAwMH0"
        //    }
        //
        const result = this.safeList(response, 'result', []);
        return this.parseFundingRateHistories(result, market);
    }
    parseFundingRateHistory(rawItem, market = undefined) {
        //
        //            {
        //                "instrument": "BTC_USDT_Perp",
        //                "funding_rate": "-0.0034",
        //                "funding_time": "1760494260000000000",
        //                "mark_price": "112721.159060304",
        //                "funding_rate_8_h_avg": "-0.0038",
        //                "funding_interval_hours": "0"
        //            },
        //
        const marketId = this.safeString(rawItem, 'instrument');
        const ts = this.safeIntegerProduct(rawItem, 'funding_time', 0.000001);
        return {
            'info': rawItem,
            'symbol': this.safeSymbol(marketId, market),
            'fundingRate': this.safeNumber(rawItem, 'funding_rate'),
            'timestamp': ts,
            'datetime': this.iso8601(ts),
        };
    }
    getSubAccountId(params) {
        let subAccountId = undefined;
        [subAccountId, params] = this.handleOptionAndParams(params, 'getSubAccountId', 'accountId');
        if (subAccountId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' you should set "accountId" in options or params, which can be found in the grvt dashboard, under Api-Keys page');
        }
        return subAccountId.toString();
    }
    /**
     * @method
     * @name grvt#fetchBalance
     * @description query for account info
     * @see https://api-docs.grvt.io/trading_api/#sub-account-summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarketsAndSignIn();
        const request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        const response = await this.privateTradingPostFullV1AccountSummary(this.extend(request, params));
        //
        //    {
        //        "result": {
        //            "event_time": "1764863116142428457",
        //            "sub_account_id": "2147050003876484",
        //            "margin_type": "SIMPLE_CROSS_MARGIN",
        //            "settle_currency": "USDT",
        //            "unrealized_pnl": "0.0",
        //            "total_equity": "15.0",
        //            "initial_margin": "0.0",
        //            "maintenance_margin": "0.0",
        //            "available_balance": "15.0",
        //            "spot_balances": [
        //                {
        //                    "currency": "USDT",
        //                    "balance": "15.0",
        //                    "index_price": "1.000289735"
        //                }
        //            ],
        //            "positions": [],
        //            "settle_index_price": "1.000289735",
        //            "derisk_margin": "0.0",
        //            "derisk_to_maintenance_margin_ratio": "1.0",
        //            "total_cross_equity": "15.0",
        //            "cross_unrealized_pnl": "0.0"
        //        }
        //    }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseBalance(result);
    }
    parseBalance(response) {
        //
        //        {
        //            "event_time": "1764863116142428457",
        //            "sub_account_id": "2147050003876484",
        //            "margin_type": "SIMPLE_CROSS_MARGIN",
        //            "settle_currency": "USDT",
        //            "unrealized_pnl": "0.0",
        //            "total_equity": "15.0",
        //            "initial_margin": "0.0",
        //            "maintenance_margin": "0.0",
        //            "available_balance": "15.0",
        //            "spot_balances": [
        //                {
        //                    "currency": "USDT",
        //                    "balance": "15.0",
        //                    "index_price": "1.000289735"
        //                }
        //            ],
        //            "positions": [],
        //            "settle_index_price": "1.000289735",
        //            "derisk_margin": "0.0",
        //            "derisk_to_maintenance_margin_ratio": "1.0",
        //            "total_cross_equity": "15.0",
        //            "cross_unrealized_pnl": "0.0"
        //        }
        //
        const timestamp = this.safeIntegerProduct(response, 'event_time', 0.000001);
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
        const spotBalances = this.safeList(response, 'spot_balances', []);
        const availableBalance = this.safeString(response, 'available_balance');
        for (let i = 0; i < spotBalances.length; i++) {
            const balance = spotBalances[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(balance, 'balance');
            account['free'] = availableBalance; // todo: revise after API team clarification
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name grvt#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api-docs.grvt.io/trading_api/#transfer
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = [currency['code']];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const useTransfersEndpoint = this.safeBool(this.options, 'useTransfersEndpointForDepositsWithdrawals', true);
        if (useTransfersEndpoint) {
            const transfers = await this.internalFetchTransfers(this.extend(request, params), currency, since, limit);
            const filteredResults = this.filterTransfersByType(transfers, 'deposit', true);
            const transactions = this.getListFromObjectValues(filteredResults[0], 'info');
            return this.parseTransactions(transactions, currency, since, limit);
        }
        else {
            const response = await this.privateTradingPostFullV1DepositHistory(this.extend(request, params));
            //
            // {
            //     "result": [{
            //         "l_1_hash": "0x10000101000203040506",
            //         "l_2_hash": "0x10000101000203040506",
            //         "to_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
            //         "currency": "USDT",
            //         "num_tokens": "1500.0",
            //         "initiated_time": "1697788800000000000",
            //         "confirmed_time": "1697788800000000000",
            //         "from_address": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0"
            //     }],
            //     "next": "Qw0918="
            // }
            //
            const result = this.safeList(response, 'result', []);
            return this.parseTransactions(result, currency, since, limit);
        }
    }
    /**
     * @method
     * @name grvrt#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_withdrawals
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        let request = {};
        let currency = undefined;
        if (code === undefined) {
            request['currency'] = null;
        }
        else {
            currency = this.currency(code);
            request['currency'] = [currency['code']];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const useTransfersEndpoint = this.safeBool(this.options, 'useTransfersEndpointForDepositsWithdrawals', true);
        if (useTransfersEndpoint) {
            const transfers = await this.internalFetchTransfers(this.extend(request, params), currency, since, limit);
            const filteredResults = this.filterTransfersByType(transfers, 'withdrawal', true);
            const transactions = this.getListFromObjectValues(filteredResults[0], 'info');
            return this.parseTransactions(transactions, currency, since, limit);
        }
        else {
            const response = await this.privateTradingPostFullV1WithdrawalHistory(this.extend(request, params));
            //
            // {
            //     "result": [{
            //         "tx_id": "1028403",
            //         "from_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
            //         "to_eth_address": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
            //         "currency": "USDT",
            //         "num_tokens": "1500.0",
            //         "signature": {
            //             "signer": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
            //             "r": "0xb788d96fee91c7cdc35918e0441b756d4000ec1d07d900c73347d9abbc20acc8",
            //             "s": "0x3d786193125f7c29c958647da64d0e2875ece2c3f845a591bdd7dae8c475e26d",
            //             "v": 28,
            //             "expiration": "1697788800000000000",
            //             "nonce": 1234567890,
            //             "chain_id": "325"
            //         },
            //         "event_time": "1697788800000000000",
            //         "l_1_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            //         "l_2_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
            //     }],
            //     "next": "Qw0918="
            // }
            //
            const result = this.safeList(response, 'result', []);
            return this.parseTransactions(result, currency, since, limit);
        }
    }
    async internalFetchTransfers(req, currency = undefined, since = undefined, limit = undefined) {
        const response = await this.privateTradingPostFullV1TransferHistory(req);
        //
        //    {
        //        "result": [
        //            {
        //                "tx_id": "65119836",
        //                "from_account_id": "0xc451b0191351ce308fdfd779d73814c910fc5ecb",
        //                "from_sub_account_id": "0",
        //                "to_account_id": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "to_sub_account_id": "0",
        //                "currency": "USDT",
        //                "num_tokens": "4.998",
        //                "signature": {
        //                    "signer": "0xf4fdbaf9655bfd607098f4f887aaca58c9667203",
        //                    "r": "0x5f780b99e5e8516f85e66af49b469eeeeeee724290d7f49f1e84b25ad038fa81",
        //                    "s": "0x66c76fdb37a25db8c6b368625d96ee91ab1ffca1786d84dc806b08d1460e97bc",
        //                    "v": "27",
        //                    "expiration": "1767455807929000000",
        //                    "nonce": "45905",
        //                    "chain_id": "0"
        //                },
        //                "event_time": "1764863808817370541",
        //                "transfer_type": "NON_NATIVE_BRIDGE_DEPOSIT",
        //                "transfer_metadata": "{\\"provider\\":\\"rhino\\",\\"direction\\":\\"deposit\\",\\"chainid\\":\\"8453\\",\\"endpoint\\":\\"0x01b89ac919ead1bd513b548962075137c683b9ab\\",\\"provider_tx_id\\":\\"0x1dff8c839f8e21b5af7e121a1ae926017e734aafe8c4ae9942756b3091793b4f\\",\\"provider_ref_id\\":\\"6931aefa5f1ab6fcf0d2f856\\"}"
        //            },
        //            ...
        //        ],
        //        "next": ""
        //    }
        //
        const rows = this.safeList(response, 'result', []);
        const transfers = this.parseTransfers(rows, currency, since, limit);
        return transfers;
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //    {
        //         "l_1_hash": "0x10000101000203040506",
        //         "l_2_hash": "0x10000101000203040506",
        //         "to_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //         "currency": "USDT",
        //         "num_tokens": "1500.0",
        //         "initiated_time": "1697788800000000000",
        //         "confirmed_time": "1697788800000000000",
        //         "from_address": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "tx_id": "1028403",
        //         "from_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //         "to_eth_address": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //         "currency": "USDT",
        //         "num_tokens": "1500.0",
        //         "signature": {
        //             "signer": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //             "r": "0xb788d96fee91c7cdc35918e0441b756d4000ec1d07d900c73347d9abbc20acc8",
        //             "s": "0x3d786193125f7c29c958647da64d0e2875ece2c3f845a591bdd7dae8c475e26d",
        //             "v": 28,
        //             "expiration": "1697788800000000000",
        //             "nonce": 1234567890,
        //             "chain_id": "325"
        //         },
        //         "event_time": "1697788800000000000",
        //         "l_1_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        //         "l_2_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        //     }
        //
        // fetchTransfers
        //
        //     {
        //          "tx_id": "65119836",
        //          "from_account_id": "0xc451b0191351ce308fdfd779d73814c910fc5ecb",
        //          "from_sub_account_id": "0",
        //          "to_account_id": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //          "to_sub_account_id": "0",
        //          "currency": "USDT",
        //          "num_tokens": "4.998",
        //          "signature": {
        //              "signer": "0xf4fdbaf9655bfd607098f4f887aaca58c9667203",
        //              "r": "0x5f780b99e5e8516f85e66af49b469eeeeeee724290d7f49f1e84b25ad038fa81",
        //              "s": "0x66c76fdb37a25db8c6b368625d96ee91ab1ffca1786d84dc806b08d1460e97bc",
        //              "v": "27",
        //              "expiration": "1767455807929000000",
        //              "nonce": "45905",
        //              "chain_id": "0"
        //          },
        //          "event_time": "1764863808817370541",
        //          "transfer_type": "NON_NATIVE_BRIDGE_DEPOSIT",
        //          "transfer_metadata": "{\\"provider\\":\\"rhino\\",\\"direction\\":\\"deposit\\",\\"chainid\\":\\"8453\\",\\"endpoint\\":\\"0x01b89ac919ead1bd513b548962075137c683b9ab\\",\\"provider_tx_id\\":\\"0x1dff8c839f8e21b5af7e121a1ae926017e734aafe8c4ae9942756b3091793b4f\\",\\"provider_ref_id\\":\\"6931aefa5f1ab6fcf0d2f856\\"}"
        //      },
        //
        // withdraw
        //
        //    {
        //        "result": {
        //            "ack": "true"
        //        }
        //    }
        //
        let direction = undefined;
        let txId = undefined;
        let networkCode = undefined;
        let addressFrom = this.safeString(transaction, 'from_account_id');
        let addressTo = this.safeString(transaction, 'to_account_id');
        if ('transfer_metadata' in transaction) {
            const metaData = this.omitZero(this.safeString(transaction, 'transfer_metadata'));
            if (metaData !== undefined) {
                const parsedMeta = this.parseJson(metaData);
                direction = this.safeStringLower(parsedMeta, 'direction');
                txId = this.safeString(parsedMeta, 'provider_tx_id');
                networkCode = this.networkIdToCode(this.safeString(parsedMeta, 'chainid'));
                if (direction === 'withdrawal') {
                    addressTo = this.safeString(parsedMeta, 'endpoint');
                }
                else if (direction === 'deposit') {
                    addressFrom = this.safeString(parsedMeta, 'endpoint');
                }
            }
        }
        const timestamp = this.safeIntegerProduct2(transaction, 'event_time', 'initiated_time', 0.000001);
        const currencyId = this.safeString(transaction, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        return {
            'info': transaction,
            'id': undefined,
            'txid': txId,
            'type': direction,
            'currency': code,
            'network': networkCode,
            'amount': this.safeNumber(transaction, 'num_tokens'),
            'status': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }
    /**
     * @method
     * @name grvt#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://api-docs.grvt.io/trading_api/#transfer-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] whether to paginate the results (default false)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTransfers() requires a code argument');
        }
        await this.loadMarketsAndSignIn();
        let request = {};
        const currency = this.currency(code);
        const maxLimit = 1000;
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTransfers', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchTransfers', undefined, since, limit, params, maxLimit);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const response = await this.privateTradingPostFullV1TransferHistory(this.extend(request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "tx_id": "65119836",
        //                "from_account_id": "0xc451b0191351ce308fdfd779d73814c910fc5ecb",
        //                "from_sub_account_id": "0",
        //                "to_account_id": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "to_sub_account_id": "0",
        //                "currency": "USDT",
        //                "num_tokens": "4.998",
        //                "signature": {
        //                    "signer": "0xf4fdbaf9655bfd607098f4f887aaca58c9667203",
        //                    "r": "0x5f780b99e5e8516f85e66af49b469eeeeeee724290d7f49f1e84b25ad038fa81",
        //                    "s": "0x66c76fdb37a25db8c6b368625d96ee91ab1ffca1786d84dc806b08d1460e97bc",
        //                    "v": "27",
        //                    "expiration": "1767455807929000000",
        //                    "nonce": "45905",
        //                    "chain_id": "0"
        //                },
        //                "event_time": "1764863808817370541",
        //                "transfer_type": "NON_NATIVE_BRIDGE_DEPOSIT",
        //                "transfer_metadata": "{\\"provider\\":\\"rhino\\",\\"direction\\":\\"deposit\\",\\"chainid\\":\\"8453\\",\\"endpoint\\":\\"0x01b89ac919ead1bd513b548962075137c683b9ab\\",\\"provider_tx_id\\":\\"0x1dff8c839f8e21b5af7e121a1ae926017e734aafe8c4ae9942756b3091793b4f\\",\\"provider_ref_id\\":\\"6931aefa5f1ab6fcf0d2f856\\"}"
        //            },
        //            ...
        //        ],
        //        "next": ""
        //    }
        //
        const rows = this.safeList(response, 'result', []);
        const transfers = this.parseTransfers(rows, currency, since, limit);
        const filteredResults = this.filterTransfersByType(transfers, 'internal', false);
        return filteredResults[1];
    }
    filterTransfersByType(transfers, transferType, onlyMainAccount = true) {
        const matchedResults = [];
        const nonMatchedResults = [];
        for (let i = 0; i < transfers.length; i++) {
            const transfer = transfers[i];
            if ((onlyMainAccount && transfer['fromAccount'] === '0' && transfer['toAccount'] === '0') || (!onlyMainAccount && (transfer['fromAccount'] !== '0' || transfer['toAccount'] !== '0'))) {
                const metadata = this.safeString(transfer['info'], 'transfer_metadata');
                const parsedMetadata = this.parseJson(metadata);
                const direction = this.safeString(parsedMetadata, 'direction');
                if (direction === transferType) {
                    matchedResults.push(transfer);
                }
                else {
                    nonMatchedResults.push(transfer);
                }
            }
        }
        return [matchedResults, nonMatchedResults];
    }
    /**
     * @method
     * @name grvt#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api-docs.grvt.io/trading_api/#transfer_1
     * @param {string} code unified currency codeåå
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarketsAndSignIn();
        const currency = this.currency(code);
        const defaultFromAccountId = this.safeString(this.options, 'userMainAccountId');
        if (this.inArray(fromAccount, ['trading', 'funding']) && this.inArray(toAccount, ['trading', 'funding'])) {
            let tradingAccountId = undefined;
            [tradingAccountId, params] = this.handleOptionAndParams(params, 'transfer', 'tradingAccountId');
            let fundingAccountId = undefined;
            [fundingAccountId, params] = this.handleOptionAndParams(params, 'transfer', 'fundingAccountId');
            if (tradingAccountId === undefined || fundingAccountId === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' transfer(): you should set (in the options or params) "tradingAccountId" and "fundingAccountId" (you can use "0" as a main funding account id)');
            }
            fromAccount = (fromAccount === 'trading') ? tradingAccountId : fundingAccountId;
            toAccount = (toAccount === 'trading') ? tradingAccountId : fundingAccountId;
        }
        let request = {
            'from_account_id': this.safeString(params, 'from_account_id', defaultFromAccountId),
            'from_sub_account_id': this.safeString(params, 'from_sub_account_id', fromAccount),
            'to_account_id': this.safeString(params, 'to_account_id', defaultFromAccountId),
            'to_sub_account_id': this.safeString(params, 'to_sub_account_id', toAccount),
            'currency': currency['id'],
            'num_tokens': this.currencyToPrecision(code, amount),
            'signature': this.defaultSignature(),
            'transfer_type': 'STANDARD',
            'transfer_metadata': null,
        };
        request = this.createSignedRequest(request, 'EIP712_TRANSFER_TYPE', currency);
        let response = undefined;
        try {
            response = await this.privateTradingPostFullV1Transfer(this.extend(request, params));
        }
        catch (error) {
            const msg = this.exceptionMessage(error);
            const isFromFundingAccount = fromAccount === 'funding';
            if (isFromFundingAccount && msg.indexOf('You are not authorized')) {
                throw new errors.PermissionDenied(this.id + ' transfer() failed. Ensure you use funding api-keys when trying to transfer from Funding accounts: ' + msg);
            }
            throw error;
        }
        //
        // {
        //     "result": {
        //         "ack": "true",
        //         "tx_id": "1028403"
        //     }
        // }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseTransfer(result, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         "ack": "true",
        //         "tx_id": "1028403"
        //     }
        //
        // fetchTransfers
        //
        //            {
        //                "tx_id": "65119836",
        //                "from_account_id": "0xc451b0191351ce308fdfd779d73814c910fc5ecb",
        //                "from_sub_account_id": "0",
        //                "to_account_id": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "to_sub_account_id": "0",
        //                "currency": "USDT",
        //                "num_tokens": "4.998",
        //                "signature": {
        //                    "signer": "0xf4fdbaf9655bfd607098f4f887aaca58c9667203",
        //                    "r": "0x5f780b99e5e8516f85e66af49b469eeeeeee724290d7f49f1e84b25ad038fa81",
        //                    "s": "0x66c76fdb37a25db8c6b368625d96ee91ab1ffca1786d84dc806b08d1460e97bc",
        //                    "v": "27",
        //                    "expiration": "1767455807929000000",
        //                    "nonce": "45905",
        //                    "chain_id": "0"
        //                },
        //                "event_time": "1764863808817370541",
        //                "transfer_type": "NON_NATIVE_BRIDGE_DEPOSIT",
        //                "transfer_metadata": "{\\"provider\\":\\"rhino\\",\\"direction\\":\\"deposit\\",\\"chainid\\":\\"8453\\",\\"endpoint\\":\\"0x01b89ac919ead1bd513b548962075137c683b9ab\\",\\"provider_tx_id\\":\\"0x1dff8c839f8e21b5af7e121a1ae926017e734aafe8c4ae9942756b3091793b4f\\",\\"provider_ref_id\\":\\"6931aefa5f1ab6fcf0d2f856\\"}"
        //            }
        //
        const currencyId = this.safeString(transfer, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeIntegerProduct(transfer, 'event_time', 0.000001);
        return {
            'info': transfer,
            'id': this.safeString(transfer, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': this.safeString(transfer, 'from_sub_account_id'),
            'toAccount': this.safeString(transfer, 'to_sub_account_id'),
            'status': undefined,
        };
    }
    async loadAccountInfos() {
        if (this.safeString(this.options, 'userMainAccountId') !== undefined) {
            return;
        }
        const promises = [];
        promises.push(this.privateTradingPostFullV1AggregatedAccountSummary());
        //
        //     {
        //         "result": {
        //             "main_account_id": "0xc73c0c2538fd9b833d20933ccc88fdaa74fcb0d0",
        //             "total_equity": "3945034.23",
        //             "spot_balances": [{
        //                 "currency": "USDT",
        //                 "balance": "123456.78",
        //                 "index_price": "1.0000102"
        //             }],
        //             "vault_investments": [{
        //                 "vault_id": 123456789,
        //                 "num_lp_tokens": 1000000,
        //                 "share_price": 1000000,
        //                 "usd_notional_invested": 1000000
        //             }],
        //             "total_sub_account_balance": "3945034.23",
        //             "total_sub_account_equity": "3945034.23",
        //             "total_vault_investments_balance": "3945034.23",
        //             "total_sub_account_available_balance": "3945034.23",
        //             "total_usd_notional_invested": "3945034.23"
        //         }
        //     }
        //
        const accountIsUndefined = this.safeString(this.options, 'accountId') === undefined;
        if (accountIsUndefined) {
            promises.push(this.privateTradingPostFullV1GetSubAccounts());
        }
        //
        //     {
        //         "sub_account_ids": ["4724219064482495","2095919380","1170592370"]
        //     }
        //
        const responses = await Promise.all(promises);
        const result1 = this.safeDict(responses[0], 'result', {});
        const mainAccountId = this.safeString(result1, 'main_account_id');
        this.options['userMainAccountId'] = mainAccountId;
        if (accountIsUndefined) {
            const subAccountIds = this.safeList(responses[1], 'sub_account_ids', []);
            const length = subAccountIds.length;
            if (length < 1) {
                throw new errors.ArgumentsRequired(this.id + ' loadAccountInfos(): no sub accounts found, you might need to create an api-key in GRVT website');
            }
            if (length > 1) {
                throw new errors.ArgumentsRequired(this.id + ' loadAccountInfos(): multiple sub accounts found, please set the exchange.options["accountId"] to your preferred sub_account_id from this list: ' + this.json(subAccountIds));
            }
            const subAccountId = this.safeString(subAccountIds, 0);
            this.options['accountId'] = subAccountId;
        }
    }
    /**
     * @method
     * @name grvt#withdraw
     * @description make a withdrawal
     * @see https://api-docs.grvt.io/trading_api/#withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.network the network to withdraw on (mandatory)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        this.checkAddress(address);
        await this.loadMarketsAndSignIn();
        const defaultFromAccountId = this.safeString(this.options, 'userMainAccountId');
        const currency = this.currency(code);
        let request = {
            'to_eth_address': address,
            'from_account_id': defaultFromAccountId,
            'currency': currency['id'],
            'num_tokens': this.currencyToPrecision(code, amount),
            'signature': this.defaultSignature(),
        };
        const [networkCode, query] = this.handleNetworkCodeAndParams(params);
        const networkId = this.networkCodeToId(networkCode);
        if (networkId === undefined) {
            throw new errors.BadRequest(this.id + ' withdraw() requires a network parameter');
        }
        request['signature']['chain_id'] = networkId;
        request = this.createSignedRequest(request, 'EIP712_WITHDRAWAL_TYPE', currency);
        const response = await this.privateTradingPostFullV1Withdrawal(this.extend(request, query));
        //
        // {
        //     "result": {
        //         "ack": "true"
        //     }
        // }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseTransaction(result, currency);
    }
    /**
     * @method
     * @name grvt#createOrder
     * @description create a trade order
     * @see https://api-docs.grvt.io/trading_api/#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price a take profit order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "POST_ONLY"
     * @param {bool} [params.postOnly] true or false
     * @param {bool} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        const market = this.market(symbol);
        const orderLeg = {
            'instrument': market['id'],
            'size': this.amountToPrecision(symbol, amount),
        };
        if (price !== undefined) {
            orderLeg['limit_price'] = this.priceToPrecision(symbol, price);
        }
        else {
            orderLeg['limit_price'] = null;
        }
        if (side === 'sell') {
            orderLeg['is_buying_asset'] = false;
        }
        else if (side === 'buy') {
            orderLeg['is_buying_asset'] = true;
        }
        else {
            throw new errors.InvalidOrder(this.id + ' createOrder(): order side must be either "buy" or "sell"');
        }
        const isMarketOrder = (type === 'market');
        const orderRequest = {
            'sub_account_id': this.getSubAccountId(params),
            'time_in_force': undefined,
            'legs': [orderLeg],
            'signature': this.defaultSignature(),
            'metadata': {
                'client_order_id': this.nonce().toString() + '000' + this.requestId().toString(),
            },
            'is_market': isMarketOrder,
            'post_only': false,
            'reduce_only': this.safeBool(params, 'reduceOnly', false),
            // 'order_id': null,
            // 'state': null,
        };
        let timeInForce = this.safeStringUpper(params, 'timeInForce');
        const postOnly = this.isPostOnly(isMarketOrder, undefined, params);
        if (postOnly) {
            orderRequest['post_only'] = true;
        }
        else {
            if (timeInForce === undefined) {
                timeInForce = 'GOOD_TILL_TIME';
            }
            else {
                const tifMap = {
                    'GTC': 'GOOD_TILL_TIME',
                    'FOK': 'FILL_OR_KILL',
                    'IOC': 'IMMEDIATE_OR_CANCEL',
                };
                timeInForce = this.safeString(tifMap, timeInForce, timeInForce);
            }
            orderRequest['time_in_force'] = timeInForce;
        }
        if (!isMarketOrder) {
            if (postOnly) {
                timeInForce = 'POST_ONLY';
            }
            else if (timeInForce === 'ioc') {
                timeInForce = 'IMMEDIATE_OR_CANCEL';
            }
        }
        params = this.omit(params, ['reduceOnly', 'postOnly', 'timeInForce']);
        // Trigger & SL & TP
        let triggerPrice = undefined;
        let stopLossPrice = undefined;
        let takeProfitPrice = undefined;
        [triggerPrice, stopLossPrice, takeProfitPrice, params] = this.handleTriggerPricesAndParams(symbol, params);
        if (triggerPrice !== undefined || stopLossPrice !== undefined || takeProfitPrice !== undefined) {
            // trigger price
            let selectedPrice = undefined;
            if (triggerPrice !== undefined) {
                selectedPrice = triggerPrice;
            }
            else if (stopLossPrice !== undefined) {
                selectedPrice = stopLossPrice;
            }
            else if (takeProfitPrice !== undefined) {
                selectedPrice = takeProfitPrice;
            }
            // trigger type
            let selectedType = undefined;
            const isBuy = (side === 'buy');
            if (stopLossPrice !== undefined) {
                selectedType = isBuy ? 'STOP_LOSS' : 'TAKE_PROFIT';
            }
            else if (takeProfitPrice !== undefined) {
                selectedType = isBuy ? 'TAKE_PROFIT' : 'STOP_LOSS';
            }
            else {
                const triggerDirection = this.safeString(params, 'triggerDirection');
                if (triggerDirection === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a triggerDirection parameter when triggerPrice is specified, must be "ascending" or "descending"');
                }
                if (triggerDirection !== undefined) {
                    if (triggerDirection === 'ascending') {
                        selectedType = isBuy ? 'STOP_LOSS' : 'TAKE_PROFIT';
                    }
                    else if (triggerDirection === 'descending') {
                        selectedType = isBuy ? 'TAKE_PROFIT' : 'STOP_LOSS';
                    }
                }
            }
            // trigger by
            const triggerPriceType = this.safeStringUpper(params, 'triggerPriceType', 'LAST');
            orderRequest['metadata']['trigger'] = {
                'trigger_type': selectedType,
                'tpsl': {
                    'trigger_by': triggerPriceType,
                    'trigger_price': selectedPrice,
                    'close_position': this.safeBool(params, 'closePosition', false),
                },
            };
            params = this.omit(params, ['triggerDirection', 'triggerPriceType', 'closePosition']);
        }
        let eipType = 'EIP712_ORDER_TYPE';
        const builderFee = this.safeBool(params, 'builderFee', this.safeBool(this.options, 'builderFee', true));
        if (builderFee) {
            eipType = 'EIP712_ORDER_WITH_BUILDER_TYPE';
            orderRequest['builder'] = this.safeString(this.options, 'builder');
            orderRequest['builder_fee'] = this.safeString(this.options, 'builderRate');
        }
        params = this.omit(params, ['builderFee']);
        const signedOrderRequest = this.createSignedRequest(orderRequest, eipType);
        const request = {
            'order': signedOrderRequest,
        };
        const response = await this.privateTradingPostFullV1CreateOrder(this.extend(request, params));
        //
        //    {
        //        "result": {
        //            "order_id": "0x00",
        //            "sub_account_id": "2147050003876484",
        //            "is_market": false,
        //            "time_in_force": "GOOD_TILL_TIME",
        //            "post_only": false,
        //            "reduce_only": false,
        //            "legs": [
        //                {
        //                    "instrument": "BTC_USDT_Perp",
        //                    "size": "0.001",
        //                    "limit_price": "50000.0",
        //                    "is_buying_asset": true
        //                }
        //            ],
        //            "signature": {
        //                "signer": "0xbf465e6083a43b170791ea29393f60...",
        //                "r": "0x161826bc2fc43e07b4c1e4aeb01b3e58901f936af10b399e...",
        //                "s": "0x1b6d09609430ef73cb53dd87dbe73939824409296b3673719...",
        //                "v": 27,
        //                "expiration": "1766076771082000000",
        //                "nonce": 1766076671,
        //                "chain_id": "0"
        //            },
        //            "metadata": {
        //                "client_order_id": "1766076671",
        //                "create_time": "1766076671243762741",
        //                "trigger": {
        //                    "trigger_type": "UNSPECIFIED",
        //                    "tpsl": {
        //                        "trigger_by": "UNSPECIFIED",
        //                        "trigger_price": "0.0",
        //                        "close_position": false
        //                    }
        //                },
        //                "broker": "UNSPECIFIED",
        //                "is_position_transfer": false,
        //                "allow_crossing": false
        //            },
        //            "state": {
        //                "status": "PENDING",
        //                "reject_reason": "UNSPECIFIED",
        //                "book_size": [
        //                    "0.001"
        //                ],
        //                "traded_size": [
        //                    "0.0"
        //                ],
        //                "update_time": "1766076671243762741",
        //                "avg_fill_price": [
        //                    "0.0"
        //                ]
        //            },
        //            "builder": "0x00",
        //            "builder_fee": "0.0"
        //        }
        //    }
        //
        const data = this.safeDict(response, 'result', {});
        return this.parseOrder(data, market);
    }
    convertToBigIntCustom(x) {
        return parseInt(x);
    }
    eipMessageForOrder(order, structureType) {
        const priceMultiplier = '1000000000';
        const orderLegs = this.safeList(order, 'legs', []);
        const legs = [];
        for (let i = 0; i < orderLegs.length; i++) {
            const leg = orderLegs[i];
            const market = this.market(leg['instrument']);
            const bigInt10 = this.convertToBigIntCustom('10');
            const precisionValue = this.precisionFromString(this.safeString(market['precision'], 'base'));
            const precisionValueStr = precisionValue.toString();
            const sizeMultiplier = Math.pow(bigInt10, this.convertToBigIntCustom(precisionValueStr));
            const size = leg['size'];
            const sizeParts = size.split('.');
            const sizeDec = this.safeString(sizeParts, 1, '');
            const sizeDecLength = sizeDec.length + 0; // php tr
            const sizeDecLengthStr = sizeDecLength.toString();
            const sizeInteger = this.convertToBigIntCustom(size.replace('.', '')) * sizeMultiplier / (Math.pow(bigInt10, this.convertToBigIntCustom(sizeDecLengthStr)));
            const legOrder = {
                'assetID': market['info']['instrument_hash'],
                'contractSize': this.parseToInt(sizeInteger),
                'isBuyingContract': leg['is_buying_asset'],
            };
            const limitPrice = this.safeString(leg, 'limit_price');
            if (this.omitZero(limitPrice) !== undefined) {
                const price = leg['limit_price'];
                const limitParts = price.split('.');
                const limitDec = this.safeString(limitParts, 1, '');
                const limitDecLength = limitDec.length + 0; // php tr
                const limitDecLengthStr = limitDecLength.toString();
                const powerNum = limitDecLengthStr === '0' ? 0 : this.convertToBigIntCustom(limitDecLengthStr);
                const priceInteger = (this.convertToBigIntCustom(price.replace('.', '')) * this.convertToBigIntCustom(priceMultiplier) / (Math.pow(bigInt10, powerNum)));
                legOrder['limitPrice'] = this.parseToInt(priceInteger);
            }
            else {
                legOrder['limitPrice'] = 0; // should be zero to validate type-check
            }
            legs.push(legOrder);
        }
        const returnValue = {
            'subAccountID': order['sub_account_id'],
            'isMarket': order['is_market'],
            'timeInForce': this.timeInForceToInt(order['time_in_force']),
            'postOnly': order['post_only'],
            'reduceOnly': order['reduce_only'],
            'legs': legs,
            'nonce': order['signature']['nonce'],
            'expiration': order['signature']['expiration'],
        };
        if (structureType === 'EIP712_ORDER_WITH_BUILDER_TYPE' && this.safeBool(this.options, 'builderFee', true)) {
            returnValue['builder'] = order['builder'];
            returnValue['builderFee'] = this.parseToInt(this.convertToBigIntCustom(this.feeAmountMultiplier()) * parseFloat(order['builder_fee'])); // the order is matter for Multiply in go, b must be float64 otherwise the value would be 0
        }
        return returnValue;
    }
    /**
     * @method
     * @name grvt#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api-docs.grvt.io/trading_api/#fill-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        let request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['base'] = [];
            request['base'].push(market['baseId']);
            request['quote'] = [];
            request['quote'].push(market['quoteId']);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const response = await this.privateTradingPostFullV1FillHistory(this.extend(request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "event_time": "1764945709702747558",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "is_buyer": true,
        //                "is_taker": false,
        //                "size": "0.001",
        //                "price": "90000.0",
        //                "mark_price": "90050.164063298",
        //                "index_price": "90089.803654938",
        //                "interest_rate": "0.0",
        //                "forward_price": "0.0",
        //                "realized_pnl": "0.0",
        //                "fee": "-0.00009",
        //                "fee_rate": "0.0",
        //                "trade_id": "65424692-2",
        //                "order_id": "0x01010105034cddc7000000006621285c",
        //                "venue": "ORDERBOOK",
        //                "client_order_id": "1375879248",
        //                "signer": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "broker": "UNSPECIFIED",
        //                "is_rpi": false
        //            },
        //            ...
        //        ],
        //        "next": ""
        //    }
        //
        const result = this.safeList(response, 'result', []);
        return this.parseTrades(result, undefined, since, limit);
    }
    /**
     * @method
     * @name grvt#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.grvt.io/trading_api/#positions-request
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        const request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            request['base'] = [];
            request['quote'] = [];
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                if (market['contract'] !== true) {
                    throw new errors.BadRequest(this.id + ' fetchPositions() supports contract markets only');
                }
                request['base'].push(market['baseId']);
                request['quote'].push(market['quoteId']);
            }
        }
        const response = await this.privateTradingPostFullV1Positions(this.extend(request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "event_time": "1765258069092857642",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "size": "0.001",
        //                "notional": "89.8169",
        //                "entry_price": "90000.0",
        //                "exit_price": "0.0",
        //                "mark_price": "89816.900008979",
        //                "unrealized_pnl": "-0.183099",
        //                "realized_pnl": "0.0",
        //                "total_pnl": "-0.183099",
        //                "roi": "-0.2034",
        //                "quote_index_price": "1.00017885",
        //                "est_liquidation_price": "77951.450008979",
        //                "leverage": "28.0",
        //                "cumulative_fee": "-0.00009",
        //                "cumulative_realized_funding_payment": "0.033862"
        //            }
        //        ]
        //    }
        //
        const result = this.safeList(response, 'result', []);
        return this.parsePositions(result, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //            {
        //                "event_time": "1765258069092857642",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "size": "0.001",
        //                "notional": "89.8169",
        //                "entry_price": "90000.0",
        //                "exit_price": "0.0",
        //                "mark_price": "89816.900008979",
        //                "unrealized_pnl": "-0.183099",
        //                "realized_pnl": "0.0",
        //                "total_pnl": "-0.183099",
        //                "roi": "-0.2034",
        //                "quote_index_price": "1.00017885",
        //                "est_liquidation_price": "77951.450008979",
        //                "leverage": "28.0",
        //                "cumulative_fee": "-0.00009",
        //                "cumulative_realized_funding_payment": "0.033862"
        //            }
        //
        const marketId = this.safeString(position, 'instrument');
        const timestamp = this.safeIntegerProduct(position, 'event_time', 0.000001);
        const sizeRaw = this.safeString(position, 'size');
        const isLong = (Precise["default"].stringGe(sizeRaw, '0'));
        const side = isLong ? 'long' : 'short';
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol(marketId, market),
            'notional': this.parseNumber(Precise["default"].stringAbs(this.safeString(position, 'notional'))),
            'marginMode': undefined,
            'liquidationPrice': this.safeNumber(position, 'est_liquidation_price'),
            'entryPrice': this.safeNumber(position, 'entry_price'),
            'unrealizedPnl': this.safeNumber(position, 'unrealized_pnl'),
            'realizedPnl': this.safeNumber(position, 'realized_pnl'),
            'percentage': undefined,
            'contracts': this.parseNumber(Precise["default"].stringAbs(sizeRaw)),
            'markPrice': this.safeNumber(position, 'mark_price'),
            'lastPrice': undefined,
            'side': side,
            'hedged': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': this.safeInteger(position, 'lastUpdateTime'),
            'maintenanceMargin': this.safeNumber(position, 'maintenanceMargin'),
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': this.safeNumber(position, 'initialMargin'),
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber(position, 'leverage'),
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name grvt#fetchLeverages
     * @description fetch the set leverage for all contract markets
     * @see https://api-docs.grvt.io/trading_api/#get-all-initial-leverage
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverages(symbols = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        const request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        const response = await this.privateTradingPostFullV1GetAllInitialLeverage(this.extend(request, params));
        //
        //    {
        //        "results": [
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "leverage": "10.0",
        //                "min_leverage": "1.0",
        //                "max_leverage": "50.0",
        //                "margin_type": "CROSS"
        //            },
        //
        const results = this.safeList(response, 'results', []);
        return this.parseLeverages(results, symbols);
    }
    /**
     * @method
     * @name grvt#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.grvt.io/trading_api/#set-initial-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarketsAndSignIn();
        const market = this.market(symbol);
        const request = {
            'sub_account_id': this.getSubAccountId(params),
            'instrument': market['id'],
            'leverage': this.numberToString(leverage),
        };
        const response = await this.privateTradingPostFullV1SetInitialLeverage(this.extend(request, params));
        //
        //    {
        //        "success": true
        //    }
        //
        return this.parseLeverage(response, market);
    }
    parseLeverage(leverage, market = undefined) {
        //
        // setLeverage
        //
        //     {
        //         "success": true
        //     }
        //
        // fetchLeverages
        //
        //     {
        //         "instrument": "AAVE_USDT_Perp",
        //         "leverage": "10.0",
        //         "min_leverage": "1.0",
        //         "max_leverage": "50.0",
        //         "margin_type": "CROSS"
        //     }
        //
        const marketId = this.safeString(leverage, 'instrument');
        const leverageValue = this.safeNumber(leverage, 'leverage');
        const marginType = this.safeStringLower(leverage, 'margin_type');
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': marginType,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    /**
     * @method
     * @name grvt#fetchMarginModes
     * @description fetches margin mode of the user
     * @see https://api-docs.grvt.io/trading_api/#get-all-initial-leverage
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    async fetchMarginModes(symbols = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        const request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        const response = await this.privateTradingPostFullV1GetAllInitialLeverage(this.extend(request, params));
        //
        //    {
        //        "results": [
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "leverage": "10.0",
        //                "min_leverage": "1.0",
        //                "max_leverage": "50.0",
        //                "margin_type": "CROSS"
        //            },
        //
        const results = this.safeList(response, 'results', []);
        return this.parseLeverages(results, symbols);
    }
    parseMarginMode(marginMode, market = undefined) {
        //
        // fetchMarginModes
        //
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "leverage": "10.0",
        //                "min_leverage": "1.0",
        //                "max_leverage": "50.0",
        //                "margin_type": "CROSS"
        //            },
        //
        const marketId = this.safeString(marginMode, 'symbol');
        return {
            'info': marginMode,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': this.safeStringLower(marginMode, 'margin_type'),
        };
    }
    /**
     * @method
     * @name grvt#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://api-docs.grvt.io/trading_api/#funding-payment-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchFundingHistory', symbol, since, limit, params, 1000);
        }
        let request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['base'] = [];
            request['base'].push(market['baseId']);
            request['quote'] = [];
            request['quote'].push(market['quoteId']);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const response = await this.privateTradingPostFullV1FundingPaymentHistory(this.extend(request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "event_time": "1765267200004987902",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "currency": "USDT",
        //                "amount": "-0.004522",
        //                "tx_id": "66625184"
        //            },
        //            ..
        //        ],
        //        "next": ""
        //    }
        //
        const result = this.safeList(response, 'result', []);
        return this.parseIncomes(result, market, since, limit);
    }
    parseIncome(income, market = undefined) {
        //
        //            {
        //                "event_time": "1765267200004987902",
        //                "sub_account_id": "2147050003876484",
        //                "instrument": "BTC_USDT_Perp",
        //                "currency": "USDT",
        //                "amount": "-0.004522",
        //                "tx_id": "66625184"
        //            }
        //
        const marketId = this.safeString(income, 'instrument');
        const currencyId = this.safeString(income, 'currency');
        const timestamp = this.safeIntegerProduct(income, 'event_time', 0.000001);
        return {
            'info': income,
            'symbol': this.safeSymbol(marketId, market),
            'code': this.safeCurrencyCode(currencyId),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(income, 'tx_id'),
            'amount': this.safeNumber(income, 'amount'),
        };
    }
    /**
     * @method
     * @name grvt#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.grvt.io/trading_api/#order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        let request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['base'] = [];
            request['base'].push(market['baseId']);
            request['quote'] = [];
            request['quote'].push(market['quoteId']);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        [request, params] = this.handleUntilOptionString('end_time', request, params, 1000000);
        if (since !== undefined) {
            request['start_time'] = this.numberToString(since * 1000000);
        }
        const response = await this.privateTradingPostFullV1OrderHistory(this.extend(request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "order_id": "0x01010105034cddc7000000006621285c",
        //                "sub_account_id": "2147050003876484",
        //                "is_market": false,
        //                "time_in_force": "GOOD_TILL_TIME",
        //                "post_only": false,
        //                "reduce_only": false,
        //                "legs": [
        //                    {
        //                        "instrument": "BTC_USDT_Perp",
        //                        "size": "0.001",
        //                        "limit_price": "90000.0",
        //                        "is_buying_asset": true
        //                    }
        //                ],
        //                "signature": {
        //                    "signer": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                    "r": "0x2d567b0a04525baf0bbd792db3bb3a28c1bcc5e95936f6dc2515a28ad8529313",
        //                    "s": "0x0bc2468d96c819c8de005aa7bebfb58eecb34dd7a1bae1e81e74c7b8bc4cddc7",
        //                    "v": "27",
        //                    "expiration": "1767455222801000000",
        //                    "nonce": "1375879248",
        //                    "chain_id": "0"
        //                },
        //                "metadata": {
        //                    "client_order_id": "1375879248",
        //                    "create_time": "1764863234474424590",
        //                    "trigger": {
        //                        "trigger_type": "UNSPECIFIED",
        //                        "tpsl": {
        //                            "trigger_by": "UNSPECIFIED",
        //                            "trigger_price": "0.0",
        //                            "close_position": false
        //                        }
        //                    },
        //                    "broker": "UNSPECIFIED",
        //                    "is_position_transfer": false,
        //                    "allow_crossing": false
        //                },
        //                "state": {
        //                    "status": "FILLED",
        //                    "reject_reason": "UNSPECIFIED",
        //                    "book_size": [
        //                        "0.0"
        //                    ],
        //                    "traded_size": [
        //                        "0.001"
        //                    ],
        //                    "update_time": "1764945709704912003",
        //                    "avg_fill_price": [
        //                        "90000.0"
        //                    ]
        //                }
        //            },
        //            ...
        //        ],
        //        "next": ""
        //    }
        //
        const result = this.safeList(response, 'result', []);
        return this.parseOrders(result, market, since, limit);
    }
    /**
     * @method
     * @name grvt#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-docs.grvt.io/trading_api/#open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        const request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        const response = await this.privateTradingPostFullV1OpenOrders(this.extend(request, params));
        //
        //    {
        //        "result": [
        //            {
        //                "order_id": "0x0101010503e693410000000069530a7d",
        //                "sub_account_id": "2147050003876484",
        //                "is_market": false,
        //                "time_in_force": "GOOD_TILL_TIME",
        //                "post_only": false,
        //                "reduce_only": false,
        //                "legs": [
        //                    {
        //                        "instrument": "BTC_USDT_Perp",
        //                        "size": "0.002",
        //                        "limit_price": "88123.0",
        //                        "is_buying_asset": true
        //                    }
        //                ],
        //                "signature": {
        //                    "signer": "0x0982ebb82523fd20d1347d59f5a989ed84caa4b5",
        //                    "r": "0x22b13e5bc7c8d6793db9d0adf6a51340437292baf83aa4f89a01a3c0c1fef4a8",
        //                    "s": "0x46ecd483126c388cc933022979a9636670f64af3773d04a84ecbeac423e69341",
        //                    "v": "28",
        //                    "expiration": "1767871961406000000",
        //                    "nonce": "588129369",
        //                    "chain_id": "0"
        //                },
        //                "metadata": {
        //                    "client_order_id": "588129369",
        //                    "create_time": "1765279966899943792",
        //                    "trigger": {
        //                        "trigger_type": "UNSPECIFIED",
        //                        "tpsl": {
        //                            "trigger_by": "UNSPECIFIED",
        //                            "trigger_price": "0.0",
        //                            "close_position": false
        //                        }
        //                    },
        //                    "broker": "UNSPECIFIED",
        //                    "is_position_transfer": false,
        //                    "allow_crossing": false
        //                },
        //                "state": {
        //                    "status": "OPEN",
        //                    "reject_reason": "UNSPECIFIED",
        //                    "book_size": [
        //                        "0.002"
        //                    ],
        //                    "traded_size": [
        //                        "0.0"
        //                    ],
        //                    "update_time": "1765279966899943792",
        //                    "avg_fill_price": [
        //                        "0.0"
        //                    ]
        //                }
        //            }
        //        ]
        //    }
        //
        const result = this.safeList(response, 'result', []);
        return this.parseOrders(result, undefined, since, limit);
    }
    /**
     * @method
     * @name grvt#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs.grvt.io/trading_api/#get-order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        const request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            params = this.omit(params, 'clientOrderId', 'client_order_id');
            request['client_order_id'] = clientOrderId;
        }
        else {
            request['order_id'] = id;
        }
        const response = await this.privateTradingPostFullV1Order(this.extend(request, params));
        //
        //    {
        //        "result": {
        //            "order_id": "0x01010105034cddc7000000006621285c",
        //            "sub_account_id": "2147050003876484",
        //            "is_market": false,
        //            "time_in_force": "GOOD_TILL_TIME",
        //            "post_only": false,
        //            "reduce_only": false,
        //            "legs": [
        //                {
        //                    "instrument": "BTC_USDT_Perp",
        //                    "size": "0.001",
        //                    "limit_price": "90000.0",
        //                    "is_buying_asset": true
        //                }
        //            ],
        //            "signature": {
        //                "signer": "0x42c9f56f2c9da534f64b8806d64813b29c62a01d",
        //                "r": "0x2d567b0a04525baf0bbd792db3bb3a28c1bcc5e95936f6dc2515a28ad8529313",
        //                "s": "0x0bc2468d96c819c8de005aa7bebfb58eecb34dd7a1bae1e81e74c7b8bc4cddc7",
        //                "v": "27",
        //                "expiration": "1767455222801000000",
        //                "nonce": "1375879248",
        //                "chain_id": "0"
        //            },
        //            "metadata": {
        //                "client_order_id": "1375879248",
        //                "create_time": "1764863234474424590",
        //                "trigger": {
        //                    "trigger_type": "UNSPECIFIED",
        //                    "tpsl": {
        //                        "trigger_by": "UNSPECIFIED",
        //                        "trigger_price": "0.0",
        //                        "close_position": false
        //                    }
        //                },
        //                "broker": "UNSPECIFIED",
        //                "is_position_transfer": false,
        //                "allow_crossing": false
        //            },
        //            "state": {
        //                "status": "FILLED",
        //                "reject_reason": "UNSPECIFIED",
        //                "book_size": [
        //                    "0.0"
        //                ],
        //                "traded_size": [
        //                    "0.001"
        //                ],
        //                "update_time": "1764945709704912003",
        //                "avg_fill_price": [
        //                    "90000.0"
        //                ]
        //            }
        //        }
        //    }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseOrder(result);
    }
    parseOrder(order, market = undefined) {
        //
        // fetchOrders, fetchOpenOrders, fetchOrder, createOrder
        //
        //           {
        //                "order_id": "0x0101010503e693410000000069530a7d",
        //                "sub_account_id": "2147050003876484",
        //                "is_market": false,
        //                "time_in_force": "GOOD_TILL_TIME",
        //                "post_only": false,
        //                "reduce_only": false,
        //                "legs": [
        //                    {
        //                        "instrument": "BTC_USDT_Perp",
        //                        "size": "0.002",
        //                        "limit_price": "88123.0",
        //                        "is_buying_asset": true
        //                    }
        //                ],
        //                "signature": {
        //                    "signer": "0x0982ebb82523fd20d1347d59f5a989ed84caa4b5",
        //                    "r": "0x22b13e5bc7c8d6793db9d0adf6a51340437292baf83aa4f89a01a3c0c1fef4a8",
        //                    "s": "0x46ecd483126c388cc933022979a9636670f64af3773d04a84ecbeac423e69341",
        //                    "v": "28",
        //                    "expiration": "1767871961406000000",
        //                    "nonce": "588129369",
        //                    "chain_id": "0"
        //                },
        //                "metadata": {
        //                    "client_order_id": "588129369",
        //                    "create_time": "1765279966899943792",
        //                    "trigger": {
        //                        "trigger_type": "UNSPECIFIED",
        //                        "tpsl": {
        //                            "trigger_by": "UNSPECIFIED",
        //                            "trigger_price": "0.0",
        //                            "close_position": false
        //                        }
        //                    },
        //                    "broker": "UNSPECIFIED",
        //                    "is_position_transfer": false,
        //                    "allow_crossing": false
        //                },
        //                "state": {
        //                    "status": "OPEN",
        //                    "reject_reason": "UNSPECIFIED",
        //                    "book_size": [
        //                        "0.002"
        //                    ],
        //                    "traded_size": [
        //                        "0.0"
        //                    ],
        //                    "update_time": "1765279966899943792",
        //                    "avg_fill_price": [
        //                        "0.0"
        //                    ]
        //                },
        //                "builder": "0x00",
        //                "builder_fee": "0.0"
        //            }
        //
        // cancelOrder, cancelAllOrders
        //
        //    {
        //        "ack": true
        //    }
        //
        if ('ack' in order) {
            return this.safeOrder({
                'info': order,
                'id': undefined,
            });
        }
        const isMarket = this.safeBool(order, 'is_market');
        const orderType = isMarket ? 'market' : 'limit';
        const isPostOnly = this.safeBool(order, 'post_only');
        const isReduceOnly = this.safeBool(order, 'reduce_only');
        const timeInForceRaw = this.safeString(order, 'time_in_force');
        const timeInForce = isPostOnly ? 'PO' : this.parseTimeInForce(timeInForceRaw);
        let size = undefined;
        let side = undefined;
        let price = undefined;
        let filled = undefined;
        let avgPrice = undefined;
        const legs = this.safeList(order, 'legs');
        const metadata = this.safeDict(order, 'metadata', {});
        const stateObj = this.safeDict(order, 'state', {});
        const filledAmounts = this.safeList(stateObj, 'traded_size', []);
        const avgPrices = this.safeList(stateObj, 'avg_fill_price', []);
        const primaryOrderIndex = 0;
        const firstLeg = this.safeDict(legs, primaryOrderIndex);
        if (firstLeg !== undefined) {
            const marketId = this.safeString(firstLeg, 'instrument');
            market = this.safeMarket(marketId, market);
            size = this.safeString(firstLeg, 'size');
            side = this.safeBool(firstLeg, 'is_buying_asset') ? 'buy' : 'sell';
            price = this.safeString(firstLeg, 'limit_price');
            filled = this.safeString(filledAmounts, primaryOrderIndex);
            avgPrice = this.safeString(avgPrices, primaryOrderIndex);
        }
        const timestamp = this.safeIntegerProduct(metadata, 'create_time', 0.000001);
        // const triggerDetails = this.safeDict (metadata, 'trigger', {});
        const legsLength = legs.length;
        return this.safeOrder({
            'isMultiLeg': (legsLength > 1),
            'id': this.safeString(order, 'order_id'),
            'clientOrderId': this.safeString(metadata, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimeStamp': undefined,
            'lastUpdateTimestamp': this.safeIntegerProduct(stateObj, 'update_time', 0.000001),
            'status': this.parseOrderStatus(this.safeString(stateObj, 'status')),
            'symbol': market['symbol'],
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': isPostOnly,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'cost': undefined,
            'average': avgPrice,
            'amount': size,
            'filled': filled,
            'remaining': undefined,
            'trades': undefined,
            'fees': undefined,
            'reduceOnly': isReduceOnly,
            'info': order,
        }, market);
    }
    parseTimeInForce(type) {
        const types = {
            'GOOD_TILL_TIME': 'GTC',
            'IMMEDIATE_OR_CANCEL': 'IOC',
            'FILL_OR_KILL': 'FOK',
            // exchange specific types
            'ALL_OR_NONE': 'ALL_OR_NONE',
            'RETAIL_PRICE_IMPROVEMENT': 'RETAIL_PRICE_IMPROVEMENT',
        };
        return this.safeStringUpper(types, type, type);
    }
    timeInForceToInt(timeInForce) {
        const timeInForces = {
            'GOOD_TILL_TIME': 1,
            'ALL_OR_NONE': 2,
            'IMMEDIATE_OR_CANCEL': 3,
            'FILL_OR_KILL': 4,
            'RETAIL_PRICE_IMPROVEMENT': 5,
        };
        return this.safeInteger(timeInForces, timeInForce, 0);
    }
    parseOrderStatus(status) {
        const statuses = {
            'PENDING': 'pending',
            'OPEN': 'open',
            'FILLED': 'closed',
            'REJECTED': 'rejected',
            'CANCELLED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name grvt#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api-docs.grvt.io/trading_api/#cancel-all-orders
     * @param {string} symbol cancel alls open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        const request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['base'] = [];
            request['base'].push(market['baseId']);
            request['quote'] = [];
            request['quote'].push(market['quoteId']);
        }
        const response = await this.privateTradingPostFullV1CancelAllOrders(this.extend(request, params));
        //
        //    {
        //        "result": {
        //            "ack": true
        //        }
        //    }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseOrders([result], undefined);
    }
    /**
     * @method
     * @name grvt#cancelOrder
     * @description cancels an open order
     * @see https://api-docs.grvt.io/trading_api/#cancel-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarketsAndSignIn();
        const request = {
            'sub_account_id': this.getSubAccountId(params),
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            params = this.omit(params, 'clientOrderId');
            request['client_order_id'] = clientOrderId;
        }
        else {
            request['order_id'] = id;
        }
        const response = await this.privateTradingPostFullV1CancelOrder(this.extend(request, params));
        //
        //    {
        //        "result": {
        //            "ack": true
        //        }
        //    }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseOrder(result);
    }
    eipDomainData() {
        //     GrvtEnv.DEV.value: 327,
        //     GrvtEnv.STAGING.value: 327,
        //     GrvtEnv.TESTNET.value: 326,
        //     GrvtEnv.PROD.value: 325,
        return {
            'name': 'GRVT Exchange',
            'version': '0',
            'chainId': this.isSandboxModeEnabled ? 326 : 325,
        };
    }
    feeAmountMultiplier() {
        return this.convertToBigIntCustom('10000'); // multiply needed https://t.me/c/3396937126/88
    }
    createSignedRequest(request, structureType, currencyObj = undefined, signerAddress = undefined) {
        let messageData = undefined;
        if (structureType === 'EIP712_TRANSFER_TYPE') {
            const amountMultiplier = this.convertToBigIntCustom('1000000');
            const amountInt = request['num_tokens'] * amountMultiplier;
            messageData = {
                'fromAccount': request['from_account_id'],
                'fromSubAccount': request['from_sub_account_id'],
                'toAccount': request['to_account_id'],
                'toSubAccount': request['to_sub_account_id'],
                'tokenCurrency': currencyObj['numericId'],
                'numTokens': this.parseToInt(amountInt),
                'nonce': request['signature']['nonce'],
                'expiration': request['signature']['expiration'],
            };
        }
        else if (structureType === 'EIP712_WITHDRAWAL_TYPE') {
            const amountMultiplier = this.convertToBigIntCustom('1000000');
            messageData = {
                'fromAccount': request['from_account_id'],
                'toEthAddress': request['to_eth_address'],
                'tokenCurrency': currencyObj['numericId'],
                'numTokens': this.parseToInt(request['num_tokens'] * amountMultiplier),
                'nonce': request['signature']['nonce'],
                'expiration': request['signature']['expiration'],
            };
        }
        else if (structureType === 'EIP712_ORDER_TYPE' || structureType === 'EIP712_ORDER_WITH_BUILDER_TYPE') {
            messageData = this.eipMessageForOrder(request, structureType);
        }
        else if (structureType === 'EIP712_BUILDER_APPROVAL_TYPE') {
            const amountMultiplier = this.convertToBigIntCustom(this.feeAmountMultiplier());
            messageData = {
                'mainAccountID': request['main_account_id'],
                'builderAccountID': request['builder_account_id'],
                'maxFutureFeeRate': this.parseToInt(parseFloat(request['max_futures_fee_rate']) * amountMultiplier),
                'maxSpotFeeRate': this.parseToInt(parseFloat(request['max_spot_fee_rate']) * amountMultiplier),
                'nonce': request['signature']['nonce'],
                'expiration': request['signature']['expiration'],
            };
        }
        else if (structureType === 'EIP712_WALLETLOGIN_TYPE') {
            messageData = {
                'signer': request['address'],
                'nonce': request['signature']['nonce'],
                'expiration': request['signature']['expiration'],
            };
        }
        const domainData = this.eipDomainData();
        const definitions = this.eipDefinitions();
        const ethEncodedMessage = this.ethEncodeStructuredData(domainData, definitions[structureType], messageData);
        const ethEncodedMessageHashed = '0x' + this.hash(ethEncodedMessage, sha3.keccak_256, 'hex');
        const usesPrivKey = this.usesPrivateKey(); // py transpiler needs this line separated
        const secretOrPrivkey = usesPrivKey ? this.privateKey : this.secret;
        const privateKeyWithoutZero = this.remove0xPrefix(secretOrPrivkey);
        const signature = crypto.ecdsa(this.remove0xPrefix(ethEncodedMessageHashed), privateKeyWithoutZero, secp256k1.secp256k1, undefined);
        request['signature']['r'] = this.formatSignatureRS(signature['r']);
        request['signature']['s'] = this.formatSignatureRS(signature['s']);
        request['signature']['v'] = this.sum(27, signature['v']);
        request['signature']['signer'] = (signerAddress === undefined) ? this.ethGetAddressFromPrivateKey('0x' + privateKeyWithoutZero) : signerAddress;
        return request;
    }
    formatSignatureRS(value) {
        const padded = value.padStart(64, '0');
        if (padded.startsWith('0x')) {
            return padded;
        }
        else {
            return '0x' + padded;
        }
    }
    defaultSignature() {
        const expiration = this.milliseconds() * 1000000 + 1000000 * this.safeInteger(this.options, 'expirationSeconds', 30) * 1000;
        return {
            'signer': '',
            'r': '',
            's': '',
            'v': 0,
            'expiration': expiration.toString(),
            'nonce': this.nonce(),
            'chain_id': this.isSandboxModeEnabled ? '326' : '325',
        };
    }
    handleUntilOptionString(key, request, params, multiplier = 1) {
        const until = this.safeInteger2(params, 'until', 'till');
        if (until !== undefined) {
            request[key] = this.numberToString(this.parseToInt(until * multiplier));
            params = this.omit(params, ['until', 'till']);
        }
        return [request, params];
    }
    requestId() {
        const requestId = this.sum(this.safeInteger(this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api'][api] + path;
        let queryString = '';
        if (method === 'GET') {
            if (Object.keys(query).length) {
                queryString = this.urlencode(query);
                url += '?' + queryString;
            }
        }
        else if (method === 'POST') {
            body = this.json(params);
        }
        const isPrivate = api.startsWith('private');
        if (isPrivate) {
            this.checkRequiredCredentials();
            if (queryString !== '') {
                path = path + '?' + queryString;
            }
            headers = {
                'Content-Type': 'application/json',
            };
            if (path.endsWith('auth/api_key/login') || path.endsWith('auth/wallet/login')) {
                headers['Cookie'] = 'rm=true;';
            }
            else {
                const accountId = this.safeString(this.options, 'AuthAccountId');
                const cookieValue = this.safeString(this.options, 'AuthCookieValue');
                if (cookieValue === undefined || accountId === undefined) {
                    throw new errors.AuthenticationError(this.id + ' : at first, you need to authenticate with exchange using signIn() method.');
                }
                headers['Cookie'] = cookieValue;
                headers['X-Grvt-Account-Id'] = accountId;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (url.endsWith('auth/api_key/login') || url.endsWith('auth/wallet/login')) {
            const accountId = this.safeString2(headers, 'X-Grvt-Account-Id', 'x-grvt-account-id');
            this.options['AuthAccountId'] = accountId;
            const cookie = this.safeString2(headers, 'Set-Cookie', 'set-cookie');
            if (cookie !== undefined) {
                const cookieValue = cookie.split(';')[0];
                this.options['AuthCookieValue'] = cookieValue;
            }
            if (this.options['AuthCookieValue'] === undefined || this.options['AuthAccountId'] === undefined) {
                throw new errors.AuthenticationError(this.id + ' signIn() failed to receive auth-cookie or account-id');
            }
        }
        else {
            const errorCode = this.safeString(response, 'code');
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                throw new errors.ExchangeError(feedback);
            }
            else {
                const message = this.safeString(response, 'message');
                if (message !== undefined) {
                    const feedback = this.id + ' ' + body;
                    this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
                    throw new errors.ExchangeError(feedback);
                }
                else {
                    const status = this.safeString(response, 'status');
                    if (status !== undefined && status !== 'success') {
                        const feedback = this.id + ' ' + body;
                        throw new errors.ExchangeError(feedback);
                    }
                }
            }
        }
        return undefined;
    }
}

exports["default"] = grvt;
