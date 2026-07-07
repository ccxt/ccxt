---
title: "FAQ"
description: "如果您的问题像上面那样简短，我们将不予协助。我们不负责教授编程基础。如果您无法阅读并理解…"
---

# 常见问题解答


  ## 我在尝试运行代码，但它不起作用，我该如何修复？

  如果您的问题像上面那样简短，我们将不予协助。我们不负责教授编程基础。如果您无法阅读并理解[手册](/docs)，或者无法精确遵循 [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) 文档中关于如何报告问题的指南，我们也不会提供帮助。请阅读 CONTRIBUTING 指南中关于如何报告问题的部分，并阅读手册。在没有仔细阅读完整手册之前，您不应冒险损害任何人的资金和时间。如果您不习惯阅读大量细节内容，也不应冒任何风险。此外，如果您对所使用的编程语言缺乏信心，有很多更好的地方可以练习编程基础。搜索 `python tutorials`、`js videos`，多玩示例，这是别人攀登学习曲线的方式。如果你想学到东西，没有捷径可走。

  ## 获得帮助需要提供什么？

  提问时请注意：

  - 请先使用搜索按钮查找重复问题！
  - **以 `verbose` 模式发布您的请求和响应！** 在出现问题的那一行之前添加 `exchange.verbose = true`，然后复制粘贴您在屏幕上看到的内容。这在[故障排除](/docs/manual#troubleshooting)部分、[README](https://github.com/ccxt/ccxt/blob/master/README.md) 以及[之前的 issues](https://github.com/ccxt/ccxt/issues) 和 [pull requests](https://github.com/ccxt/ccxt/pulls) 的许多回答中都有提到。没有例外。verbose 输出应同时包含向交易所发出的请求和收到的响应。
  - 包含完整的错误调用栈！
  - 写明您的编程语言**及语言版本号**
  - 写明 CCXT / CCXT Pro 库的版本号
  - 说明是哪个交易所
  - 说明您尝试调用的是哪个方法

  - **发布您的代码**以重现问题。将其写成一个完整的、简短的可运行程序，不要省略行，尽量压缩（5-10 行代码），包括交易所实例化代码。删除所有无关部分，只留下重现问题的核心代码。
    - **不要发布代码或错误的截图，请以纯文本形式发布输出和代码！**
    - **用三个反引号将代码和输出括起来：&#096;&#096;&#096;正确&#096;&#096;&#096;**。
    - 不要将反引号符号 (&#096;) 与引号符号 (\') 混淆：'''错误'''
    - 不要将单个反引号与三个反引号混淆：&#096;错误&#096;

  - **不要发布您的 `apiKey` 和 `secret`！** 请妥善保管（发布前将其删除）！

  ## 我调用一个方法时出现错误，我做错了什么？

  您没有正确报告问题 :) 请帮助社区来帮助您 :) 请阅读并按照以下步骤操作：https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue。再次强调，重现问题所需的代码和 verbose 模式的请求与响应**是必须提供的**。*仅提供错误回溯、或仅提供响应、或仅提供请求、或仅提供代码——都是不够的！*

  ## 我从方法调用中得到了错误的结果，你能帮我吗？

  基本上与上一个问题的回答相同。请**精确**阅读并遵循：https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue。再次强调，重现问题所需的代码和 verbose 模式的请求与响应**是必须提供的**。*仅提供错误回溯、或仅提供响应、或仅提供请求、或仅提供代码——都是不够的！*

  ## 你能在交易所 `bar` 中实现功能 `foo` 吗？

  可以，我们能做到。如果没有其他人先实现，我们会去做的。问这类问题意义不大，因为答案总是肯定的。当有人问我们能否做某事时，问题不在于我们的能力，而归根结底取决于实现所有积累功能请求所需的时间和管理。

  此外，这是一个正在进行中的开源库。这意味着，这个项目旨在由使用它的用户社区共同开发。您所问的不是我们能否实现它，实际上您是在告诉我们去做那个特定的任务，而这不是我们对自愿协作的理解方式。欢迎您的贡献、PR 和提交：https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code。

  我们不对免费开源工作做出承诺或估计。如果您希望加快进度，请随时通过 info@ccxt.trade 与我们联系。

  ## 你们什么时候会为交易所 `bar` 添加功能 `foo`？预计时间是多少？我们什么时候可以期待？

  我们不对开源工作做出承诺或估计。其背后的原因已在上一段中说明。

  ## 你们什么时候会添加对 Issues 中请求的交易所的支持？

  同样，由于上述原因，我们无法承诺添加某个交易所的日期。答案将始终保持不变：_尽快_。

  ## 我需要等多久才能添加某个功能？我需要决定是自己实现还是等待 CCXT 开发团队为我实现。

  请自行实现，不要等待我们。我们会尽快添加。此外，非常欢迎您的贡献：

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

  ## 之前请求的功能 `foo` 进展如何？交易所 `bar` 的实现进展怎样？

  这类问题通常是在浪费时间，因为回答它通常需要太多的上下文切换时间，而且回答这个问题往往比直接用代码实现新功能或新交易所还要耗费更多时间。这个开源项目的进展也是公开的，所以，当您想了解进展时，请查看提交历史。

  ## 这个 PR 的状态如何？有什么更新吗？

  如果它尚未合并，意味着该 PR 包含需要先修复的错误。如果可以直接合并——我们早就合并了，您也不会提出这个问题。不合并 PR 最常见的原因是违反了 [CONTRIBUTING 指南](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)中的某些规定。这些指南应当字面遵守，如果您希望您的 PR 被快速合并，不能跳过其中的任何一行或一个字。不违反指南的代码贡献几乎会立即被合并（通常在数小时内）。

  ## 您能指出错误或告诉我应该编辑 PR 中的哪些内容以便将其合并到 master 分支吗？

  遗憾的是，我们并不总有时间快速列出代码中阻止合并的每一个错误。通常直接去修复错误比解释应该怎么做更容易、更快速。大多数错误已经在 [CONTRIBUTING 指南](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)中概述。主要经验法则是**字面遵守所有指南**。

  ## 你们上传的修复是 TypeScript 版本的，能否也修复 JavaScript / Python / PHP？

  我们的构建系统会自动为我们生成特定于交易所的 JavaScript、Python、PHP、C#、Go 和 Java 代码，这些代码都是从 TypeScript 转译而来的，无需逐一修复每种语言。

  因此，如果在 TypeScript 中修复了，那么 JavaScript NPM、Python pip、PHP Composer、C# NuGet、Go 和 Java 中也同样修复了。自动构建通常需要 15-20 分钟。**在新版本发布后**，使用 `npm`、`pip` 或 `composer` 升级您的版本即可。

  更多信息请参阅：

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support
  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#transpiled-generated-files


  ## 如何创建带有止盈+止损的订单？
  一些交易所支持通过 `createOrder` 附带额外的 `stopLoss` 和 `takeProfit` 子订单——请查看[附加到仓位的止损和止盈订单](/docs/manual#stoploss-and-takeprofit-orders-attached-to-a-position)。
  但是，某些交易所可能不支持该功能，您需要单独运行 `createOrder` 方法来向已开仓位添加条件订单（例如 ***触发订单 | 止损订单 | 止盈订单**）——请查看[条件订单](/docs/manual#conditional-orders)。
  您还可以通过查看 `exchange.has['createOrderWithTakeProfitAndStopLoss']`、`exchange.has['createStopLossOrder']` 和 `exchange.has['createTakeProfitOrder']` 来检查，但它们不如 `.features` 属性精确。

  ## `takeProfit/stopLoss` 和 `takeProfitPrice/stopLossPrice` 订单之间有什么区别

  在 CCXT 中，我们区分几种类型的止盈/止损订单。如果您想在同一请求中下一个开仓订单并同时附加止盈或止损订单（前提是交易所支持此功能），您应该使用 `takeProfit/stopLoss` 语法。
  我们将这些附加的 TP/SL 订单称为**第 3 类**。

  示例：
  ```python
    params = {
      'stopLoss': {
          'triggerPrice': 12.34,  # at what price it will trigger
          'price': 12.00,  # if exchange supports, 'price' param would be limit price (for market orders, don't include this param)
        },
        'takeProfit': {
            # similar params here
        }
    }
    order = exchange.create_order ('SOL/USDT', 'limit', 'buy', 0.5, 13, params)
  ```

  如果交易所不支持这些附加订单，或者您想下一个独立的订单作为止损/止盈订单，则可以下 `stopLossPrice` **或** `takeProfitPrice` 订单，我们将这些独立的 sl/tp 订单称为**第 2 类**。

  示例
  ```python
      symbol = 'ADA/USDT:USDT'
      main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
      tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
      sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
  ```

 ## 追踪订单如何运作？
  一些交易所支持使用 `createOrder` 创建 `trailingPercent` 或 `trailingAmount` 订单——请查看：[追踪订单](/docs/manual#trailing-orders)
  
  追踪订单以百分比或报价金额跟随当前市场价格。订单在一个方向上追踪而不在另一个方向追踪，从而最终可以被执行。执行的订单可以是市价订单或限价订单。追踪订单通常可以用于开仓，也可以将 `reduceOnly` 参数设为 true 以结合使用来平仓。具体允许哪些订单取决于交易所。追踪订单通常支持 `trailingTriggerPrice` 参数，如果当前市场价格穿越该值，它将启动由 `trailingPercent` 或 `trailingAmount` 设置的追踪功能。
  
  某些交易所可能不支持此追踪功能。您可以检查 `.features` 属性。您还可以在文档字符串中检查您正在使用的交易所的 `createOrder` 是否将 `trailingPercent` 或 `trailingAmount` 作为可用参数。某些交易所可能将 `exchange.has['createTrailingPercentOrder']` 或 `exchange.has['createTrailingAmountOrder']` 设为 true，这表示 `createOrder` 中可以使用 `trailingPercent` 或 `trailingAmount` 参数。

创建 `trailingPercent` 和 `trailingAmount` 订单的示例：
  ```python
    params = {
      'trailingPercent': 1.0, # percentage away from the current market price, 1.0 means 1%
      # 'trailingAmount': 100.0, # quote amount away from the current market price, for a SOL/USDT pair this is 100 USDT away from the current market price.
      # 'trailingTriggerPrice': 44500.0, # the price to trigger activating a trailing stop order
      'reduceOnly': True, # set to true if you want to close a position, set to false if you want to open a new position
    }
    order = exchange.create_order ('SOL/USDT:USDT', 'market', 'sell', 0.5, None, params)
  ```
  ```python
    trailingAmount = 100.0
    trailingTriggerPrice = 115.0
    params = {
        'reduceOnly': True,
    }
    order = exchange.create_trailing_amount_order ('SOL/USDT:USDT', 'market', 'sell', 0.5, None, trailingAmount, trailingTriggerPrice, params)
  ```
  ```python
    trailingPercent = 1.0
    trailingTriggerPrice = 115.0
    params = {
        'reduceOnly': False,
    }
    order = exchange.create_trailing_percent_order ('SOL/USDT:USDT', 'limit', 'buy', 0.5, 13, trailingPercent, trailingTriggerPrice, params)
  ```

  ## 如何以花费金额创建现货市价买单？
  要以花费金额创建市价买单，首先需要检查交易所是否支持该功能（`exchange.has['createMarketBuyOrderWithCost']`）。
  如果支持，则可以使用 `createMarketBuyOrderWithCost` 方法。
  示例：
  ```python
  order = await exchange.createMarketBuyOrderWithCost(symbol, cost)
  ```

## `createMarketBuyRequiresPrice` 选项是什么意思？

许多交易所在下现货市价买单时要求金额以报价货币表示（不接受基础货币金额）。在这种情况下，交易所会将 `createMarketBuyRequiresPrice` 选项设置为 `true`。

示例：如果您想通过市价买单购买 BTC/USDT，您需要提供 amount = 5 USDT，而不是 0.000X。我们设置了一个检查来防止错误，明确要求提供价格，因为用户通常会以基础货币提供金额。

因此，默认情况下，如果您执行 `create_order(symbol, 'market,' 'buy,' 10)`，并且交易所设置了该选项，则会抛出错误（`createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false...`）。

如果交易所需要花费金额而用户提供了基础货币金额，我们需要请求额外的参数 **price** 并将其相乘以得到花费金额。如果您了解此行为，可以直接禁用 `createMarketBuyOrderRequiresPrice` 并在 amount 参数中传入花费金额，但禁用该选项并不意味着您可以使用基础货币金额代替报价金额来下单。

如果您执行 `create_order(symbol, 'market', 'buy', 0.001, 20000)`，ccxt 将使用所需价格通过 `0.01*20000` 计算花费金额，并将该值发送给交易所。

如果您希望直接在 amount 参数中提供花费金额，可以执行 `exchange.options['createMarketBuyOrderRequiresPrice'] = False`（您确认 amount 将作为市价买单的花费金额），然后即可执行 `create_order(symbol, 'market', 'buy', 10)`。

这样做基本上是为了防止用户执行 `create_order('SHIB/USDT', market, buy, 1000000)` 时以为自己在尝试购买 100 万个 SHIB，而实际上是在购买价值 100 万 USDT 的 SHIB。因此，默认情况下 ccxt 始终在 amount 参数中接受基础货币。

或者，如果可用，您也可以使用 `createMarketBuyOrderWithCost`/ `createMarketSellOrderWithCost` 函数。

  详见：[市价买单](/docs/manual#market-buys)

  ## 现货交易与合约/永续期货交易有何区别？
  现货交易涉及以立即交割方式买卖金融工具（如加密货币）。它很直接，涉及资产的直接交换。

  而合约交易涉及衍生品合约，双方在未来某一设定日期基于标的资产交换金融工具或现金流。合约通常用于杠杆、投机或对冲，不一定涉及在合约到期前交换标的资产。


  此外，如果您在交易合约，处理的是合约而非直接的基础货币（例如 BTC），因此如果您以 `amount = 1` 创建订单，BTC 中的金额将根据 `contractSize` 而有所不同。您可以通过以下方式查看合约规格：

  ```python
  await exchange.loadMarkets()
  symbol = 'XRP/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  ## 为什么我收到"must be greater than minimum amount precision of 1"的错误？
  这是在为合约市场创建订单时出现的常见错误。当交易所期望 createOrder 的 amount 参数为整数合约数量（1、2、3 等）时会出现此错误。
  
  每份合约价值一定数量的基础资产，由 contractSize 决定。您可以像这样从交易品种的市场结构中获取 contractSize：
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  如果您以 `amount = 1` 创建订单，订单使用的基础资产数量将根据交易品种的 `contractSize` 而有所不同。

  以下是一个公式和示例，用于计算如果您想使用 0.5 个基础资产时 amount 参数应使用的 `contracts` 数量：
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Converting a 0.5 base amount to the number of contracts:
  # Formula: contracts = (base amount / contract size)
  contracts = round(0.5 / market['contractSize'])
  ```

  以下是一个示例，展示 1 份合约的 amount 参数将使用多少基础资产：
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Finding the base amount that will be used with 1 contract:
  # Formula: base amount = (contracts * contract size)
  contracts = 1
  base_amount = (contracts * market['contractSize'])
  ```

  ## 如何下只减仓订单？
  只减仓订单是一种只能减少仓位而不能增加仓位的订单类型。要下只减仓订单，通常使用 createOrder 方法并将 reduceOnly 参数设置为 true。这确保订单只有在减少未平仓头寸规模时才会执行，如果执行该订单会增加仓位规模，则订单将部分成交或完全不成交。


```javascript tab="JavaScript"
const params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```
```python tab="Python"
params = {
    'reduceOnly': True, # set to True if you want to close a position, set to False if you want to open a new position
}
order = exchange.create_order (symbol, type, side, amount, price, params)
```
```php tab="PHP"
$params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```


  ## 如何检查统一方法使用的端点？
  要检查 CCXT 库中统一方法使用的端点，通常需要参考库中您感兴趣的特定交易所实现的源代码。CCXT 中的统一方法抽象了它们与之交互的特定端点的详细信息，因此该信息不会通过库的 API 直接暴露。如需详细检查，您可以在 GitHub 上查看 CCXT 库源代码中特定交易所的方法实现。

  详见：[统一 API](/docs/manual#unified-api)

  ## 资金费率结构中 previousFundingRate、fundingRate 和 nextFundingRate 有何区别？
  资金费率结构中可以返回三种不同的资金费率值：
  1. `previousFundingRate` 指最近已完成的费率。
  2. `fundingRate` 是即将到来的费率。此值会持续变化，直到资金时间过去后成为 previousFundingRate。
  3. `nextFundingRate` 仅在少数交易所上受支持，是即将到来的费率之后的预测资金费率。此值是从现在起两个资金费率后的值。

  举例来说，假设现在是 12:30。`previousFundingRate` 发生在 12:00，我们正在通过查看 `fundingRate` 值来了解即将到来的资金费率。在此示例中，假设为 4 小时间隔，`fundingRate` 将在未来 4:00 发生，而 `nextFundingRate` 是预测在 8:00 发生的费率。

## 如何在 CCXT 中使用 Lighter 交易所？

Lighter 作为 CCXT 的一部分可用，其使用方式与任何其他 CCXT 交易所类似，但有一些特殊之处可能会让部分用户感到困惑，下面我们将详细说明。我们只需设置一些基本凭证和依赖项。


最新升级后，CCXT 简化了认证流程，现在使用 L1 私钥即可。

## 凭证要求

Lighter 需要以下内容：
- `privateKey`：L1 私钥，**必填**
- `accountIndex`（整数）在 `exchange.options` 中：**可选**，如果不可用 CCXT 将自动获取，使用子账户时请设置
- `apiKeyIndex`（整数）在 `exchange.options` 中：**可选**，CCXT 将使用默认值（254）

示例

```python
lighter = ccxt.lighter({
	'privateKey': 'XXXXXXX', # l1 private key
})
```

### 依赖项要求

由于签名算法和结构在所有语言中并非原生支持，CCXT 使用官方分发的二进制文件并与其交互以完成签名过程（通过 FFI/WASM），因此根据您使用的语言，您需要提供该二进制文件的路径。

### Python/C#/PHP 用户：

- 二进制文件可在此处下载：https://github.com/elliottech/lighter-python/tree/main/lighter/signers
- 需要将 `libraryPath` 设置为二进制文件的路径
- 您需要根据您的操作系统/架构选择对应的二进制文件

```python
lighter = ccxt.lighter({
	'options': {
		'libraryPath': 'path/to/lighter-signer-linux-arm64.so',
	}
})
```

### Javascript/Typescript 用户

- CCXT 使用从官方包构建的 WASM 二进制文件，可在此处下载：https://github.com/ccxt/lighter-wasm，或从源码构建
- 您还需要提供 `exec_wasm.js` 的路径，可以从同一仓库下载，或查看本地文件路径（假设已安装 Go）

```javascript
lighter = ccxt.lighter({
	'options': {
		'libraryPath': '/user/cjg/Git/lighter-wasm/lighter.wasm',
		'wasmExecPath': '/opt/homebrew/opt/go/libexec/lib/wasm/wasm_exec.js'
	}
})
```

### GO 用户

- 无需任何额外操作，CCXT 使用官方 GO 包，您只需提供凭证即可


## 如何在 CCXT 中使用 DyDx 交易所？

DyDx 作为 CCXT 的一部分可用，其使用方式与任何其他 CCXT 交易所类似，但有一些特殊之处可能会让部分用户感到困惑，下面我们将详细说明。我们只需设置一些基本凭证和依赖项。

由于当前与签名相关的依赖项要求，该交易所仅在 Python 和 JavaScript 中可用。一旦必要的依赖项完成移植，将引入对其他语言的支持。


## 凭证要求

DyDx 需要以下之一：
- `privateKey`：在 dydx 上使用的 l1 私钥（hex），或者可以在 options 中设置 l2 助记词
- `mnemonic` 在 `exchange.options` 中：用于获取 l2 私钥的 24 个单词，可以在网页 UI 上找到

示例

```python
dydx = ccxt.dydx({
	'privateKey': 'XXXXXXX',
})

# or
dydx = ccxt.dydx({
	'options': {
		'mnemonic': 'test test ...',
	}
})
```

### 依赖项要求

DyDx 需要为 Python 用户安装额外的依赖项。在使用之前，您需要在本地安装 pycryptodom。

```bash
$ pip3 install pycryptodom
```


此外，还需要 protobuf，但它不是 CCXT 的直接依赖项。您需要手动安装：

```
npm install protobufjs // javascript/typescript
pip install "protobuf==5.29.5" // python
```

### 使用方法

使用方式与其他交易所基本一致，但某些行为有所不同。

例如，虽然可以正常下单，但在 dYdX 上取消订单不使用传统的 orderId。相反，dYdX 需要以下额外字段：

- clientOrderId，而非 orderId
- orderFlags（市价单和非限价 GTT 订单为 0，限价 GTT 订单为 64，条件订单为 32），ccxt 默认假设为 64
- goodTillBlockTimeInSeconds（长期订单和条件订单必填；CCXT 默认假设为 30 天）
- subAccountId，ccxt 默认假设为 0

CCXT 为最常见的使用场景提供了合理的默认值；但是，您可能需要根据具体需求覆盖这些值（使用 params 或 options）。

### 如何在 CCXT 中使用 GRVT 交易所？

GRVT 与任何其他 CCXT DEX 的使用方式类似，只需要钱包的 l1 私钥。

实例化 GRVT 交易所的示例：

```
exchange = ccxt.grvt({
	'privateKey': 'XXXXXXX', // the l1 private key (hex)
})
```
注意：通过电子邮件注册的用户，其钱包由 Privy（GRVT 的嵌入式钱包解决方案）提供支持。要导出私钥：

1. 前往 https://home.privy.io
2. 使用在 GRVT 注册时使用的同一电子邮件/Google 账号登录
3. 从那里可以导出私钥

*（如果需要帮助，可以访问 https://support.privy.io）*

CCXT 也是 GRVT 上的构建者，这意味着默认情况下用户通过 CCXT 使用将额外支付 1bps（0.01%），但此费用完全可选，可以通过在 options 中提供 `builderFee: False` 选项来禁用。不过，您的贡献将不胜感激。

```
exchange.options['builderFee'] = False
```
