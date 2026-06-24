---
title: "贡献指南"
description: "在 github 上提交新 Issue 时请阅读相关说明并提供所需详情，以便我们更好地为您提供帮助。您也可以阅读故障排查章节。"
---

# 向 CCXT 库贡献代码

- [如何提交问题或 Issue](#how-to-submit-an-issue)
- [如何贡献代码](#how-to-contribute-code)
  - [您需要准备什么](#what-you-need-to-have)
  - [您需要了解什么](#what-you-need-to-know)

## 如何提交 Issue

在提交 [新 Issue（github）](https://github.com/ccxt/ccxt/issues/new/choose) 时请阅读相关说明并提供所需详情，以便我们更好地为您提供帮助。您也可以阅读[故障排查](/docs/manual#troubleshooting)章节。


### 报告安全漏洞和严重问题

如果您发现了安全问题或严重漏洞，且公开报告会带来风险，请随时发送邮件至 <a href="mailto:info@ccxt.trade">info@ccxt.trade</a> 与我们联系。

## 如何贡献代码

- **[确保您的代码是统一的](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)！**

  **↑ 这是最重要的规则！！！**

- **在任何推送之前，请确保在本地运行以下命令：`git config core.hooksPath .git-templates/hooks`**

- **请勿在 Pull Request 中提交以下文件：**

  - `/build/*`（这些文件会自动生成）
  - `/js/*`（这些文件由 TypeScript 版本编译生成）
  - `/php/*`（基类文件除外）
  - `/python/*`（基类文件除外）
  - `/cs/*`（基类文件除外）
  - `/ccxt.js`
  - `/README.md`（交易所列表会自动生成）
  - `/package.json`
  - `/package.lock`
  - `/wiki/*`（真实编辑除外，交易所列表会自动生成）
  - `/dist/ccxt.browser.js`（该文件也会自动进行浏览器化处理）


  这些文件是自动生成的（[详见下文](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support)），在构建时会被覆盖。请不要提交它们，以免使已经相当庞大的代码库更加臃肿。大多数情况下，提交一个交易所的修改只需提交一个源文件即可。

- **请提交原子化的修改，每个 Pull Request 只针对一个交易所，不要混合提交**
- **请通过运行 `npm run build` 确保您的代码通过所有语法检查**

## 待办任务

以下是我们希望在库中首先实现并完全**统一**的功能列表。这些任务大多已在进行中，已在部分交易所实现，但尚未覆盖所有交易所：

- 保证金交易
- 杠杆
- 衍生品（期货、期权）
- 主账户 / 子账户
- 条件订单（止损、止盈）
- 子账户与主账户之间的 `transfer`
- `fetchTransfer`
- `fetchTransfers`
- `fetchLedger`
- `fetchPositions`
- `closePosition`
- `closePositions`

如果您希望通过提交部分实现来做出贡献，请务必查阅库中已有的实现示例（已实现的交易所），并遵循已采用的实践方式。

如果您的提案、建议或改进不在上述任务列表范围内，在提交之前请确保它：
1. 确实是大多数 ccxt 用户所需要的
2. 被设计为通用解决方案，而非针对您特定需求的硬编码
3. 以兼容所有交易所的通用方式实现（非特定于某个交易所）
4. 可移植（在所有支持的语言中均可用）
5. 健壮
6. 操作明确
7. 不会破坏其他功能（如果您修改了某个方法，请确保调用该方法的所有其他方法不会受到影响）

以下是向 ccxt 库代码库贡献代码的规则集。

## 您需要准备什么

如果您不打算开发 CCXT 并向 CCXT 库贡献代码，则不需要 Docker 镜像或 CCXT 代码库。如果您只是想在项目中使用 CCXT，只需按照手册（/docs/install）中的说明将其作为常规包安装到项目文件夹中：

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

### 使用 Docker

最简单的方式是使用 Docker 运行一个安装了所有依赖项的隔离构建和测试环境：

```bash
docker-compose run --rm ccxt
```

这将构建一个容器并打开一个 shell，在其中 `npm run build` 和 `node run-tests` 命令应该可以直接运行。

CCXT 文件夹会映射到容器内部，但 `node_modules` 文件夹除外——容器会有自己的临时副本——因此不会影响您本地安装的模块。这意味着您可以在宿主机上使用您喜欢的编辑器编辑源代码，并在运行中的容器内构建/测试它们。

这样您可以保持构建工具和流程的隔离，无需经历将所有这些依赖项手动安装到宿主机上的繁琐过程。

### 不使用 Docker

#### 依赖项

- Git
- [Node.js](https://nodejs.org/en/download/) 8+
- [Python](https://www.python.org/downloads/) 3.5.3+
  - requests (`pip install requests`)
  - [aiohttp](https://docs.aiohttp.org/) (`pip install aiohttp`)
  - [ruff](https://docs.astral.sh/ruff/) (`pip install ruff`)
  - [tox](https://tox.readthedocs.io)
    - 通过 pip：`pip install tox`
    - MacOS 使用 [brew](https://brew.sh)：`brew install tox`
    - Ubuntu Linux：`apt-get install tox`
- [PHP](https://secure.php.net/downloads.php) 8.1+，并安装并启用以下扩展：
  - cURL
  - iconv
  - mbstring
  - PCRE
  - gmp
- [C#](https://dotnet.microsoft.com/en-us/download) 7.0
- [Java](https://adoptium.net/) 21+ 及 Gradle

#### 构建步骤

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

## 您需要了解什么

### 代码库结构

代码库内容的结构如下：

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

### 多语言支持

ccxt 库支持多种不同的语言（TypeScript、JavaScript、Python、PHP、C#、Go 和 Java）。我们鼓励开发者设计*可移植*的代码，使单一语言的用户能够阅读其他语言的代码并轻松理解。这有助于库的推广采用。主要目标是为尽可能多的现有加密货币交易所提供统一、一致且健壮的通用接口。

起初，所有语言特定版本是并行开发的，但相互独立。但当维护并保持所有支持语言之间代码一致性变得过于困难时，我们决定切换到我们所称的*源代码/生成*流程。现在有一个单一的源版本，使用 TypeScript 编写。其他语言特定版本从源版本自动语法派生（转译、生成）。但这并不意味着您必须是 TS 或 JS 开发者才能贡献代码。可移植性原则使 Python 和 PHP 开发者也能有效参与源版本的开发。

模块入口点为：
- `./python/__init__.py` 用于 Python pip 包
- `./python/async/__init__.py` 用于 Python 3.7.0+ ccxt.async_support 子包
- `./js/ccxt.js` 用于 Node.js npm 包
- `./ts/ccxt.ts` 用于 TypeScript
- `./dist/ccxt.browser.js` 用于浏览器包
- `./ccxt.php` 用于 PHP
- `./java/lib/src/main/java/io/github/ccxt/` 用于 Java

生成版本和文档由 `npm run build` 命令从源代码 `ts/src` 文件夹转译生成。

### 转译（生成）文件

- 所有派生交易所类均由 `tsc` 从 TypeScript 转译为 JavaScript，并由我们的自定义转译器从 TypeScript 转译为 PHP 和 Python。源文件与语言无关，可轻松逐行映射到任何其他语言，并以跨语言兼容的方式编写。任何开发者都可以阅读（这是设计目标）。
- 基类**不**完全转译，仅部分转译，因为它们是语言特定的。

#### JavaScript

`ccxt.browser.js` 由 Babel 从源代码生成。

#### Python

以下包含派生交易所类的文件从 TS 转译为 Python：

- `ts/[_a-z].ts` → `python/ccxt/async/[_a-z].py`
- `python/ccxt/async[_a-z].py` → `python/ccxt/[_a-z].py`（Python 3 asyncio → Python 同步转译阶段）
- `python/ccxt/test/test_async.py` → `python/ccxt/test/test_sync.py`（同步测试由异步测试生成）

以下 Python 基类和文件不进行转译：

- `python/ccxt/base/*`
- `python/ccxt/async/base/*`

#### PHP

以下包含派生交易所类的文件从 TS 转译为 C#：

- `ts/[_a-z].ts` → `php/[_a-z].php`

以下 PHP 基类和文件不进行转译：

- `php/Exchange.php php/ExchangeError.php php/Precise.php ...`

#### C#

以下包含派生交易所类的文件从 TS 转译为 C#：

- `ts/src/[_a-z].ts` → `cs/src/exchanges/[_a-z].cs`

以下 C# 基类和文件不进行转译：

- `cs/base/*`

#### Java

以下包含派生交易所类的文件从 TS 转译为 Java：

- `ts/src/[_a-z].ts` → `java/lib/src/main/java/io/github/ccxt/exchanges/[A-Z]*.java`

以下 Java 基类和文件不进行转译：

- `java/lib/src/main/java/io/github/ccxt/base/*`
- `java/lib/src/main/java/io/github/ccxt/ws/*`
- `java/lib/src/main/java/io/github/ccxt/Exchange.java`

#### Typescript

- 开发使用这些文件进行

### 基类

``` CONSTRUCTION```

### 派生交易所类

转译器基于正则表达式，严重依赖特定的格式规则。如果违反这些规则，转译器将无法生成 Python/PHP 类，或者生成格式错误的 Python/PHP 语法。

以下是保持 JS 代码可转译的关键注意事项。

在构建之前，请使用代码检查工具 `npm run lint js/your-exchange-implementation.js`。它会覆盖许多（但不是全部）问题，因此如果转译失败，仍需进行手动检查。

如果在 `npm run build` 时看到 `[TypeError] Cannot read property '1' of null` 异常或任何其他转译错误，请检查您的代码是否满足以下规则：

- 方法内部不要放置空行
- 始终使用 Python 风格的缩进，所有语言均按原样保留
- 使用**恰好** 4 个空格缩进，避免使用制表符
- 每个方法之间放置一个空行
- 避免混合注释风格，在 JS 中使用双斜杠 `//` 作为行注释
- 避免多行注释

如果转译过程成功完成，但生成了不正确的 Python/PHP 语法，请检查以下内容：

- 每个开括号如 `(` 或 `{` 前面应有一个空格！
- 不要使用语言特定的语法糖，即使您非常想用
- 将所有 map 和推导式展开为基本的 for 循环
- 不要更改重写的继承方法的参数，保持所有交易所的统一
- 所有操作应仅使用基类方法完成（例如，使用 `this.json ()` 将对象转换为 json）
- 始终在每条语句末尾加上分号 `;`，如 PHP/C 风格
- 所有关联键必须在所有地方使用单引号字符串（`array['good']`），不要使用点号表示法（`array.bad`）
- 永远不要使用 `var` 关键字，常量使用 `const`，变量使用 `let`

结构方面：

- 如果需要另一个基础方法，则必须在所有三种语言中实现
- 尽量不要在一个统一方法中发出超过一个 HTTP 请求
- 避免更改通过引用传入函数调用的参数和 params 的内容
- 保持简单，一行中不要有超过一条语句
- 尽量将语法和逻辑（如果可能）简化为基本的单行表达式
- 多行是可以的，但应避免使用大量括号进行深层嵌套
- 不要使用过于复杂的条件语句（大量 if 嵌套）
- 不要使用复杂的三元条件
- 避免运算符堆砌（**不要这样做**：`a && b || c ? d + 80 : e ** f`）
- 不要使用 `.includes()`，请改用 `.indexOf()`！
- 永远不要对浮点数使用 `.toString()`：`Number (0.00000001).toString () === '1e-8'`
- 不要使用闭包，`a.map` 或 `a.filter (x => (x === 'foobar'))` 在派生类中不可接受
- 不要使用 `in` 运算符检查值是否在非关联数组（列表）中
- 不要添加自定义货币或符号/交易对的转换和格式化，应从现有代码中复制
- **不要访问不存在的键，`array['key'] || {}` 在其他语言中无法正常工作！**

#### 发送市场 ID

大多数交易所的 API 端点需要在请求中指定特定于交易所的市场符号、交易对或合约。

**我们不直接将统一符号发送给交易所！** 它们是不可互换的！*特定于交易所的市场 ID* 和*统一符号*之间有显著区别！这在手册中有说明：

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**绝对不要这样做：**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'pair': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

**也不要这样做：**

```javascript
async fetchTicker (symbol, params = {}) {
   const request = {
      'symbol': symbol, // very bad, sending unified symbols to the exchange directly
   };
   const response = await this.publicGetEndpoint (request);
   // parse in a unified way...
}
```

我们不将统一的 CCXT 符号发送给交易所，而是**始终**使用与该符号对应的特定于交易所的市场 `id`。如果某个交易所特定的市场 ID 恰好与 CCXT 统一符号相同——那只是巧合，但我们在统一的 CCXT API 中从不依赖这一点。

要通过统一的 CCXT 符号获取特定于交易所的市场 ID，请使用以下方法：

- `this.market (symbol)` – 返回完整的统一市场结构，包含 `id`、`baseId`、`quoteId` 以及许多其他有用信息
- `this.marketId (symbol)` – 通过统一符号仅返回市场的特定于交易所的 `id`（如果不需要其他信息）

**正确示例：**

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

#### 解析符号

向交易所发送请求时，统一符号必须如上所示被"转换"为特定于交易所的市场 `id`。反过来也是如此——当接收到交易所响应时，其中包含特定于交易所的市场 `id`，必须将其"转换回"统一的 CCXT 符号。

**我们不直接将特定于交易所的市场 `id` 放入统一结构中！** 我们不能随意将符号与 ID 互换！*特定于交易所的市场 ID* 和*统一符号*之间有显著区别！这在手册中有说明：

- /docs/manual#markets
- /docs/manual#symbols-and-market-ids

**绝对不要这样做：**：

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

**也不要这样做**

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

为了正确处理市场 `id`，必须在使用 `loadMarkets()` 缓存的交易所信息中查找：

**正确示例：**

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

#### 访问字典键

在 JavaScript 中，字典键可以使用两种表示法访问：

- `object['key']`（单引号字符串键表示法）
- `object.key`（属性表示法）

两者的工作方式几乎相同，在执行 JavaScript 代码时会隐式地相互转换。

虽然上述方式在 JavaScript 中有效，**但在 Python 或 PHP 中将无法工作**。在大多数语言中，关联字典键与属性的处理方式不同。因此，在 Python 中 `object.key` 与 `object['key']` 不同。在 PHP 中，`$object->key` 与 `$object['key']` 也不同。区分关联键和属性的语言使用不同的表示法。

为了保持代码的可转译性，请记住这条简单规则：*在本库所有语言的所有地方，始终使用单引号字符串键表示法 `object['key']` 来访问所有关联字典键！*

#### 使用 `safe` 方法净化输入

JavaScript 比其他语言限制更少。它可以容忍尝试解引用不存在的键，而其他语言会抛出异常：

```javascript
// JavaScript

const someObject = {}

if (someObject['nonExistentKey']) {
    // the body of this conditional will not execute in JavaScript
    // because someObject['nonExistentKey'] === undefined === false
    // but JavaScript will not throw an exception on the if-clause
}
```

然而，上述"默认返回 undefined 值"的逻辑在 Python 或 PHP 中无法工作。

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

大多数语言不允许尝试访问对象中不存在的键。

由于上述原因，在转译的 JS 文件中**永远不要这样做**：

```javascript
// JavaScript
const value = object['key'] || other_value; // will not work in Python or PHP!
if (object['key'] || other_value) { /* will not work in Python or PHP! */ }
```

因此，我们有一系列 `safe*` 函数：

- `safeInteger (object, key, default)`、`safeInteger2 (object, key1, key2, default)` – 用于解析毫秒级时间戳
- `safeNumber (object, key, default)`、`safeNumber2 (object, key1, key2, default)` – 用于解析数量、价格、成本
- `safeString (object, key, default)`、`safeString2 (object, key1, key2, default)` – 用于解析 ID、类型、状态
- `safeStringLower (object, key, default)`、`safeStringLower2 (object, key1, key2, default)` – 用于解析并转换为小写
- `safeStringUpper (object, key, default)`、`safeStringUpper2 (object, key1, key2, default)` – 用于解析并转换为大写
- `safeBool(object, key, default)` - 用于解析字典和数组/列表中的布尔值
- `safeList(object, key, default)` - 用于解析字典和数组/列表中的列表/数组
- `safeDict(object, key, default)` - 用于解析字典和数组/列表中的字典
- `safeValue (object, key, default)`、`safeValue2 (object, key1, key2, default)` – 用于解析对象（字典）和数组（列表）
- `safeTimestamp (object, key, default)`、`safeTimestamp2 (object, key1, key2, default)` – 用于解析以秒为单位的 UNIX 时间戳

`safeValue` 函数用于对象内的对象、对象内的数组以及布尔值 `true/false`（**已弃用，仅在不确定返回类型时使用，否则优先使用** `safeBool/safeDict/safeList`）。

如果需要在对象中搜索多个不同的键，可以使用 `safeMethodN` 函数族，它接受一个键数组作为参数，支持任意数量键的搜索。

```javascript
const price = this.safeStringN (object, [ 'key1', 'key2', 'key3' ], defaultValue)
```
上述每个 safe 方法都有对应的 `safeMethodN` 版本。

上述 safe 函数会检查对象中是否存在 `key`（或 `key1`、`key2`），并会为 JS/Python/PHP 正确返回 `undefined/None/null` 值。每个函数在最后一个参数中也接受 `default` 值，当结果为 `undefined/None/null` 时返回该默认值。

或者，你也可以先检查键是否存在……

所以，你需要将这种写法：

```javascript
if (params['foo'] !== undefined) {
}
```

↓

改为：

```javascript
const foo = this.safeValue (params, 'foo');
if (foo !== undefined) {
}
```

或者：

```javascript
if ('foo' in params) {
}
```

#### 使用基类加密方法进行身份验证

不要重复造轮子。始终使用基类方法进行加密。

CCXT 库支持以下身份验证算法和加密算法：

- HMAC
- JWT（JSON Web Token）
- RSA
- ECDSA 椭圆曲线加密
  - NIST P256
  - secp256k1
- OTP 2FA（一次性密码双因素认证）

基础 `Exchange` 类提供了几个对本库几乎所有加密操作都至关重要的方法。派生的交易所实现不得使用外部依赖来处理加密，所有操作都应仅使用基类方法完成。

- `hash (message, hash = 'md5', digest = 'hex')`
- `hmac (message, secret, hash = 'sha256', digest = 'hex')`
- `jwt (message, secret, hash = 'HS256')`
- `rsa (message, secret, alg = 'RS256')`
- `ecdsa (request, secret, algorithm = 'p256', hash = undefined)`
- `totp (secret)`
- `stringToBase64()`、`base64ToBinary()`、`binaryToBase64()`……

`hash()` 方法支持以下 `hash` 算法：

- `'md5'`
- `'sha1'`
- `'sha3'`
- `'sha256'`
- `'sha384'`
- `'sha512'`
- `'keccak'`

`digest` 编码参数接受以下值：

- `'hex'`
- `'binary'`

`hmac()` 方法还支持 `digest` 参数的 `'base64'` 值。这仅适用于 `hmac()`，其他实现应使用 `'binary'` 配合 `binaryToBase64()`。

#### 时间戳

**本库所有统一结构中的所有时间戳均为_以毫秒为单位_的整数 UTC 时间戳！**

为了转换为毫秒级时间戳，CCXT 实现了以下方法：

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

#### 处理数组长度

在 JavaScript 中，获取字符串或数组长度的常用语法是引用 `.length` 属性，如下所示：

```javascript
someArray.length

// or

someString.length
```

这对字符串和数组都有效。在 Python 中，方式类似：

```python
len(some_array)

# or

len(some_string)
```

因此，字符串和数组的长度均可通过相同方式访问，两者都能正常工作。

然而，PHP 有所不同，字符串长度和数组长度的语法不同：

```php
count(some_array);

// or

strlen(some_string); // or mb_strlen
```

由于转译器逐行工作且不进行代码内省，它无法区分数组和字符串，在没有额外提示的情况下无法正确将 `.length` 转译为 PHP。它始终会将 JS 的 `.length` 转译为 PHP 的 `strlen`，并优先使用字符串长度而非数组长度。为了正确指示数组长度，我们必须这样做：

```javascript
const arrayLength = someArray.length;
// the above line ends with .length;
// that ending is a hint for the transpiler that will recognize someArray
// as an array variable in this place, rather than a string type variable
// now we can use arrayLength for the arithmetic
```

那个 `.length;` 行尾就是关键所在。数组 `.length` 优先于字符串 `.length` 的唯一情况是 `for` 循环。在 `for` 循环的头部，`.length` 始终指数组长度（而非字符串长度）。

#### 数字相加与字符串拼接

在 JS 中，算术加法运算符 `+` 同时处理字符串和数字。因此，它既可以用 `+` 拼接字符串，也可以用 `+` 对数字求和。Python 也是如此。PHP 则不同，它对字符串拼接（"点"运算符 `.`）和算术加法（"加"运算符 `+`）使用不同的运算符。同样，由于转译器不进行代码内省，它无法判断你在 JS 中是在相加数字还是字符串。这在转译到其他语言（无论是 PHP 还是其他语言）时会出现问题。

本库中存在数字表示的这一方面。
手册中记录的现有方法表明，该库在金额、价格、成本等方面将接受并返回"处处使用浮点数"。
使用浮点数是让新用户上手的最简单方式。
这有已知的缺陷，用浮点数表示精确数字是不可能的（https://0.30000000000000004.com/）

为了解决这个问题，我们正在以非破坏性的方式向处处使用字符串表示的方向迁移。

新方法是：

我们在响应解析器中添加了一个基于字符串表示和字符串运算的内部层。
该内部层建立在基础 `Precise` 类之上，用于执行所有基于字符串的数学运算。
该类需要字符串作为输入，并返回字符串。
所有现有的旧解析器在首次遇到时必须重写为使用 `Precise` 基于字符串的表示。
所有新解析器的所有新代码必须从一开始就使用 `Precise` 基于字符串的表示。

具体含义如下：

比较以下伪代码，展示**以前**的做法（此处以某段任意解析代码为例进行说明）：

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

以下是**从现在起**应采用的做法：

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

在所有解析器的新代码中，应在解析器主体内全程使用基于字符串的数字。此外，在向调用方返回结果时，应将 `parseNumber` 作为处理数值的最后一步。上述两段代码仅为示例，展示了 `Precise` 与 `safeString` 及 `parseNumber` 的配合使用方式。订单的实际解析器还涉及 safeOrder 方法：https://github.com/ccxt/ccxt/pulls?q=safeOrder2。

用户最终将可以选择所需的 `parseNumber` 实现版本：返回浮点数的版本或返回字符串的版本。这样每个人都能满意，库也将以非破坏性的方式同时支持两种工作模式。

经验法则是：**`+` 仅用于字符串拼接（！）**，**所有算术运算必须使用 `Precise`**。

#### 将小数格式化为指定精度

本节涵盖请求组装部分。`.toFixed ()` 方法在 JavaScript 中存在[已知的舍入错误](https://www.google.com/search?q=toFixed+bug)，其他语言中的舍入方法同样如此。为了一致地处理数字格式化，请使用[手册中描述的 `decimalToPrecision` 方法](/docs/manual#methods-for-formatting-decimals)。

#### 转义控制字符

使用包含控制字符（如 `"\n"`、`"\t"`）的字符串时，始终用双引号（`"`）而非单引号（`'`）括起来！在 TypeScript 之外的许多语言中，单引号字符串不会解析控制字符，而是按原样处理。因此，为使制表符和换行符在 PHP 中正常工作，需要用双引号括起来（尤其是在 `sign()` 实现中）。

错误示例：

```javascript
const a = 'GET' + method.toLowerCase () + '\n' + path;
const b = 'api\nfoobar.com\n';
```

正确示例：

```javascript
const a = 'GET' + method.toLowerCase () + "\n" + path; // eslint-disable-line quotes
// eslint-disable-next-line quotes
const b = "api\nfoobar.com\n";
```

**↑ `eslint-*` 注释是必须的！**

#### 使用三元条件运算符

不要使用复杂的三元（`?:`）条件运算，**在三元运算符中始终使用括号！**

尽管编程语言本身存在运算符优先级，但转译器是基于正则表达式的，不做代码自省，因此它将所有内容视为纯文本。

括号的作用是向转译器提示条件的哪个部分对应哪个分支。缺少括号时，很难理解该行代码及开发者的意图。

以下是一些设计不当、会破坏转译器的代码示例：

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

为对应部分添加括号是解决此问题的较为正确的方式。

```javascript
const foo = {
   'bar': (qux === 'baz') ? this.a () : this.b (), // much better now
};
```

通用的解决方案是将复杂的一行代码拆分为几行更简单的代码，即使需要增加额外的行数和条件判断：

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

甚至可以这样：

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

### 新交易所集成

**请记住：**本库被使用的核心原因在于**统一化**。开发新的交易所文件时，目标不是随意实现，而是以非常严谨、精确、规范的方式实现，就像其他交易所的实现方式一样。为此，我们需要从其他交易所复制部分逻辑，并确保新交易所在以下方面符合手册的规范：

- 市场 ID、交易对符号、货币 ID、代币代码、符号统一和 `commonCurrencies` 必须在所有解析方法中标准化（`fetchMarkets`、`fetchCurrencies`、`parseTrade`、`parseOrder` 等）
- 所有统一 API 方法名称和参数均为标准——不可随意添加或更改
- 所有解析器输入必须按照[上述说明](#sanitizing-input-with-safe-methods)使用 `safe` 方法进行净化处理
- 对于批量操作，应使用基础方法（`parseTrades`、`parseOrders`，注意复数形式的 `s`）
- 尽可能多地使用基础功能，不要重复造轮子
- 遵守 `fetch` 方法中的默认参数值，检查 `since` 和 `limit` 是否为 `undefined`，若是则不将其发送给交易所——这种情况下我们有意使用交易所的默认值
- 实现带有参数的统一方法时，不能忽略或遗漏任何参数
- 统一方法返回的所有结构必须符合手册中的规范
- 所有 API 端点必须列出，并正确支持 URL 中替换的参数

关于新集成，请参阅以下文档：/docs/requirements

新交易所集成的 Pull Request 能否快速合并，取决于是否与上述统一规则和标准保持一致。违反其中任何一条是 Pull Request 不被合并的主要原因。

**如果您希望添加（支持）另一个交易所，或为特定交易所实现新方法，使其成为一致性改进的最佳方式是从示例中学习。参考其他交易所（推荐认证交易所）的相同功能实现方式，并尝试复制其代码流程和风格。**

新交易所集成的基本 JSON 骨架如下：

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

### 隐式 API 方法

在每个交易所的代码中，您会注意到发起 API 请求的函数并未被显式定义。这是因为交易所描述 JSON 中的 `api` 定义被用于在交易所子类内部创建*魔法函数*（又称*偏函数*或*闭包*）。这种隐式注入由基础交易所方法 `defineRestApi/define_rest_api` 完成。

每个偏函数接受一个 `params` 字典并返回 API 响应。在上面的示例 JSON 中，`'endpoint/example'` 将注入一个 `this.publicGetEndpointExample` 函数。类似地，`'orderbook/{pair}/full'` 将生成一个 `this.publicGetOrderbookPairFull` 函数，该函数接受一个 ``pair`` 参数（同样通过 `params` 参数传入）。

实例化时，基础交易所类从其端点列表中取出每个 URL，将其拆分为单词，然后通过偏函数构造方式将这些单词组合成可调用的函数名。这一过程在 JS、Python 和 PHP 中是相同的。相关描述见：

- /docs/manual#api-methods--endpoints
- /docs/manual#implicit-api-methods
- https://github.com/ccxt-dev/ccxt/wiki/Manual#api-method-naming-conventions

``` CONSTRUCTION```

### 文档字符串

- 当一个方法通过 params 上的属性接受另一个参数时（例如 `params['something']`），请将该参数添加到文档字符串中，写作 params.something
   - 如果该参数是必填的，类型为 `{str}`、`{int}`、`{etc}`；如果是可选的，类型为 `{str|undefined}`、`{int|undefined}`、`{etc|undefined}`
- 当某个参数的默认值为 `undefined`，但方法中包含类似 `if (symbol === undefined) { throw new ArgumentsRequired('...')}` 的代码时，将该参数的类型设置为 `{str}`、`{int}`、`{etc}`。如果没有抛出错误，则类型为 `{str|undefined}`、`{int|undefined}`、`{etc|undefined}`
- 如果某个方法不使用某个统一参数，请将该参数的描述设置为 `not used by exchange_name.method_name ()`（将 `exchange_name` 和 `method_name` 替换为实际的交易所和方法名称）
- 如果该方法存在其他特殊用法，请将其写入文档字符串的描述中，这些情况也可以包含在类的文档字符串中

### 持续集成

构建由 [Travis CI](https://app.travis-ci.com/github/ccxt/ccxt) 自动化完成。Travis CI 的构建步骤在 [`.travis.yml`](https://github.com/ccxt/ccxt/blob/master/.travis.yml) 文件中描述。

Windows 构建由 [Appveyor](https://ci.appveyor.com/project/ccxt/ccxt) 自动化完成。Appveyor 的构建步骤在 [`appveyor.yml`](https://github.com/ccxt/ccxt/blob/master/appveyor.yml) 文件中描述。

传入的 Pull Request 会由 CI 服务自动验证。您可以在此处在线观察构建过程：[app.travis-ci.com/github/ccxt/ccxt/builds](https://app.travis-ci.com/github/ccxt/ccxt/builds)。

### 如何在本地机器上构建和运行测试

### 离线测试
CCXT 提供多种离线测试，有助于确保在添加新功能或修复 Bug 时不引入回归问题。这些测试运行起来轻松快捷（因为不需要访问交易所），因此应将其纳入 CCXT 的开发流程中。


它们包括基础测试（精度、加密、订单簿等）和静态（请求/响应）测试。

这些测试位于 `ts/src/test/base/functions/` 文件夹中；大部分内容可自动转译为每种语言，因此适用相同的代码规范。

您可以通过以下命令运行：`npm run test-base` 和 `npm run-test-ws`

静态测试同样是离线测试，但工作方式不同，因为它们模拟统一的 ccxt 调用（createOrder/fetchTickers 等），并对服务器响应进行模拟，和/或断言生成的 HTTP 请求的有效性。

**请求静态测试**：
- 模拟 HTTP 请求，在尝试连接之前将其拦截，并断言 URL/请求体格式是否正确。

文件夹：`ts/src/test/static/request/`

您可以通过运行以下命令创建静态请求测试，并将结果粘贴到正确的文件中（例如：`static/request/binance.json`）

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT" --report
````


**响应静态测试**
- 模拟来自服务器的响应，并断言 CCXT 能否正确解析原始 HTTP 响应。

文件夹：`ts/src/test/static/response/binance.json`

您可以通过运行以下命令创建静态响应测试，并将结果粘贴到正确的文件中（例如：`static/response/binance.json`）

```bash
node cli.js binance fetchTrades "BTC/USDT:USDT"  undefined 1 --response
````
#### 添加交易所凭证

CCXT 对公共 API 和私有认证 API 均有测试。默认情况下，CCXT 的内置测试仅测试公共 API，因为代码仓库中不包含私有 API 测试所需的 [API 密钥](/docs/manual#authentication)。此外，内置的私有测试不会以任何方式改变账户余额，所有测试均为非侵入性测试。要启用私有 API 测试，必须配置 API 密钥。可以在 `keys.local.json` 中或通过 `env` 变量进行配置。

##### 在 `keys.local.json` 中配置 API 密钥和选项

交易所 API 密钥可以添加到仓库根目录中的 `keys.local.json` 文件中。如果该文件不存在，请先创建它。该文件已被列入 `.gitignore` 和 `.npmignore`。您可以在 `keys.local.json` 文件中为不同的交易所添加凭证和各种选项。

`keys.local.json` 文件示例：

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

##### 将 API 密钥配置为环境变量

您也可以将 API 密钥定义为 `env` 变量：

- https://www.google.com/search?q=set+env+variable+linux
- https://www.google.com/search?q=set+env+variable+mac
- https://www.google.com/search?q=set+env+variable+windows

请查阅您的操作系统和 Shell 文档，了解如何设置环境变量。大多数情况下，`set` 命令或 `export` 命令即可生效。`env` 命令可用于查看已设置的环境变量。

`env` 变量示例：`BINANCE_APIKEY`、`BINANCE_SECRET`、`KRAKEN_APIKEY`、`KRAKEN_SECRET` 等。

#### 构建

在第一次构建之前，请安装 Node 依赖项（如果您使用的是我们的 Docker 镜像，请跳过此步骤）：

```
npm install
```

以下命令将构建所有内容，并从 TS 源文件生成 PHP/Python 版本：

```
npm run build
```

#### 测试

以下命令将测试已构建的生成文件（适用于所有交易所、交易对和语言）：

```
node run-tests
```

您可以将测试限制到特定语言、特定交易所或交易对：

```
node run-tests [--js] [--python] [--python-async] [--php] [--php-async] [exchange] [symbol]
```

`node run-tests exchangename` 将尝试 5 项测试：`js`、`python`、`python-async`、`php`、`php-async`。您可以按如下方式进行控制：

```
node run-tests exchange --js
node run-tests exchange --js --python-async
node run-tests exchange --js --php
node run-tests exchange --python --python-async
...
```

但是，如果测试失败，您可能需要深入一层，运行特定语言的测试以了解具体问题所在：

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_sync.py exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_sync.php exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

`test_sync` 只是 `test_async` 的同步版本，因此在大多数情况下，只需运行 `test_async.py` 和 `test_async.php` 即可：

```
node js/test/test exchange --verbose
python3 python/ccxt/test/test_async.py exchange --verbose
php -f php/test/test_async.php exchange --verbose
```

当所有特定语言的测试都通过后，`node run-tests` 也将成功。为了运行这些测试，请确保构建已成功完成。

例如，以下第一行命令只会测试库的 JS 源版本（`ccxt.js`）。运行它之前不需要执行 `npm run build`（如果您需要快速验证更改是否破坏了代码，这会很有用）：

```bash

node run-tests --js                  # test master ccxt.js, all exchanges

# other examples require the 'npm run build' to run

node run-tests --python              # test Python sync version, all exchanges
node run-tests --php bitfinex        # test Bitfinex with PHP
node run-tests --python-async kraken # test Kraken with Python async test, requires 'npm run build'
```

#### 编写测试

按照以下步骤添加测试：

- 在 [ts/tests/Exchange](https://github.com/ccxt/ccxt/tree/master/ts/test/Exchange) 中创建一个文件，遵循可转译的语法规范。
- 将测试添加到 `runPrivateTests` 或 `runPublicTests`，路径为 [ts/src/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/test/tests.ts#L354)，或者对于 CCXT Pro 端点，添加到 [ts/src/pro/test/tests.ts](https://github.com/ccxt/ccxt/blob/master/ts/src/pro/test/tests.ts#L121)。
- 运行 `npm run transpile` 以生成 JavaScript、Python 和 PHP 的测试文件。
- 调用测试 `node run-tests`

## 向仓库提交更改

构建过程会在转译后的交易所文件中生成许多更改，例如 Python 和 PHP 版本。**请不要将这些文件提交到 GitHub，请仅提交基础 (TS) 文件的更改**。

## 资金贡献

我们也欢迎在我们的[开放集体](https://opencollective.com/ccxt)上以完全透明的方式进行资金贡献。

## 致谢

### 贡献者

感谢所有已经为 ccxt 做出贡献的人！

<a href="https://github.com/ccxt/ccxt/graphs/contributors"><img src="https://opencollective.com/ccxt/contributors.svg?width=890" /></a>

### 支持者

感谢所有支持者！[[成为支持者](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### 赞助商（个人）

通过成为赞助商来支持本项目。您的头像将显示在此处并链接到您的网站。

[[成为赞助商（个人）](https://opencollective.com/ccxt#supporter)]

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

### 企业赞助商

感谢所有企业赞助商！（请让您的公司也通过[成为赞助商](https://opencollective.com/ccxt#sponsor)来支持这个开源项目）

[[成为企业赞助商](https://opencollective.com/ccxt#sponsor)]

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
