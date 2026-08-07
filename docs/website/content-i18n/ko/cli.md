---
title: "CLI"
description: "CCXT에는 명령줄에서 모든 거래소 메서드와 속성을 호출할 수 있는 예제가 포함되어 있습니다. 프로그래머가 되거나 코드를 작성할 필요 없이 –…"
---

# CCXT CLI (명령줄 인터페이스)

CCXT에는 명령줄에서 모든 거래소 메서드와 속성을 호출할 수 있는 예제가 포함되어 있습니다. 프로그래머가 되거나 코드를 작성할 필요 없이 어떤 사용자든 사용할 수 있습니다!

CLI 인터페이스는 CCXT의 프로그램으로, 명령줄에서 거래소 이름과 일부 매개변수를 받아 해당 CCXT 호출을 실행하고 호출 결과를 사용자에게 출력합니다. 따라서 CLI를 사용하면 단 한 줄의 코드도 작성하지 않고 CCXT를 즉시 사용할 수 있습니다.

CCXT 명령줄 인터페이스는 다음과 같은 용도로 매우 편리하고 유용합니다:

- bash api 스크립팅
- cron/crontab 트레이딩 자동화
- 코드 문제 해결
- 거래소 오류 디버깅
- 명령줄에서 빠른 암호화폐 거래 수행
- 백테스팅을 위한 데이터 집계
- 다른 시스템 및 프레임워크와의 상호운용성 추가
- 암호화폐 거래소 거래의 기본 학습
- CCXT 및 API의 고급 측면 학습
- 새로운 거래소 통합 작성
- CCXT에 코드 기여

CCXT 라이브러리 사용자들에게 – CLI를 최소한 몇 번 사용해보는 것을 강력히 추천합니다.
CCXT 라이브러리 개발자들에게 – CLI는 권장 사항 이상으로 필수입니다.

CCXT CLI를 배우고 이해하는 가장 좋은 방법은 실험과 시행착오입니다. **경고: CLI는 실행 후 확인을 요청하지 않으므로 숫자에 주의하세요. 가격과 금액을 혼동하면 자금 손실을 초래할 수 있습니다.**

동일한 CLI 설계는 개발자를 위한 예제 코드 목적으로 TypeScript, JavaScript, Python 및 PHP에서 구현되었습니다.
다시 말해, 기존 CLI에는 많은 면에서 동일한 세 가지 구현이 포함되어 있습니다. 이 세 CLI 예제의 코드는 "쉽게 이해할 수 있도록" 의도되었습니다.

CLI의 소스 코드는 다음에서 확인할 수 있습니다:

- https://github.com/ccxt/ccxt/blob/master/examples/ts/cli.ts
- https://github.com/ccxt/ccxt/blob/master/examples/js/cli.js
- https://github.com/ccxt/ccxt/blob/master/examples/py/cli.py
- https://github.com/ccxt/ccxt/blob/master/examples/php/cli.php

## 전역 설치
```bash
npm -g ccxt
```
- `npm update ccxt -g`로 업데이트

## 설치

1. CCXT 저장소 복제:
    ```bash
    git clone https://github.com/ccxt/ccxt
    ```
2. 복제된 저장소로 디렉터리 변경:
    ```bash
    cd ccxt
    ```
3. 의존성 설치:
    - Node.js + npm: `npm install`
    - PHP + Composer: `composer install`

4. 스크립트 실행:
    - Node.js: `node examples/js/cli okx fetchTicker ETH/USDT`
    - Python: `python3 examples/py/cli.py okx fetch_ticker ETH/USDT`
    - PHP: `php -f examples/php/cli.php okx fetch_ticker ETH/USDT`

## 사용법

CLI 스크립트는 최소한 하나의 인수, 즉 거래소 ID([지원되는 거래소 및 해당 ID 목록](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets))가 필요합니다. 거래소 ID를 지정하지 않으면 스크립트는 참조를 위해 모든 거래소 ID 목록을 출력합니다.

실행 시 CLI는 거래소 인스턴스를 생성하고 초기화하며 해당 거래소에서 [exchange.loadMarkets()](/docs/manual#loading-markets)를 호출합니다.
거래소 ID 인수 외에 다른 명령줄 인수를 지정하지 않으면 CLI 스크립트는 거래소 객체의 모든 내용을 출력합니다. 여기에는 모든 메서드, 속성 및 로드된 마켓 목록이 포함됩니다(이 경우 출력이 매우 길 수 있습니다).

일반적으로 거래소 ID 인수 다음에는 호출할 메서드 이름과 해당 인수 또는 검사할 거래소 속성을 지정합니다.

### 거래소 속성 검사

CLI에 거래소 ID만 지정하면 거래소 인스턴스의 내용을 포함하여 모든 속성, 메서드, 마켓, 통화 등을 출력합니다. **경고: 거래소 내용은 매우 크므로 화면에 엄청난 양의 출력이 표시됩니다!**

```bash
node examples/js/cli bybit
```

출력을 적절한 크기로 좁히려면 거래소의 속성 이름을 지정할 수 있습니다.

```bash
node examples/js/cli okx markets  # 로드된 모든 마켓 목록 출력
node examples/js/cli binance currencies  # 로드된 모든 통화 테이블 출력
node examples/js/cli gate options  # 거래소별 옵션 내용 출력
```

다양한 거래소에서 지원되는 메서드를 쉽게 볼 수 있습니다:

```bash
node examples/js/exchange-capabilities | less -S -R
```

### 통합 메서드 호출

통합 메서드 호출은 간단합니다:

```bash
node examples/js/cli okx fetchOrderBook BTC/USDT  # 거래소 인스턴스에서 호가 정보를 가져와 테이블로 출력
node examples/js/cli binance fetchTrades ETH/USDT  # 가장 최근의 공개 거래 목록을 가져와 테이블로 출력
node examples/js/cli bitget fetchTickers  # 티커를 하나씩 가져오기
node examples/js/cli bitget fetchTickers --table  # 티커를 가져와 테이블로 출력
node examples/js/cli bitget fetchTickers '["BTC/USDT","ETH/USDT"]' # 배열 인수에 지정된 티커 가져오기
```

거래소별 매개변수는 모든 통합 메서드의 마지막 인수로 설정할 수 있습니다:

```bash
node examples/js/cli bybit setMarginMode isolated BTC/USDT '{"leverage":"8"}' # 거래소별 레버리지 매개변수를 지정하면서 마진 모드 설정
```

### 거래소별 메서드 호출

샌드박스 모드에서 암시적 API와 거래소별 instId 및 sz 매개변수를 사용하여 okx의 호가 정보를 가져오는 예시입니다:

```bash
node examples/js/cli okx publicGetMarketBooks '{"instId":"BTC-USDT","sz":"3"}' --sandbox
```

## 인증 및 재정의

공개 거래소 API는 인증이 필요하지 않습니다. CLI를 사용하여 공개 API의 모든 메서드를 호출할 수 있습니다. 공개 API와 비공개 API의 차이는 매뉴얼의 [공개/비공개 API](/docs/manual#publicprivate-api)에 설명되어 있습니다.

비공개 API 호출의 경우 기본적으로 CLI 스크립트는 작업 디렉터리의 루트에 있는 `keys.local.json` 파일에서 API 키를 찾고 환경 변수에서 거래소 자격 증명을 조회합니다. 자세한 내용은 다음을 참조하세요: [거래소 자격 증명 추가](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#adding-exchange-credentials).

## 통합 API vs 거래소별 API

CLI는 거래소 인스턴스에 존재하는 모든 가능한 메서드와 속성을 지원합니다.

### jq와 함께 실행
jq 설치 

#### **Ubuntu**
```bash
sudo apt-get install jq
```
#### **Brew (Mac)**
```bash
brew install jq
```
#### **Choco (Windows)**
```bash
choco install jq -y
```

#### 예시
- BTC/USDT의 티커 가격 가져오기: `ccxt binance fetchTicker BTC/USDT | jq '.price'
- 거래의 가격과 수량 확인:
```bash
`ccxt binance watchTrades BTC/USDT --raw | jq -c '[.[] | {price: .price, amount: .amount}]'`
```

- 거래 간 퍼지 검색 (fzf 필요):
```bash
`ccxt binance fetchTrades --raw | jq -c '.[]' | fzf`
```

![render1710459605924](https://github.com/ccxt/ccxt/assets/12142844/39b22383-42d5-4ebd-8b09-617008b7e4f0)
