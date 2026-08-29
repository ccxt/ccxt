---
title: "CLI"
description: "CCXT 包含一个示例，允许从命令行调用所有交易所方法和属性。即使不是程序员或编写代码，任何用户也可以使用它！"
---

# CCXT CLI（命令行界面）

CCXT 包含一个示例，允许从命令行调用所有交易所方法和属性。即使不是程序员或编写代码，任何用户也可以使用它！

CLI 接口是 CCXT 中的一个程序，它从命令行获取交易所名称和一些参数，并执行相应的 CCXT 调用，将调用的输出打印回用户。因此，使用 CLI 可以开箱即用 CCXT，无需编写任何代码。

CCXT 命令行界面非常方便和有用，适用于：

- bash API 脚本
- cron/crontab 交易自动化
- 解决代码中的问题
- 调试交易所错误
- 从命令行执行快速加密货币交易
- 为回测聚合数据
- 增加与其他系统和框架的互操作性
- 学习加密货币交易所交易的基础知识
- 学习 CCXT 和 API 的高级方面
- 编写新的交易所集成
- 为 CCXT 贡献代码

对于 CCXT 库用户 - 我们强烈建议至少尝试几次 CLI 以了解其用途。
对于 CCXT 库开发者 - CLI 不仅仅是建议，而是必须的。

了解和理解 CCXT CLI 的最佳方法是通过实验、反复尝试。**警告：CLI 执行您的命令并在启动后不会要求确认，因此请小心数字，混淆数量和价格可能导致资金损失。**

在所有支持的语言中，TypeScript、JavaScript、Python 和 PHP 都实现了相同的 CLI 设计，目的是为开发者提供示例代码。
换句话说，现有的 CLI 包含三个在很多方面相同的实现。这些 CLI 示例中的代码旨在"易于理解"。

CLI 的源代码可在以下位置找到：

- https://github.com/ccxt/ccxt/blob/master/examples/ts/cli.ts
- https://github.com/ccxt/ccxt/blob/master/examples/js/cli.js
- https://github.com/ccxt/ccxt/blob/master/examples/py/cli.py
- https://github.com/ccxt/ccxt/blob/master/examples/php/cli.php

## 全局安装
```bash
npm -g ccxt
```
- 使用 `npm update ccxt -g` 更新

## 安装

1. 克隆 CCXT 仓库：
    ```bash
    git clone https://github.com/ccxt/ccxt
    ```
2. 切换到克隆的仓库目录：
    ```bash
    cd ccxt
    ```
3. 安装依赖：
    - Node.js + npm: `npm install`
    - PHP + Composer: `composer install`

4. 运行脚本：
    - Node.js: `node examples/js/cli okx fetchTicker ETH/USDT`
    - Python: `python3 examples/py/cli.py okx fetch_ticker ETH/USDT`
    - PHP: `php -f examples/php/cli.php okx fetch_ticker ETH/USDT`

## 使用

CLI 脚本至少需要一个参数，即交易所 ID（[支持的交易所及其 ID 列表](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)）。如果不指定交易所 ID，脚本将打印所有交易所 ID 以供参考。

启动时，CLI 将创建并初始化交易所实例，并在该交易所上调用 [exchange.loadMarkets()](/docs/manual#loading-markets)。
如果除了交易所 ID 参数外不指定任何其他命令行参数，则 CLI 脚本将打印出交易所对象的所有内容，包括所有方法、属性和已加载的市场（在这种情况下，输出可能会非常长）。

通常，在交易所 ID 参数之后，会指定要调用的方法名称及其参数，或要检查的交易所实例属性。

### 检查交易所属性

如果您指定的唯一参数是交易所 ID，则它将打印出交易所实例的内容，包括所有属性、方法、市场、货币等。**警告：交易所内容非常庞大，这将向您的屏幕转储大量输出！**

```bash
node examples/js/cli bybit
```

您可以指定交易所的属性名称以将输出缩小到合理的大小。

```bash
node examples/js/cli okx markets  # 将打印出所有已加载的市场
node examples/js/cli binance currencies  # 将打印出所有已加载的货币表
node examples/js/cli gate options  # 将打印出交易所特定的选项
```

您可以轻松查看各种交易所支持的方法：

```bash
node examples/js/exchange-capabilities | less -S -R
```

### 按名称调用统一方法

调用统一方法很简单：

```bash
node examples/js/cli okx fetchOrderBook BTC/USDT  # 将从交易所实例获取订单簿并将其打印为表格
node examples/js/cli binance fetchTrades ETH/USDT  # 将获取最近的公开交易列表并打印表格
node examples/js/cli bitget fetchTickers  # 将逐个获取所有行情
node examples/js/cli bitget fetchTickers --table  # 将获取所有行情并将其打印为表格
node examples/js/cli bitget fetchTickers '["BTC/USDT","ETH/USDT"]' # 将获取指定数组中的行情
```

可以在每个统一方法的最后一个参数中设置交易所特定参数：

```bash
node examples/js/cli bybit setMarginMode isolated BTC/USDT '{"leverage":"8"}' # 在设置杠杆参数的同时设置保证金模式
```

### 按名称调用交易所特定方法

以下是使用隐式 API 和交易所特定的 instId 和 sz 参数在 okx 沙盒模式下获取订单簿的示例：

```bash
node examples/js/cli okx publicGetMarketBooks '{"instId":"BTC-USDT","sz":"3"}' --sandbox
```

## 身份验证和覆盖

公共交易所 API 不需要身份验证。您可以使用 CLI 调用任何公共 API 的方法。公共 API 和私有 API 之间的区别在手册中有描述：[公共/私有 API](/docs/manual#publicprivate-api)。

对于私有 API 调用，默认情况下，CLI 脚本将在克隆到工作目录的仓库根目录中的 `keys.local.json` 文件中查找 API 密钥，并在环境变量中查找交易所凭据。更多详情请参见：[添加交易所凭据](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#adding-exchange-credentials)。

## 统一 API 与交易所特定 API

CLI 支持交易所实例上存在的所有可能的方法和属性。

### 使用 jq 运行
安装 jq 

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

#### 示例
- 获取 BTC/USDT 的行情价格：`ccxt binance fetchTicker BTC/USDT | jq '.price'
- 监视交易的价格和数量：
```bash
`ccxt binance watchTrades BTC/USDT --raw | jq -c '[.[] | {price: .price, amount: .amount}]'`
```

- 模糊搜索交易（需要 fzf）：
```bash
`ccxt binance fetchTrades --raw | jq -c '.[]' | fzf`
```

![render1710459605924](https://github.com/ccxt/ccxt/assets/12142844/39b22383-42d5-4ebd-8b09-617008b7e4f0)
