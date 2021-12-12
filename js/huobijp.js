'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, ExchangeNotAvailable, OnMaintenance, InvalidOrder, OrderNotFound, InsufficientFunds, ArgumentsRequired, BadSymbol, BadRequest, RequestTimeout, NetworkError } = require ('./base/errors');
const { TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class huobijp extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'huobijp',
            'name': 'Huobi Japan',
            'countries': [ 'JP' ],
            'rateLimit': 100,
            'userAgent': this.userAgents['chrome39'],
            'certified': false,
            'version': 'v1',
            'accounts': undefined,
            'accountsById': undefined,
            'hostname': 'api-cloud.huobi.co.jp',
            'pro': true,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'CORS': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingLimits': true,
                'fetchWithdrawals': true,
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
                'logo': 'https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg',
                'api': {
                    'market': 'https://{hostname}',
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                    'v2Public': 'https://{hostname}',
                    'v2Private': 'https://{hostname}',
                },
                'www': 'https://www.huobi.co.jp',
                'referral': 'https://www.huobi.co.jp/register/?invite_code=znnq3',
                'doc': 'https://api-doc.huobi.co.jp',
                'fees': 'https://www.huobi.co.jp/support/fee',
            },
            'api': {
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
                },
            },
            'options': {
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
                'fetchOrdersByStatesMethod': 'private_get_order_orders', // 'private_get_order_history' // https://github.com/ccxt/ccxt/pull/5392
                'fetchOpenOrdersMethod': 'fetch_open_orders_v1', // 'fetch_open_orders_v2' // https://github.com/ccxt/ccxt/issues/5388
                'createMarketBuyOrderRequiresPrice': true,
                'fetchMarketsMethod': 'publicGetCommonSymbols',
                'fetchBalanceMethod': 'privateGetAccountAccountsIdBalance',
                'createOrderMethod': 'privatePostOrderOrdersPlace',
                'language': 'en-US',
                'broker': {
                    'id': 'AA03022abc',
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
        const response = await this.publicGetCommonTimestamp (params);
        return this.safeInteger (response, 'data');
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
        const response = await this.publicGetCommonExchange (this.extend (request, params));
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
        const method = this.options['fetchMarketsMethod'];
        const response = await this[method] (params);
        const markets = this.safeValue (response, 'data');
        const numMarkets = markets.length;
        if (numMarkets < 1) {
            throw new NetworkError (this.id + ' publicGetCommonSymbols returned empty response: ' + this.json (markets));
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'base-currency');
            const quoteId = this.safeString (market, 'quote-currency');
            const id = baseId + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount-precision'),
                'price': this.safeInteger (market, 'price-precision'),
                'cost': this.safeInteger (market, 'value-precision'),
            };
            const maker = (base === 'OMG') ? 0 : 0.2 / 100;
            const taker = (base === 'OMG') ? 0 : 0.2 / 100;
            const minAmount = this.safeNumber (market, 'min-order-amt', Math.pow (10, -precision['amount']));
            const maxAmount = this.safeNumber (market, 'max-order-amt');
            const minCost = this.safeNumber (market, 'min-order-value', 0);
            const state = this.safeString (market, 'state');
            const active = (state === 'online');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
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
                        'min': Math.pow (10, -precision['price']),
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
        const symbol = this.safeSymbol (undefined, market);
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'type': 'step0',
        };
        const response = await this.marketGetDepth (this.extend (request, params));
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
        //             "ts":1583474832008,
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

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.marketGetDetailMerged (this.extend (request, params));
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
        const ticker = this.parseTicker (response['tick'], market);
        const timestamp = this.safeInteger (response, 'ts');
        ticker['timestamp'] = timestamp;
        ticker['datetime'] = this.iso8601 (timestamp);
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.marketGetTickers (params);
        const tickers = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (response, 'ts');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const marketId = this.safeString (tickers[i], 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const ticker = this.parseTicker (tickers[i], market);
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
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
            'id': id,
        };
        const response = await this.privateGetOrderOrdersIdMatchresults (this.extend (request, params));
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
        const response = await this.privateGetOrderMatchresults (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.marketGetHistoryTrade (this.extend (request, params));
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
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.marketGetHistoryKline (this.extend (request, params));
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
        await this.loadMarkets ();
        const response = await this.privateGetAccountAccounts (params);
        return response['data'];
    }

    async fetchCurrencies (params = {}) {
        const request = {
            'language': this.options['language'],
        };
        const response = await this.publicGetSettingsCurrencys (this.extend (request, params));
        //
        //     {
        //         "status":"ok",
        //         "data":[
        //             {
        //                 "currency-addr-with-tag":false,
        //                 "fast-confirms":12,
        //                 "safe-confirms":12,
        //                 "currency-type":"eth",
        //                 "quote-currency":true,
        //                 "withdraw-enable-timestamp":1609430400000,
        //                 "deposit-enable-timestamp":1609430400000,
        //                 "currency-partition":"all",
        //                 "support-sites":["OTC","INSTITUTION","MINEPOOL"],
        //                 "withdraw-precision":6,
        //                 "visible-assets-timestamp":1508839200000,
        //                 "deposit-min-amount":"1",
        //                 "withdraw-min-amount":"10",
        //                 "show-precision":"8",
        //                 "tags":"",
        //                 "weight":23,
        //                 "full-name":"Tether USDT",
        //                 "otc-enable":1,
        //                 "visible":true,
        //                 "white-enabled":false,
        //                 "country-disabled":false,
        //                 "deposit-enabled":true,
        //                 "withdraw-enabled":true,
        //                 "name":"usdt",
        //                 "state":"online",
        //                 "display-name":"USDT",
        //                 "suspend-withdraw-desc":null,
        //                 "withdraw-desc":"Minimum withdrawal amount: 10 USDT (ERC20). !>_<!To ensure the safety of your funds, your withdrawal request will be manually reviewed if your security strategy or password is changed. Please wait for phone calls or emails from our staff.!>_<!Please make sure that your computer and browser are secure and your information is protected from being tampered or leaked.",
        //                 "suspend-deposit-desc":null,
        //                 "deposit-desc":"Please don’t deposit any other digital assets except USDT to the above address. Otherwise, you may lose your assets permanently. !>_<!Depositing to the above address requires confirmations of the entire network. It will arrive after 12 confirmations, and it will be available to withdraw after 12 confirmations. !>_<!Minimum deposit amount: 1 USDT. Any deposits less than the minimum will not be credited or refunded.!>_<!Your deposit address won’t change often. If there are any changes, we will notify you via announcement or email.!>_<!Please make sure that your computer and browser are secure and your information is protected from being tampered or leaked.",
        //                 "suspend-visible-desc":null
        //             }
        //         ]
        //     }
        //
        const currencies = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeValue (currency, 'name');
            const precision = this.safeInteger (currency, 'withdraw-precision');
            const code = this.safeCurrencyCode (id);
            const depositEnabled = this.safeValue (currency, 'deposit-enabled');
            const withdrawEnabled = this.safeValue (currency, 'withdraw-enabled');
            const countryDisabled = this.safeValue (currency, 'country-disabled');
            const visible = this.safeValue (currency, 'visible', false);
            const state = this.safeString (currency, 'state');
            const active = visible && depositEnabled && withdrawEnabled && (state === 'online') && !countryDisabled;
            const name = this.safeString (currency, 'display-name');
            result[code] = {
                'id': id,
                'code': code,
                'type': 'crypto',
                // 'payin': currency['deposit-enabled'],
                // 'payout': currency['withdraw-enabled'],
                // 'transfer': undefined,
                'name': name,
                'active': active,
                'fee': undefined, // todo need to fetch from fee endpoint
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'deposit': {
                        'min': this.safeNumber (currency, 'deposit-min-amount'),
                        'max': Math.pow (10, precision),
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'withdraw-min-amount'),
                        'max': Math.pow (10, precision),
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const method = this.options['fetchBalanceMethod'];
        const request = {
            'id': this.accounts[0]['id'],
        };
        const response = await this[method] (this.extend (request, params));
        const balances = this.safeValue (response['data'], 'list', []);
        const result = { 'info': response };
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
        const method = this.safeString (this.options, 'fetchOrdersByStatesMethod', 'private_get_order_orders');
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
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrderOrdersId (this.extend (request, params));
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStates ('pre-submitted,submitted,partial-filled,filled,partial-canceled,canceled', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const method = this.safeString (this.options, 'fetchOpenOrdersMethod', 'fetch_open_orders_v1');
        return await this[method] (symbol, since, limit, params);
    }

    async fetchOpenOrdersV1 (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrdersV1() requires a symbol argument');
        }
        return await this.fetchOrdersByStates ('pre-submitted,submitted,partial-filled', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStates ('filled,partial-canceled,canceled', symbol, since, limit, params);
    }

    async fetchOpenOrdersV2 (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
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
        const response = await this.privateGetOrderOpenOrders (this.extend (request, omitted));
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
        const request = {
            'account-id': this.accounts[0]['id'],
            'symbol': market['id'],
            'type': side + '-' + type,
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
        const method = this.options['createOrderMethod'];
        const response = await this[method] (this.extend (request, params));
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
        const response = await this.privatePostOrderOrdersIdSubmitcancel ({ 'id': id });
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
        const response = await this.privatePostOrderOrdersBatchcancel (this.extend (request, params));
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
        const response = await this.privatePostOrderOrdersBatchCancelOpenOrders (this.extend (request, params));
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
        const response = await this.privateGetQueryDepositWithdraw (this.extend (request, params));
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
        const response = await this.privateGetQueryDepositWithdraw (this.extend (request, params));
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
        const response = await this.privatePostDwWithdrawApiCreate (this.extend (request, params));
        const id = this.safeString (response, 'data');
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        if (api === 'market') {
            url += api;
        } else if ((api === 'public') || (api === 'private')) {
            url += this.version;
        } else if ((api === 'v2Public') || (api === 'v2Private')) {
            url += 'v2';
        }
        url += '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
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
            // eslint-disable-next-line quotes
            const payload = [ method, this.hostname, url, auth ].join ("\n");
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
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + url;
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
};
