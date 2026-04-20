'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lighter$1 = require('./abstract/lighter.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var crypto = require('./base/functions/crypto.js');
var sha3 = require('./static_dependencies/noble-hashes/sha3.js');
var secp256k1 = require('./static_dependencies/noble-curves/secp256k1.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class lighter
 * @augments Exchange
 */
class lighter extends lighter$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'lighter',
            'name': 'Lighter',
            'countries': [],
            'version': 'v1',
            'rateLimit': 1000,
            'certified': false,
            'pro': true,
            'dex': true,
            'quoteJsonNumbers': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchAllGreeks': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': true,
                'setMarginMode': true,
                'setPositionMode': false,
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
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'hostname': 'zklighter.elliot.ai',
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/ff1aaf96-bffb-4545-a750-5eba716e75d0',
                'api': {
                    'root': 'https://mainnet.{hostname}',
                    'public': 'https://mainnet.{hostname}',
                    'private': 'https://mainnet.{hostname}',
                },
                'test': {
                    'root': 'https://testnet.{hostname}',
                    'public': 'https://testnet.{hostname}',
                    'private': 'https://testnet.{hostname}',
                },
                'www': 'https://lighter.xyz/',
                'doc': 'https://apidocs.lighter.xyz/',
                'fees': 'https://docs.lighter.xyz/perpetual-futures/fees',
                'referral': {
                    'url': 'app.lighter.xyz/?referral=715955W9',
                    'discount': 0.1, // user gets 10% of the points
                },
            },
            'api': {
                'root': {
                    'get': {
                        // root
                        '': 1,
                        'info': 1,
                    },
                },
                'public': {
                    'get': {
                        // account
                        'account': 1,
                        'accountsByL1Address': 1,
                        'apikeys': 1,
                        // order
                        'exchangeStats': 1,
                        'assetDetails': 1,
                        'orderBookDetails': 1,
                        'orderBookOrders': 1,
                        'orderBooks': 1,
                        'recentTrades': 1,
                        // transaction
                        'blockTxs': 1,
                        'nextNonce': 1,
                        'tx': 1,
                        'txFromL1TxHash': 1,
                        'txs': 1,
                        // announcement
                        'announcement': 1,
                        // block
                        'block': 1,
                        'blocks': 1,
                        'currentHeight': 1,
                        // candlestick
                        'candles': 1,
                        'fundings': 1,
                        // bridge
                        'fastbridge/info': 1,
                        // funding
                        'funding-rates': 1,
                        // info
                        'withdrawalDelay': 1,
                    },
                    'post': {
                        // transaction
                        'sendTx': 1,
                        'sendTxBatch': 1,
                    },
                },
                'private': {
                    'get': {
                        // account
                        'accountLimits': 1,
                        'accountMetadata': 1,
                        'pnl': 1,
                        'l1Metadata': 1,
                        'liquidations': 1,
                        'positionFunding': 1,
                        'publicPoolsMetadata': 1,
                        // order
                        'accountActiveOrders': 1,
                        'accountInactiveOrders': 1,
                        'export': 1,
                        'trades': 1,
                        // transaction
                        'accountTxs': 1,
                        'deposit/history': 1,
                        'transfer/history': 1,
                        'withdraw/history': 1,
                        // referral
                        'referral/points': 1,
                        // info
                        'transferFeeInfo': 1,
                    },
                    'post': {
                        // account
                        'changeAccountTier': 1,
                        // notification
                        'notification/ack': 1,
                    },
                },
            },
            'httpExceptions': {},
            'exceptions': {
                'exact': {
                    '21146': errors.ExchangeError,
                    '21500': errors.ExchangeError,
                    '21501': errors.ExchangeError,
                    '21502': errors.ExchangeError,
                    '21503': errors.ExchangeError,
                    '21504': errors.ExchangeError,
                    '21505': errors.ExchangeError,
                    '21506': errors.ExchangeError,
                    '21507': errors.ExchangeError,
                    '21508': errors.ExchangeError,
                    '21511': errors.ExchangeError,
                    '21512': errors.ExchangeError,
                    '21600': errors.InvalidOrder,
                    '21601': errors.InvalidOrder,
                    '21602': errors.InvalidOrder,
                    '21603': errors.InvalidOrder,
                    '21604': errors.InvalidOrder,
                    '21605': errors.InvalidOrder,
                    '21606': errors.InvalidOrder,
                    '21607': errors.InvalidOrder,
                    '21608': errors.InvalidOrder,
                    '21611': errors.InvalidOrder,
                    '21612': errors.InvalidOrder,
                    '21613': errors.InvalidOrder,
                    '21614': errors.InvalidOrder,
                    '21700': errors.InvalidOrder,
                    '21701': errors.InvalidOrder,
                    '21702': errors.InvalidOrder,
                    '21703': errors.InvalidOrder,
                    '21704': errors.InvalidOrder,
                    '21705': errors.InvalidOrder,
                    '21706': errors.InvalidOrder,
                    '21707': errors.InvalidOrder,
                    '21708': errors.InvalidOrder,
                    '21709': errors.InvalidOrder,
                    '21710': errors.InvalidOrder,
                    '21711': errors.InvalidOrder,
                    '21712': errors.InvalidOrder,
                    '21713': errors.InvalidOrder,
                    '21714': errors.InvalidOrder,
                    '21715': errors.InvalidOrder,
                    '21716': errors.InvalidOrder,
                    '21717': errors.InvalidOrder,
                    '21718': errors.InvalidOrder,
                    '21719': errors.InvalidOrder,
                    '21720': errors.InvalidOrder,
                    '21721': errors.InvalidOrder,
                    '21722': errors.InvalidOrder,
                    '21723': errors.InvalidOrder,
                    '21724': errors.InvalidOrder,
                    '21725': errors.InvalidOrder,
                    '21726': errors.InvalidOrder,
                    '21727': errors.InvalidOrder,
                    '21728': errors.InvalidOrder,
                    '21729': errors.InvalidOrder,
                    '21730': errors.InvalidOrder,
                    '21731': errors.InvalidOrder,
                    '21732': errors.InvalidOrder,
                    '21733': errors.InvalidOrder,
                    '21734': errors.InvalidOrder,
                    '21735': errors.InvalidOrder,
                    '21736': errors.InvalidOrder,
                    '21737': errors.InvalidOrder,
                    '21738': errors.InvalidOrder,
                    '21739': errors.InvalidOrder,
                    '21740': errors.InvalidOrder,
                    '21901': errors.InvalidOrder,
                    '21902': errors.InvalidOrder,
                    '21903': errors.InvalidOrder,
                    '21904': errors.InvalidOrder,
                    '21905': errors.InvalidOrder,
                    '21906': errors.InvalidOrder,
                    '23000': errors.RateLimitExceeded,
                    '23001': errors.RateLimitExceeded,
                    '23002': errors.RateLimitExceeded,
                    '23003': errors.RateLimitExceeded, // Too Many Connections!
                },
                'broad': {},
            },
            'fees': {
                'taker': 0,
                'maker': 0,
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': false,
                'privateKey': true,
                'password': false,
            },
            'precisionMode': number.TICK_SIZE,
            'commonCurrencies': {},
            'options': {
                'defaultType': 'swap',
                'builderFee': true,
                'chainId': 304,
                'accountIndex': undefined,
                'apiKeyIndex': undefined,
                'lighterPrivateKey': undefined,
                'wasmExecPath': undefined,
                'libraryPath': undefined,
                'integratorAccountIndex': 718718,
                'integratorMakerFee': 1000,
                'integratorTakerFee': 1000,
                'authDeadlineExpiry': 28800,
                'authDeadlineMinimumRemaining': 60,
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                },
            },
        });
    }
    async loadAccount(chainId, privateKey, apiKeyIndex, accountIndex, params = {}) {
        this.initAuthObject(accountIndex, apiKeyIndex);
        const cachedAuths = this.safeDict(this.options['auths'][accountIndex], apiKeyIndex);
        let signer = this.safeValue(cachedAuths, 'signer');
        if (signer !== undefined) {
            return signer;
        }
        let libraryPath = undefined;
        [libraryPath, params] = this.handleOptionAndParams(params, 'loadAccount', 'libraryPath');
        const lighterPrivateKeyIsSet = (privateKey !== undefined) && (privateKey !== '');
        if (lighterPrivateKeyIsSet && (libraryPath !== undefined) && (apiKeyIndex !== undefined) && (accountIndex !== undefined)) {
            // load lighter library, and create lighter client
            signer = await this.loadLighterLibrary(libraryPath, chainId, privateKey, this.parseToInt(apiKeyIndex), this.parseToInt(accountIndex), true);
            this.options['auths'][accountIndex][apiKeyIndex]['signer'] = signer;
            return signer;
        }
        const privateKeyIsSet = (this.privateKey !== undefined) && (this.privateKey !== '');
        if (privateKeyIsSet && (apiKeyIndex !== undefined) && (accountIndex !== undefined)) {
            if (this.privateKey.length > 66) {
                throw new errors.NotSupported(this.id + ' after the latest update (v4.5.50), CCXT now expects the l1 private key to be provided in the credentials. Please check for more details: https://github.com/ccxt/ccxt/wiki/FAQ#how-to-use-the-lighter-exchange-in-ccxt');
            }
            // load lighter library without creating lighter client
            signer = await this.loadLighterLibrary(libraryPath, chainId, '', this.parseToInt(apiKeyIndex), this.parseToInt(accountIndex), false);
            this.options['auths'][accountIndex][apiKeyIndex]['signer'] = signer;
            const res = await this.changeApiKey();
            await this.handleBuilderFeeApproval(this.parseToInt(accountIndex), this.parseToInt(apiKeyIndex));
            return res;
        }
        return signer;
    }
    initAuthObject(strAccountIndex, strApiKeyIndex) {
        if (!('auths' in this.options)) {
            this.options['auths'] = {};
        }
        if (!(strAccountIndex in this.options['auths'])) {
            this.options['auths'][strAccountIndex] = {};
        }
        if (!(strApiKeyIndex in this.options['auths'][strAccountIndex])) {
            this.options['auths'][strAccountIndex][strApiKeyIndex] = {
                'signer': undefined,
                'lighterPrivateKey': undefined,
                'deadline': undefined,
                'token': undefined,
            };
        }
    }
    getLighterPrivateKey(strAccountIndex, strApiKeyIndex) {
        if (!('auths' in this.options)) {
            return undefined;
        }
        if (!(strAccountIndex in this.options['auths'])) {
            return undefined;
        }
        if (!(strApiKeyIndex in this.options['auths'][strAccountIndex])) {
            return undefined;
        }
        if (!('lighterPrivateKey' in this.options['auths'][strAccountIndex][strApiKeyIndex])) {
            return undefined;
        }
        return this.options['auths'][strAccountIndex][strApiKeyIndex]['lighterPrivateKey'];
    }
    /**
     * @method
     * @name lighter#preLoadLighterLibrary
     * @description if the required credentials are available in options, it will pre-load the lighter Signer to avoid delaying sensitive calls like createOrder the first time they're executed
     * @param params
     * @returns {boolean} true if the signer was loaded, false otherwise
     */
    async preLoadLighterLibrary(params = {}) {
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'loadAccount', 'apiKeyIndex', 'api_key_index');
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'loadAccount', 'accountIndex', 'account_index');
        if (accountIndex === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' requires accountIndex or account_index');
        }
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        this.initAuthObject(strAccountIndex, strApiKeyIndex);
        let signer = this.safeDict(this.options['auths'][strAccountIndex][strApiKeyIndex], 'signer');
        if (signer !== undefined) {
            return true;
        }
        signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex);
        await this.handleBuilderFeeApproval(accountIndex, apiKeyIndex);
        return (signer !== undefined);
    }
    handleApiKeyIndex(params, methodName1, optionName1, optionName2, defaultValue = undefined) {
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleOptionAndParams2(params, methodName1, optionName1, optionName2, defaultValue);
        if ((apiKeyIndex === undefined) || (apiKeyIndex < 4) || (apiKeyIndex > 254)) {
            // apiKeyIndex = this.randNumber (2);
            apiKeyIndex = 254;
            this.options['apiKeyIndex'] = apiKeyIndex; // default to a value to avoid overriding other keys
        }
        return [this.parseToInt(apiKeyIndex), params];
    }
    async handleAccountIndex(params, methodName1, optionName1, optionName2, defaultValue = undefined) {
        let accountIndex = undefined;
        [accountIndex, params] = this.handleOptionAndParams2(params, methodName1, optionName1, optionName2, defaultValue);
        if (accountIndex === undefined) {
            let walletAddress = this.walletAddress;
            if (this.privateKey !== undefined) {
                if (this.privateKey.length > 66) {
                    throw new errors.NotSupported(this.id + ' after the latest update (v4.5.50), CCXT now expects the l1 private key to be provided in the credentials. Please check for more details: https://github.com/ccxt/ccxt/wiki/FAQ#how-to-use-the-lighter-exchange-in-ccxt');
                }
                walletAddress = this.ethGetAddressFromPrivateKey(this.privateKey);
            }
            if (walletAddress === undefined || walletAddress === '') {
                throw new errors.ArgumentsRequired(this.id + ' ' + methodName1 + '() requires an ' + optionName1 + '/' + optionName2 + ' parameter or walletAddress to fetch accountIndex. Alternatively set privateKey in credentials to enable automatic walletAddress detection.');
            }
            const res = await this.publicGetAccountsByL1Address({ 'l1_address': walletAddress });
            //
            // {
            //     "code": 200,
            //     "l1_address": "0xaaaabbbb....ccccdddd",
            //     "sub_accounts": [
            //         {
            //             "code": 0,
            //             "account_type": 0,
            //             "index": 666666,
            //             "l1_address": "0xaaaabbbb....ccccdddd",
            //             "cancel_all_time": 0,
            //             "total_order_count": 0,
            //             "total_isolated_order_count": 0,
            //             "pending_order_count": 0,
            //             "available_balance": "",
            //             "status": 0,
            //             "collateral": "40",
            //             "transaction_time": 0,
            //             "account_trading_mode": 0
            //         }
            //     ]
            // }
            //
            const subAccounts = this.safeList(res, 'sub_accounts');
            if (Array.isArray(subAccounts)) {
                const account = this.safeDict(subAccounts, 0);
                if (account === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' ' + methodName1 + '() requires an ' + optionName1 + ' or ' + optionName2 + ' parameter');
                }
                accountIndex = account['index'];
                this.options['accountIndex'] = accountIndex;
            }
        }
        return [this.parseToInt(accountIndex), params];
    }
    async createSubAccount(name, params = {}) {
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'createSubAccount', 'apiKeyIndex', 'api_key_index');
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'createSubAccount', 'accountIndex', 'account_index');
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const [txType, txInfo] = this.lighterSignCreateSubAccount(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        return await this.publicPostSendTx(request);
    }
    createAuth(params = {}) {
        // don't omit [accountIndex, apiKeyIndex], request may need them
        let apiKeyIndex = this.safeString2(params, 'apiKeyIndex', 'api_key_index');
        if (apiKeyIndex === undefined) {
            const res = this.handleOptionAndParams2({}, 'createAuth', 'apiKeyIndex', 'api_key_index');
            apiKeyIndex = this.safeString(res, 0);
        }
        let accountIndex = this.safeString2(params, 'accountIndex', 'account_index');
        if (accountIndex === undefined) {
            const res = this.handleOptionAndParams2({}, 'createAuth', 'accountIndex', 'account_index');
            accountIndex = this.safeString(res, 0);
        }
        const auths = this.safeDict(this.options, 'auths');
        const accountAuths = this.safeDict(auths, accountIndex);
        const cachedAuth = this.safeDict(accountAuths, apiKeyIndex);
        const cachedDeadline = this.safeInteger(cachedAuth, 'deadline');
        if (cachedDeadline !== undefined) {
            const minimumDeadline = this.seconds() + this.safeInteger(this.options, 'authDeadlineMinimumRemaining');
            if (cachedDeadline >= minimumDeadline) {
                return this.safeString(cachedAuth, 'token');
            }
        }
        const deadline = this.seconds() + this.safeInteger(this.options, 'authDeadlineExpiry');
        const request = {
            'deadline': deadline,
            'api_key_index': this.parseToInt(apiKeyIndex),
            'account_index': this.parseToInt(accountIndex),
        };
        const token = this.lighterCreateAuthToken(this.options['auths'][accountIndex][apiKeyIndex]['signer'], request);
        this.options['auths'][accountIndex][apiKeyIndex]['deadline'] = deadline;
        this.options['auths'][accountIndex][apiKeyIndex]['token'] = token;
        return token;
    }
    pow(n, m) {
        let r = Precise["default"].stringMul(n, '1');
        const c = this.parseToInt(m);
        if (c < 0) {
            throw new errors.BadRequest(this.id + ' pow() requires m > 0.');
        }
        if (c === 0) {
            return '1';
        }
        if (c > 100) {
            throw new errors.BadRequest(this.id + ' pow() requires m < 100.');
        }
        for (let i = 1; i < c; i++) {
            r = Precise["default"].stringMul(r, n);
        }
        return r;
    }
    hashMessage(message) {
        const binaryMessage = this.encode(message);
        const binaryMessageLength = this.binaryLength(binaryMessage);
        const x19 = this.base16ToBinary('19');
        const newline = this.base16ToBinary('0a');
        const prefix = this.binaryConcat(x19, this.encode('Ethereum Signed Message:'), newline, this.encode(this.numberToString(binaryMessageLength)));
        return '0x' + this.hash(this.binaryConcat(prefix, binaryMessage), sha3.keccak_256, 'hex');
    }
    signHash(hash, privateKey) {
        this.checkRequiredCredentials();
        const signature = crypto.ecdsa(hash.slice(-64), privateKey.slice(-64), secp256k1.secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = this.intToBase16(this.sum(27, signature['v']));
        return '0x' + r.padStart(64, '0') + s.padStart(64, '0') + v;
    }
    signL1AndPrepareTxInfo(txInfo, message, privateKey) {
        const hashMessage = this.hashMessage(message);
        const signature = this.signHash(hashMessage, privateKey);
        const decTxInfo = this.parseJson(txInfo);
        decTxInfo['L1Sig'] = signature;
        return this.json(decTxInfo);
    }
    async handleBuilderFeeApproval(accountIndex, apiKeyIndex) {
        const buildFee = this.safeBool(this.options, 'builderFee', true);
        if (!buildFee) {
            return false;
        }
        const approvedBuilderFee = this.safeBool(this.options, 'approvedBuilderFee', false);
        if (approvedBuilderFee) {
            return true;
        }
        try {
            const builder = this.safeInteger(this.options, 'integratorAccountIndex', 718718);
            const takerFeeRate = this.safeInteger(this.options, 'integratorTakerFee', 1000);
            const makerFeeRate = this.safeInteger(this.options, 'integratorMakerFee', 1000);
            await this.approveBuilderFee(builder, takerFeeRate, makerFeeRate, accountIndex, apiKeyIndex);
            this.options['approvedBuilderFee'] = true;
        }
        catch (e) {
            this.options['builderFee'] = false;
        }
        return true;
    }
    async approveBuilderFee(builder, takerFeeRate, makerFeeRate, accountIndex, apiKeyIndex, params = {}) {
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const expiry = this.milliseconds() + 365 * 864000;
        const signRaw = {
            'integrator_account_index': builder,
            'integrator_taker_fee': takerFeeRate,
            'integrator_maker_fee': makerFeeRate,
            'approval_expiry': expiry,
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        const [txType, txInfo, messageToSign] = this.lighterSignApproveIntegrator(signer, this.extend(signRaw, params));
        const newTxInfo = this.signL1AndPrepareTxInfo(txInfo, messageToSign, this.privateKey);
        const request = {
            'tx_type': txType,
            'tx_info': newTxInfo,
        };
        const response = await this.publicPostSendTx(request);
        return response;
    }
    async changeApiKey(params = {}) {
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'changeApiKey', 'apiKeyIndex', 'api_key_index');
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'changeApiKey', 'accountIndex', 'account_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signerNotLoad = this.options['auths'][strAccountIndex][strApiKeyIndex]['signer'];
        const [privateKey, publicKey] = this.lighterGenerateApiKey(signerNotLoad);
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'pubkey': this.encode(publicKey),
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        // create lighter client
        const signer = this.lighterCreateClient(signerNotLoad, this.options['chainId'], privateKey, apiKeyIndex, accountIndex);
        const [txType, txInfo, messageToSign] = this.lighterSignChangePubkey(signer, this.extend(signRaw, params));
        const newTxInfo = this.signL1AndPrepareTxInfo(txInfo, messageToSign, this.privateKey);
        const request = {
            'tx_type': txType,
            'tx_info': newTxInfo,
        };
        await this.publicPostSendTx(request);
        this.options['auths'][strAccountIndex][strApiKeyIndex]['lighterPrivateKey'] = privateKey;
        this.options['auths'][strAccountIndex][strApiKeyIndex]['signer'] = signer; // reassign signer in go
        await this.handleBuilderFeeApproval(accountIndex, apiKeyIndex);
        return signer;
    }
    setSandboxMode(enable) {
        super.setSandboxMode(enable);
        this.options['sandboxMode'] = enable;
        this.options['chainId'] = enable ? 300 : 304;
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name lighter#createOrderRequest
         * @description helper function to build the request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.nonce] nonce for the account
         * @param {int} [params.apiKeyIndex] apiKeyIndex
         * @param {int} [params.accountIndex] accountIndex
         * @param {int} [params.orderExpiry] orderExpiry
         * @returns {any[]} request to be sent to the exchange
         */
        if (price === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price argument');
        }
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only', false); // default false
        const orderType = type.toUpperCase();
        const market = this.market(symbol);
        const orderSide = side.toUpperCase();
        const request = {
            'market_index': this.parseToInt(market['id']),
        };
        let nonce = undefined;
        let apiKeyIndex = undefined;
        let accountIndex = undefined;
        let orderExpiry = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'createOrder', 'apiKeyIndex', 'api_key_index');
        [accountIndex, params] = this.handleOptionAndParams2(params, 'createOrder', 'accountIndex', 'account_index');
        [nonce, params] = this.handleOptionAndParams(params, 'createOrder', 'nonce');
        [orderExpiry, params] = this.handleOptionAndParams(params, 'createOrder', 'orderExpiry', 0);
        if (nonce !== undefined) {
            request['nonce'] = nonce;
        }
        request['api_key_index'] = apiKeyIndex;
        request['account_index'] = this.parseToInt(accountIndex);
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue(params, 'stopLossPrice', triggerPrice);
        const takeProfitPrice = this.safeValue(params, 'takeProfitPrice');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const takeProfit = this.safeValue(params, 'takeProfit');
        const hasStopLoss = (stopLoss !== undefined);
        const hasTakeProfit = (takeProfit !== undefined);
        const isConditional = (stopLossPrice || takeProfitPrice);
        const isMarketOrder = (orderType === 'MARKET');
        const timeInForce = this.safeStringLower(params, 'timeInForce', 'gtt');
        const postOnly = this.isPostOnly(isMarketOrder, undefined, params);
        params = this.omit(params, ['stopLoss', 'takeProfit', 'timeInForce']);
        let orderTypeNum = undefined;
        let timeInForceNum = undefined;
        if (isMarketOrder) {
            orderTypeNum = 1;
            timeInForceNum = 0;
        }
        else {
            orderTypeNum = 0;
        }
        if (orderSide === 'BUY') {
            request['is_ask'] = 0;
        }
        else {
            request['is_ask'] = 1;
        }
        if (postOnly) {
            timeInForceNum = 2;
        }
        else {
            if (!isMarketOrder) {
                if (timeInForce === 'ioc') {
                    timeInForceNum = 0;
                    orderExpiry = 0;
                }
                else if (timeInForce === 'gtt') {
                    timeInForceNum = 1;
                    orderExpiry = -1;
                }
            }
        }
        const marketInfo = this.safeDict(market, 'info');
        let amountStr = undefined;
        const priceStr = this.priceToPrecision(symbol, price);
        const amountScale = this.pow('10', marketInfo['size_decimals']);
        const priceScale = this.pow('10', marketInfo['price_decimals']);
        let triggerPriceStr = '0'; // default is 0
        const defaultClientOrderId = this.randNumber(9); // c# only support int32 2147483647.
        const clientOrderId = this.safeInteger2(params, 'client_order_index', 'clientOrderId', defaultClientOrderId);
        params = this.omit(params, ['reduceOnly', 'reduce_only', 'timeInForce', 'postOnly', 'nonce', 'apiKeyIndex', 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'client_order_index', 'clientOrderId']);
        if (isConditional) {
            amountStr = this.numberToString(amount);
            if (stopLossPrice !== undefined) {
                if (isMarketOrder) {
                    orderTypeNum = 2;
                }
                else {
                    orderTypeNum = 3;
                }
                triggerPriceStr = this.priceToPrecision(symbol, stopLossPrice);
            }
            else if (takeProfitPrice !== undefined) {
                if (isMarketOrder) {
                    orderTypeNum = 4;
                }
                else {
                    orderTypeNum = 5;
                }
                triggerPriceStr = this.priceToPrecision(symbol, takeProfitPrice);
            }
        }
        else {
            amountStr = this.amountToPrecision(symbol, amount);
        }
        request['order_expiry'] = orderExpiry;
        request['order_type'] = orderTypeNum;
        request['time_in_force'] = timeInForceNum;
        request['reduce_only'] = (reduceOnly) ? 1 : 0;
        request['client_order_index'] = clientOrderId;
        request['base_amount'] = this.parseToInt(Precise["default"].stringMul(amountStr, amountScale));
        request['avg_execution_price'] = this.parseToInt(Precise["default"].stringMul(priceStr, priceScale));
        request['trigger_price'] = this.parseToInt(Precise["default"].stringMul(triggerPriceStr, priceScale));
        if (this.safeBool(this.options, 'builderFee', true)) {
            request['integrator_account_index'] = this.options['integratorAccountIndex'];
            request['integrator_taker_fee'] = this.options['integratorTakerFee'];
            request['integrator_maker_fee'] = this.options['integratorMakerFee'];
        }
        const orders = [];
        orders.push(this.extend(request, params));
        if (hasStopLoss || hasTakeProfit) {
            // group order
            orders[0]['client_order_index'] = 0; // client order index should be 0
            let triggerOrderSide = '';
            if (side === 'BUY') {
                triggerOrderSide = 'sell';
            }
            else {
                triggerOrderSide = 'buy';
            }
            const stopLossOrderTriggerPrice = this.safeNumberN(stopLoss, ['triggerPrice', 'stopPrice']);
            const stopLossOrderType = this.safeString(stopLoss, 'type', 'limit');
            const stopLossOrderLimitPrice = this.safeNumberN(stopLoss, ['price', 'stopLossPrice'], stopLossOrderTriggerPrice);
            const takeProfitOrderTriggerPrice = this.safeNumberN(takeProfit, ['triggerPrice', 'stopPrice']);
            const takeProfitOrderType = this.safeString(takeProfit, 'type', 'limit');
            const takeProfitOrderLimitPrice = this.safeNumberN(takeProfit, ['price', 'takeProfitPrice'], takeProfitOrderTriggerPrice);
            // amount should be 0 for child orders
            if (stopLoss !== undefined) {
                const orderObj = this.createOrderRequest(symbol, stopLossOrderType, triggerOrderSide, 0, stopLossOrderLimitPrice, this.extend(params, {
                    'stopLossPrice': stopLossOrderTriggerPrice,
                    'reduceOnly': true,
                }))[0];
                orderObj['client_order_index'] = 0;
                orders.push(orderObj);
            }
            if (takeProfit !== undefined) {
                const orderObj = this.createOrderRequest(symbol, takeProfitOrderType, triggerOrderSide, 0, takeProfitOrderLimitPrice, this.extend(params, {
                    'takeProfitPrice': takeProfitOrderTriggerPrice,
                    'reduceOnly': true,
                }))[0];
                orderObj['client_order_index'] = 0;
                orders.push(orderObj);
            }
        }
        return orders;
    }
    async fetchNonce(accountIndex, apiKeyIndex, params = {}) {
        if ((accountIndex === undefined) || (apiKeyIndex === undefined)) {
            throw new errors.ArgumentsRequired(this.id + ' fetchNonce() requires accountIndex and apiKeyIndex.');
        }
        if ('nonce' in params) {
            return this.safeInteger(params, 'nonce');
        }
        const nonceInOptions = this.safeInteger(this.options, 'nonce');
        if (nonceInOptions !== undefined) {
            return nonceInOptions;
        }
        const response = await this.publicGetNextNonce({ 'account_index': accountIndex, 'api_key_index': apiKeyIndex });
        return this.safeInteger(response, 'nonce');
    }
    /**
     * @method
     * @name lighter#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'GTT' or 'IOC', default is 'GTT'
     * @param {int} [params.clientOrderId] client order id, should be unique for each order, default is a random number
     * @param {string} [params.triggerPrice] trigger price for stop loss or take profit orders, in units of the quote currency
     * @param {boolean} [params.reduceOnly] whether the order is reduce only, default false
     * @param {int} [params.nonce] nonce for the account
     * @param {int} [params.apiKeyIndex] apiKeyIndex
     * @param {int} [params.accountIndex] accountIndex
     * @param {int} [params.orderExpiry] orderExpiry
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'createOrder', 'accountIndex', 'account_index');
        params['accountIndex'] = accountIndex;
        const market = this.market(symbol);
        let groupingType = undefined;
        [groupingType, params] = this.handleOptionAndParams(params, 'createOrder', 'groupingType', 3); // default GROUPING_TYPE_ONE_TRIGGERS_A_ONE_CANCELS_THE_OTHER
        const orderRequests = this.createOrderRequest(symbol, type, side, amount, price, params);
        // for php
        const totalOrderRequests = orderRequests.length;
        let apiKeyIndex = undefined;
        let order = undefined;
        if (totalOrderRequests > 0) {
            order = orderRequests[0];
            apiKeyIndex = order['api_key_index'];
        }
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        // the nonce could be updated
        if (this.safeInteger(order, 'nonce') === undefined) {
            order['nonce'] = await this.fetchNonce(accountIndex, apiKeyIndex);
        }
        let txType = undefined;
        let txInfo = undefined;
        if (totalOrderRequests < 2) {
            [txType, txInfo] = this.lighterSignCreateOrder(signer, order);
        }
        else {
            const signingPayload = {
                'grouping_type': groupingType,
                'orders': orderRequests,
                'nonce': order['nonce'],
                'api_key_index': apiKeyIndex,
                'account_index': accountIndex,
            };
            if (this.safeBool(this.options, 'builderFee', true)) {
                signingPayload['integrator_account_index'] = order['integrator_account_index'];
                signingPayload['integrator_taker_fee'] = order['integrator_taker_fee'];
                signingPayload['integrator_maker_fee'] = order['integrator_maker_fee'];
            }
            [txType, txInfo] = this.lighterSignCreateGroupedOrders(signer, signingPayload);
        }
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx(request);
        //
        // {
        //     "code": 200,
        //     "message": "{\"ratelimit\": \"didn't use volume quota\"}",
        //     "tx_hash": "txhash",
        //     "predicted_execution_time_ms": 1766088500120
        // }
        //
        return this.parseOrder(this.deepExtend(response, order), market);
    }
    /**
     * @method
     * @name lighter#editOrder
     * @description cancels an order and places a new order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'editOrder', 'apiKeyIndex', 'api_key_index');
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'editOrder', 'accountIndex', 'account_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const market = this.market(symbol);
        const marketInfo = this.safeDict(market, 'info');
        const amountScale = this.pow('10', marketInfo['size_decimals']);
        const priceScale = this.pow('10', marketInfo['price_decimals']);
        const triggerPrice = this.safeStringN(params, ['stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice']);
        params = this.omit(params, ['stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice']);
        let amountStr = undefined;
        const priceStr = this.priceToPrecision(symbol, price);
        let triggerPriceStr = '0'; // default is 0
        if (triggerPrice !== undefined) {
            amountStr = this.numberToString(amount);
            triggerPriceStr = this.priceToPrecision(symbol, triggerPrice);
        }
        else {
            amountStr = this.amountToPrecision(symbol, amount);
        }
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'market_index': this.parseToInt(market['id']),
            'index': this.parseToInt(id),
            'base_amount': this.parseToInt(Precise["default"].stringMul(amountStr, amountScale)),
            'price': this.parseToInt(Precise["default"].stringMul(priceStr, priceScale)),
            'trigger_price': this.parseToInt(Precise["default"].stringMul(triggerPriceStr, priceScale)),
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
            'integrator_account_index': this.options['integratorAccountIndex'],
            'integrator_taker_fee': this.options['integratorTakerFee'],
            'integrator_maker_fee': this.options['integratorMakerFee'],
        };
        const [txType, txInfo] = this.lighterSignModifyOrder(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx(request);
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name lighter#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://apidocs.lighter.xyz/reference/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.rootGet(params);
        //
        //     {
        //         "status": "1",
        //         "network_id": "1",
        //         "timestamp": "1717777777"
        //     }
        //
        const status = this.safeString(response, 'status');
        return {
            'status': (status === '200') ? 'ok' : 'error',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name lighter#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://apidocs.lighter.xyz/reference/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.rootGet(params);
        //
        //     {
        //         "status": "1",
        //         "network_id": "1",
        //         "timestamp": "1717777777"
        //     }
        //
        return this.safeTimestamp(response, 'timestamp');
    }
    /**
     * @method
     * @name lighter#fetchMarkets
     * @description retrieves data on all markets for lighter
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetOrderBookDetails(params);
        //
        //    {
        //        "code": "200",
        //        "message": "string",
        //        "order_book_details": [
        //            {
        //                "symbol": "ETH",
        //                "market_id": 0,
        //                "market_type": "perp",
        //                "base_asset_id": 0,
        //                "quote_asset_id": 0,
        //                "status": "active",
        //                "taker_fee": "0.0001",
        //                "maker_fee": "0.0000",
        //                "liquidation_fee": "0.01",
        //                "min_base_amount": "0.01",
        //                "min_quote_amount": "0.1",
        //                "supported_size_decimals": "4",
        //                "supported_price_decimals": "4",
        //                "supported_quote_decimals": "4",
        //                "order_quote_limit": "281474976.710655",
        //                "size_decimals": "4",
        //                "price_decimals": "4",
        //                "quote_multiplier": "10000",
        //                "default_initial_margin_fraction": "100",
        //                "min_initial_margin_fraction": "100",
        //                "maintenance_margin_fraction": "50",
        //                "closeout_margin_fraction": "100",
        //                "last_trade_price": "3024.66",
        //                "daily_trades_count": "68",
        //                "daily_base_token_volume": "235.25",
        //                "daily_quote_token_volume": "93566.25",
        //                "daily_price_low": "3014.66",
        //                "daily_price_high": "3024.66",
        //                "daily_price_change": "3.66",
        //                "open_interest": "93.0",
        //                "daily_chart": "{1640995200:3024.66}",
        //                "market_config": {
        //                    "market_margin_mode": 0,
        //                    "insurance_fund_account_index": 281474976710655,
        //                    "liquidation_mode": 0,
        //                    "force_reduce_only": false,
        //                    "funding_fee_discounts_enabled": true,
        //                    "trading_hours": "",
        //                    "hidden": true
        //                },
        //                "strategy_index": 0
        //            }
        //        ],
        //        "spot_order_book_details": [
        //            {
        //                "symbol": "ETH/USDC",
        //                "market_id": 2048,
        //                "market_type": "spot",
        //                "base_asset_id": 1,
        //                "quote_asset_id": 3,
        //                "status": "active",
        //                "taker_fee": "0.0000",
        //                "maker_fee": "0.0000",
        //                "liquidation_fee": "0.0000",
        //                "min_base_amount": "0.0001",
        //                "min_quote_amount": "0.000001",
        //                "order_quote_limit": "2500000.000000",
        //                "supported_size_decimals": 4,
        //                "supported_price_decimals": 2,
        //                "supported_quote_decimals": 6,
        //                "size_decimals": 4,
        //                "price_decimals": 2,
        //                "last_trade_price": 2731.79,
        //                "daily_trades_count": 126993,
        //                "daily_base_token_volume": 1203.0962,
        //                "daily_quote_token_volume": 3516374.947553,
        //                "daily_price_low": 2717.47,
        //                "daily_price_high": 3044.21,
        //                "daily_price_change": -10.2389493724579,
        //                "daily_chart": "{1640995200:3024.66}"
        //            }
        //        ]
        //    }
        //
        const spotMarkets = this.safeList(response, 'spot_order_book_details', []);
        const swapMarkets = this.safeList(response, 'order_book_details', []);
        const markets = this.arrayConcat(spotMarkets, swapMarkets);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString(market, 'market_id');
            let type = this.safeString(market, 'market_type');
            type = (type === 'perp') ? 'swap' : type;
            let baseId = this.safeString(market, 'symbol');
            if (baseId !== undefined && baseId.indexOf('/') !== -1) {
                baseId = baseId.split('/')[0];
            }
            const quoteId = 'USDC';
            const settleId = (type === 'swap') ? 'USDC' : undefined;
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            let symbol = base + '/' + quote;
            if (settle !== undefined) {
                symbol = symbol + ':' + settle;
            }
            const amountDecimals = this.safeString2(market, 'size_decimals', 'supported_size_decimals');
            const priceDecimals = this.safeString2(market, 'price_decimals', 'supported_price_decimals');
            const amountPrecision = (amountDecimals === undefined) ? undefined : this.parseNumber(this.parsePrecision(amountDecimals));
            const pricePrecision = (priceDecimals === undefined) ? undefined : this.parseNumber(this.parsePrecision(priceDecimals));
            const quoteMultiplier = this.safeNumber(market, 'quote_multiplier');
            result.push({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': type === 'spot',
                'margin': false,
                'swap': type === 'swap',
                'future': false,
                'option': false,
                'active': this.safeString(market, 'status') === 'active',
                'contract': type === 'swap',
                'linear': (type === 'swap') ? true : undefined,
                'inverse': (type === 'swap') ? false : undefined,
                'taker': this.safeNumber(market, 'taker_fee'),
                'maker': this.safeNumber(market, 'maker_fee'),
                'contractSize': quoteMultiplier,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountPrecision,
                    'price': pricePrecision,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'min_base_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'min_quote_amount'),
                        'max': this.safeNumber(market, 'order_quote_limit'),
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }
    /**
     * @method
     * @name lighter#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://apidocs.lighter.xyz/reference/assetdetails
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetAssetDetails(params);
        if (this.checkRequiredCredentials(false)) {
            await this.preLoadLighterLibrary();
        }
        //
        //     {
        //         "code": 200,
        //         "asset_details": [
        //             {
        //                 "asset_id": 3,
        //                 "symbol": "USDC",
        //                 "l1_decimals": 6,
        //                 "decimals": 6,
        //                 "min_transfer_amount": "1.000000",
        //                 "min_withdrawal_amount": "1.000000",
        //                 "margin_mode": "enabled",
        //                 "index_price": "1.000000",
        //                 "l1_address": "0x95Fd23d5110f9D89A4b0B7d63D78F5B5Ea5074D1"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'asset_details', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString(entry, 'asset_id');
            const code = this.safeCurrencyCode(this.safeString(entry, 'symbol'));
            const decimals = this.safeString(entry, 'decimals');
            const isUSDC = (code === 'USDC');
            let depositMin = undefined;
            let withdrawMin = undefined;
            if (isUSDC) {
                depositMin = this.safeNumber(entry, 'min_transfer_amount');
                withdrawMin = this.safeNumber(entry, 'min_withdrawal_amount');
            }
            result[code] = this.safeCurrencyStructure({
                'id': id,
                'name': code,
                'code': code,
                'precision': this.parseNumber('1e-' + decimals),
                'active': true,
                'fee': undefined,
                'networks': {},
                'deposit': isUSDC,
                'withdraw': isUSDC,
                'type': 'crypto',
                'limits': {
                    'deposit': {
                        'min': depositMin,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': withdrawMin,
                        'max': undefined,
                    },
                },
                'info': entry,
            });
        }
        return result;
    }
    /**
     * @method
     * @name lighter#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/reference/orderbookorders
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_id': market['id'],
            'limit': 100,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 100);
        }
        const response = await this.publicGetOrderBookOrders(this.extend(request, params));
        //
        //     {
        //         "code": 200,
        //         "total_asks": 1,
        //         "asks": [
        //             {
        //                 "order_index": 281475565888172,
        //                 "order_id": "281475565888172",
        //                 "owner_account_index": 134436,
        //                 "initial_base_amount": "0.2000",
        //                 "remaining_base_amount": "0.2000",
        //                 "price": "3430.00",
        //                 "order_expiry": 1765419046807
        //             }
        //         ],
        //         "total_bids": 1,
        //         "bids": [
        //             {
        //                 "order_index": 562949401225099,
        //                 "order_id": "562949401225099",
        //                 "owner_account_index": 314236,
        //                 "initial_base_amount": "1.7361",
        //                 "remaining_base_amount": "1.3237",
        //                 "price": "3429.80",
        //                 "order_expiry": 1765419047587
        //             }
        //         ]
        //     }
        //
        const result = this.parseOrderBook(response, market['symbol'], undefined, 'bids', 'asks', 'price', 'remaining_base_amount');
        return result;
    }
    parseTicker(ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //     {
        //         "symbol": "ETH",
        //         "market_id": 0,
        //         "status": "active",
        //         "taker_fee": "0.0000",
        //         "maker_fee": "0.0000",
        //         "liquidation_fee": "1.0000",
        //         "min_base_amount": "0.0050",
        //         "min_quote_amount": "10.000000",
        //         "order_quote_limit": "",
        //         "supported_size_decimals": 4,
        //         "supported_price_decimals": 2,
        //         "supported_quote_decimals": 6,
        //         "size_decimals": 4,
        //         "price_decimals": 2,
        //         "quote_multiplier": 1,
        //         "default_initial_margin_fraction": 500,
        //         "min_initial_margin_fraction": 200,
        //         "maintenance_margin_fraction": 120,
        //         "closeout_margin_fraction": 80,
        //         "last_trade_price": 3550.69,
        //         "daily_trades_count": 1197349,
        //         "daily_base_token_volume": 481297.3509,
        //         "daily_quote_token_volume": 1671431095.263844,
        //         "daily_price_low": 3402.41,
        //         "daily_price_high": 3571.45,
        //         "daily_price_change": 0.5294300840859545,
        //         "open_interest": 39559.3278,
        //         "daily_chart": {},
        //         "market_config": {
        //             "market_margin_mode": 0,
        //             "insurance_fund_account_index": 281474976710654,
        //             "liquidation_mode": 0,
        //             "force_reduce_only": false,
        //             "trading_hours": ""
        //         }
        //     }
        //
        // watchTicker, watchTickers
        //     {
        //         "market_id": 0,
        //         "index_price": "3015.56",
        //         "mark_price": "3013.91",
        //         "open_interest": "122736286.659423",
        //         "open_interest_limit": "72057594037927936.000000",
        //         "funding_clamp_small": "0.0500",
        //         "funding_clamp_big": "4.0000",
        //         "last_trade_price": "3013.13",
        //         "current_funding_rate": "0.0012",
        //         "funding_rate": "0.0012",
        //         "funding_timestamp": 1763532000004,
        //         "daily_base_token_volume": 643235.2763,
        //         "daily_quote_token_volume": 1983505435.673896,
        //         "daily_price_low": 2977.42,
        //         "daily_price_high": 3170.81,
        //         "daily_price_change": -0.3061987051035322
        //     }
        //
        const marketId = this.safeString(ticker, 'market_id');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString(ticker, 'last_trade_price');
        const high = this.safeString(ticker, 'daily_price_high');
        const low = this.safeString(ticker, 'daily_price_low');
        const baseVolume = this.safeString(ticker, 'daily_base_token_volume');
        const quoteVolume = this.safeString(ticker, 'daily_quote_token_volume');
        const change = this.safeString(ticker, 'daily_price_change');
        const openInterest = this.safeString(ticker, 'open_interest');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': change,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': this.safeString(ticker, 'mark_price'),
            'indexPrice': this.safeString(ticker, 'index_price'),
            'openInterest': openInterest,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name lighter#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTicker() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_id': market['id'],
        };
        const response = await this.publicGetOrderBookDetails(this.extend(request, params));
        //
        //     {
        //         "code": 200,
        //         "order_book_details": [
        //             {
        //                 "symbol": "ETH",
        //                 "market_id": 0,
        //                 "status": "active",
        //                 "taker_fee": "0.0000",
        //                 "maker_fee": "0.0000",
        //                 "liquidation_fee": "1.0000",
        //                 "min_base_amount": "0.0050",
        //                 "min_quote_amount": "10.000000",
        //                 "order_quote_limit": "",
        //                 "supported_size_decimals": 4,
        //                 "supported_price_decimals": 2,
        //                 "supported_quote_decimals": 6,
        //                 "size_decimals": 4,
        //                 "price_decimals": 2,
        //                 "quote_multiplier": 1,
        //                 "default_initial_margin_fraction": 500,
        //                 "min_initial_margin_fraction": 200,
        //                 "maintenance_margin_fraction": 120,
        //                 "closeout_margin_fraction": 80,
        //                 "last_trade_price": 3550.69,
        //                 "daily_trades_count": 1197349,
        //                 "daily_base_token_volume": 481297.3509,
        //                 "daily_quote_token_volume": 1671431095.263844,
        //                 "daily_price_low": 3402.41,
        //                 "daily_price_high": 3571.45,
        //                 "daily_price_change": 0.5294300840859545,
        //                 "open_interest": 39559.3278,
        //                 "daily_chart": {},
        //                 "market_config": {
        //                     "market_margin_mode": 0,
        //                     "insurance_fund_account_index": 281474976710655,
        //                     "liquidation_mode": 0,
        //                     "force_reduce_only": false,
        //                     "trading_hours": ""
        //                 }
        //             }
        //         ]
        //     }
        //
        const spotTickers = this.safeList(response, 'spot_order_book_details', []);
        const swapTickers = this.safeList(response, 'order_book_details', []);
        const tickers = this.arrayConcat(spotTickers, swapTickers);
        const first = this.safeDict(tickers, 0, {});
        return this.parseTicker(first, market);
    }
    /**
     * @method
     * @name lighter#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetOrderBookDetails(params);
        const spotTickers = this.safeList(response, 'spot_order_book_details', []);
        const swapTickers = this.safeList(response, 'order_book_details', []);
        const tickers = this.arrayConcat(spotTickers, swapTickers);
        return this.parseTickers(tickers, symbols);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        // {
        //     "t": 1767700500000,
        //     "o": 3236.86,
        //     "h": 3237.78,
        //     "l": 3235.36,
        //     "c": 3235.39,
        //     "v": 55.1632,
        //     "V": 178530.793575,
        //     "i": 779870452,
        //     "C": "string",
        //     "H": "string",
        //     "L": "string",
        //     "O": "string"
        // }
        //
        return [
            this.safeInteger(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    /**
     * @method
     * @name lighter#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidocs.lighter.xyz/reference/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOHLCV() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['until']);
        const now = this.milliseconds();
        let startTs = undefined;
        let endTs = undefined;
        if (since !== undefined) {
            startTs = since;
            if (until !== undefined) {
                endTs = until;
            }
            else if (limit !== undefined) {
                const duration = this.parseTimeframe(timeframe);
                endTs = this.sum(since, duration * limit * 1000);
            }
            else {
                endTs = now;
            }
        }
        else {
            endTs = (until !== undefined) ? until : now;
            const defaultLimit = 100;
            if (limit !== undefined) {
                startTs = endTs - this.parseTimeframe(timeframe) * 1000 * limit;
            }
            else {
                startTs = endTs - this.parseTimeframe(timeframe) * 1000 * defaultLimit;
            }
        }
        const request = {
            'market_id': market['id'],
            'count_back': 0,
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
            'start_timestamp': startTs,
            'end_timestamp': endTs,
        };
        const response = await this.publicGetCandles(this.extend(request, params));
        //
        // {
        //     "code": 200,
        //     "r": "1m",
        //     "c": [
        //         {
        //             "t": 1767700500000,
        //             "o": 3236.86,
        //             "h": 3237.78,
        //             "l": 3235.36,
        //             "c": 3235.39,
        //             "v": 55.1632,
        //             "V": 178530.793575,
        //             "i": 779870452,
        //             "C": "string",
        //             "H": "string",
        //             "L": "string",
        //             "O": "string"
        //         }
        //     ]
        // }
        //
        const ohlcvs = this.safeList(response, 'c', []);
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "market_id": 0,
        //         "exchange": "lighter",
        //         "symbol": "ETH",
        //         "rate": 0.00009599999999999999
        //     }
        //
        const marketId = this.safeString(contract, 'market_id');
        return {
            'info': contract,
            'symbol': this.safeSymbol(marketId, market),
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber(contract, 'rate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        };
    }
    /**
     * @method
     * @name lighter#fetchFundingRates
     * @description fetch the current funding rate for multiple symbols
     * @see https://apidocs.lighter.xyz/reference/funding-rates
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetFundingRates(this.extend(params));
        //
        //     {
        //         "code": 200,
        //         "funding_rates": [
        //             {
        //                 "market_id": 0,
        //                 "exchange": "lighter",
        //                 "symbol": "ETH",
        //                 "rate": 0.00009599999999999999
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'funding_rates', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const exchange = this.safeString(data[i], 'exchange');
            if (exchange === 'lighter') {
                result.push(data[i]);
            }
        }
        return this.parseFundingRates(result, symbols);
    }
    /**
     * @method
     * @name ligher#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @param {string} [params.type] 'spot', 'swap', default is 'swap'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchBalance', 'accountIndex', 'account_index');
        const defaultType = this.safeString2(this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        const request = {
            'by': this.safeString(params, 'by', 'index'),
            'value': accountIndex,
        };
        const response = await this.publicGetAccount(this.extend(request, params));
        //
        //     {
        //         "code": "200",
        //         "total": "1",
        //         "accounts": [
        //             {
        //                 "code": "0",
        //                 "account_type": "0",
        //                 "index": "1077",
        //                 "l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //                 "cancel_all_time": "0",
        //                 "total_order_count": "1",
        //                 "total_isolated_order_count": "0",
        //                 "pending_order_count": "0",
        //                 "available_balance": "7996.489834",
        //                 "status": "1",
        //                 "collateral": "9000.000000",
        //                 "account_index": "1077",
        //                 "name": "",
        //                 "description": "",
        //                 "can_invite": true,
        //                 "referral_points_percentage": "",
        //                 "positions": [],
        //                 "assets": [
        //                     {
        //                         "symbol": "ETH",
        //                         "asset_id": "1",
        //                         "balance": "3.00000000",
        //                         "locked_balance": "0.00000000"
        //                     },
        //                     {
        //                         "symbol": "USDC",
        //                         "asset_id": "3",
        //                         "balance": "1000.000000",
        //                         "locked_balance": "0.000000"
        //                     }
        //                 ],
        //                 "total_asset_value": "9536.789088",
        //                 "cross_asset_value": "9536.789088",
        //                 "shares": []
        //             }
        //         ]
        //     }
        //
        const result = { 'info': response };
        const accounts = this.safeList(response, 'accounts', []);
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            if (type === 'spot') {
                const assets = this.safeList(account, 'assets', []);
                for (let j = 0; j < assets.length; j++) {
                    const asset = assets[j];
                    const codeId = this.safeString(asset, 'symbol');
                    const code = this.safeCurrencyCode(codeId);
                    const balance = this.safeDict(result, code, this.account());
                    balance['total'] = Precise["default"].stringAdd(balance['total'], this.safeString(asset, 'balance'));
                    balance['used'] = Precise["default"].stringAdd(balance['used'], this.safeString(asset, 'locked_balance'));
                    result[code] = balance;
                }
            }
            else {
                const perpBalance = this.safeDict(result, 'USDC', this.account());
                const perpUSDCTotal = this.safeString(account, 'collateral');
                const perpUSDCFree = this.safeString(account, 'available_balance');
                perpBalance['total'] = Precise["default"].stringAdd(perpBalance['total'], perpUSDCTotal);
                perpBalance['free'] = Precise["default"].stringAdd(perpBalance['free'], perpUSDCFree);
                result['USDC'] = perpBalance;
            }
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name lighter#fetchPosition
     * @description fetch data on an open position
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        const positions = await this.fetchPositions([symbol], params);
        return this.safeDict(positions, 0, {});
    }
    /**
     * @method
     * @name lighter#fetchPositions
     * @description fetch all open positions
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchPositions', 'accountIndex', 'account_index');
        const request = {
            'by': this.safeString(params, 'by', 'index'),
            'value': accountIndex,
        };
        const response = await this.publicGetAccount(this.extend(request, params));
        //
        //     {
        //         "code": 200,
        //         "total": 2,
        //         "accounts": [
        //             {
        //                 "code": 0,
        //                 "account_type": 0,
        //                 "index": 1077,
        //                 "l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //                 "cancel_all_time": 0,
        //                 "total_order_count": 0,
        //                 "total_isolated_order_count": 0,
        //                 "pending_order_count": 0,
        //                 "available_balance": "12582.743947",
        //                 "status": 1,
        //                 "collateral": "9100.242706",
        //                 "account_index": 1077,
        //                 "name": "",
        //                 "description": "",
        //                 "can_invite": true,
        //                 "referral_points_percentage": "",
        //                 "positions": [
        //                     {
        //                         "market_id": 0,
        //                         "symbol": "ETH",
        //                         "initial_margin_fraction": "5.00",
        //                         "open_order_count": 0,
        //                         "pending_order_count": 0,
        //                         "position_tied_order_count": 0,
        //                         "sign": 1,
        //                         "position": "18.0193",
        //                         "avg_entry_price": "2669.84",
        //                         "position_value": "54306.566340",
        //                         "unrealized_pnl": "6197.829558",
        //                         "realized_pnl": "0.000000",
        //                         "liquidation_price": "2191.1107231380406",
        //                         "margin_mode": 0,
        //                         "allocated_margin": "0.000000"
        //                     }
        //                 ],
        //                 "assets": [],
        //                 "total_asset_value": "15298.072264000002",
        //                 "cross_asset_value": "15298.072264000002",
        //                 "shares": []
        //             }
        //         ]
        //     }
        //
        const allPositions = [];
        const accounts = this.safeList(response, 'accounts', []);
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const positions = this.safeList(account, 'positions', []);
            for (let j = 0; j < positions.length; j++) {
                allPositions.push(positions[j]);
            }
        }
        return this.parsePositions(allPositions, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "market_id": 0,
        //         "symbol": "ETH",
        //         "initial_margin_fraction": "5.00",
        //         "open_order_count": 0,
        //         "pending_order_count": 0,
        //         "position_tied_order_count": 0,
        //         "sign": 1,
        //         "position": "18.0193",
        //         "avg_entry_price": "2669.84",
        //         "position_value": "54306.566340",
        //         "unrealized_pnl": "6197.829558",
        //         "realized_pnl": "0.000000",
        //         "liquidation_price": "2191.1107231380406",
        //         "margin_mode": 0,
        //         "allocated_margin": "0.000000"
        //     }
        //
        const marketId = this.safeString(position, 'market_id');
        market = this.safeMarket(marketId, market);
        const sign = this.safeInteger(position, 'sign');
        let side = undefined;
        if (sign !== undefined) {
            side = (sign === 1) ? 'long' : 'short';
        }
        const marginModeId = this.safeInteger(position, 'margin_mode');
        let marginMode = undefined;
        if (marginModeId !== undefined) {
            marginMode = (marginModeId === 0) ? 'cross' : 'isolated';
        }
        const imfStr = this.safeString(position, 'initial_margin_fraction');
        let leverage = undefined;
        if (imfStr !== undefined) {
            const imf = this.parseToInt(imfStr);
            if (imf > 0) {
                leverage = 100 / imf;
            }
        }
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'isolated': (marginMode === 'isolated'),
            'hedged': undefined,
            'side': side,
            'contracts': this.safeNumber(position, 'position'),
            'contractSize': undefined,
            'entryPrice': this.safeNumber(position, 'avg_entry_price'),
            'markPrice': undefined,
            'notional': this.safeNumber(position, 'position_value'),
            'leverage': leverage,
            'collateral': this.safeNumber(position, 'allocated_margin'),
            'initialMargin': undefined,
            'maintenanceMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': this.safeNumber(position, 'unrealized_pnl'),
            'liquidationPrice': this.safeNumber(position, 'liquidation_price'),
            'marginMode': marginMode,
            'percentage': undefined,
        });
    }
    /**
     * @method
     * @name lighter#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=accounts-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchAccounts', 'accountIndex', 'account_index');
        const request = {
            'by': this.safeString(params, 'by', 'index'),
            'value': accountIndex,
        };
        const response = await this.publicGetAccount(this.extend(request, params));
        //
        //     {
        //         "code": "200",
        //         "total": "1",
        //         "accounts": [
        //             {
        //                 "code": "0",
        //                 "account_type": "0",
        //                 "index": "1077",
        //                 "l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //                 "cancel_all_time": "0",
        //                 "total_order_count": "1",
        //                 "total_isolated_order_count": "0",
        //                 "pending_order_count": "0",
        //                 "available_balance": "7996.489834",
        //                 "status": "1",
        //                 "collateral": "9000.000000",
        //                 "account_index": "1077",
        //                 "name": "",
        //                 "description": "",
        //                 "can_invite": true,
        //                 "referral_points_percentage": "",
        //                 "positions": [],
        //                 "assets": [],
        //                 "total_asset_value": "9536.789088",
        //                 "cross_asset_value": "9536.789088",
        //                 "shares": []
        //             }
        //         ]
        //     }
        //
        const accounts = this.safeList(response, 'accounts', []);
        return this.parseAccounts(accounts, params);
    }
    parseAccount(account) {
        //
        //     {
        //         "code": "0",
        //         "account_type": "0",
        //         "index": "1077",
        //         "l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //         "cancel_all_time": "0",
        //         "total_order_count": "1",
        //         "total_isolated_order_count": "0",
        //         "pending_order_count": "0",
        //         "available_balance": "7996.489834",
        //         "status": "1",
        //         "collateral": "9000.000000",
        //         "account_index": "1077",
        //         "name": "",
        //         "description": "",
        //         "can_invite": true,
        //         "referral_points_percentage": "",
        //         "positions": [],
        //         "assets": [],
        //         "total_asset_value": "9536.789088",
        //         "cross_asset_value": "9536.789088",
        //         "shares": []
        //     }
        //
        const accountType = this.safeString(account, 'account_type');
        return {
            'id': this.safeString(account, 'account_index'),
            'type': (accountType === '0') ? 'main' : 'subaccount',
            'code': undefined,
            'info': account,
        };
    }
    /**
     * @method
     * @name lighter#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apidocs.lighter.xyz/reference/accountactiveorders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchOpenOrders', 'accountIndex', 'account_index');
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'fetchOpenOrders', 'apiKeyIndex', 'api_key_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const market = this.market(symbol);
        const request = {
            'market_id': market['id'],
            'account_index': accountIndex,
        };
        const response = await this.privateGetAccountActiveOrders(this.extend(request, params));
        //
        //     {
        //         "code": 200,
        //         "orders": [
        //             {
        //                 "order_index": 281474977354074,
        //                 "client_order_index": 0,
        //                 "order_id": "281474977354074",
        //                 "client_order_id": "0",
        //                 "market_index": 0,
        //                 "owner_account_index": 1077,
        //                 "initial_base_amount": "36.0386",
        //                 "price": "2221.60",
        //                 "nonce": 643418,
        //                 "remaining_base_amount": "0.0000",
        //                 "is_ask": true,
        //                 "base_size": 0,
        //                 "base_price": 222160,
        //                 "filled_base_amount": "0.0000",
        //                 "filled_quote_amount": "0.000000",
        //                 "side": "",
        //                 "type": "market",
        //                 "time_in_force": "immediate-or-cancel",
        //                 "reduce_only": false,
        //                 "trigger_price": "0.00",
        //                 "order_expiry": 0,
        //                 "status": "canceled-margin-not-allowed",
        //                 "trigger_status": "na",
        //                 "trigger_time": 0,
        //                 "parent_order_index": 0,
        //                 "parent_order_id": "0",
        //                 "to_trigger_order_id_0": "0",
        //                 "to_trigger_order_id_1": "0",
        //                 "to_cancel_order_id_0": "0",
        //                 "block_height": 102202,
        //                 "timestamp": 1766387932,
        //                 "created_at": 1766387932,
        //                 "updated_at": 1766387932
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'orders', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name lighter#fetchClosedOrders
     * @description fetch all unfilled currently closed orders
     * @see https://apidocs.lighter.xyz/reference/accountinactiveorders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchClosedOrders', 'accountIndex', 'account_index');
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'fetchClosedOrders', 'apiKeyIndex', 'api_key_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const market = this.market(symbol);
        const request = {
            'market_id': market['id'],
            'account_index': accountIndex,
            'limit': 100, // required, max 100
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 100);
        }
        const response = await this.privateGetAccountInactiveOrders(this.extend(request, params));
        //
        //     {
        //         "code": 200,
        //         "orders": [
        //             {
        //                 "order_index": 281474977354074,
        //                 "client_order_index": 0,
        //                 "order_id": "281474977354074",
        //                 "client_order_id": "0",
        //                 "market_index": 0,
        //                 "owner_account_index": 1077,
        //                 "initial_base_amount": "36.0386",
        //                 "price": "2221.60",
        //                 "nonce": 643418,
        //                 "remaining_base_amount": "0.0000",
        //                 "is_ask": true,
        //                 "base_size": 0,
        //                 "base_price": 222160,
        //                 "filled_base_amount": "0.0000",
        //                 "filled_quote_amount": "0.000000",
        //                 "side": "",
        //                 "type": "market",
        //                 "time_in_force": "immediate-or-cancel",
        //                 "reduce_only": false,
        //                 "trigger_price": "0.00",
        //                 "order_expiry": 0,
        //                 "status": "canceled-margin-not-allowed",
        //                 "trigger_status": "na",
        //                 "trigger_time": 0,
        //                 "parent_order_index": 0,
        //                 "parent_order_id": "0",
        //                 "to_trigger_order_id_0": "0",
        //                 "to_trigger_order_id_1": "0",
        //                 "to_cancel_order_id_0": "0",
        //                 "block_height": 102202,
        //                 "timestamp": 1766387932,
        //                 "created_at": 1766387932,
        //                 "updated_at": 1766387932
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'orders', []);
        return this.parseOrders(data, market, since, limit);
    }
    parseOrder(order, market = undefined) {
        //
        //     {
        //         "order_index": 281474977354074,
        //         "client_order_index": 0,
        //         "order_id": "281474977354074",
        //         "client_order_id": "0",
        //         "market_index": 0,
        //         "owner_account_index": 1077,
        //         "initial_base_amount": "36.0386",
        //         "price": "2221.60",
        //         "nonce": 643418,
        //         "remaining_base_amount": "0.0000",
        //         "is_ask": true,
        //         "base_size": 0,
        //         "base_price": 222160,
        //         "filled_base_amount": "0.0000",
        //         "filled_quote_amount": "0.000000",
        //         "side": "",
        //         "type": "market",
        //         "time_in_force": "immediate-or-cancel",
        //         "reduce_only": false,
        //         "trigger_price": "0.00",
        //         "order_expiry": 0,
        //         "status": "canceled-margin-not-allowed",
        //         "trigger_status": "na",
        //         "trigger_time": 0,
        //         "parent_order_index": 0,
        //         "parent_order_id": "0",
        //         "to_trigger_order_id_0": "0",
        //         "to_trigger_order_id_1": "0",
        //         "to_cancel_order_id_0": "0",
        //         "block_height": 102202,
        //         "timestamp": 1766387932,
        //         "created_at": 1766387932,
        //         "updated_at": 1766387932
        //     }
        //
        const marketId = this.safeString(order, 'market_index');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeTimestamp(order, 'timestamp');
        let isAsk = this.safeBool(order, 'is_ask');
        if (isAsk === undefined) {
            const isAskAsInteger = this.safeInteger(order, 'is_ask');
            if (isAskAsInteger !== undefined) {
                isAsk = isAskAsInteger === 1;
            }
        }
        let side = undefined;
        if (isAsk !== undefined) {
            side = isAsk ? 'sell' : 'buy';
        }
        let type = this.safeString(order, 'type');
        if (type === undefined) {
            const typeAsInteger = this.safeInteger(order, 'order_type');
            type = this.parseOrderTypeInteger(typeAsInteger);
        }
        const triggerPrice = this.parseNumber(this.omitZero(this.safeString(order, 'trigger_price')));
        let stopLossPrice = undefined;
        let takeProfitPrice = undefined;
        if (type !== undefined) {
            if (type.indexOf('stop-loss') >= 0) {
                stopLossPrice = triggerPrice;
            }
            if (type.indexOf('take-profit') >= 0) {
                takeProfitPrice = triggerPrice;
            }
        }
        // Try to parse to integer first, because parsing an integer to a string wouldn't result in undefined
        let tif = undefined;
        const tifAsInteger = this.safeInteger(order, 'time_in_force');
        if (tifAsInteger !== undefined) {
            tif = this.parseOrderTimeInForceInteger(tifAsInteger);
        }
        else {
            tif = this.safeString(order, 'time_in_force');
        }
        let reduceOnly = this.safeBool(order, 'reduce_only');
        if (reduceOnly === undefined) {
            const reduceOnlyAsInteger = this.safeInteger(order, 'reduce_only');
            if (reduceOnlyAsInteger !== undefined) {
                reduceOnly = reduceOnlyAsInteger === 1;
            }
        }
        const status = this.safeString(order, 'status');
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'order_id'),
            'clientOrderId': this.omitZero(this.safeString2(order, 'client_order_id', 'client_order_index')),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeTimestamp(order, 'updated_at'),
            'symbol': market['symbol'],
            'type': this.parseOrderType(type),
            'timeInForce': this.parseOrderTimeInForce(tif),
            'postOnly': tif === 'post-only',
            'reduceOnly': reduceOnly,
            'side': side,
            'price': this.safeString(order, 'price'),
            'triggerPrice': triggerPrice,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'amount': this.safeString(order, 'initial_base_amount'),
            'cost': this.safeString(order, 'filled_quote_amount'),
            'average': undefined,
            'filled': this.safeString(order, 'filled_base_amount'),
            'remaining': this.safeString(order, 'remaining_base_amount'),
            'status': this.parseOrderStatus(status),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'in-progress': 'open',
            'pending': 'open',
            'open': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'canceled-post-only': 'canceled',
            'canceled-reduce-only': 'canceled',
            'canceled-position-not-allowed': 'rejected',
            'canceled-margin-not-allowed': 'rejected',
            'canceled-too-much-slippage': 'canceled',
            'canceled-not-enough-liquidity': 'canceled',
            'canceled-self-trade': 'canceled',
            'canceled-expired': 'expired',
            'canceled-oco': 'canceled',
            'canceled-child': 'canceled',
            'canceled-liquidation': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(type) {
        const types = {
            'limit': 'limit',
            'market': 'market',
            'stop-loss': 'market',
            'stop-loss-limit': 'limit',
            'take-profit': 'market',
            'take-profit-limit': 'limit',
            'twap': 'twap',
            'twap-sub': 'twap',
            'liquidation': 'market',
        };
        return this.safeString(types, type, type);
    }
    parseOrderTypeInteger(typeInteger) {
        if (typeInteger === undefined) {
            return undefined;
        }
        const types = {
            '0': 'limit',
            '1': 'market',
            '2': 'stop-loss',
            '3': 'stop-loss-limit',
            '4': 'take-profit',
            '5': 'take-profit-limit',
            '6': 'twap',
            '7': 'twap-sub',
            '8': 'liquidation',
        };
        return this.safeString(types, typeInteger.toString());
    }
    parseOrderTimeInForce(tif) {
        const timeInForces = {
            'immediate-or-cancel': 'IOC',
            'good-till-time': 'GTC',
            'post-only': 'PO',
            'Unknown': undefined,
        };
        return this.safeString(timeInForces, tif, tif);
    }
    parseOrderTimeInForceInteger(tifInteger) {
        const timeInForces = {
            '0': 'immediate-or-cancel',
            '1': 'good-till-time',
            '2': 'post-only',
        };
        return this.safeString(timeInForces, tifInteger.toString());
    }
    /**
     * @method
     * @name lighter#transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from (spot, perp)
     * @param {string} toAccount account to transfer to (spot, perp)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.toAccountIndex] to account index, defaults to fromAccountIndex
     * @param {string} [params.apiKeyIndex] api key index
     * @param {string} [params.memo] hex encoding memo
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'transfer', 'apiKeyIndex', 'api_key_index');
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'transfer', 'accountIndex', 'account_index');
        let toAccountIndex = undefined;
        [toAccountIndex, params] = this.handleOptionAndParams2(params, 'transfer', 'toAccountIndex', 'to_account_index', accountIndex);
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const currency = this.currency(code);
        if (currency['code'] === 'USDC') {
            amount = this.parseToInt(Precise["default"].stringMul(this.pow('10', '6'), this.currencyToPrecision(code, amount)));
        }
        else if (currency['code'] === 'ETH') {
            amount = this.parseToInt(Precise["default"].stringMul(this.pow('10', '8'), this.currencyToPrecision(code, amount)));
        }
        else {
            throw new errors.ExchangeError(this.id + ' transfer() only supports USDC and ETH transfers');
        }
        const fromRouteType = (fromAccount === 'perp') ? 0 : 1; // 0: perp, 1: spot
        const toRouteType = (toAccount === 'perp') ? 0 : 1;
        const memo = this.safeString(params, 'memo', '0x000000000000000000000000000000');
        params = this.omit(params, ['memo']);
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'to_account_index': toAccountIndex,
            'asset_index': this.parseToInt(currency['id']),
            'from_route_type': fromRouteType,
            'to_route_type': toRouteType,
            'amount': amount,
            'usdc_fee': 0,
            'memo': memo,
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        const [txType, txInfo] = this.lighterSignTransfer(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx(request);
        return this.parseTransfer(response);
    }
    /**
     * @method
     * @name lighter#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://apidocs.lighter.xyz/reference/transfer_history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTransfers', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchTransfers', code, since, limit, params, 'cursor', 'cursor', undefined, 50);
        }
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchTransfers', 'accountIndex', 'account_index');
        const request = {
            'account_index': accountIndex,
        };
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'fetchTransfers', 'apiKeyIndex', 'api_key_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.privateGetTransferHistory(this.extend(request, params));
        //
        //     {
        //         "code": 200,
        //         "transfers": [
        //             {
        //                 "id": "3085014",
        //                 "asset_id": 3,
        //                 "amount": "11.000000",
        //                 "fee": "0.000000",
        //                 "timestamp": 1766387292752,
        //                 "type": "L2TransferOutflow",
        //                 "from_l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //                 "to_l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //                 "from_account_index": 1077,
        //                 "to_account_index": 281474976710608,
        //                 "from_route": "spot",
        //                 "to_route": "spot",
        //                 "tx_hash": "d8e96178273d0938f9ede556edffc0aab8def9ec70c46a65791905291a2f5792af18625406102c80"
        //             }
        //         ],
        //         "cursor": "eyJpbmRleCI6MzA4NDkxNX0="
        //     }
        //
        const rows = this.safeList(response, 'transfers', []);
        const cursor = this.safeString(response, 'cursor');
        const first = this.safeDict(rows, 0);
        if ((first !== undefined) && (cursor !== undefined)) {
            rows[0]['cursor'] = cursor;
        }
        return this.parseTransfers(rows, currency, since, limit, params);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        //     {
        //         "id": "3085014",
        //         "asset_id": 3,
        //         "amount": "11.000000",
        //         "fee": "0.000000",
        //         "timestamp": 1766387292752,
        //         "type": "L2TransferOutflow",
        //         "from_l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //         "to_l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //         "from_account_index": 1077,
        //         "to_account_index": 281474976710608,
        //         "from_route": "spot",
        //         "to_route": "spot",
        //         "tx_hash": "d8e96178273d0938f9ede556edffc0aab8def9ec70c46a65791905291a2f5792af18625406102c80"
        //     }
        //
        const currencyId = this.safeString(transfer, 'asset_id');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeInteger(transfer, 'timestamp');
        const fromAccount = this.safeDict(transfer, 'from', {});
        const toAccount = this.safeDict(transfer, 'to', {});
        return {
            'id': this.safeString(transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': this.safeString(fromAccount, 'from_account_index'),
            'toAccount': this.safeString(toAccount, 'to_account_index'),
            'status': undefined,
            'info': transfer,
        };
    }
    /**
     * @method
     * @name lighter#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://apidocs.lighter.xyz/reference/deposit_history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.address] l1_address
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchDeposits', code, since, limit, params, 'cursor', 'cursor', undefined, 50);
        }
        let address = undefined;
        [address, params] = this.handleOptionAndParams2(params, 'fetchDeposits', 'address', 'l1_address');
        if (address === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDeposits() requires an address parameter');
        }
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchDeposits', 'accountIndex', 'account_index');
        const request = {
            'account_index': accountIndex,
            'l1_address': address,
        };
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'fetchDeposits', 'apiKeyIndex', 'api_key_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        const response = await this.privateGetDepositHistory(this.extend(request, params));
        //
        //     {
        //         "code": 200,
        //         "deposits": [
        //             {
        //                 "id": "2901843",
        //                 "asset_id": 5,
        //                 "amount": "100000.0",
        //                 "timestamp": 1766112729741,
        //                 "status": "completed",
        //                 "l1_tx_hash": "0xa24d83d58e1fd72b2a44a12d1ec766fb061fa0b806de2fed940b5d8ecd50744d"
        //             }
        //         ],
        //         "cursor": "eyJpbmRleCI6MjkwMTg0MH0="
        //     }
        //
        const data = this.safeList(response, 'deposits', []);
        const cursor = this.safeString(response, 'cursor');
        const first = this.safeDict(data, 0);
        if ((first !== undefined) && (cursor !== undefined)) {
            data[0]['cursor'] = cursor;
        }
        return this.parseTransactions(data, currency, since, limit);
    }
    /**
     * @method
     * @name lighter#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://apidocs.lighter.xyz/reference/withdraw_history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchWithdrawals', code, since, limit, params, 'cursor', 'cursor', undefined, 50);
        }
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchWithdrawals', 'accountIndex', 'account_index');
        await this.loadMarkets();
        const request = {
            'account_index': accountIndex,
        };
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'fetchWithdrawals', 'apiKeyIndex', 'api_key_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        const response = await this.privateGetWithdrawHistory(this.extend(request, params));
        //
        //     {
        //         "code": "200",
        //         "message": "string",
        //         "withdraws": [
        //             {
        //                 "id": "string",
        //                 "amount": "0.1",
        //                 "timestamp": "1640995200",
        //                 "status": "failed",
        //                 "type": "secure",
        //                 "l1_tx_hash": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        //             }
        //         ],
        //         "cursor": "string"
        //     }
        //
        const data = this.safeList(response, 'withdraws', []);
        const cursor = this.safeString(response, 'cursor');
        const first = this.safeDict(data, 0);
        if ((first !== undefined) && (cursor !== undefined)) {
            data[0]['cursor'] = cursor;
        }
        return this.parseTransactions(data, currency, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //     {
        //         "id": "2901843",
        //         "asset_id": 5,
        //         "amount": "100000.0",
        //         "timestamp": 1766112729741,
        //         "status": "completed",
        //         "l1_tx_hash": "0xa24d83d58e1fd72b2a44a12d1ec766fb061fa0b806de2fed940b5d8ecd50744d",
        //     }
        //
        // fetchWithdrawals
        //     {
        //         "id": "string",
        //         "amount": "0.1",
        //         "timestamp": "1640995200",
        //         "status": "failed",
        //         "type": "secure",
        //         "l1_tx_hash": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        //     }
        //
        let type = this.safeString(transaction, 'type');
        if (type === undefined) {
            type = 'deposit';
        }
        else {
            type = 'withdrawal';
        }
        const timestamp = this.safeInteger(transaction, 'timestamp');
        const status = this.safeString(transaction, 'status');
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'id'),
            'txid': this.safeString(transaction, 'l1_tx_hash'),
            'type': type,
            'currency': this.safeCurrencyCode(this.safeString(transaction, 'asset_id'), currency),
            'network': undefined,
            'amount': this.safeNumber(transaction, 'amount'),
            'status': this.parseTransactionStatus(status),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': undefined,
            'comment': undefined,
            'fee': undefined,
            'internal': undefined,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'failed': 'failed',
            'pending': 'pending',
            'completed': 'ok',
            'claimable': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name lighter#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @param {int} [params.routeType] wallet type, 0: perp, 1: spot, default is 0
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets();
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'withdraw', 'apiKeyIndex', 'api_key_index');
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'withdraw', 'accountIndex', 'account_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const currency = this.currency(code);
        if (currency['code'] === 'USDC') {
            amount = this.parseToInt(Precise["default"].stringMul(this.pow('10', '6'), this.currencyToPrecision(code, amount)));
        }
        else if (currency['code'] === 'ETH') {
            amount = this.parseToInt(Precise["default"].stringMul(this.pow('10', '8'), this.currencyToPrecision(code, amount)));
        }
        else {
            throw new errors.ExchangeError(this.id + ' withdraw() only supports USDC and ETH transfers');
        }
        const routeType = this.safeInteger(params, 'routeType', 0); // 0: perp, 1: spot
        params = this.omit(params, 'routeType');
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'asset_index': this.parseToInt(currency['id']),
            'route_type': routeType,
            'amount': amount,
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        const [txType, txInfo] = this.lighterSignWithdraw(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx(request);
        return this.parseTransaction(response);
    }
    /**
     * @method
     * @name lighter#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://apidocs.lighter.xyz/reference/trades
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchMyTrades', symbol, since, limit, params, 'next_cursor', 'cursor', undefined, 50);
        }
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'fetchMyTrades', 'accountIndex', 'account_index');
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'fetchMyTrades', 'apiKeyIndex', 'api_key_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const request = {
            'sort_by': 'timestamp',
            'limit': 100,
            'account_index': accountIndex,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 100);
        }
        let until = undefined;
        [until, params] = this.handleOptionAndParams2(params, 'fetchMyTrades', 'until', 'from');
        if (until !== undefined) {
            request['from'] = until;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market_id'] = market['id'];
        }
        const response = await this.privateGetTrades(this.extend(request, params));
        //
        //     {
        //         "code": 200,
        //         "trades": [
        //             {
        //                 "trade_id": 17609,
        //                 "tx_hash": "99ffeaa3899fbaa51043840ddf762fd18c182a33b5125092105bee57af11fab04edf5fd90e969abd",
        //                 "type": "trade",
        //                 "market_id": 0,
        //                 "size": "10.2304",
        //                 "price": "2958.75",
        //                 "usd_amount": "30269.196000",
        //                 "ask_id": 281474977339869,
        //                 "bid_id": 562949952870533,
        //                 "ask_client_id": 0,
        //                 "bid_client_id": 0,
        //                 "ask_account_id": 20,
        //                 "bid_account_id": 1077,
        //                 "is_maker_ask": true,
        //                 "block_height": 102070,
        //                 "timestamp": 1766386112741,
        //                 "taker_position_size_before": "0.0000",
        //                 "taker_entry_quote_before": "0.000000",
        //                 "taker_position_sign_changed": true,
        //                 "maker_position_size_before": "-1856.8547",
        //                 "maker_entry_quote_before": "5491685.069325",
        //                 "maker_initial_margin_fraction_before": 500
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'trades', []);
        for (let i = 0; i < data.length; i++) {
            data[i]['account_index'] = accountIndex;
        }
        const nextCursor = this.safeString(response, 'next_cursor');
        const first = this.safeDict(data, 0);
        if ((first !== undefined) && (nextCursor !== undefined)) {
            data[0]['next_cursor'] = nextCursor;
        }
        return this.parseTrades(data, market, since, limit, params);
    }
    parseTrade(trade, market = undefined) {
        //
        //     {
        //         "trade_id": 17609,
        //         "tx_hash": "99ffeaa3899fbaa51043840ddf762fd18c182a33b5125092105bee57af11fab04edf5fd90e969abd",
        //         "type": "trade",
        //         "market_id": 0,
        //         "size": "10.2304",
        //         "price": "2958.75",
        //         "usd_amount": "30269.196000",
        //         "ask_id": 281474977339869,
        //         "bid_id": 562949952870533,
        //         "ask_client_id": 0,
        //         "bid_client_id": 0,
        //         "ask_account_id": 20,
        //         "bid_account_id": 1077,
        //         "is_maker_ask": true,
        //         "block_height": 102070,
        //         "timestamp": 1766386112741,
        //         "taker_position_size_before": "0.0000",
        //         "taker_entry_quote_before": "0.000000",
        //         "taker_position_sign_changed": true,
        //         "maker_position_size_before": "-1856.8547",
        //         "maker_entry_quote_before": "5491685.069325",
        //         "maker_initial_margin_fraction_before": 500
        //     }
        //
        const marketId = this.safeString(trade, 'market_id');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(trade, 'timestamp');
        const accountIndex = this.safeString(trade, 'account_index');
        const askAccountId = this.safeString(trade, 'ask_account_id');
        const bidAccountId = this.safeString(trade, 'bid_account_id');
        const isMakerAsk = this.safeBool(trade, 'is_maker_ask');
        let side = undefined;
        let orderId = undefined;
        if (accountIndex !== undefined) {
            if (accountIndex === askAccountId) {
                side = 'sell';
                orderId = this.safeString(trade, 'ask_id');
            }
            else if (accountIndex === bidAccountId) {
                side = 'buy';
                orderId = this.safeString(trade, 'bid_id');
            }
        }
        let takerOrMaker = undefined;
        if (side !== undefined && isMakerAsk !== undefined) {
            const isMaker = (side === 'sell') ? isMakerAsk : !isMakerAsk;
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'trade_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': this.safeString(trade, 'type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'size'),
            'cost': this.safeString(trade, 'usd_amount'),
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name lighter#setLeverage
     * @description set the level of leverage for a market
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @param {string} [params.marginMode] margin mode, 'cross' or 'isolated'
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleOptionAndParams2(params, 'setLeverage', 'marginMode', 'margin_mode');
        if (marginMode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires an marginMode parameter');
        }
        return await this.modifyLeverageAndMarginMode(leverage, marginMode, symbol, params);
    }
    /**
     * @method
     * @name lighter#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @param {int} [params.leverage] required leverage
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        if (marginMode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires an marginMode parameter');
        }
        let leverage = undefined;
        [leverage, params] = this.handleOptionAndParams(params, 'setMarginMode', 'leverage', 'leverage');
        if (leverage === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires an leverage parameter');
        }
        return await this.modifyLeverageAndMarginMode(leverage, marginMode, symbol, params);
    }
    async modifyLeverageAndMarginMode(leverage, marginMode, symbol = undefined, params = {}) {
        await this.loadMarkets();
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new errors.BadRequest(this.id + ' modifyLeverageAndMarginMode() requires a marginMode parameter that must be either cross or isolated');
        }
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'modifyLeverageAndMarginMode', 'apiKeyIndex', 'api_key_index');
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' modifyLeverageAndMarginMode() requires a symbol argument');
        }
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'modifyLeverageAndMarginMode', 'accountIndex', 'account_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const market = this.market(symbol);
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'market_index': this.parseToInt(market['id']),
            'initial_margin_fraction': this.parseToInt(10000 / leverage),
            'margin_mode': (marginMode === 'cross') ? 0 : 1,
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        const [txType, txInfo] = this.lighterSignUpdateLeverage(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        return await this.publicPostSendTx(request);
    }
    /**
     * @method
     * @name lighter#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'cancelOrder', 'apiKeyIndex', 'api_key_index');
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        const market = this.market(symbol);
        const clientOrderId = this.safeString2(params, 'client_order_index', 'clientOrderId');
        params = this.omit(params, ['client_order_index', 'clientOrderId']);
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'cancelOrder', 'accountIndex', 'account_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'market_index': this.parseToInt(market['id']),
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        if (clientOrderId !== undefined) {
            signRaw['order_index'] = this.parseToInt(clientOrderId);
        }
        else if (id !== undefined) {
            signRaw['order_index'] = this.parseToInt(id);
        }
        else {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder requires order id or client order id');
        }
        const [txType, txInfo] = this.lighterSignCancelOrder(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx(request);
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name lighter#cancelAllOrders
     * @description cancel all open orders
     * @param {string} [symbol] unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'cancelAllOrders', 'apiKeyIndex', 'api_key_index');
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'cancelAllOrders', 'accountIndex', 'account_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'time_in_force': 0,
            'time': 0,
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        const [txType, txInfo] = this.lighterSignCancelAllOrders(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx(request);
        return this.parseOrders([response]);
    }
    /**
     * @method
     * @name lighter#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    async cancelAllOrdersAfter(timeout, params = {}) {
        await this.loadMarkets();
        if ((timeout < 300000) || (timeout > 1296000000)) {
            throw new errors.BadRequest(this.id + ' timeout should be between 5 minutes and 15 days.');
        }
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'cancelOrder', 'apiKeyIndex', 'api_key_index');
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'cancelAllOrdersAfter', 'accountIndex', 'account_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'time_in_force': 1,
            'time': this.milliseconds() + timeout,
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        const [txType, txInfo] = this.lighterSignCancelAllOrders(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx(request);
        return response;
    }
    /**
     * @method
     * @name lighter#addMargin
     * @description add margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=add-margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        const request = {
            'direction': 1,
        };
        return await this.setMargin(symbol, amount, this.extend(request, params));
    }
    /**
     * @method
     * @name lighter#reduceMargin
     * @description remove margin from a position
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=reduce-margin-structure}
     */
    async reduceMargin(symbol, amount, params = {}) {
        const request = {
            'direction': 0,
        };
        return await this.setMargin(symbol, amount, this.extend(request, params));
    }
    /**
     * @method
     * @name lighter#setMargin
     * @description Either adds or reduces margin in an isolated position in order to set the margin to a specific value
     * @param {string} symbol unified market symbol of the market to set margin in
     * @param {float} amount the amount to set the margin to
     * @param {object} [params] parameters specific to the bingx api endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object} A [margin structure]{@link https://docs.ccxt.com/?id=add-margin-structure}
     */
    async setMargin(symbol, amount, params = {}) {
        await this.loadMarkets();
        let apiKeyIndex = undefined;
        [apiKeyIndex, params] = this.handleApiKeyIndex(params, 'setMargin', 'apiKeyIndex', 'api_key_index');
        const direction = this.safeInteger(params, 'direction'); // 1 increase margin 0 decrease margin
        if (direction === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMargin() requires a direction parameter either 1 (increase margin) or 0 (decrease margin)');
        }
        if (!this.inArray(direction, [0, 1])) {
            throw new errors.ArgumentsRequired(this.id + ' setMargin() requires a direction parameter either 1 (increase margin) or 0 (decrease margin)');
        }
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMargin() requires a symbol argument');
        }
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'setMargin', 'accountIndex', 'account_index');
        const strAccountIndex = this.numberToString(accountIndex);
        const strApiKeyIndex = this.numberToString(apiKeyIndex);
        const signer = await this.loadAccount(this.options['chainId'], this.getLighterPrivateKey(strAccountIndex, strApiKeyIndex), strApiKeyIndex, strAccountIndex, params);
        const market = this.market(symbol);
        const nonce = await this.fetchNonce(accountIndex, apiKeyIndex, params);
        const signRaw = {
            'market_index': this.parseToInt(market['id']),
            'usdc_amount': this.parseToInt(Precise["default"].stringMul(this.pow('10', '6'), this.currencyToPrecision('USDC', amount))),
            'direction': direction,
            'nonce': nonce,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        const [txType, txInfo] = this.lighterSignUpdateMargin(signer, this.extend(signRaw, params));
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx(request);
        return this.parseMarginModification(response, market);
    }
    parseMarginModification(data, market = undefined) {
        const timestamp = this.safeInteger(data, 'predicted_execution_time_ms');
        return {
            'info': data,
            'symbol': this.safeString(market, 'symbol'),
            'type': undefined,
            'marginMode': undefined,
            'amount': undefined,
            'total': undefined,
            'code': 'USDC',
            'status': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = undefined;
        if (api === 'root') {
            url = this.implodeHostname(this.urls['api']['public']);
        }
        else {
            url = this.implodeHostname(this.urls['api'][api]) + '/api/' + this.version + '/' + path;
        }
        if (api === 'private') {
            headers = {
                'Authorization': this.createAuth(params),
            };
        }
        if (Object.keys(params).length) {
            if (method === 'POST') {
                headers = {
                    'Content-Type': 'multipart/form-data',
                };
                body = params;
            }
            else {
                url += '?' + this.rawencode(params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "code": "200",
        //         "message": "string"
        //     }
        //
        const code = this.safeString(response, 'code');
        const message = this.safeString(response, 'msg');
        if (code !== undefined && code !== '0' && code !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

exports["default"] = lighter;
