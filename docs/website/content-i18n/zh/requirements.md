---
title: "集成要求"
description: "为了与CCXT集成，交易所需要实现以下方法和结构列表。"
---

# CCXT集成要求

为了与CCXT集成，交易所需要实现以下方法和结构列表。

## 公共API

#### 交易所信息、费用表和交易规则

- [`fetchMarkets`](/docs/manual#loading-markets) – 交易对及其状态列表 + [市场结构](/docs/manual#market-structure)
- [`fetchCurrencies`](/docs/manual#loading-markets) – 代币或资产及其状态列表 + [货币结构](/docs/manual#currency-structure)
- `fetchTradingLimits` – 最小/最大订单量、价格、成本、精度等...
- `fetchTradingFees` – 交易费用，可以是公共的或个人的
- `fetchFundingLimits` – 提现限制列表

#### 市场数据

- [`fetchTicker`](/docs/manual#price-tickers) – 24小时成交量和统计 + [行情结构](/docs/manual#ticker-structure)
- [`fetchOrderBook`](/docs/manual#order-book) – L2/L3 + [订单簿结构](/docs/manual#order-book-structure)
- [`fetchTrades`](/docs/manual#trades-executions-transactions) – 最近公共交易列表 + [交易结构](/docs/manual#trade-structure)
- [`fetchOHLCV`](/docs/manual#ohlcv-candlestick-charts) – 不同时间框架（1m、15m、1h、1d等）的蜡烛图或K线数据列表 + [OHLCV结构](/docs/manual#ohlcv-structure)

## 私有API

#### 交易

- [`fetchBalance`](/docs/manual#querying-account-balance) – 所有类型的账户 + [余额结构](/docs/manual#balance-structure)
- `fetchAccounts` – 如果交易所有多个账户或子账户，则为必需
- [`createOrder`](/docs/manual#placing-orders) – *限价/市价*订单 + [订单结构](/docs/manual#order-structure)
- [`cancelOrder`](/docs/manual#canceling-orders)
- `editOrder` – 更改未完成订单的价格和/或数量

#### 交易历史

- [`fetchOrder`](/docs/manual#querying-orders) – 通过订单ID获取一个订单 + [订单结构](/docs/manual#order-structure)
- [`fetchOpenOrders`](/docs/manual#querying-orders) – 所有未完成订单列表
- [`fetchOrders`](/docs/manual#querying-orders) – 所有订单列表
- [`fetchMyTrades`](/docs/manual#personal-trades) – 账户已成交交易的个人历史 + [交易结构](/docs/manual#trade-structure)

#### 资金

- [`fetchDepositAddress`](/docs/manual#funding-your-account) – 充值地址 + [地址结构](/docs/manual#address-structure)
- [`fetchDeposits`](/docs/manual#transactions)
- [`fetchWithdrawals`](/docs/manual#transactions)
- [`fetchTransactions`](/docs/manual#transactions) + [交易结构](/docs/manual#transaction-structure)
- [`fetchLedger`](/docs/manual#ledger) – 交易、转账、推荐、返现 + [分类账条目结构](/docs/manual#ledger-entry-structure)
- [`withdraw`](/docs/manual#withdraw)
- `transfer` – 如果交易所有多个账户或子账户，则为必需
