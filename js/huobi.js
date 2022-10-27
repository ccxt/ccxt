'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountNotEnabled, ArgumentsRequired, AuthenticationError, ExchangeError, PermissionDenied, ExchangeNotAvailable, OnMaintenance, InvalidOrder, OrderNotFound, InsufficientFunds, BadSymbol, BadRequest, RateLimitExceeded, RequestTimeout, NetworkError, InvalidAddress, NotSupported } = require ('./base/errors');
const { TICK_SIZE, TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class huobi extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'huobi',
            'name': 'Huobi',
            'countries': [ 'CN' ],
            'rateLimit': 100,
            'userAgent': this.userAgents['chrome100'],
            'certified': true,
            'version': 'v1',
            'accounts': undefined,
            'accountsById': undefined,
            'hostname': 'api.huobi.pro', // api.testnet.huobi.pro
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': undefined,
                'addMargin': undefined,
                'borrowMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': undefined,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': true,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistories': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': true,
                'fetchBorrowRatesPerSymbol': true,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchL3OrderBook': undefined,
                'fetchLedger': true,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': true,
                'fetchSettlementHistory': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': true,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawAddressesByNetwork': true,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': undefined,
                'reduceMargin': undefined,
                'repayMargin': true,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': undefined,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '60min',
                '4h': '4hour',
                '1d': '1day',
                '1w': '1week',
                '1M': '1mon',
                '1y': '1year',
            },
            'urls': {
                // 'test': {
                //     'market': 'https://api.testnet.huobi.pro',
                //     'public': 'https://api.testnet.huobi.pro',
                //     'private': 'https://api.testnet.huobi.pro',
                // },
                'logo': 'https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg',
                'hostnames': {
                    'contract': 'api.hbdm.com',
                    'spot': 'api.huobi.pro',
                    'status': {
                        'spot': 'status.huobigroup.com',
                        'future': {
                            'inverse': 'status-dm.huobigroup.com',
                            'linear': 'status-linear-swap.huobigroup.com', // USDT-Margined Contracts
                        },
                        'swap': {
                            'inverse': 'status-swap.huobigroup.com',
                            'linear': 'status-linear-swap.huobigroup.com', // USDT-Margined Contracts
                        },
                    },
                    // recommended for AWS
                    // 'contract': 'api.hbdm.vn',
                    // 'spot': 'api-aws.huobi.pro',
                },
                'api': {
                    'status': 'https://{hostname}',
                    'contract': 'https://{hostname}',
                    'spot': 'https://{hostname}',
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                    'v2Public': 'https://{hostname}',
                    'v2Private': 'https://{hostname}',
                },
                'www': 'https://www.huobi.com',
                'referral': {
                    'url': 'https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223',
                    'discount': 0.15,
                },
                'doc': [
                    'https://huobiapi.github.io/docs/spot/v1/cn/',
                    'https://huobiapi.github.io/docs/dm/v1/cn/',
                    'https://huobiapi.github.io/docs/coin_margined_swap/v1/cn/',
                    'https://huobiapi.github.io/docs/usdt_swap/v1/cn/',
                    'https://huobiapi.github.io/docs/option/v1/cn/',
                ],
                'fees': 'https://www.huobi.com/about/fee/',
            },
            'api': {
                // ------------------------------------------------------------
                // old api definitions
                'v2Public': {
                    'get': {
                        'reference/currencies': 1, // 币链参考信息
                        'market-status': 1, // 获取当前市场状态
                    },
                },
                'v2Private': {
                    'get': {
                        'account/ledger': 1,
                        'account/withdraw/quota': 1,
                        'account/withdraw/address': 1, // 提币地址查询(限母用户可用)
                        'account/deposit/address': 1,
                        'account/repayment': 5, // 还币交易记录查询
                        'reference/transact-fee-rate': 1,
                        'account/asset-valuation': 0.2, // 获取账户资产估值
                        'point/account': 5, // 点卡余额查询
                        'sub-user/user-list': 1, // 获取子用户列表
                        'sub-user/user-state': 1, // 获取特定子用户的用户状态
                        'sub-user/account-list': 1, // 获取特定子用户的账户列表
                        'sub-user/deposit-address': 1, // 子用户充币地址查询
                        'sub-user/query-deposit': 1, // 子用户充币记录查询
                        'user/api-key': 1, // 母子用户API key信息查询
                        'user/uid': 1, // 母子用户获取用户UID
                        'algo-orders/opening': 1, // 查询未触发OPEN策略委托
                        'algo-orders/history': 1, // 查询策略委托历史
                        'algo-orders/specific': 1, // 查询特定策略委托
                        'c2c/offers': 1, // 查询借入借出订单
                        'c2c/offer': 1, // 查询特定借入借出订单及其交易记录
                        'c2c/transactions': 1, // 查询借入借出交易记录
                        'c2c/repayment': 1, // 查询还币交易记录
                        'c2c/account': 1, // 查询账户余额
                        'etp/reference': 1, // 基础参考信息
                        'etp/transactions': 5, // 获取杠杆ETP申赎记录
                        'etp/transaction': 5, // 获取特定杠杆ETP申赎记录
                        'etp/rebalance': 1, // 获取杠杆ETP调仓记录
                        'etp/limit': 1, // 获取ETP持仓限额
                    },
                    'post': {
                        'account/transfer': 1,
                        'account/repayment': 5, // 归还借币（全仓逐仓通用）
                        'point/transfer': 5, // 点卡划转
                        'sub-user/management': 1, // 冻结/解冻子用户
                        'sub-user/creation': 1, // 子用户创建
                        'sub-user/tradable-market': 1, // 设置子用户交易权限
                        'sub-user/transferability': 1, // 设置子用户资产转出权限
                        'sub-user/api-key-generation': 1, // 子用户API key创建
                        'sub-user/api-key-modification': 1, // 修改子用户API key
                        'sub-user/api-key-deletion': 1, // 删除子用户API key
                        'sub-user/deduct-mode': 1, // 设置子用户手续费抵扣模式
                        'algo-orders': 1, // 策略委托下单
                        'algo-orders/cancel-all-after': 1, // 自动撤销订单
                        'algo-orders/cancellation': 1, // 策略委托（触发前）撤单
                        'c2c/offer': 1, // 借入借出下单
                        'c2c/cancellation': 1, // 借入借出撤单
                        'c2c/cancel-all': 1, // 撤销所有借入借出订单
                        'c2c/repayment': 1, // 还币
                        'c2c/transfer': 1, // 资产划转
                        'etp/creation': 5, // 杠杆ETP换入
                        'etp/redemption': 5, // 杠杆ETP换出
                        'etp/{transactId}/cancel': 10, // 杠杆ETP单个撤单
                        'etp/batch-cancel': 50, // 杠杆ETP批量撤单
                    },
                },
                'public': {
                    'get': {
                        'common/symbols': 1, // 查询系统支持的所有交易对
                        'common/currencys': 1, // 查询系统支持的所有币种
                        'common/timestamp': 1, // 查询系统当前时间
                        'common/exchange': 1, // order limits
                        'settings/currencys': 1, // ?language=en-US
                    },
                },
                'private': {
                    'get': {
                        'account/accounts': 0.2, // 查询当前用户的所有账户(即account-id)
                        'account/accounts/{id}/balance': 0.2, // 查询指定账户的余额
                        'account/accounts/{sub-uid}': 1,
                        'account/history': 4,
                        'cross-margin/loan-info': 1,
                        'margin/loan-info': 1, // 查询借币币息率及额度
                        'fee/fee-rate/get': 1,
                        'order/openOrders': 0.4,
                        'order/orders': 0.4,
                        'order/orders/{id}': 0.4, // 查询某个订单详情
                        'order/orders/{id}/matchresults': 0.4, // 查询某个订单的成交明细
                        'order/orders/getClientOrder': 0.4,
                        'order/history': 1, // 查询当前委托、历史委托
                        'order/matchresults': 1, // 查询当前成交、历史成交
                        // 'dw/withdraw-virtual/addresses', // 查询虚拟币提现地址（Deprecated）
                        'query/deposit-withdraw': 1,
                        // 'margin/loan-info', // duplicate
                        'margin/loan-orders': 0.2, // 借贷订单
                        'margin/accounts/balance': 0.2, // 借贷账户详情
                        'cross-margin/loan-orders': 1, // 查询借币订单
                        'cross-margin/accounts/balance': 1, // 借币账户详情
                        'points/actions': 1,
                        'points/orders': 1,
                        'subuser/aggregate-balance': 10,
                        'stable-coin/exchange_rate': 1,
                        'stable-coin/quote': 1,
                    },
                    'post': {
                        'account/transfer': 1, // 资产划转(该节点为母用户和子用户进行资产划转的通用接口。)
                        'futures/transfer': 1,
                        'order/batch-orders': 0.4,
                        'order/orders/place': 0.2, // 创建并执行一个新订单 (一步下单， 推荐使用)
                        'order/orders/submitCancelClientOrder': 0.2,
                        'order/orders/batchCancelOpenOrders': 0.4,
                        // 'order/orders', // 创建一个新的订单请求 （仅创建订单，不执行下单）
                        // 'order/orders/{id}/place', // 执行一个订单 （仅执行已创建的订单）
                        'order/orders/{id}/submitcancel': 0.2, // 申请撤销一个订单请求
                        'order/orders/batchcancel': 0.4, // 批量撤销订单
                        // 'dw/balance/transfer', // 资产划转
                        'dw/withdraw/api/create': 1, // 申请提现虚拟币
                        // 'dw/withdraw-virtual/create', // 申请提现虚拟币
                        // 'dw/withdraw-virtual/{id}/place', // 确认申请虚拟币提现（Deprecated）
                        'dw/withdraw-virtual/{id}/cancel': 1, // 申请取消提现虚拟币
                        'dw/transfer-in/margin': 10, // 现货账户划入至借贷账户
                        'dw/transfer-out/margin': 10, // 借贷账户划出至现货账户
                        'margin/orders': 10, // 申请借贷
                        'margin/orders/{id}/repay': 10, // 归还借贷
                        'cross-margin/transfer-in': 1, // 资产划转
                        'cross-margin/transfer-out': 1, // 资产划转
                        'cross-margin/orders': 1, // 申请借币
                        'cross-margin/orders/{id}/repay': 1, // 归还借币
                        'stable-coin/exchange': 1,
                        'subuser/transfer': 10,
                    },
                },
                // ------------------------------------------------------------
                // new api definitions
                // 'https://status.huobigroup.com/api/v2/summary.json': 1,
                // 'https://status-dm.huobigroup.com/api/v2/summary.json': 1,
                // 'https://status-swap.huobigroup.com/api/v2/summary.json': 1,
                // 'https://status-linear-swap.huobigroup.com/api/v2/summary.json': 1,
                'status': {
                    'public': {
                        'spot': {
                            'get': {
                                'api/v2/summary.json': 1,
                            },
                        },
                        'future': {
                            'inverse': {
                                'get': {
                                    'api/v2/summary.json': 1,
                                },
                            },
                            'linear': {
                                'get': {
                                    'api/v2/summary.json': 1,
                                },
                            },
                        },
                        'swap': {
                            'inverse': {
                                'get': {
                                    'api/v2/summary.json': 1,
                                },
                            },
                            'linear': {
                                'get': {
                                    'api/v2/summary.json': 1,
                                },
                            },
                        },
                    },
                },
                'spot': {
                    'public': {
                        'get': {
                            'v2/market-status': 1,
                            'v1/common/symbols': 1,
                            'v1/common/currencys': 1,
                            'v2/settings/common/currencies': 1,
                            'v2/reference/currencies': 1,
                            'v1/common/timestamp': 1,
                            'v1/common/exchange': 1, // order limits
                            'v1/settings/common/chains': 1,
                            'v1/settings/common/currencys': 1,
                            'v1/settings/common/symbols': 1,
                            'v2/settings/common/symbols': 1,
                            'v1/settings/common/market-symbols': 1,
                            // Market Data
                            'market/history/candles': 1,
                            'market/history/kline': 1,
                            'market/detail/merged': 1,
                            'market/tickers': 1,
                            'market/detail': 1,
                            'market/depth': 1,
                            'market/trade': 1,
                            'market/history/trade': 1,
                            'market/detail/': 1,
                            'market/etp': 1, // Get real-time equity of leveraged ETP
                            // ETP
                            'v2/etp/reference': 1,
                            'v2/etp/rebalance': 1,
                        },
                    },
                    'private': {
                        'get': {
                            // Account
                            'v1/account/accounts': 0.2,
                            'v1/account/accounts/{account-id}/balance': 0.2,
                            'v2/account/valuation': 1,
                            'v2/account/asset-valuation': 0.2,
                            'v1/account/history': 4,
                            'v2/account/ledger': 1,
                            'v2/point/account': 5,
                            // Wallet (Deposit and Withdraw)
                            'v2/account/deposit/address': 1,
                            'v2/account/withdraw/quota': 1,
                            'v2/account/withdraw/address': 1,
                            'v2/reference/currencies': 1,
                            'v1/query/deposit-withdraw': 1,
                            'v1/query/withdraw/client-order-id': 1,
                            // Sub user management
                            'v2/user/api-key': 1,
                            'v2/user/uid': 1,
                            'v2/sub-user/user-list': 1,
                            'v2/sub-user/user-state': 1,
                            'v2/sub-user/account-list': 1,
                            'v2/sub-user/deposit-address': 1,
                            'v2/sub-user/query-deposit': 1,
                            'v1/subuser/aggregate-balance': 10,
                            'v1/account/accounts/{sub-uid}': 1,
                            // Trading
                            'v1/order/openOrders': 0.4,
                            'v1/order/orders/{order-id}': 0.4,
                            'v1/order/orders/getClientOrder': 0.4,
                            'v1/order/orders/{order-id}/matchresult': 0.4,
                            'v1/order/orders/{order-id}/matchresults': 0.4,
                            'v1/order/orders': 0.4,
                            'v1/order/history': 1,
                            'v1/order/matchresults': 1,
                            'v2/reference/transact-fee-rate': 1,
                            // Conditional Order
                            'v2/algo-orders/opening': 1,
                            'v2/algo-orders/history': 1,
                            'v2/algo-orders/specific': 1,
                            // Margin Loan (Cross/Isolated)
                            'v1/margin/loan-info': 1,
                            'v1/margin/loan-orders': 0.2,
                            'v1/margin/accounts/balance': 0.2,
                            'v1/cross-margin/loan-info': 1,
                            'v1/cross-margin/loan-orders': 1,
                            'v1/cross-margin/accounts/balance': 1,
                            'v2/account/repayment': 5,
                            // Stable Coin Exchange
                            'v1/stable-coin/quote': 1,
                            'v1/stable_coin/exchange_rate': 1,
                            // ETP
                            'v2/etp/transactions': 5,
                            'v2/etp/transaction': 5,
                            'v2/etp/limit': 1,
                        },
                        'post': {
                            // Account
                            'v1/account/transfer': 1,
                            'v1/futures/transfer': 1, // future transfers
                            'v2/point/transfer': 5,
                            'v2/account/transfer': 1, // swap transfers
                            // Wallet (Deposit and Withdraw)
                            'v1/dw/withdraw/api/create': 1,
                            'v1/dw/withdraw-virtual/{withdraw-id}/cancel': 1,
                            // Sub user management
                            'v2/sub-user/deduct-mode': 1,
                            'v2/sub-user/creation': 1,
                            'v2/sub-user/management': 1,
                            'v2/sub-user/tradable-market': 1,
                            'v2/sub-user/transferability': 1,
                            'v2/sub-user/api-key-generation': 1,
                            'v2/sub-user/api-key-modification': 1,
                            'v2/sub-user/api-key-deletion': 1,
                            'v1/subuser/transfer': 10,
                            // Trading
                            'v1/order/orders/place': 0.2,
                            'v1/order/batch-orders': 0.4,
                            'v1/order/orders/{order-id}/submitcancel': 0.2,
                            'v1/order/orders/submitCancelClientOrder': 0.2,
                            'v1/order/orders/batchCancelOpenOrders': 0.4,
                            'v1/order/orders/batchcancel': 0.4,
                            'v2/algo-orders/cancel-all-after': 1,
                            // Conditional Order
                            'v2/algo-orders': 1,
                            'v2/algo-orders/cancellation': 1,
                            // Margin Loan (Cross/Isolated)
                            'v2/account/repayment': 5,
                            'v1/dw/transfer-in/margin': 10,
                            'v1/dw/transfer-out/margin': 10,
                            'v1/margin/orders': 10,
                            'v1/margin/orders/{order-id}/repay': 10,
                            'v1/cross-margin/transfer-in': 1,
                            'v1/cross-margin/transfer-out': 1,
                            'v1/cross-margin/orders': 1,
                            'v1/cross-margin/orders/{order-id}/repay': 1,
                            // Stable Coin Exchange
                            'v1/stable-coin/exchange': 1,
                            // ETP
                            'v2/etp/creation': 5,
                            'v2/etp/redemption': 5,
                            'v2/etp/{transactId}/cancel': 10,
                            'v2/etp/batch-cancel': 50,
                        },
                    },
                },
                'contract': {
                    'public': {
                        'get': {
                            'api/v1/timestamp': 1,
                            'heartbeat/': 1, // backslash is not a typo
                            // Future Market Data interface
                            'api/v1/contract_contract_info': 1,
                            'api/v1/contract_index': 1,
                            'api/v1/contract_price_limit': 1,
                            'api/v1/contract_open_interest': 1,
                            'api/v1/contract_delivery_price': 1,
                            'market/depth': 1,
                            'market/bbo': 1,
                            'market/history/kline': 1,
                            'index/market/history/mark_price_kline': 1,
                            'market/detail/merged': 1,
                            'market/detail/batch_merged': 1,
                            'v2/market/detail/batch_merged': 1,
                            'market/trade': 1,
                            'market/history/trade': 1,
                            'api/v1/contract_risk_info': 1,
                            'api/v1/contract_insurance_fund': 1,
                            'api/v1/contract_adjustfactor': 1,
                            'api/v1/contract_his_open_interest': 1,
                            'api/v1/contract_ladder_margin': 1,
                            'api/v1/contract_api_state': 1,
                            'api/v1/contract_elite_account_ratio': 1,
                            'api/v1/contract_elite_position_ratio': 1,
                            'api/v1/contract_liquidation_orders': 1,
                            'api/v1/contract_settlement_records': 1,
                            'index/market/history/index': 1,
                            'index/market/history/basis': 1,
                            'api/v1/contract_estimated_settlement_price': 1,
                            'api/v3/contract_liquidation_orders': 1,
                            // Swap Market Data interface
                            'swap-api/v1/swap_contract_info': 1,
                            'swap-api/v1/swap_index': 1,
                            'swap-api/v1/swap_price_limit': 1,
                            'swap-api/v1/swap_open_interest': 1,
                            'swap-ex/market/depth': 1,
                            'swap-ex/market/bbo': 1,
                            'swap-ex/market/history/kline': 1,
                            'index/market/history/swap_mark_price_kline': 1,
                            'swap-ex/market/detail/merged': 1,
                            'v2/swap-ex/market/detail/batch_merged': 1,
                            'index/market/history/swap_premium_index_kline': 1,
                            'swap-ex/market/detail/batch_merged': 1,
                            'swap-ex/market/trade': 1,
                            'swap-ex/market/history/trade': 1,
                            'swap-api/v1/swap_risk_info': 1,
                            'swap-api/v1/swap_insurance_fund': 1,
                            'swap-api/v1/swap_adjustfactor': 1,
                            'swap-api/v1/swap_his_open_interest': 1,
                            'swap-api/v1/swap_ladder_margin': 1,
                            'swap-api/v1/swap_api_state': 1,
                            'swap-api/v1/swap_elite_account_ratio': 1,
                            'swap-api/v1/swap_elite_position_ratio': 1,
                            'swap-api/v1/swap_estimated_settlement_price': 1,
                            'swap-api/v1/swap_liquidation_orders': 1,
                            'swap-api/v1/swap_settlement_records': 1,
                            'swap-api/v1/swap_funding_rate': 1,
                            'swap-api/v1/swap_batch_funding_rate': 1,
                            'swap-api/v1/swap_historical_funding_rate': 1,
                            'swap-api/v3/swap_liquidation_orders': 1,
                            'index/market/history/swap_estimated_rate_kline': 1,
                            'index/market/history/swap_basis': 1,
                            // Swap Market Data interface
                            'linear-swap-api/v1/swap_contract_info': 1,
                            'linear-swap-api/v1/swap_index': 1,
                            'linear-swap-api/v1/swap_price_limit': 1,
                            'linear-swap-api/v1/swap_open_interest': 1,
                            'linear-swap-ex/market/depth': 1,
                            'linear-swap-ex/market/bbo': 1,
                            'linear-swap-ex/market/history/kline': 1,
                            'index/market/history/linear_swap_mark_price_kline': 1,
                            'linear-swap-ex/market/detail/merged': 1,
                            'linear-swap-ex/market/detail/batch_merged': 1,
                            'v2/linear-swap-ex/market/detail/batch_merged': 1,
                            'linear-swap-ex/market/trade': 1,
                            'linear-swap-ex/market/history/trade': 1,
                            'linear-swap-api/v1/swap_risk_info': 1,
                            'swap-api/v1/linear-swap-api/v1/swap_insurance_fund': 1,
                            'linear-swap-api/v1/swap_adjustfactor': 1,
                            'linear-swap-api/v1/swap_cross_adjustfactor': 1,
                            'linear-swap-api/v1/swap_his_open_interest': 1,
                            'linear-swap-api/v1/swap_ladder_margin': 1,
                            'linear-swap-api/v1/swap_cross_ladder_margin': 1,
                            'linear-swap-api/v1/swap_api_state': 1,
                            'linear-swap-api/v1/swap_cross_transfer_state': 1,
                            'linear-swap-api/v1/swap_cross_trade_state': 1,
                            'linear-swap-api/v1/swap_elite_account_ratio': 1,
                            'linear-swap-api/v1/swap_elite_position_ratio': 1,
                            'linear-swap-api/v1/swap_liquidation_orders': 1,
                            'linear-swap-api/v1/swap_settlement_records': 1,
                            'linear-swap-api/v1/swap_funding_rate': 1,
                            'linear-swap-api/v1/swap_batch_funding_rate': 1,
                            'linear-swap-api/v1/swap_historical_funding_rate': 1,
                            'linear-swap-api/v3/swap_liquidation_orders': 1,
                            'index/market/history/linear_swap_premium_index_kline': 1,
                            'index/market/history/linear_swap_estimated_rate_kline': 1,
                            'index/market/history/linear_swap_basis': 1,
                            'linear-swap-api/v1/swap_estimated_settlement_price': 1,
                        },
                    },
                    'private': {
                        'get': {
                            // Future Account Interface
                            'api/v1/contract_api_trading_status': 1,
                            // Swap Account Interface
                            'swap-api/v1/swap_api_trading_status': 1,
                            // Swap Account Interface
                            'linear-swap-api/v1/swap_api_trading_status': 1,
                        },
                        'post': {
                            // Future Account Interface
                            'api/v1/contract_balance_valuation': 1,
                            'api/v1/contract_account_info': 1,
                            'api/v1/contract_position_info': 1,
                            'api/v1/contract_sub_auth': 1,
                            'api/v1/contract_sub_account_list': 1,
                            'api/v1/contract_sub_account_info_list': 1,
                            'api/v1/contract_sub_account_info': 1,
                            'api/v1/contract_sub_position_info': 1,
                            'api/v1/contract_financial_record': 1,
                            'api/v1/contract_financial_record_exact': 1,
                            'api/v1/contract_user_settlement_records': 1,
                            'api/v1/contract_order_limit': 1,
                            'api/v1/contract_fee': 1,
                            'api/v1/contract_transfer_limit': 1,
                            'api/v1/contract_position_limit': 1,
                            'api/v1/contract_account_position_info': 1,
                            'api/v1/contract_master_sub_transfer': 1,
                            'api/v1/contract_master_sub_transfer_record': 1,
                            'api/v1/contract_available_level_rate': 1,
                            'api/v3/contract_financial_record': 1,
                            'api/v3/contract_financial_record_exact': 1,
                            // Future Trade Interface
                            'api/v1/contract_order': 1,
                            'v1/contract_batchorder': 1,
                            'api/v1/contract_cancel': 1,
                            'api/v1/contract_cancelall': 1,
                            'api/v1/contract_switch_lever_rate': 1,
                            'api/v1/lightning_close_position': 1,
                            'api/v1/contract_order_info': 1,
                            'api/v1/contract_order_detail': 1,
                            'api/v1/contract_openorders': 1,
                            'api/v1/contract_hisorders': 1,
                            'api/v1/contract_hisorders_exact': 1,
                            'api/v1/contract_matchresults': 1,
                            'api/v1/contract_matchresults_exact': 1,
                            'api/v3/contract_hisorders': 1,
                            'api/v3/contract_hisorders_exact': 1,
                            'api/v3/contract_matchresults': 1,
                            'api/v3/contract_matchresults_exact': 1,
                            // Contract Strategy Order Interface
                            'api/v1/contract_trigger_order': 1,
                            'api/v1/contract_trigger_cancel': 1,
                            'api/v1/contract_trigger_cancelall': 1,
                            'api/v1/contract_trigger_openorders': 1,
                            'api/v1/contract_trigger_hisorders': 1,
                            'api/v1/contract_tpsl_order': 1,
                            'api/v1/contract_tpsl_cancel': 1,
                            'api/v1/contract_tpsl_cancelall': 1,
                            'api/v1/contract_tpsl_openorders': 1,
                            'api/v1/contract_tpsl_hisorders': 1,
                            'api/v1/contract_relation_tpsl_order': 1,
                            'api/v1/contract_track_order': 1,
                            'api/v1/contract_track_cancel': 1,
                            'api/v1/contract_track_cancelall': 1,
                            'api/v1/contract_track_openorders': 1,
                            'api/v1/contract_track_hisorders': 1,
                            // Swap Account Interface
                            'swap-api/v1/swap_balance_valuation': 1,
                            'swap-api/v1/swap_account_info': 1,
                            'swap-api/v1/swap_position_info': 1,
                            'swap-api/v1/swap_account_position_info': 1,
                            'swap-api/v1/swap_sub_auth': 1,
                            'swap-api/v1/swap_sub_account_list': 1,
                            'swap-api/v1/swap_sub_account_info_list': 1,
                            'swap-api/v1/swap_sub_account_info': 1,
                            'swap-api/v1/swap_sub_position_info': 1,
                            'swap-api/v1/swap_financial_record': 1,
                            'swap-api/v1/swap_financial_record_exact': 1,
                            'swap-api/v1/swap_user_settlement_records': 1,
                            'swap-api/v1/swap_available_level_rate': 1,
                            'swap-api/v1/swap_order_limit': 1,
                            'swap-api/v1/swap_fee': 1,
                            'swap-api/v1/swap_transfer_limit': 1,
                            'swap-api/v1/swap_position_limit': 1,
                            'swap-api/v1/swap_master_sub_transfer': 1,
                            'swap-api/v1/swap_master_sub_transfer_record': 1,
                            'swap-api/v3/swap_financial_record': 1,
                            'swap-api/v3/swap_financial_record_exact': 1,
                            // Swap Trade Interface
                            'swap-api/v1/swap_order': 1,
                            'swap-api/v1/swap_batchorder': 1,
                            'swap-api/v1/swap_cancel': 1,
                            'swap-api/v1/swap_cancelall': 1,
                            'swap-api/v1/swap_lightning_close_position': 1,
                            'swap-api/v1/swap_switch_lever_rate': 1,
                            'swap-api/v1/swap_order_info': 1,
                            'swap-api/v1/swap_order_detail': 1,
                            'swap-api/v1/swap_openorders': 1,
                            'swap-api/v1/swap_hisorders': 1,
                            'swap-api/v1/swap_hisorders_exact': 1,
                            'swap-api/v1/swap_matchresults': 1,
                            'swap-api/v1/swap_matchresults_exact': 1,
                            'swap-api/v3/swap_matchresults': 1,
                            'swap-api/v3/swap_matchresults_exact': 1,
                            'swap-api/v3/swap_hisorders': 1,
                            'swap-api/v3/swap_hisorders_exact': 1,
                            // Swap Strategy Order Interface
                            'swap-api/v1/swap_trigger_order': 1,
                            'swap-api/v1/swap_trigger_cancel': 1,
                            'swap-api/v1/swap_trigger_cancelall': 1,
                            'swap-api/v1/swap_trigger_openorders': 1,
                            'swap-api/v1/swap_trigger_hisorders': 1,
                            'swap-api/v1/swap_tpsl_order': 1,
                            'swap-api/v1/swap_tpsl_cancel': 1,
                            'swap-api/v1/swap_tpsl_cancelall': 1,
                            'swap-api/v1/swap_tpsl_openorders': 1,
                            'swap-api/v1/swap_tpsl_hisorders': 1,
                            'swap-api/v1/swap_relation_tpsl_order': 1,
                            'swap-api/v1/swap_track_order': 1,
                            'swap-api/v1/swap_track_cancel': 1,
                            'swap-api/v1/swap_track_cancelall': 1,
                            'swap-api/v1/swap_track_openorders': 1,
                            'swap-api/v1/swap_track_hisorders': 1,
                            // Swap Account Interface
                            'linear-swap-api/v1/swap_lever_position_limit': 1,
                            'linear-swap-api/v1/swap_cross_lever_position_limit': 1,
                            'linear-swap-api/v1/swap_balance_valuation': 1,
                            'linear-swap-api/v1/swap_account_info': 1,
                            'linear-swap-api/v1/swap_cross_account_info': 1,
                            'linear-swap-api/v1/swap_position_info': 1,
                            'linear-swap-api/v1/swap_cross_position_info': 1,
                            'linear-swap-api/v1/swap_account_position_info': 1,
                            'linear-swap-api/v1/swap_cross_account_position_info': 1,
                            'linear-swap-api/v1/swap_sub_auth': 1,
                            'linear-swap-api/v1/swap_sub_account_list': 1,
                            'linear-swap-api/v1/swap_cross_sub_account_list': 1,
                            'linear-swap-api/v1/swap_sub_account_info_list': 1,
                            'linear-swap-api/v1/swap_cross_sub_account_info_list': 1,
                            'linear-swap-api/v1/swap_sub_account_info': 1,
                            'linear-swap-api/v1/swap_cross_sub_account_info': 1,
                            'linear-swap-api/v1/swap_sub_position_info': 1,
                            'linear-swap-api/v1/swap_cross_sub_position_info': 1,
                            'linear-swap-api/v1/swap_financial_record': 1,
                            'linear-swap-api/v1/swap_financial_record_exact': 1,
                            'linear-swap-api/v1/swap_user_settlement_records': 1,
                            'linear-swap-api/v1/swap_cross_user_settlement_records': 1,
                            'linear-swap-api/v1/swap_available_level_rate': 1,
                            'linear-swap-api/v1/swap_cross_available_level_rate': 1,
                            'linear-swap-api/v1/swap_order_limit': 1,
                            'linear-swap-api/v1/swap_fee': 1,
                            'linear-swap-api/v1/swap_transfer_limit': 1,
                            'linear-swap-api/v1/swap_cross_transfer_limit': 1,
                            'linear-swap-api/v1/swap_position_limit': 1,
                            'linear-swap-api/v1/swap_cross_position_limit': 1,
                            'linear-swap-api/v1/swap_master_sub_transfer': 1,
                            'linear-swap-api/v1/swap_master_sub_transfer_record': 1,
                            'linear-swap-api/v1/swap_transfer_inner': 1,
                            'linear-swap-api/v3/swap_financial_record': 1,
                            'linear-swap-api/v3/swap_financial_record_exact': 1,
                            // Swap Trade Interface
                            'linear-swap-api/v1/swap_order': 1,
                            'linear-swap-api/v1/swap_cross_order': 1,
                            'linear-swap-api/v1/swap_batchorder': 1,
                            'linear-swap-api/v1/swap_cross_batchorder': 1,
                            'linear-swap-api/v1/swap_cancel': 1,
                            'linear-swap-api/v1/swap_cross_cancel': 1,
                            'linear-swap-api/v1/swap_cancelall': 1,
                            'linear-swap-api/v1/swap_cross_cancelall': 1,
                            'linear-swap-api/v1/swap_switch_lever_rate': 1,
                            'linear-swap-api/v1/swap_cross_switch_lever_rate': 1,
                            'linear-swap-api/v1/swap_lightning_close_position': 1,
                            'linear-swap-api/v1/swap_cross_lightning_close_position': 1,
                            'linear-swap-api/v1/swap_order_info': 1,
                            'linear-swap-api/v1/swap_cross_order_info': 1,
                            'linear-swap-api/v1/swap_order_detail': 1,
                            'linear-swap-api/v1/swap_cross_order_detail': 1,
                            'linear-swap-api/v1/swap_openorders': 1,
                            'linear-swap-api/v1/swap_cross_openorders': 1,
                            'linear-swap-api/v1/swap_hisorders': 1,
                            'linear-swap-api/v1/swap_cross_hisorders': 1,
                            'linear-swap-api/v1/swap_hisorders_exact': 1,
                            'linear-swap-api/v1/swap_cross_hisorders_exact': 1,
                            'linear-swap-api/v1/swap_matchresults': 1,
                            'linear-swap-api/v1/swap_cross_matchresults': 1,
                            'linear-swap-api/v1/swap_matchresults_exact': 1,
                            'linear-swap-api/v1/swap_cross_matchresults_exact': 1,
                            'linear-swap-api/v1/swap_switch_position_mode': 1,
                            'linear-swap-api/v1/swap_cross_switch_position_mode': 1,
                            'linear-swap-api/v3/swap_matchresults': 1,
                            'linear-swap-api/v3/swap_cross_matchresults': 1,
                            'linear-swap-api/v3/swap_matchresults_exact': 1,
                            'linear-swap-api/v3/swap_cross_matchresults_exact': 1,
                            'linear-swap-api/v3/swap_hisorders': 1,
                            'linear-swap-api/v3/swap_cross_hisorders': 1,
                            'linear-swap-api/v3/swap_hisorders_exact': 1,
                            'linear-swap-api/v3/swap_cross_hisorders_exact': 1,
                            // Swap Strategy Order Interface
                            'linear-swap-api/v1/swap_trigger_order': 1,
                            'linear-swap-api/v1/swap_cross_trigger_order': 1,
                            'linear-swap-api/v1/swap_trigger_cancel': 1,
                            'linear-swap-api/v1/swap_cross_trigger_cancel': 1,
                            'linear-swap-api/v1/swap_trigger_cancelall': 1,
                            'linear-swap-api/v1/swap_cross_trigger_cancelall': 1,
                            'linear-swap-api/v1/swap_trigger_openorders': 1,
                            'linear-swap-api/v1/swap_cross_trigger_openorders': 1,
                            'linear-swap-api/v1/swap_trigger_hisorders': 1,
                            'linear-swap-api/v1/swap_cross_trigger_hisorders': 1,
                            'linear-swap-api/v1/swap_tpsl_order': 1,
                            'linear-swap-api/v1/swap_cross_tpsl_order': 1,
                            'linear-swap-api/v1/swap_tpsl_cancel': 1,
                            'linear-swap-api/v1/swap_cross_tpsl_cancel': 1,
                            'linear-swap-api/v1/swap_tpsl_cancelall': 1,
                            'linear-swap-api/v1/swap_cross_tpsl_cancelall': 1,
                            'linear-swap-api/v1/swap_tpsl_openorders': 1,
                            'linear-swap-api/v1/swap_cross_tpsl_openorders': 1,
                            'linear-swap-api/v1/swap_tpsl_hisorders': 1,
                            'linear-swap-api/v1/swap_cross_tpsl_hisorders': 1,
                            'linear-swap-api/v1/swap_relation_tpsl_order': 1,
                            'linear-swap-api/v1/swap_cross_relation_tpsl_order': 1,
                            'linear-swap-api/v1/swap_track_order': 1,
                            'linear-swap-api/v1/swap_cross_track_order': 1,
                            'linear-swap-api/v1/swap_track_cancel': 1,
                            'linear-swap-api/v1/swap_cross_track_cancel': 1,
                            'linear-swap-api/v1/swap_track_cancelall': 1,
                            'linear-swap-api/v1/swap_cross_track_cancelall': 1,
                            'linear-swap-api/v1/swap_track_openorders': 1,
                            'linear-swap-api/v1/swap_cross_track_openorders': 1,
                            'linear-swap-api/v1/swap_track_hisorders': 1,
                            'linear-swap-api/v1/swap_cross_track_hisorders': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'exceptions': {
                'broad': {
                    'contract is restricted of closing positions on API.  Please contact customer service': OnMaintenance,
                    'maintain': OnMaintenance,
                },
                'exact': {
                    // err-code
                    '403': AuthenticationError,  // {"status":"error","err_code":403,"err_msg":"Incorrect Access key [Access key错误]","ts":1652774224344}
                    '1010': AccountNotEnabled, // {"status":"error","err_code":1010,"err_msg":"Account doesnt exist.","ts":1648137970490}
                    '1013': BadSymbol, // {"status":"error","err_code":1013,"err_msg":"This contract symbol doesnt exist.","ts":1640550459583}
                    '1017': OrderNotFound, // {"status":"error","err_code":1017,"err_msg":"Order doesnt exist.","ts":1640550859242}
                    '1034': InvalidOrder, // {"status":"error","err_code":1034,"err_msg":"Incorrect field of order price type.","ts":1643802870182}
                    '1036': InvalidOrder, // {"status":"error","err_code":1036,"err_msg":"Incorrect field of open long form.","ts":1643802518986}
                    '1039': InvalidOrder, // {"status":"error","err_code":1039,"err_msg":"Buy price must be lower than 39270.9USDT. Sell price must exceed 37731USDT.","ts":1643802374403}
                    '1041': InvalidOrder, // {"status":"error","err_code":1041,"err_msg":"The order amount exceeds the limit (170000Cont), please modify and order again.","ts":1643802784940}
                    '1047': InsufficientFunds, // {"status":"error","err_code":1047,"err_msg":"Insufficient margin available.","ts":1643802672652}
                    '1048': InsufficientFunds,  // {"status":"error","err_code":1048,"err_msg":"Insufficient close amount available.","ts":1652772408864}
                    '1051': InvalidOrder, // {"status":"error","err_code":1051,"err_msg":"No orders to cancel.","ts":1652552125876}
                    '1066': BadSymbol, // {"status":"error","err_code":1066,"err_msg":"The symbol field cannot be empty. Please re-enter.","ts":1640550819147}
                    '1067': InvalidOrder, // {"status":"error","err_code":1067,"err_msg":"The client_order_id field is invalid. Please re-enter.","ts":1643802119413}
                    '1094': InvalidOrder, // {"status":"error","err_code":1094,"err_msg":"The leverage cannot be empty, please switch the leverage or contact customer service","ts":1640496946243}
                    '1220': AccountNotEnabled, // {"status":"error","err_code":1220,"err_msg":"You don’t have access permission as you have not opened contracts trading.","ts":1645096660718}
                    '1461': InvalidOrder, // {"status":"error","err_code":1461,"err_msg":"Current positions have triggered position limits (5000USDT). Please modify.","ts":1652554651234}
                    'bad-request': BadRequest,
                    'validation-format-error': BadRequest, // {"status":"error","err-code":"validation-format-error","err-msg":"Format Error: order-id.","data":null}
                    'validation-constraints-required': BadRequest, // {"status":"error","err-code":"validation-constraints-required","err-msg":"Field is missing: client-order-id.","data":null}
                    'base-date-limit-error': BadRequest, // {"status":"error","err-code":"base-date-limit-error","err-msg":"date less than system limit","data":null}
                    'api-not-support-temp-addr': PermissionDenied, // {"status":"error","err-code":"api-not-support-temp-addr","err-msg":"API withdrawal does not support temporary addresses","data":null}
                    'timeout': RequestTimeout, // {"ts":1571653730865,"status":"error","err-code":"timeout","err-msg":"Request Timeout"}
                    'gateway-internal-error': ExchangeNotAvailable, // {"status":"error","err-code":"gateway-internal-error","err-msg":"Failed to load data. Try again later.","data":null}
                    'account-frozen-balance-insufficient-error': InsufficientFunds, // {"status":"error","err-code":"account-frozen-balance-insufficient-error","err-msg":"trade account balance is not enough, left: `0.0027`","data":null}
                    'invalid-amount': InvalidOrder, // eg "Paramemter `amount` is invalid."
                    'order-limitorder-amount-min-error': InvalidOrder, // limit order amount error, min: `0.001`
                    'order-limitorder-amount-max-error': InvalidOrder, // market order amount error, max: `1000000`
                    'order-marketorder-amount-min-error': InvalidOrder, // market order amount error, min: `0.01`
                    'order-limitorder-price-min-error': InvalidOrder, // limit order price error
                    'order-limitorder-price-max-error': InvalidOrder, // limit order price error
                    'order-value-min-error': InvalidOrder, // {"status":"error","err-code":"order-value-min-error","err-msg":"Order total cannot be lower than: 1 USDT","data":null}
                    'order-invalid-price': InvalidOrder, // {"status":"error","err-code":"order-invalid-price","err-msg":"invalid price","data":null}
                    'order-holding-limit-failed': InvalidOrder, // {"status":"error","err-code":"order-holding-limit-failed","err-msg":"Order failed, exceeded the holding limit of this currency","data":null}
                    'order-orderprice-precision-error': InvalidOrder, // {"status":"error","err-code":"order-orderprice-precision-error","err-msg":"order price precision error, scale: `4`","data":null}
                    'order-etp-nav-price-max-error': InvalidOrder, // {"status":"error","err-code":"order-etp-nav-price-max-error","err-msg":"Order price cannot be higher than 5% of NAV","data":null}
                    'order-orderstate-error': OrderNotFound, // canceling an already canceled order
                    'order-queryorder-invalid': OrderNotFound, // querying a non-existent order
                    'order-update-error': ExchangeNotAvailable, // undocumented error
                    'api-signature-check-failed': AuthenticationError,
                    'api-signature-not-valid': AuthenticationError, // {"status":"error","err-code":"api-signature-not-valid","err-msg":"Signature not valid: Incorrect Access key [Access key错误]","data":null}
                    'base-record-invalid': OrderNotFound, // https://github.com/ccxt/ccxt/issues/5750
                    'base-symbol-trade-disabled': BadSymbol, // {"status":"error","err-code":"base-symbol-trade-disabled","err-msg":"Trading is disabled for this symbol","data":null}
                    'base-symbol-error': BadSymbol, // {"status":"error","err-code":"base-symbol-error","err-msg":"The symbol is invalid","data":null}
                    'system-maintenance': OnMaintenance, // {"status": "error", "err-code": "system-maintenance", "err-msg": "System is in maintenance!", "data": null}
                    'base-request-exceed-frequency-limit': RateLimitExceeded, // {"status":"error","err-code":"base-request-exceed-frequency-limit","err-msg":"Frequency of requests has exceeded the limit, please try again later","data":null}
                    // err-msg
                    'invalid symbol': BadSymbol, // {"ts":1568813334794,"status":"error","err-code":"invalid-parameter","err-msg":"invalid symbol"}
                    'symbol trade not open now': BadSymbol, // {"ts":1576210479343,"status":"error","err-code":"invalid-parameter","err-msg":"symbol trade not open now"}
                    'require-symbol': BadSymbol, // {"status":"error","err-code":"require-symbol","err-msg":"Parameter `symbol` is required.","data":null},
                    'invalid-address': BadRequest, // {"status":"error","err-code":"invalid-address","err-msg":"Invalid address.","data":null},
                    'base-currency-chain-error': BadRequest, // {"status":"error","err-code":"base-currency-chain-error","err-msg":"The current currency chain does not exist","data":null},
                    'dw-insufficient-balance': InsufficientFunds, // {"status":"error","err-code":"dw-insufficient-balance","err-msg":"Insufficient balance. You can only transfer `12.3456` at most.","data":null}
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'fetchMarkets': {
                    'types': {
                        'spot': true,
                        'future': {
                            'linear': true,
                            'inverse': true,
                        },
                        'swap': {
                            'linear': true,
                            'inverse': true,
                        },
                    },
                },
                'defaultType': 'spot', // spot, future, swap
                'defaultSubType': 'linear', // inverse, linear
                'defaultNetwork': 'ERC20',
                'networks': {
                    'ETH': 'erc20',
                    'TRX': 'trc20',
                    'HRC20': 'hrc20',
                    'HECO': 'hrc20',
                    'HT': 'hrc20',
                    'ALGO': 'algo',
                    'OMNI': '',
                },
                // https://github.com/ccxt/ccxt/issues/5376
                'fetchOrdersByStatesMethod': 'spot_private_get_v1_order_orders', // 'spot_private_get_v1_order_history' // https://github.com/ccxt/ccxt/pull/5392
                'createMarketBuyOrderRequiresPrice': true,
                'language': 'en-US',
                'broker': {
                    'id': 'AA03022abc',
                },
                'accountsByType': {
                    'spot': 'pro',
                    'funding': 'pro',
                    'future': 'futures',
                },
                'accountsById': {
                    'spot': 'spot',
                    'margin': 'margin',
                    'otc': 'otc',
                    'point': 'point',
                    'super-margin': 'super-margin',
                    'investment': 'investment',
                    'borrow': 'borrow',
                    'grid-trading': 'grid-trading',
                    'deposit-earning': 'deposit-earning',
                    'otc-options': 'otc-options',
                },
                'marginAccounts': {
                    'cross': 'super-margin',
                    'isolated': 'margin',
                },
                'typesByAccount': {
                    'pro': 'spot',
                    'futures': 'future',
                },
                'spot': {
                    'stopOrderTypes': {
                        'stop-limit': true,
                        'buy-stop-limit': true,
                        'sell-stop-limit': true,
                        'stop-limit-fok': true,
                        'buy-stop-limit-fok': true,
                        'sell-stop-limit-fok': true,
                    },
                    'limitOrderTypes': {
                        'limit': true,
                        'buy-limit': true,
                        'sell-limit': true,
                        'ioc': true,
                        'buy-ioc': true,
                        'sell-ioc': true,
                        'limit-maker': true,
                        'buy-limit-maker': true,
                        'sell-limit-maker': true,
                        'stop-limit': true,
                        'buy-stop-limit': true,
                        'sell-stop-limit': true,
                        'limit-fok': true,
                        'buy-limit-fok': true,
                        'sell-limit-fok': true,
                        'stop-limit-fok': true,
                        'buy-stop-limit-fok': true,
                        'sell-stop-limit-fok': true,
                    },
                },
            },
            'commonCurrencies': {
                // https://github.com/ccxt/ccxt/issues/6081
                // https://github.com/ccxt/ccxt/issues/3365
                // https://github.com/ccxt/ccxt/issues/2873
                'GET': 'Themis', // conflict with GET (Guaranteed Entrance Token, GET Protocol)
                'GTC': 'Game.com', // conflict with Gitcoin and Gastrocoin
                'HIT': 'HitChain',
                'HOT': 'Hydro Protocol', // conflict with HOT (Holo) https://github.com/ccxt/ccxt/issues/4929
                // https://github.com/ccxt/ccxt/issues/7399
                // https://coinmarketcap.com/currencies/pnetwork/
                // https://coinmarketcap.com/currencies/penta/markets/
                // https://en.cryptonomist.ch/blog/eidoo/the-edo-to-pnt-upgrade-what-you-need-to-know-updated/
                'PNT': 'Penta',
                'SBTC': 'Super Bitcoin',
                'BIFI': 'Bitcoin File', // conflict with Beefy.Finance https://github.com/ccxt/ccxt/issues/8706
            },
        });
    }

    async fetchStatus (params = {}) {
        await this.loadMarkets ();
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', undefined, params);
        let method = 'statusPublicSpotGetApiV2SummaryJson';
        if (marketType !== 'spot') {
            const subType = this.safeString (params, 'subType', this.options['defaultSubType']);
            if (marketType === 'swap') {
                if (subType === 'linear') {
                    method = 'statusPublicSwapLinearGetApiV2SummaryJson';
                } else if (subType === 'inverse') {
                    method = 'statusPublicSwapInverseGetApiV2SummaryJson';
                }
            } else if (marketType === 'future') {
                if (subType === 'linear') {
                    method = 'statusPublicFutureLinearGetApiV2SummaryJson';
                } else if (subType === 'inverse') {
                    method = 'statusPublicFutureInverseGetApiV2SummaryJson';
                }
            } else if (marketType === 'contract') {
                method = 'contractPublicGetHeartbeat';
            }
        }
        const response = await this[method] ();
        //
        // statusPublicSpotGetApiV2SummaryJson, statusPublicSwapInverseGetApiV2SummaryJson, statusPublicFutureLinearGetApiV2SummaryJson, statusPublicFutureInverseGetApiV2SummaryJson
        //
        //      {
        //          "page": {
        //              "id":"mn7l2lw8pz4p",
        //              "name":"Huobi Futures-USDT-margined Swaps",
        //              "url":"https://status-linear-swap.huobigroup.com",
        //              "time_zone":"Asia/Singapore",
        //              "updated_at":"2022-04-29T12:47:21.319+08:00"},
        //              "components": [
        //                  {
        //                      "id":"lrv093qk3yp5",
        //                      "name":"market data",
        //                      "status":"operational",
        //                      "created_at":"2020-10-29T14:08:59.427+08:00",
        //                      "updated_at":"2020-10-29T14:08:59.427+08:00",
        //                      "position":1,"description":null,
        //                      "showcase":false,
        //                      "start_date":null,
        //                      "group_id":null,
        //                      "page_id":"mn7l2lw8pz4p",
        //                      "group":true,
        //                      "only_show_if_degraded":false,
        //                      "components": [
        //                          "82k5jxg7ltxd" // list of related components
        //                      ]
        //                  },
        //              ],
        //              "incidents": [ // empty array if there are no issues
        //                  {
        //                      "id": "rclfxz2g21ly",  // incident id
        //                      "name": "Market data is delayed",  // incident name
        //                      "status": "investigating",  // incident status
        //                      "created_at": "2020-02-11T03:15:01.913Z",  // incident create time
        //                      "updated_at": "2020-02-11T03:15:02.003Z",   // incident update time
        //                      "monitoring_at": null,
        //                      "resolved_at": null,
        //                      "impact": "minor",  // incident impact
        //                      "shortlink": "http://stspg.io/pkvbwp8jppf9",
        //                      "started_at": "2020-02-11T03:15:01.906Z",
        //                      "page_id": "p0qjfl24znv5",
        //                      "incident_updates": [
        //                          {
        //                              "id": "dwfsk5ttyvtb",
        //                              "status": "investigating",
        //                              "body": "Market data is delayed",
        //                              "incident_id": "rclfxz2g21ly",
        //                              "created_at": "2020-02-11T03:15:02.000Z",
        //                              "updated_at": "2020-02-11T03:15:02.000Z",
        //                              "display_at": "2020-02-11T03:15:02.000Z",
        //                              "affected_components": [
        //                                  {
        //                                      "code": "nctwm9tghxh6",
        //                                      "name": "Market data",
        //                                      "old_status": "operational",
        //                                      "new_status": "degraded_performance"
        //                                  }
        //                              ],
        //                              "deliver_notifications": true,
        //                              "custom_tweet": null,
        //                              "tweet_id": null
        //                          }
        //                      ],
        //                      "components": [
        //                          {
        //                              "id": "nctwm9tghxh6",
        //                              "name": "Market data",
        //                              "status": "degraded_performance",
        //                              "created_at": "2020-01-13T09:34:48.284Z",
        //                              "updated_at": "2020-02-11T03:15:01.951Z",
        //                              "position": 8,
        //                              "description": null,
        //                              "showcase": false,
        //                              "group_id": null,
        //                              "page_id": "p0qjfl24znv5",
        //                              "group": false,
        //                              "only_show_if_degraded": false
        //                          }
        //                      ]
        //                  }, ...
        //              ],
        //              "scheduled_maintenances":[ // empty array if there are no scheduled maintenances
        //                  {
        //                      "id": "k7g299zl765l", // incident id
        //                      "name": "Schedule maintenance", // incident name
        //                      "status": "scheduled", // incident status
        //                      "created_at": "2020-02-11T03:16:31.481Z",  // incident create time
        //                      "updated_at": "2020-02-11T03:16:31.530Z",  // incident update time
        //                      "monitoring_at": null,
        //                      "resolved_at": null,
        //                      "impact": "maintenance",  // incident impact
        //                      "shortlink": "http://stspg.io/md4t4ym7nytd",
        //                      "started_at": "2020-02-11T03:16:31.474Z",
        //                      "page_id": "p0qjfl24znv5",
        //                      "incident_updates": [
        //                          {
        //                              "id": "8whgr3rlbld8",
        //                              "status": "scheduled",
        //                              "body": "We will be undergoing scheduled maintenance during this time.",
        //                              "incident_id": "k7g299zl765l",
        //                              "created_at": "2020-02-11T03:16:31.527Z",
        //                              "updated_at": "2020-02-11T03:16:31.527Z",
        //                              "display_at": "2020-02-11T03:16:31.527Z",
        //                              "affected_components": [
        //                                  {
        //                                      "code": "h028tnzw1n5l",
        //                                      "name": "Deposit And Withdraw - Deposit",
        //                                      "old_status": "operational",
        //                                      "new_status": "operational"
        //                                  }
        //                              ],
        //                              "deliver_notifications": true,
        //                              "custom_tweet": null,
        //                              "tweet_id": null
        //                          }
        //                      ],
        //                      "components": [
        //                          {
        //                              "id": "h028tnzw1n5l",
        //                              "name": "Deposit",
        //                              "status": "operational",
        //                              "created_at": "2019-12-05T02:07:12.372Z",
        //                              "updated_at": "2020-02-10T12:34:52.970Z",
        //                              "position": 1,
        //                              "description": null,
        //                              "showcase": false,
        //                              "group_id": "gtd0nyr3pf0k",
        //                              "page_id": "p0qjfl24znv5",
        //                              "group": false,
        //                              "only_show_if_degraded": false
        //                          }
        //                      ],
        //                      "scheduled_for": "2020-02-15T00:00:00.000Z",  // scheduled maintenance start time
        //                      "scheduled_until": "2020-02-15T01:00:00.000Z"  // scheduled maintenance end time
        //                  }
        //              ],
        //              "status": {
        //                  "indicator":"none", // none, minor, major, critical, maintenance
        //                  "description":"all systems operational" // All Systems Operational, Minor Service Outage, Partial System Outage, Partially Degraded Service, Service Under Maintenance
        //              }
        //          }
        //
        //
        // contractPublicGetHeartbeat
        //
        //      {
        //          "status": "ok", // 'ok', 'error'
        //          "data": {
        //              "heartbeat": 1, // future 1: available, 0: maintenance with service suspended
        //              "estimated_recovery_time": null, // estimated recovery time in milliseconds
        //              "swap_heartbeat": 1,
        //              "swap_estimated_recovery_time": null,
        //              "option_heartbeat": 1,
        //              "option_estimated_recovery_time": null,
        //              "linear_swap_heartbeat": 1,
        //              "linear_swap_estimated_recovery_time": null
        //          },
        //          "ts": 1557714418033
        //      }
        //
        let status = undefined;
        let updated = undefined;
        let url = undefined;
        if (method === 'contractPublicGetHeartbeat') {
            const statusRaw = this.safeString (response, 'status');
            status = (statusRaw === 'ok') ? 'ok' : 'maintenance'; // 'ok', 'error'
            updated = this.safeString (response, 'ts');
        } else {
            const statusData = this.safeValue (response, 'status', {});
            const statusRaw = this.safeString (statusData, 'indicator');
            status = (statusRaw === 'none') ? 'ok' : 'maintenance'; // none, minor, major, critical, maintenance
            const pageData = this.safeValue (response, 'page', {});
            const datetime = this.safeString (pageData, 'updated_at');
            updated = this.parse8601 (datetime);
            url = this.safeString (pageData, 'url');
        }
        return {
            'status': status,
            'updated': updated,
            'eta': undefined,
            'url': url,
            'info': response,
        };
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name huobi#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const options = this.safeValue (this.options, 'fetchTime', {});
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        let method = 'spotPublicGetV1CommonTimestamp';
        if ((type === 'future') || (type === 'swap')) {
            method = 'contractPublicGetApiV1Timestamp';
        }
        const response = await this[method] (params);
        //
        // spot
        //
        //     {"status":"ok","data":1637504261099}
        //
        // future, swap
        //
        //     {"status":"ok","ts":1637504164707}
        //
        return this.safeInteger2 (response, 'data', 'ts');
    }

    parseTradingFee (fee, market = undefined) {
        //
        //     {
        //         "symbol":"btcusdt",
        //         "actualMakerRate":"0.002",
        //         "actualTakerRate":"0.002",
        //         "takerFeeRate":"0.002",
        //         "makerFeeRate":"0.002"
        //     }
        //
        const marketId = this.safeString (fee, 'symbol');
        return {
            'info': fee,
            'symbol': this.safeSymbol (marketId, market),
            'maker': this.safeNumber (fee, 'actualMakerRate'),
            'taker': this.safeNumber (fee, 'actualTakerRate'),
        };
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name huobi#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbols': market['id'], // trading symbols comma-separated
        };
        const response = await this.spotPrivateGetV2ReferenceTransactFeeRate (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "symbol":"btcusdt",
        //                 "actualMakerRate":"0.002",
        //                 "actualTakerRate":"0.002",
        //                 "takerFeeRate":"0.002",
        //                 "makerFeeRate":"0.002"
        //             }
        //         ],
        //         "success":true
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        return this.parseTradingFee (first, market);
    }

    async fetchTradingLimits (symbols = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        //  by default it will try load withdrawal fees of all currencies (with separate requests)
        //  however if you define symbols = [ 'ETH/BTC', 'LTC/BTC' ] in args it will only load those
        await this.loadMarkets ();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const result = {};
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            result[symbol] = await this.fetchTradingLimitsById (this.marketId (symbol), params);
        }
        return result;
    }

    async fetchTradingLimitsById (id, params = {}) {
        const request = {
            'symbol': id,
        };
        const response = await this.spotPublicGetV1CommonExchange (this.extend (request, params));
        //
        //     { status:   "ok",
        //         data: {                                  symbol: "aidocbtc",
        //                              'buy-limit-must-less-than':  1.1,
        //                          'sell-limit-must-greater-than':  0.9,
        //                         'limit-order-must-greater-than':  1,
        //                            'limit-order-must-less-than':  5000000,
        //                    'market-buy-order-must-greater-than':  0.0001,
        //                       'market-buy-order-must-less-than':  100,
        //                   'market-sell-order-must-greater-than':  1,
        //                      'market-sell-order-must-less-than':  500000,
        //                       'circuit-break-when-greater-than':  10000,
        //                          'circuit-break-when-less-than':  10,
        //                 'market-sell-order-rate-must-less-than':  0.1,
        //                  'market-buy-order-rate-must-less-than':  0.1        } }
        //
        return this.parseTradingLimits (this.safeValue (response, 'data', {}));
    }

    parseTradingLimits (limits, symbol = undefined, params = {}) {
        //
        //   {                                  symbol: "aidocbtc",
        //                  'buy-limit-must-less-than':  1.1,
        //              'sell-limit-must-greater-than':  0.9,
        //             'limit-order-must-greater-than':  1,
        //                'limit-order-must-less-than':  5000000,
        //        'market-buy-order-must-greater-than':  0.0001,
        //           'market-buy-order-must-less-than':  100,
        //       'market-sell-order-must-greater-than':  1,
        //          'market-sell-order-must-less-than':  500000,
        //           'circuit-break-when-greater-than':  10000,
        //              'circuit-break-when-less-than':  10,
        //     'market-sell-order-rate-must-less-than':  0.1,
        //      'market-buy-order-rate-must-less-than':  0.1        }
        //
        return {
            'info': limits,
            'limits': {
                'amount': {
                    'min': this.safeNumber (limits, 'limit-order-must-greater-than'),
                    'max': this.safeNumber (limits, 'limit-order-must-less-than'),
                },
            },
        };
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['cost'], this.precisionMode);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name huobi#fetchMarkets
         * @description retrieves data on all markets for huobi
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const types = this.safeValue (options, 'types', {});
        let allMarkets = [];
        let promises = [];
        const keys = Object.keys (types);
        for (let i = 0; i < keys.length; i++) {
            const type = keys[i];
            const value = this.safeValue (types, type);
            if (value === true) {
                promises.push (this.fetchMarketsByTypeAndSubType (type, undefined, params));
            } else {
                const subKeys = Object.keys (value);
                for (let j = 0; j < subKeys.length; j++) {
                    const subType = subKeys[j];
                    const subValue = this.safeValue (value, subType);
                    if (subValue) {
                        promises.push (this.fetchMarketsByTypeAndSubType (type, subType, params));
                    }
                }
            }
        }
        promises = await Promise.all (promises);
        for (let i = 0; i < promises.length; i++) {
            allMarkets = this.arrayConcat (allMarkets, promises[i]);
        }
        return allMarkets;
    }

    async fetchMarketsByTypeAndSubType (type, subType, params = {}) {
        let method = 'spotPublicGetV1CommonSymbols';
        const query = this.omit (params, [ 'type', 'subType' ]);
        const spot = (type === 'spot');
        const contract = (type !== 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        let linear = undefined;
        let inverse = undefined;
        const request = {};
        if (contract) {
            linear = (subType === 'linear');
            inverse = (subType === 'inverse');
            if (linear) {
                method = 'contractPublicGetLinearSwapApiV1SwapContractInfo';
                if (future) {
                    request['business_type'] = 'futures';
                }
            } else if (inverse) {
                if (future) {
                    method = 'contractPublicGetApiV1ContractContractInfo';
                } else if (swap) {
                    method = 'contractPublicGetSwapApiV1SwapContractInfo';
                }
            }
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {
        //                 "base-currency":"xrp3s",
        //                 "quote-currency":"usdt",
        //                 "price-precision":4,
        //                 "amount-precision":4,
        //                 "symbol-partition":"innovation",
        //                 "symbol":"xrp3susdt",
        //                 "state":"online",
        //                 "value-precision":8,
        //                 "min-order-amt":0.01,
        //                 "max-order-amt":1616.4353,
        //                 "min-order-value":5,
        //                 "limit-order-min-order-amt":0.01,
        //                 "limit-order-max-order-amt":1616.4353,
        //                 "limit-order-max-buy-amt":1616.4353,
        //                 "limit-order-max-sell-amt":1616.4353,
        //                 "sell-market-min-order-amt":0.01,
        //                 "sell-market-max-order-amt":1616.4353,
        //                 "buy-market-max-order-value":2500,
        //                 "max-order-value":2500,
        //                 "underlying":"xrpusdt",
        //                 "mgmt-fee-rate":0.035000000000000000,
        //                 "charge-time":"23:55:00",
        //                 "rebal-time":"00:00:00",
        //                 "rebal-threshold":-5,
        //                 "init-nav":10.000000000000000000,
        //                 "api-trading":"enabled",
        //                 "tags":"etp,nav,holdinglimit"
        //             },
        //         ]
        //     }
        //
        // inverse future
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {
        //                 "symbol":"BTC",
        //                 "contract_code":"BTC211126",
        //                 "contract_type":"this_week",
        //                 "contract_size":100.000000000000000000,
        //                 "price_tick":0.010000000000000000,
        //                 "delivery_date":"20211126",
        //                 "delivery_time":"1637913600000",
        //                 "create_date":"20211112",
        //                 "contract_status":1,
        //                 "settlement_time":"1637481600000"
        //             },
        //         ],
        //         "ts":1637474595140
        //     }
        //
        // linear futures
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {
        //                 "symbol":"BTC",
        //                 "contract_code":"BTC-USDT-211231",
        //                 "contract_size":0.001000000000000000,
        //                 "price_tick":0.100000000000000000,
        //                 "delivery_date":"20211231",
        //                 "delivery_time":"1640937600000",
        //                 "create_date":"20211228",
        //                 "contract_status":1,
        //                 "settlement_date":"1640764800000",
        //                 "support_margin_mode":"cross",
        //                 "business_type":"futures",
        //                 "pair":"BTC-USDT",
        //                 "contract_type":"this_week" // next_week, quarter
        //             },
        //         ],
        //         "ts":1640736207263
        //     }
        //
        // swaps
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {
        //                 "symbol":"BTC",
        //                 "contract_code":"BTC-USDT",
        //                 "contract_size":0.001000000000000000,
        //                 "price_tick":0.100000000000000000,
        //                 "delivery_time":"",
        //                 "create_date":"20201021",
        //                 "contract_status":1,
        //                 "settlement_date":"1637481600000",
        //                 "support_margin_mode":"all", // isolated
        //             },
        //         ],
        //         "ts":1637474774467
        //     }
        //
        const markets = this.safeValue (response, 'data', []);
        const numMarkets = markets.length;
        if (numMarkets < 1) {
            throw new NetworkError (this.id + ' fetchMarkets() returned an empty response: ' + this.json (markets));
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            let baseId = undefined;
            let quoteId = undefined;
            let settleId = undefined;
            let id = undefined;
            let lowercaseId = undefined;
            let lowercaseBaseId = undefined;
            if (contract) {
                id = this.safeString (market, 'contract_code');
                lowercaseId = id.toLowerCase ();
                if (swap) {
                    const parts = id.split ('-');
                    baseId = this.safeString (market, 'symbol');
                    lowercaseBaseId = baseId.toLowerCase ();
                    quoteId = this.safeStringLower (parts, 1);
                    settleId = inverse ? baseId : quoteId;
                } else if (future) {
                    baseId = this.safeString (market, 'symbol');
                    lowercaseBaseId = baseId.toLowerCase ();
                    if (inverse) {
                        quoteId = 'USD';
                        settleId = baseId;
                    } else {
                        const pair = this.safeString (market, 'pair');
                        const parts = pair.split ('-');
                        quoteId = this.safeString (parts, 1);
                        settleId = quoteId;
                    }
                }
            } else {
                baseId = this.safeString (market, 'base-currency');
                lowercaseBaseId = baseId.toLowerCase ();
                quoteId = this.safeString (market, 'quote-currency');
                id = baseId + quoteId;
                lowercaseId = id.toLowerCase ();
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            let symbol = base + '/' + quote;
            let expiry = undefined;
            if (contract) {
                if (inverse) {
                    symbol += ':' + base;
                } else if (linear) {
                    symbol += ':' + quote;
                }
                if (future) {
                    expiry = this.safeInteger (market, 'delivery_time');
                    symbol += '-' + this.yymmdd (expiry);
                }
            }
            const contractSize = this.safeNumber (market, 'contract_size');
            let minCost = this.safeNumber (market, 'min-order-value');
            const maxAmount = this.safeNumber (market, 'max-order-amt');
            let minAmount = this.safeNumber (market, 'min-order-amt');
            if (contract) {
                if (linear) {
                    minAmount = contractSize;
                } else if (inverse) {
                    minCost = contractSize;
                }
            }
            let pricePrecision = undefined;
            let amountPrecision = undefined;
            let costPrecision = undefined;
            if (spot) {
                pricePrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'price-precision')));
                amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'amount-precision')));
                costPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'value-precision')));
            } else {
                pricePrecision = this.safeNumber (market, 'price_tick');
                amountPrecision = this.parseNumber ('1'); // other markets have step size of 1 contract
            }
            let maker = undefined;
            let taker = undefined;
            if (spot) {
                maker = (base === 'OMG') ? this.parseNumber ('0') : this.parseNumber ('0.002');
                taker = (base === 'OMG') ? this.parseNumber ('0') : this.parseNumber ('0.002');
            }
            let active = undefined;
            if (spot) {
                const state = this.safeString (market, 'state');
                active = (state === 'online');
            } else if (contract) {
                const contractStatus = this.safeInteger (market, 'contract_status');
                active = (contractStatus === 1);
            }
            const leverageRatio = this.safeString (market, 'leverage-ratio', '1');
            const superLeverageRatio = this.safeString (market, 'super-margin-leverage-ratio', '1');
            const hasLeverage = Precise.stringGt (leverageRatio, '1') || Precise.stringGt (superLeverageRatio, '1');
            // 0 Delisting
            // 1 Listing
            // 2 Pending Listing
            // 3 Suspension
            // 4 Suspending of Listing
            // 5 In Settlement
            // 6 Delivering
            // 7 Settlement Completed
            // 8 Delivered
            // 9 Suspending of Trade
            result.push ({
                'id': id,
                'lowercaseId': lowercaseId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'lowercaseBaseId': lowercaseBaseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': (spot && hasLeverage),
                'swap': swap,
                'future': future,
                'option': false,
                'active': active,
                'contract': contract,
                'linear': linear,
                'inverse': inverse,
                'taker': taker,
                'maker': maker,
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountPrecision,
                    'price': pricePrecision,
                    'cost': costPrecision,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.parseNumber (leverageRatio),
                        'superMax': this.parseNumber (superLeverageRatio),
                    },
                    'amount': {
                        'min': minAmount,
                        'max': maxAmount,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "amount": 26228.672978342216,
        //         "open": 9078.95,
        //         "close": 9146.86,
        //         "high": 9155.41,
        //         "id": 209988544334,
        //         "count": 265846,
        //         "low": 8988.0,
        //         "version": 209988544334,
        //         "ask": [ 9146.87, 0.156134 ],
        //         "vol": 2.3822168242201668E8,
        //         "bid": [ 9146.86, 0.080758 ],
        //     }
        //
        // fetchTickers
        //
        //     {
        //         symbol: "bhdht",
        //         open:  2.3938,
        //         high:  2.4151,
        //         low:  2.3323,
        //         close:  2.3909,
        //         amount:  628.992,
        //         vol:  1493.71841095,
        //         count:  2088,
        //         bid:  2.3643,
        //         bidSize:  0.7136,
        //         ask:  2.4061,
        //         askSize:  0.4156
        //     }
        //
        const marketId = this.safeString2 (ticker, 'symbol', 'contract_code');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'ts');
        let bid = undefined;
        let bidVolume = undefined;
        let ask = undefined;
        let askVolume = undefined;
        if ('bid' in ticker) {
            if (Array.isArray (ticker['bid'])) {
                bid = this.safeString (ticker['bid'], 0);
                bidVolume = this.safeString (ticker['bid'], 1);
            } else {
                bid = this.safeString (ticker, 'bid');
                bidVolume = this.safeString (ticker, 'bidSize');
            }
        }
        if ('ask' in ticker) {
            if (Array.isArray (ticker['ask'])) {
                ask = this.safeString (ticker['ask'], 0);
                askVolume = this.safeString (ticker['ask'], 1);
            } else {
                ask = this.safeString (ticker, 'ask');
                askVolume = this.safeString (ticker, 'askSize');
            }
        }
        const open = this.safeString (ticker, 'open');
        const close = this.safeString (ticker, 'close');
        const baseVolume = this.safeString (ticker, 'amount');
        const quoteVolume = this.safeString (ticker, 'vol');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name huobi#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let fieldName = 'symbol';
        let method = 'spotPublicGetMarketDetailMerged';
        if (market['linear']) {
            method = 'contractPublicGetLinearSwapExMarketDetailMerged';
            fieldName = 'contract_code';
        } else if (market['inverse']) {
            if (market['future']) {
                method = 'contractPublicGetMarketDetailMerged';
            } else if (market['swap']) {
                method = 'contractPublicGetSwapExMarketDetailMerged';
                fieldName = 'contract_code';
            }
        }
        request[fieldName] = market['id'];
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status": "ok",
        //         "ch": "market.btcusdt.detail.merged",
        //         "ts": 1583494336669,
        //         "tick": {
        //             "amount": 26228.672978342216,
        //             "open": 9078.95,
        //             "close": 9146.86,
        //             "high": 9155.41,
        //             "id": 209988544334,
        //             "count": 265846,
        //             "low": 8988.0,
        //             "version": 209988544334,
        //             "ask": [ 9146.87, 0.156134 ],
        //             "vol": 2.3822168242201668E8,
        //             "bid": [ 9146.86, 0.080758 ],
        //         }
        //     }
        //
        // future, swap
        //
        //     {
        //         "ch":"market.BTC211126.detail.merged",
        //         "status":"ok",
        //         "tick":{
        //             "amount":"669.3385682049668320322569544150680718474",
        //             "ask":[59117.44,48],
        //             "bid":[59082,48],
        //             "close":"59087.97",
        //             "count":5947,
        //             "high":"59892.62",
        //             "id":1637502670,
        //             "low":"57402.87",
        //             "open":"57638",
        //             "ts":1637502670059,
        //             "vol":"394598"
        //         },
        //         "ts":1637502670059
        //     }
        //
        const tick = this.safeValue (response, 'tick', {});
        const ticker = this.parseTicker (tick, market);
        const timestamp = this.safeInteger (response, 'ts');
        ticker['timestamp'] = timestamp;
        ticker['datetime'] = this.iso8601 (timestamp);
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const options = this.safeValue (this.options, 'fetchTickers', {});
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        let method = 'spotPublicGetMarketTickers';
        const defaultSubType = this.safeString (this.options, 'defaultSubType', 'inverse');
        let subType = this.safeString (options, 'subType', defaultSubType);
        subType = this.safeString (params, 'subType', subType);
        const request = {};
        const future = (type === 'future');
        const swap = (type === 'swap');
        const linear = (subType === 'linear');
        const inverse = (subType === 'inverse');
        if (future || swap) {
            if (linear) {
                method = 'contractPublicGetLinearSwapExMarketDetailBatchMerged';
                if (future) {
                    request['business_type'] = 'futures';
                }
            } else if (inverse) {
                if (future) {
                    method = 'contractPublicGetMarketDetailBatchMerged';
                } else if (swap) {
                    method = 'contractPublicGetSwapExMarketDetailBatchMerged';
                }
            }
        }
        params = this.omit (params, [ 'type', 'subType' ]);
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "data":[
        //             {
        //                 "symbol":"hbcbtc",
        //                 "open":5.313E-5,
        //                 "high":5.34E-5,
        //                 "low":5.112E-5,
        //                 "close":5.175E-5,
        //                 "amount":1183.87,
        //                 "vol":0.0618599229,
        //                 "count":205,
        //                 "bid":5.126E-5,
        //                 "bidSize":5.25,
        //                 "ask":5.214E-5,
        //                 "askSize":150.0
        //             },
        //         ],
        //         "status":"ok",
        //         "ts":1639547261293
        //     }
        //
        // inverse swaps, linear swaps, inverse futures
        //
        //     {
        //         "status":"ok",
        //         "ticks":[
        //             {
        //                 "id":1637504679,
        //                 "ts":1637504679372,
        //                 "ask":[0.10644,100],
        //                 "bid":[0.10624,26],
        //                 "symbol":"TRX_CW",
        //                 "open":"0.10233",
        //                 "close":"0.10644",
        //                 "low":"0.1017",
        //                 "high":"0.10725",
        //                 "amount":"2340267.415144052378486261756692535687481566",
        //                 "count":882,
        //                 "vol":"24706"
        //             }
        //         ],
        //         "ts":1637504679376
        //     }
        //
        // linear futures
        //
        //     {
        //         "status":"ok",
        //         "ticks":[
        //             {
        //                 "id":1640745627,
        //                 "ts":1640745627957,
        //                 "ask":[48079.1,20],
        //                 "bid":[47713.8,125],
        //                 "business_type":"futures",
        //                 "contract_code":"BTC-USDT-CW",
        //                 "open":"49011.8",
        //                 "close":"47934",
        //                 "low":"47292.3",
        //                 "high":"49011.8",
        //                 "amount":"17.398",
        //                 "count":1515,
        //                 "vol":"17398",
        //                 "trade_turnover":"840726.5048"
        //             }
        //         ],
        //         "ts":1640745627988
        //     }
        //
        const tickers = this.safeValue2 (response, 'data', 'ticks', []);
        const timestamp = this.safeInteger (response, 'ts');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            // the market ids for linear futures are non-standard and differ from all the other endpoints
            // we are doing a linear-matching here
            if (future && linear) {
                for (let j = 0; j < this.symbols.length; j++) {
                    const symbol = this.symbols[j];
                    const market = this.market (symbol);
                    const contractType = this.safeString (market['info'], 'contract_type');
                    if ((contractType === 'this_week') && (ticker['symbol'] === (market['baseId'] + '-' + market['quoteId'] + '-CW'))) {
                        ticker['symbol'] = market['symbol'];
                        break;
                    } else if ((contractType === 'next_week') && (ticker['symbol'] === (market['baseId'] + '-' + market['quoteId'] + '-NW'))) {
                        ticker['symbol'] = market['symbol'];
                        break;
                    } else if ((contractType === 'this_quarter') && (ticker['symbol'] === (market['baseId'] + '-' + market['quoteId'] + '-CQ'))) {
                        ticker['symbol'] = market['symbol'];
                        break;
                    } else if ((contractType === 'next_quarter') && (ticker['symbol'] === (market['baseId'] + '-' + market['quoteId'] + '-NQ'))) {
                        ticker['symbol'] = market['symbol'];
                        break;
                    }
                }
            }
            const symbol = ticker['symbol'];
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            //
            // from the API docs
            //
            //     to get depth data within step 150, use step0, step1, step2, step3, step4, step5, step14, step15（merged depth data 0-5,14-15, when step is 0，depth data will not be merged
            //     to get depth data within step 20, use step6, step7, step8, step9, step10, step11, step12, step13(merged depth data 7-13), when step is 6, depth data will not be merged
            //
            'type': 'step0',
            // 'symbol': market['id'], // spot, future
            // 'contract_code': market['id'], // swap
        };
        let fieldName = 'symbol';
        let method = 'spotPublicGetMarketDepth';
        if (market['linear']) {
            method = 'contractPublicGetLinearSwapExMarketDepth';
            fieldName = 'contract_code';
        } else if (market['inverse']) {
            if (market['future']) {
                method = 'contractPublicGetMarketDepth';
            } else if (market['swap']) {
                method = 'contractPublicGetSwapExMarketDepth';
                fieldName = 'contract_code';
            }
        } else {
            if (limit !== undefined) {
                // Valid depths are 5, 10, 20 or empty https://huobiapi.github.io/docs/spot/v1/en/#get-market-depth
                if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 150)) {
                    throw new BadRequest (this.id + ' fetchOrderBook() limit argument must be undefined, 5, 10, 20, or 150, default is 150');
                }
                // only set the depth if it is not 150
                // 150 is the implicit default on the exchange side for step0 and no orderbook aggregation
                // it is not accepted by the exchange if you set it explicitly
                if (limit !== 150) {
                    request['depth'] = limit;
                }
            }
        }
        request[fieldName] = market['id'];
        const response = await this[method] (this.extend (request, params));
        //
        // spot, future, swap
        //
        //     {
        //         "status": "ok",
        //         "ch": "market.btcusdt.depth.step0",
        //         "ts": 1583474832790,
        //         "tick": {
        //             "bids": [
        //                 [ 9100.290000000000000000, 0.200000000000000000 ],
        //                 [ 9099.820000000000000000, 0.200000000000000000 ],
        //                 [ 9099.610000000000000000, 0.205000000000000000 ],
        //             ],
        //             "asks": [
        //                 [ 9100.640000000000000000, 0.005904000000000000 ],
        //                 [ 9101.010000000000000000, 0.287311000000000000 ],
        //                 [ 9101.030000000000000000, 0.012121000000000000 ],
        //             ],
        //             "ch":"market.BTC-USD.depth.step0",
        //             "ts":1583474832008,
        //             "id":1637554816,
        //             "mrid":121654491624,
        //             "version":104999698780
        //         }
        //     }
        //
        if ('tick' in response) {
            if (!response['tick']) {
                throw new BadSymbol (this.id + ' fetchOrderBook() returned empty response: ' + this.json (response));
            }
            const tick = this.safeValue (response, 'tick');
            const timestamp = this.safeInteger (tick, 'ts', this.safeInteger (response, 'ts'));
            const result = this.parseOrderBook (tick, symbol, timestamp);
            result['nonce'] = this.safeInteger (tick, 'version');
            return result;
        }
        throw new ExchangeError (this.id + ' fetchOrderBook() returned unrecognized response: ' + this.json (response));
    }

    parseTrade (trade, market = undefined) {
        //
        // spot fetchTrades (public)
        //
        //     {
        //         "amount": 0.010411000000000000,
        //         "trade-id": 102090736910,
        //         "ts": 1583497692182,
        //         "id": 10500517034273194594947,
        //         "price": 9096.050000000000000000,
        //         "direction": "sell"
        //     }
        //
        // spot fetchMyTrades (private)
        //
        //     {
        //          'symbol': 'swftcbtc',
        //          'fee-currency': 'swftc',
        //          'filled-fees': '0',
        //          'source': 'spot-api',
        //          'id': 83789509854000,
        //          'type': 'buy-limit',
        //          'order-id': 83711103204909,
        //          'filled-points': '0.005826843283532154',
        //          'fee-deduct-currency': 'ht',
        //          'filled-amount': '45941.53',
        //          'price': '0.0000001401',
        //          'created-at': 1597933260729,
        //          'match-id': 100087455560,
        //          'role': 'maker',
        //          'trade-id': 100050305348
        //     }
        //
        // linear swap isolated margin fetchOrder details
        //
        //     {
        //         "trade_id": 131560927,
        //         "trade_price": 13059.800000000000000000,
        //         "trade_volume": 1.000000000000000000,
        //         "trade_turnover": 13.059800000000000000,
        //         "trade_fee": -0.005223920000000000,
        //         "created_at": 1603703614715,
        //         "role": "taker",
        //         "fee_asset": "USDT",
        //         "profit": 0,
        //         "real_profit": 0,
        //         "id": "131560927-770334322963152896-1"
        //     }
        //
        // inverse swap cross margin fetchMyTrades
        //
        //     {
        //         "contract_type":"swap",
        //         "pair":"O3-USDT",
        //         "business_type":"swap",
        //         "query_id":652123190,
        //         "match_id":28306009409,
        //         "order_id":941137865226903553,
        //         "symbol":"O3",
        //         "contract_code":"O3-USDT",
        //         "direction":"sell",
        //         "offset":"open",
        //         "trade_volume":100.000000000000000000,
        //         "trade_price":0.398500000000000000,
        //         "trade_turnover":39.850000000000000000,
        //         "trade_fee":-0.007970000000000000,
        //         "offset_profitloss":0E-18,
        //         "create_date":1644426352999,
        //         "role":"Maker",
        //         "order_source":"api",
        //         "order_id_str":"941137865226903553",
        //         "id":"28306009409-941137865226903553-1",
        //         "fee_asset":"USDT",
        //         "margin_mode":"cross",
        //         "margin_account":"USDT",
        //         "real_profit":0E-18,
        //         "trade_partition":"USDT"
        //     }
        //
        const marketId = this.safeString2 (trade, 'contract_code', 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let timestamp = this.safeInteger2 (trade, 'ts', 'created-at');
        timestamp = this.safeInteger2 (trade, 'created_at', 'create_date', timestamp);
        const order = this.safeString2 (trade, 'order-id', 'order_id');
        let side = this.safeString (trade, 'direction');
        let type = this.safeString (trade, 'type');
        if (type !== undefined) {
            const typeParts = type.split ('-');
            side = typeParts[0];
            type = typeParts[1];
        }
        const takerOrMaker = this.safeStringLower (trade, 'role');
        const priceString = this.safeString2 (trade, 'price', 'trade_price');
        let amountString = this.safeString2 (trade, 'filled-amount', 'amount');
        amountString = this.safeString (trade, 'trade_volume', amountString);
        const costString = this.safeString (trade, 'trade_turnover');
        let fee = undefined;
        let feeCost = this.safeString2 (trade, 'filled-fees', 'trade_fee');
        const feeCurrencyId = this.safeString2 (trade, 'fee-currency', 'fee_asset');
        let feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        const filledPoints = this.safeString (trade, 'filled-points');
        if (filledPoints !== undefined) {
            if ((feeCost === undefined) || Precise.stringEquals (feeCost, '0')) {
                const feeDeductCurrency = this.safeString (trade, 'fee-deduct-currency');
                if (feeDeductCurrency !== '') {
                    feeCost = filledPoints;
                    feeCurrency = this.safeCurrencyCode (feeDeductCurrency);
                }
            }
        }
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const tradeId = this.safeString2 (trade, 'trade-id', 'tradeId');
        const id = this.safeString2 (trade, 'trade_id', 'id', tradeId);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrderTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'fetchSpotOrderTrades',
            // 'swap': 'fetchContractOrderTrades',
            // 'future': 'fetchContractOrderTrades',
        });
        return await this[method] (id, symbol, since, limit, params);
    }

    async fetchSpotOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order-id': id,
        };
        const response = await this.spotPrivateGetV1OrderOrdersOrderIdMatchresults (this.extend (request, params));
        return this.parseTrades (response['data'], undefined, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const request = {
            // spot -----------------------------------------------------------
            // 'symbol': market['id'],
            // 'types': 'buy-market,sell-market,buy-limit,sell-limit,buy-ioc,sell-ioc,buy-limit-maker,sell-limit-maker,buy-stop-limit,sell-stop-limit',
            // 'start-time': since, // max 48 hours within 120 days
            // 'end-time': this.milliseconds (), // max 48 hours within 120 days
            // 'from': 'id', // tring false N/A Search internal id to begin with if search next page, then this should be the last id (not trade-id) of last page; if search previous page, then this should be the first id (not trade-id) of last page
            // 'direct': 'next', // next, prev
            // 'size': limit, // default 100, max 500 The number of orders to return [1-500]
            // contracts ------------------------------------------------------
            // 'symbol': market['settleId'], // required
            // 'trade_type': 0, // required, 0 all, 1 open long, 2 open short, 3 close short, 4 close long, 5 liquidate long positions, 6 liquidate short positions
            // 'contract_code': market['id'],
            // 'start_time': since, // max 48 hours within 120 days
            // 'end_time': this.milliseconds (), // max 48 hours within 120 days
            // 'from_id': 'id', // tring false N/A Search internal id to begin with if search next page, then this should be the last id (not trade-id) of last page; if search previous page, then this should be the first id (not trade-id) of last page
            // 'direct': 'prev', // next, prev
            // 'size': limit, // default 20, max 50
        };
        let method = undefined;
        if (marketType === 'spot') {
            if (symbol !== undefined) {
                market = this.market (symbol);
                request['symbol'] = market['id'];
            }
            if (limit !== undefined) {
                request['size'] = limit; // default 100, max 500
            }
            if (since !== undefined) {
                request['start-time'] = since; // a date within 120 days from today
                // request['end-time'] = this.sum (since, 172800000); // 48 hours window
            }
            method = 'spotPrivateGetV1OrderMatchresults';
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol for ' + marketType + ' orders');
            }
            request['contract'] = market['id'];
            request['trade_type'] = 0; // 0 all, 1 open long, 2 open short, 3 close short, 4 close long, 5 liquidate long positions, 6 liquidate short positions
            if (since !== undefined) {
                request['start_time'] = since; // a date within 120 days from today
                // request['end_time'] = this.sum (request['start_time'], 172800000); // 48 hours window
            }
            if (limit !== undefined) {
                request['page_size'] = limit; // default 100, max 500
            }
            if (market['linear']) {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMyTrades', params);
                marginMode = (marginMode === undefined) ? 'cross' : marginMode;
                if (marginMode === 'isolated') {
                    method = 'contractPrivatePostLinearSwapApiV3SwapMatchresultsExact';
                } else if (marginMode === 'cross') {
                    method = 'contractPrivatePostLinearSwapApiV3SwapCrossMatchresultsExact';
                }
            } else if (market['inverse']) {
                if (marketType === 'future') {
                    method = 'contractPrivatePostApiV3ContractMatchresultsExact';
                    request['symbol'] = market['settleId'];
                } else if (marketType === 'swap') {
                    method = 'contractPrivatePostSwapApiV3SwapMatchresultsExact';
                } else {
                    throw new NotSupported (this.id + ' fetchMyTrades() does not support ' + marketType + ' markets');
                }
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "symbol": "polyusdt",
        //                 "fee-currency": "poly",
        //                 "source": "spot-web",
        //                 "price": "0.338",
        //                 "created-at": 1629443051839,
        //                 "role": "taker",
        //                 "order-id": 345487249132375,
        //                 "match-id": 5014,
        //                 "trade-id": 1085,
        //                 "filled-amount": "147.928994082840236",
        //                 "filled-fees": "0",
        //                 "filled-points": "0.1",
        //                 "fee-deduct-currency": "hbpoint",
        //                 "fee-deduct-state": "done",
        //                 "id": 313288753120940,
        //                 "type": "buy-market"
        //             }
        //         ]
        //     }
        //
        // contracts
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "trades": [
        //                 {
        //                     "query_id": 2424420723,
        //                     "match_id": 113891764710,
        //                     "order_id": 773135295142658048,
        //                     "symbol": "ADA",
        //                     "contract_type": "quarter", // swap
        //                     "business_type": "futures", // swap
        //                     "contract_code": "ADA201225",
        //                     "direction": "buy",
        //                     "offset": "open",
        //                     "trade_volume": 1,
        //                     "trade_price": 0.092,
        //                     "trade_turnover": 10,
        //                     "trade_fee": -0.021739130434782608,
        //                     "offset_profitloss": 0,
        //                     "create_date": 1604371703183,
        //                     "role": "Maker",
        //                     "order_source": "web",
        //                     "order_id_str": "773135295142658048",
        //                     "fee_asset": "ADA",
        //                     "margin_mode": "isolated", // cross
        //                     "margin_account": "BTC-USDT",
        //                     "real_profit": 0,
        //                     "id": "113891764710-773135295142658048-1",
        //                     "trade_partition":"USDT",
        //                 }
        //             ],
        //             "remain_size": 15,
        //             "next_id": 2424413094
        //         },
        //         "ts": 1604372202243
        //     }
        //
        let trades = this.safeValue (response, 'data');
        if (!Array.isArray (trades)) {
            trades = this.safeValue (trades, 'trades');
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = 1000, params = {}) {
        /**
         * @method
         * @name huobi#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'symbol': market['id'], // spot, future
            // 'contract_code': market['id'], // swap
        };
        let fieldName = 'symbol';
        let method = 'spotPublicGetMarketHistoryTrade';
        if (market['future']) {
            if (market['inverse']) {
                method = 'contractPublicGetMarketHistoryTrade';
            } else if (market['linear']) {
                method = 'contractPublicGetLinearSwapExMarketHistoryTrade';
                fieldName = 'contract_code';
            }
        } else if (market['swap']) {
            if (market['inverse']) {
                method = 'contractPublicGetSwapExMarketHistoryTrade';
            } else if (market['linear']) {
                method = 'contractPublicGetLinearSwapExMarketHistoryTrade';
            }
            fieldName = 'contract_code';
        }
        request[fieldName] = market['id'];
        if (limit !== undefined) {
            request['size'] = limit; // max 2000
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "status": "ok",
        //         "ch": "market.btcusdt.trade.detail",
        //         "ts": 1583497692365,
        //         "data": [
        //             {
        //                 "id": 105005170342,
        //                 "ts": 1583497692182,
        //                 "data": [
        //                     {
        //                         "amount": 0.010411000000000000,
        //                         "trade-id": 102090736910,
        //                         "ts": 1583497692182,
        //                         "id": 10500517034273194594947,
        //                         "price": 9096.050000000000000000,
        //                         "direction": "sell"
        //                     }
        //                 ]
        //             },
        //             // ...
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        let result = [];
        for (let i = 0; i < data.length; i++) {
            const trades = this.safeValue (data[i], 'data', []);
            for (let j = 0; j < trades.length; j++) {
                const trade = this.parseTrade (trades[j], market);
                result.push (trade);
            }
        }
        result = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (result, market['symbol'], since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "amount":1.2082,
        //         "open":0.025096,
        //         "close":0.025095,
        //         "high":0.025096,
        //         "id":1591515300,
        //         "count":6,
        //         "low":0.025095,
        //         "vol":0.0303205097
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'id'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'amount'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'period': this.timeframes[timeframe],
            // 'symbol': market['id'], // spot, future
            // 'contract_code': market['id'], // swap
            // 'size': 1000, // max 1000 for spot, 2000 for contracts
            // 'from': parseInt (since / 1000), spot only
            // 'to': this.seconds (), spot only
        };
        let fieldName = 'symbol';
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        let method = 'spotPublicGetMarketHistoryCandles';
        if (market['spot']) {
            if (since !== undefined) {
                request['from'] = parseInt (since / 1000);
            }
            if (limit !== undefined) {
                request['size'] = limit; // max 2000
            }
        } else if (market['future']) {
            if (market['inverse']) {
                if (price === 'mark') {
                    method = 'contractPublicGetIndexMarketHistoryMarkPriceKline';
                } else if (price === 'index') {
                    method = 'contractPublicGetIndexMarketHistoryIndex';
                } else if (price === 'premiumIndex') {
                    throw new BadRequest (this.id + ' ' + market['type'] + ' has no api endpoint for ' + price + ' kline data');
                } else {
                    method = 'contractPublicGetMarketHistoryKline';
                }
            } else if (market['linear']) {
                if (price === 'mark') {
                    method = 'contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline';
                } else if (price === 'index') {
                    throw new BadRequest (this.id + ' ' + market['type'] + ' has no api endpoint for ' + price + ' kline data');
                } else if (price === 'premiumIndex') {
                    method = 'contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline';
                } else {
                    method = 'contractPublicGetLinearSwapExMarketHistoryKline';
                }
                fieldName = 'contract_code';
            }
        } else if (market['swap']) {
            if (market['inverse']) {
                if (price === 'mark') {
                    method = 'contractPublicGetIndexMarketHistorySwapMarkPriceKline';
                } else if (price === 'index') {
                    throw new BadRequest (this.id + ' ' + market['type'] + ' has no api endpoint for ' + price + ' kline data');
                } else if (price === 'premiumIndex') {
                    method = 'contractPublicGetIndexMarketHistorySwapPremiumIndexKline';
                } else {
                    method = 'contractPublicGetSwapExMarketHistoryKline';
                }
            } else if (market['linear']) {
                if (price === 'mark') {
                    method = 'contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline';
                } else if (price === 'index') {
                    throw new BadRequest (this.id + ' ' + market['type'] + ' has no api endpoint for ' + price + ' kline data');
                } else if (price === 'premiumIndex') {
                    method = 'contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline';
                } else {
                    method = 'contractPublicGetLinearSwapExMarketHistoryKline';
                }
            }
            fieldName = 'contract_code';
        }
        if (market['contract']) {
            if (limit === undefined) {
                limit = 2000;
            }
            request['size'] = limit;
            if (price === undefined) {
                const duration = this.parseTimeframe (timeframe);
                if (since === undefined) {
                    const now = this.seconds ();
                    request['from'] = now - duration * (limit - 1);
                    request['to'] = now;
                } else {
                    const start = parseInt (since / 1000);
                    request['from'] = start;
                    request['to'] = this.sum (start, duration * (limit - 1));
                }
            }
        }
        request[fieldName] = market['id'];
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "status":"ok",
        //         "ch":"market.ethbtc.kline.1min",
        //         "ts":1591515374371,
        //         "data":[
        //             {"amount":0.0,"open":0.025095,"close":0.025095,"high":0.025095,"id":1591515360,"count":0,"low":0.025095,"vol":0.0},
        //             {"amount":1.2082,"open":0.025096,"close":0.025095,"high":0.025096,"id":1591515300,"count":6,"low":0.025095,"vol":0.0303205097},
        //             {"amount":0.0648,"open":0.025096,"close":0.025096,"high":0.025096,"id":1591515240,"count":2,"low":0.025096,"vol":0.0016262208},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name huobi#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/en/latest/manual.html#account-structure} indexed by the account type
         */
        await this.loadMarkets ();
        const response = await this.spotPrivateGetV1AccountAccounts (params);
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {"id":5202591,"type":"point","subtype":"","state":"working"},
        //             {"id":1528640,"type":"spot","subtype":"","state":"working"},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseAccounts (data);
    }

    parseAccount (account) {
        //
        //     {
        //         "id": 5202591,
        //         "type": "point",   // spot, margin, otc, point, super-margin, investment, borrow, grid-trading, deposit-earning, otc-options
        //         "subtype": "",     // The corresponding trading symbol (currency pair) the isolated margin is based on, e.g. btcusdt
        //         "state": "working" // working, lock
        //     }
        //
        const typeId = this.safeString (account, 'type');
        const accountsById = this.safeValue (this.options, 'accountsById', {});
        const type = this.safeValue (accountsById, typeId, typeId);
        return {
            'info': account,
            'id': this.safeString (account, 'id'),
            'type': type,
            'code': undefined,
        };
    }

    async fetchAccountIdByType (type, params = {}) {
        const accounts = await this.loadAccounts ();
        const accountId = this.safeValue (params, 'account-id');
        if (accountId !== undefined) {
            return accountId;
        }
        const indexedAccounts = this.indexBy (accounts, 'type');
        const defaultAccount = this.safeValue (accounts, 0, {});
        const account = this.safeValue (indexedAccounts, type, defaultAccount);
        return this.safeString (account, 'id');
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name huobi#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.spotPublicGetV2ReferenceCurrencies (params);
        //
        //    {
        //        "code": 200,
        //        "data": [
        //            {
        //                "currency": "sxp",
        //                "assetType": "1",
        //                "chains": [
        //                    {
        //                        "chain": "sxp",
        //                        "displayName": "ERC20",
        //                        "baseChain": "ETH",
        //                        "baseChainProtocol": "ERC20",
        //                        "isDynamic": true,
        //                        "numOfConfirmations": "12",
        //                        "numOfFastConfirmations": "12",
        //                        "depositStatus": "allowed",
        //                        "minDepositAmt": "0.23",
        //                        "withdrawStatus": "allowed",
        //                        "minWithdrawAmt": "0.23",
        //                        "withdrawPrecision": "8",
        //                        "maxWithdrawAmt": "227000.000000000000000000",
        //                        "withdrawQuotaPerDay": "227000.000000000000000000",
        //                        "withdrawQuotaPerYear": null,
        //                        "withdrawQuotaTotal": null,
        //                        "withdrawFeeType": "fixed",
        //                        "transactFeeWithdraw": "11.1653",
        //                        "addrWithTag": false,
        //                        "addrDepositTag": false
        //                    }
        //                ],
        //                "instStatus": "normal"
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const chains = this.safeValue (entry, 'chains', []);
            const networks = {};
            const instStatus = this.safeString (entry, 'instStatus');
            const currencyActive = instStatus === 'normal';
            let fee = undefined;
            let minPrecision = undefined;
            let minWithdraw = undefined;
            let maxWithdraw = undefined;
            let deposit = undefined;
            let withdraw = undefined;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                let baseChainProtocol = this.safeString (chain, 'baseChainProtocol');
                const huobiToken = 'h' + currencyId;
                if (baseChainProtocol === undefined) {
                    if (huobiToken === networkId) {
                        baseChainProtocol = 'ERC20';
                    } else {
                        baseChainProtocol = this.safeString (chain, 'displayName');
                    }
                }
                const network = this.safeNetwork (baseChainProtocol);
                minWithdraw = this.safeNumber (chain, 'minWithdrawAmt');
                maxWithdraw = this.safeNumber (chain, 'maxWithdrawAmt');
                const withdrawStatus = this.safeString (chain, 'withdrawStatus');
                const depositStatus = this.safeString (chain, 'depositStatus');
                const withdrawEnabled = (withdrawStatus === 'allowed');
                const depositEnabled = (depositStatus === 'allowed');
                const active = withdrawEnabled && depositEnabled;
                const precision = this.parsePrecision (this.safeString (chain, 'withdrawPrecision'));
                if (precision !== undefined) {
                    minPrecision = (minPrecision === undefined) ? precision : Precise.stringMin (precision, minPrecision);
                }
                if (withdrawEnabled && !withdraw) {
                    withdraw = true;
                } else if (!withdrawEnabled) {
                    withdraw = false;
                }
                if (depositEnabled && !deposit) {
                    deposit = true;
                } else if (!depositEnabled) {
                    deposit = false;
                }
                fee = this.safeNumber (chain, 'transactFeeWithdraw');
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'limits': {
                        'withdraw': {
                            'min': minWithdraw,
                            'max': maxWithdraw,
                        },
                    },
                    'active': active,
                    'deposit': depositEnabled,
                    'withdraw': withdrawEnabled,
                    'fee': fee,
                    'precision': this.parseNumber (precision),
                };
            }
            const networksKeys = Object.keys (networks);
            const networkLength = networksKeys.length;
            result[code] = {
                'info': entry,
                'code': code,
                'id': currencyId,
                'active': currencyActive,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': (networkLength <= 1) ? fee : undefined,
                'name': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': (networkLength <= 1) ? minWithdraw : undefined,
                        'max': (networkLength <= 1) ? maxWithdraw : undefined,
                    },
                },
                'precision': this.parseNumber (minPrecision),
                'networks': networks,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name huobi#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const options = this.safeValue (this.options, 'fetchBalance', {});
        const request = {};
        let method = undefined;
        const margin = (type === 'margin');
        const spot = (type === 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        const defaultSubType = this.safeString2 (this.options, 'defaultSubType', 'subType', 'linear');
        let subType = this.safeString2 (options, 'defaultSubType', 'subType', defaultSubType);
        subType = this.safeString2 (params, 'defaultSubType', 'subType', subType);
        const inverse = (subType === 'inverse');
        const linear = (subType === 'linear');
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBalance', params);
        params = this.omit (params, [ 'defaultSubType', 'subType' ]);
        const isolated = (marginMode === 'isolated');
        const cross = (marginMode === 'cross');
        if (spot) {
            if (isolated) {
                method = 'spotPrivateGetV1MarginAccountsBalance';
            } else if (cross) {
                method = 'spotPrivateGetV1CrossMarginAccountsBalance';
            } else {
                await this.loadAccounts ();
                const accountId = await this.fetchAccountIdByType (type, params);
                request['account-id'] = accountId;
                method = 'spotPrivateGetV1AccountAccountsAccountIdBalance';
            }
        } else if (margin) {
            if (isolated) {
                method = 'spotPrivateGetV1MarginAccountsBalance';
            } else {
                method = 'spotPrivateGetV1CrossMarginAccountsBalance';
            }
        } else if (linear) {
            if (isolated) {
                method = 'contractPrivatePostLinearSwapApiV1SwapAccountInfo';
            } else {
                method = 'contractPrivatePostLinearSwapApiV1SwapCrossAccountInfo';
            }
        } else if (inverse) {
            if (future) {
                method = 'contractPrivatePostApiV1ContractAccountInfo';
            } else if (swap) {
                method = 'contractPrivatePostSwapApiV1SwapAccountInfo';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "id": 1528640,
        //             "type": "spot",
        //             "state": "working",
        //             "list": [
        //                 { "currency": "lun", "type": "trade", "balance": "0", "seq-num": "0" },
        //                 { "currency": "lun", "type": "frozen", "balance": "0", "seq-num": "0" },
        //                 { "currency": "ht", "type": "frozen", "balance": "0", "seq-num": "145" },
        //             ]
        //         },
        //         "ts":1637644827566
        //     }
        //
        // cross margin
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "id": 51015302,
        //             "type": "cross-margin",
        //             "state": "working",
        //             "risk-rate": "2",
        //             "acct-balance-sum": "100",
        //             "debt-balance-sum": "0",
        //             "list": [
        //                 { "currency": "usdt", "type": "trade", "balance": "100" },
        //                 { "currency": "usdt", "type": "frozen", "balance": "0" },
        //                 { "currency": "usdt", "type": "loan-available", "balance": "200" },
        //                 { "currency": "usdt", "type": "transfer-out-available", "balance": "-1" },
        //                 { "currency": "ht", "type": "loan-available", "balance": "36.60724091" },
        //                 { "currency": "ht", "type": "transfer-out-available", "balance": "-1" },
        //                 { "currency": "btc", "type": "trade", "balance": "1168.533000000000000000" },
        //                 { "currency": "btc", "type": "frozen", "balance": "0.000000000000000000" },
        //                 { "currency": "btc", "type": "loan", "balance": "-2.433000000000000000" },
        //                 { "currency": "btc", "type": "interest", "balance": "-0.000533000000000000" },
        //                 { "currency": "btc", "type": "transfer-out-available", "balance": "1163.872174670000000000" },
        //                 { "currency": "btc", "type": "loan-available", "balance": "8161.876538350676000000" }
        //             ]
        //         },
        //         "code": 200
        //     }
        //
        // isolated margin
        //
        //     {
        //         "data": [
        //             {
        //                 "id": 18264,
        //                 "type": "margin",
        //                 "state": "working",
        //                 "symbol": "btcusdt",
        //                 "fl-price": "0",
        //                 "fl-type": "safe",
        //                 "risk-rate": "475.952571086994250554",
        //                 "list": [
        //                     { "currency": "btc","type": "trade","balance": "1168.533000000000000000" },
        //                     { "currency": "btc","type": "frozen","balance": "0.000000000000000000" },
        //                     { "currency": "btc","type": "loan","balance": "-2.433000000000000000" },
        //                     { "currency": "btc","type": "interest","balance": "-0.000533000000000000" },
        //                     { "currency": "btc","type": "transfer-out-available", "balance": "1163.872174670000000000" },
        //                     { "currency": "btc","type": "loan-available", "balance": "8161.876538350676000000" }
        //                 ]
        //             }
        //         ]
        //     }
        //
        // future, swap isolated
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "symbol": "BTC",
        //                 "margin_balance": 0,
        //                 "margin_position": 0E-18,
        //                 "margin_frozen": 0,
        //                 "margin_available": 0E-18,
        //                 "profit_real": 0,
        //                 "profit_unreal": 0,
        //                 "risk_rate": null,
        //                 "withdraw_available": 0,
        //                 "liquidation_price": null,
        //                 "lever_rate": 5,
        //                 "adjust_factor": 0.025000000000000000,
        //                 "margin_static": 0,
        //                 "is_debit": 0, // future only
        //                 "contract_code": "BTC-USD", // swap only
        //                 "margin_asset": "USDT", // linear only
        //                 "margin_mode": "isolated", // linear only
        //                 "margin_account": "BTC-USDT" // linear only
        //                 "transfer_profit_ratio": null // inverse only
        //             },
        //         ],
        //         "ts": 1637644827566
        //     }
        //
        // linear cross futures and linear cross swap
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "futures_contract_detail": [
        //                     {
        //                         "symbol": "ETH",
        //                         "contract_code": "ETH-USDT-220325",
        //                         "margin_position": 0,
        //                         "margin_frozen": 0,
        //                         "margin_available": 200.000000000000000000,
        //                         "profit_unreal": 0E-18,
        //                         "liquidation_price": null,
        //                         "lever_rate": 5,
        //                         "adjust_factor": 0.060000000000000000,
        //                         "contract_type": "quarter",
        //                         "pair": "ETH-USDT",
        //                         "business_type": "futures"
        //                     },
        //                 ],
        //                 "margin_mode": "cross",
        //                 "margin_account": "USDT",
        //                 "margin_asset": "USDT",
        //                 "margin_balance": 200.000000000000000000,
        //                 "margin_static": 200.000000000000000000,
        //                 "margin_position": 0,
        //                 "margin_frozen": 0,
        //                 "profit_real": 0E-18,
        //                 "profit_unreal": 0,
        //                 "withdraw_available": 2E+2,
        //                 "risk_rate": null,
        //                 "contract_detail": [
        //                     {
        //                         "symbol": "MANA",
        //                         "contract_code": "MANA-USDT",
        //                         "margin_position": 0,
        //                         "margin_frozen": 0,
        //                         "margin_available": 200.000000000000000000,
        //                         "profit_unreal": 0E-18,
        //                         "liquidation_price": null,
        //                         "lever_rate": 5,
        //                         "adjust_factor": 0.100000000000000000,
        //                         "contract_type": "swap",
        //                         "pair": "MANA-USDT",
        //                         "business_type": "swap"
        //                     },
        //                 ]
        //             }
        //         ],
        //         "ts": 1640915104870
        //     }
        //
        // TODO add balance parsing for linear swap
        //
        const result = { 'info': response };
        const data = this.safeValue (response, 'data');
        if (spot || margin) {
            if (isolated) {
                for (let i = 0; i < data.length; i++) {
                    const entry = data[i];
                    const symbol = this.safeSymbol (this.safeString (entry, 'symbol'));
                    const balances = this.safeValue (entry, 'list');
                    const subResult = {};
                    for (let i = 0; i < balances.length; i++) {
                        const balance = balances[i];
                        const currencyId = this.safeString (balance, 'currency');
                        const code = this.safeCurrencyCode (currencyId);
                        subResult[code] = this.parseMarginBalanceHelper (balance, code, subResult);
                    }
                    result[symbol] = this.safeBalance (subResult);
                }
            } else {
                const balances = this.safeValue (data, 'list', []);
                for (let i = 0; i < balances.length; i++) {
                    const balance = balances[i];
                    const currencyId = this.safeString (balance, 'currency');
                    const code = this.safeCurrencyCode (currencyId);
                    result[code] = this.parseMarginBalanceHelper (balance, code, result);
                }
            }
        } else if (linear) {
            const first = this.safeValue (data, 0, {});
            if (cross) {
                const account = this.account ();
                account['free'] = this.safeString (first, 'margin_balance', 'margin_available');
                account['used'] = this.safeString (first, 'margin_frozen');
                const currencyId = this.safeString2 (first, 'margin_asset', 'symbol');
                const code = this.safeCurrencyCode (currencyId);
                result[code] = account;
            } else if (isolated) {
                for (let i = 0; i < data.length; i++) {
                    const balance = data[i];
                    const marketId = this.safeString2 (balance, 'contract_code', 'margin_account');
                    const market = this.safeMarket (marketId);
                    const currencyId = this.safeString (balance, 'margin_asset');
                    const currency = this.safeCurrency (currencyId);
                    const code = this.safeString (market, 'settle', currency['code']);
                    // the exchange outputs positions for delisted markets
                    // https://www.huobi.com/support/en-us/detail/74882968522337
                    // we skip it if the market was delisted
                    if (code !== undefined) {
                        const account = this.account ();
                        account['free'] = this.safeString (balance, 'margin_balance');
                        account['used'] = this.safeString (balance, 'margin_frozen');
                        const accountsByCode = {};
                        accountsByCode[code] = account;
                        const symbol = market['symbol'];
                        result[symbol] = this.safeBalance (accountsByCode);
                    }
                }
                return result;
            }
        } else if (inverse) {
            for (let i = 0; i < data.length; i++) {
                const balance = data[i];
                const currencyId = this.safeString (balance, 'symbol');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'margin_available');
                account['used'] = this.safeString (balance, 'margin_frozen');
                result[code] = account;
            }
        }
        const isolatedMargin = isolated && (spot || margin);
        return isolatedMargin ? result : this.safeBalance (result);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const request = {
            // spot -----------------------------------------------------------
            // 'order-id': 'id',
            // 'symbol': market['id'],
            // 'client-order-id': clientOrderId,
            // 'clientOrderId': clientOrderId,
            // contracts ------------------------------------------------------
            // 'order_id': id,
            // 'client_order_id': clientOrderId,
            // 'contract_code': market['id'],
            // 'pair': 'BTC-USDT',
            // 'contract_type': 'this_week', // swap, this_week, next_week, quarter, next_ quarter
        };
        let method = undefined;
        if (marketType === 'spot') {
            const clientOrderId = this.safeString (params, 'clientOrderId');
            method = 'spotPrivateGetV1OrderOrdersOrderId';
            if (clientOrderId !== undefined) {
                method = 'spotPrivateGetV1OrderOrdersGetClientOrder';
                // will be filled below in extend ()
                // they expect clientOrderId instead of client-order-id
                // request['clientOrderId'] = clientOrderId;
            } else {
                request['order-id'] = id;
            }
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol for ' + marketType + ' orders');
            }
            request['contract_code'] = market['id'];
            if (market['linear']) {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('fetchOrder', params);
                marginMode = (marginMode === undefined) ? 'cross' : marginMode;
                if (marginMode === 'isolated') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapOrderInfo';
                } else if (marginMode === 'cross') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapCrossOrderInfo';
                }
            } else if (market['inverse']) {
                if (marketType === 'future') {
                    method = 'contractPrivatePostApiV1ContractOrderInfo';
                    request['symbol'] = market['settleId'];
                } else if (marketType === 'swap') {
                    method = 'contractPrivatePostSwapApiV1SwapOrderInfo';
                } else {
                    throw new NotSupported (this.id + ' fetchOrder() does not support ' + marketType + ' markets');
                }
            }
            const clientOrderId = this.safeString2 (params, 'client_order_id', 'clientOrderId');
            if (clientOrderId === undefined) {
                request['order_id'] = id;
            } else {
                request['client_order_id'] = clientOrderId;
                params = this.omit (params, [ 'client_order_id', 'clientOrderId' ]);
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "data":{
        //             "id":438398393065481,
        //             "symbol":"ethusdt",
        //             "account-id":1528640,
        //             "client-order-id":"AA03022abc2163433e-006b-480e-9ad1-d4781478c5e7",
        //             "amount":"0.100000000000000000",
        //             "price":"3000.000000000000000000",
        //             "created-at":1640549994642,
        //             "type":"buy-limit",
        //             "field-amount":"0.0",
        //             "field-cash-amount":"0.0",
        //             "field-fees":"0.0",
        //             "finished-at":0,
        //             "source":"spot-api",
        //             "state":"submitted",
        //             "canceled-at":0
        //         }
        //     }
        //
        // linear swap cross margin
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {
        //                 "business_type":"swap",
        //                 "contract_type":"swap",
        //                 "pair":"BTC-USDT",
        //                 "symbol":"BTC",
        //                 "contract_code":"BTC-USDT",
        //                 "volume":1,
        //                 "price":3000,
        //                 "order_price_type":"limit",
        //                 "order_type":1,
        //                 "direction":"buy",
        //                 "offset":"open",
        //                 "lever_rate":1,
        //                 "order_id":924912513206878210,
        //                 "client_order_id":null,
        //                 "created_at":1640557927189,
        //                 "trade_volume":0,
        //                 "trade_turnover":0,
        //                 "fee":0,
        //                 "trade_avg_price":null,
        //                 "margin_frozen":3.000000000000000000,
        //                 "profit":0,
        //                 "status":3,
        //                 "order_source":"api",
        //                 "order_id_str":"924912513206878210",
        //                 "fee_asset":"USDT",
        //                 "liquidation_type":"0",
        //                 "canceled_at":0,
        //                 "margin_asset":"USDT",
        //                 "margin_account":"USDT",
        //                 "margin_mode":"cross",
        //                 "is_tpsl":0,
        //                 "real_profit":0
        //             }
        //         ],
        //         "ts":1640557982556
        //     }
        //
        // linear swap isolated margin detail
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "symbol": "BTC",
        //             "contract_code": "BTC-USDT",
        //             "instrument_price": 0,
        //             "final_interest": 0,
        //             "adjust_value": 0,
        //             "lever_rate": 10,
        //             "direction": "sell",
        //             "offset": "open",
        //             "volume": 1.000000000000000000,
        //             "price": 13059.800000000000000000,
        //             "created_at": 1603703614712,
        //             "canceled_at": 0,
        //             "order_source": "api",
        //             "order_price_type": "opponent",
        //             "margin_frozen": 0,
        //             "profit": 0,
        //             "trades": [
        //                 {
        //                     "trade_id": 131560927,
        //                     "trade_price": 13059.800000000000000000,
        //                     "trade_volume": 1.000000000000000000,
        //                     "trade_turnover": 13.059800000000000000,
        //                     "trade_fee": -0.005223920000000000,
        //                     "created_at": 1603703614715,
        //                     "role": "taker",
        //                     "fee_asset": "USDT",
        //                     "profit": 0,
        //                     "real_profit": 0,
        //                     "id": "131560927-770334322963152896-1"
        //                 }
        //             ],
        //             "total_page": 1,
        //             "current_page": 1,
        //             "total_size": 1,
        //             "liquidation_type": "0",
        //             "fee_asset": "USDT",
        //             "fee": -0.005223920000000000,
        //             "order_id": 770334322963152896,
        //             "order_id_str": "770334322963152896",
        //             "client_order_id": 57012021045,
        //             "order_type": "1",
        //             "status": 6,
        //             "trade_avg_price": 13059.800000000000000000,
        //             "trade_turnover": 13.059800000000000000,
        //             "trade_volume": 1.000000000000000000,
        //             "margin_asset": "USDT",
        //             "margin_mode": "isolated",
        //             "margin_account": "BTC-USDT",
        //             "real_profit": 0,
        //             "is_tpsl": 0
        //         },
        //         "ts": 1603703678477
        //     }
        let order = this.safeValue (response, 'data');
        if (Array.isArray (order)) {
            order = this.safeValue (order, 0);
        }
        return this.parseOrder (order);
    }

    parseMarginBalanceHelper (balance, code, result) {
        let account = undefined;
        if (code in result) {
            account = result[code];
        } else {
            account = this.account ();
        }
        if (balance['type'] === 'trade') {
            account['free'] = this.safeString (balance, 'balance');
        }
        if (balance['type'] === 'frozen') {
            account['used'] = this.safeString (balance, 'balance');
        }
        return account;
    }

    async fetchSpotOrdersByStates (states, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const method = this.safeString (this.options, 'fetchOrdersByStatesMethod', 'spot_private_get_v1_order_orders'); // spot_private_get_v1_order_history
        if (method === 'spot_private_get_v1_order_orders') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
            }
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // spot_private_get_v1_order_orders GET /v1/order/orders ----------
            // 'symbol': market['id'], // required
            // 'types': 'buy-market,sell-market,buy-limit,sell-limit,buy-ioc,sell-ioc,buy-stop-limit,sell-stop-limit,buy-limit-fok,sell-limit-fok,buy-stop-limit-fok,sell-stop-limit-fok',
            // 'start-time': since, // max window of 48h within a range of 180 days, within past 2 hours for cancelled orders
            // 'end-time': this.milliseconds (),
            'states': states, // filled, partial-canceled, canceled
            // 'from': order['id'],
            // 'direct': 'next', // next, prev, used with from
            // 'size': 100, // max 100
            // spot_private_get_v1_order_history GET /v1/order/history --------
            // 'symbol': market['id'], // optional
            // 'start-time': since, // max window of 48h within a range of 180 days, within past 2 hours for cancelled orders
            // 'end-time': this.milliseconds (),
            // 'direct': 'next', // next, prev, used with from
            // 'size': 100, // max 100
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start-time'] = since; // a window of 48 hours within 180 days
            request['end-time'] = this.sum (since, 48 * 60 * 60 * 1000);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot_private_get_v1_order_orders GET /v1/order/orders
        //
        //     {
        //         status: "ok",
        //         data: [
        //             {
        //                 id: 13997833014,
        //                 symbol: "ethbtc",
        //                 'account-id': 3398321,
        //                 'client-order-id': "23456",
        //                 amount: "0.045000000000000000",
        //                 price: "0.034014000000000000",
        //                 'created-at': 1545836976871,
        //                 type: "sell-limit",
        //                 'field-amount': "0.045000000000000000",
        //                 'field-cash-amount': "0.001530630000000000",
        //                 'field-fees': "0.000003061260000000",
        //                 'finished-at': 1545837948214,
        //                 source: "spot-api",
        //                 state: "filled",
        //                 'canceled-at': 0
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchSpotOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchSpotOrdersByStates ('pre-submitted,submitted,partial-filled,filled,partial-canceled,canceled', symbol, since, limit, params);
    }

    async fetchClosedSpotOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchSpotOrdersByStates ('filled,partial-canceled,canceled', symbol, since, limit, params);
    }

    async fetchContractOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchContractOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        const request = {
            // POST /api/v1/contract_hisorders inverse futures ----------------
            // 'symbol': market['settleId'], // BTC, ETH, ...
            // 'order_type': '1', // 1 limit，3 opponent，4 lightning, 5 trigger order, 6 pst_only, 7 optimal_5, 8 optimal_10, 9 optimal_20, 10 fok, 11 ioc
            // POST /swap-api/v3/swap_hisorders inverse swap ------------------
            // POST /linear-swap-api/v3/swap_hisorders linear isolated --------
            // POST /linear-swap-api/v3/swap_cross_hisorders linear cross -----
            'contract': market['id'],
            'trade_type': 0, // 0:All; 1: Open long; 2: Open short; 3: Close short; 4: Close long; 5: Liquidate long positions; 6: Liquidate short positions, 17:buy(one-way mode), 18:sell(one-way mode)
            'type': 1, // 1:All Orders,2:Order in Finished Status
            'status': '0', // support multiple query seperated by ',',such as '3,4,5', 0: all. 3. Have sumbmitted the orders; 4. Orders partially matched; 5. Orders cancelled with partially matched; 6. Orders fully matched; 7. Orders cancelled;
        };
        if (since !== undefined) {
            request['start_time'] = since; // max 90 days back
            // request['end_time'] = since + 172800000; // 48 hours window
        }
        let method = undefined;
        if (market['linear']) {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('fetchContractOrders', params);
            marginMode = (marginMode === undefined) ? 'cross' : marginMode;
            method = this.getSupportedMapping (marginMode, {
                'isolated': 'contractPrivatePostLinearSwapApiV3SwapHisorders',
                'cross': 'contractPrivatePostLinearSwapApiV3SwapCrossHisorders',
            });
        } else if (market['inverse']) {
            method = this.getSupportedMapping (marketType, {
                'future': 'contractPrivatePostApiV3ContractHisorders',
                'swap': 'contractPrivatePostSwapApiV3SwapHisorders',
            });
            if (marketType === 'future') {
                request['symbol'] = market['settleId'];
            }
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "orders": [
        //                 {
        //                     "order_id": 773131315209248768,
        //                     "contract_code": "ADA201225",
        //                     "symbol": "ADA",
        //                     "lever_rate": 20,
        //                     "direction": "buy",
        //                     "offset": "close",
        //                     "volume": 1,
        //                     "price": 0.0925,
        //                     "create_date": 1604370469629,
        //                     "update_time": 1603704221118,
        //                     "order_source": "web",
        //                     "order_price_type": 6,
        //                     "order_type": 1,
        //                     "margin_frozen": 0,
        //                     "profit": 0,
        //                     "contract_type": "quarter",
        //                     "trade_volume": 0,
        //                     "trade_turnover": 0,
        //                     "fee": 0,
        //                     "trade_avg_price": 0,
        //                     "status": 3,
        //                     "order_id_str": "773131315209248768",
        //                     "fee_asset": "ADA",
        //                     "liquidation_type": "0",
        //                     "is_tpsl": 0,
        //                     "real_profit": 0
        //                     "margin_asset": "USDT",
        //                     "margin_mode": "cross",
        //                     "margin_account": "USDT",
        //                     "trade_partition": "USDT", // only in isolated & cross of linear
        //                     "reduce_only": "1", // only in isolated & cross of linear
        //                     "contract_type": "quarter", // only in cross-margin (inverse & linear)
        //                     "pair": "BTC-USDT", // only in cross-margin (inverse & linear)
        //                     "business_type": "futures" // only in cross-margin (inverse & linear)
        //                 }
        //             ],
        //             "total_page": 19,
        //             "current_page": 1,
        //             "total_size": 19
        //         },
        //         "ts": 1604370617322
        //     }
        //
        const orders = this.safeValue (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedContractOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': '5,6,7', // comma separated, 0 all, 3 submitted orders, 4 partially matched, 5 partially cancelled, 6 fully matched and closed, 7 canceled
        };
        return await this.fetchContractOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'fetchSpotOrders',
            'swap': 'fetchContractOrders',
            'future': 'fetchContractOrders',
        });
        if (method === undefined) {
            throw new NotSupported (this.id + ' fetchOrders() does not support ' + marketType + ' markets yet');
        }
        const contract = (marketType === 'swap') || (marketType === 'future');
        if (contract && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument for ' + marketType + ' orders');
        }
        return await this[method] (symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'fetchClosedSpotOrders',
            'swap': 'fetchClosedContractOrders',
            'future': 'fetchClosedContractOrders',
        });
        if (method === undefined) {
            throw new NotSupported (this.id + ' fetchClosedOrders() does not support ' + marketType + ' markets yet');
        }
        return await this[method] (symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const request = {
            // spot -----------------------------------------------------------
            // 'account-id': account['id'],
            // 'symbol': market['id'],
            // 'side': 'buy', // buy, sell
            // 'from': 'id', // order id to begin with
            // 'direct': 'prev', // prev, next, mandatory if from is defined
            // 'size': 100, // default 100, max 500
            // futures --------------------------------------------------------
            // 'symbol': market['settleId'],
            // 'page_index': 1, // default 1
            // 'page_size': limit, // default 20, max 50
            // 'sort_by': 'created_at', // created_at, update_time, descending sorting field
            // 'trade_type': 0, // 0 all, 1 buy long, 2 sell short, 3 buy short, 4 sell long
        };
        let method = undefined;
        if (marketType === 'spot') {
            method = 'spotPrivateGetV1OrderOpenOrders';
            if (symbol !== undefined) {
                market = this.market (symbol);
                request['symbol'] = market['id'];
            }
            // todo replace with fetchAccountIdByType
            let accountId = this.safeString (params, 'account-id');
            if (accountId === undefined) {
                // pick the first account
                await this.loadAccounts ();
                for (let i = 0; i < this.accounts.length; i++) {
                    const account = this.accounts[i];
                    if (account['type'] === 'spot') {
                        accountId = this.safeString (account, 'id');
                        if (accountId !== undefined) {
                            break;
                        }
                    }
                }
            }
            request['account-id'] = accountId;
            if (limit !== undefined) {
                request['size'] = limit;
            }
            params = this.omit (params, 'account-id');
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol for ' + marketType + ' orders');
            }
            const market = this.market (symbol);
            request['contract_code'] = market['id'];
            if (market['linear']) {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('fetchOpenOrders', params);
                marginMode = (marginMode === undefined) ? 'cross' : marginMode;
                if (marginMode === 'isolated') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapOpenorders';
                } else if (marginMode === 'cross') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapCrossOpenorders';
                }
            } else if (market['inverse']) {
                if (market['future']) {
                    method = 'contractPrivatePostApiV1ContractOpenorders';
                    request['symbol'] = market['settleId'];
                } else if (market['swap']) {
                    method = 'contractPrivatePostSwapApiV1SwapOpenorders';
                }
            }
            if (limit !== undefined) {
                request['page_size'] = limit;
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {
        //                 "symbol":"ethusdt",
        //                 "source":"api",
        //                 "amount":"0.010000000000000000",
        //                 "account-id":1528640,
        //                 "created-at":1561597491963,
        //                 "price":"400.000000000000000000",
        //                 "filled-amount":"0.0",
        //                 "filled-cash-amount":"0.0",
        //                 "filled-fees":"0.0",
        //                 "id":38477101630,
        //                 "state":"submitted",
        //                 "type":"sell-limit"
        //             }
        //         ]
        //     }
        //
        // futures
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "orders": [
        //                 {
        //                     "symbol": "ADA",
        //                     "contract_code": "ADA201225",
        //                     "contract_type": "quarter",
        //                     "volume": 1,
        //                     "price": 0.0925,
        //                     "order_price_type": "post_only",
        //                     "order_type": 1,
        //                     "direction": "buy",
        //                     "offset": "close",
        //                     "lever_rate": 20,
        //                     "order_id": 773131315209248768,
        //                     "client_order_id": null,
        //                     "created_at": 1604370469629,
        //                     "trade_volume": 0,
        //                     "trade_turnover": 0,
        //                     "fee": 0,
        //                     "trade_avg_price": null,
        //                     "margin_frozen": 0,
        //                     "profit": 0,
        //                     "status": 3,
        //                     "order_source": "web",
        //                     "order_id_str": "773131315209248768",
        //                     "fee_asset": "ADA",
        //                     "liquidation_type": null,
        //                     "canceled_at": null,
        //                     "is_tpsl": 0,
        //                     "update_time": 1606975980467,
        //                     "real_profit": 0
        //                 }
        //             ],
        //             "total_page": 1,
        //             "current_page": 1,
        //             "total_size": 1
        //         },
        //         "ts": 1604370488518
        //     }
        //
        let orders = this.safeValue (response, 'data');
        if (!Array.isArray (orders)) {
            orders = this.safeValue (orders, 'orders', []);
        }
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            // spot
            'partial-filled': 'open',
            'partial-canceled': 'canceled',
            'filled': 'closed',
            'canceled': 'canceled',
            'submitted': 'open',
            'created': 'open',  // For stop orders
            // contract
            '1': 'open',
            '2': 'open',
            '3': 'open',
            '4': 'open',
            '5': 'canceled', // partially matched
            '6': 'closed',
            '7': 'canceled',
            '11': 'canceling',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // spot
        //
        //     {
        //         id:  13997833014,
        //         symbol: "ethbtc",
        //         'account-id':  3398321,
        //         amount: "0.045000000000000000",
        //         price: "0.034014000000000000",
        //         'created-at':  1545836976871,
        //         type: "sell-limit",
        //         'field-amount': "0.045000000000000000", // they have fixed it for filled-amount
        //         'field-cash-amount': "0.001530630000000000", // they have fixed it for filled-cash-amount
        //         'field-fees': "0.000003061260000000", // they have fixed it for filled-fees
        //         'finished-at':  1545837948214,
        //         source: "spot-api",
        //         state: "filled",
        //         'canceled-at':  0
        //     }
        //
        //     {
        //         id:  20395337822,
        //         symbol: "ethbtc",
        //         'account-id':  5685075,
        //         amount: "0.001000000000000000",
        //         price: "0.0",
        //         'created-at':  1545831584023,
        //         type: "buy-market",
        //         'field-amount': "0.029100000000000000", // they have fixed it for filled-amount
        //         'field-cash-amount': "0.000999788700000000", // they have fixed it for filled-cash-amount
        //         'field-fees': "0.000058200000000000", // they have fixed it for filled-fees
        //         'finished-at':  1545831584181,
        //         source: "spot-api",
        //         state: "filled",
        //         'canceled-at':  0
        //     }
        //
        // linear swap cross margin createOrder
        //
        //     {
        //         "order_id":924660854912552960,
        //         "order_id_str":"924660854912552960"
        //     }
        //
        // contracts fetchOrder
        //
        //     {
        //         "business_type":"swap",
        //         "contract_type":"swap",
        //         "pair":"BTC-USDT",
        //         "symbol":"BTC",
        //         "contract_code":"BTC-USDT",
        //         "volume":1,
        //         "price":3000,
        //         "order_price_type":"limit",
        //         "order_type":1,
        //         "direction":"buy",
        //         "offset":"open",
        //         "lever_rate":1,
        //         "order_id":924912513206878210,
        //         "client_order_id":null,
        //         "created_at":1640557927189,
        //         "trade_volume":0,
        //         "trade_turnover":0,
        //         "fee":0,
        //         "trade_avg_price":null,
        //         "margin_frozen":3.000000000000000000,
        //         "profit":0,
        //         "status":3,
        //         "order_source":"api",
        //         "order_id_str":"924912513206878210",
        //         "fee_asset":"USDT",
        //         "liquidation_type":"0",
        //         "canceled_at":0,
        //         "margin_asset":"USDT",
        //         "margin_account":"USDT",
        //         "margin_mode":"cross",
        //         "is_tpsl":0,
        //         "real_profit":0
        //     }
        //
        // contracts fetchOrder detailed
        //
        //     {
        //         "symbol": "BTC",
        //         "contract_code": "BTC-USDT",
        //         "instrument_price": 0,
        //         "final_interest": 0,
        //         "adjust_value": 0,
        //         "lever_rate": 10,
        //         "direction": "sell",
        //         "offset": "open",
        //         "volume": 1.000000000000000000,
        //         "price": 13059.800000000000000000,
        //         "created_at": 1603703614712,
        //         "canceled_at": 0,
        //         "order_source": "api",
        //         "order_price_type": "opponent",
        //         "margin_frozen": 0,
        //         "profit": 0,
        //         "trades": [
        //             {
        //                 "trade_id": 131560927,
        //                 "trade_price": 13059.800000000000000000,
        //                 "trade_volume": 1.000000000000000000,
        //                 "trade_turnover": 13.059800000000000000,
        //                 "trade_fee": -0.005223920000000000,
        //                 "created_at": 1603703614715,
        //                 "role": "taker",
        //                 "fee_asset": "USDT",
        //                 "profit": 0,
        //                 "real_profit": 0,
        //                 "id": "131560927-770334322963152896-1"
        //             }
        //         ],
        //         "total_page": 1,
        //         "current_page": 1,
        //         "total_size": 1,
        //         "liquidation_type": "0",
        //         "fee_asset": "USDT",
        //         "fee": -0.005223920000000000,
        //         "order_id": 770334322963152896,
        //         "order_id_str": "770334322963152896",
        //         "client_order_id": 57012021045,
        //         "order_type": "1",
        //         "status": 6,
        //         "trade_avg_price": 13059.800000000000000000,
        //         "trade_turnover": 13.059800000000000000,
        //         "trade_volume": 1.000000000000000000,
        //         "margin_asset": "USDT",
        //         "margin_mode": "isolated",
        //         "margin_account": "BTC-USDT",
        //         "real_profit": 0,
        //         "is_tpsl": 0
        //     }
        //
        // fetchOrders
        //
        //     {
        //         "order_id": 773131315209248768,
        //         "contract_code": "ADA201225",
        //         "symbol": "ADA",
        //         "lever_rate": 20,
        //         "direction": "buy",
        //         "offset": "close",
        //         "volume": 1,
        //         "price": 0.0925,
        //         "create_date": 1604370469629,
        //         "update_time": 1603704221118,
        //         "order_source": "web",
        //         "order_price_type": 6,
        //         "order_type": 1,
        //         "margin_frozen": 0,
        //         "profit": 0,
        //         "contract_type": "quarter",
        //         "trade_volume": 0,
        //         "trade_turnover": 0,
        //         "fee": 0,
        //         "trade_avg_price": 0,
        //         "status": 3,
        //         "order_id_str": "773131315209248768",
        //         "fee_asset": "ADA",
        //         "liquidation_type": "0",
        //         "is_tpsl": 0,
        //         "real_profit": 0
        //         "margin_asset": "USDT",
        //         "margin_mode": "cross",
        //         "margin_account": "USDT",
        //         "trade_partition": "USDT", // only in isolated & cross of linear
        //         "reduce_only": "1", // only in isolated & cross of linear
        //         "contract_type": "quarter", // only in cross-margin (inverse & linear)
        //         "pair": "BTC-USDT", // only in cross-margin (inverse & linear)
        //         "business_type": "futures" // only in cross-margin (inverse & linear)
        //     }
        //
        const id = this.safeString2 (order, 'id', 'order_id_str');
        let side = this.safeString (order, 'direction');
        let type = this.safeString (order, 'order_price_type');
        if ('type' in order) {
            const orderType = order['type'].split ('-');
            side = orderType[0];
            type = orderType[1];
        }
        const status = this.parseOrderStatus (this.safeString2 (order, 'state', 'status'));
        const marketId = this.safeString2 (order, 'contract_code', 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeIntegerN (order, [ 'created_at', 'created-at', 'create_date' ]);
        const clientOrderId = this.safeString2 (order, 'client_order_id', 'client-order-id');
        let cost = undefined;
        let amount = undefined;
        if ((type !== undefined) && (type.indexOf ('market') >= 0)) {
            // for market orders amount is in quote currency, meaning it is the cost
            if (side === 'sell') {
                cost = this.safeString (order, 'field-cash-amount');
            } else {
                cost = this.safeString (order, 'amount');
            }
        } else {
            amount = this.safeString2 (order, 'volume', 'amount');
            cost = this.safeStringN (order, [ 'filled-cash-amount', 'field-cash-amount', 'trade_turnover' ]); // same typo
        }
        const filled = this.safeStringN (order, [ 'filled-amount', 'field-amount', 'trade_volume' ]); // typo in their API, filled amount
        const price = this.safeString (order, 'price');
        let feeCost = this.safeString2 (order, 'filled-fees', 'field-fees'); // typo in their API, filled feeSide
        feeCost = this.safeString (order, 'fee', feeCost);
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            const feeCurrencyId = this.safeString (order, 'fee_asset');
            if (feeCurrencyId !== undefined) {
                feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            } else {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const stopPrice = this.safeString (order, 'stop-price');
        const average = this.safeString (order, 'trade_avg_price');
        const trades = this.safeValue (order, 'trades');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': trades,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name huobi#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @param {float|undefined} params.stopPrice *spot and margin only* The price at which a trigger order is triggered at
         * @param {string|undefined} params.operator *spot and margin only* gte or lte, trigger price condition
         * @param {string|undefined} params.offset *contract only* 'open', 'close', or 'both', required in hedge mode
         * @param {bool|undefined} params.postOnly *contract only* true or false
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'createSpotOrder',
            'swap': 'createContractOrder',
            'future': 'createContractOrder',
        });
        if (method === undefined) {
            throw new NotSupported (this.id + ' createOrder() does not support ' + marketType + ' markets yet');
        }
        return await this[method] (symbol, type, side, amount, price, query);
    }

    async createSpotOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const accountId = await this.fetchAccountIdByType (market['type']);
        const request = {
            // spot -----------------------------------------------------------
            'account-id': accountId,
            'symbol': market['id'],
            // 'type': side + '-' + type, // buy-market, sell-market, buy-limit, sell-limit, buy-ioc, sell-ioc, buy-limit-maker, sell-limit-maker, buy-stop-limit, sell-stop-limit, buy-limit-fok, sell-limit-fok, buy-stop-limit-fok, sell-stop-limit-fok
            // 'amount': this.amountToPrecision (symbol, amount), // for buy market orders it's the order cost
            // 'price': this.priceToPrecision (symbol, price),
            // 'source': 'spot-api', // optional, spot-api, margin-api = isolated margin, super-margin-api = cross margin, c2c-margin-api
            // 'client-order-id': clientOrderId, // optional, max 64 chars, must be unique within 8 hours
            // 'stop-price': this.priceToPrecision (symbol, stopPrice), // trigger price for stop limit orders
            // 'operator': 'gte', // gte, lte, trigger price condition
        };
        let orderType = type.replace ('buy-', '');
        orderType = orderType.replace ('sell-', '');
        const options = this.safeValue (this.options, market['type'], {});
        const stopPrice = this.safeString2 (params, 'stopPrice', 'stop-price');
        if (stopPrice === undefined) {
            const stopOrderTypes = this.safeValue (options, 'stopOrderTypes', {});
            if (orderType in stopOrderTypes) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a stopPrice or a stop-price parameter for a stop order');
            }
        } else {
            const stopOperator = this.safeString (params, 'operator');
            if (stopOperator === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires an operator parameter "gte" or "lte" for a stop order');
            }
            params = this.omit (params, [ 'stopPrice', 'stop-price' ]);
            request['stop-price'] = this.priceToPrecision (symbol, stopPrice);
            request['operator'] = stopOperator;
            if ((orderType === 'limit') || (orderType === 'limit-fok')) {
                orderType = 'stop-' + orderType;
            } else if ((orderType !== 'stop-limit') && (orderType !== 'stop-limit-fok')) {
                throw new NotSupported (this.id + ' createOrder() does not support ' + type + ' orders');
            }
        }
        const postOnly = this.safeValue (params, 'postOnly', false);
        if (postOnly) {
            orderType = 'limit-maker';
        }
        request['type'] = side + '-' + orderType;
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client-order-id'); // must be 64 chars max and unique within 24 hours
        if (clientOrderId === undefined) {
            const broker = this.safeValue (this.options, 'broker', {});
            const brokerId = this.safeString (broker, 'id');
            request['client-order-id'] = brokerId + this.uuid ();
        } else {
            request['client-order-id'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'client-order-id', 'postOnly' ]);
        if ((orderType === 'market') && (side === 'buy')) {
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + " market buy order requires price argument to calculate cost (total amount of quote currency to spend for buying, amount * price). To switch off this warning exception and specify cost in the amount argument, set .options['createMarketBuyOrderRequiresPrice'] = false. Make sure you know what you're doing.");
                } else {
                    // despite that cost = amount * price is in quote currency and should have quote precision
                    // the exchange API requires the cost supplied in 'amount' to be of base precision
                    // more about it here:
                    // https://github.com/ccxt/ccxt/pull/4395
                    // https://github.com/ccxt/ccxt/issues/7611
                    // we use amountToPrecision here because the exchange requires cost in base precision
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    request['amount'] = this.costToPrecision (symbol, Precise.stringMul (amountString, priceString));
                }
            } else {
                request['amount'] = this.costToPrecision (symbol, amount);
            }
        } else {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        const limitOrderTypes = this.safeValue (options, 'limitOrderTypes', {});
        if (orderType in limitOrderTypes) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.spotPrivatePostV1OrderOrdersPlace (this.extend (request, params));
        //
        // spot
        //
        //     {"status":"ok","data":"438398393065481"}
        //
        const id = this.safeString (response, 'data');
        return {
            'info': response,
            'id': id,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'clientOrderId': undefined,
            'average': undefined,
        };
    }

    async createContractOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const offset = this.safeString (params, 'offset');
        const stopPrice = this.safeString (params, 'stopPrice');
        if (stopPrice !== undefined) {
            throw new NotSupported (this.id + ' createOrder() supports tp_trigger_price + tp_order_price for take profit orders and/or sl_trigger_price + sl_order price for stop loss orders, stop orders are supported only with open long orders and open short orders');
        }
        const market = this.market (symbol);
        const request = {
            // 'symbol': 'BTC', // optional, case-insenstive, both uppercase and lowercase are supported, "BTC", "ETH", ...
            // 'contract_type': 'this_week', // optional, this_week, next_week, quarter, next_quarter
            'contract_code': market['id'], // optional BTC180914
            // 'client_order_id': clientOrderId, // optional, must be less than 9223372036854775807
            // 'price': this.priceToPrecision (symbol, price), // optional
            'volume': this.amountToPrecision (symbol, amount),
            'direction': side, // buy, sell
            // 'offset': offset, // open, close, both
            //
            //     direction buy, offset open = open long
            //     direction sell, offset close = close long
            //     direction sell, offset open = open short
            //     direction buy, offset close = close short
            //
            // 'reduce_only': 0, // 1 or 0, in hedge mode it is invalid, and in one-way mode its value is 0 when not filled
            'lever_rate': 1, // required, using leverage greater than 20x requires prior approval of high-leverage agreement
            // 'order_price_type': 'limit', // required
            //
            //     order_price_type can be:
            //
            //     limit
            //     opponent // BBO
            //     post_only
            //     optimal_5
            //     optimal_10
            //     optimal_20
            //     ioc
            //     fok
            //     opponent_ioc // IOC order using the BBO price
            //     optimal_5_ioc
            //     optimal_10_ioc
            //     optimal_20_ioc
            //     opponent_fok // FOR order using the BBO price
            //     optimal_5_fok
            //     optimal_10_fok
            //     optimal_20_fok
            //
            // 'tp_trigger_price': this.priceToPrecision (symbol, triggerPrice),
            // 'tp_order_price': this.priceToPrecision (symbol, price),
            // 'tp_order_price_type': 'limit', // limit，optimal_5，optimal_10，optimal_20
            // 'sl_trigger_price': this.priceToPrecision (symbol, stopLossPrice),
            // 'sl_order_price': this.priceToPrecision (symbol, price),
            // 'sl_order_price_type': 'limit', // limit，optimal_5，optimal_10，optimal_20
        };
        const stopLossOrderPrice = this.safeString (params, 'sl_order_price');
        const stopLossTriggerPrice = this.safeString (params, 'sl_trigger_price');
        const takeProfitOrderPrice = this.safeString (params, 'tp_order_price');
        const takeProfitTriggerPrice = this.safeString (params, 'tp_trigger_price');
        const isOpenOrder = (offset === 'open');
        let isStopOrder = false;
        if (stopLossTriggerPrice !== undefined) {
            request['sl_trigger_price'] = this.priceToPrecision (symbol, stopLossTriggerPrice);
            isStopOrder = true;
            if (price !== undefined) {
                request['sl_order_price'] = this.priceToPrecision (symbol, price);
            }
        }
        if (stopLossOrderPrice !== undefined) {
            request['sl_order_price'] = this.priceToPrecision (symbol, stopLossOrderPrice);
            isStopOrder = true;
        }
        if (takeProfitTriggerPrice !== undefined) {
            request['tp_trigger_price'] = this.priceToPrecision (symbol, takeProfitTriggerPrice);
            isStopOrder = true;
            if (price !== undefined) {
                request['tp_order_price'] = this.priceToPrecision (symbol, price);
            }
        }
        if (takeProfitOrderPrice !== undefined) {
            request['tp_order_price'] = this.priceToPrecision (symbol, takeProfitOrderPrice);
            isStopOrder = true;
        }
        if (isStopOrder && !isOpenOrder) {
            throw new NotSupported (this.id + ' createOrder() supports tp_trigger_price + tp_order_price for take profit orders and/or sl_trigger_price + sl_order price for stop loss orders, stop orders are supported only with open long orders and open short orders');
        }
        params = this.omit (params, [ 'sl_order_price', 'sl_trigger_price', 'tp_order_price', 'tp_trigger_price' ]);
        const postOnly = this.safeValue (params, 'postOnly', false);
        if (postOnly) {
            type = 'post_only';
        }
        if (type === 'limit' || type === 'ioc' || type === 'fok' || type === 'post_only') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        request['order_price_type'] = type;
        const broker = this.safeValue (this.options, 'broker', {});
        const brokerId = this.safeString (broker, 'id');
        request['channel_code'] = brokerId;
        const clientOrderId = this.safeString2 (params, 'client_order_id', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
            params = this.omit (params, [ 'client_order_id', 'clientOrderId' ]);
        }
        let method = undefined;
        if (market['linear']) {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params);
            marginMode = (marginMode === undefined) ? 'cross' : marginMode;
            if (marginMode === 'isolated') {
                method = 'contractPrivatePostLinearSwapApiV1SwapOrder';
            } else if (marginMode === 'cross') {
                method = 'contractPrivatePostLinearSwapApiV1SwapCrossOrder';
            }
        } else if (market['inverse']) {
            if (market['swap']) {
                method = 'contractPrivatePostSwapApiV1SwapOrder';
            } else if (market['future']) {
                method = 'contractPrivatePostApiV1ContractOrder';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // linear swap cross margin
        //
        //     {
        //         "status":"ok",
        //         "data":{
        //             "order_id":924660854912552960,
        //             "order_id_str":"924660854912552960"
        //         },
        //         "ts":1640497927185
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name huobi#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const request = {
            // spot -----------------------------------------------------------
            // 'order-id': 'id',
            // 'symbol': market['id'],
            // 'client-order-id': clientOrderId,
            // contracts ------------------------------------------------------
            // 'order_id': id,
            // 'client_order_id': clientOrderId,
            // 'contract_code': market['id'],
            // 'pair': 'BTC-USDT',
            // 'contract_type': 'this_week', // swap, this_week, next_week, quarter, next_ quarter
        };
        let method = undefined;
        if (marketType === 'spot') {
            const clientOrderId = this.safeString2 (params, 'client-order-id', 'clientOrderId');
            method = 'spotPrivatePostV1OrderOrdersOrderIdSubmitcancel';
            if (clientOrderId === undefined) {
                request['order-id'] = id;
            } else {
                request['client-order-id'] = clientOrderId;
                method = 'spotPrivatePostV1OrderOrdersSubmitCancelClientOrder';
                params = this.omit (params, [ 'client-order-id', 'clientOrderId' ]);
            }
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol for ' + marketType + ' orders');
            }
            request['contract_code'] = market['id'];
            if (market['linear']) {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('cancelOrder', params);
                marginMode = (marginMode === undefined) ? 'cross' : marginMode;
                if (marginMode === 'isolated') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapCancel';
                } else if (marginMode === 'cross') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapCrossCancel';
                }
            } else if (market['inverse']) {
                if (market['future']) {
                    method = 'contractPrivatePostApiV1ContractCancel';
                    request['symbol'] = market['settleId'];
                } else if (market['swap']) {
                    method = 'contractPrivatePostSwapApiV1SwapCancel';
                }
            } else {
                throw new NotSupported (this.id + ' cancelOrder() does not support ' + marketType + ' markets');
            }
            const clientOrderId = this.safeString2 (params, 'client_order_id', 'clientOrderId');
            if (clientOrderId === undefined) {
                request['order_id'] = id;
            } else {
                request['client_order_id'] = clientOrderId;
                params = this.omit (params, [ 'client_order_id', 'clientOrderId' ]);
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         'status': 'ok',
        //         'data': '10138899000',
        //     }
        //
        // linear swap cross margin
        //
        //     {
        //         "status":"ok",
        //         "data":{
        //             "errors":[],
        //             "successes":"924660854912552960"
        //         },
        //         "ts":1640504486089
        //     }
        //
        return this.extend (this.parseOrder (response, market), {
            'id': id,
            'status': 'canceled',
        });
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name huobi#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrders', market, params);
        const request = {
            // spot -----------------------------------------------------------
            // 'order-ids': ids.jsoin (','), // max 50
            // 'client-order-ids': ids.join (','), // max 50
            // contracts ------------------------------------------------------
            // 'order_id': id, // comma separated, max 10
            // 'client_order_id': clientOrderId, // comma separated, max 10
            // 'contract_code': market['id'],
            // 'symbol': market['settleId'],
        };
        let method = undefined;
        if (marketType === 'spot') {
            let clientOrderIds = this.safeValue2 (params, 'client-order-id', 'clientOrderId');
            clientOrderIds = this.safeValue2 (params, 'client-order-ids', 'clientOrderIds', clientOrderIds);
            if (clientOrderIds === undefined) {
                if (typeof clientOrderIds === 'string') {
                    request['order-ids'] = ids;
                } else {
                    request['order-ids'] = ids.join (',');
                }
            } else {
                if (typeof clientOrderIds === 'string') {
                    request['client-order-ids'] = clientOrderIds;
                } else {
                    request['client-order-ids'] = clientOrderIds.join (',');
                }
                params = this.omit (params, [ 'client-order-id', 'client-order-ids', 'clientOrderId', 'clientOrderIds' ]);
            }
            method = 'spotPrivatePostV1OrderOrdersBatchcancel';
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol for ' + marketType + ' orders');
            }
            const market = this.market (symbol);
            request['contract_code'] = market['id'];
            if (market['linear']) {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('cancelOrders', params);
                marginMode = (marginMode === undefined) ? 'cross' : marginMode;
                if (marginMode === 'isolated') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapCancel';
                } else if (marginMode === 'cross') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapCrossCancel';
                }
            } else if (market['inverse']) {
                if (market['future']) {
                    method = 'contractPrivatePostApiV1ContractCancel';
                    request['symbol'] = market['settleId'];
                } else if (market['swap']) {
                    method = 'contractPrivatePostSwapApiV1SwapCancel';
                } else {
                    throw new NotSupported (this.id + ' cancelOrders() does not support ' + marketType + ' markets');
                }
            }
            let clientOrderIds = this.safeString2 (params, 'client_order_id', 'clientOrderId');
            clientOrderIds = this.safeString2 (params, 'client_order_ids', 'clientOrderIds', clientOrderIds);
            if (clientOrderIds === undefined) {
                request['order_id'] = ids.join (',');
            } else {
                request['client_order_id'] = clientOrderIds;
                params = this.omit (params, [ 'client_order_id', 'client_order_ids', 'clientOrderId', 'clientOrderIds' ]);
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "success": [
        //                 "5983466"
        //             ],
        //             "failed": [
        //                 {
        //                     "err-msg": "Incorrect order state",
        //                     "order-state": 7,
        //                     "order-id": "",
        //                     "err-code": "order-orderstate-error",
        //                     "client-order-id": "first"
        //                 },
        //                 {
        //                     "err-msg": "Incorrect order state",
        //                     "order-state": 7,
        //                     "order-id": "",
        //                     "err-code": "order-orderstate-error",
        //                     "client-order-id": "second"
        //                 },
        //                 {
        //                     "err-msg": "The record is not found.",
        //                     "order-id": "",
        //                     "err-code": "base-not-found",
        //                     "client-order-id": "third"
        //                 }
        //             ]
        //         }
        //     }
        //
        // contracts
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "errors": [
        //                 {
        //                     "order_id": "769206471845261312",
        //                     "err_code": 1061,
        //                     "err_msg": "This order doesnt exist."
        //                 }
        //             ],
        //             "successes": "773120304138219520"
        //         },
        //         "ts": 1604367997451
        //     }
        //
        return response;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name huobi#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        const request = {
            // spot -----------------------------------------------------------
            // 'account-id': account['id'],
            // 'symbol': market['id'], // a list of comma-separated symbols, all symbols by default
            // 'types' 'string', buy-market, sell-market, buy-limit, sell-limit, buy-ioc, sell-ioc, buy-stop-limit, sell-stop-limit, buy-limit-fok, sell-limit-fok, buy-stop-limit-fok, sell-stop-limit-fok
            // 'side': 'buy', // or 'sell'
            // 'size': 100, // the number of orders to cancel 1-100
            // contract -------------------------------------------------------
            // 'symbol': market['settleId'], // required
            // 'contract_code': market['id'],
            // 'contract_type': 'this_week', // swap, this_week, next_week, quarter, next_ quarter
            // 'direction': 'buy': // buy, sell
            // 'offset': 'open', // open, close
        };
        let method = undefined;
        if (marketType === 'spot') {
            if (symbol !== undefined) {
                market = this.market (symbol);
                request['symbol'] = market['id'];
            }
            method = 'spotPrivatePostV1OrderOrdersBatchCancelOpenOrders';
        } else {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol for ' + marketType + ' orders');
            }
            const market = this.market (symbol);
            request['contract_code'] = market['id'];
            if (market['linear']) {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('cancelAllOrders', params);
                marginMode = (marginMode === undefined) ? 'cross' : marginMode;
                if (marginMode === 'isolated') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapCancelallall';
                } else if (marginMode === 'cross') {
                    method = 'contractPrivatePostLinearSwapApiV1SwapCrossCancelall';
                }
            } else if (market['inverse']) {
                if (marketType === 'future') {
                    method = 'contractPrivatePostApiV1ContractCancelall';
                    request['symbol'] = market['settleId'];
                } else if (marketType === 'swap') {
                    method = 'contractPrivatePostSwapApiV1SwapCancelall';
                } else {
                    throw new NotSupported (this.id + ' cancelAllOrders() does not support ' + marketType + ' markets');
                }
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         code: 200,
        //         data: {
        //             "success-count": 2,
        //             "failed-count": 0,
        //             "next-id": 5454600
        //         }
        //     }
        //
        return response;
    }

    safeNetwork (networkId) {
        const lastCharacterIndex = networkId.length - 1;
        const lastCharacter = networkId[lastCharacterIndex];
        if (lastCharacter === '1') {
            networkId = networkId.slice (0, lastCharacterIndex);
        }
        const networksById = {};
        return this.safeString (networksById, networkId, networkId);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         currency: "usdt",
        //         address: "0xf7292eb9ba7bc50358e27f0e025a4d225a64127b",
        //         addressTag: "",
        //         chain: "usdterc20", // trc20usdt, hrc20usdt, usdt, algousdt
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'addressTag');
        const currencyId = this.safeString (depositAddress, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const code = this.safeCurrencyCode (currencyId, currency);
        const networkId = this.safeString (depositAddress, 'chain');
        const networks = this.safeValue (currency, 'networks', {});
        const networksById = this.indexBy (networks, 'id');
        const networkValue = this.safeValue (networksById, networkId, networkId);
        const network = this.safeStringUpper (networkValue, 'network');
        const note = this.safeString (depositAddress, 'note');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': network,
            'note': note,
            'info': depositAddress,
        };
    }

    async fetchDepositAddressesByNetwork (code, params = {}) {
        /**
         * @method
         * @name huobi#fetchDepositAddressesByNetwork
         * @description fetch a dictionary of addresses for a currency, indexed by network
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure} indexed by the network
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spotPrivateGetV2AccountDepositAddress (this.extend (request, params));
        //
        //     {
        //         code: 200,
        //         data: [
        //             {
        //                 currency: "eth",
        //                 address: "0xf7292eb9ba7bc50358e27f0e025a4d225a64127b",
        //                 addressTag: "",
        //                 chain: "eth"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const parsed = this.parseDepositAddresses (data, [ code ], false);
        return this.indexBy (parsed, 'network');
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name huobi#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        const rawNetwork = this.safeStringUpper (params, 'network');
        const networks = this.safeValue (this.options, 'networks', {});
        const network = this.safeStringUpper (networks, rawNetwork, rawNetwork);
        params = this.omit (params, 'network');
        const response = await this.fetchDepositAddressesByNetwork (code, params);
        let result = undefined;
        if (network === undefined) {
            result = this.safeValue (response, code);
            if (result === undefined) {
                const alias = this.safeString (networks, code, code);
                result = this.safeValue (response, alias);
                if (result === undefined) {
                    const defaultNetwork = this.safeString (this.options, 'defaultNetwork', 'ERC20');
                    result = this.safeValue (response, defaultNetwork);
                    if (result === undefined) {
                        const values = Object.values (response);
                        result = this.safeValue (values, 0);
                        if (result === undefined) {
                            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find deposit address for ' + code);
                        }
                    }
                }
            }
            return result;
        }
        result = this.safeValue (response, network);
        if (result === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find ' + network + ' deposit address for ' + code);
        }
        return result;
    }

    async fetchWithdrawAddressesByNetwork (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spotPrivateGetV2AccountWithdrawAddress (this.extend (request, params));
        //
        //     {
        //         code: 200,
        //         data: [
        //             {
        //                 currency: "eth",
        //                 chain: "eth"
        //                 note: "Binance - TRC20",
        //                 addressTag: "",
        //                 address: "0xf7292eb9ba7bc50358e27f0e025a4d225a64127b",
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const parsed = this.parseDepositAddresses (data, [ code ], false);
        return this.indexBy (parsed, 'network');
    }

    async fetchWithdrawAddress (code, params = {}) {
        const rawNetwork = this.safeStringUpper (params, 'network');
        const networks = this.safeValue (this.options, 'networks', {});
        const network = this.safeStringUpper (networks, rawNetwork, rawNetwork);
        params = this.omit (params, 'network');
        const response = await this.fetchWithdrawAddressesByNetwork (code, params);
        let result = undefined;
        if (network === undefined) {
            result = this.safeValue (response, code);
            if (result === undefined) {
                const alias = this.safeString (networks, code, code);
                result = this.safeValue (response, alias);
                if (result === undefined) {
                    const defaultNetwork = this.safeString (this.options, 'defaultNetwork', 'ERC20');
                    result = this.safeValue (response, defaultNetwork);
                    if (result === undefined) {
                        const values = Object.values (response);
                        result = this.safeValue (values, 0);
                        if (result === undefined) {
                            throw new InvalidAddress (this.id + ' fetchWithdrawAddress() cannot find withdraw address for ' + code);
                        }
                    }
                }
            }
            return result;
        }
        result = this.safeValue (response, network);
        if (result === undefined) {
            throw new InvalidAddress (this.id + ' fetchWithdrawAddress() cannot find ' + network + ' withdraw address for ' + code);
        }
        return result;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        if (limit === undefined || limit > 100) {
            limit = 100;
        }
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {
            'type': 'deposit',
            'from': 0, // From 'id' ... if you want to get results after a particular transaction id, pass the id in params.from
        };
        if (currency !== undefined) {
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['size'] = limit; // max 100
        }
        const response = await this.spotPrivateGetV1QueryDepositWithdraw (this.extend (request, params));
        // return response
        return this.parseTransactions (response['data'], currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        if (limit === undefined || limit > 100) {
            limit = 100;
        }
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {
            'type': 'withdraw',
            'from': 0, // From 'id' ... if you want to get results after a particular transaction id, pass the id in params.from
        };
        if (currency !== undefined) {
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['size'] = limit; // max 100
        }
        const response = await this.spotPrivateGetV1QueryDepositWithdraw (this.extend (request, params));
        // return response
        return this.parseTransactions (response['data'], currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         'id': 8211029,
        //         'type': 'deposit',
        //         'currency': 'eth',
        //         'chain': 'eth',
        //         'tx-hash': 'bd315....',
        //         'amount': 0.81162421,
        //         'address': '4b8b....',
        //         'address-tag': '',
        //         'fee': 0,
        //         'state': 'safe',
        //         'created-at': 1542180380965,
        //         'updated-at': 1542180788077
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         'id': 6908275,
        //         'type': 'withdraw',
        //         'currency': 'btc',
        //         'chain': 'btc',
        //         'tx-hash': 'c1a1a....',
        //         'amount': 0.80257005,
        //         'address': '1QR....',
        //         'address-tag': '',
        //         'fee': 0.0005,
        //         'state': 'confirmed',
        //         'created-at': 1552107295685,
        //         'updated-at': 1552108032859
        //     }
        //
        // withdraw
        //
        //     {
        //         "status": "ok",
        //         "data": "99562054"
        //     }
        //
        const timestamp = this.safeInteger (transaction, 'created-at');
        const code = this.safeCurrencyCode (this.safeString (transaction, 'currency'));
        let type = this.safeString (transaction, 'type');
        if (type === 'withdraw') {
            type = 'withdrawal';
        }
        let feeCost = this.safeString (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = Precise.stringAbs (feeCost);
        }
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'id', 'data'),
            'txid': this.safeString (transaction, 'tx-hash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.safeStringUpper (transaction, 'chain'),
            'address': this.safeString (transaction, 'address'),
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': this.safeString (transaction, 'address-tag'),
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'state')),
            'updated': this.safeInteger (transaction, 'updated-at'),
            'fee': {
                'currency': code,
                'cost': this.parseNumber (feeCost),
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            // deposit statuses
            'unknown': 'failed',
            'confirming': 'pending',
            'confirmed': 'ok',
            'safe': 'ok',
            'orphan': 'failed',
            // withdrawal statuses
            'submitted': 'pending',
            'canceled': 'canceled',
            'reexamine': 'pending',
            'reject': 'failed',
            'pass': 'pending',
            'wallet-reject': 'failed',
            // 'confirmed': 'ok', // present in deposit statuses
            'confirm-error': 'failed',
            'repealed': 'failed',
            'wallet-transfer': 'pending',
            'pre-transfer': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name huobi#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'address': address, // only supports existing addresses in your withdraw address list
            'amount': amount,
            'currency': currency['id'].toLowerCase (),
        };
        if (tag !== undefined) {
            request['addr-tag'] = tag; // only for XRP?
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeStringLower (networks, network, network); // handle ETH>ERC20 alias
        if (network !== undefined) {
            // possible chains - usdterc20, trc20usdt, hrc20usdt, usdt, algousdt
            if (network === 'erc20') {
                request['chain'] = currency['id'] + network;
            } else {
                request['chain'] = network + currency['id'];
            }
            params = this.omit (params, 'network');
        }
        const response = await this.spotPrivatePostV1DwWithdrawApiCreate (this.extend (request, params));
        //
        //     {
        //         "status": "ok",
        //         "data": "99562054"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         "data": 12345,
        //         "status": "ok"
        //     }
        //
        const id = this.safeString (transfer, 'data');
        const code = this.safeCurrencyCode (undefined, currency);
        return {
            'info': transfer,
            'id': id,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': code,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name huobi#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        let type = this.safeString (params, 'type');
        if (type === undefined) {
            const accountsByType = this.safeValue (this.options, 'accountsByType', {});
            fromAccount = fromAccount.toLowerCase (); // pro, futures
            toAccount = toAccount.toLowerCase (); // pro, futures
            const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
            const toId = this.safeString (accountsByType, toAccount, toAccount);
            type = fromId + '-to-' + toId;
        }
        const request = {
            'currency': currency['id'],
            'amount': parseFloat (this.currencyToPrecision (code, amount)),
            'type': type,
        };
        const response = await this.spotPrivatePostFuturesTransfer (this.extend (request, params));
        //
        //     {
        //         "data": 12345,
        //         "status": "ok"
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        return this.extend (transfer, {
            'amount': amount,
            'currency': code,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }

    async fetchBorrowRatesPerSymbol (params = {}) {
        /**
         * @method
         * @name huobi#fetchBorrowRatesPerSymbol
         * @description fetch borrow rates for currencies within individual markets
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure} indexed by market symbol
         */
        await this.loadMarkets ();
        const response = await this.spotPrivateGetV1MarginLoanInfo (params);
        //
        //    {
        //        "status": "ok",
        //        "data": [
        //            {
        //                "symbol": "1inchusdt",
        //                "currencies": [
        //                    {
        //                        "currency": "1inch",
        //                        "interest-rate": "0.00098",
        //                        "min-loan-amt": "90.000000000000000000",
        //                        "max-loan-amt": "1000.000000000000000000",
        //                        "loanable-amt": "0.0",
        //                        "actual-rate": "0.00098"
        //                    },
        //                    {
        //                        "currency": "usdt",
        //                        "interest-rate": "0.00098",
        //                        "min-loan-amt": "100.000000000000000000",
        //                        "max-loan-amt": "1000.000000000000000000",
        //                        "loanable-amt": "0.0",
        //                        "actual-rate": "0.00098"
        //                    }
        //                ]
        //            },
        //            ...
        //        ]
        //    }
        //
        const timestamp = this.milliseconds ();
        const data = this.safeValue (response, 'data', []);
        const rates = {
            'info': response,
        };
        for (let i = 0; i < data.length; i++) {
            const rate = data[i];
            const currencies = this.safeValue (rate, 'currencies', []);
            const symbolRates = {};
            for (let j = 0; j < currencies.length; j++) {
                const currency = currencies[j];
                const currencyId = this.safeString (currency, 'currency');
                const code = this.safeCurrencyCode (currencyId, 'currency');
                symbolRates[code] = {
                    'currency': code,
                    'rate': this.safeNumber (currency, 'actual-rate'),
                    'span': 86400000,
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                };
            }
            const market = this.markets_by_id[this.safeString (rate, 'symbol')];
            const symbol = market['symbol'];
            rates[symbol] = symbolRates;
        }
        return rates;
    }

    async fetchBorrowRates (params = {}) {
        /**
         * @method
         * @name huobi#fetchBorrowRates
         * @description fetch the borrow interest rates of all currencies
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure}
         */
        await this.loadMarkets ();
        const response = await this.spotPrivateGetV1MarginLoanInfo (params);
        // {
        //     "status": "ok",
        //     "data": [
        //         {
        //             "symbol": "1inchusdt",
        //             "currencies": [
        //                 {
        //                     "currency": "1inch",
        //                     "interest-rate": "0.00098",
        //                     "min-loan-amt": "90.000000000000000000",
        //                     "max-loan-amt": "1000.000000000000000000",
        //                     "loanable-amt": "0.0",
        //                     "actual-rate": "0.00098"
        //                 },
        //                 {
        //                     "currency": "usdt",
        //                     "interest-rate": "0.00098",
        //                     "min-loan-amt": "100.000000000000000000",
        //                     "max-loan-amt": "1000.000000000000000000",
        //                     "loanable-amt": "0.0",
        //                     "actual-rate": "0.00098"
        //                 }
        //             ]
        //         },
        //         ...
        //     ]
        // }
        const timestamp = this.milliseconds ();
        const data = this.safeValue (response, 'data', []);
        const rates = {};
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const currencies = this.safeValue (market, 'currencies', []);
            for (let j = 0; j < currencies.length; j++) {
                const currency = currencies[j];
                const currencyId = this.safeString (currency, 'currency');
                const code = this.safeCurrencyCode (currencyId, 'currency');
                rates[code] = {
                    'currency': code,
                    'rate': this.safeNumber (currency, 'actual-rate'),
                    'span': 86400000,
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                    'info': undefined,
                };
            }
        }
        return rates;
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since not used by huobi, but filtered internally by ccxt
         * @param {int|undefined} limit not used by huobi, but filtered internally by ccxt
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'contract_code': market['id'],
        };
        let method = undefined;
        if (market['inverse']) {
            method = 'contractPublicGetSwapApiV1SwapHistoricalFundingRate';
        } else if (market['linear']) {
            method = 'contractPublicGetLinearSwapApiV1SwapHistoricalFundingRate';
        } else {
            throw new NotSupported (this.id + ' fetchFundingRateHistory() supports inverse and linear swaps only');
        }
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "status": "ok",
        //     "data": {
        //         "total_page": 62,
        //         "current_page": 1,
        //         "total_size": 1237,
        //         "data": [
        //             {
        //                 "avg_premium_index": "-0.000208064395065541",
        //                 "funding_rate": "0.000100000000000000",
        //                 "realized_rate": "0.000100000000000000",
        //                 "funding_time": "1638921600000",
        //                 "contract_code": "BTC-USDT",
        //                 "symbol": "BTC",
        //                 "fee_asset": "USDT"
        //             },
        //         ]
        //     },
        //     "ts": 1638939294277
        // }
        //
        const data = this.safeValue (response, 'data');
        const result = this.safeValue (data, 'data', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'contract_code');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeInteger (entry, 'funding_time');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    parseFundingRate (contract, market = undefined) {
        //
        // {
        //      "status": "ok",
        //      "data": {
        //         "estimated_rate": "0.000100000000000000",
        //         "funding_rate": "0.000100000000000000",
        //         "contract_code": "BCH-USD",
        //         "symbol": "BCH",
        //         "fee_asset": "BCH",
        //         "funding_time": "1639094400000",
        //         "next_funding_time": "1639123200000"
        //     },
        //     "ts": 1639085854775
        // }
        //
        const nextFundingRate = this.safeNumber (contract, 'estimated_rate');
        const fundingTimestamp = this.safeInteger (contract, 'funding_time');
        const nextFundingTimestamp = this.safeInteger (contract, 'next_funding_time');
        const marketId = this.safeString (contract, 'contract_code');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': nextFundingRate,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name huobi#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        if (market['inverse']) {
            method = 'contractPublicGetSwapApiV1SwapFundingRate';
        } else if (market['linear']) {
            method = 'contractPublicGetLinearSwapApiV1SwapFundingRate';
        } else {
            throw new NotSupported (this.id + ' fetchFundingRate() supports inverse and linear swaps only');
        }
        const request = {
            'contract_code': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "status": "ok",
        //     "data": {
        //         "estimated_rate": "0.000100000000000000",
        //         "funding_rate": "0.000100000000000000",
        //         "contract_code": "BTC-USDT",
        //         "symbol": "BTC",
        //         "fee_asset": "USDT",
        //         "funding_time": "1603699200000",
        //         "next_funding_time": "1603728000000"
        //     },
        //     "ts": 1603696494714
        // }
        //
        const result = this.safeValue (response, 'data', {});
        return this.parseFundingRate (result, market);
    }

    async fetchFundingRates (symbols = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const options = this.safeValue (this.options, 'fetchFundingRates', {});
        const defaultSubType = this.safeString (this.options, 'defaultSubType', 'inverse');
        let subType = this.safeString (options, 'subType', defaultSubType);
        subType = this.safeString (params, 'subType', subType);
        const request = {
            // 'contract_code': market['id'],
        };
        const method = this.getSupportedMapping (subType, {
            'linear': 'contractPublicGetLinearSwapApiV1SwapBatchFundingRate',
            'inverse': 'contractPublicGetSwapApiV1SwapBatchFundingRate',
        });
        params = this.omit (params, 'subType');
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "estimated_rate": "0.000100000000000000",
        //                 "funding_rate": "0.000100000000000000",
        //                 "contract_code": "MANA-USDT",
        //                 "symbol": "MANA",
        //                 "fee_asset": "USDT",
        //                 "funding_time": "1643356800000",
        //                 "next_funding_time": "1643385600000",
        //                 "trade_partition":"USDT"
        //             },
        //         ],
        //         "ts": 1643346173103
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = this.parseFundingRates (data);
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @param {string|undefined} code unified currency code
         * @param {string|undefined} symbol unified market symbol when fetch interest in isolated markets
         * @param {int|undefined} since the earliest time in ms to fetch borrrow interest for
         * @param {int|undefined} limit the maximum number of structures to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [borrow interest structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-interest-structure}
         */
        await this.loadMarkets ();
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBorrowInterest', params);
        marginMode = (marginMode === undefined) ? 'cross' : marginMode;
        const request = {};
        if (since !== undefined) {
            request['start-date'] = this.yyyymmdd (since);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        let market = undefined;
        let method = undefined;
        if (marginMode === 'isolated') {
            method = 'privateGetMarginLoanOrders';
            if (symbol !== undefined) {
                market = this.market (symbol);
                request['symbol'] = market['id'];
            }
        } else {  // Cross
            method = 'privateGetCrossMarginLoanOrders';
            if (code !== undefined) {
                const currency = this.currency (code);
                request['currency'] = currency['id'];
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        //    {
        //        "status":"ok",
        //        "data":[
        //            {
        //                "loan-balance":"0.100000000000000000",
        //                "interest-balance":"0.000200000000000000",
        //                "loan-amount":"0.100000000000000000",
        //                "accrued-at":1511169724531,
        //                "interest-amount":"0.000200000000000000",
        //                "filled-points":"0.2",
        //                "filled-ht":"0.2",
        //                "currency":"btc",
        //                "id":394,
        //                "state":"accrual",
        //                "account-id":17747,
        //                "user-id":119913,
        //                "created-at":1511169724531
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data');
        const interest = this.parseBorrowInterests (data, market);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info, market = undefined) {
        // isolated
        //    {
        //        "interest-rate":"0.000040830000000000",
        //        "user-id":35930539,
        //        "account-id":48916071,
        //        "updated-at":1649320794195,
        //        "deduct-rate":"1",
        //        "day-interest-rate":"0.000980000000000000",
        //        "hour-interest-rate":"0.000040830000000000",
        //        "loan-balance":"100.790000000000000000",
        //        "interest-balance":"0.004115260000000000",
        //        "loan-amount":"100.790000000000000000",
        //        "paid-coin":"0.000000000000000000",
        //        "accrued-at":1649320794148,
        //        "created-at":1649320794148,
        //        "interest-amount":"0.004115260000000000",
        //        "deduct-amount":"0",
        //        "deduct-currency":"",
        //        "paid-point":"0.000000000000000000",
        //        "currency":"usdt",
        //        "symbol":"ltcusdt",
        //        "id":20242721,
        //    }
        //
        // cross
        //   {
        //       "id":3416576,
        //       "user-id":35930539,
        //       "account-id":48956839,
        //       "currency":"usdt",
        //       "loan-amount":"102",
        //       "loan-balance":"102",
        //       "interest-amount":"0.00416466",
        //       "interest-balance":"0.00416466",
        //       "created-at":1649322735333,
        //       "accrued-at":1649322735382,
        //       "state":"accrual",
        //       "filled-points":"0",
        //       "filled-ht":"0"
        //   }
        //
        const marketId = this.safeString (info, 'symbol');
        const marginMode = (marketId === undefined) ? 'cross' : 'isolated';
        market = this.safeMarket (marketId);
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeNumber (info, 'accrued-at');
        return {
            'account': (marginMode === 'isolated') ? symbol : 'cross',  // deprecated
            'symbol': symbol,
            'marginMode': marginMode,
            'currency': this.safeCurrencyCode (this.safeString (info, 'currency')),
            'interest': this.safeNumber (info, 'interest-amount'),
            'interestRate': this.safeNumber (info, 'interest-rate'),
            'amountBorrowed': this.safeNumber (info, 'loan-amount'),
            'timestamp': timestamp,  // Interest accrued time
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        const query = this.omit (params, this.extractParams (path));
        if (typeof api === 'string') {
            // signing implementation for the old endpoints
            if ((api === 'public') || (api === 'private')) {
                url += this.version;
            } else if ((api === 'v2Public') || (api === 'v2Private')) {
                url += 'v2';
            }
            url += '/' + this.implodeParams (path, params);
            if (api === 'private' || api === 'v2Private') {
                this.checkRequiredCredentials ();
                const timestamp = this.ymdhms (this.milliseconds (), 'T');
                let request = {
                    'SignatureMethod': 'HmacSHA256',
                    'SignatureVersion': '2',
                    'AccessKeyId': this.apiKey,
                    'Timestamp': timestamp,
                };
                if (method !== 'POST') {
                    request = this.extend (request, query);
                }
                request = this.keysort (request);
                let auth = this.urlencode (request);
                // unfortunately, PHP demands double quotes for the escaped newline symbol
                const payload = [ method, this.hostname, url, auth ].join ("\n"); // eslint-disable-line quotes
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
                auth += '&' + this.urlencode ({ 'Signature': signature });
                url += '?' + auth;
                if (method === 'POST') {
                    body = this.json (query);
                    headers = {
                        'Content-Type': 'application/json',
                    };
                } else {
                    headers = {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    };
                }
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
            url = this.implodeParams (this.urls['api'][api], {
                'hostname': this.hostname,
            }) + url;
        } else {
            // signing implementation for the new endpoints
            // const [ type, access ] = api;
            const type = this.safeString (api, 0);
            const access = this.safeString (api, 1);
            const levelOneNestedPath = this.safeString (api, 2);
            const levelTwoNestedPath = this.safeString (api, 3);
            let hostname = undefined;
            let hostnames = this.safeValue (this.urls['hostnames'], type);
            if (typeof hostnames !== 'string') {
                hostnames = this.safeValue (hostnames, levelOneNestedPath);
                if ((typeof hostname !== 'string') && (levelTwoNestedPath !== undefined)) {
                    hostnames = this.safeValue (hostnames, levelTwoNestedPath);
                }
            }
            hostname = hostnames;
            url += this.implodeParams (path, params);
            if (access === 'public') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (access === 'private') {
                this.checkRequiredCredentials ();
                const timestamp = this.ymdhms (this.milliseconds (), 'T');
                let request = {
                    'SignatureMethod': 'HmacSHA256',
                    'SignatureVersion': '2',
                    'AccessKeyId': this.apiKey,
                    'Timestamp': timestamp,
                };
                if (method !== 'POST') {
                    request = this.extend (request, query);
                }
                request = this.keysort (request);
                let auth = this.urlencode (request);
                // unfortunately, PHP demands double quotes for the escaped newline symbol
                const payload = [ method, hostname, url, auth ].join ("\n"); // eslint-disable-line quotes
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
                auth += '&' + this.urlencode ({ 'Signature': signature });
                url += '?' + auth;
                if (method === 'POST') {
                    body = this.json (query);
                    if (body.length === 2) {
                        body = '{}';
                    }
                    headers = {
                        'Content-Type': 'application/json',
                    };
                } else {
                    headers = {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    };
                }
            }
            url = this.implodeParams (this.urls['api'][type], {
                'hostname': hostname,
            }) + url;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('status' in response) {
            //
            //     {"status":"error","err-code":"order-limitorder-amount-min-error","err-msg":"limit order amount error, min: `0.001`","data":null}
            //
            const status = this.safeString (response, 'status');
            if (status === 'error') {
                const code = this.safeString2 (response, 'err-code', 'err_code');
                const feedback = this.id + ' ' + body;
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                const message = this.safeString2 (response, 'err-msg', 'err_msg');
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch funding history for
         * @param {int|undefined} limit the maximum number of funding history structures to retrieve
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-history-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchFundingHistory', market, params);
        let method = undefined;
        const request = {
            'type': '30,31',
        };
        if (since !== undefined) {
            request['start_date'] = since;
        }
        if (market['linear']) {
            method = 'contractPrivatePostLinearSwapApiV3SwapFinancialRecordExact';
            //
            // {
            //   status: 'ok',
            //   data: {
            //     financial_record: [
            //       {
            //         id: '1320088022',
            //         type: '30',
            //         amount: '0.004732510000000000',
            //         ts: '1641168019321',
            //         contract_code: 'BTC-USDT',
            //         asset: 'USDT',
            //         margin_account: 'BTC-USDT',
            //         face_margin_account: ''
            //       },
            //     ],
            //     remain_size: '0',
            //     next_id: null
            //   },
            //   ts: '1641189898425'
            // }
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('fetchFundingHistory', params);
            marginMode = (marginMode === undefined) ? 'cross' : marginMode;
            if (marginMode === 'isolated') {
                request['mar_acct'] = market['id'];
            } else {
                request['mar_acct'] = market['quoteId'];
            }
        } else {
            if (marketType === 'swap') {
                method = 'contractPrivatePostSwapApiV3SwapFinancialRecordExact';
                request['contract'] = market['id'];
                //
                //     {
                //         "code": 200,
                //         "msg": "",
                //         "data": [
                //             {
                //                 "query_id": 138798248,
                //                 "id": 117840,
                //                 "type": 5,
                //                 "amount": -0.024464850000000000,
                //                 "ts": 1638758435635,
                //                 "contract_code": "BTC-USDT-211210",
                //                 "asset": "USDT",
                //                 "margin_account": "USDT",
                //                 "face_margin_account": ""
                //             }
                //         ],
                //         "ts": 1604312615051
                //     }
                //
            } else {
                method = 'contractPrivatePostApiV3ContractFinancialRecordExact';
                request['symbol'] = market['id'];
            }
        }
        const response = await this[method] (this.extend (request, query));
        const data = this.safeValue (response, 'data', []);
        return this.parseIncomes (data, market, since, limit);
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name huobi#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('setLeverage', market, params);
        let method = undefined;
        if (market['linear']) {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('setLeverage', params);
            marginMode = (marginMode === undefined) ? 'cross' : marginMode;
            method = this.getSupportedMapping (marginMode, {
                'isolated': 'contractPrivatePostLinearSwapApiV1SwapSwitchLeverRate',
                'cross': 'contractPrivatePostLinearSwapApiV1SwapCrossSwitchLeverRate',
            });
            //
            //     {
            //       status: 'ok',
            //       data: {
            //         contract_code: 'BTC-USDT',
            //         lever_rate: '100',
            //         margin_mode: 'isolated'
            //       },
            //       ts: '1641184710649'
            //     }
            //
        } else {
            method = this.getSupportedMapping (marketType, {
                'future': 'contractPrivatePostApiV1ContractSwitchLeverRate',
                'swap': 'contractPrivatePostSwapApiV1SwapSwitchLeverRate',
            });
            //
            // future
            //     {
            //       status: 'ok',
            //       data: { symbol: 'BTC', lever_rate: 5 },
            //       ts: 1641184578678
            //     }
            //
            // swap
            //
            //     {
            //       status: 'ok',
            //       data: { contract_code: 'BTC-USD', lever_rate: '5' },
            //       ts: '1641184652979'
            //     }
            //
        }
        const request = {
            'lever_rate': leverage,
        };
        if (marketType === 'future' && market['inverse']) {
            request['symbol'] = market['settleId'];
        } else {
            request['contract_code'] = market['id'];
        }
        const response = await this[method] (this.extend (request, query));
        return response;
    }

    parseIncome (income, market = undefined) {
        //
        //     {
        //       id: '1667161118',
        //       symbol: 'BTC',
        //       type: '31',
        //       amount: '-2.11306593188E-7',
        //       ts: '1641139308983',
        //       contract_code: 'BTC-USD'
        //     }
        //
        const marketId = this.safeString (income, 'contract_code');
        const symbol = this.safeSymbol (marketId, market);
        const amount = this.safeNumber (income, 'amount');
        const timestamp = this.safeInteger (income, 'ts');
        const id = this.safeString (income, 'id');
        const currencyId = this.safeString2 (income, 'symbol', 'asset');
        const code = this.safeCurrencyCode (currencyId);
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'amount': amount,
        };
    }

    parseIncomes (incomes, market = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < incomes.length; i++) {
            const entry = incomes[i];
            const parsed = this.parseIncome (entry, market);
            result.push (parsed);
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit, 'timestamp');
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //       symbol: 'BTC',
        //       contract_code: 'BTC-USDT',
        //       volume: '1.000000000000000000',
        //       available: '1.000000000000000000',
        //       frozen: '0E-18',
        //       cost_open: '47162.000000000000000000',
        //       cost_hold: '47151.300000000000000000',
        //       profit_unreal: '0.007300000000000000',
        //       profit_rate: '-0.000144183876850008',
        //       lever_rate: '2',
        //       position_margin: '23.579300000000000000',
        //       direction: 'buy',
        //       profit: '-0.003400000000000000',
        //       last_price: '47158.6',
        //       margin_asset: 'USDT',
        //       margin_mode: 'isolated',
        //       margin_account: 'BTC-USDT',
        //       margin_balance: '24.973020070000000000',
        //       margin_position: '23.579300000000000000',
        //       margin_frozen: '0',
        //       margin_available: '1.393720070000000000',
        //       profit_real: '0E-18',
        //       risk_rate: '1.044107779705080303',
        //       withdraw_available: '1.386420070000000000000000000000000000',
        //       liquidation_price: '22353.229148614609571788',
        //       adjust_factor: '0.015000000000000000',
        //       margin_static: '24.965720070000000000'
        //     }
        //
        market = this.safeMarket (this.safeString (position, 'contract_code'));
        const symbol = market['symbol'];
        const contracts = this.safeString (position, 'volume');
        const contractSize = this.safeValue (market, 'contractSize');
        const contractSizeString = this.numberToString (contractSize);
        const entryPrice = this.safeNumber (position, 'cost_open');
        const initialMargin = this.safeString (position, 'position_margin');
        const rawSide = this.safeString (position, 'direction');
        const side = (rawSide === 'buy') ? 'long' : 'short';
        const unrealizedProfit = this.safeNumber (position, 'profit_unreal');
        let marginMode = this.safeString (position, 'margin_mode');
        const leverage = this.safeString (position, 'lever_rate');
        const percentage = Precise.stringMul (this.safeString (position, 'profit_rate'), '100');
        const lastPrice = this.safeString (position, 'last_price');
        const faceValue = Precise.stringMul (contracts, contractSizeString);
        let notional = undefined;
        if (market['linear']) {
            notional = Precise.stringMul (faceValue, lastPrice);
        } else {
            notional = Precise.stringDiv (faceValue, lastPrice);
            marginMode = 'cross';
        }
        const intialMarginPercentage = Precise.stringDiv (initialMargin, notional);
        const collateral = this.safeString (position, 'margin_balance');
        const liquidationPrice = this.safeNumber (position, 'liquidation_price');
        const adjustmentFactor = this.safeString (position, 'adjust_factor');
        const maintenanceMarginPercentage = Precise.stringDiv (adjustmentFactor, leverage);
        const maintenanceMargin = Precise.stringMul (maintenanceMarginPercentage, notional);
        const marginRatio = Precise.stringDiv (maintenanceMargin, collateral);
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': this.parseNumber (contracts),
            'contractSize': contractSize,
            'entryPrice': entryPrice,
            'collateral': this.parseNumber (collateral),
            'side': side,
            'unrealizedProfit': unrealizedProfit,
            'leverage': this.parseNumber (leverage),
            'percentage': this.parseNumber (percentage),
            'marginMode': marginMode,
            'notional': this.parseNumber (notional),
            'markPrice': undefined,
            'liquidationPrice': liquidationPrice,
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (intialMarginPercentage),
            'maintenanceMargin': this.parseNumber (maintenanceMargin),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentage),
            'marginRatio': this.parseNumber (marginRatio),
            'timestamp': undefined,
            'datetime': undefined,
        };
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchPositions', params);
        marginMode = (marginMode === undefined) ? 'cross' : marginMode;
        const defaultSubType = this.safeString (this.options, 'defaultSubType', 'inverse');
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchPositions', undefined, params);
        if (marketType === 'spot') {
            marketType = 'future';
        }
        let method = undefined;
        if (defaultSubType === 'linear') {
            method = this.getSupportedMapping (marginMode, {
                'isolated': 'contractPrivatePostLinearSwapApiV1SwapPositionInfo',
                'cross': 'contractPrivatePostLinearSwapApiV1SwapCrossPositionInfo',
            });
            //
            //     {
            //       status: 'ok',
            //       data: [
            //         {
            //           symbol: 'BTC',
            //           contract_code: 'BTC-USDT',
            //           volume: '1.000000000000000000',
            //           available: '1.000000000000000000',
            //           frozen: '0E-18',
            //           cost_open: '47162.000000000000000000',
            //           cost_hold: '47162.000000000000000000',
            //           profit_unreal: '0.047300000000000000',
            //           profit_rate: '0.002005852169119206',
            //           lever_rate: '2',
            //           position_margin: '23.604650000000000000',
            //           direction: 'buy',
            //           profit: '0.047300000000000000',
            //           last_price: '47209.3',
            //           margin_asset: 'USDT',
            //           margin_mode: 'isolated',
            //           margin_account: 'BTC-USDT'
            //         }
            //       ],
            //       ts: '1641108676768'
            //     }
            //
        } else {
            method = this.getSupportedMapping (marketType, {
                'future': 'contractPrivatePostApiV1ContractPositionInfo',
                'swap': 'contractPrivatePostSwapApiV1SwapPositionInfo',
            });
            //
            // future
            //     {
            //       status: 'ok',
            //       data: [
            //         {
            //           symbol: 'BTC',
            //           contract_code: 'BTC220624',
            //           contract_type: 'next_quarter',
            //           volume: '1.000000000000000000',
            //           available: '1.000000000000000000',
            //           frozen: '0E-18',
            //           cost_open: '49018.880000000009853343',
            //           cost_hold: '49018.880000000009853343',
            //           profit_unreal: '-8.62360608500000000000000000000000000000000000000E-7',
            //           profit_rate: '-0.000845439023678622',
            //           lever_rate: '2',
            //           position_margin: '0.001019583964880634',
            //           direction: 'sell',
            //           profit: '-8.62360608500000000000000000000000000000000000000E-7',
            //           last_price: '49039.61'
            //         }
            //       ],
            //       ts: '1641109895199'
            //     }
            //
            // swap
            //     {
            //       status: 'ok',
            //       data: [
            //         {
            //           symbol: 'BTC',
            //           contract_code: 'BTC-USD',
            //           volume: '1.000000000000000000',
            //           available: '1.000000000000000000',
            //           frozen: '0E-18',
            //           cost_open: '47150.000000000012353300',
            //           cost_hold: '47150.000000000012353300',
            //           profit_unreal: '0E-54',
            //           profit_rate: '-7.86E-16',
            //           lever_rate: '3',
            //           position_margin: '0.000706963591375044',
            //           direction: 'buy',
            //           profit: '0E-54',
            //           last_price: '47150'
            //         }
            //       ],
            //       ts: '1641109636572'
            //     }
            //
        }
        const response = await this[method] (params);
        const data = this.safeValue (response, 'data', []);
        const timestamp = this.safeInteger (response, 'ts');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const position = data[i];
            const parsed = this.parsePosition (position);
            result.push (this.extend (parsed, {
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            }));
        }
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    async fetchPosition (symbol, params = {}) {
        /**
         * @method
         * @name huobi#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchPosition', params);
        marginMode = (marginMode === undefined) ? 'cross' : marginMode;
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchPosition', market, params);
        let method = undefined;
        if (market['linear']) {
            method = this.getSupportedMapping (marginMode, {
                'isolated': 'contractPrivatePostLinearSwapApiV1SwapAccountPositionInfo',
                'cross': 'contractPrivatePostLinearSwapApiV1SwapCrossAccountPositionInfo',
            });
            //
            // isolated
            //
            //     {
            //         "status": "ok",
            //         "data": [
            //             {
            //                 "positions": [],
            //                 "symbol": "BTC",
            //                 "margin_balance": 1.949728350000000000,
            //                 "margin_position": 0,
            //                 "margin_frozen": 0E-18,
            //                 "margin_available": 1.949728350000000000,
            //                 "profit_real": -0.050271650000000000,
            //                 "profit_unreal": 0,
            //                 "risk_rate": null,
            //                 "withdraw_available": 1.949728350000000000,
            //                 "liquidation_price": null,
            //                 "lever_rate": 20,
            //                 "adjust_factor": 0.150000000000000000,
            //                 "margin_static": 1.949728350000000000,
            //                 "contract_code": "BTC-USDT",
            //                 "margin_asset": "USDT",
            //                 "margin_mode": "isolated",
            //                 "margin_account": "BTC-USDT",
            //                 "trade_partition": "USDT",
            //                 "position_mode": "dual_side"
            //             },
            //             ... opposite side position can be present here too (if hedge)
            //         ],
            //         "ts": 1653605008286
            //     }
            //
            // cross
            //
            //     {
            //         "status": "ok",
            //         "data": {
            //             "positions": [
            //                 {
            //                     "symbol": "BTC",
            //                     "contract_code": "BTC-USDT",
            //                     "volume": "1.000000000000000000",
            //                     "available": "1.000000000000000000",
            //                     "frozen": "0E-18",
            //                     "cost_open": "29530.000000000000000000",
            //                     "cost_hold": "29530.000000000000000000",
            //                     "profit_unreal": "-0.010000000000000000",
            //                     "profit_rate": "-0.016931933626820200",
            //                     "lever_rate": "50",
            //                     "position_margin": "0.590400000000000000",
            //                     "direction": "buy",
            //                     "profit": "-0.010000000000000000",
            //                     "last_price": "29520",
            //                     "margin_asset": "USDT",
            //                     "margin_mode": "cross",
            //                     "margin_account": "USDT",
            //                     "contract_type": "swap",
            //                     "pair": "BTC-USDT",
            //                     "business_type": "swap",
            //                     "trade_partition": "USDT",
            //                     "position_mode": "dual_side"
            //                 },
            //                 ... opposite side position can be present here too (if hedge)
            //             ],
            //             "futures_contract_detail": [
            //                 {
            //                     "symbol": "BTC",
            //                     "contract_code": "BTC-USDT-220624",
            //                     "margin_position": "0",
            //                     "margin_frozen": "0E-18",
            //                     "margin_available": "1.497799766913531118",
            //                     "profit_unreal": "0",
            //                     "liquidation_price": null,
            //                     "lever_rate": "30",
            //                     "adjust_factor": "0.250000000000000000",
            //                     "contract_type": "quarter",
            //                     "pair": "BTC-USDT",
            //                     "business_type": "futures",
            //                     "trade_partition": "USDT"
            //                 },
            //                 ... other items listed with different expiration (contract_code)
            //             ],
            //             "margin_mode": "cross",
            //             "margin_account": "USDT",
            //             "margin_asset": "USDT",
            //             "margin_balance": "2.088199766913531118",
            //             "margin_static": "2.098199766913531118",
            //             "margin_position": "0.590400000000000000",
            //             "margin_frozen": "0E-18",
            //             "profit_real": "-0.016972710000000000",
            //             "profit_unreal": "-0.010000000000000000",
            //             "withdraw_available": "1.497799766913531118",
            //             "risk_rate": "9.105496355562965147",
            //             "contract_detail": [
            //                {
            //                     "symbol": "BTC",
            //                     "contract_code": "BTC-USDT",
            //                     "margin_position": "0.590400000000000000",
            //                     "margin_frozen": "0E-18",
            //                     "margin_available": "1.497799766913531118",
            //                     "profit_unreal": "-0.010000000000000000",
            //                     "liquidation_price": "27625.176468365024050352",
            //                     "lever_rate": "50",
            //                     "adjust_factor": "0.350000000000000000",
            //                     "contract_type": "swap",
            //                     "pair": "BTC-USDT",
            //                     "business_type": "swap",
            //                     "trade_partition": "USDT"
            //                 },
            //                 ... all symbols listed
            //             ],
            //             "position_mode": "dual_side"
            //         },
            //         "ts": "1653604697466"
            //     }
            //
        } else {
            method = this.getSupportedMapping (marketType, {
                'future': 'contractPrivatePostApiV1ContractAccountPositionInfo',
                'swap': 'contractPrivatePostSwapApiV1SwapAccountPositionInfo',
            });
            //
            // future, swap
            //
            //     {
            //       "status": "ok",
            //       "data": [
            //         {
            //             "symbol": "XRP",
            //             "contract_code": "XRP-USD", // only present in swap
            //             "margin_balance": 12.186361450698276582,
            //             "margin_position": 5.036261079774375503,
            //             "margin_frozen": 0E-18,
            //             "margin_available": 7.150100370923901079,
            //             "profit_real": -0.012672343876723438,
            //             "profit_unreal": 0.163382354575000020,
            //             "risk_rate": 2.344723929650649798,
            //             "withdraw_available": 6.986718016348901059,
            //             "liquidation_price": 0.271625200493799547,
            //             "lever_rate": 5,
            //             "adjust_factor": 0.075000000000000000,
            //             "margin_static": 12.022979096123276562,
            //             "positions": [
            //                 {
            //                     "symbol": "XRP",
            //                     "contract_code": "XRP-USD",
            //                     // "contract_type": "this_week", // only present in future
            //                     "volume": 1.0,
            //                     "available": 1.0,
            //                     "frozen": 0E-18,
            //                     "cost_open": 0.394560000000000000,
            //                     "cost_hold": 0.394560000000000000,
            //                     "profit_unreal": 0.163382354575000020,
            //                     "profit_rate": 0.032232070910556005,
            //                     "lever_rate": 5,
            //                     "position_margin": 5.036261079774375503,
            //                     "direction": "buy",
            //                     "profit": 0.163382354575000020,
            //                     "last_price": 0.39712
            //                 },
            //                 ... opposite side position can be present here too (if hedge)
            //             ]
            //         }
            //       ],
            //       "ts": 1653600470199
            //     }
            //
            // cross usdt swap
            //
            //     {
            //         "status":"ok",
            //         "data":{
            //             "positions":[],
            //             "futures_contract_detail":[]
            //             "margin_mode":"cross",
            //             "margin_account":"USDT",
            //             "margin_asset":"USDT",
            //             "margin_balance":"1.000000000000000000",
            //             "margin_static":"1.000000000000000000",
            //             "margin_position":"0",
            //             "margin_frozen":"1.000000000000000000",
            //             "profit_real":"0E-18",
            //             "profit_unreal":"0",
            //             "withdraw_available":"0",
            //             "risk_rate":"15.666666666666666666",
            //             "contract_detail":[]
            //         },
            //         "ts":"1645521118946"
            //     }
            //
        }
        const request = {};
        if (market['future'] && market['inverse']) {
            request['symbol'] = market['settleId'];
        } else {
            if (marginMode === 'cross') {
                request['margin_account'] = 'USDT'; // only allowed value
            }
            request['contract_code'] = market['id'];
        }
        const response = await this[method] (this.extend (request, query));
        const data = this.safeValue (response, 'data');
        let account = undefined;
        if (marginMode === 'cross') {
            account = data;
        } else {
            account = this.safeValue (data, 0);
        }
        const omitted = this.omit (account, [ 'positions' ]);
        const positions = this.safeValue (account, 'positions');
        let position = undefined;
        if (market['future'] && market['inverse']) {
            for (let i = 0; i < positions.length; i++) {
                const entry = positions[i];
                if (entry['contract_code'] === market['id']) {
                    position = entry;
                    break;
                }
            }
        } else {
            position = this.safeValue (positions, 0);
        }
        const timestamp = this.safeInteger (response, 'ts');
        const parsed = this.parsePosition (this.extend (position, omitted));
        return this.extend (parsed, {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    parseLedgerEntryType (type) {
        const types = {
            'trade': 'trade',
            'etf': 'trade',
            'transact-fee': 'fee',
            'fee-deduction': 'fee',
            'transfer': 'transfer',
            'credit': 'credit',
            'liquidation': 'trade',
            'interest': 'credit',
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
            'withdraw-fee': 'fee',
            'exchange': 'exchange',
            'other-types': 'transfer',
            'rebate': 'rebate',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "accountId": 10000001,
        //         "currency": "usdt",
        //         "transactAmt": 10.000000000000000000,
        //         "transactType": "transfer",
        //         "transferType": "margin-transfer-out",
        //         "transactId": 0,
        //         "transactTime": 1629882331066,
        //         "transferer": 28483123,
        //         "transferee": 13496526
        //     }
        //
        const id = this.safeString (item, 'transactId');
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeNumber (item, 'transactAmt');
        const transferType = this.safeString (item, 'transferType');
        const type = this.parseLedgerEntryType (transferType);
        const direction = this.safeString (item, 'direction');
        const timestamp = this.safeInteger (item, 'transactTime');
        const datetime = this.iso8601 (timestamp);
        const account = this.safeString (item, 'accountId');
        return {
            'id': id,
            'direction': direction,
            'account': account,
            'referenceId': id,
            'referenceAccount': account,
            'type': type,
            'currency': code,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': datetime,
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
            'info': item,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets ();
        const accountId = await this.fetchAccountIdByType ('spot', params);
        const request = {
            'accountId': accountId,
            // 'currency': code,
            // 'transactTypes': 'all', // default all
            // 'startTime': 1546272000000,
            // 'endTime': 1546272000000,
            // 'sort': asc, // asc, desc
            // 'limit': 100, // range 1-500
            // 'fromId': 323 // first record ID in this query for pagination
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 500
        }
        const response = await this.spotPrivateGetV2AccountLedger (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "accountId": 10000001,
        //                 "currency": "usdt",
        //                 "transactAmt": 10.000000000000000000,
        //                 "transactType": "transfer",
        //                 "transferType": "margin-transfer-out",
        //                 "transactId": 0,
        //                 "transactTime": 1629882331066,
        //                 "transferer": 28483123,
        //                 "transferee": 13496526
        //             },
        //             {
        //                 "accountId": 10000001,
        //                 "currency": "usdt",
        //                 "transactAmt": -10.000000000000000000,
        //                 "transactType": "transfer",
        //                 "transferType": "margin-transfer-in",
        //                 "transactId": 0,
        //                 "transactTime": 1629882096562,
        //                 "transferer": 13496526,
        //                 "transferee": 28483123
        //             }
        //         ],
        //         "nextId": 1624316679,
        //         "ok": true
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseLedger (data, currency, since, limit);
    }

    async fetchLeverageTiers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/en/latest/manual.html#leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.contractPublicGetLinearSwapApiV1SwapAdjustfactor (params);
        //
        //    {
        //        "status": "ok",
        //        "data": [
        //            {
        //                "symbol": "MANA",
        //                "contract_code": "MANA-USDT",
        //                "margin_mode": "isolated",
        //                "trade_partition": "USDT",
        //                "list": [
        //                    {
        //                        "lever_rate": 75,
        //                        "ladders": [
        //                            {
        //                                "ladder": 0,
        //                                "min_size": 0,
        //                                "max_size": 999,
        //                                "adjust_factor": 0.7
        //                            },
        //                            ...
        //                        ]
        //                    }
        //                    ...
        //                ]
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data');
        return this.parseLeverageTiers (data, symbols, 'contract_code');
    }

    async fetchMarketLeverageTiers (symbol, params = {}) {
        /**
         * @method
         * @name huobi#fetchMarketLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/en/latest/manual.html#leverage-tiers-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            if (!market['contract']) {
                throw new BadRequest (this.id + ' fetchMarketLeverageTiers() symbol supports contract markets only');
            }
            request['contract_code'] = market['id'];
        }
        const response = await this.contractPublicGetLinearSwapApiV1SwapAdjustfactor (this.extend (request, params));
        //
        //    {
        //        "status": "ok",
        //        "data": [
        //            {
        //                "symbol": "MANA",
        //                "contract_code": "MANA-USDT",
        //                "margin_mode": "isolated",
        //                "trade_partition": "USDT",
        //                "list": [
        //                    {
        //                        "lever_rate": 75,
        //                        "ladders": [
        //                            {
        //                                "ladder": 0,
        //                                "min_size": 0,
        //                                "max_size": 999,
        //                                "adjust_factor": 0.7
        //                            },
        //                            ...
        //                        ]
        //                    }
        //                    ...
        //                ]
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data');
        const tiers = this.parseLeverageTiers (data, [ symbol ], 'contract_code');
        return this.safeValue (tiers, symbol);
    }

    parseLeverageTiers (response, symbols = undefined, marketIdKey = undefined) {
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const list = this.safeValue (item, 'list', []);
            const tiers = [];
            const currency = this.safeString (item, 'trade_partition');
            const id = this.safeString (item, marketIdKey);
            const symbol = this.safeSymbol (id);
            if (this.inArray (symbol, symbols)) {
                for (let j = 0; j < list.length; j++) {
                    const obj = list[j];
                    const leverage = this.safeString (obj, 'lever_rate');
                    const ladders = this.safeValue (obj, 'ladders', []);
                    for (let k = 0; k < ladders.length; k++) {
                        const bracket = ladders[k];
                        const adjustFactor = this.safeString (bracket, 'adjust_factor');
                        tiers.push ({
                            'tier': this.safeInteger (bracket, 'ladder'),
                            'currency': this.safeCurrencyCode (currency),
                            'minNotional': this.safeNumber (bracket, 'min_size'),
                            'maxNotional': this.safeNumber (bracket, 'max_size'),
                            'maintenanceMarginRate': this.parseNumber (Precise.stringDiv (adjustFactor, leverage)),
                            'maxLeverage': this.parseNumber (leverage),
                            'info': bracket,
                        });
                    }
                }
                result[symbol] = tiers;
            }
        }
        return result;
    }

    async fetchOpenInterestHistory (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchOpenInterestHistory
         * @description Retrieves the open interest history of a currency
         * @see https://huobiapi.github.io/docs/dm/v1/en/#query-information-on-open-interest
         * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-information-on-open-interest
         * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-information-on-open-interest
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} timeframe '1h', '4h', '12h', or '1d'
         * @param {int|undefined} since Not used by huobi api, but response parsed by CCXT
         * @param {int|undefined} limit Default：48，Data Range [1,200]
         * @param {object} params Exchange specific parameters
         * @param {int} params.amount_type *required* Open interest unit. 1-cont，2-cryptocurrency
         * @param {int|undefined} params.pair eg BTC-USDT *Only for USDT-M*
         * @returns {object} an array of [open interest structures]{@link https://docs.ccxt.com/en/latest/manual.html#open-interest-structure}
         */
        if (timeframe !== '1h' && timeframe !== '4h' && timeframe !== '12h' && timeframe !== '1d') {
            throw new BadRequest (this.id + ' fetchOpenInterestHistory cannot only use the 1h, 4h, 12h and 1d timeframe');
        }
        await this.loadMarkets ();
        const timeframes = {
            '1h': '60min',
            '4h': '4hour',
            '12h': '12hour',
            '1d': '1day',
        };
        const market = this.market (symbol);
        const amountType = this.safeNumber2 (params, 'amount_type', 'amountType');
        if (amountType === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenInterestHistory requires parameter params.amountType to be either 1 (cont), or 2 (cryptocurrency)');
        }
        const request = {
            'period': timeframes[timeframe],
            'amount_type': amountType,
        };
        let method = undefined;
        if (market['future']) {
            request['contract_type'] = this.safeString (market['info'], 'contract_type');
            request['symbol'] = market['baseId'];  // currency code on coin-m futures
            method = 'contractPublicGetApiV1ContractHisOpenInterest'; // coin-m futures
        } else if (market['linear']) {
            request['contract_type'] = 'swap';
            request['contract_code'] = market['id'];
            request['contract_code'] = market['id'];
            method = 'contractPublicGetLinearSwapApiV1SwapHisOpenInterest'; // USDT-M
        } else {
            request['contract_code'] = market['id'];
            method = 'contractPublicGetSwapApiV1SwapHisOpenInterest'; // coin-m swaps
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //  contractPublicGetlinearSwapApiV1SwapHisOpenInterest
        //    {
        //        status: 'ok',
        //        data: {
        //            symbol: 'BTC',
        //            tick: [
        //                {
        //                    volume: '4385.4350000000000000',
        //                    amount_type: '2',
        //                    ts: '1648220400000',
        //                    value: '194059884.1850000000000000'
        //                },
        //                ...
        //            ],
        //            contract_code: 'BTC-USDT',
        //            business_type: 'swap',
        //            pair: 'BTC-USDT',
        //            contract_type: 'swap',
        //            trade_partition: 'USDT'
        //        },
        //        ts: '1648223733007'
        //    }
        //
        //  contractPublicGetSwapApiV1SwapHisOpenInterest
        //    {
        //        "status": "ok",
        //        "data": {
        //            "symbol": "CRV",
        //            "tick": [
        //                {
        //                    "volume": 19174.0000000000000000,
        //                    "amount_type": 1,
        //                    "ts": 1648224000000
        //                },
        //                ...
        //            ],
        //            "contract_code": "CRV-USD"
        //        },
        //        "ts": 1648226554260
        //    }
        //
        //  contractPublicGetApiV1ContractHisOpenInterest
        //    {
        //         "status": "ok",
        //         "data": {
        //             "symbol": "BTC",
        //             "contract_type": "this_week",
        //             "tick": [
        //                {
        //                     "volume": "48419.0000000000000000",
        //                     "amount_type": 1,
        //                     "ts": 1648224000000
        //                },
        //                ...
        //            ]
        //        },
        //        "ts": 1648227062944
        //    }
        //
        const data = this.safeValue (response, 'data');
        const tick = this.safeValue (data, 'tick');
        return this.parseOpenInterests (tick, market, since, limit);
    }

    async fetchOpenInterest (symbol, params = {}) {
        /**
         * @method
         * @name huobi#fetchOpenInterest
         * @description Retrieves the open interest of a currency
         * @see https://huobiapi.github.io/docs/dm/v1/en/#get-contract-open-interest-information
         * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-swap-open-interest-information
         * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-swap-open-interest-information
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/en/latest/manual.html#interest-history-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        if (market['option']) {
            throw new NotSupported (this.id + ' fetchOpenInterest() does not currently support option markets');
        }
        const request = {
            'contract_code': market['id'],
        };
        let method = undefined;
        if (market['future']) {
            request['contract_type'] = this.safeString (market['info'], 'contract_type');
            request['symbol'] = market['baseId'];
            method = 'contractPublicGetApiV1ContractOpenInterest'; // COIN-M futures
        } else if (market['linear']) {
            request['contract_type'] = 'swap';
            method = 'contractPublicGetLinearSwapApiV1SwapOpenInterest'; // USDT-M
        } else {
            method = 'contractPublicGetSwapApiV1SwapOpenInterest'; // COIN-M swaps
        }
        const response = await this[method] (this.extend (request, params));
        //
        // USDT-M contractPublicGetLinearSwapApiV1SwapOpenInterest
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "volume": 7192610.000000000000000000,
        //                 "amount": 7192.610000000000000000,
        //                 "symbol": "BTC",
        //                 "value": 134654290.332000000000000000,
        //                 "contract_code": "BTC-USDT",
        //                 "trade_amount": 70692.804,
        //                 "trade_volume": 70692804,
        //                 "trade_turnover": 1379302592.9518,
        //                 "business_type": "swap",
        //                 "pair": "BTC-USDT",
        //                 "contract_type": "swap",
        //                 "trade_partition": "USDT"
        //             }
        //         ],
        //         "ts": 1664336503144
        //     }
        //
        // COIN-M Swap contractPublicGetSwapApiV1SwapOpenInterest
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "volume": 518018.000000000000000000,
        //                 "amount": 2769.675777407074725180,
        //                 "symbol": "BTC",
        //                 "contract_code": "BTC-USD",
        //                 "trade_amount": 9544.4032080046491323463688602729806842458,
        //                 "trade_volume": 1848448,
        //                 "trade_turnover": 184844800.000000000000000000
        //             }
        //         ],
        //         "ts": 1664337226028
        //     }
        //
        // COIN-M Futures contractPublicGetApiV1ContractOpenInterest
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "volume": 118850.000000000000000000,
        //                 "amount": 635.502025211544374189,
        //                 "symbol": "BTC",
        //                 "contract_type": "this_week",
        //                 "contract_code": "BTC220930",
        //                 "trade_amount": 1470.9400749347598691119206024033947897351,
        //                 "trade_volume": 286286,
        //                 "trade_turnover": 28628600.000000000000000000
        //             }
        //         ],
        //         "ts": 1664337928805
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const openInterest = this.parseOpenInterest (data[0], market);
        const timestamp = this.safeInteger (response, 'ts');
        return this.extend (openInterest, {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    parseOpenInterest (interest, market = undefined) {
        //
        // fetchOpenInterestHistory
        //
        //    {
        //        volume: '4385.4350000000000000',
        //        amount_type: '2',
        //        ts: '1648220400000',
        //        value: '194059884.1850000000000000'
        //    }
        //
        // fetchOpenInterest: USDT-M
        //
        //     {
        //         "volume": 7192610.000000000000000000,
        //         "amount": 7192.610000000000000000,
        //         "symbol": "BTC",
        //         "value": 134654290.332000000000000000,
        //         "contract_code": "BTC-USDT",
        //         "trade_amount": 70692.804,
        //         "trade_volume": 70692804,
        //         "trade_turnover": 1379302592.9518,
        //         "business_type": "swap",
        //         "pair": "BTC-USDT",
        //         "contract_type": "swap",
        //         "trade_partition": "USDT"
        //     }
        //
        // fetchOpenInterest: COIN-M Swap
        //
        //     {
        //         "volume": 518018.000000000000000000,
        //         "amount": 2769.675777407074725180,
        //         "symbol": "BTC",
        //         "contract_code": "BTC-USD",
        //         "trade_amount": 9544.4032080046491323463688602729806842458,
        //         "trade_volume": 1848448,
        //         "trade_turnover": 184844800.000000000000000000
        //     }
        //
        // fetchOpenInterest: COIN-M Futures
        //
        //     {
        //         "volume": 118850.000000000000000000,
        //         "amount": 635.502025211544374189,
        //         "symbol": "BTC",
        //         "contract_type": "this_week",
        //         "contract_code": "BTC220930",
        //         "trade_amount": 1470.9400749347598691119206024033947897351,
        //         "trade_volume": 286286,
        //         "trade_turnover": 28628600.000000000000000000
        //     }
        //
        const timestamp = this.safeInteger (interest, 'ts');
        const amount = this.safeNumber (interest, 'volume');
        const value = this.safeNumber (interest, 'value');
        return {
            'symbol': this.safeString (market, 'symbol'),
            'baseVolume': amount,  // deprecated
            'quoteVolume': value,  // deprecated
            'openInterestAmount': amount,
            'openInterestValue': value,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        };
    }

    async borrowMargin (code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name huobi#borrowMargin
         * @description create a loan to borrow margin
         * @see https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-isolated
         * @see https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-cross
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {string|undefined} symbol unified market symbol, required for isolated margin
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/en/latest/manual.html#margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('borrowMargin', params);
        marginMode = (marginMode === undefined) ? 'cross' : marginMode;
        let method = undefined;
        if (marginMode === 'isolated') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' borrowMargin() requires a symbol argument for isolated margin');
            }
            const market = this.market (symbol);
            request['symbol'] = market['id'];
            method = 'privatePostMarginOrders';
        } else if (marginMode === 'cross') {
            method = 'privatePostCrossMarginOrders';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Cross
        //
        //     {
        //         "status": "ok",
        //         "data": null
        //     }
        //
        // Isolated
        //
        //     {
        //         "data": 1000
        //     }
        //
        const transaction = this.parseMarginLoan (response, currency);
        return this.extend (transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }

    async repayMargin (code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name huobi#repayMargin
         * @description repay borrowed margin and interest
         * @see https://huobiapi.github.io/docs/spot/v1/en/#repay-margin-loan-cross-isolated
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the huobi api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/en/latest/manual.html#margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('repayMargin', params);
        marginMode = (marginMode === undefined) ? 'cross' : marginMode;
        const marginAccounts = this.safeValue (this.options, 'marginAccounts', {});
        const accountType = this.getSupportedMapping (marginMode, marginAccounts);
        const accountId = await this.fetchAccountIdByType (accountType, params);
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'accountId': accountId,
        };
        const response = await this.v2PrivatePostAccountRepayment (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data": [
        //             {
        //                 "repayId":1174424,
        //                 "repayTime":1600747722018
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'Data', []);
        const loan = this.safeValue (data, 0);
        const transaction = this.parseMarginLoan (loan, currency);
        return this.extend (transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }

    parseMarginLoan (info, currency = undefined) {
        //
        // borrowMargin cross
        //
        //     {
        //         "status": "ok",
        //         "data": null
        //     }
        //
        // borrowMargin isolated
        //
        //     {
        //         "data": 1000
        //     }
        //
        // repayMargin
        //
        //     {
        //         "repayId":1174424,
        //         "repayTime":1600747722018
        //     }
        //
        const timestamp = this.safeInteger (info, 'repayTime');
        return {
            'id': this.safeInteger2 (info, 'repayId', 'data'),
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async fetchSettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name huobi#fetchSettlementHistory
         * @description Fetches historical settlement records
         * @param {string} symbol unified symbol of the market to fetch the settlement history for
         * @param {int} since timestamp in ms, value range = current time - 90 days，default = current time - 90 days
         * @param {int} limit page items, default 20, shall not exceed 50
         * @param {object} params exchange specific params
         * @param {int} params.until timestamp in ms, value range = start_time -> current time，default = current time
         * @param {int} params.page_index page index, default page 1 if not filled
         * @param {int} params.code unified currency code, can be used when symbol is undefined
         * @returns A list of settlement history objects
         */
        const code = this.safeString (params, 'code');
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'until', 'till' ]);
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchSettlementHistory', market, params);
        if (type === 'future') {
            if (symbol === undefined && code === undefined) {
                throw new ArgumentsRequired (this.id + ' requires a symbol argument or params["code"] for fetchSettlementHistory future');
            }
        } else if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a symbol argument for fetchSettlementHistory swap');
        }
        const request = {};
        if (market['future']) {
            request['symbol'] = market['baseId'];
        } else {
            request['contract_code'] = market['id'];
        }
        if (since !== undefined) {
            request['start_at'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (until !== undefined) {
            request['end_at'] = until;
        }
        let method = 'contractPublicGetApiV1ContractSettlementRecords';
        if (market['swap']) {
            if (market['linear']) {
                method = 'contractPublicGetLinearSwapApiV1SwapSettlementRecords';
            } else {
                method = 'contractPublicGetSwapApiV1SwapSettlementRecords';
            }
        }
        const response = await this[method] (this.extend (request, query));
        //
        // linear swap, coin-m swap
        //
        //    {
        //        "status": "ok",
        //        "data": {
        //        "total_page": 14,
        //        "current_page": 1,
        //        "total_size": 270,
        //        "settlement_record": [
        //            {
        //                "symbol": "ADA",
        //                "contract_code": "ADA-USDT",
        //                "settlement_time": 1652313600000,
        //                "clawback_ratio": 0E-18,
        //                "settlement_price": 0.512303000000000000,
        //                "settlement_type": "settlement",
        //                "business_type": "swap",
        //                "pair": "ADA-USDT",
        //                "trade_partition": "USDT"
        //            },
        //            ...
        //        ],
        //        "ts": 1652338693256
        //    }
        //
        // coin-m future
        //
        //    {
        //        "status": "ok",
        //        "data": {
        //            "total_page": 5,
        //            "current_page": 1,
        //            "total_size": 90,
        //            "settlement_record": [
        //                {
        //                    "symbol": "FIL",
        //                    "settlement_time": 1652342400000,
        //                    "clawback_ratio": 0E-18,
        //                    "list": [
        //                        {
        //                            "contract_code": "FIL220513",
        //                            "settlement_price": 7.016000000000000000,
        //                            "settlement_type": "settlement"
        //                        },
        //                        ...
        //                    ]
        //                },
        //            ]
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data');
        const settlementRecord = this.safeValue (data, 'settlement_record');
        const settlements = this.parseSettlements (settlementRecord, market);
        return this.sortBy (settlements, 'timestamp');
    }

    parseSettlements (settlements, market) {
        //
        // linear swap, coin-m swap, fetchSettlementHistory
        //
        //    [
        //        {
        //            "symbol": "ADA",
        //            "contract_code": "ADA-USDT",
        //            "settlement_time": 1652313600000,
        //            "clawback_ratio": 0E-18,
        //            "settlement_price": 0.512303000000000000,
        //            "settlement_type": "settlement",
        //            "business_type": "swap",
        //            "pair": "ADA-USDT",
        //            "trade_partition": "USDT"
        //        },
        //        ...
        //    ]
        //
        // coin-m future, fetchSettlementHistory
        //
        //    [
        //        {
        //            "symbol": "FIL",
        //            "settlement_time": 1652342400000,
        //            "clawback_ratio": 0E-18,
        //            "list": [
        //                {
        //                    "contract_code": "FIL220513",
        //                    "settlement_price": 7.016000000000000000,
        //                    "settlement_type": "settlement"
        //                },
        //                ...
        //            ]
        //        },
        //    ]
        //
        const result = [];
        for (let i = 0; i < settlements.length; i++) {
            const settlement = settlements[i];
            const list = this.safeValue (settlement, 'list');
            if (list !== undefined) {
                const timestamp = this.safeInteger (settlement, 'settlement_time');
                const timestampDetails = {
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                };
                for (let j = 0; j < list.length; j++) {
                    const item = list[j];
                    const parsedSettlement = this.parseSettlement (item, market);
                    result.push (this.extend (parsedSettlement, timestampDetails));
                }
            } else {
                result.push (this.parseSettlement (settlements[i], market));
            }
        }
        return result;
    }

    parseSettlement (settlement, market) {
        //
        // linear swap, coin-m swap, fetchSettlementHistory
        //
        //    {
        //        "symbol": "ADA",
        //        "contract_code": "ADA-USDT",
        //        "settlement_time": 1652313600000,
        //        "clawback_ratio": 0E-18,
        //        "settlement_price": 0.512303000000000000,
        //        "settlement_type": "settlement",
        //        "business_type": "swap",
        //        "pair": "ADA-USDT",
        //        "trade_partition": "USDT"
        //    }
        //
        // coin-m future, fetchSettlementHistory
        //
        //    {
        //        "contract_code": "FIL220513",
        //        "settlement_price": 7.016000000000000000,
        //        "settlement_type": "settlement"
        //    }
        //
        const timestamp = this.safeInteger (settlement, 'settlement_time');
        const marketId = this.safeString (settlement, 'contract_code');
        return {
            'info': settlement,
            'symbol': this.safeSymbol (marketId, market),
            'price': this.safeNumber (settlement, 'settlement_price'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }
};
