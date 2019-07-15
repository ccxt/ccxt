# CCXT Integration Requirements

The exchange is required to implement the following list of methods and structures in order to get integrated with CCXT.

## Public API

#### Exchange Information, Fee Schedule and Trading Rules

- [`fetchMarkets`](https://github.com/ccxt/ccxt/wiki/Manual#markets) – a list of trading pairs and their statuses + [market structure](https://github.com/ccxt/ccxt/wiki/Manual#market-structure)
- `fetchCurrencies` – a list of tokens or assets and their statuses
- `fetchTradingLimits` – min/max order volume, price, cost, precision, etc...
- `fetchTradingFees` – trading fees, either public or personal
- `fetchFundingLimits` – a list of withdrawal limits

#### Market Data

- [`fetchTicker`](https://github.com/ccxt/ccxt/wiki/Manual#price-tickers) – 24h volumes and stats + [ticker structure](https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure)
- [`fetchOrderBook`](https://github.com/ccxt/ccxt/wiki/Manual#order-book) – L2/L3 + [orderbook structure](https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure)
- [`fetchTrades`](https://github.com/ccxt/ccxt/wiki/Manual#trades-executions-transactions) – a list of recent public trades + [trade structure](https://github.com/ccxt/ccxt/wiki/Manual#trade-structure)
- [`fetchOHLCV`](https://github.com/ccxt/ccxt/wiki/Manual#ohlcv-candlestick-charts) – a list of candles or kline data for traded volumes in different timeframes 1m, 15m, 1h, 1d, ... + [OHLCV structure](https://github.com/ccxt/ccxt/wiki/Manual#ohlcv-structure)

## Private API

#### Trading

- [`fetchBalance`](https://github.com/ccxt/ccxt/wiki/Manual#querying-account-balance) – for all types of accounts + [balance structure](https://github.com/ccxt/ccxt/wiki/Manual#balance-structure)
- `fetchAccounts` – required if the exchange has multiple accounts or sub-accounts
- [`createOrder`](https://github.com/ccxt/ccxt/wiki/Manual#placing-orders) – *limit/market* orders + [order structure](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)
- [`cancelOrder`](https://github.com/ccxt/ccxt/wiki/Manual#canceling-orders)
- `editOrder` – change the price and/or amount of an open order

#### Trading History

- [`fetchOrder`](https://github.com/ccxt/ccxt/wiki/Manual#querying-orders) – one order by order id + [order structure](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)
- [`fetchOpenOrders`](https://github.com/ccxt/ccxt/wiki/Manual#querying-orders) – a list of all open orders
- [`fetchAllOrders`](https://github.com/ccxt/ccxt/wiki/Manual#querying-orders) – a list of all orders
- [`fetchMyTrades`](https://github.com/ccxt/ccxt/wiki/Manual#personal-trades) – the personal history of filled trades for the account + [trade structure](https://github.com/ccxt/ccxt/wiki/Manual#trade-structure)

#### Funding

- [`fetchDepositAddress`](https://github.com/ccxt/ccxt/wiki/Manual#funding-your-account) – deposit address(es) + [address structure](https://github.com/ccxt/ccxt/wiki/Manual#address-structure)
- [`fetchDeposits`](https://github.com/ccxt/ccxt/wiki/Manual#transactions)
- [`fetchWithdrawals`](https://github.com/ccxt/ccxt/wiki/Manual#transactions)
- [`fetchTransactions`](https://github.com/ccxt/ccxt/wiki/Manual#transactions) + [transaction structure](https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure)
- [`fetchLedger`](https://github.com/ccxt/ccxt/wiki/Manual#ledger) – transactions, transfers, referrals, cashbacks + [ledger entry structure](https://github.com/ccxt/ccxt/wiki/Manual#ledger-entry-structure)
- [`withdraw`](https://github.com/ccxt/ccxt/wiki/Manual#withdraw)
- `transfer` – required if exchange has multiple accounts or sub-accounts
