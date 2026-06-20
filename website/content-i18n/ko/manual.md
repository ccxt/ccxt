---
title: "매뉴얼"
description: "ccxt 라이브러리는 이용 가능한 암호화폐 거래소 또는 거래소 클래스의 모음입니다. 각 클래스는 특정 암호화폐 거래소의 공개 및 비공개 API를 구현합니다…"
---

# 개요

ccxt 라이브러리는 이용 가능한 암호화폐 *거래소* 또는 거래소 클래스의 모음입니다. 각 클래스는 특정 암호화폐 거래소의 공개 및 비공개 API를 구현합니다. 모든 거래소는 기본 Exchange 클래스에서 파생되며 공통 메서드 집합을 공유합니다. ccxt 라이브러리에서 특정 거래소에 접근하려면 해당 거래소 클래스의 인스턴스를 생성해야 합니다. 지원되는 거래소는 자주 업데이트되며 새로운 거래소가 정기적으로 추가됩니다.

라이브러리의 구조는 다음과 같이 설명할 수 있습니다:

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

모든 거래소의 완전한 공개 및 비공개 HTTP REST API는 JavaScript, Python, PHP, C#, Go, Java로 구현되어 있습니다. WebSocket 구현은 [CCXT Pro](https://ccxt.pro)에서 이용 가능하며, WebSocket 스트림을 지원합니다.

- [**거래소**](#exchanges)
- [**마켓**](#markets)
- [**암묵적 API**](#implicit-api)
- [**통합 API**](#unified-api)
- [**공개 API**](#public-api)
- [**비공개 API**](#private-api)
- [**오류 처리**](#error-handling)
- [**문제 해결**](#troubleshooting)
- [**CCXT Pro**](#ccxt-pro)

## 소셜

- <sub>[![Twitter](https://img.shields.io/twitter/follow/ccxt_official?style=social)](https://twitter.com/ccxt_official)</sub> 트위터에서 팔로우하세요
- <sub>[![Medium](https://img.shields.io/badge/read-our%20blog-black?logo=medium)](https://medium.com/@ccxt)</sub> Medium에서 블로그를 읽어보세요
- <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> Discord에 참여하세요
- <sub>[![Telegram Chat](https://img.shields.io/badge/CCXT-Chat-blue?logo=telegram)](https://t.me/ccxt_chat)</sub> Telegram에서 CCXT Chat (기술 지원)

- 공지 채널:
- - <sub>[![Telegram](https://img.shields.io/badge/CCXT-Channel-blue?logo=telegram)](https://t.me/ccxt_announcements)</sub>
- - <sub>[![Discord](https://img.shields.io/badge/CCXT-Channel-blue?logo=discord)](https://discord.com/channels/690203284119617602/1057748769690619984)</sub>


# 거래소

- [인스턴스화](#instantiation)
- [거래소 구조](#exchange-structure)
- [속도 제한](#rate-limit)
<!--- init list -->CCXT 라이브러리는 현재 다음 108개의 암호화폐 거래소 시장 및 트레이딩 API를 지원합니다:

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

기본적인 시장가 및 지정가 주문 외에도, 일부 거래소는 마진 거래(레버리지), 다양한 파생상품(선물 계약, 옵션 등)을 제공하며, [다크 풀](https://en.wikipedia.org/wiki/Dark_pool), [OTC](https://en.wikipedia.org/wiki/Over-the-counter_(finance))(장외 거래), 가맹점 API 등 훨씬 더 많은 기능을 제공합니다.

## 인스턴스화

거래소에 연결하고 거래를 시작하려면 ccxt 라이브러리에서 거래소 클래스를 인스턴스화해야 합니다.

지원되는 거래소의 전체 id 목록을 프로그래밍 방식으로 가져오려면:


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


거래소는 아래 예시와 같이 인스턴스화할 수 있습니다:


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

PHP에서 ccxt 라이브러리는 내장된 UTC/GMT 시간 함수를 사용하므로, php.ini에서 date.timezone을 설정하거나 라이브러리의 PHP 버전을 사용하기 전에 [date_default_timezone_set()](http://php.net/manual/en/function.date-default-timezone-set.php) 함수를 호출해야 합니다. 권장 시간대 설정은 `"UTC"`입니다.

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


### 기능(Features)

주요 거래소는 `.features` 속성을 제공하며, 여기서 각 마켓 유형에 대해 어떤 메서드와 기능이 지원되는지 확인할 수 있습니다(메서드가 `null/undefined`로 설정된 경우, 해당 메서드는 거래소에서 "지원되지 않음"을 의미합니다).

*이 기능은 현재 개발 중이며 불완전할 수 있습니다. 발견된 문제는 자유롭게 보고해 주세요.*

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


### 인스턴스화 시 거래소 속성 재정의

대부분의 거래소 속성과 특정 옵션은 아래와 같이 거래소 클래스 인스턴스화 시 또는 이후에 재정의할 수 있습니다:


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


### 거래소 메서드 재정의

CCXT가 지원하는 모든 언어에서 런타임 중에 인스턴스 메서드를 재정의할 수 있습니다:


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


### 테스트넷 및 샌드박스 환경

일부 거래소는 개발자가 무료로 가상 화폐를 거래하고 아이디어를 테스트할 수 있는 별도의 테스트용 API를 제공합니다. 이러한 API는 _"테스트넷", "샌드박스" 또는 "스테이징 환경"_(가상 테스트 자산 사용)이라고 불리며, 실제 자산을 사용하는 _"메인넷" 및 "프로덕션 환경"_과 구별됩니다. 샌드박스 API는 대부분 프로덕션 API의 복제본으로, 실제로는 동일한 API이지만 거래소 서버의 URL만 다릅니다.

CCXT는 이 측면을 통합하여 사용자가 거래소의 샌드박스로 전환할 수 있도록 합니다(기반 거래소에서 지원하는 경우).
샌드박스로 전환하려면 **거래소를 생성한 직후, 다른 호출을 하기 전에** `exchange.setSandboxMode (true)` 또는 `exchange.set_sandbox_mode(true)`를 호출해야 합니다!


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


- `exchange.setSandboxMode (true) / exchange.set_sandbox_mode (True)`는 거래소를 생성한 직후(다른 호출 전에) 첫 번째 호출이어야 합니다.
- 샌드박스의 [API 키](#authentication)를 얻으려면 해당 거래소의 샌드박스 웹사이트에 등록하고 샌드박스 키쌍을 생성해야 합니다.
- **샌드박스 키는 프로덕션 키와 교환하여 사용할 수 없습니다!**

## 거래소 구조

모든 거래소에는 속성과 메서드 집합이 있으며, 대부분은 거래소 생성자에 연관 배열 형태의 파라미터를 전달하여 재정의할 수 있습니다. 서브클래스를 만들어 모든 것을 재정의하는 것도 가능합니다.

다음은 예시 값이 추가된 일반적인 거래소 속성의 개요입니다:

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

### 거래소 속성

아래는 각 기본 거래소 속성에 대한 상세 설명입니다:

- `id`: 각 거래소에는 기본 id가 있습니다. id는 어떤 용도로도 사용되지 않으며, 사용자 영역의 거래소 인스턴스 식별 목적으로 사용되는 문자열 리터럴입니다. 동일한 거래소에 여러 링크를 가지고 id로 구별할 수 있습니다. 기본 id는 모두 소문자이며 거래소 이름에 해당합니다.

- `name`: 사람이 읽을 수 있는 거래소 이름을 담은 문자열 리터럴입니다.

- `countries`: 거래소가 운영되는 국가의 2자리 ISO 국가 코드로 이루어진 문자열 리터럴 배열입니다.

- `urls['api']`: API 호출을 위한 단일 문자열 리터럴 기본 URL 또는 비공개 및 공개 API에 대한 별도 URL의 연관 배열입니다.

- `urls['www']`: 주요 HTTP 웹사이트 URL입니다.

- `urls['doc']`: 거래소 웹사이트의 원본 API 문서에 대한 단일 문자열 URL 링크 또는 문서 링크 배열입니다.

- `version`: 현재 거래소 API의 버전 식별자를 담은 문자열 리터럴입니다. ccxt 라이브러리는 각 요청 시 이 버전 문자열을 API 기본 URL에 추가합니다. 새로운 거래소 API를 구현하는 경우가 아니라면 수정할 필요가 없습니다. 버전 식별자는 일반적으로 숫자 문자열이며, 경우에 따라 v1.1과 같이 'v'로 시작하기도 합니다. 직접 새로운 암호화폐 거래소 클래스를 구현하는 경우가 아니라면 재정의하지 마십시오.

- `api`: 암호화폐 거래소가 노출하는 모든 API 엔드포인트의 정의를 담은 연관 배열입니다. API 정의는 ccxt가 각 사용 가능한 엔드포인트에 대해 호출 가능한 인스턴스 메서드를 자동으로 구성하는 데 사용됩니다.

- `has`: 거래소 기능(예: `fetchTickers`, `fetchOHLCV` 또는 `CORS`)을 담은 연관 배열입니다.

- `timeframes`: 거래소의 fetchOHLCV 메서드에서 지원하는 시간 프레임의 연관 배열입니다. `has['fetchOHLCV']` 속성이 true인 경우에만 채워집니다.

- `timeout`: 요청-응답 왕복에 대한 타임아웃(밀리초 단위, 기본값은 10000ms = 10초)입니다. 해당 시간 내에 응답이 수신되지 않으면 라이브러리는 `RequestTimeout` 예외를 발생시킵니다. 기본 타임아웃 값을 그대로 두거나 합리적인 값으로 설정할 수 있습니다. 타임아웃 없이 무한정 대기하는 것은 옵션이 아닙니다. 일반적으로 이 옵션을 재정의할 필요는 없습니다.

- `rateLimit`: 밀리초 단위의 속도 제한입니다. 이 값은 거래소의 속도 제한 내에 있기 위해 연속 요청 사이에 대기해야 하는 밀리초 수를 나타냅니다. 예를 들어, `rateLimit`이 1000이면 초당 1개의 요청이 허용됨을 의미합니다. 내장 속도 제한기는 기본적으로 활성화되어 있으며, `enableRateLimit` 속성을 false로 설정하여 끌 수 있습니다.

- `enableRateLimit`: 내장 속도 제한기를 활성화하고 연속 요청을 스로틀링하는 불리언(true/false) 값입니다. 이 설정은 기본적으로 `true`(활성화)입니다. **사용자는 거래소에서 차단되지 않도록 자체 [속도 제한](#rate-limit)을 구현하거나 내장 속도 제한기를 활성화된 상태로 유지해야 합니다**.

- `userAgent`: HTTP User-Agent 헤더를 설정할 객체입니다. ccxt 라이브러리는 기본적으로 User-Agent를 설정합니다. 일부 거래소는 이를 좋아하지 않을 수 있습니다. 거래소로부터 응답을 받는 데 어려움이 있고 User-Agent를 끄거나 기본값을 사용하고 싶다면, 이 값을 false, undefined 또는 빈 문자열로 설정하십시오. `userAgent`의 값은 아래의 HTTP `headers` 속성으로 재정의될 수 있습니다.

- `headers`: HTTP 헤더와 그 값의 연관 배열입니다. 기본값은 빈 `{}`입니다. 모든 헤더는 모든 요청 앞에 추가됩니다. `headers` 내에 `User-Agent` 헤더가 설정된 경우, 위의 `userAgent` 속성에 설정된 값을 재정의합니다.

- `verbose`: HTTP 요청을 stdout에 기록할지 여부를 나타내는 불리언 플래그입니다(verbose 플래그는 기본적으로 false). Python 사용자는 표준 파이썬 로거를 사용한 대안적인 DEBUG 로깅 방법이 있으며, 코드 시작 부분에 다음 두 줄을 추가하여 활성화합니다:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- `returnResponseHeaders`: `true`로 설정하면 거래소의 HTTP 응답 헤더가 REST API 호출의 반환 결과에서 `info` 필드 내의 `responseHeaders` 속성에 포함됩니다. 이는 속도 제한 정보나 거래소별 헤더와 같은 메타데이터에 접근하는 데 유용할 수 있습니다. 기본값은 `false`이며 헤더는 응답에 포함되지 않습니다. 참고: 응답이 객체이고 리스트나 문자열이 아닌 경우에만 지원됩니다.

- `markets`: 일반적인 거래 쌍 또는 심볼로 인덱싱된 마켓의 연관 배열입니다. 이 속성에 접근하기 전에 마켓을 로드해야 합니다. 거래소 인스턴스에서 `loadMarkets() / load_markets()` 메서드를 호출하기 전까지는 마켓을 사용할 수 없습니다.

- `symbols`: 거래소에서 사용 가능한 심볼의 비연관 배열(목록)로, 알파벳 순서로 정렬됩니다. 이것은 `markets` 속성의 키입니다. 심볼은 마켓에서 로드되고 재로드됩니다. 이 속성은 모든 마켓 키에 대한 편리한 단축키입니다.

- `currencies`: 거래소에서 사용 가능한 코드(보통 3~4자)별 통화의 연관 배열(딕셔너리)입니다. 통화는 마켓에서 로드되고 재로드됩니다.

- `markets_by_id`: 거래소별 id로 인덱싱된 마켓 배열의 연관 배열입니다. 동일한 marketId를 가진 마켓이 여러 개 있지 않는 한 일반적으로 길이가 1인 배열입니다. 이 속성에 접근하기 전에 마켓을 로드해야 합니다.

- `apiKey`: 공개 API 키 문자열 리터럴입니다. 대부분의 거래소는 [API 키 설정](#api-keys-setup)이 필요합니다.

- `secret`: 비공개 시크릿 API 키 문자열 리터럴입니다. 대부분의 거래소는 apiKey와 함께 이것도 요구합니다.

- `password`: 비밀번호/구문이 담긴 문자열 리터럴입니다. 일부 거래소는 거래 시 이 파라미터를 요구하지만 대부분은 그렇지 않습니다.

- `uid`: 계정의 고유 id입니다. 문자열 리터럴 또는 숫자일 수 있습니다. 일부 거래소도 거래 시 이것을 요구하지만 대부분은 그렇지 않습니다.

- `requiredCredentials`: 기반 거래소에 비공개 API 호출을 보내는 데 필요한 위의 API 자격증명을 보여주는 통합 연관 딕셔너리입니다(거래소는 특정 키 집합을 요구할 수 있습니다).

- `options`: 기반 거래소에서 허용되고 CCXT에서 지원하는 특수 키와 옵션을 담은 거래소별 연관 딕셔너리입니다.

- `precisionMode`: 거래소 십진수 정밀도 계산 모드입니다. [정밀도 및 한도](#precision-and-limits)에 대한 자세한 내용을 읽어보십시오.

- 프록시의 경우 - `proxyUrl`, `httpUrl`, `httpsUrl`, `socksProxy`, `wsProxy`, `wssProxy`, `wsSocksProxy`: 특정 프록시의 URL입니다. 자세한 내용은 [프록시](#proxy) 섹션을 참조하십시오.

[거래소 속성 재정의](#overriding-exchange-properties-upon-instantiation) 섹션을 참조하십시오.

#### 거래소 메타데이터

- `has`: 다음을 포함한 거래소 기능 플래그를 담은 연관 배열입니다:

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

    각 메서드의 가용성을 보여주는 각 플래그의 의미는 다음과 같습니다:

    - `undefined` / `None` / `null` 값은 해당 메서드가 현재 ccxt에 구현되지 않았음을 의미합니다(ccxt가 아직 통합하지 않았거나 거래소 API에서 기본적으로 사용 불가능한 경우).
    - 불리언 `false`는 해당 엔드포인트가 거래소 API에서 기본적으로 사용 불가능함을 의미합니다.
    - 불리언 `true`는 해당 엔드포인트가 거래소 API에서 기본적으로 사용 가능하고 ccxt 라이브러리에서 통합되었음을 의미합니다.
    - `'emulated'` 문자열은 해당 엔드포인트가 거래소 API에서 기본적으로 사용 불가능하지만, ccxt 라이브러리가 다른 사용 가능한 true 메서드로부터 (가능한 한) 재구성했음을 의미합니다.

    모든 거래소와 지원 메서드의 전체 목록은 이 예시를 참조하십시오: https://github.com/ccxt/ccxt/blob/master/examples/js/exchange-capabilities.js

## 속도 제한(Rate Limit)

거래소는 일반적으로 *속도 제한*이라고 불리는 것을 부과합니다. 거래소는 사용자의 자격증명과 IP 주소를 기억하고 추적하며, API를 너무 자주 쿼리하는 것을 허용하지 않습니다. 거래소는 부하를 균형 잡고 (D)DoS 및 오용으로부터 API 서버를 보호하기 위해 트래픽 혼잡을 제어합니다.

**경고: 차단을 방지하려면 요청 속도 제한을 준수하세요!**

대부분의 거래소는 **초당 최대 1~2개의 요청**을 허용합니다. 요청이 너무 공격적이면 거래소가 API 접근을 일시적으로 제한하거나 일정 기간 차단할 수 있습니다.

**`exchange.rateLimit` 속성은 안전하지만 최적화되지 않은 기본값으로 설정되어 있습니다. 일부 거래소는 엔드포인트마다 다른 속도 제한을 적용할 수 있습니다. 애플리케이션의 목적에 맞게 `rateLimit`을 조정하는 것은 사용자의 책임입니다.**

CCXT 라이브러리에는 사용자에게 투명하게 백그라운드에서 필요한 스로틀링을 수행하는 실험적인 내장 속도 제한 알고리즘이 있습니다. **경고: 사용자는 최소한 어떤 형태로든 속도 제한을 직접 구현하거나 내장 속도 제한기를 사용하여 이를 적용할 책임이 있습니다.**

CCXT에는 다음과 같은 내장 속도 제한 알고리즘이 있습니다:

- **누수 버킷 방식(기본값)**: 요청을 대기열에 넣고 일정하고 고정된 속도로 해제하는 방식으로 작동합니다. 요청이 급증해도 즉시 실행되지 않고 시간에 걸쳐 평탄화되어 거래소 속도 제한에 걸리지 않으면서도 짧은 활동 급증을 우아하게 처리할 수 있습니다.
- **윈도우 기반 방식(선택적)**: 사용자가 `{ 'rateLimiterAlgorithm': 'rollingWindow' }` 옵션을 제공하면 ccxt가 누수 버킷 모델에서 윈도우 기반 속도 제한기로 전환합니다(`rollingWindowSize: X0000`을 제공하여 윈도우 크기를 사용자 지정할 수 있으며, CCXT는 기본 windowSize로 60초를 사용합니다). 윈도우 기반 제한기는 고정된 시간 윈도우 내에서 최대 요청 수를 적용합니다(예: X밀리초 내 N개의 요청). 제한에 도달하면 현재 윈도우가 만료될 때까지 추가 요청이 지연됩니다.

`.enableRateLimit` 속성을 사용하여 내장 속도 제한기를 켜거나 끌 수 있습니다:


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


호출이 속도 제한에 걸리거나 논스 오류가 발생하는 경우, ccxt 라이브러리는 `InvalidNonce` 예외를 발생시키거나, 경우에 따라 다음 유형 중 하나를 발생시킵니다:

- `DDoSProtection`
- `ExchangeNotAvailable`
- `ExchangeError`
- `InvalidNonce`

일반적으로 나중에 재시도하면 충분합니다.

### 속도 제한기에 관한 참고 사항
#### 각 거래소 인스턴스당 하나의 속도 제한기

속도 제한기는 거래소 인스턴스의 속성입니다. 즉, 각 거래소 인스턴스는 다른 인스턴스를 인식하지 못하는 자체 속도 제한기를 가집니다. 많은 경우 사용자는 프로그램 전체에서 동일한 거래소 인스턴스를 재사용해야 합니다. 동일한 IP 주소에서 동일한 API 키 쌍으로 동일한 거래소의 여러 인스턴스를 사용하지 마세요.

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

아래와 같이 거래소 인스턴스를 최대한 재사용하세요:

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

속도 제한기는 거래소 인스턴스에 속하므로 거래소 인스턴스를 삭제하면 속도 제한기도 삭제됩니다. 속도 제한에서 가장 흔한 실수 중 하나는 거래소 인스턴스를 반복적으로 생성하고 삭제하는 것입니다. 프로그램에서 거래소 인스턴스를 여러 번 호출되는 함수 내에서 생성하고 삭제하는 경우, 속도 제한기가 반복적으로 재설정되어 결국 속도 제한을 위반하게 됩니다. 재사용하는 대신 매번 거래소 인스턴스를 재생성하면 CCXT가 매번 시장을 로드하려고 시도합니다. 따라서 [마켓 로딩](#loading-markets) 섹션에서 설명된 것처럼 마켓을 강제로 반복 로드하게 됩니다. 마켓 엔드포인트를 남용하면 결국 속도 제한기도 깨지게 됩니다.

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

속도 제한기의 내부 작동 방식을 정확히 이해하고 자신이 하는 일을 100% 확신하지 않는 한 이 규칙을 어기지 마세요. 항상 안전하게 유지하려면 아래와 같이 함수 및 메서드 호출 체인 전체에서 거래소 인스턴스를 재사용하세요:

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

### Cloudflare / Incapsula에 의한 DDoS 보호

일부 거래소는 [Cloudflare](https://www.cloudflare.com) 또는 [Incapsula](https://www.incapsula.com)에 의한 [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack) 보호를 받습니다. 부하가 높은 기간에는 IP가 일시적으로 차단될 수 있습니다. 때로는 전체 국가나 지역을 제한하기도 합니다. 이 경우 서버는 일반적으로 HTTP 40x 오류를 명시하거나 브라우저/캡차 테스트를 실행하고 페이지 리로드를 몇 초 지연하는 페이지를 반환합니다. 그런 다음 브라우저/핑거프린트가 일시적으로 접근이 허용되어 화이트리스트에 추가되거나 이후 사용을 위한 HTTP 쿠키를 받습니다.

DDoS 보호 문제, 속도 제한 문제 또는 위치 기반 필터링 문제의 가장 일반적인 증상:
- 모든 유형의 거래소 메서드에서 `RequestTimeout` 예외 발생
- HTTP 오류 코드 400, 403, 404, 429, 500, 501, 503 등과 함께 `ExchangeError` 또는 `ExchangeNotAvailable` 발생
- DNS 해석 문제, SSL 인증서 문제 및 저수준 연결 문제 발생
- 거래소에서 JSON 대신 HTML 템플릿 페이지 수신

DDoS 보호 오류가 발생하여 특정 거래소에 접근할 수 없는 경우:

- [프록시](#proxy)를 사용하세요 (응답이 느릴 수 있음)
- 거래소 지원팀에 화이트리스트 등록을 요청하세요
- 다른 지역의 대체 IP를 시도하세요
- 분산 서버 네트워크에서 소프트웨어를 실행하세요
- 거래소와 가까운 위치(같은 국가, 같은 도시, 같은 데이터센터, 같은 서버 랙, 같은 서버)에서 소프트웨어를 실행하세요
- ...

## 최대 요청 용량

비동기 프로그래밍에서 CCXT는 무제한으로 요청을 예약할 수 있습니다. 그러나 기본적으로 최대 1000개의 동시 요청으로 설정된 큐 길이 제한이 있습니다. 그 이상을 큐에 넣으려고 하면 "throttle queue is over maxCapacity" 오류가 발생합니다.

대부분의 경우, 이렇게 많은 대기 중인 작업이 있다는 것은 설계가 최적화되지 않았음을 나타내며, 새 요청은 기존 작업이 완료될 때까지 지연됩니다.

그러나 이 제한을 우회하려는 사용자는 아래와 같이 인스턴스화 시 기본 maxCapacity를 늘릴 수 있습니다:

```
ex = ccxt.binance({'options': {'maxRequestsQueue': 9999}})
```

# 마켓

- [통화 구조](#currency-structure)
- [마켓 구조](#market-structure)
- [정밀도 및 한도](#precision-and-limits)
- [마켓 로딩](#loading-markets)
- [심볼 및 마켓 ID](#symbols-and-market-ids)
- [마켓 캐시 강제 재로딩](#market-cache-force-reload)

각 거래소는 특정 종류의 가치 있는 것들을 거래하는 장소입니다. 거래소마다 이를 지칭하는 용어가 다를 수 있습니다: _"통화"_, _"자산"_, _"코인"_, _"토큰"_, _"주식"_, _"상품"_, _"암호화폐"_, "법정화폐" 등. 한 자산을 다른 자산으로 거래하는 장소는 일반적으로 _"마켓"_, _"심볼"_, _"거래 쌍"_, _"계약"_ 등으로 불립니다.

ccxt 라이브러리의 관점에서, 모든 거래소는 내부에 여러 **마켓**을 제공합니다. 각 마켓은 두 개 이상의 **통화**로 정의됩니다. 마켓의 집합은 거래소마다 달라 교차 거래소 및 교차 마켓 차익 거래의 가능성을 열어줍니다.

## 통화 구조

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

각 통화는 다음 키를 가진 연관 배열(딕셔너리)입니다:

- `id`. 거래소 내 통화의 문자열 또는 숫자 ID. 통화 ID는 요청/응답 프로세스 중 코인을 식별하기 위해 거래소 내부에서 사용됩니다.
- `code`. 특정 통화의 대문자 문자열 코드 표현. 통화 코드는 ccxt 라이브러리 내에서 통화를 참조하는 데 사용됩니다(아래에 설명).
- `name`. 통화의 사람이 읽을 수 있는 이름(대문자와 소문자의 혼합일 수 있음).
- `fee`. 거래소에서 지정한 출금 수수료 값. 대부분의 경우 동일한 통화로 지불되는 고정 금액을 의미합니다. 거래소가 공개 엔드포인트를 통해 이를 지정하지 않는 경우 `fee`는 `undefined/None/null`이거나 누락될 수 있습니다.
- `active`. 이 통화에 대한 거래 또는 펀딩(입금 또는 출금)이 현재 가능한지를 나타내는 불리언 값. 자세한 내용은 [`active` 상태](#active-status)를 참고하세요.
- `info`. 수수료, 환율, 한도 및 기타 일반 마켓 정보를 포함하는 비공통 마켓 속성의 연관 배열. 내부 info 배열은 각 특정 마켓마다 다르며, 그 내용은 거래소에 따라 다릅니다.
- `precision`. 이 통화를 참조할 때 거래소에서 허용하는 값의 정밀도. 이 속성의 값은 [`exchange.precisionMode`](#precision-mode)에 따라 다릅니다.
- `limits`. 금액(볼륨), 출금 및 입금에 대한 최솟값과 최댓값.

## 네트워크 구조

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

각 네트워크는 다음 키를 가진 연관 배열(딕셔너리)입니다:

- `id`. 거래소 내 네트워크의 문자열 또는 숫자 ID. 네트워크 ID는 요청/응답 프로세스 중 네트워크를 식별하기 위해 거래소 내부에서 사용됩니다.
- `network`. 특정 네트워크의 대문자 문자열 표현. 네트워크는 ccxt 라이브러리 내에서 네트워크를 참조하는 데 사용됩니다.
- `name`. 네트워크의 사람이 읽을 수 있는 이름(대문자와 소문자의 혼합일 수 있음).
- `fee`. 거래소에서 지정한 출금 수수료 값. 대부분의 경우 동일한 통화로 지불되는 고정 금액을 의미합니다. 거래소가 공개 엔드포인트를 통해 이를 지정하지 않는 경우 `fee`는 `undefined/None/null`이거나 누락될 수 있습니다.
- `active`. 이 통화에 대한 거래 또는 펀딩(입금 또는 출금)이 현재 가능한지를 나타내는 불리언 값. 자세한 내용은 [`active` 상태](#active-status)를 참고하세요.
- `info`. 수수료, 환율, 한도 및 기타 일반 마켓 정보를 포함하는 비공통 마켓 속성의 연관 배열. 내부 info 배열은 각 특정 마켓마다 다르며, 그 내용은 거래소에 따라 다릅니다.
- `precision`. 이 통화를 참조할 때 거래소에서 허용하는 값의 정밀도. 이 속성의 값은 [`exchange.precisionMode`](#precision-mode)에 따라 다릅니다.
- `limits`. 금액(볼륨), 출금 및 입금에 대한 최솟값과 최댓값.

## 마켓 구조

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

각 마켓은 다음 키를 가진 연관 배열(딕셔너리)입니다:

- `id`. 거래소 내 마켓 또는 거래 수단의 문자열 또는 숫자 ID. 마켓 ID는 요청/응답 프로세스 중 거래 쌍을 식별하기 위해 거래소 내부에서 사용됩니다.
- `symbol`. 특정 거래 쌍 또는 수단의 대문자 문자열 코드 표현. 일반적으로 `BTC/USD`, `LTC/CNY` 또는 `ETH/EUR` 등과 같이 슬래시를 사용하여 `기준통화/호가통화` 형식으로 작성됩니다. 심볼은 ccxt 라이브러리 내에서 마켓을 참조하는 데 사용됩니다(아래에 설명).
- `base`. 기준 법정화폐 또는 암호화폐의 통일된 대문자 문자열 코드. 이는 CCXT 전체와 통합 CCXT API 전체에서 해당 통화나 토큰을 참조하는 데 사용되는 표준화된 통화 코드로, CCXT가 이해하는 언어입니다.
- `quote`. 호가 법정화폐 또는 암호화폐의 통일된 대문자 문자열 코드.
- `baseId`. 이 마켓의 기준 통화에 대한 거래소별 ID로, 통일되지 않았습니다. 어떤 문자열이든 될 수 있습니다. 거래소가 이해하는 언어로 거래소와 통신할 때 사용됩니다.
- `quoteId`. 호가 통화의 거래소별 ID로, 통일되지 않았습니다.
- `active`. 이 마켓의 거래가 현재 가능한지를 나타내는 불리언 값. 자세한 내용은 [`active` 상태](#active-status)를 참고하세요.
- `maker`. 부동소수점, 0.0015 = 0.15%. 메이커 수수료는 거래소에 유동성을 제공할 때, 즉 주문을 *마켓메이크*하고 다른 사람이 체결할 때 지불합니다. 메이커 수수료는 일반적으로 테이커 수수료보다 낮습니다. 수수료는 음수일 수 있으며, 이는 파생상품 거래소에서 매우 일반적입니다. 음수 수수료는 거래소가 이 마켓을 거래하는 사용자에게 리베이트(보상)를 지불한다는 것을 의미합니다(참고: 'taker'와 'maker'는 공개적으로 이용 가능한 수수료이며, VIP 레벨/거래량 등을 고려하지 않습니다. 계정에 특정한 수수료를 얻으려면 [`fetchTradingFees`](#fee-schedule)를 사용하세요).
- `taker`. 부동소수점, 0.002 = 0.2%. 테이커 수수료는 거래소에서 유동성을 *가져가며* 다른 사람의 주문을 체결할 때 지불합니다.
- `percentage`. `taker`와 `maker`가 승수인지 고정 금액인지를 나타내는 불리언 true/false 값.
- `tierBased`. 수수료가 거래 등급(일반적으로 일정 기간 동안의 거래량)에 따라 달라지는지를 나타내는 불리언 true/false 값.
- `info`. 수수료, 환율, 한도 및 기타 일반 마켓 정보를 포함하는 비공통 마켓 속성의 연관 배열. 내부 info 배열은 각 특정 마켓마다 다르며, 그 내용은 거래소에 따라 다릅니다.
- `precision`. 주문 배치 시 가격, 금액 및 비용에 대해 거래소에서 허용하는 주문 값의 정밀도. (이 속성 내부의 값은 [`exchange.precisionMode`](#precision-mode)에 따라 다릅니다).
- `limits`. 가격, 금액(볼륨) 및 비용(cost = price * amount)에 대한 최솟값과 최댓값.
- `optionType`. 옵션의 유형으로, `call` 옵션은 매수 권리가 있는 옵션을, `put`은 매도 권리가 있는 옵션을 나타냅니다.
- `strike`. 옵션이 행사될 때 매수 또는 매도할 수 있는 가격.

## 활성 상태

`active` 플래그는 일반적으로 [`currencies`](#currency-structure) 및 [`markets`](#market-structure)에서 사용됩니다. 거래소마다 이 플래그에 약간 다른 의미를 부여할 수 있습니다. 통화가 비활성 상태인 경우, 대부분의 경우 해당하는 모든 티커, 오더북 및 기타 관련 엔드포인트는 빈 응답, 모두 0, 데이터 없음 또는 오래된 정보를 반환합니다. 사용자는 통화가 `active` 상태인지 확인하고 [주기적으로 마켓을 다시 로드](#market-cache-force-reload)해야 합니다.

참고: `active` 속성의 `false` 값이 항상 거래, 출금 또는 입금과 같은 모든 기능이 거래소에서 비활성화되었음을 보장하지는 않습니다. 마찬가지로, `true` 값도 이러한 모든 기능이 거래소에서 활성화되어 있음을 보장하지 않습니다. 특정 거래소에서 `active` 플래그의 정확한 의미는 해당 거래소의 문서와 CCXT 코드를 확인하세요. 이 플래그는 아직 모든 마켓에서 지원되거나 구현되지 않았으며 누락될 수 있습니다.

**경고! 수수료에 관한 정보는 실험적이고 불안정하며 일부만 제공되거나 전혀 제공되지 않을 수 있습니다.**

## 정밀도와 제한

**`limits`와 `precision`을 혼동하지 마세요!** 정밀도는 최소 제한과 아무런 관계가 없습니다. `0.01`의 정밀도가 반드시 마켓의 최소 제한이 `0.01`임을 의미하지는 않습니다. 반대도 마찬가지입니다: 최소 제한이 `0.01`이라고 해서 반드시 정밀도가 `0.01`인 것은 아닙니다.

예시:

1.
```
market['limits']['amount']['min'] == 0.05 &&
market['precision']['amount'] == 0.0001 &&
market['precision']['price'] == 0.01
```

  - *수량 값*은 >= 0.05여야 합니다:
    ```diff
    + good: 0.05, 0.051, 0.0501, 0.0502, ..., 0.0599, 0.06, 0.0601, ...
    - bad: 0.04, 0.049, 0.0499
    ```
  - *수량의 정밀도*는 소수점 이하 최대 4자리여야 합니다 (0.0001):
    ```diff
    + good: 0.05, 0.0501, ..., 0.06, ..., 0.0719, ...
    - bad: 0.05001, 0.05000, 0.06001
    ```
  - *가격의 정밀도*는 소수점 이하 최대 2자리여야 합니다 (0.01):
    ```diff
    + good: 1.6, 1.61, 123.01, ..., 1234.56, ...
    - bad: 1.601, ..., 123.012, ..., 1234.567
    ```
  - 

2. `(market['precision']['amount'] == -1)`

    음수 *정밀도*는 거래소의 `precisionMode`가 `SIGNIFICANT_DIGIT` 또는 `DECIMAL_PRECISION`인 경우에만 이론적으로 발생할 수 있습니다. 이는 수량이 10의 (지정된 절댓값) 거듭제곱의 정수 배수여야 함을 의미합니다:
    ```diff
    + good: 10, 50, ..., 110, ... 1230, ..., 1000000, ..., 1234560, ...
    - bad: 9.5, ... 10.1, ..., 11, ... 200.71, ...
    ```
    `-2`의 경우 허용 가능한 값은 `100`의 배수(예: 100, 200, ...)가 되며, 이하 동일합니다.


#### 정밀도 모드

`exchange['precisionMode']`에서 지원되는 정밀도 모드는 다음과 같습니다:

- `TICK_SIZE` – 거의 모든 거래소가 이 정밀도 모드를 사용합니다. 이 모드에서 `market_or_currency['precision']`의 숫자는 반올림 또는 절사를 위한 최소 정밀도 단위(소수)를 나타냅니다.
- `SIGNIFICANT_DIGITS` – 0이 아닌 자릿수만 계산하며, 일부 거래소(`bitfinex` 및 다른 몇몇 거래소)가 이 소수 계산 모드를 구현합니다. 이 정밀도 모드에서 `market_or_currency['precision']`의 숫자는 소수점 이후 마지막 유효(0이 아닌) 소수 자릿수의 N번째 위치를 나타냅니다.
- `DECIMAL_PLACES` (**사용 중단됨, CCXT는 더 이상 어디서도 이 모드를 사용하지 않습니다**) – 모든 자릿수를 계산합니다. 이 정밀도 모드에서 `market_or_currency['precision']`의 숫자는 추가 반올림 또는 절사를 위한 소수점 이후 소수 자릿수를 나타냅니다.

### 정밀도와 제한에 관한 참고사항

사용자는 모든 제한과 정밀도를 준수해야 합니다! 주문 값은 다음 조건을 충족해야 합니다:

- 주문 `amount` >= `limits['amount']['min']`
- 주문 `amount` <= `limits['amount']['max']`
- 주문 `price` >= `limits['price']['min']`
- 주문 `price` <= `limits['price']['max']`
- 주문 `cost` (`amount * price`) >= `limits['cost']['min']`
- 주문 `cost` (`amount * price`) <= `limits['cost']['max']`
- `amount`의 정밀도는 <= `precision['amount']`여야 합니다
- `price`의 정밀도는 <= `precision['price']`여야 합니다

위의 값들은 API에서 제한 정보를 제공하지 않거나 아직 구현되지 않은 일부 거래소에서는 누락될 수 있습니다.

### 소수 형식화 메서드

각 거래소마다 고유한 반올림, 계산 및 패딩 모드가 있습니다.

지원되는 반올림 모드는 다음과 같습니다:

- `ROUND` – 마지막 소수 자릿수를 정밀도에 맞게 반올림합니다
- `TRUNCATE` – 특정 정밀도 이후의 자릿수를 잘라냅니다

소수 정밀도 계산 모드는 `exchange.precisionMode` 속성에서 확인할 수 있습니다.

#### 패딩 모드

지원되는 패딩 모드는 다음과 같습니다:

- `NO_PADDING` – 대부분의 경우 기본값
- `PAD_WITH_ZERO` – 정밀도까지 0 문자를 추가합니다

#### 정밀도로 형식화

대부분의 경우 사용자는 정밀도 형식화를 직접 처리할 필요가 없습니다. [정밀도와 제한](#precision-and-limits)에 설명된 규칙을 따른다면, 사용자가 주문을 하거나 출금 요청을 보낼 때 CCXT가 이를 처리해줍니다. 그러나 일부 경우에는 정밀도 형식화 세부 사항이 중요할 수 있으므로, 다음 메서드들이 사용자 코드에서 유용할 수 있습니다.

거래소 베이스 클래스에는 다양한 반올림, 계산 및 패딩 모드를 지원하여 필요한 소수 정밀도로 값을 형식화하는 데 도움이 되는 `decimalToPrecision` 메서드가 포함되어 있습니다.


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


문자열과 소수를 형식화하기 위해 `decimalToPrecision`을 사용하는 방법의 예시는 다음 파일들을 참조하세요:

- Typescript: https://github.com/ccxt/ccxt/blob/master/ts/src/test/base/functions/test.number.ts
- JavaScript: https://github.com/ccxt/ccxt/blob/master/js/src/test/base/functions/test.number.js
- Python: https://github.com/ccxt/ccxt/blob/master/python/ccxt/test/base/test_number.py
- PHP: https://github.com/ccxt/ccxt/blob/master/php/test/base/test_number.php

**Python 경고! `decimal_to_precision` 메서드는 `getcontext().prec`에 영향을 받습니다!**

사용자의 편의를 위해 CCXT 베이스 거래소 클래스는 다음 메서드들도 구현합니다:


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


각 거래소마다 고유한 정밀도 설정이 있으며, 위의 메서드들은 이식 가능하고 기반 거래소에 구애받지 않는 방식으로 거래소별 정밀도 규칙에 따라 값을 형식화하는 데 도움이 됩니다. 이를 가능하게 하려면, 값을 형식화하기 전에 마켓과 통화가 먼저 로드되어 있어야 합니다.

**이 메서드들을 호출하기 전에 반드시 [`exchange.loadMarkets()`로 마켓을 로드](#loading-markets)하세요!**

예를 들어:


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


`exchange.precisionMode`의 동작을 설명하는 더 실용적인 예시:

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

## 마켓 로드

대부분의 경우 다른 API 메서드에 접근하기 전에 특정 거래소의 마켓 및 거래 심볼 목록을 먼저 로드해야 합니다. 마켓 로드를 잊어버린 경우, ccxt 라이브러리가 통합 API에 대한 첫 번째 호출 시 자동으로 이를 수행합니다. 이 경우 두 번의 HTTP 요청이 순차적으로 전송됩니다: 첫 번째는 마켓, 두 번째는 기타 데이터를 위한 것입니다. 이러한 이유로, fetchTicker, fetchBalance 등과 같은 통합 CCXT API 메서드에 대한 첫 번째 호출은 거래소 API에서 마켓 정보를 로드하는 추가 작업을 수행해야 하므로 이후 호출보다 더 많은 시간이 걸립니다. 자세한 내용은 [속도 제한기에 관한 참고사항](#notes-on-rate-limiter)을 참조하세요.

마켓을 미리 수동으로 로드하려면 거래소 인스턴스에서 `loadMarkets ()` / `load_markets ()` 메서드를 호출하세요. 이 메서드는 거래 심볼로 인덱싱된 마켓의 연관 배열을 반환합니다. 로직 실행에 대한 더 많은 제어가 필요한 경우, 수동으로 마켓을 미리 로드하는 것을 권장합니다.


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


마켓 정보 외에도, `loadMarkets()` 호출은 거래소에서 통화도 로드하고 해당 정보를 `.markets` 및 `.currencies` 속성에 각각 캐시합니다.

사용자는 캐시를 우회하고 거래소 엔드포인트에서 직접 해당 정보를 가져오는 통합 메서드인 `fetchMarkets()`와 `fetchCurrencies()`를 호출할 수도 있지만, 이러한 메서드의 사용은 최종 사용자에게 권장되지 않습니다. 마켓을 미리 로드하는 권장 방법은 `loadMarkets()` 통합 메서드를 호출하는 것입니다. 그러나 기반 거래소에 해당 API 엔드포인트가 있는 경우, 새로운 거래소 통합은 이러한 메서드를 구현해야 합니다.

### 거래소 인스턴스 간 마켓 공유

메모리 사용을 최적화하고 중복 API 호출을 줄이기 위해, 동일한 거래소의 여러 인스턴스 간에 마켓 데이터를 공유할 수 있습니다. 이는 여러 거래소 인스턴스를 생성하거나 이미 로드된 마켓 데이터를 재사용하려는 경우에 특히 유용합니다.


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


**마켓 공유의 이점:**
- **메모리 효율성**: 여러 거래소 인스턴스가 메모리에서 동일한 마켓 객체를 공유합니다
- **성능**: 마켓 데이터에 대한 중복 API 호출을 제거합니다
- **리소스 절약**: 네트워크 요청 및 API 속도 제한 사용을 줄입니다
- **지속성**: 개별 거래소 인스턴스가 소멸되더라도 마켓 데이터가 계속 사용 가능합니다

**간단한 직접 할당 대안:**

직접 속성 할당을 선호하는 경우, `markets` 속성을 직접 할당하여 마켓을 공유할 수도 있습니다:

```javascript
// Simple direct assignment (ensure both exchanges are of same type)
exchange2.markets = exchange1.markets;
exchange2.symbols = exchange1.symbols;  // Also copy symbols for full functionality
```

그러나 `setMarketsFromExchange()` 메서드 사용이 권장되는 이유는 다음과 같습니다:
- 두 거래소가 동일한 유형인지 검증합니다
- 관련된 모든 마켓 데이터가 적절히 복사되도록 보장합니다
- 더 나은 오류 처리를 제공합니다

**중요 참고사항:**
- 동일한 거래소 유형의 인스턴스 간에만 마켓을 공유하세요
- 마켓 공유는 두 인스턴스가 동일한 API 자격증명과 구성을 사용할 때 가장 효과적입니다
- 공유된 마켓 객체는 최소 하나의 참조가 존재하는 한 메모리에 유지됩니다
- `setMarketsFromExchange()` 메서드와 직접 할당 모두 복사본이 아닌 공유 참조를 생성합니다

## 심볼과 마켓 ID

통화 코드는 `BTC`, `ETH`, `USD`, `GBP`, `CNY`, `JPY`, `DOGE`, `RUB`, `ZEC`, `XRP`, `XMR` 등과 같이 세 자리에서 다섯 자리의 문자로 이루어진 코드입니다. 일부 거래소에는 더 긴 코드를 가진 특이한 통화가 있습니다.

심볼은 일반적으로 슬래시로 구분된 거래 통화 쌍의 대문자 문자열 리터럴 이름입니다. 슬래시 앞의 첫 번째 통화를 일반적으로 *기준 통화*라고 하며, 슬래시 뒤의 통화를 *호가 통화*라고 합니다. 심볼의 예시로는 `BTC/USD`, `DOGE/LTC`, `ETH/EUR`, `DASH/XRP`, `BTC/CNY`, `ZEC/XMR`, `ETH/JPY` 등이 있습니다.

마켓 ID는 REST 요청-응답 과정에서 거래소 내의 거래 쌍을 참조하는 데 사용됩니다. 마켓 ID 집합은 거래소마다 고유하며 거래소 간에 사용할 수 없습니다. 예를 들어, BTC/USD 쌍/마켓은 다양한 주요 거래소에서 `btcusd`, `BTCUSD`, `XBTUSD`, `btc/usd`, `42` (숫자 ID), `BTC/USD`, `Btc/Usd`, `tBTCUSD`, `XXBTZUSD`와 같이 다른 ID를 가질 수 있습니다. 마켓 ID를 기억하거나 사용할 필요가 없으며, 이는 거래소 구현 내부의 HTTP 요청-응답 목적을 위한 것입니다.

ccxt 라이브러리는 일반적이지 않은 마켓 ID를 공통 형식으로 표준화된 심볼로 추상화합니다. 심볼은 마켓 ID와 동일하지 않습니다. 모든 마켓은 해당하는 심볼로 참조됩니다. 심볼은 거래소 간에 공통적으로 사용되므로 차익 거래 및 다른 많은 목적에 적합합니다.

때로는 사용자가 `'XBTM18'` 또는 `'.XRPUSDM20180101'` 또는 다른 *"특수/희귀 심볼"*과 같은 심볼을 발견할 수 있습니다. 심볼이 슬래시를 가지거나 통화 쌍일 필요는 **없습니다**. 심볼의 문자열은 실제로 마켓 유형(현물 마켓인지 선물 마켓인지, 다크풀 마켓인지 만료된 마켓인지 등)에 따라 다릅니다. 심볼 문자열을 파싱하려는 시도는 강력히 권장되지 않으며, 심볼 형식에 의존하지 말고 마켓 속성을 사용하는 것이 권장됩니다.

마켓 구조체는 심볼과 ID로 인덱싱됩니다. 기본 거래소 클래스에는 심볼로 마켓에 접근하기 위한 내장 메서드도 있습니다. 대부분의 API 메서드는 첫 번째 인수로 심볼을 전달해야 합니다. 현재 가격을 조회하거나 주문을 생성하는 등의 작업 시 심볼을 지정해야 하는 경우가 많습니다.

대부분의 경우 사용자는 마켓 심볼을 사용하게 됩니다. 이러한 딕셔너리에서 존재하지 않는 키에 접근하면 표준 사용자 예외가 발생합니다.

### 마켓 및 통화 관련 메서드


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


### 명명 일관성

다양한 거래소에서 사용하는 용어가 다소 모호하여 신규 트레이더들에게 혼란을 줄 수 있습니다. 일부 거래소는 마켓을 *쌍(pairs)*이라고 부르고, 다른 거래소는 심볼을 *상품(products)*이라고 부릅니다. CCXT 라이브러리 관점에서, 각 거래소는 하나 이상의 트레이딩 마켓을 포함합니다. 각 마켓에는 ID와 심볼이 있습니다. 대부분의 심볼은 기준 통화(base currency)와 호가 통화(quote currency)의 쌍입니다.

``` → Markets → Symbols → Currencies```

역사적으로 동일한 트레이딩 쌍을 나타내기 위해 다양한 기호 이름이 사용되어 왔습니다. 일부 암호화폐(예: Dash)는 존재하는 동안 이름이 두 번 이상 변경되기도 했습니다. 거래소 간 일관성을 위해 CCXT 라이브러리는 심볼 및 통화에 대해 다음과 같은 알려진 대체 변환을 수행합니다:

- `XBT → BTC`: `XBT`는 더 새로운 표기이지만 `BTC`가 거래소 사이에서 더 일반적이며 비트코인처럼 들립니다 ([자세히 보기](https://www.google.ru/search?q=xbt+vs+btc)).
- `BCC → BCH`: 비트코인 캐시 포크는 종종 두 가지 다른 기호 이름인 `BCC`와 `BCH`로 불립니다. `BCC`라는 이름은 비트코인 캐시에 대해 모호하며 BitConnect와 혼동됩니다. CCXT 라이브러리는 적절한 경우 `BCC`를 `BCH`로 변환합니다(일부 거래소와 애그리게이터가 이를 혼동합니다).
- `DRK → DASH`: `DASH`는 Darkcoin이었다가 Dash가 되었습니다 ([자세히 보기](https://minergate.com/blog/dashcoin-and-dash/)).
- `BCHABC → BCH`: 2018년 11월 15일 비트코인 캐시가 두 번째로 포크되어, 현재 `BCH`(BCH ABC용)와 `BSV`(BCH SV용)가 존재합니다.
- `BCHSV → BSV`: 비트코인 캐시 SV 포크에 대한 일반적인 대체 매핑입니다(일부 거래소는 `BSV`, 다른 곳은 `BCHSV`라고 부르며, 우리는 전자를 사용합니다).
- `DSH → DASH`: 심볼과 통화를 혼동하지 않도록 주의하세요. `DSH`(Dashcoin)은 `DASH`(Dash)와 다릅니다. 일부 거래소에서는 `DASH`를 `DSH`로 일관성 없이 표기하는데, CCXT 라이브러리는 이에 대해서도 수정을 수행합니다(`DSH → DASH`). 단, 이 두 통화를 혼동하는 특정 거래소에서만 해당되며, 대부분의 거래소는 둘 다 올바르게 표기합니다. `DASH/BTC`와 `DSH/BTC`는 서로 다른 마켓임을 기억하세요.
- `XRB` → `NANO`: `NANO`는 RaiBlocks의 새로운 코드이므로, CCXT 통합 API는 필요에 따라 구 코드인 `XRB`를 `NANO`로 대체합니다. https://hackernoon.com/nano-rebrand-announcement-9101528a7b76
- `USD` → `USDT`: Bitfinex, HitBTC 등 일부 거래소는 목록에서 통화를 `USD`라고 표기하지만, 해당 마켓은 실제로 `USDT`를 거래합니다. 이러한 혼동은 심볼 이름의 3글자 제한이나 다른 이유에서 비롯될 수 있습니다. 거래되는 통화가 실제로 `USDT`이고 `USD`가 아닌 경우, CCXT 라이브러리는 `USD` → `USDT` 변환을 수행합니다. 단, 일부 거래소(예: Kraken)는 `USD`와 `USDT` 심볼을 모두 보유하고 있으며 `USDT/USD` 거래 쌍도 존재합니다.

#### 명명 일관성에 관한 참고 사항

각 거래소는 `exchange.commonCurrencies` 속성에 암호화폐 기호 코드에 대한 대체 연관 배열을 보유하고 있습니다. 예:
```
'commonCurrencies' : {
    'XBT': 'BTC',
    'OPTIMISM': 'OP',
    // ... etc
}
```
여기서 키는 거래소 엔진이 해당 코인을 참조하는 실제 이름을 나타내고, 값은 CCXT를 통해 참조하고자 하는 이름을 나타냅니다.

때로는 코드에서 대소문자가 섞이고 공백이 있는 특이한 심볼 이름을 볼 수 있습니다. 이러한 이름을 갖게 된 논리는 하나 이상의 통화가 서로 다른 거래소에서 동일한 기호 코드를 사용할 때 명명 및 통화 코딩에서 충돌을 해결하기 위한 규칙으로 설명됩니다:

- 먼저, 거래소 자체에서 문제가 되는 통화 코드에 대해 이용 가능한 모든 정보를 수집합니다. 거래소는 보통 API, 문서, 지식 기반 또는 웹사이트 어딘가에 코인 목록에 대한 설명을 제공합니다.
- 통화 코드 뒤에 있는 각 특정 암호화폐를 식별한 후, [CoinMarketCap](https://coinmarketcap.com)에서 조회합니다.
- 가장 높은 시가총액을 가진 통화가 통화 코드를 획득하고 유지합니다. 예를 들어, HOT은 종종 `Holo` 또는 `Hydro Protocol`을 나타냅니다. 이 경우 `Holo`가 코드 `HOT`을 유지하고, `Hydro Protocol`은 그 이름 자체인 `Hydro Protocol`이 코드가 됩니다. 따라서 `HOT/USD`(`Holo`용)와 `Hydro Protocol/USD`와 같은 심볼의 거래 쌍이 존재할 수 있으며, 이는 서로 다른 마켓입니다.
- 특정 코인의 시가총액을 알 수 없거나 승자를 결정하기에 충분하지 않은 경우, 거래량 및 기타 요소도 고려합니다.
- 승자가 결정되면 다른 모든 경쟁 통화는 `.commonCurrencies`를 통해 충돌하는 거래소 내에서 코드 이름이 적절히 재매핑되고 대체됩니다. **참고: 이는 '.loadMarkets()'가 실행되기 전에 정의되어야 합니다!**
- 안타깝게도 이는 진행 중인 작업입니다. 매일 새로운 통화가 등록되고 새로운 거래소가 수시로 추가되기 때문에, 일반적으로 이는 빠르게 변화하는 환경에서 *"라이브 모드"*로 진행되는 끝없는 자가 수정 과정입니다. 발견하실 수 있는 모든 충돌 및 불일치 보고에 감사드립니다.

#### 명명 일관성에 관한 질문

_심볼이 변경될 수 있나요?_

간단히 말하면, 그렇습니다, 때로는 그러나 드물게 변경됩니다. 기호 매핑은 절대적으로 필요하고 피할 수 없는 경우 변경될 수 있습니다. 그러나 지금까지의 모든 기호 변경은 충돌 또는 포크 해결과 관련이 있었습니다. CCXT에서 한 코인의 시가총액이 동일한 기호 코드를 가진 다른 코인을 추월한 선례는 아직 없습니다.

_항상 동일한 심볼로 동일한 암호화폐를 목록에 올릴 수 있다고 신뢰할 수 있나요?_

어느 정도는요 ) 우선, 이 라이브러리는 진행 중인 작업이며 끊임없이 변화하는 현실에 적응하려고 노력하고 있으므로, 향후 일부 매핑을 변경하여 수정할 충돌이 있을 수 있습니다. 궁극적으로 라이선스에는 "무보증, 사용자 책임"이라고 명시되어 있습니다. 그러나 우리도 그 결과를 이해하고 라이브러리를 신뢰하고 싶으며 하위 호환성을 깨는 것을 전혀 좋아하지 않기 때문에, 임의로 여기저기서 기호 매핑을 변경하지는 않습니다.

주요 토큰의 심볼이 포크되거나 변경되어야 하는 경우, 제어권은 여전히 사용자에게 있습니다. `exchange.commonCurrencies` 속성은 다른 거래소 속성과 마찬가지로 [초기화 시 또는 이후에 재정의](#overriding-exchange-properties-upon-instantiation)할 수 있습니다. 중요한 토큰이 관련된 경우, 일반적으로 생성자 매개변수에 몇 줄을 추가하여 이전 동작을 유지하는 방법에 대한 안내를 게시합니다.

#### 기준 및 호가 통화의 일관성

사용 중인 거래소에 따라 다르지만, 일부 거래소는 `base`와 `quote`가 반전된(일관성 없는) 쌍을 가지고 있습니다. 실제로 기준 통화와 호가 통화가 잘못 배치되어 있습니다(교환/반전됨). 이 경우 마켓 하위 구조에서 파싱된 `base` 및 `quote` 통화 값과 파싱되지 않은 `info` 사이에 차이가 나타납니다.

이러한 거래소의 경우 CCXT는 거래소 응답을 파싱할 때 기준 통화와 호가 통화의 양쪽을 전환하고 정규화하는 수정을 수행합니다. 이 로직은 재무적으로나 용어적으로 올바릅니다. 혼동을 줄이려면 다음 규칙을 기억하세요: **기준 통화는 항상 슬래시 앞에, 호가 통화는 항상 슬래시 뒤에 위치합니다. 이는 모든 심볼과 모든 마켓에서 동일합니다.**

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

#### 계약 명명 규칙

현재 통합된 `BASE/QUOTE` 심볼 스키마로 현물 마켓을 `.markets` 매핑에 심볼로 인덱싱하여 로드합니다. 이로 인해 현물 마켓과 동일한 심볼을 가진 선물 및 기타 파생 상품에서 명명 충돌이 발생할 수 있습니다. `.markets`에서 두 가지 유형의 마켓을 모두 수용하려면 '선물' 마켓과 '현물' 마켓 간의 심볼이 구별되어야 하며, '선형' 계약과 '역방향' 계약 간의 심볼도 구별되어야 합니다.

**다음 공지사항을 확인하세요: [통합 계약 명명 규칙](https://github.com/ccxt/ccxt/issues/10931)**

CCXT는 다음 유형의 파생 계약을 지원합니다:

- `future` – 인도/결제 날짜가 있는 만기 선물 계약 [](https://en.wikipedia.org/wiki/Futures_contract)
- `swap` – 인도 날짜가 없는 영구 스왑 선물 [](https://en.wikipedia.org/wiki/Perpetual_futures)
- `option` – 옵션 계약 (https://en.wikipedia.org/wiki/Option_contract)

##### 선물(Future)

선물 마켓 심볼은 기초 통화, 호가 통화, 결제 통화 및 임의 식별자로 구성됩니다. 대부분의 경우 식별자는 `YYMMDD` 형식의 선물 계약 결제일입니다:

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

##### 무기한 스왑(Perpetual Swap) (무기한 선물)

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

##### 옵션(Option)

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

### 통합 네트워크

| 네트워크 | CCXT 코드  |
|---------------------------------------|--------------|
| Bitcoin                               | BTC          |
| Ethereum                              | ETH (이더리움용) / ERC20 (토큰용)          |
| Ripple                                | XRP          |
| Litecoin                              | LTC          |
| Dogecoin                              | DOGE         |
| Stellar                               | XLM          |
| Tron                                  | TRX (TRX용) / TRC20 (토큰용)         |
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

## 마켓 캐시 강제 새로고침

`loadMarkets () / load_markets ()`는 거래소 인스턴스에 마켓 배열을 저장하는 부작용이 있는 더티 메서드이기도 합니다. 거래소당 한 번만 호출하면 됩니다. 동일한 메서드에 대한 이후 모든 호출은 로컬에 저장된(캐시된) 마켓 배열을 반환합니다.

거래소 마켓이 로드되면 `markets` 속성을 통해 언제든지 마켓 정보에 접근할 수 있습니다. 이 속성에는 심볼로 인덱싱된 마켓의 연관 배열이 포함됩니다. 이미 마켓을 로드한 후 마켓 목록을 강제로 새로고침해야 하는 경우, 동일한 메서드에 reload = true 플래그를 다시 전달하세요.


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


# 암묵적 API

- [API 메서드 / 엔드포인트](#api-methods--endpoints)
- [암묵적 API 메서드](#implicit-api-methods)
- [공개/비공개 API](#publicprivate-api)
- [동기 vs 비동기 호출](#synchronous-vs-asynchronous-calls)
- [API 메서드에 파라미터 전달](#passing-parameters-to-api-methods)

## API 메서드 / 엔드포인트

각 거래소는 API 메서드 집합을 제공합니다. API의 각 메서드를 *엔드포인트*라고 합니다. 엔드포인트는 다양한 유형의 정보를 조회하기 위한 HTTP URL입니다. 모든 엔드포인트는 클라이언트 요청에 대한 응답으로 JSON을 반환합니다.

일반적으로 거래소에서 마켓 목록을 가져오는 엔드포인트, 특정 마켓의 오더북을 조회하는 엔드포인트, 거래 내역을 조회하는 엔드포인트, 주문을 생성하고 취소하는 엔드포인트, 입출금 엔드포인트 등이 있습니다. 기본적으로 특정 거래소 내에서 수행할 수 있는 모든 종류의 작업에는 API가 제공하는 별도의 엔드포인트 URL이 있습니다.

메서드 집합이 거래소마다 다르기 때문에 ccxt 라이브러리는 다음을 구현합니다:
- 가능한 모든 URL과 메서드에 대한 공개 및 비공개 API
- 공통 메서드의 하위 집합을 지원하는 통합 API

엔드포인트 URL은 각 거래소의 `api` 속성에 미리 정의되어 있습니다. 새로운 거래소 API를 구현하는 경우가 아니라면 이를 재정의할 필요가 없습니다(적어도 자신이 무엇을 하는지 알아야 합니다).

대부분의 거래소별 API 메서드는 암묵적입니다. 즉, 코드 어디에도 명시적으로 정의되어 있지 않습니다. 라이브러리는 암묵적(비통합) 거래소 API 메서드를 정의하기 위한 선언적 방식을 구현합니다.

## 암묵적 API 메서드

API의 각 메서드에는 보통 자체 엔드포인트가 있습니다. 라이브러리는 각 특정 거래소의 모든 엔드포인트를 `.api` 속성에 정의합니다. 거래소 생성 시 `.api` 엔드포인트 목록의 각 엔드포인트에 대해 거래소 인스턴스의 `defineRestApi()/define_rest_api()` 내부에 암묵적인 *매직* 메서드(일명 *부분 함수* 또는 *클로저*)가 생성됩니다. 이는 모든 거래소에 대해 보편적으로 수행됩니다. 생성된 각 메서드는 `camelCase`와 `under_score` 표기법 모두로 접근할 수 있습니다.

엔드포인트 정의는 거래소가 노출하는 **모든 API URL의 전체 목록**입니다. 이 목록은 거래소 인스턴스화 시 호출 가능한 메서드로 변환됩니다. API 엔드포인트 목록의 각 URL은 해당하는 호출 가능한 메서드를 가집니다. 이는 모든 거래소에 대해 자동으로 수행되므로 ccxt 라이브러리는 암호화폐 거래소가 제공하는 **모든 가능한 URL**을 지원합니다.

각 암묵적 메서드는 `.api` 정의에서 구성된 고유한 이름을 가집니다. 예를 들어, 비공개 HTTPS PUT `https://api.exchange.com/order/{id}/cancel` 엔드포인트는 `.privatePutOrderIdCancel()`/`.private_put_order_id_cancel()`라는 이름의 거래소 메서드를 가집니다. 공개 HTTPS GET `https://api.exchange.com/market/ticker/{pair}` 엔드포인트는 `.publicGetTickerPair()`/`.public_get_ticker_pair()`라는 이름의 메서드를 가집니다.

암묵적 메서드는 파라미터 딕셔너리를 받아 거래소에 요청을 보내고 API에서 거래소별 JSON 결과를 **있는 그대로, 파싱하지 않고** 반환합니다. 파라미터를 전달하려면 파라미터 이름과 동일한 키 아래에 딕셔너리에 명시적으로 추가하세요. 위의 예시에서는 `.privatePutOrderIdCancel ({ id: '41987a2b-...' })`과 `.publicGetTickerPair ({ pair: 'BTC/USD' })`와 같이 사용합니다.

거래소와 작업할 때 권장되는 방식은 거래소별 암묵적 메서드를 사용하는 것이 아니라 통합 ccxt 메서드를 사용하는 것입니다. 거래소별 메서드는 해당 통합 메서드가 아직 사용 가능하지 않은 경우 대안으로 사용해야 합니다.

암묵적 메서드와 통합 메서드를 포함하여 거래소 인스턴스에서 사용 가능한 모든 메서드 목록을 얻으려면 다음과 같이 하면 됩니다:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

## 공개/비공개 API

API URL은 종종 마켓 데이터를 위한 *공개 API*와 거래 및 계정 접근을 위한 *비공개 API*라는 두 가지 메서드 집합으로 그룹화됩니다. 이러한 API 메서드 그룹은 일반적으로 'public' 또는 'private'라는 단어가 접두사로 붙습니다.

공개 API는 마켓 데이터에 접근하는 데 사용되며 어떠한 인증도 필요하지 않습니다. 대부분의 거래소는 (속도 제한 하에) 모든 사람에게 마켓 데이터를 공개적으로 제공합니다. ccxt 라이브러리를 사용하면 누구나 거래소에 등록하거나 계정 키와 비밀번호를 설정하지 않고도 바로 마켓 데이터에 접근할 수 있습니다.

공개 API에는 다음이 포함됩니다:

- 상품/거래 페어
- 가격 피드(환율)
- 오더북(L1, L2, L3...)
- 거래 내역(체결 주문, 트랜잭션, 실행)
- 티커(현물 / 24시간 가격)
- 차트용 OHLCV 시리즈
- 기타 공개 엔드포인트

비공개 API는 주로 거래 및 계정별 비공개 데이터에 접근하는 데 사용되므로 인증이 필요합니다. 거래소에서 비공개 API 키를 발급받아야 합니다. 이는 종종 거래소 웹사이트에 등록하고 계정에 대한 API 키를 생성하는 것을 의미합니다. 대부분의 거래소는 개인 정보나 신원 확인을 요구합니다. 일부 거래소는 KYC 인증 완료 후에만 거래를 허용합니다.
비공개 API를 통해 다음을 수행할 수 있습니다:

- 개인 계정 정보 관리
- 계정 잔액 조회
- 시장가 및 지정가 주문으로 거래
- 입금 주소 생성 및 계정 자금 추가
- 법정화폐 및 암호화폐 출금 요청
- 개인 미체결/체결 주문 조회
- 마진/레버리지 거래 포지션 조회
- 원장 내역 조회
- 계정 간 자금 이체
- 판매자 서비스 이용

일부 거래소는 동일한 로직을 다른 이름으로 제공합니다. 예를 들어, 공개 API는 *market data*, *basic*, *market*, *mapi*, *api*, *price* 등으로도 불립니다. 이 모두는 공개적으로 사용 가능한 데이터에 접근하기 위한 메서드 집합을 의미합니다. 비공개 API는 *trading*, *trade*, *tapi*, *exchange*, *account* 등으로도 불립니다.

일부 거래소는 고객으로부터 인보이스를 생성하고 암호화폐 및 법정화폐 결제를 수락할 수 있는 판매자 API도 노출합니다. 이러한 종류의 API는 종종 *merchant*, *wallet*, *payment*, *ecapi*(전자상거래용)라고 불립니다.

거래소 인스턴스에서 사용 가능한 모든 메서드 목록을 얻으려면 다음과 같이 하면 됩니다:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

**계약 전용 및 마진 전용**

- 이 문서에서 **계약 전용** 또는 **마진 전용**으로 표시된 메서드는 각각 계약 거래 및 마진 거래에만 사용하도록 의도되어 있습니다. 다른 유형의 마켓에서 거래할 때도 작동할 수 있지만 관련 없는 정보를 반환할 가능성이 높습니다.

## 동기 vs 비동기 호출


#### **Javascript**

CCXT의 JavaScript 버전에서는 모든 메서드가 비동기적이며 디코딩된 JSON 객체로 resolve되는 [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)를 반환합니다. CCXT에서는 Promises를 다루기 위해 현대적인 *async/await* 문법을 사용합니다. 해당 문법에 익숙하지 않다면 [여기](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)에서 더 자세히 읽을 수 있습니다.

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

ccxt 라이브러리는 async/await 문법을 사용하여 Python 3.5+에서 비동기 동시성 모드를 지원합니다. 비동기 Python 버전은 [aiohttp](http://aiohttp.readthedocs.io)와 함께 순수 [asyncio](https://docs.python.org/3/library/asyncio.html)를 사용합니다. 비동기 모드에서는 동일한 속성과 메서드를 모두 가지지만 대부분의 메서드에 async 키워드가 데코레이터로 붙습니다. 비동기 모드를 사용하려면 다음 예시와 같이 `ccxt.async_support` 서브패키지에 링크해야 합니다:

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

CCXT는 PHP 8+ 버전을 지원합니다. 라이브러리에는 동기 및 비동기 버전이 모두 있습니다. 동기 버전을 사용하려면 `\ccxt` 네임스페이스(즉, `new ccxt\binance()`)를 사용하고, 비동기 버전을 사용하려면 `\ccxt\async` 네임스페이스(즉, `new ccxt\async\binance()`)를 사용하세요. 비동기 버전은 백그라운드에서 [ReactPHP](https://reactphp.org/) 라이브러리를 사용합니다. 비동기 모드에서는 동일한 속성과 메서드를 모두 가지지만 모든 네트워킹 API 메서드는 `\React\Async\await` 키워드로 데코레이터를 달아야 하며 스크립트는 ReactPHP 래퍼 안에 있어야 합니다:
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

`examples/php` 디렉토리에서 추가 예시를 확인하세요. `async` 단어가 포함된 파일명을 찾아보세요. 또한 `composer require recoil/recoil clue/buzz-react react/event-loop recoil/react react/http`를 사용하여 필요한 의존성을 설치했는지 확인하세요. 마지막으로, [이 글](https://sergeyzhuk.me/2018/10/26/from-promise-to-coroutines/)은 여기서 사용된 메서드에 대한 좋은 소개를 제공합니다. 문법적으로 변경이 간단하지만(즉, 관련 메서드 앞에 `yield` 키워드만 사용), 동시성은 코드의 전체적인 설계에 중요한 영향을 미칩니다.

#### **Go**

Go에서 모든 네트워킹 메서드는 동기적이며 `(value, error)` 쌍을 반환합니다 — 비동기 변형이 없습니다. 값을 사용하기 전에 반환된 `error`를 항상 확인하세요:

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

C#에서 모든 네트워킹 메서드는 비동기적이며 `await`하는 `Task<T>`를 반환합니다. 통합 메서드는 네이티브 `async`/`await`를 사용합니다:

```csharp
// C#

var exchange = new Kraken();
var ticker = await exchange.FetchTicker("ETH/BTC");
Console.WriteLine(exchange.id + " " + ticker.last);
```

#### **Java**

Java에서 각 거래소는 자체 타입이 지정된 서브클래스를 가집니다. 모든 타입이 지정된 메서드는 블로킹 동기 오버로드와 비블로킹 `CompletableFuture`를 반환하는 비동기 오버로드를 **모두** 제공합니다 — REST `fetch*` / `fetch*Async` 및 WS `watch*` / `watch*Async`에 대해 대칭적입니다:

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

동일한 동기/비동기 쌍은 pro(WebSocket) 클래스에도 적용됩니다 — `watchTicker`는 하나의 업데이트를 위해 블로킹하고; `watchTickerAsync`는 다음 업데이트 시 완료되는 `CompletableFuture<Ticker>`를 반환합니다:

```java
import io.github.ccxt.exchanges.pro.Binance;

var ws = new Binance();
ws.loadMarkets(false);

// WS — synchronous (blocks for one update)
Ticker tick = ws.watchTicker("BTC/USDT");

// WS — asynchronous (composable with allOf, anyOf, thenApply, ...)
CompletableFuture<Ticker> stream = ws.watchTickerAsync("BTC/USDT", null);
```


### 반환된 JSON 객체

모든 공개 및 비공개 API 메서드는 거래소에서 있는 그대로, 수정 없이 원시 디코딩된 JSON 객체를 응답으로 반환합니다. 통합 API는 모든 거래소에 걸쳐 공통 형식으로 균일하게 구조화된 JSON 디코딩 객체를 반환합니다.

## API 메서드에 파라미터 전달

가능한 모든 API 엔드포인트 집합은 거래소마다 다릅니다. 대부분의 메서드는 키-값 파라미터의 단일 연관 배열(또는 Python dict)을 받습니다. 파라미터는 다음과 같이 전달됩니다:

```text
bitso.publicGetTicker ({ book: 'eth_mxn' })                 // JavaScript
ccxt.zaif().public_get_ticker_pair ({ 'pair': 'btc_jpy' })  # Python
$luno->public_get_ticker (array ('pair' => 'XBTIDR'));      // PHP
```

거래소의 통합 메서드는 다음과 같이 기능에 영향을 미치는 다양한 `params`를 예상하고 수락할 수 있습니다:

```python
params = {'type':'margin', 'isIsolated': 'TRUE'}  # --------------┑
# params will go as the last argument to the unified method       |
#                                                                 v
binance.create_order('BTC/USDT', 'limit', 'buy', amount, price, params)
```

거래소는 다른 거래소의 파라미터를 수락하지 않으며, 서로 호환되지 않습니다. 수락되는 파라미터 목록은 각 특정 거래소에 의해 정의됩니다.

통합 메서드에 전달할 수 있는 파라미터를 찾으려면:

- [거래소별 구현](https://github.com/ccxt/ccxt/tree/master/js) 파일을 열고 원하는 함수(예: `createOrder`)를 검색하여 `params` 사용법의 세부 사항을 확인하거나
- 거래소의 API 문서로 이동하여 특정 함수나 엔드포인트(예: `order`)에 대한 파라미터 목록을 읽어보세요

각 거래소의 허용되는 메서드 파라미터 전체 목록은 [API 문서](#exchanges)를 참조하십시오.

### API 메서드 명명 규칙

거래소 메서드 이름은 유형(공개 또는 비공개), HTTP 메서드(GET, POST, PUT, DELETE), 엔드포인트 URL 경로를 연결한 문자열로, 아래 예시와 같습니다:

| 메서드 이름                   | 기본 API URL                   | 엔드포인트 URL                  |
|------------------------------|--------------------------------|--------------------------------|
| publicGetIdOrderbook         | https://bitbay.net/API/Public  | {id}/orderbook                 |
| publicGetPairs               | https://bitlish.com/api        | pairs                          |
| publicGetJsonMarketTicker    | https://www.bitmarket.net      | json/{market}/ticker           |
| privateGetUserMargin         | https://bitmex.com             | user/margin                    |
| privatePostTrade             | https://btc-x.is/api           | trade                          |
| tapiCancelOrder              | https://yobit.net              | tapi/CancelOrder               |
| ...                          | ...                            | ...                            |

ccxt 라이브러리는 카멜케이스 표기법(JavaScript에서 선호)과 언더스코어 표기법(Python 및 PHP에서 선호)을 모두 지원하므로, 모든 메서드는 어느 언어에서든 두 가지 표기법이나 코딩 스타일로 호출할 수 있습니다. 다음 두 가지 표기법 모두 JavaScript, Python, PHP에서 작동합니다:

```text
exchange.methodName ()  // camelcase pseudocode
exchange.method_name()  // underscore pseudocode
```

거래소 인스턴스에서 사용 가능한 모든 메서드 목록을 가져오려면 다음과 같이 하면 됩니다:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.hitbtc()))           # Python
var_dump (new \ccxt\okcoin ()); // PHP
```

# 통합 API

- [통합 API 파라미터 재정의](#overriding-unified-api-params)
- [페이지네이션](#pagination)
- [자동 페이지네이션](#automatic-pagination)

통합 ccxt API는 거래소들 간에 공통적인 메서드의 부분집합입니다. 현재 다음과 같은 메서드들을 포함하고 있습니다:

- `fetchMarkets ()`: 거래소에서 사용 가능한 모든 시장 목록을 가져와 [시장 구조](#market-structure)에 정의된 Market 객체 배열(`symbol`, `base`, `quote` 등의 속성 포함)을 반환합니다. 일부 거래소는 온라인 API를 통해 시장 목록을 얻는 수단이 없습니다. 해당 거래소의 경우 시장 목록이 하드코딩되어 있습니다.
- `fetchCurrencies ()`: 거래소에서 사용 가능한 모든 통화를 가져와 통화의 연관 딕셔너리(`code`, `name` 등의 속성을 가진 객체)를 반환합니다. 일부 거래소는 온라인 API를 통해 통화를 얻는 수단이 없습니다. 해당 거래소의 경우 통화는 마켓 페어에서 추출되거나 하드코딩됩니다.
- `loadMarkets ([reload])`: 심볼로 인덱싱된 객체로 시장 목록을 반환하고 거래소 인스턴스와 함께 캐싱합니다. 이미 로드된 경우 캐시된 시장을 반환하며, `reload = true` 플래그가 강제되지 않는 한 그대로 유지됩니다.
- `fetchOrderBook (symbol, limit = undefined, params = {})`: 특정 마켓 거래 심볼에 대한 L2/L3 호가창을 가져옵니다.
- `fetchStatus (params = {})`: 거래소 인스턴스에 하드코딩된 정보 또는 API(사용 가능한 경우)에서 거래소 상태에 관한 정보를 반환합니다.
- `fetchL2OrderBook (symbol, limit = undefined, params)`: 특정 심볼에 대한 레벨 2(가격 집계) 호가창입니다.
- `fetchTrades (symbol, since, limit, params)`: 특정 거래 심볼의 최근 거래 내역을 가져옵니다.
- `fetchTicker (symbol)`: 거래 심볼별 최신 티커 데이터를 가져옵니다.
- `fetchBalance ()`: 잔고를 가져옵니다.
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

## 통합 API 파라미터 재정의

대부분의 통합 API 메서드는 선택적 `params` 인수를 받습니다. 이는 재정의하려는 파라미터를 담은 연관 배열(딕셔너리, 기본값은 비어있음)입니다. `params`의 내용은 거래소별로 다르므로, 지원되는 필드와 값은 거래소의 API 문서를 참조하십시오. 통합 쿼리에 사용자 정의 설정이나 선택적 파라미터를 전달해야 할 경우 `params` 딕셔너리를 사용하십시오.


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


## 페이지네이션

대부분의 통합 메서드는 단일 객체 또는 객체의 일반 배열(거래, 주문, 트랜잭션 등의 목록)을 반환합니다. 그러나 모든 주문, 모든 거래, 모든 OHLCV 캔들 또는 모든 트랜잭션을 한 번에 반환하는 거래소는 거의 없습니다(있더라도 극히 드뭅니다). 대부분의 거래소 API는 가장 최근 객체의 일정 수로 출력을 `limit`합니다. **단 한 번의 호출로 시간의 시작부터 현재까지 모든 객체를 가져올 수는 없습니다**. 실질적으로 이를 허용하거나 용인하는 거래소는 매우 드뭅니다.

과거 주문이나 거래 내역을 가져오려면 사용자가 데이터를 조각(또는 객체의 "페이지") 단위로 순회해야 합니다. 페이지네이션은 종종 루프 안에서 *"데이터 조각을 하나씩 가져오는 것"*을 의미합니다.

대부분의 경우 사용자는 일관된 결과를 얻기 위해 **최소한 어느 정도의 페이지네이션을 사용해야 합니다**. 사용자가 페이지네이션을 적용하지 않으면 대부분의 메서드는 거래소의 기본값을 반환하는데, 이는 역사의 시작부터 시작되거나 최근 객체의 일부일 수 있습니다. (페이지네이션 없이) 기본 동작은 거래소마다 다릅니다! 페이지네이션 수단은 특히 다음 메서드들과 함께 자주 사용됩니다:

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

객체 목록을 반환하는 메서드에서 거래소는 하나 이상의 페이지네이션 유형을 제공할 수 있습니다. CCXT는 기본적으로 **날짜 기반 페이지네이션**을 통합하며, 라이브러리 전체에서 타임스탬프는 **밀리초** 단위입니다.


### 자동 페이지네이션

*경고: 이 기능은 실험적이며 일부 경우에 예상치 못하거나 잘못된 결과를 생성할 수 있습니다.*

최근 CCXT는 `params` 안에 `paginate` 플래그만 제공하면 여러 결과를 자동으로 페이지네이션하는 방법을 도입했습니다. 이를 통해 사용자 영역에서의 작업이 줄어듭니다. 대부분의 주요 거래소가 이를 지원하며 앞으로 더 많은 거래소가 추가될 예정이지만, 확인하는 가장 쉬운 방법은 메서드의 문서에서 *pagination* 파라미터를 검색하는 것입니다. 항상 예외는 있으며, 일부 엔드포인트는 타임스탬프나 커서를 통한 페이지네이션 방법을 제공하지 않을 수 있고, 그런 경우 CCXT로는 해결할 방법이 없습니다.


현재 세 가지 다른 페이지네이션 방식이 있습니다:
- **동적/시간 기반**: `until` 및 `since` 파라미터를 사용하여 동적 결과(거래, 주문, 트랜잭션 등)를 페이지네이션합니다. 가져올 수 있는 항목 수를 사전에 알 수 없으므로, 데이터의 끝에 도달하거나 최대 페이지네이션 호출 수(옵션으로 구성 가능)에 도달할 때까지 한 번에 하나씩 요청을 수행합니다.
- **결정론적**: 각 페이지의 경계를 미리 계산할 수 있을 때, 최대 성능을 위해 요청을 동시에 수행합니다. OHLCV, 펀딩 레이트, 미결제약정에 적용되며 `paginationCalls` 옵션도 적용됩니다.
- **커서 기반**: 거래소가 응답 내에 커서를 제공할 때, 커서를 추출하여 데이터의 끝에 도달하거나 최대 페이지네이션 호출 수에 도달할 때까지 후속 요청을 수행합니다.

사용자는 페이지네이션 방법을 선택할 수 없으며, 거래소 API의 기능을 고려하여 구현마다 다르게 결정됩니다.

#### 페이지네이션 파라미터

무한한 수의 요청을 수행할 수 없으며, 일부는 다양한 이유로 오류를 발생시킬 수 있으므로, 사용자가 이러한 변수 및 기타 페이지네이션 세부 사항을 제어할 수 있는 몇 가지 옵션이 있습니다.

*아래의 모든 옵션은 `params` 내에 제공해야 합니다. 아래 예시에서 확인할 수 있습니다*

- **paginate**: (**boolean**) 사용자가 더 많은 데이터를 얻기 위해 여러 페이지를 페이지네이션하려는 것을 나타냅니다. 기본값은 *false*입니다.
- **paginationCalls**: (**integer**) 데이터를 페이지네이션하기 위한 최대 요청 수를 제어할 수 있습니다. 레이트 제한으로 인해 이 값은 너무 높게 설정하지 않는 것이 좋습니다. 기본값은 10입니다.
- **maxRetries**: (**integer**) 오류 발생 시 페이지네이션 메커니즘이 재시도하는 횟수입니다. 기본값은 3입니다.
- **paginationDirection**: (**string**) 동적 페이지네이션에만 적용되며, *forward*(과거의 특정 시점부터 시작하여 앞으로 페이지네이션) 또는 *backward*(가장 최근 시간부터 시작하여 뒤로 페이지네이션)일 수 있습니다. *forward*가 선택되면 *since* 파라미터도 반드시 제공해야 합니다. 기본값은 *backward*입니다.
- **maxEntriesPerRequest**: (**integer**): 호출당 검색되는 데이터를 최대화하기 위한 요청당 최대 항목 수입니다. 엔드포인트마다 다르며 CCXT가 이 값을 채워줍니다. 필요한 경우 재정의할 수 있습니다.

#### 예시

```python

trades = await binance.fetch_trades("BTC/USDT", params = {"paginate": True}) # dynamic/time-based

ohlcv = await binance.fetch_ohlcv("BTC/USDT", params = {"paginate": True, "paginationCalls": 5}) # deterministic-pagination will perform 5 requests

trades = await binance.fetch_trades("BTC/USDT", since = 1664812416000, params = {"paginate": True, "paginationDirection": "forward"}) # dynamic/time-based pagination starting from 1664812416000

ledger = await bybit.fetch_ledger(params = {"paginate": True}) # bybit returns a cursor so the pagination will be cursor-based

funding_rates = await binance.fetch_funding_rate_history("BTC/USDT:USDT", params = {"paginate": True, "maxEntriesPerRequest": 50}) # customizes the number of entries per request

```


### 날짜/시간 및 타임스탬프 다루기

CCXT 라이브러리 전체에서 모든 통합 타임스탬프는 명시적으로 다르게 명시되지 않는 한 **밀리초** 단위의 정수입니다.

아래는 UTC 날짜 및 타임스탬프를 다루고 상호 변환하기 위한 메서드 집합입니다:

```javascript
exchange.parse8601 ('2018-01-01T00:00:00Z') == 1514764800000 // integer in milliseconds, Z = UTC
exchange.iso8601 (1514764800000) == '2018-01-01T00:00:00Z'   // from milliseconds to iso8601 string
exchange.seconds ()      // integer UTC timestamp in seconds
exchange.milliseconds () // integer UTC timestamp in milliseconds
```

### 날짜 기반 페이지네이션

이것은 현재 CCXT 통합 API 전반에 걸쳐 사용되는 페이지네이션 유형입니다. 사용자는 `since` 타임스탬프를 **밀리초** 단위(!)로 제공하고 결과를 `limit`하는 숫자를 제공합니다. 관심 있는 객체를 페이지별로 순회하려면 사용자는 다음을 실행합니다(아래는 의사 코드이며, 해당 거래소에 따라 일부 거래소별 파라미터를 재정의해야 할 수 있습니다):

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


### ID 기반 페이지네이션

사용자는 쿼리가 결과를 계속 반환해야 하는 시작점인 객체의 `from_id`와 결과를 `limit`할 숫자를 제공합니다. 이것은 일부 거래소에서 기본값이지만, 이 유형은 아직 통합되지 않았습니다. ID를 기반으로 객체를 페이지네이션하려면 사용자는 다음과 같이 실행합니다:


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


### 페이지 번호 기반 (커서) 페이지네이션

사용자는 페이지 번호 또는 *초기 "커서"* 값을 제공합니다. 거래소는 결과 페이지와 진행을 위한 *다음 "커서"* 값을 반환합니다. 이 페이지네이션 유형을 구현하는 대부분의 거래소는 응답 자체 내에서 또는 HTTP 응답 헤더 내에서 다음 커서 값을 반환합니다.

구현 예시는 여기를 참조하세요: https://github.com/ccxt/ccxt/blob/master/examples/py/coinbasepro-fetch-my-trades-pagination.py

루프의 각 반복에서 사용자는 다음 커서를 가져와 다음 쿼리를 위한 재정의된 params에 넣어야 합니다(다음 반복에서):


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


# 공개 API

- [주문서](#order-book)
- [가격 티커](#price-tickers)
- [OHLCV 캔들스틱 차트](#ohlcv-candlestick-charts)
- [공개 거래](#public-trades)
- [거래소 시간](#exchange-time)
- [거래소 상태](#exchange-status)
- [대출 금리](#borrow-rates)
- [대출 금리 이력](#borrow-rate-history)
- [레버리지 단계](#leverage-tiers)
- [펀딩 금리](#funding-rate)
- [펀딩 금리 이력](#funding-rate-history)
- [미결제 약정 이력](#open-interest-history)
- [변동성 이력](#volatility-history)
- [기초 자산](#underlying-assets)
- [청산](#liquidations)
- [그릭스](#greeks)
- [옵션 체인](#option-chain)
- [자동 디레버리지](#auto-de-leverage)

## 주문서

거래소는 매수(매입) 및 매도(판매) 가격, 수량 및 기타 데이터와 함께 미결 주문에 대한 정보를 공개합니다. 일반적으로 특정 시장의 *주문서* 현재 상태(스택 프레임)를 조회하기 위한 별도의 엔드포인트가 있습니다. 주문서는 *시장 깊이*라고도 불립니다. 주문서 정보는 거래 의사결정 과정에서 사용됩니다.

주문서 데이터를 가져오려면 다음을 사용할 수 있습니다

- `fetchOrderBook ()` // 단일 시장 주문서용
- `fetchOrderBooks ( symbols )` // 다중 시장 주문서용
- `fetchOrderBooks ()` // 모든 시장의 주문서용

```javascript
async fetchOrderBook (symbol, limit = undefined, params = {})
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 심볼 (예: `"BTC/USDT"`)
- **limit** (Integer) 주문서에서 반환할 주문 수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [주문서 구조체](#order-book-structure)

```javascript
async fetchOrderBooks (symbols = undefined, limit = undefined, params = {})
```

파라미터

- **symbols** (\[String\]) 통합 CCXT 심볼 (예: `["BTC/USDT", "ETH/USDT"]`)
- **limit** (Integer) 주문서에서 반환할 주문 수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- 시장 심볼로 인덱싱된 [주문서 구조체](#order-book-structure) 딕셔너리

### fetchOrderBook 예제


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


### 주문서 구조체

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

**해당 거래소가 API 응답에서 대응하는 값을 제공하지 않는 경우 타임스탬프와 datetime이 누락될 수 있습니다(`undefined/None/null`).**

가격과 수량은 부동소수점입니다. 매수 배열은 가격 내림차순으로 정렬됩니다. 최상위(가장 높은) 매수 가격이 첫 번째 요소이고 최하위(가장 낮은) 매수 가격이 마지막 요소입니다. 매도 배열은 가격 오름차순으로 정렬됩니다. 최상위(가장 낮은) 매도 가격이 첫 번째 요소이고 최하위(가장 높은) 매도 가격이 마지막 요소입니다. 거래소의 주문서에 해당 주문이 없는 경우 매수/매도 배열은 비어 있을 수 있습니다.

거래소는 분석을 위해 다양한 수준의 세부 정보로 주문 스택을 반환할 수 있습니다. 각각의 모든 주문을 포함하는 완전한 세부 정보이거나, 주문이 가격 및 수량별로 그룹화되고 병합되는 약간 적은 세부 정보로 집계된 형태입니다. 더 많은 세부 정보는 더 많은 트래픽과 대역폭이 필요하고 일반적으로 느리지만 높은 정밀도의 이점을 제공합니다. 세부 정보가 적은 것은 일반적으로 더 빠르지만 일부 매우 특수한 경우에는 충분하지 않을 수 있습니다.

### 주문서 구조체에 관한 참고사항

- `orderbook['timestamp']`는 거래소가 이 주문서 응답을 생성한 시간입니다(사용자에게 다시 응답하기 전). 매뉴얼에 설명된 대로 이것이 누락될 수 있으며(`undefined/None/null`), 모든 거래소가 거기에 타임스탬프를 제공하지는 않습니다. 정의된 경우 1970년 1월 1일 00:00:00 이후 **밀리초** 단위의 UTC 타임스탬프입니다.
- 일부 거래소는 주문 ID별로 주문서의 주문을 인덱싱할 수 있으며, 이 경우 주문 ID가 매수 및 매도의 세 번째 요소로 반환될 수 있습니다: `[ price, amount, id ]`. 이것은 집계 없이 L3 주문서의 경우에 흔히 발생합니다. 주문서에 표시되는 경우 주문 `id`는 주문서를 참조하며 소유자나 다른 사람이 보는 거래소 데이터베이스의 실제 주문 ID와 반드시 일치하지는 않습니다. 주문 ID는 주문서 내 행의 `id`이지만, 반드시 주문의 실제 `id`는 아닙니다(다만, 거래소에 따라 동일할 수도 있습니다).
- 일부 경우 거래소는 각 집계 수준에 대한 주문 수와 함께 L2 집계 주문서를 제공할 수 있으며, 이 경우 주문 수가 매수 및 매도의 세 번째 요소로 반환될 수 있습니다: `[ price, amount, count ]`. `count`는 매수 및 매도의 각 가격 수준에서 집계된 주문 수를 알려줍니다.
- 또한, 일부 거래소는 매수 및 매도의 세 번째 요소로 주문 타임스탬프를 반환할 수 있습니다: `[ price, amount, timestamp ]`. `timestamp`는 주문이 주문서에 등록된 시간을 알려줍니다.

### 시장 깊이

일부 거래소는 `fetchOrderBook () / fetch_order_book ()` 함수에 추가 파라미터 딕셔너리를 허용합니다. **모든 추가 `params`는 거래소별(비통합)입니다.** 주문서의 깊이와 같은 특정 파라미터를 재정의하려면 거래소 문서를 참조해야 합니다. 다음과 같이 limit 인수와 거래소별 추가 `params`를 지정하여 반환된 주문의 제한된 수 또는 원하는 집계 수준(일명 *시장 깊이*)을 얻을 수 있습니다:


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


세부 수준 또는 주문서 집계 수준은 종종 L1, L2, L3...과 같이 번호로 레이블이 지정됩니다.

- **L1**: 시장 가격만을 빠르게 얻기 위한 적은 세부 정보. 주문서에 하나의 주문처럼 보입니다.
- **L2**: 주문 수량이 가격별로 그룹화되는 가장 일반적인 집계 수준. 두 주문이 동일한 가격을 가지면 총합과 동일한 수량의 단일 주문으로 나타납니다. 대부분의 목적에 필요한 집계 수준일 가능성이 높습니다.
- **L3**: 각 주문이 다른 주문과 구분되는 집계 없는 가장 상세한 수준. 이 LOD는 자연스럽게 출력에 중복을 포함합니다. 따라서 두 주문이 동일한 가격을 가지면 병합되지 **않으며** 스택에서의 우선순위는 거래소의 매칭 엔진에 달려 있습니다. 성공적인 거래를 위해 L3 세부 정보가 실제로 필요하지는 않습니다. 사실, 전혀 필요하지 않을 가능성이 높습니다. 따라서 일부 거래소는 이를 지원하지 않고 항상 집계된 주문서를 반환합니다.

L2 주문서를 얻으려면, 거래소가 무엇을 반환하든 `fetchL2OrderBook(symbol, limit, params)` 또는 `fetch_l2_order_book(symbol, limit, params)` 통합 메서드를 사용하세요.

`limit` 인수는 매수 또는 매도 수가 항상 `limit`과 동일하다는 것을 보장하지 않습니다. 상한 또는 최대값을 지정하므로 어느 순간에는 `limit`보다 적은 수의 매수 또는 매도가 있을 수 있습니다. 이는 거래소가 주문서에 충분한 주문이 없는 경우입니다. 그러나 기본 거래소 API가 주문서 엔드포인트에 대한 `limit` 파라미터를 전혀 지원하지 않는 경우 `limit` 인수는 무시됩니다. CCXT는 거래소가 요청보다 더 많이 반환하는 경우 `bids`와 `asks`를 자르지 않습니다.

### 시장 가격

현재 최상위 가격을 얻고(시장 가격 조회) 매수-매도 스프레드를 계산하려면 다음과 같이 매수와 매도에서 첫 번째 요소를 가져오세요:


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


## 가격 티커

가격 티커는 특정 시장/심볼에 대한 최근 일정 기간(일반적으로 최근 24시간)의 통계를 포함합니다. 티커를 가져오는 메서드는 아래에 설명되어 있습니다.

### 단일 심볼에 대한 단일 티커

```javascript
// one ticker
fetchTicker (symbol, params = {})

// example
fetchTicker ('ETH/BTC')
fetchTicker ('BTC/USDT')
```

### 모든 또는 여러 심볼에 대한 다중 티커

```javascript
// multiple tickers
fetchTickers (symbols = undefined, params = {})  // for all tickers at once

// for example
fetchTickers () // all symbols
fetchTickers ([ 'ETH/BTC', 'BTC/USDT' ]) // an array of specific symbols
```

거래소 인스턴스의 `exchange.has['fetchTicker']` 및 `exchange.has['fetchTickers']` 속성을 확인하여 해당 거래소가 이 메서드를 지원하는지 확인하세요.

**`fetchTickers ()`를 심볼 없이 호출하는 것은 일반적으로 엄격하게 속도 제한되며, 해당 엔드포인트를 너무 자주 폴링하면 거래소에서 차단될 수 있습니다.**

### 티커 구조체

티커는 특정 시장에 대한 지난 24시간 동안 계산된 정보로 이루어진 통계적 계산입니다.

티커의 구조는 다음과 같습니다:

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

#### 티커 구조체에 관한 참고사항

- 티커의 모든 필드는 `timestamp` 이전 24시간을 나타냅니다.
- `bidVolume`은 주문서에서 현재 최상위 매수의 수량(금액)입니다.
- `askVolume`은 주문서에서 현재 최상위 매도의 수량(금액)입니다.
- `baseVolume`은 최근 24시간 동안 거래된(매수 또는 매도된) 기준 통화의 금액입니다.
- `quoteVolume`은 최근 24시간 동안 거래된(매수 또는 매도된) 호가 통화의 금액입니다.

**티커 구조체의 모든 가격은 호가 통화 단위입니다. 반환된 티커 구조체의 일부 필드는 undefined/None/null일 수 있습니다.**

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

타임스탬프와 datetime은 모두 밀리초 단위의 협정 세계시(UTC)입니다.

- `ticker['timestamp']`는 거래소가 이 응답을 생성한 시간입니다(사용자에게 다시 응답하기 전). 매뉴얼에 설명된 대로 이것이 누락될 수 있으며(`undefined/None/null`), 모든 거래소가 거기에 타임스탬프를 제공하지는 않습니다. 정의된 경우 1970년 1월 1일 00:00:00 이후 **밀리초** 단위의 UTC 타임스탬프입니다.
- `exchange.last_response_headers['Date']`는 마지막으로 수신된 HTTP 응답의 날짜-시간 문자열입니다(HTTP 헤더에서). 'Date' 파서는 거기에 지정된 시간대를 존중해야 합니다. 날짜-시간의 정밀도는 1초, 1000밀리초입니다. 이 날짜는 다음 표준에 따라 메시지가 발생했을 때 거래소 서버에 의해 설정되어야 합니다:
    - https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.18
    - https://tools.ietf.org/html/rfc1123#section-5.2.14
    - https://tools.ietf.org/html/rfc822#section-5

일부 거래소는 주문서의 상위 매수/매도 가격을 티커에 혼합하기도 하지만(일부 거래소는 상위 매수/매도 수량도 제공), 티커를 `fetchOrderBook` 대체재로 취급해서는 안 됩니다. 티커의 주요 목적은 통계 데이터를 제공하는 것으로, "실시간 24시간 OHLCV"로 취급하세요. 거래소는 이러한 쿼리에 더 엄격한 속도 제한을 부과하여 빈번한 `fetchTicker` 요청을 억제하는 것으로 알려져 있습니다. 매수 및 매도에 통합된 방식으로 액세스하려면 `fetchL[123]OrderBook` 계열을 대신 사용해야 합니다.

과거 가격과 거래량을 얻으려면 사용 가능한 경우 통합 [`fetchOHLCV`](#ohlcv-candlestick-charts) 메서드를 사용하십시오. 과거 마크 가격, 인덱스 가격, 프리미엄 인덱스 가격을 얻으려면 `fetchOHLCV`의 [params 재정의](#overriding-unified-api-params)에 각각 `'price': 'mark'`, `'price': 'index'`, `'price': 'premiumIndex'` 중 하나를 추가하십시오. 마크, 인덱스, 프리미엄인덱스 과거 가격과 거래량을 얻는 편의 메서드 `fetchMarkPriceOHLCV`, `fetchIndexPriceOHLCV`, `fetchPremiumIndexOHLCV`도 있습니다.

티커를 가져오는 메서드:

- `fetchTicker (symbol[, params = {}])`, symbol은 필수, params는 선택사항
- `fetchTickers ([symbols = undefined[, params = {}]])`, 두 인수 모두 선택사항

### 심볼별 개별 조회

특정 거래 쌍 또는 특정 심볼에 대해 거래소에서 개별 티커 데이터를 가져오려면 `fetchTicker (symbol)`을 호출하십시오:


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


### 한 번에 전체 조회

일부 거래소(전부는 아님)는 모든 티커를 한 번에 가져오는 기능도 지원합니다. 자세한 내용은 [해당 문서](#exchanges)를 참조하십시오. 다음과 같이 단일 호출로 모든 티커를 가져올 수 있습니다:


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


모든 티커를 가져오는 것은 단일 티커를 가져오는 것보다 더 많은 트래픽을 필요로 합니다. 또한 일부 거래소는 모든 티커의 연속 조회에 더 높은 속도 제한을 부과할 수 있습니다(자세한 내용은 해당 엔드포인트에 관한 거래소 문서를 참조하십시오). **속도 제한 측면에서 `fetchTickers()` 호출의 비용은 평균보다 높은 경우가 많습니다.** 하나의 티커만 필요한 경우 특정 심볼로 가져오는 것이 더 빠릅니다. 모든 티커가 실제로 필요한 경우에만 전체를 가져오는 것이 좋으며, 대부분의 경우 1분에 한 번 이상 fetchTickers를 호출하지 않는 것이 좋습니다.

또한 일부 거래소는 `fetchTickers()` 호출에 추가 요구 사항을 부과할 수 있습니다. 해당 거래소의 API 제한으로 인해 모든 심볼의 티커를 가져올 수 없는 경우도 있습니다. 일부 거래소는 HTTP URL 쿼리 파라미터에 심볼 목록을 허용하지만, URL 길이에는 제한이 있고 극단적인 경우 거래소에 수천 개의 마켓이 있을 수 있어 모든 심볼 목록이 URL에 맞지 않을 수 있으므로 제한된 심볼 부분 집합만 사용해야 합니다. 때로는 심볼 목록을 요구하는 다른 이유가 있을 수 있으며 한 번에 가져올 수 있는 심볼 수에 제한이 있을 수 있지만, 어떤 제한이든 거래소의 책임입니다. 관심 있는 심볼을 거래소에 전달하려면 fetchTickers의 첫 번째 인수로 문자열 목록을 제공할 수 있습니다:


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


대부분의 경우 심볼 목록은 필수가 아니지만, 거래소 측에서 부과될 수 있는 모든 가능한 제한을 처리하려면 추가 로직을 추가해야 합니다.

통합 CCXT API의 대부분의 메서드와 마찬가지로 fetchTickers의 마지막 인수는 거래소로 전송되는 요청 파라미터를 재정의하기 위한 `params` 인수입니다.

반환값의 구조는 다음과 같습니다:

```javascript
{
    'info':    { ... }, // the original JSON response from the exchange as is
    'BTC/USD': { ... }, // a single ticker for BTC/USD
    'ETH/BTC': { ... }, // a ticker for ETH/BTC
    ...
}
```

모든 거래소(해당 API 엔드포인트가 없는 거래소 포함)에서 모든 티커를 가져오는 일반적인 솔루션이 개발 중이며, 이 섹션은 곧 업데이트될 예정입니다.

```text
UNDER CONSTRUCTION
```

## OHLCV 캔들스틱 차트

대부분의 거래소는 OHLCV 데이터를 가져오는 엔드포인트를 제공하지만 일부는 그렇지 않습니다. `has['fetchOHLCV']`라는 거래소 불리언(true/false) 속성은 해당 거래소가 캔들스틱 데이터 시리즈를 지원하는지 여부를 나타냅니다.

거래소에서 OHLCV 캔들/바를 가져오기 위해 ccxt는 `fetchOHLCV` 메서드를 제공하며, 다음과 같이 선언됩니다:

```javascript
fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {})
```

다음과 같이 통합 `fetchOHLCV` / `fetch_ohlcv` 메서드를 호출하여 특정 심볼의 OHLCV 캔들 목록을 가져올 수 있습니다:


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


사용 가능한 타임프레임 목록을 보려면 `timeframes` 속성을 참조하십시오. 이 속성은 `has['fetchOHLCV']`가 true인 경우에만 채워진다는 점에 유의하십시오.

반환된 캔들 목록에는 지정된 시간 범위와 심볼에 대해 거래소에 거래가 없었던 경우 하나 이상의 누락된 기간이 있을 수 있습니다. 사용자에게는 연속적인 캔들 목록에서 공백으로 나타납니다. 이는 정상적인 현상입니다. 해당 시간에 거래소에 캔들이 없었다면 CCXT 라이브러리는 거래소 자체에서 반환된 결과를 그대로 표시합니다.

**요청이 거슬러 올라갈 수 있는 과거 시간에는 제한이 있습니다.** 대부분의 거래소는 너무 오래된 상세 캔들스틱 기록(예: 1분, 5분 타임프레임)을 조회할 수 없습니다. 일반적으로 각 타임프레임에 대해 최근 1000개의 캔들과 같이 적절한 양의 최신 캔들만 유지합니다. 이 제한은 최신 OHLCV를 지속적으로 가져와(*REST 폴링*) CSV 파일이나 데이터베이스에 저장하는 방식으로 극복할 수 있습니다.

**마지막(현재) 캔들의 정보는 캔들이 닫힐 때까지(다음 캔들이 시작될 때까지) 불완전할 수 있습니다.**

대부분의 다른 통합 및 암묵적 메서드와 마찬가지로 `fetchOHLCV` 메서드는 마지막 인수로 연관 배열(딕셔너리)의 추가 `params`를 받으며, 이는 거래소로 전송되는 요청의 [기본값을 재정의](#overriding-unified-api-params)하는 데 사용됩니다. `params`의 내용은 거래소마다 다르므로 지원되는 필드와 값에 대해서는 거래소의 API 문서를 참조하십시오.

`since` 인수는 **밀리초** 단위의 정수 UTC 타임스탬프입니다(라이브러리 전체에서 모든 통합 메서드에 적용됩니다).

`since`가 지정되지 않으면 `fetchOHLCV` 메서드는 거래소 자체의 기본값에 해당하는 시간 범위를 반환합니다. 이것은 버그가 아닙니다. 일부 거래소는 시간의 시작부터 캔들을 반환하고, 다른 거래소는 가장 최근 캔들만 반환합니다. 거래소의 기본 동작이 예상됩니다. 따라서 `since`를 지정하지 않으면 반환되는 캔들의 범위는 거래소마다 다릅니다. 정확히 필요한 기록 범위를 얻으려면 `since` 인수를 전달해야 합니다.

### 원시 OHLCV 응답 가져오기

현재 CCXT가 사용하는 구조에는 거래소의 원시 응답이 포함되지 않습니다. 그러나 사용자는 다음과 같이 반환값을 재정의할 수 있습니다:


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


### 지연 시간에 관한 참고 사항

트레이딩 전략은 기술적 분석, 지표 및 신호를 위한 최신 정보를 필요로 합니다. 거래소에서 받은 OHLCV 캔들을 기반으로 투기적 트레이딩 전략을 구축하는 것은 치명적인 단점이 있을 수 있습니다. 개발자는 성공적인 봇을 구축하기 위해 이 섹션에서 설명하는 세부 사항을 고려해야 합니다.

무엇보다도 먼저, CCXT를 사용할 때 거래소와 직접 통신합니다. CCXT는 서버도 아니고 서비스도 아니며 소프트웨어 라이브러리입니다. CCXT로 얻는 모든 데이터는 거래소에서 직접 1차적으로 수신됩니다.

거래소는 일반적으로 두 가지 범주의 공개 시장 데이터를 제공합니다:

1. 실시간 오더북과 거래 또는 체결을 포함하는 빠른 1차 데이터
2. 1차 데이터에서 계산되는 2차 티커 및 kline OHLCV 캔들을 포함하는 느린 2차 데이터

1차 데이터는 거래소 API에 의해 의사 실시간으로, 또는 가능한 한 실시간에 가깝게, 최대한 빠르게 업데이트됩니다. 2차 데이터는 거래소가 계산하는 데 시간이 필요합니다. 예를 들어 티커는 오더북과 거래의 롤링 24시간 통계 단면에 불과합니다. OHLCV 캔들과 거래량도 1차 거래에서 계산되며 특정 기간의 고정 통계 단면을 나타냅니다. 1시간 내에 거래된 거래량은 해당 시간 내에 발생한 해당 거래들의 거래량의 합계입니다.

분명히 거래소가 1차 데이터를 수집하고 이로부터 2차 통계 데이터를 계산하는 데는 시간이 걸립니다. 이는 **티커와 OHLCV가 항상 오더북과 거래보다 느리다**는 것을 의미합니다. 즉, 거래가 발생하는 순간과 거래소 API가 해당 OHLCV 캔들을 업데이트하거나 게시하는 순간 사이에는 거래소 API에서 항상 일정한 지연이 존재합니다.

지연 시간(또는 거래소 API가 2차 데이터를 계산하는 데 필요한 시간)은 거래소 엔진의 속도에 따라 다르므로 거래소마다 다릅니다. 최상위 거래소 엔진은 일반적으로 가장 최신 1분 OHLCV 캔들과 티커를 매우 빠른 속도로 반환하고 업데이트합니다. 일부 거래소는 초당 1회 또는 몇 초에 1회와 같이 정기적인 간격으로 업데이트할 수 있습니다. 느린 거래소 엔진은 2차 통계 정보를 업데이트하는 데 몇 분이 걸릴 수 있으며, API가 현재 가장 최근 OHLCV 캔들을 몇 분 늦게 반환할 수도 있습니다.

전략이 최신 1분 최신 데이터에 의존하는 경우 거래소에서 받은 티커나 OHLCV를 기반으로 구축하지 않는 것이 좋습니다. 티커와 거래소의 OHLCV는 표시 목적이나 지연에 덜 민감한 시간 단위 또는 일 단위 타임프레임의 단순한 트레이딩 전략에만 적합합니다.

다행히 시간에 민감한 트레이딩 전략 개발자들은 거래소의 2차 데이터에 의존할 필요가 없으며 사용자 영역에서 OHLCV와 티커를 계산할 수 있습니다. 이는 거래소가 자체적으로 정보를 업데이트할 때까지 기다리는 것보다 더 빠르고 효율적일 수 있습니다. 공개 거래 기록을 자주 폴링하여 집계하고 거래 목록을 순회하여 캔들을 계산할 수 있습니다. [examples 폴더](https://github.com/ccxt/ccxt/tree/master/examples) 내의 "build-ohlcv-bars" 파일을 참조하십시오.

내부 구현의 차이로 인해 거래소는 WebSocket을 통해 1차 및 2차 시장 데이터를 더 빠르게 업데이트할 수 있습니다. 거래소 엔진은 여전히 2차 데이터를 계산하는 데 시간이 필요하므로 CCXT로 RESTful API를 폴링하든 CCXT Pro로 WebSocket을 통해 업데이트를 받든 관계없이 지연 시간은 여전히 거래소마다 다릅니다. WebSocket은 네트워킹 지연 시간을 개선할 수 있으므로 빠른 거래소는 더 잘 작동하지만, WS 구독 지원을 추가한다고 해서 느린 거래소 엔진이 훨씬 빠르게 작동하지는 않습니다.

2차 데이터 지연 시간을 앞서가고 싶다면 자체적으로 계산하고 거래소 엔진보다 빠르게 처리해야 합니다. 애플리케이션의 요구에 따라 이는 까다로울 수 있는데, 중복성, 기록의 "데이터 공백", 거래소 다운타임, 그리고 이 매뉴얼에서 완전히 다루기 불가능한 하나의 방대한 분야인 데이터 집계의 다른 측면들을 처리해야 하기 때문입니다.


### 거래에서 OHLCV 바 구축

위 단락에서 언급했듯이 사용자는 `buildOHLCV / build_ohlcv` 메서드를 사용하여 수동으로 캔들을 구축할 수 있습니다. [examples 폴더](https://github.com/ccxt/ccxt/tree/master/examples) 내의 "build-ohlcv-bars"라는 예제 파일을 참조하십시오. 
참고 사항:
- 이 메서드는 제공된 거래가 시간순으로 정렬되어 있을 것을 기대합니다(가장 최신 거래가 배열의 마지막에 위치해야 합니다)
- `watch_ohlcv` 또는 다른 소스에서 오는 거래 항목 내부의 일부 가능한 오류로 인해 `build_ohlcv` 메서드 내에서 캔들의 왜곡된 값을 피하기 위해 가격이 `0`인 거래를 건너뜁니다. 그러나 이러한 거래 항목을 건너뛰지 않으려면 옵션을 설정하십시오:

```
exchange.options['buildOHLCV'] = {
    'skipZeroPrices': false
};
```

### OHLCV 구조

위에서 보여준 fetchOHLCV 메서드는 다음 구조로 표현되는 OHLCV 캔들의 목록(평면 배열)을 반환합니다:

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

캔들 목록은 오름차순(역사적/시간순) 정렬로 반환되며, 가장 오래된 캔들이 첫 번째, 가장 최근 캔들이 마지막에 위치합니다.

### 마크, 인덱스 및 프리미엄인덱스 캔들스틱 차트

과거의 마크, 인덱스 가격 및 프리미엄 인덱스 캔들스틱을 가져오려면 `fetchOHLCV`에 `'price'` [params-override](#overriding-unified-api-params)를 전달하세요. `'price'` 파라미터는 다음 중 하나의 값을 허용합니다:

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

편의 메서드 `fetchMarkOHLCV`, `fetchIndexOHLCV`, `fetchPremiumIndexOHLCV`도 있습니다.


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


## 퍼블릭 거래

```diff
- this is under heavy development right now, contributions appreciated
```

특정 심볼의 가장 최근 거래 목록을 가져오려면 통합 `fetchTrades` / `fetch_trades` 메서드를 호출할 수 있습니다. `fetchTrades` 메서드는 다음과 같이 선언됩니다:

```javascript
async fetchTrades (symbol, since = undefined, limit = undefined, params = {})
```

예를 들어, 모든 심볼의 최근 거래를 하나씩 순차적으로 출력하려면(레이트 리밋에 주의하세요!) 다음과 같이 하면 됩니다:


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


위에서 보여준 fetchTrades 메서드는 정렬된 거래 목록(타임스탬프 오름차순으로 정렬된 평면 배열, 가장 오래된 거래가 첫 번째, 가장 최근 거래가 마지막)을 반환합니다. 거래 목록은 [거래 구조](#trade-structure)로 표현됩니다.

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

대부분의 거래소는 각 거래에 대해 위의 필드 대부분을 반환하지만, 거래 유형, 방향, 거래 ID 또는 주문 ID를 반환하지 않는 거래소도 있습니다. 대부분의 경우 각 거래의 타임스탬프, 날짜시간, 심볼, 가격 및 수량은 보장됩니다.

두 번째 선택적 인수 `since`는 타임스탬프로 배열을 필터링하고, 세 번째 `limit` 인수는 반환되는 항목의 수(개수)를 제한합니다.

사용자가 `since`를 지정하지 않으면, `fetchTrades` 메서드는 거래소의 기본 퍼블릭 거래 범위를 반환합니다. 기본 세트는 거래소마다 다르며, 일부 거래소는 해당 페어가 거래소에 상장된 날짜부터 거래를 반환하고, 다른 거래소는 축소된 거래 세트(예: 최근 24시간, 최근 100건 등)를 반환합니다. 사용자가 시간대를 정확하게 제어하고 싶다면 `since` 인수를 직접 지정해야 합니다.

대부분의 통합 메서드는 단일 객체 또는 객체의 일반 배열(목록)을 반환합니다. 그러나 모든 거래를 한 번에 반환하는 거래소는 거의 없습니다. 대부분의 경우 거래소 API는 가장 최근 객체의 특정 수로 출력을 `limit`합니다. **단 한 번의 호출로 시작부터 현재까지의 모든 객체를 가져올 수는 없습니다**. 실제로, 그것을 허용하거나 용인하는 거래소는 거의 없습니다.

과거 거래를 가져오려면, 사용자는 데이터를 부분 또는 객체의 "페이지" 단위로 순회해야 합니다. 페이지네이션은 종종 루프 안에서 *"데이터 부분을 하나씩 가져오는 것"*을 의미합니다.

대부분의 경우 사용자는 **일관된 결과를 얻기 위해 최소한 어떤 형태의 페이지네이션을 사용해야 합니다**.

반면에, **일부 거래소는 퍼블릭 거래에 대한 페이지네이션을 전혀 지원하지 않습니다**. 일반적으로 거래소는 가장 최근 거래만 제공합니다.

`fetchTrades ()` / `fetch_trades()` 메서드는 네 번째 인수로 선택적 `params`(연관 키 배열/딕셔너리, 기본값은 비어 있음)도 허용합니다. 이를 사용하여 메서드 호출에 추가 파라미터를 전달하거나 특정 기본값을 재정의할 수 있습니다(거래소에서 지원하는 경우). 자세한 내용은 해당 거래소의 API 문서를 참조하세요.

## 거래소 시간

`fetchTime()` 메서드(사용 가능한 경우)는 거래소 서버에서 현재 정수형 타임스탬프를 밀리초 단위로 반환합니다.

```javascript
fetchTime(params = {})
```

## 거래소 상태

거래소 상태는 거래소 API 가용성에 대한 최신 알려진 정보를 설명합니다. 이 정보는 거래소 클래스에 하드코딩되거나 거래소 API에서 실시간으로 직접 가져옵니다. 이 정보를 얻기 위해 `fetchStatus(params = {})` 메서드를 사용할 수 있습니다. `fetchStatus`가 반환하는 상태는 다음 중 하나입니다:

- API가 중단되거나 종료된 경우와 같이 거래소 클래스에 하드코딩된 경우.
- 거래소 ping 또는 `fetchTime` 엔드포인트를 사용하여 활성 여부를 확인하도록 업데이트된 경우.
- 전용 거래소 API 상태 엔드포인트를 사용하여 업데이트된 경우.

```javascript
fetchStatus(params = {})
```

### 거래소 상태 구조

`fetchStatus()` 메서드는 아래와 같은 상태 구조를 반환합니다:

```javascript
{
    'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
    'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
    'eta': undefined, // when the maintenance or outage is expected to end
    'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
}
```

`status` 필드의 가능한 값은 다음과 같습니다:

- `'ok'`는 거래소 API가 완전히 작동 중임을 의미합니다
- `'shutdown'`은 거래소가 종료되었음을 의미하며, `updated` 필드에는 종료 날짜시간이 포함되어야 합니다
- `'error'`는 거래소 API가 중단되었거나 CCXT의 거래소 구현이 중단되었음을 의미합니다
- `'maintenance'`는 정기 유지보수를 의미하며, `eta` 필드에는 거래소가 다시 운영될 것으로 예상되는 날짜시간이 포함되어야 합니다

## 차입 금리

*마진 전용*

현물 시장에서 공매도하거나 레버리지로 거래할 때 통화를 빌려야 합니다. 차입한 통화에 대해 이자가 발생합니다.

통화의 차입 금리 데이터는 다음을 사용하여 가져올 수 있습니다:

- `fetchCrossBorrowRate ()` - 단일 통화의 차입 금리
- `fetchCrossBorrowRates ()` - 모든 통화의 차입 금리
- `fetchIsolatedBorrowRate ()` - 거래 페어의 차입 금리
- `fetchIsolatedBorrowRates ()` - 모든 거래 페어의 차입 금리
- `fetchBorrowRatesPerSymbol ()` - 개별 마켓의 통화별 차입 금리

```javascript
fetchCrossBorrowRate (code, params = {})
```

파라미터

- **code** (String) 통합 CCXT 통화 코드, 필수 (예: `"USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"settle": "USDT"}`)

반환값

- [차입 금리 구조](#borrow-rate-structure)

```javascript
fetchCrossBorrowRates (params = {})
```

파라미터

- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"startTime": 1610248118000}`)

반환값

- 통합 통화 코드를 키로 하는 [차입 금리 구조](#borrow-rate-structure) 딕셔너리

```javascript
fetchIsolatedBorrowRate (symbol, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 마켓 심볼, 필수 (예: `"BTC/USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"settle": "USDT"}`)

반환값

- [격리 차입 금리 구조](#isolated-borrow-rate-structure)

```javascript
fetchIsolatedBorrowRates (params = {})
```

파라미터

- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"startTime": 1610248118000}`)

반환값

- 통합 마켓 심볼을 키로 하는 [격리 차입 금리 구조](#isolated-borrow-rate-structure) 딕셔너리

### 격리 차입 금리 구조

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

### 차입 금리 구조

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

## 차입 금리 이력

*마진 전용*

`fetchBorrowRateHistory` 메서드는 특정 시간 슬롯에서의 통화 차입 이자율 이력을 가져옵니다.

```javascript
fetchBorrowRateHistory (code, since = undefined, limit = undefined, params = {})
```

파라미터

- **code** (String) *필수* 통합 CCXT 통화 코드 (예: `"USDT"`)
- **since** (Integer) 가장 이른 차입 금리의 타임스탬프 (예: `1645807945000`)
- **limit** (Integer) 가져올 최대 [차입 금리 구조](#borrow-rate-structure) 수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 추가 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [차입 금리 구조](#borrow-rate-structure)의 배열

## 레버리지 티어

*계약 전용*

- 레버리지 티어 메서드는 **binance**에서 프라이빗입니다

`fetchLeverageTiers()` 메서드를 사용하면 다양한 포지션 크기에서 마켓의 최대 레버리지를 확인할 수 있습니다. 또한 마켓 객체에서 해당 정보를 구할 수 없는 경우, 유지 증거금률과 마켓의 최대 거래 가능 금액을 얻는 데도 사용할 수 있습니다.

`market['limits']['leverage']['max']`에 접근하여 마켓의 절대 최대 레버리지를 구할 수 있지만, 많은 계약 마켓에서 최대 레버리지는 포지션 크기에 따라 달라집니다.

다음을 사용하여 해당 한도에 접근할 수 있습니다:

- `fetchMarketLeverageTiers()` (단일 심볼)
- `fetchLeverageTiers([symbol1, symbol2, ...])` (다중 심볼)
- `fetchLeverageTiers()` (모든 마켓 심볼)

```javascript
fetchMarketLeverageTiers(symbol, params = {})
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"settle": "usdt"}`)

반환값

- [레버리지 티어 구조](#leverage-tiers-structure)

```javascript
fetchLeverageTiers(symbols = undefined, params = {})
```

파라미터

- **symbols** (\[String\]) 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"settle": "usdt"}`)

반환값

- [레버리지 티어 구조](#leverage-tiers-structure)의 배열

### 레버리지 티어 구조

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

위 예시에서:

- 스테이크 133.33 미만       = 최대 레버리지 75
- 스테이크 200 + 1000       = 최대 레버리지 50
- 스테이크 금액 150         = 최대 레버리지 (10000 / 150)   = 66.66
- 스테이크 133.33-200 사이  = 최대 레버리지 (10000 / stake) = 50.01 -> 74.99

**Huobi 사용자를 위한 참고 사항:** Huobi는 유지 증거금률을 결정하기 위해 레버리지와 금액을 모두 사용합니다: https://www.huobi.com/support/en-us/detail/900000089903

## 펀딩 금리

*계약 전용*

현재, 가장 최근 및 다음 펀딩 금리 데이터는 다음 메서드를 사용하여 얻을 수 있습니다:

- `fetchFundingRates ()` - 모든 마켓 심볼
- `fetchFundingRates ([ symbol1, symbol2, ... ])` - 다중 마켓 심볼
- `fetchFundingRate (symbol)` - 단일 마켓 심볼

```javascript
fetchFundingRate (symbol, params = {})
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [펀딩 금리 구조](#funding-rate-structure)

```javascript
fetchFundingRates (symbols = undefined, params = {})
```

파라미터

- **symbols** (\[String\]) 통합 CCXT 심볼의 선택적 배열/목록 (예: `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- 마켓 심볼로 인덱싱된 [펀딩 금리 구조](#funding-rate-structure)의 배열

## 펀딩 간격

*계약 전용*

다음 메서드를 사용하여 현재 펀딩 간격을 가져옵니다:

- `fetchFundingInterval (symbol)` - 단일 마켓 심볼
- `fetchFundingIntervals ()` - 모든 마켓 심볼
- `fetchFundingIntervals ([ symbol1, symbol2, ... ])` - 다중 마켓 심볼

```javascript
fetchFundingInterval (symbol, params = {})
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [펀딩 금리 구조](#funding-rate-structure)

```javascript
fetchFundingIntervals (symbols = undefined, params = {})
```

파라미터

- **symbols** (\[String\]) 통합 CCXT 심볼의 선택적 배열/목록 (예: `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [펀딩 금리 구조](#funding-rate-structure)의 배열

### 펀딩 금리 구조

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

## 펀딩 금리 이력

*계약 전용*

```javascript
fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **since** (Integer) 가장 이른 펀딩 금리의 타임스탬프 (예: `1645807945000`)
- **limit** (Integer) 가져올 최대 펀딩 금리 수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 추가 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [펀딩 비율 히스토리 구조](#funding-rate-history-structure)의 배열

### Funding Rate History Structure

```javascript
{
    info: { ... },
    symbol: "BTC/USDT:USDT",
    fundingRate: -0.000068,
    timestamp: 1642953600000,
    datetime: "2022-01-23T16:00:00.000Z"
}
```

## Open Interest

*계약 전용*

거래소에서 심볼의 현재 미결제약정을 가져오려면 `fetchOpenInterest` 메서드를 사용하세요. 여러 심볼의 현재 미결제약정을 가져오려면 `fetchOpenInterests`를 사용하세요.

```javascript
fetchOpenInterest (symbol, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 시장 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [미결제약정 구조](#open-interest-structure)

```js
fetchOpenInterests (symbols = undefined, params = {})
```

- **symbols** ([String]) 통합 CCXT 심볼의 선택적 배열/목록 (예: `["BTC/USDT:USDT", "ETH/USDT:USDT"]`). 모든 심볼에 대해 `undefined`로 두세요.
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [미결제약정 구조](#open-interest-structure)의 딕셔너리

### Open Interest History

*계약 전용*

거래소에서 심볼의 미결제약정 히스토리를 가져오려면 `fetchOpenInterestHistory` 메서드를 사용하세요.

```javascript
fetchOpenInterestHistory (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 시장 심볼 (예: `"BTC/USDT:USDT"`)
- **timeframe** (String) 사용 가능한 값은 exchange.timeframes를 확인하세요
- **since** (Integer) 가장 오래된 미결제약정 기록의 타임스탬프 (예: `1645807945000`)
- **limit** (Integer) 가져올 [미결제약정 구조](#open-interest-structures)의 최대 개수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"endTime": 1645807945000}`)

**OKX 사용자 참고:** 통합 심볼 대신 okx.fetchOpenInterestHistory는 **symbol** 인수에 통합 통화 코드를 기대합니다 (예: `'BTC'`).

반환값

- [미결제약정 구조](#open-interest-structure)의 배열

### Open Interest Structure

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

## Historical Volatility

*옵션 전용*

거래소에서 옵션 기초자산 코드의 변동성 히스토리를 가져오려면 `fetchVolatilityHistory` 메서드를 사용하세요.

```javascript
fetchVolatilityHistory (code, params = {})
```

파라미터

- **code** (String) *필수* 통합 CCXT 통화 코드 (예: `"BTC"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [변동성 히스토리 구조](#volatility-structure)의 배열

### Volatility Structure

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

## Underlying Assets

*계약 전용*

거래소에서 계약 시장 유형에 대한 기초자산의 시장 ID를 가져오려면 `fetchUnderlyingAssets` 메서드를 사용하세요.

```javascript
fetchUnderlyingAssets (params = {})
```

파라미터

- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"instType": "OPTION"}`)
- **params.type** (String) 통합 marketType, 기본값은 'option' (예: `"option"`)

반환값

- [기초자산 구조](#underlying-assets-structure)

### Underlying Assets Structure

```javascript
[ 'BTC_USDT', 'ETH_USDT', 'DOGE_USDT' ]
```

## Settlement History

*계약 전용*

거래소에서 계약 시장의 공개 청산 히스토리를 가져오려면 `fetchSettlementHistory` 메서드를 사용하세요. 본인의 청산 히스토리만 가져오려면 `fetchMySettlementHistory`를 사용하세요.

```javascript
fetchMySettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchSettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 심볼 (예: `"BTC/USDT:USDT-230728-25500-P"`)
- **since** (Integer) 가장 오래된 청산의 타임스탬프 (예: `1694073600000`)
- **limit** (Integer) 가져올 최대 청산 수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [청산 히스토리 구조](#settlement-history-structure)의 배열

### Settlement History Structure

```javascript
{
    info: { ... },
    symbol: 'BTC/USDT:USDT-230728-25500-P',
    price: 25761.35807869,
    timestamp: 1694073600000,
    datetime: '2023-09-07T08:00:00.000Z',
}
```

## Liquidations

*마진 및 계약 전용*

거래소에서 거래 쌍의 공개 청산 내역을 가져오려면 `fetchLiquidations` 메서드를 사용하세요. 본인의 청산 히스토리만 가져오려면 `fetchMyLiquidations`를 사용하세요.

```javascript
fetchMyLiquidations (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchLiquidations (symbol, since = undefined, limit = undefined, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 심볼 (예: `"BTC/USDT:USDT-231006-25000-P"`)
- **since** (Integer) 가장 오래된 청산의 타임스탬프 (예: `1694073600000`)
- **limit** (Integer) 가져올 최대 청산 수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"until": 1645807945000}`)

반환값

- [청산 구조](#liquidation-structure)의 배열

### Liquidation Structure

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

## Greeks

*옵션 전용*

거래소에서 옵션 거래 쌍의 공개 그리스 지표 및 내재 변동성을 가져오려면 `fetchGreeks` 메서드를 사용하세요. 모든 심볼 또는 여러 심볼의 그리스 지표를 가져오려면 `fetchAllGreeks`를 사용하세요.
그리스 지표는 기초자산 가격, 만기까지의 시간, 변동성, 이자율과 같은 요소들이 옵션 계약의 가격에 미치는 영향을 측정합니다.

```javascript
fetchGreeks (symbol, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 심볼 (예: `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"category": "options"}`)

반환값

- [그리스 구조](#greeks-structure)

```javascript
fetchAllGreeks (symbols = undefined, params = {})
```

파라미터

- **symbols** (String) 통합 CCXT 심볼 (예: `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"category": "options"}`)

// for example
fetchAllGreeks () // all symbols
fetchAllGreeks ([ 'BTC/USD:BTC-240927-40000-C', 'ETH/USD:ETH-240927-4000-C' ]) // an array of specific symbols

반환값

- [그리스 구조](#greeks-structure)의 목록

### Greeks Structure

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

## Option Chain

*옵션 전용*

거래소에서 단일 옵션 계약의 공개 세부 정보를 가져오려면 `fetchOption` 메서드를 사용하세요.

```javascript
fetchOption (symbol, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 시장 심볼 (예: `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"category": "options"}`)

반환값

- [옵션 체인 구조](#option-chain-structure)

거래소에서 기초 통화의 공개 옵션 체인 데이터를 가져오려면 `fetchOptionChain` 메서드를 사용하세요.

```javascript
fetchOptionChain (code, params = {})
```

파라미터

- **code** (String) 통합 CCXT 통화 코드 (예: `"BTC"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"category": "options"}`)

반환값

- [옵션 체인 구조](#option-chain-structure)의 목록

### Option Chain Structure

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

## Long Short Ratio

*계약 전용*

심볼의 현재 롱숏 비율을 가져오려면 `fetchLongShortRatio` 메서드를 사용하고, 심볼의 롱숏 비율 히스토리를 가져오려면 `fetchLongShortRatioHistory`를 사용하세요.

- `fetchLongShortRatio (symbol, period)` 단일 시장 심볼의 현재 비율
- `fetchLongShortRatioHistory (symbol, period, since, limit)` 단일 시장 심볼의 비율 히스토리

```javascript
fetchLongShortRatio (symbol, period = undefined, params = {})
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **period** (String) 비율을 계산할 기간 (예: `"24h"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [롱숏 비율 구조](#long-short-ratio-structure)

```javascript
fetchLongShortRatioHistory (symbol = undefined, period = undefined, since = undefined, limit = undefined, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **period** (String) 비율을 계산할 기간 (예: `"24h"`)
- **since** (Integer) 가장 오래된 비율의 타임스탬프 (예: `1645807945000`)
- **limit** (Integer) 가져올 최대 비율 수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [롱숏 비율 구조](#long-short-ratio-structure)의 배열

### Long Short Ratio Structure

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

## Auto De Leverage

*계약 전용*

거래소에서 심볼의 자동 디레버리지 순위에 대한 공개 세부 정보를 가져오려면 `fetchADLRank` 메서드를 사용하세요.

```javascript
fetchADLRank (symbol, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 시장 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"category": "futures"}`)

반환값

- [자동 디레버리지 구조](#auto-de-leverage)

### Auto De Leverage Stucture

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

# Private API

- [인증](#authentication)
- [로그인](#sign-in)
- [API 키 설정](#api-keys-setup)
- [계정](#accounts)
- [계정 잔액](#account-balance)
- [주문](#orders)
- [내 거래 내역](#my-trades)
- [원장](#ledger)
- [입금](#deposit)
- [출금](#withdrawal)
- [입금 주소](#deposit-addresses)
- [이체](#transfers)
- [수수료](#fees)
- [이자 차입](#borrow-interest)
- [마진 차입 및 상환](#borrow-and-repay-margin)
- [마진](#margin)
- [마진 모드](#margin-mode)
- [레버리지](#leverage)
- [포지션](#positions)
- [펀딩 히스토리](#funding-history)
- [전환](#conversion)
- [자동 디레버리지](#auto-de-leverage)

사용자 계정에 접근하고, 시장가 및 지정가 주문을 통한 알고리즘 거래를 수행하고, 잔액을 조회하고, 자금을 입출금하는 등의 작업을 하려면 거래하려는 각 거래소에서 인증을 위한 API 키를 발급받아야 합니다. 보통 사용자 계정 설정의 별도 탭이나 페이지에서 이용할 수 있습니다. API 키는 거래소 고유의 것으로 어떠한 경우에도 교환하여 사용할 수 없습니다.

거래소의 프라이빗 API는 일반적으로 다음과 같은 유형의 상호작용을 허용합니다:

- 사용자 계정 잔액의 현재 상태는 [계정 잔액](#account-balance) 섹션에 설명된 `fetchBalance()` 메서드로 가져올 수 있습니다
- 사용자는 `createOrder()`, `cancelOrder()`로 주문을 생성 및 취소할 수 있으며, `fetchOrder`, `fetchOrders()`, `fetchOpenOrder()`, `fetchOpenOrders()`, `fetchCanceledOrders`, `fetchClosedOrder`, `fetchClosedOrders`와 같은 메서드로 현재 미체결 주문 및 과거 주문 히스토리를 가져올 수 있습니다. [주문](#orders) 섹션에 설명되어 있습니다
- 사용자는 `fetchMyTrades`를 사용하여 계정에서 실행된 과거 거래 히스토리를 조회할 수 있으며, [내 거래 내역](#my-trades) 섹션에 설명되어 있습니다. [주문과 거래의 관계](#how-orders-are-related-to-trades)도 참고하세요
- 사용자는 [포지션](#positions) 섹션에 설명된 `fetchPositions()` 및 `fetchPosition()`으로 포지션을 조회할 수 있습니다
- 사용자는 `fetchTransactions()`으로 거래 내역(거래소 계정으로의 _입금_ 또는 거래소 계정에서의 _출금_ 중 하나인 온체인 _거래_)을 가져오거나, 거래소 API에서 제공하는 항목에 따라 `fetchDeposit()`, `fetchDeposits()`, `fetchWithdrawal()`, `fetchWithdrawals()`를 별도로 사용할 수 있습니다
- 거래소 API가 원장 엔드포인트를 제공하는 경우, 사용자는 `fetchLedger`를 사용하여 거래, 입금, 출금, 계정 간 내부 이체, 리베이트, 보너스, 수수료, 스테이킹 수익 등 잔액에 영향을 미친 모든 자금 이동의 히스토리를 가져올 수 있습니다. [원장](#ledger) 섹션에 설명되어 있습니다.

## Authentication

모든 거래소와의 인증은 올바른 API 키가 제공되면 자동으로 처리됩니다. 인증 과정은 일반적으로 다음 패턴을 따릅니다:

1. 새로운 nonce를 생성합니다. nonce는 정수값으로, 주로 초 또는 밀리초 단위의 Unix 타임스탬프(에포크 1970년 1월 1일 기준)입니다. nonce는 특정 요청에 대해 고유해야 하며 지속적으로 증가해야 하므로, 어떤 두 요청도 동일한 nonce를 공유해서는 안 됩니다. 다음 요청은 항상 이전 요청보다 큰 nonce를 가져야 합니다. **기본 nonce는 32비트 Unix 타임스탬프(초 단위)입니다.**
2. 공개 apiKey와 nonce를 다른 엔드포인트 파라미터(있는 경우)에 추가한 후, 서명을 위해 전체를 직렬화합니다.
3. 시크릿 키를 사용하여 HMAC-SHA256/384/512 또는 MD5로 직렬화된 파라미터에 서명합니다.
4. Hex 또는 Base64로 인코딩된 서명과 nonce를 HTTP 헤더 또는 본문에 추가합니다.

이 과정은 거래소마다 다를 수 있습니다. 일부 거래소는 다른 인코딩 방식의 서명을 요구하고, 헤더 및 본문 파라미터 이름과 형식도 다를 수 있지만, 일반적인 패턴은 모두 동일합니다.

**동시에 여러 인스턴스에서, 별도의 스크립트 또는 여러 스레드에서 실행되는 동일한 거래소 인스턴스에 동일한 API 키 쌍을 공유하지 마십시오. 서로 다른 인스턴스에서 동시에 동일한 키 쌍을 사용하면 온갖 예상치 못한 동작이 발생할 수 있습니다.**

**다른 소프트웨어와 API 키를 재사용하지 마십시오! 다른 소프트웨어가 nonce를 너무 높게 만들 것입니다. [InvalidNonce](#invalid-nonce) 오류가 발생하면 무엇보다 먼저 새로운 키 쌍을 생성하십시오.**

인증은 이미 자동으로 처리되므로, 새로운 거래소 클래스를 구현하는 경우가 아니라면 위의 단계를 수동으로 수행할 필요가 없습니다. 거래에 필요한 것은 실제 API 키 쌍뿐입니다.

### API 키 설정

#### 필수 자격증명

API 자격증명에는 일반적으로 다음이 포함됩니다:

- `apiKey`. 이것은 공개 API 키 및/또는 토큰입니다. 이 부분은 *비밀이 아니며*, 요청 헤더 또는 본문에 포함되어 요청을 식별하기 위해 HTTPS를 통해 평문으로 전송됩니다. 주로 Hex 또는 Base64 인코딩의 문자열이거나 UUID 식별자입니다.
- `secret`. 이것은 개인 키입니다. 비밀로 유지하고 누구에게도 알려주지 마십시오. 거래소에 요청을 보내기 전에 로컬에서 요청에 서명하는 데 사용됩니다. 시크릿 키는 요청-응답 과정에서 인터넷을 통해 전송되지 않으며, 공개되거나 이메일로 전송되어서는 안 됩니다. nonce와 함께 암호학적으로 강력한 서명을 생성하는 데 사용됩니다. 해당 서명은 신원 인증을 위해 공개 키와 함께 전송됩니다. 각 요청은 고유한 nonce를 가지므로 고유한 암호화 서명을 갖습니다.
- `uid`. 일부 거래소(전부는 아님)는 사용자 ID 또는 줄여서 *uid*를 생성하기도 합니다. 문자열 또는 숫자 리터럴일 수 있습니다. 거래소에서 명시적으로 요구하는 경우 설정해야 합니다. 자세한 내용은 [해당 문서](#exchanges)를 참조하십시오.
- `password`. 일부 거래소(전부는 아님)는 거래를 위해 비밀번호/구문을 요구하기도 합니다. 거래소에서 명시적으로 요구하는 경우 이 문자열을 설정해야 합니다. 자세한 내용은 [해당 문서](#exchanges)를 참조하십시오.

API 키를 생성하려면 거래소 웹사이트의 사용자 설정에서 API 탭 또는 버튼을 찾으십시오. 그런 다음 키를 생성하고 설정 파일에 복사하여 붙여넣으십시오. 설정 파일 권한은 소유자 외에는 읽을 수 없도록 적절히 설정해야 합니다.

**apiKey와 시크릿 키를 무단 사용으로부터 안전하게 보관하고, 누구에게도 보내거나 알려주지 마십시오. 시크릿 키의 유출이나 보안 침해는 자금 손실을 초래할 수 있습니다.**

#### 자격증명 유효성 검사

사용자가 필요한 모든 자격증명을 제공했는지 확인하기 위해 `Exchange` 기본 클래스에는 `exchange.checkRequiredCredentials()` 또는 `exchange.check_required_credentials()`라는 메서드가 있습니다. 자격증명이 누락되거나 비어 있는 경우 해당 메서드를 호출하면 `AuthenticationError`가 발생합니다. `Exchange` 기본 클래스에는 아래와 같이 특정 거래소에 어떤 자격증명이 필요한지 사용자가 확인할 수 있는 `exchange.requiredCredentials` 속성도 있습니다:

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


#### API 키 구성

거래를 위한 거래소 설정은 기존 거래소 인스턴스에 API 자격증명을 할당하거나, 인스턴스화 시 거래소 생성자에 전달하면 됩니다:


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


거래를 시작하기 전에 API 자격증명을 설정하지 않으면 개인 요청이 예외 또는 오류와 함께 실패합니다. 문자 이스케이프를 방지하려면 **자격증명은 항상 작은따옴표로 작성하고**, 큰따옴표를 사용하지 마십시오 (`'VERY_GOOD'`, `"VERY_BAD"`).

#### API 키 권한
`"Invalid API-key, IP, or permissions for action."` 또는 `"API-key format invalid"`와 같은 오류가 발생하는 경우, 문제는 ccxt 내부에 있는 것이 아닐 가능성이 높습니다. 다음 사항을 확인하지 않은 한 새로운 이슈를 열지 마십시오:
1) 키에 오타, 공백, 따옴표가 없는지 확인하십시오
2) 현재 IP 주소([IPv4](https://api.ipify.org/) 또는 [IPv6](https://api64.ipify.org/) 확인)가 API-KEY의 화이트리스트에 추가되어 있는지 확인하십시오 (프록시를 사용하는 경우 해당 주소도 고려하십시오)
3) 해당 api-key에 대해 권한 목록에서 올바른 옵션을 선택했는지 확인하십시오
4) 스크립트에서 "testnet" api-key 또는 "testnet" 모드를 실수로 혼용하고 있지 않은지 확인하십시오
5) 이 오류에 대해 이미 [보고된 이슈](https://github.com/ccxt/ccxt/issues?q=is%3Aissue+%22Invalid+Api-Key+ID%22)를 확인하십시오


#### 로그인

일부 거래소는 개인 메서드를 호출하기 전에 로그인을 요구하며, 이는 `signIn` 메서드를 사용하여 수행할 수 있습니다


```javascript tab="JavaScript"
signIn (params = {})
```

파라미터

- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"2fa": "329293"}`)

반환값

- 거래소의 응답

## Nonce 재정의

**기본 nonce는 기본 거래소에서 정의됩니다. 초당 한 번 이상 개인 요청을 수행하려면 밀리초 nonce로 재정의할 수 있습니다! 대부분의 거래소는 속도 제한에 도달하면 요청을 제한하므로, 해당 거래소의 [API 문서](/docs/exchange-markets)를 꼼꼼히 읽으십시오!**

nonce를 초기화해야 하는 경우, 개인 API와 함께 사용할 다른 키 쌍을 생성하는 것이 훨씬 쉽습니다. 새 키를 생성하고 설정에서 사용하지 않은 새로운 키 쌍을 설정하는 것으로 보통 충분합니다.

경우에 따라 권한 부족 등의 이유로 새 키를 생성할 수 없을 수 있습니다. 그런 경우에도 nonce를 재정의할 수 있습니다. 기본 마켓 클래스에는 편의를 위한 다음 메서드들이 있습니다:

- `seconds ()`: Unix 타임스탬프를 초 단위로 반환합니다.
- `milliseconds ()`: 밀리초 단위로 동일한 값을 반환합니다 (ms = 1000 * s, 초의 1000분의 1).
- `microseconds ()`: 마이크로초 단위로 동일한 값을 반환합니다 (μs = 1000 * ms, 초의 100만분의 1).

API 문서에서 밀리초와 마이크로초를 혼동하는 거래소들이 있는데, 모두 이해해 주시기 바랍니다. 위에 나열된 메서드를 사용하여 nonce 값을 재정의할 수 있습니다. 여러 인스턴스에서 동시에 동일한 키 쌍을 사용해야 하는 경우, nonce 충돌을 방지하기 위해 클로저 또는 공통 함수를 사용하십시오. JavaScript에서는 거래소 생성자에 `nonce` 파라미터를 제공하거나 거래소 객체에 명시적으로 설정하여 nonce를 재정의할 수 있습니다:

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

Python과 PHP에서는 특정 거래소 클래스를 서브클래싱하고 nonce 함수를 재정의하여 동일한 작업을 수행할 수 있습니다:

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

## 계정

`fetchAccounts()` 메서드를 사용하여 프로필과 연결된 모든 계정을 조회할 수 있습니다

```javascript
fetchAccounts (params = {})
```

### 계정 구조

`fetchAccounts()` 메서드는 아래와 같은 구조를 반환합니다:

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

계정 유형은 [통합 계정 유형](####account-balance) 중 하나이거나 `subaccount`입니다

## 계정 잔액

잔액을 조회하고 거래에 사용 가능한 자금 또는 주문에 잠긴 자금의 양을 확인하려면 `fetchBalance` 메서드를 사용하십시오:

```javascript
fetchBalance (params = {})
```

파라미터

- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"currency": "usdt"}`)

반환값

- [잔액 구조](#balance-structure)

### 잔액 구조

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

기본 거래소에서 제공하지 않는 경우 `timestamp` 및 `datetime` 값이 undefined이거나 누락될 수 있습니다.

일부 거래소는 전체 잔액 정보를 반환하지 않을 수 있습니다. 많은 거래소는 비어 있거나 사용하지 않는 계정의 잔액을 반환하지 않습니다. 그런 경우 반환된 잔액 구조에서 일부 통화가 누락될 수 있습니다.
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


## 주문

```diff
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### 주문 조회

대부분의 경우 ID 또는 심볼로 주문을 조회할 수 있지만, 모든 거래소가 주문 조회를 위한 완전하고 유연한 엔드포인트 세트를 제공하는 것은 아닙니다. 일부 거래소는 최근 종료된 주문을 가져오는 메서드가 없을 수 있고, 다른 거래소는 ID로 주문을 조회하는 메서드가 없을 수 있습니다. ccxt 라이브러리는 가능한 경우 해결 방법을 마련하여 이러한 경우를 처리합니다.

주문 조회를 위한 메서드 목록은 다음과 같습니다:

- `fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchClosedOrder (id, symbol = undefined, params = {})`
- `fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOpenOrder (id, symbol = undefined, params = {})`
- `fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOrder (id, symbol = undefined, params = {})`
- `fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`

이러한 메서드의 이름은 해당 메서드가 단일 주문을 반환하는지 아니면 여러 주문(배열/목록)을 반환하는지를 나타냅니다. `fetchOrder()` 메서드는 필수 주문 ID 인수(문자열)가 필요합니다. 일부 거래소는 주문 ID가 다양한 거래 쌍과 겹칠 수 있는 경우, ID로 주문을 가져오기 위해 심볼도 요구합니다. 또한 위의 다른 모든 메서드는 주문 배열(목록)을 반환합니다. 대부분은 심볼 인수도 필요하지만, 일부 거래소는 심볼 미지정(*모든 심볼*을 의미) 조회를 허용합니다.

사용자가 거래소에서 사용할 수 없거나 ccxt에서 구현되지 않은 메서드를 호출하면 라이브러리는 NotSupported 예외를 발생시킵니다.

위의 메서드 중 사용 가능한 것이 있는지 확인하려면 거래소의 `.has` 속성을 확인하십시오:


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


`.has` 속성의 일반적인 구조에는 주문 조회를 위한 주문 API 메서드에 해당하는 다음 플래그가 포함되어 있습니다:

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

불리언 값 `true`와 `false`의 의미는 명확합니다. 문자열 값 `emulated`는 해당 메서드가 거래소 API에 없으며 ccxt가 가능한 경우 클라이언트 측에서 해결 방법을 사용한다는 것을 의미합니다.

#### 주문 API 설계 이해

거래소의 주문 관리 API는 설계 방식이 서로 다릅니다. 사용자는 각 특정 메서드의 목적과 이들이 어떻게 결합되어 완전한 주문 API를 구성하는지 이해해야 합니다:

- `fetchCanceledOrders()` - 취소된 주문 목록을 가져옵니다
- `fetchClosedOrder()` - 주문 ID로 단일 종료 주문을 가져옵니다
- `fetchClosedOrders()` – 종료된(또는 취소된) 주문 목록을 가져옵니다.
- `fetchMyTrades()` – 주문 API의 일부는 아니지만 밀접하게 관련되어 있으며, 체결된 거래 내역을 제공합니다.
- `fetchOpenOrder()` - 주문 ID로 단일 미체결 주문을 가져옵니다
- `fetchOpenOrders()` – 미체결 주문 목록을 가져옵니다.
- `fetchOrder()` – 주문 `id`로 단일 주문(미체결 또는 종료)을 가져옵니다.
- `fetchOrders()` – 모든 주문(미체결 또는 종료/취소된) 목록을 가져옵니다.
- `createOrder()` – 주문 생성에 사용됩니다
- `createOrders()` – 동일한 요청 내에서 여러 주문 생성에 사용됩니다
- `cancelOrder()` – 단일 주문 취소에 사용됩니다
- `cancelOrders()` - 여러 주문 취소에 사용됩니다
- `cancelAllOrders()` - 모든 주문 취소에 사용됩니다
- `cancelAllOrdersAfter()` - 지정된 타임아웃 이후 모든 주문 취소에 사용됩니다

대부분의 거래소는 현재 열려 있는 주문을 가져오는 방법을 제공합니다. 따라서 `exchange.has['fetchOpenOrders']`를 확인하세요. 해당 메서드를 사용할 수 없는 경우, 모든 주문 목록을 제공하는 `exchange.has['fetchOrders']`를 사용하면 됩니다. 거래소는 `fetchOpenOrders()` 또는 `fetchOrders()`를 통해 열린 주문 목록을 반환합니다. 두 메서드 중 하나는 보통 어느 거래소에서나 사용 가능합니다.

일부 거래소는 주문 내역을 제공하고, 다른 거래소는 제공하지 않습니다. 기반 거래소가 주문 내역을 제공하는 경우 `exchange.has['fetchClosedOrders']` 또는 `exchange.has['fetchOrders']`를 사용할 수 있습니다. 기반 거래소가 주문 내역을 제공하지 않는 경우 `fetchClosedOrders()`와 `fetchOrders()`를 사용할 수 없습니다. 후자의 경우, 사용자는 주문의 로컬 캐시를 직접 구축하고 `fetchOpenOrders()`와 `fetchOrder()`를 사용하여 열린 주문을 추적하면서, 더 이상 열려 있지 않은 주문을 사용자 영역에서 로컬로 닫힌 것으로 표시해야 합니다.

기반 거래소에 주문 내역을 위한 메서드(`fetchClosedOrders()`와 `fetchOrders()`)가 없는 경우, `fetchOpenOrders` + `fetchMyTrades`를 통한 거래 내역을 제공합니다([주문과 거래의 관계](#how-orders-are-related-to-trades) 참조). 이 정보 세트는 많은 경우 라이브 트레이딩 로봇에서 추적하기에 충분합니다. 주문 내역이 없다면 라이브 주문을 직접 추적하고 열린 주문과 과거 거래로부터 내역 정보를 복원해야 합니다.

일반적으로 기반 거래소는 보통 다음 유형의 과거 데이터 중 하나 이상을 제공합니다:

- `fetchClosedOrders()`
- `fetchOrders()`
- `fetchMyTrades()`

위 세 메서드 중 일부가 없을 수 있지만, 거래소 API는 보통 세 메서드 중 최소 하나는 제공합니다.

기반 거래소가 과거 주문 내역을 제공하지 않는 경우, CCXT 라이브러리는 누락된 기능을 에뮬레이션하지 않습니다 — 필요한 경우 사용자 측에서 추가해야 합니다.

**특정 메서드가 누락된 경우는 거래소에 해당 API 엔드포인트가 없거나, 또는 CCXT가 아직 구현하지 않았기 때문일 수 있습니다(라이브러리도 여전히 개발 중입니다). 후자의 경우, 누락된 메서드는 가능한 한 빨리 추가될 것입니다.**

#### 여러 주문 및 거래 조회

거래 목록과 주문 목록을 반환하는 모든 메서드는 두 번째 `since` 인수와 세 번째 `limit` 인수를 허용합니다:

- `fetchTrades()` (공개)
- `fetchMyTrades()` (비공개)
- `fetchOrders()`
- `fetchOpenOrders()`
- `fetchClosedOrders()`
- `fetchCanceledOrders()`

두 번째 인수 `since`는 타임스탬프를 기준으로 배열을 필터링하고, 세 번째 인수 `limit`는 반환 항목의 수(개수)를 제한합니다.

사용자가 `since`를 지정하지 않으면, `fetchTrades()/fetchOrders()` 메서드는 거래소의 기본 결과 집합을 반환합니다. 기본 집합은 거래소마다 다르며, 일부 거래소는 해당 페어가 거래소에 상장된 날짜부터 거래 또는 최근 주문을 반환하고, 다른 거래소는 줄어든 거래 또는 주문 집합(예: 최근 24시간, 최근 거래 100건, 첫 번째 주문 100건 등)을 반환합니다. 사용자가 시간 범위를 정밀하게 제어하려면 `since` 인수를 지정해야 합니다.

**참고: 모든 거래소가 시작 시간으로 거래 및 주문 목록을 필터링하는 수단을 제공하지는 않으므로, `since`와 `limit` 지원은 거래소마다 다릅니다. 그러나 대부분의 거래소는 추가 `params` 인수로 재정의할 수 있는 "페이지네이션" 및 "스크롤링"을 위한 대안을 최소한 하나는 제공합니다.**

일부 거래소는 닫힌 주문이나 모든 주문을 가져오는 메서드가 없습니다. 이런 거래소는 `fetchOpenOrders()` 엔드포인트만 제공하고, 때로는 `fetchOrder` 엔드포인트도 함께 제공합니다. 이러한 거래소에는 주문 내역을 가져오는 메서드가 없습니다. 해당 거래소의 주문 내역을 유지하려면 사용자가 사용자 영역에서 주문 딕셔너리 또는 데이터베이스를 저장하고 `createOrder()`, `fetchOpenOrders()`, `cancelOrder()`, `cancelAllOrders()` 같은 메서드를 호출한 후 데이터베이스의 주문을 업데이트해야 합니다.

#### 주문 ID로 조회

특정 주문의 상세 정보를 ID로 가져오려면 `fetchOrder()` / `fetch_order()` 메서드를 사용하세요. 일부 거래소는 ID로 특정 주문을 가져올 때도 심볼을 요구합니다.

fetchOrder/fetch_order 메서드의 시그니처는 다음과 같습니다:

```javascript
if (exchange.has['fetchOrder']) {
    //  you can use the params argument for custom overrides
    let order = await exchange.fetchOrder (id, symbol = undefined, params = {})
}
```

**일부 거래소는 ID로 주문을 가져오는 엔드포인트가 없으며, ccxt는 가능한 경우 이를 에뮬레이션합니다.** 현재 이 기능이 누락된 곳이 있을 수 있으며, 이는 여전히 개발 중입니다.

필요한 경우 특정 주문 유형이나 다른 설정을 제공하기 위해 추가 params 인수에 커스텀 재정의 키-값을 전달할 수 있습니다.

아래는 인증된 거래소 인스턴스에서 fetchOrder 메서드를 사용하여 주문 정보를 가져오는 예시입니다:

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


#### 모든 주문

```javascript
if (exchange.has['fetchOrders'])
    exchange.fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

**일부 거래소는 모든 주문을 가져오는 엔드포인트가 없으며, ccxt는 가능한 경우 이를 에뮬레이션합니다.** 현재 이 기능이 누락된 곳이 있을 수 있으며, 이는 여전히 개발 중입니다.

#### 열린 주문

```javascript
if (exchange.has['fetchOpenOrders'])
    exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

#### 닫힌 주문

*닫힌 주문*과 *거래* 또는 *체결*을 혼동하지 마세요! 하나의 주문은 여러 반대 방향 거래로 닫힐(체결될) 수 있습니다! 따라서 *닫힌 주문*은 *거래*와 동일하지 않습니다. 일반적으로 주문에는 `fee`가 없지만, 각각의 사용자 거래에는 `fee`, `cost` 및 기타 속성이 있습니다. 그러나 많은 거래소는 이러한 속성을 주문에도 전파합니다.

**일부 거래소는 닫힌 주문을 가져오는 엔드포인트가 없으며, ccxt는 가능한 경우 이를 에뮬레이션합니다.** 현재 이 기능이 누락된 곳이 있을 수 있으며, 이는 여전히 개발 중입니다.

```javascript
if (exchange.has['fetchClosedOrders'])
    exchange.fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

### 주문 구조

ccxt 통합 API 내에서 주문을 반환하는 대부분의 메서드는 아래에 설명된 주문 구조를 반환합니다:

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

- 주문의 `status`는 보통 `'open'`(미체결 또는 부분 체결), `'closed'`(완전 체결), 또는 `'canceled'`(미체결 취소 또는 부분 체결 후 취소) 중 하나입니다.
- 일부 거래소는 새 주문을 제출할 때 만료 타임스탬프를 지정할 수 있습니다. 해당 시간까지 주문이 체결되지 않으면 `status`가 `'expired'`로 변경됩니다.
- `filled` 값을 사용하여 주문이 체결되었는지, 부분 체결되었는지, 완전히 체결되었는지, 그리고 얼마나 체결되었는지 확인하세요.
- `'fee'` 정보 작업은 아직 진행 중이며, 거래소 기능에 따라 수수료 정보가 부분적으로 또는 전체적으로 누락될 수 있습니다.
- `fee` 통화는 거래된 두 통화 모두와 다를 수 있습니다(예: USD로 수수료가 부과되는 ETH/BTC 주문).
- `lastTradeTimestamp` 타임스탬프는 거래소에서 지원하지 않거나 열린 주문(아직 체결되지 않은 주문)의 경우 값이 없을 수 있으며 `undefined/None/null`일 수 있습니다.
- `lastTradeTimestamp`가 있는 경우, 주문이 완전히 또는 부분적으로 체결된 경우의 마지막 거래 타임스탬프를 나타내며, 그렇지 않으면 `lastTradeTimestamp`는 `undefined/None/null`입니다.
- 주문 `status`는 `lastTradeTimestamp`보다 우선합니다.
- 주문의 `cost`는: `{ filled * price }`
- 주문의 `cost`는 주문의 총 *호가* 거래량을 의미합니다(`amount`는 *기준* 거래량). `cost` 값은 실제로 가장 최근에 알려진 주문 비용과 최대한 가깝게 유지해야 합니다. `cost` 필드 자체는 편의를 위한 것으로, 다른 필드에서 유추할 수 있습니다.
- `clientOrderId` 필드는 [커스텀 주문 매개변수](#custom-order-params)를 사용하여 주문을 제출할 때 사용자가 설정할 수 있습니다. `clientOrderId`를 사용하면 사용자가 나중에 자신의 주문들을 구별할 수 있습니다. 이는 현재 `clientOrderId`를 지원하는 거래소에서만 사용 가능합니다.

#### timeInForce

`timeInForce` 필드는 거래소에서 지정되지 않은 경우 `undefined/None/null`일 수 있습니다. `timeInForce`의 통합은 진행 중입니다.

`timeInForce` 필드의 가능한 값:

- `'GTC'` = _Good Till Cancel(ed)_, 주문이 체결되거나 취소될 때까지 오더북에 남아 있습니다.
- `'IOC'` = _Immediate Or Cancel_, 주문이 즉시 체결되어야 하며 부분적으로 또는 완전히 체결되고 미체결 나머지는 취소됩니다(또는 전체 주문이 취소됩니다).
- `'FOK'` = _Fill Or Kill_, 주문이 즉시 완전히 체결되고 닫혀야 하며, 그렇지 않으면 전체 주문이 취소됩니다.
- `'PO'` = _Post Only_, 주문이 메이커 주문으로 제출되거나 취소됩니다. 이는 주문이 미체결 상태로 최소한 일정 시간 동안 오더북에 올라가야 함을 의미합니다. `PO`를 `timeInForce` 옵션으로 통합하는 작업은 `exchange.has['createPostOnlyOrder'] == True`인 통합 거래소와 함께 진행 중입니다.

### 주문 제출

사용자가 거래소에 보낼 수 있는 다양한 유형의 주문이 있으며, 일반 주문은 해당 심볼의 오더북에 등재되고, 다른 주문은 더 고급 형태일 수 있습니다. 다양한 주문 유형을 설명하는 목록은 다음과 같습니다:

- [지정가 주문](#limit-orders) – 기준 통화로 `amount`(얼마나 사거나 팔고 싶은지)와 호가 통화로 `price`(어떤 가격에 사거나 팔고 싶은지)를 가진 일반 주문.
- [시장가 주문](#market-orders) – 기준 통화로 `amount`(얼마나 사거나 팔고 싶은지)를 가진 일반 주문
  - [시장가 매수](#market-buys) – 일부 거래소는 호가 통화로 `amount`를 지정하는 시장가 매수 주문을 요구합니다(얼마나 쓰고 싶은지).
- [트리거 주문](#conditional-orders) 또는 *조건부 주문* – 시장에서 특정 조건을 기다렸다가 자동으로 반응하는 고급 주문 유형: `triggerPrice`에 도달하면 트리거 주문이 활성화되고 일반 지정가 `price` 또는 시장가 주문이 제출되어 최종적으로 포지션 진입 또는 청산이 이루어집니다.
- [손절 주문](#stop-loss-orders) – 트리거 주문과 거의 동일하지만 해당 포지션의 추가 손실을 막기 위해 포지션을 청산하는 데 사용됩니다: 가격이 `triggerPrice`에 도달하면 손절 주문이 활성화되어 특정 지정가 `price` 또는 시장가로 포지션을 청산하는 일반 지정가 또는 시장가 주문이 제출됩니다(손절 주문이 첨부된 포지션).
- [이익 실현 주문](#take-profit-orders) – 손절 주문의 반대로, 해당 포지션의 기존 수익을 실현하기 위해 포지션을 청산하는 데 사용됩니다: 가격이 `triggerPrice`에 도달하면 이익 실현 주문이 활성화되어 특정 지정가 `price` 또는 시장가로 포지션을 청산하는 일반 지정가 또는 시장가 주문이 제출됩니다(이익 실현 주문이 첨부된 포지션).
- [포지션에 첨부된 손절 및 이익 실현 주문](#stoploss-and-takeprofit-orders-attached-to-a-position) – 위에 나열된 유형의 세 주문으로 구성된 고급 주문: 포지션 진입을 위해 제출된 일반 지정가 또는 시장가 주문과 함께 해당 포지션이 열릴 때 함께 제출되어 나중에 해당 포지션을 청산하는 데 사용될 손절 및/또는 이익 실현 주문이 포함됩니다(손절이 도달하면 포지션을 청산하고 이익 실현 주문을 취소하며, 반대로 이익 실현이 도달하면 포지션을 청산하고 손절 주문을 취소합니다. 이 두 주문을 "OCO 주문 – 하나가 나머지를 취소"라고도 합니다). 포지션을 열기 위한 `amount`(지정가 주문의 경우 `price`) 외에도 손절 주문을 위한 `triggerPrice`(손절 지정가 주문의 경우 지정가 `price`)와/또는 이익 실현 주문을 위한 `triggerPrice`(이익 실현 지정가 주문의 경우 지정가 `price`)가 필요합니다.
- [추적 주문](#trailing-orders) – 열린 포지션에 상대적으로 자동으로 조정되는 주문으로, `trailingAmount`를 설정하여 지정된 호가 금액만큼 열린 포지션 뒤를 추적하거나 `trailingPercent`를 설정하여 지정된 비율만큼 열린 포지션 뒤를 추적할 수 있으며, 포지션의 시장가가 추적 주문과 같아지면 추적 주문에 `reduceOnly` 매개변수가 true로 설정되어 있는지 여부에 따라 새 포지션 진입 또는 포지션 청산이 이루어집니다.

주문을 하려면 항상 사용자가 지정해야 하는 `symbol`이 필요합니다(어떤 마켓에서 거래할지).

주문을 하려면 `createOrder` 메서드를 사용하세요. 반환된 통합 [주문 구조체](#order-structure)의 `id`를 사용하여 나중에 주문 상태를 조회할 수 있습니다. 여러 주문을 동시에 해야 하는 경우 `createOrders` 메서드의 가용성을 확인할 수 있습니다.

```javascript
createOrder (symbol, type, side, amount, price = undefined, params = {})
```

```javascript
createOrders (orders, params = {}) // orders is a list in which each element contains a symbol, type, side, amount, price and params
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 마켓 심볼
  - 해당 심볼이 대상 거래소에 존재하고 거래 가능한지 확인하세요.
- **side** *필수* 주문 방향을 나타내는 문자열 리터럴.
  **통합 방향:**
  - `buy` 호가 통화를 제공하고 기준 통화를 받습니다. 예를 들어 `BTC/USD`를 매수한다는 것은 달러로 비트코인을 받는다는 의미입니다.
  - `sell` 기준 통화를 제공하고 호가 통화를 받습니다. 예를 들어 `BTC/USD`를 매도한다는 것은 비트코인으로 달러를 받는다는 의미입니다.
- **type** 주문 유형의 문자열 리터럴
  **통합 유형:**
  - [market](#market-orders) 일부 거래소에서는 허용되지 않습니다. 자세한 내용은 [해당 문서](#exchanges)를 참조하세요.
  - [limit](#limit-orders)
  - 비통합 유형은 #custom-order-params 및 #other-order-types를 참조하세요.
- **amount** 거래하려는 통화의 양. 일반적으로(항상은 아님) 거래 쌍 심볼의 기준 통화 단위로 지정합니다. (일부 거래소의 단위는 주문 방향에 따라 다를 수 있습니다. 자세한 내용은 해당 API 문서를 참조하세요.)
- **price** 주문이 체결될 가격으로 호가 통화 단위로 지정합니다. (시장가 주문에서는 무시됨)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"settle": "usdt"}`)

반환값

- 주문 성공 시 [주문 구조체](#order-structure)를 반환합니다.

**createOrder에 관한 참고사항**

- 일부 거래소는 지정가 주문만 허용합니다.

반환된 주문 구조체의 일부 필드는 거래소 API 응답에서 해당 정보가 반환되지 않는 경우 `undefined / None / null`일 수 있습니다. `createOrder` 메서드는 최소한 주문 `id`와 `info`(거래소의 원시 응답 "있는 그대로")를 포함하는 통합 [주문 구조체](#order-structure)를 반환하도록 보장됩니다:

```javascript
{
    'id': 'string',  // order id
    'info': { ... }, // decoded original JSON response from the exchange as is
}
```

##### 일반적인 주의사항

- 계약 마켓에서 주문을 생성할 때 발생하는 일반적인 오류가 있습니다:

```
"must be greater than minimum amount precision of 1"
```

이 오류는 거래소가 `createOrder`의 `amount` 인수에서 자연수 형태의 계약 수(1, 2, 3 등)를 기대할 때 발생합니다. [마켓 구조체](#market-structure)에는 `contractSize`라는 키가 있습니다. 각 계약은 `contractSize`에 의해 결정되는 특정 양의 기준 자산에 해당합니다. 계약 수에 `contractSize`를 곱하면 기준 수량이 됩니다. `기준 수량 = (계약 수 * contractSize)`이므로 `amount` 인수에 입력해야 할 계약 수를 구하려면 다음과 같이 계산합니다: `계약 수 = (기준 수량 / contractSize)`.

다음은 `contractSize`를 찾는 예입니다:
```python
await exchange.loadMarkets()
symbol = 'BTC/USDT:USDT'
market = exchange.market(symbol)
print(market['contractSize'])

# Let's say you want to convert 0.5 BTC to the number of contracts:
number_contracts = round((0.5 * 1) / market['contractSize'])
```

#### 지정가 주문

지정가 주문은 거래자가 지정한 가격으로 거래소 주문 장에 등록됩니다. 동일한 마켓에서 더 나은 가격의 주문이 없고, 다른 거래자가 지정가 주문의 가격과 같거나 초과하는 가격으로 [시장가 주문](#market-orders) 또는 반대 방향의 주문을 생성할 때 체결(완료)됩니다.

지정가 주문은 완전히 체결되지 않을 수도 있습니다. 이는 체결 주문의 수량이 지정가 주문에서 지정한 수량보다 적을 때 발생합니다.

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

#### 시장가 주문

*다음과 같은 이름으로도 알려져 있습니다*

- 시장 가격 주문
- 현물 가격 주문
- 즉시 주문

시장가 주문은 거래소 주문 장의 매도 측에 이미 존재하는 하나 이상의 주문을 체결함으로써 즉시 실행됩니다. 시장가 주문이 체결하는 주문은 주문 장 스택의 상단에서 선택되므로, 시장가 주문은 최적의 가격에서 체결됩니다. 시장가 주문을 할 때 가격을 지정할 필요가 없으며, 가격을 지정해도 무시됩니다.

주문을 하기 전에 관찰한 가격으로 주문이 실행된다는 보장은 없습니다. 여기에는 다음과 같은 여러 가지 이유가 있습니다:

- **가격 슬리피지** 주문이 실행되는 동안 거래 마켓의 가격이 약간 변동하는 현상. 가격 슬리피지의 원인에는 다음이 포함되지만 이에 국한되지 않습니다:

    - 네트워크 왕복 지연
    - 거래소의 높은 부하
    - 가격 변동성

- **불균등한 주문 크기** 시장가 주문의 수량이 주문 장 최상단 주문의 크기보다 큰 경우, 최상단 주문이 체결된 후 시장가 주문은 주문 장의 다음 주문을 체결하게 됩니다. 즉, 시장가 주문이 여러 가격에서 체결된다는 의미입니다.

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

**일부 거래소는 시장가 주문을 허용하지 않습니다(지정가 주문만 허용).** 해당 거래소가 시장가 주문을 지원하는지 프로그래밍 방식으로 감지하려면 `.has['createMarketOrder']` 거래소 속성을 사용할 수 있습니다:

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


#### 시장가 매수

일반적으로 `market buy` 또는 `market sell` 주문을 할 때 사용자는 매수하거나 매도할 기준 통화의 수량만 지정하면 됩니다. 그러나 일부 거래소에서는 시장가 매수 주문의 가치 계산 방식이 다릅니다.

BTC/USD를 거래하고 있고 현재 BTC 시장 가격이 9000 USD를 초과한다고 가정합니다. 시장가 매수 또는 시장가 매도의 경우 `amount`를 2 BTC로 지정할 수 있으며, 그 결과 주문 방향에 따라 계좌에 _대략_ 18000 USD(더하거나 빼거나 ;))가 반영됩니다.

**일부 거래소에서는 시장가 매수 시 호가 통화로 총 주문 비용을 요구합니다!** 그 이면의 논리는 간단합니다. 매수하거나 매도할 기준 통화의 수량을 받는 대신, 일부 거래소는 _"총 얼마의 호가 통화를 소비할 것인지"_ 로 운영됩니다.

이러한 거래소에서 시장가 매수 주문을 하려면 2 BTC의 수량을 지정하는 것이 아니라, 이 예시에서는 18000 USD와 같이 주문의 총 비용을 지정해야 합니다. `market buy` 주문을 이런 방식으로 처리하는 거래소에는 `createMarketBuyOrderRequiresPrice` 거래소 전용 옵션이 있어 두 가지 방법으로 `market buy` 주문의 총 비용을 지정할 수 있습니다.

첫 번째는 기본값으로, `amount`와 함께 `price`를 지정하면 총 주문 비용이 라이브러리 내부에서 두 값을 단순 곱셈(`cost = amount * price`)으로 계산됩니다. 결과로 계산된 `cost`는 이 시장가 매수 주문에 소비될 USD 호가 통화 금액이 됩니다.

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

두 번째 방법은 사용자가 직접 주문의 총 비용을 계산하여 지정하려는 경우에 유용합니다. `createMarketBuyOrderRequiresPrice` 옵션을 `false`로 설정하여 비활성화하면 됩니다:

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

추가 정보:

- https://github.com/ccxt/ccxt/issues/564#issuecomment-347458566
- https://github.com/ccxt/ccxt/issues/4914#issuecomment-478199357
- https://github.com/ccxt/ccxt/issues/4799#issuecomment-470966769
- https://github.com/ccxt/ccxt/issues/5197#issuecomment-496270785

#### 지정가 주문으로 시장가 주문 에뮬레이션

`limit` 주문으로 `market` 주문을 에뮬레이션하는 것도 가능합니다.

**경고: 이 방법은 높은 변동성으로 인해 위험할 수 있습니다. 자신의 책임 하에 사용하고, 무엇을 하는지 정확히 이해할 때만 사용하세요!**

대부분의 경우 `market sell`은 매우 낮은 가격의 `limit sell`로 에뮬레이션할 수 있습니다. 거래소는 이를 자동으로 시장 가격(주문 장에서 현재 최선의 가격)의 테이커 주문으로 만들어줍니다. 거래소가 매우 낮은 가격에 매도하는 것을 감지하면 주문 장에서 이용 가능한 최선의 매수자 가격을 자동으로 제공합니다. 이는 사실상 시장가 매도 주문을 하는 것과 같습니다. 따라서 시장가 주문은 지정가 주문으로 에뮬레이션할 수 있습니다(시장가 주문이 없는 경우).

반대의 경우도 마찬가지입니다. `market buy`는 매우 높은 가격의 `limit buy`로 에뮬레이션할 수 있습니다. 대부분의 거래소는 최선의 가격, 즉 시장 가격으로 주문을 체결합니다.

그러나 이 방법에만 완전히 의존해서는 안 됩니다. **항상 먼저 소량으로 테스트하세요!** 거래소의 웹 인터페이스에서 먼저 로직을 확인해볼 수 있습니다. 지정된 지정가 가격으로 최소 수량을 매도(만일의 경우를 대비해 손실 가능한 금액)한 다음 거래 내역에서 실제 체결 가격을 확인하세요.

#### 지정가 주문

지정가 주문은 *limit orders*라고도 합니다. 일부 거래소는 지정가 주문만 허용합니다. 지정가 주문은 주문과 함께 가격(단위당 비율)을 제출해야 합니다. 거래소는 시장 가격이 원하는 수준에 도달하는 경우에만 지정가 주문을 체결합니다.

```javascript
// camelCaseStyle
exchange.createLimitBuyOrder (symbol, amount, price[, params])
exchange.createLimitSellOrder (symbol, amount, price[, params])

// underscore_style
exchange.create_limit_buy_order (symbol, amount, price[, params])
exchange.create_limit_sell_order (symbol, amount, price[, params])
```


#### 조건부 주문

전통적인 거래에서 "스톱 주문"이라는 용어는 다소 모호했기 때문에, CCXT에서는 이 대신 "트리거" 주문이라는 용어를 사용합니다. 심볼의 가격이 "트리거"("스톱") 가격에 도달하면, 선택한 유형에 따라 주문이 `market` 또는 `limit` 주문으로 활성화됩니다.

트리거 주문의 분류는 다음과 같습니다:
1) 코인을 매수/매도(포지션 열기/닫기)하는 독립적인 [트리거 주문](#trigger-order)
2) 오픈 포지션을 닫기 위해 설계된 독립적인 [스톱 로스](#stop-loss-orders) 또는 [테이크 프로핏](#take-profit-orders)
3) 기본 주문에 연결된 스톱 로스 또는 테이크 프로핏 주문 ([조건부 트리거 주문](#stoploss-and-takeprofit-orders-attached-to-a-position))


##### 트리거 주문

거래소 웹사이트에서 볼 수 있는 전통적인 "스톱" 주문은 이제 CCXT 라이브러리에서 "트리거" 주문이라고 불립니다. `triggerPrice` 파라미터를 추가하여 구현됩니다. 이는 포지션을 열거나 닫을 수 있는 독립적인 기본 트리거 주문입니다.

* 거래소가 이 기능을 지원하는지 확인하려면 `exchange.features`를 확인하거나 헬퍼 메서드 `exchange.featureValue('BTC/USDT', 'createOrder', 'triggerPrice')`를 사용하세요.
* 일반적으로 기초 자산/계약의 가격이 **어느 방향에서든** `triggerPrice`를 넘으면 활성화됩니다. 그러나 일부 거래소 API는 가격이 `triggerPrice` 위 또는 아래인지에 따라 주문을 트리거하는 `triggerDirection`도 설정해야 합니다. 예를 들어, 쌍의 가격이 `1700`을 넘으면 지정가 주문(0.1 `ETH`를 지정가 `1500`에 매수)을 트리거하려는 경우:


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


일반적으로 거래소는 `triggerPrice`의 방향(현재 가격보다 "위"인지 "아래"인지)을 자동으로 결정하지만, 일부 거래소에서는 `ascending` 또는 `descending` 값으로 `triggerDirection`을 제공해야 합니다:

```
params = {
    'triggerPrice': 1700,
    'triggerDirection': 'ascending', // order will be triggered when price goes upward and touches 1700
}
```

트리거 주문에 `reduceOnly: true` 파라미터(및 `triggerDirection: 'ascending/descending'` 파라미터 추가 가능)를 추가하면 "스톱 로스" 또는 "테이크 프로핏" 주문으로 동작하게 할 수 있습니다. 그러나 일부 거래소에서는 `reduceOnly` 및 `triggerDirection` 처리를 자동으로 포함하는 "스톱 로스"와 "테이크 프로핏" 트리거 주문 유형을 지원합니다(아래 내용 참조).

##### 스톱 로스 주문

트리거 주문과 동일하지만 방향이 중요합니다. `stopLossPrice` 파라미터(스탑 로스 triggerPrice용)를 지정하여 구현되며, 사용자를 대신하여 `triggerDirection`도 자동으로 설정됩니다. 따라서 일반 트리거 주문 대신 이를 대안으로 사용할 수 있습니다.

* 거래소가 이 기능을 지원하는지 확인하려면 `exchange.features`를 확인하거나 헬퍼 메서드 `exchange.featureValue('BTC/USDT', 'createOrder', 'stopLossPrice')`를 사용하세요.

1000에서 롱 포지션(매수)에 진입했고 700 아래로 가격이 하락할 가능성에 따른 손실을 보호하고 싶다고 가정합니다. triggerPrice를 700으로 설정한 스탑 로스 주문을 넣으면 됩니다. 해당 스탑 로스 주문에 대해 지정가를 설정하거나 시장가로 체결될 수 있습니다.

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

700에서 숏 포지션(매도)에 진입했고 1300 위로 가격이 급등할 가능성에 따른 손실을 보호하고 싶다고 가정합니다. triggerPrice를 1300으로 설정한 스탑 로스 주문을 넣으면 됩니다. 해당 스탑 로스 주문에 대해 지정가를 설정하거나 시장가로 체결될 수 있습니다.

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

스탑 로스 주문은 기초 자산/계약의 가격이 다음과 같을 때 발동됩니다:

* 매도 주문의 경우, `stopLossPrice` 아래로 떨어질 때. (예: 롱 포지션을 청산하고 추가 손실을 방지하기 위해)
* 매수 주문의 경우, `stopLossPrice` 위로 올라올 때. (예: 숏 포지션을 청산하고 추가 손실을 방지하기 위해)


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


##### 이익 실현 주문 (Take Profit Orders)

스탑 로스 주문과 동일하지만 방향이 중요합니다. `takeProfitPrice` 파라미터(이익 실현 triggerPrice용)를 지정하여 구현됩니다.

1000에서 롱 포지션(매수)에 진입했고 1300 위로 가격이 급등할 가능성으로부터 수익을 얻고 싶다고 가정합니다. triggerPrice를 1300으로 설정한 이익 실현 주문을 넣으면 됩니다. 해당 이익 실현 주문에 대해 지정가를 설정하거나 시장가로 체결될 수 있습니다.

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

700에서 숏 포지션(매도)에 진입했고 600 아래로 가격이 하락할 가능성으로부터 수익을 얻고 싶다고 가정합니다. triggerPrice를 600으로 설정한 이익 실현 주문을 넣으면 됩니다. 해당 이익 실현 주문에 대해 지정가를 설정하거나 시장가로 체결될 수 있습니다.

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

이익 실현 주문은 기초 자산의 가격이 다음과 같을 때 발동됩니다:

* 매도 주문의 경우, `takeProfitPrice` 위로 올라올 때. (예: 수익을 내며 롱 포지션을 청산하기 위해)
* 매수 주문의 경우, `takeProfitPrice` 아래로 떨어질 때. (예: 수익을 내며 숏 포지션을 청산하기 위해)


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


#### 포지션에 연결된 스탑 로스 및 이익 실현 주문

포지션 개설 기본 주문에 연결된 **이익 실현** / **스탑 로스** 주문입니다. 각각을 설명하는 `stopLoss` 및 `takeProfit`에 대한 딕셔너리 파라미터를 제공하여 구현됩니다.

* 기본적으로 스탑 로스 및 이익 실현 주문 수량은 기본 주문과 동일하지만 반대 방향입니다.
* 연결된 트리거 주문은 기본 주문이 체결되는 것을 조건으로 합니다.
* 모든 거래소에서 지원되지는 않습니다. 스탑 로스가 지원되는지 확인하려면 다음 방법을 사용하세요:
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


연결된 SL 및 TP를 사용할 수 없는 거래소의 경우, 진입 주문을 제출한 후 즉시 `params`에 `stopLossPrice/takeProfitPrice`를 포함한 또 다른 주문(또는 `triggerPrice`와 `reduceOnly: true`)을 제출할 수 있습니다(포지션이 아직 열리지 않았을 수 있음에도). 이렇게 하면 예정된 포지션에 대한 스탑 로스 주문으로 작동할 수 있습니다(이 방법은 일부 거래소에서는 작동하지 않을 수 있습니다).

예시:

```
    symbol = 'ADA/USDT:USDT'
    main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
    tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
    sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
```

#### 트레일링 주문 (Trailing Orders)

**트레일링** 주문은 열린 포지션을 추적합니다. `trailingPercent` 또는 `trailingAmount`에 대한 실수 파라미터를 제공하여 구현됩니다.

* 트레일링 주문은 현재 시장 가격에서 고정된 비율 또는 고정된 호가 금액만큼 떨어진 주문 가격을 지속적으로 조정합니다.
* 트레일링 주문은 포지션이 한 방향으로 움직일 때는 추적하지만 반대 방향으로는 추적하지 않습니다.
* 포지션 가치가 상승하면 트레일링 주문이 변경되지만, 포지션 가치가 하락하면 주문이 체결될 때까지 트레일링 주문은 그대로 유지됩니다.
* 트레일링 주문은 포지션을 연 후 독립적으로 넣을 수 있습니다.
* 거래소에 따라 `trailingPercent` 또는 `trailingAmount` 파라미터 중 하나를 채워 구현됩니다.
* 가격 인수는 `trailingTriggerPrice`로 사용할 수 있으며, 필요한 경우 타입 인수를 사용하여 지정가 및 시장가 트레일링 주문을 구분할 수 있습니다.

*모든 거래소에서 지원되지는 않습니다.*

*참고: 이 기능은 아직 통합 작업 중이며 진행 중입니다*


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


#### 커스텀 주문 파라미터 (Custom Order Params)

일부 거래소에서는 주문에 대한 선택적 파라미터를 지정할 수 있습니다. 통합 API 호출의 `params` 인수를 사용하여 선택적 파라미터를 전달하고 연관 배열로 쿼리를 재정의할 수 있습니다. 모든 커스텀 파라미터는 물론 거래소별로 다르며 상호 교환이 불가능합니다. 한 거래소의 커스텀 파라미터가 다른 거래소에서 작동할 것으로 기대하지 마세요.


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


##### 사용자 정의 `clientOrderId`

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

사용자는 `params`로 주문을 넣을 때 커스텀 `clientOrderId` 필드를 설정할 수 있습니다. `clientOrderId`를 사용하면 나중에 자신의 주문을 구분할 수 있습니다. 이는 현재 `clientOrderId`를 지원하는 거래소에서만 사용 가능합니다. 지원하지 않는 거래소의 경우 `clientOrderId`를 제공하면 오류를 발생시키거나 `clientOrderId`를 `undefined/None/null`로 설정하여 무시합니다.


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


##### 주문에 대한 헤지 모드

거래소가 `hedged` 주문에 대한 [기능](#features)을 지원하는 경우, 사용자는 `createOrder`에서 `params['hedged'] = true`를 전달하여 기본 `one-way` 모드 주문 대신 `hedged` 포지션을 열 수 있습니다. 그러나 거래소가 `.has['setPositionMode']`를 지원하는 경우, 해당 거래소는 `createOrder`를 통해 `hedged` 파라미터를 직접 지원하지 않을 수 있습니다. 이런 경우 먼저 [setPositionMode()](#set-position-mode)를 사용하여 계정 모드를 변경한 다음 (`hedged` 파라미터 없이) `createOrder`를 실행하면 기본적으로 헤지 주문이 넣어집니다.


### 주문 수정

주문을 수정하려면 `editOrder` 메서드를 사용할 수 있습니다.

```javascript
editOrder (id, symbol, type, side, amount, price = undefined, params = {})
```

파라미터

- **id** (String) *필수* 주문 ID (예: `1645807945000`)
- **symbol** (String) *필수* 통합 CCXT 시장 심볼
- **side** (String) *필수* 주문 방향.
  **통합 방향:**
  - `buy` 호가 통화를 제공하고 기초 통화를 받습니다. 예를 들어, `BTC/USD`를 매수하면 달러로 비트코인을 받습니다.
  - `sell` 기초 통화를 제공하고 호가 통화를 받습니다. 예를 들어, `BTC/USD`를 매도하면 비트코인으로 달러를 받습니다.
- **type** (String) *필수* 주문 유형
  **통합 유형:**
  - [`market`](#market-orders) 일부 거래소에서는 허용되지 않습니다. 자세한 내용은 [해당 문서](#exchanges)를 참조하세요.
  - [`limit`](#limit-orders)
  - 비통합 유형에 대해서는 #custom-order-params 및 #other-order-types를 참조하세요.
- **amount** (Number) *필수* 거래하려는 통화의 양. 일반적으로 (항상 그런 것은 아니지만) 거래 쌍 심볼의 기초 통화 단위로 표시됩니다. (일부 거래소의 단위는 주문 방향에 따라 다를 수 있습니다. 자세한 내용은 해당 API 문서를 참조하세요.)
- **price** (Float) 주문이 체결될 가격으로 호가 통화 단위로 표시됩니다 (시장가 주문에서는 무시됨).
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"settle": "usdt"}`)

반환값

- [주문 구조체](#order-structure)

### 주문 취소

기존 주문을 취소하려면 다음을 사용하세요.

- `cancelOrder ()` 단일 주문용
- `cancelOrders ()` 여러 주문용
- `cancelAllOrders ()` 모든 미결 주문용
- `cancelAllOrdersAfter ()` 주어진 타임아웃 이후 모든 미결 주문용

```javascript
cancelOrder (id, symbol = undefined, params = {})
```

파라미터

- **id** (String) *필수* 주문 ID (예: `1645807945000`)
- **symbol** (String) 통합 CCXT 시장 심볼. 일부 거래소에서 **필수** (예: `"BTC/USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"settle": "usdt"}`)

반환값

- [주문 구조체](#order-structure)

```javascript
cancelOrders (ids, symbol = undefined, params = {})
```

파라미터

- **ids** (\[String\]) *필수* 주문 ID들 (예: `1645807945000`)
- **symbol** (String) 통합 CCXT 시장 심볼. 일부 거래소에서 **필수** (예: `"BTC/USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"settle": "usdt"}`)

반환값

- [주문 구조체](#order-structure) 배열

```javascript
async cancelAllOrders (symbol = undefined, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 시장 심볼. 일부 거래소에서 **필수** (예: `"BTC/USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: `{"settle": "usdt"}`)

반환값

- [주문 구조체](#order-structure) 배열

```javascript
async cancelAllOrdersAfter (timeout, params = {})
```

파라미터

- **timeout** (number) 밀리초 단위의 카운트다운 시간. 일부 거래소에서 **필수**이며, 0은 타이머를 취소합니다 (예: ``10``\ )
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 파라미터 (예: ``{"type": "spot"}``\ )

반환값

- 객체

#### 주문 취소 시 예외 처리

`cancelOrder()`는 일반적으로 미결 주문에만 사용됩니다. 그러나 취소 요청이 도착하기 전에 주문이 체결(채워지고 종료)될 수 있으므로, 취소 요청이 이미 종료된 주문에 닿을 수 있습니다.

취소 요청은 주문이 성공적으로 취소되었는지 여부와 재시도가 필요한지 여부를 나타내는 `OperationFailed`를 발생시킬 수도 있습니다. `cancelOrder()`를 연속으로 호출하면 이미 취소된 주문에 닿을 수도 있습니다.

따라서 `cancelOrder()`는 다음 경우에 `OrderNotFound` 예외를 발생시킬 수 있습니다:
- 이미 종료된 주문 취소
- 이미 취소된 주문 취소

## 나의 거래 내역

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### 주문과 거래의 관계

거래는 흔히 `체결(fill)`이라고도 합니다. 각 거래는 주문 체결의 결과입니다. 주문과 거래는 일대다 관계입니다. 하나의 주문 체결이 여러 거래를 발생시킬 수 있습니다. 그러나 하나의 주문이 반대 방향의 다른 주문과 매칭되면 두 매칭 주문 쌍이 하나의 거래를 발생시킵니다. 따라서 하나의 주문이 여러 반대 방향 주문과 매칭되면, 매칭된 주문 쌍당 하나의 거래씩 여러 거래가 발생합니다.

간단히 말해, 하나의 주문은 *하나 이상*의 거래를 포함할 수 있습니다. 다시 말하면, 주문은 하나 이상의 거래로 *체결*될 수 있습니다.

예를 들어, 호가창에 다음과 같은 주문이 있을 수 있습니다 (어떤 거래 심볼이나 페어든 상관없이):

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

위의 모든 특정 숫자는 실제 수치가 아니며, 이는 단지 주문과 거래가 일반적으로 어떻게 연관되어 있는지를 설명하기 위한 것입니다.

매도자는 매도호가 측에 가격 0.700, 수량 150의 매도 지정가 주문을 넣기로 결정합니다.

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

들어오는 매도(매도호가) 주문의 가격과 수량이 하나 이상의 매수 주문(주문 `b`와 `i`)을 커버하므로, 다음 일련의 이벤트가 거래소 엔진 내에서 매우 빠르게(즉시는 아니지만) 발생합니다:

1. 주문 `b`는 가격이 교차하기 때문에 들어오는 매도 주문과 매칭됩니다. 두 주문의 수량은 서로 *"상호 소멸"*하여, 매수자는 0.800의 가격으로 100을 받습니다. 매도자(매도호가)는 0.800의 가격으로 매수 수량 100만큼 매도 주문이 부분 체결됩니다. 체결된 부분에 대해 매도자는 처음에 요청한 것보다 더 좋은 가격을 받습니다. 최소 0.7을 요청했지만 더 나은 0.8을 받았습니다. 대부분의 기존 거래소는 가능한 최상의 가격으로 주문을 체결합니다.

2. 주문 `b`에 대해 들어오는 매도 주문과의 체결이 발생합니다. 해당 체결은 주문 `b` 전체를 *"채우고"* 매도 주문의 대부분을 채웁니다. 체결은 매칭된 주문 쌍마다 하나씩 생성되며, 수량이 완전히 채워졌든 부분적으로 채워졌든 상관없습니다. 이 예에서 매도자 수량(100)은 주문 `b`를 완전히 채우고(주문 `b`를 종료), 매도 주문도 부분적으로 채웁니다(주문서에서 열린 상태로 유지).

3. 주문 `b`는 이제 `closed` 상태이며 채워진 수량은 100입니다. 매도 주문에 대한 하나의 체결을 포함합니다. 매도 주문은 `open` 상태이며 채워진 수량은 100입니다. 주문 `b`에 대한 하나의 체결을 포함합니다. 따라서 각 주문은 지금까지 하나의 체결만 가지고 있습니다.

4. 들어오는 매도 주문의 채워진 수량은 100이며, 초기 총수량 150 중 아직 채워야 할 나머지 수량 50이 남아 있습니다.

주문서의 중간 상태는 다음과 같습니다(주문 `b`는 `closed` 상태이며 더 이상 주문서에 없음):

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

5. 주문 `i`는 가격이 교차하기 때문에 들어오는 매도의 나머지 부분과 매칭됩니다. 매수 주문 `i`의 수량인 200은 남은 매도 수량 50을 완전히 소멸시킵니다. 주문 `i`는 50만큼 부분적으로 채워지지만, 나머지 수량인 150은 주문서에 남아 있게 됩니다. 그러나 매도 주문은 이 두 번째 매칭으로 완전히 이행됩니다.

6. 주문 `i`에 대해 들어오는 매도 주문과의 체결이 생성됩니다. 해당 체결은 주문 `i`를 부분적으로 채웁니다. 그리고 매도 주문의 채움을 완료합니다. 다시 말하지만, 이것은 매칭된 주문 쌍에 대한 하나의 체결입니다.

7. 주문 `i`는 이제 `open` 상태이며 채워진 수량은 50, 남은 수량은 150입니다. 매도 주문에 대한 하나의 체결을 포함합니다. 매도 주문은 이제 `closed` 상태이며 초기 총수량 150을 완전히 채웠습니다. 그러나 첫 번째는 주문 `b`, 두 번째는 주문 `i`에 대한 두 개의 체결을 포함합니다. 따라서 각 주문은 거래소 엔진이 수량을 어떻게 매칭했느냐에 따라 하나 이상의 체결을 가질 수 있습니다.

위의 순서가 진행된 후 업데이트된 주문서는 다음과 같습니다.

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

주문 `b`가 사라졌으며 매도 주문도 없는 것을 확인하세요. 종료되고 완전히 채워진 모든 주문은 주문서에서 사라집니다. 부분적으로 채워졌고 남은 수량이 있으며 `open` 상태인 주문 `i`는 여전히 남아 있습니다.

### 개인 체결 내역

대부분의 통합 메서드는 단일 객체 또는 객체의 일반 배열(목록)을 반환합니다(체결). 그러나 극소수의 거래소(있다면)만이 모든 체결을 한 번에 반환합니다. 대부분의 경우 API는 가장 최근 객체의 일정 수로 출력을 `limit`합니다. **단 하나의 호출로 시작부터 현재까지의 모든 객체를 가져올 수 없습니다**. 실질적으로 극소수의 거래소만이 이를 허용합니다.

과거 데이터를 가져오는 다른 모든 통합 메서드와 마찬가지로, `fetchMyTrades` 메서드는 [날짜 기반 페이지네이션](#date-based-pagination)을 위한 `since` 인수를 받습니다. CCXT 라이브러리 전반의 모든 다른 통합 메서드와 마찬가지로, `fetchMyTrades`의 `since` 인수는 **밀리초 단위의 정수 타임스탬프**여야 합니다.

과거 체결 내역을 가져오려면 사용자가 데이터를 부분 또는 "페이지" 단위로 순회해야 합니다. 페이지네이션은 종종 루프에서 *"데이터를 하나씩 부분적으로 가져오는 것"*을 의미합니다.

많은 경우 거래소 API에서 `symbol` 인수가 필요하므로, 모든 체결 내역을 가져오려면 모든 심볼을 반복해야 합니다. `symbol`이 누락되고 거래소에서 이를 요구하는 경우 CCXT는 사용자에게 요구 사항을 알리기 위해 `ArgumentsRequired` 예외를 발생시킵니다. 그런 다음 `symbol`을 지정해야 합니다. 한 가지 접근 방식은 잔액이 0이 아닌 항목과 트랜잭션(출금 및 입금)을 살펴보면서 모든 심볼 목록에서 관련 심볼을 필터링하는 것입니다. 또한 거래소는 얼마나 과거까지 거슬러 올라갈 수 있는지에 대한 제한이 있습니다.

대부분의 경우 사용자는 예상 결과를 일관되게 얻기 위해 **적어도 일부 유형의 [페이지네이션](#pagination)을 사용해야 합니다**.


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


정렬된 체결 배열 `[]`을 반환합니다(가장 최근 체결이 마지막).

#### 체결 구조

체결은 특정 코인의 이전을 나타내는 [트랜잭션](#transaction-structure)과 달리, 하나의 통화와 다른 통화 간의 교환을 나타냅니다.

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

- `'fee'` 및 `'fees'` 정보에 대한 작업은 아직 진행 중이며, 거래소 기능에 따라 수수료 정보가 부분적으로 또는 완전히 누락될 수 있습니다.
- `fee` 통화는 거래된 두 통화 모두와 다를 수 있습니다(예: USD로 수수료가 부과되는 ETH/BTC 주문).
- 체결의 `cost`는 `amount * price`를 의미합니다. 이는 체결의 총 *호가* 수량입니다(`amount`는 *기준* 수량). `cost` 필드 자체는 편의를 위해 제공되며 다른 필드에서 도출할 수 있습니다.
- 체결의 `cost`는 _"총"_ 값입니다. 즉, 수수료 전 값이며 수수료는 이후에 적용되어야 합니다.

### 주문 ID별 체결

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


## 원장

원장은 사용자가 수행한 변경 사항, 작업 또는 어떤 방식으로든 사용자의 잔액을 변경한 작업의 기록, 즉 다음을 포함하는 사용자의 모든 계정에서/으로의 모든 자금 이동 내역입니다

- 입금 및 출금(펀딩)
- 체결 또는 주문의 결과로 들어오고 나가는 금액
- 거래 수수료
- 계정 간 이체
- 리베이트, 캐시백 및 기타 회계 대상 이벤트 유형

원장 항목에 대한 데이터는 다음을 사용하여 가져올 수 있습니다

- `fetchLedgerEntry ()` - 단일 원장 항목
- `fetchLedger ( code )` - 동일 통화의 여러 원장 항목
- `fetchLedger ()` - 모든 원장 항목

```javascript
fetchLedgerEntry (id, code = undefined, params = {})
```

매개변수

- **id** (String) *필수* 원장 항목 ID
- **code** (String) 통합 CCXT 통화 코드, 필수 (예: `"USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 매개변수 (예: `{"type": "deposit"}`)

반환값

- [원장 항목 구조](#ledger-entry-structure)

```javascript
async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {})
```

매개변수

- **code** (String) 통합 CCXT 통화 코드; 모든 자산의 모든 원장 항목을 한 번에 가져오는 것이 지원되지 않는 경우 *필수* (예: `"USDT"`)
- **since** (Integer) 출금을 가져올 가장 이른 시간의 타임스탬프(ms) (예: `1646940314000`)
- **limit** (Integer) 가져올 [원장 항목 구조](#ledger-entry-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [원장 항목 구조](#ledger-entry-structure)의 배열

### 원장 항목 구조

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

#### 원장 항목 구조에 대한 참고 사항

원장 항목의 유형은 이와 관련된 작업의 유형입니다. 금액이 매도 주문으로 인해 발생하는 경우 해당 거래 유형 원장 항목과 연결되며, referenceId에는 관련 거래 ID가 포함됩니다(해당 거래소에서 제공하는 경우). 금액이 출금으로 인해 발생하는 경우 해당 트랜잭션과 연결됩니다.

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

`referenceId` 필드에는 원장에 새 항목을 추가하여 등록된 해당 이벤트의 ID가 저장됩니다.

`status` 필드는 원장에 보류 중인 변경 사항과 취소된 변경 사항을 포함하는 거래소를 지원하기 위해 존재합니다. 원장은 실제로 발생한 변경 사항을 자연스럽게 나타내므로, 대부분의 경우 상태는 `'ok'`입니다.

원장 항목 유형은 일반 체결, 자금 트랜잭션(입금 또는 출금) 또는 동일 사용자의 두 계정 간 내부 `transfer`와 연결될 수 있습니다. 원장 항목이 내부 이체와 연결된 경우 `account` 필드에는 해당 원장 항목으로 변경되는 계정의 ID가 포함됩니다. `referenceAccount` 필드에는 `direction`(`'in'` 또는 `'out'`)에 따라 자금이 이체되는/에서 이체되는 반대 계정의 ID가 포함됩니다.

## 입금

거래소에 암호화폐 자금을 입금하려면 `fetchDepositAddress`를 사용하여 입금하려는 통화에 대한 주소를 거래소에서 가져와야 합니다. 그런 다음 지정된 통화와 주소로 `withdraw` 메서드를 호출할 수 있습니다.

거래소에 법정 통화를 입금하려면 `fetchDepositMethodId` 메서드에서 가져온 데이터와 함께 `deposit` 메서드를 사용할 수 있습니다.
*이 입금 기능은 현재 coinbase에서만 지원되며, 발견한 문제를 자유롭게 보고해 주세요*

- `deposit ()`

```javascript
deposit (id, code = undefined, params = {})
```

매개변수

- **id** (String) *필수* 입금 ID
- **code** (String) 법정 통화 코드, 필수 (예: `"USD"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 매개변수 (예: `{"account": "fiat"}`)

반환값

- [트랜잭션 구조](#transaction-structure)

- `fetchDepositMethodId ()`

```javascript
fetchDepositMethodId (id, params = {})
```

매개변수

- **id** (String) *필수* 입금 ID
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 매개변수 (예: `{"account": "fiat"}`)

반환값

- [입금 ID 구조](#deposit-id-structure)

- `fetchDepositMethodIds ()`

```javascript
fetchDepositMethodIds (params = {})
```

매개변수

- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 매개변수 (예: `{"account": "fiat"}`)

반환값

- [입금 ID 구조](#deposit-id-structure)의 배열

### 입금 ID 구조

`fetchDepositMethodId`, `fetchDepositMethodIds`에서 반환된 입금 ID 구조는 다음과 같습니다:

```javascript
{
    'info': {},                 // raw unparsed data as returned from the exchange
    'id': '75ab52ff-f25t',      // the deposit id
    'currency': 'USD',          // fiat currency
    'verified': true,           // whether funding through this id is verified or not
    'tag': 'from credit card',  // tag / memo / name of funding source
}
```

계정에 입금된 데이터는 다음을 사용하여 가져올 수 있습니다

- `fetchDeposit ()` - 단일 입금
- `fetchDeposits ( code )` - 동일 통화의 여러 입금
- `fetchDeposits ()` - 계정의 모든 입금

```javascript
fetchDeposit (id, code = undefined, params = {})
```

매개변수

- **id** (String) *필수* 입금 ID
- **code** (String) 통합 CCXT 통화 코드, 필수 (예: `"USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 매개변수 (예: `{"network": "TRX"}`)

반환값

- [트랜잭션 구조](#transaction-structure)

```javascript
fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})
```

매개변수

- **code** (String) 통합 CCXT 통화 코드 (예: `"USDT"`)
- **since** (Integer) 입금을 가져올 가장 이른 시간의 타임스탬프(ms) (예: `1646940314000`)
- **limit** (Integer) 가져올 [트랜잭션 구조](#transaction-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특정한 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [트랜잭션 구조](#transaction-structure)의 배열

## 출금

`withdraw` 메서드는 계정에서 자금을 출금하는 데 사용할 수 있습니다

일부 거래소는 2FA(2단계 인증)를 통해 각 출금에 대한 수동 승인을 요구합니다. 출금을 승인하려면 일반적으로 이메일 수신함의 비밀 링크를 클릭하거나, 해당 웹사이트에서 Google Authenticator 코드 또는 Authy 코드를 입력하여 출금 트랜잭션이 의도적으로 요청되었음을 확인해야 합니다.

경우에 따라 출금 ID를 사용하여 나중에 출금 상태를 확인하고(성공 여부), 거래소에서 지원하는 경우 2FA 확인 코드를 제출할 수도 있습니다. 자세한 내용은 [해당 문서](#exchanges)를 참조하세요.

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


매개변수

- **code** (String) *필수* 통합 CCXT 통화 코드 (예: `"USDT"`)
- **amount** (Float) *필수* 출금할 통화의 양 (예: `20`)
- **address** (String) *필수* 출금 수신자 주소 (예: `"TEY6qjnKDyyq5jDc3DJizWLCdUySrpQ4yp"`)
- **tag** (String) 일부 네트워크에서 필수 (예: `"52055"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"network": "TRX"}`)

반환값

- [거래 구조](#transaction-structure)

---

계정에 대한 출금 데이터는 다음을 사용하여 조회할 수 있습니다

- `fetchWithdrawal ()` 단일 출금
- `fetchWithdrawals ( code )` 동일 통화의 복수 출금
- `fetchWithdrawals ()` 계정의 모든 출금

```javascript
fetchWithdrawal (id, code = undefined, params = {})
```

매개변수

- **id** (String) *필수* 출금 ID
- **code** (String) 통합 CCXT 통화 코드 (예: `"USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"network": "TRX"}`)

```javascript
fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})
```

매개변수

- **code** (String) 통합 CCXT 통화 코드 (예: `"USDT"`)
- **since** (Integer) 출금 조회를 시작할 가장 이른 시간의 타임스탬프 (ms) (예: `1646940314000`)
- **limit** (Integer) 조회할 [거래 구조](#transaction-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [거래 구조](#transaction-structure)의 배열

### 입출금 네트워크

태그 지정 여부와 관계없이 네 번째 인수로 매개변수를 전달하는 것도 가능합니다

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


다음 `network` 별칭을 사용하면 여러 체인에서 암호화폐를 출금할 수 있습니다

| 통화 | 네트워크 |
|:---:|:---:|
| ETH  | ERC20 |
| TRX  | TRC20 |
| BSC  | BEP20 |
| BNB  | BEP2  |
| HT   | HECO  |
| OMNI | OMNI  |

TRON 체인에서 USDT를 출금하려면 `exchange.withdraw ('USDT', 100, 'TVJ1fwyJ1a8JbtUxZ8Km95sDFN9jhLxJ2D', { 'network': 'TRX' })` 값을 설정하거나, Binance Smart Chain에서 USDT를 출금하려면 'BSC'를 설정할 수 있습니다. 위 표에서 BSC와 BEP20은 동일한 별칭이므로 어떤 것을 사용해도 동일한 효과를 냅니다.

### 거래 구조

거래는 특정 코인의 이전을 나타내며, 하나의 통화를 다른 통화로 교환하는 [거래(trades)](#trade-structure)와는 다릅니다.

- *입금 구조*
- *출금 구조*

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

#### 거래 구조에 관한 참고 사항

- 해당 거래소가 트랜잭션의 양측을 모두 명시하지 않는 경우 `addressFrom` 또는 `addressTo`가 `undefined/None/null`일 수 있습니다
- `address` 필드의 의미는 거래소에 따라 다릅니다. 경우에 따라 발신자의 주소를 포함할 수도 있고, 수신자의 주소를 포함할 수도 있습니다. 실제 값은 거래소에 따라 다릅니다.
- `updated` 필드는 해당 자금 이동 작업(`withdrawal` 또는 `deposit`)의 가장 최근 상태 변경 시각을 나타내는 UTC 타임스탬프(밀리초)입니다. 정적 스냅샷을 넘어 시간 경과에 따른 변화를 추적하려는 경우 필요합니다. 예를 들어 해당 거래소가 트랜잭션에 대해 `created_at`과 `confirmed_at`을 보고하는 경우, `updated` 필드는 가장 최근 상태 변경의 타임스탬프인 `Math.max (created_at, confirmed_at)` 값을 취합니다.
- `updated` 필드는 특정 거래소별 상황에서 `undefined/None/null`일 수 있습니다.
- 거래소로부터 받은 응답에 포함되어 있지 않으면 `fee` 하위 구조가 없을 수 있습니다.
- `comment` 필드는 `undefined/None/null`일 수 있으며, 그렇지 않은 경우 트랜잭션 생성 시 사용자가 정의한 메시지나 메모가 포함됩니다.
- `tag`와 `address`를 처리할 때 주의하십시오. `tag`는 **임의의 사용자 정의 문자열이 아닙니다**! `tag`에 사용자 메시지나 코멘트를 넣을 수 없습니다. `tag` 필드의 목적은 지갑 주소를 올바르게 지정하는 것이므로 정확해야 합니다. 사용 중인 거래소에서 받은 `tag`만 사용해야 하며, 그렇지 않으면 트랜잭션이 목적지에 도달하지 못할 수 있습니다.
- `type` 필드는 `deposit/withdrawal`이거나, 일부 경우(거래소 엔드포인트가 내부 이체와 블록체인 트랜잭션을 모두 반환하는 경우, 예: `ccxt.coinlist`)에는 `transfer`가 될 수 있습니다.

### fetchDeposits 예제

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


### fetchWithdrawals 예제


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


### fetchTransactions 예제


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


## 입금 주소

입금 주소는 거래소에서 이전에 생성된 기존 주소이거나 요청 시 생성될 수 있습니다. 두 방법 중 어느 것이 지원되는지 확인하려면 `exchange.has['fetchDepositAddress']`와 `exchange.has['createDepositAddress']` 속성을 확인하십시오.

```javascript
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})
```

매개변수

- **code** (String) *필수* 통합 CCXT 통화 코드 (예: `"USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [주소 구조](#address-structure)

---

일부 거래소는 여러 입금 주소를 한 번에 또는 모두 조회하는 메서드를 제공할 수도 있습니다.

```javascript
fetchDepositAddresses (codes = undefined, params = {})
```

매개변수

- **code** (\[String\]) 통합 CCXT 통화 코드의 배열. 거래소에 따라 필수 여부가 다를 수 있습니다 (예: `["USDT", "BTC"]`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [주소 구조](#address-structure)의 배열

```javascript
fetchDepositAddressesByNetwork (code, params = {})
```

매개변수

- **code** (String) *필수* 통합 CCXT 통화 코드 (예: `"USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [주소 구조](#address-structure)의 배열

### 주소 구조

`fetchDepositAddress`, `fetchDepositAddresses`, `fetchDepositAddressesByNetwork` 및 `createDepositAddress`에서 반환되는 주소 구조는 다음과 같습니다:

```javascript
{
    'info': response,       // raw unparsed data as returned from the exchange
    'currency': 'USDC',     // currency code
    'network': 'ERC20',     // a deposit/withdraw networks, ERC20, TRC20, BSC20 (see below)
    'address': '0x',        // blockchain address in terms of the requested currency and network
    'tag': undefined,       // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
}
```

AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP와 같은 특정 통화는 거래소에서 추가 인수 `tag`를 요구하는 경우가 많습니다. 다른 통화는 `tag`가 `undefined / None / null`로 설정됩니다. 태그는 출금 트랜잭션에 첨부되는 메모, 메시지 또는 결제 ID입니다. 해당 통화에서 태그는 필수이며 수신자 사용자 계정을 식별합니다.

`tag`와 `address`를 지정할 때 주의하십시오. `tag`는 **임의의 사용자 정의 문자열이 아닙니다**! `tag`에 사용자 메시지나 코멘트를 넣을 수 없습니다. `tag` 필드의 목적은 지갑 주소를 올바르게 지정하는 것이므로 정확해야 합니다. 사용 중인 거래소에서 받은 `tag`만 사용해야 하며, 그렇지 않으면 트랜잭션이 목적지에 도달하지 못할 수 있습니다.

**`network` 필드는 비교적 새로운 필드로, 특정 경우(일부 거래소)에서 `undefined / None / null`이거나 완전히 없을 수 있지만, 결국 모든 곳에 추가될 것입니다. 아직 통합 작업 중입니다.**

## 이체

`transfer` 메서드는 동일한 거래소 내 계정 간에 자금을 내부 이체합니다. 여기에는 하위 계정이나 다른 유형의 계정(`spot`, `margin`, `future`, ...)이 포함될 수 있습니다. 거래소가 CCXT에서 현물 및 선물 클래스로 분리된 경우(예: `binanceusdm`, `kucoinfutures`, ...), 선물 계정으로 자금을 이체하는 `transferIn` 메서드와 선물 계정에서 자금을 출금하는 `transferOut` 메서드를 사용할 수 있습니다

```javascript
transfer (code, amount, fromAccount, toAccount, params = {})
```

매개변수

- **code** (String) 통합 CCXT 통화 코드 (예: `"USDT"`)
- **amount** (Float) 이체할 통화의 양 (예: `10.5`)
- **fromAccount** (String) 자금을 이체할 출발 계정.
- **toAccount** (String) 자금을 이체할 도착 계정.
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"endTime": 1645807945000}`)
- **params.symbol** (String) 마진 계정으로 또는 마진 계정에서 이체 시의 마켓 심볼 (예: `'BTC/USDT'`)

### 계정 유형

`fromAccount`와 `toAccount`는 거래소 계정 ID 또는 다음 통합 값 중 하나를 받을 수 있습니다:

- `funding` *일부 거래소에서 `funding`과 `spot`은 동일한 계정입니다*
- `main` *하위 계정을 허용하는 일부 거래소의 경우*
- `spot`
- `margin`
- `future`
- `swap`
- `lending`

`exchange.options['accountsByType']`에서 키를 선택하여 모든 계정 유형을 조회할 수 있습니다

일부 거래소는 이메일 주소, 전화번호 또는 사용자 ID를 통한 다른 사용자에게의 이체를 허용합니다.

반환값

- [이체 구조](#transfer-structure)

```javascript
transferIn (code, amount, params = {})
transferOut (code, amount, params = {})
```

매개변수

- **code** (String) 통합 CCXT 통화 코드 (예: `"USDT"`)
- **amount** (Float) 이체할 통화의 양 (예: `10.5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [이체 구조](#transfer-structure)

```javascript
fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {})
```

매개변수

- **code** (String) 통합 CCXT 통화 코드 (예: `"USDT"`)
- **since** (Integer) 이체 조회를 시작할 가장 이른 시간의 타임스탬프 (ms) (예: `1646940314000`)
- **limit** (Integer) 조회할 [이체 구조](#transfer-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [이체 구조](#transfer-structure)의 배열

```javascript
fetchTransfer (id, since = undefined, limit = undefined, params = {})
```

매개변수

- **id** (String) 이체 ID (예: `"12345"`)
- **since** (Integer) 이체 조회를 시작할 가장 이른 시간의 타임스탬프 (ms) (예: `1646940314000`)
- **limit** (Integer) 조회할 [이체 구조](#transfer-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"endTime": 1645807945000}`)

반환값

- [이체 구조](#transfer-structure)

### 이체 구조

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
## 수수료

**통합 CCXT API의 이 섹션은 개발 중입니다.**

수수료는 일반적으로 두 가지 범주로 구분됩니다:

- 거래 수수료. 거래 수수료는 거래소에 지불하는 금액으로, 일반적으로 거래된(체결된) 거래량의 백분율입니다.
- 트랜잭션 수수료. 입출금 시 거래소에 지불하는 금액과 기본 암호화폐 트랜잭션 수수료(tx 수수료)입니다.

수수료 구조는 사용자가 실제로 거래한 통화 거래량에 따라 달라질 수 있으므로, 수수료는 계정별로 다를 수 있습니다. 계정별 수수료 처리 메서드:

```javascript
fetchTradingFee (symbol, params = {})
fetchTradingFees (params = {})
fetchDepositWithdrawFees (codes = undefined, params = {})
fetchDepositWithdrawFee (code, params = {})
```


수수료 메서드는 통합 수수료 구조를 반환하며, 이는 주문 및 거래에도 자주 포함됩니다. 수수료 구조는 라이브러리 전체에서 수수료 정보를 나타내는 공통 형식입니다. 수수료 구조는 일반적으로 마켓 또는 통화별로 인덱싱됩니다.

이 기능은 아직 개발 중이므로, 이 섹션에 설명된 메서드와 정보 중 일부 또는 전부가 특정 거래소에서 누락될 수 있습니다.

**`.fees` 속성은 대부분 사전 정의된/하드코딩된 정보를 포함하고 있으므로 거래소 인스턴스의 `.fees` 속성을 사용하지 마십시오. 실제 수수료는 마켓 및 통화에서만 접근해야 합니다.**

**참고: 이전에는 거래 수수료를 가져오기 위해 fetchTransactionFee(s)를 사용했으나, 이제 이는 DEPRECATED(사용 중단)되었으며 해당 함수들은 fetchDepositWithdrawFee(s)로 대체되었습니다**

거래 수수료를 가져오려면 `fetchTradingFee` / `fetchTradingFees`를 호출하고, 입출금 수수료를 가져오려면 `fetchDepositWithdrawFee` / `fetchDepositWithdrawFees`를 호출하십시오.

### 수수료 구조

주문, 비공개 거래, 트랜잭션 및 원장 항목은 `fee` 필드에 다음 정보를 정의할 수 있습니다:

```javascript
{
    'currency': 'BTC', // the unified fee currency code
    'rate': percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
    'cost': feePaid, // the fee cost (amount * fee rate)
}
```

### 수수료 일정

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

### 거래 수수료

거래 수수료는 마켓의 속성입니다. 대부분의 경우 거래 수수료는 `fetchMarkets` 호출을 통해 마켓에 로드됩니다. 그러나 때로는 거래소가 다른 엔드포인트에서 수수료를 제공하기도 합니다.

`calculateFee` 메서드를 사용하여 지불할 거래 수수료를 사전 계산할 수 있습니다(기본 사용자 수수료 대신 VIP-X와 같은 커스텀 거래 수수료/티어를 보유한 경우 `calculateFeeWithRate`를 사용하십시오). **경고! 이 메서드는 실험적이고 불안정하며 특정 경우에 잘못된 결과를 생성할 수 있습니다.** 주의하여 사용하십시오. 실제 수수료는 `calculateFee`에서 반환된 값과 다를 수 있으며, 이는 사전 계산 목적으로만 사용됩니다. 사전 계산된 값에 의존하지 마십시오. 시장 상황은 자주 변하기 때문입니다. 주문이 시장 테이커인지 메이커인지 미리 알기 어렵습니다.

```javascript
    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
    calculateFeeWithRate (symbol, type, side, amount, price, takerOrMaker = 'taker', customRate, params = {})
```

`calculateFee` 메서드는 지정된 파라미터로 주문에 대한 사전 계산된 수수료를 포함하는 통합 수수료 구조를 반환합니다.

거래 수수료율에 접근하는 권장 방법은 [`fetchTradingFees`](#fee-schedule)를 통해서입니다. 해당 메서드가 거래소에서 지원되지 않는 경우, `.markets` 속성을 통해 다음과 같이 접근하십시오:

```javascript
exchange.markets['ETH/BTC']['taker'] // taker fee rate for ETH/BTC
exchange.markets['BTC/USD']['maker'] // maker fee rate for BTC/USD
```

`.markets` 속성에 저장된 마켓에는 수수료 관련 추가 정보가 포함될 수 있습니다:

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

**경고! 수수료 관련 정보는 실험적이고 불안정하며 일부만 제공되거나 전혀 제공되지 않을 수 있습니다.**

메이커 수수료는 거래소에 유동성을 제공할 때, 즉 주문을 *마켓 메이크*하고 다른 사람이 이를 체결할 때 지불됩니다. 메이커 수수료는 일반적으로 테이커 수수료보다 낮습니다. 마찬가지로, 테이커 수수료는 거래소에서 유동성을 *가져가고* 다른 사람의 주문을 체결할 때 지불됩니다.

수수료는 음수일 수 있으며, 이는 파생상품 거래소에서 매우 흔합니다. 음수 수수료는 거래소가 거래에 대해 사용자에게 리베이트(보상)를 지불한다는 의미입니다.

또한 일부 거래소는 수수료를 거래량의 백분율로 지정하지 않을 수 있습니다. 확인을 위해 마켓의 `percentage` 필드를 확인하십시오.

#### 거래 수수료 일정

일부 거래소는 거래 수수료 일정을 가져오기 위한 엔드포인트를 보유하며, 이는 통합 메서드 `fetchTradingFees` 및 `fetchTradingFee`에 매핑됩니다.

```javascript
fetchTradingFee (symbol, params = {})
```

파라미터

- **symbol** (String) *필수* 통합 마켓 심볼 (예: `"BTC/USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"currency": "quote"}`)

반환값

- [거래 수수료 구조](#trading-fee-structure)

```javascript
fetchTradingFees (params = {})
```

파라미터

- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"currency": "quote"}`)

반환값

- [거래 수수료 구조](#trading-fee-structure)의 배열

#### 거래 수수료 구조

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

### 트랜잭션 수수료

트랜잭션 수수료는 통화(계정 잔액)의 속성입니다.

트랜잭션 수수료율에 접근하는 방법은 `.currencies` 속성을 통해서입니다. 이 측면은 아직 통합되지 않았으며 변경될 수 있습니다.

```javascript
exchange.currencies['ETH']['fee'] // tx/withdrawal fee rate for ETH
exchange.currencies['BTC']['fee'] // tx/withdrawal fee rate for BTC
```

#### 트랜잭션 수수료 일정

일부 거래소는 트랜잭션 수수료 일정을 가져오기 위한 엔드포인트를 보유하며, 이는 통합 메서드에 매핑됩니다.

- `fetchTransactionFee ()` - 단일 트랜잭션 수수료 일정
- `fetchTransactionFees ()` - 모든 트랜잭션 수수료 일정

```javascript
fetchTransactionFee (code, params = {})
```

파라미터

- **code** (String) *필수* 통합 CCXT 통화 코드, 필수 (예: `"USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"type": "deposit"}`)
- **params.network** (String) 통합 CCXT 네트워크 지정 (예: `{"network": "TRC20"}`)

반환값

- [트랜잭션 수수료 구조](#transaction-fee-structure)

```javascript
fetchTransactionFees (codes = undefined, params = {})
```

파라미터

- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"type": "deposit"}`)

반환값

- [트랜잭션 수수료 구조](#transaction-fee-structure)의 배열

#### 트랜잭션 수수료 구조

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

## 차입 이자

* 마진 전용

현물 또는 마진 마켓에서 레버리지로 거래하려면 통화를 대출로 빌려야 합니다. 이 빌린 통화는 이자와 함께 상환해야 합니다. 발생한 이자 금액을 얻으려면 `fetchBorrowInterest` 메서드를 사용할 수 있습니다.

```javascript
fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {})
```

파라미터

- **code** (String) 이자 통화의 통합 통화 코드 (예: `"USDT"`)
- **symbol** (String) 격리 마진 마켓의 마켓 심볼. 정의되지 않은 경우 교차 마진 마켓에 대한 이자가 반환됩니다 (예: `"BTC/USDT:USDT"`)
- **since** (Integer) 이자 기록을 조회할 가장 이른 시간의 타임스탬프(ms) (예: `1646940314000`)
- **limit** (Integer) 조회할 [차입 이자 구조](#borrow-interest-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [차입 이자 구조](#borrow-interest-structure)의 배열

### 차입 이자 구조

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

## 마진 차입 및 상환

*마진 전용*

마진 대출로 통화를 차입하고 상환하려면 `borrowCrossMargin`, `borrowIsolatedMargin`, `repayCrossMargin` 및 `repayIsolatedMargin`을 사용하십시오.

```javascript
borrowCrossMargin (code, amount, params = {})
repayCrossMargin (code, amount, params = {})
```
파라미터

- **code** (String) *필수* 차입 또는 상환할 통화의 통합 통화 코드 (예: `"USDT"`)
- **amount** (Float) *필수* 차입 또는 상환할 마진 금액 (예: `20.92`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"rate": 0.002}`)

반환값

- [마진 대출 구조](#margin-loan-structure)

```javascript
borrowIsolatedMargin (symbol, code, amount, params = {})
repayIsolatedMargin (symbol, code, amount, params = {})
```
파라미터

- **symbol** (String) *필수* 격리 마진 마켓의 통합 CCXT 마켓 심볼 (예: `"BTC/USDT"`)
- **code** (String) *필수* 차입 또는 상환할 통화의 통합 통화 코드 (예: `"USDT"`)
- **amount** (Float) *필수* 차입 또는 상환할 마진 금액 (예: `20.92`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"rate": 0.002}`)

반환값

- [마진 대출 구조](#margin-loan-structure)

### 마진 대출 구조

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

## 마진

*마진 및 계약 전용*

참고: 이 매뉴얼에서 "담보"라는 용어는 현재 마진 잔액을 의미하지만, "초기 마진" 또는 "유지 마진"과 혼동하지 마십시오:
- `담보 (현재 마진 잔액) = 초기 마진 + 실현 및 미실현 수익`.

예를 들어, **50$** 초기 마진으로 격리 포지션을 열고 포지션의 미실현 손익이 **-15$**인 경우, 포지션의 **담보**는 **35$**가 됩니다. 그러나 거래소의 힌트에 따라 해당 포지션의 유지 마진 요구사항(포지션을 열어두기 위한)이 **$25**라면, 담보는 이 아래로 떨어져서는 안 됩니다. 그렇지 않으면 포지션이 청산됩니다.

열린 레버리지 포지션에서 마진 잔액(담보)을 늘리거나, 줄이거나, 설정하려면 각각 `addMargin`, `reduceMargin` 및 `setMargin`을 사용하십시오. 이는 이미 열린 포지션에서 사용하는 레버리지 양을 조정하는 것과 같습니다.

이러한 메서드를 사용하는 몇 가지 시나리오는 다음과 같습니다:
- 거래가 불리하게 진행되는 경우, 청산 위험을 줄이기 위해 마진을 추가할 수 있습니다.
- 거래가 잘 진행되는 경우, 포지션의 마진 잔액을 줄이고 수익을 취할 수 있습니다.

```javascript
addMargin (symbol, amount, params = {})
reduceMargin (symbol, amount, params = {})
setMargin (symbol, amount, params = {})
```


파라미터

- **symbol** (String) *필수* 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`)
- **amount** (String) *필수* 추가하거나 줄일 마진 금액 (예: `20`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"leverage": 5}`)

반환값

- [마진 구조](#margin-structure)

위의 메서드 또는 거래소에 의해 자동으로 이루어진 마진 조정 이력을 다음 메서드를 사용하여 조회할 수 있습니다.

```javascript
fetchMarginAdjustmentHistory (symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`)
- **type** (String) "add" 또는 "reduce"
- **since** (Integer) 마진 조정을 조회할 가장 이른 시간의 타임스탬프(ms) (예: `1646940314000`)
- **limit** (Integer) 조회할 [마진 구조](#margin-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"auto": true}`)

반환값

- [마진 구조](#margin-structure)

### 마진 구조

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

## 마진 모드 설정

*계약 전용*

사용할 마진 유형을 다음 중 하나로 업데이트합니다.

- `cross` 하나의 계정이 마켓 간 담보를 공유하는 데 사용됩니다. 필요한 경우 청산을 방지하기 위해 총 계정 잔액에서 마진이 가져와집니다.
- `isolated` 각 마켓은 별도의 계정에 담보를 유지합니다.

```javascript
setMarginMode (marginMode, symbol = undefined, params = {})
```

파라미터

- **marginMode** (String) *필수* 사용할 마진 유형
    **통합 마진 유형:**
    - `"cross"`
    - `"isolated"`
- **symbol** (String) 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`) 대부분의 거래소에서 *필수*. 마진 모드가 특정 마켓에 한정되지 않는 경우에는 필수가 아닙니다.
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"leverage": 5}`)

반환값

- 거래소의 응답

### setMarginMode가 없는 거래소

거래소가 다음을 보유하지 않는 일반적인 이유

```javascript
exchange.has['setMarginMode'] == false
```

는 다음과 같습니다:

- 거래소가 레버리지 거래를 제공하지 않음
- 거래소가 `cross` 또는 `isolated` 마진 모드 중 하나만 제공하고 둘 다 제공하지 않음
- `createOrder` 사용 시 `params` 내의 거래소 특화 파라미터를 사용하여 마진 모드를 설정해야 함

### setMarginMode의 억제된 오류에 관한 참고 사항

일부 거래소 API는 마진 모드를 이미 설정된 모드와 동일하게 설정하는 요청이 전송될 때 오류 응답을 반환합니다(예: 계정이 이미 `BTC/USDT:USDT`를 교차 마진으로 사용하도록 설정된 상태에서 `BTC/USDT:USDT` 마켓의 마진 모드를 `cross`로 설정하는 요청 전송). CCXT는 최종 결과가 사용자가 원하는 것이기 때문에 이를 오류로 보지 않으므로, 오류는 억제되고 오류 결과가 객체로 반환됩니다.

예시:

```javascript
{ code: -4046, msg: 'No need to change margin type.' }
```

### marginMode 파라미터에 관한 참고 사항

일부 메서드는 `cross` 또는 `isolated`로 설정할 수 있는 `marginMode` 파라미터의 사용을 허용합니다. 이는 현물 마진 또는 계약 마켓에서 사용하기 위해 메서드의 params 내에서 직접 `marginMode`를 지정하는 데 유용할 수 있습니다. 현물 마진 마켓을 지정하려면 통합 현물 심볼을 사용하거나 마켓 유형을 현물로 설정하면서 marginMode 파라미터를 `cross` 또는 `isolated`로 설정해야 합니다.

현물 마진 주문 생성:

*marginMode 파라미터를 설정하면서 통합 현물 심볼을 사용합니다.*


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


## 마진 모드 조회

*마진 및 계약 전용*

`fetchMarginMode()` 메서드를 사용하여 마켓에 설정된 마진 모드를 얻을 수 있습니다. `fetchMarginModes()` 메서드를 사용하여 여러 마켓의 설정된 마진 모드를 한 번에 얻을 수 있습니다.

다음을 사용하여 설정된 마진 모드에 접근할 수 있습니다:

- `fetchMarginMode()` (단일 심볼)
- `fetchMarginModes([symbol1, symbol2, ...])` (복수 심볼)
- `fetchMarginModes()` (모든 마켓 심볼)

```javascript
fetchMarginMode(symbol, params = {})
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"subType": "linear"}`)

반환값

- [마진 모드 구조체](#margin-mode-structure)

```javascript
fetchMarginModes(symbols = undefined, params = {})
```

파라미터

- **symbols** (\[String\]) 통합 CCXT 심볼 목록 (예: `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"subType": "linear"}`)

반환값

- [마진 모드 구조체](#margin-mode-structure)의 배열

### 마진 모드 구조체

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
}
```

## 레버리지 설정

*마진 및 컨트랙트 전용*

```javascript
setLeverage (leverage, symbol = undefined, params = {})
```

파라미터

- **leverage** (Integer) *필수* 원하는 레버리지
- **symbol** (String) 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`) 대부분의 거래소에서 *필수*. 레버리지가 마켓별이 아닌 계정 단위로 설정되는 경우에는 불필요
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"marginMode": "cross"}`)

반환값

- 거래소로부터의 응답

## 레버리지

*마진 및 컨트랙트 전용*

`fetchLeverage()` 메서드는 특정 마켓에 설정된 레버리지를 조회하는 데 사용할 수 있습니다. `fetchLeverages()` 메서드는 여러 마켓의 설정된 레버리지를 한 번에 조회하는 데 사용할 수 있습니다.

다음을 사용하여 설정된 레버리지에 접근할 수 있습니다:

- `fetchLeverage()` (단일 심볼)
- `fetchLeverages([symbol1, symbol2, ...])` (복수 심볼)
- `fetchLeverages()` (모든 마켓 심볼)

```javascript
fetchLeverage(symbol, params = {})
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"marginMode": "cross"}`)

반환값

- [레버리지 구조체](#leverage-structure)

```javascript
fetchLeverages(symbols = undefined, params = {})
```

파라미터

- **symbols** (\[String\]) 통합 CCXT 심볼 목록 (예: `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"marginMode": "cross"}`)

반환값

- [레버리지 구조체](#leverage-structure)의 배열

### 레버리지 구조체

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
    "longLeverage": 100,        // the set leverage for a long position
    "shortLeverage": 75,        // the set leverage for a short position
}
```

## 컨트랙트 거래

만료일이 정해진 선물, 펀딩 지급이 있는 무기한 스왑, 인버스 선물 또는 스왑 등이 포함될 수 있습니다.
포지션 정보는 거래소에 따라 서로 다른 엔드포인트에서 제공될 수 있습니다.
여러 종류의 파생상품을 제공하는 엔드포인트가 여러 개 있는 경우 CCXT는 기본적으로 "인버스"가 아닌 "선형(linear)" 컨트랙트 또는 "선물(future)"이 아닌 "스왑(swap)" 컨트랙트만 로드합니다.

### 포지션

*컨트랙트 전용*

컨트랙트 마켓에서 현재 보유 중인 포지션 정보를 얻으려면 다음을 사용하세요.

- fetchPosition ()            // 단일 마켓용
- fetchPositions ()           // 전체 포지션용
- fetchAccountPositions ()    // TODO
- fetchPositionHistory ()     // 단일 과거 포지션용
- fetchPositionsHistory ()     // 과거 포지션용

```javascript
fetchPosition (symbol, params = {})                         // for a single market
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [포지션 구조체](#position-structure)

```javascript
fetchPositions (symbols = undefined, params = {})
fetchAccountPositions (symbols = undefined, params = {})
```

파라미터

- **symbols** (\[String\]) 통합 CCXT 마켓 심볼, 모든 포지션을 조회하려면 설정하지 않음 (예: `["BTC/USDT:USDT"]`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [포지션 구조체](#position-structure)의 배열

```javascript
fetchPositionHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

파라미터

- **symbol** (\[String\]) 통합 CCXT 마켓 심볼, 모든 포지션을 조회하려면 설정하지 않음 (예: `["BTC/USDT:USDT"]`)
- **since** (Integer) 포지션 조회를 시작할 가장 이른 시각의 타임스탬프(ms) (예: `1646940314000`)
- **limit** (Integer) 조회할 [포지션 구조체](#position-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [포지션 구조체](#position-structure)의 배열

#### 포지션 구조체

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
포지션을 통해 거래소에서 자금을 빌려 마켓에서 롱 또는 숏 포지션을 취할 수 있습니다. 일부 거래소는 포지션을 유지하기 위해 펀딩 수수료 납부를 요구합니다.

롱 포지션을 취할 때는 미래에 가격이 더 높아질 것이며, 가격이 `liquidationPrice` 아래로 내려가지 않을 것이라고 베팅하는 것입니다.

기초 지수의 가격이 변동함에 따라 미실현 손익(unrealisedPnl)도 변하고, 그 결과 포지션에 남은 담보 금액도 변합니다(시장가 또는 그보다 불리한 가격에만 청산할 수 있으므로). 어느 가격에서 담보가 완전히 소진되는데, 이를 "버스트(bust)" 또는 "제로(zero)" 가격이라고 합니다. 이 지점을 넘어 가격이 반대 방향으로 충분히 움직이면 포지션의 담보가 `maintenanceMargin` 아래로 떨어집니다. 유지증거금(maintenanceMargin)은 포지션과 음수 담보 사이의 안전 완충 역할을 하며, 음수 담보 상황이란 거래소가 사용자를 대신하여 손실을 부담하는 시나리오입니다. 거래소는 자체 보호를 위해 이 상황이 발생하면 즉시 포지션을 강제 청산합니다. 가격이 liquidationPrice 위로 다시 돌아오더라도 환불되지 않는데, 이는 거래소가 사용자가 구매한 모든 `contracts`를 시장가에 매도했기 때문입니다. 즉, 유지증거금은 자금 차입에 대한 숨겨진 수수료입니다.

`maintenanceMarginPercentage` 및 `initialMarginPercentage` 대신 `maintenanceMargin` 및 `initialMargin`을 사용하는 것이 좋습니다. 이 값들이 더 정확한 경향이 있기 때문입니다. 유지증거금은 [kucoin](https://futures.kucoin.com/contract/detail)처럼 펀딩 비율 및 테이커 수수료 등 유지증거금 비율 외의 다른 요소로 계산될 수 있습니다.

인버스 컨트랙트를 사용하면 BTC를 담보로 BTC/USD에서 롱 또는 숏 포지션을 취할 수 있습니다. 인버스 컨트랙트에 대한 API는 선형 컨트랙트와 동일합니다. 인버스 컨트랙트의 수량은 USD/BTC로 거래된 것처럼 표시되지만, 가격은 여전히 BTC/USD 기준으로 표시됩니다. 인버스 컨트랙트의 손익 공식은 `(1/markPrice - 1/price) * contracts`입니다. 손익 및 담보는 BTC로 표시되며, 컨트랙트 수량은 USD로 표시됩니다.

#### 포지션 청산

*컨트랙트 전용*

시장가 주문으로 열린 포지션을 빠르게 청산하려면 다음을 사용하세요.

- closePosition (symbol)               // 단일 마켓용
- closeAllPositions (symbol)           // 전체 포지션용

```typescript
closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order>
```

파라미터

- **symbol** (String) *필수* 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`)
- **side** *선택* 주문 방향을 나타내는 문자열 리터럴. 일부 거래소에서 필수.
  **통합 방향:**
  - `buy` 기축 통화를 주고 기초 통화를 받음. 예를 들어 `BTC/USD` 매수는 달러를 주고 비트코인을 받는 것을 의미합니다.
  - `sell` 기초 통화를 주고 기축 통화를 받음. 예를 들어 `BTC/USD` 매도는 비트코인을 주고 달러를 받는 것을 의미합니다.
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [주문 구조체](#order-structure)

```typescript
closeAllPositions (params = {}): Promise<Position[]>
```

파라미터
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [주문 구조체](#order-structure)의 목록


### 포지션 모드

*마진 및 컨트랙트 전용*

포지션 모드 설정에 사용되는 메서드:

```javascript
setPositionMode (hedged, symbol = undefined, params = {})
```

파라미터

- **hedged** (String) *필수* 헤지 모드 값:
    - `true` - **헤지(hedged)** 모드로 설정
    - `false` - **단방향(one-way)** 모드로 설정
- **symbol** (String) 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터

포지션 모드 조회에 사용되는 메서드:

```javascript
fetchPositionMode (symbol = undefined, params = {}) {
```

파라미터

- **symbol** (String) 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터

반환값

```javascript
{
    'info': { ... },
    'hedged': true,
}
```


#### 청산 가격

`initialMargin + unrealized = collateral = maintenanceMargin`이 되는 가격입니다. 포지션 반대 방향으로 가격이 이동하여 유지증거금만큼의 담보만 남게 되고, 가격이 더 움직이면 포지션의 담보가 마이너스가 됩니다.

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

### 펀딩 내역

*컨트랙트 전용*

무기한 스왑(무기한 선물이라고도 함) 컨트랙트는 거래자들이 무기한 스왑 마켓에서 포지션을 보유하는 동안 서로 펀딩 수수료를 교환하기 때문에 기초 자산의 가격을 반영하는 시장 가격을 유지합니다.

컨트랙트가 기초 자산 가격보다 높은 가격에 거래되고 있다면, 하루 중 특정 시간에 롱 포지션 보유자가 숏 포지션 보유자에게 펀딩 수수료를 지급하며, 이는 더 많은 거래자가 해당 시간 이전에 숏 포지션에 진입하도록 유도합니다.

컨트랙트가 기초 자산 가격보다 낮은 가격에 거래되고 있다면, 하루 중 특정 시간에 숏 포지션 보유자가 롱 포지션 보유자에게 펀딩 수수료를 지급하며, 이는 더 많은 거래자가 해당 시간 이전에 롱 포지션에 진입하도록 유도합니다.

이 수수료는 일반적으로 거래자 간에 교환되며 거래소에는 커미션이 발생하지 않습니다.

`fetchFundingHistory` 메서드는 계정의 펀딩 수수료 납부 또는 수령 내역을 조회하는 데 사용할 수 있습니다.

```javascript
fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

파라미터

- **symbol** (String) 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`)
- **since** (Integer) 펀딩 내역 조회를 시작할 가장 이른 시각의 타임스탬프(ms) (예: `1646940314000`)
- **limit** (Integer) 조회할 [펀딩 내역 구조체](#funding-history-structure)의 수 (예: `5`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"endTime": 1645807945000}`)

반환값

- [펀딩 내역 구조체](#funding-history-structure)의 배열

#### 펀딩 내역 구조체

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


### 환전

`fetchConvertQuote` 메서드는 환전 거래에 사용할 수 있는 견적을 조회하는 데 사용할 수 있습니다.
견적은 일반적으로 환전 거래가 성공적으로 실행되기 위해 거래소에서 지정한 특정 시간 내에 사용해야 합니다.

```javascript
fetchConvertQuote (fromCode, toCode, amount = undefined, params = {})
```

파라미터

- **fromCode** (String) *필수* 환전할 통화의 통합 통화 코드 (예: `"USDT"`)
- **toCode** (String) *필수* 환전 후 받을 통화의 통합 통화 코드 (예: `"USDC"`)
- **amount** (Float) 출발 통화 단위로 환전할 금액 (예: `20.0`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"toAmount": 2.9722}`)

반환값

- [환전 구조체](#conversion-structure)

`createConvertTrade` 메서드는 fetchConvertQuote에서 조회한 id를 사용하여 환전 거래 주문을 생성하는 데 사용할 수 있습니다.
견적은 일반적으로 환전 거래가 성공적으로 실행되기 위해 거래소에서 지정한 특정 시간 내에 사용해야 합니다.

```javascript
createConvertTrade (id, fromCode, toCode, amount = undefined, params = {})
```

파라미터

- **id** (String) *필수* 환전 견적 id (예: `1645807945000`)
- **fromCode** (String) *필수* 환전할 통화의 통합 통화 코드 (예: `"USDT"`)
- **toCode** (String) *필수* 환전 후 받을 통화의 통합 통화 코드 (예: `"USDC"`)
- **amount** (Float) 출발 통화 단위로 환전할 금액 (예: `20.0`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 파라미터 (예: `{"toAmount": 2.9722}`)

반환값

- [전환 구조](#conversion-structure)

`fetchConvertTrade` 메서드는 거래 ID를 사용하여 특정 전환 거래를 조회하는 데 사용할 수 있습니다.

```javascript
fetchConvertTrade (id, code = undefined, params = {})
```

매개변수

- **id** (String) *필수* 전환 거래 ID (예: `"80794187SDHJ25"`)
- **code** (String) 전환 거래의 통합 통화 코드 (예: `"USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"toAmount": 2.9722}`)

반환값

- [전환 구조](#conversion-structure)

`fetchConvertTradeHistory` 메서드는 지정된 통화 코드에 대한 전환 내역을 조회하는 데 사용할 수 있습니다.

```javascript
fetchConvertTradeHistory (code = undefined, since = undefined, limit = undefined, params = {})
```

매개변수

- **code** (String) 전환 거래 내역을 조회할 통합 통화 코드 (예: `"USDT"`)
- **since** (Integer) 가장 이른 전환의 타임스탬프 (예: `1645807945000`)
- **limit** (Integer) 조회할 전환 구조의 최대 개수 (예: `10`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 매개변수 (예: `{"toAmount": 2.9722}`)

반환값

- [전환 구조](#conversion-structure) 배열

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

## Auto De Leverage

*계약 전용*

`fetchPositionADLRank` 또는 `fetchPositionsADLRank` 메서드를 사용하여 거래소에서 포지션의 자동 레버리지 감소 순위에 대한 비공개 세부 정보를 가져올 수 있습니다.

```javascript
fetchPositionADLRank (symbol, params = {})
```

매개변수

- **symbol** (String) 통합 CCXT 마켓 심볼 (예: `"BTC/USDT:USDT"`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 매개변수 (예: `{"category": "futures"}`)

반환값

- [자동 레버리지 감소 구조](#auto-de-leverage)

```javascript
fetchPositionsADLRank (symbols, params = {})
```

매개변수

- **symbols** (\[String\]) 통합 CCXT 심볼 목록 (예: `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) 거래소 API 엔드포인트에 특화된 추가 매개변수 (예: `{"category": "futures"}`)

반환값

- [자동 레버리지 감소 구조](#auto-de-leverage) 목록

### Auto De Leverage Stucture

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


## 프록시

다음과 같은 경우에 프록시가 필요할 수 있습니다:
- 현재 위치에서 거래소에 접근할 수 없는 경우
- 거래소에서 IP가 차단된 경우
- [Cloudflare의 DDoS 보호](#ddos-protection-by-cloudflare-incapsula)와 같이 거래소에서 무작위로 제한이 발생하는 경우

단, 중개자가 추가될 때마다 요청에 지연 시간이 증가할 수 있다는 점에 유의하세요.

**Go 사용자를 위한 참고 사항:** 프록시 속성을 설정한 후에는 변경 사항을 적용하기 위해 `UpdateProxySettings()`를 호출해야 합니다:
```go
exchange := ccxt.NewBinance(nil)
exchange.ProxyUrl = "http://your-proxy-url:8080"
exchange.UpdateProxySettings()  // Required in Go to apply proxy settings
```
단, 중개자가 추가될 때마다 요청에 지연 시간이 증가할 수 있다는 점에 유의하세요.

### 지원되는 프록시 유형
CCXT는 다음과 같은 프록시 유형을 지원합니다 (각각 [콜백 지원](#using-proxy-callbacks)도 제공됩니다):

#### proxyUrl

이 속성은 API 요청 앞에 URL을 추가합니다. 단순 리디렉션이나 [CORS 브라우저 제한 우회](#cors-access-control-allow-origin)에 유용할 수 있습니다.
```
ex = ccxt.binance();
ex.proxyUrl = 'YOUR_PROXY_URL';
```
'YOUR_PROXY_URL'의 예시는 다음과 같습니다 (슬래시를 적절히 사용하세요):
- `https://cors-anywhere.herokuapp.com/`
- `http://127.0.0.1:8080/`
- `http://your-website.com/sample-script.php?url=`
- 기타

따라서 요청은 예를 들어 `https://cors-anywhere.herokuapp.com/https://exchange.xyz/api/endpoint`로 전달됩니다. (`.proxyUrl`에서 사용할 소형 프록시 스크립트를 기기/웹서버에서 실행할 수도 있습니다 — [예제 폴더](https://github.com/ccxt/ccxt/tree/master/examples)의 "sample-local-proxy-server"를 참조하세요). 대상 URL을 커스터마이즈하려면 인스턴스의 `urlEncoderForProxyUrl` 메서드를 재정의할 수도 있습니다.

이 방법은 WebSocket 연결이 아닌 **REST** 요청에만 작동합니다. ((_프록시 작동 여부 테스트_))[#test-if-your-proxy-works]

#### httpProxy 및 httpsProxy
스크립트에 실제 http(s) 프록시를 설정하려면 원격 [http 또는 https 프록시](https://stackoverflow.com/q/10440690/2377343)에 접근할 수 있어야 하며, 호출이 프록시 서버를 통해 터널링되어 대상 거래소에 직접 전달됩니다:
```
ex.httpProxy = 'http://1.2.3.4:8080/';
// or
ex.httpsProxy = 'http://1.2.3.4:8080/';
```
이 방법은 ccxt의 **비 WebSocket** 요청에만 영향을 미칩니다. CCXT의 WebSocket 연결을 프록시를 통해 라우팅하려면 `httpProxy`(또는 `httpsProxy`)에 추가로 `wsProxy`(또는 `wssProxy`) 속성을 설정해야 하며, 스크립트는 다음과 같이 작성됩니다:
```
ex.httpProxy = 'http://1.2.3.4:8080/';
ex.wsProxy   = 'http://1.2.3.4:8080/';
```
따라서 두 연결(HTTP & WS) 모두 프록시를 통해 전달됩니다.
((_프록시 작동 여부 테스트_))[#test-if-your-proxy-works]


#### socksProxy
다음 형식으로 [socks 프록시](https://www.google.com/search?q=what+is+socks+proxy)를 사용할 수도 있습니다:
```
// from protocols: socks, socks5, socks5h
ex.socksProxy = 'socks5://1.2.3.4:8080/';
ex.wsSocksProxy = 'socks://1.2.3.4:8080/';
```
((_프록시 작동 여부 테스트_))[#test-if-your-proxy-works]

#### 프록시 작동 여부 테스트
위에 나열된 프록시 속성 중 하나를 ccxt 코드에 설정한 후, IP를 에코하는 일부 웹사이트에 핑을 보내 작동 여부를 테스트할 수 있습니다 — [예제](https://github.com/ccxt/ccxt/blob/master/examples/)에서 "proxy-usage" 파일을 확인하세요.

#### 프록시 콜백 사용
**속성을 설정하는 대신 `proxyUrlCallback, http(s)ProxyCallback, socksProxyCallback` 콜백을 사용할 수도 있습니다:
```
myEx.proxyUrlCallback = function (url, method, headers, body) { ... return 'http://1.2.3.4/'; }
```

### 프록시 관련 추가 세부 정보

#### userAgent

특수한 경우에 `userAgent` 속성을 다음과 같이 재정의할 수 있습니다:
```
exchange.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
```

#### 커스텀 프록시 에이전트

프로그래밍 언어에 따라 커스텀 프록시 에이전트를 설정할 수 있습니다.
 - JavaScript의 경우 [이 예제](
https://github.com/ccxt/ccxt/blob/master/examples/js/custom-proxy-agent-for-js.js)를 참조하세요.
 - Python의 경우 다음 예제를 참조하세요: [proxies-for-synchronous-python](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxies-for-synchronous-python.py), [proxy-asyncio-aiohttp-python-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-python-3.py), [proxy-asyncio-aiohttp-socks](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-socks.py), [proxy-sync-python-requests-2-and-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-sync-python-requests-2-and-3.py)

#### CORS (Access-Control-Allow-Origin)

CORS([교차 출처 리소스 공유](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)라고도 함)는 주로 브라우저에 영향을 미치며 잘 알려진 경고 `No 'Access-Control-Allow-Origin' header is present on the requested resource`의 원인입니다. 이는 스크립트(브라우저에서 실행)가 서드파티 도메인에 요청을 할 때 발생합니다(기본적으로 이러한 요청은 대상 도메인이 명시적으로 허용하지 않는 한 차단됩니다).
따라서 이러한 경우 직접 브라우저 측 요청 대신 요청을 대상 거래소로 리디렉션하는 "CORS" 프록시를 통해 통신해야 합니다. CORS 프록시를 설정하려면 [sample-local-proxy-server-with-cors](https://github.com/ccxt/ccxt/blob/master/examples/) 예제 파일을 실행하고 ccxt에서 [`.proxyUrl`](#proxyurl) 속성을 설정하여 cors/프록시 서버를 통해 요청을 라우팅할 수 있습니다.

## 문자열 수학

일부 사용자는 CCXT가 산술 연산을 처리하는 방식을 제어하고 싶을 수 있습니다. 기본적으로 숫자 타입을 사용하지만, 사용자는 문자열 타입을 사용한 고정 소수점 수학으로 전환할 수 있습니다. 다음과 같이 설정할 수 있습니다:


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


# 오류 처리

- [재시도 메커니즘](#retry-mechanism)
- [예외 계층 구조](#exception-hierarchy)
- [ExchangeError](#exchangeerror)
- [OperationFailed](#operationfailed)
- [DDoSProtection](#ddosprotection)
- [RateLimitExceeded](#ratelimitexceeded)
- [RequestTimeout](#requesttimeout)
- [RequestTimeout](#requesttimeout)
- [ExchangeNotAvailable](#exchangenotavailable)
- [InvalidNonce](#invalidnonce)

CCXT의 오류 처리는 모든 언어에서 기본적으로 제공되는 예외 메커니즘을 사용합니다.

오류를 처리하려면 통합 메서드 호출 주위에 `try` 블록을 추가하고, 해당 언어에서 일반적으로 하는 것처럼 예외를 캐치해야 합니다:

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

비동기 파이프라인(`fetchTickerAsync` 등)의 경우, `CompletableFuture`는 발생한 오류를 `CompletionException`으로 래핑합니다. `.exceptionally(...)` 내부에서 `Helpers.unwrap()`을 사용하여 래퍼를 제거하고 기저 ccxt 오류를 패턴 매칭하세요:

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


## 재시도 메커니즘
HTTP 요청을 처리할 때, 요청이 다양한 이유로 실패할 수 있다는 점을 이해하는 것이 중요합니다. 이러한 실패의 일반적인 원인에는 서버 불가용, 네트워크 불안정, 일시적인 서버 문제 등이 포함됩니다. 이러한 시나리오를 우아하게 처리하기 위해 CCXT는 실패한 요청을 자동으로 재시도하는 옵션을 제공합니다. `maxRetriesOnFailure` 및 `maxRetriesOnFailureDelay` 값을 설정하여 재시도 횟수와 재시도 간격을 구성할 수 있습니다. 예시:

```python
exchange.options['maxRetriesOnFailure'] = 3 # if we get an error like the ones mentioned above we will retry up to three times per request
exchange.options['maxRetriesOnFailureDelay'] = 1000 # we will wait 1000ms (1s) between retries
```

서버/네트워크 관련 문제만 재시도 메커니즘의 대상이 된다는 점이 중요합니다. 사용자가 `InsufficientFunds` 또는 `InvalidOrder`로 인한 오류가 발생하는 경우 요청은 반복되지 않습니다.

## 예외 계층 구조

모든 예외는 기본 BaseError 예외에서 파생되며, ccxt 라이브러리에서 다음과 같이 정의됩니다:


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


예외 상속 계층 구조는 다음 파일에 있습니다: https://github.com/ccxt/ccxt/blob/master/ts/src/base/errorHierarchy.ts , 시각적으로는 아래와 같이 나타낼 수 있습니다:

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

`BaseError` 클래스는 접근성 및 요청/응답 불일치를 포함한 모든 종류의 오류에 대한 일반적인 루트 오류 클래스입니다. 특정 예외 하위 클래스를 캐치할 필요가 없는 경우 모든 예외 유형이 캐치되는 `BaseError`를 사용할 수 있습니다.

`BaseError`에서 두 가지 서로 다른 오류 계열이 파생됩니다: `OperationFailed`와 `ExchangeError` (아래에 설명된 것처럼 각각 특정 하위 유형을 가집니다).

### OperationFailed


`OperationFailed`는 사용자가 **올바르게 구성되고 유효한 요청**을 거래소에 전송했지만 비결정적 문제가 발생했을 때 일어날 수 있습니다:
- 유지보수 진행 중
- 인터넷/네트워크 연결 문제
- DDoS 보호
- "서버가 바쁩니다, 다시 시도하세요"...

이러한 예외는 일시적이며 요청을 다시 시도하면 충분할 수 있습니다. 그러나 오류가 계속 발생하면 거래소나 연결에 지속적인 문제가 있음을 나타낼 수 있습니다.

`OperationFailed`에는 다음과 같은 하위 유형이 있습니다: `RequestTimeout`, `DDoSProtection` (하위 유형 `RateLimitExceeded` 포함), `ExchangeNotAvailable`, `InvalidNonce`.


#### DDoSProtection

이 예외는 클라우드/호스팅 서비스(Cloudflare, Incapsula 등)가 사용자/지역/위치의 요청을 제한하거나 거래소 API가 비정상적인 요청을 이유로 사용자를 제한할 때 발생합니다. 이 예외에는 사용자가 거래소 API 엔진이 허용하는 것보다 훨씬 빈번하게 요청한다는 것을 직접적으로 의미하는 특정 하위 유형 예외 `RateLimitExceeded`도 포함됩니다.

#### RequestTimeout

이 예외는 거래소와의 연결이 실패하거나 지정된 시간 내에 데이터가 완전히 수신되지 않을 때 발생합니다. 이는 거래소의 `.timeout` 속성에 의해 제어됩니다. `RequestTimeout`이 발생하면 사용자는 요청의 결과(거래소 서버에서 수락되었는지 여부)를 알 수 없습니다.

따라서 이 유형의 예외는 다음과 같은 방식으로 처리하는 것이 좋습니다:

- 조회 요청의 경우 호출을 다시 시도하는 것이 안전합니다.
- `cancelOrder()` 요청의 경우 사용자는 동일한 호출을 두 번째로 재시도해야 합니다. `cancelOrder()`에 대한 후속 재시도는 다음과 같은 가능한 결과 중 하나를 반환합니다:
  - 요청이 성공적으로 완료되어 주문이 현재 올바르게 취소된 경우
  - `OrderNotFound` 예외가 발생하는 경우, 이는 주문이 첫 번째 시도에서 이미 취소되었거나 두 번째 시도 사이에 실행(체결 및 종료)된 것을 의미합니다.
- `createOrder()` 요청이 `RequestTimeout`으로 실패하는 경우 사용자는:
  - `fetchOrders()`, `fetchOpenOrders()`, `fetchClosedOrders()`를 호출하여 주문 요청이 성공했는지 및 주문이 현재 열려 있는지 확인해야 합니다.
  - 주문이 `'open'` 상태가 아닌 경우 사용자는 `fetchBalance()`를 호출하여 첫 번째 실행 시 주문이 생성된 이후 두 번째 확인 시까지 잔액이 변경되었는지 확인해야 합니다.

#### ExchangeNotAvailable

이 유형의 예외는 기반 거래소에 접근할 수 없을 때 발생합니다. ccxt 라이브러리는 응답에서 다음 키워드 중 하나를 감지할 경우에도 이 오류를 발생시킵니다:

  - `offline`
  - `unavailable`
  - `busy`
  - `retry`
  - `wait`
  - `maintain`
  - `maintenance`
  - `maintenancing`

#### InvalidNonce

[인증](#authentication) 섹션에서 설명한 대로, 사용 중인 키쌍으로 이전에 사용한 nonce보다 작은 nonce를 사용할 때 발생합니다. 이 유형의 예외는 다음과 같은 경우에 발생합니다(우선순위 순):

  - 요청의 속도를 제한하지 않거나 너무 많은 요청을 너무 빠르게 보내고 있습니다.
  - API 키가 새것이 아닙니다(다른 소프트웨어나 스크립트에서 이미 사용된 경우. 거래소를 추가할 때마다 항상 새 키쌍을 생성하세요).
  - 동일한 키쌍이 거래소 클래스의 여러 인스턴스에 걸쳐 공유되고 있습니다(예: 멀티스레드 환경이나 별개의 프로세스).
  - 시스템 시계가 동기화되지 않았습니다. 시스템 시간은 클럭 드리프트로 인해 10분마다 또는 더 자주 DST가 없는 시간대에서 UTC와 동기화되어야 합니다. **Windows에서 시간 동기화를 활성화하는 것만으로는 보통 충분하지 않습니다!** OS 레지스트리에서 설정해야 합니다(사용 중인 OS에 맞게 *"time synch frequency"*를 검색하세요).


### ExchangeError

`OperationFailed`와 달리 `ExchangeError`는 아래에 나열된 요인으로 인해 요청이 성공할 수 없을 때 주로 발생합니다. 따라서 동일한 요청을 수백 번 재시도해도 요청이 잘못 구성되었기 때문에 계속 실패합니다.

이 예외가 발생하는 가능한 이유:

  - 거래소에서 엔드포인트가 비활성화됨
  - 거래소에서 심볼을 찾을 수 없음
  - 필수 파라미터 누락
  - 파라미터 형식이 잘못됨
  - 사용자 측에서 수정해야 하는 문제 발생

`ExchangeError`에는 다음과 같은 하위 유형 예외가 있습니다:

  - `NotSupported`: 거래소 API에서 해당 엔드포인트/작업을 제공하거나 지원하지 않을 때.
  - `BadRequest`: 사용자가 유효하지 않거나 허용되지 않는(즉: "유효하지 않은 숫자", "금지된 심볼", "최소/최대 한도 초과 크기", "잘못된 정밀도" 등) **잘못** 구성된 요청/파라미터/액션을 보낼 때. 이 경우 재시도해도 도움이 되지 않으며, 요청을 먼저 수정/조정해야 합니다.
  - `OperationRejected` - 사용자가 **올바르게** 구성된 요청을 보냈지만(일반적인 경우 거래소가 수락해야 함), 어떤 결정적인 요인으로 인해 요청이 성공하지 못할 때. 예를 들어, 현재 계정 상태가 허용하지 않을 수 있거나(즉: "레버리지를 변경하기 전에 기존 포지션을 청산하세요", "대기 중인 주문이 너무 많습니다", "계정이 잘못된 포지션/마진 모드에 있습니다"), 특정 순간에 심볼을 거래할 수 없거나(즉: "MarketClosed"), 특정 조치가 필요한 설명된 요인들(즉: 먼저 일부 설정을 변경하거나 특정 시점까지 기다려야 함). 다시 한번 말씀드리면: [**OperationFailed**](#operationfailed)는 맹목적으로 재시도할 수 있고 성공해야 하지만, `OperationRejected`는 요청을 재시도하기 전에 고려해야 할 특정 요인에 의존하는 실패입니다.
  - `AuthenticationError`: 거래소에서 누락한 API 자격 증명 중 하나를 요구하거나, 키쌍에 실수가 있거나, 오래된 nonce가 있을 때. 대부분의 경우 `apiKey`와 `secret`이 필요하며, 거래소 API가 요구하는 경우 `uid` 및/또는 `password`도 필요할 수 있습니다.
  - `PermissionDenied`: 지정된 작업에 대한 접근 권한이 없거나 지정된 `apiKey`에 대한 권한이 부족할 때.
  - `InsufficientFunds`: 주문을 넣기에 계정 잔액에 충분한 통화가 없을 때.
  - `InvalidAddress`: `fetchDepositAddress`, `createDepositAddress` 또는 `withdraw` 호출에서 잘못된 입금 주소나 `.minFundingAddressLength`(기본값 10자)보다 짧은 입금 주소를 만날 때.
  - `InvalidOrder`: 통합 주문 API와 관련된 모든 예외의 기본 클래스.
  - `OrderNotFound`: 존재하지 않는 주문을 가져오거나 취소하려고 할 때.

### 타임스탬프 오류 처리

사용자는 가끔 다음과 같은 오류를 경험할 수 있습니다:

> "이 요청의 타임스탬프가 recvWindow 범위 밖에 있습니다."
> "잘못된 요청입니다. 서버 타임스탬프 또는 recv_window 파라미터를 확인하세요."
> "이 요청의 타임스탬프가 서버 시간보다 1000ms 앞서 있습니다."

이러한 문제는 여러 가지 이유로 발생할 수 있습니다:

#### 1. 시스템 클럭 비동기화
기기의 시스템 클럭이 전 세계 시간 표준과 올바르게 동기화되지 않아 타임스탬프 불일치가 발생할 수 있습니다.
이를 해결하려면 시스템 클럭이 밀리초 단위로 정확한지 확인하세요. 이는 일회성 조정이 아니라 정확도를 유지하기 위해 운영 체제가 주기적으로(예: 매시간) 시간을 동기화하도록 구성해야 합니다.

#### 2. 네트워크 지연 또는 요청 지연
기기의 클럭이 올바르게 동기화되어 있지만 네트워크 지연으로 인해 요청이 거래소의 허용 창(일반적으로 약 `5`초이지만 거래소마다 다름)보다 오래 걸리면 요청이 거부될 수 있습니다.


문제가 지속되면 로컬 타임스탬프와 거래소 서버 시간을 비교하여 불일치를 진단할 수 있습니다:

```
for i in range(0, 20):
    local_time = exchange.milliseconds()
    exchange_time = await exchange.fetch_time()
    print(exchange_time - local_time)
```

####  거래소 옵션 조정

동기화를 확인한 후에도 타임스탬프 오류가 계속 발생하면, 문제 완화에 도움이 되는 특정 거래소 옵션을 수정할 수 있습니다.

A) `exchange.options['adjustForTimeDifference'] = True`
또는 창을 10초로 늘림(거래소가 지원하는 경우에만, 대상 [거래소 파일](https://github.com/ccxt/ccxt/tree/master/ts/src)에서 이 키워드를 검색하세요):
B) `exchange.options['recvWindow'] = 10000`


추가 문제 해결 단계, 커뮤니티 토론 및 관련 타임스탬프/`recvWindow` 문제에 대해서는 다음 GitHub 스레드를 참조하세요:

- [CCXT Issue #773](https://github.com/ccxt/ccxt/issues/773)
- [CCXT Issue #850](https://github.com/ccxt/ccxt/issues/850)
- [CCXT Issue #936](https://github.com/ccxt/ccxt/issues/936)

# 문제 해결

특정 거래소 연결에 어려움이 있는 경우, 다음 순서에 따라 진행하세요:

- ccxt의 최신 버전을 보유하고 있는지 확인하세요.
  패키지 설치 관리자(`npm`, `pip`, `composer` 등)를 신뢰하지 말고, 항상 환경에서 다음 코드를 실행하여 **실제(진짜) 런타임 버전 번호**를 확인하세요:
  ```javascript
  console.log (ccxt.version) // JavaScript
  ```
  ```python
  print('CCXT version:', ccxt.__version__)  # Python
  ```
  ```php
  echo "CCXT v." . \ccxt\Exchange::VERSION . "\n"; // PHP
  ```
- 최근 업데이트에 대해 [Issues](https://github.com/ccxt/ccxt/issues) 또는 [공지사항](#announcements)을 확인하세요.
- [`enableRateLimit: false`로 속도 제한기를 비활성화](#rate-limit)하지 않았는지 확인하세요(사용자 정의 속도 제한 솔루션이 구축된 경우, 오작동하지 않는지 확인하세요).
- ccxt의 프록시 기능을 사용하는 경우 오작동하지 않는지 확인하세요.
- `verbose = true`로 설정하여 더 자세한 정보를 확인하세요!
  ```
  exchange = ccxt.binance()
  exchange.load_markets()
  exchange.verbose = True  # for less noise, you can set that after `load_markets`, but if the error happens during `load_markets` then place this line before it
  # ... your codes here ...
  ```
  도움을 받으려면 [재현 코드 + 상세 출력이 필요합니다](/docs/faq#what-is-required-to-get-help).
- Python 사용자는 코드 시작 부분에 다음 두 줄을 추가하여 표준 Python 로거로 DEBUG 로깅 레벨을 활성화할 수 있습니다:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- 상세 모드를 사용하여 사용된 API 자격 증명이 사용하려는 키에 해당하는지 확인하세요. 키쌍 혼동이 없는지 확인하세요.
- **가능하면 새 키쌍을 사용해 보세요.**
- 자주 묻는 질문에 대한 답변을 읽어보세요: /docs/faq
- 거래소 웹사이트에서 키쌍의 권한을 확인하세요!
- nonce를 확인하세요. 다른 소프트웨어에서 API 키를 사용했다면, 이전 nonce 값에 맞게 [nonce 함수를 재정의](#overriding-the-nonce)해야 할 가능성이 높습니다. nonce는 보통 사용하지 않은 새 키쌍을 생성하여 쉽게 초기화할 수 있습니다. 기존 키로 nonce 오류가 발생하는 경우, 아직 사용하지 않은 새 API 키로 시도해 보세요.
- nonce 오류가 발생하는 경우 요청 속도를 확인하세요. 비공개 요청은 빠르게 연속으로 이루어지지 않아야 합니다. 짧은 시간 내에 또는 순식간에 연속으로 보내지 않아야 합니다. 각 새 요청을 보내기 전에 지연을 두지 않으면 거래소가 차단할 가능성이 높습니다. 다시 말해, 너무 자주 무제한 비공개 요청을 보내어 속도 제한에 걸리지 않아야 합니다. 후속 요청에 지연을 추가하거나, 장기 폴러 [예시](https://github.com/ccxt/ccxt/tree/master/examples)에 표시된 것처럼 내장 속도 제한기를 활성화하세요. 또한 [여기](#order-book--market-depth)를 참조하세요.
- [거래소 문서](/docs/exchange-markets)를 읽고 상세 출력을 문서와 비교해 보세요.
- 브라우저로 접속하여 거래소와의 연결을 확인하세요.
- [프록시](#proxy)를 통해 거래소와의 연결을 확인하세요.
- 다른 컴퓨터나 원격 서버에서 거래소에 접속해 보고, 거래소의 로컬 또는 전체 문제인지 확인하세요.
- 최근 유지 보수로 인한 다운타임에 관한 거래소 뉴스가 있었는지 확인하세요. 일부 거래소는 정기적으로(예: 매주 한 번) 업데이트를 위해 오프라인 상태가 됩니다.
- 시스템 시간이 전 세계 클럭과 동기화되어 있는지 확인하세요. 그렇지 않으면 유효하지 않은 nonce 오류가 발생할 수 있습니다.

**추가 참고 사항:**

- `verbose = true` 옵션을 사용하거나 문제가 있는 거래소를 `new ccxt.exchange ({ 'verbose': true })`로 인스턴스화하면 HTTP 요청과 응답의 세부 정보를 볼 수 있습니다. GitHub에 이슈를 제출할 때 상세 출력은 디버깅에도 도움이 됩니다.
- Python에서 DEBUG 로깅을 사용하세요!
- 일부 거래소는 특정 국가에서 이용할 수 없으며, 그런 경우 [프록시](#proxy)가 해결책이 될 수 있습니다.
- 인증 오류 또는 *'invalid keys'* 오류가 발생하는 경우, 대부분 nonce 문제로 인한 것입니다.
- 일부 거래소는 요청 인증에 실패하더라도 명확히 알려주지 않습니다. 그런 경우 HTTP 502 Bad Gateway 오류처럼 실제 원인과 관련이 없는 이상한 오류 코드로 응답할 수 있습니다.
