---
title: "CCXT Pro"
description: "CCXT prend en charge les WebSockets (partie Pro) pour de nombreux échanges."
---

# CCXT Pro

CCXT prend en charge les WebSockets (`Pro` part) pour de nombreux échanges.

- [Manuel Utilisateur](/docs/pro-manual)
  - [Vue d'ensemble de l'architecture](/docs/pro-manual#overview)
  - [Prérequis](/docs/pro-manual#prerequisites)
  - [Spécificités du streaming](/docs/pro-manual#streaming-specifics)
  - [Liaison](/docs/pro-manual#linking)
  - [Instanciation](/docs/pro-manual#instantiation)
  - [Propriétés de l'échange](/docs/pro-manual#exchange-properties)
  - [API unifiée](/docs/pro-manual#unified-api)
    - [Méthodes publiques](/docs/pro-manual#public-methods)
      - [Données de marché](/docs/pro-manual#market-data)
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
    - [Méthodes privées](/docs/pro-manual#private-methods)
      - [Authentification](/docs/pro-manual#authentication)
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
    - Alternatives REST :
      En plus des méthodes ci-dessus, certains échanges majeurs prennent également en charge des méthodes websocket pour les méthodes REST, comme `createOrderWs` (qui a la même signature que `createOrder`). Vous pouvez les trouver dans le dictionnaire `exchange.has`.
  - [UnWatch](/docs/pro-manual#unwatch) (pour arrêter les méthodes **watch**).
- [Gestion des erreurs](/docs/pro-manual#error-handling)
- [Dépannage](/docs/manual#troubleshooting)
- [Comment soumettre un problème](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)
- [Exemples d'utilisation](https://github.com/ccxt/ccxt/tree/master/examples)
