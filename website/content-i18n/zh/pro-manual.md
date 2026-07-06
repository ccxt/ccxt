---
title: "CCXT Pro 手册"
description: "CCXT Pro 是 CCXT 的免费组成部分，增加了对 WebSocket 流式传输的支持：https://github.com/ccxt/ccxt/issues/15171"
---

# 手册

CCXT Pro 是 CCXT 的免费组成部分，增加了对 WebSocket 流式传输的支持：https://github.com/ccxt/ccxt/issues/15171

CCXT Pro 技术栈构建于 [CCXT](https://ccxt.com) 之上，并扩展了 CCXT 核心类，使用了：

- JavaScript 原型级混入（prototype-level mixins）
- Python 多重继承
- PHP Traits
- Java 类继承（pro 交易所类继承自基础交易所类）

CCXT Pro 大量依赖 CCXT 的转译器来实现[多语言支持](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support)。

```
                                 User

    +-------------------------------------------------------------+
    |                          CCXT Pro                           |
    +------------------------------+------------------------------+
    |            Public            .           Private            |
    +=============================================================+
    │                              .                              |
    │                  The Unified CCXT Pro API                   |
    |                              .                              |
    |     loadMarkets              .         watchBalance         |
    |     watchTicker              .         watchOrders          |
    |     watchTickers             .         watchMyTrades        |
    |     watchOrderBook           .         watchPositions       |
    |     watchOHLCV               .         createOrderWs        |
    |     watchStatus              .         editOrderWs          |
    |     watchTrades              .         cancelOrderWs        |
    │     watchOHLCVForSymbols     .         cancelOrdersWs       |
    │     watchTradesForSymbols    .         cancelAllOrdersWs    |
    │     watchOrderBookForSymbols .                              |
    │                              .                              |
    +=============================================================+
    │                          unWatch                            |
    │                   (to stop **watch** method)                |
    +=============================================================+
    │                              .                              |
    |            The Underlying Exchange-Specific APIs            |
    |         (Derived Classes And Their Implementations)         |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |                 CCXT Pro Base Exchange Class                |
    │                              .                              |
    +=============================================================+

    +-------------------------------------------------------------+
    |                                                             |
    |                            CCXT                             |
    |                                                             |
    +=============================================================+
```

## 交易所
<!--- init list -->CCXT Pro 库目前支持以下 74 个加密货币交易所市场和 WebSocket 交易 API：

|logo                                                                                                                                                                                    |id                     |name                                                                                     |ver                                                                                                                                               |type                                                                                                    |certified                                                                                                                    |pro                                                                                                |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|-----------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------:|--------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| ![aftermath](https://github.com/user-attachments/assets/70e5ae86-2f3a-4755-976b-aedb9d3c2807)                                                                             | aftermath             | AftermathFinance                                                           | ![API Version 1](https://img.shields.io/badge/1-lightgray)                                                                          | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![alpaca](https://github.com/user-attachments/assets/e9476df8-a450-4c3e-ab9a-1a7794219e1b)](https://alpaca.markets)                                                                   | alpaca                | [Alpaca](https://alpaca.markets)                                                        | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://alpaca.markets/docs/)                                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![apex](https://github.com/user-attachments/assets/fef8f2f7-4265-46aa-965e-33a91881cb00)](https://omni.apex.exchange/trade)                                                           | apex                  | [Apex](https://omni.apex.exchange/trade)                                                | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api-docs.pro.apex.exchange)                                                 | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![arkham](https://github.com/user-attachments/assets/5cefdcfb-2c10-445b-835c-fa21317bf5ac)](https://arkm.com/register?ref=ccxt)                                                       | arkham                | [ARKHAM](https://arkm.com/register?ref=ccxt)                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://arkm.com/limits-api)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![ascendex](https://github.com/user-attachments/assets/55bab6b9-d4ca-42a8-a0e6-fac81ae557f1)](https://ascendex.com/en-us/register?inviteCode=EL6BXBQM)                                | ascendex              | [AscendEX](https://ascendex.com/en-us/register?inviteCode=EL6BXBQM)                     | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://ascendex.github.io/ascendex-pro-api/#ascendex-pro-api-documentation)        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![aster](https://github.com/user-attachments/assets/4982201b-73cd-4d7a-8907-e69e239e9609)](https://www.asterdex.com/en/referral/aA1c2B)                                               | aster                 | [Aster](https://www.asterdex.com/en/referral/aA1c2B)                                    | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/asterdex/api-docs)                                               | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![backpack](https://github.com/user-attachments/assets/cc04c278-679f-4554-9f72-930dd632b80f)](https://backpack.exchange/join/ccxt)                                                    | backpack              | [Backpack](https://backpack.exchange/join/ccxt)                                         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.backpack.exchange/)                                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bequant](https://github.com/user-attachments/assets/0583ef1f-29fe-4b7c-8189-63565a0e2867)](https://bequant.io/referral/dd104e3bee7634ec)                                            | bequant               | [Bequant](https://bequant.io/referral/dd104e3bee7634ec)                                 | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.bequant.io/)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![binance](https://github.com/user-attachments/assets/e9419b93-ccb0-46aa-9bff-c883f096274b)](https://accounts.binance.com/register?ref=CCXTCOM)                                       | binance               | [Binance](https://accounts.binance.com/register?ref=CCXTCOM)                            | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://developers.binance.com/en)                                                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![binancecoinm](https://github.com/user-attachments/assets/387cfc4e-5f33-48cd-8f5c-cd4854dabf0c)](https://accounts.binance.com/register?ref=CCXTCOM)                                  | binancecoinm          | [Binance COIN-M](https://accounts.binance.com/register?ref=CCXTCOM)                     | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/delivery/en/)                                | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![binanceus](https://github.com/user-attachments/assets/a9667919-b632-4d52-a832-df89f8a35e8c)](https://www.binance.us/?ref=35005074)                                                  | binanceus             | [Binance US](https://www.binance.us/?ref=35005074)                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://github.com/binance-us/binance-official-api-docs)                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![binanceusdm](https://github.com/user-attachments/assets/871cbea7-eebb-4b28-b260-c1c91df0487a)](https://accounts.binance.com/register?ref=CCXTCOM)                                   | binanceusdm           | [Binance USDⓈ-M](https://accounts.binance.com/register?ref=CCXTCOM)                     | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/futures/en/)                                 | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bingx](https://github-production-user-asset-6210df.s3.amazonaws.com/1294454/253675376-6983b72e-4999-4549-b177-33b374c195e3.jpg)](https://bingx.com/invite/OHETOM)                   | bingx                 | [BingX](https://bingx.com/invite/OHETOM)                                                | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://bingx-api.github.io/docs/)                                                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitfinex](https://github.com/user-attachments/assets/4a8e947f-ab46-481a-a8ae-8b20e9b03178)](https://www.bitfinex.com)                                                               | bitfinex              | [Bitfinex](https://www.bitfinex.com)                                                    | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.bitfinex.com/v2/docs/)                                                 | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitget](https://github.com/user-attachments/assets/fbaa10cc-a277-441d-a5b7-997dd9a87658)](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)            | bitget                | [Bitget](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j) | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.bitget.com/api-doc/common/intro)                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bithumb](https://github.com/user-attachments/assets/c9e0eefb-4777-46b9-8f09-9d7f7c4af82d)](https://www.bithumb.com)                                                                 | bithumb               | [Bithumb](https://www.bithumb.com)                                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://apidocs.bithumb.com)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitmart](https://github.com/user-attachments/assets/0623e9c4-f50e-48c9-82bd-65c3908c3a14)](http://www.bitmart.com/?r=rQCFLh)                                                        | bitmart               | [BitMart](http://www.bitmart.com/?r=rQCFLh)                                             | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://developer-pro.bitmart.com/)                                                 | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitmex](https://github.com/user-attachments/assets/c78425ab-78d5-49d6-bd14-db7734798f04)](https://www.bitmex.com/app/register/NZTR1q)                                               | bitmex                | [BitMEX](https://www.bitmex.com/app/register/NZTR1q)                                    | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.bitmex.com/app/apiOverview)                                             | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitopro](https://github.com/user-attachments/assets/affc6337-b95a-44bf-aacd-04f9722364f6)](https://www.bitopro.com)                                                                 | bitopro               | [BitoPro](https://www.bitopro.com)                                                      | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md) | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitrue](https://github.com/user-attachments/assets/67abe346-1273-461a-bd7c-42fa32907c8e)](https://www.bitrue.com/affiliate/landing?cn=600000&inviteCode=EZWETQE)                    | bitrue                | [Bitrue](https://www.bitrue.com/affiliate/landing?cn=600000&inviteCode=EZWETQE)         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/Bitrue-exchange/bitrue-official-api-docs)                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitstamp](https://github.com/user-attachments/assets/d5480572-1fee-43cb-b900-d38c522d0024)](https://www.bitstamp.net)                                                               | bitstamp              | [Bitstamp](https://www.bitstamp.net)                                                    | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.bitstamp.net/api)                                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bittrade](https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg)](https://www.bittrade.co.jp/register/?invite_code=znnq3)             | bittrade              | [BitTrade](https://www.bittrade.co.jp/register/?invite_code=znnq3)                      | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://api-doc.bittrade.co.jp)                                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitvavo](https://github.com/user-attachments/assets/d213155c-8c71-4701-9bd5-45351febc2a8)](https://bitvavo.com/?a=24F34952F7)                                                       | bitvavo               | [Bitvavo](https://bitvavo.com/?a=24F34952F7)                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.bitvavo.com/)                                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![blockchaincom](https://github.com/user-attachments/assets/975e3054-3399-4363-bcee-ec3c6d63d4e8)](https://blockchain.com)                                                            | blockchaincom         | [Blockchain.com](https://blockchain.com)                                                | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.blockchain.com/v3)                                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![blofin](https://github.com/user-attachments/assets/518cdf80-f05d-4821-a3e3-d48ceb41d73b)](https://blofin.com/register?referral_code=f79EsS)                                         | blofin                | [BloFin](https://blofin.com/register?referral_code=f79EsS)                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://blofin.com/docs)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bullish](https://github.com/user-attachments/assets/68f0686b-84f0-4da9-a751-f7089af3a9ed)](https://bullish.com/)                                                                    | bullish               | [Bullish](https://bullish.com/)                                                         | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.exchange.bullish.com/docs/api/rest/)                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bybit](https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed)](https://www.bybit.com/invite?ref=XDK12WP)                                                  | bybit                 | [Bybit](https://www.bybit.com/invite?ref=XDK12WP)                                       | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://bybit-exchange.github.io/docs/inverse/)                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bybiteu](https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed)](https://www.bybit.com/invite?ref=XDK12WP)                                                | bybiteu               | [Bybit EU](https://www.bybit.com/invite?ref=XDK12WP)                                    | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://bybit-exchange.github.io/docs/inverse/)                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bydfi](https://github.com/user-attachments/assets/bfffb73d-29bd-465d-b75b-98e210491769)](https://partner.bydfi.com/j/DilWutCI)                                                      | bydfi                 | [BYDFi](https://partner.bydfi.com/j/DilWutCI)                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://developers.bydfi.com/en/)                                                   | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)](https://cex.io/r/0/up105393824/0/)                                       | cex                   | [CEX.IO](https://cex.io/r/0/up105393824/0/)                                             | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://trade.cex.io/docs/)                                                         | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coinbase](https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg)](https://www.coinbase.com/join/58cbe25a355148797479dbd2)             | coinbase              | [Coinbase Advanced](https://www.coinbase.com/join/58cbe25a355148797479dbd2)             | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.cdp.coinbase.com/coinbase-app/introduction/welcome)                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coinbaseexchange](https://github.com/ccxt/ccxt/assets/43336371/34a65553-88aa-4a38-a714-064bd228b97e)](https://coinbase.com/)                                                        | coinbaseexchange      | [Coinbase Exchange](https://coinbase.com/)                                              | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.cloud.coinbase.com/exchange/docs/)                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coinbaseinternational](https://github.com/ccxt/ccxt/assets/43336371/866ae638-6ab5-4ebf-ab2c-cdcce9545625)](https://international.coinbase.com)                                      | coinbaseinternational | [Coinbase International](https://international.coinbase.com)                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.cloud.coinbase.com/intx/docs)                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coinex](https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg)](https://www.coinex.com/register?refer_code=yw5fz)                    | coinex                | [CoinEx](https://www.coinex.com/register?refer_code=yw5fz)                              | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.coinex.com/api/v2)                                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![cryptocom](https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg)](https://crypto.com/exch/kdacthrnxt)                              | cryptocom             | [Crypto.com](https://crypto.com/exch/kdacthrnxt)                                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html)                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![deepcoin](https://github.com/user-attachments/assets/ddf3e178-c3b6-409d-8f9f-af8b7cf80454)](https://s.deepcoin.com/UzkyODgy)                                                        | deepcoin              | [DeepCoin](https://s.deepcoin.com/UzkyODgy)                                             | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.deepcoin.com/docs)                                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![deribit](https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg)](https://www.deribit.com/reg-1189.4038)                               | deribit               | [Deribit](https://www.deribit.com/reg-1189.4038)                                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.deribit.com/v2)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![derive](https://github.com/user-attachments/assets/f835b95f-033a-43dd-b6bb-24e698fc498c)](https://www.derive.xyz/invite/3VB0B)                                                      | derive                | [derive](https://www.derive.xyz/invite/3VB0B)                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.derive.xyz/docs/)                                                      | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![dydx](https://github.com/user-attachments/assets/617ea0c1-f05a-4d26-9fcb-a0d1d4091ae1)](https://dydx.trade?ref=ccxt)                                                                        | dydx                  | [dYdX](https://dydx.trade?ref=ccxt)                                                             | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://docs.dydx.xyz)                                                              | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![gate](https://github.com/user-attachments/assets/64f988c5-07b6-4652-b5c1-679a6bf67c85)](https://www.gate.com/share/CCXTGATE)                                                        | gate                  | [Gate](https://www.gate.com/share/CCXTGATE)                                             | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://www.gate.com/docs/developers/apiv4/en)                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)](https://gemini.com/)                                                  | gemini                | [Gemini](https://gemini.com/)                                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.gemini.com/rest-api)                                                   | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![grvt](https://github.com/user-attachments/assets/7a2e8108-29f6-45d1-822d-48eb1c8cbbe6)](https://grvt.io/?ref=WBLS9D1)                                                               | grvt                  | [GRVT](https://grvt.io/?ref=WBLS9D1)                                                    | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://api-docs.grvt.io/)                                                          | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![hashkey](https://github.com/user-attachments/assets/6dd6127b-cc19-4a13-9b29-a98d81f80e98)](https://global.hashkey.com/en-US/register/invite?invite_code=82FQUN)                     | hashkey               | [HashKey Global](https://global.hashkey.com/en-US/register/invite?invite_code=82FQUN)   | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://hashkeyglobal-apidoc.readme.io/)                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![hollaex](https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg)](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)              | hollaex               | [HollaEx](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                       | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://apidocs.hollaex.com)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![htx](https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg)](https://www.htx.com/invite/en-us/1h?invite_code=6rmm2223)             | htx                   | [HTX](https://www.htx.com/invite/en-us/1h?invite_code=6rmm2223)                      | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://huobiapi.github.io/docs/spot/v1/en/)                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![hyperliquid](https://github.com/ccxt/ccxt/assets/43336371/b371bc6c-4a8c-489f-87f4-20a913dd8d4b)](https://app.hyperliquid.xyz/)                                                      | hyperliquid           | [Hyperliquid](https://app.hyperliquid.xyz/)                                             | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)                 | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![independentreserve](https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg)](https://www.independentreserve.com)                      | independentreserve    | [Independent Reserve](https://www.independentreserve.com)                               | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://www.independentreserve.com/API)                                             | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                              | kraken                | [Kraken](https://www.kraken.com)                                                        | [![API Version 0](https://img.shields.io/badge/0-lightgray)](https://docs.kraken.com/rest/)                                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![krakenfutures](https://user-images.githubusercontent.com/24300605/81436764-b22fd580-9172-11ea-9703-742783e6376d.jpg)](https://futures.kraken.com/)                                  | krakenfutures         | [Kraken Futures](https://futures.kraken.com/)                                           | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://docs.kraken.com/api/docs/futures-api/trading/market-data/)                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![kucoin](https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg)](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                  | kucoin                | [KuCoin](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.kucoin.com)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![kucoinfutures](https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg)](https://futures.kucoin.com/?rcode=E5wkqe)                     | kucoinfutures         | [KuCoin Futures](https://futures.kucoin.com/?rcode=E5wkqe)                              | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.kucoin.com)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)](https://www.lbank.com/login/?icode=7QCY)                               | lbank                 | [LBank](https://www.lbank.com/login/?icode=7QCY)                                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.lbank.com/en-US/docs/index.html)                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![lighter](https://github.com/user-attachments/assets/ff1aaf96-bffb-4545-a750-5eba716e75d0)](https://app.lighter.xyz/?referral=715955W9)                                                      | lighter               | [Lighter](https://app.lighter.xyz/?referral=715955W9)                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://apidocs.lighter.xyz/)                                                       | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)](https://www.luno.com/invite/44893A)                                     | luno                  | [luno](https://www.luno.com/invite/44893A)                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.luno.com/en/api)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![mexc](https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg)](https://www.mexc.com/register?inviteCode=mexc-1FQ1GNu1)                | mexc                  | [MEXC Global](https://www.mexc.com/register?inviteCode=mexc-1FQ1GNu1)                   | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://mexcdevelop.github.io/apidocs/)                                             | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![modetrade](https://github.com/user-attachments/assets/cec2b7f1-3b2b-4502-971b-447ee1937d6b)](https://trade.mode.network?ref=MODETRADE)                                              | modetrade             | [Mode Trade](https://trade.mode.network?ref=MODETRADE)                                  | ![API Version 1](https://img.shields.io/badge/1-lightgray)                                                                          | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![myokx](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.my.okx.com/join/CCXT2023)                                 | myokx                 | [MyOKX (EEA)](https://www.my.okx.com/join/CCXT2023)                                     | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://my.okx.com/docs-v5/en/#overview)                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![ndax](https://user-images.githubusercontent.com/1294454/108623144-67a3ef00-744e-11eb-8140-75c6b851e945.jpg)](https://one.ndax.io/bfQiSL)                                            | ndax                  | [NDAX](https://one.ndax.io/bfQiSL)                                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://apidoc.ndax.io/)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![okx](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.okx.com/join/CCXTCOM)                                       | okx                   | [OKX](https://www.okx.com/join/CCXTCOM)                                                 | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://www.okx.com/docs-v5/en/)                                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![okxus](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.app.okx.com/join/CCXT2023)                                | okxus                 | [OKX (US)](https://www.app.okx.com/join/CCXT2023)                                       | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://app.okx.com/docs-v5/en/#overview)                                           | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![onetrading](https://github.com/ccxt/ccxt/assets/43336371/bdbc26fd-02f2-4ca7-9f1e-17333690bb1c)](https://onetrading.com/)                                                            | onetrading            | [One Trading](https://onetrading.com/)                                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.onetrading.com)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![oxfun](https://github.com/ccxt/ccxt/assets/43336371/6a196124-c1ee-4fae-8573-962071b61a85)](https://ox.fun/register?shareAccountId=5ZUD4a7G)                                         | oxfun                 | [OXFUN](https://ox.fun/register?shareAccountId=5ZUD4a7G)                                | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://docs.ox.fun/)                                                               | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![p2b](https://github.com/ccxt/ccxt/assets/43336371/8da13a80-1f0a-49be-bb90-ff8b25164755)](https://p2pb2b.com?referral=ee784c53)                                                      | p2b                   | [p2b](https://p2pb2b.com?referral=ee784c53)                                             | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md)                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![pacifica](https://github.com/user-attachments/assets/f795515a-828e-4a04-8fca-bf19fcf17ea4)](https://app.pacifica.fi?referral=ccxt)                                                  | pacifica              | [Pacifica](https://app.pacifica.fi?referral=ccxt)                                       | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.pacifica.fi/api-documentation/api/rest-api)                            | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![paradex](https://github.com/user-attachments/assets/84628770-784e-4ec4-a759-ec2fbb2244ea)](https://app.paradex.trade/r/ccxt24)                                                      | paradex               | [Paradex](https://app.paradex.trade/r/ccxt24)                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.api.testnet.paradex.trade/)                                            | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![phemex](https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg)](https://phemex.com/register?referralCode=EDNVJ)                       | phemex                | [Phemex](https://phemex.com/register?referralCode=EDNVJ)                                | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://phemex-docs.github.io/#overview)                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://poloniex.com/signup?c=UBFZJRPJ)                             | poloniex              | [Poloniex](https://poloniex.com/signup?c=UBFZJRPJ)                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://api-docs.poloniex.com/spot/)                                                | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![toobit](https://github.com/user-attachments/assets/0c7a97d5-182c-492e-b921-23540c868e0e)](https://www.toobit.com/en-US/r?i=IFFPy0)                                                  | toobit                | [Toobit](https://www.toobit.com/en-US/r?i=IFFPy0)                                       | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://toobit-docs.github.io/apidocs/spot/v1/en/)                                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                                     | upbit                 | [Upbit](https://upbit.com)                                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.upbit.com/kr)                                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![weex](https://github.com/user-attachments/assets/ccbadb2d-5035-403d-898f-dce831bdc936)](https://www.weex.com/register?vipCode=qfyh)                                                 | weex                  | [Weex](https://www.weex.com/register?vipCode=qfyh)                                      | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://www.weex.com/api-doc)                                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![whitebit](https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg)](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963) | whitebit              | [WhiteBit](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)          | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://github.com/whitebit-exchange/api-docs)                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![woo](https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg)](https://woox.io/register?ref=DIJT0CNL)                                  | woo                   | [WOO X](https://woox.io/register?ref=DIJT0CNL)                                          | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.woox.io/)                                                              | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![woofipro](https://github.com/user-attachments/assets/9ba21b8a-a9c7-4770-b7f1-ce3bcbde68c1)](https://dex.woo.org/en/trade?ref=CCXT)                                                  | woofipro              | [WOOFI PRO](https://dex.woo.org/en/trade?ref=CCXT)                                      | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://orderly.network/docs/build-on-omnichain/building-on-evm)                    | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![xt](https://user-images.githubusercontent.com/14319357/232636712-466df2fc-560a-4ca4-aab2-b1d954a58e24.jpg)](https://www.xt.com/en/accounts/register?ref=9PTM9VW)                    | xt                    | [XT](https://www.xt.com/en/accounts/register?ref=9PTM9VW)                               | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://doc.xt.com/)                                                                | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
<!--- end list -->
这是 CCXT Pro 中支持 WebSockets API 的交易所列表。该列表将定期更新，加入新的交易所。

CCXT 通过 REST 提供的完整交易所列表：[支持的加密货币交易市场](https://github.com/ccxt/ccxt/#supported-cryptocurrency-exchange-markets)。

## 使用方法

```diff
- this part of the doc is under heavy development right now
- there may be some typos, mistakes and missing info here and there
- contributions, pull requests and feedback appreciated
```

## 前提条件

理解 CCXT Pro 的最佳方式是确保您完全掌握 CCXT 手册，并先熟练使用标准 CCXT。CCXT Pro 借鉴自 CCXT，两个库有许多共同之处，包括：

- 公共 API 和私有认证 API 的概念
- 市场、交易对、货币代码和 id
- 统一的数据结构和格式：订单簿、交易、订单、K 线、时间周期等
- 异常与错误映射
- 认证和 API 密钥（用于私有订阅和调用）
- 配置选项

CCXT Pro 的用户群主要由专业量化交易者和开发者构成。为了高效使用本库，用户需要熟悉流式传输的相关概念，理解基于连接的流式 API（[WebSocket](https://en.wikipedia.org/wiki/WebSocket)，CCXT Pro）与基于请求-响应的 API（[REST](https://en.wikipedia.org/wiki/Representational_state_transfer)，CCXT）之间的本质区别。

CCXT 应用程序的通用异步流程如下：

```javascript

// a RESTful orderbook polling request-response loop

while (condition) {

    try {

        // fetch some of the public data
        orderbook = await exchange.fetchOrderBook (symbol, limit)

        // do something or react somehow based on that data
        // ...

    } catch (e) {

        // handle errors
    }
}
```

在 CCXT Pro 中，每个带有 `fetch*` 前缀的公共和私有统一 RESTful 方法，都有一个对应的以 `watch*` 为前缀的基于流的对应方法，如下所示：

- 公共 API
  - `fetchStatus` → `watchStatus`
  - `fetchOrderBook` → `watchOrderBook`
  - `fetchOrderBookForSymbols` → `watchOrderBookForSymbols`
  - `fetchTicker` → `watchTicker`
  - `fetchTickers` → `watchTickers`
  - `fetchOHLCV` → `watchOHLCV`
  - `fetchOHLCVForSymbols` → `watchOHLCVForSymbols`
  - `fetchTrades` → `watchTrades`
  - `fetchTradesForSymbols` → `watchTradesForSymbols`
  - `fetchBidsAsks` → `watchBidsAsks`
  - `fetchLiquidations` → `watchLiquidations`
  - `fetchLiquidationsForSymbols` → `watchLiquidationsForSymbols`
- 私有 API
  - `fetchBalance` → `watchBalance`
  - `fetchOrders` → `watchOrders`
  - `fetchOrdersForSymbols` → `watchOrdersForSymbols`
  - `fetchMyTrades` → `watchMyTrades`
  - `fetchPosition` → `watchPosition`
  - `fetchPositions` → `watchPositions`
  - `fetchLiquidations` → `watchLiquidations`
  - `fetchMyLiquidations` → `watchMyLiquidations`
  - `fetchMyLiquidationsForSymbols` → `watchMyLiquidationsForSymbols`
  - `fetchFundingRates` → `watchFundingRates`
- REST 替代方法
  - `fetchTrades` → `fetchTradesWs`
  - `createOrder` → `createOrderWs`
  - `editOrder` → `editOrderWs`
  - `cancelOrder` → `cancelOrderWs`
  - `cancelOrders` → `cancelOrdersWs`
  - `cancelAllOrders` → `cancelAllOrdersWs`
  - 等等……
- unWatch（停止 `watch` 方法的后台订阅）
  - `unWatchOrderBook`
  - `unWatchOrderBooksForSymbols`
  - `unWatchTrades`
  - `unWatchTradesForSymbols`
  - `unWatchOHLCVForSymbols`
  - `unWatchOrderBookForSymbols`
  - `unWatchPositions`
  - `unWatchTickers`
  - `unWatchMyTrades`
  - `unWatchTicker`
  - `unWatchOHLCV`
  - `unWatchOrders`

统一的 CCXT Pro 流式 API 继承了 CCXT 的使用模式，以便于迁移。

CCXT Pro 应用程序（与上面的 CCXT 应用程序相对）的通用异步流程如下所示：

```javascript

// a stream-based (WebSocket) orderbook feed loop

while (condition) {

    try {

        // watch some of the public data
        orderbook = await exchange.watchOrderBook (symbol, limit)

        // do something or react somehow based on that data
        // ...

    } catch (e) {

        // handle errors
    }
}
```

这种使用模式通常被封装成一个核心业务逻辑方法，称为 _"`tick()` 函数"_，因为它循环响应传入的事件（即 _ticks_）。从上面两个示例可以明显看出，CCXT Pro 和 CCXT 的通用使用模式是相同的。

CCXT 的许多规则和概念同样适用于 CCXT Pro：

- CCXT Pro 会在第一次调用统一 API 方法时加载并缓存市场数据
- CCXT Pro 在必要时会在底层调用 CCXT 的 RESTful 方法
- CCXT Pro 在必要时会抛出标准的 CCXT 异常
- ……

## 流式传输的特殊性

尽管有许多共同之处，基于流的 API 由于其基于连接的本质，具有其自身的特殊性。

基于连接的接口意味着需要连接管理机制。连接由 CCXT Pro 透明地管理，用户无需关心。每个交易所实例管理自己的一组连接。

当您第一次调用任何 `watch*()` 方法时，库将与交易所的特定流/资源建立连接并保持该连接。如果连接已存在，则会复用。库将处理订阅请求/响应的消息序列，以及在请求的流为私有时进行身份验证/签名。

库还会监视上行链路的状态并保持连接活跃。在发生严重异常、断开连接或连接超时/失败时，tick 函数的下一次迭代将调用 `watch` 方法，从而触发重新连接。通过这种方式，库透明地为用户处理断线和重连。CCXT Pro 会应用必要的速率限制和指数退避重连延迟。所有这些功能均默认启用，可通过交易所属性进行配置。

大多数交易所的流式 API 只有一个基础 URL（通常是 WebSocket，以 `ws://` 或 `wss://` 开头）。部分交易所可能针对不同的数据流提供多个 URL。

交易所的流式 API 可以分为两类：

- *sub* 或 *subscribe*：仅允许接收
- *pub* 或 *publish*：允许发送和接收

### Sub

*sub* 接口通常允许订阅数据流并监听。大多数支持 WebSocket 的交易所只提供 *sub* 类型的 API。*sub* 类型包括流式公共市场数据。有时交易所也允许订阅私有用户数据。用户订阅数据流后，该频道便开始单向工作，持续向用户推送来自交易所的更新。

常见的公共数据流类型：

- 订单簿（最常见）——新增、修改和删除订单的更新（即 *变化增量*）
- 24 小时统计数据变化时的行情更新
- 成交流（也很常见）——公共交易的实时流
- OHLCV K 线数据流
- 心跳
- 交易所聊天/水区

不太常见的私有用户数据流类型：

- 用户私有交易流
- 实时订单更新
- 余额更新
- 自定义数据流
- 交易所特定及其他数据流

### Pub

*pub* 接口通常允许用户向服务器发送数据请求。这通常包括常见的用户操作，例如：

- 下单
- 撤单
- 发起提币请求
- 发送聊天/水区消息
- 等等

**部分交易所不提供 *pub* WS API，仅提供 *sub* WS API。** 不过，也有交易所提供完整的流式 API。在大多数情况下，仅依靠流式 API 无法有效操作。交易所通过 *sub* 推送公共市场数据，而缺失的 *pub* 部分仍需通过 REST API 来完成。

### unWatch

每个 `watchX` 方法都会建立对某个数据流的订阅，并持续从交易所获取更新。即使您停止获取 `watchX` 方法的返回值，数据流仍会继续发送数据，由后台处理并存储。要停止这些后台订阅，应使用 `unWatch` 方法（例如 `watchTrades` -> `unWatchTrades`）。

### 增量数据结构

在许多情况下，由于底层数据流的单向性，客户端监听的应用程序必须在内存中保存本地数据快照，并将从交易所服务器接收到的更新合并到本地快照中。来自交易所的更新通常也被称为 _增量_，因为在大多数情况下，这些更新只包含两个数据状态之间的变化，不包含未发生变化的数据，因此需要在本地缓存所有相关数据对象的当前状态 S。

所有这些功能都由 CCXT Pro 为用户处理。使用 CCXT Pro 时，用户无需跟踪或管理订阅及相关数据。CCXT Pro 会在内存中保存结构缓存以处理底层的繁琐工作。

每个传入的更新都会说明数据的哪些部分发生了变化，接收方通过将更新合并到当前状态 S 上来"增量"更新本地状态 S，并移动到下一个本地状态 S'。在 CCXT Pro 中，这被称为 _"增量状态"_，参与存储和更新缓存状态过程的结构被称为 _"增量结构"_。CCXT Pro 引入了几个新的基类，在必要时处理增量状态。

从 CCXT Pro 统一方法返回的增量结构通常是以下两种类型之一：

1. JSON 解码对象（JavaScript 中的 `object`，Python 中的 `dict`，PHP 中的 `array()`）。此类型可由公共和私有方法返回，如 `watchOrderBook`、`watchTicker`、`watchBalance`、`watchOrder` 等。
2. 对象数组/列表（通常按时间顺序排序）。此类型可由 `watchOHLCV`、`watchTrades`、`watchMyTrades`、`watchOrders` 等方法返回。

返回数组的统一方法，如 `watchOHLCV`、`watchTrades`、`watchMyTrades`、`watchOrders`，均基于缓存层。用户需要了解缓存层的内部工作原理，才能高效使用。

缓存是一个固定大小的双端队列（即数组/列表）。CCXT Pro 库对内存中存储的对象数量有合理的限制。默认情况下，缓存数组结构最多存储每种类型 1000 条记录（最近 1000 笔交易、最近 1000 根 K 线、最近 1000 个订单）。用户可以在实例化时或之后配置允许的最大数量：

```python
ccxtpro.binance({
    'options': {
        'tradesLimit': 1000,
        'OHLCVLimit': 1000,
        'ordersLimit': 1000,
    },
})

# or

exchange.options['tradesLimit'] = 1000
exchange.options['OHLCVLimit'] = 1000
exchange.options['ordersLimit'] = 1000
```

缓存限制必须在调用任何 watch 方法之前设置，且在程序运行期间不能更改。

当缓存中还有空间时，新元素会直接追加到末尾。如果没有足够空间容纳新元素，则会从缓存开头删除最旧的元素以释放空间。因此，例如，缓存从 0 增长到最近 1000 笔交易，之后始终保持最多 1000 笔最近交易，随着每次来自交易所的新更新不断刷新存储的数据。这就像一个滑动框架窗口或滑动门，如下所示：

```
      past > ------------------ > time > - - - - - - - - > future


                           sliding frame
                           of 1000 most
                           recent trades
                        +-----------------+
                        |                 |
                        |===========+=====|
+----------------+------|           |     | - - - - - + - - - - - - - - + - - -
|                |      |           |     |           |                 |
0              1000     |         2000    |         3000              4000  ...
|                |      |           |     |           |                 |
+----------------+------|           |     | - - - - - + - - - - - - - - + - - -
                        |===========+=====|
                        |                 |
                        +---+---------+---+
                            |         |
                      since ^         ^ limit

                   date-based pagination arguments
                         are always applied
                       within the cached frame
```

用户可以如上所示使用 `exchange.options` 配置缓存限制。请不要将缓存限制与分页限制混淆。

**请注意，`since` 和 `limit` [基于日期的分页](/docs/manual#date-based-pagination) 参数具有不同的含义，且始终在缓存窗口内生效！** 如果用户为 `watchTrades()` 调用指定了 `since` 参数，CCXT Pro 将返回所有时间戳 `>= since` 的缓存交易。如果用户未指定 `since` 参数，CCXT Pro 将从滑动窗口的起始位置返回缓存的交易。如果用户指定了 `limit` 参数，库将从 `since` 或缓存起始位置开始返回最多 `limit` 根 K 线。因此，由于 WebSocket 实时特性的限制，用户无法在缓存帧之外进行分页。

```python
exchange.options['tradesLimit'] = 5  # set the size of the cache to 5

# this call will return up to 5 cached trades
await exchange.watchTrades (symbol)

# the following call will return the first 2 of up to 5 cached trades
await exchange.watchTrades (symbol, since=None, limit=2)

# this call will first filter cached trades by trade['timestamp'] >= since
# and will return the first 2 of up to 5 cached trades that pass the filter
since = exchange.iso8601('2020-01-01T00:00:00Z')
limit = 2
await exchange.watchTrades (symbol, since, limit)
```

#### newUpdates 模式

如果您希望始终只获取最新的交易记录，**应在实例化交易所时将 newUpdates 标志设置为 true**。

```python
exchange = ccxtpro.binance({'newUpdates': True})
while True:
    trades = await exchange.watchTrades (symbol)
    print(trades)
```

newUpdates 模式在后台仍然使用滑动缓存，但用户只会收到新的更新内容。这是因为某些交易所使用增量结构，因此我们需要维护对象缓存，因为交易所可能只提供部分信息（例如状态更新）。

newUpdates 模式的结果将是自上次 `exchange.watchMethod` 解析以来发生的一条或多条更新。CCXT Pro 可以返回自上次调用以来更新的一个或多个订单。调用 `exchange.watchOrders` 的结果如下所示：

```javascript
[
    order, // see /docs/manual#order-structure
    order,
    order,
    ...
]
```

*弃用警告*：未来 `newUpdates: true` 将成为默认模式，届时您需要将 newUpdates 设置为 false 才能获取滑动缓存。

```javascript tab="JavaScript"
const ccxtpro = require ('ccxt').pro
console.log ('CCXT version', ccxtpro.version)
console.log ('Supported exchanges:', ccxtpro.exchanges)
```
```python tab="Python"
import ccxt.pro as ccxtpro
print('CCXT version', ccxtpro.__version__)
print('Supported exchanges:', ccxtpro.exchanges)
```
```php tab="PHP"
use \ccxt\pro; // optional, since you can use fully qualified names
echo 'CCXT version ', \ccxt\pro\Exchange::VERSION, "\n";
echo 'Supported exchanges: ', json_encode(\ccxt\pro\Exchange::$exchanges), "\n";
```
```c# tab="C#/.NET"
using ccxt;
using ccxt.pro;

Console.WriteLine("CCXT version " + ccxt.Exchange.ccxtVersion);
```
```go tab="Go"
import (
    "fmt"
    ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

fmt.Println("CCXT version", ccxtpro.Version)
```
```java tab="Java"
import io.github.ccxt.exchanges.pro.Binance;
// Pro exchange classes are in the io.github.ccxt.exchanges.pro package
```


导入的 CCXT Pro 模块将 CCXT 封装在其内部——通过 CCXT Pro 实例化的每个交易所都具备所有 CCXT 方法以及额外的功能。

## 实例化

CCXT Pro 专为 async/await 语法风格设计，并大量依赖于 *promises* 和 *futures* 等异步原语。

创建 CCXT Pro 交易所实例与创建 CCXT 交易所实例几乎完全相同。


```javascript tab="JavaScript"
const ccxt = require ('ccxt').pro
const exchange = new ccxtpro.binance ({ newUpdates: false })
```

#### **Python**

CCXT Pro 的 Python 实现依赖于内置的 [asyncio](https://docs.python.org/3/library/asyncio.html)，尤其是 [Event Loop](https://docs.python.org/3/library/asyncio-eventloop.html)。在 Python 中，可以在构造函数参数中提供 asyncio 的事件循环实例，如下所示（与 `ccxt.async support` 相同）：

```python
import ccxt.pro as ccxtpro
from asyncio import run

async def main():
    exchange = ccxtpro.kraken({'newUpdates': False})
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD')
        print(orderbook['asks'][0], orderbook['bids'][0])
    await exchange.close()


run(main())
```
#### **PHP**

在 PHP 中，异步原语借自 [ReactPHP](https://reactphp.org)。CCXT Pro 的 PHP 实现依赖于 [Promise](https://github.com/reactphp/promise) 和 [EventLoop](https://github.com/reactphp/event-loop)。在 PHP 中，用户需要在构造函数参数中提供 ReactPHP 的事件循环实例，如下所示：

```php
error_reporting(E_ALL);
date_default_timezone_set('UTC');
require_once 'vendor/autoload.php';

$exchange = new \ccxt\pro\kucoin(array( 'newUpdates' => false ));
```

```c# tab="C#/Dotnet"
using ccxt.pro;

    public async static Task Watch()
    {
        var exchange = new binance();
        while (true)
        {
            var trades = await exchange.WatchTrades("BTC/USDT");
            Console.WriteLine("Trades: " + JsonConvert.SerializeObject(trades, Formatting.Indented));
        }
    }
```

```go tab="Go"
import (
    "fmt"
    ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

exchange := ccxtpro.NewBinance(map[string]interface{}{
    "newUpdates": false,
})
defer exchange.Close()
for {
    orderbook, err := exchange.WatchOrderBook("BTC/USDT")
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(orderbook.Asks[0], orderbook.Bids[0])
}
```

```java tab="Java"
import io.github.ccxt.exchanges.pro.Binance;
import io.github.ccxt.types.Ticker;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

Binance exchange = new Binance();
exchange.loadMarkets(false);

// Sync: blocks until next update
while (true) {
    Ticker ticker = exchange.watchTicker("BTC/USDT");
    System.out.println(ticker.last);
}

// Or async: returns CompletableFuture<Ticker> — composable, supports timeouts
CompletableFuture<Ticker> next = exchange.watchTickerAsync("BTC/USDT", null);
Ticker tick = next.get(30, TimeUnit.SECONDS);
```


## 交易所属性

每个 CCXT Pro 实例都包含底层 CCXT 实例的所有属性。除标准 CCXT 属性外，CCXT Pro 实例还包含以下属性：

```javascript
{
    'has': { // an associative array of extended exchange capabilities
        'ws': true, // only available in CCXT Pro
        'watchOrderBook': true,
        'watchTicker': true,
        'watchTickers': true,
        'watchTrades': true,
        'watchMyTrades': true,
        'watchOHLCV': true,
        'watchBalance': true,
        'watchPositions': true,
        'createOrderWs': true,
        'editOrderWs': true,
        'cancelOrderWs': true,
        'cancelOrdersWs': false,
        'cancelAllOrdersWs': true,
        'fetchOrderWs': true,
        'fetchOrdersWs': true,
        'fetchBalanceWs': true,
        'fetchMyTradesWs': true,
        ...
    },
    'urls': {
        'api': { // will contain a streaming API base URL, depending on the underlying protocol
            'ws': 'wss://ws.exchange.com',            // https://en.wikipedia.org/wiki/WebSocket
            'signalr': 'https://signalr.exchange.com' // https://en.wikipedia.org/wiki/SignalR
            'socketio': 'wss://socket.exchange.io'    // https://socket.io
        },
    },
    'version': '1.21',
    'streaming': {
        'keepAlive': 30000, // integer keep-alive rate in milliseconds
        'maxPingPongMisses': 2.0, // how many ping pong misses to drop and reconnect
        ... // other streaming options
    },
    // incremental data structures
    'orderbooks':   {}, // incremental order books indexed by symbol
    'ohlcvs':       {}, // standard CCXT OHLCVs indexed by symbol by timeframe
    'balance':      {}, // a standard CCXT balance structure, accounts indexed by currency code
    'orders':       {}, // standard CCXT order structures indexed by order id
    'trades':       {}, // arrays of CCXT trades indexed by symbol
    'tickers':      {}, // standard CCXT tickers indexed by symbol
    'transactions': {}, // standard CCXT deposits and withdrawals indexed by id or txid
    ...
}
```

## 统一 API

统一 CCXT Pro API 鼓励使用直接控制流，与使用 EventEmitter 和回调相比，代码风格更佳、可读性更强、架构也更优秀。后者如今被视为过时的方式，因为它需要控制反转（人们不习惯这种反转思维）。

CCXT Pro 采用现代方式，专为异步语法而设计。在底层，CCXT Pro 有时仍不得不使用反转控制流，这是由于依赖项和 WebSocket 库本身的限制。

这不仅适用于 JS/ES6，同样适用于 Python 3 的异步代码。在 PHP 中，异步原语借自 [ReactPHP](https://reactphp.org/)。

现代异步语法允许您将执行拆分为多个并行路径，再对它们进行合并、分组、排序等操作。使用 promises，可以轻松地在直接异步风格控制流和反转回调风格控制流之间来回切换。

### 实时模式与节流模式

CCXT Pro 支持两种 tick 函数循环模式——实时模式和节流模式。下面以伪代码形式展示：

```javascript
// real-time mode
const limit = 5 // optional
while (true) {
    try {
        const orderbook = await exchange.watchOrderBook (symbol, limit)
        // your reaction to the update takes place here
        // you arrive here after receiving the update from the exchange in real time
        console.log (orderbook) // every update
    } catch (e) {
        console.log (e)
        // throw e // uncomment to stop the loop on exceptions
    }
}
```

```javascript
// throttling mode
const limit = 5 // optional
// await is optional, alternatively you can launch it in bg without await
await exchange.watchOrderBook (symbol, limit)
while (true) {
    // your reaction takes place here
    // you arrive here every 100 ms regardless of whether there was an update or not
    // in throttling mode offloading the orderbook with .limit () is required
    console.log (exchange.orderbooks[symbol].limit (limit))
    await exchange.sleep (100) // every 100 ms
}
```

在**实时模式**下，CCXT Pro 将在每次收到来自交易所的新增量时立即返回结果。统一调用在实时循环中的一般逻辑是等待下一个增量，并立即将统一结果结构返回给用户，如此循环往复。当反应时间至关重要或需要尽可能快时，此模式非常有用。

然而，实时模式在同步多个并行 tick 循环时需要具备异步流编程经验。除此之外，在高活跃度或高波动性时期，交易所可能会推送大量更新。因此，开发实时算法的用户必须确保用户端代码能够跟上如此快速的数据消费速度。实时模式有时对资源的要求更高。

在**节流模式**下，CCXT Pro 将在后台接收和管理数据。用户负责在必要时定期提取结果。节流循环的一般逻辑是大部分时间处于休眠状态，偶尔唤醒以检查结果。这通常以固定频率（即"帧率"）执行。节流循环中的代码通常更易于跨多个交易所同步。节流循环中对时间的合理分配也有助于将资源使用量降至最低。当算法较为复杂且需要精确控制执行频率以避免过于频繁运行时，此模式非常实用。

节流模式的明显缺点是对更新的响应速度较慢。当交易算法需要等待若干毫秒才能执行时，可能有一两条更新在此时间到期之前就已到达。在节流模式下，用户只会在下次唤醒（循环迭代）时检查这些更新，因此反应延迟可能在若干毫秒的范围内随时间波动。

## 公共方法

### watchOrderBook

`watchOrderBook` 的接口与 [fetchOrderBook](/docs/manual#order-book) 相同，接受三个参数：

- `symbol` – 字符串，统一 CCXT 交易对符号，必填
- `limit` – 整数，返回的最大买/卖单数量，可选
- `params` – 关联字典，可选覆盖项，详见[覆盖统一 API 参数](/docs/manual#overriding-unified-api-params)

总体而言，交易所可分为两类：

1. 支持有限订单簿的交易所（仅推送订单栈顶部分）
2. 仅推送完整订单簿的交易所

如果交易所接受限制参数，则 `limit` 参数会在通过 WebSocket 连接订阅订单簿流时发送给交易所。交易所随后只发送指定数量的订单，从而有助于减少流量。部分交易所可能只接受特定的 `limit` 值，例如 10、25、50、100 等。

如果底层交易所不接受限制参数，则限制在客户端进行。

`limit` 参数并不保证买单或卖单的数量始终等于 `limit`。它指定的是上限或最大值，因此在某些时刻买单或卖单可能少于 `limit`，但永远不会超过 `limit`。这种情况发生在交易所订单簿中没有足够订单时，或者订单簿中某个顶部订单被撮合并从订单簿中移除，导致买方或卖方剩余条目少于 `limit` 时。订单簿中的空位通常会很快被新数据填补。

```javascript tab="JavaScript"
if (exchange.has['watchOrderBook']) {
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol, limit, params)
            console.log (new Date (), symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```
```python tab="Python"
if exchange.has['watchOrderBook']:
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol, limit, params)
            print(exchange.iso8601(exchange.milliseconds()), symbol, orderbook['asks'][0], orderbook['bids'][0])
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```
```php tab="PHP"
if ($exchange->has['watchOrderBook']) {
    $exchange::execute_and_run(function() use ($exchange, $symbol, $limit, $params) {
        while (true) {
            try {
                $orderbook = yield $exchange->watch_order_book($symbol, $limit, $params);
                echo date('c'), ' ', $symbol, ' ', json_encode(array($orderbook['asks'][0], $orderbook['bids'][0])), "\n";
            } catch (Exception $e) {
                echo get_class($e), ' ', $e->getMessage(), "\n";
            }
        }
    });
}
```
```c# tab="C#/.NET"
if ((bool)exchange.has["watchOrderBook"])
{
    while (true)
    {
        try
        {
            var orderbook = await exchange.WatchOrderBook(symbol);
            Console.WriteLine(orderbook["symbol"] + " " + orderbook.asks + " " + orderbook.bids);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}
```
```go tab="Go"
for {
    orderbook, err := exchange.WatchOrderBook(symbol)
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(orderbook.Asks[0], orderbook.Bids[0])
}
```
```java tab="Java"
import io.github.ccxt.types.OrderBook;

Binance exchange = new Binance();
exchange.loadMarkets(false);
while (true) {
    try {
        OrderBook orderbook = exchange.watchOrderBook(symbol);
        System.out.println(orderbook.bids.get(0));
    } catch (Exception e) {
        System.out.println(e.getMessage());
    }
}
```


#### watchOrderBookForSymbols

与 `watchOrderBook` 类似，但接受一个交易对符号数组，可通过单条消息订阅多个订单簿。


```javascript tab="JavaScript"
if (exchange.has['watchOrderBookForSymbols']) {
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBookForSymbols (['BTC/USDT', 'LTC/USDT'], limit, params)
            console.log (new Date (), symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```
```python tab="Python"
if exchange.has['watchOrderBookForSymbols']:
    while True:
        try:
            orderbook = await exchange.watchOrderBookForSymbols(['BTC/USDT', 'LTC/USDT'], limit, params)
            print(exchange.iso8601(exchange.milliseconds()), symbol, orderbook['asks'][0], orderbook['bids'][0])
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```


### watchTicker
部分交易所允许使用不同的主题来监听行情（例如：bookTicker）。您可以在 `exchange.options['watchTicker']['name']` 中进行设置。
```javascript
// JavaScript
if (exchange.has['watchTicker']) {
    while (true) {
        try {
            const ticker = await exchange.watchTicker (symbol, params)
            console.log (new Date (), ticker)
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```

```python
# Python
if exchange.has['watchTicker']:
    while True:
        try:
            ticker = await exchange.watch_ticker(symbol, params)
            print(exchange.iso8601(exchange.milliseconds()), ticker)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```
```php tab="PHP"
if ($exchange->has['watchTicker']) {
    $exchange::execute_and_run(function() use ($exchange, $symbol, $params) {
        while (true) {
            try {
                $ticker = yield $exchange->watch_ticker($symbol, $params);
                echo date('c'), ' ', json_encode($ticker), "\n";
            } catch (Exception $e) {
                echo get_class($e), ' ', $e->getMessage(), "\n";
            }
        }
    });
}
```
```c# tab="C#/.NET"
if ((bool)exchange.has["watchTicker"])
{
    while (true)
    {
        try
        {
            var ticker = await exchange.WatchTicker(symbol, parameters);
            Console.WriteLine(ticker.last);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}
```
```go tab="Go"
for {
    ticker, err := exchange.WatchTicker(symbol)
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(ticker.Last)
}
```
```java tab="Java"
while (true) {
    Object ticker = exchange.watchTicker(symbol).get(30, TimeUnit.SECONDS);
    System.out.println(ticker);
}
```


### watchTickers


```javascript tab="JavaScript"
if (exchange.has['watchTickers']) {
    while (true) {
        try {
            const tickers = await exchange.watchTickers (symbols, params)
            console.log (new Date (), tickers)
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```
```python tab="Python"
if exchange.has['watchTickers']:
    while True:
        try:
            tickers = await exchange.watch_tickers(symbols, params)
            print(exchange.iso8601(exchange.milliseconds()), tickers)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```
```php tab="PHP"
if ($exchange->has['watchTickers']) {
    $exchange::execute_and_run(function() use ($exchange, $symbols, $params) {
        while (true) {
            try {
                $tickers = yield $exchange->watch_tickers($symbols, $params);
                echo date('c'), ' ', json_encode($tickers), "\n";
            } catch (Exception $e) {
                echo get_class($e), ' ', $e->getMessage(), "\n";
            }
        }
    });
}
```
```c# tab="C#/.NET"
if ((bool)exchange.has["watchTickers"])
{
    while (true)
    {
        try
        {
            var tickers = await exchange.WatchTickers(symbols, parameters);
            Console.WriteLine(tickers.tickers.Count + " tickers");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}
```
```go tab="Go"
for {
    tickers, err := exchange.WatchTickers(ccxt.WithWatchTickersSymbols(symbols))
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(len(tickers.Tickers))
}
```
```java tab="Java"
while (true) {
    Object tickers = exchange.watchTickers(symbols).get(30, TimeUnit.SECONDS);
    System.out.println(tickers);
}
```


### watchOHLCV

关于 WebSocket 有一个非常常见的误解，即 WS OHLCV 数据流能够以某种方式加速交易策略。
如果您的应用程序目的是实现 OHLCV 交易或投机性算法策略，**请仔细考虑以下内容**。

总体而言，算法中使用的交易数据分为两种类型：

- 一阶实时数据，如订单簿和成交记录
- 二阶非实时数据，如行情、OHLCV 等

当开发者说"实时"时，通常指伪实时，简单来说就是"尽可能快、尽可能接近实时"。

二阶数据**始终**由一阶数据计算得出。OHLCV 由聚合成交记录计算得出。行情由成交记录和订单簿计算得出。

部分交易所会在交易所端为您计算 OHLCV（二阶数据）并通过 WS 推送更新（如 Binance）。其他交易所则认为这不是必要的，自有其原因。

显然，从成交记录计算二阶 OHLCV K 线需要时间。除此之外，将计算后的 K 线发送给所有已连接用户也需要时间。在高波动期间，若交易所在高负载下被频繁交易，还可能出现额外延迟。

从交易所计算二阶数据并通过 WS 推送给您所需的时间没有严格保证。不同交易所的 OHLCV K 线延迟和滞后可能差异显著。例如，某交易所可能在对应周期实际收盘约 30 秒后才发送 OHLCV 更新。其他交易所可能以固定间隔（例如每 100 毫秒一次）发送当前 OHLCV 更新，而实际上成交记录的发生频率可能远高于此。

大多数人使用 WS 是为了避免各种延迟并获取实时数据。因此，在大多数情况下，不等待交易所计算往往更好。自行从一阶数据重新计算二阶数据可能快得多，从而降低不必要的延迟。因此，仅使用 WS 监听来自交易所的 OHLCV K 线意义不大。开发者更倾向于使用 `watch_trades()`，并利用 CCXT 内置方法（如 `build_ohlcvc()`）重新计算 OHLCV K 线。

```python
# Python
exchange = ccxtpro.binance()
if not exchange.has['watchOHLCV']:
    while True:
        try:
            trades = await exchange.watch_trades(symbol)
            ohlcvc = exchange.build_ohlcvc(trades, '1m')
            print(ohlcvc)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```

这解释了为何某些交易所合理地认为 WS 场景中不需要 OHLCV，因为用户仅凭一阶实时成交记录的 WS 数据流即可在用户端更快地计算出该信息。

如果您的应用对时间不是非常敏感，仍可出于图表绘制目的订阅 OHLCV 数据流。如果底层 `exchange.has['watchOHLCV']` 为真，您可以按以下方式使用 `watchOHLCV()/watch_ohlcv()`：


```javascript tab="JavaScript"
if (exchange.has['watchOHLCV']) {
    while (true) {
        try {
            const candles = await exchange.watchOHLCV (symbol, timeframe, since, limit, params)
            console.log (new Date (), candles)
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```
```python tab="Python"
if exchange.has['watchOHLCV']:
    while True:
        try:
            candles = await exchange.watch_ohlcv(symbol, timeframe, since, limit, params)
            print(exchange.iso8601(exchange.milliseconds()), candles)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```
```php tab="PHP"
if ($exchange->has['watchOHLCV']) {
    $exchange::execute_and_run(function() use ($exchange, $symbol, $timeframe, $since, $limit, $params) {
        while (true) {
            try {
                $candles = yield $exchange->watch_ohlcv($symbol, $timeframe, $since, $limit, $params);
                echo date('c'), ' ', $symbol, ' ', $timeframe, ' ', json_encode($candles), "\n";
            } catch (Exception $e) {
                echo get_class($e), ' ', $e->getMessage(), "\n";
            }
        }
    });
}
```
```c# tab="C#/.NET"
if ((bool)exchange.has["watchOHLCV"])
{
    while (true)
    {
        try
        {
            var candles = await exchange.WatchOHLCV(symbol, timeframe);
            Console.WriteLine(candles.Count + " candles");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}
```
```go tab="Go"
for {
    candles, err := exchange.WatchOHLCV(symbol)
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(len(candles))
}
```
```java tab="Java"
while (true) {
    Object ohlcv = exchange.watchOHLCV(symbol, "1m").get(30, TimeUnit.SECONDS);
    System.out.println(ohlcv);
}
```


### watchOHLCVForSymbols

与 `watchOHLCV` 类似，但允许同时订阅多个交易对和时间周期。

```javascript tab="JavaScript"
if (exchange.has['watchOHLCVForSymbols']) {
    while (true) {
        try {
            const subscriptions = [[
                ['BTC/USDT', '1d'],
                ['LTC/USDT', '5m'],
                ['ETH/USDT', '1h']
            ]]
            const candles = await exchange.watchOHLCVForSymbols (subscriptions, since, limit, params)
            console.log (new Date (), candles)
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```
```python tab="Python"
if exchange.has['watchOHLCVForSymbols']:
    while True:
        try:
            subscriptions = [[
                ['BTC/USDT', '1d'],
                ['LTC/USDT', '5m'],
                ['ETH/USDT', '1h']
            ]]
            candles = await exchange.watch_ohlcv_for_symbols(subscriptions, since, limit, params)
            print(exchange.iso8601(exchange.milliseconds()), candles)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```
```php tab="PHP"
if ($exchange->has['watchOHLCVForSymbols']) {
    $exchange::execute_and_run(function() use ($exchange, $since, $limit, $params) {
        while (true) {
            try {
                $subscriptions = array(
                    array('BTC/USDT', '1d'),
                    array('LTC/USDT', '5m'),
                    array('ETH/USDT', '1h'),
                );
                $candles = yield $exchange->watch_ohlcv_for_symbols($subscriptions, $since, $limit, $params);
                echo date('c'), ' ', json_encode($candles), "\n";
            } catch (Exception $e) {
                echo get_class($e), ' ', $e->getMessage(), "\n";
            }
        }
    });
}
```
```c# tab="C#/.NET"
if ((bool)exchange.has["watchOHLCVForSymbols"])
{
    var subscriptions = new List<List<string>>() {
        new List<string>() { "BTC/USDT", "1d" },
        new List<string>() { "LTC/USDT", "5m" },
        new List<string>() { "ETH/USDT", "1h" },
    };
    while (true)
    {
        try
        {
            var candles = await exchange.WatchOHLCVForSymbols(subscriptions);
            Console.WriteLine(candles.Count + " symbols");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}
```
```go tab="Go"
subscriptions := [][]string{
    {"BTC/USDT", "1d"},
    {"LTC/USDT", "5m"},
    {"ETH/USDT", "1h"},
}
for {
    candles, err := exchange.WatchOHLCVForSymbols(subscriptions)
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(len(candles))
}
```
```java tab="Java"
while (true) {
    Object ohlcv = exchange.watchOHLCVForSymbols(symbols, "1m").get(30, TimeUnit.SECONDS);
    System.out.println(ohlcv);
}
```


### watchTrades

```javascript tab="JavaScript"
// JavaScript
if (exchange.has['watchTrades']) {
    while (true) {
        try {
            const trades = await exchange.watchTrades (symbol, since, limit, params)
            console.log (new Date (), trades)
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```
```python tab="Python"
if exchange.has['watchTrades']:
    while True:
        try:
            trades = await exchange.watch_trades(symbol, since, limit, params)
            print(exchange.iso8601(exchange.milliseconds()), trades)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```
```php tab="PHP"
if ($exchange->has['watchTrades']) {
    $exchange::execute_and_run(function() use ($exchange, $symbol, $since, $limit, $params) {
        while (true) {
            try {
                $trades = yield $exchange->watch_trades($symbol, $since, $limit, $params);
                echo date('c'), ' ', json_encode($trades), "\n";
            } catch (Exception $e) {
                echo get_class($e), ' ', $e->getMessage(), "\n";
            }
        }
    });
}
```
```c# tab="C#/.NET"
if ((bool)exchange.has["watchTrades"])
{
    while (true)
    {
        try
        {
            var trades = await exchange.WatchTrades(symbol);
            Console.WriteLine(trades.Count + " trades");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}
```
```go tab="Go"
for {
    trades, err := exchange.WatchTrades(symbol)
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(len(trades))
}
```
```java tab="Java"
while (true) {
    Object trades = exchange.watchTrades(symbol).get(30, TimeUnit.SECONDS);
    System.out.println(trades);
}
```

### watchTradesForSymbols

与 `watchTrades` 类似，但允许在单次调用中订阅多个交易对。


```javascript tab="JavaScript"
if (exchange.has['watchTradesForSymbols']) {
    while (true) {
        try {
            const trades = await exchange.watchTradesForSymbols (['LTC/USDT', 'BTC/USDT'], since, limit, params)
            console.log (new Date (), trades)
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```
```python tab="Python"
if exchange.has['watchTradesForSymbols']:
    while True:
        try:
            trades = await exchange.watchTradesForSymbols(['LTC/USDT', 'BTC/USDT'], since, limit, params)
            print(exchange.iso8601(exchange.milliseconds()), trades)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```
```php tab="PHP"
if ($exchange->has['watchTradesForSymbols']) {
    $exchange::execute_and_run(function() use ($exchange, $since, $limit, $params) {
        while (true) {
            try {
                $trades = yield $exchange->watch_trades_for_symbols(array('LTC/USDT', 'BTC/USDT'), $since, $limit, $params);
                echo date('c'), ' ', json_encode($trades), "\n";
            } catch (Exception $e) {
                echo get_class($e), ' ', $e->getMessage(), "\n";
            }
        }
    });
}
```
```c# tab="C#/.NET"
if ((bool)exchange.has["watchTradesForSymbols"])
{
    var symbols = new List<string>() { "LTC/USDT", "BTC/USDT" };
    while (true)
    {
        try
        {
            var trades = await exchange.WatchTradesForSymbols(symbols);
            Console.WriteLine(trades.Count + " trades");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}
```
```go tab="Go"
symbols := []string{"LTC/USDT", "BTC/USDT"}
for {
    trades, err := exchange.WatchTradesForSymbols(symbols)
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(len(trades))
}
```
```java tab="Java"
while (true) {
    Object trades = exchange.watchTradesForSymbols(symbols).get(30, TimeUnit.SECONDS);
    System.out.println(trades);
}
```


## 私有方法

在大多数情况下，认证逻辑借自 CCXT，因为交易所对 REST API 和 WebSocket API 使用相同的密钥对和签名算法。详见 [API Keys Setup](/docs/manual#api-keys-setup)。

### watchBalance

```javascript tab="JavaScript"
if (exchange.has['watchBalance']) {
    while (true) {
        try {
            const balance = await exchange.watchBalance (params)
            console.log (new Date (), balance)
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```
```python tab="Python"
if exchange.has['watchBalance']:
    while True:
        try:
            balance = await exchange.watch_balance(params)
            print(exchange.iso8601(exchange.milliseconds()), balance)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```
```php tab="PHP"
if ($exchange->has['watchBalance']) {
    $exchange::execute_and_run(function() use ($exchange, $params) {
        while (true) {
            try {
                $balance = yield $exchange->watch_balance($params);
                echo date('c'), ' ', json_encode($balance), "\n";
            } catch (Exception $e) {
                echo get_class($e), ' ', $e->getMessage(), "\n";
            }
        }
    });
}
```
```c# tab="C#/.NET"
if ((bool)exchange.has["watchBalance"])
{
    while (true)
    {
        try
        {
            var balance = await exchange.WatchBalance();
            Console.WriteLine(balance);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}
```
```go tab="Go"
for {
    balance, err := exchange.WatchBalance()
    if err != nil {
        fmt.Println(err)
        break
    }
    fmt.Println(balance)
}
```
```java tab="Java"
while (true) {
    Object balance = exchange.watchBalance().get(30, TimeUnit.SECONDS);
    System.out.println(balance);
}
```


### watchOrders


```javascript tab="JavaScript"
watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```
```python tab="Python"
watch_orders(symbol=None, since=None, limit=None, params={})
```
```php tab="PHP"
watch_orders($symbol = null, $since = null, $lmit = null, $params = array());
```

```c# tab="C#/.NET"
public async Task<List<Order>> WatchOrders(string symbol = null, Int64? since2 = 0, Int64? limit2 = 0, Dictionary<string, object> parameters = null)
```
```go tab="Go"
func (this *Binance) WatchOrders(options ...ccxt.WatchOrdersOptions) ([]ccxt.Order, error)
```
```java tab="Java"
while (true) {
    Object orders = exchange.watchOrders(symbol).get(30, TimeUnit.SECONDS);
    System.out.println(orders);
}
```


### watchMyTrades

```javascript tab="JavaScript"
watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {})
```
```python tab="Python"
watch_my_trades(symbol=None, since=None, limit=None, params={})
```
```php tab="PHP"
watch_my_trades($symbol = null, $since = null, $lmit = null, $params = array());
```

```c# tab="C#/.NET"
public async Task<List<Trade>> WatchMyTrades(string symbol = null, Int64? since2 = 0, Int64? limit2 = 0, Dictionary<string, object> parameters = null)

```
```go tab="Go"
func (this *Binance) WatchMyTrades(options ...ccxt.WatchMyTradesOptions) ([]ccxt.Trade, error)
```
```java tab="Java"
while (true) {
    Object trades = exchange.watchMyTrades(symbol).get(30, TimeUnit.SECONDS);
    System.out.println(trades);
}
```


### watchPositions
监听所有持仓并返回 [持仓结构](/docs/manual#position-structure) 列表


```javascript tab="JavaScript"
watchPositions (symbols = undefined, since = undefined, limit = undefined, params = {}) 
```
```python tab="Python"
watch_positions(symbols=None, since=None, limit=None, params={})
```
```php tab="PHP"
watch_positions($symbols = null, $since = null, $lmit = null, $params = array());
```

```c# tab="C#/.NET"
public async Task<List<Position>> WatchPositions(List<string> symbols = null, Int64? since2 = 0, Int64? limit2 = 0, Dictionary<string, object> parameters = null)
```
```go tab="Go"
func (this *Binance) WatchPositions(options ...ccxt.WatchPositionsOptions) ([]ccxt.Position, error)
```
```java tab="Java"
while (true) {
    Object positions = exchange.watchPositions(symbols).get(30, TimeUnit.SECONDS);
    System.out.println(positions);
}
```


### createOrderWs

```typescript tab="TypeScript"
createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: number = undefined, params = {})
```
```python tab="Python"
create_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Optional[float] = None, params={})
```
```php tab="PHP"
create_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ())
```

```c# tab="C#/.NET"
    public async Task<Order> CreateOrderWs(string symbol, string type, string side, float amount, float? price2 = 0, Dictionary<string, object> parameters = null)
```
```go tab="Go"
func (this *Binance) CreateOrderWs(symbol string, typeVar string, side string, amount float64, options ...ccxt.CreateOrderWsOptions) (ccxt.Order, error)
```
```java tab="Java"
Object order = exchange.createOrderWs("BTC/USDT", "limit", "buy", 0.001, 50000.0).get(30, TimeUnit.SECONDS);
System.out.println(order);
```

### editOrderWs

```typescript tab="TypeScript"
// JavaScript
editOrderWs (id, symbol: string, type: OrderType, side: OrderSide, amount: number, price: number = undefined, params = {})
```
```python tab="Python"
edit_order_ws(self, id, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Optional[float] = None, params={})
```
```php tab="PHP"
edit_order_ws(string id, string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ())
```
```c# tab="C#/.NET"
public async Task<Order> EditOrderWs(string id, string symbol, string type, string side, double? amount2 = 0, double? price2 = 0, Dictionary<string, object> parameters = null)
```
```go tab="Go"
func (this *Binance) EditOrderWs(id string, symbol string, typeVar string, side string, options ...ccxt.EditOrderWsOptions) (ccxt.Order, error)
```
```java tab="Java"
Object order = exchange.editOrderWs(orderId, "BTC/USDT", "limit", "buy", 0.002, 51000.0).get(30, TimeUnit.SECONDS);
System.out.println(order);
```


### cancelOrderWs

```typescript tab="TypeScript"
cancelOrderWs(id: string, symbol: string = undefined, params = {})
```
```python tab="Python"
cancel_order_ws(self, id, symbol: str, params={})
```
```php tab="PHP"
cancel_order_ws(string $id, string $symbol, $params = array ())
```
```c# tab="C#/.NET"
public async Task<Order> CancelOrderWs(string id, string symbol = null, Dictionary<string, object> parameters = null)
```
```go tab="Go"
func (this *Binance) CancelOrderWs(id string, options ...ccxt.CancelOrderWsOptions) (ccxt.Order, error)
```
```java tab="Java"
Object result = exchange.cancelOrderWs(orderId, "BTC/USDT").get(30, TimeUnit.SECONDS);
System.out.println(result);
```


### cancelOrdersWs

```typescript tab="TypeScript"
cancelOrdersWs(ids: string[], symbol: string = undefined, params = {})
```
```python tab="Python"
cancel_orders_ws(self, ids, symbol: str, params={})
```
```php tab="PHP"
cancel_orders_ws(string[] $ids, string $symbol, $params = array ())
```
```c# tab="C#/.NET"
public async Task<List<Order>> CancelOrdersWs(List<string> ids, string symbol = null, Dictionary<string, object> parameters = null)
```
```go tab="Go"
func (this *Binance) CancelOrdersWs(ids []string, options ...ccxt.CancelOrdersWsOptions) ([]ccxt.Order, error)
```
```java tab="Java"
Object result = exchange.cancelOrdersWs(orderIds, "BTC/USDT").get(30, TimeUnit.SECONDS);
System.out.println(result);
```


### cancelAllOrdersWs

```typescript tab="TypeScript"
cancelAllOrdersWs(symbol: string = undefined, params = {})
```
```python tab="Python"
cancel_all_orders_ws(self, symbol: str, params={})
```
```php tab="PHP"
cancel_all_orders_ws(string $symbol, $params = array ())
```
```c# tab="C#/.NET"
public async Task<List<Order>> CancelAllOrdersWs(string symbol = null, Dictionary<string, object> parameters = null)
```
```go tab="Go"
func (this *Binance) CancelAllOrdersWs(options ...ccxt.CancelAllOrdersWsOptions) ([]ccxt.Order, error)
```
```java tab="Java"
Object result = exchange.cancelAllOrdersWs("BTC/USDT").get(30, TimeUnit.SECONDS);
System.out.println(result);
```


### watchTransactions

```diff
- this method is a work in progress now (may be unavailable)
```

### 自定义处理器

如果您希望访问原始传入消息并使用自定义处理器，可以覆盖交易所的 `handleMessage/handle_message` 方法，例如：

A) 通过继承：


```javascript tab="JavaScript"
class myExchange extends ccxt.pro.coinbase {
    handleMessage (wsClient, data) {
        console.log("Raw incoming message:", message) // this is the raw update
        super.handleMessage(wsClient, data);
        // your extra logic here
    }
}
const ex = new myExchange();
ex.watchTicker('BTC/USDT');
```
```python tab="Python"

class my_exchange(ccxt.pro.coinbase):
    def handle_message(self, client, message):
        print("Raw incoming message:", message)  # this is the raw update
        super().handle_message(client, message)
        # your extra logic here

async def example():
    ex = my_exchange()
    await ex.watch_ticker('BTC/USDT')

asyncio.run(example())
```
```php tab="PHP"
class myBinance extends \ccxt\pro\binance {
    public function __construct($options = array()) {
        parent::__construct($options);
    }

    // your custom handler
    public function handle_message($ws, $message) {
        parent::handle_message($ws, $message); // trigger original `handleMessage`
        if ($your_condition) {
            // execute your additional code
        }
    }
}

$ex = new myBinance();
$ex->watch_ticker('BTC/USDT');

```
```c# tab="C#/.NET"
using ccxt.pro;

class MyExchange : ccxt.pro.coinbase
{
    public override void handleMessage(WebSocketClient client, object message)
    {
        Console.WriteLine("Raw incoming message: " + message); // this is the raw update
        base.handleMessage(client, message);
        // your extra logic here
    }
}

var ex = new MyExchange();
await ex.WatchTicker("BTC/USDT");
```


B) 通过覆盖方法：


```javascript tab="JavaScript"
function myHandler(ws, data, orignal_handler){
    orignal_handler(ws, data); // trigger original `handleMessage`
    if (your_condition) {
        // execute your additional code
    }
}

const ex = new ccxt.pro.binance();
const original_handler = ex.handleMessage.bind(ex);
ex.handleMessage = (ws, data) => myHandler(ws, data, original_handler);
ex.watchTicker('BTC/USDT');
```
```python tab="Python"

def myHandler(instance, ws, data, original_handle_message):
    original_handle_message(ws, data)  # trigger original `handleMessage`
    if your_condition:
        # execute your additional code

async def example():
    e = ccxt.pro.binance()
    original_handle_message = e.handle_message
    e.handle_message = lambda ws, data: myHandler(e, ws, data, original_handle_message)
    await e.watch_ticker('BTC/USDT')

asyncio.run(example())
```


### 错误处理

发生错误时，CCXT Pro 将抛出标准的 CCXT 异常，详情请参阅 [错误处理](/docs/index#error-handling)。
