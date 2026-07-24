---
title: "CCXT Pro"
description: "CCXT는 많은 거래소에 대해 WebSockets(Pro 부분)을 지원합니다."
---

# CCXT Pro

CCXT는 많은 거래소에 대해 WebSockets (`Pro` 부분)을 지원합니다.

- [사용자 매뉴얼](/docs/pro-manual)
  - [아키텍처 개요](/docs/pro-manual#overview)
  - [전제 조건](/docs/pro-manual#prerequisites)
  - [스트리밍 세부 사항](/docs/pro-manual#streaming-specifics)
  - [링크](/docs/pro-manual#linking)
  - [인스턴스화](/docs/pro-manual#instantiation)
  - [거래소 속성](/docs/pro-manual#exchange-properties)
  - [통합 API](/docs/pro-manual#unified-api)
    - [공개 메서드](/docs/pro-manual#public-methods)
      - [시장 데이터](/docs/pro-manual#market-data)
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
    - [비공개 메서드](/docs/pro-manual#private-methods)
      - [인증](/docs/pro-manual#authentication)
      - [거래](/docs/pro-manual#trading)
        - [`watchBalance (params)`](/docs/pro-manual#watchbalance)
        - [`watchOrders (symbol, since, limit, params)`](/docs/pro-manual#watchorders)
        - [`watchOrdersForSymbols (symbols, since, limit, params)`](/docs/pro-manual#watchordersforsymbols)
        - [`watchPosition (symbol, since, limit, params)`](/docs/pro-manual#watchposition)
        - [`watchPositions (symbols, since, limit, params)`](/docs/pro-manual#watchpositions)
        - [`watchMyTrades (symbol, since, limit, params)`](https://github.com/ccxt-dev/ccxt/wiki/ccxt.pro/Manual#watchMyTrades)
        - [`watchDepositsWithdrawals (code, limit, params)`](/docs/manual#watchdepositswithdrawals)
        - [`watchMyLiquidations (symbols, since, limit, params)`](/docs/manual#watchmyliquidations)
        - [`watchMyLiquidationsForSymbols (symbols, since, limit, params)`](/docs/manual#watchmyliquidationsforsymbols)
    - REST 대안:
      위의 메서드 외에도 일부 주요 거래소는 `createOrderWs`와 같은 REST 메서드에 대한 웹소켓 메서드도 지원합니다(서명은 `createOrder`와 동일). 이를 `exchange.has` 사전에서 찾을 수 있습니다.
  - [UnWatch](/docs/pro-manual#unwatch) (**watch** 메서드 중지용).
- [오류 처리](/docs/pro-manual#error-handling)
- [문제 해결](/docs/manual#troubleshooting)
- [이슈 제출 방법](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)
- [사용 예시](https://github.com/ccxt/ccxt/tree/master/examples)
