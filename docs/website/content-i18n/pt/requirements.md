---
title: "Requisitos"
description: "A exchange é obrigada a implementar a seguinte lista de métodos e estruturas para se integrar com o CCXT."
---

# Requisitos de Integração do CCXT

A exchange é obrigada a implementar a seguinte lista de métodos e estruturas para se integrar com o CCXT.

## API Pública

#### Informações da Exchange, Tabela de Taxas e Regras de Negociação

- [`fetchMarkets`](/docs/manual#loading-markets) – uma lista de pares de negociação e seus status + [estrutura de mercado](/docs/manual#market-structure)
- [`fetchCurrencies`](/docs/manual#loading-markets) – uma lista de tokens ou ativos e seus status + [estrutura de moeda](/docs/manual#currency-structure)
- `fetchTradingLimits` – volume mínimo/máximo de ordem, preço, custo, precisão, etc...
- `fetchTradingFees` – taxas de negociação, públicas ou pessoais
- `fetchFundingLimits` – uma lista de limites de saque

#### Dados de Mercado

- [`fetchTicker`](/docs/manual#price-tickers) – volumes e estatísticas de 24h + [estrutura de ticker](/docs/manual#ticker-structure)
- [`fetchOrderBook`](/docs/manual#order-book) – L2/L3 + [estrutura de livro de ordens](/docs/manual#order-book-structure)
- [`fetchTrades`](/docs/manual#trades-executions-transactions) – uma lista de negociações públicas recentes + [estrutura de negociação](/docs/manual#trade-structure)
- [`fetchOHLCV`](/docs/manual#ohlcv-candlestick-charts) – uma lista de velas ou dados de kline para volumes negociados em diferentes intervalos de tempo 1m, 15m, 1h, 1d, ... + [estrutura OHLCV](/docs/manual#ohlcv-structure)

## API Privada

#### Negociação

- [`fetchBalance`](/docs/manual#querying-account-balance) – para todos os tipos de contas + [estrutura de saldo](/docs/manual#balance-structure)
- `fetchAccounts` – obrigatório se a exchange tiver múltiplas contas ou subcontas
- [`createOrder`](/docs/manual#placing-orders) – ordens *limit/market* + [estrutura de ordem](/docs/manual#order-structure)
- [`cancelOrder`](/docs/manual#canceling-orders)
- `editOrder` – alterar o preço e/ou quantidade de uma ordem em aberto

#### Histórico de Negociação

- [`fetchOrder`](/docs/manual#querying-orders) – uma ordem por ID de ordem + [estrutura de ordem](/docs/manual#order-structure)
- [`fetchOpenOrders`](/docs/manual#querying-orders) – uma lista de todas as ordens em aberto
- [`fetchOrders`](/docs/manual#querying-orders) – uma lista de todas as ordens
- [`fetchMyTrades`](/docs/manual#personal-trades) – o histórico pessoal de negociações concluídas para a conta + [estrutura de negociação](/docs/manual#trade-structure)

#### Financeiro

- [`fetchDepositAddress`](/docs/manual#funding-your-account) – endereço(s) de depósito + [estrutura de endereço](/docs/manual#address-structure)
- [`fetchDeposits`](/docs/manual#transactions)
- [`fetchWithdrawals`](/docs/manual#transactions)
- [`fetchTransactions`](/docs/manual#transactions) + [estrutura de transação](/docs/manual#transaction-structure)
- [`fetchLedger`](/docs/manual#ledger) – transações, transferências, indicações, cashbacks + [estrutura de entrada de livro-razão](/docs/manual#ledger-entry-structure)
- [`withdraw`](/docs/manual#withdraw)
- `transfer` – obrigatório se a exchange tiver múltiplas contas ou subcontas
