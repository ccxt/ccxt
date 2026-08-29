---
title: "CCXT Pro"
description: "CCXT支持许多交易所的WebSocket（Pro部分）。"
---

# CCXT Pro

CCXT支持许多交易所的WebSocket（`Pro`部分）。

- [用户手册](/docs/pro-manual)
  - [架构概述](/docs/pro-manual#overview)
  - [先决条件](/docs/pro-manual#prerequisites)
  - [流数据特性](/docs/pro-manual#streaming-specifics)
  - [链接](/docs/pro-manual#linking)
  - [实例化](/docs/pro-manual#instantiation)
  - [交易所属性](/docs/pro-manual#exchange-properties)
  - [统一API](/docs/pro-manual#unified-api)
    - [公共方法](/docs/pro-manual#public-methods)
      - [市场数据](/docs/pro-manual#market-data)
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
    - [私有方法](/docs/pro-manual#private-methods)
      - [认证](/docs/pro-manual#authentication)
      - [交易](/docs/pro-manual#trading)
        - [`watchBalance (params)`](/docs/pro-manual#watchbalance)
        - [`watchOrders (symbol, since, limit, params)`](/docs/pro-manual#watchorders)
        - [`watchOrdersForSymbols (symbols, since, limit, params)`](/docs/pro-manual#watchordersforsymbols)
        - [`watchPosition (symbol, since, limit, params)`](/docs/pro-manual#watchposition)
        - [`watchPositions (symbols, since, limit, params)`](/docs/pro-manual#watchpositions)
        - [`watchMyTrades (symbol, since, limit, params)`](https://github.com/ccxt-dev/ccxt/wiki/ccxt.pro/Manual#watchMyTrades)
        - [`watchDepositsWithdrawals (code, limit, params)`](/docs/manual#watchdepositswithdrawals)
        - [`watchMyLiquidations (symbols, since, limit, params)`](/docs/manual#watchmyliquidations)
        - [`watchMyLiquidationsForSymbols (symbols, since, limit, params)`](/docs/manual#watchmyliquidationsforsymbols)
    - REST替代方案：
      除了上述方法，一些主要交易所还支持REST方法的WebSocket方法，如`createOrderWs`（签名与`createOrder`相同）。你可以在`exchange.has`字典中找到它们。
  - [取消监听](/docs/pro-manual#unwatch)（用于停止**watch**方法）。
- [错误处理](/docs/pro-manual#error-handling)
- [故障排除](/docs/manual#troubleshooting)
- [如何提交问题](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)
- [使用示例](https://github.com/ccxt/ccxt/tree/master/examples)
