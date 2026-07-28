---
title: "AI 스킬"
description: "CCXT는 Claude Code 및 OpenCode AI 어시스턴트를 위한 언어별 스킬을 제공합니다. 이 스킬들은 개발자가 포괄적인 가이드, 코드 예제, 완전한 API 레퍼런스를 통해 프로젝트에서 CCXT를 빠르게 배우고 사용할 수 있도록 도와줍니다…"
---

# Claude Code 및 OpenCode를 위한 AI 스킬

CCXT는 Claude Code 및 OpenCode AI 어시스턴트를 위한 언어별 스킬을 제공합니다. 이 스킬들은 포괄적인 가이드, 코드 예제, 완전한 API 레퍼런스를 통해 개발자가 프로젝트에서 CCXT를 빠르게 배우고 사용할 수 있도록 도와줍니다.

## CCXT 스킬이란?

스킬은 AI 코딩 어시스턴트(Claude Code 및 OpenCode 등)가 로드하여 CCXT 작업 시 맥락 인식 도움을 제공할 수 있는 인터랙티브 문서 모듈입니다. CCXT에 관한 질문을 하면 AI 어시스턴트가 이 스킬들을 사용하여 작동하는 코드 예제와 함께 정확하고 상세한 답변을 제공합니다.

### 포함 내용

각 스킬에는 다음이 포함됩니다:

- **완전한 API 레퍼런스** - 설명이 포함된 200개 이상의 CCXT 메서드 문서
- **설치 가이드** - 각 언어별 패키지 관리자 명령어
- **코드 예제** - 지원되는 모든 언어의 문서에 포함된 작동하는 코드 예제
- **REST 및 WebSocket API** - 표준 및 실시간 API 모두 다룸
- **모범 사례** - 오류 처리, 속도 제한, 인증 패턴
- **일반적인 함정** - 언어별로 피해야 할 실수들
- **문제 해결 가이드** - 일반적인 문제 및 오류 메시지 해결책

## 사용 가능한 스킬

다섯 가지 언어별 스킬을 사용할 수 있습니다:

| 스킬 | 언어 | 적용 범위 |
|-------|----------|----------|
| **ccxt-typescript** | TypeScript/JavaScript | Node.js, 브라우저, REST 및 WebSocket |
| **ccxt-python** | Python | 동기, 비동기, asyncio, REST 및 WebSocket |
| **ccxt-php** | PHP | 동기, 비동기 (ReactPHP), REST 및 WebSocket |
| **ccxt-csharp** | C#/.NET | .NET Standard 2.0+, REST 및 WebSocket |
| **ccxt-go** | Go | REST 및 WebSocket |

각 스킬은 적절한 관용구, 명명 규칙 및 모범 사례를 갖춘 특정 언어에 맞게 조정되어 있습니다.

## 설치

### 전제 조건

시스템에 [Claude Code](https://claude.ai/download) 또는 [OpenCode](https://opencode.dev/)가 설치되어 있어야 합니다.

### 빠른 설치 (권장)

[스킬 CLI](https://github.com/vercel-labs/skills)를 사용하여 단일 명령으로 모든 스킬을 설치합니다:

```bash
npx skills add ccxt/ccxt
```

이 방법은 Claude Code, Cursor, Copilot, Windsurf, Codex 및 30개 이상의 다른 AI 코딩 어시스턴트와 함께 작동합니다.

### 대안: 셸 스크립트

```bash
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | bash
```

이 방법은 다섯 가지 CCXT 스킬 모두를 시스템에 자동으로 다운로드하고 설치합니다.

### 저장소에서 설치

CCXT 저장소를 클론한 경우 다음 옵션을 사용할 수 있습니다:

#### 옵션 1: 대화형 설치 (권장)

```bash
./install-skills.sh
```

이 방법은 설치할 스킬을 선택할 수 있는 대화형 메뉴를 제공합니다:

```
Select which skills to install:

  1) ccxt-typescript - TypeScript/JavaScript (Node.js & browser, REST & WebSocket)
  2) ccxt-python     - Python (sync & async, REST & WebSocket)
  3) ccxt-php        - PHP (sync & async, REST & WebSocket)
  4) ccxt-csharp     - C#/.NET (REST & WebSocket)
  5) ccxt-go         - Go (REST & WebSocket)
  6) All skills      - Install all of the above
  7) Exit            - Cancel installation

Enter your choice (1-7):
```

#### 옵션 2: 모든 스킬 설치

```bash
./install-skills.sh --all
```

#### 옵션 3: 특정 언어 설치

```bash
# Install single skill
./install-skills.sh --typescript

# Install multiple skills
./install-skills.sh --python --go

# Install with flags
./install-skills.sh --typescript --php --csharp
```

### 설치 위치

스킬은 다음 위치에 설치됩니다:
- `~/.claude/skills/` (Claude Code용)
- `~/.opencode/skills/` (OpenCode용)

설치 스크립트는 두 위치를 자동으로 감지하여 적절한 위치에 설치합니다.

## AI 어시스턴트와 함께 사용하기

### 스킬 호출

설치 후 Claude Code 또는 OpenCode에서 직접 스킬을 호출할 수 있습니다:

```
/ccxt-typescript
/ccxt-python
/ccxt-php
/ccxt-csharp
/ccxt-go
```

AI 어시스턴트가 스킬을 로드하고 해당 언어로 CCXT에 관한 질문에 답변할 준비가 됩니다.

### 질문하기

스킬을 명시적으로 호출할 필요 없이 자연스러운 질문만 하면 됩니다:

**기본 사용법:**
- "Python에서 CCXT를 어떻게 설치하나요?"
- "TypeScript에서 티커를 가져오는 방법을 보여주세요"
- "Go에서 API 키를 사용하여 Binance에 연결하는 방법은?"

**특정 기능:**
- "JavaScript에서 손절매 주문을 어떻게 생성하나요?"
- "Python에서 실시간 오더북 업데이트를 보는 방법을 보여주세요"
- "`fetchTicker`와 `watchTicker`의 차이점은 무엇인가요?"
- "PHP에서 `RateLimitExceeded` 오류를 어떻게 처리하나요?"

**고급 주제:**
- "C#에서 선물 거래 레버리지를 어떻게 설정하나요?"
- "TypeScript에서 펀딩 레이트 히스토리를 가져오는 방법을 보여주세요"
- "Python에서 트레일링 스탑 주문을 어떻게 생성하나요?"
- "Go에서 WebSocket 재연결을 처리하는 가장 좋은 방법은?"

AI 어시스턴트는 작동하는 코드 예제와 함께 정확한 답변을 제공하기 위해 자동으로 적절한 스킬을 참조합니다.

## 다루는 내용

### 시장 데이터 메서드

**티커 및 가격:**
- `fetchTicker` - 단일 심볼의 티커 가져오기
- `fetchTickers` - 여러 티커 한 번에 가져오기
- `fetchBidsAsks` - 최우선 매수/매도 가격 가져오기
- `fetchMarkPrices` - 파생상품의 마크 가격 가져오기
- `fetchLastPrices` - 마지막 거래 가격 가져오기

**오더북:**
- `fetchOrderBook` - 전체 오더북 가져오기
- `fetchL2OrderBook` - Level 2 오더북
- `fetchL3OrderBook` - Level 3 오더북 (전체 깊이)
- WebSocket: `watchOrderBook` - 실시간 오더북 업데이트

**거래 및 히스토리:**
- `fetchTrades` - 공개 거래 히스토리 가져오기
- `fetchMyTrades` - 내 거래 히스토리 가져오기 (인증 필요)
- `fetchOHLCV` - 캔들스틱/OHLCV 데이터 가져오기
- WebSocket: `watchTrades`, `watchOHLCV` - 실시간 업데이트

### 거래 메서드

**주문 유형 (20개 이상 지원):**
- 시장가 주문: `createMarketOrder`, `createMarketBuyOrder`, `createMarketSellOrder`
- 지정가 주문: `createLimitOrder`, `createLimitBuyOrder`, `createLimitSellOrder`
- 스탑 주문: `createStopLossOrder`, `createStopMarketOrder`, `createStopLimitOrder`
- 익절: `createTakeProfitOrder`
- 트레일링 스탑: `createTrailingAmountOrder`, `createTrailingPercentOrder`
- 고급: `createPostOnlyOrder`, `createReduceOnlyOrder`, `createTriggerOrder`
- OCO 주문: `createOrderWithTakeProfitAndStopLoss`

**주문 관리:**
- `fetchOrder` - 단일 주문 가져오기
- `fetchOrders` - 모든 주문 가져오기
- `fetchOpenOrders` - 미체결 주문 가져오기
- `fetchClosedOrders` - 체결된 주문 가져오기
- `cancelOrder` - 단일 주문 취소
- `cancelAllOrders` - 모든 주문 취소
- `editOrder` - 기존 주문 수정
- WebSocket: `watchOrders` - 실시간 주문 업데이트

### 계정 및 잔액

- `fetchBalance` - 계정 잔액 가져오기
- `fetchAccounts` - 서브 계정 가져오기
- `fetchLedger` - 원장 히스토리 가져오기
- `fetchDeposits` - 입금 히스토리 가져오기
- `fetchWithdrawals` - 출금 히스토리 가져오기
- `fetchTransactions` - 거래 내역 가져오기
- WebSocket: `watchBalance` - 실시간 잔액 업데이트

### 파생상품 및 선물

**포지션:**
- `fetchPosition` - 단일 포지션 가져오기
- `fetchPositions` - 모든 포지션 가져오기
- `closePosition` - 포지션 청산
- `setPositionMode` - 헤지/단방향 모드 설정
- WebSocket: `watchPositions` - 실시간 포지션 업데이트

**마진 및 레버리지:**
- `fetchLeverage` - 현재 레버리지 가져오기
- `setLeverage` - 레버리지 설정
- `setMarginMode` - 교차/격리 마진 설정
- `borrowMargin` - 마진 차입
- `repayMargin` - 차입 마진 상환

**펀딩 및 결제:**
- `fetchFundingRate` - 현재 펀딩 레이트 가져오기
- `fetchFundingRateHistory` - 펀딩 레이트 히스토리 가져오기
- `fetchFundingHistory` - 내 펀딩 지급 내역 가져오기
- `fetchSettlementHistory` - 결제 히스토리 가져오기

**미결제약정 및 청산:**
- `fetchOpenInterest` - 미결제약정 가져오기
- `fetchOpenInterestHistory` - 미결제약정 히스토리 가져오기
- `fetchLiquidations` - 공개 청산 내역 가져오기
- `fetchMyLiquidations` - 내 청산 내역 가져오기

**옵션:**
- `fetchOption` - 옵션 정보 가져오기
- `fetchOptionChain` - 옵션 체인 가져오기
- `fetchGreeks` - 옵션 그릭스 가져오기
- `fetchVolatilityHistory` - 변동성 히스토리 가져오기

### 입금 및 출금

- `fetchDepositAddress` - 입금 주소 가져오기
- `createDepositAddress` - 새 입금 주소 생성
- `withdraw` - 자금 출금
- `fetchDeposit` - 입금 정보 가져오기
- `fetchWithdrawal` - 출금 정보 가져오기

### 수수료 및 한도

- `fetchTradingFee` - 심볼별 거래 수수료 가져오기
- `fetchTradingFees` - 거래 수수료 가져오기
- `fetchTradingLimits` - 거래 한도 가져오기
- `fetchDepositWithdrawFee` - 입출금 수수료 가져오기

### WebSocket 실시간 스트리밍

모든 `fetch*` 메서드는 `watch*` 접두사를 가진 WebSocket 동등 메서드를 가지고 있습니다:

- `watchTicker` - 실시간 티커 업데이트
- `watchTickers` - 실시간 복수 티커 업데이트
- `watchOrderBook` - 실시간 오더북 업데이트
- `watchTrades` - 실시간 거래 스트림
- `watchOHLCV` - 실시간 캔들스틱 업데이트
- `watchBalance` - 실시간 잔액 업데이트 (인증 필요)
- `watchOrders` - 실시간 주문 업데이트 (인증 필요)
- `watchMyTrades` - 실시간 거래 업데이트 (인증 필요)
- `watchPositions` - 실시간 포지션 업데이트 (인증 필요)

## 다루는 모범 사례

### 오류 처리

각 스킬은 적절한 예외 처리를 가르칩니다:

- **NetworkError** - 복구 가능한 오류 (백오프 후 재시도)
- **ExchangeError** - 복구 불가능한 오류 (재시도 금지)
- **RateLimitExceeded** - 속도 제한 초과 (대기 후 재시도)
- **AuthenticationError** - 잘못된 API 자격증명
- **InsufficientFunds** - 잔액 부족
- **InvalidOrder** - 잘못된 주문 매개변수

### 속도 제한

스킬은 내장 및 수동 속도 제한을 모두 다룹니다:

```
# Enable built-in rate limiter (recommended)
exchange.enableRateLimit = true
```

### 인증

안전한 API 키 처리:

```
# Use environment variables (recommended)
exchange.apiKey = process.env.EXCHANGE_API_KEY
exchange.secret = process.env.EXCHANGE_SECRET
```

### 메서드 가용성

거래소가 메서드를 지원하는지 확인하기:

```
if (exchange.has['fetchOHLCV']) {
    // Method is supported
}
```

## 문제 해결

### 스킬이 표시되지 않는 경우

1. 설치 위치 확인:
```bash
ls ~/.claude/skills/ccxt-*
ls ~/.opencode/skills/ccxt-*
```

2. Claude Code / OpenCode 재시작

3. 설치 재실행:
```bash
./install-skills.sh --all
```

### "Skill Not Found" 오류 발생 시

올바른 스킬 이름을 사용하고 있는지 확인하세요:
- `/ccxt-typescript` (`/ccxt-ts` 또는 `/typescript`가 아님)
- `/ccxt-python` (`/ccxt-py` 또는 `/python`이 아님)
- 기타

### AI 어시스턴트가 스킬을 사용하지 않는 경우

AI 어시스턴트는 CCXT 관련 질문을 할 때 자동으로 스킬을 사용합니다. 명시적으로 호출하지 않아도 됩니다.

## 수동 설치

설치 스크립트가 작동하지 않으면 수동으로 설치할 수 있습니다:

```bash
# Create directories
mkdir -p ~/.claude/skills/
mkdir -p ~/.opencode/skills/

# Copy skills
cp -r .claude/skills/ccxt-typescript ~/.claude/skills/
cp -r .claude/skills/ccxt-python ~/.claude/skills/
cp -r .claude/skills/ccxt-php ~/.claude/skills/
cp -r .claude/skills/ccxt-csharp ~/.claude/skills/
cp -r .claude/skills/ccxt-go ~/.claude/skills/

# For OpenCode
cp -r .claude/skills/ccxt-* ~/.opencode/skills/
```

## 더 알아보기

- **스킬 문서**: CCXT 저장소의 `.claude/skills/README.md`
- **생성 전략**: `.claude/skills/GENERATION_STRATEGY.md`
- **CCXT 매뉴얼**: [Manual.md](/docs/manual)
- **CCXT Pro**: [ccxt.pro.manual.md](/docs/pro-manual)

## 피드백

스킬 개선을 위한 제안이나 문제를 발견한 경우:

1. [GitHub](https://github.com/ccxt/ccxt/issues)에 이슈를 열어주세요
2. 제목에 "Skills:"를 포함시켜 주세요
3. 어떤 언어 스킬이며 무엇을 개선할 수 있는지 명시해 주세요

스킬은 CCXT 릴리스와 함께 적극적으로 유지 관리되고 업데이트됩니다.
