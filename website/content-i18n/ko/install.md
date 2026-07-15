---
title: "설치"
description: "ccxt 라이브러리를 설치하는 가장 쉬운 방법은 내장된 패키지 관리자를 사용하는 것입니다:"
---

## 설치

ccxt 라이브러리를 설치하는 가장 쉬운 방법은 내장된 패키지 관리자를 사용하는 것입니다:

- [ccxt in **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v15+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3)

이 라이브러리는 최소한의 의존성과 요구 사항을 가진 올인원 모듈 구현으로 제공됩니다:

- [ccxt.js](https://github.com/ccxt/ccxt/blob/master/js/ccxt.js) in JavaScript
- [./python/](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generated from JS)
- [ccxt.php](https://github.com/ccxt/ccxt/blob/master/ccxt.php) in PHP (generated from JS)
- [./java/](https://github.com/ccxt/ccxt/blob/master/java/) in Java (generated from TS)

또한 [ccxt GitHub 저장소](https://github.com/ccxt/ccxt)에서 프로젝트 디렉토리로 클론하고 작업 디렉토리에 해당 환경에 맞는 언어 확장자로 파일을 수동으로 복사할 수 있습니다.

```bash
git clone https://github.com/ccxt/ccxt.git
```

이 라이브러리를 설치하는 대체 방법은 소스에서 사용자 정의 번들을 빌드하는 것입니다. `exchanges.cfg`에서 필요한 거래소를 선택하세요.

### JavaScript (NPM)

ccxt의 JavaScript 버전은 Node와 웹 브라우저 모두에서 작동합니다. ES6와 `async/await` 구문 지원이 필요합니다(Node 15+). Rspack(또는 Webpack)과 Babel로 컴파일할 때는 `babel-loader` 구성에서 [제외되지 않았는지](https://github.com/ccxt-dev/ccxt/issues/225#issuecomment-331582275) 확인하세요.

[npm의 ccxt 암호화폐 거래 라이브러리](http://npmjs.com/package/ccxt)

```bash
npm install ccxt
```

```javascript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript (`<script>` 태그와 함께 사용):

모든 의존성이 포함된 브라우저 번들(선택한 CDN에서 제공):

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js
* unpkg: https://unpkg.com/ccxt@4.5.56/dist/ccxt.browser.min.js
* ccxt: https://cdn.ccxt.com/latest/ccxt.min.js

버전 번호(`@a.b.c` 부분)나 CDN의 /latest/를 제거하여 최신 업데이트된 번들을 얻을 수 있지만, 이는 결국 앱을 중단시킬 수 있으므로 권장하지 않습니다. 또한 해당 CDN 서버의 올바른 작동에 대해 책임지지 않습니다.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js"></script>
```

브라우저의 기본 진입점은 `window.ccxt`이며 전역 ccxt 객체를 생성합니다:

```javascript
console.log (ccxt.exchanges) // print all available exchanges
```

### 사용자 정의 JavaScript 빌드

모든 스크립트와 리소스를 로드하는 데 시간이 걸립니다. 브라우저에서 사용할 때의 문제는 전체 CCXT 라이브러리가 몇 메가바이트에 달해 웹 애플리케이션에는 많은 용량입니다. Node 앱에서도 때때로 중요할 수 있습니다. 따라서 로딩 시간을 줄이기 위해 필요한 거래소만 포함된 CCXT의 사용자 정의 빌드를 만들 수 있습니다. CCXT는 패키지를 더 작게 만들기 위해 rspack을 사용하여 사용되지 않는 코드 경로를 제거합니다.

다음 단계를 따르세요:

```bash
# 1. 저장소 클론

git clone --depth 1 https://github.com/ccxt/ccxt.git

# 2. 클론된 저장소로 이동

cd ccxt

# 3. 의존성 설치

npm install

# 4. 관심 있는 거래소를 위해 exchanges.cfg 편집

echo -e "binance\nokx" > exchanges.cfg

# 5. 라이브러리 빌드

npm run export-exchanges
npm run bundle-browser

# 6a. 웹 애플리케이션을 빌드하는 경우 브라우저 파일을 프로젝트 폴더에 복사

cp dist/ccxt.browser.js path/to/your/html/project

# 6b. Node.js 애플리케이션을 빌드하는 경우 라이브러리 링크
npm link
cd path/to/your/node/project
npm link ccxt

# 6c. 진입점에서 직접 ccxt 가져오기
touch app.js

# app.js 내부

import ccxt from './js/ccxt.js'
console.log (ccxt)

# 이제 다음과 같이 앱을 실행할 수 있습니다

node app.js
```

### Python

[PyPI의 ccxt 알고리딩 라이브러리](https://pypi.python.org/pypi/ccxt)

```bash
pip install ccxt
```

```python
import ccxt
print(ccxt.exchanges) # print a list of all available exchange classes
```

라이브러리는 Python 3.5.3+ 버전에서 asyncio 및 async/await를 사용한 동시 비동기 모드를 지원합니다.

```python
import ccxt.async_support as ccxt # link against the asynchronous version of ccxt
```

### PHP

ccxt의 자동 로드 가능한 버전은 [**Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt)로 설치할 수 있습니다(PHP 8.1+).

소스 코드에서도 설치할 수 있습니다: [**`ccxt.php`**](https://raw.githubusercontent.com/ccxt/ccxt/master/php)

다음과 같은 일반적인 PHP 모듈이 필요합니다:

- cURL
- mbstring (UTF-8 사용 강력 권장)
- PCRE
- iconv
- gmp

```php
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes
```

라이브러리는 PHP 8.1+ 버전에서 [ReactPHP](https://reactphp.org/)의 도구를 사용한 동시 비동기 모드를 지원합니다. 자세한 내용은 [매뉴얼](/docs)을 참조하세요.

### .net/C#

[**Nugget**의 C#의 ccxt](https://www.nuget.org/packages/ccxt) (netstandard 2.0 및 netstandard 2.1)
```c#
using ccxt;
Console.WriteLine(ccxt.Exchanges) // check this later
```

### Java

CCXT의 Java 버전은 Java 21+ 버전이 필요하며 Gradle을 빌드 시스템으로 사용합니다.

소스에서 클론 및 빌드:

```bash
git clone https://github.com/ccxt/ccxt.git --depth 1
cd ccxt/java
./gradlew :lib:build
```

```java
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

Binance exchange = new Binance();
exchange.loadMarkets(false);

Ticker ticker = exchange.fetchTicker("BTC/USDT");
System.out.println(ticker.symbol + " " + ticker.last);
```

예제 실행:

```bash
cd java
./gradlew :examples:run -PmainClass=examples.FetchTicker
./gradlew :examples:run -PmainClass=examples.WatchOrderBook
```

전체 예제 목록은 [java/examples/](https://github.com/ccxt/ccxt/tree/master/java/examples)를 참조하세요.

### Docker

지원되는 모든 언어 및 의존성과 함께 컨테이너에 CCXT를 설치할 수 있습니다. 이는 CCXT에 기여하려는 경우(예: 빌드 스크립트 및 테스트 실행 - 자세한 내용은 [기여](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) 문서 참조) 유용할 수 있습니다.

CCXT를 개발하지 않는다면 Docker 이미지가 필요하지 않습니다. CCXT를 사용하려면 프로젝트에 일반 패키지로 설치하면 됩니다.

`docker-compose` 사용 (클론된 CCXT 저장소에서):

```bash
docker-compose run --rm ccxt
```

또는:

```bash
docker build . --tag ccxt
docker run -it ccxt
```

## 프록시
위치 제한으로 인해 거래소에서 데이터를 얻을 수 없는 경우 [프록시](/docs/manual#proxy) 섹션을 읽어보세요.
