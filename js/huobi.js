'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, PermissionDenied, ExchangeNotAvailable, OnMaintenance, InvalidOrder, OrderNotFound, InsufficientFunds, BadSymbol, BadRequest, RequestTimeout, NetworkError, InvalidAddress, NotSupported } = require ('./base/errors');
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
            'userAgent': this.userAgents['chrome39'],
            'certified': true,
            'version': 'v1',
            'accounts': undefined,
            'accountsById': undefined,
            'hostname': 'api.huobi.pro', // api.testnet.huobi.pro
            'pro': true,
            'has': {
                // 'margin': true,
                'swap': true,
                'future': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'CORS': undefined,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowRate': true,
                'fetchBorrowRates': true,
                'fetchBorrowRatesPerSymbol': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchIndexOHLCV': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingLimits': true,
                'fetchWithdrawals': true,
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
                    // recommended for AWS
                    // 'contract': 'api.hbdm.vn',
                    // 'spot': 'api-aws.huobi.pro',
                },
                'api': {
                    'contract': 'https://{hostname}',
                    'spot': 'https://{hostname}',
                    'market': 'https://{hostname}',
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                    'v2Public': 'https://{hostname}',
                    'v2Private': 'https://{hostname}',
                },
                'www': 'https://www.huobi.com',
                // 'referral': {
                //     'url': 'https://www.huobi.com/en-us/topic/double-reward/?invite_code=6rmm2223',
                //     'discount': 0.15,
                // },
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
                'market': {
                    'get': {
                        'history/kline': 1, // 获取K线数据
                        'detail/merged': 1, // 获取聚合行情(Ticker)
                        'depth': 1, // 获取 Market Depth 数据
                        'trade': 1, // 获取 Trade Detail 数据
                        'history/trade': 1, // 批量获取最近的交易记录
                        'detail': 1, // 获取 Market Detail 24小时成交量数据
                        'tickers': 1,
                        'etp': 1, // 获取杠杆ETP实时净值
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
                'spot': {
                    'public': {
                        'get': {
                            'v2/market-status': 1,
                            'v1/common/symbols': 1,
                            'v1/common/currencys': 1,
                            'v2/reference/currencies': 1,
                            'v1/common/timestamp': 1,
                            'v1/common/exchange': 1, // order limits
                            // Market Data
                            'market/history/kline': 1,
                            'market/detail/merged': 1,
                            'market/tickers': 1,
                            'market/depth': 1,
                            'market/trade': 1,
                            'market/history/trade': 1,
                            'market/detail/': 1,
                            'market/etp': 1,
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
                            'index/market/history/swap_premium_index_kline': 1,
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
                    'bad-request': BadRequest,
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
                    // err-msg
                    'invalid symbol': BadSymbol, // {"ts":1568813334794,"status":"error","err-code":"invalid-parameter","err-msg":"invalid symbol"}
                    'symbol trade not open now': BadSymbol, // {"ts":1576210479343,"status":"error","err-code":"invalid-parameter","err-msg":"symbol trade not open now"}
                    'require-symbol': BadSymbol, // {"status":"error","err-code":"require-symbol","err-msg":"Parameter `symbol` is required.","data":null}
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'spot', // spot, future, swap
                'defaultSubType': 'inverse', // inverse, linear
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
                    'future': 'futures',
                },
                'typesByAccount': {
                    'pro': 'spot',
                    'futures': 'future',
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

    async fetchTime (params = {}) {
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
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        if ((type !== 'spot') && (type !== 'future') && (type !== 'swap')) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to 'spot', 'future', 'swap'"); // eslint-disable-line quotes
        }
        let method = 'spotPublicGetV1CommonSymbols';
        const query = this.omit (params, [ 'type', 'subType' ]);
        const spot = (type === 'spot');
        const contract = (type !== 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        let linear = undefined;
        let inverse = undefined;
        if (contract) {
            const defaultSubType = this.safeString (this.options, 'defaultSubType', 'inverse');
            let subType = this.safeString (options, 'subType', defaultSubType);
            subType = this.safeString (params, 'subType', subType);
            if ((subType !== 'inverse') && (subType !== 'linear')) {
                throw new ExchangeError (this.id + " does not support '" + subType + "' type, set exchange.options['defaultSubType'] to 'inverse' or 'linear'"); // eslint-disable-line quotes
            }
            linear = (subType === 'linear');
            inverse = (subType === 'inverse') || future;
            if (future) {
                method = 'contractPublicGetApiV1ContractContractInfo';
            } else if (swap) {
                if (inverse) {
                    method = 'contractPublicGetSwapApiV1SwapContractInfo';
                } else if (linear) {
                    method = 'contractPublicGetLinearSwapApiV1SwapContractInfo';
                }
            }
        }
        const response = await this[method] (query);
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
        // future
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
        const markets = this.safeValue (response, 'data');
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
            if (contract) {
                id = this.safeString (market, 'contract_code');
                if (swap) {
                    const parts = id.split ('-');
                    baseId = this.safeString (market, 'symbol');
                    quoteId = this.safeString (parts, 1);
                    settleId = inverse ? baseId : quoteId;
                } else if (future) {
                    baseId = this.safeString (market, 'symbol');
                    quoteId = 'USD';
                    settleId = baseId;
                }
            } else {
                baseId = this.safeString (market, 'base-currency');
                quoteId = this.safeString (market, 'quote-currency');
                id = baseId + quoteId;
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
            let pricePrecision = undefined;
            let amountPrecision = undefined;
            let costPrecision = undefined;
            if (spot) {
                pricePrecision = this.safeString (market, 'price-precision');
                pricePrecision = this.parseNumber ('1e-' + pricePrecision);
                amountPrecision = this.safeString (market, 'amount-precision');
                amountPrecision = this.parseNumber ('1e-' + amountPrecision);
                costPrecision = this.safeString (market, 'value-precision');
                costPrecision = this.parseNumber ('1e-' + costPrecision);
            } else {
                pricePrecision = this.safeNumber (market, 'price_tick');
                amountPrecision = 1;
            }
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
                'cost': costPrecision,
            };
            let maker = undefined;
            let taker = undefined;
            if (spot) {
                maker = (base === 'OMG') ? 0 : 0.2 / 100;
                taker = (base === 'OMG') ? 0 : 0.2 / 100;
            }
            const minAmount = this.safeNumber (market, 'min-order-amt', Math.pow (10, -precision['amount']));
            const maxAmount = this.safeNumber (market, 'max-order-amt');
            const minCost = this.safeNumber (market, 'min-order-value', 0);
            let active = undefined;
            if (spot) {
                const state = this.safeString (market, 'state');
                active = (state === 'online');
            } else if (contract) {
                const contractStatus = this.safeInteger (market, 'contract_status');
                active = (contractStatus === 1);
            }
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
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'contract': contract,
                'spot': spot,
                'future': future,
                'swap': swap,
                'linear': linear,
                'inverse': inverse,
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'contractSize': contractSize,
                'active': active,
                'precision': precision,
                'taker': taker,
                'maker': maker,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': maxAmount,
                    },
                    'price': {
                        'min': pricePrecision,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                    'leverage': {
                        'max': this.safeNumber (market, 'leverage-ratio', 1),
                        'superMax': this.safeNumber (market, 'super-margin-leverage-ratio', 1),
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
                bid = this.safeNumber (ticker['bid'], 0);
                bidVolume = this.safeNumber (ticker['bid'], 1);
            } else {
                bid = this.safeNumber (ticker, 'bid');
                bidVolume = this.safeValue (ticker, 'bidSize');
            }
        }
        if ('ask' in ticker) {
            if (Array.isArray (ticker['ask'])) {
                ask = this.safeNumber (ticker['ask'], 0);
                askVolume = this.safeNumber (ticker['ask'], 1);
            } else {
                ask = this.safeNumber (ticker, 'ask');
                askVolume = this.safeValue (ticker, 'askSize');
            }
        }
        const open = this.safeNumber (ticker, 'open');
        const close = this.safeNumber (ticker, 'close');
        const baseVolume = this.safeNumber (ticker, 'amount');
        const quoteVolume = this.safeNumber (ticker, 'vol');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': vwap,
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let fieldName = 'symbol';
        let method = 'spotPublicGetMarketDetailMerged';
        if (market['future']) {
            method = 'contractPublicGetMarketDetailMerged';
        } else if (market['swap']) {
            if (market['inverse']) {
                method = 'contractPublicGetSwapExMarketDetailMerged';
            } else if (market['linear']) {
                method = 'contractPublicGetLinearSwapExMarketDetailMerged';
            }
            fieldName = 'contract_code';
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
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchTickers', {});
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        let method = 'spotPublicGetMarketTickers';
        if (type === 'future') {
            method = 'contractPublicGetMarketDetailBatchMerged';
        } else if (type === 'swap') {
            const defaultSubType = this.safeString (this.options, 'defaultSubType', 'inverse');
            let subType = this.safeString (options, 'subType', defaultSubType);
            subType = this.safeString (params, 'subType', subType);
            if (subType === 'inverse') {
                method = 'contractPublicGetSwapExMarketDetailBatchMerged';
            } else if (subType === 'linear') {
                method = 'contractPublicGetLinearSwapExMarketDetailBatchMerged';
            }
        }
        const query = this.omit (params, [ 'type', 'subType' ]);
        const response = await this[method] (query);
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
        // future
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
        const tickers = this.safeValue2 (response, 'data', 'ticks', []);
        const timestamp = this.safeInteger (response, 'ts');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
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
        if (market['future']) {
            method = 'contractPublicGetMarketDepth';
        } else if (market['swap']) {
            if (market['inverse']) {
                method = 'contractPublicGetSwapExMarketDepth';
            } else if (market['linear']) {
                method = 'contractPublicGetLinearSwapExMarketDepth';
            }
            fieldName = 'contract_code';
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
        // fetchTrades (public)
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
        // fetchMyTrades (private)
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
        //     },
        //
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger2 (trade, 'ts', 'created-at');
        const order = this.safeString (trade, 'order-id');
        let side = this.safeString (trade, 'direction');
        let type = this.safeString (trade, 'type');
        if (type !== undefined) {
            const typeParts = type.split ('-');
            side = typeParts[0];
            type = typeParts[1];
        }
        const takerOrMaker = this.safeString (trade, 'role');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString2 (trade, 'filled-amount', 'amount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        let fee = undefined;
        let feeCost = this.safeNumber (trade, 'filled-fees');
        let feeCurrency = this.safeCurrencyCode (this.safeString (trade, 'fee-currency'));
        const filledPoints = this.safeNumber (trade, 'filled-points');
        if (filledPoints !== undefined) {
            if ((feeCost === undefined) || (feeCost === 0.0)) {
                feeCost = filledPoints;
                feeCurrency = this.safeCurrencyCode (this.safeString (trade, 'fee-deduct-currency'));
            }
        }
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const tradeId = this.safeString2 (trade, 'trade-id', 'tradeId');
        const id = this.safeString (trade, 'id', tradeId);
        return {
            'id': id,
            'info': trade,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order-id': id,
        };
        const response = await this.spotPrivateGetV1OrderOrdersOrderIdMatchresults (this.extend (request, params));
        return this.parseTrades (response['data'], undefined, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['size'] = limit; // 1-100 orders, default is 100
        }
        if (since !== undefined) {
            request['start-time'] = since; // a date within 120 days from today
            // request['end-time'] = this.sum (since, 172800000); // 48 hours window
        }
        const response = await this.spotPrivateGetV1OrderMatchresults (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'symbol': market['id'], // spot, future
            // 'contract_code': market['id'], // swap
        };
        let fieldName = 'symbol';
        let method = 'spotPublicGetMarketHistoryTrade';
        if (market['future']) {
            method = 'contractPublicGetMarketHistoryTrade';
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
        const data = this.safeValue (response, 'data');
        let result = [];
        for (let i = 0; i < data.length; i++) {
            const trades = this.safeValue (data[i], 'data', []);
            for (let j = 0; j < trades.length; j++) {
                const trade = this.parseTrade (trades[j], market);
                result.push (trade);
            }
        }
        result = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'period': this.timeframes[timeframe],
            // 'symbol': market['id'], // spot, future
            // 'contract_code': market['id'], // swap
            // 'side': limit, // max 2000
        };
        let fieldName = 'symbol';
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        let method = 'spotPublicGetMarketHistoryKline';
        if (market['future']) {
            if (price === 'mark') {
                method = 'contractPublicGetIndexMarketHistoryMarkPriceKline';
            } else if (price === 'index') {
                method = 'contractPublicGetIndexMarketHistoryIndex';
            } else if (price === 'premiumIndex') {
                throw new BadRequest (this.id + ' ' + market['type'] + ' has no api endpoint for ' + price + ' kline data');
            } else {
                method = 'contractPublicGetMarketHistoryKline';
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
        request[fieldName] = market['id'];
        if (limit !== undefined) {
            request['size'] = limit; // max 2000
        }
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

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'index',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'mark',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchPremiumIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'premiumIndex',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchAccounts (params = {}) {
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
        return response['data'];
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
        const response = await this.spotPublicGetV2ReferenceCurrencies ();
        //     {
        //       "code": 200,
        //       "data": [
        //         {
        //           "currency": "sxp",
        //           "assetType": "1",
        //           "chains": [
        //             {
        //               "chain": "sxp",
        //               "displayName": "ERC20",
        //               "baseChain": "ETH",
        //               "baseChainProtocol": "ERC20",
        //               "isDynamic": true,
        //               "numOfConfirmations": "12",
        //               "numOfFastConfirmations": "12",
        //               "depositStatus": "allowed",
        //               "minDepositAmt": "0.23",
        //               "withdrawStatus": "allowed",
        //               "minWithdrawAmt": "0.23",
        //               "withdrawPrecision": "8",
        //               "maxWithdrawAmt": "227000.000000000000000000",
        //               "withdrawQuotaPerDay": "227000.000000000000000000",
        //               "withdrawQuotaPerYear": null,
        //               "withdrawQuotaTotal": null,
        //               "withdrawFeeType": "fixed",
        //               "transactFeeWithdraw": "11.1653",
        //               "addrWithTag": false,
        //               "addrDepositTag": false
        //             }
        //           ],
        //           "instStatus": "normal"
        //         }
        //       ]
        //     }
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
                const withdraw = this.safeString (chain, 'withdrawStatus');
                const deposit = this.safeString (chain, 'depositStatus');
                const active = (withdraw === 'allowed') && (deposit === 'allowed');
                let precision = this.safeString (chain, 'withdrawPrecision');
                if (precision !== undefined) {
                    precision = this.parseNumber ('1e-' + precision);
                    minPrecision = (minPrecision === undefined) ? precision : Math.max (precision, minPrecision);
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
                    'fee': fee,
                    'precision': precision,
                };
            }
            const networksKeys = Object.keys (networks);
            const networkLength = networksKeys.length;
            result[code] = {
                'info': entry,
                'code': code,
                'id': currencyId,
                'active': currencyActive,
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
                'precision': minPrecision,
                'networks': networks,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchTickers', {});
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        params = this.omit (params, 'type');
        const request = {};
        let method = undefined;
        const spot = (type === 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        if (spot) {
            await this.loadAccounts ();
            const accountId = await this.fetchAccountIdByType (type, params);
            request['account-id'] = accountId;
            method = 'spotPrivateGetV1AccountAccountsAccountIdBalance';
        } else if (future) {
            method = 'contractPrivatePostApiV1ContractAccountInfo';
        } else if (swap) {
            const defaultSubType = this.safeString (this.options, 'defaultSubType', 'inverse');
            let subType = this.safeString (options, 'subType', defaultSubType);
            subType = this.safeString (params, 'subType', subType);
            if (subType === 'inverse') {
                method = 'contractPrivatePostSwapApiV1SwapAccountInfo';
            } else if (subType === 'linear') {
                method = 'contractPrivatePostLinearSwapApiV1SwapAccountInfo';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "data":{
        //             "id":1528640,
        //             "type":"spot",
        //             "state":"working",
        //             "list":[
        //                 {"currency":"lun","type":"trade","balance":"0","seq-num":"0"},
        //                 {"currency":"lun","type":"frozen","balance":"0","seq-num":"0"},
        //                 {"currency":"ht","type":"frozen","balance":"0","seq-num":"145"},
        //             ]
        //         },
        //         "ts":1637644827566
        //     }
        //
        // future, swap
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {
        //                 "symbol":"BTC",
        //                 "margin_balance":0,
        //                 "margin_position":0E-18,
        //                 "margin_frozen":0,
        //                 "margin_available":0E-18,
        //                 "profit_real":0,
        //                 "profit_unreal":0,
        //                 "risk_rate":null,
        //                 "withdraw_available":0,
        //                 "liquidation_price":null,
        //                 "lever_rate":5,
        //                 "adjust_factor":0.025000000000000000,
        //                 "margin_static":0,
        //                 "is_debit":0, // future only
        //                 "contract_code":"BTC-USD", // swap only
        //                 "margin_asset":"USDT", // linear only
        //                 "margin_mode":"isolated", // linear only
        //                 "margin_account":"BTC-USDT" // linear only
        //                 "transfer_profit_ratio":null // inverse only
        //             },
        //         ],
        //         "ts":1637644827566
        //     }
        //
        const result = { 'info': response };
        const data = this.safeValue (response, 'data');
        if (spot) {
            const balances = this.safeValue (data, 'list', []);
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'currency');
                const code = this.safeCurrencyCode (currencyId);
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
                result[code] = account;
            }
        } else if (future) {
            for (let i = 0; i < data.length; i++) {
                const balance = data[i];
                const currencyId = this.safeString (balance, 'symbol');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'margin_available');
                account['used'] = this.safeString (balance, 'margin_frozen');
                result[code] = account;
            }
        } else if (swap) {
            for (let i = 0; i < data.length; i++) {
                const balance = data[i];
                const marketId = this.safeString2 (balance, 'contract_code', 'margin_account');
                const symbol = this.safeSymbol (marketId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'margin_available');
                account['used'] = this.safeString (balance, 'margin_frozen');
                const currencyId = this.safeString2 (balance, 'margin_asset', 'symbol');
                const code = this.safeCurrencyCode (currencyId);
                const accountsByCode = {};
                accountsByCode[code] = account;
                result[symbol] = this.parseBalance (accountsByCode);
            }
            return result;
        }
        return this.parseBalance (result);
    }

    async fetchOrdersByStates (states, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'states': states,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const method = this.safeString (this.options, 'fetchOrdersByStatesMethod', 'spot_private_get_v1_order_orders');
        const response = await this[method] (this.extend (request, params));
        //
        //     { status:   "ok",
        //         data: [ {                  id:  13997833014,
        //                                symbol: "ethbtc",
        //                          'account-id':  3398321,
        //                                amount: "0.045000000000000000",
        //                                 price: "0.034014000000000000",
        //                          'created-at':  1545836976871,
        //                                  type: "sell-limit",
        //                        'field-amount': "0.045000000000000000",
        //                   'field-cash-amount': "0.001530630000000000",
        //                          'field-fees': "0.000003061260000000",
        //                         'finished-at':  1545837948214,
        //                                source: "spot-api",
        //                                 state: "filled",
        //                         'canceled-at':  0                      }  ] }
        //
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        let method = 'spotPrivateGetV1OrderOrdersOrderId';
        if (clientOrderId !== undefined) {
            method = 'spotPrivateGetV1OrderOrdersGetClientOrder';
            // will be filled below in extend ()
            // request['clientOrderId'] = clientOrderId;
        } else {
            request['order-id'] = id;
        }
        const response = await this[method] (this.extend (request, params));
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStates ('pre-submitted,submitted,partial-filled,filled,partial-canceled,canceled', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStates ('filled,partial-canceled,canceled', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
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
        const omitted = this.omit (params, 'account-id');
        const response = await this.spotPrivateGetV1OrderOpenOrders (this.extend (request, omitted));
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
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'partial-filled': 'open',
            'partial-canceled': 'canceled',
            'filled': 'closed',
            'canceled': 'canceled',
            'submitted': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {                  id:  13997833014,
        //                    symbol: "ethbtc",
        //              'account-id':  3398321,
        //                    amount: "0.045000000000000000",
        //                     price: "0.034014000000000000",
        //              'created-at':  1545836976871,
        //                      type: "sell-limit",
        //            'field-amount': "0.045000000000000000", // they have fixed it for filled-amount
        //       'field-cash-amount': "0.001530630000000000", // they have fixed it for filled-cash-amount
        //              'field-fees': "0.000003061260000000", // they have fixed it for filled-fees
        //             'finished-at':  1545837948214,
        //                    source: "spot-api",
        //                     state: "filled",
        //             'canceled-at':  0                      }
        //
        //     {                  id:  20395337822,
        //                    symbol: "ethbtc",
        //              'account-id':  5685075,
        //                    amount: "0.001000000000000000",
        //                     price: "0.0",
        //              'created-at':  1545831584023,
        //                      type: "buy-market",
        //            'field-amount': "0.029100000000000000", // they have fixed it for filled-amount
        //       'field-cash-amount': "0.000999788700000000", // they have fixed it for filled-cash-amount
        //              'field-fees': "0.000058200000000000", // they have fixed it for filled-fees
        //             'finished-at':  1545831584181,
        //                    source: "spot-api",
        //                     state: "filled",
        //             'canceled-at':  0                      }
        //
        const id = this.safeString (order, 'id');
        let side = undefined;
        let type = undefined;
        let status = undefined;
        if ('type' in order) {
            const orderType = order['type'].split ('-');
            side = orderType[0];
            type = orderType[1];
            status = this.parseOrderStatus (this.safeString (order, 'state'));
        }
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (order, 'created-at');
        const clientOrderId = this.safeString (order, 'client-order-id');
        const amount = this.safeString (order, 'amount');
        const filled = this.safeString2 (order, 'filled-amount', 'field-amount'); // typo in their API, filled amount
        const price = this.safeString (order, 'price');
        const cost = this.safeString2 (order, 'filled-cash-amount', 'field-cash-amount'); // same typo
        const feeCost = this.safeNumber2 (order, 'filled-fees', 'field-fees'); // typo in their API, filled fees
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            if (market !== undefined) {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
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

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const accountId = await this.fetchAccountIdByType (market['type']);
        const request = {
            // spot -----------------------------------------------------------
            'account-id': accountId,
            'symbol': market['id'],
            'type': side + '-' + type, // buy-market, sell-market, buy-limit, sell-limit, buy-ioc, sell-ioc, buy-limit-maker, sell-limit-maker, buy-stop-limit, sell-stop-limit, buy-limit-fok, sell-limit-fok, buy-stop-limit-fok, sell-stop-limit-fok
            // 'amount': this.amountToPrecision (symbol, amount), // for buy market orders it's the order cost
            // 'price': this.priceToPrecision (symbol, price),
            // 'source': 'spot-api', // optional, spot-api, margin-api = isolated margin, super-margin-api = cross margin, c2c-margin-api
            // 'client-order-id': clientOrderId, // optional, max 64 chars, must be unique within 8 hours
            // 'stop-price': this.priceToPrecision (symbol, stopPrice), // trigger price for stop limit orders
            // 'operator': 'gte', // gte, lte, trigger price condition
            // futures --------------------------------------------------------
            // 'symbol': 'BTC', // optional, case-insenstive, both uppercase and lowercase are supported, "BTC", "ETH", ...
            // 'contract_type': 'this_week', // optional, this_week, next_week, quarter, next_quarter
            // 'contract_code': market['id'], // optional BTC180914
            // 'client_order_id': clientOrderId, // optional, must be less than 9223372036854775807
            // 'price': this.priceToPrecision (symbol, price),
            // 'volume': this.amountToPrecision (symbol, amount),
            //
            //     direction buy, offset open = open long
            //     direction sell, offset close = close long
            //     direction sell, offset open = open short
            //     direction buy, offset close = close short
            //
            // 'direction': side, // true Transaction direction
            // 'offset': 'string', // open, close
            // 'lever_rate': 1, // using Leverage greater than 20x requires prior approval of high-leverage agreement
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
            // 'order_price_type': 'limit', // required
            // 'tp_trigger_price': this.priceToPrecision (symbol, triggerPrice),
            // 'tp_order_price': this.priceToPrecision (symbol, price),
            // 'tp_order_price_type': 'limit', // limit，optimal_5，optimal_10，optimal_20
            // 'sl_trigger_price': this.priceToPrecision (symbol, stopLossPrice),
            // 'sl_order_price': this.priceToPrecision (symbol, price),
            // 'sl_order_price_type': 'limit', // limit，optimal_5，optimal_10，optimal_20
            // swap -----------------------------------------------------------
            //
            //     ...
            //
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client-order-id'); // must be 64 chars max and unique within 24 hours
        if (clientOrderId === undefined) {
            const broker = this.safeValue (this.options, 'broker', {});
            const brokerId = this.safeString (broker, 'id');
            request['client-order-id'] = brokerId + this.uuid ();
        } else {
            request['client-order-id'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'client-order-id' ]);
        if ((type === 'market') && (side === 'buy')) {
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
                    request['amount'] = this.costToPrecision (symbol, parseFloat (amount) * parseFloat (price));
                }
            } else {
                request['amount'] = this.costToPrecision (symbol, amount);
            }
        } else {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (type === 'limit' || type === 'ioc' || type === 'limit-maker' || type === 'stop-limit' || type === 'stop-limit-fok') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.spotPrivatePostV1OrderOrdersPlace (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const id = this.safeString (response, 'data');
        return {
            'info': response,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'clientOrderId': undefined,
            'average': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const clientOrderId = this.safeString2 (params, 'client-order-id', 'clientOrderId');
        const request = {};
        let method = 'spotPrivatePostV1OrderOrdersOrderIdSubmitcancel';
        if (clientOrderId === undefined) {
            request['order-id'] = id;
        } else {
            request['client-order-id'] = clientOrderId;
            method = 'spotPrivatePostV1OrderOrdersSubmitCancelClientOrder';
            params = this.omit (params, [ 'client-order-id', 'clientOrderId' ]);
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         'status': 'ok',
        //         'data': '10138899000',
        //     }
        //
        return this.extend (this.parseOrder (response), {
            'id': id,
            'status': 'canceled',
        });
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const clientOrderIds = this.safeValue2 (params, 'clientOrderIds', 'client-order-ids');
        params = this.omit (params, [ 'clientOrderIds', 'client-order-ids' ]);
        const request = {};
        if (clientOrderIds === undefined) {
            request['order-ids'] = ids;
        } else {
            request['client-order-ids'] = clientOrderIds;
        }
        const response = await this.spotPrivatePostV1OrderOrdersBatchcancel (this.extend (request, params));
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
        return response;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'account-id' string false NA The account id used for this cancel Refer to GET /v1/account/accounts
            // 'symbol': market['id'], // a list of comma-separated symbols, all symbols by default
            // 'types' 'string', buy-market, sell-market, buy-limit, sell-limit, buy-ioc, sell-ioc, buy-stop-limit, sell-stop-limit, buy-limit-fok, sell-limit-fok, buy-stop-limit-fok, sell-stop-limit-fok
            // 'side': 'buy', // or 'sell'
            // 'size': 100, // the number of orders to cancel 1-100
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.spotPrivatePostV1OrderOrdersBatchCancelOpenOrders (this.extend (request, params));
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

    currencyToPrecision (currency, fee) {
        return this.decimalToPrecision (fee, 0, this.currencies[currency]['precision']);
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
        let tag = this.safeString (depositAddress, 'addressTag');
        if (tag === '') {
            tag = undefined;
        }
        const currencyId = this.safeString (depositAddress, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const code = this.safeCurrencyCode (currencyId, currency);
        const networkId = this.safeString (depositAddress, 'chain');
        const networks = this.safeValue (currency, 'networks', {});
        const networksById = this.indexBy (networks, 'id');
        const networkValue = this.safeValue (networksById, networkId, networkId);
        const network = this.safeString (networkValue, 'network');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': network,
            'info': depositAddress,
        };
    }

    async fetchDepositAddressesByNetwork (code, params = {}) {
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

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
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
        const timestamp = this.safeInteger (transaction, 'created-at');
        const updated = this.safeInteger (transaction, 'updated-at');
        const code = this.safeCurrencyCode (this.safeString (transaction, 'currency'));
        let type = this.safeString (transaction, 'type');
        if (type === 'withdraw') {
            type = 'withdrawal';
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const tag = this.safeString (transaction, 'address-tag');
        let feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'tx-hash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'address'),
            'tag': tag,
            'type': type,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': {
                'currency': code,
                'cost': feeCost,
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
        const id = this.safeString (response, 'data');
        return {
            'info': response,
            'id': id,
        };
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
        await this.loadMarkets ();
        const currency = this.currency (code);
        let type = this.safeString (params, 'type');
        if (type === undefined) {
            const accountsByType = this.safeValue (this.options, 'accountsByType', {});
            fromAccount = fromAccount.toLowerCase (); // pro, futures
            toAccount = toAccount.toLowerCase (); // pro, futures
            const fromId = this.safeString (accountsByType, fromAccount);
            const toId = this.safeString (accountsByType, toAccount);
            if (fromId === undefined) {
                const keys = Object.keys (accountsByType);
                throw new ExchangeError (this.id + ' fromAccount must be one of ' + keys.join (', '));
            }
            if (toId === undefined) {
                const keys = Object.keys (accountsByType);
                throw new ExchangeError (this.id + ' toAccount must be one of ' + keys.join (', '));
            }
            type = fromAccount + '-to-' + toAccount;
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
        const data = this.safeValue (response, 'data');
        const rates = {
            'info': response,
        };
        for (let i = 0; i < data.length; i++) {
            const rate = data[i];
            const currencies = this.safeValue (rate, 'currencies');
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
        const data = this.safeValue (response, 'data');
        const rates = {};
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const currencies = this.safeValue (market, 'currencies');
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        const query = this.omit (params, this.extractParams (path));
        if (typeof api === 'string') {
            // signing implementation for the old endpoints
            if (api === 'market') {
                url += api;
            } else if ((api === 'public') || (api === 'private')) {
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
            url += this.implodeParams (path, params);
            const hostname = this.safeString (this.urls['hostnames'], type);
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

    calculateRateLimiterCost (api, method, path, params, config = {}, context = {}) {
        return this.safeInteger (config, 'cost', 1);
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
                const code = this.safeString (response, 'err-code');
                const feedback = this.id + ' ' + body;
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                const message = this.safeString (response, 'err-msg');
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //
        // Gets a history of funding rates with their timestamps
        //  (param) symbol: Future currency pair
        //  (param) limit: not used by huobi
        //  (param) since: not used by huobi
        //  (param) params: Object containing more params for the request
        //  return: [{symbol, fundingRate, timestamp, dateTime}]
        //
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
        const result = this.safeValue (data, 'data');
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'contract_code');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeString (entry, 'funding_time');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    parseFundingRate (fundingRate, market = undefined) {
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
        const nextFundingRate = this.safeNumber (fundingRate, 'estimated_rate');
        const previousFundingTimestamp = this.safeInteger (fundingRate, 'funding_time');
        const nextFundingTimestamp = this.safeInteger (fundingRate, 'next_funding_time');
        const marketId = this.safeString (fundingRate, 'contract_code');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': fundingRate,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'previousFundingRate': this.safeNumber (fundingRate, 'funding_rate'),
            'nextFundingRate': nextFundingRate,
            'previousFundingTimestamp': previousFundingTimestamp,
            'nextFundingTimestamp': nextFundingTimestamp,
            'previousFundingDatetime': this.iso8601 (previousFundingTimestamp),
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
        };
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        if (market['inverse']) {
            method = 'contractPublicGetSwapApiV1SwapFundingRate';
        } else if (market['linear']) {
            method = 'contractPublicGetLinearSwapApiV1SwapFundingRate';
        } else {
            throw new NotSupported (this.id + ' fetchFundingRateHistory() supports inverse and linear swaps only');
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
};
