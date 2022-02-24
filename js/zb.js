'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, BadSymbol, ExchangeError, ArgumentsRequired, AuthenticationError, InsufficientFunds, OrderNotFound, ExchangeNotAvailable, RateLimitExceeded, PermissionDenied, InvalidOrder, InvalidAddress, OnMaintenance, RequestTimeout, AccountSuspended } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class zb extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zb',
            'name': 'ZB',
            'countries': [ 'CN' ],
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': undefined, // has but unimplemented
                'future': undefined,
                'option': undefined,
                'cancelOrder': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDeposits': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'setLeverage': true,
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
            'exceptions': {
                'ws': {
                    //  '1000': ExchangeError, // The call is successful.
                    '1001': ExchangeError, // General error prompt
                    '1002': ExchangeError, // Internal Error
                    '1003': AuthenticationError, // Fail to verify
                    '1004': AuthenticationError, // The transaction password is locked
                    '1005': AuthenticationError, // Wrong transaction password, please check it and re-enter。
                    '1006': PermissionDenied, // Real-name authentication is pending approval or unapproved
                    '1007': ExchangeError, // Channel does not exist
                    '1009': OnMaintenance, // This interface is under maintenance
                    '1010': ExchangeNotAvailable, // Not available now
                    '1012': PermissionDenied, // Insufficient permissions
                    '1013': ExchangeError, // Cannot trade, please contact email: support@zb.cn for support.
                    '1014': ExchangeError, // Cannot sell during the pre-sale period
                    '2001': InsufficientFunds, // Insufficient CNY account balance
                    '2002': InsufficientFunds, // Insufficient BTC account balance
                    '2003': InsufficientFunds, // Insufficient LTC account balance
                    '2005': InsufficientFunds, // Insufficient ETH account balance
                    '2006': InsufficientFunds, // ETCInsufficient account balance
                    '2007': InsufficientFunds, // BTSInsufficient account balance
                    '2008': InsufficientFunds, // EOSInsufficient account balance
                    '2009': InsufficientFunds, // BCCInsufficient account balance
                    '3001': OrderNotFound, // Order not found or is completed
                    '3002': InvalidOrder, // Invalid amount
                    '3003': InvalidOrder, // Invalid quantity
                    '3004': AuthenticationError, // User does not exist
                    '3005': BadRequest, // Invalid parameter
                    '3006': PermissionDenied, // Invalid IP or not consistent with the bound IP
                    '3007': RequestTimeout, // The request time has expired
                    '3008': ExchangeError, // Transaction not found
                    '3009': InvalidOrder, // The price exceeds the limit
                    '3010': PermissionDenied, // It fails to place an order, due to you have set up to prohibit trading of this market.
                    '3011': InvalidOrder, // The entrusted price is abnormal, please modify it and place order again
                    '3012': InvalidOrder, // Duplicate custom customerOrderId
                    '4001': AccountSuspended, // APIThe interface is locked for one hour
                    '4002': RateLimitExceeded, // Request too frequently
                },
                'exact': {
                    // '1000': 'Successful operation',
                    '1001': ExchangeError, // 'General error message',
                    '1002': ExchangeError, // 'Internal error',
                    '1003': AuthenticationError, // 'Verification does not pass',
                    '1004': AuthenticationError, // 'Funding security password lock',
                    '1005': AuthenticationError, // 'Funds security password is incorrect, please confirm and re-enter.',
                    '1006': AuthenticationError, // 'Real-name certification pending approval or audit does not pass',
                    '1009': ExchangeNotAvailable, // 'This interface is under maintenance',
                    '1010': ExchangeNotAvailable, // Not available now
                    '1012': PermissionDenied, // Insufficient permissions
                    '1013': ExchangeError, // Cannot trade, please contact email: support@zb.cn for support.
                    '1014': ExchangeError, // Cannot sell during the pre-sale period
                    '2001': InsufficientFunds, // 'Insufficient CNY Balance',
                    '2002': InsufficientFunds, // 'Insufficient BTC Balance',
                    '2003': InsufficientFunds, // 'Insufficient LTC Balance',
                    '2005': InsufficientFunds, // 'Insufficient ETH Balance',
                    '2006': InsufficientFunds, // 'Insufficient ETC Balance',
                    '2007': InsufficientFunds, // 'Insufficient BTS Balance',
                    '2008': InsufficientFunds, // EOSInsufficient account balance
                    '2009': InsufficientFunds, // 'Account balance is not enough',
                    '3001': OrderNotFound, // 'Pending orders not found',
                    '3002': InvalidOrder, // 'Invalid price',
                    '3003': InvalidOrder, // 'Invalid amount',
                    '3004': AuthenticationError, // 'User does not exist',
                    '3005': BadRequest, // 'Invalid parameter',
                    '3006': AuthenticationError, // 'Invalid IP or inconsistent with the bound IP',
                    '3007': AuthenticationError, // 'The request time has expired',
                    '3008': OrderNotFound, // 'Transaction records not found',
                    '3009': InvalidOrder, // 'The price exceeds the limit',
                    '3010': PermissionDenied, // It fails to place an order, due to you have set up to prohibit trading of this market.
                    '3011': InvalidOrder, // 'The entrusted price is abnormal, please modify it and place order again',
                    '3012': InvalidOrder, // Duplicate custom customerOrderId
                    '4001': ExchangeNotAvailable, // 'API interface is locked or not enabled',
                    '4002': RateLimitExceeded, // 'Request too often',
                    '10017': PermissionDenied, // {"code":10017,"desc":"没有权限"} when contract trading is not enabled on the api key
                },
                'broad': {
                    '提币地址有误，请先添加提币地址。': InvalidAddress, // {"code":1001,"message":"提币地址有误，请先添加提币地址。"}
                    '资金不足,无法划账': InsufficientFunds, // {"code":1001,"message":"资金不足,无法划账"}
                    '响应超时': RequestTimeout, // {"code":1001,"message":"响应超时"}
                },
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg',
                'api': {
                    'spot': {
                        'v1': {
                            'public': 'https://api.zb.work/data',
                            'private': 'https://trade.zb.work/api',
                        },
                    },
                    'contract': {
                        'v1': {
                            'public': 'https://fapi.zb.com/api/public',
                        },
                        'v2': {
                            'public': 'https://fapi.zb.com/Server/api',
                            'private': 'https://fapi.zb.com/Server/api',
                        },
                    },
                },
                'www': 'https://www.zb.com',
                'doc': 'https://www.zb.com/i/developer',
                'fees': 'https://www.zb.com/i/rate',
                'referral': {
                    'url': 'https://www.zbex.club/en/register?ref=4301lera',
                    'discount': 0.16,
                },
            },
            'api': {
                'spot': {
                    'v1': {
                        'public': {
                            'get': [
                                'markets',
                                'ticker',
                                'allTicker',
                                'depth',
                                'trades',
                                'kline',
                                'getGroupMarkets',
                                'getFeeInfo',
                            ],
                        },
                        'private': {
                            'get': [
                                // spot API
                                'order',
                                'orderMoreV2',
                                'cancelOrder',
                                'getOrder',
                                'getOrders',
                                'getOrdersNew',
                                'getOrdersIgnoreTradeType',
                                'getUnfinishedOrdersIgnoreTradeType',
                                'getFinishedAndPartialOrders',
                                'getAccountInfo',
                                'getUserAddress',
                                'getPayinAddress',
                                'getWithdrawAddress',
                                'getWithdrawRecord',
                                'getChargeRecord',
                                'getCnyWithdrawRecord',
                                'getCnyChargeRecord',
                                'withdraw',
                                // sub accounts
                                'addSubUser',
                                'getSubUserList',
                                'doTransferFunds',
                                'createSubUserKey', // removed on 2021-03-16 according to the update log in the API doc
                                // leverage API
                                'getLeverAssetsInfo',
                                'getLeverBills',
                                'transferInLever',
                                'transferOutLever',
                                'loan',
                                'cancelLoan',
                                'getLoans',
                                'getLoanRecords',
                                'borrow',
                                'autoBorrow',
                                'repay',
                                'doAllRepay',
                                'getRepayments',
                                'getFinanceRecords',
                                'changeInvestMark',
                                'changeLoop',
                                // cross API
                                'getCrossAssets',
                                'getCrossBills',
                                'transferInCross',
                                'transferOutCross',
                                'doCrossLoan',
                                'doCrossRepay',
                                'getCrossRepayRecords',
                            ],
                        },
                    },
                },
                'contract': {
                    'v1': {
                        'public': {
                            'get': [
                                'depth',
                                'fundingRate',
                                'indexKline',
                                'indexPrice',
                                'kCline',
                                'markKline',
                                'markPrice',
                                'ticker',
                                'trade',
                            ],
                        },
                    },
                    'v2': {
                        'public': {
                            'get': [
                                'allForceOrders',
                                'config/marketList',
                                'topLongShortAccountRatio',
                                'topLongShortPositionRatio',
                                'fundingRate',
                                'premiumIndex',
                            ],
                        },
                        'private': {
                            'get': [
                                'Fund/balance',
                                'Fund/getAccount',
                                'Fund/getBill',
                                'Fund/getBillTypeList',
                                'Fund/marginHistory',
                                'Positions/getPositions',
                                'Positions/getNominalValue',
                                'Positions/marginInfo',
                                'setting/get',
                                'trade/getAllOrders',
                                'trade/getOrder',
                                'trade/getOrderAlgos',
                                'trade/getTradeList',
                                'trade/getUndoneOrders',
                                'trade/tradeHistory',
                            ],
                            'post': [
                                'activity/buyTicket',
                                'Fund/transferFund',
                                'Positions/setMarginCoins',
                                'Positions/updateAppendUSDValue',
                                'Positions/updateMargin',
                                'setting/setLeverage',
                                'trade/batchOrder',
                                'trade/batchCancelOrder',
                                'trade/cancelAlgos',
                                'trade/cancelAllOrders',
                                'trade/cancelOrder',
                                'trade/order',
                                'trade/orderAlgo',
                                'trade/updateOrderAlgo',
                            ],
                        },
                    },
                },
            },
            'fees': {
                'funding': {
                    'withdraw': {},
                },
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'commonCurrencies': {
                'ANG': 'Anagram',
                'ENT': 'ENTCash',
                'BCHABC': 'BCHABC', // conflict with BCH / BCHA
                'BCHSV': 'BCHSV', // conflict with BCH / BSV
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.spotV1PublicGetMarkets (params);
        //
        //     {
        //         "zb_qc":{
        //             "amountScale":2,
        //             "minAmount":0.01,
        //             "minSize":5,
        //             "priceScale":4,
        //         },
        //     }
        //
        const contracts = await this.contractV2PublicGetConfigMarketList (params);
        //
        //     {
        //         BTC_USDT: {
        //             symbol: 'BTC_USDT',
        //             buyerCurrencyId: '6',
        //             contractType: '1',
        //             defaultMarginMode: '1',
        //             marketType: '2',
        //             historyDBName: 'trade_history_readonly.dbc',
        //             defaultLeverage: '20',
        //             id: '100',
        //             canCancelOrder: true,
        //             area: '1',
        //             mixMarginCoinName: 'usdt',
        //             fundingRateRatio: '0.25',
        //             marginCurrencyName: 'usdt',
        //             minTradeMoney: '0.0001',
        //             enableTime: '1638954000000',
        //             maxTradeMoney: '10000000',
        //             canTrade: true,
        //             maxLeverage: '125',
        //             defaultPositionsMode: '2',
        //             onlyWhitelistVisible: false,
        //             riskWarnRatio: '0.8',
        //             marginDecimal: '8',
        //             spot: false,
        //             status: '1',
        //             amountDecimal: '3',
        //             leverage: false,
        //             minAmount: '0.001',
        //             canOrder: true,
        //             duration: '1',
        //             feeDecimal: '8',
        //             sellerCurrencyId: '1',
        //             maxAmount: '1000',
        //             canOpenPosition: true,
        //             isSupportMixMargin: false,
        //             markPriceLimitRate: '0.05',
        //             marginCurrencyId: '6',
        //             stopFundingFee: false,
        //             priceDecimal: '2',
        //             lightenUpFeeRate: '0',
        //             futures: true,
        //             sellerCurrencyName: 'btc',
        //             marketPriceLimitRate: '0.05',
        //             canRebate: true,
        //             marketName: 'BTC_USDT',
        //             depth: [ 0.01, 0.1, 1 ],
        //             createTime: '1607590430094',
        //             mixMarginCoinIds: [ 6 ],
        //             buyerCurrencyName: 'usdt',
        //             stopService: false
        //         },
        //     }
        //
        const contractsData = this.safeValue (contracts, 'data', []);
        const contractsById = this.indexBy (contractsData, 'marketName');
        const dataById = this.deepExtend (contractsById, markets);
        const keys = Object.keys (dataById);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = dataById[id];
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settleId = this.safeValue (market, 'marginCurrencyName');
            const settle = this.safeCurrencyCode (settleId);
            const spot = settle === undefined;
            const swap = this.safeValue (market, 'futures', false);
            const linear = swap ? true : undefined;
            let active = true;
            let symbol = base + '/' + quote;
            const amountPrecisionString = this.safeString2 (market, 'amountScale', 'amountDecimal');
            const pricePrecisionString = this.safeString2 (market, 'priceScale', 'priceDecimal');
            if (swap) {
                const status = this.safeString (market, 'status');
                active = (status === '1');
                symbol = base + '/' + quote + ':' + settle;
            }
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
                'margin': false,
                'swap': swap,
                'future': false,
                'option': false,
                'active': active,
                'contract': swap,
                'linear': linear,
                'inverse': swap ? !linear : undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': parseInt (amountPrecisionString),
                    'price': parseInt (pricePrecisionString),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minAmount'),
                        'max': this.safeNumber (market, 'maxAmount'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber2 (market, 'minSize', 'minTradeMoney'),
                        'max': this.safeNumber (market, 'maxTradeMoney'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.spotV1PublicGetGetFeeInfo (params);
        //
        //     {
        //         "code":1000,
        //         "message":"success",
        //         "result":{
        //             "USDT":[
        //                 {
        //                     "chainName":"TRC20",
        //                     "canWithdraw":true,
        //                     "fee":1.0,
        //                     "mainChainName":"TRX",
        //                     "canDeposit":true
        //                 },
        //                 {
        //                     "chainName":"OMNI",
        //                     "canWithdraw":true,
        //                     "fee":5.0,
        //                     "mainChainName":"BTC",
        //                     "canDeposit":true
        //                 },
        //                 {
        //                     "chainName":"ERC20",
        //                     "canWithdraw":true,
        //                     "fee":15.0,
        //                     "mainChainName":"ETH",
        //                     "canDeposit":true
        //                 }
        //             ],
        //         }
        //     }
        //
        const currencies = this.safeValue (response, 'result', {});
        const ids = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            const code = this.safeCurrencyCode (id);
            const precision = undefined;
            let isWithdrawEnabled = true;
            let isDepositEnabled = true;
            const fees = {};
            for (let j = 0; j < currency.length; j++) {
                const networkItem = currency[j];
                const network = this.safeString (networkItem, 'chainName');
                // const name = this.safeString (networkItem, 'name');
                const withdrawFee = this.safeNumber (networkItem, 'fee');
                const depositEnable = this.safeValue (networkItem, 'canDeposit');
                const withdrawEnable = this.safeValue (networkItem, 'canWithdraw');
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[network] = withdrawFee;
            }
            const active = (isWithdrawEnabled && isDepositEnabled);
            result[code] = {
                'id': id,
                'name': undefined,
                'code': code,
                'precision': precision,
                'info': currency,
                'active': active,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'fee': undefined,
                'fees': fees,
                'limits': this.limits,
            };
        }
        return result;
    }

    parseBalance (response) {
        const balances = this.safeValue (response['result'], 'coins');
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            //     {        enName: "BTC",
            //               freez: "0.00000000",
            //         unitDecimal:  8, // always 8
            //              cnName: "BTC",
            //       isCanRecharge:  true, // TODO: should use this
            //             unitTag: "฿",
            //       isCanWithdraw:  true,  // TODO: should use this
            //           available: "0.00000000",
            //                 key: "btc"         }
            const account = this.account ();
            const currencyId = this.safeString (balance, 'key');
            const code = this.safeCurrencyCode (currencyId);
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'freez');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.spotV1PrivateGetGetAccountInfo (params);
        // todo: use this somehow
        // let permissions = response['result']['base'];
        return this.parseBalance (response);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        // fetchDepositAddress
        //
        //     {
        //         "key": "0x0af7f36b8f09410f3df62c81e5846da673d4d9a9"
        //     }
        //
        // fetchDepositAddresses
        //
        //     {
        //         "blockChain": "btc",
        //         "isUseMemo": false,
        //         "address": "1LL5ati6pXHZnTGzHSA3rWdqi4mGGXudwM",
        //         "canWithdraw": true,
        //         "canDeposit": true
        //     }
        //     {
        //         "blockChain": "bts",
        //         "isUseMemo": true,
        //         "account": "btstest",
        //         "memo": "123",
        //         "canWithdraw": true,
        //         "canDeposit": true
        //     }
        //
        let address = this.safeString2 (depositAddress, 'key', 'address');
        let tag = undefined;
        const memo = this.safeString (depositAddress, 'memo');
        if (memo !== undefined) {
            tag = memo;
        } else if (address.indexOf ('_') >= 0) {
            const parts = address.split ('_');
            address = parts[0];  // WARNING: MAY BE tag_address INSTEAD OF address_tag FOR SOME CURRENCIES!!
            tag = parts[1];
        }
        const currencyId = this.safeString (depositAddress, 'blockChain');
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.spotV1PrivateGetGetPayinAddress (params);
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": [
        //                 {
        //                     "blockChain": "btc",
        //                     "isUseMemo": false,
        //                     "address": "1LL5ati6pXHZnTGzHSA3rWdqi4mGGXudwM",
        //                     "canWithdraw": true,
        //                     "canDeposit": true
        //                 },
        //                 {
        //                     "blockChain": "bts",
        //                     "isUseMemo": true,
        //                     "account": "btstest",
        //                     "memo": "123",
        //                     "canWithdraw": true,
        //                     "canDeposit": true
        //                 },
        //             ]
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', []);
        return this.parseDepositAddresses (datas, codes);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spotV1PrivateGetGetUserAddress (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "key": "0x0af7f36b8f09410f3df62c81e5846da673d4d9a9"
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        return this.parseDepositAddress (datas, currency);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'market': market['id'], // only applicable to SPOT
            // 'symbol': market['id'], // only applicable to SWAP
            // 'size': limit, // 1-50 applicable to SPOT and SWAP
            // 'merge': 5.0, // float default depth only applicable to SPOT
            // 'scale': 5, // int accuracy, only applicable to SWAP
        };
        const marketIdField = market['swap'] ? 'symbol' : 'market';
        request[marketIdField] = market['id'];
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PublicGetDepth',
            'swap': 'contractV1PublicGetDepth',
        });
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "asks":[
        //             [35000.0,0.2741],
        //             [34949.0,0.0173],
        //             [34900.0,0.5004],
        //         ],
        //         "bids":[
        //             [34119.32,0.0030],
        //             [34107.83,0.1500],
        //             [34104.42,0.1500],
        //         ],
        //         "timestamp":1624536510
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": {
        //             "asks": [
        //                 [43416.6,0.02],
        //                 [43418.25,0.04],
        //                 [43425.82,0.02]
        //             ],
        //             "bids": [
        //                 [43414.61,0.1],
        //                 [43414.18,0.04],
        //                 [43413.03,0.05]
        //             ],
        //             "time": 1645087743071
        //         }
        //     }
        //
        let result = undefined;
        let timestamp = undefined;
        if (market['type'] === 'swap') {
            result = this.safeValue (response, 'data');
            timestamp = this.safeInteger (result, 'time');
        } else {
            result = response;
            timestamp = this.safeTimestamp (response, 'timestamp');
        }
        return this.parseOrderBook (result, symbol, timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.spotV1PublicGetAllTicker (params);
        const result = {};
        const marketsByIdWithoutUnderscore = {};
        const marketIds = Object.keys (this.markets_by_id);
        for (let i = 0; i < marketIds.length; i++) {
            const tickerId = marketIds[i].replace ('_', '');
            marketsByIdWithoutUnderscore[tickerId] = this.markets_by_id[marketIds[i]];
        }
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const market = marketsByIdWithoutUnderscore[ids[i]];
            result[market['symbol']] = this.parseTicker (response[ids[i]], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'market': market['id'], // only applicable to SPOT
            // 'symbol': market['id'], // only applicable to SWAP
        };
        const marketIdField = market['swap'] ? 'symbol' : 'market';
        request[marketIdField] = market['id'];
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PublicGetTicker',
            'swap': 'contractV1PublicGetTicker',
        });
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "date":"1624399623587",
        //         "ticker":{
        //             "high":"33298.38",
        //             "vol":"56152.9012",
        //             "last":"32578.55",
        //             "low":"28808.19",
        //             "buy":"32572.68",
        //             "sell":"32615.37",
        //             "turnover":"1764201303.6100",
        //             "open":"31664.85",
        //             "riseRate":"2.89"
        //         }
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": {
        //             "BTC_USDT": [44053.47,44357.77,42911.54,43297.79,53471.264,-1.72,1645093002,302201.255084]
        //         }
        //     }
        //
        let ticker = undefined;
        if (market['type'] === 'swap') {
            ticker = {};
            const data = this.safeValue (response, 'data');
            const values = this.safeValue (data, market['id']);
            for (let i = 0; i < values.length; i++) {
                ticker['open'] = this.safeValue (values, 0);
                ticker['high'] = this.safeValue (values, 1);
                ticker['low'] = this.safeValue (values, 2);
                ticker['last'] = this.safeValue (values, 3);
                ticker['vol'] = this.safeValue (values, 4);
                ticker['riseRate'] = this.safeValue (values, 5);
            }
        } else {
            ticker = this.safeValue (response, 'ticker', {});
            ticker['date'] = this.safeValue (response, 'date');
        }
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // Spot
        //
        //     {
        //         "date":"1624399623587", // injected from outside
        //         "high":"33298.38",
        //         "vol":"56152.9012",
        //         "last":"32578.55",
        //         "low":"28808.19",
        //         "buy":"32572.68",
        //         "sell":"32615.37",
        //         "turnover":"1764201303.6100",
        //         "open":"31664.85",
        //         "riseRate":"2.89"
        //     }
        //
        // Swap
        //
        //     {
        //         open: 44083.82,
        //         high: 44357.77,
        //         low: 42911.54,
        //         last: 43097.87,
        //         vol: 53451.641,
        //         riseRate: -2.24
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date', this.milliseconds ());
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 1000;
        }
        const request = {
            'market': market['id'],
            'type': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.spotV1PublicGetKline (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         "date":1624537391,
        //         "amount":"0.0142",
        //         "price":"33936.42",
        //         "trade_type":"ask",
        //         "type":"sell",
        //         "tid":1718869018
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'date');
        let side = this.safeString (trade, 'trade_type');
        side = (side === 'bid') ? 'buy' : 'sell';
        const id = this.safeString (trade, 'tid');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.spotV1PublicGetTrades (this.extend (request, params));
        //
        //     [
        //         {"date":1624537391,"amount":"0.0142","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869018},
        //         {"date":1624537391,"amount":"0.0010","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869020},
        //         {"date":1624537391,"amount":"0.0133","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869021},
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const request = {
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            'tradeType': (side === 'buy') ? '1' : '0',
            'currency': this.marketId (symbol),
        };
        const response = await this.spotV1PrivateGetOrder (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        return await this.spotV1PrivateGetCancelOrder (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        const response = await this.spotV1PrivateGetGetOrder (this.extend (request, params));
        //
        //     {
        //         'total_amount': 0.01,
        //         'id': '20180910244276459',
        //         'price': 180.0,
        //         'trade_date': 1536576744960,
        //         'status': 2,
        //         'trade_money': '1.96742',
        //         'trade_amount': 0.01,
        //         'type': 0,
        //         'currency': 'eth_usdt'
        //     }
        //
        return this.parseOrder (response, undefined);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'pageIndex': 1, // default pageIndex is 1
            'pageSize': limit, // default pageSize is 50
        };
        let method = 'spotV1PrivateGetGetOrdersIgnoreTradeType';
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'spotV1PrivateGetGetOrdersNew';
        }
        let response = undefined;
        try {
            response = await this[method] (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'pageIndex': 1, // default pageIndex is 1
            'pageSize': limit, // default pageSize is 10, doesn't work with other values now
        };
        const response = await this.spotV1PrivateGetGetFinishedAndPartialOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const request = {
            'pageSize': limit, // default pageSize is 10 for spot, 30 for swap
            // 'currency': market['id'], // only applicable to SPOT
            // 'pageIndex': 1, // only applicable to SPOT
            // 'symbol': market['id'], // only applicable to SWAP
            // 'pageNum': 1, // only applicable to SWAP
            // 'type': params['type'], // only applicable to SWAP
            // 'side': params['side'], // only applicable to SWAP
            // 'action': params['action'], // only applicable to SWAP
        };
        const marketIdField = market['swap'] ? 'symbol' : 'currency';
        request[marketIdField] = market['id'];
        const pageNumField = market['swap'] ? 'pageNum' : 'pageIndex';
        request[pageNumField] = 1;
        if (swap) {
            request['startTime'] = since;
        }
        let method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PrivateGetGetUnfinishedOrdersIgnoreTradeType',
            'swap': 'contractV2PrivateGetTradeGetUndoneOrders',
        });
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'spotV1PrivateGetGetOrdersNew';
        }
        let response = undefined;
        try {
            response = await this[method] (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        //
        // Spot
        //
        //     [
        //         {
        //             "currency": "btc_usdt",
        //             "id": "20150928158614292",
        //             "price": 1560,
        //             "status": 3,
        //             "total_amount": 0.1,
        //             "trade_amount": 0,
        //             "trade_date": 1443410396717,
        //             "trade_money": 0,
        //             "type": 0,
        //             "fees": "0.03",
        //             "useZbFee": true
        //         },
        //     ]
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "action": 1,
        //                     "amount": "0.003",
        //                     "availableAmount": "0.003",
        //                     "availableValue": "90",
        //                     "avgPrice": "0",
        //                     "canCancel": true,
        //                     "cancelStatus": 20,
        //                     "createTime": "1645694610880",
        //                     "entrustType": 1,
        //                     "id": "6902543489192632320",
        //                     "leverage": 5,
        //                     "margin": "18",
        //                     "marketId": "100",
        //                     "modifyTime": "1645694610883",
        //                     "price": "30000",
        //                     "priority": 0,
        //                     "showStatus": 1,
        //                     "side": 1,
        //                     "sourceType": 1,
        //                     "status": 12,
        //                     "tradeAmount": "0",
        //                     "tradeValue": "0",
        //                     "type": 1,
        //                     "userId": "6896693805014120448",
        //                     "value": "90"
        //                 }
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 30
        //         },
        //         "desc": "操作成功"
        //     }
        //
        if (swap) {
            const data = this.safeValue (response, 'data', {});
            response = this.safeValue (data, 'list', []);
        }
        return this.parseOrders (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         acctType: 0,
        //         currency: 'btc_usdt',
        //         fees: 3.6e-7,
        //         id: '202102282829772463',
        //         price: 45177.5,
        //         status: 2,
        //         total_amount: 0.0002,
        //         trade_amount: 0.0002,
        //         trade_date: 1614515104998,
        //         trade_money: 8.983712,
        //         type: 1,
        //         useZbFee: false
        //     },
        //
        let side = this.safeInteger (order, 'type');
        side = (side === 1) ? 'buy' : 'sell';
        const type = 'limit'; // market order is not availalbe in ZB
        const timestamp = this.safeInteger (order, 'trade_date');
        const marketId = this.safeString (order, 'currency');
        market = this.safeMarket (marketId, market, '_');
        const price = this.safeString (order, 'price');
        const filled = this.safeString (order, 'trade_amount');
        const amount = this.safeString (order, 'total_amount');
        const cost = this.safeString (order, 'trade_money');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'id');
        const feeCost = this.safeNumber (order, 'fees');
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            const zbFees = this.safeValue (order, 'useZbFee');
            if (zbFees === true) {
                feeCurrency = 'ZB';
            } else {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'canceled',
            '2': 'closed',
            '3': 'open', // partial
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '0': 'pending', // submitted, pending confirmation
            '1': 'failed',
            '2': 'ok',
            '3': 'canceled',
            '5': 'ok', // confirmed
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "id": "withdrawalId"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amount": 0.01,
        //         "fees": 0.001,
        //         "id": 2016042556231,
        //         "manageTime": 1461579340000,
        //         "status": 3,
        //         "submitTime": 1461579288000,
        //         "toAddress": "14fxEPirL9fyfw1i9EF439Pq6gQ5xijUmp",
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "address": "1FKN1DZqCm8HaTujDioRL2Aezdh7Qj7xxx",
        //         "amount": "1.00000000",
        //         "confirmTimes": 1,
        //         "currency": "BTC",
        //         "description": "Successfully Confirm",
        //         "hash": "7ce842de187c379abafadd64a5fe66c5c61c8a21fb04edff9532234a1dae6xxx",
        //         "id": 558,
        //         "itransfer": 1,
        //         "status": 2,
        //         "submit_time": "2016-12-07 18:51:57",
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'hash');
        const amount = this.safeNumber (transaction, 'amount');
        let timestamp = this.parse8601 (this.safeString (transaction, 'submit_time'));
        timestamp = this.safeInteger (transaction, 'submitTime', timestamp);
        let address = this.safeString2 (transaction, 'toAddress', 'address');
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split ('_');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        const confirmTimes = this.safeInteger (transaction, 'confirmTimes');
        const updated = this.safeInteger (transaction, 'manageTime');
        let type = undefined;
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        if (address !== undefined) {
            type = (confirmTimes === undefined) ? 'withdrawal' : 'deposit';
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fees');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 1) || (leverage > 125)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 125');
        }
        const market = this.market (symbol);
        let accountType = undefined;
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' setLeverage() supports swap contracts only');
        } else {
            accountType = 1;
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
            'futuresAccountType': accountType, // 1: USDT perpetual swaps
        };
        return await this.contractV2PrivatePostSettingSetLeverage (this.extend (request, params));
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'startTime': since,
            // 'endTime': endTime, // current time by default
            // 'limit': limit, // default 100, max 1000
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const till = this.safeInteger (params, 'till');
        const endTime = this.safeString (params, 'endTime');
        params = this.omit (params, [ 'endTime', 'till' ]);
        if (till !== undefined) {
            request['endTime'] = till;
        } else if (endTime !== undefined) {
            request['endTime'] = endTime;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.contractV2PublicGetFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "fundingRate": "0.0001",
        //                 "fundingTime": "1645171200000"
        //             },
        //         ],
        //         "desc": "操作成功"
        //     }
        //
        const data = this.safeValue (response, 'data');
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeString (entry, 'fundingTime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() does not supports contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.contractV1PublicGetFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": {
        //             "fundingRate": "0.0001",
        //             "nextCalculateTime": "2022-02-19 00:00:00"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //         "fundingRate": "0.0001",
        //         "nextCalculateTime": "2022-02-19 00:00:00"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const fundingRate = this.safeNumber (contract, 'fundingRate');
        const nextFundingDatetime = this.safeString (contract, 'nextCalculateTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': this.parse8601 (nextFundingDatetime),
            'nextFundingDatetime': nextFundingDatetime,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        const password = this.safeString (params, 'safePwd', this.password);
        if (password === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires exchange.password or a safePwd parameter');
        }
        const fees = this.safeNumber (params, 'fees');
        if (fees === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a fees parameter');
        }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag !== undefined) {
            address += '_' + tag;
        }
        const request = {
            'amount': this.currencyToPrecision (code, amount),
            'currency': currency['id'],
            'fees': this.currencyToPrecision (code, fees),
            // 'itransfer': 0, // agree for an internal transfer, 0 disagree, 1 agree, the default is to disagree
            'method': 'withdraw',
            'receiveAddr': address,
            'safePwd': password,
        };
        const response = await this.spotV1PrivateGetWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "id": "withdrawalId"
        //     }
        //
        const transaction = this.parseTransaction (response, currency);
        return this.extend (transaction, {
            'type': 'withdrawal',
            'address': address,
            'addressTo': address,
            'amount': amount,
        });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'pageIndex': 1,
            // 'pageSize': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.spotV1PrivateGetGetWithdrawRecord (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "list": [
        //                     {
        //                         "amount": 0.01,
        //                         "fees": 0.001,
        //                         "id": 2016042556231,
        //                         "manageTime": 1461579340000,
        //                         "status": 3,
        //                         "submitTime": 1461579288000,
        //                         "toAddress": "14fxEPirL9fyfw1i9EF439Pq6gQ5xijUmp",
        //                     },
        //                 ],
        //                 "pageIndex": 1,
        //                 "pageSize": 10,
        //                 "totalCount": 4,
        //                 "totalPage": 1
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        const withdrawals = this.safeValue (datas, 'list', []);
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'pageIndex': 1,
            // 'pageSize': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.spotV1PrivateGetGetChargeRecord (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "list": [
        //                     {
        //                         "address": "1FKN1DZqCm8HaTujDioRL2Aezdh7Qj7xxx",
        //                         "amount": "1.00000000",
        //                         "confirmTimes": 1,
        //                         "currency": "BTC",
        //                         "description": "Successfully Confirm",
        //                         "hash": "7ce842de187c379abafadd64a5fe66c5c61c8a21fb04edff9532234a1dae6xxx",
        //                         "id": 558,
        //                         "itransfer": 1,
        //                         "status": 2,
        //                         "submit_time": "2016-12-07 18:51:57",
        //                     },
        //                 ],
        //                 "pageIndex": 1,
        //                 "pageSize": 10,
        //                 "total": 8
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        const deposits = this.safeValue (datas, 'list', []);
        return this.parseTransactions (deposits, currency, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, version, access ] = api;
        let url = this.urls['api'][section][version][access];
        if (access === 'public') {
            if (path === 'getFeeInfo') {
                url = this.urls['api'][section][version]['private'] + '/' + path;
            } else {
                url += '/' + version + '/' + path;
            }
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (section === 'contract') {
            const timestamp = this.milliseconds ();
            const iso8601 = this.iso8601 (timestamp);
            let signedString = iso8601 + method + '/Server/api/' + version + '/' + path;
            params = this.keysort (params);
            headers = {
                'ZB-APIKEY': this.apiKey,
                'ZB-TIMESTAMP': iso8601,
                // 'ZB-LAN': 'cn', // cn, en, kr
            };
            url += '/' + version + '/' + path;
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (params);
                signedString += this.urlencode (params);
            } else {
                if (Object.keys (params).length) {
                    const query = this.urlencode (params);
                    url += '?' + query;
                    signedString += query;
                }
            }
            const secret = this.hash (this.encode (this.secret), 'sha1');
            const signature = this.hmac (this.encode (signedString), this.encode (secret), 'sha256', 'base64');
            headers['ZB-SIGN'] = signature;
        } else {
            let query = this.keysort (this.extend ({
                'method': path,
                'accesskey': this.apiKey,
            }, params));
            const nonce = this.nonce ();
            query = this.keysort (query);
            const auth = this.rawencode (query);
            const secret = this.hash (this.encode (this.secret), 'sha1');
            const signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            const suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (body[0] === '{') {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            if ('code' in response) {
                const code = this.safeString (response, 'code');
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                if ((code !== '1000') && (code !== '10000')) {
                    throw new ExchangeError (feedback);
                }
            }
            // special case for {"result":false,"message":"服务端忙碌"} (a "Busy Server" reply)
            const result = this.safeValue (response, 'result');
            if (result !== undefined) {
                if (!result) {
                    const message = this.safeString (response, 'message');
                    if (message === '服务端忙碌') {
                        throw new ExchangeNotAvailable (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
