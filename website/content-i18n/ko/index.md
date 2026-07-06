---
title: "CCXT 문서"
description: "CCXT — JavaScript, Python, PHP, C#, Go 및 Java의 100개 이상 암호화폐 거래소를 위한 통합 API."
---

CCXT 위키에 오신 것을 환영합니다!

> 전체 문서는 /docs/manual에서 확인하는 것을 권장합니다.

## 일반 정보

- [지원되는 거래소](/docs/exchange-markets)
- [국가별 거래소](/docs/exchange-markets-by-country)

## 설치 방법

- [설치](/docs/install)
  - [Node.js](/docs/install#nodejs)
  - [Python](/docs/install#python)
  - [PHP](/docs/install#php)
  - [C#](/docs/install#netc)
  - [Go](/docs/install#go)
  - [Java](/docs/install#java)
  - [웹 브라우저](/docs/install#web-browsers)
  - [Docker](/docs/install#docker)
  - [프록시](/docs/install#proxy)
  - [CORS (Access-Control-Allow-Origin)](/docs/install#cors-access-control-allow-origin)

## 사용 방법

- [사용자 매뉴얼](/docs/manual)
  - [아키텍처 개요](/docs/manual#overview)
  - [인스턴스화](/docs/manual#instantiation)
  - [거래소 구조](/docs/manual#exchange-structure)
  - [거래소 속성](/docs/manual#exchange-properties)
  - [요율 제한](/docs/manual#rate-limit)
  - [마켓](/docs/manual#markets)
  - [심볼 및 마켓 ID](https://github.com/ccxt-dev/ccxt/wiki/Manual#symbols-and-market-ids)
  - [API 메서드 / 엔드포인트](/docs/manual#api-methods--endpoints)
    - [암시적 API 메서드](/docs/manual#implicit-api-methods)
    - [공개/비공개 API](/docs/manual#publicprivate-api)
    - [동기 vs 비동기 호출](/docs/manual#synchronous-vs-asynchronous-calls)
    - [통합 API](/docs/manual#unified-api)
      - [파라미터 재정의](/docs/manual#overriding-unified-api-params)
      - [페이지네이션](/docs/manual#pagination)
      - [자동 페이지네이션](/docs/manual#automatic-pagination)
  - [공개 API](/docs/manual#public-api)
    - [호가 정보](/docs/manual#order-book)
      - [시장 깊이](/docs/manual#market-depth)
    - [가격 티커](/docs/manual#price-tickers)
    - [OHLCV 캔들스틱 차트](/docs/manual#ohlcv-candlestick-charts)
    - [공개 거래](/docs/manual#trades-executions-transactions)
  - [비공개 API](/docs/manual#private-api)
    - [인증](/docs/manual#authentication)
    - [API 키 설정](/docs/manual#api-keys-setup)
    - [계정 잔고 조회](/docs/manual#account-balance)
    - [주문](/docs/manual#orders)
      - [주문 조회](/docs/manual#querying-orders)
        - [주문 ID별](https://github.com/ccxt-dev/ccxt/wiki/Manual#by-order-id)
        - [모든 주문](https://github.com/ccxt-dev/ccxt/wiki/Manual#all-orders)
        - [미체결 주문](https://github.com/ccxt-dev/ccxt/wiki/Manual#open-orders)
        - [체결된 주문](https://github.com/ccxt-dev/ccxt/wiki/Manual#closed-orders)
      - [주문 구조](/docs/manual#order-structure)
      - [주문 하기](/docs/manual#placing-orders)
        - [시장가 주문](/docs/manual#market-orders)
        - [지정가 주문](/docs/manual#limit-orders)
        - [맞춤 파라미터](/docs/manual#custom-order-params)
      - [주문 취소](/docs/manual#canceling-orders)
    - [개인 거래](https://github.com/ccxt-dev/ccxt/wiki/Manual#personal-trades)
    - [계정 자금 조달](/docs/manual#ledger)
      - [입금](/docs/manual#deposit)
      - [출금](/docs/manual#withdraw)
      - [거래](/docs/manual#transactions)
        - [입금](/docs/manual#deposit)
        - [출금](/docs/manual#withdrawal)
        - [모든 거래](/docs/manual#transaction-structure)
    - [수수료](/docs/manual#fees)
      - [거래 수수료](/docs/manual#trading-fees)
      - [거래 수수료](/docs/manual#transaction-fees)

## WebSocket 지원

- [CCXT Pro](/docs/pro)

## 문제 해결

- [자주 묻는 질문](/docs/faq)
- [Nonce 재정의](/docs/manual#overriding-the-nonce)
- [오류 처리](/docs/manual#error-handling)
- [문제 해결](/docs/manual#troubleshooting)
- [이슈 제출 방법](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)
- [CCXT CLI: 명령줄 인터페이스](/docs/cli)

## 예시

- [사용 예시](/docs/examples-overview)

## 새로운 거래소

- [인증](/docs/certification)
- [요구사항](/docs/requirements)

## API 참조

- [API 참조](/docs/manual)
