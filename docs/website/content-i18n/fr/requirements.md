---
title: "Exigences"
description: "L'échange doit implémenter la liste suivante de méthodes et de structures pour être intégré à CCXT."
---

# Exigences d'intégration CCXT

L'échange doit implémenter la liste suivante de méthodes et de structures pour être intégré à CCXT.

## API Publique

#### Informations sur l'échange, Barème des frais et Règles de trading

- [`fetchMarkets`](/docs/manual#loading-markets) – une liste de paires de trading et leurs statuts + [structure de marché](/docs/manual#market-structure)
- [`fetchCurrencies`](/docs/manual#loading-markets) – une liste de jetons ou d'actifs et leurs statuts + [structure de devise](/docs/manual#currency-structure)
- `fetchTradingLimits` – volume d'ordre min/max, prix, coût, précision, etc.
- `fetchTradingFees` – frais de trading, publics ou personnels
- `fetchFundingLimits` – une liste de limites de retrait

#### Données de marché

- [`fetchTicker`](/docs/manual#price-tickers) – volumes 24h et statistiques + [structure de ticker](/docs/manual#ticker-structure)
- [`fetchOrderBook`](/docs/manual#order-book) – L2/L3 + [structure du carnet d'ordres](/docs/manual#order-book-structure)
- [`fetchTrades`](/docs/manual#trades-executions-transactions) – une liste de trades publics récents + [structure de trade](/docs/manual#trade-structure)
- [`fetchOHLCV`](/docs/manual#ohlcv-candlestick-charts) – une liste de bougies ou de données kline pour les volumes échangés dans différents intervalles 1m, 15m, 1h, 1d, ... + [structure OHLCV](/docs/manual#ohlcv-structure)

## API Privée

#### Trading

- [`fetchBalance`](/docs/manual#querying-account-balance) – pour tous types de comptes + [structure de solde](/docs/manual#balance-structure)
- `fetchAccounts` – requis si l'échange a plusieurs comptes ou sous-comptes
- [`createOrder`](/docs/manual#placing-orders) – ordres *limite/marché* + [structure d'ordre](/docs/manual#order-structure)
- [`cancelOrder`](/docs/manual#canceling-orders)
- `editOrder` – modifier le prix et/ou le montant d'un ordre ouvert

#### Historique de trading

- [`fetchOrder`](/docs/manual#querying-orders) – un ordre par son identifiant + [structure d'ordre](/docs/manual#order-structure)
- [`fetchOpenOrders`](/docs/manual#querying-orders) – une liste de tous les ordres ouverts
- [`fetchOrders`](/docs/manual#querying-orders) – une liste de tous les ordres
- [`fetchMyTrades`](/docs/manual#personal-trades) – l'historique personnel des trades exécutés pour le compte + [structure de trade](/docs/manual#trade-structure)

#### Financement

- [`fetchDepositAddress`](/docs/manual#funding-your-account) – adresse(s) de dépôt + [structure d'adresse](/docs/manual#address-structure)
- [`fetchDeposits`](/docs/manual#transactions)
- [`fetchWithdrawals`](/docs/manual#transactions)
- [`fetchTransactions`](/docs/manual#transactions) + [structure de transaction](/docs/manual#transaction-structure)
- [`fetchLedger`](/docs/manual#ledger) – transactions, transferts, parrainages, cashbacks + [structure d'entrée de grand livre](/docs/manual#ledger-entry-structure)
- [`withdraw`](/docs/manual#withdraw)
- `transfer` – requis si l'échange a plusieurs comptes ou sous-comptes
