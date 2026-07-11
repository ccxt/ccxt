---
title: "요구사항"
description: "거래소는 CCXT와 통합하기 위해 다음 메서드와 구조 목록을 구현해야 합니다."
---

# CCXT 통합 요구사항

거래소는 CCXT와 통합하기 위해 다음 메서드와 구조 목록을 구현해야 합니다.

## 공개 API

#### 거래소 정보, 수수료 일정 및 거래 규칙

- [`fetchMarkets`](/docs/manual#loading-markets) – 거래 페어 목록과 해당 상태 + [마켓 구조](/docs/manual#market-structure)
- [`fetchCurrencies`](/docs/manual#loading-markets) – 토큰 또는 자산 목록과 해당 상태 + [통화 구조](/docs/manual#currency-structure)
- `fetchTradingLimits` – 최소/최대 주문 볼륨, 가격, 비용, 정밀도 등...
- `fetchTradingFees` – 거래 수수료, 공개 또는 개인
- `fetchFundingLimits` – 출금 한도 목록

#### 시장 데이터

- [`fetchTicker`](/docs/manual#price-tickers) – 24시간 거래량 및 통계 + [티커 구조](/docs/manual#ticker-structure)
- [`fetchOrderBook`](/docs/manual#order-book) – L2/L3 + [호가 목록 구조](/docs/manual#order-book-structure)
- [`fetchTrades`](/docs/manual#trades-executions-transactions) – 최근 공개 거래 목록 + [거래 구조](/docs/manual#trade-structure)
- [`fetchOHLCV`](/docs/manual#ohlcv-candlestick-charts) – 다양한 시간대(1분, 15분, 1시간, 1일 등)의 캔들 또는 거래량 데이터 목록 + [OHLCV 구조](/docs/manual#ohlcv-structure)

## 비공개 API

#### 거래

- [`fetchBalance`](/docs/manual#querying-account-balance) – 모든 유형의 계정 + [잔액 구조](/docs/manual#balance-structure)
- `fetchAccounts` – 거래소에 여러 계정 또는 하위 계정이 있는 경우 필요
- [`createOrder`](/docs/manual#placing-orders) – *지정가/시장가* 주문 + [주문 구조](/docs/manual#order-structure)
- [`cancelOrder`](/docs/manual#canceling-orders)
- `editOrder` – 미결 주문의 가격 및/또는 수량 변경

#### 거래 내역

- [`fetchOrder`](/docs/manual#querying-orders) – 주문 ID로 한 주문 + [주문 구조](/docs/manual#order-structure)
- [`fetchOpenOrders`](/docs/manual#querying-orders) – 모든 미결 주문 목록
- [`fetchOrders`](/docs/manual#querying-orders) – 모든 주문 목록
- [`fetchMyTrades`](/docs/manual#personal-trades) – 계정의 체결된 거래 개인 내역 + [거래 구조](/docs/manual#trade-structure)

#### 자금 조달

- [`fetchDepositAddress`](/docs/manual#funding-your-account) – 입금 주소 + [주소 구조](/docs/manual#address-structure)
- [`fetchDeposits`](/docs/manual#transactions)
- [`fetchWithdrawals`](/docs/manual#transactions)
- [`fetchTransactions`](/docs/manual#transactions) + [거래 구조](/docs/manual#transaction-structure)
- [`fetchLedger`](/docs/manual#ledger) – 거래, 이체, 추천, 캐시백 + [원장 항목 구조](/docs/manual#ledger-entry-structure)
- [`withdraw`](/docs/manual#withdraw)
- `transfer` – 거래소에 여러 계정 또는 하위 계정이 있는 경우 필요
