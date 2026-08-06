---
title: "CCXT Pro"
description: "CCXT unterstützt WebSockets (Pro-Teil) für viele Börsen."
---

# CCXT Pro

CCXT unterstützt WebSockets (`Pro` Teil) für viele Börsen.

- [Benutzerhandbuch](/docs/pro-manual)
  - [Architekturübersicht](/docs/pro-manual#overview)
  - [Voraussetzungen](/docs/pro-manual#prerequisites)
  - [Streaming-Besonderheiten](/docs/pro-manual#streaming-specifics)
  - [Verknüpfung](/docs/pro-manual#linking)
  - [Instanziierung](/docs/pro-manual#instantiation)
  - [Börsen-Eigenschaften](/docs/pro-manual#exchange-properties)
  - [Vereinheitlichte API](/docs/pro-manual#unified-api)
    - [Öffentliche Methoden](/docs/pro-manual#public-methods)
      - [Marktdaten](/docs/pro-manual#market-data)
        - [`watchOrderBook (symbol, limit, params)`](/docs/pro-manual#watchorderbook)
        - [`watchOrderBookForSymbols (symbols, limit, params)`](/docs/pro-manual#watchorderbookforsymbols)
        - [`watchTicker (symbol, params)`](/docs/pro-manual#watchticker)
        - [`watchTickers (symbols, params)`](/docs/pro-manual#watchtickers)
        - [`watchOHLCV (symbol, timeframe, since, limit, params)`](/docs/pro-manual#watchohlcv)
        - [`watchOHLCVForSymbols (symbolsAndTimeframes, since, limit, params)`](/docs/pro-manual#watchohlcvforsymbols)
        - [`watchTrades (symbol, since, limit, params)`](/docs/pro-manual#watchtrades)
        - [`watchTradesForSymbols (symbols, since, limit, params)`](/docs/pro-manual#watchtradesforsymbols)
        - [`watchBidsAsks (symbols, params)`](/docs/pro-manual#watchbidsasks)
        - [`watchLiquidations (symbol, since, limit, params)`](/docs/pro-manual#watchbidsasks)
        - [`watchLiquidationsForSymbols (symbols, since, limit, params)`](/docs/pro-manual#watchforsymbols)
    - [Private Methoden](/docs/pro-manual#private-methods)
      - [Authentifizierung](/docs/pro-manual#authentication)
      - [Trading](/docs/pro-manual#trading)
        - [`watchBalance (params)`](/docs/pro-manual#watchbalance)
        - [`watchOrders (symbol, since, limit, params)`](/docs/pro-manual#watchorders)
        - [`watchOrdersForSymbols (symbols, since, limit, params)`](/docs/pro-manual#watchordersforsymbols)
        - [`watchPosition (symbol, since, limit, params)`](/docs/pro-manual#watchposition)
        - [`watchPositions (symbols, since, limit, params)`](/docs/pro-manual#watchpositions)
        - [`watchMyTrades (symbol, since, limit, params)`](https://github.com/ccxt-dev/ccxt/wiki/ccxt.pro/Manual#watchMyTrades)
        - [`watchDepositsWithdrawals (code, limit, params)`](/docs/manual#watchdepositswithdrawals)
        - [`watchMyLiquidations (symbols, since, limit, params)`](/docs/manual#watchmyliquidations)
        - [`watchMyLiquidationsForSymbols (symbols, since, limit, params)`](/docs/manual#watchmyliquidationsforsymbols)
    - REST-Alternativen:
      Zusätzlich zu den oben genannten Methoden unterstützen einige große Börsen auch WebSocket-Methoden für REST-Methoden, wie `createOrderWs` (mit gleicher Signatur wie `createOrder`). Sie können diese im `exchange.has`-Wörterbuch finden.
  - [UnWatch](/docs/pro-manual#unwatch) (zum Stoppen von **watch**-Methoden).
- [Fehlerbehandlung](/docs/pro-manual#error-handling)
- [Fehlerbehebung](/docs/manual#troubleshooting)
- [Wie man ein Issue einreicht](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)
- [Verwendungsbeispiele](https://github.com/ccxt/ccxt/tree/master/examples)
