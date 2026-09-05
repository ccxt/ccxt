---
title: "AI 技能"
description: "CCXT 为 Claude Code 和 OpenCode AI 助手提供特定语言的技能包。这些技能帮助开发者通过全面的指南、代码示例和完整的 API 参考，快速学习并在项目中使用 CCXT……"
---

# 适用于 Claude Code 和 OpenCode 的 AI 技能

CCXT 为 Claude Code 和 OpenCode AI 助手提供特定语言的技能包。这些技能通过全面的指南、代码示例和完整的 API 参考，帮助开发者快速学习并在项目中使用 CCXT。

## 什么是 CCXT 技能？

技能是交互式文档模块，AI 编码助手（如 Claude Code 和 OpenCode）可以加载这些模块，在使用 CCXT 时提供上下文感知的帮助。当你询问有关 CCXT 的问题时，AI 助手会使用这些技能来提供准确、详细的答案，并附带可运行的代码示例。

### 包含内容

每个技能包含：

- **完整 API 参考** - 200 余个 CCXT 方法的完整文档及说明
- **安装指南** - 各语言的包管理器命令
- **代码示例** - 嵌入文档中的可运行代码示例，覆盖所有支持的语言
- **REST 和 WebSocket API** - 涵盖标准接口和实时接口
- **最佳实践** - 错误处理、频率限制、身份验证模式
- **常见陷阱** - 各语言需要避免的特定错误
- **故障排查指南** - 常见问题和错误消息的解决方案

## 可用技能

提供五种特定语言的技能：

| 技能 | 语言 | 覆盖范围 |
|-------|----------|----------|
| **ccxt-typescript** | TypeScript/JavaScript | Node.js、浏览器、REST 和 WebSocket |
| **ccxt-python** | Python | 同步、异步、asyncio、REST 和 WebSocket |
| **ccxt-php** | PHP | 同步、异步 (ReactPHP)、REST 和 WebSocket |
| **ccxt-csharp** | C#/.NET | .NET Standard 2.0+、REST 和 WebSocket |
| **ccxt-go** | Go | REST 和 WebSocket |

每个技能都针对特定语言进行了定制，采用适合该语言的惯用写法、命名规范和最佳实践。

## 安装

### 前提条件

你需要在系统上安装 [Claude Code](https://claude.ai/download) 或 [OpenCode](https://opencode.dev/)。

### 快速安装（推荐）

使用 [skills CLI](https://github.com/vercel-labs/skills) 通过单个命令安装所有技能：

```bash
npx skills add ccxt/ccxt
```

支持 Claude Code、Cursor、Copilot、Windsurf、Codex 以及其他 30 余种 AI 编码助手。

### 备选方案：Shell 脚本

```bash
curl -fsSL https://raw.githubusercontent.com/ccxt/ccxt/master/install-skills.sh | bash
```

这将自动下载并安装所有五个 CCXT 技能到你的系统。

### 从代码仓库安装

如果你已克隆 CCXT 代码仓库，可以使用以下选项：

#### 选项 1：交互式安装（推荐）

```bash
./install-skills.sh
```

这将显示一个交互式菜单，你可以选择要安装的技能：

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

#### 选项 2：安装所有技能

```bash
./install-skills.sh --all
```

#### 选项 3：安装特定语言

```bash
# Install single skill
./install-skills.sh --typescript

# Install multiple skills
./install-skills.sh --python --go

# Install with flags
./install-skills.sh --typescript --php --csharp
```

### 安装位置

技能安装到：
- `~/.claude/skills/`（适用于 Claude Code）
- `~/.opencode/skills/`（适用于 OpenCode）

安装脚本会自动检测两者并安装到相应位置。

## 与 AI 助手配合使用

### 调用技能

安装完成后，你可以在 Claude Code 或 OpenCode 中直接调用技能：

```
/ccxt-typescript
/ccxt-python
/ccxt-php
/ccxt-csharp
/ccxt-go
```

AI 助手将加载技能，准备好回答有关该语言中 CCXT 的问题。

### 提问方式

你无需显式调用技能——直接提出自然语言问题即可：

**基本用法：**
- "如何在 Python 中安装 CCXT？"
- "展示如何在 TypeScript 中获取行情"
- "如何在 Go 中使用 API 密钥连接到 Binance？"

**特定功能：**
- "如何在 JavaScript 中创建止损订单？"
- "展示如何在 Python 中监听实时订单簿更新"
- "`fetchTicker` 和 `watchTicker` 有什么区别？"
- "如何在 PHP 中处理 `RateLimitExceeded` 错误？"

**高级主题：**
- "如何在 C# 中为期货交易设置杠杆？"
- "展示如何在 TypeScript 中获取资金费率历史"
- "如何在 Python 中创建追踪止损订单？"
- "在 Go 中处理 WebSocket 重连的最佳方式是什么？"

AI 助手将自动参考相应技能，提供准确的答案和可运行的代码示例。

## 覆盖内容

### 行情数据方法

**行情与价格：**
- `fetchTicker` - 获取单个交易对的行情
- `fetchTickers` - 批量获取多个行情
- `fetchBidsAsks` - 获取最优买卖价
- `fetchMarkPrices` - 获取衍生品标记价格
- `fetchLastPrices` - 获取最新成交价

**订单簿：**
- `fetchOrderBook` - 获取完整订单簿
- `fetchL2OrderBook` - Level 2 订单簿
- `fetchL3OrderBook` - Level 3 订单簿（完整深度）
- WebSocket：`watchOrderBook` - 实时订单簿更新

**成交与历史：**
- `fetchTrades` - 获取公开成交历史
- `fetchMyTrades` - 获取本人成交历史（需认证）
- `fetchOHLCV` - 获取 K 线/OHLCV 数据
- WebSocket：`watchTrades`、`watchOHLCV` - 实时更新

### 交易方法

**订单类型（支持 20 余种）：**
- 市价单：`createMarketOrder`、`createMarketBuyOrder`、`createMarketSellOrder`
- 限价单：`createLimitOrder`、`createLimitBuyOrder`、`createLimitSellOrder`
- 止损单：`createStopLossOrder`、`createStopMarketOrder`、`createStopLimitOrder`
- 止盈单：`createTakeProfitOrder`
- 追踪止损：`createTrailingAmountOrder`、`createTrailingPercentOrder`
- 高级：`createPostOnlyOrder`、`createReduceOnlyOrder`、`createTriggerOrder`
- OCO 订单：`createOrderWithTakeProfitAndStopLoss`

**订单管理：**
- `fetchOrder` - 获取单个订单
- `fetchOrders` - 获取所有订单
- `fetchOpenOrders` - 获取未成交订单
- `fetchClosedOrders` - 获取已关闭订单
- `cancelOrder` - 取消单个订单
- `cancelAllOrders` - 取消所有订单
- `editOrder` - 修改现有订单
- WebSocket：`watchOrders` - 实时订单更新

### 账户与余额

- `fetchBalance` - 获取账户余额
- `fetchAccounts` - 获取子账户
- `fetchLedger` - 获取账本历史
- `fetchDeposits` - 获取充值历史
- `fetchWithdrawals` - 获取提现历史
- `fetchTransactions` - 获取交易历史
- WebSocket：`watchBalance` - 实时余额更新

### 衍生品与期货

**持仓：**
- `fetchPosition` - 获取单个持仓
- `fetchPositions` - 获取所有持仓
- `closePosition` - 平仓
- `setPositionMode` - 设置对冲/单向模式
- WebSocket：`watchPositions` - 实时持仓更新

**保证金与杠杆：**
- `fetchLeverage` - 获取当前杠杆
- `setLeverage` - 设置杠杆
- `setMarginMode` - 设置全仓/逐仓模式
- `borrowMargin` - 借入保证金
- `repayMargin` - 归还借入保证金

**资金费率与结算：**
- `fetchFundingRate` - 获取当前资金费率
- `fetchFundingRateHistory` - 获取资金费率历史
- `fetchFundingHistory` - 获取本人资金费用记录
- `fetchSettlementHistory` - 获取结算历史

**未平仓量与强平：**
- `fetchOpenInterest` - 获取未平仓量
- `fetchOpenInterestHistory` - 获取未平仓量历史
- `fetchLiquidations` - 获取公开强平记录
- `fetchMyLiquidations` - 获取本人强平记录

**期权：**
- `fetchOption` - 获取期权信息
- `fetchOptionChain` - 获取期权链
- `fetchGreeks` - 获取期权希腊值
- `fetchVolatilityHistory` - 获取波动率历史

### 充值与提现

- `fetchDepositAddress` - 获取充值地址
- `createDepositAddress` - 创建新充值地址
- `withdraw` - 提现
- `fetchDeposit` - 获取充值信息
- `fetchWithdrawal` - 获取提现信息

### 手续费与限额

- `fetchTradingFee` - 获取指定交易对的手续费
- `fetchTradingFees` - 获取交易手续费
- `fetchTradingLimits` - 获取交易限额
- `fetchDepositWithdrawFee` - 获取充提手续费

### WebSocket 实时流

所有 `fetch*` 方法都有以 `watch*` 为前缀的 WebSocket 等效方法：

- `watchTicker` - 实时行情更新
- `watchTickers` - 实时多行情更新
- `watchOrderBook` - 实时订单簿更新
- `watchTrades` - 实时成交流
- `watchOHLCV` - 实时 K 线更新
- `watchBalance` - 实时余额更新（需认证）
- `watchOrders` - 实时订单更新（需认证）
- `watchMyTrades` - 实时成交更新（需认证）
- `watchPositions` - 实时持仓更新（需认证）

## 涵盖的最佳实践

### 错误处理

每个技能都讲解了正确的异常处理方式：

- **NetworkError** - 可恢复的错误（带退避重试）
- **ExchangeError** - 不可恢复的错误（不重试）
- **RateLimitExceeded** - 触发频率限制（等待后重试）
- **AuthenticationError** - API 凭证无效
- **InsufficientFunds** - 余额不足
- **InvalidOrder** - 订单参数无效

### 频率限制

技能涵盖内置和手动频率限制两种方式：

```
# Enable built-in rate limiter (recommended)
exchange.enableRateLimit = true
```

### 身份验证

安全的 API 密钥处理：

```
# Use environment variables (recommended)
exchange.apiKey = process.env.EXCHANGE_API_KEY
exchange.secret = process.env.EXCHANGE_SECRET
```

### 方法可用性

检查交易所是否支持某个方法：

```
if (exchange.has['fetchOHLCV']) {
    // Method is supported
}
```

## 故障排查

### 技能未显示

1. 验证安装位置：
```bash
ls ~/.claude/skills/ccxt-*
ls ~/.opencode/skills/ccxt-*
```

2. 重启 Claude Code / OpenCode

3. 重新运行安装：
```bash
./install-skills.sh --all
```

### 出现"Skill Not Found"错误

请确保使用正确的技能名称：
- `/ccxt-typescript`（不是 `/ccxt-ts` 或 `/typescript`）
- `/ccxt-python`（不是 `/ccxt-py` 或 `/python`）
- 以此类推

### AI 助手未使用技能

当你提出与 CCXT 相关的问题时，AI 助手会自动使用技能。除非你希望主动调用，否则无需显式触发。

## 手动安装

如果安装脚本无法正常工作，可以手动安装：

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

## 了解更多

- **技能文档**：CCXT 代码仓库中的 `.claude/skills/README.md`
- **生成策略**：`.claude/skills/GENERATION_STRATEGY.md`
- **CCXT 手册**：[Manual.md](/docs/manual)
- **CCXT Pro**：[ccxt.pro.manual.md](/docs/pro-manual)

## 反馈

如果你有改进技能的建议或发现了问题：

1. 在 [GitHub](https://github.com/ccxt/ccxt/issues) 上提交 issue
2. 在标题中包含"Skills:"
3. 指明是哪个语言技能以及可以改进的地方

技能会随 CCXT 版本发布持续维护和更新。
