---
title: "Anforderungen"
description: "Die Börse muss die folgende Liste von Methoden und Strukturen implementieren, um in CCXT integriert zu werden."
---

# CCXT Integrationsanforderungen

Die Börse muss die folgende Liste von Methoden und Strukturen implementieren, um in CCXT integriert zu werden.

## Öffentliche API

#### Börseninformationen, Gebührenstruktur und Handelsregeln

- [`fetchMarkets`](/docs/manual#loading-markets) – eine Liste von Handelspaaren und deren Status + [Marktstruktur](/docs/manual#market-structure)
- [`fetchCurrencies`](/docs/manual#loading-markets) – eine Liste von Token oder Assets und deren Status + [Währungsstruktur](/docs/manual#currency-structure)
- `fetchTradingLimits` – Min./Max. Auftragsvolumen, Preis, Kosten, Präzision usw.
- `fetchTradingFees` – Handelsgebühren, entweder öffentlich oder persönlich
- `fetchFundingLimits` – eine Liste von Auszahlungslimits

#### Marktdaten

- [`fetchTicker`](/docs/manual#price-tickers) – 24h Volumen und Statistiken + [Ticker-Struktur](/docs/manual#ticker-structure)
- [`fetchOrderBook`](/docs/manual#order-book) – L2/L3 + [Orderbuch-Struktur](/docs/manual#order-book-structure)
- [`fetchTrades`](/docs/manual#trades-executions-transactions) – eine Liste der letzten öffentlichen Trades + [Trade-Struktur](/docs/manual#trade-structure)
- [`fetchOHLCV`](/docs/manual#ohlcv-candlestick-charts) – eine Liste von Kerzen oder Kline-Daten für gehandelte Volumen in verschiedenen Zeitrahmen 1m, 15m, 1h, 1d, ... + [OHLCV-Struktur](/docs/manual#ohlcv-structure)

## Private API

#### Handel

- [`fetchBalance`](/docs/manual#querying-account-balance) – für alle Kontentypen + [Bilanz-Struktur](/docs/manual#balance-structure)
- `fetchAccounts` – erforderlich, wenn die Börse mehrere Konten oder Unterkonten hat
- [`createOrder`](/docs/manual#placing-orders) – *Limit-/Markt*-Aufträge + [Auftrags-Struktur](/docs/manual#order-structure)
- [`cancelOrder`](/docs/manual#canceling-orders)
- `editOrder` – Änderung des Preises und/oder der Menge eines offenen Auftrags

#### Handelshistorie

- [`fetchOrder`](/docs/manual#querying-orders) – ein Auftrag nach Auftrags-ID + [Auftrags-Struktur](/docs/manual#order-structure)
- [`fetchOpenOrders`](/docs/manual#querying-orders) – eine Liste aller offenen Aufträge
- [`fetchOrders`](/docs/manual#querying-orders) – eine Liste aller Aufträge
- [`fetchMyTrades`](/docs/manual#personal-trades) – die persönliche Historie der ausgeführten Trades für das Konto + [Trade-Struktur](/docs/manual#trade-structure)

#### Finanzierung

- [`fetchDepositAddress`](/docs/manual#funding-your-account) – Einzahlungsadresse(n) + [Adress-Struktur](/docs/manual#address-structure)
- [`fetchDeposits`](/docs/manual#transactions)
- [`fetchWithdrawals`](/docs/manual#transactions)
- [`fetchTransactions`](/docs/manual#transactions) + [Transaktions-Struktur](/docs/manual#transaction-structure)
- [`fetchLedger`](/docs/manual#ledger) – Transaktionen, Überweisungen, Empfehlungen, Rückerstattungen + [Ledger-Eintrag-Struktur](/docs/manual#ledger-entry-structure)
- [`withdraw`](/docs/manual#withdraw)
- `transfer` – erforderlich, wenn die Börse mehrere Konten oder Unterkonten hat
