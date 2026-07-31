---
title: "安装"
description: "安装 ccxt 库最简单的方法是使用内置的包管理器："
---

## 安装

安装 ccxt 库最简单的方法是使用内置的包管理器：

- [ccxt in **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v15+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3)

该库作为一个全功能模块实现，依赖和要求都非常简约：

- [ccxt.js](https://github.com/ccxt/ccxt/blob/master/js/ccxt.js) in JavaScript
- [./python/](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generated from JS)
- [ccxt.php](https://github.com/ccxt/ccxt/blob/master/ccxt.php) in PHP (generated from JS)
- [./java/](https://github.com/ccxt/ccxt/blob/master/java/) in Java (generated from TS)

您也可以从 [ccxt GitHub 仓库](https://github.com/ccxt/ccxt) 克隆到项目目录，并根据您的环境手动复制适当扩展名的文件到工作目录。

```bash
git clone https://github.com/ccxt/ccxt.git
```

另一种安装方法是从源代码构建自定义包。在 `exchanges.cfg` 中选择您需要的交易所。

### JavaScript (NPM)

ccxt 的 JavaScript 版本可同时在 Node 和 Web 浏览器中使用。需要支持 ES6 和 `async/await` 语法（Node 15+）。使用 Rspack（或 Webpack）和 Babel 编译时，请确保在 `babel-loader` 配置中[不排除](https://github.com/ccxt-dev/ccxt/issues/225#issuecomment-331582275)。

[npm 中的 ccxt 加密交易库](http://npmjs.com/package/ccxt)

```bash
npm install ccxt
```

```javascript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript（用于 `<script>` 标签）：

全功能浏览器包（包含依赖），可从您选择的 CDN 获取：

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js
* unpkg: https://unpkg.com/ccxt@4.5.56/dist/ccxt.browser.min.js
* ccxt: https://cdn.ccxt.com/latest/ccxt.min.js

通过删除 URL 中的版本号（`@a.b.c` 部分）或我们 CDN 上的 /latest/ 可以获取实时更新的包 - 但是，我们不建议这样做，因为这可能最终会破坏您的应用。另请注意，我们不对这些 CDN 服务器的正确运行负责。

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@4.5.56/dist/ccxt.browser.min.js"></script>
```

浏览器的默认入口点是 `window.ccxt`，它会创建一个全局 ccxt 对象：

```javascript
console.log (ccxt.exchanges) // print all available exchanges
```

### 自定义 JavaScript 构建

加载所有脚本和资源需要时间。浏览器使用的问题是整个 CCXT 库重达几兆字节，对于 Web 应用来说太大。有时对 Node 应用也是如此。因此，为了缩短加载时间，您可能希望为您的应用制作仅包含所需交易所的自定义 CCXT 构建。CCXT 使用 rspack 移除无效代码路径以使包更小。

按照以下步骤：

```bash
# 1. 克隆仓库

git clone --depth 1 https://github.com/ccxt/ccxt.git

# 2. 进入克隆的仓库

cd ccxt

# 3. 安装依赖

npm install

# 4. 编辑 exchanges.cfg 以选择您感兴趣的交易所

echo -e "binance\nokx" > exchanges.cfg

# 5. 构建库

npm run export-exchanges
npm run bundle-browser

# 6a. 如果是 Web 应用，将浏览器文件复制到项目文件夹

cp dist/ccxt.browser.js path/to/your/html/project

# 6b. 如果是 Node.js 应用，链接库
npm link
cd path/to/your/node/project
npm link ccxt

# 6c. 直接从入口点导入 ccxt
touch app.js

# 在 app.js 中

import ccxt from './js/ccxt.js'
console.log (ccxt)

# 现在可以这样运行您的应用

node app.js
```

### Python

[PyPI 中的 ccxt 算法交易库](https://pypi.python.org/pypi/ccxt)

```bash
pip install ccxt
```

```python
import ccxt
print(ccxt.exchanges) # print a list of all available exchange classes
```

该库支持 Python 3.5.3+ 中的异步并发模式，使用 asyncio 和 async/await

```python
import ccxt.async_support as ccxt # link against the asynchronous version of ccxt
```

### PHP

可以使用 [**Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) 安装可自动加载的 ccxt 版本（PHP 8.1+）。

也可以从源代码安装：[**`ccxt.php`**](https://raw.githubusercontent.com/ccxt/ccxt/master/php)

需要以下常见 PHP 模块：

- cURL
- mbstring（强烈推荐使用 UTF-8）
- PCRE
- iconv
- gmp

```php
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes
```

该库支持使用 [ReactPHP](https://reactphp.org/) 工具在 PHP 8.1+ 中进行并发异步模式。阅读[手册](/docs)了解更多详情。

### .net/C#

[使用 **Nugget** 的 C# 中的 ccxt](https://www.nuget.org/packages/ccxt) (netstandard 2.0 和 netstandard 2.1)
```c#
using ccxt;
Console.WriteLine(ccxt.Exchanges) // check this later
```

### Java

CCXT 的 Java 版本需要 Java 21+ 并使用 Gradle 作为构建系统。

从源代码克隆和构建：

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

运行示例：

```bash
cd java
./gradlew :examples:run -PmainClass=examples.FetchTicker
./gradlew :examples:run -PmainClass=examples.WatchOrderBook
```

查看 [java/examples/](https://github.com/ccxt/ccxt/tree/master/java/examples) 获取完整的示例列表。

### Docker

您可以在容器中安装 CCXT 以及所有支持的语言和依赖项。如果您想为 CCXT 做贡献（例如运行构建脚本和测试 - 请参阅[贡献](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md)文档了解详情），这可能很有用。

如果您只是想使用 CCXT，则不需要 Docker 镜像。只需将其作为常规包安装到您的项目中即可。

使用 `docker-compose`（在克隆的 CCXT 仓库中）：

```bash
docker-compose run --rm ccxt
```

或者：

```bash
docker build . --tag ccxt
docker run -it ccxt
```

## 代理
如果由于位置限制无法从交易所获取数据，请阅读[代理](/docs/manual#proxy)部分。
