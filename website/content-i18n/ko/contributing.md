---
title: "기여하기"
description: "GitHub에서 새 이슈를 열 때 안내 사항을 읽고 요청된 세부 정보를 제공해 주시면 더 잘 도와드릴 수 있습니다. 문제 해결 섹션도 읽어보실 수 있습니다."
---

# CCXT 라이브러리에 기여하기

- [질문 또는 이슈 제출 방법](#how-to-submit-an-issue)
- [코드 기여 방법](#how-to-contribute-code)
  - [필요한 환경](#what-you-need-to-have)
  - [알아야 할 사항](#what-you-need-to-know)

## 이슈 제출 방법

[GitHub에서 새 이슈를 열 때](https://github.com/ccxt/ccxt/issues/new/choose) 안내 사항을 읽고 요청된 세부 정보를 제공해 주시면 더 잘 도와드릴 수 있습니다. [문제 해결](/docs/manual#troubleshooting) 섹션도 읽어보실 수 있습니다.


### 취약점 및 중요 이슈 보고

보안 이슈나 심각한 취약점을 발견하셨고 공개적으로 보고하는 것이 위험을 초래할 수 있다면, <a href="mailto:info@ccxt.trade">info@ccxt.trade</a>로 메시지를 보내 주세요.

## 코드 기여 방법

- **[코드가 통합되어 있는지 반드시 확인하세요](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)!**

  **↑ 이것이 가장 중요한 규칙입니다!!!**

- **푸시하기 전에 반드시 로컬에서 다음 명령을 실행하세요: `git config core.hooksPath .git-templates/hooks`**

- **풀 리퀘스트에 다음 파일들을 커밋하지 마세요:**

  - `/build/*` (자동으로 생성됩니다)
  - `/js/*` (TypeScript 버전에서 컴파일됩니다)
  - `/php/*` (기본 클래스 제외)
  - `/python/*` (기본 클래스 제외)
  - `/cs/*` (기본 클래스 제외)
  - `/ccxt.js`
  - `/README.md` (거래소 목록은 자동으로 생성됩니다)
  - `/package.json`
  - `/package.lock`
  - `/wiki/*` (실제 편집 제외, 거래소 목록은 자동으로 생성됩니다)
  - `/dist/ccxt.browser.js` (이것도 자동으로 브라우저화됩니다)


  이 파일들은 생성된 파일이며([아래에서 설명](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support)) 빌드 시 덮어쓰여집니다. 이미 상당히 큰 저장소가 불필요하게 커지지 않도록 커밋하지 말아 주세요. 대부분의 경우 거래소 구현을 편집하려면 단 하나의 소스 파일만 커밋하면 됩니다.

- **원자적 편집을 제출해 주세요. 거래소 하나당 풀 리퀘스트 하나씩, 혼합하지 마세요**
- **`npm run build`를 실행하여 모든 구문 검사를 통과하는지 확인하세요**

## 대기 중인 작업

아래는 현재 라이브러리에서 가장 먼저 구현하고 완전히 **통합**하고자 하는 기능 목록입니다. 이 작업들의 대부분은 이미 진행 중이며 일부 거래소에는 구현되어 있지만 전체 거래소에는 아직 구현되지 않았습니다:

- 마진 거래
- 레버리지
- 파생상품 (선물, 옵션)
- 메인 계정 / 서브 계정
- 조건부 주문 (손절매, 이익 실현)
- 서브 계정과 메인 계정 간 `transfer`
- `fetchTransfer`
- `fetchTransfers`
- `fetchLedger`
- `fetchPositions`
- `closePosition`
- `closePositions`

부분 구현을 기여하고 싶다면 라이브러리 내에서 이미 구현된 사례를 찾아보고 채택된 관행을 따라 주세요.

제안, 제언 또는 개선 사항이 위 작업 목록과 관련이 없다면 제출하기 전에 다음을 확인해 주세요:
1. 대다수의 ccxt 사용자에게 실제로 필요한 것인지
2. 특정 요구사항에 하드코딩된 것이 아닌 범용 솔루션으로 설계되었는지
3. 모든 거래소와 호환되는 일반화된 방식으로 구현되었는지 (거래소별 특화 아님)
4. 이식 가능한지 (지원되는 모든 언어에서 사용 가능한지)
5. 견고한지
6. 수행하는 작업이 명확한지
7. 아무것도 손상시키지 않는지 (메서드를 변경한 경우 편집된 메서드를 호출하는 다른 모든 메서드가 손상되지 않는지 확인)

다음은 ccxt 라이브러리 코드베이스에 기여하기 위한 규칙 모음입니다.

## 필요한 환경

CCXT를 개발하고 CCXT 라이브러리에 코드를 기여할 것이 아니라면 Docker 이미지나 CCXT 저장소가 필요하지 않습니다. 프로젝트 내에서 CCXT를 사용하기만 하려면 매뉴얼(/docs/install)에 설명된 대로 프로젝트 폴더에 일반 패키지로 설치하세요:

- [JavaScript / Node.js / NPM](/docs/install#javascript-npm)

  ```bash
  # JavaScript / Node.js / NPM
  npm install ccxt
  ```

- [Python / PIP](/docs/install#python)

  ```bash
  # Python
  pip install ccxt  # or pip3 install ccxt
  ```

- [PHP / Composer](/docs/install#php)

  ```bash
  # PHP / Composer
  composer install ccxt
  ```

- [C# / Nugget](/docs/install#netc)

  ```bash
  # C# / Nugget
  dotnet add ccxt
  ```

- [Java / Gradle](/docs/install#java)

  ```bash
  # Java (clone and build from source)
  git clone https://github.com/ccxt/ccxt.git --depth 1
  cd ccxt/java && ./gradlew :lib:build
  ```

### Docker 사용

가장 쉬운 방법은 Docker를 사용하여 모든 종속성이 설치된 격리된 빌드 및 테스트 환경을 실행하는 것입니다:

```bash
docker-compose run --rm ccxt
```

이렇게 하면 컨테이너가 빌드되고 셸이 열리며, 여기서 `npm run build` 및 `node run-tests` 명령을 바로 사용할 수 있습니다.

CCXT 폴더는 컨테이너 내부에 매핑되지만, `node_modules` 폴더는 예외입니다. 컨테이너는 자체적인 임시 복사본을 가지므로 로컬에 설치된 모듈에 영향을 주지 않습니다. 즉, 호스트 머신에서 좋아하는 편집기로 소스를 편집하고 실행 중인 컨테이너에서 빌드/테스트할 수 있습니다.

이렇게 하면 빌드 도구와 프로세스를 격리된 상태로 유지할 수 있으며, 호스트 머신에 모든 종속성을 수동으로 설치하는 번거로운 과정을 거치지 않아도 됩니다.

### Docker 없이 사용

#### 종속성

- Git
- [Node.js](https://nodejs.org/en/download/) 8+
- [Python](https://www.python.org/downloads/) 3.5.3+
  - requests (`pip install requests`)
  - [aiohttp](https://docs.aiohttp.org/) (`pip install aiohttp`)
  - [ruff](https://docs.astral.sh/ruff/) (`pip install ruff`)
  - [tox](https://tox.readthedocs.io)
    - pip 통해: `pip install tox`
    - MacOS with [brew](https://brew.sh): `brew install tox`
    - Ubuntu Linux: `apt-get install tox`
- [PHP](https://secure.php.net/downloads.php) 8.1+ 다음 확장이 설치 및 활성화되어 있어야 합니다:
  - cURL
  - iconv
  - mbstring
  - PCRE
  - gmp
- [C#](https://dotnet.microsoft.com/en-us/download) 7.0
- [Java](https://adoptium.net/) 21+ (Gradle 포함)

#### 빌드 단계

```bash
git clone https://github.com/ccxt/ccxt.git
```

```bash
cd ccxt
```

```bash
npm install
```

```bash
npm run build
```

## 알아야 할 사항

### 저장소 구조

저장소의 내용은 다음과 같이 구성되어 있습니다:

```bash
/                          # root directory aka npm module/package folder for Node.js
/.babelrc                  # babel config used for making the ES5 version of the library
/.eslintrc                 # linter
/.gitattributes            # contains linguist settings for language detection in repo
/.gitignore                # ignore it
/.npmignore                # files to exclude from the NPM package
/.travis.yml               # a YAML config for travis-ci (continuous integration)
/CONTRIBUTING.md           # this file
/LICENSE.txt               # MIT
/README.md                 # master markdown for GitHub, npmjs.com, npms.io, yarn and others
/build/                    # build scripts
/build/export-exchanges.js # used to create tables of exchanges in the docs during the build
/build/transpile.js        # the transpilation script
/build/update-badges.js    # a JS script to update badges in the README and in docs
/build/vss.js              # reads single-sourced version from package.json and writes it everywhere
/dist/                     # a folder for the generated browser bundle of CCXT
/ccxt.js                   # entry point for the master JS version of the ccxt library
/ccxt.php                  # entry point for the PHP version of the ccxt library
/js/                       # the JS version of the library
/ts/                       # the TypeScript version of the library
/php/                      # PHP ccxt module/package folder
/cs/                       # C#/dotnet package folder
/python/                   # Python ccxt module/package folder for PyPI
/python/__init__.py        # entry point for the Python version of the ccxt.library
/python/async_support/     # asynchronous version of the ccxt.library for Python 3.5.3+ asyncio
/python/base/              # base code for the Python version of the ccxt library
/python/MANIFEST.in        # a PyPI-package file listing extra package files (license, configs, etc...)
/python/README.md          # a copy of README.md for PyPI
/python/setup.cfg          # wheels config file for the Python package
/python/setup.py           # pip/setuptools script (build/install) for ccxt in Python
/python/tox.ini            # tox config for Python
/examples/                 # self-explanatory
/examples/js               # ...
/examples/php              # ...
/examples/py               # ...
/java/examples/            # Java examples (Gradle module)
/exchanges.cfg             # custom bundle config for including only the exchanges you need
/package.json              # npm package file, also used in setup.py for version single-sourcing
/run-tests.js              # a front-end to run individual tests of all exchanges in all languages (JS/PHP/Python)
/wiki/                     # the source of all docs (edits go here)
```

### 다국어 지원

ccxt 라이브러리는 여러 언어(TypeScript, JavaScript, Python, PHP, C#, Go, Java)로 제공됩니다. 개발자들이 *이식 가능한* 코드를 설계하도록 권장하여, 단일 언어 사용자도 다른 언어의 코드를 읽고 쉽게 이해할 수 있도록 합니다. 이는 라이브러리의 채택을 돕습니다. 주요 목표는 가능한 한 많은 기존 암호화폐 거래소에 일반화되고, 통합되고, 일관되며 견고한 인터페이스를 제공하는 것입니다.

처음에는 모든 언어별 버전이 병렬로, 하지만 서로 독립적으로 개발되었습니다. 그러나 지원되는 모든 언어에서 코드를 일관되게 유지하고 관리하기가 너무 어려워지자 *소스/생성* 프로세스로 전환하기로 결정했습니다. 이제 하나의 언어인 TypeScript로 작성된 단일 소스 버전이 있습니다. 다른 언어별 버전은 소스 버전에서 구문적으로 파생(트랜스파일, 생성)됩니다. 그러나 기여하기 위해 TS나 JS 코더가 될 필요는 없습니다. 이식성 원칙 덕분에 Python 및 PHP 개발자도 소스 버전 개발에 효과적으로 참여할 수 있습니다.

모듈 진입점은 다음과 같습니다:
- `./python/__init__.py` (Python pip 패키지)
- `./python/async/__init__.py` (Python 3.7.0+ ccxt.async_support 서브패키지)
- `./js/ccxt.js` (Node.js npm 패키지)
- `./ts/ccxt.ts` (TypeScript)
- `./dist/ccxt.browser.js` (브라우저 번들)
- `./ccxt.php` (PHP)
- `./java/lib/src/main/java/io/github/ccxt/` (Java)

생성된 버전과 문서는 `npm run build` 명령으로 소스 `ts/src` 폴더에서 트랜스파일됩니다.

### 트랜스파일된(생성된) 파일

- 모든 파생 거래소 클래스는 `tsc`에 의해 TypeScript에서 JavaScript로, 그리고 커스텀 트랜스파일러에 의해 TypeScript에서 PHP 및 Python으로 트랜스파일됩니다. 소스 파일은 언어에 구애받지 않으며, 다른 언어와 줄 단위로 쉽게 매핑될 수 있고 언어 간 호환 가능한 방식으로 작성되어 있습니다. 모든 코더가 읽을 수 있도록 설계되었습니다.
- 기본 클래스는 완전히 트랜스파일되지 않으며 언어별로 특화되어 있어 부분적으로만 트랜스파일됩니다.

#### JavaScript

`ccxt.browser.js`는 소스에서 Babel로 생성됩니다.

#### Python

파생 거래소 클래스를 포함하는 다음 파일들이 TS에서 Python으로 트랜스파일됩니다:

- `ts/[_a-z].ts` → `python/ccxt/async/[_a-z].py`
- `python/ccxt/async[_a-z].py` → `python/ccxt/[_a-z].py` (Python 3 asyncio → Python 동기 트랜스파일 단계)
- `python/ccxt/test/test_async.py` → `python/ccxt/test/test_sync.py` (동기 테스트는 비동기 테스트에서 생성됩니다)

다음 Python 기본 클래스와 파일은 트랜스파일되지 않습니다:

- `python/ccxt/base/*`
- `python/ccxt/async/base/*`

#### PHP

파생 거래소 클래스를 포함하는 다음 파일들이 TS에서 C#으로 트랜스파일됩니다:

- `ts/[_a-z].ts` → `php/[_a-z].php`

다음 PHP 기본 클래스와 파일은 트랜스파일되지 않습니다:

- `php/Exchange.php php/ExchangeError.php php/Precise.php ...`

#### C#

파생 거래소 클래스를 포함하는 다음 파일들이 TS에서 C#으로 트랜스파일됩니다:

- `ts/src/[_a-z].ts` → `cs/src/exchanges/[_a-z].cs`

다음 C# 기본 클래스와 파일은 트랜스파일되지 않습니다:

- `cs/base/*`

#### Java

파생 거래소 클래스를 포함하는 다음 파일들이 TS에서 Java로 트랜스파일됩니다:

- `ts/src/[_a-z].ts` → `java/lib/src/main/java/io/github/ccxt/exchanges/[A-Z]*.java`

다음 Java 기본 클래스와 파일은 트랜스파일되지 않습니다:

- `java/lib/src/main/java/io/github/ccxt/base/*`
- `java/lib/src/main/java/io/github/ccxt/ws/*`
- `java/lib/src/main/java/io/github/ccxt/Exchange.java`

#### Typescript

- 개발은 이 파일들을 사용하여 이루어집니다

### 기본 클래스

``` CONSTRUCTION```

### 파생 거래소 클래스

트랜스파일러는 정규식 기반이며 특정 형식 규칙에 크게 의존합니다. 규칙을 어기면 트랜스파일러가 Python/PHP 클래스를 전혀 생성하지 못하거나 잘못된 Python/PHP 구문을 생성할 수 있습니다.

아래는 JS 코드를 트랜스파일 가능하게 유지하는 방법에 대한 핵심 사항입니다.

빌드 전에 `npm run lint js/your-exchange-implementation.js`로 린터를 사용하세요. 많은 (하지만 전부는 아닌) 문제를 잡아낼 것이므로, 트랜스파일이 실패할 경우 수동 확인이 여전히 필요합니다.

`npm run build` 시 `[TypeError] Cannot read property '1' of null` 예외나 다른 트랜스파일 오류가 발생하면 코드가 다음 규칙을 충족하는지 확인하세요:

- 메서드 내부에 빈 줄을 넣지 마세요
- 항상 Python 스타일 들여쓰기를 사용하세요, 모든 언어에서 그대로 유지됩니다
- 정확히 4칸 공백으로 들여쓰기하세요, 탭은 피하세요
- 각 메서드 사이에 빈 줄을 넣으세요
- 혼합 주석 스타일을 피하세요, JS에서 줄 주석은 이중 슬래시 `//`를 사용하세요
- 여러 줄 주석을 피하세요

트랜스파일 과정이 성공적으로 완료되었지만 잘못된 Python/PHP 구문이 생성된 경우 다음을 확인하세요:

- `(` 또는 `{`와 같은 모든 여는 괄호 앞에 공백이 있어야 합니다!
- 정말 원하더라도 언어별 코드 구문 설탕을 사용하지 마세요
- 모든 맵과 컴프리헨션을 기본 for 루프로 펼치세요
- 재정의된 상속 메서드의 인수를 변경하지 말고, 모든 거래소에서 일관되게 유지하세요
- 모든 작업은 기본 클래스 메서드만 사용하여 수행해야 합니다 (예: 객체를 JSON으로 변환하려면 `this.json ()`을 사용하세요)
- PHP/C 스타일처럼 각 구문 끝에 항상 세미콜론 `;`을 붙이세요
- 모든 연관 키는 어디서나 단일 인용 문자열이어야 합니다 (`array['good']`), 점 표기법을 사용하지 마세요 (`array.bad`)
- `var` 키워드를 절대 사용하지 말고, 상수에는 `const`, 변수에는 `let`을 사용하세요

구조적으로도:

- 다른 기본 메서드가 필요하다면 세 가지 언어 모두에 구현해야 합니다
- 통합 메서드에서 HTTP 요청을 두 번 이상 발행하지 않도록 하세요
- 함수 호출에 참조로 전달된 인수 및 params의 내용을 변경하지 마세요
- 단순하게 유지하고, 한 줄에 하나의 구문만 작성하세요
- 가능하면 문법과 로직을 기본적인 한 줄 표현식으로 줄이세요
- 여러 줄도 괜찮지만, 대괄호가 많이 중첩된 깊은 중첩은 피해야 합니다
- 너무 복잡한 조건문 사용은 피하세요 (무거운 if 중첩)
- 무거운 삼항 조건식은 사용하지 마세요
- 연산자 남용을 피하세요 (**이렇게 하지 마세요**: `a && b || c ? d + 80 : e ** f`)
- `.includes()`는 사용하지 마세요, 대신 `.indexOf()`를 사용하세요!
- 부동소수점에 `.toString()`을 절대 사용하지 마세요: `Number (0.00000001).toString () === '1e-8'`
- 파생 클래스에서 클로저, `a.map` 또는 `a.filter (x => (x === 'foobar'))`는 허용되지 않습니다
- 비연관 배열(리스트)에서 값이 있는지 확인하기 위해 `in` 연산자를 사용하지 마세요
- 사용자 정의 통화 또는 심볼/페어 변환 및 형식 지정을 추가하지 말고, 기존 코드에서 복사하세요
- **존재하지 않는 키에 접근하지 마세요, `array['key'] || {}`는 다른 언어에서 작동하지 않습니다!**

#### 마켓 ID 전송

대부분의 거래소 API 엔드포인트는 요청에 거래소 특정 마켓 심볼 또는 거래 페어 또는 상품을 지정하도록 요구합니다.

**통합 심볼을 거래소에 직접 전송하지 않습니다!** 서로 교환할 수 없습니다! *거래소 특정 마켓 ID*와 *통합 심볼* 사이에는 중요한 차이가 있습니다! 이는 매뉴얼에서 다음과 같이 설명됩니다:

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**절대 이렇게 하지 마세요:**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'pair': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

**이것도 하지 마세요:**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'symbol': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

통합 CCXT 심볼을 거래소에 전송하는 대신, 해당 심볼에 해당하는 거래소 특정 마켓 `id`를 **항상** 사용합니다. 만약 거래소 특정 마켓 ID가 CCXT 통합 심볼과 정확히 같다면 그것은 우연의 일치일 뿐, 통합 CCXT API에서는 절대 그에 의존하지 않습니다.

통합 CCXT 심볼로 거래소 특정 마켓 ID를 얻으려면 다음 메서드를 사용하세요:

- `this.market (symbol)` – `id`, `baseId`, `quoteId` 및 다른 많은 유용한 정보를 포함하는 전체 통합 마켓 구조를 반환합니다
- `this.marketId (symbol)` – 통합 심볼로 마켓의 거래소 특정 `id`만 반환합니다 (다른 정보가 필요하지 않은 경우)

**좋은 예시:**

```javascript
async fetchTicker (symbol, params = {}) {
   const market = this.market (symbol); // the entire market structure
   const request = {
      'pair': market['id'], // good, they may be equal, but often differ, it's ok
   };
   const response = await this.publicGetEndpoint (this.extend (request, params));
   // parse in a unified way...
}
```

```javascript
async fetchTicker (symbol, params = {}) {
   const marketId = this.marketId (symbol); // just the id
   const request = {
      'symbol': marketId, // good, they may be equal, but often differ, it's ok
   };
   const response = await this.publicGetEndpoint (this.extend (request, params));
   // parse in a unified way...
}
```

#### 심볼 파싱

거래소에 요청을 보낼 때 통합 심볼은 위에서 보여준 것처럼 거래소 특정 마켓 `id`로 _"변환"_되어야 합니다. 반대 방향도 마찬가지입니다 – 거래소 응답을 받을 때 내부에 거래소 특정 마켓 `id`가 있으며 이를 통합 CCXT 심볼로 _"다시 변환"_해야 합니다.

**통합 구조에 거래소 특정 마켓 `id`를 직접 넣지 않습니다!** 심볼과 ID를 자유롭게 교환할 수 없습니다! *거래소 특정 마켓 ID*와 *통합 심볼* 사이에는 중요한 차이가 있습니다! 이는 매뉴얼에서 다음과 같이 설명됩니다:

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**절대 이렇게 하지 마세요:**:

```javascript
parseTrade (trade, market = undefined) {
   // parsing code...
   return {
      'info': trade,
      'symbol': trade['pair'], // very bad, returning exchange-specific market-ids in a unified structure!
      // other fields...
   };
}
```

**이것도 하지 마세요**

```javascript
parseTrade (trade, market = undefined) {
   // parsing code...
   return {
      'info': trade,
      'symbol': trade['symbol'], // very bad, returning exchange-specific market-ids in a unified structure!
      // other fields...
   };
}
```

마켓 `id`를 올바르게 처리하려면 `loadMarkets()`를 통해 이 거래소에 캐시된 정보에서 조회해야 합니다:

**좋은 예시:**

```javascript
parseTrade (trade, market = undefined) {
    const marketId = this.safeString (trade, 'pair');
    // safeSymbol is used to parse the market id to a unified symbol
    const symbol = this.safeSymbol (marketId, market);
    return {
       'info': trade,
       'symbol': symbol, // very good, a unified symbol here now
       // other fields...
    };
}
```

#### 딕셔너리 키 접근

JavaScript에서 딕셔너리 키는 두 가지 표기법으로 접근할 수 있습니다:

- `object['key']` (작은따옴표 문자열 키 표기법)
- `object.key` (프로퍼티 표기법)

두 방법은 거의 동일하게 작동하며, JavaScript 코드 실행 시 하나가 다른 하나로 암묵적으로 변환됩니다.

위의 방식은 JavaScript에서는 작동하지만, **Python이나 PHP에서는 작동하지 않습니다**. 대부분의 언어에서 연관 딕셔너리 키는 프로퍼티와 동일한 방식으로 처리되지 않습니다. 따라서 Python에서 `object.key`는 `object['key']`와 같지 않습니다. PHP에서도 `$object->key`는 `$object['key']`와 같지 않습니다. 연관 키와 프로퍼티를 구분하는 언어들은 두 가지에 대해 서로 다른 표기법을 사용합니다.

코드를 변환 가능하게 유지하려면, 이 간단한 규칙을 기억하세요: *이 라이브러리 전체에서 모든 언어의 모든 연관 딕셔너리 키 접근에는 항상 작은따옴표 문자열 키 표기법 `object['key']`를 사용하세요!*

#### `safe` 메서드로 입력 검증

JavaScript는 다른 언어보다 덜 엄격합니다. 다른 언어에서는 예외를 발생시킬 존재하지 않는 키의 역참조 시도를 허용합니다:

```javascript
// JavaScript

const someObject = {}

if (someObject['nonExistentKey']) {
    // the body of this conditional will not execute in JavaScript
    // because someObject['nonExistentKey'] === undefined === false
    // but JavaScript will not throw an exception on the if-clause
}
```

그러나 *"기본값으로 undefined 값"*을 사용하는 위의 로직은 Python이나 PHP에서 작동하지 않습니다.

```python
# Python
some_dictionary = {}

# breaks
if some_dictionary['nonExistentKey']:
    # in Python the attempt to dereference the nonExistentKey value
    # will throw a standard built-in KeyError exception

# works
if 'nonExistentKey' in some_dictionary and some_dictionary['nonExistentKey']:
    # this is a way to check if the key exists before accessing the value

# also works
if some_dictionary.get('nonExistentKey'):
    # another a way to check if the key exists before accessing the value...
```

대부분의 언어는 객체에서 존재하지 않는 키에 접근하려는 시도를 허용하지 않습니다.

위의 이유로, 변환된 JS 파일에서 **절대 이렇게 하지 마세요**:

```javascript
// JavaScript
const value = object['key'] || other_value; // will not work in Python or PHP!
if (object['key'] || other_value) { /* will not work in Python or PHP! */ }
```

따라서 `safe*` 함수 계열이 있습니다:

- `safeInteger (object, key, default)`, `safeInteger2 (object, key1, key2, default)` – 밀리초 단위 타임스탬프 파싱용
- `safeNumber (object, key, default)`, `safeNumber2 (object, key1, key2, default)` – 수량, 가격, 비용 파싱용
- `safeString (object, key, default)`, `safeString2 (object, key1, key2, default)` – ID, 유형, 상태 파싱용
- `safeStringLower (object, key, default)`, `safeStringLower2 (object, key1, key2, default)` – 파싱 후 소문자 변환용
- `safeStringUpper (object, key, default)`, `safeStringUpper2 (object, key1, key2, default)` – 파싱 후 대문자 변환용
- `safeBool(object, key, default)` - 딕셔너리 및 배열/리스트 내부의 불리언 파싱용
- `safeList(object, key, default)` - 딕셔너리 및 배열/리스트 내부의 리스트/배열 파싱용
- `safeDict(object, key, default)` - 딕셔너리 및 배열/리스트 내부의 딕셔너리 파싱용
- `safeValue (object, key, default)`, `safeValue2 (object, key1, key2, default)` – 객체(딕셔너리) 및 배열(리스트) 파싱용
- `safeTimestamp (object, key, default)`, `safeTimestamp2 (object, key1, key2, default)` – 초 단위 UNIX 타임스탬프 파싱용

`safeValue` 함수는 객체 내부의 객체, 객체 내부의 배열, 그리고 불리언 `true/false` 값에 사용됩니다 (**더 이상 사용 권장하지 않음, 반환되는 정확한 유형을 모를 때만 사용하고, 그렇지 않으면** `safeBool/safeDict/safeList`를 사용하세요).

객체 내에서 여러 다른 키를 검색해야 하는 경우, 인수로 키 배열을 받아 임의 개수의 키로 검색할 수 있는 `safeMethodN` 함수 계열을 사용할 수 있습니다.

```javascript
const price = this.safeStringN (object, [ 'key1', 'key2', 'key3' ], defaultValue)
```
위에 나열된 모든 safe 메서드에 대해 대응하는 `safeMethodN`도 있습니다.

위의 safe 함수들은 객체에서 `key` (또는 `key1`, `key2`)의 존재를 확인하고 JS/Python/PHP에 대해 `undefined/None/null` 값을 올바르게 반환합니다. 각 함수는 마지막 인수에서 `undefined/None/null` 대신 반환될 `default` 값도 받습니다.

또는 먼저 키 존재 여부를 확인할 수도 있습니다...

따라서 다음을 변경해야 합니다:

```javascript
if (params['foo'] !== undefined) {
}
```

↓

```javascript
const foo = this.safeValue (params, 'foo');
if (foo !== undefined) {
}
```

또는:

```javascript
if ('foo' in params) {
}
```

#### 인증을 위한 기본 클래스 암호화 메서드 사용

바퀴를 재발명하지 마세요. 항상 암호화에는 기본 클래스 메서드를 사용하세요.

CCXT 라이브러리는 다음과 같은 인증 알고리즘과 암호화 알고리즘을 지원합니다:

- HMAC
- JWT (JSON Web Token)
- RSA
- ECDSA 타원 곡선 암호화
  - NIST P256
  - secp256k1
- OTP 2FA (일회용 비밀번호 2단계 인증)

기본 `Exchange` 클래스는 이 라이브러리의 거의 모든 암호화의 핵심이 되는 여러 메서드를 제공합니다. 파생 거래소 구현체는 암호화를 위해 외부 의존성을 사용해서는 안 되며, 모든 것은 기본 메서드만으로 처리해야 합니다.

- `hash (message, hash = 'md5', digest = 'hex')`
- `hmac (message, secret, hash = 'sha256', digest = 'hex')`
- `jwt (message, secret, hash = 'HS256')`
- `rsa (message, secret, alg = 'RS256')`
- `ecdsa (request, secret, algorithm = 'p256', hash = undefined)`
- `totp (secret)`
- `stringToBase64()`, `base64ToBinary()`, `binaryToBase64()`...

`hash()` 메서드는 다음 `hash` 알고리즘을 지원합니다:

- `'md5'`
- `'sha1'`
- `'sha3'`
- `'sha256'`
- `'sha384'`
- `'sha512'`
- `'keccak'`

`digest` 인코딩 인수는 다음 값을 허용합니다:

- `'hex'`
- `'binary'`

`hmac()` 메서드는 `digest` 인수에 `'base64'`도 지원합니다. 이는 `hmac()`에만 해당하며, 다른 구현체는 `binaryToBase64()`와 함께 `'binary'`를 사용해야 합니다.

#### 타임스탬프

**이 라이브러리 내 모든 통합 구조 전반의 모든 타임스탬프는 _밀리초_ 단위의 정수 UTC 타임스탬프입니다!**

밀리초 타임스탬프로 변환하기 위해 CCXT는 다음 메서드를 구현합니다:

```javascript
const data = {
   'unixTimestampInSeconds': 1565242530,
   'unixTimestampInMilliseconds': 1565242530165,
   'unixTimestampAsDecimal': 1565242530.165,
   'stringInSeconds': '1565242530',
};

// convert to integer if the underlying value is already in milliseconds
const timestamp = this.safeInteger (data, 'unixTimestampInMilliseconds'); // === 1565242530165

// convert to integer and multiply by a thousand if the value has milliseconds after dot
const timestamp = this.safeTimestamp (data, 'unixTimestampAsDecimal'); // === 1565242530165

// convert to integer and multiply by a thousand if the value is a UNIX timestamp in seconds
const timestamp = this.safeTimestamp (data, 'unixTimestampInSeconds'); // === 1565242530000

// convert to integer and multiply by a thousand if the value is in seconds
const timestamp = this.safeTimestamp (data, 'stringInSeconds'); // === 1565242530000
```

#### 배열 길이 처리

JavaScript에서 문자열이나 배열의 길이를 얻는 일반적인 문법은 다음과 같이 `.length` 프로퍼티를 참조하는 것입니다:

```javascript
someArray.length

// or

someString.length
```

이는 문자열과 배열 모두에 작동합니다. Python에서는 비슷한 방식으로 처리됩니다:

```python
len(some_array)

# or

len(some_string)
```

따라서 문자열과 배열 모두 동일한 방식으로 길이에 접근할 수 있으며 둘 다 잘 작동합니다.

그러나 PHP는 다르기 때문에 문자열 길이와 배열 길이에 대한 문법이 다릅니다:

```php
count(some_array);

// or

strlen(some_string); // or mb_strlen
```

변환기는 줄별로 작동하며 코드 분석을 수행하지 않기 때문에, 배열과 문자열을 구별할 수 없어 추가 힌트 없이는 `.length`를 PHP로 올바르게 변환할 수 없습니다. 항상 JS `.length`를 PHP `strlen`으로 변환하며 배열 길이보다 문자열 길이를 우선합니다. 배열 길이를 올바르게 나타내려면 다음과 같이 해야 합니다:

```javascript
const arrayLength = someArray.length;
// the above line ends with .length;
// that ending is a hint for the transpiler that will recognize someArray
// as an array variable in this place, rather than a string type variable
// now we can use arrayLength for the arithmetic
```

`.length;` 줄 끝이 이 역할을 합니다. 배열 `.length`가 문자열 `.length`보다 우선하는 유일한 경우는 `for` 루프입니다. `for` 루프의 헤더에서 `.length`는 항상 배열 길이(문자열 길이가 아닌)를 나타냅니다.

#### 숫자 더하기와 문자열 연결

JS에서 산술 덧셈 `+` 연산자는 문자열과 숫자 모두를 처리합니다. 따라서 `+`로 문자열을 연결하고 `+`로 숫자를 합산할 수 있습니다. Python도 마찬가지입니다. PHP는 다르므로 문자열 연결("점" 연산자 `.`)과 산술 덧셈("플러스" 연산자 `+`)에 대해 서로 다른 연산자를 사용합니다. 다시 말하지만, 변환기는 코드 분석을 수행하지 않기 때문에 JS에서 숫자를 더하는지 문자열을 더하는지 알 수 없습니다. 이는 PHP나 다른 언어로 변환하려 할 때까지는 문제가 없습니다.

라이브러리 전체에서 숫자 표현에 관한 이러한 측면이 있습니다.
매뉴얼에 문서화된 기존 접근 방식은 라이브러리가 수량, 가격, 비용 등에 대해 "어디서나 부동소수점"을 받아들이고 반환한다고 말합니다.
부동소수점 사용은 새로운 사용자를 온보딩하는 가장 쉬운 방법입니다.
이것은 알려진 문제점이 있으며, 부동소수점으로는 정확한 숫자를 표현하는 것이 불가능합니다 (https://0.30000000000000004.com/)

이를 해결하기 위해 어디서나 문자열 기반 표현으로 전환하고 있습니다.
따라서 현재 비파괴적인 방식으로 문자열로 이동하는 과정에 있습니다.

새로운 접근 방식은:

응답 파서에 문자열 기반 표현과 문자열 기반 수학을 위한 내부 레이어를 추가하고 있습니다.
그 내부 레이어는 모든 문자열 기반 수학을 수행하는 데 사용되는 기본 `Precise` 클래스 위에 구축됩니다.
그 클래스는 작동하기 위해 문자열을 필요로 하며 문자열도 반환합니다.
기존의 모든 파서는 처음 만날 때 `Precise` 문자열 기반 표현을 사용하도록 재작성되어야 합니다.
모든 새 파서의 모든 새 코드는 처음부터 `Precise` 문자열 기반 표현으로 작성되어야 합니다.

정확히 무엇을 의미하는지:

이전에 어떻게 했는지 보여주는 의사 코드를 비교해보세요 (설명을 위한 임의의 파싱 코드 예시):

```javascript
const amount = this.safeFloat (order, 'amount');
const remaining = this.safeFloat (order, 'remaining');
if (remaining > 0) {
    status = 'open';
} else {
    status = 'closed';
}
// ...
return {
    // ...
    'amount': amount,
    'remaining': remaining,
    'status': status,
    // ...
};
```

**이제부터** 어떻게 해야 하는지:

```javascript
const amount = this.safeNumber (order, 'amount'); // internal string-layer
const remaining = this.safeString (order, 'remaining'); // internal string-layer
if (Precise.stringGt (remaining, '0')) { // internal string-layer
    status = 'open';
} else {
    status = 'closed';
}
// ...
return {
    // ...
    'amount': amount, // external layer, goes to the user
    'remaining': this.parseNumber (remaining), // external layer, goes to the user
    'status': status,
    // ...
};
```

모든 파서의 새 코드에서는 파서 본문 전체에 걸쳐 문자열 기반 숫자를 사용해야 합니다. 또한 호출자에게 결과를 반환할 때 숫자 값 처리의 마지막 단계로 `parseNumber`를 추가해야 합니다. 위의 두 스니펫은 `safeString` 및 `parseNumber`와 함께 `Precise`의 사용법을 보여주는 예시일 뿐입니다. 실제 주문 파서에는 safeOrder 메서드도 포함됩니다: https://github.com/ccxt/ccxt/pulls?q=safeOrder2.

사용자는 궁극적으로 원하는 parseNumber 구현을 선택할 수 있는 옵션을 갖게 됩니다: 부동소수점을 반환하는 것과 문자열을 반환하는 것. 이렇게 하면 모두가 만족하고 라이브러리는 호환성을 깨지 않으면서 두 가지 방식으로 모두 작동합니다.

기본 규칙은: **`+`는 문자열 연결에만 사용(!)** 하고 **모든 산술 연산은 `Precise`를 사용해야 합니다**.

#### 소수점 숫자를 정밀도에 맞게 형식화하기

이 섹션은 요청 조립 부분을 다룹니다. `.toFixed ()` 메서드는 JavaScript에서 [알려진 반올림 버그](https://www.google.com/search?q=toFixed+bug)를 가지고 있으며, 다른 언어의 다른 반올림 메서드들도 마찬가지입니다. 숫자 형식화를 일관되게 처리하려면 [매뉴얼에 설명된 `decimalToPrecision` 메서드](/docs/manual#methods-for-formatting-decimals)를 사용하세요.

#### 이스케이프된 제어 문자

`"\n"`, `"\t"` 같은 제어 문자가 포함된 문자열을 사용할 때는 항상 단따옴표(`'`)가 아닌 쌍따옴표(`"`)로 감싸야 합니다! 단따옴표 문자열은 TypeScript 외의 많은 언어에서 제어 문자로 파싱되지 않고 그대로 처리됩니다. 따라서 PHP에서 탭과 줄바꿈이 작동하려면 쌍따옴표로 감싸야 합니다 (특히 `sign()` 구현에서).

잘못된 예:

```javascript
const a = 'GET' + method.toLowerCase () + '\n' + path;
const b = 'api\nfoobar.com\n';
```

올바른 예:

```javascript
const a = 'GET' + method.toLowerCase () + "\n" + path; // eslint-disable-line quotes
// eslint-disable-next-line quotes
const b = "api\nfoobar.com\n";
```

**↑ `eslint-*` 주석은 필수입니다!**

#### 삼항 조건문 사용하기

복잡한 삼항(`?:`) 조건문을 사용하지 마세요. **삼항 연산자에서는 항상 괄호를 사용하세요!**

프로그래밍 언어 자체에 연산자 우선순위가 있음에도 불구하고, 트랜스파일러는 정규식 기반이며 코드를 분석하지 않으므로 모든 것을 일반 텍스트로 처리합니다.

괄호는 트랜스파일러에게 조건의 어느 부분이 무엇인지 알려주기 위해 필요합니다. 괄호가 없으면 해당 줄과 개발자의 의도를 이해하기 어렵습니다.

다음은 트랜스파일러를 망가뜨리는 잘못 설계된 코드의 예시입니다:

```javascript
// this is an example of bad code style that will likely break the transpiler
const foo = {
   'bar': 'a' + qux === 'baz' ? this.a () : this.b () + 'b',
};
```

```javascript
// this confuses the transpiler and a human developer as well
const foo = 'bar' + baz + qux ? 'a' : '' + this.c ();
```

해당 부분에 괄호를 추가하는 것이 어느 정도 올바른 해결 방법입니다.

```javascript
const foo = {
   'bar': (qux === 'baz') ? this.a () : this.b (), // much better now
};
```

범용적으로 작동하는 해결 방법은 복잡한 줄을 여러 개의 단순한 줄로 나누는 것입니다. 줄과 조건문이 추가되더라도:

```javascript
// before:
// const foo = {
//    'bar': 'a' + qux === 'baz' ? this.a () : this.b () + 'b',
// };
// ----------------------------------------------------------------------------
// after:
const bar = (qux === 'baz') ? this.a () : this.b ();
const foo = {
   'bar': 'a' + bar + 'b',
};
```

또는 심지어:

```javascript
// before:
// const foo = 'bar' + baz + qux ? 'a' : '' + this.c ();
// ----------------------------------------------------------------------------
// after:
let foo = 'bar' + baz;
if (qux) {
   foo += 'a';
};
foo += this.c ();
```

---

### 새 거래소 통합

**기억하세요:** 이 라이브러리가 사용되는 핵심 이유는 **통합(Unification)**입니다. 새 거래소 파일을 개발할 때 목표는 단순히 구현하는 것이 아니라, 다른 거래소들이 구현된 방식과 동일하게 매우 꼼꼼하고 정밀하며 정확하게 구현하는 것입니다. 이를 위해 다른 거래소의 로직 일부를 복사하고, 새 거래소가 다음 측면에서 매뉴얼을 따르는지 확인해야 합니다:

- 마켓 ID, 거래 쌍 심볼, 통화 ID, 토큰 코드, 심볼 통합 및 `commonCurrencies`는 모든 파싱 메서드(`fetchMarkets`, `fetchCurrencies`, `parseTrade`, `parseOrder`, ...)에서 표준화되어야 합니다
- 모든 통합 API 메서드 이름과 인자는 표준입니다 – 자유롭게 추가하거나 변경할 수 없습니다
- 모든 파서 입력은 [위에서 설명한](#sanitizing-input-with-safe-methods) 대로 `safe`-검증되어야 합니다
- 대량 작업에는 기본 메서드를 사용해야 합니다 (`parseTrades`, `parseOrders`, 복수형 `s`에 주의)
- 가능한 한 많은 기본 기능을 사용하고, 바퀴를 다시 발명하지 마세요
- `fetch` 메서드의 기본 인자 값을 존중하고, `since`와 `limit`가 `undefined`인지 확인하여 해당 경우 거래소에 전송하지 마세요 (이 경우 의도적으로 거래소의 기본값을 사용합니다)
- 일부 인자를 가진 통합 메서드를 구현할 때 – 해당 인자들을 무시하거나 누락할 수 없습니다
- 통합 메서드에서 반환된 모든 구조체는 매뉴얼의 사양을 따라야 합니다
- 모든 API 엔드포인트는 URL에 대체되는 매개변수 지원과 함께 적절히 나열되어야 합니다

새 통합을 위한 다음 문서를 참고하세요: /docs/requirements

새 거래소 통합을 위한 Pull Request의 빠른 병합은 위의 통합 규칙과 표준의 일관성 및 준수 여부에 달려 있습니다. 이 중 하나를 위반하는 것이 Pull Request가 병합되지 않는 핵심 이유입니다.

**다른 거래소에 대한 지원을 추가하거나 특정 거래소의 새 메서드를 구현하려면, 일관된 개선을 이루는 가장 좋은 방법은 예시를 통해 배우는 것입니다. 다른 거래소에서 동일한 것이 어떻게 구현되어 있는지 살펴보고 (인증된 거래소를 권장합니다) 코드 흐름과 스타일을 복사하려고 노력하세요.**

새 거래소 통합을 위한 기본 JSON 스켈레톤은 다음과 같습니다:

```
{
   'id': 'example',
   'name': 'Example Exchange',
   'country': [ 'US', 'EU', 'CN', 'RU' ],
   'rateLimit': 1000,
   'version': '1',
   'comment': 'This comment is optional',
   'urls': {
      'logo': 'https://example.com/image.jpg',
      'api': 'https://api.example.com/api',
      'www': 'https://www.example.com',
      'doc': [
         'https://www.example.com/docs/api',
         'https://www.example.com/docs/howto',
         'https://github.com/example/docs',
      ],
   },
   'api': {
      'public': {
         'get': [
            'endpoint/example',
            'orderbook/{pair}/full',
            '{pair}/ticker',
         ],
      },
      'private': {
         'post': [
            'balance',
         ],
      },
   },
}
```

### 암묵적 API 메서드

각 거래소의 코드에서 API 요청을 만드는 함수가 명시적으로 정의되어 있지 않다는 것을 알 수 있습니다. 이는 거래소 설명 JSON의 `api` 정의가 거래소 서브클래스 내에 *매직 함수* (일명 *부분 함수* 또는 *클로저*)를 생성하는 데 사용되기 때문입니다. 이 암묵적 주입은 `defineRestApi/define_rest_api` 기본 거래소 메서드에 의해 수행됩니다.

각 부분 함수는 `params` 딕셔너리를 받아 API 응답을 반환합니다. 위의 JSON 예시에서 `'endpoint/example'`은 `this.publicGetEndpointExample` 함수의 주입을 가져옵니다. 마찬가지로, `'orderbook/{pair}/full'`은 ``pair`` 매개변수를 받는 `this.publicGetOrderbookPairFull` 함수를 가져옵니다 (역시 `params` 인자로 전달됩니다).

인스턴스화 시 기본 거래소 클래스는 엔드포인트 목록에서 각 URL을 가져와 단어로 분리하고, 부분 구조를 사용하여 해당 단어들로 호출 가능한 함수 이름을 만들어 냅니다. 이 과정은 JS, Python 및 PHP에서도 동일합니다. 여기에도 설명되어 있습니다:

- /docs/manual#api-methods--endpoints
- /docs/manual#implicit-api-methods
- https://github.com/ccxt-dev/ccxt/wiki/Manual#api-method-naming-conventions

``` CONSTRUCTION```

### Docstrings

- 메서드가 params의 속성으로 다른 매개변수를 받을 때 (예: `params['something']`), 해당 매개변수를 params.something으로 docstring에 추가하세요
   - 해당 매개변수가 필수인 경우 타입은 `{str}`, `{int}`, `{etc}`이고, 선택적인 경우 타입은 `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`입니다
- 매개변수의 기본값이 `undefined`이지만 메서드에 `if (symbol === undefined) { throw new ArgumentsRequired('...')}` 같은 내용이 포함된 경우, 해당 매개변수의 타입을 `{str}`, `{int}`, `{etc}`로 설정하세요. 오류가 발생하지 않으면 타입은 `{str|undefined}`, `{int|undefined}`, `{etc|undefined}`입니다
- 메서드가 통합된 매개변수 중 하나를 사용하지 않는 경우, 해당 매개변수의 설명을 `not used by exchange_name.method_name ()` (`exchange_name`과 `method_name`을 실제 거래소 및 메서드 이름으로 교체)으로 설정하세요
- 메서드에 다른 특수 케이스 사용법이 있는 경우, 이를 docstring 설명에 포함시키세요. 이 케이스들은 클래스 docstring에도 포함될 수 있습니다

### 지속적 통합

빌드는 [Travis CI](https://app.travis-ci.com/github/ccxt/ccxt)로 자동화됩니다. Travis CI의 빌드 단계는 [`.travis.yml`](https://github.com/ccxt/ccxt/blob/master/.travis.yml) 파일에 설명되어 있습니다.

Windows 빌드는 [Appveyor](https://ci.appveyor.com/project/ccxt/ccxt)로 자동화됩니다. Appveyor의 빌드 단계는 [`appveyor.yml`](https://github.com/ccxt/ccxt/blob/master/appveyor.yml) 파일에 있습니다.

들어오는 pull request는 CI 서비스에 의해 자동으로 검증됩니다. 빌드 프로세스는 여기서 온라인으로 확인할 수 있습니다: [app.travis-ci.com/github/ccxt/ccxt/builds](https://app.travis-ci.com/github/ccxt/ccxt/builds).

### 로컬 머신에서 테스트 빌드 및 실행하는 방법

### 오프라인 테스트
CCXT에는 새 기능을 추가하거나 버그를 패치할 때 회귀가 발생하지 않도록 보장하는 다양한 오프라인 테스트가 있습니다. 거래소에 대한 접근이 필요하지 않으므로 실행이 간편하고 빠르며, CCXT 개발 흐름의 일부가 되어야 합니다.


기본 테스트(정밀도, 암호화, 오더북 등)와 정적(요청/응답) 테스트가 포함됩니다.

이 테스트들은 `ts/src/test/base/functions/` 폴더에 위치합니다; 내용의 대부분은 모든 언어로 자동 트랜스파일 가능하므로 동일한 코드 규칙이 적용됩니다.

`npm run test-base`와 `npm run-test-ws`를 실행하여 테스트할 수 있습니다

정적 테스트도 오프라인이지만, 통합 ccxt 호출(createOrder/fetchTickers/등)을 에뮬레이션하고 서버 응답을 모의하거나 생성된 HTTP 요청의 유효성을 검증한다는 점에서 다르게 작동합니다.

**Request-static**:
- HTTP 요청을 에뮬레이션하고, 연결을 시도하기 전에 중단하여 url/body가 올바르게 형성되었는지 검증합니다.

폴더: `ts/src/test/static/request/`

이 명령을 실행하고 결과를 올바른 파일에 붙여넣어 정적 요청 테스트를 생성할 수 있습니다 (예: `static/request/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT" --report
````


**Response-static**
- 서버의 모의 응답을 에뮬레이션하고 CCXT가 원시 HTTP 응답을 올바르게 파싱하는지 검증합니다.

폴더: `ts/src/test/static/response/binance.json`

이 명령을 실행하고 결과를 올바른 파일에 붙여넣어 정적 응답 테스트를 생성할 수 있습니다 (예: `static/response/binance.json`)

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT"  undefined 1 --response
````
#### 거래소 자격 증명 추가하기

CCXT에는 공개 API와 인증된 비공개 API 모두에 대한 테스트가 있습니다. 기본적으로 CCXT의 내장 테스트는 코드 저장소에 비공개 API 테스트에 필요한 [API 키](/docs/manual#authentication)가 포함되어 있지 않으므로 공개 API만 테스트합니다. 또한 포함된 비공개 테스트는 어떠한 방식으로도 계정 잔고를 변경하지 않으며, 모든 테스트는 비침습적입니다. 비공개 API 테스트를 활성화하려면 API 키를 구성해야 합니다. `keys.local.json`이나 `env` 변수로 할 수 있습니다.

##### `keys.local.json`에서 API 키와 옵션 구성하기

거래소 API 키는 저장소 내 루트 폴더의 `keys.local.json`에 추가할 수 있습니다. 해당 파일이 없으면 먼저 생성하세요. 해당 파일은 `.gitignore`와 `.npmignore`에 있습니다. `keys.local.json` 파일에 거래소 자격 증명과 다양한 거래소 옵션을 추가할 수 있습니다.

`keys.local.json` 파일 예시:

```json
{
    "okx": {
        "apiKey": "XXX",
        "secret": "YYY"
    },
    "binance": {
        "apiKey": "XXX",
        "secret": "YYY",
        "options": {
            "some-option": "some value"
        }
    },
    // ...
}
```

##### 환경 변수로 API 키 구성하기

`env` 변수로도 API 키를 정의할 수 있습니다:

- https://www.google.com/search?q=set+env+variable+linux
- https://www.google.com/search?q=set+env+variable+mac
- https://www.google.com/search?q=set+env+variable+windows

OS와 셸에서 환경 변수를 설정하는 방법은 해당 문서를 참고하세요. 대부분의 경우 `set` 명령어 또는 `export` 명령어가 작동합니다. `env` 명령어는 이미 설정된 환경 변수를 확인하는 데 도움이 될 수 있습니다.

`env` 변수 예시: `BINANCE_APIKEY`, `BINANCE_SECRET`, `KRAKEN_APIKEY`, `KRAKEN_SECRET` 등.

#### 빌드

처음 빌드하기 전에 Node 의존성을 설치하세요 (Docker 이미지를 사용 중이라면 이 단계를 건너뛰세요):

```
npm install
```

아래 명령은 모든 것을 빌드하고 소스 TS 파일로부터 PHP/Python 버전을 생성합니다:

```
npm run build
```

#### 테스트

다음 명령은 빌드된 생성 파일을 테스트합니다 (모든 거래소, 심볼, 언어 대상):

```
node run-tests
```

특정 언어, 특정 거래소 또는 심볼로 테스트를 제한할 수 있습니다:

```
node run-tests [--js] [--python] [--python-async] [--php] [--php-async] [exchange] [symbol]
```

`node run-tests exchangename`은 `js`, `python`, `python-async`, `php`, `php-async` 5가지 테스트를 시도합니다. 다음과 같이 제어할 수 있습니다:

```
node run-tests exchange --js
node run-tests exchange --js --python-async
node run-tests exchange --js --php
node run-tests exchange --python --python-async
...
```

그러나 실패할 경우, 정확히 무엇이 잘못되었는지 확인하기 위해 한 단계 더 내려가 언어별 테스트를 실행해야 할 수도 있습니다:

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_sync.py exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_sync.php exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

`test_sync`은 단순히 `test_async`의 동기 버전이므로, 대부분의 경우 `test_async.py`와 `test_async.php`만 실행하면 충분합니다:

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

언어별 테스트가 모두 통과하면 node run-tests도 성공합니다. 해당 테스트를 실행하려면 빌드가 성공적으로 완료되었는지 확인해야 합니다.

예를 들어, 다음 명령 중 첫 번째는 라이브러리의 소스 JS 버전(`ccxt.js`)만 테스트합니다. 실행 전에 `npm run build`가 필요하지 않습니다 (변경 사항이 코드를 손상시키는지 빠르게 확인해야 할 때 유용할 수 있습니다):

```bash

node run-tests --js                  # test master ccxt.js, all exchanges

# other examples require the 'npm run build' to run

node run-tests --python              # test Python sync version, all exchanges
node run-tests --php bitfinex        # test Bitfinex with PHP
node run-tests --python-async kraken # test Kraken with Python async test, requires 'npm run build'
```

#### 테스트 작성

테스트를 추가하려면 다음 단계를 따르세요:

- 트랜스파일 가능한 문법을 따라 [ts/tests/Exchange](https://github.com/ccxt/ccxt/tree/master/ts/test/Exchange)에 파일을 생성하세요.
- [ts/src/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/test/tests.ts#L354)의 `runPrivateTests` 또는 `runPublicTests`에 테스트를 추가하거나, CCXT Pro 엔드포인트의 경우 [ts/src/pro/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/pro/test/tests.ts#L121)에 추가하세요.
- `npm run transpile`을 실행하여 JavaScript, Python, PHP에서 테스트 파일을 생성하세요.
- `node run-tests`로 테스트를 호출하세요.

## 저장소에 변경 사항 커밋하기

빌드 프로세스는 트랜스파일된 거래소 파일(예: Python 및 PHP용)에서 많은 변경 사항을 생성합니다. **이를 GitHub에 커밋해서는 안 됩니다. 기본(TS) 파일 변경 사항만 커밋해 주세요**.

## 재정 기여

저희는 [오픈 콜렉티브](https://opencollective.com/ccxt)에서 완전한 투명성으로 재정 기여도 환영합니다.

## 크레딧

### 기여자

이미 ccxt에 기여해 주신 모든 분들께 감사드립니다!

<a href="https://github.com/ccxt/ccxt/graphs/contributors"><img src="https://opencollective.com/ccxt/contributors.svg?width=890" /></a>

### 후원자 (Backers)

모든 후원자분들께 감사드립니다! [[후원자가 되기](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### 지지자 (Supporters)

지지자가 되어 이 프로젝트를 지원하세요. 귀하의 아바타가 웹사이트 링크와 함께 여기에 표시됩니다.

[[지지자가 되기](https://opencollective.com/ccxt#supporter)]

<a href="https://opencollective.com/ccxt/tiers/supporter/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/9/avatar.svg"></a>

### 스폰서 (Sponsors)

모든 스폰서분들께 감사드립니다! (귀하의 회사도 [스폰서가 되어](https://opencollective.com/ccxt#sponsor) 이 오픈소스 프로젝트를 지원해 주시기 바랍니다)

[[스폰서가 되기](https://opencollective.com/ccxt#sponsor)]

<a href="https://opencollective.com/ccxt/tiers/sponsor/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/9/avatar.svg"></a>
