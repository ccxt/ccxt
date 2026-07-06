---
title: "CCXT 文档"
description: "CCXT — 一个统一的 API，支持 100+ 加密货币交易所，适用于 JavaScript、Python、PHP、C#、Go 和 Java。"
---

欢迎来到 ccxt wiki！

> 我们建议访问 /docs/manual 上的完整文档

## 常规信息

- [支持的交易所](/docs/exchange-markets)
- [按国家分类的交易所](/docs/exchange-markets-by-country)

## 安装方法

- [安装](/docs/install)
  - [Node.js](/docs/install#nodejs)
  - [Python](/docs/install#python)
  - [PHP](/docs/install#php)
  - [C#](/docs/install#netc)
  - [Go](/docs/install#go)
  - [Java](/docs/install#java)
  - [Web 浏览器](/docs/install#web-browsers)
  - [Docker](/docs/install#docker)
  - [代理](/docs/install#proxy)
  - [CORS (Access-Control-Allow-Origin)](/docs/install#cors-access-control-allow-origin)

## 使用方法

- [用户手册](/docs/manual)
  - [架构概述](/docs/manual#overview)
  - [实例化](/docs/manual#instantiation)
  - [交易所结构](/docs/manual#exchange-structure)
  - [交易所属性](/docs/manual#exchange-properties)
  - [速率限制](/docs/manual#rate-limit)
  - [市场](/docs/manual#markets)
  - [符号和市场 ID](https://github.com/ccxt-dev/ccxt/wiki/Manual#symbols-and-market-ids)
  - [API 方法 / 端点](/docs/manual#api-methods--endpoints)
    - [隐式 API 方法](/docs/manual#implicit-api-methods)
    - [公共/私有 API](/docs/manual#publicprivate-api)
    - [同步与异步调用](/docs/manual#synchronous-vs-asynchronous-calls)
    - [统一 API](/docs/manual#unified-api)
      - [覆盖参数](/docs/manual#overriding-unified-api-params)
      - [分页](/docs/manual#pagination)
      - [自动分页](/docs/manual#automatic-pagination)
  - [公共 API](/docs/manual#public-api)
    - [订单簿](/docs/manual#order-book)
      - [市场深度](/docs/manual#market-depth)
    - [价格行情](/docs/manual#price-tickers)
    - [OHLCV K线图](/docs/manual#ohlcv-candlestick-charts)
    - [公共交易](/docs/manual#trades-executions-transactions)
  - [私有 API](/docs/manual#private-api)
    - [认证](/docs/manual#authentication)
    - [API 密钥设置](/docs/manual#api-keys-setup)
    - [查询账户余额](/docs/manual#account-balance)
    - [订单](/docs/manual#orders)
      - [查询订单](/docs/manual#querying-orders)
        - [按订单 ID](https://github.com/ccxt-dev/ccxt/wiki/Manual#by-order-id)
        - [所有订单](https://github.com/ccxt-dev/ccxt/wiki/Manual#all-orders)
        - [未完成订单](https://github.com/ccxt-dev/ccxt/wiki/Manual#open-orders)
        - [已完成订单](https://github.com/ccxt-dev/ccxt/wiki/Manual#closed-orders)
      - [订单结构](/docs/manual#order-structure)
      - [下单](/docs/manual#placing-orders)
        - [市价单](/docs/manual#market-orders)
        - [限价单](/docs/manual#limit-orders)
        - [自定义参数](/docs/manual#custom-order-params)
      - [取消订单](/docs/manual#canceling-orders)
    - [个人交易](https://github.com/ccxt-dev/ccxt/wiki/Manual#personal-trades)
    - [账户资金](/docs/manual#ledger)
      - [充值](/docs/manual#deposit)
      - [提现](/docs/manual#withdraw)
      - [交易](/docs/manual#transactions)
        - [充值](/docs/manual#deposit)
        - [提现](/docs/manual#withdrawal)
        - [所有交易](/docs/manual#transaction-structure)
    - [费用](/docs/manual#fees)
      - [交易费用](/docs/manual#trading-fees)
      - [交易手续费](/docs/manual#transaction-fees)

## WebSocket 支持

- [CCXT Pro](/docs/pro)

## 故障排除

- [常见问题](/docs/faq)
- [覆盖随机数](/docs/manual#overriding-the-nonce)
- [错误处理](/docs/manual#error-handling)
- [故障排除](/docs/manual#troubleshooting)
- [如何提交问题](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue)
- [CCXT CLI：命令行界面](/docs/cli)

## 示例

- [使用示例](/docs/examples-overview)

## 新交易所

- [认证](/docs/certification)
- [要求](/docs/requirements)

## API 参考

- [API 参考](/docs/manual)
