---
title: "Requisitos"
description: "El exchange debe implementar la siguiente lista de métodos y estructuras para integrarse con CCXT."
---

# Requisitos de Integración de CCXT

El exchange debe implementar la siguiente lista de métodos y estructuras para integrarse con CCXT.

## API Pública

#### Información del Exchange, Tarifas y Reglas de Trading

- [`fetchMarkets`](/docs/manual#loading-markets) – una lista de pares de trading y sus estados + [estructura de mercado](/docs/manual#market-structure)
- [`fetchCurrencies`](/docs/manual#loading-markets) – una lista de tokens o activos y sus estados + [estructura de moneda](/docs/manual#currency-structure)
- `fetchTradingLimits` – volumen de orden mín/máx, precio, costo, precisión, etc...
- `fetchTradingFees` – tarifas de trading, públicas o personales
- `fetchFundingLimits` – una lista de límites de retiro

#### Datos de Mercado

- [`fetchTicker`](/docs/manual#price-tickers) – volúmenes y estadísticas de 24h + [estructura de ticker](/docs/manual#ticker-structure)
- [`fetchOrderBook`](/docs/manual#order-book) – L2/L3 + [estructura de libro de órdenes](/docs/manual#order-book-structure)
- [`fetchTrades`](/docs/manual#trades-executions-transactions) – una lista de trades públicos recientes + [estructura de trade](/docs/manual#trade-structure)
- [`fetchOHLCV`](/docs/manual#ohlcv-candlestick-charts) – una lista de velas o datos kline para volúmenes de trading en diferentes intervalos de tiempo 1m, 15m, 1h, 1d, ... + [estructura OHLCV](/docs/manual#ohlcv-structure)

## API Privada

#### Trading

- [`fetchBalance`](/docs/manual#querying-account-balance) – para todos los tipos de cuentas + [estructura de balance](/docs/manual#balance-structure)
- `fetchAccounts` – requerido si el exchange tiene múltiples cuentas o subcuentas
- [`createOrder`](/docs/manual#placing-orders) – órdenes *límite/mercado* + [estructura de orden](/docs/manual#order-structure)
- [`cancelOrder`](/docs/manual#canceling-orders)
- `editOrder` – cambiar el precio y/o cantidad de una orden abierta

#### Historial de Trading

- [`fetchOrder`](/docs/manual#querying-orders) – una orden por ID de orden + [estructura de orden](/docs/manual#order-structure)
- [`fetchOpenOrders`](/docs/manual#querying-orders) – una lista de todas las órdenes abiertas
- [`fetchOrders`](/docs/manual#querying-orders) – una lista de todas las órdenes
- [`fetchMyTrades`](/docs/manual#personal-trades) – el historial personal de trades ejecutados para la cuenta + [estructura de trade](/docs/manual#trade-structure)

#### Fondeo

- [`fetchDepositAddress`](/docs/manual#funding-your-account) – dirección(es) de depósito + [estructura de dirección](/docs/manual#address-structure)
- [`fetchDeposits`](/docs/manual#transactions)
- [`fetchWithdrawals`](/docs/manual#transactions)
- [`fetchTransactions`](/docs/manual#transactions) + [estructura de transacción](/docs/manual#transaction-structure)
- [`fetchLedger`](/docs/manual#ledger) – transacciones, transferencias, referencias, devoluciones + [estructura de entrada de libro mayor](/docs/manual#ledger-entry-structure)
- [`withdraw`](/docs/manual#withdraw)
- `transfer` – requerido si el exchange tiene múltiples cuentas o subcuentas
