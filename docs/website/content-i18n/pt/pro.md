---
title: "CCXT Pro"
description: "O CCXT suporta WebSockets (parte Pro) para muitas exchanges."
---

# CCXT Pro

O CCXT suporta WebSockets (`Pro` part) para muitas exchanges.

- [Manual do Usuário](/docs/pro-manual)
  - [Visão Geral da Arquitetura](/docs/pro-manual#overview)
  - [Pré-requisitos](/docs/pro-manual#prerequisites)
  - [Especificidades de Streaming](/docs/pro-manual#streaming-specifics)
  - [Vinculação](/docs/pro-manual#linking)
  - [Instanciação](/docs/pro-manual#instantiation)
  - [Propriedades da Exchange](/docs/pro-manual#exchange-properties)
  - [API Unificada](/docs/pro-manual#unified-api)
    - [Métodos Públicos](/docs/pro-manual#public-methods)
      - [Dados de Mercado](/docs/pro-manual#market-data)
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
      - [Autenticação](/docs/pro-manual#authentication)
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
      Além dos métodos acima, algumas exchanges importantes também suportam métodos websocket para métodos REST, como `createOrderWs` (que tem a mesma assinatura de `createOrder`). Você pode encontrá-los no dicionário `exchange.has`.
  - [UnWatch](/docs/pro-manual#unwatch) (para parar métodos **watch**).
- [Tratamento de Erros](/docs/pro-manual#error-handling)
- [Solução de Problemas](/docs/manual#troubleshooting)
- [Como Enviar um Problema](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)
- [Exemplos de Uso](https://github.com/ccxt/ccxt/tree/master/examples)
