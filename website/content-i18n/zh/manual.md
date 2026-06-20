---
title: "手册"
description: "ccxt 库是一组可用的加密货币交易所或交易所类的集合。每个类实现了特定加密货币交易所的公共和私有 API……"
---

# 概述

ccxt 库是一组可用的加密货币*交易所*或交易所类的集合。每个类实现了特定加密货币交易所的公共和私有 API。所有交易所均继承自基础 Exchange 类，并共享一组通用方法。要从 ccxt 库访问特定交易所，您需要创建相应交易所类的实例。支持的交易所会频繁更新，并定期添加新的交易所。

该库的结构概述如下：

```text
                                 User
    +-------------------------------------------------------------+
    |                            CCXT                             |
    +------------------------------+------------------------------+
    |            Public            |           Private            |
    +=============================================================+
    │                              .                              |
    │                    The Unified CCXT API                     |
    │                              .                              |
    |       loadMarkets            .           fetchBalance       |
    |       fetchMarkets           .            createOrder       |
    |       fetchCurrencies        .            cancelOrder       |
    |       fetchTicker            .             fetchOrder       |
    |       fetchTickers           .            fetchOrders       |
    |       fetchOrderBook         .        fetchOpenOrders       |
    |       fetchOHLCV             .      fetchClosedOrders       |
    |       fetchStatus            .          fetchMyTrades       |
    |       fetchTrades            .                deposit       |
    |                              .               withdraw       |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |                     Custom Exchange API                     |
    |         (Derived Classes And Their Implicit Methods)        |
    │                              .                              |
    |       publicGet...           .          privateGet...       |
    |       publicPost...          .         privatePost...       |
    |                              .          privatePut...       |
    |                              .       privateDelete...       |
    |                              .                   sign       |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |                      Base Exchange Class                    |
    │                              .                              |
    +=============================================================+
```

所有交易所的完整公共和私有 HTTP REST API 均已在 JavaScript、Python、PHP、C#、Go 和 Java 中实现。WebSocket 实现可在 [CCXT Pro](https://ccxt.pro) 中获得，支持 WebSocket 数据流。

- [**交易所**](#exchanges)
- [**市场**](#markets)
- [**隐式 API**](#implicit-api)
- [**统一 API**](#unified-api)
- [**公共 API**](#public-api)
- [**私有 API**](#private-api)
- [**错误处理**](#error-handling)
- [**故障排查**](#troubleshooting)
- [**CCXT Pro**](#ccxt-pro)

## 社交媒体

- <sub>[![Twitter](https://img.shields.io/twitter/follow/ccxt_official?style=social)](https://twitter.com/ccxt_official)</sub> 在 Twitter 上关注我们
- <sub>[![Medium](https://img.shields.io/badge/read-our%20blog-black?logo=medium)](https://medium.com/@ccxt)</sub> 在 Medium 上阅读我们的博客
- <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> 加入我们的 Discord
- <sub>[![Telegram Chat](https://img.shields.io/badge/CCXT-Chat-blue?logo=telegram)](https://t.me/ccxt_chat)</sub> CCXT Telegram 聊天（技术支持）

- 公告频道：
- - <sub>[![Telegram](https://img.shields.io/badge/CCXT-Channel-blue?logo=telegram)](https://t.me/ccxt_announcements)</sub>
- - <sub>[![Discord](https://img.shields.io/badge/CCXT-Channel-blue?logo=discord)](https://discord.com/channels/690203284119617602/1057748769690619984)</sub>


# 交易所

- [实例化](#instantiation)
- [交易所结构](#exchange-structure)
- [频率限制](#rate-limit)
<!--- init list -->CCXT 库目前支持以下 108 个加密货币交易所市场和交易 API：

|logo                                                                                                                                                                                                 |id                     |name                                                                                         |ver                                                                                                                                               |type                                                                                                    |certified                                                                                                                    |pro                                                                                                |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|---------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------:|--------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| ![aftermath](https://github.com/user-attachments/assets/70e5ae86-2f3a-4755-976b-aedb9d3c2807)                                                                                          | aftermath             | AftermathFinance                                                               | ![API Version 1](https://img.shields.io/badge/1-lightgray)                                                                          | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![alpaca](https://github.com/user-attachments/assets/e9476df8-a450-4c3e-ab9a-1a7794219e1b)](https://alpaca.markets)                                                                                | alpaca                | [Alpaca](https://alpaca.markets)                                                            | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://alpaca.markets/docs/)                                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![apex](https://github.com/user-attachments/assets/fef8f2f7-4265-46aa-965e-33a91881cb00)](https://omni.apex.exchange/trade)                                                                        | apex                  | [Apex](https://omni.apex.exchange/trade)                                                    | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api-docs.pro.apex.exchange)                                                 | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![arkham](https://github.com/user-attachments/assets/5cefdcfb-2c10-445b-835c-fa21317bf5ac)](https://arkm.com/register?ref=ccxt)                                                                    | arkham                | [ARKHAM](https://arkm.com/register?ref=ccxt)                                                | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://arkm.com/limits-api)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![ascendex](https://github.com/user-attachments/assets/55bab6b9-d4ca-42a8-a0e6-fac81ae557f1)](https://ascendex.com/en-us/register?inviteCode=EL6BXBQM)                                             | ascendex              | [AscendEX](https://ascendex.com/en-us/register?inviteCode=EL6BXBQM)                         | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://ascendex.github.io/ascendex-pro-api/#ascendex-pro-api-documentation)        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![aster](https://github.com/user-attachments/assets/4982201b-73cd-4d7a-8907-e69e239e9609)](https://www.asterdex.com/en/referral/aA1c2B)                                                            | aster                 | [Aster](https://www.asterdex.com/en/referral/aA1c2B)                                        | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/asterdex/api-docs)                                               | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![backpack](https://github.com/user-attachments/assets/cc04c278-679f-4554-9f72-930dd632b80f)](https://backpack.exchange/join/ccxt)                                                                 | backpack              | [Backpack](https://backpack.exchange/join/ccxt)                                             | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.backpack.exchange/)                                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bequant](https://github.com/user-attachments/assets/0583ef1f-29fe-4b7c-8189-63565a0e2867)](https://bequant.io/referral/dd104e3bee7634ec)                                                         | bequant               | [Bequant](https://bequant.io/referral/dd104e3bee7634ec)                                     | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.bequant.io/)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bigone](https://github.com/user-attachments/assets/4e5cfd53-98cc-4b90-92cd-0d7b512653d1)](https://b1.run/users/new?code=D3LLBVFT)                                                                | bigone                | [BigONE](https://b1.run/users/new?code=D3LLBVFT)                                            | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://open.big.one/docs/api.html)                                                 | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![binance](https://github.com/user-attachments/assets/e9419b93-ccb0-46aa-9bff-c883f096274b)](https://accounts.binance.com/register?ref=CCXTCOM)                                                    | binance               | [Binance](https://accounts.binance.com/register?ref=CCXTCOM)                                | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://developers.binance.com/en)                                                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![binancecoinm](https://github.com/user-attachments/assets/387cfc4e-5f33-48cd-8f5c-cd4854dabf0c)](https://accounts.binance.com/register?ref=CCXTCOM)                                               | binancecoinm          | [Binance COIN-M](https://accounts.binance.com/register?ref=CCXTCOM)                         | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/delivery/en/)                                | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![binanceus](https://github.com/user-attachments/assets/a9667919-b632-4d52-a832-df89f8a35e8c)](https://www.binance.us/?ref=35005074)                                                               | binanceus             | [Binance US](https://www.binance.us/?ref=35005074)                                          | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://github.com/binance-us/binance-official-api-docs)                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![binanceusdm](https://github.com/user-attachments/assets/871cbea7-eebb-4b28-b260-c1c91df0487a)](https://accounts.binance.com/register?ref=CCXTCOM)                                                | binanceusdm           | [Binance USDⓈ-M](https://accounts.binance.com/register?ref=CCXTCOM)                         | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/futures/en/)                                 | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bingx](https://github-production-user-asset-6210df.s3.amazonaws.com/1294454/253675376-6983b72e-4999-4549-b177-33b374c195e3.jpg)](https://bingx.com/invite/OHETOM)                                | bingx                 | [BingX](https://bingx.com/invite/OHETOM)                                                    | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://bingx-api.github.io/docs/)                                                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bit2c](https://github.com/user-attachments/assets/db0bce50-6842-4c09-a1d5-0c87d22118aa)](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                                           | bit2c                 | [Bit2C](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                       | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://www.bit2c.co.il/home/api)                                                   | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![bitbank](https://github.com/user-attachments/assets/9d616de0-8a88-4468-8e38-d269acab0348)](https://bitbank.cc/)                                                                                  | bitbank               | [bitbank](https://bitbank.cc/)                                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.bitbank.cc/)                                                           | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![bitbns](https://github.com/user-attachments/assets/a5b9a562-cdd8-4bea-9fa7-fd24c1dad3d9)](https://ref.bitbns.com/1090961)                                                                        | bitbns                | [Bitbns](https://ref.bitbns.com/1090961)                                                    | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://bitbns.com/trade/#/api-trading/)                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![bitfinex](https://github.com/user-attachments/assets/4a8e947f-ab46-481a-a8ae-8b20e9b03178)](https://www.bitfinex.com)                                                                            | bitfinex              | [Bitfinex](https://www.bitfinex.com)                                                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.bitfinex.com/v2/docs/)                                                 | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitflyer](https://github.com/user-attachments/assets/d0217747-e54d-4533-8416-0d553dca74bb)](https://bitflyer.com)                                                                                | bitflyer              | [bitFlyer](https://bitflyer.com)                                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://lightning.bitflyer.com/docs?lang=en)                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![bitget](https://github.com/user-attachments/assets/fbaa10cc-a277-441d-a5b7-997dd9a87658)](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)                         | bitget                | [Bitget](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)     | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.bitget.com/api-doc/common/intro)                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bithumb](https://github.com/user-attachments/assets/c9e0eefb-4777-46b9-8f09-9d7f7c4af82d)](https://www.bithumb.com)                                                                              | bithumb               | [Bithumb](https://www.bithumb.com)                                                          | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://apidocs.bithumb.com)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitmart](https://github.com/user-attachments/assets/0623e9c4-f50e-48c9-82bd-65c3908c3a14)](http://www.bitmart.com/?r=rQCFLh)                                                                     | bitmart               | [BitMart](http://www.bitmart.com/?r=rQCFLh)                                                 | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://developer-pro.bitmart.com/)                                                 | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitmex](https://github.com/user-attachments/assets/c78425ab-78d5-49d6-bd14-db7734798f04)](https://www.bitmex.com/app/register/NZTR1q)                                                            | bitmex                | [BitMEX](https://www.bitmex.com/app/register/NZTR1q)                                        | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.bitmex.com/app/apiOverview)                                             | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitopro](https://github.com/user-attachments/assets/affc6337-b95a-44bf-aacd-04f9722364f6)](https://www.bitopro.com)                                                                              | bitopro               | [BitoPro](https://www.bitopro.com)                                                          | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md) | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitrue](https://github.com/user-attachments/assets/67abe346-1273-461a-bd7c-42fa32907c8e)](https://www.bitrue.com/affiliate/landing?cn=600000&inviteCode=EZWETQE)                                 | bitrue                | [Bitrue](https://www.bitrue.com/affiliate/landing?cn=600000&inviteCode=EZWETQE)             | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/Bitrue-exchange/bitrue-official-api-docs)                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitso](https://github.com/user-attachments/assets/178c8e56-9054-4107-b192-5e5053d4f975)](https://bitso.com/?ref=itej)                                                                            | bitso                 | [Bitso](https://bitso.com/?ref=itej)                                                        | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://bitso.com/api_info)                                                         | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![bitstamp](https://github.com/user-attachments/assets/d5480572-1fee-43cb-b900-d38c522d0024)](https://www.bitstamp.net)                                                                            | bitstamp              | [Bitstamp](https://www.bitstamp.net)                                                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.bitstamp.net/api)                                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitteam](https://github.com/user-attachments/assets/b41b5e0d-98e5-4bd3-8a6e-aeb230a4a135)](https://bit.team/auth/sign-up?ref=bitboy2023)                                                         | bitteam               | [BIT.TEAM](https://bit.team/auth/sign-up?ref=bitboy2023)                                    | [![API Version 2.0.6](https://img.shields.io/badge/2.0.6-lightgray)](https://bit.team/trade/api/documentation)                                   | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![bittrade](https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg)](https://www.bittrade.co.jp/register/?invite_code=znnq3)                          | bittrade              | [BitTrade](https://www.bittrade.co.jp/register/?invite_code=znnq3)                          | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://api-doc.bittrade.co.jp)                                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bitvavo](https://github.com/user-attachments/assets/d213155c-8c71-4701-9bd5-45351febc2a8)](https://bitvavo.com/?a=24F34952F7)                                                                    | bitvavo               | [Bitvavo](https://bitvavo.com/?a=24F34952F7)                                                | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.bitvavo.com/)                                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![blockchaincom](https://github.com/user-attachments/assets/975e3054-3399-4363-bcee-ec3c6d63d4e8)](https://blockchain.com)                                                                         | blockchaincom         | [Blockchain.com](https://blockchain.com)                                                    | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.blockchain.com/v3)                                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![blofin](https://github.com/user-attachments/assets/518cdf80-f05d-4821-a3e3-d48ceb41d73b)](https://blofin.com/register?referral_code=f79EsS)                                                      | blofin                | [BloFin](https://blofin.com/register?referral_code=f79EsS)                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://blofin.com/docs)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![btcbox](https://github.com/user-attachments/assets/1e2cb499-8d0f-4f8f-9464-3c015cfbc76b)](https://www.btcbox.co.jp/)                                                                             | btcbox                | [BtcBox](https://www.btcbox.co.jp/)                                                         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://blog.btcbox.jp/en/archives/8762)                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![btcmarkets](https://github.com/user-attachments/assets/8c8d6907-3873-4cc4-ad20-e22fba28247e)](https://btcmarkets.net)                                                                            | btcmarkets            | [BTC Markets](https://btcmarkets.net)                                                       | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.btcmarkets.net/doc/v3)                                                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![btcturk](https://github.com/user-attachments/assets/10e0a238-9f60-4b06-9dda-edfc7602f1d6)](https://www.btcturk.com)                                                                              | btcturk               | [BTCTurk](https://www.btcturk.com)                                                          | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://github.com/BTCTrader/broker-api-docs)                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![bullish](https://github.com/user-attachments/assets/68f0686b-84f0-4da9-a751-f7089af3a9ed)](https://bullish.com/)                                                                                 | bullish               | [Bullish](https://bullish.com/)                                                             | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.exchange.bullish.com/docs/api/rest/)                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bybit](https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed)](https://www.bybit.com/invite?ref=XDK12WP)                                                               | bybit                 | [Bybit](https://www.bybit.com/invite?ref=XDK12WP)                                           | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://bybit-exchange.github.io/docs/inverse/)                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bybiteu](https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed)](https://www.bybit.com/invite?ref=XDK12WP)                                                             | bybiteu               | [Bybit EU](https://www.bybit.com/invite?ref=XDK12WP)                                        | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://bybit-exchange.github.io/docs/inverse/)                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![bydfi](https://github.com/user-attachments/assets/bfffb73d-29bd-465d-b75b-98e210491769)](https://partner.bydfi.com/j/DilWutCI)                                                                   | bydfi                 | [BYDFi](https://partner.bydfi.com/j/DilWutCI)                                               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://developers.bydfi.com/en/)                                                   | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)](https://cex.io/r/0/up105393824/0/)                                                    | cex                   | [CEX.IO](https://cex.io/r/0/up105393824/0/)                                                 | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://trade.cex.io/docs/)                                                         | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coinbase](https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg)](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                          | coinbase              | [Coinbase Advanced](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                 | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.cdp.coinbase.com/coinbase-app/introduction/welcome)                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coinbaseexchange](https://github.com/ccxt/ccxt/assets/43336371/34a65553-88aa-4a38-a714-064bd228b97e)](https://coinbase.com/)                                                                     | coinbaseexchange      | [Coinbase Exchange](https://coinbase.com/)                                                  | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.cloud.coinbase.com/exchange/docs/)                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coinbaseinternational](https://github.com/ccxt/ccxt/assets/43336371/866ae638-6ab5-4ebf-ab2c-cdcce9545625)](https://international.coinbase.com)                                                   | coinbaseinternational | [Coinbase International](https://international.coinbase.com)                                | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.cloud.coinbase.com/intx/docs)                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coincheck](https://user-images.githubusercontent.com/51840849/87182088-1d6d6380-c2ec-11ea-9c64-8ab9f9b289f5.jpg)](https://coincheck.com)                                                         | coincheck             | [coincheck](https://coincheck.com)                                                          | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://coincheck.com/documents/exchange/api)                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![coinex](https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg)](https://www.coinex.com/register?refer_code=yw5fz)                                 | coinex                | [CoinEx](https://www.coinex.com/register?refer_code=yw5fz)                                  | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.coinex.com/api/v2)                                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![coinmate](https://user-images.githubusercontent.com/51840849/87460806-1c9f3f00-c616-11ea-8c46-a77018a8f3f4.jpg)](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0)       | coinmate              | [CoinMate](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0)        | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://coinmate.docs.apiary.io)                                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![coinmetro](https://github.com/ccxt/ccxt/assets/43336371/e86f87ec-6ba3-4410-962b-f7988c5db539)](https://go.coinmetro.com/?ref=crypto24)                                                           | coinmetro             | [Coinmetro](https://go.coinmetro.com/?ref=crypto24)                                         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://documenter.getpostman.com/view/3653795/SVfWN6KS)                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![coinone](https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg)](https://coinone.co.kr)                                                            | coinone               | [CoinOne](https://coinone.co.kr)                                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://doc.coinone.co.kr)                                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![coinsph](https://user-images.githubusercontent.com/1294454/225719995-48ab2026-4ddb-496c-9da7-0d7566617c9b.jpg)](https://www.coins.ph/en-ph/register?invite_code=1371062463303277512&broker=9001) | coinsph               | [Coins.ph](https://www.coins.ph/en-ph/register?invite_code=1371062463303277512&broker=9001) | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://coins-docs.github.io/rest-api)                                              | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![coinspot](https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg)](https://www.coinspot.com.au/register?code=PJURCU)                                | coinspot              | [CoinSpot](https://www.coinspot.com.au/register?code=PJURCU)                                | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://www.coinspot.com.au/api)                                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![cryptocom](https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg)](https://crypto.com/exch/kdacthrnxt)                                           | cryptocom             | [Crypto.com](https://crypto.com/exch/kdacthrnxt)                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html)                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![cryptomus](https://github.com/user-attachments/assets/8e0b1c48-7c01-4177-9224-f1b01d89d7e7)](https://app.cryptomus.com/signup/?ref=JRP4yj)                                                       | cryptomus             | [Cryptomus](https://app.cryptomus.com/signup/?ref=JRP4yj)                                   | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://doc.cryptomus.com/personal)                                                 | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![deepcoin](https://github.com/user-attachments/assets/ddf3e178-c3b6-409d-8f9f-af8b7cf80454)](https://s.deepcoin.com/UzkyODgy)                                                                     | deepcoin              | [DeepCoin](https://s.deepcoin.com/UzkyODgy)                                                 | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.deepcoin.com/docs)                                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![delta](https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg)](https://www.delta.exchange/app/signup/?code=IULYNB)                                 | delta                 | [Delta Exchange](https://www.delta.exchange/app/signup/?code=IULYNB)                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.delta.exchange)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![deribit](https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg)](https://www.deribit.com/reg-1189.4038)                                            | deribit               | [Deribit](https://www.deribit.com/reg-1189.4038)                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.deribit.com/v2)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![derive](https://github.com/user-attachments/assets/f835b95f-033a-43dd-b6bb-24e698fc498c)](https://www.derive.xyz/invite/3VB0B)                                                                   | derive                | [derive](https://www.derive.xyz/invite/3VB0B)                                               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.derive.xyz/docs/)                                                      | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![digifinex](https://user-images.githubusercontent.com/51840849/87443315-01283a00-c5fe-11ea-8628-c2a0feaf07ac.jpg)](https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp)                | digifinex             | [DigiFinex](https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp)                 | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://docs.digifinex.com)                                                         | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![dydx](https://github.com/user-attachments/assets/617ea0c1-f05a-4d26-9fcb-a0d1d4091ae1)](https://dydx.trade?ref=ccxt)                                                                                     | dydx                  | [dYdX](https://dydx.trade?ref=ccxt)                                                                 | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://docs.dydx.xyz)                                                              | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![exmo](https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg)](https://exmo.me/?ref=131685)                                                         | exmo                  | [EXMO](https://exmo.me/?ref=131685)                                                         | [![API Version 1.1](https://img.shields.io/badge/1.1-lightgray)](https://exmo.me/en/api_doc?ref=131685)                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![fmfwio](https://user-images.githubusercontent.com/1294454/159177712-b685b40c-5269-4cea-ac83-f7894c49525d.jpg)](https://fmfw.io/referral/da948b21d6c92d69)                                        | fmfwio                | [FMFW.io](https://fmfw.io/referral/da948b21d6c92d69)                                        | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.fmfw.io/)                                                               | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![foxbit](https://github.com/user-attachments/assets/1f8faca2-ae2f-4222-b33e-5671e7d873dd)](https://app.foxbit.com.br)                                                                             | foxbit                | [Foxbit](https://app.foxbit.com.br)                                                         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.foxbit.com.br)                                                         | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![gate](https://github.com/user-attachments/assets/64f988c5-07b6-4652-b5c1-679a6bf67c85)](https://www.gate.com/share/CCXTGATE)                                                                     | gate                  | [Gate](https://www.gate.com/share/CCXTGATE)                                                 | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://www.gate.com/docs/developers/apiv4/en)                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)](https://gemini.com/)                                                               | gemini                | [Gemini](https://gemini.com/)                                                               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.gemini.com/rest-api)                                                   | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![grvt](https://github.com/user-attachments/assets/7a2e8108-29f6-45d1-822d-48eb1c8cbbe6)](https://grvt.io/?ref=WBLS9D1)                                                                            | grvt                  | [GRVT](https://grvt.io/?ref=WBLS9D1)                                                        | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://api-docs.grvt.io/)                                                          | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![hashkey](https://github.com/user-attachments/assets/6dd6127b-cc19-4a13-9b29-a98d81f80e98)](https://global.hashkey.com/en-US/register/invite?invite_code=82FQUN)                                  | hashkey               | [HashKey Global](https://global.hashkey.com/en-US/register/invite?invite_code=82FQUN)       | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://hashkeyglobal-apidoc.readme.io/)                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![hibachi](https://github.com/user-attachments/assets/7301bbb1-4f27-4167-8a55-75f74b14e973)](https://hibachi.xyz/r/ZBL2YFWIHU)                                                                             | hibachi               | [Hibachi](https://hibachi.xyz/r/ZBL2YFWIHU)                                                         | ![API Version *](https://img.shields.io/badge/*-lightgray)                                                                          | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             |                                                                                                   |
| [![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                          | hitbtc                | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                          | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.hitbtc.com)                                                             | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![hollaex](https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg)](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                           | hollaex               | [HollaEx](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                           | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://apidocs.hollaex.com)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![htx](https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg)](https://www.htx.com/invite/en-us/1h?invite_code=6rmm2223)                          | htx                   | [HTX](https://www.htx.com/invite/en-us/1h?invite_code=6rmm2223)                          | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://huobiapi.github.io/docs/spot/v1/en/)                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![hyperliquid](https://github.com/ccxt/ccxt/assets/43336371/b371bc6c-4a8c-489f-87f4-20a913dd8d4b)](https://app.hyperliquid.xyz/)                                                                   | hyperliquid           | [Hyperliquid](https://app.hyperliquid.xyz/)                                                 | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)                 | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![independentreserve](https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg)](https://www.independentreserve.com)                                   | independentreserve    | [Independent Reserve](https://www.independentreserve.com)                                   | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://www.independentreserve.com/API)                                             | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![indodax](https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg)](https://indodax.com/ref/testbitcoincoid/1)                                       | indodax               | [INDODAX](https://indodax.com/ref/testbitcoincoid/1)                                        | [![API Version 2.0](https://img.shields.io/badge/2.0-lightgray)](https://github.com/btcid/indodax-official-api-docs)                             | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                                           | kraken                | [Kraken](https://www.kraken.com)                                                            | [![API Version 0](https://img.shields.io/badge/0-lightgray)](https://docs.kraken.com/rest/)                                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![krakenfutures](https://user-images.githubusercontent.com/24300605/81436764-b22fd580-9172-11ea-9703-742783e6376d.jpg)](https://futures.kraken.com/)                                               | krakenfutures         | [Kraken Futures](https://futures.kraken.com/)                                               | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://docs.kraken.com/api/docs/futures-api/trading/market-data/)                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![kucoin](https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg)](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                               | kucoin                | [KuCoin](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                                | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.kucoin.com)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![kucoinfutures](https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg)](https://futures.kucoin.com/?rcode=E5wkqe)                                  | kucoinfutures         | [KuCoin Futures](https://futures.kucoin.com/?rcode=E5wkqe)                                  | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.kucoin.com)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![latoken](https://user-images.githubusercontent.com/1294454/61511972-24c39f00-aa01-11e9-9f7c-471f1d6e5214.jpg)](https://latoken.com/invite?r=mvgp2djk)                                            | latoken               | [Latoken](https://latoken.com/invite?r=mvgp2djk)                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://api.latoken.com)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)](https://www.lbank.com/login/?icode=7QCY)                                            | lbank                 | [LBank](https://www.lbank.com/login/?icode=7QCY)                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.lbank.com/en-US/docs/index.html)                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![lighter](https://github.com/user-attachments/assets/ff1aaf96-bffb-4545-a750-5eba716e75d0)](https://app.lighter.xyz/?referral=715955W9)                                                                   | lighter               | [Lighter](https://app.lighter.xyz/?referral=715955W9)                                               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://apidocs.lighter.xyz/)                                                       | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)](https://www.luno.com/invite/44893A)                                                  | luno                  | [luno](https://www.luno.com/invite/44893A)                                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.luno.com/en/api)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![mercado](https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg)](https://www.mercadobitcoin.com.br)                                                | mercado               | [Mercado Bitcoin](https://www.mercadobitcoin.com.br)                                        | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://www.mercadobitcoin.com.br/api-doc)                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![mexc](https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg)](https://www.mexc.com/register?inviteCode=mexc-1FQ1GNu1)                             | mexc                  | [MEXC Global](https://www.mexc.com/register?inviteCode=mexc-1FQ1GNu1)                       | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://mexcdevelop.github.io/apidocs/)                                             | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![modetrade](https://github.com/user-attachments/assets/cec2b7f1-3b2b-4502-971b-447ee1937d6b)](https://trade.mode.network?ref=MODETRADE)                                                           | modetrade             | [Mode Trade](https://trade.mode.network?ref=MODETRADE)                                      | ![API Version 1](https://img.shields.io/badge/1-lightgray)                                                                          | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![myokx](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.my.okx.com/join/CCXT2023)                                              | myokx                 | [MyOKX (EEA)](https://www.my.okx.com/join/CCXT2023)                                         | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://my.okx.com/docs-v5/en/#overview)                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![ndax](https://user-images.githubusercontent.com/1294454/108623144-67a3ef00-744e-11eb-8140-75c6b851e945.jpg)](https://one.ndax.io/bfQiSL)                                                         | ndax                  | [NDAX](https://one.ndax.io/bfQiSL)                                                          | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://apidoc.ndax.io/)                                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![novadax](https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg)](https://www.novadax.com.br/?s=ccxt)                                               | novadax               | [NovaDAX](https://www.novadax.com.br/?s=ccxt)                                               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://doc.novadax.com/pt-BR/)                                                     | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![okx](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.okx.com/join/CCXTCOM)                                                    | okx                   | [OKX](https://www.okx.com/join/CCXTCOM)                                                     | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://www.okx.com/docs-v5/en/)                                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![okxus](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.app.okx.com/join/CCXT2023)                                             | okxus                 | [OKX (US)](https://www.app.okx.com/join/CCXT2023)                                           | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://app.okx.com/docs-v5/en/#overview)                                           | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![onetrading](https://github.com/ccxt/ccxt/assets/43336371/bdbc26fd-02f2-4ca7-9f1e-17333690bb1c)](https://onetrading.com/)                                                                         | onetrading            | [One Trading](https://onetrading.com/)                                                      | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.onetrading.com)                                                        | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![oxfun](https://github.com/ccxt/ccxt/assets/43336371/6a196124-c1ee-4fae-8573-962071b61a85)](https://ox.fun/register?shareAccountId=5ZUD4a7G)                                                      | oxfun                 | [OXFUN](https://ox.fun/register?shareAccountId=5ZUD4a7G)                                    | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://docs.ox.fun/)                                                               | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![p2b](https://github.com/ccxt/ccxt/assets/43336371/8da13a80-1f0a-49be-bb90-ff8b25164755)](https://p2pb2b.com?referral=ee784c53)                                                                   | p2b                   | [p2b](https://p2pb2b.com?referral=ee784c53)                                                 | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md)                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![pacifica](https://github.com/user-attachments/assets/f795515a-828e-4a04-8fca-bf19fcf17ea4)](https://app.pacifica.fi?referral=ccxt)                                                               | pacifica              | [Pacifica](https://app.pacifica.fi?referral=ccxt)                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.pacifica.fi/api-documentation/api/rest-api)                            | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![paradex](https://github.com/user-attachments/assets/84628770-784e-4ec4-a759-ec2fbb2244ea)](https://app.paradex.trade/r/ccxt24)                                                                   | paradex               | [Paradex](https://app.paradex.trade/r/ccxt24)                                               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.api.testnet.paradex.trade/)                                            | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![paymium](https://user-images.githubusercontent.com/51840849/87153930-f0f02200-c2c0-11ea-9c0a-40337375ae89.jpg)](https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj)              | paymium               | [Paymium](https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj)               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/Paymium/api-documentation)                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![phemex](https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg)](https://phemex.com/register?referralCode=EDNVJ)                                    | phemex                | [Phemex](https://phemex.com/register?referralCode=EDNVJ)                                    | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://phemex-docs.github.io/#overview)                                            | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://poloniex.com/signup?c=UBFZJRPJ)                                          | poloniex              | [Poloniex](https://poloniex.com/signup?c=UBFZJRPJ)                                          | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://api-docs.poloniex.com/spot/)                                                | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![tokocrypto](https://user-images.githubusercontent.com/1294454/183870484-d3398d0c-f6a1-4cce-91b8-d58792308716.jpg)](https://tokocrypto.com)                                                       | tokocrypto            | [Tokocrypto](https://tokocrypto.com)                                                        | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.tokocrypto.com/apidocs/)                                                | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![toobit](https://github.com/user-attachments/assets/0c7a97d5-182c-492e-b921-23540c868e0e)](https://www.toobit.com/en-US/r?i=IFFPy0)                                                               | toobit                | [Toobit](https://www.toobit.com/en-US/r?i=IFFPy0)                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://toobit-docs.github.io/apidocs/spot/v1/en/)                                  | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                                                  | upbit                 | [Upbit](https://upbit.com)                                                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.upbit.com/kr)                                                          | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![wavesexchange](https://user-images.githubusercontent.com/1294454/84547058-5fb27d80-ad0b-11ea-8711-78ac8b3c7f31.jpg)](https://wx.network)                                                         | wavesexchange         | [Waves.Exchange](https://wx.network)                                                        | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.wx.network)                                                            | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  |                                                                                                                             |                                                                                                   |
| [![weex](https://github.com/user-attachments/assets/ccbadb2d-5035-403d-898f-dce831bdc936)](https://www.weex.com/register?vipCode=qfyh)                                                              | weex                  | [Weex](https://www.weex.com/register?vipCode=qfyh)                                          | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://www.weex.com/api-doc)                                                       | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![whitebit](https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg)](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)              | whitebit              | [WhiteBit](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)              | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://github.com/whitebit-exchange/api-docs)                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![woo](https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg)](https://woox.io/register?ref=DIJT0CNL)                                               | woo                   | [WOO X](https://woox.io/register?ref=DIJT0CNL)                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.woox.io/)                                                              | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![woofipro](https://github.com/user-attachments/assets/9ba21b8a-a9c7-4770-b7f1-ce3bcbde68c1)](https://dex.woo.org/en/trade?ref=CCXT)                                                               | woofipro              | [WOOFI PRO](https://dex.woo.org/en/trade?ref=CCXT)                                          | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://orderly.network/docs/build-on-omnichain/building-on-evm)                    | ![DEX - Distributed EXchange](https://img.shields.io/badge/DEX-blue.svg "DEX - Distributed EXchange")  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](/docs/certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![xt](https://user-images.githubusercontent.com/14319357/232636712-466df2fc-560a-4ca4-aab2-b1d954a58e24.jpg)](https://www.xt.com/en/accounts/register?ref=9PTM9VW)                                 | xt                    | [XT](https://www.xt.com/en/accounts/register?ref=9PTM9VW)                                   | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://doc.xt.com/)                                                                | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](/docs/pro-manual) |
| [![yobit](https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg)](https://www.yobit.net)                                                              | yobit                 | [YoBit](https://www.yobit.net)                                                              | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://www.yobit.net/en/api/)                                                      | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![zaif](https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg)](https://zaif.jp)                                                                     | zaif                  | [Zaif](https://zaif.jp)                                                                     | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://techbureau-api-document.readthedocs.io/ja/latest/index.html)                | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
| [![zebpay](https://github.com/user-attachments/assets/8094e7be-55a7-46f4-a087-0ca31b48ecad)](https://www.zebpay.com)                                                                                | zebpay                | [Zebpay](https://www.zebpay.com)                                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/zebpay/zebpay-api-references)                                    | ![CEX – Centralized EXchange](https://img.shields.io/badge/CEX-green.svg "CEX – Centralized EXchange") |                                                                                                                             |                                                                                                   |
<!--- end list -->

除了进行基本的市价单和限价单交易外，一些交易所还提供保证金交易（杠杆）、各种衍生品（如期货合约和期权），以及[暗池](https://en.wikipedia.org/wiki/Dark_pool)、[OTC](https://en.wikipedia.org/wiki/Over-the-counter_(finance))（场外交易）、商户 API 等更多功能。

## 实例化

要连接到交易所并开始交易，您需要从 ccxt 库中实例化一个交易所类。

要以编程方式获取所有受支持交易所 id 的完整列表：


```javascript tab="JavaScript"
const ccxt = require ('ccxt')
console.log (ccxt.exchanges)
```
```python tab="Python"
import ccxt
print (ccxt.exchanges)
```
```php tab="PHP"
include 'ccxt.php';
var_dump (\ccxt\Exchange::$exchanges);
```
```go tab="Go"
import (
    "fmt"
    "github.com/ccxt/ccxt/go/v4"
)

fmt.Println(ccxt.Exchanges)
```
```csharp tab="C#"
using ccxt;

Console.WriteLine(string.Join(", ", ccxt.Exchange.exchanges));
```
```java tab="Java"
import io.github.ccxt.Exchange;
// use Exchange.dynamicallyCreateInstance(id, config) to create exchanges
```


以下示例展示了如何实例化一个交易所：


```javascript tab="JavaScript"
const ccxt = require ('ccxt')
let exchange = new ccxt.kraken () // default id
let kraken1 = new ccxt.kraken ({ id: 'kraken1' })
let kraken2 = new ccxt.kraken ({ id: 'kraken2' })
let id = 'coinbasepro'
let coinbasepro = new ccxt[id] ();

// from variable id
const exchangeId = 'binance'
    , exchangeClass = ccxt[exchangeId]
    , exchange = new exchangeClass ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })
```
```python tab="Python"
import ccxt
exchange = ccxt.okcoin () # default id
okcoin1 = ccxt.okcoin ({ 'id': 'okcoin1' })
okcoin2 = ccxt.okcoin ({ 'id': 'okcoin2' })
id = 'btcchina'
btcchina = eval ('ccxt.%s ()' % id)
coinbasepro = getattr (ccxt, 'coinbasepro') ()

# from variable id
exchange_id = 'binance'
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})
```
#### **PHP**

PHP 版的 ccxt 库使用内置的 UTC/GMT 时间函数，因此在使用该库的 PHP 版本之前，您需要在 `php.ini` 中设置 `date.timezone`，或调用 [date_default_timezone_set()](http://php.net/manual/en/function.date-default-timezone-set.php) 函数。推荐的时区设置为 `"UTC"`。

```php
// PHP
date_default_timezone_set('UTC');
include 'ccxt.php';
$bitfinex = new \ccxt\bitfinex(); // default id
$bitfinex1 = new \ccxt\bitfinex(array('id' => 'bitfinex1'));
$bitfinex2 = new \ccxt\bitfinex(array('id' => 'bitfinex2'));
$id = 'kraken';
$exchange = '\\ccxt\\' . $id;
$kraken = new $exchange();

// from variable id
$exchange_id = 'binance';
$exchange_class = "\\ccxt\\$exchange_id";
$exchange = new $exchange_class(array(
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
));
```
```go tab="Go"
import (
    "github.com/ccxt/ccxt/go/v4"
)

bitfinex := ccxt.NewBitfinex(nil) // default id

// from variable id
exchange := ccxt.CreateExchange("binance", map[string]interface{}{
    "apiKey": "YOUR_API_KEY",
    "secret": "YOUR_SECRET",
})
```
```csharp tab="C#"
using ccxt;

var kraken = new Kraken(); // default id

// with config
var binance = new Binance(new Dictionary<string, object>() {
    { "apiKey", "YOUR_API_KEY" },
    { "secret", "YOUR_SECRET" },
});
```
```java tab="Java"
import io.github.ccxt.exchanges.Kraken;
import io.github.ccxt.exchanges.Binance;
import java.util.HashMap;
import java.util.Map;

Kraken kraken = new Kraken();

// with config
Map<String, Object> config = new HashMap<>();
config.put("apiKey", "YOUR_API_KEY");
config.put("secret", "YOUR_SECRET");
Binance binance = new Binance(config);
```


### 功能特性

主要交易所提供 `.features` 属性，您可以通过它查看每种市场类型所支持的方法和功能（如果某个方法被设置为 `null/undefined`，则表示该交易所"不支持"该方法）。

*此功能目前仍在开发中，可能尚不完整，欢迎反馈您发现的任何问题*

```javascript
const exchange = new ccxt.binance()
console.log(exchange.features);

// outputs like:
{
  spot: {
    sandbox: true, // whether testnet is supported
    createOrder: {
      triggerPrice: true,          // if trigger order is supported
      triggerPriceType: undefined, // if trigger price type is supported (last, mark, index)
      triggerDirection: false,     // if trigger direction is supported (ascending, descending)
      stopLossPrice: true,         // if you can use createOrder to place a standalone stop-loss order (read "Stop Loss Orders" paragraph) 
      takeProfitPrice: true,       // ... similar as above
      stopLoss: {                  // if attached stopLoss can be sent together with an primary entry order
        triggerPriceType: {
            last: true,
            mark: true,
            index: true,
        },
        price: true,               // if 'limit' price is supported to be set (otherwise only market order would be supported)
      },
      takeProfit : ...,            // ... similar as above
      marginMode: true,            // if `marginMode` param is supported (cross, isolated)
      timeInForce: {               // supported TIF types
        GTC: true,
        IOC: true,
        FOK: true,
        PO: true,
        GTD: false
      },
      hedged: false,              // if `hedged` param is supported (true, false)
      leverage: false,            // if `leverage` param is supported (true, false)
      selfTradePrevention: true,  // if `selfTradePrevention` param is supported (true, false)
      trailing: true,             // if trailing order is supported
      iceberg: true,              // if iceberg order is supported
      marketBuyByCost: true,      // if creating market buy order is possible with `cost` param
      marketBuyRequiresPrice: true,// if creating market buy order (if 'cost' not used) requires `price` param to be set
    },
    createOrders: {
        'max': 50,              // if batch order creation is supported
    },
    fetchMyTrades: {
      limit: 1000,              // max limit per call
      daysBack: undefined,      // max historical period that can be accessed
      untilDays: 1              // if `until` param is supported, then this is permitted distance from `since`
    },
    fetchOrder: {
      marginMode: true,         // when supported, margin order should be fetched with this flag
      trigger: false,           // similar as above
      trailing: false           // similar as above
    },
    // other methods have similar properties
    fetchOpenOrders: {
      limit: undefined,
      marginMode: true,
      trigger: false,
      trailing: false
    },
    fetchOrders: {
      limit: 1000,
      daysBack: undefined,
      untilDays: 10000,
      marginMode: true,
      trigger: false,
      trailing: false
    },
    fetchClosedOrders: {
      limit: 1000,
      daysBackClosed: undefined, // max days-back for closed orders
      daysBackCanceled: undefined, // max days-back for canceled orders
      untilDays: 10000,
      marginMode: true,
      trigger: false,
      trailing: false
    },
    fetchOHLCV: {
      paginate: true,
      limit: 1000
    }
  },
  swap: {
    linear: { ... }, // similar to above dict
    inverse: { ... }, // similar to above dict
  }
  future: {
    linear: { ... }, // similar to above dict
    inverse: { ... }, // similar to above dict
  }
}
```


### 在实例化时覆盖交易所属性

大多数交易所属性以及特定选项都可以在实例化交易所类时或之后进行覆盖，如下所示：


```javascript tab="JavaScript"

const exchange = new ccxt.binance ({
    'rateLimit': 10000, // unified exchange property
    'headers': {
        'YOUR_CUSTOM_HTTP_HEADER': 'YOUR_CUSTOM_VALUE',
    },
    'options': {
        'adjustForTimeDifference': true, // exchange-specific option
    }
})
exchange.options['adjustForTimeDifference'] = false
```


```python tab="Python"
exchange = ccxt.binance ({
    'rateLimit': 10000,  # unified exchange property
    'headers': {
        'YOUR_CUSTOM_HTTP_HEADER': 'YOUR_CUSTOM_VALUE',
    },
    'options': {
        'adjustForTimeDifference': True,  # exchange-specific option
    }
})
exchange.options['adjustForTimeDifference'] = False
```

```php tab="PHP"
$exchange_id = 'binance';
$exchange_class = "\\ccxt\\$exchange_id";
$exchange = new $exchange_class(array(
    'rateLimit' => 10000, // unified exchange property
    'headers' => array(
        'YOUR_CUSTOM_HTTP_HEADER' => 'YOUR_CUSTOM_VALUE',
    ),
    'options' => array(
        'adjustForTimeDifference' => true, // exchange-specific option
    ),
));
$exchange->options['adjustForTimeDifference'] = false;
```
```go tab="Go"
exchange := ccxt.NewBinance(map[string]interface{}{
    "rateLimit": 10000, // unified exchange property
    "headers": map[string]interface{}{
        "YOUR_CUSTOM_HTTP_HEADER": "YOUR_CUSTOM_VALUE",
    },
    "options": map[string]interface{}{
        "adjustForTimeDifference": true, // exchange-specific option
    },
})
exchange.Options.Store("adjustForTimeDifference", false)
```
```csharp tab="C#"
var exchange = new Binance(new Dictionary<string, object>() {
    { "rateLimit", 10000 }, // unified exchange property
    { "headers", new Dictionary<string, object>() {
        { "YOUR_CUSTOM_HTTP_HEADER", "YOUR_CUSTOM_VALUE" },
    } },
    { "options", new Dictionary<string, object>() {
        { "adjustForTimeDifference", true }, // exchange-specific option
    } },
});
exchange.options["adjustForTimeDifference"] = false;
```
```java tab="Java"
Map<String, Object> config = new HashMap<>();
config.put("rateLimit", 10000);
config.put("options", Map.of("adjustForTimeDifference", true));
Exchange exchange = Exchange.dynamicallyCreateInstance("binance", config);
((Map<String, Object>) exchange.options).put("adjustForTimeDifference", false);
```


### 覆盖交易所方法

在 CCXT 支持的所有语言中，您都可以在运行时覆盖实例方法：


```javascript tab="JavaScript"

const ex = new ccxt.binance ();
ex.fetch_ticker = function (symbol, params = {}) {
    // your codes go here
};
console.log (ex.fetch_ticker('BTC/USDT'));
```
```python tab="Python"
ex = ccxt.binance()
def my_overload(symbol, params = {}):
    # your codes go here

ex.fetch_ticker = my_overload
print(ex.fetch_ticker('BTC/USDT'))
```

```php tab="PHP"
$ex = new \ccxt\binance();
$ex->add_method('fetch_ticker', function($symbol, $params = []) {
    // your codes go here
});
var_dump($ex->call_method('fetch_ticker', ['BTC/USDT']));
```


### 测试网与沙盒环境

一些交易所还提供专用于测试目的的独立 API，允许开发者免费使用虚拟资金进行交易并验证自己的想法。这类 API 被称为 _"测试网"、"沙盒"或"预发布环境"_（使用虚拟测试资产），与使用真实资产的 _"主网"和"生产环境"_ 相对应。沙盒 API 通常是生产 API 的克隆，即完全相同的 API，唯一的区别在于交易所服务器的 URL。

CCXT 统一了这一方面，允许用户切换到交易所的沙盒环境（如果底层交易所支持的话）。
要切换到沙盒，必须在**创建交易所后立即调用** `exchange.setSandboxMode (true)` 或 `exchange.set_sandbox_mode(true)`，**在任何其他调用之前**！


```javascript tab="JavaScript"
const exchange = new ccxt.binance (config)
exchange.setSandboxMode (true) // enable sandbox mode
```

```python tab="Python"
exchange = ccxt.binance(config)
exchange.set_sandbox_mode(True)  # enable sandbox mode
```

```php tab="PHP"
$exchange = new \ccxt\binance($config);
$exchange->set_sandbox_mode(true); // enable sandbox mode
```
```go tab="Go"
exchange := ccxt.NewBinance(config)
exchange.SetSandboxMode(true) // enable sandbox mode
```
```csharp tab="C#"
var exchange = new Binance(config);
exchange.setSandboxMode(true); // enable sandbox mode
```
```java tab="Java"
Exchange exchange = Exchange.dynamicallyCreateInstance("binance", config);
exchange.setSandboxMode(true); // enable sandbox mode
```


- `exchange.setSandboxMode (true) / exchange.set_sandbox_mode (True)` 必须是创建交易所后立即进行的第一个调用（在任何其他调用之前）
- 要获取沙盒的 [API 密钥](#authentication)，用户需要在相应交易所的沙盒网站注册并创建沙盒密钥对
- **沙盒密钥与生产密钥不可互换！**

## 交易所结构

每个交易所都有一组属性和方法，其中大多数可以通过向交易所构造函数传递关联数组参数来覆盖。您也可以创建子类并覆盖所有内容。

以下是通用交易所属性的概览，附带示例值：

```javascript
{
    'id':   'exchange'                   // lowercase string exchange id
    'name': 'Exchange'                   // human-readable string
    'countries': [ 'US', 'CN', 'EU' ],   // array of ISO country codes
    'urls': {
        'api': 'https://api.example.com/data',  // string or dictionary of base API URLs
        'www': 'https://www.example.com'        // string website URL
        'doc': 'https://docs.example.com/api',  // string URL or array of URLs
    },
    'version':         'v1',             // string ending with digits
    'api':             { ... },          // dictionary of api endpoints
    'has': {                             // exchange capabilities
        'CORS': false,
        'cancelOrder': true,
        'createDepositAddress': false,
        'createOrder': true,
        'fetchBalance': true,
        'fetchCanceledOrders': false,
        'fetchClosedOrder': false,
        'fetchClosedOrders': false,
        'fetchCurrencies': false,
        'fetchDepositAddress': false,
        'fetchMarkets': true,
        'fetchMyTrades': false,
        'fetchOHLCV': false,
        'fetchOpenOrder': false,
        'fetchOpenOrders': false,
        'fetchOrder': false,
        'fetchOrderBook': true,
        'fetchOrders': false,
        'fetchStatus': 'emulated',
        'fetchTicker': true,
        'fetchTickers': false,
        'fetchBidsAsks': false,
        'fetchTrades': true,
        'withdraw': false,
    },
    'timeframes': {                      // empty if the exchange.has['fetchOHLCV'] !== true
        '1m': '1minute',
        '1h': '1hour',
        '1d': '1day',
        '1M': '1month',
        '1y': '1year',
    },
    'timeout':           10000,          // number in milliseconds
    'rateLimit':         2000,           // number in milliseconds
    'userAgent':        'ccxt/1.1.1 ...' // string, HTTP User-Agent header
    'verbose':           false,          // boolean, output error details
    'markets':          { ... }          // dictionary of markets/pairs by symbol
    'symbols':          [ ... ]          // sorted list of string symbols (traded pairs)
    'currencies':       { ... }          // dictionary of currencies by currency code
    'markets_by_id':    { ... },         // dictionary of array of dictionaries (markets) by id
    'currencies_by_id': { ... },         // dictionary of dictionaries (markets) by id
    'apiKey':   '92560ffae9b8a0421...',  // string public apiKey (ASCII, hex, Base64, ...)
    'secret':   '9aHjPmW+EtRRKN/Oi...'   // string private secret key
    'password': '6kszf4aci8r',           // string password
    'uid':      '123456',                // string user id
    'options':          { ... },         // exchange-specific options
    // ... other properties here ...
}
```

### 交易所属性

以下是每个基础交易所属性的详细说明：

- `id`：每个交易所都有一个默认 id。该 id 不用于任何功能，它是一个用于用户层交易所实例标识的字符串字面量。您可以为同一交易所创建多个链接，并通过 id 加以区分。默认 id 均为小写，与交易所名称对应。

- `name`：包含人类可读的交易所名称的字符串字面量。

- `countries`：由两位 ISO 国家代码字符串字面量组成的数组，表示该交易所的运营所在地。

- `urls['api']`：用于 API 调用的单个字符串字面量基础 URL，或包含私有和公共 API 独立 URL 的关联数组。

- `urls['www']`：主 HTTP 网站 URL。

- `urls['doc']`：指向交易所网站上原始 API 文档的单个字符串 URL 链接，或文档链接数组。

- `version`：包含当前交易所 API 版本标识符的字符串字面量。ccxt 库在每次请求时会将此版本字符串附加到 API 基础 URL。除非您正在实现新的交易所 API，否则无需修改。版本标识符通常是以字母 'v' 开头的数字字符串，例如 v1.1。除非您正在实现自己的新加密货币交易所类，否则请勿覆盖此项。

- `api`：包含加密货币交易所公开的所有 API 端点定义的关联数组。ccxt 使用该 API 定义自动为每个可用端点构造可调用的实例方法。

- `has`：交易所能力的关联数组（例如 `fetchTickers`、`fetchOHLCV` 或 `CORS`）。

- `timeframes`：由交易所 fetchOHLCV 方法支持的时间周期组成的关联数组。仅当 `has['fetchOHLCV']` 属性为 true 时才会填充。

- `timeout`：请求-响应往返的超时时间，单位为毫秒（默认超时为 10000 ms = 10 秒）。如果在该时间内未收到响应，库将抛出 `RequestTimeout` 异常。您可以保留默认超时值，或将其设置为合理的值。永久挂起而没有超时当然不是您的选择。一般情况下无需覆盖此选项。

- `rateLimit`：频率限制，单位为毫秒。该值表示在连续请求之间需要等待的毫秒数，以保持在交易所的频率限制内。例如，如果 `rateLimit` 为 1000，则表示每秒允许 1 次请求。内置频率限制器默认启用，可通过将 `enableRateLimit` 属性设置为 false 来关闭。

- `enableRateLimit`：布尔值（true/false），用于启用内置频率限制器并对连续请求进行节流。此设置默认为 `true`（启用）。**用户需要自行实现[频率限制](#rate-limit)，或保持内置频率限制器启用，以避免被交易所封禁**。

- `userAgent`：用于设置 HTTP User-Agent 请求头的对象。ccxt 库默认会设置其 User-Agent。某些交易所可能不接受。如果您在获取交易所回复时遇到困难，并希望关闭 User-Agent 或使用默认值，请将此值设为 false、undefined 或空字符串。`userAgent` 的值可能会被下方的 HTTP `headers` 属性覆盖。

- `headers`：HTTP 请求头及其值的关联数组。默认值为空 `{}`。所有请求头都将添加到所有请求的前面。如果在 `headers` 中设置了 `User-Agent` 请求头，它将覆盖上述 `userAgent` 属性中设置的任何值。

- `verbose`：布尔标志，指示是否将 HTTP 请求记录到标准输出（verbose 标志默认为 false）。Python 用户可以使用标准 Python 日志记录器进行 DEBUG 级别日志记录，通过在代码开头添加以下两行启用：
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- `returnResponseHeaders`：如果设置为 `true`，交易所的 HTTP 响应头将包含在 REST API 调用返回结果的 `info` 字段中的 `responseHeaders` 属性里。这对于访问频率限制信息或交易所特定请求头等元数据非常有用。默认情况下为 `false`，响应头不包含在响应中。注意：仅当响应为对象而非列表或字符串时才支持此功能。

- `markets`：以通用交易对或交易符号为索引的市场关联数组。访问此属性前应先加载市场。在交易所实例上调用 `loadMarkets() / load_markets()` 方法之前，市场不可用。

- `symbols`：交易所可用交易符号的非关联数组（列表），按字母顺序排序。这些是 `markets` 属性的键。交易符号从市场加载和重新加载。此属性是所有市场键的便捷简写。

- `currencies`：交易所可用货币的关联数组（字典），以代码（通常为 3 或 4 个字母）为键。货币从市场加载和重新加载。

- `markets_by_id`：以交易所特定 id 为索引的市场数组的关联数组。通常为长度为 1 的数组，除非存在多个具有相同 marketId 的市场。访问此属性前应先加载市场。

- `apiKey`：您的公共 API 密钥字符串字面量。大多数交易所需要[设置 API 密钥](#api-keys-setup)。

- `secret`：您的私有 API 密钥字符串字面量。大多数交易所也需要此项，与 apiKey 一起使用。

- `password`：包含您的密码/口令的字符串字面量。某些交易所需要此参数进行交易，但大多数不需要。

- `uid`：您账户的唯一 id。可以是字符串字面量或数字。某些交易所也需要此项进行交易，但大多数不需要。

- `requiredCredentials`：统一的关联字典，显示向底层交易所发送私有 API 调用时需要上述哪些 API 凭证（交易所可能需要特定的密钥集）。

- `options`：交易所特定的关联字典，包含底层交易所接受且在 CCXT 中受支持的特殊键和选项。

- `precisionMode`：交易所小数精度计数模式，详见[精度与限制](#precision-and-limits)。

- 代理相关 - `proxyUrl`、`httpUrl`、`httpsUrl`、`socksProxy`、`wsProxy`、`wssProxy`、`wsSocksProxy`：特定代理的 URL。详见[代理](#proxy)章节。

参见[覆盖交易所属性](#overriding-exchange-properties-upon-instantiation)章节。

#### 交易所元数据

- `has`：包含交易所能力标志的关联数组，包括以下内容：

    ```javascript
    'has': {

        'CORS': false,  // has Cross-Origin Resource Sharing enabled (works from browser) or not

        // unified methods availability flags (can be true, false, or 'emulated'):

        'cancelOrder': true,
        'createDepositAddress': false,
        'createOrder': true,
        'fetchBalance': true,
        'fetchCanceledOrders': false,
        'fetchClosedOrder': false,
        'fetchClosedOrders': false,
        'fetchCurrencies': false,
        'fetchDepositAddress': false,
        'fetchMarkets': true,
        'fetchMyTrades': false,
        'fetchOHLCV': false,
        'fetchOpenOrder': false,
        'fetchOpenOrders': false,
        'fetchOrder': false,
        'fetchOrderBook': true,
        'fetchOrders': false,
        'fetchStatus': 'emulated',
        'fetchTicker': true,
        'fetchTickers': false,
        'fetchBidsAsks': false,
        'fetchTrades': true,
        'withdraw': false,
        ...
    }
    ```

    每个标志表示相应方法可用性的含义如下：

    - 值为 `undefined` / `None` / `null` 表示该方法目前未在 ccxt 中实现（可能是 ccxt 尚未统一，或该方法在交易所 API 中原生不可用）
    - 布尔值 `false` 明确表示该端点在交易所 API 中原生不可用
    - 布尔值 `true` 表示该端点在交易所 API 中原生可用，并已在 ccxt 库中统一
    - 字符串 `'emulated'` 表示该端点在交易所 API 中原生不可用，但 ccxt 库通过其他可用的真实方法重建了该端点（尽可能还原）

    有关所有交易所及其支持方法的完整列表，请参阅此示例：https://github.com/ccxt/ccxt/blob/master/examples/js/exchange-capabilities.js

## 频率限制

交易所通常会施加所谓的*频率限制*。交易所会记录和跟踪您的用户凭证及 IP 地址，不允许您过于频繁地查询 API。它们通过平衡负载和控制流量拥堵来保护 API 服务器免受（D）DoS 攻击和滥用。

**警告：请遵守速率限制以避免封禁！**

大多数交易所允许**每秒最多 1 或 2 个请求**。如果您的请求过于频繁，交易所可能会暂时限制您对其 API 的访问，或在一段时间内封禁您。

**`exchange.rateLimit` 属性被设置为一个安全但非最优的默认值。某些交易所对不同端点可能有不同的速率限制。用户需要根据具体应用场景自行调整 `rateLimit`。**

CCXT 库内置了实验性速率限制算法，可在后台透明地对请求进行必要的限流。**警告：用户至少需要负责某种形式的速率限制：要么实现自定义算法，要么使用内置速率限制器。**

CCXT 内置了以下速率限制算法：

- **漏桶算法（默认）**：通过将请求排队并以稳定、固定的速率释放来工作。请求的突发会随时间平滑处理，而不是立即执行，这有助于防止触发交易所速率限制，同时仍能优雅地处理短暂的活动高峰。
- **窗口算法（可选）**：如果用户提供 `{ 'rateLimiterAlgorithm': 'rollingWindow' }` 选项，ccxt 将从漏桶模型切换到基于窗口的速率限制器（窗口大小可通过提供 `rollingWindowSize: X0000` 来自定义，CCXT 默认使用 60 秒作为窗口大小）。基于窗口的限制器在固定时间窗口内强制执行最大请求数（例如，每 X 毫秒最多 N 个请求）。一旦达到限制，后续请求将被延迟，直到当前窗口过期。

您可以使用 `.enableRateLimit` 属性开启/关闭内置速率限制器，如下所示：


```javascript tab="JavaScript"
// enable built-in rate limiting upon instantiation of the exchange
const exchange = new ccxt.bitfinex ({
    // 'enableRateLimit': true, // enabled by default
})

// or switch the built-in rate-limiter on or off later after instantiation
exchange.enableRateLimit = true // enable
exchange.enableRateLimit = false // disable
```
```python tab="Python"

# enable built-in rate limiting upon instantiation of the exchange
exchange = ccxt.bitfinex({
    # 'enableRateLimit': True,  # enabled by default
})

# or switch the built-in rate-limiter on or off later after instantiation
exchange.enableRateLimit = True  # enable
exchange.enableRateLimit = False  # disable
```

```php tab="PHP"

// enable built-in rate limiting upon instantiation of the exchange
$exchange = new \ccxt\bitfinex (array (
    // 'enableRateLimit' => true, // enabled by default
));

// or switch the built-in rate-limiter on or off later after instantiation
$exchange->enableRateLimit = true; // enable
$exchange->enableRateLimit = false; // disable
```
```go tab="Go"
// enable built-in rate limiting upon instantiation of the exchange
exchange := ccxt.NewBitfinex(nil) // enabled by default

// or switch the built-in rate-limiter on or off later after instantiation
exchange.EnableRateLimit = true  // enable
exchange.EnableRateLimit = false // disable
```
```csharp tab="C#"
// enable built-in rate limiting upon instantiation of the exchange
var exchange = new Bitfinex(); // enabled by default

// or switch the built-in rate-limiter on or off later after instantiation
exchange.enableRateLimit = true;  // enable
exchange.enableRateLimit = false; // disable
```
```java tab="Java"
// enabled by default
Exchange exchange = Exchange.dynamicallyCreateInstance("bitfinex", null);
exchange.enableRateLimit = true;  // enable
exchange.enableRateLimit = false; // disable
```


如果您的调用触发了速率限制或出现 nonce 错误，ccxt 库将抛出 `InvalidNonce` 异常，或在某些情况下抛出以下类型之一：

- `DDoSProtection`
- `ExchangeNotAvailable`
- `ExchangeError`
- `InvalidNonce`

稍后重试通常足以处理该问题。

### 速率限制器注意事项
#### 每个交易所实例独立的速率限制器

速率限制器是交易所实例的属性，换句话说，每个交易所实例都有自己的速率限制器，彼此互不感知。在许多情况下，用户应在整个程序中复用同一个交易所实例。不要在同一个 IP 地址上使用相同 API 密钥对的多个同一交易所实例。

```javascript
// DO NOT DO THIS!

const binance1 = new ccxt.binance ()
const binance2 = new ccxt.binance ()
const binance3 = new ccxt.binance ()

while (true) {
    const result = await Promise.all ([
        binance1.fetchOrderBook ('BTC/USDT'),
        binance2.fetchOrderBook ('ETH/USDT'),
        binance3.fetchOrderBook ('ETH/BTC'),
    ])
    console.log (result)
}
```

如下所示，尽量复用交易所实例：

```javascript
// DO THIS INSTEAD:

const binance = new ccxt.binance ()

while (true) {
    const result = await Promise.all ([
        binance.fetchOrderBook ('BTC/USDT'),
        binance.fetchOrderBook ('ETH/USDT'),
        binance.fetchOrderBook ('ETH/BTC'),
    ])
    console.log (result)
}
```

由于速率限制器属于交易所实例，销毁交易所实例也会销毁速率限制器。速率限制中最常见的陷阱之一是反复创建和销毁交易所实例。如果您的程序中反复创建和销毁交易所实例（例如，在被多次调用的函数内部），您实际上是在反复重置速率限制器，最终会突破速率限制。如果您每次都重新创建交易所实例而不是复用它，CCXT 每次都会尝试加载市场。因此，您将反复强制加载市场，如[加载市场](#loading-markets)章节所述。滥用市场端点最终也会破坏速率限制器。

```javascript
// DO NOT DO THIS!

async function tick () {
    const exchange = new ccxt.binance ()
    const response = await exchange.fetchOrderBook ('BTC/USDT')
    // ... some processing here ...
    return response
}

while (true) {
    const result = await tick ()
    console.log (result)
}
```

除非您真正了解速率限制器的内部工作原理，并且 100% 确定自己在做什么，否则请勿违反此规则。为了保持安全，请始终在函数和方法调用链中复用交易所实例，如下所示：

```javascript
// DO THIS INSTEAD:

async function tick (exchange) {
    const response = await exchange.fetchOrderBook ('BTC/USDT')
    // ... some processing here ...
    return response
}

const exchange = new ccxt.binance ()
while (true) {
    const result = await tick (exchange)
    console.log (result)
}
```

### Cloudflare / Incapsula 的 DDoS 防护

部分交易所受到 [Cloudflare](https://www.cloudflare.com) 或 [Incapsula](https://www.incapsula.com) 的 [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack) 防护。在高负载期间，您的 IP 可能会被临时封锁。有时它们甚至会限制整个国家和地区的访问。在这种情况下，其服务器通常返回一个显示 HTTP 40x 错误的页面，或者对您的浏览器运行 AJAX 测试/验证码测试，并将页面重新加载延迟数秒。然后您的浏览器/指纹将获得临时访问权限，并被添加到白名单或收到 HTTP cookie 以供后续使用。

DDoS 防护问题、速率限制问题或基于地区的过滤问题最常见的症状：
- 在所有类型的交易所方法中都出现 `RequestTimeout` 异常
- 捕获到带有 HTTP 错误代码 400、403、404、429、500、501、503 等的 `ExchangeError` 或 `ExchangeNotAvailable`
- 出现 DNS 解析问题、SSL 证书问题和低级连接问题
- 从交易所收到 HTML 模板页面而非 JSON

如果您遇到 DDoS 防护错误且无法访问某个特定交易所，则：

- 使用[代理](#proxy)（但响应速度较慢）
- 请求交易所支持将您添加到白名单
- 尝试使用不同地理区域内的其他 IP
- 在分布式服务器网络中运行您的软件
- 在靠近交易所的地方运行您的软件（同一国家、同一城市、同一数据中心、同一机架、同一服务器）
- ...

## 最大请求容量

在异步编程中，CCXT 允许您调度无限数量的请求。但是，队列长度有限制，默认设置为最多 1000 个并发请求。如果您尝试入队超过此数量的请求，将遇到错误："throttle queue is over maxCapacity"。

在大多数情况下，有如此多的待处理任务表明设计欠佳，因为新请求将被延迟，直到现有任务完成。

话虽如此，希望绕过此限制的用户可以在实例化时增加默认的 maxCapacity，如下所示：

```
ex = ccxt.binance({'options': {'maxRequestsQueue': 9999}})
```

# 市场

- [货币结构](#currency-structure)
- [市场结构](#market-structure)
- [精度与限制](#precision-and-limits)
- [加载市场](#loading-markets)
- [符号与市场 ID](#symbols-and-market-ids)
- [强制重新加载市场缓存](#market-cache-force-reload)

每个交易所都是交易某类有价物品的场所。交易所可能使用不同的术语来称呼它们：_"货币"_、_"资产"_、_"代币"_、_"股票"_、_"商品"_、_"加密货币"_、"法币"等。用一种资产交换另一种资产的场所通常被称为_"市场"_、_"符号"_、_"交易对"_、_"合约"_等。

就 ccxt 库而言，每个交易所内部提供多个**市场**。每个市场由两种或多种**货币**定义。不同交易所提供的市场各不相同，为跨交易所和跨市场套利创造了可能性。

## 货币结构

```javascript
{
    'id':       'btc',       // string literal for referencing within an exchange
    'code':     'BTC',       // uppercase unified string literal code of the currency
    'name':     'Bitcoin',   // string, human-readable name, if specified
    'active':    true,       // boolean, currency status (tradeable and withdrawable)
    'fee':       0.123,      // withdrawal fee, flat
    'precision': 8,          // number of decimal digits "after the dot" (depends on exchange.precisionMode)
    'deposit':   true        // boolean, deposits are available
    'withdraw':  true        // boolean, withdraws are available
    'limits': {              // value limits when placing orders on this market
        'amount': {
            'min': 0.01,     // order amount should be > min
            'max': 1000,     // order amount should be < max
        },
        'withdraw': { ... }, // withdrawal limits
        'deposit': {...},
    },
    'networks': {...}        // network structures indexed by unified network identifiers (ERC20, TRC20, BSC, etc)
    'info': { ... },         // the original unparsed currency info from the exchange
}
```

每种货币都是一个关联数组（即字典），具有以下键：

- `id`。交易所内货币的字符串或数字 ID。货币 ID 在交易所内部用于在请求/响应过程中识别代币。
- `code`。特定货币的大写字符串代码表示。货币代码用于在 ccxt 库中引用货币（详见下文）。
- `name`。货币的可读名称（可以是大小写字母混合）。
- `fee`。交易所规定的提现手续费值。大多数情况下，这意味着以同种货币支付的固定金额。如果交易所未通过公开端点指定，`fee` 可以为 `undefined/None/null` 或缺失。
- `active`。一个布尔值，表示当前是否可以对该货币进行交易或资金操作（充值或提现），更多信息请参见：[`active` 状态](#active-status)。
- `info`。非通用市场属性的关联数组，包括手续费、汇率、限制及其他一般市场信息。内部 info 数组对每个特定市场各不相同，其内容取决于交易所。
- `precision`。交易所在引用该货币时接受的精度值。此属性的值取决于 [`exchange.precisionMode`](#precision-mode)。
- `limits`。金额（数量）、提现和充值的最小值和最大值。

## 网络结构

```javascript
{
    'id':       'tron',         // string literal for referencing within an exchange
    'network':  'TRC20'         // unified network
    'name':     'Tron Network', // string, human-readable name, if specified
    'active':    true,          // boolean, currency status (tradeable and withdrawable)
    'fee':       0.123,         // withdrawal fee, flat
    'precision': 8,             // number of decimal digits "after the dot" (depends on exchange.precisionMode)
    'deposit':   true           // boolean, deposits are available
    'withdraw':  true           // boolean, withdraws are available
    'limits': {                 // value limits when placing orders on this market
        'amount': {
            'min': 0.01,        // order amount should be > min
            'max': 1000,        // order amount should be < max
        },
        'withdraw': { ... },    // withdrawal limits
        'deposit': {...},       // deposit limits
    },
    'info': { ... },            // the original unparsed currency info from the exchange
}
```

每个网络都是一个关联数组（即字典），具有以下键：

- `id`。交易所内网络的字符串或数字 ID。网络 ID 在交易所内部用于在请求/响应过程中识别网络。
- `network`。特定网络的大写字符串表示。网络用于在 ccxt 库中引用网络。
- `name`。网络的可读名称（可以是大小写字母混合）。
- `fee`。交易所规定的提现手续费值。大多数情况下，这意味着以同种货币支付的固定金额。如果交易所未通过公开端点指定，`fee` 可以为 `undefined/None/null` 或缺失。
- `active`。一个布尔值，表示当前是否可以对该货币进行交易或资金操作（充值或提现），更多信息请参见：[`active` 状态](#active-status)。
- `info`。非通用市场属性的关联数组，包括手续费、汇率、限制及其他一般市场信息。内部 info 数组对每个特定市场各不相同，其内容取决于交易所。
- `precision`。交易所在引用该货币时接受的精度值。此属性的值取决于 [`exchange.precisionMode`](#precision-mode)。
- `limits`。金额（数量）、提现和充值的最小值和最大值。

## 市场结构

```javascript
{
    'id':      'btcusd',      // string literal for referencing within an exchange
    'symbol':  'BTC/USD',     // uppercase string literal of a pair of currencies
    'base':    'BTC',         // uppercase string, unified base currency code, 3 or more letters
    'quote':   'USD',         // uppercase string, unified quote currency code, 3 or more letters
    'baseId':  'btc',         // any string, exchange-specific base currency id
    'quoteId': 'usd',         // any string, exchange-specific quote currency id
    'active':   true,         // boolean, market status
    'type':    'spot',        // spot for spot, future for expiry futures, swap for perpetual swaps, 'option' for options
    'spot':     true,         // whether the market is a spot market
    'margin':   true,         // whether the market is a margin market
    'future':   false,        // whether the market is a expiring future
    'swap':     false,        // whether the market is a perpetual swap
    'option':   false,        // whether the market is an option contract
    'contract': false,        // whether the market is a future, a perpetual swap, or an option
    'settle':   'USDT',       // the unified currency code that the contract will settle in, only set if `contract` is true
    'settleId': 'usdt',       // the currencyId of that the contract will settle in, only set if `contract` is true
    'contractSize': 1,        // the size of one contract, only used if `contract` is true
    'linear':   true,         // the contract is a linear contract (settled in quote currency)
    'inverse':  false,        // the contract is an inverse contract (settled in base currency)
    'expiry':  1641370465121, // the unix expiry timestamp in milliseconds, undefined for everything except market['type'] `future`
    'expiryDatetime': '2022-03-26T00:00:00.000Z', // The datetime contract will in iso8601 format
    'strike': 4000,           // price at which a put or call option can be exercised
    'optionType': 'call',     // call or put string, call option represents an option with the right to buy and put an option with the right to sell
    // note, 'taker' and 'maker' compose extended data for markets, however it might be better to use `fetchTradingFees` for more accuracy
    'taker':    0.002,        // taker fee rate, 0.002 = 0.2%
    'maker':    0.0016,       // maker fee rate, 0.0016 = 0.16%
    'percentage': true,       // whether the taker and maker fee rate is a multiplier or a fixed flat amount
    'tierBased': false,       // whether the fee depends on your trading tier (your trading volume)
    'feeSide': 'get',         // string literal can be 'get', 'give', 'base', 'quote', 'other'
    'precision': {            // number of decimal digits "after the dot"
        'price': 8,           // integer or float for TICK_SIZE roundingMode, might be missing if not supplied by the exchange
        'amount': 8,          // integer, might be missing if not supplied by the exchange
        'cost': 8,            // integer, very few exchanges actually have it
    },
    'limits': {               // value limits when placing orders on this market
        'amount': {
            'min': 0.01,      // order amount should be > min
            'max': 1000,      // order amount should be < max
        },
        'price': { ... },     // same min/max limits for the price of the order
        'cost':  { ... },     // same limits for order cost = price * amount
        'leverage': { ... },  // same min/max limits for the leverage of the order
    },
    'marginModes': {
        'cross': false,       // whether pair supports cross-margin trading
        'isolated': false,    // whether pair supports isolated-margin trading
    },
    'info':      { ... },     // the original unparsed market info from the exchange
}
```

每个市场都是一个关联数组（即字典），具有以下键：

- `id`。交易所内市场或交易工具的字符串或数字 ID。市场 ID 在交易所内部用于在请求/响应过程中识别交易对。
- `symbol`。特定交易对或工具的大写字符串代码表示。通常以 `BaseCurrency/QuoteCurrency` 的格式书写，带有斜杠，如 `BTC/USD`、`LTC/CNY` 或 `ETH/EUR` 等。符号用于在 ccxt 库中引用市场（详见下文）。
- `base`。基础法币或加密货币的统一大写字符串代码。这是用于在整个 CCXT 和统一 CCXT API 中引用该货币或代币的标准化货币代码，是 CCXT 所理解的语言。
- `quote`。报价法币或加密货币的统一大写字符串代码。
- `baseId`。该市场基础货币的交易所特定 ID，未统一。可以是任意字符串。这是使用交易所能理解的语言与交易所通信时使用的。
- `quoteId`。报价货币的交易所特定 ID，未统一。
- `active`。一个布尔值，表示当前是否可以交易该市场，更多信息请参见：[`active` 状态](#active-status)。
- `maker`。浮点数，0.0015 = 0.15%。当您为交易所提供流动性时需要支付做市商手续费，即您*做市*一个订单，由其他人成交。做市商手续费通常低于吃单手续费。手续费可以为负值，这在衍生品交易所中非常常见。负手续费意味着交易所将为用户交易该市场支付返佣（奖励）（注意，'taker' 和 'maker' 是公开可用的手续费，未考虑您的 VIP 等级/交易量等因素。使用 [`fetchTradingFees`](#fee-schedule) 获取特定于您账户的手续费）。
- `taker`。浮点数，0.002 = 0.2%。当您从交易所*吃单*并成交他人订单时需要支付吃单手续费。
- `percentage`。一个布尔值 true/false，表示 `taker` 和 `maker` 是乘数还是固定金额。
- `tierBased`。一个布尔值 true/false，表示手续费是否取决于您的交易等级（通常是您在一段时间内的交易量）。
- `info`。非通用市场属性的关联数组，包括手续费、汇率、限制及其他一般市场信息。内部 info 数组对每个特定市场各不相同，其内容取决于交易所。
- `precision`。交易所在下单时接受的订单价格、数量和成本的精度。（此属性内的值取决于 [`exchange.precisionMode`](#precision-mode)）。
- `limits`。价格、数量（成交量）和成本的最小值和最大值（其中成本 = 价格 × 数量）。
- `optionType`。期权类型，`call` 期权代表有权买入的期权，`put` 代表有权卖出的期权。
- `strike`。期权被行使时可以买入或卖出的价格。

## 活跃状态

`active` 标志通常用于 [`currencies`](#currency-structure) 和 [`markets`](#market-structure) 中。不同交易所对其含义的理解可能略有不同。如果某个货币处于非活跃状态，在大多数情况下，所有对应的行情、订单薄及其他相关接口将返回空响应、全零值、无数据或过期信息。用户应检查货币是否处于 `active` 状态，并[定期重新加载市场](#market-cache-force-reload)。

注意：`active` 属性值为 `false` 并不总是意味着交易所已禁用所有可能的功能，如交易、提款或充值。同样，值为 `true` 也不能保证所有这些功能在交易所均已启用。请查阅相应交易所的文档以及 CCXT 中的代码，以了解特定交易所 `active` 标志的确切含义。该标志尚未被所有市场支持或实现，可能缺失。

**警告！有关手续费的信息是实验性的、不稳定的，可能不完整或完全不可用。**

## 精度与限制

**请勿将 `limits` 与 `precision` 混淆！** 精度与最小限制没有任何关系。精度为 `0.01` 并不一定意味着市场的最小限制为 `0.01`。反之亦然：最小限制为 `0.01` 并不一定意味着精度为 `0.01`。

示例：

1.
```
market['limits']['amount']['min'] == 0.05 &&
market['precision']['amount'] == 0.0001 &&
market['precision']['price'] == 0.01
```

  - *数量值*应 >= 0.05：
    ```diff
    + good: 0.05, 0.051, 0.0501, 0.0502, ..., 0.0599, 0.06, 0.0601, ...
    - bad: 0.04, 0.049, 0.0499
    ```
  - *数量的精度*应精确到小数点后4位（0.0001）：
    ```diff
    + good: 0.05, 0.0501, ..., 0.06, ..., 0.0719, ...
    - bad: 0.05001, 0.05000, 0.06001
    ```
  - *价格的精度*应精确到小数点后2位（0.01）：
    ```diff
    + good: 1.6, 1.61, 123.01, ..., 1234.56, ...
    - bad: 1.601, ..., 123.012, ..., 1234.567
    ```
  - 

2. `(market['precision']['amount'] == -1)`

    负*精度*在理论上只有在交易所的 `precisionMode` 为 `SIGNIFICANT_DIGIT` 或 `DECIMAL_PRECISION` 时才会出现。这意味着数量应为10的整数倍（以指定的绝对值为幂次）：
    ```diff
    + good: 10, 50, ..., 110, ... 1230, ..., 1000000, ..., 1234560, ...
    - bad: 9.5, ... 10.1, ..., 11, ... 200.71, ...
    ```
    如果为 `-2`，则可接受的值应为 `100` 的倍数（例如 100、200、...），以此类推。


#### 精度模式

`exchange['precisionMode']` 中支持的精度模式有：

- `TICK_SIZE` – 几乎所有交易所都使用此精度模式。在此模式下，`market_or_currency['precision']` 中的数字表示用于舍入或截断的最小精度分数（浮点数）。
- `SIGNIFICANT_DIGITS` – 仅计算非零数字，部分交易所（`bitfinex` 及可能少数其他交易所）实现了此小数计数模式。在此精度模式下，`market_or_currency['precision']` 中的数字表示小数点后最后一个有效（非零）小数位的第N位。
- `DECIMAL_PLACES`（**已弃用，CCXT 不再在任何地方使用此模式**）– 计算所有数字。在此精度模式下，`market_or_currency['precision']` 中的数字表示用于进一步舍入或截断的小数点后位数。

### 精度与限制的注意事项

用户必须遵守所有限制和精度规定！订单的值应满足以下条件：

- 订单 `amount` >= `limits['amount']['min']`
- 订单 `amount` <= `limits['amount']['max']`
- 订单 `price` >= `limits['price']['min']`
- 订单 `price` <= `limits['price']['max']`
- 订单 `cost`（`amount * price`）>= `limits['cost']['min']`
- 订单 `cost`（`amount * price`）<= `limits['cost']['max']`
- `amount` 的精度必须 <= `precision['amount']`
- `price` 的精度必须 <= `precision['price']`

上述值在某些交易所可能缺失，因为这些交易所不通过其 API 提供限制信息，或尚未实现相关功能。

### 格式化小数的方法

每个交易所都有其自己的舍入、计数和填充模式。

支持的舍入模式有：

- `ROUND` – 将最后的小数位四舍五入到指定精度
- `TRUNCATE` – 在指定精度之后截断数字

小数精度计数模式可在 `exchange.precisionMode` 属性中获取。

#### 填充模式

支持的填充模式有：

- `NO_PADDING` – 大多数情况下的默认值
- `PAD_WITH_ZERO` – 在精度位数内补零

#### 格式化到指定精度

大多数情况下，用户无需关心精度格式化，因为只要用户遵循[精度与限制](#precision-and-limits)中描述的规则，CCXT 会在用户下单或发送提款请求时自动处理。但在某些情况下，精度格式化的细节可能很重要，因此以下方法在用户代码中可能很有用。

交易所基类包含 `decimalToPrecision` 方法，可帮助将值格式化为所需的小数精度，并支持不同的舍入、计数和填充模式。


```javascript tab="JavaScript"

function decimalToPrecision (x, roundingMode, numPrecisionDigits, countingMode = DECIMAL_PLACES, paddingMode = NO_PADDING)
```

```python tab="Python"
# WARNING! The `decimal_to_precision` method is susceptible to getcontext().prec!
def decimal_to_precision(n, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING):
```

```php tab="PHP"
function decimalToPrecision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING)
```

```go tab="Go"
func (this *Exchange) DecimalToPrecision(value any, roundingMode any, numPrecisionDigits any, args ...any) any
```

```csharp tab="C#"
public static string DecimalToPrecision(object x, object roundingMode, object numPrecisionDigits, object countingMode = null, object paddingMode = null)
```

```java tab="Java"
String formattedAmount = exchange.getExchange().amountToPrecision(symbol, amount);
String formattedPrice = exchange.getExchange().priceToPrecision(symbol, price);
```


有关如何使用 `decimalToPrecision` 格式化字符串和浮点数的示例，请参阅以下文件：

- Typescript: https://github.com/ccxt/ccxt/blob/master/ts/src/test/base/functions/test.number.ts
- JavaScript: https://github.com/ccxt/ccxt/blob/master/js/src/test/base/functions/test.number.js
- Python: https://github.com/ccxt/ccxt/blob/master/python/ccxt/test/base/test_number.py
- PHP: https://github.com/ccxt/ccxt/blob/master/php/test/base/test_number.php

**Python 警告！`decimal_to_precision` 方法容易受到 `getcontext().prec` 的影响！**

为方便用户，CCXT 基础交易所类还实现了以下方法：


```javascript tab="JavaScript"
function amountToPrecision (symbol, amount)
function priceToPrecision (symbol, price)
function costToPrecision (symbol, cost)
function currencyToPrecision (code, amount)
```
```python tab="Python"
def amount_to_precision (symbol, amount):
def price_to_precision (symbol, price):
def cost_to_precision (symbol, cost):
def currency_to_precision (code, amount):
```
```php tab="PHP"
function amount_to_precision($symbol, $amount)
function price_to_precision($symbol, $price)
function cost_to_precision($symbol, $cost)
function currency_to_precision($code, $amount)
```
```go tab="Go"
func (this *Exchange) AmountToPrecision(symbol any, amount any) any
func (this *Exchange) PriceToPrecision(symbol any, price any) any
func (this *Exchange) CostToPrecision(symbol any, cost any) any
func (this *Exchange) CurrencyToPrecision(code any, fee any, optionalArgs ...any) any
```
```csharp tab="C#"
public virtual object amountToPrecision(object symbol, object amount)
public virtual object priceToPrecision(object symbol, object price)
public virtual object costToPrecision(object symbol, object cost)
public virtual object currencyToPrecision(object code, object fee, object networkCode = null)
```
```java tab="Java"
String formattedAmount = exchange.getExchange().amountToPrecision(symbol, amount);
String formattedPrice = exchange.getExchange().priceToPrecision(symbol, price);
```


每个交易所都有其自己的精度设置，上述方法将帮助根据交易所特定的精度规则格式化这些值，以一种可移植且与底层交易所无关的方式。为实现这一点，在格式化任何值之前，必须先加载市场和货币信息。

**在调用这些方法之前，请确保[使用 `exchange.loadMarkets()` 加载市场](#loading-markets)！**

例如：


```javascript tab="JavaScript"
await exchange.loadMarkets ()
const symbol = 'BTC/USDT'
const amount = 1.2345678 // amount in base currency BTC
const price = 87654.321 // price in quote currency USDT
const formattedAmount = exchange.amountToPrecision (symbol, amount)
const formattedPrice = exchange.priceToPrecision (symbol, price)
console.log (formattedAmount, formattedPrice)
```


```python tab="Python"
exchange.load_markets()
symbol = 'BTC/USDT'
amount = 1.2345678  # amount in base currency BTC
price = 87654.321  # price in quote currency USDT
formatted_amount = exchange.amount_to_precision(symbol, amount)
formatted_price = exchange.price_to_precision(symbol, price)
print(formatted_amount, formatted_price)
```

```php tab="PHP"
$exchange->load_markets();
$symbol = 'BTC/USDT';
$amount = 1.2345678;  // amount in base currency BTC
$price = 87654.321; // price in quote currency USDT
$formatted_amount = $exchange->amount_to_precision($symbol, $amount);
$formatted_price = $exchange->price_to_precision($symbol, $price);
echo $formatted_amount, " ", $formatted_price, "\n";
```
```go tab="Go"
exchange.LoadMarkets()
symbol := "BTC/USDT"
amount := 1.2345678 // amount in base currency BTC
price := 87654.321  // price in quote currency USDT
formattedAmount := exchange.AmountToPrecision(symbol, amount)
formattedPrice := exchange.PriceToPrecision(symbol, price)
fmt.Println(formattedAmount, formattedPrice)
```
```csharp tab="C#"
await exchange.LoadMarkets();
var symbol = "BTC/USDT";
var amount = 1.2345678; // amount in base currency BTC
var price = 87654.321;  // price in quote currency USDT
var formattedAmount = exchange.amountToPrecision(symbol, amount);
var formattedPrice = exchange.priceToPrecision(symbol, price);
Console.WriteLine(formattedAmount + " " + formattedPrice);
```
```java tab="Java"
exchange.loadMarkets();
String symbol = "BTC/USDT";
double amount = 1.2345678;
double price = 87654.321;
String formattedAmount = exchange.getExchange().amountToPrecision(symbol, amount);
String formattedPrice = exchange.getExchange().priceToPrecision(symbol, price);
System.out.println(formattedAmount + " " + formattedPrice);
```


描述 `exchange.precisionMode` 行为的更多实际示例：

```javascript
// case A
exchange.precisionMode = ccxt.DECIMAL_PLACES
market = exchange.market (symbol)
market['precision']['amount'] === 8 // up to 8 decimals after the dot
exchange.amountToPrecision (symbol, 0.123456789) === 0.12345678
exchange.amountToPrecision (symbol, 0.0000000000123456789) === 0.0000000 === 0.0
```

```javascript
// case B
exchange.precisionMode = ccxt.TICK_SIZE
market = exchange.market (symbol)
market['precision']['amount'] === 0.00000001 // up to 0.00000001 precision
exchange.amountToPrecision (symbol, 0.123456789) === 0.12345678
exchange.amountToPrecision (symbol, 0.0000000000123456789) === 0.00000000 === 0.0
```

```javascript
// case C
exchange.precisionMode = ccxt.SIGNIFICANT_DIGITS
market = exchange.market (symbol)
market['precision']['amount'] === 8 // up to 8 significant non-zero digits
exchange.amountToPrecision (symbol, 0.0000000000123456789) === 0.000000000012345678
exchange.amountToPrecision (symbol, 123.4567890123456789) === 123.45678
```

## 加载市场

在大多数情况下，您需要在访问其他 API 方法之前，先加载特定交易所的市场列表和交易符号。如果您忘记加载市场，ccxt 库将在您第一次调用统一 API 时自动加载。它将依次发送两个 HTTP 请求，第一个用于获取市场信息，第二个用于获取其他数据。因此，您第一次调用 fetchTicker、fetchBalance 等统一 CCXT API 方法时，将比后续调用耗费更多时间，因为它需要从交易所 API 加载更多的市场信息。详情请参阅[速率限制器注意事项](#notes-on-rate-limiter)。

如需提前手动加载市场，请在交易所实例上调用 `loadMarkets ()` / `load_markets ()` 方法。该方法返回一个以交易符号为索引的关联数组。如果您希望对逻辑执行有更多控制，建议提前手动预加载市场。


```javascript tab="JavaScript"
(async () => {
    let kraken = new ccxt.kraken ()
    let markets = await kraken.loadMarkets ()
    console.log (kraken.id, markets)
}) ()
```

```python tab="Python"
okcoin = ccxt.okcoin()
markets = okcoin.load_markets()
print(okcoin.id, markets)
```

```php tab="PHP"
$id = 'huobipro';
$exchange = '\\ccxt\\' . $id;
$huobipro = new $exchange();
$markets = $huobipro->load_markets();
var_dump($huobipro->id, $markets);
```

```go tab="Go"
kraken := ccxt.NewKraken(nil)
markets, err := kraken.LoadMarkets()
if err != nil {
    fmt.Println(err)
    return
}
fmt.Println(kraken.GetId(), len(markets))
```

```csharp tab="C#"
var kraken = new Kraken();
var markets = await kraken.LoadMarkets();
Console.WriteLine(kraken.id + " " + markets.Count + " markets");
```

```java tab="Java"
Kraken kraken = new Kraken();
Map<String, MarketInterface> markets = kraken.loadMarkets(false);
System.out.println(kraken.id + " " + markets.size() + " markets");
```


除市场信息外，`loadMarkets()` 调用还将从交易所加载货币信息，并将其分别缓存在 `.markets` 和 `.currencies` 属性中。

用户也可以绕过缓存，直接调用统一方法从交易所接口获取该信息，即 `fetchMarkets()` 和 `fetchCurrencies()`，但不建议最终用户使用这些方法。推荐的预加载市场方式是调用 `loadMarkets()` 统一方法。但是，如果底层交易所具有相应的 API 接口，新的交易所集成必须实现这些方法。

### 在交易所实例之间共享市场

为优化内存使用并减少冗余 API 调用，您可以在同一交易所的多个实例之间共享市场数据。这在创建多个交易所实例或希望复用已加载市场数据时特别有用。


```javascript tab="JavaScript"
(async () => {
    // Create first exchange instance and load markets
    let exchange1 = new ccxt.binance()
    await exchange1.loadMarkets()
    
    // Create second exchange instance
    let exchange2 = new ccxt.binance()
    
    // Share markets from first instance to second using the setMarketsFromExchange method
    exchange2.setMarketsFromExchange(exchange1)
    
    // Now exchange2 can use the shared markets without loading them
    console.log(exchange2.symbols) // Available immediately
    
    // When calling loadMarkets on exchange2, it will use cached markets
    await exchange2.loadMarkets() // No API call, uses shared markets
})()
```

```python tab="Python"
# Create first exchange instance and load markets
exchange1 = ccxt.binance()
exchange1.load_markets()

# Create second exchange instance
exchange2 = ccxt.binance()

# Share markets from first instance to second using the setMarketsFromExchange method
exchange2.set_markets_from_exchange(exchange1)

# Now exchange2 can use the shared markets without loading them
print(exchange2.symbols)  # Available immediately

# When calling load_markets on exchange2, it will use cached markets
exchange2.load_markets()  # No API call, uses shared markets
```

```php tab="PHP"
// Create first exchange instance and load markets
$exchange1 = new \ccxt\binance();
$exchange1->load_markets();

// Create second exchange instance
$exchange2 = new \ccxt\binance();

// Share markets from first instance to second using the setMarketsFromExchange method
$exchange2->set_markets_from_exchange($exchange1);

// Now exchange2 can use the shared markets without loading them
var_dump($exchange2->symbols); // Available immediately

// When calling load_markets on exchange2, it will use cached markets
$exchange2->load_markets(); // No API call, uses shared markets
```

```go tab="Go"
// Create first exchange instance and load markets
binance1 := ccxt.NewBinance(nil)
markets, err := binance1.LoadMarkets()
if err != nil {
    // Handle error
}

// Create second exchange instance
binance2 := ccxt.NewBinance(nil)

// Share markets from first instance to second using the SetMarketsFromExchange method
binance2.SetMarketsFromExchange(binance1)

// Now binance2 can use the shared markets without loading them
fmt.Printf("Symbols loaded: %d\n", len(binance2.GetSymbols()))
```

```csharp tab="C#"
// Create first exchange instance and load markets
var binance1 = new Binance();
await binance1.LoadMarkets();

// Create second exchange instance
var binance2 = new Binance();

// Share markets from first instance to second using the setMarketsFromExchange method
binance2.setMarketsFromExchange(binance1);

// Now binance2 can use the shared markets without loading them
Console.WriteLine($"Symbols loaded: {binance2.symbols?.Count ?? 0}");
```

```java tab="Java"
Exchange exchange1 = Exchange.dynamicallyCreateInstance("binance", null);
exchange1.loadMarkets().join();

Exchange exchange2 = Exchange.dynamicallyCreateInstance("binance", null);
// share markets from exchange1 to exchange2
exchange2.setMarketsFromExchange(exchange1);
```


**市场共享的优势：**
- **内存效率**：多个交易所实例在内存中共享相同的市场对象
- **性能**：消除了市场数据的冗余 API 调用
- **资源节约**：减少网络请求和 API 速率限制消耗
- **持久性**：即使单个交易所实例被销毁，市场数据仍然可用

**简单赋值替代方案：**

如果您倾向于直接属性赋值，也可以通过直接赋值 `markets` 属性来共享市场：

```javascript
// Simple direct assignment (ensure both exchanges are of same type)
exchange2.markets = exchange1.markets;
exchange2.symbols = exchange1.symbols;  // Also copy symbols for full functionality
```

但建议使用 `setMarketsFromExchange()` 方法，因为它：
- 验证两个交易所是否为同一类型
- 确保所有相关市场数据被正确复制
- 提供更好的错误处理

**重要说明：**
- 仅在同一交易所类型的实例之间共享市场
- 当两个实例使用相同的 API 凭证和配置时，市场共享最为有效
- 只要至少存在一个引用，共享的市场对象将持续保留在内存中
- `setMarketsFromExchange()` 方法和直接赋值都创建共享引用，而非副本

## 符号与市场 ID

货币代码是由三到五个字母组成的代码，如 `BTC`、`ETH`、`USD`、`GBP`、`CNY`、`JPY`、`DOGE`、`RUB`、`ZEC`、`XRP`、`XMR` 等。部分交易所有代码更长的特殊货币。

符号通常是由斜杠分隔的一对交易货币的大写字符串字面名称。斜杠前的第一个货币通常称为*基础货币*，斜杠后的货币称为*报价货币*。符号示例：`BTC/USD`、`DOGE/LTC`、`ETH/EUR`、`DASH/XRP`、`BTC/CNY`、`ZEC/XMR`、`ETH/JPY`。

市场 ID 在 REST 请求-响应过程中用于引用交易所内的交易对。市场 ID 集合对每个交易所来说是唯一的，不能跨交易所使用。例如，BTC/USD 交易对/市场在各主流交易所上可能有不同的 ID，如 `btcusd`、`BTCUSD`、`XBTUSD`、`btc/usd`、`42`（数字 ID）、`BTC/USD`、`Btc/Usd`、`tBTCUSD`、`XXBTZUSD`。您无需记住或使用市场 ID，它们仅用于交易所实现内部的 HTTP 请求-响应目的。

ccxt 库将不常见的市场 ID 抽象为符号，并标准化为通用格式。符号与市场 ID 不同。每个市场都通过相应的符号引用。符号在各交易所之间是通用的，使其适合套利及许多其他用途。

有时用户可能会注意到类似 `'XBTM18'` 或 `'.XRPUSDM20180101'` 或某些其他*"特殊/罕见符号"*。符号**不要求**包含斜杠或为货币对。符号中的字符串实际上取决于市场类型（无论是现货市场还是期货市场、暗池市场还是已到期市场等）。强烈不建议解析符号字符串，不应依赖符号格式，建议使用市场属性代替。

市场结构通过交易对符号和 ID 进行索引。基础交易所类还内置了通过交易对符号访问市场的方法。大多数 API 方法要求在第一个参数中传入交易对符号。在查询当前价格、下单等操作时，通常需要指定交易对符号。

大多数情况下，用户将使用市场交易对符号进行操作。如果访问这些字典中不存在的键，将会得到标准的用户层异常。

### 市场与货币相关方法


```javascript tab="JavaScript"
(async () => {

    console.log (await exchange.loadMarkets ())

    let btcusd1 = exchange.markets['BTC/USD']     // get market structure by symbol
    let btcusd2 = exchange.market ('BTC/USD')     // same result in a slightly different way

    let btcusdId = exchange.marketId ('BTC/USD')  // get market id by symbol

    let symbols = exchange.symbols                // get an array of symbols
    let symbols2 = Object.keys (exchange.markets) // same as previous line

    console.log (exchange.id, symbols)            // print all symbols

    let currencies = exchange.currencies          // a dictionary of currencies

    let bitfinex = new ccxt.bitfinex ()
    await bitfinex.loadMarkets ()

    bitfinex.markets['BTC/USD']                   // symbol → market (get market by symbol)
    bitfinex.markets_by_id['XRPBTC'][0]           // id → market (get market by id)

    bitfinex.markets['BTC/USD']['id']             // symbol → id (get id by symbol)
    bitfinex.markets_by_id['XRPBTC'][0]['symbol'] // id → symbol (get symbol by id)

}) ()
```

```python tab="Python"
print(exchange.load_markets())

etheur1 = exchange.markets['ETH/EUR']         # get market structure by symbol
etheur2 = exchange.market('ETH/EUR')          # same result in a slightly different way

etheurId = exchange.market_id('ETH/EUR')      # get market id by symbol

symbols = exchange.symbols                    # get a list of symbols
symbols2 = list(exchange.markets.keys())      # same as previous line

print(exchange.id, symbols)                   # print all symbols

currencies = exchange.currencies              # a dictionary of currencies

kraken = ccxt.kraken()
kraken.load_markets()

kraken.markets['BTC/USD']                     # symbol → market (get market by symbol)
kraken.markets_by_id['XXRPZUSD'][0]           # id → market (get market by id)

kraken.markets['BTC/USD']['id']               # symbol → id (get id by symbol)
kraken.markets_by_id['XXRPZUSD'][0]['symbol'] # id → symbol (get symbol by id)
```

```php tab="PHP"
$var_dump($exchange->load_markets());

$dashcny1 = $exchange->markets['DASH/CNY'];        // get market structure by symbol
$dashcny2 = $exchange->market('DASH/CNY');         // same result in a slightly different way

$dashcnyId = $exchange->market_id('DASH/CNY');     // get market id by symbol

$symbols = $exchange->symbols;                     // get an array of symbols
$symbols2 = array_keys($exchange->markets);        // same as previous line

var_dump($exchange->id, $symbols);                 // print all symbols

$currencies = $exchange->currencies;               // an associative array of currencies

$okcoin = '\\ccxt\\okcoin';
$okcoin = new $okcoin();

$okcoin->load_markets();

$okcoin->markets['BTC/USD'];                    // symbol → market (get market by symbol)
$okcoin->markets_by_id['btc_usd'][0];              // id → market (get market by id)

$okcoin->markets['BTC/USD']['id'];              // symbol → id (get id by symbol)
$okcoin->markets_by_id['btc_usd'][0]['symbol']; // id → symbol (get symbol by id)
```
```go tab="Go"
exchange := ccxt.NewKraken(nil)
exchange.LoadMarkets()

btcUsd := exchange.Market("BTC/USD")          // get market structure by symbol
marketId := exchange.MarketId("BTC/USD")      // get market id by symbol

symbols := exchange.GetSymbols()              // get a list of symbols
fmt.Println(exchange.GetId(), symbols)        // print all symbols
fmt.Println(btcUsd, marketId)
```
```csharp tab="C#"
var exchange = new Kraken();
await exchange.LoadMarkets();

var btcUsd = exchange.market("BTC/USD");       // symbol → market (get market by symbol)
var marketId = exchange.marketId("BTC/USD");   // symbol → id (get market id by symbol)

var symbols = exchange.symbols;                // get a list of symbols
Console.WriteLine(exchange.id + " " + string.Join(", ", symbols)); // print all symbols
```
```java tab="Java"
Kraken exchange = new Kraken();
Map<String, MarketInterface> markets = exchange.loadMarkets(false);

MarketInterface btcUsd = markets.get("BTC/USD");  // symbol → market
String marketId = btcUsd.id;                       // symbol → id
```


### 命名一致性

不同交易所之间存在一些术语歧义，可能会让新手交易者感到困惑。有些交易所将市场称为*交易对*，而另一些交易所则将交易对符号称为*产品*。在 ccxt 库中，每个交易所包含一个或多个交易市场，每个市场都有一个 ID 和一个交易对符号。大多数交易对符号由基础货币和报价货币组成。

``` → Markets → Symbols → Currencies```

历史上，同一交易对曾使用过各种不同的符号名称。有些加密货币（如 Dash）甚至在其存续期间多次更改名称。为了保持各交易所间的一致性，ccxt 库将对交易对符号和货币执行以下已知的替换操作：

- `XBT → BTC`: `XBT` 是较新的代码，但 `BTC` 在各交易所中更为常见，且听起来更像比特币（[了解更多](https://www.google.ru/search?q=xbt+vs+btc)）。
- `BCC → BCH`: 比特币现金分叉通常有两种不同的符号名称：`BCC` 和 `BCH`。`BCC` 作为比特币现金的代号存在歧义，容易与 BitConnect 混淆。ccxt 库将在适当情况下将 `BCC` 转换为 `BCH`（某些交易所和聚合器会混淆它们）。
- `DRK → DASH`: `DASH` 曾是 Darkcoin，后来更名为 Dash（[了解更多](https://minergate.com/blog/dashcoin-and-dash/)）。
- `BCHABC → BCH`: 2018 年 11 月 15 日，比特币现金进行了第二次分叉，现在有 `BCH`（对应 BCH ABC）和 `BSV`（对应 BCH SV）。
- `BCHSV → BSV`: 这是比特币现金 SV 分叉的常见替换映射（部分交易所称其为 `BSV`，另一些称为 `BCHSV`，我们使用前者）。
- `DSH → DASH`: 请注意区分交易对符号和货币，`DSH`（Dashcoin）与 `DASH`（Dash）并不相同。某些交易所将 `DASH` 标注为 `DSH`，ccxt 库也会对此进行修正（`DSH → DASH`），但仅针对混淆这两种货币的特定交易所，而大多数交易所对两者都标注正确。请记住，`DASH/BTC` 与 `DSH/BTC` 并不相同。
- `XRB` → `NANO`: `NANO` 是 RaiBlocks 的新代码，因此，CCXT 统一 API 将在需要时把旧的 `XRB` 替换为 `NANO`。https://hackernoon.com/nano-rebrand-announcement-9101528a7b76
- `USD` → `USDT`: 部分交易所（如 Bitfinex、HitBTC 及其他少数交易所）在其列表中将该货币标注为 `USD`，但这些市场实际上交易的是 `USDT`。这种混淆可能源于交易对符号名称的三字母限制，也可能有其他原因。在实际交易货币为 `USDT` 而非 `USD` 的情况下，CCXT 库将执行 `USD` → `USDT` 的转换。但请注意，某些交易所同时拥有 `USD` 和 `USDT` 交易对，例如 Kraken 就有 `USDT/USD` 交易对。

#### 命名一致性说明

每个交易所在 `exchange.commonCurrencies` 属性中都有一个加密货币符号代码的替换关联数组，例如：
```
'commonCurrencies' : {
    'XBT': 'BTC',
    'OPTIMISM': 'OP',
    // ... etc
}
```
其中键表示交易所引擎中该币种的实际名称，值表示你希望通过 ccxt 引用它时使用的名称。

有时用户可能会在代码中注意到带有混合大小写单词和空格的特殊交易对符号名称。这些名称的存在逻辑源于在一种或多种货币在不同交易所具有相同符号代码时，解决命名和货币编码冲突的规则：

- 首先，我们收集各交易所自身提供的关于相关货币代码的所有可用信息。交易所通常在其 API、文档、知识库或网站的其他位置提供其币种列表的描述。
- 确认每个货币代码背后的特定加密货币后，我们会在 [CoinMarketCap](https://coinmarketcap.com) 上进行查询。
- 市值最高的货币将赢得该货币代码并保留它。例如，HOT 通常代表 `Holo` 或 `Hydro Protocol`。在这种情况下，`Holo` 保留代码 `HOT`，而 `Hydro Protocol` 将以其完整名称作为代码，即 `Hydro Protocol`。因此，可能存在 `HOT/USD`（代表 `Holo`）和 `Hydro Protocol/USD` 等交易对——这是两个不同的市场。
- 如果某币种的市值未知或不足以确定胜者，我们还会考虑交易量和其他因素。
- 确定胜者后，所有其他存在竞争的货币将通过 `.commonCurrencies` 在相关冲突交易所中进行适当的重新映射和替换。**注意，这必须在 `.loadMarkets()` 调用之前定义！**
- 遗憾的是，这仍是一项持续进行中的工作，因为每天都有新货币上线，也会不时添加新的交易所，因此总体而言，这是一个在快速变化环境中永无止境的自我修正过程，实际上处于*"实时模式"*。我们感谢您报告所有发现的冲突和不匹配问题。

#### 命名一致性常见问题

_交易对符号是否可能发生变化？_

简而言之，是的，有时会，但很少见。如果绝对必要且无法避免，符号映射可以被更改。然而，之前所有的符号变更都与解决冲突或分叉有关。迄今为止，在 CCXT 中从未出现过一个币种的市值超越另一个具有相同符号代码的币种的先例。

_我们能否依赖库始终将同一加密货币列在相同的符号下？_

大体上可以。首先，这个库是一个持续进行中的项目，它在努力适应不断变化的现实，因此未来可能会出现一些我们需要通过更改某些映射来修复的冲突。最终，许可证说明"无任何保证，使用风险自负"。然而，我们不会随意更改符号映射，因为我们理解其后果，我们自己也希望依赖这个库，而且我们非常不愿意破坏向后兼容性。

如果某主要代币的符号被分叉或必须更改，控制权仍在用户手中。`exchange.commonCurrencies` 属性可以[在初始化时或之后覆盖](#overriding-exchange-properties-upon-instantiation)，就像任何其他交易所属性一样。如果涉及重要代币，我们通常会发布说明，指导如何通过在构造函数参数中添加几行代码来保留旧行为。

#### 基础货币与报价货币的一致性

这取决于您使用的交易所，但其中一些交易所存在 `base` 和 `quote` 配对顺序颠倒（不一致）的情况。它们实际上将基础货币和报价货币放错了位置（交换/反转了双方）。在这种情况下，您会发现市场子结构中解析后的 `base` 和 `quote` 货币值与未解析的 `info` 之间存在差异。

对于这些交易所，ccxt 在解析交易所响应时会进行修正，切换并规范化基础货币和报价货币的位置。这在金融和术语上是正确的。如果您想减少混乱，请记住以下规则：**在任何交易对符号中，任何市场里，基础货币始终在斜杠之前，报价货币始终在斜杠之后**。

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

#### 合约命名规范

目前，我们使用统一的 `BASE/QUOTE` 符号模式将现货市场加载到 `.markets` 映射中，并按符号进行索引。这会导致期货和其他衍生品与对应现货市场使用相同符号时产生命名冲突。为了在 `.markets` 中同时容纳两种类型的市场，我们要求"期货"和"现货"市场之间的符号必须不同，"线性"和"反向"合约之间的符号也必须不同。

**请查看此公告：[统一合约命名规范](https://github.com/ccxt/ccxt/issues/10931)**

CCXT 支持以下类型的衍生品合约：

- `future` – 有交割/结算日期的到期期货合约 [](https://en.wikipedia.org/wiki/Futures_contract)
- `swap` – 没有交割日期的永续掉期期货 [](https://en.wikipedia.org/wiki/Perpetual_futures)
- `option` – 期权合约 (https://en.wikipedia.org/wiki/Option_contract)

##### 期货合约

期货市场符号由标的货币、报价货币、结算货币和任意标识符组成。通常，标识符是期货合约以 `YYMMDD` 格式表示的结算日期：

```javascript
//
// base asset or currency
// ↓
// ↓  quote asset or currency
// ↓  ↓
// ↓  ↓    settlement asset or currency
// ↓  ↓    ↓
// ↓  ↓    ↓     identifier (settlement date)
// ↓  ↓    ↓     ↓
// ↓  ↓    ↓     ↓
'BTC/USDT:BTC-211225'  // BTC/USDT futures contract settled in BTC (inverse) on 2021-12-25
'BTC/USDT:USDT-211225' // BTC/USDT futures contract settled in USDT (linear, vanilla) on 2021-12-25
'ETH/USDT:ETH-210625'  // ETH/USDT futures contract settled in ETH (inverse) on 2021-06-25
'ETH/USDT:USDT-210625' // ETH/USDT futures contract settled in USDT (linear, vanilla) on 2021-06-25
```

##### 永续掉期（永续期货）

```javascript
// base asset or currency
// ↓
// ↓  quote asset or currency
// ↓  ↓
// ↓  ↓    settlement asset or currency
// ↓  ↓    ↓
// ↓  ↓    ↓
'BTC/USDT:BTC'  // BTC/USDT inverse perpetual swap contract funded in BTC
'BTC/USDT:USDT' // BTC/USDT linear perpetual swap contract funded in USDT
'ETH/USDT:ETH'  // ETH/USDT inverse perpetual swap contract funded in ETH
'ETH/USDT:USDT' // ETH/USDT linear perpetual swap contract funded in USDT
```

##### 期权

```javascript
//
// base asset or currency
// ↓
// ↓  quote asset or currency
// ↓  ↓
// ↓  ↓    settlement asset or currency
// ↓  ↓    ↓
// ↓  ↓    ↓       identifier (settlement date)
// ↓  ↓    ↓       ↓
// ↓  ↓    ↓       ↓   strike price
// ↓  ↓    ↓       ↓   ↓
// ↓  ↓    ↓       ↓   ↓   type, put (P) or call (C)
// ↓  ↓    ↓       ↓   ↓   ↓
'BTC/USDT:BTC-211225-60000-P'  // BTC/USDT put option contract strike price 60000 USDT settled in BTC (inverse) on 2021-12-25
'ETH/USDT:USDT-211225-40000-C' // BTC/USDT call option contract strike price 40000 USDT settled in USDT (linear, vanilla) on 2021-12-25
'ETH/USDT:ETH-210625-5000-P'   // ETH/USDT put option contract strike price 5000 USDT settled in ETH (inverse) on 2021-06-25
'ETH/USDT:USDT-210625-5000-C'  // ETH/USDT call option contract strike price 5000 USDT settled in USDT (linear, vanilla) on 2021-06-25
```

### 统一网络

| 网络 | CCXT 代码  |
|---------------------------------------|--------------|
| Bitcoin                               | BTC          |
| Ethereum                              | ETH（以太坊原生）/ ERC20（代币）          |
| Ripple                                | XRP          |
| Litecoin                              | LTC          |
| Dogecoin                              | DOGE         |
| Stellar                               | XLM          |
| Tron                                  | TRX（TRX 原生）/ TRC20（代币）         |
| Ethereum Classic                      | ETC          |
| Zcash                                 | ZEC          |
| BSC (Binance Smart Chain)             | BEP20        |
| Monero                                | XMR          |
| Cardano                               | ADA          |
| Tezos                                 | XTZ          |
| Cosmos                                | ATOM         |
| Solana                                | SOL          |
| BNB Beacon Chain                      | BEP2         |
| Polkadot                              | DOT          |
| Algorand                              | ALGO         |
| Avalanche                             | AVAX         |
| Chainlink                             | LINK         |
| Bitcoin Cash                          | BCH          |
| Filecoin                              | FIL          |
| Kusama                                | KSM          |
| Elrond                                | EGLD         |
| THORChain                             | RUNE         |
| Internet Computer                     | ICP          |
| Near Protocol                         | NEAR         |
| Celo                                  | CELO         |
| Hedera Hashgraph                      | HBAR         |
| IOTA                                  | MIOTA        |
| Klaytn                                | KLAY         |
| VeChain                               | VET          |
| Theta Network                         | THETA        |
| Stacks                                | STX          |
| Bitcoin Lightning Network             | LIGHTNING    |
| Optimism                              | OPTIMISM     |
| Arbitrum                              | ARBITRUM     |
| zkSync                                | zkSync       |
| Polygon                               | MATIC        |
| Fantom                                | FTM          |

## 强制重新加载市场缓存

`loadMarkets () / load_markets ()` 也是一个有副作用的"脏"方法，会将市场数组保存到交易所实例上。每个交易所只需调用一次。后续对同一方法的所有调用都将返回本地保存（缓存）的市场数组。

加载交易所市场后，您可以随时通过 `markets` 属性访问市场信息。该属性包含一个以交易对符号为索引的关联数组。如果您已加载市场列表后需要强制重新加载，请再次向同一方法传入 reload = true 标志。


```javascript tab="JavaScript"
(async () => {
    let kraken = new ccxt.kraken ({ verbose: true }) // log HTTP requests
    await kraken.loadMarkets () // request markets
    console.log (kraken.id, kraken.markets)    // output a full list of all loaded markets
    console.log (Object.keys (kraken.markets)) // output a short list of market symbols
    console.log (kraken.markets['BTC/USD'])    // output single market details
    await kraken.loadMarkets () // return a locally cached version, no reload
    let reloadedMarkets = await kraken.loadMarkets (true) // force HTTP reload = true
    console.log (reloadedMarkets['ETH/BTC'])
}) ()
```
```python tab="Python"
poloniex = ccxt.poloniex({'verbose': True}) # log HTTP requests
poloniex.load_markets() # request markets
print(poloniex.id, poloniex.markets)   # output a full list of all loaded markets
print(list(poloniex.markets.keys())) # output a short list of market symbols
print(poloniex.markets['BTC/ETH'])     # output single market details
poloniex.load_markets() # return a locally cached version, no reload
reloadedMarkets = poloniex.load_markets(True) # force HTTP reload = True
print(reloadedMarkets['ETH/ZEC'])
```
```php tab="PHP"
$bitfinex = new \ccxt\bitfinex(array('verbose' => true)); // log HTTP requests
$bitfinex.load_markets(); // request markets
var_dump($bitfinex->id, $bitfinex->markets); // output a full list of all loaded markets
var_dump(array_keys ($bitfinex->markets));   // output a short list of market symbols
var_dump($bitfinex->markets['XRP/USD']);     // output single market details
$bitfinex->load_markets(); // return a locally cached version, no reload
$reloadedMarkets = $bitfinex->load_markets(true); // force HTTP reload = true
var_dump($bitfinex->markets['XRP/BTC']);
```

```go tab="Go"
kraken := ccxt.NewKraken(map[string]interface{}{"verbose": true}) // log HTTP requests
kraken.LoadMarkets()       // request markets
kraken.LoadMarkets()       // return a locally cached version, no reload
kraken.LoadMarkets(true)   // force HTTP reload = true
```

```csharp tab="C#"
var kraken = new Kraken(new Dictionary<string, object>() { { "verbose", true } }); // log HTTP requests
await kraken.LoadMarkets();       // request markets
await kraken.LoadMarkets();       // return a locally cached version, no reload
await kraken.loadMarkets(true);   // force HTTP reload = true
```

```java tab="Java"
Kraken kraken = new Kraken();
kraken.loadMarkets(false);            // loads from exchange
kraken.loadMarkets(false);            // returns cached version
kraken.loadMarkets(true);             // force reload
```


# 隐式 API

- [API 方法 / 端点](#api-methods--endpoints)
- [隐式 API 方法](#implicit-api-methods)
- [公有/私有 API](#publicprivate-api)
- [同步与异步调用](#synchronous-vs-asynchronous-calls)
- [向 API 方法传递参数](#passing-parameters-to-api-methods)

## API 方法 / 端点

每个交易所都提供一组 API 方法。API 的每个方法称为一个*端点*。端点是用于查询各类信息的 HTTP URL。所有端点都以 JSON 格式响应客户端请求。

通常，会有一个端点用于从交易所获取市场列表，一个端点用于获取特定市场的订单簿，一个端点用于获取交易历史，以及用于下单和取消订单、存款和提款等的端点……基本上，您在特定交易所可以执行的每种操作，API 都提供了对应的端点 URL。

由于各交易所的方法集合各不相同，ccxt 库实现了以下内容：
- 针对所有可能的 URL 和方法的公有和私有 API
- 支持通用方法子集的统一 API

端点 URL 在每个交易所的 `api` 属性中预定义。除非您正在实现新的交易所 API（至少您应该清楚自己在做什么），否则无需覆盖它。

大多数交易所特定的 API 方法是隐式的，即它们在代码中没有被显式定义。该库采用声明式方式来定义隐式（非统一）交易所 API 方法。

## 隐式 API 方法

API 的每个方法通常都有其自己的端点。该库在 `.api` 属性中为每个特定交易所定义了所有端点。在构造交易所实例时，将在交易所实例上的 `defineRestApi()/define_rest_api()` 中为 `.api` 端点列表中的每个端点创建一个隐式的*魔术*方法（也称为*偏函数*或*闭包*）。这对所有交易所都是统一执行的。每个生成的方法在 `camelCase` 和 `under_score` 两种命名方式下均可访问。

端点定义是交易所公开的**所有 API URL 的完整列表**。此列表在交易所实例化时会转换为可调用的方法。API 端点列表中的每个 URL 都对应一个可调用的方法。这对所有交易所自动完成，因此 ccxt 库支持加密货币交易所提供的**所有可能的 URL**。

每个隐式方法都有一个唯一名称，该名称由 `.api` 定义构造而成。例如，私有 HTTPS PUT `https://api.exchange.com/order/{id}/cancel` 端点将对应名为 `.privatePutOrderIdCancel()`/`.private_put_order_id_cancel()` 的交易所方法。公有 HTTPS GET `https://api.exchange.com/market/ticker/{pair}` 端点将对应名为 `.publicGetTickerPair()`/`.public_get_ticker_pair()` 的方法，依此类推。

隐式方法接受一个参数字典，向交易所发送请求，并**原样、未经解析**地返回来自 API 的交易所特定 JSON 结果。要传递参数，请在字典中以参数名称为键显式添加。对于上面的示例，看起来如下：`.privatePutOrderIdCancel ({ id: '41987a2b-...' })` 和 `.publicGetTickerPair ({ pair: 'BTC/USD' })`。

与交易所合作的推荐方式是不使用交易所特定的隐式方法，而是使用统一的 ccxt 方法。交易所特定方法应作为备选方案，用于相应的统一方法（尚）不可用的情况。

要获取交易所实例的所有可用方法列表（包括隐式方法和统一方法），您可以简单地执行以下操作：

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

## 公有/私有 API

API URL 通常分为两组方法，分别称为用于市场数据的*公有 API* 和用于交易及账户访问的*私有 API*。这些 API 方法组通常以"public"或"private"等词作为前缀。

公有 API 用于访问市场数据，无需任何身份验证。大多数交易所向所有人公开提供市场数据（受其速率限制约束）。使用 ccxt 库，任何人无需在交易所注册、无需设置账户密钥和密码，即可直接访问市场数据。

公有 API 包括以下内容：

- 交易工具/交易对
- 价格数据（汇率）
- 订单簿（L1、L2、L3……）
- 交易历史（已成交订单、交易记录、执行记录）
- 行情数据（现货 / 24 小时价格）
- 用于图表的 OHLCV 系列数据
- 其他公开端点

私有 API 主要用于交易和访问账户特定的私有数据，因此需要身份验证。您必须从交易所获取私有 API 密钥，这通常意味着在交易所网站注册并为您的账户创建 API 密钥。大多数交易所要求提供个人信息或身份证明。部分交易所在完成 KYC 验证后才允许交易。
私有 API 允许以下操作：

- 管理个人账户信息
- 查询账户余额
- 通过市价单和限价单进行交易
- 创建充值地址并为账户充值
- 申请提取法币和加密货币资金
- 查询个人未成交/已成交订单
- 查询保证金/杠杆交易中的持仓
- 获取账本历史
- 在账户之间转移资金
- 使用商户服务

部分交易所以不同名称提供相同的逻辑。例如，公有 API 也常被称为*市场数据*、*basic*、*market*、*mapi*、*api*、*price* 等……它们都指一组可供公众访问数据的方法。私有 API 也常被称为*trading*、*trade*、*tapi*、*exchange*、*account* 等……

少数交易所还提供商户 API，允许您创建发票并接受客户的加密货币和法币付款。此类 API 通常被称为*merchant*、*wallet*、*payment*、*ecapi*（电子商务）。

要获取交易所实例的所有可用方法列表，您可以简单地执行以下操作：

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

**仅限合约和仅限保证金**

- 本文档中标注为**仅限合约**或**仅限保证金**的方法仅用于合约交易和保证金交易。在其他类型的市场中交易时这些方法可能也能使用，但很可能返回不相关的信息。

## 同步与异步调用


#### **Javascript**

在 JavaScript 版本的 CCXT 中，所有方法都是异步的，并返回解析为已解码 JSON 对象的 [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)。在 CCXT 中，我们使用现代的 *async/await* 语法来处理 Promises。如果您不熟悉该语法，可以在[这里](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)阅读更多相关内容。

```javascript
// JavaScript

(async () => {
    let pairs = await kraken.publicGetSymbolsDetails ()
    let marketIds = Object.keys (pairs['result'])
    let marketId = marketIds[0]
    let ticker = await kraken.publicGetTicker ({ pair: marketId })
    console.log (kraken.id, marketId, ticker)
}) ()
```


#### **Python**

ccxt 库支持 Python 3.5+ 中使用 async/await 语法的异步并发模式。异步 Python 版本使用纯 [asyncio](https://docs.python.org/3/library/asyncio.html) 配合 [aiohttp](http://aiohttp.readthedocs.io)。在异步模式下，您拥有所有相同的属性和方法，但大多数方法都用 async 关键字修饰。如果您想使用异步模式，应链接到 `ccxt.async_support` 子包，如以下示例所示：

```python
# Python

import asyncio
import ccxt.async_support as ccxt

async def print_poloniex_ethbtc_ticker():
    poloniex = ccxt.poloniex()
    print(await poloniex.fetch_ticker('ETH/BTC'))
    await polonix.close()  # close the exchange instance when you don't need it anymore

asyncio.run(print_poloniex_ethbtc_ticker())
```

#### **PHP**

CCXT 支持 PHP 8+ 版本。该库同时提供同步和异步版本。要使用同步版本，请使用 `\ccxt` 命名空间（即 `new ccxt\binance()`）；要使用异步版本，请使用 `\ccxt\async` 命名空间（即 `new ccxt\async\binance()`）。异步版本在后台使用 [ReactPHP](https://reactphp.org/) 库。在异步模式下，您拥有所有相同的属性和方法，但任何网络 API 方法都应使用 `\React\Async\await` 关键字修饰，并且您的脚本应位于 ReactPHP 包装器中：
```php
// PHP
<?php
include 'vendor/autoload.php';

use function React\Async\await;

$okx = new \ccxt\async\okx();
while (true) {
    $result = await($okx->fetch_ticker('ETH/BTC'));
    var_dump($result);
}
```

更多示例请参见 `examples/php` 目录；查找文件名中包含 `async` 单词的文件。此外，请确保已使用 `composer require recoil/recoil clue/buzz-react react/event-loop recoil/react react/http` 安装了所需的依赖项。最后，[这篇文章](https://sergeyzhuk.me/2018/10/26/from-promise-to-coroutines/)提供了对此处所用方法的良好介绍。虽然语法上的变化很简单（即只需在相关方法前使用 `yield` 关键字），但并发性对代码的整体设计有重大影响。

#### **Go**

在 Go 中，每个网络方法都是同步的，返回一个 `(value, error)` 对——没有异步变体。在使用返回值之前，请务必检查返回的 `error`：

```go
// Go

exchange := ccxt.NewKraken(nil)
ticker, err := exchange.FetchTicker("ETH/BTC")
if err != nil {
    fmt.Println(err)
    return
}
fmt.Println(exchange.GetId(), ticker.Last)
```

#### **C#**

在 C# 中，每个网络方法都是异步的，返回一个您需要 `await` 的 `Task<T>`。统一方法使用原生的 `async`/`await`：

```csharp
// C#

var exchange = new Kraken();
var ticker = await exchange.FetchTicker("ETH/BTC");
Console.WriteLine(exchange.id + " " + ticker.last);
```

#### **Java**

在 Java 中，每个交易所都有其自己的类型化子类。每个类型化方法同时提供
**阻塞同步**重载和返回 `CompletableFuture` 的非阻塞
异步重载——对 REST 的 `fetch*` / `fetch*Async` 和 WebSocket 的 `watch*` /
`watch*Async` 均对称：

```java
// Java

import io.github.ccxt.exchanges.Kraken;
import io.github.ccxt.types.Ticker;
import java.util.concurrent.CompletableFuture;

Kraken kraken = new Kraken();
kraken.loadMarkets(false);

// REST — synchronous
Ticker ticker = kraken.fetchTicker("BTC/USDT");
System.out.println(ticker.last);

// REST — asynchronous
CompletableFuture<Ticker> future = kraken.fetchTickerAsync("BTC/USDT", null);
future.thenAccept(t -> System.out.println(t.last));
```

同样的同步/异步对也适用于 pro（WebSocket）类——`watchTicker`
阻塞等待一次更新；`watchTickerAsync` 返回一个 `CompletableFuture<Ticker>`，
在下次更新时完成：

```java
import io.github.ccxt.exchanges.pro.Binance;

var ws = new Binance();
ws.loadMarkets(false);

// WS — synchronous (blocks for one update)
Ticker tick = ws.watchTicker("BTC/USDT");

// WS — asynchronous (composable with allOf, anyOf, thenApply, ...)
CompletableFuture<Ticker> stream = ws.watchTickerAsync("BTC/USDT", null);
```


### 返回的 JSON 对象

所有公有和私有 API 方法都原样、未经修改地返回来自交易所的原始解码 JSON 对象。统一 API 以通用格式返回 JSON 解码对象，并在所有交易所中保持统一的结构。

## 向 API 方法传递参数

所有可能的 API 端点集合因交易所而异。大多数方法接受一个键值参数的关联数组（或 Python 字典）。参数的传递方式如下：

```text
bitso.publicGetTicker ({ book: 'eth_mxn' })                 // JavaScript
ccxt.zaif().public_get_ticker_pair ({ 'pair': 'btc_jpy' })  # Python
$luno->public_get_ticker (array ('pair' => 'XBTIDR'));      // PHP
```

交易所的统一方法可能期望并接受各种影响其功能的 `params`，例如：

```python
params = {'type':'margin', 'isIsolated': 'TRUE'}  # --------------┑
# params will go as the last argument to the unified method       |
#                                                                 v
binance.create_order('BTC/USDT', 'limit', 'buy', amount, price, params)
```

某个交易所不会接受来自另一个交易所的参数，它们之间不可互换。可接受的参数列表由每个特定交易所定义。

要了解可以向统一方法传递哪些参数：

- 要么打开[交易所特定的实现](https://github.com/ccxt/ccxt/tree/master/js)文件，搜索所需函数（如 `createOrder`），以检查并了解 `params` 用法的详细信息
- 要么访问交易所的 API 文档，阅读您特定函数或端点（如 `order`）的参数列表

有关每个交易所接受的方法参数的完整列表，请参阅 [API 文档](#exchanges)。

### API 方法命名约定

交易所方法名称是由类型（public 或 private）、HTTP 方法（GET、POST、PUT、DELETE）以及端点 URL 路径拼接而成的字符串，示例如下：

| 方法名称                     | 基础 API URL                   | 端点 URL                       |
|------------------------------|--------------------------------|--------------------------------|
| publicGetIdOrderbook         | https://bitbay.net/API/Public  | {id}/orderbook                 |
| publicGetPairs               | https://bitlish.com/api        | pairs                          |
| publicGetJsonMarketTicker    | https://www.bitmarket.net      | json/{market}/ticker           |
| privateGetUserMargin         | https://bitmex.com             | user/margin                    |
| privatePostTrade             | https://btc-x.is/api           | trade                          |
| tapiCancelOrder              | https://yobit.net              | tapi/CancelOrder               |
| ...                          | ...                            | ...                            |

ccxt 库同时支持驼峰命名法（JavaScript 中首选）和下划线命名法（Python 和 PHP 中首选），因此所有方法在任何语言中均可使用任一命名风格调用。以下两种写法在 JavaScript、Python 和 PHP 中均有效：

```text
exchange.methodName ()  // camelcase pseudocode
exchange.method_name()  // underscore pseudocode
```

要获取某个交易所实例的所有可用方法列表，只需执行以下操作：

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.hitbtc()))           # Python
var_dump (new \ccxt\okcoin ()); // PHP
```

# 统一 API

- [覆盖统一 API 参数](#overriding-unified-api-params)
- [分页](#pagination)
- [自动分页](#automatic-pagination)

统一 ccxt API 是各交易所通用方法的子集，目前包含以下方法：

- `fetchMarkets ()`: 从交易所获取所有可用市场的列表，返回由 [市场结构](#market-structure) 定义的 Market 对象数组（包含 `symbol`、`base`、`quote` 等属性）。部分交易所不支持通过在线 API 获取市场列表，此类交易所的市场列表将以硬编码方式提供。
- `fetchCurrencies ()`: 从交易所获取所有可用币种，返回币种的关联字典（对象包含 `code`、`name` 等属性）。部分交易所不支持通过在线 API 获取币种信息，此类交易所的币种将从交易对中提取或以硬编码方式提供。
- `loadMarkets ([reload])`: 以 symbol 为索引以对象形式返回市场列表，并将其缓存到交易所实例中。若已加载则返回缓存的市场，除非强制设置 `reload = true`。
- `fetchOrderBook (symbol, limit = undefined, params = {})`: 获取特定交易对的 L2/L3 订单簿。
- `fetchStatus (params = {})`: 返回交易所状态信息，来源为交易所实例中的硬编码信息或 API（如可用）。
- `fetchL2OrderBook (symbol, limit = undefined, params)`: 获取特定交易对的 Level 2（价格聚合）订单簿。
- `fetchTrades (symbol, since, limit, params)`: 获取特定交易对的最近成交记录。
- `fetchTicker (symbol)`: 按交易对获取最新行情数据。
- `fetchBalance ()`: 获取余额。
- `createOrder (symbol, type, side, amount, price, params)`
- `createOrders(orders, params)`
- `createLimitBuyOrder (symbol, amount, price, param)`
- `createLimitSellOrder (symbol, amount, price, param)`
- `createMarketBuyOrder (symbol, amount, param)`
- `createMarketSellOrder (symbol, amount, param)`
- `cancelOrder (id, symbol, params)`
- `fetchOrder (id, symbol, params)`
- `fetchOrders (symbol, since, limit, params)`
- `fetchOpenOrders (symbol, since, limit, params)`
- `fetchCanceledOrders (symbol, since, limit, params)`
- `fetchClosedOrders (symbol, since, limit, params)`
- `fetchMyTrades (symbol, since, limit, params)`
- `fetchOpenInterest (symbol, params)`
- `fetchVolatilityHistory (code, params)`
- `fetchUnderlyingAssets ()`
- `fetchSettlementHistory (symbol, since, limit, params)`
- `fetchLiquidations (symbol, since, limit, params)`
- `fetchMyLiquidations (symbol, since, limit, params)`
- `fetchGreeks (symbol, params)`
- `fetchAllGreeks (symbols, params)`
- `fetchCrossBorrowRate (code, params)`
- `fetchCrossBorrowRates (params)`
- `fetchIsolatedBorrowRate (symbol, params)`
- `fetchIsolatedBorrowRates (params)`
- `fetchOption (symbol, params)`
- `fetchOptionChain (code, params)`
- `fetchConvertQuote (fromCode, toCode, amount, params)`
- `createConvertTrade (id, fromCode, toCode, amount, params)`
- `fetchFundingRate (symbol, params)`
- `fetchFundingRates (symbols, params)`
- `fetchFundingRateHistory (symbol, since, limit, params)`
- `fetchFundingRateInterval (symbol, params)`
- `fetchFundingRateIntervals (symbols, params)`
- `fetchLongShortRatio (symbol, params)`
- `fetchAutoDeLeverageRank (symbol, params)`
- `fetchPositionAutoDeLeverageRank (symbol, params)`
- `fetchPositionsAutoDeLeverageRank (symbols, params)`
- ...

```text
TODO: better formatting
```

## 覆盖统一 API 参数

请注意，统一 API 的大多数方法都接受一个可选的 `params` 参数。它是一个关联数组（字典，默认为空），包含您希望覆盖的参数。`params` 的内容因交易所而异，请查阅交易所的 API 文档以了解支持的字段和值。如需向统一查询传递自定义设置或可选参数，请使用 `params` 字典。


```javascript tab="JavaScript"
(async () => {

    const params = {
        'foo': 'bar',      // exchange-specific overrides in unified queries
        'Hello': 'World!', // see their docs for more details on parameter names
    }

    // the overrides go into the last argument to the unified call ↓ HERE
    const result = await exchange.fetchOrderBook (symbol, length, params)
}) ()
```

```python tab="Python"
params = {
    'foo': 'bar',       # exchange-specific overrides in unified queries
    'Hello': 'World!',  # see their docs for more details on parameter names
}

# overrides go in the last argument to the unified call ↓ HERE
result = exchange.fetch_order_book(symbol, length, params)
```

```php tab="PHP"
$params = array (
    'foo' => 'bar',       // exchange-specific overrides in unified queries
    'Hello' => 'World!',  // see their docs for more details on parameter names
}

// overrides go into the last argument to the unified call ↓ HERE
$result = $exchange->fetch_order_book ($symbol, $length, $params);
```

```go tab="Go"
params := map[string]interface{}{
    "foo":   "bar",     // exchange-specific overrides in unified queries
    "Hello": "World!",  // see their docs for more details on parameter names
}

// overrides go into the options of the unified call ↓ HERE
result, err := exchange.FetchOrderBook(symbol, ccxt.WithFetchOrderBookParams(params))
```

```csharp tab="C#"
var parameters = new Dictionary<string, object>() {
    { "foo", "bar" },       // exchange-specific overrides in unified queries
    { "Hello", "World!" },  // see their docs for more details on parameter names
};

// overrides go into the last argument to the unified call ↓ HERE
var result = await exchange.FetchOrderBook(symbol, length, parameters);
```

```java tab="Java"
Map<String, Object> params = Map.of("foo", "bar");
OrderBook ob = exchange.fetchOrderBook(symbol, limit, params);
```


## 分页

大多数统一方法将返回单个对象或对象的普通数组（列表）（成交记录、订单、交易记录等）。然而，几乎没有交易所会一次性返回所有订单、所有成交记录、所有 OHLCV K 线或所有交易记录。大多数情况下，其 API 会将输出限制在一定数量的最新对象内。**您无法通过一次调用获取从历史开始到当前时刻的所有对象**。实际上，几乎没有交易所会允许或容忍这种做法。

要获取历史订单或成交记录，用户需要分批或按"页"遍历数据。分页通常意味着在循环中*"逐一获取部分数据"*。

在大多数情况下，用户**需要使用至少某种形式的分页**才能持续获得预期结果。如果用户不应用任何分页，大多数方法将返回交易所的默认结果，可能从历史起点开始，也可能是最新对象的子集。默认行为（不分页）因交易所而异！分页手段通常特别用于以下方法：

- `fetchTrades()`
- `fetchOHLCV()`
- `fetchOrders()`
- `fetchCanceledOrders()`
- `fetchClosedOrder()`
- `fetchClosedOrders()`
- `fetchOpenOrder()`
- `fetchOpenOrders()`
- `fetchMyTrades()`
- `fetchTransactions()`
- `fetchDeposit()`
- `fetchDeposits()`
- `fetchWithdrawals()`

对于返回对象列表的方法，交易所可能提供一种或多种分页类型。CCXT 默认统一使用**基于日期的分页**，整个库中的时间戳均以**毫秒**为单位。


### 自动分页

*警告：这是一项实验性功能，在某些情况下可能产生意外或不正确的结果。*

近期，CCXT 引入了一种只需在 `params` 中提供 `paginate` 标志即可自动翻页获取多页结果的方式，将这项工作从用户代码中解放出来。目前大多数主流交易所已支持此功能，未来还将添加更多，但检查是否支持最简便的方法是查阅该方法的文档并搜索 *pagination* 参数。一如既往，也存在例外情况，某些端点可能无法通过时间戳或游标进行分页，此时 CCXT 无能为力。


目前，我们有三种不同的分页方式：
- **动态/基于时间**：使用 `until` 和 `since` 参数对动态结果（如成交记录、订单、交易记录等）进行分页。由于我们无法预先知道可获取的条目数量，它将每次执行一个请求，直到到达数据末尾或达到最大分页调用次数（可通过选项配置）。
- **确定性**：当我们能够预先计算每页的边界时，将并发执行请求以获得最佳性能。适用于 OHLCV、资金费率和未平仓合约，同样遵循 `paginationCalls` 选项。
- **基于游标**：当交易所在响应中提供游标时，我们提取游标并执行后续请求，直到到达数据末尾或达到最大分页调用次数。

用户无法选择所使用的分页方式，这取决于具体实现，并需考虑交易所 API 的功能特性。

#### 分页参数

我们无法执行无限数量的请求，且某些请求可能因各种原因抛出错误，因此我们提供了一些选项，允许用户控制这些变量及其他分页细节。

*以下所有选项均应在 `params` 内提供，您可以参考下方示例*

- **paginate**：（**boolean**）表示用户希望通过翻页获取更多数据。默认为 *false*。
- **paginationCalls**：（**integer**）允许用户控制分页数据的最大请求次数。由于速率限制，此值不应过高。默认为 10。
- **maxRetries**：（**integer**）分页机制在遇到错误时应重试的次数。默认为 3。
- **paginationDirection**：（**string**）仅适用于动态分页，可以是 *forward*（从过去某个时间点开始向前分页）或 *backward*（从最近时间开始向后分页）。若选择 *forward*，则还必须提供 *since* 参数。默认为 *backward*。
- **maxEntriesPerRequest**：（**integer**）每次请求的最大条目数，以便最大化每次调用获取的数据量。该值因端点而异，CCXT 将为您填充此值，但您可以根据需要覆盖它。

#### 示例

```python

trades = await binance.fetch_trades("BTC/USDT", params = {"paginate": True}) # dynamic/time-based

ohlcv = await binance.fetch_ohlcv("BTC/USDT", params = {"paginate": True, "paginationCalls": 5}) # deterministic-pagination will perform 5 requests

trades = await binance.fetch_trades("BTC/USDT", since = 1664812416000, params = {"paginate": True, "paginationDirection": "forward"}) # dynamic/time-based pagination starting from 1664812416000

ledger = await bybit.fetch_ledger(params = {"paginate": True}) # bybit returns a cursor so the pagination will be cursor-based

funding_rates = await binance.fetch_funding_rate_history("BTC/USDT:USDT", params = {"paginate": True, "maxEntriesPerRequest": 50}) # customizes the number of entries per request

```


### 处理日期和时间戳

整个 CCXT 库中所有统一时间戳均为**毫秒**整数，除非另有明确说明。

以下是用于处理 UTC 日期和时间戳以及相互转换的方法集合：

```javascript
exchange.parse8601 ('2018-01-01T00:00:00Z') == 1514764800000 // integer in milliseconds, Z = UTC
exchange.iso8601 (1514764800000) == '2018-01-01T00:00:00Z'   // from milliseconds to iso8601 string
exchange.seconds ()      // integer UTC timestamp in seconds
exchange.milliseconds () // integer UTC timestamp in milliseconds
```

### 基于日期的分页

这是目前整个 CCXT 统一 API 中使用的分页类型。用户提供一个**毫秒**（！）为单位的 `since` 时间戳以及用于限制结果数量的 `limit` 值。要逐页遍历感兴趣的对象，用户可执行以下操作（以下为伪代码，根据所涉及的交易所，可能需要覆盖某些交易所特定的参数）：

```javascript tab="JavaScript"
if (exchange.has['fetchTrades']) {
    let since = exchange.milliseconds () - 86400000 // -1 day from now
    // alternatively, fetch from a certain starting datetime
    // let since = exchange.parse8601 ('2018-01-01T00:00:00Z')
    let allTrades = []
    while (since < exchange.milliseconds ()) {
        const symbol = undefined // change for your symbol
        const limit = 20 // change for your limit
        const trades = await exchange.fetchTrades (symbol, since, limit)
        if (trades.length) {
            since = trades[trades.length - 1]['timestamp'] + 1
            allTrades = allTrades.concat (trades)
        } else {
            break
        }
    }
}
```

```python tab="Python"
if exchange.has['fetchOrders']:
    since = exchange.milliseconds () - 86400000  # -1 day from now
    # alternatively, fetch from a certain starting datetime
    # since = exchange.parse8601('2018-01-01T00:00:00Z')
    all_orders = []
    while since < exchange.milliseconds ():
        symbol = None  # change for your symbol
        limit = 20  # change for your limit
        orders = await exchange.fetch_orders(symbol, since, limit)
        if len(orders):
            since = orders[len(orders) - 1]['timestamp'] + 1
            all_orders += orders
        else:
            break
```

```php tab="PHP"
if ($exchange->has['fetchMyTrades']) {
    $since = exchange->milliseconds () - 86400000; // -1 day from now
    // alternatively, fetch from a certain starting datetime
    // $since = $exchange->parse8601 ('2018-01-01T00:00:00Z');
    $all_trades = array ();
    while (since < exchange->milliseconds ()) {
        $symbol = null; // change for your symbol
        $limit = 20; // change for your limit
        $trades = $exchange->fetchMyTrades ($symbol, $since, $limit);
        if (count($trades)) {
            $since = $trades[count($trades) - 1]['timestamp'] + 1;
            $all_trades = array_merge ($all_trades, $trades);
        } else {
            break;
        }
    }
}
```

```go tab="Go"
since := exchange.Milliseconds() - 86400000 // -1 day from now
allTrades := []ccxt.Trade{}
for since < exchange.Milliseconds() {
    symbol := "BTC/USDT" // change for your symbol
    trades, err := exchange.FetchTrades(symbol, ccxt.WithFetchTradesSince(since), ccxt.WithFetchTradesLimit(20))
    if err != nil {
        fmt.Println(err)
        break
    }
    if len(trades) > 0 {
        since = *trades[len(trades)-1].Timestamp + 1
        allTrades = append(allTrades, trades...)
    } else {
        break
    }
}
```

```csharp tab="C#"
var since = exchange.milliseconds() - 86400000; // -1 day from now
var allTrades = new List<Trade>();
while (since < exchange.milliseconds())
{
    var symbol = "BTC/USDT"; // change for your symbol
    var trades = await exchange.FetchTrades(symbol, since, 20);
    if (trades.Count > 0)
    {
        since = (Int64)trades[trades.Count - 1].Timestamp + 1;
        allTrades.AddRange(trades);
    }
    else
    {
        break;
    }
}
```

```java tab="Java"
long since = System.currentTimeMillis() - 86400000; // -1 day
List<Trade> allTrades = new ArrayList<>();
while (since < System.currentTimeMillis()) {
    List<Trade> trades = exchange.fetchTrades("BTC/USDT", since, 20L, null);
    if (!trades.isEmpty()) {
        since = trades.get(trades.size() - 1).timestamp + 1;
        allTrades.addAll(trades);
    } else {
        break;
    }
}
```


### 基于ID的分页

用户提供对象的 `from_id`，查询将从该位置继续返回结果，以及一个 `limit` 参数来限制结果数量。这在某些交易所是默认方式，但此类型尚未统一。要根据ID对对象进行分页，用户可按如下方式操作：


```javascript tab="JavaScript"
if (exchange.has['fetchTrades']) {
    let from_id = 'abc123' // all ids are strings
    let allTrades = []
    while (true) {
        const symbol = undefined // change for your symbol
        const since = undefined
        const limit = 20 // change for your limit
        const params = {
            'from_id': from_id, // exchange-specific non-unified parameter name
        }
        const trades = await exchange.fetchTrades (symbol, since, limit, params)
        if (trades.length) {
            from_id = trades[trades.length - 1]['id']
            allTrades.push (trades)
        } else {
            break
        }
    }
}
```

```python tab="Python"
if exchange.has['fetchOrders']:
    from_id = 'abc123'  # all ids are strings
    all_orders = []
    while True:
        symbol = None  # change for your symbol
        since = None
        limit = 20  # change for your limit
        params = {
            'from_id': from_id,  # exchange-specific non-unified parameter name
        }
        orders = await exchange.fetch_orders(symbol, since, limit, params)
        if len(orders):
            from_id = orders[len(orders) - 1]['id']
            all_orders += orders
        else:
            break
```

```php tab="PHP"
if ($exchange->has['fetchMyTrades']) {
    $from_id = 'abc123' // all ids are strings
    $all_trades = array ();
    while (true) {
        $symbol = null; // change for your symbol
        $since = null;
        $limit = 20; // change for your limit
        $params = array (
            'from_id' => $from_id, // exchange-specific non-unified parameter name
        );
        $trades = $exchange->fetchMyTrades ($symbol, $since, $limit, $params);
        if (count($trades)) {
            $from_id = $trades[count($trades) - 1]['id'];
            $all_trades = array_merge ($all_trades, $trades);
        } else {
            break;
        }
    }
}
```

```go tab="Go"
fromId := "abc123" // all ids are strings
allTrades := []ccxt.Trade{}
for {
    symbol := "BTC/USDT" // change for your symbol
    params := map[string]interface{}{
        "from_id": fromId, // exchange-specific non-unified parameter name
    }
    trades, err := exchange.FetchTrades(symbol, ccxt.WithFetchTradesLimit(20), ccxt.WithFetchTradesParams(params))
    if err != nil {
        fmt.Println(err)
        break
    }
    if len(trades) > 0 {
        fromId = *trades[len(trades)-1].Id
        allTrades = append(allTrades, trades...)
    } else {
        break
    }
}
```

```csharp tab="C#"
var fromId = "abc123"; // all ids are strings
var allTrades = new List<Trade>();
while (true)
{
    var symbol = "BTC/USDT"; // change for your symbol
    var parameters = new Dictionary<string, object>() {
        { "from_id", fromId }, // exchange-specific non-unified parameter name
    };
    var trades = await exchange.FetchTrades(symbol, null, 20, parameters);
    if (trades.Count > 0)
    {
        fromId = trades[trades.Count - 1].Id;
        allTrades.AddRange(trades);
    }
    else
    {
        break;
    }
}
```

```java tab="Java"
String fromId = "abc123";
List<Trade> allTrades = new ArrayList<>();
while (true) {
    Map<String, Object> params = Map.of("from_id", fromId);
    List<Trade> trades = exchange.fetchTrades("BTC/USDT", null, 20L, params);
    if (!trades.isEmpty()) {
        fromId = trades.get(trades.size() - 1).id;
        allTrades.addAll(trades);
    } else {
        break;
    }
}
```


### 基于页码（游标）的分页

用户提供页码或*初始"游标"*值。交易所返回一页结果以及*下一个"游标"*值，以便继续查询。大多数实现此类分页的交易所，要么在响应体内返回下一个游标，要么在HTTP响应头中返回下一个游标值。

示例实现请参见：https://github.com/ccxt/ccxt/blob/master/examples/py/coinbasepro-fetch-my-trades-pagination.py

在循环的每次迭代中，用户需要获取下一个游标，并将其放入下一次查询（即下一次迭代）的覆盖参数中：


```javascript tab="JavaScript"
if (exchange.has['fetchTrades']) {
    let page = 0  // exchange-specific type and value
    let allTrades = []
    while (true) {
        const symbol = undefined // change for your symbol
        const since = undefined
        const limit = 20 // change for your limit
        const params = {
            'page': page, // exchange-specific non-unified parameter name
        }
        const trades = await exchange.fetchTrades (symbol, since, limit, params)
        if (trades.length) {
            // not thread-safe and exchange-specific!
            last_json_response = exchange.parseJson (exchange.last_http_response)
            page = last_json_response['cursor']
            allTrades.push (trades)
        } else {
            break
        }
    }
}
```

```python tab="Python"
if exchange.has['fetchOrders']:
    cursor = 0  # exchange-specific type and value
    all_orders = []
    while True:
        symbol = None  # change for your symbol
        since = None
        limit = 20  # change for your limit
        params = {
            'cursor': cursor,  # exchange-specific non-unified parameter name
        }
        orders = await exchange.fetch_orders(symbol, since, limit, params)
        if len(orders):
            # not thread-safe and exchange-specific!
            cursor = exchange.last_response_headers['CB-AFTER']
            all_orders += orders
        else:
            break
```

```php tab="PHP"
if ($exchange->has['fetchMyTrades']) {
    $start = '0' // exchange-specific type and value
    $all_trades = array ();
    while (true) {
        $symbol = null; // change for your symbol
        $since = null;
        $limit = 20; // change for your limit
        $params = array (
            'start' => $start, // exchange-specific non-unified parameter name
        );
        $trades = $exchange->fetchMyTrades ($symbol, $since, $limit, $params);
        if (count($trades)) {
            // not thread-safe and exchange-specific!
            $last_json_response = $exchange->parse_json ($exchange->last_http_response);
            $start = $last_json_response['next'];
            $all_trades = array_merge ($all_trades, $trades);
        } else {
            break;
        }
    }
}
```

```go tab="Go"
page := 0 // exchange-specific type and value
allTrades := []ccxt.Trade{}
for {
    symbol := "BTC/USDT" // change for your symbol
    params := map[string]interface{}{
        "page": page, // exchange-specific non-unified parameter name
    }
    trades, err := exchange.FetchTrades(symbol, ccxt.WithFetchTradesLimit(20), ccxt.WithFetchTradesParams(params))
    if err != nil {
        fmt.Println(err)
        break
    }
    if len(trades) > 0 {
        page++ // or extract cursor from response
        allTrades = append(allTrades, trades...)
    } else {
        break
    }
}
```

```csharp tab="C#"
var page = 0; // exchange-specific type and value
var allTrades = new List<Trade>();
while (true)
{
    var symbol = "BTC/USDT"; // change for your symbol
    var parameters = new Dictionary<string, object>() {
        { "page", page }, // exchange-specific non-unified parameter name
    };
    var trades = await exchange.FetchTrades(symbol, null, 20, parameters);
    if (trades.Count > 0)
    {
        page++; // or extract cursor from response
        allTrades.AddRange(trades);
    }
    else
    {
        break;
    }
}
```

```java tab="Java"
int page = 0;
List<Trade> allTrades = new ArrayList<>();
while (true) {
    Map<String, Object> params = Map.of("page", page);
    List<Trade> trades = exchange.fetchTrades("BTC/USDT", null, 20L, params);
    if (!trades.isEmpty()) {
        page++; // or extract cursor from response
        allTrades.addAll(trades);
    } else {
        break;
    }
}
```


# 公共API

- [订单簿](#order-book)
- [价格行情](#price-tickers)
- [OHLCV K线图](#ohlcv-candlestick-charts)
- [公开交易](#public-trades)
- [交易所时间](#exchange-time)
- [交易所状态](#exchange-status)
- [借贷利率](#borrow-rates)
- [借贷利率历史](#borrow-rate-history)
- [杠杆档位](#leverage-tiers)
- [资金费率](#funding-rate)
- [资金费率历史](#funding-rate-history)
- [未平仓合约历史](#open-interest-history)
- [波动率历史](#volatility-history)
- [标的资产](#underlying-assets)
- [强制平仓](#liquidations)
- [希腊字母](#greeks)
- [期权链](#option-chain)
- [自动减仓](#auto-de-leverage)

## 订单簿

交易所提供买入（bid）和卖出（ask）价格、数量及其他数据的挂单信息。通常有专门的端点用于查询特定市场*订单簿*的当前状态（快照）。订单簿也常被称为*市场深度*。订单簿信息用于交易决策过程中。

要获取订单簿数据，可以使用

- `fetchOrderBook ()` // 获取单个市场的订单簿
- `fetchOrderBooks ( symbols )` // 获取多个市场的订单簿
- `fetchOrderBooks ()` // 获取所有市场的订单簿

```javascript
async fetchOrderBook (symbol, limit = undefined, params = {})
```

参数

- **symbol** (String) *必填* 统一CCXT交易对符号（例如 `"BTC/USDT"`）
- **limit** (Integer) 订单簿中返回的订单数量（例如 `10`）
- **params** (Dictionary) 特定于交易所API端点的额外参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[订单簿结构](#order-book-structure)

```javascript
async fetchOrderBooks (symbols = undefined, limit = undefined, params = {})
```

参数

- **symbols** (\[String\]) 统一CCXT交易对符号（例如 `["BTC/USDT", "ETH/USDT"]`）
- **limit** (Integer) 订单簿中返回的订单数量（例如 `10`）
- **params** (Dictionary) 特定于交易所API端点的额外参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个以市场交易对符号为索引的[订单簿结构](#order-book-structure)字典

### fetchOrderBook 示例


```javascript tab="JavaScript"
delay = 2000 // milliseconds = seconds * 1000
(async () => {
    for (symbol in exchange.markets) {
        console.log (await exchange.fetchOrderBook (symbol))
        await new Promise (resolve => setTimeout (resolve, delay)) // rate limit
    }
}) ()
```

```python tab="Python"
import time
delay = 2 # seconds
for symbol in exchange.markets:
    print (exchange.fetch_order_book (symbol))
    time.sleep (delay) # rate limit
```

```php tab="PHP"
$delay = 2000000; // microseconds = seconds * 1000000
foreach ($exchange->markets as $symbol => $market) {
    var_dump ($exchange->fetch_order_book ($symbol));
    usleep ($delay); // rate limit
}
```

```go tab="Go"
exchange := ccxt.NewBinance(nil)
exchange.LoadMarkets()
for _, symbol := range exchange.GetSymbols() {
    ob, err := exchange.FetchOrderBook(symbol)
    if err != nil {
        fmt.Println(err)
        continue
    }
    fmt.Println(symbol, "bids:", len(ob.Bids), "asks:", len(ob.Asks))
}
```

```csharp tab="C#"
var exchange = new Binance();
await exchange.LoadMarkets();
foreach (string symbol in exchange.symbols)
{
    var ob = await exchange.FetchOrderBook(symbol);
    Console.WriteLine(symbol + " bids: " + ob.bids.Count + " asks: " + ob.asks.Count);
}
```

```java tab="Java"
Binance exchange = new Binance();
exchange.loadMarkets(false);
OrderBook ob = exchange.fetchOrderBook("BTC/USDT", 10L, null);
System.out.println("bids: " + ob.bids.size() + " asks: " + ob.asks.size());
```


### 订单簿结构

```javascript
{
    'bids': [
        [ price, amount ], // [ float, float ]
        [ price, amount ],
        ...
    ],
    'asks': [
        [ price, amount ],
        [ price, amount ],
        ...
    ],
    'symbol': 'ETH/BTC', // a unified market symbol
    'timestamp': 1499280391811, // Unix Timestamp in milliseconds (seconds * 1000)
    'datetime': '2017-07-05T18:47:14.692Z', // ISO8601 datetime string with milliseconds
    'nonce': 1499280391811, // an increasing unique identifier of the orderbook snapshot
}
```

**如果相关交易所在API响应中未提供对应值，时间戳和日期时间可能缺失（`undefined/None/null`）。**

价格和数量均为浮点数。买单数组按价格降序排列。最优（最高）买价为第一个元素，最差（最低）买价为最后一个元素。卖单数组按价格升序排列。最优（最低）卖价为第一个元素，最差（最高）卖价为最后一个元素。如果交易所订单簿中没有对应的挂单，买/卖单数组可能为空。

交易所可能以不同详细程度返回挂单堆栈供分析。可以是包含每一笔订单的完整详情，也可以是将订单按价格和数量合并分组、详情略少的聚合形式。更高的详细程度需要更多流量和带宽，总体上速度较慢，但能提供更高精度的优势。较少的详情通常更快，但在某些非常特殊的情况下可能不够用。

### 订单簿结构注意事项

- `orderbook['timestamp']` 是交易所生成该订单簿响应的时间（在回复给你之前）。如手册中所述，这可能缺失（`undefined/None/null`），并非所有交易所都在此处提供时间戳。如果有定义，则为自1970年1月1日00:00:00起的UTC时间戳，单位为**毫秒**。
- 某些交易所可能通过订单ID对订单簿中的订单进行索引，在这种情况下，订单ID可能作为买/卖单的第三个元素返回：`[ price, amount, id ]`。这通常出现在没有聚合的L3订单簿中。订单簿中显示的订单 `id` 是指订单簿内的行ID，不一定对应交易所数据库中所有者或其他人可见的实际订单ID（不过，根据具体交易所，两者也可能相同）。
- 在某些情况下，交易所可能提供带有每个聚合级别订单数量的L2聚合订单簿，此时订单数量可能作为买/卖单的第三个元素返回：`[ price, amount, count ]`。`count` 表示买/卖单中每个价格级别聚合了多少笔订单。
- 此外，某些交易所可能将订单时间戳作为买/卖单的第三个元素返回：`[ price, amount, timestamp ]`。`timestamp` 表示该订单挂入订单簿的时间。

### 市场深度

某些交易所接受向 `fetchOrderBook () / fetch_order_book ()` 函数传入额外参数字典。**所有额外的 `params` 均为交易所特定参数（非统一参数）**。如果要覆盖特定参数（如订单簿深度），需要查阅交易所文档。可以通过指定 limit 参数和交易所特定的额外 `params` 来获取有限数量的返回订单或所需的聚合级别（即*市场深度*），如下所示：


```javascript tab="JavaScript"


(async function test () {
    const ccxt = require ('ccxt')
    const exchange = new ccxt.bitfinex ()
    const limit = 5
    const orders = await exchange.fetchOrderBook ('BTC/USD', limit, {
        // this parameter is exchange-specific, all extra params have unique names per exchange
        'group': 1, // 1 = orders are grouped by price, 0 = orders are separate
    })
}) ()
```

```python tab="Python"

import ccxt
# return up to ten bidasks on each side of the order book stack
limit = 10
ccxt.cex().fetch_order_book('BTC/USD', limit)
```

```php tab="PHP"

// instantiate the exchange by id
$exchange = '\\ccxt\\kraken';
$exchange = new $exchange ();
// up to ten orders on each side, for example
$limit = 20;
var_dump ($exchange->fetch_order_book ('BTC/USD', $limit));
```

```go tab="Go"
exchange := ccxt.NewBitfinex(nil)
limit := 5
orders, err := exchange.FetchOrderBook("BTC/USD", ccxt.WithFetchOrderBookLimit(int64(limit)), ccxt.WithFetchOrderBookParams(map[string]interface{}{
    // this parameter is exchange-specific, all extra params have unique names per exchange
    "group": 1, // 1 = orders are grouped by price, 0 = orders are separate
}))
if err != nil {
    fmt.Println(err)
    return
}
fmt.Println(orders.Bids, orders.Asks)
```

```csharp tab="C#"
var exchange = new Bitfinex();
var limit = 5;
var orders = await exchange.FetchOrderBook("BTC/USD", limit, new Dictionary<string, object>() {
    // this parameter is exchange-specific, all extra params have unique names per exchange
    { "group", 1 }, // 1 = orders are grouped by price, 0 = orders are separate
});
Console.WriteLine("bids: " + orders.bids.Count + " asks: " + orders.asks.Count);
```

```java tab="Java"
OrderBook ob = exchange.fetchOrderBook("BTC/USDT", 5L, null);
System.out.println("bids: " + ob.bids.size() + " asks: " + ob.asks.size());
```


详细程度或订单簿聚合级别通常用数字标记，如L1、L2、L3……

- **L1**：详情最少，用于快速获取最基本的信息，即仅获取市场价格。其外观就像订单簿中只有一笔订单。
- **L2**：最常见的聚合级别，订单数量按价格分组。如果两笔订单价格相同，它们将显示为一笔总量相加的订单。这很可能是大多数用途所需的聚合级别。
- **L3**：最详细的级别，无任何聚合，每笔订单相互独立。此详细程度的输出中自然包含重复项。因此，如果两笔订单价格相同，它们**不会**被合并，由交易所的撮合引擎决定其在队列中的优先级。成功交易实际上并不需要L3详情。事实上，您很可能根本不需要它。因此，一些交易所不支持L3，始终返回聚合订单簿。

如果您想获取L2订单簿（无论交易所返回什么），请使用 `fetchL2OrderBook(symbol, limit, params)` 或 `fetch_l2_order_book(symbol, limit, params)` 统一方法。

`limit` 参数不保证买单或卖单的数量始终等于 `limit`。它指定的是上限或最大值，因此在某一时刻，买单或卖单的数量可能少于 `limit`。当交易所订单簿上没有足够的挂单时就会出现这种情况。但是，如果底层交易所API根本不支持订单簿端点的 `limit` 参数，则 `limit` 参数将被忽略。如果交易所返回的数量超过您请求的数量，CCXT不会截断 `bids` 和 `asks`。

### 市场价格

要获取当前最优价格（查询市场价格）并计算买卖价差，请从买单和卖单中取第一个元素，如下所示：


```javascript tab="JavaScript"
let orderbook = await exchange.fetchOrderBook (exchange.symbols[0])
let bid = orderbook.bids.length ? orderbook.bids[0][0] : undefined
let ask = orderbook.asks.length ? orderbook.asks[0][0] : undefined
let spread = (bid && ask) ? ask - bid : undefined
console.log (exchange.id, 'market price', { bid, ask, spread })
```


```python tab="Python"
orderbook = exchange.fetch_order_book (exchange.symbols[0])
bid = orderbook['bids'][0][0] if len (orderbook['bids']) > 0 else None
ask = orderbook['asks'][0][0] if len (orderbook['asks']) > 0 else None
spread = (ask - bid) if (bid and ask) else None
print (exchange.id, 'market price', { 'bid': bid, 'ask': ask, 'spread': spread })
```

```php tab="PHP"
$orderbook = $exchange->fetch_order_book ($exchange->symbols[0]);
$bid = count ($orderbook['bids']) ? $orderbook['bids'][0][0] : null;
$ask = count ($orderbook['asks']) ? $orderbook['asks'][0][0] : null;
$spread = ($bid && $ask) ? $ask - $bid : null;
$result = array ('bid' => $bid, 'ask' => $ask, 'spread' => $spread);
var_dump ($exchange->id, 'market price', $result);
```
```go tab="Go"
orderbook, err := exchange.FetchOrderBook(exchange.GetSymbols()[0])
if err != nil {
    fmt.Println(err)
    return
}
var bid, ask, spread float64
if len(orderbook.Bids) > 0 {
    bid = orderbook.Bids[0][0]
}
if len(orderbook.Asks) > 0 {
    ask = orderbook.Asks[0][0]
}
if bid > 0 && ask > 0 {
    spread = ask - bid
}
fmt.Println(exchange.GetId(), "market price", "bid:", bid, "ask:", ask, "spread:", spread)
```

```csharp tab="C#"
var orderbook = await exchange.FetchOrderBook(exchange.symbols[0].ToString());
double? bid = orderbook.bids.Count > 0 ? orderbook.bids[0][0] : null;
double? ask = orderbook.asks.Count > 0 ? orderbook.asks[0][0] : null;
double? spread = (bid != null && ask != null) ? ask - bid : null;
Console.WriteLine(exchange.id + " market price bid=" + bid + " ask=" + ask + " spread=" + spread);
```

```java tab="Java"
OrderBook ob = exchange.fetchOrderBook("BTC/USDT");
Double bid = !ob.bids.isEmpty() ? ob.bids.get(0).get(0) : null;
Double ask = !ob.asks.isEmpty() ? ob.asks.get(0).get(0) : null;
Double spread = (bid != null && ask != null) ? ask - bid : null;
System.out.println("bid=" + bid + " ask=" + ask + " spread=" + spread);
```


## 价格行情

价格行情包含特定市场/交易对在最近一段时间（通常为过去24小时）内的统计数据。获取行情的方法如下所述。

### 单个交易对的行情

```javascript
// one ticker
fetchTicker (symbol, params = {})

// example
fetchTicker ('ETH/BTC')
fetchTicker ('BTC/USDT')
```

### 多个或所有交易对的行情

```javascript
// multiple tickers
fetchTickers (symbols = undefined, params = {})  // for all tickers at once

// for example
fetchTickers () // all symbols
fetchTickers ([ 'ETH/BTC', 'BTC/USDT' ]) // an array of specific symbols
```

检查交易所实例的 `exchange.has['fetchTicker']` 和 `exchange.has['fetchTickers']` 属性，以确定相关交易所是否支持这些方法。

**请注意，不带交易对符号调用 `fetchTickers ()` 通常受到严格的频率限制，如果您过于频繁地请求该端点，交易所可能会封禁您。**

### 行情结构

行情是对特定市场过去24小时内信息的统计计算结果。

行情的结构如下：

```javascript
{
    'symbol':        string symbol of the market ('BTC/USD', 'ETH/BTC', ...)
    'info':        { the original non-modified unparsed reply from exchange API },
    'timestamp':     int (64-bit Unix Timestamp in milliseconds since Epoch 1 Jan 1970)
    'datetime':      ISO8601 datetime string with milliseconds
    'high':          float, // highest price
    'low':           float, // lowest price
    'bid':           float, // current best bid (buy) price
    'bidVolume':     float, // current best bid (buy) amount (may be missing or undefined)
    'ask':           float, // current best ask (sell) price
    'askVolume':     float, // current best ask (sell) amount (may be missing or undefined)
    'vwap':          float, // volume weighed average price
    'open':          float, // opening price
    'close':         float, // price of last trade (closing price for current period)
    'last':          float, // same as `close`, duplicated for convenience
    'previousClose': float, // closing price for the previous period
    'change':        float, // absolute change, `last - open`
    'percentage':    float, // relative change, `(change/open) * 100`
    'average':       float, // average price, `(last + open) / 2`
    'baseVolume':    float, // volume of base currency traded for last 24 hours
    'quoteVolume':   float, // volume of quote currency traded for last 24 hours
}
```

#### 行情结构注意事项

- 行情中的所有字段均代表 `timestamp` 之前过去24小时的数据。
- `bidVolume` 是订单簿中当前最优买价的数量（volume/amount）。
- `askVolume` 是订单簿中当前最优卖价的数量（volume/amount）。
- `baseVolume` 是过去24小时内基础货币的交易量（买入或卖出）。
- `quoteVolume` 是过去24小时内计价货币的交易量（买入或卖出）。

**行情结构中的所有价格均以计价货币表示。返回的行情结构中某些字段可能为 undefined/None/null。**

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

时间戳和日期时间均为协调世界时（UTC），单位为毫秒。

- `ticker['timestamp']` 是交易所生成该响应的时间（在回复给你之前）。如手册中所述，这可能缺失（`undefined/None/null`），并非所有交易所都在此处提供时间戳。如果有定义，则为自1970年1月1日00:00:00起的UTC时间戳，单位为**毫秒**。
- `exchange.last_response_headers['Date']` 是最后收到的HTTP响应（来自HTTP头）的日期时间字符串。'Date'解析器应遵循其中指定的时区。日期时间的精度为1秒，即1000毫秒。该日期应由交易所服务器在消息产生时根据以下标准设置：
    - https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.18
    - https://tools.ietf.org/html/rfc1123#section-5.2.14
    - https://tools.ietf.org/html/rfc822#section-5

尽管某些交易所确实会将订单簿顶部的买/卖价格混入其行情中（有些交易所甚至提供顶部买/卖数量），但您不应将行情视为 `fetchOrderBook` 的替代品。行情的主要目的是提供统计数据，因此请将其视为"实时24小时OHLCV"。已知交易所会通过对这些查询施加更严格的频率限制来阻止频繁的 `fetchTicker` 请求。如果您需要统一的方式来访问买/卖价，应改用 `fetchL[123]OrderBook` 系列方法。

要获取历史价格和成交量，请在可用时使用统一的 [`fetchOHLCV`](#ohlcv-candlestick-charts) 方法。要获取历史标记价格、指数价格和溢价指数价格，请在 `fetchOHLCV` 的[参数覆盖](#overriding-unified-api-params)中分别添加 `'price': 'mark'`、`'price': 'index'` 或 `'price': 'premiumIndex'` 之一。还有便捷方法 `fetchMarkPriceOHLCV`、`fetchIndexPriceOHLCV` 和 `fetchPremiumIndexOHLCV`，用于获取标记价格、指数价格和溢价指数的历史价格及成交量。

获取行情的方法：

- `fetchTicker (symbol[, params = {}])`，symbol 为必填参数，params 为可选参数
- `fetchTickers ([symbols = undefined[, params = {}]])`，两个参数均为可选

### 按交易对单独获取

要从交易所获取特定交易对或特定符号的单个行情数据，请调用 `fetchTicker (symbol)`：


```javascript tab="JavaScript"
if (exchange.has['fetchTicker']) {
    console.log (await (exchange.fetchTicker ('BTC/USD'))) // ticker for BTC/USD
    let symbols = Object.keys (exchange.markets)
    let random = Math.floor (Math.random () * (symbols.length - 1))
    console.log (exchange.fetchTicker (symbols[random])) // ticker for a random symbol
}
```
```python tab="Python"
import random
if (exchange.has['fetchTicker']):
    print(exchange.fetch_ticker('LTC/ZEC')) # ticker for LTC/ZEC
    symbols = list(exchange.markets.keys())
    print(exchange.fetch_ticker(random.choice(symbols))) # ticker for a random symbol
```
```php tab="PHP"
//(don't forget to set your timezone properly!)
if ($exchange->has['fetchTicker']) {
    var_dump ($exchange->fetch_ticker ('ETH/CNY')); // ticker for ETH/CNY
    $symbols = array_keys ($exchange->markets);
    $random = rand () % count ($symbols);
    var_dump ($exchange->fetch_ticker ($symbols[$random])); // ticker for a random symbol
}
```
```go tab="Go"
ticker, err := exchange.FetchTicker("BTC/USDT")
if err != nil {
    fmt.Println(err)
    return
}
fmt.Println(ticker.Symbol, "last=", ticker.Last, "bid=", ticker.Bid, "ask=", ticker.Ask)
```
```csharp tab="C#"
var ticker = await exchange.FetchTicker("BTC/USDT");
Console.WriteLine(ticker.symbol + " last=" + ticker.last + " bid=" + ticker.bid + " ask=" + ticker.ask);
```
```java tab="Java"
Ticker ticker = exchange.fetchTicker("BTC/USDT");
System.out.println(ticker.symbol + " last=" + ticker.last + " bid=" + ticker.bid + " ask=" + ticker.ask);
```


### 一次性获取全部

部分交易所（并非全部）也支持一次性获取所有行情。详情请参阅[其文档](#exchanges)。您可以通过单次调用获取所有行情，如下所示：


```javascript tab="JavaScript"
if (exchange.has['fetchTickers']) {
    console.log (await (exchange.fetchTickers ())) // all tickers indexed by their symbols
}
```
```python tab="Python"
if (exchange.has['fetchTickers']):
    print(exchange.fetch_tickers()) # all tickers indexed by their symbols
```
```php tab="PHP"
if ($exchange->has['fetchTickers']) {
    var_dump ($exchange->fetch_tickers ()); // all tickers indexed by their symbols
}
```
```go tab="Go"
tickers, err := exchange.FetchTickers()
if err != nil {
    fmt.Println(err)
    return
}
for symbol, ticker := range tickers.Tickers {
    fmt.Println(symbol, "last=", ticker.Last)
}
```
```csharp tab="C#"
var tickers = await exchange.FetchTickers();
foreach (var entry in tickers.tickers)
{
    Console.WriteLine(entry.Key + " last=" + entry.Value.last);
}
```
```java tab="Java"
Tickers tickers = exchange.fetchTickers();
for (var entry : tickers.tickers.entrySet()) {
    System.out.println(entry.getKey() + " last=" + entry.getValue().last);
}
```


获取所有行情所需的流量远多于获取单个行情。另外请注意，某些交易所对后续获取所有行情的操作会施加更高的频率限制（详情请参阅其相应端点的文档）。**`fetchTickers()` 调用在频率限制方面的消耗通常高于平均水平**。如果您只需要一个行情，按特定交易对获取也会更快。您可能只有在真正需要所有行情时才应获取全部行情，而且很可能不希望以超过每分钟一次的频率调用 fetchTickers。

此外，某些交易所可能对 `fetchTickers()` 调用施加额外要求，有时由于相关交易所的 API 限制，您无法获取所有交易对的行情。有些交易所在 HTTP URL 查询参数中接受交易对列表，但由于 URL 长度有限，而在极端情况下交易所可能有数千个市场——所有交易对的列表根本无法放入 URL 中，因此只能是其交易对的有限子集。有时还有其他原因要求提供交易对列表，并且一次可获取的交易对数量可能有限制，但无论限制如何，请将其归咎于交易所本身。要向交易所传递感兴趣的交易对，您可以将字符串列表作为 fetchTickers 的第一个参数传入：


```javascript tab="JavaScript"
//JavaScript
if (exchange.has['fetchTickers']) {
    console.log (await (exchange.fetchTickers ([ 'ETH/BTC', 'LTC/BTC' ]))) // listed tickers indexed by their symbols
}
```
```python tab="Python"
if (exchange.has['fetchTickers']):
    print(exchange.fetch_tickers(['ETH/BTC', 'LTC/BTC'])) # listed tickers indexed by their symbols
```
```php tab="PHP"
if ($exchange->has['fetchTickers']) {
    var_dump ($exchange->fetch_tickers (array ('ETH/BTC', 'LTC/BTC'))); // listed tickers indexed by their symbols
}
```
```go tab="Go"
tickers, err := exchange.FetchTickers(ccxt.WithFetchTickersSymbols([]string{"ETH/BTC", "LTC/BTC"}))
if err != nil {
    fmt.Println(err)
    return
}
fmt.Println(len(tickers.Tickers)) // listed tickers indexed by their symbols
```
```csharp tab="C#"
var tickers = await exchange.FetchTickers(new List<string>() { "ETH/BTC", "LTC/BTC" }); // listed tickers indexed by their symbols
Console.WriteLine(tickers.tickers.Count);
```
```java tab="Java"
Tickers tickers = exchange.fetchTickers(List.of("ETH/BTC", "LTC/BTC"), null);
```


请注意，在大多数情况下不需要提供交易对列表，但如果您想处理交易所端可能施加的所有限制，则必须添加额外的逻辑。

与统一 CCXT API 的大多数方法一样，fetchTickers 的最后一个参数是用于覆盖发送给交易所的请求参数的 `params` 参数。

返回值的结构如下：

```javascript
{
    'info':    { ... }, // the original JSON response from the exchange as is
    'BTC/USD': { ... }, // a single ticker for BTC/USD
    'ETH/BTC': { ... }, // a ticker for ETH/BTC
    ...
}
```

从所有交易所（甚至没有相应 API 端点的交易所）获取所有行情的通用解决方案正在开发中，本节将很快更新。

```text
UNDER CONSTRUCTION
```

## OHLCV 蜡烛图

大多数交易所都有获取 OHLCV 数据的端点，但并非全部。交易所的布尔值（true/false）属性 `has['fetchOHLCV']` 表示该交易所是否支持蜡烛图数据序列。

要从交易所获取 OHLCV 蜡烛/K 线，ccxt 提供了 `fetchOHLCV` 方法，声明方式如下：

```javascript
fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {})
```

您可以调用统一的 `fetchOHLCV` / `fetch_ohlcv` 方法来获取特定交易对的 OHLCV 蜡烛列表，如下所示：


```javascript tab="JavaScript"
let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
if (exchange.has.fetchOHLCV) {
    for (symbol in exchange.markets) {
        await sleep (exchange.rateLimit) // milliseconds
        console.log (await exchange.fetchOHLCV (symbol, '1m')) // one minute
    }
}
```
```python tab="Python"
import time
if exchange.has['fetchOHLCV']:
    for symbol in exchange.markets:
        time.sleep (exchange.rateLimit / 1000) # time.sleep wants seconds
        print (symbol, exchange.fetch_ohlcv (symbol, '1d')) # one day
```
```php tab="PHP"
if ($exchange->has['fetchOHLCV']) {
    foreach ($exchange->markets as $symbol => $market) {
        usleep ($exchange->rateLimit * 1000); // usleep wants microseconds
        var_dump ($exchange->fetch_ohlcv ($symbol, '1M')); // one month
    }
}
```
```go tab="Go"
candles, err := exchange.FetchOHLCV("BTC/USDT", ccxt.WithFetchOHLCVTimeframe("1h"), ccxt.WithFetchOHLCVLimit(10))
if err != nil {
    fmt.Println(err)
    return
}
for _, c := range candles {
    fmt.Println(c.Timestamp, "O=", c.Open, "H=", c.High, "L=", c.Low, "C=", c.Close)
}
```
```csharp tab="C#"
var candles = await exchange.FetchOHLCV("BTC/USDT", "1h", null, 10);
foreach (var c in candles)
{
    Console.WriteLine(c.timestamp + " O=" + c.open + " H=" + c.high + " L=" + c.low + " C=" + c.close);
}
```
```java tab="Java"
List<OHLCV> candles = exchange.fetchOHLCV("BTC/USDT", "1h", null, 10L, null);
for (OHLCV c : candles) {
    System.out.println(c.timestamp + " O=" + c.open + " H=" + c.high + " L=" + c.low + " C=" + c.close);
}
```


要查看您的交易所可用的时间周期列表，请参阅 `timeframes` 属性。请注意，该属性只有在 `has['fetchOHLCV']` 为 true 时才会被填充。

如果交易所在指定时间范围和交易对内没有任何成交记录，返回的蜡烛列表可能存在一个或多个缺失周期，对用户而言会表现为连续蜡烛列表中的空缺。这被视为正常现象。如果交易所在该时间段内没有任何蜡烛数据，CCXT 库将按照交易所自身返回的结果显示。

**您的请求能追溯的历史时间是有限制的。** 大多数交易所不允许查询太久以前的详细蜡烛图历史（例如 1 分钟和 5 分钟时间周期的数据）。它们通常保留合理数量的最近蜡烛，例如任何时间周期的最近 1000 根蜡烛对于大多数需求来说已经足够。您可以通过持续获取（即 *REST 轮询*）最新 OHLCV 并将其存储在 CSV 文件或数据库中来绕过这一限制。

**请注意，最后一根（当前）蜡烛的信息在该蜡烛收盘之前（即下一根蜡烛开始之前）可能是不完整的。**

与大多数其他统一和隐式方法一样，`fetchOHLCV` 方法接受一个关联数组（字典）作为最后一个参数，其中包含额外的 `params`，用于[覆盖默认值](#overriding-unified-api-params)，这些默认值会在向交易所发送请求时使用。`params` 的内容因交易所而异，请参阅交易所的 API 文档以了解支持的字段和值。

`since` 参数是一个整数 UTC 时间戳，**以毫秒为单位**（在整个库的所有统一方法中均如此）。

如果未指定 `since`，`fetchOHLCV` 方法将按照交易所本身的默认设置返回时间范围。这不是一个 bug。某些交易所将从时间起点返回蜡烛，其他交易所只返回最近的蜡烛，交易所的默认行为是预期行为。因此，不指定 `since` 时，返回的蜡烛范围将因交易所而异。应传入 `since` 参数以确保获取到精确所需的历史范围。

### 获取原始 OHLCV 响应

目前，CCXT 使用的结构不包含来自交易所的原始响应。但是，用户可以通过以下方式覆盖返回值：


```javascript tab="JavaScript"
const ex = new ccxt.coinbase();
const originalParser = ex.parseOHLCV.bind(ex);
ex.parseOHLCV = ((ohlcv, market = undefined) => {
    return {
        'result': originalParser(ohlcv, market),
        'raw': ohlcv,
    };
});
const result = await ex.fetchOHLCV('BTC/USDT', '1m');
console.log (result[0]);
```
```python tab="Python"
# add raw member at last position in list
async def test():
    ex = ccxt.async_support.coinbase()
    prase_ohlcv_original = ex.parse_ohlcv
    def prase_ohlcv_custom(ohlcv, market):
        res = prase_ohlcv_original(ohlcv, market)
        res.append(ohlcv)
        return res
    ex.parse_ohlcv = prase_ohlcv_custom
    result = await ex.fetch_ohlcv('BTC/USDT', '1m')
    print (result[0])

asyncio.run(test())
```


### 关于延迟的说明

交易策略需要用于技术分析、指标和信号的最新实时信息。基于从交易所接收的 OHLCV 蜡烛构建投机交易策略可能存在严重缺陷。开发者应了解本节中说明的细节，以构建成功的交易机器人。

首先，使用 CCXT 时，您是直接与交易所通信的。CCXT 不是服务器，也不是服务，它是一个软件库。您通过 CCXT 获取的所有数据都是直接从交易所第一手获取的。

交易所通常提供两类公开市场数据：

1. 快速的一阶原始数据，包括实时订单簿和成交记录
2. 缓慢的二阶数据，包括次级行情和 K 线 OHLCV 蜡烛，这些数据是从一阶数据计算得出的

一阶原始数据由交易所 API 以近实时或尽可能接近实时的速度更新。二阶数据需要交易所花时间计算。例如，行情不过是订单簿和成交记录的滚动 24 小时统计切片。OHLCV 蜡烛和成交量也是从一阶成交数据计算得出的，代表特定时间段的固定统计切片。一小时内的成交量只是该小时内发生的相应成交记录的成交量之和。

显然，交易所需要一些时间来收集一阶数据并从中计算出二阶统计数据。这实际上意味着**行情和 OHLCV 的更新始终慢于订单簿和成交记录**。换句话说，在成交发生的时刻与交易所 API 更新或发布相应 OHLCV 蜡烛的时刻之间，交易所 API 中始终存在一定的延迟。

延迟（即交易所 API 计算二阶数据所需的时间）取决于交易所引擎的速度，因此因交易所而异。顶级交易所引擎通常能以极快的速度返回和更新最新的分钟级 OHLCV 蜡烛和行情。某些交易所可能按固定间隔更新，例如每秒一次或每隔几秒一次。速度较慢的交易所引擎可能需要几分钟才能更新二阶统计信息，其 API 返回当前最新 OHLCV 蜡烛时可能会延迟几分钟。

如果您的策略依赖于最新的分钟级实时数据，您就不应该基于从交易所接收的行情或 OHLCV 来构建策略。行情和交易所的 OHLCV 仅适用于显示目的，或适用于对延迟不那么敏感的小时级或日级时间周期的简单交易策略。

幸运的是，时间敏感型交易策略的开发者不必依赖交易所的二阶数据，可以在用户端自行计算 OHLCV 和行情。这可能比等待交易所在其端更新信息更快、更高效。可以通过频繁轮询公开成交历史并遍历成交记录列表来聚合并计算蜡烛——请查看[示例文件夹](https://github.com/ccxt/ccxt/tree/master/examples)中的 "build-ohlcv-bars" 文件。

由于内部实现的差异，交易所通过 WebSocket 更新其一阶和二阶市场数据的速度可能更快。延迟仍然因交易所而异，因为无论您是通过 CCXT 使用 RESTful API 轮询还是通过 CCXT Pro 使用 WebSocket 获取更新，交易所引擎仍然需要时间来计算二阶数据。WebSocket 可以改善网络延迟，因此快速的交易所会表现得更好，但添加 WS 订阅支持并不能使慢速的交易所引擎明显加快。

如果您想在二阶数据延迟方面保持领先，您将不得不在自己这边计算，并在速度上超越交易所引擎。根据您的应用程序需求，这可能颇具挑战性，因为您需要处理冗余、历史中的"数据空洞"、交易所停机以及数据聚合的其他方面——这本身就是一个无法在本手册中完全涵盖的完整领域。


### 从成交记录构建 OHLCV 蜡烛

如上段所述，用户可以使用 `buildOHLCV / build_ohlcv` 方法手动构建蜡烛。您可以在[示例文件夹](https://github.com/ccxt/ccxt/tree/master/examples)中查看名为 "build-ohlcv-bars" 的示例文件。
注意事项：
- 此方法要求提供的成交记录按时间顺序排序（最新的成交记录排在数组的最后）
- 由于成交记录条目中可能存在一些错误（来自 `watch_ohlcv` 或其他来源），在 `build_ohlcv` 方法内部我们会跳过价格为 `0` 的成交记录，以避免蜡烛值失真。但是，如果您不想跳过此类成交条目，请设置选项：

```
exchange.options['buildOHLCV'] = {
    'skipZeroPrices': false
};
```

### OHLCV 结构

上面展示的 fetchOHLCV 方法返回一个由以下结构表示的 OHLCV 蜡烛图列表（扁平数组）：

```javascript
[
    [
        1504541580000, // UTC timestamp in milliseconds, integer
        4235.4,        // (O)pen price, float
        4240.6,        // (H)ighest price, float
        4230.0,        // (L)owest price, float
        4230.7,        // (C)losing price, float
        37.72941911    // (V)olume float (usually in terms of the base currency, the exchanges docstring may list whether quote or base units are used)
    ],
    ...
]
```

蜡烛图列表按升序（历史/时间顺序）排序返回，最旧的蜡烛图在前，最新的蜡烛图在后。

### 标记价、指数价和溢价指数蜡烛图

要获取历史标记价、指数价和溢价指数蜡烛图，请将 `'price'` [参数覆盖](#overriding-unified-api-params)传递给 `fetchOHLCV`。`'price'` 参数接受以下值之一：

- `'mark'`
- `'index'`
- `'premiumIndex'`

```javascript
// JavaScript
async function main () {
    const exchange = new ccxt.binanceusdm ()
    const markKlines = await exchange.fetchOHLCV ('ADA/USDT', '1h', undefined, undefined, { 'price': 'mark' })
    console.log (markKlines)
    const indexKlines = await exchange.fetchOHLCV ('ADA/USDT', '1h', undefined, undefined, { 'price': 'index' })
    console.log (indexKlines)
}

main ()
```

还有便捷方法 `fetchMarkOHLCV`、`fetchIndexOHLCV` 和 `fetchPremiumIndexOHLCV`


```javascript tab="JavaScript"
async function main () {
    const exchange = new ccxt.binanceusdm ()
    const markKlines = await exchange.fetchMarkOHLCV ('ADA/USDT', '1h')
    console.log (markKlines)
    const indexKlines = await exchange.fetchIndexOHLCV ('ADA/USDT', '1h')
    console.log (indexKlines)
}

main ()
```
```python tab="Python"
exchange = ccxt.binance()
response = exchange.fetch_ohlcv('ADA/USDT', '1h', params={'price':'index'})
pprint(response)
# Convenience methods
mark_klines = exchange.fetch_mark_ohlcv('ADA/USDT', '1h')
index_klines = exchange.fetch_index_ohlcv('ADA/USDT', '1h')
pprint(mark_klines)
pprint(index_klines)
```
```php tab="PHP"
$exchange = new \ccxt\binanceusdm();
// Convenience methods
$mark_klines = $exchange->fetch_mark_ohlcv('ADA/USDT', '1h');
$index_klines = $exchange->fetch_index_ohlcv('ADA/USDT', '1h');
var_dump($mark_klines);
var_dump($index_klines);
```
```go tab="Go"
exchange := ccxt.NewBinanceusdm(nil)
// Convenience methods
markKlines, err := exchange.FetchMarkOHLCV("ADA/USDT", ccxt.WithFetchMarkOHLCVTimeframe("1h"))
if err != nil {
    fmt.Println(err)
    return
}
indexKlines, _ := exchange.FetchIndexOHLCV("ADA/USDT", ccxt.WithFetchIndexOHLCVTimeframe("1h"))
fmt.Println(markKlines, indexKlines)
```
```csharp tab="C#"
var exchange = new Binanceusdm();
// Convenience methods
var markKlines = await exchange.FetchMarkOHLCV("ADA/USDT", "1h");
var indexKlines = await exchange.FetchIndexOHLCV("ADA/USDT", "1h");
Console.WriteLine(markKlines.Count + " " + indexKlines.Count);
```
```java tab="Java"
List<OHLCV> markKlines = exchange.fetchOHLCV("ADA/USDT", "1h", null, null, Map.of("price", "mark"));
```


## 公开交易

```diff
- this is under heavy development right now, contributions appreciated
```

您可以调用统一的 `fetchTrades` / `fetch_trades` 方法来获取特定交易对最近的交易列表。`fetchTrades` 方法的声明方式如下：

```javascript
async fetchTrades (symbol, since = undefined, limit = undefined, params = {})
```

例如，如果您想按顺序逐一打印所有交易对的最近交易（注意频率限制！），可以这样做：


```javascript tab="TypeScript"
if (exchange.has['fetchTrades']) {
    let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
    for (symbol in exchange.markets) {
        console.log (await exchange.fetchTrades (symbol))
    }
}
```
```python tab="Python"
import time
if exchange.has['fetchTrades']:
    for symbol in exchange.markets:  # ensure you have called loadMarkets() or load_markets() method.
        print (symbol, exchange.fetch_trades (symbol))
```
```php tab="PHP"
if ($exchange->has['fetchTrades']) {
    foreach ($exchange->markets as $symbol => $market) {
        var_dump ($exchange->fetch_trades ($symbol));
    }
}
```
```go tab="Go"
trades, err := exchange.FetchTrades("BTC/USDT", ccxt.WithFetchTradesLimit(20))
if err != nil {
    fmt.Println(err)
    return
}
for _, t := range trades {
    fmt.Println(t.Datetime, t.Side, t.Amount, "@", t.Price)
}
```
```csharp tab="C#"
var trades = await exchange.FetchTrades("BTC/USDT", null, 20);
foreach (var t in trades)
{
    Console.WriteLine(t.datetime + " " + t.side + " " + t.amount + " @ " + t.price);
}
```
```java tab="Java"
List<Trade> trades = exchange.fetchTrades("BTC/USDT", null, 20L, null);
for (Trade t : trades) {
    System.out.println(t.datetime + " " + t.side + " " + t.amount + " @ " + t.price);
}
```


上面展示的 fetchTrades 方法返回一个有序的交易列表（扁平数组，按时间戳升序排序，最旧的交易在前，最新的交易在后）。交易列表由[交易结构](#trade-structure)表示。

```javascript
[
    {
        'info':          { ... },                  // the original decoded JSON as is
        'id':           '12345-67890:09876/54321', // string trade id
        'timestamp':     1502962946216,            // Unix timestamp in milliseconds
        'datetime':     '2017-08-17 12:42:48.000', // ISO8601 datetime with milliseconds
        'symbol':       'ETH/BTC',                 // symbol
        'order':        '12345-67890:09876/54321', // string order id or undefined/None/null
        'type':         'limit',                   // order type, 'market', 'limit' or undefined/None/null
        'side':         'buy',                     // direction of the trade, 'buy' or 'sell'
        'takerOrMaker': 'taker',                   // string, 'taker' or 'maker'
        'price':         0.06917684,               // float price in quote currency
        'amount':        1.5,                      // amount of base currency
        'cost':          0.10376526,               // total cost, `price * amount`,
        'fee':           {                         // if provided by exchange or calculated by ccxt
            'cost':  0.0015,                       // float
            'currency': 'ETH',                     // usually base currency for buys, quote currency for sells
            'rate': 0.002,                         // the fee rate (if available)
        },
        'fees': [                                  // an array of fees if paid in multiple currencies
            {                                      // if provided by exchange or calculated by ccxt
                'cost':  0.0015,                   // float
                'currency': 'ETH',                 // usually base currency for buys, quote currency for sells
                'rate': 0.002,                     // the fee rate (if available)
            },
        ]
    },
    ...
]
```

大多数交易所会为每笔交易返回上述大部分字段，但有些交易所不返回交易类型、方向、交易 ID 或订单 ID。大多数情况下，您可以保证获得每笔交易的时间戳、日期时间、交易对、价格和数量。

第二个可选参数 `since` 按时间戳筛选数组，第三个 `limit` 参数按返回项的数量（计数）筛选。

如果用户未指定 `since`，`fetchTrades` 方法将返回交易所默认范围内的公开交易。默认集合因交易所而异，有些交易所将返回从该交易对上市之日起的交易，其他交易所将返回一组较少的交易（例如最近 24 小时、最近 100 笔交易等）。如果用户需要精确控制时间范围，用户有责任指定 `since` 参数。

大多数统一方法将返回单个对象或对象的普通数组（列表）（交易）。然而，几乎没有交易所（如果有的话）会一次性返回所有交易。大多数情况下，其 API 将输出限制为一定数量的最近对象。**您无法在一次调用中获取从创世至今的所有对象**。实际上，很少有交易所会容忍或允许这种情况。

要获取历史交易，用户需要分批或按"页"遍历数据。分页通常意味着在循环中*"逐一获取部分数据"*。

在大多数情况下，用户**需要使用至少某种类型的分页**才能一致地获得预期结果。

另一方面，**某些交易所根本不支持公开交易的分页**。通常，交易所只提供最新的交易。

`fetchTrades ()` / `fetch_trades()` 方法还接受可选的 `params`（关联键数组/字典，默认为空）作为其第四个参数。您可以使用它将额外参数传递给方法调用，或覆盖特定的默认值（在交易所支持的情况下）。有关详细信息，请参阅您的交易所的 API 文档。

## 交易所时间

`fetchTime()` 方法（如果可用）从交易所服务器返回当前整数时间戳（毫秒）。

```javascript
fetchTime(params = {})
```

## 交易所状态

交易所状态描述了关于交易所 API 可用性的最新已知信息。此信息要么硬编码到交易所类中，要么直接从交易所 API 实时获取。可以使用 `fetchStatus(params = {})` 方法获取此信息。`fetchStatus` 返回的状态为以下之一：

- 硬编码到交易所类中，例如 API 已损坏或关闭的情况。
- 通过交易所 ping 或 `fetchTime` 端点更新，以查看其是否存活
- 通过专用的交易所 API 状态端点更新。

```javascript
fetchStatus(params = {})
```

### 交易所状态结构

`fetchStatus()` 方法将返回如下所示的状态结构：

```javascript
{
    'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
    'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
    'eta': undefined, // when the maintenance or outage is expected to end
    'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
}
```

`status` 字段中可能的值为：

- `'ok'` 表示交易所 API 完全正常运行
- `'shutdown'` 表示交易所已关闭，`updated` 字段应包含关闭的日期时间
- `'error'` 表示交易所 API 已损坏，或 CCXT 中该交易所的实现已损坏
- `'maintenance'` 表示定期维护，`eta` 字段应包含预计交易所恢复运行的日期时间

## 借款利率

*仅限杠杆交易*

在现货市场进行做空或杠杆交易时，必须借入货币。借入的货币会产生利息。

可以使用以下方法检索货币的借款利率数据：

- `fetchCrossBorrowRate ()` 用于单一货币的借款利率
- `fetchCrossBorrowRates ()` 用于所有货币的借款利率
- `fetchIsolatedBorrowRate ()` 用于交易对的借款利率
- `fetchIsolatedBorrowRates ()` 用于所有交易对的借款利率
- `fetchBorrowRatesPerSymbol ()` 用于各个市场中货币的借款利率

```javascript
fetchCrossBorrowRate (code, params = {})
```

参数

- **code**（String）统一 CCXT 货币代码，必填（例如 `"USDT"`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"settle": "USDT"}`）

返回

- 一个[借款利率结构](#borrow-rate-structure)

```javascript
fetchCrossBorrowRates (params = {})
```

参数

- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"startTime": 1610248118000}`）

返回

- 以统一货币代码为键的[借款利率结构](#borrow-rate-structure)字典

```javascript
fetchIsolatedBorrowRate (symbol, params = {})
```

参数

- **symbol**（String）统一 CCXT 市场交易对，必填（例如 `"BTC/USDT"`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"settle": "USDT"}`）

返回

- 一个[逐仓借款利率结构](#isolated-borrow-rate-structure)

```javascript
fetchIsolatedBorrowRates (params = {})
```

参数

- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"startTime": 1610248118000}`）

返回

- 以统一市场交易对为键的[逐仓借款利率结构](#isolated-borrow-rate-structure)字典

### 逐仓借款利率结构

```javascript
{
  symbol: 'BTC/USDT',  // Unified market symbol
  base: 'BTC',  // Unified currency code of the base currency
  baseRate: 0.00025,  // A decimal value rate that interest is accrued at
  quote: 'USDT',  // Unified currency code of the quote currency
  quoteRate: 0.00025,  // A decimal value rate that interest is accrued at
  period: 86400000,  // The amount of time in milliseconds that is required to accrue the interest amount specified by rate
  timestamp: 1646956800000,  // Timestamp for when the currency had this rate
  datetime: '2022-03-11T00:00:00.000Z',  // Datetime for when the currency had this rate
  info: [ ... ]
}
```

### 借款利率结构

```javascript
{
  currency: 'USDT',  // Unified currency code
  rate: 0.0006,  // A ratio of the rate that interest is accrued at
  period: 86400000,  // The amount of time in milliseconds that is required to accrue the interest amount specified by rate
  timestamp: 1646956800000,  // Timestamp for when the currency had this rate
  datetime: '2022-03-11T00:00:00.000Z',  // Datetime for when the currency had this rate
  info: [ ... ]
}
```

## 借款利率历史

*仅限杠杆交易*

`fetchBorrowRateHistory` 方法检索货币在特定时间槽的借款利率历史记录

```javascript
fetchBorrowRateHistory (code, since = undefined, limit = undefined, params = {})
```

参数

- **code**（String）*必填* 统一 CCXT 货币代码（例如 `"USDT"`）
- **since**（Integer）最早借款利率的时间戳（例如 `1645807945000`）
- **limit**（Integer）要检索的[借款利率结构](#borrow-rate-structure)最大数量（例如 `10`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个[借款利率结构](#borrow-rate-structure)数组

## 杠杆梯度

*仅限合约*

- 杠杆梯度方法在 **binance** 上是私有的

`fetchLeverageTiers()` 方法可用于获取不同持仓规模下市场的最大杠杆倍数。当市场对象中没有相关信息时，还可以用于获取维持保证金率和市场最大可交易数量。

虽然可以通过访问 `market['limits']['leverage']['max']` 获取市场的绝对最大杠杆倍数，但对于许多合约市场，最大杠杆倍数将取决于您的持仓规模。

您可以通过以下方式访问这些限制：

- `fetchMarketLeverageTiers()`（单个交易对）
- `fetchLeverageTiers([symbol1, symbol2, ...])`（多个交易对）
- `fetchLeverageTiers()`（所有市场交易对）

```javascript
fetchMarketLeverageTiers(symbol, params = {})
```

参数

- **symbol**（String）*必填* 统一 CCXT 交易对（例如 `"BTC/USDT:USDT"`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"settle": "usdt"}`）

返回

- 一个[杠杆梯度结构](#leverage-tiers-structure)

```javascript
fetchLeverageTiers(symbols = undefined, params = {})
```

参数

- **symbols**（\[String\]）统一 CCXT 交易对（例如 `"BTC/USDT:USDT"`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"settle": "usdt"}`）

返回

- 一个[杠杆梯度结构](#leverage-tiers-structure)数组

### 杠杆梯度结构

```javascript
[
    {
        "tier": 1,                       // tier index
        "symbol": "BTC/USDT",            // the market symbol that the leverage tier applies to
        "currency": "USDT",              // the currency that minNotional and maxNotional are in
        "minNotional": 0,                // the lowest amount of this tier // stake = 0.0
        "maxNotional": 10000,            // the highest amount of this tier // max stake amount at 75x leverage = 133.33333333333334
        "maintenanceMarginRate": 0.0065, // maintenance margin rate
        "maxLeverage": 75,               // max available leverage for this market when the value of the trade is > minNotional and < maxNotional
        "info": { ... }                  // Response from exchange
    },
    {
        "tier": 2,
        "symbol": "BTC/USDT",
        "currency": "USDT",
        "minNotional": 10000,            // min stake amount at 50x leverage = 200.0
        "maxNotional": 50000,            // max stake amount at 50x leverage = 1000.0
        "maintenanceMarginRate": 0.01,
        "maxLeverage": 50,
        "info": { ... },
    },
    ...
    {
        "tier": 9,
        "symbol": "BTC/USDT",
        "currency": "USDT",
        "minNotional": 20000000,
        "maxNotional": 50000000,
        "maintenanceMarginRate": 0.5,
        "maxLeverage": 1,
        "info": { ... },
    },
]
```

在上面的示例中：

- 持仓低于 133.33       = 最大杠杆为 75
- 持仓从 200 到 1000    = 最大杠杆为 50
- 持仓金额为 150         = 最大杠杆为 (10000 / 150)   = 66.66
- 持仓在 133.33-200 之间 = 最大杠杆为 (10000 / stake) = 50.01 -> 74.99

**火币用户注意：** 火币同时使用杠杆和数量来确定维持保证金率：https://www.huobi.com/support/en-us/detail/900000089903

## 资金费率

*仅限合约*

可以使用以下方法获取当前、最近和下一个资金费率的数据：

- `fetchFundingRates ()` 用于所有市场交易对
- `fetchFundingRates ([ symbol1, symbol2, ... ])` 用于多个市场交易对
- `fetchFundingRate (symbol)` 用于单个市场交易对

```javascript
fetchFundingRate (symbol, params = {})
```

参数

- **symbol**（String）*必填* 统一 CCXT 交易对（例如 `"BTC/USDT:USDT"`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个[资金费率结构](#funding-rate-structure)

```javascript
fetchFundingRates (symbols = undefined, params = {})
```

参数

- **symbols**（\[String\]）可选的统一 CCXT 交易对数组/列表（例如 `["BTC/USDT:USDT", "ETH/USDT:USDT"]`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回

- 以市场交易对为索引的[资金费率结构](#funding-rate-structure)数组

## 资金费率间隔

*仅限合约*

使用以下方法检索当前资金费率间隔：

- `fetchFundingInterval (symbol)` 用于单个市场交易对
- `fetchFundingIntervals ()` 用于所有市场交易对
- `fetchFundingIntervals ([ symbol1, symbol2, ... ])` 用于多个市场交易对

```javascript
fetchFundingInterval (symbol, params = {})
```

参数

- **symbol**（String）*必填* 统一 CCXT 交易对（例如 `"BTC/USDT:USDT"`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个[资金费率结构](#funding-rate-structure)

```javascript
fetchFundingIntervals (symbols = undefined, params = {})
```

参数

- **symbols**（\[String\]）可选的统一 CCXT 交易对数组/列表（例如 `["BTC/USDT:USDT", "ETH/USDT:USDT"]`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个[资金费率结构](#funding-rate-structure)数组

### 资金费率结构

```javascript
{
    info: { ... },
    symbol: 'BTC/USDT:USDT',
    markPrice: 39294.43,
    indexPrice: 39291.78,
    interestRate: 0.0003,
    estimatedSettlePrice: undefined,
    timestamp: undefined,
    datetime: undefined,
    fundingRate: 0.000072,
    fundingTimestamp: 1645833600000,
    fundingDatetime: '2022-02-26T00:00:00.000Z',
    nextFundingRate: -0.000018, // nextFundingRate is actually two funding rates from now
    nextFundingTimestamp: undefined,
    nextFundingDatetime: undefined,
    previousFundingRate: undefined,
    previousFundingTimestamp: undefined,
    previousFundingDatetime: undefined,
    interval: '8h',
}
```

## 资金费率历史

*仅限合约*

```javascript
fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **symbol**（String）统一 CCXT 交易对（例如 `"BTC/USDT:USDT"`）
- **since**（Integer）最早资金费率的时间戳（例如 `1645807945000`）
- **limit**（Integer）要检索的资金费率最大数量（例如 `10`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[资金费率历史结构](#funding-rate-history-structure)数组

### 资金费率历史结构

```javascript
{
    info: { ... },
    symbol: "BTC/USDT:USDT",
    fundingRate: -0.000068,
    timestamp: 1642953600000,
    datetime: "2022-01-23T16:00:00.000Z"
}
```

## 未平仓合约

*仅限合约*

使用 `fetchOpenInterest` 方法从交易所获取某一交易对当前的未平仓合约数量。使用 `fetchOpenInterests` 获取多个交易对的当前未平仓合约数量

```javascript
fetchOpenInterest (symbol, params = {})
```

参数

- **symbol**（String）统一的 CCXT 市场交易对符号（例如 `"BTC/USDT:USDT"`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[未平仓合约结构](#open-interest-structure)

```js
fetchOpenInterests (symbols = undefined, params = {})
```

- **symbols**（[String]）可选的统一 CCXT 交易对符号数组/列表（例如 `["BTC/USDT:USDT", "ETH/USDT:USDT"]`）。留空（`undefined`）表示获取所有交易对。
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[未平仓合约结构](#open-interest-structure)的字典

### 未平仓合约历史

*仅限合约*

使用 `fetchOpenInterestHistory` 方法从交易所获取某一交易对的未平仓合约历史记录。

```javascript
fetchOpenInterestHistory (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {})
```

参数

- **symbol**（String）统一的 CCXT 市场交易对符号（例如 `"BTC/USDT:USDT"`）
- **timeframe**（String）通过 exchange.timeframes 查看可用值
- **since**（Integer）最早未平仓合约记录的时间戳（例如 `1645807945000`）
- **limit**（Integer）要获取的[未平仓合约结构](#open-interest-structures)的最大数量（例如 `10`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"endTime": 1645807945000}`）

**OKX 用户注意：** okx.fetchOpenInterestHistory 的 **symbol** 参数需传入统一的货币代码（例如 `'BTC'`），而非统一的交易对符号。

返回值

- 一个[未平仓合约结构](#open-interest-structure)数组

### 未平仓合约结构

```javascript
{
    symbol: 'BTC/USDT',
    baseVolume: 80872.801, // deprecated
    quoteVolume: 3508262107.38, // deprecated
    openInterestAmount: 80872.801,
    openInterestValue: 3508262107.38,
    timestamp: 1649379000000,
    datetime: '2022-04-08T00:50:00.000Z',
    info: {
        symbol: 'BTCUSDT',
        sumOpenInterest: '80872.80100000',
        sumOpenInterestValue: '3508262107.38000000',
        timestamp: '1649379000000'
    }
}
```

## 历史波动率

*仅限期权*

使用 `fetchVolatilityHistory` 方法从交易所获取期权标的资产代码的波动率历史记录。

```javascript
fetchVolatilityHistory (code, params = {})
```

参数

- **code**（String）*必填* 统一的 CCXT 货币代码（例如 `"BTC"`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[波动率历史结构](#volatility-structure)数组

### 波动率结构

```javascript
{
    info: {
        "period": 7,
        "value": "0.23854072",
        "time": "1690574400000"
    }
    timestamp: 1649379000000,
    datetime: '2023-07-28T00:50:00.000Z',
    volatility: 0.23854072,
}
```

## 标的资产

*仅限合约*

使用 `fetchUnderlyingAssets` 方法从交易所获取某一合约市场类型的标的资产市场 ID。

```javascript
fetchUnderlyingAssets (params = {})
```

参数

- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"instType": "OPTION"}`）
- **params.type**（String）统一的 marketType，默认为 'option'（例如 `"option"`）

返回值

- 一个[标的资产结构](#underlying-assets-structure)

### 标的资产结构

```javascript
[ 'BTC_USDT', 'ETH_USDT', 'DOGE_USDT' ]
```

## 结算历史

*仅限合约*

使用 `fetchSettlementHistory` 方法从交易所获取合约市场的公开结算历史记录。使用 `fetchMySettlementHistory` 仅获取您的结算历史记录

```javascript
fetchMySettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchSettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **symbol**（String）统一的 CCXT 交易对符号（例如 `"BTC/USDT:USDT-230728-25500-P"`）
- **since**（Integer）最早结算记录的时间戳（例如 `1694073600000`）
- **limit**（Integer）要获取的最大结算数量（例如 `10`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[结算历史结构](#settlement-history-structure)数组

### 结算历史结构

```javascript
{
    info: { ... },
    symbol: 'BTC/USDT:USDT-230728-25500-P',
    price: 25761.35807869,
    timestamp: 1694073600000,
    datetime: '2023-09-07T08:00:00.000Z',
}
```

## 强制平仓

*仅限保证金和合约*

使用 `fetchLiquidations` 方法从交易所获取某一交易对的公开强制平仓记录。使用 `fetchMyLiquidations` 仅获取您的强制平仓历史记录

```javascript
fetchMyLiquidations (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchLiquidations (symbol, since = undefined, limit = undefined, params = {})
```

参数

- **symbol**（String）统一的 CCXT 交易对符号（例如 `"BTC/USDT:USDT-231006-25000-P"`）
- **since**（Integer）最早强制平仓记录的时间戳（例如 `1694073600000`）
- **limit**（Integer）要获取的最大强制平仓数量（例如 `10`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"until": 1645807945000}`）

返回值

- 一个[强制平仓结构](#liquidation-structure)数组

### 强制平仓结构

```javascript
[
    {
        'info':          { ... },                        // the original decoded JSON as is
        'symbol':        'BTC/USDT:USDT-231006-25000-P', // unified CCXT market symbol
        'contracts':     2,                              // the number of derivative contracts
        'contractSize':  0.001,                          // the contract size for the trading pair
        'price':         27038.64,                       // the average liquidation price in the quote currency
        'baseValue':     0.002,                          // value in the base currency (contracts * contractSize)
        'quoteValue':    54.07728,                       // value in the quote currency ((contracts * contractSize) * price)
        'timestamp':     1696996782210,                  // Unix timestamp in milliseconds
        'datetime':      '2023-10-11 03:59:42.000',      // ISO8601 datetime with milliseconds
    },
    ...
]
```

## 希腊字母

*仅限期权*

使用 `fetchGreeks` 方法从交易所获取某一期权交易对的公开希腊字母值及隐含波动率。使用 `fetchAllGreeks` 获取所有交易对或多个交易对的希腊字母值。
希腊字母衡量标的资产价格、到期时间、波动率和利率等因素对期权合约价格的影响。

```javascript
fetchGreeks (symbol, params = {})
```

参数

- **symbol**（String）统一的 CCXT 交易对符号（例如 `"BTC/USD:BTC-240927-40000-C"`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"category": "options"}`）

返回值

- 一个[希腊字母结构](#greeks-structure)

```javascript
fetchAllGreeks (symbols = undefined, params = {})
```

参数

- **symbols**（String）统一的 CCXT 交易对符号（例如 `"BTC/USD:BTC-240927-40000-C"`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"category": "options"}`）

// for example
fetchAllGreeks () // all symbols
fetchAllGreeks ([ 'BTC/USD:BTC-240927-40000-C', 'ETH/USD:ETH-240927-4000-C' ]) // an array of specific symbols

返回值

- 一个[希腊字母结构](#greeks-structure)列表

### 希腊字母结构

```javascript
{
    'symbol': 'BTC/USD:BTC-240927-40000-C',     // unified CCXT market symbol
    'timestamp': 1699593511632,                 // unix timestamp in milliseconds
    'datetime': '2023-11-10T05:18:31.632Z',     // ISO8601 datetime with milliseconds
    'delta': 0.59833,                           // measures the rate of change in the options price per $1 change in the underlying assets price
    'gamma': 0.00002,                           // measures the rate of change in the delta per $1 change in the underlying assets price
    'theta': -13.4441,                          // measures the dollar amount that an options price will decline per day
    'vega': 142.30124,                          // measures the dollar amount that an options price changes with a 1% change in the implied volatility
    'rho': 131.82621,                           // measures the dollar amount that an options price changes with a 1% change in interest rates
    'vanna': 0.06671,                           // measures the amount that an options delta changes with a 1% change in implied volatility
    'volga': 925.95015,                         // measures the amount that an options vega changes with a 1% change in implied volatility
    'charm': 0.18433,                           // measures the amount that an options delta changes each day until expiration
    'bidSize': 2.2,                             // the options bid amount
    'askSize': 9,                               // the options ask amount
    'bidImpliedVolatility': 60.06,              // the expected percentage price change of the underlying asset, over the remaining life of the option, calculated using the bid price
    'askImpliedVolatility': 61.85,              // the expected percentage price change of the underlying asset, over the remaining life of the option, calculated using the ask price
    'markImpliedVolatility': 60.86,             // the expected percentage price change of the underlying asset, over the remaining life of the option, calculated using the mark price
    'bidPrice': 0.214,                          // the bid price of the option
    'askPrice': 0.2205,                         // the ask price of the option
    'markPrice': 0.2169,                        // the mark price of the option
    'lastPrice': 0.215,                         // the last price of the option
    'underlyingPrice': 39165.86,                // the current market price of the underlying asset
    'info': { ... },                            // the original decoded JSON as is
}
```

## 期权链

*仅限期权*

使用 `fetchOption` 方法从交易所获取单个期权合约的公开详情。

```javascript
fetchOption (symbol, params = {})
```

参数

- **symbol**（String）统一的 CCXT 市场交易对符号（例如 `"BTC/USD:BTC-240927-40000-C"`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"category": "options"}`）

返回值

- 一个[期权链结构](#option-chain-structure)

使用 `fetchOptionChain` 方法从交易所获取某一标的货币的公开期权链数据。

```javascript
fetchOptionChain (code, params = {})
```

参数

- **code**（String）统一的 CCXT 货币代码（例如 `"BTC"`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"category": "options"}`）

返回值

- 一个[期权链结构](#option-chain-structure)列表

### 期权链结构

```javascript
{
    'info': { ... },                            // the original decoded JSON as is
    'currency': 'BTC',                          // unified CCXT currency code
    'symbol': 'BTC/USD:BTC-240927-40000-C',     // unified CCXT market symbol
    'timestamp': 1699593511632,                 // unix timestamp in milliseconds
    'datetime': '2023-11-10T05:18:31.632Z',     // ISO8601 datetime with milliseconds
    'impliedVolatility': 60.06,                 // the expected percentage price change of the underlying asset, over the remaining life of the option
    'openInterest': 10,                         // the number of open options contracts that have not been settled
    'bidPrice': 0.214,                          // the bid price of the option
    'askPrice': 0.2205,                         // the ask price of the option
    'midPrice': 0.2205,                         // the price in between the bid and the ask
    'markPrice': 0.2169,                        // the mark price of the option
    'lastPrice': 0.215,                         // the last price of the option
    'underlyingPrice': 39165.86,                // the current market price of the underlying asset
    'change': 15.43,                            // the 24 hour price change in a dollar amount
    'percentage': 11.86,                        // the 24 hour price change as a percentage
    'baseVolume': 100.86,                       // the volume in units of the base currency
    'quoteVolume': 23772.86,                    // the volume in units of the quote currency
}
```

## 多空比

*仅限合约*

使用 `fetchLongShortRatio` 方法获取某一交易对当前的多空比，使用 `fetchLongShortRatioHistory` 获取某一交易对的多空比历史记录。

- `fetchLongShortRatio (symbol, period)` 获取单个市场交易对的当前多空比
- `fetchLongShortRatioHistory (symbol, period, since, limit)` 获取单个市场交易对的多空比历史记录

```javascript
fetchLongShortRatio (symbol, period = undefined, params = {})
```

参数

- **symbol**（String）*必填* 统一的 CCXT 交易对符号（例如 `"BTC/USDT:USDT"`）
- **period**（String）计算多空比的时间周期（例如 `"24h"`）
- **params**（Dictionary）特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[多空比结构](#long-short-ratio-structure)

```javascript
fetchLongShortRatioHistory (symbol = undefined, period = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **symbol**（String）统一的 CCXT 交易对符号（例如 `"BTC/USDT:USDT"`）
- **period**（String）计算多空比的时间周期（例如 `"24h"`）
- **since**（Integer）最早多空比记录的时间戳（例如 `1645807945000`）
- **limit**（Integer）要获取的最大多空比数量（例如 `10`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[多空比结构](#long-short-ratio-structure)数组

### 多空比结构

```javascript
{
    info: { ... },
    symbol: 'BTC/USDT:USDT',
    timestamp: 1645833600000,
    datetime: '2022-02-26T00:00:00.000Z',
    timeframe: '24h',
    longShortRatio: 0.000072,
}
```

## 自动减仓

*仅限合约*

使用 `fetchADLRank` 方法从交易所获取某一交易对的自动减仓排名公开详情。

```javascript
fetchADLRank (symbol, params = {})
```

参数

- **symbol**（String）统一的 CCXT 市场交易对符号（例如 `"BTC/USDT:USDT"`）
- **params**（Dictionary）特定于交易所 API 端点的额外参数（例如 `{"category": "futures"}`）

返回值

- 一个[自动减仓结构](#auto-de-leverage)

### 自动减仓结构

```javascript
{
    'info': { ... },                            // the original decoded JSON as is
    'symbol': 'BTC/USDT:USDT',                  // unified CCXT market symbol
    'rank': 5,                                  // a quantile rank from 1 to 5 with 5 being the highest risk
    'rating': 'high',                           // a string risk rating as either low, medium or high
    'percent': 72.86,                           // the risk percentage with a higher percentage being a higher risk of auto de leverage
    'timestamp': 1699593511632,                 // unix timestamp in milliseconds
    'datetime': '2023-11-10T05:18:31.632Z',     // ISO8601 datetime with milliseconds
}
```

# 私有 API

- [身份验证](#authentication)
- [登录](#sign-in)
- [API 密钥设置](#api-keys-setup)
- [账户](#accounts)
- [账户余额](#account-balance)
- [订单](#orders)
- [我的成交记录](#my-trades)
- [账本](#ledger)
- [充值](#deposit)
- [提现](#withdrawal)
- [充值地址](#deposit-addresses)
- [划转](#transfers)
- [手续费](#fees)
- [借款利息](#borrow-interest)
- [借款与还款保证金](#borrow-and-repay-margin)
- [保证金](#margin)
- [保证金模式](#margin-mode)
- [杠杆](#leverage)
- [持仓](#positions)
- [资金历史](#funding-history)
- [兑换](#conversion)
- [自动减仓](#auto-de-leverage)

为了能够访问您的用户账户、通过下达市价单和限价单进行算法交易、查询余额、充值和提现资金等，您需要从每个要交易的交易所获取用于身份验证的 API 密钥。通常可以在用户账户设置的单独标签页或页面上找到。API 密钥是特定于交易所的，在任何情况下都不能互换使用。

交易所的私有 API 通常允许以下几类交互：

- 可以使用 `fetchBalance()` 方法获取用户账户余额的当前状态，详见[账户余额](#account-balance)部分
- 用户可以使用 `createOrder()`、`cancelOrder()` 下单和撤单，以及使用 `fetchOrder`、`fetchOrders()`、`fetchOpenOrder()`、`fetchOpenOrders()`、`fetchCanceledOrders`、`fetchClosedOrder`、`fetchClosedOrders` 等方法获取当前挂单和历史订单，详见[订单](#orders)部分
- 用户可以使用 `fetchMyTrades` 查询账户的历史成交记录，详见[我的成交记录](#my-trades)部分，另见[订单与成交的关联关系](#how-orders-are-related-to-trades)
- 用户可以使用 `fetchPositions()` 和 `fetchPosition()` 查询持仓，详见[持仓](#positions)部分
- 用户可以使用 `fetchTransactions()` 获取交易历史（链上*交易*，即向交易所账户*充值*或从交易所账户*提现*），或根据交易所 API 提供的功能分别使用 `fetchDeposit()`、`fetchDeposits()`、`fetchWithdrawal()` 和 `fetchWithdrawals()`
- 如果交易所 API 提供账本端点，用户可以使用 `fetchLedger` 获取所有影响余额的资金流动历史，该方法将返回所有会计账本条目，如成交、充值、提现、账户内部划转、返佣、奖励、手续费、质押收益等，详见[账本](#ledger)部分。

## 身份验证

如果提供了正确的 API 密钥，所有交易所的身份验证均会自动处理。身份验证过程通常遵循以下模式：

1. 生成新的 nonce。Nonce 是一个整数，通常是以秒或毫秒为单位的 Unix 时间戳（自 1970 年 1 月 1 日纪元起）。Nonce 对特定请求应是唯一的且持续递增，因此没有两个请求共享相同的 nonce。每个后续请求的 nonce 应大于前一个请求。**默认 nonce 是以秒为单位的 32 位 Unix 时间戳。**
2. 将公开的 apiKey 和 nonce 附加到其他端点参数（如有）中，然后将整体序列化以供签名使用。
3. 使用您的密钥通过 HMAC-SHA256/384/512 或 MD5 对序列化参数进行签名。
4. 将十六进制或 Base64 格式的签名及 nonce 附加到 HTTP 头或请求体中。

各交易所的具体流程可能有所不同。某些交易所可能要求使用不同编码格式的签名，某些交易所在头部和请求体的参数名称及格式上有所差异，但所有交易所的通用模式是相同的。

**您不应在同时运行的多个交易所实例、独立脚本或多线程中共享同一 API 密钥对。从不同实例同时使用同一密钥对可能会导致各种意外行为。**

**请勿在不同软件中重复使用 API 密钥！其他软件会将您的 nonce 调得过高。如果您遇到 [InvalidNonce](#invalid-nonce) 错误——请首先确保生成一个全新的密钥对。**

身份验证已为您自动处理，因此除非您正在实现新的交易所类，否则无需手动执行上述任何步骤。您进行交易所需的唯一内容就是实际的 API 密钥对。

### API 密钥设置

#### 所需凭证

API 凭证通常包含以下内容：

- `apiKey`。这是您的公开 API 密钥和/或令牌。此部分是*非保密*的，它包含在您的请求头或请求体中，并通过 HTTPS 以明文方式发送以标识您的请求。它通常是十六进制或 Base64 编码的字符串，或 UUID 标识符。
- `secret`。这是您的私钥。请保密，不要告诉任何人。它用于在将请求发送到交易所之前在本地对请求进行签名。密钥在请求-响应过程中不会通过互联网发送，也不应被发布或通过电子邮件发送。它与 nonce 一起用于生成强加密签名。该签名与您的公钥一起发送，以验证您的身份。每个请求都有唯一的 nonce，因此也有唯一的加密签名。
- `uid`。某些交易所（并非全部）还会为用户生成用户 ID 或简称 *uid*。它可以是字符串或数字字面量。如果您的交易所明确要求，您应该设置它。详情请参阅[其文档](#exchanges)。
- `password`。某些交易所（并非全部）还要求您的交易密码/短语。如果您的交易所明确要求，您应该设置此字符串。详情请参阅[其文档](#exchanges)。

要创建 API 密钥，请在交易所网站的用户设置中找到 API 标签或按钮。然后创建您的密钥并将其复制粘贴到您的配置文件中。您的配置文件权限应设置为适当，除所有者外其他人无法读取。

**请记住保护您的 apiKey 和密钥免遭未授权使用，不要发送或告知任何人。密钥泄露或安全漏洞可能导致资金损失。**

#### 凭证验证

为检查用户是否提供了所有必需的凭证，`Exchange` 基类有一个名为 `exchange.checkRequiredCredentials()` 或 `exchange.check_required_credentials()` 的方法。如果某些凭证缺失或为空，调用该方法将抛出 `AuthenticationError`。`Exchange` 基类还有属性 `exchange.requiredCredentials`，允许用户查看特定交易所需要哪些凭证，如下所示：

```javascript tab="JavaScript"
const ccxt = require ('ccxt')
const exchange = new ccxt.binance()
console.log (exchange.requiredCredentials) // prints required credentials
exchange.checkRequiredCredentials() // throw AuthenticationError
```
```python tab="Python"
import ccxt
exchange = ccxt.coinbasepro()
print(exchange.requiredCredentials)  # prints required credentials
exchange.check_required_credentials()  # raises AuthenticationError
```
```php tab="PHP"
include 'ccxt.php';
$exchange = new \ccxt\bittrex ();
var_dump($exchange->requiredCredentials); // prints required credentials
$exchange->check_required_credentials(); // throws AuthenticationError
```
```go tab="Go"
exchange := ccxt.NewBinance(nil)
fmt.Println(exchange.RequiredCredentials)  // prints required credentials
exchange.CheckRequiredCredentials()        // throws AuthenticationError
```
```csharp tab="C#"
var exchange = new Binance();
Console.WriteLine(exchange.requiredCredentials); // prints required credentials
exchange.checkRequiredCredentials();             // throws AuthenticationError
```
```java tab="Java"
Exchange exchange = Exchange.dynamicallyCreateInstance("binance", null);
exchange.checkRequiredCredentials(); // throws AuthenticationError
```


#### 配置 API 密钥

要设置交易所进行交易，只需将 API 凭证分配给现有的交易所实例，或在实例化时将其传递给交易所构造函数，如下所示：


```javascript tab="JavaScript"
const ccxt = require ('ccxt')

// any time
let kraken = new ccxt.kraken ()
kraken.apiKey = 'YOUR_KRAKEN_API_KEY'
kraken.secret = 'YOUR_KRAKEN_SECRET_KEY'

// upon instantiation
let okcoin = new ccxt.okcoin ({
    apiKey: 'YOUR_OKCOIN_API_KEY',
    secret: 'YOUR_OKCOIN_SECRET_KEY',
})

// from variable id
const exchangeId = 'binance'
    , exchangeClass = ccxt[exchangeId]
    , exchange = new exchangeClass ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })
```
```python tab="Python"
import ccxt

# any time
bitfinex = ccxt.bitfinex ()
bitfinex.apiKey = 'YOUR_BFX_API_KEY'
bitfinex.secret = 'YOUR_BFX_SECRET'

# upon instantiation
hitbtc = ccxt.hitbtc ({
    'apiKey': 'YOUR_HITBTC_API_KEY',
    'secret': 'YOUR_HITBTC_SECRET_KEY',
})

# from variable id
exchange_id = 'binance'
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})
```
```php tab="PHP"
include 'ccxt.php'

// any time
$hitbtc = new \ccxt\hitbtc ();
$hitbtc->apiKey = 'YOUR_HITBTC_API_KEY';
$hitbtc->secret = 'YOUR_HITBTC_SECRET_KEY';

// upon instantiation
$zaif = new \ccxt\zaif (array (
    'apiKey' => 'YOUR_ZAIF_API_KEY',
    'secret' => 'YOUR_ZAIF_SECRET_KEY'
));

// from variable id
$exchange_id = 'binance';
$exchange_class = "\\ccxt\\$exchange_id";
$exchange = new $exchange_class (array (
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
));
```
```go tab="Go"
// upon instantiation
exchange := ccxt.NewBinance(map[string]interface{}{
    "apiKey": "YOUR_API_KEY",
    "secret": "YOUR_SECRET",
})

// or set later
exchange.ApiKey = "YOUR_API_KEY"
exchange.Secret = "YOUR_SECRET"
```
```csharp tab="C#"
// upon instantiation
var exchange = new Binance(new Dictionary<string, object>() {
    { "apiKey", "YOUR_API_KEY" },
    { "secret", "YOUR_SECRET" },
});

// or set later
exchange.apiKey = "YOUR_API_KEY";
exchange.secret = "YOUR_SECRET";
```
```java tab="Java"
// upon instantiation
Map<String, Object> config = new HashMap<>();
config.put("apiKey", "YOUR_API_KEY");
config.put("secret", "YOUR_SECRET");
Exchange exchange = Exchange.dynamicallyCreateInstance("binance", config);

// or set later
exchange.apiKey = "YOUR_API_KEY";
exchange.secret = "YOUR_SECRET";
```


请注意，如果您在开始交易前未设置 API 凭证，您的私有请求将以异常或错误的形式失败。为避免字符转义，**请始终将您的凭证写在单引号中**，而非双引号（`'VERY_GOOD'`，`"VERY_BAD"`）。

#### API 密钥权限
当您收到类似 `"Invalid API-key, IP, or permissions for action."` 或 `"API-key format invalid"` 的错误时，问题很可能不在 ccxt 内部，请在确认以下几点之前避免开启新的 issue：
1) 您的密钥中没有拼写错误、空格或引号
2) 您当前的 IP 地址（检查 [IPv4](https://api.ipify.org/) 或 [IPv6](https://api64.ipify.org/)）已添加到 API 密钥的白名单中（如果您使用代理，也请考虑在内）
3) 您已为该 api 密钥在权限列表中选择了正确的选项
4) 您没有在脚本中意外混用"testnet" api 密钥或"testnet"模式
5) 您已检查关于此错误的[已报告 issue](https://github.com/ccxt/ccxt/issues?q=is%3Aissue+%22Invalid+Api-Key+ID%22)


#### 登录

某些交易所要求您在调用私有方法之前先登录，可使用 `signIn` 方法完成


```javascript tab="JavaScript"
signIn (params = {})
```

参数

- **params**（字典）交易所 API 端点特定的参数（例如 `{"2fa": "329293"}`）

返回值

- 来自交易所的响应

## 覆盖 Nonce

**默认 nonce 由底层交易所定义。如果您希望每秒发出多次私有请求，可以用毫秒级 nonce 覆盖它！大多数交易所会在您超出速率限制时对请求进行限流，请仔细阅读[您的交易所的 API 文档](/docs/exchange-markets)！**

如果您需要重置 nonce，最简单的方法是创建另一对密钥用于私有 API。在您的配置中创建新密钥并设置一个全新未使用的密钥对通常就足够了。

在某些情况下，由于权限不足或其他原因，您无法创建新密钥。如果发生这种情况，您仍然可以覆盖 nonce。基础市场类为方便起见提供了以下方法：

- `seconds ()`：返回以秒为单位的 Unix 时间戳。
- `milliseconds ()`：以毫秒为单位的相同值（ms = 1000 * s，千分之一秒）。
- `microseconds ()`：以微秒为单位的相同值（μs = 1000 * ms，百万分之一秒）。

有些交易所在其 API 文档中混淆了毫秒和微秒，大家就原谅他们吧。您可以使用上面列出的方法来覆盖 nonce 值。如果您需要从多个实例同时使用同一密钥对，请使用闭包或公共函数来避免 nonce 冲突。在 JavaScript 中，您可以通过向交易所构造函数提供 `nonce` 参数或在交易所对象上显式设置来覆盖 nonce：

```javascript
// JavaScript

// 1: custom nonce redefined in constructor parameters
let nonce = 1
let kraken1 = new ccxt.kraken ({ nonce: () => nonce++ })

// 2: nonce redefined explicitly
let kraken2 = new ccxt.kraken ()
kraken2.nonce = function () { return nonce++ } // uses same nonce as kraken1

// 3: milliseconds nonce
let kraken3 = new ccxt.kraken ({
    nonce: function () { return this.milliseconds () },
})

// 4: newer ES syntax
let kraken4 = new ccxt.kraken ({
    nonce () { return this.milliseconds () },
})
```

在 Python 和 PHP 中，您可以通过子类化并覆盖特定交易所类的 nonce 函数来实现同样的效果：

```python
# Python

# 1: the shortest
coinbasepro = ccxt.coinbasepro({'nonce': ccxt.Exchange.milliseconds})

# 2: custom nonce
class MyKraken(ccxt.kraken):
    n = 1
    def nonce(self):
        return self.n += 1

# 3: milliseconds nonce
class MyBitfinex(ccxt.bitfinex):
    def nonce(self):
        return self.milliseconds()

# 4: milliseconds nonce inline
hitbtc = ccxt.hitbtc({
    'nonce': lambda: int(time.time() * 1000)
})

# 5: milliseconds nonce
acx = ccxt.acx({'nonce': lambda: ccxt.Exchange.milliseconds()})
```

```php
// PHP

// 1: custom nonce value
class Myokcoin extends \ccxt\okcoin {
    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array ('i' => 1), $options));
    }
    public function nonce () {
        return $this->i++;
    }
}

// 2: milliseconds nonce
class MyZaif extends \ccxt\zaif {
    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array ('i' => 1), $options));
    }
    public function nonce () {
        return $this->milliseconds ();
    }
}
```

## 账户

您可以使用 `fetchAccounts()` 方法获取与个人资料关联的所有账户

```javascript
fetchAccounts (params = {})
```

### 账户结构

`fetchAccounts()` 方法将返回如下所示的结构：

```javascript
[
    {
        id: "s32kj302lasli3930",
        type: "main",
        name: "main",
        code: "USDT",
        info: { ... }
    },
    {
        id: "20f0sdlri34lf90",
        name: "customAccount",
        type: "margin",
        code: "USDT",
        info: { ... }
    },
    {
        id: "4oidfk40dadeg4328",
        type: "spot",
        name: "spotAccount32",
        code: "BTC",
        info: { ... }
    },
    ...
]
```

账户类型是[统一账户类型](####account-balance)之一或 `subaccount`

## 账户余额

要查询余额并获取可用于交易的资金量或订单中锁定的资金量，请使用 `fetchBalance` 方法：

```javascript
fetchBalance (params = {})
```

参数

- **params**（字典）交易所 API 端点特定的额外参数（例如 `{"currency": "usdt"}`）

返回值

- 一个[余额结构](#balance-structure)

### 余额结构

```javascript
{
    'info':  { ... },    // the original untouched non-parsed reply with details
    'timestamp': 1499280391811, // Unix Timestamp in milliseconds (seconds * 1000)
    'datetime': '2017-07-05T18:47:14.692Z', // ISO8601 datetime string with milliseconds

    //-------------------------------------------------------------------------
    // indexed by availability of funds first, then by currency

    'free':  {           // money, available for trading, by currency
        'BTC': 321.00,   // floats...
        'USD': 123.00,
        ...
    },

    'used':  { ... },    // money on hold, locked, frozen, or pending, by currency

    'total': { ... },    // total (free + used), by currency

    'debt': { ... },     // debt, by currency

    //-------------------------------------------------------------------------
    // indexed by currency first, then by availability of funds

    'BTC':   {           // string, three-letter currency code, uppercase
        'free': 321.00   // float, money available for trading
        'used': 234.00,  // float, money on hold, locked, frozen or pending
        'total': 555.00, // float, total balance (free + used)
    },

    'USD':   {           // ...
        'free': 123.00   // ...
        'used': 456.00,
        'total': 579.00,
    },

    ...
}
```

如果底层交易所未提供 `timestamp` 和 `datetime` 值，它们可能是 undefined 或缺失的。

某些交易所可能不返回完整的余额信息。许多交易所不返回空账户或未使用账户的余额。在这种情况下，返回的余额结构中可能缺少某些货币。
```javascript tab="JavaScript"
(async () => {
    console.log (await exchange.fetchBalance ())
}) ()
```
```python tab="Python"
print (exchange.fetch_balance ())
```
```php tab="PHP"
var_dump ($exchange->fetch_balance ());
```
```go tab="Go"
balance, err := exchange.FetchBalance()
if err != nil {
    fmt.Println(err)
    return
}
fmt.Println("BTC free:", balance.Free["BTC"])
fmt.Println("USDT total:", balance.Total["USDT"])
```
```csharp tab="C#"
var balance = await exchange.FetchBalance();
Console.WriteLine("BTC free: " + balance.free["BTC"]);
Console.WriteLine("USDT total: " + balance.total["USDT"]);
```
```java tab="Java"
Balances balance = exchange.fetchBalance();
System.out.println("BTC free: " + balance.free.get("BTC"));
System.out.println("USDT total: " + balance.total.get("USDT"));
```


## 订单

```diff
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### 查询订单

大多数情况下，您可以通过 ID 或交易对查询订单，但并非所有交易所都提供完整灵活的订单查询端点集合。某些交易所可能没有获取最近已关闭订单的方法，其他交易所可能缺少通过 ID 获取订单的方法，等等。ccxt 库将在可能的情况下通过变通方法来处理这些情况。

查询订单的方法列表如下：

- `fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchClosedOrder (id, symbol = undefined, params = {})`
- `fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOpenOrder (id, symbol = undefined, params = {})`
- `fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOrder (id, symbol = undefined, params = {})`
- `fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`

请注意，这些方法的命名表明该方法返回单个订单还是多个订单（订单数组/列表）。`fetchOrder()` 方法需要一个必填的订单 ID 参数（字符串）。某些交易所还需要通过交易对来通过 ID 获取订单，因为订单 ID 可能与各种交易对相交。另外，请注意上述所有其他方法都返回一个数组（列表）的订单。它们中的大多数也需要 symbol 参数，但某些交易所允许在未指定 symbol 的情况下查询（即*所有交易对*）。

如果用户调用交易所不支持或 ccxt 未实现的方法，库将抛出 NotSupported 异常。

要检查上述任何方法是否可用，请查看交易所的 `.has` 属性：


```javascript tab="JavaScript"
'use strict';

const ccxt = require ('ccxt')
const id = 'poloniex'
exchange = new ccxt[id] ()
console.log (exchange.has)
```
```python tab="Python"
import ccxt
id = 'binance'
exchange = getattr(ccxt, id)()
print(exchange.has)
```
```php tab="PHP"
$exchange = new \ccxt\bitfinex();
print_r ($exchange->has); // or var_dump
```
```go tab="Go"
exchange := ccxt.NewBitfinex(nil)
fmt.Println(exchange.Has)
```
```csharp tab="C#"
var exchange = new Bitfinex();
Console.WriteLine(exchange.has);
```
```java tab="Java"
Map<String, Object> has = (Map<String, Object>) exchange.getExchange().has;
System.out.println(has);
```


`.has` 属性的典型结构通常包含以下与订单查询 API 方法对应的标志：

```javascript
exchange.has = {

    // ... other flags ...

    'fetchOrder': true, // available from the exchange directly and implemented in ccxt
    'fetchOrders': false, // not available from the exchange or not implemented in ccxt
    'fetchOpenOrders': true,
    'fetchClosedOrders': 'emulated', // not available from the exchange, but emulated in ccxt

    // ... other flags ...

}
```

布尔值 `true` 和 `false` 的含义显而易见。字符串值 `emulated` 表示交易所 API 中缺少该特定方法，ccxt 将在客户端尽可能进行变通处理。

#### 理解订单 API 设计

各交易所的订单管理 API 设计各有不同。用户必须了解每种特定方法的目的以及它们如何组合成完整的订单 API：

- `fetchCanceledOrders()`——获取已取消订单列表
- `fetchClosedOrder()`——通过订单 ID 获取单个已关闭订单
- `fetchClosedOrders()`——获取已关闭（或已取消）订单列表
- `fetchMyTrades()`——虽然不是订单 API 的一部分，但与之密切相关，因为它提供已结算交易的历史记录
- `fetchOpenOrder()`——通过订单 ID 获取单个未完成订单
- `fetchOpenOrders()`——获取未完成订单列表
- `fetchOrder()`——通过订单 `id` 获取单个订单（未完成或已关闭）
- `fetchOrders()`——获取所有订单列表（未完成或已关闭/已取消）
- `createOrder()`——用于下单
- `createOrders()`——用于在同一请求中下多个订单
- `cancelOrder()`——用于取消单个订单
- `cancelOrders()`——用于取消多个订单
- `cancelAllOrders()`——用于取消所有订单
- `cancelAllOrdersAfter()`——用于在给定超时后取消所有订单

大多数交易所都提供获取当前未成交订单的方法，即 `exchange.has['fetchOpenOrders']`。如果该方法不可用，通常可以使用 `exchange.has['fetchOrders']` 来获取所有订单列表。交易所会通过 `fetchOpenOrders()` 或 `fetchOrders()` 返回未成交订单列表，这两种方法中通常至少有一种可用。

部分交易所提供订单历史记录，另一些则不提供。如果底层交易所提供订单历史记录，则可以使用 `exchange.has['fetchClosedOrders']` 或 `exchange.has['fetchOrders']`。如果底层交易所不提供订单历史记录，则 `fetchClosedOrders()` 和 `fetchOrders()` 均不可用。在后一种情况下，用户需要自行构建本地订单缓存，通过 `fetchOpenOrders()` 和 `fetchOrder()` 跟踪未成交订单的状态，并在用户层面将其标记为已成交（当它们不再是未成交状态时）。

如果底层交易所没有提供查询订单历史的方法（`fetchClosedOrders()` 和 `fetchOrders()`），则它会提供 `fetchOpenOrders` 以及通过 `fetchMyTrades` 获取的交易历史（参见[订单与交易的关联关系](#how-orders-are-related-to-trades)）。在许多情况下，这些信息足以用于实盘交易机器人的跟踪。如果没有订单历史记录，则需要跟踪实时订单，并从未成交订单和历史交易中恢复历史信息。

通常，底层交易所会提供以下一种或多种历史数据：

- `fetchClosedOrders()`
- `fetchOrders()`
- `fetchMyTrades()`

上述三种方法中的任意一种都可能缺失，但交易所 API 通常至少会提供其中一种。

如果底层交易所不提供历史订单数据，CCXT 库不会模拟缺失的功能——需要在用户端根据需要自行添加。

**请注意，某个方法可能缺失，原因可能是交易所没有对应的 API 端点，也可能是 CCXT 尚未实现该功能（本库仍在持续开发中）。在后一种情况下，缺失的方法将尽快补充完善。**

#### 查询多个订单与交易

所有返回交易列表和订单列表的方法，都接受第二个参数 `since` 和第三个参数 `limit`：

- `fetchTrades()`（公开接口）
- `fetchMyTrades()`（私有接口）
- `fetchOrders()`
- `fetchOpenOrders()`
- `fetchClosedOrders()`
- `fetchCanceledOrders()`

第二个参数 `since` 按时间戳筛选结果，第三个参数 `limit` 限制返回条目的数量。

如果用户未指定 `since`，`fetchTrades()/fetchOrders()` 方法将返回交易所的默认结果集。默认结果集因交易所而异，部分交易所会返回从该交易对上市之日起的交易或最近订单，另一些交易所则返回较少的交易或订单（例如最近24小时、最近100笔交易、前100个订单等）。如果用户需要精确控制时间范围，则需自行指定 `since` 参数。

**注意：并非所有交易所都提供按起始时间筛选交易和订单列表的功能，因此对 `since` 和 `limit` 的支持因交易所而异。不过，大多数交易所确实提供了至少一种"分页"或"滚动"的替代方案，可以通过额外的 `params` 参数进行覆盖。**

部分交易所没有获取已成交订单或所有订单的方法，只提供 `fetchOpenOrders()` 端点，有时也提供 `fetchOrder` 端点。这类交易所没有任何获取订单历史的方法。为了维护这些交易所的订单历史记录，用户需要在用户层面存储订单字典或数据库，并在调用 `createOrder()`、`fetchOpenOrders()`、`cancelOrder()`、`cancelAllOrders()` 等方法后更新数据库中的订单。

#### 按订单 ID 查询

要通过订单 ID 获取特定订单的详细信息，请使用 `fetchOrder()` / `fetch_order()` 方法。部分交易所即使在按 ID 获取特定订单时也需要提供交易对符号。

fetchOrder/fetch_order 方法的签名如下：

```javascript
if (exchange.has['fetchOrder']) {
    //  you can use the params argument for custom overrides
    let order = await exchange.fetchOrder (id, symbol = undefined, params = {})
}
```

**部分交易所没有按 ID 获取订单的端点，ccxt 会在可能的情况下进行模拟。** 目前此功能在某些地方可能仍有缺失，因为这项工作仍在进行中。

您可以在额外的 params 参数中传入自定义的键值对，以指定特定的订单类型或其他所需设置。

以下是使用 fetchOrder 方法从已认证的交易所实例获取订单信息的示例：

```javascript tab="JavaScript"
(async function () {
    const order = await exchange.fetchOrder (id)
    console.log (order)
}) ()
```
```python 3 (synchronous) tab="Python"
if exchange.has['fetchOrder']:
    order = exchange.fetch_order(id)
    print(order)

# Python 3.7+ asyncio (asynchronous)
import asyncio
import ccxt.async_support as ccxt
if exchange.has['fetchOrder']:
    order = asyncio.run(exchange.fetch_order(id))
    print(order)
```
```php tab="PHP"
if ($exchange->has['fetchOrder']) {
    $order = $exchange->fetch_order($id);
    var_dump($order);
}
```
```go tab="Go"
if exchange.Has["fetchOrder"] == true {
    order, err := exchange.FetchOrder(id)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println("Order", order.Id, "status=", order.Status, "filled=", order.Filled)
}
```
```csharp tab="C#"
if ((bool)exchange.has["fetchOrder"])
{
    var order = await exchange.FetchOrder(id);
    Console.WriteLine("Order " + order.id + " status=" + order.status + " filled=" + order.filled);
}
```
```java tab="Java"
Order order = exchange.fetchOrder(orderId, "BTC/USDT", null);
System.out.println("Order " + order.id + " status=" + order.status + " filled=" + order.filled);
```


#### 所有订单

```javascript
if (exchange.has['fetchOrders'])
    exchange.fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

**部分交易所没有获取所有订单的端点，ccxt 会在可能的情况下进行模拟。** 目前此功能在某些地方可能仍有缺失，因为这项工作仍在进行中。

#### 未成交订单

```javascript
if (exchange.has['fetchOpenOrders'])
    exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

#### 已成交订单

请勿将*已成交订单*与*交易*（又称*成交记录*）混淆！一个订单可以通过多笔对手方交易完成成交！因此，*已成交订单*与*交易*并不相同。通常，订单本身不包含 `fee` 字段，但每笔用户交易都包含 `fee`、`cost` 及其他属性。不过，许多交易所也会将这些属性传播到订单上。

**部分交易所没有获取已成交订单的端点，ccxt 会在可能的情况下进行模拟。** 目前此功能在某些地方可能仍有缺失，因为这项工作仍在进行中。

```javascript
if (exchange.has['fetchClosedOrders'])
    exchange.fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

### 订单结构

ccxt 统一 API 中大多数返回订单的方法将返回如下所述的订单结构：

```javascript
{
    'id':                '12345-67890:09876/54321', // string
    'clientOrderId':     'abcdef-ghijklmnop-qrstuvwxyz', // a user-defined clientOrderId, if any
    'datetime':          '2017-08-17 12:42:48.000', // ISO8601 datetime of 'timestamp' with milliseconds
    'timestamp':          1502962946216, // order placing/opening Unix timestamp in milliseconds
    'lastTradeTimestamp': 1502962956216, // Unix timestamp of the most recent trade on this order
    'status':      'open',        // 'open', 'closed', 'canceled', 'expired', 'rejected'
    'symbol':      'ETH/BTC',     // symbol
    'type':        'limit',       // 'market', 'limit'
    'timeInForce': 'GTC',         // 'GTC', 'IOC', 'FOK', 'PO'
    'side':        'buy',         // 'buy', 'sell'
    'price':        0.06917684,   // float price in quote currency (may be empty for market orders)
    'average':      0.06917684,   // float average filling price
    'amount':       1.5,          // ordered amount of base currency
    'filled':       1.1,          // filled amount of base currency
    'remaining':    0.4,          // remaining amount to fill
    'cost':         0.076094524,  // 'filled' * 'price' (filling price used where available)
    'trades':     [ ... ],        // a list of order trades/executions
    'fee': {                      // fee info, if available
        'currency': 'BTC',        // which currency the fee is (usually quote)
        'cost': 0.0009,           // the fee amount in that currency
        'rate': 0.002,            // the fee rate (if available)
    },
    'triggerPrice': 10000,         // price that will be the order trigger
    'stopLossPrice': 50000,
    'takeProfitPrice': 150000,
    'reduceOnly': false,
    'postOnly': false,
    'info': { ... },              // the original unparsed order structure as is
}
```

- 订单的 `status` 通常为 `'open'`（未成交或部分成交）、`'closed'`（完全成交）或 `'canceled'`（未成交后取消，或部分成交后取消）。
- 部分交易所允许用户在下新订单时指定过期时间戳。如果订单在该时间前未成交，其 `status` 将变为 `'expired'`。
- 使用 `filled` 值来判断订单是否已成交、部分成交或完全成交，以及成交量。
- `'fee'` 信息的完善工作仍在进行中，费用信息可能部分或完全缺失，具体取决于交易所的能力。
- `fee` 的计价货币可能与两种交易货币都不同（例如，ETH/BTC 订单的费用以 USD 计）。
- `lastTradeTimestamp` 时间戳在交易所不支持的情况下，或在订单未成交时（订单尚未完全或部分成交），可能没有值，为 `undefined/None/null`。
- `lastTradeTimestamp`（如有）表示最后一笔交易的时间戳，适用于订单已完全或部分成交的情况，否则 `lastTradeTimestamp` 为 `undefined/None/null`。
- 订单的 `status` 优先于 `lastTradeTimestamp`。
- 订单的 `cost` 为：`{ filled * price }`
- 订单的 `cost` 表示订单的总*计价货币*成交量（而 `amount` 是*基础货币*成交量）。`cost` 的值应尽可能接近已知的最新实际订单成本。`cost` 字段主要用于方便计算，可以从其他字段推导得出。
- `clientOrderId` 字段可以由用户在下单时通过[自定义订单参数](#custom-order-params)设置。通过 `clientOrderId`，用户可以在之后区分自己的各个订单。目前仅适用于支持 `clientOrderId` 的交易所。

#### timeInForce

如果交易所未指定，`timeInForce` 字段可能为 `undefined/None/null`。`timeInForce` 的统一化工作仍在进行中。

`timeInForce` 字段的可能取值：

- `'GTC'` = _Good Till Cancel(ed)_（撤销前有效），订单保留在订单簿中，直到成交或被取消。
- `'IOC'` = _Immediate Or Cancel_（立即或取消），订单必须立即匹配，并全部或部分成交，未成交部分将被取消（或整个订单被取消）。
- `'FOK'` = _Fill Or Kill_（全部成交或取消），订单必须立即完全成交并关闭，否则整个订单将被取消。
- `'PO'` = _Post Only_（只做挂单），订单以挂单方式提交，否则被取消。这意味着订单必须以未成交状态在订单簿上保留至少一段时间。将 `PO` 作为 `timeInForce` 选项的统一化工作仍在进行中，统一后的交易所具有 `exchange.has['createPostOnlyOrder'] == True`。

### 下单

用户可以向交易所发送不同类型的订单，普通订单最终会进入相应交易对的订单簿，其他订单可能更为高级。以下列举了各种订单类型：

- [限价单](#limit-orders) – 普通订单，包含以基础货币计的 `amount`（您想买入或卖出的数量）和以计价货币计的 `price`（您想买入或卖出的价格）。
- [市价单](#market-orders) – 普通订单，包含以基础货币计的 `amount`（您想买入或卖出的数量）
  - [市价买单](#market-buys) – 部分交易所要求市价买单以计价货币计的 `amount`（您想花费多少买入）
- [触发单](#conditional-orders)（又称*条件单*）– 一种高级订单类型，用于等待市场上某个条件满足后自动响应：当达到 `triggerPrice` 时，触发单被激活，随后下一个常规限价 `price` 或市价单，最终导致建仓或平仓。
- [止损单](#stop-loss-orders) – 与触发单几乎相同，但用于平仓以阻止该仓位进一步亏损：当价格达到 `triggerPrice` 时，止损单被触发，随即下一个常规限价或市价单，以特定限价 `price` 或市价平仓（附有止损单的仓位）。
- [止盈单](#take-profit-orders) – 止损单的对应物，此类订单用于平仓以锁定该仓位的现有利润：当价格达到 `triggerPrice` 时，止盈单被触发，随即下一个常规限价或市价单，以特定限价 `price` 或市价平仓（附有止盈单的仓位）。
- [附加到仓位的止损与止盈单](#stoploss-and-takeprofit-orders-attached-to-a-position) – 高级订单，由上述类型的三个订单组成：下一个常规限价或市价单以建立仓位，同时附带止损和/或止盈单，这些附加单将在建仓后生效，并用于之后平仓（当止损被触及时，将平仓并取消对应的止盈单；反之，当止盈被触及时，将平仓并取消对应的止损单，这两个对应单也称为"OCO单——一个取消另一个"），除了建仓所需的 `amount`（限价单还需 `price`）外，还需要止损单的 `triggerPrice`（若为止损限价单则还需限价 `price`）和/或止盈单的 `triggerPrice`（若为止盈限价单则还需限价 `price`）。
- [追踪单](#trailing-orders) – 一种相对未成交仓位自动调整的订单，可设置 `trailingAmount` 以跟踪仓位后方指定的计价金额，或设置 `trailingPercent` 以跟踪仓位后方指定的百分比，当市场价格等于追踪单价格时，将根据追踪单是否设置了 `reduceOnly` 参数来决定建立新仓位或平仓。

下单时始终需要用户指定 `symbol`（即您希望交易的市场）。

要下单，请使用 `createOrder` 方法。您可以使用返回的统一[订单结构](#order-structure)中的 `id` 来查询订单的状态。如果您需要同时下多个订单，可以检查 `createOrders` 方法的可用性。

```javascript
createOrder (symbol, type, side, amount, price = undefined, params = {})
```

```javascript
createOrders (orders, params = {}) // orders is a list in which each element contains a symbol, type, side, amount, price and params
```

参数

- **symbol** (String) *必填* 统一 CCXT 市场符号
  - 请确保相关符号在目标交易所中存在且可用于交易。
- **side** *必填* 表示订单方向的字符串字面量。
  **统一方向：**
  - `buy` 支付计价货币并获得基础货币；例如，买入 `BTC/USD` 意味着您将用美元换取比特币。
  - `sell` 支付基础货币并获得计价货币；例如，卖出 `BTC/USD` 意味着您将用比特币换取美元。
- **type** 订单类型的字符串字面量
  **统一类型：**
  - [market](#market-orders) 某些交易所不允许此类型，详情请参阅[其文档](#exchanges)
  - [limit](#limit-orders)
  - 非统一类型请参阅 #custom-order-params 和 #other-order-types
- **amount** 您希望交易的货币数量，通常（但并非总是）以交易对符号的基础货币为单位（某些交易所的单位取决于订单方向：请参阅其 API 文档了解详情。）
- **price** 订单成交价格，以计价货币为单位（市价单中忽略此参数）
- **params** (Dictionary) 特定于交易所 API 端点的额外参数（例如 `{"settle": "usdt"}`）

返回值

- 成功的下单调用返回一个[订单结构](#order-structure)

**createOrder 注意事项**

- 某些交易所只允许使用限价单进行交易。

如果交易所 API 响应中未返回相关信息，则返回的订单结构中某些字段可能为 `undefined / None / null`。`createOrder` 方法保证返回一个统一的[订单结构](#order-structure)，其中至少包含订单 `id` 和 `info`（来自交易所的原始响应）：

```javascript
{
    'id': 'string',  // order id
    'info': { ... }, // decoded original JSON response from the exchange as is
}
```

##### 常见错误

- 为合约市场创建订单时会发生一个常见错误：

```
"must be greater than minimum amount precision of 1"
```

当交易所在 `createOrder` 的 `amount` 参数中期望一个自然数合约数量（1、2、3 等）时，就会发生此错误。[市场结构](#market-structure)中有一个名为 `contractSize` 的键。每份合约对应一定数量的基础资产，由 `contractSize` 决定。合约数量乘以 `contractSize` 等于基础资产数量。`基础资产数量 = (合约数量 * contractSize)`，因此要推导出应在 `amount` 参数中填写的合约数量，可以求解：`合约数量 = (基础资产数量 / contractSize)`。

以下是查找 `contractSize` 的示例：
```python
await exchange.loadMarkets()
symbol = 'BTC/USDT:USDT'
market = exchange.market(symbol)
print(market['contractSize'])

# Let's say you want to convert 0.5 BTC to the number of contracts:
number_contracts = round((0.5 * 1) / market['contractSize'])
```

#### 限价单

限价单按交易者指定的价格挂在交易所的订单簿中。当同一市场中没有价格更优的订单，且另一位交易者创建了一个与限价单价格相符或更优的[市价单](#market-orders)或反向订单时，限价单即被成交（关闭）。

限价单可能无法完全成交。当成交订单的数量小于限价单指定的数量时，就会出现这种情况。

```javascript
// camelCaseNotation
exchange.createLimitSellOrder (symbol, amount, price, params)
exchange.createLimitBuyOrder (symbol, amount, price, params)

// underscore_notation
exchange.create_limit_sell_order (symbol, amount, price, params)
exchange.create_limit_buy_order (symbol, amount, price, params)

// using general createLimitOrder and side = 'buy' or 'sell'
exchange.createLimitOrder (symbol, side, amount, price, params)
exchange.create_limit_order (symbol, side, amount, price, params)

// using general createOrder, type = 'limit' and side = 'buy' or 'sell'
exchange.createOrder (symbol, 'limit', side, amount, price, params)
exchange.create_order (symbol, 'limit', side, amount, price, params)
```

#### 市价单

*又称*

- 市场价格订单
- 现货价格订单
- 即时订单

市价单通过立即履行交易所订单簿卖方侧的一个或多个已有订单来执行。您的市价单所履行的订单从订单簿顶部开始选取，这意味着您的市价单以当前最优价格成交。下市价单时无需指定价格，即使指定了价格也会被忽略。

无法保证订单以您在下单前观察到的价格执行。原因有多种，包括：

- **价格滑点** 订单执行过程中市场价格的轻微变动。价格滑点的原因包括但不限于：

    - 网络往返延迟
    - 交易所高负载
    - 价格波动

- **订单规模不一致** 如果市价单的数量大于订单簿顶部订单的规模，则顶部订单成交后，市价单将继续填充订单簿中的下一个订单，这意味着市价单以多个价格成交

```javascript
// camelCaseNotation
exchange.createMarketSellOrder (symbol, amount, params)
exchange.createMarketBuyOrder (symbol, amount, params)

// underscore_notation
exchange.create_market_sell_order (symbol, amount, params)
exchange.create_market_buy_order (symbol, amount, params)

// using general createMarketOrder and side = 'buy' or 'sell'
exchange.createMarketOrder (symbol, side, amount, params)
exchange.create_market_order (symbol, side, amount, params)

// using general createOrder, type = 'market' and side = 'buy' or 'sell'
exchange.createOrder (symbol, 'market', side, amount, ...)
exchange.create_order (symbol, 'market', side, amount, ...)
```

**注意，某些交易所不接受市价单（仅允许限价单）。** 要以编程方式检测相关交易所是否支持市价单，可以使用 `.has['createMarketOrder']` 交易所属性：

```javascript tab="JavaScript"
if (exchange.has['createMarketOrder']) {
    ...
}
```
```python tab="Python"
if exchange.has['createMarketOrder']:
    ...
```
```php tab="PHP"
if ($exchange->has['createMarketOrder']) {
    ...
}
```
```go tab="Go"
if exchange.Has["createMarketOrder"] == true {
    // All order types are supported through CreateOrder
    order, err := exchange.CreateMarketBuyOrder("BTC/USDT", 0.001)
    if err != nil {
        fmt.Println(err)
    }
    fmt.Println(order)
}
```
```csharp tab="C#"
if ((bool)exchange.has["createMarketOrder"])
{
    // All order types are supported through CreateOrder
    var order = await exchange.CreateMarketBuyOrder("BTC/USDT", 0.001);
}
```
```java tab="Java"
// All order types are supported through createOrder
Order order = exchange.createMarketBuyOrder("BTC/USDT", 0.001);
```


#### 市价买单

一般情况下，下 `market buy`（市价买单）或 `market sell`（市价卖单）时，用户只需指定要买入或卖出的基础货币数量。但是，某些交易所对市价买单采用不同的计算方式。

假设您在交易 BTC/USD，当前 BTC 市价超过 9000 美元。对于市价买入或市价卖出，您可以指定 `amount` 为 2 BTC，这将在您的账户上产生*约* 18000 美元（大约 ;)）的变动，具体取决于订单方向。

**对于市价买单，某些交易所要求以计价货币指定订单的总费用！** 其背后的逻辑很简单，这些交易所不是以要买入或卖出的基础货币数量来操作，而是以*"您希望总共花费多少计价货币购买"*来操作。

对于这些交易所，下市价买单时不应指定 2 BTC 的数量，而应以某种方式指定订单的总费用，在本例中即 18000 美元。以这种方式处理 `market buy` 订单的交易所有一个特定选项 `createMarketBuyOrderRequiresPrice`，允许通过两种方式指定 `market buy` 订单的总费用。

第一种是默认方式，如果您同时指定 `price` 和 `amount`，库内部将通过这两个值简单相乘计算总费用（`cost = amount * price`）。计算出的 `cost` 即为此次市价买单所花费的美元计价货币数量。

```javascript
// this example is oversimplified and doesn't show all the code that is
// required to handle the errors and exchange metadata properly
// it shows just the concept of placing a market buy order

const exchange = new ccxt.cex ({
    'apiKey': YOUR_API_KEY,
    'secret': 'YOUR_SECRET',
    // 'options': {
    //     'createMarketBuyOrderRequiresPrice': true, // default
    // },
})

;(async () => {

    // when `createMarketBuyOrderRequiresPrice` is true, we can pass the price
    // so that the total cost of the order would be calculated inside the library
    // by multiplying the amount over price (amount * price)

    const symbol = 'BTC/USD'
    const amount = 2 // BTC
    const price = 9000 // USD
    // cost = amount * price = 2 * 9000 = 18000 (USD)

    // note that we don't use createMarketBuyOrder here, instead we use createOrder
    // createMarketBuyOrder will omit the price and will not work when
    // exchange.options['createMarketBuyOrderRequiresPrice'] = true
    const order = await exchange.createOrder (symbol, 'market', 'buy', amount, price)

    console.log (order)
}) ()
```

第二种方式适用于用户希望自行计算并指定订单总费用的情况。可以通过将 `createMarketBuyOrderRequiresPrice` 选项设置为 `false` 来关闭此功能：

```javascript
const exchange = new ccxt.cex ({
    'apiKey': YOUR_API_KEY,
    'secret': 'YOUR_SECRET',
    'options': {
        'createMarketBuyOrderRequiresPrice': false, // switch off
    },
})

// or, to switch it off later, after the exchange instantiation, you can do
exchange.options['createMarketBuyOrderRequiresPrice'] = false

;(async () => {

    // when `createMarketBuyOrderRequiresPrice` is true, we can pass the price
    // so that the total cost of the order would be calculated inside the library
    // by multiplying the amount over price (amount * price)

    const symbol = 'BTC/USD'
    const amount = 2 // BTC
    const price = 9000 // USD
    cost = amount * price // ← instead of the amount cost goes ↓ here
    const order = await exchange.createMarketBuyOrder (symbol, cost)
    console.log (order)
}) ()
```

更多相关信息：

- https://github.com/ccxt/ccxt/issues/564#issuecomment-347458566
- https://github.com/ccxt/ccxt/issues/4914#issuecomment-478199357
- https://github.com/ccxt/ccxt/issues/4799#issuecomment-470966769
- https://github.com/ccxt/ccxt/issues/5197#issuecomment-496270785

#### 用限价单模拟市价单

也可以用 `limit`（限价）订单模拟 `market`（市价）订单。

**警告：由于高波动性，此方法存在风险，请自行承担风险，仅在您非常清楚自己在做什么的情况下使用！**

大多数情况下，`market sell`（市价卖单）可以用一个极低价格的 `limit sell`（限价卖单）来模拟——交易所将自动将其作为市场价格的吃单执行（即当前对您最有利的可用价格）。当交易所检测到您以极低价格卖出时，会自动为您提供订单簿中可用的最佳买方价格。这实际上等同于下市价卖单。因此，在缺少市价单的情况下，可以用限价单来模拟。

反之亦然——`market buy`（市价买单）可以用一个极高价格的 `limit buy`（限价买单）来模拟。大多数交易所同样会以最佳可用价格（即市场价格）成交您的订单。

但是，您绝不应完全依赖这一点，**务必先用小额资金测试！** 您可以先在交易所的网页界面中验证此逻辑。以指定限价卖出最小数量（可承受的小额损失，以防万一），然后在交易历史中查看实际成交价格。

#### 限价单

限价订单也称为*限价单*。某些交易所只接受限价单。限价单需要在提交时附带价格（每单位汇率）。交易所仅在市场价格达到期望水平时才会关闭限价单。

```javascript
// camelCaseStyle
exchange.createLimitBuyOrder (symbol, amount, price[, params])
exchange.createLimitSellOrder (symbol, amount, price[, params])

// underscore_style
exchange.create_limit_buy_order (symbol, amount, price[, params])
exchange.create_limit_sell_order (symbol, amount, price[, params])
```


#### 条件单

在传统交易中，"止损单"这一术语有些歧义，因此在 CCXT 中我们使用"触发"订单这一术语。当符号价格达到您设定的"触发"（"止损"）价格时，订单将作为 `market`（市价）或 `limit`（限价）订单被激活，具体取决于您的选择。

我们对触发订单有不同的分类：
1) 独立[触发订单](#trigger-order)，用于买入/卖出币种（开仓/平仓）
2) 独立[止损单](#stop-loss-orders)或[止盈单](#take-profit-orders)，专门用于平仓。
3) 附属于主订单的止损单或止盈单（[附属条件触发订单](#stoploss-and-takeprofit-orders-attached-to-a-position)）。


##### 触发订单

传统的"止损"订单（您可能在各交易所网站上看到过）在 CCXT 库中现在称为"触发"订单。通过添加 `triggerPrice` 参数来实现。它们是独立的基本触发订单，可用于开仓或平仓。

* 要确认交易所支持此功能，请检查 `exchange.features` 或使用辅助方法 `exchange.featureValue('BTC/USDT', 'createOrder', 'triggerPrice')`。
* 通常，当基础资产/合约的价格**从任意方向**穿越 `triggerPrice` 时激活。但是，某些交易所的 API 要求同时设置 `triggerDirection`，根据价格高于或低于 `triggerPrice` 来触发订单。例如，当交易对价格穿越 `1700` 时触发限价单（以限价 `1500` 买入 0.1 个 `ETH`）：


```javascript tab="JavaScript"
const params = {
    'triggerPrice': 1700,
}
const order = await exchange.createOrder ('ETH/USDT', 'market', 'buy', 0.1, 1500, params)
```
```python tab="Python"
params = {
    'triggerPrice': 1700,
}
order = exchange.create_order('ETH/USDT', 'market', 'buy', 0.1, 1500, params)
```
```php tab="PHP"
$params = {
    'triggerPrice': 1700,
}
$order = $exchange->create_order ('ETH/USDT', 'market', 'buy', 0.1, 1500, $params)
```
```go tab="Go"
params := map[string]interface{}{
    "triggerPrice": 1700,
}
order, err := exchange.CreateOrder("ETH/USDT", "market", "buy", 0.1, ccxt.WithCreateOrderPrice(1500), ccxt.WithCreateOrderParams(params))
```
```csharp tab="C#"
var parameters = new Dictionary<string, object>() {
    { "triggerPrice", 1700 },
};
var order = await exchange.CreateOrder("ETH/USDT", "market", "buy", 0.1, 1500, parameters);
```
```java tab="Java"
Map<String, Object> params = Map.of("triggerPrice", 1700);
Order order = exchange.createOrder("ETH/USDT", "market", "buy", 0.1, null, params);
```


通常，交易所会自动判断 `triggerPrice` 的方向（是"高于"还是"低于"当前价格），但某些交易所要求您提供值为 `ascending`（上升）或 `descending`（下降）的 `triggerDirection`：

```
params = {
    'triggerPrice': 1700,
    'triggerDirection': 'ascending', // order will be triggered when price goes upward and touches 1700
}
```

注意，您也可以在触发订单中添加 `reduceOnly: true` 参数（以及可能的 `triggerDirection: 'ascending/descending'` 参数），使其充当"止损"或"止盈"订单。但是，对于某些交易所，我们支持"止损"和"止盈"触发订单类型，这些类型会自动处理 `reduceOnly` 和 `triggerDirection`（详见下文）。

##### 止损单

与触发订单相同，但方向很重要。通过指定 `stopLossPrice` 参数（作为止损触发价格）来实现，同时代表用户自动实现 `triggerDirection`，因此您可以将其作为普通触发订单的替代方案使用。

* 要确认交易所支持此功能，请检查 `exchange.features` 或使用辅助方法 `exchange.featureValue('BTC/USDT', 'createOrder', 'stopLossPrice')`。

假设您以 1000 建立了多头仓位（买入），并希望保护自己免受价格跌破 700 以下可能造成的损失。您可以在 700 设置触发价格下止损单。对于该止损单，您可以指定限价，也可以以市价执行。

```
    | price  | amount
----|----------------
    |  1500 | 200
    |  1400 | 300
  a |  1300 | 100
  s |  1200 | 200
  k |  1100 | 300
    |  1000 | 100 <--- you bought to enter a long position here at 1000
    |   900 | 100
----|---------------- last price is 900
    |   800 | 100
    |   700 | 200 <------- you place a stop loss order here at 700 <----------------------+
  b |   600 | 100       when your stopLossPrice is reached from above                     |
  i |   500 | 300   it will close your position at market price below 700 ----------------+
  d |   400 | 200 <- or it will be executed at your limit price lower that stopLossPrice -+
    |   300 | 100
    |   200 | 100
```

假设您以 700 建立了空头仓位（卖出），并希望保护自己免受价格涨破 1300 以上可能造成的损失。您可以在 1300 设置触发价格下止损单。对于该止损单，您可以指定限价，也可以以市价执行。

```
    | price  | amount
----|----------------
    |  1500 | 200
    |  1400 | 300 <------------------------------------------------------------------------+
  a |  1300 | 100 <------ you place a stop loss order here at 1300 <---------------------+ |
  s |  1200 | 200      when your stopLossPrice is reached from below                     | |
  k |  1100 | 300   it will close your position at market price above 1300 --------------+ |
    |  1000 | 100    or it will be executed at your limit price higher than stopLossPrice -+
    |   900 | 100
----|---------------- last price is 900 (you sold at 700)
    |   800 | 100
    |   700 | 200 <--- you sold to enter a short position here at 700
  b |   600 | 100
  i |   500 | 300
  d |   400 | 200
    |   300 | 100
    |   200 | 100
```

止损单在以下情况下被激活，当标的资产/合约价格：

* 从上方跌破 `stopLossPrice`，适用于卖单。（例如：平多仓，避免进一步亏损）
* 从下方涨破 `stopLossPrice`，适用于买单。（例如：平空仓，避免进一步亏损）


```javascript tab="JavaScript"
// for a stop loss order
const params = {
    'stopLossPrice': 55.45, // your stop loss price
}

const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```
```python tab="Python"
# for a stop loss order
params = {
    'stopLossPrice': 55.45,  # your stop loss price
}

order = exchange.create_order (symbol, type, side, amount, price, params)
```
```php tab="PHP"
// for a stop loss order
$params = {
    'stopLossPrice': 55.45, // your stop loss price
}

$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```
```go tab="Go"
// for a stop loss order
params := map[string]interface{}{
    "stopLossPrice": 55.45, // your stop loss price
}
order, err := exchange.CreateOrder(symbol, typeVar, side, amount, ccxt.WithCreateOrderPrice(price), ccxt.WithCreateOrderParams(params))
```
```csharp tab="C#"
// for a stop loss order
var parameters = new Dictionary<string, object>() {
    { "stopLossPrice", 55.45 }, // your stop loss price
};
var order = await exchange.CreateOrder(symbol, type, side, amount, price, parameters);
```
```java tab="Java"
Map<String, Object> params = Map.of("stopLossPrice", 55.45);
Order order = exchange.createOrder(symbol, type, side, amount, price, params);
```


##### 止盈订单

与止损订单相同，但方向很重要。通过指定 `takeProfitPrice` 参数（作为止盈触发价格）来实现。

假设您以 1000 建立了多头仓位（买入），并希望从价格涨破 1300 以上中获利。您可以在 1300 设置触发价格下止盈单。对于该止盈单，您可以指定限价，也可以以市价执行。

```
    | price  | amount
----|----------------
    |  1500 | 200
    |  1400 | 300 <------------------------------------------------------------------------------+
  a |  1300 | 100 <--- it will close your position at market price above 1300                    |
  s |  1200 | 200        when your takeProfitPrice is reached from below                         |
  k |  1100 | 300   or it will be executed at your limit price higher than your takeProfitPrice -+
    |  1000 | 100 <-  you bought to enter a long position here at 1000
    |   900 | 100
----|---------------- last price is 900
    |   800 | 100
    |   700 | 200
  b |   600 | 100
  i |   500 | 300
  d |   400 | 200
    |   300 | 100
    |   200 | 100
```

假设您以 700 建立了空头仓位（卖出），并希望从价格跌破 600 以下中获利。您可以在 600 设置触发价格下止盈单。对于该止盈单，您可以指定限价，也可以以市价执行。

```
    | price  | amount
----|----------------
    |  1500 | 200
    |  1400 | 300
  a |  1300 | 100
  s |  1200 | 200
  k |  1100 | 300
    |  1000 | 100
    |   900 | 100
----|---------------- last price is 900 (you sold at 700)
    |   800 | 100
    |   700 | 200 <--- you sold to enter a short position here at 700
  b |   600 | 100 <------ you place a take profit order here at 600
  i |   500 | 300     when your takeProfitPrice is reached from above
  d |   400 | 200     it will be close your position at market price below 600
    |   300 | 100 <- or it will be executed at your limit price lower than your takeProfitPrice
    |   200 | 100
```

止盈单在以下情况下被激活，当标的资产价格：

* 从下方涨破 `takeProfitPrice`，适用于卖单。（例如：以盈利平多仓）
* 从上方跌破 `takeProfitPrice`，适用于买单。（例如：以盈利平空仓）


```javascript tab="JavaScript"
// for a take profit order
const params = {
    'takeProfitPrice': 120.45, // your take profit price
}

const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```
```python tab="Python"
# for a take profit order
params = {
    'takeProfitPrice': 120.45,  # your take profit price
}

order = exchange.create_order (symbol, type, side, amount, price, params)
```
```php tab="PHP"
// for a take profit order
$params = {
    'takeProfitPrice': 120.45, // your take profit price
}

$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```
```go tab="Go"
// for a take profit order
params := map[string]interface{}{
    "takeProfitPrice": 120.45, // your take profit price
}
order, err := exchange.CreateOrder(symbol, typeVar, side, amount, ccxt.WithCreateOrderPrice(price), ccxt.WithCreateOrderParams(params))
```
```csharp tab="C#"
// for a take profit order
var parameters = new Dictionary<string, object>() {
    { "takeProfitPrice", 120.45 }, // your take profit price
};
var order = await exchange.CreateOrder(symbol, type, side, amount, price, parameters);
```
```java tab="Java"
Map<String, Object> params = Map.of("takeProfitPrice", 120.45);
Order order = exchange.createOrder(symbol, type, side, amount, price, params);
```


#### 附加于仓位的止损和止盈订单

**止盈** / **止损** 订单与开仓主订单绑定。通过为 `stopLoss` 和 `takeProfit` 分别提供字典参数来实现。

* 默认情况下，止损和止盈订单的数量与主订单相同，但方向相反。
* 附加触发订单以主订单被执行为前提条件。
* 并非所有交易所都支持。要检查是否支持止损，请使用如下方式：
```
exchange.featureValue('BTC/USDT', 'createOrder', 'stopLoss') // if stopLoss supported
exchange.featureValue('BTC/USDT', 'createOrder', 'stopLoss.price') // if limit price is supported for stoploss
```


```javascript tab="JavaScript"
const params = {
    'stopLoss': {
        'triggerPrice': 12.34, // at what price it will trigger
        'price': 12.00, // if exchange supports, 'price' param would be limit price (for market orders, don't include this param)
    },
    'takeProfit': {
        // similar params here
    }
}
const order = await exchange.createOrder ('SOL/USDT', 'limit', 'buy', 0.5, 13, params)
```
```python tab="Python"
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
```php tab="PHP"
$params = [
    'stopLoss': [
        'triggerPrice'=> 12.34, // at what price it will trigger
        'price'=> 12.00, // if exchange supports, 'price' param would be limit price (for market orders, don't include this param)
    ],
    'takeProfit'=> [
        // similar params here
    ]
]
$order = $exchange->create_order ('SOL/USDT', 'limit', 'buy', 0.5, 13, $params);
```
```go tab="Go"
params := map[string]interface{}{
    "stopLoss": map[string]interface{}{
        "triggerPrice": 12.34, // at what price it will trigger
        "price":        12.00, // if exchange supports, 'price' param would be limit price (for market orders, don't include this param)
    },
    "takeProfit": map[string]interface{}{
        // similar params here
    },
}
order, err := exchange.CreateOrder("SOL/USDT", "limit", "buy", 0.5, ccxt.WithCreateOrderPrice(13), ccxt.WithCreateOrderParams(params))
```
```csharp tab="C#"
var parameters = new Dictionary<string, object>() {
    { "stopLoss", new Dictionary<string, object>() {
        { "triggerPrice", 12.34 }, // at what price it will trigger
        { "price", 12.00 }, // if exchange supports, 'price' param would be limit price (for market orders, don't include this param)
    } },
    { "takeProfit", new Dictionary<string, object>() {
        // similar params here
    } },
};
var order = await exchange.CreateOrder("SOL/USDT", "limit", "buy", 0.5, 13, parameters);
```
```java tab="Java"
Map<String, Object> params = Map.of(
    "stopLoss", Map.of("triggerPrice", 12.34, "price", 12.00),
    "takeProfit", Map.of("triggerPrice", 15.00, "price", 15.50)
);
Order order = exchange.createOrder("SOL/USDT", "limit", "buy", 0.5, 13.0, params);
```


对于不支持附加止损和止盈的交易所，在提交入场订单后，您可以立即提交另一个订单（即使仓位可能尚未开启），在 `params` 中带上 `stopLossPrice/takeProfitPrice`（或 `triggerPrice` 和 `reduceOnly: true`），这样它仍然可以作为即将开启仓位的止损单使用（注意，此方法在某些交易所可能不适用）。

示例：

```
    symbol = 'ADA/USDT:USDT'
    main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
    tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
    sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
```

#### 追踪订单

**追踪**订单跟随开放仓位移动。通过为 `trailingPercent` 或 `trailingAmount` 提供浮点数参数来实现。

* 追踪订单持续以固定百分比或固定报价金额调整订单价格，跟随当前市场价格。
* 追踪订单在仓位朝某一方向移动时跟随，但不会在相反方向移动。
* 如果仓位价值上涨，追踪订单会随之变化，但如果仓位价值下跌，追踪订单保持不变直到订单被执行。
* 追踪订单可以在开仓后独立下单。
* 根据交易所不同，通过填写 `trailingPercent` 或 `trailingAmount` 参数来实现。
* 如有需要，价格参数可用作 `trailingTriggerPrice`，类型参数可用于区分限价和市价追踪订单。

*并非所有交易所都支持。*

*注意：此功能仍在统一化过程中，尚未完成*


```javascript tab="JavaScript"
symbol = 'BTC/USDT:USDT';
type = 'market';
side = 'sell';
amount = 1.0;
price = undefined;
const params = {
    'trailingPercent': 1.0, // percentage away from the current market price 1.0 is equal to 1%
    // 'trailingAmount': 100.0, // quote amount away from the current market price
    // 'trailingTriggerPrice': 44500.0, // the price to trigger activating a trailing stop order
    // 'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```
```python tab="Python"
symbol = 'BTC/USDT:USDT'
type = 'market'
side = 'sell'
amount = 1.0
price = None
params = {
    'trailingPercent': 1.0, # percentage away from the current market price 1.0 is equal to 1%
    # 'trailingAmount': 100.0, # quote amount away from the current market price
    # 'trailingTriggerPrice': 44500.0, # the price to trigger activating a trailing stop order
    # 'reduceOnly': True, # set to True if you want to close a position, set to False if you want to open a new position
}
order = exchange.create_order (symbol, type, side, amount, price, params)
```
```php tab="PHP"
$symbol = 'BTC/USDT:USDT';
$type = 'market';
$side = 'sell';
$amount = 1.0;
$price = null;
$params = {
    'trailingPercent': 1.0, // percentage away from the current market price 1.0 is equal to 1%
    // 'trailingAmount': 100.0, // quote amount away from the current market price
    // 'trailingTriggerPrice': 44500.0, // the price to trigger activating a trailing stop order
    // 'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```
```go tab="Go"
symbol := "BTC/USDT:USDT"
typeVar := "market"
side := "sell"
amount := 1.0
params := map[string]interface{}{
    "trailingPercent": 1.0, // percentage away from the current market price 1.0 is equal to 1%
    // "trailingAmount": 100.0, // quote amount away from the current market price
    // "trailingTriggerPrice": 44500.0, // the price to trigger activating a trailing stop order
    // "reduceOnly": true, // set to true if you want to close a position, set to false if you want to open a new position
}
order, err := exchange.CreateOrder(symbol, typeVar, side, amount, ccxt.WithCreateOrderParams(params))
```
```csharp tab="C#"
var symbol = "BTC/USDT:USDT";
var type = "market";
var side = "sell";
var amount = 1.0;
var parameters = new Dictionary<string, object>() {
    { "trailingPercent", 1.0 }, // percentage away from the current market price 1.0 is equal to 1%
    // { "trailingAmount", 100.0 }, // quote amount away from the current market price
    // { "trailingTriggerPrice", 44500.0 }, // the price to trigger activating a trailing stop order
    // { "reduceOnly", true }, // set to true if you want to close a position, set to false if you want to open a new position
};
var order = await exchange.CreateOrder(symbol, type, side, amount, null, parameters);
```
```java tab="Java"
Map<String, Object> params = Map.of("trailingPercent", 1.0);
Order order = exchange.createOrder("BTC/USDT:USDT", "market", "sell", 1.0, null, params);
```


#### 自定义订单参数

某些交易所允许您为订单指定可选参数。您可以使用 `params` 参数向统一 API 调用传递可选参数并通过关联数组覆盖查询。所有自定义参数都是交易所特定的，自然无法互换，不要期望某个交易所的自定义参数在另一个交易所也能使用。


```javascript tab="JavaScript"
// use a custom order type
bitfinex.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })
```
```python tab="Python"
# add a custom order flag
kraken.create_market_buy_order('BTC/USD', 1, {'trading_agreement': 'agree'})
```
```php tab="PHP"
// add custom user id to your order
$hitbtc->create_order ('BTC/USD', 'limit', 'buy', 1, 3000, array ('clientOrderId' => '123'));
```
```go tab="Go"
// use a custom order type
order, err := bitfinex.CreateLimitSellOrder("BTC/USD", 1, 10, ccxt.WithCreateLimitSellOrderParams(map[string]interface{}{
    "type": "trailing-stop",
}))
```
```csharp tab="C#"
// use a custom order type
var order = await bitfinex.CreateLimitSellOrder("BTC/USD", 1, 10, new Dictionary<string, object>() {
    { "type", "trailing-stop" },
});
```
```java tab="Java"
Order order = exchange.createOrder("BTC/USDT", "limit", "sell", 1.0, 10.0, Map.of("type", "trailing-stop"));
```


##### 用户自定义 `clientOrderId`

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

用户可以在下单时通过 `params` 指定自定义 `clientOrderId` 字段。使用 `clientOrderId` 可以之后区分自己的订单。目前仅适用于支持 `clientOrderId` 的交易所。对于不支持它的交易所，提供 `clientOrderId` 时会抛出错误，或者会忽略它并将 `clientOrderId` 设置为 `undefined/None/null`。


```javascript tab="JavaScript"
exchange.createOrder (symbol, type, side, amount, price, {
    'clientOrderId': 'Hello',
})
```
```python tab="Python"
exchange.create_order(symbol, type, side, amount, price, {
    'clientOrderId': 'World',
})
```
```php tab="PHP"
$exchange->create_order($symbol, $type, $side, $amount, $price, array(
    'clientOrderId' => 'Foobar',
))
```
```go tab="Go"
exchange.CreateOrder(symbol, typeVar, side, amount, ccxt.WithCreateOrderPrice(price), ccxt.WithCreateOrderParams(map[string]interface{}{
    "clientOrderId": "Hello",
}))
```
```csharp tab="C#"
await exchange.CreateOrder(symbol, type, side, amount, price, new Dictionary<string, object>() {
    { "clientOrderId", "Foobar" },
});
```
```java tab="Java"
Order order = exchange.createOrder("BTC/USDT", "limit", "buy", 0.001, 50000.0,
    Map.of("clientOrderId", "Hello"));
```


##### 订单的对冲模式

如果交易所支持 `hedged` 订单的[功能](#features)，用户可以在 `createOrder` 中传入 `params['hedged'] = true` 以开启 `hedged` 仓位，而非默认的 `one-way` 模式订单。但是，如果交易所支持 `.has['setPositionMode']`，则这些交易所可能不支持直接通过 `createOrder` 传入 `hedged` 参数，在这种交易所上，您需要先使用 [setPositionMode()](#set-position-mode) 更改账户模式，然后运行 `createOrder`（不带 `hedged` 参数），它将默认下对冲订单。


### 修改订单

要修改订单，可以使用 `editOrder` 方法

```javascript
editOrder (id, symbol, type, side, amount, price = undefined, params = {})
```

参数

- **id**（String）*必填* 订单 id（例如 `1645807945000`）
- **symbol**（String）*必填* CCXT 统一市场符号
- **side**（String）*必填* 订单方向。
  **统一方向：**
  - `buy` 付出报价货币，获得基础货币；例如，买入 `BTC/USD` 意味着您将用美元换取比特币。
  - `sell` 付出基础货币，获得报价货币；例如，卖出 `BTC/USD` 意味着您将用比特币换取美元。
- **type**（String）*必填* 订单类型
  **统一类型：**
  - [`market`](#market-orders) 某些交易所不允许，详见[其文档](#exchanges)
  - [`limit`](#limit-orders)
  - 非统一类型请参见 #custom-order-params 和 #other-order-types
- **amount**（Number）*必填* 您想交易的货币数量，通常（但不总是）以交易对符号的基础货币为单位（某些交易所的单位取决于订单方向：详见其 API 文档。）
- **price**（Float）订单将以报价货币为单位的价格成交（市价单中忽略）
- **params**（Dictionary）交易所 API 端点特定的额外参数（例如 `{"settle": "usdt"}`）

返回值

- 一个[订单结构](#order-structure)

### 取消订单

要取消已有订单，请使用

- `cancelOrder ()` 取消单个订单
- `cancelOrders ()` 取消多个订单
- `cancelAllOrders ()` 取消所有未成交订单
- `cancelAllOrdersAfter ()` 在给定超时后取消所有未成交订单

```javascript
cancelOrder (id, symbol = undefined, params = {})
```

参数

- **id**（String）*必填* 订单 id（例如 `1645807945000`）
- **symbol**（String）CCXT 统一市场符号，在某些交易所**必填**（例如 `"BTC/USDT"`）
- **params**（Dictionary）交易所 API 端点特定的额外参数（例如 `{"settle": "usdt"}`）

返回值

- 一个[订单结构](#order-structure)

```javascript
cancelOrders (ids, symbol = undefined, params = {})
```

参数

- **ids**（\[String\]）*必填* 订单 id 列表（例如 `1645807945000`）
- **symbol**（String）CCXT 统一市场符号，在某些交易所**必填**（例如 `"BTC/USDT"`）
- **params**（Dictionary）交易所 API 端点特定的额外参数（例如 `{"settle": "usdt"}`）

返回值

- 一个[订单结构](#order-structure)数组

```javascript
async cancelAllOrders (symbol = undefined, params = {})
```

参数

- **symbol**（String）CCXT 统一市场符号，在某些交易所**必填**（例如 `"BTC/USDT"`）
- **params**（Dictionary）交易所 API 端点特定的额外参数（例如 `{"settle": "usdt"}`）

返回值

- 一个[订单结构](#order-structure)数组

```javascript
async cancelAllOrdersAfter (timeout, params = {})
```

参数

- **timeout**（number）倒计时时间，以毫秒为单位，在某些交易所**必填**，0 表示取消计时器（例如 ``10``\ ）
- **params**（Dictionary）交易所 API 端点特定的额外参数（例如 ``{"type": "spot"}``\ ）

返回值

- 一个对象

#### 取消订单时的异常

`cancelOrder()` 通常仅用于未成交订单。然而，可能会发生在您的取消请求到达之前，您的订单已经执行（成交并关闭）的情况，因此取消请求可能会命中已关闭的订单。

取消请求也可能抛出 `OperationFailed`，表示订单可能已取消或未取消，以及是否需要重试。连续调用 `cancelOrder()` 也可能命中已取消的订单。

因此，`cancelOrder()` 在以下情况下可能抛出 `OrderNotFound` 异常：
- 取消已关闭的订单
- 取消已取消的订单

## 我的成交记录

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### 订单与成交记录的关系

成交记录也常称为 `成交`。每笔成交都是订单执行的结果。请注意，订单和成交记录是一对多的关系：一个订单的执行可能产生多笔成交。然而，当一个订单与另一个相对订单匹配时，这对匹配订单产生一笔成交。因此，当一个订单匹配多个相对订单时，会产生多笔成交，每对匹配订单产生一笔成交。

简而言之，一个订单可以包含*一笔或多笔*成交。换句话说，一个订单可以被一笔或多笔成交*填满*。

例如，订单簿可以有以下订单（无论是何种交易符号或交易对）：

```text
    | price  | amount
----|----------------
  a |  1.200 | 200
  s |  1.100 | 300
  k |  0.900 | 100
----|----------------
  b |  0.800 | 100
  i |  0.700 | 200
  d |  0.500 | 100
```

上面所有具体数字并非真实数据，仅用于说明订单和成交记录之间的一般关系。

一位卖家决定在卖价侧以 0.700 的价格和 150 的数量下一个卖出限价单。

```text
    | price  | amount
----|----------------  ↓
  a |  1.200 | 200     ↓
  s |  1.100 | 300     ↓
  k |  0.900 | 100     ↓
----|----------------  ↓
  b |  0.800 | 100     ↓ sell 150 for 0.700
  i |  0.700 | 200     --------------------
  d |  0.500 | 100
```

由于即将到来的卖出（要价）订单的价格和数量覆盖了不止一个买单（订单 `b` 和 `i`），以下事件序列通常在交易所引擎内非常快速地发生，但不是立即发生：

1. 订单 `b` 与即将到来的卖出订单匹配，因为它们的价格相交。它们的量*"相互抵消"*，因此买方以 0.800 的价格获得 100。卖方（要价方）的卖单以 0.800 的价格被买单量 100 部分成交。请注意，对于订单的已成交部分，卖方获得的价格比最初要求的更好。他最初要求至少 0.7，却获得了 0.8，对卖方来说更为有利。大多数传统交易所以可用的最佳价格成交订单。

2. 针对传入的卖单，为订单 `b` 生成了一笔成交记录。该成交记录*"完全成交"*了整个订单 `b`，并成交了卖单的大部分。每对匹配的订单会生成一笔成交记录，无论成交量是完全还是部分成交。在此示例中，卖方数量（100）完全成交了订单 `b`（关闭订单 `b`），并且也部分成交了卖单（使其仍保留在订单簿中）。

3. 订单 `b` 现在状态为 `closed`，成交量为 100。它包含一笔针对卖单的成交记录。卖单状态为 `open`，成交量为 100。它包含一笔针对订单 `b` 的成交记录。因此，目前每个订单只有一笔成交记录。

4. 传入的卖单已成交数量为 100，仍需从其初始总量 150 中成交剩余的 50。

此时订单簿的中间状态如下（订单 `b` 已 `closed`，不再出现在订单簿中）：

```text
    | price  | amount
----|----------------  ↓
  a |  1.200 | 200     ↓
  s |  1.100 | 300     ↓
  k |  0.900 | 100     ↓
----|----------------  ↓ sell remaining 50 for 0.700
  i |  0.700 | 200     -----------------------------
  d |  0.500 | 100
```

5. 订单 `i` 与传入卖单的剩余部分匹配，因为它们的价格相交。买单 `i` 的数量为 200，完全消化了剩余的卖单数量 50。订单 `i` 被部分成交 50，但其剩余量（即剩余的 150）将继续保留在订单簿中。然而，卖单在第二次匹配中被完全成交。

6. 针对传入的卖单，为订单 `i` 生成了一笔成交记录。该成交记录部分成交了订单 `i`，并完成了卖单的全部成交。同样，这只是一对匹配订单的一笔成交记录。

7. 订单 `i` 现在状态为 `open`，成交数量为 50，剩余数量为 150。它包含一笔针对卖单的成交记录。卖单现在状态为 `closed`，已完全成交其初始总量 150。但它包含两笔成交记录，第一笔针对订单 `b`，第二笔针对订单 `i`。因此，每个订单可以有一笔或多笔成交记录，具体取决于交易所撮合引擎如何匹配它们的成交量。

上述操作完成后，更新后的订单簿将如下所示。

```text
    | price  | amount
----|----------------
  a |  1.200 | 200
  s |  1.100 | 300
  k |  0.900 | 100
----|----------------
  i |  0.700 | 150
  d |  0.500 | 100
```

请注意，订单 `b` 已消失，卖单也不在其中。所有已关闭和完全成交的订单都会从订单簿中消失。订单 `i` 被部分成交，仍有剩余量且状态为 `open`，因此仍然存在。

### 个人成交记录

大多数统一方法将返回单个对象或对象的普通数组（列表）（成交记录）。然而，很少有交易所（如果有的话）会一次性返回所有成交记录。通常，它们的 API 会将输出限制在一定数量的最新对象。**您无法仅通过一次调用获取从最初到现在的所有对象**。实际上，很少有交易所会容忍或允许这样做。

与其他所有用于获取历史数据的统一方法一样，`fetchMyTrades` 方法接受一个 `since` 参数用于[基于日期的分页](#date-based-pagination)。与 CCXT 库中所有其他统一方法一样，`fetchMyTrades` 的 `since` 参数必须是**以毫秒为单位的整数时间戳**。

要获取历史成交记录，用户需要分批或"分页"遍历数据。分页通常意味着在循环中*"逐一获取数据片段"*。

在许多情况下，交易所的 API 需要提供 `symbol` 参数，因此您必须遍历所有交易对才能获取所有成交记录。如果缺少 `symbol` 且交易所需要它，则 CCXT 将抛出 `ArgumentsRequired` 异常以向用户发出需求信号。然后必须指定 `symbol`。其中一种方法是通过查看非零余额以及交易记录（提款和存款）从所有交易对列表中筛选相关交易对。此外，交易所将对您可以追溯多久有时间限制。

在大多数情况下，用户**需要使用至少某种类型的[分页](#pagination)**才能持续获得预期结果。


```javascript tab="JavaScript"
// fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchMyTrades']) {
    const trades = await exchange.fetchMyTrades (symbol, since, limit, params)
}
```
```python tab="Python"
# fetch_my_trades(symbol=None, since=None, limit=None, params={})

if exchange.has['fetchMyTrades']:
    exchange.fetch_my_trades(symbol=None, since=None, limit=None, params={})
```
```php tab="PHP"
// fetch_my_trades($symbol = null, $since = null, $limit = null, $params = array())

if ($exchange->has['fetchMyTrades']) {
    $trades = $exchange->fetch_my_trades($symbol, $since, $limit, $params);
}
```
```go tab="Go"
if exchange.Has["fetchMyTrades"] == true {
    trades, err := exchange.FetchMyTrades(ccxt.WithFetchMyTradesSymbol("BTC/USDT"), ccxt.WithFetchMyTradesLimit(20))
    if err != nil {
        fmt.Println(err)
        return
    }
    for _, t := range trades {
        fmt.Println(t.Datetime, t.Side, t.Amount, "@", t.Price)
    }
}
```
```csharp tab="C#"
var myTrades = await exchange.FetchMyTrades("BTC/USDT", null, 20);
foreach (var t in myTrades)
{
    Console.WriteLine(t.datetime + " " + t.side + " " + t.amount + " @ " + t.price);
}
```
```java tab="Java"
List<Trade> myTrades = exchange.fetchMyTrades("BTC/USDT", null, 20L, null);
for (Trade t : myTrades) {
    System.out.println(t.datetime + " " + t.side + " " + t.amount + " @ " + t.price);
}
```


返回成交记录的有序数组 `[]`（最新成交记录在最后）。

#### 成交记录结构

成交记录表示一种货币与另一种货币之间的交换，不同于[交易记录](#transaction-structure)，后者表示特定代币的转账。

```javascript
{
    'info':         { ... },                    // the original decoded JSON as is
    'id':           '12345-67890:09876/54321',  // string trade id
    'timestamp':    1502962946216,              // Unix timestamp in milliseconds
    'datetime':     '2017-08-17 12:42:48.000',  // ISO8601 datetime with milliseconds
    'symbol':       'ETH/BTC',                  // symbol
    'order':        '12345-67890:09876/54321',  // string order id or undefined/None/null
    'type':         'limit',                    // order type, 'market', 'limit' or undefined/None/null
    'side':         'buy',                      // direction of the trade, 'buy' or 'sell'
    'takerOrMaker': 'taker',                    // string, 'taker' or 'maker'
    'price':        0.06917684,                 // float price in quote currency
    'amount':       1.5,                        // amount of base currency
    'cost':         0.10376526,                 // total cost, `price * amount`,
    'fee':          {                           // provided by exchange or calculated by ccxt
        'cost':  0.0015,                        // float
        'currency': 'ETH',                      // usually base currency for buys, quote currency for sells
        'rate': 0.002,                          // the fee rate (if available)
    },
    'fees': [                                   // an array of fees if paid in multiple currencies
        {                                       // if provided by exchange or calculated by ccxt
            'cost':  0.0015,                    // float
            'currency': 'ETH',                  // usually base currency for buys, quote currency for sells
            'rate': 0.002,                      // the fee rate (if available)
        },
    ],
}
```

- `'fee'` 和 `'fees'` 信息的工作仍在进行中，手续费信息可能部分或完全缺失，具体取决于交易所的功能。
- `fee` 货币可能与两种交易货币不同（例如，ETH/BTC 订单的手续费以 USD 计算）。
- 成交记录的 `cost` 表示 `amount * price`。它是成交的总*报价*量（而 `amount` 是*基础*量）。`cost` 字段本身主要是为了方便，可以从其他字段推导出来。
- 成交记录的 `cost` 是一个*"总"*值。即手续费前的价值，手续费需在此基础上另行计算。

### 按订单 ID 查询成交记录

```javascript tab="JavaScript"
// fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchOrderTrades']) {
    const trades = await exchange.fetchOrderTrades (orderId, symbol, since, limit, params)
}
```
```python tab="Python"
# fetch_order_trades(id, symbol=None, since=None, limit=None, params={})

if exchange.has['fetchOrderTrades']:
    exchange.fetch_order_trades(order_id, symbol=None, since=None, limit=None, params={})
```
```php tab="PHP"
// fetch_order_trades ($id, $symbol = null, $since = null, $limit = null, $params = array())

if ($exchange->has['fetchOrderTrades']) {
    $trades = $exchange->fetch_order_trades($order_id, $symbol, $since, $limit, $params);
}
```
```go tab="Go"
if exchange.Has["fetchOrderTrades"] == true {
    trades, err := exchange.FetchOrderTrades(orderId, ccxt.WithFetchOrderTradesSymbol(symbol))
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(trades)
}
```
```csharp tab="C#"
if ((bool)exchange.has["fetchOrderTrades"])
{
    var trades = await exchange.FetchOrderTrades(orderId, symbol);
    Console.WriteLine(trades.Count);
}
```
```java tab="Java"
Object trades = exchange.fetchOrderTrades(orderId, symbol).join();
```


## 账本

账本就是变更历史，是用户进行的操作或以任何方式改变用户余额的操作记录，即用户所有账户中所有资金进出的历史记录，包括

- 存款和提款（资金）
- 成交或订单结果导致的资金流入和流出
- 交易手续费
- 账户间的转账
- 返佣、回扣及其他需要记账的事件类型

账本条目的数据可以通过以下方式获取

- `fetchLedgerEntry ()` 获取单条账本条目
- `fetchLedger ( code )` 获取同一货币的多条账本条目
- `fetchLedger ()` 获取所有账本条目

```javascript
fetchLedgerEntry (id, code = undefined, params = {})
```

参数

- **id** (String) *必填* 账本条目 ID
- **code** (String) 统一 CCXT 货币代码，必填（例如 `"USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"type": "deposit"}`）

返回值

- 一个[账本条目结构](#ledger-entry-structure)

```javascript
async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **code** (String) 统一 CCXT 货币代码；如果不支持一次性获取所有资产的所有账本条目，则为*必填*（例如 `"USDT"`）
- **since** (Integer) 检索提款的最早时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要检索的[账本条目结构](#ledger-entry-structure)数量（例如 `5`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- [账本条目结构](#ledger-entry-structure)的数组

### 账本条目结构

```javascript
{
    'id': 'hqfl-f125f9l2c9',                // string id of the ledger entry, e.g. an order id
    'direction': 'out',                     // or 'in'
    'account': '06d4ab58-dfcd-468a',        // string id of the account if any
    'referenceId': 'bf7a-d4441fb3fd31',     // string id of the trade, transaction, etc...
    'referenceAccount': '3146-4286-bb71',   // string id of the opposite account (if any)
    'type': 'trade',                        // string, reference type, see below
    'currency': 'BTC',                      // string, unified currency code, 'ETH', 'USDT'...
    'amount': 123.45,                       // absolute number, float (does not include the fee)
    'timestamp': 1544582941735,             // milliseconds since epoch time in UTC
    'datetime': "2018-12-12T02:49:01.735Z", // string of timestamp, ISO8601
    'before': 0,                            // amount of currency on balance before
    'after': 0,                             // amount of currency on balance after
    'status': 'ok',                         // 'ok, 'pending', 'canceled'
    'fee': {                                // object or undefined
        'cost': 54.321,                     // absolute number on top of the amount
        'currency': 'ETH',                  // string, unified currency code, 'ETH', 'USDT'...
    },
    'info': { ... },                        // raw ledger entry as is from the exchange
}
```

#### 账本条目结构说明

账本条目的类型是与其关联的操作类型。如果金额来源于卖单，则它与相应的成交类型账本条目关联，`referenceId` 将包含关联的成交 ID（如果相关交易所提供的话）。如果金额因提款而减少，则它与相应的交易记录关联。

- `trade`
- `transaction`
- `fee`
- `rebate`
- `cashback`
- `referral`
- `transfer`
- `airdrop`
- `whatever`
- ...

`referenceId` 字段保存通过向账本添加新条目而注册的相应事件的 ID。

`status` 字段用于支持在账本中包含待处理和已取消变更的交易所。账本自然地代表已发生的实际变更，因此在大多数情况下状态为 `'ok'`。

账本条目类型可以与常规成交、资金交易（存款或提款）或同一用户两个账户之间的内部 `transfer` 关联。如果账本条目与内部转账关联，`account` 字段将包含被相关账本条目更改的账户 ID。`referenceAccount` 字段将包含根据 `direction`（`'in'` 或 `'out'`）资金转入/转出的对方账户 ID。

## 存款

为了将加密货币资金存入交易所，您必须使用 `fetchDepositAddress` 从交易所获取您想存入货币的地址。然后，您可以使用指定的货币和地址调用 `withdraw` 方法。

要在交易所存入法定货币，您可以使用从 `fetchDepositMethodId` 方法获取的数据调用 `deposit` 方法。
*此存款功能目前仅在 coinbase 上支持，欢迎报告您发现的任何问题*

- `deposit ()`

```javascript
deposit (id, code = undefined, params = {})
```

参数

- **id** (String) *必填* 存款 ID
- **code** (String) 法定货币代码，必填（例如 `"USD"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"account": "fiat"}`）

返回值

- 一个[交易记录结构](#transaction-structure)

- `fetchDepositMethodId ()`

```javascript
fetchDepositMethodId (id, params = {})
```

参数

- **id** (String) *必填* 存款 ID
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"account": "fiat"}`）

返回值

- 一个[存款 ID 结构](#deposit-id-structure)

- `fetchDepositMethodIds ()`

```javascript
fetchDepositMethodIds (params = {})
```

参数

- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"account": "fiat"}`）

返回值

- [存款 ID 结构](#deposit-id-structure)的数组

### 存款 ID 结构

从 `fetchDepositMethodId`、`fetchDepositMethodIds` 返回的存款 ID 结构如下所示：

```javascript
{
    'info': {},                 // raw unparsed data as returned from the exchange
    'id': '75ab52ff-f25t',      // the deposit id
    'currency': 'USD',          // fiat currency
    'verified': true,           // whether funding through this id is verified or not
    'tag': 'from credit card',  // tag / memo / name of funding source
}
```

可以使用以下方式检索账户存款数据

- `fetchDeposit ()` 获取单笔存款
- `fetchDeposits ( code )` 获取同一货币的多笔存款
- `fetchDeposits ()` 获取账户的所有存款

```javascript
fetchDeposit (id, code = undefined, params = {})
```

参数

- **id** (String) *必填* 存款 ID
- **code** (String) 统一 CCXT 货币代码，必填（例如 `"USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"network": "TRX"}`）

返回值

- 一个[交易记录结构](#transaction-structure)

```javascript
fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **code** (String) 统一 CCXT 货币代码（例如 `"USDT"`）
- **since** (Integer) 检索存款的最早时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要检索的[交易记录结构](#transaction-structure)数量（例如 `5`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- [交易记录结构](#transaction-structure)的数组

## 提款

`withdraw` 方法可用于从账户提取资金

某些交易所要求通过 2FA（双因素认证）方式手动批准每笔提款。为了批准您的提款，您通常需要点击邮件收件箱中的秘密链接，或在其网站上输入 Google Authenticator 代码或 Authy 代码，以验证提款交易是有意发起的。

在某些情况下，您还可以使用提款 ID 稍后检查提款状态（是否成功），并在交易所支持的情况下提交 2FA 确认码。有关详细信息，请参阅[其文档](#exchanges)。

```javascript tab="JavaScript"
withdraw (code, amount, address, tag = undefined, params = {})
```
```python tab="Python"
withdraw(code, amount, address, tag=None, params={})
```
```php tab="PHP"
withdraw ($code, $amount, $address, $tag = null, $params = array ())
```
```go tab="Go"
func (this *Binance) Withdraw(code string, amount float64, address string, options ...ccxt.WithdrawOptions) (ccxt.Transaction, error)
```
```csharp tab="C#"
public async Task<Transaction> Withdraw(string code, double amount, string address, string tag = null, Dictionary<string, object> parameters = null)
```
```java tab="Java"
Transaction tx = exchange.withdraw("BTC", 0.5, "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", null, null);
```


参数

- **code** (String) *必填* 统一 CCXT 货币代码（例如 `"USDT"`）
- **amount** (Float) *必填* 提现金额（例如 `20`）
- **address** (String) *必填* 提现目标地址（例如 `"TEY6qjnKDyyq5jDc3DJizWLCdUySrpQ4yp"`）
- **tag** (String) 某些网络必填（例如 `"52055"`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"network": "TRX"}`）

返回

- 一个 [transaction structure](#transaction-structure)

---

可通过以下方法获取账户提现记录

- `fetchWithdrawal ()` 获取单笔提现
- `fetchWithdrawals ( code )` 获取同一币种的多笔提现
- `fetchWithdrawals ()` 获取账户所有提现

```javascript
fetchWithdrawal (id, code = undefined, params = {})
```

参数

- **id** (String) *必填* 提现 ID
- **code** (String) 统一 CCXT 货币代码（例如 `"USDT"`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"network": "TRX"}`）

```javascript
fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **code** (String) 统一 CCXT 货币代码（例如 `"USDT"`）
- **since** (Integer) 最早提现时间的时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要获取的 [transaction structures](#transaction-structure) 数量（例如 `5`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个 [transaction structures](#transaction-structure) 数组

### 充提网络

也可以将参数作为第四个参数传入，带或不带 tag 均可

```javascript tab="JavaScript"
withdraw (code, amount, address, { tag, network: 'ETH' })
```
```python tab="Python"
withdraw(code, amount, address, { 'tag': tag, 'network': 'ETH' })
```
```php tab="PHP"
withdraw ($code, $amount, $address, array( 'tag' => tag, 'network' -> 'ETH' ));
```
```go tab="Go"
exchange.Withdraw(code, amount, address, ccxt.WithWithdrawTag(tag), ccxt.WithWithdrawParams(map[string]interface{}{"network": "ETH"}))
```
```csharp tab="C#"
await exchange.Withdraw(code, amount, address, tag, new Dictionary<string, object>() { { "network", "ETH" } });
```
```java tab="Java"
Transaction tx = exchange.withdraw("USDT", 100.0, "0x1234...", null, Map.of("network", "ETH"));
```


以下 `network` 别名支持在多条链上提现加密货币

| 货币 | 网络 |
|:---:|:---:|
| ETH  | ERC20 |
| TRX  | TRC20 |
| BSC  | BEP20 |
| BNB  | BEP2  |
| HT   | HECO  |
| OMNI | OMNI  |

您可以设置 `exchange.withdraw ('USDT', 100, 'TVJ1fwyJ1a8JbtUxZ8Km95sDFN9jhLxJ2D', { 'network': 'TRX' })` 以在 TRON 链上提现 USDT，或设置 `'BSC'` 以在 Binance Smart Chain 上提现 USDT。上表中 BSC 和 BEP20 是等价别名，因此使用哪个都可以，效果相同。

### Transaction Structure

交易（Transaction）表示特定币种的转移，不同于[交易（Trade）](#trade-structure)——后者表示一种货币换另一种货币。

- *deposit structure*
- *withdrawal structure*

```javascript
{
    'info':      { ... },    // the JSON response from the exchange as is
    'id':       '123456',    // exchange-specific transaction id, string
    'txid':     '0x68bfb29821c50ca35ef3762f887fd3211e4405aba1a94e448a4f218b850358f0',
    'timestamp': 1534081184515,             // timestamp in milliseconds
    'datetime': '2018-08-12T13:39:44.515Z', // ISO8601 string of the timestamp
    'addressFrom': '0x38b1F8644ED1Dbd5DcAedb3610301Bf5fa640D6f', // sender
    'address':  '0x02b0a9b7b4cDe774af0f8e47cb4f1c2ccdEa0806', // "from" or "to"
    'addressTo': '0x304C68D441EF7EB0E2c056E836E8293BD28F8129', // receiver
    'tagFrom', '0xabcdef', // "tag" or "memo" or "payment_id" associated with the sender
    'tag':      '0xabcdef' // "tag" or "memo" or "payment_id" associated with the address
    'tagTo': '0xhijgklmn', // "tag" or "memo" or "payment_id" associated with the receiver
    'type':     'deposit',   // 'withdrawal' or 'transfer', string
    'amount':    1.2345,     // float (does not include the fee)
    'currency': 'ETH',       // a common unified currency code, string
    'status':   'pending',   // 'ok', 'failed', 'canceled', string
    'updated':   undefined,  // UTC timestamp of most recent status change in ms
    'comment':  'a comment or message defined by the user if any',
    'fee': {                 // the entire fee structure may be undefined
        'currency': 'ETH',   // a unified fee currency code
        'cost': 0.1234,      // float
        'rate': undefined,   // approximately, fee['cost'] / amount, float
    },
}
```

#### Transaction Structure 注意事项

- 如果相关交易所未指定交易双方，`addressFrom` 或 `addressTo` 可能为 `undefined/None/null`
- `address` 字段的语义因交易所而异。某些情况下它包含发送方地址，另一些情况下可能包含接收方地址。实际值取决于交易所。
- `updated` 字段是该资金操作（无论是 `withdrawal` 还是 `deposit`）最近一次状态变更的 UTC 毫秒时间戳。如果您需要追踪随时间的变化而非静态快照，该字段是必要的。例如，如果相关交易所对一笔交易同时报告 `created_at` 和 `confirmed_at`，则 `updated` 字段将取 `Math.max (created_at, confirmed_at)` 的值，即最近一次状态变更的时间戳。
- 在某些交易所特定情况下，`updated` 字段可能为 `undefined/None/null`。
- 如果交易所回复中未包含 `fee` 子结构，则该字段可能缺失。
- `comment` 字段可能为 `undefined/None/null`，否则将包含用户创建交易时定义的消息或备注。
- 处理 `tag` 和 `address` 时请务必谨慎。`tag` **不是您可以随意定义的字符串**！您不能在 `tag` 中发送用户消息和评论。`tag` 字段的目的是正确寻址您的钱包，因此必须准确无误。您只能使用从您所用交易所获取的 `tag`，否则您的交易可能永远无法到达目的地。
- `type` 字段可能为 `deposit/withdrawal`，在某些情况下（当交易所端点同时返回内部转账和区块链交易时，例如 `ccxt.coinlist`），也可能为 `transfer`。

### fetchDeposits 示例

```javascript tab="JavaScript"
// fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchDeposits']) {
    const deposits = await exchange.fetchDeposits (code, since, limit, params)
} else {
    throw new Error (exchange.id + ' does not have the fetchDeposits method')
}
```
```python tab="Python"
# fetch_deposits(code = None, since = None, limit = None, params = {})

if exchange.has['fetchDeposits']:
    deposits = exchange.fetch_deposits(code, since, limit, params)
else:
    raise Exception (exchange.id + ' does not have the fetch_deposits method')
```
```php tab="PHP"
// fetch_deposits ($code = null, $since = null, $limit = null, $params = {})

if ($exchange->has['fetchDeposits']) {
    $deposits = $exchange->fetch_deposits ($code, $since, $limit, $params);
} else {
    throw new Exception ($exchange->id . ' does not have the fetch_deposits method');
}
```
```go tab="Go"
if exchange.Has["fetchDeposits"] == true {
    deposits, err := exchange.FetchDeposits(ccxt.WithFetchDepositsCode(code))
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(deposits)
}
```
```csharp tab="C#"
if ((bool)exchange.has["fetchDeposits"])
{
    var deposits = await exchange.FetchDeposits(code);
    Console.WriteLine(deposits.Count);
}
```
```java tab="Java"
List<Transaction> deposits = exchange.fetchDeposits("BTC", null, null, null);
```


### fetchWithdrawals 示例


```javascript tab="JavaScript"
// fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchWithdrawals']) {
    const withdrawals = await exchange.fetchWithdrawals (code, since, limit, params)
} else {
    throw new Error (exchange.id + ' does not have the fetchWithdrawals method')
}
```
```python tab="Python"
# fetch_withdrawals(code = None, since = None, limit = None, params = {})

if exchange.has['fetchWithdrawals']:
    withdrawals = exchange.fetch_withdrawals(code, since, limit, params)
else:
    raise Exception (exchange.id + ' does not have the fetch_withdrawals method')
```
```php tab="PHP"
// fetch_withdrawals ($code = null, $since = null, $limit = null, $params = {})

if ($exchange->has['fetchWithdrawals']) {
    $withdrawals = $exchange->fetch_withdrawals ($code, $since, $limit, $params);
} else {
    throw new Exception ($exchange->id . ' does not have the fetch_withdrawals method');
}
```
```go tab="Go"
if exchange.Has["fetchWithdrawals"] == true {
    withdrawals, err := exchange.FetchWithdrawals(ccxt.WithFetchWithdrawalsCode(code))
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(withdrawals)
}
```
```csharp tab="C#"
if ((bool)exchange.has["fetchWithdrawals"])
{
    var withdrawals = await exchange.FetchWithdrawals(code);
    Console.WriteLine(withdrawals.Count);
}
```
```java tab="Java"
List<Transaction> withdrawals = exchange.fetchWithdrawals("BTC", null, null, null);
```


### fetchTransactions 示例


```javascript tab="JavaScript"
// fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchTransactions']) {
    const transactions = await exchange.fetchTransactions (code, since, limit, params)
} else {
    throw new Error (exchange.id + ' does not have the fetchTransactions method')
}
```
```python tab="Python"
# fetch_transactions(code = None, since = None, limit = None, params = {})

if exchange.has['fetchTransactions']:
    transactions = exchange.fetch_transactions(code, since, limit, params)
else:
    raise Exception (exchange.id + ' does not have the fetch_transactions method')
```
```php tab="PHP"
// fetch_transactions ($code = null, $since = null, $limit = null, $params = {})

if ($exchange->has['fetchTransactions']) {
    $transactions = $exchange->fetch_transactions ($code, $since, $limit, $params);
} else {
    throw new Exception ($exchange->id . ' does not have the fetch_transactions method');
}
```
```go tab="Go"
if exchange.Has["fetchTransactions"] == true {
    transactions, err := exchange.FetchTransactions(ccxt.WithFetchTransactionsCode(code))
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(transactions)
}
```
```csharp tab="C#"
if ((bool)exchange.has["fetchTransactions"])
{
    var transactions = await exchange.FetchTransactions(code);
    Console.WriteLine(transactions.Count);
}
```
```java tab="Java"
List<Transaction> transactions = exchange.fetchTransactions("BTC", null, null, null);
```


## 充值地址

充值地址可以是此前在交易所已创建的地址，也可以按需创建。要了解支持哪种方式，请检查 `exchange.has['fetchDepositAddress']` 和 `exchange.has['createDepositAddress']` 属性。

```javascript
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})
```

参数

- **code** (String) *必填* 统一 CCXT 货币代码（例如 `"USDT"`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个 [address structure](#address-structure)

---

某些交易所还可能提供一次性获取多个或全部充值地址的方法。

```javascript
fetchDepositAddresses (codes = undefined, params = {})
```

参数

- **code** (\[String\]) 统一 CCXT 货币代码数组，是否必填取决于交易所（例如 `["USDT", "BTC"]`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个 [address structures](#address-structure) 数组

```javascript
fetchDepositAddressesByNetwork (code, params = {})
```

参数

- **code** (String) *必填* 统一 CCXT 货币代码（例如 `"USDT"`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个 [address structures](#address-structure) 数组

### Address Structure

`fetchDepositAddress`、`fetchDepositAddresses`、`fetchDepositAddressesByNetwork` 和 `createDepositAddress` 返回的地址结构如下：

```javascript
{
    'info': response,       // raw unparsed data as returned from the exchange
    'currency': 'USDC',     // currency code
    'network': 'ERC20',     // a deposit/withdraw networks, ERC20, TRC20, BSC20 (see below)
    'address': '0x',        // blockchain address in terms of the requested currency and network
    'tag': undefined,       // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
}
```

对于某些货币，如 AEON、BTS、GXS、NXT、SBD、STEEM、STR、XEM、XLM、XMR、XRP，交易所通常需要额外的 `tag` 参数。其他货币的 `tag` 将设为 `undefined / None / null`。tag 是附加在提现交易上的备忘录、消息或支付 ID，对于这些货币是强制性的，用于标识接收方用户账户。

指定 `tag` 和 `address` 时请务必谨慎。`tag` **不是您可以随意定义的字符串**！您不能在 `tag` 中发送用户消息和评论。`tag` 字段的目的是正确寻址您的钱包，因此必须准确无误。您只能使用从您所用交易所获取的 `tag`，否则您的交易可能永远无法到达目的地。

**`network` 字段相对较新，在某些情况下（某些交易所）可能为 `undefined / None / null` 或完全缺失，但最终将在所有地方添加。该字段仍处于统一过程中。**

## 划转

`transfer` 方法在同一交易所的账户之间进行内部资金划转，可包括子账户或不同类型的账户（`spot`、`margin`、`future` 等）。如果某交易所在 CCXT 中被拆分为现货和合约两个类（例如 `binanceusdm`、`kucoinfutures` 等），则 `transferIn` 方法可用于将资金划入合约账户，`transferOut` 方法可用于将资金从合约账户划出。

```javascript
transfer (code, amount, fromAccount, toAccount, params = {})
```

参数

- **code** (String) 统一 CCXT 货币代码（例如 `"USDT"`）
- **amount** (Float) 划转金额（例如 `10.5`）
- **fromAccount** (String) 转出账户。
- **toAccount** (String) 转入账户。
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"endTime": 1645807945000}`）
- **params.symbol** (String) 向保证金账户划转或从保证金账户划出时的市场交易对（例如 `'BTC/USDT'`）

### 账户类型

`fromAccount` 和 `toAccount` 可接受交易所账户 ID 或以下统一值之一：

- `funding` *对于某些交易所，`funding` 和 `spot` 是同一账户*
- `main` *适用于支持子账户的某些交易所*
- `spot`
- `margin`
- `future`
- `swap`
- `lending`

您可以通过获取 `exchange.options['accountsByType']` 的键来查看所有账户类型。

某些交易所支持向电子邮件地址、电话号码或其他用户 ID 进行划转。

返回

- 一个 [transfer structure](#transfer-structure)

```javascript
transferIn (code, amount, params = {})
transferOut (code, amount, params = {})
```

参数

- **code** (String) 统一 CCXT 货币代码（例如 `"USDT"`）
- **amount** (Float) 划转金额（例如 `10.5`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个 [transfer structure](#transfer-structure)

```javascript
fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **code** (String) 统一 CCXT 货币代码（例如 `"USDT"`）
- **since** (Integer) 最早划转时间的时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要获取的 [transfer structures](#transfer-structure) 数量（例如 `5`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个 [transfer structures](#transfer-structure) 数组

```javascript
fetchTransfer (id, since = undefined, limit = undefined, params = {})
```

参数

- **id** (String) 划转 ID（例如 `"12345"`）
- **since** (Integer) 最早划转时间的时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要获取的 [transfer structures](#transfer-structure) 数量（例如 `5`）
- **params** (Dictionary) 交易所 API 端点的特定参数（例如 `{"endTime": 1645807945000}`）

返回

- 一个 [transfer structure](#transfer-structure)

### Transfer Structure

```javascript
{
    info: { ... },
    id: "93920432048",
    timestamp: 1646764072000,
    datetime: "2022-03-08T18:27:52.000Z",
    currency: "USDT",
    amount: 11.31,
    fromAccount: "spot",
    toAccount: "future",
    status: "ok"
}
```
## 手续费

**统一 CCXT API 的此部分正在开发中。**

手续费通常分为两类：

- 交易手续费。交易手续费是应付给交易所的金额，通常为成交量的百分比。
- 交易费用。充值和提现时应付给交易所的金额，以及底层加密货币交易费（tx fees）。

由于费率结构可能取决于用户实际交易的货币量，手续费可能因账户而异。处理账户特定手续费的方法：

```javascript
fetchTradingFee (symbol, params = {})
fetchTradingFees (params = {})
fetchDepositWithdrawFees (codes = undefined, params = {})
fetchDepositWithdrawFee (code, params = {})
```


手续费方法将返回统一的费率结构，该结构通常也出现在订单和交易中。费率结构是整个库中表示手续费信息的通用格式。费率结构通常以市场或货币为索引。

由于此功能仍在开发中，本节描述的部分或全部方法和信息在某些交易所可能缺失。

**请勿使用交易所实例的 `.fees` 属性，因为该属性通常包含预定义/硬编码的信息。实际手续费应仅从市场和货币中获取。**

**注意：此前我们使用 fetchTransactionFee(s) 来获取交易费用，该方法现已**弃用**，并已被 fetchDepositWithdrawFee(s) 替代。**

您可以调用 `fetchTradingFee` / `fetchTradingFees` 来获取交易手续费，调用 `fetchDepositWithdrawFee` / `fetchDepositWithdrawFees` 来获取充提款费用。

### 费用结构

订单、私人交易记录、交易流水和账本条目可能在其 `fee` 字段中包含以下信息：

```javascript
{
    'currency': 'BTC', // the unified fee currency code
    'rate': percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
    'cost': feePaid, // the fee cost (amount * fee rate)
}
```

### 费率表

```javascript
fetchTradingFees (params = {})
```

```javascript
{
    'withdraw': {
        'BTC': 0.00001,
        'ETH': 0.001,
        'LTC': 0.0003,
    },
    'deposit': {
        'BTC': 0,
    },
    'info': { ... },
}
```

```javascript
fetchDepositWithdrawFees (codes, params = {})
```

```javascript
{
    'BTC': {
        'withdraw': { 'fee': 0.0005, 'percentage': false },
        'deposit': { 'fee': undefined, 'percentage': undefined },
        'networks': {
            'BTC': {
                'deposit': { 'fee': undefined, 'percentage': undefined },
                'withdraw': { 'fee': 0.0005, 'percentage': false }
            }
        },
        'info': { ... },
    },
    ...
}
```

### 交易手续费

交易手续费是市场的属性。大多数情况下，交易手续费通过 `fetchMarkets` 调用加载到市场数据中。但有时，交易所会通过不同的端点提供费用信息。

`calculateFee` 方法可用于预先计算将要支付的交易手续费（如果您拥有自定义交易费率/等级，例如 VIP-X，而非默认用户费率，请使用 `calculateFeeWithRate`）。**警告！此方法为实验性功能，不稳定，在某些情况下可能产生不正确的结果。** 请谨慎使用。实际费用可能与 `calculateFee` 返回的值不同，该方法仅用于预计算。请勿依赖预计算值，因为市场状况变化频繁。很难提前判断您的订单是否为市场吃单或挂单。

```javascript
    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
    calculateFeeWithRate (symbol, type, side, amount, price, takerOrMaker = 'taker', customRate, params = {})
```

`calculateFee` 方法将返回一个统一费用结构，其中包含指定参数订单的预计算费用。

获取交易费率的推荐方式是通过 [`fetchTradingFees`](#fee-schedule)。如果交易所不支持该方法，则可通过 `.markets` 属性访问，如下所示：

```javascript
exchange.markets['ETH/BTC']['taker'] // taker fee rate for ETH/BTC
exchange.markets['BTC/USD']['maker'] // maker fee rate for BTC/USD
```

存储在 `.markets` 属性下的市场数据可能包含额外的费用相关信息：

```javascript
{
    'taker': 0.002,   // taker fee rate, 0.002 = 0.2%
    'maker': 0.0016,  // maker fee rate, 0.0016 = 0.16%
    'percentage': true, // whether the taker and maker fee rate is a multiplier or a fixed flat amount
    'tierBased': false, // whether the fee depends on your trading tier (your trading volume)

    'tiers': {
        'taker': [
            [0, 0.0026], // tupple (trade volume in USD, taker fee) ordered by increasing volume
            [50000, 0.0024],
            ...
        ],
        'maker': [
            [0, 0.0016], // tupple (trade volume in USD, maker fee) ordered by increasing volume
            [50000, 0.0014],
            ...
        ],
    },
}
```

**警告！费用相关信息为实验性内容，不稳定，可能仅部分可用或完全不可用。**

当您向交易所提供流动性时（即您*做市*下单，由他人成交），需支付挂单费用（Maker Fee）。挂单费用通常低于吃单费用。类似地，当您从交易所*获取*流动性并成交他人订单时，需支付吃单费用（Taker Fee）。

费用可以为负值，这在衍生品交易所中非常常见。负费用意味着交易所将向用户支付返佣（奖励）。

此外，某些交易所可能不以交易量百分比的形式收取费用，请务必检查市场的 `percentage` 字段以确认。

#### 交易费率表

部分交易所提供获取交易费率表的端点，该功能映射至统一方法 `fetchTradingFees` 和 `fetchTradingFee`。

```javascript
fetchTradingFee (symbol, params = {})
```

参数

- **symbol** (String) *必填* 统一市场交易对符号（例如 `"BTC/USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"currency": "quote"}`）

返回值

- 一个[交易手续费结构](#trading-fee-structure)

```javascript
fetchTradingFees (params = {})
```

参数

- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"currency": "quote"}`）

返回值

- 一个[交易手续费结构](#trading-fee-structure)数组

#### 交易手续费结构

```javascript
{
    'ETH/BTC': {
        'maker': 0.001,
        'taker': 0.002,
        'info': { ... },
        'symbol': 'ETH/BTC',
    },
    'LTC/BTC': {
        'maker': 0.001,
        'taker': 0.002,
        'info': { ... },
        'symbol': 'LTC/BTC',
	},
}
```

### 交易流水费用

交易流水费用是货币（账户余额）的属性。

获取交易流水费率应通过 `.currencies` 属性进行。此方面尚未统一，可能会有所变化。

```javascript
exchange.currencies['ETH']['fee'] // tx/withdrawal fee rate for ETH
exchange.currencies['BTC']['fee'] // tx/withdrawal fee rate for BTC
```

#### 交易流水费率表

部分交易所提供获取交易流水费率表的端点，映射至以下统一方法：

- `fetchTransactionFee ()` 用于获取单个交易流水费率表
- `fetchTransactionFees ()` 用于获取所有交易流水费率表

```javascript
fetchTransactionFee (code, params = {})
```

参数

- **code** (String) *必填* 统一 CCXT 货币代码（必填）（例如 `"USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"type": "deposit"}`）
- **params.network** (String) 指定统一 CCXT 网络（例如 `{"network": "TRC20"}`）

返回值

- 一个[交易流水费用结构](#transaction-fee-structure)

```javascript
fetchTransactionFees (codes = undefined, params = {})
```

参数

- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"type": "deposit"}`）

返回值

- 一个[交易流水费用结构](#transaction-fee-structure)数组

#### 交易流水费用结构

```javascript
{
    'withdraw': {
        'BTC': 0.00001,
        'ETH': 0.001,
        'LTC': 0.0003,
    },
    'deposit': {
        'BTC': 0,
    },
    'info': { ... },
}
```

## 借款利息

* 仅限保证金交易

在现货或保证金市场进行杠杆交易时，必须以借款形式借入货币。所借货币须连同利息一并偿还。您可以使用 `fetchBorrowInterest` 方法获取已产生的利息金额。

```javascript
fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **code** (String) 利息对应货币的统一货币代码（例如 `"USDT"`）
- **symbol** (String) 逐仓保证金市场的交易对符号，若未定义，则返回全仓保证金市场的利息（例如 `"BTC/USDT:USDT"`）
- **since** (Integer) 获取利息记录的最早时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要获取的[借款利息结构](#borrow-interest-structure)数量（例如 `5`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个[借款利息结构](#borrow-interest-structure)数组

### 借款利息结构

```javascript
{
    info: { ... }                           // Unparsed exchange response
    symbol: 'BTC/USDT',                    // The market that the interest was accrued in
    currency: 'USDT',                       // The currency of the interest
    interest: 0.00004842,                   // The amount of interest that was charged
    interestRate: 0.0002,                   // The borrow interest rate
    amountBorrowed: 5.81,                   // The amount of currency that was borrowed
    marginMode: 'cross',                    // The margin mode of the borrowed amount
    timestamp: 1648699200000,               // The timestamp that the interest was charged
    datetime: '2022-03-31T04:00:00.000Z',   // The datetime that the interest was charged
}
```

## 借入与偿还保证金

*仅限保证金交易*

如需以保证金贷款形式借入或偿还货币，请使用 `borrowCrossMargin`、`borrowIsolatedMargin`、`repayCrossMargin` 和 `repayIsolatedMargin`。

```javascript
borrowCrossMargin (code, amount, params = {})
repayCrossMargin (code, amount, params = {})
```
参数

- **code** (String) *必填* 要借入或偿还的货币的统一货币代码（例如 `"USDT"`）
- **amount** (Float) *必填* 要借入或偿还的保证金金额（例如 `20.92`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"rate": 0.002}`）

返回值

- 一个[保证金贷款结构](#margin-loan-structure)

```javascript
borrowIsolatedMargin (symbol, code, amount, params = {})
repayIsolatedMargin (symbol, code, amount, params = {})
```
参数

- **symbol** (String) *必填* 逐仓保证金市场的统一 CCXT 交易对符号（例如 `"BTC/USDT"`）
- **code** (String) *必填* 要借入或偿还的货币的统一货币代码（例如 `"USDT"`）
- **amount** (Float) *必填* 要借入或偿还的保证金金额（例如 `20.92`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"rate": 0.002}`）

返回值

- 一个[保证金贷款结构](#margin-loan-structure)

### 保证金贷款结构

```javascript
{
    id: '1234323',                          // integer, the transaction id
    currency: 'USDT',                       // string, the currency that is borrowed or repaid
    amount: 5.81,                           // float, the amount of currency that was borrowed or repaid
    symbol: 'BTC/USDT:USDT',                // string, unified market symbol
    timestamp: 1648699200000,               // integer, the timestamp of when the transaction was made
    datetime: '2022-03-31T04:00:00.000Z',   // string, the datetime of when the transaction was made
    info: { ... }                           // Unparsed exchange response
}
```

## 保证金

*仅限保证金和合约交易*

注意：在本手册中，我们使用"抵押品"一词，表示当前保证金余额，请勿与"初始保证金"或"维持保证金"混淆：
- `抵押品（当前保证金余额）= 初始保证金 + 已实现及未实现盈亏`

例如，当您以 **50 美元**初始保证金开立逐仓仓位，且该仓位的未实现亏损为 **-15 美元**时，您仓位的**抵押品**将为 **35 美元**。但是，如果交易所提示该仓位的维持保证金要求（维持仓位开放所需）为 **25 美元**，则您的抵押品不应低于此值，否则仓位将被强制平仓。

如需增加、减少或设置已开立杠杆仓位中的保证金余额（抵押品），请分别使用 `addMargin`、`reduceMargin` 和 `setMargin`。这类似于调整已开立仓位的杠杆倍数。

使用这些方法的一些场景包括：
- 如果交易走势对您不利，您可以增加保证金，以降低强制平仓风险
- 如果您的交易盈利，您可以减少仓位的保证金余额并锁定利润

```javascript
addMargin (symbol, amount, params = {})
reduceMargin (symbol, amount, params = {})
setMargin (symbol, amount, params = {})
```


参数

- **symbol** (String) *必填* 统一 CCXT 交易对符号（例如 `"BTC/USDT:USDT"`）
- **amount** (String) *必填* 要增加或减少的保证金金额（例如 `20`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"leverage": 5}`）

返回值

- 一个[保证金结构](#margin-structure)

您可以使用以下方法获取通过上述方法或由交易所自动进行的保证金调整历史记录：

```javascript
fetchMarginAdjustmentHistory (symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **symbol** (String) 统一 CCXT 交易对符号（例如 `"BTC/USDT:USDT"`）
- **type** (String) "add" 或 "reduce"
- **since** (Integer) 获取保证金调整记录的最早时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要获取的[保证金结构](#margin-structure)数量（例如 `5`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"auto": true}`）

返回值

- 一个[保证金结构](#margin-structure)

### 保证金结构

```javascript
{
    info: { ... },
    type: 'add', // 'add', 'reduce', 'set'
    amount: 1, // amount added, reduced, or set
    total: 2,  // total margin or undefined if not specified by the exchange
    code: 'USDT',
    symbol: 'XRP/USDT:USDT',
    status: 'ok'
}
```

## 设置保证金模式

*仅限合约交易*

更新所使用的保证金类型，可选择以下之一：

- `cross` 使用一个账户在各市场间共享抵押品。必要时从总账户余额中划取保证金以避免强制平仓。
- `isolated` 每个市场在独立账户中保存抵押品

```javascript
setMarginMode (marginMode, symbol = undefined, params = {})
```

参数

- **marginMode** (String) *必填* 所使用的保证金类型
    **统一保证金类型：**
    - `"cross"`
    - `"isolated"`
- **symbol** (String) 统一 CCXT 交易对符号（例如 `"BTC/USDT:USDT"`）*在大多数交易所为必填*。当保证金模式不特定于某个市场时则非必填
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"leverage": 5}`）

返回值

- 交易所的响应结果

### 不支持 setMarginMode 的交易所

交易所可能不支持

```javascript
exchange.has['setMarginMode'] == false
```

的常见原因包括：

- 该交易所不提供杠杆交易
- 该交易所仅提供 `cross` 或 `isolated` 保证金模式之一，而非两者均提供
- 在使用 `createOrder` 时，必须通过 `params` 中的交易所特定参数来设置保证金模式

### setMarginMode 错误抑制说明

当请求将保证金模式设置为当前已设置的模式时，部分交易所 API 会返回错误响应（例如，当账户中 `BTC/USDT:USDT` 已设置为全仓保证金时，再次发送请求将 `BTC/USDT:USDT` 市场的保证金模式设置为 `cross`）。CCXT 不将此视为错误，因为最终结果符合用户预期，因此该错误被抑制，错误结果以对象形式返回。

例如：

```javascript
{ code: -4046, msg: 'No need to change margin type.' }
```

### marginMode 参数说明

某些方法允许使用 `marginMode` 参数，可设置为 `cross` 或 `isolated`。这对于在方法参数中直接指定 `marginMode`（用于现货保证金或合约市场）非常有用。若要指定现货保证金市场，您需要使用统一现货交易对符号或将市场类型设置为现货，同时将 marginMode 参数设置为 `cross` 或 `isolated`。

创建现货保证金订单：

*使用统一现货交易对符号，同时设置 marginMode 参数。*


```javascript tab="JavaScript"
const params = {
    'marginMode': 'isolated', // or 'cross'
}
const order = await exchange.createOrder ('ETH/USDT', 'market', 'buy', 0.1, 1500, params)
```
```python tab="Python"
params = {
    'marginMode': 'isolated', # or 'cross'
}
order = exchange.create_order ('ETH/USDT', 'market', 'buy', 0.1, 1500, params)
```
```php tab="PHP"
$params = {
    'marginMode': 'isolated', // or 'cross'
}
$order = $exchange->create_order ('ETH/USDT', 'market', 'buy', 0.1, 1500, $params);
```
```go tab="Go"
params := map[string]interface{}{
    "marginMode": "isolated", // or "cross"
}
order, err := exchange.CreateOrder("ETH/USDT", "market", "buy", 0.1, ccxt.WithCreateOrderPrice(1500), ccxt.WithCreateOrderParams(params))
```
```csharp tab="C#"
var parameters = new Dictionary<string, object>() {
    { "marginMode", "isolated" }, // or "cross"
};
var order = await exchange.CreateOrder("ETH/USDT", "market", "buy", 0.1, 1500, parameters);
```
```java tab="Java"
Map<String, Object> params = Map.of("marginMode", "isolated");
Order order = exchange.createOrder("ETH/USDT", "market", "buy", 0.1, null, params);
```


## 获取保证金模式

*仅限保证金和合约交易*

`fetchMarginMode()` 方法可用于获取某个市场已设置的保证金模式。`fetchMarginModes()` 方法可用于一次性获取多个市场已设置的保证金模式。

您可以通过以下方式访问已设置的保证金模式：

- `fetchMarginMode()` (单个交易对)
- `fetchMarginModes([symbol1, symbol2, ...])` (多个交易对)
- `fetchMarginModes()` (所有市场交易对)

```javascript
fetchMarginMode(symbol, params = {})
```

参数

- **symbol** (String) *必填* 统一的 CCXT 交易对（例如 `"BTC/USDT:USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"subType": "linear"}`）

返回值

- 一个 [保证金模式结构](#margin-mode-structure)

```javascript
fetchMarginModes(symbols = undefined, params = {})
```

参数

- **symbols** (\[String\]) 统一的 CCXT 交易对列表（例如 `[ "BTC/USDT:USDT" ]`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"subType": "linear"}`）

返回值

- 一个 [保证金模式结构](#margin-mode-structure) 数组

### 保证金模式结构

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
}
```

## 设置杠杆

*仅适用于保证金和合约*

```javascript
setLeverage (leverage, symbol = undefined, params = {})
```

参数

- **leverage** (Integer) *必填* 所需的杠杆倍数
- **symbol** (String) 统一的 CCXT 市场交易对（例如 `"BTC/USDT:USDT"`）*在大多数交易所为必填*。当杠杆不针对特定市场时不需要（例如，如果杠杆是针对账户而非每个市场单独设置的）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"marginMode": "cross"}`）

返回值

- 来自交易所的响应

## 杠杆

*仅适用于保证金和合约*

`fetchLeverage()` 方法可用于获取某个市场已设置的杠杆倍数。`fetchLeverages()` 方法可用于一次获取多个市场已设置的杠杆倍数。

您可以通过以下方式访问已设置的杠杆：

- `fetchLeverage()` (单个交易对)
- `fetchLeverages([symbol1, symbol2, ...])` (多个交易对)
- `fetchLeverages()` (所有市场交易对)

```javascript
fetchLeverage(symbol, params = {})
```

参数

- **symbol** (String) *必填* 统一的 CCXT 交易对（例如 `"BTC/USDT:USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"marginMode": "cross"}`）

返回值

- 一个 [杠杆结构](#leverage-structure)

```javascript
fetchLeverages(symbols = undefined, params = {})
```

参数

- **symbols** (\[String\]) 统一的 CCXT 交易对列表（例如 `[ "BTC/USDT:USDT" ]`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"marginMode": "cross"}`）

返回值

- 一个 [杠杆结构](#leverage-structure) 数组

### 杠杆结构

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
    "longLeverage": 100,        // the set leverage for a long position
    "shortLeverage": 75,        // the set leverage for a short position
}
```

## 合约交易

这可以包括有固定到期日的期货、带有资金费用的永续合约，以及反向期货或反向永续合约。
关于持仓的信息可能来自不同的端点，具体取决于交易所。
如果有多个端点提供不同类型的衍生品数据，CCXT 将默认仅加载"线性"合约（而非"反向"合约）或"永续"合约（而非"期货"合约）。

### 持仓

*仅适用于合约*

要获取当前在合约市场中持有的仓位信息，请使用

- fetchPosition ()            // 单个市场
- fetchPositions ()           // 所有持仓
- fetchAccountPositions ()    // TODO
- fetchPositionHistory ()     // 单个历史持仓
- fetchPositionsHistory ()     // 历史持仓

```javascript
fetchPosition (symbol, params = {})                         // for a single market
```

参数

- **symbol** (String) *必填* 统一的 CCXT 市场交易对（例如 `"BTC/USDT:USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个 [持仓结构](#position-structure)

```javascript
fetchPositions (symbols = undefined, params = {})
fetchAccountPositions (symbols = undefined, params = {})
```

参数

- **symbols** (\[String\]) 统一的 CCXT 市场交易对，不设置则获取所有持仓（例如 `["BTC/USDT:USDT"]`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个 [持仓结构](#position-structure) 数组

```javascript
fetchPositionHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **symbol** (\[String\]) 统一的 CCXT 市场交易对，不设置则获取所有持仓（例如 `["BTC/USDT:USDT"]`）
- **since** (Integer) 获取持仓的最早时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要获取的 [持仓结构](#position-structure) 数量（例如 `5`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个 [持仓结构](#position-structure) 数组

#### 持仓结构

```javascript
{
   'info': { ... },             // json response returned from the exchange as is
   'id': '1234323',             // string, position id to reference the position, similar to an order id
   'symbol': 'BTC/USD',         // uppercase string literal of a pair of currencies
   'timestamp': 1607723554607,  // integer unix time since 1st Jan 1970 in milliseconds
   'datetime': '2020-12-11T21:52:34.607Z',  // ISO8601 representation of the unix time above
   'isolated': true,            // boolean, whether or not the position is isolated, as opposed to cross where margin is added automatically
   'hedged': false,             // boolean, whether or not the position is hedged, i.e. if trading in the opposite direction will close this position or make a new one
   'side': 'long',              // string, long or short
   'contracts': 5,              // float, number of contracts bought, aka the amount or size of the position
   'contractSize': 100,         // float, the size of one contract in quote units
   'entryPrice': 20000,         // float, the average entry price of the position
   'markPrice': 20050,          // float, a price that is used for funding calculations
   'notional': 100000,          // float, the value of the position in the settlement currency
   'leverage': 100,             // float, the leverage of the position, related to how many contracts you can buy with a given amount of collateral
   'collateral': 5300,          // float, the maximum amount of collateral that can be lost, affected by pnl
   'initialMargin': 5000,       // float, the amount of collateral that is locked up in this position
   'maintenanceMargin': 1000,   // float, the mininum amount of collateral needed to avoid being liquidated
   'initialMarginPercentage': 0.05,      // float, the initialMargin as a percentage of the notional
   'maintenanceMarginPercentage': 0.01,  // float, the maintenanceMargin as a percentage of the notional
   'unrealizedPnl': 300,        // float, the difference between the market price and the entry price times the number of contracts, can be negative
   'liquidationPrice': 19850,   // float, the price at which collateral becomes less than maintenanceMargin
   'marginMode': 'cross',       // string, can be cross or isolated
   'percentage': 3.32,          // float, represents unrealizedPnl / initialMargin * 100
}
```
持仓允许您从交易所借款，以做多或做空某个市场。部分交易所要求您支付资金费用以维持仓位开启。

当您做多一个仓位时，您是在押注价格未来会更高，且价格永远不会低于 `liquidationPrice`（清算价格）。

随着标的指数价格的变化，未实现盈亏也会随之变动，进而影响您在仓位中剩余的抵押品数量（因为您只能以市场价格或更差的价格平仓）。在某个价格点，您的抵押品将归零，这被称为"爆仓"或"零值"价格。超过这一点后，如果价格进一步向反方向移动，仓位的抵押品将降至 `maintenanceMargin`（维持保证金）以下。维持保证金在您的仓位与负抵押品之间充当安全缓冲，在负抵押品的情形下，交易所将代您承担损失。为保护自身利益，交易所将在此情况发生时迅速清算您的仓位。即使价格回升至清算价格以上，您也无法拿回资金，因为交易所已将您买入的所有 `contracts`（合约）以市价卖出。换言之，维持保证金是借款的隐性费用。

建议使用 `maintenanceMargin` 和 `initialMargin`，而非 `maintenanceMarginPercentage` 和 `initialMarginPercentage`，因为前者往往更为精确。维持保证金可能根据维持保证金比例之外的其他因素计算，包括资金费率和吃单手续费，例如在 [kucoin](https://futures.kucoin.com/contract/detail) 上。

反向合约允许您通过质押 BTC 作为抵押品来做多或做空 BTC/USD。我们针对反向合约的 API 与线性合约相同。反向合约中的数量以 USD/BTC 的形式报价，但价格仍以 BTC/USD 报价。反向合约盈亏的计算公式为 `(1/markPrice - 1/price) * contracts`。盈亏和抵押品现以 BTC 计价，合约数量以 USD 计价。

#### 平仓

*仅适用于合约*

要使用市价单快速平掉未平仓仓位，请使用

- closePosition (symbol)               // 单个市场
- closeAllPositions (symbol)           // 所有仓位

```typescript
closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order>
```

参数

- **symbol** (String) *必填* 统一的 CCXT 市场交易对（例如 `"BTC/USDT:USDT"`）
- **side** *可选* 表示订单方向的字符串字面量。部分交易所要求填写。
  **统一的方向：**
  - `buy` 给出计价货币并获得基础货币；例如，买入 `BTC/USD` 意味着您将用美元换取比特币。
  - `sell` 给出基础货币并获得计价货币；例如，卖出 `BTC/USD` 意味着您将用比特币换取美元。
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个 [订单结构](#order-structure)

```typescript
closeAllPositions (params = {}): Promise<Position[]>
```

参数
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个 [订单结构](#order-structure) 列表


### 持仓模式

*仅适用于保证金和合约*

用于设置持仓模式的方法：

```javascript
setPositionMode (hedged, symbol = undefined, params = {})
```

参数

- **hedged** (String) *必填* 对冲模式值：
    - `true` - 设置为**对冲**模式
    - `false` - 设置为**单向**模式
- **symbol** (String) 统一的 CCXT 市场交易对（例如 `"BTC/USDT:USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数

用于获取持仓模式的方法：

```javascript
fetchPositionMode (symbol = undefined, params = {}) {
```

参数

- **symbol** (String) 统一的 CCXT 市场交易对（例如 `"BTC/USDT:USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数

返回值

```javascript
{
    'info': { ... },
    'hedged': true,
}
```


#### 清算价格

当 `initialMargin + unrealized = collateral = maintenanceMargin` 时对应的价格。此时价格已向您仓位的反方向移动，仅剩维持保证金的抵押品，若价格继续反向移动，仓位将出现负抵押品。

```javascript
// if long
(liquidationPrice - price) * contracts = maintenanceMargin

// if short
(price - liquidationPrice) * contracts = maintenanceMargin
// if inverse long
(1/liquidationPrice - 1/price) * contracts = maintenanceMargin

// if inverse short
(1/price - 1/liquidationPrice) * contracts = maintenanceMargin
```

### 资金历史

*仅适用于合约*

永续合约（也称为永续期货）通过在持有永续合约市场仓位的交易者之间交换资金费用，使合约市场价格与其所代表的资产价格保持一致。

如果合约的交易价格高于其所代表资产的价格，则做多仓位的交易者将在每天特定时间向做空仓位的交易者支付资金费用，从而鼓励更多交易者在这些时间之前入场做空。

如果合约的交易价格低于其所代表资产的价格，则做空仓位的交易者将在每天特定时间向做多仓位的交易者支付资金费用，从而鼓励更多交易者在这些时间之前入场做多。

这些费用通常直接在交易者之间交换，交易所不收取佣金。

`fetchFundingHistory` 方法可用于获取账户已支付或已收到的资金费用历史记录。

```javascript
fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **symbol** (String) 统一的 CCXT 市场交易对（例如 `"BTC/USDT:USDT"`）
- **since** (Integer) 获取资金历史的最早时间戳（毫秒）（例如 `1646940314000`）
- **limit** (Integer) 要获取的 [资金历史结构](#funding-history-structure) 数量（例如 `5`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"endTime": 1645807945000}`）

返回值

- 一个 [资金历史结构](#funding-history-structure) 数组

#### 资金历史结构

```javascript
{
    info: { ... },
    symbol: "XRP/USDT:USDT",
    code: "USDT",
    timestamp: 1646954920000,
    datetime: "2022-03-08T16:00:00.000Z",
    id: "1520286109858180",
    amount: -0.027722
}
```


### 货币兑换

`fetchConvertQuote` 方法可用于获取可用于兑换交易的报价。
该报价通常需要在交易所指定的时间范围内使用，以确保兑换交易成功执行。

```javascript
fetchConvertQuote (fromCode, toCode, amount = undefined, params = {})
```

参数

- **fromCode** (String) *必填* 要兑换的货币的统一货币代码（例如 `"USDT"`）
- **toCode** (String) *必填* 要兑换成的货币的统一货币代码（例如 `"USDC"`）
- **amount** (Float) 以来源货币为单位的兑换数量（例如 `20.0`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"toAmount": 2.9722}`）

返回值

- 一个 [兑换结构](#conversion-structure)

`createConvertTrade` 方法可用于使用从 fetchConvertQuote 获取的 id 创建兑换交易订单。
该报价通常需要在交易所指定的时间范围内使用，以确保兑换交易成功执行。

```javascript
createConvertTrade (id, fromCode, toCode, amount = undefined, params = {})
```

参数

- **id** (String) *必填* 兑换报价 id（例如 `1645807945000`）
- **fromCode** (String) *必填* 要兑换的货币的统一货币代码（例如 `"USDT"`）
- **toCode** (String) *必填* 要兑换成的货币的统一货币代码（例如 `"USDC"`）
- **amount** (Float) 以来源货币为单位的兑换数量（例如 `20.0`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"toAmount": 2.9722}`）

返回值

- 一个[转换结构](#conversion-structure)

`fetchConvertTrade` 方法可用于通过交易 id 获取特定的转换交易记录。

```javascript
fetchConvertTrade (id, code = undefined, params = {})
```

参数

- **id** (String) *必填* 转换交易 id（例如 `"80794187SDHJ25"`）
- **code** (String) 转换交易的统一货币代码（例如 `"USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"toAmount": 2.9722}`）

返回值

- 一个[转换结构](#conversion-structure)

`fetchConvertTradeHistory` 方法可用于获取指定货币代码的转换历史记录。

```javascript
fetchConvertTradeHistory (code = undefined, since = undefined, limit = undefined, params = {})
```

参数

- **code** (String) 要获取转换交易历史的统一货币代码（例如 `"USDT"`）
- **since** (Integer) 最早转换记录的时间戳（例如 `1645807945000`）
- **limit** (Integer) 要获取的最大转换结构数量（例如 `10`）
- **params** (Dictionary) 特定于交易所 API 端点的参数（例如 `{"toAmount": 2.9722}`）

返回值

- 一个[转换结构](#conversion-structure)数组

#### Conversion Structure

```javascript
{
    info: { ... },
    timestamp: 1646954920000,
    datetime: "2022-03-08T16:00:00.000Z",
    id: "1520286109858180",
    fromCurrency: "USDT",
    fromAmount: 3.0,
    toCurrency: "USDC",
    toAmount: 2.9722,
    price: 0.97,
    fee: 0.0
}
```

## 自动降杠杆

*仅限合约*

使用 `fetchPositionADLRank` 或 `fetchPositionsADLRank` 方法从交易所获取仓位自动降杠杆等级的私有详情。

```javascript
fetchPositionADLRank (symbol, params = {})
```

参数

- **symbol** (String) 统一 CCXT 市场符号（例如 `"BTC/USDT:USDT"`）
- **params** (Dictionary) 特定于交易所 API 端点的额外参数（例如 `{"category": "futures"}`）

返回值

- 一个[自动降杠杆结构](#auto-de-leverage)

```javascript
fetchPositionsADLRank (symbols, params = {})
```

参数

- **symbols** (\[String\]) 统一 CCXT 符号列表（例如 `[ "BTC/USDT:USDT" ]`）
- **params** (Dictionary) 特定于交易所 API 端点的额外参数（例如 `{"category": "futures"}`）

返回值

- 一个[自动降杠杆结构](#auto-de-leverage)列表

### 自动降杠杆结构

```javascript
{
    'info': { ... },                            // the original decoded JSON as is
    'symbol': 'BTC/USDT:USDT',                  // unified CCXT market symbol
    'rank': 5,                                  // a quantile rank from 1 to 5 with 5 being the highest risk
    'rating': 'high',                           // a string risk rating as either low, medium or high
    'percent': 72.86,                           // the risk percentage with a higher percentage being a higher risk of auto de leverage
    'timestamp': 1699593511632,                 // unix timestamp in milliseconds
    'datetime': '2023-11-10T05:18:31.632Z',     // ISO8601 datetime with milliseconds
}
```


## 代理

在某些特定情况下，您可能需要使用代理，例如：
- 您所在地区无法访问交易所
- 您的 IP 被交易所封禁
- 您遭受交易所的随机限制，例如 [Cloudflare 的 DDoS 防护](#ddos-protection-by-cloudflare-incapsula)

但请注意，每增加一个中间节点都可能为请求增加一些延迟。

**Go 用户注意：** 设置任何代理属性后，必须调用 `UpdateProxySettings()` 以应用更改：
```go
exchange := ccxt.NewBinance(nil)
exchange.ProxyUrl = "http://your-proxy-url:8080"
exchange.UpdateProxySettings()  // Required in Go to apply proxy settings
```
但请注意，每增加一个中间节点都可能为请求增加一些延迟。

### 支持的代理类型
CCXT 支持以下代理类型（注意，每种类型也支持[回调](#using-proxy-callbacks)）：

#### proxyUrl

此属性会在 API 请求前附加一个 URL。它可用于简单的重定向或[绕过浏览器的 CORS 限制](#cors-access-control-allow-origin)。
```
ex = ccxt.binance();
ex.proxyUrl = 'YOUR_PROXY_URL';
```
其中 'YOUR_PROXY_URL' 的格式可以是（根据实际情况使用斜杠）：
- `https://cors-anywhere.herokuapp.com/`
- `http://127.0.0.1:8080/`
- `http://your-website.com/sample-script.php?url=`
- 等等

因此请求将发往例如 `https://cors-anywhere.herokuapp.com/https://exchange.xyz/api/endpoint`。（您也可以在本地设备/Web 服务器上运行一个小型代理脚本，并通过 `.proxyUrl` 使用它——请参考[示例文件夹](https://github.com/ccxt/ccxt/tree/master/examples)中的 "sample-local-proxy-server"）。您还可以通过重写实例的 `urlEncoderForProxyUrl` 方法来自定义目标 URL。

此方式**仅适用于 REST** 请求，不适用于 WebSocket 连接。（[如何测试代理是否有效](#test-if-your-proxy-works)）

#### httpProxy 和 httpsProxy
要为脚本设置真正的 http(s) 代理，您需要能够访问一个远程 [http 或 https 代理](https://stackoverflow.com/q/10440690/2377343)，这样请求将通过您的代理服务器直接发往目标交易所：
```
ex.httpProxy = 'http://1.2.3.4:8080/';
// or
ex.httpsProxy = 'http://1.2.3.4:8080/';
```
此方式仅影响 ccxt 的**非 WebSocket** 请求。要通过代理路由 CCXT 的 WebSocket 连接，您需要额外设置 `wsProxy`（或 `wssProxy`）属性，同时保留 `httpProxy`（或 `httpsProxy`），脚本示例如下：
```
ex.httpProxy = 'http://1.2.3.4:8080/';
ex.wsProxy   = 'http://1.2.3.4:8080/';
```
这样，HTTP 和 WebSocket 连接都将通过代理。
（[如何测试代理是否有效](#test-if-your-proxy-works)）


#### socksProxy
您也可以使用以下格式的 [socks 代理](https://www.google.com/search?q=what+is+socks+proxy)：
```
// from protocols: socks, socks5, socks5h
ex.socksProxy = 'socks5://1.2.3.4:8080/';
ex.wsSocksProxy = 'socks://1.2.3.4:8080/';
```
（[如何测试代理是否有效](#test-if-your-proxy-works)）

#### 测试代理是否有效
在 ccxt 代码片段中设置上述任意代理属性后，您可以通过访问一些能回显 IP 的网站来测试代理是否正常工作——请查看[示例](https://github.com/ccxt/ccxt/blob/master/examples/)中的 "proxy-usage" 文件。

#### 使用代理回调
**除了直接设置属性外，您还可以使用回调 `proxyUrlCallback, http(s)ProxyCallback, socksProxyCallback`**：
```
myEx.proxyUrlCallback = function (url, method, headers, body) { ... return 'http://1.2.3.4/'; }
```

### 代理相关的额外说明

#### userAgent

如有特殊需要，您可以按如下方式覆盖 `userAgent` 属性：
```
exchange.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
```

#### 自定义代理 agent

根据您使用的编程语言，可以设置自定义代理 agent。
 - 对于 JavaScript，请参考[此示例](
https://github.com/ccxt/ccxt/blob/master/examples/js/custom-proxy-agent-for-js.js)
 - 对于 Python，请参考以下示例：[proxies-for-synchronous-python](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxies-for-synchronous-python.py)、[proxy-asyncio-aiohttp-python-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-python-3.py)、[proxy-asyncio-aiohttp-socks](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-socks.py)、[proxy-sync-python-requests-2-and-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-sync-python-requests-2-and-3.py)

#### CORS（Access-Control-Allow-Origin）

CORS（即[跨源资源共享](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)）主要影响浏览器，是常见警告 `No 'Access-Control-Allow-Origin' header is present on the requested resource` 的根本原因。当脚本（在浏览器中运行）向第三方域发起请求时就会出现此问题（默认情况下此类请求会被阻止，除非目标域明确允许）。
因此，在这种情况下，您需要通过一个"CORS"代理进行通信，该代理会将请求（而非直接的浏览器端请求）重定向到目标交易所。要设置 CORS 代理，您可以运行[sample-local-proxy-server-with-cors](https://github.com/ccxt/ccxt/blob/master/examples/)示例文件，并在 ccxt 中设置 [`.proxyUrl`](#proxyurl) 属性，将请求路由到 cors/proxy 服务器。

## 字符串数学运算

部分用户可能希望控制 CCXT 处理算术运算的方式。尽管 CCXT 默认使用数值类型，但用户可以通过字符串类型切换到定点数学运算。具体做法如下：


```javascript tab="JavaScript"
const ex = new ccxt.coinbase ();
ex.number = String ; // String | Number
```
```python tab="Python"
ex = ccxt.coinbase()
ex.number = str  # str | float
```
```php tab="PHP"
$ex = new ccxt\\coinbase();
$ex->number = 'strval'; // 'strval' | 'floatval'
```
```csharp tab="C#"
var ex = new ccxt.coinbase();
ex.number = typeof(String); // typeof(String) | typeof(float)
```
```go tab="Go"
ex := ccxt.NewCoinbase(nil)
ex.Number = "String" // "String" | "Number"
```


# 错误处理

- [重试机制](#retry-mechanism)
- [异常层次结构](#exception-hierarchy)
- [ExchangeError](#exchangeerror)
- [OperationFailed](#operationfailed)
- [DDoSProtection](#ddosprotection)
- [RateLimitExceeded](#ratelimitexceeded)
- [RequestTimeout](#requesttimeout)
- [RequestTimeout](#requesttimeout)
- [ExchangeNotAvailable](#exchangenotavailable)
- [InvalidNonce](#invalidnonce)

CCXT 的错误处理通过所有语言原生支持的异常机制来实现。

要处理错误，您应在调用统一方法时添加 `try` 块，并按照所用语言的常规方式捕获异常：

```javascript tab="JavaScript"
// try to call a unified method
try {
    const response = await exchange.fetchTicker ('ETH/BTC')
    console.log (response)
} catch (e) {
    // if the exception is thrown, it is "caught" and can be handled here
    // the handling reaction depends on the type of the exception
    // and on the purpose or business logic of your application
    if (e instanceof ccxt.NetworkError) {
        console.log (exchange.id, 'fetchTicker failed due to a network error:', e.message)
        // retry or whatever
    } else if (e instanceof ccxt.ExchangeError) {
        console.log (exchange.id, 'fetchTicker failed due to exchange error:', e.message)
        // retry or whatever
    } else {
        console.log (exchange.id, 'fetchTicker failed with:', e.message)
        // retry or whatever
    }
}
```
```python tab="Python"
# try to call a unified method
try:
    response = await exchange.fetch_order_book('ETH/BTC')
    print(response)
except ccxt.NetworkError as e:
    print(exchange.id, 'fetch_order_book failed due to a network error:', str(e))
    # retry or whatever
except ccxt.ExchangeError as e:
    print(exchange.id, 'fetch_order_book failed due to exchange error:', str(e))
    # retry or whatever
except Exception as e:
    print(exchange.id, 'fetch_order_book failed with:', str(e))
    # retry or whatever
```
```php tab="PHP"
// try to call a unified method
try {
    $response = $exchange->fetch_trades('ETH/BTC');
    print_r($response);
} catch (\ccxt\NetworkError $e) {
    echo $exchange->id . ' fetch_trades failed due to a network error: ' . $e->getMessage () . "\n";
    // retry or whatever
} catch (\ccxt\ExchangeError $e) {
    echo $exchange->id . ' fetch_trades failed due to exchange error: ' . $e->getMessage () . "\n";
    // retry or whatever
} catch (Exception $e) {
    echo $exchange->id . ' fetch_trades failed with: ' . $e->getMessage () . "\n";
    // retry or whatever
}
```
```go tab="Go"
// in Go networking methods return a (value, error) pair instead of throwing.
// ccxt errors are *ccxt.Error values whose Type field identifies the category
ticker, err := exchange.FetchTicker("ETH/BTC")
if err != nil {
    if ccxtError, ok := err.(*ccxt.Error); ok {
        switch ccxtError.Type {
        case ccxt.NetworkErrorErrType:
            fmt.Println(exchange.GetId(), "fetchTicker failed due to a network error:", ccxtError.Message)
            // retry or whatever
        case ccxt.ExchangeErrorErrType:
            fmt.Println(exchange.GetId(), "fetchTicker failed due to exchange error:", ccxtError.Message)
            // retry or whatever
        default:
            fmt.Println(exchange.GetId(), "fetchTicker failed with:", ccxtError.Message)
            // retry or whatever
        }
    }
} else {
    fmt.Println(ticker)
}
```
```csharp tab="C#"
// try to call a unified method
try
{
    var response = await exchange.FetchTicker("ETH/BTC");
    Console.WriteLine(response);
}
catch (NetworkError e)
{
    Console.WriteLine(exchange.id + " fetchTicker failed due to a network error: " + e.Message);
    // retry or whatever
}
catch (ExchangeError e)
{
    Console.WriteLine(exchange.id + " fetchTicker failed due to exchange error: " + e.Message);
    // retry or whatever
}
catch (Exception e)
{
    Console.WriteLine(exchange.id + " fetchTicker failed with: " + e.Message);
    // retry or whatever
}
```
```java tab="Java"
import io.github.ccxt.errors.*;
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

// CCXT's typed sync wrappers unwrap CompletionException for you, so users
// write idiomatic Java try/catch with multiple typed catch blocks in
// most-specific → least-specific order — same shape as catching
// ArrayIndexOutOfBoundsException, IOException, etc.
Binance exchange = new Binance();
try {
    Ticker ticker = exchange.fetchTicker("ETH/BTC");
    System.out.println(ticker.last());
} catch (RateLimitExceeded e) {           // back off, retry later
    System.out.println("Rate limited: " + e.getMessage());
} catch (NetworkError e) {                // transient: DDoSProtection, RequestTimeout, ExchangeNotAvailable
    System.out.println("Network error: " + e.getMessage());
} catch (AuthenticationError e) {         // refresh creds
    System.out.println("Auth failed: " + e.getMessage());
} catch (ExchangeError e) {               // exchange-side issue (don't retry blindly)
    System.out.println("Exchange error: " + e.getMessage());
} catch (BaseError e) {                   // ccxt catch-all
    System.out.println("CCXT error: " + e.getMessage());
}
```

对于异步管道（`fetchTickerAsync` 等），`CompletableFuture` 会将抛出的错误包装在 `CompletionException` 中。请在 `.exceptionally(...)` 内部使用 `Helpers.unwrap()` 来剥离包装器，并对底层 ccxt 错误进行模式匹配：

```java
import io.github.ccxt.Helpers;

exchange.fetchTickerAsync("ETH/BTC")
    .thenAccept(t -> System.out.println(t.last()))
    .exceptionally(throwable -> {
        Throwable cause = Helpers.unwrap(throwable);
        return switch (cause) {
            case RateLimitExceeded e   -> { System.out.println("rate-limited"); yield null; }
            case NetworkError e        -> { System.out.println("network"); yield null; }
            case AuthenticationError e -> { System.out.println("auth"); yield null; }
            case ExchangeError e       -> { System.out.println("exchange"); yield null; }
            default -> throw new java.util.concurrent.CompletionException(cause);
        };
    });
```


## 重试机制
在处理 HTTP 请求时，需要了解请求可能因各种原因失败。常见原因包括服务器不可用、网络不稳定或临时性服务器问题。为优雅地处理此类场景，CCXT 提供了自动重试失败请求的选项。您可以设置 `maxRetriesOnFailure` 和 `maxRetriesOnFailureDelay` 的值来配置重试次数和重试间隔，示例如下：

```python
exchange.options['maxRetriesOnFailure'] = 3 # if we get an error like the ones mentioned above we will retry up to three times per request
exchange.options['maxRetriesOnFailureDelay'] = 1000 # we will wait 1000ms (1s) between retries
```

需要特别指出的是，只有服务器/网络相关的问题才会触发重试机制；如果用户因 `InsufficientFunds` 或 `InvalidOrder` 而收到错误，请求将不会被重试。

## 异常层次结构

所有异常均派生自基础 BaseError 异常，该异常在 ccxt 库中的定义如下：


```javascript tab="JavaScript"
class BaseError extends Error {
    constructor () {
        super ()
        // a workaround to make `instanceof BaseError` work in ES5
        this.constructor = BaseError
        this.__proto__   = BaseError.prototype
    }
}
```
```python tab="Python"
class BaseError (Exception):
    pass
```
```php tab="PHP"
class BaseError extends \Exception {}
```
```go tab="Go"
// in Go all ccxt errors are represented by a single *ccxt.Error value
// whose Type field carries the error category (e.g. "ExchangeError")
type Error struct {
    Type    ErrorType
    Message string
    Stack   string
}
```
```csharp tab="C#"
public class BaseError : Exception { }
```


异常继承层次结构定义在此文件中：https://github.com/ccxt/ccxt/blob/master/ts/src/base/errorHierarchy.ts ，其可视化结构如下所示：

```text
+ BaseError
|
+---+ ExchangeError
|   |
|   +---+ OperationRejected
|   |
|   +---+ BadRequest
|   |   |
|   |   +---+ BadSymbol
|   |
|   +---+ AuthenticationError
|   |   |
|   |   +---+ PermissionDenied
|   |   |
|   |   +---+ AccountSuspended
|   |
|   +---+ ArgumentsRequired
|   |
|   +---+ BadResponse
|   |   |
|   |   +---+ NullResponse
|   |
|   +---+ InsufficientFunds
|   |
|   +---+ InvalidAddress
|   |   |
|   |   +---+ AddressPending
|   |
|   +---+ InvalidOrder
|   |   |
|   |   +---+ OrderNotFound
|   |   |
|   |   +---+ OrderNotCached
|   |   |
|   |   +---+ CancelPending
|   |   |
|   |   +---+ OrderImmediatelyFillable
|   |   |
|   |   +---+ OrderNotFillable
|   |   |
|   |   +---+ DuplicateOrderId
|   |
|   +---+ NotSupported
|
|
+---+ OperationFailed (recoverable)
    |
    +---+ NetworkError (recoverable)
        |
        +---+ InvalidNonce
        |
        +---+ RequestTimeout
        |
        +---+ ExchangeNotAvailable
        |   |
        |   +---+ OnMaintenance
        |
        +---+ RateLimitExceeded
        |
        +---+ DDoSProtection
```

`BaseError` 类是所有类型错误的通用根错误类，涵盖可访问性问题和请求/响应不匹配等各类错误。如果您不需要捕获特定的异常子类，可以直接使用 `BaseError` 来捕获所有异常类型。

从 `BaseError` 派生出两个不同的错误家族：`OperationFailed` 和 `ExchangeError`（它们各自也有特定的子类型，详见下文）。

### OperationFailed


当用户向交易所发送**构造正确且有效的请求**，但发生了不确定性问题时，可能会抛出 `OperationFailed`：
- 正在进行维护
- 互联网/网络连接问题
- DDoS 防护
- "服务器繁忙，请重试"……

此类异常是暂时性的，重新发送请求可能就足以解决问题。但如果错误持续出现，则可能表明交易所或您的连接存在持久性问题。

`OperationFailed` 具有以下子类型：`RequestTimeout`、`DDoSProtection`（包含子类型 `RateLimitExceeded`）、`ExchangeNotAvailable`、`InvalidNonce`。


#### DDoSProtection

当云/托管服务（Cloudflare、Incapsula 等）限制来自特定用户/地区/位置的请求，或当交易所 API 因用户发出异常请求而对其进行限制时，将抛出此异常。该异常还包含特定子类型异常 `RateLimitExceeded`，它直接表示用户发出的请求频率超出了交易所 API 引擎的允许范围。

#### RequestTimeout

当与交易所的连接失败或在指定时间内未能完整接收数据时，将引发此异常。这由交易所的 `.timeout` 属性控制。当引发 `RequestTimeout` 时，用户无法得知请求的结果（即交易所服务器是否已接受该请求）。

因此，建议按以下方式处理此类异常：

- 对于查询请求，重新发起调用是安全的
- 对于 `cancelOrder()` 请求，用户需要第二次重试相同的调用。对 `cancelOrder()` 的后续重试将返回以下可能结果之一：
  - 请求成功完成，即订单现已被正确取消
  - 引发 `OrderNotFound` 异常，这意味着订单要么在第一次尝试时已被取消，要么在两次尝试之间已被执行（成交并关闭）。
- 如果 `createOrder()` 请求因 `RequestTimeout` 失败，用户应：
  - 调用 `fetchOrders()`、`fetchOpenOrders()`、`fetchClosedOrders()` 检查下单请求是否成功，订单是否处于开放状态
  - 如果订单不处于 `'open'` 状态，用户应调用 `fetchBalance()` 检查自首次创建订单以来余额是否发生变化，以及订单是否在第二次检查时已成交并关闭。

#### ExchangeNotAvailable

当底层交易所无法访问时，会抛出此类异常。如果 ccxt 库在响应中检测到以下任何关键词，也会抛出此错误：

  - `offline`
  - `unavailable`
  - `busy`
  - `retry`
  - `wait`
  - `maintain`
  - `maintenance`
  - `maintenancing`

#### InvalidNonce

当您的 nonce 小于之前使用同一密钥对所用的 nonce 时，会抛出此异常，详见[身份验证](#authentication)章节。以下情况会抛出此类异常（按检查优先级排序）：

  - 您没有对请求进行速率限制，或发送请求过于频繁。
  - 您的 API 密钥不是新创建的（已被其他软件或脚本使用过，建议每次添加交易所时都创建新的密钥对）。
  - 同一密钥对在交易所类的多个实例之间共享（例如，在多线程环境或独立进程中）。
  - 您的系统时钟未与 UTC 非夏令时时区同步。系统时间应每十分钟甚至更频繁地与 UTC 同步，因为时钟会发生漂移。**在 Windows 中启用时间同步通常是不够的！** 您需要通过操作系统注册表进行设置（请在您的操作系统中搜索 *"time synch frequency"*）。


### ExchangeError

与 `OperationFailed` 不同，`ExchangeError` 通常发生在请求由于以下原因根本无法成功的情况下，因此即使您重试相同的请求数百次，仍然会失败，因为请求本身就是错误的。

此异常可能的原因：

  - 交易所已关闭该端点
  - 交易所上找不到该交易对
  - 缺少必要参数
  - 参数格式不正确
  - 用户端存在需要修复的某些问题

`ExchangeError` 包含以下子类型异常：

  - `NotSupported`：当交易所 API 不提供或不支持该端点/操作时。
  - `BadRequest`：用户发送了**错误**构造的请求/参数/操作，该请求无效/不被允许（例如："数字无效"、"交易对被禁止"、"数量超出最小/最大限制"、"精度不正确"等）。在这种情况下重试无济于事，必须先修复/调整请求。
  - `OperationRejected`：用户发送了**正确**构造的请求（在典型情况下应被交易所接受），但某些确定性因素导致请求无法成功。例如，您当前的账户状态可能不允许该操作（如"请在修改杠杆前先平仓"、"挂单数量过多"、"账户处于错误的仓位/保证金模式"），或者在某一时刻该交易对无法交易（如"MarketClosed"），或者存在一些需要您采取特定操作的明确原因（如先更改某些设置，或等待到特定时刻）。再次强调：[**OperationFailed**](#operationfailed) 可以盲目重试并且应该会成功，而 `OperationRejected` 是一种取决于特定因素的失败，需要先考虑这些因素，才能重试请求。
  - `AuthenticationError`：当交易所要求您未指定的某个 API 凭证时，或者密钥对有误或 nonce 已过期时。大多数情况下您需要 `apiKey` 和 `secret`，如果交易所 API 要求，有时还需要 `uid` 和/或 `password`。
  - `PermissionDenied`：当指定操作没有访问权限，或指定 `apiKey` 的权限不足时。
  - `InsufficientFunds`：当您的账户余额中没有足够的货币来下单时。
  - `InvalidAddress`：在调用 `fetchDepositAddress`、`createDepositAddress` 或 `withdraw` 时，遇到无效的充币地址或长度短于 `.minFundingAddressLength`（默认为 10 个字符）的充币地址时。
  - `InvalidOrder`：与统一订单 API 相关的所有异常的基类。
  - `OrderNotFound`：当您尝试获取或取消一个不存在的订单时。

### 处理时间戳错误

用户有时可能会遇到如下错误：

> "Timestamp for this request is outside of the recvWindow."
> "Invalid request, please check your server timestamp or recv_window param."
> "Timestamp for this request was 1000ms ahead of the server's time."

这些问题可能由以下几个原因引起：

#### 1. 系统时钟未同步
您设备的系统时钟可能未与全球时间标准正确同步，导致时间戳差异。
要解决此问题，请确保您的系统时钟精确到毫秒。这不应是一次性调整——请配置您的操作系统定期同步时间（例如每小时），以保持准确性。

#### 2. 网络延迟或请求延迟
如果您设备的时钟已正确同步，但网络延迟导致请求所需时间超过交易所接受的窗口（通常约为 `5` 秒，但因交易所而异），您的请求可能会被拒绝。


如果问题持续存在，您可以将本地时间戳与交易所服务器时间进行比较，以诊断差异：

```
for i in range(0, 20):
    local_time = exchange.milliseconds()
    exchange_time = await exchange.fetch_time()
    print(exchange_time - local_time)
```

#### 调整交易所选项

如果在验证同步后仍然遇到时间戳错误，您可以修改某些交易所选项来帮助缓解此问题。

A) `exchange.options['adjustForTimeDifference'] = True`
或将窗口增加到例如 10 秒（仅在交易所支持的情况下，请在目标[交易所文件](https://github.com/ccxt/ccxt/tree/master/ts/src)中搜索此关键词）：
B) `exchange.options['recvWindow'] = 10000`


有关其他故障排除步骤、社区讨论以及相关时间戳/`recvWindow` 问题，请参阅以下 GitHub 帖子：

- [CCXT Issue #773](https://github.com/ccxt/ccxt/issues/773)
- [CCXT Issue #850](https://github.com/ccxt/ccxt/issues/850)
- [CCXT Issue #936](https://github.com/ccxt/ccxt/issues/936)

# 故障排除

如果您在连接某个特定交易所时遇到任何困难，请按以下优先顺序进行操作：

- 确保您使用的是最新版本的 ccxt。
  不要轻信您的包管理器（无论是 `npm`、`pip` 还是 `composer`），而应始终通过在您的环境中运行以下代码来检查**实际（真实）运行时版本号**：
  ```javascript
  console.log (ccxt.version) // JavaScript
  ```
  ```python
  print('CCXT version:', ccxt.__version__)  # Python
  ```
  ```php
  echo "CCXT v." . \ccxt\Exchange::VERSION . "\n"; // PHP
  ```
- 查看[问题](https://github.com/ccxt/ccxt/issues)或[公告](#announcements)了解最新更新。
- 确保您没有关闭[速率限制器（`enableRateLimit: false`）](#rate-limit)（如果有人构建了自定义速率限制方案，请确保其行为正常）。
- 如果您使用 ccxt 的代理功能，请确保其行为正常。
- 将 `verbose = true` 打开以获取更多详细信息！
  ```
  exchange = ccxt.binance()
  exchange.load_markets()
  exchange.verbose = True  # for less noise, you can set that after `load_markets`, but if the error happens during `load_markets` then place this line before it
  # ... your codes here ...
  ```
  为了获得帮助，您需要提供[能够重现问题的代码以及详细输出](/docs/faq#what-is-required-to-get-help)。
- Python 用户可以通过在代码开头添加以下两行，使用标准 Python 日志器开启 DEBUG 日志级别：
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- 使用详细模式确认所使用的 API 凭证与您打算使用的密钥相对应。确保没有混淆密钥对。
- **如果可能，请尝试使用全新的密钥对。**
- 阅读常见问题解答：/docs/faq
- 在交易所网站上检查密钥对的权限！
- 检查您的 nonce。如果您曾用 API 密钥运行过其他软件，您很可能需要[覆盖您的 nonce 函数](#overriding-the-nonce)以匹配之前的 nonce 值。通常，生成新的未使用密钥对即可轻松重置 nonce。如果您使用现有密钥遇到 nonce 错误，请尝试使用尚未使用过的新 API 密钥。
- 如果出现 nonce 错误，请检查您的请求速率。您的私有请求不应快速接连发送。不应在一瞬间或极短时间内一个接一个地发送。如果您不在每次新请求之间添加延迟，交易所很可能会封禁您。换句话说，您不应通过过于频繁地发送大量私有请求来触发速率限制。在后续请求之间添加延迟，或启用内置速率限制器，如长轮询[示例](https://github.com/ccxt/ccxt/tree/master/examples)中所示，另见[这里](#order-book--market-depth)。
- 阅读[您的交易所文档](/docs/exchange-markets)并将您的详细输出与文档进行比较。
- 通过浏览器访问交易所，检查您与交易所的连接。
- 通过[代理](#proxy)检查您与交易所的连接。
- 尝试从不同的计算机或远程服务器访问交易所，以判断这是本地问题还是交易所的全局问题。
- 检查近期交易所是否有关于维护停机的新闻。某些交易所会定期离线进行更新（如每周一次）。
- 确保您的系统时间与全球时钟同步，否则可能会出现无效 nonce 错误。

**补充说明：**

- 使用 `verbose = true` 选项，或使用 `new ccxt.exchange ({ 'verbose': true })` 实例化有问题的交易所，以查看 HTTP 请求和响应的详细信息。如果您在 GitHub 上提交问题，详细输出也将有助于我们进行调试。
- 在 Python 中使用 DEBUG 日志！
- 某些交易所在特定国家/地区不可用，在这种情况下使用[代理](#proxy)可能是解决方案。
- 如果您遇到身份验证错误或*"无效密钥"*错误，这些错误很可能是由 nonce 问题引起的。
- 某些交易所在您的请求身份验证失败时不会明确说明。在这种情况下，它们可能会返回一个奇特的错误代码，例如 HTTP 502 Bad Gateway 错误，或者与实际错误原因关联性更低的内容。
