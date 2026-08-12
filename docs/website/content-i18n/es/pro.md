---
title: "CCXT Pro"
description: "CCXT admite WebSockets (parte Pro) para muchos exchanges."
---

# CCXT Pro

CCXT admite WebSockets (`Pro` part) para muchos exchanges.

- [Manual de Usuario](/docs/pro-manual)
  - [Descripción General de la Arquitectura](/docs/pro-manual#overview)
  - [Requisitos Previos](/docs/pro-manual#prerequisites)
  - [Especificidades de Streaming](/docs/pro-manual#streaming-specifics)
  - [Enlace](/docs/pro-manual#linking)
  - [Instanciación](/docs/pro-manual#instantiation)
  - [Propiedades del Exchange](/docs/pro-manual#exchange-properties)
  - [API Unificada](/docs/pro-manual#unified-api)
    - [Métodos Públicos](/docs/pro-manual#public-methods)
      - [Datos de Mercado](/docs/pro-manual#market-data)
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
    - [Métodos Privados](/docs/pro-manual#private-methods)
      - [Autenticación](/docs/pro-manual#authentication)
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
    - Alternativas REST:
      Además de los métodos anteriores, algunos exchanges importantes también admiten métodos de websocket para métodos REST, como `createOrderWs` (que tiene la misma firma que `createOrder`). Puedes encontrarlos en el diccionario `exchange.has`.
  - [UnWatch](/docs/pro-manual#unwatch) (para detener métodos **watch**).
- [Manejo de Errores](/docs/pro-manual#error-handling)
- [Resolución de Problemas](/docs/manual#troubleshooting)
- [Cómo Enviar un Issue](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)
- [Ejemplos de Uso](https://github.com/ccxt/ccxt/tree/master/examples)
